import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'brand' | 'outline'
type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
  children: React.ReactNode
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-[var(--background-subtle)] text-[var(--muted)] dark:bg-slate-800 dark:text-slate-300',
  success: 'bg-[var(--success-bg)] text-[var(--success)] dark:bg-emerald-950 dark:text-emerald-400',
  warning: 'bg-[var(--warning-bg)] text-[var(--warning)] dark:bg-amber-950 dark:text-amber-400',
  danger:  'bg-[var(--danger-bg)] text-[var(--danger)] dark:bg-red-950 dark:text-red-400',
  info:    'bg-[var(--info-bg)] text-[var(--info)] dark:bg-sky-950 dark:text-sky-400',
  brand:   'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
  outline: 'border border-[var(--border)] text-[var(--muted)] bg-transparent',
}

const sizes: Record<BadgeSize, string> = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
}

export function Badge({ variant = 'default', size = 'md', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full whitespace-nowrap',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  )
}
