'use client'

import { useEffect, useRef, useState } from 'react'
import { signOut } from 'next-auth/react'

const IDLE_MS    = 2 * 60 * 60 * 1000   // 2 hours
const WARNING_MS = 5 * 60 * 1000        // warn 5 min before

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'] as const

export function IdleTimer() {
  const [showWarning, setShowWarning] = useState(false)
  const [secsLeft,    setSecsLeft   ] = useState(WARNING_MS / 1000)

  const logoutRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function clearAll() {
    if (logoutRef.current)    clearTimeout(logoutRef.current)
    if (warningRef.current)   clearTimeout(warningRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
  }

  function reset() {
    clearAll()
    setShowWarning(false)
    setSecsLeft(WARNING_MS / 1000)

    warningRef.current = setTimeout(() => {
      setShowWarning(true)
      setSecsLeft(WARNING_MS / 1000)
      countdownRef.current = setInterval(() => {
        setSecsLeft((s) => (s <= 1 ? 0 : s - 1))
      }, 1000)
    }, IDLE_MS - WARNING_MS)

    logoutRef.current = setTimeout(() => {
      signOut({ callbackUrl: '/login?reason=idle' })
    }, IDLE_MS)
  }

  useEffect(() => {
    reset()
    ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, reset, { passive: true }))
    return () => {
      clearAll()
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, reset))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!showWarning) return null

  const mins = Math.floor(secsLeft / 60)
  const secs = secsLeft % 60

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-8 shadow-xl text-center max-w-sm w-full mx-4">
        <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl select-none">
          ⏱
        </div>
        <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">Sitzung läuft ab</h2>
        <p className="text-sm text-[var(--muted)] mb-6">
          Aus Sicherheitsgründen werden Sie in{' '}
          <span className="font-semibold text-amber-600">
            {mins > 0 ? `${mins} Min. ${secs} Sek.` : `${secs} Sek.`}
          </span>{' '}
          automatisch abgemeldet.
        </p>
        <button
          onClick={reset}
          className="w-full bg-brand-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
        >
          Angemeldet bleiben
        </button>
      </div>
    </div>
  )
}
