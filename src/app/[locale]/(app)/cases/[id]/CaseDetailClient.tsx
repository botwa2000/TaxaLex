'use client'

import { useState } from 'react'
import { Copy, Download, Check, Send, Loader2, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface Props {
  caseId: string
  draft: string
  status: string
  docTypeLabel?: string | null
}

function sanitiseTopic(label: string): string {
  return label
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
    .replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue').replace(/ß/g, 'ss')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 30)
}

function appealFilename(caseId: string, ext: string, docTypeLabel?: string | null) {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const id = caseId.slice(-8).toUpperCase()
  const topic = docTypeLabel ? sanitiseTopic(docTypeLabel) : 'Einspruch'
  return `${date}_${topic}_${id}.${ext}`
}

export function CaseDetailClient({ caseId, draft, status, docTypeLabel }: Props) {
  const t = useTranslations('cases.detail')
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [downloadingDocx, setDownloadingDocx] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(draft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    const blob = new Blob([draft], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = appealFilename(caseId, 'txt', docTypeLabel)
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleDownloadDocx() {
    setDownloadingDocx(true)
    try {
      const { downloadAsDocx } = await import('@/lib/exportDocx')
      await downloadAsDocx(draft, appealFilename(caseId, 'docx', docTypeLabel))
    } finally {
      setDownloadingDocx(false)
    }
  }

  async function handleSubmit() {
    if (!confirm(t('submitConfirm'))) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit' }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        alert(t('submitError'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 text-sm border border-[var(--border)] px-3 py-1.5 rounded-lg hover:bg-[var(--background-subtle)] transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? t('copied') : t('copyDraft')}
      </button>
      <button
        onClick={handleDownload}
        className="flex items-center gap-1.5 text-sm border border-[var(--border)] text-[var(--foreground)] px-3 py-1.5 rounded-lg hover:bg-[var(--background-subtle)] transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        {t('downloadDraft')}
      </button>
      <button
        onClick={handleDownloadDocx}
        disabled={downloadingDocx}
        className="flex items-center gap-1.5 text-sm border border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-300 px-3 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950/30 disabled:opacity-50 transition-colors"
      >
        {downloadingDocx ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <FileText className="w-3.5 h-3.5" />
        )}
        {t('downloadWord')}
      </button>
      {status === 'DRAFT_READY' && (
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center gap-1.5 text-sm bg-brand-600 text-white px-3 py-1.5 rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          {submitting ? t('submitting') : t('submit')}
        </button>
      )}
    </div>
  )
}
