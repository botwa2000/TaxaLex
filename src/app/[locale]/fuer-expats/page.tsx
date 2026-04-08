export const dynamic = 'force-dynamic'

import { getTranslations } from 'next-intl/server'
import { PublicNav } from '@/components/PublicNav'
import { Footer } from '@/components/Footer'
import { TrustBadges } from '@/components/TrustBadges'
import { UseCaseCard } from '@/components/UseCaseCard'
import { db } from '@/lib/db'
import { Globe, FileText, CheckCircle2, Clock, ArrowRight, Languages } from 'lucide-react'
import { Link } from '@/i18n/navigation'

const LANGUAGES = [
  { flag: '🇩🇪', lang: 'Deutsch' },
  { flag: '🇬🇧', lang: 'English' },
  { flag: '🇹🇷', lang: 'Türkçe' },
  { flag: '🇷🇺', lang: 'Русский' },
  { flag: '🇵🇱', lang: 'Polski' },
  { flag: '🇺🇦', lang: 'Українська' },
  { flag: '🇸🇦', lang: 'العربية' },
]

export default async function FuerExpatsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('expatsPage')

  // Show the 4 most relevant use cases for expats — always in English
  const rawExpatUseCases = await db.useCase.findMany({
    where: {
      locale: 'en',
      isActive: true,
      slug: { in: ['tax', 'jobcenter', 'bussgeld', 'krankenversicherung'] },
    },
    orderBy: { sortOrder: 'asc' },
  })
  const expatUseCases = rawExpatUseCases.map(uc => ({ ...uc, successRate: uc.successRate ?? undefined, badge: uc.badge ?? undefined }))

  const features = [
    { icon: Languages, titleKey: 'feature1Title' as const, descKey: 'feature1Desc' as const },
    { icon: FileText,  titleKey: 'feature2Title' as const, descKey: 'feature2Desc' as const },
    { icon: Clock,     titleKey: 'feature3Title' as const, descKey: 'feature3Desc' as const },
    { icon: Globe,     titleKey: 'feature4Title' as const, descKey: 'feature4Desc' as const },
  ]

  return (
    <>
      <PublicNav locale={locale} />

      {/* Hero */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-b from-[var(--background)] to-[var(--background-subtle,var(--background))]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-brand-200 dark:border-brand-800 mb-6">
            <Globe className="w-3.5 h-3.5" />
            {t('heroBadge')}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--foreground)] mb-4">
            {t('heroTitle')}
          </h1>
          <p className="text-lg text-[var(--muted)] leading-relaxed mb-8">
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-brand-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-brand-700 transition-colors"
            >
              {t('ctaRegister')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/einspruch"
              className="inline-flex items-center gap-2 border border-[var(--border)] text-[var(--foreground)] px-8 py-3.5 rounded-xl font-semibold hover:bg-[var(--background-subtle)] transition-colors"
            >
              {t('ctaTryWithout')}
            </Link>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-[var(--border)] bg-[var(--surface)] py-4 px-4">
        <TrustBadges locale={locale} variant="row" className="max-w-4xl mx-auto" />
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-10 text-center">
            {t('featuresTitle')}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.titleKey} className="flex flex-col gap-3">
                <div className="w-10 h-10 bg-brand-100 dark:bg-brand-950 rounded-xl flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-brand-700 dark:text-brand-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--foreground)] mb-1">{t(f.titleKey)}</h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{t(f.descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Most relevant use cases for expats */}
      <section className="py-16 px-4 bg-[var(--surface)] border-y border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">
              {t('useCasesTitle')}
            </h2>
            <p className="text-[var(--muted)]">
              {t('useCasesSubtitle')}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {expatUseCases.map((uc) => (
              <UseCaseCard key={uc.slug} useCase={uc} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      {/* Languages supported */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
            {t('languagesTitle')}
          </h2>
          <p className="text-[var(--muted)] mb-8">
            {t('languagesSubtitle')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {LANGUAGES.map((l) => (
              <div
                key={l.lang}
                className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm"
              >
                <span className="text-base">{l.flag}</span>
                <span className="text-[var(--foreground)] font-medium">{l.lang}</span>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-brand-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-brand-700 transition-colors"
            >
              {t('ctaStartFree')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer locale={locale} />
    </>
  )
}
