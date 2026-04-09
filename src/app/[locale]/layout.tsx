import '@/app/globals.css'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { SessionProvider } from '@/components/SessionProvider'
import { ThemeProvider } from '@/components/ThemeProvider'
import { CookieConsent } from '@/components/CookieConsent'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import { PostHogProvider } from '@/components/PostHogProvider'
import { locales } from '@/config/i18n'
import { brand } from '@/config/brand'
import { auth } from '@/auth'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  title: brand.metaTitle,
  description: brand.metaDescription,
  metadataBase: new URL('https://taxalex.de'),
}

// RTL locales
const RTL_LOCALES = new Set(['ar'])

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const [{ locale }, session] = await Promise.all([params, auth()])
  setRequestLocale(locale)
  const messages = await getMessages()
  const isRtl = RTL_LOCALES.has(locale)

  // User's saved theme from DB (null for guests → falls back to localStorage/OS)
  const userTheme = (session?.user as { theme?: string } | undefined)?.theme ?? null
  const foucTheme = userTheme && userTheme !== 'system' ? JSON.stringify(userTheme) : 'null'

  return (
    <html
      lang={locale}
      dir={isRtl ? 'rtl' : 'ltr'}
      suppressHydrationWarning
    >
      <head>
        {/* Anti-FOUC: use DB theme for logged-in users, localStorage/OS for guests */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=${foucTheme}||localStorage.getItem('theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(_){}`,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        <SessionProvider session={session}>
          <NextIntlClientProvider messages={messages}>
            <ThemeProvider initialTheme={userTheme ?? undefined}>
              {children}
              <CookieConsent locale={locale} />
              <GoogleAnalytics />
              <PostHogProvider />
            </ThemeProvider>
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
