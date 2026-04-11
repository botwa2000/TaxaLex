# TaxAlex — Product Documentation

**Last updated:** April 2026
**Live:** taxalex.de · dev.taxalex.de

---

## ENGLISH

---

### What TaxAlex Does

TaxAlex is an AI-powered platform that generates formal legal objection letters against official German administrative decisions. Users upload a document they want to challenge — a tax notice, a traffic fine, a Jobcenter decision — and receive a complete, legally structured objection letter in minutes.

The letter is produced by a multi-agent AI pipeline, cross-checked by five independent AI models from different providers, and synthesised by a senior-level Claude model acting as a neutral arbitrator. The result is a complete, submission-ready letter in formal German, accompanied by a full audit-trail report that explains every decision the AI made.

---

### Who It Is For

**Private individuals** who have received an official German decision they believe is incorrect or unfair. The most common use cases:

- Tax assessment (Steuerbescheid) from the Finanzamt
- Property tax notice (Grundsteuerbescheid)
- Kindergeld rejection or reduction
- Jobcenter / Bürgergeld decision (increase, reduction, repayment demand)
- Traffic fine or parking ticket
- Health insurance decision (Krankenkasse)
- Employment termination (Kündigung)
- Rent increase notice (Mieterhöhung)

**Expats and non-German speakers.** The platform supports 11 interface languages (German, English, French, Spanish, Italian, Polish, Russian, Turkish, Ukrainian, Arabic, Portuguese). Users interact entirely in their own language; all generated letters are written in formal German as legally required.

**Tax and legal advisors.** The advisor module allows professionals to handle cases on behalf of clients, with structured case management, expert review workflows, and case handoff packets.

---

### User Journey

#### Step 1 — Upload

The user uploads one or more documents (PDF, DOCX, image, or plain text). Documents are accepted up to 30 MB total, up to 10 files per case. No account required to explore the platform, but authentication is required to save and retrieve cases.

#### Step 2 — AI Analysis

Claude reads the document and immediately begins streaming results to the user:

- The document type is identified (e.g. "Tax assessment notice — income tax 2023")
- Every relevant field is extracted and displayed in real time (dates, amounts, authority name, disputed position, applicable §§, deadline)
- The filing deadline is calculated automatically (30 days for most cases under §355 AO; 14 days for traffic fines)

This step takes 15–40 seconds depending on document complexity.

#### Step 3 — Question Refinement

Three specialist AI agents (legal reviewer, fact-checker, authority-perspective adversary) independently review the extracted data and each proposes follow-up questions. A fourth AI (Claude acting as fact-auditor) tags every proposed question:

- **CONFIRMED** — grounded in a specific extracted field, high confidence
- **SINGLE** — raised by one agent only, evaluated individually
- **DISPUTED** — conflicting signals, resolved by auditor
- **UNSUPPORTED** — not traceable to any document field, removed

A consolidation agent then produces the final 4–6 questions using a structured 5-step reasoning process: prioritise by tag, deduplicate, enforce atomicity, enrich with guidance, select. Each question shows a plain-language explanation of why it matters for the appeal.

This refinement step takes 30–60 additional seconds and is indicated in the UI with a spinner ("Specialists are refining your questions…").

#### Step 4 — User Answers

The user answers the follow-up questions. Each question includes:

- **Why this matters** — a plain-language explanation of its relevance to the appeal
- **Guidance** — practical examples that help the user understand what answer to give and how the AI will use it
- **Legal background** — the applicable §§ and case law (expandable)

Questions may ask for yes/no answers, text, amounts, or dates. Users may also upload additional documents alongside their answers.

#### Step 5 — Multi-Agent Draft Generation

Seven AI agents run in sequence (with steps 2–4 in parallel):

1. **Skeleton Extractor** (Claude Sonnet) — identifies all contested points as structured JSON. For each: what the authority claims, what the counter-argument is, what evidence exists, confidence level (HIGH / MEDIUM / LOW), financial impact, and primary legal provision.

