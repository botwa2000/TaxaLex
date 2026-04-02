import { getTranslations } from 'next-intl/server'
import { brand } from '@/config/brand'
import { Logo } from '@/components/Logo'
import { Link } from '@/i18n/navigation'
import { Shield, CheckCircle2, Clock } from 'lucide-react'

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'auth.layout' })

  const trustPoints = [
    { icon: CheckCircle2, text: t('trustDraft') },
    { icon: Clock, text: t('trustDemo') },
    { icon: Shield, text: t('trustGdpr') },
  ]

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Slim top bar */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Logo size="sm" />
          <Link
            href="/"
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            ← {t('backToHome')}
          </Link>
        </div>
      </header>

      {/* Content area — split on desktop */}
      <div className="flex-1 flex">
        {/* Left panel — brand story (lg+) */}
        <div className="hidden lg:flex w-[420px] shrink-0 bg-brand-600 dark:bg-brand-900 flex-col justify-between p-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-500/40 dark:bg-brand-800 text-brand-100 text-xs font-semibold px-3 py-1.5 rounded-full mb-8">
              <Shield className="w-3.5 h-3.5" />
              {t('trusted')}
            </div>
            <h2 className="text-3xl font-extrabold text-white leading-tight mb-4">
              {t('headline')}
            </h2>
            <p className="text-brand-200 leading-relaxed mb-10">
              {t('description')}
            </p>
            <ul className="space-y-4">
              {trustPoints.map((p) => (
                <li key={p.text} className="flex items-center gap-3 text-sm text-brand-100">
                  <p.icon className="w-5 h-5 shrink-0 text-brand-300" />
                  {p.text}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-brand-400 text-xs mt-8">
            © {new Date().getFullYear()} {brand.name}
          </p>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>

      <footer className="py-4 text-center border-t border-[var(--border)] lg:hidden">
        <p className="text-xs text-[var(--muted)]">
          © {new Date().getFullYear()} {brand.name} ·{' '}
          <Link href="/datenschutz" className="hover:underline">
            {t('privacy')}
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
