/**
 * Utility: merge class names conditionally.
 * Lightweight alternative to clsx — no external dependency needed.
 */
export function cn(...classes: (string | undefined | null | false | 0)[]) {
  return classes.filter(Boolean).join(' ')
}

/**
 * Format a price value for display.
 * Uses Intl.NumberFormat for proper locale-aware formatting.
 */
export function formatPrice(amount: number, currency = 'EUR', locale = 'de-DE'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount)
}

/**
 * Truncate a string to maxLength with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 1) + '…'
}
