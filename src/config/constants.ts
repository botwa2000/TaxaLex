/**
 * Application-wide constants.
 * Change model names, limits, and timeouts here — nowhere else.
 */

// ── AI Models ─────────────────────────────────────────────────────────────────
//
// Each entry is { provider, model }.  The admin toggles between DEV and PROD via
// the pipeline_mode DB flag (Admin → Overview tab).
//
// HOW TO UPDATE MODELS:
//   • Anthropic: model IDs without a date suffix (e.g. "claude-sonnet-4-6") are
//     provider-maintained aliases that point to the latest stable release in that
//     tier — no action needed when a new version ships.
//     Dated IDs (e.g. "claude-haiku-4-5-20251001") are pinned; bump them here
//     when a new Haiku version is available.
//   • Google: "gemini-2.5-flash" and "gemini-1.5-pro" are stable non-versioned
//     aliases maintained by Google — they auto-update within their tier.
//   • Perplexity: "sonar" and "sonar-pro" are tier aliases, not pinned versions.

export type ModelSpec = {
  provider: 'anthropic' | 'google' | 'perplexity' | 'openai' | 'xai'
  model: string
}

/**
 * DEV tier — ALL agents run on Gemini Flash (free quota, instant, zero marginal cost).
 * Analyzer stays on Anthropic Haiku: the /api/analyze route requires Claude's native
 * PDF/image content blocks — there is no provider-agnostic equivalent.
 */
export const MODELS_DEV = {
  analyzer:                    { provider: 'anthropic', model: 'claude-haiku-4-5-20251001' },
  drafter:                     { provider: 'google',    model: 'gemini-2.5-flash' },
  reviewer:                    { provider: 'google',    model: 'gemini-2.5-flash' },
  factchecker:                 { provider: 'google',    model: 'gemini-2.5-flash' },
  adversary:                   { provider: 'google',    model: 'gemini-2.5-flash' },
  consolidator:                { provider: 'google',    model: 'gemini-2.5-flash' },
  'question-proposer-reviewer':    { provider: 'google',    model: 'gemini-2.5-flash' },
  'question-proposer-factchecker': { provider: 'google',    model: 'gemini-2.5-flash' },
  'question-proposer-adversary':   { provider: 'google',    model: 'gemini-2.5-flash' },
  'question-consolidator':         { provider: 'anthropic', model: 'claude-haiku-4-5-20251001' },
  'reporter':                      { provider: 'anthropic', model: 'claude-haiku-4-5-20251001' },
} as const satisfies Record<string, ModelSpec>

/**
 * PROD tier — five distinct best-in-class models, one per provider.
 *   Drafter      → Claude Sonnet  (Anthropic)  — legal writing, instruction-following
 *   Reviewer     → Gemini 1.5 Pro (Google)     — structured error analysis
 *   FactChecker  → Sonar Pro      (Perplexity) — live-web citation verification
 *   Adversary    → Grok 3         (xAI)        — adversarial reasoning, authority POV
 *   Consolidator → GPT-4o         (OpenAI)     — multi-source synthesis, final letter
 */
export const MODELS_PROD = {
  analyzer:                    { provider: 'anthropic',  model: 'claude-haiku-4-5-20251001' },
  drafter:                     { provider: 'anthropic',  model: 'claude-sonnet-4-6' },
  reviewer:                    { provider: 'google',     model: 'gemini-1.5-pro' },
  factchecker:                 { provider: 'perplexity', model: 'sonar-pro' },
  adversary:                   { provider: 'xai',        model: 'grok-3' },
  consolidator:                { provider: 'openai',     model: 'gpt-4o' },
  'question-proposer-reviewer':    { provider: 'google',     model: 'gemini-1.5-pro' },
  'question-proposer-factchecker': { provider: 'perplexity', model: 'sonar-pro' },
  'question-proposer-adversary':   { provider: 'xai',        model: 'grok-3' },
  'question-consolidator':         { provider: 'anthropic',  model: 'claude-sonnet-4-6' },
  'reporter':                      { provider: 'anthropic',  model: 'claude-sonnet-4-6' },
} as const satisfies Record<string, ModelSpec>

