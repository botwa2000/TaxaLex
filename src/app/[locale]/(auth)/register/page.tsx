'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Loader2, CheckCircle2, User, UserCheck, Scale, Eye, EyeOff } from 'lucide-react'
import { AUTH } from '@/config/constants'

type UserType = 'individual' | 'advisor' | 'lawyer'

export default function RegisterPage() {
  const t = useTranslations('auth.register')
  const tLogin = useTranslations('auth.login')
  const tCommon = useTranslations('common')
  const locale = useLocale()

  const USER_TYPES: { key: UserType; icon: React.ElementType }[] = [
    { key: 'individual', icon: User },
    { key: 'advisor', icon: UserCheck },
    { key: 'lawyer', icon: Scale },
  ]

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
      setError(data.error ?? t('errorFailed'))
      setLoading(false)
      return
    }

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

  const strengthKeys = [null, 'weak', 'fair', 'good', 'strong'] as const
  const strengthColors = [null, 'bg-red-400', 'bg-amber-400', 'bg-brand-500', 'bg-green-500'] as const
  const strengthWidths = [null, 'w-1/4', 'w-2/4', 'w-3/4', 'w-full'] as const
  const strengthTexts = [null, 'text-red-600', 'text-amber-600', 'text-brand-600', 'text-green-600'] as const

  const benefits = t.raw(`benefits.${userType}`) as string[]

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-8 shadow-sm">
      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-2">{t('title')}</h1>
      <p className="text-sm text-[var(--muted)] mb-7">
        {t('hasAccount')}{' '}
        <Link href="/login" className="text-brand-600 hover:underline font-medium">
          {t('login')}
        </Link>
      </p>

      {error && (
        <div className="bg-[#fef2f2] border border-red-200 text-red-700 text-sm px-3 py-2.5 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* User type selector */}
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">{t('iAm')}</p>
        <div className="grid grid-cols-3 gap-2">
          {USER_TYPES.map(({ key, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setUserType(key)}
              className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-lg border text-center transition-colors ${
                userType === key
                  ? 'border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:border-brand-600 dark:text-brand-300'
                  : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--border-strong)]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-xs font-semibold leading-tight">{t(`types.${key}`)}</span>
              <span className="text-[10px] opacity-70 leading-tight">{t(`sublabels.${key}`)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Benefits for selected type */}
      <div className="bg-brand-50 dark:bg-brand-950 border border-brand-100 dark:border-brand-900 rounded-xl p-3.5 mb-5 space-y-1.5">
        {Array.isArray(benefits) && benefits.map((b) => (
          <div key={b} className="flex items-center gap-2 text-xs text-brand-800 dark:text-brand-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            {b}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
            {t('name')} <span className="text-[var(--muted)] font-normal text-xs">({tCommon('optional')})</span>
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
            {t('email')} <span className="text-red-500">*</span>
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
            {t('password')} <span className="text-red-500">*</span>
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
              aria-label={showPassword ? tLogin('hidePassword') : tLogin('showPassword')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {passwordScore > 0 && (
            <div className="mt-2">
              <div className="h-1 bg-[var(--border)] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${strengthColors[passwordScore]} ${strengthWidths[passwordScore]}`} />
              </div>
              <p className="text-xs text-[var(--muted)] mt-1">
                {t('passwordStrengthLabel')}{' '}
                <span className={strengthTexts[passwordScore] ?? ''}>
                  {strengthKeys[passwordScore] ? t(`passwordStrength.${strengthKeys[passwordScore]}`) : ''}
                </span>
                {' · '}
                {t('passwordMinLength', { n: AUTH.minPasswordLength })}
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
          {t('registerFree')}
        </button>
      </form>

      <p className="text-xs text-[var(--muted)] mt-4 text-center leading-relaxed">
        {t.rich('agreeToTerms', {
          terms: (chunks) => (
            <Link href="/agb" className="hover:underline text-[var(--foreground)]">{chunks}</Link>
          ),
          privacy: (chunks) => (
            <Link href="/datenschutz" className="hover:underline text-[var(--foreground)]">{chunks}</Link>
          ),
        })}
      </p>
    </div>
  )
}
