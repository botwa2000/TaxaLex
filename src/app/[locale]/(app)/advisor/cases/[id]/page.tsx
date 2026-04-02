import { auth } from '@/auth'
import { notFound, redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { features } from '@/config/features'
import { AdvisorCaseClient } from './AdvisorCaseClient'
import type {
  HandoffPacketData, AnnotationData, AdvisorAssignmentData,
  ExtractedFacts, AnalysisSummary, ClientContext, PacketDocument,
} from '@/types'

export default async function AdvisorCasePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  if (!features.advisorModule) redirect('/advisor/dashboard')

  const session = await auth()
  if (!session) redirect('/login')
  if (!['ADVISOR', 'LAWYER', 'ADMIN'].includes(session.user?.role ?? '')) {
    redirect('/dashboard')
  }

  const { id: caseId } = await params
  const advisorId = session.user!.id as string

  const assignment = await db.advisorAssignment.findUnique({
    where: { caseId },
    include: {
      advisor: { select: { id: true, name: true, email: true } },
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

  if (!assignment || assignment.advisorId !== advisorId) notFound()
  if (!assignment.case.handoffPacket) notFound()

  const packet = assignment.case.handoffPacket
  const handoffPacketData: HandoffPacketData = {
    id: packet.id,
    caseId: packet.caseId,
    version: packet.version,
    briefSummary: packet.briefSummary,
    extractedFacts: packet.extractedFacts as unknown as ExtractedFacts,
    analysisSummary: packet.analysisSummary as unknown as AnalysisSummary,
    draftContent: packet.draftContent,
    clientContext: packet.clientContext as unknown as ClientContext,
    documents: packet.documents as unknown as PacketDocument[],
    createdAt: packet.createdAt,
  }

  const assignmentData: AdvisorAssignmentData = {
    id: assignment.id,
    caseId: assignment.caseId,
    status: assignment.status as AdvisorAssignmentData['status'],
    scope: assignment.scope as AdvisorAssignmentData['scope'],
    declineReason: assignment.declineReason,
    advisor: assignment.advisor,
    acceptedAt: assignment.acceptedAt,
    finalizedAt: assignment.finalizedAt,
    createdAt: assignment.createdAt,
  }

  const annotationsData: AnnotationData[] = assignment.case.annotations.map(a => ({
    id: a.id,
    section: a.section as AnnotationData['section'],
    paragraphIndex: a.paragraphIndex,
    content: a.content,
    status: a.status as AnnotationData['status'],
    author: a.author,
    replyContent: a.replyContent,
    repliedAt: a.repliedAt,
    aiPreFilled: a.aiPreFilled,
    aiPreFillText: a.aiPreFillText,
    createdAt: a.createdAt,
  }))

  return (
    <AdvisorCaseClient
      caseId={caseId}
      assignment={assignmentData}
      packet={handoffPacketData}
      initialAnnotations={annotationsData}
    />
  )
}
