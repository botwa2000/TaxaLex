'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { usePathname } from '@/i18n/navigation'

interface MobileSidebarWrapperProps {
  sidebar: React.ReactNode
  children: React.ReactNode
}

export function MobileSidebarWrapper({ sidebar, children }: MobileSidebarWrapperProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* Desktop sidebar — always visible */}
      <div className="hidden lg:flex w-64 shrink-0 fixed top-0 bottom-0 left-0 z-30">
        {sidebar}
      </div>

      {/* Mobile sidebar overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 lg:hidden transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative h-full">
          {sidebar}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 p-1.5 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)] rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main content — offset by sidebar on desktop */}
      <div className="flex-1 min-w-0 lg:ml-64 flex flex-col">
        {/* Mobile top bar with hamburger */}
        <div className="lg:hidden sticky top-0 z-20 bg-[var(--surface)] border-b border-[var(--border)] px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)] rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-[var(--foreground)] flex-1 truncate">
            Dashboard
          </span>
        </div>

        {children}
      </div>
    </div>
  )
}
