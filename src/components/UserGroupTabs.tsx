'use client'

import { Zap, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

interface UserGroupTabsProps {
  locale: string
  onGroupChange?: (group: string) => void
  className?: string
}

export type UserGroup = string

export function UserGroupTabs({ className }: UserGroupTabsProps) {
  const t = useTranslations('hero')
  const tNav = useTranslations('nav')

  return (
    <div className={className}>
      <div className="text-center max-w-3xl mx-auto">

        {/* Social proof badge */}
        <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
          {t('badge')}
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--foreground)] leading-tight tracking-tight mb-5 text-balance">
          {t('groups.individual.headline')}
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-[var(--muted)] leading-relaxed mb-10 max-w-2xl mx-auto">
          {t('groups.individual.sub')}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/einspruch"
            className="inline-flex items-center justify-center gap-2.5 rounded-2xl px-8 py-4 text-lg font-bold bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 transition-colors shadow-md hover:shadow-lg"
          >
            <Zap className="w-5 h-5 shrink-0" />
            {t('groups.individual.cta')}
          </Link>
          <Link
            href="/wie-es-funktioniert"
            className="inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-semibold text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--background-subtle)] transition-colors"
          >
            {tNav('howItWorks')}
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
