/**
 * Content fallbacks — used by seed.ts only.
 *
 * SEED ONLY — this file is imported ONLY by prisma/seed.ts.
 * DO NOT import from this file in application code (API routes, pages, components).
 * If the database is unavailable, the application should return an error, not fall back to this data.
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

// ── Pricing Plans (7 plans + 2 add-ons) ──────────────────────────────────────

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
      fr: { locale: 'fr', name: 'Cas unique', description: 'Payez une fois, utilisez une fois. Sans engagement.', cta: 'Commencer' },
      it: { locale: 'it', name: 'Caso singolo', description: 'Paghi una volta, usi una volta. Nessun impegno.', cta: 'Inizia ora' },
      es: { locale: 'es', name: 'Caso único', description: 'Pague una vez, use una vez. Sin compromiso.', cta: 'Empezar' },
      pt: { locale: 'pt', name: 'Caso único', description: 'Pague uma vez, use uma vez. Sem compromisso.', cta: 'Começar' },
      tr: { locale: 'tr', name: 'Tek dava', description: 'Bir kere öde, bir kere kullan. Taahhüt yok.', cta: 'Başla' },
      ru: { locale: 'ru', name: 'Один случай', description: 'Оплатите один раз, используйте один раз. Без обязательств.', cta: 'Начать' },
      pl: { locale: 'pl', name: 'Pojedynczy przypadek', description: 'Zapłać raz, użyj raz. Bez zobowiązań.', cta: 'Rozpocznij' },
      ar: { locale: 'ar', name: 'حالة واحدة', description: 'ادفع مرة واحدة، استخدم مرة واحدة. بدون التزام.', cta: 'ابدأ الآن' },
      uk: { locale: 'uk', name: 'Один випадок', description: 'Сплатіть один раз, використайте один раз. Без зобов\'язань.', cta: 'Розпочати' },
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
      { locale: 'fr', text: '1 recours complet', included: true, sortOrder: 1 },
      { locale: 'fr', text: 'Tous types de décision', included: true, sortOrder: 2 },
      { locale: 'fr', text: 'Téléchargement PDF & DOCX', included: true, sortOrder: 3 },
      { locale: 'fr', text: '5 agents KI (Multi-LLM)', included: true, sortOrder: 4 },
      { locale: 'fr', text: 'Archive de documents', included: false, sortOrder: 5 },
      { locale: 'it', text: '1 ricorso completo', included: true, sortOrder: 1 },
      { locale: 'it', text: 'Tutti i tipi di decisione', included: true, sortOrder: 2 },
      { locale: 'it', text: 'Download PDF & DOCX', included: true, sortOrder: 3 },
      { locale: 'it', text: '5 agenti KI (Multi-LLM)', included: true, sortOrder: 4 },
      { locale: 'it', text: 'Archivio documenti', included: false, sortOrder: 5 },
      { locale: 'es', text: '1 recurso completo', included: true, sortOrder: 1 },
      { locale: 'es', text: 'Todos los tipos de notificación', included: true, sortOrder: 2 },
      { locale: 'es', text: 'Descarga PDF & DOCX', included: true, sortOrder: 3 },
      { locale: 'es', text: '5 agentes KI (Multi-LLM)', included: true, sortOrder: 4 },
      { locale: 'es', text: 'Archivo de documentos', included: false, sortOrder: 5 },
      { locale: 'pt', text: '1 recurso completo', included: true, sortOrder: 1 },
      { locale: 'pt', text: 'Todos os tipos de decisão', included: true, sortOrder: 2 },
      { locale: 'pt', text: 'Download PDF & DOCX', included: true, sortOrder: 3 },
      { locale: 'pt', text: '5 agentes KI (Multi-LLM)', included: true, sortOrder: 4 },
      { locale: 'pt', text: 'Arquivo de documentos', included: false, sortOrder: 5 },
      { locale: 'tr', text: '1 tam itiraz', included: true, sortOrder: 1 },
      { locale: 'tr', text: 'Tüm bildirim türleri', included: true, sortOrder: 2 },
      { locale: 'tr', text: 'PDF & DOCX indirme', included: true, sortOrder: 3 },
      { locale: 'tr', text: '5 KI ajanı (Multi-LLM)', included: true, sortOrder: 4 },
      { locale: 'tr', text: 'Belge arşivi', included: false, sortOrder: 5 },
      { locale: 'ru', text: '1 полная жалоба', included: true, sortOrder: 1 },
      { locale: 'ru', text: 'Все типы уведомлений', included: true, sortOrder: 2 },
      { locale: 'ru', text: 'Скачивание PDF & DOCX', included: true, sortOrder: 3 },
      { locale: 'ru', text: '5 агентов KI (Multi-LLM)', included: true, sortOrder: 4 },
      { locale: 'ru', text: 'Архив документов', included: false, sortOrder: 5 },
      { locale: 'pl', text: '1 kompletne odwołanie', included: true, sortOrder: 1 },
      { locale: 'pl', text: 'Wszystkie typy decyzji', included: true, sortOrder: 2 },
      { locale: 'pl', text: 'Pobieranie PDF & DOCX', included: true, sortOrder: 3 },
      { locale: 'pl', text: '5 agentów KI (Multi-LLM)', included: true, sortOrder: 4 },
      { locale: 'pl', text: 'Archiwum dokumentów', included: false, sortOrder: 5 },
      { locale: 'ar', text: 'اعتراض واحد كامل', included: true, sortOrder: 1 },
      { locale: 'ar', text: 'جميع أنواع الإشعارات', included: true, sortOrder: 2 },
      { locale: 'ar', text: 'تنزيل PDF & DOCX', included: true, sortOrder: 3 },
      { locale: 'ar', text: '5 وكلاء KI (Multi-LLM)', included: true, sortOrder: 4 },
      { locale: 'ar', text: 'أرشيف المستندات', included: false, sortOrder: 5 },
      { locale: 'uk', text: '1 повна скарга', included: true, sortOrder: 1 },
      { locale: 'uk', text: 'Усі типи повідомлень', included: true, sortOrder: 2 },
      { locale: 'uk', text: 'Завантаження PDF & DOCX', included: true, sortOrder: 3 },
      { locale: 'uk', text: '5 агентів KI (Multi-LLM)', included: true, sortOrder: 4 },
      { locale: 'uk', text: 'Архів документів', included: false, sortOrder: 5 },
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
      fr: { locale: 'fr', name: 'Pack 5', description: '5 recours en réserve — sans date d\'expiration.', cta: 'Acheter le pack 5' },
      it: { locale: 'it', name: 'Pacchetto 5', description: '5 ricorsi in riserva — nessuna scadenza.', cta: 'Acquista il pacchetto 5' },
      es: { locale: 'es', name: 'Pack 5', description: '5 recursos de reserva — sin fecha de caducidad.', cta: 'Comprar pack 5' },
      pt: { locale: 'pt', name: 'Pacote 5', description: '5 recursos em reserva — sem data de validade.', cta: 'Comprar pacote 5' },
      tr: { locale: 'tr', name: '5\'li paket', description: '5 itiraz stokta — son kullanma tarihi yok.', cta: '5\'li paketi satın al' },
      ru: { locale: 'ru', name: 'Пакет 5', description: '5 жалоб в запасе — без срока действия.', cta: 'Купить пакет 5' },
      pl: { locale: 'pl', name: 'Pakiet 5', description: '5 odwołań w zapasie — bez daty ważności.', cta: 'Kup pakiet 5' },
      ar: { locale: 'ar', name: 'حزمة 5', description: '5 اعتراضات في المخزون — بدون تاريخ انتهاء.', cta: 'اشترِ حزمة 5' },
      uk: { locale: 'uk', name: 'Пакет 5', description: '5 скарг у запасі — без терміну дії.', cta: 'Придбати пакет 5' },
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
      { locale: 'fr', text: '5 recours sans expiration', included: true, sortOrder: 1 },
      { locale: 'fr', text: 'Tous types de décision', included: true, sortOrder: 2 },
      { locale: 'fr', text: 'Téléchargement PDF & DOCX', included: true, sortOrder: 3 },
      { locale: 'fr', text: '5 agents KI (Multi-LLM)', included: true, sortOrder: 4 },
      { locale: 'fr', text: 'Archive de documents', included: true, sortOrder: 5 },
      { locale: 'it', text: '5 ricorsi senza scadenza', included: true, sortOrder: 1 },
      { locale: 'it', text: 'Tutti i tipi di decisione', included: true, sortOrder: 2 },
      { locale: 'it', text: 'Download PDF & DOCX', included: true, sortOrder: 3 },
      { locale: 'it', text: '5 agenti KI (Multi-LLM)', included: true, sortOrder: 4 },
      { locale: 'it', text: 'Archivio documenti', included: true, sortOrder: 5 },
      { locale: 'es', text: '5 recursos sin caducidad', included: true, sortOrder: 1 },
      { locale: 'es', text: 'Todos los tipos de notificación', included: true, sortOrder: 2 },
      { locale: 'es', text: 'Descarga PDF & DOCX', included: true, sortOrder: 3 },
      { locale: 'es', text: '5 agentes KI (Multi-LLM)', included: true, sortOrder: 4 },
      { locale: 'es', text: 'Archivo de documentos', included: true, sortOrder: 5 },
      { locale: 'pt', text: '5 recursos sem validade', included: true, sortOrder: 1 },
      { locale: 'pt', text: 'Todos os tipos de decisão', included: true, sortOrder: 2 },
      { locale: 'pt', text: 'Download PDF & DOCX', included: true, sortOrder: 3 },
      { locale: 'pt', text: '5 agentes KI (Multi-LLM)', included: true, sortOrder: 4 },
      { locale: 'pt', text: 'Arquivo de documentos', included: true, sortOrder: 5 },
      { locale: 'tr', text: '5 süresiz itiraz', included: true, sortOrder: 1 },
      { locale: 'tr', text: 'Tüm bildirim türleri', included: true, sortOrder: 2 },
      { locale: 'tr', text: 'PDF & DOCX indirme', included: true, sortOrder: 3 },
      { locale: 'tr', text: '5 KI ajanı (Multi-LLM)', included: true, sortOrder: 4 },
      { locale: 'tr', text: 'Belge arşivi', included: true, sortOrder: 5 },
      { locale: 'ru', text: '5 жалоб без срока действия', included: true, sortOrder: 1 },
      { locale: 'ru', text: 'Все типы уведомлений', included: true, sortOrder: 2 },
      { locale: 'ru', text: 'Скачивание PDF & DOCX', included: true, sortOrder: 3 },
      { locale: 'ru', text: '5 агентов KI (Multi-LLM)', included: true, sortOrder: 4 },
      { locale: 'ru', text: 'Архив документов', included: true, sortOrder: 5 },
      { locale: 'pl', text: '5 odwołań bez ważności', included: true, sortOrder: 1 },
      { locale: 'pl', text: 'Wszystkie typy decyzji', included: true, sortOrder: 2 },
      { locale: 'pl', text: 'Pobieranie PDF & DOCX', included: true, sortOrder: 3 },
      { locale: 'pl', text: '5 agentów KI (Multi-LLM)', included: true, sortOrder: 4 },
      { locale: 'pl', text: 'Archiwum dokumentów', included: true, sortOrder: 5 },
      { locale: 'ar', text: '5 اعتراضات بدون انتهاء صلاحية', included: true, sortOrder: 1 },
      { locale: 'ar', text: 'جميع أنواع الإشعارات', included: true, sortOrder: 2 },
      { locale: 'ar', text: 'تنزيل PDF & DOCX', included: true, sortOrder: 3 },
      { locale: 'ar', text: '5 وكلاء KI (Multi-LLM)', included: true, sortOrder: 4 },
      { locale: 'ar', text: 'أرشيف المستندات', included: true, sortOrder: 5 },
      { locale: 'uk', text: '5 скарг без терміну дії', included: true, sortOrder: 1 },
      { locale: 'uk', text: 'Усі типи повідомлень', included: true, sortOrder: 2 },
      { locale: 'uk', text: 'Завантаження PDF & DOCX', included: true, sortOrder: 3 },
      { locale: 'uk', text: '5 агентів KI (Multi-LLM)', included: true, sortOrder: 4 },
      { locale: 'uk', text: 'Архів документів', included: true, sortOrder: 5 },
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
      fr: { locale: 'fr', name: 'Abonnement mensuel', description: 'Recours illimités. Résiliation à tout moment.', cta: 'Commencer le mois' },
      it: { locale: 'it', name: 'Abbonamento mensile', description: 'Ricorsi illimitati. Disdici quando vuoi.', cta: 'Inizia il mese' },
      es: { locale: 'es', name: 'Suscripción mensual', description: 'Recursos ilimitados. Cancela en cualquier momento.', cta: 'Empezar el mes' },
      pt: { locale: 'pt', name: 'Assinatura mensal', description: 'Recursos ilimitados. Cancele a qualquer momento.', cta: 'Começar o mês' },
      tr: { locale: 'tr', name: 'Aylık abonelik', description: 'Sınırsız itiraz. İstediğiniz zaman iptal edin.', cta: 'Aylığı başlat' },
      ru: { locale: 'ru', name: 'Месячная подписка', description: 'Неограниченные жалобы. Отмена в любое время.', cta: 'Начать месяц' },
      pl: { locale: 'pl', name: 'Abonament miesięczny', description: 'Nieograniczone odwołania. Anuluj w każdej chwili.', cta: 'Rozpocznij miesiąc' },
      ar: { locale: 'ar', name: 'اشتراك شهري', description: 'اعتراضات غير محدودة. إلغاء في أي وقت.', cta: 'ابدأ الشهر' },
      uk: { locale: 'uk', name: 'Місячна підписка', description: 'Необмежені скарги. Скасуйте будь-коли.', cta: 'Розпочати місяць' },
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
      { locale: 'fr', text: 'Recours illimités', included: true, sortOrder: 1 },
      { locale: 'fr', text: 'Tous types de décision', included: true, sortOrder: 2 },
      { locale: 'fr', text: 'Téléchargement PDF & DOCX', included: true, sortOrder: 3 },
      { locale: 'fr', text: 'Archive de documents', included: true, sortOrder: 4 },
      { locale: 'fr', text: 'Vérification pro à €69/dossier (au lieu de €99)', included: true, sortOrder: 5 },
      { locale: 'it', text: 'Ricorsi illimitati', included: true, sortOrder: 1 },
      { locale: 'it', text: 'Tutti i tipi di decisione', included: true, sortOrder: 2 },
      { locale: 'it', text: 'Download PDF & DOCX', included: true, sortOrder: 3 },
      { locale: 'it', text: 'Archivio documenti', included: true, sortOrder: 4 },
      { locale: 'it', text: 'Revisione professionale a €69/caso (anziché €99)', included: true, sortOrder: 5 },
      { locale: 'es', text: 'Recursos ilimitados', included: true, sortOrder: 1 },
      { locale: 'es', text: 'Todos los tipos de notificación', included: true, sortOrder: 2 },
      { locale: 'es', text: 'Descarga PDF & DOCX', included: true, sortOrder: 3 },
      { locale: 'es', text: 'Archivo de documentos', included: true, sortOrder: 4 },
      { locale: 'es', text: 'Revisión profesional a €69/caso (en lugar de €99)', included: true, sortOrder: 5 },
      { locale: 'pt', text: 'Recursos ilimitados', included: true, sortOrder: 1 },
      { locale: 'pt', text: 'Todos os tipos de decisão', included: true, sortOrder: 2 },
      { locale: 'pt', text: 'Download PDF & DOCX', included: true, sortOrder: 3 },
      { locale: 'pt', text: 'Arquivo de documentos', included: true, sortOrder: 4 },
      { locale: 'pt', text: 'Revisão profissional a €69/caso (em vez de €99)', included: true, sortOrder: 5 },
      { locale: 'tr', text: 'Sınırsız itiraz', included: true, sortOrder: 1 },
      { locale: 'tr', text: 'Tüm bildirim türleri', included: true, sortOrder: 2 },
      { locale: 'tr', text: 'PDF & DOCX indirme', included: true, sortOrder: 3 },
      { locale: 'tr', text: 'Belge arşivi', included: true, sortOrder: 4 },
      { locale: 'tr', text: 'Uzman incelemesi €69/dava (€99 yerine)', included: true, sortOrder: 5 },
      { locale: 'ru', text: 'Неограниченные жалобы', included: true, sortOrder: 1 },
      { locale: 'ru', text: 'Все типы уведомлений', included: true, sortOrder: 2 },
      { locale: 'ru', text: 'Скачивание PDF & DOCX', included: true, sortOrder: 3 },
      { locale: 'ru', text: 'Архив документов', included: true, sortOrder: 4 },
      { locale: 'ru', text: 'Проверка специалистом за €69/дело (вместо €99)', included: true, sortOrder: 5 },
      { locale: 'pl', text: 'Nieograniczone odwołania', included: true, sortOrder: 1 },
      { locale: 'pl', text: 'Wszystkie typy decyzji', included: true, sortOrder: 2 },
      { locale: 'pl', text: 'Pobieranie PDF & DOCX', included: true, sortOrder: 3 },
      { locale: 'pl', text: 'Archiwum dokumentów', included: true, sortOrder: 4 },
      { locale: 'pl', text: 'Weryfikacja eksperta za €69/sprawę (zamiast €99)', included: true, sortOrder: 5 },
      { locale: 'ar', text: 'اعتراضات غير محدودة', included: true, sortOrder: 1 },
      { locale: 'ar', text: 'جميع أنواع الإشعارات', included: true, sortOrder: 2 },
      { locale: 'ar', text: 'تنزيل PDF & DOCX', included: true, sortOrder: 3 },
      { locale: 'ar', text: 'أرشيف المستندات', included: true, sortOrder: 4 },
      { locale: 'ar', text: 'مراجعة متخصص بـ €69/حالة (بدلاً من €99)', included: true, sortOrder: 5 },
      { locale: 'uk', text: 'Необмежені скарги', included: true, sortOrder: 1 },
      { locale: 'uk', text: 'Усі типи повідомлень', included: true, sortOrder: 2 },
      { locale: 'uk', text: 'Завантаження PDF & DOCX', included: true, sortOrder: 3 },
      { locale: 'uk', text: 'Архів документів', included: true, sortOrder: 4 },
      { locale: 'uk', text: 'Перевірка фахівцем за €69/справу (замість €99)', included: true, sortOrder: 5 },
    ],
  },

  // ── Add-on plans (userGroup: 'addon' — not shown in the subscription grid) ─
  {
    slug: 'expert-review',
    userGroup: 'addon',
    priceOnce: 99,
    priceMonthly: null,
    priceAnnual: null,
    currency: 'EUR',
    isPopular: false,
    isActive: true,
    translations: {
      de: { locale: 'de', name: 'Profi-Prüfung', description: 'Einspruch durch verifizierten Steuerberater oder Rechtsanwalt prüfen lassen.', cta: 'Jetzt buchen' },
      en: { locale: 'en', name: 'Professional review', description: 'Have your objection reviewed by a verified tax adviser or lawyer.', cta: 'Book now' },
      fr: { locale: 'fr', name: 'Vérification professionnelle', description: 'Faites vérifier votre recours par un conseiller fiscal ou avocat certifié.', cta: 'Réserver' },
      it: { locale: 'it', name: 'Revisione professionale', description: 'Fai revisionare il tuo ricorso da un consulente fiscale o avvocato certificato.', cta: 'Prenota ora' },
      es: { locale: 'es', name: 'Revisión profesional', description: 'Haz revisar tu recurso por un asesor fiscal o abogado certificado.', cta: 'Reservar ahora' },
      pt: { locale: 'pt', name: 'Revisão profissional', description: 'Peça a revisão do seu recurso por um consultor fiscal ou advogado certificado.', cta: 'Reservar agora' },
      tr: { locale: 'tr', name: 'Profesyonel inceleme', description: 'İtirazınızı sertifikalı bir vergi danışmanı veya avukat tarafından inceletin.', cta: 'Hemen rezervasyon' },
      ru: { locale: 'ru', name: 'Профессиональная проверка', description: 'Поручите проверку жалобы сертифицированному налоговому консультанту или адвокату.', cta: 'Забронировать' },
      pl: { locale: 'pl', name: 'Profesjonalna weryfikacja', description: 'Zleć weryfikację odwołania certyfikowanemu doradcy podatkowemu lub prawnikowi.', cta: 'Zarezerwuj teraz' },
      ar: { locale: 'ar', name: 'مراجعة احترافية', description: 'اطلب مراجعة اعتراضك من مستشار ضريبي أو محامٍ معتمد.', cta: 'احجز الآن' },
      uk: { locale: 'uk', name: 'Професійна перевірка', description: 'Доручіть перевірку скарги сертифікованому податковому консультанту або адвокату.', cta: 'Замовити зараз' },
    },
    features: [
      { locale: 'de', text: 'Prüfung durch verifizierten Experten', included: true, sortOrder: 1 },
      { locale: 'de', text: 'Rückmeldung innerhalb von 72 Stunden', included: true, sortOrder: 2 },
      { locale: 'de', text: 'Kommentare & Korrekturen im Entwurf', included: true, sortOrder: 3 },
      { locale: 'de', text: 'Optionale Vollvertretung möglich', included: true, sortOrder: 4 },
      { locale: 'en', text: 'Review by verified expert', included: true, sortOrder: 1 },
      { locale: 'en', text: 'Feedback within 72 hours', included: true, sortOrder: 2 },
      { locale: 'en', text: 'Comments & edits on draft', included: true, sortOrder: 3 },
      { locale: 'en', text: 'Full representation optional', included: true, sortOrder: 4 },
      { locale: 'fr', text: 'Vérification par un expert certifié', included: true, sortOrder: 1 },
      { locale: 'fr', text: 'Retour sous 72 heures', included: true, sortOrder: 2 },
      { locale: 'fr', text: 'Commentaires & corrections sur le brouillon', included: true, sortOrder: 3 },
      { locale: 'fr', text: 'Représentation complète en option', included: true, sortOrder: 4 },
      { locale: 'it', text: 'Revisione da esperto certificato', included: true, sortOrder: 1 },
      { locale: 'it', text: 'Feedback entro 72 ore', included: true, sortOrder: 2 },
      { locale: 'it', text: 'Commenti e correzioni sulla bozza', included: true, sortOrder: 3 },
      { locale: 'it', text: 'Rappresentanza completa opzionale', included: true, sortOrder: 4 },
      { locale: 'es', text: 'Revisión por experto certificado', included: true, sortOrder: 1 },
      { locale: 'es', text: 'Respuesta en 72 horas', included: true, sortOrder: 2 },
      { locale: 'es', text: 'Comentarios y correcciones en el borrador', included: true, sortOrder: 3 },
      { locale: 'es', text: 'Representación completa opcional', included: true, sortOrder: 4 },
      { locale: 'pt', text: 'Revisão por especialista certificado', included: true, sortOrder: 1 },
      { locale: 'pt', text: 'Resposta em 72 horas', included: true, sortOrder: 2 },
      { locale: 'pt', text: 'Comentários e correções no rascunho', included: true, sortOrder: 3 },
      { locale: 'pt', text: 'Representação completa opcional', included: true, sortOrder: 4 },
      { locale: 'tr', text: 'Sertifikalı uzman tarafından inceleme', included: true, sortOrder: 1 },
      { locale: 'tr', text: '72 saat içinde geri bildirim', included: true, sortOrder: 2 },
      { locale: 'tr', text: 'Taslak üzerinde yorum ve düzeltmeler', included: true, sortOrder: 3 },
      { locale: 'tr', text: 'Tam temsil isteğe bağlı', included: true, sortOrder: 4 },
      { locale: 'ru', text: 'Проверка сертифицированным экспертом', included: true, sortOrder: 1 },
      { locale: 'ru', text: 'Ответ в течение 72 часов', included: true, sortOrder: 2 },
      { locale: 'ru', text: 'Комментарии и правки в черновике', included: true, sortOrder: 3 },
      { locale: 'ru', text: 'Полное представительство по желанию', included: true, sortOrder: 4 },
      { locale: 'pl', text: 'Weryfikacja przez certyfikowanego eksperta', included: true, sortOrder: 1 },
      { locale: 'pl', text: 'Odpowiedź w ciągu 72 godzin', included: true, sortOrder: 2 },
      { locale: 'pl', text: 'Komentarze i poprawki w roboczej wersji', included: true, sortOrder: 3 },
      { locale: 'pl', text: 'Pełne pełnomocnictwo opcjonalne', included: true, sortOrder: 4 },
      { locale: 'ar', text: 'مراجعة من قِبل خبير معتمد', included: true, sortOrder: 1 },
      { locale: 'ar', text: 'ردّ خلال 72 ساعة', included: true, sortOrder: 2 },
      { locale: 'ar', text: 'تعليقات وتصحيحات على المسوّدة', included: true, sortOrder: 3 },
      { locale: 'ar', text: 'التمثيل الكامل اختياري', included: true, sortOrder: 4 },
      { locale: 'uk', text: 'Перевірка сертифікованим фахівцем', included: true, sortOrder: 1 },
      { locale: 'uk', text: 'Відповідь протягом 72 годин', included: true, sortOrder: 2 },
      { locale: 'uk', text: 'Коментарі та правки у чернетці', included: true, sortOrder: 3 },
      { locale: 'uk', text: 'Повне представництво за бажанням', included: true, sortOrder: 4 },
    ],
  },
  {
    slug: 'expert-review-subscriber',
    userGroup: 'addon',
    priceOnce: 69,
    priceMonthly: null,
    priceAnnual: null,
    currency: 'EUR',
    isPopular: false,
    isActive: true,
    translations: {
      de: { locale: 'de', name: 'Profi-Prüfung (Abo-Rabatt)', description: 'Rabattierter Expertencheck für aktive Monats-Flat-Abonnenten.', cta: 'Jetzt buchen' },
      en: { locale: 'en', name: 'Professional review (subscriber)', description: 'Discounted expert review for active monthly subscribers.', cta: 'Book now' },
      fr: { locale: 'fr', name: 'Vérification pro (abonné)', description: 'Vérification à tarif réduit pour les abonnés au forfait mensuel actif.', cta: 'Réserver' },
      it: { locale: 'it', name: 'Revisione pro (abbonato)', description: 'Revisione a prezzo ridotto per gli abbonati mensili attivi.', cta: 'Prenota ora' },
      es: { locale: 'es', name: 'Revisión pro (suscriptor)', description: 'Revisión con descuento para suscriptores mensuales activos.', cta: 'Reservar ahora' },
      pt: { locale: 'pt', name: 'Revisão pro (assinante)', description: 'Revisão com desconto para assinantes mensais ativos.', cta: 'Reservar agora' },
      tr: { locale: 'tr', name: 'Profesyonel inceleme (abone)', description: 'Aktif aylık aboneler için indirimli uzman incelemesi.', cta: 'Hemen rezervasyon' },
      ru: { locale: 'ru', name: 'Профессиональная проверка (подписчик)', description: 'Проверка со скидкой для активных ежемесячных подписчиков.', cta: 'Забронировать' },
      pl: { locale: 'pl', name: 'Profesjonalna weryfikacja (subskrybent)', description: 'Weryfikacja w obniżonej cenie dla aktywnych subskrybentów miesięcznych.', cta: 'Zarezerwuj teraz' },
      ar: { locale: 'ar', name: 'مراجعة احترافية (مشترك)', description: 'مراجعة بسعر مخفّض للمشتركين النشطين في الخطة الشهرية.', cta: 'احجز الآن' },
      uk: { locale: 'uk', name: 'Професійна перевірка (підписник)', description: 'Перевірка зі знижкою для активних щомісячних підписників.', cta: 'Замовити зараз' },
    },
    features: [
      { locale: 'de', text: 'Prüfung durch verifizierten Experten', included: true, sortOrder: 1 },
      { locale: 'de', text: 'Rückmeldung innerhalb von 72 Stunden', included: true, sortOrder: 2 },
      { locale: 'de', text: 'Kommentare & Korrekturen im Entwurf', included: true, sortOrder: 3 },
      { locale: 'de', text: 'Optionale Vollvertretung möglich', included: true, sortOrder: 4 },
      { locale: 'de', text: 'Abonnenten-Preis (statt €99)', included: true, sortOrder: 5 },
      { locale: 'en', text: 'Review by verified expert', included: true, sortOrder: 1 },
      { locale: 'en', text: 'Feedback within 72 hours', included: true, sortOrder: 2 },
      { locale: 'en', text: 'Comments & edits on draft', included: true, sortOrder: 3 },
      { locale: 'en', text: 'Full representation optional', included: true, sortOrder: 4 },
      { locale: 'en', text: 'Subscriber price (vs €99)', included: true, sortOrder: 5 },
      { locale: 'fr', text: 'Vérification par un expert certifié', included: true, sortOrder: 1 },
      { locale: 'fr', text: 'Retour sous 72 heures', included: true, sortOrder: 2 },
      { locale: 'fr', text: 'Commentaires & corrections sur le brouillon', included: true, sortOrder: 3 },
      { locale: 'fr', text: 'Représentation complète en option', included: true, sortOrder: 4 },
      { locale: 'fr', text: 'Tarif abonné (au lieu de €99)', included: true, sortOrder: 5 },
      { locale: 'it', text: 'Revisione da esperto certificato', included: true, sortOrder: 1 },
      { locale: 'it', text: 'Feedback entro 72 ore', included: true, sortOrder: 2 },
      { locale: 'it', text: 'Commenti e correzioni sulla bozza', included: true, sortOrder: 3 },
      { locale: 'it', text: 'Rappresentanza completa opzionale', included: true, sortOrder: 4 },
      { locale: 'it', text: 'Prezzo abbonato (invece di €99)', included: true, sortOrder: 5 },
      { locale: 'es', text: 'Revisión por experto certificado', included: true, sortOrder: 1 },
      { locale: 'es', text: 'Respuesta en 72 horas', included: true, sortOrder: 2 },
      { locale: 'es', text: 'Comentarios y correcciones en el borrador', included: true, sortOrder: 3 },
      { locale: 'es', text: 'Representación completa opcional', included: true, sortOrder: 4 },
      { locale: 'es', text: 'Precio suscriptor (en vez de €99)', included: true, sortOrder: 5 },
      { locale: 'pt', text: 'Revisão por especialista certificado', included: true, sortOrder: 1 },
      { locale: 'pt', text: 'Resposta em 72 horas', included: true, sortOrder: 2 },
      { locale: 'pt', text: 'Comentários e correções no rascunho', included: true, sortOrder: 3 },
      { locale: 'pt', text: 'Representação completa opcional', included: true, sortOrder: 4 },
      { locale: 'pt', text: 'Preço assinante (em vez de €99)', included: true, sortOrder: 5 },
      { locale: 'tr', text: 'Sertifikalı uzman tarafından inceleme', included: true, sortOrder: 1 },
      { locale: 'tr', text: '72 saat içinde geri bildirim', included: true, sortOrder: 2 },
      { locale: 'tr', text: 'Taslak üzerinde yorum ve düzeltmeler', included: true, sortOrder: 3 },
      { locale: 'tr', text: 'Tam temsil isteğe bağlı', included: true, sortOrder: 4 },
      { locale: 'tr', text: 'Abone fiyatı (€99 yerine)', included: true, sortOrder: 5 },
      { locale: 'ru', text: 'Проверка сертифицированным экспертом', included: true, sortOrder: 1 },
      { locale: 'ru', text: 'Ответ в течение 72 часов', included: true, sortOrder: 2 },
      { locale: 'ru', text: 'Комментарии и правки в черновике', included: true, sortOrder: 3 },
      { locale: 'ru', text: 'Полное представительство по желанию', included: true, sortOrder: 4 },
      { locale: 'ru', text: 'Цена подписчика (вместо €99)', included: true, sortOrder: 5 },
      { locale: 'pl', text: 'Weryfikacja przez certyfikowanego eksperta', included: true, sortOrder: 1 },
      { locale: 'pl', text: 'Odpowiedź w ciągu 72 godzin', included: true, sortOrder: 2 },
      { locale: 'pl', text: 'Komentarze i poprawki w roboczej wersji', included: true, sortOrder: 3 },
      { locale: 'pl', text: 'Pełne pełnomocnictwo opcjonalne', included: true, sortOrder: 4 },
      { locale: 'pl', text: 'Cena subskrybenta (zamiast €99)', included: true, sortOrder: 5 },
      { locale: 'ar', text: 'مراجعة من قِبل خبير معتمد', included: true, sortOrder: 1 },
      { locale: 'ar', text: 'ردّ خلال 72 ساعة', included: true, sortOrder: 2 },
      { locale: 'ar', text: 'تعليقات وتصحيحات على المسوّدة', included: true, sortOrder: 3 },
      { locale: 'ar', text: 'التمثيل الكامل اختياري', included: true, sortOrder: 4 },
      { locale: 'ar', text: 'سعر المشترك (بدلاً من €99)', included: true, sortOrder: 5 },
      { locale: 'uk', text: 'Перевірка сертифікованим фахівцем', included: true, sortOrder: 1 },
      { locale: 'uk', text: 'Відповідь протягом 72 годин', included: true, sortOrder: 2 },
      { locale: 'uk', text: 'Коментарі та правки у чернетці', included: true, sortOrder: 3 },
      { locale: 'uk', text: 'Повне представництво за бажанням', included: true, sortOrder: 4 },
      { locale: 'uk', text: 'Ціна підписника (замість €99)', included: true, sortOrder: 5 },
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
