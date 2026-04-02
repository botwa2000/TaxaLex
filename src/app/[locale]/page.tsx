import { getTranslations } from 'next-intl/server'
import { PublicNav } from '@/components/PublicNav'
import { Footer } from '@/components/Footer'
import { UserGroupTabs } from '@/components/UserGroupTabs'
import { TrustBadges } from '@/components/TrustBadges'
import { ProcessStep } from '@/components/ProcessStep'
import { StatCard } from '@/components/StatCard'
import { UseCaseCard } from '@/components/UseCaseCard'
import { FAQAccordion } from '@/components/FAQAccordion'
import { PricingCard } from '@/components/PricingCard'
import { getUseCases, getFAQs, getPricingPlans } from '@/lib/contentFallbacks'
import { Upload, Brain, Download, BarChart3, Clock, CheckCircle2, Shield, Zap, Globe, Lock, X, Scale, FileText, MessageSquare } from 'lucide-react'
import { Link } from '@/i18n/navigation'

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  // isDE: only German users see German inline text; all other locales fall back to English
  const isDE = locale === 'de'

  const [tHiw, tFeatures, tStats] = await Promise.all([
    getTranslations({ locale, namespace: 'howItWorks' }),
    getTranslations({ locale, namespace: 'features' }),
    getTranslations({ locale, namespace: 'stats' }),
  ])

  const useCases = getUseCases(locale)
  const faqs = getFAQs(locale)
  const individualPlans = getPricingPlans('individual')

  const processSteps = [
    { step: 1, icon: Upload, title: tHiw('steps.upload.title'), description: tHiw('steps.upload.description'), detail: tHiw('steps.upload.detail') },
    { step: 2, icon: Brain, title: tHiw('steps.analyze.title'), description: tHiw('steps.analyze.description'), detail: tHiw('steps.analyze.detail') },
    { step: 3, icon: Download, title: tHiw('steps.download.title'), description: tHiw('steps.download.description'), detail: tHiw('steps.download.detail') },
  ]

  const statsItems = [
    { value: tStats('items.objections.value'), label: tStats('items.objections.label'), icon: BarChart3, source: 'BMF Finanzbericht 2023' },
    { value: tStats('items.successRate.value'), label: tStats('items.successRate.label'), icon: CheckCircle2, source: 'BMF Steuerstatistik' },
    { value: tStats('items.deadline.value'), label: tStats('items.deadline.label'), icon: Clock, source: '§ 355 AO' },
    { value: tStats('items.speed.value'), label: tStats('items.speed.label'), icon: Brain, source: isDE ? 'TaxaLex intern gemessen' : 'TaxaLex internal measurement' },
  ]

  const featureItems = [
    { icon: Brain, title: tFeatures('items.multiAi.title'), description: tFeatures('items.multiAi.description') },
    { icon: CheckCircle2, title: tFeatures('items.legal.title'), description: tFeatures('items.legal.description') },
    { icon: Globe, title: tFeatures('items.multilingual.title'), description: tFeatures('items.multilingual.description') },
    { icon: Lock, title: tFeatures('items.privacy.title'), description: tFeatures('items.privacy.description') },
  ]

  return (
    <>
      <PublicNav locale={locale} />

      {/* Hero */}
      <section className="py-20 sm:py-32 px-4 bg-gradient-to-b from-brand-50/60 via-[var(--background)] to-[var(--background)] dark:from-brand-950/30 dark:via-[var(--background)] dark:to-[var(--background)]">
        <div className="max-w-4xl mx-auto">
          <UserGroupTabs locale={locale} />
        </div>
      </section>

      {/* Trust badges strip */}
      <section className="border-y border-[var(--border)] bg-[var(--surface)] py-4 px-4">
        <TrustBadges locale={locale} variant="row" className="max-w-4xl mx-auto" />
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 sm:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-3">
              {tHiw('title')}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4 leading-tight">
              {isDE ? 'Vom Bescheid zum Einspruch — in 3 Schritten' : 'From notice to objection — in 3 steps'}
            </h2>
            <p className="text-base sm:text-lg text-[var(--muted)] max-w-xl mx-auto">
              {tHiw('subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {processSteps.map((step) => (
              <ProcessStep
                key={step.step}
                step={step.step}
                icon={step.icon}
                title={step.title}
                description={step.description}
                detail={step.detail}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats — only real, cited statistics */}
      <section className="py-20 bg-[var(--surface)] border-y border-[var(--border)] px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-3">
              {isDE ? 'Zahlen & Fakten' : 'By the numbers'}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-3 leading-tight">
              {isDE ? 'Fakten, keine Versprechen' : 'Facts, not promises'}
            </h2>
            <p className="text-[var(--muted)]">
              {tStats('subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {statsItems.map((s) => (
              <StatCard
                key={s.label}
                value={s.value}
                label={s.label}
                icon={s.icon}
                source={s.source}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Use cases — expandable cards */}
      <section id="use-cases" className="py-20 sm:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-3">
              {isDE ? 'Unterstützte Bescheidarten' : 'Supported notice types'}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4 leading-tight">
              {isDE ? '8 Bescheidarten – alle abgedeckt' : '8 notice types – all covered'}
            </h2>
            <p className="text-base text-[var(--muted)] max-w-2xl mx-auto">
              {isDE
                ? 'Von Steuerbescheiden bis Bußgeldern: TaxaLex kennt die relevanten Rechtsgrundlagen für alle häufigen Verwaltungsbescheide.'
                : 'From tax assessments to fines: TaxaLex knows the relevant legal basis for all common administrative notices.'}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {useCases.map((uc) => (
              <UseCaseCard key={uc.slug} useCase={uc} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      {/* Why not a generic AI chatbot? — differentiation section */}
      <section className="py-16 sm:py-20 px-4 bg-[var(--background)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
              <MessageSquare className="w-4 h-4" />
              {isDE ? 'Warum nicht einfach einen KI-Chatbot nutzen?' : 'Why not just use an AI chatbot?'}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4">
              {isDE ? 'Qualität entsteht durch Prozess — nicht durch einen einzigen Prompt.' : 'Quality comes from process — not a single prompt.'}
            </h2>
            <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
              {isDE
                ? 'Ein allgemeiner KI-Assistent kann Ihren Bescheid lesen — aber KI-Systeme neigen dazu, Rechtsquellen zu erfinden und fachspezifische Fragen zu übersehen. TaxaLex nutzt fünf spezialisierte Agenten, die gegenseitig ihre Arbeit prüfen.'
                : 'A general AI assistant can read your notice — but AI systems are known to hallucinate legal sources and miss domain-specific questions. TaxaLex uses five specialized agents that check each other\'s work.'}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 items-start">
            {/* Generic AI column */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--foreground)]">{isDE ? 'Allgemeiner KI-Assistent' : 'Generic AI assistant'}</h3>
                  <p className="text-sm text-[var(--muted)]">{isDE ? 'Ein Prompt → ein ungeprüfter Entwurf' : 'One prompt → one unverified draft'}</p>
                </div>
              </div>
              <ul className="space-y-3">
                {(isDE ? [
                  'Erstellt einen Entwurf ohne automatische Gegen- oder Querprüfung',
                  'Stellt nicht von sich aus die richtigen Rechtsfragen — das Fachwissen muss vom Nutzer kommen',
                  'Kann Rechtsquellen und Urteile erfinden (Halluzinationen) — ohne Gegenprüfung unbemerkt',
                  'Keine Perspektivprüfung: „Was würde die Behörde einwenden?"',
                  'Keine automatische Fristberechnung aus dem Bescheid',
                  'Qualität und Vollständigkeit hängen stark von der Formulierung des Prompts ab',
                ] : [
                  'Generates one draft without any automatic cross-checking or self-review',
                  'Does not know which domain-specific legal questions to ask — you need to prompt them',
                  'Can hallucinate legal citations and case references — errors go undetected without verification',
                  'No perspective test: "How would the authority counter this argument?"',
                  'No automatic deadline calculation from the document',
                  'Output quality and completeness depend heavily on how the prompt is written',
                ]).map((text) => (
                  <li key={text} className="flex items-start gap-2.5 text-sm text-[var(--muted)]">
                    <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            {/* TaxaLex column */}
            <div className="bg-brand-50 dark:bg-brand-950/60 border-2 border-brand-200 dark:border-brand-800 rounded-3xl p-6 relative">
              <div className="absolute -top-3 left-6">
                <span className="bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {isDE ? '✦ 5-Agenten-Pipeline' : '✦ 5-agent pipeline'}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900 rounded-xl flex items-center justify-center">
                  <Scale className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--foreground)]">TaxaLex</h3>
                  <p className="text-sm text-brand-600 dark:text-brand-400">{isDE ? 'Automatisierte Experten-Querprüfung' : 'Automated expert cross-examination'}</p>
                </div>
              </div>
              <ol className="space-y-3">
                {(isDE ? [
                  { agent: 'Drafter', desc: 'Formuliert den Einspruch auf Basis relevanter Rechtsgrundlagen (§ AO, § SGG, § BGB, § KSchG)' },
                  { agent: 'Reviewer', desc: 'Prüft Fristkonformität, formale Anforderungen und sprachliche Korrektheit' },
                  { agent: 'FactChecker', desc: 'Verifiziert zitierte Rechtsquellen und Urteile per Live-Suche — erkennt Ungenauigkeiten' },
                  { agent: 'Adversary', desc: 'Analysiert den Entwurf aus Behördenperspektive — um Schwachstellen zu erkennen und zu schließen' },
                  { agent: 'Consolidator', desc: 'Fasst alle Prüfungen zu einem strukturierten, klar begründeten Abschlussschreiben zusammen' },
                ] : [
                  { agent: 'Drafter', desc: 'Creates the initial objection using legal domain knowledge (§ AO, § SGG, § BGB, § KSchG)' },
                  { agent: 'Reviewer', desc: 'Checks legal correctness, deadline compliance, and formal requirements' },
                  { agent: 'FactChecker', desc: 'Verifies cited legal sources and rulings via live search — flags inaccuracies before they reach the final draft' },
                  { agent: 'Adversary', desc: 'Reviews the draft from the authority\'s perspective — to identify and address weak points' },
                  { agent: 'Consolidator', desc: 'Combines all reviews into one structured, clearly reasoned final letter' },
                ]).map((item, i) => (
                  <li key={item.agent} className="flex items-start gap-3 text-sm">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                    <span className="text-[var(--foreground)]">
                      <span className="font-semibold">{item.agent}</span>
                      {' — '}
                      <span className="text-[var(--muted)]">{item.desc}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-10 text-center">
            <p className="text-[var(--muted)] mb-4 text-lg">
              {isDE
                ? 'Sehen Sie, wie es funktioniert — interaktive Demo, ohne Registrierung.'
                : 'See how it works — try the interactive demo, no registration required.'}
            </p>
            <Link href="/einspruch" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-4 rounded-2xl transition-colors text-lg">
              <Zap className="w-5 h-5" />
              {isDE ? 'Demo starten' : 'Try the demo'}
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-[var(--surface)] border-y border-[var(--border)] px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-3">
              {tFeatures('title')}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4 leading-tight">
              {isDE ? 'Gebaut für juristische Präzision' : 'Built for legal precision'}
            </h2>
            <p className="text-base text-[var(--muted)] max-w-xl mx-auto">
              {tFeatures('subtitle')}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {featureItems.map((f) => (
              <div key={f.title} className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-brand-50 dark:bg-brand-950 rounded-2xl flex items-center justify-center shrink-0">
                  <f.icon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--foreground)] mb-2">{f.title}</h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates teaser */}
      <section className="py-14 px-4 bg-[var(--surface)] border-y border-[var(--border)]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-sm font-semibold px-3 py-1 rounded-full mb-4">
              <FileText className="w-3.5 h-3.5" />
              {isDE ? 'Kostenlose Vorlagen' : 'Free templates'}
            </div>
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">
              {isDE ? '16 sofort einsetzbare Rechtsvorlagen' : '16 ready-to-use legal templates'}
            </h2>
            <p className="text-[var(--muted)] leading-relaxed mb-5">
              {isDE
                ? 'Laden Sie leere Vorlagen für die häufigsten Einsprüche in Deutschland herunter — Steuer, Jobcenter, Miete, Arbeit und mehr. Oder füllen Sie sie online mit KI in Minuten aus.'
                : 'Download blank templates for the most common objections in Germany — tax, Jobcenter, rent, employment and more. Or fill them online with AI in minutes.'}
            </p>
            <Link
              href="/vorlagen"
              className="inline-flex items-center gap-2 font-semibold text-brand-600 dark:text-brand-400 hover:underline text-lg"
            >
              {isDE ? 'Alle Vorlagen ansehen' : 'Browse all templates'}
              <FileText className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0">
            {(isDE
              ? ['Steuerbescheid', 'Jobcenter-Ablehnung', 'Mieterhöhung', 'Kündigung']
              : ['Tax Assessment', 'Jobcenter Rejection', 'Rent Increase', 'Dismissal Notice']
            ).map((name) => (
              <div key={name} className="bg-[var(--background-subtle)] rounded-xl px-4 py-3 text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-500 shrink-0" />
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing — individual plans preview */}
      <section id="pricing" className="py-20 sm:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-3">
              {isDE ? 'Preise' : 'Pricing'}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4 leading-tight">
              {isDE ? 'Einfache, transparente Preise' : 'Simple, transparent pricing'}
            </h2>
            <p className="text-base text-[var(--muted)]">
              {isDE
                ? 'Pro Fall oder als Abo. Keine versteckten Kosten.'
                : 'Pay per case, or subscribe for unlimited access. No hidden fees.'}
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            {individualPlans.map((plan) => (
              <PricingCard key={plan.slug} plan={plan} locale={locale} />
            ))}
          </div>
          <div className="text-center">
            <Link
              href="/preise"
              className="text-sm text-brand-600 hover:underline underline-offset-2 dark:text-brand-400"
            >
              {isDE ? 'Alle Pläne inkl. Berater & Anwalt ansehen →' : 'View all plans including advisor & lawyer →'}
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-[var(--surface)] border-y border-[var(--border)] px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-3">
              Support
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4 leading-tight">
              {isDE ? 'Häufige Fragen' : 'Frequently asked questions'}
            </h2>
            <p className="text-base text-[var(--muted)]">
              {isDE
                ? 'Alles, was Sie über TaxaLex wissen möchten.'
                : 'Everything you want to know about TaxaLex.'}
            </p>
          </div>
          <FAQAccordion faqs={faqs} locale={locale} />
        </div>
      </section>

      {/* Legal disclaimer */}
      <section className="py-10 px-4 bg-[var(--surface)] border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-brand-600" />
            <p className="text-sm font-medium text-[var(--foreground)]">
              {isDE ? 'Rechtlicher Hinweis' : 'Legal notice'}
            </p>
          </div>
          <p className="text-sm text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
            {isDE
              ? 'TaxaLex erstellt KI-gestützte Entwurfsschreiben. Diese stellen keine Rechtsberatung i.S.d. Rechtsdienstleistungsgesetzes (RDG) dar. Bei komplexen Fällen empfehlen wir die Hinzuziehung eines Steuerberaters oder Anwalts.'
              : 'TaxaLex generates AI-assisted draft letters. These are not legal advice within the meaning of the German Legal Services Act (RDG). For complex cases, please consult a qualified tax advisor or lawyer.'}
          </p>
        </div>
      </section>

      <Footer locale={locale} />
    </>
  )
}
