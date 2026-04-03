'use client'

import { Turnstile as TurnstileWidget } from '@marsidev/react-turnstile'

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

interface TurnstileProps {
  onSuccess: (token: string) => void
  onError?: () => void
  onExpire?: () => void
  className?: string
}

/**
 * Cloudflare Turnstile widget — invisible/managed bot detection.
 * Only renders when NEXT_PUBLIC_TURNSTILE_SITE_KEY is configured.
 */
export function TurnstileBox({ onSuccess, onError, onExpire, className }: TurnstileProps) {
  if (!SITE_KEY) return null

  return (
    <div className={className}>
      <TurnstileWidget
        siteKey={SITE_KEY}
        onSuccess={onSuccess}
        onError={onError}
        onExpire={onExpire}
        options={{ theme: 'auto', size: 'flexible' }}
      />
    </div>
  )
}
