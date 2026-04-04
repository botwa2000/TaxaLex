import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AlertTriangle, FolderOpen, ArrowRight, TrendingUp, Clock, CheckCircle2, Plus } from 'lucide-react'
import { DEMO_CASES, getDemoStats } from '@/lib/mockData'
import { Link } from '@/i18n/navigation'
import { VerifyBanner } from './VerifyBanner'
import { DashboardCaseList } from './DashboardCaseList'
import { getTranslations } from 'next-intl/server'

type CaseSummary = {
  id: string
  useCase: string
  status: string
  deadline: Date | null
  createdAt: Date
  updatedAt: Date
}

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

  // Use case labels needed only for the urgent warning section
  const ucLabels: Record<string, string> = {
    tax: tUC('tax'), jobcenter: tUC('jobcenter'), rente: tUC('rente'),
    bussgeld: tUC('bussgeld'), bussgeldd: tUC('bussgeldd'),
    krankenversicherung: tUC('krankenversicherung'), kuendigung: tUC('kuendigung'),
    miete: tUC('miete'), grundsteuer: tUC('grundsteuer'), sonstige: tUC('sonstige'),
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
                {ucLabels[c.useCase] ?? c.useCase}
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
        <DashboardCaseList initialCases={cases.slice(0, 6)} />
      </div>
    </div>
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

function daysBetween(a: Date, b: Date) {
  return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}
