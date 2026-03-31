'use client'

interface Props {
  planSlug: string
  cta: string
  highlight: boolean
}

export function BillingActions({ cta, highlight }: Props) {
  return (
    <button
      type="button"
      disabled
      title="Zahlung wird in Kürze verfügbar (Stripe)"
      className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        highlight
          ? 'bg-brand-600 text-white'
          : 'border border-brand-500 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950'
      }`}
    >
      {cta}
    </button>
  )
}
