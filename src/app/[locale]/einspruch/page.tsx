'use client'

import { useState, useRef } from 'react'
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
} from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Logo } from '@/components/Logo'

type Step = 'upload' | 'questions' | 'generating' | 'result'

const STEPS = [
  { id: 'upload', label: 'Hochladen', icon: Upload },
  { id: 'questions', label: 'Rückfragen', icon: MessageSquare },
  { id: 'generating', label: 'KI-Analyse', icon: Brain },
  { id: 'result', label: 'Ergebnis', icon: FileCheck },
] as const

const AGENTS = [
  {
    id: 'drafter',
    label: 'Einspruch formulieren',
    detail: 'Erstellt Einspruch basierend auf erkannten Bescheid-Daten',
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

export default function EinspruchPage() {
  const [step, setStep] = useState<Step>('upload')
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [bescheidData, setBescheidData] = useState<Record<string, string> | null>(null)
  const [questions, setQuestions] = useState<
    Array<{ id: string; question: string; required?: boolean }>
  >([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<{
    outputs: Array<{ role: string; provider: string; model: string }>
    finalDraft: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeAgent, setActiveAgent] = useState<number>(-1)
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
    if (files.length === 0) return
    setError(null)
    try {
      const documents = await Promise.all(
        files.map(async (f) => ({ name: f.name, text: await f.text() }))
      )
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents }),
      })
      if (!res.ok) throw new Error('Analyse fehlgeschlagen')
      const data = await res.json()
      setBescheidData(data.bescheidData)
      setQuestions(data.followUpQuestions ?? [])
      setStep('questions')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    }
  }

  async function handleGenerate() {
    setStep('generating')
    setActiveAgent(0)
    setError(null)
    try {
      const documents = await Promise.all(
        files.map(async (f) => ({ name: f.name, text: await f.text() }))
      )
      // Simulate agent progress while the real call runs
      const timer = setInterval(() => {
        setActiveAgent((prev) => (prev < AGENTS.length - 1 ? prev + 1 : prev))
      }, 900)

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bescheidData, documents, userAnswers: answers }),
      })
      clearInterval(timer)
      if (!res.ok) throw new Error('Generierung fehlgeschlagen')
      const data = await res.json()
      setActiveAgent(AGENTS.length)
      setResult(data)
      setStep('result')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Generierung fehlgeschlagen')
      setStep('questions')
    }
  }

  function handleDownload() {
    if (!result) return
    const blob = new Blob([result.finalDraft], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'TaxaLex-Einspruch.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleCopy() {
    if (!result) return
    await navigator.clipboard.writeText(result.finalDraft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-white sticky top-0 z-10">
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
                          ? 'bg-white border-brand-600'
                          : 'bg-white border-gray-200'
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <s.icon
                        className={`w-4 h-4 ${active ? 'text-brand-600' : 'text-gray-300'}`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-medium hidden sm:block ${
                      active
                        ? 'text-brand-600'
                        : done
                          ? 'text-brand-400'
                          : 'text-gray-300'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 mb-4 sm:mb-3 transition-colors ${
                      done ? 'bg-brand-400' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* ── Step 1: Upload ── */}
        {step === 'upload' && (
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">
              Bescheid hochladen
            </h1>
            <p className="text-[var(--muted)] mb-6 text-sm">
              Laden Sie Ihren Bescheid und relevante Unterlagen hoch (PDF, Foto, DOCX,
              TXT).
            </p>

            {/* Drop zone */}
            <div
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-brand-400 bg-brand-50'
                  : 'border-gray-200 hover:border-brand-300 hover:bg-brand-50/40'
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
              <div className="w-14 h-14 bg-brand-50 border border-brand-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-7 h-7 text-brand-500" />
              </div>
              <p className="font-semibold text-[var(--foreground)] mb-1">
                Dateien hier ablegen
              </p>
              <p className="text-sm text-[var(--muted)]">
                oder klicken, um Dateien auszuwählen
              </p>
              <p className="text-xs text-[var(--muted)] mt-2">
                PDF · DOCX · TXT · JPG · PNG · max. 10 MB
              </p>
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
                    className="flex items-center gap-3 bg-white border border-[var(--border)] rounded-xl px-4 py-3"
                  >
                    <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-brand-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">
                        {f.name}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {(f.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(f.name)
                      }}
                      className="p-1.5 text-[var(--muted)] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={files.length === 0}
              className="mt-6 w-full bg-brand-600 text-white py-3.5 rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
            >
              Dokumente analysieren
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Step 2: Questions ── */}
        {step === 'questions' && (
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">
              Rückfragen
            </h1>
            <p className="text-[var(--muted)] mb-6 text-sm">
              Bitte beantworten Sie diese Fragen für einen optimal formulierten Einspruch.
            </p>

            {/* Detected data */}
            {bescheidData && (
              <div className="bg-white border border-[var(--border)] rounded-2xl p-5 mb-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
                  Erkannte Bescheid-Daten
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {Object.entries(bescheidData).map(([k, v]) => (
                    <div key={k} className="contents">
                      <span className="text-[var(--muted)] capitalize">{k}:</span>
                      <span className="font-medium text-[var(--foreground)]">
                        {String(v)}
                      </span>
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
                    className="w-full border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-colors resize-none"
                    placeholder="Ihre Antwort…"
                    value={answers[q.id] ?? ''}
                    onChange={(e) =>
                      setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep('upload')}
                className="flex items-center gap-2 border border-[var(--border)] text-[var(--foreground)] px-5 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
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

        {/* ── Step 3: Generating ── */}
        {step === 'generating' && (
          <div className="py-4">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-50 rounded-2xl mb-4">
                <Brain className="w-8 h-8 text-brand-600 animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                Multi-KI-Analyse läuft…
              </h1>
              <p className="text-[var(--muted)] text-sm">
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
                    ? `Schritt ${activeAgent + 1} von ${AGENTS.length}: ${AGENTS[activeAgent].label}`
                    : `Alle ${AGENTS.length} Agenten abgeschlossen`}
                </span>
                <span className="font-medium">
                  {activeAgent >= AGENTS.length
                    ? '100 %'
                    : `${Math.round(((activeAgent) / AGENTS.length) * 100)} %`}
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
                        ? 'bg-green-50 dark:bg-green-950/40 border border-green-100 dark:border-green-900'
                        : active
                          ? 'bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 shadow-sm'
                          : 'bg-[var(--background-subtle)] border border-transparent'
                    }`}
                  >
                    {/* Status indicator */}
                    <div className="shrink-0">
                      {done ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : active ? (
                        <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-[var(--border)]" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold leading-tight ${
                        done ? 'text-green-700 dark:text-green-400' :
                        active ? 'text-[var(--foreground)]' :
                        'text-[var(--muted)]'
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

                    {/* Provider badge */}
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

        {/* ── Step 4: Result ── */}
        {step === 'result' && result && (
          <div>
            {/* Success header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">
                  Einspruch fertig
                </h1>
                <p className="text-sm text-[var(--muted)]">
                  Geprüft durch {result.outputs?.length ?? 0} KI-Agenten
                </p>
              </div>
            </div>

            {/* Agent log */}
            <div className="bg-white border border-[var(--border)] rounded-2xl p-5 mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
                KI-Agenten-Protokoll
              </p>
              <div className="space-y-2">
                {result.outputs?.map((o, i) => {
                  const agent = AGENTS.find((a) => a.id === o.role)
                  return (
                    <div key={i} className="flex items-center gap-2.5 text-sm">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${agent?.color ?? 'bg-gray-400'}`}
                      />
                      <span className="font-medium capitalize text-[var(--foreground)]">
                        {o.role}
                      </span>
                      <span className="text-[var(--muted)] text-xs">
                        {o.provider} / {o.model}
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 ml-auto" />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Letter preview */}
            <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden mb-5">
              <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)] bg-gray-50">
                <div className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                  <FileText className="w-4 h-4 text-brand-500" />
                  Einspruchsschreiben
                </div>
                <span className="text-xs text-[var(--muted)]">Entwurf · bearbeitbar</span>
              </div>
              <div className="p-5 font-mono text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
                {result.finalDraft}
              </div>
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
                className="flex items-center justify-center gap-2 border border-[var(--border)] px-5 py-3 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors min-w-[120px]"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Kopiert ✓' : 'Kopieren'}
              </button>
            </div>

            <p className="text-xs text-[var(--muted)] text-center mt-4 leading-relaxed">
              Kein Rechtsrat im Sinne des RDG. Bitte prüfen Sie den Entwurf vor der
              Einreichung.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
