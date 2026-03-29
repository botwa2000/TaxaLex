import { auth } from '@/auth'
import Link from 'next/link'
import {
  CheckCircle2,
  ArrowRight,
  CreditCard,
  FileText,
  Package,
  Zap,
  Users,
} from 'lucide-react'

export default async function BillingPage() {
  const session = await auth()
  const currentPlan = 'none' // Placeholder — will come from DB

  const plans = [
    {
      id: 'single',
      name: 'Einzelfall',
      audience: 'Privatpersonen',
      price: '5,99',
      period: 'pro Einspruch',
      description: 'Einmalig zahlen, einmalig nutzen.',
      icon: FileText,
      features: [
        'Ein vollständiger Einspruch',
        'Alle Bescheid-Typen',
        'PDF- & TXT-Download',
        '5 KI-Agenten',
        '30 Tage Zugriff auf den Entwurf',
      ],
      missing: ['Frist-Erinnerungen', 'Dokumenten-Archiv', 'API-Zugang'],
      cta: 'Jetzt erstellen',
      highlight: false,
    },
    {
      id: 'pack',
      name: '5er-Paket',
      audience: 'Selbstständige & Familien',
      price: '19,99',
      period: 'einmalig',
      description: 'Für Selbstständige oder wenn mehrere Bescheide anfallen.',
      icon: Package,
      features: [
        '5 Einsprüche ohne Ablaufdatum',
        'Alle Bescheid-Typen',
        'PDF- & TXT-Download',
        'Frist-Erinnerungen per E-Mail',
        'Dokumenten-Archiv',
        'Prioritäts-Support',
      ],
      missing: ['Mandanten-Verwaltung', 'API-Zugang'],
      cta: '5er-Paket kaufen',
      highlight: true,
    },
    {
      id: 'profi',
      name: 'Profi-Flatrate',
      audience: 'Berater & Kanzleien',
      price: '49',
      period: 'pro Monat',
      description: 'Unbegrenzte Nutzung für Profis.',
      icon: Users,
      features: [
        'Unbegrenzte Einsprüche',
        'Alle Bescheid-Typen',
        'Bis zu 5 Teammitglieder',
        'Mandanten-Verwaltung',
        'API-Zugang (REST)',
        'SLA & dedizierter Support',
      ],
      missing: [],
      cta: 'Profi-Zugang anfragen',
      highlight: false,
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Abrechnung & Guthaben
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Kaufen Sie Einsprüche einzeln oder als Paket — kein Abo erforderlich.
        </p>
      </div>

      {/* Current credit status */}
      <div className="bg-white rounded-xl border border-[var(--border)] p-5 mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-[var(--foreground)]">
                Guthaben:
              </span>
              <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                0 Einsprüche verfügbar
              </span>
            </div>
            <p className="text-sm text-[var(--muted)]">
              {session?.user?.email} · Mitglied seit{' '}
              {new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
            </p>
            <p className="text-xs text-[var(--muted)] mt-2">
              Kaufen Sie einen Einzelfall oder ein 5er-Paket um loszulegen.
            </p>
          </div>
          <button
            disabled
            className="flex items-center gap-1.5 text-sm border border-[var(--border)] px-3 py-1.5 rounded-lg text-[var(--muted)] cursor-not-allowed"
          >
            <FileText className="w-3.5 h-3.5" />
            Rechnungen
          </button>
        </div>
      </div>

      {/* Plan comparison */}
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
        Guthaben kaufen
      </h2>
      <div className="grid md:grid-cols-3 gap-5 mb-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-2xl border flex flex-col bg-white ${
              plan.highlight
                ? 'border-brand-600 ring-2 ring-brand-100'
                : 'border-[var(--border)]'
            }`}
          >
            {plan.highlight && (
              <div className="bg-brand-600 text-white text-xs font-semibold text-center py-1.5 rounded-t-2xl">
                Beliebteste Wahl
              </div>
            )}
            <div className="p-5 flex flex-col flex-1">
              <div className="mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)] mb-1">
                  {plan.audience}
                </p>
                <p className="font-bold text-[var(--foreground)] text-lg">{plan.name}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-[var(--foreground)]">
                    {plan.price} €
                  </span>
                  <span className="text-sm text-[var(--muted)]">{plan.period}</span>
                </div>
                <p className="text-xs text-[var(--muted)] mt-1">{plan.description}</p>
              </div>

              <ul className="space-y-2 flex-1 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-[var(--foreground)]">{f}</span>
                  </li>
                ))}
                {plan.missing.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm opacity-40">
                    <div className="w-4 h-4 shrink-0 mt-0.5 flex items-center justify-center">
                      <div className="w-3 h-px bg-gray-400" />
                    </div>
                    <span className="text-[var(--muted)]">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => alert(`${plan.name}: Stripe-Integration kommt in Kürze.`)}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  plan.highlight
                    ? 'bg-brand-600 text-white hover:bg-brand-700'
                    : 'border border-brand-600 text-brand-600 hover:bg-brand-50'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment method */}
      <div className="bg-white rounded-xl border border-[var(--border)] p-5">
        <h2 className="font-semibold text-sm text-[var(--foreground)] mb-4">
          Zahlungsmethode
        </h2>
        <div className="flex items-center gap-3 py-3 border border-dashed border-[var(--border)] rounded-xl px-4">
          <CreditCard className="w-8 h-8 text-[var(--muted)]" />
          <div>
            <p className="text-sm text-[var(--muted)]">
              Noch keine Zahlungsmethode hinterlegt
            </p>
            <p className="text-xs text-[var(--muted)]">
              Wird beim Kauf hinzugefügt (Stripe)
            </p>
          </div>
          <button
            onClick={() => alert('Zahlungsmethode: Stripe-Integration kommt in Kürze.')}
            className="ml-auto flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Hinzufügen <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
