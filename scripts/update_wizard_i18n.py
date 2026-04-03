"""One-time script: add missing wizard i18n keys to all locale files."""
import json

wizard_de = {
  "steps": {
    "upload": "Hochladen",
    "analyzing": "Erkennung",
    "questions": "Rückfragen",
    "generating": "KI-Analyse",
    "result": "Ergebnis"
  },
  "header": {"create": "Einspruch erstellen", "case": "Fall"},
  "upload": {
    "title": "Bescheid hochladen",
    "subtitle": "Laden Sie Ihren Bescheid hoch — oder starten Sie direkt ohne Dokument für eine Demo.",
    "dropzoneTitle": "Dateien hier ablegen",
    "dropzoneClick": "oder klicken, um Dateien auszuwählen",
    "dropzoneHint": "PDF, DOCX, TXT oder Bilder",
    "analyze": "Dokumente analysieren",
    "demoButton": "Demo starten (ohne Dokument)",
    "security": {"ssl": "SSL-verschlüsselt", "eu": "EU-Server", "noStore": "Nicht gespeichert"}
  },
  "analyzing": {
    "title": "Dokument wird analysiert\u2026",
    "step1": "Dokument wird gelesen\u2026",
    "step2": "Daten werden extrahiert\u2026",
    "step3": "Rückfragen werden vorbereitet\u2026",
    "liveMode": "KI-gestützte Analyse · Inhalte werden nicht dauerhaft gespeichert",
    "demoMode": "Demo-Modus · Kein Dokument hochgeladen"
  },
  "questions": {
    "title": "Rückfragen",
    "subtitle": "Bitte beantworten Sie diese Fragen für einen optimal formulierten Einspruch.",
    "detectedData": "Erkannter Bescheid",
    "liveBadge": "Live ✓",
    "demoBadge": "Demo",
    "required": "Pflichtfeld",
    "optional": "Optional",
    "answered": "beantwortet",
    "back": "Zurück",
    "generate": "Einspruch generieren",
    "generateWithDocs": "Einspruch generieren ({count} Dokumente)",
    "additionalDocs": {
      "title": "Weitere Belege hochladen",
      "subtitle": "Belege stärken Ihren Einspruch — die KI-Agenten berücksichtigen sie automatisch.",
      "add": "Dokument hinzufügen",
      "optional": "Optional"
    }
  },
  "generating": {
    "title": "Multi-KI-Pipeline läuft\u2026",
    "step": "Schritt {current} / {total}: {label}",
    "allDone": "Alle {n} Agenten abgeschlossen",
    "timeWarning": "Durchschnittliche Dauer: 20–40 Sekunden · Bitte nicht schließen",
    "draftTitle": "Entwurf in Echtzeit",
    "writing": "wird geschrieben\u2026",
    "draftPlaceholder": "Einspruch wird formuliert\u2026",
    "agents": {
      "drafter": "Entwurf wird erstellt\u2026 (Claude)",
      "reviewer": "Fehlerprüfung läuft\u2026 (Gemini)",
      "factchecker": "Faktencheck läuft\u2026 (Perplexity)",
      "adversary": "Finanzamt-Perspektive\u2026 (Claude)",
      "consolidator": "Konsolidierung\u2026 (Claude)"
    }
  },
  "result": {
    "title": "Einspruch bereit!",
    "subtitle": "KI-Agenten haben Ihren Einspruch geprüft und optimiert.",
    "badges": {"legal": "✓ Rechtlich geprüft", "bfh": "✓ BFH-Urteile eingeflossen", "formal": "✓ Formell korrekt"},
    "copy": "Kopieren",
    "copied": "Kopiert!",
    "download": "Herunterladen (.txt)",
    "openInCases": "In Meine Fälle öffnen",
    "newAppeal": "Neuen Einspruch erstellen",
    "nextSteps": {
      "title": "Nächste Schritte",
      "check": "Prüfen Sie Name, Adresse und Steuernummer im Entwurf",
      "print": "Drucken Sie das Schreiben aus und unterschreiben Sie es",
      "send": "Senden Sie es per Einschreiben oder Fax an die Behörde"
    },
    "legalNote": "Kein Rechtsrat i.S.d. RDG",
    "agentLog": "KI-Agenten-Protokoll",
    "outputLanguageWarning": "Dieses Dokument wurde in {language} erstellt. Für die Einreichung beim Finanzamt ist die deutsche Version erforderlich.",
    "downloadTxt": "Als TXT herunterladen"
  },
  "errors": {
    "analyze": "Dokumentenanalyse fehlgeschlagen. Bitte versuchen Sie es erneut.",
    "connection": "Verbindungsfehler — bitte erneut versuchen.",
    "generate": "Einspruch-Generierung fehlgeschlagen. Bitte versuchen Sie es erneut.",
    "backToUpload": "Zurück zum Upload"
  }
}

