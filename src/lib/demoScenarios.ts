// Demo scenarios for each use-case type.
// These are used when a non-logged-in user arrives via ?demo=true and clicks through
// the wizard without uploading any real documents.
// All AI outputs, field values, and draft texts are fictional but realistic examples.

export interface DemoField {
  key: string
  label: string
  value: string
  icon: string
  importance: 'high' | 'medium' | 'low'
}

export interface DemoQuestion {
  id: string
  question: string
  required: boolean
  type: 'text' | 'yesno' | 'amount' | 'date'
  background?: string
  autoAnswer: string // pre-filled for demo auto-advance
}

export interface DemoAgentOutput {
  role: string
  label: string
  summary: string
  durationMs: number
  model: string
  provider: string
}

export interface DemoScenario {
  docType: { category: string; label: string; icon: string }
  fields: DemoField[]
  questions: DemoQuestion[]
  agentOutputs: DemoAgentOutput[]
  finalDraft: string
}

interface DemoScenarioTranslations {
  docTypeLabel: string
  fields: Record<string, string>
  questions: Record<string, { question: string; background?: string; autoAnswer: string }>
  agentLabels: Record<string, { label: string; summary: string }>
}

// ── Individual scenarios ──────────────────────────────────────────────────────

const TAX_SCENARIO: DemoScenario = {
  docType: { category: 'tax_notice', label: 'Einkommensteuerbescheid', icon: 'file-text' },
  fields: [
    { key: 'authority', label: 'Finanzamt', value: 'Finanzamt München', icon: 'building', importance: 'high' },
    { key: 'reference', label: 'Steuernummer', value: '143/234/56789', icon: 'hash', importance: 'high' },
    { key: 'date', label: 'Bescheiddatum', value: '12.03.2024', icon: 'calendar', importance: 'medium' },
    { key: 'noticeType', label: 'Art des Bescheids', value: 'Einkommensteuer 2023', icon: 'tag', importance: 'high' },
    { key: 'amount', label: 'Nachzahlung', value: '2.847,50 €', icon: 'euro', importance: 'high' },
  ],
  questions: [
    {
      id: 'dq1',
      question: 'Hatten Sie im Jahr 2023 Einnahmen aus mehreren Quellen (z.B. Anstellung und Freelance)?',
      required: true,
      type: 'yesno',
      background: 'Mehrere Einkunftsarten beeinflussen die Steuerprogression nach § 32a EStG.',
      autoAnswer: 'Ja',
    },
    {
      id: 'dq2',
      question: 'Welche Werbungskosten haben Sie in Ihrer Steuererklärung geltend gemacht?',
      required: false,
      type: 'text',
      background: 'Werbungskosten nach § 9 EStG mindern das zu versteuernde Einkommen direkt.',
      autoAnswer: 'Homeoffice-Pauschale, Fachliteratur, Fahrtkosten zur Arbeitsstätte',
    },
  ],
  agentOutputs: [
    {
      role: 'drafter',
      label: 'Entwurf',
      summary: 'Einspruchsschreiben nach § 347 AO entworfen. Werbungskosten und Berechnungsfehler als Hauptargumente identifiziert.',
      durationMs: 18400,
      model: 'claude-sonnet-4-6',
      provider: 'Claude',
    },
    {
      role: 'reviewer',
      label: 'Prüfung',
      summary: 'Rechtliche Argumentation geprüft. Verweis auf BFH-Urteil VI R 2/21 zur Homeoffice-Pauschale ergänzt.',
      durationMs: 22100,
      model: 'gemini-1.5-pro',
      provider: 'Gemini',
    },
    {
      role: 'factchecker',
      label: 'Faktencheck',
      summary: 'Aktuelle Rechtsprechung verifiziert. § 9 Abs. 5 EStG und BMF-Schreiben vom 15.08.2023 korrekt zitiert.',
      durationMs: 34700,
      model: 'sonar-pro',
      provider: 'Perplexity',
    },
    {
      role: 'adversary',
      label: 'Gegenprüfung',
      summary: 'Finanzamt-Perspektive eingenommen. Nachweis der beruflichen Veranlassung der Werbungskosten als potenziell schwacher Punkt markiert.',
      durationMs: 19300,
      model: 'grok-2',
      provider: 'Grok',
    },
    {
      role: 'consolidator',
      label: 'Konsolidierung',
      summary: 'Alle Agentenergebnisse zusammengeführt. Formulierung geschärft und abschließendes Schreiben optimiert.',
      durationMs: 14200,
      model: 'gpt-4o',
      provider: 'GPT-4o',
    },
  ],
  finalDraft: `An das
Finanzamt München
Deroystraße 8
80335 München

München, den ${new Date().toLocaleDateString('de-DE')}

Steuernummer: 143/234/56789

Einspruch gegen den Einkommensteuerbescheid 2023 vom 12.03.2024

Sehr geehrte Damen und Herren,

hiermit lege ich gemäß § 347 Abs. 1 AO fristgerecht Einspruch gegen den oben genannten Einkommensteuerbescheid für das Jahr 2023 ein, der mir am 15.03.2024 zugegangen ist.

I. Sachverhalt

Mit dem angefochtenen Bescheid wurde eine Einkommensteuernachzahlung in Höhe von 2.847,50 € festgesetzt. Nach eingehender Prüfung des Bescheids bestehen erhebliche Zweifel an der Rechtmäßigkeit der Festsetzung, insbesondere hinsichtlich der Berücksichtigung meiner Werbungskosten.

II. Begründung

1. Unzureichende Berücksichtigung von Werbungskosten (§ 9 EStG)

Die in meiner Steuererklärung geltend gemachten Werbungskosten wurden vom Finanzamt nicht in der erklärten Höhe anerkannt. Konkret wurden Aufwendungen für die Homeoffice-Pauschale, Fachliteratur sowie Fahrtkosten zur Arbeitsstätte nicht vollständig als Werbungskosten nach § 9 Abs. 1 EStG berücksichtigt.

Die Homeoffice-Tagespauschale nach § 4 Abs. 5 Satz 1 Nr. 6b EStG i.V.m. § 9 Abs. 5 Satz 1 EStG beläuft sich auf 6,00 € pro Arbeitstag (maximal 1.260,00 € jährlich). Das Bundesfinanzministerium hat in seinem Schreiben vom 15.08.2023 klargestellt, dass die Pauschale auch dann anzuerkennen ist, wenn kein abgeschlossenes häusliches Arbeitszimmer vorhanden ist.

2. Fehlerhafte Steuerberechnung

Die Berechnung der Einkommensteuer nach dem Grundtarif (§ 32a EStG) weist Abweichungen auf, die einer näheren Überprüfung bedürfen.

III. Antrag

Ich beantrage,
1. den Einkommensteuerbescheid 2023 zu ändern und die Nachzahlung auf Null festzusetzen, hilfsweise
2. die Steuerfestsetzung unter Berücksichtigung der vollständig geltend gemachten Werbungskosten neu zu berechnen.

Ich bitte außerdem um Aussetzung der Vollziehung gemäß § 361 AO bis zur abschließenden Entscheidung über diesen Einspruch.

Die erforderlichen Nachweise (Kontoauszüge, Quittungen, Homeoffice-Kalender) reiche ich umgehend nach.

Hochachtungsvoll,

[Vorname Nachname]
[Adresse]
[PLZ Ort]`,
}

