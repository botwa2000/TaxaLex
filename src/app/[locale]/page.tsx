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
import { Upload, Brain, Download, BarChart3, Clock, CheckCircle2, Shield, Zap, Globe, Lock } from 'lucide-react'
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
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-b from-[var(--background)] to-[var(--background-subtle,var(--background))]">
        <div className="max-w-4xl mx-auto">
          <UserGroupTabs locale={locale} />
        </div>
      </section>

      {/* Trust badges strip */}
      <section className="border-y border-[var(--border)] bg-[var(--surface)] py-4 px-4">
        <TrustBadges locale={locale} variant="row" className="max-w-4xl mx-auto" />
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--foreground)] mb-3">
              {isEN ? 'How it works' : 'So funktioniert es'}
            </h2>
            <p className="text-[var(--muted)] max-w-xl mx-auto">
              {isEN
                ? 'Three steps from notice to ready-to-send objection letter.'
                : 'Drei Schritte vom Bescheid zum versandfertigen Einspruchsschreiben.'}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {processSteps.map((step) => (
              <ProcessStep
                key={step.step}
                step={step.step}
                icon={step.icon}
                title={step.title}
                description={step.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats — only real, cited statistics */}
      <section className="py-16 bg-[var(--surface)] border-y border-[var(--border)] px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
              {isEN ? 'Facts, not promises' : 'Fakten, keine Versprechen'}
            </h2>
            <p className="text-sm text-[var(--muted)]">
              {isEN ? 'All statistics verified and sourced.' : 'Alle Statistiken verifiziert und mit Quellenangabe.'}
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
      <section id="use-cases" className="py-16 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[var(--foreground)] mb-3">
              {isEN ? '8 notice types – all covered' : '8 Bescheidarten – alle abgedeckt'}
            </h2>
            <p className="text-[var(--muted)] max-w-2xl mx-auto">
              {isEN
                ? 'From tax assessments to fines: TaxaLex knows the relevant legal basis for all common administrative notices.'
                : 'Von Steuerbescheiden bis Bußgeldern: TaxaLex kennt die relevanten Rechtsgrundlagen für alle häufigen Verwaltungsbescheide.'}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {useCases.map((uc) => (
              <UseCaseCard key={uc.slug} useCase={uc} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 bg-[var(--surface)] border-y border-[var(--border)] px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--foreground)] mb-3">
              {isEN ? 'Why TaxaLex?' : 'Warum TaxaLex?'}
            </h2>
            <p className="text-[var(--muted)]">
              {isEN
                ? 'Four differentiating features that make the difference.'
                : 'Vier Alleinstellungsmerkmale, die den Unterschied machen.'}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="flex flex-col gap-3">
                <div className="w-10 h-10 bg-brand-100 dark:bg-brand-950 rounded-xl flex items-center justify-center shrink-0">
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

      {/* Pricing — individual plans preview */}
      <section id="pricing" className="py-16 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[var(--foreground)] mb-3">
              {isEN ? 'Simple, transparent pricing' : 'Einfache, transparente Preise'}
            </h2>
            <p className="text-[var(--muted)]">
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
      <section id="faq" className="py-16 bg-[var(--surface)] border-y border-[var(--border)] px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[var(--foreground)] mb-3">
              {isEN ? 'Frequently asked questions' : 'Häufige Fragen'}
            </h2>
            <p className="text-[var(--muted)]">
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
