import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'
import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'
import { NextResponse, type NextRequest } from 'next/server'
import { locales } from '@/config/i18n'

const handleI18nRouting = createMiddleware(routing)
const { auth } = NextAuth(authConfig)

// Protected paths (without locale prefix) — unauthenticated users get redirected to login
// Note: /advisor (root) is a public landing page — only /advisor/* sub-routes are protected
const PROTECTED = ['/dashboard', '/cases', '/account', '/billing', '/admin', '/advisor/dashboard', '/advisor/clients', '/advisor/appeals', '/advisor/billing']

// Auth-only paths — authenticated users get redirected to dashboard
const AUTH_ONLY = ['/login', '/register']

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth

  // Extract locale from path (e.g. /de/dashboard → de)
  const localeMatch = pathname.match(/^\/(de|en|fr|it|es|pt|tr|ru|pl|ar|uk)(\/|$)/)
  const locale = localeMatch ? localeMatch[1] : 'de'

  // Normalise: "/de/dashboard" → "/dashboard", "/de/" or "/de" → "/"
  const cleanPath = localeMatch
    ? pathname.slice(locale.length + 1) || '/'
    : pathname

  // Redirect authenticated users away from auth-only pages
  // Use the user's saved locale preference if available, otherwise fall back to URL locale
  if (isAuthenticated && AUTH_ONLY.some((p) => cleanPath === p)) {
    const savedLocale = (req.auth as { user?: { locale?: string } } | null)?.user?.locale
    const targetLocale = savedLocale && locales.includes(savedLocale as (typeof locales)[number]) ? savedLocale : locale
    return NextResponse.redirect(new URL(`/${targetLocale}/dashboard`, req.url))
  }

  // Redirect unauthenticated users away from protected pages
  if (!isAuthenticated && PROTECTED.some((p) => cleanPath === p || cleanPath.startsWith(p + '/'))) {
    const loginUrl = new URL(`/${locale}/login`, req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based gates (ADVISOR/LAWYER only for /advisor, ADMIN only for /admin)
  const role = (req.auth as { user?: { role?: string } } | null)?.user?.role
  if (cleanPath.startsWith('/advisor/') && role && !['ADVISOR', 'LAWYER', 'EXPERT', 'ADMIN'].includes(role)) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url))
  }
  if (cleanPath.startsWith('/admin') && role && role !== 'ADMIN') {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url))
  }

  // Let next-intl handle locale routing (prefix redirect, locale cookie, etc.)
  return handleI18nRouting(req as NextRequest)
})

export const config = {
  // Match all paths except Next.js internals, static files, and API routes
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf)).*)',
  ],
}
