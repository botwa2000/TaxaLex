// Core types for the multi-agent objection engine

export type AgentRole = 'drafter' | 'reviewer' | 'factchecker' | 'adversary' | 'consolidator'

export type AgentProvider = 'anthropic' | 'openai' | 'google' | 'perplexity'

export interface AgentConfig {
  role: AgentRole
  provider: AgentProvider
  model: string
  systemPrompt: string
}

export interface TaxCase {
  id: string
  createdAt: Date
  status: CaseStatus

  // User inputs
  bescheidData?: BescheidData
  documents: UploadedDocument[]
  userAnswers: Record<string, string>

  // Agent outputs
  agentOutputs: AgentOutput[]
  finalDraft?: string
}

export type CaseStatus =
  | 'upload'        // Step 1: Uploading documents
  | 'questions'     // Step 2: AI asks follow-up questions
  | 'drafting'      // Step 3: Multi-agent drafting
  | 'review'        // Step 4: User reviews result
  | 'complete'      // Step 5: Final document ready

export interface BescheidData {
  finanzamt: string
  steuernummer: string
  bescheidDatum: string
  steuerart: string
  nachzahlung: number
  streitigerBetrag: number
  rawText?: string
}

export interface UploadedDocument {
  id: string
  name: string
  type: 'bescheid' | 'jahresabschluss' | 'beleg' | 'sonstige'
  path: string
  extractedText?: string
}

export interface AgentOutput {
  role: AgentRole
  provider: AgentProvider
  model: string
  content: string
  timestamp: Date
  issues?: string[]       // Problems identified (for reviewer/adversary)
  confidence?: number     // 0-1 confidence score
}

export interface EinspruchDocument {
  caseId: string
  version: number
  content: string
  sections: {
    antrag: string
    sachverhalt: string
    begruendung: string
    rechtsfolge: string
  }
  createdAt: Date
}

// ── Advisor Flow Types ────────────────────────────────────────────────────────

export type ViabilityScore = 'HIGH' | 'MEDIUM' | 'LOW'

export type AdvisorAssignmentStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'FINALIZED'

export type AuthorizationScope = 'REVIEW_ONLY' | 'FULL_REPRESENTATION'

export type AnnotationStatus = 'OPEN' | 'ANSWERED' | 'RESOLVED'

export type PacketSection = 'BRIEF' | 'FACTS' | 'ANALYSIS' | 'DRAFT' | 'CLIENT_CONTEXT'

export interface ExtractedFacts {
  finanzamt: string
  steuernummer: string
  steuerart: string
  bescheidDatum: string
  amountDisputed: number
  amountTotal: number
  periods: string[]
  paragraphsCited: string[]
  deadline: string | null
}

export interface AnalysisSummary {
  coreArgument: string
  evidenceGaps: string[]
  counterarguments: string[]
  viabilityScore: ViabilityScore
  viabilitySummary: string
}

export interface ClientContext {
  userAnswers: Record<string, string>
  clientNotes?: string
  scope: AuthorizationScope
}

export interface PacketDocument {
  id: string
  name: string
  type: string
  storagePath: string
}

export interface HandoffPacketData {
  id: string
  caseId: string
  version: number
  briefSummary: string
  extractedFacts: ExtractedFacts
  analysisSummary: AnalysisSummary
  draftContent: string
  clientContext: ClientContext
  documents: PacketDocument[]
  createdAt: Date
}

export interface AnnotationData {
  id: string
  section: PacketSection
  paragraphIndex?: number | null
  content: string
  status: AnnotationStatus
  author: { id: string; name: string | null }
  replyContent?: string | null
  repliedAt?: Date | null
  aiPreFilled: boolean
  aiPreFillText?: string | null
  createdAt: Date
}

export interface AdvisorAssignmentData {
  id: string
  caseId: string
  status: AdvisorAssignmentStatus
  scope: AuthorizationScope
  declineReason?: string | null
  advisor: { id: string; name: string | null; email: string }
  acceptedAt?: Date | null
  finalizedAt?: Date | null
  createdAt: Date
}

// ── API request/response types ────────────────────────────────────────────────

export interface AnalyzeRequest {
  caseId: string
  documents: { name: string; text: string }[]
}

export interface AnalyzeResponse {
  bescheidData: BescheidData
  followUpQuestions: { id: string; question: string; required: boolean }[]
}

export interface GenerateRequest {
  caseId: string
  bescheidData: BescheidData
  documents: { name: string; text: string }[]
  userAnswers: Record<string, string>
  /** BCP-47 language code for the final output document. Defaults to 'de'. */
  outputLanguage?: string
  /** BCP-47 language code for agent analysis/log shown to the user. Defaults to 'de'. */
  uiLanguage?: string
}

export interface GenerateResponse {
  outputs: AgentOutput[]
  finalDraft: string
  status: 'success' | 'needs_review'
}
