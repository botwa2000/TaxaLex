/**
 * Payment event email dispatch helpers.
 * Each function resolves the user from DB, then calls sendEmail() with the
 * appropriate React Email template. All functions are fire-and-forget safe —
 * callers should wrap in try/catch so a failed email never breaks the webhook.
 */

import { createElement } from 'react'
import { sendEmail } from '@/lib/email'
import { PaymentReceipt } from '@/lib/emailTemplates/PaymentReceipt'
import { PaymentFailed } from '@/lib/emailTemplates/PaymentFailed'
import { SubscriptionCanceled } from '@/lib/emailTemplates/SubscriptionCanceled'
import { logger } from '@/lib/logger'

interface SendPaymentReceiptParams {
  userId: string
  planName: string
  creditsGranted?: number
  amountPaid: number
  currency: string
  mode: 'payment' | 'subscription'
  invoiceUrl?: string
}

export async function sendPaymentReceipt(params: SendPaymentReceiptParams): Promise<void> {
  const { db } = await import('@/lib/db')
  const user = await db.user.findUnique({
    where: { id: params.userId },
    select: { email: true, name: true },
  })

  if (!user) {
    logger.warn('sendPaymentReceipt: user not found', { userId: params.userId })
    return
  }

  const subject = params.mode === 'subscription'
    ? `Abonnement aktiviert: ${params.planName}`
    : `Zahlungsbestätigung: ${params.planName}`

  await sendEmail({
    to: user.email,
    subject,
    react: createElement(PaymentReceipt, {
      userName: user.name,
      planName: params.planName,
      creditsGranted: params.creditsGranted,
      amountPaid: params.amountPaid,
      currency: params.currency,
      mode: params.mode,
      invoiceUrl: params.invoiceUrl,
    }),
  })
}

interface SendPaymentFailedParams {
  userId: string
  planName: string
  retryUrl?: string
}

export async function sendPaymentFailedNotification(params: SendPaymentFailedParams): Promise<void> {
  const { db } = await import('@/lib/db')
  const user = await db.user.findUnique({
    where: { id: params.userId },
    select: { email: true, name: true },
  })

  if (!user) {
    logger.warn('sendPaymentFailedNotification: user not found', { userId: params.userId })
    return
  }

  await sendEmail({
    to: user.email,
    subject: `Zahlung fehlgeschlagen: ${params.planName}`,
    react: createElement(PaymentFailed, {
      userName: user.name,
      planName: params.planName,
      retryUrl: params.retryUrl,
    }),
  })
}

interface SendSubscriptionCanceledParams {
  userId: string
  planName: string
  validUntil?: string
}

export async function sendSubscriptionCanceledNotification(
  params: SendSubscriptionCanceledParams
): Promise<void> {
  const { db } = await import('@/lib/db')
  const user = await db.user.findUnique({
    where: { id: params.userId },
    select: { email: true, name: true },
  })

  if (!user) {
    logger.warn('sendSubscriptionCanceledNotification: user not found', { userId: params.userId })
    return
  }

  await sendEmail({
    to: user.email,
    subject: `Abonnement gekündigt: ${params.planName}`,
    react: createElement(SubscriptionCanceled, {
      userName: user.name,
      planName: params.planName,
      validUntil: params.validUntil,
    }),
  })
}
