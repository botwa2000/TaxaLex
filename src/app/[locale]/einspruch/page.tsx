'use client'

import { useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Upload,
  MessageSquare,
  Brain,
  FileCheck,
  Loader2,
  ArrowLeft,
  ArrowRight,
  X,
  CheckCircle2,
  FileText,
  Copy,
  Download,
  AlertCircle,
  ScanSearch,
  Tag,
} from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Logo } from '@/components/Logo'

type Step = 'upload' | 'analyzing' | 'questions' | 'generating' | 'result'

const STEPS = [
  { id: 'upload', label: 'Hochladen', icon: Upload },
  { id: 'analyzing', label: 'Erkennung', icon: ScanSearch },
  { id: 'questions', label: 'Fragen', icon: MessageSquare },
  { id: 'generating', label: 'Generierung', icon: Brain },
  { id: 'result', label: 'Ergebnis', icon: FileCheck },
] as const

const AGENTS = [
  {
    id: 'drafter',
    label: 'Einspruch formulieren',
    detail: 'Erstellt rechtssicheren Einspruch basierend auf erkannten Bescheid-Daten',
    provider: 'Claude',
    providerColor: 'text-blue-600',
    color: 'bg-blue-500',
  },
  {
    id: 'reviewer',
    label: 'Fehler- & Stilprüfung',
    detail: 'Prüft Grammatik, Formulierungen und formale Anforderungen',
    provider: 'Gemini',
    providerColor: 'text-purple-600',
    color: 'bg-purple-500',
  },
  {
    id: 'factchecker',
    label: 'Rechts-Faktencheck',
    detail: 'Recherchiert aktuelle BFH-Urteile und Verwaltungsrichtlinien',
    provider: 'Perplexity',
    providerColor: 'text-green-600',
    color: 'bg-green-500',
  },
  {
    id: 'adversary',
    label: 'Gegenprüfung (Behördensicht)',
    detail: 'Simuliert die Perspektive des Finanzamts / der Behörde',
    provider: 'Claude',
    providerColor: 'text-red-600',
    color: 'bg-red-500',
  },
  {
    id: 'consolidator',
    label: 'Finales Schreiben',
    detail: 'Kombiniert alle Perspektiven zum optimalen Einspruch',
    provider: 'Claude',
    providerColor: 'text-brand-600',
    color: 'bg-brand-500',
  },
] as const

