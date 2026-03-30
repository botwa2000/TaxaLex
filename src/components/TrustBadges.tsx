import { Shield, Server, Lock, Scale } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrustBadgesProps {
  locale?: string
  variant?: 'row' | 'grid'
  className?: string
}

const BADGES_DE = [
  { icon: Shield, label: 'DSGVO-konform', detail: 'Daten in der EU' },
  { icon: Server, label: 'EU-Server', detail: 'Hetzner, Deutschland' },
  { icon: Lock, label: 'Verschlüsselt', detail: 'TLS 1.3 + AES-256' },
  { icon: Scale, label: 'Kein Rechtsrat', detail: 'i.S.d. RDG' },
]

const BADGES_EN = [
  { icon: Shield, label: 'GDPR-compliant', detail: 'Data in the EU' },
  { icon: Server, label: 'EU servers', detail: 'Hetzner, Germany' },
  { icon: Lock, label: 'Encrypted', detail: 'TLS 1.3 + AES-256' },
  { icon: Scale, label: 'Not legal advice', detail: 'AI-generated draft' },
]

export function TrustBadges({ locale = 'de', variant = 'row', className }: TrustBadgesProps) {
  const badges = locale === 'en' ? BADGES_EN : BADGES_DE

  return (
    <div
      className={cn(
        variant === 'row'
          ? 'flex flex-wrap items-center justify-center gap-4'
          : 'grid grid-cols-2 gap-3',
        className
      )}
    >
      {badges.map(({ icon: Icon, label, detail }) => (
        <div key={label} className="flex items-center gap-2.5 text-[var(--muted)]">
          <div className="w-8 h-8 bg-[var(--background-subtle)] rounded-xl flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-brand-600" />
          </div>
          <div>
            <span className="text-sm font-semibold text-[var(--foreground)]">{label}</span>
            <span className="text-xs text-[var(--muted)] ml-1.5 hidden sm:inline">· {detail}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
