import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { features } from '@/config/features'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!features.advisorModule) {
    return NextResponse.json({ error: 'Not available' }, { status: 403 })
  }

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: caseId } = await params

  const assignment = await db.advisorAssignment.findUnique({
    where: { caseId },
    include: {
      case: {
        include: {
          handoffPacket: true,
          annotations: {
            include: { author: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'asc' },
          },
        },
      },
    },
  })

  if (!assignment || assignment.advisorId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    assignment: {
      id: assignment.id,
      status: assignment.status,
      scope: assignment.scope,
      declineReason: assignment.declineReason,
      acceptedAt: assignment.acceptedAt,
      finalizedAt: assignment.finalizedAt,
      createdAt: assignment.createdAt,
    },
    packet: assignment.case.handoffPacket,
    annotations: assignment.case.annotations.map(a => ({
      id: a.id,
      section: a.section,
      paragraphIndex: a.paragraphIndex,
      content: a.content,
      status: a.status,
      author: a.author,
      replyContent: a.replyContent,
      repliedAt: a.repliedAt,
      aiPreFilled: a.aiPreFilled,
      aiPreFillText: a.aiPreFillText,
      createdAt: a.createdAt,
    })),
  })
}
