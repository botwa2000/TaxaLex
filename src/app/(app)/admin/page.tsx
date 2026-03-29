import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { DEMO_USERS, DEMO_CASES } from '@/lib/mockData'
import { Users, FolderOpen, TrendingUp, Shield, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'

export default async function AdminPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/dashboard')

  // Stats
  const totalUsers = DEMO_USERS.length
  const totalCases = DEMO_CASES.length
  const openCases = DEMO_CASES.filter((c) =>
    ['CREATED', 'QUESTIONS', 'GENERATING', 'DRAFT_READY'].includes(c.status)
  ).length
  const submittedCases = DEMO_CASES.filter((c) =>
    ['SUBMITTED', 'AWAITING_RESPONSE'].includes(c.status)
  ).length

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
          <Shield className="w-4 h-4 text-brand-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Admin-Panel</h1>
          <p className="text-sm text-[var(--muted)]">System-Übersicht und Benutzerverwaltung</p>
        </div>
      </div>

      {/* System stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Users, label: 'Nutzer gesamt', value: totalUsers, color: 'bg-blue-50 text-blue-600' },
          { icon: FolderOpen, label: 'Fälle gesamt', value: totalCases, color: 'bg-purple-50 text-purple-600' },
          { icon: Clock, label: 'Offene Fälle', value: openCases, color: 'bg-amber-50 text-amber-600' },
          { icon: CheckCircle2, label: 'Eingereicht', value: submittedCases, color: 'bg-green-50 text-green-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-[var(--border)] p-4">
            <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">{s.value}</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl border border-[var(--border)] mb-6">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="font-semibold text-sm text-[var(--foreground)]">Nutzer ({DEMO_USERS.length})</h2>
          <button
            onClick={() => alert('Nutzer einladen: kommt in Kürze.')}
            className="text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            + Nutzer einladen
          </button>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {DEMO_USERS.map((user) => (
            <div key={user.id} className="flex items-center gap-3 px-5 py-3.5">
              <div className="w-8 h-8 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                {(user.name || user.email).slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)]">{user.name}</p>
                <p className="text-xs text-[var(--muted)]">{user.email} · {user.cases} Fall{user.cases !== 1 ? 'fälle' : ''}</p>
              </div>
              <RoleBadge role={user.role} />
              <p className="text-xs text-[var(--muted)] hidden sm:block shrink-0">
                Seit {new Date(user.createdAt).toLocaleDateString('de-DE')}
              </p>
              <button
                onClick={() => alert(`Nutzer ${user.name} verwalten: kommt in Kürze.`)}
                className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)] px-2.5 py-1 rounded-lg transition-colors"
              >
                Verwalten
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* All cases table */}
      <div className="bg-white rounded-xl border border-[var(--border)]">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h2 className="font-semibold text-sm text-[var(--foreground)]">Alle Fälle ({DEMO_CASES.length})</h2>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {DEMO_CASES.map((c) => (
            <div key={c.id} className="flex items-center gap-3 px-5 py-3.5">
              <div className={`w-2 h-2 rounded-full shrink-0 ${statusColor(c.status)}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)]">{useCaseLabel(c.useCase)}</p>
                <p className="text-xs text-[var(--muted)]">
                  #{c.id.slice(-6).toUpperCase()} · {new Date(c.createdAt).toLocaleDateString('de-DE')}
                </p>
              </div>
              <StatusBadge status={c.status} />
              <button
                onClick={() => alert(`Fall ${c.id} als Admin verwalten: kommt in Kürze.`)}
                className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)] px-2.5 py-1 rounded-lg transition-colors"
              >
                Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    ADMIN: 'bg-red-50 text-red-700',
    PRO: 'bg-brand-50 text-brand-700',
    ADVISOR: 'bg-purple-50 text-purple-700',
    USER: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${map[role] ?? 'bg-gray-100 text-gray-600'}`}>
      {role}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    DRAFT_READY: { label: 'Entwurf', className: 'bg-blue-50 text-blue-700' },
    SUBMITTED: { label: 'Eingereicht', className: 'bg-green-50 text-green-700' },
    AWAITING_RESPONSE: { label: 'Ausstehend', className: 'bg-amber-50 text-amber-700' },
    CLOSED_SUCCESS: { label: 'Erfolgreich', className: 'bg-green-50 text-green-700' },
    QUESTIONS: { label: 'Rückfragen', className: 'bg-amber-50 text-amber-700' },
  }
  const { label, className } = map[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${className}`}>{label}</span>
}

function statusColor(s: string) {
  return { DRAFT_READY: 'bg-blue-500', SUBMITTED: 'bg-green-500', AWAITING_RESPONSE: 'bg-amber-500', CLOSED_SUCCESS: 'bg-green-500', QUESTIONS: 'bg-amber-400' }[s] ?? 'bg-gray-300'
}

function useCaseLabel(u: string) {
  return { tax: 'Steuerbescheid', jobcenter: 'Jobcenter', krankenversicherung: 'Krankenversicherung', rente: 'Rentenbescheid', miete: 'Mieterhöhung' }[u] ?? u
}
