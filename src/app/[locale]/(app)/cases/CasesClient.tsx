'use client'

import { useState, useMemo, useCallback } from 'react'
import { Plus, FolderOpen, ArrowRight, Search, Trash2, Lock, AlertCircle } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'

type CaseListItem = {
  id: string
  useCase: string
  status: string
  deadline: Date | null
  createdAt: Date
  updatedAt: Date
  _count: { documents: number }
  answersCount: number
  draftLocked: boolean
  bescheidData: Record<string, unknown> | null
}

/** Extract the AI-detected document type label from bescheidData, if present */
function getDocTypeLabel(bescheidData: Record<string, unknown> | null): string | null {
  const dt = bescheidData?.docType
  if (dt && typeof dt === 'object' && 'label' in dt) {
    const label = (dt as Record<string, unknown>).label
    if (typeof label === 'string' && label.trim()) return label.trim()
  }
  return null
}

type Filter = 'all' | 'active' | 'submitted' | 'closed'

const ACTIVE_STATUSES = ['CREATED', 'UPLOADING', 'ANALYZING', 'QUESTIONS', 'GENERATING', 'DRAFT_READY']
const SUBMITTED_STATUSES = ['SUBMITTED', 'AWAITING_RESPONSE']
const CLOSED_STATUSES = ['CLOSED_SUCCESS', 'CLOSED_PARTIAL', 'REJECTED']

function matchesFilter(c: CaseListItem, filter: Filter): boolean {
  if (filter === 'all') return true
  if (filter === 'active') return ACTIVE_STATUSES.includes(c.status)
  if (filter === 'submitted') return SUBMITTED_STATUSES.includes(c.status)
  if (filter === 'closed') return CLOSED_STATUSES.includes(c.status)
  return true
}

const STATUS_COLORS: Record<string, string> = {
  CREATED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  UPLOADING: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
  ANALYZING: 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400',
  QUESTIONS: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  GENERATING: 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400',
  DRAFT_READY: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  SUBMITTED: 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  AWAITING_RESPONSE: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  CLOSED_SUCCESS: 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  CLOSED_PARTIAL: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400',
  REJECTED: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400',
}

const STATUS_DOTS: Record<string, string> = {
  CREATED: 'bg-gray-400', QUESTIONS: 'bg-amber-400', GENERATING: 'bg-purple-500',
  DRAFT_READY: 'bg-blue-500', SUBMITTED: 'bg-green-500', AWAITING_RESPONSE: 'bg-amber-500',
  CLOSED_SUCCESS: 'bg-green-500', CLOSED_PARTIAL: 'bg-yellow-500', REJECTED: 'bg-red-500',
}

/** Returns the href for the per-row CTA, or null if no CTA should be shown */
function rowCtaHref(c: CaseListItem): string | null {
  if (c.status === 'QUESTIONS') return `/einspruch?caseId=${c.id}`
  if (c.status === 'GENERATING') return `/einspruch?caseId=${c.id}`
  if (c.status === 'DRAFT_READY' && c.draftLocked) return `/billing?caseId=${c.id}`
  if (c.status === 'DRAFT_READY' && !c.draftLocked) return `/cases/${c.id}?tab=letter`
  if (c.status === 'ADVISOR_REVIEW') return `/cases/${c.id}`
  if (SUBMITTED_STATUSES.includes(c.status)) return `/cases/${c.id}`
  if (CLOSED_STATUSES.includes(c.status)) return `/cases/${c.id}`
  return null
}

function rowCtaLabel(c: CaseListItem, t: (key: string) => string): string {
  if (c.status === 'QUESTIONS') return t('resume')
  if (c.status === 'GENERATING') return t('retryGeneration')
  if (c.status === 'DRAFT_READY' && c.draftLocked) return t('unlockDraft')
  if (c.status === 'DRAFT_READY') return t('resume')
  if (CLOSED_STATUSES.includes(c.status)) return t('viewResult')
  return t('viewDetails')
}

