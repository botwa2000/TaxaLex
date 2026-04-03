import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

/**
 * Simple in-memory sliding-window rate limiter.
 * Uses IP address as key. Not shared across replicas — sufficient for a single VPS.
 *
 * Usage in API routes:
 *   const limited = rateLimit(req, { maxRequests: 10, windowMs: 60_000 })
 *   if (limited) return limited
 */

interface RateLimitOptions {
  /** Max requests allowed in the window */
  maxRequests: number
  /** Window duration in milliseconds */
  windowMs: number
  /** Optional identifier override (e.g., userId). Defaults to IP. */
  key?: string
}

interface Entry {
  timestamps: number[]
}

// Global store — survives across requests but resets on process restart
const store = new Map<string, Entry>()

// Periodic cleanup to prevent unbounded memory growth
const CLEANUP_INTERVAL = 5 * 60 * 1000 // 5 minutes
let lastCleanup = Date.now()

function cleanup(windowMs: number) {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now

  const cutoff = now - windowMs * 2
  for (const [key, entry] of store) {
    if (entry.timestamps.length === 0 || entry.timestamps[entry.timestamps.length - 1] < cutoff) {
      store.delete(key)
    }
  }
}

function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1'
  )
}

/**
 * Returns a 429 Response if the request exceeds the rate limit.
 * Returns null if the request is within limits.
 */
export function rateLimit(
  req: NextRequest,
  options: RateLimitOptions
): NextResponse | null {
  const { maxRequests, windowMs, key } = options
  const identifier = key ?? getIP(req)
  const now = Date.now()

  cleanup(windowMs)

  let entry = store.get(identifier)
  if (!entry) {
    entry = { timestamps: [] }
    store.set(identifier, entry)
  }

  // Remove timestamps outside the window
  const cutoff = now - windowMs
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff)

  if (entry.timestamps.length >= maxRequests) {
    const retryAfter = Math.ceil((entry.timestamps[0] + windowMs - now) / 1000)
    logger.info('Rate limit exceeded', {
      identifier: identifier.slice(0, 8) + '…',
      maxRequests,
      windowMs,
    })
    return NextResponse.json(
      { error: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfter) },
      }
    )
  }

  entry.timestamps.push(now)
  return null
}
