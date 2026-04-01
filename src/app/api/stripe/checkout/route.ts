import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { stripe, PLAN_CREDITS, isSubscriptionPlan } from '@/lib/stripe'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import { config } from '@/config/env'
import { PRICING_PLANS } from '@/lib/contentFallbacks'

const CheckoutSchema = z.object({
  planSlug: z.string().min(1),
  locale: z.string().default('de'),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 })
  }

  const userId = session.user.id
  if (userId.startsWith('demo_')) {
    return NextResponse.json({ error: 'Demo-Konten können nicht bezahlen.' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = CheckoutSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 })
  }

  const { planSlug, locale } = parsed.data

  try {
    // ── Resolve plan from DB, fall back to static content ─────────────────
    const dbPlan = await db.pricingPlan.findUnique({
      where: { slug: planSlug },
      include: { translations: true },
    }).catch(() => null)

    const fallback = PRICING_PLANS.find((p) => p.slug === planSlug)
    if (!dbPlan && !fallback) {
      return NextResponse.json({ error: 'Plan nicht gefunden.' }, { status: 404 })
    }

    const planName =
      dbPlan?.translations.find((t) => t.locale === locale)?.name ??
      dbPlan?.translations.find((t) => t.locale === 'de')?.name ??
      (fallback?.translations as Record<string, { name: string }>)[locale]?.name ??
      (fallback?.translations as Record<string, { name: string }>)['de']?.name ??
      planSlug

    const priceOnce    = dbPlan?.priceOnce    != null ? Number(dbPlan.priceOnce)    : (fallback?.priceOnce    ?? null)
    const priceMonthly = dbPlan?.priceMonthly != null ? Number(dbPlan.priceMonthly) : (fallback?.priceMonthly ?? null)
    const isSub        = isSubscriptionPlan(planSlug)
    const unitPrice    = isSub ? priceMonthly : priceOnce

    if (!unitPrice) {
      return NextResponse.json({ error: 'Kein Preis konfiguriert.' }, { status: 400 })
    }

    // ── Ensure Stripe product exists for this plan (cached in DB) ──────────
    let stripeProductId = dbPlan?.stripeProductId ?? null
    if (!stripeProductId) {
      // Search first to avoid duplicates if DB write failed on a previous attempt
      const existing = await stripe.products.search({
        query: `metadata['slug']:'${planSlug}'`,
        limit: 1,
      })
      if (existing.data.length > 0) {
        stripeProductId = existing.data[0].id
      } else {
        const product = await stripe.products.create({
          name: `TaxaLex — ${planName}`,
          metadata: { slug: planSlug },
        })
        stripeProductId = product.id
      }
      // Cache in DB — non-blocking, failure is safe (we re-create next time)
      if (dbPlan) {
        db.pricingPlan.update({
          where: { id: dbPlan.id },
          data: { stripeProductId },
        }).catch(() => null)
      }
    }

    // ── Get or create Stripe customer ──────────────────────────────────────
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true, email: true, name: true },
    })

    let stripeCustomerId = user?.stripeCustomerId ?? null
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user?.email ?? undefined,
        name:  user?.name  ?? undefined,
        preferred_locales: [locale],
        metadata: { userId },
      })
      stripeCustomerId = customer.id
      await db.user.update({ where: { id: userId }, data: { stripeCustomerId } })
    }

    // ── Build Checkout Session ─────────────────────────────────────────────
    const baseUrl    = config.appUrl
    const successUrl = `${baseUrl}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl  = `${baseUrl}/${locale}/billing`
    const credits    = PLAN_CREDITS[planSlug] ?? 0

    const withdrawalNotice = locale === 'en'
      ? 'By completing this purchase you confirm our Terms of Service and waive your right of withdrawal for immediately provided digital content (§356(5) BGB).'
      : 'Mit dem Abschluss der Zahlung bestätigen Sie unsere Nutzungsbedingungen und verzichten gemäß §356 Abs. 5 BGB auf das Widerrufsrecht für sofort bereitgestellte digitale Inhalte.'

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode:     isSub ? 'subscription' : 'payment',
      locale:   locale === 'en' ? 'en' : 'de',

      line_items: [{
        price_data: {
          currency: 'eur',
          product:  stripeProductId,
          unit_amount: Math.round(unitPrice * 100),
          ...(isSub ? { recurring: { interval: 'month' } } : {}),
        },
        quantity: 1,
      }],

      // Payment methods: SEPA + card for subs (mandate required); add Klarna for one-time
      payment_method_types: isSub
        ? ['card', 'sepa_debit']
        : ['card', 'sepa_debit', 'klarna'],

      success_url: successUrl,
      cancel_url:  cancelUrl,

      // Metadata travels with the event to the webhook
      metadata: {
        userId,
        planSlug,
        locale,
        credits: credits.toString(),
      },

      ...(isSub ? {
        subscription_data: {
          metadata: { userId, planSlug },
        },
      } : {
        // One-time: create an invoice (required for §14 UStG compliance)
        invoice_creation: {
          enabled: true,
          invoice_data: {
            description: `TaxaLex — ${planName}`,
            footer: 'Gemäß §19 UStG wird keine Umsatzsteuer berechnet. · taxalex.de',
          },
        },
        // Right-of-withdrawal notice below the Pay button
        custom_text: {
          submit: { message: withdrawalNotice },
        },
      }),
    })

    logger.info('Stripe checkout session created', {
      userId,
      planSlug,
      sessionId: checkoutSession.id,
      mode: checkoutSession.mode,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    logger.error('Stripe checkout failed', { userId, planSlug, error })
    return NextResponse.json(
      { error: 'Checkout konnte nicht gestartet werden. Bitte versuchen Sie es erneut.' },
      { status: 500 }
    )
  }
}
