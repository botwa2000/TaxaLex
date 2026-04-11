#!/usr/bin/env node
// Injects upload.fileLabel nested keys into all 9 non-DE/EN locale files
const fs = require('fs')
const path = require('path')

// [locale, default, contested, evidence, correspondence]
const entries = [
  ['fr', 'Rôle du document (optionnel)', 'Document contesté', 'Pièce justificative', 'Correspondance'],
  ['es', 'Rol del documento (opcional)', 'Documento impugnado', 'Prueba de apoyo', 'Correspondencia'],
  ['it', 'Ruolo del documento (opzionale)', 'Documento contestato', 'Prova a sostegno', 'Corrispondenza'],
  ['pl', 'Rola dokumentu (opcjonalnie)', 'Kwestionowany dokument', 'Dowód pomocniczy', 'Korespondencja'],
  ['ru', 'Роль документа (необязательно)', 'Оспариваемый документ', 'Подтверждающий документ', 'Переписка'],
  ['tr', 'Belge rolü (isteğe bağlı)', 'İtiraz edilen belge', 'Destekleyici kanıt', 'Yazışma'],
  ['uk', 'Роль документа (необов\'язково)', 'Оспорюваний документ', 'Підтверджуючий доказ', 'Листування'],
  ['ar', 'دور المستند (اختياري)', 'المستند المطعون فيه', 'دليل داعم', 'المراسلات'],
  ['pt', 'Função do documento (opcional)', 'Documento impugnado', 'Prova de apoio', 'Correspondência'],
]

for (const [locale, def, contested, evidence, correspondence] of entries) {
  const filePath = path.join('messages', `${locale}.json`)
  let content = fs.readFileSync(filePath, 'utf8')

  if (content.includes('"fileLabel"')) {
    console.log(`${locale}: fileLabel already present, skipping`)
    continue
  }

  // Find the contextPlaceholder line end and insert fileLabel object after it
  const marker = '"contextPlaceholder":'
  const idx = content.indexOf(marker)
  if (idx === -1) {
    console.error(`contextPlaceholder not found in ${locale}`)
    continue
  }

  const lineEnd = content.indexOf('\n', idx)
  if (lineEnd === -1) {
    console.error(`Cannot find end of contextPlaceholder line in ${locale}`)
    continue
  }

  // Make sure the contextPlaceholder line ends with a comma
  let contextLine = content.slice(idx, lineEnd)
  if (!contextLine.trimEnd().endsWith(',')) {
    contextLine = contextLine.trimEnd() + ','
  }

  const insertText = `\n      "fileLabel": {\n        "default": "${def}",\n        "contested": "${contested}",\n        "evidence": "${evidence}",\n        "correspondence": "${correspondence}"\n      }`
  content = content.slice(0, idx) + contextLine + insertText + content.slice(lineEnd)

  try {
    JSON.parse(content)
  } catch (e) {
    console.error(`JSON invalid in ${locale} after edit:`, e.message.slice(0, 120))
    continue
  }

  fs.writeFileSync(filePath, content, 'utf8')
  console.log(`Updated ${locale}`)
}