function rowCtaClass(c: CaseListItem): string {
  if (c.status === 'QUESTIONS' || c.status === 'GENERATING') {
    return 'border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-400 dark:bg-amber-950/30'
  }
  if (c.status === 'DRAFT_READY') {
    return 'border-brand-300 text-brand-700 bg-brand-50 hover:bg-brand-100 dark:border-brand-700 dark:text-brand-400 dark:bg-brand-950/30'
  }
  return 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)]'
}

function DeadlineBadge({ deadline, t }: { deadline: Date; t: (key: string, opts?: Record<string, string | number | Date>) => string }) {
  const now = new Date()
  const days = Math.ceil((deadline.getTime() - now.getTime()) / 86400000)
  if (days < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 shrink-0">
        <AlertCircle className="w-2.5 h-2.5" />
        {t('overdueLabel')}
      </span>
    )
  }
  if (days <= 3) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 animate-pulse shrink-0">
        {days}d !
      </span>
    )
  }
  if (days <= 7) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 shrink-0">
        {days}d
      </span>
    )
  }
  if (days <= 14) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400 shrink-0">
        {days}d
      </span>
    )
  }
  return (
    <span className="text-xs text-[var(--muted)] shrink-0">
      {t('deadlineLabel', { date: new Date(deadline).toLocaleDateString() })}
    </span>
  )
}

interface Props {
  cases: CaseListItem[]
}

