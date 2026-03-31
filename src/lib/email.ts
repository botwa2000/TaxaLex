import 'server-only'
import { BrevoClient } from '@getbrevo/brevo'
import { render } from '@react-email/render'
import type { ReactElement } from 'react'
import { config } from '@/config/env'
import { logger } from '@/lib/logger'

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
  const { to, subject, react } = options

  if (!config.brevoApiKey) {
    logger.warn('BREVO_API_KEY not set — email suppressed', { to, subject })
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
    logger.info('Email sent', { to, subject })
  } catch (error) {
    logger.error('Email send failed', { to, subject, error })
    throw error
  }
}
