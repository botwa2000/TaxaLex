'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ViabilityBadge } from '@/components/advisor/ViabilityBadge'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CalendarDays, MessageSquare } from 'lucide-react'
import type { ViabilityScore, AdvisorAssignmentStatus } from '@/types'

interface Props {
  assignmentId: string
  caseId: string
  status: AdvisorAssignmentStatus
  briefSummary: string | null
  viabilityScore: ViabilityScore | null
  viabilitySummary: string | null
  deadline: string | Date | null
  openAnnotations: number
  amountDisputed?: number | null
}

const statusLabel: Record<AdvisorAssignmentStatus, string> = {
  PENDING: 'Entscheidung erforderlich',
  ACCEPTED: 'In Prüfung',
  DECLINED: 'Abgelehnt',
  CHANGES_REQUESTED: 'Rückfragen offen',
  APPROVED: 'Freigegeben',
  FINALIZED: 'Abgeschlossen',
}

const statusVariant: Record<AdvisorAssignmentStatus, 'warning' | 'info' | 'danger' | 'default' | 'success'> = {
  PENDING: 'warning',
  ACCEPTED: 'info',
  DECLINED: 'danger',
  CHANGES_REQUESTED: 'warning',
  APPROVED: 'success',
  FINALIZED: 'success',
}

export function CaseCard({
  caseId,
  status,
  briefSummary,
  viabilityScore,
  viabilitySummary,
  deadline,
  openAnnotations,
  amountDisputed,
}: Props) {
  const params = useParams()
  const locale = params.locale as string

  const deadlineDate = deadline ? new Date(deadline) : null
  const daysLeft = deadlineDate
    ? Math.ceil((deadlineDate.getTime() - Date.now()) / 86400000)
    : null

  const deadlineColor =
    daysLeft === null ? '' :
    daysLeft <= 3 ? 'text-red-600 dark:text-red-400' :
    daysLeft <= 7 ? 'text-amber-600 dark:text-amber-400' :
    'text-[var(--muted)]'

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col gap-3 hover:border-brand-300 transition-colors">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-[var(--foreground)] leading-tight">
          {briefSummary ?? 'Fall ohne Zusammenfassung'}
        </p>
        <Badge variant={statusVariant[status]} size="sm" className="shrink-0">
          {statusLabel[status]}
        </Badge>
      </div>

      {/* Viability + amount */}
      <div className="flex items-center gap-2 flex-wrap">
        {viabilityScore && (
          <ViabilityBadge score={viabilityScore} summary={viabilitySummary} size="sm" />
        )}
        {amountDisputed != null && amountDisputed > 0 && (
          <span className="text-xs text-[var(--muted)]">
            €{amountDisputed.toLocaleString('de-DE')} strittig
          </span>
        )}
      </div>

      {/* Deadline + annotations */}
      <div className="flex items-center gap-4 text-xs">
        {deadlineDate && (
          <span className={`flex items-center gap-1 ${deadlineColor}`}>
            <CalendarDays size={12} />
            {daysLeft !== null && daysLeft >= 0
              ? `${daysLeft} Tag${daysLeft === 1 ? '' : 'e'} Frist`
              : 'Frist abgelaufen'}
          </span>
        )}
        {openAnnotations > 0 && (
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <MessageSquare size={12} />
            {openAnnotations} Rückfrage{openAnnotations !== 1 ? 'n' : ''} offen
          </span>
        )}
      </div>

      <Link href={`/${locale}/advisor/cases/${caseId}`}>
        <Button variant="secondary" size="sm" className="w-full">
          {status === 'PENDING' ? 'Ansehen & entscheiden' : 'Öffnen'}
        </Button>
      </Link>
    </div>
  )
}