const GRUNDSTEUER_SCENARIO: DemoScenario = {
  docType: { category: 'property_tax_notice', label: 'Grundsteuerbescheid', icon: 'home' },
  fields: [
    { key: 'authority', label: 'Behörde', value: 'Stadt Karlsruhe – Stadtkämmerei', icon: 'building', importance: 'high' },
    { key: 'reference', label: 'Aktenzeichen', value: 'GrSt 47-12345-6', icon: 'hash', importance: 'high' },
    { key: 'date', label: 'Bescheiddatum', value: '15.01.2024', icon: 'calendar', importance: 'medium' },
    { key: 'property', label: 'Grundstück', value: 'Musterstraße 12, 76133 Karlsruhe', icon: 'map-pin', importance: 'high' },
    { key: 'amount', label: 'Grundsteuer p.a.', value: '1.284,00 €', icon: 'euro', importance: 'high' },
    { key: 'area', label: 'Erfasste Fläche', value: '420 m²', icon: 'scale', importance: 'medium' },
  ],
  questions: [
    {
      id: 'dq1',
      question: 'Weicht die im Bescheid ausgewiesene Grundstücksfläche von Ihrem Grundbuchauszug ab?',
      required: true,
      type: 'yesno',
      background: 'Flächenfehler sind der häufigste Fehlergrund bei Grundsteuerbescheiden nach der Reform 2022.',
      autoAnswer: 'Ja',
    },
    {
      id: 'dq2',
      question: 'Wie groß ist die tatsächliche Grundstücksfläche laut Grundbuchauszug?',
      required: true,
      type: 'text',
      background: 'Gemäß § 244 BewG wird die tatsächliche Fläche des Grundstücks zur Berechnung herangezogen.',
      autoAnswer: '380 m² laut Grundbuchauszug vom 10.05.2022',
    },
  ],
  agentOutputs: [
    {
      role: 'drafter',
      label: 'Entwurf',
      summary: 'Einspruch nach § 347 AO i.V.m. GrStG entworfen. Falsche Grundstücksfläche (420 m² statt 380 m²) als Hauptgrund benannt.',
      durationMs: 16200,
      model: 'claude-sonnet-4-6',
      provider: 'Claude',
    },
    {
      role: 'reviewer',
      label: 'Prüfung',
      summary: 'Bezugnahme auf § 244 BewG und Grundsteuerreform-Gesetz 2022 korrekt. Nachweis durch Grundbuchauszug empfohlen.',
      durationMs: 20400,
      model: 'gemini-1.5-pro',
      provider: 'Gemini',
    },
    {
      role: 'factchecker',
      label: 'Faktencheck',
      summary: 'Einspruchsfrist (1 Monat nach § 355 AO) und aktuelle Fehlerquoten bei Grundsteuerbescheiden 2022 verifiziert.',
      durationMs: 28900,
      model: 'sonar-pro',
      provider: 'Perplexity',
    },
    {
      role: 'adversary',
      label: 'Gegenprüfung',
      summary: 'Mögliche Gegenargumente der Behörde analysiert. Messfehler vs. Datenbankfehler als zentrale Frage identifiziert.',
      durationMs: 17600,
      model: 'grok-2',
      provider: 'Grok',
    },
    {
      role: 'consolidator',
      label: 'Konsolidierung',
      summary: 'Finales Schreiben optimiert. Klarer Antrag auf Neuberechnung und Beilegung von Grundbuchauszug als Anlage formuliert.',
      durationMs: 11800,
      model: 'gpt-4o',
      provider: 'GPT-4o',
    },
  ],
  finalDraft: `An die
Stadt Karlsruhe – Stadtkämmerei
Karlstraße 19
76133 Karlsruhe

Karlsruhe, den ${new Date().toLocaleDateString('de-DE')}

Aktenzeichen: GrSt 47-12345-6
Grundstück: Musterstraße 12, 76133 Karlsruhe

Einspruch gegen den Grundsteuerbescheid vom 15.01.2024

Sehr geehrte Damen und Herren,

hiermit lege ich gemäß § 347 Abs. 1 AO fristgerecht Einspruch gegen den Grundsteuerbescheid vom 15.01.2024 ein.

I. Sachverhalt

Der Bescheid setzt eine Grundsteuer von 1.284,00 € pro Jahr fest. Grundlage der Berechnung ist eine Grundstücksfläche von 420 m². Diese Angabe ist unzutreffend.

II. Begründung

1. Fehlerhafte Grundstücksfläche

Gemäß dem aktuellen Grundbuchauszug (Amtsgericht Karlsruhe, Blatt 4711) beträgt die tatsächliche Fläche des Grundstücks Musterstraße 12 lediglich 380 m². Die im Bescheid veranschlagte Fläche von 420 m² weicht damit um 40 m² (ca. 10,5 %) von den tatsächlichen Verhältnissen ab.

Nach § 244 Abs. 1 BewG i.V.m. § 218 Abs. 2 BewG ist für die Bewertung des Grundstücks die tatsächliche Fläche maßgeblich. Der fehlerhafte Flächenwert führt zu einer entsprechend überhöhten Berechnung des Grundsteuerwerts nach § 247 BewG und damit zu einer rechtswidrig überhöhten Steuerfestsetzung.

Ich verweise zudem auf die hohe Fehlerquote bei den neu erstellten Grundsteuerbescheiden, die das Bundesministerium der Finanzen selbst eingeräumt hat.

III. Antrag

Ich beantrage,
1. den Grundsteuerbescheid aufzuheben und auf Basis der korrekten Grundstücksfläche von 380 m² neu festzusetzen,
2. die Jahresgrundsteuer entsprechend zu reduzieren,
3. bereits geleistete Überzahlungen zu erstatten.

Als Anlage füge ich den Grundbuchauszug bei, aus dem die korrekte Grundstücksfläche hervorgeht.

Hochachtungsvoll,

[Vorname Nachname]
[Adresse]`,
}

const JOBCENTER_SCENARIO: DemoScenario = {
  docType: { category: 'social_notice', label: 'Bürgergeld-Sanktionsbescheid', icon: 'alert-circle' },
  fields: [
    { key: 'authority', label: 'Jobcenter', value: 'Jobcenter Berlin Mitte', icon: 'building', importance: 'high' },
    { key: 'reference', label: 'Bedarfsgemeinschaft', value: 'BG-Nr. 2024-0044123', icon: 'hash', importance: 'high' },
    { key: 'date', label: 'Bescheiddatum', value: '05.02.2024', icon: 'calendar', importance: 'medium' },
    { key: 'sanction', label: 'Sanktionsart', value: 'Meldeversäumnis', icon: 'alert-circle', importance: 'high' },
    { key: 'amount', label: 'Kürzungsbetrag', value: '150,00 €/Monat', icon: 'euro', importance: 'high' },
  ],
  questions: [
    {
      id: 'dq1',
      question: 'Haben Sie vor dem Meldeversäumnis eine schriftliche Einladung vom Jobcenter erhalten?',
      required: true,
      type: 'yesno',
      background: 'Eine Sanktion nach § 32 SGB II setzt eine ordnungsgemäße, schriftliche Einladung mit Rechtsfolgenbelehrung voraus.',
      autoAnswer: 'Nein',
    },
    {
      id: 'dq2',
      question: 'Gab es einen wichtigen Grund für das Fernbleiben (z.B. Krankheit, Unfall)?',
      required: true,
      type: 'yesno',
      background: 'Ein wichtiger Grund im Sinne des § 31 SGB II schließt die Sanktion aus. Nachweise wie Krankschreibungen sind beizufügen.',
      autoAnswer: 'Ja',
    },
  ],
  agentOutputs: [
    {
      role: 'drafter',
      label: 'Entwurf',
      summary: 'Widerspruch nach § 78 SGG entworfen. Fehlende Rechtsfolgenbelehrung und wichtiger Grund (Krankheit) als Argumente aufgeführt.',
      durationMs: 14800,
      model: 'claude-sonnet-4-6',
      provider: 'Claude',
    },
    {
      role: 'reviewer',
      label: 'Prüfung',
      summary: 'BSG-Rechtsprechung zu Meldeversäumnissen geprüft. BSG-Urteil B 14 AS 25/12 R als Stütze für fehlende Belehrung zitiert.',
      durationMs: 19700,
      model: 'gemini-1.5-pro',
      provider: 'Gemini',
    },
    {
      role: 'factchecker',
      label: 'Faktencheck',
      summary: 'Aktuelle Rechtslage zu Bürgergeld-Sanktionen nach dem Bürgergeld-Gesetz 2023 korrekt dargestellt.',
      durationMs: 31200,
      model: 'sonar-pro',
      provider: 'Perplexity',
    },
    {
      role: 'adversary',
      label: 'Gegenprüfung',
      summary: 'Jobcenter-Perspektive analysiert. Nachweis der Krankheit durch ärztliches Attest als entscheidend eingestuft.',
      durationMs: 16900,
      model: 'grok-2',
      provider: 'Grok',
    },
    {
      role: 'consolidator',
      label: 'Konsolidierung',
      summary: 'Schreiben finalisiert. Antrag auf aufschiebende Wirkung und Vorlage des Attests als Anlage ergänzt.',
      durationMs: 12400,
      model: 'gpt-4o',
      provider: 'GPT-4o',
    },
  ],
  finalDraft: `An das
Jobcenter Berlin Mitte
Müllerstraße 75
13349 Berlin

Berlin, den ${new Date().toLocaleDateString('de-DE')}

Bedarfsgemeinschaft-Nr.: BG-Nr. 2024-0044123

Widerspruch gegen den Sanktionsbescheid vom 05.02.2024

Sehr geehrte Damen und Herren,

hiermit lege ich gemäß § 78 SGG fristgerecht Widerspruch gegen den Sanktionsbescheid vom 05.02.2024 ein.

I. Sachverhalt

Mit dem angefochtenen Bescheid wurden meine Bürgergeldleistungen wegen eines Meldeversäumnisses um 150,00 € monatlich für die Dauer von drei Monaten gemäß § 32 SGB II abgesenkt.

II. Begründung

1. Keine ordnungsgemäße Einladung

Gemäß § 32 Abs. 1 SGB II und der ständigen Rechtsprechung des BSG (Urteil vom 09.11.2010 – B 4 AS 27/10 R) setzt eine Sanktion wegen Meldeversäumnis voraus, dass eine schriftliche Einladung mit einer ordnungsgemäßen Rechtsfolgenbelehrung zugestellt wurde. Eine solche Einladung habe ich nicht erhalten. Eine fehlende oder fehlerhafte Belehrung über die Rechtsfolgen führt nach § 31 SGB II zwingend zur Rechtswidrigkeit der Sanktion.

2. Wichtiger Grund im Sinne des § 31 SGB II

Zum Zeitpunkt des Meldetermins war ich aufgrund einer akuten Erkrankung nicht in der Lage, dem Termin beim Jobcenter nachzukommen. Ein ärztliches Attest habe ich als Anlage beigefügt.

III. Antrag

Ich beantrage,
1. den Sanktionsbescheid vom 05.02.2024 aufzuheben,
2. die aufgrund der Sanktion einbehaltenen Leistungen nachzuzahlen,
3. gemäß § 86a SGG die aufschiebende Wirkung dieses Widerspruchs anzuordnen.

Als Anlage: Ärztliches Attest vom [Datum]

Hochachtungsvoll,

[Vorname Nachname]
[Adresse]`,
}

