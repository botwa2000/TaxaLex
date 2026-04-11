#!/usr/bin/env node
// Inserts adversary-final and reporter into the generating.agents block
// for all 9 non-DE/EN locale files
const fs = require('fs')
const path = require('path')

// [locale, adversary-final label, reporter label]
const entries = [
  ['fr', 'Contrôle final', 'Rapport d\'analyse'],
  ['es', 'Revisión final', 'Informe de análisis'],
  ['it', 'Revisione finale', 'Rapporto di analisi'],
  ['pl', 'Ostateczna kontrola', 'Raport analityczny'],
  ['ru', 'Финальная проверка', 'Аналитический отчёт'],
  ['tr', 'Son kontrol', 'Analiz raporu'],
  ['uk', 'Фінальна перевірка', 'Аналітичний звіт'],
  ['ar', 'المراجعة النهائية', 'تقرير التحليل'],
  ['pt', 'Revisão final', 'Relatório de análise'],
]

for (const [locale, adversaryFinal, reporter] of entries) {
  const filePath = path.join('messages', `${locale}.json`)
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))

  const agents = data?.wizard?.generating?.agents
  if (!agents) {
    console.error(`${locale}: wizard.generating.agents not found`)
    continue
  }

  if (agents['adversary-final'] && agents['reporter']) {
    console.log(`${locale}: keys already present, skipping`)
    continue
  }

  agents['adversary-final'] = adversaryFinal
  agents['reporter'] = reporter

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8')
  console.log(`Updated ${locale}`)
}
