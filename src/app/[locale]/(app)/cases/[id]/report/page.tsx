/**
 * AI Process Report — print-to-PDF page
 *
 * Renders a full transparency document showing the complete AI reasoning chain:
 * what each agent did, which facts were checked, how the letter was assembled.
 * Accessible only to authenticated users who own the case.
 *
 * Print: Ctrl+P or browser print → "Save as PDF". Print styles hide all nav.
 */
import { auth } from '@/auth'
import { notFound } from 'next/navigation'
import { DEMO_USER_ID, DEMO_CASES, DEMO_AGENT_OUTPUTS, DEMO_FINAL_DRAFT } from '@/lib/mockData'
import { brand } from '@/config/brand'

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

// Section in the reporter output detected by ## headings
function renderReporterContent(content: string) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={i} style={{ fontSize: '13px', fontWeight: 700, marginTop: '16px', marginBottom: '6px', color: '#1e1b4b', borderBottom: '1px solid #e0e0e0', paddingBottom: '3px' }}>
          {line.replace(/^## /, '')}
        </h3>
      )
    } else if (line.startsWith('# ')) {
      elements.push(
        <h2 key={i} style={{ fontSize: '15px', fontWeight: 700, marginTop: '20px', marginBottom: '8px', color: '#111' }}>
          {line.replace(/^# /, '')}
        </h2>
      )
    } else if (line.trim()) {
      elements.push(
        <p key={i} style={{ fontSize: '11px', lineHeight: '1.6', marginBottom: '4px', color: '#333' }}>
          {line}
        </p>
      )
    } else {
      elements.push(<div key={i} style={{ height: '6px' }} />)
    }
    i++
  }
  return elements
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const session = await auth()
  const userId = session!.user!.id as string
  const { id, locale: _locale } = await params

  let caseData: CaseRow | null = null
  let outputs: OutputRow[] = []
  let finalDraft: string | null = null

  try {
    if (userId === DEMO_USER_ID) throw new Error('demo')
    const { db } = await import('@/lib/db')
    const raw = await db.case.findFirst({
      where: { id, userId },
      select: {
        id: true, useCase: true, status: true, createdAt: true,
        bescheidData: true, userAnswers: true, questionProposals: true, userContext: true,
      },
    })
    if (!raw) notFound()
    caseData = raw as CaseRow

    const dbOutputs = await db.caseOutput.findMany({
      where: { caseId: id },
      select: { role: true, provider: true, model: true, durationMs: true, content: true, isFinal: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })
    outputs = dbOutputs as OutputRow[]
    const finalOutput = dbOutputs.find((o) => o.isFinal) ?? dbOutputs.find((o) => o.role === 'consolidator')
    finalDraft = finalOutput?.content ?? null
  } catch {
    const found = DEMO_CASES.find((c) => c.id === id)
    if (!found) notFound()
    caseData = { ...(found as unknown as CaseRow), userContext: null }
    const demoOutputs = (DEMO_AGENT_OUTPUTS[id] ?? []) as unknown as OutputRow[]
    outputs = demoOutputs
    finalDraft = demoOutputs.length > 0 ? DEMO_FINAL_DRAFT : null
  }

  if (!caseData) notFound()

  const reporterOutput = outputs.find((o) => o.role === 'reporter')
  const questionOutputs = outputs.filter((o) => o.role.startsWith('question-'))
  const pipelineOutputs = outputs.filter((o) => !o.role.startsWith('question-') && o.role !== 'reporter')
  const generatedAt = new Date()

  return (
    <html lang="de">
      <head>
        <meta charSet="utf-8" />
        <title>{brand.name} — KI-Prozessbericht #{caseData.id.slice(-8).toUpperCase()}</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #111; background: #fff; }
          .page { max-width: 800px; margin: 0 auto; padding: 32px 40px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #4f46e5; }
          .header-brand { font-size: 18px; font-weight: 700; color: #4f46e5; }
          .header-meta { text-align: right; font-size: 10px; color: #555; }
          .section { margin-bottom: 28px; }
          .section-title { font-size: 14px; font-weight: 700; color: #1e1b4b; background: #eef2ff; padding: 6px 12px; margin-bottom: 12px; border-left: 4px solid #4f46e5; }
          .agent-block { border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 12px; overflow: hidden; }
          .agent-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
          .agent-label { font-size: 11px; font-weight: 600; color: #374151; }
          .agent-meta { font-size: 10px; color: #6b7280; }
          .agent-content { padding: 10px 12px; font-size: 10.5px; line-height: 1.6; white-space: pre-wrap; word-break: break-word; color: #333; }
          .kv-table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
          .kv-table td { padding: 4px 8px; border: 1px solid #e5e7eb; vertical-align: top; }
          .kv-table td:first-child { font-weight: 600; width: 35%; background: #f9fafb; }
          .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 9.5px; color: #6b7280; text-align: center; }
          @media print {
            nav, header, .no-print { display: none !important; }
            @page { size: A4; margin: 1.8cm 2cm; }
            body { font-size: 10px; }
            .page { padding: 0; max-width: none; }
            .agent-block { break-inside: avoid; }
          }
        `}</style>
      </head>
      <body>
        <div className="page">
          {/* ── Header ── */}
          <div className="header">
            <div>
              <div className="header-brand">{brand.name}</div>
              <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>KI-Prozessbericht / AI Process Report</div>
            </div>
            <div className="header-meta">
              <div>Fall #{caseData.id.slice(-8).toUpperCase()}</div>
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
            <div className="section">
              <div className="section-title">Analyse-Narrativ (Reporter)</div>
              <div style={{ fontSize: '11px', lineHeight: '1.7', color: '#222' }}>
                {renderReporterContent(reporterOutput.content)}
              </div>
            </div>
          )}

          {/* ── Document fields extracted ── */}
          {caseData.bescheidData && Object.keys(caseData.bescheidData).length > 0 && (
            <div className="section">
              <div className="section-title">Anhang A — Extrahierte Dokumentdaten</div>
              {caseData.userContext && (
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px', padding: '8px 12px', marginBottom: '10px', fontSize: '10.5px', color: '#0c4a6e' }}>
                  <strong>Kontext des Antragstellers:</strong> {caseData.userContext}
                </div>
              )}
              <table className="kv-table">
                <tbody>
                  {Object.entries(caseData.bescheidData).map(([k, v]) => (
                    <tr key={k}>
                      <td>{k}</td>
                      <td>{String(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── User answers ── */}
          {caseData.userAnswers && Object.keys(caseData.userAnswers).length > 0 && (
            <div className="section">
              <div className="section-title">Anhang B — Antworten des Nutzers</div>
              <table className="kv-table">
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
            <div className="section">
              <div className="section-title">Anhang C — Fragenentwicklung</div>
              {questionOutputs.map((o, i) => (
                <div key={i} className="agent-block">
                  <div className="agent-header">
                    <span className="agent-label">{ROLE_LABELS[o.role] ?? o.role}</span>
                    <span className="agent-meta">{o.provider} · {o.model} · {(o.durationMs / 1000).toFixed(1)}s</span>
                  </div>
                  <div className="agent-content">{o.content}</div>
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
            <div className="section">
              <div className="section-title">Anhang D — KI-Agenten-Pipeline</div>
              {pipelineOutputs.map((o, i) => (
                <div key={i} className="agent-block">
                  <div className="agent-header">
                    <span className="agent-label">{ROLE_LABELS[o.role] ?? o.role}</span>
                    <span className="agent-meta">{o.provider} · {o.model} · {(o.durationMs / 1000).toFixed(1)}s · {o.isFinal ? 'Final' : ''}</span>
                  </div>
                  <div className="agent-content">{o.content}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── Final draft ── */}
          {finalDraft && (
            <div className="section">
              <div className="section-title">Anhang E — Generierter Einspruch</div>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px 14px', fontSize: '10.5px', lineHeight: '1.7', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#111', fontFamily: 'Arial, sans-serif' }}>
                {finalDraft}
              </div>
            </div>
          )}

          {/* ── Footer ── */}
          <div className="footer">
            <p>{brand.name} · Kein Rechtsrat i.S.d. RDG · Bericht generiert: {generatedAt.toISOString()}</p>
            <p style={{ marginTop: '4px' }}>Zum Drucken: Datei → Drucken → Als PDF speichern · Papierformat A4 empfohlen</p>
          </div>
        </div>
      </body>
    </html>
  )
}
