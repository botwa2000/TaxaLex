#!/usr/bin/env node
// Injects downloadReport key into cases.detail for all 9 non-DE/EN locale files
const fs = require('fs')
const path = require('path')

// [locale, downloadReport]
const entries = [
  ['fr', 'Télécharger le rapport de processus (PDF)'],
  ['es', 'Descargar informe del proceso (PDF)'],
  ['it', 'Scarica il rapporto del processo (PDF)'],
  ['pl', 'Pobierz raport procesu (PDF)'],
  ['ru', 'Скачать отчёт о процессе (PDF)'],
  ['tr', 'Süreç raporunu indir (PDF)'],
  ['uk', 'Завантажити звіт про процес (PDF)'],
  ['ar', 'تنزيل تقرير العملية (PDF)'],
  ['pt', 'Transferir relatório do processo (PDF)'],
]

for (const [locale, downloadReport] of entries) {
  const filePath = path.join('messages', `${locale}.json`)
  let content = fs.readFileSync(filePath, 'utf8')

  if (content.includes('"downloadReport"')) {
    console.log(`${locale}: downloadReport already present, skipping`)
    continue
  }

  // Insert after "reportGatedHint": "..."
  const marker = '"reportGatedHint":'
  const idx = content.indexOf(marker)
  if (idx === -1) {
    console.error(`reportGatedHint not found in ${locale}`)
    continue
  }

  const lineEnd = content.indexOf('\n', idx)
  if (lineEnd === -1) { console.error(`end of reportGatedHint line not found in ${locale}`); continue }

  // Ensure the reportGatedHint line ends with a comma
  let reportLine = content.slice(idx, lineEnd)
  if (!reportLine.trimEnd().endsWith(',')) {
    reportLine = reportLine.trimEnd() + ','
  }

  const insertText = `\n      "downloadReport": "${downloadReport}"`
  content = content.slice(0, idx) + reportLine + insertText + content.slice(lineEnd)

  try {
    JSON.parse(content)
  } catch (e) {
    console.error(`JSON invalid in ${locale} after edit:`, e.message.slice(0, 120))
    continue
  }

  fs.writeFileSync(filePath, content, 'utf8')
  console.log(`Updated ${locale}`)
}
