import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createElement } from 'react'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { Welcome } from '@/lib/emailTemplates/Welcome'
import { logger } from '@/lib/logger'
import { config } from '@/config/env'

const VerifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6).regex(/^\d{6}$/),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = VerifySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Ungültige Eingabe.' }, { status: 400 })
    }

    const { email, code } = parsed.data

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, name: true, locale: true, emailVerified: true },
    })

    // Generic error — don't reveal whether email exists
    if (!user) {
      return NextResponse.json({ error: 'Ungültiger Code.' }, { status: 400 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ success: true, alreadyVerified: true })
    }

    const record = await db.emailVerificationToken.findFirst({
      where: { userId: user.id, token: code },
    })

    if (!record) {
      return NextResponse.json({ error: 'Ungültiger Code.' }, { status: 400 })
    }

    if (record.expiresAt < new Date()) {
      await db.emailVerificationToken.delete({ where: { id: record.id } })
      return NextResponse.json({ error: 'Code abgelaufen. Bitte neuen Code anfordern.' }, { status: 400 })
    }

    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      }),
      db.emailVerificationToken.delete({ where: { id: record.id } }),
    ])

    logger.info('Email verified', { userId: user.id })

    // Send welcome email now that the address is confirmed — non-blocking
    const locale = user.locale ?? 'de'
    const dashboardUrl = `${config.appUrl}/${locale}/dashboard`
    void sendEmail({
      to: email.toLowerCase(),
      subject: locale === 'en' ? 'Welcome to TaxaLex' : 'Willkommen bei TaxaLex',
      react: createElement(Welcome, { name: user.name, dashboardUrl, locale }),
    }).catch((err) => logger.warn('Welcome email failed', { userId: user.id, err }))

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Email verification error', { error })
    return NextResponse.json({ error: 'Fehler bei der Verifizierung.' }, { status: 500 })
  }
}
