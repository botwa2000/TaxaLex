import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { features } from '@/config/features'
import { ADVISOR, CASE_PRACTICE_AREA } from '@/config/constants'

export async function GET(req: NextRequest) {
  if (!features.advisorModule) {
    return NextResponse.json({ error: 'Not available' }, { status: 403 })
  }

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const useCase = searchParams.get('useCase') ?? undefined

  // Determine required practice area from case type, if provided
  const requiredArea = useCase ? (CASE_PRACTICE_AREA[useCase] ?? undefined) : undefined

  const expiryThreshold = new Date(Date.now() - ADVISOR.broadcastExpiryHours * 60 * 60 * 1000)

  const experts = await db.user.findMany({
    where: {
      role: { in: ['ADVISOR', 'LAWYER', 'EXPERT'] },
      isAcceptingCases: true,
      // If a practice area is required, filter experts who cover it
      ...(requiredArea ? { practiceAreas: { has: requiredArea } } : {}),
    },
    select: {
      id: true,
      name: true,
      role: true,
      practiceAreas: true,
      maxConcurrentCases: true,
      _count: {
        select: {
          advisorAssignments: {
            where: { status: { in: ['PENDING', 'ACCEPTED', 'CHANGES_REQUESTED'] } },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  // Lazy-expire stale PENDING assignments (72h check, non-blocking best-effort)
  db.advisorAssignment.updateMany({
    where: {
      status: 'PENDING',
      createdAt: { lt: expiryThreshold },
    },
    data: { status: 'EXPIRED' },
  }).catch(() => {/* non-critical */})

  return NextResponse.json(
    experts.map(e => ({
      id: e.id,
      name: e.name,
      role: e.role,
      practiceAreas: e.practiceAreas,
      activeAssignments: e._count.advisorAssignments,
      atCapacity: e._count.advisorAssignments >= e.maxConcurrentCases,
    }))
  )
}
