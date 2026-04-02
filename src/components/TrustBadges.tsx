import { Shield, Server, Lock, Scale } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { cn } from '@/lib/utils'

interface TrustBadgesProps {
  locale: string
  variant?: 'row' | 'grid'
  className?: string
}

export async function TrustBadges({ locale, variant = 'row', className }: TrustBadgesProps) {
  const t = await getTranslations({ locale, namespace: 'trust' })

  const badges = [
    { icon: Shield, label: t('gdpr'), detail: t('gdprDetail') },
    { icon: Server, label: t('euServers'), detail: t('euServersDetail') },
    { icon: Lock, label: t('encrypted'), detail: t('encryptedDetail') },
    { icon: Scale, label: t('rdgNote'), detail: t('rdgDetail') },
  ]

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
