'use client'

import { useState } from 'react'
import { Tabs } from './ui/Tabs'
import { Accordion } from './ui/Accordion'
import type { FAQData } from '@/lib/contentFallbacks'
import { cn } from '@/lib/utils'

const CATEGORY_LABELS_DE: Record<string, string> = {
  all: 'Alle',
  general: 'Allgemein',
  pricing: 'Preise',
  legal: 'Rechtliches',
  technical: 'Technisch',
  advisor: 'Berater',
}

const CATEGORY_LABELS_EN: Record<string, string> = {
  all: 'All',
  general: 'General',
  pricing: 'Pricing',
  legal: 'Legal',
  technical: 'Technical',
  advisor: 'Advisors',
}

interface FAQAccordionProps {
  faqs: FAQData[]
  locale?: string
  className?: string
}

export function FAQAccordion({ faqs, locale = 'de', className }: FAQAccordionProps) {
  const [activeCategory, setActiveCategory] = useState('all')
  const labels = locale === 'en' ? CATEGORY_LABELS_EN : CATEGORY_LABELS_DE

  // Derive categories from the data
  const categories = ['all', ...Array.from(new Set(faqs.map((f) => f.category)))]

  const filtered = activeCategory === 'all'
    ? faqs
    : faqs.filter((f) => f.category === activeCategory)

  const tabItems = categories.map((cat) => ({
    id: cat,
    label: labels[cat] ?? cat,
    badge: cat === 'all' ? String(faqs.length) : undefined,
  }))

  const accordionItems = filtered.map((faq) => ({
    id: faq.id ?? `${faq.category}-${faq.sortOrder}`,
    title: faq.question,
    children: <div dangerouslySetInnerHTML={{ __html: faq.answer.replace(/\n/g, '<br/>') }} />,
  }))

  return (
    <div className={cn('', className)}>
      <Tabs
        items={tabItems}
        activeId={activeCategory}
        onChange={setActiveCategory}
        variant="pills"
        size="sm"
        className="flex-wrap gap-1 mb-6"
      />
      {accordionItems.length > 0 ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-4">
          <Accordion items={accordionItems} mode="single" />
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)] text-center py-8">
          {locale === 'en' ? 'No FAQs in this category.' : 'Keine FAQs in dieser Kategorie.'}
        </p>
      )}
    </div>
  )
}
