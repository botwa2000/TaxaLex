import { PublicNav } from '@/components/PublicNav'
import { Footer } from '@/components/Footer'
import { Link } from '@/i18n/navigation'
import {
  FileText, Users, Clock, AlertTriangle, Shield, Briefcase,
  Home, MapPin, ArrowRight, Zap, CheckCircle2, Scale,
} from 'lucide-react'

const USE_CASES = [
  {
    id: 'tax',
    icon: FileText,
    iconBg: 'bg-blue-50 dark:bg-blue-950',
    iconColor: 'text-blue-600 dark:text-blue-400',
    titleDE: 'Steuerbescheid',
    titleEN: 'Tax Assessment',
    descDE: 'Das Finanzamt hat Ihnen einen Steuerbescheid geschickt und Sie sind mit der Festsetzung nicht einverstanden? Ein Einspruch nach § 347 AO ist die rechtliche Möglichkeit, innerhalb von 30 Tagen zu widersprechen. Häufige Fehler in Bescheiden: falsch berechnete Werbungskosten, nicht anerkannte Sonderausgaben, fehlende Steuerermäßigungen oder Berechnungsfehler beim Solidaritätszuschlag.',
    descEN: 'Received a tax assessment you disagree with? An objection under § 347 AO is the legal mechanism to challenge it within 30 days. Common errors: miscalculated work expenses, rejected special expenses, missing tax credits, or solidarity surcharge errors.',
    law: '§ 347 AO',
    deadlineDE: '30 Tage ab Zustellung',
    deadlineEN: '30 days from delivery',
    successDE: '67 % teilweise oder vollständig erfolgreich',
    successEN: '67% partially or fully successful',
    sourceDE: 'BMF Steuerstatistik',
    sourceEN: 'BMF Tax Statistics',
    tipDE: 'Einspruch auch ohne Begründung einlegen — Begründung kann nachgereicht werden.',
    tipEN: 'File objection even without grounds — reasoning can be submitted later.',
    slug: 'tax',
  },
  {
    id: 'grundsteuer',
    icon: MapPin,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    titleDE: 'Grundsteuerbescheid (Reform 2022)',
    titleEN: 'Property Tax (2022 Reform)',
    descDE: 'Seit der Grundsteuerreform 2022 haben Millionen Eigentümer neue Bescheide erhalten. Häufige Fehler: falsche Grundstücksfläche, unzutreffender Bodenrichtwert, falsche Nutzungsart oder fehlerhafte Gebäudedaten. Ein Einspruch lohnt sich besonders jetzt, solange die Verwaltung viele neue Bescheide bearbeitet und Fehlerquoten hoch sind.',
    descEN: 'Since the 2022 property tax reform, millions of property owners received new assessments. Common errors: wrong land area, incorrect Bodenrichtwert, wrong usage classification, or incorrect building data. The error rate in new assessments is high — worth challenging.',
    law: '§ 347 AO, GrStG',
    deadlineDE: '30 Tage ab Zustellung',
    deadlineEN: '30 days from delivery',
    successDE: 'Sehr hohe Erfolgsquote bei nachweisbaren Datenfehlern',
    successEN: 'Very high success rate with provable data errors',
    tipDE: 'Grundstücksdaten mit Grundbuchauszug vergleichen — viele Fehler sofort erkennbar.',
    tipEN: 'Compare property data with land register — many errors immediately visible.',
    slug: 'grundsteuer',
    badge: 'Stark gefragt',
  },
  {
    id: 'jobcenter',
    icon: Users,
    iconBg: 'bg-orange-50 dark:bg-orange-950',
    iconColor: 'text-orange-600 dark:text-orange-400',
    titleDE: 'Jobcenter / Bürgergeld',
    titleEN: 'Jobcenter / Bürgergeld',
    descDE: 'Das Jobcenter hat Ihre Leistungen abgelehnt, gekürzt oder gestrichen? Ein Widerspruch nach § 78 SGG ist kostenfrei und suspendiert oft die Vollziehung. Häufige Fälle: rechtswidrige Sanktionen, fehlerhafte Bedarfsberechnung, nicht berücksichtigte Freibeträge, abgelehnte Umzugskosten oder Fehler bei der Anrechnung von Einkommen.',
    descEN: 'Jobcenter rejected or reduced your Bürgergeld benefits? An objection under § 78 SGG is free of charge and often suspends enforcement. Common cases: unlawful sanctions, incorrect needs calculation, uncounted allowances, rejected moving costs.',
    law: '§ 78 SGG',
    deadlineDE: '1 Monat ab Bekanntgabe',
    deadlineEN: '1 month from notification',
    successDE: 'Kostenlos nach § 184 SGG — kein Prozesskostenrisiko',
    successEN: 'Free of charge under § 184 SGG — no cost risk',
    tipDE: 'Widerspruch hemmt in der Regel die Vollziehung — Leistungen werden weitergezahlt.',
    tipEN: 'Objection generally suspends enforcement — benefits continue to be paid.',
    slug: 'jobcenter',
  },
  {
    id: 'rente',
    icon: Clock,
    iconBg: 'bg-purple-50 dark:bg-purple-950',
    iconColor: 'text-purple-600 dark:text-purple-400',
    titleDE: 'Rentenbescheid',
    titleEN: 'Pension Notice',
    descDE: 'Ihre Rente wurde zu niedrig berechnet? Die Deutsche Rentenversicherung berechnet Renten auf Basis von Versicherungszeiten und Entgeltpunkten. Fehler entstehen durch nicht erfasste Beitragszeiten, falsch berechnete Kindererziehungszeiten, fehlende Anrechnungszeiten für Ausbildung oder Krankheit.',
    descEN: 'Your pension was calculated too low? The Deutsche Rentenversicherung bases calculations on insurance periods and contribution points. Errors occur through missing insurance periods, incorrect child-rearing credits, or uncounted training periods.',
    law: '§ 78 SGG',
    deadlineDE: '1 Monat ab Bekanntgabe',
    deadlineEN: '1 month from notification',
    successDE: 'Häufig erfolgreich bei nachweisbaren fehlenden Versicherungszeiten',
    successEN: 'Often successful with provable missing insurance periods',
    tipDE: 'Rentenbescheide genau prüfen — jeder Euro zählt über Jahrzehnte.',
    tipEN: 'Always worth checking — every euro adds up over decades of retirement.',
    slug: 'rente',
  },
  {
    id: 'krankenversicherung',
    icon: Shield,
    iconBg: 'bg-red-50 dark:bg-red-950',
    iconColor: 'text-red-600 dark:text-red-400',
    titleDE: 'Krankenversicherung',
    titleEN: 'Health Insurance',
    descDE: 'Die Krankenkasse hat ein Medikament, eine Therapie, ein Hilfsmittel oder eine Operation abgelehnt? Ein Widerspruch ist Ihr gesetzliches Recht. Die Kasse muss nach § 13 Abs. 3a SGB V innerhalb von 3–5 Wochen entscheiden. Fehler: medizinische Notwendigkeit nicht ausreichend geprüft, fehlerhaftes MDK-Gutachten.',
    descEN: 'Health insurer rejected coverage for medication, therapy, or medical aids? You have the right to object under § 78 SGG. The insurer must decide within 3–5 weeks. Common grounds: insufficient assessment of medical necessity, defective MDK report.',
    law: '§ 78 SGG, § 12 SGB V',
    deadlineDE: '1 Monat ab Bekanntgabe',
    deadlineEN: '1 month from notification',
    successDE: 'Ca. 40 % Erfolgsquote bei gut begründetem Widerspruch',
    successEN: 'Approx. 40% success rate with well-reasoned objection',
    tipDE: 'Ärztliches Attest zur medizinischen Notwendigkeit erhöht Erfolgschancen erheblich.',
    tipEN: 'Medical certificate of necessity significantly increases success chances.',
    slug: 'krankenversicherung',
  },
  {
    id: 'kuendigung',
    icon: Briefcase,
    iconBg: 'bg-amber-50 dark:bg-amber-950',
    iconColor: 'text-amber-600 dark:text-amber-400',
    titleDE: 'Kündigung',
    titleEN: 'Dismissal',
    descDE: 'Eine Kündigung erhalten und der Meinung, sie ist ungerechtfertigt oder formell fehlerhaft? Das Kündigungsschutzgesetz schützt Arbeitnehmer in Betrieben ab 10 Mitarbeitern nach 6 Monaten. Mögliche Unwirksamkeitsgründe: soziale Rechtfertigung fehlt, keine Betriebsratsanhörung, formelle Mängel.',
    descEN: 'Received a dismissal notice you believe is unjust or defective? Employment protection law shields workers in companies with 10+ employees after 6 months. Grounds for invalidity: lack of social justification, missing works council hearing, procedural defects.',
    law: '§ 4 KSchG',
    deadlineDE: '3 Wochen für Klage beim Arbeitsgericht',
    deadlineEN: '3 weeks to file at labor court',
    successDE: 'Viele Verfahren enden mit einer Abfindung',
    successEN: 'Many cases result in a severance settlement',
    tipDE: '⚠ Nur 3 Wochen! Sofort handeln — danach ist die Kündigung rechtskräftig.',
    tipEN: '⚠ Only 3 weeks! Act immediately — after that the dismissal is final.',
    urgent: true,
    slug: 'kuendigung',
  },
  {
    id: 'miete',
    icon: Home,
    iconBg: 'bg-teal-50 dark:bg-teal-950',
    iconColor: 'text-teal-600 dark:text-teal-400',
    titleDE: 'Mieterhöhung / Kaution',
    titleEN: 'Rent Increase / Deposit',
    descDE: 'Vermieter verlangt eine Mieterhöhung oder behält die Kaution ein? Mieterhöhungen sind nur bis zur ortsüblichen Vergleichsmiete und unter Einhaltung der Kappungsgrenze (§ 558 Abs. 3 BGB) zulässig. Kautionen müssen nach Auszug innerhalb angemessener Frist zurückgegeben werden.',
    descEN: 'Landlord demanding a rent increase or withholding your deposit? Rent increases are only valid up to the local reference rent and within the statutory cap. Deposits must be returned after you move out within a reasonable timeframe.',
    law: '§§ 558–558e BGB',
    deadlineDE: '2 Monate für Widerspruch gegen Mieterhöhung',
    deadlineEN: '2 months to object to rent increase',
    successDE: 'Häufig erfolgreich bei Überschreitung des Mietspiegels',
    successEN: 'Often successful when local rent index is exceeded',
    tipDE: 'Lokalen Mietspiegel prüfen — viele Erhöhungen überschreiten das zulässige Maß.',
    tipEN: 'Check local rent index — many increases exceed the permitted level.',
    slug: 'miete',
  },
  {
    id: 'bussgeld',
    icon: AlertTriangle,
    iconBg: 'bg-rose-50 dark:bg-rose-950',
    iconColor: 'text-rose-600 dark:text-rose-400',
    titleDE: 'Bußgeldbescheid',
    titleEN: 'Fine / Penalty Notice',
    descDE: 'Bußgeldbescheid wegen Geschwindigkeitsüberschreitung, Handyverstoß, Rotlichtverstoß oder Falschparken erhalten? Ein Einspruch nach § 67 OWiG gibt Ihnen Anspruch auf ein gerichtliches Verfahren und Akteneinsicht. Häufige Fehler: Messfehler, abgelaufener Eichschein, fehlerhafte Fahrerfeststellung.',
    descEN: 'Received a fine for speeding, using a phone, running a red light, or parking violations? An objection under § 67 OWiG entitles you to court proceedings and file access. Common grounds: measurement errors, expired calibration, defective driver identification.',
    law: '§ 67 OWiG',
    deadlineDE: '2 Wochen ab Zustellung',
    deadlineEN: '2 weeks from delivery',
    successDE: 'Ca. 30 % Verfahrenseinstellungen durch Akteneinsicht',
    successEN: 'Approx. 30% of cases dropped after file inspection',
    tipDE: 'Immer zuerst Akteneinsicht beantragen — deckt oft Verfahrensfehler auf.',
    tipEN: 'Always request file access first — often reveals procedural defects.',
    slug: 'bussgeld',
  },
]

