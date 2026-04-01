import { auth } from '@/auth'
import { DEMO_USER_ID, DEMO_USER } from '@/lib/mockData'
import { PRICING_PLANS } from '@/lib/contentFallbacks'
import { Link } from '@/i18n/navigation'
import { DeleteAccountButton } from './DeleteAccountButton'
import { ThemeSettingRow } from '@/components/ThemeSettingRow'
import {
  Plus,
  FileText,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  Star,
  Zap,
  Package,
  Crown,
  User,
  Mail,
  ShieldCheck,
  Download,
} from 'lucide-react'
import { LogoutButton } from '@/components/LogoutButton'
import { LocaleSettingRow } from './LocaleSettingRow'

type UserRecord = {
  id: string
  email: string
  name: string | null
  role: string
  locale: string
  theme: string
  emailVerified: Date | null
  createdAt: Date
}

const TEMPLATE_HIGHLIGHTS = [
  { slug: 'tax', titleDE: 'Einspruch Steuerbescheid', icon: '📄', law: '§ 347 AO' },
  { slug: 'jobcenter', titleDE: 'Widerspruch Jobcenter / Bürgergeld', icon: '🏢', law: '§ 78 SGG' },
  { slug: 'grundsteuer', titleDE: 'Einspruch Grundsteuerbescheid', icon: '🏠', law: '§ 347 AO' },
  { slug: 'krankenversicherung', titleDE: 'Widerspruch Krankenkasse', icon: '🏥', law: '§ 78 SGG' },
  { slug: 'kuendigung', titleDE: 'Widerspruch Kündigung', icon: '💼', law: 'KSchG' },
  { slug: 'miete', titleDE: 'Widerspruch Mieterhöhung', icon: '🔑', law: 'BGB § 558' },
]