const RENTE_SCENARIO: DemoScenario = {
  docType: { category: 'pension_notice', label: 'Rentenbescheid', icon: 'clock' },
  fields: [
    { key: 'authority', label: 'Behörde', value: 'Deutsche Rentenversicherung Bund', icon: 'building', importance: 'high' },
    { key: 'reference', label: 'Versicherungsnummer', value: '12 010155 A 002', icon: 'hash', importance: 'high' },
    { key: 'date', label: 'Bescheiddatum', value: '20.01.2024', icon: 'calendar', importance: 'medium' },
    { key: 'type', label: 'Rentenart', value: 'Altersrente für langjährig Versicherte', icon: 'tag', importance: 'high' },
    { key: 'amount', label: 'Monatliche Rente', value: '1.342,80 €', icon: 'euro', importance: 'high' },
    { key: 'missingYears', label: 'Fehlende Zeiten', value: '3 Beitragsjahre nicht erfasst', icon: 'alert-circle', importance: 'high' },
  ],
  questions: [
    {
      id: 'dq1',
      question: 'Welche Beschäftigungszeiten wurden nach Ihrer Kenntnis nicht im Versicherungsverlauf erfasst?',
      required: true,
      type: 'text',
      background: 'Lücken im Versicherungsverlauf entstehen oft durch nicht gemeldete Arbeitsverhältnisse, Selbständigkeit oder Auslandszeiten.',
      autoAnswer: 'Tätigkeit bei der Muster GmbH von 01/1995 bis 12/1997, Beitragszahlung nachweisbar',
    },
    {
      id: 'dq2',
      question: 'Liegen Ihnen Nachweise für die fehlenden Versicherungszeiten vor?',
      required: true,
      type: 'yesno',
      background: 'Nachweise können Lohnsteuerkarten, Arbeitgeberbescheinigungen oder Kontoauszüge über Beitragszahlungen sein.',
      autoAnswer: 'Ja',
    },
  ],
  agentOutputs: [
    {
      role: 'drafter',
      label: 'Entwurf',
      summary: 'Widerspruch nach § 78 SGG entworfen. Fehlende Pflichtbeitragszeiten 1995–1997 als zentrales Argument, Entgeltpunkte-Korrektur beantragt.',
      durationMs: 17600,
      model: 'claude-sonnet-4-6',
      provider: 'Claude',
    },
    {
      role: 'reviewer',
      label: 'Prüfung',
      summary: 'SGB VI-Verweise auf §§ 55, 119 korrekt. Nachweisregelung und 4-Jahres-Frist für freiwillige Beiträge ergänzt.',
      durationMs: 21300,
      model: 'gemini-1.5-pro',
      provider: 'Gemini',
    },
    {
      role: 'factchecker',
      label: 'Faktencheck',
      summary: 'Aktuelle Entgeltpunktwerte und Rechengrößen 2024 (§ 68 SGB VI) geprüft und korrekt dargestellt.',
      durationMs: 36100,
      model: 'sonar-pro',
      provider: 'Perplexity',
    },
    {
      role: 'adversary',
      label: 'Gegenprüfung',
      summary: 'DRV-Perspektive: Beweislast liegt beim Versicherten. Arbeitgeberbescheinigung als stärkstes Beweismittel eingestuft.',
      durationMs: 18800,
      model: 'grok-2',
      provider: 'Grok',
    },
    {
      role: 'consolidator',
      label: 'Konsolidierung',
      summary: 'Schreiben finalisiert. Klarer Antrag auf Neufeststellung der Rente und Beilegung von Lohnnachweisen als Anlage.',
      durationMs: 13100,
      model: 'gpt-4o',
      provider: 'GPT-4o',
    },
  ],
  finalDraft: `An die
Deutsche Rentenversicherung Bund
10704 Berlin

${new Date().toLocaleDateString('de-DE')}

Versicherungsnummer: 12 010155 A 002

Widerspruch gegen den Rentenbescheid vom 20.01.2024

Sehr geehrte Damen und Herren,

hiermit lege ich gemäß § 78 SGG fristgerecht Widerspruch gegen den Rentenbescheid vom 20.01.2024 ein.

I. Sachverhalt

Mit dem angefochtenen Bescheid wurde meine Altersrente auf monatlich 1.342,80 € festgesetzt. Bei Überprüfung des beigefügten Versicherungsverlaufs habe ich festgestellt, dass Pflichtbeitragszeiten im Umfang von ca. 3 Jahren nicht erfasst sind.

II. Begründung

1. Fehlende Pflichtbeitragszeiten (§ 55 SGB VI)

Meine Beschäftigung bei der Muster GmbH, Musterstraße 1, 10115 Berlin, vom 01.01.1995 bis 31.12.1997 wurde im Versicherungsverlauf nicht berücksichtigt. Für diesen Zeitraum wurden Sozialversicherungsbeiträge (Arbeitnehmer- und Arbeitgeberanteil) ordnungsgemäß entrichtet.

Die fehlenden Pflichtbeitragszeiten führen zu einer erheblich zu niedrigen Rentenberechnung. Gemäß § 63 Abs. 1 SGB VI bestimmt sich die Rentenhöhe nach den im Versicherungsverlauf gespeicherten Entgeltpunkten. Jedes fehlende Beitragsjahr verringert die monatliche Rente dauerhaft.

2. Antrag auf Kontenklärung

Ich beantrage gemäß § 149 Abs. 5 SGB VI eine Kontenklärung für den Zeitraum 1995–1997 und die entsprechende Korrektur des Versicherungsverlaufs.

III. Antrag

Ich beantrage,
1. den Rentenbescheid aufzuheben und nach Korrektur des Versicherungsverlaufs neu festzusetzen,
2. die fehlenden Pflichtbeitragszeiten (01.01.1995–31.12.1997) zu ermitteln und anzuerkennen,
3. die monatliche Rente entsprechend zu erhöhen und die Differenz rückwirkend auszuzahlen.

Als Anlage beigefügt: Lohnsteuerkarte 1995–1997, Arbeitgeberbescheinigung der Muster GmbH

Hochachtungsvoll,

[Vorname Nachname]
[Adresse]`,
}

const KV_SCENARIO: DemoScenario = {
  docType: { category: 'health_insurance_notice', label: 'Ablehnungsbescheid Krankenversicherung', icon: 'heart-pulse' },
  fields: [
    { key: 'authority', label: 'Krankenkasse', value: 'AOK Bayern', icon: 'building', importance: 'high' },
    { key: 'reference', label: 'Versicherungsnummer', value: 'AOK-Nr. 7891234560', icon: 'hash', importance: 'high' },
    { key: 'date', label: 'Bescheiddatum', value: '18.02.2024', icon: 'calendar', importance: 'medium' },
    { key: 'service', label: 'Abgelehnte Leistung', value: 'Physiotherapie (24 Sitzungen)', icon: 'heart-pulse', importance: 'high' },
    { key: 'reason', label: 'Ablehnungsgrund', value: 'Nicht medizinisch notwendig (MDK-Gutachten)', icon: 'alert-circle', importance: 'high' },
  ],
  questions: [
    {
      id: 'dq1',
      question: 'Liegt Ihnen eine ärztliche Verordnung für die Physiotherapie vor?',
      required: true,
      type: 'yesno',
      background: 'Eine ärztliche Verordnung ist Grundvoraussetzung für den Leistungsanspruch nach § 32 SGB V.',
      autoAnswer: 'Ja',
    },
    {
      id: 'dq2',
      question: 'Was ist die diagnostizierte Erkrankung, die die Physiotherapie begründet?',
      required: true,
      type: 'text',
      background: 'Die medizinische Notwendigkeit muss durch eine Diagnose belegt sein. MDK-Gutachten können angefochten werden.',
      autoAnswer: 'Chronische Lumbalgie (ICD M54.5) mit Funktionsbeeinträchtigung, ärztlich diagnostiziert seit 2021',
    },
  ],
  agentOutputs: [
    {
      role: 'drafter',
      label: 'Entwurf',
      summary: 'Widerspruch nach § 78 SGG entworfen. Fehlerhaftes MDK-Gutachten und nachgewiesene medizinische Notwendigkeit als Hauptargumente.',
      durationMs: 15900,
      model: 'claude-sonnet-4-6',
      provider: 'Claude',
    },
    {
      role: 'reviewer',
      label: 'Prüfung',
      summary: '§ 13 Abs. 3a SGB V (Genehmigungsfiktion) und § 12 SGB V (Wirtschaftlichkeitsgebot) korrekt eingearbeitet.',
      durationMs: 18500,
      model: 'gemini-1.5-pro',
      provider: 'Gemini',
    },
    {
      role: 'factchecker',
      label: 'Faktencheck',
      summary: 'BSG-Rechtsprechung zum Anspruch auf Physiotherapie und Genehmigungsfiktion bei überschrittener Frist verifiziert.',
      durationMs: 29400,
      model: 'sonar-pro',
      provider: 'Perplexity',
    },
    {
      role: 'adversary',
      label: 'Gegenprüfung',
      summary: 'Krankenkassen-Perspektive: MDK-Gutachten hat Beweiswert. Gegengutachten oder detaillierter Arztbericht als Gegenbeweis empfohlen.',
      durationMs: 17200,
      model: 'grok-2',
      provider: 'Grok',
    },
    {
      role: 'consolidator',
      label: 'Konsolidierung',
      summary: 'Antrag auf Genehmigungsfiktion (§ 13 SGB V) und Beiziehung des vollständigen MDK-Gutachtens ergänzt.',
      durationMs: 11600,
      model: 'gpt-4o',
      provider: 'GPT-4o',
    },
  ],
  finalDraft: `An die
AOK Bayern
Zentrale
80242 München

${new Date().toLocaleDateString('de-DE')}

Versicherungsnummer: AOK-Nr. 7891234560

Widerspruch gegen den Ablehnungsbescheid vom 18.02.2024 (Physiotherapie)

Sehr geehrte Damen und Herren,

hiermit lege ich gemäß § 78 SGG fristgerecht Widerspruch gegen den Ablehnungsbescheid vom 18.02.2024 ein.

I. Sachverhalt

Die AOK Bayern hat die Bewilligung von 24 Sitzungen Physiotherapie mit der Begründung abgelehnt, diese seien medizinisch nicht notwendig. Als Grundlage wurde ein Gutachten des Medizinischen Dienstes (MDK) herangezogen.

II. Begründung

1. Nachgewiesene medizinische Notwendigkeit

Ich leide seit 2021 an einer chronischen Lumbalgie (ICD-10: M54.5) mit erheblicher Funktionsbeeinträchtigung. Die behandelnde Ärztin Dr. [Name] hat mit Verordnung vom [Datum] 24 Sitzungen Physiotherapie als medizinisch notwendig verordnet. Die medizinische Indikation ist durch Arztberichte und bildgebende Verfahren belegt.

2. Fehler im MDK-Gutachten

Das MDK-Gutachten, das zur Ablehnung geführt hat, ist inhaltlich fehlerhaft. Es berücksichtigt nicht den vollständigen Krankheitsverlauf und widerspricht der fachärztlichen Einschätzung der behandelnden Ärztin. Gemäß § 275 SGB V darf der MDK nur im Rahmen der festgelegten Begutachtungsaufgaben tätig werden.

3. Genehmigungsfiktion (§ 13 Abs. 3a SGB V)

Die Krankenkasse hat nicht innerhalb der gesetzlichen Frist von 5 Wochen über meinen Antrag entschieden. Die beantragte Leistung gilt daher gemäß § 13 Abs. 3a SGB V als genehmigt.

III. Antrag

Ich beantrage,
1. den Ablehnungsbescheid aufzuheben und die 24 Sitzungen Physiotherapie zu bewilligen,
2. das vollständige MDK-Gutachten gemäß § 25 SGB X offenzulegen,
3. hilfsweise ein unabhängiges Obergutachten einzuholen.

Als Anlagen: Ärztliche Verordnung, Arztbericht Dr. [Name]

Hochachtungsvoll,

[Vorname Nachname]
[Adresse]`,
}

