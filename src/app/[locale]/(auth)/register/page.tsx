'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { Loader2, CheckCircle2, User, Briefcase, UserCheck, Scale } from 'lucide-react'
import { AUTH } from '@/config/constants'

type UserType = 'individual' | 'selfemployed' | 'advisor' | 'lawyer'

const USER_TYPES: { key: UserType; label: string; icon: React.ElementType; benefits: string[] }[] = [
  {
    key: 'individual',
    label: 'Privatperson',
    icon: User,
    benefits: [
      '1 kostenloser Einspruch pro Monat',
      '5 KI-Agenten prüfen Ihren Fall',
      'Download als DOCX oder TXT',
    ],
  },
  {
    key: 'selfemployed',
    label: 'Selbstständig',
    icon: Briefcase,
    benefits: [
      'Einsprüche gegen Steuerbescheide & USt',
      'Unbegrenzte Dokumente pro Einspruch',
      'Priorisierte KI-Verarbeitung',
    ],
  },
  {
    key: 'advisor',
    label: 'Steuerberater',
    icon: UserCheck,
    benefits: [
      'Multi-Mandanten-Dashboard',
      'Unbegrenzte Einsprüche für alle Mandanten',
      'White-Label-Exportoption',
    ],
  },
  {
    key: 'lawyer',
    label: 'Rechtsanwalt',
    icon: Scale,
    benefits: [
      'Multi-Mandanten-Dashboard',
      'Unbegrenzte Einsprüche für alle Mandanten',
      'Erweiterte Rechtsgrundlagen-Recherche',
    ],
  },
]

export default function RegisterPage() {
  const [userType, setUserType] = useState<UserType>('individual')
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
      body: JSON.stringify({ name, email, password, userType }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Registrierung fehlgeschlagen.')
      setLoading(false)
      return
    }

    // Redirect to login preserving locale prefix
    window.location.href = window.location.pathname.replace('/register', '/login') + '?registered=1'
  }

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
  const activeType = USER_TYPES.find((t) => t.key === userType)!

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Konto erstellen</h1>
      <p className="text-sm text-[var(--muted)] mb-6">
        Bereits registriert?{' '}
        <Link href="/login" className="text-brand-600 hover:underline font-medium">
          Anmelden
        </Link>
      </p>

      {error && (
        <div className="bg-[#fef2f2] border border-red-200 text-red-700 text-sm px-3 py-2.5 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* User type selector */}
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">Ich bin…</p>
        <div className="grid grid-cols-2 gap-2">
          {USER_TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setUserType(t.key)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors text-left ${
                userType === t.key
                  ? 'border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:border-brand-600 dark:text-brand-300'
                  : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--border-strong)]'
              }`}
            >
              <t.icon className="w-4 h-4 shrink-0" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Benefits for selected type */}
      <div className="bg-brand-50 dark:bg-brand-950 border border-brand-100 dark:border-brand-900 rounded-xl p-3.5 mb-5 space-y-1.5">
        {activeType.benefits.map((b) => (
          <div key={b} className="flex items-center gap-2 text-xs text-brand-800 dark:text-brand-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            {b}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
            Name <span className="text-[var(--muted)] font-normal text-xs">(optional)</span>
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Max Mustermann"
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
            E-Mail <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="max@beispiel.de"
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
            Passwort <span className="text-red-500">*</span>
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={AUTH.minPasswordLength}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-colors"
          />
          {strength && (
            <div className="mt-2">
              <div className="h-1 bg-[var(--border)] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
              </div>
              <p className="text-xs text-[var(--muted)] mt-1">
                Passwortstärke:{' '}
                <span className={strength.text}>{strength.label}</span>
                {' · '}Min. {AUTH.minPasswordLength} Zeichen
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
        Mit der Registrierung stimmen Sie den{' '}
        <Link href="/agb" className="hover:underline text-[var(--foreground)]">AGB</Link>
        {' '}und der{' '}
        <Link href="/datenschutz" className="hover:underline text-[var(--foreground)]">Datenschutzerklärung</Link>
        {' '}zu.
      </p>
    </div>
  )
}
