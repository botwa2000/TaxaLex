'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { CheckCircle2, Loader2, Mail, RefreshCw } from 'lucide-react'

const CODE_LENGTH = 6
const RESEND_COOLDOWN = 120 // seconds

export default function VerifyEmailPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const locale = pathname.split('/')[1] ?? 'de'
  const email = searchParams.get('email') ?? ''

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Focus first empty box on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  const submitCode = useCallback(
    async (code: string) => {
      if (code.length !== CODE_LENGTH || loading) return
      setLoading(true)
      setError('')

      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/${locale}/login?verified=1`)
        }, 1800)
      } else {
        setError(data.error ?? 'Ungültiger Code.')
        setLoading(false)
        // Clear boxes on error
        setDigits(Array(CODE_LENGTH).fill(''))
        setTimeout(() => inputRefs.current[0]?.focus(), 0)
      }
    },
    [email, loading, locale, router]
  )

  function handleChange(index: number, value: string) {
    // Allow paste of full code
    if (value.length === CODE_LENGTH && /^\d{6}$/.test(value)) {
      const newDigits = value.split('')
      setDigits(newDigits)
      inputRefs.current[CODE_LENGTH - 1]?.focus()
      submitCode(value)
      return
    }

    const digit = value.replace(/\D/g, '').slice(-1)
    const newDigits = [...digits]
    newDigits[index] = digit
    setDigits(newDigits)
    setError('')

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    const code = newDigits.join('')
    if (code.length === CODE_LENGTH && newDigits.every((d) => d !== '')) {
      submitCode(code)
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
    if (pasted.length === 0) return
    const newDigits = Array(CODE_LENGTH).fill('')
    pasted.split('').forEach((d, i) => { newDigits[i] = d })
    setDigits(newDigits)
    const nextEmpty = pasted.length < CODE_LENGTH ? pasted.length : CODE_LENGTH - 1
    inputRefs.current[nextEmpty]?.focus()
    if (pasted.length === CODE_LENGTH) {
      submitCode(pasted)
    }
  }

  async function handleResend() {
    if (resendCooldown > 0 || resendLoading) return
    setResendLoading(true)
    setResendSent(false)
    setError('')

    await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    setResendLoading(false)
    setResendSent(true)
    setResendCooldown(RESEND_COOLDOWN)
    setDigits(Array(CODE_LENGTH).fill(''))
    setTimeout(() => inputRefs.current[0]?.focus(), 0)
  }

  const maskedEmail = email
    ? email.replace(/(.{2}).+(@.+)/, '$1***$2')
    : ''

  if (success) {
    return (
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-8 shadow-sm text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">E-Mail bestätigt!</h1>
        <p className="text-[var(--muted)] text-sm">Du wirst weitergeleitet…</p>
      </div>
    )
  }

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-8 shadow-sm">
      <div className="flex justify-center mb-5">
        <div className="w-14 h-14 bg-brand-50 dark:bg-brand-950 rounded-2xl flex items-center justify-center">
          <Mail className="w-7 h-7 text-brand-600" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-[var(--foreground)] text-center mb-1">
        Code bestätigen
      </h1>
      <p className="text-sm text-[var(--muted)] text-center mb-7">
        Wir haben einen 6-stelligen Code an{' '}
        <span className="font-medium text-[var(--foreground)]">{maskedEmail || 'deine E-Mail'}</span>{' '}
        gesendet.
      </p>

      {/* OTP input boxes */}
      <div className="flex gap-2.5 justify-center mb-6" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el }}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={CODE_LENGTH} // allow paste on first box
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={loading || success}
            className={`w-11 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 bg-[var(--surface)] text-[var(--foreground)] disabled:opacity-50 ${
              error
                ? 'border-red-400 bg-red-50 dark:bg-red-950/20'
                : digit
                  ? 'border-brand-400 bg-brand-50 dark:bg-brand-950/40'
                  : 'border-gray-300 dark:border-gray-600'
            }`}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 text-center mb-4">{error}</p>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center gap-2 text-sm text-[var(--muted)] mb-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          Überprüfen…
        </div>
      )}

      {/* Resend section */}
      <div className="text-center">
        {resendSent && (
          <p className="text-sm text-green-600 mb-3 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Neuer Code wurde gesendet.
          </p>
        )}
        <p className="text-sm text-[var(--muted)]">
          Keinen Code erhalten?{' '}
          {resendCooldown > 0 ? (
            <span className="text-[var(--muted)]">
              Erneut senden in {resendCooldown}s
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="text-brand-600 hover:underline font-medium inline-flex items-center gap-1 disabled:opacity-50"
            >
              {resendLoading && <Loader2 className="w-3 h-3 animate-spin" />}
              {!resendLoading && <RefreshCw className="w-3 h-3" />}
              Erneut senden
            </button>
          )}
        </p>
      </div>

      <p className="text-xs text-[var(--muted)] text-center mt-6">
        <Link href="/login" className="hover:underline text-[var(--muted)]">
          ← Zurück zur Anmeldung
        </Link>
      </p>
    </div>
  )
}
