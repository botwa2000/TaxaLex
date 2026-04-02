/**
 * Handoff packet compiler.
 *
 * Assembles a HandoffPacket from a Case's DB records (bescheidData, documents,
 * CaseOutputs) and persists it. Called when a client requests advisor review.
 */

import { db } from '@/lib/db'
import { scoreViability } from '@/lib/viability'
import type { AuthorizationScope, ExtractedFacts, HandoffPacketData, PacketDocument } from '@/types'
import { logger } from '@/lib/logger'

export async function compileHandoffPacket(
  caseId: string,
  scope: AuthorizationScope,
  clientNotes?: string
): Promise<HandoffPacketData> {
  // Fetch full case with relations
  const caseRecord = await db.case.findUniqueOrThrow({
    where: { id: caseId },
    include: {
      documents: { select: { id: true, name: true, type: true, storagePath: true } },
      outputs: { where: { isFinal: true }, orderBy: { createdAt: 'desc' } },
    },
  })

  // Get latest final outputs by role
  const outputsByRole = new Map<string, string>()
  for (const output of caseRecord.outputs) {
    if (!outputsByRole.has(output.role)) {
      outputsByRole.set(output.role, output.content)
    }
  }

  const draftContent = outputsByRole.get('consolidator') ?? outputsByRole.get('drafter') ?? ''
  const adversaryContent = outputsByRole.get('adversary') ?? ''
  const factcheckerContent = outputsByRole.get('factchecker') ?? ''
  const reviewerContent = outputsByRole.get('reviewer') ?? ''

  // Extract facts from bescheidData JSON
  const bescheid = (caseRecord.bescheidData ?? {}) as Record<string, unknown>
  const extractedFacts: ExtractedFacts = {
    finanzamt: String(bescheid.finanzamt ?? ''),
    steuernummer: String(bescheid.steuernummer ?? ''),
    steuerart: String(bescheid.steuerart ?? ''),
    bescheidDatum: String(bescheid.bescheidDatum ?? ''),
    amountDisputed: Number(bescheid.streitigerBetrag ?? 0),
    amountTotal: Number(bescheid.nachzahlung ?? 0),
    periods: [],
    paragraphsCited: [],
    deadline: caseRecord.deadline ? caseRecord.deadline.toISOString() : null,
  }

  // Score viability from agent outputs
  const analysisSummary = scoreViability({
    adversaryContent,
    factcheckerContent,
    reviewerContent,
    amountDisputed: extractedFacts.amountDisputed,
  })

  // Build brief summary (1-line display string)
  const deadlineDays = extractedFacts.deadline
    ? Math.ceil((new Date(extractedFacts.deadline).getTime() - Date.now()) / 86400000)
    : null
  const deadlinePart = deadlineDays !== null
    ? ` · Frist in ${deadlineDays} Tag${deadlineDays === 1 ? '' : 'en'}`
    : ''
  const briefSummary = `${extractedFacts.steuerart || caseRecord.useCase} · €${extractedFacts.amountDisputed.toLocaleString('de-DE')} strittig${deadlinePart}`

  // Persist packet (upsert in case of recompile)
  const documents: PacketDocument[] = caseRecord.documents.map(d => ({
    id: d.id,
    name: d.name,
    type: d.type,
    storagePath: d.storagePath,
  }))

  const clientContext = {
    userAnswers: (caseRecord.userAnswers as Record<string, string>) ?? {},
    clientNotes,
    scope,
  }

  // Prisma requires Json fields as unknown first when typed interfaces don't satisfy JsonValue
  const packet = await db.handoffPacket.upsert({
    where: { caseId },
    create: {
      caseId,
      briefSummary,
      extractedFacts: extractedFacts as unknown as never,
      analysisSummary: analysisSummary as unknown as never,
      draftContent,
      clientContext: clientContext as unknown as never,
      documents: documents as unknown as never,
    },
    update: {
      briefSummary,
      extractedFacts: extractedFacts as unknown as never,
      analysisSummary: analysisSummary as unknown as never,
      draftContent,
      clientContext: clientContext as unknown as never,
      documents: documents as unknown as never,
    },
  })

  // Update case with viability score
  await db.case.update({
    where: { id: caseId },
    data: {
      viabilityScore: analysisSummary.viabilityScore,
      viabilitySummary: analysisSummary.viabilitySummary,
    },
  })

  logger.info('Handoff packet compiled', { caseId, viability: analysisSummary.viabilityScore })

  return {
    id: packet.id,
    caseId: packet.caseId,
    version: packet.version,
    briefSummary: packet.briefSummary,
    extractedFacts: packet.extractedFacts as unknown as ExtractedFacts,
    analysisSummary: packet.analysisSummary as unknown as typeof analysisSummary,
    draftContent: packet.draftContent,
    clientContext: packet.clientContext as unknown as typeof clientContext,
    documents: packet.documents as unknown as PacketDocument[],
    createdAt: packet.createdAt,
  }
}
