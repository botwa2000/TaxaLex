import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
  iconRight?: React.ReactNode
  containerClassName?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, iconRight, id, containerClassName, className, ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--foreground)]">
            {label}
            {props.required && <span className="text-[var(--danger)] ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full bg-[var(--surface)] border rounded-xl px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'dark:focus:ring-brand-800 dark:focus:border-brand-600',
              error
                ? 'border-[var(--danger)] focus:ring-red-100 focus:border-[var(--danger)]'
                : 'border-[var(--border)] hover:border-[var(--border-strong)]',
              icon ? 'pl-9' : '',
              iconRight ? 'pr-9' : '',
              className
            )}
            {...props}
          />
          {iconRight && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none">
              {iconRight}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--muted)]">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
