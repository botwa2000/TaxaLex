import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { DEMO_CLIENTS, DEMO_CLIENT_CASES, getAdvisorStats } from '@/lib/mockData'
import { Users, FileText, Clock, CheckCircle2, Plus, LayoutDashboard } from 'lucide-react'
import { Link } from '@/i18n/navigation'

const USE_CASE_LABELS: Record<string, string> = {
  tax: 'Steuerbescheid',
  jobcenter: 'Jobcenter',
  rente: 'Rentenbescheid',
  bussgeld: 'Bußgeldbescheid',
  krankenversicherung: 'Krankenversicherung',
  kuendigung: 'Kündigung',
  miete: 'Mieterhöhung',
  grundsteuer: 'Grundsteuer',
}

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  DRAFT_READY: { label: 'Entwurf bereit', className: 'bg-blue-50 text-blue-700' },
  SUBMITTED: { label: 'Eingereicht', className: 'bg-green-50 text-green-700' },
  AWAITING_RESPONSE: { label: 'Ausstehend', className: 'bg-amber-50 text-amber-700' },
  QUESTIONS: { label: 'Rückfragen', className: 'bg-amber-50 text-amber-700' },
  CLOSED_SUCCESS: { label: 'Erfolgreich', className: 'bg-green-50 text-green-700' },
  CREATING: { label: 'Wird erstellt', className: 'bg-gray-100 text-gray-600' },
}

export default async function AdvisorDashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')
  if (!['ADVISOR', 'LAWYER', 'ADMIN'].includes(session.user?.role ?? '')) {
    redirect('/dashboard')
  }

  const advisorId = session.user?.id ?? 'demo_advisor_001'
  const stats = getAdvisorStats(advisorId)
  const recentCases = DEMO_CLIENT_CASES.slice(0, 5)
  const clientMap = Object.fromEntries(DEMO_CLIENTS.map((c) => [c.id, c]))

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-brand-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Berater-Dashboard</h1>
            <p className="text-sm text-[var(--muted)]">Willkommen, {session.user?.name}</p>
          </div>
        </div>
        <Link
          href="/einspruch"
          className="flex items-center gap-1.5 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Neuer Einspruch
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Users, label: 'Mandanten', value: stats.totalClients, color: 'bg-blue-50 text-blue-600' },
          { icon: FileText, label: 'Fälle gesamt', value: stats.totalCases, color: 'bg-purple-50 text-purple-600' },
          { icon: Clock, label: 'Aktive Fälle', value: stats.activeCases, color: 'bg-amber-50 text-amber-600' },
          { icon: CheckCircle2, label: 'Eingereicht', value: stats.submittedCases, color: 'bg-green-50 text-green-600' },
        ].map((s) => (
          <div key={s.label} className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4">
            <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">{s.value}</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent cases */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] mb-6">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="font-semibold text-sm text-[var(--foreground)]">Letzte Fälle</h2>
          <Link href="/advisor/appeals" className="text-xs text-brand-600 hover:underline">
            Alle ansehen
          </Link>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {recentCases.map((c) => {
            const client = clientMap[c.clientId]
            const status = STATUS_LABEL[c.status] ?? { label: c.status, className: 'bg-gray-100 text-gray-600' }
            return (
              <div key={c.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {USE_CASE_LABELS[c.useCase] ?? c.useCase}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {client?.name ?? '–'} · {new Date(c.createdAt).toLocaleDateString('de-DE')}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${status.className}`}>
                  {status.label}
                </span>
                {c.deadline && (
                  <p className="text-xs text-[var(--muted)] hidden sm:block shrink-0">
                    Frist: {new Date(c.deadline).toLocaleDateString('de-DE')}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/advisor/clients"
          className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:border-brand-300 transition-colors group"
        >
          <Users className="w-5 h-5 text-brand-600 mb-3" />
          <h3 className="font-semibold text-[var(--foreground)] mb-1 group-hover:text-brand-600">Mandanten verwalten</h3>
          <p className="text-xs text-[var(--muted)]">{stats.totalClients} Mandanten · {stats.activeClients} aktiv</p>
        </Link>
        <Link
          href="/advisor/appeals"
          className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:border-brand-300 transition-colors group"
        >
          <FileText className="w-5 h-5 text-brand-600 mb-3" />
          <h3 className="font-semibold text-[var(--foreground)] mb-1 group-hover:text-brand-600">Alle Einsprüche</h3>
          <p className="text-xs text-[var(--muted)]">{stats.activeCases} aktiv · {stats.submittedCases} eingereicht</p>
        </Link>
      </div>
    </div>
  )
}
