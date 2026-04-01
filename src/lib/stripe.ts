import 'server-only'
import Stripe from 'stripe'
import { config } from '@/config/env'

if (!config.stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not configured')
}

// Single Stripe client instance — API version pinned so upgrades are explicit
export const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: '2024-06-20' as Stripe.LatestApiVersion,
  typescript: true,
})

// Credits granted per plan slug for one-time purchases.
// Subscription plans return -1 meaning "unlimited while active".
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
