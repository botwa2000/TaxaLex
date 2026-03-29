import Link from 'next/link'
import { Logo } from '@/components/Logo'

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="bg-white border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center">
          <Logo size="sm" />
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Datenschutzerklärung</h1>
        <div className="bg-white rounded-xl border border-[var(--border)] p-6 space-y-4 text-sm text-[var(--muted)] leading-relaxed">
          <p className="font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs">
            Platzhalter — vollständige DSGVO-konforme Datenschutzerklärung wird vor dem Launch eingefügt.
          </p>
          <div>
            <p className="font-medium text-[var(--foreground)] mb-1">Verantwortlicher</p>
            <p>Gemäß Art. 4 Nr. 7 DSGVO: [Name und Anschrift des Betreibers]</p>
          </div>
          <div>
            <p className="font-medium text-[var(--foreground)] mb-1">Erhobene Daten</p>
            <p>Wir erheben nur die für den Betrieb notwendigen Daten: E-Mail-Adresse, hochgeladene Dokumente (temporär), Sitzungsdaten.</p>
          </div>
          <div>
            <p className="font-medium text-[var(--foreground)] mb-1">Ihre Rechte (DSGVO Art. 15–22)</p>
            <p>Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch.</p>
          </div>
        </div>
        <div className="mt-6">
          <Link href="/" className="text-sm text-brand-600 hover:underline">← Zurück zur Startseite</Link>
        </div>
      </main>
    </div>
  )
}
