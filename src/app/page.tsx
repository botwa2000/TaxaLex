import Link from 'next/link'
import {
  ArrowRight,
  Upload,
  Cpu,
  FileCheck,
  CheckCircle2,
  Shield,
  Clock,
  ChevronRight,
  Star,
  Building2,
  Wallet,
  HeartPulse,
  Briefcase,
  Home,
  Car,
  Scale,
  Zap,
  TrendingUp,
  Users,
  Sparkles,
  Quote,
} from 'lucide-react'
import { brand } from '@/config/brand'
import { Logo } from '@/components/Logo'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Navigation ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo size="md" />

          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#wie-es-funktioniert"
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Wie es funktioniert
            </a>
            <a
              href="#anwendungsfaelle"
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Anwendungsfälle
            </a>
            <a
              href="#preise"
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Preise
            </a>
            <a
              href="#faq"
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm font-medium text-[var(--foreground)] hover:text-brand-600 transition-colors px-3 py-1.5"
            >
              Anmelden
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
            >
              Kostenlos starten
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5" />5 KI-Agenten · Juristisch geprüft ·
              DSGVO-konform
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-[var(--foreground)] leading-tight mb-5 text-balance">
              Bescheid bekommen?{' '}
              <span className="text-brand-600">Einspruch einlegen.</span> In Minuten.
            </h1>

            <p className="text-lg text-[var(--muted)] mb-8 leading-relaxed">
              Unser Multi-KI-System analysiert Ihren Bescheid, identifiziert
              Schwachstellen und schreibt einen juristisch fundierten Einspruch —
              automatisch, auf Deutsch, einreichbereit.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link
                href="/einspruch"
                className="inline-flex items-center justify-center gap-2 bg-brand-600 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-brand-700 transition-colors text-base"
              >
                Jetzt Einspruch erstellen
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 border border-[var(--border)] text-[var(--foreground)] font-medium px-6 py-3.5 rounded-xl hover:bg-gray-50 transition-colors text-base"
              >
                Anmelden
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-sm text-[var(--muted)]">
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span>4,8 / 5 · 1.200+ Bewertungen</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                <span>Keine Kreditkarte erforderlich</span>
              </div>
            </div>
          </div>

          {/* Right: product UI mockup */}
          <div className="relative hidden lg:block">
            {/* Browser chrome card */}
            <div
              className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden"
              style={{ boxShadow: 'var(--shadow-xl)' }}
            >
              {/* Browser bar */}
              <div className="bg-gray-50 border-b border-[var(--border)] px-4 py-2.5 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 bg-white border border-[var(--border)] rounded-md px-3 py-1 text-[11px] text-[var(--muted)] text-center">
                  taxalex.de/einspruch
                </div>
              </div>

              {/* App content */}
              <div className="p-5">
                {/* Step indicator */}
                <div className="flex items-center gap-0.5 mb-5 text-[10px] font-medium">
                  {[
                    { label: 'Hochladen', done: true },
                    { label: 'Rückfragen', done: true },
                    { label: 'KI-Analyse', active: true, done: false },
                    { label: 'Ergebnis', done: false, active: false },
                  ].map((s, i) => (
                    <div
                      key={s.label}
                      className="flex items-center gap-0.5 flex-1 min-w-0"
                    >
                      <span
                        className={`whitespace-nowrap truncate ${
                          s.done
                            ? 'text-brand-600'
                            : s.active
                              ? 'text-brand-700 font-semibold'
                              : 'text-gray-300'
                        }`}
                      >
                        {s.done ? '✓ ' : ''}
                        {s.label}
                      </span>
                      {i < 3 && (
                        <div
                          className={`flex-1 h-px mx-1 ${s.done ? 'bg-brand-400' : 'bg-gray-200'}`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Spinner + status */}
                <div className="text-center mb-4">
                  <div className="w-9 h-9 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin mx-auto mb-2" />
                  <p className="font-semibold text-sm text-[var(--foreground)]">
                    Multi-KI-Analyse läuft...
                  </p>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">
                    Faktencheck läuft… (Perplexity)
                  </p>
                </div>

                {/* Agent progress */}
                <div className="space-y-1.5">
                  {[
                    { label: 'Entwurf erstellen', provider: 'Claude', done: true },
                    { label: 'Fehlerprüfung', provider: 'Gemini', done: true },
                    {
                      label: 'Faktencheck',
                      provider: 'Perplexity',
                      active: true,
                      done: false,
                    },
                    {
                      label: 'Finanzamt-Prüfung',
                      provider: 'Claude',
                      done: false,
                      active: false,
                    },
                    {
                      label: 'Konsolidierung',
                      provider: 'Claude',
                      done: false,
                      active: false,
                    },
                  ].map((agent) => (
                    <div
                      key={agent.label}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] ${
                        agent.done
                          ? 'bg-green-50'
                          : agent.active
                            ? 'bg-brand-50 border border-brand-100'
                            : 'bg-gray-50'
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          agent.done
                            ? 'bg-green-500'
                            : agent.active
                              ? 'bg-brand-500 animate-pulse'
                              : 'bg-gray-300'
                        }`}
                      />
                      <span
                        className={
                          agent.done
                            ? 'text-green-700 flex-1'
                            : agent.active
                              ? 'text-brand-700 font-medium flex-1'
                              : 'text-gray-400 flex-1'
                        }
                      >
                        {agent.label}
                      </span>
                      <span
                        className={`text-[10px] ${
                          agent.done
                            ? 'text-green-500'
                            : agent.active
                              ? 'text-brand-400'
                              : 'text-gray-300'
                        }`}
                      >
                        {agent.provider}
                        {agent.done && ' ✓'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating success badge */}
            <div
              className="absolute -bottom-5 -left-6 bg-white border border-[var(--border)] rounded-xl px-4 py-3 flex items-center gap-3"
              style={{ boxShadow: 'var(--shadow-lg)' }}
            >
              <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--foreground)]">
                  Einspruch fertig
                </p>
                <p className="text-[11px] text-[var(--muted)]">in 4 min 12 sek</p>
              </div>
            </div>

            {/* Floating rating badge */}
            <div
              className="absolute -top-4 -right-4 bg-white border border-[var(--border)] rounded-xl px-3 py-2.5 flex items-center gap-2"
              style={{ boxShadow: 'var(--shadow-lg)' }}
            >
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs font-semibold text-[var(--foreground)]">4,8</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div className="border-y border-[var(--border)] bg-[var(--background)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-0 sm:divide-x sm:divide-[var(--border)]">
            {[
              { icon: TrendingUp, value: '3,3 Mio.', label: 'Einsprüche pro Jahr in DE' },
              {
                icon: CheckCircle2,
                value: '66 %',
                label: 'Erfolgsquote bei Einsprüchen',
              },
              { icon: Zap, value: '< 5 min', label: 'bis zum fertigen Einspruch' },
              { icon: Users, value: '1.200+', label: 'zufriedene Nutzer' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 sm:px-6 first:pl-0 last:pr-0"
              >
                <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                  <stat.icon className="w-4.5 h-4.5 w-[18px] h-[18px] text-brand-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-[var(--foreground)] leading-none">
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── How it works ── */}
      <section id="wie-es-funktioniert" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--foreground)] mb-3">
              In 3 Schritten zum fertigen Einspruch
            </h2>
            <p className="text-[var(--muted)]">
              Ohne Anwalt. Ohne Fachwissen. Ohne Zeitverlust.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* connector lines on md+ */}
            <div className="hidden md:block absolute top-8 left-[calc(33%+24px)] right-[calc(33%+24px)] h-px bg-gradient-to-r from-brand-200 to-brand-200" />

            {[
              {
                icon: Upload,
                step: '01',
                title: 'Bescheid hochladen',
                desc: 'Laden Sie Ihren Bescheid und relevante Unterlagen hoch (PDF, Foto, DOCX). Unser System erkennt automatisch Typ und Inhalt.',
                color: 'bg-blue-50 text-blue-600',
                border: 'border-blue-100',
              },
              {
                icon: Cpu,
                step: '02',
                title: 'KI analysiert & schreibt',
                desc: '5 spezialisierte KI-Agenten prüfen, recherchieren und formulieren: Drafter, Reviewer, Fact-Checker, Adversary, Consolidator.',
                color: 'bg-purple-50 text-purple-600',
                border: 'border-purple-100',
              },
              {
                icon: FileCheck,
                step: '03',
                title: 'Herunterladen & einreichen',
                desc: 'Laden Sie den fertigen Einspruch als PDF herunter — juristisch korrekt, fristgerecht formuliert, direkt einreichbereit.',
                color: 'bg-green-50 text-green-600',
                border: 'border-green-100',
              },
            ].map((item) => (
              <div
                key={item.step}
                className={`relative bg-white rounded-2xl border ${item.border} p-6`}
                style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                <div className="absolute -top-3.5 left-5 bg-white border border-[var(--border)] rounded-full px-2.5 py-0.5 text-xs font-mono font-semibold text-[var(--muted)]">
                  {item.step}
                </div>
                <div
                  className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4 mt-2`}
                >
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-[var(--foreground)] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Use cases ── */}
      <section
        id="anwendungsfaelle"
        className="bg-[var(--background)] border-y border-[var(--border)] py-20"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--foreground)] mb-3">
              Für jeden Bescheid der richtige Einspruch
            </h2>
            <p className="text-[var(--muted)] max-w-xl mx-auto">
              Ob Steuer, Sozialleistungen oder Arbeit — TaxaLex erstellt den passenden
              Einspruch mit den richtigen Rechtsgrundlagen. Wählen Sie Ihren Fall.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: Building2,
                label: 'Einspruch gegen Steuerbescheid',
                law: '§ 347 AO',
                deadline: '1 Monat nach Bekanntgabe',
                badge: 'Häufigster Fall',
                href: '/einspruch?type=tax',
                desc: 'Jährlich erhalten Millionen Deutsche einen fehlerhaften Steuerbescheid — sei es wegen nicht anerkannter Werbungskosten, falsch berechneter Einkünfte oder übergangener Sonderausgaben. Ein Einspruch nach § 347 AO hemmt die Vollziehung und zwingt das Finanzamt zur erneuten Prüfung. Häufige Einspruchsgründe: Homeoffice-Pauschale abgelehnt, doppelte Haushaltsführung nicht berücksichtigt, Handwerkerleistungen falsch veranlagt.',
              },
              {
                icon: Wallet,
                label: 'Widerspruch gegen Jobcenter-Bescheid',
                law: '§ 83 SGG',
                deadline: '1 Monat nach Bekanntgabe',
                badge: null,
                href: '/einspruch?type=jobcenter',
                desc: 'Bürgergeld-Bescheide des Jobcenters enthalten häufig Fehler bei der Berechnung von Unterkunftskosten, der Anrechnung von Einkommen oder der Verhängung von Leistungsminderungen (Sanktionen). Ein Widerspruch nach § 83 SGG ist kostenlos und kann die Auszahlung sichern. Besonders häufig: zu niedrig berechnetes Bürgergeld, nicht anerkannte Nebeneinkommen, fehlerhafte Kostenübernahme für Wohnung.',
              },
              {
                icon: Shield,
                label: 'Widerspruch gegen Rentenbescheid',
                law: '§ 78 SGG',
                deadline: '1 Monat nach Bekanntgabe',
                badge: null,
                href: '/einspruch?type=rente',
                desc: 'Die Deutsche Rentenversicherung macht bei der Berechnung von Rentenansprüchen regelmäßig Fehler — fehlende Beitragsjahre, falsch bewertete Ausbildungszeiten oder nicht anerkannte Pflege- und Erziehungszeiten führen zu einer zu niedrigen Rente. Ein Widerspruch nach § 78 SGG kann rückwirkend zu Nachzahlungen führen. Auch Erwerbsminderungsrenten werden häufig zu Unrecht abgelehnt.',
              },
              {
                icon: HeartPulse,
                label: 'Widerspruch gegen Krankenkassen-Bescheid',
                law: '§ 83 SGG',
                deadline: '1 Monat nach Bekanntgabe',
                badge: null,
                href: '/einspruch?type=krankenversicherung',
                desc: 'Krankenkassen lehnen Leistungsanträge oft mit pauschalen Ablehnungsschreiben ab — Reha-Maßnahmen, Hilfsmittel, Medikamente oder spezielle Therapien werden ohne ausreichende Begründung verweigert. Nach § 83 SGG haben Versicherte das Recht auf Widerspruch. Wird dieser nicht innerhalb von fünf Wochen beschieden, gilt er als genehmigt (§ 13 Abs. 3a SGB V — die sogenannte Genehmigungsfiktion).',
              },
              {
                icon: Car,
                label: 'Einspruch gegen Bußgeldbescheid',
                law: '§ 67 OWiG',
                deadline: '2 Wochen nach Zustellung',
                badge: null,
                href: '/einspruch?type=bussgeld',
                desc: 'Bußgeldbescheide wegen Geschwindigkeitsübertretungen, Rotlichtverstößen oder Parkvergehen sind häufig anfechtbar — Messfehler, fehlerhafte Fahreridentifikation oder formale Mängel im Bescheid können zur Einstellung führen. Der Einspruch nach § 67 OWiG muss schriftlich innerhalb von zwei Wochen eingelegt werden. Bei Erfolg entfallen Bußgeld, Punkte in Flensburg und Fahrverbote.',
              },
              {
                icon: Briefcase,
                label: 'Klage gegen Kündigung',
                law: '§ 4 KSchG',
                deadline: '3 Wochen nach Zugang der Kündigung',
                badge: 'Neu',
                href: '/einspruch?type=kuendigung',
                desc: 'Eine Kündigung ist nur wirksam, wenn sie sozial gerechtfertigt ist (§ 1 KSchG), die Sozialauswahl korrekt durchgeführt wurde und alle Formvorschriften eingehalten sind. Die Kündigungsschutzklage muss innerhalb von drei Wochen beim Arbeitsgericht eingereicht werden — diese Frist ist absolut. TaxaLex erstellt das Klageschreiben mit allen relevanten Einwänden, z. B. fehlende Betriebsratsbeteiligung, falsche Sozialauswahl oder fehlender Kündigungsgrund.',
              },
              {
                icon: Home,
                label: 'Widerspruch gegen Mieterhöhung oder Kautionsabzug',
                law: '§ 558 BGB',
                deadline: '2 Monate nach Zugang (Mieterhöhung)',
                badge: null,
                href: '/einspruch?type=miete',
                desc: 'Vermieter dürfen die Miete nur im Rahmen der ortsüblichen Vergleichsmiete erhöhen (§ 558 BGB) und müssen dabei den Mietspiegel korrekt anwenden. Viele Mieterhöhungen enthalten formale Fehler oder überschreiten die Kappungsgrenze. Bei Kautionsabrechnungen werden Abzüge oft ohne ausreichenden Nachweis vorgenommen. TaxaLex prüft die Rechtsgrundlage und formuliert den Widerspruch präzise und fristgerecht.',
              },
              {
                icon: Scale,
                label: 'Widerspruch gegen sonstige Bescheide',
                law: 'Allgemein (VwGO / SGB)',
                deadline: 'Je nach Bescheid (i. d. R. 1 Monat)',
                badge: null,
                href: '/einspruch?type=sonstige',
                desc: 'Behördliche Bescheide betreffen viele Lebensbereiche: BAföG-Ablehnungen, Führerscheinentzug, Baugenehmigungen, GEZ-Beitragsbescheide, Elterngeld oder Pflegegradentscheidungen. In jedem Fall gilt: Bescheide sind nicht automatisch rechtmäßig, und ein Widerspruch lohnt sich häufig. TaxaLex analysiert den Bescheid, identifiziert Angriffspunkte und erstellt ein rechtlich fundiertes Schreiben für Ihre individuelle Situation.',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white border border-[var(--border)] rounded-2xl p-6 flex flex-col gap-4 hover:border-brand-200 transition-colors"
                style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-brand-50 border border-brand-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="w-5 h-5 text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h3 className="font-semibold text-[var(--foreground)] text-sm leading-snug">
                        {item.label}
                      </h3>
                      {item.badge && (
                        <span className="text-[10px] font-semibold bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[var(--muted)]">
                      <span className="font-mono">{item.law}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Frist: {item.deadline}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-[var(--muted)] leading-relaxed">{item.desc}</p>

                {/* CTA */}
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors mt-auto"
                >
                  Einspruch erstellen
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust (dark) ── */}
      <section className="bg-[var(--foreground)] py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Warum {brand.name}?</h2>
            <p className="text-brand-200">Professionelle Qualität. Keine Kompromisse.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Cpu,
                title: '5 KI-Agenten',
                desc: 'Drafter, Reviewer, Fact-Checker, Adversary und Consolidator arbeiten zusammen für das beste Ergebnis.',
              },
              {
                icon: CheckCircle2,
                title: 'Juristisch geprüft',
                desc: 'Alle Gesetzeszitate und BFH-Urteile werden per Echtzeit-Recherche automatisch verifiziert.',
              },
              {
                icon: Clock,
                title: 'Fristgerecht',
                desc: 'Automatische Fristen-Berechnung und E-Mail-Erinnerungen — damit Sie keine Frist verpassen.',
              },
              {
                icon: Shield,
                title: 'DSGVO-konform',
                desc: 'Verschlüsselte Verarbeitung. Keine dauerhafte Speicherung persönlicher Daten ohne Ihre Zustimmung.',
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-brand-200 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--foreground)] mb-3">
              Was unsere Nutzer sagen
            </h2>
            <p className="text-[var(--muted)]">Echte Erfahrungen — echte Ergebnisse.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Thomas K.',
                role: 'Freiberufler, München',
                text: 'Ich hätte nie gedacht, dass ich meinen Steuerbescheid selbst anfechten kann. Der Einspruch war in 6 Minuten fertig — juristisch korrekt und mit allen Paragrafen. Das Finanzamt hat stattgegeben.',
                stars: 5,
                tag: 'Steuerbescheid',
              },
              {
                name: 'Amira S.',
                role: 'Arbeitssuchende, Berlin',
                text: 'Nach dem Jobcenter-Bescheid wusste ich nicht weiter. TaxaLex hat den Widerspruch automatisch generiert und mir erklärt, was das Amt falsch gemacht hat. Absolut empfehlenswert.',
                stars: 5,
                tag: 'Jobcenter',
              },
              {
                name: 'Markus R.',
                role: 'Rentner, Hamburg',
                text: 'Einfach, schnell, verständlich. Der Einspruch gegen meinen Rentenbescheid war in wenigen Minuten fertig. Die KI hat sogar auf aktuelle BFH-Urteile verwiesen, die ich nie selbst gefunden hätte.',
                stars: 5,
                tag: 'Rentenbescheid',
              },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-white border border-[var(--border)] rounded-2xl p-6 flex flex-col gap-4"
                style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                <Quote className="w-6 h-6 text-brand-200 shrink-0" />
                <p className="text-sm text-[var(--foreground)] leading-relaxed flex-1">
                  {t.text}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-sm font-bold">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[var(--foreground)]">
                        {t.name}
                      </p>
                      <p className="text-[11px] text-[var(--muted)]">{t.role}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex">
                      {[...Array(t.stars)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-medium bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
                      {t.tag}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section
        id="preise"
        className="bg-[var(--background)] border-t border-[var(--border)] py-20"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--foreground)] mb-3">
              Zahlen Sie nur, wenn Sie es brauchen
            </h2>
            <p className="text-[var(--muted)] max-w-xl mx-auto">
              Die meisten Menschen legen einen Einspruch alle paar Jahre ein — kein Abo
              erforderlich. Für Berater und Kanzleien gibt es eine Flatrate.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: 'Einzelfall',
                audience: 'Privatpersonen',
                price: '5,99 €',
                period: 'pro Einspruch',
                badge: null,
                desc: 'Einmalig zahlen, einmalig nutzen — ideal wenn Sie selten einen Bescheid anfechten.',
                features: [
                  'Ein vollständiger Einspruch',
                  'Alle Bescheid-Typen',
                  'PDF- & TXT-Download',
                  '5 KI-Agenten',
                  '30 Tage Zugriff auf den Entwurf',
                ],
                cta: 'Jetzt erstellen',
                href: '/einspruch',
                highlight: false,
              },
              {
                name: '5er-Paket',
                audience: 'Selbstständige & Familien',
                price: '19,99 €',
                period: 'einmalig',
                badge: 'Beliebteste Wahl',
                desc: 'Für Selbstständige oder wenn mehrere Bescheide im Haushalt anfallen.',
                features: [
                  '5 Einsprüche ohne Ablaufdatum',
                  'Alle Bescheid-Typen',
                  'PDF- & TXT-Download',
                  'Frist-Erinnerungen per E-Mail',
                  'Dokumenten-Archiv',
                  'Prioritäts-Support',
                ],
                cta: 'Paket kaufen',
                href: '/register?plan=pack',
                highlight: true,
              },
              {
                name: 'Profi-Flatrate',
                audience: 'Berater & Kanzleien',
                price: '49 €',
                period: 'pro Monat',
                badge: null,
                desc: 'Unbegrenzte Nutzung für Steuerberater, Sozialberater und Rechtsanwälte.',
                features: [
                  'Unbegrenzte Einsprüche',
                  'Alle Bescheid-Typen',
                  'Bis zu 5 Teammitglieder',
                  'Mandanten-Verwaltung',
                  'API-Zugang',
                  'SLA & dedizierter Support',
                ],
                cta: 'Profi-Zugang anfragen',
                href: '/register?plan=profi',
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-6 flex flex-col ${
                  plan.highlight
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-[var(--border)] bg-white'
                }`}
                style={{
                  boxShadow: plan.highlight
                    ? '0 8px 32px -4px rgba(0,112,196,0.35)'
                    : 'var(--shadow-sm)',
                }}
              >
                <div className="mb-5">
                  {plan.badge && (
                    <span className="text-xs font-semibold bg-white/20 text-white px-2.5 py-1 rounded-full mb-3 inline-block">
                      {plan.badge}
                    </span>
                  )}
                  <p
                    className={`text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${plan.highlight ? 'text-brand-200' : 'text-[var(--muted)]'}`}
                  >
                    {plan.audience}
                  </p>
                  <p
                    className={`font-bold text-lg mb-1 ${plan.highlight ? 'text-white' : 'text-[var(--foreground)]'}`}
                  >
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span
                      className={`text-3xl font-bold ${plan.highlight ? 'text-white' : 'text-[var(--foreground)]'}`}
                    >
                      {plan.price}
                    </span>
                    <span
                      className={`text-sm ${plan.highlight ? 'text-brand-100' : 'text-[var(--muted)]'}`}
                    >
                      {plan.period}
                    </span>
                  </div>
                  <p
                    className={`text-xs leading-relaxed ${plan.highlight ? 'text-brand-100' : 'text-[var(--muted)]'}`}
                  >
                    {plan.desc}
                  </p>
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 mt-0.5 ${plan.highlight ? 'text-brand-200' : 'text-brand-600'}`}
                      />
                      <span
                        className={
                          plan.highlight ? 'text-white/90' : 'text-[var(--foreground)]'
                        }
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`w-full text-center py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    plan.highlight
                      ? 'bg-white text-brand-600 hover:bg-brand-50'
                      : 'bg-brand-600 text-white hover:bg-brand-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-[var(--muted)] mt-8">
            Keine versteckten Kosten · Sichere Zahlung via Stripe · Kein Abo beim
            Einzelfall und 5er-Paket
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--foreground)] mb-3">
              Häufige Fragen
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Ist ein KI-generierter Einspruch rechtlich bindend?',
                a: 'Der generierte Einspruch ist ein vollständiger Entwurf auf Basis der deutschen Rechtslage. Sie müssen ihn nur unterschreiben und fristgerecht einreichen. Bei komplexen Fällen empfehlen wir zusätzlich die Beratung durch einen Steuerberater oder Rechtsanwalt.',
              },
              {
                q: 'Welche Fristen muss ich beachten?',
                a: 'Bei Steuerbescheiden: 1 Monat nach Bekanntgabe (§ 355 AO). Bei Jobcenter-Bescheiden: 1 Monat (§ 84 SGG). Bei Bußgeldbescheiden: 2 Wochen (§ 67 OWiG). Unser System berechnet Ihre Frist automatisch und erinnert Sie per E-Mail.',
              },
              {
                q: 'Wie sicher sind meine Daten?',
                a: 'Ihre Daten werden verschlüsselt übertragen (TLS 1.3) und nach der Verarbeitung nicht dauerhaft gespeichert. Wir halten alle DSGVO-Anforderungen (Art. 17, 20) ein. Keine persönlichen Daten werden in Produktion geloggt.',
              },
              {
                q: 'Kann ich den Einspruch vor dem Einreichen bearbeiten?',
                a: 'Ja. Der generierte Entwurf ist vollständig bearbeitbar. Sie können im Einspruch-Editor den Text anpassen, bevor Sie ihn herunterladen und einreichen.',
              },
              {
                q: 'Was passiert, wenn mein Einspruch abgelehnt wird?',
                a: 'Falls Ihr Einspruch abgelehnt wird, unterstützen wir Sie bei der nächsten Stufe: Klage beim Finanzgericht (Steuersachen) oder Sozialgericht. Im Business-Plan können Sie sich direkt mit einem Rechtsanwalt verbinden.',
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group bg-white border border-[var(--border)] rounded-xl"
              >
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none font-medium text-sm text-[var(--foreground)]">
                  {item.q}
                  <ChevronRight className="w-4 h-4 text-[var(--muted)] group-open:rotate-90 transition-transform shrink-0 ml-4" />
                </summary>
                <div className="px-5 pb-5 text-sm text-[var(--muted)] leading-relaxed border-t border-[var(--border)] pt-4">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-[var(--background)] border-t border-[var(--border)] py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Zap className="w-3.5 h-3.5" />
            Jetzt kostenlos starten — keine Kreditkarte erforderlich
          </div>
          <h2 className="text-3xl font-bold text-[var(--foreground)] mb-4">
            Bereit, Ihren Bescheid anzufechten?
          </h2>
          <p className="text-[var(--muted)] mb-8 leading-relaxed">
            Erstellen Sie Ihren ersten Einspruch in unter 5 Minuten. Kostenlos,
            DSGVO-konform, juristisch fundiert.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/einspruch"
              className="inline-flex items-center justify-center gap-2 bg-brand-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-brand-700 transition-colors text-base"
            >
              Kostenlos starten
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 border border-[var(--border)] text-[var(--foreground)] font-medium px-8 py-4 rounded-xl hover:bg-white transition-colors text-base"
            >
              Zum Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--border)] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid sm:grid-cols-4 gap-8 mb-10">
            <div>
              <Logo size="md" />
              <p className="text-xs text-[var(--muted)] mt-3 leading-relaxed max-w-[180px]">
                KI-gestützte Einspruchs- und Widerspruchsschreiben für Deutschland.
              </p>
            </div>
            <div>
              <p className="font-semibold text-sm text-[var(--foreground)] mb-4">
                Produkt
              </p>
              <ul className="space-y-2.5 text-sm text-[var(--muted)]">
                <li>
                  <Link
                    href="/einspruch"
                    className="hover:text-[var(--foreground)] transition-colors"
                  >
                    Einspruch erstellen
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#preise"
                    className="hover:text-[var(--foreground)] transition-colors"
                  >
                    Preise
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#wie-es-funktioniert"
                    className="hover:text-[var(--foreground)] transition-colors"
                  >
                    Wie es funktioniert
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#faq"
                    className="hover:text-[var(--foreground)] transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-sm text-[var(--foreground)] mb-4">
                Rechtliches
              </p>
              <ul className="space-y-2.5 text-sm text-[var(--muted)]">
                <li>
                  <Link
                    href="/impressum"
                    className="hover:text-[var(--foreground)] transition-colors"
                  >
                    Impressum
                  </Link>
                </li>
                <li>
                  <Link
                    href="/datenschutz"
                    className="hover:text-[var(--foreground)] transition-colors"
                  >
                    Datenschutz
                  </Link>
                </li>
                <li>
                  <Link
                    href="/agb"
                    className="hover:text-[var(--foreground)] transition-colors"
                  >
                    AGB
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-sm text-[var(--foreground)] mb-4">Konto</p>
              <ul className="space-y-2.5 text-sm text-[var(--muted)]">
                <li>
                  <Link
                    href="/login"
                    className="hover:text-[var(--foreground)] transition-colors"
                  >
                    Anmelden
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="hover:text-[var(--foreground)] transition-colors"
                  >
                    Registrieren
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-[var(--foreground)] transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[var(--muted)]">
              © {new Date().getFullYear()} {brand.name}. Alle Rechte vorbehalten.
            </p>
            <p className="text-xs text-[var(--muted)]">
              Kein Rechtsrat im Sinne des RDG. Alle Angaben ohne Gewähr.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