const KUENDIGUNG_SCENARIO: DemoScenario = {
  docType: { category: 'dismissal_notice', label: 'Kündigungsschreiben', icon: 'file-text' },
  fields: [
    { key: 'employer', label: 'Arbeitgeber', value: 'Muster GmbH', icon: 'building', importance: 'high' },
    { key: 'date', label: 'Kündigungsdatum', value: '29.02.2024', icon: 'calendar', importance: 'high' },
    { key: 'type', label: 'Kündigungsart', value: 'Ordentliche betriebsbedingte Kündigung', icon: 'tag', importance: 'high' },
    { key: 'notice', label: 'Kündigungsfrist', value: '3 Monate zum Quartalsende', icon: 'clock', importance: 'medium' },
    { key: 'tenure', label: 'Betriebszugehörigkeit', value: '7 Jahre', icon: 'user', importance: 'medium' },
  ],
  questions: [
    {
      id: 'dq1',
      question: 'Gibt es in Ihrem Betrieb einen Betriebsrat?',
      required: true,
      type: 'yesno',
      background: 'Ohne Anhörung des Betriebsrats nach § 102 BetrVG ist eine Kündigung unwirksam – unabhängig vom Kündigungsgrund.',
      autoAnswer: 'Ja',
    },
    {
      id: 'dq2',
      question: 'Wurden Ihnen Informationen zur Betriebsratsanhörung mitgeteilt?',
      required: true,
      type: 'yesno',
      background: 'Gemäß § 102 Abs. 1 BetrVG muss der Betriebsrat vor jeder Kündigung angehört werden. Eine ohne Anhörung ausgesprochene Kündigung ist nichtig.',
      autoAnswer: 'Nein',
    },
  ],
  agentOutputs: [
    {
      role: 'drafter',
      label: 'Entwurf',
      summary: 'Kündigungsschutzklage nach § 4 KSchG vorbereitet. Fehlende Betriebsratsanhörung (§ 102 BetrVG) als stärkster Unwirksamkeitsgrund identifiziert.',
      durationMs: 16700,
      model: 'claude-sonnet-4-6',
      provider: 'Claude',
    },
    {
      role: 'reviewer',
      label: 'Prüfung',
      summary: 'Dreiwochenfrist (§ 4 KSchG) korrekt erwähnt. Soziale Rechtfertigung (§ 1 KSchG) und Weiterbeschäftigungsantrag ergänzt.',
      durationMs: 20100,
      model: 'gemini-1.5-pro',
      provider: 'Gemini',
    },
    {
      role: 'factchecker',
      label: 'Faktencheck',
      summary: 'BAG-Rechtsprechung zu § 102 BetrVG korrekt. Kündigung ohne Anhörung ist nach BAG Urteil 2 AZR 296/13 absolut unwirksam.',
      durationMs: 27800,
      model: 'sonar-pro',
      provider: 'Perplexity',
    },
    {
      role: 'adversary',
      label: 'Gegenprüfung',
      summary: 'Arbeitgeber-Sicht: Betriebsratsdokumentation könnte vorliegen. Nachweis der Anhörung vs. fehlende Anhörung als Kernfrage.',
      durationMs: 15400,
      model: 'grok-2',
      provider: 'Grok',
    },
    {
      role: 'consolidator',
      label: 'Konsolidierung',
      summary: 'Schreiben ans Arbeitsgericht finalisiert. Wichtiger Hinweis auf 3-Wochen-Frist prominent platziert.',
      durationMs: 10900,
      model: 'gpt-4o',
      provider: 'GPT-4o',
    },
  ],
  finalDraft: `An das
Arbeitsgericht [Stadt]
[Adresse]

${new Date().toLocaleDateString('de-DE')}

Klage gemäß § 4 KSchG – Kündigungsschutzklage

Kläger: [Vorname Nachname], [Adresse]
Beklagte: Muster GmbH, [Adresse]

Sehr geehrte Damen und Herren,

hiermit erhebe ich innerhalb der Dreiwochenfrist des § 4 KSchG Klage gegen die Kündigung der Muster GmbH vom 29.02.2024.

I. Sachverhalt

Die Beklagte hat mir mit Schreiben vom 29.02.2024 zum Quartalsende ordentlich betriebsbedingt gekündigt. Das Arbeitsverhältnis besteht seit 7 Jahren. Der Betrieb der Beklagten beschäftigt mehr als 10 Mitarbeiter, sodass das Kündigungsschutzgesetz Anwendung findet.

II. Anträge

Ich beantrage:
1. Es wird festgestellt, dass das Arbeitsverhältnis zwischen den Parteien durch die Kündigung vom 29.02.2024 nicht aufgelöst worden ist.
2. Die Beklagte wird verurteilt, mich bis zur rechtskräftigen Entscheidung dieses Rechtsstreits als [Stellenbezeichnung] weiterzubeschäftigen.

III. Begründung

1. Verletzung von § 102 BetrVG (Betriebsratsanhörung)

Im Betrieb der Beklagten besteht ein Betriebsrat. Die Beklagte hat mir gegenüber nicht dargelegt, dass der Betriebsrat vor Ausspruch der Kündigung ordnungsgemäß nach § 102 Abs. 1 BetrVG angehört wurde. Eine ohne vollständige Betriebsratsanhörung ausgesprochene Kündigung ist nach ständiger Rechtsprechung des BAG (Urteil vom 16.01.2003 – 2 AZR 296/02) nichtig.

2. Fehlende soziale Rechtfertigung (§ 1 KSchG)

Eine betriebsbedingte Kündigung setzt nach § 1 Abs. 2 KSchG voraus, dass dringende betriebliche Erfordernisse entgegenstehen. Die Beklagte hat mir gegenüber keine nachvollziehbaren Gründe für den behaupteten Wegfall meines Arbeitsplatzes mitgeteilt.

Hochachtungsvoll,

[Vorname Nachname]`,
}

const MIETE_SCENARIO: DemoScenario = {
  docType: { category: 'rent_increase_notice', label: 'Mieterhöhungsverlangen', icon: 'home' },
  fields: [
    { key: 'landlord', label: 'Vermieter', value: 'Immobilien Schmidt GbR', icon: 'building', importance: 'high' },
    { key: 'date', label: 'Schreibendatum', value: '01.02.2024', icon: 'calendar', importance: 'medium' },
    { key: 'currentRent', label: 'Aktuelle Miete', value: '1.200,00 €/Monat', icon: 'euro', importance: 'high' },
    { key: 'newRent', label: 'Geforderte Miete', value: '1.380,00 €/Monat', icon: 'euro', importance: 'high' },
    { key: 'increase', label: 'Erhöhung', value: '180,00 € (+15 %)', icon: 'alert-circle', importance: 'high' },
    { key: 'apartment', label: 'Wohnfläche', value: '75 m², Berlin-Mitte', icon: 'home', importance: 'medium' },
  ],
  questions: [
    {
      id: 'dq1',
      question: 'Seit wann besteht Ihr Mietverhältnis?',
      required: true,
      type: 'date',
      background: 'Mieterhöhungen sind nach § 558 Abs. 1 BGB frühestens 15 Monate nach der letzten Erhöhung oder Beginn des Mietverhältnisses zulässig.',
      autoAnswer: '2019-03-01',
    },
    {
      id: 'dq2',
      question: 'Wann war die letzte Mieterhöhung?',
      required: true,
      type: 'date',
      background: 'Die Kappungsgrenze nach § 558 Abs. 3 BGB begrenzt Erhöhungen auf maximal 15 % in 3 Jahren (in Gebieten mit angespanntem Wohnungsmarkt: 20 %).',
      autoAnswer: '2021-06-01',
    },
  ],
  agentOutputs: [
    {
      role: 'drafter',
      label: 'Entwurf',
      summary: 'Widerspruch nach § 558b BGB entworfen. Überschreitung der Kappungsgrenze und mangelnde Mietspiegel-Begründung als Hauptargumente.',
      durationMs: 14300,
      model: 'claude-sonnet-4-6',
      provider: 'Claude',
    },
    {
      role: 'reviewer',
      label: 'Prüfung',
      summary: '§§ 558, 558a, 558b BGB korrekt verarbeitet. Verweis auf Berliner Mietspiegel 2023 und Kappungsgrenze (15 %) ergänzt.',
      durationMs: 19200,
      model: 'gemini-1.5-pro',
      provider: 'Gemini',
    },
    {
      role: 'factchecker',
      label: 'Faktencheck',
      summary: 'Berliner Mietspiegel 2023 für Berlin-Mitte, 75 m², Baujahr [X] recherchiert. Vergleichsmiete deutlich unter gefordertem Betrag.',
      durationMs: 32700,
      model: 'sonar-pro',
      provider: 'Perplexity',
    },
    {
      role: 'adversary',
      label: 'Gegenprüfung',
      summary: 'Vermieter-Perspektive: Mieterhöhung könnte auf Modernisierung gestützt sein. Gegenargumentation zur Modernisierungserhöhung ergänzt.',
      durationMs: 16100,
      model: 'grok-2',
      provider: 'Grok',
    },
    {
      role: 'consolidator',
      label: 'Konsolidierung',
      summary: 'Widerspruch finalisiert. Antrag auf Beibehaltung der bisherigen Miete und Fristsetzung für Nachweise klar formuliert.',
      durationMs: 12000,
      model: 'gpt-4o',
      provider: 'GPT-4o',
    },
  ],
  finalDraft: `An die
Immobilien Schmidt GbR
[Vermieteradresse]

${new Date().toLocaleDateString('de-DE')}

Betr.: Mieterhöhungsverlangen vom 01.02.2024
Wohnung: [Straße, PLZ Berlin-Mitte], 75 m²

Widerspruch gegen das Mieterhöhungsverlangen vom 01.02.2024

Sehr geehrte Damen und Herren,

hiermit widerspreche ich fristgerecht gemäß § 558b Abs. 2 BGB Ihrem Mieterhöhungsverlangen vom 01.02.2024.

I. Sachverhalt

Mit Ihrem Schreiben vom 01.02.2024 verlangen Sie eine Erhöhung der Nettokaltmiete von 1.200,00 € auf 1.380,00 € (+ 15 % = + 180,00 €) zum 01.05.2024.

II. Begründung

1. Überschreitung der Kappungsgrenze (§ 558 Abs. 3 BGB)

Gemäß § 558 Abs. 3 BGB darf die Miete innerhalb von drei Jahren um nicht mehr als 20 % erhöht werden (Berlin ist als Gebiet mit angespanntem Wohnungsmarkt ausgewiesen). Die letzte Erhöhung erfolgte im Juni 2021. Ich bitte um Nachweis, dass die Kappungsgrenze eingehalten wird.

2. Unzureichende Begründung (§ 558a BGB)

Das Erhöhungsverlangen ist nicht ausreichend begründet. Gemäß § 558a Abs. 1 BGB muss das Verlangen durch Bezugnahme auf den Mietspiegel, ein Sachverständigengutachten oder mindestens drei Vergleichswohnungen begründet werden. Ihr Schreiben enthält keine dieser Begründungen.

3. Berliner Mietspiegel 2023

Nach dem Berliner Mietspiegel 2023 liegt die ortsübliche Vergleichsmiete für eine 75 m² Wohnung in Berlin-Mitte erheblich unter dem von Ihnen verlangten Betrag von 18,40 €/m².

III. Erklärung

Ich stimme der geforderten Mieterhöhung nicht zu. Die bisherige Miete von 1.200,00 € bleibt weiterhin geschuldet. Sollten Sie auf der Erhöhung bestehen, bitte ich um vollständige Begründung nach § 558a BGB.

Hochachtungsvoll,

[Vorname Nachname]`,
}

