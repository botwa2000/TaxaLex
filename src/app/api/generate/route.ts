import { NextRequest } from 'next/server'
import { z } from 'zod'
import { orchestrate } from '@/lib/agents'
import { logger } from '@/lib/logger'
import { PIPELINE } from '@/config/constants'
import { auth } from '@/auth'
import { rateLimit } from '@/lib/rateLimit'

export const maxDuration = 120

const BescheidDataSchema = z.object({
  finanzamt: z.string().min(1).max(200),
  steuernummer: z.string().max(50),
  bescheidDatum: z.string().max(20),
  steuerart: z.string().max(100),
  nachzahlung: z.number().nonnegative(),
  streitigerBetrag: z.number().nonnegative(),
  rawText: z.string().optional(),
})

const GenerateSchema = z.object({
  caseId: z.string().optional(),
  bescheidData: BescheidDataSchema,
  documents: z
    .array(
      z.object({
        name: z.string().min(1).max(255),
        text: z.string().max(500_000),
      })
    )
    .max(PIPELINE.maxDocuments)
    .default([]),
  userAnswers: z.record(z.string(), z.string().max(5000)).default({}),
  outputLanguage: z.string().length(2).optional().default('de'),
  uiLanguage: z.string().length(2).optional().default('de'),
})

function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

function extractSummary(content: string): string {
  const lines = content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 20 && !l.startsWith('#') && !l.startsWith('---'))
  const first = lines[0] ?? ''
  return first.length > 180 ? first.slice(0, 177) + '…' : first
}

export async function POST(req: NextRequest) {
  // Rate limit: 10 generate requests per IP per hour
  const limited = rateLimit(req, { maxRequests: 10, windowMs: 60 * 60 * 1000 })
  if (limited) return new Response(
    sseEvent('error', { message: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.', status: 429 }),
    { status: 429, headers: { 'Content-Type': 'text/event-stream' } }
  )

  const session = await auth()
  if (!session?.user?.id) {
    return new Response(sseEvent('error', { message: 'Nicht angemeldet', status: 401 }), {
      status: 401,
      headers: { 'Content-Type': 'text/event-stream' },
    })
  }

  const userId = session.user.id as string
  const isDemo = userId.startsWith('demo_')

  // Payment guard
  if (!isDemo) {
    const { db } = await import('@/lib/db')
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { creditBalance: true, subscription: { select: { status: true } } },
    })
    const hasAccess =
      (user?.creditBalance ?? 0) > 0 ||
      ['ACTIVE', 'TRIALING'].includes(user?.subscription?.status ?? '')
    if (!hasAccess) {
      return new Response(sseEvent('error', { message: 'Kein Guthaben', status: 402 }), {
        status: 402,
        headers: { 'Content-Type': 'text/event-stream' },
      })
    }
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new Response(sseEvent('error', { message: 'Ungültige Anfrage' }), {
      status: 400,
      headers: { 'Content-Type': 'text/event-stream' },
    })
  }

  const parsed = GenerateSchema.safeParse(body)
  if (!parsed.success) {
    return new Response(
      sseEvent('error', { message: 'Ungültige Anfrage', details: parsed.error.flatten() }),
      { status: 400, headers: { 'Content-Type': 'text/event-stream' } }
    )
  }

  const { caseId, bescheidData, documents, userAnswers, outputLanguage, uiLanguage } = parsed.data

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        try {
          controller.enqueue(encoder.encode(sseEvent(event, data)))
        } catch {
          // client disconnected — ignore
        }
      }

      try {
        // Mark case as generating
        if (caseId && !isDemo) {
          const { db } = await import('@/lib/db')
          await db.case.updateMany({
            where: { id: caseId, userId },
            data: { status: 'GENERATING', userAnswers },
          })
        }

        // Run the 5-agent pipeline with per-agent SSE events
        const { outputs, finalDraft, pipelineMode } = await orchestrate(
          bescheidData,
          documents,
          userAnswers,
          outputLanguage,
          uiLanguage,
          (event) => send(event.type, event.data)  // progress callback
        )

        // Persist outputs and update case
        if (caseId && !isDemo) {
          const { db } = await import('@/lib/db')
          await db.$transaction([
            // Save each agent output
            ...outputs.map((o) =>
              db.caseOutput.create({
                data: {
                  caseId,
                  role: o.role,
                  provider: o.provider,
                  model: o.model,
                  content: o.content,
                  durationMs: o.durationMs,
                  isFinal: o.role === 'consolidator',
                },
              })
            ),
            // Update case to DRAFT_READY
            db.case.updateMany({
              where: { id: caseId, userId },
              data: { status: 'DRAFT_READY' },
            }),
            // Deduct 1 credit
            db.creditLedger.create({
              data: { userId, delta: -1, reason: 'CASE_CREATED', referenceId: caseId },
            }),
            db.user.update({
              where: { id: userId },
              data: { creditBalance: { decrement: 1 } },
            }),
          ])
          logger.info('Pipeline saved', { caseId, pipelineMode, agents: outputs.length })
        }

        send('pipeline_complete', {
          finalDraft,
          caseId: caseId ?? null,
          pipelineMode,
          agentCount: outputs.length,
        })
      } catch (error) {
        logger.error('Generate pipeline error', { error, caseId })
        // Roll back case status if something went wrong mid-pipeline
        if (caseId && !isDemo) {
          try {
            const { db } = await import('@/lib/db')
            await db.case.updateMany({
              where: { id: caseId, userId, status: 'GENERATING' },
              data: { status: 'QUESTIONS' },
            })
          } catch { /* rollback best-effort */ }
        }
        send('error', { message: 'Einspruch-Generierung fehlgeschlagen' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
      Connection: 'keep-alive',
    },
  })
}
