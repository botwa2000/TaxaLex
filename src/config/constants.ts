/**
 * Application-wide constants.
 * Change model names, limits, and timeouts here — nowhere else.
 */

// ── AI Models ─────────────────────────────────────────────────────────────────

/**
 * DEV tier — cheapest models, used during development and testing.
 * Gemini Flash is free; Haiku is ~10× cheaper than Sonnet; sonar (not sonar-pro) is cheaper Perplexity.
 */
export const MODELS_DEV = {
  drafter:      'claude-haiku-4-5-20251001',
  reviewer:     'gemini-1.5-flash',
  factchecker:  'sonar',
  adversary:    'claude-haiku-4-5-20251001',
  consolidator: 'claude-haiku-4-5-20251001',
} as const

/**
 * PROD tier — best models for real users.
 */
export const MODELS_PROD = {
  drafter:      'claude-sonnet-4-6',
  reviewer:     'gemini-1.5-pro',
  factchecker:  'sonar-pro',
  adversary:    'claude-sonnet-4-6',
  consolidator: 'claude-sonnet-4-6',
} as const

/** Legacy alias — replaced at runtime by pipeline mode. Do not use directly in agents.ts. */
export const MODELS = MODELS_PROD

// ── AI Pipeline ───────────────────────────────────────────────────────────────

export const PIPELINE = {
  maxTokens: 4096,
  /** Hard timeout per agent call in ms */
  agentTimeoutMs: 60_000,
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
