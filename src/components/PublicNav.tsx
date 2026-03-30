'use client'

import { useState } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from './Logo'
import { Button } from './ui/Button'
import { ThemeToggle } from './ui/ThemeToggle'
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
      href: '/fuer-steuerberater',
    },
  ]

  const useCaseLinks = [
    { label: isEN ? 'Tax assessment' : 'Steuerbescheid', href: '/einspruch?type=tax' },
    { label: isEN ? 'Jobcenter / Bürgergeld' : 'Jobcenter / Bürgergeld', href: '/einspruch?type=jobcenter' },
    { label: isEN ? 'Pension notice' : 'Rentenbescheid', href: '/einspruch?type=rente' },
    { label: isEN ? 'Fine / penalty' : 'Bußgeldbescheid', href: '/einspruch?type=bussgeld' },
    { label: isEN ? 'Health insurance' : 'Krankenversicherung', href: '/einspruch?type=krankenversicherung' },
    { label: isEN ? 'Dismissal notice' : 'Kündigung', href: '/einspruch?type=kuendigung' },
    { label: isEN ? 'Rent increase' : 'Mieterhöhung', href: '/einspruch?type=miete' },
    { label: isEN ? 'Property tax' : 'Grundsteuer', href: '/einspruch?type=grundsteuer' },
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
                      {useCaseLinks.map((uc) => (
                        <Link
                          key={uc.href}
                          href={uc.href}
                          onClick={() => setUseCaseDropOpen(false)}
                          className="block px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)] rounded-xl transition-colors"
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
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden sm:block text-sm text-[var(--muted)] hover:text-[var(--foreground)] px-3 py-2 rounded-lg hover:bg-[var(--background-subtle)] transition-colors"
          >
            {isEN ? 'Sign in' : 'Anmelden'}
          </Link>
          <Link href="/register">
            <Button size="sm" variant="primary">
              {ctaLabel}
            </Button>
          </Link>
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
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--surface)] px-4 pb-4 space-y-1 animate-slide-down">
          {navLinks.filter((l) => !l.dropdown).map((link) => (
            <Link
              key={link.href}
              href={link.href!}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)] rounded-xl transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-[var(--border)] flex items-center gap-2">
            <LanguageSelector currentLocale={locale} />
          </div>
        </div>
      )}
    </header>
  )
}