export function CasesClient({ cases: initialCases }: Props) {
  const t = useTranslations('cases')
  const tUC = useTranslations('useCases')
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialise filter from URL ?filter= param so dashboard stat card links work
  const [filter, setFilter] = useState<Filter>(() => {
    const f = searchParams.get('filter')
    return (['active', 'submitted', 'closed'] as Filter[]).includes(f as Filter)
      ? (f as Filter)
      : 'all'
  })
  const [search, setSearch] = useState('')
  const [cases, setCases] = useState(initialCases)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function handleFilterChange(newFilter: Filter) {
    setFilter(newFilter)
    // Sync URL without triggering navigation so the filter survives back-button
    const url = new URL(window.location.href)
    if (newFilter === 'all') url.searchParams.delete('filter')
    else url.searchParams.set('filter', newFilter)
    window.history.replaceState(null, '', url.toString())
  }

  const handleDelete = useCallback(async (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(t('deleteConfirm'))) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/cases/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setCases((prev) => prev.filter((c) => c.id !== id))
        router.refresh()
      }
    } finally {
      setDeletingId(null)
    }
  }, [t, router])

  const now = new Date()

  // Detect any case that is overdue or ≤3 days away for the urgency banner
  const urgentCases = cases.filter((c) => {
    if (!c.deadline) return false
    const days = Math.ceil((c.deadline.getTime() - now.getTime()) / 86400000)
    return days <= 3
  })

  // Pre-build label maps once
  const statusLabels: Record<string, string> = {
    CREATED: t('status.CREATED'), UPLOADING: t('status.UPLOADING'),
    ANALYZING: t('status.ANALYZING'), QUESTIONS: t('status.QUESTIONS'),
    GENERATING: t('status.GENERATING'), DRAFT_READY: t('status.DRAFT_READY'),
    SUBMITTED: t('status.SUBMITTED'), AWAITING_RESPONSE: t('status.AWAITING_RESPONSE'),
    CLOSED_SUCCESS: t('status.CLOSED_SUCCESS'), CLOSED_PARTIAL: t('status.CLOSED_PARTIAL'),
    REJECTED: t('status.REJECTED'),
  }
  const ucLabels: Record<string, string> = {
    tax: tUC('tax'), jobcenter: tUC('jobcenter'), rente: tUC('rente'),
    bussgeld: tUC('bussgeld'), bussgeldd: tUC('bussgeldd'),
    krankenversicherung: tUC('krankenversicherung'), kuendigung: tUC('kuendigung'),
    miete: tUC('miete'), grundsteuer: tUC('grundsteuer'), sonstige: tUC('sonstige'),
  }

  const filtered = useMemo(() => {
    const byFilter = cases.filter((c) => matchesFilter(c, filter))
    if (!search.trim()) return byFilter
    const q = search.toLowerCase()
    return byFilter.filter(
      (c) => {
        const title = getDocTypeLabel(c.bescheidData) ?? ucLabels[c.useCase] ?? c.useCase
        return (
          title.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.status.toLowerCase().includes(q)
        )
      }
    )
    // ucLabels is stable — built from translations, not a dependency that changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cases, filter, search])

  const counts = {
    all: cases.length,
    active: cases.filter((c) => ACTIVE_STATUSES.includes(c.status)).length,
    submitted: cases.filter((c) => SUBMITTED_STATUSES.includes(c.status)).length,
    closed: cases.filter((c) => CLOSED_STATUSES.includes(c.status)).length,
  }

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: t('filter.all', { count: counts.all }) },
    { key: 'active', label: t('filter.active', { count: counts.active }) },
    { key: 'submitted', label: t('filter.submitted', { count: counts.submitted }) },
    { key: 'closed', label: t('filter.closed', { count: counts.closed }) },
  ]

  return (
    <div>
      {/* Urgency banner — shown when any active case has ≤3 days left or is overdue */}
      {urgentCases.length > 0 && (
        <div className="mb-5 flex items-start gap-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-300">
            {t('urgentBanner', { count: urgentCases.length })}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{t('title')}</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            {t('subtitle', { count: cases.length })}
          </p>
        </div>
        <Link
          href="/einspruch"
          className="flex items-center gap-1.5 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('newCase')}
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)]" />
          <input
            type="text"
            placeholder={t('search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => handleFilterChange(f.key)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                filter === f.key
                  ? 'bg-brand-600 text-white'
                  : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] text-center py-20 text-[var(--muted)]">
          <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
          {cases.length === 0 ? (
            <>
              <p className="font-medium">{t('empty')}</p>
              <p className="text-sm mt-1 mb-6">{t('emptyHint')}</p>
              <Link
                href="/einspruch"
                className="inline-flex items-center gap-1.5 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('startFirst')}
              </Link>
            </>
          ) : (
            <p className="font-medium">{t('noResults')}</p>
          )}
        </div>
      ) : (
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] divide-y divide-[var(--border)]">
          {filtered.map((c) => {
            const ctaHref = rowCtaHref(c)

            return (
              <div key={c.id} className="flex items-center gap-3 px-5 py-4 hover:bg-[var(--background-subtle)] transition-colors group">
                <Link href={`/cases/${c.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOTS[c.status] ?? 'bg-gray-300'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[var(--foreground)]">
                      {getDocTypeLabel(c.bescheidData) ?? ucLabels[c.useCase] ?? c.useCase}
                    </p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      #{c.id.slice(-8).toUpperCase()} · {new Date(c.createdAt).toLocaleDateString()} ·{' '}
                      {t('documents', { count: c._count.documents })}
                      {c.answersCount > 0 && (
                        <> · {t('answersCount', { count: c.answersCount })}</>
                      )}
                    </p>
                  </div>
                  {c.deadline && (
                    <div className="hidden sm:block">
                      <DeadlineBadge deadline={new Date(c.deadline)} t={t} />
                    </div>
                  )}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${STATUS_COLORS[c.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {statusLabels[c.status] ?? c.status}
                  </span>
                </Link>

                {/* Contextual CTA per row */}
                {ctaHref && (
                  <Link
                    href={ctaHref}
                    onClick={(e) => e.stopPropagation()}
                    className={`hidden sm:flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors shrink-0 ${rowCtaClass(c)}`}
                  >
                    {c.status === 'DRAFT_READY' && c.draftLocked && <Lock className="w-3 h-3" />}
                    {rowCtaLabel(c, (k) => t(k as Parameters<typeof t>[0]))}
                    {!(c.status === 'DRAFT_READY' && c.draftLocked) && <ArrowRight className="w-3 h-3" />}
                  </Link>
                )}

                <button
                  onClick={(e) => handleDelete(e, c.id)}
                  disabled={deletingId === c.id}
                  title={t('deleteCase')}
                  className="p-1.5 text-[var(--muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0 disabled:opacity-30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
