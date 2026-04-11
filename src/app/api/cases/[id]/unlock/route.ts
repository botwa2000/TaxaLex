import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { logger } from '@/lib/logger'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
  }

  const userId = session.user.id as string
  if (userId.startsWith('demo_')) {
    return NextResponse.json({ error: 'Demo-Konto' }, { status: 403 })
  }

  const { id } = await params

  const { db } = await import('@/lib/db')

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { creditBalance: true, subscription: { select: { status: true } } },
  })

  const hasSub = ['ACTIVE', 'TRIALING'].includes(user?.subscription?.status ?? '')
  const credits = user?.creditBalance ?? 0

  if (!hasSub && credits <= 0) {
    return NextResponse.json({ error: 'Kein Guthaben verfügbar', code: 'NO_CREDITS' }, { status: 402 })
  }

  // Idempotent: if already unlocked or not found, return success without charging
  const locked = await db.case.findFirst({
    where: { id, userId, status: 'DRAFT_READY', draftLocked: true },
    select: { id: true },
  })
  if (!locked) {
    return NextResponse.json({ ok: true })
  }

  await db.$transaction(async (tx) => {
    const updated = await tx.case.updateMany({
      where: { id, userId, draftLocked: true },
      data: { draftLocked: false },
    })
    if (updated.count > 0 && !hasSub) {
      await tx.creditLedger.create({
        data: { userId, delta: -1, reason: 'CASE_CREATED', referenceId: id },
      })
      await tx.user.update({
        where: { id: userId },
        data: { creditBalance: { decrement: 1 } },
      })
    }
  })

  logger.info('Draft unlocked via credit', { userId, caseId: id, usedCredit: !hasSub })
  return NextResponse.json({ ok: true })
}
