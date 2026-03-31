'use client'

import { Zap, ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'

// Props kept for API compatibility — locale is the only prop used now
interface UserGroupTabsProps {
  locale: string
  onGroupChange?: (group: string) => void
  className?: string
}

export type UserGroup = string

export function UserGroupTabs({ locale, className }: UserGroupTabsProps) {
  const isEN = locale === 'en'

  return (
    <div className={className}>
      <div className="text-center max-w-3xl mx-auto">

        {/* Social proof badge */}
        <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
          {isEN
            ? '67 % of objections are fully or partially successful — BMF statistics'
            : '67 % aller Einsprüche werden ganz oder teilweise erstattet — BMF-Statistik'}
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--foreground)] leading-tight tracking-tight mb-5 text-balance">
          {isEN
            ? <>Received an official German notice?<br className="hidden sm:block" /> You can appeal it.</>
            : <>Bescheid bekommen?<br className="hidden sm:block" /> Sie können widersprechen.</>}
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-[var(--muted)] leading-relaxed mb-10 max-w-2xl mx-auto">
          {isEN
            ? 'Most people pay without challenging — because appealing feels complicated and a lawyer costs €200–500. TaxaLex analyses your document, asks the right expert questions, and drafts a well-reasoned objection letter in minutes.'
            : 'Die meisten zahlen, ohne zu widersprechen — weil es kompliziert wirkt und ein Anwalt €200–500 kostet. TaxaLex analysiert Ihr Dokument, stellt die richtigen Fachfragen und erstellt einen fundierten Einspruch in Minuten.'}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/einspruch"
            className="inline-flex items-center justify-center gap-2.5 rounded-2xl px-8 py-4 text-lg font-bold bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 transition-colors shadow-md hover:shadow-lg"
          >
            <Zap className="w-5 h-5 shrink-0" />
            {isEN ? 'Create my objection' : 'Einspruch erstellen'}
          </Link>
          <Link
            href="/wie-es-funktioniert"
            className="inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-semibold text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--background-subtle)] transition-colors"
          >
            {isEN ? 'How it works' : 'Wie es funktioniert'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

// Kept for any remaining imports — no longer used internally
export const HERO_COPY_DE = {}
export const HERO_COPY_EN = {}
