import { cn } from '@/lib/utils'

interface StatCardProps {
  value: string | number
  label: string
  icon?: React.ElementType
  source?: string
  sourceUrl?: string
  iconClassName?: string
  urgent?: boolean
  className?: string
}

export function StatCard({
  value,
  label,
  icon: Icon,
  source,
  sourceUrl,
  iconClassName,
  urgent,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6',
        urgent && 'border-amber-300 dark:border-amber-700',
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center mb-4',
            urgent
              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
              : 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400',
            iconClassName
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      )}

      <p
        className={cn(
          'text-4xl sm:text-5xl font-black leading-none mb-2',
          urgent ? 'text-amber-600 dark:text-amber-400' : 'text-[var(--foreground)]'
        )}
      >
        {value}
      </p>

      <p className="text-sm text-[var(--muted)] leading-snug">{label}</p>

      {source && (
        <p className="text-xs text-[var(--muted-foreground)] mt-3 leading-tight">
          {sourceUrl ? (
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
              Quelle: {source}
            </a>
          ) : (
            <>Quelle: {source}</>
          )}
        </p>
      )}
    </div>
  )
}
