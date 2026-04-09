import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PublicNav } from '@/components/PublicNav'
import { Footer } from '@/components/Footer'
import { TrustBadges } from '@/components/TrustBadges'
import { Upload, Brain, Download, FileText, Eye, Scale, Layers, Shield, CheckCircle2, ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'

const AGENT_KEYS = [
  { key: 'drafter', name: 'Drafter', icon: FileText, color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  { key: 'reviewer', name: 'Reviewer', icon: Eye, color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
  { key: 'factChecker', name: 'Fact-Checker', icon: Scale, color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  { key: 'adversary', name: 'Adversary', icon: Shield, color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
  { key: 'consolidator', name: 'Consolidator', icon: Layers, color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' },
] as const

export default async function HowItWorksPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'howItWorksPage' })

  return (
    <>
      <PublicNav locale={locale} />

      {/* Header */}
      <section className="py-16 sm:py-20 px-4 bg-gradient-to-b from-[var(--background)] to-[var(--background-subtle,var(--background))]">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--foreground)] mb-4">
            {t('heroTitle')}
          </h1>
          <p className="text-lg text-[var(--muted)] leading-relaxed">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Step 1 */}
      <section className="py-16 px-4 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-brand-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl shrink-0">1</div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">
                {t('step1Title')}
              </h2>
              <p className="text-[var(--muted)]">
                {t('step1Subtitle')}
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
              <Upload className="w-6 h-6 text-brand-600 mb-3" />
              <h3 className="font-semibold text-[var(--foreground)] mb-2">
                {t('formatsTitle')}
              </h3>
              <ul className="text-sm text-[var(--muted)] space-y-1">
                <li>{t('formatPdf')}</li>
                <li>{t('formatImg')}</li>
                <li>{t('formatDocx')}</li>
                <li>{t('formatTxt')}</li>
              </ul>
              <p className="text-xs text-[var(--muted)] mt-3">
                {t('formatNote')}
              </p>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
              <CheckCircle2 className="w-6 h-6 text-brand-600 mb-3" />
              <h3 className="font-semibold text-[var(--foreground)] mb-2">
                {t('extractionTitle')}
              </h3>
              <p className="text-sm text-[var(--muted)]">
                {t('extractionDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Step 2 */}
      <section className="py-16 px-4 bg-[var(--surface)] border-y border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-brand-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl shrink-0">2</div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">
                {t('step2Title')}
              </h2>
              <p className="text-[var(--muted)]">
                {t('step2Subtitle')}
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AGENT_KEYS.map((agent, i) => (
              <div key={agent.key} className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${agent.color}`}>
                  <agent.icon className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-[var(--muted)]">#{i + 1}</span>
                  <h3 className="font-semibold text-sm text-[var(--foreground)]">{agent.name}</h3>
                </div>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  {t(`agents.${agent.key}.description`)}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--muted)] mt-6 text-center">
            {t('analysisNote')}
          </p>
        </div>
      </section>

      {/* Step 3 */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-brand-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl shrink-0">3</div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">
                {t('step3Title')}
              </h2>
              <p className="text-[var(--muted)]">
                {t('step3Subtitle')}
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
              <Download className="w-6 h-6 text-brand-600 mb-3" />
              <h3 className="font-semibold text-[var(--foreground)] mb-2">
                {t('downloadTitle')}
              </h3>
              <ul className="text-sm text-[var(--muted)] space-y-1.5">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> {t('downloadDocx')}</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> {t('downloadTxt')}</li>
                <li className="flex items-center gap-2 text-[var(--muted)]"><span className="w-3.5 h-3.5 inline-block" /> {t('downloadPdf')}</li>
              </ul>
            </div>
            <div className="bg-amber-50 border border-amber-200 dark:bg-amber-950 dark:border-amber-900 rounded-2xl p-6">
              <Shield className="w-6 h-6 text-amber-600 mb-3" />
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                {t('legalNoteTitle')}
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                {t('legalNoteDesc')}
              </p>
            </div>
          </div>
          <div className="text-center">
            <Link
              href="/einspruch"
              className="inline-flex items-center gap-2 bg-brand-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-brand-700 transition-colors"
            >
              {t('ctaDemo')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-t border-[var(--border)] bg-[var(--surface)] py-6 px-4">
        <TrustBadges locale={locale} variant="row" className="max-w-4xl mx-auto" />
      </section>

      <Footer locale={locale} />
    </>
  )
}
