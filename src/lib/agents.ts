/**
 * Multi-Agent Orchestrator
 *
 * Pipeline: Draft → Review (Gemini) → FactCheck (Perplexity) → Adversary → Consolidate
 */

import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AgentConfig, AgentOutput, AgentRole, BescheidData } from '@/types'
import { logger } from '@/lib/logger'
import { languageNames } from '@/config/i18n'
import { config } from '@/config/env'
import { PIPELINE } from '@/config/constants'
import { getActiveModels } from '@/lib/pipelineMode'

// --- Provider clients (lazy-initialized) ---

let anthropic: Anthropic | null = null
let openai: OpenAI | null = null
let perplexity: OpenAI | null = null
let googleAI: GoogleGenerativeAI | null = null

function getAnthropic(): Anthropic {
  if (!anthropic) {
    anthropic = new Anthropic({ apiKey: config.anthropicApiKey })
  }
  return anthropic
}

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({ apiKey: config.openaiApiKey })
  }
  return openai
}

function getPerplexity(): OpenAI {
  if (!perplexity) {
    perplexity = new OpenAI({
      apiKey: config.perplexityApiKey,
      baseURL: 'https://api.perplexity.ai',
    })
  }
  return perplexity
}

function getGoogleAI(): GoogleGenerativeAI {
  if (!googleAI) {
    googleAI = new GoogleGenerativeAI(config.googleAiApiKey)
  }
  return googleAI
}

// --- Agent configurations ---
// Models are injected at call time from pipelineMode so dev/prod can be toggled live.

function buildAgents(models: Record<string, string>): Record<AgentRole, AgentConfig> {
  return {
    drafter: {
      role: 'drafter',
      provider: 'anthropic',
      model: models.drafter,
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
      provider: 'google',
      model: models.reviewer,
      systemPrompt: `Du bist ein Steuerberater, der Einspruchsschreiben auf Fehler prüft.
Prüfe insbesondere: korrekte Rechtsbegriffe (BFH-konform), mathematische Berechnungen,
Vollständigkeit der Argumentation, korrekte Gesetzeszitate, Konsistenz der
Krisenzeitpunkt-Argumentation, ob der Verlustvortrags-Bescheid mitangefochten wird.
Gib eine Liste konkreter Fehler und Verbesserungsvorschläge zurück.`,
    },
    factchecker: {
      role: 'factchecker',
      provider: 'perplexity',
      model: models.factchecker,
      systemPrompt: `Du bist ein Steuerrechts-Experte, der die Richtigkeit von Rechtsgrundlagen
in einem deutschen Einspruchsschreiben überprüft. Prüfe mit aktuellen Web-Quellen:
- Existieren die genannten BFH-Urteile und sind die Aktenzeichen korrekt?
- Sind die zitierten Paragraphen (AO, EStG, KStG etc.) in der genannten Fassung gültig?
- Entsprechen die Gesetzeszitate dem aktuellen Stand?
- Gibt es neuere BFH/FG-Rechtsprechung, die die Argumentation stärkt oder widerlegt?
Gib konkrete Korrekturen und aktuelle Fundstellen zurück.`,
    },
    adversary: {
      role: 'adversary',
      provider: 'anthropic',
      model: models.adversary,
      systemPrompt: `Du bist ein erfahrener Finanzbeamter/Sachbearbeiter. Analysiere das
Einspruchsschreiben aus Sicht des Finanzamts. Identifiziere jede Schwachstelle,
die das Finanzamt nutzen könnte: fehlende Nachweise, angreifbare Formulierungen,
Anlaufverluste-Einwand, Going-Concern-Widerspruch, Verböserungsmöglichkeiten.
Bewerte jede Schwachstelle nach Risiko (hoch/mittel/niedrig).`,
    },
    consolidator: {
      role: 'consolidator',
      provider: 'anthropic',
      model: models.consolidator,
      systemPrompt: `Du bist ein Senior-Steuerberater, der ein finales Einspruchsschreiben
erstellt. Dir liegen vor: ein Entwurf, ein Review mit Fehlern, eine Faktenchecks
der Rechtsgrundlagen, und eine Gegneranalyse. Erstelle die finale Version, die alle
Fehler korrigiert, alle Rechtsgrundlagen verifiziert und alle Schwachstellen präventiv
adressiert. Das Ergebnis muss juristisch wasserdicht sein. Verwende formelle, präzise Sprache.`,
    },
  }
}

// --- Core agent call ---

export async function callAgent(
  config: AgentConfig,
  userMessage: string
): Promise<string> {
  if (config.provider === 'anthropic') {
    const client = getAnthropic()
    const response = await client.messages.create({
      model: config.model,
      max_tokens: PIPELINE.maxTokens,
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
      max_tokens: PIPELINE.maxTokens,
      messages: [
        { role: 'system', content: config.systemPrompt },
        { role: 'user', content: userMessage },
      ],
    })
    return response.choices[0]?.message?.content ?? ''
  }

  if (config.provider === 'perplexity') {
    const client = getPerplexity()
    const response = await client.chat.completions.create({
      model: config.model,
      max_tokens: PIPELINE.maxTokens,
      messages: [
        { role: 'system', content: config.systemPrompt },
        { role: 'user', content: userMessage },
      ],
    })
    return response.choices[0]?.message?.content ?? ''
  }

  if (config.provider === 'google') {
    const client = getGoogleAI()
    const model = client.getGenerativeModel({
      model: config.model,
      systemInstruction: config.systemPrompt,
    })
    const result = await model.generateContent(userMessage)
    return result.response.text()
  }

  throw new Error(`Unknown provider: ${config.provider}`)
}

