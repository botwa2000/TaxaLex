import { brand } from '@/config/brand'
import { Logo } from './Logo'
import { LanguageSelector } from './ui/LanguageSelector'
import { Link } from '@/i18n/navigation'

interface FooterProps {
  locale: string
}

const COLUMNS_DE = [
  {
    heading: 'Produkt',
    links: [
      { label: 'Wie es funktioniert', href: '/wie-es-funktioniert' },
      { label: 'Anwendungsfälle', href: '/#use-cases' },
      { label: 'Vorlagen', href: '/vorlagen' },
      { label: 'Preise', href: '/preise' },
      { label: 'Für Steuerberater', href: '/fuer-steuerberater' },
      { label: 'Für Expats', href: '/fuer-expats' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Häufige Fragen', href: '/#faq' },
      { label: 'Anmelden', href: '/login' },
      { label: 'Konto erstellen', href: '/register' },
    ],
  },
  {
    heading: 'Rechtliches',
    links: [
      { label: 'Impressum', href: '/impressum' },
      { label: 'Datenschutz', href: '/datenschutz' },
      { label: 'AGB', href: '/agb' },
      { label: 'Cookie-Richtlinie', href: '/cookies' },
    ],
  },
]

const COLUMNS_EN = [
  {
    heading: 'Product',
    links: [
      { label: 'How it works', href: '/wie-es-funktioniert' },
      { label: 'Use cases', href: '/#use-cases' },
      { label: 'Templates', href: '/vorlagen' },
      { label: 'Pricing', href: '/preise' },
      { label: 'For tax advisors', href: '/fuer-steuerberater' },
      { label: 'For expats', href: '/fuer-expats' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'FAQ', href: '/#faq' },
      { label: 'Sign in', href: '/login' },
      { label: 'Create account', href: '/register' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Imprint', href: '/impressum' },
      { label: 'Privacy policy', href: '/datenschutz' },
      { label: 'Terms of service', href: '/agb' },
      { label: 'Cookie policy', href: '/cookies' },
    ],
  },
]

export function Footer({ locale }: FooterProps) {
  const isEN = locale === 'en'
  const columns = isEN ? COLUMNS_EN : COLUMNS_DE
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-8">
        {/* Top row: logo + columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="mb-3"><Logo size="md" /></div>
            <p className="text-sm text-[var(--muted)] leading-relaxed max-w-xs">
              {isEN ? brand.taglineEn : brand.tagline}
            </p>
            <p className="mt-3 text-xs text-[var(--muted)]">
              {isEN
                ? 'AI-generated drafts. Not legal advice.'
                : 'KI-generierte Entwürfe. Kein Rechtsrat i.S.d. RDG.'}
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
                {col.heading}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--muted)] order-2 sm:order-1">
            © {year} {brand.name}. {isEN ? 'All rights reserved.' : 'Alle Rechte vorbehalten.'}
          </p>
          <div className="order-1 sm:order-2">
            <LanguageSelector currentLocale={locale} />
          </div>
        </div>
      </div>
    </footer>
  )
}
