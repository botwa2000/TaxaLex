#!/usr/bin/env node
// Injects post-processing agent keys into all 9 non-DE/EN locale files
const fs = require('fs')
const path = require('path')

// [locale, adversary-final label, reporter label, reviewingDraft, writingReport]
const entries = [
  ['fr', 'Contrôle final', 'Rapport d\'analyse', 'Vérification du brouillon pour les failles…', 'Rédaction du rapport d\'analyse…'],
  ['es', 'Revisión final', 'Informe de análisis', 'Revisando el borrador en busca de vulnerabilidades…', 'Redactando el informe de análisis…'],
  ['it', 'Revisione finale', 'Rapporto di analisi', 'Revisione della bozza per vulnerabilità…', 'Scrittura del rapporto di analisi…'],
  ['pl', 'Ostateczna kontrola', 'Raport analityczny', 'Sprawdzanie projektu pod kątem luk…', 'Pisanie raportu analitycznego…'],
  ['ru', 'Финальная проверка', 'Аналитический отчёт', 'Проверка черновика на уязвимости…', 'Написание аналитического отчёта…'],
  ['tr', 'Son kontrol', 'Analiz raporu', 'Taslak zayıflıklar için inceleniyor…', 'Analiz raporu yazılıyor…'],
  ['uk', 'Фінальна перевірка', 'Аналітичний звіт', 'Перевірка чернетки на вразливості…', 'Написання аналітичного звіту…'],
  ['ar', 'المراجعة النهائية', 'تقرير التحليل', 'مراجعة المسودة بحثاً عن نقاط الضعف…', 'كتابة تقرير التحليل…'],
  ['pt', 'Revisão final', 'Relatório de análise', 'A rever o rascunho para vulnerabilidades…', 'A redigir o relatório de análise…'],
]

for (const [locale, adversaryFinal, reporter, reviewingDraft, writingReport] of entries) {
  const filePath = path.join('messages', `${locale}.json`)
  let content = fs.readFileSync(filePath, 'utf8')

  // Find the consolidator agent line and add the two post-processing agents after it
  const consolidatorPattern = /"consolidator": "[^"]*"\n      \}/
  const match = content.match(consolidatorPattern)
  if (!match) {
    // Try alternate format
    const lines = content.split('\n')
    const idx = lines.findIndex(l => l.includes('"consolidator":') && l.includes('(') )
    if (idx === -1) { console.error(`consolidator not found in ${locale}`); continue }
    const consolidatorLine = lines[idx]
    const newLines = [
      consolidatorLine.replace(/,?\s*$/, ','),
      `        "adversary-final": "${adversaryFinal}",`,
      `        "reporter": "${reporter}"`,
    ]
    lines.splice(idx, 1, ...newLines)
    content = lines.join('\n')
  }

  // Add reviewingDraft and writingReport after the agents block closing brace
  // Find: `"finalising":` and insert before it
  const finalisingIdx = content.indexOf('"finalising":')
  if (finalisingIdx === -1) { console.error(`finalising not found in ${locale}`); continue }

  // Check if keys already exist
  if (content.includes('"reviewingDraft":')) {
    console.log(`${locale}: keys already present, skipping`)
    continue
  }

  const insertText = `      "reviewingDraft": "${reviewingDraft}",\n      "writingReport": "${writingReport}",\n      `
  content = content.slice(0, finalisingIdx) + insertText + content.slice(finalisingIdx)

  try {
    JSON.parse(content)
  } catch (e) {
    console.error(`JSON invalid in ${locale} after edit:`, e.message.slice(0, 80))
    continue
  }

  fs.writeFileSync(filePath, content, 'utf8')
  console.log(`Updated ${locale}`)
}
