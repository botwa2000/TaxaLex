'use client'

import { useState, useCallback } from 'react'
import { Plus, FolderOpen, ArrowRight, Trash2 } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

type CaseSummary = {
  id: string
  useCase: string
  status: string
  deadline: Date | null
  createdAt: Date
  updatedAt: Date
}

const STATUS_COLORS: Record<string, string> = {
  CREATED: 'bg-gray-100 text-gray-600',
  UPLOADING: 'bg-blue-50 text-blue-600',
  ANALYZING: 'bg-purple-50 text-purple-600',
  QUESTIONS: 'bg-amber-50 text-amber-700',
  GENERATING: 'bg-purple-50 text-purple-600',
  DRAFT_READY: 'bg-blue-50 text-blue-700',
  SUBMITTED: 'bg-green-50 text-green-700',
  AWAITING_RESPONSE: 'bg-amber-50 text-amber-700',
  CLOSED_SUCCESS: 'bg-green-50 text-green-700',
  CLOSED_PARTIAL: 'bg-yellow-50 text-yellow-700',
  REJECTED: 'bg-red-50 text-red-700',
}

function daysBetween(a: Date, b: Date) {
  return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

interface Props {
  initialCases: CaseSummary[]
}

export function DashboardCaseList({ initialCases }: Props) {
  const t = useTranslations('dashboard')
  const tUC = useTranslations('useCases')
  const tCases = useTranslations('cases')
  const router = useRouter()

  const [cases, setCases] = useState(initialCases)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = useCallback(async (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(tCases('deleteConfirm'))) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/cases/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setCases((prev) => prev.filter((c) => c.id !== id))
        router.refresh()
      }
    } finally {
      setDeletingId(null)
    }
  }, [tCases, router])

  const statusLabels: Record<string, string> = {
    CREATED: t('status.CREATED'),
    UPLOADING: t('status.UPLOADING'),
    ANALYZING: t('status.ANALYZING'),
    QUESTIONS: t('status.QUESTIONS'),
    GENERATING: t('status.GENERATING'),
    DRAFT_READY: t('status.DRAFT_READY'),
    SUBMITTED: t('status.SUBMITTED'),
    AWAITING_RESPONSE: t('status.AWAITING_RESPONSE'),
    CLOSED_SUCCESS: t('status.CLOSED_SUCCESS'),
    CLOSED_PARTIAL: t('status.CLOSED_PARTIAL'),
    REJECTED: t('status.REJECTED'),
  }
  const ucLabels: Record<string, string> = {
    tax: tUC('tax'), jobcenter: tUC('jobcenter'), rente: tUC('rente'),
    bussgeld: tUC('bussgeld'), bussgeldd: tUC('bussgeldd'),
    krankenversicherung: tUC('krankenversicherung'), kuendigung: tUC('kuendigung'),
    miete: tUC('miete'), grundsteuer: tUC('grundsteuer'), sonstige: tUC('sonstige'),
  }

  const now = new Date()

  if (cases.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--muted)]">
        <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium text-sm">{t('noCases')}</p>
        <p className="text-xs mt-1 mb-4">{t('noCasesHint')}</p>
        <Link
          href="/einspruch"
          className="inline-flex items-center gap-1.5 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('startFirst')}
        </Link>
      </div>
    )
  }

  return (
    <div className="divide-y divide-[var(--border)]">
      {cases.slice(0, 6).map((c) => {
        const daysLeft = c.deadline ? daysBetween(now, c.deadline) : null
        const isUrgent = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0
        const isOverdue = daysLeft !== null && daysLeft < 0

        return (
          <div key={c.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--background-subtle)] transition-colors group">
            <Link href={`/cases/${c.id}`} className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)] truncate">
                  {ucLabels[c.useCase] ?? c.useCase}
                  <span className="text-[var(--muted)] font-normal ml-2 text-xs">#{c.id.slice(-6).toUpperCase()}</span>
                </p>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  {t('updatedAt', { date: new Date(c.updatedAt).toLocaleDateString() })}
                </p>
              </div>
              {c.deadline && (
                <div className={`text-xs font-medium shrink-0 hidden sm:block ${isOverdue ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-[var(--muted)]'}`}>
                  {isOverdue ? t('overdueLabel') : t('daysLeft', { days: daysLeft! })}
                </div>
              )}
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${STATUS_COLORS[c.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {statusLabels[c.status] ?? c.status}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
            </Link>
            <button
              onClick={(e) => handleDelete(e, c.id)}
              disabled={deletingId === c.id}
              title={tCases('deleteCase')}
              className="p-1.5 text-[var(--muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0 disabled:opacity-30"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
