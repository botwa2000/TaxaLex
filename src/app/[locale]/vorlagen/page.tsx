'use client'

import { useState } from 'react'
import { use } from 'react'
import { useTranslations } from 'next-intl'
import { PublicNav } from '@/components/PublicNav'
import { Footer } from '@/components/Footer'
import { Link } from '@/i18n/navigation'
import {
  FileText, Users, Clock, AlertTriangle, Shield, Briefcase,
  Home, MapPin, Download, Edit3, ArrowRight, Zap,
} from 'lucide-react'

export default function VorlagenPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)
  const t = useTranslations('templatesPage')
  const [activeCategory, setActiveCategory] = useState(0)

  const categories = [
    t('catAll'),
    t('catTax'),
    t('catSocial'),
    t('catEmployment'),
    t('catHousing'),
    t('catConsumer'),
    t('catGeneral'),
  ]

  const templates = [
    {
      id: 'steuerbescheid-einspruch',
      icon: FileText,
      category: t('catTax'),
      title: t('tpl.steuerbescheid-einspruch.title'),
      desc: t('tpl.steuerbescheid-einspruch.desc'),
      deadline: t('tpl.steuerbescheid-einspruch.deadline'),
      badge: t('tpl.steuerbescheid-einspruch.badge') || undefined,
      law: '§ 347 AO',
      slug: 'tax',
      popular: true,
    },
    {
      id: 'grundsteuer-einspruch',
      icon: MapPin,
      category: t('catTax'),
      title: t('tpl.grundsteuer-einspruch.title'),
      desc: t('tpl.grundsteuer-einspruch.desc'),
      deadline: t('tpl.grundsteuer-einspruch.deadline'),
      badge: t('tpl.grundsteuer-einspruch.badge') || undefined,
      law: '§ 347 AO, GrStG',
      slug: 'grundsteuer',
    },
    {
      id: 'jobcenter-widerspruch',
      icon: Users,
      category: t('catSocial'),
      title: t('tpl.jobcenter-widerspruch.title'),
      desc: t('tpl.jobcenter-widerspruch.desc'),
      deadline: t('tpl.jobcenter-widerspruch.deadline'),
      badge: t('tpl.jobcenter-widerspruch.badge') || undefined,
      law: '§ 78 SGG',
      slug: 'jobcenter',
    },
    {
      id: 'rente-widerspruch',
      icon: Clock,
      category: t('catSocial'),
      title: t('tpl.rente-widerspruch.title'),
      desc: t('tpl.rente-widerspruch.desc'),
      deadline: t('tpl.rente-widerspruch.deadline'),
      badge: t('tpl.rente-widerspruch.badge') || undefined,
      law: '§ 78 SGG',
      slug: 'rente',
    },
    {
      id: 'krankenkasse-widerspruch',
      icon: Shield,
      category: t('catSocial'),
      title: t('tpl.krankenkasse-widerspruch.title'),
      desc: t('tpl.krankenkasse-widerspruch.desc'),
      deadline: t('tpl.krankenkasse-widerspruch.deadline'),
      badge: t('tpl.krankenkasse-widerspruch.badge') || undefined,
      law: '§ 78 SGG, § 12 SGB V',
      slug: 'krankenversicherung',
    },
    {
      id: 'pflegegrad-widerspruch',
      icon: Shield,
      category: t('catSocial'),
      title: t('tpl.pflegegrad-widerspruch.title'),
      desc: t('tpl.pflegegrad-widerspruch.desc'),
      deadline: t('tpl.pflegegrad-widerspruch.deadline'),
      badge: t('tpl.pflegegrad-widerspruch.badge') || undefined,
      law: '§ 78 SGG, § 15 SGB XI',
      slug: 'krankenversicherung',
    },
    {
      id: 'elterngeld-widerspruch',
      icon: Users,
      category: t('catSocial'),
      title: t('tpl.elterngeld-widerspruch.title'),
      desc: t('tpl.elterngeld-widerspruch.desc'),
      deadline: t('tpl.elterngeld-widerspruch.deadline'),
      badge: t('tpl.elterngeld-widerspruch.badge') || undefined,
      law: '§§ 1–4 BEEG, § 67 EStG',
      slug: 'jobcenter',
    },
    {
      id: 'kuendigung-widerspruch',
      icon: Briefcase,
      category: t('catEmployment'),
      title: t('tpl.kuendigung-widerspruch.title'),
      desc: t('tpl.kuendigung-widerspruch.desc'),
      deadline: t('tpl.kuendigung-widerspruch.deadline'),
      badge: t('tpl.kuendigung-widerspruch.badge') || undefined,
      law: '§ 4 KSchG',
      slug: 'kuendigung',
      popular: true,
    },
    {
      id: 'mieterhöhung-widerspruch',
      icon: Home,
      category: t('catHousing'),
      title: t('tpl.mieterhöhung-widerspruch.title'),
      desc: t('tpl.mieterhöhung-widerspruch.desc'),
      deadline: t('tpl.mieterhöhung-widerspruch.deadline'),
      badge: t('tpl.mieterhöhung-widerspruch.badge') || undefined,
      law: '§§ 558–558e BGB',
      slug: 'miete',
    },
    {
      id: 'nebenkosten-widerspruch',
      icon: Home,
      category: t('catHousing'),
      title: t('tpl.nebenkosten-widerspruch.title'),
      desc: t('tpl.nebenkosten-widerspruch.desc'),
      deadline: t('tpl.nebenkosten-widerspruch.deadline'),
      badge: t('tpl.nebenkosten-widerspruch.badge') || undefined,
      law: '§ 556 BGB, BetrKV',
      slug: 'miete',
    },
    {
      id: 'maengelanzeige',
      icon: Home,
      category: t('catHousing'),
      title: t('tpl.maengelanzeige.title'),
      desc: t('tpl.maengelanzeige.desc'),
      deadline: t('tpl.maengelanzeige.deadline'),
      badge: t('tpl.maengelanzeige.badge') || undefined,
      law: '§§ 535, 536 BGB',
      slug: 'miete',
    },
    {
      id: 'bussgeld-einspruch',
      icon: AlertTriangle,
      category: t('catConsumer'),
      title: t('tpl.bussgeld-einspruch.title'),
      desc: t('tpl.bussgeld-einspruch.desc'),
      deadline: t('tpl.bussgeld-einspruch.deadline'),
      badge: t('tpl.bussgeld-einspruch.badge') || undefined,
      law: '§ 67 OWiG',
      slug: 'bussgeld',
    },
    {
      id: 'ruecktritt-kaufvertrag',
      icon: FileText,
      category: t('catConsumer'),
      title: t('tpl.ruecktritt-kaufvertrag.title'),
      desc: t('tpl.ruecktritt-kaufvertrag.desc'),
      deadline: t('tpl.ruecktritt-kaufvertrag.deadline'),
      badge: t('tpl.ruecktritt-kaufvertrag.badge') || undefined,
      law: '§§ 437, 440 BGB',
      slug: 'jobcenter',
    },
    {
      id: 'gez-widerspruch',
      icon: AlertTriangle,
      category: t('catConsumer'),
      title: t('tpl.gez-widerspruch.title'),
      desc: t('tpl.gez-widerspruch.desc'),
      deadline: t('tpl.gez-widerspruch.deadline'),
      badge: t('tpl.gez-widerspruch.badge') || undefined,
      law: '§ 9 RBStV',
      slug: 'jobcenter',
    },
    {
      id: 'akteneinsicht',
      icon: FileText,
      category: t('catGeneral'),
      title: t('tpl.akteneinsicht.title'),
      desc: t('tpl.akteneinsicht.desc'),
      deadline: t('tpl.akteneinsicht.deadline'),
      badge: t('tpl.akteneinsicht.badge') || undefined,
      law: '§ 29 VwVfG, § 25 SGB X',
      slug: 'tax',
    },
    {
      id: 'zahlungsaufforderung',
      icon: FileText,
      category: t('catGeneral'),
      title: t('tpl.zahlungsaufforderung.title'),
      desc: t('tpl.zahlungsaufforderung.desc'),
      deadline: t('tpl.zahlungsaufforderung.deadline'),
      badge: t('tpl.zahlungsaufforderung.badge') || undefined,
      law: '§§ 286, 288 BGB',
      slug: 'tax',
    },
  ]

  return (
    <>
      <PublicNav locale={locale} />

      {/* Hero */}
      <section className="py-16 sm:py-20 px-4 bg-gradient-to-b from-[var(--background)] to-[var(--background-subtle)]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Download className="w-4 h-4" />
            {t('heroBadge')}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--foreground)] mb-5 leading-tight">
            {t('heroTitle')}
          </h1>
          <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto leading-relaxed mb-8">
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/einspruch" className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-2xl transition-colors">
              <Zap className="w-4 h-4" />
              {t('heroCtaAi')}
            </Link>
            <a href="#templates" className="inline-flex items-center justify-center gap-2 bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] font-semibold px-6 py-3 rounded-2xl hover:border-[var(--border-strong)] transition-colors">
              {t('heroCtaBrowse')}
            </a>
          </div>
        </div>
      </section>

      {/* Info banner */}
      <section className="border-y border-[var(--border)] bg-brand-50 dark:bg-brand-950/40 py-4 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300">
            <Zap className="w-4 h-4 shrink-0" />
            <span className="font-medium">
              {t('infoBannerTip')}
            </span>
          </div>
          <Link href="/einspruch" className="shrink-0 text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-1">
            {t('infoBannerCta')}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Templates grid */}
      <section id="templates" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Category filter — client-side via anchor is sufficient for now */}
          <div className="flex items-center gap-2 flex-wrap mb-10">
            {categories.map((cat, i) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(i)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
                  ${i === activeCategory
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-strong)]'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {templates.filter((tpl) => activeCategory === 0 || tpl.category === categories[activeCategory]).map((tpl) => {
              const Icon = tpl.icon
              return (
                <div
                  key={tpl.id}
                  className="group bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 flex flex-col gap-4 hover:border-brand-300 hover:shadow-brand transition-all duration-200"
                >
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-brand-50 dark:bg-brand-950 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <h3 className="font-semibold text-[var(--foreground)] leading-snug">{tpl.title}</h3>
                        {tpl.popular && (
                          <span className="shrink-0 text-[10px] bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                            {t('badgePopular')}
                          </span>
                        )}
                        {tpl.badge && (
                          <span className="shrink-0 text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                            {tpl.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-[var(--muted)] bg-[var(--background-subtle)] px-2 py-0.5 rounded-md">{tpl.category}</span>
                        <span className="text-xs text-[var(--muted)]">{tpl.law}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-[var(--muted)] leading-relaxed flex-1">{tpl.desc}</p>

                  {/* Deadline */}
                  <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                    <Clock className="w-3.5 h-3.5 text-brand-500" />
                    <span>{t('deadlineLabel')} <strong className="text-[var(--foreground)]">{tpl.deadline}</strong></span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <Link
                      href={`/vorlagen/${tpl.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      {t('ctaOpenTemplate')}
                    </Link>
                    <Link
                      href={`/einspruch?type=${tpl.slug}`}
                      className="flex items-center justify-center gap-1.5 bg-[var(--background-subtle)] hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] text-sm font-medium px-3.5 py-2.5 rounded-xl transition-colors"
                      title={t('ctaAiTitle')}
                    >
                      <Zap className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-16 px-4 bg-brand-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t('bottomTitle')}
          </h2>
          <p className="text-brand-100 text-lg mb-8 leading-relaxed">
            {t('bottomSubtitle')}
          </p>
          <Link
            href="/einspruch"
            className="inline-flex items-center gap-2 bg-white text-brand-700 hover:bg-brand-50 font-bold px-8 py-4 rounded-2xl transition-colors text-lg"
          >
            <Zap className="w-5 h-5" />
            {t('bottomCta')}
          </Link>
        </div>
      </section>

      <Footer locale={locale} />
    </>
  )
}
