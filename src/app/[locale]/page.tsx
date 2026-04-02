import { getTranslations } from 'next-intl/server'
import { PublicNav } from '@/components/PublicNav'
import { Footer } from '@/components/Footer'
import { UserGroupTabs } from '@/components/UserGroupTabs'
import { TrustBadges } from '@/components/TrustBadges'
import { ProcessStep } from '@/components/ProcessStep'
import { StatCard } from '@/components/StatCard'
import { UseCaseCard } from '@/components/UseCaseCard'
import { FAQAccordion } from '@/components/FAQAccordion'
import { PricingCard } from '@/components/PricingCard'
import { getUseCases, getFAQs, getPricingPlans } from '@/lib/contentFallbacks'
import { Upload, Brain, Download, BarChart3, Clock, CheckCircle2, Shield, Zap, Globe, Lock, X, Scale, FileText, MessageSquare } from 'lucide-react'
import { Link } from '@/i18n/navigation'

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const [tHiw, tFeatures, tStats, tUC, tChatbot, tTemplates, tPricing, tFaq, tTrust] = await Promise.all([
    getTranslations({ locale, namespace: 'howItWorks' }),
    getTranslations({ locale, namespace: 'features' }),
    getTranslations({ locale, namespace: 'stats' }),
    getTranslations({ locale, namespace: 'useCases' }),
    getTranslations({ locale, namespace: 'chatbot' }),
    getTranslations({ locale, namespace: 'templates' }),
    getTranslations({ locale, namespace: 'pricing' }),
    getTranslations({ locale, namespace: 'faq' }),
    getTranslations({ locale, namespace: 'trust' }),
  ])

  const useCases = getUseCases(locale)
  const faqs = getFAQs(locale)
  const individualPlans = getPricingPlans('individual')

  const processSteps = [
    { step: 1, icon: Upload, title: tHiw('steps.upload.title'), description: tHiw('steps.upload.description'), detail: tHiw('steps.upload.detail') },
    { step: 2, icon: Brain, title: tHiw('steps.analyze.title'), description: tHiw('steps.analyze.description'), detail: tHiw('steps.analyze.detail') },
    { step: 3, icon: Download, title: tHiw('steps.download.title'), description: tHiw('steps.download.description'), detail: tHiw('steps.download.detail') },
  ]

  const statsItems = [
    { value: tStats('items.objections.value'), label: tStats('items.objections.label'), icon: BarChart3, source: 'BMF Finanzbericht 2023' },
    { value: tStats('items.successRate.value'), label: tStats('items.successRate.label'), icon: CheckCircle2, source: 'BMF Steuerstatistik' },
    { value: tStats('items.deadline.value'), label: tStats('items.deadline.label'), icon: Clock, source: '§ 355 AO' },
    { value: tStats('items.speed.value'), label: tStats('items.speed.label'), icon: Brain, source: tStats('sourceInternal') },
  ]

  const featureItems = [
    { icon: Brain, title: tFeatures('items.multiAi.title'), description: tFeatures('items.multiAi.description') },
    { icon: CheckCircle2, title: tFeatures('items.legal.title'), description: tFeatures('items.legal.description') },
    { icon: Globe, title: tFeatures('items.multilingual.title'), description: tFeatures('items.multilingual.description') },
    { icon: Lock, title: tFeatures('items.privacy.title'), description: tFeatures('items.privacy.description') },
  ]

  const genericBullets = [
    tChatbot('generic1'), tChatbot('generic2'), tChatbot('generic3'),
    tChatbot('generic4'), tChatbot('generic5'), tChatbot('generic6'),
  ]

  const taxalexAgents = [
    { agent: 'Drafter', desc: tChatbot('agentDrafter') },
    { agent: 'Reviewer', desc: tChatbot('agentReviewer') },
    { agent: 'FactChecker', desc: tChatbot('agentFactChecker') },
    { agent: 'Adversary', desc: tChatbot('agentAdversary') },
    { agent: 'Consolidator', desc: tChatbot('agentConsolidator') },
  ]

  return (
    <>
      <PublicNav locale={locale} />

      {/* Hero */}
      <section className="py-20 sm:py-32 px-4 bg-gradient-to-b from-brand-50/60 via-[var(--background)] to-[var(--background)] dark:from-brand-950/30 dark:via-[var(--background)] dark:to-[var(--background)]">
        <div className="max-w-4xl mx-auto">
          <UserGroupTabs locale={locale} />
        </div>
      </section>

      {/* Trust badges strip */}
      <section className="border-y border-[var(--border)] bg-[var(--surface)] py-4 px-4">
        <TrustBadges locale={locale} variant="row" className="max-w-4xl mx-auto" />
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 sm:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-3">
              {tHiw('title')}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4 leading-tight">
              {tHiw('sectionHeading')}
            </h2>
            <p className="text-base sm:text-lg text-[var(--muted)] max-w-xl mx-auto">
              {tHiw('subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {processSteps.map((step) => (
              <ProcessStep
                key={step.step}
                step={step.step}
                icon={step.icon}
                title={step.title}
                description={step.description}
                detail={step.detail}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats — only real, cited statistics */}
      <section className="py-20 bg-[var(--surface)] border-y border-[var(--border)] px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-3">
              {tStats('sectionLabel')}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-3 leading-tight">
              {tStats('sectionHeading')}
            </h2>
            <p className="text-[var(--muted)]">
              {tStats('subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {statsItems.map((s) => (
              <StatCard
                key={s.label}
                value={s.value}
                label={s.label}
                icon={s.icon}
                source={s.source}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Use cases — expandable cards */}
      <section id="use-cases" className="py-20 sm:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-3">
              {tUC('sectionLabel')}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4 leading-tight">
              {tUC('sectionTitle')}
            </h2>
            <p className="text-base text-[var(--muted)] max-w-2xl mx-auto">
              {tUC('sectionSubtitle')}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {useCases.map((uc) => (
              <UseCaseCard key={uc.slug} useCase={uc} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      {/* Why not a generic AI chatbot? */}
      <section className="py-16 sm:py-20 px-4 bg-[var(--background)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
              <MessageSquare className="w-4 h-4" />
              {tChatbot('sectionLabel')}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4">
              {tChatbot('sectionHeading')}
            </h2>
            <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
              {tChatbot('sectionSub')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 items-start">
            {/* Generic AI column */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--foreground)]">{tChatbot('genericTitle')}</h3>
                  <p className="text-sm text-[var(--muted)]">{tChatbot('genericSub')}</p>
                </div>
              </div>
              <ul className="space-y-3">
                {genericBullets.map((text) => (
                  <li key={text} className="flex items-start gap-2.5 text-sm text-[var(--muted)]">
                    <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            {/* TaxaLex column */}
            <div className="bg-brand-50 dark:bg-brand-950/60 border-2 border-brand-200 dark:border-brand-800 rounded-3xl p-6 relative">
              <div className="absolute -top-3 left-6">
                <span className="bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {tChatbot('taxalexLabel')}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900 rounded-xl flex items-center justify-center">
                  <Scale className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--foreground)]">TaxaLex</h3>
                  <p className="text-sm text-brand-600 dark:text-brand-400">{tChatbot('taxalexSub')}</p>
                </div>
              </div>
              <ol className="space-y-3">
                {taxalexAgents.map((item, i) => (
                  <li key={item.agent} className="flex items-start gap-3 text-sm">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                    <span className="text-[var(--foreground)]">
                      <span className="font-semibold">{item.agent}</span>
                      {' — '}
                      <span className="text-[var(--muted)]">{item.desc}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-10 text-center">
            <p className="text-[var(--muted)] mb-4 text-lg">
              {tChatbot('ctaText')}
            </p>
            <Link href="/einspruch" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-4 rounded-2xl transition-colors text-lg">
              <Zap className="w-5 h-5" />
              {tChatbot('ctaButton')}
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-[var(--surface)] border-y border-[var(--border)] px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-3">
              {tFeatures('title')}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4 leading-tight">
              {tFeatures('sectionHeading')}
            </h2>
            <p className="text-base text-[var(--muted)] max-w-xl mx-auto">
              {tFeatures('subtitle')}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {featureItems.map((f) => (
              <div key={f.title} className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-brand-50 dark:bg-brand-950 rounded-2xl flex items-center justify-center shrink-0">
                  <f.icon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--foreground)] mb-2">{f.title}</h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates teaser */}
      <section className="py-14 px-4 bg-[var(--surface)] border-y border-[var(--border)]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-sm font-semibold px-3 py-1 rounded-full mb-4">
              <FileText className="w-3.5 h-3.5" />
              {tTemplates('sectionLabel')}
            </div>
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">
              {tTemplates('sectionHeading')}
            </h2>
            <p className="text-[var(--muted)] leading-relaxed mb-5">
              {tTemplates('description')}
            </p>
            <Link
              href="/vorlagen"
              className="inline-flex items-center gap-2 font-semibold text-brand-600 dark:text-brand-400 hover:underline text-lg"
            >
              {tTemplates('cta')}
              <FileText className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0">
            {[tTemplates('name1'), tTemplates('name2'), tTemplates('name3'), tTemplates('name4')].map((name) => (
              <div key={name} className="bg-[var(--background-subtle)] rounded-xl px-4 py-3 text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-500 shrink-0" />
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing — individual plans preview */}
      <section id="pricing" className="py-20 sm:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-3">
              {tPricing('sectionLabel')}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4 leading-tight">
              {tPricing('sectionHeading')}
            </h2>
            <p className="text-base text-[var(--muted)]">
              {tPricing('sectionSub')}
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            {individualPlans.map((plan) => (
              <PricingCard key={plan.slug} plan={plan} locale={locale} />
            ))}
          </div>
          <div className="text-center">
            <Link
              href="/preise"
              className="text-sm text-brand-600 hover:underline underline-offset-2 dark:text-brand-400"
            >
              {tPricing('viewAll')}
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-[var(--surface)] border-y border-[var(--border)] px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-3">
              Support
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4 leading-tight">
              {tFaq('title')}
            </h2>
            <p className="text-base text-[var(--muted)]">
              {tFaq('subtitle')}
            </p>
          </div>
          <FAQAccordion faqs={faqs} locale={locale} />
        </div>
      </section>

      {/* Legal disclaimer */}
      <section className="py-10 px-4 bg-[var(--surface)] border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-brand-600" />
            <p className="text-sm font-medium text-[var(--foreground)]">
              {tTrust('legalHeading')}
            </p>
          </div>
          <p className="text-sm text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
            {tTrust('disclaimer')}
          </p>
        </div>
      </section>

      <Footer locale={locale} />
    </>
  )
}
