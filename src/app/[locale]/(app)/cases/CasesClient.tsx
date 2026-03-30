'use client'

import { useState, useMemo } from 'react'
import { Plus, FolderOpen, ArrowRight, Search } from 'lucide-react'
import { Link } from '@/i18n/navigation'

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

interface Props {
  cases: CaseListItem[]
}

export function CasesClient({ cases }: Props) {
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  const now = new Date()

  const filtered = useMemo(() => {
    const byFilter = cases.filter((c) => matchesFilter(c, filter))
    if (!search.trim()) return byFilter
    const q = search.toLowerCase()
    return byFilter.filter(
      (c) =>
        useCaseLabel(c.useCase).toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q)
    )
  }, [cases, filter, search])

  const counts = {
    all: cases.length,
    active: cases.filter((c) => ACTIVE_STATUSES.includes(c.status)).length,
    submitted: cases.filter((c) => SUBMITTED_STATUSES.includes(c.status)).length,
    closed: cases.filter((c) => CLOSED_STATUSES.includes(c.status)).length,
  }

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: `Alle (${counts.all})` },
    { key: 'active', label: `Aktiv (${counts.active})` },
    { key: 'submitted', label: `Eingereicht (${counts.submitted})` },
    { key: 'closed', label: `Abgeschlossen (${counts.closed})` },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Meine Fälle</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            {cases.length} Fall{cases.length !== 1 ? 'fälle' : ''} gesamt
          </p>
        </div>
        <Link
          href="/einspruch"
          className="flex items-center gap-1.5 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Neue Anfrage
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Fälle durchsuchen…"
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
              <p className="font-medium">Noch keine Fälle vorhanden</p>
              <p className="text-sm mt-1 mb-6">Starten Sie Ihre erste Anfrage</p>
              <Link
                href="/einspruch"
                className="inline-flex items-center gap-1.5 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Erste Anfrage starten
              </Link>
            </>
          ) : (
            <p className="font-medium">Keine Fälle für diese Filter-Auswahl</p>
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
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--background-subtle)] transition-colors"
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${statusDot(c.status)}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[var(--foreground)]">{useCaseLabel(c.useCase)}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    #{c.id.slice(-8).toUpperCase()} · {new Date(c.createdAt).toLocaleDateString('de-DE')} ·{' '}
                    {c._count.documents} Dokument{c._count.documents !== 1 ? 'e' : ''}
                  </p>
                </div>
                {c.deadline && (
                  <p
                    className={`text-xs font-medium shrink-0 hidden sm:block ${
                      isOverdue ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-[var(--muted)]'
                    }`}
                  >
                    {isOverdue
                      ? '⚠ Frist abgelaufen'
                      : `Frist: ${new Date(c.deadline).toLocaleDateString('de-DE')}`}
                  </p>
                )}
                <StatusBadge status={c.status} />
                <ArrowRight className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function statusDot(status: string): string {
  const m: Record<string, string> = {
    CREATED: 'bg-gray-400', QUESTIONS: 'bg-amber-400', GENERATING: 'bg-purple-500',
    DRAFT_READY: 'bg-blue-500', SUBMITTED: 'bg-green-500', AWAITING_RESPONSE: 'bg-amber-500',
    CLOSED_SUCCESS: 'bg-green-500', CLOSED_PARTIAL: 'bg-yellow-500', REJECTED: 'bg-red-500',
  }
  return m[status] ?? 'bg-gray-300'
}

function StatusBadge({ status }: { status: string }) {
  const m: Record<string, { label: string; className: string }> = {
    CREATED:           { label: 'Neu',          className: 'bg-gray-100 text-gray-600' },
    QUESTIONS:         { label: 'Rückfragen',    className: 'bg-amber-50 text-amber-700' },
    GENERATING:        { label: 'Generierung',   className: 'bg-purple-50 text-purple-600' },
    DRAFT_READY:       { label: 'Entwurf bereit',className: 'bg-blue-50 text-blue-700' },
    SUBMITTED:         { label: 'Eingereicht',   className: 'bg-green-50 text-green-700' },
    AWAITING_RESPONSE: { label: 'Ausstehend',    className: 'bg-amber-50 text-amber-700' },
    CLOSED_SUCCESS:    { label: 'Erfolgreich',   className: 'bg-green-50 text-green-700' },
    CLOSED_PARTIAL:    { label: 'Teilweise',     className: 'bg-yellow-50 text-yellow-700' },
    REJECTED:          { label: 'Abgelehnt',     className: 'bg-red-50 text-red-700' },
  }
  const { label, className } = m[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${className}`}>
      {label}
    </span>
  )
}

function useCaseLabel(useCase: string): string {
  const l: Record<string, string> = {
    tax: 'Steuerbescheid', jobcenter: 'Jobcenter / Bürgergeld', rente: 'Rentenbescheid',
    bussgeld: 'Bußgeldbescheid', bussgeldd: 'Bußgeldbescheid', krankenversicherung: 'Krankenversicherung',
    kuendigung: 'Kündigung', miete: 'Mieterhöhung / Kaution', grundsteuer: 'Grundsteuerbescheid',
  }
  return l[useCase] ?? useCase
}
