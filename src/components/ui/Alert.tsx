'use client'

import { X, AlertTriangle, CheckCircle2, Info, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type AlertVariant = 'error' | 'warning' | 'info' | 'success'

interface AlertProps {
  variant: AlertVariant
  title?: string
  children: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}

const config: Record<AlertVariant, { icon: React.ElementType; classes: string }> = {
  error: {
    icon: AlertCircle,
    classes: 'bg-[var(--danger-bg)] border-[var(--danger)] text-[var(--danger)]',
  },
  warning: {
    icon: AlertTriangle,
    classes: 'bg-[var(--warning-bg)] border-amber-300 text-amber-800 dark:border-amber-700 dark:text-amber-400',
  },
  info: {
    icon: Info,
    classes: 'bg-[var(--info-bg)] border-[var(--info)] text-[var(--info)]',
  },
  success: {
    icon: CheckCircle2,
    classes: 'bg-[var(--success-bg)] border-[var(--success)] text-[var(--success)]',
  },
}

export function Alert({ variant, title, children, dismissible, onDismiss, className }: AlertProps) {
  const { icon: Icon, classes } = config[variant]

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 border rounded-xl px-4 py-3 text-sm',
        classes,
        className
      )}
    >
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div className="leading-relaxed opacity-90">{children}</div>
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
