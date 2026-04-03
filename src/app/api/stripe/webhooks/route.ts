import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe, PLAN_CREDITS, isAddonPlan } from '@/lib/stripe'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import { config } from '@/config/env'

// Must run in Node.js runtime — not Edge — so req.text() gives raw body
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''

  if (!config.stripeWebhookSecret) {
    logger.warn('STRIPE_WEBHOOK_SECRET not set — skipping signature verification (dev only)')
  }

  let event: Stripe.Event
  try {
    event = config.stripeWebhookSecret
      ? stripe.webhooks.constructEvent(body, signature, config.stripeWebhookSecret)
      : (JSON.parse(body) as Stripe.Event)
  } catch (err) {
    logger.warn('Stripe webhook signature invalid', { err })
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // ── Idempotency guard ──────────────────────────────────────────────────────
  try {
    await db.stripeEvent.create({ data: { stripeId: event.id, type: event.type } })
  } catch {
    // Unique constraint violation = already processed
    logger.info('Stripe event already processed, skipping', { eventId: event.id, type: event.type })
    return NextResponse.json({ received: true })
  }

  try {
    await handleEvent(event)
    await db.stripeEvent.update({
      where: { stripeId: event.id },
      data:  { processed: true, processedAt: new Date() },
    })
  } catch (error) {
    logger.error('Stripe webhook handler failed', { eventId: event.id, type: event.type, error })
    // Return 200 anyway — Stripe will retry on 5xx, but our idempotency guard
    // already recorded the event so we won't double-process on retry
  }

  return NextResponse.json({ received: true })
}

async function handleEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {

    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const { userId, planSlug, credits } = session.metadata ?? {}
      if (!userId || !planSlug) {
        logger.warn('checkout.session.completed missing metadata', { sessionId: session.id })
        return
      }

      if (session.mode === 'payment') {
        const stripePaymentIntentId = session.payment_intent as string | undefined ?? undefined

        if (isAddonPlan(planSlug)) {
          // Add-on purchase — create AddonPurchase record
          const { caseId } = session.metadata ?? {}
          await db.addonPurchase.create({
            data: {
              userId,
              caseId:               caseId ?? null,
              addonType:            'EXPERT_REVIEW',
              status:               'ACTIVE',
              amountCents:          session.amount_total ?? 0,
              planSlug,
              stripePaymentIntentId: stripePaymentIntentId ?? null,
            },
          })
          logger.info('Addon purchase created', { userId, planSlug, caseId })
        } else {
        // One-time purchase — add credits immediately
        const creditCount = parseInt(credits ?? '0', 10)
        if (creditCount > 0) {
          const reason = creditCount === 1 ? 'PURCHASE_SINGLE' : 'PURCHASE_PACK'
          await db.$transaction([
            db.creditLedger.create({
              data: {
                userId,
                delta:       creditCount,
                reason,
                referenceId: stripePaymentIntentId,
              },
            }),
            db.user.update({
              where: { id: userId },
              data:  { creditBalance: { increment: creditCount } },
            }),
          ])
          logger.info('Credits granted', { userId, planSlug, creditCount, reason })
        }
        }

      } else if (session.mode === 'subscription' && session.subscription) {
        // Subscription — provision immediately from the completed session
        const sub = await stripe.subscriptions.retrieve(session.subscription as string)
        await upsertSubscription(userId, planSlug, sub)
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const { userId, planSlug } = sub.metadata ?? {}
      if (userId && planSlug) {
        await upsertSubscription(userId, planSlug, sub)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await db.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data:  { status: 'CANCELED', canceledAt: new Date() },
      })
      logger.info('Subscription canceled', { stripeSubscriptionId: sub.id })
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      if (invoice.subscription) {
        await db.subscription.updateMany({
          where: { stripeSubscriptionId: invoice.subscription as string },
          data:  { status: 'PAST_DUE' },
        })
        logger.warn('Subscription payment failed', {
          stripeSubscriptionId: invoice.subscription,
          customerId: invoice.customer,
        })
      }
      break
    }

    case 'invoice.payment_succeeded': {
      // Subscription renewed — ensure status is ACTIVE (covers recovery from past_due)
      const invoice = event.data.object as Stripe.Invoice
      if (invoice.subscription && invoice.billing_reason === 'subscription_cycle') {
        await db.subscription.updateMany({
          where: { stripeSubscriptionId: invoice.subscription as string },
          data:  { status: 'ACTIVE' },
        })
      }
      break
    }

    default:
      logger.debug('Stripe webhook: unhandled event type', { type: event.type })
  }
}

async function upsertSubscription(
  userId:   string,
  planSlug: string,
  sub:      Stripe.Subscription
): Promise<void> {
  const status            = mapStatus(sub.status)
  const currentPeriodStart = new Date(sub.current_period_start * 1000)
  const currentPeriodEnd   = new Date(sub.current_period_end   * 1000)
  const stripePriceId     = sub.items.data[0]?.price.id ?? ''

  await db.subscription.upsert({
    where:  { userId },
    create: {
      userId,
      stripeSubscriptionId: sub.id,
      stripePriceId,
      planSlug,
      status,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
    update: {
      stripeSubscriptionId: sub.id,
      stripePriceId,
      planSlug,
      status,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
    },
  })

  logger.info('Subscription upserted', { userId, planSlug, status, subId: sub.id })
}

function mapStatus(stripeStatus: Stripe.Subscription.Status) {
  const map: Record<string, 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID' | 'TRIALING'> = {
    active:             'ACTIVE',
    trialing:           'TRIALING',
    past_due:           'PAST_DUE',
    canceled:           'CANCELED',
    unpaid:             'UNPAID',
    incomplete:         'PAST_DUE',
    incomplete_expired: 'CANCELED',
    paused:             'PAST_DUE',
  }
  return map[stripeStatus] ?? 'PAST_DUE'
}
