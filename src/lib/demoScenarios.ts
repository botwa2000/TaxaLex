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
      fields: { authority: 'Authority', reference: 'Reference Number', date: 'Assessment Date', property: 'Property', amount: 'Annual Property Tax', area: 'Recorded Area' },
      questions: {
        dq1: { question: 'Does the plot area shown in the assessment differ from your land register extract?', background: 'Area errors are the most common reason for objections to property tax assessments after the 2022 reform.', autoAnswer: 'Yes' },
        dq2: { question: 'What is the actual plot area according to your land register extract?', background: 'Under § 244 BewG, the actual area of the plot is used for the calculation.', autoAnswer: '380 m² according to land register extract dated 10.05.2022' },
      },
      agentLabels: {
        drafter: { label: 'Draft', summary: 'Objection under § 347 AO in conjunction with GrStG drafted. Incorrect plot area (420 m² instead of 380 m²) named as main reason.' },
        reviewer: { label: 'Review', summary: 'Reference to § 244 BewG and Property Tax Reform Act 2022 correct. Proof by land register extract recommended.' },
        factchecker: { label: 'Fact Check', summary: 'Objection deadline (1 month under § 355 AO) and current error rates for 2022 property tax assessments verified.' },
        adversary: { label: 'Counter-Check', summary: 'Possible counterarguments of the authority analysed. Measurement error vs. database error identified as central issue.' },
        consolidator: { label: 'Consolidation', summary: 'Final letter optimised. Clear request for recalculation and enclosure of land register extract as attachment formulated.' },
      },
    },
    fr: {
      docTypeLabel: 'Avis de taxe foncière',
      fields: { authority: 'Autorité', reference: 'Référence', date: 'Date de l\'avis', property: 'Bien immobilier', amount: 'Taxe foncière annuelle', area: 'Superficie enregistrée' },
      questions: {
        dq1: { question: 'La superficie de la parcelle indiquée dans l\'avis diffère-t-elle de votre extrait du registre foncier ?', background: 'Les erreurs de superficie sont la cause la plus fréquente de réclamations après la réforme de 2022.', autoAnswer: 'Oui' },
        dq2: { question: 'Quelle est la superficie réelle de la parcelle selon votre extrait du registre foncier ?', background: 'Selon § 244 BewG, la superficie réelle de la parcelle est utilisée pour le calcul.', autoAnswer: '380 m² selon l\'extrait du registre foncier du 10.05.2022' },
      },
      agentLabels: {
        drafter: { label: 'Rédaction', summary: 'Recours selon § 347 AO en lien avec GrStG rédigé. Superficie incorrecte (420 m² au lieu de 380 m²) mentionnée comme raison principale.' },
        reviewer: { label: 'Révision', summary: 'Référence à § 244 BewG et à la loi de réforme 2022 correcte. Preuve par extrait du registre foncier recommandée.' },
        factchecker: { label: 'Vérification', summary: 'Délai de recours (1 mois selon § 355 AO) et taux d\'erreur actuels pour les avis 2022 vérifiés.' },
        adversary: { label: 'Contre-vérification', summary: 'Contre-arguments possibles de l\'autorité analysés. Erreur de mesure vs erreur de base de données identifiée comme question centrale.' },
        consolidator: { label: 'Consolidation', summary: 'Lettre finale optimisée. Demande de recalcul et annexe de l\'extrait du registre foncier clairement formulées.' },
      },
    },
    es: {
      docTypeLabel: 'Liquidación del IBI',
      fields: { authority: 'Autoridad', reference: 'Número de referencia', date: 'Fecha de liquidación', property: 'Inmueble', amount: 'IBI anual', area: 'Superficie registrada' },
      questions: {
        dq1: { question: '¿Difiere la superficie del terreno que figura en la liquidación de su extracto del registro de la propiedad?', background: 'Los errores de superficie son la causa más frecuente de reclamaciones tras la reforma de 2022.', autoAnswer: 'Sí' },
        dq2: { question: '¿Cuál es la superficie real del terreno según su extracto del registro de la propiedad?', background: 'Conforme al § 244 BewG, la superficie real del terreno se utiliza para el cálculo.', autoAnswer: '380 m² según extracto del registro de la propiedad de 10.05.2022' },
      },
      agentLabels: {
        drafter: { label: 'Borrador', summary: 'Recurso según § 347 AO en relación con GrStG redactado. Superficie incorrecta (420 m² en lugar de 380 m²) indicada como motivo principal.' },
        reviewer: { label: 'Revisión', summary: 'Referencia a § 244 BewG y a la Ley de Reforma del IBI de 2022 correcta. Se recomienda acreditar con extracto del registro.' },
        factchecker: { label: 'Verificación', summary: 'Plazo de recurso (1 mes según § 355 AO) y tasas de error actuales para las liquidaciones de 2022 verificados.' },
        adversary: { label: 'Contraverificación', summary: 'Posibles contraargumentos de la autoridad analizados. Error de medición vs. error de base de datos identificado como cuestión central.' },
        consolidator: { label: 'Consolidación', summary: 'Carta final optimizada. Solicitud de recálculo y adjunto del extracto del registro claramente formulados.' },
      },
    },
    it: {
      docTypeLabel: 'Avviso IMU',
      fields: { authority: 'Autorità', reference: 'Numero di riferimento', date: 'Data dell\'avviso', property: 'Immobile', amount: 'IMU annua', area: 'Superficie registrata' },
      questions: {
        dq1: { question: 'La superficie del terreno indicata nell\'avviso differisce dal suo estratto catastale?', background: 'Gli errori di superficie sono la causa più frequente di ricorsi dopo la riforma del 2022.', autoAnswer: 'Sì' },
        dq2: { question: 'Qual è la superficie reale del terreno secondo il suo estratto catastale?', background: 'Ai sensi del § 244 BewG, la superficie reale del terreno è utilizzata per il calcolo.', autoAnswer: '380 m² secondo l\'estratto catastale del 10.05.2022' },
      },
      agentLabels: {
        drafter: { label: 'Bozza', summary: 'Ricorso ai sensi del § 347 AO in combinato con GrStG redatto. Superficie errata (420 m² anziché 380 m²) indicata come motivo principale.' },
        reviewer: { label: 'Revisione', summary: 'Riferimento al § 244 BewG e alla legge di riforma 2022 corretto. Prova tramite estratto catastale raccomandata.' },
        factchecker: { label: 'Verifica fatti', summary: 'Termine per il ricorso (1 mese ai sensi del § 355 AO) e tassi di errore attuali per gli avvisi 2022 verificati.' },
        adversary: { label: 'Controanalisi', summary: 'Possibili controargomentazioni dell\'autorità analizzate. Errore di misurazione vs. errore di database identificato come questione centrale.' },
        consolidator: { label: 'Consolidamento', summary: 'Lettera finale ottimizzata. Chiara richiesta di ricalcolo e allegato dell\'estratto catastale formulati.' },
      },
    },
    pl: {
      docTypeLabel: 'Decyzja o podatku od nieruchomości',
      fields: { authority: 'Urząd', reference: 'Numer sprawy', date: 'Data decyzji', property: 'Nieruchomość', amount: 'Podatek roczny', area: 'Zarejestrowana powierzchnia' },
      questions: {
        dq1: { question: 'Czy powierzchnia działki wskazana w decyzji różni się od Pana/Pani wypisu z księgi wieczystej?', background: 'Błędy powierzchni są najczęstszą przyczyną odwołań od decyzji o podatku od nieruchomości po reformie 2022.', autoAnswer: 'Tak' },
        dq2: { question: 'Jaka jest rzeczywista powierzchnia działki według wypisu z księgi wieczystej?', background: 'Zgodnie z § 244 BewG do obliczeń przyjmuje się rzeczywistą powierzchnię działki.', autoAnswer: '380 m² według wypisu z księgi wieczystej z 10.05.2022' },
      },
      agentLabels: {
        drafter: { label: 'Szkic', summary: 'Odwołanie na podstawie § 347 AO w związku z GrStG sporządzone. Błędna powierzchnia działki (420 m² zamiast 380 m²) wskazana jako główny powód.' },
        reviewer: { label: 'Weryfikacja', summary: 'Odwołanie do § 244 BewG i ustawy reformy 2022 prawidłowe. Zalecane potwierdzenie wypisem z księgi wieczystej.' },
        factchecker: { label: 'Sprawdzenie faktów', summary: 'Termin odwołania (1 miesiąc wg § 355 AO) i aktualne wskaźniki błędów w decyzjach 2022 zweryfikowane.' },
        adversary: { label: 'Kontranaliza', summary: 'Możliwe kontrargumenty urzędu przeanalizowane. Błąd pomiarowy vs błąd w bazie danych jako kwestia kluczowa.' },
        consolidator: { label: 'Konsolidacja', summary: 'Ostateczne pismo zoptymalizowane. Jasny wniosek o ponowne obliczenie i dołączenie wypisu jako załącznika.' },
      },
    },
    ru: {
      docTypeLabel: 'Уведомление о налоге на имущество',
      fields: { authority: 'Ведомство', reference: 'Номер дела', date: 'Дата уведомления', property: 'Объект недвижимости', amount: 'Годовой налог', area: 'Зарегистрированная площадь' },
      questions: {
        dq1: { question: 'Отличается ли площадь участка, указанная в уведомлении, от данных в выписке из земельного кадастра?', background: 'Ошибки в площади — наиболее частая причина возражений на уведомления о налоге после реформы 2022 года.', autoAnswer: 'Да' },
        dq2: { question: 'Какова фактическая площадь участка согласно выписке из земельного кадастра?', background: 'В соответствии с § 244 BewG для расчёта используется фактическая площадь участка.', autoAnswer: '380 м² согласно выписке из земельного кадастра от 10.05.2022' },
      },
      agentLabels: {
        drafter: { label: 'Черновик', summary: 'Составлено возражение по § 347 AO в связи с GrStG. Неверная площадь участка (420 м² вместо 380 м²) указана как основная причина.' },
        reviewer: { label: 'Проверка', summary: 'Ссылка на § 244 BewG и Закон о реформе 2022 года корректна. Рекомендовано подтвердить выпиской из кадастра.' },
        factchecker: { label: 'Проверка фактов', summary: 'Срок подачи возражения (1 месяц по § 355 AO) и текущие показатели ошибок в уведомлениях 2022 года проверены.' },
        adversary: { label: 'Контрпроверка', summary: 'Возможные контраргументы ведомства проанализированы. Ошибка измерения vs ошибка базы данных — ключевой вопрос.' },
        consolidator: { label: 'Консолидация', summary: 'Итоговое письмо оптимизировано. Чёткий запрос на перерасчёт и приложение выписки из кадастра сформулированы.' },
      },
    },
    tr: {
      docTypeLabel: 'Arazi vergisi tebligatı',
      fields: { authority: 'Kurum', reference: 'Referans numarası', date: 'Tebligat tarihi', property: 'Taşınmaz', amount: 'Yıllık arazi vergisi', area: 'Kayıtlı alan' },
      questions: {
        dq1: { question: 'Tebligatta gösterilen parsel alanı tapu kaydınızdan farklı mı?', background: 'Alan hataları, 2022 reformu sonrası arazi vergisi tebligatlarına itirazların en sık sebebidir.', autoAnswer: 'Evet' },
        dq2: { question: 'Tapu kaydınıza göre parselin gerçek alanı nedir?', background: '§ 244 BewG uyarınca hesaplamada parselin fiili alanı esas alınır.', autoAnswer: 'Tapu kaydına göre 380 m² (10.05.2022 tarihli)' },
      },
      agentLabels: {
        drafter: { label: 'Taslak', summary: '§ 347 AO ve GrStG kapsamında itiraz yazısı hazırlandı. Yanlış parsel alanı (420 m² yerine 380 m²) ana gerekçe olarak belirlendi.' },
        reviewer: { label: 'İnceleme', summary: '§ 244 BewG ve 2022 Arazi Vergisi Reform Kanunu\'na atıf doğru. Tapu kaydıyla belgeleme önerildi.' },
        factchecker: { label: 'Gerçek Kontrolü', summary: 'İtiraz süresi (§ 355 AO uyarınca 1 ay) ve 2022 tebligatlarındaki güncel hata oranları doğrulandı.' },
        adversary: { label: 'Karşı Kontrol', summary: 'Kurumun olası karşı argümanları analiz edildi. Ölçüm hatası ya da veri tabanı hatası ana mesele olarak belirlendi.' },
        consolidator: { label: 'Konsolidasyon', summary: 'Nihai mektup optimize edildi. Yeniden hesaplama talebi ve tapu kaydının ek olarak sunulması açıkça ifade edildi.' },
      },
    },
    uk: {
      docTypeLabel: 'Повідомлення про податок на нерухомість',
      fields: { authority: 'Відомство', reference: 'Номер справи', date: 'Дата повідомлення', property: 'Нерухомість', amount: 'Річний податок', area: 'Зареєстрована площа' },
      questions: {
        dq1: { question: 'Чи відрізняється площа ділянки, зазначена в повідомленні, від даних у виписці з поземельної книги?', background: 'Помилки в площі — найпоширеніша причина заперечень на повідомлення про податок після реформи 2022 року.', autoAnswer: 'Так' },
        dq2: { question: 'Яка фактична площа ділянки згідно з випискою з поземельної книги?', background: 'Відповідно до § 244 BewG для розрахунку використовується фактична площа ділянки.', autoAnswer: '380 м² згідно з випискою з поземельної книги від 10.05.2022' },
      },
      agentLabels: {
        drafter: { label: 'Чернетка', summary: 'Складено заперечення за § 347 AO у зв\'язку з GrStG. Неправильна площа ділянки (420 м² замість 380 м²) вказана як основна причина.' },
        reviewer: { label: 'Перевірка', summary: 'Посилання на § 244 BewG та Закон про реформу 2022 року коректне. Рекомендовано підтвердити випискою з поземельної книги.' },
        factchecker: { label: 'Перевірка фактів', summary: 'Строк подання заперечення (1 місяць за § 355 AO) та поточні показники помилок у повідомленнях 2022 року перевірені.' },
        adversary: { label: 'Контрперевірка', summary: 'Можливі контраргументи відомства проаналізовані. Помилка вимірювання vs помилка бази даних — ключове питання.' },
        consolidator: { label: 'Консолідація', summary: 'Підсумковий лист оптимізовано. Чітке прохання про перерахунок та додаток виписки з кадастру сформульовані.' },
      },
    },
    ar: {
      docTypeLabel: 'إشعار ضريبة العقارات',
      fields: { authority: 'الجهة المختصة', reference: 'رقم المرجع', date: 'تاريخ الإشعار', property: 'العقار', amount: 'الضريبة السنوية', area: 'المساحة المسجلة' },
      questions: {
        dq1: { question: 'هل تختلف مساحة القطعة المذكورة في الإشعار عن مستخرج السجل العقاري؟', background: 'تُعد أخطاء المساحة السبب الأكثر شيوعاً للاعتراض على إشعارات ضريبة العقارات بعد إصلاح 2022.', autoAnswer: 'نعم' },
        dq2: { question: 'ما المساحة الفعلية للقطعة وفق مستخرج السجل العقاري؟', background: 'وفق § 244 BewG، تُستخدم المساحة الفعلية للقطعة في الحساب.', autoAnswer: '380 م² وفق مستخرج السجل العقاري بتاريخ 10.05.2022' },
      },
      agentLabels: {
        drafter: { label: 'المسودة', summary: 'صياغة اعتراض وفق § 347 AO بالاقتران مع GrStG. تحديد المساحة الخاطئة (420 م² بدلاً من 380 م²) كسبب رئيسي.' },
        reviewer: { label: 'المراجعة', summary: 'الإشارة إلى § 244 BewG وقانون إصلاح 2022 صحيحة. يُنصح بالإثبات بمستخرج السجل العقاري.' },
        factchecker: { label: 'التحقق من الوقائع', summary: 'مهلة الاعتراض (شهر واحد وفق § 355 AO) ومعدلات الأخطاء الحالية في إشعارات 2022 تم التحقق منها.' },
        adversary: { label: 'الفحص المضاد', summary: 'تحليل الحجج المضادة المحتملة للجهة المختصة. خطأ قياس أم خطأ قاعدة بيانات — السؤال الجوهري.' },
        consolidator: { label: 'التوحيد', summary: 'الخطاب النهائي مُحسَّن. طلب إعادة الحساب وإرفاق مستخرج السجل العقاري صِيغا بوضوح.' },
      },
    },
    pt: {
      docTypeLabel: 'Aviso de imposto municipal',
      fields: { authority: 'Autoridade', reference: 'Número de referência', date: 'Data do aviso', property: 'Imóvel', amount: 'Imposto anual', area: 'Área registada' },
      questions: {
        dq1: { question: 'A área do terreno indicada no aviso difere do seu extrato do registo predial?', background: 'Os erros de área são a causa mais frequente de reclamações após a reforma de 2022.', autoAnswer: 'Sim' },
        dq2: { question: 'Qual é a área real do terreno segundo o seu extrato do registo predial?', background: 'Ao abrigo do § 244 BewG, a área real do terreno é utilizada para o cálculo.', autoAnswer: '380 m² segundo extrato do registo predial de 10.05.2022' },
      },
      agentLabels: {
        drafter: { label: 'Rascunho', summary: 'Recurso ao abrigo do § 347 AO em conjunto com GrStG redigido. Área incorreta (420 m² em vez de 380 m²) indicada como motivo principal.' },
        reviewer: { label: 'Revisão', summary: 'Referência ao § 244 BewG e à Lei de Reforma de 2022 correta. Prova por extrato do registo predial recomendada.' },
        factchecker: { label: 'Verificação de Factos', summary: 'Prazo de recurso (1 mês ao abrigo do § 355 AO) e taxas de erro atuais para avisos de 2022 verificados.' },
        adversary: { label: 'Contra-análise', summary: 'Possíveis contra-argumentos da autoridade analisados. Erro de medição vs. erro de base de dados identificado como questão central.' },
        consolidator: { label: 'Consolidação', summary: 'Carta final otimizada. Pedido claro de recálculo e anexo do extrato do registo predial formulados.' },
      },
    },
  },
  jobcenter: {
    en: {
      docTypeLabel: 'Benefit Sanction Notice',
      fields: { authority: 'Job Centre', reference: 'Benefit Community', date: 'Notice Date', sanction: 'Sanction Type', amount: 'Reduction Amount' },
      questions: {
        dq1: { question: 'Did you receive a written invitation from the job centre before the missed appointment?', background: 'A sanction under § 32 SGB II requires a proper written invitation with legal consequences notice.', autoAnswer: 'No' },
        dq2: { question: 'Was there an important reason for not attending (e.g. illness, accident)?', background: 'An important reason under § 31 SGB II excludes the sanction. Evidence such as sick notes should be enclosed.', autoAnswer: 'Yes' },
      },
      agentLabels: {
        drafter: { label: 'Draft', summary: 'Objection under § 78 SGG drafted. Missing legal consequences notice and important reason (illness) listed as arguments.' },
        reviewer: { label: 'Review', summary: 'BSG case law on missed appointments reviewed. BSG ruling B 14 AS 25/12 R cited as support for missing notice.' },
        factchecker: { label: 'Fact Check', summary: 'Current legal position on Bürgergeld sanctions under the Bürgergeld Act 2023 correctly represented.' },
        adversary: { label: 'Counter-Check', summary: 'Job centre perspective analysed. Proof of illness by medical certificate assessed as decisive.' },
        consolidator: { label: 'Consolidation', summary: 'Letter finalised. Request for suspensory effect and submission of medical certificate as attachment added.' },
      },
    },
    fr: {
      docTypeLabel: 'Décision de sanction allocations',
      fields: { authority: 'Centre pour l\'emploi', reference: 'Communauté de besoins', date: 'Date de la décision', sanction: 'Type de sanction', amount: 'Montant de la réduction' },
      questions: {
        dq1: { question: 'Avez-vous reçu une convocation écrite du centre pour l\'emploi avant le rendez-vous manqué ?', background: 'Une sanction selon § 32 SGB II exige une convocation écrite régulière avec notification des conséquences juridiques.', autoAnswer: 'Non' },
        dq2: { question: 'Y avait-il une raison importante justifiant votre absence (ex. maladie, accident) ?', background: 'Une raison importante au sens du § 31 SGB II exclut la sanction. Des justificatifs tels qu\'un arrêt maladie doivent être joints.', autoAnswer: 'Oui' },
      },
      agentLabels: {
        drafter: { label: 'Rédaction', summary: 'Recours selon § 78 SGG rédigé. Absence de notification des conséquences et raison importante (maladie) comme arguments.' },
        reviewer: { label: 'Révision', summary: 'Jurisprudence BSG sur les rendez-vous manqués vérifiée. Arrêt BSG B 14 AS 25/12 R cité comme soutien.' },
        factchecker: { label: 'Vérification', summary: 'Situation juridique actuelle sur les sanctions Bürgergeld selon la loi de 2023 correctement présentée.' },
        adversary: { label: 'Contre-vérification', summary: 'Perspective du centre pour l\'emploi analysée. Preuve de la maladie par certificat médical jugée décisive.' },
        consolidator: { label: 'Consolidation', summary: 'Lettre finalisée. Demande d\'effet suspensif et production du certificat médical en annexe ajoutés.' },
      },
    },
    es: {
      docTypeLabel: 'Resolución de sanción de prestaciones',
      fields: { authority: 'Servicio de empleo', reference: 'Unidad de convivencia', date: 'Fecha de resolución', sanction: 'Tipo de sanción', amount: 'Importe de la reducción' },
      questions: {
        dq1: { question: '¿Recibió una citación escrita del servicio de empleo antes de la cita no atendida?', background: 'Una sanción según § 32 SGB II requiere una citación escrita con la notificación de consecuencias jurídicas.', autoAnswer: 'No' },
        dq2: { question: '¿Existía algún motivo importante para no asistir (p. ej. enfermedad, accidente)?', background: 'Un motivo importante en el sentido del § 31 SGB II excluye la sanción. Se deben adjuntar pruebas como bajas médicas.', autoAnswer: 'Sí' },
      },
      agentLabels: {
        drafter: { label: 'Borrador', summary: 'Recurso según § 78 SGG redactado. Falta de notificación de consecuencias y motivo importante (enfermedad) como argumentos.' },
        reviewer: { label: 'Revisión', summary: 'Jurisprudencia BSG sobre citas no atendidas revisada. Sentencia BSG B 14 AS 25/12 R citada como apoyo.' },
        factchecker: { label: 'Verificación', summary: 'Situación jurídica actual sobre sanciones Bürgergeld según la ley de 2023 correctamente expuesta.' },
        adversary: { label: 'Contraverificación', summary: 'Perspectiva del servicio de empleo analizada. Prueba de enfermedad mediante certificado médico valorada como decisiva.' },
        consolidator: { label: 'Consolidación', summary: 'Carta finalizada. Solicitud de efecto suspensivo y presentación del certificado médico como adjunto añadidos.' },
      },
    },
    it: {
      docTypeLabel: 'Provvedimento di sanzione sussidi',
      fields: { authority: 'Centro per l\'impiego', reference: 'Nucleo familiare', date: 'Data del provvedimento', sanction: 'Tipo di sanzione', amount: 'Importo della riduzione' },
      questions: {
        dq1: { question: 'Ha ricevuto una convocazione scritta dal centro per l\'impiego prima dell\'appuntamento mancato?', background: 'Una sanzione ai sensi del § 32 SGB II richiede una convocazione scritta regolare con notifica delle conseguenze giuridiche.', autoAnswer: 'No' },
        dq2: { question: 'C\'era un motivo importante per non presentarsi (es. malattia, incidente)?', background: 'Un motivo importante ai sensi del § 31 SGB II esclude la sanzione. È necessario allegare prove come certificati medici.', autoAnswer: 'Sì' },
      },
      agentLabels: {
        drafter: { label: 'Bozza', summary: 'Ricorso ai sensi del § 78 SGG redatto. Mancata notifica delle conseguenze e motivo importante (malattia) come argomenti.' },
        reviewer: { label: 'Revisione', summary: 'Giurisprudenza BSG sugli appuntamenti mancati verificata. Sentenza BSG B 14 AS 25/12 R citata come supporto.' },
        factchecker: { label: 'Verifica fatti', summary: 'Posizione giuridica attuale sulle sanzioni Bürgergeld secondo la legge del 2023 correttamente rappresentata.' },
        adversary: { label: 'Controanalisi', summary: 'Prospettiva del centro per l\'impiego analizzata. Prova della malattia tramite certificato medico valutata come decisiva.' },
        consolidator: { label: 'Consolidamento', summary: 'Lettera finalizzata. Richiesta di effetto sospensivo e allegato del certificato medico aggiunti.' },
      },
    },
    pl: {
      docTypeLabel: 'Decyzja o sankcji zasiłkowej',
      fields: { authority: 'Urząd pracy', reference: 'Wspólnota zasiłkowa', date: 'Data decyzji', sanction: 'Rodzaj sankcji', amount: 'Kwota obniżenia' },
      questions: {
        dq1: { question: 'Czy przed niestawieniem się na spotkanie otrzymał/a Pan/Pani pisemne wezwanie z urzędu pracy?', background: 'Sankcja na podstawie § 32 SGB II wymaga prawidłowego pisemnego wezwania z pouczeniem o skutkach prawnych.', autoAnswer: 'Nie' },
        dq2: { question: 'Czy był ważny powód nieobecności (np. choroba, wypadek)?', background: 'Ważny powód w rozumieniu § 31 SGB II wyklucza sankcję. Należy dołączyć dowody, np. zwolnienie lekarskie.', autoAnswer: 'Tak' },
      },
      agentLabels: {
        drafter: { label: 'Szkic', summary: 'Odwołanie na podstawie § 78 SGG sporządzone. Brak pouczenia o skutkach prawnych i ważny powód (choroba) jako argumenty.' },
        reviewer: { label: 'Weryfikacja', summary: 'Orzecznictwo BSG w sprawie niestawiennictwa sprawdzone. Wyrok BSG B 14 AS 25/12 R powołany jako wsparcie.' },
        factchecker: { label: 'Sprawdzenie faktów', summary: 'Aktualna sytuacja prawna w zakresie sankcji Bürgergeld wg ustawy z 2023 r. poprawnie przedstawiona.' },
        adversary: { label: 'Kontranaliza', summary: 'Perspektywa urzędu pracy przeanalizowana. Dowód choroby przez zaświadczenie lekarskie oceniony jako decydujący.' },
        consolidator: { label: 'Konsolidacja', summary: 'Pismo sfinalizowane. Wniosek o zawieszenie wykonania i dołączenie zaświadczenia lekarskiego jako załącznika dodane.' },
      },
    },
    ru: {
      docTypeLabel: 'Решение о санкции в отношении пособия',
      fields: { authority: 'Центр занятости', reference: 'Сообщество получателей', date: 'Дата решения', sanction: 'Вид санкции', amount: 'Сумма сокращения' },
      questions: {
        dq1: { question: 'Получили ли вы письменное приглашение от центра занятости до пропущенного визита?', background: 'Санкция по § 32 SGB II требует надлежащего письменного приглашения с уведомлением о правовых последствиях.', autoAnswer: 'Нет' },
        dq2: { question: 'Была ли уважительная причина для неявки (например, болезнь, несчастный случай)?', background: 'Уважительная причина в смысле § 31 SGB II исключает санкцию. Необходимо приложить доказательства, например больничный лист.', autoAnswer: 'Да' },
      },
      agentLabels: {
        drafter: { label: 'Черновик', summary: 'Составлено возражение по § 78 SGG. Отсутствие уведомления о правовых последствиях и уважительная причина (болезнь) как аргументы.' },
        reviewer: { label: 'Проверка', summary: 'Судебная практика BSG по пропущенным визитам проверена. Решение BSG B 14 AS 25/12 R процитировано в поддержку.' },
        factchecker: { label: 'Проверка фактов', summary: 'Актуальное правовое положение по санкциям Bürgergeld согласно закону 2023 года представлено корректно.' },
        adversary: { label: 'Контрпроверка', summary: 'Позиция центра занятости проанализирована. Подтверждение болезни медицинской справкой оценено как решающее.' },
        consolidator: { label: 'Консолидация', summary: 'Письмо завершено. Добавлен запрос о приостановлении исполнения и приложение медицинской справки.' },
      },
    },
    tr: {
      docTypeLabel: 'Yardım kesinti kararı',
      fields: { authority: 'İş merkezi', reference: 'İhtiyaç topluluğu', date: 'Karar tarihi', sanction: 'Yaptırım türü', amount: 'Kesinti tutarı' },
      questions: {
        dq1: { question: 'Kaçırılan randevudan önce iş merkezinden yazılı davetiye aldınız mı?', background: '§ 32 SGB II kapsamındaki bir yaptırım, hukuki sonuç bildirimi içeren usulüne uygun yazılı davetiye gerektirir.', autoAnswer: 'Hayır' },
        dq2: { question: 'Gelmemeniz için önemli bir neden var mıydı (örn. hastalık, kaza)?', background: '§ 31 SGB II kapsamında önemli bir neden yaptırımı ortadan kaldırır. Hastalık raporu gibi belgeler eklenmelidir.', autoAnswer: 'Evet' },
      },
      agentLabels: {
        drafter: { label: 'Taslak', summary: '§ 78 SGG uyarınca itiraz yazısı hazırlandı. Hukuki sonuç bildirimi eksikliği ve önemli neden (hastalık) argüman olarak gösterildi.' },
        reviewer: { label: 'İnceleme', summary: 'BSG içtihadı kaçırılan randevulara ilişkin incelendi. BSG kararı B 14 AS 25/12 R destek olarak aktarıldı.' },
        factchecker: { label: 'Gerçek Kontrolü', summary: '2023 Bürgergeld Kanunu kapsamındaki yaptırımlara ilişkin güncel hukuki durum doğru biçimde aktarıldı.' },
        adversary: { label: 'Karşı Kontrol', summary: 'İş merkezi perspektifi analiz edildi. Hastalık kanıtı olarak doktor raporu belirleyici bulundu.' },
        consolidator: { label: 'Konsolidasyon', summary: 'Mektup tamamlandı. Yürütmeyi durdurma talebi ve doktor raporunun ek olarak sunulması eklendi.' },
      },
    },
    uk: {
      docTypeLabel: 'Рішення про санкцію щодо допомоги',
      fields: { authority: 'Центр зайнятості', reference: 'Спільнота отримувачів', date: 'Дата рішення', sanction: 'Вид санкції', amount: 'Сума скорочення' },
      questions: {
        dq1: { question: 'Чи отримували ви письмове запрошення від центру зайнятості до пропущеного візиту?', background: 'Санкція за § 32 SGB II вимагає належного письмового запрошення з повідомленням про правові наслідки.', autoAnswer: 'Ні' },
        dq2: { question: 'Чи була поважна причина для неявки (наприклад, хвороба, нещасний випадок)?', background: 'Поважна причина в розумінні § 31 SGB II виключає санкцію. Необхідно додати докази, наприклад лікарняний лист.', autoAnswer: 'Так' },
      },
      agentLabels: {
        drafter: { label: 'Чернетка', summary: 'Складено заперечення за § 78 SGG. Відсутність повідомлення про правові наслідки та поважна причина (хвороба) як аргументи.' },
        reviewer: { label: 'Перевірка', summary: 'Судова практика BSG щодо пропущених візитів перевірена. Рішення BSG B 14 AS 25/12 R процитовано на підтримку.' },
        factchecker: { label: 'Перевірка фактів', summary: 'Актуальний правовий стан щодо санкцій Bürgergeld згідно із законом 2023 року представлено коректно.' },
        adversary: { label: 'Контрперевірка', summary: 'Позиція центру зайнятості проаналізована. Підтвердження хвороби медичною довідкою оцінено як вирішальне.' },
        consolidator: { label: 'Консолідація', summary: 'Лист завершено. Додано запит про зупинення виконання та додаток медичної довідки.' },
      },
    },
    ar: {
      docTypeLabel: 'قرار عقوبة الإعانات',
      fields: { authority: 'مركز التوظيف', reference: 'مجتمع الاحتياج', date: 'تاريخ القرار', sanction: 'نوع العقوبة', amount: 'مبلغ التخفيض' },
      questions: {
        dq1: { question: 'هل تلقيت دعوة خطية من مركز التوظيف قبل الموعد الذي فاتك؟', background: 'تستلزم العقوبة وفق § 32 SGB II دعوة خطية منتظمة مع إخطار بالعواقب القانونية.', autoAnswer: 'لا' },
        dq2: { question: 'هل كان ثمة سبب وجيه لعدم الحضور (مثل مرض أو حادث)؟', background: 'السبب الوجيه بمفهوم § 31 SGB II يُسقط العقوبة. يجب إرفاق أدلة كالإجازة المرضية.', autoAnswer: 'نعم' },
      },
      agentLabels: {
        drafter: { label: 'المسودة', summary: 'صياغة اعتراض وفق § 78 SGG. غياب الإخطار بالعواقب القانونية وسبب وجيه (مرض) كحجج.' },
        reviewer: { label: 'المراجعة', summary: 'مراجعة اجتهادات BSG بشأن المواعيد الفائتة. الاستشهاد بحكم BSG B 14 AS 25/12 R كسند.' },
        factchecker: { label: 'التحقق من الوقائع', summary: 'تم تمثيل الوضع القانوني الراهن بشأن عقوبات Bürgergeld وفق قانون 2023 بشكل صحيح.' },
        adversary: { label: 'الفحص المضاد', summary: 'تحليل منظور مركز التوظيف. إثبات المرض بشهادة طبية قُيِّم باعتباره حاسماً.' },
        consolidator: { label: 'التوحيد', summary: 'الخطاب مكتمل. إضافة طلب الأثر الواقف وإرفاق الشهادة الطبية.' },
      },
    },
    pt: {
      docTypeLabel: 'Decisão de sanção de benefícios',
      fields: { authority: 'Centro de emprego', reference: 'Comunidade de necessidades', date: 'Data da decisão', sanction: 'Tipo de sanção', amount: 'Montante da redução' },
      questions: {
        dq1: { question: 'Recebeu uma convocação escrita do centro de emprego antes da falta à consulta?', background: 'Uma sanção ao abrigo do § 32 SGB II requer uma convocação escrita regular com notificação das consequências jurídicas.', autoAnswer: 'Não' },
        dq2: { question: 'Havia um motivo importante para não comparecer (ex. doença, acidente)?', background: 'Um motivo importante na aceção do § 31 SGB II exclui a sanção. Devem ser anexadas provas como atestados médicos.', autoAnswer: 'Sim' },
      },
      agentLabels: {
        drafter: { label: 'Rascunho', summary: 'Recurso ao abrigo do § 78 SGG redigido. Falta de notificação de consequências e motivo importante (doença) como argumentos.' },
        reviewer: { label: 'Revisão', summary: 'Jurisprudência BSG sobre faltas a consultas revista. Acórdão BSG B 14 AS 25/12 R citado como suporte.' },
        factchecker: { label: 'Verificação de Factos', summary: 'Situação jurídica atual sobre sanções Bürgergeld ao abrigo da lei de 2023 corretamente representada.' },
        adversary: { label: 'Contra-análise', summary: 'Perspetiva do centro de emprego analisada. Prova de doença por certidão médica avaliada como decisiva.' },
        consolidator: { label: 'Consolidação', summary: 'Carta finalizada. Pedido de efeito suspensivo e submissão de certidão médica como anexo adicionados.' },
      },
    },
  },
  rente: {
    en: {
      docTypeLabel: 'Pension Assessment',
      fields: { authority: 'Authority', reference: 'Insurance Number', date: 'Assessment Date', type: 'Pension Type', amount: 'Monthly Pension', missingYears: 'Missing Periods' },
      questions: {
        dq1: { question: 'Which employment periods were, to your knowledge, not recorded in your insurance history?', background: 'Gaps in the insurance record often arise from unreported employment, self-employment or periods abroad.', autoAnswer: 'Employment at Muster GmbH from 01/1995 to 12/1997, contributions provable' },
        dq2: { question: 'Do you have evidence of the missing insurance periods?', background: 'Evidence may include wage tax cards, employer certificates or bank statements showing contribution payments.', autoAnswer: 'Yes' },
      },
      agentLabels: {
        drafter: { label: 'Draft', summary: 'Objection under § 78 SGG drafted. Missing compulsory contribution periods 1995–1997 as central argument, correction of pension points requested.' },
        reviewer: { label: 'Review', summary: 'SGB VI references to §§ 55, 119 correct. Evidence rules and 4-year deadline for voluntary contributions added.' },
        factchecker: { label: 'Fact Check', summary: 'Current pension point values and reference figures 2024 (§ 68 SGB VI) checked and correctly represented.' },
        adversary: { label: 'Counter-Check', summary: 'DRV perspective: burden of proof lies with the insured person. Employer certificate assessed as strongest evidence.' },
        consolidator: { label: 'Consolidation', summary: 'Letter finalised. Clear request for re-determination of pension and enclosure of wage evidence as attachment.' },
      },
    },
    fr: {
      docTypeLabel: 'Notification de retraite',
      fields: { authority: 'Autorité', reference: 'Numéro d\'assurance', date: 'Date de notification', type: 'Type de retraite', amount: 'Retraite mensuelle', missingYears: 'Périodes manquantes' },
      questions: {
        dq1: { question: 'Quelles périodes d\'emploi n\'ont, à votre connaissance, pas été enregistrées dans votre relevé d\'assurance ?', background: 'Les lacunes dans le relevé d\'assurance sont souvent dues à des emplois non déclarés, au travail indépendant ou aux périodes à l\'étranger.', autoAnswer: 'Emploi chez Muster GmbH de 01/1995 à 12/1997, cotisations attestées' },
        dq2: { question: 'Disposez-vous de preuves pour les périodes d\'assurance manquantes ?', background: 'Les preuves peuvent inclure des feuilles d\'impôt sur les salaires, des attestations d\'employeur ou des relevés bancaires.', autoAnswer: 'Oui' },
      },
      agentLabels: {
        drafter: { label: 'Rédaction', summary: 'Recours selon § 78 SGG rédigé. Périodes de cotisation obligatoire manquantes 1995–1997 comme argument central, correction des points de retraite demandée.' },
        reviewer: { label: 'Révision', summary: 'Références SGB VI aux §§ 55, 119 correctes. Règles de preuve et délai de 4 ans pour cotisations volontaires ajoutés.' },
        factchecker: { label: 'Vérification', summary: 'Valeurs actuelles des points de retraite et paramètres 2024 (§ 68 SGB VI) vérifiés et correctement présentés.' },
        adversary: { label: 'Contre-vérification', summary: 'Perspective DRV : la charge de la preuve incombe à l\'assuré. Attestation de l\'employeur évaluée comme preuve la plus solide.' },
        consolidator: { label: 'Consolidation', summary: 'Lettre finalisée. Demande claire de rétablissement de la retraite et justificatifs de salaires en annexe.' },
      },
    },
    es: {
      docTypeLabel: 'Resolución de pensión',
      fields: { authority: 'Autoridad', reference: 'Número de seguro', date: 'Fecha de resolución', type: 'Tipo de pensión', amount: 'Pensión mensual', missingYears: 'Períodos no registrados' },
      questions: {
        dq1: { question: '¿Qué períodos de empleo no figuran, a su conocimiento, en su historial de seguro?', background: 'Las lagunas en el historial de seguro surgen a menudo por empleos no comunicados, trabajo por cuenta propia o períodos en el extranjero.', autoAnswer: 'Empleo en Muster GmbH desde 01/1995 hasta 12/1997, cotizaciones acreditables' },
        dq2: { question: '¿Dispone de documentación de los períodos de seguro no registrados?', background: 'La documentación puede incluir tarjetas de impuesto sobre la renta del trabajo, certificados del empleador o extractos bancarios.', autoAnswer: 'Sí' },
      },
      agentLabels: {
        drafter: { label: 'Borrador', summary: 'Recurso según § 78 SGG redactado. Períodos de cotización obligatoria no registrados 1995–1997 como argumento central, corrección de puntos de pensión solicitada.' },
        reviewer: { label: 'Revisión', summary: 'Referencias SGB VI a §§ 55, 119 correctas. Normas de prueba y plazo de 4 años para cotizaciones voluntarias añadidos.' },
        factchecker: { label: 'Verificación', summary: 'Valores actuales de los puntos de pensión y magnitudes de referencia 2024 (§ 68 SGB VI) comprobados y correctamente representados.' },
        adversary: { label: 'Contraverificación', summary: 'Perspectiva DRV: la carga de la prueba recae en el asegurado. El certificado del empleador valorado como prueba más sólida.' },
        consolidator: { label: 'Consolidación', summary: 'Carta finalizada. Solicitud clara de nueva liquidación de la pensión y justificantes salariales como adjunto.' },
      },
    },
    it: {
      docTypeLabel: 'Comunicazione di pensione',
      fields: { authority: 'Autorità', reference: 'Numero assicurativo', date: 'Data della comunicazione', type: 'Tipo di pensione', amount: 'Pensione mensile', missingYears: 'Periodi mancanti' },
      questions: {
        dq1: { question: 'Quali periodi lavorativi non sono stati, a sua conoscenza, registrati nel suo estratto assicurativo?', background: 'Le lacune nel registro assicurativo sorgono spesso da rapporti di lavoro non comunicati, lavoro autonomo o periodi all\'estero.', autoAnswer: 'Impiego presso Muster GmbH da 01/1995 a 12/1997, contributi dimostrabili' },
        dq2: { question: 'Dispone di prove per i periodi assicurativi mancanti?', background: 'Le prove possono includere schede fiscali dei salari, attestazioni del datore di lavoro o estratti bancari.', autoAnswer: 'Sì' },
      },
      agentLabels: {
        drafter: { label: 'Bozza', summary: 'Ricorso ai sensi del § 78 SGG redatto. Periodi contributivi obbligatori mancanti 1995–1997 come argomento centrale, correzione dei punti pensione richiesta.' },
        reviewer: { label: 'Revisione', summary: 'Riferimenti SGB VI ai §§ 55, 119 corretti. Norme di prova e termine di 4 anni per contributi volontari aggiunti.' },
        factchecker: { label: 'Verifica fatti', summary: 'Valori attuali dei punti pensione e parametri 2024 (§ 68 SGB VI) verificati e correttamente rappresentati.' },
        adversary: { label: 'Controanalisi', summary: 'Prospettiva DRV: l\'onere della prova spetta all\'assicurato. L\'attestazione del datore di lavoro valutata come prova più solida.' },
        consolidator: { label: 'Consolidamento', summary: 'Lettera finalizzata. Chiara richiesta di rideterminazione della pensione e documentazione salariale come allegato.' },
      },
    },
    pl: {
      docTypeLabel: 'Decyzja emerytalna',
      fields: { authority: 'Urząd', reference: 'Numer ubezpieczenia', date: 'Data decyzji', type: 'Rodzaj emerytury', amount: 'Miesięczna emerytura', missingYears: 'Brakujące okresy' },
      questions: {
        dq1: { question: 'Jakie okresy zatrudnienia, według Pana/Pani wiedzy, nie zostały zarejestrowane w historii ubezpieczenia?', background: 'Luki w historii ubezpieczenia często wynikają z niezgłoszonych stosunków pracy, samozatrudnienia lub okresów za granicą.', autoAnswer: 'Zatrudnienie w Muster GmbH od 01/1995 do 12/1997, opłacone składki do udowodnienia' },
        dq2: { question: 'Czy posiada Pan/Pani dowody brakujących okresów ubezpieczenia?', background: 'Dowodem mogą być karty podatkowe z wynagrodzeń, zaświadczenia pracodawcy lub wyciągi bankowe potwierdzające opłacenie składek.', autoAnswer: 'Tak' },
      },
      agentLabels: {
        drafter: { label: 'Szkic', summary: 'Odwołanie na podstawie § 78 SGG sporządzone. Brakujące okresy obowiązkowych składek 1995–1997 jako główny argument, korekta punktów emerytalnych wnioskowana.' },
        reviewer: { label: 'Weryfikacja', summary: 'Odwołania SGB VI do §§ 55, 119 prawidłowe. Zasady dowodowe i 4-letni termin na dobrowolne składki dodane.' },
        factchecker: { label: 'Sprawdzenie faktów', summary: 'Aktualne wartości punktów emerytalnych i wskaźniki 2024 (§ 68 SGB VI) sprawdzone i poprawnie przedstawione.' },
        adversary: { label: 'Kontranaliza', summary: 'Perspektywa DRV: ciężar dowodu spoczywa na ubezpieczonym. Zaświadczenie pracodawcy ocenione jako najsilniejszy dowód.' },
        consolidator: { label: 'Konsolidacja', summary: 'Pismo sfinalizowane. Jasny wniosek o ponowne ustalenie emerytury i dołączenie dowodów wynagrodzenia jako załącznika.' },
      },
    },
    ru: {
      docTypeLabel: 'Пенсионное уведомление',
      fields: { authority: 'Ведомство', reference: 'Страховой номер', date: 'Дата уведомления', type: 'Вид пенсии', amount: 'Ежемесячная пенсия', missingYears: 'Незачтённые периоды' },
      questions: {
        dq1: { question: 'Какие периоды трудовой деятельности, по вашим данным, не отражены в вашей страховой истории?', background: 'Пробелы в страховой истории часто возникают из-за незарегистрированных трудовых отношений, самозанятости или периодов за рубежом.', autoAnswer: 'Работа в Muster GmbH с 01/1995 по 12/1997, уплата взносов подтверждается' },
        dq2: { question: 'Есть ли у вас доказательства пропущенных страховых периодов?', background: 'Доказательствами могут служить налоговые карточки заработной платы, справки от работодателя или банковские выписки об уплате взносов.', autoAnswer: 'Да' },
      },
      agentLabels: {
        drafter: { label: 'Черновик', summary: 'Составлено возражение по § 78 SGG. Незачтённые обязательные страховые периоды 1995–1997 как центральный аргумент, запрошена корректировка пенсионных баллов.' },
        reviewer: { label: 'Проверка', summary: 'Ссылки SGB VI на §§ 55, 119 корректны. Добавлены правила доказывания и 4-летний срок для добровольных взносов.' },
        factchecker: { label: 'Проверка фактов', summary: 'Текущие значения пенсионных баллов и контрольные цифры 2024 года (§ 68 SGB VI) проверены и представлены корректно.' },
        adversary: { label: 'Контрпроверка', summary: 'Позиция DRV: бремя доказывания лежит на застрахованном. Справка работодателя оценена как наиболее весомое доказательство.' },
        consolidator: { label: 'Консолидация', summary: 'Письмо завершено. Чёткий запрос о перерасчёте пенсии и приложение подтверждений заработка.' },
      },
    },
    tr: {
      docTypeLabel: 'Emeklilik kararı',
      fields: { authority: 'Kurum', reference: 'Sigorta numarası', date: 'Karar tarihi', type: 'Emeklilik türü', amount: 'Aylık emeklilik', missingYears: 'Eksik dönemler' },
      questions: {
        dq1: { question: 'Sigorta geçmişinizde kayıtlı olmadığını düşündüğünüz çalışma dönemleri hangileridir?', background: 'Sigorta geçmişindeki boşluklar genellikle bildirilmemiş iş ilişkilerinden, serbest çalışmadan veya yurt dışı dönemlerinden kaynaklanır.', autoAnswer: 'Muster GmbH\'de 01/1995-12/1997 arası çalışma, prim ödemeleri belgelenebilir' },
        dq2: { question: 'Eksik sigorta dönemleri için elinizde belge var mı?', background: 'Belgeler; ücret vergi kartları, işveren belgeleri veya prim ödemelerini gösteren banka dökümleri olabilir.', autoAnswer: 'Evet' },
      },
      agentLabels: {
        drafter: { label: 'Taslak', summary: '§ 78 SGG uyarınca itiraz yazısı hazırlandı. 1995–1997 arası eksik zorunlu prim dönemleri merkezi argüman, emeklilik puanı düzeltmesi talep edildi.' },
        reviewer: { label: 'İnceleme', summary: 'SGB VI §§ 55, 119 atıfları doğru. İspat kuralları ve gönüllü katkılar için 4 yıllık süre eklendi.' },
        factchecker: { label: 'Gerçek Kontrolü', summary: 'Güncel emeklilik puanı değerleri ve 2024 referans rakamları (§ 68 SGB VI) doğrulandı.' },
        adversary: { label: 'Karşı Kontrol', summary: 'DRV perspektifi: ispat yükü sigortalıya aittir. İşveren belgesi en güçlü kanıt olarak değerlendirildi.' },
        consolidator: { label: 'Konsolidasyon', summary: 'Mektup tamamlandı. Emekliliğin yeniden belirlenmesi talebi ve ücret belgelerinin ek olarak sunulması netleştirildi.' },
      },
    },
    uk: {
      docTypeLabel: 'Пенсійне повідомлення',
      fields: { authority: 'Відомство', reference: 'Страховий номер', date: 'Дата повідомлення', type: 'Вид пенсії', amount: 'Щомісячна пенсія', missingYears: 'Незараховані періоди' },
      questions: {
        dq1: { question: 'Які періоди трудової діяльності, на вашу думку, не відображені у вашій страховій історії?', background: 'Прогалини у страховій історії часто виникають через незареєстровані трудові відносини, самозайнятість або перебування за кордоном.', autoAnswer: 'Робота в Muster GmbH з 01/1995 по 12/1997, сплата внесків підтверджується' },
        dq2: { question: 'Чи є у вас докази незарахованих страхових періодів?', background: 'Доказами можуть бути податкові картки заробітної плати, довідки від роботодавця або банківські виписки про сплату внесків.', autoAnswer: 'Так' },
      },
      agentLabels: {
        drafter: { label: 'Чернетка', summary: 'Складено заперечення за § 78 SGG. Незараховані обов\'язкові страхові періоди 1995–1997 як центральний аргумент, запитано корекцію пенсійних балів.' },
        reviewer: { label: 'Перевірка', summary: 'Посилання SGB VI на §§ 55, 119 коректні. Додано правила доказування та 4-річний строк для добровільних внесків.' },
        factchecker: { label: 'Перевірка фактів', summary: 'Актуальні значення пенсійних балів та контрольні показники 2024 року (§ 68 SGB VI) перевірені й представлені коректно.' },
        adversary: { label: 'Контрперевірка', summary: 'Позиція DRV: тягар доказування лежить на застрахованому. Довідка роботодавця оцінена як найвагоміший доказ.' },
        consolidator: { label: 'Консолідація', summary: 'Лист завершено. Чітке прохання про перерахунок пенсії та додаток підтверджень заробітку.' },
      },
    },
    ar: {
      docTypeLabel: 'إشعار المعاش التقاعدي',
      fields: { authority: 'الجهة المختصة', reference: 'رقم التأمين', date: 'تاريخ الإشعار', type: 'نوع المعاش', amount: 'المعاش الشهري', missingYears: 'الفترات المفقودة' },
      questions: {
        dq1: { question: 'ما فترات العمل التي لم تُسجَّل، في علمك، في سجل التأمين؟', background: 'تنشأ الثغرات في سجل التأمين في الغالب عن علاقات عمل غير مبلَّغ عنها أو عمل حر أو فترات في الخارج.', autoAnswer: 'عمل في Muster GmbH من 01/1995 إلى 12/1997، يمكن إثبات دفع الاشتراكات' },
        dq2: { question: 'هل لديك أدلة على فترات التأمين المفقودة؟', background: 'قد تشمل الأدلة بطاقات ضريبة الأجور أو شهادات صاحب العمل أو كشوف الحساب البنكية.', autoAnswer: 'نعم' },
      },
      agentLabels: {
        drafter: { label: 'المسودة', summary: 'صياغة اعتراض وفق § 78 SGG. فترات الاشتراك الإلزامية المفقودة 1995–1997 كحجة مركزية، طلب تصحيح نقاط المعاش.' },
        reviewer: { label: 'المراجعة', summary: 'مراجعة مراجع SGB VI للمادتين §§ 55, 119 صحيحة. إضافة قواعد الإثبات وأجل 4 سنوات للاشتراكات الطوعية.' },
        factchecker: { label: 'التحقق من الوقائع', summary: 'التحقق من قيم نقاط المعاش الحالية والأرقام المرجعية لعام 2024 (§ 68 SGB VI) وتمثيلها بشكل صحيح.' },
        adversary: { label: 'الفحص المضاد', summary: 'منظور DRV: عبء الإثبات يقع على المؤمَّن عليه. تقييم شهادة صاحب العمل باعتبارها الدليل الأقوى.' },
        consolidator: { label: 'التوحيد', summary: 'الخطاب مكتمل. طلب واضح لإعادة تحديد المعاش وإرفاق أدلة الأجور.' },
      },
    },
    pt: {
      docTypeLabel: 'Notificação de pensão',
      fields: { authority: 'Autoridade', reference: 'Número de seguro', date: 'Data da notificação', type: 'Tipo de pensão', amount: 'Pensão mensal', missingYears: 'Períodos em falta' },
      questions: {
        dq1: { question: 'Que períodos de emprego não foram, do seu conhecimento, registados no seu historial de seguro?', background: 'As lacunas no registo de seguro surgem frequentemente de relações laborais não comunicadas, trabalho independente ou períodos no estrangeiro.', autoAnswer: 'Emprego na Muster GmbH de 01/1995 a 12/1997, contribuições comprováveis' },
        dq2: { question: 'Tem comprovativos dos períodos de seguro em falta?', background: 'Os comprovativos podem incluir cartões de imposto sobre o rendimento do trabalho, declarações do empregador ou extratos bancários.', autoAnswer: 'Sim' },
      },
      agentLabels: {
        drafter: { label: 'Rascunho', summary: 'Recurso ao abrigo do § 78 SGG redigido. Períodos de contribuição obrigatória em falta 1995–1997 como argumento central, correção de pontos de pensão solicitada.' },
        reviewer: { label: 'Revisão', summary: 'Referências SGB VI aos §§ 55, 119 corretas. Regras de prova e prazo de 4 anos para contribuições voluntárias adicionados.' },
        factchecker: { label: 'Verificação de Factos', summary: 'Valores atuais dos pontos de pensão e valores de referência 2024 (§ 68 SGB VI) verificados e corretamente representados.' },
        adversary: { label: 'Contra-análise', summary: 'Perspetiva DRV: o ónus da prova recai sobre o segurado. Declaração do empregador avaliada como prova mais sólida.' },
        consolidator: { label: 'Consolidação', summary: 'Carta finalizada. Pedido claro de reavaliação da pensão e comprovativos de salários como anexo.' },
      },
    },
  },
  krankenversicherung: {
    en: {
      docTypeLabel: 'Health Insurance Rejection',
      fields: { authority: 'Health Insurance Fund', reference: 'Insurance Number', date: 'Notice Date', service: 'Rejected Service', reason: 'Reason for Rejection' },
      questions: {
        dq1: { question: 'Do you have a medical prescription for the physiotherapy?', background: 'A medical prescription is a basic requirement for the entitlement to benefits under § 32 SGB V.', autoAnswer: 'Yes' },
        dq2: { question: 'What is the diagnosed condition justifying the physiotherapy?', background: 'Medical necessity must be supported by a diagnosis. MDK assessments can be challenged.', autoAnswer: 'Chronic low back pain (ICD M54.5) with functional impairment, medically diagnosed since 2021' },
      },
      agentLabels: {
        drafter: { label: 'Draft', summary: 'Objection under § 78 SGG drafted. Erroneous MDK assessment and proven medical necessity as main arguments.' },
        reviewer: { label: 'Review', summary: '§ 13 Abs. 3a SGB V (deemed approval) and § 12 SGB V (economic efficiency principle) correctly incorporated.' },
        factchecker: { label: 'Fact Check', summary: 'BSG case law on entitlement to physiotherapy and deemed approval after deadline exceeded verified.' },
        adversary: { label: 'Counter-Check', summary: 'Health insurer perspective: MDK assessment has evidential value. Counter-assessment or detailed medical report recommended as counter-evidence.' },
        consolidator: { label: 'Consolidation', summary: 'Request for deemed approval (§ 13 SGB V) and access to the full MDK assessment added.' },
      },
    },
    fr: {
      docTypeLabel: 'Refus assurance maladie',
      fields: { authority: 'Caisse maladie', reference: 'Numéro d\'assurance', date: 'Date de la décision', service: 'Prestation refusée', reason: 'Motif du refus' },
      questions: {
        dq1: { question: 'Disposez-vous d\'une prescription médicale pour la physiothérapie ?', background: 'Une prescription médicale est une condition de base pour le droit aux prestations selon § 32 SGB V.', autoAnswer: 'Oui' },
        dq2: { question: 'Quelle est la maladie diagnostiquée justifiant la physiothérapie ?', background: 'La nécessité médicale doit être étayée par un diagnostic. Les expertises MDK peuvent être contestées.', autoAnswer: 'Lombalgie chronique (ICD M54.5) avec limitation fonctionnelle, diagnostiquée médicalement depuis 2021' },
      },
      agentLabels: {
        drafter: { label: 'Rédaction', summary: 'Recours selon § 78 SGG rédigé. Expertise MDK erronée et nécessité médicale prouvée comme arguments principaux.' },
        reviewer: { label: 'Révision', summary: '§ 13 Abs. 3a SGB V (fiction d\'approbation) et § 12 SGB V (principe d\'économie) correctement intégrés.' },
        factchecker: { label: 'Vérification', summary: 'Jurisprudence BSG sur le droit à la physiothérapie et fiction d\'approbation après dépassement de délai vérifiée.' },
        adversary: { label: 'Contre-vérification', summary: 'Perspective de la caisse: l\'expertise MDK a valeur probante. Contre-expertise ou rapport médical détaillé recommandé.' },
        consolidator: { label: 'Consolidation', summary: 'Demande de fiction d\'approbation (§ 13 SGB V) et accès à l\'intégralité de l\'expertise MDK ajoutés.' },
      },
    },
    es: {
      docTypeLabel: 'Denegación seguro médico',
      fields: { authority: 'Caja de salud', reference: 'Número de seguro', date: 'Fecha de la resolución', service: 'Prestación denegada', reason: 'Motivo de denegación' },
      questions: {
        dq1: { question: '¿Dispone de una prescripción médica para la fisioterapia?', background: 'Una prescripción médica es requisito básico para el derecho a prestaciones según § 32 SGB V.', autoAnswer: 'Sí' },
        dq2: { question: '¿Cuál es el diagnóstico que justifica la fisioterapia?', background: 'La necesidad médica debe estar respaldada por un diagnóstico. Los informes MDK pueden ser impugnados.', autoAnswer: 'Lumbalgia crónica (ICD M54.5) con deterioro funcional, diagnosticada médicamente desde 2021' },
      },
      agentLabels: {
        drafter: { label: 'Borrador', summary: 'Recurso según § 78 SGG redactado. Informe MDK erróneo y necesidad médica acreditada como argumentos principales.' },
        reviewer: { label: 'Revisión', summary: '§ 13 Abs. 3a SGB V (aprobación presunta) y § 12 SGB V (principio de eficiencia económica) correctamente incorporados.' },
        factchecker: { label: 'Verificación', summary: 'Jurisprudencia BSG sobre derecho a fisioterapia y aprobación presunta tras vencimiento del plazo verificada.' },
        adversary: { label: 'Contraverificación', summary: 'Perspectiva de la caja de salud: el informe MDK tiene valor probatorio. Se recomienda contraperitaje o informe médico detallado.' },
        consolidator: { label: 'Consolidación', summary: 'Solicitud de aprobación presunta (§ 13 SGB V) y acceso al informe MDK completo añadidos.' },
      },
    },
    it: {
      docTypeLabel: 'Rigetto assicurazione sanitaria',
      fields: { authority: 'Cassa malattia', reference: 'Numero assicurativo', date: 'Data del provvedimento', service: 'Prestazione rifiutata', reason: 'Motivo del rifiuto' },
      questions: {
        dq1: { question: 'Dispone di una prescrizione medica per la fisioterapia?', background: 'Una prescrizione medica è requisito fondamentale per il diritto alle prestazioni ai sensi del § 32 SGB V.', autoAnswer: 'Sì' },
        dq2: { question: 'Qual è la diagnosi che giustifica la fisioterapia?', background: 'La necessità medica deve essere supportata da una diagnosi. Le perizie MDK possono essere contestate.', autoAnswer: 'Lombalgia cronica (ICD M54.5) con compromissione funzionale, diagnosticata medicalmente dal 2021' },
      },
      agentLabels: {
        drafter: { label: 'Bozza', summary: 'Ricorso ai sensi del § 78 SGG redatto. Perizia MDK errata e necessità medica dimostrata come argomenti principali.' },
        reviewer: { label: 'Revisione', summary: '§ 13 Abs. 3a SGB V (approvazione fittizia) e § 12 SGB V (principio di economicità) correttamente integrati.' },
        factchecker: { label: 'Verifica fatti', summary: 'Giurisprudenza BSG sul diritto alla fisioterapia e approvazione fittizia dopo il superamento del termine verificata.' },
        adversary: { label: 'Controanalisi', summary: 'Prospettiva della cassa malattia: la perizia MDK ha valore probatorio. Controperizia o referto medico dettagliato raccomandati.' },
        consolidator: { label: 'Consolidamento', summary: 'Richiesta di approvazione fittizia (§ 13 SGB V) e accesso alla perizia MDK completa aggiunti.' },
      },
    },
    pl: {
      docTypeLabel: 'Odmowa ubezpieczenia zdrowotnego',
      fields: { authority: 'Kasa chorych', reference: 'Numer ubezpieczenia', date: 'Data decyzji', service: 'Odrzucone świadczenie', reason: 'Powód odmowy' },
      questions: {
        dq1: { question: 'Czy posiada Pan/Pani receptę lekarską na fizjoterapię?', background: 'Recepta lekarska jest podstawowym warunkiem prawa do świadczeń zgodnie z § 32 SGB V.', autoAnswer: 'Tak' },
        dq2: { question: 'Jaka jest zdiagnozowana choroba uzasadniająca fizjoterapię?', background: 'Konieczność medyczna musi być poparta diagnozą. Opinie MDK można zakwestionować.', autoAnswer: 'Przewlekły ból lędźwiowy (ICD M54.5) z upośledzeniem funkcji, zdiagnozowany medycznie od 2021' },
      },
      agentLabels: {
        drafter: { label: 'Szkic', summary: 'Odwołanie na podstawie § 78 SGG sporządzone. Błędna opinia MDK i udowodniona konieczność medyczna jako główne argumenty.' },
        reviewer: { label: 'Weryfikacja', summary: '§ 13 Abs. 3a SGB V (fikcja zatwierdzenia) i § 12 SGB V (zasada oszczędności) poprawnie uwzględnione.' },
        factchecker: { label: 'Sprawdzenie faktów', summary: 'Orzecznictwo BSG w zakresie prawa do fizjoterapii i fikcji zatwierdzenia po przekroczeniu terminu zweryfikowane.' },
        adversary: { label: 'Kontranaliza', summary: 'Perspektywa kasy chorych: opinia MDK ma wartość dowodową. Zalecana kontrekspertyza lub szczegółowy raport lekarski.' },
        consolidator: { label: 'Konsolidacja', summary: 'Wniosek o fikcję zatwierdzenia (§ 13 SGB V) i dostęp do pełnej opinii MDK dodane.' },
      },
    },
    ru: {
      docTypeLabel: 'Отказ в медицинском страховании',
      fields: { authority: 'Больничная касса', reference: 'Страховой номер', date: 'Дата решения', service: 'Отклонённая услуга', reason: 'Причина отказа' },
      questions: {
        dq1: { question: 'Есть ли у вас медицинское направление на физиотерапию?', background: 'Медицинское направление является основным условием права на получение услуг по § 32 SGB V.', autoAnswer: 'Да' },
        dq2: { question: 'Каков диагноз, обосновывающий необходимость физиотерапии?', background: 'Медицинская необходимость должна быть подтверждена диагнозом. Заключения MDK можно оспорить.', autoAnswer: 'Хроническая боль в пояснице (ICD M54.5) с функциональным нарушением, диагностирована с 2021 года' },
      },
      agentLabels: {
        drafter: { label: 'Черновик', summary: 'Составлено возражение по § 78 SGG. Ошибочное заключение MDK и подтверждённая медицинская необходимость как основные аргументы.' },
        reviewer: { label: 'Проверка', summary: '§ 13 Abs. 3a SGB V (считается одобренным) и § 12 SGB V (принцип экономичности) корректно учтены.' },
        factchecker: { label: 'Проверка фактов', summary: 'Судебная практика BSG о праве на физиотерапию и автоматическом одобрении после истечения срока проверена.' },
        adversary: { label: 'Контрпроверка', summary: 'Позиция страховой кассы: заключение MDK имеет доказательную силу. Рекомендовано встречное заключение или подробный медицинский отчёт.' },
        consolidator: { label: 'Консолидация', summary: 'Добавлен запрос о признании одобренным (§ 13 SGB V) и доступе к полному заключению MDK.' },
      },
    },
    tr: {
      docTypeLabel: 'Sağlık sigortası reddi',
      fields: { authority: 'Sağlık sigortası fonu', reference: 'Sigorta numarası', date: 'Karar tarihi', service: 'Reddedilen hizmet', reason: 'Ret gerekçesi' },
      questions: {
        dq1: { question: 'Fizyoterapi için doktor reçeteniz var mı?', background: '§ 32 SGB V kapsamında hizmet hakkı için doktor reçetesi temel koşuldur.', autoAnswer: 'Evet' },
        dq2: { question: 'Fizyoterapiyi gerektiren teşhis nedir?', background: 'Tıbbi zorunluluk bir teşhisle desteklenmelidir. MDK raporlarına itiraz edilebilir.', autoAnswer: 'Fonksiyonel bozukluğu olan kronik bel ağrısı (ICD M54.5), 2021\'den beri tıbbi teşhis' },
      },
      agentLabels: {
        drafter: { label: 'Taslak', summary: '§ 78 SGG uyarınca itiraz yazısı hazırlandı. Hatalı MDK raporu ve kanıtlanmış tıbbi zorunluluk ana argümanlar.' },
        reviewer: { label: 'İnceleme', summary: '§ 13 Abs. 3a SGB V (zımni onay) ve § 12 SGB V (ekonomik etkinlik ilkesi) doğru dahil edildi.' },
        factchecker: { label: 'Gerçek Kontrolü', summary: 'Fizyoterapi hakkı ve süre aşımı sonrası zımni onaya ilişkin BSG içtihadı doğrulandı.' },
        adversary: { label: 'Karşı Kontrol', summary: 'Sigorta kasa perspektifi: MDK raporunun delil değeri var. Karşı rapor veya ayrıntılı doktor raporu önerildi.' },
        consolidator: { label: 'Konsolidasyon', summary: 'Zımni onay talebi (§ 13 SGB V) ve tam MDK raporuna erişim eklendi.' },
      },
    },
    uk: {
      docTypeLabel: 'Відмова в медичному страхуванні',
      fields: { authority: 'Лікарняна каса', reference: 'Страховий номер', date: 'Дата рішення', service: 'Відхилена послуга', reason: 'Причина відмови' },
      questions: {
        dq1: { question: 'Чи є у вас лікарське направлення на фізіотерапію?', background: 'Лікарське направлення є основною умовою права на послуги за § 32 SGB V.', autoAnswer: 'Так' },
        dq2: { question: 'Який діагноз обґрунтовує необхідність фізіотерапії?', background: 'Медична необхідність має бути підкріплена діагнозом. Висновки MDK можна оскаржити.', autoAnswer: 'Хронічний біль у попереку (ICD M54.5) з функціональним порушенням, діагностовано з 2021 року' },
      },
      agentLabels: {
        drafter: { label: 'Чернетка', summary: 'Складено заперечення за § 78 SGG. Помилковий висновок MDK та підтверджена медична необхідність як основні аргументи.' },
        reviewer: { label: 'Перевірка', summary: '§ 13 Abs. 3a SGB V (вважається схваленим) та § 12 SGB V (принцип економності) коректно враховані.' },
        factchecker: { label: 'Перевірка фактів', summary: 'Судова практика BSG щодо права на фізіотерапію та автоматичного схвалення після спливу строку перевірена.' },
        adversary: { label: 'Контрперевірка', summary: 'Позиція страхової каси: висновок MDK має доказову силу. Рекомендовано зустрічний висновок або детальний медичний звіт.' },
        consolidator: { label: 'Консолідація', summary: 'Додано запит про визнання схваленим (§ 13 SGB V) та доступ до повного висновку MDK.' },
      },
    },
    ar: {
      docTypeLabel: 'رفض التأمين الصحي',
      fields: { authority: 'صندوق التأمين الصحي', reference: 'رقم التأمين', date: 'تاريخ القرار', service: 'الخدمة المرفوضة', reason: 'سبب الرفض' },
      questions: {
        dq1: { question: 'هل لديك وصفة طبية للعلاج الطبيعي؟', background: 'الوصفة الطبية شرط أساسي للاستحقاق في الخدمات وفق § 32 SGB V.', autoAnswer: 'نعم' },
        dq2: { question: 'ما هو التشخيص الذي يبرر العلاج الطبيعي؟', background: 'يجب أن تُدعَم الضرورة الطبية بتشخيص. يمكن الطعن في تقارير MDK.', autoAnswer: 'آلام أسفل الظهر المزمنة (ICD M54.5) مع ضعف وظيفي، تشخيص طبي منذ 2021' },
      },
      agentLabels: {
        drafter: { label: 'المسودة', summary: 'صياغة اعتراض وفق § 78 SGG. تقرير MDK الخاطئ والضرورة الطبية الثابتة كحجج رئيسية.' },
        reviewer: { label: 'المراجعة', summary: 'إدراج § 13 Abs. 3a SGB V (الموافقة الضمنية) و§ 12 SGB V (مبدأ الكفاءة الاقتصادية) بشكل صحيح.' },
        factchecker: { label: 'التحقق من الوقائع', summary: 'التحقق من اجتهادات BSG بشأن الحق في العلاج الطبيعي والموافقة الضمنية بعد انقضاء الأجل.' },
        adversary: { label: 'الفحص المضاد', summary: 'منظور صندوق التأمين: تقرير MDK له قيمة إثباتية. يُنصح بتقرير مضاد أو تقرير طبي مفصل.' },
        consolidator: { label: 'التوحيد', summary: 'إضافة طلب الموافقة الضمنية (§ 13 SGB V) والاطلاع على تقرير MDK الكامل.' },
      },
    },
    pt: {
      docTypeLabel: 'Recusa do seguro de saúde',
      fields: { authority: 'Seguradora de saúde', reference: 'Número de seguro', date: 'Data da decisão', service: 'Serviço recusado', reason: 'Motivo da recusa' },
      questions: {
        dq1: { question: 'Tem uma prescrição médica para a fisioterapia?', background: 'Uma prescrição médica é condição básica para o direito a prestações ao abrigo do § 32 SGB V.', autoAnswer: 'Sim' },
        dq2: { question: 'Qual é o diagnóstico que justifica a fisioterapia?', background: 'A necessidade médica deve ser suportada por um diagnóstico. Os pareceres MDK podem ser contestados.', autoAnswer: 'Lombalgia crónica (ICD M54.5) com limitação funcional, diagnosticada medicamente desde 2021' },
      },
      agentLabels: {
        drafter: { label: 'Rascunho', summary: 'Recurso ao abrigo do § 78 SGG redigido. Parecer MDK erróneo e necessidade médica comprovada como argumentos principais.' },
        reviewer: { label: 'Revisão', summary: '§ 13 Abs. 3a SGB V (aprovação tácita) e § 12 SGB V (princípio da eficiência económica) corretamente incorporados.' },
        factchecker: { label: 'Verificação de Factos', summary: 'Jurisprudência BSG sobre direito à fisioterapia e aprovação tácita após prazo excedido verificada.' },
        adversary: { label: 'Contra-análise', summary: 'Perspetiva da seguradora: o parecer MDK tem valor probatório. Contra-parecer ou relatório médico detalhado recomendados.' },
        consolidator: { label: 'Consolidação', summary: 'Pedido de aprovação tácita (§ 13 SGB V) e acesso ao parecer MDK completo adicionados.' },
      },
    },
  },
  kuendigung: {
    en: {
      docTypeLabel: 'Dismissal Notice',
      fields: { employer: 'Employer', date: 'Dismissal Date', type: 'Dismissal Type', notice: 'Notice Period', tenure: 'Length of Service' },
      questions: {
        dq1: { question: 'Is there a works council in your company?', background: 'Without consultation of the works council under § 102 BetrVG, a dismissal is invalid — regardless of the reason.', autoAnswer: 'Yes' },
        dq2: { question: 'Were you informed about the works council consultation?', background: 'Under § 102 Abs. 1 BetrVG, the works council must be consulted before every dismissal. A dismissal without consultation is null and void.', autoAnswer: 'No' },
      },
      agentLabels: {
        drafter: { label: 'Draft', summary: 'Unfair dismissal claim under § 4 KSchG prepared. Missing works council consultation (§ 102 BetrVG) identified as strongest ground for invalidity.' },
        reviewer: { label: 'Review', summary: 'Three-week deadline (§ 4 KSchG) correctly mentioned. Social justification (§ 1 KSchG) and continued employment application added.' },
        factchecker: { label: 'Fact Check', summary: 'BAG case law on § 102 BetrVG correct. Dismissal without consultation is absolutely invalid per BAG ruling 2 AZR 296/13.' },
        adversary: { label: 'Counter-Check', summary: 'Employer perspective: works council documentation may exist. Proof of consultation vs. lack thereof as key issue.' },
        consolidator: { label: 'Consolidation', summary: 'Letter to the labour court finalised. Important note on 3-week deadline prominently placed.' },
      },
    },
    fr: {
      docTypeLabel: 'Lettre de licenciement',
      fields: { employer: 'Employeur', date: 'Date de licenciement', type: 'Type de licenciement', notice: 'Délai de préavis', tenure: 'Ancienneté' },
      questions: {
        dq1: { question: 'Y a-t-il un comité d\'entreprise dans votre société ?', background: 'Sans consultation du comité d\'entreprise selon § 102 BetrVG, un licenciement est invalide, quelle qu\'en soit la raison.', autoAnswer: 'Oui' },
        dq2: { question: 'Avez-vous été informé(e) de la consultation du comité d\'entreprise ?', background: 'Selon § 102 Abs. 1 BetrVG, le comité d\'entreprise doit être consulté avant tout licenciement. Un licenciement sans consultation est nul.', autoAnswer: 'Non' },
      },
      agentLabels: {
        drafter: { label: 'Rédaction', summary: 'Recours pour licenciement abusif selon § 4 KSchG préparé. Absence de consultation du comité d\'entreprise (§ 102 BetrVG) identifiée comme motif d\'invalidité le plus fort.' },
        reviewer: { label: 'Révision', summary: 'Délai de trois semaines (§ 4 KSchG) correctement mentionné. Justification sociale (§ 1 KSchG) et demande de maintien dans l\'emploi ajoutés.' },
        factchecker: { label: 'Vérification', summary: 'Jurisprudence BAG sur § 102 BetrVG correcte. Licenciement sans consultation absolument invalide selon BAG arrêt 2 AZR 296/13.' },
        adversary: { label: 'Contre-vérification', summary: 'Perspective employeur : documentation du comité pourrait exister. Preuve de la consultation vs absence comme question centrale.' },
        consolidator: { label: 'Consolidation', summary: 'Lettre au tribunal du travail finalisée. Note importante sur le délai de 3 semaines mise en évidence.' },
      },
    },
    es: {
      docTypeLabel: 'Carta de despido',
      fields: { employer: 'Empleador', date: 'Fecha de despido', type: 'Tipo de despido', notice: 'Período de preaviso', tenure: 'Antigüedad' },
      questions: {
        dq1: { question: '¿Existe un comité de empresa en su centro de trabajo?', background: 'Sin consulta al comité de empresa según § 102 BetrVG, el despido es inválido, independientemente del motivo.', autoAnswer: 'Sí' },
        dq2: { question: '¿Le informaron sobre la consulta al comité de empresa?', background: 'Según § 102 Abs. 1 BetrVG, el comité de empresa debe ser consultado antes de cualquier despido. Un despido sin consulta es nulo.', autoAnswer: 'No' },
      },
      agentLabels: {
        drafter: { label: 'Borrador', summary: 'Demanda de despido improcedente según § 4 KSchG preparada. Falta de consulta al comité de empresa (§ 102 BetrVG) identificada como motivo más fuerte de nulidad.' },
        reviewer: { label: 'Revisión', summary: 'Plazo de tres semanas (§ 4 KSchG) correctamente mencionado. Justificación social (§ 1 KSchG) y solicitud de reincorporación añadidos.' },
        factchecker: { label: 'Verificación', summary: 'Jurisprudencia BAG sobre § 102 BetrVG correcta. Despido sin consulta absolutamente nulo según sentencia BAG 2 AZR 296/13.' },
        adversary: { label: 'Contraverificación', summary: 'Perspectiva del empleador: podría existir documentación del comité. Prueba de la consulta vs. ausencia como cuestión clave.' },
        consolidator: { label: 'Consolidación', summary: 'Carta al juzgado laboral finalizada. Nota importante sobre el plazo de 3 semanas colocada de forma prominente.' },
      },
    },
    it: {
      docTypeLabel: 'Lettera di licenziamento',
      fields: { employer: 'Datore di lavoro', date: 'Data del licenziamento', type: 'Tipo di licenziamento', notice: 'Periodo di preavviso', tenure: 'Anzianità di servizio' },
      questions: {
        dq1: { question: 'Esiste un consiglio di fabbrica nella sua azienda?', background: 'Senza consultazione del consiglio di fabbrica ai sensi del § 102 BetrVG, un licenziamento è invalido, indipendentemente dal motivo.', autoAnswer: 'Sì' },
        dq2: { question: 'È stato/a informato/a della consultazione del consiglio di fabbrica?', background: 'Ai sensi del § 102 Abs. 1 BetrVG, il consiglio di fabbrica deve essere consultato prima di ogni licenziamento. Un licenziamento senza consultazione è nullo.', autoAnswer: 'No' },
      },
      agentLabels: {
        drafter: { label: 'Bozza', summary: 'Ricorso per licenziamento ingiustificato ai sensi del § 4 KSchG preparato. Mancata consultazione del consiglio di fabbrica (§ 102 BetrVG) identificata come motivo più forte di invalidità.' },
        reviewer: { label: 'Revisione', summary: 'Termine di tre settimane (§ 4 KSchG) correttamente menzionato. Giustificazione sociale (§ 1 KSchG) e richiesta di reintegrazione aggiunti.' },
        factchecker: { label: 'Verifica fatti', summary: 'Giurisprudenza BAG su § 102 BetrVG corretta. Licenziamento senza consultazione assolutamente invalido secondo sentenza BAG 2 AZR 296/13.' },
        adversary: { label: 'Controanalisi', summary: 'Prospettiva datore di lavoro: documentazione del consiglio potrebbe esistere. Prova della consultazione vs. assenza come questione chiave.' },
        consolidator: { label: 'Consolidamento', summary: 'Lettera al tribunale del lavoro finalizzata. Nota importante sul termine di 3 settimane posta in evidenza.' },
      },
    },
    pl: {
      docTypeLabel: 'Wypowiedzenie umowy o pracę',
      fields: { employer: 'Pracodawca', date: 'Data wypowiedzenia', type: 'Rodzaj wypowiedzenia', notice: 'Okres wypowiedzenia', tenure: 'Staż pracy' },
      questions: {
        dq1: { question: 'Czy w Pana/Pani zakładzie pracy istnieje rada zakładowa?', background: 'Bez konsultacji z radą zakładową na podstawie § 102 BetrVG wypowiedzenie jest nieważne niezależnie od przyczyny.', autoAnswer: 'Tak' },
        dq2: { question: 'Czy poinformowano Pana/Panią o konsultacji z radą zakładową?', background: 'Zgodnie z § 102 Abs. 1 BetrVG rada zakładowa musi być konsultowana przed każdym wypowiedzeniem. Wypowiedzenie bez konsultacji jest nieważne.', autoAnswer: 'Nie' },
      },
      agentLabels: {
        drafter: { label: 'Szkic', summary: 'Powództwo o ochronę przed zwolnieniem na podstawie § 4 KSchG przygotowane. Brak konsultacji z radą zakładową (§ 102 BetrVG) jako najsilniejsza podstawa nieważności.' },
        reviewer: { label: 'Weryfikacja', summary: 'Trzymiesięczny termin (§ 4 KSchG) prawidłowo wspomniany. Uzasadnienie społeczne (§ 1 KSchG) i wniosek o dalsze zatrudnienie dodane.' },
        factchecker: { label: 'Sprawdzenie faktów', summary: 'Orzecznictwo BAG dot. § 102 BetrVG prawidłowe. Wypowiedzenie bez konsultacji bezwzględnie nieważne wg wyroku BAG 2 AZR 296/13.' },
        adversary: { label: 'Kontranaliza', summary: 'Perspektywa pracodawcy: dokumentacja rady zakładowej może istnieć. Dowód konsultacji vs jej brak jako kluczowa kwestia.' },
        consolidator: { label: 'Konsolidacja', summary: 'Pismo do sądu pracy sfinalizowane. Ważna informacja o 3-tygodniowym terminie umieszczona na widocznym miejscu.' },
      },
    },
    ru: {
      docTypeLabel: 'Уведомление об увольнении',
      fields: { employer: 'Работодатель', date: 'Дата увольнения', type: 'Вид увольнения', notice: 'Срок предупреждения', tenure: 'Стаж работы' },
      questions: {
        dq1: { question: 'Есть ли в вашей компании производственный совет?', background: 'Без консультации с производственным советом по § 102 BetrVG увольнение недействительно вне зависимости от причины.', autoAnswer: 'Да' },
        dq2: { question: 'Были ли вы уведомлены о консультации с производственным советом?', background: 'Согласно § 102 Abs. 1 BetrVG, производственный совет должен быть консультирован перед каждым увольнением. Увольнение без консультации ничтожно.', autoAnswer: 'Нет' },
      },
      agentLabels: {
        drafter: { label: 'Черновик', summary: 'Подготовлен иск о защите от незаконного увольнения по § 4 KSchG. Отсутствие консультации с производственным советом (§ 102 BetrVG) — наиболее сильное основание для признания недействительным.' },
        reviewer: { label: 'Проверка', summary: 'Трёхнедельный срок (§ 4 KSchG) указан верно. Добавлены социальное обоснование (§ 1 KSchG) и заявление о продолжении работы.' },
        factchecker: { label: 'Проверка фактов', summary: 'Судебная практика BAG по § 102 BetrVG корректна. Увольнение без консультации абсолютно недействительно согласно решению BAG 2 AZR 296/13.' },
        adversary: { label: 'Контрпроверка', summary: 'Позиция работодателя: документация производственного совета может существовать. Доказательство консультации vs её отсутствие — ключевой вопрос.' },
        consolidator: { label: 'Консолидация', summary: 'Письмо в трудовой суд завершено. Важное примечание о 3-недельном сроке размещено на видном месте.' },
      },
    },
    tr: {
      docTypeLabel: 'İşten çıkarma bildirimi',
      fields: { employer: 'İşveren', date: 'İşten çıkarma tarihi', type: 'İşten çıkarma türü', notice: 'İhbar süresi', tenure: 'Kıdem' },
      questions: {
        dq1: { question: 'İşyerinizde bir işyeri konseyi var mı?', background: '§ 102 BetrVG uyarınca işyeri konseyi danışılmadan yapılan fesih geçersizdir — nedenden bağımsız olarak.', autoAnswer: 'Evet' },
        dq2: { question: 'İşyeri konseyi görüşmesi hakkında bilgilendirildiniz mi?', background: '§ 102 Abs. 1 BetrVG\'ye göre işyeri konseyi her fesihten önce görüşülmelidir. Danışılmadan yapılan fesih hükümsüzdür.', autoAnswer: 'Hayır' },
      },
      agentLabels: {
        drafter: { label: 'Taslak', summary: '§ 4 KSchG kapsamında işe iade davası hazırlandı. İşyeri konseyi danışılmaması (§ 102 BetrVG) en güçlü geçersizlik sebebi olarak belirlendi.' },
        reviewer: { label: 'İnceleme', summary: 'Üç haftalık süre (§ 4 KSchG) doğru belirtildi. Sosyal gerekçe (§ 1 KSchG) ve istihdam devam talebi eklendi.' },
        factchecker: { label: 'Gerçek Kontrolü', summary: '§ 102 BetrVG\'ye ilişkin BAG içtihadı doğru. Danışılmadan yapılan fesih, BAG kararı 2 AZR 296/13 uyarınca kesinlikle geçersiz.' },
        adversary: { label: 'Karşı Kontrol', summary: 'İşveren perspektifi: konsey belgesi mevcut olabilir. Danışma kanıtı vs. yokluğu ana mesele.' },
        consolidator: { label: 'Konsolidasyon', summary: 'İş mahkemesine mektup tamamlandı. 3 haftalık süreye ilişkin önemli not öne çıkarıldı.' },
      },
    },
    uk: {
      docTypeLabel: 'Повідомлення про звільнення',
      fields: { employer: 'Роботодавець', date: 'Дата звільнення', type: 'Вид звільнення', notice: 'Строк попередження', tenure: 'Стаж роботи' },
      questions: {
        dq1: { question: 'Чи є у вашій компанії виробнича рада?', background: 'Без консультації з виробничою радою за § 102 BetrVG звільнення недійсне незалежно від причини.', autoAnswer: 'Так' },
        dq2: { question: 'Чи повідомляли вас про консультацію з виробничою радою?', background: 'Відповідно до § 102 Abs. 1 BetrVG виробнича рада повинна бути проконсультована перед кожним звільненням. Звільнення без консультації є нікчемним.', autoAnswer: 'Ні' },
      },
      agentLabels: {
        drafter: { label: 'Чернетка', summary: 'Підготовлено позов про захист від незаконного звільнення за § 4 KSchG. Відсутність консультації з виробничою радою (§ 102 BetrVG) — найсильніша підстава для недійсності.' },
        reviewer: { label: 'Перевірка', summary: 'Тритижневий строк (§ 4 KSchG) вказано вірно. Додано соціальне обґрунтування (§ 1 KSchG) та заяву про продовження роботи.' },
        factchecker: { label: 'Перевірка фактів', summary: 'Судова практика BAG щодо § 102 BetrVG коректна. Звільнення без консультації абсолютно недійсне згідно з рішенням BAG 2 AZR 296/13.' },
        adversary: { label: 'Контрперевірка', summary: 'Позиція роботодавця: документація виробничої ради може існувати. Доказ консультації vs її відсутність — ключове питання.' },
        consolidator: { label: 'Консолідація', summary: 'Лист до трудового суду завершено. Важлива примітка про 3-тижневий строк розміщена на видному місці.' },
      },
    },
    ar: {
      docTypeLabel: 'إشعار الفصل من العمل',
      fields: { employer: 'صاحب العمل', date: 'تاريخ الفصل', type: 'نوع الفصل', notice: 'فترة الإشعار', tenure: 'مدة الخدمة' },
      questions: {
        dq1: { question: 'هل يوجد مجلس عمال في شركتك؟', background: 'بدون استشارة مجلس العمال وفق § 102 BetrVG، يكون الفصل باطلاً بصرف النظر عن السبب.', autoAnswer: 'نعم' },
        dq2: { question: 'هل أُخطرت باستشارة مجلس العمال؟', background: 'وفق § 102 Abs. 1 BetrVG، يجب استشارة مجلس العمال قبل كل فصل. الفصل دون استشارة باطل.', autoAnswer: 'لا' },
      },
      agentLabels: {
        drafter: { label: 'المسودة', summary: 'إعداد دعوى حماية من الفصل وفق § 4 KSchG. غياب استشارة مجلس العمال (§ 102 BetrVG) يُعدّ أقوى سبب للبطلان.' },
        reviewer: { label: 'المراجعة', summary: 'الأجل ثلاثة أسابيع (§ 4 KSchG) مذكور بشكل صحيح. إضافة المبرر الاجتماعي (§ 1 KSchG) وطلب الاستمرار في العمل.' },
        factchecker: { label: 'التحقق من الوقائع', summary: 'اجتهاد BAG بشأن § 102 BetrVG صحيح. الفصل دون استشارة باطل بطلاناً مطلقاً وفق حكم BAG 2 AZR 296/13.' },
        adversary: { label: 'الفحص المضاد', summary: 'منظور صاحب العمل: وثائق مجلس العمال قد تكون موجودة. إثبات الاستشارة أو غيابها — المسألة الجوهرية.' },
        consolidator: { label: 'التوحيد', summary: 'الخطاب إلى محكمة العمل مكتمل. تحذير مهم بشأن أجل 3 أسابيع وُضع في مكان بارز.' },
      },
    },
    pt: {
      docTypeLabel: 'Carta de despedimento',
      fields: { employer: 'Empregador', date: 'Data do despedimento', type: 'Tipo de despedimento', notice: 'Período de pré-aviso', tenure: 'Antiguidade' },
      questions: {
        dq1: { question: 'Existe um comité de empresa na sua organização?', background: 'Sem consulta ao comité de empresa ao abrigo do § 102 BetrVG, o despedimento é inválido, independentemente do motivo.', autoAnswer: 'Sim' },
        dq2: { question: 'Foi informado/a sobre a consulta ao comité de empresa?', background: 'Ao abrigo do § 102 Abs. 1 BetrVG, o comité de empresa deve ser consultado antes de qualquer despedimento. Um despedimento sem consulta é nulo.', autoAnswer: 'Não' },
      },
      agentLabels: {
        drafter: { label: 'Rascunho', summary: 'Ação por despedimento ilícito ao abrigo do § 4 KSchG preparada. Falta de consulta ao comité de empresa (§ 102 BetrVG) identificada como motivo mais forte de invalidade.' },
        reviewer: { label: 'Revisão', summary: 'Prazo de três semanas (§ 4 KSchG) corretamente mencionado. Justificação social (§ 1 KSchG) e pedido de reintegração adicionados.' },
        factchecker: { label: 'Verificação de Factos', summary: 'Jurisprudência BAG sobre § 102 BetrVG correta. Despedimento sem consulta absolutamente inválido segundo acórdão BAG 2 AZR 296/13.' },
        adversary: { label: 'Contra-análise', summary: 'Perspetiva do empregador: documentação do comité pode existir. Prova da consulta vs. ausência como questão-chave.' },
        consolidator: { label: 'Consolidação', summary: 'Carta ao tribunal do trabalho finalizada. Nota importante sobre o prazo de 3 semanas colocada em destaque.' },
      },
    },
  },
  miete: {
    en: {
      docTypeLabel: 'Rent Increase Notice',
      fields: { landlord: 'Landlord', date: 'Letter Date', currentRent: 'Current Rent', newRent: 'Demanded Rent', increase: 'Increase', apartment: 'Floor Area' },
      questions: {
        dq1: { question: 'Since when has your tenancy been in effect?', background: 'Rent increases are permissible under § 558 Abs. 1 BGB at the earliest 15 months after the last increase or start of tenancy.', autoAnswer: '2019-03-01' },
        dq2: { question: 'When was the last rent increase?', background: 'The rent cap under § 558 Abs. 3 BGB limits increases to a maximum of 15% in 3 years (in areas with tight housing markets: 20%).', autoAnswer: '2021-06-01' },
      },
      agentLabels: {
        drafter: { label: 'Draft', summary: 'Objection under § 558b BGB drafted. Exceeding the rent cap and insufficient rent index justification as main arguments.' },
        reviewer: { label: 'Review', summary: '§§ 558, 558a, 558b BGB correctly processed. Reference to Berlin rent index 2023 and rent cap (15%) added.' },
        factchecker: { label: 'Fact Check', summary: 'Berlin rent index 2023 for Berlin-Mitte, 75 m², construction year [X] researched. Comparative rent significantly below demanded amount.' },
        adversary: { label: 'Counter-Check', summary: 'Landlord perspective: increase could be based on modernisation. Counter-argumentation on modernisation increase added.' },
        consolidator: { label: 'Consolidation', summary: 'Objection finalised. Request to maintain current rent and deadline for evidence clearly formulated.' },
      },
    },
    fr: {
      docTypeLabel: 'Demande de hausse de loyer',
      fields: { landlord: 'Propriétaire', date: 'Date du courrier', currentRent: 'Loyer actuel', newRent: 'Loyer demandé', increase: 'Augmentation', apartment: 'Surface' },
      questions: {
        dq1: { question: 'Depuis quand votre contrat de location est-il en vigueur ?', background: 'Les augmentations de loyer sont autorisées selon § 558 Abs. 1 BGB au plus tôt 15 mois après la dernière augmentation ou le début du bail.', autoAnswer: '2019-03-01' },
        dq2: { question: 'Quelle était la date de la dernière augmentation de loyer ?', background: 'Le plafond selon § 558 Abs. 3 BGB limite les augmentations à 15 % maximum sur 3 ans (dans les zones de tension locative : 20 %).', autoAnswer: '2021-06-01' },
      },
      agentLabels: {
        drafter: { label: 'Rédaction', summary: 'Contestation selon § 558b BGB rédigée. Dépassement du plafond et justification insuffisante par l\'indice de référence des loyers comme arguments principaux.' },
        reviewer: { label: 'Révision', summary: '§§ 558, 558a, 558b BGB correctement traités. Référence à l\'indice des loyers berlinois 2023 et plafond (15 %) ajoutés.' },
        factchecker: { label: 'Vérification', summary: 'Indice des loyers berlinois 2023 pour Berlin-Mitte, 75 m², année de construction [X] recherché. Loyer de référence nettement inférieur au montant demandé.' },
        adversary: { label: 'Contre-vérification', summary: 'Perspective du propriétaire : l\'augmentation pourrait être basée sur une modernisation. Contre-argumentation sur l\'augmentation pour travaux ajoutée.' },
        consolidator: { label: 'Consolidation', summary: 'Contestation finalisée. Demande de maintien du loyer actuel et délai pour les justificatifs clairement formulés.' },
      },
    },
    es: {
      docTypeLabel: 'Notificación de subida de alquiler',
      fields: { landlord: 'Propietario', date: 'Fecha de la carta', currentRent: 'Alquiler actual', newRent: 'Alquiler exigido', increase: 'Incremento', apartment: 'Superficie' },
      questions: {
        dq1: { question: '¿Desde cuándo está vigente su contrato de arrendamiento?', background: 'Las subidas de alquiler están permitidas según § 558 Abs. 1 BGB como pronto 15 meses después del último incremento o del inicio del arrendamiento.', autoAnswer: '2019-03-01' },
        dq2: { question: '¿Cuándo fue la última subida de alquiler?', background: 'El tope de § 558 Abs. 3 BGB limita los incrementos a un máximo del 15 % en 3 años (en zonas de mercado tensionado: 20 %).', autoAnswer: '2021-06-01' },
      },
      agentLabels: {
        drafter: { label: 'Borrador', summary: 'Oposición según § 558b BGB redactada. Superación del tope de alquiler y justificación insuficiente mediante índice de referencia como argumentos principales.' },
        reviewer: { label: 'Revisión', summary: '§§ 558, 558a, 558b BGB correctamente procesados. Referencia al índice de alquiler de Berlín 2023 y tope (15 %) añadidos.' },
        factchecker: { label: 'Verificación', summary: 'Índice de alquiler de Berlín 2023 para Berlin-Mitte, 75 m², año de construcción [X] investigado. Alquiler comparativo significativamente por debajo del importe exigido.' },
        adversary: { label: 'Contraverificación', summary: 'Perspectiva del propietario: el incremento podría basarse en modernización. Contraargumentación sobre la subida por modernización añadida.' },
        consolidator: { label: 'Consolidación', summary: 'Oposición finalizada. Solicitud de mantenimiento del alquiler actual y plazo para justificantes claramente formulados.' },
      },
    },
    it: {
      docTypeLabel: 'Richiesta di aumento dell\'affitto',
      fields: { landlord: 'Locatore', date: 'Data della lettera', currentRent: 'Affitto attuale', newRent: 'Affitto richiesto', increase: 'Aumento', apartment: 'Superficie' },
      questions: {
        dq1: { question: 'Da quando è in vigore il suo contratto di locazione?', background: 'Gli aumenti di affitto sono ammissibili ai sensi del § 558 Abs. 1 BGB al più presto 15 mesi dopo l\'ultimo aumento o l\'inizio del contratto.', autoAnswer: '2019-03-01' },
        dq2: { question: 'Quando è avvenuto l\'ultimo aumento di affitto?', background: 'Il tetto di § 558 Abs. 3 BGB limita gli aumenti a un massimo del 15% in 3 anni (nelle aree con mercato immobiliare teso: 20%).', autoAnswer: '2021-06-01' },
      },
      agentLabels: {
        drafter: { label: 'Bozza', summary: 'Opposizione ai sensi del § 558b BGB redatta. Superamento del tetto e giustificazione insufficiente tramite indice degli affitti come argomenti principali.' },
        reviewer: { label: 'Revisione', summary: '§§ 558, 558a, 558b BGB correttamente trattati. Riferimento all\'indice degli affitti berlinese 2023 e tetto (15%) aggiunti.' },
        factchecker: { label: 'Verifica fatti', summary: 'Indice degli affitti berlinese 2023 per Berlin-Mitte, 75 m², anno di costruzione [X] ricercato. Affitto di confronto notevolmente inferiore all\'importo richiesto.' },
        adversary: { label: 'Controanalisi', summary: 'Prospettiva del locatore: l\'aumento potrebbe basarsi su una ristrutturazione. Controargomentazione sull\'aumento per ristrutturazione aggiunta.' },
        consolidator: { label: 'Consolidamento', summary: 'Opposizione finalizzata. Richiesta di mantenimento dell\'affitto attuale e scadenza per le prove chiaramente formulate.' },
      },
    },
    pl: {
      docTypeLabel: 'Żądanie podwyżki czynszu',
      fields: { landlord: 'Wynajmujący', date: 'Data pisma', currentRent: 'Obecny czynsz', newRent: 'Żądany czynsz', increase: 'Podwyżka', apartment: 'Powierzchnia' },
      questions: {
        dq1: { question: 'Od kiedy trwa Pana/Pani stosunek najmu?', background: 'Podwyżki czynszu są dopuszczalne według § 558 Abs. 1 BGB najwcześniej 15 miesięcy po ostatniej podwyżce lub od początku najmu.', autoAnswer: '2019-03-01' },
        dq2: { question: 'Kiedy była ostatnia podwyżka czynszu?', background: 'Pułap wg § 558 Abs. 3 BGB ogranicza podwyżki do maksymalnie 15% w ciągu 3 lat (na rynkach napiętych: 20%).', autoAnswer: '2021-06-01' },
      },
      agentLabels: {
        drafter: { label: 'Szkic', summary: 'Sprzeciw na podstawie § 558b BGB sporządzony. Przekroczenie pułapu czynszu i niewystarczające uzasadnienie stawką porównawczą jako główne argumenty.' },
        reviewer: { label: 'Weryfikacja', summary: '§§ 558, 558a, 558b BGB poprawnie zastosowane. Dodano odniesienie do berlińskiego indeksu czynszów 2023 i pułapu (15%).' },
        factchecker: { label: 'Sprawdzenie faktów', summary: 'Berliński indeks czynszów 2023 dla Berlin-Mitte, 75 m², rok budowy [X] zbadany. Czynsz porównawczy wyraźnie poniżej żądanej kwoty.' },
        adversary: { label: 'Kontranaliza', summary: 'Perspektywa wynajmującego: podwyżka mogła być oparta na modernizacji. Dodano kontrargumentację dotyczącą podwyżki modernizacyjnej.' },
        consolidator: { label: 'Konsolidacja', summary: 'Sprzeciw sfinalizowany. Wniosek o utrzymanie dotychczasowego czynszu i termin na dokumenty sformułowane jasno.' },
      },
    },
    ru: {
      docTypeLabel: 'Уведомление о повышении аренды',
      fields: { landlord: 'Арендодатель', date: 'Дата письма', currentRent: 'Текущая аренда', newRent: 'Требуемая аренда', increase: 'Повышение', apartment: 'Площадь' },
      questions: {
        dq1: { question: 'С какого времени действует ваш договор аренды?', background: 'Повышение арендной платы допускается по § 558 Abs. 1 BGB не ранее чем через 15 месяцев после последнего повышения или начала аренды.', autoAnswer: '2019-03-01' },
        dq2: { question: 'Когда было последнее повышение арендной платы?', background: 'Предел по § 558 Abs. 3 BGB ограничивает повышение до 15% за 3 года (в районах с напряжённым жилищным рынком: 20%).', autoAnswer: '2021-06-01' },
      },
      agentLabels: {
        drafter: { label: 'Черновик', summary: 'Составлено возражение по § 558b BGB. Превышение предела повышения аренды и недостаточное обоснование по индексу арендной платы как основные аргументы.' },
        reviewer: { label: 'Проверка', summary: '§§ 558, 558a, 558b BGB обработаны корректно. Добавлена ссылка на берлинский индекс аренды 2023 и предел (15%).' },
        factchecker: { label: 'Проверка фактов', summary: 'Исследован берлинский индекс аренды 2023 для района Berlin-Mitte, 75 м², год постройки [X]. Сравнительная аренда значительно ниже требуемой суммы.' },
        adversary: { label: 'Контрпроверка', summary: 'Позиция арендодателя: повышение может основываться на модернизации. Добавлена контраргументация по повышению за модернизацию.' },
        consolidator: { label: 'Консолидация', summary: 'Возражение завершено. Чётко сформулированы запрос о сохранении текущей аренды и срок для предоставления доказательств.' },
      },
    },
    tr: {
      docTypeLabel: 'Kira artışı bildirimi',
      fields: { landlord: 'Kiraya veren', date: 'Mektup tarihi', currentRent: 'Mevcut kira', newRent: 'Talep edilen kira', increase: 'Artış', apartment: 'Konut alanı' },
      questions: {
        dq1: { question: 'Kira sözleşmeniz ne zaman başladı?', background: 'Kira artışları § 558 Abs. 1 BGB uyarınca son artıştan veya kira başlangıcından en erken 15 ay sonra yapılabilir.', autoAnswer: '2019-03-01' },
        dq2: { question: 'Son kira artışı ne zamandı?', background: '§ 558 Abs. 3 BGB\'deki tavan, 3 yıl içindeki artışları en fazla %15 ile sınırlar (konut piyasasının gergin olduğu bölgelerde: %20).', autoAnswer: '2021-06-01' },
      },
      agentLabels: {
        drafter: { label: 'Taslak', summary: '§ 558b BGB uyarınca itiraz hazırlandı. Kira tavanının aşılması ve kira endeksi gerekçesinin yetersizliği ana argümanlar.' },
        reviewer: { label: 'İnceleme', summary: '§§ 558, 558a, 558b BGB doğru işlendi. Berlin kira endeksi 2023 ve tavan (%15) referansı eklendi.' },
        factchecker: { label: 'Gerçek Kontrolü', summary: 'Berlin-Mitte, 75 m², yapım yılı [X] için Berlin kira endeksi 2023 araştırıldı. Emsal kira talep edilen miktarın belirgin altında.' },
        adversary: { label: 'Karşı Kontrol', summary: 'Kiraya veren perspektifi: artış modernizasyona dayalı olabilir. Modernizasyon artışına karşı argümantasyon eklendi.' },
        consolidator: { label: 'Konsolidasyon', summary: 'İtiraz tamamlandı. Mevcut kira tutarının korunması talebi ve belge için son tarih açıkça ifade edildi.' },
      },
    },
    uk: {
      docTypeLabel: 'Повідомлення про підвищення орендної плати',
      fields: { landlord: 'Орендодавець', date: 'Дата листа', currentRent: 'Поточна оренда', newRent: 'Вимагана оренда', increase: 'Підвищення', apartment: 'Площа' },
      questions: {
        dq1: { question: 'З якого часу діє ваш договір оренди?', background: 'Підвищення орендної плати допускається за § 558 Abs. 1 BGB не раніше ніж через 15 місяців після останнього підвищення або початку оренди.', autoAnswer: '2019-03-01' },
        dq2: { question: 'Коли було останнє підвищення орендної плати?', background: 'Обмеження за § 558 Abs. 3 BGB обмежує підвищення до 15% за 3 роки (на ринках з напруженим становищем: 20%).', autoAnswer: '2021-06-01' },
      },
      agentLabels: {
        drafter: { label: 'Чернетка', summary: 'Складено заперечення за § 558b BGB. Перевищення межі підвищення оренди та недостатнє обґрунтування за індексом орендної плати як основні аргументи.' },
        reviewer: { label: 'Перевірка', summary: '§§ 558, 558a, 558b BGB оброблені коректно. Додано посилання на берлінський індекс оренди 2023 та межу (15%).' },
        factchecker: { label: 'Перевірка фактів', summary: 'Досліджено берлінський індекс оренди 2023 для Berlin-Mitte, 75 м², рік побудови [X]. Порівняльна оренда значно нижча за вимагану суму.' },
        adversary: { label: 'Контрперевірка', summary: 'Позиція орендодавця: підвищення може ґрунтуватися на модернізації. Додано контраргументацію щодо підвищення за модернізацію.' },
        consolidator: { label: 'Консолідація', summary: 'Заперечення завершено. Чітко сформульовані запит про збереження поточної оренди та строк для надання доказів.' },
      },
    },
    ar: {
      docTypeLabel: 'إشعار زيادة الإيجار',
      fields: { landlord: 'المالك', date: 'تاريخ الخطاب', currentRent: 'الإيجار الحالي', newRent: 'الإيجار المطلوب', increase: 'الزيادة', apartment: 'مساحة الشقة' },
      questions: {
        dq1: { question: 'منذ متى يسري عقد إيجارك؟', background: 'تُجاز زيادات الإيجار وفق § 558 Abs. 1 BGB في أبكر الأحوال بعد 15 شهراً من آخر زيادة أو من بداية عقد الإيجار.', autoAnswer: '2019-03-01' },
        dq2: { question: 'متى كانت آخر زيادة في الإيجار؟', background: 'يُقيّد السقف وفق § 558 Abs. 3 BGB الزيادات بحد أقصى 15% خلال 3 سنوات (في مناطق السوق المتوترة: 20%).', autoAnswer: '2021-06-01' },
      },
      agentLabels: {
        drafter: { label: 'المسودة', summary: 'صياغة اعتراض وفق § 558b BGB. تجاوز سقف الإيجار وعدم كفاية تبرير مؤشر الإيجار كحجج رئيسية.' },
        reviewer: { label: 'المراجعة', summary: 'معالجة §§ 558, 558a, 558b BGB بشكل صحيح. إضافة مرجع مؤشر إيجار برلين 2023 والسقف (15%).' },
        factchecker: { label: 'التحقق من الوقائع', summary: 'البحث في مؤشر إيجار برلين 2023 لمنطقة Berlin-Mitte، 75 م²، سنة البناء [X]. الإيجار المقارن أقل بكثير من المبلغ المطلوب.' },
        adversary: { label: 'الفحص المضاد', summary: 'منظور المالك: قد تستند الزيادة إلى تحسينات. إضافة حجج مضادة بشأن زيادة التحسينات.' },
        consolidator: { label: 'التوحيد', summary: 'الاعتراض مكتمل. طلب الإبقاء على الإيجار الحالي وتحديد موعد للأدلة صِيغا بوضوح.' },
      },
    },
    pt: {
      docTypeLabel: 'Notificação de aumento de renda',
      fields: { landlord: 'Senhorio', date: 'Data da carta', currentRent: 'Renda atual', newRent: 'Renda exigida', increase: 'Aumento', apartment: 'Área útil' },
      questions: {
        dq1: { question: 'Desde quando está em vigor o seu contrato de arrendamento?', background: 'Os aumentos de renda são admissíveis ao abrigo do § 558 Abs. 1 BGB no mínimo 15 meses após o último aumento ou início do arrendamento.', autoAnswer: '2019-03-01' },
        dq2: { question: 'Quando foi o último aumento de renda?', background: 'O teto ao abrigo do § 558 Abs. 3 BGB limita os aumentos a um máximo de 15% em 3 anos (em zonas de mercado habitacional pressionado: 20%).', autoAnswer: '2021-06-01' },
      },
      agentLabels: {
        drafter: { label: 'Rascunho', summary: 'Oposição ao abrigo do § 558b BGB redigida. Ultrapassagem do teto de renda e justificação insuficiente pelo índice de arrendamento como argumentos principais.' },
        reviewer: { label: 'Revisão', summary: '§§ 558, 558a, 558b BGB corretamente tratados. Referência ao índice de arrendamento de Berlim 2023 e teto (15%) adicionados.' },
        factchecker: { label: 'Verificação de Factos', summary: 'Índice de arrendamento de Berlim 2023 para Berlin-Mitte, 75 m², ano de construção [X] pesquisado. Renda comparativa significativamente abaixo do montante exigido.' },
        adversary: { label: 'Contra-análise', summary: 'Perspetiva do senhorio: o aumento pode basear-se em modernização. Contra-argumentação sobre o aumento por modernização adicionada.' },
        consolidator: { label: 'Consolidação', summary: 'Oposição finalizada. Pedido de manutenção da renda atual e prazo para comprovativos claramente formulados.' },
      },
    },
  },
  bussgeld: {
    en: {
      docTypeLabel: 'Traffic Fine Notice',
      fields: { authority: 'Fines Authority', reference: 'Case Number', date: 'Notice Date', offence: 'Alleged Offence', fine: 'Fine', points: 'Penalty Points' },
      questions: {
        dq1: { question: 'Were you actually the driver at the time of the alleged offence?', background: 'As the registered keeper you are not automatically the driver. The authority must prove who was driving.', autoAnswer: 'Yes' },
        dq2: { question: 'Do you have information about the measuring device used or its calibration certificate?', background: 'An expired calibration certificate or measurement error can lead to the proceedings being dropped (§ 25 MessEG).', autoAnswer: 'I am requesting access to the case file to check the device and calibration certificate' },
      },
      agentLabels: {
        drafter: { label: 'Draft', summary: 'Objection under § 67 OWiG drafted. Request for case file access and review of calibration certificate as core strategy.' },
        reviewer: { label: 'Review', summary: '§§ 67, 46 OWiG and measurement protocol requirements correct. Reference to standardised measurement procedure (ES 3.0) added.' },
        factchecker: { label: 'Fact Check', summary: 'Calibration obligation under MessEG correctly represented. Current OLG case law on measurement errors and expired calibration certificates verified.' },
        adversary: { label: 'Counter-Check', summary: 'Authority perspective: standardised measurement procedures carry evidential weight. Substantiated objection to measurement required, not blanket denial.' },
        consolidator: { label: 'Consolidation', summary: 'Objection finalised. Request for case file access prominently formulated — uncovers procedural errors in 30% of cases.' },
      },
    },
    fr: {
      docTypeLabel: 'Avis d\'amende routière',
      fields: { authority: 'Service des amendes', reference: 'Numéro de dossier', date: 'Date de l\'avis', offence: 'Infraction présumée', fine: 'Amende', points: 'Points de pénalité' },
      questions: {
        dq1: { question: 'Étiez-vous réellement le conducteur au moment des faits présumés ?', background: 'En tant que propriétaire du véhicule, vous n\'êtes pas automatiquement le conducteur. L\'autorité doit prouver qui conduisait.', autoAnswer: 'Oui' },
        dq2: { question: 'Avez-vous des informations sur l\'appareil de mesure utilisé ou son certificat d\'étalonnage ?', background: 'Un certificat d\'étalonnage expiré ou une erreur de mesure peuvent conduire à l\'abandon des poursuites (§ 25 MessEG).', autoAnswer: 'Je demande l\'accès au dossier pour vérifier l\'appareil et le certificat d\'étalonnage' },
      },
      agentLabels: {
        drafter: { label: 'Rédaction', summary: 'Recours selon § 67 OWiG rédigé. Demande d\'accès au dossier et vérification du certificat d\'étalonnage comme stratégie principale.' },
        reviewer: { label: 'Révision', summary: '§§ 67, 46 OWiG et exigences du protocole de mesure corrects. Référence à la procédure de mesure standardisée (ES 3.0) ajoutée.' },
        factchecker: { label: 'Vérification', summary: 'Obligation d\'étalonnage selon MessEG correctement présentée. Jurisprudence OLG actuelle sur les erreurs de mesure et certificats expirés vérifiée.' },
        adversary: { label: 'Contre-vérification', summary: 'Perspective de l\'autorité : les procédures de mesure standardisées ont force probante. Objection motivée à la mesure requise, pas un simple refus.' },
        consolidator: { label: 'Consolidation', summary: 'Recours finalisé. Demande d\'accès au dossier formulée en évidence — révèle des vices de procédure dans 30 % des cas.' },
      },
    },
    es: {
      docTypeLabel: 'Notificación de multa de tráfico',
      fields: { authority: 'Órgano sancionador', reference: 'Número de expediente', date: 'Fecha de notificación', offence: 'Infracción presunta', fine: 'Multa', points: 'Puntos de penalización' },
      questions: {
        dq1: { question: '¿Era usted realmente el conductor en el momento de la presunta infracción?', background: 'Como titular del vehículo no es automáticamente el conductor. La autoridad debe acreditar quién conducía.', autoAnswer: 'Sí' },
        dq2: { question: '¿Dispone de información sobre el dispositivo de medición utilizado o su certificado de calibración?', background: 'Un certificado de calibración caducado o un error de medición pueden dar lugar al sobreseimiento (§ 25 MessEG).', autoAnswer: 'Solicito acceso al expediente para verificar el dispositivo y el certificado de calibración' },
      },
      agentLabels: {
        drafter: { label: 'Borrador', summary: 'Recurso según § 67 OWiG redactado. Solicitud de acceso al expediente y revisión del certificado de calibración como estrategia principal.' },
        reviewer: { label: 'Revisión', summary: '§§ 67, 46 OWiG y requisitos del protocolo de medición correctos. Referencia al procedimiento de medición normalizado (ES 3.0) añadida.' },
        factchecker: { label: 'Verificación', summary: 'Obligación de calibración según MessEG correctamente presentada. Jurisprudencia OLG actual sobre errores de medición y certificados caducados verificada.' },
        adversary: { label: 'Contraverificación', summary: 'Perspectiva del órgano sancionador: los procedimientos de medición normalizados tienen valor probatorio. Se requiere objeción motivada, no mera negativa.' },
        consolidator: { label: 'Consolidación', summary: 'Recurso finalizado. Solicitud de acceso al expediente formulada de forma destacada — descubre errores procedimentales en el 30% de los casos.' },
      },
    },
    it: {
      docTypeLabel: 'Verbale di multa stradale',
      fields: { authority: 'Ufficio contravvenzioni', reference: 'Numero di fascicolo', date: 'Data del verbale', offence: 'Infrazione presunta', fine: 'Multa', points: 'Punti di penalità' },
      questions: {
        dq1: { question: 'Era lei effettivamente il conducente al momento della presunta infrazione?', background: 'Come proprietario del veicolo non è automaticamente il conducente. L\'autorità deve provare chi guidava.', autoAnswer: 'Sì' },
        dq2: { question: 'Dispone di informazioni sull\'apparecchio di misura utilizzato o sul suo certificato di taratura?', background: 'Un certificato di taratura scaduto o un errore di misura possono portare all\'archiviazione del procedimento (§ 25 MessEG).', autoAnswer: 'Richiedo l\'accesso agli atti per verificare l\'apparecchio e il certificato di taratura' },
      },
      agentLabels: {
        drafter: { label: 'Bozza', summary: 'Ricorso ai sensi del § 67 OWiG redatto. Richiesta di accesso agli atti e verifica del certificato di taratura come strategia principale.' },
        reviewer: { label: 'Revisione', summary: '§§ 67, 46 OWiG e requisiti del protocollo di misura corretti. Riferimento alla procedura di misura standardizzata (ES 3.0) aggiunto.' },
        factchecker: { label: 'Verifica fatti', summary: 'Obbligo di taratura ai sensi del MessEG correttamente rappresentato. Giurisprudenza OLG attuale su errori di misura e certificati scaduti verificata.' },
        adversary: { label: 'Controanalisi', summary: 'Prospettiva dell\'autorità: le procedure di misura standardizzate hanno valore probatorio. È richiesta un\'obiezione motivata, non un semplice diniego.' },
        consolidator: { label: 'Consolidamento', summary: 'Ricorso finalizzato. Richiesta di accesso agli atti formulata in evidenza — individua errori procedurali nel 30% dei casi.' },
      },
    },
    pl: {
      docTypeLabel: 'Mandat drogowy',
      fields: { authority: 'Urząd ds. wykroczeń', reference: 'Numer sprawy', date: 'Data mandatu', offence: 'Zarzucane wykroczenie', fine: 'Grzywna', points: 'Punkty karne' },
      questions: {
        dq1: { question: 'Czy był/a Pan/Pani rzeczywiście kierowcą w chwili domniemanego wykroczenia?', background: 'Jako właściciel pojazdu nie jest Pan/Pani automatycznie kierowcą. Urząd musi udowodnić, kto prowadził pojazd.', autoAnswer: 'Tak' },
        dq2: { question: 'Czy posiada Pan/Pani informacje o użytym urządzeniu pomiarowym lub jego świadectwie legalizacji?', background: 'Przeterminowane świadectwo legalizacji lub błąd pomiarowy mogą doprowadzić do umorzenia postępowania (§ 25 MessEG).', autoAnswer: 'Wnioskuję o dostęp do akt, aby sprawdzić urządzenie i certyfikat legalizacji' },
      },
      agentLabels: {
        drafter: { label: 'Szkic', summary: 'Sprzeciw na podstawie § 67 OWiG sporządzony. Wniosek o dostęp do akt i weryfikacja świadectwa legalizacji jako główna strategia.' },
        reviewer: { label: 'Weryfikacja', summary: '§§ 67, 46 OWiG i wymogi protokołu pomiarowego prawidłowe. Dodano odniesienie do znormalizowanej procedury pomiarowej (ES 3.0).' },
        factchecker: { label: 'Sprawdzenie faktów', summary: 'Obowiązek legalizacji wg MessEG poprawnie przedstawiony. Aktualne orzecznictwo OLG dot. błędów pomiarowych i przeterminowanych świadectw zweryfikowane.' },
        adversary: { label: 'Kontranaliza', summary: 'Perspektywa urzędu: znormalizowane procedury pomiarowe mają moc dowodową. Wymagany uzasadniony zarzut, nie ogólna odmowa.' },
        consolidator: { label: 'Konsolidacja', summary: 'Sprzeciw sfinalizowany. Wniosek o dostęp do akt wyróżniony — ujawnia błędy proceduralne w 30% przypadków.' },
      },
    },
    ru: {
      docTypeLabel: 'Постановление о штрафе',
      fields: { authority: 'Орган по штрафам', reference: 'Номер дела', date: 'Дата постановления', offence: 'Предполагаемое нарушение', fine: 'Штраф', points: 'Штрафные баллы' },
      questions: {
        dq1: { question: 'Действительно ли вы были за рулём в момент предполагаемого нарушения?', background: 'Как владелец транспортного средства вы не являетесь автоматически водителем. Орган должен доказать, кто управлял автомобилем.', autoAnswer: 'Да' },
        dq2: { question: 'Есть ли у вас сведения об использованном измерительном устройстве или его свидетельстве о поверке?', background: 'Просроченное свидетельство о поверке или ошибка измерения могут привести к прекращению производства (§ 25 MessEG).', autoAnswer: 'Прошу доступ к материалам дела для проверки устройства и сертификата поверки' },
      },
      agentLabels: {
        drafter: { label: 'Черновик', summary: 'Составлено возражение по § 67 OWiG. Запрос доступа к материалам дела и проверка свидетельства о поверке как основная стратегия.' },
        reviewer: { label: 'Проверка', summary: '§§ 67, 46 OWiG и требования к протоколу измерения корректны. Добавлена ссылка на стандартизированную процедуру измерения (ES 3.0).' },
        factchecker: { label: 'Проверка фактов', summary: 'Обязательность поверки по MessEG представлена корректно. Актуальная судебная практика OLG по ошибкам измерения и просроченным свидетельствам проверена.' },
        adversary: { label: 'Контрпроверка', summary: 'Позиция органа: стандартизированные процедуры измерения обладают доказательной силой. Требуется мотивированное возражение против измерения, а не просто отрицание.' },
        consolidator: { label: 'Консолидация', summary: 'Возражение завершено. Запрос о доступе к материалам дела сформулирован выразительно — выявляет процессуальные ошибки в 30% случаев.' },
      },
    },
    tr: {
      docTypeLabel: 'Trafik cezası tebligatı',
      fields: { authority: 'Ceza birimi', reference: 'Dosya numarası', date: 'Tebligat tarihi', offence: 'İddia edilen ihlal', fine: 'Para cezası', points: 'Ceza puanı' },
      questions: {
        dq1: { question: 'İddia edilen ihlal anında gerçekten siz mi sürüyordunuz?', background: 'Araç sahibi olarak otomatik olarak sürücü sayılmazsınız. Yetkili birimin kimin sürdüğünü ispat etmesi gerekir.', autoAnswer: 'Evet' },
        dq2: { question: 'Kullanılan ölçüm cihazı veya kalibrasyon sertifikası hakkında bilginiz var mı?', background: 'Süresi dolmuş kalibrasyon sertifikası veya ölçüm hatası işlemlerin düşürülmesine yol açabilir (§ 25 MessEG).', autoAnswer: 'Cihazı ve kalibrasyon sertifikasını incelemek için dosyaya erişim talep ediyorum' },
      },
      agentLabels: {
        drafter: { label: 'Taslak', summary: '§ 67 OWiG uyarınca itiraz yazısı hazırlandı. Dosyaya erişim talebi ve kalibrasyon sertifikasının incelenmesi ana strateji.' },
        reviewer: { label: 'İnceleme', summary: '§§ 67, 46 OWiG ve ölçüm protokolü gereksinimleri doğru. Standart ölçüm prosedürüne (ES 3.0) atıf eklendi.' },
        factchecker: { label: 'Gerçek Kontrolü', summary: 'MessEG uyarınca kalibrasyon zorunluluğu doğru temsil edildi. Ölçüm hataları ve süresi dolmuş sertifikalara ilişkin güncel OLG içtihadı doğrulandı.' },
        adversary: { label: 'Karşı Kontrol', summary: 'Kurum perspektifi: standart ölçüm prosedürleri delil niteliği taşır. Genel ret değil, gerekçeli itiraz gerekli.' },
        consolidator: { label: 'Konsolidasyon', summary: 'İtiraz tamamlandı. Dosyaya erişim talebi öne çıkarıldı — vakaların %30\'unda usul hatası ortaya çıkarıyor.' },
      },
    },
    uk: {
      docTypeLabel: 'Постанова про штраф',
      fields: { authority: 'Орган з штрафів', reference: 'Номер справи', date: 'Дата постанови', offence: 'Передбачуване порушення', fine: 'Штраф', points: 'Штрафні бали' },
      questions: {
        dq1: { question: 'Чи справді ви були за кермом у момент передбачуваного порушення?', background: 'Як власник транспортного засобу ви не є автоматично водієм. Орган повинен довести, хто керував автомобілем.', autoAnswer: 'Так' },
        dq2: { question: 'Чи є у вас відомості про використаний вимірювальний пристрій або його свідоцтво про повірку?', background: 'Прострочене свідоцтво про повірку або помилка вимірювання можуть призвести до закриття провадження (§ 25 MessEG).', autoAnswer: 'Прошу доступ до матеріалів справи для перевірки пристрою та сертифіката повірки' },
      },
      agentLabels: {
        drafter: { label: 'Чернетка', summary: 'Складено заперечення за § 67 OWiG. Запит доступу до матеріалів справи та перевірка свідоцтва про повірку як основна стратегія.' },
        reviewer: { label: 'Перевірка', summary: '§§ 67, 46 OWiG та вимоги до протоколу вимірювання коректні. Додано посилання на стандартизовану процедуру вимірювання (ES 3.0).' },
        factchecker: { label: 'Перевірка фактів', summary: 'Обов\'язковість повірки за MessEG представлена коректно. Актуальна судова практика OLG щодо помилок вимірювання та прострочених свідоцтв перевірена.' },
        adversary: { label: 'Контрперевірка', summary: 'Позиція органу: стандартизовані процедури вимірювання мають доказову силу. Потрібне мотивоване заперечення проти вимірювання, а не просте заперечення.' },
        consolidator: { label: 'Консолідація', summary: 'Заперечення завершено. Запит про доступ до матеріалів справи сформульовано виразно — виявляє процесуальні помилки у 30% випадків.' },
      },
    },
    ar: {
      docTypeLabel: 'إشعار مخالفة مرورية',
      fields: { authority: 'جهة الغرامات', reference: 'رقم الملف', date: 'تاريخ الإشعار', offence: 'المخالفة المزعومة', fine: 'الغرامة', points: 'نقاط العقوبة' },
      questions: {
        dq1: { question: 'هل كنت فعلاً أنت السائق وقت وقوع المخالفة المزعومة؟', background: 'بوصفك مالكاً للمركبة لست تلقائياً السائق. يجب على الجهة المختصة إثبات من كان يقود.', autoAnswer: 'نعم' },
        dq2: { question: 'هل لديك معلومات عن جهاز القياس المستخدم أو شهادة معايرته؟', background: 'قد تؤدي شهادة معايرة منتهية الصلاحية أو خطأ في القياس إلى إسقاط الإجراءات (§ 25 MessEG).', autoAnswer: 'أطلب الاطلاع على الملف للتحقق من الجهاز وشهادة المعايرة' },
      },
      agentLabels: {
        drafter: { label: 'المسودة', summary: 'صياغة اعتراض وفق § 67 OWiG. طلب الاطلاع على الملف وفحص شهادة المعايرة كاستراتيجية رئيسية.' },
        reviewer: { label: 'المراجعة', summary: '§§ 67, 46 OWiG ومتطلبات بروتوكول القياس صحيحة. إضافة إشارة إلى إجراء القياس القياسي (ES 3.0).' },
        factchecker: { label: 'التحقق من الوقائع', summary: 'تمثيل التزام المعايرة وفق MessEG بشكل صحيح. التحقق من اجتهادات OLG الراهنة بشأن أخطاء القياس وشهادات المعايرة المنتهية.' },
        adversary: { label: 'الفحص المضاد', summary: 'منظور الجهة المختصة: الإجراءات القياسية للقياس ذات قيمة إثباتية. مطلوب اعتراض مسبب وليس مجرد نفي.' },
        consolidator: { label: 'التوحيد', summary: 'الاعتراض مكتمل. صياغة طلب الاطلاع على الملف بشكل بارز — يكشف أخطاء إجرائية في 30% من الحالات.' },
      },
    },
    pt: {
      docTypeLabel: 'Notificação de multa de trânsito',
      fields: { authority: 'Serviço de coimas', reference: 'Número do processo', date: 'Data da notificação', offence: 'Infração alegada', fine: 'Coima', points: 'Pontos de penalização' },
      questions: {
        dq1: { question: 'Era efetivamente o/a condutor/a no momento da alegada infração?', background: 'Como proprietário/a do veículo, não é automaticamente o/a condutor/a. A autoridade deve provar quem estava a conduzir.', autoAnswer: 'Sim' },
        dq2: { question: 'Tem informações sobre o dispositivo de medição utilizado ou o seu certificado de calibração?', background: 'Um certificado de calibração expirado ou um erro de medição podem levar ao arquivamento do processo (§ 25 MessEG).', autoAnswer: 'Solicito acesso ao processo para verificar o dispositivo e o certificado de calibração' },
      },
      agentLabels: {
        drafter: { label: 'Rascunho', summary: 'Oposição ao abrigo do § 67 OWiG redigida. Pedido de acesso ao processo e verificação do certificado de calibração como estratégia principal.' },
        reviewer: { label: 'Revisão', summary: '§§ 67, 46 OWiG e requisitos do protocolo de medição corretos. Referência ao procedimento de medição normalizado (ES 3.0) adicionada.' },
        factchecker: { label: 'Verificação de Factos', summary: 'Obrigação de calibração ao abrigo do MessEG corretamente representada. Jurisprudência OLG atual sobre erros de medição e certificados expirados verificada.' },
        adversary: { label: 'Contra-análise', summary: 'Perspetiva da autoridade: procedimentos de medição normalizados têm valor probatório. Objeção fundamentada à medição necessária, não mera negação.' },
        consolidator: { label: 'Consolidação', summary: 'Oposição finalizada. Pedido de acesso ao processo formulado em destaque — revela erros procedimentais em 30% dos casos.' },
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
