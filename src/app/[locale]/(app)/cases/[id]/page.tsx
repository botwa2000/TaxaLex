import { auth } from '@/auth'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, FileText, Cpu, MessageSquare, CheckCircle2, Clock, AlertTriangle,
  Download, Send, Paperclip, User, ExternalLink,
} from 'lucide-react'
import {
  DEMO_USER_ID, DEMO_CASES, DEMO_DOCUMENTS, DEMO_AGENT_OUTPUTS, DEMO_FINAL_DRAFT,
} from '@/lib/mockData'
import { CaseDetailClient } from '@/app/(app)/cases/[id]/CaseDetailClient'
import { HandoffRequestForm } from '@/components/client/HandoffRequestForm'
import { ExpertReviewCTA } from '@/components/client/ExpertReviewCTA'
import { AnnotationReplyCard } from '@/components/client/AnnotationReplyCard'
import { features } from '@/config/features'
import { Link } from '@/i18n/navigation'
import type { AnnotationData } from '@/types'

function extractOutputSummary(content: string): string {
  const lines = content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 20 && !l.startsWith('#') && !l.startsWith('---'))
  const first = lines[0] ?? ''
  return first.length > 200 ? first.slice(0, 197) + '…' : first
}

type CaseDetail = {
  id: string
  useCase: string
  status: string
  deadline: Date | null
  createdAt: Date
  updatedAt: Date
  bescheidData: Record<string, unknown> | null
}

