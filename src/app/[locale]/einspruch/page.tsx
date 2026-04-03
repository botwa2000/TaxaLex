'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  Upload, MessageSquare, Brain, FileCheck, Loader2, ArrowLeft, ArrowRight,
  X, CheckCircle2, FileText, Copy, Download, AlertCircle, ScanSearch, Tag,
  ShieldCheck, Globe, Lock, Sparkles, FolderOpen, Clock, Plus, Paperclip,
} from 'lucide-react'
import { Logo } from '@/components/Logo'

type Step = 'upload' | 'analyzing' | 'questions' | 'generating' | 'result'

// ── Agent config (labels come from translations) ─────────────────────────────
const AGENT_IDS = ['drafter', 'reviewer', 'factchecker', 'adversary', 'consolidator'] as const
type AgentId = typeof AGENT_IDS[number]

const AGENT_PROVIDERS: Record<AgentId, string> = {
  drafter:     'Claude',
  reviewer:    'Gemini',
  factchecker: 'Perplexity',
  adversary:   'Claude',
  consolidator:'Claude',
}

const AGENT_COLORS: Record<AgentId, string> = {
  drafter:     'bg-blue-500',
  reviewer:    'bg-purple-500',
  factchecker: 'bg-green-500',
  adversary:   'bg-red-500',
  consolidator:'bg-brand-500',
}

const USE_CASE_KEYS: Record<string, string> = {
  tax:               'Einkommensteuerbescheid',
  jobcenter:         'Jobcenter / Bürgergeld-Bescheid',
  rente:             'Rentenbescheid',
  bussgeld:          'Bußgeldbescheid',
  krankenversicherung:'Krankenkassenbescheid',
  kuendigung:        'Kündigung',
  miete:             'Mieterhöhung',
  grundsteuer:       'Grundsteuerbescheid',
}

// Human-readable labels for bescheidData field keys
const BESCHEID_FIELD_LABELS: Record<string, Record<string, string>> = {
  de: {
    finanzamt: 'Finanzamt / Behörde',
    steuernummer: 'Steuernummer',
    bescheidDatum: 'Bescheiddatum',
    steuerart: 'Art des Bescheids',
    nachzahlung: 'Nachzahlung (€)',
    streitigerBetrag: 'Streitiger Betrag (€)',
  },
  en: {
    finanzamt: 'Authority',
    steuernummer: 'Tax number',
    bescheidDatum: 'Notice date',
    steuerart: 'Notice type',
    nachzahlung: 'Amount due (€)',
    streitigerBetrag: 'Disputed amount (€)',
  },
}

interface AgentOutputData {
  role: string
  provider: string
  model: string
  durationMs: number
  summary: string
}

interface GenerateResult {
  outputs: { role: string; provider: string; model: string }[]
  finalDraft: string
  caseId?: string | null
}

// ── Async base64 via FileReader (non-blocking, handles large files) ───────────
function fileToBase64(f: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      resolve(dataUrl.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(f)
  })
}

