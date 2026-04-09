import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PublicNav } from '@/components/PublicNav'
import { Footer } from '@/components/Footer'
import { Link } from '@/i18n/navigation'
import {
  FileText, Users, Clock, AlertTriangle, Shield, Briefcase,
  Home, MapPin, ArrowRight, Zap, CheckCircle2, Scale,
} from 'lucide-react'

const USE_CASES = [
  {
    id: 'tax',
    icon: FileText,
    iconBg: 'bg-blue-50 dark:bg-blue-950',
    iconColor: 'text-blue-600 dark:text-blue-400',
    law: '§ 347 AO',
    slug: 'tax',
  },
  {
    id: 'grundsteuer',
    icon: MapPin,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    law: '§ 347 AO, GrStG',
    slug: 'grundsteuer',
    hot: true,
  },
  {
    id: 'jobcenter',
    icon: Users,
    iconBg: 'bg-orange-50 dark:bg-orange-950',
    iconColor: 'text-orange-600 dark:text-orange-400',
    law: '§ 78 SGG',
    slug: 'jobcenter',
  },
  {
    id: 'rente',
    icon: Clock,
    iconBg: 'bg-purple-50 dark:bg-purple-950',
    iconColor: 'text-purple-600 dark:text-purple-400',
    law: '§ 78 SGG',
    slug: 'rente',
  },
  {
    id: 'krankenversicherung',
    icon: Shield,
    iconBg: 'bg-red-50 dark:bg-red-950',
    iconColor: 'text-red-600 dark:text-red-400',
    law: '§ 78 SGG, § 12 SGB V',
    slug: 'krankenversicherung',
  },
  {
    id: 'kuendigung',
    icon: Briefcase,
    iconBg: 'bg-amber-50 dark:bg-amber-950',
    iconColor: 'text-amber-600 dark:text-amber-400',
    law: '§ 4 KSchG',
    urgent: true,
    slug: 'kuendigung',
  },
  {
    id: 'miete',
    icon: Home,
    iconBg: 'bg-teal-50 dark:bg-teal-950',
    iconColor: 'text-teal-600 dark:text-teal-400',
    law: '§§ 558–558e BGB',
    slug: 'miete',
  },
  {
    id: 'bussgeld',
    icon: AlertTriangle,
    iconBg: 'bg-rose-50 dark:bg-rose-950',
    iconColor: 'text-rose-600 dark:text-rose-400',
    law: '§ 67 OWiG',
    slug: 'bussgeld',
  },
]

export default async function AnwendungsfaellePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'useCasePage' })

  return (
    <>
      <PublicNav locale={locale} />

      {/* Hero */}
      <section className="py-16 sm:py-20 px-4 bg-gradient-to-b from-[var(--background)] to-[var(--background-subtle)]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Scale className="w-4 h-4" />
            {t('badge')}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--foreground)] mb-5 leading-tight">
            {t('heroTitle')}
          </h1>
          <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto leading-relaxed mb-8">
            {t('heroSubtitle')}
          </p>
          <Link
            href="/einspruch?demo=true"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-4 rounded-2xl transition-colors text-lg shadow-sm"
          >
            <Zap className="w-5 h-5" />
            {t('heroCta')}
          </Link>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          {USE_CASES.map((uc) => {
            const Icon = uc.icon

            return (
              <div
                id={uc.id}
                key={uc.id}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-7 hover:border-brand-200 dark:hover:border-brand-800 hover:shadow-md transition-all scroll-mt-24"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 ${uc.iconBg} rounded-2xl flex items-center justify-center shrink-0`}>
                    <Icon className={`w-6 h-6 ${uc.iconColor}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h2 className="text-xl font-bold text-[var(--foreground)]">{t(`cases.${uc.id}.title`)}</h2>
                      {uc.hot && (
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0">
                          {t('hotBadge')}
                        </span>
                      )}
                      {uc.urgent && (
                        <span className="text-[10px] bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0">
                          {t('urgentBadge')}
                        </span>
                      )}
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="text-xs bg-[var(--background-subtle)] text-[var(--muted)] px-2.5 py-1 rounded-full font-medium">
                        {uc.law}
                      </span>
                      <span className={`flex items-center gap-1 text-xs font-semibold ${uc.urgent ? 'text-red-600 dark:text-red-400' : 'text-[var(--muted)]'}`}>
                        <Clock className="w-3.5 h-3.5" />
                        {t('deadlineLabel')}: {t(`cases.${uc.id}.deadline`)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-green-700 dark:text-green-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t(`cases.${uc.id}.success`)}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-[var(--muted)] leading-relaxed mb-4">{t(`cases.${uc.id}.desc`)}</p>

                    {/* Tip */}
                    <div className="flex items-start gap-2 bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900 rounded-xl px-3 py-2.5 mb-5">
                      <span className="text-brand-500 text-sm mt-0.5">💡</span>
                      <p className="text-xs text-brand-800 dark:text-brand-300 leading-relaxed">{t(`cases.${uc.id}.tip`)}</p>
                    </div>

                    {/* CTA buttons */}
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/einspruch?type=${uc.slug}&demo=true`}
                        className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        {t('ctaStart')}
                      </Link>
                      <Link
                        href={`/vorlagen?category=${uc.id}`}
                        className="inline-flex items-center gap-2 border border-[var(--border)] text-[var(--foreground)] hover:border-brand-300 font-medium px-5 py-2.5 rounded-xl text-sm transition-colors"
                      >
                        {t('ctaTemplate')}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 bg-brand-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t('bottomTitle')}
          </h2>
          <p className="text-brand-100 text-lg mb-8 leading-relaxed">
            {t('bottomSubtitle')}
          </p>
          <Link
            href="/einspruch?demo=true"
            className="inline-flex items-center gap-2 bg-white text-brand-700 hover:bg-brand-50 font-bold px-8 py-4 rounded-2xl transition-colors text-lg"
          >
            <Zap className="w-5 h-5" />
            {t('bottomCta')}
          </Link>
        </div>
      </section>

      <Footer locale={locale} />
    </>
  )
}
