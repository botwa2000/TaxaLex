import { auth } from '@/auth'
import {
  LayoutDashboard,
  FolderOpen,
  User,
  LogOut,
  Plus,
  CreditCard,
  Bell,
  Shield,
} from 'lucide-react'
import { Logo } from '@/components/Logo'
import { redirect } from 'next/navigation'
import { Link } from '@/i18n/navigation'

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const [session] = await Promise.all([auth(), params])
  if (!session) redirect('/login')

  const isAdmin = session!.user?.role === 'ADMIN'
  const isAdvisor = ['ADVISOR', 'LAWYER'].includes(session!.user?.role ?? '')
  const userName = session!.user?.name ?? session!.user?.email ?? 'Nutzer'
  const userEmail = session!.user?.email ?? ''
  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* ── Sidebar ── */}
      <aside className="w-60 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col shrink-0 fixed top-0 bottom-0 left-0 z-30">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-[var(--border)]">
          <Logo size="md" href="/dashboard" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] px-3 py-2">
            Übersicht
          </p>
          <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem href="/cases" icon={FolderOpen} label="Meine Fälle" />

          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] px-3 pt-4 pb-2">
            Konto
          </p>
          <NavItem href="/account" icon={User} label="Profil & Einstellungen" />
          <NavItem href="/billing" icon={CreditCard} label="Abrechnung" />

          {isAdvisor && (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] px-3 pt-4 pb-2">
                Berater
              </p>
              <NavItem href="/advisor/dashboard" icon={LayoutDashboard} label="Berater-Dashboard" highlight />
              <NavItem href="/advisor/clients" icon={FolderOpen} label="Mandanten" highlight />
              <NavItem href="/advisor/appeals" icon={Shield} label="Alle Einsprüche" highlight />
              <NavItem href="/advisor/billing" icon={CreditCard} label="Berater-Abrechnung" highlight />
            </>
          )}

          {isAdmin && (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] px-3 pt-4 pb-2">
                Administration
              </p>
              <NavItem href="/admin" icon={Shield} label="Admin-Panel" highlight />
            </>
          )}
        </nav>

        {/* Upgrade CTA */}
        <div className="p-3 border-t border-[var(--border)]">
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 mb-3 dark:bg-brand-950 dark:border-brand-900">
            <p className="text-xs font-semibold text-brand-800 dark:text-brand-200 mb-0.5">
              Kostenlos-Plan
            </p>
            <p className="text-[11px] text-brand-600 dark:text-brand-400 mb-2">
              1/1 Einsprüche diesen Monat genutzt
            </p>
            <div className="h-1.5 bg-brand-100 dark:bg-brand-900 rounded-full mb-2">
              <div className="h-1.5 bg-brand-600 rounded-full w-full" />
            </div>
            <Link
              href="/billing"
              className="block w-full text-center text-xs font-semibold bg-brand-600 text-white py-1.5 rounded-lg hover:bg-brand-700 transition-colors"
            >
              Auf Pro upgraden
            </Link>
          </div>

          {/* User info + logout */}
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-8 h-8 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--foreground)] truncate">{userName}</p>
              <p className="text-[11px] text-[var(--muted)] truncate">{userEmail}</p>
            </div>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                title="Abmelden"
                className="p-1.5 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)] rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 ml-60">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-[var(--surface)] border-b border-[var(--border)] px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[var(--muted)]" />

          <div className="flex items-center gap-2">
            <button
              title="Benachrichtigungen"
              className="relative p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)] rounded-lg transition-colors"
            >
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>

            <Link
              href="/einspruch"
              className="flex items-center gap-1.5 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Neue Anfrage
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-5xl w-full mx-auto">{children}</main>
      </div>
    </div>
  )
}

function NavItem({
  href,
  icon: Icon,
  label,
  highlight,
}: {
  href: string
  icon: React.ElementType
  label: string
  highlight?: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${
        highlight
          ? 'text-brand-700 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950'
          : 'text-[var(--muted)] hover:bg-[var(--background-subtle)] hover:text-[var(--foreground)]'
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {label}
    </Link>
  )
}
