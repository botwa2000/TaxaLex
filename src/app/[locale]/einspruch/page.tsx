'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
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
  ShieldCheck,
  Globe,
  Lock,
  Sparkles,
  FolderOpen,
  Clock,
  Plus,
  Paperclip,
  Building,
  Hash,
  Calendar,
  Euro,
  Scale,
  MapPin,
  User,
  Gavel,
  Home,
  HeartPulse,
  Car,
  Shield,
  type LucideIcon,
} from 'lucide-react'
import { Logo } from '@/components/Logo'

type Step = 'upload' | 'analyzing' | 'questions' | 'generating' | 'result'

// ── Agent config (labels come from translations) ─────────────────────────────
const AGENT_IDS = [
  'drafter',
  'reviewer',
  'factchecker',
  'adversary',
  'consolidator',
] as const
type AgentId = (typeof AGENT_IDS)[number]

const AGENT_PROVIDERS: Record<AgentId, string> = {
  drafter: 'Claude',
  reviewer: 'Gemini',
  factchecker: 'Perplexity',
  adversary: 'Claude',
  consolidator: 'Claude',
}

const AGENT_COLORS: Record<AgentId, string> = {
  drafter: 'bg-blue-500',
  reviewer: 'bg-purple-500',
  factchecker: 'bg-green-500',
  adversary: 'bg-red-500',
  consolidator: 'bg-brand-500',
}

const USE_CASE_KEYS: Record<string, string> = {
  tax: 'Einkommensteuerbescheid',
  jobcenter: 'Jobcenter / Bürgergeld-Bescheid',
  rente: 'Rentenbescheid',
  bussgeld: 'Bußgeldbescheid',
  krankenversicherung: 'Krankenkassenbescheid',
  kuendigung: 'Kündigung',
  miete: 'Mieterhöhung',
  grundsteuer: 'Grundsteuerbescheid',
}

interface DetectedField {
  key: string
  label: string
  value: string
  icon: string
  importance: 'high' | 'medium' | 'low'
}

interface DetectedDocType {
  category: string
  label: string
  icon: string
}

// Maps icon name strings from the AI to Lucide components
const FIELD_ICON_MAP: Record<string, LucideIcon> = {
  building: Building,
  hash: Hash,
  calendar: Calendar,
  euro: Euro,
  scale: Scale,
  'map-pin': MapPin,
  clock: Clock,
  user: User,
  'file-text': FileText,
  'alert-circle': AlertCircle,
  tag: Tag,
  shield: Shield,
  car: Car,
  gavel: Gavel,
  home: Home,
  'heart-pulse': HeartPulse,
}

