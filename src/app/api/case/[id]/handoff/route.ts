import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { compileHandoffPacket } from '@/lib/handoff'
import { sendHandoffNotification } from '@/lib/emails/advisorEmails'
import { features } from '@/config/features'
import { logger } from '@/lib/logger'
import { ADVISOR, CASE_PRACTICE_AREA } from '@/config/constants'

const HandoffSchema = z.object({
  scope: z.enum(['REVIEW_ONLY', 'FULL_REPRESENTATION']),
  clientNotes: z.string().max(1000).optional(),
})

/** Expire PENDING assignments older than broadcastExpiryHours for a case */
async function expireStalePending(caseId: string): Promise<void> {
  const threshold = new Date(Date.now() - ADVISOR.broadcastExpiryHours * 60 * 60 * 1000)
  const expired = await db.advisorAssignment.updateMany({
    where: { caseId, status: 'PENDING', createdAt: { lt: threshold } },
    data: { status: 'EXPIRED' },
  })
  if (expired.count > 0) {
    // If all assignments for this case are now terminal, reset case to DRAFT_READY
    const active = await db.advisorAssignment.count({
      where: { caseId, status: { in: ['PENDING', 'ACCEPTED', 'CHANGES_REQUESTED'] } },
    })
    if (active === 0) {
      await db.case.update({ where: { id: caseId }, data: { status: 'DRAFT_READY' } })
    }
  }
}

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

  const { scope, clientNotes } = parsed.data

  // Verify case ownership and status
  const caseRecord = await db.case.findUnique({
    where: { id: caseId },
    select: { id: true, userId: true, status: true, useCase: true, user: { select: { email: true, name: true } } },
  })

  if (!caseRecord || caseRecord.userId !== session.user.id) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 })
  }

  if (caseRecord.status !== 'DRAFT_READY') {
    return NextResponse.json({ error: 'Case must be in DRAFT_READY status to request review' }, { status: 400 })
  }

  // Expire any stale pending assignments before checking for existing active ones
  await expireStalePending(caseId)

  // Reject if there is already an active (PENDING or ACCEPTED) assignment
  const activeAssignment = await db.advisorAssignment.findFirst({
    where: { caseId, status: { in: ['PENDING', 'ACCEPTED', 'CHANGES_REQUESTED'] } },
  })
  if (activeAssignment) {
    return NextResponse.json({ error: 'Case already has an active assignment' }, { status: 409 })
  }

  // Determine required practice area for this case type
  const requiredArea = CASE_PRACTICE_AREA[caseRecord.useCase] ?? 'LEGAL'

  // Find all available experts who cover this practice area and are not at capacity
  const experts = await db.user.findMany({
    where: {
      role: { in: ['ADVISOR', 'LAWYER', 'EXPERT'] },
      isAcceptingCases: true,
      practiceAreas: { has: requiredArea },
    },
    select: {
      id: true,
      name: true,
      email: true,
      maxConcurrentCases: true,
      _count: {
        select: {
          advisorAssignments: {
            where: { status: { in: ['PENDING', 'ACCEPTED', 'CHANGES_REQUESTED'] } },
          },
        },
      },
    },
  })

  const availableExperts = experts.filter(
    e => e._count.advisorAssignments < e.maxConcurrentCases
  )

  if (availableExperts.length === 0) {
    return NextResponse.json(
      { error: 'No experts available for this case type at this time. Please try again later.' },
      { status: 503 }
    )
  }

  try {
    // Compile handoff packet once
    const packet = await compileHandoffPacket(caseId, scope, clientNotes)

    // Create one assignment per available expert (broadcast)
    await db.advisorAssignment.createMany({
      data: availableExperts.map(e => ({
        caseId,
        advisorId: e.id,
        scope,
        status: 'PENDING' as const,
      })),
      skipDuplicates: true,
    })

    // Update case status
    await db.case.update({
      where: { id: caseId },
      data: { status: 'ADVISOR_REVIEW' },
    })

    // Send notification emails to all experts (non-blocking)
    for (const expert of availableExperts) {
      sendHandoffNotification({
        advisorEmail: expert.email,
        advisorName: expert.name,
        briefSummary: packet.briefSummary,
        amountDisputed: packet.extractedFacts.amountDisputed,
        deadlineDate: packet.extractedFacts.deadline,
        viabilityScore: packet.analysisSummary.viabilityScore,
        caseId,
      }).catch(err => logger.error('Failed to send handoff notification', { advisorId: expert.id, err }))
    }

    logger.info('Broadcast handoff created', {
      caseId,
      practiceArea: requiredArea,
      expertCount: availableExperts.length,
    })

    return NextResponse.json({
      packetId: packet.id,
      expertCount: availableExperts.length,
      practiceArea: requiredArea,
    })
  } catch (error) {
    logger.error('Handoff compilation failed', { caseId, error })
    return NextResponse.json({ error: 'Failed to create handoff' }, { status: 500 })
  }
}
