import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import { AUTH } from '@/config/constants'

const RegisterSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z
    .string()
    .min(AUTH.minPasswordLength, `Mindestens ${AUTH.minPasswordLength} Zeichen`),
  name: z.string().min(2).max(100).optional(),
})

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

    const { email, password, name } = parsed.data
    const normalizedEmail = email.toLowerCase()

    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    })

    if (existing) {
      // Return same message to prevent email enumeration
      return NextResponse.json(
        { error: 'Registrierung fehlgeschlagen' },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, AUTH.bcryptRounds)

    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: name ?? null,
      },
      select: { id: true, email: true, name: true },
    })

    logger.info('User registered', { userId: user.id })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    logger.error('Registration error', { error })
    return NextResponse.json(
      { error: 'Registrierung fehlgeschlagen' },
      { status: 500 }
    )
  }
}
