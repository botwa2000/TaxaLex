import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { createElement } from 'react'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { VerifyEmail } from '@/lib/emailTemplates/VerifyEmail'
import { logger } from '@/lib/logger'
import { AUTH } from '@/config/constants'

const RegisterSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(AUTH.minPasswordLength, `Mindestens ${AUTH.minPasswordLength} Zeichen`),
  name: z.string().min(2).max(100).optional(),
  locale: z.string().optional(),
})

function generate6DigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = RegisterSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Ungültige Eingabe', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { email, password, name, locale = 'de' } = parsed.data
    const normalizedEmail = email.toLowerCase()

    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    })

    if (existing) {
      // Same response as success to prevent email enumeration
      return NextResponse.json({ success: true }, { status: 201 })
    }

    const passwordHash = await bcrypt.hash(password, AUTH.bcryptRounds)

    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: name ?? null,
        locale,
      },
      select: { id: true, email: true, name: true, locale: true },
    })

    // Create 6-digit code with 15-minute TTL
    const code = generate6DigitCode()
    await db.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: code,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    })

    // Send verification email only — welcome email is sent after the user verifies
    await Promise.allSettled([
      sendEmail({
        to: user.email,
        subject: user.locale === 'en' ? 'Your verification code — TaxaLex' : 'Dein Bestätigungscode — TaxaLex',
        react: createElement(VerifyEmail, { name: user.name, code, locale: user.locale }),
      }),
    ])

    logger.info('User registered', { userId: user.id, locale: user.locale })
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    logger.error('Registration error', { error })
    return NextResponse.json({ error: 'Registrierung fehlgeschlagen' }, { status: 500 })
  }
}
