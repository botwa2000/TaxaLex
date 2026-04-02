'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui/Textarea'
import { CheckCircle2, Lightbulb, MessageSquare } from 'lucide-react'
import type { AnnotationData, AnnotationStatus } from '@/types'

const statusVariant: Record<AnnotationStatus, 'warning' | 'info' | 'success'> = {
  OPEN: 'warning',
  ANSWERED: 'info',
  RESOLVED: 'success',
}

const statusLabel: Record<AnnotationStatus, string> = {
  OPEN: 'Offen',
  ANSWERED: 'Beantwortet',
  RESOLVED: 'Geklärt',
}

interface Props {
  annotation: AnnotationData
  caseId: string
  /** 'advisor' = can resolve; 'client' = can reply */
  viewerRole: 'advisor' | 'client'
  onUpdate?: () => void
}

export function AnnotationThread({ annotation, caseId, viewerRole, onUpdate }: Props) {
  const [replyText, setReplyText] = useState('')
  const [showReply, setShowReply] = useState(false)
  const [isPending, startTransition] = useTransition()

  const submit = (action: 'reply' | 'resolve', content?: string) => {
    startTransition(async () => {
      const body = action === 'reply' ? { action, content } : { action }
      await fetch(`/api/case/${caseId}/annotations/${annotation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      setShowReply(false)
      setReplyText('')
      onUpdate?.()
    })
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-[var(--muted)]">
          {annotation.author.name ?? 'Berater'} · {new Date(annotation.createdAt).toLocaleDateString('de-DE')}
        </span>
        <Badge variant={statusVariant[annotation.status]} size="sm">
          {statusLabel[annotation.status]}
        </Badge>
      </div>

      {/* Annotation content */}
      <div className="flex gap-2">
        <MessageSquare size={15} className="text-brand-500 mt-0.5 shrink-0" />
        <p className="text-sm text-[var(--foreground)] leading-relaxed">{annotation.content}</p>
      </div>

      {/* AI pre-fill */}
      {annotation.aiPreFilled && annotation.aiPreFillText && (
        <div className="rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-3 flex gap-2">
          <Lightbulb size={14} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">
              KI-Vorschlag aus Ihren Unterlagen:
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300">{annotation.aiPreFillText}</p>
          </div>
        </div>
      )}

      {/* Client reply */}
      {annotation.replyContent && (
        <div className="ml-4 border-l-2 border-brand-200 dark:border-brand-800 pl-3">
          <p className="text-xs text-[var(--muted)] mb-1">
            Ihre Antwort · {annotation.repliedAt ? new Date(annotation.repliedAt).toLocaleDateString('de-DE') : ''}
          </p>
          <p className="text-sm text-[var(--foreground)]">{annotation.replyContent}</p>
        </div>
      )}

      {/* Actions */}
      {annotation.status !== 'RESOLVED' && (
        <div className="flex gap-2 flex-wrap">
          {viewerRole === 'client' && !annotation.replyContent && (
            <>
              {!showReply ? (
                <Button variant="secondary" size="sm" onClick={() => setShowReply(true)}>
                  Antworten
                </Button>
              ) : (
                <div className="w-full flex flex-col gap-2">
                  <Textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Ihre Antwort..."
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      loading={isPending}
                      disabled={replyText.trim().length < 1}
                      onClick={() => submit('reply', replyText)}
                    >
                      Antwort senden
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowReply(false)}>
                      Abbrechen
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {viewerRole === 'advisor' && annotation.status === 'ANSWERED' && (
            <Button
              variant="ghost"
              size="sm"
              loading={isPending}
              icon={<CheckCircle2 size={14} />}
              onClick={() => submit('resolve')}
            >
              Als geklärt markieren
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
