'use client'

import { useState } from 'react'
import {
  Upload,
  MessageSquare,
  Brain,
  FileCheck,
  ChevronRight,
  Loader2,
  Shield,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'

type Step = 'upload' | 'questions' | 'generating' | 'result'

export default function EinspruchPage() {
  const [step, setStep] = useState<Step>('upload')
  const [files, setFiles] = useState<File[]>([])
  const [bescheidData, setBescheidData] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState('')

  const steps = [
    { id: 'upload', label: 'Hochladen', icon: Upload },
    { id: 'questions', label: 'Rückfragen', icon: MessageSquare },
    { id: 'generating', label: 'KI-Analyse', icon: Brain },
    { id: 'result', label: 'Ergebnis', icon: FileCheck },
  ]

  const currentIdx = steps.findIndex((s) => s.id === step)

  // Step 1: Handle file upload and analysis
  async function handleAnalyze() {
    if (files.length === 0) return
    setError(null)

    try {
      // Read file contents (for now, handle as text — OCR/PDF later)
      const documents = await Promise.all(
        files.map(async (f) => ({
          name: f.name,
          text: await f.text(),
        }))
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
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Step 2: Submit answers and start generation
  async function handleGenerate() {
    setStep('generating')
    setProgress('Entwurf wird erstellt...')
    setError(null)

    try {
      const documents = await Promise.all(
        files.map(async (f) => ({
          name: f.name,
          text: await f.text(),
        }))
      )

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bescheidData, documents, userAnswers: answers }),
      })

      if (!res.ok) throw new Error('Generierung fehlgeschlagen')

      const data = await res.json()
      setResult(data)
      setStep('result')
    } catch (err: any) {
      setError(err.message)
      setStep('questions')
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/" className="text-[var(--muted)] hover:text-brand-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Shield className="w-6 h-6 text-brand-600" />
          <span className="font-bold">TaxPax</span>
          <span className="text-[var(--muted)] text-sm">Einspruch erstellen</span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="max-w-3xl mx-auto px-6 py-6">
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div
                className={`flex items-center gap-2 text-sm font-medium ${
                  i <= currentIdx
                    ? 'text-brand-600'
                    : 'text-gray-300'
                }`}
              >
                <s.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 ${
                    i < currentIdx ? 'bg-brand-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div>
            <h2 className="text-xl font-bold mb-2">
              Steuerbescheid hochladen
            </h2>
            <p className="text-[var(--muted)] mb-6">
              Laden Sie Ihren Steuerbescheid und relevante Unterlagen hoch
              (Jahresabschlüsse, Belege etc.)
            </p>

            <label className="block border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-colors">
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="font-medium">Dateien auswählen</p>
              <p className="text-sm text-[var(--muted)] mt-1">
                PDF, DOCX, TXT oder Bilder
              </p>
              <input
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.docx,.txt,.jpg,.png"
                onChange={(e) =>
                  setFiles(Array.from(e.target.files ?? []))
                }
              />
            </label>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-[var(--border)]"
                  >
                    <FileCheck className="w-4 h-4 text-green-600" />
                    <span className="text-sm flex-1 truncate">{f.name}</span>
                    <span className="text-xs text-[var(--muted)]">
                      {(f.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={files.length === 0}
              className="mt-6 w-full bg-brand-600 text-white py-3 rounded-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
            >
              Dokumente analysieren <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Follow-up questions */}
        {step === 'questions' && (
          <div>
            <h2 className="text-xl font-bold mb-2">Rückfragen</h2>
            <p className="text-[var(--muted)] mb-6">
              Bitte beantworten Sie diese Fragen, damit wir den Einspruch
              optimal formulieren können.
            </p>

            {bescheidData && (
              <div className="bg-white rounded-lg border border-[var(--border)] p-4 mb-6">
                <h3 className="font-semibold text-sm mb-2">Erkannte Daten</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-[var(--muted)]">Finanzamt:</span>
                  <span>{bescheidData.finanzamt}</span>
                  <span className="text-[var(--muted)]">Nachzahlung:</span>
                  <span className="font-medium text-red-600">
                    €{bescheidData.nachzahlung}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {questions.map((q: any) => (
                <div key={q.id}>
                  <label className="block text-sm font-medium mb-1.5">
                    {q.question}
                    {q.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <textarea
                    rows={3}
                    className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                    value={answers[q.id] ?? ''}
                    onChange={(e) =>
                      setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              className="mt-6 w-full bg-brand-600 text-white py-3 rounded-lg font-medium hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
            >
              Einspruch generieren <Brain className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 3: Generating */}
        {step === 'generating' && (
          <div className="text-center py-16">
            <Loader2 className="w-12 h-12 text-brand-600 animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-bold mb-2">
              Multi-KI-Analyse läuft...
            </h2>
            <p className="text-[var(--muted)]">{progress}</p>
            <div className="mt-8 max-w-xs mx-auto space-y-3">
              {[
                'Entwurf wird erstellt...',
                'Fehlerprüfung läuft...',
                'Finanzamt-Perspektive...',
                'Konsolidierung...',
              ].map((label, i) => (
                <div
                  key={label}
                  className="flex items-center gap-3 text-sm text-left"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      i <= 0 ? 'bg-brand-600 animate-pulse' : 'bg-gray-200'
                    }`}
                  />
                  <span
                    className={
                      i <= 0 ? 'text-brand-600 font-medium' : 'text-gray-400'
                    }
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Result */}
        {step === 'result' && result && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Einspruch fertig</h2>
                <p className="text-sm text-[var(--muted)]">
                  Geprüft durch {result.outputs?.length ?? 0} KI-Agenten
                </p>
              </div>
            </div>

            {/* Agent activity log */}
            <div className="bg-white rounded-lg border border-[var(--border)] p-4 mb-6">
              <h3 className="font-semibold text-sm mb-3">KI-Agenten-Protokoll</h3>
              <div className="space-y-2">
                {result.outputs?.map((o: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 ${
                        o.role === 'drafter'
                          ? 'bg-blue-500'
                          : o.role === 'reviewer'
                          ? 'bg-amber-500'
                          : o.role === 'adversary'
                          ? 'bg-red-500'
                          : 'bg-green-500'
                      }`}
                    />
                    <div>
                      <span className="font-medium capitalize">{o.role}</span>
                      <span className="text-[var(--muted)]">
                        {' '}
                        ({o.provider}/{o.model})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Final draft */}
            <div className="bg-white rounded-lg border border-[var(--border)] p-6">
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {result.finalDraft}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  const blob = new Blob([result.finalDraft], {
                    type: 'text/plain;charset=utf-8',
                  })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'Einspruch.txt'
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="flex-1 bg-brand-600 text-white py-3 rounded-lg font-medium hover:bg-brand-700 transition-colors text-center"
              >
                Herunterladen
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(result.finalDraft)}
                className="flex-1 border border-[var(--border)] py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center"
              >
                Kopieren
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
