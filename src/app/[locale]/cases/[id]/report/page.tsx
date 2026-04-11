/**
 * AI Process Report — print-to-PDF page
 *
 * Lives OUTSIDE the (app) route group intentionally: gets the clean root locale
 * layout (html/body/providers only) without the sidebar/header.
 *
 * Usage: open in browser → Ctrl+P or click "Print" → Save as PDF (A4).
 */
import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { DEMO_USER_ID, DEMO_CASES, DEMO_AGENT_OUTPUTS, DEMO_FINAL_DRAFT } from '@/lib/mockData'
import { brand } from '@/config/brand'
import { PrintButton } from './PrintButton'
import styles from './report.module.css'

type OutputRow = {
  role: string
  provider: string
  model: string
  durationMs: number
  content: string
  isFinal: boolean
  createdAt: Date
}

type CaseRow = {
  id: string
  useCase: string
  status: string
  createdAt: Date
  bescheidData: Record<string, unknown> | null
  userAnswers: Record<string, string> | null
  questionProposals: Record<string, unknown> | null
  userContext: string | null
}

const ROLE_LABELS: Record<string, string> = {
  drafter: 'Drafter — Argument Skeleton',
  reviewer: 'Reviewer — Legal Analysis',
  factchecker: 'Fact-Checker — Factual Verification',
  adversary: 'Adversary — Counter-Arguments',
  'adversary-final': 'Final Adversary Review',
  consolidator: 'Consolidator — Letter Assembly',
  reporter: 'Reporter — Analysis Narrative',
  'question-proposer-reviewer': 'Question Proposer (Legal)',
  'question-proposer-factchecker': 'Question Proposer (Facts)',
  'question-proposer-adversary': 'Question Proposer (Authority)',
  'question-consolidator': 'Question Consolidator',
}

