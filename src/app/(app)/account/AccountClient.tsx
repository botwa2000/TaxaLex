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
      onClick={() => alert(`${sectionLabels[section] ?? section} bearbeiten wird in einer zukünftigen Version verfügbar sein.`)}
      className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
    >
      Bearbeiten
    </button>
  )
}