2. **Legal Layer** (Gemini Pro on prod) — adds legal depth to each skeleton point: applicable §§, relevant court rulings (BFH, BAG, BSG, OLG), legal strength assessment, additional arguments, and DROP flags for legally invalid points.

3. **Fact Layer** (Perplexity Sonar Pro on prod) — verifies the factual basis of each point: are the dates, amounts, and claims accurate given the documents? Evidence strength rating, factual concerns, DROP flags.

4. **Adversarial Layer** (Grok 3 on prod) — simulates the authority's response to each point: the exact counter-argument the authority will use, what weakness they will exploit, risk level (HIGH / MEDIUM / LOW), and how to pre-empt each counter.

   Steps 2–4 run in parallel, cutting pipeline time by ~40%.

5. **Assembler** (GPT-4o on prod) — applies gating logic to every contested point (ARGUE / CAUTION / DROP), then writes the complete formal letter. For every included point, the adversary's counter-argument is addressed directly in the Begründung. Dropped points are documented.

6. **Final Adversarial Review** (Grok 3 on prod) — reviews the assembled letter for remaining vulnerabilities: procedural gaps, outdated citations, claims without corresponding evidence, structural weaknesses. Returns a severity-tagged list of concerns.

7. **Reporter** (Claude Sonnet) — writes a 700–1,100 word audit-trail narrative documenting every decision: which arguments were included and dropped, what each agent found, how conflicts between agents were resolved, what the adversary-final review flagged, and the overall confidence assessment.

The pipeline completes in 90–180 seconds on production.

#### Step 6 — Payment and Access

After the pipeline completes, the draft is available to paid users. Unpaid users see a summary. Payment unlocks the full letter, which also unlocks any drafts created while the user's balance was zero.

#### Step 7 — Review and Download

The user sees:

- The complete letter (formatted for direct submission)
- The full AI analysis report (reporter output, visible to paid users)
- Individual agent cards with expandable details (legal review findings, fact-check results, adversary stress-test, assembler gating decisions)
- The deadline countdown
- Download as PDF, or copy text for submission

Optionally, users can request expert review by a human advisor.

---

### AI Analysis Tab — What Paid Users See

For paying users, the case detail page includes a full AI Analysis tab:

- **Audit-trail report** — the reporter's narrative in full (no truncation), explaining the entire process from document analysis through final letter in plain language
- **Agent cards** — one card per pipeline agent (skeleton, legal, fact, adversary, assembler, adversary-final), each expandable to show the full structured output
- **Question proposals** — the raw proposals from each specialist agent, the fact-auditor's tagging, and the consolidator's reasoning

For non-paying users, summaries are shown with a note that the full analysis is available to paying users.

---

### Expert Advisor Module

Paying users can purchase an expert review add-on (€99, or €69 for subscribers). This assigns a qualified human advisor to the case. The advisor:

- Receives a structured handoff packet: brief summary, extracted facts, AI analysis, draft letter, and client context
- Can annotate any section of the draft with questions or corrections
- Approves, requests changes, or finalises the letter
- Communicates with the client through the platform

The advisor module includes:
- Assignment management (accept / decline / withdraw)
- Annotation and reply workflow
- Authorization scope setting (review only vs. full representation)
- Case finalization and status tracking

---

### Monetization

**Credits model for one-time users:**
- 1 credit = 1 case unlock
- `individual-single`: €5.99 — 1 credit
- `individual-pack`: €19.99 — 5 credits (most economical per-case)

**Subscription for recurring users:**
- `individual-monthly`: €9.99/month — unlimited case access

**Expert review add-on:**
- `expert-review`: €99 — human advisor review for non-subscribers
- `expert-review-subscriber`: €69 — discounted rate for active subscribers

**Payment processing:** Stripe. Webhooks handle credit provisioning automatically after payment confirmation. Credits are stored in a ledger (every change is audited). When a user pays, any drafts locked during zero-balance are automatically unlocked FIFO.

---

### Supported Languages (Interface)

