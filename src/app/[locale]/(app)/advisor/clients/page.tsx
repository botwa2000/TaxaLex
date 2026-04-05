import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { DEMO_CLIENTS } from '@/lib/mockData'
import { Users, Plus, Mail, FileText } from 'lucide-react'
import { Link } from '@/i18n/navigation'

export default async function AdvisorClientsPage({ params }: { params: Promise<{ locale: string }> }) {
  const [session, { locale }] = await Promise.all([auth(), params])
  if (!session) redirect(`/${locale}/login`)
  if (!['ADVISOR', 'LAWYER', 'ADMIN'].includes(session.user?.role ?? '')) {
    redirect('/dashboard')
  }

  const advisorId = session.user?.id ?? 'demo_advisor_001'
  const clients = DEMO_CLIENTS.filter((c) => c.advisorId === advisorId)

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-blue-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Mandanten</h1>
            <p className="text-sm text-[var(--muted)]">{clients.length} Mandanten</p>
          </div>
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors"
          title="Mandant hinzufügen (Demo)"
        >
          <Plus className="w-4 h-4" />
          Mandant hinzufügen
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-12 text-center">
          <Users className="w-8 h-8 text-[var(--muted)] mx-auto mb-3" />
          <p className="font-medium text-[var(--foreground)] mb-1">Noch keine Mandanten</p>
          <p className="text-sm text-[var(--muted)]">Fügen Sie Ihren ersten Mandanten hinzu</p>
        </div>
      ) : (
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)]">
          {/* Table header */}
          <div className="grid grid-cols-4 sm:grid-cols-5 px-5 py-3 border-b border-[var(--border)] text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            <span className="col-span-2">Mandant</span>
            <span className="text-center">Fälle</span>
            <span className="hidden sm:block text-center">Status</span>
            <span className="text-right">Zuletzt aktiv</span>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {clients.map((client) => (
              <div key={client.id} className="grid grid-cols-4 sm:grid-cols-5 items-center px-5 py-3.5 hover:bg-[var(--background-subtle)] transition-colors">
                {/* Client info */}
                <div className="col-span-2 flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    {client.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">{client.name}</p>
                    <p className="text-xs text-[var(--muted)] truncate flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {client.email}
                    </p>
                  </div>
                </div>

                {/* Cases */}
                <div className="flex items-center justify-center gap-1 text-sm text-[var(--foreground)]">
                  <FileText className="w-3.5 h-3.5 text-[var(--muted)]" />
                  {client.cases}
                </div>

                {/* Status */}
                <div className="hidden sm:flex justify-center">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    client.status === 'active'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {client.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </div>

                {/* Last active */}
                <div className="text-right text-xs text-[var(--muted)]">
                  {new Date(client.lastActive).toLocaleDateString('de-DE')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-[var(--muted)] mt-4 text-center">
        Mandantenverwaltung ist Demo-Daten. Vollständige CRUD-Funktionalität folgt in Phase 2.
      </p>
    </div>
  )
}
