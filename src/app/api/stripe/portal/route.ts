import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import { config } from '@/config/env'

const PortalSchema = z.object({
  locale: z.string().default('de'),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 })
  }

  const userId = session.user.id
  const body = await req.json()
  const { locale } = PortalSchema.parse(body)

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    })

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Kein Stripe-Konto gefunden. Bitte erst einen Plan erwerben.' },
        { status: 404 }
      )
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer:   user.stripeCustomerId,
      return_url: `${config.appUrl}/${locale}/billing`,
    })

    logger.info('Stripe portal session created', { userId })
    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    logger.error('Stripe portal failed', { userId, error })
    return NextResponse.json(
      { error: 'Abo-Verwaltung konnte nicht geöffnet werden.' },
      { status: 500 }
    )
  }
}
