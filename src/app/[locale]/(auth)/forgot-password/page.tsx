'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    // Always shows success — no email enumeration on client side
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-8 shadow-sm text-center">
        <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-[var(--foreground)] mb-2">E-Mail gesendet</h1>
        <p className="text-sm text-[var(--muted)] mb-6 leading-relaxed">
          Wenn ein Konto mit <strong className="text-[var(--foreground)]">{email}</strong> existiert,
          haben wir einen Passwort-Reset-Link gesendet. Bitte prüfen Sie auch Ihren Spam-Ordner.
        </p>
        <p className="text-xs text-[var(--muted)] mb-6">
          Der Link ist 1 Stunde gültig.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Zurück zur Anmeldung
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-8 shadow-sm">
      <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mb-5">
        <Mail className="w-6 h-6" />
      </div>
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Passwort zurücksetzen</h1>
      <p className="text-sm text-[var(--muted)] mb-7 leading-relaxed">
        Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
            E-Mail-Adresse
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nutzer@beispiel.de"
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-brand-700 active:bg-brand-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Reset-Link senden
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Zurück zur Anmeldung
        </Link>
      </div>
    </div>
  )
}
