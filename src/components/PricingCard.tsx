import { Check, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Link } from '@/i18n/navigation'

// Accepts either the DB shape (translations as array, features as array already filtered by locale)
// or the legacy seed shape (translations as Record). The locale prop drives which translation to use.
interface PlanTranslation {
  locale: string
  name: string
  description?: string | null
  cta?: string | null
}

interface PlanFeature {
  locale?: string
  text: string
  included: boolean
  sortOrder: number
}

interface PricingCardPlan {
  slug: string
  priceOnce?: number | null
  priceMonthly?: number | null
  priceAnnual?: number | null | { toNumber(): number }
  currency: string
  isPopular: boolean
  // DB shape: array already filtered by locale; seed shape: Record keyed by locale
  translations: PlanTranslation[] | Record<string, PlanTranslation>
  // DB shape: array already filtered by locale; seed shape: array with locale field
  features: PlanFeature[]
}

interface PricingCardProps {
  plan: PricingCardPlan
  locale: string
  currentPlanSlug?: string
  className?: string
}

export function PricingCard({ plan, locale, currentPlanSlug, className }: PricingCardProps) {
  // Normalise translations: handle both array (DB) and Record (seed/legacy) shapes
  const t = Array.isArray(plan.translations)
    ? (plan.translations[0] as PlanTranslation | undefined)
    : ((plan.translations as Record<string, PlanTranslation>)[locale] ?? (plan.translations as Record<string, PlanTranslation>)['de'])

  // Normalise features: DB returns pre-filtered array; seed shape has locale field
  const featuresForLocale = plan.features.filter((f) => !f.locale || f.locale === locale)
  const features = featuresForLocale.length > 0 ? featuresForLocale : plan.features.filter((f) => !f.locale || f.locale === 'de')
  const isCurrent = currentPlanSlug === plan.slug
  const isPopular = plan.isPopular

  const priceLabel = getPriceLabel(plan, locale)

  return (
    <div
      className={cn(
        'relative flex flex-col bg-[var(--surface)] border rounded-2xl p-6 transition-shadow hover:shadow-md',
        isPopular
          ? 'border-brand-400 ring-2 ring-brand-100 dark:ring-brand-900 shadow-brand'
          : 'border-[var(--border)]',
        className
      )}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="brand" className="shadow-sm px-3 py-1 text-xs font-semibold">
            {locale === 'en' ? 'Most popular' : 'Beliebtester Plan'}
          </Badge>
        </div>
      )}

      {/* Current plan badge */}
      {isCurrent && !isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="success" className="shadow-sm px-3 py-1 text-xs">
            {locale === 'en' ? 'Your current plan' : 'Ihr aktueller Plan'}
          </Badge>
        </div>
      )}

      {/* Plan name & description */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-[var(--foreground)]">{t?.name}</h3>
        {t?.description && (
          <p className="text-sm text-[var(--muted)] mt-1 leading-relaxed">{t.description}</p>
        )}
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-[var(--foreground)]">{priceLabel.amount}</span>
          {priceLabel.period && (
            <span className="text-sm text-[var(--muted)]">/ {priceLabel.period}</span>
          )}
        </div>
        {priceLabel.note && (
          <p className="text-xs text-[var(--muted)] mt-0.5">{priceLabel.note}</p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-2.5 mb-6 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm">
            {f.included ? (
              <Check className="w-4 h-4 text-[var(--success)] shrink-0 mt-0.5" />
            ) : (
              <Minus className="w-4 h-4 text-[var(--muted-foreground)] shrink-0 mt-0.5" />
            )}
            <span className={f.included ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}>
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link href="/register">
        <Button
          variant={isPopular ? 'primary' : 'secondary'}
          size="md"
          className="w-full justify-center"
        >
          {isCurrent
            ? locale === 'en' ? 'Manage plan' : 'Plan verwalten'
            : t?.cta ?? (locale === 'en' ? 'Get started' : 'Jetzt starten')}
        </Button>
      </Link>
    </div>
  )
}

function getPriceLabel(plan: PricingCardPlan, locale: string) {
  const currency = plan.currency === 'EUR' ? '€' : plan.currency
  const isEN = locale === 'en'

  if (plan.priceOnce !== null && plan.priceOnce !== undefined) {
    const once = Number(plan.priceOnce)
    const isPack = plan.slug.includes('pack')
    return {
      amount: once === 0 ? (isEN ? 'Free' : 'Kostenlos') : `${currency}${once.toFixed(2).replace('.', ',')}`,
      period: isPack ? null : (once === 0 ? null : isEN ? 'per objection' : 'pro Einspruch'),
      note: isPack ? (isEN ? 'one-time · 5 objections · no expiry' : 'einmalig · 5 Einsprüche · kein Ablaufdatum') : null,
    }
  }
  if (plan.priceMonthly !== null && plan.priceMonthly !== undefined) {
    return {
      amount: `${currency}${Number(plan.priceMonthly).toFixed(0)}`,
      period: isEN ? 'month' : 'Monat',
      note: plan.priceAnnual
        ? `${isEN ? 'or' : 'oder'} ${currency}${Number(plan.priceAnnual).toFixed(0)}/${isEN ? 'yr' : 'Jahr'} (${isEN ? 'save' : 'spare'} ${Math.round((1 - (Number(plan.priceAnnual) / 12) / Number(plan.priceMonthly)) * 100)} %)`
        : null,
    }
  }
  return { amount: isEN ? 'Free' : 'Kostenlos', period: null, note: null }
}
