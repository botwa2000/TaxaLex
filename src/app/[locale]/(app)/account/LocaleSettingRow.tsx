'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { locales, localeLabels, localeFlagCodes, type Locale } from '@/config/i18n'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export function LocaleSettingRow({ initialLocale }: { initialLocale: string }) {
  const t = useTranslations('account')
  const router = useRouter()
  const pathname = usePathname()
  const [current, setCurrent] = useState<Locale>((initialLocale as Locale) || 'de')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleChange(newLocale: Locale) {
    setOpen(false)
    setCurrent(newLocale)

    // Persist locale in a cookie that survives logout — next-intl reads this automatically
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`

    // Save preference to DB (fire-and-forget — navigation is the priority)
    fetch('/api/user/locale', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: newLocale }),
    }).catch(() => {})

    // Navigate to the same page in the new locale
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
  }

  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-[var(--muted)]">{t('languageLabel')}</span>
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--background-subtle)] hover:bg-[var(--border)] rounded-lg text-sm font-medium text-[var(--foreground)] transition-colors"
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <FlagImg code={localeFlagCodes[current]} label={localeLabels[current]} />
          <span>{localeLabels[current]}</span>
          <ChevronDown className={cn('w-3 h-3 text-[var(--muted)] transition-transform', open && 'rotate-180')} />
        </button>

        {open && (
          <div className="absolute top-full right-0 mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-lg p-1.5 z-50 min-w-[160px] max-h-72 overflow-y-auto">
            {locales.map((locale) => (
              <button
                key={locale}
                role="option"
                aria-selected={locale === current}
                onClick={() => handleChange(locale)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors text-left',
                  locale === current
                    ? 'bg-brand-50 text-brand-700 font-semibold dark:bg-brand-950 dark:text-brand-300'
                    : 'text-[var(--muted)] hover:bg-[var(--background-subtle)] hover:text-[var(--foreground)]'
                )}
              >
                <FlagImg code={localeFlagCodes[locale]} label={localeLabels[locale]} />
                <span>{localeLabels[locale]}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FlagImg({ code, label }: { code: string; label: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w20/${code}.png`}
      srcSet={`https://flagcdn.com/w40/${code}.png 2x`}
      width={20}
      height={15}
      alt={label}
      className="rounded-sm object-cover shrink-0"
    />
  )
}