function renderReporterContent(content: string) {
  return content.split('\n').map((line, i) => {
    if (line.startsWith('## ')) {
      return (
        <h3 key={i} style={{ fontSize: '13px', fontWeight: 700, marginTop: '16px', marginBottom: '6px', color: '#1e1b4b', borderBottom: '1px solid #e0e0e0', paddingBottom: '3px' }}>
          {line.replace(/^## /, '')}
        </h3>
      )
    }
    if (line.startsWith('# ')) {
      return (
        <h2 key={i} style={{ fontSize: '15px', fontWeight: 700, marginTop: '20px', marginBottom: '8px', color: '#111' }}>
          {line.replace(/^# /, '')}
        </h2>
      )
    }
    if (line.trim()) {
      return (
        <p key={i} style={{ fontSize: '11px', lineHeight: '1.6', marginBottom: '4px', color: '#333' }}>
          {line}
        </p>
      )
    }
    return <div key={i} style={{ height: '6px' }} />
  })
}

function safeStringify(v: unknown): string {
  if (v === null || v === undefined) return ''
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return JSON.stringify(v)
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const session = await auth()
  // Auth check OUTSIDE try/catch so notFound() propagates correctly
  if (!session?.user?.id) notFound()
  const userId = session.user.id as string
  const { id } = await params

  let caseData: CaseRow | null = null
  let outputs: OutputRow[] = []
  let finalDraft: string | null = null

  try {
    if (userId !== DEMO_USER_ID) {
      const { db } = await import('@/lib/db')
      const raw = await db.case.findFirst({
        where: { id, userId },
        select: {
          id: true, useCase: true, status: true, createdAt: true,
          bescheidData: true, userAnswers: true, questionProposals: true, userContext: true,
        },
      })
      if (raw) {
        caseData = raw as CaseRow
        const dbOutputs = await db.caseOutput.findMany({
          where: { caseId: id },
          select: { role: true, provider: true, model: true, durationMs: true, content: true, isFinal: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
        })
        outputs = dbOutputs as OutputRow[]
        const finalOutput = dbOutputs.find((o) => o.isFinal) ?? dbOutputs.find((o) => o.role === 'consolidator')
        finalDraft = finalOutput?.content ?? null
      }
    }
  } catch {
    // DB error — fall through to demo fallback
  }

  // Case not found in DB (or demo user): try demo data
  if (!caseData) {
    const found = DEMO_CASES.find((c) => c.id === id)
    if (!found) notFound()  // NOT inside try/catch — propagates correctly
    caseData = { ...(found as unknown as CaseRow), userContext: null }
    const demoOutputs = (DEMO_AGENT_OUTPUTS[id] ?? []) as unknown as OutputRow[]
    outputs = demoOutputs
    finalDraft = demoOutputs.length > 0 ? DEMO_FINAL_DRAFT : null
  }

  const reporterOutput = outputs.find((o) => o.role === 'reporter')
  const questionOutputs = outputs.filter((o) => o.role.startsWith('question-'))
  const pipelineOutputs = outputs.filter((o) => !o.role.startsWith('question-') && o.role !== 'reporter')
  const generatedAt = new Date()
  const caseRef = caseData.id.slice(-8).toUpperCase()

  return (
    <div className={styles.root}>
      {/* Toolbar — hidden in print */}
      <div className={styles.toolbar}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
          {brand.name} — KI-Prozessbericht #{caseRef}
        </span>
        <PrintButton label="Drucken / Als PDF speichern" />
      </div>

      <div className={styles.page}>
        {/* ── Header ── */}
        <div className={styles.header}>
          <div>
            <div className={styles.brand}>{brand.name}</div>
            <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>KI-Prozessbericht / AI Process Report</div>
          </div>
          <div className={styles.meta}>
            <div>Fall #{caseRef}</div>
            <div>Erstellt: {caseData.createdAt.toLocaleDateString('de-DE')}</div>
            <div>Bericht generiert: {generatedAt.toLocaleString('de-DE')}</div>
            <div>Anwendungsfall: {caseData.useCase}</div>
          </div>
        </div>

        {/* ── Confidentiality notice ── */}
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '6px', padding: '8px 12px', marginBottom: '20px', fontSize: '10px', color: '#78350f' }}>
          <strong>Vertraulich</strong> — Dieser Bericht dokumentiert den KI-Denkprozess und dient der Transparenz. Er stellt keine Rechtsberatung dar.
        </div>

        {/* ── Reporter narrative ── */}
        {reporterOutput && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Analyse-Narrativ (Reporter)</div>
            <div style={{ fontSize: '11px', lineHeight: '1.7', color: '#222' }}>
              {renderReporterContent(reporterOutput.content)}
            </div>
          </div>
        )}

        {/* ── Document fields extracted ── */}
        {caseData.bescheidData && Object.keys(caseData.bescheidData).length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Anhang A — Extrahierte Dokumentdaten</div>
            {caseData.userContext && (
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px', padding: '8px 12px', marginBottom: '10px', fontSize: '10.5px', color: '#0c4a6e' }}>
                <strong>Kontext des Antragstellers:</strong> {caseData.userContext}
              </div>
            )}
            <table className={styles.kvTable}>
              <tbody>
                {Object.entries(caseData.bescheidData).map(([k, v]) => (
                  <tr key={k}>
                    <td>{k}</td>
                    <td>{safeStringify(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── User answers ── */}
        {caseData.userAnswers && Object.keys(caseData.userAnswers).length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Anhang B — Antworten des Nutzers</div>
            <table className={styles.kvTable}>
              <tbody>
                {Object.entries(caseData.userAnswers).map(([k, v]) => (
                  <tr key={k}>
                    <td>{k}</td>
                    <td>{v || '(keine Antwort)'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Question development ── */}
        {questionOutputs.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Anhang C — Fragenentwicklung</div>
            {questionOutputs.map((o, i) => (
              <div key={i} className={styles.agentBlock}>
                <div className={styles.agentHeader}>
                  <span className={styles.agentLabel}>{ROLE_LABELS[o.role] ?? o.role}</span>
                  <span className={styles.agentMeta}>{o.provider} · {o.model} · {(o.durationMs / 1000).toFixed(1)}s</span>
                </div>
                <div className={styles.agentContent}>{o.content}</div>
              </div>
            ))}
            {caseData.questionProposals && (
              <div style={{ marginTop: '8px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '10px 12px', fontSize: '10.5px' }}>
                <strong>Konsolidierungs-Begründung:</strong>
                <pre style={{ marginTop: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '10px', color: '#555' }}>
                  {JSON.stringify(caseData.questionProposals, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* ── Pipeline agents ── */}
        {pipelineOutputs.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Anhang D — KI-Agenten-Pipeline</div>
            {pipelineOutputs.map((o, i) => (
              <div key={i} className={styles.agentBlock}>
                <div className={styles.agentHeader}>
                  <span className={styles.agentLabel}>{ROLE_LABELS[o.role] ?? o.role}</span>
                  <span className={styles.agentMeta}>{o.provider} · {o.model} · {(o.durationMs / 1000).toFixed(1)}s{o.isFinal ? ' · Final' : ''}</span>
                </div>
                <div className={styles.agentContent}>{o.content}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Final draft ── */}
        {finalDraft && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Anhang E — Generierter Einspruch</div>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px 14px', fontSize: '10.5px', lineHeight: '1.7', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#111', fontFamily: 'Arial, sans-serif' }}>
              {finalDraft}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className={styles.footer}>
          <p>{brand.name} · Kein Rechtsrat i.S.d. RDG · Bericht generiert: {generatedAt.toISOString()}</p>
          <p style={{ marginTop: '4px' }}>Zum Drucken: Datei → Drucken → Als PDF speichern · Papierformat A4 empfohlen</p>
        </div>
      </div>
    </div>
  )
}
