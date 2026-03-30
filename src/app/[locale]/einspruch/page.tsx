'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Upload, MessageSquare, Brain, FileCheck, Loader2, ArrowLeft, ArrowRight,
  X, CheckCircle2, FileText, Copy, Download, AlertCircle, ScanSearch, Tag,
  ShieldCheck, Globe, Lock, Sparkles,
} from 'lucide-react'
import { Logo } from '@/components/Logo'

type Step = 'upload' | 'analyzing' | 'questions' | 'generating' | 'result'

const STEPS = [
  { id: 'upload',    label: 'Hochladen',   icon: Upload },
  { id: 'analyzing', label: 'Erkennung',   icon: ScanSearch },
  { id: 'questions', label: 'Fragen',      icon: MessageSquare },
  { id: 'generating',label: 'Generierung', icon: Brain },
  { id: 'result',    label: 'Ergebnis',    icon: FileCheck },
] as const

const AGENTS = [
  { id: 'drafter',      label: 'Einspruch formulieren',      detail: 'Erstellt rechtssicheren Einspruch basierend auf erkannten Bescheid-Daten', provider: 'Claude',      color: 'bg-blue-500'   },
  { id: 'reviewer',     label: 'Fehler- & Stilprüfung',      detail: 'Prüft Grammatik, Formulierungen und formale Anforderungen',               provider: 'Gemini',      color: 'bg-purple-500' },
  { id: 'factchecker',  label: 'Rechts-Faktencheck',         detail: 'Recherchiert aktuelle BFH-Urteile und Verwaltungsrichtlinien',             provider: 'Perplexity',  color: 'bg-green-500'  },
  { id: 'adversary',    label: 'Gegenprüfung (Behördensicht)',detail: 'Simuliert die Perspektive des Finanzamts / der Behörde',                  provider: 'Claude',      color: 'bg-red-500'    },
  { id: 'consolidator', label: 'Finales Schreiben',           detail: 'Kombiniert alle Perspektiven zum optimalen Einspruch',                    provider: 'Claude',      color: 'bg-brand-500'  },
] as const

const AGENT_VERDICTS: Record<string, string> = {
  drafter:     '§§ 9, 33 EStG · BMF-Schreiben 2023',
  reviewer:    'Keine formalen Fehler',
  factchecker: 'BFH VI R 32/13 bestätigt',
  adversary:   '1 Argument gestärkt',
  consolidator:'§ 361 AO Aussetzung ergänzt',
}

