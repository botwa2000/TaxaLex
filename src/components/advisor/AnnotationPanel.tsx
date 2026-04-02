'use client'

import { useState, useTransition } from 'react'
import { AnnotationThread } from '@/components/advisor/AnnotationThread'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Plus } from 'lucide-react'
import type { AnnotationData, PacketSection } from '@/types'
import { ADVISOR } from '@/config/constants'

interface Props {
  caseId: string
  annotations: AnnotationData[]
  activeSection: PacketSection | null
  activeParagraphIndex: number | null
  viewerRole: 'advisor' | 'client'
  onUpdate: () => void
}

export function AnnotationPanel({
  caseId,
  annotations,
  activeSection,
  activeParagraphIndex,
  viewerRole,
  onUpdate,
}: Props) {
  const [newContent, setNewContent] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Filter to active section/paragraph, or show all
  const filtered = activeSection
    ? annotations.filter(a =>
        a.section === activeSection &&
        (activeParagraphIndex == null || a.paragraphIndex === activeParagraphIndex)
      )
    : annotations

  const canAddAnnotation =
    viewerRole === 'advisor' &&
    activeSection !== null &&
    annotations.length < ADVISOR.maxAnnotationsPerCase

  const addAnnotation = () => {
    if (!activeSection || newContent.trim().length < 5) return

    startTransition(async () => {
      await fetch(`/api/case/${caseId}/annotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: activeSection,
          paragraphIndex: activeParagraphIndex,
          content: newContent,
        }),
      })
      setNewContent('')
      setShowForm(false)
      onUpdate()
    })
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">
          {activeSection
            ? `Rückfragen — ${sectionLabel(activeSection)}`
            : `Alle Rückfragen (${annotations.length})`}
        </h3>
        {canAddAnnotation && !showForm && (
          <Button
            variant="secondary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => setShowForm(true)}
          >
            Rückfrage stellen
          </Button>
        )}
      </div>

      {/* New annotation form */}
      {showForm && viewerRole === 'advisor' && (
        <div className="rounded-lg border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950 p-3 flex flex-col gap-2">
          <p className="text-xs font-semibold text-brand-700 dark:text-brand-300">
            Neue Rückfrage — {activeSection ? sectionLabel(activeSection) : ''}
          </p>
          <Textarea
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            placeholder="Rückfrage formulieren..."
            rows={3}
            maxLength={ADVISOR.maxAnnotationLength}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              loading={isPending}
              disabled={newContent.trim().length < 5}
              onClick={addAnnotation}
            >
              Absenden
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              Abbrechen
            </Button>
          </div>
        </div>
      )}

      {/* Annotation list */}
      {filtered.length === 0 ? (
        <p className="text-sm text-[var(--muted)] text-center py-6">
          {activeSection
            ? 'Keine Rückfragen in diesem Abschnitt'
            : 'Noch keine Rückfragen'}
        </p>
      ) : (
        <div className="flex flex-col gap-3 overflow-y-auto">
          {filtered.map(a => (
            <AnnotationThread
              key={a.id}
              annotation={a}
              caseId={caseId}
              viewerRole={viewerRole}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function sectionLabel(section: PacketSection): string {
  const labels: Record<PacketSection, string> = {
    BRIEF: 'Fallzusammenfassung',
    FACTS: 'Sachverhalt',
    ANALYSIS: 'KI-Analyse',
    DRAFT: 'Einspruchsentwurf',
    CLIENT_CONTEXT: 'Mandantenangaben',
  }
  return labels[section]
}
