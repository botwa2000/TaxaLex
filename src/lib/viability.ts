/**
 * Viability scorer — derives HIGH / MEDIUM / LOW from adversary + factchecker outputs.
 *
 * We parse signal words from the agent texts rather than calling another AI,
 * keeping cost to zero and latency negligible.
 */

import type { ViabilityScore, AnalysisSummary } from '@/types'

interface ViabilityInput {
  adversaryContent: string
  factcheckerContent: string
  reviewerContent: string
  amountDisputed: number
}

/**
 * Score the viability of a case and extract structured analysis summary.
 * Called at end of orchestrate() before storing the CaseOutput.
 */
export function scoreViability(input: ViabilityInput): AnalysisSummary {
  const { adversaryContent, factcheckerContent, reviewerContent, amountDisputed } = input

  const adversaryLower = adversaryContent.toLowerCase()
  const factLower = factcheckerContent.toLowerCase()
  const reviewerLower = reviewerContent.toLowerCase()

  // ── Weakness signals from adversary ────────────────────────────────────────
  const highRiskTerms = ['hohes risiko', 'schwerwiegend', 'nicht haltbar', 'scheitert', 'abzulehnen', 'keine aussicht', 'unbegründet']
  const medRiskTerms = ['mittleres risiko', 'fraglich', 'möglicherweise', 'bedenklich', 'nachweispflicht']
  const lowRiskTerms = ['geringes risiko', 'gut begründet', 'überzeugend', 'stichhaltig', 'rechtssicher']

  const highRiskCount = highRiskTerms.filter(t => adversaryLower.includes(t)).length
  const lowRiskCount = lowRiskTerms.filter(t => adversaryLower.includes(t)).length

  // ── Citation quality from factchecker ──────────────────────────────────────
  const citationsVerified = (factLower.match(/bestätigt|verifiziert|korrekt|aktuell/g) ?? []).length
  const citationsFailed = (factLower.match(/nicht gefunden|falsch|veraltet|nicht mehr gültig/g) ?? []).length

  // ── Reviewer error signals ─────────────────────────────────────────────────
  const reviewErrors = (reviewerLower.match(/fehler|fehlt|unklar|unvollständig/g) ?? []).length

  // ── Score calculation ──────────────────────────────────────────────────────
  let score: ViabilityScore

  if (highRiskCount >= 2 || citationsFailed >= 2 || reviewErrors >= 4) {
    score = 'LOW'
  } else if (lowRiskCount >= 2 && citationsVerified >= 2 && reviewErrors <= 1) {
    score = 'HIGH'
  } else {
    score = 'MEDIUM'
  }

  // Higher amounts at stake slightly improve viability perception (advisors more willing)
  if (score === 'MEDIUM' && amountDisputed >= 5000) {
    score = 'HIGH'
  }

  // ── Extract structured summaries ───────────────────────────────────────────
  const coreArgument = extractFirstSentence(reviewerContent) ??
    'Einspruch basiert auf rechtlichen Argumenten gegen den Bescheid.'

  const evidenceGaps = extractBulletPoints(adversaryContent, ['fehlend', 'nachweis', 'beleg', 'belege', 'fehlt'])
    .slice(0, 4)

  const counterarguments = extractBulletPoints(adversaryContent, ['argument', 'einwand', 'risiko', 'schwachstelle'])
    .slice(0, 4)

  const viabilitySummary = buildViabilitySummary(score, highRiskCount, lowRiskCount, citationsVerified, citationsFailed)

  return { coreArgument, evidenceGaps, counterarguments, viabilityScore: score, viabilitySummary }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractFirstSentence(text: string): string | null {
  const match = text.match(/[A-ZÄÖÜ][^.!?]*[.!?]/)
  return match ? match[0].trim() : null
}

function extractBulletPoints(text: string, keywords: string[]): string[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const results: string[] = []

  for (const line of lines) {
    const lower = line.toLowerCase()
    if (keywords.some(k => lower.includes(k)) && line.length > 20 && line.length < 200) {
      // Strip common bullet prefixes
      const cleaned = line.replace(/^[-•*·]\s*/, '').replace(/^\d+\.\s*/, '').trim()
      if (cleaned) results.push(cleaned)
    }
  }

  return results
}

function buildViabilitySummary(
  score: ViabilityScore,
  highRisk: number,
  lowRisk: number,
  citationsOk: number,
  citationsFailed: number
): string {
  switch (score) {
    case 'HIGH':
      return `Starke rechtliche Grundlage. ${citationsOk > 0 ? `${citationsOk} Zitat(e) verifiziert. ` : ''}Gegneranalyse zeigt geringe Risiken.`
    case 'MEDIUM':
      return `Vertretbare Position. ${highRisk > 0 ? `${highRisk} Risikofaktor(en) identifiziert. ` : ''}${citationsFailed > 0 ? `${citationsFailed} Zitat(e) zu prüfen. ` : ''}Ausgang offen.`
    case 'LOW':
      return `Schwache Grundlage. ${highRisk} Schwachstelle(n) identifiziert.${citationsFailed > 0 ? ` ${citationsFailed} Zitat(e) fehlerhaft.` : ''} Hohes Ablehnungsrisiko.`
  }
}