const DETECTION_ITEMS = [
  { label: 'Bescheid-Typ erkannt', value: 'Einkommensteuerbescheid 2022',  pill: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'     },
  { label: 'Ausstellende Behörde', value: 'Finanzamt München-Nord',        pill: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'},
  { label: 'Bescheiddatum',        value: '15. März 2024',                 pill: 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300'          },
  { label: 'Steuernummer',         value: '143/567/89012',                 pill: 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300'          },
  { label: 'Festgesetzte Steuer',  value: '8.742,00 €',                    pill: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300'},
  { label: 'Einspruchsfrist',      value: '15. April 2024 · 30 Tage',     pill: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'           },
  { label: 'Einspruchsgründe',     value: '3 mögliche Gründe gefunden',   pill: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300'   },
]

const DOC_LINE_WIDTHS = [72, 88, 55, 80, 63, 48, 75, 90, 60, 70]

const DEMO_BESCHEID_DATA: Record<string, string> = {
  'Bescheid-Typ':    'Einkommensteuerbescheid 2022',
  'Behörde':         'Finanzamt München-Nord',
  'Datum':           '15. März 2024',
  'Steuernummer':    '143/567/89012',
  'Festges. Steuer': '8.742,00 €',
  'Einspruchsfrist': '15. April 2024',
}

const DEMO_QUESTIONS: Array<{ id: string; question: string; required?: boolean }> = [
  { id: 'q1', question: 'Welche Ausgaben wurden abgelehnt oder nicht berücksichtigt?', required: true  },
  { id: 'q2', question: 'Haben Sie Belege für die strittigen Positionen vorliegen?',   required: false },
  { id: 'q3', question: 'Gibt es besondere Umstände (z. B. Krankheit, Umzug, Homeoffice)?', required: false },
]

const DEMO_RESULT = {
  outputs: [
    { role: 'drafter',      provider: 'Anthropic',  model: 'claude-sonnet-4-6' },
    { role: 'reviewer',     provider: 'Google',      model: 'gemini-1.5-pro'    },
    { role: 'factchecker',  provider: 'Perplexity',  model: 'sonar-pro'         },
    { role: 'adversary',    provider: 'Anthropic',   model: 'claude-sonnet-4-6' },
    { role: 'consolidator', provider: 'Anthropic',   model: 'claude-sonnet-4-6' },
  ],
  finalDraft: `Max Mustermann
Musterstraße 1
80331 München

Finanzamt München-Nord
Demollstraße 11
80637 München

München, 20. März 2024

Einspruch gegen Einkommensteuerbescheid 2022
Steuernummer: 143/567/89012
Bescheid vom: 15. März 2024

Sehr geehrte Damen und Herren,

hiermit lege ich fristgerecht Einspruch gegen den oben genannten Bescheid ein
und beantrage dessen Aufhebung bzw. Änderung zu meinen Gunsten.

I. SACHVERHALT

Der Bescheid vom 15. März 2024 setzt die Einkommensteuer für das Veranlagungs-
jahr 2022 auf 8.742,00 € fest. Gegen diese Festsetzung wende ich mich aus den
nachfolgend dargelegten Gründen.

II. BEGRÜNDUNG

1. Nicht berücksichtigte Werbungskosten (§ 9 EStG)

Das Finanzamt hat die geltend gemachten Werbungskosten in Höhe von 2.340,00 €
nicht vollständig anerkannt. Gemäß § 9 Abs. 1 Satz 1 EStG sind Werbungskosten
alle Aufwendungen zur Erwerbung, Sicherung und Erhaltung der Einnahmen. Die
Fahrtkosten (§ 9 Abs. 1 Nr. 1 EStG) und Arbeitsmittel (§ 9 Abs. 1 Nr. 6 EStG)
sind vollständig abzugsfähig. Belege liegen bei.

2. Homeoffice-Tagespauschale (§ 4 Abs. 5 Nr. 6b EStG)

Für das Jahr 2022 ist die Homeoffice-Pauschale von 5 € je Arbeitstag anzusetzen,
höchstens 600 € im Veranlagungsjahr. Diese Position wurde im Bescheid nicht
berücksichtigt. Ich weise auf das Schreiben des BMF vom 15. August 2023 hin,
das die erweiterte Anwendung der Pauschale bestätigt.

3. Außergewöhnliche Belastungen (§ 33 EStG)

Die nicht anerkannten Krankheitskosten in Höhe von 890,00 € überschreiten die
zumutbare Belastung nach § 33 Abs. 3 EStG. Ich verweise auf BFH-Urteil vom
2. September 2015 (Az. VI R 32/13), wonach die zumutbare Belastung stufen-
weise zu berechnen ist, was zu einer höheren Absetzbarkeit führt.

III. ANTRAG

Ich beantrage:
1. Änderung des Bescheids unter Berücksichtigung der o.g. Positionen
2. Aussetzung der Vollziehung gem. § 361 AO in Höhe des streitigen Betrags

Die erwartete Steuerminderung beläuft sich auf ca. 820,00 €.

Ich bitte um schriftliche Eingangsbestätigung.

Mit freundlichen Grüßen

Max Mustermann

Anlagen:
- Belege Werbungskosten (7 Seiten)
- Homeoffice-Nachweis des Arbeitgebers
- Ärztliche Bescheinigungen Krankheitskosten`,
}

const USE_CASE_LABELS: Record<string, string> = {
  tax:               'Einkommensteuerbescheid',
  jobcenter:         'Jobcenter / Bürgergeld-Bescheid',
  rente:             'Rentenbescheid',
  bussgeld:          'Bußgeldbescheid',
  krankenversicherung:'Krankenkassenbescheid',
  kuendigung:        'Kündigung',
  miete:             'Mieterhöhung',
  grundsteuer:       'Grundsteuerbescheid',
}

function getPartialDraft(agentIdx: number): string {
  if (agentIdx <= 0) return ''
  const lines = DEMO_RESULT.finalDraft.split('\n')
  const n = lines.length
  const targets = [
    Math.floor(n * 0.12),
    Math.floor(n * 0.22),
    Math.floor(n * 0.48),
    Math.floor(n * 0.75),
    n,
  ]
  return lines.slice(0, targets[Math.min(agentIdx - 1, targets.length - 1)]).join('\n')
}

function EinspruchPageInner() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type')
  const useCaseLabel = type ? (USE_CASE_LABELS[type] ?? type.replace(/-/g, ' ')) : null

  const [step, setStep]                 = useState<Step>('upload')
  const [files, setFiles]               = useState<File[]>([])
  const [isDragging, setIsDragging]     = useState(false)
  const [bescheidData, setBescheidData] = useState<Record<string, string> | null>(null)
  const [questions, setQuestions]       = useState<Array<{ id: string; question: string; required?: boolean }>>([])
  const [answers, setAnswers]           = useState<Record<string, string>>({})
  const [result, setResult]             = useState<typeof DEMO_RESULT | null>(null)
  const [activeAgent, setActiveAgent]   = useState(0)
  const [detectedCount, setDetectedCount] = useState(0)
  const [copied, setCopied]             = useState(false)

  const fileInputRef      = useRef<HTMLInputElement>(null)
  // Refs hold API results so useEffect transitions can read them without stale closures
  const pendingBescheidRef  = useRef<Record<string, string> | null>(null)
  const pendingQuestionsRef = useRef<Array<{ id: string; question: string; required?: boolean }> | null>(null)
  const pendingResultRef    = useRef<typeof DEMO_RESULT | null>(null)

  const currentIdx    = STEPS.findIndex((s) => s.id === step)
  const answeredCount = questions.filter((q) => answers[q.id]?.trim()).length
  const partialDraft  = step === 'generating' ? getPartialDraft(activeAgent) : ''

  // ── Analyzing: tick one item at a time ──────────────────────────────────
  useEffect(() => {
    if (step !== 'analyzing' || detectedCount >= DETECTION_ITEMS.length) return
    const ms = detectedCount === 0 ? 600 : 580
    const t = setTimeout(() => setDetectedCount((c) => c + 1), ms)
    return () => clearTimeout(t)
  }, [step, detectedCount])

  // ── Analyzing → questions ────────────────────────────────────────────────
  useEffect(() => {
    if (step !== 'analyzing' || detectedCount < DETECTION_ITEMS.length) return
    const t = setTimeout(() => {
      setBescheidData(pendingBescheidRef.current  ?? DEMO_BESCHEID_DATA)
      setQuestions(pendingQuestionsRef.current    ?? DEMO_QUESTIONS)
      setStep('questions')
    }, 500)
    return () => clearTimeout(t)
  }, [step, detectedCount])

  // ── Generating: step through agents ─────────────────────────────────────
  useEffect(() => {
    if (step !== 'generating' || activeAgent >= AGENTS.length) return
    const t = setTimeout(() => setActiveAgent((a) => a + 1), 900)
    return () => clearTimeout(t)
  }, [step, activeAgent])

  // ── Generating → result ──────────────────────────────────────────────────
  useEffect(() => {
    if (step !== 'generating' || activeAgent < AGENTS.length) return
    const t = setTimeout(() => {
      setResult(pendingResultRef.current ?? DEMO_RESULT)
      setStep('result')
    }, 400)
    return () => clearTimeout(t)
  }, [step, activeAgent])

  // ── Handlers ────────────────────────────────────────────────────────────
  function addFiles(incoming: FileList | null) {
    if (!incoming) return
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name))
      return [...prev, ...Array.from(incoming).filter((f) => !existing.has(f.name))]
    })
  }

  function removeFile(name: string) {
    setFiles((prev) => prev.filter((f) => f.name !== name))
  }

  async function handleAnalyze() {
    pendingBescheidRef.current  = null
    pendingQuestionsRef.current = null
    setDetectedCount(0)
    setStep('analyzing')
    // Fire API in background — result stored in ref, consumed by transition effect
    if (files.length > 0) {
      try {
        const docs = await Promise.all(files.map(async (f) => ({ name: f.name, text: await f.text() })))
        const res  = await fetch('/api/analyze', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documents: docs }),
        })
        if (res.ok) {
          const data = await res.json()
          pendingBescheidRef.current  = data.bescheidData    ?? null
          pendingQuestionsRef.current = data.followUpQuestions ?? null
        }
      } catch { /* fall through to demo data */ }
    }
  }

  async function handleGenerate() {
    pendingResultRef.current = null
    setActiveAgent(0)
    setStep('generating')
    try {
      const docs = await Promise.all(files.map(async (f) => ({ name: f.name, text: await f.text() })))
      const res  = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bescheidData, documents: docs, userAnswers: answers }),
      })
      if (res.ok) pendingResultRef.current = await res.json()
    } catch { /* fall through to demo data */ }
  }

  function handleDownload() {
    const draft = result?.finalDraft; if (!draft) return
    const url = URL.createObjectURL(new Blob([draft], { type: 'text/plain;charset=utf-8' }))
    Object.assign(document.createElement('a'), { href: url, download: 'TaxaLex-Einspruch.txt' }).click()
    URL.revokeObjectURL(url)
  }

  async function handleCopy() {
    const draft = result?.finalDraft; if (!draft) return
    await navigator.clipboard.writeText(draft)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  function handleReset() {
    setStep('upload'); setFiles([]); setResult(null)
    setAnswers({}); setBescheidData(null); setQuestions([])
    setActiveAgent(0); setDetectedCount(0)
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--surface)] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Logo size="sm" href="/" />
          <span className="text-sm text-[var(--muted)]">Einspruch erstellen</span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* Step indicator */}
        <div className="flex items-center mb-10">
          {STEPS.map((s, i) => {
            const done = i < currentIdx, active = i === currentIdx
            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    done ? 'bg-brand-600 border-brand-600' : active ? 'bg-[var(--surface)] border-brand-600' : 'bg-[var(--surface)] border-[var(--border)]'
                  }`}>
                    {done ? <CheckCircle2 className="w-4 h-4 text-white" /> : <s.icon className={`w-4 h-4 ${active ? 'text-brand-600' : 'text-[var(--muted)]'}`} />}
                  </div>
                  <span className={`text-[10px] font-medium hidden sm:block ${active ? 'text-brand-600' : done ? 'text-brand-400' : 'text-[var(--muted)]'}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-4 sm:mb-3 transition-colors ${done ? 'bg-brand-400' : 'bg-[var(--border)]'}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* ═══ Step 1 — Hochladen ═══ */}
        {step === 'upload' && (
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Bescheid hochladen</h1>
            <p className="text-[var(--muted)] text-sm mb-6">
              Laden Sie Ihren Bescheid hoch — oder starten Sie direkt ohne Dokument für eine Demo.
            </p>

            {useCaseLabel && (
              <div className="flex items-center gap-2 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 rounded-xl px-4 py-2.5 mb-5 text-sm">
                <Tag className="w-4 h-4 text-brand-500 shrink-0" />
                <span className="text-brand-700 dark:text-brand-300">Vorlage: <strong>{useCaseLabel}</strong></span>
              </div>
            )}

            <div
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                isDragging ? 'border-brand-400 bg-brand-50 dark:bg-brand-950/30'
                : 'border-[var(--border)] hover:border-brand-300 hover:bg-brand-50/40 dark:hover:bg-brand-950/20'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files) }}
            >
              <div className="w-14 h-14 bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Upload className="w-7 h-7 text-brand-500" />
              </div>
              <p className="font-semibold text-[var(--foreground)] mb-1">Dateien hier ablegen</p>
              <p className="text-sm text-[var(--muted)]">oder klicken, um Dateien auszuwählen</p>
              <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                {['PDF', 'DOCX', 'JPG / PNG', 'TXT'].map((t) => (
                  <span key={t} className="text-xs bg-[var(--background-subtle)] text-[var(--muted)] px-2.5 py-1 rounded-full border border-[var(--border)]">{t}</span>
                ))}
              </div>
              <input ref={fileInputRef} type="file" multiple className="hidden"
                accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.webp"
                onChange={(e) => addFiles(e.target.files)} />
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((f) => (
                  <div key={f.name} className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3">
                    <div className="w-8 h-8 bg-brand-50 dark:bg-brand-950/40 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-brand-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">{f.name}</p>
                      <p className="text-xs text-[var(--muted)]">{(f.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); removeFile(f.name) }}
                      className="p-1.5 text-[var(--muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button onClick={handleAnalyze}
              className="mt-6 w-full bg-brand-600 text-white py-3.5 rounded-xl font-semibold hover:bg-brand-700 active:bg-brand-800 transition-colors flex items-center justify-center gap-2">
              {files.length === 0
                ? <><ScanSearch className="w-4 h-4" />Demo starten (ohne Dokument)</>
                : <>Dokumente analysieren<ArrowRight className="w-4 h-4" /></>}
            </button>

            <div className="flex items-center justify-center gap-6 mt-5 flex-wrap">
              {([
                [ShieldCheck, 'SSL-verschlüsselt'],
                [Globe,       'EU-Server'],
                [Lock,        'Nicht gespeichert'],
              ] as const).map(([Icon, label]) => (
                <span key={label} className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                  <Icon className="w-3.5 h-3.5 text-green-500" />{label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ═══ Step 2 — Erkennung ═══ */}
        {step === 'analyzing' && (
          <div className="py-2">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Dokument wird analysiert</h1>
              <p className="text-sm text-[var(--muted)]">
                {detectedCount < DETECTION_ITEMS.length
                  ? `Erkenne: ${DETECTION_ITEMS[detectedCount]?.label ?? ''}…`
                  : 'Analyse abgeschlossen — Rückfragen werden vorbereitet…'}
              </p>
            </div>

            <div className="flex gap-6 items-start">
              <div className="hidden sm:block shrink-0">
                <div className="relative w-28 h-36 bg-[var(--surface)] border-2 border-brand-200 dark:border-brand-800 rounded-xl overflow-hidden shadow-md">
                  <div className="p-3 space-y-1.5">
                    {DOC_LINE_WIDTHS.map((w, i) => (
                      <div key={i} className="h-1.5 bg-[var(--border)] rounded-full" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                  <div className="absolute inset-x-0 h-0.5 animate-scan-line"
                    style={{ background: 'linear-gradient(90deg,transparent,rgba(99,102,241,.7),transparent)', top: '0%' }} />
                  <div className="absolute inset-0 bg-gradient-to-b from-brand-50/20 to-transparent dark:from-brand-900/10 pointer-events-none" />
                </div>
                <p className="text-[10px] text-center text-[var(--muted)] mt-2 font-medium">
                  {files[0]?.name ?? 'demo-bescheid.pdf'}
                </p>
              </div>

              <div className="flex-1 space-y-2 min-w-0">
                {DETECTION_ITEMS.map((item, i) =>
                  i < detectedCount ? (
                    <div key={item.label} className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 animate-pop-in">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      <span className="text-sm text-[var(--muted)] flex-1 min-w-0 truncate">{item.label}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${item.pill}`}>{item.value}</span>
                    </div>
                  ) : (
                    <div key={`p-${item.label}`} className="flex items-center gap-3 bg-[var(--background-subtle)] border border-transparent rounded-xl px-3.5 py-2.5 opacity-40">
                      <div className="w-4 h-4 rounded-full border-2 border-[var(--border)] shrink-0" />
                      <span className="text-sm text-[var(--muted)]">{item.label}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-2">
                <span>{detectedCount} / {DETECTION_ITEMS.length} Merkmale erkannt</span>
                <span className="font-medium">{Math.round((detectedCount / DETECTION_ITEMS.length) * 100)} %</span>
              </div>
              <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full transition-all duration-500"
                  style={{ width: `${(detectedCount / DETECTION_ITEMS.length) * 100}%` }} />
              </div>
            </div>
            <p className="text-center text-xs text-[var(--muted)] mt-5">KI-gestützte Dokumentenanalyse · Daten werden nicht gespeichert</p>
          </div>
        )}

        {/* ═══ Step 3 — Fragen ═══ */}
        {step === 'questions' && (
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Rückfragen</h1>
                <p className="text-[var(--muted)] text-sm">Bitte beantworten Sie diese Fragen für einen optimal formulierten Einspruch.</p>
              </div>
              <div className="shrink-0 text-right">
                <p className={`text-lg font-bold ${answeredCount === questions.length ? 'text-green-600' : 'text-[var(--foreground)]'}`}>
                  {answeredCount} <span className="text-[var(--muted)] font-normal text-base">/ {questions.length}</span>
                </p>
                <p className="text-xs text-[var(--muted)]">beantwortet</p>
              </div>
            </div>

            <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden mb-7">
              <div className={`h-full rounded-full transition-all duration-500 ${answeredCount === questions.length ? 'bg-green-500' : 'bg-brand-500'}`}
                style={{ width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }} />
            </div>

            <div className="grid lg:grid-cols-[1fr_240px] gap-6">
              <div className="space-y-4">
                {questions.map((q, i) => (
                  <div key={q.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                      <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        answers[q.id]?.trim()
                          ? 'bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400'
                          : 'bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400'
                      }`}>
                        {answers[q.id]?.trim() ? <CheckCircle2 className="w-3.5 h-3.5" /> : String(i + 1)}
                      </span>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                          {q.question}
                          {q.required
                            ? <span className="text-red-500 ml-1.5 text-xs font-normal">Pflichtfeld</span>
                            : <span className="text-[var(--muted)] ml-1.5 text-xs font-normal">Optional</span>}
                        </label>
                        <textarea rows={3}
                          className="w-full border border-[var(--border)] rounded-xl px-4 py-3 text-sm bg-[var(--background-subtle)] text-[var(--foreground)] focus:bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-colors resize-none placeholder:text-[var(--muted)]"
                          placeholder="Ihre Antwort…"
                          value={answers[q.id] ?? ''}
                          onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {bescheidData && (
                <div className="lg:sticky lg:top-24 h-fit">
                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-950/40 rounded-lg flex items-center justify-center">
                        <ScanSearch className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <p className="text-xs font-semibold text-[var(--foreground)]">Erkannter Bescheid</p>
                      <span className="ml-auto text-[10px] text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-full font-medium">KI-Analyse ✓</span>
                    </div>
                    <div className="space-y-2.5">
                      {Object.entries(bescheidData).map(([k, v]) => (
                        <div key={k} className="flex items-start justify-between gap-2">
                          <span className="text-xs text-[var(--muted)]">{k}</span>
                          <span className="text-xs font-semibold text-[var(--foreground)] text-right max-w-[130px] leading-tight">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep('upload')}
                className="flex items-center gap-2 border border-[var(--border)] text-[var(--foreground)] px-5 py-3 rounded-xl text-sm font-medium hover:bg-[var(--background-subtle)] transition-colors">
                <ArrowLeft className="w-4 h-4" />Zurück
              </button>
              <button onClick={handleGenerate}
                className="flex-1 bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2">
                <Brain className="w-4 h-4" />Einspruch generieren
              </button>
            </div>
          </div>
        )}

        {/* ═══ Step 4 — Generierung ═══ */}
        {step === 'generating' && (
          <div className="py-4">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-50 dark:bg-brand-950/40 rounded-2xl mb-4">
                <Brain className="w-8 h-8 text-brand-600 animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Multi-KI-Pipeline läuft…</h1>
              <p className="text-sm text-[var(--muted)]">
                {activeAgent < AGENTS.length ? AGENTS[activeAgent].detail : 'Schreiben wird finalisiert…'}
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-2">
                    <span>
                      {activeAgent < AGENTS.length
                        ? `Schritt ${activeAgent + 1} / ${AGENTS.length}: ${AGENTS[activeAgent].label}`
                        : `Alle ${AGENTS.length} Agenten abgeschlossen`}
                    </span>
                    <span className="font-medium">
                      {activeAgent >= AGENTS.length ? '100 %' : `${Math.round((activeAgent / AGENTS.length) * 100)} %`}
                    </span>
                  </div>
                  <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full transition-all duration-700"
                      style={{ width: activeAgent >= AGENTS.length ? '100%' : `${(activeAgent / AGENTS.length) * 100}%` }} />
                  </div>
                </div>

                <div className="space-y-2">
                  {AGENTS.map((agent, i) => {
                    const done = i < activeAgent, active = i === activeAgent
                    return (
                      <div key={agent.id} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm transition-all duration-300 ${
                        done   ? 'bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900'
                        : active ? 'bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 shadow-sm'
                        :          'bg-[var(--background-subtle)] border border-transparent'
                      }`}>
                        <div className="shrink-0">
                          {done   ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                          : active ? <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
                          :          <div className="w-5 h-5 rounded-full border-2 border-[var(--border)]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold leading-tight ${done ? 'text-green-700 dark:text-green-400' : active ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>
                            {agent.label}
                          </p>
                          {(done || active) && (
                            <p className={`text-xs mt-0.5 ${done ? 'text-green-600/70 dark:text-green-500/70' : 'text-[var(--muted)]'}`}>
                              {done ? AGENT_VERDICTS[agent.id] : agent.detail}
                            </p>
                          )}
                        </div>
                        <span className={`text-xs font-medium shrink-0 px-2 py-0.5 rounded-full ${
                          done   ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                          : active ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300'
                          :          'bg-[var(--border)] text-[var(--muted)]'
                        }`}>{agent.provider}</span>
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-[var(--muted)] mt-4 text-center">Durchschnittliche Dauer: 20–40 Sekunden · Bitte nicht schließen</p>
              </div>

              <div className="hidden lg:flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Entwurf in Echtzeit</p>
                  {activeAgent < AGENTS.length && (
                    <span className="flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400">
                      <Loader2 className="w-3 h-3 animate-spin" />wird geschrieben…
                    </span>
                  )}
                </div>
                <div className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--background-subtle)]">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                    <span className="ml-2 text-xs text-[var(--muted)]">TaxaLex-Einspruch.txt</span>
                  </div>
                  <pre className="p-4 text-xs font-mono text-[var(--foreground)] leading-relaxed whitespace-pre-wrap h-72 overflow-y-auto">
                    {partialDraft
                      ? <>{partialDraft}{activeAgent < AGENTS.length && <span className="animate-pulse text-brand-500">▌</span>}</>
                      : <span className="text-[var(--muted)]">Einspruch wird formuliert…</span>}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Step 5 — Ergebnis ═══ */}
        {step === 'result' && result && (
          <div>
            <div className="text-center mb-8">
              <div className="relative inline-flex mb-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-950/40 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Einspruch bereit!</h1>
              <p className="text-sm text-[var(--muted)] mb-3">5 KI-Agenten haben Ihren Einspruch geprüft und optimiert.</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {[
                  ['text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950/40 dark:border-green-800',   '✓ Rechtlich geprüft'],
                  ['text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/40 dark:border-blue-800',         '✓ BFH-Urteile eingeflossen'],
                  ['text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-950/40 dark:border-purple-800','✓ Formell korrekt'],
                ].map(([cls, label]) => (
                  <span key={label} className={`text-xs font-semibold px-3 py-1 rounded-full border ${cls}`}>{label}</span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-6">
              {AGENTS.map((agent) => (
                <div key={agent.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className={`w-5 h-5 rounded-md ${agent.color} flex items-center justify-center shrink-0`}>
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[10px] font-semibold text-[var(--muted)]">{agent.provider}</span>
                  </div>
                  <p className="text-xs font-semibold text-[var(--foreground)] leading-tight mb-1">{agent.label}</p>
                  <p className="text-[10px] text-[var(--muted)] leading-tight">{AGENT_VERDICTS[agent.id]}</p>
                </div>
              ))}
            </div>

            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden mb-5">
              <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)] bg-[var(--background-subtle)]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                  </div>
                  <span className="text-xs text-[var(--muted)] ml-1">TaxaLex-Einspruch.txt</span>
                </div>
                <span className="text-xs text-[var(--muted)]">Entwurf · bearbeitbar</span>
              </div>
              <pre className="p-5 font-mono text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
                {result.finalDraft}
              </pre>
            </div>

            <div className="flex gap-3 mb-5">
              <button onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors">
                <Download className="w-4 h-4" />Herunterladen (.txt)
              </button>
              <button onClick={handleCopy}
                className="flex items-center justify-center gap-2 border border-[var(--border)] px-5 py-3 rounded-xl font-medium text-sm hover:bg-[var(--background-subtle)] transition-colors min-w-[120px]">
                {copied ? <><CheckCircle2 className="w-4 h-4 text-green-500" />Kopiert!</> : <><Copy className="w-4 h-4" />Kopieren</>}
              </button>
            </div>

            <div className="bg-[var(--background-subtle)] border border-[var(--border)] rounded-2xl p-5 mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">Nächste Schritte</p>
              <div className="space-y-3">
                {[
                  'Prüfen Sie Name, Adresse und Steuernummer im Entwurf',
                  'Drucken Sie das Schreiben aus und unterschreiben Sie es',
                  'Senden Sie es per Einschreiben oder Fax an die Behörde',
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-[var(--muted)]">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={handleReset}
                className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />Neuen Einspruch erstellen
              </button>
              <span className="text-[var(--border)]">·</span>
              <p className="text-xs text-[var(--muted)]">
                <AlertCircle className="w-3 h-3 inline mr-0.5" />Kein Rechtsrat i.S.d. RDG
              </p>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default function EinspruchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)]" />}>
      <EinspruchPageInner />
    </Suspense>
  )
}
