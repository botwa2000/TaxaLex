'use client'

import { useState, useRef, useEffect, Suspense, useMemo } from 'react'
import { getDemoScenario } from '@/lib/demoScenarios'
import Link from 'next/link'
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
import { PublicNav } from '@/components/PublicNav'
import { useSession } from 'next-auth/react'
import { brand } from '@/config/brand'
import { languageNames } from '@/config/i18n'

type Step = 'upload' | 'analyzing' | 'questions' | 'reviewing' | 'generating' | 'result'

// ── Agent config (labels come from translations) ─────────────────────────────
const AGENT_IDS = [
  'drafter',
  'reviewer',
  'factchecker',
  'adversary',
  'consolidator',
] as const
type AgentId = (typeof AGENT_IDS)[number]

// Post-processing agents run after the draft appears — shown separately so the
// user sees the pipeline is still active and the draft isn't frozen.
const POST_AGENT_IDS = ['adversary-final', 'reporter'] as const
type PostAgentId = (typeof POST_AGENT_IDS)[number]

const AGENT_PROVIDERS: Record<AgentId, string> = {
  drafter: 'Claude',
  reviewer: 'Gemini',
  factchecker: 'Perplexity',
  adversary: 'Grok',
  consolidator: 'GPT-4o',
}

const POST_AGENT_PROVIDERS: Record<PostAgentId, string> = {
  'adversary-final': 'Grok',
  reporter: 'Claude',
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
  content?: string
}

interface GenerateResult {
  outputs: { role: string; provider: string; model: string }[]
  finalDraft: string
  caseId?: string | null
}

function EinspruchPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const params = useParams()
  const locale = typeof params?.locale === 'string' ? params.locale : 'de'
  // Keep a ref so async functions always read the current locale even after re-renders
  const localeRef = useRef(locale)
  useEffect(() => { localeRef.current = locale }, [locale])
  const t = useTranslations('wizard')
  const tCommon = useTranslations('common')
  const tNav = useTranslations('nav')

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
      guidance?: string
      why?: string
    }>
  >([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [activeAgent, setActiveAgent] = useState(0)
  const [activeAgentRoles, setActiveAgentRoles] = useState<Set<string>>(new Set())
  // Upload progress tracking (null = not in upload phase)
  const [uploadPhase, setUploadPhase] = useState<'uploading' | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0) // 0–100
  const [uploadSentMB, setUploadSentMB] = useState(0)
  const [uploadTotalMB, setUploadTotalMB] = useState(0)
  const [uploadSpeedMBps, setUploadSpeedMBps] = useState(0)
  const isUploading = uploadPhase === 'uploading'
  const [copied, setCopied] = useState(false)
  const [caseId, setCaseId] = useState<string | null>(null)
  const [agentOutputData, setAgentOutputData] = useState<AgentOutputData[]>([])
  const [draftPreview, setDraftPreview] = useState<string>('')
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [userContext, setUserContext] = useState('')
  const [fileLabels, setFileLabels] = useState<Record<string, string>>({})
  const [refiningQuestions, setRefiningQuestions] = useState(false)
  const [resultLocked, setResultLocked] = useState(false) // true = freemium gate active
  const [editedDraft, setEditedDraft] = useState<string>('')
  const [outputLanguage, setOutputLanguage] = useState('de')
  const [openContextIds, setOpenContextIds] = useState<Set<string>>(new Set())
  const [retentionDays, setRetentionDays] = useState<number | null>(null) // null = stored permanently
  const [detectedFields, setDetectedFields] = useState<DetectedField[]>([])
  const [detectedDocType, setDetectedDocType] = useState<DetectedDocType | null>(null)
  const isDemoModeRef = useRef(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [demoCountdown, setDemoCountdown] = useState<{ remaining: number; total: number } | null>(null)
  const demoCountdownCallbackRef = useRef<(() => void) | null>(null)
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([])
  const { data: session, status: sessionStatus } = useSession()
  const isLoggedIn = sessionStatus === 'authenticated'
  // Demo accounts have IDs prefixed with 'demo_' — block real uploads for them
  const isAccountDemo = session?.user?.id?.startsWith('demo_') ?? false
  const [hasAccess, setHasAccess] = useState<boolean | null>(null) // null = loading
  // Fields found specifically during the review step (subset of detectedFields)
  const [reviewFields, setReviewFields] = useState<DetectedField[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const additionalFileInputRef = useRef<HTMLInputElement>(null)
  const caseIdRef = useRef<string | null>(null)
  const bescheidDataRef = useRef<Record<string, unknown> | null>(null)
  const questionsRef = useRef<Array<{
    id: string
    question: string
    required?: boolean
    type?: string
    background?: string
    guidance?: string
  }> | null>(null)

  const STEPS = [
    { id: 'upload', label: t('steps.upload'), icon: Upload },
    { id: 'analyzing', label: t('steps.analyzing'), icon: ScanSearch },
    { id: 'questions', label: t('steps.questions'), icon: MessageSquare },
    { id: 'reviewing', label: t('steps.reviewing'), icon: Loader2 },
    { id: 'generating', label: t('steps.generating'), icon: Brain },
    { id: 'result', label: t('steps.result'), icon: FileCheck },
  ] as const

  const currentIdx = STEPS.findIndex((s) => s.id === step)
  // '__na__' counts as answered — it's an explicit "I don't know" response
  const isAnswered = (id: string) => {
    const v = answers[id]
    return v === '__na__' || (typeof v === 'string' && v.trim().length > 0)
  }
  const answeredCount = questions.filter((q) => isAnswered(q.id)).length
  const requiredUnanswered = questions.filter((q) => q.required && !isAnswered(q.id)).length
  // ── Auto-save / restore question answers per case ────────────────────────
  useEffect(() => {
    if (!caseIdRef.current || Object.keys(answers).length === 0) return
    localStorage.setItem(`taxalex_answers_${caseIdRef.current}`, JSON.stringify(answers))
  }, [answers])

  useEffect(() => {
    if (!caseIdRef.current || questions.length === 0 || Object.keys(answers).length > 0) return
    const saved = localStorage.getItem(`taxalex_answers_${caseIdRef.current}`)
    if (saved) {
      try { setAnswers(JSON.parse(saved)) } catch { /* ignore corrupt data */ }
    }
  }, [questions, answers])

  // ── Skeleton point titles — extracted from drafter output for free-user teaser ──
  const skeletonPoints = useMemo(() => {
    if (!resultLocked) return []
    const drafterOutput = agentOutputData.find((o) => o.role === 'drafter')
    if (!drafterOutput?.content) return []
    try {
      const match = drafterOutput.content.match(/\[[\s\S]*\]/)
      if (!match) return []
      const parsed = JSON.parse(match[0]) as Array<{ id: string; authority_claim: string; confidence: string }>
      return parsed.slice(0, 5)
    } catch {
      return []
    }
  }, [resultLocked, agentOutputData])

  // ── Check user access on mount ────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/user/access')
      .then((r) => r.json())
      .then((d) => setHasAccess(d.hasAccess ?? false))
      .catch(() => setHasAccess(true)) // fail open — API will enforce anyway
  }, [])

  // ── Resume from ?caseId URL param — restores QUESTIONS state from DB ─────
  const resumeCaseId = searchParams.get('caseId')
  useEffect(() => {
    if (!resumeCaseId || sessionStatus !== 'authenticated' || isAccountDemo) return
    async function loadResume() {
      const res = await fetch(`/api/cases/${resumeCaseId}`)
      if (!res.ok) return
      const c = await res.json() as {
        id: string; status: string; bescheidData?: Record<string, unknown>
        followUpQuestions?: Array<{ id: string; question: string; required?: boolean; type?: 'text' | 'yesno' | 'amount' | 'date'; background?: string; guidance?: string }>
      }
      caseIdRef.current = c.id
      setCaseId(c.id)
      if (c.status === 'QUESTIONS' && c.bescheidData && c.followUpQuestions?.length) {
        bescheidDataRef.current = c.bescheidData
        questionsRef.current = c.followUpQuestions
        setBescheidData(c.bescheidData)
        setQuestions(c.followUpQuestions)
        setDetectedFields(
          Object.entries(c.bescheidData).map(([key, value]) => ({
            key, label: key, value: String(value), icon: 'file-text', importance: 'medium' as const,
          }))
        )
        setStep('questions')
      } else if (c.status === 'DRAFT_READY') {
        router.replace(`/${locale}/cases/${c.id}?tab=letter`)
      }
    }
    loadResume().catch(() => {/* non-fatal */})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeCaseId, sessionStatus])

  // Auto-start demo when landing from use-cases page with ?demo=true
  useEffect(() => {
    if (searchParams.get('demo') === 'true' && step === 'upload') {
      const t = setTimeout(() => handleAnalyze(), 800)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // only on mount

  // In demo mode: auto-fill answers then start a countdown before submitting
  useEffect(() => {
    if (!isDemoMode || step !== 'questions') return
    const scenario = getDemoScenario(type ?? 'tax', localeRef.current)
    // Show questions for 3 s so the user can read them, then auto-fill
    const fillTimer = setTimeout(() => {
      const autoAnswers: Record<string, string> = {}
      for (const q of scenario.questions) {
        autoAnswers[q.id] = q.autoAnswer
      }
      setAnswers(autoAnswers)
      // Countdown before auto-submitting so the user can see the filled answers
      startDemoCountdown(8, () => handleReview())
    }, 3000)
    return () => clearTimeout(fillTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode, step])

  // Tick the demo countdown every second; fire callback when it reaches 0
  useEffect(() => {
    if (!demoCountdown) return
    if (demoCountdown.remaining <= 0) {
      const cb = demoCountdownCallbackRef.current
      demoCountdownCallbackRef.current = null
      setDemoCountdown(null)
      cb?.()
      return
    }
    const timer = setTimeout(() => {
      setDemoCountdown((prev) => (prev ? { ...prev, remaining: prev.remaining - 1 } : null))
    }, 1000)
    return () => clearTimeout(timer)
  }, [demoCountdown])

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

  function startDemoCountdown(seconds: number, onComplete: () => void) {
    demoCountdownCallbackRef.current = onComplete
    setDemoCountdown({ remaining: seconds, total: seconds })
  }

  function skipDemoCountdown() {
    const cb = demoCountdownCallbackRef.current
    demoCountdownCallbackRef.current = null
    setDemoCountdown(null)
    cb?.()
  }

  async function handleAnalyze() {
    bescheidDataRef.current = null
    questionsRef.current = null
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

    // Demo mode — simulate streaming with staggered field reveals using scenario data
    if (files.length === 0 || isAccountDemo) {
      isDemoModeRef.current = true
      setIsDemoMode(true)
      const scenario = getDemoScenario(type ?? 'tax', localeRef.current)

      await new Promise((r) => setTimeout(r, 300))
      setDetectedDocType(scenario.docType)
      for (const field of scenario.fields) {
        await new Promise((r) => setTimeout(r, 380))
        setDetectedFields((prev) => [...prev, field])
      }
      await new Promise((r) => setTimeout(r, 600))
      bescheidDataRef.current = Object.fromEntries(scenario.fields.map((f) => [f.key, f.value]))
      questionsRef.current = scenario.questions
      setBescheidData(Object.fromEntries(scenario.fields.map((f) => [f.key, f.value])))
      setQuestions(scenario.questions)
      // Show extracted fields with a countdown before advancing to questions
      startDemoCountdown(8, () => setStep('questions'))
      return
    }

    // Create the case record early — persists bescheidData + questions for resume support
    if (!caseIdRef.current) {
      try {
        const caseRes = await fetch('/api/cases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ useCase: type ?? 'tax', uiLanguage: locale, outputLanguage: 'de' }),
        })
        if (caseRes.status === 401) {
          router.push(`/${locale}/login?callbackUrl=/${locale}/einspruch`)
          return
        }
        if (caseRes.ok) {
          const { caseId: newId } = await caseRes.json()
          caseIdRef.current = newId
          setCaseId(newId)
        }
      } catch { /* non-critical: pipeline can run without DB case */ }
    }

    // ── Phase 1: XHR upload raw files to /api/upload ─────────────────────────
    // Raw binary (no base64) → 33% smaller payload, no encoding delay.
    // XHR gives upload.progress events; fetch() does not.
    setUploadPhase('uploading')
    const formData = new FormData()
    let totalBytes = 0
    for (const file of files) {
      formData.append('files', file)
      totalBytes += file.size
    }
    setUploadTotalMB(totalBytes / 1024 / 1024)
    setUploadProgress(0)
    setUploadSentMB(0)
    setUploadSpeedMBps(0)

    let uploadId: string | null = null

    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest()
      let speedSamples: { time: number; loaded: number }[] = []

      xhr.upload.addEventListener('progress', (e) => {
        if (!e.lengthComputable) return
        const now = Date.now()
        speedSamples.push({ time: now, loaded: e.loaded })
        speedSamples = speedSamples.filter((s) => now - s.time < 2000)
        if (speedSamples.length >= 2) {
          const oldest = speedSamples[0]
          const dtSec = (now - oldest.time) / 1000
          const delta = e.loaded - oldest.loaded
          setUploadSpeedMBps(dtSec > 0 ? delta / dtSec / 1024 / 1024 : 0)
        }
        setUploadProgress(Math.round((e.loaded / e.total) * 100))
        setUploadSentMB(e.loaded / 1024 / 1024)
      })

      xhr.upload.addEventListener('load', () => {
        setUploadProgress(100)
        setUploadPhase(null)
      })

      xhr.onload = () => {
        setUploadPhase(null)
        if (xhr.status === 401) {
          router.push(`/${locale}/login?callbackUrl=/${locale}/einspruch`)
          resolve()
          return
        }
        if (xhr.status !== 200) {
          try {
            const err = JSON.parse(xhr.responseText) as { error?: string }
            setAnalyzeError(err.error ?? t('errors.analyze'))
          } catch {
            setAnalyzeError(t('errors.analyze'))
          }
          resolve()
          return
        }
        try {
          const data = JSON.parse(xhr.responseText) as { uploadId: string }
          uploadId = data.uploadId
        } catch {
          setAnalyzeError(t('errors.analyze'))
        }
        resolve()
      }

      xhr.onerror = () => {
        setUploadPhase(null)
        setAnalyzeError(t('errors.connection'))
        resolve()
      }

      xhr.open('POST', '/api/upload')
      xhr.timeout = 0 // no cap — upload time depends on connection speed
      xhr.send(formData)
    })

    if (!uploadId) {
      setStep('questions')
      return
    }

    // ── Phase 2: SSE analysis (separate request, separate timeout) ────────────
    // With upload done, the only remaining time is AI analysis (max ~120s).
    const abortCtrl = new AbortController()
    const analysisTimeout = setTimeout(() => abortCtrl.abort(), 180_000)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId, uiLanguage: locale, caseId: caseIdRef.current ?? undefined, userContext: userContext.trim() || undefined, fileLabels: Object.keys(fileLabels).length > 0 ? fileLabels : undefined }),
        signal: abortCtrl.signal,
      })

      if (res.status === 401) {
        router.push(`/${locale}/login?callbackUrl=/${locale}/einspruch`)
        return
      }

      if (!res.ok || !res.body) {
        try {
          const err = await res.json() as { error?: string }
          setAnalyzeError(err.error ?? t('errors.analyze'))
        } catch {
          setAnalyzeError(t('errors.analyze'))
        }
        setStep('questions')
        return
      }

      // Parse SSE stream from response body
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let sseBuffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        sseBuffer += decoder.decode(value, { stream: true })
        const parts = sseBuffer.split('\n\n')
        sseBuffer = parts.pop() ?? ''
        for (const part of parts) {
          let eventName = '', dataStr = ''
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
            } else if (eventName === 'refining_questions') {
              setRefiningQuestions(true)
            } else if (eventName === 'complete') {
              setRefiningQuestions(false)
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
                  guidance?: string
                  why?: string
                }>
              )
            } else if (eventName === 'error') {
              setAnalyzeError(payload.message ?? t('errors.analyze'))
            }
          } catch { /* malformed SSE chunk */ }
        }
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        setAnalyzeError(t('errors.analyze'))
      } else {
        setAnalyzeError(t('errors.connection'))
      }
    } finally {
      clearTimeout(analysisTimeout)
    }

    setStep('questions')
  }

  // ── handleReview — called by Generate button ─────────────────────────────────
  // If there are additional files: upload + review-analyze them first (appends fields
  // to sidebar), then auto-proceeds to handleGenerate.
  // If no additional files: jumps straight to handleGenerate.
  async function handleReview() {
    if (additionalFiles.length === 0) {
      handleGenerate()
      return
    }

    setStep('reviewing')
    setReviewFields([])
    setUploadPhase('uploading')
    setUploadProgress(0)
    setUploadSentMB(0)
    setUploadTotalMB(0)
    setUploadSpeedMBps(0)

    // ── Phase 1: upload additional files ────────────────────────────────────────
    const formData = new FormData()
    let totalBytes = 0
    for (const f of additionalFiles) {
      formData.append('files', f)
      totalBytes += f.size
    }
    setUploadTotalMB(totalBytes / 1024 / 1024)

    let reviewUploadId: string | null = null

    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest()
      let speedSamples: { time: number; loaded: number }[] = []

      xhr.upload.addEventListener('progress', (e) => {
        if (!e.lengthComputable) return
        const now = Date.now()
        speedSamples.push({ time: now, loaded: e.loaded })
        speedSamples = speedSamples.filter((s) => now - s.time < 2000)
        if (speedSamples.length >= 2) {
          const oldest = speedSamples[0]
          const dtSec = (now - oldest.time) / 1000
          const delta = e.loaded - oldest.loaded
          setUploadSpeedMBps(dtSec > 0 ? delta / dtSec / 1024 / 1024 : 0)
        }
        setUploadProgress(Math.round((e.loaded / e.total) * 100))
        setUploadSentMB(e.loaded / 1024 / 1024)
      })

      xhr.upload.addEventListener('load', () => {
        setUploadProgress(100)
        setUploadPhase(null)
      })

      xhr.onload = () => {
        setUploadPhase(null)
        if (xhr.status === 401) {
          router.push(`/${locale}/login?callbackUrl=/${locale}/einspruch`)
          resolve()
          return
        }
        if (xhr.status !== 200) {
          // Upload failed — revert to questions step
          try {
            const err = JSON.parse(xhr.responseText) as { error?: string }
            setAnalyzeError(err.error ?? t('errors.analyze'))
          } catch {
            setAnalyzeError(t('errors.analyze'))
          }
          setStep('questions')
          resolve()
          return
        }
        try {
          const data = JSON.parse(xhr.responseText) as { uploadId: string }
          reviewUploadId = data.uploadId
        } catch {
          setAnalyzeError(t('errors.analyze'))
          setStep('questions')
        }
        resolve()
      }

      xhr.onerror = () => {
        setUploadPhase(null)
        setAnalyzeError(t('errors.connection'))
        setStep('questions')
        resolve()
      }

      xhr.open('POST', '/api/upload')
      xhr.timeout = 0
      xhr.send(formData)
    })

    if (!reviewUploadId) {
      // Already reverted to questions in the XHR handlers above
      return
    }

    // ── Phase 2: SSE review-analyze (non-fatal — always proceeds to generate) ──
    const abortCtrl = new AbortController()
    const reviewTimeout = setTimeout(() => abortCtrl.abort(), 180_000)
    // Accumulate new/updated fields locally so we can merge into bescheidDataRef
    const reviewFieldUpdates: Record<string, string> = {}

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadId: reviewUploadId,
          uiLanguage: locale,
          reviewMode: true,
          existingBescheidData: bescheidDataRef.current ?? {},
          userAnswers: answers,
        }),
        signal: abortCtrl.signal,
      })

      if (res.ok && res.body) {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        outer: while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const chunks = buffer.split('\n\n')
          buffer = chunks.pop() ?? ''

          for (const chunk of chunks) {
            let eventName = 'message', dataStr = ''
            for (const line of chunk.split('\n')) {
              if (line.startsWith('event: ')) eventName = line.slice(7).trim()
              if (line.startsWith('data: ')) dataStr = line.slice(6)
            }
            if (!dataStr) continue
            let payload: Record<string, unknown>
            try { payload = JSON.parse(dataStr) } catch { continue }

            if (eventName === 'field') {
              const field = payload as unknown as DetectedField
              // Accumulate for merging into bescheidDataRef
              reviewFieldUpdates[field.key] = field.value
              // Track in review-specific list for the reviewing step UI
              setReviewFields((prev) => {
                const idx = prev.findIndex((f) => f.key === field.key)
                if (idx !== -1) {
                  const updated = [...prev]
                  updated[idx] = field
                  return updated
                }
                return [...prev, field]
              })
              // Also upsert into the main detectedFields for the sidebar
              setDetectedFields((prev) => {
                const idx = prev.findIndex((f) => f.key === field.key)
                if (idx !== -1) {
                  const updated = [...prev]
                  updated[idx] = field
                  return updated
                }
                return [...prev, field]
              })
            } else if (eventName === 'complete' || eventName === 'error') {
              break outer
            }
          }
        }
      }
    } catch {
      // Timeout or network error — non-fatal, continue to generate
    } finally {
      clearTimeout(reviewTimeout)
    }

    // Merge any newly discovered fields into bescheidDataRef before generate reads it.
    // This ensures the pipeline has the most complete picture of the case.
    if (Object.keys(reviewFieldUpdates).length > 0) {
      bescheidDataRef.current = { ...(bescheidDataRef.current ?? {}), ...reviewFieldUpdates }
    }

    handleGenerate()
  }

  async function handleGenerate() {
    const accOutputs: AgentOutputData[] = []
    setAgentOutputData([])
    setActiveAgent(0)
    setDraftPreview('')
    setGenerateError(null)
    setStep('generating')

    // ── Demo mode — simulate the full pipeline without calling real APIs ──────
    if (isDemoModeRef.current) {
      const scenario = getDemoScenario(type ?? 'tax', localeRef.current)
      let agentIdx = 0
      for (const agent of scenario.agentOutputs) {
        setActiveAgent(agentIdx)
        // Compress real durations for demo: max 4 s per agent so the user isn't waiting long
        await new Promise((r) => setTimeout(r, Math.min(agent.durationMs / 10, 4000)))
        const output: AgentOutputData = {
          role: agent.role,
          provider: agent.provider,
          model: agent.model,
          durationMs: agent.durationMs,
          summary: agent.summary,
        }
        accOutputs.push(output)
        setAgentOutputData([...accOutputs])
        agentIdx++
      }
      setActiveAgent(accOutputs.length)
      // Stream the draft text in small chunks for a typing effect
      let preview = ''
      for (let i = 0; i < scenario.finalDraft.length; i += 8) {
        preview = scenario.finalDraft.slice(0, i + 8)
        setDraftPreview(preview)
        await new Promise((r) => setTimeout(r, 15))
      }
      setDraftPreview(scenario.finalDraft)
      setEditedDraft(scenario.finalDraft)
      setResult({
        outputs: accOutputs.map((o) => ({ role: o.role, provider: o.provider, model: o.model })),
        finalDraft: scenario.finalDraft,
        caseId: null,
      })
      setStep('result')
      return
    }

    // All document content was already extracted during the analyze step (bescheidDataRef).
    // Do NOT re-encode files as base64 — LLMs cannot parse binary-encoded PDFs passed as text,
    // and large files exceed Zod's validation limit causing 400 errors.
    // bescheidData carries everything agents need.

    // Remap answer keys from internal question IDs (q1, q2…) to question text so agents
    // can interpret the context. N/A sentinel is preserved as-is for buildContext() to handle.
    const questionMap = Object.fromEntries(
      (questionsRef.current ?? []).map((q) => [q.id, q.question])
    )
    const remappedAnswers: Record<string, string> = {}
    for (const [id, value] of Object.entries(answers)) {
      const text = questionMap[id] ?? id
      remappedAnswers[text] = value
    }

    // Case was already created in handleAnalyze — use it directly
    let activeCaseId = caseIdRef.current

    let finalDraft: string | null = null
    let completedCaseId = activeCaseId

    // 300 s hard timeout — pipeline can take 2-3 minutes in prod with 5 providers
    const abortCtrl = new AbortController()
    const generateTimeout = setTimeout(() => abortCtrl.abort(), 300_000)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: activeCaseId ?? undefined,
          bescheidData: bescheidDataRef.current ?? bescheidData ?? {},
          documents: [],
          userAnswers: remappedAnswers,
          uiLanguage: locale,
          outputLanguage,
        }),
        signal: abortCtrl.signal,
      })

      if (res.status === 401) {
        router.push(`/${locale}/login?callbackUrl=/${locale}/einspruch`)
        return
      }

      if (!res.ok || !res.body) {
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
              content: payload.content ? String(payload.content) : undefined,
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
    } finally {
      clearTimeout(generateTimeout)
      // Clear auto-saved answers once generation is complete
      if (caseIdRef.current) localStorage.removeItem(`taxalex_answers_${caseIdRef.current}`)
    }

    setEditedDraft(finalDraft ?? '')
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

  function appealFilename(ext: string) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const id = caseId ? `_${caseId.slice(-8).toUpperCase()}` : ''
    const topic = detectedDocType?.label
      ? detectedDocType.label
          .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
          .replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue').replace(/ß/g, 'ss')
          .replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').slice(0, 30)
      : 'Einspruch'
    return `${date}_${topic}${id}.${ext}`
  }

  function handleDownload() {
    if (!editedDraft) return
    const url = URL.createObjectURL(
      new Blob([editedDraft], { type: 'text/plain;charset=utf-8' })
    )
    Object.assign(document.createElement('a'), {
      href: url,
      download: appealFilename('txt'),
    }).click()
    URL.revokeObjectURL(url)
  }

  async function handleDownloadDocx() {
    if (!editedDraft) return
    const { downloadAsDocx } = await import('@/lib/exportDocx')
    await downloadAsDocx(editedDraft, appealFilename('docx'))
  }

  async function handleCopy() {
    if (!editedDraft) return
    await navigator.clipboard.writeText(editedDraft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleReset() {
    setStep('upload')
    setFiles([])
    setAdditionalFiles([])
    setFileLabels({})
    setResult(null)
    setAnswers({})
    setBescheidData(null)
    setQuestions([])
    setActiveAgent(0)
    setActiveAgentRoles(new Set())
    setUploadPhase(null)
    setUploadProgress(0)
    setUploadSentMB(0)
    setUploadTotalMB(0)
    setUploadSpeedMBps(0)
    setDetectedFields([])
    setReviewFields([])
    setDetectedDocType(null)
    setCaseId(null)
    setAgentOutputData([])
    setDraftPreview('')
    setEditedDraft('')
    setOutputLanguage('de')
    setGenerateError(null)
    setAnalyzeError(null)
    setResultLocked(false)
    setRetentionDays(null)
    caseIdRef.current = null
    bescheidDataRef.current = null
    questionsRef.current = null
    isDemoModeRef.current = false
    setIsDemoMode(false)
    setDemoCountdown(null)
    demoCountdownCallbackRef.current = null
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {isLoggedIn ? (
        <header className="border-b border-[var(--border)] bg-[var(--surface)] sticky top-0 z-10">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href={`/${locale}/dashboard`}
                className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{tNav('dashboard')}</span>
              </Link>
              <div className="w-px h-5 bg-[var(--border)] hidden sm:block" />
              <Logo size="sm" href={`/${locale}`} />
            </div>
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
      ) : (
        <PublicNav locale={locale} />
      )}

      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Step indicator — capped so it doesn't stretch across the full 1280px on wide screens */}
        <div className="max-w-3xl mx-auto mb-10">
        <div className="flex items-center">
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

        </div>

        {/* ── Demo mode banner ─────────────────────────────────────────────── */}
        {isDemoMode && (
          <div className="max-w-3xl mx-auto mb-6">
            <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl px-4 py-3">
              <span className="mt-0.5 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                {t('demo.badge')}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 leading-snug">
                  {t('demo.banner')}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
                  {t(`demo.steps.${step}`)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Step 1 — Upload ═══ */}
        {step === 'upload' && (
          <div className="max-w-xl mx-auto">
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

            <div className="relative">
              {isAccountDemo && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-[var(--background-subtle)]/90 backdrop-blur-sm gap-2">
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {t('demo.badge')}
                  </span>
                  <p className="text-sm font-semibold text-[var(--foreground)]">{t('upload.demoDisabled')}</p>
                </div>
              )}
            <div
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                isAccountDemo
                  ? 'border-[var(--border)] opacity-50 pointer-events-none cursor-default'
                  : isDragging
                    ? 'border-brand-400 bg-brand-50 dark:bg-brand-950/30 cursor-pointer'
                    : 'border-[var(--border)] hover:border-brand-300 hover:bg-brand-50/40 dark:hover:bg-brand-950/20 cursor-pointer'
              }`}
              onClick={() => !isAccountDemo && fileInputRef.current?.click()}
              onDragOver={(e) => {
                if (isAccountDemo) return
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                if (isAccountDemo) return
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
                {['PDF', 'JPG / PNG', 'TXT'].map((ext) => (
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
                disabled={isAccountDemo}
                accept=".pdf,.txt,.jpg,.jpeg,.png,.webp"
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>
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
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-[var(--muted)]">
                          {(f.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                        <select
                          value={fileLabels[f.name] ?? ''}
                          onChange={(e) => setFileLabels((prev) => ({ ...prev, [f.name]: e.target.value }))}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs border border-[var(--border)] rounded-lg px-2 py-0.5 bg-[var(--surface)] text-[var(--foreground)] cursor-pointer"
                        >
                          <option value="">{t('upload.fileLabel.default')}</option>
                          <option value="contested">{t('upload.fileLabel.contested')}</option>
                          <option value="evidence">{t('upload.fileLabel.evidence')}</option>
                          <option value="correspondence">{t('upload.fileLabel.correspondence')}</option>
                        </select>
                      </div>
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

            <div className="mt-5">
              <label
                htmlFor="user-context"
                className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
              >
                {t('upload.contextLabel')}
                <span className="ml-1.5 text-xs font-normal text-[var(--muted)]">
                  {t('upload.contextOptional')}
                </span>
              </label>
              <textarea
                id="user-context"
                value={userContext}
                onChange={(e) => setUserContext(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder={t('upload.contextPlaceholder')}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] resize-none focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-colors"
              />
              {userContext.length > 800 && (
                <p className="text-xs text-[var(--muted)] mt-1 text-right">
                  {userContext.length}/1000
                </p>
              )}
            </div>

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
          <div className="max-w-xl mx-auto py-8 flex flex-col items-center">
            <div
              className={`w-16 h-16 border rounded-2xl flex items-center justify-center mb-5 transition-all duration-500 ${
                detectedDocType
                  ? 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800'
                  : isUploading
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
                    : 'bg-brand-50 dark:bg-brand-950/40 border-brand-200 dark:border-brand-800'
              }`}
            >
              {detectedDocType ? (
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              ) : isUploading ? (
                <Upload className="w-8 h-8 text-blue-500 animate-bounce" />
              ) : (
                <ScanSearch className="w-8 h-8 text-brand-600 animate-pulse" />
              )}
            </div>

            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1 text-center">
              {detectedDocType
                ? t('analyzing.detectedTitle')
                : isUploading
                  ? t('analyzing.uploadingTitle')
                  : t('analyzing.title')}
            </h1>

            <p className="text-sm text-[var(--muted)] mb-5 text-center min-h-[1.25rem]">
              {uploadPhase === 'uploading'
                ? t('analyzing.uploading')
                : detectedDocType
                  ? t('analyzing.detectedSubtitle')
                  : files.length > 0
                    ? t('analyzing.scanning')
                    : t('analyzing.demoMode')}
            </p>

            {/* ── Upload phase: progress bar + speed/ETA ── */}
            {uploadPhase === 'uploading' && (
              <div className="w-full max-w-sm mb-5">
                <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1.5">
                  <span>
                    {files.length} {files.length === 1 ? t('analyzing.file') : t('analyzing.files')}
                  </span>
                  <span className="tabular-nums">{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--muted)] tabular-nums">
                  <span>
                    {uploadSentMB.toFixed(1)} / {uploadTotalMB.toFixed(1)} MB
                  </span>
                  {uploadSpeedMBps > 0.01 && (
                    <span>
                      {uploadSpeedMBps.toFixed(1)} MB/s
                      {uploadTotalMB > uploadSentMB && (
                        <> · ~{Math.max(1, Math.ceil((uploadTotalMB - uploadSentMB) / uploadSpeedMBps))}s</>
                      )}
                    </span>
                  )}
                </div>
              </div>
            )}

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
            {!isUploading && (
              <div className="w-full max-w-sm space-y-2">
                {detectedFields.map((field) => {
                  const FieldIcon = resolveFieldIcon(field.icon)
                  const imp = field.importance === 'high'
                    ? { border: 'border-l-amber-400', iconBg: 'bg-amber-50 dark:bg-amber-950/30', iconColor: 'text-amber-600 dark:text-amber-400' }
                    : field.importance === 'medium'
                    ? { border: 'border-l-indigo-400', iconBg: 'bg-indigo-50 dark:bg-indigo-950/30', iconColor: 'text-indigo-600 dark:text-indigo-400' }
                    : { border: 'border-l-[var(--border)]', iconBg: 'bg-[var(--background-subtle)]', iconColor: 'text-[var(--muted)]' }
                  return (
                    <div
                      key={field.key}
                      className={`flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] border-l-2 ${imp.border} rounded-xl px-4 py-3 animate-in slide-in-from-right-2 fade-in duration-300`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${imp.iconBg}`}>
                        <FieldIcon className={`w-4 h-4 ${imp.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-[var(--muted)] leading-none mb-1">
                          {field.label}
                        </p>
                        <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                          {field.value}
                        </p>
                      </div>
                    </div>
                  )
                })}

                {/* Skeleton rows — shown while waiting for the first fields to arrive */}
                {detectedFields.length === 0 && files.length > 0 && (
                  <>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] border-l-2 border-l-[var(--border)] rounded-xl px-4 py-3"
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
            )}

            {!files.length && detectedFields.length === 0 && (
              <p className="text-xs text-[var(--muted)] text-center mt-2">
                {t('analyzing.demoMode')}
              </p>
            )}

            {/* Refining questions indicator — shown while specialist agents propose and consolidate questions */}
            {refiningQuestions && (
              <div className="mt-5 flex items-center gap-2.5 text-sm text-brand-600 dark:text-brand-400 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>{t('questions.refining')}</span>
              </div>
            )}

            {/* Demo countdown bar — shown after fields are extracted, before advancing */}
            {isDemoMode && demoCountdown && (
              <div className="mt-6 w-full max-w-sm">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-brand-600 dark:text-brand-400 font-medium">
                    {t('demo.countdown').replace('{seconds}', String(demoCountdown.remaining))}
                  </span>
                  <button
                    onClick={skipDemoCountdown}
                    className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium underline"
                  >
                    {t('demo.skip')}
                  </button>
                </div>
                <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all duration-1000 ease-linear"
                    style={{
                      width: `${((demoCountdown.total - demoCountdown.remaining) / demoCountdown.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
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

            <div className="grid lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-6 lg:gap-8">
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
                          <label className="block text-base font-semibold text-[var(--foreground)] mb-2">
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

                          {/* Why this question matters — plain-language explanation from the consolidator */}
                          {q.why && (
                            <p className="text-xs text-[var(--muted)] mb-3 leading-relaxed italic">
                              {q.why}
                            </p>
                          )}

                          {/* Context toggle — legal basis + practical guidance */}
                          {(q.background || q.guidance) && (
                            <div className="mb-3">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenContextIds((prev) => {
                                    const next = new Set(prev)
                                    if (next.has(q.id)) next.delete(q.id)
                                    else next.add(q.id)
                                    return next
                                  })
                                }
                                className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors py-0.5"
                              >
                                <span className="text-[10px]">ℹ️</span>
                                {t('questions.context')}
                                <span className="text-[9px] opacity-60">{openContextIds.has(q.id) ? '▴' : '▾'}</span>
                              </button>

                              {openContextIds.has(q.id) && (
                                <div className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--background-subtle)] overflow-hidden text-xs leading-relaxed">
                                  {q.background && (
                                    <div className="px-3 py-2.5 flex gap-2">
                                      <span className="shrink-0 text-[11px] mt-0.5">⚖️</span>
                                      <div>
                                        <span className="font-semibold text-[var(--foreground)] block mb-0.5">{t('questions.legalBasis')}</span>
                                        <span className="text-[var(--muted)]">{q.background}</span>
                                      </div>
                                    </div>
                                  )}
                                  {q.background && q.guidance && (
                                    <div className="border-t border-[var(--border)]" />
                                  )}
                                  {q.guidance && (
                                    <div className="px-3 py-2.5 flex gap-2">
                                      <span className="shrink-0 text-[11px] mt-0.5">💡</span>
                                      <div>
                                        <span className="font-semibold text-[var(--foreground)] block mb-0.5">{t('questions.guidance')}</span>
                                        <span className="text-[var(--muted)]">{q.guidance}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Yes/No question → three buttons: Yes / No / N/A */}
                          {qType === 'yesno' && (
                            <div className="flex gap-2">
                              {[
                                { value: tCommon('yes'), label: tCommon('yes') },
                                { value: tCommon('no'), label: tCommon('no') },
                                { value: '__na__', label: t('questions.na') },
                              ].map(({ value, label }) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() =>
                                    setAnswers((a) => ({ ...a, [q.id]: a[q.id] === value ? '' : value }))
                                  }
                                  className={`flex-1 py-2.5 rounded-xl text-[15px] font-semibold border-2 transition-all ${
                                    answers[q.id] === value
                                      ? value === '__na__'
                                        ? 'bg-[var(--muted)] border-[var(--muted)] text-[var(--surface)]'
                                        : 'bg-brand-600 border-brand-600 text-white'
                                      : 'bg-[var(--background-subtle)] border-[var(--border)] text-[var(--foreground)] hover:border-brand-300'
                                  }`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Amount question → number input + N/A button */}
                          {qType === 'amount' && (
                            <div>
                              <div className={`relative transition-opacity ${answers[q.id] === '__na__' ? 'opacity-40 pointer-events-none' : ''}`}>
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">
                                  €
                                </span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  className="w-full pl-8 pr-4 py-3 text-[15px] border border-[var(--border)] rounded-xl bg-[var(--background-subtle)] text-[var(--foreground)] focus:bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-colors"
                                  placeholder="0,00"
                                  value={answers[q.id] === '__na__' ? '' : (answers[q.id] ?? '')}
                                  onChange={(e) =>
                                    setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                                  }
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setAnswers((a) => ({ ...a, [q.id]: a[q.id] === '__na__' ? '' : '__na__' }))
                                }
                                className={`mt-1.5 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                                  answers[q.id] === '__na__'
                                    ? 'bg-[var(--muted)] border-[var(--muted)] text-[var(--surface)]'
                                    : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]'
                                }`}
                              >
                                {t('questions.na')}
                              </button>
                            </div>
                          )}

                          {/* Date question → date input + N/A button */}
                          {qType === 'date' && (
                            <div>
                              <div className={`transition-opacity ${answers[q.id] === '__na__' ? 'opacity-40 pointer-events-none' : ''}`}>
                                <input
                                  type="date"
                                  className="w-full border border-[var(--border)] rounded-xl px-4 py-3 text-[15px] bg-[var(--background-subtle)] text-[var(--foreground)] focus:bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-colors"
                                  value={answers[q.id] === '__na__' ? '' : (answers[q.id] ?? '')}
                                  onChange={(e) =>
                                    setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                                  }
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setAnswers((a) => ({ ...a, [q.id]: a[q.id] === '__na__' ? '' : '__na__' }))
                                }
                                className={`mt-1.5 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                                  answers[q.id] === '__na__'
                                    ? 'bg-[var(--muted)] border-[var(--muted)] text-[var(--surface)]'
                                    : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]'
                                }`}
                              >
                                {t('questions.na')}
                              </button>
                            </div>
                          )}

                          {/* Text question → textarea + N/A button */}
                          {qType === 'text' && (
                            <div>
                              <div className={`transition-opacity ${answers[q.id] === '__na__' ? 'opacity-40 pointer-events-none' : ''}`}>
                                <textarea
                                  rows={3}
                                  className="w-full border border-[var(--border)] rounded-xl px-4 py-3 text-[15px] bg-[var(--background-subtle)] text-[var(--foreground)] focus:bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-colors resize-none placeholder:text-[var(--muted)]"
                                  placeholder={
                                    q.required ? '' : t('questions.optional') + '…'
                                  }
                                  value={answers[q.id] === '__na__' ? '' : (answers[q.id] ?? '')}
                                  onChange={(e) =>
                                    setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                                  }
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setAnswers((a) => ({ ...a, [q.id]: a[q.id] === '__na__' ? '' : '__na__' }))
                                }
                                className={`mt-1.5 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                                  answers[q.id] === '__na__'
                                    ? 'bg-[var(--muted)] border-[var(--muted)] text-[var(--surface)]'
                                    : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]'
                                }`}
                              >
                                {t('questions.na')}
                              </button>
                            </div>
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
                    <div className="space-y-2">
                      {detectedFields.map((field) => {
                        const imp = field.importance ?? 'low'
                        const border =
                          imp === 'high'   ? 'border-l-amber-400' :
                          imp === 'medium' ? 'border-l-indigo-400' :
                                             'border-l-[var(--border-strong)]'
                        return (
                          <div key={field.key} className={`border-l-2 ${border} pl-2 py-0.5`}>
                            <p className="text-[11px] uppercase tracking-wide text-[var(--muted)] leading-none mb-0.5">
                              {field.label}
                            </p>
                            <p className="text-sm font-semibold text-[var(--foreground)] leading-snug break-words">
                              {field.value}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional documents upload — hidden for demo accounts */}
            <div className={`mt-6 border border-dashed border-[var(--border)] rounded-2xl p-4 bg-[var(--background-subtle)] ${isAccountDemo ? 'opacity-40 pointer-events-none' : ''}`}>
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

            {/* Demo countdown bar — shown after auto-fill, before auto-submit */}
            {isDemoMode && demoCountdown && (
              <div className="mt-4 mb-1">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-brand-600 dark:text-brand-400 font-medium">
                    {t('demo.countdown').replace('{seconds}', String(demoCountdown.remaining))}
                  </span>
                  <button
                    onClick={skipDemoCountdown}
                    className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium underline"
                  >
                    {t('demo.skip')}
                  </button>
                </div>
                <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all duration-1000 ease-linear"
                    style={{
                      width: `${((demoCountdown.total - demoCountdown.remaining) / demoCountdown.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
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
                onClick={handleReview}
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

        {/* ═══ Step 3b — Reviewing (additional docs) ═══ */}
        {step === 'reviewing' && (
          <div className="max-w-xl mx-auto py-8 flex flex-col items-center">
            <div
              className={`w-16 h-16 border rounded-2xl flex items-center justify-center mb-5 transition-all duration-500 ${
                uploadPhase === 'uploading'
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
                  : 'bg-brand-50 dark:bg-brand-950/40 border-brand-200 dark:border-brand-800'
              }`}
            >
              {uploadPhase === 'uploading' ? (
                <Upload className="w-8 h-8 text-blue-500 animate-bounce" />
              ) : (
                <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
              )}
            </div>

            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1 text-center">
              {t('reviewing.title')}
            </h1>
            <p className="text-sm text-[var(--muted)] mb-5 text-center">
              {uploadPhase === 'uploading'
                ? t('analyzing.uploading')
                : t('reviewing.subtitle')}
            </p>

            {/* Upload progress bar */}
            {uploadPhase === 'uploading' && (
              <div className="w-full max-w-sm mb-5">
                <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1.5">
                  <span>
                    {additionalFiles.length} {additionalFiles.length === 1 ? t('analyzing.file') : t('analyzing.files')}
                  </span>
                  <span className="tabular-nums">{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--muted)] tabular-nums">
                  <span>
                    {uploadSentMB.toFixed(1)} / {uploadTotalMB.toFixed(1)} MB
                  </span>
                  {uploadSpeedMBps > 0.01 && (
                    <span>
                      {uploadSpeedMBps.toFixed(1)} MB/s
                      {uploadTotalMB > uploadSentMB && (
                        <> · ~{Math.max(1, Math.ceil((uploadTotalMB - uploadSentMB) / uploadSpeedMBps))}s</>
                      )}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Streaming field cards — only fields from the additional documents */}
            {uploadPhase !== 'uploading' && (
              <div className="w-full max-w-sm space-y-2">
                {reviewFields.length > 0 && (
                  <p className="text-xs text-[var(--muted)] text-center mb-1">
                    {reviewFields.length} {t('reviewing.found')}
                  </p>
                )}
                {reviewFields.map((field) => {
                  const FieldIcon = resolveFieldIcon(field.icon)
                  const imp = field.importance === 'high'
                    ? { border: 'border-l-amber-400', iconBg: 'bg-amber-50 dark:bg-amber-950/30', iconColor: 'text-amber-600 dark:text-amber-400' }
                    : field.importance === 'medium'
                    ? { border: 'border-l-indigo-400', iconBg: 'bg-indigo-50 dark:bg-indigo-950/30', iconColor: 'text-indigo-600 dark:text-indigo-400' }
                    : { border: 'border-l-[var(--border)]', iconBg: 'bg-[var(--background-subtle)]', iconColor: 'text-[var(--muted)]' }
                  return (
                    <div
                      key={field.key}
                      className={`flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] border-l-2 ${imp.border} rounded-xl px-4 py-3 animate-in slide-in-from-right-2 fade-in duration-300`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${imp.iconBg}`}>
                        <FieldIcon className={`w-4 h-4 ${imp.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-[var(--muted)] leading-none mb-1">
                          {field.label}
                        </p>
                        <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                          {field.value}
                        </p>
                      </div>
                    </div>
                  )
                })}
                {/* Skeleton while waiting for first fields from additional docs */}
                {reviewFields.length === 0 && (
                  <>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] border-l-2 border-l-[var(--border)] rounded-xl px-4 py-3"
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
            )}
          </div>
        )}

        {/* ═══ Step 4 — Generating ═══ */}
        {step === 'generating' && (
          <div className="py-4">
            <div className="max-w-2xl mx-auto text-center mb-8">
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

                {/* Post-processing: adversary-final + reporter run after draft appears */}
                <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-1.5">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-semibold mb-2">
                    Post-processing
                  </p>
                  {POST_AGENT_IDS.map((id) => {
                    const done = agentOutputData.some((o) => o.role === id)
                    const active = activeAgentRoles.has(id) && !done
                    return (
                      <div
                        key={id}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-300 ${
                          done
                            ? 'bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900'
                            : active
                              ? 'bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 shadow-sm'
                              : 'bg-[var(--background-subtle)] border border-transparent'
                        }`}
                      >
                        <div className="shrink-0">
                          {done ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : active ? (
                            <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-[var(--border)]" />
                          )}
                        </div>
                        <p className={`flex-1 text-xs font-medium ${done ? 'text-green-700 dark:text-green-400' : active ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>
                          {t(`generating.agents.${id}`)}
                        </p>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          done
                            ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                            : active
                              ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300'
                              : 'bg-[var(--border)] text-[var(--muted)]'
                        }`}>
                          {POST_AGENT_PROVIDERS[id]}
                        </span>
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
                  {(activeAgent < AGENT_IDS.length || activeAgentRoles.has('adversary-final') || activeAgentRoles.has('reporter')) && (
                    <span className="flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {activeAgentRoles.has('adversary-final')
                        ? t('generating.reviewingDraft')
                        : activeAgentRoles.has('reporter')
                          ? t('generating.writingReport')
                          : t('generating.writing')}
                    </span>
                  )}
                </div>
                <div className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--background-subtle)]">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                    <span className="ml-2 text-xs text-[var(--muted)]">
                      {brand.name}-Einspruch.txt
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
                        {(activeAgent < AGENT_IDS.length || activeAgentRoles.has('adversary-final') || activeAgentRoles.has('reporter')) && (
                          <span className="animate-pulse text-brand-500">▌</span>
                        )}
                      </>
                    ) : (
                      <span className="text-[var(--muted)] italic">
                        {t('generating.draftPlaceholder')}
                      </span>
                    )}
                  </pre>
                  {/* Post-draft status line — visible when steps 6–7 run after draft appears */}
                  {draftPreview && (activeAgentRoles.has('adversary-final') || activeAgentRoles.has('reporter')) && (
                    <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] px-4 py-2 border-t border-[var(--border)] animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                      <span>
                        {activeAgentRoles.has('adversary-final')
                          ? t('generating.reviewingDraft')
                          : t('generating.writingReport')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Step 5 — Result ═══ */}
        {step === 'result' && result && (
          <div>
            {/* Demo mode notice — compact top banner */}
            {isDemoMode && (
              <div className="mb-5 flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2.5">
                <span className="bg-amber-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  {t('demo.badge')}
                </span>
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  {t('result.demoBanner')}
                </p>
              </div>
            )}

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
                <div className="max-w-2xl mx-auto text-center mb-8">
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

                {/* Non-German output language warning */}
                {outputLanguage !== 'de' && (
                  <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-5">
                    <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      {t('result.outputLanguageWarning', {
                        language: languageNames[outputLanguage] ?? outputLanguage,
                      })}
                    </p>
                  </div>
                )}

                {/* Skeleton preview — contested point titles shown to free users as a value teaser */}
                {resultLocked && skeletonPoints.length > 0 && (
                  <div className="mb-5 bg-[var(--background-subtle)] border border-[var(--border)] rounded-2xl p-5">
                    <p className="text-sm font-semibold text-[var(--foreground)] mb-3">
                      {t('result.skeletonPreview')}
                    </p>
                    <ul className="space-y-2">
                      {skeletonPoints.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[var(--muted)]">
                          <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="leading-snug">
                            {(p.authority_claim ?? '').slice(0, 80)}{(p.authority_claim ?? '').length > 80 ? '…' : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-[var(--muted)] mt-3 italic">
                      {t('result.unlockToSeeFullLetter')}
                    </p>
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
                        {appealFilename('txt')}
                      </span>
                    </div>
                    <span className="text-xs text-[var(--muted)]">
                      {t('result.draftEditable')}
                    </span>
                  </div>
                  <div className="relative">
                    <textarea
                      readOnly={resultLocked}
                      className={`w-full p-5 font-mono text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap resize-none bg-transparent focus:outline-none ${resultLocked ? 'max-h-48 select-none overflow-hidden' : 'max-h-80 overflow-y-auto'}`}
                      value={resultLocked ? result.finalDraft.slice(0, 600) : editedDraft}
                      onChange={(e) => !resultLocked && setEditedDraft(e.target.value)}
                      rows={resultLocked ? 8 : 16}
                    />
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
                          href={`/${locale}/billing${caseId ? `?caseId=${caseId}` : ''}`}
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
                  <div className="flex gap-3 mb-4 flex-wrap">
                    <button
                      onClick={handleDownload}
                      className="flex items-center justify-center gap-2 bg-brand-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      {t('result.download')}
                    </button>
                    <button
                      onClick={handleDownloadDocx}
                      className="flex items-center justify-center gap-2 border border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-300 px-5 py-3 rounded-xl font-semibold hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      {t('result.downloadWord')}
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

                {/* Retention notice — shown only for free users */}
                {retentionDays !== null && (
                  <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-5">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-amber-800 dark:text-amber-300">
                        {t('result.retentionNotice', { days: retentionDays })}
                      </p>
                      <button
                        onClick={() => router.push(`/${locale}/billing`)}
                        className="mt-1 text-amber-700 dark:text-amber-400 font-semibold hover:underline"
                      >
                        {t('result.retentionCta')} →
                      </button>
                    </div>
                  </div>
                )}

                {/* Next steps */}
                <div className="bg-[var(--background-subtle)] border border-[var(--border)] rounded-2xl p-5 mb-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
                    {t('result.nextSteps.title')}
                  </p>
                  <div className="space-y-3">
                    {(['check', 'print', 'send', 'wait'] as const).map((key, i) => (
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

                {/* Expert advisor CTA — shown when result is unlocked and a real case was saved */}
                {!resultLocked && !isDemoMode && result?.caseId && (
                  <div className="mb-5 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-5 bg-indigo-50 dark:bg-indigo-950/20">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-white dark:bg-indigo-900 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800">
                        <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-indigo-900 dark:text-indigo-200">
                          {t('result.expertTitle')}
                        </p>
                        <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-0.5 leading-relaxed">
                          {t('result.expertSubtitle')}
                        </p>
                      </div>
                      <Link
                        href={`/${locale}/cases/${result.caseId}#expert`}
                        className="shrink-0 text-xs font-semibold px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
                      >
                        {t('result.expertCta')}
                      </Link>
                    </div>
                  </div>
                )}

                {/* Demo CTA — prominent call-to-action after demo completion */}
                {isDemoMode && (
                  <div className="mb-5 bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl p-6 text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">
                      {t('result.demoCta.title')}
                    </h2>
                    <p className="text-sm text-white/80 mb-5 max-w-sm mx-auto leading-relaxed">
                      {t('result.demoCta.subtitle')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <a
                        href={`/${locale}/register`}
                        className="bg-white text-brand-700 font-bold px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors"
                      >
                        {t('result.demoCta.cta')}
                      </a>
                      <a
                        href={`/${locale}/preise`}
                        className="border border-white/40 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
                      >
                        {t('result.demoCta.plans')}
                      </a>
                    </div>
                  </div>
                )}
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
