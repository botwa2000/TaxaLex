import { auth } from '@/auth'
import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import {
  CreditCard, FileText, Package, Calendar, UserCheck,
  Info, CheckCircle2, AlertTriangle, Download, ExternalLink,
  Zap, Shield, XCircle, Lock,
} from 'lucide-react'
import { CheckoutButton, PortalButton, CancelAddonButton, EarlyCancelButton } from './BillingActions'
import { notFound } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { ADDON } from '@/config/constants'

// ── helpers ───────────────────────────────────────────────────────────────────

function planIcon(slug: string) {
  if (slug.includes('pack'))    return Package
  if (slug.includes('monthly')) return Calendar
  return FileText
}

function formatEur(cents: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

function formatDate(iso: string | Date): string {
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    .format(new Date(iso))
}

type StatusInfo = {
  label:     string
  sublabel:  string
  color:     'green' | 'amber' | 'gray' | 'red'
  icon:      typeof CheckCircle2
}

function getStatusInfo(sub: { status: string; planSlug: string; currentPeriodEnd: Date; cancelAtPeriodEnd: boolean } | null, credits: number, planName?: string): StatusInfo {
  if (sub?.status === 'ACTIVE' || sub?.status === 'TRIALING') {
    const name = planName ?? sub.planSlug
    return {
      label:    `${name} — aktiv`,
      sublabel: sub.cancelAtPeriodEnd
        ? `Läuft ab am ${formatDate(sub.currentPeriodEnd)} (nicht verlängert)`
        : `Verlängert sich am ${formatDate(sub.currentPeriodEnd)}`,
      color: sub.cancelAtPeriodEnd ? 'amber' : 'green',
      icon: sub.cancelAtPeriodEnd ? AlertTriangle : CheckCircle2,
    }
  }
  if (sub?.status === 'PAST_DUE') {
    return {
      label:    'Zahlung ausstehend',
      sublabel: 'Bitte Zahlungsmethode im Abo-Portal aktualisieren.',
      color:    'amber',
      icon:     AlertTriangle,
    }
  }
  if (credits > 0) {
    return {
      label:    `${credits} Einspruch${credits === 1 ? '' : '·e'} verfügbar`,
      sublabel: 'Guthaben ohne Ablaufdatum',
      color:    'green',
      icon:     CheckCircle2,
    }
  }
  return {
    label:    'Kein aktiver Plan',
    sublabel: 'Wählen Sie ein Paket, um zu starten.',
    color:    'gray',
    icon:     CreditCard,
  }
}

// ── page ──────────────────────────────────────────────────────────────────────

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ caseId?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) notFound()

  const locale = await getLocale()
  const t      = await getTranslations('billing')
  const userId = session.user.id
  const { caseId: pendingCaseId } = await searchParams

  // Fetch billing state from DB
  const user = await db.user.findUnique({
    where:  { id: userId },
    select: { creditBalance: true, stripeCustomerId: true, subscription: true },
  }).catch(() => null)

  const creditBalance = user?.creditBalance  ?? 0
  const sub           = user?.subscription   ?? null

  // If ?caseId is present and points to a locked draft, show a contextual banner
  const pendingCase = pendingCaseId && !userId.startsWith('demo_')
    ? await db.case.findFirst({
        where: { id: pendingCaseId, userId, status: 'DRAFT_READY', draftLocked: true },
        select: { id: true, useCase: true },
      }).catch(() => null)
    : null

  // Fetch individual plans from DB — null means DB error, show error state
  const plans = await db.pricingPlan.findMany({
    where: { isActive: true, userGroup: { not: 'addon' } },
    include: {
      translations: { where: { locale } },
      features: { where: { locale }, orderBy: { sortOrder: 'asc' } },
    },
    orderBy: { sortOrder: 'asc' },
  }).catch(() => null)

  // Resolve active subscription plan name from DB for the status banner
  const subPlanName = sub?.planSlug
    ? await db.pricingPlan.findUnique({
        where: { slug: sub.planSlug },
        select: { translations: { where: { locale: 'de' } } },
      }).then((p) => p?.translations[0]?.name ?? sub.planSlug).catch(() => sub.planSlug)
    : undefined

  // Fetch addon purchases for this user (newest first)
  const addonPurchases = await db.addonPurchase.findMany({
    where: { userId },
    orderBy: { purchasedAt: 'desc' },
    select: {
      id: true, addonType: true, status: true, amountCents: true,
      planSlug: true, purchasedAt: true, usedAt: true, cancelledAt: true,
      case: { select: { id: true, useCase: true } },
    },
  }).catch(() => [])

  // Fetch addon plan prices from DB so they stay in sync with Stripe
  const [stdAddonPlan, subAddonPlan] = await Promise.all([
    db.pricingPlan.findUnique({
      where: { slug: 'expert-review' },
      select: { priceOnce: true, translations: { where: { locale } } },
    }).catch(() => null),
    db.pricingPlan.findUnique({
      where: { slug: 'expert-review-subscriber' },
      select: { priceOnce: true, translations: { where: { locale } } },
    }).catch(() => null),
  ])

  const stdAddonPriceCents = stdAddonPlan?.priceOnce ? Math.round(Number(stdAddonPlan.priceOnce) * 100) : 9900
  const subAddonPriceCents = subAddonPlan?.priceOnce ? Math.round(Number(subAddonPlan.priceOnce) * 100) : 6900
  const addonPlanName = stdAddonPlan?.translations[0]?.name ?? 'Profi-Prüfung'

  // Fetch paid invoices from Stripe (non-blocking — empty array on error)
  const invoices = user?.stripeCustomerId
    ? await stripe.invoices.list({
        customer: user.stripeCustomerId,
        limit: 12,
        status: 'paid',
      }).then((r: { data: unknown[] }) => r.data as import('stripe').Stripe.Invoice[]).catch(() => [])
    : []

  const status = getStatusInfo(sub, creditBalance, subPlanName)
  const StatusIcon = status.icon

  const colorMap = {
    green: { bg: 'bg-green-50 dark:bg-green-950/20', border: 'border-green-200 dark:border-green-800', icon: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400', text: 'text-green-700 dark:text-green-400' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-800', icon: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400', text: 'text-amber-700 dark:text-amber-400' },
    gray:  { bg: 'bg-[var(--surface)]',               border: 'border-[var(--border)]',                  icon: 'bg-[var(--background-subtle)] text-[var(--muted)]',                     text: 'text-[var(--muted)]' },
    red:   { bg: 'bg-red-50 dark:bg-red-950/20',      border: 'border-red-200 dark:border-red-800',      icon: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',          text: 'text-red-700 dark:text-red-400' },
  }
  const c = colorMap[status.color]

  const hasActiveSub   = sub?.status === 'ACTIVE' || sub?.status === 'TRIALING'
  const currentPlanSlug = sub?.planSlug ?? null
  // 14-day early cancel: only show if within window, not already cancelling
  const subWithinCancelWindow = hasActiveSub && sub?.createdAt
    ? (Date.now() - new Date(sub.createdAt).getTime()) / 86400000 <= ADDON.cancellationWindowDays
    : false
  const canEarlyCancel = subWithinCancelWindow && !sub?.cancelAtPeriodEnd

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Abrechnung & Plan</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Einsprüche einzeln, als Paket oder per Flat — alle Preise netto, keine versteckten Kosten.
        </p>
      </div>

      {/* Pending draft banner — shown when user arrived via /billing?caseId=X */}
      {pendingCase && (
        <div className="mb-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5 flex items-start gap-3">
          <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
              {t('pendingDraftTitle')}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              {t('pendingDraftHint', { useCase: pendingCase.useCase })}
            </p>
          </div>
        </div>
      )}

      {/* ── Current status ─────────────────────────────────────────── */}
      <div className={`rounded-2xl border p-5 mb-8 ${c.bg} ${c.border}`}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
              <StatusIcon className="w-5 h-5" />
            </div>
            <div>
              <p className={`font-semibold text-sm ${c.text}`}>{status.label}</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">{status.sublabel}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {hasActiveSub && <PortalButton locale={locale} />}
            {canEarlyCancel && sub && (
              <EarlyCancelButton periodEndDate={sub.currentPeriodEnd.toISOString()} />
            )}
          </div>
        </div>

        {/* Credit balance chips */}
        {(creditBalance > 0 || hasActiveSub) && (
          <div className="flex gap-3 mt-4 pt-4 border-t border-[var(--border)]/40 flex-wrap">
            {hasActiveSub && (
              <span className="flex items-center gap-1.5 text-xs font-medium bg-white/60 dark:bg-black/20 border border-[var(--border)] rounded-full px-3 py-1 text-[var(--foreground)]">
                <Zap className="w-3 h-3 text-brand-500" />
                Unbegrenzte Einsprüche
              </span>
            )}
            {!hasActiveSub && creditBalance > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-medium bg-white/60 dark:bg-black/20 border border-[var(--border)] rounded-full px-3 py-1 text-[var(--foreground)]">
                <Package className="w-3 h-3 text-brand-500" />
                {creditBalance} {creditBalance === 1 ? 'Einspruch' : 'Einsprüche'} im Guthaben
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs font-medium bg-white/60 dark:bg-black/20 border border-[var(--border)] rounded-full px-3 py-1 text-[var(--foreground)]">
              <Shield className="w-3 h-3 text-green-500" />
              Zahlung via Stripe · DSGVO-konform
            </span>
          </div>
        )}
      </div>

      {/* ── Plans ──────────────────────────────────────────────────── */}
      <h2 className="text-base font-semibold text-[var(--foreground)] mb-4">
        {hasActiveSub ? 'Plan wechseln' : 'Plan auswählen'}
      </h2>
      {plans === null ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center mb-8">
          <p className="text-sm text-[var(--muted)]">
            Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {plans.map((plan) => {
            const Icon        = planIcon(plan.slug)
            const name        = plan.translations[0]?.name ?? plan.slug
            const cta         = plan.translations[0]?.cta  ?? 'Kaufen'
            const isCurrent   = currentPlanSlug === plan.slug
            const features    = plan.features.filter((f) => f.included)
            const priceNum    = plan.priceOnce    != null ? Number(plan.priceOnce)    : Number(plan.priceMonthly)
            const priceLabel  = `${priceNum.toFixed(2).replace('.', ',')} €`
            const periodLabel = plan.priceOnce    != null ? (plan.slug.includes('pack') ? 'einmalig · 5 Einsprüche' : 'einmalig · 1 Einspruch') : 'pro Monat'

            return (
              <div
                key={plan.slug}
                className={`rounded-2xl border flex flex-col bg-[var(--surface)] relative ${
                  plan.isPopular && !isCurrent
                    ? 'border-brand-500 ring-2 ring-brand-100 dark:ring-brand-900'
                    : isCurrent
                      ? 'border-green-400 ring-2 ring-green-100 dark:ring-green-900'
                      : 'border-[var(--border)]'
                }`}
              >
                {isCurrent && (
                  <div className="bg-green-600 text-white text-xs font-semibold text-center py-1.5 rounded-t-[14px]">
                    Ihr aktueller Plan
                  </div>
                )}
                {!isCurrent && plan.isPopular && (
                  <div className="bg-brand-600 text-white text-xs font-semibold text-center py-1.5 rounded-t-[14px]">
                    Beliebteste Wahl
                  </div>
                )}

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      plan.isPopular ? 'bg-brand-50 dark:bg-brand-950 text-brand-600' : 'bg-[var(--background-subtle)] text-[var(--muted)]'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[var(--foreground)]">{name}</p>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-xl font-bold text-[var(--foreground)]">{priceLabel}</span>
                        <span className="text-xs text-[var(--muted)]">{periodLabel}</span>
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-1.5 flex-1 mb-5">
                    {features.map((f) => (
                      <li key={f.text} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-[var(--foreground)]">{f.text}</span>
                      </li>
                    ))}
                  </ul>

                  <CheckoutButton
                    planSlug={plan.slug}
                    cta={isCurrent ? '✓ Aktiver Plan' : cta}
                    highlight={plan.isPopular && !isCurrent}
                    locale={locale}
                    disabled={isCurrent}
                    disabledReason="Dies ist Ihr aktueller Plan"
                    caseId={pendingCase?.id}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Professional review add-on — info card ────────────────── */}
      <div className="rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 p-5 mb-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-xl flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <p className="font-bold text-[var(--foreground)]">{addonPlanName}</p>
              <span className="text-xs font-semibold bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                Optionales Add-on
              </span>
            </div>
            <p className="text-sm text-[var(--muted)] mb-3 leading-relaxed">
              Lassen Sie Ihren Einspruch von einem verifizierten Steuerberater oder Rechtsanwalt prüfen, bevor Sie ihn einreichen.
            </p>
            <div className="flex items-center gap-4 flex-wrap text-sm">
              <div>
                <span className="font-bold text-[var(--foreground)]">{formatEur(stdAddonPriceCents)}</span>
                <span className="text-[var(--muted)] ml-1">/ Fall</span>
              </div>
              {hasActiveSub && (
                <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 text-xs font-medium">
                  <span className="font-bold text-base">{formatEur(subAddonPriceCents)}</span>
                  <span>/ Fall für Abonnenten</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-start gap-2 text-xs text-[var(--muted)] border-t border-amber-200 dark:border-amber-800 pt-3">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
          <span>Nach der Generierung Ihres Einspruchs buchbar. Stornierbar innerhalb von {ADDON.cancellationWindowDays} Tagen, sofern nicht bereits genutzt.</span>
        </div>
      </div>

      {/* ── Purchased add-ons ─────────────────────────────────────── */}
      {addonPurchases.length > 0 && (
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 mb-8">
          <h2 className="font-semibold text-sm text-[var(--foreground)] mb-4 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[var(--muted)]" />
            Gebuchte Add-ons
          </h2>
          <div className="divide-y divide-[var(--border)]">
            {addonPurchases.map((ap) => {
              const withinWindow = (Date.now() - new Date(ap.purchasedAt).getTime()) / 86400000 <= ADDON.cancellationWindowDays
              const canCancel = ap.status === 'ACTIVE' && !ap.usedAt && withinWindow
              const statusBadge =
                ap.status === 'ACTIVE' && !ap.usedAt ? { label: 'Aktiv', cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' } :
                ap.status === 'USED'   ? { label: 'Genutzt', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' } :
                ap.status === 'CANCELLED' ? { label: 'Storniert', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' } :
                { label: 'Erstattet', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' }

              return (
                <div key={ap.id} className="py-3.5 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-[var(--foreground)]">{addonPlanName}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge.cls}`}>{statusBadge.label}</span>
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      {formatDate(ap.purchasedAt)} · {formatEur(ap.amountCents)}
                      {ap.case && ` · Fall: ${ap.case.useCase}`}
                    </p>
                    {canCancel && (
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Stornierbar bis {formatDate(new Date(new Date(ap.purchasedAt).getTime() + ADDON.cancellationWindowDays * 86400000))}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 pt-0.5">
                    {canCancel && <CancelAddonButton addonId={ap.id} />}
                    {ap.status === 'CANCELLED' && (
                      <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
                        <XCircle className="w-3.5 h-3.5" /> {ap.cancelledAt ? formatDate(ap.cancelledAt) : ''}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Invoices ────────────────────────────────────────────────── */}
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5">
        <h2 className="font-semibold text-sm text-[var(--foreground)] mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[var(--muted)]" />
          Rechnungen
        </h2>

        {invoices.length === 0 ? (
          <div className="text-center py-8 text-[var(--muted)]">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Noch keine Rechnungen vorhanden.</p>
            <p className="text-xs mt-1">Rechnungen erscheinen hier nach dem ersten Kauf.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {(invoices as import('stripe').Stripe.Invoice[]).map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-3 gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">
                    {inv.lines.data[0]?.description ?? 'TaxaLex'}
                  </p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    {inv.number ?? inv.id} · {new Intl.DateTimeFormat('de-DE').format(new Date(inv.created * 1000))}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-semibold text-[var(--foreground)]">
                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: inv.currency.toUpperCase() }).format(inv.amount_paid / 100)}
                  </span>
                  <div className="flex gap-1.5">
                    {inv.invoice_pdf && (
                      <a
                        href={inv.invoice_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)] transition-colors"
                        title="Rechnung als PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {inv.hosted_invoice_url && (
                      <a
                        href={inv.hosted_invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)] transition-colors"
                        title="Online anzeigen"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {invoices.length > 0 && (
          <p className="text-xs text-[var(--muted)] mt-4 pt-3 border-t border-[var(--border)]">
            Alle Rechnungen tragen den Hinweis: „Gemäß §19 UStG wird keine Umsatzsteuer berechnet."
          </p>
        )}
      </div>
    </div>
  )
}
