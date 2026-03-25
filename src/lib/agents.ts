/**
 * TaxPax Multi-Agent Orchestrator
 *
 * Coordinates multiple AI models to produce a legally sound
 * Einspruch document through: Draft → Review → Adversary → Consolidate
 */

import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import type { AgentConfig, AgentOutput, AgentRole, BescheidData } from '@/types'

// --- Provider clients (lazy-initialized) ---

let anthropic: Anthropic | null = null
let openai: OpenAI | null = null

function getAnthropic(): Anthropic {
  if (!anthropic) {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  }
  return anthropic
}

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
  }
  return openai
}

// --- Agent configurations ---

export const AGENTS: Record<AgentRole, AgentConfig> = {
  drafter: {
    role: 'drafter',
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    systemPrompt: `Du bist ein erfahrener Steuerrechtler, spezialisiert auf Einspruchsverfahren 
nach §347 AO. Erstelle ein vollständiges Einspruchsschreiben basierend auf den 
bereitgestellten Unterlagen. Verwende die korrekte BFH-Rechtsprechung und 
Gesetzesgrundlagen. Strukturiere das Schreiben in: Antrag auf AdV, Sachverhalt, 
Begründung (mit Unterpunkten), Rechtsfolge, konkreter Antrag. 
Verwende den Fremdvergleich ("fremder Dritter unter gleichen Umständen") statt 
"ordentlicher Kaufmann". Berücksichtige Verböserungsrisiken nach §367 Abs. 2 AO.`,
  },
  reviewer: {
    role: 'reviewer',
    provider: 'openai',
    model: 'gpt-4o',
    systemPrompt: `Du bist ein Steuerberater, der Einspruchsschreiben auf Fehler prüft.
Prüfe insbesondere: korrekte Rechtsbegriffe (BFH-konform), mathematische Berechnungen,
Vollständigkeit der Argumentation, korrekte Gesetzeszitate, Konsistenz der 
Krisenzeitpunkt-Argumentation, ob der Verlustvortrags-Bescheid mitangefochten wird.
Gib eine Liste konkreter Fehler und Verbesserungsvorschläge zurück.`,
  },
  adversary: {
    role: 'adversary',
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    systemPrompt: `Du bist ein erfahrener Finanzbeamter/Sachbearbeiter. Analysiere das 
Einspruchsschreiben aus Sicht des Finanzamts. Identifiziere jede Schwachstelle, 
die das Finanzamt nutzen könnte: fehlende Nachweise, angreifbare Formulierungen,
Anlaufverluste-Einwand, Going-Concern-Widerspruch, Verböserungsmöglichkeiten.
Bewerte jede Schwachstelle nach Risiko (hoch/mittel/niedrig).`,
  },
  consolidator: {
    role: 'consolidator',
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    systemPrompt: `Du bist ein Senior-Steuerberater, der ein finales Einspruchsschreiben 
erstellt. Dir liegen vor: ein Entwurf, ein Review mit Fehlern, und eine 
Gegneranalyse. Erstelle die finale Version, die alle Fehler korrigiert und 
alle Schwachstellen präventiv adressiert. Das Ergebnis muss juristisch 
wasserdicht sein. Verwende formelle, präzise Sprache.`,
  },
}

// --- Core orchestration ---

export async function callAgent(
  config: AgentConfig,
  userMessage: string
): Promise<string> {
  if (config.provider === 'anthropic') {
    const client = getAnthropic()
    const response = await client.messages.create({
      model: config.model,
      max_tokens: 4096,
      system: config.systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })
    return response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
  }

  if (config.provider === 'openai') {
    const client = getOpenAI()
    const response = await client.chat.completions.create({
      model: config.model,
      max_tokens: 4096,
      messages: [
        { role: 'system', content: config.systemPrompt },
        { role: 'user', content: userMessage },
      ],
    })
    return response.choices[0]?.message?.content ?? ''
  }

  throw new Error(`Unknown provider: ${config.provider}`)
}

/**
 * Full multi-agent pipeline:
 * 1. Drafter creates initial Einspruch
 * 2. Reviewer checks for errors
 * 3. Adversary attacks from Finanzamt perspective
 * 4. Consolidator produces final version
 */
export async function orchestrate(
  bescheidData: BescheidData,
  documents: { name: string; text: string }[],
  userAnswers: Record<string, string>
): Promise<{ outputs: AgentOutput[]; finalDraft: string }> {
  const outputs: AgentOutput[] = []

  const context = buildContext(bescheidData, documents, userAnswers)

  // Step 1: Draft
  console.log('[TaxPax] Step 1/4: Drafting...')
  const draftContent = await callAgent(
    AGENTS.drafter,
    `Erstelle ein Einspruchsschreiben basierend auf:\n\n${context}`
  )
  outputs.push(makeOutput('drafter', AGENTS.drafter, draftContent))

  // Step 2: Review
  console.log('[TaxPax] Step 2/4: Reviewing...')
  const reviewContent = await callAgent(
    AGENTS.reviewer,
    `Prüfe dieses Einspruchsschreiben auf Fehler:\n\n${draftContent}\n\nOriginaldaten:\n${context}`
  )
  outputs.push(makeOutput('reviewer', AGENTS.reviewer, reviewContent))

  // Step 3: Adversarial
  console.log('[TaxPax] Step 3/4: Adversarial review...')
  const adversaryContent = await callAgent(
    AGENTS.adversary,
    `Analysiere aus Finanzamt-Perspektive:\n\n${draftContent}\n\nOriginaldaten:\n${context}`
  )
  outputs.push(makeOutput('adversary', AGENTS.adversary, adversaryContent))

  // Step 4: Consolidate
  console.log('[TaxPax] Step 4/4: Consolidating...')
  const finalDraft = await callAgent(
    AGENTS.consolidator,
    `Erstelle die finale Version des Einspruchsschreibens.

ENTWURF:
${draftContent}

REVIEW (gefundene Fehler):
${reviewContent}

GEGNERANALYSE (Schwachstellen aus FA-Sicht):
${adversaryContent}

ORIGINALDATEN:
${context}`
  )
  outputs.push(makeOutput('consolidator', AGENTS.consolidator, finalDraft))

  return { outputs, finalDraft }
}

// --- Helpers ---

function buildContext(
  bescheid: BescheidData,
  documents: { name: string; text: string }[],
  answers: Record<string, string>
): string {
  const parts: string[] = []

  parts.push(`## Bescheid-Daten
Finanzamt: ${bescheid.finanzamt}
Steuernummer: ${bescheid.steuernummer}
Bescheid-Datum: ${bescheid.bescheidDatum}
Steuerart: ${bescheid.steuerart}
Nachzahlung: €${bescheid.nachzahlung}
Streitiger Betrag: €${bescheid.streitigerBetrag}`)

  if (documents.length > 0) {
    parts.push('## Dokumente')
    for (const doc of documents) {
      parts.push(`### ${doc.name}\n${doc.text}`)
    }
  }

  if (Object.keys(answers).length > 0) {
    parts.push('## Zusätzliche Angaben')
    for (const [q, a] of Object.entries(answers)) {
      parts.push(`${q}: ${a}`)
    }
  }

  return parts.join('\n\n')
}

function makeOutput(
  role: AgentRole,
  config: AgentConfig,
  content: string
): AgentOutput {
  return {
    role,
    provider: config.provider,
    model: config.model,
    content,
    timestamp: new Date(),
  }
}
