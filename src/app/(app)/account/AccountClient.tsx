'use client'

export function AccountClient({ section }: { section: string }) {
  const sectionLabels: Record<string, string> = {
    profile: 'Profil',
    language: 'Sprache',
    security: 'Sicherheit',
    notifications: 'Benachrichtigungen',
  }

  return (
    <button
      disabled
      title={`${sectionLabels[section] ?? section} bearbeiten folgt in Phase 1`}
      className="text-xs font-medium text-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Bearbeiten
    </button>
  )
}
