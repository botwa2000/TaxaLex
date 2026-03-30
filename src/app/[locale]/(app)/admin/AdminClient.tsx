'use client'

import { useState } from 'react'
import { Users, FolderOpen, Clock, CheckCircle2, Database } from 'lucide-react'

type AdminTab = 'overview' | 'users' | 'content'

interface DemoUser {
  id: string; name: string; email: string; role: string; createdAt: Date; cases: number
}
interface DemoCase {
  id: string; useCase: string; status: string; createdAt: Date; deadline: Date | null
}
interface ContentStats {
  useCases: number; faqs: number; pricingPlans: number
}

interface Props {
  users: DemoUser[]
  cases: DemoCase[]
  stats: { totalUsers: number; totalCases: number; openCases: number; submittedCases: number }
  contentStats: ContentStats
}

const TABS: { key: AdminTab; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: 'Übersicht', icon: FolderOpen },
  { key: 'users', label: 'Nutzer', icon: Users },
  { key: 'content', label: 'Inhalte', icon: Database },
]

export function AdminClient({ users, cases, stats, contentStats }: Props) {
  const [tab, setTab] = useState<AdminTab>('overview')

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--border)] mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.key
                ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === 'overview' && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Users, label: 'Nutzer gesamt', value: stats.totalUsers, color: 'bg-blue-50 text-blue-600' },
              { icon: FolderOpen, label: 'Fälle gesamt', value: stats.totalCases, color: 'bg-purple-50 text-purple-600' },
              { icon: Clock, label: 'Offene Fälle', value: stats.openCases, color: 'bg-amber-50 text-amber-600' },
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

          {/* All cases */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)]">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <h2 className="font-semibold text-sm text-[var(--foreground)]">Alle Fälle ({cases.length})</h2>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {cases.map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${statusDot(c.status)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)]">{useCaseLabel(c.useCase)}</p>
                    <p className="text-xs text-[var(--muted)]">
                      #{c.id.slice(-6).toUpperCase()} · {new Date(c.createdAt).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                  {c.deadline && (
                    <p className="text-xs text-[var(--muted)] hidden sm:block shrink-0">
                      Frist: {new Date(c.deadline).toLocaleDateString('de-DE')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)]">
          <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="font-semibold text-sm text-[var(--foreground)]">Nutzer ({users.length})</h2>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-8 h-8 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)]">{user.name}</p>
                  <p className="text-xs text-[var(--muted)] truncate">
                    {user.email} · {user.cases} Fall{user.cases !== 1 ? 'fälle' : ''}
                  </p>
                </div>
                <RoleBadge role={user.role} />
                <p className="text-xs text-[var(--muted)] hidden sm:block shrink-0">
                  Seit {new Date(user.createdAt).toLocaleDateString('de-DE')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content tab */}
      {tab === 'content' && (
        <div>
          <p className="text-sm text-[var(--muted)] mb-6">
            DB-Inhalte aus <code className="text-xs bg-[var(--surface)] border border-[var(--border)] px-1.5 py-0.5 rounded">contentFallbacks.ts</code> und Datenbank-Seed.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Anwendungsfälle', value: contentStats.useCases, color: 'bg-blue-50 text-blue-600' },
              { label: 'FAQs', value: contentStats.faqs, color: 'bg-green-50 text-green-600' },
              { label: 'Preispläne', value: contentStats.pricingPlans, color: 'bg-purple-50 text-purple-600' },
            ].map((s) => (
              <div key={s.label} className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5">
                <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg mb-3 ${s.color}`}>
                  <Database className="w-3.5 h-3.5" />
                  DB-Inhalt
                </div>
                <p className="text-3xl font-bold text-[var(--foreground)]">{s.value}</p>
                <p className="text-sm text-[var(--muted)] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5">
            <h3 className="font-semibold text-sm text-[var(--foreground)] mb-3">Content-Quellen</h3>
            <div className="space-y-2 text-sm text-[var(--muted)]">
              <p>• <code className="text-xs bg-[var(--border)] rounded px-1">src/lib/contentFallbacks.ts</code> — statische Fallbacks (immer verfügbar)</p>
              <p>• <code className="text-xs bg-[var(--border)] rounded px-1">prisma/seed.ts</code> — DB-Seed für Produktion</p>
              <p>• <code className="text-xs bg-[var(--border)] rounded px-1">/api/content/use-cases</code>, <code className="text-xs bg-[var(--border)] rounded px-1">/api/content/faq</code>, <code className="text-xs bg-[var(--border)] rounded px-1">/api/content/pricing</code> — dynamische Routen</p>
            </div>
            <p className="text-xs text-[var(--muted)] mt-4 pt-4 border-t border-[var(--border)]">
              Inhalts-Editor folgt in einer zukünftigen Version.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const m: Record<string, string> = {
    ADMIN: 'bg-red-50 text-red-700', PRO: 'bg-brand-50 text-brand-700',
    ADVISOR: 'bg-purple-50 text-purple-700', LAWYER: 'bg-indigo-50 text-indigo-700',
    USER: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${m[role] ?? 'bg-gray-100 text-gray-600'}`}>
      {role}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const m: Record<string, { label: string; className: string }> = {
    DRAFT_READY: { label: 'Entwurf', className: 'bg-blue-50 text-blue-700' },
    SUBMITTED: { label: 'Eingereicht', className: 'bg-green-50 text-green-700' },
    AWAITING_RESPONSE: { label: 'Ausstehend', className: 'bg-amber-50 text-amber-700' },
    CLOSED_SUCCESS: { label: 'Erfolgreich', className: 'bg-green-50 text-green-700' },
    QUESTIONS: { label: 'Rückfragen', className: 'bg-amber-50 text-amber-700' },
  }
  const { label, className } = m[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${className}`}>{label}</span>
}

function statusDot(s: string) {
  const m: Record<string, string> = {
    DRAFT_READY: 'bg-blue-500', SUBMITTED: 'bg-green-500', AWAITING_RESPONSE: 'bg-amber-500',
    CLOSED_SUCCESS: 'bg-green-500', QUESTIONS: 'bg-amber-400',
  }
  return m[s] ?? 'bg-gray-300'
}

function useCaseLabel(u: string) {
  const m: Record<string, string> = {
    tax: 'Steuerbescheid', jobcenter: 'Jobcenter', krankenversicherung: 'Krankenversicherung',
    rente: 'Rentenbescheid', miete: 'Mieterhöhung', bussgeld: 'Bußgeldbescheid', grundsteuer: 'Grundsteuer',
  }
  return m[u] ?? u
}
