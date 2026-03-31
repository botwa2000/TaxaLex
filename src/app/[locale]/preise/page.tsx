'use client'

import { useState } from 'react'
import { PublicNav } from '@/components/PublicNav'
import { Footer } from '@/components/Footer'
import { PricingCard } from '@/components/PricingCard'
import { TrustBadges } from '@/components/TrustBadges'
import { getPricingPlans } from '@/lib/contentFallbacks'
import { CheckCircle2, Shield } from 'lucide-react'

type UserGroup = 'individual' | 'selfemployed' | 'advisor' | 'lawyer'

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
        { key: 'advisor', label: 'Tax advisor' },
        { key: 'lawyer', label: 'Lawyer' },
      ]
    : [
        { key: 'individual', label: 'Privatperson' },
        { key: 'selfemployed', label: 'Selbstständig' },
        { key: 'advisor', label: 'Steuerberater' },
        { key: 'lawyer', label: 'Rechtsanwalt' },
      ]

  const comparisonFeatures = isEN
    ? [
        { feature: 'AI objection letter (5 agents)', individual: true, advisor: true },
        { feature: 'Document upload (PDF, photo, scan)', individual: true, advisor: true },
        { feature: 'German-language output', individual: true, advisor: true },
        { feature: 'Download DOCX / TXT', individual: true, advisor: true },
        { feature: 'Multi-client dashboard', individual: false, advisor: true },
        { feature: 'Client management', individual: false, advisor: true },
        { feature: 'White-label export', individual: false, advisor: true },
        { feature: 'Priority processing', individual: false, advisor: true },
      ]
    : [
        { feature: 'KI-Einspruchsschreiben (5 Agenten)', individual: true, advisor: true },
        { feature: 'Dokument-Upload (PDF, Foto, Scan)', individual: true, advisor: true },
        { feature: 'Ausgabe auf Deutsch', individual: true, advisor: true },
        { feature: 'Download DOCX / TXT', individual: true, advisor: true },
        { feature: 'Multi-Mandanten-Dashboard', individual: false, advisor: true },
        { feature: 'Mandantenverwaltung', individual: false, advisor: true },
        { feature: 'White-Label-Export', individual: false, advisor: true },
        { feature: 'Priorisierte Verarbeitung', individual: false, advisor: true },
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

      {/* Comparison table */}
      <section className="py-16 px-4 bg-[var(--surface)] border-y border-[var(--border)]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-8 text-center">
            {isEN ? 'Individual vs. advisor' : 'Privat vs. Berater'}
          </h2>
          <div className="border border-[var(--border)] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 bg-[var(--background-subtle)] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              <span>{isEN ? 'Feature' : 'Funktion'}</span>
              <span className="text-center">{isEN ? 'Individual' : 'Privat'}</span>
              <span className="text-center">{isEN ? 'Advisor' : 'Berater'}</span>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {comparisonFeatures.map((row) => (
                <div key={row.feature} className="grid grid-cols-3 px-6 py-3.5 text-sm">
                  <span className="text-[var(--foreground)]">{row.feature}</span>
                  <span className="text-center">
                    {row.individual
                      ? <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                      : <span className="text-[var(--muted)]">–</span>}
                  </span>
                  <span className="text-center">
                    {row.advisor
                      ? <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                      : <span className="text-[var(--muted)]">–</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
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
