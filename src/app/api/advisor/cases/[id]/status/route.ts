import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { sendCaseDeclinedNotification } from '@/lib/emails/advisorEmails'
import { features } from '@/config/features'
import { logger } from '@/lib/logger'

const StatusSchema = z.union([
  z.object({ action: z.literal('accept') }),
  z.object({ action: z.literal('decline'), declineReason: z.string().min(10).max(500) }),
])

export async function PATCH(
  req: NextRequest,
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
  const advisorId = session.user.id as string

  const body = await req.json()
  const parsed = StatusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  // Find this advisor's specific assignment for this case
  const assignment = await db.advisorAssignment.findFirst({
    where: { caseId, advisorId },
    include: {
      case: {
        include: {
          handoffPacket: { select: { briefSummary: true, extractedFacts: true } },
          user: { select: { email: true, name: true } },
        },
      },
    },
  })

  if (!assignment) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (assignment.status !== 'PENDING') {
    return NextResponse.json({ error: 'Assignment is no longer pending' }, { status: 409 })
  }

  if (parsed.data.action === 'accept') {
    // Accept this assignment and supersede all other PENDING ones for this case atomically
    await db.$transaction([
      db.advisorAssignment.update({
        where: { id: assignment.id },
        data: { status: 'ACCEPTED', acceptedAt: new Date() },
      }),
      db.advisorAssignment.updateMany({
        where: { caseId, status: 'PENDING', id: { not: assignment.id } },
        data: { status: 'SUPERSEDED' },
      }),
    ])

    logger.info('Advisor accepted case', { caseId, advisorId })
    return NextResponse.json({ status: 'ACCEPTED' })
  }

  // decline — only affects this advisor's assignment
  const { declineReason } = parsed.data

  await db.advisorAssignment.update({
    where: { id: assignment.id },
    data: { status: 'DECLINED', declineReason },
  })

  // If this was the last non-terminal assignment, reset case to DRAFT_READY
  const remainingActive = await db.advisorAssignment.count({
    where: { caseId, status: { in: ['PENDING', 'ACCEPTED', 'CHANGES_REQUESTED'] } },
  })
  if (remainingActive === 0) {
    await db.case.update({ where: { id: caseId }, data: { status: 'DRAFT_READY' } })

    // Notify client that no expert is available
    if (assignment.case.user) {
      sendCaseDeclinedNotification({
        clientEmail: assignment.case.user.email,
        clientName: assignment.case.user.name,
        briefSummary: assignment.case.handoffPacket?.briefSummary ?? caseId,
        declineReason: 'All available experts have declined this case.',
        caseId,
      }).catch(err => logger.error('Failed to send decline notification', { err }))
    }
  }

  logger.info('Advisor declined case', { caseId, advisorId })
  return NextResponse.json({ status: 'DECLINED' })
}
