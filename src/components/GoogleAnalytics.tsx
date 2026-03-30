'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

interface GoogleAnalyticsProps {
  measurementId?: string
}

export function GoogleAnalytics({ measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID }: GoogleAnalyticsProps) {
  const [hasConsent, setHasConsent] = useState(false)

  useEffect(() => {
    // Check if analytics consent was given
    function checkConsent() {
      try {
        const consent = JSON.parse(localStorage.getItem('cookie-consent') ?? '{}')
        setHasConsent(!!consent.analytics)
      } catch {
        setHasConsent(false)
      }
    }

    checkConsent()

    // Re-check if consent changes (e.g., user updates preferences)
    window.addEventListener('cookie-consent-update', checkConsent)
    return () => window.removeEventListener('cookie-consent-update', checkConsent)
  }, [])

  if (!measurementId || !hasConsent) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
            anonymize_ip: true
          });
        `}
      </Script>
    </>
  )
}
