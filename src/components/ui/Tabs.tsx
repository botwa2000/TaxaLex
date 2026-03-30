'use client'

import { cn } from '@/lib/utils'

interface TabItem {
  id: string
  label: string
  icon?: React.ReactNode
  badge?: string
  disabled?: boolean
}

interface TabsProps {
  items: TabItem[]
  activeId: string
  onChange: (id: string) => void
  variant?: 'underline' | 'pills' | 'boxed'
  size?: 'sm' | 'md'
  className?: string
  tabClassName?: string
}

export function Tabs({
  items,
  activeId,
  onChange,
  variant = 'underline',
  size = 'md',
  className,
  tabClassName,
}: TabsProps) {
  const containerStyles: Record<string, string> = {
    underline: 'border-b border-[var(--border)] gap-0',
    pills: 'gap-1',
    boxed: 'bg-[var(--background-subtle)] rounded-xl p-1 gap-1',
  }

  const baseTab = cn(
    'inline-flex items-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap',
    size === 'sm' ? 'text-xs px-2.5 py-1.5' : 'text-sm px-3 py-2'
  )

  const activeTab: Record<string, string> = {
    underline: 'text-brand-600 border-b-2 border-brand-600 -mb-px dark:text-brand-400',
    pills: 'bg-brand-600 text-white rounded-lg dark:bg-brand-500',
    boxed: 'bg-[var(--surface)] text-[var(--foreground)] rounded-lg shadow-sm',
  }

  const inactiveTab: Record<string, string> = {
    underline: 'text-[var(--muted)] hover:text-[var(--foreground)] border-b-2 border-transparent -mb-px',
    pills: 'text-[var(--muted)] hover:bg-[var(--background-subtle)] hover:text-[var(--foreground)] rounded-lg',
    boxed: 'text-[var(--muted)] hover:text-[var(--foreground)] rounded-lg',
  }

  return (
    <div
      role="tablist"
      className={cn('flex items-center', containerStyles[variant], className)}
    >
      {items.map((item) => {
        const isActive = item.id === activeId
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={isActive}
            disabled={item.disabled}
            onClick={() => !item.disabled && onChange(item.id)}
            className={cn(
              baseTab,
              isActive ? activeTab[variant] : inactiveTab[variant],
              tabClassName
            )}
          >
            {item.icon}
            {item.label}
            {item.badge && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-brand-100 text-brand-700 rounded-full dark:bg-brand-900 dark:text-brand-300">
                {item.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
