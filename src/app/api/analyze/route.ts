import { NextRequest } from 'next/server'
import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import { logger } from '@/lib/logger'
import { PIPELINE } from '@/config/constants'
import { getActiveModels } from '@/lib/pipelineMode'
import { auth } from '@/auth'
import { rateLimit } from '@/lib/rateLimit'
import { config } from '@/config/env'
import { languageNames } from '@/config/i18n'

export const maxDuration = 120

const MAX_TOTAL_BYTES = PIPELINE.maxUploadBytes

const PDF_TYPES = new Set(['application/pdf'])
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])

const FileSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.string().max(100),
  base64: z.string(),
})

const AnalyzeSchema = z.object({
  caseId: z.string().optional(),
  uiLanguage: z.string().length(2).optional().default('de'),
  files: z.array(FileSchema).min(1).max(PIPELINE.maxDocuments),
})

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function POST(req: NextRequest) {
  const t0Route = Date.now()
  const limited = rateLimit(req, { maxRequests: 30, windowMs: 60 * 60 * 1000 })
  if (limited) return limited

  const session = await auth()
  if (!session?.user?.id) return jsonResponse({ error: 'Nicht angemeldet' }, 401)

  const userId = session.user.id as string
  const isDemo = userId.startsWith('demo_')

  logger.debug('[ANALYZE] ─── Request received', { userId: userId.slice(-8), isDemo })

  try {
    const body = await req.json()
    const parsed = AnalyzeSchema.safeParse(body)
    if (!parsed.success) {
      return jsonResponse(
        { error: 'Ungültige Anfrage', details: parsed.error.flatten() },
        400
      )
    }

    const { files, caseId, uiLanguage } = parsed.data

    let totalBytes = 0
    for (const f of files) totalBytes += Math.ceil((f.base64.length * 3) / 4)

    logger.debug('[ANALYZE] ─── Files received', {
      fileCount: files.length,
      totalKB: Math.round(totalBytes / 1024),
      caseId: caseId ?? 'none',
      uiLanguage,
    })

    if (totalBytes > MAX_TOTAL_BYTES) {
      return jsonResponse(
        { error: `Dateien zu groß (max. ${MAX_TOTAL_BYTES / 1024 / 1024} MB)` },
        413
      )
    }

    if (caseId && !isDemo) {
      const { db } = await import('@/lib/db')
      await db.case.updateMany({
        where: { id: caseId, userId },
        data: { status: 'ANALYZING' },
      })
      logger.debug('[ANALYZE] ─── DB: case status → ANALYZING', { caseId })
    }

    const contentBlocks: Anthropic.Messages.ContentBlockParam[] = []

    for (const file of files) {
      if (PDF_TYPES.has(file.type)) {
        contentBlocks.push({
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: file.base64 },
        })
      } else if (IMAGE_TYPES.has(file.type)) {
        contentBlocks.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: file.type as
              | 'image/jpeg'
              | 'image/png'
              | 'image/gif'
              | 'image/webp',
            data: file.base64,
          },
        })
      } else {
        const text = Buffer.from(file.base64, 'base64').toString('utf-8')
        contentBlocks.push({ type: 'text', text: `### ${file.name}\n${text}` })
      }
    }

    const uiLangName = languageNames[uiLanguage] ?? uiLanguage

    contentBlocks.push({
      type: 'text',
      text: `Extract all key information from the document(s) above.

Your response must follow this EXACT format — no deviations, no markdown, no extra text:

First line — document type as one compact JSON object:
{"event":"doc_type","category":"<category>","label":"<document type name in ${uiLangName}>","icon":"<icon>"}

Then one compact JSON line per field as you identify each one:
{"event":"field","key":"<camelCaseKey>","label":"<human-readable label in ${uiLangName}>","value":"<extracted value as string>","icon":"<icon>","importance":"high|medium|low"}

After ALL fields, output this exact separator on its own line:
---QUESTIONS---

Then a JSON array of follow-up questions (may span multiple lines):
[{"id":"q1","question":"...in ${uiLangName}","required":true,"type":"text|yesno|amount|date","background":"legal basis in ${uiLangName}"}]

Valid categories: tax_notice | traffic_fine | parking_ticket | kindergeld | job_center | rent_increase | insurance_rejection | termination_letter | other_official
Valid icons: building | hash | calendar | euro | scale | map-pin | clock | user | file-text | alert-circle | tag | shield | car | gavel | home | heart-pulse

Questions rules: Generate 3 to 6 questions. You MUST always generate at least 3 — even if the document seems clear, there are always procedural details (deadlines, prior correspondence, taxpayer intent) worth confirming. Cover: (1) facts needed for the letter, (2) challengeable evidence or dates, (3) legal distinctions to clarify, (4) authority weaknesses to pre-empt. One question per entry. Include legal basis (§§, court rulings) in background. Write all questions and background in ${uiLangName}.`,
    })

    const { models } = await getActiveModels()
    const client = new Anthropic({ apiKey: config.anthropicApiKey })

    logger.debug('[ANALYZE] ─── Starting streaming analysis', {
      model: models.analyzer.model,
      uiLang: uiLangName,
      contentBlocks: contentBlocks.length,
    })

    const t0Api = Date.now()

    const messageStream = await client.messages.create({
      model: models.analyzer.model,
      max_tokens: PIPELINE.analyzeMaxTokens,
      system: `You are an expert legal analyst specialising in German administrative law and formal objection proceedings. Analyse official documents and extract structured information. Your response must follow EXACTLY the JSONL format specified — document type first, then each field as a compact single-line JSON object, then the ---QUESTIONS--- separator, then the questions JSON array. No markdown, no explanations, no other text.`,
      messages: [{ role: 'user', content: contentBlocks }],
      stream: true,
    })

    const encoder = new TextEncoder()
    const collectedFields: Record<string, unknown> = {}
    let followUpQuestions: unknown[] = []

    const readableStream = new ReadableStream({
      async start(controller) {
        function send(eventName: string, data: unknown) {
          controller.enqueue(
            encoder.encode(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`)
          )
        }

        let lineBuffer = ''
        let questionsBuffer = ''
        let inQuestionsSection = false

        try {
          for await (const event of messageStream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              lineBuffer += event.delta.text

              const lines = lineBuffer.split('\n')
              lineBuffer = lines.pop() ?? ''

              for (const line of lines) {
                const trimmed = line.trim()

                if (inQuestionsSection) {
                  questionsBuffer += line + '\n'
                  continue
                }

                if (trimmed === '---QUESTIONS---') {
                  inQuestionsSection = true
                  continue
                }

                if (!trimmed) continue

                try {
                  const parsed = JSON.parse(trimmed)
                  if (parsed.event === 'doc_type') {
                    collectedFields['docType'] = {
                      category: parsed.category,
                      label: parsed.label,
                    }
                    send('doc_type', parsed)
                  } else if (parsed.event === 'field') {
                    collectedFields[parsed.key] = parsed.value
                    send('field', parsed)
                  }
                } catch {
                  // Incomplete or non-JSON line — Claude may split a JSON object across chunks.
                  // We wait for the next newline before attempting to parse again.
                }
              }
            }
          }

          // Process any text remaining in the buffer after the stream ends
          if (lineBuffer.trim()) {
            if (inQuestionsSection) {
              questionsBuffer += lineBuffer
            } else {
              try {
                const parsed = JSON.parse(lineBuffer.trim())
                if (parsed.event === 'field') {
                  collectedFields[parsed.key] = parsed.value
                  send('field', parsed)
                }
              } catch {
                /* ignore incomplete trailing line */
              }
            }
          }

          // Parse questions — try strict parse first, then regex fallback for wrapped arrays
          const qTrimmed = questionsBuffer.trim()
          if (qTrimmed) {
            try {
              followUpQuestions = JSON.parse(qTrimmed)
            } catch {
              const match = qTrimmed.match(/\[[\s\S]*\]/)
              if (match) {
                try {
                  followUpQuestions = JSON.parse(match[0])
                } catch {
                  /* ignore */
                }
              }
              logger.debug(
                '[ANALYZE] Questions strict-parse failed, used regex extraction',
                {
                  preview: qTrimmed.slice(0, 200),
                }
              )
            }
          }

          const durationMs = Date.now() - t0Api
          logger.agent('analyzer', 'anthropic', models.analyzer.model, durationMs)
          logger.debug('[ANALYZE] ─── Stream complete', {
            durationMs,
            fieldCount: Object.keys(collectedFields).length,
            questionCount: followUpQuestions.length,
            totalMs: Date.now() - t0Route,
          })

          const bescheidData = { ...collectedFields }

          if (caseId && !isDemo) {
            try {
              const { db } = await import('@/lib/db')
              await Promise.all([
                db.case.updateMany({
                  where: { id: caseId, userId },
                  data: {
                    status: 'QUESTIONS',
                    bescheidData: bescheidData as Parameters<
                      typeof db.case.updateMany
                    >[0]['data']['bescheidData'],
                  },
                }),
                ...files.map((file) =>
                  db.document.create({
                    data: {
                      caseId,
                      name: file.name,
                      type: 'BESCHEID',
                      storagePath: 'memory',
                      mimeType: file.type || 'application/octet-stream',
                      sizeBytes: Math.ceil((file.base64.length * 3) / 4),
                    },
                  })
                ),
              ])
              logger.debug('[ANALYZE] ─── DB: case saved', {
                caseId,
                docCount: files.length,
              })
            } catch (dbErr) {
              logger.error('[ANALYZE] DB save failed', { error: dbErr })
            }
          }

          send('complete', { bescheidData, followUpQuestions })
        } catch (streamErr) {
          logger.error('[ANALYZE] Stream error', {
            error: streamErr,
            elapsedMs: Date.now() - t0Route,
          })
          send('error', { message: 'Analyse fehlgeschlagen' })
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    logger.error('[ANALYZE] Unhandled error', { error, elapsedMs: Date.now() - t0Route })
    return jsonResponse({ error: 'Analyse fehlgeschlagen' }, 500)
  }
}
