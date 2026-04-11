import { auth } from '@/auth'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, FileText, Cpu, MessageSquare, CheckCircle2, Clock, AlertTriangle,
  Paperclip, User, ExternalLink, Send, Trophy, Loader2, Lock, ArrowRight,
} from 'lucide-react'
import {
  DEMO_USER_ID, DEMO_CASES, DEMO_DOCUMENTS, DEMO_AGENT_OUTPUTS, DEMO_FINAL_DRAFT,
} from '@/lib/mockData'
import { CaseDetailClient } from './CaseDetailClient'
import { HandoffRequestForm } from '@/components/client/HandoffRequestForm'
import { ExpertReviewCTA } from '@/components/client/ExpertReviewCTA'
import { AnnotationReplyCard } from '@/components/client/AnnotationReplyCard'
import { UnlockDraftButton } from '@/components/client/UnlockDraftButton'
import { features } from '@/config/features'
import { Link } from '@/i18n/navigation'
import type { AnnotationData } from '@/types'
import { getTranslations } from 'next-intl/server'

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
  userAnswers: Record<string, string> | null
  draftLocked: boolean
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

  const t = await getTranslations('cases')

  let caseData: CaseDetail | null = null
  let documents: { id: string; name: string; type: string; createdAt: Date }[] = []
  let agentOutputs: { role: string; provider: string; model: string; durationMs: number; summary: string }[] = []
  let finalDraft: string | null = null
  let annotations: AnnotationData[] = []
  let hasActiveAssignment = false
  let hasActiveAddon = false
  let addonPriceCents = 9900
  let addonPlanSlug: 'expert-review' | 'expert-review-subscriber' = 'expert-review'
  let isSubscriber = false
  let standardPriceCents = 9900
  let hasAccess = false

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

    agentOutputs = dbOutputs.map((o) => ({
      role: o.role,
      provider: o.provider,
      model: o.model,
      durationMs: o.durationMs ?? 0,
      summary: extractOutputSummary(o.content),
    }))

    const finalOutput = dbOutputs.find((o) => o.isFinal) ?? dbOutputs.find((o) => o.role === 'consolidator')
    finalDraft = finalOutput?.content ?? null

    // Check if user can unlock locked drafts with their current balance
    const userAccess = await db.user.findUnique({
      where: { id: userId },
      select: { creditBalance: true, subscription: { select: { status: true } } },
    })
    hasAccess = (userAccess?.creditBalance ?? 0) > 0 ||
      ['ACTIVE', 'TRIALING'].includes(userAccess?.subscription?.status ?? '')

    if (features.advisorModule) {
      const addon = await db.addonPurchase.findFirst({
        where: { userId, caseId: id, addonType: 'EXPERT_REVIEW', status: 'ACTIVE' },
      })
      hasActiveAddon = !!addon

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
    caseData = { ...(found as unknown as CaseDetail), draftLocked: false }
    documents = DEMO_DOCUMENTS[id] ?? []
    agentOutputs = DEMO_AGENT_OUTPUTS[id] ?? []
    finalDraft = agentOutputs.length > 0 ? DEMO_FINAL_DRAFT : null
  }

  if (!caseData) notFound()

  const now = new Date()
  const daysLeft = caseData.deadline ? Math.ceil((caseData.deadline.getTime() - now.getTime()) / 86400000) : null
  const isUrgent = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0
  const isOverdue = daysLeft !== null && daysLeft < 0

  const answersCount = Object.keys(caseData.userAnswers ?? {}).length
  const fieldsCount = Object.keys(caseData.bescheidData ?? {}).length

  const tabs = [
    { id: 'overview', label: 'Übersicht', icon: MessageSquare },
    { id: 'documents', label: `${t('detail.documentsTitle')} (${documents.length})`, icon: Paperclip },
    { id: 'ai', label: `${t('detail.aiTitle')} (${agentOutputs.length})`, icon: Cpu },
    { id: 'letter', label: 'Einspruch', icon: FileText },
  ]

  return (
    <div>
      <Link href="/cases" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-5">
        <ArrowLeft className="w-4 h-4" />
        {t('detail.back')}
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
              {t('caseId')} #{caseData.id.slice(-8).toUpperCase()} · {t('createdAt')}{' '}
              {new Date(caseData.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
            {caseData.deadline && (
              <div className={`inline-flex items-center gap-1.5 mt-2 text-xs font-medium px-2.5 py-1 rounded-full ${isOverdue ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400' : isUrgent ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' : 'bg-[var(--background-subtle)] text-[var(--muted)]'}`}>
                {isOverdue || isUrgent ? <AlertTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                {isOverdue
                  ? t('detail.overdueLabel')
                  : isUrgent
                  ? t('detail.deadlineUrgent', { days: daysLeft! })
                  : t('detail.deadlineLabel', { date: new Date(caseData.deadline).toLocaleDateString('de-DE') })}
              </div>
            )}
          </div>

          {/* Header action — one definitive action per status */}
          {caseData.status === 'QUESTIONS' && (
            <Link
              href={`/einspruch?caseId=${caseData.id}`}
              className="flex items-center gap-1.5 text-sm bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors font-semibold shrink-0"
            >
              <ArrowRight className="w-4 h-4" />
              {t('detail.resumeCase')}
            </Link>
          )}
          {caseData.status === 'GENERATING' && (
            <div className="flex items-center gap-2 text-sm text-[var(--muted)] shrink-0">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('detail.generating')}
            </div>
          )}
          {caseData.status === 'DRAFT_READY' && !caseData.draftLocked && finalDraft && (
            <CaseDetailClient caseId={caseData.id} draft={finalDraft} status={caseData.status} />
          )}
          {caseData.status === 'DRAFT_READY' && caseData.draftLocked && (
            hasAccess
              ? <UnlockDraftButton caseId={caseData.id} locale={locale} />
              : <Link
                  href={`/billing?caseId=${caseData.id}`}
                  className="flex items-center gap-1.5 text-sm bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors font-semibold shrink-0"
                >
                  <Lock className="w-4 h-4" />
                  {t('detail.unlockDraft')}
                </Link>
          )}
          {(caseData.status === 'APPROVED' || caseData.status === 'ADVISOR_REVIEW') && finalDraft && (
            <CaseDetailClient caseId={caseData.id} draft={finalDraft} status={caseData.status} />
          )}
          {caseData.status === 'SUBMITTED' && (
            <span className="flex items-center gap-1.5 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 text-sm font-medium px-3 py-1.5 rounded-lg shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" /> {t('detail.statusSubmitted')}
            </span>
          )}
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 mb-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1.5 w-fit overflow-x-auto">
        {tabs.map((tabItem) => (
          <Link
            key={tabItem.id}
            href={`/cases/${caseData!.id}?tab=${tabItem.id}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${tab === tabItem.id ? 'bg-brand-600 text-white' : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)]'}`}
          >
            <tabItem.icon className="w-3.5 h-3.5" />
            {tabItem.label}
          </Link>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <>
          <OverviewTab
            caseData={caseData}
            daysLeft={daysLeft}
            isUrgent={isUrgent}
            isOverdue={isOverdue}
            docsCount={documents.length}
            answersCount={answersCount}
            fieldsCount={fieldsCount}
            locale={locale}
            hasAccess={hasAccess}
            t={t}
          />
          {features.advisorModule && caseData.status === 'DRAFT_READY' && !caseData.draftLocked && !hasActiveAssignment && (
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
      {tab === 'documents' && <DocumentsTab documents={documents} t={t} />}
      {tab === 'ai' && <AIAnalysisTab outputs={agentOutputs} t={t} />}
      {tab === 'letter' && <LetterTab draft={finalDraft} status={caseData.status} caseId={caseData.id} draftLocked={caseData.draftLocked} locale={locale} hasAccess={hasAccess} t={t} />}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

type Translator = Awaited<ReturnType<typeof getTranslations<'cases'>>>

function OverviewTab({
  caseData,
  daysLeft,
  isUrgent,
  isOverdue,
  docsCount,
  answersCount,
  fieldsCount,
  locale,
  hasAccess,
  t,
}: {
  caseData: CaseDetail
  daysLeft: number | null
  isUrgent: boolean
  isOverdue: boolean
  docsCount: number
  answersCount: number
  fieldsCount: number
  locale: string
  hasAccess: boolean
  t: Translator
}) {
  const timeline = [
    { status: 'CREATED',           label: t('detail.created'),           icon: CheckCircle2 },
    { status: 'ANALYZING',         label: t('detail.analyzed'),          icon: Cpu },
    { status: 'QUESTIONS',         label: t('detail.questionsAnswered'), icon: MessageSquare },
    { status: 'DRAFT_READY',       label: t('detail.draftGenerated'),   icon: FileText },
    { status: 'SUBMITTED',         label: t('detail.submitted'),        icon: Send },
    { status: 'AWAITING_RESPONSE', label: t('detail.awaitingResponse'), icon: Clock },
    { status: 'CLOSED_SUCCESS',    label: t('detail.closedSuccess'),    icon: Trophy },
  ]
  const statusOrder = ['CREATED', 'UPLOADING', 'ANALYZING', 'QUESTIONS', 'GENERATING', 'DRAFT_READY', 'SUBMITTED', 'AWAITING_RESPONSE', 'CLOSED_SUCCESS']
  const currentIdx = statusOrder.indexOf(caseData.status)
  const enrichedTimeline = timeline.map((s) => ({ ...s, done: statusOrder.indexOf(s.status) <= currentIdx }))

  return (
    <div className="space-y-5">
      {/* Mini stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 text-center">
          <Paperclip className="w-5 h-5 mx-auto mb-1 text-[var(--muted)]" />
          <p className="text-2xl font-black text-[var(--foreground)] leading-none">{docsCount}</p>
          <p className="text-xs text-[var(--muted)] mt-1">{t('stats.documents')}</p>
        </div>
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 text-center">
          <MessageSquare className="w-5 h-5 mx-auto mb-1 text-[var(--muted)]" />
          <p className="text-2xl font-black text-[var(--foreground)] leading-none">{answersCount}</p>
          <p className="text-xs text-[var(--muted)] mt-1">{t('stats.answers')}</p>
        </div>
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 text-center">
          <FileText className="w-5 h-5 mx-auto mb-1 text-[var(--muted)]" />
          <p className="text-2xl font-black text-[var(--foreground)] leading-none">{fieldsCount}</p>
          <p className="text-xs text-[var(--muted)] mt-1">{t('stats.fields')}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        {/* Timeline */}
        <div className="sm:col-span-2 bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5">
          <h2 className="font-semibold text-sm text-[var(--foreground)] mb-4">{t('detail.timeline')}</h2>
          <div className="space-y-4">
            {enrichedTimeline.map((event, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${event.done ? 'bg-brand-600' : 'bg-[var(--background-subtle)]'}`}>
                    <event.icon className={`w-3.5 h-3.5 ${event.done ? 'text-white' : 'text-[var(--muted)]'}`} />
                  </div>
                  {i < enrichedTimeline.length - 1 && <div className={`w-px flex-1 my-1 ${event.done ? 'bg-brand-200 dark:bg-brand-800' : 'bg-[var(--border)]'}`} />}
                </div>
                <div className="pb-4">
                  <p className={`text-sm font-medium ${event.done ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>{event.label}</p>
                  {event.status === 'CREATED' && (
                    <p className="text-xs text-[var(--muted)]">{new Date(caseData.createdAt).toLocaleDateString('de-DE')}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* Deadline box */}
          {caseData.deadline && (
            <div className={`rounded-xl border p-4 ${isOverdue ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900' : isUrgent ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900' : 'bg-[var(--surface)] border-[var(--border)]'}`}>
              <h2 className={`font-semibold text-sm mb-1 ${isOverdue ? 'text-red-800 dark:text-red-400' : isUrgent ? 'text-amber-800 dark:text-amber-400' : 'text-[var(--foreground)]'}`}>
                {isOverdue ? t('overdueLabel') : 'Einspruchsfrist'}
              </h2>
              <p className={`text-sm ${isOverdue ? 'text-red-700 dark:text-red-400' : isUrgent ? 'text-amber-700 dark:text-amber-400' : 'text-[var(--muted)]'}`}>
                {new Date(caseData.deadline).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
              {daysLeft !== null && !isOverdue && (
                <p className={`text-xs mt-1 font-medium ${isUrgent ? 'text-amber-600 dark:text-amber-400' : 'text-[var(--muted)]'}`}>
                  {t('detail.deadlineDaysLeft', { days: daysLeft })}
                </p>
              )}
            </div>
          )}

          {/* Actions box — shows status-specific guidance; header has the primary action button */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4">
            <h2 className="font-semibold text-sm text-[var(--foreground)] mb-3">{t('detail.actions')}</h2>
            <div className="space-y-2">
              <Link
                href={`/cases/${caseData.id}?tab=letter`}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--background-subtle)] transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-[var(--muted)]" />
                {t('detail.viewLetter')}
              </Link>
              {caseData.status === 'QUESTIONS' && (
                <Link
                  href={`/einspruch?caseId=${caseData.id}`}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-400 transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  {t('detail.resumeCase')}
                </Link>
              )}
              {caseData.status === 'DRAFT_READY' && caseData.draftLocked && (
                hasAccess
                  ? <UnlockDraftButton caseId={caseData.id} locale={locale} variant="inline" />
                  : <Link
                      href={`/billing?caseId=${caseData.id}`}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-brand-300 bg-brand-50 text-brand-700 hover:bg-brand-100 dark:border-brand-700 dark:bg-brand-950/30 dark:text-brand-400 transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      {t('detail.unlockDraft')}
                    </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DocumentsTab({
  documents,
  t,
}: {
  documents: { id: string; name: string; type: string; createdAt: Date }[]
  t: Translator
}) {
  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)]">
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <h2 className="font-semibold text-sm text-[var(--foreground)]">{t('detail.documentsTitle')} ({documents.length})</h2>
      </div>
      {documents.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted)]">
          <Paperclip className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{t('detail.noDocuments')}</p>
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AIAnalysisTab({
  outputs,
  t,
}: {
  outputs: { role: string; provider: string; model: string; durationMs: number; summary: string }[]
  t: Translator
}) {
  const roleConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
    drafter: { label: 'Drafter', color: 'text-blue-700 dark:text-blue-400', bgColor: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900', icon: FileText },
    reviewer: { label: 'Reviewer', color: 'text-purple-700 dark:text-purple-400', bgColor: 'bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-900', icon: CheckCircle2 },
    factchecker: { label: 'Fact-Checker', color: 'text-green-700 dark:text-green-400', bgColor: 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900', icon: ExternalLink },
    adversary: { label: 'Adversary', color: 'text-red-700 dark:text-red-400', bgColor: 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900', icon: AlertTriangle },
    consolidator: { label: 'Consolidator', color: 'text-brand-700 dark:text-brand-400', bgColor: 'bg-brand-50 border-brand-200 dark:bg-brand-950/20 dark:border-brand-900', icon: Cpu },
  }

  if (outputs.length === 0) {
    return (
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] text-center py-12 text-[var(--muted)]">
        <Cpu className="w-8 h-8 mx-auto mb-3 opacity-30" />
        <p className="text-sm">{t('detail.noAiOutputs')}</p>
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
                <span className="text-xs text-[var(--muted)] bg-[var(--surface)] border border-[var(--border)] px-1.5 py-0.5 rounded-full font-mono">
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

function LetterTab({
  draft,
  status,
  caseId,
  draftLocked,
  locale,
  hasAccess,
  t,
}: {
  draft: string | null
  status: string
  caseId: string
  draftLocked: boolean
  locale: string
  hasAccess: boolean
  t: Translator
}) {
  const isInProgress = ['CREATED', 'UPLOADING', 'ANALYZING'].includes(status)
  const isGenerating = status === 'GENERATING'

  if (!draft || (status === 'DRAFT_READY' && draftLocked)) {
    return (
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] text-center py-16 text-[var(--muted)]">
        <FileText className="w-10 h-10 mx-auto mb-4 opacity-30" />
        <p className="font-medium text-[var(--foreground)]">{t('detail.noDraft')}</p>
        {isGenerating ? (
          <div className="flex items-center justify-center gap-2 mt-3 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{t('detail.generatingHint')}</span>
          </div>
        ) : status === 'DRAFT_READY' && draftLocked ? (
          <div className="mt-4">
            <p className="text-sm text-[var(--muted)] max-w-sm mx-auto">{t('detail.draftLockedHint')}</p>
            {hasAccess
              ? <UnlockDraftButton caseId={caseId} locale={locale} />
              : <Link
                  href={`/billing?caseId=${caseId}`}
                  className="inline-flex items-center gap-1.5 mt-4 bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-700 transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  {t('detail.unlockDraft')}
                </Link>
            }
          </div>
        ) : status === 'QUESTIONS' ? (
          <div className="mt-4">
            <p className="text-sm text-[var(--muted)] max-w-sm mx-auto">{t('detail.questionsHint')}</p>
            <Link
              href={`/einspruch?caseId=${caseId}`}
              className="inline-flex items-center gap-1.5 mt-4 bg-amber-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-amber-600 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              {t('detail.resumeCase')}
            </Link>
          </div>
        ) : isInProgress ? (
          <p className="text-sm mt-2">{t('detail.analysisPending')}</p>
        ) : (
          <Link
            href="/einspruch"
            className="inline-flex items-center gap-1.5 mt-4 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            {t('detail.startGeneration')}
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] px-5 py-3 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-sm font-semibold text-[var(--foreground)]">{t('detail.letterTitle')}</p>
          <p className="text-xs text-[var(--muted)]">{t('detail.letterSubtitle')}</p>
        </div>
        <CaseDetailClient caseId={caseId} draft={draft} status={status} />
      </div>
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6">
        <pre className="whitespace-pre-wrap font-sans text-sm text-[var(--foreground)] leading-relaxed">{draft}</pre>
      </div>
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl px-5 py-3.5 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
        <strong>Hinweis:</strong> {t('detail.legalNote')}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    CREATED:           { label: 'Neu',           className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    UPLOADING:         { label: 'Upload',         className: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400' },
    ANALYZING:         { label: 'Analyse',        className: 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400' },
    QUESTIONS:         { label: 'Rückfragen',     className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' },
    GENERATING:        { label: 'Generierung',    className: 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400' },
    DRAFT_READY:       { label: 'Entwurf bereit', className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' },
    SUBMITTED:         { label: 'Eingereicht',    className: 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400' },
    AWAITING_RESPONSE: { label: 'Ausstehend',     className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' },
    CLOSED_SUCCESS:    { label: 'Erfolgreich',    className: 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400' },
    CLOSED_PARTIAL:    { label: 'Teilweise',      className: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400' },
    REJECTED:          { label: 'Abgelehnt',      className: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400' },
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
