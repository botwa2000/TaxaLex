#!/usr/bin/env node
// Injects "downloadWord" key into all 9 non-DE/EN locale files
const fs = require('fs')
const path = require('path')

// [locale, translation]
const entries = [
  ['fr', 'Télécharger en Word (.docx)'],
  ['es', 'Descargar como Word (.docx)'],
  ['it', 'Scarica come Word (.docx)'],
  ['pl', 'Pobierz jako Word (.docx)'],
  ['ru', 'Скачать как Word (.docx)'],
  ['tr', 'Word olarak indir (.docx)'],
  ['uk', 'Завантажити як Word (.docx)'],
  ['ar', 'تنزيل بصيغة Word (.docx)'],
  ['pt', 'Transferir como Word (.docx)'],
]

for (const [locale, translation] of entries) {
  const filePath = path.join('messages', `${locale}.json`)
  let content = fs.readFileSync(filePath, 'utf8')

  if (content.includes('"downloadWord"')) {
    console.log(`${locale}: key already present, skipping`)
    continue
  }

  // Insert after "downloadTxt": "..."
  const oldStr = '"downloadTxt":'
  const idx = content.indexOf(oldStr)
  if (idx === -1) {
    console.error(`downloadTxt not found in ${locale}`)
    continue
  }

  // Find end of the downloadTxt line
  const lineEnd = content.indexOf('\n', idx)
  if (lineEnd === -1) {
    console.error(`Cannot find end of downloadTxt line in ${locale}`)
    continue
  }

  const insertText = `\n      "downloadWord": "${translation}",`
  content = content.slice(0, lineEnd) + insertText + content.slice(lineEnd)

  try {
    JSON.parse(content)
  } catch (e) {
    console.error(`JSON invalid in ${locale} after edit:`, e.message.slice(0, 80))
    continue
  }

  fs.writeFileSync(filePath, content, 'utf8')
  console.log(`Updated ${locale}`)
}
