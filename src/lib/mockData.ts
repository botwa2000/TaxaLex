// Demo data for UI testing — used when DB is unavailable or user is demo admin
// All data is fabricated and for demonstration purposes only.

export const DEMO_USER_ID = 'demo_admin_001'

export const DEMO_USER = {
  id: DEMO_USER_ID,
  email: 'admin@demo.com',
  name: 'Max Mustermann',
  role: 'ADMIN',
  locale: 'de',
  outputLanguage: 'de',
  createdAt: new Date('2024-01-15'),
}

const now = new Date()
const daysFromNow = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000)
const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000)

export const DEMO_CASES = [
  {
    id: 'case_3f8a9b2c',
    userId: DEMO_USER_ID,
    useCase: 'tax',
    status: 'DRAFT_READY',
    deadline: daysFromNow(7),
    createdAt: daysAgo(5),
    updatedAt: daysAgo(1),
    bescheidData: {
      finanzamt: 'Finanzamt München I',
      steuernummer: '143/234/56789',
      bescheidDatum: '2024-01-10',
      steuerart: 'Einkommensteuer 2022',
      nachzahlung: 3420,
      streitigerBetrag: 3420,
    },
    _count: { documents: 3 },
  },
  {
    id: 'case_7e1d4f5a',
    userId: DEMO_USER_ID,
    useCase: 'jobcenter',
    status: 'SUBMITTED',
    deadline: null,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(12),
    bescheidData: {
      behoerde: 'Jobcenter München',
      bescheidDatum: '2023-12-01',
      betrag: 190,
      grund: 'Sanktion wegen versäumter Meldung',
    },
    _count: { documents: 2 },
  },
  {
    id: 'case_2c6b8d3e',
    userId: DEMO_USER_ID,
    useCase: 'krankenversicherung',
    status: 'AWAITING_RESPONSE',
    deadline: daysFromNow(45),
    createdAt: daysAgo(60),
    updatedAt: daysAgo(20),
    bescheidData: {
      kasse: 'AOK Bayern',
      bescheidDatum: '2023-11-15',
      streitigerBetrag: 780,
      grund: 'Abgelehnte Kostenübernahme Physiotherapie',
    },
    _count: { documents: 4 },
  },
  {
    id: 'case_9a4c1e7f',
    userId: DEMO_USER_ID,
    useCase: 'rente',
    status: 'CLOSED_SUCCESS',
    deadline: null,
    createdAt: daysAgo(120),
    updatedAt: daysAgo(45),
    bescheidData: {
      behoerde: 'Deutsche Rentenversicherung',
      bescheidDatum: '2023-08-20',
      streitigerBetrag: 55,
      grund: 'Falsche Berechnung Rentenpunkte',
    },
    _count: { documents: 5 },
  },
  {
    id: 'case_5b2f6a8d',
    userId: DEMO_USER_ID,
    useCase: 'miete',
    status: 'QUESTIONS',
    deadline: daysFromNow(21),
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
    bescheidData: null,
    _count: { documents: 1 },
  },
]

export const DEMO_DOCUMENTS: Record<string, { id: string; name: string; type: string; createdAt: Date }[]> = {
  case_3f8a9b2c: [
    { id: 'doc_1', name: 'Steuerbescheid_2022.pdf', type: 'BESCHEID', createdAt: daysAgo(5) },
    { id: 'doc_2', name: 'Einkommensnachweise_2022.pdf', type: 'BELEG', createdAt: daysAgo(5) },
    { id: 'doc_3', name: 'Einspruch_Entwurf.pdf', type: 'EINSPRUCH_DRAFT', createdAt: daysAgo(1) },
  ],
  case_7e1d4f5a: [
    { id: 'doc_4', name: 'Sanktionsbescheid.pdf', type: 'BESCHEID', createdAt: daysAgo(30) },
    { id: 'doc_5', name: 'Einspruch_Jobcenter.pdf', type: 'EINSPRUCH_FINAL', createdAt: daysAgo(12) },
  ],
  case_2c6b8d3e: [
    { id: 'doc_6', name: 'Ablehnungsbescheid_AOK.pdf', type: 'BESCHEID', createdAt: daysAgo(60) },
    { id: 'doc_7', name: 'Arztbericht_Physiotherapie.pdf', type: 'BELEG', createdAt: daysAgo(60) },
    { id: 'doc_8', name: 'Verordnung_Dr_Schmidt.pdf', type: 'BELEG', createdAt: daysAgo(55) },
    { id: 'doc_9', name: 'Widerspruch_AOK.pdf', type: 'EINSPRUCH_FINAL', createdAt: daysAgo(20) },
  ],
  case_9a4c1e7f: [
    { id: 'doc_10', name: 'Rentenbescheid_2023.pdf', type: 'BESCHEID', createdAt: daysAgo(120) },
    { id: 'doc_11', name: 'Versicherungsverlauf.pdf', type: 'BELEG', createdAt: daysAgo(118) },
    { id: 'doc_12', name: 'Einspruch_Rente.pdf', type: 'EINSPRUCH_FINAL', createdAt: daysAgo(100) },
    { id: 'doc_13', name: 'Antwort_DRV.pdf', type: 'BEHOERDEN_ANTWORT', createdAt: daysAgo(60) },
    { id: 'doc_14', name: 'Bescheid_Abhilfe.pdf', type: 'BEHOERDEN_ANTWORT', createdAt: daysAgo(45) },
  ],
  case_5b2f6a8d: [
    { id: 'doc_15', name: 'Mieterhoehung_Schreiben.pdf', type: 'BESCHEID', createdAt: daysAgo(2) },
  ],
}

