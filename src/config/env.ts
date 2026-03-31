import 'server-only'

/**
 * Central environment configuration.
 * This is the ONLY file that reads process.env.
 * All other modules import from here.
 *
 * Calls requireEnv() for mandatory vars — the app crashes at startup
 * with a clear message rather than failing silently at runtime.
 */

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
        `Copy .env.example to .env.local and fill in all values.`
    )
  }
  return value
}

function optionalEnv(key: string, fallback = ''): string {
  return process.env[key] ?? fallback
}

export const config = {
  // ── Runtime ────────────────────────────────────────────────────────────
  isDev: process.env.NODE_ENV !== 'production',
  isProd: process.env.NODE_ENV === 'production',
  nodeEnv: process.env.NODE_ENV ?? 'development',

  // ── App ────────────────────────────────────────────────────────────────
  appUrl: optionalEnv('APP_URL', optionalEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')),

  // ── AI Providers ───────────────────────────────────────────────────────
  anthropicApiKey: requireEnv('ANTHROPIC_API_KEY'),
  googleAiApiKey: optionalEnv('GOOGLE_AI_API_KEY'),       // required only when pipeline runs
  perplexityApiKey: optionalEnv('PERPLEXITY_API_KEY'),    // required only when pipeline runs
  openaiApiKey: optionalEnv('OPENAI_API_KEY'),

  // ── Auth ───────────────────────────────────────────────────────────────
  nextAuthSecret: requireEnv('NEXTAUTH_SECRET'),
  nextAuthUrl: optionalEnv('NEXTAUTH_URL', 'http://localhost:3000'),
  googleClientId: optionalEnv('GOOGLE_CLIENT_ID'),
  googleClientSecret: optionalEnv('GOOGLE_CLIENT_SECRET'),

  // ── Database ───────────────────────────────────────────────────────────
  databaseUrl: optionalEnv('DATABASE_URL'), // optional until Phase 6

  // ── Email (Brevo) ──────────────────────────────────────────────────────
  brevoApiKey: optionalEnv('BREVO_API_KEY'),
  emailFrom: optionalEnv('EMAIL_FROM', 'no-reply@taxalex.de'),
  emailFromName: optionalEnv('EMAIL_FROM_NAME', 'TaxaLex'),

  // ── Payments ───────────────────────────────────────────────────────────
  stripeSecretKey: optionalEnv('STRIPE_SECRET_KEY'),
  stripeWebhookSecret: optionalEnv('STRIPE_WEBHOOK_SECRET'),

  // ── Storage ────────────────────────────────────────────────────────────
  s3Endpoint: optionalEnv('S3_ENDPOINT'),
  s3Bucket: optionalEnv('S3_BUCKET'),
  s3AccessKey: optionalEnv('S3_ACCESS_KEY'),
  s3SecretKey: optionalEnv('S3_SECRET_KEY'),

  // ── Analytics (public — loaded client-side only after cookie consent) ─────
  gaMeasurementId: optionalEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID'),
  posthogKey: optionalEnv('NEXT_PUBLIC_POSTHOG_KEY'),
  posthogHost: optionalEnv('NEXT_PUBLIC_POSTHOG_HOST', 'https://eu.posthog.com'),

  // ── Observability ──────────────────────────────────────────────────────
  sentryDsn: optionalEnv('SENTRY_DSN'),
} as const

export type Config = typeof config
