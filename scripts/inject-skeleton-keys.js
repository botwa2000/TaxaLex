#!/usr/bin/env node
// Injects skeleton preview i18n keys into all 9 non-DE/EN locale files
const fs = require('fs')
const path = require('path')

// [locale, skeletonPreview, unlockToSeeFullLetter]
const entries = [
  ['fr', 'Points d\'objection analysés (aperçu)', 'Débloquez la lettre complète pour voir tous les arguments développés et le raisonnement juridique.'],
  ['es', 'Puntos de objeción analizados (vista previa)', 'Desbloquee la carta completa para ver todos los argumentos desarrollados y el razonamiento jurídico.'],
  ['it', 'Punti di obiezione analizzati (anteprima)', 'Sblocca la lettera completa per vedere tutti gli argomenti sviluppati e il ragionamento legale.'],
  ['pl', 'Przeanalizowane punkty sprzeciwu (podgląd)', 'Odblokuj pełny list, aby zobaczyć wszystkie opracowane argumenty i uzasadnienie prawne.'],
  ['ru', 'Проанализированные пункты возражений (предварительный просмотр)', 'Разблокируйте полное письмо, чтобы увидеть все разработанные аргументы и правовое обоснование.'],
  ['tr', 'Analiz edilen itiraz noktaları (önizleme)', 'Tüm geliştirilmiş argümanları ve hukuki gerekçeyi görmek için tam mektubu açın.'],
  ['uk', 'Проаналізовані пункти заперечень (попередній перегляд)', 'Розблокуйте повний лист, щоб побачити всі розроблені аргументи та правове обґрунтування.'],
  ['ar', 'نقاط الاعتراض المحللة (معاينة)', 'افتح الرسالة الكاملة لرؤية جميع الحجج المطورة والمبررات القانونية.'],
  ['pt', 'Pontos de objeção analisados (pré-visualização)', 'Desbloqueie a carta completa para ver todos os argumentos desenvolvidos e o raciocínio jurídico.'],
]

for (const [locale, skeletonPreview, unlockToSeeFullLetter] of entries) {
  const filePath = path.join('messages', `${locale}.json`)
  let content = fs.readFileSync(filePath, 'utf8')

  if (content.includes('"skeletonPreview"')) {
    console.log(`${locale}: keys already present, skipping`)
    continue
  }

  // Insert before "expertTitle"
  const marker = '"expertTitle":'
  const idx = content.indexOf(marker)
  if (idx === -1) {
    console.error(`expertTitle not found in ${locale}`)
    continue
  }

  const insertText = `"skeletonPreview": "${skeletonPreview}",\n      "unlockToSeeFullLetter": "${unlockToSeeFullLetter}",\n      `
  content = content.slice(0, idx) + insertText + content.slice(idx)

  try {
    JSON.parse(content)
  } catch (e) {
    console.error(`JSON invalid in ${locale} after edit:`, e.message.slice(0, 120))
    continue
  }

  fs.writeFileSync(filePath, content, 'utf8')
  console.log(`Updated ${locale}`)
}