export const DEMO_AGENT_OUTPUTS: Record<string, { role: string; provider: string; model: string; durationMs: number; summary: string }[]> = {
  case_3f8a9b2c: [
    { role: 'drafter', provider: 'anthropic', model: 'claude-sonnet-4-20250514', durationMs: 8420, summary: 'Einspruch-Entwurf erstellt. Strittige Punkte: Werbungskosten (§ 9 EStG), Fahrtkosten zum Arbeitsplatz nicht vollständig berücksichtigt. Antrag auf Aussetzung der Vollziehung (§ 361 AO) formuliert.' },
    { role: 'reviewer', provider: 'google', model: 'gemini-1.5-pro', durationMs: 5210, summary: '3 Verbesserungen identifiziert: (1) BFH-Urteil XI R 24/20 ergänzen; (2) Beweislastumkehr nach § 96 FGO präzisieren; (3) Fristnennung im Betreff fehlt.' },
    { role: 'factchecker', provider: 'perplexity', model: 'sonar-pro', durationMs: 11340, summary: 'Alle Gesetzeszitate korrekt. BFH XI R 24/20 verifiziert und aktuell gültig. § 9 EStG in der zitierten Fassung korrekt. Kein Änderungsbedarf bei Rechtsgrundlagen.' },
    { role: 'adversary', provider: 'anthropic', model: 'claude-sonnet-4-20250514', durationMs: 6890, summary: 'Schwachstellen: (1) Fehlende Quittungen für Fahrtkosten — mittleres Risiko; (2) Homeoffice-Abzug nicht durch Mietvertrag belegt — hohes Risiko. Empfehlung: Belege als Anlage beifügen.' },
    { role: 'consolidator', provider: 'anthropic', model: 'claude-sonnet-4-20250514', durationMs: 9120, summary: 'Finales Dokument konsolidiert. Alle Reviewer-Hinweise eingearbeitet. Fehlende Belege als Anlage-Vermerk ergänzt. Dokument ist einreichbereit.' },
  ],
}

