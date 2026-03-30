import { brand } from '@/config/brand'
import { Logo } from '@/components/Logo'
import { Link } from '@/i18n/navigation'

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const isEN = locale === 'en'

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Slim top bar */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Logo size="sm" />
          <Link
            href="/"
            className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            ← {isEN ? 'Back to home' : 'Zurück zur Startseite'}
          </Link>
        </div>
      </header>

      {/* Centered form area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">{children}</div>
      </div>

      <footer className="py-4 text-center">
        <p className="text-xs text-[var(--muted)]">
          © {new Date().getFullYear()} {brand.name} ·{' '}
          <Link href="/datenschutz" className="hover:underline">
            {isEN ? 'Privacy' : 'Datenschutz'}
          </Link>
          {' · '}
          <Link href="/impressum" className="hover:underline">
            Impressum
          </Link>
        </p>
      </footer>
    </div>
  )
}
