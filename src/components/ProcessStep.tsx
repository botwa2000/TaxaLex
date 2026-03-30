import { cn } from '@/lib/utils'

interface ProcessStepProps {
  step: number
  icon: React.ElementType
  title: string
  description: string
  detail?: string
  isLast?: boolean
  accent?: string
}

export function ProcessStep({
  step,
  icon: Icon,
  title,
  description,
  detail,
  isLast = false,
  accent = 'bg-brand-600',
}: ProcessStepProps) {
  return (
    <div className="flex gap-5">
      {/* Left: number + connector */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm shadow-sm',
            accent
          )}
        >
          {step}
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 mt-3 mb-0 bg-gradient-to-b from-[var(--border)] to-transparent" />
        )}
      </div>

      {/* Right: content */}
      <div className={cn('pb-8 min-w-0', isLast && 'pb-0')}>
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-4 h-4 text-[var(--muted)] shrink-0" />
          <h3 className="font-semibold text-[var(--foreground)]">{title}</h3>
        </div>
        <p className="text-sm text-[var(--muted)] leading-relaxed">{description}</p>
        {detail && (
          <p className="mt-2 text-xs text-[var(--muted-foreground)] bg-[var(--background-subtle)] rounded-lg px-3 py-2 leading-relaxed">
            {detail}
          </p>
        )}
      </div>
    </div>
  )
}
