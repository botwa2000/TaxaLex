'use client'

import { useState } from 'react'
import { PublicNav } from '@/components/PublicNav'
import { Footer } from '@/components/Footer'
import { PricingCard } from '@/components/PricingCard'
import { TrustBadges } from '@/components/TrustBadges'
import { getPricingPlans } from '@/lib/contentFallbacks'
import { CheckCircle2, Shield, UserCheck } from 'lucide-react'

type UserGroup = 'individual' | 'selfemployed'

interface PricingPageProps {
  params: Promise<{ locale: string }>
}

// Since we use useState (client) and need locale, we split into wrapper + page
export default function PricingPage({ params }: PricingPageProps) {
  // Next.js 15: in client components params can still be used directly
  // (unwrapping is only for server components with await)
  // We read locale from window path as a fallback
  const [group, setGroup] = useState<UserGroup>('individual')

  // Detect locale from URL path since this is a client component
  const locale = typeof window !== 'undefined'
    ? (window.location.pathname.split('/')[1] ?? 'de')
    : 'de'

  const isEN = locale === 'en'
  const plans = getPricingPlans(group)

  const groups: { key: UserGroup; label: string }[] = isEN
    ? [
        { key: 'individual', label: 'Individual' },
        { key: 'selfemployed', label: 'Self-employed' },
      ]
    : [
        { key: 'individual', label: 'Privatperson' },
        { key: 'selfemployed', label: 'Selbstständig' },
      ]

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
            ? 'Simple pricing — pay per case or subscribe for unlimited access. No hidden fees.'
            : 'Klare Preise — pro Fall oder mit Abo. Keine versteckten Kosten.'}
        </p>
      </section>

      {/* Group tabs */}
      <section className="px-4 pb-4 sticky top-14 z-10 bg-[var(--background)] border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto flex gap-2 py-3 overflow-x-auto">
          {groups.map((g) => (
            <button
              key={g.key}
              onClick={() => setGroup(g.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                group === g.key
                  ? 'bg-brand-600 text-white'
                  : 'bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)] hover:text-[var(--foreground)]'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </section>

      {/* Pricing grid */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <PricingCard key={plan.slug} plan={plan} locale={locale} />
            ))}
          </div>
          <p className="text-xs text-center text-[var(--muted)] mt-4">
            {isEN ? 'All prices excl. VAT.' : 'Alle Preise zzgl. MwSt.'}
          </p>
        </div>
      </section>

      {/* Professional review add-on */}
      <section className="py-16 px-4 bg-[var(--surface)] border-y border-[var(--border)]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-12 h-12 bg-brand-100 dark:bg-brand-950 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-6 h-6 text-brand-600" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">
            {isEN ? 'Optional: professional review' : 'Optional: Prüfung durch Fachmann'}
          </h2>
          <p className="text-[var(--muted)] mb-6 leading-relaxed">
            {isEN
              ? 'Add a review by a licensed tax advisor or lawyer to any case. The professional receives a secure link, checks the AI draft, and either approves it or sends targeted feedback — no appointment needed.'
              : 'Jeder Fall kann optional durch einen zugelassenen Steuerberater oder Rechtsanwalt geprüft werden. Der Fachmann erhält einen sicheren Link, prüft den KI-Entwurf und gibt ihn frei oder sendet gezieltes Feedback — kein Kanzlei-Termin nötig.'}
          </p>
          <div className="inline-flex items-baseline gap-2 bg-[var(--background)] border border-[var(--border)] rounded-2xl px-8 py-5 mb-6">
            <span className="text-4xl font-extrabold text-[var(--foreground)]">€49</span>
            <span className="text-[var(--muted)] text-sm">{isEN ? '/ case' : '/ Fall'}</span>
          </div>
          <ul className="text-sm text-[var(--muted)] space-y-2 mb-2">
            {(isEN
              ? ['Licensed tax advisor or lawyer', 'Approval or written feedback within 48 h', 'Secure link — no account needed for the reviewer', 'Add to any plan at checkout']
              : ['Zugelassener Steuerberater oder Rechtsanwalt', 'Freigabe oder schriftliches Feedback innerhalb 48 h', 'Sicherer Link — kein Konto für den Prüfer nötig', 'Zu jedem Plan beim Kauf zubuchbar']
            ).map((item) => (
              <li key={item} className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-xs text-[var(--muted)] mt-4">
            {isEN
              ? 'Note: Professional review is a quality check, not legal advice within the meaning of the RDG.'
              : 'Hinweis: Die Berater-Prüfung ist eine fachliche Qualitätsprüfung, keine Rechtsberatung i.S.d. RDG.'}
          </p>
        </div>
      </section>

      {/* Legal note */}
      <section className="py-10 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-brand-600" />
            <p className="text-sm font-medium text-[var(--foreground)]">
              {isEN ? 'Legal note' : 'Rechtlicher Hinweis'}
            </p>
          </div>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            {isEN
              ? 'TaxaLex generates AI-assisted draft objection letters. These are not legal advice within the meaning of the German Legal Services Act (RDG).'
              : 'TaxaLex erstellt KI-gestützte Einspruchs-Entwürfe. Diese stellen keine Rechtsberatung i.S.d. Rechtsdienstleistungsgesetzes (RDG) dar.'}
          </p>
          <TrustBadges locale={locale} variant="row" className="mt-4" />
        </div>
      </section>

      <Footer locale={locale} />
    </>
  )
}
