import 'server-only'
import Stripe from 'stripe'
import { config } from '@/config/env'

// Credits granted per plan slug for one-time purchases.
// Subscription plans use -1 meaning "unlimited while active".
export const PLAN_CREDITS: Record<string, number> = {
  'individual-single':    1,
  'individual-pack':      5,
  'selfemployed-pack':    5,
  'individual-monthly':  -1,
  'selfemployed-monthly':-1,
  'advisor-monthly':     -1,
  'lawyer-monthly':      -1,
}

export function isSubscriptionPlan(planSlug: string): boolean {
  return (PLAN_CREDITS[planSlug] ?? 0) === -1
}

// Lazy proxy — the Stripe client is only constructed on first API call,
// not at module import time. This allows Next.js to build routes that
// import stripe.ts without needing STRIPE_SECRET_KEY in the build environment
// (Docker Swarm secrets are only mounted at container runtime, not during build).
let _stripe: Stripe | null = null

function getClient(): Stripe {
  if (!_stripe) {
    if (!config.stripeSecretKey) {
      throw new Error(
        'STRIPE_SECRET_KEY is not configured. ' +
        'Add stripe_secret_key_prod / stripe_secret_key_dev to Docker Swarm secrets.'
      )
    }
    _stripe = new Stripe(config.stripeSecretKey, {
      apiVersion: '2024-06-20' as Stripe.LatestApiVersion,
      typescript: true,
    })
  }
  return _stripe
}

export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getClient()
    const value = (client as unknown as Record<string | symbol, unknown>)[prop]
    return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(client) : value
  },
})
