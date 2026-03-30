'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  size?: ModalSize
  className?: string
  children: React.ReactNode
  /** Prevent closing on backdrop click */
  persistent?: boolean
}

const sizes: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  className,
  children,
  persistent = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      if (!dialog.open) dialog.showModal()
    } else {
      if (dialog.open) dialog.close()
    }
  }, [open])

  // Sync dialog close event (ESC key) back to parent
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleClose = () => onClose()
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [onClose])

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (!persistent && e.target === dialogRef.current) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className={cn(
        'rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl p-0 w-full',
        'open:animate-scale-in',
        sizes[size],
        className
      )}
    >
      {/* Header */}
      {(title || true) && (
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-[var(--border)]">
          <div>
            {title && (
              <h2 className="text-base font-semibold text-[var(--foreground)]">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-[var(--muted)] mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 -mr-1 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Body */}
      <div className="px-6 py-5">{children}</div>
    </dialog>
  )
}

/** Convenience sub-component for modal footer with action buttons */
export function ModalFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('px-6 pb-6 flex items-center justify-end gap-2 -mt-2', className)}>
      {children}
    </div>
  )
}
