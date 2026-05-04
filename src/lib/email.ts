import 'server-only'
import { BrevoClient } from '@getbrevo/brevo'
import { render } from '@react-email/render'
import type { ReactElement } from 'react'
import { config } from '@/config/env'
import { logger } from '@/lib/logger'

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain || local.length < 2) return '***@***'
  return `${local[0]}***@${domain}`
}

const getClient = (() => {
  let client: BrevoClient | null = null
  return () => {
    if (!client) {
      client = new BrevoClient({ apiKey: config.brevoApiKey! })
    }
    return client
  }
})()

/**
 * Send a transactional email via Brevo.
 * Pass a rendered React Email element as `react`.
 *
 * If BREVO_API_KEY is not set (local dev without credentials),
 * the email is suppressed and logged instead.
 */
export async function sendEmail(options: {
  to: string
  subject: string
  react: ReactElement
}): Promise<void> {
  const { to, react } = options
  // Prefix dev emails so they're easy to distinguish in the inbox
  const subject = config.isDev ? `DEV - ${options.subject}` : options.subject

  if (!config.brevoApiKey) {
    logger.warn('BREVO_API_KEY not set — email suppressed', { to: maskEmail(to), subject })
    return
  }

  const htmlContent = await render(react)

  try {
    await getClient().transactionalEmails.sendTransacEmail({
      sender: { email: config.emailFrom, name: config.emailFromName },
      to: [{ email: to }],
      subject,
      htmlContent,
    })
    logger.info('Email sent', { to: maskEmail(to), subject })
  } catch (error) {
    logger.error('Email send failed', { to: maskEmail(to), subject, error })
    throw error
  }
}
