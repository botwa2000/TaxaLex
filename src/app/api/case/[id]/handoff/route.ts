import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { compileHandoffPacket } from '@/lib/handoff'
import { sendHandoffNotification } from '@/lib/emails/advisorEmails'
import { features } from '@/config/features'
import { logger } from '@/lib/logger'

const HandoffSchema = z.object({
  advisorId: z.string().min(1),
  scope: z.enum(['REVIEW_ONLY', 'FULL_REPRESENTATION']),
  clientNotes: z.string().max(1000).optional(),
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
  const parsed = HandoffSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const { advisorId, scope, clientNotes } = parsed.data

  // Verify case ownership and status
  const caseRecord = await db.case.findUnique({
    where: { id: caseId },
    select: { id: true, userId: true, status: true, user: { select: { email: true, name: true } } },
  })

  if (!caseRecord || caseRecord.userId !== session.user.id) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 })
  }

  if (caseRecord.status !== 'DRAFT_READY') {
    return NextResponse.json({ error: 'Case must be in DRAFT_READY status to request review' }, { status: 400 })
  }

  // Verify advisor exists and has correct role
  const advisor = await db.user.findUnique({
    where: { id: advisorId },
    select: { id: true, role: true, email: true, name: true },
  })

  if (!advisor || !['ADVISOR', 'LAWYER'].includes(advisor.role)) {
    return NextResponse.json({ error: 'Advisor not found' }, { status: 404 })
  }

  // Check no existing active assignment
  const existing = await db.advisorAssignment.findUnique({ where: { caseId } })
  if (existing && !['DECLINED'].includes(existing.status)) {
    return NextResponse.json({ error: 'Case already has an active assignment' }, { status: 409 })
  }

  try {
    // Compile handoff packet
    const packet = await compileHandoffPacket(caseId, scope, clientNotes)

    // Create assignment (upsert to handle re-request after decline)
    const assignment = await db.advisorAssignment.upsert({
      where: { caseId },
      create: { caseId, advisorId, scope, status: 'PENDING' },
      update: { advisorId, scope, status: 'PENDING', declineReason: null, acceptedAt: null, finalizedAt: null },
    })

    // Update case status
    await db.case.update({
      where: { id: caseId },
      data: { status: 'ADVISOR_REVIEW' },
    })

    // Send notification email (non-blocking)
    sendHandoffNotification({
      advisorEmail: advisor.email,
      advisorName: advisor.name,
      briefSummary: packet.briefSummary,
      amountDisputed: packet.extractedFacts.amountDisputed,
      deadlineDate: packet.extractedFacts.deadline,
      viabilityScore: packet.analysisSummary.viabilityScore,
      caseId,
    }).catch(err => logger.error('Failed to send handoff notification', { err }))

    logger.info('Handoff created', { caseId, advisorId, assignmentId: assignment.id })

    return NextResponse.json({ assignmentId: assignment.id, packetId: packet.id })
  } catch (error) {
    logger.error('Handoff compilation failed', { caseId, error })
    return NextResponse.json({ error: 'Failed to create handoff' }, { status: 500 })
  }
}
