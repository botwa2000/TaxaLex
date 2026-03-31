import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Clock, CheckCircle2, MessageSquare, LayoutDashboard, Info } from 'lucide-react'
import { Link } from '@/i18n/navigation'

// Demo pending review — shown until real review requests exist
const DEMO_REVIEWS = [
  {
    id: 'demo-rev-001',
    caseType: 'Einkommensteuerbescheid 2023',
    userName: 'Max Mustermann',
    note: 'Bitte prüfen, ob die Werbungskosten korrekt berücksichtigt sind.',
    requestedAt: '2026-03-29T09:15:00Z',
    deadline: '2026-04-12T00:00:00Z',
    status: 'PENDING' as const,
  },
]

function daysBetween(from: string, to: string) {
  const ms = new Date(to).getTime() - new Date(from).getTime()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

export default async function AdvisorDashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')
  if (!['ADVISOR', 'LAWYER', 'ADMIN'].includes(session.user?.role ?? '')) {
    redirect('/dashboard')
  }

  const isLawyer = session.user?.role === 'LAWYER'
  const today = new Date().toISOString()

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
          <LayoutDashboard className="w-4 h-4 text-brand-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            {isLawyer ? 'Anwalt-Dashboard' : 'Berater-Dashboard'}
          </h1>
          <p className="text-sm text-[var(--muted)]">Willkommen, {session.user?.name}</p>
        </div>
      </div>

      {/* Explainer banner */}
      <div className="bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900 rounded-xl p-4 mb-6 flex gap-3">
        <Info className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
        <div className="text-sm text-brand-800 dark:text-brand-200 leading-relaxed">
          <p className="font-semibold mb-1">Ihre Rolle auf TaxaLex</p>
          <p>
            Wenn ein Nutzer einen Einspruch erstellt hat und eine Prüfung wünscht, erhalten Sie
            eine E-Mail mit einem Prüf-Link. Sie öffnen den Brief, können ihn{' '}
            <strong>freigeben</strong>, einen <strong>Kommentar senden</strong> oder eine{' '}
            <strong>Rückfrage stellen</strong>. Der Nutzer wird sofort benachrichtigt.
          </p>
          <p className="mt-1 text-brand-600 dark:text-brand-400 text-xs">
            Einsprüche werden von TaxaLex erstellt — Ihre Zeit fließt in die Prüfung, nicht in die Erstellung.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: Clock, label: 'Ausstehend', value: DEMO_REVIEWS.filter(r => r.status === 'PENDING').length, color: 'bg-amber-50 text-amber-600' },
          { icon: CheckCircle2, label: 'Freigegeben', value: 0, color: 'bg-green-50 text-green-600' },
          { icon: MessageSquare, label: 'Kommentiert', value: 0, color: 'bg-blue-50 text-blue-600' },
        ].map((s) => (
          <div key={s.label} className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4">
            <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">{s.value}</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending reviews */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)]">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="font-semibold text-sm text-[var(--foreground)]">Ausstehende Prüfungen</h2>
          <span className="text-xs text-[var(--muted)] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium">
            {DEMO_REVIEWS.length} ausstehend
          </span>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {DEMO_REVIEWS.map((review) => {
            const daysLeft = daysBetween(today, review.deadline)
            const urgency = daysLeft <= 3 ? 'text-red-600' : daysLeft <= 7 ? 'text-amber-600' : 'text-[var(--muted)]'
            return (
              <div key={review.id} className="px-5 py-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-[var(--foreground)]">{review.caseType}</p>
                    <span className="text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium">
                      Ausstehend
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)] mb-1">
                    Von: {review.userName} · Angefragt {new Date(review.requestedAt).toLocaleDateString('de-DE')}
                  </p>
                  {review.note && (
                    <p className="text-xs text-[var(--foreground)] bg-[var(--background-subtle)] rounded-lg px-3 py-2 mt-2 italic">
                      „{review.note}"
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className={`text-xs font-medium ${urgency} mb-2`}>
                    Frist: {new Date(review.deadline).toLocaleDateString('de-DE')}
                    <br />
                    <span className="font-normal">({daysLeft} Tage)</span>
                  </p>
                  <Link
                    href="/advisor/reviews"
                    className="inline-flex items-center gap-1 bg-brand-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-brand-700 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Jetzt prüfen
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Completed reviews (empty state) */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] mt-4">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h2 className="font-semibold text-sm text-[var(--foreground)]">Abgeschlossene Prüfungen</h2>
        </div>
        <div className="px-5 py-10 text-center text-[var(--muted)] text-sm">
          Noch keine abgeschlossenen Prüfungen.
        </div>
      </div>
    </div>
  )
}
