/**
 * Multi-Agent Orchestrator
 *
 * Pipeline: Draft → Review (Gemini) → FactCheck (Perplexity) → Adversary → Consolidate
 */

import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AgentConfig, AgentOutput, AgentRole, BescheidData } from '@/types'
import type { ModelSpec } from '@/config/constants'
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
// Each entry in `models` carries both provider and model name — no hardcoding here.
//
// Language split:
//   • Letter agents (drafter, consolidator) write in `outputLanguage` (default: German).
//   • Analysis agents (reviewer, factchecker, adversary) communicate in `uiLanguage`
//     so the user reads feedback in their own language, not in German.
// Language directives live in the system prompt so they take effect from the first token,
// not as a fragile appendix on the user message.

type PipelineModels = Record<'drafter' | 'reviewer' | 'factchecker' | 'adversary' | 'consolidator', ModelSpec>

function buildAgents(
  models: PipelineModels,
  uiLanguage: string,
  outputLanguage: string,
): Record<AgentRole, AgentConfig> {
  const uiLang  = languageNames[uiLanguage]  ?? uiLanguage
  const outLang = languageNames[outputLanguage] ?? outputLanguage

  return {
    drafter: {
      role: 'drafter',
      provider: models.drafter.provider,
      model: models.drafter.model,
      systemPrompt: `You are an experienced tax lawyer specialising in objection proceedings (§347 AO, Germany). Draft a complete formal objection letter based on the provided documents. Apply correct BFH case law and statutory references. Structure: Application for suspension of enforcement (AdV) → Facts → Grounds (with sub-points) → Legal consequence → Specific application. Use the arm's-length standard ("independent third party under identical circumstances") rather than "prudent businessman". Account for aggravation risks under §367 para. 2 AO.

LANGUAGE DIRECTIVE: Write the complete objection letter in ${outLang}. This document will be submitted to German-speaking authorities.`,
    },
    reviewer: {
      role: 'reviewer',
      provider: models.reviewer.provider,
      model: models.reviewer.model,
      systemPrompt: `You are a tax adviser reviewing a formal objection letter for errors. Check: correct BFH-compliant legal terminology, arithmetic, completeness of argumentation, accuracy of statutory citations, consistency of the crisis-date line of argument, and whether any loss-carryforward notice is also contested. Return a numbered list of concrete errors and improvement suggestions.

LANGUAGE DIRECTIVE: Write your entire review and all feedback in ${uiLang}. Do not use German unless quoting a specific legal term that has no equivalent.`,
    },
    factchecker: {
      role: 'factchecker',
      provider: models.factchecker.provider,
      model: models.factchecker.model,
      systemPrompt: `You are a tax law expert verifying legal references in a German objection letter using live web sources. Check: Do cited BFH rulings exist and are their case numbers correct? Are cited paragraphs (AO, EStG, KStG, etc.) valid in the stated version? Are statutory citations current? Is there newer BFH/FG case law that strengthens or weakens the argument? Return concrete corrections and source references.

LANGUAGE DIRECTIVE: Write your entire fact-check report in ${uiLang}. Quote German legal terms verbatim where necessary, but explain them in ${uiLang}.`,
    },
    adversary: {
      role: 'adversary',
      provider: models.adversary.provider,
      model: models.adversary.model,
      systemPrompt: `You are an experienced German tax official (Finanzbeamter/Sachbearbeiter). Analyse the objection letter from the tax authority's perspective. Identify every weakness the authority could exploit: missing evidence, vulnerable wording, start-up-loss objection, going-concern contradiction, aggravation opportunities. Rate each weakness: high / medium / low risk.

LANGUAGE DIRECTIVE: Write your entire analysis in ${uiLang}. Use German technical terms only where unavoidable, and explain them in ${uiLang}.`,
    },
    consolidator: {
      role: 'consolidator',
      provider: models.consolidator.provider,
      model: models.consolidator.model,
      systemPrompt: `You are a senior tax adviser producing the final objection letter. You have four inputs: (1) a draft letter, (2) a reviewer's error list, (3) a fact-checker's legal-reference report, (4) an adversarial weakness analysis. Produce the final version: correct all errors, verify all legal references, pre-emptively address every identified weakness. The result must be legally watertight and formally precise.

LANGUAGE DIRECTIVE: Write the complete objection letter in ${outLang}. This document will be submitted to German-speaking authorities.`,
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
type ProgressEvent =
  | { type: 'agent_start'; data: { role: AgentRole } }
  | { type: 'agent_complete'; data: { role: AgentRole; provider: string; model: string; durationMs: number; summary: string; draftPreview?: string } }

export async function orchestrate(
  bescheidData: BescheidData,
  documents: { name: string; text: string }[],
  userAnswers: Record<string, string>,
  outputLanguage = 'de',
  uiLanguage = 'de',
  onProgress?: (event: ProgressEvent) => void
): Promise<{ outputs: AgentOutput[]; finalDraft: string; pipelineMode: string }> {
  const { models, mode: pipelineModeUsed } = await getActiveModels()
  // Language directives live inside system prompts — see buildAgents().
  const AGENTS = buildAgents(models, uiLanguage, outputLanguage)
  const outputs: AgentOutput[] = []
  const context = buildContext(bescheidData, documents, userAnswers)

  async function runAgent(
    role: AgentRole,
    agentConfig: AgentConfig,
    prompt: string,
    opts?: { draftPreview?: boolean }
  ): Promise<string> {
    onProgress?.({ type: 'agent_start', data: { role } })
    const t = Date.now()
    const content = await callAgent(agentConfig, prompt)
    const durationMs = Date.now() - t
    logger.agent(role, agentConfig.provider, agentConfig.model, durationMs)
    outputs.push(makeOutput(role, agentConfig, content, durationMs))
    onProgress?.({
      type: 'agent_complete',
      data: {
        role,
        provider: agentConfig.provider,
        model: agentConfig.model,
        durationMs,
        summary: extractSummary(content),
        ...(opts?.draftPreview ? { draftPreview: content } : {}),
      },
    })
    return content
  }

  // Step 1: Draft
  const draftContent = await runAgent(
    'drafter',
    AGENTS.drafter,
    `Draft an objection letter based on the following case data:\n\n${context}`,
    { draftPreview: true }
  )

  // Step 2: Review (language-aware — system prompt sets uiLanguage)
  const reviewContent = await runAgent(
    'reviewer',
    AGENTS.reviewer,
    `Review this objection letter for errors:\n\n${draftContent}\n\nOriginal case data:\n${context}`
  )

  // Step 3: Fact-check (language-aware — system prompt sets uiLanguage)
  const factCheckContent = await runAgent(
    'factchecker',
    AGENTS.factchecker,
    `Verify the legal references in this objection letter:\n\n${draftContent}`
  )

  // Step 4: Adversarial (language-aware — system prompt sets uiLanguage)
  const adversaryContent = await runAgent(
    'adversary',
    AGENTS.adversary,
    `Analyse this objection letter from the tax authority's perspective:\n\n${draftContent}\n\nOriginal case data:\n${context}`
  )

  // Step 5: Consolidate — final letter (language-aware — system prompt sets outputLanguage)
  const finalDraft = await runAgent(
    'consolidator',
    AGENTS.consolidator,
    `Produce the final objection letter using all four inputs below.

DRAFT:
${draftContent}

REVIEW — errors found:
${reviewContent}

FACT-CHECK — verified legal references:
${factCheckContent}

ADVERSARIAL ANALYSIS — weaknesses from the authority's perspective:
${adversaryContent}

ORIGINAL CASE DATA:
${context}`
  )

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
Streitiger Betrag: €${bescheid.streitigerBetrag}${bescheid.rawText ? `\nKontext: ${bescheid.rawText}` : ''}`)

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
  content: string,
  durationMs: number
): AgentOutput {
  return {
    role,
    provider: config.provider,
    model: config.model,
    content,
    timestamp: new Date(),
    durationMs,
  }
}

function extractSummary(content: string): string {
  const lines = content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 20 && !l.startsWith('#') && !l.startsWith('---'))
  const first = lines[0] ?? ''
  return first.length > 180 ? first.slice(0, 177) + '…' : first
}
