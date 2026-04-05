'use client'

import { signOut } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const params = useParams()
  const locale = typeof params?.locale === 'string' ? params.locale : 'de'

  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
      title="Abmelden"
      className="p-1.5 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)] rounded-lg transition-colors"
    >
      <LogOut className="w-3.5 h-3.5" />
    </button>
  )
}
