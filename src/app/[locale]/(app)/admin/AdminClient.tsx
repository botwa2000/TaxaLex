'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Users, FolderOpen, Clock, CheckCircle2, Activity, TrendingUp,
  CreditCard, ChevronDown, ChevronRight, Check, X, Plus, UserCog,
  Mail, Tag, ToggleLeft, ToggleRight, Loader2, AlertCircle,
  UserCheck, UserX, ShieldCheck,
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

interface UserDetail {
  cases: {
    id: string; useCase: string; status: string
    createdAt: Date; deadline: Date | null
    _count: { outputs: number }
  }[]
  ledger: {
    id: string; delta: number; reason: string
    referenceId: string | null; createdAt: Date
  }[]
  subscription: {
    status: string; planSlug: string
    currentPeriodStart: Date; currentPeriodEnd: Date
    cancelAtPeriodEnd: boolean; createdAt: Date
  } | null
  creditBalance: number
}

interface PricingPlan {
  id:           string
  slug:         string
  userGroup:    string
  priceOnce:    string | null
  priceMonthly: string | null
  priceAnnual:  string | null
  isActive:     boolean
  isPopular:    boolean
  sortOrder:    number
  translations: { name: string; description?: string | null }[]
  features:     { text: string; included: boolean }[]
}

interface Props {
  users: AdminUser[]
  cases: AdminCase[]
  stats: {
    totalUsers:          number
    verifiedUsers:       number
    newUsersThisWeek:    number
    usersWithCases:      number
    activeSubscriptions: number
    totalCases:          number
    casesThisWeek:       number
    openCases:           number
    closedSuccessCases:  number
  }
  systemHealth: Record<string, boolean | string>
}

type AdminTab = 'overview' | 'users' | 'cases' | 'pricing' | 'emails' | 'system'
type CaseFilter = 'all' | 'open' | 'submitted' | 'closed'

const TABS: { key: AdminTab; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: 'Übersicht', icon: TrendingUp },
  { key: 'users',    label: 'Nutzer',    icon: Users },
  { key: 'cases',    label: 'Fälle',     icon: FolderOpen },
  { key: 'pricing',  label: 'Preise',    icon: Tag },
  { key: 'emails',   label: 'E-Mails',   icon: Mail },
  { key: 'system',   label: 'System',    icon: Activity },
]

const ROLES = ['USER', 'PRO', 'ADVISOR', 'LAWYER', 'ADMIN'] as const
type UserRole = typeof ROLES[number]