export const DEMO_FINAL_DRAFT = `An das
Finanzamt München I
Deroystraße 18
80335 München

München, ${new Date().toLocaleDateString('de-DE')}

Steuernummer: 143/234/56789
Einkommensteuer 2022

**Einspruch gegen den Einkommensteuerbescheid 2022 vom 10.01.2024**

Sehr geehrte Damen und Herren,

hiermit lege ich gemäß § 347 Abs. 1 AO fristgerecht **Einspruch** gegen den Einkommensteuerbescheid 2022 vom 10.01.2024, Az. 143/234/56789, ein.

**Antrag**

Ich beantrage, den Steuerbescheid zu ändern und die Einkommensteuer 2022 auf 0,00 € festzusetzen. Hilfsweise beantrage ich die Aussetzung der Vollziehung gemäß § 361 Abs. 2 AO in Höhe von 3.420,00 €.

**Begründung**

**1. Werbungskosten für Fahrten zur Arbeitsstätte (§ 9 Abs. 1 Nr. 4 EStG)**

Das Finanzamt hat die Fahrtkosten für meine Pendelstrecke von 47 km (einfach) an 220 Arbeitstagen nicht vollständig anerkannt. Nach § 9 Abs. 1 Nr. 4 EStG i.V.m. dem BFH-Urteil vom 19.08.2021, Az. XI R 24/20, sind Fahrtkosten mit der Entfernungspauschale von 0,30 € je Entfernungskilometer für die ersten 20 km und 0,38 € ab dem 21. Kilometer absetzbar.

Berechnung: 20 km × 0,30 € × 220 Tage = 1.320,00 €
              27 km × 0,38 € × 220 Tage = 2.257,20 €
              **Gesamt: 3.577,20 €**

Tatsächlich anerkannt wurden lediglich 2.112,00 €. Die Differenz von **1.465,20 €** ist als weitere Werbungskosten anzuerkennen.

**2. Arbeitszimmer (§ 4 Abs. 5 Nr. 6b EStG)**

Ich war im Veranlagungszeitraum 2022 aufgrund der pandemiebedingten Homeoffice-Regelungen meines Arbeitgebers überwiegend im häuslichen Arbeitszimmer tätig. Der Pauschalbetrag von 600,00 € (§ 4 Abs. 5 Nr. 6b Satz 4 EStG) wurde nicht berücksichtigt.

**Beweisangebote**

Als Anlagen füge ich bei:
- Anlage 1: Arbeitgeberbescheinigung über Homeoffice-Tage 2022
- Anlage 2: Kontoauszüge als Belege für Fahrtkosten (Tankquittungen)
- Anlage 3: Mietvertrag mit Raumaufteilung

**Antrag auf Aussetzung der Vollziehung**

Ich beantrage zusätzlich die Aussetzung der Vollziehung des angefochtenen Bescheids gemäß § 361 Abs. 2 AO, da ernstliche Zweifel an der Rechtmäßigkeit des Bescheids bestehen.

Mit freundlichen Grüßen

Max Mustermann`

// Stats for dashboard
export function getDemoStats() {
  const cases = DEMO_CASES
  const openStatuses = ['CREATED', 'UPLOADING', 'ANALYZING', 'QUESTIONS', 'GENERATING', 'DRAFT_READY']
  const open = cases.filter((c) => openStatuses.includes(c.status)).length
  const submitted = cases.filter((c) => c.status === 'SUBMITTED' || c.status === 'AWAITING_RESPONSE').length
  const urgent = cases.filter(
    (c) => c.deadline && c.deadline > now && Math.ceil((c.deadline.getTime() - now.getTime()) / 86400000) <= 7
  ).length
  const closed = cases.filter((c) => c.status === 'CLOSED_SUCCESS' || c.status === 'CLOSED_PARTIAL').length
  return { open, submitted, urgent, total: cases.length, closed }
}

// All-users list for admin panel — matches seed.ts accounts
export const DEMO_USERS = [
  { id: DEMO_USER_ID,          name: 'Max Mustermann', email: 'admin@taxalex.de',        role: 'ADMIN',   createdAt: daysAgo(180), cases: 5 },
  { id: 'demo_advisor_001',    name: 'Karin Müller',   email: 'advisor@demo.taxalex.de', role: 'ADVISOR', createdAt: daysAgo(90),  cases: 12 },
  { id: 'demo_lawyer_001',     name: 'Dr. Fischer',    email: 'lawyer@demo.taxalex.de',  role: 'LAWYER',  createdAt: daysAgo(75),  cases: 8 },
  { id: 'demo_user_001',       name: 'Anna Schmidt',   email: 'user@demo.taxalex.de',    role: 'USER',    createdAt: daysAgo(45),  cases: 3 },
  { id: 'demo_expat_001',      name: 'James Wilson',   email: 'expat@demo.taxalex.de',   role: 'USER',    createdAt: daysAgo(14),  cases: 1 },
]

// Clients for the advisor/lawyer portal demo
export interface DemoClient {
  id: string
  name: string
  email: string
  phone?: string
  cases: number
  lastActive: Date
  status: 'active' | 'inactive'
  advisorId: string
}

export interface DemoClientCase {
  id: string
  clientId: string
  useCase: string
  status: string
  createdAt: Date
  deadline?: Date | null
}

