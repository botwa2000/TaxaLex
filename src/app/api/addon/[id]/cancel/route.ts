import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { logger } from '@/lib/logger'
import { ADDON } from '@/config/constants'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 })
  }

  const userId = session.user.id
  const { id: addonId } = await params

  const purchase = await db.addonPurchase.findUnique({
    where: { id: addonId },
  })

  if (!purchase || purchase.userId !== userId) {
    return NextResponse.json({ error: 'Add-on nicht gefunden.' }, { status: 404 })
  }

  if (purchase.status !== 'ACTIVE') {
    return NextResponse.json(
      { error: 'Add-on ist nicht aktiv und kann nicht storniert werden.' },
      { status: 409 }
    )
  }

  if (purchase.usedAt !== null) {
    return NextResponse.json(
      { error: 'Add-on wurde bereits genutzt und kann nicht storniert werden.' },
      { status: 409 }
    )
  }

  const daysSincePurchase = (Date.now() - purchase.purchasedAt.getTime()) / 86_400_000
  if (daysSincePurchase > ADDON.cancellationWindowDays) {
    return NextResponse.json(
      { error: 'Stornierungsfrist von 14 Tagen überschritten.' },
      { status: 403 }
    )
  }

  let refunded = false

  if (purchase.stripePaymentIntentId) {
    try {
      await stripe.refunds.create({ payment_intent: purchase.stripePaymentIntentId })
      refunded = true
    } catch (stripeError) {
      // Log the failure but continue — DB is marked CANCELLED so ops can process manually
      logger.error('Stripe refund failed for addon cancellation', {
        addonId,
        userId,
        stripePaymentIntentId: purchase.stripePaymentIntentId,
        error: stripeError,
      })
    }
  }

  await db.addonPurchase.update({
    where: { id: addonId },
    data: { status: 'CANCELLED', cancelledAt: new Date() },
  })

  logger.info('Addon cancelled', { addonId, userId, refunded })

  return NextResponse.json({ refunded })
}
