'use client'

import { useState } from 'react'
import { Lock, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface Props {
  caseId: string
  locale: string
  variant?: 'default' | 'inline'
}

export function UnlockDraftButton({ caseId, locale, variant = 'default' }: Props) {
  const t = useTranslations('cases')
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleUnlock() {
    setLoading(true)
    setError('')
    const res = await fetch(`/api/cases/${caseId}/unlock`, { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      router.refresh()
    } else if (res.status === 402) {
      window.location.href = `/${locale}/billing?caseId=${caseId}`
    } else {
      setError(data.error ?? 'Freischaltung fehlgeschlagen.')
      setLoading(false)
    }
  }

  if (variant === 'inline') {
    return (
      <div>
        <button
          onClick={handleUnlock}
          disabled={loading}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-brand-300 bg-brand-50 text-brand-700 hover:bg-brand-100 dark:border-brand-700 dark:bg-brand-950/30 dark:text-brand-400 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
          {loading ? '…' : t('detail.unlockWithCredit')}
        </button>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
    )
  }

  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      <button
        onClick={handleUnlock}
        disabled={loading}
        className="inline-flex items-center gap-1.5 bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
        {loading ? '…' : t('detail.unlockWithCredit')}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
