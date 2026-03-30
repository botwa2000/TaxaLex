import { auth } from '@/auth'
import { DEMO_USER_ID, DEMO_USER } from '@/lib/mockData'
import { localeLabels, outputLanguages } from '@/config/i18n'
import { AccountClient } from '@/app/(app)/account/AccountClient'

type User = {
  id: string
  email: string
  name: string | null
  role: string
  locale: string
  outputLanguage: string
  createdAt: Date
}

export default async function AccountPage() {
  const session = await auth()
  const userId = session!.user!.id as string
  let user: User | null = null

  try {
    if (userId === DEMO_USER_ID) throw new Error('demo')
    const { db } = await import('@/lib/db')
    user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, locale: true, outputLanguage: true, createdAt: true },
    })
  } catch {
    user = DEMO_USER as User
  }

  if (!user) return null

  const localeLabel = localeLabels[user.locale as keyof typeof localeLabels] ?? user.locale
  const outputLangLabel = outputLanguages.find((l) => l.code === user!.outputLanguage)?.label ?? user.outputLanguage

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Konto & Einstellungen</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Verwalten Sie Ihr Profil, Sprache und Datenschutz-Einstellungen
        </p>
      </div>

      <div className="max-w-2xl space-y-5">
        {/* Profile */}
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5">
          <div className="flex items-start justify-between mb-4">
            <h2 className="font-semibold text-sm text-[var(--foreground)]">Profil</h2>
            <AccountClient section="profile" />
          </div>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xl font-bold">
              {(user.name ?? user.email).slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)]">{user.name ?? '(Kein Name)'}</p>
              <p className="text-sm text-[var(--muted)]">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <RoleBadge role={user.role} />
                <span className="text-xs text-[var(--muted)]">
                  Mitglied seit {new Date(user.createdAt).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
          <Field label="Name" value={user.name ?? '—'} />
          <Field label="E-Mail" value={user.email} />
          <Field label="Rolle" value={user.role} />
        </div>

        {/* Language */}
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5">
          <div className="flex items-start justify-between mb-4">
            <h2 className="font-semibold text-sm text-[var(--foreground)]">Spracheinstellungen</h2>
            <AccountClient section="language" />
          </div>
          <Field label="UI-Sprache" value={localeLabel} />
          <Field label="Ausgabesprache (Einspruch-Dokument)" value={outputLangLabel} />
          <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs text-amber-800">
            Ausgabe-Sprachen außer Deutsch sind mit dem Hinweis &ldquo;Nur zur Überprüfung&rdquo; versehen,
            da deutsche Behörden deutsche Schreiben erfordern.
          </div>
        </div>

        {/* Security */}
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5">
          <div className="flex items-start justify-between mb-4">
            <h2 className="font-semibold text-sm text-[var(--foreground)]">Sicherheit</h2>
            <AccountClient section="security" />
          </div>
          <Field label="Passwort" value="••••••••••" />
          <Field label="Zwei-Faktor-Authentifizierung" value="Nicht aktiviert" />
        </div>

        {/* Data & Privacy */}
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5">
          <h2 className="font-semibold text-sm text-[var(--foreground)] mb-2">Datenschutz</h2>
          <p className="text-sm text-[var(--muted)] mb-4 leading-relaxed">
            Sie können jederzeit alle Ihre Daten herunterladen oder Ihr Konto löschen (DSGVO Art. 17/20).
          </p>
          <div className="flex gap-3 flex-wrap">
            <button
              className="text-sm border border-[var(--border)] px-3 py-1.5 rounded-lg hover:bg-[var(--background-subtle)] transition-colors text-[var(--foreground)]"
              onClick={() => alert('Daten-Export: wird in einer zukünftigen Version verfügbar sein.')}
            >
              Daten exportieren
            </button>
            <button
              className="text-sm border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              onClick={() => {
                if (confirm('Möchten Sie Ihr Konto wirklich löschen?')) {
                  alert('Konto-Löschung: wird mit DSGVO-Compliance verfügbar sein.')
                }
              }}
            >
              Konto löschen
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[var(--border)] last:border-0">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <span className="text-sm font-medium text-[var(--foreground)]">{value}</span>
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    ADMIN: 'bg-red-50 text-red-700',
    PRO: 'bg-brand-50 text-brand-700',
    ADVISOR: 'bg-purple-50 text-purple-700',
    USER: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[role] ?? 'bg-gray-100 text-gray-600'}`}>
      {role}
    </span>
  )
}
