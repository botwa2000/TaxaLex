import { auth } from '@/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  FileText,
  Cpu,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Copy,
  Send,
  Paperclip,
  User,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import {
  DEMO_USER_ID,
  DEMO_CASES,
  DEMO_DOCUMENTS,
  DEMO_AGENT_OUTPUTS,
  DEMO_FINAL_DRAFT,
} from '@/lib/mockData'
import { CaseDetailClient } from './CaseDetailClient'

type CaseDetail = {
  id: string
  useCase: string
  status: string
  deadline: Date | null
  createdAt: Date
  updatedAt: Date
  bescheidData: Record<string, unknown> | null
}

export default async function CaseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await auth()
  const userId = session!.user!.id as string
  const { id } = await params
  const { tab = 'overview' } = await searchParams

  let caseData: CaseDetail | null = null
  let documents: { id: string; name: string; type: string; createdAt: Date }[] = []
  let agentOutputs: { role: string; provider: string; model: string; durationMs: number; summary: string }[] = []
  let finalDraft: string | null = null

  try {
    if (userId === DEMO_USER_ID) throw new Error('demo')
    const { db } = await import('@/lib/db')
    const raw = await db.case.findFirst({
      where: { id, userId },
    })
    if (!raw) notFound()
    caseData = raw as CaseDetail
  } catch (e) {
    const found = DEMO_CASES.find((c) => c.id === id)
    if (!found) notFound()
    caseData = found as CaseDetail
    documents = DEMO_DOCUMENTS[id] ?? []
    agentOutputs = DEMO_AGENT_OUTPUTS[id] ?? []
    finalDraft = agentOutputs.length > 0 ? DEMO_FINAL_DRAFT : null
  }

  if (!caseData) notFound()

  const now = new Date()
  const daysLeft = caseData.deadline ? Math.ceil((caseData.deadline.getTime() - now.getTime()) / 86400000) : null
  const isUrgent = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0
  const isOverdue = daysLeft !== null && daysLeft < 0

  const tabs = [
    { id: 'overview', label: 'Übersicht', icon: MessageSquare },
    { id: 'documents', label: `Dokumente (${documents.length})`, icon: Paperclip },
    { id: 'ai', label: `KI-Analyse (${agentOutputs.length})`, icon: Cpu },
    { id: 'letter', label: 'Einspruch', icon: FileText },
  ]

  return (
    <div>
      {/* Breadcrumb */}
      <Link href="/cases" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-5">
        <ArrowLeft className="w-4 h-4" />
        Zurück zu Meine Fälle
      </Link>

      {/* Case header */}
      <div className="bg-white rounded-xl border border-[var(--border)] p-5 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-[var(--foreground)]">
                {useCaseLabel(caseData.useCase)}
              </h1>
              <StatusBadge status={caseData.status} />
            </div>
            <p className="text-sm text-[var(--muted)]">
              Fall #{caseData.id.slice(-8).toUpperCase()} · Erstellt am{' '}
              {new Date(caseData.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>

            {/* Deadline indicator */}
            {caseData.deadline && (
              <div className={`inline-flex items-center gap-1.5 mt-2 text-xs font-medium px-2.5 py-1 rounded-full ${
                isOverdue ? 'bg-red-50 text-red-700' : isUrgent ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-[var(--muted)]'
              }`}>
                {isOverdue || isUrgent ? <AlertTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                {isOverdue
                  ? 'Einspruchsfrist abgelaufen'
                  : isUrgent
                  ? `Frist läuft in ${daysLeft} Tagen ab — ${new Date(caseData.deadline).toLocaleDateString('de-DE')}`
                  : `Frist: ${new Date(caseData.deadline).toLocaleDateString('de-DE')} (noch ${daysLeft} Tage)`}
              </div>
            )}
          </div>

          {/* Case action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {caseData.status === 'DRAFT_READY' && (
              <>
                <button
                  onClick={() => {}}
                  className="flex items-center gap-1.5 border border-[var(--border)] text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF
                </button>
                <button
                  onClick={() => {}}
                  className="flex items-center gap-1.5 bg-brand-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-brand-700 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Einreichen
                </button>
              </>
            )}
            {caseData.status === 'SUBMITTED' && (
              <span className="flex items-center gap-1.5 bg-green-50 text-green-700 text-sm font-medium px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Eingereicht
              </span>
            )}
          </div>
        </div>

        {/* Bescheid data if available */}
        {caseData.bescheidData && (
          <div className="mt-4 pt-4 border-t border-[var(--border)] grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(caseData.bescheidData as Record<string, unknown>).slice(0, 6).map(([key, val]) => (
              <div key={key}>
                <p className="text-xs text-[var(--muted)]">{fieldLabel(key)}</p>
                <p className="text-sm font-medium text-[var(--foreground)] truncate">
                  {typeof val === 'number' && (key.includes('betrag') || key.includes('zahlung'))
                    ? `${val.toLocaleString('de-DE')} €`
                    : String(val)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 mb-5 bg-white border border-[var(--border)] rounded-xl p-1.5 w-fit">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={`/cases/${caseData!.id}?tab=${t.id}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-brand-600 text-white'
                : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-gray-50'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </Link>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <OverviewTab caseData={caseData} daysLeft={daysLeft} isUrgent={isUrgent} isOverdue={isOverdue} />
      )}
      {tab === 'documents' && (
        <DocumentsTab documents={documents} caseId={caseData.id} />
      )}
      {tab === 'ai' && (
        <AIAnalysisTab outputs={agentOutputs} />
      )}
      {tab === 'letter' && (
        <LetterTab draft={finalDraft} status={caseData.status} />
      )}
    </div>
  )
}

// ── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab({
  caseData,
  daysLeft,
  isUrgent,
  isOverdue,
}: {
  caseData: CaseDetail
  daysLeft: number | null
  isUrgent: boolean
  isOverdue: boolean
}) {
  const timeline = buildTimeline(caseData)

  return (
    <div className="grid sm:grid-cols-3 gap-5">
      {/* Timeline */}
      <div className="sm:col-span-2">
        <div className="bg-white rounded-xl border border-[var(--border)] p-5">
          <h2 className="font-semibold text-sm text-[var(--foreground)] mb-4">Fallverlauf</h2>
          <div className="space-y-4">
            {timeline.map((event, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${event.done ? 'bg-brand-600' : 'bg-gray-100'}`}>
                    <event.icon className={`w-3.5 h-3.5 ${event.done ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  {i < timeline.length - 1 && (
                    <div className={`w-px flex-1 my-1 ${event.done ? 'bg-brand-200' : 'bg-gray-100'}`} />
                  )}
                </div>
                <div className="pb-4">
                  <p className={`text-sm font-medium ${event.done ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>
                    {event.label}
                  </p>
                  {event.date && (
                    <p className="text-xs text-[var(--muted)]">{new Date(event.date).toLocaleDateString('de-DE')}</p>
                  )}
                  {event.note && (
                    <p className="text-xs text-[var(--muted)] mt-0.5">{event.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-[var(--border)] p-4">
          <h2 className="font-semibold text-sm text-[var(--foreground)] mb-3">Aktionen</h2>
          <div className="space-y-2">
            <ActionButton
              icon={FileText}
              label="Einspruch anzeigen"
              href={`/cases/${caseData.id}?tab=letter`}
              disabled={caseData.status === 'QUESTIONS' || caseData.status === 'CREATED'}
            />
            <ActionButton
              icon={Download}
              label="Als PDF herunterladen"
              onClick={() => alert('PDF-Download wird in Kürze verfügbar sein.')}
              disabled={!['DRAFT_READY', 'SUBMITTED', 'AWAITING_RESPONSE', 'CLOSED_SUCCESS'].includes(caseData.status)}
            />
            <ActionButton
              icon={Send}
              label="Als eingereicht markieren"
              onClick={() => alert('Diese Funktion wird mit der Datenbank-Integration verfügbar.')}
              disabled={caseData.status !== 'DRAFT_READY'}
            />
            <ActionButton
              icon={User}
              label="Anwalt hinzuziehen"
              onClick={() => alert('Anwalt-Verbindung ist im Business-Plan verfügbar.')}
              variant="secondary"
            />
          </div>
        </div>

        {caseData.deadline && (
          <div className={`rounded-xl border p-4 ${isOverdue ? 'bg-red-50 border-red-200' : isUrgent ? 'bg-amber-50 border-amber-200' : 'bg-white border-[var(--border)]'}`}>
            <h2 className={`font-semibold text-sm mb-1 ${isOverdue ? 'text-red-800' : isUrgent ? 'text-amber-800' : 'text-[var(--foreground)]'}`}>
              {isOverdue ? '⚠ Frist abgelaufen' : 'Einspruchsfrist'}
            </h2>
            <p className={`text-sm ${isOverdue ? 'text-red-700' : isUrgent ? 'text-amber-700' : 'text-[var(--muted)]'}`}>
              {new Date(caseData.deadline).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
            {daysLeft !== null && !isOverdue && (
              <p className={`text-xs mt-1 font-medium ${isUrgent ? 'text-amber-600' : 'text-[var(--muted)]'}`}>
                Noch {daysLeft} Tage
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ActionButton({
  icon: Icon,
  label,
  href,
  onClick,
  disabled,
  variant = 'primary',
}: {
  icon: React.ElementType
  label: string
  href?: string
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
}) {
  const className = `w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
    disabled
      ? 'opacity-40 cursor-not-allowed text-[var(--muted)]'
      : variant === 'secondary'
      ? 'border border-[var(--border)] text-[var(--foreground)] hover:bg-gray-50'
      : 'border border-[var(--border)] text-[var(--foreground)] hover:bg-gray-50'
  }`

  if (href && !disabled) {
    return (
      <Link href={href} className={className}>
        <Icon className="w-3.5 h-3.5 text-[var(--muted)]" />
        {label}
      </Link>
    )
  }

  return (
    <button onClick={disabled ? undefined : onClick} className={className} disabled={disabled}>
      <Icon className="w-3.5 h-3.5 text-[var(--muted)]" />
      {label}
    </button>
  )
}

// ── Documents Tab ─────────────────────────────────────────────────────────────

function DocumentsTab({
  documents,
  caseId,
}: {
  documents: { id: string; name: string; type: string; createdAt: Date }[]
  caseId: string
}) {
  const docTypeLabels: Record<string, string> = {
    BESCHEID: 'Bescheid',
    BELEG: 'Beleg / Nachweis',
    JAHRESABSCHLUSS: 'Jahresabschluss',
    VOLLMACHT: 'Vollmacht',
    EINSPRUCH_DRAFT: 'Einspruch-Entwurf',
    EINSPRUCH_FINAL: 'Einspruch (final)',
    BEHOERDEN_ANTWORT: 'Behörden-Antwort',
    ADVISOR_NOTES: 'Anwalts-Notizen',
    KORRESPONDENZ: 'Korrespondenz',
  }

  return (
    <div className="bg-white rounded-xl border border-[var(--border)]">
      <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
        <h2 className="font-semibold text-sm text-[var(--foreground)]">Dokumente ({documents.length})</h2>
        <button
          onClick={() => alert('Datei-Upload wird mit der vollständigen DB-Integration verfügbar.')}
          className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <Paperclip className="w-3.5 h-3.5" />
          Dokument hinzufügen
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted)]">
          <Paperclip className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Noch keine Dokumente hochgeladen</p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--border)]">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 px-5 py-3.5">
              <div className="w-8 h-8 bg-gray-50 border border-[var(--border)] rounded-lg flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-[var(--muted)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)] truncate">{doc.name}</p>
                <p className="text-xs text-[var(--muted)]">
                  {docTypeLabels[doc.type] ?? doc.type} · {new Date(doc.createdAt).toLocaleDateString('de-DE')}
                </p>
              </div>
              <button
                onClick={() => alert('Download wird mit der vollständigen Speicher-Integration verfügbar.')}
                className="p-1.5 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── AI Analysis Tab ────────────────────────────────────────────────────────────

function AIAnalysisTab({
  outputs,
}: {
  outputs: { role: string; provider: string; model: string; durationMs: number; summary: string }[]
}) {
  const roleConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
    drafter: { label: 'Drafter', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200', icon: FileText },
    reviewer: { label: 'Reviewer', color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200', icon: CheckCircle2 },
    factchecker: { label: 'Fact-Checker', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200', icon: ExternalLink },
    adversary: { label: 'Adversary', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200', icon: AlertTriangle },
    consolidator: { label: 'Consolidator', color: 'text-brand-700', bgColor: 'bg-brand-50 border-brand-200', icon: Cpu },
  }

  if (outputs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[var(--border)] text-center py-12 text-[var(--muted)]">
        <Cpu className="w-8 h-8 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Noch keine KI-Analyse für diesen Fall</p>
        <p className="text-xs mt-1">Führen Sie zuerst die KI-Generierung durch</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-[var(--border)] px-5 py-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">5-Agenten-Pipeline erfolgreich</p>
            <p className="text-xs text-[var(--muted)]">
              Gesamtdauer: {(outputs.reduce((s, o) => s + o.durationMs, 0) / 1000).toFixed(1)}s ·{' '}
              {outputs.length} von 5 Agenten abgeschlossen
            </p>
          </div>
        </div>
      </div>

      {outputs.map((output, i) => {
        const config = roleConfig[output.role] ?? { label: output.role, color: 'text-gray-700', bgColor: 'bg-gray-50 border-gray-200', icon: Cpu }
        const Icon = config.icon
        return (
          <div key={i} className={`rounded-xl border p-5 ${config.bgColor}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${config.color}`} />
                <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
                <span className="text-xs text-[var(--muted)] bg-white border border-[var(--border)] px-1.5 py-0.5 rounded-full font-mono">
                  {output.model.split('-').slice(0, 2).join('-')}
                </span>
              </div>
              <span className="text-xs text-[var(--muted)]">{(output.durationMs / 1000).toFixed(1)}s</span>
            </div>
            <p className="text-sm text-[var(--foreground)] leading-relaxed">{output.summary}</p>
          </div>
        )
      })}
    </div>
  )
}

// ── Letter Tab ────────────────────────────────────────────────────────────────

function LetterTab({ draft, status }: { draft: string | null; status: string }) {
  if (!draft) {
    return (
      <div className="bg-white rounded-xl border border-[var(--border)] text-center py-12 text-[var(--muted)]">
        <FileText className="w-8 h-8 mx-auto mb-3 opacity-30" />
        <p className="text-sm font-medium">Kein Entwurf vorhanden</p>
        <p className="text-xs mt-1">Starten Sie die KI-Generierung um einen Einspruch zu erstellen</p>
        <Link
          href="/einspruch"
          className="inline-flex items-center gap-1.5 mt-4 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          KI-Generierung starten
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="bg-white rounded-xl border border-[var(--border)] px-5 py-3 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-sm font-semibold text-[var(--foreground)]">Einspruch — finaler Entwurf</p>
          <p className="text-xs text-[var(--muted)]">Von der KI-Pipeline generiert · Bitte vor dem Einreichen prüfen</p>
        </div>
        <CaseDetailClient draft={draft} />
      </div>

      {/* Letter preview */}
      <div className="bg-white rounded-xl border border-[var(--border)] p-6">
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-sm text-[var(--foreground)] leading-relaxed">
            {draft}
          </pre>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 text-xs text-amber-800 leading-relaxed">
        <strong>Hinweis:</strong> Dieser Einspruch wurde von einer KI generiert und stellt keinen Rechtsrat im Sinne des
        Rechtsdienstleistungsgesetzes (RDG) dar. Bitte prüfen Sie den Text vor dem Einreichen. Bei Unsicherheiten
        empfehlen wir die Beratung durch einen Steuerberater oder Rechtsanwalt.
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildTimeline(caseData: CaseDetail) {
  const statusFlow = [
    { status: 'CREATED', label: 'Fall erstellt', icon: CheckCircle2, date: caseData.createdAt },
    { status: 'DRAFT_READY', label: 'Einspruch generiert', icon: Cpu, date: null },
    { status: 'SUBMITTED', label: 'Eingereicht', icon: Send, date: null },
    { status: 'AWAITING_RESPONSE', label: 'Warte auf Bescheid', icon: Clock, date: null },
    { status: 'CLOSED_SUCCESS', label: 'Erfolgreich abgeschlossen', icon: CheckCircle2, date: null },
  ]
  const statusOrder = ['CREATED', 'QUESTIONS', 'GENERATING', 'DRAFT_READY', 'SUBMITTED', 'AWAITING_RESPONSE', 'CLOSED_SUCCESS', 'REJECTED']
  const currentIdx = statusOrder.indexOf(caseData.status)

  return statusFlow.map((s, i) => ({
    ...s,
    done: statusOrder.indexOf(s.status) <= currentIdx,
    note: s.status === caseData.status ? 'Aktueller Status' : undefined,
  }))
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    CREATED: { label: 'Neu', className: 'bg-gray-100 text-gray-600' },
    QUESTIONS: { label: 'Rückfragen', className: 'bg-amber-50 text-amber-700' },
    GENERATING: { label: 'Generierung', className: 'bg-purple-50 text-purple-600' },
    DRAFT_READY: { label: 'Entwurf bereit', className: 'bg-blue-50 text-blue-700' },
    ADVISOR_REVIEW: { label: 'Anwalt prüft', className: 'bg-orange-50 text-orange-700' },
    SUBMITTED: { label: 'Eingereicht', className: 'bg-green-50 text-green-700' },
    AWAITING_RESPONSE: { label: 'Ausstehend', className: 'bg-amber-50 text-amber-700' },
    CLOSED_SUCCESS: { label: 'Erfolgreich', className: 'bg-green-50 text-green-700' },
    REJECTED: { label: 'Abgelehnt', className: 'bg-red-50 text-red-700' },
  }
  const { label, className } = map[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' }
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${className}`}>{label}</span>
}

function useCaseLabel(useCase: string): string {
  const labels: Record<string, string> = {
    tax: 'Steuerbescheid',
    jobcenter: 'Jobcenter / Bürgergeld',
    rente: 'Rentenbescheid',
    bussgeld: 'Bußgeldbescheid',
    bussgeldd: 'Bußgeldbescheid',
    krankenversicherung: 'Krankenversicherung',
    kuendigung: 'Kündigung',
    miete: 'Mieterhöhung / Kaution',
    sonstige: 'Sonstiger Bescheid',
  }
  return labels[useCase] ?? useCase
}

function fieldLabel(key: string): string {
  const labels: Record<string, string> = {
    finanzamt: 'Finanzamt',
    behoerde: 'Behörde',
    kasse: 'Krankenkasse',
    steuernummer: 'Steuernummer',
    bescheidDatum: 'Bescheid-Datum',
    steuerart: 'Steuerart',
    nachzahlung: 'Nachzahlung',
    streitigerBetrag: 'Streitiger Betrag',
    betrag: 'Betrag',
    grund: 'Grund',
  }
  return labels[key] ?? key
}
