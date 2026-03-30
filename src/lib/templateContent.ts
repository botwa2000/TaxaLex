export interface TemplatePlaceholder {
  key: string
  labelDE: string
  labelEN: string
  placeholderDE?: string
  placeholderEN?: string
  required: boolean
  multiline?: boolean
}

export interface TemplateContent {
  id: string
  titleDE: string
  titleEN: string
  descDE: string
  descEN: string
  slug: string
  law: string
  deadlineDE: string
  deadlineEN: string
  content: string
  placeholders: TemplatePlaceholder[]
}

const SENDER: TemplatePlaceholder[] = [
  { key: 'VORNAME_NACHNAME', labelDE: 'Ihr vollständiger Name', labelEN: 'Your full name', placeholderDE: 'Max Mustermann', placeholderEN: 'John Doe', required: true },
  { key: 'STRASSE_HAUSNUMMER', labelDE: 'Straße und Hausnummer', labelEN: 'Street and house number', placeholderDE: 'Musterstraße 1', placeholderEN: '1 Example Street', required: true },
  { key: 'PLZ_ORT', labelDE: 'PLZ und Ort', labelEN: 'Postcode and city', placeholderDE: '12345 Berlin', placeholderEN: '12345 Berlin', required: true },
  { key: 'ORT_DATUM', labelDE: 'Ort und Datum', labelEN: 'Place and date', placeholderDE: 'Berlin, 30.03.2026', placeholderEN: 'Berlin, 30.03.2026', required: true },
]

