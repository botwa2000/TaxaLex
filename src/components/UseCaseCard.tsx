'use client'

import { useState } from 'react'
import { Clock, Scale, TrendingUp, ArrowRight, X, FileText, Users, AlarmClock, AlertTriangle, Shield, Briefcase, Home, MapPin, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from './ui/Badge'
import type { UseCaseData } from '@/lib/contentFallbacks'
import { Link } from '@/i18n/navigation'

const ICON_MAP: Record<string, React.ElementType> = {
  FileText, Users, Clock: AlarmClock, AlertTriangle, Shield, Briefcase, Home, MapPin,
}

interface UseCaseCardProps {
  useCase: UseCaseData
  locale: string
}

export function UseCaseCard({ useCase, locale }: UseCaseCardProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const isEN = locale === 'en'
  const Icon = ICON_MAP[useCase.icon ?? 'FileText'] ?? FileText

  return (
    <>
      {/* Card — fixed height, no layout shift */}
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={cn(
          'group w-full text-left bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5',
          'hover:border-brand-300 hover:shadow-brand transition-all duration-200',
          'flex flex-col gap-3'
        )}
      >
        {/* Icon + title row */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-brand-50 dark:bg-brand-950 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-brand-100 dark:group-hover:bg-brand-900 transition-colors">
            <Icon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[var(--foreground)]">{useCase.title}</span>
              {useCase.badge && (
                <Badge variant="brand" size="sm">{useCase.badge}</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Short description */}
        <p className="text-sm text-[var(--muted)] leading-relaxed line-clamp-2">{useCase.shortDesc}</p>

        {/* Stats row */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-[var(--muted)] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-brand-500" />
            {useCase.deadlineText}
          </span>
          <span className="text-xs text-[var(--muted)] flex items-center gap-1">
            <Scale className="w-3.5 h-3.5 text-brand-500" />
            {useCase.legalBasis}
          </span>
          {useCase.successRate && (
            <span className="text-xs text-[var(--success)] flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              {useCase.successRate}
            </span>
          )}
        </div>

        {/* CTA hint */}
        <div className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 font-medium mt-auto">
          {isEN ? 'View details' : 'Details ansehen'}
          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
        </div>
      </button>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}
        >
          <div className="bg-[var(--surface)] rounded-3xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin animate-slide-up">
            {/* Modal header */}
            <div className="sticky top-0 bg-[var(--surface)] border-b border-[var(--border)] px-6 py-4 flex items-center gap-3 rounded-t-3xl">
              <div className="w-10 h-10 bg-brand-50 dark:bg-brand-950 rounded-xl flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-bold text-lg text-[var(--foreground)]">{useCase.title}</h2>
                  {useCase.badge && <Badge variant="brand" size="sm">{useCase.badge}</Badge>}
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)] rounded-xl transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-5">
              {/* Full description */}
              <p className="text-[var(--muted)] leading-relaxed">{useCase.description}</p>

              {/* Key facts grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[var(--background-subtle)] rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Clock className="w-4 h-4 text-brand-600" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                      {isEN ? 'Deadline' : 'Frist'}
                    </span>
                  </div>
                  <p className="text-base font-bold text-[var(--foreground)]">{useCase.deadlineDays} {isEN ? 'd.' : 'T.'}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{useCase.deadlineText}</p>
                </div>

                <div className="bg-[var(--background-subtle)] rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Scale className="w-4 h-4 text-brand-600" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                      {isEN ? 'Law' : 'Gesetz'}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[var(--foreground)]">{useCase.legalBasis}</p>
                </div>

                {useCase.successRate ? (
                  <div className="bg-[var(--success-bg)] rounded-2xl p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <TrendingUp className="w-4 h-4 text-[var(--success)]" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--success)]">
                        {isEN ? 'Success' : 'Erfolg'}
                      </span>
                    </div>
                    <p className="text-base font-bold text-[var(--success)]">{useCase.successRate}</p>
                    <p className="text-xs text-[var(--success)] opacity-80 mt-0.5">
                      {isEN ? 'partial/full' : 'teilw./voll'}
                    </p>
                  </div>
                ) : (
                  <div className="bg-[var(--background-subtle)] rounded-2xl p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <ExternalLink className="w-4 h-4 text-brand-600" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                        {isEN ? 'Type' : 'Art'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-[var(--foreground)]">
                      {isEN ? 'Objection' : 'Widerspruch'}
                    </p>
                  </div>
                )}
              </div>

              {/* What TaxaLex does for this case */}
              <div className="bg-brand-50 dark:bg-brand-950/50 rounded-2xl p-4">
                <h3 className="font-semibold text-[var(--foreground)] mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-brand-600" />
                  {isEN ? 'How TaxaLex helps' : 'So hilft TaxaLex'}
                </h3>
                <ul className="space-y-1.5 text-sm text-[var(--muted)]">
                  <li className="flex items-start gap-2">
                    <span className="text-brand-500 mt-0.5">✓</span>
                    {isEN ? 'Reads and analyses your notice automatically' : 'Liest und analysiert Ihren Bescheid automatisch'}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-500 mt-0.5">✓</span>
                    {isEN ? 'Identifies objection grounds based on current case law' : 'Identifiziert Einspruchsgründe nach aktuellem Recht'}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-500 mt-0.5">✓</span>
                    {isEN ? 'Drafts a formal German letter ready to send' : 'Erstellt ein formal korrektes deutsches Schreiben'}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-500 mt-0.5">✓</span>
                    {isEN ? `Meets the ${useCase.deadlineDays}-day deadline requirement` : `Berücksichtigt die ${useCase.deadlineDays}-Tage-Frist`}
                  </li>
                </ul>
              </div>

              {/* CTA */}
              <Link
                href={`/einspruch?type=${useCase.slug}`}
                onClick={() => setModalOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3.5 rounded-2xl transition-colors"
              >
                {isEN ? 'Start objection now' : 'Einspruch jetzt starten'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
