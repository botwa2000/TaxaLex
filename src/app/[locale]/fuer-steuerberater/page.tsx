import { PublicNav } from '@/components/PublicNav'
import { Footer } from '@/components/Footer'
import { PricingCard } from '@/components/PricingCard'
import { TrustBadges } from '@/components/TrustBadges'
import { getPricingPlans } from '@/lib/contentFallbacks'
import { Users, Zap, FileText, BarChart3, CheckCircle2, ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'

export default async function FuerSteuerberaterPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const isEN = locale === 'en'
  const advisorPlans = getPricingPlans('advisor')

  const features = isEN
    ? [
        { icon: Users, title: 'Multi-client dashboard', description: 'Manage all your clients\' objections in one place. See status, deadlines, and outstanding tasks at a glance.' },
        { icon: Zap, title: 'Faster turnaround', description: 'Generate a professionally drafted objection in under 5 minutes — so you can handle more cases without extra staff.' },
        { icon: FileText, title: 'White-label export', description: 'Download objection letters with your own firm header. Present TaxaLex results as your own workflow.' },
        { icon: BarChart3, title: 'Case analytics', description: 'Track success rates, outstanding deadlines, and active cases across all clients in a single view.' },
      ]
    : [
        { icon: Users, title: 'Multi-Mandanten-Dashboard', description: 'Verwalten Sie die Einsprüche aller Mandanten an einem Ort. Status, Fristen und offene Aufgaben auf einen Blick.' },
        { icon: Zap, title: 'Schnellere Bearbeitung', description: 'Einen professionell formulierten Einspruch in unter 5 Minuten generieren – mehr Mandate, gleicher Aufwand.' },
        { icon: FileText, title: 'White-Label-Export', description: 'Einspruchs-Schreiben mit Ihrem Kanzlei-Briefkopf herunterladen. TaxaLex als Teil Ihres eigenen Workflows.' },
        { icon: BarChart3, title: 'Fall-Analysen', description: 'Erfolgsquoten, offene Fristen und aktive Fälle aller Mandanten in einer Übersicht.' },
      ]

  const steps = isEN
    ? [
        { step: 1, title: 'Create client', description: 'Add a client to your dashboard in seconds.' },
        { step: 2, title: 'Upload notice', description: 'Upload the client\'s administrative notice (PDF, photo, scan).' },
        { step: 3, title: 'AI generates draft', description: 'Five AI agents analyse the case and draft the objection letter in under 5 minutes.' },
        { step: 4, title: 'Review & download', description: 'Review the draft, add your firm header, and download it for submission.' },
      ]
    : [
        { step: 1, title: 'Mandanten anlegen', description: 'Mandanten in Sekunden zum Dashboard hinzufügen.' },
        { step: 2, title: 'Bescheid hochladen', description: 'Den Bescheid des Mandanten hochladen (PDF, Foto, Scan).' },
        { step: 3, title: 'KI erstellt Entwurf', description: 'Fünf KI-Agenten analysieren den Fall und erstellen das Einspruchsschreiben in unter 5 Minuten.' },
        { step: 4, title: 'Prüfen & herunterladen', description: 'Entwurf prüfen, Kanzlei-Briefkopf ergänzen und für die Einreichung herunterladen.' },
      ]

  return (
    <>
      <PublicNav locale={locale} />

      {/* Hero */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-b from-[var(--background)] to-[var(--background-subtle,var(--background))]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-brand-200 dark:border-brand-800 mb-6">
            <Users className="w-3.5 h-3.5" />
            {isEN ? 'For tax advisors & lawyers' : 'Für Steuerberater & Rechtsanwälte'}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--foreground)] mb-4">
            {isEN ? 'More clients. Less effort.' : 'Mehr Mandate. Weniger Aufwand.'}
          </h1>
          <p className="text-lg text-[var(--muted)] leading-relaxed mb-8">
            {isEN
              ? 'TaxaLex supports tax advisors and lawyers in drafting objection letters quickly and at scale — without compromising quality.'
              : 'TaxaLex unterstützt Steuerberater und Rechtsanwälte bei der schnellen und skalierenden Erstellung von Einsprüchen und Widersprüchen – ohne Qualitätseinbußen.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-brand-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-brand-700 transition-colors"
            >
              {isEN ? 'Start free trial' : 'Kostenlos testen'}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login?role=advisor"
              className="inline-flex items-center gap-2 border border-[var(--border)] text-[var(--foreground)] px-8 py-3.5 rounded-xl font-semibold hover:bg-[var(--background-subtle)] transition-colors"
            >
              {isEN ? 'View demo' : 'Demo ansehen'}
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
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--foreground)] mb-3">
              {isEN ? 'Built for advisors' : 'Für Berater entwickelt'}
            </h2>
          </div>
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

      {/* How it works for advisors */}
      <section className="py-16 px-4 bg-[var(--surface)] border-y border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-10 text-center">
            {isEN ? 'Your workflow in 4 steps' : 'Ihr Workflow in 4 Schritten'}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((s) => (
              <div key={s.step} className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-5">
                <div className="w-8 h-8 bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 rounded-lg flex items-center justify-center font-bold text-sm mb-3">
                  {s.step}
                </div>
                <h3 className="font-semibold text-sm text-[var(--foreground)] mb-1.5">{s.title}</h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advisor pricing */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">
              {isEN ? 'Advisor pricing' : 'Berater-Preise'}
            </h2>
            <p className="text-[var(--muted)]">
              {isEN ? 'Flat monthly fee. Unlimited objections.' : 'Monatliche Pauschale. Unbegrenzte Einsprüche.'}
            </p>
          </div>
          <div className="grid sm:grid-cols-1 max-w-sm mx-auto gap-6">
            {advisorPlans.map((plan) => (
              <PricingCard key={plan.slug} plan={plan} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      {/* Datev placeholder */}
      <section className="py-10 px-4 bg-[var(--surface)] border-y border-[var(--border)]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-[var(--muted)] font-medium mb-1">
            {isEN ? 'Coming soon' : 'Demnächst'}
          </p>
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            {isEN ? 'DATEV integration' : 'DATEV-Integration'}
          </h3>
          <p className="text-sm text-[var(--muted)]">
            {isEN
              ? 'We are working on a DATEV interface for direct import/export. Contact us to join the beta.'
              : 'Wir arbeiten an einer DATEV-Schnittstelle für den direkten Im-/Export. Kontaktieren Sie uns für die Beta.'}
          </p>
          <Link
            href="/kontakt"
            className="inline-block mt-4 text-sm text-brand-600 hover:underline underline-offset-2 dark:text-brand-400"
          >
            {isEN ? 'Contact us →' : 'Kontakt aufnehmen →'}
          </Link>
        </div>
      </section>

      <Footer locale={locale} />
    </>
  )
}
