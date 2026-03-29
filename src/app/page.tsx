import Link from 'next/link'
import { Shield, Brain, CheckCircle, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-7 h-7 text-brand-600" />
            <span className="text-xl font-bold tracking-tight">TaxAlex</span>
          </div>
          <Link
            href="/einspruch"
            className="bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            Einspruch starten
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-20 md:py-32">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium mb-6">
            <CheckCircle className="w-4 h-4" />
            Vom Finanzamt akzeptiert
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-balance mb-6">
            Fehlerhafter Steuerbescheid?
            <br />
            <span className="text-brand-600">KI erstellt Ihren Einspruch.</span>
          </h1>
          <p className="text-lg text-[var(--muted)] leading-relaxed mb-8">
            TaxAlex nutzt mehrere KI-Modelle, die sich gegenseitig prüfen – für
            rechtlich fundierte Einspruchsschreiben. Kein Anwalt nötig.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/einspruch"
              className="bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
            >
              Kostenlos starten <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#wie-es-funktioniert"
              className="border border-[var(--border)] px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center"
            >
              So funktioniert es
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="wie-es-funktioniert" className="bg-white border-y border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold mb-12">
            Multi-KI-Technologie in 3 Schritten
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Bescheid hochladen',
                desc: 'Laden Sie Ihren Steuerbescheid und relevante Unterlagen hoch. Unsere KI extrahiert alle relevanten Daten.',
              },
              {
                step: '2',
                title: 'KI-Analyse & Entwurf',
                desc: 'Mehrere KI-Modelle erstellen unabhängig Argumente, prüfen sich gegenseitig und identifizieren Schwachstellen.',
              },
              {
                step: '3',
                title: 'Fertiges Einspruchsschreiben',
                desc: 'Sie erhalten ein professionelles, rechtlich argumentiertes Einspruchsschreiben – bereit zum Absenden.',
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-5xl font-bold text-brand-100 mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-[var(--muted)] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { stat: '3,3 Mio.+', label: 'Einsprüche pro Jahr in DE' },
            { stat: '66%', label: 'zumindest teilweise erfolgreich' },
            { stat: 'Jeder 5.', label: 'Bescheid enthält Fehler' },
            { stat: '€0', label: 'unser Proof-of-Concept' },
          ].map((item) => (
            <div key={item.label}>
              <div className="text-2xl font-bold text-brand-600">
                {item.stat}
              </div>
              <p className="text-sm text-[var(--muted)] mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-white">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <Shield className="w-4 h-4" />
            TaxAlex © {new Date().getFullYear()}
          </div>
          <div className="flex gap-6 text-sm text-[var(--muted)]">
            <a href="#" className="hover:text-brand-600">Impressum</a>
            <a href="#" className="hover:text-brand-600">Datenschutz</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
