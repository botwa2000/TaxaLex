import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { logger } from '@/lib/logger'

/**
 * Returns cases that need user action:
 * - QUESTIONS or GENERATING (wizard interrupted mid-flow)
 * - DRAFT_READY with draftLocked=true (generated but payment pending)
 */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ cases: [] })
  }

  const userId = session.user.id as string
  if (userId.startsWith('demo_')) {
    return NextResponse.json({ cases: [] })
  }

  try {
    const { db } = await import('@/lib/db')
    const cases = await db.case.findMany({
      where: {
        userId,
        OR: [
          { status: { in: ['QUESTIONS', 'GENERATING'] } },
          { status: 'DRAFT_READY', draftLocked: true },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: { id: true, useCase: true, status: true, draftLocked: true, updatedAt: true },
    })
    return NextResponse.json({ cases })
  } catch (error) {
    logger.error('Incomplete cases fetch failed', { error })
    return NextResponse.json({ cases: [] })
  }
}
