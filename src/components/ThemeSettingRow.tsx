'use client'

import { useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTranslations } from 'next-intl'

type ThemeValue = 'light' | 'dark' | 'system'

export function ThemeSettingRow({ initialTheme }: { initialTheme: string }) {
  const t = useTranslations('account.theme')
  const [current, setCurrent] = useState<ThemeValue>((initialTheme as ThemeValue) || 'system')

  const THEMES: { value: ThemeValue; label: string; icon: React.ElementType }[] = [
    { value: 'light',  label: t('light'),  icon: Sun     },
    { value: 'dark',   label: t('dark'),   icon: Moon    },
    { value: 'system', label: t('system'), icon: Monitor },
  ]

  async function handleChange(theme: ThemeValue) {
    setCurrent(theme)

    const resolved: 'dark' | 'light' =
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        : theme

    document.documentElement.classList.toggle('dark', resolved === 'dark')
    localStorage.setItem('theme', resolved)

    await fetch('/api/user/theme', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ theme }),
    })
  }

  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-[var(--muted)]">{t('label')}</span>
      <div className="flex items-center gap-0.5 bg-[var(--background-subtle)] rounded-lg p-0.5">
        {THEMES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => handleChange(value)}
            title={label}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              current === value
                ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-sm'
                : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            <Icon className="w-3 h-3" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
