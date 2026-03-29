import Link from 'next/link'
import { Logo } from '@/components/Logo'

export default function AGBPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="bg-white border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center">
          <Logo size="sm" />
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Allgemeine Geschäftsbedingungen</h1>
        <div className="bg-white rounded-xl border border-[var(--border)] p-6 space-y-4 text-sm text-[var(--muted)] leading-relaxed">
          <p className="font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs">
            Platzhalter — vollständige AGB werden vor dem Launch von einem Rechtsanwalt verfasst und eingefügt.
          </p>
          <div>
            <p className="font-medium text-[var(--foreground)] mb-1">§ 1 Geltungsbereich</p>
            <p>Diese AGB gelten für die Nutzung der Plattform [Name] zur KI-gestützten Erstellung von Einspruchs- und Widerspruchsschreiben.</p>
          </div>
          <div>
            <p className="font-medium text-[var(--foreground)] mb-1">§ 2 Haftungsausschluss</p>
            <p>Die durch das System generierten Schreiben stellen keinen Rechtsrat im Sinne des Rechtsdienstleistungsgesetzes (RDG) dar. Eine Haftung für die Richtigkeit der generierten Inhalte wird ausgeschlossen.</p>
          </div>
        </div>
        <div className="mt-6">
          <Link href="/" className="text-sm text-brand-600 hover:underline">← Zurück zur Startseite</Link>
        </div>
      </main>
    </div>
  )
}