wizard_en = {
  "steps": {
    "upload": "Upload",
    "analyzing": "Detection",
    "questions": "Questions",
    "generating": "AI Analysis",
    "result": "Result"
  },
  "header": {"create": "Create objection", "case": "Case"},
  "upload": {
    "title": "Upload your notice",
    "subtitle": "Upload your official notice — or start directly without a document for a demo.",
    "dropzoneTitle": "Drop files here",
    "dropzoneClick": "or click to browse",
    "dropzoneHint": "PDF, DOCX, TXT or images",
    "analyze": "Analyse documents",
    "demoButton": "Start demo (without document)",
    "security": {"ssl": "SSL encrypted", "eu": "EU servers", "noStore": "Not stored"}
  },
  "analyzing": {
    "title": "Analysing your document\u2026",
    "step1": "Reading document\u2026",
    "step2": "Extracting data\u2026",
    "step3": "Preparing follow-up questions\u2026",
    "liveMode": "AI-powered analysis \u00b7 Content is not stored permanently",
    "demoMode": "Demo mode \u00b7 No document uploaded"
  },
  "questions": {
    "title": "Follow-up questions",
    "subtitle": "Please answer these questions to optimise your objection letter.",
    "detectedData": "Detected notice",
    "liveBadge": "Live \u2713",
    "demoBadge": "Demo",
    "required": "Required",
    "optional": "Optional",
    "answered": "answered",
    "back": "Back",
    "generate": "Generate objection letter",
    "generateWithDocs": "Generate objection ({count} documents)",
    "additionalDocs": {
      "title": "Upload additional documents",
      "subtitle": "Supporting documents strengthen your objection — the AI agents will consider them automatically.",
      "add": "Add document",
      "optional": "Optional"
    }
  },
  "generating": {
    "title": "Multi-AI pipeline running\u2026",
    "step": "Step {current} of {total}: {label}",
    "allDone": "All {n} agents completed",
    "timeWarning": "Average time: 20\u201340 seconds \u00b7 Please don\u2019t close this tab",
    "draftTitle": "Draft in real time",
    "writing": "writing\u2026",
    "draftPlaceholder": "Objection letter is being drafted\u2026",
    "agents": {
      "drafter": "Drafting letter\u2026 (Claude)",
      "reviewer": "Reviewing for errors\u2026 (Gemini)",
      "factchecker": "Fact-checking legal citations\u2026 (Perplexity)",
      "adversary": "Authority perspective check\u2026 (Claude)",
      "consolidator": "Consolidating final version\u2026 (Claude)"
    }
  },
  "result": {
    "title": "Objection letter ready!",
    "subtitle": "AI agents reviewed and optimised your objection letter.",
    "badges": {"legal": "\u2713 Legally reviewed", "bfh": "\u2713 Case law applied", "formal": "\u2713 Formally correct"},
    "copy": "Copy",
    "copied": "Copied!",
    "download": "Download (.txt)",
    "openInCases": "Open in My Cases",
    "newAppeal": "Create new objection",
    "nextSteps": {
      "title": "Next steps",
      "check": "Check your name, address and tax number in the draft",
      "print": "Print the letter and sign it",
      "send": "Send it by registered mail or fax to the authority"
    },
    "legalNote": "Not legal advice under RDG",
    "agentLog": "AI Agent Log",
    "outputLanguageWarning": "This document was generated in {language}. The German version is required for submission to German authorities.",
    "downloadTxt": "Download as TXT"
  },
  "errors": {
    "analyze": "Document analysis failed. Please try again.",
    "connection": "Connection error — please try again.",
    "generate": "Objection generation failed. Please try again.",
    "backToUpload": "Back to upload"
  }
}

locales = ['de', 'en', 'fr', 'it', 'es', 'tr', 'pl', 'ru', 'uk', 'ar', 'pt']

for locale in locales:
    fname = f'messages/{locale}.json'
    with open(fname, encoding='utf-8') as f:
        data = json.load(f)
    data['wizard'] = wizard_de if locale == 'de' else wizard_en
    with open(fname, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f'Updated {fname}')

print('Done')
