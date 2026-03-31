/**
 * Content fallbacks — used by seed.ts and API routes.
 * All dynamic content (FAQs, use cases, pricing) comes from here when the DB is unavailable.
 * Prices and content are intentionally NOT hardcoded in components — always imported from here.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UseCaseData {
  slug: string
  locale: string
  title: string
  shortDesc: string
  description: string
  deadlineText: string
  deadlineDays: number
  legalBasis: string
  successRate?: string
  badge?: string
  icon?: string
}

export interface FAQData {
  id?: string
  locale: string
  category: string
  userGroup?: string
  question: string
  answer: string
  sortOrder: number
}

export interface PricingPlanTranslation {
  locale: string
  name: string
  description: string
  cta: string
}

export interface PricingPlanFeature {
  locale: string
  text: string
  included: boolean
  sortOrder: number
}

export interface PricingPlanData {
  slug: string
  userGroup: string
  priceOnce?: number | null
  priceMonthly?: number | null
  priceAnnual?: number | null
  currency: string
  isPopular: boolean
  isActive: boolean
  translations: Record<string, PricingPlanTranslation>
  features: PricingPlanFeature[]
}

export interface TrustStatData {
  locale: string
  value: string
  label: string
  source: string
  sourceUrl?: string
  verified: boolean
}

// ── Use Cases (8 types × DE+EN) ───────────────────────────────────────────────

export const USE_CASES: UseCaseData[] = [
  // ─ Steuerbescheid ─
  {
    slug: 'tax',
    locale: 'de',
    title: 'Steuerbescheid',
    shortDesc: 'Einspruch gegen Steuer-Nachzahlungen und fehlerhafte Steuerbescheide',
    description: 'Ein Steuerbescheid kann fehlerhaft sein — falsch berechnete Werbungskosten, nicht anerkannte Absetzungen oder fehlerhafte Berechnung von Sonderausgaben. Mit TaxaLex erstellen Sie in Minuten einen professionellen Einspruch gemäß § 347 AO, der alle relevanten Rechtsgründe benennt und Ihre Argumente strukturiert darlegt.',
    deadlineText: '1 Monat nach Bekanntgabe',
    deadlineDays: 30,
    legalBasis: '§ 347 AO',
    successRate: '67 %',
    badge: 'Häufigster Fall',
    icon: 'FileText',
  },
  {
    slug: 'tax',
    locale: 'en',
    title: 'Tax assessment',
    shortDesc: 'Object to tax demands and incorrectly calculated tax assessments',
    description: 'A tax assessment (Steuerbescheid) can be wrong — incorrectly calculated deductions, unrecognised expenses, or errors in special allowances. TaxaLex generates a professional objection letter (Einspruch) under § 347 AO, citing the correct legal basis and structuring your arguments effectively.',
    deadlineText: '1 month after notification',
    deadlineDays: 30,
    legalBasis: '§ 347 AO',
    successRate: '67 %',
    badge: 'Most common',
    icon: 'FileText',
  },
  // ─ Jobcenter / Bürgergeld ─
  {
    slug: 'jobcenter',
    locale: 'de',
    title: 'Jobcenter / Bürgergeld',
    shortDesc: 'Widerspruch gegen Ablehnungen, Kürzungen und Sanktionen',
    description: 'Jobcenter-Bescheide über Ablehnung, Kürzung oder Streichung von Bürgergeld-Leistungen können angefochten werden. Der Widerspruch muss innerhalb eines Monats eingelegt werden (§ 184 SGG). TaxaLex hilft Ihnen, ein strukturiertes Widerspruchsschreiben zu formulieren, das auf die spezifischen Punkte im Bescheid eingeht.',
    deadlineText: '1 Monat nach Bekanntgabe',
    deadlineDays: 30,
    legalBasis: '§ 78 SGG',
    successRate: '42 %',
    icon: 'Users',
  },
  {
    slug: 'jobcenter',
    locale: 'en',
    title: 'Jobcenter / Bürgergeld',
    shortDesc: 'Object to rejections, reductions, and sanctions of social benefits',
    description: 'Jobcenter decisions on rejection, reduction, or withdrawal of Bürgergeld benefits can be challenged. The objection must be filed within one month (§ 184 SGG). TaxaLex helps you draft a structured objection letter that addresses the specific points raised in the notice.',
    deadlineText: '1 month after notification',
    deadlineDays: 30,
    legalBasis: '§ 78 SGG',
    successRate: '42 %',
    icon: 'Users',
  },
  // ─ Rentenbescheid ─
  {
    slug: 'rente',
    locale: 'de',
    title: 'Rentenbescheid',
    shortDesc: 'Einspruch gegen fehlerhafte Rentenberechnungen',
    description: 'Der Rentenbescheid der Deutschen Rentenversicherung kann Fehler bei der Berechnung der Rentenpunkte, der Berücksichtigung von Versicherungszeiten oder bei Kindererziehungszeiten enthalten. TaxaLex hilft, einen Widerspruch zu formulieren, der die relevanten Rentenregelungen korrekt referenziert.',
    deadlineText: '1 Monat nach Bekanntgabe',
    deadlineDays: 30,
    legalBasis: '§ 78 SGG',
    icon: 'Clock',
  },
  {
    slug: 'rente',
    locale: 'en',
    title: 'Pension notice',
    shortDesc: 'Object to incorrect pension calculations',
    description: 'The German pension authority (DRV) may make errors in calculating your pension points, crediting insurance periods, or recognising child-rearing periods. TaxaLex helps draft an objection correctly referencing the applicable pension law.',
    deadlineText: '1 month after notification',
    deadlineDays: 30,
    legalBasis: '§ 78 SGG',
    icon: 'Clock',
  },
  // ─ Bußgeldbescheid ─
  {
    slug: 'bussgeld',
    locale: 'de',
    title: 'Bußgeldbescheid',
    shortDesc: 'Einspruch gegen Bußgelder, Fahrverbote und Verwarnungen',
    description: 'Gegen Bußgeldbescheide wegen Verkehrsverstößen, Lärmbelästigung oder anderen Ordnungswidrigkeiten kann innerhalb von zwei Wochen Einspruch eingelegt werden. TaxaLex analysiert den Bescheid auf Verfahrensfehler, Messfehler und rechtliche Mängel.',
    deadlineText: '2 Wochen nach Bekanntgabe',
    deadlineDays: 14,
    legalBasis: '§ 67 OWiG',
    successRate: '28 %',
    icon: 'AlertTriangle',
  },
  {
    slug: 'bussgeld',
    locale: 'en',
    title: 'Fine / penalty notice',
    shortDesc: 'Challenge traffic fines, driving bans, and administrative penalties',
    description: 'Traffic fines, noise violations, and other administrative penalties (Bußgeldbescheid) can be contested within two weeks. TaxaLex analyses the notice for procedural errors, measurement defects, and legal shortcomings.',
    deadlineText: '2 weeks after notification',
    deadlineDays: 14,
    legalBasis: '§ 67 OWiG',
    successRate: '28 %',
    icon: 'AlertTriangle',
  },
  // ─ Krankenversicherung ─
  {
    slug: 'krankenversicherung',
    locale: 'de',
    title: 'Krankenversicherung',
    shortDesc: 'Widerspruch gegen abgelehnte Leistungen der Krankenkasse',
    description: 'Wenn die Krankenkasse die Kostenübernahme für Medikamente, Therapien, Hilfsmittel oder Behandlungen ablehnt, kann innerhalb eines Monats Widerspruch eingelegt werden. TaxaLex generiert ein Widerspruchsschreiben, das die ärztliche Notwendigkeit betont und relevante Sozialrechtsnormen referenziert.',
    deadlineText: '1 Monat nach Bescheid',
    deadlineDays: 30,
    legalBasis: '§ 78 SGG',
    icon: 'Shield',
  },
  {
    slug: 'krankenversicherung',
    locale: 'en',
    title: 'Health insurance',
    shortDesc: 'Challenge rejected coverage for treatments, medication, or devices',
    description: 'When your statutory health insurer (GKV) rejects coverage for medication, therapies, medical aids, or treatments, you have one month to file an objection. TaxaLex generates an objection letter emphasising medical necessity and citing relevant social law provisions.',
    deadlineText: '1 month after notification',
    deadlineDays: 30,
    legalBasis: '§ 78 SGG',
    icon: 'Shield',
  },
  // ─ Kündigung ─
  {
    slug: 'kuendigung',
    locale: 'de',
    title: 'Kündigung',
    shortDesc: 'Kündigungsschutzklage und Widerspruch gegen Entlassung',
    description: 'Eine Kündigung kann sozial ungerechtfertigt oder formell fehlerhaft sein. Die Kündigungsschutzklage muss innerhalb von drei Wochen beim Arbeitsgericht eingereicht werden. TaxaLex hilft, das Widerspruchsschreiben an den Arbeitgeber und die Klage zu formulieren.',
    deadlineText: '3 Wochen nach Zugang',
    deadlineDays: 21,
    legalBasis: '§ 4 KSchG',
    icon: 'Briefcase',
  },
  {
    slug: 'kuendigung',
    locale: 'en',
    title: 'Dismissal notice',
    shortDesc: 'Challenge unfair dismissal and termination notices',
    description: 'A dismissal may be socially unjustified or formally defective. An employment protection claim (Kündigungsschutzklage) must be filed within three weeks at the labour court. TaxaLex helps draft the objection to the employer and the legal claim.',
    deadlineText: '3 weeks after receipt',
    deadlineDays: 21,
    legalBasis: '§ 4 KSchG',
    icon: 'Briefcase',
  },
  // ─ Mieterhöhung ─
  {
    slug: 'miete',
    locale: 'de',
    title: 'Mieterhöhung',
    shortDesc: 'Widerspruch gegen unberechtigte Mieterhöhungen und Nebenkostenabrechnungen',
    description: 'Vermieter dürfen die Miete nur unter engen gesetzlichen Voraussetzungen erhöhen. Mieterhöhungen über die ortsübliche Vergleichsmiete (Mietspiegel), fehlerhafte Nebenkostenabrechnungen oder zu häufige Erhöhungen können widersprochen werden. TaxaLex unterstützt Sie beim Formulieren eines strukturierten Widerspruchsschreibens.',
    deadlineText: '2 Monate nach Zugang',
    deadlineDays: 60,
    legalBasis: '§ 558 BGB',
    icon: 'Home',
  },
  {
    slug: 'miete',
    locale: 'en',
    title: 'Rent increase',
    shortDesc: 'Challenge unjustified rent increases and ancillary cost statements',
    description: 'Landlords can only increase rent under strict legal conditions. Increases above the local reference rent (Mietspiegel), incorrect ancillary cost statements, or too-frequent increases can be challenged. TaxaLex helps you draft a structured, clearly reasoned objection letter.',
    deadlineText: '2 months after receipt',
    deadlineDays: 60,
    legalBasis: '§ 558 BGB',
    icon: 'Home',
  },
  // ─ Grundsteuer ─
  {
    slug: 'grundsteuer',
    locale: 'de',
    title: 'Grundsteuerbescheid',
    shortDesc: 'Einspruch gegen fehlerhafte Grundsteuerbescheide (Reform 2022)',
    description: 'Nach der Grundsteuerreform 2022 erhalten Millionen Eigentümer neue Bescheide. Fehlerhafte Bewertungen der Grundstücksfläche, des Bodenrichtwerts oder der Nutzungsart können erfolgreich angefochten werden. TaxaLex analysiert den Bescheid und generiert einen Einspruch gemäß § 347 AO.',
    deadlineText: '1 Monat nach Bekanntgabe',
    deadlineDays: 30,
    legalBasis: '§ 347 AO, GrStG',
    badge: 'Neu: Reform 2022',
    icon: 'MapPin',
  },
  {
    slug: 'grundsteuer',
    locale: 'en',
    title: 'Property tax (Grundsteuer)',
    shortDesc: 'Challenge incorrect property tax assessments after the 2022 reform',
    description: 'Following the 2022 Grundsteuer reform, millions of property owners received new assessments. Errors in land area, land value (Bodenrichtwert), or usage classification can be successfully challenged. TaxaLex analyses the notice and generates an objection under § 347 AO.',
    deadlineText: '1 month after notification',
    deadlineDays: 30,
    legalBasis: '§ 347 AO, GrStG',
    badge: 'New: 2022 reform',
    icon: 'MapPin',
  },
]

// ── FAQs (25 questions × DE+EN) ───────────────────────────────────────────────

export const FAQS: FAQData[] = [
  // ─ general ─
  {
    locale: 'de',
    category: 'general',
    question: 'Was ist TaxaLex?',
    answer: 'TaxaLex ist eine KI-gestützte Plattform, die Ihnen hilft, professionelle Einspruchs- und Widerspruchsschreiben gegen behördliche Bescheide zu erstellen. Unsere Multi-KI-Pipeline analysiert Ihren Bescheid und generiert ein rechtlich fundiertes Schreiben in wenigen Minuten.',
    sortOrder: 1,
  },
  {
    locale: 'en',
    category: 'general',
    question: 'What is TaxaLex?',
    answer: 'TaxaLex is an AI-powered platform that helps you draft structured, well-reasoned objection letters against official government notices. Five specialized AI agents analyse your notice, cross-check each other\'s work, and produce a clearly argued draft in minutes.',
    sortOrder: 1,
  },
  {
    locale: 'de',
    category: 'general',
    question: 'Kann ich den generierten Einspruch direkt einreichen?',
    answer: 'TaxaLex erstellt einen strukturierten, fachsprachlich formulierten Entwurf — kein abschließendes Rechtsgutachten. Sie prüfen den Entwurf, passen ihn bei Bedarf an und reichen ihn selbst ein. TaxaLex stellt keine Rechtsberatung i.S.d. RDG dar. Bei komplexen oder streitigen Sachverhalten empfehlen wir, den Entwurf von einem Steuerberater oder Rechtsanwalt prüfen zu lassen.',
    sortOrder: 2,
  },
  {
    locale: 'en',
    category: 'general',
    question: 'Can I submit the generated objection directly?',
    answer: 'TaxaLex produces a structured, professionally worded draft — not a final legal opinion. You review the draft, adjust it if needed, and submit it yourself. TaxaLex does not constitute legal advice under the German Legal Services Act (RDG). For complex or disputed matters, we recommend having the draft reviewed by a tax advisor or lawyer.',
    sortOrder: 2,
  },
  {
    locale: 'de',
    category: 'general',
    question: 'Welche Bescheid-Typen werden unterstützt?',
    answer: 'TaxaLex unterstützt aktuell: Steuerbescheide, Jobcenter/Bürgergeld-Bescheide, Rentenbescheide, Bußgeldbescheide, Krankenkassen-Bescheide, Kündigungen, Mieterhöhungen und Grundsteuerbescheide. Weitere Bescheid-Typen werden kontinuierlich hinzugefügt.',
    sortOrder: 3,
  },
  {
    locale: 'en',
    category: 'general',
    question: 'Which notice types are supported?',
    answer: 'TaxaLex currently supports: tax assessments, Jobcenter/Bürgergeld notices, pension notices, fines, health insurance decisions, dismissal notices, rent increases, and property tax assessments (Grundsteuer). More notice types are continuously being added.',
    sortOrder: 3,
  },
  {
    locale: 'de',
    category: 'general',
    question: 'Wie lange dauert die Generierung?',
    answer: 'Die KI-Pipeline (5 Agenten: Drafter, Reviewer, Fact-Checker, Adversary, Consolidator) benötigt typischerweise 2–5 Minuten. Die genaue Dauer hängt von der Komplexität des Bescheids und der aktuellen Auslastung ab.',
    sortOrder: 4,
  },
  {
    locale: 'en',
    category: 'general',
    question: 'How long does generation take?',
    answer: 'The AI pipeline (5 agents: Drafter, Reviewer, Fact-Checker, Adversary, Consolidator) typically takes 2–5 minutes. The exact duration depends on the complexity of the notice and current system load.',
    sortOrder: 4,
  },
  // ─ pricing ─
  {
    locale: 'de',
    category: 'pricing',
    question: 'Was kostet TaxaLex?',
    answer: 'TaxaLex bietet drei Preismodelle: Einzelfall (5,99 €), 5er-Paket (19,99 €) und Monats-Flat (9,99 €/Monat). Optional: Prüfung durch einen zugelassenen Steuerberater oder Anwalt als Zubuchung für 99 € pro Fall (oder 69 € für Monats-Abonnenten). Die aktuelle Preisübersicht finden Sie auf der Preisseite.',
    sortOrder: 1,
  },
  {
    locale: 'en',
    category: 'pricing',
    question: 'How much does TaxaLex cost?',
    answer: 'TaxaLex offers three plans: Single case (€5.99), 5-pack (€19.99), and Monthly flat (€9.99/month). Optional: add professional review by a licensed tax advisor or lawyer for €99 per case (or €69 for monthly subscribers). See the current pricing overview on the pricing page.',
    sortOrder: 1,
  },
  {
    locale: 'de',
    category: 'pricing',
    question: 'Gibt es eine kostenlose Version?',
    answer: 'Ja. Nach kostenloser Registrierung erhalten Sie einen Einspruch pro Monat kostenlos. So können Sie die Qualität unserer KI-Pipeline testen, bevor Sie ein Paket kaufen.',
    sortOrder: 2,
  },
  {
    locale: 'en',
    category: 'pricing',
    question: 'Is there a free version?',
    answer: 'Yes. After free registration, you receive one objection per month at no cost. This lets you test the quality of our AI pipeline before purchasing a package.',
    sortOrder: 2,
  },
  {
    locale: 'de',
    category: 'pricing',
    question: 'Wie funktioniert die Abrechnung?',
    answer: 'Die Zahlung erfolgt sicher über Stripe. Sie kaufen entweder Einzel-Einsprüche, Pakete (ohne Abo) oder einen monatlichen Zugang. Pakete verfallen nicht — Sie können sie jederzeit nutzen.',
    sortOrder: 3,
  },
  {
    locale: 'en',
    category: 'pricing',
    question: 'How does billing work?',
    answer: 'Payment is processed securely via Stripe. You can purchase individual objections, packages (no subscription required), or a monthly access plan. Packages do not expire — use them whenever you need.',
    sortOrder: 3,
  },
  // ─ legal ─
  {
    locale: 'de',
    category: 'legal',
    question: 'Was ist der Unterschied zwischen Einspruch und Widerspruch?',
    answer: 'Einspruch (§ 347 AO) ist der Rechtsbehelf gegen Steuerbescheide des Finanzamts. Widerspruch (§ 68 VwGO / § 78 SGG) wird gegen Verwaltungsbescheide und Sozialleistungsbescheide eingelegt. TaxaLex generiert automatisch den korrekten Rechtsbehelfstyp basierend auf Ihrem Bescheid.',
    sortOrder: 1,
  },
  {
    locale: 'en',
    category: 'legal',
    question: 'What is the difference between Einspruch and Widerspruch?',
    answer: 'Einspruch (§ 347 AO) is the legal remedy against tax authority decisions. Widerspruch (§ 68 VwGO / § 78 SGG) is used against administrative and social benefit decisions. TaxaLex automatically generates the correct type of objection based on your notice.',
    sortOrder: 1,
  },
  {
    locale: 'de',
    category: 'legal',
    question: 'Welche Fristen muss ich beachten?',
    answer: 'Die meisten Fristen betragen einen Monat nach Bekanntgabe des Bescheids. Ausnahmen: Bußgeldbescheide (2 Wochen, § 67 OWiG), Kündigungsschutzklagen (3 Wochen, § 4 KSchG), Mieterhöhungen (2 Monate). TaxaLex berechnet die Frist automatisch und zeigt sie prominent an.',
    sortOrder: 2,
  },
  {
    locale: 'en',
    category: 'legal',
    question: 'What deadlines apply?',
    answer: 'Most deadlines are one month after the notice date. Exceptions: fines (2 weeks, § 67 OWiG), employment protection claims (3 weeks, § 4 KSchG), rent increases (2 months). TaxaLex calculates the deadline automatically and displays it prominently.',
    sortOrder: 2,
  },
  {
    locale: 'de',
    category: 'legal',
    question: 'Stellt TaxaLex eine Rechtsberatung dar?',
    answer: 'Nein. TaxaLex stellt keine Rechtsberatung im Sinne des Rechtsdienstleistungsgesetzes (RDG) dar. Das generierte Schreiben ist ein KI-gestützter Entwurf. Bei komplexen Sachverhalten oder erheblichem finanziellem Risiko empfehlen wir die Hinzuziehung eines qualifizierten Steuerberaters oder Rechtsanwalts.',
    sortOrder: 3,
  },
  {
    locale: 'en',
    category: 'legal',
    question: 'Does TaxaLex provide legal advice?',
    answer: 'No. TaxaLex does not constitute legal advice within the meaning of the German Legal Services Act (RDG). The generated letter is an AI-assisted draft. For complex matters or significant financial risk, we recommend consulting a qualified tax advisor or lawyer.',
    sortOrder: 3,
  },
  // ─ technical ─
  {
    locale: 'de',
    category: 'technical',
    question: 'Welche Dateiformate werden akzeptiert?',
    answer: 'TaxaLex akzeptiert PDF, JPEG, PNG und TIFF-Dateien bis 10 MB. Die OCR-Erkennung wandelt gescannte Dokumente automatisch in Text um. Für beste Ergebnisse empfehlen wir PDF-Dateien mit Textebene.',
    sortOrder: 1,
  },
  {
    locale: 'en',
    category: 'technical',
    question: 'Which file formats are accepted?',
    answer: 'TaxaLex accepts PDF, JPEG, PNG, and TIFF files up to 10 MB. OCR recognition automatically converts scanned documents to text. For best results, we recommend PDF files with a text layer.',
    sortOrder: 1,
  },
  {
    locale: 'de',
    category: 'technical',
    question: 'Wie sicher sind meine Daten?',
    answer: 'Ihre Daten werden ausschließlich auf EU-Servern (Hetzner, Deutschland) verarbeitet und gespeichert. Die Übertragung erfolgt TLS 1.3-verschlüsselt. Hochgeladene Dokumente werden nach der Verarbeitung gelöscht. Wir sind DSGVO-konform und speichern keine personenbezogenen Daten ohne Ihre ausdrückliche Einwilligung.',
    sortOrder: 2,
  },
  {
    locale: 'en',
    category: 'technical',
    question: 'How secure is my data?',
    answer: 'Your data is processed and stored exclusively on EU servers (Hetzner, Germany). Transfers are encrypted with TLS 1.3. Uploaded documents are deleted after processing. We are GDPR-compliant and do not store personal data without your explicit consent.',
    sortOrder: 2,
  },
  // ─ advisor ─
  {
    locale: 'de',
    category: 'advisor',
    question: 'Kann ich meinen Einspruch von einem Steuerberater prüfen lassen?',
    answer: 'Ja. Als optionale Zubuchung (99 € pro Fall, oder 69 € für Monats-Abonnenten) können Sie nach der KI-Generierung eine Prüfung durch einen zugelassenen Steuerberater oder Rechtsanwalt beauftragen. Der Fachmann erhält einen sicheren Link, prüft den Entwurf und gibt Feedback oder gibt ihn direkt frei — ohne dass Sie dafür in eine Kanzlei müssen.',
    sortOrder: 1,
  },
  {
    locale: 'en',
    category: 'advisor',
    question: 'Can I have my objection reviewed by a tax advisor?',
    answer: 'Yes. As an optional add-on (€99 per case, or €69 for monthly subscribers), you can request a review by a licensed tax advisor or lawyer after the AI generation. The professional receives a secure link, reviews the draft and either approves it or sends comments — no appointment needed.',
    sortOrder: 1,
  },
  {
    locale: 'de',
    category: 'advisor',
    question: 'Warum kostet die Berater-Prüfung nur 49 €?',
    answer: 'Steuerberater und Anwälte prüfen einen bereits strukturierten KI-Entwurf — das dauert typischerweise 15–20 Minuten statt Stunden. TaxaLex übernimmt die Erstellung; der Fachmann konzentriert sich auf die fachliche Kontrolle. Das ermöglicht einen fairen Preis für Sie und eine effiziente Nutzung der Fachkraft-Zeit.',
    sortOrder: 2,
  },
  {
    locale: 'en',
    category: 'advisor',
    question: 'Why is the professional review only €49?',
    answer: 'Tax advisors and lawyers review an already structured AI draft — typically 15–20 minutes of work instead of hours. TaxaLex handles the drafting; the professional focuses on quality control. This allows a fair price for you and an efficient use of expert time.',
    sortOrder: 2,
  },
]

// ── Pricing Plans (7 plans) ───────────────────────────────────────────────────

export const PRICING_PLANS: PricingPlanData[] = [
  {
    slug: 'individual-single',
    userGroup: 'individual',
    priceOnce: 5.99,
    priceMonthly: null,
    priceAnnual: null,
    currency: 'EUR',
    isPopular: false,
    isActive: true,
    translations: {
      de: { locale: 'de', name: 'Einzelfall', description: 'Einmalig zahlen, einmalig nutzen. Keine Verpflichtung.', cta: 'Jetzt erstellen' },
      en: { locale: 'en', name: 'Single case', description: 'Pay once, use once. No commitment.', cta: 'Get started' },
    },
    features: [
      { locale: 'de', text: '1 vollständiger Einspruch', included: true, sortOrder: 1 },
      { locale: 'de', text: 'Alle Bescheid-Typen', included: true, sortOrder: 2 },
      { locale: 'de', text: 'PDF- & DOCX-Download', included: true, sortOrder: 3 },
      { locale: 'de', text: '5 KI-Agenten (Multi-LLM)', included: true, sortOrder: 4 },
      { locale: 'de', text: 'Dokumenten-Archiv', included: false, sortOrder: 5 },
      { locale: 'en', text: '1 complete objection', included: true, sortOrder: 1 },
      { locale: 'en', text: 'All notice types', included: true, sortOrder: 2 },
      { locale: 'en', text: 'PDF & DOCX download', included: true, sortOrder: 3 },
      { locale: 'en', text: '5 AI agents (Multi-LLM)', included: true, sortOrder: 4 },
      { locale: 'en', text: 'Document archive', included: false, sortOrder: 5 },
    ],
  },
  {
    slug: 'individual-pack',
    userGroup: 'individual',
    priceOnce: 19.99,
    priceMonthly: null,
    priceAnnual: null,
    currency: 'EUR',
    isPopular: true,
    isActive: true,
    translations: {
      de: { locale: 'de', name: '5er-Paket', description: '5 Einsprüche auf Vorrat — kein Ablaufdatum.', cta: '5er-Paket kaufen' },
      en: { locale: 'en', name: '5-pack', description: '5 objections, no expiry date. Use when you need them.', cta: 'Buy 5-pack' },
    },
    features: [
      { locale: 'de', text: '5 Einsprüche ohne Ablaufdatum', included: true, sortOrder: 1 },
      { locale: 'de', text: 'Alle Bescheid-Typen', included: true, sortOrder: 2 },
      { locale: 'de', text: 'PDF- & DOCX-Download', included: true, sortOrder: 3 },
      { locale: 'de', text: '5 KI-Agenten (Multi-LLM)', included: true, sortOrder: 4 },
      { locale: 'de', text: 'Dokumenten-Archiv', included: true, sortOrder: 5 },
      { locale: 'en', text: '5 objections, no expiry', included: true, sortOrder: 1 },
      { locale: 'en', text: 'All notice types', included: true, sortOrder: 2 },
      { locale: 'en', text: 'PDF & DOCX download', included: true, sortOrder: 3 },
      { locale: 'en', text: '5 AI agents (Multi-LLM)', included: true, sortOrder: 4 },
      { locale: 'en', text: 'Document archive', included: true, sortOrder: 5 },
    ],
  },
  {
    slug: 'individual-monthly',
    userGroup: 'individual',
    priceOnce: null,
    priceMonthly: 9.99,
    priceAnnual: 99,
    currency: 'EUR',
    isPopular: false,
    isActive: true,
    translations: {
      de: { locale: 'de', name: 'Monats-Flat', description: 'Unbegrenzte Einsprüche. Abo jederzeit kündbar.', cta: 'Monat starten' },
      en: { locale: 'en', name: 'Monthly flat', description: 'Unlimited objections. Cancel any time.', cta: 'Start monthly' },
    },
    features: [
      { locale: 'de', text: 'Unbegrenzte Einsprüche', included: true, sortOrder: 1 },
      { locale: 'de', text: 'Alle Bescheid-Typen', included: true, sortOrder: 2 },
      { locale: 'de', text: 'PDF- & DOCX-Download', included: true, sortOrder: 3 },
      { locale: 'de', text: 'Dokumenten-Archiv', included: true, sortOrder: 4 },
      { locale: 'de', text: 'Berater-Prüfung zu €69/Fall (statt €99)', included: true, sortOrder: 5 },
      { locale: 'en', text: 'Unlimited objections', included: true, sortOrder: 1 },
      { locale: 'en', text: 'All notice types', included: true, sortOrder: 2 },
      { locale: 'en', text: 'PDF & DOCX download', included: true, sortOrder: 3 },
      { locale: 'en', text: 'Document archive', included: true, sortOrder: 4 },
      { locale: 'en', text: 'Professional review at €69/case (vs €99)', included: true, sortOrder: 5 },
    ],
  },
]

// ── Trust Stats (5 verified statistics) ──────────────────────────────────────

export const TRUST_STATS: TrustStatData[] = [
  {
    locale: 'de',
    value: '3,3 Mio.',
    label: 'Einsprüche jährlich in Deutschland',
    source: 'BMF Finanzbericht 2023',
    sourceUrl: 'https://www.bundesfinanzministerium.de',
    verified: true,
  },
  {
    locale: 'en',
    value: '3.3M',
    label: 'Tax objections filed per year in Germany',
    source: 'BMF Finanzbericht 2023',
    verified: true,
  },
  {
    locale: 'de',
    value: '67 %',
    label: 'Teilweise oder vollständige Stattgabe',
    source: 'BMF Steuerstatistik',
    verified: true,
  },
  {
    locale: 'en',
    value: '67 %',
    label: 'Partial or full success rate',
    source: 'BMF Steuerstatistik',
    verified: true,
  },
  {
    locale: 'de',
    value: '30 Tage',
    label: 'Gesetzliche Einspruchsfrist (§ 355 AO)',
    source: '§ 355 AO',
    verified: true,
  },
  {
    locale: 'en',
    value: '30 days',
    label: 'Legal objection deadline (§ 355 AO)',
    source: '§ 355 AO',
    verified: true,
  },
  {
    locale: 'de',
    value: 'kostenlos',
    label: 'Widerspruch beim Jobcenter (§ 184 SGG)',
    source: '§ 184 SGG',
    verified: true,
  },
  {
    locale: 'en',
    value: 'free',
    label: 'Objection at Jobcenter (§ 184 SGG)',
    source: '§ 184 SGG',
    verified: true,
  },
  {
    locale: 'de',
    value: '< 5 min',
    label: 'Durchschnittliche Generierungszeit',
    source: 'TaxaLex intern gemessen',
    verified: true,
  },
  {
    locale: 'en',
    value: '< 5 min',
    label: 'Average generation time',
    source: 'TaxaLex internal measurement',
    verified: true,
  },
]

// ── Helper: get use cases for a locale ───────────────────────────────────────

export function getUseCases(locale: string): UseCaseData[] {
  return USE_CASES.filter((uc) => uc.locale === locale)
}

export function getFAQs(locale: string, category?: string, userGroup?: string): FAQData[] {
  return FAQS.filter(
    (faq) =>
      faq.locale === locale &&
      (category && category !== 'all' ? faq.category === category : true) &&
      (userGroup ? !faq.userGroup || faq.userGroup === userGroup : true)
  ).sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getPricingPlans(userGroup?: string): PricingPlanData[] {
  return PRICING_PLANS.filter(
    (plan) => plan.isActive && (!userGroup || plan.userGroup === userGroup)
  )
}

export function getTrustStats(locale: string): TrustStatData[] {
  return TRUST_STATS.filter((s) => s.locale === locale)
}
