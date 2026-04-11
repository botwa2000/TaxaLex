/**
 * Multi-Agent Orchestrator
 *
 * Pipeline: Draft → [Review + FactCheck + Adversary in parallel] → Consolidate
 * Steps 2–4 work independently on the same draft, so they run concurrently.
 * This reduces typical prod pipeline time from ~240s to ~150s (37% faster).
 *
 * Prod provider assignment (one distinct model per provider):
 *   Drafter      → Claude Sonnet  (Anthropic)  — legal writing
 *   Reviewer     → Gemini 1.5 Pro (Google)     — structured error analysis
 *   FactChecker  → Sonar Pro      (Perplexity) — live-web citation verification
 *   Adversary    → Grok 3         (xAI)        — adversarial reasoning, authority POV
 *   Consolidator → GPT-4o         (OpenAI)     — multi-source synthesis, final letter
 *
 * Dev provider assignment (all Gemini Flash — zero marginal cost):
 *   All five pipeline agents → gemini-2.5-flash
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
let xai: OpenAI | null = null
let googleAI: GoogleGenerativeAI | null = null

function getAnthropic(): Anthropic {
  if (!anthropic) anthropic = new Anthropic({ apiKey: config.anthropicApiKey })
  return anthropic
}

function getOpenAI(): OpenAI {
  if (!openai) openai = new OpenAI({ apiKey: config.openaiApiKey })
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

// xAI (Grok) uses an OpenAI-compatible API — same SDK, different base URL and key.
function getXAI(): OpenAI {
  if (!xai) {
    xai = new OpenAI({
      apiKey: config.xaiApiKey,
      baseURL: 'https://api.x.ai/v1',
    })
  }
  return xai
}

function getGoogleAI(): GoogleGenerativeAI {
  if (!googleAI) googleAI = new GoogleGenerativeAI(config.googleAiApiKey)
  return googleAI
}

// --- Agent configurations ---
// Models are injected at call time from pipelineMode so dev/prod can be toggled live.
//
// Language split:
//   • Letter agents (drafter, consolidator) write in `outputLanguage` (default: German).
//   • Analysis agents (reviewer, factchecker, adversary) communicate in `uiLanguage`
//     so the user reads feedback in their own language, not in German.

type PipelineModels = Record<
  | 'drafter' | 'reviewer' | 'factchecker' | 'adversary' | 'consolidator'
  | 'question-proposer-reviewer' | 'question-proposer-factchecker'
  | 'question-proposer-adversary' | 'question-consolidator' | 'reporter',
  ModelSpec
>

function buildAgents(
  models: PipelineModels,
  uiLanguage: string,
  outputLanguage: string
): Record<AgentRole, AgentConfig> {
  const uiLang = languageNames[uiLanguage] ?? uiLanguage
  const outLang = languageNames[outputLanguage] ?? outputLanguage

  return {
    drafter: {
      role: 'drafter',
      provider: models.drafter.provider,
      model: models.drafter.model,
      systemPrompt: `You are an experienced German legal specialist in formal objection and appeal proceedings. Based on the document type in the case data, apply the correct legal framework and draft a complete formal letter:

• Steuerbescheid → Einspruch (§347 AO), cite BFH case law, account for aggravation under §367 Abs. 2 AO
• Bußgeldbescheid / Verwarnung → Einspruch (§67 OWiG), challenge evidence and proportionality
• Kindergeld-Bescheid → Einspruch (§68 EStG, §355 AO), cite FG/BFH case law
• Jobcenter / Bürgergeld-Bescheid → Widerspruch (§§83–86 SGG, §44 SGB X)
• Krankenkassen-Bescheid → Widerspruch (§§78ff SGG) or Beschwerde under VVG
• Kündigung → formal legal objection citing §4 KSchG, §622 BGB, BAG case law
• Mieterhöhung → Widerspruch (§558b BGB), challenge formalities and comparables
• Other → formal Widerspruch/Einspruch citing the applicable statutory basis

Structure: Introduction and specific application → Facts → Legal grounds (numbered sub-points with §§ and case law) → Formal request.

LANGUAGE DIRECTIVE: Write the complete letter in ${outLang}. This document will be submitted to German-speaking authorities.`,
    },
    reviewer: {
      role: 'reviewer',
      provider: models.reviewer.provider,
      model: models.reviewer.model,
      systemPrompt: `You are a legal adviser reviewing a formal objection or appeal letter for errors. Based on the document type, check: correct legal terminology for the applicable law, arithmetic where relevant, completeness of argumentation, accuracy of statutory citations and case law references, consistency of the factual narrative, and whether all claims are properly substantiated. Return a numbered list of concrete errors and improvement suggestions.

LANGUAGE DIRECTIVE: Write your entire review in ${uiLang}. Quote German legal terms verbatim only where necessary, and explain them in ${uiLang}.`,
    },
    factchecker: {
      role: 'factchecker',
      provider: models.factchecker.provider,
      model: models.factchecker.model,
      systemPrompt: `You are a legal expert verifying references in a formal objection letter using live web sources. Check: Do cited court rulings (BGH, BFH, BAG, BVerwG, BSG, OLG, FG, etc.) exist with correct case numbers? Are cited statutory paragraphs (AO, BGB, SGB, OWiG, KSchG, VVG, etc.) valid and current? Is there newer case law that strengthens or weakens the argument? Return concrete corrections with source references.

LANGUAGE DIRECTIVE: Write your entire fact-check report in ${uiLang}. Quote German legal terms verbatim where necessary, and explain them in ${uiLang}.`,
    },
    adversary: {
      role: 'adversary',
      provider: models.adversary.provider,
      model: models.adversary.model,
      systemPrompt: `You are an experienced German civil servant at the relevant authority handling this case. Analyse the objection letter from the authority's perspective. Identify every weakness they could exploit: missing evidence, procedural gaps, vulnerable legal arguments, factual inconsistencies, missed deadlines, insufficient substantiation. Rate each weakness: high / medium / low risk.

LANGUAGE DIRECTIVE: Write your entire analysis in ${uiLang}. Use German technical terms only where unavoidable, and explain them in ${uiLang}.`,
    },
    consolidator: {
      role: 'consolidator',
      provider: models.consolidator.provider,
      model: models.consolidator.model,
      systemPrompt: `You are a senior legal adviser producing the final objection or appeal letter. You have four inputs: (1) a draft letter, (2) a reviewer's error list, (3) a fact-checker's legal-reference report, (4) an adversarial weakness analysis. Produce the final version: correct all errors, verify all legal references, pre-emptively address every identified weakness. The result must be legally watertight, formally precise, and ready for submission.

LANGUAGE DIRECTIVE: Write the complete letter in ${outLang}. This document will be submitted to German-speaking authorities.`,
    },
    'question-proposer-reviewer': {
      role: 'question-proposer-reviewer',
      provider: models['question-proposer-reviewer'].provider,
      model: models['question-proposer-reviewer'].model,
      systemPrompt: `You are a legal expert reviewing structured data extracted from an official German document. Your task: identify legal information gaps that would weaken a formal objection or appeal, and propose targeted follow-up questions to fill those gaps.

Rules:
- Each question must address exactly ONE specific thing. Never combine two questions into one.
- If a yes/no question implies a follow-up detail, split into TWO separate questions.
- Only propose questions that DIRECTLY strengthen the appeal. No generic background questions.
- Write in plain language — assume the reader is an intelligent non-expert, not a lawyer.
- Questions must target legal gaps: missing §§ evidence, unclear procedural steps, unchallengeable assumptions.

Return a JSON array only — no other text:
[{"question":"...","why":"1-2 sentence plain-language explanation of why this specific question matters for winning the appeal","type":"yesno|text|amount|date","legalBasis":"relevant §§ or court rulings"}]

Propose 2-4 questions maximum. Focus on legal gaps, missing evidence, challengeable assumptions.

LANGUAGE DIRECTIVE: Write ALL text (question, why) in ${uiLang}.`,
    },
    'question-proposer-factchecker': {
      role: 'question-proposer-factchecker',
      provider: models['question-proposer-factchecker'].provider,
      model: models['question-proposer-factchecker'].model,
      systemPrompt: `You are a fact-checking expert reviewing structured data extracted from an official German document. Your task: identify factual claims, dates, amounts, and procedural details that must be verified or clarified before writing a credible objection or appeal.

Rules:
- Each question must address exactly ONE specific thing. Never combine two questions into one.
- If a yes/no question implies a follow-up detail, split into TWO separate questions.
- Only propose questions where the answer would materially change the appeal's argumentation.
- Write in plain language — assume the reader is an intelligent non-expert.
- Focus lens: dates, deadlines, amounts, procedural compliance, prior correspondence, official notifications.

Return a JSON array only — no other text:
[{"question":"...","why":"1-2 sentence plain-language explanation of why this fact needs verification for the appeal","type":"yesno|text|amount|date","legalBasis":"relevant §§ or regulations"}]

Propose 2-4 questions maximum.

LANGUAGE DIRECTIVE: Write ALL text (question, why) in ${uiLang}.`,
    },
    'question-proposer-adversary': {
      role: 'question-proposer-adversary',
      provider: models['question-proposer-adversary'].provider,
      model: models['question-proposer-adversary'].model,
      systemPrompt: `You are simulating the German authority that issued this official document. Your task: identify information the authority will demand in their response to an objection, and propose questions to pre-emptively gather that information.

Rules:
- Each question must address exactly ONE specific thing. Never combine two questions into one.
- If a yes/no question implies a follow-up detail, split into TWO separate questions.
- Only propose questions that address genuine authority counter-arguments — not hypothetical edge cases.
- Write in plain language — the appellant is an intelligent non-expert.
- Focus lens: missing documentation the authority expects, procedural requirements the appellant may have missed, weaknesses the authority will exploit.

Return a JSON array only — no other text:
[{"question":"...","why":"1-2 sentence plain-language explanation of what the authority will challenge and why this answer helps defend against it","type":"yesno|text|amount|date","legalBasis":"relevant §§ or procedural rules"}]

Propose 2-4 questions maximum.

LANGUAGE DIRECTIVE: Write ALL text (question, why) in ${uiLang}.`,
    },
    'question-consolidator': {
      role: 'question-consolidator',
      provider: models['question-consolidator'].provider,
      model: models['question-consolidator'].model,
      systemPrompt: `You are consolidating follow-up question proposals from three legal specialists (Legal Reviewer, Fact-Checker, Adversary) plus an initial AI analysis. Produce the final, optimised question list.

Consolidation rules:
- Merge duplicate or overlapping questions — keep the clearest wording from any source.
- Enforce strict atomicity: each final question asks exactly ONE thing. Split any compound questions.
- Remove generic questions not tied to the specific facts of this case.
- For each question, add a "why" field: a 1-2 sentence plain-language explanation a non-expert can understand.
- Add a "guidance" field: 2-3 sentences explaining what factors determine the answer and concrete examples (if X then answer A because...).
- Produce exactly 4-6 final questions total (no fewer, no more).

Return ONLY a JSON object — no other text:
{"questions":[{"id":"q1","question":"...","required":true,"type":"text|yesno|amount|date","background":"§§ and legal basis in ${uiLang}","guidance":"2-3 sentence practical guidance in ${uiLang}","why":"1-2 sentence plain-language explanation in ${uiLang}"}],"rationale":"1 paragraph explaining which questions were merged, removed, or split and why"}

LANGUAGE DIRECTIVE: Write ALL text (question, background, guidance, why, rationale) in ${uiLang}.`,
    },
    reporter: {
      role: 'reporter',
      provider: models.reporter.provider,
      model: models.reporter.model,
      systemPrompt: `You are writing a comprehensive analysis report for the appellant explaining exactly how their case was researched, what each AI specialist found, and how their objection was drafted. Write for an intelligent non-expert — clear, accessible, specific.

The report must have these sections with markdown headings:

## Dokumentenanalyse
What key facts and legal details were extracted from the uploaded document. Reference specific fields found (amounts, dates, authorities, legal §§). Explain why each is relevant to the appeal.

## Entwicklung der Rückfragen
What each specialist was looking for when proposing follow-up questions. How the questions were consolidated and refined. Which questions were merged, removed, or split — and why.

## Strategie des Einspruchs
The legal approach the initial draft took. Which §§ and case law were invoked and why. What the core argument is.

## Rechtliche Überprüfung
Concrete errors or improvements the Legal Reviewer found. How they changed the final letter.

## Faktenprüfung
Which legal references were verified, corrected, or updated with current case law. Specific §§ or court rulings that were confirmed or replaced.

## Behörden-Perspektive
The specific weaknesses the adversarial analysis identified. How the final letter pre-emptively addresses each one.

## Endergebnis
How all four inputs were synthesised into the final letter. What makes it legally sound.

Length: 600-1000 words. Use concrete specifics throughout — reference actual §§, findings, and arguments from the case. Avoid vague generalisations.

LANGUAGE DIRECTIVE: Write the entire report in ${uiLang}.`,
    },
  }
}

// ── Question-phase agent helper ───────────────────────────────────────────────
// Used exclusively by /api/analyze to run the multi-agent question pipeline.
// Returns only the 4 question-phase agents (proposers + consolidator).

export function buildQuestionAgents(
  models: PipelineModels,
  uiLanguage: string
): Record<
  'question-proposer-reviewer' | 'question-proposer-factchecker' | 'question-proposer-adversary' | 'question-consolidator',
  AgentConfig
> {
  const allAgents = buildAgents(models, uiLanguage, 'de')
  return {
    'question-proposer-reviewer':    allAgents['question-proposer-reviewer'],
    'question-proposer-factchecker': allAgents['question-proposer-factchecker'],
    'question-proposer-adversary':   allAgents['question-proposer-adversary'],
    'question-consolidator':         allAgents['question-consolidator'],
  }
}

// --- Core agent call ---
// Each provider call is raced against PIPELINE.agentTimeoutMs to prevent indefinite hangs.

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Agent timeout: ${label} exceeded ${ms}ms`)), ms)
    ),
  ])
}

export async function callAgent(
  config: AgentConfig,
  userMessage: string
): Promise<string> {
  const timeoutMs = PIPELINE.agentTimeoutMs
  logger.debug(`[callAgent:${config.role}] API call`, {
    provider: config.provider,
    model: config.model,
    systemPromptChars: config.systemPrompt.length,
    userMessageChars: userMessage.length,
    maxTokens: PIPELINE.maxTokens,
    timeoutMs,
  })

  if (config.provider === 'anthropic') {
    const client = getAnthropic()
    const response = await withTimeout(
      client.messages.create({
        model: config.model,
        max_tokens: PIPELINE.maxTokens,
        system: config.systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
      timeoutMs,
      `anthropic/${config.model}`
    )
    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
    logger.debug(`[callAgent:${config.role}] Anthropic response`, {
      inputTokens: response.usage?.input_tokens,
      outputTokens: response.usage?.output_tokens,
      stopReason: response.stop_reason,
      outputChars: text.length,
    })
    return text
  }

  if (config.provider === 'openai') {
    const client = getOpenAI()
    const response = await withTimeout(
      client.chat.completions.create({
        model: config.model,
        max_tokens: PIPELINE.maxTokens,
        messages: [
          { role: 'system', content: config.systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
      timeoutMs,
      `openai/${config.model}`
    )
    const text = response.choices[0]?.message?.content ?? ''
    logger.debug(`[callAgent:${config.role}] OpenAI response`, {
      inputTokens: response.usage?.prompt_tokens,
      outputTokens: response.usage?.completion_tokens,
      finishReason: response.choices[0]?.finish_reason,
      outputChars: text.length,
    })
    return text
  }

  if (config.provider === 'xai') {
    // Grok uses an OpenAI-compatible API — same call shape, different client base URL.
    const client = getXAI()
    const response = await withTimeout(
      client.chat.completions.create({
        model: config.model,
        max_tokens: PIPELINE.maxTokens,
        messages: [
          { role: 'system', content: config.systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
      timeoutMs,
      `xai/${config.model}`
    )
    const text = response.choices[0]?.message?.content ?? ''
    logger.debug(`[callAgent:${config.role}] xAI/Grok response`, {
      inputTokens: response.usage?.prompt_tokens,
      outputTokens: response.usage?.completion_tokens,
      finishReason: response.choices[0]?.finish_reason,
      outputChars: text.length,
    })
    return text
  }

  if (config.provider === 'perplexity') {
    const client = getPerplexity()
    const response = await withTimeout(
      client.chat.completions.create({
        model: config.model,
        max_tokens: PIPELINE.maxTokens,
        messages: [
          { role: 'system', content: config.systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
      timeoutMs,
      `perplexity/${config.model}`
    )
    const text = response.choices[0]?.message?.content ?? ''
    logger.debug(`[callAgent:${config.role}] Perplexity response`, {
      inputTokens: response.usage?.prompt_tokens,
      outputTokens: response.usage?.completion_tokens,
      finishReason: response.choices[0]?.finish_reason,
      outputChars: text.length,
    })
    return text
  }

  if (config.provider === 'google') {
    const client = getGoogleAI()
    const model = client.getGenerativeModel({
      model: config.model,
      systemInstruction: config.systemPrompt,
    })
    const result = await withTimeout(
      model.generateContent(userMessage),
      timeoutMs,
      `google/${config.model}`
    )
    const text = result.response.text()
    logger.debug(`[callAgent:${config.role}] Google response`, {
      outputChars: text.length,
      usageMetadata: result.response.usageMetadata,
    })
    return text
  }

  throw new Error(`Unknown provider: ${config.provider}`)
}

/**
 * Full multi-agent pipeline:
 * 1. Drafter      (Claude Sonnet / Gemini Flash in dev)  — creates initial Einspruch
 * 2. Reviewer     (Gemini Pro)                           — checks for legal/math errors
 * 3. FactCheck    (Perplexity Sonar Pro)                 — verifies citations with live web
 * 4. Adversary    (Grok 3 / Gemini Flash in dev)         — attacks from authority perspective
 * 5. Consolidator (GPT-4o / Gemini Flash in dev)         — final bulletproof version
 *
 * Steps 2–4 run in parallel (Promise.all) — reduces wall-clock time by ~37%.
 */
