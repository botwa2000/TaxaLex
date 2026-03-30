'use client'

import { useState } from 'react'
import { ChevronDown, Clock, Scale, TrendingUp, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from './ui/Badge'
import type { UseCaseData } from '@/lib/contentFallbacks'
import { Link } from '@/i18n/navigation'

interface UseCaseCardProps {
  useCase: UseCaseData
  locale: string
}

export function UseCaseCard({ useCase, locale }: UseCaseCardProps) {
  const [open, setOpen] = useState(false)
  const isEN = locale === 'en'

  return (
    <div className="border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--surface)] hover:border-[var(--border-strong)] transition-colors">
      {/* Compact header — always visible */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-[var(--surface-hover)] transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-[var(--foreground)]">{useCase.title}</span>
            {useCase.badge && (
              <Badge variant="brand" size="sm">{useCase.badge}</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-[var(--muted)] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {useCase.deadlineText}
            </span>
            <span className="text-xs text-[var(--muted)]">{useCase.legalBasis}</span>
            {useCase.successRate && (
              <span className="text-xs text-[var(--success)] flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {useCase.successRate}
              </span>
            )}
          </div>
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-[var(--muted)] shrink-0 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      {/* Expandable details */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          open ? 'max-h-96' : 'max-h-0'
        )}
      >
        <div className="px-4 pb-4 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--muted)] leading-relaxed mt-4 mb-4">
            {useCase.description}
          </p>

          {/* Key facts */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            <div className="bg-[var(--background-subtle)] rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-brand-600" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  {isEN ? 'Deadline' : 'Frist'}
                </span>
              </div>
              <p className="text-sm font-semibold text-[var(--foreground)]">{useCase.deadlineDays} {isEN ? 'days' : 'Tage'}</p>
              <p className="text-[11px] text-[var(--muted)]">{useCase.deadlineText}</p>
            </div>
            <div className="bg-[var(--background-subtle)] rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Scale className="w-3.5 h-3.5 text-brand-600" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  {isEN ? 'Legal basis' : 'Rechtsgrundlage'}
                </span>
              </div>
              <p className="text-sm font-semibold text-[var(--foreground)]">{useCase.legalBasis}</p>
            </div>
            {useCase.successRate && (
              <div className="bg-[var(--background-subtle)] rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-[var(--success)]" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    {isEN ? 'Success rate' : 'Erfolgsquote'}
                  </span>
                </div>
                <p className="text-sm font-semibold text-[var(--success)]">{useCase.successRate}</p>
                <p className="text-[11px] text-[var(--muted)]">
                  {isEN ? 'partial / full success' : 'teilw. / vollständig'}
                </p>
              </div>
            )}
          </div>

          {/* CTA */}
          <Link
            href={`/einspruch?type=${useCase.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            {isEN ? 'Start objection' : 'Einspruch starten'}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
