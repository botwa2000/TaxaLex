#!/usr/bin/env node
// Adds new i18n keys for the multi-agent question refinement indicator
// and the enhanced AI Analysis tab (analysis report for paid users).
// Idempotent — only adds keys that don't already exist.

const fs = require('fs')
const path = require('path')

const LOCALES = ['de', 'en', 'fr', 'es', 'it', 'pl', 'ru', 'tr', 'uk', 'ar', 'pt']

const KEYS = {
  'questions.refining': {
    de: 'Spezialisten verfeinern Ihre Fragen\u2026',
    en: 'Specialists are refining your questions\u2026',
    fr: 'Les sp\u00e9cialistes affinent vos questions\u2026',
    es: 'Los especialistas est\u00e1n refinando sus preguntas\u2026',
    it: 'Gli specialisti stanno affinando le tue domande\u2026',
    pl: 'Specjali\u015bci dopracowuj\u0105 Twoje pytania\u2026',
    ru: '\u0421\u043f\u0435\u0446\u0438\u0430\u043b\u0438\u0441\u0442\u044b \u0443\u0442\u043e\u0447\u043d\u044f\u044e\u0442 \u0432\u0430\u0448\u0438 \u0432\u043e\u043f\u0440\u043e\u0441\u044b\u2026',
    tr: 'Uzmanlar sorular\u0131n\u0131z\u0131 iyile\u015ftiriyor\u2026',
    uk: '\u0421\u043f\u0435\u0446\u0456\u0430\u043b\u0456\u0441\u0442\u0438 \u0432\u0434\u043e\u0441\u043a\u043e\u043d\u0430\u043b\u044e\u044e\u0442\u044c \u0432\u0430\u0448\u0456 \u0437\u0430\u043f\u0438\u0442\u0430\u043d\u043d\u044f\u2026',
    ar: '\u064a\u0642\u0648\u0645 \u0627\u0644\u0645\u062a\u062e\u0635\u0635\u0648\u0646 \u0628\u062a\u062d\u0633\u064a\u0646 \u0623\u0633\u0626\u0644\u062a\u0643\u2026',
    pt: 'Os especialistas est\u00e3o refinando suas perguntas\u2026',
  },
  'cases.detail.aiReport': {
    de: 'Vollst\u00e4ndige Analyse',
    en: 'Full Analysis',
    fr: 'Analyse compl\u00e8te',
    es: 'An\u00e1lisis completo',
    it: 'Analisi completa',
    pl: 'Pe\u0142na analiza',
    ru: '\u041f\u043e\u043b\u043d\u044b\u0439 \u0430\u043d\u0430\u043b\u0438\u0437',
    tr: 'Tam analiz',
    uk: '\u041f\u043e\u0432\u043d\u0438\u0439 \u0430\u043d\u0430\u043b\u0456\u0437',
    ar: '\u0627\u0644\u062a\u062d\u0644\u064a\u0644 \u0627\u0644\u0643\u0627\u0645\u0644',
    pt: 'An\u00e1lise completa',
  },
  'cases.detail.aiReportSubtitle': {
    de: 'Wie Ihre KI-Agenten gearbeitet haben',
    en: 'How your AI agents worked',
    fr: 'Comment vos agents IA ont travaill\u00e9',
    es: 'C\u00f3mo trabajaron sus agentes de IA',
    it: 'Come hanno lavorato i tuoi agenti AI',
    pl: 'Jak pracowa\u0142y Twoje agenty AI',
    ru: '\u041a\u0430\u043a \u0440\u0430\u0431\u043e\u0442\u0430\u043b\u0438 \u0432\u0430\u0448\u0438 \u0418\u0418-\u0430\u0433\u0435\u043d\u0442\u044b',
    tr: 'Yapay zeka ajanlar\u0131n\u0131z nas\u0131l \u00e7al\u0131\u015ft\u0131',
    uk: '\u042f\u043a \u043f\u0440\u0430\u0446\u044e\u0432\u0430\u043b\u0438 \u0432\u0430\u0448\u0456 \u0430\u0433\u0435\u043d\u0442\u0438 \u0428\u0406',
    ar: '\u0643\u064a\u0641 \u0639\u0645\u0644 \u0648\u0643\u0644\u0627\u0621 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a',
    pt: 'Como seus agentes de IA trabalharam',
  },
  'cases.detail.reportGatedHint': {
    de: 'Vollst\u00e4ndige Analyse verf\u00fcgbar f\u00fcr zahlende Nutzer.',
    en: 'Full analysis available for paying users.',
    fr: 'Analyse compl\u00e8te disponible pour les utilisateurs payants.',
    es: 'An\u00e1lisis completo disponible para usuarios de pago.',
    it: 'Analisi completa disponibile per gli utenti paganti.',
    pl: 'Pe\u0142na analiza dost\u0119pna dla p\u0142atnych u\u017cytkownik\u00f3w.',
    ru: '\u041f\u043e\u043b\u043d\u044b\u0439 \u0430\u043d\u0430\u043b\u0438\u0437 \u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d \u043f\u043b\u0430\u0442\u043d\u044b\u043c \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f\u043c.',
    tr: 'Tam analiz \u00f6deme yapan kullan\u0131c\u0131lar i\u00e7in m\u00fcsait.',
    uk: '\u041f\u043e\u0432\u043d\u0438\u0439 \u0430\u043d\u0430\u043b\u0456\u0437 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0438\u0439 \u0434\u043b\u044f \u043f\u043b\u0430\u0442\u043d\u0438\u0445 \u043a\u043e\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447\u0456\u0432.',
    ar: '\u0627\u0644\u062a\u062d\u0644\u064a\u0644 \u0627\u0644\u0643\u0627\u0645\u0644 \u0645\u062a\u0627\u062d \u0644\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u064a\u0646 \u0627\u0644\u0645\u062f\u0641\u0648\u0639\u064a\u0646.',
    pt: 'An\u00e1lise completa dispon\u00edvel para usu\u00e1rios pagantes.',
  },
}

function setNestedKey(obj, keyPath, value) {
  const parts = keyPath.split('.')
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur[parts[i]] === undefined) cur[parts[i]] = {}
    cur = cur[parts[i]]
  }
  const last = parts[parts.length - 1]
  if (cur[last] === undefined) {
    cur[last] = value
    return true
  }
  return false
}

let totalAdded = 0
for (const locale of LOCALES) {
  const filePath = path.join(__dirname, '..', 'messages', `${locale}.json`)
  const messages = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  let added = 0
  for (const [keyPath, translations] of Object.entries(KEYS)) {
    const value = translations[locale] ?? translations['en']
    if (setNestedKey(messages, keyPath, value)) added++
  }
  if (added > 0) {
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2) + '\n', 'utf8')
    console.log(`  ${locale}: +${added} keys`)
    totalAdded += added
  } else {
    console.log(`  ${locale}: already up to date`)
  }
}
console.log(`\nDone. ${totalAdded} keys added across all locales.`)
