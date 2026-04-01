import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

const GrantSchema = z.object({ amount: z.number().int().min(1).max(1000) })

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = GrantSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  const { id: userId } = await context.params
  const { amount } = parsed.data

  try {
    const user = await db.user.update({
      where: { id: userId },
      data: { creditBalance: { increment: amount } },
      select: { creditBalance: true },
    })
    await db.creditLedger.create({
      data: { userId, delta: amount, reason: 'ADMIN_GRANT' },
    })
    return NextResponse.json({ ok: true, creditBalance: user.creditBalance })
  } catch (error) {
    logger.error('Admin grant credits failed', { userId, error })
    return NextResponse.json({ error: 'Fehlgeschlagen' }, { status: 500 })
  }
}
