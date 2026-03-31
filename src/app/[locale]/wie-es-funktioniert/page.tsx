import { PublicNav } from '@/components/PublicNav'
import { Footer } from '@/components/Footer'
import { TrustBadges } from '@/components/TrustBadges'
import { Upload, Brain, Download, FileText, Eye, Scale, Layers, Shield, CheckCircle2, ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'

export default async function HowItWorksPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const isEN = locale === 'en'

  const agents = isEN
    ? [
        { name: 'Drafter', icon: FileText, color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300', description: 'Creates the initial objection draft including all formal requirements, citations of legal basis, and argumentation structure.' },
        { name: 'Reviewer', icon: Eye, color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300', description: 'Reviews the draft for logical errors, missing arguments, incorrect citations, and formal deficiencies.' },
        { name: 'Fact-Checker', icon: Scale, color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300', description: 'Verifies all legal citations against current legislation and recent court rulings via Perplexity search.' },
        { name: 'Adversary', icon: Shield, color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300', description: 'Takes the authority\'s perspective and identifies potential weaknesses in the objection — so they can be addressed proactively.' },
        { name: 'Consolidator', icon: Layers, color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300', description: 'Merges the outputs of all four agents into a final, polished objection letter ready for submission.' },
      ]
    : [
        { name: 'Drafter', icon: FileText, color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300', description: 'Erstellt den ersten Einspruchsentwurf mit allen formalen Anforderungen, Rechtsgrundlagen und Argumentationsstruktur.' },
        { name: 'Reviewer', icon: Eye, color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300', description: 'Prüft den Entwurf auf Logikfehler, fehlende Argumente, falsche Zitate und formale Mängel.' },
        { name: 'Fact-Checker', icon: Scale, color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300', description: 'Verifiziert alle Rechtszitate gegen aktuelle Gesetzgebung und aktuelle BFH-Urteile über Perplexity-Recherche.' },
        { name: 'Adversary', icon: Shield, color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300', description: 'Nimmt die Perspektive des Finanzamts ein und identifiziert potenzielle Schwächen des Einspruchs – damit diese proaktiv adressiert werden.' },
        { name: 'Consolidator', icon: Layers, color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300', description: 'Fügt die Ausgaben aller vier Agenten zu einem finalen, ausgefeilten Einspruchsschreiben zusammen.' },
      ]

  return (
    <>
      <PublicNav locale={locale} />

      {/* Header */}
      <section className="py-16 sm:py-20 px-4 bg-gradient-to-b from-[var(--background)] to-[var(--background-subtle,var(--background))]">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--foreground)] mb-4">
            {isEN ? 'How TaxaLex works' : 'So funktioniert TaxaLex'}
          </h1>
          <p className="text-lg text-[var(--muted)] leading-relaxed">
            {isEN
              ? 'Three simple steps. Five AI agents. One ready-to-send objection letter.'
              : 'Drei einfache Schritte. Fünf KI-Agenten. Ein versandfertiges Einspruchsschreiben.'}
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
                {isEN ? 'Upload your notice' : 'Bescheid hochladen'}
              </h2>
              <p className="text-[var(--muted)]">
                {isEN ? 'All common file formats supported' : 'Alle gängigen Dateiformate werden unterstützt'}
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
              <Upload className="w-6 h-6 text-brand-600 mb-3" />
              <h3 className="font-semibold text-[var(--foreground)] mb-2">
                {isEN ? 'Supported formats' : 'Unterstützte Formate'}
              </h3>
              <ul className="text-sm text-[var(--muted)] space-y-1">
                <li>PDF – {isEN ? 'Direct text extraction or OCR' : 'Direkte Textextraktion oder OCR'}</li>
                <li>JPG, PNG – {isEN ? 'Photo of the notice (OCR)' : 'Foto des Bescheids (OCR)'}</li>
                <li>DOCX – {isEN ? 'Editable Word documents' : 'Bearbeitbare Word-Dokumente'}</li>
                <li>TXT – {isEN ? 'Plain text' : 'Reiner Text'}</li>
              </ul>
              <p className="text-xs text-[var(--muted)] mt-3">
                {isEN ? 'Max. 10 MB per file. Multiple files allowed.' : 'Max. 10 MB pro Datei. Mehrere Dateien möglich.'}
              </p>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
              <CheckCircle2 className="w-6 h-6 text-brand-600 mb-3" />
              <h3 className="font-semibold text-[var(--foreground)] mb-2">
                {isEN ? 'Automatic data extraction' : 'Automatische Datenextraktion'}
              </h3>
              <p className="text-sm text-[var(--muted)]">
                {isEN
                  ? 'TaxaLex automatically extracts key data such as tax office name, notice date, assessment amounts, deadlines and legal references. You review and confirm the extracted data before generation begins.'
                  : 'TaxaLex extrahiert automatisch Schlüsseldaten wie Finanzamtname, Bescheiddatum, festgesetzte Beträge, Fristen und Rechtsgrundlagen. Sie überprüfen und bestätigen die erkannten Daten, bevor die Generierung beginnt.'}
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
                {isEN ? 'AI analysis by 5 agents' : 'KI-Analyse durch 5 Agenten'}
              </h2>
              <p className="text-[var(--muted)]">
                {isEN ? 'Claude, Gemini and Perplexity work together' : 'Claude, Gemini und Perplexity arbeiten zusammen'}
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent, i) => (
              <div key={agent.name} className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${agent.color}`}>
                  <agent.icon className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-[var(--muted)]">#{i + 1}</span>
                  <h3 className="font-semibold text-sm text-[var(--foreground)]">{agent.name}</h3>
                </div>
                <p className="text-xs text-[var(--muted)] leading-relaxed">{agent.description}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--muted)] mt-6 text-center">
            {isEN
              ? 'The entire analysis typically completes in under 5 minutes. You can watch the progress in real time.'
              : 'Die gesamte Analyse dauert typischerweise unter 5 Minuten. Sie können den Fortschritt in Echtzeit verfolgen.'}
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
                {isEN ? 'Download & submit' : 'Herunterladen & einreichen'}
              </h2>
              <p className="text-[var(--muted)]">
                {isEN ? 'Review, download, and send to the authority' : 'Prüfen, herunterladen und an die Behörde senden'}
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
              <Download className="w-6 h-6 text-brand-600 mb-3" />
              <h3 className="font-semibold text-[var(--foreground)] mb-2">
                {isEN ? 'Download formats' : 'Download-Formate'}
              </h3>
              <ul className="text-sm text-[var(--muted)] space-y-1.5">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> DOCX – {isEN ? 'Editable in Word' : 'Bearbeitbar in Word'}</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> TXT – {isEN ? 'Plain text' : 'Reiner Text'}</li>
                <li className="flex items-center gap-2text-[var(--muted)]"><span className="w-3.5 h-3.5 inline-block" /> PDF – {isEN ? 'Coming soon' : 'Demnächst'}</li>
              </ul>
            </div>
            <div className="bg-amber-50 border border-amber-200 dark:bg-amber-950 dark:border-amber-900 rounded-2xl p-6">
              <Shield className="w-6 h-6 text-amber-600 mb-3" />
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                {isEN ? 'Legal note' : 'Rechtlicher Hinweis'}
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                {isEN
                  ? 'The generated document is an AI-assisted draft. It is not legal advice within the meaning of the German Legal Services Act (RDG). For complex cases, consult a tax advisor or lawyer before submission.'
                  : 'Das generierte Dokument ist ein KI-gestützter Entwurf. Es stellt keine Rechtsberatung i.S.d. RDG dar. Bei komplexen Fällen empfehlen wir die Prüfung durch einen Steuerberater oder Anwalt vor der Einreichung.'}
              </p>
            </div>
          </div>
          <div className="text-center">
            <Link
              href="/einspruch"
              className="inline-flex items-center gap-2 bg-brand-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-brand-700 transition-colors"
            >
              {isEN ? 'Try the demo' : 'Demo starten'}
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
