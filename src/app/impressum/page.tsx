import Link from 'next/link'
import { Logo } from '@/components/Logo'

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="bg-white border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center">
          <Logo size="sm" />
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Impressum</h1>
        <div className="bg-white rounded-xl border border-[var(--border)] p-6 space-y-4 text-sm text-[var(--muted)] leading-relaxed">
          <div>
            <p className="font-semibold text-[var(--foreground)] mb-1">Angaben gemäß § 5 TMG</p>
            <p className="font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs">
              Platzhalter — Impressum wird vor dem Launch mit vollständigen Angaben befüllt.
            </p>
          </div>
          <div>
            <p className="font-medium text-[var(--foreground)]">Kontakt</p>
            <p>E-Mail: kontakt@[domain].de</p>
          </div>
          <div>
            <p className="font-medium text-[var(--foreground)]">Haftung für Inhalte</p>
            <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht.</p>
          </div>
        </div>
        <div className="mt-6">
          <Link href="/" className="text-sm text-brand-600 hover:underline">← Zurück zur Startseite</Link>
        </div>
      </main>
    </div>
  )
}
