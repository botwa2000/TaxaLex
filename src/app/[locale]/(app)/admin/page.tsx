import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { DEMO_USERS, DEMO_CASES } from '@/lib/mockData'
import { Shield } from 'lucide-react'
import { AdminClient } from './AdminClient'
import { USE_CASES, FAQS, PRICING_PLANS } from '@/lib/contentFallbacks'

export default async function AdminPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/dashboard')

  const stats = {
    totalUsers: DEMO_USERS.length,
    totalCases: DEMO_CASES.length,
    openCases: DEMO_CASES.filter((c) =>
      ['CREATED', 'QUESTIONS', 'GENERATING', 'DRAFT_READY'].includes(c.status)
    ).length,
    submittedCases: DEMO_CASES.filter((c) =>
      ['SUBMITTED', 'AWAITING_RESPONSE'].includes(c.status)
    ).length,
  }

  // Content stats: count DE-locale entries only to avoid double-counting
  const contentStats = {
    useCases: USE_CASES.filter((u) => u.locale === 'de').length,
    faqs: FAQS.filter((f) => f.locale === 'de').length,
    pricingPlans: PRICING_PLANS.length,
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
        users={DEMO_USERS as Parameters<typeof AdminClient>[0]['users']}
        cases={DEMO_CASES as Parameters<typeof AdminClient>[0]['cases']}
        stats={stats}
        contentStats={contentStats}
      />
    </div>
  )
}
