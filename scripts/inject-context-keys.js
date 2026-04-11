#!/usr/bin/env node
// Injects contextLabel/contextOptional/contextPlaceholder into all 9 non-DE/EN locale files
const fs = require('fs')
const path = require('path')

const entries = [
  ['fr', 'Téléversement non disponible en mode démo', 'Que contestez-vous ?', '(facultatif)', "Décrivez brièvement ce que vous souhaitez contester et pourquoi — par ex. « Je souhaite contester le rapport d'expert affirmant que les dégâts des eaux chez mon voisin proviennent de ma terrasse. »"],
  ['es', 'Carga no disponible en modo demo', '¿Qué está impugnando?', '(opcional)', 'Describa brevemente qué desea impugnar y por qué — p. ej. «Quiero impugnar el informe pericial que afirma que los daños por agua en el vecino provienen de mi terraza.»'],
  ['it', 'Caricamento non disponibile in modalità demo', 'Cosa sta contestando?', '(facoltativo)', 'Descriva brevemente cosa vuole contestare e perché — es. «Voglio contestare la perizia che afferma che il danno da acqua al vicino proviene dalla mia terrazza.»'],
  ['pl', 'Przesyłanie niedostępne w trybie demo', 'Czego dotyczy Twój sprzeciw?', '(opcjonalne)', 'Krótko opisz, co chcesz zakwestionować i dlaczego — np. „Chcę zakwestionować opinię rzeczoznawcy, który twierdzi, że szkody wodne u sąsiada pochodzą z mojego tarasu."'],
  ['ru', 'Загрузка недоступна в демо-режиме', 'Что именно вы оспариваете?', '(необязательно)', 'Кратко опишите, что вы хотите оспорить и почему — напр. «Я хочу оспорить заключение эксперта, утверждающего, что повреждения от воды у соседа произошли из-за моей террасы.»'],
  ['tr', 'Demo modunda yükleme mevcut değil', 'Neye itiraz ediyorsunuz?', '(isteğe bağlı)', 'Kısaca ne ve neden itiraz etmek istediğinizi açıklayın — örn. «Komşumdaki su hasarının terastan kaynaklandığını iddia eden bilirkişi raporuna itiraz etmek istiyorum.»'],
  ['uk', 'Завантаження недоступне в демо-режимі', "Що саме ви оскаржуєте?", "(необов'язково)", 'Коротко опишіть, що ви хочете оскаржити і чому — напр. «Я хочу оскаржити висновок експерта, який стверджує, що збитки від води у сусіда стались через мій балкон.»'],
  ['ar', 'التحميل غير متاح في وضع العرض التوضيحي', 'ما الذي تعترض عليه؟', '(اختياري)', "صف باختصار ما تريد الاعتراض عليه ولماذا — مثلاً: «أريد الاعتراض على تقرير الخبير الذي يدّعي أن أضرار المياه لدى الجار نشأت من شرفتي.»"],
  ['pt', 'Upload não disponível no modo demo', 'O que está a contestar?', '(opcional)', 'Descreva brevemente o que pretende contestar e porquê — p. ex. «Quero contestar o relatório do perito que afirma que os danos causados pela água ao vizinho têm origem no meu terraço.»'],
]

for (const [locale, demoDisabled, label, optional, placeholder] of entries) {
  const filePath = path.join('messages', `${locale}.json`)
  let content = fs.readFileSync(filePath, 'utf8')

  const needle = `"demoDisabled": "${demoDisabled}"\n    },`
  const replacement = `"demoDisabled": "${demoDisabled}",\n      "contextLabel": "${label}",\n      "contextOptional": "${optional}",\n      "contextPlaceholder": "${placeholder}"\n    },`

  if (!content.includes(needle)) {
    console.error(`NOT FOUND in ${locale} — skipping`)
    continue
  }

  content = content.replace(needle, replacement)
  fs.writeFileSync(filePath, content, 'utf8')
  console.log(`Updated ${locale}`)
}
