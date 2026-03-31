import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createElement } from 'react'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { PasswordReset } from '@/lib/emailTemplates/PasswordReset'
import { logger } from '@/lib/logger'
import { config } from '@/config/env'

const Schema = z.object({
  email: z.string().email(),
  locale: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const parsed = Schema.safeParse(body)

  // Always return 200 — never reveal whether email exists
  if (!parsed.success) {
    return NextResponse.json({ success: true })
  }

  const { email, locale = 'de' } = parsed.data

  try {
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, name: true, email: true, locale: true },
    })

    if (user) {
      // Delete any existing unused tokens for this user first
      await db.passwordResetToken.deleteMany({
        where: { userId: user.id, usedAt: null },
      })

      const tokenRecord = await db.passwordResetToken.create({
        data: {
          userId: user.id,
          token: crypto.randomUUID(),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      })

      const userLocale = user.locale ?? locale
      const resetUrl = `${config.appUrl}/${userLocale}/reset-password?token=${tokenRecord.token}`

      await sendEmail({
        to: user.email,
        subject: userLocale === 'en' ? 'Reset your TaxaLex password' : 'Passwort zurücksetzen — TaxaLex',
        react: createElement(PasswordReset, { name: user.name, resetUrl, locale: userLocale }),
      })

      logger.info('Password reset email sent', { userId: user.id })
    }
  } catch (error) {
    // Log but do not surface — always return 200
    logger.error('Forgot password error', { error })
  }

  return NextResponse.json({ success: true })
}
