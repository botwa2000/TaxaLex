'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Loader2, ArrowRight, Package, Zap } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'

type BillingStatus = {
  creditBalance: number
  subscription: { planSlug: string; status: string } | null
  recentlyUnlocked: { id: string; useCase: string } | null
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const locale       = useLocale()
  const t            = useTranslations('checkout.success')
  const sessionId    = searchParams.get('session_id')

  const [status,           setStatus          ] = useState<'loading' | 'active' | 'timeout'>('loading')
  const [billing,          setBilling         ] = useState<BillingStatus | null>(null)
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<{ id: string; useCase: string } | null>(null)
  const [attempts,         setAttempts        ] = useState(0)

  const poll = useCallback(async () => {
    const res  = await fetch('/api/stripe/status')
    const data = await res.json() as BillingStatus

    const provisioned =
      data.creditBalance > 0 ||
      (data.subscription?.status === 'ACTIVE' || data.subscription?.status === 'TRIALING')

    if (provisioned) {
      setBilling(data)
      if (data.recentlyUnlocked) setRecentlyUnlocked(data.recentlyUnlocked)
      setStatus('active')
    } else {
      setAttempts((n) => n + 1)
    }
  }, [])

  useEffect(() => {
    if (status !== 'loading') return
    if (attempts >= 25) {
      setStatus('timeout')
      return
    }
    const timer = setTimeout(poll, attempts === 0 ? 1000 : 2000)
    return () => clearTimeout(timer)
  }, [attempts, status, poll])

  const isSubscription = billing?.subscription != null
  const credits        = billing?.creditBalance ?? 0

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-10 shadow-sm text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-brand-50 dark:bg-brand-950 rounded-full flex items-center justify-center mx-auto mb-5">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          </div>
          <h1 className="text-xl font-bold text-[var(--foreground)] mb-2">{t('loading')}</h1>
          <p className="text-sm text-[var(--muted)]">{t('loadingHint')}</p>
        </div>
      </div>
    )
  }

  if (status === 'timeout') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-10 shadow-sm text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-xl font-bold text-[var(--foreground)] mb-2">{t('timeoutTitle')}</h1>
          <p className="text-sm text-[var(--muted)] mb-6">{t('timeoutHint')}</p>
          <Link
            href="/cases"
            className="inline-flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            {t('timeoutCta')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-10 shadow-sm text-center max-w-sm w-full">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">{t('thankYou')}</h1>
        <p className="text-sm text-[var(--muted)] mb-6">{t('successHint')}</p>

        {/* What they got */}
        <div className="bg-[var(--background-subtle)] rounded-xl p-4 mb-6 text-left">
          {isSubscription ? (
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-brand-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">{t('subscriptionActive')}</p>
                <p className="text-xs text-[var(--muted)]">{t('subscriptionDesc')}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-brand-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {t('creditsUnlocked', { count: credits })}
                </p>
                <p className="text-xs text-[var(--muted)]">{t('creditsDesc')}</p>
              </div>
            </div>
          )}
        </div>

        {recentlyUnlocked ? (
          <div className="bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 rounded-xl p-5 text-center">
            <CheckCircle2 className="w-7 h-7 text-brand-600 mx-auto mb-2" />
            <p className="font-semibold text-[var(--foreground)] mb-1">{t('draftReady')}</p>
            <p className="text-xs text-[var(--muted)] mb-4">{t('draftReadyHint')}</p>
            <Link
              href={`/cases/${recentlyUnlocked.id}?tab=letter`}
              className="inline-flex items-center gap-1.5 bg-brand-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-brand-700 transition-colors"
            >
              {t('viewDraft')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Link
              href="/einspruch"
              className="flex items-center justify-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
            >
              {t('newCase')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/cases"
              className="flex items-center justify-center gap-2 border border-[var(--border)] text-[var(--foreground)] px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[var(--background-subtle)] transition-colors"
            >
              {t('myCases')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/billing"
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:underline"
            >
              {t('toBilling')}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