export default async function AccountPage() {
  const session = await auth()
  const userId = session!.user!.id as string
  let user: UserRecord | null = null

  try {
    if (userId === DEMO_USER_ID) throw new Error('demo')
    const { db } = await import('@/lib/db')
    user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, locale: true, theme: true, emailVerified: true, createdAt: true },
    })
  } catch {
    user = { ...(DEMO_USER as unknown as UserRecord), emailVerified: null, theme: 'system' }
  }

  if (!user) return null

  const isDemo = userId === DEMO_USER_ID
  const isPro = user.role === 'PRO'
  const isAdvisor = ['ADVISOR', 'LAWYER'].includes(user.role)
  const displayName = user.name ?? user.email.split('@')[0]
  const initials = (user.name ?? user.email).slice(0, 2).toUpperCase()
  const memberSince = new Date(user.createdAt).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })

  const individualPlans = PRICING_PLANS.filter((p) => p.userGroup === 'individual')

  return (
    <div className="space-y-6">

      {/* ── Hero / Profile Header ── */}
      <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-bold">{displayName}</h1>
              <p className="text-brand-200 text-sm">{user.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
                  {isPro ? <Crown className="w-3 h-3" /> : isAdvisor ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                  {isPro ? 'Pro' : isAdvisor ? user.role : 'Free'}
                </span>
                <span className="text-brand-300 text-xs">Mitglied seit {memberSince}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-brand-200">Abmelden</span>
            <LogoutButton />
          </div>
        </div>

        {/* CTA bar */}
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/einspruch"
            className="inline-flex items-center gap-2 bg-white text-brand-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-50 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Neuen Einspruch starten
          </Link>
          <Link
            href="/cases"
            className="inline-flex items-center gap-2 bg-white/15 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/25 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Meine Fälle
          </Link>
        </div>
      </div>

      {/* ── Email verification warning ── */}
      {!user.emailVerified && !isDemo && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5">
          <Mail className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">E-Mail-Adresse nicht bestätigt</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Bitte bestätigen Sie Ihre E-Mail-Adresse. Check your inbox for the confirmation link.
            </p>
          </div>
        </div>
      )}

      {/* ── Quick stats ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-[var(--foreground)]">{isDemo ? '3' : '0'}</p>
          <p className="text-xs text-[var(--muted)] mt-0.5">Fälle gesamt</p>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-[var(--foreground)]">{isPro ? '∞' : isDemo ? '2' : '0'}</p>
          <p className="text-xs text-[var(--muted)] mt-0.5">Guthaben</p>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-brand-600">{isPro ? 'Pro' : 'Free'}</p>
          <p className="text-xs text-[var(--muted)] mt-0.5">Aktueller Plan</p>
        </div>
      </div>

      {/* ── Templates section ── */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)]">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-[var(--foreground)]">Vorlagen & Muster</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">Kostenlose Vorlagen zum Herunterladen und Anpassen</p>
          </div>
          <Link href="/vorlagen" className="text-xs text-brand-600 hover:underline flex items-center gap-1 shrink-0">
            Alle anzeigen <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {TEMPLATE_HIGHLIGHTS.map((t) => (
            <Link
              key={t.slug + t.titleDE}
              href={`/vorlagen/${t.slug}`}
              className="flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--background-subtle)] transition-colors group"
            >
              <span className="text-xl shrink-0">{t.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)] truncate">{t.titleDE}</p>
                <p className="text-xs text-[var(--muted)]">{t.law}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-brand-600 font-medium hidden sm:block">Kostenlos</span>
                <Download className="w-3.5 h-3.5 text-[var(--muted)] group-hover:text-brand-600 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
        <div className="px-5 py-3.5 border-t border-[var(--border)]">
          <Link
            href="/einspruch"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            <Zap className="w-4 h-4" />
            Lieber KI nutzen — Einspruch in 5 Minuten erstellen
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── Pricing / upgrade section ── */}
      {!isPro && !isAdvisor && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[var(--foreground)]">Pakete & Preise</h2>
            <Link href="/billing" className="text-xs text-brand-600 hover:underline">
              Alle Details
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {individualPlans.map((plan) => {
              const t = plan.translations['de']
              const price = plan.priceOnce ?? plan.priceMonthly
              const suffix = plan.priceMonthly ? '/Monat' : '/Einspruch'
              const isPopular = plan.isPopular
              return (
                <div
                  key={plan.slug}
                  className={`relative bg-[var(--surface)] rounded-xl border p-4 ${
                    isPopular ? 'border-brand-400 ring-1 ring-brand-300' : 'border-[var(--border)]'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 bg-brand-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                        <Star className="w-2.5 h-2.5" /> Beliebt
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 mb-2">
                    <Package className="w-4 h-4 text-brand-600 shrink-0" />
                    <p className="font-bold text-sm text-[var(--foreground)]">{t?.name}</p>
                  </div>
                  <p className="text-[11px] text-[var(--muted)] mb-3 leading-relaxed">{t?.description}</p>
                  <p className="text-2xl font-black text-[var(--foreground)] mb-1">
                    €{price?.toFixed(2).replace('.', ',')}
                    <span className="text-xs font-normal text-[var(--muted)] ml-1">{suffix}</span>
                  </p>
                  <ul className="space-y-1 mb-4">
                    {plan.features
                      .filter((f) => f.locale === 'de')
                      .slice(0, 3)
                      .map((f) => (
                        <li key={f.text} className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                          <CheckCircle2 className={`w-3 h-3 shrink-0 ${f.included ? 'text-green-500' : 'text-gray-300'}`} />
                          {f.text}
                        </li>
                      ))}
                  </ul>
                  <Link
                    href="/billing"
                    className={`w-full block text-center text-xs font-bold py-2 rounded-lg transition-colors ${
                      isPopular
                        ? 'bg-brand-600 text-white hover:bg-brand-700'
                        : 'border border-brand-400 text-brand-600 hover:bg-brand-50'
                    }`}
                  >
                    {t?.cta}
                  </Link>
                </div>
              )
            })}
          </div>

          {/* Expert review add-on */}
          <div className="mt-3 flex items-center gap-4 border border-dashed border-amber-300 bg-amber-50 rounded-xl px-4 py-3.5">
            <ShieldCheck className="w-8 h-8 text-amber-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-900">Steuerberater-Prüfung zubuchbar</p>
              <p className="text-xs text-amber-700 mt-0.5">Ein zertifizierter Steuerberater prüft und finalisiert Ihren Einspruch.</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-base font-black text-amber-900">ab €69</p>
              <p className="text-[10px] text-amber-600">pro Fall</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Profile & settings ── */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)]">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[var(--foreground)]">Konto & Einstellungen</h2>
        </div>

        {/* Profile row */}
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Profil</p>
          </div>
          <div className="space-y-2.5">
            <SettingRow label="Name" value={user.name ?? '—'} />
            <SettingRow label="E-Mail" value={user.email} />
            <SettingRow
              label="E-Mail bestätigt"
              value={user.emailVerified ? 'Ja' : 'Nein'}
              valueClass={user.emailVerified ? 'text-green-600' : 'text-amber-600'}
            />
            <SettingRow label="Konto-Typ" value={user.role} />
            <SettingRow label="Mitglied seit" value={memberSince} />
          </div>
        </div>

        {/* Security row */}
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-3">Sicherheit</p>
          <div className="space-y-2.5">
            <SettingRow label="Passwort" value="••••••••••" />
            <SettingRow label="Zwei-Faktor (2FA)" value="Nicht aktiviert" valueClass="text-[var(--muted)]" />
          </div>
          <div className="mt-3">
            <Link
              href="/forgot-password"
              className="text-xs text-brand-600 hover:underline inline-flex items-center gap-1"
            >
              Passwort ändern <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Appearance */}
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-3">Darstellung</p>
          <ThemeSettingRow initialTheme={user.theme} />
        </div>

        {/* Language */}
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-3">Sprache & Region</p>
          <LocaleSettingRow initialLocale={user.locale || 'de'} />
        </div>

        {/* Billing shortcut */}
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-3">Abrechnung</p>
          <Link
            href="/billing"
            className="flex items-center gap-3 p-3 bg-[var(--background-subtle)] rounded-lg hover:bg-[var(--border)] transition-colors"
          >
            <CreditCard className="w-5 h-5 text-brand-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--foreground)]">Zahlungen & Plan verwalten</p>
              <p className="text-xs text-[var(--muted)]">Rechnungen, Upgrade, Pakete kaufen</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--muted)]" />
          </Link>
        </div>

        {/* GDPR */}
        <div className="px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-2">Datenschutz (DSGVO)</p>
          <p className="text-xs text-[var(--muted)] mb-3">
            Datenexport folgt. Kontoloschung ist sofort wirksam und unwiderruflich.
          </p>
          <div className="flex gap-2 items-start">
            <button
              disabled
              title="Folgt in Kürze"
              className="text-xs border border-[var(--border)] px-3 py-1.5 rounded-lg text-[var(--muted)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Daten exportieren
            </button>
            <DeleteAccountButton />
          </div>
        </div>
      </div>

    </div>
  )
}

function SettingRow({
  label,
  value,
  valueClass,
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <span className={`text-sm font-medium ${valueClass ?? 'text-[var(--foreground)]'}`}>{value}</span>
    </div>
  )
}
