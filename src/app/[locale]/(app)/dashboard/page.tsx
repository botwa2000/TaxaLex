import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Plus, AlertTriangle, FolderOpen, ArrowRight, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'
import { DEMO_USER_ID, DEMO_CASES, getDemoStats } from '@/lib/mockData'
import { Link } from '@/i18n/navigation'
import { VerifyBanner } from './VerifyBanner'
import { getTranslations } from 'next-intl/server'

type CaseSummary = {
  id: string
  useCase: string
  status: string
  deadline: Date | null
  createdAt: Date
  updatedAt: Date
}

type TDash = Awaited<ReturnType<typeof getTranslations<'dashboard'>>>

export default async function DashboardPage() {
  const session = await auth()
  const role = session?.user?.role ?? 'USER'

  // Advisors and lawyers get their own dedicated dashboard
  if (role === 'ADVISOR' || role === 'LAWYER') {
    redirect('/advisor/dashboard')
  }

  const userId = session!.user!.id as string
  const [t, tUC] = await Promise.all([
    getTranslations('dashboard'),
    getTranslations('useCases'),
  ])

  let cases: CaseSummary[] = []
  let stats = { open: 0, submitted: 0, urgent: 0, total: 0 }
  let emailVerified: Date | null = null

  const isDemo = userId.startsWith('demo_')

  try {
    if (isDemo) throw new Error('demo')
    const { db } = await import('@/lib/db')
    const [rawCases, userRecord] = await Promise.all([
      db.case.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 20,
        select: { id: true, useCase: true, status: true, deadline: true, createdAt: true, updatedAt: true },
      }),
      db.user.findUnique({
        where: { id: userId },
        select: { emailVerified: true },
      }),
    ])
    cases = rawCases as CaseSummary[]
    emailVerified = userRecord?.emailVerified ?? null
    const now = new Date()
    const openStatuses = ['CREATED', 'UPLOADING', 'ANALYZING', 'QUESTIONS', 'GENERATING', 'DRAFT_READY']
    stats = {
      open: cases.filter((c) => openStatuses.includes(c.status)).length,
      submitted: cases.filter((c) => ['SUBMITTED', 'AWAITING_RESPONSE'].includes(c.status)).length,
      urgent: cases.filter((c) => c.deadline && daysBetween(now, c.deadline) <= 7 && c.deadline > now).length,
      total: cases.length,
    }
  } catch {
    cases = DEMO_CASES as CaseSummary[]
    stats = getDemoStats()
  }

  const now = new Date()
  const urgentCases = cases.filter(
    (c) => c.deadline && c.deadline > now && daysBetween(now, c.deadline) <= 7
  )

  // Pre-build translated label maps to avoid dynamic key calls in child components
  const statusLabels: Record<string, string> = {
    CREATED: t('status.CREATED'),
    UPLOADING: t('status.UPLOADING'),
    ANALYZING: t('status.ANALYZING'),
    QUESTIONS: t('status.QUESTIONS'),
    GENERATING: t('status.GENERATING'),
    DRAFT_READY: t('status.DRAFT_READY'),
    SUBMITTED: t('status.SUBMITTED'),
    AWAITING_RESPONSE: t('status.AWAITING_RESPONSE'),
    CLOSED_SUCCESS: t('status.CLOSED_SUCCESS'),
    CLOSED_PARTIAL: t('status.CLOSED_PARTIAL'),
    REJECTED: t('status.REJECTED'),
  }
  const useCaseLabels: Record<string, string> = {
    tax: tUC('tax'),
    jobcenter: tUC('jobcenter'),
    rente: tUC('rente'),
    bussgeld: tUC('bussgeld'),
    bussgeldd: tUC('bussgeldd'),
    krankenversicherung: tUC('krankenversicherung'),
    kuendigung: tUC('kuendigung'),
    miete: tUC('miete'),
    grundsteuer: tUC('grundsteuer'),
    sonstige: tUC('sonstige'),
  }

  return (
    <div>
      {!emailVerified && <VerifyBanner />}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
          {role === 'ADMIN'
            ? t('welcomeAdmin', { name: session?.user?.name ?? '' })
            : t('welcome', { name: session?.user?.name ?? '' })}
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          {role === 'ADMIN' ? t('adminSubtitle') : t('subtitle')}
        </p>
        {role === 'ADMIN' && (
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline mt-1"
          >
            {t('openAdminPanel')} <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 mb-8">
        <StatCard icon={FolderOpen} label={t('stats.openCases')} value={stats.open} iconClass="bg-blue-50 text-blue-600" />
        <StatCard icon={TrendingUp} label={t('stats.submittedCases')} value={stats.submitted} iconClass="bg-green-50 text-green-600" />
        <StatCard
          icon={AlertTriangle}
          label={t('stats.urgentDeadlines')}
          value={stats.urgent}
          iconClass={stats.urgent > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}
          urgent={stats.urgent > 0}
        />
        <StatCard icon={CheckCircle2} label={t('stats.totalCases')} value={stats.total} iconClass="bg-purple-50 text-purple-600" />
      </div>

      {urgentCases.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-800 text-sm">
              {t('urgentWarning', { count: urgentCases.length })}
            </p>
            {urgentCases.map((c) => (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="flex items-center gap-1 text-sm text-red-700 mt-1 hover:text-red-900 hover:underline"
              >
                {useCaseLabels[c.useCase] ?? c.useCase}
                {' '}(#{c.id.slice(-6).toUpperCase()}) — {t('daysLeft', { days: daysBetween(now, c.deadline!) })}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Link href="/einspruch" className="bg-brand-600 text-white rounded-2xl p-5 hover:bg-brand-700 active:bg-brand-800 transition-colors group shadow-sm hover:shadow-md">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <p className="font-bold text-base">{t('quickActions.newCase')}</p>
          <p className="text-sm text-brand-200 mt-0.5">{t('quickActions.newCaseSubtitle')}</p>
        </Link>
        <Link href="/cases" className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 hover:border-brand-300 hover:shadow-md transition-all">
          <div className="w-10 h-10 bg-[var(--background-subtle)] rounded-xl flex items-center justify-center mb-3">
            <FolderOpen className="w-5 h-5 text-[var(--muted)]" />
          </div>
          <p className="font-bold text-base text-[var(--foreground)]">{t('quickActions.viewCases')}</p>
          <p className="text-sm text-[var(--muted)] mt-0.5">{t('quickActions.viewCasesSubtitle')}</p>
        </Link>
        <Link href="/billing" className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 hover:border-brand-300 hover:shadow-md transition-all">
          <div className="w-10 h-10 bg-[var(--background-subtle)] rounded-xl flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-[var(--muted)]" />
          </div>
          <p className="font-bold text-base text-[var(--foreground)]">{t('quickActions.upgradePlan')}</p>
          <p className="text-sm text-[var(--muted)] mt-0.5">{t('quickActions.upgradePlanSubtitle')}</p>
        </Link>
      </div>

      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)]">
        <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="font-semibold text-sm text-[var(--foreground)]">{t('recentActivity')}</h2>
          <Link href="/cases" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
            {t('viewAll')} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {cases.length === 0 ? (
          <div className="text-center py-16 text-[var(--muted)]">
            <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-sm">{t('noCases')}</p>
            <p className="text-xs mt-1 mb-4">{t('noCasesHint')}</p>
            <Link
              href="/einspruch"
              className="inline-flex items-center gap-1.5 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('startFirst')}
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {cases.slice(0, 6).map((c) => (
              <CaseRow key={c.id} c={c} now={now} t={t} statusLabels={statusLabels} useCaseLabels={useCaseLabels} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CaseRow({ c, now, t, statusLabels, useCaseLabels }: {
  c: CaseSummary; now: Date; t: TDash
  statusLabels: Record<string, string>; useCaseLabels: Record<string, string>
}) {
  const daysLeft = c.deadline ? daysBetween(now, c.deadline) : null
  const isUrgent = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0
  const isOverdue = daysLeft !== null && daysLeft < 0

  return (
    <Link
      href={`/cases/${c.id}`}
      className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--background-subtle)] transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--foreground)] truncate">
          {useCaseLabels[c.useCase] ?? c.useCase}
          <span className="text-[var(--muted)] font-normal ml-2 text-xs">#{c.id.slice(-6).toUpperCase()}</span>
        </p>
        <p className="text-xs text-[var(--muted)] mt-0.5">
          {t('updatedAt', { date: new Date(c.updatedAt).toLocaleDateString() })}
        </p>
      </div>
      {c.deadline && (
        <div className={`text-xs font-medium ${isOverdue ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-[var(--muted)]'}`}>
          {isOverdue ? t('overdueLabel') : t('daysLeft', { days: daysLeft! })}
        </div>
      )}
      <StatusBadge status={c.status} labels={statusLabels} />
      <ArrowRight className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
    </Link>
  )
}

function StatCard({ icon: Icon, label, value, iconClass, urgent }: {
  icon: React.ElementType; label: string; value: number; iconClass: string; urgent?: boolean
}) {
  return (
    <div className={`bg-[var(--surface)] rounded-2xl border p-5 ${urgent && value > 0 ? 'border-red-200 dark:border-red-900' : 'border-[var(--border)]'}`}>
      <div className={`w-10 h-10 rounded-xl ${iconClass} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-3xl font-black text-[var(--foreground)] leading-none mb-1">{value}</p>
      <p className="text-sm text-[var(--muted)]">{label}</p>
    </div>
  )
}

function StatusBadge({ status, labels }: { status: string; labels: Record<string, string> }) {
  const colorMap: Record<string, string> = {
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
    CLOSED_REJECTED: 'bg-red-50 text-red-700',
    REJECTED: 'bg-red-50 text-red-700',
  }
  const className = colorMap[status] ?? 'bg-gray-100 text-gray-600'
  const label = labels[status] ?? status
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${className}`}>{label}</span>
}

function daysBetween(a: Date, b: Date) {
  return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}