export const DEMO_CLIENTS: DemoClient[] = [
  { id: 'client_001', name: 'Hermann Becker',   email: 'h.becker@example.com',    cases: 3, lastActive: daysAgo(2),  status: 'active',   advisorId: 'demo_advisor_001' },
  { id: 'client_002', name: 'Sabine Richter',   email: 's.richter@example.com',   cases: 1, lastActive: daysAgo(7),  status: 'active',   advisorId: 'demo_advisor_001' },
  { id: 'client_003', name: 'Michael Bauer',    email: 'm.bauer@example.com',     cases: 5, lastActive: daysAgo(14), status: 'active',   advisorId: 'demo_advisor_001' },
  { id: 'client_004', name: 'Elena Hoffmann',   email: 'e.hoffmann@example.com',  cases: 2, lastActive: daysAgo(30), status: 'inactive', advisorId: 'demo_advisor_001' },
  { id: 'client_005', name: 'Klaus Zimmermann', email: 'k.zimmermann@example.com', cases: 1, lastActive: daysAgo(60), status: 'inactive', advisorId: 'demo_advisor_001' },
]

export const DEMO_CLIENT_CASES: DemoClientCase[] = [
  { id: 'cc_001', clientId: 'client_001', useCase: 'tax',             status: 'DRAFT_READY',       createdAt: daysAgo(5),  deadline: daysFromNow(25) },
  { id: 'cc_002', clientId: 'client_001', useCase: 'grundsteuer',     status: 'SUBMITTED',          createdAt: daysAgo(30), deadline: null },
  { id: 'cc_003', clientId: 'client_001', useCase: 'rente',           status: 'AWAITING_RESPONSE',  createdAt: daysAgo(90), deadline: null },
  { id: 'cc_004', clientId: 'client_002', useCase: 'jobcenter',       status: 'QUESTIONS',          createdAt: daysAgo(3),  deadline: daysFromNow(27) },
  { id: 'cc_005', clientId: 'client_003', useCase: 'tax',             status: 'DRAFT_READY',        createdAt: daysAgo(8),  deadline: daysFromNow(22) },
  { id: 'cc_006', clientId: 'client_003', useCase: 'krankenversicherung', status: 'SUBMITTED',      createdAt: daysAgo(45), deadline: null },
  { id: 'cc_007', clientId: 'client_003', useCase: 'bussgeld',        status: 'CLOSED_SUCCESS',     createdAt: daysAgo(100), deadline: null },
  { id: 'cc_008', clientId: 'client_003', useCase: 'miete',           status: 'CREATING',           createdAt: daysAgo(1),  deadline: daysFromNow(29) },
  { id: 'cc_009', clientId: 'client_003', useCase: 'rente',           status: 'AWAITING_RESPONSE',  createdAt: daysAgo(60), deadline: null },
  { id: 'cc_010', clientId: 'client_004', useCase: 'tax',             status: 'CLOSED_SUCCESS',     createdAt: daysAgo(120), deadline: null },
  { id: 'cc_011', clientId: 'client_004', useCase: 'kuendigung',      status: 'SUBMITTED',          createdAt: daysAgo(35), deadline: null },
  { id: 'cc_012', clientId: 'client_005', useCase: 'grundsteuer',     status: 'DRAFT_READY',        createdAt: daysAgo(12), deadline: daysFromNow(18) },
]

// Helper: get cases for a specific advisor's clients
export function getAdvisorCases(advisorId: string): DemoClientCase[] {
  const clientIds = new Set(DEMO_CLIENTS.filter((c) => c.advisorId === advisorId).map((c) => c.id))
  return DEMO_CLIENT_CASES.filter((c) => clientIds.has(c.clientId))
}

// Helper: get advisor dashboard stats
export function getAdvisorStats(advisorId: string) {
  const cases = getAdvisorCases(advisorId)
  const clients = DEMO_CLIENTS.filter((c) => c.advisorId === advisorId)
  const activeStatuses = ['CREATED', 'UPLOADING', 'ANALYZING', 'QUESTIONS', 'GENERATING', 'DRAFT_READY']
  const submittedStatuses = ['SUBMITTED', 'AWAITING_RESPONSE']
  return {
    totalClients: clients.length,
    activeClients: clients.filter((c) => c.status === 'active').length,
    activeCases: cases.filter((c) => activeStatuses.includes(c.status)).length,
    submittedCases: cases.filter((c) => submittedStatuses.includes(c.status)).length,
    totalCases: cases.length,
  }
}
