import { auth } from '@/auth'
import { CreditCard, FileText, Package, Calendar, UserCheck, Info } from 'lucide-react'
import { PRICING_PLANS } from '@/lib/contentFallbacks'
import { BillingActions } from './BillingActions'

// Only show DE features for the billing page
function getPlanFeatures(slug: string): string[] {
  const plan = PRICING_PLANS.find((p) => p.slug === slug)
  if (!plan) return []
  return plan.features
    .filter((f) => f.locale === 'de' && f.included)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((f) => f.text)
}

function getPlanName(slug: string): string {
  const plan = PRICING_PLANS.find((p) => p.slug === slug)
  return plan?.translations['de']?.name ?? slug
}

function getPlanCta(slug: string): string {
  const plan = PRICING_PLANS.find((p) => p.slug === slug)
  return plan?.translations['de']?.cta ?? 'Kaufen'
}

export default async function BillingPage() {
  await auth()

  const plans = [
    {
      slug: 'individual-single',
      icon: FileText,
      priceLabel: '5,99 €',
      periodLabel: 'pro Einspruch',
      highlight: false,
    },
    {
      slug: 'individual-pack',
      icon: Package,
      priceLabel: '19,99 €',
      periodLabel: 'einmalig · 5 Einsprüche',
      highlight: true,
    },
    {
      slug: 'individual-monthly',
      icon: Calendar,
      priceLabel: '9,99 €',
      periodLabel: 'pro Monat',
      highlight: false,
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Abrechnung & Guthaben</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Kaufen Sie Einsprüche einzeln, als Paket oder per Monats-Flat — kein Abo-Zwang.
        </p>
      </div>

      {/* Current status */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--background-subtle)] rounded-xl flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-[var(--muted)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">Aktueller Plan</p>
            <p className="text-xs text-[var(--muted)]">Kein aktiver Plan · 0 Einsprüche verfügbar</p>
          </div>
        </div>
        <span className="text-xs text-[var(--muted)] border border-[var(--border)] px-3 py-1 rounded-full">
          Zahlung folgt (Stripe)
        </span>
      </div>

      {/* Pricing plans */}
      <h2 className="text-base font-semibold text-[var(--foreground)] mb-4">Guthaben kaufen</h2>
      <div className="grid md:grid-cols-3 gap-5 mb-8">
        {plans.map(({ slug, icon: Icon, priceLabel, periodLabel, highlight }) => {
          const features = getPlanFeatures(slug)
          const name = getPlanName(slug)
          const cta = getPlanCta(slug)
          return (
            <div
              key={slug}
              className={`rounded-2xl border flex flex-col bg-[var(--surface)] ${
                highlight
                  ? 'border-brand-500 ring-2 ring-brand-100 dark:ring-brand-900'
                  : 'border-[var(--border)]'
              }`}
            >
              {highlight && (
                <div className="bg-brand-600 text-white text-xs font-semibold text-center py-1.5 rounded-t-[14px]">
                  Beliebteste Wahl
                </div>
              )}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${highlight ? 'bg-brand-50 dark:bg-brand-950 text-brand-600' : 'bg-[var(--background-subtle)] text-[var(--muted)]'}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--foreground)]">{name}</p>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-bold text-[var(--foreground)]">{priceLabel}</span>
                      <span className="text-xs text-[var(--muted)]">{periodLabel}</span>
                    </div>
                  </div>
                </div>

                <ul className="space-y-2 flex-1 mb-5">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500 shrink-0 mt-0.5 font-bold">✓</span>
                      <span className="text-[var(--foreground)]">{f}</span>
                    </li>
                  ))}
                </ul>

                <BillingActions planSlug={slug} cta={cta} highlight={highlight} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Professional review add-on */}
      <div className="rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 p-5 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-xl flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <p className="font-bold text-[var(--foreground)]">Profi-Prüfung</p>
              <span className="text-xs font-semibold bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                Optionales Add-on
              </span>
            </div>
            <p className="text-sm text-[var(--muted)] mb-3 leading-relaxed">
              Lassen Sie Ihren Einspruch von einem zugelassenen Steuerberater oder Rechtsanwalt prüfen,
              bevor Sie ihn einreichen. Der Experte kann freigeben, kommentieren oder Rückfragen stellen.
            </p>
            <div className="flex items-center gap-4 flex-wrap text-sm">
              <div>
                <span className="font-bold text-[var(--foreground)]">99 €</span>
                <span className="text-[var(--muted)] ml-1">/ Fall (Standard)</span>
              </div>
              <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 text-xs font-medium">
                <span className="font-bold text-base">69 €</span>
                <span>/ Fall für Monats-Flat-Abonnenten</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-start gap-2 text-xs text-[var(--muted)] border-t border-amber-200 dark:border-amber-800 pt-3">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
          <span>
            Nach der Generierung Ihres Einspruchs anklickbar. Die Prüfung erfolgt durch verifizierte Experten aus unserem Netzwerk.{' '}
            <a href="/advisor" className="text-amber-700 dark:text-amber-400 hover:underline font-medium">Mehr erfahren →</a>
          </span>
        </div>
      </div>

      {/* Invoices placeholder */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5">
        <h2 className="font-semibold text-sm text-[var(--foreground)] mb-4">Rechnungen</h2>
        <div className="text-center py-8 text-[var(--muted)]">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Noch keine Rechnungen vorhanden.</p>
          <p className="text-xs mt-1">Rechnungen erscheinen hier nach dem ersten Kauf.</p>
        </div>
      </div>
    </div>
  )
}
