'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

interface PostHogProviderProps {
  apiKey?: string
  apiHost?: string
  children?: React.ReactNode
}

// Lazy-loaded PostHog instance
let posthogInstance: {
  capture: (event: string, props?: Record<string, unknown>) => void
  identify: (id: string, props?: Record<string, unknown>) => void
  reset: () => void
} | null = null

export async function initPostHog(apiKey: string, apiHost: string) {
  if (typeof window === 'undefined' || posthogInstance || !apiKey) return
  try {
    const { default: posthog } = await import('posthog-js')
    posthog.init(apiKey, {
      api_host: apiHost,
      capture_pageview: false, // manual page view tracking
      respect_dnt: true,
      autocapture: false, // respect privacy — only explicit events
    })
    posthogInstance = posthog
  } catch {
    // PostHog not available — graceful degradation
  }
}

export function PostHogProvider({ apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '', apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.posthog.com', children }: PostHogProviderProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Only initialize if analytics consent was given
    function checkAndInit() {
      try {
        const consent = JSON.parse(localStorage.getItem('cookie-consent') ?? '{}')
        if (consent.analytics) {
          initPostHog(apiKey, apiHost)
        }
      } catch {
        // ignore
      }
    }

    checkAndInit()
    window.addEventListener('cookie-consent-update', checkAndInit)
    return () => window.removeEventListener('cookie-consent-update', checkAndInit)
  }, [apiKey, apiHost])

  // Track page views on route change
  useEffect(() => {
    if (posthogInstance) {
      posthogInstance.capture('$pageview', {
        $current_url: window.location.href,
      })
    }
  }, [pathname, searchParams])

  return children ? <>{children}</> : null
}

/** Utility to track custom events — import and call anywhere client-side */
export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (posthogInstance) {
    posthogInstance.capture(event, properties)
  }
}