const BUSSGELD_SCENARIO: DemoScenario = {
  docType: { category: 'fine_notice', label: 'Bußgeldbescheid', icon: 'car' },
  fields: [
    { key: 'authority', label: 'Bußgeldstelle', value: 'Bußgeldstelle des Landkreises Darmstadt-Dieburg', icon: 'building', importance: 'high' },
    { key: 'reference', label: 'Aktenzeichen', value: 'OWi 2024-0059817', icon: 'hash', importance: 'high' },
    { key: 'date', label: 'Bescheiddatum', value: '08.03.2024', icon: 'calendar', importance: 'medium' },
    { key: 'offence', label: 'Tatvorwurf', value: '80 km/h in Tempo-50-Zone', icon: 'car', importance: 'high' },
    { key: 'fine', label: 'Bußgeld', value: '200,00 €', icon: 'euro', importance: 'high' },
    { key: 'points', label: 'Punkte in Flensburg', value: '1 Punkt', icon: 'alert-circle', importance: 'medium' },
  ],
  questions: [
    {
      id: 'dq1',
      question: 'Waren Sie zum Tatzeitpunkt tatsächlich der Fahrzeugführer?',
      required: true,
      type: 'yesno',
      background: 'Als Halter sind Sie nicht automatisch der Fahrzeugführer. Die Behörde muss die Fahrereigenschaft nachweisen.',
      autoAnswer: 'Ja',
    },
    {
      id: 'dq2',
      question: 'Haben Sie Informationen über das verwendete Messgerät oder den Eichschein?',
      required: false,
      type: 'text',
      background: 'Ein abgelaufener Eichschein oder Messfehler können zur Einstellung des Verfahrens führen (§ 25 MessEG).',
      autoAnswer: 'Ich beantrage Akteneinsicht, um Gerät und Eichzertifikat zu prüfen',
    },
  ],
  agentOutputs: [
    {
      role: 'drafter',
      label: 'Entwurf',
      summary: 'Einspruch nach § 67 OWiG entworfen. Antrag auf Akteneinsicht und Überprüfung des Eichscheins als Kernstrategie.',
      durationMs: 13200,
      model: 'claude-sonnet-4-6',
      provider: 'Claude',
    },
    {
      role: 'reviewer',
      label: 'Prüfung',
      summary: '§§ 67, 46 OWiG und Messprotokoll-Anforderungen korrekt. Verweis auf standardisiertes Messverfahren (ES 3.0) ergänzt.',
      durationMs: 17400,
      model: 'gemini-1.5-pro',
      provider: 'Gemini',
    },
    {
      role: 'factchecker',
      label: 'Faktencheck',
      summary: 'Eichpflicht nach MessEG korrekt dargestellt. Aktuelle OLG-Rechtsprechung zu Messfehlern und abgelaufenen Eichscheinen verifiziert.',
      durationMs: 25600,
      model: 'sonar-pro',
      provider: 'Perplexity',
    },
    {
      role: 'adversary',
      label: 'Gegenprüfung',
      summary: 'Behörden-Sicht: Standardisierte Messverfahren haben Beweiskraft. Substantiierter Einwand gegen Messung nötig, nicht pauschale Ablehnung.',
      durationMs: 14800,
      model: 'grok-2',
      provider: 'Grok',
    },
    {
      role: 'consolidator',
      label: 'Konsolidierung',
      summary: 'Einspruch finalisiert. Akteneinsichtsersuchen prominent formuliert — deckt in 30 % der Fälle Verfahrensfehler auf.',
      durationMs: 9700,
      model: 'gpt-4o',
      provider: 'GPT-4o',
    },
  ],
  finalDraft: `An die
Bußgeldstelle des Landkreises Darmstadt-Dieburg
Jägertorstraße 207
64289 Darmstadt

${new Date().toLocaleDateString('de-DE')}

Aktenzeichen: OWi 2024-0059817

Einspruch gegen den Bußgeldbescheid vom 08.03.2024

Sehr geehrte Damen und Herren,

hiermit lege ich gemäß § 67 Abs. 1 OWiG innerhalb der gesetzlichen Frist Einspruch gegen den Bußgeldbescheid vom 08.03.2024 ein.

I. Sachverhalt

Mit dem angefochtenen Bescheid wurde gegen mich ein Bußgeld in Höhe von 200,00 € sowie die Eintragung von 1 Punkt im Fahreignungsregister wegen einer angeblichen Geschwindigkeitsüberschreitung von 80 km/h in einer 50 km/h-Zone festgesetzt.

II. Begründung und Anträge

1. Antrag auf Akteneinsicht (§ 49 OWiG)

Ich beantrage umgehend und vollständige Akteneinsicht, insbesondere in:
– Messprotokoll und Rohmessdaten
– Eichschein des verwendeten Messgeräts (Gültigkeitszeitraum)
– Schulungsnachweise des Messbeamten
– Lichtbild des gemessenen Fahrzeugs mit Messmarken

Ohne Akteneinsicht ist es mir nicht möglich, die Ordnungsgemäßheit des Messverfahrens zu überprüfen.

2. Zweifel an der Messung

Ich bestreite die angebliche Geschwindigkeitsüberschreitung. Geschwindigkeitsmessungen müssen nach § 25 MessEG mit einem geeichten und zugelassenen Messgerät durchgeführt werden. Ein abgelaufener Eichschein oder eine fehlerhafte Aufstellung des Geräts führt zur Unverwertbarkeit der Messung.

3. Antrag auf gerichtliche Entscheidung

Für den Fall, dass dem Einspruch nicht abgeholfen wird, beantrage ich gemäß § 68 OWiG die Vorlage an das zuständige Amtsgericht.

Hochachtungsvoll,

[Vorname Nachname]
[Adresse]`,
}

// ── Locale overrides (non-DE locales; 'en' is the fallback for all others) ────

