'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccordionItem {
  id: string
  title: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}

interface AccordionProps {
  items: AccordionItem[]
  mode?: 'single' | 'multiple'
  className?: string
}

function AccordionItemComponent({
  item,
  isOpen,
  onToggle,
}: {
  item: AccordionItem
  isOpen: boolean
  onToggle: () => void
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | undefined>(isOpen ? undefined : 0)

  useEffect(() => {
    if (!contentRef.current) return
    if (isOpen) {
      setHeight(contentRef.current.scrollHeight)
      // After transition, remove fixed height to allow dynamic content
      const timer = setTimeout(() => setHeight(undefined), 250)
      return () => clearTimeout(timer)
    } else {
      // Set current height before collapsing (for smooth animation)
      setHeight(contentRef.current.scrollHeight)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setHeight(0))
      })
    }
  }, [isOpen])

  return (
    <div className="border-b border-[var(--border)] last:border-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex items-center justify-between w-full text-left py-4 px-1 gap-4 hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:text-brand-600"
      >
        <span className="font-medium text-sm text-[var(--foreground)]">{item.title}</span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-[var(--muted)] shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        className="overflow-hidden transition-[height] duration-200 ease-out"
        style={{ height: height !== undefined ? `${height}px` : undefined }}
      >
        <div ref={contentRef} className="pb-4 px-1 text-sm text-[var(--muted)] leading-relaxed">
          {item.children}
        </div>
      </div>
    </div>
  )
}

export function Accordion({ items, mode = 'single', className }: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(items.filter((i) => i.defaultOpen).map((i) => i.id))
  )

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        if (mode === 'single') next.clear()
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className={cn('', className)}>
      {items.map((item) => (
        <AccordionItemComponent
          key={item.id}
          item={item}
          isOpen={openIds.has(item.id)}
          onToggle={() => toggle(item.id)}
        />
      ))}
    </div>
  )
}
