export const dynamic = 'force-dynamic'

import { PublicNav } from '@/components/PublicNav'
import { Footer } from '@/components/Footer'
import { PricingCard } from '@/components/PricingCard'
import { TrustBadges } from '@/components/TrustBadges'
import { db } from '@/lib/db'
import { CheckCircle2, Shield, UserCheck, ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'

interface PricingPageProps {
  params: Promise<{ locale: string }>
}

export default async function PricingPage({ params }: PricingPageProps) {
  const { locale } = await params
  const isEN = locale === 'en'

  const rawPlans = await db.pricingPlan.findMany({
    where: { isActive: true, userGroup: 'individual' },
    include: {
      translations: { where: { locale } },
      features: { where: { locale }, orderBy: { sortOrder: 'asc' } },
    },
    orderBy: { sortOrder: 'asc' },
  })
  const plans = rawPlans.map(p => ({
    ...p,
    priceOnce:    p.priceOnce    != null ? Number(p.priceOnce)    : null,
    priceMonthly: p.priceMonthly != null ? Number(p.priceMonthly) : null,
    priceAnnual:  p.priceAnnual  != null ? Number(p.priceAnnual)  : null,
  }))

  // Professional review add-on — prices from DB, fallback to seed defaults
  const [stdAddonPlan, subAddonPlan] = await Promise.all([
    db.pricingPlan.findUnique({ where: { slug: 'expert-review' }, select: { priceOnce: true, translations: { where: { locale } } } }).catch(() => null),
    db.pricingPlan.findUnique({ where: { slug: 'expert-review-subscriber' }, select: { priceOnce: true } }).catch(() => null),
  ])
  const stdAddonPrice = stdAddonPlan?.priceOnce ? Number(stdAddonPlan.priceOnce) : 99
  const subAddonPrice = subAddonPlan?.priceOnce ? Number(subAddonPlan.priceOnce) : 69
  const addonPlanName = stdAddonPlan?.translations[0]?.name ?? (isEN ? 'Professional review' : 'Profi-Prüfung')

  return (
    <>
      <PublicNav locale={locale} />

      {/* Header */}
      <section className="py-16 sm:py-20 px-4 text-center bg-gradient-to-b from-[var(--background)] to-[var(--background-subtle,var(--background))]">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--foreground)] mb-4">
          {isEN ? 'Simple, transparent pricing' : 'Einfache, transparente Preise'}
        </h1>
        <p className="text-lg text-[var(--muted)] max-w-xl mx-auto">
          {isEN
            ? 'Pay per case or subscribe for unlimited access. No hidden fees.'
            : 'Pro Fall oder per Abo. Keine versteckten Kosten.'}
        </p>
      </section>

      {/* Pricing grid — 3 plans + 1 add-on card */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {plans.map((plan) => (
              <PricingCard key={plan.slug} plan={plan} locale={locale} />
            ))}

            {/* Professional review add-on card */}
            <div className="relative flex flex-col bg-[var(--surface)] border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-2xl p-6 transition-shadow hover:shadow-md">
              {/* Optional badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-semibold px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                  {isEN ? 'Optional add-on' : 'Optionale Zubuchung'}
                </span>
              </div>

              {/* Icon + name */}
              <div className="mb-4 pt-2">
                <div className="w-9 h-9 bg-amber-100 dark:bg-amber-950 rounded-xl flex items-center justify-center mb-3">
                  <UserCheck className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                </div>
                <h3 className="text-lg font-bold text-[var(--foreground)]">
                  {isEN ? 'Professional review' : 'Berater-Prüfung'}
                </h3>
                <p className="text-sm text-[var(--muted)] mt-1 leading-relaxed">
                  {isEN
                    ? 'Have your AI-generated letter reviewed by a licensed tax advisor or lawyer before sending.'
                    : 'KI-Entwurf vor dem Versand durch einen zugelassenen Steuerberater oder Anwalt prüfen lassen.'}
                </p>
              </div>

              {/* Two price tiers */}
              <div className="space-y-3 mb-6">
                <div className="bg-[var(--background)] rounded-xl px-4 py-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-[var(--foreground)]">€{stdAddonPrice}</span>
                    <span className="text-sm text-[var(--muted)]">/ {isEN ? 'per case' : 'pro Fall'}</span>
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    {isEN ? 'Single case & 5-pack' : 'Einzelfall & 5er-Paket'}
                  </p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 rounded-xl px-4 py-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-amber-700 dark:text-amber-300">€{subAddonPrice}</span>
                    <span className="text-sm text-amber-600 dark:text-amber-400">/ {isEN ? 'case' : 'Fall'}</span>
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                    {isEN ? 'Monthly flat subscribers' : 'Monats-Flat Abonnenten'}
                  </p>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-6 flex-1">
                {(isEN
                  ? ['Licensed tax advisor or lawyer', 'Approval, comment, or question', 'Response within 48 hours', 'Secure link — no login needed']
                  : ['Zugelassener Steuerberater / Anwalt', 'Freigabe, Kommentar oder Rückfrage', 'Antwort innerhalb von 48 Stunden', 'Sicherer Link — kein Konto nötig']
                ).map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-[var(--foreground)]">{item}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link href="/advisor">
                <button className="w-full flex items-center justify-center gap-2 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                  {isEN ? 'Learn more' : 'Mehr erfahren'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          </div>

          <p className="text-xs text-center text-[var(--muted)] mt-4">
            {isEN ? 'All prices excl. VAT.' : 'Alle Preise zzgl. MwSt.'}
          </p>
        </div>
      </section>

      {/* Legal note */}
      <section className="py-10 px-4 text-center border-t border-[var(--border)]">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-brand-600" />
            <p className="text-sm font-medium text-[var(--foreground)]">
              {isEN ? 'Legal note' : 'Rechtlicher Hinweis'}
            </p>
          </div>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            {isEN
              ? 'TaxaLex generates AI-assisted draft objection letters. These are not legal advice within the meaning of the German Legal Services Act (RDG). Professional review is a quality check by a licensed professional — not a legal representation mandate.'
              : 'TaxaLex erstellt KI-gestützte Einspruchs-Entwürfe. Diese stellen keine Rechtsberatung i.S.d. RDG dar. Die Berater-Prüfung ist eine fachliche Qualitätsprüfung durch einen zugelassenen Fachmann — kein Mandatsverhältnis.'}
          </p>
          <TrustBadges locale={locale} variant="row" className="mt-4" />
        </div>
      </section>

      <Footer locale={locale} />
    </>
  )
}
