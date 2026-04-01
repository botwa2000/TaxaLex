'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2, Loader2, ArrowRight, Package, Zap } from 'lucide-react'
import { Link } from '@/i18n/navigation'

type BillingStatus = {
  creditBalance: number
  subscription: { planSlug: string; status: string } | null
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const sessionId    = searchParams.get('session_id')

  const [status,   setStatus  ] = useState<'loading' | 'active' | 'timeout'>('loading')
  const [billing,  setBilling ] = useState<BillingStatus | null>(null)
  const [attempts, setAttempts] = useState(0)

  const poll = useCallback(async () => {
    const res  = await fetch('/api/stripe/status')
    const data = await res.json() as BillingStatus

    const provisioned =
      data.creditBalance > 0 ||
      (data.subscription?.status === 'ACTIVE' || data.subscription?.status === 'TRIALING')

    if (provisioned) {
      setBilling(data)
      setStatus('active')
    } else {
      setAttempts((n) => n + 1)
    }
  }, [])

  useEffect(() => {
    if (status !== 'loading') return
    if (attempts >= 15) {
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
          <h1 className="text-xl font-bold text-[var(--foreground)] mb-2">Zahlung wird verarbeitet…</h1>
          <p className="text-sm text-[var(--muted)]">Bitte einen Moment warten.</p>
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
          <h1 className="text-xl font-bold text-[var(--foreground)] mb-2">Zahlung erhalten</h1>
          <p className="text-sm text-[var(--muted)] mb-6">
            Ihre Zahlung wurde registriert. Es kann noch wenige Sekunden dauern, bis Ihr Guthaben erscheint.
          </p>
          <Link
            href="/billing"
            className="inline-flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            Zur Abrechnung
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

        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Vielen Dank!</h1>
        <p className="text-sm text-[var(--muted)] mb-6">
          Ihre Zahlung war erfolgreich. Sie können sofort loslegen.
        </p>

        {/* What they got */}
        <div className="bg-[var(--background-subtle)] rounded-xl p-4 mb-6 text-left">
          {isSubscription ? (
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-brand-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">Abo aktiv</p>
                <p className="text-xs text-[var(--muted)]">Unbegrenzte Einsprüche · jederzeit kündbar</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-brand-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {credits} {credits === 1 ? 'Einspruch' : 'Einsprüche'} freigeschaltet
                </p>
                <p className="text-xs text-[var(--muted)]">Kein Ablaufdatum · sofort nutzbar</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/einspruch"
            className="flex items-center justify-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            Einspruch erstellen
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/billing"
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:underline"
          >
            Zur Abrechnung & Rechnungen
          </Link>
        </div>
      </div>
    </div>
  )
}