const ROLE_STYLES: Record<string, string> = {
  ADMIN:   'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
  PRO:     'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400',
  ADVISOR: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
  LAWYER:  'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400',
  USER:    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

const CASE_STATUS: Record<string, { label: string; cls: string }> = {
  CREATED:           { label: 'Erstellt',    cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  UPLOADING:         { label: 'Upload',      cls: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' },
  ANALYZING:         { label: 'Analyse',     cls: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' },
  QUESTIONS:         { label: 'Rückfragen',  cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400' },
  GENERATING:        { label: 'Generierung', cls: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400' },
  DRAFT_READY:       { label: 'Entwurf',     cls: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400' },
  ADVISOR_REVIEW:    { label: 'Beratung',    cls: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400' },
  APPROVED:          { label: 'Genehmigt',   cls: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400' },
  SUBMITTED:         { label: 'Eingereicht', cls: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400' },
  AWAITING_RESPONSE: { label: 'Ausstehend',  cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400' },
  CLOSED_SUCCESS:    { label: 'Erfolgreich', cls: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400' },
  CLOSED_PARTIAL:    { label: 'Teilweise',   cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400' },
  REJECTED:          { label: 'Abgelehnt',   cls: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400' },
}

const CREDIT_REASON_LABELS: Record<string, string> = {
  PURCHASE_SINGLE:    'Einzelkauf',
  PURCHASE_PACK:      'Paket-Kauf',
  SUBSCRIPTION_GRANT: 'Abo-Gutschrift',
  CASE_CREATED:       'Fall erstellt',
  REFUND:             'Rückerstattung',
  ADMIN_GRANT:        'Admin-Gutschrift',
}

const USE_CASE_LABELS: Record<string, string> = {
  tax: 'Steuerbescheid', jobcenter: 'Jobcenter', krankenversicherung: 'Krankenversicherung',
  rente: 'Rentenbescheid', miete: 'Mieterhöhung', bussgeld: 'Bußgeldbescheid',
  grundsteuer: 'Grundsteuer', kuendigung: 'Kündigung',
}

function fmt(d: Date | string) { return new Date(d).toLocaleDateString('de-DE') }
function fmtEuro(v: string | null) { return v ? `${parseFloat(v).toFixed(2)} €` : '—' }

// ── Main component ────────────────────────────────────────────────────────────

export function AdminClient({ users: initialUsers, cases, stats, systemHealth }: Props) {
  const [tab, setTab]               = useState<AdminTab>('overview')
  const [caseFilter, setCaseFilter] = useState<CaseFilter>('all')
  const [users, setUsers]           = useState(initialUsers)

  // User detail
  const [expandedUserId, setExpandedUserId]     = useState<string | null>(null)
  const [userDetail, setUserDetail]             = useState<Record<string, UserDetail>>({})
  const [loadingDetail, setLoadingDetail]       = useState<string | null>(null)

  // Grant credits
  const [grantUserId, setGrantUserId]   = useState<string | null>(null)
  const [grantAmount, setGrantAmount]   = useState(1)
  const [grantLoading, setGrantLoading] = useState(false)
  const [grantError, setGrantError]     = useState<string | null>(null)

  // Role change
  const [roleUserId, setRoleUserId]   = useState<string | null>(null)
  const [roleLoading, setRoleLoading] = useState(false)

  // Pricing
  const [plans, setPlans]             = useState<PricingPlan[]>([])
  const [plansLoaded, setPlansLoaded] = useState(false)
  const [planEdits, setPlanEdits]     = useState<Record<string, Partial<PricingPlan>>>({})
  const [planSaving, setPlanSaving]   = useState<string | null>(null)

  const loadPricing = useCallback(async () => {
    if (plansLoaded) return
    const res = await fetch('/api/admin/pricing')
    if (res.ok) {
      setPlans(await res.json() as PricingPlan[])
      setPlansLoaded(true)
    }
  }, [plansLoaded])

  useEffect(() => {
    if (tab === 'pricing') loadPricing()
  }, [tab, loadPricing])

  async function expandUser(userId: string) {
    if (expandedUserId === userId) { setExpandedUserId(null); return }
    setExpandedUserId(userId)
    if (userDetail[userId]) return
    setLoadingDetail(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`)
      if (res.ok) {
        const data = await res.json() as UserDetail
        setUserDetail((prev) => ({ ...prev, [userId]: data }))
      }
    } finally {
      setLoadingDetail(null)
    }
  }

  async function handleGrantCredits(userId: string) {
    setGrantLoading(true)
    setGrantError(null)
    try {
      const res = await fetch(`/api/admin/users/${userId}/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: grantAmount }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json() as { creditBalance: number }
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, creditBalance: data.creditBalance } : u))
      // Refresh detail if open
      if (userDetail[userId]) {
        setUserDetail((prev) => ({ ...prev, [userId]: { ...prev[userId], creditBalance: data.creditBalance } }))
      }
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
      if (res.ok) setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u))
    } finally {
      setRoleLoading(false)
      setRoleUserId(null)
    }
  }

  async function savePlanField(planId: string, field: string, value: unknown) {
    setPlanSaving(planId)
    try {
      const res = await fetch(`/api/admin/pricing/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })
      if (res.ok) {
        const updated = await res.json() as Partial<PricingPlan>
        setPlans((prev) => prev.map((p) => p.id === planId ? { ...p, ...updated } : p))
        setPlanEdits((prev) => { const n = { ...prev }; delete n[planId]; return n })
      }
    } finally {
      setPlanSaving(null)
    }
  }

  const filteredCases = cases.filter((c) => {
    if (caseFilter === 'open')      return ['CREATED','QUESTIONS','GENERATING','DRAFT_READY','ANALYZING','UPLOADING'].includes(c.status)
    if (caseFilter === 'submitted') return ['SUBMITTED','AWAITING_RESPONSE','APPROVED','ADVISOR_REVIEW'].includes(c.status)
    if (caseFilter === 'closed')    return ['CLOSED_SUCCESS','CLOSED_PARTIAL','REJECTED'].includes(c.status)
    return true
  })

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--border)] mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
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

      {/* ── OVERVIEW ──────────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* 6 meaningful KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              {
                icon: Users, label: 'Nutzer gesamt', value: stats.totalUsers,
                sub: `${stats.verifiedUsers} verifiziert`,
                color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
              },
              {
                icon: TrendingUp, label: 'Neue (7 Tage)', value: stats.newUsersThisWeek,
                sub: `${stats.totalUsers > 0 ? Math.round((stats.newUsersThisWeek / stats.totalUsers) * 100) : 0}% des Gesamts`,
                color: 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400',
              },
              {
                icon: UserCheck, label: 'Aktiviert', value: stats.usersWithCases,
                sub: `${stats.totalUsers > 0 ? Math.round((stats.usersWithCases / stats.totalUsers) * 100) : 0}% Aktivierungsrate`,
                color: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
              },
              {
                icon: CreditCard, label: 'Aktive Abos', value: stats.activeSubscriptions,
                sub: `${stats.totalUsers > 0 ? Math.round((stats.activeSubscriptions / stats.totalUsers) * 100) : 0}% Conversion`,
                color: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
              },
              {
                icon: FolderOpen, label: 'Fälle gesamt', value: stats.totalCases,
                sub: `${stats.casesThisWeek} diese Woche`,
                color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400',
              },
              {
                icon: CheckCircle2, label: 'Erfolgreich abgeschl.', value: stats.closedSuccessCases,
                sub: `${stats.openCases} noch offen`,
                color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
              },
            ].map((s) => (
              <div key={s.label} className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4">
                <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
                  <s.icon className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold text-[var(--foreground)]">{s.value}</p>
                <p className="text-xs font-medium text-[var(--foreground)] mt-0.5">{s.label}</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">{s.sub}</p>
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
                    <UserStatusDot user={u} />
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
                  const s = CASE_STATUS[c.status] ?? { label: c.status, cls: 'bg-gray-100 text-gray-600' }
                  return (
                    <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--foreground)]">{USE_CASE_LABELS[c.useCase] ?? c.useCase}</p>
                        <p className="text-xs text-[var(--muted)] truncate">{c.user.name ?? c.user.email} · {fmt(c.createdAt)}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${s.cls}`}>{s.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── USERS ─────────────────────────────────────────────────────────── */}
      {tab === 'users' && (
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)]">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <h2 className="font-semibold text-sm text-[var(--foreground)]">Nutzer ({users.length})</h2>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {users.map((user) => (
              <div key={user.id}>
                {/* User row */}
                <div className="flex items-center gap-3 px-5 py-3.5">
                  {/* Expand toggle */}
                  <button
                    onClick={() => expandUser(user.id)}
                    className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors shrink-0"
                  >
                    {loadingDetail === user.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : expandedUserId === user.id
                        ? <ChevronDown className="w-4 h-4" />
                        : <ChevronRight className="w-4 h-4" />
                    }
                  </button>

                  <UserStatusDot user={user} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {user.name ?? '—'}
                    </p>
                    <p className="text-xs text-[var(--muted)] truncate">
                      {user.email} · {user._count.cases} Fall{user._count.cases !== 1 ? 'fälle' : ''}
                      {user.subscription && ` · ${user.subscription.planSlug} (${user.subscription.status})`}
                    </p>
                  </div>

                  {/* Credits */}
                  <div className="hidden sm:flex items-center gap-1 text-xs text-[var(--muted)] shrink-0">
                    <CreditCard className="w-3 h-3" />
                    {user.creditBalance}
                  </div>

                  {/* Role — click to change */}
                  <button
                    onClick={() => setRoleUserId(roleUserId === user.id ? null : user.id)}
                    disabled={roleLoading}
                    className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full shrink-0 hover:opacity-75 transition-opacity ${ROLE_STYLES[user.role] ?? ROLE_STYLES.USER}`}
                  >
                    {user.role}
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {/* Grant credits */}
                  <button
                    onClick={() => { setGrantUserId(grantUserId === user.id ? null : user.id); setGrantAmount(1); setGrantError(null) }}
                    className="hidden sm:flex items-center gap-1 text-xs text-[var(--muted)] hover:text-brand-600 px-2 py-1 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors shrink-0"
                    title="Gutschrift vergeben"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  <p className="text-xs text-[var(--muted)] hidden lg:block shrink-0">{fmt(user.createdAt)}</p>
                </div>

                {/* Role change inline */}
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
                              : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:border-brand-400 hover:text-[var(--foreground)]'
                          }`}
                        >
                          {r === user.role && <Check className="w-3 h-3" />}
                          {r}
                        </button>
                      ))}
                      <button onClick={() => setRoleUserId(null)} className="text-[var(--muted)] hover:text-[var(--foreground)] px-2">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Grant credits inline */}
                {grantUserId === user.id && (
                  <div className="mx-5 mb-3 p-3 bg-[var(--background-subtle)] rounded-xl border border-[var(--border)]">
                    <p className="text-xs text-[var(--muted)] mb-2">Credits für {user.name ?? user.email}:</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="number" min={1} max={1000} value={grantAmount}
                        onChange={(e) => setGrantAmount(Math.max(1, Math.min(1000, Number(e.target.value))))}
                        className="w-20 px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                      <button onClick={() => setGrantUserId(null)} className="text-[var(--muted)] hover:text-[var(--foreground)]">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {grantError && <p className="text-xs text-red-500 mt-1.5">{grantError}</p>}
                  </div>
                )}

                {/* Expanded user detail */}
                {expandedUserId === user.id && userDetail[user.id] && (
                  <UserDetailPanel detail={userDetail[user.id]} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CASES ─────────────────────────────────────────────────────────── */}
      {tab === 'cases' && (
        <div>
          <div className="flex items-center gap-1 mb-4 flex-wrap">
            {([
              { key: 'all',       label: `Alle (${cases.length})` },
              { key: 'open',      label: `Offen (${cases.filter((c) => ['CREATED','QUESTIONS','GENERATING','DRAFT_READY','ANALYZING','UPLOADING'].includes(c.status)).length})` },
              { key: 'submitted', label: `Eingereicht (${cases.filter((c) => ['SUBMITTED','AWAITING_RESPONSE','APPROVED','ADVISOR_REVIEW'].includes(c.status)).length})` },
              { key: 'closed',    label: `Abgeschl. (${cases.filter((c) => ['CLOSED_SUCCESS','CLOSED_PARTIAL','REJECTED'].includes(c.status)).length})` },
            ] as { key: CaseFilter; label: string }[]).map((f) => (
              <button
                key={f.key}
                onClick={() => setCaseFilter(f.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  caseFilter === f.key ? 'bg-brand-600 text-white' : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)]">
            <div className="divide-y divide-[var(--border)]">
              {filteredCases.map((c) => {
                const s = CASE_STATUS[c.status] ?? { label: c.status, cls: 'bg-gray-100 text-gray-600' }
                return (
                  <div key={c.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)]">{USE_CASE_LABELS[c.useCase] ?? c.useCase}</p>
                      <p className="text-xs text-[var(--muted)] truncate">
                        {c.user.name ?? c.user.email} · #{c.id.slice(-6).toUpperCase()} · {fmt(c.createdAt)}
                        {c._count.outputs > 0 && ` · ${c._count.outputs} Outputs`}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${s.cls}`}>{s.label}</span>
                    {c.deadline && (
                      <p className="text-xs text-[var(--muted)] hidden sm:block shrink-0">Frist: {fmt(c.deadline)}</p>
                    )}
                  </div>
                )
              })}
              {filteredCases.length === 0 && (
                <p className="px-5 py-10 text-sm text-center text-[var(--muted)]">Keine Fälle in dieser Kategorie.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── PRICING ───────────────────────────────────────────────────────── */}
      {tab === 'pricing' && (
        <div className="space-y-4">
          {!plansLoaded && (
            <div className="flex items-center gap-2 text-sm text-[var(--muted)] py-8 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              Preispläne laden…
            </div>
          )}
          {plansLoaded && plans.length === 0 && (
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl px-5 py-4 text-sm text-amber-800 dark:text-amber-300">
              Keine Preispläne in der Datenbank. Führe zuerst <code>npx prisma db seed</code> aus.
            </div>
          )}
          {plans.map((plan) => {
            const name = plan.translations[0]?.name ?? plan.slug
            const edit = planEdits[plan.id] ?? {}
            const saving = planSaving === plan.id

            const priceField = (field: 'priceOnce' | 'priceMonthly' | 'priceAnnual', label: string) => {
              const currentVal = plan[field] ? parseFloat(plan[field]!) : null
              const editVal = edit[field] !== undefined ? edit[field] : currentVal

              return (
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[var(--muted)]">{label}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={editVal ?? ''}
                      placeholder="—"
                      onChange={(e) => setPlanEdits((prev) => ({
                        ...prev,
                        [plan.id]: { ...prev[plan.id], [field]: e.target.value === '' ? null : parseFloat(e.target.value) }
                      }))}
                      className="w-24 px-2 py-1 text-sm border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <span className="text-xs text-[var(--muted)]">€</span>
                    {edit[field] !== undefined && edit[field] !== currentVal && (
                      <button
                        onClick={() => savePlanField(plan.id, field, edit[field])}
                        disabled={saving}
                        className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 rounded"
                        title="Speichern"
                      >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              )
            }

            return (
              <div key={plan.id} className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[var(--foreground)]">{name}</h3>
                      {plan.isPopular && (
                        <span className="text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400 px-2 py-0.5 rounded-full">Empfohlen</span>
                      )}
                      {!plan.isActive && (
                        <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inaktiv</span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      {plan.slug} · Gruppe: {plan.userGroup}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Active toggle */}
                    <button
                      onClick={() => savePlanField(plan.id, 'isActive', !plan.isActive)}
                      disabled={saving}
                      className="flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                      title={plan.isActive ? 'Deaktivieren' : 'Aktivieren'}
                    >
                      {plan.isActive
                        ? <ToggleRight className="w-5 h-5 text-green-500" />
                        : <ToggleLeft className="w-5 h-5" />
                      }
                      {plan.isActive ? 'Aktiv' : 'Inaktiv'}
                    </button>
                    {/* Popular toggle */}
                    <button
                      onClick={() => savePlanField(plan.id, 'isPopular', !plan.isPopular)}
                      disabled={saving}
                      className="flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                      title="Empfehlung umschalten"
                    >
                      <ShieldCheck className={`w-4 h-4 ${plan.isPopular ? 'text-brand-600' : ''}`} />
                      {plan.isPopular ? 'Empfohlen' : 'Standard'}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6">
                  {priceField('priceOnce', 'Einmalig')}
                  {priceField('priceMonthly', 'Monatlich')}
                  {priceField('priceAnnual', 'Jährlich')}
                </div>

                {plan.features.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    <p className="text-xs text-[var(--muted)] mb-2">Features ({plan.features.length})</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {plan.features.map((f, i) => (
                        <span key={i} className={`text-xs ${f.included ? 'text-[var(--foreground)]' : 'text-[var(--muted)] line-through'}`}>
                          {f.included ? '✓' : '✗'} {f.text}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── EMAILS ────────────────────────────────────────────────────────── */}
      {tab === 'emails' && (
        <div className="space-y-4">
          {systemHealth.isDev && (
            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl px-5 py-3.5 text-sm text-amber-800 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Dev-Modus aktiv — alle ausgehenden E-Mails erhalten das Präfix <strong>DEV -</strong> im Betreff.</span>
            </div>
          )}

          {[
            {
              id: 'verify',
              name: 'Bestätigungscode',
              trigger: 'Wird gesendet wenn: Nutzer registriert sich',
              subject: 'Dein Bestätigungscode — TaxaLex',
              vars: ['name (optional)', 'code (6-stellig)', 'locale'],
              ttl: '15 Minuten Gültigkeit',
              file: 'src/lib/emailTemplates/VerifyEmail.tsx',
            },
            {
              id: 'welcome',
              name: 'Willkommens-E-Mail',
              trigger: 'Wird gesendet wenn: Nutzer verifiziert seine E-Mail-Adresse',
              subject: 'Dein TaxaLex-Konto ist bereit',
              vars: ['name (optional)', 'dashboardUrl', 'locale'],
              ttl: null,
              file: 'src/lib/emailTemplates/Welcome.tsx',
            },
            {
              id: 'reset',
              name: 'Passwort zurücksetzen',
              trigger: 'Wird gesendet wenn: Nutzer fordert Passwort-Reset an',
              subject: 'Passwort für TaxaLex zurücksetzen',
              vars: ['name (optional)', 'resetUrl', 'locale'],
              ttl: '1 Stunde Gültigkeit',
              file: 'src/lib/emailTemplates/PasswordReset.tsx',
            },
          ].map((tpl) => (
            <div key={tpl.id} className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-semibold text-[var(--foreground)]">{tpl.name}</h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{tpl.trigger}</p>
                </div>
                <span className="text-xs text-[var(--muted)] shrink-0 font-mono bg-[var(--background-subtle)] px-2 py-1 rounded">
                  {tpl.file.split('/').pop()}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2 items-start">
                  <span className="text-xs font-medium text-[var(--muted)] w-16 shrink-0 pt-0.5">Betreff</span>
                  <code className="text-xs text-[var(--foreground)] bg-[var(--background-subtle)] px-2 py-1 rounded">
                    {systemHealth.isDev ? `DEV - ${tpl.subject}` : tpl.subject}
                  </code>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="text-xs font-medium text-[var(--muted)] w-16 shrink-0 pt-0.5">Variablen</span>
                  <div className="flex flex-wrap gap-1">
                    {tpl.vars.map((v) => (
                      <code key={v} className="text-xs bg-[var(--background-subtle)] text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded">
                        {v}
                      </code>
                    ))}
                  </div>
                </div>
                {tpl.ttl && (
                  <div className="flex gap-2 items-center">
                    <span className="text-xs font-medium text-[var(--muted)] w-16 shrink-0">Ablauf</span>
                    <span className="text-xs text-amber-600 dark:text-amber-400">{tpl.ttl}</span>
                  </div>
                )}
                <div className="flex gap-2 items-center">
                  <span className="text-xs font-medium text-[var(--muted)] w-16 shrink-0">Provider</span>
                  <span className="text-xs text-[var(--muted)]">
                    Brevo Transactional · von {String(systemHealth.brevo ? 'konfiguriert' : 'NICHT konfiguriert')}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <p className="text-xs text-[var(--muted)] px-1">
            Templates sind React Email-Komponenten in <code className="bg-[var(--background-subtle)] px-1 rounded">src/lib/emailTemplates/</code>.
            Für Textänderungen direkt die Datei editieren und neu deployen.
          </p>
        </div>
      )}

      {/* ── SYSTEM ────────────────────────────────────────────────────────── */}
      {tab === 'system' && (
        <div className="space-y-6">
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)]">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <h2 className="font-semibold text-sm text-[var(--foreground)]">API-Dienste</h2>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {[
                { key: 'anthropic',  label: 'Anthropic (Claude)',  note: 'Pflicht — App startet nicht ohne diesen Key' },
                { key: 'google',     label: 'Google AI (Gemini)',  note: 'Optional — für Gemini-Agenten' },
                { key: 'perplexity', label: 'Perplexity (Sonar)', note: 'Optional — für Faktencheck-Agent' },
                { key: 'stripe',     label: 'Stripe',             note: 'Optional — für Zahlungen' },
                { key: 'brevo',      label: 'Brevo (E-Mail)',     note: 'Optional — E-Mails werden ohne Key unterdrückt' },
                { key: 's3',         label: 'S3 (Dateispeicher)', note: 'Optional — für Dokumenten-Upload' },
              ].map((svc) => (
                <div key={svc.key} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{svc.label}</p>
                    <p className="text-xs text-[var(--muted)]">{svc.note}</p>
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
        </div>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function UserStatusDot({ user }: { user: AdminUser }) {
  const isVerified = !!user.emailVerified
  const hasActivity = user._count.cases > 0
  const isPaying = !!user.subscription || user.creditBalance > 0

  // Priority: paying > active+verified > verified > unverified
  let title = 'Unverifiziert — hat E-Mail noch nicht bestätigt'
  let color = 'bg-gray-300 dark:bg-gray-600'

  if (isVerified && !hasActivity) {
    color = 'bg-amber-400'
    title = 'Verifiziert, aber noch kein Fall erstellt'
  }
  if (isVerified && hasActivity) {
    color = 'bg-green-500'
    title = 'Aktiver Nutzer'
  }
  if (isPaying) {
    color = 'bg-blue-500'
    title = 'Zahlender Nutzer'
  }

  return (
    <div
      className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`}
      title={title}
    />
  )
}

function UserDetailPanel({ detail }: { detail: UserDetail }) {
  return (
    <div className="mx-5 mb-4 border border-[var(--border)] rounded-xl overflow-hidden divide-y divide-[var(--border)]">
      {/* Subscription + credits */}
      <div className="flex items-start gap-6 px-4 py-3 bg-[var(--background-subtle)] flex-wrap">
        <div>
          <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-1">Credits</p>
          <p className="text-lg font-bold text-[var(--foreground)]">{detail.creditBalance}</p>
        </div>
        {detail.subscription ? (
          <div>
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-1">Abonnement</p>
            <p className="text-sm font-medium text-[var(--foreground)]">
              {detail.subscription.planSlug}
              <span className="ml-1.5 text-xs font-normal text-green-600 dark:text-green-400">{detail.subscription.status}</span>
            </p>
            <p className="text-xs text-[var(--muted)]">
              bis {new Date(detail.subscription.currentPeriodEnd).toLocaleDateString('de-DE')}
              {detail.subscription.cancelAtPeriodEnd && ' (kündigt zum Periodenende)'}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-1">Abonnement</p>
            <p className="text-sm text-[var(--muted)]">Kein aktives Abo</p>
          </div>
        )}
      </div>

      {/* Cases */}
      {detail.cases.length > 0 && (
        <div className="px-4 py-3">
          <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-2">
            Fälle ({detail.cases.length})
          </p>
          <div className="space-y-1">
            {detail.cases.map((c) => {
              const s = CASE_STATUS[c.status] ?? { label: c.status, cls: 'bg-gray-100 text-gray-600' }
              return (
                <div key={c.id} className="flex items-center gap-2 text-xs">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${s.cls}`}>{s.label}</span>
                  <span className="text-[var(--foreground)]">{USE_CASE_LABELS[c.useCase] ?? c.useCase}</span>
                  <span className="text-[var(--muted)]">{new Date(c.createdAt).toLocaleDateString('de-DE')}</span>
                  {c._count.outputs > 0 && <span className="text-[var(--muted)]">{c._count.outputs} Outputs</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}
      {detail.cases.length === 0 && (
        <div className="px-4 py-3">
          <p className="text-xs text-[var(--muted)]">Noch keine Fälle erstellt.</p>
        </div>
      )}

      {/* Credit ledger */}
      {detail.ledger.length > 0 && (
        <div className="px-4 py-3">
          <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-2">
            Zahlungen / Gutschriften
          </p>
          <div className="space-y-1">
            {detail.ledger.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 text-xs">
                <span className={`font-semibold w-10 text-right shrink-0 ${entry.delta > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
                </span>
                <span className="text-[var(--foreground)]">{CREDIT_REASON_LABELS[entry.reason] ?? entry.reason}</span>
                <span className="text-[var(--muted)] ml-auto shrink-0">{new Date(entry.createdAt).toLocaleDateString('de-DE')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