const DETECTION_ITEMS = [
  { label: 'Bescheid-Typ erkannt', value: 'Einkommensteuerbescheid 2022', pill: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' },
  { label: 'Ausstellende Behörde', value: 'Finanzamt München-Nord', pill: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300' },
  { label: 'Bescheiddatum', value: '15. März 2024', pill: 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  { label: 'Steuernummer', value: '143/567/89012', pill: 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  { label: 'Festgesetzte Steuer', value: '8.742,00 €', pill: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300' },
  { label: 'Einspruchsfrist', value: '15. April 2024 · 30 Tage', pill: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300' },
  { label: 'Einspruchsgründe', value: '3 mögliche Gründe gefunden', pill: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300' },
]

// Fixed widths to avoid hydration mismatch
const DOC_LINE_WIDTHS = [72, 88, 55, 80, 63, 48, 75, 90, 60, 70]

const DEMO_BESCHEID_DATA: Record<string, string> = {
  'Bescheid-Typ': 'Einkommensteuerbescheid 2022',
  'Behörde': 'Finanzamt München-Nord',
  'Datum': '15. März 2024',
  'Steuernummer': '143/567/89012',
  'Festgesetzte Steuer': '8.742,00 €',
  'Einspruchsfrist': '15. April 2024',
}

const DEMO_QUESTIONS: Array<{ id: string; question: string; required?: boolean }> = [
  { id: 'q1', question: 'Welche Ausgaben wurden abgelehnt oder nicht berücksichtigt?', required: true },
  { id: 'q2', question: 'Haben Sie Belege für die strittigen Positionen vorliegen?', required: false },
  { id: 'q3', question: 'Gibt es besondere Umstände (z. B. Krankheit, Umzug, Homeoffice)?', required: false },
]

const DEMO_RESULT = {
  outputs: [
    { role: 'drafter', provider: 'Anthropic', model: 'claude-sonnet-4-6' },
    { role: 'reviewer', provider: 'Google', model: 'gemini-1.5-pro' },
    { role: 'factchecker', provider: 'Perplexity', model: 'sonar-pro' },
    { role: 'adversary', provider: 'Anthropic', model: 'claude-sonnet-4-6' },
    { role: 'consolidator', provider: 'Anthropic', model: 'claude-sonnet-4-6' },
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
  tax: 'Einkommensteuerbescheid',
  jobcenter: 'Jobcenter / Bürgergeld-Bescheid',
  rente: 'Rentenbescheid',
  bussgeld: 'Bußgeldbescheid',
  krankenversicherung: 'Krankenkassenbescheid',
  kuendigung: 'Kündigung',
  miete: 'Mieterhöhung',
  grundsteuer: 'Grundsteuerbescheid',
}

function EinspruchPageInner() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type')
  const useCaseLabel = type ? (USE_CASE_LABELS[type] ?? type.replace(/-/g, ' ')) : null

  const [step, setStep] = useState<Step>('upload')
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [bescheidData, setBescheidData] = useState<Record<string, string> | null>(null)
  const [questions, setQuestions] = useState<Array<{ id: string; question: string; required?: boolean }>>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<typeof DEMO_RESULT | null>(null)
  const [activeAgent, setActiveAgent] = useState<number>(-1)
  const [detectedCount, setDetectedCount] = useState(0)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentIdx = STEPS.findIndex((s) => s.id === step)

  function addFiles(incoming: FileList | null) {
    if (!incoming) return
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name))
      const fresh = Array.from(incoming).filter((f) => !existing.has(f.name))
      return [...prev, ...fresh]
    })
  }

  function removeFile(name: string) {
    setFiles((prev) => prev.filter((f) => f.name !== name))
  }

  async function handleAnalyze() {
    setDetectedCount(0)
    setStep('analyzing')

    // Animation: reveal detection items one by one
    const animationPromise = new Promise<void>((resolve) => {
      let count = 0
      const tick = () => {
        count++
        setDetectedCount(count)
        if (count < DETECTION_ITEMS.length) {
          setTimeout(tick, 580)
        } else {
          setTimeout(resolve, 500)
        }
      }
      setTimeout(tick, 600)
    })

    // API call in parallel (only if files uploaded)
    const apiPromise: Promise<{ bescheidData: Record<string, string>; followUpQuestions: typeof DEMO_QUESTIONS } | null> =
      files.length > 0
        ? (async () => {
            try {
              const documents = await Promise.all(
                files.map(async (f) => ({ name: f.name, text: await f.text() }))
              )
              const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documents }),
              })
              if (!res.ok) return null
              return await res.json()
            } catch {
              return null
            }
          })()
        : Promise.resolve(null)

    const [, apiResult] = await Promise.all([animationPromise, apiPromise])

    setBescheidData(apiResult?.bescheidData ?? DEMO_BESCHEID_DATA)
    setQuestions(apiResult?.followUpQuestions ?? DEMO_QUESTIONS)
    setStep('questions')
  }

  async function handleGenerate() {
    setStep('generating')
    setActiveAgent(0)

    // Animation: step through agents
    const animationPromise = new Promise<void>((resolve) => {
      let idx = 0
      const tick = () => {
        idx++
        setActiveAgent(idx)
        if (idx < AGENTS.length) {
          setTimeout(tick, 900)
        } else {
          setTimeout(resolve, 400)
        }
      }
      setTimeout(tick, 900)
    })

    // API call in parallel
    const apiPromise: Promise<typeof DEMO_RESULT | null> = (async () => {
      try {
        const documents = await Promise.all(
          files.map(async (f) => ({ name: f.name, text: await f.text() }))
        )
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bescheidData, documents, userAnswers: answers }),
        })
        if (!res.ok) return null
        return await res.json()
      } catch {
        return null
      }
    })()

    const [, apiResult] = await Promise.all([animationPromise, apiPromise])

    setActiveAgent(AGENTS.length)
    setResult(apiResult ?? DEMO_RESULT)
    setStep('result')
  }

  function handleDownload() {
    const draft = result?.finalDraft
    if (!draft) return
    const blob = new Blob([draft], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'TaxaLex-Einspruch.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleCopy() {
    const draft = result?.finalDraft
    if (!draft) return
    await navigator.clipboard.writeText(draft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
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
            const done = i < currentIdx
            const active = i === currentIdx
            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      done
                        ? 'bg-brand-600 border-brand-600'
                        : active
                          ? 'bg-[var(--surface)] border-brand-600'
                          : 'bg-[var(--surface)] border-[var(--border)]'
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <s.icon
                        className={`w-4 h-4 ${active ? 'text-brand-600' : 'text-[var(--muted)]'}`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-medium hidden sm:block ${
                      active ? 'text-brand-600' : done ? 'text-brand-400' : 'text-[var(--muted)]'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 mb-4 sm:mb-3 transition-colors ${
                      done ? 'bg-brand-400' : 'bg-[var(--border)]'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* ── Step 1: Upload ── */}
        {step === 'upload' && (
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">
              Bescheid hochladen
            </h1>
            <p className="text-[var(--muted)] mb-6 text-sm">
              Laden Sie Ihren Bescheid hoch — oder starten Sie direkt ohne Dokument für eine Demo.
            </p>

            {/* Use-case context banner */}
            {useCaseLabel && (
              <div className="flex items-center gap-2 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 rounded-xl px-4 py-2.5 mb-6 text-sm">
                <Tag className="w-4 h-4 text-brand-500 shrink-0" />
                <span className="text-brand-700 dark:text-brand-300">
                  Vorlage: <strong>{useCaseLabel}</strong>
                </span>
              </div>
            )}

            {/* Drop zone */}
            <div
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-brand-400 bg-brand-50 dark:bg-brand-950/30'
                  : 'border-[var(--border)] hover:border-brand-300 hover:bg-brand-50/40 dark:hover:bg-brand-950/20'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files) }}
            >
              <div className="w-14 h-14 bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-800 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-7 h-7 text-brand-500" />
              </div>
              <p className="font-semibold text-[var(--foreground)] mb-1">Dateien hier ablegen</p>
              <p className="text-sm text-[var(--muted)]">oder klicken, um Dateien auszuwählen</p>
              <p className="text-xs text-[var(--muted)] mt-2">PDF · DOCX · TXT · JPG · PNG · max. 10 MB</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.webp"
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((f) => (
                  <div
                    key={f.name}
                    className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3"
                  >
                    <div className="w-8 h-8 bg-brand-50 dark:bg-brand-950/40 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-brand-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">{f.name}</p>
                      <p className="text-xs text-[var(--muted)]">{(f.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(f.name) }}
                      className="p-1.5 text-[var(--muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              className="mt-6 w-full bg-brand-600 text-white py-3.5 rounded-xl font-semibold hover:bg-brand-700 active:bg-brand-800 transition-colors flex items-center justify-center gap-2"
            >
              {files.length === 0 ? (
                <>
                  <ScanSearch className="w-4 h-4" />
                  Demo starten (ohne Dokument)
                </>
              ) : (
                <>
                  Dokumente analysieren
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {files.length === 0 && (
              <p className="text-center text-xs text-[var(--muted)] mt-2">
                Kein Dokument? Kein Problem — die Demo läuft mit Beispieldaten.
              </p>
            )}
          </div>
        )}

        {/* ── Step 2: Analyzing ── */}
        {step === 'analyzing' && (
          <div className="py-2">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">
                Dokument wird analysiert
              </h1>
              <p className="text-sm text-[var(--muted)]">
                {detectedCount < DETECTION_ITEMS.length
                  ? `Erkenne: ${DETECTION_ITEMS[detectedCount]?.label ?? ''}…`
                  : 'Analyse abgeschlossen — Rückfragen werden vorbereitet…'}
              </p>
            </div>

            {/* Two-column layout: doc scan + detection items */}
            <div className="flex gap-6 items-start">
              {/* Document scan visual */}
              <div className="hidden sm:block shrink-0">
                <div className="relative w-28 h-36 bg-[var(--surface)] border-2 border-brand-200 dark:border-brand-800 rounded-xl overflow-hidden shadow-md">
                  {/* Simulated text lines */}
                  <div className="p-3 space-y-1.5">
                    {DOC_LINE_WIDTHS.map((w, i) => (
                      <div
                        key={i}
                        className="h-1.5 bg-[var(--border)] rounded-full"
                        style={{ width: `${w}%` }}
                      />
                    ))}
                  </div>
                  {/* Animated scan line */}
                  <div
                    className="absolute inset-x-0 h-0.5 animate-scan-line"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.7), transparent)',
                      top: '0%',
                    }}
                  />
                  {/* Glow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-brand-50/20 to-transparent dark:from-brand-900/10 pointer-events-none" />
                </div>
                <p className="text-[10px] text-center text-[var(--muted)] mt-2 font-medium">
                  {files[0]?.name ?? 'demo-bescheid.pdf'}
                </p>
              </div>

              {/* Detection items */}
              <div className="flex-1 space-y-2 min-w-0">
                {DETECTION_ITEMS.map((item, i) => {
                  if (i >= detectedCount) return null
                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 animate-pop-in"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      <span className="text-sm text-[var(--muted)] flex-1 min-w-0 truncate">
                        {item.label}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${item.pill}`}>
                        {item.value}
                      </span>
                    </div>
                  )
                })}

                {/* Pending items (placeholders) */}
                {DETECTION_ITEMS.map((item, i) => {
                  if (i < detectedCount) return null
                  return (
                    <div
                      key={`pending-${item.label}`}
                      className="flex items-center gap-3 bg-[var(--background-subtle)] border border-transparent rounded-xl px-3.5 py-2.5 opacity-40"
                    >
                      <div className="w-4 h-4 rounded-full border-2 border-[var(--border)] shrink-0" />
                      <span className="text-sm text-[var(--muted)] flex-1">{item.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-8">
              <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-2">
                <span>{detectedCount} / {DETECTION_ITEMS.length} Merkmale erkannt</span>
                <span className="font-medium">
                  {Math.round((detectedCount / DETECTION_ITEMS.length) * 100)} %
                </span>
              </div>
              <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all duration-500"
                  style={{ width: `${(detectedCount / DETECTION_ITEMS.length) * 100}%` }}
                />
              </div>
            </div>

            <p className="text-center text-xs text-[var(--muted)] mt-5">
              KI-gestützte Dokumentenanalyse · Daten werden nicht gespeichert
            </p>
          </div>
        )}

        {/* ── Step 3: Questions ── */}
        {step === 'questions' && (
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Rückfragen</h1>
            <p className="text-[var(--muted)] mb-6 text-sm">
              Bitte beantworten Sie diese Fragen für einen optimal formulierten Einspruch.
            </p>

            {/* Detected data summary */}
            {bescheidData && (
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 mb-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
                  Erkannte Bescheid-Daten
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {Object.entries(bescheidData).map(([k, v]) => (
                    <div key={k} className="contents">
                      <span className="text-[var(--muted)]">{k}:</span>
                      <span className="font-medium text-[var(--foreground)]">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Questions */}
            <div className="space-y-5">
              {questions.map((q) => (
                <div key={q.id}>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                    {q.question}
                    {q.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <textarea
                    rows={3}
                    className="w-full border border-[var(--border)] rounded-xl px-4 py-3 text-sm bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-colors resize-none"
                    placeholder="Ihre Antwort…"
                    value={answers[q.id] ?? ''}
                    onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep('upload')}
                className="flex items-center gap-2 border border-[var(--border)] text-[var(--foreground)] px-5 py-3 rounded-xl text-sm font-medium hover:bg-[var(--background-subtle)] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Zurück
              </button>
              <button
                onClick={handleGenerate}
                className="flex-1 bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
              >
                <Brain className="w-4 h-4" />
                Einspruch generieren
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Generating ── */}
        {step === 'generating' && (
          <div className="py-4">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-50 dark:bg-brand-950/40 rounded-2xl mb-4">
                <Brain className="w-8 h-8 text-brand-600 animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                Multi-KI-Pipeline läuft…
              </h1>
              <p className="text-sm text-[var(--muted)]">
                {activeAgent >= 0 && activeAgent < AGENTS.length
                  ? AGENTS[activeAgent].detail
                  : 'Schreiben wird finalisiert…'}
              </p>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-2">
                <span>
                  {activeAgent >= 0 && activeAgent < AGENTS.length
                    ? `Schritt ${activeAgent + 1} / ${AGENTS.length}: ${AGENTS[activeAgent].label}`
                    : `Alle ${AGENTS.length} Agenten abgeschlossen`}
                </span>
                <span className="font-medium">
                  {activeAgent >= AGENTS.length
                    ? '100 %'
                    : `${Math.round((activeAgent / AGENTS.length) * 100)} %`}
                </span>
              </div>
              <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all duration-700"
                  style={{
                    width: activeAgent >= AGENTS.length
                      ? '100%'
                      : `${(activeAgent / AGENTS.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Agent cards */}
            <div className="space-y-2">
              {AGENTS.map((agent, i) => {
                const done = i < activeAgent
                const active = i === activeAgent
                return (
                  <div
                    key={agent.id}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm transition-all duration-300 ${
                      done
                        ? 'bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900'
                        : active
                          ? 'bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 shadow-sm'
                          : 'bg-[var(--background-subtle)] border border-transparent'
                    }`}
                  >
                    <div className="shrink-0">
                      {done ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : active ? (
                        <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-[var(--border)]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold leading-tight ${
                        done ? 'text-green-700 dark:text-green-400'
                          : active ? 'text-[var(--foreground)]'
                          : 'text-[var(--muted)]'
                      }`}>
                        {agent.label}
                      </p>
                      {(done || active) && (
                        <p className={`text-xs mt-0.5 ${
                          done ? 'text-green-600/70 dark:text-green-500/70' : 'text-[var(--muted)]'
                        }`}>
                          {agent.detail}
                        </p>
                      )}
                    </div>

                    <span className={`text-xs font-medium shrink-0 px-2 py-0.5 rounded-full ${
                      done
                        ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                        : active
                          ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300'
                          : 'bg-[var(--border)] text-[var(--muted)]'
                    }`}>
                      {agent.provider}
                    </span>
                  </div>
                )
              })}
            </div>

            <p className="text-center text-xs text-[var(--muted)] mt-6">
              Durchschnittliche Dauer: 20–40 Sekunden · Bitte nicht schließen
            </p>
          </div>
        )}

        {/* ── Step 5: Result ── */}
        {step === 'result' && result && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-950/40 rounded-2xl flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">Einspruch fertig</h1>
                <p className="text-sm text-[var(--muted)]">
                  Geprüft durch {result.outputs?.length ?? 0} KI-Agenten
                </p>
              </div>
            </div>

            {/* Agent log */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
                KI-Agenten-Protokoll
              </p>
              <div className="space-y-2">
                {result.outputs?.map((o, i) => {
                  const agent = AGENTS.find((a) => a.id === o.role)
                  return (
                    <div key={i} className="flex items-center gap-2.5 text-sm">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${agent?.color ?? 'bg-gray-400'}`} />
                      <span className="font-medium text-[var(--foreground)]">
                        {agent?.label ?? o.role}
                      </span>
                      <span className="text-[var(--muted)] text-xs ml-auto">
                        {o.provider} · {o.model}
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Letter preview */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden mb-5">
              <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)] bg-[var(--background-subtle)]">
                <div className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                  <FileText className="w-4 h-4 text-brand-500" />
                  Einspruchsschreiben
                </div>
                <span className="text-xs text-[var(--muted)]">Entwurf · bearbeitbar</span>
              </div>
              <pre className="p-5 font-mono text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
                {result.finalDraft}
              </pre>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Herunterladen
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 border border-[var(--border)] px-5 py-3 rounded-xl font-medium text-sm hover:bg-[var(--background-subtle)] transition-colors min-w-[120px]"
              >
                {copied ? (
                  <><CheckCircle2 className="w-4 h-4 text-green-500" /> Kopiert!</>
                ) : (
                  <><Copy className="w-4 h-4" /> Kopieren</>
                )}
              </button>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => { setStep('upload'); setFiles([]); setResult(null); setAnswers({}) }}
                className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Neuen Einspruch erstellen
              </button>
              <span className="text-[var(--border)]">·</span>
              <p className="text-xs text-[var(--muted)]">
                <AlertCircle className="w-3 h-3 inline mr-0.5" />
                Kein Rechtsrat i.S.d. RDG · Vor Einreichung prüfen
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
