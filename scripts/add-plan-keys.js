#!/usr/bin/env node
// Adds new i18n keys for dashboard plan widget and case detail unlock button.
// Idempotent — only adds keys that don't already exist.

const fs = require('fs')
const path = require('path')

const LOCALES = ['de', 'en', 'fr', 'es', 'it', 'pl', 'ru', 'tr', 'uk', 'ar', 'pt']

const KEYS = {
  'cases.detail.unlockWithCredit': {
    de: 'Mit 1 Guthaben freischalten',
    en: 'Unlock with 1 credit',
    fr: 'D\u00e9bloquer avec 1 cr\u00e9dit',
    es: 'Desbloquear con 1 cr\u00e9dito',
    it: 'Sblocca con 1 credito',
    pl: 'Odblokuj za 1 kredyt',
    ru: '\u0420\u0430\u0437\u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0437\u0430 1 \u043a\u0440\u0435\u0434\u0438\u0442',
    tr: '1 krediyle a\u00e7',
    uk: '\u0420\u043e\u0437\u0431\u043b\u043e\u043a\u0443\u0432\u0430\u0442\u0438 \u0437\u0430 1 \u043a\u0440\u0435\u0434\u0438\u0442',
    ar: '\u0641\u062a\u062d \u0628\u0640 1 \u0631\u0635\u064a\u062f',
    pt: 'Desbloquear com 1 cr\u00e9dito',
  },
  'dashboard.plan.label': {
    de: 'Ihr Plan',
    en: 'Your Plan',
    fr: 'Votre plan',
    es: 'Su plan',
    it: 'Il tuo piano',
    pl: 'Tw\u00f3j plan',
    ru: '\u0412\u0430\u0448 \u0442\u0430\u0440\u0438\u0444',
    tr: 'Plan\u0131n\u0131z',
    uk: '\u0412\u0430\u0448 \u043f\u043b\u0430\u043d',
    ar: '\u062e\u0637\u062a\u0643',
    pt: 'Seu plano',
  },
  'dashboard.plan.credits': {
    de: '{count, plural, one {# Guthaben} other {# Guthaben}}',
    en: '{count, plural, one {# credit} other {# credits}}',
    fr: '{count, plural, one {# cr\u00e9dit} other {# cr\u00e9dits}}',
    es: '{count, plural, one {# cr\u00e9dito} other {# cr\u00e9ditos}}',
    it: '{count, plural, one {# credito} other {# crediti}}',
    pl: '{count, plural, one {# kredyt} other {# kredyt\u00f3w}}',
    ru: '{count, plural, one {# \u043a\u0440\u0435\u0434\u0438\u0442} few {# \u043a\u0440\u0435\u0434\u0438\u0442\u0430} other {# \u043a\u0440\u0435\u0434\u0438\u0442\u043e\u0432}}',
    tr: '{count} kredi',
    uk: '{count, plural, one {# \u043a\u0440\u0435\u0434\u0438\u0442} few {# \u043a\u0440\u0435\u0434\u0438\u0442\u0438} other {# \u043a\u0440\u0435\u0434\u0438\u0442\u0456\u0432}}',
    ar: '{count} \u0631\u0635\u064a\u062f',
    pt: '{count, plural, one {# cr\u00e9dito} other {# cr\u00e9ditos}}',
  },
  'dashboard.plan.noPlan': {
    de: 'Kein Plan aktiv',
    en: 'No active plan',
    fr: 'Aucun plan actif',
    es: 'Sin plan activo',
    it: 'Nessun piano attivo',
    pl: 'Brak aktywnego planu',
    ru: '\u041d\u0435\u0442 \u0430\u043a\u0442\u0438\u0432\u043d\u043e\u0433\u043e \u0442\u0430\u0440\u0438\u0444\u0430',
    tr: 'Aktif plan yok',
    uk: '\u041d\u0435\u043c\u0430\u0454 \u0430\u043a\u0442\u0438\u0432\u043d\u043e\u0433\u043e \u043f\u043b\u0430\u043d\u0443',
    ar: '\u0644\u0627 \u064a\u0648\u062c\u062f \u062e\u0637\u0629 \u0646\u0634\u0637\u0629',
    pt: 'Sem plano ativo',
  },
  'dashboard.plan.viewBilling': {
    de: 'Plan & Abrechnung',
    en: 'Plan & Billing',
    fr: 'Plan et facturation',
    es: 'Plan y facturaci\u00f3n',
    it: 'Piano e fatturazione',
    pl: 'Plan i rozliczenia',
    ru: '\u0422\u0430\u0440\u0438\u0444\u044b \u0438 \u043e\u043f\u043b\u0430\u0442\u0430',
    tr: 'Plan ve faturalama',
    uk: '\u0422\u0430\u0440\u0438\u0444 \u0442\u0430 \u043e\u043f\u043b\u0430\u0442\u0430',
    ar: '\u0627\u0644\u062e\u0637\u0629 \u0648\u0627\u0644\u0641\u0648\u0627\u062a\u064a\u0631',
    pt: 'Plano e faturamento',
  },
  'dashboard.plan.unlimitedAccess': {
    de: 'Unbegrenzte Nutzung',
    en: 'Unlimited access',
    fr: 'Acc\u00e8s illimit\u00e9',
    es: 'Acceso ilimitado',
    it: 'Accesso illimitato',
    pl: 'Nieograniczony dost\u0119p',
    ru: '\u0411\u0435\u0437\u043b\u0438\u043c\u0438\u0442\u043d\u044b\u0439 \u0434\u043e\u0441\u0442\u0443\u043f',
    tr: 'S\u0131n\u0131rs\u0131z eri\u015fim',
    uk: '\u041d\u0435\u043e\u0431\u043c\u0435\u0436\u0435\u043d\u0438\u0439 \u0434\u043e\u0441\u0442\u0443\u043f',
    ar: '\u0648\u0635\u0648\u0644 \u063a\u064a\u0631 \u0645\u062d\u062f\u0648\u062f',
    pt: 'Acesso ilimitado',
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