function EinspruchPageInner() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const params       = useParams()
  const locale       = typeof params?.locale === 'string' ? params.locale : 'de'
  const t            = useTranslations('wizard')

  const type         = searchParams.get('type')
  const useCaseLabel = type ? (USE_CASE_KEYS[type] ?? type.replace(/-/g, ' ')) : null

  // ── State ─────────────────────────────────────────────────────────────────
  const [step, setStep]                     = useState<Step>('upload')
  const [files, setFiles]                   = useState<File[]>([])
  const [isDragging, setIsDragging]         = useState(false)
  const [bescheidData, setBescheidData]     = useState<Record<string, unknown> | null>(null)
  const [questions, setQuestions]           = useState<Array<{ id: string; question: string; required?: boolean; type?: 'text' | 'yesno' | 'amount' }>>([])
  const [answers, setAnswers]               = useState<Record<string, string>>({})
  const [result, setResult]                 = useState<GenerateResult | null>(null)
  const [activeAgent, setActiveAgent]       = useState(0)
  const [copied, setCopied]                 = useState(false)
  const [caseId, setCaseId]                 = useState<string | null>(null)
  const [agentOutputData, setAgentOutputData] = useState<AgentOutputData[]>([])
  const [draftPreview, setDraftPreview]     = useState<string>('')
  const [generateError, setGenerateError]   = useState<string | null>(null)
  const [analyzeError, setAnalyzeError]     = useState<string | null>(null)
  const [analyzeStep, setAnalyzeStep]       = useState(0) // 0-2 for rotating status messages
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([])
  const [analyzePreview, setAnalyzePreview] = useState(false) // briefly show detected data on analyzing screen
  const [hasAccess, setHasAccess]           = useState<boolean | null>(null) // null = loading

  const fileInputRef           = useRef<HTMLInputElement>(null)
  const additionalFileInputRef = useRef<HTMLInputElement>(null)
  const docsRef                = useRef<{ name: string; text: string }[] | null>(null)
  const caseIdRef              = useRef<string | null>(null)
  const bescheidDataRef        = useRef<Record<string, unknown> | null>(null)
  const questionsRef           = useRef<Array<{ id: string; question: string; required?: boolean }> | null>(null)

  const STEPS = [
    { id: 'upload',    label: t('steps.upload'),    icon: Upload },
    { id: 'analyzing', label: t('steps.analyzing'), icon: ScanSearch },
    { id: 'questions', label: t('steps.questions'), icon: MessageSquare },
    { id: 'generating',label: t('steps.generating'),icon: Brain },
    { id: 'result',    label: t('steps.result'),    icon: FileCheck },
  ] as const

  const currentIdx    = STEPS.findIndex((s) => s.id === step)
  const answeredCount = questions.filter((q) => answers[q.id]?.trim()).length
  const fieldLabels   = BESCHEID_FIELD_LABELS[locale] ?? BESCHEID_FIELD_LABELS['en']

  // ── Check user access on mount ────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/user/access')
      .then((r) => r.json())
      .then((d) => setHasAccess(d.hasAccess ?? false))
      .catch(() => setHasAccess(true)) // fail open — API will enforce anyway
  }, [])

  // ── Analyzing: rotate status message every 4 seconds ─────────────────────
  useEffect(() => {
    if (step !== 'analyzing') return
    const interval = setInterval(() => {
      setAnalyzeStep((s) => (s + 1) % 3)
    }, 4000)
    return () => clearInterval(interval)
  }, [step])

  // ── Handlers ──────────────────────────────────────────────────────────────
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

  function addAdditionalFiles(incoming: FileList | null) {
    if (!incoming) return
    setAdditionalFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name))
      return [...prev, ...Array.from(incoming).filter((f) => !existing.has(f.name))]
    })
  }

  function removeAdditionalFile(name: string) {
    setAdditionalFiles((prev) => prev.filter((f) => f.name !== name))
  }

  async function handleAnalyze() {
    bescheidDataRef.current  = null
    questionsRef.current     = null
    docsRef.current          = null
    caseIdRef.current        = null
    setCaseId(null)
    setAdditionalFiles([])
    setAnalyzeStep(0)
    setAnalyzePreview(false)
    setGenerateError(null)
    setAnalyzeError(null)
    setBescheidData(null)
    setQuestions([])
    setAgentOutputData([])
    setDraftPreview('')
    setStep('analyzing')

    // Demo mode: no files, skip API call
    if (files.length === 0) {
      setTimeout(() => {
        setBescheidData(null)
        setQuestions([])
        setStep('questions')
      }, 2000)
      return
    }

    try {
      // Encode files as base64 via FileReader (non-blocking, handles large PDFs)
      const filePayloads = await Promise.all(files.map(async (f) => ({
        name: f.name,
        type: f.type,
        base64: await fileToBase64(f),
      })))

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: filePayloads,
          uiLanguage: locale,
        }),
      })

      if (res.status === 401) { router.push(`/${locale}/login?callbackUrl=/${locale}/einspruch`); return }
      if (res.status === 402) { router.push(`/${locale}/billing?reason=credits`); return }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: t('errors.analyze') }))
        setAnalyzeError(err.error ?? t('errors.analyze'))
        setStep('questions') // advance so user sees the error and can retry
        return
      }

      const data = await res.json()
      bescheidDataRef.current = data.bescheidData ?? null
      questionsRef.current    = data.followUpQuestions ?? null
      docsRef.current         = null // document content goes through bescheidData.rawText

      setBescheidData(bescheidDataRef.current)
      setQuestions(questionsRef.current ?? [])

      // Show detected data on the analyzing screen for 1.5s before moving to questions
      if (bescheidDataRef.current && Object.keys(bescheidDataRef.current).some(k => bescheidDataRef.current![k])) {
        setAnalyzePreview(true)
        await new Promise((resolve) => setTimeout(resolve, 1800))
        setAnalyzePreview(false)
      }
    } catch {
      setAnalyzeError(t('errors.connection'))
    }

    setStep('questions')
  }

  async function handleGenerate() {
    const accOutputs: AgentOutputData[] = []
    setAgentOutputData([])
    setActiveAgent(0)
    setDraftPreview('')
    setGenerateError(null)
    setStep('generating')

    // Collect documents: extracted text from analyze + any additional files
    const baseDocs = docsRef.current ?? []
    const additionalDocs = additionalFiles.length > 0
      ? await Promise.all(additionalFiles.map(async (f) => {
          // Use FileReader for additional files too so PDFs don't become garbage
          const base64 = await fileToBase64(f)
          return { name: f.name, text: `[base64:${f.type}]${base64}` }
        }))
      : []
    const docs = [...baseDocs, ...additionalDocs]

    // Create the case record now — user has committed to generating
    let activeCaseId = caseIdRef.current
    if (!activeCaseId) {
      try {
        const caseRes = await fetch('/api/cases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ useCase: type ?? 'tax', uiLanguage: locale, outputLanguage: 'de' }),
        })
        if (caseRes.status === 401) { router.push(`/${locale}/login?callbackUrl=/${locale}/einspruch`); return }
        if (caseRes.ok) {
          const { caseId: newId } = await caseRes.json()
          activeCaseId = newId
          caseIdRef.current = newId
          setCaseId(newId)
        }
      } catch { /* non-critical: pipeline can run without DB case */ }
    }

    let finalDraft: string | null = null
    let completedCaseId = activeCaseId

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: activeCaseId ?? undefined,
          bescheidData: bescheidDataRef.current ?? bescheidData ?? {},
          documents: docs,
          userAnswers: answers,
          uiLanguage: locale,
          outputLanguage: 'de',
        }),
      })

      if (res.status === 401) { router.push(`/${locale}/login?callbackUrl=/${locale}/einspruch`); return }
      if (res.status === 402) { router.push(`/${locale}/billing?reason=credits`); return }

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => '')
        setGenerateError(t('errors.generate'))
        // Stay in result step but with error and no draft
        setResult({ outputs: [], finalDraft: '', caseId: completedCaseId })
        setStep('result')
        return
      }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer    = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''

        for (const chunk of parts) {
          let eventName = 'message', dataStr = ''
          for (const line of chunk.split('\n')) {
            if (line.startsWith('event: ')) eventName = line.slice(7).trim()
            if (line.startsWith('data: '))  dataStr   = line.slice(6)
          }
          if (!dataStr) continue
          let payload: Record<string, unknown>
          try { payload = JSON.parse(dataStr) } catch { continue }

          if (eventName === 'agent_complete') {
            const out: AgentOutputData = {
              role:       String(payload.role ?? ''),
              provider:   String(payload.provider ?? ''),
              model:      String(payload.model ?? ''),
              durationMs: Number(payload.durationMs ?? 0),
              summary:    String(payload.summary ?? ''),
            }
            accOutputs.push(out)
            setAgentOutputData([...accOutputs])
            setActiveAgent(accOutputs.length)
            if (payload.draftPreview) setDraftPreview(String(payload.draftPreview))
          } else if (eventName === 'pipeline_complete') {
            finalDraft = String(payload.finalDraft ?? '')
            if (payload.caseId) {
              completedCaseId = String(payload.caseId)
              caseIdRef.current = completedCaseId
              setCaseId(completedCaseId)
            }
          } else if (eventName === 'error') {
            setGenerateError(String(payload.message ?? t('errors.generate')))
          }
        }
      }
    } catch {
      setGenerateError(t('errors.connection'))
    }

    setResult({
      outputs: accOutputs.map(o => ({ role: o.role, provider: o.provider, model: o.model })),
      finalDraft: finalDraft ?? '',
      caseId: completedCaseId,
    })
    setStep('result')
  }

  function handleDownload() {
    const draft = result?.finalDraft
    if (!draft) return
    const url = URL.createObjectURL(new Blob([draft], { type: 'text/plain;charset=utf-8' }))
    Object.assign(document.createElement('a'), { href: url, download: 'TaxaLex-Einspruch.txt' }).click()
    URL.revokeObjectURL(url)
  }

  async function handleCopy() {
    const draft = result?.finalDraft
    if (!draft) return
    await navigator.clipboard.writeText(draft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleReset() {
    setStep('upload')
    setFiles([])
    setAdditionalFiles([])
    setResult(null)
    setAnswers({})
    setBescheidData(null)
    setQuestions([])
    setActiveAgent(0)
    setAnalyzeStep(0)
    setCaseId(null)
    setAgentOutputData([])
    setDraftPreview('')
    setGenerateError(null)
    setAnalyzeError(null)
    setAnalyzePreview(false)
    docsRef.current          = null
    caseIdRef.current        = null
    bescheidDataRef.current  = null
    questionsRef.current     = null
  }

  const analyzeStatusMessages = [t('analyzing.step1'), t('analyzing.step2'), t('analyzing.step3')]

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--surface)] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Logo size="sm" href={`/${locale}`} />
          <div className="flex items-center gap-3">
            {caseId && step !== 'upload' && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--muted)] bg-[var(--background-subtle)] border border-[var(--border)] px-2.5 py-1 rounded-full">
                <FileText className="w-3 h-3" />
                {t('header.case')} #{caseId.slice(-8).toUpperCase()}
              </span>
            )}
            <span className="text-sm text-[var(--muted)]">{t('header.create')}</span>
          </div>
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
                    done   ? 'bg-brand-600 border-brand-600'
                    : active ? 'bg-[var(--surface)] border-brand-600'
                    :          'bg-[var(--surface)] border-[var(--border)]'
                  }`}>
                    {done
                      ? <CheckCircle2 className="w-4 h-4 text-white" />
                      : <s.icon className={`w-4 h-4 ${active ? 'text-brand-600' : 'text-[var(--muted)]'}`} />}
                  </div>
                  <span className={`text-[10px] font-medium hidden sm:block ${
                    active ? 'text-brand-600' : done ? 'text-brand-400' : 'text-[var(--muted)]'
                  }`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-4 sm:mb-3 transition-colors ${done ? 'bg-brand-400' : 'bg-[var(--border)]'}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* ═══ Step 1 — Upload ═══ */}
        {step === 'upload' && (
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">{t('upload.title')}</h1>
            <p className="text-[var(--muted)] text-sm mb-6">{t('upload.subtitle')}</p>

            {useCaseLabel && (
              <div className="flex items-center gap-2 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 rounded-xl px-4 py-2.5 mb-5 text-sm">
                <Tag className="w-4 h-4 text-brand-500 shrink-0" />
                <span className="text-brand-700 dark:text-brand-300">{useCaseLabel}</span>
              </div>
            )}

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
              <div className="w-14 h-14 bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Upload className="w-7 h-7 text-brand-500" />
              </div>
              <p className="font-semibold text-[var(--foreground)] mb-1">{t('upload.dropzoneTitle')}</p>
              <p className="text-sm text-[var(--muted)]">{t('upload.dropzoneClick')}</p>
              <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                {['PDF', 'DOCX', 'JPG / PNG', 'TXT'].map((ext) => (
                  <span key={ext} className="text-xs bg-[var(--background-subtle)] text-[var(--muted)] px-2.5 py-1 rounded-full border border-[var(--border)]">{ext}</span>
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
                      <p className="text-xs text-[var(--muted)]">{(f.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(f.name) }}
                      className="p-1.5 text-[var(--muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {hasAccess === false && files.length > 0 && (
              <div className="mt-5 flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    {locale === 'de' ? 'Kein Guthaben verfügbar.' : 'No credits available.'}
                  </p>
                  <a href={`/${locale}/billing`} className="text-xs text-amber-700 dark:text-amber-400 underline hover:no-underline">
                    {locale === 'de' ? 'Jetzt aufladen →' : 'Top up now →'}
                  </a>
                </div>
              </div>
            )}
            <button
              onClick={handleAnalyze}
              disabled={hasAccess === false && files.length > 0}
              className="mt-6 w-full bg-brand-600 text-white py-3.5 rounded-xl font-semibold hover:bg-brand-700 active:bg-brand-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {files.length === 0
                ? <><ScanSearch className="w-4 h-4" />{t('upload.demoButton')}</>
                : <>{t('upload.analyze')}<ArrowRight className="w-4 h-4" /></>}
            </button>

            <div className="flex items-center justify-center gap-6 mt-5 flex-wrap">
              {([
                [ShieldCheck, t('upload.security.ssl')],
                [Globe,       t('upload.security.eu')],
                [Lock,        t('upload.security.noStore')],
              ] as const).map(([Icon, label]) => (
                <span key={label} className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                  <Icon className="w-3.5 h-3.5 text-green-500" />{label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ═══ Step 2 — Analyzing ═══ */}
        {step === 'analyzing' && (
          <div className="py-8 flex flex-col items-center">
            <div className={`w-16 h-16 border rounded-2xl flex items-center justify-center mb-5 transition-colors ${analyzePreview ? 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800' : 'bg-brand-50 dark:bg-brand-950/40 border-brand-200 dark:border-brand-800'}`}>
              {analyzePreview
                ? <CheckCircle2 className="w-8 h-8 text-green-600" />
                : <ScanSearch className="w-8 h-8 text-brand-600 animate-pulse" />}
            </div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2 text-center">
              {analyzePreview
                ? (locale === 'de' ? 'Erkannte Daten' : 'Detected data')
                : t('analyzing.title')}
            </h1>
            <p className="text-sm text-[var(--muted)] mb-6 min-h-[1.25rem] transition-all text-center">
              {analyzePreview
                ? (locale === 'de' ? 'Bescheid erfolgreich ausgelesen — weiterleiten…' : 'Notice successfully read — redirecting…')
                : files.length > 0 ? analyzeStatusMessages[analyzeStep] : t('analyzing.demoMode')}
            </p>

            {/* Detected data preview — shown briefly after analyze returns */}
            {analyzePreview && bescheidData && (
              <div className="w-full max-w-sm bg-[var(--surface)] border border-green-200 dark:border-green-800 rounded-2xl p-4 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 bg-green-100 dark:bg-green-950/40 rounded-md flex items-center justify-center">
                    <ScanSearch className="w-3 h-3 text-green-600" />
                  </div>
                  <p className="text-xs font-semibold text-green-700 dark:text-green-400">
                    {t('questions.detectedData')}
                  </p>
                </div>
                <div className="space-y-2">
                  {Object.entries(bescheidData).map(([k, v]) => {
                    if (!v && v !== 0) return null
                    if (k === 'rawText') return null
                    const label = fieldLabels[k] ?? k
                    const display = typeof v === 'number'
                      ? v.toLocaleString(locale, { minimumFractionDigits: 2 })
                      : String(v)
                    return (
                      <div key={k} className="flex items-start justify-between gap-3">
                        <span className="text-xs text-[var(--muted)]">{label}</span>
                        <span className="text-xs font-semibold text-[var(--foreground)] text-right max-w-[160px] leading-tight">{display}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Spinner while waiting for analyze API */}
            {!analyzePreview && files.length > 0 && (
              <div className="w-full max-w-xs mb-6">
                <div className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 mb-4">
                  <FileText className="w-5 h-5 text-brand-500 shrink-0" />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">{files[0]?.name}</p>
                    {files.length > 1 && (
                      <p className="text-xs text-[var(--muted)]">+{files.length - 1} more</p>
                    )}
                  </div>
                  <Loader2 className="w-4 h-4 text-brand-500 animate-spin shrink-0" />
                </div>
                <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
              </div>
            )}

            {!analyzePreview && (
              <p className="text-xs text-[var(--muted)] text-center">
                {files.length > 0 ? t('analyzing.liveMode') : t('analyzing.demoMode')}
              </p>
            )}
          </div>
        )}

        {/* ═══ Step 3 — Questions ═══ */}
        {step === 'questions' && (
          <div>
            {/* Analyze error banner */}
            {analyzeError && (
              <div className="mb-5 flex items-start gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">{analyzeError}</p>
                  <button
                    onClick={handleReset}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline mt-1">
                    {t('errors.backToUpload')}
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">{t('questions.title')}</h1>
                <p className="text-[var(--muted)] text-sm">{t('questions.subtitle')}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className={`text-lg font-bold ${answeredCount === questions.length && questions.length > 0 ? 'text-green-600' : 'text-[var(--foreground)]'}`}>
                  {answeredCount} <span className="text-[var(--muted)] font-normal text-base">/ {questions.length}</span>
                </p>
                <p className="text-xs text-[var(--muted)]">{t('questions.answered')}</p>
              </div>
            </div>

            <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden mb-7">
              <div
                className={`h-full rounded-full transition-all duration-500 ${answeredCount === questions.length && questions.length > 0 ? 'bg-green-500' : 'bg-brand-500'}`}
                style={{ width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }} />
            </div>

            <div className="grid lg:grid-cols-[1fr_240px] gap-6">
              <div className="space-y-4">
                {questions.length === 0 && !analyzeError && (
                  <p className="text-sm text-[var(--muted)] italic py-4">
                    {files.length === 0
                      ? (locale === 'de' ? 'Demo-Modus: Klicken Sie auf „Einspruch generieren" für einen Beispielentwurf.' : 'Demo mode: Click "Generate" for a sample draft.')
                      : (locale === 'de' ? 'Keine weiteren Rückfragen — Sie können direkt generieren.' : 'No further questions — you can generate directly.')}
                  </p>
                )}
                {questions.map((q, i) => {
                  const qType = q.type ?? 'text'
                  const answered = !!answers[q.id]?.trim()
                  return (
                    <div key={q.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
                      <div className="flex items-start gap-3">
                        <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          answered
                            ? 'bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400'
                            : 'bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400'
                        }`}>
                          {answered ? <CheckCircle2 className="w-3.5 h-3.5" /> : String(i + 1)}
                        </span>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-[var(--foreground)] mb-3">
                            {q.question}
                            {q.required
                              ? <span className="text-red-500 ml-1.5 text-xs font-normal">{t('questions.required')}</span>
                              : <span className="text-[var(--muted)] ml-1.5 text-xs font-normal">{t('questions.optional')}</span>}
                          </label>

                          {/* Yes/No question → two radio-style buttons */}
                          {qType === 'yesno' && (
                            <div className="flex gap-2">
                              {[
                                { value: locale === 'de' ? 'Ja' : 'Yes', label: locale === 'de' ? 'Ja' : 'Yes' },
                                { value: locale === 'de' ? 'Nein' : 'No', label: locale === 'de' ? 'Nein' : 'No' },
                              ].map(({ value, label }) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: value }))}
                                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                                    answers[q.id] === value
                                      ? 'bg-brand-600 border-brand-600 text-white'
                                      : 'bg-[var(--background-subtle)] border-[var(--border)] text-[var(--foreground)] hover:border-brand-300'
                                  }`}>
                                  {label}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Amount question → number input */}
                          {qType === 'amount' && (
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">€</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="w-full pl-8 pr-4 py-3 text-sm border border-[var(--border)] rounded-xl bg-[var(--background-subtle)] text-[var(--foreground)] focus:bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-colors"
                                placeholder="0,00"
                                value={answers[q.id] ?? ''}
                                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} />
                            </div>
                          )}

                          {/* Text question → textarea */}
                          {qType === 'text' && (
                            <textarea
                              rows={3}
                              className="w-full border border-[var(--border)] rounded-xl px-4 py-3 text-sm bg-[var(--background-subtle)] text-[var(--foreground)] focus:bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-colors resize-none placeholder:text-[var(--muted)]"
                              placeholder={q.required ? '' : t('questions.optional') + '…'}
                              value={answers[q.id] ?? ''}
                              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Detected bescheid data sidebar */}
              {bescheidData && Object.keys(bescheidData).length > 0 && (
                <div className="lg:sticky lg:top-24 h-fit">
                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-950/40 rounded-lg flex items-center justify-center">
                        <ScanSearch className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <p className="text-xs font-semibold text-[var(--foreground)]">{t('questions.detectedData')}</p>
                      <span className="ml-auto text-[10px] text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-full font-medium">
                        {t('questions.liveBadge')}
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {Object.entries(bescheidData).map(([k, v]) => {
                        if (!v && v !== 0) return null
                        const label = fieldLabels[k] ?? k
                        const display = typeof v === 'number'
                          ? v.toLocaleString(locale, { minimumFractionDigits: 2 })
                          : String(v)
                        return (
                          <div key={k} className="flex items-start justify-between gap-2">
                            <span className="text-xs text-[var(--muted)]">{label}</span>
                            <span className="text-xs font-semibold text-[var(--foreground)] text-right max-w-[130px] leading-tight">{display}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional documents upload */}
            <div className="mt-6 border border-dashed border-[var(--border)] rounded-2xl p-4 bg-[var(--background-subtle)]">
              <div className="flex items-center gap-2 mb-2">
                <Paperclip className="w-4 h-4 text-[var(--muted)]" />
                <p className="text-sm font-semibold text-[var(--foreground)]">{t('questions.additionalDocs.title')}</p>
                <span className="ml-auto text-xs text-[var(--muted)] bg-[var(--surface)] border border-[var(--border)] px-2 py-0.5 rounded-full">
                  {t('questions.additionalDocs.optional')}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] mb-3 leading-relaxed">{t('questions.additionalDocs.subtitle')}</p>

              {additionalFiles.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {additionalFiles.map((f) => (
                    <div key={f.name} className="flex items-center gap-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-3 py-2">
                      <FileText className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                      <span className="text-xs font-medium text-[var(--foreground)] flex-1 truncate">{f.name}</span>
                      <span className="text-xs text-[var(--muted)]">{(f.size / 1024).toFixed(0)} KB</span>
                      <button
                        onClick={() => removeAdditionalFile(f.name)}
                        className="p-0.5 text-[var(--muted)] hover:text-red-500 transition-colors rounded">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => additionalFileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors font-medium">
                <Plus className="w-4 h-4" />{t('questions.additionalDocs.add')}
              </button>
              <input
                ref={additionalFileInputRef}
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.webp"
                onChange={(e) => addAdditionalFiles(e.target.files)} />
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep('upload')}
                className="flex items-center gap-2 border border-[var(--border)] text-[var(--foreground)] px-5 py-3 rounded-xl text-sm font-medium hover:bg-[var(--background-subtle)] transition-colors">
                <ArrowLeft className="w-4 h-4" />{t('questions.back')}
              </button>
              <button
                onClick={handleGenerate}
                disabled={!!analyzeError && !bescheidData}
                className="flex-1 bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <Brain className="w-4 h-4" />
                {additionalFiles.length > 0
                  ? t('questions.generateWithDocs').replace('{count}', String(files.length + additionalFiles.length))
                  : t('questions.generate')}
              </button>
            </div>
          </div>
        )}

        {/* ═══ Step 4 — Generating ═══ */}
        {step === 'generating' && (
          <div className="py-4">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-50 dark:bg-brand-950/40 rounded-2xl mb-4">
                <Brain className="w-8 h-8 text-brand-600 animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">{t('generating.title')}</h1>
              <p className="text-sm text-[var(--muted)]">
                {activeAgent < AGENT_IDS.length
                  ? t(`generating.agents.${AGENT_IDS[activeAgent]}`)
                  : locale === 'de' ? 'Schreiben wird finalisiert…' : 'Finalising letter…'}
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-2">
                    <span>
                      {activeAgent < AGENT_IDS.length
                        ? t('generating.step')
                            .replace('{current}', String(activeAgent + 1))
                            .replace('{total}', String(AGENT_IDS.length))
                            .replace('{label}', t(`generating.agents.${AGENT_IDS[activeAgent]}`).split('…')[0])
                        : t('generating.allDone').replace('{n}', String(AGENT_IDS.length))}
                    </span>
                    <span className="font-medium">
                      {activeAgent >= AGENT_IDS.length ? '100 %' : `${Math.round((activeAgent / AGENT_IDS.length) * 100)} %`}
                    </span>
                  </div>
                  <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all duration-700"
                      style={{ width: activeAgent >= AGENT_IDS.length ? '100%' : `${(activeAgent / AGENT_IDS.length) * 100}%` }} />
                  </div>
                </div>

                <div className="space-y-2">
                  {AGENT_IDS.map((agentId, i) => {
                    const done   = i < activeAgent
                    const active = i === activeAgent
                    const outputData = agentOutputData.find(o => o.role === agentId)
                    return (
                      <div key={agentId} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm transition-all duration-300 ${
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
                            {t(`generating.agents.${agentId}`)}
                          </p>
                          {done && outputData && (
                            <p className="text-xs mt-0.5 text-green-600/70 dark:text-green-500/70 truncate">
                              {outputData.summary}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            done   ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                            : active ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300'
                            :          'bg-[var(--border)] text-[var(--muted)]'
                          }`}>{AGENT_PROVIDERS[agentId]}</span>
                          {done && outputData && (
                            <p className="text-[10px] text-[var(--muted)] mt-0.5">
                              {(outputData.durationMs / 1000).toFixed(1)}s
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="flex items-center gap-2 mt-4 text-xs text-[var(--muted)]">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('generating.timeWarning')}</span>
                </div>
              </div>

              <div className="hidden lg:flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">{t('generating.draftTitle')}</p>
                  {activeAgent < AGENT_IDS.length && (
                    <span className="flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400">
                      <Loader2 className="w-3 h-3 animate-spin" />{t('generating.writing')}
                    </span>
                  )}
                </div>
                <div className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--background-subtle)]">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                    <span className="ml-2 text-xs text-[var(--muted)]">TaxaLex-Einspruch.txt</span>
                    {caseId && <span className="ml-auto text-[10px] text-green-600 dark:text-green-400">● Live</span>}
                  </div>
                  <pre className="p-4 text-xs font-mono text-[var(--foreground)] leading-relaxed whitespace-pre-wrap h-72 overflow-y-auto">
                    {draftPreview
                      ? <>{draftPreview}{activeAgent < AGENT_IDS.length && <span className="animate-pulse text-brand-500">▌</span>}</>
                      : <span className="text-[var(--muted)] italic">{t('generating.draftPlaceholder')}</span>}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Step 5 — Result ═══ */}
        {step === 'result' && result && (
          <div>
            {/* Generate error banner */}
            {generateError && (
              <div className="mb-5 flex items-start gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">{generateError}</p>
                  <button onClick={() => setStep('questions')} className="text-xs text-red-600 dark:text-red-400 hover:underline mt-1">
                    {t('errors.backToUpload')}
                  </button>
                </div>
              </div>
            )}

            {result.finalDraft ? (
              <>
                <div className="text-center mb-8">
                  <div className="relative inline-flex mb-4">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-950/40 rounded-2xl flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">{t('result.title')}</h1>
                  <p className="text-sm text-[var(--muted)] mb-3">{t('result.subtitle')}</p>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {(['legal', 'bfh', 'formal'] as const).map((key) => (
                      <span key={key} className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                        key === 'legal'  ? 'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950/40 dark:border-green-800'
                        : key === 'bfh' ? 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/40 dark:border-blue-800'
                        :                 'text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-950/40 dark:border-purple-800'
                      }`}>{t(`result.badges.${key}`)}</span>
                    ))}
                  </div>
                </div>

                {/* Agent summary */}
                {agentOutputData.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-6">
                    {AGENT_IDS.map((agentId) => {
                      const outputData = agentOutputData.find(o => o.role === agentId)
                      return (
                        <div key={agentId} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3">
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className={`w-5 h-5 rounded-md ${AGENT_COLORS[agentId]} flex items-center justify-center shrink-0`}>
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-[10px] font-semibold text-[var(--muted)]">{AGENT_PROVIDERS[agentId]}</span>
                            {outputData && (
                              <span className="ml-auto text-[10px] text-[var(--muted)]">{(outputData.durationMs / 1000).toFixed(1)}s</span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-[var(--foreground)] leading-tight mb-1 line-clamp-2">
                            {t(`generating.agents.${agentId}`)}
                          </p>
                          {outputData?.summary && (
                            <p className="text-[10px] text-[var(--muted)] leading-tight line-clamp-2">{outputData.summary}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Draft preview */}
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
                    <span className="text-xs text-[var(--muted)]">{locale === 'de' ? 'Entwurf · bearbeitbar' : 'Draft · editable'}</span>
                  </div>
                  <pre className="p-5 font-mono text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
                    {result.finalDraft}
                  </pre>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-2 bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors">
                    <Download className="w-4 h-4" />{t('result.download')}
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-2 border border-[var(--border)] px-5 py-3 rounded-xl font-medium text-sm hover:bg-[var(--background-subtle)] transition-colors min-w-[120px]">
                    {copied
                      ? <><CheckCircle2 className="w-4 h-4 text-green-500" />{t('result.copied')}</>
                      : <><Copy className="w-4 h-4" />{t('result.copy')}</>}
                  </button>
                </div>

                {result.caseId && (
                  <button
                    onClick={() => router.push(`/${locale}/cases/${result.caseId}`)}
                    className="w-full mb-5 flex items-center justify-center gap-2 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 py-3 rounded-xl font-semibold hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors">
                    <FolderOpen className="w-4 h-4" />{t('result.openInCases')}
                  </button>
                )}

                {/* Next steps */}
                <div className="bg-[var(--background-subtle)] border border-[var(--border)] rounded-2xl p-5 mb-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">{t('result.nextSteps.title')}</p>
                  <div className="space-y-3">
                    {(['check', 'print', 'send'] as const).map((key, i) => (
                      <div key={key} className="flex items-start gap-3 text-sm">
                        <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                        <span className="text-[var(--muted)]">{t(`result.nextSteps.${key}`)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* No draft — generate failed entirely */
              !generateError && (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
                  <p className="text-[var(--muted)]">{t('errors.generate')}</p>
                </div>
              )
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />{t('result.newAppeal')}
              </button>
              <span className="text-[var(--border)]">·</span>
              <p className="text-xs text-[var(--muted)]">
                <AlertCircle className="w-3 h-3 inline mr-0.5" />{t('result.legalNote')}
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
