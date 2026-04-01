'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { Loader2, Info, ChevronDown, Eye, EyeOff } from 'lucide-react'
import { features } from '@/config/features'

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@taxalex.de', password: 'Admin1234!', role: 'Administrator' },
  { label: 'Steuerberater', email: 'advisor@demo.taxalex.de', password: 'Demo1234!', role: 'Advisor' },
  { label: 'Rechtsanwalt', email: 'lawyer@demo.taxalex.de', password: 'Demo1234!', role: 'Lawyer' },
  { label: 'Nutzer (DE)', email: 'user@demo.taxalex.de', password: 'Demo1234!', role: 'User' },
  { label: 'Nutzer (EN)', email: 'expat@demo.taxalex.de', password: 'Demo1234!', role: 'Expat' },
]

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'
  const registered = searchParams.get('registered')
  const verified = searchParams.get('verified')
  const verifyError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoOpen, setDemoOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      // Check if this is an unverified email (gives a better redirect than a generic error)
      const check = await fetch('/api/auth/verification-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).then((r) => r.json()).catch(() => ({ needs_verification: false }))

      if (check.needs_verification) {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`)
        return
      }

      setError('E-Mail oder Passwort falsch.')
      setLoading(false)
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  function fillDemo(account: typeof DEMO_ACCOUNTS[number]) {
    setEmail(account.email)
    setPassword(account.password)
    setDemoOpen(false)
  }

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-8 shadow-sm">
      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-2">Willkommen zurück</h1>
      <p className="text-sm text-[var(--muted)] mb-7">
        Noch kein Konto?{' '}
        <Link href="register" className="text-brand-600 hover:underline font-medium">
          Jetzt kostenlos registrieren
        </Link>
      </p>

      {registered && (
        <div className="flex items-start gap-2 bg-[var(--success-bg,#ecfdf5)] border border-green-200 text-green-800 text-sm px-3 py-2.5 rounded-lg mb-4">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          Konto erfolgreich erstellt. Bitte melden Sie sich an.
        </div>
      )}

      {verified && (
        <div className="flex items-start gap-2 bg-[var(--success-bg,#ecfdf5)] border border-green-200 text-green-800 text-sm px-3 py-2.5 rounded-lg mb-4">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          E-Mail-Adresse erfolgreich bestätigt. Sie können sich jetzt anmelden.
        </div>
      )}

      {verifyError === 'invalid_token' && (
        <div className="bg-[var(--danger-bg,#fef2f2)] border border-red-200 text-red-700 text-sm px-3 py-2.5 rounded-lg mb-4">
          Der Bestätigungslink ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen an.
        </div>
      )}

      {error && (
        <div className="bg-[var(--danger-bg,#fef2f2)] border border-red-200 text-red-700 text-sm px-3 py-2.5 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Demo accounts accordion */}
      <div className="mb-5 border border-brand-100 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setDemoOpen(!demoOpen)}
          className="w-full flex items-center justify-between gap-2 bg-brand-50 px-3 py-2.5 text-xs text-brand-800 font-medium hover:bg-brand-100 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-brand-600" />
            Demo-Zugangsdaten (5 Accounts verfügbar)
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-brand-600 transition-transform ${demoOpen ? 'rotate-180' : ''}`} />
        </button>
        {demoOpen && (
          <div className="bg-[var(--surface)] border-t border-brand-100 divide-y divide-[var(--border)]">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillDemo(acc)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-[var(--background-subtle)] transition-colors text-left"
              >
                <span>
                  <span className="font-semibold text-[var(--foreground)]">{acc.label}</span>
                  <span className="text-[var(--muted)] ml-2">{acc.email}</span>
                </span>
                <span className="text-[var(--muted)] text-[10px]">{acc.role}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
            E-Mail
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nutzer@beispiel.de"
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-colors"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)]">
              Passwort
            </label>
            <Link href="/forgot-password" className="text-xs text-brand-600 hover:underline">
              Passwort vergessen?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
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
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 text-white py-3.5 rounded-xl text-base font-bold hover:bg-brand-700 active:bg-brand-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Anmelden
        </button>
      </form>

      {features.googleAuth && (
        <>
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-xs text-[var(--muted)]">oder</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>
          <button
            onClick={() => signIn('google', { callbackUrl })}
            className="w-full border border-[var(--border)] bg-[var(--surface)] py-2.5 rounded-lg text-sm font-medium hover:bg-[var(--background-subtle)] transition-colors flex items-center justify-center gap-2 text-[var(--foreground)]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Mit Google anmelden
          </button>
        </>
      )}
    </div>
  )
}
