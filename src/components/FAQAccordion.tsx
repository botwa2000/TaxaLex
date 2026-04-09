'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Tabs } from './ui/Tabs'
import { Accordion } from './ui/Accordion'
import type { FAQData } from '@/lib/contentFallbacks'
import { cn } from '@/lib/utils'

interface FAQAccordionProps {
  faqs: FAQData[]
  locale?: string
  className?: string
}

export function FAQAccordion({ faqs, className }: FAQAccordionProps) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const t = useTranslations('faq')

  const categories = ['all', ...Array.from(new Set(faqs.map((f) => f.category)))]

  const filtered = (activeCategory === 'all'
    ? faqs
    : faqs.filter((f) => f.category === activeCategory)
  ).filter((faq) =>
    search === '' ||
    faq.question.toLowerCase().includes(search.toLowerCase()) ||
    faq.answer.toLowerCase().includes(search.toLowerCase())
  )

  const tabItems = categories.map((cat) => ({
    id: cat,
    label: t(`categories.${cat}` as Parameters<typeof t>[0]) ?? cat,
    badge: cat === 'all' && !search ? String(faqs.length) : undefined,
  }))

  const accordionItems = filtered.map((faq) => ({
    id: faq.id ?? `${faq.category}-${faq.sortOrder}`,
    title: faq.question,
    children: (
      <div
        className="text-sm text-[var(--muted)] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: faq.answer.replace(/\n/g, '<br/>') }}
      />
    ),
  }))

  return (
    <div className={cn('', className)}>
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('search')}
          className="w-full pl-10 pr-10 py-3 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-colors placeholder:text-[var(--muted-foreground)]"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            aria-label={t('clearSearch')}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category tabs */}
      <Tabs
        items={tabItems}
        activeId={activeCategory}
        onChange={(id) => { setActiveCategory(id); setSearch('') }}
        variant="pills"
        size="sm"
        className="flex-wrap gap-1 mb-5"
      />

      {search && (
        <p className="text-xs text-[var(--muted)] mb-3">
          {filtered.length === 0
            ? t('noResults')
            : t('resultsCount', { count: filtered.length })}
        </p>
      )}

      {accordionItems.length > 0 ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-4">
          <Accordion items={accordionItems} mode="single" />
        </div>
      ) : (
        <div className="text-center py-10">
          <Search className="w-8 h-8 mx-auto mb-3 text-[var(--border)]" />
          <p className="text-sm text-[var(--muted)]">
            {search
              ? t('noResultsFor', { search })
              : t('noCategoryFaqs')}
          </p>
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="mt-2 text-sm text-brand-600 hover:underline dark:text-brand-400"
            >
              {t('resetSearch')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
