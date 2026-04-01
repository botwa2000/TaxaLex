'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from './Logo'
import { Button } from './ui/Button'
import { LanguageSelector } from './ui/LanguageSelector'
import { Link, usePathname } from '@/i18n/navigation'

interface PublicNavProps {
  locale: string
  userGroup?: string
}

export function PublicNav({ locale, userGroup }: PublicNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [useCaseDropOpen, setUseCaseDropOpen] = useState(false)
  const pathname = usePathname()
  const isEN = locale === 'en'
  const { data: session, status } = useSession()
  const isLoggedIn = status === 'authenticated' && !!session?.user

  const navLinks = [
    {
      label: isEN ? 'How it works' : 'Wie es funktioniert',
      href: '/wie-es-funktioniert',
    },
    {
      label: isEN ? 'Use cases' : 'Anwendungsfälle',
      href: null,
      dropdown: true,
    },
    {
      label: isEN ? 'Templates' : 'Vorlagen',
      href: '/vorlagen',
    },
    {
      label: isEN ? 'Pricing' : 'Preise',
      href: '/preise',
    },
    {
      label: isEN ? 'For advisors' : 'Für Steuerberater',
      href: '/advisor',
    },
  ]

  const useCaseLinks = [
    { label: isEN ? '→ All use cases' : '→ Alle Anwendungsfälle', href: '/anwendungsfaelle', highlight: true },
    { label: isEN ? 'Tax assessment' : 'Steuerbescheid', href: '/anwendungsfaelle#tax' },
    { label: isEN ? 'Jobcenter / Bürgergeld' : 'Jobcenter / Bürgergeld', href: '/anwendungsfaelle#jobcenter' },
    { label: isEN ? 'Pension notice' : 'Rentenbescheid', href: '/anwendungsfaelle#rente' },
    { label: isEN ? 'Fine / penalty' : 'Bußgeldbescheid', href: '/anwendungsfaelle#bussgeld' },
    { label: isEN ? 'Health insurance' : 'Krankenversicherung', href: '/anwendungsfaelle#krankenversicherung' },
    { label: isEN ? 'Dismissal notice' : 'Kündigung', href: '/anwendungsfaelle#kuendigung' },
    { label: isEN ? 'Rent increase' : 'Mieterhöhung', href: '/anwendungsfaelle#miete' },
    { label: isEN ? 'Property tax' : 'Grundsteuer', href: '/anwendungsfaelle#grundsteuer' },
  ]

  const ctaLabel = userGroup === 'advisor'
    ? (isEN ? 'Advisor demo' : 'Berater-Demo')
    : (isEN ? 'Start for free' : 'Kostenlos starten')

  return (
    <header className="sticky top-0 z-40 bg-[var(--surface)]/90 backdrop-blur-md border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Logo size="md" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) =>
            link.dropdown ? (
              <div key={link.label} className="relative">
                <button
                  onClick={() => setUseCaseDropOpen(!useCaseDropOpen)}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--background-subtle)] transition-colors"
                >
                  {link.label}
                  <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', useCaseDropOpen && 'rotate-180')} />
                </button>
                {useCaseDropOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUseCaseDropOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-1 w-56 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-lg p-1.5 z-20 animate-slide-down">
                      {useCaseLinks.map((uc, i) => (
                        <Link
                          key={uc.href}
                          href={uc.href}
                          onClick={() => setUseCaseDropOpen(false)}
                          className={cn(
                            'block px-3 py-2 text-sm rounded-xl transition-colors',
                            uc.highlight
                              ? 'text-brand-600 dark:text-brand-400 font-semibold hover:bg-brand-50 dark:hover:bg-brand-950'
                              : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)]',
                            i === 1 && 'mt-1 border-t border-[var(--border)] pt-2'
                          )}
                        >
                          {uc.label}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href!}
                className={cn(
                  'px-3 py-2 text-sm rounded-lg transition-colors',
                  pathname === link.href
                    ? 'text-brand-600 bg-brand-50 dark:bg-brand-950 dark:text-brand-400 font-medium'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)]'
                )}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <LanguageSelector currentLocale={locale} />
          </div>
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] px-3 py-2 rounded-lg hover:bg-[var(--background-subtle)] transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                {isEN ? 'Dashboard' : 'Dashboard'}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="hidden sm:flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] px-3 py-2 rounded-lg hover:bg-[var(--background-subtle)] transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                {isEN ? 'Sign out' : 'Abmelden'}
              </button>
              <Link href="/einspruch">
                <Button size="md" variant="primary">
                  {isEN ? 'New appeal' : 'Neuer Einspruch'}
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:block text-sm text-[var(--muted)] hover:text-[var(--foreground)] px-3 py-2 rounded-lg hover:bg-[var(--background-subtle)] transition-colors"
              >
                {isEN ? 'Sign in' : 'Anmelden'}
              </Link>
              <Link href="/register">
                <Button size="md" variant="primary">
                  {ctaLabel}
                </Button>
              </Link>
            </>
          )}
          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)] rounded-lg transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--surface)] px-4 pb-5 space-y-1 animate-slide-down">
          {navLinks.map((link) => (
            <Link
              key={link.dropdown ? 'use-cases' : link.href!}
              href={link.dropdown ? '/anwendungsfaelle' : link.href!}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-3 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)] rounded-xl transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-[var(--border)] space-y-2">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-3 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)] rounded-xl transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  href="/einspruch"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-3 text-sm font-bold text-center text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors"
                >
                  {isEN ? 'New appeal' : 'Neuer Einspruch'}
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); signOut({ callbackUrl: '/login' }) }}
                  className="flex items-center gap-2 w-full px-3 py-3 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)] rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {isEN ? 'Sign out' : 'Abmelden'}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-3 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)] rounded-xl transition-colors"
                >
                  {isEN ? 'Sign in' : 'Anmelden'}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-3 text-sm font-bold text-center text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors"
                >
                  {ctaLabel}
                </Link>
              </>
            )}
            <div className="px-1">
              <LanguageSelector currentLocale={locale} />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
