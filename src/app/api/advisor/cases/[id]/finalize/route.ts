import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { sendCaseFinalizedNotification } from '@/lib/emails/advisorEmails'
import { features } from '@/config/features'
import { logger } from '@/lib/logger'

const FinalizeSchema = z.object({
  // Optional: advisor may edit the draft before finalizing
  finalDraftContent: z.string().min(100).optional(),
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
  const parsed = FinalizeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const assignment = await db.advisorAssignment.findUnique({
    where: { caseId },
    include: {
      case: {
        include: {
          user: { select: { email: true, name: true } },
          handoffPacket: { select: { briefSummary: true, draftContent: true } },
          outputs: { where: { role: 'consolidator', isFinal: true }, orderBy: { version: 'desc' }, take: 1 },
        },
      },
    },
  })

  if (!assignment || assignment.advisorId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (assignment.status !== 'ACCEPTED') {
    return NextResponse.json({ error: 'Assignment must be accepted to finalize' }, { status: 400 })
  }

  // Block finalization if open annotations remain
  const openAnnotations = await db.caseAnnotation.count({
    where: { caseId, status: { in: ['OPEN', 'ANSWERED'] } },
  })
  if (openAnnotations > 0) {
    return NextResponse.json(
      { error: `${openAnnotations} annotation(s) must be resolved before finalizing` },
      { status: 400 }
    )
  }

  const latestVersion = assignment.case.outputs[0]?.version ?? 0
  const draftContent = parsed.data.finalDraftContent ?? assignment.case.handoffPacket?.draftContent ?? ''

  await db.$transaction(async tx => {
    // If advisor edited the draft, store as new CaseOutput
    if (parsed.data.finalDraftContent) {
      await tx.caseOutput.create({
        data: {
          caseId,
          role: 'consolidator',
          provider: 'advisor',
          model: 'human-review',
          content: draftContent,
          version: latestVersion + 1,
          isFinal: true,
        },
      })
    }

    // Create final document record
    await tx.document.create({
      data: {
        caseId,
        name: 'Einspruch (final, geprüft)',
        type: 'EINSPRUCH_FINAL',
        storagePath: `cases/${caseId}/einspruch_final.txt`,
        mimeType: 'text/plain',
        sizeBytes: Buffer.byteLength(draftContent, 'utf8'),
        extractedText: draftContent,
      },
    })

    // Update assignment and case status
    await tx.advisorAssignment.update({
      where: { caseId },
      data: { status: 'FINALIZED', finalizedAt: new Date() },
    })

    await tx.case.update({
      where: { id: caseId },
      data: { status: 'APPROVED' },
    })
  })

  // Notify client (non-blocking)
  if (assignment.case.user) {
    sendCaseFinalizedNotification({
      clientEmail: assignment.case.user.email,
      clientName: assignment.case.user.name,
      briefSummary: assignment.case.handoffPacket?.briefSummary ?? caseId,
      caseId,
    }).catch(err => logger.error('Failed to send finalized notification', { err }))
  }

  logger.info('Case finalized by advisor', { caseId, advisorId: session.user.id })

  return NextResponse.json({ status: 'FINALIZED', caseStatus: 'APPROVED' })
}
