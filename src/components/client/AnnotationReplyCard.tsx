'use client'

import { AnnotationThread } from '@/components/advisor/AnnotationThread'
import type { AnnotationData } from '@/types'

interface Props {
  caseId: string
  annotations: AnnotationData[]
  onUpdate: () => void
}

const sectionLabel: Record<string, string> = {
  BRIEF: 'Fallzusammenfassung',
  FACTS: 'Sachverhalt',
  ANALYSIS: 'KI-Analyse',
  DRAFT: 'Einspruchsentwurf',
  CLIENT_CONTEXT: 'Mandantenangaben',
}

export function AnnotationReplyCard({ caseId, annotations, onUpdate }: Props) {
  const open = annotations.filter(a => a.status !== 'RESOLVED')

  if (open.length === 0) return null

  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 p-5 flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
        {open.length} offene Rückfrage{open.length !== 1 ? 'n' : ''} von Ihrem Berater
      </h3>

      {open.map(a => (
        <div key={a.id}>
          <p className="text-xs text-[var(--muted)] mb-1">
            Abschnitt: <strong>{sectionLabel[a.section] ?? a.section}</strong>
            {a.paragraphIndex != null ? ` · Absatz ${a.paragraphIndex + 1}` : ''}
          </p>
          <AnnotationThread
            annotation={a}
            caseId={caseId}
            viewerRole="client"
            onUpdate={onUpdate}
          />
        </div>
      ))}
    </div>
  )
}
