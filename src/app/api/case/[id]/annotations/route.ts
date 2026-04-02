import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { sendClientAnnotationNotification } from '@/lib/emails/advisorEmails'
import { features } from '@/config/features'
import { logger } from '@/lib/logger'
import { ADVISOR } from '@/config/constants'

const PACKET_SECTIONS = ['BRIEF', 'FACTS', 'ANALYSIS', 'DRAFT', 'CLIENT_CONTEXT'] as const

const AnnotationSchema = z.object({
  section: z.enum(PACKET_SECTIONS),
  paragraphIndex: z.number().int().min(0).optional(),
  content: z.string().min(5).max(ADVISOR.maxAnnotationLength),
})

export async function POST(
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
  const parsed = AnnotationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  // Fetch case with the ACCEPTED assignment for this advisor (if any)
  const caseRecord = await db.case.findUnique({
    where: { id: caseId },
    include: {
      user: { select: { id: true, email: true, name: true } },
      assignments: {
        where: { status: { in: ['ACCEPTED', 'CHANGES_REQUESTED'] } },
        include: { advisor: { select: { id: true, email: true, name: true } } },
        take: 1,
      },
      handoffPacket: { select: { briefSummary: true } },
      _count: { select: { annotations: true } },
    },
  })

  if (!caseRecord) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 })
  }

  const acceptedAssignment = caseRecord.assignments[0] ?? null
  const isAdvisor = acceptedAssignment?.advisorId === session.user.id
  const isOwner = caseRecord.userId === session.user.id

  if (!isAdvisor && !isOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Advisor can only annotate accepted cases
  if (isAdvisor && !['ACCEPTED', 'CHANGES_REQUESTED'].includes(acceptedAssignment?.status ?? '')) {
    return NextResponse.json({ error: 'Assignment must be accepted to annotate' }, { status: 400 })
  }

  // Enforce annotation limit
  if (caseRecord._count.annotations >= ADVISOR.maxAnnotationsPerCase) {
    return NextResponse.json({ error: 'Maximum annotations reached' }, { status: 400 })
  }

  const annotation = await db.caseAnnotation.create({
    data: {
      caseId,
      authorId: session.user.id,
      section: parsed.data.section,
      paragraphIndex: parsed.data.paragraphIndex,
      content: parsed.data.content,
    },
    include: { author: { select: { id: true, name: true } } },
  })

  // Advisor creating annotation → update assignment status + notify client
  if (isAdvisor && acceptedAssignment) {
    await db.advisorAssignment.update({
      where: { id: acceptedAssignment.id },
      data: { status: 'CHANGES_REQUESTED' },
    })

    const openCount = await db.caseAnnotation.count({
      where: { caseId, status: { in: ['OPEN', 'ANSWERED'] } },
    })

    if (caseRecord.user) {
      sendClientAnnotationNotification({
        clientEmail: caseRecord.user.email,
        clientName: caseRecord.user.name,
        briefSummary: caseRecord.handoffPacket?.briefSummary ?? caseId,
        caseId,
        annotationCount: openCount,
      }).catch(err => logger.error('Failed to send annotation notification', { err }))
    }
  }

  logger.info('Annotation created', { caseId, annotationId: annotation.id, authorId: session.user.id })

  return NextResponse.json({
    id: annotation.id,
    section: annotation.section,
    paragraphIndex: annotation.paragraphIndex,
    content: annotation.content,
    status: annotation.status,
    author: annotation.author,
    aiPreFilled: annotation.aiPreFilled,
    createdAt: annotation.createdAt,
  }, { status: 201 })
}
