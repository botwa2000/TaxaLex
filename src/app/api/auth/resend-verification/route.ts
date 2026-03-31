import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createElement } from 'react'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { VerifyEmail } from '@/lib/emailTemplates/VerifyEmail'
import { logger } from '@/lib/logger'
import { config } from '@/config/env'

// Rate limit: 1 resend per 5 minutes per user (checked via DB token age)
const RESEND_COOLDOWN_MS = 5 * 60 * 1000

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 })
  }

  const userId = session.user.id

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, emailVerified: true, locale: true },
    })

    if (!user) return NextResponse.json({ error: 'Nutzer nicht gefunden.' }, { status: 404 })
    if (user.emailVerified) return NextResponse.json({ error: 'E-Mail bereits bestätigt.' }, { status: 400 })

    // Check for recent token — enforce cooldown
    const recent = await db.emailVerificationToken.findFirst({
      where: {
        userId,
        createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_MS) },
      },
    })

    if (recent) {
      const waitSecs = Math.ceil((RESEND_COOLDOWN_MS - (Date.now() - recent.createdAt.getTime())) / 1000)
      return NextResponse.json(
        { error: `Bitte warte noch ${waitSecs} Sekunden vor der nächsten Anfrage.` },
        { status: 429 }
      )
    }

    // Delete old tokens, create fresh one
    await db.emailVerificationToken.deleteMany({ where: { userId } })
    const tokenRecord = await db.emailVerificationToken.create({
      data: {
        userId,
        token: crypto.randomUUID(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })

    const locale = user.locale ?? 'de'
    const verifyUrl = `${config.appUrl}/${locale}/api/auth/verify-email?token=${tokenRecord.token}`

    await sendEmail({
      to: user.email,
      subject: locale === 'en' ? 'Confirm your email — TaxaLex' : 'E-Mail bestätigen — TaxaLex',
      react: createElement(VerifyEmail, { name: user.name, verifyUrl, locale }),
    })

    logger.info('Verification email resent', { userId })
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Resend verification error', { error })
    return NextResponse.json({ error: 'Fehler beim Senden.' }, { status: 500 })
  }
}
