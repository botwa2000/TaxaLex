/**
 * Feature flags — control rollout without code changes.
 * All flags read from env vars; default to safe (off) values.
 *
 * Usage: import { features } from '@/config/features'
 *        if (features.advisorModule) { ... }
 */

export const features = {
  /** Advisor marketplace and case assignment */
  advisorModule: process.env.FEATURE_ADVISOR === 'true',

  /** Stripe payments and Pro tier gating */
  payments: process.env.FEATURE_PAYMENTS === 'true',

  /** PDF/OCR document processing */
  ocrProcessing: process.env.FEATURE_OCR === 'true',

  /** Streaming agent responses (SSE) */
  streamingPipeline: process.env.FEATURE_STREAMING === 'true',

  /** Google OAuth login option */
  googleAuth: !!(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  ),

  /** Show verbose AI agent log to user in result screen */
  showAgentLog: process.env.NODE_ENV !== 'production' ||
    process.env.FEATURE_AGENT_LOG === 'true',
} as const

export type Features = typeof features
