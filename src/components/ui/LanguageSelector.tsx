'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { locales, localeLabels, localeFlags, type Locale } from '@/config/i18n'
import { ChevronDown } from 'lucide-react'

interface LanguageSelectorProps {
  currentLocale: string
  variant?: 'select' | 'minimal'
  className?: string
}

export function LanguageSelector({ currentLocale, variant = 'select', className }: LanguageSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleChange(newLocale: string) {
    setOpen(false)
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
  }

  const current = currentLocale as Locale
  const flag = localeFlags[current] ?? '🌐'

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-1 flex-wrap', className)}>
        {locales.map((locale) => (
          <button
            key={locale}
            onClick={() => handleChange(locale)}
            title={localeLabels[locale]}
            className={cn(
              'text-xs px-1.5 py-0.5 rounded-md transition-colors',
              locale === currentLocale
                ? 'bg-brand-100 text-brand-700 font-medium dark:bg-brand-900 dark:text-brand-300'
                : 'text-[var(--muted)] hover:bg-[var(--background-subtle)]'
            )}
          >
            {localeFlags[locale]}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)] px-2 py-1.5 rounded-lg hover:bg-[var(--background-subtle)] transition-colors"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="text-base leading-none">{flag}</span>
        <span className="font-medium hidden sm:inline">{current.toUpperCase()}</span>
        <ChevronDown className={cn('w-3 h-3 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-lg p-1.5 z-50 min-w-[160px] max-h-72 overflow-y-auto scrollbar-thin animate-slide-down">
          {locales.map((locale) => (
            <button
              key={locale}
              role="option"
              aria-selected={locale === currentLocale}
              onClick={() => handleChange(locale)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors text-left',
                locale === currentLocale
                  ? 'bg-brand-50 text-brand-700 font-semibold dark:bg-brand-950 dark:text-brand-300'
                  : 'text-[var(--muted)] hover:bg-[var(--background-subtle)] hover:text-[var(--foreground)]'
              )}
            >
              <span className="text-base leading-none">{localeFlags[locale]}</span>
              <span>{localeLabels[locale]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
