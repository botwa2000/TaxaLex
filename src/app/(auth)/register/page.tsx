'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { AUTH } from '@/config/constants'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Registrierung fehlgeschlagen.')
      setLoading(false)
      return
    }

    router.push('/login?registered=1')
  }

  const passwordStrength = password.length === 0 ? null : password.length < 8 ? 'weak' : password.length < 12 ? 'medium' : 'strong'
  const strengthLabel = { weak: 'Schwach', medium: 'Mittel', strong: 'Stark' }
  const strengthColor = { weak: 'bg-red-400', medium: 'bg-amber-400', strong: 'bg-green-500' }
  const strengthWidth = { weak: 'w-1/3', medium: 'w-2/3', strong: 'w-full' }

  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Konto erstellen</h1>
      <p className="text-sm text-[var(--muted)] mb-6">
        Bereits registriert?{' '}
        <Link href="/login" className="text-brand-600 hover:underline font-medium">
          Anmelden
        </Link>
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2.5 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Benefits */}
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-3.5 mb-5 space-y-1.5">
        {['Alle Bescheid-Typen unterstützt', '5 KI-Agenten prüfen gegenseitig', 'Keine Kreditkarte erforderlich'].map((b) => (
          <div key={b} className="flex items-center gap-2 text-xs text-brand-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            {b}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
            Name <span className="text-[var(--muted)] font-normal">(optional)</span>
          </label>
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Max Mustermann"
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
            E-Mail <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="max@beispiel.de"
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
            Passwort <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            required
            minLength={AUTH.minPasswordLength}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-colors"
          />
          {passwordStrength && (
            <div className="mt-2">
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${strengthColor[passwordStrength]} ${strengthWidth[passwordStrength]}`} />
              </div>
              <p className="text-xs text-[var(--muted)] mt-1">
                Passwortstärke: <span className={passwordStrength === 'strong' ? 'text-green-600' : passwordStrength === 'medium' ? 'text-amber-600' : 'text-red-600'}>{strengthLabel[passwordStrength]}</span>
                {' · '}Mindestens {AUTH.minPasswordLength} Zeichen
              </p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Kostenlos registrieren
        </button>
      </form>

      <p className="text-xs text-[var(--muted)] mt-4 text-center leading-relaxed">
        Mit der Registrierung akzeptieren Sie unsere{' '}
        <Link href="/agb" className="hover:underline text-[var(--foreground)]">AGB</Link> und{' '}
        <Link href="/datenschutz" className="hover:underline text-[var(--foreground)]">Datenschutzerklärung</Link>.
      </p>
    </div>
  )
}
