import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createElement } from 'react'
import { z } from 'zod'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { VerifyEmail } from '@/lib/emailTemplates/VerifyEmail'
import { logger } from '@/lib/logger'

// Rate limit: 1 resend per 2 minutes per user (shorter than before since codes expire in 15m)
const RESEND_COOLDOWN_MS = 2 * 60 * 1000

const ResendSchema = z.object({
  email: z.string().email().optional(),
})

function generate6DigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const parsed = ResendSchema.safeParse(body)
    const emailParam = parsed.success ? parsed.data.email : undefined

    // Resolve user: either from session (post-login) or from email param (pre-login)
    let userId: string
    let userEmail: string
    let userName: string | null
    let userLocale: string

    if (emailParam) {
      // Pre-login flow: email provided in body
      const user = await db.user.findUnique({
        where: { email: emailParam.toLowerCase() },
        select: { id: true, email: true, name: true, emailVerified: true, locale: true },
      })
      // Always return 200 to prevent enumeration
      if (!user || user.emailVerified) {
        return NextResponse.json({ success: true })
      }
      userId = user.id
      userEmail = user.email
      userName = user.name
      userLocale = user.locale ?? 'de'
    } else {
      // Post-login flow: must be authenticated
      const session = await auth()
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 })
      }
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, email: true, name: true, emailVerified: true, locale: true },
      })
      if (!user) return NextResponse.json({ error: 'Nutzer nicht gefunden.' }, { status: 404 })
      if (user.emailVerified) return NextResponse.json({ error: 'E-Mail bereits bestätigt.' }, { status: 400 })
      userId = user.id
      userEmail = user.email
      userName = user.name
      userLocale = user.locale ?? 'de'
    }

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

    // Delete old tokens, create fresh 6-digit code with 15-minute TTL
    await db.emailVerificationToken.deleteMany({ where: { userId } })
    const code = generate6DigitCode()
    await db.emailVerificationToken.create({
      data: {
        userId,
        token: code,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    })

    await sendEmail({
      to: userEmail,
      subject: userLocale === 'en' ? 'Your new verification code — TaxaLex' : 'Neuer Bestätigungscode — TaxaLex',
      react: createElement(VerifyEmail, { name: userName, code, locale: userLocale }),
    })

    logger.info('Verification code resent', { userId })
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Resend verification error', { error })
    return NextResponse.json({ error: 'Fehler beim Senden.' }, { status: 500 })
  }
}
