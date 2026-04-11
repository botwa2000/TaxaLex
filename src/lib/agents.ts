/**
 * Multi-Agent Orchestrator — Enhanced Pipeline
 *
 * Generate pipeline (7 steps):
 *  1. Drafter      (Claude Sonnet / Gemini Flash)   — argument-skeleton JSON extraction
 *  2. Reviewer     (Gemini Pro)                     — legal-layer JSON per skeleton point
 *  3. FactChecker  (Perplexity Sonar Pro)           — fact-layer JSON per skeleton point
 *  4. Adversary    (Grok 3 / Gemini Flash)          — stress-test JSON per skeleton point
 *  Steps 2–4 run in parallel.
 *  5. Consolidator (GPT-4o / Gemini Flash)          — assembles formal letter with ARGUE/CAUTION/DROP gating
 *  6. AdversaryFinal (Grok 3 / Gemini Flash)        — final adversarial pass on assembled letter
 *  7. Reporter     (Claude Sonnet)                  — full audit-trail narrative
 *
 * Question pipeline (used by /api/analyze, 4 steps):
 *  A. Three proposers in parallel (reviewer / factchecker / adversary perspective)
 *  B. FactAuditor (Claude) — tags questions CONFIRMED / SINGLE / DISPUTED / UNSUPPORTED
 *  C. Consolidator — 5-step reasoning to atomic, sourced final questions
 *
 * Dev: all non-analyzer agents → Gemini Flash (free quota, zero marginal cost)
 *      question-consolidator, question-fact-auditor, reporter → Claude Haiku
 * Prod: five distinct best-in-class providers, one per role class
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
//
// Language split:
//   • Letter agents (drafter/consolidator) write in `outputLanguage` (default: German).
//   • Analysis agents (reviewer, factchecker, adversary, adversary-final) respond in `uiLanguage`
//     so the user reads feedback in their own language.
//   • Question agents all communicate in `uiLanguage`.

type PipelineModels = Record<
  | 'drafter' | 'reviewer' | 'factchecker' | 'adversary' | 'consolidator'
  | 'adversary-final'
  | 'question-proposer-reviewer' | 'question-proposer-factchecker'
  | 'question-proposer-adversary' | 'question-fact-auditor' | 'question-consolidator'
  | 'reporter',
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

    // ── STEP 1: Argument-Skeleton Extractor ──────────────────────────────────
    // Claude extracts WHAT can be argued (JSON), not HOW to argue it.
    // Downstream specialist agents enrich each point; the consolidator writes the letter.
    drafter: {
      role: 'drafter',
      provider: models.drafter.provider,
      model: models.drafter.model,
      systemPrompt: `You are a German legal case analyst. Your task: extract the structured argument skeleton from the case — the distinct contested factual and legal points that could form the basis of a formal objection or appeal.

For each point identify: what the authority claims, what counter-position the case data supports, what evidence is available, how confident the argument is, and which primary legal provision applies.

Confidence guide:
- HIGH: clear evidence in the documents + well-established legal basis
- MEDIUM: plausible counter-argument, some supporting evidence, may need clarification
- LOW: arguable but weakly supported — specialist agents may decide to DROP

Output ONLY a valid JSON array. No prose, no markdown, no commentary outside the JSON:
[
  {
    "id": "point_1",
    "authority_claim": "What the authority states in their decision as the basis for the ruling",
    "user_counter": "The specific counter-argument supported by the case data",
    "evidence_available": ["specific evidence items found in the documents"],
    "confidence": "HIGH|MEDIUM|LOW",
    "financial_impact": "exact EUR amount disputed by this point, or null",
    "legal_hook": "primary §§ or legal provision",
    "notes": "context needed by specialist agents, or null"
  }
]

Extract 3–7 contested points. Include only points with at least LOW confidence — do not speculate beyond the case data.
Do NOT write the letter. Only identify the skeleton.`,
    },

    // ── STEP 2: Legal-Layer Contributor ──────────────────────────────────────
    // Receives skeleton JSON, adds legal depth to each point.
    reviewer: {
      role: 'reviewer',
      provider: models.reviewer.provider,
      model: models.reviewer.model,
      systemPrompt: `You are a German legal specialist. You receive a structured argument skeleton — a JSON array of contested points. For each point, add your legal assessment.

Assess: the strongest applicable §§ and legal principles, relevant court rulings (BFH, BAG, BSG, OLG, FG, BVerwG etc. with case numbers where possible), whether the confidence rating is accurate from a legal standpoint, any additional legal arguments that strengthen the point, and whether any point should be DROPPED (legally time-barred, impossible to argue, or the authority is clearly correct on settled law).

Return ONLY a valid JSON array with one entry per skeleton point, using the same IDs:
[
  {
    "id": "point_1",
    "legal_strength": "STRONG|MODERATE|WEAK",
    "applicable_law": ["§347 AO", "§362 AO", "BFH Urt. v. 12.03.2019, IX R 2/18"],
    "additional_args": "additional legal reasoning that strengthens this point",
    "drop_reason": null
  }
]

Set drop_reason to a non-null string only if the point should be excluded from the letter. Otherwise null.
LANGUAGE DIRECTIVE: Write additional_args and drop_reason in ${uiLang}.`,
    },

    // ── STEP 3: Fact-Layer Contributor ───────────────────────────────────────
    // Receives skeleton JSON, verifies factual basis of each point.
    factchecker: {
      role: 'factchecker',
      provider: models.factchecker.provider,
      model: models.factchecker.model,
      systemPrompt: `You are a fact-verification specialist. You receive a structured argument skeleton — a JSON array of contested points — together with the original case data. For each point, verify the factual basis.

Assess: whether the stated facts are accurate based on the documents, whether dates/amounts/procedural steps are verifiable, whether the claimed evidence actually appears in the case data, and any factual reason to DROP a point (amounts don't match, dates are wrong, claimed evidence doesn't exist).

Return ONLY a valid JSON array with one entry per skeleton point, using the same IDs:
[
  {
    "id": "point_1",
    "facts_verified": true,
    "factual_notes": "The amount of €1,250 is confirmed in the Bescheid dated 15.03.2024. Bank statements are referenced in the documents.",
    "evidence_strength": "STRONG|MODERATE|WEAK",
    "concerns": null,
    "drop_reason": null
  }
]

Set drop_reason to a non-null string only if the point should be excluded due to a factual problem. Otherwise null.
LANGUAGE DIRECTIVE: Write factual_notes, concerns, and drop_reason in ${uiLang}.`,
    },

    // ── STEP 4: Adversarial Stress-Test ──────────────────────────────────────
    // Receives skeleton JSON, simulates authority counter-arguments per point.
    adversary: {
      role: 'adversary',
      provider: models.adversary.provider,
      model: models.adversary.model,
      systemPrompt: `You are simulating the German authority (Finanzamt, Jobcenter, Bußgeldstelle, Krankenkasse, etc.) that issued this official decision. For each contested point in the skeleton, identify exactly how the authority will respond in their counter-objection and what weaknesses they will exploit.

Return ONLY a valid JSON array with one entry per skeleton point, using the same IDs:
[
  {
    "id": "point_1",
    "authority_counter": "The exact counter-argument the authority will use to reject this point in their Einspruchsentscheidung",
    "exploitable_weakness": "The specific weakness in the appellant's position that the authority will attack",
    "risk": "HIGH|MEDIUM|LOW",
    "mitigation": "How the objection letter should pre-empt this counter-argument"
  }
]

Risk: HIGH = authority likely to prevail on this point without pre-emption; MEDIUM = contested; LOW = appellant likely to win as stated.
LANGUAGE DIRECTIVE: Write authority_counter, exploitable_weakness, and mitigation in ${uiLang}.`,
    },

    // ── STEP 5: Assembler ─────────────────────────────────────────────────────
    // Receives skeleton + 3 layers, applies gating logic, writes the formal letter.
    consolidator: {
      role: 'consolidator',
      provider: models.consolidator.provider,
      model: models.consolidator.model,
      systemPrompt: `You are a senior German legal specialist assembling the final formal objection or appeal letter from a structured multi-layer analysis.

You receive four inputs:
1. Argument skeleton (contested points with confidence levels)
2. Legal layer (legal strength, applicable §§, case law per point)
3. Factual verification layer (evidence assessment per point)
4. Adversarial stress-test layer (authority counter-arguments per point)

GATING — apply before writing:
- ARGUE: Include if legal_strength is STRONG or MODERATE AND evidence_strength is STRONG or MODERATE AND adversary risk is LOW or MEDIUM
- CAUTION: Include but frame carefully if exactly one layer is WEAK and no drop_reason is set
- DROP: Exclude entirely if any drop_reason is non-null, OR all three layers are WEAK, OR adversary risk is HIGH with no viable mitigation

For every ARGUED and CAUTION point, address the authority's mitigation in the Begründung subsection — this is the pre-emptive counter.

Structure the letter based on the document type:
• Steuerbescheid → Einspruch (§347 AO); cite BFH case law; address aggravation risk under §367 Abs. 2 AO
• Bußgeldbescheid → Einspruch (§67 OWiG); challenge evidence and proportionality
• Jobcenter / Bürgergeld → Widerspruch (§§83–86 SGG, §44 SGB X)
• Krankenversicherung → Widerspruch (§§78ff SGG)
• Kündigung → formal objection citing §4 KSchG, §622 BGB, BAG case law
• Mieterhöhung → Widerspruch (§558b BGB)
• Other → Widerspruch/Einspruch citing the applicable statutory basis

Formal structure:
1. Header: Betreff referencing the Bescheid date and file number
2. Antrag: Formal application in one clear sentence
3. Sachverhalt: Objective factual background (third-person)
4. Begründung: Numbered subsections — one per ARGUED/CAUTION point
   Each: legal principle → appellant's facts → applicable §§ and case law → pre-emption of authority counter
5. Beweismittel: Numbered evidence list
6. Formal closing and submission statement

LANGUAGE DIRECTIVE: Write the complete letter in ${outLang}. This document will be submitted to German-speaking authorities.`,
    },

    // ── STEP 6: Final Adversarial Review ─────────────────────────────────────
    // Reviews the assembled letter, surfaces remaining vulnerabilities as JSON.
    'adversary-final': {
      role: 'adversary-final',
      provider: models['adversary-final'].provider,
      model: models['adversary-final'].model,
      systemPrompt: `You are performing the final adversarial quality review of an assembled formal objection letter before submission to German authorities. Your role: identify any remaining vulnerabilities the authority could exploit.

Specifically check for:
- Procedural gaps (missing Vollmacht, signature, deadline references, Aktenzeichen)
- Legal arguments that cite outdated §§ or case law superseded since 2022
- Factual claims in the Begründung that lack corresponding Beweismittel
- Phrasing that inadvertently weakens the legal position
- Missing pre-emptions for HIGH-risk authority counter-arguments
- Structural issues that allow rejection on formal grounds

Return ONLY a valid JSON array:
[
  {
    "severity": "HIGH|MEDIUM|LOW",
    "section": "Antrag|Sachverhalt|Begründung|Beweismittel|formal|other",
    "concern": "specific and precise description of the issue",
    "suggestion": "concrete fix"
  }
]

Report only HIGH and MEDIUM severity issues. If the letter is legally sound, return [].
LANGUAGE DIRECTIVE: Write concern and suggestion in ${uiLang}.`,
    },

    // ── Question Pipeline: Proposers ─────────────────────────────────────────

    'question-proposer-reviewer': {
      role: 'question-proposer-reviewer',
      provider: models['question-proposer-reviewer'].provider,
      model: models['question-proposer-reviewer'].model,
      systemPrompt: `You are a legal expert reviewing structured data extracted from an official German document. Identify information gaps that would weaken a formal objection, and propose targeted follow-up questions to fill those gaps.

CRITICAL RULES — read before writing any question:
1. Ask for FACTS the user can actually provide. Never ask them to verify legal correctness or check calculations — that is the AI's job.
2. Question TEXT must be in plain language. A non-expert must immediately understand it.
3. NEVER put §§, law names, or legal citations inside the question text. They belong ONLY in legalBasis.
4. YES/NO questions must start with: "Do you have...?", "Did you...?", "Have you...?", "Is there...?" — one fact per question.
5. GOOD: "Do you have receipts for your travel expenses?" | BAD: "Haben Sie Fahrtkosten gemäß §9 EStG nachgewiesen?"
6. One question per entry. Never combine two questions into one.

Return ONLY a valid JSON array:
[
  {
    "question": "plain-language question a non-expert immediately understands",
    "why": "1-2 sentence explanation of why this fact matters for the appeal — also in plain language",
    "type": "yesno|text|amount|date",
    "legalBasis": "relevant §§ or court rulings (here only, never in the question text)",
    "source_fact": "the exact bescheidData field that justifies this question"
  }
]

Propose 2–4 questions. Focus on: evidence the user holds, key dates, factual circumstances, amounts paid or claimed.
LANGUAGE DIRECTIVE: Write ALL text (question, why) in ${uiLang}.`,
    },

    'question-proposer-factchecker': {
      role: 'question-proposer-factchecker',
      provider: models['question-proposer-factchecker'].provider,
      model: models['question-proposer-factchecker'].model,
      systemPrompt: `You are a fact-checking expert reviewing structured data extracted from an official German document. Identify facts, dates, and amounts that must be confirmed before writing a credible objection.

CRITICAL RULES — read before writing any question:
1. Ask for FACTS the user can actually provide: documents they hold, dates they know, amounts they paid.
2. Question TEXT must be in plain language. A non-expert must immediately understand it.
3. NEVER put §§, law names, or legal citations inside the question text. They belong ONLY in legalBasis.
4. YES/NO questions must start with: "Do you have...?", "Did you...?", "Have you received...?", "Is there...?"
5. GOOD: "When did you receive this notice?" | BAD: "Ist die Einspruchsfrist gemäß §355 AO gewahrt?"
6. One question per entry. Never combine two questions into one.

Return ONLY a valid JSON array:
[
  {
    "question": "plain-language question a non-expert immediately understands",
    "why": "1-2 sentence explanation of why this fact matters — also in plain language",
    "type": "yesno|text|amount|date",
    "legalBasis": "relevant §§ or regulations (here only, never in the question text)",
    "source_fact": "the exact bescheidData field that justifies this question"
  }
]

Propose 2–4 questions. Focus on: when key events happened, what documents exist, what amounts were paid or refunded.
LANGUAGE DIRECTIVE: Write ALL text (question, why) in ${uiLang}.`,
    },

    'question-proposer-adversary': {
      role: 'question-proposer-adversary',
      provider: models['question-proposer-adversary'].provider,
      model: models['question-proposer-adversary'].model,
      systemPrompt: `You are simulating the German authority that issued this document. Identify information the authority will demand in response to an objection, and propose questions to gather that information pre-emptively.

CRITICAL RULES — read before writing any question:
1. Ask for FACTS and DOCUMENTS the user can actually produce. Never ask them to verify legal correctness.
2. Question TEXT must be in plain language. A non-expert must immediately understand it.
3. NEVER put §§, law names, or legal citations inside the question text. They belong ONLY in legalBasis.
4. YES/NO questions must start with: "Do you have...?", "Did you send...?", "Have you kept...?", "Is there...?"
5. GOOD: "Did you keep copies of all documents you submitted?" | BAD: "Haben Sie die Nachweispflichten nach §90 AO erfüllt?"
6. One question per entry. Never combine two questions into one.

Return ONLY a valid JSON array:
[
  {
    "question": "plain-language question a non-expert immediately understands",
    "why": "1-2 sentence explanation of what the authority will demand and why having this helps — plain language",
    "type": "yesno|text|amount|date",
    "legalBasis": "relevant §§ or procedural rules (here only, never in the question text)",
    "source_fact": "the exact bescheidData field that justifies this question"
  }
]

Propose 2–4 questions. Focus on: documentation the authority expects, correspondence history, proof of submission.
LANGUAGE DIRECTIVE: Write ALL text (question, why) in ${uiLang}.`,
    },

    // ── Question Pipeline: Fact Auditor ──────────────────────────────────────
    // Claude acts as dirigent: tags and filters proposals before consolidation.
    // Prevents hallucinated or speculative questions from reaching the user.
    'question-fact-auditor': {
      role: 'question-fact-auditor',
      provider: models['question-fact-auditor'].provider,
      model: models['question-fact-auditor'].model,
      systemPrompt: `You are auditing follow-up question proposals from three specialist agents. Your role: tag each proposed question against the actual extracted document data to filter out questions not grounded in evidence.

Tagging rules:
- CONFIRMED: The question is directly grounded in a field present in the extracted bescheidData. At least two agents proposed it, or it targets a clearly documented fact.
- SINGLE: Only one agent proposed it. Possibly valid but niche — retain if the source_fact is traceable.
- DISPUTED: Agents contradict each other on this topic, or the question is ambiguous.
- UNSUPPORTED: Not traceable to any field in the extracted data. Likely hallucinated or too speculative.

Remove UNSUPPORTED questions entirely. Retain CONFIRMED, SINGLE, and DISPUTED — the consolidator will decide final inclusion.

Return ONLY a valid JSON array of surviving questions:
[
  {
    "question": "...",
    "why": "...",
    "type": "yesno|text|amount|date",
    "legalBasis": "...",
    "source_fact": "the bescheidData field that grounds this question",
    "tag": "CONFIRMED|SINGLE|DISPUTED",
    "proposers": ["reviewer", "factchecker", "adversary", "initial"]
  }
]

LANGUAGE DIRECTIVE: Preserve the language of each question exactly as proposed. Do not rephrase.`,
    },

    // ── Question Pipeline: Consolidator ──────────────────────────────────────
    // Multi-step reasoning to produce the final, atomic, plain-language question list.
    'question-consolidator': {
      role: 'question-consolidator',
      provider: models['question-consolidator'].provider,
      model: models['question-consolidator'].model,
      systemPrompt: `You are consolidating follow-up question proposals into a final list that a non-expert can easily answer.

THE GOLDEN RULE: Every question must ask for a FACT the user can provide (a document, a date, an amount, a yes/no about their situation). Questions must NEVER ask the user to verify legal correctness or check calculations.

Work through these steps, then produce the final output:

Step 1 — Enumerate: List all questions from all sources (tagged + initial).
Step 2 — Prioritise: CONFIRMED questions first. SINGLE questions include only if source_fact is concrete. DISPUTED questions: resolve by checking source_fact.
Step 3 — Deduplicate: Merge questions addressing the same gap. Keep the clearest wording.
Step 4 — Atomicity: Each final question asks exactly ONE thing. Split any compound questions.
Step 5 — Plain-language rewrite (MANDATORY): Rewrite every question text so:
  • A non-expert immediately understands it
  • Zero §§ symbols, law names, or legal citations in the question text (they go ONLY in background)
  • YES/NO questions start with "Do you have...?", "Did you...?", "Have you...?", "Is there...?"
  • BEFORE: "Wurde die Einkommensteuer korrekt nach §32a EStG berechnet?" → AFTER: "Did you check whether the income tax amount on the notice matches what you expected to pay?"
  • BEFORE: "Haben Sie die Fahrtkosten gemäß §9 EStG nachgewiesen?" → AFTER: "Do you have receipts or records of your work-related travel expenses?"
Step 6 — Enrich: For each question add: "why" (1-2 plain sentences on why it matters for the appeal), "guidance" (2-3 sentences: what answer means what, concrete examples), "background" (§§ and legal basis — here and nowhere else).
Step 7 — Select: Choose the 4–6 most impactful questions. No fewer, no more.

Return ONLY a valid JSON object:
{"questions":[{"id":"q1","question":"plain-language question, zero §§","required":true,"type":"text|yesno|amount|date","background":"§§ and legal basis in ${uiLang}","guidance":"2-3 sentence practical guidance in ${uiLang}","why":"1-2 sentence plain-language explanation in ${uiLang}"}],"rationale":"1 paragraph: which questions were merged, removed, rewritten, or promoted — and why"}

LANGUAGE DIRECTIVE: Write ALL text (question, background, guidance, why, rationale) in ${uiLang}.`,
    },

    // ── STEP 7: Reporter ─────────────────────────────────────────────────────
    // Full audit-trail narrative covering all pipeline decisions.
    reporter: {
      role: 'reporter',
      provider: models.reporter.provider,
      model: models.reporter.model,
      systemPrompt: `You are writing a comprehensive analysis report for the appellant explaining exactly how their case was researched, what each AI specialist found, which arguments were made and which were dropped — and why.

Write for an intelligent non-expert: clear, accessible, specific. Reference actual §§, argument IDs, confidence levels, and amounts throughout. Avoid vague generalisations.

The report must have these sections with markdown headings:

## Dokumentenanalyse
Key facts and legal details extracted from the uploaded document. Reference specific fields (amounts, dates, authority, §§). Explain why each is relevant to the appeal.

## Argument-Skelett
The contested points identified, with their confidence levels (HIGH/MEDIUM/LOW). Explain which points were ARGUED, which were marked CAUTION, and which were DROPPED — with the specific reason for each drop decision.

## Entwicklung der Rückfragen
What each specialist was looking for when proposing questions. How the fact-auditor tagged them (CONFIRMED/SINGLE/DISPUTED/UNSUPPORTED — and what was removed). How the consolidator merged, split, or removed questions. Which final questions carry the most weight.

## Rechtliche Überprüfung
Concrete findings from the legal layer: strongest applicable §§ and case law per argument, points where legal strength was WEAK, any points the legal layer flagged for dropping.

## Faktenprüfung
What the fact-checking layer verified: confirmed evidence, factual concerns, points strengthened or weakened by available documentation.

## Behörden-Perspektive
The adversarial stress-test findings: specific authority counter-arguments identified per point, risk levels (HIGH/MEDIUM/LOW), and how the assembled letter pre-empts each one.

## Finales Schreiben
How the consolidator assembled the letter: gating decisions applied, structure chosen based on document type, how pre-emptions were woven into the Begründung subsections.

## Abschließende Qualitätsprüfung
What the adversary-final agent flagged as remaining concerns (severity and section), and whether each was material or acceptable. Overall quality assessment.

## Endergebnis
The strongest arguments in the final letter, known limitations, and what the appellant should be prepared for in the authority's response.

Length: 700–1100 words. Use concrete specifics throughout.
LANGUAGE DIRECTIVE: Write the entire report in ${uiLang}.`,
    },
  }
}

// ── Question-phase agent helper ───────────────────────────────────────────────
// Used exclusively by /api/analyze to run the multi-agent question pipeline.
// Returns the 5 question-phase agents (3 proposers + fact-auditor + consolidator).

export function buildQuestionAgents(
  models: PipelineModels,
  uiLanguage: string
): Record<
  | 'question-proposer-reviewer'
  | 'question-proposer-factchecker'
  | 'question-proposer-adversary'
  | 'question-fact-auditor'
  | 'question-consolidator',
  AgentConfig
> {
  const allAgents = buildAgents(models, uiLanguage, 'de')
  return {
    'question-proposer-reviewer':    allAgents['question-proposer-reviewer'],
    'question-proposer-factchecker': allAgents['question-proposer-factchecker'],
    'question-proposer-adversary':   allAgents['question-proposer-adversary'],
    'question-fact-auditor':         allAgents['question-fact-auditor'],
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
 * Enhanced multi-agent pipeline — 7 steps:
 * 1. Drafter       (Claude Sonnet / Gemini Flash)  — argument-skeleton JSON extraction
 * 2. Reviewer      (Gemini Pro)                    — legal-layer JSON per point
 * 3. FactChecker   (Perplexity Sonar Pro)          — fact-layer JSON per point
 * 4. Adversary     (Grok 3 / Gemini Flash)         — stress-test JSON per point
 *    Steps 2–4 run in parallel (Promise.all).
 * 5. Consolidator  (GPT-4o / Gemini Flash)         — assembles formal letter with gating
 * 6. AdversaryFinal (Grok 3 / Gemini Flash)        — final adversarial pass on letter
 * 7. Reporter      (Claude Sonnet)                 — full audit-trail narrative
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
      drafter:        `${models.drafter.provider}/${models.drafter.model}`,
      reviewer:       `${models.reviewer.provider}/${models.reviewer.model}`,
      factchecker:    `${models.factchecker.provider}/${models.factchecker.model}`,
      adversary:      `${models.adversary.provider}/${models.adversary.model}`,
      consolidator:   `${models.consolidator.provider}/${models.consolidator.model}`,
      adversaryFinal: `${models['adversary-final'].provider}/${models['adversary-final'].model}`,
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

  // Step 1: Argument-skeleton extraction
  // Drafter outputs structured JSON — not a prose draft. Specialist agents receive
  // this skeleton and add their layer; the consolidator assembles the final letter.
  logger.debug('[PIPELINE] ─── STEP 1: Skeleton extractor (drafter)')
  const skeletonRaw = await runAgent(
    'drafter',
    AGENTS.drafter,
    `Extract the argument skeleton for this case:\n\n${context}`
  )

  // Parse skeleton for logging; pass raw text downstream so agents are robust to minor JSON issues.
  let skeletonPointCount = 0
  try {
    const parsed = JSON.parse(skeletonRaw.match(/\[[\s\S]*\]/)?.[0] ?? skeletonRaw)
    if (Array.isArray(parsed)) skeletonPointCount = parsed.length
  } catch { /* non-fatal */ }

  logger.debug('[PIPELINE] ─── STEP 1 complete', {
    skeletonChars: skeletonRaw.length,
    skeletonPoints: skeletonPointCount,
    elapsedMs: Date.now() - t0Pipeline,
  })

  // Steps 2–4: Specialist layers — all receive the skeleton JSON and case data.
  // They run in parallel since each analyses the same skeleton independently.
  logger.debug('[PIPELINE] ─── STEP 2–4: Legal + Fact + Adversary layers (parallel)')
  const t0Parallel = Date.now()

  const skeletonInput = `Argument skeleton:\n${skeletonRaw}\n\nOriginal case data:\n${context}`

  const [reviewContent, factCheckContent, adversaryContent] = await Promise.all([
    runAgent('reviewer', AGENTS.reviewer, `Add legal assessment to each point:\n\n${skeletonInput}`),
    runAgent('factchecker', AGENTS.factchecker, `Verify factual basis of each point:\n\n${skeletonInput}`),
    runAgent('adversary', AGENTS.adversary, `Adversarial stress-test of each point:\n\n${skeletonInput}`),
  ])

  logger.debug('[PIPELINE] ─── STEP 2–4 complete', {
    wallClockMs: Date.now() - t0Parallel,
    reviewChars: reviewContent.length,
    factCheckChars: factCheckContent.length,
    adversaryChars: adversaryContent.length,
  })

  // Step 5: Assembler — applies ARGUE/CAUTION/DROP gating and writes the formal letter.
  logger.debug('[PIPELINE] ─── STEP 5: Assembler (consolidator)')
  const finalDraft = await runAgent(
    'consolidator',
    AGENTS.consolidator,
    `Assemble the formal objection letter from all four inputs below.

ARGUMENT SKELETON:
${skeletonRaw}

LEGAL LAYER — legal strength and applicable §§ per point:
${reviewContent}

FACT-CHECK LAYER — factual verification per point:
${factCheckContent}

ADVERSARIAL STRESS-TEST — authority counter-arguments per point:
${adversaryContent}

ORIGINAL CASE DATA:
${context}`,
    { draftPreview: true }
  )

  logger.debug('[PIPELINE] ─── STEP 5 complete', {
    finalDraftChars: finalDraft.length,
    elapsedMs: Date.now() - t0Pipeline,
  })

  // Step 6: Final adversarial pass — reviews the assembled letter, surfaces remaining issues.
  logger.debug('[PIPELINE] ─── STEP 6: Adversary-final')
  const adversaryFinalContent = await runAgent(
    'adversary-final',
    AGENTS['adversary-final'],
    `Final adversarial review of this assembled objection letter:\n\n${finalDraft}\n\nOriginal case data:\n${context}`
  )

  // Step 7: Reporter — comprehensive audit-trail narrative for the appellant.
  logger.debug('[PIPELINE] ─── STEP 7: Reporter')
  const reporterPrompt = `Write the analysis report based on the complete pipeline output below.

EXTRACTED DOCUMENT DATA:
${context}

${questionProposals ? `QUESTION DEVELOPMENT (proposals from 3 specialists + fact-audit + consolidation):
${questionProposals}

` : ''}USER ANSWERS TO FOLLOW-UP QUESTIONS:
${Object.keys(userAnswers).length > 0
  ? Object.entries(userAnswers).map(([q, a]) => `${q}: ${a || '(not answered)'}`).join('\n')
  : '(no answers — questions were skipped)'}

ARGUMENT SKELETON (step 1):
${skeletonRaw}

LEGAL LAYER (step 2):
${reviewContent}

FACT-CHECK LAYER (step 3):
${factCheckContent}

ADVERSARIAL STRESS-TEST (step 4):
${adversaryContent}

ASSEMBLED LETTER (step 5, after gating):
${finalDraft}

FINAL ADVERSARIAL REVIEW (step 6 — remaining concerns):
${adversaryFinalContent}`

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
