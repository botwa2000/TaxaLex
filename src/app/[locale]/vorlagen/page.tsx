'use client'

import { useState } from 'react'
import { use } from 'react'
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
  const isEN = locale === 'en'
  const [activeCategory, setActiveCategory] = useState(0)

  const categories = isEN
    ? ['All', 'Tax', 'Social Benefits', 'Employment', 'Housing', 'Consumer', 'General']
    : ['Alle', 'Steuer', 'Sozialleistungen', 'Arbeit', 'Wohnen', 'Verbraucher', 'Allgemein']

  const templates = [
    {
      id: 'steuerbescheid-einspruch',
      icon: FileText,
      category: isEN ? 'Tax' : 'Steuer',
      title: isEN ? 'Tax Assessment Objection' : 'Einspruch Steuerbescheid',
      desc: isEN
        ? 'Formal objection against an income tax, trade tax, or property tax assessment under § 347 AO. Includes legal basis, objection grounds, and request for suspension of enforcement.'
        : 'Formeller Einspruch gegen Einkommensteuer-, Gewerbesteuer- oder Grundsteuerbescheid nach § 347 AO. Mit Rechtsgrundlage, Einspruchsgründen und Aussetzungsantrag.',
      deadline: isEN ? '30 days' : '30 Tage',
      law: '§ 347 AO',
      slug: 'tax',
      popular: true,
    },
    {
      id: 'grundsteuer-einspruch',
      icon: MapPin,
      category: isEN ? 'Tax' : 'Steuer',
      title: isEN ? 'Property Tax Objection (2022 Reform)' : 'Einspruch Grundsteuerbescheid (Reform 2022)',
      desc: isEN
        ? 'Challenge your new property tax assessment following the 2022 Grundsteuer reform. Covers errors in land area, Bodenrichtwert, and usage classification.'
        : 'Einspruch gegen den neuen Grundsteuerbescheid nach der Reform 2022. Deckt Fehler bei Grundstücksfläche, Bodenrichtwert und Nutzungsart ab.',
      deadline: isEN ? '30 days' : '30 Tage',
      law: '§ 347 AO, GrStG',
      slug: 'grundsteuer',
      badge: isEN ? 'High demand' : 'Stark gefragt',
    },
    {
      id: 'jobcenter-widerspruch',
      icon: Users,
      category: isEN ? 'Social Benefits' : 'Sozialleistungen',
      title: isEN ? 'Jobcenter Objection (Bürgergeld)' : 'Widerspruch Jobcenter / Bürgergeld',
      desc: isEN
        ? 'Object to rejected or reduced Bürgergeld (citizen income) payments, sanctions, or benefit cuts. Free of charge under § 184 SGG.'
        : 'Widerspruch gegen abgelehnte oder gekürzte Bürgergeld-Leistungen, Sanktionen und Streichungen. Kostenlos nach § 184 SGG.',
      deadline: isEN ? '1 month' : '1 Monat',
      law: '§ 78 SGG',
      slug: 'jobcenter',
    },
    {
      id: 'rente-widerspruch',
      icon: Clock,
      category: isEN ? 'Social Benefits' : 'Sozialleistungen',
      title: isEN ? 'Pension Notice Objection' : 'Widerspruch Rentenbescheid',
      desc: isEN
        ? 'Dispute incorrect pension calculations from Deutsche Rentenversicherung — pension points, insurance periods, child-rearing credits.'
        : 'Widerspruch gegen fehlerhafte Rentenberechnungen der DRV — Rentenpunkte, Versicherungszeiten, Kindererziehungszeiten.',
      deadline: isEN ? '1 month' : '1 Monat',
      law: '§ 78 SGG',
      slug: 'rente',
    },
    {
      id: 'krankenkasse-widerspruch',
      icon: Shield,
      category: isEN ? 'Social Benefits' : 'Sozialleistungen',
      title: isEN ? 'Health Insurance Coverage Objection' : 'Widerspruch Krankenkasse (Leistungsablehnung)',
      desc: isEN
        ? 'Challenge your GKV insurer\'s refusal to cover medication, therapy, medical aids, or specialist referrals. References medical necessity (§ 12 SGB V).'
        : 'Widerspruch gegen die Ablehnung von Medikamenten, Therapien, Hilfsmitteln oder Überweisungen durch die Krankenkasse.',
      deadline: isEN ? '1 month' : '1 Monat',
      law: '§ 78 SGG, § 12 SGB V',
      slug: 'krankenversicherung',
    },
    {
      id: 'pflegegrad-widerspruch',
      icon: Shield,
      category: isEN ? 'Social Benefits' : 'Sozialleistungen',
      title: isEN ? 'Nursing Care Level Objection' : 'Widerspruch Pflegegrad-Einstufung',
      desc: isEN
        ? 'Object to an incorrect nursing care level (Pflegegrad 1–5) assessment by the MDK or Medicproof. Includes points breakdown and appeal of assessment criteria.'
        : 'Widerspruch gegen fehlerhafte Pflegegrad-Einstufung durch MDK oder Medicproof. Mit Punkteaufstellung und Rüge der Begutachtungskriterien.',
      deadline: isEN ? '1 month' : '1 Monat',
      law: '§ 78 SGG, § 15 SGB XI',
      slug: 'krankenversicherung',
    },
    {
      id: 'elterngeld-widerspruch',
      icon: Users,
      category: isEN ? 'Social Benefits' : 'Sozialleistungen',
      title: isEN ? 'Parental Benefit / Child Benefit Objection' : 'Widerspruch Elterngeld / Kindergeld',
      desc: isEN
        ? 'Challenge incorrect calculation or rejection of Elterngeld, ElterngeldPlus, or Kindergeld. References §§ 1–4 BEEG and applicable income calculation rules.'
        : 'Widerspruch gegen fehlerhafte Berechnung oder Ablehnung von Elterngeld, ElterngeldPlus oder Kindergeld.',
      deadline: isEN ? '1 month' : '1 Monat',
      law: '§§ 1–4 BEEG, § 67 EStG',
      slug: 'jobcenter',
    },
    {
      id: 'kuendigung-widerspruch',
      icon: Briefcase,
      category: isEN ? 'Employment' : 'Arbeit',
      title: isEN ? 'Dismissal Objection / Employment Protection' : 'Widerspruch Kündigung (Kündigungsschutz)',
      desc: isEN
        ? 'Object to unfair or socially unjustified dismissal. Includes demand for revocation, notice of employment protection claim, and reference to § 4 KSchG deadline.'
        : 'Widerspruch gegen sozialwidrige oder formell fehlerhafte Kündigung. Mit Aufhebungsaufforderung und Hinweis auf Klagefrist nach § 4 KSchG.',
      deadline: isEN ? '3 weeks' : '3 Wochen',
      law: '§ 4 KSchG',
      slug: 'kuendigung',
      popular: true,
    },
    {
      id: 'mieterhöhung-widerspruch',
      icon: Home,
      category: isEN ? 'Housing' : 'Wohnen',
      title: isEN ? 'Rent Increase Objection' : 'Widerspruch Mieterhöhung',
      desc: isEN
        ? 'Challenge unjustified rent increases above the local reference rent (Mietspiegel), violations of the 20% cap rule, or missing formal requirements.'
        : 'Widerspruch gegen Mieterhöhungen über die ortsübliche Vergleichsmiete, Verstoß gegen die Kappungsgrenze oder Formmängel.',
      deadline: isEN ? '2 months' : '2 Monate',
      law: '§§ 558–558e BGB',
      slug: 'miete',
    },
    {
      id: 'nebenkosten-widerspruch',
      icon: Home,
      category: isEN ? 'Housing' : 'Wohnen',
      title: isEN ? 'Ancillary Cost Statement Objection' : 'Widerspruch Nebenkostenabrechnung',
      desc: isEN
        ? 'Contest incorrect utility cost statements: missing receipts, wrong distribution keys, late delivery, or non-chargeable cost items.'
        : 'Widerspruch gegen fehlerhafte Nebenkostenabrechnung: fehlende Belege, falscher Verteilungsschlüssel, verspätete Zustellung oder nicht umlagefähige Kosten.',
      deadline: isEN ? '12 months' : '12 Monate',
      law: '§ 556 BGB, BetrKV',
      slug: 'miete',
    },
    {
      id: 'maengelanzeige',
      icon: Home,
      category: isEN ? 'Housing' : 'Wohnen',
      title: isEN ? 'Defect Notice to Landlord' : 'Mängelanzeige an Vermieter',
      desc: isEN
        ? 'Formal written notice of apartment defects (mould, heating failure, water damage) with deadline for repair and reference to rent reduction rights under § 536 BGB.'
        : 'Formelle Mängelanzeige (Schimmel, Heizungsausfall, Wasserschaden) mit Fristsetzung und Hinweis auf Mietminderungsrecht nach § 536 BGB.',
      deadline: isEN ? 'Immediately' : 'Sofort',
      law: '§§ 535, 536 BGB',
      slug: 'miete',
    },
    {
      id: 'bussgeld-einspruch',
      icon: AlertTriangle,
      category: isEN ? 'Consumer' : 'Verbraucher',
      title: isEN ? 'Traffic Fine Objection' : 'Einspruch Bußgeldbescheid (Verkehr)',
      desc: isEN
        ? 'Challenge speed camera fines, parking tickets, and driving bans. Covers measurement errors, procedural defects, and driver identification issues.'
        : 'Einspruch gegen Radarfallen-Bußgelder, Parktickets und Fahrverbote. Mit Messfehlern, Verfahrensmängeln und Fahrerfeststellung.',
      deadline: isEN ? '2 weeks' : '2 Wochen',
      law: '§ 67 OWiG',
      slug: 'bussgeld',
    },
    {
      id: 'ruecktritt-kaufvertrag',
      icon: FileText,
      category: isEN ? 'Consumer' : 'Verbraucher',
      title: isEN ? 'Contract Withdrawal (Defective Goods)' : 'Rücktritt Kaufvertrag (Mangel)',
      desc: isEN
        ? 'Withdraw from a purchase contract due to defects after failed repair attempts. References §§ 437, 440 BGB and sets a final repair deadline.'
        : 'Rücktritt vom Kaufvertrag nach fehlgeschlagener Nachbesserung. Referenziert §§ 437, 440 BGB und setzt Nachfrist.',
      deadline: isEN ? '2 years' : '2 Jahre',
      law: '§§ 437, 440 BGB',
      slug: 'jobcenter',
    },
    {
      id: 'gez-widerspruch',
      icon: AlertTriangle,
      category: isEN ? 'Consumer' : 'Verbraucher',
      title: isEN ? 'Broadcasting Fee Objection (GEZ/ARD-ZDF)' : 'Widerspruch Rundfunkbeitrag (GEZ)',
      desc: isEN
        ? 'Object to broadcasting fee assessments: incorrect number of households, exemption eligibility (Bürgergeld recipients, disabled persons), or duplicate billing.'
        : 'Widerspruch gegen Rundfunkbeitragsbescheide: falsche Haushaltszahl, Befreiungsanspruch (Bürgergeld, Behinderung) oder Doppelveranlagung.',
      deadline: isEN ? '1 month' : '1 Monat',
      law: '§ 9 RBStV',
      slug: 'jobcenter',
    },
    {
      id: 'akteneinsicht',
      icon: FileText,
      category: isEN ? 'General' : 'Allgemein',
      title: isEN ? 'Request for File Access' : 'Antrag auf Akteneinsicht',
      desc: isEN
        ? 'Formal request to inspect your administrative file under § 29 VwVfG or § 25 SGB X. Standard for use before filing an objection to understand the authority\'s reasoning.'
        : 'Formeller Antrag auf Akteneinsicht nach § 29 VwVfG oder § 25 SGB X. Standard vor Einspruch, um die Begründung der Behörde zu verstehen.',
      deadline: isEN ? 'Anytime' : 'Jederzeit',
      law: '§ 29 VwVfG, § 25 SGB X',
      slug: 'tax',
    },
    {
      id: 'zahlungsaufforderung',
      icon: FileText,
      category: isEN ? 'General' : 'Allgemein',
      title: isEN ? 'Payment Demand / Formal Notice' : 'Mahnung / Zahlungsaufforderung',
      desc: isEN
        ? 'Professional payment reminder with legal default notice, interest claim under § 288 BGB, and deadline before legal action. Suitable for private and commercial claims.'
        : 'Professionelle Mahnung mit Verzugsschaden, Zinsforderung nach § 288 BGB und Fristsetzung vor gerichtlicher Geltendmachung.',
      deadline: isEN ? 'Immediately' : 'Sofort',
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
            {isEN ? '16 free templates' : '16 kostenlose Vorlagen'}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--foreground)] mb-5 leading-tight">
            {isEN ? 'Legal Letter Templates' : 'Vorlagen für\nRechtliche Schreiben'}
          </h1>
          <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto leading-relaxed mb-8">
            {isEN
              ? 'Download professionally structured templates for the most common administrative objections in Germany — or fill them online with your details and let our AI complete the rest.'
              : 'Laden Sie professionell strukturierte Vorlagen für die häufigsten Verwaltungseinsprüche in Deutschland herunter — oder füllen Sie sie online aus und lassen Sie unsere KI den Rest erledigen.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/einspruch" className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-2xl transition-colors">
              <Zap className="w-4 h-4" />
              {isEN ? 'Generate with AI instead' : 'Lieber mit KI generieren'}
            </Link>
            <a href="#templates" className="inline-flex items-center justify-center gap-2 bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] font-semibold px-6 py-3 rounded-2xl hover:border-[var(--border-strong)] transition-colors">
              {isEN ? 'Browse templates ↓' : 'Vorlagen ansehen ↓'}
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
              {isEN
                ? 'Tip: Use our AI to generate a personalised version — upload your notice and get a letter tailored to your exact case.'
                : 'Tipp: Mit unserer KI erstellen Sie eine individuelle Version — laden Sie Ihren Bescheid hoch und erhalten Sie ein auf Ihren Fall zugeschnittenes Schreiben.'}
            </span>
          </div>
          <Link href="/einspruch" className="shrink-0 text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-1">
            {isEN ? 'Try it free' : 'Kostenlos testen'}
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
                            {isEN ? 'Popular' : 'Beliebt'}
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
                    <span>{isEN ? 'Deadline:' : 'Frist:'} <strong className="text-[var(--foreground)]">{tpl.deadline}</strong></span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <Link
                      href={`/einspruch?type=${tpl.slug}`}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      {isEN ? 'Fill with AI' : 'Mit KI ausfüllen'}
                    </Link>
                    <button
                      className="flex items-center justify-center gap-1.5 bg-[var(--background-subtle)] hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] text-sm font-medium px-3.5 py-2.5 rounded-xl transition-colors"
                      title={isEN ? 'Download blank template (PDF)' : 'Leere Vorlage herunterladen (PDF)'}
                      onClick={() => alert(isEN ? 'PDF download coming soon — use "Fill with AI" for a personalised letter.' : 'PDF-Download kommt bald — nutzen Sie „Mit KI ausfüllen" für ein personalisiertes Schreiben.')}
                    >
                      <Download className="w-4 h-4" />
                    </button>
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
            {isEN ? 'Don\'t see your case? Let AI handle it.' : 'Ihren Fall nicht gefunden? KI übernimmt.'}
          </h2>
          <p className="text-brand-100 text-lg mb-8 leading-relaxed">
            {isEN
              ? 'Upload any official notice — tax, social, employment, or housing — and our AI will analyse it, identify objection grounds, and draft a professional letter in minutes.'
              : 'Laden Sie jeden offiziellen Bescheid hoch — Steuer, Sozial, Arbeit oder Wohnen — und unsere KI analysiert ihn, findet Einspruchsgründe und erstellt in Minuten ein professionelles Schreiben.'}
          </p>
          <Link
            href="/einspruch"
            className="inline-flex items-center gap-2 bg-white text-brand-700 hover:bg-brand-50 font-bold px-8 py-4 rounded-2xl transition-colors text-lg"
          >
            <Zap className="w-5 h-5" />
            {isEN ? 'Start for free' : 'Kostenlos starten'}
          </Link>
        </div>
      </section>

      <Footer locale={locale} />
    </>
  )
}
