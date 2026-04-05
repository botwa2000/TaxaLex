import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { DEMO_CLIENTS, DEMO_CLIENT_CASES, getAdvisorCases } from '@/lib/mockData'
import { FileText } from 'lucide-react'

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

const STATUS_MAP: Record<string, { label: string; color: string; dot: string }> = {
  DRAFT_READY:       { label: 'Entwurf bereit',  color: 'bg-blue-50 text-blue-700',   dot: 'bg-blue-500' },
  SUBMITTED:         { label: 'Eingereicht',      color: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
  AWAITING_RESPONSE: { label: 'Ausstehend',       color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-400' },
  QUESTIONS:         { label: 'Rückfragen',       color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-400' },
  CLOSED_SUCCESS:    { label: 'Erfolgreich',      color: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
  CREATING:          { label: 'Wird erstellt',    color: 'bg-gray-100 text-gray-600',  dot: 'bg-gray-300' },
}

export default async function AdvisorAppealsPage({ params }: { params: Promise<{ locale: string }> }) {
  const [session, { locale }] = await Promise.all([auth(), params])
  if (!session) redirect(`/${locale}/login`)
  if (!['ADVISOR', 'LAWYER', 'ADMIN'].includes(session.user?.role ?? '')) {
    redirect('/dashboard')
  }

  const advisorId = session.user?.id ?? 'demo_advisor_001'
  const cases = getAdvisorCases(advisorId)
  const clientMap = Object.fromEntries(DEMO_CLIENTS.map((c) => [c.id, c]))

  const activeStatuses = ['CREATED', 'QUESTIONS', 'GENERATING', 'DRAFT_READY', 'CREATING']
  const submittedStatuses = ['SUBMITTED', 'AWAITING_RESPONSE']

  // Tab groups for display — simple server-side split
  const active = cases.filter((c) => activeStatuses.includes(c.status))
  const submitted = cases.filter((c) => submittedStatuses.includes(c.status))
  const closed = cases.filter((c) => c.status.startsWith('CLOSED'))

  const sections = [
    { label: `Aktiv (${active.length})`, cases: active },
    { label: `Eingereicht (${submitted.length})`, cases: submitted },
    { label: `Abgeschlossen (${closed.length})`, cases: closed },
  ]

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <FileText className="w-4 h-4 text-purple-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Alle Einsprüche</h1>
          <p className="text-sm text-[var(--muted)]">{cases.length} Einsprüche über alle Mandanten</p>
        </div>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.label} className="bg-[var(--surface)] rounded-xl border border-[var(--border)]">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <h2 className="font-semibold text-sm text-[var(--foreground)]">{section.label}</h2>
            </div>
            {section.cases.length === 0 ? (
              <p className="px-5 py-4 text-sm text-[var(--muted)]">Keine Fälle</p>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {section.cases.map((c) => {
                  const client = clientMap[c.clientId]
                  const status = STATUS_MAP[c.status] ?? { label: c.status, color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-300' }
                  return (
                    <div key={c.id} className="flex items-center gap-3 px-5 py-3.5">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${status.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--foreground)]">
                          {USE_CASE_LABELS[c.useCase] ?? c.useCase}
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          {client?.name ?? '–'} · #{c.id.slice(-6).toUpperCase()} · {new Date(c.createdAt).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${status.color}`}>
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
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
