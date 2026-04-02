import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { features } from '@/config/features'
import { logger } from '@/lib/logger'

const WithdrawSchema = z.object({
  // Required only when an expert has already accepted; optional otherwise
  reason: z.string().min(5).max(500).optional(),
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
  const userId = session.user.id as string

  // Verify case ownership
  const caseRecord = await db.case.findUnique({
    where: { id: caseId },
    select: { id: true, userId: true, status: true },
  })

  if (!caseRecord || caseRecord.userId !== userId) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 })
  }

  // Cannot withdraw after the expert has finalized
  if (['APPROVED', 'CLOSED_SUCCESS', 'SUBMITTED'].includes(caseRecord.status)) {
    return NextResponse.json(
      { error: 'Cannot withdraw after the case has been finalized or submitted' },
      { status: 409 }
    )
  }

  const body = await req.json().catch(() => ({}))
  const parsed = WithdrawSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const { reason } = parsed.data

  // Find the accepted assignment, if any
  const acceptedAssignment = await db.advisorAssignment.findFirst({
    where: { caseId, status: 'ACCEPTED' },
    select: { id: true, advisorId: true },
  })

  if (acceptedAssignment && !reason) {
    return NextResponse.json(
      { error: 'A reason is required when withdrawing after an expert has accepted.' },
      { status: 400 }
    )
  }

  await db.$transaction(async tx => {
    // Flip all PENDING assignments to WITHDRAWN
    await tx.advisorAssignment.updateMany({
      where: { caseId, status: 'PENDING' },
      data: { status: 'WITHDRAWN' },
    })

    // If there was an accepted assignment, mark it WITHDRAWN with reason
    if (acceptedAssignment) {
      await tx.advisorAssignment.update({
        where: { id: acceptedAssignment.id },
        data: { status: 'WITHDRAWN', declineReason: reason ?? null },
      })
    }

    // Reset case to DRAFT_READY
    await tx.case.update({
      where: { id: caseId },
      data: { status: 'DRAFT_READY' },
    })
  })

  logger.info('Client withdrew handoff request', {
    caseId,
    userId,
    hadAcceptedAssignment: !!acceptedAssignment,
  })

  return NextResponse.json({ status: 'WITHDRAWN' })
}
