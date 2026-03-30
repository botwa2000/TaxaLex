'use client'

import { useState, use, useCallback } from 'react'
import { notFound } from 'next/navigation'
import { PublicNav } from '@/components/PublicNav'
import { Footer } from '@/components/Footer'
import { Link } from '@/i18n/navigation'
import { templateContent } from '@/lib/templateContent'
import {
  ArrowLeft, Download, Copy, CheckCircle2, Edit3, Clock, Scale,
  Eye, Zap,
} from 'lucide-react'

export default function TemplatePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = use(params)
  const template = templateContent[id]

  if (!template) notFound()

  const isEN = locale === 'en'
  const title = isEN ? template.titleEN : template.titleDE
  const desc = isEN ? template.descEN : template.descDE

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(template.placeholders.map((p) => [p.key, '']))
  )
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form')

  const getFilledContent = useCallback(() => {
    let content = template.content
    for (const [key, value] of Object.entries(values)) {
      content = content.replaceAll(`[${key}]`, value || `[${key}]`)
    }
    return content
  }, [values, template.content])

  function handleDownload() {
    const content = getFilledContent()
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `TaxaLex-${id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(getFilledContent())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filledCount = template.placeholders.filter((p) => values[p.key]?.trim()).length
  const totalRequired = template.placeholders.filter((p) => p.required).length
  const progress = Math.round((filledCount / template.placeholders.length) * 100)

  return (
    <>
      <PublicNav locale={locale} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Back link */}
        <Link
          href="/vorlagen"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {isEN ? 'All templates' : 'Alle Vorlagen'}
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-start gap-3 mb-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] flex-1">{title}</h1>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs bg-[var(--background-subtle)] text-[var(--muted)] px-2.5 py-1 rounded-full font-medium">{template.law}</span>
              <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
                <Clock className="w-3.5 h-3.5 text-brand-500" />
                {isEN ? template.deadlineEN : template.deadlineDE}
              </span>
            </div>
          </div>
          <p className="text-[var(--muted)] leading-relaxed max-w-2xl">{desc}</p>
        </div>

        {/* Mobile tab toggle */}
        <div className="flex lg:hidden items-center gap-2 mb-6 bg-[var(--background-subtle)] rounded-xl p-1">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'form'
                ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-sm'
                : 'text-[var(--muted)]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 inline mr-1.5" />
            {isEN ? 'Fill in' : 'Ausfüllen'}
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'preview'
                ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-sm'
                : 'text-[var(--muted)]'
            }`}
          >
            <Eye className="w-3.5 h-3.5 inline mr-1.5" />
            {isEN ? 'Preview' : 'Vorschau'}
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Form */}
          <div className={activeTab === 'preview' ? 'hidden lg:block' : ''}>
            {/* Progress */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-2">
                <span>{isEN ? 'Fields completed' : 'Felder ausgefüllt'}: {filledCount}/{template.placeholders.length}</span>
                <span className={progress === 100 ? 'text-green-600 font-medium' : ''}>{progress}%</span>
              </div>
              <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progress === 100 ? 'bg-green-500' : 'bg-brand-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Placeholder fields */}
            <div className="space-y-4">
              {template.placeholders.map((p) => {
                const label = isEN ? p.labelEN : p.labelDE
                const placeholder = isEN ? (p.placeholderEN ?? '') : (p.placeholderDE ?? '')
                return (
                  <div key={p.key}>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                      {label}
                      {p.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {p.multiline ? (
                      <textarea
                        rows={4}
                        className="w-full border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm bg-[var(--surface)] text-[var(--foreground)] focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none resize-none transition-colors"
                        placeholder={placeholder}
                        value={values[p.key] ?? ''}
                        onChange={(e) => setValues((v) => ({ ...v, [p.key]: e.target.value }))}
                      />
                    ) : (
                      <input
                        type="text"
                        className="w-full border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm bg-[var(--surface)] text-[var(--foreground)] focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-colors"
                        placeholder={placeholder}
                        value={values[p.key] ?? ''}
                        onChange={(e) => setValues((v) => ({ ...v, [p.key]: e.target.value }))}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                <Download className="w-4 h-4" />
                {isEN ? 'Download (.txt)' : 'Herunterladen (.txt)'}
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 border border-[var(--border)] px-4 py-3 rounded-xl font-medium text-sm hover:bg-[var(--background-subtle)] transition-colors"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? (isEN ? 'Copied!' : 'Kopiert!') : (isEN ? 'Copy' : 'Kopieren')}
              </button>
            </div>

            {/* AI upsell */}
            <div className="mt-5 border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-950/40 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-brand-100 dark:bg-brand-900 rounded-xl flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-brand-800 dark:text-brand-300 mb-1">
                    {isEN ? 'Let AI personalise it for you' : 'KI füllt es automatisch aus'}
                  </p>
                  <p className="text-xs text-brand-700 dark:text-brand-400 mb-3 leading-relaxed">
                    {isEN
                      ? 'Upload your official notice — our AI analyses it and fills in all fields based on your actual document in seconds.'
                      : 'Laden Sie Ihren Bescheid hoch — unsere KI analysiert ihn und füllt alle Felder anhand Ihres echten Dokuments in Sekunden aus.'}
                  </p>
                  <Link
                    href={`/einspruch?type=${template.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {isEN ? 'Use AI to fill' : 'Mit KI ausfüllen'}
                  </Link>
                </div>
              </div>
            </div>

            {/* Legal note */}
            <p className="text-xs text-[var(--muted)] mt-4 leading-relaxed">
              <Scale className="w-3 h-3 inline mr-1" />
              {isEN
                ? 'This template is provided for informational purposes only. It does not constitute legal advice. Please review before submission.'
                : 'Diese Vorlage dient zur Information und ist kein Rechtsrat i.S.d. RDG. Bitte vor Einreichung prüfen.'}
            </p>
          </div>

          {/* Right: Live preview */}
          <div className={activeTab === 'form' ? 'hidden lg:block' : ''}>
            <div className="sticky top-20">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  {isEN ? 'Live preview' : 'Echtzeit-Vorschau'}
                </p>
                <span className="text-xs text-[var(--muted)]">
                  {isEN ? 'Updates as you type' : 'Aktualisiert beim Tippen'}
                </span>
              </div>
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--background-subtle)]">
                  <div className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400/60" />
                      <div className="w-3 h-3 rounded-full bg-amber-400/60" />
                      <div className="w-3 h-3 rounded-full bg-green-400/60" />
                    </div>
                    <span className="ml-1 text-xs text-[var(--muted)]">{id}.txt</span>
                  </div>
                  <span className="text-xs text-[var(--muted)]">
                    {isEN ? 'Editable draft' : 'Bearbeitbarer Entwurf'}
                  </span>
                </div>
                <pre className="p-5 text-xs text-[var(--foreground)] leading-relaxed whitespace-pre-wrap font-mono max-h-[520px] overflow-y-auto scrollbar-thin">
                  {getFilledContent()}
                </pre>
              </div>

              {/* Missing fields warning */}
              {filledCount < totalRequired && (
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-2.5 rounded-xl">
                  <span className="font-medium">
                    {totalRequired - filledCount} {isEN ? 'required field(s) still empty' : 'Pflichtfeld(er) noch leer'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer locale={locale} />
    </>
  )
}
