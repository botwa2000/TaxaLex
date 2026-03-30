'use client'

import { useState } from 'react'
import { Tabs } from './ui/Tabs'

export type UserGroup = 'individual' | 'selfemployed' | 'expat' | 'advisor' | 'lawyer'

interface HeroCopy {
  headline: string
  sub: string
  cta: string
  ctaHref: string
}

const HERO_COPY_DE: Record<UserGroup, HeroCopy> = {
  individual: {
    headline: 'Bescheid bekommen? Einspruch einlegen — in Minuten.',
    sub: 'KI-gestützter Einspruch gegen Steuerbescheide, Jobcenter-Bescheide, Bußgelder und mehr. Keine Vorkenntnisse nötig.',
    cta: 'Kostenlos starten',
    ctaHref: '/register',
  },
  selfemployed: {
    headline: 'Steuer-Nachzahlung? Legen Sie Einspruch ein — ohne Anwalt.',
    sub: 'Für Freiberufler und Selbstständige: Finanzamt, Gewerbesteuer, Umsatzsteuer — professioneller Einspruch in Minuten.',
    cta: 'Jetzt Einspruch einlegen',
    ctaHref: '/register',
  },
  expat: {
    headline: 'German notice? Appeal it in minutes — in your language.',
    sub: 'Navigate German bureaucracy with confidence. We generate your official appeal in German, so you don\'t have to.',
    cta: 'Start for free',
    ctaHref: '/register',
  },
  advisor: {
    headline: 'Mehr Mandate. Weniger Aufwand.',
    sub: 'Verwalten Sie Einsprüche für alle Ihre Mandanten zentral — mit KI-gestützter Vorbereitung, die Ihnen Stunden spart.',
    cta: 'Berater-Demo starten',
    ctaHref: '/login?role=advisor',
  },
  lawyer: {
    headline: 'Rechtliche Einsprüche skalieren — effizient und sicher.',
    sub: 'Für Rechtsanwälte und Kanzleien: Mandantenübersicht, KI-Vorlagen, Fristmanagement — alles in einer Oberfläche.',
    cta: 'Anwalt-Zugang anfragen',
    ctaHref: '/login?role=lawyer',
  },
}

const HERO_COPY_EN: Record<UserGroup, HeroCopy> = {
  individual: {
    headline: 'Received a notice? File an objection — in minutes.',
    sub: 'AI-powered appeals against tax assessments, jobcenter notices, fines, and more. No prior knowledge needed.',
    cta: 'Start for free',
    ctaHref: '/register',
  },
  selfemployed: {
    headline: 'Tax demand? File an objection — without a lawyer.',
    sub: 'For freelancers and the self-employed: income tax, trade tax, VAT — professional appeals in minutes.',
    cta: 'File an objection now',
    ctaHref: '/register',
  },
  expat: {
    headline: 'German notice? Appeal it in minutes — in your language.',
    sub: 'Navigate German bureaucracy with confidence. We generate your official appeal in German, so you don\'t have to.',
    cta: 'Start for free',
    ctaHref: '/register',
  },
  advisor: {
    headline: 'More clients. Less overhead.',
    sub: 'Manage appeals for all your clients centrally — with AI-assisted preparation that saves you hours per case.',
    cta: 'Start advisor demo',
    ctaHref: '/login?role=advisor',
  },
  lawyer: {
    headline: 'Scale legal objections — efficiently and securely.',
    sub: 'For attorneys and law firms: client overview, AI templates, deadline management — all in one interface.',
    cta: 'Request lawyer access',
    ctaHref: '/login?role=lawyer',
  },
}

const TAB_LABELS_DE: Record<UserGroup, string> = {
  individual: 'Privatperson',
  selfemployed: 'Selbstständig',
  expat: 'Expat',
  advisor: 'Steuerberater',
  lawyer: 'Rechtsanwalt',
}

const TAB_LABELS_EN: Record<UserGroup, string> = {
  individual: 'Individual',
  selfemployed: 'Self-employed',
  expat: 'Expat',
  advisor: 'Tax advisor',
  lawyer: 'Lawyer',
}

interface UserGroupTabsProps {
  locale: string
  onGroupChange?: (group: UserGroup) => void
  className?: string
}

export function UserGroupTabs({ locale, onGroupChange, className }: UserGroupTabsProps) {
  const [activeGroup, setActiveGroup] = useState<UserGroup>('individual')
  const isEN = locale === 'en'
  const copy = isEN ? HERO_COPY_EN : HERO_COPY_DE
  const labels = isEN ? TAB_LABELS_EN : TAB_LABELS_DE

  const tabItems = (Object.keys(labels) as UserGroup[]).map((g) => ({
    id: g,
    label: labels[g],
  }))

  function handleChange(id: string) {
    const group = id as UserGroup
    setActiveGroup(group)
    onGroupChange?.(group)
  }

  const activeCopy = copy[activeGroup]

  return (
    <div className={className}>
      <Tabs
        items={tabItems}
        activeId={activeGroup}
        onChange={handleChange}
        variant="pills"
        size="sm"
        className="flex-wrap justify-center gap-1 mb-8"
      />
      <div className="text-center max-w-3xl mx-auto animate-fade-in" key={activeGroup}>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--foreground)] leading-tight tracking-tight mb-4">
          {activeCopy.headline}
        </h1>
        <p className="text-lg text-[var(--muted)] leading-relaxed mb-8 max-w-2xl mx-auto">
          {activeCopy.sub}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={activeCopy.ctaHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-base font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm"
          >
            {activeCopy.cta}
          </a>
          {(activeGroup === 'individual' || activeGroup === 'selfemployed') && (
            <a
              href="/wie-es-funktioniert"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-base font-semibold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)] transition-colors"
            >
              {isEN ? 'How it works' : 'Wie es funktioniert'} →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// Export active group copy getter for use in server components
export { HERO_COPY_DE, HERO_COPY_EN }
