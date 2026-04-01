import { ArrowLeft, CreditCard } from 'lucide-react'
import { Link } from '@/i18n/navigation'

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-10 shadow-sm text-center max-w-sm w-full">
        <div className="w-16 h-16 bg-[var(--background-subtle)] rounded-full flex items-center justify-center mx-auto mb-5">
          <CreditCard className="w-8 h-8 text-[var(--muted)]" />
        </div>

        <h1 className="text-xl font-bold text-[var(--foreground)] mb-2">Zahlung abgebrochen</h1>
        <p className="text-sm text-[var(--muted)] mb-6">
          Kein Problem — Sie wurden nicht belastet. Sie können jederzeit einen Plan auswählen.
        </p>

        <Link
          href="/billing"
          className="inline-flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zur Preisübersicht
        </Link>
      </div>
    </div>
  )
}
