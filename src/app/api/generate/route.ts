import { NextRequest } from 'next/server'
import { z } from 'zod'
import { orchestrate } from '@/lib/agents'
import { logger } from '@/lib/logger'
import { PIPELINE } from '@/config/constants'
import { auth } from '@/auth'
import { rateLimit } from '@/lib/rateLimit'

// Steps 2–4 now run in parallel; realistic max with prod models is ~150–180s.
// 300s gives a generous buffer without a 10-minute hang on unexpected slowness.
export const maxDuration = 300

const BescheidDataSchema = z.object({
  finanzamt: z.string().max(200).optional().default(''),
  steuernummer: z.string().max(50).optional().default(''),
  bescheidDatum: z.string().max(20).optional().default(''),
  steuerart: z.string().max(100).optional().default(''),
  nachzahlung: z.union([z.number(), z.string()]).transform(v => Number(v) || 0).optional().default(0),
  streitigerBetrag: z.union([z.number(), z.string()]).transform(v => Number(v) || 0).optional().default(0),
  rawText: z.string().optional(),
}).passthrough() // allow extra fields the AI may return

const GenerateSchema = z.object({
  caseId: z.string().nullish(),
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
  const t0Route = Date.now()

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

  logger.debug('[GENERATE] ─── Request received', { userId: userId.slice(-8), isDemo })

  // Check access — pipeline always runs; result is locked if no credits.
  // This lets users see the value before paying (freemium preview gate).
  let hasAccess = isDemo
  if (!isDemo) {
    const { db } = await import('@/lib/db')
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { creditBalance: true, subscription: { select: { status: true } } },
    })
    const credits = user?.creditBalance ?? 0
    const subStatus = user?.subscription?.status ?? 'none'
    hasAccess = credits > 0 || ['ACTIVE', 'TRIALING'].includes(subStatus)
    logger.debug('[GENERATE] ─── Access check', { credits, subStatus, hasAccess })
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
    logger.debug('[GENERATE] ─── Schema validation failed', { errors: parsed.error.flatten() })
    return new Response(
      sseEvent('error', { message: 'Ungültige Anfrage', details: parsed.error.flatten() }),
      { status: 400, headers: { 'Content-Type': 'text/event-stream' } }
    )
  }

  const { caseId, bescheidData, documents, userAnswers, outputLanguage, uiLanguage } = parsed.data

  logger.debug('[GENERATE] ─── Payload parsed', {
    caseId: caseId ?? 'none',
    finanzamt: bescheidData.finanzamt,
    steuerart: bescheidData.steuerart,
    nachzahlung: bescheidData.nachzahlung,
    docCount: documents.length,
    answerCount: Object.keys(userAnswers).length,
    outputLanguage,
    uiLanguage,
    answers: Object.entries(userAnswers).map(([k, v]) => ({ q: k.slice(0, 40), aPreview: v.slice(0, 40) })),
  })

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

      // Heartbeat: SSE comment every 15s prevents nginx/proxy keepalive timeouts
      // during silent gaps between agent calls (especially the parallel middle stage).
      const heartbeat = setInterval(() => {
        try { controller.enqueue(encoder.encode(':heartbeat\n\n')) } catch { /* client disconnected */ }
      }, 15_000)

      try {
        // Mark case as generating
        if (caseId && !isDemo) {
          const { db } = await import('@/lib/db')
          await db.case.updateMany({
            where: { id: caseId, userId },
            data: { status: 'GENERATING', userAnswers },
          })
          logger.debug('[GENERATE] ─── DB: case status → GENERATING', { caseId })
        }

        logger.debug('[GENERATE] ─── Starting orchestrate()', { caseId: caseId ?? 'none' })
        const t0Pipeline = Date.now()

        // Run the 5-agent pipeline with per-agent SSE events
        const { outputs, finalDraft, pipelineMode } = await orchestrate(
          bescheidData,
          documents,
          userAnswers,
          outputLanguage,
          uiLanguage,
          (event) => send(event.type, event.data)  // forwards agent_start + agent_complete
        )

        logger.debug('[GENERATE] ─── Pipeline complete', {
          pipelineMode,
          agentCount: outputs.length,
          totalPipelineMs: Date.now() - t0Pipeline,
          draftChars: finalDraft.length,
          agentTimes: outputs.map((o) => ({ role: o.role, durationMs: o.durationMs })),
        })

        // Always save outputs — use draftLocked flag to gate access instead of discarding
        if (caseId && !isDemo) {
          const isLocked = !hasAccess
          logger.debug('[GENERATE] ─── Saving outputs', { caseId, agentCount: outputs.length, isLocked })
          const t = Date.now()
          const { db } = await import('@/lib/db')
          await db.$transaction([
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
            db.case.updateMany({
              where: { id: caseId, userId },
              data: { status: 'DRAFT_READY', draftLocked: isLocked },
            }),
            // Only deduct credit when user has access (subscription or credits)
            ...(hasAccess ? [
              db.creditLedger.create({
                data: { userId, delta: -1, reason: 'CASE_CREATED', referenceId: caseId },
              }),
              db.user.update({
                where: { id: userId },
                data: { creditBalance: { decrement: 1 } },
              }),
            ] : []),
          ])
          logger.debug('[GENERATE] ─── DB transaction complete', { dbMs: Date.now() - t })
          logger.info('Pipeline saved', { caseId, pipelineMode, agents: outputs.length, isLocked })
        }

        send('pipeline_complete', {
          finalDraft,
          caseId: caseId ?? null,
          pipelineMode,
          agentCount: outputs.length,
          // locked = true means draft saved but user needs to pay to access it
          locked: !hasAccess && !isDemo,
        })

        logger.debug('[GENERATE] ─── pipeline_complete SSE sent', {
          locked: !hasAccess && !isDemo,
          totalMs: Date.now() - t0Route,
        })
      } catch (error) {
        logger.error('[GENERATE] Pipeline error', { error, caseId, elapsedMs: Date.now() - t0Route })
        // Roll back case status if something went wrong mid-pipeline
        if (caseId && !isDemo) {
          try {
            const { db } = await import('@/lib/db')
            await db.case.updateMany({
              where: { id: caseId, userId, status: 'GENERATING' },
              data: { status: 'QUESTIONS' },
            })
            logger.debug('[GENERATE] ─── DB: rolled back case status → QUESTIONS', { caseId })
          } catch { /* rollback best-effort */ }
        }
        send('error', { message: 'Einspruch-Generierung fehlgeschlagen' })
      } finally {
        clearInterval(heartbeat)
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