const LOCALE_OVERRIDES: Record<string, Record<string, DemoScenarioTranslations>> = {
  tax: {
    en: {
      docTypeLabel: 'Income Tax Assessment',
      fields: { authority: 'Tax Office', reference: 'Tax Number', date: 'Assessment Date', noticeType: 'Assessment Type', amount: 'Additional Payment' },
      questions: {
        dq1: { question: 'Did you have income from multiple sources in 2023 (e.g. employment and freelance)?', background: 'Multiple income types affect the tax progression under § 32a EStG.', autoAnswer: 'Yes' },
        dq2: { question: 'What work-related expenses did you claim in your tax return?', background: 'Work-related expenses under § 9 EStG directly reduce taxable income.', autoAnswer: 'Home office flat rate, professional literature, commuting costs' },
      },
      agentLabels: {
        drafter: { label: 'Draft', summary: 'Appeal letter under § 347 AO drafted. Work-related expenses and calculation errors identified as main arguments.' },
        reviewer: { label: 'Review', summary: 'Legal arguments reviewed. Reference to BFH ruling VI R 2/21 on home office flat rate added.' },
        factchecker: { label: 'Fact Check', summary: 'Current case law verified. § 9 Abs. 5 EStG and BMF letter of 15.08.2023 correctly cited.' },
        adversary: { label: 'Counter-Check', summary: 'Tax office perspective adopted. Proof of professional necessity of expenses flagged as potentially weak point.' },
        consolidator: { label: 'Consolidation', summary: 'All agent results merged. Wording sharpened and final letter optimised.' },
      },
    },
    fr: {
      docTypeLabel: 'Avis d\'imposition',
      fields: { authority: 'Bureau des impôts', reference: 'Numéro fiscal', date: 'Date de l\'avis', noticeType: 'Type d\'avis', amount: 'Complément à payer' },
      questions: {
        dq1: { question: 'Aviez-vous des revenus provenant de plusieurs sources en 2023 (ex. emploi et freelance) ?', background: 'Plusieurs types de revenus affectent la progressivité de l\'impôt selon § 32a EStG.', autoAnswer: 'Oui' },
        dq2: { question: 'Quels frais professionnels avez-vous déclarés dans votre déclaration d\'impôts ?', background: 'Les frais professionnels selon § 9 EStG réduisent directement le revenu imposable.', autoAnswer: 'Forfait bureau à domicile, littérature professionnelle, frais de transport domicile-travail' },
      },
      agentLabels: {
        drafter: { label: 'Rédaction', summary: 'Lettre de recours selon § 347 AO rédigée. Frais professionnels et erreurs de calcul identifiés comme arguments principaux.' },
        reviewer: { label: 'Révision', summary: 'Argumentation juridique vérifiée. Référence à l\'arrêt BFH VI R 2/21 sur le forfait bureau à domicile ajoutée.' },
        factchecker: { label: 'Vérification', summary: 'Jurisprudence actuelle vérifiée. § 9 Abs. 5 EStG et lettre BMF du 15.08.2023 correctement cités.' },
        adversary: { label: 'Contre-vérification', summary: 'Perspective du fisc adoptée. Preuve de la nécessité professionnelle des frais signalée comme point potentiellement faible.' },
        consolidator: { label: 'Consolidation', summary: 'Tous les résultats des agents fusionnés. Formulation affinée et lettre finale optimisée.' },
      },
    },
    es: {
      docTypeLabel: 'Liquidación del IRPF',
      fields: { authority: 'Oficina tributaria', reference: 'Número fiscal', date: 'Fecha de liquidación', noticeType: 'Tipo de liquidación', amount: 'Pago adicional' },
      questions: {
        dq1: { question: '¿Tuvo ingresos de varias fuentes en 2023 (p. ej. empleo y trabajo autónomo)?', background: 'Varios tipos de ingresos afectan la progresividad fiscal según § 32a EStG.', autoAnswer: 'Sí' },
        dq2: { question: '¿Qué gastos deducibles declaró en su declaración de la renta?', background: 'Los gastos deducibles según § 9 EStG reducen directamente la base imponible.', autoAnswer: 'Tarifa plana de oficina en casa, literatura profesional, gastos de desplazamiento al trabajo' },
      },
      agentLabels: {
        drafter: { label: 'Borrador', summary: 'Carta de recurso según § 347 AO redactada. Gastos deducibles y errores de cálculo identificados como argumentos principales.' },
        reviewer: { label: 'Revisión', summary: 'Argumentación jurídica revisada. Referencia a la sentencia BFH VI R 2/21 sobre tarifa plana de oficina en casa añadida.' },
        factchecker: { label: 'Verificación', summary: 'Jurisprudencia actual verificada. § 9 Abs. 5 EStG y carta BMF del 15.08.2023 citados correctamente.' },
        adversary: { label: 'Contraverificación', summary: 'Perspectiva de la oficina tributaria adoptada. Prueba de la necesidad profesional de los gastos marcada como punto potencialmente débil.' },
        consolidator: { label: 'Consolidación', summary: 'Todos los resultados de los agentes fusionados. Redacción perfeccionada y carta final optimizada.' },
      },
    },
    it: {
      docTypeLabel: 'Avviso di accertamento',
      fields: { authority: 'Ufficio delle imposte', reference: 'Codice fiscale', date: 'Data dell\'avviso', noticeType: 'Tipo di avviso', amount: 'Pagamento aggiuntivo' },
      questions: {
        dq1: { question: 'Ha avuto redditi da più fonti nel 2023 (es. lavoro dipendente e lavoro autonomo)?', background: 'Più tipi di reddito influenzano la progressività fiscale ai sensi del § 32a EStG.', autoAnswer: 'Sì' },
        dq2: { question: 'Quali spese deducibili ha indicato nella sua dichiarazione dei redditi?', background: 'Le spese deducibili ai sensi del § 9 EStG riducono direttamente il reddito imponibile.', autoAnswer: 'Forfait ufficio a casa, letteratura professionale, spese di trasporto al lavoro' },
      },
      agentLabels: {
        drafter: { label: 'Bozza', summary: 'Lettera di ricorso ai sensi del § 347 AO redatta. Spese deducibili ed errori di calcolo identificati come argomenti principali.' },
        reviewer: { label: 'Revisione', summary: 'Argomentazione giuridica verificata. Riferimento alla sentenza BFH VI R 2/21 sul forfait ufficio a casa aggiunto.' },
        factchecker: { label: 'Verifica fatti', summary: 'Giurisprudenza attuale verificata. § 9 Abs. 5 EStG e lettera BMF del 15.08.2023 citati correttamente.' },
        adversary: { label: 'Controanalisi', summary: 'Prospettiva dell\'ufficio tributario adottata. Prova della necessità professionale delle spese segnalata come punto potenzialmente debole.' },
        consolidator: { label: 'Consolidamento', summary: 'Tutti i risultati degli agenti uniti. Formulazione affinata e lettera finale ottimizzata.' },
      },
    },
    pl: {
      docTypeLabel: 'Decyzja podatkowa',
      fields: { authority: 'Urząd skarbowy', reference: 'Numer podatkowy', date: 'Data decyzji', noticeType: 'Rodzaj decyzji', amount: 'Dopłata' },
      questions: {
        dq1: { question: 'Czy w 2023 roku miał/a Pan/Pani dochody z kilku źródeł (np. etat i freelance)?', background: 'Kilka rodzajów dochodów wpływa na progresję podatkową zgodnie z § 32a EStG.', autoAnswer: 'Tak' },
        dq2: { question: 'Jakie koszty uzyskania przychodu odliczył/a Pan/Pani w zeznaniu podatkowym?', background: 'Koszty uzyskania przychodu zgodnie z § 9 EStG bezpośrednio zmniejszają podstawę opodatkowania.', autoAnswer: 'Ryczałt za pracę z domu, literatura fachowa, koszty dojazdu do pracy' },
      },
      agentLabels: {
        drafter: { label: 'Szkic', summary: 'Pismo odwoławcze na podstawie § 347 AO sporządzone. Koszty uzyskania przychodu i błędy obliczeniowe zidentyfikowane jako główne argumenty.' },
        reviewer: { label: 'Weryfikacja', summary: 'Argumentacja prawna sprawdzona. Dodano odwołanie do wyroku BFH VI R 2/21 w sprawie ryczałtu za pracę z domu.' },
        factchecker: { label: 'Sprawdzenie faktów', summary: 'Aktualne orzecznictwo zweryfikowane. § 9 Abs. 5 EStG i pismo BMF z 15.08.2023 poprawnie cytowane.' },
        adversary: { label: 'Kontranaliza', summary: 'Przyjęta perspektywa urzędu skarbowego. Dowód zawodowej konieczności kosztów oznaczony jako potencjalnie słaby punkt.' },
        consolidator: { label: 'Konsolidacja', summary: 'Wszystkie wyniki agentów połączone. Sformułowanie wyostrzone i ostateczne pismo zoptymalizowane.' },
      },
    },
    ru: {
      docTypeLabel: 'Налоговое уведомление',
      fields: { authority: 'Налоговая инспекция', reference: 'Налоговый номер', date: 'Дата уведомления', noticeType: 'Тип уведомления', amount: 'Доплата' },
      questions: {
        dq1: { question: 'Были ли у вас в 2023 году доходы из нескольких источников (например, работа по найму и фриланс)?', background: 'Несколько видов доходов влияют на налоговую прогрессию согласно § 32a EStG.', autoAnswer: 'Да' },
        dq2: { question: 'Какие расходы, связанные с работой, вы заявили в налоговой декларации?', background: 'Расходы, связанные с работой, согласно § 9 EStG напрямую уменьшают налогооблагаемый доход.', autoAnswer: 'Единовременная надбавка за домашний офис, профессиональная литература, расходы на проезд до работы' },
      },
      agentLabels: {
        drafter: { label: 'Черновик', summary: 'Составлено письмо с возражением согласно § 347 AO. Расходы на работу и ошибки расчёта определены как основные аргументы.' },
        reviewer: { label: 'Проверка', summary: 'Правовая аргументация проверена. Добавлена ссылка на решение BFH VI R 2/21 о надбавке за домашний офис.' },
        factchecker: { label: 'Проверка фактов', summary: 'Актуальная судебная практика проверена. § 9 Abs. 5 EStG и письмо BMF от 15.08.2023 процитированы корректно.' },
        adversary: { label: 'Контрпроверка', summary: 'Принята позиция налоговой инспекции. Доказательство профессиональной необходимости расходов отмечено как потенциально слабое место.' },
        consolidator: { label: 'Консолидация', summary: 'Все результаты агентов объединены. Формулировки отточены, итоговое письмо оптимизировано.' },
      },
    },
    tr: {
      docTypeLabel: 'Vergi tebligatı',
      fields: { authority: 'Vergi dairesi', reference: 'Vergi numarası', date: 'Tebligat tarihi', noticeType: 'Tebligat türü', amount: 'Ek ödeme' },
      questions: {
        dq1: { question: '2023 yılında birden fazla kaynaktan geliriniz var mıydı (örn. çalışan ve serbest meslek)?', background: 'Birden fazla gelir türü, § 32a EStG uyarınca vergi dilimine etki eder.', autoAnswer: 'Evet' },
        dq2: { question: 'Vergi beyannamenizde hangi iş giderlerini talep ettiniz?', background: 'İş giderleri § 9 EStG uyarınca vergilendirilebilir geliri doğrudan azaltır.', autoAnswer: 'Evden çalışma götürü gideri, mesleki yayınlar, işe gidiş-dönüş ulaşım giderleri' },
      },
      agentLabels: {
        drafter: { label: 'Taslak', summary: '§ 347 AO uyarınca itiraz mektubu hazırlandı. İş giderleri ve hesaplama hataları ana argüman olarak belirlendi.' },
        reviewer: { label: 'İnceleme', summary: 'Hukuki argümantasyon incelendi. BFH kararı VI R 2/21\'in ev ofis götürü gideriyle ilgili atıfı eklendi.' },
        factchecker: { label: 'Gerçek Kontrolü', summary: 'Güncel içtihat doğrulandı. § 9 Abs. 5 EStG ve 15.08.2023 tarihli BMF yazısı doğru aktarıldı.' },
        adversary: { label: 'Karşı Kontrol', summary: 'Vergi dairesi perspektifi benimsendi. Giderlerin mesleki zorunluluğunun kanıtlanması potansiyel zayıf nokta olarak işaretlendi.' },
        consolidator: { label: 'Konsolidasyon', summary: 'Tüm ajan sonuçları birleştirildi. İfade netleştirildi ve nihai mektup optimize edildi.' },
      },
    },
    uk: {
      docTypeLabel: 'Податкове повідомлення',
      fields: { authority: 'Податкова інспекція', reference: 'Податковий номер', date: 'Дата повідомлення', noticeType: 'Тип повідомлення', amount: 'Доплата' },
      questions: {
        dq1: { question: 'Чи мали ви у 2023 році доходи з кількох джерел (наприклад, робота за наймом і фріланс)?', background: 'Кілька видів доходів впливають на прогресію оподаткування відповідно до § 32a EStG.', autoAnswer: 'Так' },
        dq2: { question: 'Які витрати, пов\'язані з роботою, ви задекларували у своїй податковій декларації?', background: 'Витрати, пов\'язані з роботою, відповідно до § 9 EStG безпосередньо зменшують оподатковуваний дохід.', autoAnswer: 'Одноразова надбавка за домашній офіс, фахова література, витрати на проїзд до роботи' },
      },
      agentLabels: {
        drafter: { label: 'Чернетка', summary: 'Складено лист із запереченням відповідно до § 347 AO. Витрати на роботу та помилки розрахунку визначено як основні аргументи.' },
        reviewer: { label: 'Перевірка', summary: 'Правова аргументація перевірена. Додано посилання на рішення BFH VI R 2/21 щодо надбавки за домашній офіс.' },
        factchecker: { label: 'Перевірка фактів', summary: 'Актуальна судова практика перевірена. § 9 Abs. 5 EStG і лист BMF від 15.08.2023 процитовані коректно.' },
        adversary: { label: 'Контрперевірка', summary: 'Прийнято позицію податкової інспекції. Доказ професійної необхідності витрат позначено як потенційно слабке місце.' },
        consolidator: { label: 'Консолідація', summary: 'Всі результати агентів об\'єднані. Формулювання відточені, підсумковий лист оптимізовано.' },
      },
    },
    ar: {
      docTypeLabel: 'إشعار ضريبي',
      fields: { authority: 'مكتب الضرائب', reference: 'الرقم الضريبي', date: 'تاريخ الإشعار', noticeType: 'نوع الإشعار', amount: 'دفعة إضافية' },
      questions: {
        dq1: { question: 'هل كان لديك دخل من مصادر متعددة في عام 2023 (مثل الوظيفة والعمل الحر)؟', background: 'تؤثر أنواع الدخل المتعددة على التصاعد الضريبي وفق § 32a EStG.', autoAnswer: 'نعم' },
        dq2: { question: 'ما هي نفقات العمل التي طالبت بها في إقرارك الضريبي؟', background: 'نفقات العمل وفق § 9 EStG تخفض الدخل الخاضع للضريبة مباشرةً.', autoAnswer: 'بدل مكتب منزلي مقطوع، أدبيات مهنية، تكاليف التنقل إلى العمل' },
      },
      agentLabels: {
        drafter: { label: 'المسودة', summary: 'تمت صياغة خطاب اعتراض وفق § 347 AO. تحديد نفقات العمل وأخطاء الحساب كحجج رئيسية.' },
        reviewer: { label: 'المراجعة', summary: 'مراجعة الحجج القانونية. إضافة إشارة إلى حكم BFH VI R 2/21 بشأن بدل مكتب منزلي.' },
        factchecker: { label: 'التحقق من الوقائع', summary: 'التحقق من الاجتهاد القضائي الحالي. § 9 Abs. 5 EStG وخطاب BMF المؤرخ 15.08.2023 مُستشهد بهما بشكل صحيح.' },
        adversary: { label: 'الفحص المضاد', summary: 'اعتماد منظور مكتب الضرائب. تحديد إثبات الضرورة المهنية للنفقات كنقطة ضعف محتملة.' },
        consolidator: { label: 'التوحيد', summary: 'دمج جميع نتائج الوكلاء. صقل الصياغة وتحسين الخطاب النهائي.' },
      },
    },
    pt: {
      docTypeLabel: 'Aviso de liquidação fiscal',
      fields: { authority: 'Repartição de finanças', reference: 'Número fiscal', date: 'Data do aviso', noticeType: 'Tipo de aviso', amount: 'Pagamento adicional' },
      questions: {
        dq1: { question: 'Teve rendimentos de várias fontes em 2023 (ex. emprego e trabalho independente)?', background: 'Vários tipos de rendimento afetam a progressividade fiscal ao abrigo do § 32a EStG.', autoAnswer: 'Sim' },
        dq2: { question: 'Que despesas profissionais declarou na sua declaração de rendimentos?', background: 'As despesas profissionais ao abrigo do § 9 EStG reduzem diretamente o rendimento tributável.', autoAnswer: 'Forfait de escritório em casa, literatura profissional, despesas de deslocação para o trabalho' },
      },
      agentLabels: {
        drafter: { label: 'Rascunho', summary: 'Carta de recurso ao abrigo do § 347 AO redigida. Despesas profissionais e erros de cálculo identificados como argumentos principais.' },
        reviewer: { label: 'Revisão', summary: 'Argumentação jurídica revista. Referência ao acórdão BFH VI R 2/21 sobre o forfait de escritório em casa adicionada.' },
        factchecker: { label: 'Verificação de Factos', summary: 'Jurisprudência atual verificada. § 9 Abs. 5 EStG e carta BMF de 15.08.2023 corretamente citados.' },
        adversary: { label: 'Contra-análise', summary: 'Perspetiva da repartição de finanças adotada. Prova da necessidade profissional das despesas assinalada como ponto potencialmente fraco.' },
        consolidator: { label: 'Consolidação', summary: 'Todos os resultados dos agentes fundidos. Redação apurada e carta final otimizada.' },
      },
    },
  },
  grundsteuer: {
    en: {
      docTypeLabel: 'Property Tax Assessment',
      fields: { authority: 'Authority', reference: 'Case reference', date: 'Notice date', property: 'Property', amount: 'Annual property tax', area: 'Recorded area' },
      questions: {
        dq1: { question: 'Does the property area in the notice differ from your land register entry?', background: 'Area errors are the most common error in property tax assessments after the 2022 reform.', autoAnswer: 'Yes' },
        dq2: { question: 'What is the actual property area according to your land register?', background: 'Under § 244 BewG, the actual land area is used for the calculation.', autoAnswer: '380 m² according to land register of 10.05.2022' },
      },
      agentLabels: {
        drafter: { label: 'Draft', summary: 'Objection under § 347 AO in conjunction with GrStG drafted. Incorrect land area (420 m² instead of 380 m²) cited as main reason.' },
        reviewer: { label: 'Review', summary: 'Reference to § 244 BewG and Property Tax Reform Act 2022 correct. Proof via land register recommended.' },
        factchecker: { label: 'Fact Check', summary: 'Objection deadline (1 month under § 355 AO) and current error rates in 2022 property tax assessments verified.' },
        adversary: { label: 'Counter-Check', summary: 'Possible counter-arguments from the authority analysed. Measurement error vs. database error identified as the central question.' },
        consolidator: { label: 'Consolidation', summary: 'Final letter optimised. Clear application for recalculation and enclosure of land register extract formulated.' },
      },
    },
  },
  jobcenter: {
    en: {
      docTypeLabel: 'Bürgergeld Sanction Notice',
      fields: { authority: 'Jobcenter', reference: 'Household number', date: 'Notice date', sanction: 'Sanction type', amount: 'Reduction amount' },
      questions: {
        dq1: { question: 'Did you receive a written invitation from the Jobcenter before the missed appointment?', background: 'A sanction under § 32 SGB II requires a proper written invitation with a legal consequences notice.', autoAnswer: 'No' },
        dq2: { question: 'Was there an important reason for not attending (e.g., illness, accident)?', background: 'An important reason under § 31 SGB II excludes the sanction. Evidence such as sick notes must be enclosed.', autoAnswer: 'Yes' },
      },
      agentLabels: {
        drafter: { label: 'Draft', summary: 'Objection under § 78 SGG drafted. Missing legal consequences notice and important reason (illness) cited as arguments.' },
        reviewer: { label: 'Review', summary: 'BSG case law on missed appointments checked. BSG ruling B 14 AS 25/12 R cited as support for missing notice.' },
        factchecker: { label: 'Fact Check', summary: 'Current legal situation on Bürgergeld sanctions under the Bürgergeld Act 2023 correctly presented.' },
        adversary: { label: 'Counter-Check', summary: 'Jobcenter perspective analysed. Proof of illness by medical certificate assessed as decisive.' },
        consolidator: { label: 'Consolidation', summary: 'Letter finalised. Application for suspensive effect and enclosure of certificate added.' },
      },
    },
  },
  rente: {
    en: {
      docTypeLabel: 'Pension Notice',
      fields: { authority: 'Authority', reference: 'Insurance number', date: 'Notice date', type: 'Pension type', amount: 'Monthly pension', missingYears: 'Missing periods' },
      questions: {
        dq1: { question: 'Are there employment or contribution periods that may not have been recorded?', background: 'Missing contribution periods reduce the pension entitlement under § 63 SGB VI.', autoAnswer: 'Yes, approximately 3 years from 1995 to 1998' },
        dq2: { question: 'Do you have documents for the missing periods (payslips, employment contracts)?', background: 'Documented missing periods can be corrected via an application under § 149 SGB VI.', autoAnswer: 'Yes, I have payslips and an employment contract' },
      },
      agentLabels: {
        drafter: { label: 'Draft', summary: 'Objection under § 78 SGG drafted. Missing 3 contribution years (1995–1998) as main argument.' },
        reviewer: { label: 'Review', summary: '§§ 63, 149 SGB VI correctly applied. Supplementary evidence procedure recommended.' },
        factchecker: { label: 'Fact Check', summary: 'Current Deutsche Rentenversicherung guidelines on correction of insurance histories verified.' },
        adversary: { label: 'Counter-Check', summary: 'DRV perspective: burden of proof for missing periods lies with the insured. Documents decisive.' },
        consolidator: { label: 'Consolidation', summary: 'Objection finalised. Application for supplementary evidence procedure and enclosure of documents formulated.' },
      },
    },
  },
  krankenversicherung: {
    en: {
      docTypeLabel: 'Health Insurance Rejection',
      fields: { authority: 'Health insurer', reference: 'Insurance number', date: 'Notice date', service: 'Rejected service', reason: 'Reason for rejection' },
      questions: {
        dq1: { question: 'Has your treating doctor confirmed medical necessity of the rejected treatment in writing?', background: 'Medical necessity is the central criterion for approval of services under § 12 SGB V.', autoAnswer: 'Yes, I have a medical certificate' },
        dq2: { question: 'Did the health insurer decide within the 5-week deadline (§ 13 para. 3a SGB V)?', background: 'If the insurer does not decide within 5 weeks, the service is deemed approved under the approval fiction.', autoAnswer: 'No, it took more than 6 weeks' },
      },
      agentLabels: {
        drafter: { label: 'Draft', summary: 'Objection under § 78 SGG drafted. Medical necessity and approval fiction under § 13 para. 3a SGB V as main arguments.' },
        reviewer: { label: 'Review', summary: '§ 13 SGB V and BSG case law on approval fiction correctly applied.' },
        factchecker: { label: 'Fact Check', summary: 'Current BSG rulings on medical necessity and MDK assessments verified.' },
        adversary: { label: 'Counter-Check', summary: 'Insurer perspective: MDK assessment has evidentiary weight. Independent expert opinion recommended.' },
        consolidator: { label: 'Consolidation', summary: 'Objection finalised. Request to disclose MDK report and obtain independent expert opinion included.' },
      },
    },
  },
  kuendigung: {
    en: {
      docTypeLabel: 'Dismissal Notice',
      fields: { employer: 'Employer', date: 'Dismissal date', type: 'Type of dismissal', notice: 'Notice period', tenure: 'Length of service' },
      questions: {
        dq1: { question: 'Is there a works council at your workplace?', background: 'Without works council consultation under § 102 BetrVG, a dismissal is invalid — regardless of the reason.', autoAnswer: 'Yes' },
        dq2: { question: 'Were you informed about the works council consultation?', background: 'Under § 102 para. 1 BetrVG, the works council must be consulted before any dismissal. A dismissal without consultation is void.', autoAnswer: 'No' },
      },
      agentLabels: {
        drafter: { label: 'Draft', summary: 'Unfair dismissal claim under § 4 KSchG prepared. Missing works council consultation (§ 102 BetrVG) identified as strongest ground for invalidity.' },
        reviewer: { label: 'Review', summary: 'Three-week deadline (§ 4 KSchG) correctly mentioned. Social justification (§ 1 KSchG) and continued employment application added.' },
        factchecker: { label: 'Fact Check', summary: 'BAG case law on § 102 BetrVG correct. Dismissal without consultation is absolutely void under BAG ruling 2 AZR 296/13.' },
        adversary: { label: 'Counter-Check', summary: 'Employer perspective: works council documentation might exist. Proof of consultation vs. missing consultation as key question.' },
        consolidator: { label: 'Consolidation', summary: 'Letter to labour court finalised. Important note on 3-week deadline prominently placed.' },
      },
    },
  },
  miete: {
    en: {
      docTypeLabel: 'Rent Increase Notice',
      fields: { landlord: 'Landlord', date: 'Letter date', currentRent: 'Current rent', newRent: 'Demanded rent', increase: 'Increase', apartment: 'Floor area' },
      questions: {
        dq1: { question: 'How long have you had your tenancy?', background: 'Rent increases under § 558 para. 1 BGB are only permitted at the earliest 15 months after the last increase or the start of the tenancy.', autoAnswer: '2019-03-01' },
        dq2: { question: 'When was the last rent increase?', background: 'The statutory cap under § 558 para. 3 BGB limits increases to a maximum of 15% in 3 years (20% in areas with tight housing markets).', autoAnswer: '2021-06-01' },
      },
      agentLabels: {
        drafter: { label: 'Draft', summary: 'Objection under § 558b BGB drafted. Exceeding the statutory cap and insufficient rent index justification as main arguments.' },
        reviewer: { label: 'Review', summary: '§§ 558, 558a, 558b BGB correctly applied. Reference to Berlin Rent Index 2023 and statutory cap (15%) added.' },
        factchecker: { label: 'Fact Check', summary: 'Berlin Rent Index 2023 for Berlin-Mitte, 75 m² researched. Comparative rent significantly below demanded amount.' },
        adversary: { label: 'Counter-Check', summary: 'Landlord perspective: increase might be based on modernisation. Counter-argument on modernisation surcharge added.' },
        consolidator: { label: 'Consolidation', summary: 'Objection finalised. Application to maintain current rent and deadline for evidence clearly formulated.' },
      },
    },
  },
  bussgeld: {
    en: {
      docTypeLabel: 'Fine / Penalty Notice',
      fields: { authority: 'Fine authority', reference: 'Case reference', date: 'Notice date', offence: 'Alleged offence', fine: 'Fine amount', points: 'Points in Flensburg' },
      questions: {
        dq1: { question: 'Were you actually the driver at the time of the alleged offence?', background: 'As the vehicle owner, you are not automatically the driver. The authority must prove you were driving.', autoAnswer: 'Yes' },
        dq2: { question: 'Do you have information about the measuring device or its calibration certificate?', background: 'An expired calibration certificate or measurement errors can lead to the case being dropped (§ 25 MessEG).', autoAnswer: 'I request file access to review the device and calibration certificate' },
      },
      agentLabels: {
        drafter: { label: 'Draft', summary: 'Objection under § 67 OWiG drafted. File access request and review of calibration certificate as core strategy.' },
        reviewer: { label: 'Review', summary: '§§ 67, 46 OWiG and measurement protocol requirements correct. Reference to standardised measurement procedure (ES 3.0) added.' },
        factchecker: { label: 'Fact Check', summary: 'Calibration requirement under MessEG correctly presented. Current OLG case law on measurement errors and expired calibrations verified.' },
        adversary: { label: 'Counter-Check', summary: 'Authority perspective: standardised measurement procedures have evidentiary weight. Substantiated objection to measurement needed, not blanket rejection.' },
        consolidator: { label: 'Consolidation', summary: 'Objection finalised. File access request prominently formulated — reveals procedural defects in 30% of cases.' },
      },
    },
  },
}

