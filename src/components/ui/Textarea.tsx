import React from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  resize?: 'none' | 'vertical' | 'both'
  containerClassName?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, resize = 'vertical', id, containerClassName, className, ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--foreground)]">
            {label}
            {props.required && <span className="text-[var(--danger)] ml-1">*</span>}
          </label>
        )}
        <textarea
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
            resize === 'none' ? 'resize-none' : resize === 'both' ? 'resize' : 'resize-y',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--muted)]">{hint}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
