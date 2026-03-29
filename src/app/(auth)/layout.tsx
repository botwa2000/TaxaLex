import Link from 'next/link'
import { brand } from '@/config/brand'
import { Logo } from '@/components/Logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Slim top bar */}
      <header className="border-b border-[var(--border)] bg-white">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Logo size="sm" />
          <Link href="/" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            ← Zurück zur Startseite
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
          <Link href="/datenschutz" className="hover:underline">Datenschutz</Link>
          {' · '}
          <Link href="/impressum" className="hover:underline">Impressum</Link>
        </p>
      </footer>
    </div>
  )
}