function resolveFieldIcon(name: string): LucideIcon {
  return FIELD_ICON_MAP[name] ?? FileText
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
  const router = useRouter()
  const params = useParams()
  const locale = typeof params?.locale === 'string' ? params.locale : 'de'
  const t = useTranslations('wizard')
  const tCommon = useTranslations('common')

  const type = searchParams.get('type')
  const useCaseLabel = type ? (USE_CASE_KEYS[type] ?? type.replace(/-/g, ' ')) : null

  // ── State ─────────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>('upload')
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [bescheidData, setBescheidData] = useState<Record<string, unknown> | null>(null)
  const [questions, setQuestions] = useState<
    Array<{
      id: string
      question: string
      required?: boolean
      type?: 'text' | 'yesno' | 'amount' | 'date'
      background?: string
    }>
  >([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [activeAgent, setActiveAgent] = useState(0)
  const [activeAgentRoles, setActiveAgentRoles] = useState<Set<string>>(new Set())
  const [isUploading, setIsUploading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [caseId, setCaseId] = useState<string | null>(null)
  const [agentOutputData, setAgentOutputData] = useState<AgentOutputData[]>([])
  const [draftPreview, setDraftPreview] = useState<string>('')
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [resultLocked, setResultLocked] = useState(false) // true = freemium gate active
  const [detectedFields, setDetectedFields] = useState<DetectedField[]>([])
  const [detectedDocType, setDetectedDocType] = useState<DetectedDocType | null>(null)
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([])
  const [hasAccess, setHasAccess] = useState<boolean | null>(null) // null = loading

  const fileInputRef = useRef<HTMLInputElement>(null)
  const additionalFileInputRef = useRef<HTMLInputElement>(null)
  const docsRef = useRef<{ name: string; text: string }[] | null>(null)
  const caseIdRef = useRef<string | null>(null)
  const bescheidDataRef = useRef<Record<string, unknown> | null>(null)
  const questionsRef = useRef<Array<{
    id: string
    question: string
    required?: boolean
    type?: string
    background?: string
  }> | null>(null)

  const STEPS = [
    { id: 'upload', label: t('steps.upload'), icon: Upload },
    { id: 'analyzing', label: t('steps.analyzing'), icon: ScanSearch },
    { id: 'questions', label: t('steps.questions'), icon: MessageSquare },
    { id: 'generating', label: t('steps.generating'), icon: Brain },
    { id: 'result', label: t('steps.result'), icon: FileCheck },
  ] as const

  const currentIdx = STEPS.findIndex((s) => s.id === step)
  const answeredCount = questions.filter((q) => answers[q.id]?.trim()).length
  const requiredUnanswered = questions.filter(
    (q) => q.required && !answers[q.id]?.trim()
  ).length
  // ── Check user access on mount ────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/user/access')
      .then((r) => r.json())
      .then((d) => setHasAccess(d.hasAccess ?? false))
      .catch(() => setHasAccess(true)) // fail open — API will enforce anyway
  }, [])

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
    bescheidDataRef.current = null
    questionsRef.current = null
    docsRef.current = null
    caseIdRef.current = null
    setCaseId(null)
    setAdditionalFiles([])
    setDetectedFields([])
    setDetectedDocType(null)
    setGenerateError(null)
    setAnalyzeError(null)
    setBescheidData(null)
    setQuestions([])
    setAgentOutputData([])
    setDraftPreview('')
    setStep('analyzing')

    // Demo mode — simulate streaming with staggered field reveals
    if (files.length === 0) {
      const demoDocType: DetectedDocType = {
        category: 'tax_notice',
        label: locale === 'de' ? 'Einkommensteuerbescheid' : 'Income Tax Notice',
        icon: 'file-text',
      }
      const demoFields: DetectedField[] = [
        {
          key: 'authority',
          label: locale === 'de' ? 'Finanzamt' : 'Tax Office',
          value: 'Finanzamt München',
          icon: 'building',
          importance: 'high',
        },
        {
          key: 'reference',
          label: locale === 'de' ? 'Steuernummer' : 'Tax Number',
          value: '143/234/56789',
          icon: 'hash',
          importance: 'high',
        },
        {
          key: 'date',
          label: locale === 'de' ? 'Bescheiddatum' : 'Notice Date',
          value: '12.03.2023',
          icon: 'calendar',
          importance: 'medium',
        },
        {
          key: 'noticeType',
          label: locale === 'de' ? 'Art des Bescheids' : 'Notice Type',
          value: locale === 'de' ? 'Einkommensteuer 2022' : 'Income Tax 2022',
          icon: 'tag',
          importance: 'high',
        },
        {
          key: 'amount',
          label: locale === 'de' ? 'Nachzahlung' : 'Amount Due',
          value: '2.847,50 €',
          icon: 'euro',
          importance: 'high',
        },
      ]
      const demoBescheid = {
        docType: { category: 'tax_notice', label: demoDocType.label },
        authority: 'Finanzamt München',
        reference: '143/234/56789',
        date: '12.03.2023',
        noticeType: 'Einkommensteuer 2022',
        amount: '2847.50',
      }
      const demoQuestions = [
        {
          id: 'dq1',
          question:
            locale === 'de'
              ? 'Hatten Sie im Jahr 2022 Einnahmen aus mehreren Quellen (z.B. Anstellung und Freelance)?'
              : 'Did you have income from multiple sources in 2022 (e.g. employment and freelance)?',
          required: true,
          type: 'yesno' as const,
          background:
            locale === 'de'
              ? 'Mehrere Einkunftsarten können die Steuerprogression erhöhen. Nach § 32a EStG wird das Gesamteinkommen progressiv besteuert.'
              : 'Multiple income types can affect tax progression. Under § 32a EStG, total income is taxed progressively.',
        },
        {
          id: 'dq2',
          question:
            locale === 'de'
              ? 'Wann haben Sie Ihre Steuererklärung für 2022 eingereicht?'
              : 'When did you file your 2022 tax return?',
          required: true,
          type: 'date' as const,
          background:
            locale === 'de'
              ? 'Das Einreichungsdatum ist relevant für die Einspruchsfrist (§ 355 AO: 1 Monat nach Bekanntgabe des Bescheids).'
              : 'The filing date determines the objection deadline (§ 355 AO: 1 month after notice).',
        },
        {
          id: 'dq3',
          question:
            locale === 'de'
              ? 'Welche Werbungskosten bzw. Betriebsausgaben haben Sie geltend gemacht?'
              : 'What work-related expenses or business costs did you claim?',
          required: false,
          type: 'text' as const,
          background:
            locale === 'de'
              ? 'Werbungskosten (§ 9 EStG) und Betriebsausgaben (§ 4 Abs. 4 EStG) mindern das zu versteuernde Einkommen.'
              : 'Work expenses (§ 9 EStG) and business costs (§ 4 para. 4 EStG) reduce taxable income.',
        },
      ]

      await new Promise((r) => setTimeout(r, 300))
      setDetectedDocType(demoDocType)
      for (const field of demoFields) {
        await new Promise((r) => setTimeout(r, 380))
        setDetectedFields((prev) => [...prev, field])
      }
      await new Promise((r) => setTimeout(r, 600))

      bescheidDataRef.current = demoBescheid
      questionsRef.current = demoQuestions
      setBescheidData(demoBescheid)
      setQuestions(demoQuestions)
      setStep('questions')
      return
    }

    try {
      // isUploading shows "Uploading…" while files are encoded and sent to the server
      setIsUploading(true)
      const filePayloads = await Promise.all(
        files.map(async (f) => ({
          name: f.name,
          type: f.type,
          base64: await fileToBase64(f),
        }))
      )

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: filePayloads, uiLanguage: locale }),
      })
      setIsUploading(false)

      if (res.status === 401) {
        router.push(`/${locale}/login?callbackUrl=/${locale}/einspruch`)
        return
      }

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: t('errors.analyze') }))
        setAnalyzeError(err.error ?? t('errors.analyze'))
        setStep('questions')
        return
      }

      // Consume the SSE stream — fields arrive and are rendered in real-time
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''

        for (const part of parts) {
          let eventName = '',
            dataStr = ''
          for (const line of part.split('\n')) {
            if (line.startsWith('event: ')) eventName = line.slice(7).trim()
            if (line.startsWith('data: ')) dataStr = line.slice(6).trim()
          }
          if (!dataStr) continue
          try {
            const payload = JSON.parse(dataStr)
            if (eventName === 'doc_type') {
              setDetectedDocType(payload as DetectedDocType)
            } else if (eventName === 'field') {
              setDetectedFields((prev) => [...prev, payload as DetectedField])
            } else if (eventName === 'complete') {
              bescheidDataRef.current = payload.bescheidData ?? null
              questionsRef.current = payload.followUpQuestions ?? null
              setBescheidData(payload.bescheidData)
              setQuestions(
                (payload.followUpQuestions ?? []) as Array<{
                  id: string
                  question: string
                  required?: boolean
                  type?: 'text' | 'yesno' | 'amount' | 'date'
                  background?: string
                }>
              )
            } else if (eventName === 'error') {
              setAnalyzeError(payload.message ?? t('errors.analyze'))
            }
          } catch {
            /* malformed SSE chunk — skip */
          }
        }
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
    const additionalDocs =
      additionalFiles.length > 0
        ? await Promise.all(
            additionalFiles.map(async (f) => {
              // Use FileReader for additional files too so PDFs don't become garbage
              const base64 = await fileToBase64(f)
              return { name: f.name, text: `[base64:${f.type}]${base64}` }
            })
          )
        : []
    const docs = [...baseDocs, ...additionalDocs]

    // Create the case record now — user has committed to generating
    let activeCaseId = caseIdRef.current
    if (!activeCaseId) {
      try {
        const caseRes = await fetch('/api/cases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            useCase: type ?? 'tax',
            uiLanguage: locale,
            outputLanguage: 'de',
          }),
        })
        if (caseRes.status === 401) {
          router.push(`/${locale}/login?callbackUrl=/${locale}/einspruch`)
          return
        }
        if (caseRes.ok) {
          const { caseId: newId } = await caseRes.json()
          activeCaseId = newId
          caseIdRef.current = newId
          setCaseId(newId)
        }
      } catch {
        /* non-critical: pipeline can run without DB case */
      }
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

      if (res.status === 401) {
        router.push(`/${locale}/login?callbackUrl=/${locale}/einspruch`)
        return
      }
      if (res.status === 402) {
        router.push(`/${locale}/billing?reason=credits`)
        return
      }

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => '')
        setGenerateError(t('errors.generate'))
        // Stay in result step but with error and no draft
        setResult({ outputs: [], finalDraft: '', caseId: completedCaseId })
        setStep('result')
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''

        for (const chunk of parts) {
          let eventName = 'message',
            dataStr = ''
          for (const line of chunk.split('\n')) {
            if (line.startsWith('event: ')) eventName = line.slice(7).trim()
            if (line.startsWith('data: ')) dataStr = line.slice(6)
          }
          if (!dataStr) continue
          let payload: Record<string, unknown>
          try {
            payload = JSON.parse(dataStr)
          } catch {
            continue
          }

          if (eventName === 'agent_start') {
            // Show spinner for this agent immediately — important for the parallel middle stage
            // where reviewer/factchecker/adversary all start at once
            setActiveAgentRoles((prev) => new Set([...prev, String(payload.role ?? '')]))
          } else if (eventName === 'agent_complete') {
            const role = String(payload.role ?? '')
            const out: AgentOutputData = {
              role,
              provider: String(payload.provider ?? ''),
              model: String(payload.model ?? ''),
              durationMs: Number(payload.durationMs ?? 0),
              summary: String(payload.summary ?? ''),
            }
            accOutputs.push(out)
            setAgentOutputData([...accOutputs])
            setActiveAgent(accOutputs.length)
            // Remove from active set once done
            setActiveAgentRoles((prev) => {
              const s = new Set(prev)
              s.delete(role)
              return s
            })
            if (payload.draftPreview) setDraftPreview(String(payload.draftPreview))
          } else if (eventName === 'pipeline_complete') {
            finalDraft = String(payload.finalDraft ?? '')
            if (payload.locked) setResultLocked(true)
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
      outputs: accOutputs.map((o) => ({
        role: o.role,
        provider: o.provider,
        model: o.model,
      })),
      finalDraft: finalDraft ?? '',
      caseId: completedCaseId,
    })
    setStep('result')
  }

  function handleDownload() {
    const draft = result?.finalDraft
    if (!draft) return
    const url = URL.createObjectURL(
      new Blob([draft], { type: 'text/plain;charset=utf-8' })
    )
    Object.assign(document.createElement('a'), {
      href: url,
      download: 'TaxaLex-Einspruch.txt',
    }).click()
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
    setActiveAgentRoles(new Set())
    setIsUploading(false)
    setDetectedFields([])
    setDetectedDocType(null)
    setCaseId(null)
    setAgentOutputData([])
    setDraftPreview('')
    setGenerateError(null)
    setAnalyzeError(null)
    setResultLocked(false)
    docsRef.current = null
    caseIdRef.current = null
    bescheidDataRef.current = null
    questionsRef.current = null
  }

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
            const done = i < currentIdx,
              active = i === currentIdx
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
                      active
                        ? 'text-brand-600'
                        : done
                          ? 'text-brand-400'
                          : 'text-[var(--muted)]'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 mb-4 sm:mb-3 transition-colors ${done ? 'bg-brand-400' : 'bg-[var(--border)]'}`}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* ═══ Step 1 — Upload ═══ */}
        {step === 'upload' && (
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">
              {t('upload.title')}
            </h1>
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
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)
                addFiles(e.dataTransfer.files)
              }}
            >
              <div className="w-14 h-14 bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Upload className="w-7 h-7 text-brand-500" />
              </div>
              <p className="font-semibold text-[var(--foreground)] mb-1">
                {t('upload.dropzoneTitle')}
              </p>
              <p className="text-sm text-[var(--muted)]">{t('upload.dropzoneClick')}</p>
              <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                {['PDF', 'DOCX', 'JPG / PNG', 'TXT'].map((ext) => (
                  <span
                    key={ext}
                    className="text-xs bg-[var(--background-subtle)] text-[var(--muted)] px-2.5 py-1 rounded-full border border-[var(--border)]"
                  >
                    {ext}
                  </span>
                ))}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.webp"
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>

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
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">
                        {f.name}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {(f.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(f.name)
                      }}
                      className="p-1.5 text-[var(--muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {hasAccess === false && files.length > 0 && (
              <div className="mt-5 flex items-start gap-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3.5">
                <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    {t('upload.noCredits')}
                  </p>
                  <a
                    href={`/${locale}/billing`}
                    className="text-xs text-blue-600 dark:text-blue-400 underline hover:no-underline"
                  >
                    {t('upload.topUpLink')}
                  </a>
                </div>
              </div>
            )}
            <button
              onClick={handleAnalyze}
              className="mt-6 w-full bg-brand-600 text-white py-3.5 rounded-xl font-semibold hover:bg-brand-700 active:bg-brand-800 transition-colors flex items-center justify-center gap-2"
            >
              {files.length === 0 ? (
                <>
                  <ScanSearch className="w-4 h-4" />
                  {t('upload.demoButton')}
                </>
              ) : (
                <>
                  {t('upload.analyze')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-6 mt-5 flex-wrap">
              {(
                [
                  [ShieldCheck, t('upload.security.ssl')],
                  [Globe, t('upload.security.eu')],
                  [Lock, t('upload.security.noStore')],
                ] as const
              ).map(([Icon, label]) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 text-xs text-[var(--muted)]"
                >
                  <Icon className="w-3.5 h-3.5 text-green-500" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ═══ Step 2 — Analyzing ═══ */}
        {step === 'analyzing' && (
          <div className="py-8 flex flex-col items-center">
            <div
              className={`w-16 h-16 border rounded-2xl flex items-center justify-center mb-5 transition-all duration-500 ${
                detectedDocType
                  ? 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800'
                  : 'bg-brand-50 dark:bg-brand-950/40 border-brand-200 dark:border-brand-800'
              }`}
            >
              {detectedDocType ? (
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              ) : (
                <ScanSearch className="w-8 h-8 text-brand-600 animate-pulse" />
              )}
            </div>

            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1 text-center">
              {detectedDocType ? t('analyzing.detectedTitle') : t('analyzing.title')}
            </h1>

            <p className="text-sm text-[var(--muted)] mb-5 text-center min-h-[1.25rem]">
              {isUploading
                ? t('analyzing.uploading')
                : detectedDocType
                  ? t('analyzing.detectedSubtitle')
                  : files.length > 0
                    ? t('analyzing.scanning')
                    : t('analyzing.demoMode')}
            </p>

            {/* Document type badge — appears as soon as the AI identifies the doc type */}
            {detectedDocType && (
              <div className="flex items-center gap-2 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 rounded-full px-4 py-1.5 mb-5 animate-in fade-in duration-500">
                <Tag className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                <span className="text-sm font-semibold text-brand-700 dark:text-brand-300">
                  {detectedDocType.label}
                </span>
              </div>
            )}

            {/* Field cards — stream in one by one as the AI identifies each piece of information */}
            <div className="w-full max-w-sm space-y-2">
              {detectedFields.map((field) => {
                const FieldIcon = resolveFieldIcon(field.icon)
                return (
                  <div
                    key={field.key}
                    className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 animate-in slide-in-from-right-2 fade-in duration-300"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        field.importance === 'high'
                          ? 'bg-brand-50 dark:bg-brand-950/40'
                          : 'bg-[var(--background-subtle)]'
                      }`}
                    >
                      <FieldIcon
                        className={`w-4 h-4 ${
                          field.importance === 'high'
                            ? 'text-brand-500'
                            : 'text-[var(--muted)]'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-[var(--muted)] leading-none mb-0.5">
                        {field.label}
                      </p>
                      <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                        {field.value}
                      </p>
                    </div>
                    {field.importance === 'high' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
                    )}
                  </div>
                )
              })}

              {/* Skeleton rows — shown while waiting for the first fields to arrive */}
              {detectedFields.length === 0 && files.length > 0 && (
                <>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[var(--border)] animate-pulse shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-2 bg-[var(--border)] rounded-full animate-pulse w-20" />
                        <div className="h-2.5 bg-[var(--border)] rounded-full animate-pulse w-32" />
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {!files.length && detectedFields.length === 0 && (
              <p className="text-xs text-[var(--muted)] text-center mt-2">
                {t('analyzing.demoMode')}
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
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    {analyzeError}
                  </p>
                  <button
                    onClick={handleReset}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline mt-1"
                  >
                    {t('errors.backToUpload')}
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">
                  {t('questions.title')}
                </h1>
                <p className="text-[var(--muted)] text-sm">{t('questions.subtitle')}</p>
              </div>
              <div className="shrink-0 text-right">
                <p
                  className={`text-lg font-bold ${answeredCount === questions.length && questions.length > 0 ? 'text-green-600' : 'text-[var(--foreground)]'}`}
                >
                  {answeredCount}{' '}
                  <span className="text-[var(--muted)] font-normal text-base">
                    / {questions.length}
                  </span>
                </p>
                <p className="text-xs text-[var(--muted)]">{t('questions.answered')}</p>
              </div>
            </div>

            <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden mb-7">
              <div
                className={`h-full rounded-full transition-all duration-500 ${answeredCount === questions.length && questions.length > 0 ? 'bg-green-500' : 'bg-brand-500'}`}
                style={{
                  width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%`,
                }}
              />
            </div>

            <div className="grid lg:grid-cols-[1fr_240px] gap-6">
              <div className="space-y-4">
                {questions.length === 0 && !analyzeError && (
                  <p className="text-sm text-[var(--muted)] italic py-4">
                    {files.length === 0
                      ? t('questions.demoHint')
                      : t('questions.noQuestionsHint')}
                  </p>
                )}
                {questions.map((q, i) => {
                  const qType = q.type ?? 'text'
                  const answered = !!answers[q.id]?.trim()
                  return (
                    <div
                      key={q.id}
                      className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            answered
                              ? 'bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400'
                              : 'bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400'
                          }`}
                        >
                          {answered ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            String(i + 1)
                          )}
                        </span>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                            {q.question}
                            {q.required ? (
                              <span className="text-red-500 ml-1.5 text-xs font-normal">
                                {t('questions.required')}
                              </span>
                            ) : (
                              <span className="text-[var(--muted)] ml-1.5 text-xs font-normal">
                                {t('questions.optional')}
                              </span>
                            )}
                          </label>

                          {/* Legal background hint */}
                          {q.background && (
                            <p className="text-xs text-[var(--muted)] bg-[var(--background-subtle)] border border-[var(--border)] rounded-lg px-3 py-2 mb-3 leading-relaxed">
                              <span className="font-semibold text-brand-600 dark:text-brand-400">
                                {t('questions.questionBackground')}{' '}
                              </span>
                              {q.background}
                            </p>
                          )}

                          {/* Yes/No/Unknown question → three radio-style buttons */}
                          {qType === 'yesno' && (
                            <div className="flex gap-2">
                              {[
                                { value: tCommon('yes'), label: tCommon('yes') },
                                { value: tCommon('no'), label: tCommon('no') },
                                { value: tCommon('unknown'), label: tCommon('unknown') },
                              ].map(({ value, label }) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() =>
                                    setAnswers((a) => ({ ...a, [q.id]: value }))
                                  }
                                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                                    answers[q.id] === value
                                      ? 'bg-brand-600 border-brand-600 text-white'
                                      : 'bg-[var(--background-subtle)] border-[var(--border)] text-[var(--foreground)] hover:border-brand-300'
                                  }`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Amount question → number input */}
                          {qType === 'amount' && (
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">
                                €
                              </span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="w-full pl-8 pr-4 py-3 text-sm border border-[var(--border)] rounded-xl bg-[var(--background-subtle)] text-[var(--foreground)] focus:bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-colors"
                                placeholder="0,00"
                                value={answers[q.id] ?? ''}
                                onChange={(e) =>
                                  setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                                }
                              />
                            </div>
                          )}

                          {/* Date question → date input */}
                          {qType === 'date' && (
                            <input
                              type="date"
                              className="w-full border border-[var(--border)] rounded-xl px-4 py-3 text-sm bg-[var(--background-subtle)] text-[var(--foreground)] focus:bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-colors"
                              value={answers[q.id] ?? ''}
                              onChange={(e) =>
                                setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                              }
                            />
                          )}

                          {/* Text question → textarea */}
                          {qType === 'text' && (
                            <textarea
                              rows={3}
                              className="w-full border border-[var(--border)] rounded-xl px-4 py-3 text-sm bg-[var(--background-subtle)] text-[var(--foreground)] focus:bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-colors resize-none placeholder:text-[var(--muted)]"
                              placeholder={
                                q.required ? '' : t('questions.optional') + '…'
                              }
                              value={answers[q.id] ?? ''}
                              onChange={(e) =>
                                setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                              }
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Fixed "any other information" field — always shown after API questions */}
                {(questions.length > 0 || files.length === 0) && (
                  <div className="bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 bg-[var(--background-subtle)] text-[var(--muted)]">
                        +
                      </span>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                          {t('questions.additionalContext')}
                          <span className="text-[var(--muted)] ml-1.5 text-xs font-normal">
                            {t('questions.optional')}
                          </span>
                        </label>
                        <textarea
                          rows={3}
                          className="w-full border border-[var(--border)] rounded-xl px-4 py-3 text-sm bg-[var(--background-subtle)] text-[var(--foreground)] focus:bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-colors resize-none placeholder:text-[var(--muted)]"
                          placeholder={t('questions.additionalContextPlaceholder')}
                          value={answers['__additional__'] ?? ''}
                          onChange={(e) =>
                            setAnswers((a) => ({ ...a, __additional__: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Detected document data sidebar — populated from the streaming analyze step */}
              {detectedFields.length > 0 && (
                <div className="lg:sticky lg:top-24 h-fit">
                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-950/40 rounded-lg flex items-center justify-center">
                        <ScanSearch className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <p className="text-xs font-semibold text-[var(--foreground)]">
                        {t('questions.detectedData')}
                      </p>
                      <span className="ml-auto text-[10px] text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-full font-medium">
                        {t('questions.liveBadge')}
                      </span>
                    </div>
                    {detectedDocType && (
                      <div className="flex items-center gap-1.5 mb-2.5 pb-2.5 border-b border-[var(--border)]">
                        <Tag className="w-3 h-3 text-brand-500 shrink-0" />
                        <span className="text-xs font-medium text-brand-600 dark:text-brand-400">
                          {detectedDocType.label}
                        </span>
                      </div>
                    )}
                    <div className="space-y-2.5">
                      {detectedFields.map((field) => (
                        <div
                          key={field.key}
                          className="flex items-start justify-between gap-2"
                        >
                          <span className="text-xs text-[var(--muted)]">
                            {field.label}
                          </span>
                          <span className="text-xs font-semibold text-[var(--foreground)] text-right max-w-[130px] leading-tight">
                            {field.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional documents upload */}
            <div className="mt-6 border border-dashed border-[var(--border)] rounded-2xl p-4 bg-[var(--background-subtle)]">
              <div className="flex items-center gap-2 mb-2">
                <Paperclip className="w-4 h-4 text-[var(--muted)]" />
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {t('questions.additionalDocs.title')}
                </p>
                <span className="ml-auto text-xs text-[var(--muted)] bg-[var(--surface)] border border-[var(--border)] px-2 py-0.5 rounded-full">
                  {t('questions.additionalDocs.optional')}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] mb-3 leading-relaxed">
                {t('questions.additionalDocs.subtitle')}
              </p>

              {additionalFiles.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {additionalFiles.map((f) => (
                    <div
                      key={f.name}
                      className="flex items-center gap-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-3 py-2"
                    >
                      <FileText className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                      <span className="text-xs font-medium text-[var(--foreground)] flex-1 truncate">
                        {f.name}
                      </span>
                      <span className="text-xs text-[var(--muted)]">
                        {(f.size / 1024).toFixed(0)} KB
                      </span>
                      <button
                        onClick={() => removeAdditionalFile(f.name)}
                        className="p-0.5 text-[var(--muted)] hover:text-red-500 transition-colors rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => additionalFileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                {t('questions.additionalDocs.add')}
              </button>
              <input
                ref={additionalFileInputRef}
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.webp"
                onChange={(e) => addAdditionalFiles(e.target.files)}
              />
            </div>

            {requiredUnanswered > 0 && (
              <p className="mt-4 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {t('questions.requiredUnanswered').replace(
                  '{count}',
                  String(requiredUnanswered)
                )}
              </p>
            )}

            <div className="flex gap-3 mt-3">
              <button
                onClick={() => setStep('upload')}
                className="flex items-center gap-2 border border-[var(--border)] text-[var(--foreground)] px-5 py-3 rounded-xl text-sm font-medium hover:bg-[var(--background-subtle)] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('questions.back')}
              </button>
              <button
                onClick={handleGenerate}
                disabled={(!!analyzeError && !bescheidData) || requiredUnanswered > 0}
                className="flex-1 bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Brain className="w-4 h-4" />
                {additionalFiles.length > 0
                  ? t('questions.generateWithDocs').replace(
                      '{count}',
                      String(files.length + additionalFiles.length)
                    )
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
              <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                {t('generating.title')}
              </h1>
              <p className="text-sm text-[var(--muted)]">
                {activeAgentRoles.size > 0
                  ? t(`generating.agents.${[...activeAgentRoles][0]}`)
                  : activeAgent >= AGENT_IDS.length
                    ? t('generating.finalising')
                    : t(
                        `generating.agents.${AGENT_IDS[Math.min(activeAgent, AGENT_IDS.length - 1)]}`
                      )}
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
                            .replace(
                              '{label}',
                              t(`generating.agents.${AGENT_IDS[activeAgent]}`).split(
                                '…'
                              )[0]
                            )
                        : t('generating.allDone').replace(
                            '{n}',
                            String(AGENT_IDS.length)
                          )}
                    </span>
                    <span className="font-medium">
                      {activeAgent >= AGENT_IDS.length
                        ? '100 %'
                        : `${Math.round((activeAgent / AGENT_IDS.length) * 100)} %`}
                    </span>
                  </div>
                  <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all duration-700"
                      style={{
                        width:
                          activeAgent >= AGENT_IDS.length
                            ? '100%'
                            : `${(activeAgent / AGENT_IDS.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {AGENT_IDS.map((agentId, i) => {
                    const done = agentOutputData.some((o) => o.role === agentId)
                    const active = activeAgentRoles.has(agentId) && !done
                    const outputData = agentOutputData.find((o) => o.role === agentId)
                    return (
                      <div
                        key={agentId}
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
                          <p
                            className={`font-semibold leading-tight ${done ? 'text-green-700 dark:text-green-400' : active ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}
                          >
                            {t(`generating.agents.${agentId}`)}
                          </p>
                          {done && outputData && (
                            <p className="text-xs mt-0.5 text-green-600/70 dark:text-green-500/70 truncate">
                              {outputData.summary}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              done
                                ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                                : active
                                  ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300'
                                  : 'bg-[var(--border)] text-[var(--muted)]'
                            }`}
                          >
                            {AGENT_PROVIDERS[agentId]}
                          </span>
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
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    {t('generating.draftTitle')}
                  </p>
                  {activeAgent < AGENT_IDS.length && (
                    <span className="flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {t('generating.writing')}
                    </span>
                  )}
                </div>
                <div className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--background-subtle)]">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                    <span className="ml-2 text-xs text-[var(--muted)]">
                      TaxaLex-Einspruch.txt
                    </span>
                    {caseId && (
                      <span className="ml-auto text-[10px] text-green-600 dark:text-green-400">
                        ● Live
                      </span>
                    )}
                  </div>
                  <pre className="p-4 text-xs font-mono text-[var(--foreground)] leading-relaxed whitespace-pre-wrap h-72 overflow-y-auto">
                    {draftPreview ? (
                      <>
                        {draftPreview}
                        {activeAgent < AGENT_IDS.length && (
                          <span className="animate-pulse text-brand-500">▌</span>
                        )}
                      </>
                    ) : (
                      <span className="text-[var(--muted)] italic">
                        {t('generating.draftPlaceholder')}
                      </span>
                    )}
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
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    {generateError}
                  </p>
                  <button
                    onClick={() => setStep('questions')}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline mt-1"
                  >
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
                  <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">
                    {t('result.title')}
                  </h1>
                  <p className="text-sm text-[var(--muted)] mb-3">
                    {t('result.subtitle')}
                  </p>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {(['legal', 'bfh', 'formal'] as const).map((key) => (
                      <span
                        key={key}
                        className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                          key === 'legal'
                            ? 'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950/40 dark:border-green-800'
                            : key === 'bfh'
                              ? 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/40 dark:border-blue-800'
                              : 'text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-950/40 dark:border-purple-800'
                        }`}
                      >
                        {t(`result.badges.${key}`)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Agent summary */}
                {agentOutputData.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-6">
                    {AGENT_IDS.map((agentId) => {
                      const outputData = agentOutputData.find((o) => o.role === agentId)
                      return (
                        <div
                          key={agentId}
                          className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3"
                        >
                          <div className="flex items-center gap-1.5 mb-2">
                            <div
                              className={`w-5 h-5 rounded-md ${AGENT_COLORS[agentId]} flex items-center justify-center shrink-0`}
                            >
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-[10px] font-semibold text-[var(--muted)]">
                              {AGENT_PROVIDERS[agentId]}
                            </span>
                            {outputData && (
                              <span className="ml-auto text-[10px] text-[var(--muted)]">
                                {(outputData.durationMs / 1000).toFixed(1)}s
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-[var(--foreground)] leading-tight mb-1 line-clamp-2">
                            {t(`generating.agents.${agentId}`)}
                          </p>
                          {outputData?.summary && (
                            <p className="text-[10px] text-[var(--muted)] leading-tight line-clamp-2">
                              {outputData.summary}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Draft preview — locked (freemium) or full */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden mb-5">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)] bg-[var(--background-subtle)]">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                      </div>
                      <span className="text-xs text-[var(--muted)] ml-1">
                        TaxaLex-Einspruch.txt
                      </span>
                    </div>
                    <span className="text-xs text-[var(--muted)]">
                      {t('result.draftEditable')}
                    </span>
                  </div>
                  <div className="relative">
                    <pre
                      className={`p-5 font-mono text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap overflow-y-auto ${resultLocked ? 'max-h-48 select-none' : 'max-h-80'}`}
                    >
                      {resultLocked ? result.finalDraft.slice(0, 600) : result.finalDraft}
                    </pre>
                    {resultLocked && (
                      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--surface)] to-transparent flex flex-col items-center justify-end pb-5 gap-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                          <Lock className="w-4 h-4 text-brand-600" />
                          {t('result.lockedTitle')}
                        </div>
                        <p className="text-xs text-[var(--muted)] text-center px-6">
                          {t('result.lockedHint')}
                        </p>
                        <a
                          href={`/${locale}/billing`}
                          className="bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors flex items-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          {t('result.unlockCta')}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions — hidden when locked */}
                {!resultLocked && (
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={handleDownload}
                      className="flex-1 flex items-center justify-center gap-2 bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      {t('result.download')}
                    </button>
                    <button
                      onClick={handleCopy}
                      className="flex items-center justify-center gap-2 border border-[var(--border)] px-5 py-3 rounded-xl font-medium text-sm hover:bg-[var(--background-subtle)] transition-colors min-w-[120px]"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          {t('result.copied')}
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          {t('result.copy')}
                        </>
                      )}
                    </button>
                  </div>
                )}

                {result.caseId && (
                  <button
                    onClick={() => router.push(`/${locale}/cases/${result.caseId}`)}
                    className="w-full mb-5 flex items-center justify-center gap-2 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 py-3 rounded-xl font-semibold hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors"
                  >
                    <FolderOpen className="w-4 h-4" />
                    {t('result.openInCases')}
                  </button>
                )}

                {/* Next steps */}
                <div className="bg-[var(--background-subtle)] border border-[var(--border)] rounded-2xl p-5 mb-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
                    {t('result.nextSteps.title')}
                  </p>
                  <div className="space-y-3">
                    {(['check', 'print', 'send'] as const).map((key, i) => (
                      <div key={key} className="flex items-start gap-3 text-sm">
                        <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-[var(--muted)]">
                          {t(`result.nextSteps.${key}`)}
                        </span>
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
                className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {t('result.newAppeal')}
              </button>
              <span className="text-[var(--border)]">·</span>
              <p className="text-xs text-[var(--muted)]">
                <AlertCircle className="w-3 h-3 inline mr-0.5" />
                {t('result.legalNote')}
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
