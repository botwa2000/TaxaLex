import 'server-only'
import { logger } from '@/lib/logger'
import { config } from '@/config/env'

const TURNSTILE_SECRET = config.turnstileSecretKey
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/**
 * Verify a Cloudflare Turnstile token server-side.
 * Returns true if the token is valid, false otherwise.
 * In development without a secret key, always returns true.
 */
export async function verifyTurnstile(token: string | null | undefined): Promise<boolean> {
  if (!TURNSTILE_SECRET) {
    // No secret configured — skip verification in local dev
    logger.warn('TURNSTILE_SECRET_KEY not set — skipping Turnstile verification')
    return true
  }

  if (!token) return false

  try {
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: TURNSTILE_SECRET,
        response: token,
      }),
    })

    const data = await res.json() as { success: boolean; 'error-codes'?: string[] }

    if (!data.success) {
      logger.info('Turnstile verification failed', { errors: data['error-codes'] })
    }

    return data.success
  } catch (error) {
    logger.error('Turnstile verification error', { error })
    // Fail open — don't block users if Cloudflare is down
    return true
  }
}
