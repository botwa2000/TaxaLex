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

  const body = await req.json()
  const parsed = StatusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const assignment = await db.advisorAssignment.findUnique({
    where: { caseId },
    include: {
      case: {
        include: {
          handoffPacket: { select: { briefSummary: true, extractedFacts: true } },
          user: { select: { email: true, name: true } },
        },
      },
    },
  })

  if (!assignment || assignment.advisorId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (assignment.status !== 'PENDING') {
    return NextResponse.json({ error: 'Assignment is no longer pending' }, { status: 409 })
  }

  if (parsed.data.action === 'accept') {
    await db.advisorAssignment.update({
      where: { caseId },
      data: { status: 'ACCEPTED', acceptedAt: new Date() },
    })

    logger.info('Advisor accepted case', { caseId, advisorId: session.user.id })
    return NextResponse.json({ status: 'ACCEPTED' })
  }

  // decline
  const { declineReason } = parsed.data

  await db.$transaction([
    db.advisorAssignment.update({
      where: { caseId },
      data: { status: 'DECLINED', declineReason },
    }),
    db.case.update({
      where: { id: caseId },
      data: { status: 'DRAFT_READY' },
    }),
  ])

  // Notify client (non-blocking)
  if (assignment.case.user) {
    sendCaseDeclinedNotification({
      clientEmail: assignment.case.user.email,
      clientName: assignment.case.user.name,
      briefSummary: assignment.case.handoffPacket?.briefSummary ?? caseId,
      declineReason,
      caseId,
    }).catch(err => logger.error('Failed to send decline notification', { err }))
  }

  logger.info('Advisor declined case', { caseId, advisorId: session.user.id })
  return NextResponse.json({ status: 'DECLINED' })
}
