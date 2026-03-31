'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { Loader2, KeyRound, Eye, EyeOff, CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react'
import { AUTH } from '@/config/constants'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const passwordScore =
    password.length === 0
      ? 0
      : password.length < 8
        ? 1
        : password.length < 12
          ? 2
          : /[A-Z]/.test(password) && /[0-9]/.test(password)
            ? 4
            : 3

  const strengthMap = [
    null,
    { label: 'Schwach', color: 'bg-red-400', width: 'w-1/4', text: 'text-red-600' },
    { label: 'Ausreichend', color: 'bg-amber-400', width: 'w-2/4', text: 'text-amber-600' },
    { label: 'Gut', color: 'bg-brand-500', width: 'w-3/4', text: 'text-brand-600' },
    { label: 'Stark', color: 'bg-green-500', width: 'w-full', text: 'text-green-600' },
  ] as const
  const strength = strengthMap[passwordScore]

  if (!token) {
    return (
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-8 shadow-sm text-center">
        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-[var(--foreground)] mb-2">Ungültiger Link</h1>
        <p className="text-sm text-[var(--muted)] mb-6">
          Dieser Passwort-Reset-Link ist ungültig oder fehlt. Bitte fordern Sie einen neuen an.
        </p>
        <Link href="/forgot-password" className="text-sm text-brand-600 hover:underline font-medium">
          Neuen Link anfordern
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-8 shadow-sm text-center">
        <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-[var(--foreground)] mb-2">Passwort geändert</h1>
        <p className="text-sm text-[var(--muted)] mb-6">
          Ihr Passwort wurde erfolgreich geändert. Sie können sich jetzt anmelden.
        </p>
        <Link
          href="/login"
          className="inline-block bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
        >
          Zur Anmeldung
        </Link>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwörter stimmen nicht überein.')
      return
    }
    if (password.length < AUTH.minPasswordLength) {
      setError(`Passwort muss mindestens ${AUTH.minPasswordLength} Zeichen haben.`)
      return
    }
    setLoading(true)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Fehler beim Zurücksetzen.')
      return
    }
    setDone(true)
  }

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-8 shadow-sm">
      <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mb-5">
        <KeyRound className="w-6 h-6" />
      </div>
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Neues Passwort setzen</h1>
      <p className="text-sm text-[var(--muted)] mb-7">
        Wählen Sie ein sicheres Passwort für Ihr Konto.
      </p>

      {error && (
        <div className="bg-[#fef2f2] border border-red-200 text-red-700 text-sm px-3 py-2.5 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
            Neues Passwort <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={AUTH.minPasswordLength}
              autoComplete="new-password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-[var(--border)] rounded-lg px-3 py-2.5 pr-10 text-sm bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-colors"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {strength && (
            <div className="mt-2">
              <div className="h-1 bg-[var(--border)] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
              </div>
              <p className="text-xs text-[var(--muted)] mt-1">
                Passwortstärke: <span className={strength.text}>{strength.label}</span>
              </p>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
            Passwort bestätigen <span className="text-red-500">*</span>
          </label>
          <input
            id="confirm"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-brand-200 transition-colors ${
              confirm && confirm !== password
                ? 'border-red-400 focus:border-red-400'
                : 'border-[var(--border)] focus:border-brand-400'
            }`}
          />
          {confirm && confirm !== password && (
            <p className="text-xs text-red-600 mt-1">Passwörter stimmen nicht überein.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || (!!confirm && confirm !== password)}
          className="w-full bg-brand-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-brand-700 active:bg-brand-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Passwort speichern
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
