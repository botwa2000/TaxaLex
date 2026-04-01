'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { Loader2, Trash2 } from 'lucide-react'

export function DeleteAccountButton() {
  const [phase, setPhase] = useState<'idle' | 'confirm' | 'deleting'>('idle')
  const [error, setError] = useState('')

  async function handleDelete() {
    setPhase('deleting')
    setError('')

    const res = await fetch('/api/user/account', { method: 'DELETE' })
    if (res.ok) {
      // Sign out and redirect to home — account no longer exists
      await signOut({ callbackUrl: '/?deleted=1' })
    } else {
      const data = await res.json()
      setError(data.error ?? 'Konto konnte nicht gelöscht werden.')
      setPhase('idle')
    }
  }

  if (phase === 'confirm') {
    return (
      <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-xs text-red-700 dark:text-red-400 mb-3 font-medium">
          Alle deine Daten werden unwiderruflich gelöscht. Bist du sicher?
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 font-medium transition-colors"
          >
            Ja, Konto endgültig löschen
          </button>
          <button
            onClick={() => setPhase('idle')}
            className="text-xs border border-[var(--border)] px-3 py-1.5 rounded-lg text-[var(--muted)] hover:bg-[var(--background-subtle)] transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => setPhase('confirm')}
        disabled={phase === 'deleting'}
        className="text-xs border border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
      >
        {phase === 'deleting' && <Loader2 className="w-3 h-3 animate-spin" />}
        {phase !== 'deleting' && <Trash2 className="w-3 h-3" />}
        Konto löschen
      </button>
      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  )
}
