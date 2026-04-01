'use client'

import { useState } from 'react'
import {
  Users, FolderOpen, Clock, CheckCircle2, Database, Activity,
  TrendingUp, CreditCard, ChevronDown, Check, X, Plus, UserCog,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdminUser {
  id:            string
  name:          string | null
  email:         string
  role:          string
  creditBalance: number
  locale:        string
  createdAt:     Date
  emailVerified: Date | null
  _count:        { cases: number }
  subscription:  { status: string; planSlug: string; currentPeriodEnd: Date } | null
}

interface AdminCase {
  id:        string
  useCase:   string
  status:    string
  createdAt: Date
  deadline:  Date | null
  userId:    string
  user:      { name: string | null; email: string }
  _count:    { outputs: number }
}

interface Props {
  users:        AdminUser[]
  cases:        AdminCase[]
  stats: {
    totalUsers:        number
    totalCases:        number
    openCases:         number
    submittedCases:    number
    newUsersThisWeek:  number
  }
  contentStats: { useCases: number; faqs: number; pricingPlans: number }
  systemHealth: Record<string, boolean>
}

type AdminTab = 'overview' | 'users' | 'cases' | 'system'
type CaseFilter = 'all' | 'open' | 'submitted' | 'closed'

const TABS: { key: AdminTab; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: 'Übersicht',   icon: TrendingUp },
  { key: 'users',    label: 'Nutzer',      icon: Users },
  { key: 'cases',    label: 'Fälle',       icon: FolderOpen },
  { key: 'system',   label: 'System',      icon: Activity },
]

const ROLES = ['USER', 'PRO', 'ADVISOR', 'LAWYER', 'ADMIN'] as const
type UserRole = typeof ROLES[number]

