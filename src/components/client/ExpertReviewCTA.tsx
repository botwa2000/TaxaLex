'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { UserCheck, ShieldCheck, Clock, Loader2, CheckCircle2, ChevronRight } from 'lucide-react'

interface Props {
  caseId: string
  locale: string
  /** Pre-resolved from server: price in cents for this user (subscriber vs standard) */
  priceCents: number
  planSlug: 'expert-review' | 'expert-review-subscriber'
  isSubscriber: boolean
  standardPriceCents: number
}

export function ExpertReviewCTA({
  caseId,
  locale,
  priceCents,
  planSlug,
  isSubscriber,
  standardPriceCents,
}: Props) {
  const t = useTranslations('advisor.expertCta')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const price = (priceCents / 100).toLocaleString(locale === 'de' ? 'de-DE' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  })
  const standardPrice = (standardPriceCents / 100).toLocaleString(
    locale === 'de' ? 'de-DE' : 'en-GB',
    { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }
  )

  async function handlePurchase() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planSlug, locale, caseId }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      setError(data.error ?? t('checkoutError'))
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50/60 dark:bg-amber-950/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-amber-200 dark:border-amber-800">
        <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
          <UserCheck className="w-5 h-5 text-amber-700 dark:text-amber-400" />
        </div>
        <div>
          <p className="font-bold text-sm text-[var(--foreground)]">{t('title')}</p>
          <p className="text-xs text-[var(--muted)]">{t('subtitle')}</p>
        </div>
      </div>

      {/* Features */}
      <div className="px-5 py-4 space-y-2">
        {(['feature1', 'feature2', 'feature3', 'feature4'] as const).map((key) => (
          <div key={key} className="flex items-start gap-2 text-sm text-[var(--foreground)]">
            <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>{t(key)}</span>
          </div>
        ))}
      </div>

      {/* Pricing & CTA */}
      <div className="px-5 pb-5 space-y-3">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl font-bold text-[var(--foreground)]">{price}</span>
          <span className="text-sm text-[var(--muted)]">{t('perCase')}</span>
          {isSubscriber && (
            <span className="text-xs font-medium bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
              {t('subscriberDiscount', { standard: standardPrice })}
            </span>
          )}
        </div>

        <button
          onClick={handlePurchase}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-60 text-sm"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          {loading ? t('redirecting') : t('cta', { price })}
        </button>

        {error && <p className="text-xs text-red-600 text-center">{error}</p>}

        <div className="flex items-start gap-2 text-xs text-[var(--muted)]">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5 text-green-600" />
          <span>{t('securityNote')}</span>
        </div>

        <div className="flex items-start gap-2 text-xs text-[var(--muted)]">
          <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{t('cancellationNote')}</span>
        </div>
      </div>
    </div>
  )
}
