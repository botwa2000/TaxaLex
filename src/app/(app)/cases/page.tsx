import { auth } from '@/auth'
import Link from 'next/link'
import { Plus, FolderOpen, ArrowRight, Search } from 'lucide-react'
import { DEMO_USER_ID, DEMO_CASES } from '@/lib/mockData'

type CaseListItem = {
  id: string
  useCase: string
  status: string
  deadline: Date | null
  createdAt: Date
  updatedAt: Date
  _count: { documents: number }
}

export default async function CasesPage() {
  const session = await auth()
  const userId = session!.user!.id as string

  let cases: CaseListItem[] = []

  try {
    if (userId === DEMO_USER_ID) throw new Error('demo')
    const { db } = await import('@/lib/db')
    const raw = await db.case.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, useCase: true, status: true, deadline: true,
        createdAt: true, updatedAt: true,
        _count: { select: { documents: true } },
      },
    })
    cases = raw as CaseListItem[]
  } catch {
    cases = DEMO_CASES.map((c) => ({ ...c, updatedAt: c.updatedAt })) as CaseListItem[]
  }

  const now = new Date()

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Meine Fälle</h1>
          <p className="text-sm text-[var(--muted)] mt-1">{cases.length} Fall{cases.length !== 1 ? 'fälle' : ''} gesamt</p>
        </div>
        <Link
          href="/einspruch"
          className="flex items-center gap-1.5 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Neue Anfrage
        </Link>
      </div>

      {/* Filter bar (placeholder) */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Fälle durchsuchen…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
            readOnly
            onClick={() => alert('Suche wird in einer zukünftigen Version verfügbar.')}
          />
        </div>
        <div className="flex items-center gap-1.5">
          {['Alle', 'Offen', 'Eingereicht', 'Abgeschlossen'].map((filter) => (
            <button
              key={filter}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                filter === 'Alle'
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {cases.length === 0 ? (
        <div className="bg-white rounded-xl border border-[var(--border)] text-center py-20 text-[var(--muted)]">
          <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">Noch keine Fälle vorhanden</p>
          <p className="text-sm mt-1 mb-6">Starten Sie Ihre erste Anfrage</p>
          <Link
            href="/einspruch"
            className="inline-flex items-center gap-1.5 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Erste Anfrage starten
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[var(--border)] divide-y divide-[var(--border)]">
          {cases.map((c) => {
            const daysLeft = c.deadline ? Math.ceil((c.deadline.getTime() - now.getTime()) / 86400000) : null
            const isUrgent = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0
            const isOverdue = daysLeft !== null && daysLeft < 0

            return (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                {/* Status dot */}
                <div className={`w-2 h-2 rounded-full shrink-0 ${statusColor(c.status)}`} />

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[var(--foreground)]">{useCaseLabel(c.useCase)}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    #{c.id.slice(-8).toUpperCase()} · Erstellt {new Date(c.createdAt).toLocaleDateString('de-DE')} ·{' '}
                    {c._count.documents} Dokument{c._count.documents !== 1 ? 'e' : ''}
                  </p>
                </div>

                {c.deadline && (
                  <p className={`text-xs font-medium shrink-0 ${isOverdue ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-[var(--muted)]'}`}>
                    {isOverdue ? '⚠ Frist abgelaufen' : `Frist: ${new Date(c.deadline).toLocaleDateString('de-DE')}`}
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

function statusColor(status: string): string {
  const map: Record<string, string> = {
    CREATED: 'bg-gray-400',
    QUESTIONS: 'bg-amber-400',
    GENERATING: 'bg-purple-500',
    DRAFT_READY: 'bg-blue-500',
    SUBMITTED: 'bg-green-500',
    AWAITING_RESPONSE: 'bg-amber-500',
    CLOSED_SUCCESS: 'bg-green-500',
    REJECTED: 'bg-red-500',
  }
  return map[status] ?? 'bg-gray-300'
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    CREATED: { label: 'Neu', className: 'bg-gray-100 text-gray-600' },
    QUESTIONS: { label: 'Rückfragen', className: 'bg-amber-50 text-amber-700' },
    DRAFT_READY: { label: 'Entwurf bereit', className: 'bg-blue-50 text-blue-700' },
    SUBMITTED: { label: 'Eingereicht', className: 'bg-green-50 text-green-700' },
    AWAITING_RESPONSE: { label: 'Ausstehend', className: 'bg-amber-50 text-amber-700' },
    CLOSED_SUCCESS: { label: 'Erfolgreich', className: 'bg-green-50 text-green-700' },
    REJECTED: { label: 'Abgelehnt', className: 'bg-red-50 text-red-700' },
  }
  const { label, className } = map[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${className}`}>{label}</span>
}

function useCaseLabel(useCase: string): string {
  const labels: Record<string, string> = {
    tax: 'Steuerbescheid',
    jobcenter: 'Jobcenter / Bürgergeld',
    rente: 'Rentenbescheid',
    bussgeld: 'Bußgeldbescheid',
    bussgeldd: 'Bußgeldbescheid',
    krankenversicherung: 'Krankenversicherung',
    kuendigung: 'Kündigung',
    miete: 'Mieterhöhung / Kaution',
    sonstige: 'Sonstiger Bescheid',
  }
  return labels[useCase] ?? useCase
}