German (DE), English (EN), French (FR), Spanish (ES), Italian (IT), Polish (PL), Russian (RU), Turkish (TR), Ukrainian (UK), Arabic (AR, RTL), Portuguese (PT).

The generated letter is always in German, as required by German-speaking authorities.

---

### Supported Document / Case Types

| Type | Legal framework | Deadline |
|---|---|---|
| Tax assessment (Steuerbescheid) | §347 AO, BFH case law | 30 days |
| Property tax (Grundsteuerbescheid) | §355 AO, §347 AO | 30 days |
| Traffic fine / warning (Bußgeldbescheid) | §67 OWiG | 14 days |
| Kindergeld decision | §68 EStG, §355 AO | 30 days |
| Jobcenter / Bürgergeld (SGB II) | §§83–86 SGG, §44 SGB X | 30 days |
| Health insurance decision | §§78ff SGG, VVG | 30 days |
| Employment termination | §4 KSchG, §622 BGB | 21 days |
| Rent increase | §558b BGB | 60 days |
| Other official decisions | Applicable statutory basis | 30 days |

---

### Environments

**Production (taxalex.de):** Full model suite — Claude Sonnet, Gemini 1.5 Pro, Perplexity Sonar Pro, Grok 3, GPT-4o. Five distinct providers, one per agent class.

**Development (dev.taxalex.de):** All pipeline agents run on Gemini Flash (zero marginal cost). Claude Haiku handles the question-consolidator, fact-auditor, and reporter. The analyzer always uses Claude Haiku regardless of environment (required for native PDF/image processing).

The active pipeline mode can be toggled live from the admin panel without a redeploy.

---

---

## DEUTSCH

---

### Was TaxAlex macht

TaxAlex ist eine KI-gestützte Plattform, die formale Einspruchs- und Widerspruchsschreiben gegen amtliche deutsche Verwaltungsentscheidungen generiert. Nutzer laden ein Dokument hoch, das sie anfechten möchten — einen Steuerbescheid, einen Bußgeldbescheid, einen Jobcenter-Bescheid — und erhalten in wenigen Minuten ein vollständiges, rechtlich strukturiertes Einspruchsschreiben.

Das Schreiben wird durch eine mehrstufige KI-Pipeline erstellt, von fünf unabhängigen KI-Modellen verschiedener Anbieter gegengeprüft und von einem hochrangigen Claude-Modell als neutralem Dirigenten zusammengeführt. Das Ergebnis ist ein vollständiges, einreichungsfertiges Schreiben in formaler Amtssprache — begleitet von einem vollständigen Prüfprotokoll, das jede Entscheidung der KI erklärt.

---

### Für wen es gedacht ist

**Privatpersonen**, die einen amtlichen deutschen Bescheid erhalten haben, den sie für unrichtig oder unbillig halten. Die häufigsten Anwendungsfälle:

- Steuerbescheid vom Finanzamt
- Grundsteuerbescheid
- Ablehnungs- oder Kürzungsbescheid beim Kindergeld
- Jobcenter- / Bürgergeld-Bescheid (Erhöhung, Kürzung, Rückforderung)
- Bußgeld- oder Verwarnungsgeld-Bescheid
- Bescheid der Krankenversicherung
- Kündigung des Arbeitsverhältnisses
- Mieterhöhungsverlangen

**Expats und Nicht-Deutschsprachige.** Die Plattform unterstützt 11 Oberflächensprachen (Deutsch, Englisch, Französisch, Spanisch, Italienisch, Polnisch, Russisch, Türkisch, Ukrainisch, Arabisch, Portugiesisch). Nutzer interagieren vollständig in ihrer Sprache; alle generierten Schreiben werden in formalem Deutsch verfasst, wie es rechtlich vorgeschrieben ist.

**Steuerberater und Rechtsanwälte.** Das Beratermodul ermöglicht Fachleuten, Fälle im Auftrag von Mandanten zu bearbeiten — mit strukturierter Fallverwaltung, Prüfabläufen und Übergabepaketen.