// ── AI Pipeline ───────────────────────────────────────────────────────────────

export const PIPELINE = {
  maxTokens: 8192,
  /** Max tokens for the analyze step — no artificial cap, same as agents */
  analyzeMaxTokens: 8192,
  /** Hard timeout per agent call in ms.
   *  Gemini 2.5 Flash needs up to 90s for a full legal letter on large cases.
   *  Prod models (Sonnet, Grok, GPT-4o) are typically faster but 120s is safe.
   */
  agentTimeoutMs: 120_000,
  /** Max file size accepted for upload (bytes) — Anthropic PDF limit is 32 MB */
  maxUploadBytes: 30 * 1024 * 1024, // 30 MB
  /** Max number of documents per case */
  maxDocuments: 10,
} as const

// ── Auth ──────────────────────────────────────────────────────────────────────

export const AUTH = {
  /** bcrypt rounds — 12 is secure, don't go lower */
  bcryptRounds: 12,
  /** Password reset token TTL in seconds */
  resetTokenTtl: 3600, // 1 hour
  /** Min password length */
  minPasswordLength: 8,
} as const

// ── Rate Limiting ─────────────────────────────────────────────────────────────

export const RATE_LIMITS = {
  /** Max AI pipeline requests per IP per hour */
  generatePerHour: 10,
  /** Max analyze requests per IP per hour */
  analyzePerHour: 30,
  /** Max auth attempts per IP per 15 minutes */
  authPer15Min: 5,
} as const

// ── Case & Legal ──────────────────────────────────────────────────────────────

export const LEGAL = {
  /** Deadline in days by use-case type (from Bescheid date) */
  deadlineDays: {
    tax: 30,                  // §355 AO
    jobcenter: 30,            // §84 SGG
    rente: 30,                // §84 SGG
    bussgeld: 14,             // §67 OWiG
    bussgeldd: 14,            // legacy alias — prefer "bussgeld"
    krankenversicherung: 30,  // §84 SGG
    kuendigung: 21,           // §4 KSchG
    miete: 60,                // §558b BGB
    grundsteuer: 30,          // §355 AO (via §347 AO)
  },
  /** Days before deadline to send first warning */
  warnAtDays: [14, 7, 3, 1],
} as const

// ── Advisor Module ────────────────────────────────────────────────────────────

export const ADVISOR = {
  /** Auto-decline unresponded assignments after this many hours */
  autoDeclineAfterHours: 48,
  /** Broadcast invitations expire after this many hours if no expert accepts */
  broadcastExpiryHours: 72,
  /** Max annotations per case */
  maxAnnotationsPerCase: 20,
  /** Max character length per annotation */
  maxAnnotationLength: 2000,
  /** Hours before auto-decline at which reminders are sent */
  notificationReminderHours: [24, 6],
} as const

/** Maps case useCase slug to the PracticeArea required to handle it */
export const CASE_PRACTICE_AREA: Record<string, 'TAX' | 'LEGAL'> = {
  tax: 'TAX',
  grundsteuer: 'TAX',
  jobcenter: 'LEGAL',
  bussgeld: 'LEGAL',
  bussgeldd: 'LEGAL',
  krankenversicherung: 'LEGAL',
  kuendigung: 'LEGAL',
  miete: 'LEGAL',
  rente: 'LEGAL',
  sonstige: 'LEGAL',
} as const

// ── Add-on Purchases ──────────────────────────────────────────────────────────

export const ADDON = {
  /** Days within which any purchase (addon or subscription initial) can be cancelled, if unused */
  cancellationWindowDays: 14,
} as const

// ── Supported File Types ──────────────────────────────────────────────────────

export const UPLOAD = {
  acceptedMimeTypes: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/webp',
  ],
  acceptedExtensions: '.pdf,.docx,.txt,.jpg,.jpeg,.png,.webp',
} as const