// ── Scenario registry ─────────────────────────────────────────────────────────

const SCENARIOS: Record<string, DemoScenario> = {
  tax: TAX_SCENARIO,
  grundsteuer: GRUNDSTEUER_SCENARIO,
  jobcenter: JOBCENTER_SCENARIO,
  rente: RENTE_SCENARIO,
  krankenversicherung: KV_SCENARIO,
  kuendigung: KUENDIGUNG_SCENARIO,
  miete: MIETE_SCENARIO,
  bussgeld: BUSSGELD_SCENARIO,
}

/**
 * Returns the demo scenario for the given use-case type, optionally translated
 * into the requested locale. German ('de') returns the base scenario unchanged.
 * All non-German locales fall back to the 'en' override if an exact match is missing.
 */
export function getDemoScenario(type: string, locale?: string): DemoScenario {
  const base = SCENARIOS[type] ?? SCENARIOS['tax']

  // German is the base language — return unchanged
  if (!locale || locale === 'de') return base

  // Find override: exact locale match, then fall back to 'en'
  const scenarioOverrides = LOCALE_OVERRIDES[type] ?? LOCALE_OVERRIDES['tax']
  const t = scenarioOverrides?.[locale] ?? scenarioOverrides?.['en']
  if (!t) return base

  return {
    ...base,
    docType: { ...base.docType, label: t.docTypeLabel },
    fields: base.fields.map((f) => ({ ...f, label: t.fields[f.key] ?? f.label })),
    questions: base.questions.map((q) => ({
      ...q,
      question: t.questions[q.id]?.question ?? q.question,
      background: t.questions[q.id]?.background ?? q.background,
      autoAnswer: t.questions[q.id]?.autoAnswer ?? q.autoAnswer,
    })),
    agentOutputs: base.agentOutputs.map((a) => ({
      ...a,
      label: t.agentLabels[a.role]?.label ?? a.label,
      summary: t.agentLabels[a.role]?.summary ?? a.summary,
    })),
  }
}
