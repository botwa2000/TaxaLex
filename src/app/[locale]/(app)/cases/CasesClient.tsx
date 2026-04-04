'use client'

import { useState, useMemo, useCallback } from 'react'
import { Plus, FolderOpen, ArrowRight, Search, Trash2 } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

type CaseListItem = {
  id: string
  useCase: string
  status: string
  deadline: Date | null
  createdAt: Date
  updatedAt: Date
  _count: { documents: number }
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
  CREATED: 'bg-gray-100 text-gray-600',
  UPLOADING: 'bg-blue-50 text-blue-600',
  ANALYZING: 'bg-purple-50 text-purple-600',
  QUESTIONS: 'bg-amber-50 text-amber-700',
  GENERATING: 'bg-purple-50 text-purple-600',
  DRAFT_READY: 'bg-blue-50 text-blue-700',
  SUBMITTED: 'bg-green-50 text-green-700',
  AWAITING_RESPONSE: 'bg-amber-50 text-amber-700',
  CLOSED_SUCCESS: 'bg-green-50 text-green-700',
  CLOSED_PARTIAL: 'bg-yellow-50 text-yellow-700',
  REJECTED: 'bg-red-50 text-red-700',
}

const STATUS_DOTS: Record<string, string> = {
  CREATED: 'bg-gray-400', QUESTIONS: 'bg-amber-400', GENERATING: 'bg-purple-500',
  DRAFT_READY: 'bg-blue-500', SUBMITTED: 'bg-green-500', AWAITING_RESPONSE: 'bg-amber-500',
  CLOSED_SUCCESS: 'bg-green-500', CLOSED_PARTIAL: 'bg-yellow-500', REJECTED: 'bg-red-500',
}

interface Props {
  cases: CaseListItem[]
}

export function CasesClient({ cases: initialCases }: Props) {
  const t = useTranslations('cases')
  const tUC = useTranslations('useCases')
  const router = useRouter()

  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [cases, setCases] = useState(initialCases)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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
      (c) =>
        (ucLabels[c.useCase] ?? c.useCase).toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q)
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
              onClick={() => setFilter(f.key)}
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
            const daysLeft = c.deadline
              ? Math.ceil((c.deadline.getTime() - now.getTime()) / 86400000)
              : null
            const isUrgent = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0
            const isOverdue = daysLeft !== null && daysLeft < 0

            return (
              <div key={c.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--background-subtle)] transition-colors group">
                <Link href={`/cases/${c.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOTS[c.status] ?? 'bg-gray-300'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[var(--foreground)]">{ucLabels[c.useCase] ?? c.useCase}</p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      #{c.id.slice(-8).toUpperCase()} · {new Date(c.createdAt).toLocaleDateString()} ·{' '}
                      {t('documents', { count: c._count.documents })}
                    </p>
                  </div>
                  {c.deadline && (
                    <p
                      className={`text-xs font-medium shrink-0 hidden sm:block ${
                        isOverdue ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-[var(--muted)]'
                      }`}
                    >
                      {isOverdue
                        ? t('overdueLabel')
                        : t('deadlineLabel', { date: new Date(c.deadline).toLocaleDateString() })}
                    </p>
                  )}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${STATUS_COLORS[c.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {statusLabels[c.status] ?? c.status}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
                </Link>
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
