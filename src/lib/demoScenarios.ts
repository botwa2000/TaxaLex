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
 * Returns the demo scenario for the given use-case type.
 * Falls back to the `tax` scenario if the type is unknown.
 * The `_locale` parameter is reserved for future locale-specific variants.
 */
export function getDemoScenario(type: string, _locale?: string): DemoScenario {
  return SCENARIOS[type] ?? SCENARIOS['tax']
}
