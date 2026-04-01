import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { Shield } from 'lucide-react'
import { AdminClient } from './AdminClient'
import { USE_CASES, FAQS, PRICING_PLANS } from '@/lib/contentFallbacks'
import { config } from '@/config/env'

export default async function AdminPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/dashboard')

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [
    users,
    cases,
    totalUsers,
    totalCases,
    newUsersThisWeek,
    openCases,
    submittedCases,
  ] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id:            true,
        name:          true,
        email:         true,
        role:          true,
        creditBalance: true,
        locale:        true,
        createdAt:     true,
        emailVerified: true,
        _count:        { select: { cases: true } },
        subscription:  {
          select: { status: true, planSlug: true, currentPeriodEnd: true },
        },
      },
    }),
    db.case.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: {
        id:        true,
        useCase:   true,
        status:    true,
        createdAt: true,
        deadline:  true,
        userId:    true,
        user:      { select: { name: true, email: true } },
        _count:    { select: { outputs: true } },
      },
    }),
    db.user.count(),
    db.case.count(),
    db.user.count({ where: { createdAt: { gte: oneWeekAgo } } }),
    db.case.count({
      where: {
        status: { in: ['CREATED', 'QUESTIONS', 'GENERATING', 'DRAFT_READY'] as const },
      },
    }),
    db.case.count({
      where: {
        status: { in: ['SUBMITTED', 'AWAITING_RESPONSE'] as const },
      },
    }),
  ])

  const contentStats = {
    useCases:     USE_CASES.filter((u) => u.locale === 'de').length,
    faqs:         FAQS.filter((f) => f.locale === 'de').length,
    pricingPlans: PRICING_PLANS.length,
  }

  const systemHealth = {
    anthropic:  !!config.anthropicApiKey,
    google:     !!config.googleAiApiKey,
    perplexity: !!config.perplexityApiKey,
    stripe:     !!config.stripeSecretKey,
    brevo:      !!config.brevoApiKey,
    s3:         !!config.s3Endpoint,
  }

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

      <AdminClient
        users={users}
        cases={cases}
        stats={{ totalUsers, totalCases, openCases, submittedCases, newUsersThisWeek }}
        contentStats={contentStats}
        systemHealth={systemHealth}
      />
    </div>
  )
}
