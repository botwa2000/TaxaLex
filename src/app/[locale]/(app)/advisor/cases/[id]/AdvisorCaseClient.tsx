'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { HandoffPacketViewer } from '@/components/advisor/HandoffPacketViewer'
import { AnnotationPanel } from '@/components/advisor/AnnotationPanel'
import { DeclineModal } from '@/components/advisor/DeclineModal'
import { ViabilityBadge } from '@/components/advisor/ViabilityBadge'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react'
import type { HandoffPacketData, AnnotationData, AdvisorAssignmentData, PacketSection } from '@/types'
import { Link } from '@/i18n/navigation'

interface Props {
  caseId: string
  assignment: AdvisorAssignmentData
  packet: HandoffPacketData
  initialAnnotations: AnnotationData[]
}

const statusLabel: Record<string, string> = {
  PENDING: 'Entscheidung erforderlich',
  ACCEPTED: 'In Prüfung',
  DECLINED: 'Abgelehnt',
  CHANGES_REQUESTED: 'Rückfragen offen',
  APPROVED: 'Freigegeben',
  FINALIZED: 'Abgeschlossen',
}

export function AdvisorCaseClient({ caseId, assignment, packet, initialAnnotations }: Props) {
  const [annotations, setAnnotations] = useState<AnnotationData[]>(initialAnnotations)
  const [activeSection, setActiveSection] = useState<PacketSection | null>(null)
  const [activeParagraphIndex, setActiveParagraphIndex] = useState<number | null>(null)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSectionSelect = useCallback((section: PacketSection, idx: number | null) => {
    setActiveSection(section)
    setActiveParagraphIndex(idx)
  }, [])

  const refreshAnnotations = useCallback(async () => {
    const res = await fetch(`/api/advisor/cases/${caseId}`)
    if (res.ok) {
      const data = await res.json()
      setAnnotations(data.annotations)
    }
  }, [caseId])

  const accept = () => {
    setError(null)
    startTransition(async () => {
      const res = await fetch(`/api/advisor/cases/${caseId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error ?? 'Fehler beim Annehmen')
      }
    })
  }

  const finalize = () => {
    setError(null)
    startTransition(async () => {
      const res = await fetch(`/api/advisor/cases/${caseId}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error ?? 'Fehler beim Freigeben')
      }
    })
  }

  const openAnnotations = annotations.filter(a => a.status !== 'RESOLVED').length
  const canFinalize = assignment.status === 'ACCEPTED' && openAnnotations === 0

  return (
    <div>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--border)] px-0 pb-3 mb-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/advisor/dashboard" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)] leading-tight">{packet.briefSummary}</p>
              <p className="text-xs text-[var(--muted)]">Fall #{caseId.slice(-8).toUpperCase()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {packet.analysisSummary.viabilityScore && (
              <ViabilityBadge
                score={packet.analysisSummary.viabilityScore}
                summary={packet.analysisSummary.viabilitySummary}
                size="sm"
              />
            )}
            <Badge variant="outline" size="sm">{statusLabel[assignment.status] ?? assignment.status}</Badge>

            {assignment.status === 'PENDING' && (
              <>
                <Button
                  variant="danger"
                  size="sm"
                  icon={<XCircle size={14} />}
                  onClick={() => setShowDeclineModal(true)}
                  disabled={isPending}
                >
                  Ablehnen
                </Button>
                <Button
                  size="sm"
                  icon={<CheckCircle2 size={14} />}
                  loading={isPending}
                  onClick={accept}
                >
                  Annehmen
                </Button>
              </>
            )}

            {canFinalize && (
              <Button
                size="sm"
                icon={<CheckCircle2 size={14} />}
                loading={isPending}
                onClick={finalize}
              >
                Freigeben & abschließen
              </Button>
            )}

            {assignment.status === 'ACCEPTED' && openAnnotations > 0 && (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                {openAnnotations} Rückfrage{openAnnotations !== 1 ? 'n' : ''} offen
              </span>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="error" className="mt-3">{error}</Alert>
        )}
      </div>

      {/* Two-panel layout */}
      <div className="grid lg:grid-cols-[3fr_2fr] gap-6">
        {/* Left: packet viewer */}
        <div className="min-w-0">
          <HandoffPacketViewer
            packet={packet}
            activeSection={activeSection}
            activeParagraphIndex={activeParagraphIndex}
            onSectionSelect={handleSectionSelect}
          />
        </div>

        {/* Right: annotation panel */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <AnnotationPanel
            caseId={caseId}
            annotations={annotations}
            activeSection={activeSection}
            activeParagraphIndex={activeParagraphIndex}
            viewerRole="advisor"
            onUpdate={refreshAnnotations}
          />
        </div>
      </div>

      <DeclineModal
        open={showDeclineModal}
        onClose={() => setShowDeclineModal(false)}
        caseId={caseId}
      />
    </div>
  )
}
