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
}: ProcessStepProps) {
  return (
    <div className="relative flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 pt-8 hover:shadow-md hover:border-brand-200 dark:hover:border-brand-800 transition-all group">
      {/* Step number badge */}
      <div className="absolute -top-3.5 left-6">
        <span className="inline-flex w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold items-center justify-center shadow-sm">
          {step}
        </span>
      </div>

      {/* Icon */}
      <div className="w-12 h-12 bg-brand-50 dark:bg-brand-950 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-brand-100 dark:group-hover:bg-brand-900 transition-colors shrink-0">
        <Icon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
      </div>

      <h3 className="text-base font-bold text-[var(--foreground)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--muted)] leading-relaxed flex-1">{description}</p>

      {detail && (
        <p className="mt-4 text-xs text-[var(--muted-foreground)] bg-[var(--background-subtle)] rounded-xl px-3 py-2.5 leading-relaxed">
          {detail}
        </p>
      )}
    </div>
  )
}
