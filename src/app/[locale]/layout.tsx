import '@/app/globals.css'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { ThemeProvider } from '@/components/ThemeProvider'
import { CookieConsent } from '@/components/CookieConsent'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import { PostHogProvider } from '@/components/PostHogProvider'
import { locales } from '@/config/i18n'
import { brand } from '@/config/brand'

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
  const { locale } = await params
  const messages = await getMessages()
  const isRtl = RTL_LOCALES.has(locale)

  return (
    <html
      lang={locale}
      dir={isRtl ? 'rtl' : 'ltr'}
      suppressHydrationWarning
    >
      <head>
        {/* Anti-FOUC: read stored theme preference before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(_){}`,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            {children}
            <CookieConsent locale={locale} />
            <GoogleAnalytics />
            <PostHogProvider />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