export default async function CaseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await auth()
  const userId = session!.user!.id as string
  const { id, locale } = await params
  const { tab = 'overview' } = await searchParams

  let caseData: CaseDetail | null = null
  let documents: { id: string; name: string; type: string; createdAt: Date }[] = []
  let agentOutputs: { role: string; provider: string; model: string; durationMs: number; summary: string }[] = []
  let finalDraft: string | null = null
  let annotations: AnnotationData[] = []
  let hasActiveAssignment = false
  let hasActiveAddon = false
  let addonPriceCents = 9900     // resolved from DB below; fallback matches seed data
  let addonPlanSlug: 'expert-review' | 'expert-review-subscriber' = 'expert-review'
  let isSubscriber = false
  let standardPriceCents = 9900

  try {
    if (userId === DEMO_USER_ID) throw new Error('demo')
    const { db } = await import('@/lib/db')
    const raw = await db.case.findFirst({
      where: { id, userId },
      include: features.advisorModule
        ? {
            assignments: { select: { status: true } },
            annotations: {
              include: { author: { select: { id: true, name: true } } },
              orderBy: { createdAt: 'asc' },
            },
          }
        : undefined,
    })
    if (!raw) notFound()
    caseData = raw as CaseDetail

    if (features.advisorModule && 'assignments' in raw && Array.isArray(raw.assignments)) {
      const activeStatuses = ['PENDING', 'ACCEPTED', 'CHANGES_REQUESTED']
      hasActiveAssignment = (raw.assignments as { status: string }[]).some(a => activeStatuses.includes(a.status))
    }
    if (features.advisorModule && 'annotations' in raw) {
      annotations = ((raw as { annotations: unknown[] }).annotations as AnnotationData[]) ?? []
    }

    // Load documents and AI outputs from DB
    const [dbDocuments, dbOutputs] = await Promise.all([
      db.document.findMany({
        where: { caseId: id },
        select: { id: true, name: true, type: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      db.caseOutput.findMany({
        where: { caseId: id },
        select: { id: true, role: true, provider: true, model: true, durationMs: true, content: true, isFinal: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ])

    documents = dbDocuments

    // Map CaseOutputs → agentOutputs format expected by AIAnalysisTab
    agentOutputs = dbOutputs.map((o) => ({
      role: o.role,
      provider: o.provider,
      model: o.model,
      durationMs: o.durationMs ?? 0,
      summary: extractOutputSummary(o.content),
    }))

    // Final draft is the consolidator output marked as final
    const finalOutput = dbOutputs.find((o) => o.isFinal) ?? dbOutputs.find((o) => o.role === 'consolidator')
    finalDraft = finalOutput?.content ?? null

    if (features.advisorModule) {
      // Check if user already purchased the expert review add-on for this case
      const addon = await db.addonPurchase.findFirst({
        where: { userId, caseId: id, addonType: 'EXPERT_REVIEW', status: 'ACTIVE' },
      })
      hasActiveAddon = !!addon

      // Resolve pricing from DB so it stays consistent with what Stripe charges
      const sub = await db.subscription.findUnique({
        where: { userId },
        select: { status: true },
      })
      isSubscriber = sub?.status === 'ACTIVE' || sub?.status === 'TRIALING'
      addonPlanSlug = isSubscriber ? 'expert-review-subscriber' : 'expert-review'

      const [stdPlan, subPlan] = await Promise.all([
        db.pricingPlan.findUnique({ where: { slug: 'expert-review' }, select: { priceOnce: true } }),
        db.pricingPlan.findUnique({ where: { slug: 'expert-review-subscriber' }, select: { priceOnce: true } }),
      ])
      standardPriceCents = stdPlan?.priceOnce ? Math.round(Number(stdPlan.priceOnce) * 100) : 9900
      addonPriceCents = isSubscriber && subPlan?.priceOnce
        ? Math.round(Number(subPlan.priceOnce) * 100)
        : standardPriceCents
    }
  } catch {
    const found = DEMO_CASES.find((c) => c.id === id)
    if (!found) notFound()
    caseData = found as CaseDetail
    documents = DEMO_DOCUMENTS[id] ?? []
    agentOutputs = DEMO_AGENT_OUTPUTS[id] ?? []
    finalDraft = agentOutputs.length > 0 ? DEMO_FINAL_DRAFT : null
  }

  if (!caseData) notFound()

  const now = new Date()
  const daysLeft = caseData.deadline ? Math.ceil((caseData.deadline.getTime() - now.getTime()) / 86400000) : null
  const isUrgent = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0
  const isOverdue = daysLeft !== null && daysLeft < 0

  const tabs = [
    { id: 'overview', label: 'Übersicht', icon: MessageSquare },
    { id: 'documents', label: `Dokumente (${documents.length})`, icon: Paperclip },
    { id: 'ai', label: `KI-Analyse (${agentOutputs.length})`, icon: Cpu },
    { id: 'letter', label: 'Einspruch', icon: FileText },
  ]

  return (
    <div>
      <Link href="/cases" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-5">
        <ArrowLeft className="w-4 h-4" />
        Zurück zu Meine Fälle
      </Link>

      {/* Case header */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-[var(--foreground)]">{useCaseLabel(caseData.useCase)}</h1>
              <StatusBadge status={caseData.status} />
            </div>
            <p className="text-sm text-[var(--muted)]">
              Fall #{caseData.id.slice(-8).toUpperCase()} · Erstellt am{' '}
              {new Date(caseData.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
            {caseData.deadline && (
              <div className={`inline-flex items-center gap-1.5 mt-2 text-xs font-medium px-2.5 py-1 rounded-full ${isOverdue ? 'bg-red-50 text-red-700' : isUrgent ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-[var(--muted)]'}`}>
                {isOverdue || isUrgent ? <AlertTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                {isOverdue
                  ? 'Einspruchsfrist abgelaufen'
                  : isUrgent
                  ? `Frist läuft in ${daysLeft} Tagen ab — ${new Date(caseData.deadline).toLocaleDateString('de-DE')}`
                  : `Frist: ${new Date(caseData.deadline).toLocaleDateString('de-DE')} (noch ${daysLeft} Tage)`}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {caseData.status === 'DRAFT_READY' && (
              <>
                <button className="flex items-center gap-1.5 border border-[var(--border)] text-[var(--foreground)] text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-[var(--background-subtle)] transition-colors">
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
                <button className="flex items-center gap-1.5 bg-brand-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-brand-700 transition-colors">
                  <Send className="w-3.5 h-3.5" /> Einreichen
                </button>
              </>
            )}
            {caseData.status === 'SUBMITTED' && (
              <span className="flex items-center gap-1.5 bg-green-50 text-green-700 text-sm font-medium px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5" /> Eingereicht
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 mb-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1.5 w-fit">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={`/cases/${caseData!.id}?tab=${t.id}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? 'bg-brand-600 text-white' : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)]'}`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </Link>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <>
          <OverviewTab caseData={caseData} daysLeft={daysLeft} isUrgent={isUrgent} isOverdue={isOverdue} />
          {features.advisorModule && caseData.status === 'DRAFT_READY' && !hasActiveAssignment && (
            <div className="mt-6">
              {hasActiveAddon ? (
                <HandoffRequestForm caseId={caseData.id} useCase={caseData.useCase} />
              ) : (
                <ExpertReviewCTA
                  caseId={caseData.id}
                  locale={locale}
                  priceCents={addonPriceCents}
                  planSlug={addonPlanSlug}
                  isSubscriber={isSubscriber}
                  standardPriceCents={standardPriceCents}
                />
              )}
            </div>
          )}
          {features.advisorModule && annotations.length > 0 && (
            <div className="mt-6">
              <AnnotationReplyCard
                caseId={caseData.id}
                annotations={annotations}
                onUpdate={() => {}}
              />
            </div>
          )}
        </>
      )}
      {tab === 'documents' && <DocumentsTab documents={documents} caseId={caseData.id} />}
      {tab === 'ai' && <AIAnalysisTab outputs={agentOutputs} />}
      {tab === 'letter' && <LetterTab draft={finalDraft} status={caseData.status} caseId={caseData.id} />}
    </div>
  )
}

function OverviewTab({ caseData, daysLeft, isUrgent, isOverdue }: { caseData: CaseDetail; daysLeft: number | null; isUrgent: boolean; isOverdue: boolean }) {
  const timeline = [
    { status: 'CREATED', label: 'Fall erstellt', icon: CheckCircle2, date: caseData.createdAt },
    { status: 'DRAFT_READY', label: 'Einspruch generiert', icon: Cpu, date: null },
    { status: 'SUBMITTED', label: 'Eingereicht', icon: Send, date: null },
    { status: 'AWAITING_RESPONSE', label: 'Warte auf Bescheid', icon: Clock, date: null },
    { status: 'CLOSED_SUCCESS', label: 'Erfolgreich abgeschlossen', icon: CheckCircle2, date: null },
  ]
  const statusOrder = ['CREATED', 'QUESTIONS', 'GENERATING', 'DRAFT_READY', 'SUBMITTED', 'AWAITING_RESPONSE', 'CLOSED_SUCCESS']
  const currentIdx = statusOrder.indexOf(caseData.status)
  const enrichedTimeline = timeline.map((s) => ({ ...s, done: statusOrder.indexOf(s.status) <= currentIdx }))

  return (
    <div className="grid sm:grid-cols-3 gap-5">
      <div className="sm:col-span-2 bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5">
        <h2 className="font-semibold text-sm text-[var(--foreground)] mb-4">Fallverlauf</h2>
        <div className="space-y-4">
          {enrichedTimeline.map((event, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${event.done ? 'bg-brand-600' : 'bg-gray-100'}`}>
                  <event.icon className={`w-3.5 h-3.5 ${event.done ? 'text-white' : 'text-gray-400'}`} />
                </div>
                {i < enrichedTimeline.length - 1 && <div className={`w-px flex-1 my-1 ${event.done ? 'bg-brand-200' : 'bg-gray-100'}`} />}
              </div>
              <div className="pb-4">
                <p className={`text-sm font-medium ${event.done ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>{event.label}</p>
                {event.date && <p className="text-xs text-[var(--muted)]">{new Date(event.date).toLocaleDateString('de-DE')}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {caseData.deadline && (
          <div className={`rounded-xl border p-4 ${isOverdue ? 'bg-red-50 border-red-200' : isUrgent ? 'bg-amber-50 border-amber-200' : 'bg-[var(--surface)] border-[var(--border)]'}`}>
            <h2 className={`font-semibold text-sm mb-1 ${isOverdue ? 'text-red-800' : isUrgent ? 'text-amber-800' : 'text-[var(--foreground)]'}`}>
              {isOverdue ? '⚠ Frist abgelaufen' : 'Einspruchsfrist'}
            </h2>
            <p className={`text-sm ${isOverdue ? 'text-red-700' : isUrgent ? 'text-amber-700' : 'text-[var(--muted)]'}`}>
              {new Date(caseData.deadline).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
            {daysLeft !== null && !isOverdue && (
              <p className={`text-xs mt-1 font-medium ${isUrgent ? 'text-amber-600' : 'text-[var(--muted)]'}`}>
                Noch {daysLeft} Tage
              </p>
            )}
          </div>
        )}
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4">
          <h2 className="font-semibold text-sm text-[var(--foreground)] mb-3">Aktionen</h2>
          <div className="space-y-2">
            <Link href={`/cases/${caseData.id}?tab=letter`} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--background-subtle)] transition-colors">
              <FileText className="w-3.5 h-3.5 text-[var(--muted)]" /> Einspruch anzeigen
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function DocumentsTab({ documents, caseId }: { documents: { id: string; name: string; type: string; createdAt: Date }[]; caseId: string }) {
  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)]">
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <h2 className="font-semibold text-sm text-[var(--foreground)]">Dokumente ({documents.length})</h2>
      </div>
      {documents.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted)]">
          <Paperclip className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Noch keine Dokumente hochgeladen</p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--border)]">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 px-5 py-3.5">
              <FileText className="w-4 h-4 text-[var(--muted)]" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)] truncate">{doc.name}</p>
                <p className="text-xs text-[var(--muted)]">{new Date(doc.createdAt).toLocaleDateString('de-DE')}</p>
              </div>
              <Download className="w-3.5 h-3.5 text-[var(--muted)]" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AIAnalysisTab({ outputs }: { outputs: { role: string; provider: string; model: string; durationMs: number; summary: string }[] }) {
  const roleConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
    drafter: { label: 'Drafter', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200', icon: FileText },
    reviewer: { label: 'Reviewer', color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200', icon: CheckCircle2 },
    factchecker: { label: 'Fact-Checker', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200', icon: ExternalLink },
    adversary: { label: 'Adversary', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200', icon: AlertTriangle },
    consolidator: { label: 'Consolidator', color: 'text-brand-700', bgColor: 'bg-brand-50 border-brand-200', icon: Cpu },
  }

  if (outputs.length === 0) {
    return (
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] text-center py-12 text-[var(--muted)]">
        <Cpu className="w-8 h-8 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Noch keine KI-Analyse für diesen Fall</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {outputs.map((output, i) => {
        const config = roleConfig[output.role] ?? { label: output.role, color: 'text-gray-700', bgColor: 'bg-gray-50 border-gray-200', icon: Cpu }
        const Icon = config.icon
        return (
          <div key={i} className={`rounded-xl border p-5 ${config.bgColor}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${config.color}`} />
                <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
                <span className="text-xs text-[var(--muted)] bg-white border border-[var(--border)] px-1.5 py-0.5 rounded-full font-mono">
                  {output.model.split('-').slice(0, 2).join('-')}
                </span>
              </div>
              <span className="text-xs text-[var(--muted)]">{(output.durationMs / 1000).toFixed(1)}s</span>
            </div>
            <p className="text-sm text-[var(--foreground)] leading-relaxed">{output.summary}</p>
          </div>
        )
      })}
    </div>
  )
}

function LetterTab({ draft, status, caseId }: { draft: string | null; status: string; caseId: string }) {
  if (!draft) {
    return (
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] text-center py-12 text-[var(--muted)]">
        <FileText className="w-8 h-8 mx-auto mb-3 opacity-30" />
        <p className="text-sm font-medium">Kein Entwurf vorhanden</p>
        <Link href="/einspruch" className="inline-flex items-center gap-1.5 mt-4 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
          KI-Generierung starten
        </Link>
      </div>
    )
  }
  return (
    <div className="space-y-4">
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] px-5 py-3 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-sm font-semibold text-[var(--foreground)]">Einspruch — finaler Entwurf</p>
          <p className="text-xs text-[var(--muted)]">Von der KI-Pipeline generiert · Bitte vor dem Einreichen prüfen</p>
        </div>
        <CaseDetailClient draft={draft} />
      </div>
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6">
        <pre className="whitespace-pre-wrap font-sans text-sm text-[var(--foreground)] leading-relaxed">{draft}</pre>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 text-xs text-amber-800 leading-relaxed">
        <strong>Hinweis:</strong> Dieser Einspruch wurde von einer KI generiert und stellt keinen Rechtsrat i.S.d. RDG dar. Bitte prüfen Sie den Text vor dem Einreichen.
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    CREATED: { label: 'Neu', className: 'bg-gray-100 text-gray-600' },
    QUESTIONS: { label: 'Rückfragen', className: 'bg-amber-50 text-amber-700' },
    GENERATING: { label: 'Generierung', className: 'bg-purple-50 text-purple-600' },
    DRAFT_READY: { label: 'Entwurf bereit', className: 'bg-blue-50 text-blue-700' },
    SUBMITTED: { label: 'Eingereicht', className: 'bg-green-50 text-green-700' },
    AWAITING_RESPONSE: { label: 'Ausstehend', className: 'bg-amber-50 text-amber-700' },
    CLOSED_SUCCESS: { label: 'Erfolgreich', className: 'bg-green-50 text-green-700' },
    REJECTED: { label: 'Abgelehnt', className: 'bg-red-50 text-red-700' },
  }
  const { label, className } = map[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' }
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${className}`}>{label}</span>
}

function useCaseLabel(useCase: string): string {
  const labels: Record<string, string> = {
    tax: 'Steuerbescheid', jobcenter: 'Jobcenter / Bürgergeld', rente: 'Rentenbescheid',
    bussgeld: 'Bußgeldbescheid', bussgeldd: 'Bußgeldbescheid', krankenversicherung: 'Krankenversicherung',
    kuendigung: 'Kündigung', miete: 'Mieterhöhung / Kaution', grundsteuer: 'Grundsteuerbescheid',
    sonstige: 'Sonstiger Bescheid',
  }
  return labels[useCase] ?? useCase
}
