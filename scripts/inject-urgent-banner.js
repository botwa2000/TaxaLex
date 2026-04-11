#!/usr/bin/env node
// Injects urgentBanner key into cases section for all 9 non-DE/EN locale files
const fs = require('fs')
const path = require('path')

// [locale, urgentBanner]
const entries = [
  ['fr', '{count, plural, one {1 dossier a une échéance imminente ou dépassée — agissez maintenant.} other {# dossiers ont des échéances imminentes ou dépassées — agissez maintenant.}}'],
  ['es', '{count, plural, one {1 caso tiene un plazo próximo o vencido — actúe ahora.} other {# casos tienen plazos próximos o vencidos — actúe ahora.}}'],
  ['it', '{count, plural, one {1 caso ha una scadenza imminente o scaduta — agisca ora.} other {# casi hanno scadenze imminenti o scadute — agisca ora.}}'],
  ['pl', '{count, plural, one {1 sprawa ma zbliżający się lub przekroczony termin — działaj teraz.} other {# spraw ma zbliżające się lub przekroczone terminy — działaj teraz.}}'],
  ['ru', '{count, plural, one {1 дело имеет приближающийся или истёкший срок — действуйте сейчас.} other {# дел имеют приближающиеся или истёкшие сроки — действуйте сейчас.}}'],
  ['tr', '{count, plural, one {1 davanın son tarihi yaklaşıyor veya geçti — şimdi harekete geçin.} other {# davanın son tarihleri yaklaşıyor veya geçti — şimdi harekete geçin.}}'],
  ['uk', '{count, plural, one {1 справа має наближений або прострочений термін — дійте зараз.} other {# справ мають наближені або прострочені терміни — дійте зараз.}}'],
  ['ar', '{count, plural, one {1 قضية لديها موعد نهائي وشيك أو منتهٍ — تصرف الآن.} other {# قضايا لديها مواعيد نهائية وشيكة أو منتهية — تصرف الآن.}}'],
  ['pt', '{count, plural, one {1 caso tem um prazo iminente ou ultrapassado — aja agora.} other {# casos têm prazos iminentes ou ultrapassados — aja agora.}}'],
]

for (const [locale, urgentBanner] of entries) {
  const filePath = path.join('messages', `${locale}.json`)
  let content = fs.readFileSync(filePath, 'utf8')

  if (content.includes('"urgentBanner"')) {
    console.log(`${locale}: urgentBanner already present, skipping`)
    continue
  }

  // Insert after "deadlineLabel": in the cases section (second occurrence — around line 576)
  // Find the cases section deadlineLabel (not the detail section one)
  const casesIdx = content.indexOf('"cases"')
  if (casesIdx === -1) { console.error(`cases not found in ${locale}`); continue }

  const deadlineIdx = content.indexOf('"deadlineLabel":', casesIdx)
  if (deadlineIdx === -1) { console.error(`deadlineLabel not found in ${locale}`); continue }

  const lineEnd = content.indexOf('\n', deadlineIdx)
  if (lineEnd === -1) { console.error(`end of deadlineLabel line not found in ${locale}`); continue }

  // Escape the urgentBanner value for JSON string embedding (it contains { } which is fine in JSON)
  const escapedBanner = urgentBanner.replace(/\\/g, '\\\\')
  const insertText = `\n    "urgentBanner": "${escapedBanner}",`
  content = content.slice(0, lineEnd) + insertText + content.slice(lineEnd)

  try {
    JSON.parse(content)
  } catch (e) {
    console.error(`JSON invalid in ${locale} after edit:`, e.message.slice(0, 120))
    continue
  }

  fs.writeFileSync(filePath, content, 'utf8')
  console.log(`Updated ${locale}`)
}