const CASE_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  CREATED:           { label: 'Erstellt',       className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  UPLOADING:         { label: 'Upload',         className: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' },
  ANALYZING:         { label: 'Analyse',        className: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' },
  QUESTIONS:         { label: 'Rückfragen',     className: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400' },
  GENERATING:        { label: 'Generierung',    className: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400' },
  DRAFT_READY:       { label: 'Entwurf',        className: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400' },
  ADVISOR_REVIEW:    { label: 'Beratung',       className: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400' },
  APPROVED:          { label: 'Genehmigt',      className: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400' },
  SUBMITTED:         { label: 'Eingereicht',    className: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400' },
  AWAITING_RESPONSE: { label: 'Ausstehend',     className: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400' },
  CLOSED_SUCCESS:    { label: 'Erfolgreich',    className: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400' },
  CLOSED_PARTIAL:    { label: 'Teilweise',      className: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400' },
  REJECTED:          { label: 'Abgelehnt',      className: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400' },
}

const ROLE_STYLES: Record<string, string> = {
  ADMIN:   'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
  PRO:     'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400',
  ADVISOR: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
  LAWYER:  'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400',
  USER:    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

const USE_CASE_LABELS: Record<string, string> = {
  tax:              'Steuerbescheid',
  jobcenter:        'Jobcenter',
  krankenversicherung: 'Krankenversicherung',
  rente:            'Rentenbescheid',
  miete:            'Mieterhöhung',
  bussgeld:         'Bußgeldbescheid',
  grundsteuer:      'Grundsteuer',
  kuendigung:       'Kündigung',
}

// ── Main component ────────────────────────────────────────────────────────────

export function AdminClient({ users: initialUsers, cases, stats, contentStats, systemHealth }: Props) {
  const [tab, setTab]           = useState<AdminTab>('overview')
  const [caseFilter, setCaseFilter] = useState<CaseFilter>('all')
  const [users, setUsers]       = useState(initialUsers)

  // Grant credits state
  const [grantUserId, setGrantUserId]   = useState<string | null>(null)
  const [grantAmount, setGrantAmount]   = useState(1)
  const [grantLoading, setGrantLoading] = useState(false)
  const [grantError, setGrantError]     = useState<string | null>(null)

  // Role change state
  const [roleUserId, setRoleUserId]     = useState<string | null>(null)
  const [roleLoading, setRoleLoading]   = useState(false)

  async function handleGrantCredits(userId: string) {
    setGrantLoading(true)
    setGrantError(null)
    try {
      const res = await fetch(`/api/admin/users/${userId}/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: grantAmount }),
      })
      if (!res.ok) throw new Error('Fehler beim Gutschreiben')
      const data = await res.json() as { creditBalance: number }
      setUsers((prev) =>
        prev.map((u) => u.id === userId ? { ...u, creditBalance: data.creditBalance } : u)
      )
      setGrantUserId(null)
      setGrantAmount(1)
    } catch {
      setGrantError('Gutschrift fehlgeschlagen')
    } finally {
      setGrantLoading(false)
    }
  }

  async function handleRoleChange(userId: string, newRole: UserRole) {
    setRoleLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (!res.ok) throw new Error()
      setUsers((prev) =>
        prev.map((u) => u.id === userId ? { ...u, role: newRole } : u)
      )
    } finally {
      setRoleLoading(false)
      setRoleUserId(null)
    }
  }

  const filteredCases = cases.filter((c) => {
    if (caseFilter === 'open')      return ['CREATED', 'QUESTIONS', 'GENERATING', 'DRAFT_READY', 'ANALYZING', 'UPLOADING'].includes(c.status)
    if (caseFilter === 'submitted') return ['SUBMITTED', 'AWAITING_RESPONSE', 'APPROVED', 'ADVISOR_REVIEW'].includes(c.status)
    if (caseFilter === 'closed')    return ['CLOSED_SUCCESS', 'CLOSED_PARTIAL', 'REJECTED'].includes(c.status)
    return true
  })

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

      {/* ── Overview tab ────────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { icon: Users,        label: 'Nutzer gesamt',    value: stats.totalUsers,       color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' },
              { icon: TrendingUp,   label: 'Neue (7 Tage)',    value: stats.newUsersThisWeek, color: 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400' },
              { icon: FolderOpen,   label: 'Fälle gesamt',     value: stats.totalCases,       color: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400' },
              { icon: Clock,        label: 'Offene Fälle',     value: stats.openCases,        color: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400' },
              { icon: CheckCircle2, label: 'Eingereicht',      value: stats.submittedCases,   color: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400' },
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

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Recent signups */}
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)]">
              <div className="px-5 py-4 border-b border-[var(--border)]">
                <h2 className="font-semibold text-sm text-[var(--foreground)]">Neue Nutzer</h2>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {users.slice(0, 5).map((u) => (
                  <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-7 h-7 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                      {(u.name ?? u.email).slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">{u.name ?? '—'}</p>
                      <p className="text-xs text-[var(--muted)] truncate">{u.email}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${ROLE_STYLES[u.role] ?? ROLE_STYLES.USER}`}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent cases */}
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)]">
              <div className="px-5 py-4 border-b border-[var(--border)]">
                <h2 className="font-semibold text-sm text-[var(--foreground)]">Neueste Fälle</h2>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {cases.slice(0, 5).map((c) => {
                  const s = CASE_STATUS_LABELS[c.status] ?? { label: c.status, className: 'bg-gray-100 text-gray-600' }
                  return (
                    <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--foreground)]">
                          {USE_CASE_LABELS[c.useCase] ?? c.useCase}
                        </p>
                        <p className="text-xs text-[var(--muted)] truncate">
                          {c.user.name ?? c.user.email} · {new Date(c.createdAt).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${s.className}`}>
                        {s.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Users tab ───────────────────────────────────────────────────────── */}
      {tab === 'users' && (
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)]">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <h2 className="font-semibold text-sm text-[var(--foreground)]">
              Nutzer ({users.length})
            </h2>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {users.map((user) => (
              <div key={user.id}>
                <div className="flex items-center gap-3 px-5 py-3.5">
                  {/* Avatar */}
                  <div className="w-8 h-8 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    {(user.name ?? user.email).slice(0, 2).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {user.name ?? '—'}
                      {!user.emailVerified && (
                        <span className="ml-1.5 text-xs text-amber-600 dark:text-amber-400">(unverifiziert)</span>
                      )}
                    </p>
                    <p className="text-xs text-[var(--muted)] truncate">
                      {user.email} · {user._count.cases} Fall{user._count.cases !== 1 ? 'fälle' : ''}
                      {user.subscription && ` · ${user.subscription.planSlug}`}
                    </p>
                  </div>

                  {/* Credits */}
                  <div className="hidden sm:flex items-center gap-1 text-xs text-[var(--muted)] shrink-0">
                    <CreditCard className="w-3 h-3" />
                    {user.creditBalance}
                  </div>

                  {/* Role badge — click to change */}
                  <button
                    onClick={() => setRoleUserId(roleUserId === user.id ? null : user.id)}
                    className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full shrink-0 transition-opacity hover:opacity-75 ${ROLE_STYLES[user.role] ?? ROLE_STYLES.USER}`}
                    disabled={roleLoading}
                  >
                    {user.role}
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {/* Grant credits button */}
                  <button
                    onClick={() => { setGrantUserId(grantUserId === user.id ? null : user.id); setGrantAmount(1); setGrantError(null) }}
                    className="hidden sm:flex items-center gap-1 text-xs text-[var(--muted)] hover:text-brand-600 px-2 py-1 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors shrink-0"
                    title="Gutschrift vergeben"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Guthaben
                  </button>

                  <p className="text-xs text-[var(--muted)] hidden lg:block shrink-0">
                    {new Date(user.createdAt).toLocaleDateString('de-DE')}
                  </p>
                </div>

                {/* Role change dropdown */}
                {roleUserId === user.id && (
                  <div className="mx-5 mb-3 p-2 bg-[var(--background-subtle)] rounded-xl border border-[var(--border)]">
                    <p className="text-xs text-[var(--muted)] mb-2 px-1">Rolle ändern:</p>
                    <div className="flex flex-wrap gap-1">
                      {ROLES.map((r) => (
                        <button
                          key={r}
                          onClick={() => handleRoleChange(user.id, r)}
                          disabled={roleLoading || r === user.role}
                          className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                            r === user.role
                              ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300 cursor-default'
                              : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-brand-400'
                          }`}
                        >
                          {r === user.role && <Check className="w-3 h-3" />}
                          {r}
                        </button>
                      ))}
                      <button
                        onClick={() => setRoleUserId(null)}
                        className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] px-2 py-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Grant credits form */}
                {grantUserId === user.id && (
                  <div className="mx-5 mb-3 p-3 bg-[var(--background-subtle)] rounded-xl border border-[var(--border)]">
                    <p className="text-xs text-[var(--muted)] mb-2">Gutschrift für {user.name ?? user.email}:</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={1000}
                        value={grantAmount}
                        onChange={(e) => setGrantAmount(Math.max(1, Math.min(1000, Number(e.target.value))))}
                        className="w-24 px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <span className="text-xs text-[var(--muted)]">Credits</span>
                      <button
                        onClick={() => handleGrantCredits(user.id)}
                        disabled={grantLoading}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
                      >
                        <UserCog className="w-3.5 h-3.5" />
                        {grantLoading ? 'Wird gebucht…' : 'Gutschreiben'}
                      </button>
                      <button
                        onClick={() => setGrantUserId(null)}
                        className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] px-2"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {grantError && <p className="text-xs text-red-500 mt-1.5">{grantError}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Cases tab ───────────────────────────────────────────────────────── */}
      {tab === 'cases' && (
        <div>
          {/* Filter */}
          <div className="flex items-center gap-1 mb-4">
            {([
              { key: 'all',       label: `Alle (${cases.length})` },
              { key: 'open',      label: `Offen (${cases.filter((c) => ['CREATED','QUESTIONS','GENERATING','DRAFT_READY','ANALYZING','UPLOADING'].includes(c.status)).length})` },
              { key: 'submitted', label: `Eingereicht (${cases.filter((c) => ['SUBMITTED','AWAITING_RESPONSE','APPROVED','ADVISOR_REVIEW'].includes(c.status)).length})` },
              { key: 'closed',    label: `Abgeschlossen (${cases.filter((c) => ['CLOSED_SUCCESS','CLOSED_PARTIAL','REJECTED'].includes(c.status)).length})` },
            ] as { key: CaseFilter; label: string }[]).map((f) => (
              <button
                key={f.key}
                onClick={() => setCaseFilter(f.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  caseFilter === f.key
                    ? 'bg-brand-600 text-white'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)]">
            <div className="divide-y divide-[var(--border)]">
              {filteredCases.map((c) => {
                const s = CASE_STATUS_LABELS[c.status] ?? { label: c.status, className: 'bg-gray-100 text-gray-600' }
                return (
                  <div key={c.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {USE_CASE_LABELS[c.useCase] ?? c.useCase}
                      </p>
                      <p className="text-xs text-[var(--muted)] truncate">
                        {c.user.name ?? c.user.email} · #{c.id.slice(-6).toUpperCase()} · {new Date(c.createdAt).toLocaleDateString('de-DE')}
                        {c._count.outputs > 0 && ` · ${c._count.outputs} Outputs`}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${s.className}`}>
                      {s.label}
                    </span>
                    {c.deadline && (
                      <p className="text-xs text-[var(--muted)] hidden sm:block shrink-0">
                        Frist: {new Date(c.deadline).toLocaleDateString('de-DE')}
                      </p>
                    )}
                  </div>
                )
              })}
              {filteredCases.length === 0 && (
                <p className="px-5 py-8 text-sm text-center text-[var(--muted)]">Keine Fälle in dieser Kategorie.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── System tab ──────────────────────────────────────────────────────── */}
      {tab === 'system' && (
        <div className="space-y-6">
          {/* API keys */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)]">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <h2 className="font-semibold text-sm text-[var(--foreground)]">API-Dienste</h2>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {[
                { key: 'anthropic',  label: 'Anthropic (Claude)',      required: true },
                { key: 'google',     label: 'Google AI (Gemini)',       required: false },
                { key: 'perplexity', label: 'Perplexity (Sonar)',       required: false },
                { key: 'stripe',     label: 'Stripe (Zahlungen)',       required: false },
                { key: 'brevo',      label: 'Brevo (E-Mail)',           required: false },
                { key: 's3',         label: 'S3 (Dateispeicher)',       required: false },
              ].map((svc) => (
                <div key={svc.key} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{svc.label}</p>
                    {svc.required && (
                      <p className="text-xs text-[var(--muted)]">Pflicht — App startet nicht ohne diesen Key</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${systemHealth[svc.key] ? 'bg-green-500' : 'bg-red-400'}`} />
                    <span className={`text-xs font-medium ${systemHealth[svc.key] ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                      {systemHealth[svc.key] ? 'Konfiguriert' : 'Fehlt'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DB content */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)]">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <h2 className="font-semibold text-sm text-[var(--foreground)]">Datenbank-Inhalte</h2>
            </div>
            <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)]">
              {[
                { label: 'Anwendungsfälle', value: contentStats.useCases,     icon: Database },
                { label: 'FAQs',            value: contentStats.faqs,         icon: Database },
                { label: 'Preispläne',      value: contentStats.pricingPlans, icon: CreditCard },
              ].map((s) => (
                <div key={s.label} className="px-5 py-4 text-center">
                  <p className="text-3xl font-bold text-[var(--foreground)]">{s.value}</p>
                  <p className="text-sm text-[var(--muted)] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl px-5 py-4 text-sm text-amber-800 dark:text-amber-300">
            Preispläne, E-Mail-Vorlagen und Inhalte können direkt in der Datenbank oder über den Seed editiert werden.
            Ein In-App Content-Editor folgt in einer zukünftigen Version.
          </div>
        </div>
      )}
    </div>
  )
}
