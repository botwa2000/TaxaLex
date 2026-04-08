import { getTranslations } from 'next-intl/server'
import { brand } from '@/config/brand'
import { Logo } from './Logo'
import { LanguageSelector } from './ui/LanguageSelector'
import { Link } from '@/i18n/navigation'

interface FooterProps {
  locale: string
}

export async function Footer({ locale }: FooterProps) {
  const t = await getTranslations('footer')
  const year = new Date().getFullYear()

  const columns = [
    {
      heading: t('columns.product'),
      links: [
        { label: t('links.howItWorks'), href: '/wie-es-funktioniert' },
        { label: t('links.useCases'), href: '/#use-cases' },
        { label: t('links.templates'), href: '/vorlagen' },
        { label: t('links.pricing'), href: '/preise' },
        { label: t('links.forAdvisors'), href: '/advisor' },
        { label: t('links.forExpats'), href: '/fuer-expats' },
      ],
    },
    {
      heading: t('columns.support'),
      links: [
        { label: t('links.faq'), href: '/#faq' },
        { label: t('links.contact'), href: '/kontakt' },
        { label: t('links.signIn'), href: '/login' },
        { label: t('links.createAccount'), href: '/register' },
      ],
    },
    {
      heading: t('columns.legal'),
      links: [
        { label: t('links.imprint'), href: '/impressum' },
        { label: t('links.privacy'), href: '/datenschutz' },
        { label: t('links.terms'), href: '/agb' },
        { label: t('links.cookiePolicy'), href: '/cookies' },
      ],
    },
  ]

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-8">
        {/* Top row: logo + columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="mb-3"><Logo size="md" /></div>
            <p className="text-sm text-[var(--muted)] leading-relaxed max-w-xs">
              {t('brandTagline')}
            </p>
            <p className="mt-3 text-xs text-[var(--muted)]">
              {t('tagline')}
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
            © {year} {brand.name}. {t('allRightsReserved')}
          </p>
          <div className="order-1 sm:order-2">
            <LanguageSelector currentLocale={locale} />
          </div>
        </div>
      </div>
    </footer>
  )
}
