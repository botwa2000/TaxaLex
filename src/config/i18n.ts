/**
 * i18n configuration — single source of truth for supported locales.
 *
 * UI language: what the interface is shown in (detected from browser, user-selectable)
 * Output language: what the generated legal letter is written in (default: German)
 *
 * These are independent — a Turkish user can read the UI in Turkish
 * while their Einspruch is always produced in German.
 */

export const locales = ['de', 'en', 'fr', 'it', 'es', 'pt', 'tr', 'ru', 'pl', 'ar', 'uk'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'de'

/**
 * Languages the final legal document can be produced in.
 * German is the only legally valid language for submission to German authorities,
 * but we allow others for review/export purposes.
 */
export const outputLanguages = [
  { code: 'de', label: 'Deutsch', note: 'Standard (Finanzamt-konform)' },
  { code: 'en', label: 'English', note: 'For review only' },
  { code: 'fr', label: 'Français', note: 'Pour révision seulement' },
  { code: 'it', label: 'Italiano', note: 'Solo per revisione' },
  { code: 'es', label: 'Español', note: 'Solo para revisión' },
  { code: 'pt', label: 'Português', note: 'Apenas para revisão' },
  { code: 'tr', label: 'Türkçe', note: 'Sadece inceleme için' },
  { code: 'ru', label: 'Русский', note: 'Только для проверки' },
  { code: 'pl', label: 'Polski', note: 'Tylko do przeglądu' },
  { code: 'ar', label: 'العربية', note: 'للمراجعة فقط' },
  { code: 'uk', label: 'Українська', note: 'Лише для перегляду' },
] as const

export type OutputLanguageCode = (typeof outputLanguages)[number]['code']

export const localeLabels: Record<Locale, string> = {
  de: 'Deutsch',
  en: 'English',
  fr: 'Français',
  it: 'Italiano',
  es: 'Español',
  pt: 'Português',
  tr: 'Türkçe',
  ru: 'Русский',
  pl: 'Polski',
  ar: 'العربية',
  uk: 'Українська',
}

/** ISO 3166-1 alpha-2 flag emoji for each UI locale */
export const localeFlags: Record<Locale, string> = {
  de: '🇩🇪',
  en: '🇬🇧',
  fr: '🇫🇷',
  it: '🇮🇹',
  es: '🇪🇸',
  pt: '🇵🇹',
  tr: '🇹🇷',
  ru: '🇷🇺',
  pl: '🇵🇱',
  ar: '🇸🇦',
  uk: '🇺🇦',
}

/** Resolve locale from Accept-Language header, falling back to default. */
export function resolveLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale
  const candidates = acceptLanguage
    .split(',')
    .map((s) => s.split(';')[0].trim().slice(0, 2).toLowerCase())
  return (candidates.find((c) => locales.includes(c as Locale)) as Locale) ?? defaultLocale
}

/** Human-readable language name for injection into AI system prompts. */
export const languageNames: Record<string, string> = {
  de: 'German',
  en: 'English',
  tr: 'Turkish',
  ru: 'Russian',
  pl: 'Polish',
  ar: 'Arabic',
  uk: 'Ukrainian',
  fr: 'French',
  es: 'Spanish',
  it: 'Italian',
  nl: 'Dutch',
  pt: 'Portuguese',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
}
