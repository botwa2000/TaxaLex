#!/usr/bin/env node
// Injects "wait" key into result.nextSteps for all 9 non-DE/EN locale files
const fs = require('fs')
const path = require('path')

// [locale, wait translation]
const entries = [
  ['fr', "Conservez une copie et attendez la réponse de l'autorité (délai\u00a0: 1 à 6 mois selon la procédure)"],
  ['es', 'Guarde una copia y espere la respuesta de la autoridad (plazo: 1-6 meses según el procedimiento)'],
  ['it', "Conservate una copia e aspettate la risposta dell'autorità (termine: 1-6 mesi a seconda della procedura)"],
  ['pl', 'Zachowaj kopię i czekaj na odpowiedź organu (termin: 1-6 miesięcy w zależności od procedury)'],
  ['ru', 'Сохраните копию и ждите ответа от ведомства (срок: 1-6 месяцев в зависимости от процедуры)'],
  ['tr', 'Bir kopya saklayın ve kurumun yanıtını bekleyin (süre: prosedüre göre 1-6 ay)'],
  ['uk', 'Збережіть копію та чекайте на відповідь органу (термін: 1-6 місяців залежно від процедури)'],
  ['ar', 'احتفظ بنسخة وانتظر رد السلطة (المدة: 1-6 أشهر حسب الإجراء)'],
  ['pt', 'Guarde uma cópia e aguarde a resposta da autoridade (prazo: 1-6 meses consoante o procedimento)'],
]

for (const [locale, wait] of entries) {
  const filePath = path.join('messages', `${locale}.json`)
  let content = fs.readFileSync(filePath, 'utf8')

  if (content.includes('"wait"')) {
    console.log(`${locale}: wait key already present, skipping`)
    continue
  }

  // Replace the send line (without trailing comma) + closing nextSteps brace
  // Pattern: "send": "...",?\n      }
  const nextStepsIdx = content.indexOf('"nextSteps"')
  if (nextStepsIdx === -1) {
    console.error(`nextSteps not found in ${locale}`)
    continue
  }

  const sendIdx = content.indexOf('"send":', nextStepsIdx)
  if (sendIdx === -1) {
    console.error(`send not found in ${locale}`)
    continue
  }

  // Find the closing of the send value (end of line)
  const sendLineEnd = content.indexOf('\n', sendIdx)
  const sendLine = content.slice(sendIdx, sendLineEnd)

  // Strip trailing comma if present, then add comma + wait line
  const sendLineClean = sendLine.replace(/,\s*$/, '')
  const newText = sendLineClean + ',\n        "wait": "' + wait + '"'
  content = content.slice(0, sendIdx) + newText + content.slice(sendLineEnd)

  try {
    JSON.parse(content)
  } catch (e) {
    console.error(`JSON invalid in ${locale} after edit:`, e.message.slice(0, 120))
    continue
  }

  fs.writeFileSync(filePath, content, 'utf8')
  console.log(`Updated ${locale}`)
}
