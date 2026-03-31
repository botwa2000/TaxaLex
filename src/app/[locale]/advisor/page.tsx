import { PublicNav } from '@/components/PublicNav'
import { Footer } from '@/components/Footer'
import { TrustBadges } from '@/components/TrustBadges'
import {
  UserCheck, Clock, Lock, MessageSquare, CheckCircle2, ArrowRight,
  Euro, Scale, FileText, Shield, ChevronRight, Zap,
} from 'lucide-react'
import { Link } from '@/i18n/navigation'

export default async function AdvisorLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const isEN = locale === 'en'

  const steps = isEN
    ? [
        {
          icon: Zap,
          title: 'User creates objection',
          description: 'A TaxaLex user uploads their notice and lets 5 AI agents draft a structured, factually verified objection letter.',
        },
        {
          icon: UserCheck,
          title: 'User requests professional review',
          description: 'At checkout, the user adds the professional review option (€99). TaxaLex matches the case to an available, licensed professional.',
        },
        {
          icon: Lock,
          title: 'You receive a secure review link',
          description: 'You get an email with a time-limited, HMAC-signed link. No account needed — just open the link and review the draft.',
        },
        {
          icon: MessageSquare,
          title: 'You respond: approve, comment, or question',
          description: 'Three clear actions: approve the draft, add comments for the user to address, or ask a clarifying question. Your response is instant.',
        },
        {
          icon: Euro,
          title: 'You get paid',
          description: 'Payment is processed automatically. €99 per case review (€69 for cases from monthly subscribers), paid to your account within 7 days.',
        },
      ]
    : [
        {
          icon: Zap,
          title: 'Nutzer erstellt Einspruch',
          description: 'Ein TaxaLex-Nutzer lädt seinen Bescheid hoch und lässt 5 KI-Agenten einen strukturierten, faktengeprüften Einspruchsentwurf erstellen.',
        },
        {
          icon: UserCheck,
          title: 'Nutzer bucht Berater-Prüfung zu',
          description: 'Beim Checkout bucht der Nutzer die optionale Berater-Prüfung (99 €). TaxaLex ordnet den Fall einem verfügbaren zugelassenen Fachmann zu.',
        },
        {
          icon: Lock,
          title: 'Sie erhalten einen sicheren Prüf-Link',
          description: 'Sie erhalten eine E-Mail mit einem zeitlich begrenzten, HMAC-signierten Link. Kein Konto nötig — Link öffnen, Entwurf prüfen.',
        },
        {
          icon: MessageSquare,
          title: 'Sie antworten: freigeben, kommentieren oder rückfragen',
          description: 'Drei klare Aktionen: Entwurf freigeben, Kommentare für den Nutzer hinterlassen oder eine Rückfrage stellen. Ihre Antwort ist sofort sichtbar.',
        },
        {
          icon: Euro,
          title: 'Sie werden bezahlt',
          description: 'Die Zahlung erfolgt automatisch. 99 € pro Prüfung (69 € für Fälle von Monats-Abonnenten), Auszahlung innerhalb von 7 Tagen.',
        },
      ]

  const whyItems = isEN
    ? [
        {
          icon: Clock,
          title: '15–20 minutes per review',
          description: 'The AI has already done the research, structuring, and fact-checking. You focus on what only a licensed professional can do: quality sign-off.',
        },
        {
          icon: Scale,
          title: 'Within your professional scope',
          description: 'Reviewing and commenting on a draft prepared by the user\'s own tool is a permitted activity for tax advisors (StBerG) and lawyers (BRAO). You are not taking on a mandate.',
        },
        {
          icon: FileText,
          title: 'No drafting, no research',
          description: 'The AI handles drafting, legal citation, fact-checking and adversarial review. You review a near-finished document, not a blank page.',
        },
        {
          icon: Euro,
          title: 'Flexible additional income',
          description: 'Accept cases when you have capacity. No minimum commitment. Ideal as a low-friction income stream alongside your existing practice.',
        },
      ]
    : [
        {
          icon: Clock,
          title: '15–20 Minuten pro Prüfung',
          description: 'Die KI hat Recherche, Strukturierung und Faktenprüfung bereits erledigt. Sie konzentrieren sich auf das, was nur ein zugelassener Fachmann leisten kann: die fachliche Freigabe.',
        },
        {
          icon: Scale,
          title: 'Im Rahmen Ihrer Berufsordnung',
          description: 'Die Prüfung und Kommentierung eines vom Nutzer selbst erstellten Entwurfs ist für Steuerberater (StBerG) und Anwälte (BRAO) eine erlaubte Tätigkeit. Es entsteht kein Mandatsverhältnis.',
        },
        {
          icon: FileText,
          title: 'Kein Erstellen, keine Recherche',
          description: 'Die KI übernimmt Erstellung, Rechtszitate, Faktenprüfung und kritische Gegendarstellung. Sie prüfen ein nahezu fertiges Dokument — keine leere Seite.',
        },
        {
          icon: Euro,
          title: 'Flexibles Zusatzeinkommen',
          description: 'Nehmen Sie Fälle an, wenn Sie Kapazität haben. Keine Mindestbindung. Ideal als unkomplizierter Einkommensstrom neben Ihrer bestehenden Kanzlei.',
        },
      ]

  const requirements = isEN
    ? [
        'German tax advisor licence (Steuerberater, StBerG) or lawyer admission (Rechtsanwalt, BRAO)',
        'Valid professional indemnity insurance',
        'German bank account for payment (SEPA)',
        'Willingness to respond within 48 hours of receiving a case',
      ]
    : [
        'Deutsche Zulassung als Steuerberater (StBerG) oder Rechtsanwalt (BRAO)',
        'Gültige Berufshaftpflichtversicherung',
        'Deutsches Bankkonto für die Auszahlung (SEPA)',
        'Bereitschaft zur Antwort innerhalb von 48 Stunden nach Fallerhalt',
      ]

  const faq = isEN
    ? [
        {
          q: 'Am I taking on a legal mandate?',
          a: 'No. You are reviewing a draft that the user has created with their own tool. This is a quality check, not a mandate. No client relationship is established. You are not the author of the objection letter.',
        },
        {
          q: 'What exactly do I review?',
          a: 'You receive the complete AI-generated objection draft, the extracted notice data, and a summary of the AI\'s findings. You review for factual correctness, legal plausibility, and formal completeness.',
        },
        {
          q: 'What happens if I find a serious problem?',
          a: 'You can leave detailed comments for the user and flag the issue. The user decides whether to revise the draft, consult a professional further, or withdraw from submission. You are not responsible for the final submission decision.',
        },
        {
          q: 'How do I get matched to cases?',
          a: 'After signing up, you select your areas of expertise (tax, labour, social, rent, administrative). TaxaLex routes matching cases to available professionals in your category.',
        },
        {
          q: 'Can I reject a case?',
          a: 'Yes. Every case notification includes a brief summary. If you have a conflict of interest or insufficient expertise for a specific case, you can decline within 12 hours and the case is re-routed.',
        },
        {
          q: 'What about my professional secrecy obligations?',
          a: 'TaxaLex\'s data processing agreement (DPA) is designed for professional secrecy compliance. Personal data is minimal (the case content and your feedback). You do not see the user\'s full identity details unless they are in the document itself.',
        },
      ]
    : [
        {
          q: 'Übernehme ich damit ein Mandat?',
          a: 'Nein. Sie prüfen einen Entwurf, den der Nutzer mit seinem eigenen Tool erstellt hat. Es handelt sich um eine Qualitätsprüfung, kein Mandat. Es entsteht kein Mandatsverhältnis. Sie sind nicht der Autor des Einspruchsschreibens.',
        },
        {
          q: 'Was genau prüfe ich?',
          a: 'Sie erhalten den vollständigen KI-generierten Einspruchsentwurf, die extrahierten Bescheid-Daten und eine Zusammenfassung der KI-Erkenntnisse. Sie prüfen auf sachliche Korrektheit, rechtliche Plausibilität und formale Vollständigkeit.',
        },
        {
          q: 'Was passiert, wenn ich ein ernstes Problem finde?',
          a: 'Sie können ausführliche Kommentare für den Nutzer hinterlassen und das Problem kennzeichnen. Der Nutzer entscheidet, ob er den Entwurf überarbeitet, weiteren Fachrat einholt oder von der Einreichung absieht. Sie tragen keine Verantwortung für die finale Einreichungsentscheidung.',
        },
        {
          q: 'Wie werde ich Fällen zugeordnet?',
          a: 'Nach der Anmeldung wählen Sie Ihre Fachgebiete (Steuer, Arbeit, Soziales, Miete, Verwaltung). TaxaLex leitet passende Fälle an verfügbare Fachleute in Ihrer Kategorie weiter.',
        },
        {
          q: 'Kann ich einen Fall ablehnen?',
          a: 'Ja. Jede Fallbenachrichtigung enthält eine kurze Zusammenfassung. Wenn Sie befangen sind oder für einen spezifischen Fall nicht ausreichend qualifiziert sind, können Sie innerhalb von 12 Stunden ablehnen — der Fall wird neu zugeteilt.',
        },
        {
          q: 'Was gilt für meine Verschwiegenheitspflichten?',
          a: 'Die Datenschutzvereinbarung (DPA) von TaxaLex ist auf die Anforderungen der beruflichen Verschwiegenheit ausgelegt. Personenbezogene Daten sind minimal (der Fallinhalt und Ihr Feedback). Sie sehen keine vollständigen Identitätsdaten des Nutzers, außer sie befinden sich im Dokument selbst.',
        },
      ]

  return (
    <>
      <PublicNav locale={locale} />

      {/* Hero */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-b from-[var(--background)] to-[var(--background-subtle,var(--background))]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800 mb-6">
            <UserCheck className="w-3.5 h-3.5" />
            {isEN ? 'For licensed tax advisors & lawyers' : 'Für zugelassene Steuerberater & Rechtsanwälte'}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--foreground)] mb-5 leading-tight">
            {isEN
              ? <>€99 per review.<br className="hidden sm:block" /> 15 minutes. No new clients.</>
              : <>€99 pro Prüfung.<br className="hidden sm:block" /> 15 Minuten. Keine neuen Mandate.</>}
          </h1>
          <p className="text-lg text-[var(--muted)] leading-relaxed mb-8 max-w-2xl mx-auto">
            {isEN
              ? 'TaxaLex users pay €99 to have their AI-generated objection letter reviewed by a licensed professional. The AI does the drafting — you provide the expert sign-off. Flexible, fast, fully remote.'
              : 'TaxaLex-Nutzer zahlen 99 €, damit ihr KI-generiertes Einspruchsschreiben von einem zugelassenen Fachmann geprüft wird. Die KI erstellt den Entwurf — Sie geben die fachliche Freigabe. Flexibel, schnell, vollständig remote.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register?role=advisor"
              className="inline-flex items-center gap-2 bg-amber-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-700 transition-colors shadow-md"
            >
              {isEN ? 'Apply as reviewer' : 'Als Prüfer bewerben'}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 border border-[var(--border)] text-[var(--foreground)] px-8 py-3.5 rounded-xl font-semibold hover:bg-[var(--background-subtle)] transition-colors"
            >
              {isEN ? 'How it works' : 'Wie es funktioniert'}
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-[var(--border)] bg-[var(--surface)] py-4 px-4">
        <TrustBadges locale={locale} variant="row" className="max-w-4xl mx-auto" />
      </section>

      {/* Why it works */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--foreground)] mb-3">
              {isEN ? 'Why professionals choose TaxaLex' : 'Warum Fachleute TaxaLex wählen'}
            </h2>
            <p className="text-[var(--muted)] max-w-xl mx-auto">
              {isEN
                ? 'You are not replacing your expertise. You are applying it where it matters most — and getting paid for exactly that.'
                : 'Sie ersetzen Ihr Fachwissen nicht. Sie wenden es dort an, wo es am meisten zählt — und werden genau dafür bezahlt.'}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {whyItems.map((item) => (
              <div key={item.title} className="flex gap-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950 rounded-xl flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--foreground)] mb-1">{item.title}</h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — 5 steps */}
      <section id="how-it-works" className="py-16 px-4 bg-[var(--surface)] border-y border-[var(--border)]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-10 text-center">
            {isEN ? 'How a review works' : 'Wie eine Prüfung abläuft'}
          </h2>
          <div className="space-y-6">
            {steps.map((step, i) => (
              <div key={step.title} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                    {i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-px flex-1 bg-[var(--border)] mt-2" />
                  )}
                </div>
                <div className="pb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <step.icon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <h3 className="font-semibold text-sm text-[var(--foreground)]">{step.title}</h3>
                  </div>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings calculator */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">
            {isEN ? 'What you earn' : 'Was Sie verdienen'}
          </h2>
          <p className="text-[var(--muted)] mb-8">
            {isEN ? 'Based on 15–20 minutes per review.' : 'Basierend auf 15–20 Minuten pro Prüfung.'}
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { cases: isEN ? '4 cases/month' : '4 Fälle/Monat', gross: '€396', hours: isEN ? '~1 hour' : '~1 Stunde' },
              { cases: isEN ? '10 cases/month' : '10 Fälle/Monat', gross: '€990', hours: isEN ? '~2.5 hours' : '~2,5 Stunden' },
              { cases: isEN ? '20 cases/month' : '20 Fälle/Monat', gross: '€1.980', hours: isEN ? '~5 hours' : '~5 Stunden' },
            ].map((row) => (
              <div key={row.cases} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 text-center">
                <p className="text-xs text-[var(--muted)] font-medium mb-2">{row.cases}</p>
                <p className="text-3xl font-extrabold text-[var(--foreground)] mb-1">{row.gross}</p>
                <p className="text-xs text-[var(--muted)]">{row.hours}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--muted)] mt-4">
            {isEN
              ? '* Gross figures at €99/review standard rate. TaxaLex retains a platform fee. Final payout confirmed during onboarding.'
              : '* Bruttowerte zum Standardsatz von €99/Prüfung. TaxaLex erhebt eine Plattformgebühr. Endgültige Auszahlung wird beim Onboarding bestätigt.'}
          </p>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-12 px-4 bg-[var(--surface)] border-y border-[var(--border)]">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-6 text-center">
            {isEN ? 'Requirements' : 'Voraussetzungen'}
          </h2>
          <ul className="space-y-3">
            {requirements.map((req) => (
              <li key={req} className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span className="text-[var(--foreground)]">{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Legal clarity */}
      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                {isEN ? 'Professional & legal clarity' : 'Berufsrechtliche Klarheit'}
              </h3>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
              {isEN
                ? 'TaxaLex is a self-service tool. Users create and submit their own objection letters. Your role is quality review and professional feedback — analogous to a colleague review, not a client mandate. TaxaLex provides a processing agreement (DPA) compliant with § 62a StBerG and § 43e BRAO for data handling.'
                : 'TaxaLex ist ein Self-Service-Tool. Nutzer erstellen und reichen ihre eigenen Einsprüche ein. Ihre Rolle ist die Qualitätsprüfung und fachliches Feedback — analog zu einer Kollegenprüfung, kein Mandatsverhältnis. TaxaLex stellt eine Auftragsverarbeitungsvereinbarung (AVV) gemäß § 62a StBerG und § 43e BRAO für die Datenverarbeitung bereit.'}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-[var(--surface)] border-y border-[var(--border)]">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-8 text-center">
            {isEN ? 'Frequently asked questions' : 'Häufige Fragen'}
          </h2>
          <div className="space-y-4">
            {faq.map((item) => (
              <div key={item.q} className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-5">
                <h3 className="font-semibold text-sm text-[var(--foreground)] mb-2">{item.q}</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold text-[var(--foreground)] mb-4">
            {isEN ? 'Ready to start reviewing?' : 'Bereit, Fälle zu prüfen?'}
          </h2>
          <p className="text-[var(--muted)] mb-8">
            {isEN
              ? 'Applications take about 5 minutes. We verify your licence and send you a welcome email within 48 hours.'
              : 'Die Bewerbung dauert ca. 5 Minuten. Wir überprüfen Ihre Zulassung und senden Ihnen innerhalb von 48 Stunden eine Willkommens-E-Mail.'}
          </p>
          <Link
            href="/register?role=advisor"
            className="inline-flex items-center gap-2 bg-amber-600 text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-amber-700 transition-colors shadow-md hover:shadow-lg"
          >
            {isEN ? 'Apply now — free' : 'Jetzt bewerben — kostenlos'}
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-xs text-[var(--muted)] mt-4">
            {isEN ? 'No subscription. You earn per review.' : 'Kein Abo. Verdienst pro Prüfung.'}
          </p>
        </div>
      </section>

      <Footer locale={locale} />
    </>
  )
}
