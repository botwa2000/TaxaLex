/**
 * Advisor communication flow — email dispatch helpers.
 * Each function wraps sendEmail() with the appropriate React Email template.
 */

import { sendEmail } from '@/lib/email'
import { AdvisorHandoffNotification } from '@/lib/emailTemplates/AdvisorHandoffNotification'
import { config } from '@/config/env'
import type { ViabilityScore } from '@/types'
import { createElement } from 'react'

interface HandoffNotificationParams {
  advisorEmail: string
  advisorName?: string | null
  briefSummary: string
  amountDisputed: number
  deadlineDate: string | null
  viabilityScore: ViabilityScore
  caseId: string
}

export async function sendHandoffNotification(params: HandoffNotificationParams): Promise<void> {
  const reviewUrl = `${config.appUrl}/advisor/cases/${params.caseId}`

  await sendEmail({
    to: params.advisorEmail,
    subject: `Neue Fallprüfung: ${params.briefSummary}`,
    react: createElement(AdvisorHandoffNotification, {
      advisorName: params.advisorName,
      briefSummary: params.briefSummary,
      amountDisputed: params.amountDisputed,
      deadlineDate: params.deadlineDate,
      viabilityScore: params.viabilityScore,
      reviewUrl,
    }),
  })
}

interface ClientAnnotationNotificationParams {
  clientEmail: string
  clientName?: string | null
  briefSummary: string
  caseId: string
  annotationCount: number
}

export async function sendClientAnnotationNotification(
  params: ClientAnnotationNotificationParams
): Promise<void> {
  const { clientEmail, clientName, briefSummary, caseId, annotationCount } = params
  const caseUrl = `${config.appUrl}/cases/${caseId}`
  const greeting = clientName ? `Hallo ${clientName},` : 'Hallo,'
  const plural = annotationCount === 1 ? 'Rückfrage' : 'Rückfragen'

  await sendEmail({
    to: clientEmail,
    subject: `${annotationCount} ${plural} zu Ihrem Einspruch`,
    react: createElement('div', null,
      // Inline minimal template — simple cases don't need a full template component
      `${greeting} Ihr Berater hat ${annotationCount} ${plural} zu Ihrem Einspruch gestellt. Bitte antworten Sie unter: ${caseUrl}`
    ) as unknown as React.ReactElement,
  })
}

interface AdvisorReplyNotificationParams {
  advisorEmail: string
  advisorName?: string | null
  briefSummary: string
  caseId: string
}

export async function sendAdvisorReplyNotification(
  params: AdvisorReplyNotificationParams
): Promise<void> {
  const { advisorEmail, advisorName, briefSummary, caseId } = params
  const reviewUrl = `${config.appUrl}/advisor/cases/${caseId}`
  const greeting = advisorName ? `Hallo ${advisorName},` : 'Hallo,'

  await sendEmail({
    to: advisorEmail,
    subject: `Mandant hat geantwortet: ${briefSummary}`,
    react: createElement('div', null,
      `${greeting} Ihr Mandant hat auf Ihre Rückfragen zum Einspruch geantwortet. Zur Fallprüfung: ${reviewUrl}`
    ) as unknown as React.ReactElement,
  })
}

interface CaseFinalizedParams {
  clientEmail: string
  clientName?: string | null
  briefSummary: string
  caseId: string
}

export async function sendCaseFinalizedNotification(params: CaseFinalizedParams): Promise<void> {
  const { clientEmail, clientName, briefSummary, caseId } = params
  const caseUrl = `${config.appUrl}/cases/${caseId}`
  const greeting = clientName ? `Hallo ${clientName},` : 'Hallo,'

  await sendEmail({
    to: clientEmail,
    subject: `Einspruch freigegeben: ${briefSummary}`,
    react: createElement('div', null,
      `${greeting} Ihr Berater hat den Einspruch geprüft und freigegeben. Das finale Dokument steht unter bereit: ${caseUrl}`
    ) as unknown as React.ReactElement,
  })
}

interface CaseDeclinedParams {
  clientEmail: string
  clientName?: string | null
  briefSummary: string
  declineReason: string
  caseId: string
}

export async function sendCaseDeclinedNotification(params: CaseDeclinedParams): Promise<void> {
  const { clientEmail, clientName, briefSummary, declineReason, caseId } = params
  const caseUrl = `${config.appUrl}/cases/${caseId}`
  const greeting = clientName ? `Hallo ${clientName},` : 'Hallo,'

  await sendEmail({
    to: clientEmail,
    subject: `Fallprüfung abgelehnt: ${briefSummary}`,
    react: createElement('div', null,
      `${greeting} Ihr Berater hat die Prüfung Ihres Einspruchs abgelehnt. Begründung: ${declineReason}. Sie können einen anderen Berater anfragen: ${caseUrl}`
    ) as unknown as React.ReactElement,
  })
}