export const templateContent: Record<string, TemplateContent> = {

  'steuerbescheid-einspruch': {
    id: 'steuerbescheid-einspruch',
    titleDE: 'Einspruch Steuerbescheid',
    titleEN: 'Tax Assessment Objection',
    descDE: 'Formeller Einspruch gegen Einkommen-, Gewerbe- oder Grundsteuerbescheid nach § 347 AO.',
    descEN: 'Formal objection against income, trade, or property tax assessment under § 347 AO.',
    slug: 'tax',
    law: '§ 347 AO',
    deadlineDE: '30 Tage',
    deadlineEN: '30 days',
    placeholders: [
      ...SENDER,
      { key: 'FINANZAMT_NAME', labelDE: 'Finanzamt', labelEN: 'Tax office', placeholderDE: 'Finanzamt Mitte', required: true },
      { key: 'FINANZAMT_ADRESSE', labelDE: 'Adresse des Finanzamts', labelEN: 'Tax office address', placeholderDE: 'Amtsstraße 1, 10117 Berlin', required: true },
      { key: 'BESCHEIDDATUM', labelDE: 'Datum des Bescheids', labelEN: 'Notice date', placeholderDE: '01.03.2026', required: true },
      { key: 'STEUERNUMMER', labelDE: 'Steuernummer', labelEN: 'Tax number', placeholderDE: '12/345/67890', required: true },
      { key: 'STEUERJAHR', labelDE: 'Steuerjahr', labelEN: 'Tax year', placeholderDE: '2024', required: true },
      { key: 'BEGRUENDUNG', labelDE: 'Begründung des Einspruchs', labelEN: 'Objection grounds', placeholderDE: 'Die festgesetzte Steuer ist fehlerhaft, weil…', required: true, multiline: true },
    ],
    content: `[VORNAME_NACHNAME]
[STRASSE_HAUSNUMMER]
[PLZ_ORT]

An das
[FINANZAMT_NAME]
[FINANZAMT_ADRESSE]

[ORT_DATUM]

Betreff: Einspruch nach § 347 AO gegen Einkommensteuerbescheid [STEUERJAHR]
         Steuernummer: [STEUERNUMMER]

Sehr geehrte Damen und Herren,

hiermit lege ich gegen Ihren Einkommensteuerbescheid für das Jahr [STEUERJAHR]
vom [BESCHEIDDATUM] (Steuernummer: [STEUERNUMMER]) fristgemäß Einspruch nach
§ 347 Abs. 1 Nr. 1 AO ein.

Begründung:
[BEGRUENDUNG]

Ich beantrage:
1. Den angefochtenen Bescheid aufzuheben und die Steuer entsprechend korrekt
   neu festzusetzen.
2. Die Vollziehung des Bescheids gemäß § 361 AO bis zur endgültigen Entscheidung
   auszusetzen, da ernstliche Zweifel an der Rechtmäßigkeit bestehen.

Bitte bestätigen Sie den Eingang dieses Einspruchs schriftlich und teilen Sie
mir den voraussichtlichen Bearbeitungsstand mit.

Mit freundlichen Grüßen

[VORNAME_NACHNAME]

Anlage: Kopie des angefochtenen Steuerbescheids`,
  },

  'grundsteuer-einspruch': {
    id: 'grundsteuer-einspruch',
    titleDE: 'Einspruch Grundsteuerbescheid (Reform 2022)',
    titleEN: 'Property Tax Objection (2022 Reform)',
    descDE: 'Einspruch gegen den neuen Grundsteuerwertbescheid nach der Grundsteuerreform 2022.',
    descEN: 'Challenge your new property tax assessment following the 2022 Grundsteuer reform.',
    slug: 'grundsteuer',
    law: '§ 347 AO, GrStG',
    deadlineDE: '30 Tage',
    deadlineEN: '30 days',
    placeholders: [
      ...SENDER,
      { key: 'FINANZAMT_NAME', labelDE: 'Finanzamt', labelEN: 'Tax office', placeholderDE: 'Finanzamt Mitte', required: true },
      { key: 'FINANZAMT_ADRESSE', labelDE: 'Adresse des Finanzamts', labelEN: 'Tax office address', placeholderDE: 'Amtsstraße 1, 10117 Berlin', required: true },
      { key: 'BESCHEIDDATUM', labelDE: 'Datum des Bescheids', labelEN: 'Notice date', placeholderDE: '01.03.2026', required: true },
      { key: 'AKTENZEICHEN', labelDE: 'Aktenzeichen / Steuernummer', labelEN: 'File reference', placeholderDE: '123/4567/890', required: true },
      { key: 'GRUNDSTUECK_ADRESSE', labelDE: 'Adresse des Grundstücks', labelEN: 'Property address', placeholderDE: 'Musterstraße 1, 12345 Berlin', required: true },
      { key: 'BEGRUENDUNG', labelDE: 'Fehler im Bescheid (z.B. falsche Fläche, falscher Bodenrichtwert)', labelEN: 'Errors in the notice', placeholderDE: 'Die angesetzte Grundstücksfläche von X m² weicht von der tatsächlichen Fläche von Y m² ab…', required: true, multiline: true },
    ],
    content: `[VORNAME_NACHNAME]
[STRASSE_HAUSNUMMER]
[PLZ_ORT]

An das
[FINANZAMT_NAME]
[FINANZAMT_ADRESSE]

[ORT_DATUM]

Betreff: Einspruch nach § 347 AO gegen Grundsteuerwertbescheid
         Aktenzeichen: [AKTENZEICHEN]
         Grundstück: [GRUNDSTUECK_ADRESSE]

Sehr geehrte Damen und Herren,

hiermit lege ich gegen den Grundsteuerwertbescheid vom [BESCHEIDDATUM]
(Az. [AKTENZEICHEN]) fristgerecht Einspruch nach § 347 Abs. 1 AO ein.

Begründung:
[BEGRUENDUNG]

Die neue Grundsteuerberechnung nach dem reformierten GrStG beruht damit auf
unzutreffenden Grundlagenwerten, was zu einer rechtswidrig überhöhten Steuer führt.

Ich beantrage:
1. Den Grundsteuerwertbescheid aufzuheben und die Bewertung auf Basis korrekter
   Daten neu durchzuführen.
2. Aussetzung der Vollziehung nach § 361 AO, da ernstliche Zweifel an der
   Richtigkeit der angesetzten Werte bestehen.

Mit freundlichen Grüßen

[VORNAME_NACHNAME]

Anlage: Grundbuchauszug / Lageplan / Nachweis der tatsächlichen Grundstücksdaten`,
  },

  'jobcenter-widerspruch': {
    id: 'jobcenter-widerspruch',
    titleDE: 'Widerspruch Jobcenter / Bürgergeld',
    titleEN: 'Jobcenter Objection (Bürgergeld)',
    descDE: 'Widerspruch gegen abgelehnte oder gekürzte Bürgergeld-Leistungen nach § 78 SGG.',
    descEN: 'Object to rejected or reduced Bürgergeld payments under § 78 SGG.',
    slug: 'jobcenter',
    law: '§ 78 SGG',
    deadlineDE: '1 Monat',
    deadlineEN: '1 month',
    placeholders: [
      ...SENDER,
      { key: 'JOBCENTER_NAME', labelDE: 'Name des Jobcenters', labelEN: 'Jobcenter name', placeholderDE: 'Jobcenter Berlin Mitte', required: true },
      { key: 'JOBCENTER_ADRESSE', labelDE: 'Adresse des Jobcenters', labelEN: 'Jobcenter address', placeholderDE: 'Müllerstraße 1, 10117 Berlin', required: true },
      { key: 'BESCHEIDDATUM', labelDE: 'Datum des Bescheids', labelEN: 'Decision date', placeholderDE: '01.03.2026', required: true },
      { key: 'KUNDENNUMMER', labelDE: 'Kunden-/Bedarfsgemeinschafts-Nummer', labelEN: 'Customer number', placeholderDE: 'BG-12345678', required: true },
      { key: 'BEGRUENDUNG', labelDE: 'Begründung des Widerspruchs', labelEN: 'Grounds for objection', placeholderDE: 'Die Ablehnung/Kürzung ist fehlerhaft, weil…', required: true, multiline: true },
    ],
    content: `[VORNAME_NACHNAME]
[STRASSE_HAUSNUMMER]
[PLZ_ORT]

An das
[JOBCENTER_NAME]
[JOBCENTER_ADRESSE]

[ORT_DATUM]

Betreff: Widerspruch nach § 78 SGG gegen Bescheid vom [BESCHEIDDATUM]
         Kunden-Nr.: [KUNDENNUMMER]

Sehr geehrte Damen und Herren,

hiermit erhebe ich gegen Ihren Bescheid vom [BESCHEIDDATUM]
(Kunden-Nr.: [KUNDENNUMMER]) fristgerecht Widerspruch nach § 78 SGG.

Begründung:
[BEGRUENDUNG]

Ich beantrage:
1. Den angefochtenen Bescheid aufzuheben und die Leistungen in voller gesetzlicher
   Höhe zu bewilligen.
2. Gemäß § 86a SGG die aufschiebende Wirkung des Widerspruchs anzuerkennen.

Bitte bestätigen Sie den Eingang dieses Widerspruchs schriftlich. Ich weise darauf
hin, dass das Widerspruchsverfahren nach § 184 SGG kostenfrei ist.

Mit freundlichen Grüßen

[VORNAME_NACHNAME]

Anlage: Kopie des angefochtenen Bescheids`,
  },

  'rente-widerspruch': {
    id: 'rente-widerspruch',
    titleDE: 'Widerspruch Rentenbescheid',
    titleEN: 'Pension Notice Objection',
    descDE: 'Widerspruch gegen fehlerhafte Rentenberechnungen der Deutsche Rentenversicherung.',
    descEN: 'Dispute incorrect pension calculations from Deutsche Rentenversicherung.',
    slug: 'rente',
    law: '§ 78 SGG',
    deadlineDE: '1 Monat',
    deadlineEN: '1 month',
    placeholders: [
      ...SENDER,
      { key: 'RV_STELLE', labelDE: 'Rentenversicherungsträger', labelEN: 'Pension insurer', placeholderDE: 'Deutsche Rentenversicherung Bund', required: true },
      { key: 'RV_ADRESSE', labelDE: 'Adresse des Trägers', labelEN: 'Insurer address', placeholderDE: '10704 Berlin', required: true },
      { key: 'BESCHEIDDATUM', labelDE: 'Datum des Rentenbescheids', labelEN: 'Decision date', placeholderDE: '01.03.2026', required: true },
      { key: 'VERSICHERUNGSNUMMER', labelDE: 'Rentenversicherungsnummer', labelEN: 'Insurance number', placeholderDE: '12 345678 A 789', required: true },
      { key: 'BEGRUENDUNG', labelDE: 'Begründung (fehlende Versicherungszeiten, falsche Rentenpunkte etc.)', labelEN: 'Grounds', placeholderDE: 'Die Rentenberechnung ist fehlerhaft, da folgende Zeiten nicht berücksichtigt wurden…', required: true, multiline: true },
    ],
    content: `[VORNAME_NACHNAME]
[STRASSE_HAUSNUMMER]
[PLZ_ORT]
Rentenversicherungsnr.: [VERSICHERUNGSNUMMER]

An die
[RV_STELLE]
[RV_ADRESSE]

[ORT_DATUM]

Betreff: Widerspruch nach § 78 SGG gegen Rentenbescheid vom [BESCHEIDDATUM]
         Versicherungsnummer: [VERSICHERUNGSNUMMER]

Sehr geehrte Damen und Herren,

hiermit erhebe ich gegen Ihren Rentenbescheid vom [BESCHEIDDATUM]
fristgerecht Widerspruch nach § 78 SGG.

Begründung:
[BEGRUENDUNG]

Die fehlerhafte Berechnung führt zu einer zu niedrigen Rente, was meinen
gesetzlichen Ansprüchen widerspricht.

Ich beantrage:
1. Den Rentenbescheid aufzuheben und die Rente unter Berücksichtigung aller
   anspruchsbegründenden Versicherungszeiten und Entgeltpunkte neu festzusetzen.
2. Die Nachzahlung der Differenz rückwirkend ab Rentenbeginn.

Mit freundlichen Grüßen

[VORNAME_NACHNAME]

Anlage: Kopie des Rentenbescheids, Nachweise über fehlende Versicherungszeiten`,
  },

  'krankenkasse-widerspruch': {
    id: 'krankenkasse-widerspruch',
    titleDE: 'Widerspruch Krankenkasse (Leistungsablehnung)',
    titleEN: 'Health Insurance Coverage Objection',
    descDE: 'Widerspruch gegen Ablehnung von Medikamenten, Therapien oder Hilfsmitteln.',
    descEN: 'Challenge your GKV insurer\'s refusal to cover medication, therapy, or medical aids.',
    slug: 'krankenversicherung',
    law: '§ 78 SGG, § 12 SGB V',
    deadlineDE: '1 Monat',
    deadlineEN: '1 month',
    placeholders: [
      ...SENDER,
      { key: 'KRANKENKASSE_NAME', labelDE: 'Name der Krankenkasse', labelEN: 'Health insurer name', placeholderDE: 'AOK Berlin', required: true },
      { key: 'KK_ADRESSE', labelDE: 'Adresse der Krankenkasse', labelEN: 'Insurer address', placeholderDE: 'Musterstraße 1, 10117 Berlin', required: true },
      { key: 'BESCHEIDDATUM', labelDE: 'Datum des Ablehnungsbescheids', labelEN: 'Rejection date', placeholderDE: '01.03.2026', required: true },
      { key: 'VERSICHERTENNUMMER', labelDE: 'Versichertennummer', labelEN: 'Insurance number', placeholderDE: 'A123456789', required: true },
      { key: 'LEISTUNG', labelDE: 'Abgelehnte Leistung', labelEN: 'Rejected treatment/medication', placeholderDE: 'Physiotherapie (20 Einheiten) / Medikament XY / Hilfsmittel XY', required: true },
      { key: 'BEGRUENDUNG', labelDE: 'Begründung des Widerspruchs', labelEN: 'Grounds', placeholderDE: 'Die Ablehnung ist nicht gerechtfertigt, weil die Leistung medizinisch notwendig ist…', required: true, multiline: true },
    ],
    content: `[VORNAME_NACHNAME]
[STRASSE_HAUSNUMMER]
[PLZ_ORT]
Versichertennr.: [VERSICHERTENNUMMER]

An die
[KRANKENKASSE_NAME]
[KK_ADRESSE]

[ORT_DATUM]

Betreff: Widerspruch nach § 78 SGG gegen Ablehnungsbescheid vom [BESCHEIDDATUM]
         Versichertennummer: [VERSICHERTENNUMMER]
         Abgelehnte Leistung: [LEISTUNG]

Sehr geehrte Damen und Herren,

hiermit erhebe ich gegen Ihren Bescheid vom [BESCHEIDDATUM], mit dem Sie die
Übernahme der Kosten für [LEISTUNG] abgelehnt haben, fristgerecht Widerspruch
nach § 78 SGG.

Begründung:
[BEGRUENDUNG]

Gemäß § 12 Abs. 1 SGB V haben Versicherte Anspruch auf alle medizinisch notwendigen
Leistungen. Ich verweise zudem auf § 13 Abs. 3a SGB V, wonach Sie verpflichtet sind,
innerhalb von 3 Wochen (bei Einschaltung des MDK: 5 Wochen) zu entscheiden.

Ich beantrage:
1. Den Ablehnungsbescheid aufzuheben und die Leistung [LEISTUNG] zu genehmigen.
2. Eine Entscheidung innerhalb der gesetzlichen Frist nach § 13 Abs. 3a SGB V.

Mit freundlichen Grüßen

[VORNAME_NACHNAME]

Anlage: Ärztliche Verordnung / Attest, Kopie des Ablehnungsbescheids`,
  },

  'pflegegrad-widerspruch': {
    id: 'pflegegrad-widerspruch',
    titleDE: 'Widerspruch Pflegegrad-Einstufung',
    titleEN: 'Nursing Care Level Objection',
    descDE: 'Widerspruch gegen fehlerhafte Pflegegrad-Einstufung durch MDK oder Medicproof.',
    descEN: 'Object to incorrect nursing care level assessment by MDK or Medicproof.',
    slug: 'krankenversicherung',
    law: '§ 78 SGG, § 15 SGB XI',
    deadlineDE: '1 Monat',
    deadlineEN: '1 month',
    placeholders: [
      ...SENDER,
      { key: 'PFLEGEKASSE_NAME', labelDE: 'Name der Pflegekasse', labelEN: 'Care insurer name', placeholderDE: 'AOK Pflegekasse Berlin', required: true },
      { key: 'PK_ADRESSE', labelDE: 'Adresse der Pflegekasse', labelEN: 'Care insurer address', placeholderDE: 'Musterstraße 1, 10117 Berlin', required: true },
      { key: 'BESCHEIDDATUM', labelDE: 'Datum des Einstufungsbescheids', labelEN: 'Assessment date', placeholderDE: '01.03.2026', required: true },
      { key: 'VERSICHERTENNUMMER', labelDE: 'Versichertennummer', labelEN: 'Insurance number', placeholderDE: 'A123456789', required: true },
      { key: 'ZUGETEILTER_PFLEGEGRAD', labelDE: 'Zugeteilter Pflegegrad', labelEN: 'Assigned care level', placeholderDE: 'Pflegegrad 2', required: true },
      { key: 'BEANTRAGTER_PFLEGEGRAD', labelDE: 'Beantragter Pflegegrad', labelEN: 'Requested care level', placeholderDE: 'Pflegegrad 3', required: true },
      { key: 'BEGRUENDUNG', labelDE: 'Begründung (Einschränkungen, Pflegeaufwand, MDK-Fehler)', labelEN: 'Grounds', placeholderDE: 'Die Einstufung ist zu niedrig, da folgende Einschränkungen nicht berücksichtigt wurden…', required: true, multiline: true },
    ],
    content: `[VORNAME_NACHNAME]
[STRASSE_HAUSNUMMER]
[PLZ_ORT]
Versichertennr.: [VERSICHERTENNUMMER]

An die
[PFLEGEKASSE_NAME]
[PK_ADRESSE]

[ORT_DATUM]

Betreff: Widerspruch nach § 78 SGG gegen Einstufungsbescheid vom [BESCHEIDDATUM]
         Versichertennummer: [VERSICHERTENNUMMER]
         Aktueller Pflegegrad: [ZUGETEILTER_PFLEGEGRAD] — beantragt: [BEANTRAGTER_PFLEGEGRAD]

Sehr geehrte Damen und Herren,

hiermit erhebe ich gegen den Bescheid vom [BESCHEIDDATUM], in dem mir
[ZUGETEILTER_PFLEGEGRAD] zuerkannt wurde, fristgerecht Widerspruch nach § 78 SGG.

Begründung:
[BEGRUENDUNG]

Gemäß § 15 SGB XI ist die Pflegebedürftigkeit unter Berücksichtigung aller
Beeinträchtigungen der Selbstständigkeit sowie der kognitiven und kommunikativen
Fähigkeiten zu bewerten. Das Gutachten hat wesentliche Einschränkungen unberücksichtigt
gelassen.

Ich beantrage:
1. Den Einstufungsbescheid aufzuheben und [BEANTRAGTER_PFLEGEGRAD] zuzuerkennen.
2. Die Einholung eines neuen Gutachtens durch einen anderen Gutachter gemäß § 18 SGB XI.

Mit freundlichen Grüßen

[VORNAME_NACHNAME]

Anlage: Ärztliche Atteste, Pflegetagebuch, Kopie des MDK-Gutachtens`,
  },

  'elterngeld-widerspruch': {
    id: 'elterngeld-widerspruch',
    titleDE: 'Widerspruch Elterngeld / Kindergeld',
    titleEN: 'Parental / Child Benefit Objection',
    descDE: 'Widerspruch gegen fehlerhafte Berechnung oder Ablehnung von Elterngeld oder Kindergeld.',
    descEN: 'Challenge incorrect Elterngeld or Kindergeld calculation or rejection.',
    slug: 'jobcenter',
    law: '§§ 1–4 BEEG, § 67 EStG',
    deadlineDE: '1 Monat',
    deadlineEN: '1 month',
    placeholders: [
      ...SENDER,
      { key: 'BEHOERDE_NAME', labelDE: 'Zuständige Behörde', labelEN: 'Responsible authority', placeholderDE: 'Elterngeldstelle Berlin / Familienkasse Berlin', required: true },
      { key: 'BEHOERDE_ADRESSE', labelDE: 'Adresse der Behörde', labelEN: 'Authority address', placeholderDE: 'Musterstraße 1, 10117 Berlin', required: true },
      { key: 'BESCHEIDDATUM', labelDE: 'Datum des Bescheids', labelEN: 'Decision date', placeholderDE: '01.03.2026', required: true },
      { key: 'AKTENZEICHEN', labelDE: 'Aktenzeichen / Bescheidnummer', labelEN: 'Reference number', placeholderDE: 'EG-2026/12345', required: true },
      { key: 'LEISTUNGSART', labelDE: 'Art der Leistung', labelEN: 'Type of benefit', placeholderDE: 'Elterngeld / ElterngeldPlus / Kindergeld', required: true },
      { key: 'BEGRUENDUNG', labelDE: 'Begründung des Widerspruchs', labelEN: 'Grounds', placeholderDE: 'Die Einkommensberechnung ist fehlerhaft, da…', required: true, multiline: true },
    ],
    content: `[VORNAME_NACHNAME]
[STRASSE_HAUSNUMMER]
[PLZ_ORT]

An die
[BEHOERDE_NAME]
[BEHOERDE_ADRESSE]

[ORT_DATUM]

Betreff: Widerspruch gegen Bescheid vom [BESCHEIDDATUM]
         Aktenzeichen: [AKTENZEICHEN]
         Leistungsart: [LEISTUNGSART]

Sehr geehrte Damen und Herren,

hiermit erhebe ich gegen Ihren Bescheid vom [BESCHEIDDATUM] (Az. [AKTENZEICHEN])
betreffend [LEISTUNGSART] fristgerecht Widerspruch.

Begründung:
[BEGRUENDUNG]

Ich beantrage:
1. Den angefochtenen Bescheid aufzuheben und [LEISTUNGSART] in gesetzlicher Höhe
   neu festzusetzen.
2. Rückwirkende Nachzahlung der Differenz.

Mit freundlichen Grüßen

[VORNAME_NACHNAME]

Anlage: Einkommensnachweise, Kopie des angefochtenen Bescheids`,
  },

  'kuendigung-widerspruch': {
    id: 'kuendigung-widerspruch',
    titleDE: 'Widerspruch Kündigung (Kündigungsschutz)',
    titleEN: 'Dismissal Objection',
    descDE: 'Widerspruch gegen sozialwidrige oder formell fehlerhafte Kündigung nach § 4 KSchG.',
    descEN: 'Object to unfair or procedurally defective dismissal under § 4 KSchG.',
    slug: 'kuendigung',
    law: '§ 4 KSchG',
    deadlineDE: '3 Wochen',
    deadlineEN: '3 weeks',
    placeholders: [
      ...SENDER,
      { key: 'ARBEITGEBER_NAME', labelDE: 'Name des Arbeitgebers / Unternehmens', labelEN: 'Employer name', placeholderDE: 'Musterfirma GmbH', required: true },
      { key: 'ARBEITGEBER_ADRESSE', labelDE: 'Adresse des Arbeitgebers', labelEN: 'Employer address', placeholderDE: 'Gewerbestraße 1, 10115 Berlin', required: true },
      { key: 'KUENDIGUNGSDATUM', labelDE: 'Datum der Kündigung', labelEN: 'Dismissal date', placeholderDE: '01.03.2026', required: true },
      { key: 'BESCHAEFTIGUNGSBEGINN', labelDE: 'Beginn des Arbeitsverhältnisses', labelEN: 'Employment start date', placeholderDE: '01.01.2020', required: true },
      { key: 'BEGRUENDUNG', labelDE: 'Gründe für die Unwirksamkeit der Kündigung', labelEN: 'Grounds for invalidity', placeholderDE: 'Die Kündigung ist sozialwidrig, da kein sachlicher Grund vorliegt. Außerdem war der Betriebsrat nicht ordnungsgemäß angehört worden…', required: true, multiline: true },
    ],
    content: `[VORNAME_NACHNAME]
[STRASSE_HAUSNUMMER]
[PLZ_ORT]

An
[ARBEITGEBER_NAME]
[ARBEITGEBER_ADRESSE]

[ORT_DATUM]

Betreff: Widerspruch gegen Kündigung vom [KUENDIGUNGSDATUM]
         Arbeitsverhältnis seit: [BESCHAEFTIGUNGSBEGINN]

Sehr geehrte Damen und Herren,

hiermit widerspreche ich der mir mit Schreiben vom [KUENDIGUNGSDATUM]
ausgesprochenen Kündigung und erkläre diese für unwirksam.

Begründung:
[BEGRUENDUNG]

Ich fordere Sie auf, die Kündigung zurückzunehmen und das Arbeitsverhältnis
fortzuführen.

Bitte beachten Sie: Ich behalte mir vor, innerhalb der Klagefrist von 3 Wochen
gemäß § 4 KSchG Kündigungsschutzklage beim zuständigen Arbeitsgericht einzureichen,
falls keine gütliche Einigung erzielt wird.

Mit freundlichen Grüßen

[VORNAME_NACHNAME]

Anlage: Kopie der Kündigung`,
  },

  'mieterhöhung-widerspruch': {
    id: 'mieterhöhung-widerspruch',
    titleDE: 'Widerspruch Mieterhöhung',
    titleEN: 'Rent Increase Objection',
    descDE: 'Widerspruch gegen Mieterhöhungen über die ortsübliche Vergleichsmiete oder die Kappungsgrenze.',
    descEN: 'Challenge unjustified rent increases above the local reference rent or the 20% cap.',
    slug: 'miete',
    law: '§§ 558–558e BGB',
    deadlineDE: '2 Monate',
    deadlineEN: '2 months',
    placeholders: [
      ...SENDER,
      { key: 'VERMIETER_NAME', labelDE: 'Name des Vermieters / der Hausverwaltung', labelEN: 'Landlord name', placeholderDE: 'Max Vermieter / Hausverwaltung XY GmbH', required: true },
      { key: 'VERMIETER_ADRESSE', labelDE: 'Adresse des Vermieters', labelEN: 'Landlord address', placeholderDE: 'Vermieterstraße 1, 10115 Berlin', required: true },
      { key: 'ERHOEHUNGSDATUM', labelDE: 'Datum des Mieterhöhungsschreibens', labelEN: 'Rent increase letter date', placeholderDE: '01.03.2026', required: true },
      { key: 'AKTUELLE_MIETE', labelDE: 'Aktuelle Kaltmiete (€)', labelEN: 'Current rent (€)', placeholderDE: '850,00 €', required: true },
      { key: 'NEUE_MIETE', labelDE: 'Geforderte neue Kaltmiete (€)', labelEN: 'Demanded new rent (€)', placeholderDE: '1.050,00 €', required: true },
      { key: 'BEGRUENDUNG', labelDE: 'Begründung des Widerspruchs', labelEN: 'Grounds', placeholderDE: 'Die geforderte Miete überschreitet die ortsübliche Vergleichsmiete laut Mietspiegel 2025…', required: true, multiline: true },
    ],
    content: `[VORNAME_NACHNAME]
[STRASSE_HAUSNUMMER]
[PLZ_ORT]

An
[VERMIETER_NAME]
[VERMIETER_ADRESSE]

[ORT_DATUM]

Betreff: Widerspruch gegen Mieterhöhungsverlangen vom [ERHOEHUNGSDATUM]
         Mietobjekt: [STRASSE_HAUSNUMMER], [PLZ_ORT]
         Bisherige Miete: [AKTUELLE_MIETE] | Gefordert: [NEUE_MIETE]

Sehr geehrte Damen und Herren,

hiermit widerspreche ich Ihrem Mieterhöhungsverlangen vom [ERHOEHUNGSDATUM]
und stimme der Erhöhung der Kaltmiete auf [NEUE_MIETE] nicht zu.

Begründung:
[BEGRUENDUNG]

Gemäß §§ 558 ff. BGB ist eine Mieterhöhung nur bis zur ortsüblichen Vergleichsmiete
und unter Beachtung der Kappungsgrenze (§ 558 Abs. 3 BGB: max. 15 % bzw. 20 % in
3 Jahren) zulässig. Die geforderte Erhöhung übersteigt das rechtlich zulässige Maß.

Ich bin bereit, einer Erhöhung im gesetzlich zulässigen Rahmen zuzustimmen, nicht
jedoch der hier verlangten Erhöhung.

Mit freundlichen Grüßen

[VORNAME_NACHNAME]`,
  },

  'nebenkosten-widerspruch': {
    id: 'nebenkosten-widerspruch',
    titleDE: 'Widerspruch Nebenkostenabrechnung',
    titleEN: 'Ancillary Cost Statement Objection',
    descDE: 'Widerspruch gegen fehlerhafte Betriebskosten­abrechnung.',
    descEN: 'Contest incorrect utility cost statements.',
    slug: 'miete',
    law: '§ 556 BGB, BetrKV',
    deadlineDE: '12 Monate',
    deadlineEN: '12 months',
    placeholders: [
      ...SENDER,
      { key: 'VERMIETER_NAME', labelDE: 'Name des Vermieters / der Hausverwaltung', labelEN: 'Landlord name', placeholderDE: 'Max Vermieter / Hausverwaltung XY GmbH', required: true },
      { key: 'VERMIETER_ADRESSE', labelDE: 'Adresse des Vermieters', labelEN: 'Landlord address', placeholderDE: 'Vermieterstraße 1, 10115 Berlin', required: true },
      { key: 'ABRECHNUNGSZEITRAUM', labelDE: 'Abrechnungszeitraum', labelEN: 'Billing period', placeholderDE: '01.01.2025 – 31.12.2025', required: true },
      { key: 'NACHFORDERUNG', labelDE: 'Nachforderungsbetrag (€)', labelEN: 'Additional demand (€)', placeholderDE: '450,00 €', required: true },
      { key: 'BEGRUENDUNG', labelDE: 'Fehler in der Abrechnung', labelEN: 'Errors in the statement', placeholderDE: 'Die Abrechnung enthält nicht umlagefähige Kosten (z.B. Instandhaltung nach § 1 Abs. 2 BetrKV)…', required: true, multiline: true },
    ],
    content: `[VORNAME_NACHNAME]
[STRASSE_HAUSNUMMER]
[PLZ_ORT]

An
[VERMIETER_NAME]
[VERMIETER_ADRESSE]

[ORT_DATUM]

Betreff: Widerspruch gegen Betriebskostenabrechnung [ABRECHNUNGSZEITRAUM]
         Mietobjekt: [STRASSE_HAUSNUMMER], [PLZ_ORT]

Sehr geehrte Damen und Herren,

hiermit widerspreche ich der Betriebskostenabrechnung für den Zeitraum
[ABRECHNUNGSZEITRAUM] und weise die Nachforderung von [NACHFORDERUNG] zurück.

Begründung:
[BEGRUENDUNG]

Gemäß § 556 BGB und der Betriebskostenverordnung (BetrKV) sind nur die dort
ausdrücklich genannten Kostenarten umlagefähig. Ich behalte mir das Recht auf
Einsichtnahme in alle Originalbelege nach § 259 BGB vor.

Ich bitte um:
1. Korrektur der Abrechnung und Übersendung einer berichtigten Fassung.
2. Belegvorlage aller in der Abrechnung enthaltenen Kostenpositionen.

Bis zur Klärung zahle ich den strittigen Betrag ausdrücklich unter Vorbehalt.

Mit freundlichen Grüßen

[VORNAME_NACHNAME]`,
  },

  'maengelanzeige': {
    id: 'maengelanzeige',
    titleDE: 'Mängelanzeige an Vermieter',
    titleEN: 'Defect Notice to Landlord',
    descDE: 'Formelle Mängelanzeige mit Fristsetzung und Hinweis auf Mietminderungsrecht.',
    descEN: 'Formal defect notice with repair deadline and reference to rent reduction rights.',
    slug: 'miete',
    law: '§§ 535, 536 BGB',
    deadlineDE: 'Sofort',
    deadlineEN: 'Immediately',
    placeholders: [
      ...SENDER,
      { key: 'VERMIETER_NAME', labelDE: 'Name des Vermieters / der Hausverwaltung', labelEN: 'Landlord name', placeholderDE: 'Max Vermieter / Hausverwaltung XY GmbH', required: true },
      { key: 'VERMIETER_ADRESSE', labelDE: 'Adresse des Vermieters', labelEN: 'Landlord address', placeholderDE: 'Vermieterstraße 1, 10115 Berlin', required: true },
      { key: 'MAENGELBESCHREIBUNG', labelDE: 'Beschreibung der Mängel', labelEN: 'Defect description', placeholderDE: 'Schimmelflecken im Badezimmer (ca. 0,5 m²), Heizung im Schlafzimmer seit 3 Tagen ausgefallen', required: true, multiline: true },
      { key: 'FRIST', labelDE: 'Frist zur Beseitigung', labelEN: 'Repair deadline', placeholderDE: '14 Tage (bis zum 15.04.2026)', required: true },
    ],
    content: `[VORNAME_NACHNAME]
[STRASSE_HAUSNUMMER]
[PLZ_ORT]

An
[VERMIETER_NAME]
[VERMIETER_ADRESSE]

[ORT_DATUM]

Betreff: Mängelanzeige gemäß § 536 BGB und Fristsetzung zur Beseitigung
         Mietobjekt: [STRASSE_HAUSNUMMER], [PLZ_ORT]

Sehr geehrte Damen und Herren,

hiermit zeige ich folgende Mängel an der Mietsache an:

[MAENGELBESCHREIBUNG]

Ich setze Ihnen hiermit eine Frist zur Beseitigung der genannten Mängel bis zum
Ablauf von [FRIST].

Rechtsfolgen bei Fristüberschreitung:
- Ich bin berechtigt, die Miete gemäß § 536 BGB angemessen zu mindern.
- Ich behalte mir vor, die Mängel auf Ihre Kosten durch einen Fachbetrieb beheben
  zu lassen (§ 536a Abs. 2 BGB).
- Schadensersatzansprüche werden ausdrücklich vorbehalten.

Bitte bestätigen Sie den Eingang dieser Mängelanzeige und teilen Sie mir
einen Beseitigungstermin mit.

Mit freundlichen Grüßen

[VORNAME_NACHNAME]

Anlage: Fotodokumentation der Mängel`,
  },

  'bussgeld-einspruch': {
    id: 'bussgeld-einspruch',
    titleDE: 'Einspruch Bußgeldbescheid (Verkehr)',
    titleEN: 'Traffic Fine Objection',
    descDE: 'Einspruch gegen Bußgeldbescheid bei Verkehrsverstößen nach § 67 OWiG.',
    descEN: 'Challenge speed camera fines and parking tickets under § 67 OWiG.',
    slug: 'bussgeld',
    law: '§ 67 OWiG',
    deadlineDE: '2 Wochen',
    deadlineEN: '2 weeks',
    placeholders: [
      ...SENDER,
      { key: 'BEHOERDE_NAME', labelDE: 'Ausstellende Bußgeldbehörde', labelEN: 'Issuing authority', placeholderDE: 'Bußgeldstelle Berlin / Ordnungsamt Mitte', required: true },
      { key: 'BEHOERDE_ADRESSE', labelDE: 'Adresse der Behörde', labelEN: 'Authority address', placeholderDE: 'Bußgeldstraße 1, 10117 Berlin', required: true },
      { key: 'BESCHEIDDATUM', labelDE: 'Datum des Bußgeldbescheids', labelEN: 'Fine notice date', placeholderDE: '01.03.2026', required: true },
      { key: 'AKTENZEICHEN', labelDE: 'Aktenzeichen', labelEN: 'Reference number', placeholderDE: 'OWi-12345/26', required: true },
      { key: 'TATVORWURF', labelDE: 'Vorgeworfener Verstoß', labelEN: 'Alleged violation', placeholderDE: 'Überschreitung der zulässigen Höchstgeschwindigkeit um 21 km/h', required: true },
      { key: 'BEGRUENDUNG', labelDE: 'Begründung des Einspruchs', labelEN: 'Grounds for objection', placeholderDE: 'Ich bestreite den Vorwurf. Das Messergebnis ist fehlerhaft, da der Eichnachweis abgelaufen war…', required: true, multiline: true },
    ],
    content: `[VORNAME_NACHNAME]
[STRASSE_HAUSNUMMER]
[PLZ_ORT]

An die
[BEHOERDE_NAME]
[BEHOERDE_ADRESSE]

[ORT_DATUM]

Betreff: Einspruch nach § 67 OWiG gegen Bußgeldbescheid vom [BESCHEIDDATUM]
         Aktenzeichen: [AKTENZEICHEN]

Sehr geehrte Damen und Herren,

hiermit lege ich gegen den Bußgeldbescheid vom [BESCHEIDDATUM] (Az. [AKTENZEICHEN])
wegen des Vorwurfs „[TATVORWURF]" fristgerecht Einspruch nach § 67 OWiG ein.

Begründung:
[BEGRUENDUNG]

Ich beantrage:
1. Den Bußgeldbescheid aufzuheben.
2. Akteneinsicht gemäß § 49 OWiG, insbesondere in die Messprotokolle, den
   Eichschein des Messgeräts sowie alle Fotounterlagen.

Ich werde den Einspruch nach Gewährung der Akteneinsicht gegebenenfalls
weiter begründen.

Mit freundlichen Grüßen

[VORNAME_NACHNAME]`,
  },

  'ruecktritt-kaufvertrag': {
    id: 'ruecktritt-kaufvertrag',
    titleDE: 'Rücktritt Kaufvertrag (Mangel)',
    titleEN: 'Contract Withdrawal (Defective Goods)',
    descDE: 'Rücktritt vom Kaufvertrag nach fehlgeschlagener Nachbesserung nach §§ 437, 440 BGB.',
    descEN: 'Withdraw from a purchase contract due to defects after failed repair attempts.',
    slug: 'jobcenter',
    law: '§§ 437, 440 BGB',
    deadlineDE: '2 Jahre',
    deadlineEN: '2 years',
    placeholders: [
      ...SENDER,
      { key: 'VERKAEUFER_NAME', labelDE: 'Name des Verkäufers / Händlers', labelEN: 'Seller name', placeholderDE: 'Muster Autohaus GmbH', required: true },
      { key: 'VERKAEUFER_ADRESSE', labelDE: 'Adresse des Verkäufers', labelEN: 'Seller address', placeholderDE: 'Händlerstraße 1, 10115 Berlin', required: true },
      { key: 'KAUFDATUM', labelDE: 'Datum des Kaufs', labelEN: 'Purchase date', placeholderDE: '01.01.2026', required: true },
      { key: 'KAUFGEGENSTAND', labelDE: 'Gekaufte Ware', labelEN: 'Purchased item', placeholderDE: 'Pkw VW Golf, Modell 2024', required: true },
      { key: 'KAUFPREIS', labelDE: 'Kaufpreis (€)', labelEN: 'Purchase price (€)', placeholderDE: '15.000,00 €', required: true },
      { key: 'MANGELBESCHREIBUNG', labelDE: 'Beschreibung des Mangels und fehlgeschlagener Reparaturversuche', labelEN: 'Defect and failed repair attempts', placeholderDE: 'Motorgeräusche seit Lieferung, trotz zweimaliger Werkstattbesichtigung (01.02. und 15.02.2026) nicht behoben', required: true, multiline: true },
    ],
    content: `[VORNAME_NACHNAME]
[STRASSE_HAUSNUMMER]
[PLZ_ORT]

An
[VERKAEUFER_NAME]
[VERKAEUFER_ADRESSE]

[ORT_DATUM]

Betreff: Rücktritt vom Kaufvertrag gemäß §§ 437 Nr. 2, 440, 323 BGB
         Kaufgegenstand: [KAUFGEGENSTAND]
         Kaufdatum: [KAUFDATUM] | Kaufpreis: [KAUFPREIS]

Sehr geehrte Damen und Herren,

hiermit erkläre ich den Rücktritt vom Kaufvertrag über [KAUFGEGENSTAND]
vom [KAUFDATUM] gemäß §§ 437 Nr. 2, 440, 323 BGB.

Mangel und fehlgeschlagene Nacherfüllung:
[MANGELBESCHREIBUNG]

Gemäß § 440 BGB ist die Nacherfüllung als fehlgeschlagen zu betrachten. Das
Rücktrittsrecht nach § 437 Nr. 2 BGB steht mir daher uneingeschränkt zu.

Ich fordere Sie auf, binnen 14 Tagen:
1. Den Kaufpreis von [KAUFPREIS] zu erstatten — Zug um Zug gegen Rückgabe
   des Kaufgegenstands.
2. Mir einen Abholtermin zu benennen.

Sollten Sie die Frist nicht einhalten, werde ich ohne weitere Ankündigung
gerichtliche Schritte einleiten. Die damit verbundenen Kosten gehen zu Ihren Lasten.

Mit freundlichen Grüßen

[VORNAME_NACHNAME]

Anlage: Kaufvertrag, Reparaturnachweise`,
  },

  'gez-widerspruch': {
    id: 'gez-widerspruch',
    titleDE: 'Widerspruch Rundfunkbeitrag (GEZ/ARD-ZDF)',
    titleEN: 'Broadcasting Fee Objection',
    descDE: 'Widerspruch gegen fehlerhafte Rundfunkbeitragsbescheide oder Doppelveranlagung.',
    descEN: 'Object to broadcasting fee assessments with incorrect billing or duplicate charges.',
    slug: 'jobcenter',
    law: '§ 9 RBStV',
    deadlineDE: '1 Monat',
    deadlineEN: '1 month',
    placeholders: [
      ...SENDER,
      { key: 'BEITRAGSNUMMER', labelDE: 'Beitragsnummer', labelEN: 'Contribution number', placeholderDE: 'Z 123 456 789', required: true },
      { key: 'BESCHEIDDATUM', labelDE: 'Datum des Bescheids', labelEN: 'Notice date', placeholderDE: '01.03.2026', required: true },
      { key: 'BEGRUENDUNG', labelDE: 'Begründung des Widerspruchs', labelEN: 'Grounds', placeholderDE: 'Ich bin Empfänger von Bürgergeld und damit befreiungsberechtigt nach § 4 RBStV / Doppelveranlagung ist unzulässig, da ich bereits unter Beitragsnummer XY gemeldet bin…', required: true, multiline: true },
    ],
    content: `[VORNAME_NACHNAME]
[STRASSE_HAUSNUMMER]
[PLZ_ORT]
Beitragsnr.: [BEITRAGSNUMMER]

An den
ARD ZDF Deutschlandradio Beitragsservice
50452 Köln

[ORT_DATUM]

Betreff: Widerspruch nach § 9 RBStV gegen Bescheid vom [BESCHEIDDATUM]
         Beitragsnummer: [BEITRAGSNUMMER]

Sehr geehrte Damen und Herren,

hiermit erhebe ich gegen Ihren Bescheid vom [BESCHEIDDATUM]
fristgerecht Widerspruch.

Begründung:
[BEGRUENDUNG]

Ich beantrage:
1. Den angefochtenen Bescheid aufzuheben.
2. Die sofortige Korrektur der Beitragsveranlagung sowie ggf. Rückerstattung
   zu Unrecht gezahlter Beträge.

Bitte bestätigen Sie den Eingang dieses Widerspruchs schriftlich.

Mit freundlichen Grüßen

[VORNAME_NACHNAME]

Anlage: Befreiungsnachweis / Nachweise zur Doppelveranlagung`,
  },

  'akteneinsicht': {
    id: 'akteneinsicht',
    titleDE: 'Antrag auf Akteneinsicht',
    titleEN: 'Request for File Access',
    descDE: 'Formeller Antrag auf Einsicht in die Verwaltungsakte nach § 29 VwVfG.',
    descEN: 'Formal request to inspect your administrative file under § 29 VwVfG.',
    slug: 'tax',
    law: '§ 29 VwVfG, § 25 SGB X',
    deadlineDE: 'Jederzeit',
    deadlineEN: 'Anytime',
    placeholders: [
      ...SENDER,
      { key: 'BEHOERDE_NAME', labelDE: 'Zuständige Behörde', labelEN: 'Responsible authority', placeholderDE: 'Finanzamt Berlin Mitte / Jobcenter Berlin Mitte', required: true },
      { key: 'BEHOERDE_ADRESSE', labelDE: 'Adresse der Behörde', labelEN: 'Authority address', placeholderDE: 'Amtsstraße 1, 10117 Berlin', required: true },
      { key: 'AKTENZEICHEN', labelDE: 'Aktenzeichen / Steuernummer / Kundennummer', labelEN: 'Reference number', placeholderDE: '12/345/67890', required: true },
      { key: 'VERFAHREN', labelDE: 'Betreffendes Verfahren / Bescheid', labelEN: 'Relevant proceeding', placeholderDE: 'Einkommensteuer 2024 / Bürgergeld-Bescheid vom 01.03.2026', required: true },
    ],
    content: `[VORNAME_NACHNAME]
[STRASSE_HAUSNUMMER]
[PLZ_ORT]

An die
[BEHOERDE_NAME]
[BEHOERDE_ADRESSE]

[ORT_DATUM]

Betreff: Antrag auf Akteneinsicht nach § 29 VwVfG / § 25 SGB X
         Aktenzeichen: [AKTENZEICHEN]
         Verfahren: [VERFAHREN]

Sehr geehrte Damen und Herren,

ich bin Beteiligter im oben genannten Verwaltungsverfahren und beantrage
Einsicht in die vollständige Verfahrensakte nach § 29 VwVfG (ggf. § 25 SGB X).

Ich bitte um Mitteilung, wann und wo die Unterlagen eingesehen werden können,
oder alternativ um Übersendung von Kopien der wesentlichen Dokumente.

Insbesondere erbitte ich Einsicht in:
- Alle Bescheide und behördlichen Entscheidungen im Verfahren
- Interne Vermerke, Berechnungsgrundlagen und Gutachten
- Eingereichte Unterlagen und Nachweise
- Schriftverkehr mit Dritten im Rahmen des Verfahrens

Das Recht auf Akteneinsicht ist ein rechtsstaatliches Grundrecht und dient der
Vorbereitung eines etwaigen Rechtsmittels.

Mit freundlichen Grüßen

[VORNAME_NACHNAME]`,
  },

  'zahlungsaufforderung': {
    id: 'zahlungsaufforderung',
    titleDE: 'Mahnung / Zahlungsaufforderung',
    titleEN: 'Payment Demand / Formal Notice',
    descDE: 'Professionelle Mahnung mit Verzugszinsen nach § 288 BGB und Fristsetzung.',
    descEN: 'Professional payment reminder with interest claim under § 288 BGB.',
    slug: 'tax',
    law: '§§ 286, 288 BGB',
    deadlineDE: 'Sofort',
    deadlineEN: 'Immediately',
    placeholders: [
      ...SENDER,
      { key: 'SCHULDNER_NAME', labelDE: 'Name des Schuldners', labelEN: 'Debtor name', placeholderDE: 'Max Schuldner', required: true },
      { key: 'SCHULDNER_ADRESSE', labelDE: 'Adresse des Schuldners', labelEN: 'Debtor address', placeholderDE: 'Schuldenstraße 1, 10115 Berlin', required: true },
      { key: 'FORDERUNGSBETRAG', labelDE: 'Offener Betrag (€)', labelEN: 'Outstanding amount (€)', placeholderDE: '1.250,00 €', required: true },
      { key: 'FAELLIGKEITSDATUM', labelDE: 'Ursprüngliches Fälligkeitsdatum', labelEN: 'Original due date', placeholderDE: '01.02.2026', required: true },
      { key: 'GRUNDLAGE', labelDE: 'Rechtsgrundlage der Forderung', labelEN: 'Legal basis of claim', placeholderDE: 'Rechnung Nr. 2026-001 vom 15.01.2026 für Leistung XY', required: true },
      { key: 'NEUE_FRIST', labelDE: 'Neue Zahlungsfrist', labelEN: 'New payment deadline', placeholderDE: '14 Tage ab diesem Schreiben', required: true },
      { key: 'IBAN', labelDE: 'Ihre IBAN für die Zahlung', labelEN: 'Your IBAN for payment', placeholderDE: 'DE89 3704 0044 0532 0130 00', required: true },
    ],
    content: `[VORNAME_NACHNAME]
[STRASSE_HAUSNUMMER]
[PLZ_ORT]

An
[SCHULDNER_NAME]
[SCHULDNER_ADRESSE]

[ORT_DATUM]

Betreff: Letzte Mahnung vor gerichtlicher Geltendmachung
         Offene Forderung: [FORDERUNGSBETRAG] — fällig seit [FAELLIGKEITSDATUM]

Sehr geehrte Damen und Herren,

trotz bisheriger Zahlungsaufforderungen ist folgende Forderung noch offen:

Grundlage: [GRUNDLAGE]
Betrag:    [FORDERUNGSBETRAG] (fällig seit [FAELLIGKEITSDATUM])

Sie befinden sich gemäß § 286 BGB seit dem [FAELLIGKEITSDATUM] in Verzug.
Zusätzlich zum Hauptbetrag schulden Sie Verzugszinsen nach § 288 Abs. 1 BGB
(5 Prozentpunkte über dem jeweiligen Basiszinssatz).

Ich fordere Sie hiermit letztmalig auf, den Betrag von [FORDERUNGSBETRAG]
zuzüglich aufgelaufener Verzugszinsen innerhalb von [NEUE_FRIST] zu überweisen:

IBAN: [IBAN]
Verwendungszweck: [GRUNDLAGE]

Sollte bis zum Fristablauf kein Zahlungseingang verzeichnet werden, werde ich
ohne weitere Ankündigung gerichtliche Schritte (Mahnbescheid / Klage) einleiten.
Die entstehenden Kosten und Gebühren gehen zu Ihren Lasten.

Mit freundlichen Grüßen

[VORNAME_NACHNAME]`,
  },
}
