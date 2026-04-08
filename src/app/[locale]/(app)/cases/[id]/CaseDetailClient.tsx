'use client'

import { useState } from 'react'
import { Copy, Download, Check, Send, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface Props {
  caseId: string
  draft: string
  status: string
}

export function CaseDetailClient({ caseId, draft, status }: Props) {
  const t = useTranslations('cases.detail')
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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
    a.download = 'Einspruch.txt'
    a.click()
    URL.revokeObjectURL(url)
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
