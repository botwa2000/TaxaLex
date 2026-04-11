#!/usr/bin/env node
// Injects expert CTA i18n keys into all 9 non-DE/EN locale files
const fs = require('fs')
const path = require('path')

// [locale, expertTitle, expertSubtitle, expertCta]
const entries = [
  ['fr', 'Faire réviser ce recours par un expert', 'Un conseiller certifié vérifie votre lettre avant que vous la soumettez.', 'Demander une révision'],
  ['es', 'Haga revisar este recurso por un experto', 'Un asesor certificado revisa su carta antes de enviarla.', 'Solicitar revisión'],
  ['it', 'Fai revisionare questo ricorso da un esperto', 'Un consulente certificato verifica la tua lettera prima che tu la presenti.', 'Richiedi revisione'],
  ['pl', 'Zlecić sprawdzenie tego odwołania ekspertowi', 'Certyfikowany doradca sprawdza Twój list przed złożeniem.', 'Poproś o przegląd'],
  ['ru', 'Попросите эксперта проверить это возражение', 'Сертифицированный советник проверит ваше письмо перед отправкой.', 'Запросить проверку'],
  ['tr', 'Bu itirazı bir uzman tarafından inceletin', 'Sertifikalı bir danışman mektubunuzu göndermeden önce kontrol eder.', 'İnceleme talep et'],
  ['uk', 'Попросіть експерта перевірити це заперечення', 'Сертифікований радник перевірить ваш лист перед подачею.', 'Запросити перевірку'],
  ['ar', 'اطلب من خبير مراجعة هذا الاعتراض', 'يتحقق مستشار معتمد من خطابك قبل تقديمه.', 'طلب مراجعة'],
  ['pt', 'Peça a um especialista para rever este recurso', 'Um consultor certificado verifica a sua carta antes de a submeter.', 'Solicitar revisão'],
]

for (const [locale, expertTitle, expertSubtitle, expertCta] of entries) {
  const filePath = path.join('messages', `${locale}.json`)
  let content = fs.readFileSync(filePath, 'utf8')

  if (content.includes('"expertTitle"')) {
    console.log(`${locale}: keys already present, skipping`)
    continue
  }

  // Insert after "downloadWord": "..."
  const marker = '"downloadWord":'
  const idx = content.indexOf(marker)
  if (idx === -1) {
    console.error(`downloadWord not found in ${locale}`)
    continue
  }

  const lineEnd = content.indexOf('\n', idx)
  if (lineEnd === -1) {
    console.error(`Cannot find end of downloadWord line in ${locale}`)
    continue
  }

  const insertText = [
    ``,
    `      "expertTitle": "${expertTitle}",`,
    `      "expertSubtitle": "${expertSubtitle}",`,
    `      "expertCta": "${expertCta}",`,
  ].join('\n')

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
