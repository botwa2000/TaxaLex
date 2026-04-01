import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await context.params

  try {
    const [cases, ledger, user] = await Promise.all([
      db.case.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        select: {
          id:        true,
          useCase:   true,
          status:    true,
          createdAt: true,
          deadline:  true,
          _count:    { select: { outputs: true } },
        },
      }),
      db.creditLedger.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id:          true,
          delta:       true,
          reason:      true,
          referenceId: true,
          createdAt:   true,
        },
      }),
      db.user.findUnique({
        where: { id },
        select: {
          creditBalance: true,
          subscription: {
            select: {
              status:             true,
              planSlug:           true,
              currentPeriodStart: true,
              currentPeriodEnd:   true,
              cancelAtPeriodEnd:  true,
              createdAt:          true,
            },
          },
        },
      }),
    ])

    return NextResponse.json({ cases, ledger, subscription: user?.subscription ?? null, creditBalance: user?.creditBalance ?? 0 })
  } catch (error) {
    logger.error('Admin user detail fetch failed', { userId: id, error })
    return NextResponse.json({ error: 'Fehlgeschlagen' }, { status: 500 })
  }
}
