import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { features } from '@/config/features'

export async function GET(req: NextRequest) {
  if (!features.advisorModule) {
    return NextResponse.json({ error: 'Not available' }, { status: 403 })
  }

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!['ADVISOR', 'LAWYER'].includes(session.user.role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const statusFilter = searchParams.get('status') ?? undefined

  const assignments = await db.advisorAssignment.findMany({
    where: {
      advisorId: session.user.id,
      ...(statusFilter ? { status: statusFilter as never } : {}),
    },
    include: {
      case: {
        select: {
          id: true,
          useCase: true,
          status: true,
          deadline: true,
          viabilityScore: true,
          viabilitySummary: true,
          handoffPacket: { select: { briefSummary: true, extractedFacts: true } },
          _count: { select: { annotations: { where: { status: { in: ['OPEN', 'ANSWERED'] } } } } },
        },
      },
    },
    orderBy: [
      // PENDING cases sorted by deadline urgency first
      { case: { deadline: 'asc' } },
      { createdAt: 'desc' },
    ],
  })

  return NextResponse.json(
    assignments.map(a => ({
      id: a.id,
      status: a.status,
      scope: a.scope,
      createdAt: a.createdAt,
      acceptedAt: a.acceptedAt,
      case: {
        id: a.case.id,
        useCase: a.case.useCase,
        status: a.case.status,
        deadline: a.case.deadline,
        viabilityScore: a.case.viabilityScore,
        viabilitySummary: a.case.viabilitySummary,
        briefSummary: a.case.handoffPacket?.briefSummary ?? null,
        extractedFacts: a.case.handoffPacket?.extractedFacts ?? null,
        openAnnotations: a.case._count.annotations,
      },
    }))
  )
}
