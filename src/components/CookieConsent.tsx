'use client'

import { useState, useEffect } from 'react'
import { Cookie, Settings, X, Check } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Button } from './ui/Button'

interface ConsentPreferences {
  essential: true   // always true — cannot be disabled
  analytics: boolean
  marketing: boolean
}

const CONSENT_KEY = 'cookie-consent'

function getStoredConsent(): ConsentPreferences | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveConsent(prefs: ConsentPreferences) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs))
  // Dispatch custom event so analytics components can react
  window.dispatchEvent(new Event('cookie-consent-update'))
}

export function CookieConsent({ locale = 'de' }: { locale?: string }) {
  const [visible, setVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const t = useTranslations('cookieConsent')

  useEffect(() => {
    setMounted(true)
    const stored = getStoredConsent()
    if (!stored) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setVisible(true), 1200)
      return () => clearTimeout(timer)
    }
  }, [])

  function acceptAll() {
    saveConsent({ essential: true, analytics: true, marketing: true })
    setVisible(false)
  }

  function acceptEssential() {
    saveConsent({ essential: true, analytics: false, marketing: false })
    setVisible(false)
  }

  function saveCustom() {
    saveConsent({ essential: true, analytics, marketing })
    setVisible(false)
  }

  const cookiePath = `/${locale}/cookies`

  if (!mounted || !visible) return null

  return (
    <div
      role="dialog"
      aria-label={t('title')}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6',
        'md:bottom-4 md:left-4 md:right-auto md:max-w-sm'
      )}
    >
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl animate-slide-up p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Cookie className="w-4 h-4 text-brand-600 shrink-0" />
            <p className="text-sm font-semibold text-[var(--foreground)]">{t('title')}</p>
          </div>
          <button
            onClick={acceptEssential}
            className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-[var(--muted)] leading-relaxed mb-3">
          {t('description')}{' '}
          <Link href={cookiePath} className="text-brand-600 hover:underline dark:text-brand-400">
            {t('learnMore')}
          </Link>
        </p>

        {/* Detailed options */}
        {showDetails && (
          <div className="space-y-3 mb-4 pt-3 border-t border-[var(--border)]">
            {/* Essential */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-[var(--foreground)]">{t('essential')}</p>
                <p className="text-[11px] text-[var(--muted)]">{t('essentialDesc')}</p>
              </div>
              <div className="w-8 h-5 rounded-full bg-brand-600 flex items-center justify-end px-0.5 shrink-0">
                <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </div>
            {/* Analytics */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-[var(--foreground)]">{t('analyticsLabel')}</p>
                <p className="text-[11px] text-[var(--muted)]">{t('analyticsDesc')}</p>
              </div>
              <button
                onClick={() => setAnalytics(!analytics)}
                role="switch"
                aria-checked={analytics}
                className={cn(
                  'w-8 h-5 rounded-full transition-colors flex items-center px-0.5 shrink-0',
                  analytics ? 'bg-brand-600 justify-end' : 'bg-[var(--border)] justify-start'
                )}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
              </button>
            </div>
            {/* Marketing */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-[var(--foreground)]">{t('marketingLabel')}</p>
                <p className="text-[11px] text-[var(--muted)]">{t('marketingDesc')}</p>
              </div>
              <button
                onClick={() => setMarketing(!marketing)}
                role="switch"
                aria-checked={marketing}
                className={cn(
                  'w-8 h-5 rounded-full transition-colors flex items-center px-0.5 shrink-0',
                  marketing ? 'bg-brand-600 justify-end' : 'bg-[var(--border)] justify-start'
                )}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button onClick={acceptAll} size="sm" className="w-full justify-center">
            <Check className="w-3.5 h-3.5" />
            {t('acceptAll')}
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={acceptEssential}
              variant="secondary"
              size="sm"
              className="flex-1 justify-center text-xs"
            >
              {t('essentialOnly')}
            </Button>
            <Button
              onClick={showDetails ? saveCustom : () => setShowDetails(true)}
              variant="ghost"
              size="sm"
              className="flex-1 justify-center text-xs"
            >
              <Settings className="w-3.5 h-3.5" />
              {showDetails ? t('save') : t('customize')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