/**
 * Full multi-agent pipeline:
 * 1. Drafter   (Claude)      – creates initial Einspruch
 * 2. Reviewer  (Gemini)      – checks for legal/math errors
 * 3. FactCheck (Perplexity)  – verifies citations & case law with live web search
 * 4. Adversary (Claude)      – attacks from Finanzamt perspective
 * 5. Consolidator (Claude)   – produces final bulletproof version
 */
export async function orchestrate(
  bescheidData: BescheidData,
  documents: { name: string; text: string }[],
  userAnswers: Record<string, string>,
  outputLanguage = 'de',
  uiLanguage = 'de'
): Promise<{ outputs: AgentOutput[]; finalDraft: string; pipelineMode: string }> {
  const { models, mode: pipelineModeUsed } = await getActiveModels()
  const AGENTS = buildAgents(models)
  const outputs: AgentOutput[] = []
  const context = buildContext(bescheidData, documents, userAnswers)

  // Human-readable language names for prompt injection
  const outputLangName = languageNames[outputLanguage] ?? outputLanguage
  const uiLangName = languageNames[uiLanguage] ?? uiLanguage

  // Language instruction appended to analysis agents (reviewer, factchecker, adversary)
  // These are shown to the user in their language, not submitted to authorities.
  const analysisLangInstruction = uiLanguage !== 'de'
    ? `\n\nIMPORTANT: Write your entire analysis and feedback in ${uiLangName}.`
    : ''

  // Language instruction for the output document (drafter + consolidator)
  // German is always legally required for submission; we honour overrides for review/export.
  const draftLangInstruction = outputLanguage !== 'de'
    ? `\n\nIMPORTANT: Write the complete objection letter in ${outputLangName}. Note: this version is for review only — German is required for official submission.`
    : ''

  // Step 1: Draft
  let t = Date.now()
  const draftContent = await callAgent(
    AGENTS.drafter,
    `Erstelle ein Einspruchsschreiben basierend auf:\n\n${context}${draftLangInstruction}`
  )
  logger.agent('drafter', AGENTS.drafter.provider, AGENTS.drafter.model, Date.now() - t)
  outputs.push(makeOutput('drafter', AGENTS.drafter, draftContent))

  // Step 2: Review (Gemini)
  t = Date.now()
  const reviewContent = await callAgent(
    AGENTS.reviewer,
    `Prüfe dieses Einspruchsschreiben auf Fehler:\n\n${draftContent}\n\nOriginaldaten:\n${context}${analysisLangInstruction}`
  )
  logger.agent('reviewer', AGENTS.reviewer.provider, AGENTS.reviewer.model, Date.now() - t)
  outputs.push(makeOutput('reviewer', AGENTS.reviewer, reviewContent))

  // Step 3: Fact-check (Perplexity)
  t = Date.now()
  const factCheckContent = await callAgent(
    AGENTS.factchecker,
    `Prüfe die Rechtsgrundlagen in diesem Einspruchsschreiben auf Korrektheit:\n\n${draftContent}${analysisLangInstruction}`
  )
  logger.agent('factchecker', AGENTS.factchecker.provider, AGENTS.factchecker.model, Date.now() - t)
  outputs.push(makeOutput('factchecker', AGENTS.factchecker, factCheckContent))

  // Step 4: Adversarial
  t = Date.now()
  const adversaryContent = await callAgent(
    AGENTS.adversary,
    `Analysiere aus Finanzamt-Perspektive:\n\n${draftContent}\n\nOriginaldaten:\n${context}${analysisLangInstruction}`
  )
  logger.agent('adversary', AGENTS.adversary.provider, AGENTS.adversary.model, Date.now() - t)
  outputs.push(makeOutput('adversary', AGENTS.adversary, adversaryContent))

  // Step 5: Consolidate
  t = Date.now()
  const finalDraft = await callAgent(
    AGENTS.consolidator,
    `Erstelle die finale Version des Einspruchsschreibens.

ENTWURF:
${draftContent}

REVIEW – gefundene Fehler (Gemini):
${reviewContent}

FAKTENCHECK – verifizierte Rechtsgrundlagen (Perplexity):
${factCheckContent}

GEGNERANALYSE – Schwachstellen aus FA-Sicht:
${adversaryContent}

ORIGINALDATEN:
${context}${draftLangInstruction}`
  )
  logger.agent('consolidator', AGENTS.consolidator.provider, AGENTS.consolidator.model, Date.now() - t)
  outputs.push(makeOutput('consolidator', AGENTS.consolidator, finalDraft))

  logger.info('Pipeline complete', { totalAgents: outputs.length, pipelineMode: pipelineModeUsed })
  return { outputs, finalDraft, pipelineMode: pipelineModeUsed }
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
