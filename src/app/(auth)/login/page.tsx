'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Info } from 'lucide-react'
import { features } from '@/config/features'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'
  const registered = searchParams.get('registered')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
      setError('E-Mail oder Passwort falsch.')
      setLoading(false)
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Willkommen zurück</h1>
      <p className="text-sm text-[var(--muted)] mb-6">
        Noch kein Konto?{' '}
        <Link href="/register" className="text-brand-600 hover:underline font-medium">
          Jetzt kostenlos registrieren
        </Link>
      </p>

      {/* Success message from registration */}
      {registered && (
        <div className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-800 text-sm px-3 py-2.5 rounded-lg mb-4">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          Konto erfolgreich erstellt. Bitte melden Sie sich an.
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2.5 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Demo hint */}
      <div className="flex items-start gap-2 bg-brand-50 border border-brand-100 text-brand-800 text-xs px-3 py-2.5 rounded-lg mb-5">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-brand-600" />
        <span>Demo-Zugangsdaten: <strong>admin</strong> / <strong>admin</strong></span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
            E-Mail oder Benutzername
          </label>
          <input
            type="text"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@beispiel.de"
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-colors"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-[var(--foreground)]">Passwort</label>
            <button
              type="button"
              onClick={() => alert('Passwort-Reset wird in einer zukünftigen Version verfügbar sein.')}
              className="text-xs text-brand-600 hover:underline"
            >
              Passwort vergessen?
            </button>
          </div>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
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
            className="w-full border border-[var(--border)] py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
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