---

### Nutzungsablauf

#### Schritt 1 — Hochladen

Der Nutzer lädt ein oder mehrere Dokumente hoch (PDF, DOCX, Bild oder Klartext). Bis zu 30 MB Gesamtgröße, bis zu 10 Dateien pro Fall. Für die Plattformerkundung ist kein Konto erforderlich; zum Speichern und Abrufen von Fällen ist eine Anmeldung nötig.

#### Schritt 2 — KI-Analyse

Claude liest das Dokument und streamt die Ergebnisse sofort an den Nutzer:

- Die Dokumentenart wird erkannt (z. B. „Einkommensteuerbescheid 2023")
- Alle relevanten Felder werden in Echtzeit extrahiert (Daten, Beträge, Behördenname, Streitpunkte, einschlägige §§, Fristablauf)
- Die Einspruchsfrist wird automatisch berechnet (30 Tage für die meisten Fälle nach §355 AO; 14 Tage bei Bußgeldbescheiden)

Dieser Schritt dauert je nach Dokumentkomplexität 15–40 Sekunden.

#### Schritt 3 — Frageverfeinerung

Drei spezialisierte KI-Agenten (Rechtsprüfer, Faktenchecker, Behördenperspektive) analysieren die extrahierten Daten unabhängig voneinander und schlagen jeweils Rückfragen vor. Ein vierter Agent (Claude als Faktenprüfer) vergibt Bewertungen für jede vorgeschlagene Frage:

- **CONFIRMED** — direkt aus einem extrahierten Feld abgeleitet, hohe Konfidenz
- **SINGLE** — nur von einem Agenten vorgeschlagen, wird einzeln bewertet
- **DISPUTED** — widersprüchliche Signale, durch den Prüfagenten aufgelöst
- **UNSUPPORTED** — nicht auf ein Dokumentenfeld zurückführbar, wird entfernt

Ein Konsolidierungsagent erstellt dann die endgültigen 4–6 Fragen in einem strukturierten 5-Schritte-Verfahren: Priorisierung nach Bewertung, Entduplizierung, Atomizität sicherstellen, Hinweise ergänzen, Auswahl treffen. Jede Frage enthält eine verständliche Erklärung, warum sie für den Einspruch relevant ist.

Dieser Verfeinerungsschritt dauert 30–60 Sekunden zusätzlich und wird im Interface mit einem Hinweis angezeigt.

#### Schritt 4 — Nutzerantworten

Der Nutzer beantwortet die Rückfragen. Jede Frage enthält:

- **Warum das wichtig ist** — eine verständliche Erklärung der Relevanz für den Einspruch
- **Hinweise** — praktische Beispiele, wie die Frage zu beantworten ist und wie die KI die Antwort nutzt
- **Rechtlicher Hintergrund** — die anwendbaren §§ und Rechtsprechung (aufklappbar)

Fragen können Ja/Nein-Antworten, Freitexte, Beträge oder Daten erfragen. Nutzer können neben den Antworten auch weitere Dokumente hochladen.

#### Schritt 5 — Mehrstufige Schreiben-Generierung

Sieben KI-Agenten laufen sequenziell (mit den Schritten 2–4 parallel):

1. **Skelett-Extraktion** (Claude Sonnet) — identifiziert alle Streitpunkte als strukturiertes JSON. Pro Punkt: Behördenbehauptung, Gegenargument, verfügbare Belege, Konfidenz (HOCH / MITTEL / NIEDRIG), finanzieller Einfluss, primäre Rechtsgrundlage.

2. **Rechtliche Schicht** (Gemini Pro im Produktivbetrieb) — ergänzt jeden Punkt rechtlich: anwendbare §§, einschlägige Urteile (BFH, BAG, BSG, OLG), Stärkebewertung, zusätzliche Argumente, ENTFALLEN-Markierungen für rechtlich aussichtslose Punkte.

3. **Faktische Schicht** (Perplexity Sonar Pro im Produktivbetrieb) — überprüft die Tatsachengrundlage: Sind Daten, Beträge und Behauptungen durch die Dokumente belegbar? Belegnoten, Konflikte, ENTFALLEN-Markierungen.

4. **Adversarielle Schicht** (Grok 3 im Produktivbetrieb) — simuliert die Behördenantwort auf jeden Punkt: das genaue Gegenargument der Behörde, ausgenutzte Schwächen, Risikograd (HOCH / MITTEL / NIEDRIG), Gegenstrategie.

   Die Schritte 2–4 laufen parallel und reduzieren die Laufzeit um ~40 %.

5. **Montage** (GPT-4o im Produktivbetrieb) — wendet Einschlusslogik (ARGUMENTIEREN / VORSICHT / ENTFALLEN) auf jeden Punkt an und verfasst das vollständige formale Schreiben. Für jeden einbezogenen Punkt wird das Behördengegenargument direkt in der Begründung vorweggenommen. Ausgelassene Punkte werden dokumentiert.

6. **Abschließende adversarielle Prüfung** (Grok 3 im Produktivbetrieb) — durchleuchtet das fertige Schreiben auf verbliebene Schwachstellen: Verfahrenslücken, veraltete Zitate, nicht belegte Behauptungen, strukturelle Mängel. Rückgabe als priorisierte Liste mit Schweregrad.

7. **Bericht** (Claude Sonnet) — erstellt ein 700–1.100 Wörter langes Prüfprotokoll, das alle Entscheidungen dokumentiert: welche Argumente einbezogen oder ausgelassen wurden, was jeder Agent gefunden hat, wie Konflikte gelöst wurden, was die abschließende Prüfung beanstandete.

Die Pipeline dauert im Produktivbetrieb 90–180 Sekunden.

#### Schritt 6 — Zahlung und Freischaltung

Nach Abschluss der Pipeline ist das Schreiben für zahlende Nutzer verfügbar. Nichtsbezahlende Nutzer sehen eine Zusammenfassung. Die Zahlung schaltet das vollständige Schreiben frei und entsperrt gleichzeitig alle während des Nullsaldos gesperrten Entwürfe (nach FIFO-Reihenfolge).

#### Schritt 7 — Prüfen und Herunterladen

Der Nutzer sieht:

- Das vollständige Schreiben (einreichungsfertig formatiert)
- Den vollständigen KI-Analysebericht (Reporter-Ausgabe, für zahlende Nutzer sichtbar)
- Einzelne Agentenkarten mit aufklappbaren Details (Rechtsprüfung, Faktencheck, Adversarielle Analyse, Montageentscheidungen)
- Den Fristablauf-Countdown
- Download als PDF oder Textkopie

Optional kann eine Expertenbegutachtung durch einen menschlichen Berater angefordert werden.

---

### KI-Analyse-Tab — Was zahlende Nutzer sehen

Für zahlende Nutzer enthält die Falldetailseite einen vollständigen KI-Analyse-Tab:

- **Prüfprotokoll** — der vollständige Reporter-Bericht (ungekürzt), der den gesamten Prozess von der Dokumentanalyse bis zum fertigen Schreiben verständlich erklärt
- **Agentenkarten** — je eine Karte pro Pipeline-Agent (Skelett, Rechtlich, Faktisch, Adversariell, Montage, Abschlussprüfung), aufklappbar auf die vollständige strukturierte Ausgabe
- **Frage-Protokoll** — die Rohentwürfe der drei Spezialisten-Agenten, die Bewertungen des Faktenprüfers und das Konsolidierungsergebnis

Für nichtzahlende Nutzer werden Zusammenfassungen angezeigt mit dem Hinweis, dass der vollständige Bericht zahlenden Nutzern vorbehalten ist.

---

### Expertenberater-Modul

Zahlende Nutzer können einen Expertenbegutachtungs-Zusatz erwerben (€99, bzw. €69 für Abonnenten). Dies weist dem Fall einen qualifizierten menschlichen Berater zu. Der Berater:

- Erhält ein strukturiertes Übergabepaket: Kurzzusammenfassung, extrahierte Fakten, KI-Analyse, Entwurfsschreiben und Mandantenkontext
- Kann jeden Abschnitt des Entwurfs mit Fragen oder Korrekturen versehen
- Genehmigt, fordert Änderungen oder finalisiert das Schreiben
- Kommuniziert über die Plattform mit dem Mandanten

Das Beratermodul umfasst: Auftragsverwaltung (annehmen / ablehnen / zurückziehen), Anmerkungen und Antwortablauf, Vollmachtsumfang (nur Prüfung vs. vollständige Vertretung), Fallfinalisierung und Statusnachverfolgung.

---

### Monetarisierung

**Kredit-Modell für Einzelnutzer:**
- 1 Kredit = 1 Fallfreischaltung
- `individual-single`: €5,99 — 1 Kredit
- `individual-pack`: €19,99 — 5 Kredits (günstigster Einzelpreis)

**Abonnement für regelmäßige Nutzer:**
- `individual-monthly`: €9,99/Monat — unbegrenzte Fallfreischaltung

**Expertenbegutachtungs-Zusatz:**
- `expert-review`: €99 — menschliche Beraterbegutachtung für Nicht-Abonnenten
- `expert-review-subscriber`: €69 — reduzierter Satz für aktive Abonnenten

**Zahlungsabwicklung:** Stripe. Webhooks übernehmen die Kreditvergabe nach Zahlungsbestätigung automatisch. Kredits werden in einem Buchungsjournal verwaltet (jede Änderung ist auditierbar). Bei Zahlung werden automatisch alle gesperrten Entwürfe aus der Nullsaldo-Phase entsperrt.

---

### Unterstützte Sprachen (Oberfläche)

Deutsch (DE), Englisch (EN), Französisch (FR), Spanisch (ES), Italienisch (IT), Polnisch (PL), Russisch (RU), Türkisch (TR), Ukrainisch (UK), Arabisch (AR, RTL), Portugiesisch (PT).

Das generierte Schreiben ist immer auf Deutsch, da dies von deutschsprachigen Behörden verlangt wird.

---

### Unterstützte Dokumenten- / Falltypen

| Typ | Rechtsgrundlage | Frist |
|---|---|---|
| Steuerbescheid | §347 AO, BFH-Rechtsprechung | 30 Tage |
| Grundsteuerbescheid | §355 AO, §347 AO | 30 Tage |
| Bußgeldbescheid / Verwarnung | §67 OWiG | 14 Tage |
| Kindergeld-Bescheid | §68 EStG, §355 AO | 30 Tage |
| Jobcenter / Bürgergeld (SGB II) | §§83–86 SGG, §44 SGB X | 30 Tage |
| Krankenversicherungsbescheid | §§78ff SGG, VVG | 30 Tage |
| Kündigung | §4 KSchG, §622 BGB | 21 Tage |
| Mieterhöhungsverlangen | §558b BGB | 60 Tage |
| Sonstige amtliche Bescheide | Einschlägige Rechtsgrundlage | 30 Tage |

---

### Betriebsumgebungen

**Produktivbetrieb (taxalex.de):** Vollständige Modellausstattung — Claude Sonnet, Gemini 1.5 Pro, Perplexity Sonar Pro, Grok 3, GPT-4o. Fünf verschiedene Anbieter, einer pro Agentenklasse.

**Entwicklungsbetrieb (dev.taxalex.de):** Alle Pipeline-Agenten laufen auf Gemini Flash (marginalkostenfrei). Claude Haiku übernimmt Fragen-Konsolidierung, Faktenprüfung und Bericht. Der Analyseschritt verwendet stets Claude Haiku, unabhängig von der Umgebung (nötig für native PDF-/Bildverarbeitung).

Der aktive Pipeline-Modus kann im Admin-Panel live umgeschaltet werden, ohne Neubereitstellung.
