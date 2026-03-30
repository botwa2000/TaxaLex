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
  const isEN = locale === 'en'

  const useCases = getUseCases(locale)
  const faqs = getFAQs(locale)
  const individualPlans = getPricingPlans('individual')

  const processSteps = isEN
    ? [
        { step: 1, icon: Upload, title: 'Upload your notice', description: 'Upload the official document (PDF, photo, or scan). Supported: tax assessments, fines, Jobcenter, pension notices, and more.', detail: 'Formats: PDF, JPG, PNG, DOCX, TXT (max. 10 MB)' },
        { step: 2, icon: Brain, title: 'AI analysis', description: 'Our multi-AI pipeline analyses the notice, checks legal deadlines, identifies objection grounds, and prepares a professionally worded draft.', detail: 'Claude · Gemini · Perplexity — all models work in parallel' },
        { step: 3, icon: Download, title: 'Download & send', description: 'Review the draft, make adjustments if needed, and download it ready to send. The letter is written in German for official submission.', detail: 'Note: AI-generated draft. Not legal advice. Review before submission.' },
      ]
    : [
        { step: 1, icon: Upload, title: 'Bescheid hochladen', description: 'Laden Sie das offizielle Dokument hoch (PDF, Foto oder Scan). Unterstützt: Steuerbescheide, Bußgelder, Jobcenter, Rentenbescheide und mehr.', detail: 'Formate: PDF, JPG, PNG, DOCX, TXT (max. 10 MB)' },
        { step: 2, icon: Brain, title: 'KI-Analyse', description: 'Unsere Multi-KI-Pipeline analysiert den Bescheid, prüft gesetzliche Fristen, identifiziert Einspruchsgründe und formuliert einen professionellen Entwurf.', detail: 'Claude · Gemini · Perplexity – alle Modelle arbeiten parallel' },
        { step: 3, icon: Download, title: 'Herunterladen & versenden', description: 'Entwurf prüfen, bei Bedarf anpassen und als versandfertige Datei herunterladen. Das Schreiben ist auf Deutsch für die Einreichung beim Amt.', detail: 'Hinweis: KI-Entwurf, kein Rechtsrat i.S.d. RDG. Vor Einreichung prüfen.' },
      ]

  const stats = isEN
    ? [
        { value: '3,3 Mio.', label: 'Tax objections filed per year in Germany', icon: BarChart3, source: 'BMF Finanzbericht 2023' },
        { value: '67 %', label: 'Partial or full success rate', icon: CheckCircle2, source: 'BMF Steuerstatistik' },
        { value: '30 days', label: 'Legal deadline (§ 355 AO)', icon: Clock, source: '§ 355 AO' },
        { value: '< 5 min', label: 'Average generation time', icon: Brain, source: 'TaxaLex internal measurement' },
      ]
    : [
        { value: '3,3 Mio.', label: 'Einsprüche pro Jahr in DE', icon: BarChart3, source: 'BMF Finanzbericht 2023' },
        { value: '67 %', label: 'Teilweise / vollständige Stattgabe', icon: CheckCircle2, source: 'BMF Steuerstatistik' },
        { value: '30 Tage', label: 'Gesetzliche Einspruchsfrist (§ 355 AO)', icon: Clock, source: '§ 355 AO' },
        { value: '< 5 min', label: 'Durchschnittliche Generierungszeit', icon: Brain, source: 'TaxaLex intern gemessen' },
      ]

  const features = isEN
    ? [
        { icon: Brain, title: '5 AI agents in parallel', description: 'Claude, Gemini and Perplexity review your objection from different perspectives — for maximum quality.' },
        { icon: CheckCircle2, title: 'Up-to-date legal references', description: 'Perplexity researches current court rulings and administrative guidelines in real time for your specific case.' },
        { icon: Globe, title: 'Multilingual', description: 'Interface in 7 languages. The objection letter is always drafted in German — as required by German authorities.' },
        { icon: Lock, title: 'GDPR & Privacy', description: 'EU servers, encrypted transmission, no permanent storage of your documents without explicit consent.' },
      ]
    : [
        { icon: Brain, title: '5 KI-Agenten parallel', description: 'Claude, Gemini und Perplexity prüfen Ihren Einspruch aus verschiedenen Perspektiven – für maximale Qualität.' },
        { icon: CheckCircle2, title: 'Aktuelle Rechtsgrundlagen', description: 'Perplexity recherchiert in Echtzeit aktuelle BFH-Urteile und Verwaltungsanweisungen für Ihren konkreten Fall.' },
        { icon: Globe, title: 'Mehrsprachig', description: 'Interface in 7 Sprachen. Der Einspruch wird immer auf Deutsch erstellt – für die Behörde.' },
        { icon: Lock, title: 'DSGVO & Datenschutz', description: 'EU-Server, verschlüsselte Übertragung, keine permanente Speicherung Ihrer Dokumente ohne Zustimmung.' },
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
              {isEN ? 'How it works' : 'So einfach geht\u2019s'}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4 leading-tight">
              {isEN ? 'From notice to objection — in 3 steps' : 'Vom Bescheid zum Einspruch — in 3 Schritten'}
            </h2>
            <p className="text-base sm:text-lg text-[var(--muted)] max-w-xl mx-auto">
              {isEN
                ? 'Three steps from notice to ready-to-send objection letter.'
                : 'Drei Schritte vom Bescheid zum versandfertigen Einspruchsschreiben.'}
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
              {isEN ? 'By the numbers' : 'Zahlen & Fakten'}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-3 leading-tight">
              {isEN ? 'Facts, not promises' : 'Fakten, keine Versprechen'}
            </h2>
            <p className="text-[var(--muted)]">
              {isEN ? 'All statistics verified and sourced.' : 'Alle Statistiken verifiziert und mit Quellenangabe.'}
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((s) => (
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
              {isEN ? 'Supported notice types' : 'Unterstützte Bescheidarten'}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4 leading-tight">
              {isEN ? '8 notice types – all covered' : '8 Bescheidarten – alle abgedeckt'}
            </h2>
            <p className="text-base text-[var(--muted)] max-w-2xl mx-auto">
              {isEN
                ? 'From tax assessments to fines: TaxaLex knows the relevant legal basis for all common administrative notices.'
                : 'Von Steuerbescheiden bis Bußgeldern: TaxaLex kennt die relevanten Rechtsgrundlagen für alle häufigen Verwaltungsbescheide.'}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {useCases.map((uc) => (
              <UseCaseCard key={uc.slug} useCase={uc} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      {/* Why not ChatGPT? — differentiation section */}
      <section className="py-16 sm:py-20 px-4 bg-[var(--background)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
              <MessageSquare className="w-4 h-4" />
              {isEN ? 'Why not just use ChatGPT?' : 'Warum nicht einfach ChatGPT?'}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4">
              {isEN ? 'Quality comes from process — not a single prompt.' : 'Qualität entsteht durch Prozess — nicht durch einen einzigen Prompt.'}
            </h2>
            <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
              {isEN
                ? 'ChatGPT can read your notice too. But does it know which legal questions it should be asking? TaxaLex does — automatically, through five specialized agents.'
                : 'ChatGPT kann Ihren Bescheid lesen. Aber weiß es, welche juristischen Fragen es stellen muss? TaxaLex weiß es — und stellt sie automatisch, durch fünf spezialisierte Agenten.'}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 items-start">
            {/* ChatGPT column */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--foreground)]">ChatGPT</h3>
                  <p className="text-sm text-[var(--muted)]">{isEN ? 'One prompt → one unreviewed draft' : 'Ein Prompt → ein ungeprüfter Entwurf'}</p>
                </div>
              </div>
              <ul className="space-y-3">
                {(isEN ? [
                  'Writes one draft — no automatic self-review or cross-validation',
                  'You must know which legal questions to ask; it won\'t ask them for you',
                  'No live research into current BFH rulings or administrative guidance',
                  'No adversarial test: "How would the Finanzamt counter this argument?"',
                  'No deadline calculation unless you explicitly prompt it',
                  'Result depends entirely on how well you can prompt a general AI',
                ] : [
                  'Erstellt einen Entwurf — keine automatische Selbstprüfung oder Quervalidierung',
                  'Sie müssen wissen, welche Rechtsfragen zu stellen sind — ChatGPT fragt sie nicht von selbst',
                  'Keine Live-Recherche zu aktuellen BFH-Urteilen oder Verwaltungsvorschriften',
                  'Kein adversarieller Test: "Was würde das Finanzamt erwidern?"',
                  'Keine Fristberechnung ohne expliziten Prompt',
                  'Ergebnis hängt davon ab, wie gut Sie eine allgemeine KI prompten können',
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
                  {isEN ? '✦ 5-agent pipeline' : '✦ 5-Agenten-Pipeline'}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900 rounded-xl flex items-center justify-center">
                  <Scale className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--foreground)]">TaxaLex</h3>
                  <p className="text-sm text-brand-600 dark:text-brand-400">{isEN ? 'Automated expert cross-examination' : 'Automatisierte Experten-Querprüfung'}</p>
                </div>
              </div>
              <ol className="space-y-3">
                {(isEN ? [
                  { agent: 'Drafter', desc: 'Creates the initial objection using legal domain knowledge (§ AO, § SGG, § BGB, § KSchG)' },
                  { agent: 'Reviewer', desc: 'Checks legal correctness, deadline compliance, and formal requirements' },
                  { agent: 'FactChecker', desc: 'Researches current BFH rulings and administrative guidelines via live search' },
                  { agent: 'Adversary', desc: 'Attacks the draft as the authority would — to identify and close weak points' },
                  { agent: 'Consolidator', desc: 'Synthesises all reviews into one legally grounded, citation-backed final letter' },
                ] : [
                  { agent: 'Drafter', desc: 'Erstellt den Einspruch mit juristischem Fachwissen (§ AO, § SGG, § BGB, § KSchG)' },
                  { agent: 'Reviewer', desc: 'Prüft Rechtmäßigkeit, Fristkonformität und formale Anforderungen' },
                  { agent: 'FactChecker', desc: 'Recherchiert aktuelle BFH-Urteile und Verwaltungsvorschriften per Live-Suche' },
                  { agent: 'Adversary', desc: 'Greift den Entwurf an wie die Behörde — um Schwachstellen zu schließen' },
                  { agent: 'Consolidator', desc: 'Fügt alle Prüfungen zu einem rechtlich fundierten, §§-belegten Schreiben zusammen' },
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
              {isEN
                ? 'Your first objection is free. No credit card required.'
                : 'Ihr erster Einspruch ist kostenlos. Keine Kreditkarte nötig.'}
            </p>
            <Link href="/einspruch" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-4 rounded-2xl transition-colors text-lg">
              <Zap className="w-5 h-5" />
              {isEN ? 'Try it free now' : 'Jetzt kostenlos testen'}
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-[var(--surface)] border-y border-[var(--border)] px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-3">
              {isEN ? 'Why TaxaLex?' : 'Warum TaxaLex?'}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4 leading-tight">
              {isEN ? 'Built for legal precision' : 'Gebaut für juristische Präzision'}
            </h2>
            <p className="text-base text-[var(--muted)] max-w-xl mx-auto">
              {isEN
                ? 'Four differentiating features that make the difference.'
                : 'Vier Alleinstellungsmerkmale, die den Unterschied machen.'}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((f) => (
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
              {isEN ? 'Free templates' : 'Kostenlose Vorlagen'}
            </div>
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">
              {isEN ? '16 ready-to-use legal templates' : '16 sofort einsetzbare Rechtsvorlagen'}
            </h2>
            <p className="text-[var(--muted)] leading-relaxed mb-5">
              {isEN
                ? 'Download blank templates for the most common objections in Germany — tax, Jobcenter, rent, employment and more. Or fill them online with AI in minutes.'
                : 'Laden Sie leere Vorlagen für die häufigsten Einsprüche in Deutschland herunter — Steuer, Jobcenter, Miete, Arbeit und mehr. Oder füllen Sie sie online mit KI in Minuten aus.'}
            </p>
            <Link
              href="/vorlagen"
              className="inline-flex items-center gap-2 font-semibold text-brand-600 dark:text-brand-400 hover:underline text-lg"
            >
              {isEN ? 'Browse all templates' : 'Alle Vorlagen ansehen'}
              <FileText className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0">
            {(isEN
              ? ['Tax Assessment', 'Jobcenter Rejection', 'Rent Increase', 'Dismissal Notice']
              : ['Steuerbescheid', 'Jobcenter-Ablehnung', 'Mieterhöhung', 'Kündigung']
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
              {isEN ? 'Pricing' : 'Preise'}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4 leading-tight">
              {isEN ? 'Simple, transparent pricing' : 'Einfache, transparente Preise'}
            </h2>
            <p className="text-base text-[var(--muted)]">
              {isEN
                ? 'Start for free. Upgrade when you need more.'
                : 'Kostenlos starten. Upgraden, wenn Sie mehr brauchen.'}
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
              {isEN ? 'View all plans including advisor & lawyer →' : 'Alle Pläne inkl. Berater & Anwalt ansehen →'}
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-[var(--surface)] border-y border-[var(--border)] px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-3">
              {isEN ? 'Support' : 'Support'}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4 leading-tight">
              {isEN ? 'Frequently asked questions' : 'Häufige Fragen'}
            </h2>
            <p className="text-base text-[var(--muted)]">
              {isEN
                ? 'Everything you want to know about TaxaLex.'
                : 'Alles, was Sie über TaxaLex wissen möchten.'}
            </p>
          </div>
          <FAQAccordion faqs={faqs} locale={locale} />
        </div>
      </section>

      {/* Trust / legal disclaimer */}
      <section className="py-12 px-4 bg-[var(--surface)] border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-brand-600" />
            <p className="text-sm font-medium text-[var(--foreground)]">
              {isEN ? 'Legal notice' : 'Rechtlicher Hinweis'}
            </p>
          </div>
          <p className="text-sm text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
            {isEN
              ? 'TaxaLex generates AI-assisted draft letters. These are not legal advice within the meaning of the German Legal Services Act (RDG). For complex cases, please consult a qualified tax advisor or lawyer.'
              : 'TaxaLex erstellt KI-gestützte Entwurfsschreiben. Diese stellen keine Rechtsberatung i.S.d. Rechtsdienstleistungsgesetzes (RDG) dar. Bei komplexen Fällen empfehlen wir die Hinzuziehung eines Steuerberaters oder Anwalts.'}
          </p>
          <TrustBadges locale={locale} variant="row" className="mt-4" />
        </div>
      </section>

      <Footer locale={locale} />
    </>
  )
}