type ProgressEvent =
  | { type: 'agent_start'; data: { role: AgentRole } }
  | {
      type: 'agent_complete'
      data: {
        role: AgentRole
        provider: string
        model: string
        durationMs: number
        summary: string
        draftPreview?: string
      }
    }

export async function orchestrate(
  bescheidData: BescheidData,
  documents: { name: string; text: string }[],
  userAnswers: Record<string, string>,
  outputLanguage = 'de',
  uiLanguage = 'de',
  onProgress?: (event: ProgressEvent) => void,
  questionProposals?: string
): Promise<{ outputs: AgentOutput[]; finalDraft: string; pipelineMode: string }> {
  const t0Pipeline = Date.now()
  const { models, mode: pipelineModeUsed } = await getActiveModels()

  logger.debug('[PIPELINE] ─── Orchestrator start', {
    pipelineMode: pipelineModeUsed,
    outputLanguage,
    uiLanguage,
    docCount: documents.length,
    answerCount: Object.keys(userAnswers).length,
    agents: {
      drafter:      `${models.drafter.provider}/${models.drafter.model}`,
      reviewer:     `${models.reviewer.provider}/${models.reviewer.model}`,
      factchecker:  `${models.factchecker.provider}/${models.factchecker.model}`,
      adversary:    `${models.adversary.provider}/${models.adversary.model}`,
      consolidator: `${models.consolidator.provider}/${models.consolidator.model}`,
    },
  })

  const AGENTS = buildAgents(models, uiLanguage, outputLanguage)
  const outputs: AgentOutput[] = []
  const context = buildContext(bescheidData, documents, userAnswers)

  logger.debug('[PIPELINE] ─── Context built', {
    contextChars: context.length,
    hasDocuments: documents.length > 0,
    hasAnswers: Object.keys(userAnswers).length > 0,
  })

  async function runAgent(
    role: AgentRole,
    agentConfig: AgentConfig,
    prompt: string,
    opts?: { draftPreview?: boolean }
  ): Promise<string> {
    logger.debug(`[PIPELINE:${role}] → Starting`, {
      provider: agentConfig.provider,
      model: agentConfig.model,
      promptChars: prompt.length,
    })
    onProgress?.({ type: 'agent_start', data: { role } })
    const t = Date.now()
    const content = await callAgent(agentConfig, prompt)
    const durationMs = Date.now() - t
    logger.agent(role, agentConfig.provider, agentConfig.model, durationMs)
    logger.debug(`[PIPELINE:${role}] ✓ Complete`, {
      durationMs,
      outputChars: content.length,
      outputPreview: content.slice(0, 120).replace(/\n/g, ' '),
    })
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
  logger.debug('[PIPELINE] ─── STEP 1: Drafter (sequential)')
  const draftContent = await runAgent(
    'drafter',
    AGENTS.drafter,
    `Draft an objection letter based on the following case data:\n\n${context}`,
    { draftPreview: true }
  )
  logger.debug('[PIPELINE] ─── STEP 1 complete', {
    draftChars: draftContent.length,
    elapsedMs: Date.now() - t0Pipeline,
  })

  // Steps 2–4: Run in parallel — all analyse the same draft independently.
  // Reviewer, FactChecker and Adversary do not depend on each other's output,
  // so Promise.all() cuts the middle-stage wall-clock time to max(three) instead of sum(three).
  logger.debug('[PIPELINE] ─── STEP 2–4: Reviewer + FactChecker + Adversary (parallel)')
  const t0Parallel = Date.now()
  const [reviewContent, factCheckContent, adversaryContent] = await Promise.all([
    runAgent(
      'reviewer',
      AGENTS.reviewer,
      `Review this objection letter for errors:\n\n${draftContent}\n\nOriginal case data:\n${context}`
    ),
    runAgent(
      'factchecker',
      AGENTS.factchecker,
      `Verify the legal references in this objection letter:\n\n${draftContent}`
    ),
    runAgent(
      'adversary',
      AGENTS.adversary,
      `Analyse this objection letter from the authority's perspective:\n\n${draftContent}\n\nOriginal case data:\n${context}`
    ),
  ])
  logger.debug('[PIPELINE] ─── STEP 2–4 complete (all parallel)', {
    wallClockMs: Date.now() - t0Parallel,
    reviewChars: reviewContent.length,
    factCheckChars: factCheckContent.length,
    adversaryChars: adversaryContent.length,
  })

  // Step 5: Consolidate — receives ALL four prior agent outputs.
  logger.debug('[PIPELINE] ─── STEP 5: Consolidator (sequential)')
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

  // Step 6: Reporter — synthesises the entire pipeline into a readable analysis report.
  // This runs after the final draft is complete so it can reference all outcomes.
  logger.debug('[PIPELINE] ─── STEP 6: Reporter (sequential)')
  const reporterPrompt = `Write the analysis report for this case based on the complete pipeline output below.

EXTRACTED DOCUMENT DATA:
${context}

${questionProposals ? `QUESTION DEVELOPMENT (proposals from 3 specialists):
${questionProposals}

` : ''}USER ANSWERS TO FOLLOW-UP QUESTIONS:
${Object.keys(userAnswers).length > 0
  ? Object.entries(userAnswers).map(([q, a]) => `${q}: ${a || '(not answered)'}`).join('\n')
  : '(no answers — questions were skipped)'}

INITIAL DRAFT:
${draftContent}

LEGAL REVIEW — errors and improvements found:
${reviewContent}

FACT-CHECK — legal references verified:
${factCheckContent}

ADVERSARIAL ANALYSIS — authority perspective and weaknesses:
${adversaryContent}

FINAL LETTER (after consolidation):
${finalDraft}`

  await runAgent('reporter', AGENTS.reporter, reporterPrompt)

  const totalMs = Date.now() - t0Pipeline
  logger.info('Pipeline complete', {
    totalAgents: outputs.length,
    pipelineMode: pipelineModeUsed,
  })
  logger.debug('[PIPELINE] ─── All steps complete', {
    totalMs,
    finalDraftChars: finalDraft.length,
    agentBreakdown: outputs.map((o) => ({
      role: o.role,
      durationMs: o.durationMs,
      provider: o.provider,
    })),
  })

  return { outputs, finalDraft, pipelineMode: pipelineModeUsed }
}

// --- Helpers ---

function buildContext(
  bescheid: BescheidData,
  documents: { name: string; text: string }[],
  answers: Record<string, string>
): string {
  const parts: string[] = []

  const docTypeInfo = bescheid.docType as { category?: string; label?: string } | undefined
  const sectionHeading = docTypeInfo?.label ?? 'Dokument-Daten'

  const fieldLines = Object.entries(bescheid)
    .filter(([key]) => key !== 'docType')
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join('\n')

  parts.push(`## ${sectionHeading}\n${fieldLines}`)

  if (documents.length > 0) {
    parts.push('## Dokumente')
    for (const doc of documents) {
      parts.push(`### ${doc.name}\n${doc.text}`)
    }
  }

  if (Object.keys(answers).length > 0) {
    parts.push('## Zusätzliche Angaben des Antragstellers')
    for (const [q, a] of Object.entries(answers)) {
      if (!a.trim()) continue
      // Translate N/A sentinel — should have been remapped client-side, but defensive fallback
      const displayAnswer = a === '__na__' ? 'Nicht bekannt / N/A' : a
      parts.push(`${q}: ${displayAnswer}`)
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
