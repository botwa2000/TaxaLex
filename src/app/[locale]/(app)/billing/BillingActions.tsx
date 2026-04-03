'use client'

import { useState } from 'react'
import { Loader2, ExternalLink, X, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

// ── Checkout button ────────────────────────────────────────────────────────────

interface CheckoutButtonProps {
  planSlug:  string
  cta:       string
  highlight: boolean
  locale:    string
  disabled?: boolean
  disabledReason?: string
}

export function CheckoutButton({
  planSlug, cta, highlight, locale, disabled, disabledReason,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error,   setError  ] = useState('')

  async function handleCheckout() {
    setLoading(true)
    setError('')

    const res  = await fetch('/api/stripe/checkout', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ planSlug, locale }),
    })
    const data = await res.json()

    if (data.url) {
      window.location.href = data.url
    } else {
      setError(data.error ?? 'Fehler beim Checkout.')
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={loading || disabled}
        title={disabled ? disabledReason : undefined}
        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          highlight
            ? 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800'
            : 'border border-brand-500 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950 active:bg-brand-100'
        }`}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? 'Weiterleitung zu Stripe…' : cta}
      </button>
      {error && <p className="text-xs text-red-600 mt-2 text-center">{error}</p>}
    </div>
  )
}

// ── Customer portal button (manage / cancel subscription) ──────────────────────

interface PortalButtonProps {
  locale: string
}

export function PortalButton({ locale }: PortalButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error,   setError  ] = useState('')

  async function handlePortal() {
    setLoading(true)
    setError('')

    const res  = await fetch('/api/stripe/portal', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ locale }),
    })
    const data = await res.json()

    if (data.url) {
      window.location.href = data.url
    } else {
      setError(data.error ?? 'Fehler beim Öffnen des Portals.')
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handlePortal}
        disabled={loading}
        className="flex items-center gap-1.5 text-sm text-brand-600 hover:underline disabled:opacity-50 font-medium"
      >
        {loading
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <ExternalLink className="w-3.5 h-3.5" />
        }
        {loading ? 'Öffne Portal…' : 'Abo verwalten / kündigen'}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}

// ── Cancel addon button ────────────────────────────────────────────────────────

interface CancelAddonButtonProps {
  addonId: string
}

export function CancelAddonButton({ addonId }: CancelAddonButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const router = useRouter()

  async function handleCancel() {
    setLoading(true)
    setError('')
    const res = await fetch(`/api/addon/${addonId}/cancel`, { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      router.refresh()
    } else {
      setError(data.error ?? 'Stornierung fehlgeschlagen.')
      setLoading(false)
      setConfirmed(false)
    }
  }

  if (!confirmed) {
    return (
      <button
        onClick={() => setConfirmed(true)}
        className="flex items-center gap-1 text-xs text-red-600 hover:underline"
      >
        <X className="w-3 h-3" /> Stornieren & erstatten
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium text-red-700">Sicher stornieren? Der Betrag wird erstattet.</p>
      <div className="flex gap-2">
        <button
          onClick={handleCancel}
          disabled={loading}
          className="flex items-center gap-1 text-xs bg-red-600 text-white px-2.5 py-1 rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {loading && <Loader2 className="w-3 h-3 animate-spin" />}
          Ja, stornieren
        </button>
        <button onClick={() => setConfirmed(false)} className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]">
          Abbrechen
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

// ── Cancel subscription (14-day early refund) ─────────────────────────────────

interface EarlyCancelButtonProps {
  periodEndDate: string // ISO
}

export function EarlyCancelButton({ periodEndDate }: EarlyCancelButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const router = useRouter()

  async function handleCancel() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/subscription/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'immediate' }),
    })
    const data = await res.json()
    if (res.ok) {
      router.refresh()
    } else {
      setError(data.error ?? 'Stornierung fehlgeschlagen.')
      setLoading(false)
      setConfirmed(false)
    }
  }

  if (!confirmed) {
    return (
      <button
        onClick={() => setConfirmed(true)}
        className="flex items-center gap-1.5 text-xs text-red-600 hover:underline font-medium"
      >
        <AlertTriangle className="w-3.5 h-3.5" /> Abo sofort kündigen & erstatten
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-1.5 mt-1">
      <p className="text-xs font-medium text-red-700">
        Abo wird sofort beendet und der Betrag vollständig erstattet. Noch nicht genutzte Laufzeit bis{' '}
        {new Intl.DateTimeFormat('de-DE').format(new Date(periodEndDate))} verfällt.
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleCancel}
          disabled={loading}
          className="flex items-center gap-1 text-xs bg-red-600 text-white px-2.5 py-1 rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {loading && <Loader2 className="w-3 h-3 animate-spin" />}
          Ja, sofort kündigen
        </button>
        <button onClick={() => setConfirmed(false)} className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]">
          Abbrechen
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
