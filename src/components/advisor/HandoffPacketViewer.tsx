'use client'

import { useState } from 'react'
import { ViabilityBadge } from '@/components/advisor/ViabilityBadge'
import { CalendarDays, Euro, FileText, User, BarChart2, ChevronDown, ChevronRight } from 'lucide-react'
import type { HandoffPacketData, PacketSection } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  packet: HandoffPacketData
  activeSection: PacketSection | null
  activeParagraphIndex: number | null
  onSectionSelect: (section: PacketSection, paragraphIndex: number | null) => void
}

export function HandoffPacketViewer({
  packet,
  activeSection,
  activeParagraphIndex,
  onSectionSelect,
}: Props) {
  const [expandedSections, setExpandedSections] = useState<Set<PacketSection>>(
    new Set(['BRIEF', 'FACTS', 'ANALYSIS', 'DRAFT', 'CLIENT_CONTEXT'])
  )

  const toggleSection = (section: PacketSection) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) next.delete(section)
      else next.add(section)
      return next
    })
  }

  const isActive = (section: PacketSection, idx?: number | null) =>
    activeSection === section && (idx == null || activeParagraphIndex === idx)

  const { extractedFacts: facts, analysisSummary: analysis } = packet

  const deadlineDate = facts.deadline ? new Date(facts.deadline) : null
  const daysLeft = deadlineDate
    ? Math.ceil((deadlineDate.getTime() - Date.now()) / 86400000)
    : null

  return (
    <div className="flex flex-col gap-4">
      {/* ── BRIEF ── */}
      <Section
        id="BRIEF"
        label="Fallzusammenfassung"
        icon={<FileText size={15} />}
        expanded={expandedSections.has('BRIEF')}
        active={isActive('BRIEF')}
        onToggle={() => toggleSection('BRIEF')}
        onSelect={() => onSectionSelect('BRIEF', null)}
      >
        <div className="rounded-lg bg-[var(--background-subtle)] p-4 flex flex-col gap-3">
          <p className="text-base font-semibold text-[var(--foreground)]">{packet.briefSummary}</p>

          <div className="flex items-center flex-wrap gap-3 text-sm text-[var(--muted)]">
            {analysis.viabilityScore && (
              <ViabilityBadge score={analysis.viabilityScore} summary={analysis.viabilitySummary} />
            )}
            {facts.amountDisputed > 0 && (
              <span className="flex items-center gap-1">
                <Euro size={13} />
                {facts.amountDisputed.toLocaleString('de-DE')} strittig
              </span>
            )}
            {deadlineDate && (
              <span className={`flex items-center gap-1 ${daysLeft !== null && daysLeft <= 7 ? 'text-red-600 dark:text-red-400 font-semibold' : ''}`}>
                <CalendarDays size={13} />
                {daysLeft !== null
                  ? `Frist in ${daysLeft} Tag${daysLeft === 1 ? '' : 'en'}`
                  : deadlineDate.toLocaleDateString('de-DE')}
              </span>
            )}
          </div>
        </div>
      </Section>

      {/* ── FACTS ── */}
      <Section
        id="FACTS"
        label="Sachverhalt"
        icon={<User size={15} />}
        expanded={expandedSections.has('FACTS')}
        active={isActive('FACTS')}
        onToggle={() => toggleSection('FACTS')}
        onSelect={() => onSectionSelect('FACTS', null)}
      >
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {[
            ['Finanzamt', facts.finanzamt],
            ['Steuernummer', facts.steuernummer],
            ['Steuerart', facts.steuerart],
            ['Bescheid-Datum', facts.bescheidDatum],
            ['Streitiger Betrag', facts.amountDisputed > 0 ? `€${facts.amountDisputed.toLocaleString('de-DE')}` : '—'],
            ['Gesamtnachzahlung', facts.amountTotal > 0 ? `€${facts.amountTotal.toLocaleString('de-DE')}` : '—'],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-[var(--muted)] text-xs">{label}</dt>
              <dd className="font-medium text-[var(--foreground)]">{value || '—'}</dd>
            </div>
          ))}
          {facts.paragraphsCited.length > 0 && (
            <div className="col-span-2">
              <dt className="text-[var(--muted)] text-xs">Zitierte Paragraphen</dt>
              <dd className="font-medium text-[var(--foreground)]">{facts.paragraphsCited.join(', ')}</dd>
            </div>
          )}
        </dl>
      </Section>

      {/* ── ANALYSIS ── */}
      <Section
        id="ANALYSIS"
        label="KI-Analyse"
        icon={<BarChart2 size={15} />}
        expanded={expandedSections.has('ANALYSIS')}
        active={isActive('ANALYSIS')}
        onToggle={() => toggleSection('ANALYSIS')}
        onSelect={() => onSectionSelect('ANALYSIS', null)}
      >
        <div className="flex flex-col gap-4">
          <div>
            <h4 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-1">Kernargument</h4>
            <p className="text-sm text-[var(--foreground)]">{analysis.coreArgument}</p>
          </div>
          {analysis.evidenceGaps.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-1">Beweislücken</h4>
              <ul className="list-disc list-inside space-y-1">
                {analysis.evidenceGaps.map((gap, i) => (
                  <li key={i} className="text-sm text-[var(--foreground)]">{gap}</li>
                ))}
              </ul>
            </div>
          )}
          {analysis.counterarguments.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-1">Gegenargumente (FA-Perspektive)</h4>
              <ul className="list-disc list-inside space-y-1">
                {analysis.counterarguments.map((ca, i) => (
                  <li key={i} className="text-sm text-amber-700 dark:text-amber-400">{ca}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>

      {/* ── DRAFT ── */}
      <Section
        id="DRAFT"
        label="Einspruchsentwurf"
        icon={<FileText size={15} />}
        expanded={expandedSections.has('DRAFT')}
        active={isActive('DRAFT')}
        onToggle={() => toggleSection('DRAFT')}
        onSelect={() => onSectionSelect('DRAFT', null)}
      >
        <div className="flex flex-col gap-1">
          {packet.draftContent.split('\n\n').map((paragraph, idx) => (
            paragraph.trim() && (
              <p
                key={idx}
                onClick={() => onSectionSelect('DRAFT', idx)}
                className={cn(
                  'text-sm text-[var(--foreground)] leading-relaxed p-2 rounded cursor-pointer hover:bg-[var(--background-subtle)] transition-colors',
                  isActive('DRAFT', idx) && 'bg-brand-50 dark:bg-brand-950 ring-1 ring-brand-300 dark:ring-brand-700'
                )}
              >
                {paragraph}
              </p>
            )
          ))}
        </div>
      </Section>

      {/* ── CLIENT CONTEXT ── */}
      <Section
        id="CLIENT_CONTEXT"
        label="Mandantenangaben"
        icon={<User size={15} />}
        expanded={expandedSections.has('CLIENT_CONTEXT')}
        active={isActive('CLIENT_CONTEXT')}
        onToggle={() => toggleSection('CLIENT_CONTEXT')}
        onSelect={() => onSectionSelect('CLIENT_CONTEXT', null)}
      >
        <div className="flex flex-col gap-3">
          {packet.clientContext.clientNotes && (
            <div>
              <h4 className="text-xs font-semibold text-[var(--muted)] mb-1">Hinweise des Mandanten</h4>
              <p className="text-sm text-[var(--foreground)]">{packet.clientContext.clientNotes}</p>
            </div>
          )}
          {Object.keys(packet.clientContext.userAnswers).length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-[var(--muted)] mb-1">Antworten auf Rückfragen</h4>
              <dl className="flex flex-col gap-2">
                {Object.entries(packet.clientContext.userAnswers).map(([q, a]) => (
                  <div key={q}>
                    <dt className="text-xs text-[var(--muted)]">{q}</dt>
                    <dd className="text-sm text-[var(--foreground)]">{a}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {packet.documents.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-[var(--muted)] mb-1">Beigefügte Dokumente ({packet.documents.length})</h4>
              <ul className="flex flex-col gap-1">
                {packet.documents.map(d => (
                  <li key={d.id} className="text-sm text-[var(--foreground)] flex items-center gap-2">
                    <FileText size={12} className="text-[var(--muted)]" />
                    {d.name}
                    <span className="text-xs text-[var(--muted)]">({d.type})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────

interface SectionProps {
  id: PacketSection
  label: string
  icon: React.ReactNode
  expanded: boolean
  active: boolean
  onToggle: () => void
  onSelect: () => void
  children: React.ReactNode
}

function Section({ label, icon, expanded, active, onToggle, onSelect, children }: SectionProps) {
  return (
    <div className={cn(
      'rounded-xl border transition-colors',
      active
        ? 'border-brand-300 dark:border-brand-700'
        : 'border-[var(--border)]'
    )}>
      <button
        type="button"
        onClick={() => { onToggle(); onSelect() }}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--background-subtle)] transition-colors rounded-xl"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
          <span className="text-brand-500">{icon}</span>
          {label}
        </span>
        {expanded ? <ChevronDown size={15} className="text-[var(--muted)]" /> : <ChevronRight size={15} className="text-[var(--muted)]" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  )
}