export default async function AnwendungsfaellePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  // Show German only for 'de'; all other locales fall back to English (international fallback)
  const isDE = locale === 'de'

  return (
    <>
      <PublicNav locale={locale} />

      {/* Hero */}
      <section className="py-16 sm:py-20 px-4 bg-gradient-to-b from-[var(--background)] to-[var(--background-subtle)]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Scale className="w-4 h-4" />
            {isDE ? '8 Bescheid-Typen unterstützt' : '8 supported case types'}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--foreground)] mb-5 leading-tight">
            {isDE ? 'Wann können Sie Einspruch einlegen?' : 'When can you object?'}
          </h1>
          <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto leading-relaxed mb-8">
            {isDE
              ? 'Erfahren Sie Ihre Rechte bei den häufigsten deutschen Verwaltungsbescheiden — mit Fristen, Rechtsgrundlagen und Erfolgsquoten.'
              : 'Learn about your rights for the most common German administrative notices — with deadlines, legal basis, and success rates.'}
          </p>
          <Link
            href="/einspruch?demo=true"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-4 rounded-2xl transition-colors text-lg shadow-sm"
          >
            <Zap className="w-5 h-5" />
            {isDE ? 'Jetzt mit KI starten' : 'Start with AI now'}
          </Link>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          {USE_CASES.map((uc) => {
            const Icon = uc.icon
            const title = isDE ? uc.titleDE : uc.titleEN
            const desc = isDE ? uc.descDE : uc.descEN
            const deadline = isDE ? uc.deadlineDE : uc.deadlineEN
            const success = isDE ? uc.successDE : uc.successEN
            const tip = isDE ? uc.tipDE : uc.tipEN

            return (
              <div
                id={uc.id}
                key={uc.id}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-7 hover:border-brand-200 dark:hover:border-brand-800 hover:shadow-md transition-all scroll-mt-24"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 ${uc.iconBg} rounded-2xl flex items-center justify-center shrink-0`}>
                    <Icon className={`w-6 h-6 ${uc.iconColor}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h2 className="text-xl font-bold text-[var(--foreground)]">{title}</h2>
                      {uc.badge && (
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0">
                          {uc.badge}
                        </span>
                      )}
                      {uc.urgent && (
                        <span className="text-[10px] bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0">
                          {isDE ? 'Kurze Frist!' : 'Urgent deadline'}
                        </span>
                      )}
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="text-xs bg-[var(--background-subtle)] text-[var(--muted)] px-2.5 py-1 rounded-full font-medium">
                        {uc.law}
                      </span>
                      <span className={`flex items-center gap-1 text-xs font-semibold ${uc.urgent ? 'text-red-600 dark:text-red-400' : 'text-[var(--muted)]'}`}>
                        <Clock className="w-3.5 h-3.5" />
                        {isDE ? 'Frist:' : 'Deadline:'} {deadline}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-green-700 dark:text-green-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {success}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-[var(--muted)] leading-relaxed mb-4">{desc}</p>

                    {/* Tip */}
                    <div className="flex items-start gap-2 bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900 rounded-xl px-3 py-2.5 mb-5">
                      <span className="text-brand-500 text-sm mt-0.5">💡</span>
                      <p className="text-xs text-brand-800 dark:text-brand-300 leading-relaxed">{tip}</p>
                    </div>

                    {/* CTA buttons */}
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/einspruch?type=${uc.slug}&demo=true`}
                        className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        {isDE ? 'Einspruch mit KI starten' : 'Start objection with AI'}
                      </Link>
                      <Link
                        href={`/vorlagen?category=${uc.id}`}
                        className="inline-flex items-center gap-2 border border-[var(--border)] text-[var(--foreground)] hover:border-brand-300 font-medium px-5 py-2.5 rounded-xl text-sm transition-colors"
                      >
                        {isDE ? 'Vorlage ansehen' : 'View template'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 bg-brand-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {isDE ? 'Nicht sicher, welcher Typ zutrifft?' : 'Not sure which type applies?'}
          </h2>
          <p className="text-brand-100 text-lg mb-8 leading-relaxed">
            {isDE
              ? 'Laden Sie einfach Ihren Bescheid hoch — unsere KI erkennt den Typ automatisch, findet Einspruchsgründe und erstellt in Minuten ein professionelles Schreiben.'
              : 'Upload any official notice — our AI identifies the type automatically, finds objection grounds, and drafts a professional letter in minutes.'}
          </p>
          <Link
            href="/einspruch?demo=true"
            className="inline-flex items-center gap-2 bg-white text-brand-700 hover:bg-brand-50 font-bold px-8 py-4 rounded-2xl transition-colors text-lg"
          >
            <Zap className="w-5 h-5" />
            {isDE ? 'Bescheid hochladen & starten' : 'Upload notice & start'}
          </Link>
        </div>
      </section>

      <Footer locale={locale} />
    </>
  )
}
