import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { features } from '@/config/features'
import { CaseCard } from '@/components/advisor/CaseCard'
import { Clock, CheckCircle2, MessageSquare, LayoutDashboard, Info } from 'lucide-react'
import type { ViabilityScore, AdvisorAssignmentStatus } from '@/types'

type AssignmentRow = {
  id: string
  status: AdvisorAssignmentStatus
  scope: string
  createdAt: Date
  acceptedAt: Date | null
  case: {
    id: string
    useCase: string
    deadline: Date | null
    viabilityScore: string | null
    viabilitySummary: string | null
    handoffPacket: { briefSummary: string; extractedFacts: Record<string, unknown> } | null
    _count: { annotations: number }
  }
}

export default async function AdvisorDashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')
  if (!['ADVISOR', 'LAWYER', 'EXPERT', 'ADMIN'].includes(session.user?.role ?? '')) {
    redirect('/dashboard')
  }

  const isLawyer = ['LAWYER', 'EXPERT'].includes(session.user?.role ?? '')
  const advisorId = session.user!.id as string

  let assignments: AssignmentRow[] = []
  let stats = { pending: 0, accepted: 0, finalized: 0, openAnnotations: 0 }

  if (features.advisorModule) {
    try {
      const raw = await db.advisorAssignment.findMany({
        where: { advisorId },
        include: {
          case: {
            select: {
              id: true,
              useCase: true,
              deadline: true,
              viabilityScore: true,
              viabilitySummary: true,
              handoffPacket: {
                select: { briefSummary: true, extractedFacts: true },
              },
              _count: {
                select: {
                  annotations: { where: { status: { in: ['OPEN', 'ANSWERED'] } } },
                },
              },
            },
          },
        },
        orderBy: [{ case: { deadline: 'asc' } }, { createdAt: 'desc' }],
      })

      assignments = raw as AssignmentRow[]
      stats = {
        pending: assignments.filter(a => a.status === 'PENDING').length,
        accepted: assignments.filter(a => a.status === 'ACCEPTED' || a.status === 'CHANGES_REQUESTED').length,
        finalized: assignments.filter(a => a.status === 'FINALIZED' || a.status === 'APPROVED').length,
        openAnnotations: assignments.reduce((sum, a) => sum + a.case._count.annotations, 0),
      }
    } catch {
      // DB unavailable — show empty state
    }
  }

  const pending = assignments.filter(a => a.status === 'PENDING')
  const active = assignments.filter(a => ['ACCEPTED', 'CHANGES_REQUESTED'].includes(a.status))
  const done = assignments.filter(a => ['APPROVED', 'FINALIZED', 'DECLINED', 'SUPERSEDED', 'WITHDRAWN', 'EXPIRED'].includes(a.status))

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <div className="w-8 h-8 bg-brand-100 dark:bg-brand-950 rounded-lg flex items-center justify-center">
          <LayoutDashboard className="w-4 h-4 text-brand-700 dark:text-brand-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            {isLawyer ? 'Anwalt-Dashboard' : 'Berater-Dashboard'}
          </h1>
          <p className="text-sm text-[var(--muted)]">Willkommen, {session.user?.name}</p>
        </div>
      </div>

      {!features.advisorModule && (
        <div className="bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900 rounded-xl p-4 mb-6 flex gap-3">
          <Info className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
          <p className="text-sm text-brand-800 dark:text-brand-200">
            Das Beratungsmodul ist noch nicht aktiviert. Setzen Sie <code className="font-mono text-xs bg-brand-100 dark:bg-brand-900 px-1 rounded">FEATURE_ADVISOR=true</code> in der Konfiguration.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Clock, label: 'Entscheidung nötig', value: stats.pending, color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600' },
          { icon: MessageSquare, label: 'In Prüfung', value: stats.accepted, color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600' },
          { icon: CheckCircle2, label: 'Abgeschlossen', value: stats.finalized, color: 'bg-green-50 dark:bg-green-950/40 text-green-600' },
          { icon: MessageSquare, label: 'Offene Rückfragen', value: stats.openAnnotations, color: 'bg-red-50 dark:bg-red-950/40 text-red-600' },
        ].map((s) => (
          <div key={s.label} className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4">
            <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">{s.value}</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending — needs decision */}
      {pending.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            Entscheidung erforderlich ({pending.length})
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pending.map(a => (
              <CaseCard
                key={a.id}
                assignmentId={a.id}
                caseId={a.case.id}
                status={a.status}
                briefSummary={a.case.handoffPacket?.briefSummary ?? null}
                viabilityScore={(a.case.viabilityScore as ViabilityScore) ?? null}
                viabilitySummary={a.case.viabilitySummary}
                deadline={a.case.deadline?.toISOString() ?? null}
                openAnnotations={a.case._count.annotations}
                amountDisputed={extractAmount(a.case.handoffPacket?.extractedFacts)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Active — in review */}
      {active.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            In Prüfung ({active.length})
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {active.map(a => (
              <CaseCard
                key={a.id}
                assignmentId={a.id}
                caseId={a.case.id}
                status={a.status}
                briefSummary={a.case.handoffPacket?.briefSummary ?? null}
                viabilityScore={(a.case.viabilityScore as ViabilityScore) ?? null}
                viabilitySummary={a.case.viabilitySummary}
                deadline={a.case.deadline?.toISOString() ?? null}
                openAnnotations={a.case._count.annotations}
                amountDisputed={extractAmount(a.case.handoffPacket?.extractedFacts)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Done */}
      {done.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            Abgeschlossen ({done.length})
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {done.map(a => (
              <CaseCard
                key={a.id}
                assignmentId={a.id}
                caseId={a.case.id}
                status={a.status}
                briefSummary={a.case.handoffPacket?.briefSummary ?? null}
                viabilityScore={(a.case.viabilityScore as ViabilityScore) ?? null}
                viabilitySummary={a.case.viabilitySummary}
                deadline={a.case.deadline?.toISOString() ?? null}
                openAnnotations={0}
                amountDisputed={extractAmount(a.case.handoffPacket?.extractedFacts)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {features.advisorModule && assignments.length === 0 && (
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] text-center py-16 text-[var(--muted)]">
          <LayoutDashboard className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-sm">Noch keine Fälle zugewiesen</p>
          <p className="text-xs mt-1">
            Mandanten können Sie über ihre Fall-Ansicht als Berater einladen.
          </p>
        </div>
      )}
    </div>
  )
}

function extractAmount(facts: Record<string, unknown> | null | undefined): number | null {
  if (!facts) return null
  const v = facts.amountDisputed
  return typeof v === 'number' ? v : null
}
