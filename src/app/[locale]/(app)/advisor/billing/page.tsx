import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { DEMO_CLIENTS, getAdvisorStats } from '@/lib/mockData'
import { CreditCard, CheckCircle2 } from 'lucide-react'
import { Link } from '@/i18n/navigation'

export default async function AdvisorBillingPage() {
  const session = await auth()
  if (!session) redirect('/login')
  if (!['ADVISOR', 'LAWYER', 'ADMIN'].includes(session.user?.role ?? '')) {
    redirect('/dashboard')
  }

  const advisorId = session.user?.id ?? 'demo_advisor_001'
  const stats = getAdvisorStats(advisorId)

  const userGroup = session.user?.role === 'LAWYER' ? 'lawyer' : 'advisor'

  const plans = await db.pricingPlan.findMany({
    where: { isActive: true, userGroup },
    include: {
      translations: { where: { locale: 'de' } },
      features: { where: { locale: 'de' }, orderBy: { sortOrder: 'asc' } },
    },
    orderBy: { sortOrder: 'asc' },
  }).catch(() => [])

  const currentPlan = plans[0] // Monthly plan is the only advisor plan

  const planTranslation = currentPlan?.translations[0] ?? null
  const features = currentPlan?.features.filter((f) => f.included) ?? []

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
          <CreditCard className="w-4 h-4 text-green-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Abrechnung</h1>
          <p className="text-sm text-[var(--muted)]">Ihr Berater-Plan und Nutzungsübersicht</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        {/* Current plan */}
        <div className="sm:col-span-2 bg-[var(--surface)] rounded-xl border border-brand-200 dark:border-brand-800 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">Aktueller Plan</p>
              <h2 className="text-xl font-bold text-[var(--foreground)]">{planTranslation?.name ?? 'Berater-Plan'}</h2>
              <p className="text-sm text-[var(--muted)] mt-1">{planTranslation?.description}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-[var(--foreground)]">
                €{currentPlan?.priceMonthly?.toFixed(2)}
              </p>
              <p className="text-xs text-[var(--muted)]">/ Monat zzgl. MwSt.</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {features.map((f) => (
              <div key={f.text} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                <span className="text-[var(--foreground)]">{f.text}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between">
            <p className="text-xs text-[var(--muted)]">Verlängert sich am 01.04.2026</p>
            <button
              type="button"
              className="text-xs text-red-600 hover:underline"
            >
              Abo kündigen
            </button>
          </div>
        </div>

        {/* Usage stats */}
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6">
          <h3 className="font-semibold text-sm text-[var(--foreground)] mb-4">Nutzung diesen Monat</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-[var(--muted)] mb-1.5">
                <span>Mandanten</span>
                <span className="font-medium text-[var(--foreground)]">{stats.totalClients} / ∞</span>
              </div>
              <div className="h-1.5 bg-[var(--border)] rounded-full">
                <div className="h-1.5 bg-brand-600 rounded-full w-2/5" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-[var(--muted)] mb-1.5">
                <span>Einsprüche</span>
                <span className="font-medium text-[var(--foreground)]">{stats.totalCases} / ∞</span>
              </div>
              <div className="h-1.5 bg-[var(--border)] rounded-full">
                <div className="h-1.5 bg-brand-600 rounded-full w-3/5" />
              </div>
            </div>
          </div>
          <p className="text-xs text-[var(--muted)] mt-4">Unbegrenzte Nutzung im Berater-Plan</p>
        </div>
      </div>

      {/* Invoice history placeholder */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)]">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h2 className="font-semibold text-sm text-[var(--foreground)]">Rechnungen</h2>
        </div>
        <div className="px-5 py-10 text-center">
          <CreditCard className="w-8 h-8 text-[var(--muted)] mx-auto mb-3" />
          <p className="text-sm font-medium text-[var(--foreground)] mb-1">Noch keine Rechnungen</p>
          <p className="text-xs text-[var(--muted)]">
            Rechnungen erscheinen hier nach dem ersten Zahlungseingang.
          </p>
        </div>
      </div>

      <p className="text-xs text-center text-[var(--muted)] mt-4">
        Stripe-Zahlungsintegration folgt. Kontakt:{' '}
        <Link href="/kontakt" className="text-brand-600 hover:underline">
          info@taxalex.de
        </Link>
      </p>
    </div>
  )
}
