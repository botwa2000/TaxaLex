import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { logger } from '@/lib/logger'
import { ADDON } from '@/config/constants'

const Schema = z.object({
  mode: z.enum(['immediate', 'period_end']),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 })
  }

  const userId = session.user.id

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Ungültige Anfrage.', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { mode } = parsed.data

  const sub = await db.subscription.findUnique({
    where: { userId },
  })

  if (!sub) {
    return NextResponse.json({ error: 'Kein aktives Abonnement gefunden.' }, { status: 404 })
  }

  const isActiveOrTrialing = sub.status === 'ACTIVE' || sub.status === 'TRIALING'
  if (!isActiveOrTrialing) {
    return NextResponse.json(
      { error: 'Abonnement ist nicht aktiv.' },
      { status: 409 }
    )
  }

  if (mode === 'immediate') {
    const daysSinceCreated = (Date.now() - sub.createdAt.getTime()) / 86_400_000
    if (daysSinceCreated > ADDON.cancellationWindowDays) {
      return NextResponse.json(
        { error: 'Stornierungsfrist von 14 Tagen überschritten.' },
        { status: 403 }
      )
    }

    const caseCount = await db.case.count({ where: { userId } })
    if (caseCount > 0) {
      return NextResponse.json(
        { error: 'Sofortige Kündigung nicht möglich, da bereits Fälle erstellt wurden.' },
        { status: 403 }
      )
    }

    try {
      await stripe.subscriptions.cancel(sub.stripeSubscriptionId)
    } catch (stripeError) {
      logger.error('Stripe subscription immediate cancel failed', {
        userId,
        stripeSubscriptionId: sub.stripeSubscriptionId,
        error: stripeError,
      })
      return NextResponse.json(
        { error: 'Kündigung konnte nicht durchgeführt werden.' },
        { status: 500 }
      )
    }

    // Attempt to refund the latest paid invoice; log failures without surfacing them
    try {
      const invoices = await stripe.invoices.list({
        subscription: sub.stripeSubscriptionId,
        status: 'paid',
        limit: 1,
      })
      const latestInvoice = invoices.data[0]
      if (latestInvoice?.charge) {
        await stripe.refunds.create({ charge: latestInvoice.charge as string })
        logger.info('Subscription invoice refunded', {
          userId,
          stripeSubscriptionId: sub.stripeSubscriptionId,
          charge: latestInvoice.charge,
        })
      }
    } catch (refundError) {
      logger.error('Stripe invoice refund failed after subscription cancel', {
        userId,
        stripeSubscriptionId: sub.stripeSubscriptionId,
        error: refundError,
      })
    }

    await db.subscription.update({
      where: { userId },
      data: { status: 'CANCELED', canceledAt: new Date() },
    })

    logger.info('Subscription cancelled immediately', { userId, stripeSubscriptionId: sub.stripeSubscriptionId })

    return NextResponse.json({ cancelled: true })
  }

  // mode === 'period_end'
  try {
    await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: true,
    })
  } catch (stripeError) {
    logger.error('Stripe subscription period-end cancel failed', {
      userId,
      stripeSubscriptionId: sub.stripeSubscriptionId,
      error: stripeError,
    })
    return NextResponse.json(
      { error: 'Kündigung konnte nicht durchgeführt werden.' },
      { status: 500 }
    )
  }

  await db.subscription.update({
    where: { userId },
    data: { cancelAtPeriodEnd: true },
  })

  logger.info('Subscription set to cancel at period end', {
    userId,
    stripeSubscriptionId: sub.stripeSubscriptionId,
    cancelAt: sub.currentPeriodEnd,
  })

  return NextResponse.json({ cancelAt: sub.currentPeriodEnd })
}
