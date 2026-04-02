'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Modal } from '@/components/ui/Modal'
import { AlertTriangle } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  caseId: string
}

export function DeclineModal({ open, onClose, caseId }: Props) {
  const [reason, setReason] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const decline = () => {
    if (reason.trim().length < 10) return

    startTransition(async () => {
      const res = await fetch(`/api/advisor/cases/${caseId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline', declineReason: reason }),
      })

      if (res.ok) {
        onClose()
        router.push('../')
        router.refresh()
      }
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="Fall ablehnen">
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
          <AlertTriangle size={18} className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">
            Der Mandant wird benachrichtigt. Der Fall wird wieder auf &quot;Entwurf fertig&quot; zurückgesetzt
            und kann einem anderen Berater zugewiesen werden.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
            Begründung der Ablehnung <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Bitte geben Sie einen Grund an, z. B. Fachgebiet nicht zutreffend, Frist zu knapp, etc."
            rows={4}
            minLength={10}
            maxLength={500}
          />
          <p className="text-xs text-[var(--muted)] mt-1">{reason.length}/500 Zeichen (min. 10)</p>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Abbrechen
          </Button>
          <Button
            variant="danger"
            loading={isPending}
            disabled={reason.trim().length < 10}
            onClick={decline}
          >
            Ablehnen bestätigen
          </Button>
        </div>
      </div>
    </Modal>
  )
}
