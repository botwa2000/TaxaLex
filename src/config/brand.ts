/**
 * Brand configuration — the only place the product name and identity live.
 *
 * To rename the product: change APP_NAME (and optionally the others).
 * Nothing else needs to be touched.
 */

export const brand = {
  name: 'TaxaLex',
  tagline: 'KI-gestützter Widerspruch & Einspruch',
  taglineEn: 'AI-powered objection letter generator',
  /** Used in <title> tags */
  metaTitle: 'TaxaLex – KI-gestützter Widerspruch & Einspruch',
  metaDescription:
    'Erstellen Sie professionelle Einspruchsschreiben gegen fehlerhafte Bescheide – mit Multi-KI-Technologie.',
  /** Log prefix used by logger/console */
  logPrefix: '[TaxaLex]',
} as const
