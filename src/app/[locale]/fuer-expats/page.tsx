import { PublicNav } from '@/components/PublicNav'
import { Footer } from '@/components/Footer'
import { TrustBadges } from '@/components/TrustBadges'
import { UseCaseCard } from '@/components/UseCaseCard'
import { getUseCases } from '@/lib/contentFallbacks'
import { Globe, FileText, CheckCircle2, Clock, ArrowRight, Languages } from 'lucide-react'
import { Link } from '@/i18n/navigation'

export default async function FuerExpatsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Expat page is always EN-first but adapts to locale
  const isEN = locale === 'en'

  // Show the 4 most relevant use cases for expats in English
  const allUseCases = getUseCases('en')
  const expatUseCases = allUseCases.filter((uc) =>
    ['tax', 'jobcenter', 'bussgeld', 'krankenversicherung'].includes(uc.slug)
  )

  const features = [
    {
      icon: Languages,
      title: isEN ? 'Interface in 7 languages' : 'Interface in 7 Sprachen',
      description: isEN
        ? 'Use TaxaLex in English, German, Turkish, Russian, Polish, Ukrainian, or Arabic. The objection letter is always in German — required by German authorities.'
        : 'TaxaLex auf Englisch, Deutsch, Türkisch, Russisch, Polnisch, Ukrainisch oder Arabisch. Das Einspruchsschreiben ist immer auf Deutsch – Pflicht für Behörden.',
    },
    {
      icon: FileText,
      title: isEN ? 'German-language output' : 'Ausgabe auf Deutsch',
      description: isEN
        ? 'Your objection letter is drafted in legally correct German — even if you don\'t speak German. You can download an English translation for your reference.'
        : 'Ihr Einspruchsschreiben wird in korrektem juristischen Deutsch verfasst – auch wenn Sie kein Deutsch sprechen. Eine englische Übersetzung zur Orientierung ist verfügbar.',
    },
    {
      icon: Clock,
      title: isEN ? 'Tight deadlines, covered' : 'Enge Fristen, abgesichert',
      description: isEN
        ? 'German objection deadlines are typically 30 days. TaxaLex helps you act fast — the AI drafts your letter in under 5 minutes so you never miss a deadline.'
        : 'Deutsche Einspruchsfristen betragen typischerweise 30 Tage. TaxaLex hilft Ihnen, schnell zu handeln – die KI erstellt Ihr Schreiben in unter 5 Minuten.',
    },
    {
      icon: Globe,
      title: isEN ? 'Built for Germany' : 'Für Deutschland entwickelt',
      description: isEN
        ? 'All legal references, deadlines, and authority addresses are specific to German law: § 347 AO, SGG § 84, BGB § 541, and more.'
        : 'Alle Rechtsgrundlagen, Fristen und Behörden sind auf deutsches Recht zugeschnitten: § 347 AO, SGG § 84, BGB § 541 und mehr.',
    },
  ]

  return (
    <>
      <PublicNav locale={locale} />

      {/* Hero */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-b from-[var(--background)] to-[var(--background-subtle,var(--background))]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-brand-200 dark:border-brand-800 mb-6">
            <Globe className="w-3.5 h-3.5" />
            {isEN ? 'For expats in Germany' : 'Für Expats in Deutschland'}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--foreground)] mb-4">
            {isEN
              ? 'Navigate German bureaucracy — in your language.'
              : 'Deutsche Bürokratie – in Ihrer Sprache.'}
          </h1>
          <p className="text-lg text-[var(--muted)] leading-relaxed mb-8">
            {isEN
              ? 'Received a German notice you don\'t understand? TaxaLex analyses it, explains it in your language, and drafts a professional German objection letter — in minutes.'
              : 'Einen deutschen Bescheid erhalten, den Sie nicht verstehen? TaxaLex analysiert ihn, erklärt ihn in Ihrer Sprache und erstellt ein professionelles deutsches Einspruchsschreiben – in Minuten.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-brand-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-brand-700 transition-colors"
            >
              {isEN ? 'Get started for free' : 'Kostenlos starten'}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/einspruch"
              className="inline-flex items-center gap-2 border border-[var(--border)] text-[var(--foreground)] px-8 py-3.5 rounded-xl font-semibold hover:bg-[var(--background-subtle)] transition-colors"
            >
              {isEN ? 'Try without account' : 'Ohne Konto ausprobieren'}
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
            {isEN ? 'Why expats use TaxaLex' : 'Warum Expats TaxaLex nutzen'}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="flex flex-col gap-3">
                <div className="w-10 h-10 bg-brand-100 dark:bg-brand-950 rounded-xl flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-brand-700 dark:text-brand-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--foreground)] mb-1">{f.title}</h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{f.description}</p>
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
              {isEN ? 'Most common notices for expats' : 'Häufigste Bescheide für Expats'}
            </h2>
            <p className="text-[var(--muted)]">
              {isEN
                ? 'These are the notices expats in Germany most frequently receive and need to appeal.'
                : 'Diese Bescheide erhalten Expats in Deutschland am häufigsten und müssen sie anfechten.'}
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
            {isEN ? 'Available in your language' : 'Verfügbar in Ihrer Sprache'}
          </h2>
          <p className="text-[var(--muted)] mb-8">
            {isEN
              ? 'Switch the interface language in the footer at any time. The objection letter is always submitted in German.'
              : 'Wechseln Sie die Interface-Sprache jederzeit im Footer. Das Einspruchsschreiben wird immer auf Deutsch eingereicht.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { flag: '🇩🇪', lang: 'Deutsch' },
              { flag: '🇬🇧', lang: 'English' },
              { flag: '🇹🇷', lang: 'Türkçe' },
              { flag: '🇷🇺', lang: 'Русский' },
              { flag: '🇵🇱', lang: 'Polski' },
              { flag: '🇺🇦', lang: 'Українська' },
              { flag: '🇸🇦', lang: 'العربية' },
            ].map((l) => (
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
              {isEN ? 'Start for free' : 'Kostenlos starten'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer locale={locale} />
    </>
  )
}
