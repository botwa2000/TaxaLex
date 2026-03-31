import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import { AUTH } from '@/config/constants'

const Schema = z.object({
  token: z.string().min(1),
  password: z.string().min(AUTH.minPasswordLength),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = Schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Ungültige Eingabe' }, { status: 400 })
    }

    const { token, password } = parsed.data

    const record = await db.passwordResetToken.findUnique({ where: { token } })

    if (!record) {
      return NextResponse.json({ error: 'Ungültiger oder abgelaufener Link.' }, { status: 400 })
    }
    if (record.usedAt) {
      return NextResponse.json({ error: 'Dieser Link wurde bereits verwendet.' }, { status: 400 })
    }
    if (record.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Dieser Link ist abgelaufen. Bitte fordere einen neuen an.' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, AUTH.bcryptRounds)

    await db.$transaction([
      db.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      db.passwordResetToken.update({
        where: { token },
        data: { usedAt: new Date() },
      }),
    ])

    logger.info('Password reset completed', { userId: record.userId })
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Password reset error', { error })
    return NextResponse.json({ error: 'Fehler beim Zurücksetzen des Passworts.' }, { status: 500 })
  }
}
