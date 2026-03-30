import { defineRouting } from 'next-intl/routing'
import { locales, defaultLocale } from '@/config/i18n'

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Always show locale prefix in URL for SEO (/de/, /en/, /tr/, etc.)
  localePrefix: 'always',
})
