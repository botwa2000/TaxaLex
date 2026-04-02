'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Alert } from '@/components/ui/Alert'
import { ShieldCheck, UserCheck, Users, X } from 'lucide-react'

interface Props {
  caseId: string
  useCase: string
}

// Map case useCase to which practice area label to show
const PRACTICE_AREA_LABEL: Record<string, 'tax' | 'legal'> = {
  tax: 'tax', grundsteuer: 'tax',
  jobcenter: 'legal', bussgeld: 'legal', bussgeldd: 'legal',
  krankenversicherung: 'legal', kuendigung: 'legal', miete: 'legal', rente: 'legal',
}

export function HandoffRequestForm({ caseId, useCase }: Props) {
  const t = useTranslations('advisor.handoff')
  const tCommon = useTranslations('common')

  const [scope, setScope] = useState<'REVIEW_ONLY' | 'FULL_REPRESENTATION'>('REVIEW_ONLY')
  const [clientNotes, setClientNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [expertCount, setExpertCount] = useState<number | null>(null)
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false)
  const [withdrawReason, setWithdrawReason] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)
  const router = useRouter()

  const areaKey = PRACTICE_AREA_LABEL[useCase] ?? 'legal'
  const areaLabel = t(areaKey)

  const submit = () => {
    setError(null)
    startTransition(async () => {
      const res = await fetch(`/api/case/${caseId}/handoff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope, clientNotes: clientNotes || undefined }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Anfrage fehlgeschlagen')
        return
      }

      const data = await res.json()
      setExpertCount(data.expertCount ?? null)
      router.refresh()
    })
  }

  const withdraw = async () => {
    setWithdrawing(true)
    const res = await fetch(`/api/case/${caseId}/handoff/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: withdrawReason || undefined }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Rückzug fehlgeschlagen')
      setWithdrawing(false)
      setShowWithdrawConfirm(false)
      return
    }

    router.refresh()
  }

  if (expertCount !== null) {
    return (
      <div className="rounded-xl border border-brand-200 bg-brand-50 dark:bg-brand-950 dark:border-brand-800 p-5 flex items-start gap-3">
        <Users size={18} className="text-brand-600 dark:text-brand-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-brand-800 dark:text-brand-200">
            {t('expertsNotified', { count: expertCount })}
          </p>
          <p className="text-xs text-brand-700 dark:text-brand-300 mt-0.5">{t('awaitingAcceptance')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-950 flex items-center justify-center">
          <UserCheck size={20} className="text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-[var(--foreground)]">Professionelle Prüfung anfragen</h3>
          <p className="text-sm text-[var(--muted)]">
            {t('expertArea')}: <span className="font-medium text-[var(--foreground)]">{areaLabel}</span>
          </p>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Broadcast explanation */}
      <div className="flex items-start gap-2 text-xs text-brand-800 dark:text-brand-200 bg-brand-50 dark:bg-brand-950 border border-brand-100 dark:border-brand-900 rounded-lg p-3">
        <Users size={14} className="text-brand-600 mt-0.5 shrink-0" />
        <span>{t('broadcastInfo')}</span>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
            Umfang der Beauftragung
          </label>
          <Select
            value={scope}
            onChange={e => setScope(e.target.value as typeof scope)}
            options={[
              { value: 'REVIEW_ONLY', label: 'Nur Prüfung — ich reiche selbst ein' },
              { value: 'FULL_REPRESENTATION', label: 'Vollständige Vertretung' },
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
            Hinweise für den Experten (optional)
          </label>
          <Textarea
            value={clientNotes}
            onChange={e => setClientNotes(e.target.value)}
            placeholder="Z. B. besondere Umstände, Prioritäten, Fragen an den Experten..."
            rows={3}
            maxLength={1000}
          />
        </div>

        <div className="flex items-start gap-2 text-xs text-[var(--muted)] bg-[var(--background-subtle)] rounded-lg p-3">
          <ShieldCheck size={14} className="text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
          <span>
            Alle Dokumente werden verschlüsselt übertragen. Experten sehen nur die für diesen Fall relevanten Unterlagen.
          </span>
        </div>
      </div>

      <Button onClick={submit} loading={isPending} className="w-full">
        Prüfung anfragen
      </Button>

      {/* Withdraw option — shown after request is in flight */}
      {showWithdrawConfirm ? (
        <div className="border border-red-200 rounded-xl p-4 flex flex-col gap-3">
          <p className="text-sm font-medium text-[var(--foreground)]">{t('withdrawConfirm')}</p>
          <Textarea
            value={withdrawReason}
            onChange={e => setWithdrawReason(e.target.value)}
            placeholder={t('withdrawReason')}
            rows={2}
            maxLength={500}
          />
          <div className="flex gap-2">
            <Button variant="danger" loading={withdrawing} onClick={withdraw} className="flex-1">
              {t('withdrawButton')}
            </Button>
            <button
              onClick={() => setShowWithdrawConfirm(false)}
              className="flex-1 border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              {tCommon('cancel')}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowWithdrawConfirm(true)}
          className="flex items-center justify-center gap-1.5 text-xs text-[var(--muted)] hover:text-red-600 transition-colors"
        >
          <X size={12} />
          {t('withdrawButton')}
        </button>
      )}
    </div>
  )
}
