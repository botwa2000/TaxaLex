'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Alert } from '@/components/ui/Alert'
import { ShieldCheck, UserCheck } from 'lucide-react'

interface Advisor {
  id: string
  name: string | null
  email: string
  role: string
  activeAssignments: number
}

interface Props {
  caseId: string
}

export function HandoffRequestForm({ caseId }: Props) {
  const [advisors, setAdvisors] = useState<Advisor[]>([])
  const [advisorId, setAdvisorId] = useState('')
  const [scope, setScope] = useState<'REVIEW_ONLY' | 'FULL_REPRESENTATION'>('REVIEW_ONLY')
  const [clientNotes, setClientNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => {
    fetch('/api/advisors')
      .then(r => r.json())
      .then(setAdvisors)
      .catch(() => setAdvisors([]))
  }, [])

  const submit = () => {
    if (!advisorId) return
    setError(null)

    startTransition(async () => {
      const res = await fetch(`/api/case/${caseId}/handoff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ advisorId, scope, clientNotes: clientNotes || undefined }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Anfrage fehlgeschlagen')
        return
      }

      router.refresh()
    })
  }

  const advisorOptions = advisors.map(a => ({
    value: a.id,
    label: `${a.name ?? a.email} (${a.role === 'LAWYER' ? 'Rechtsanwalt' : 'Steuerberater'}) · ${a.activeAssignments} aktive Fälle`,
  }))

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-950 flex items-center justify-center">
          <UserCheck size={20} className="text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-[var(--foreground)]">Professionelle Prüfung anfragen</h3>
          <p className="text-sm text-[var(--muted)]">Ein Berater prüft Ihren Einspruchsentwurf</p>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
            Berater auswählen <span className="text-red-500">*</span>
          </label>
          <Select
            value={advisorId}
            onChange={e => setAdvisorId(e.target.value)}
            options={[
              { value: '', label: 'Berater auswählen...' },
              ...advisorOptions,
            ]}
          />
        </div>

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
            Hinweise für den Berater (optional)
          </label>
          <Textarea
            value={clientNotes}
            onChange={e => setClientNotes(e.target.value)}
            placeholder="Z. B. besondere Umstände, Prioritäten, Fragen an den Berater..."
            rows={3}
            maxLength={1000}
          />
        </div>

        <div className="flex items-start gap-2 text-xs text-[var(--muted)] bg-[var(--background-subtle)] rounded-lg p-3">
          <ShieldCheck size={14} className="text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
          <span>
            Alle Dokumente werden verschlüsselt übertragen. Der Berater sieht nur die für diesen Fall relevanten Unterlagen.
          </span>
        </div>
      </div>

      <Button
        onClick={submit}
        loading={isPending}
        disabled={!advisorId}
        className="w-full"
      >
        Prüfung anfragen
      </Button>
    </div>
  )
}
