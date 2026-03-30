'use client'

import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { locales, localeLabels, type Locale } from '@/config/i18n'

const localeFlags: Record<Locale, string> = {
  de: '🇩🇪',
  en: '🇬🇧',
  tr: '🇹🇷',
  ru: '🇷🇺',
  pl: '🇵🇱',
  ar: '🇸🇦',
  uk: '🇺🇦',
}

interface LanguageSelectorProps {
  currentLocale: string
  variant?: 'select' | 'minimal'
  className?: string
}

export function LanguageSelector({ currentLocale, variant = 'select', className }: LanguageSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()

  function handleChange(newLocale: string) {
    // Replace the locale segment in the current path
    const segments = pathname.split('/')
    // segments[0] = '' (before first /), segments[1] = current locale
    segments[1] = newLocale
    const newPath = segments.join('/')
    router.push(newPath)
  }

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {locales.map((locale) => (
          <button
            key={locale}
            onClick={() => handleChange(locale)}
            title={localeLabels[locale]}
            className={cn(
              'text-xs px-2 py-1 rounded-md transition-colors',
              locale === currentLocale
                ? 'bg-brand-100 text-brand-700 font-medium dark:bg-brand-900 dark:text-brand-300'
                : 'text-[var(--muted)] hover:bg-[var(--background-subtle)]'
            )}
          >
            {locale.toUpperCase()}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <select
        value={currentLocale}
        onChange={(e) => handleChange(e.target.value)}
        aria-label="Select language"
        className="appearance-none bg-transparent text-sm text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer focus:outline-none pr-1 transition-colors"
      >
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {localeFlags[locale]} {localeLabels[locale]}
          </option>
        ))}
      </select>
    </div>
  )
}
