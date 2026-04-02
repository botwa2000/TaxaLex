import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { sendAdvisorReplyNotification } from '@/lib/emails/advisorEmails'
import { features } from '@/config/features'
import { logger } from '@/lib/logger'
import { ADVISOR } from '@/config/constants'

const PatchSchema = z.union([
  z.object({ action: z.literal('resolve') }),
  z.object({
    action: z.literal('reply'),
    content: z.string().min(1).max(ADVISOR.maxAnnotationLength),
  }),
])

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; annotationId: string }> }
) {
  if (!features.advisorModule) {
    return NextResponse.json({ error: 'Not available' }, { status: 403 })
  }

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: caseId, annotationId } = await params

  const body = await req.json()
  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const annotation = await db.caseAnnotation.findUnique({
    where: { id: annotationId },
    include: {
      case: {
        include: {
          user: { select: { id: true, email: true, name: true } },
          assignment: {
            include: { advisor: { select: { id: true, email: true, name: true } } },
          },
          handoffPacket: { select: { briefSummary: true } },
        },
      },
    },
  })

  if (!annotation || annotation.caseId !== caseId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const isAdvisor = annotation.case.assignment?.advisorId === session.user.id
  const isOwner = annotation.case.userId === session.user.id

  if (!isAdvisor && !isOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (parsed.data.action === 'resolve') {
    // Only advisor can resolve
    if (!isAdvisor) {
      return NextResponse.json({ error: 'Only the advisor can resolve annotations' }, { status: 403 })
    }

    const updated = await db.caseAnnotation.update({
      where: { id: annotationId },
      data: { status: 'RESOLVED', resolvedAt: new Date() },
    })

    // If all annotations are resolved, reset assignment status to ACCEPTED
    const openCount = await db.caseAnnotation.count({
      where: { caseId, status: { in: ['OPEN', 'ANSWERED'] } },
    })
    if (openCount === 0 && annotation.case.assignment) {
      await db.advisorAssignment.update({
        where: { caseId },
        data: { status: 'ACCEPTED' },
      })
    }

    return NextResponse.json({ status: updated.status })
  }

  // reply — only case owner
  if (!isOwner) {
    return NextResponse.json({ error: 'Only the case owner can reply' }, { status: 403 })
  }

  if (annotation.status === 'RESOLVED') {
    return NextResponse.json({ error: 'Cannot reply to a resolved annotation' }, { status: 400 })
  }

  const updated = await db.caseAnnotation.update({
    where: { id: annotationId },
    data: {
      replyContent: parsed.data.content,
      repliedAt: new Date(),
      status: 'ANSWERED',
    },
  })

  // Notify advisor (non-blocking)
  const advisor = annotation.case.assignment?.advisor
  if (advisor) {
    sendAdvisorReplyNotification({
      advisorEmail: advisor.email,
      advisorName: advisor.name,
      briefSummary: annotation.case.handoffPacket?.briefSummary ?? caseId,
      caseId,
    }).catch(err => logger.error('Failed to send reply notification', { err }))
  }

  logger.info('Annotation replied', { annotationId, caseId })

  return NextResponse.json({ status: updated.status, repliedAt: updated.repliedAt })
}
