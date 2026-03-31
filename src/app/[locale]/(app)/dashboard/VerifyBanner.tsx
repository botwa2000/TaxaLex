'use client'

import { useState } from 'react'
import { Mail, X, CheckCircle2, Loader2 } from 'lucide-react'

export function VerifyBanner() {
  const [state, setState] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  async function resend() {
    setState('loading')
    setError('')
    const res = await fetch('/api/auth/resend-verification', { method: 'POST' })
    if (res.ok) {
      setState('sent')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Fehler beim Senden.')
      setState('error')
    }
  }

  return (
    <div className="mb-6 flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3.5">
      <Mail className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {state === 'sent' ? (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <p className="text-sm text-green-700 dark:text-green-400 font-medium">
              Bestätigungs-E-Mail gesendet — bitte prüfe deinen Posteingang.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
              Bitte bestätige deine E-Mail-Adresse.
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              Wir haben dir eine Bestätigungs-E-Mail geschickt. Nicht angekommen?{' '}
              <button
                onClick={resend}
                disabled={state === 'loading'}
                className="underline font-medium hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
              >
                {state === 'loading' && <Loader2 className="w-3 h-3 animate-spin" />}
                Erneut senden
              </button>
            </p>
            {state === 'error' && (
              <p className="text-xs text-red-600 mt-1">{error}</p>
            )}
          </>
        )}
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-500 hover:text-amber-700 transition-colors shrink-0"
        aria-label="Schließen"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
