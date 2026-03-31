import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

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
      select: { id: true, emailVerified: true },
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
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Email verification error', { error })
    return NextResponse.json({ error: 'Fehler bei der Verifizierung.' }, { status: 500 })
  }
}
