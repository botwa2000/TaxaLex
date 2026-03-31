'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { Loader2, CheckCircle2, User, UserCheck, Scale, Eye, EyeOff } from 'lucide-react'
import { AUTH } from '@/config/constants'

type UserType = 'individual' | 'advisor' | 'lawyer'

const USER_TYPES: { key: UserType; label: string; sublabel: string; icon: React.ElementType; benefits: string[] }[] = [
  {
    key: 'individual',
    label: 'Privatperson / Selbstständig',
    sublabel: 'Bescheide anfechten',
    icon: User,
    benefits: [
      'Steuerbescheid, Jobcenter, Rente, Miete u. v. m.',
      'Einspruch in unter 5 Minuten — keine Vorkenntnisse nötig',
      '5 KI-Agenten prüfen und verbessern Ihren Entwurf',
    ],
  },
  {
    key: 'advisor',
    label: 'Steuerberater',
    sublabel: 'Mandanten betreuen',
    icon: UserCheck,
    benefits: [
      'Entwürfe Ihrer Mandanten schnell prüfen und freigeben',
      'Freigabe-Link direkt an Mandanten — keine Rückfragen',
      'Zeit sparen: Prüfung statt Erstellung',
    ],
  },
  {
    key: 'lawyer',
    label: 'Rechtsanwalt',
    sublabel: 'Mandanten vertreten',
    icon: Scale,
    benefits: [
      'Entwürfe schnell prüfen und kommentieren',
      'Freigabe-Workflow für alle Rechtsgebiete',
      'Steuer, Miete, Arbeit, Soziales — alles in einem',
    ],
  },
]

export default function RegisterPage() {
  const pathname = usePathname()
  // Extract locale from pathname prefix (e.g. /de/register → 'de')
  const locale = pathname.split('/')[1] ?? 'de'

  const [userType, setUserType] = useState<UserType>('individual')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, userType, locale }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Registrierung fehlgeschlagen.')
      setLoading(false)
      return
    }

    // Redirect to email verification page
    const base = window.location.pathname.replace('/register', '')
    window.location.href = `${base}/verify-email?email=${encodeURIComponent(email)}`
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
      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-2">Konto erstellen</h1>
      <p className="text-sm text-[var(--muted)] mb-7">
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
        <div className="grid grid-cols-3 gap-2">
          {USER_TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setUserType(t.key)}
              className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-lg border text-center transition-colors ${
                userType === t.key
                  ? 'border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:border-brand-600 dark:text-brand-300'
                  : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--border-strong)]'
              }`}
            >
              <t.icon className="w-4 h-4 shrink-0" />
              <span className="text-xs font-semibold leading-tight">{t.label}</span>
              <span className="text-[10px] opacity-70 leading-tight">{t.sublabel}</span>
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
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={AUTH.minPasswordLength}
              autoComplete="new-password"
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
          className="w-full bg-brand-600 text-white py-3.5 rounded-xl text-base font-bold hover:bg-brand-700 active:bg-brand-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
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
