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
import { consumeUpload } from '@/lib/uploadStore'

export const maxDuration = 240

const MAX_TOTAL_BYTES = PIPELINE.maxUploadBytes

const PDF_TYPES = new Set(['application/pdf'])
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])

const FileSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.string().max(100),
  base64: z.string(),
})

const ReviewExtras = z.object({
  reviewMode: z.boolean().optional().default(false),
  existingBescheidData: z.record(z.unknown()).optional(),
  userAnswers: z.record(z.string()).optional(),
})

const AnalyzeByIdSchema = ReviewExtras.extend({
  uploadId: z.string().uuid(),
  caseId: z.string().optional(),
  uiLanguage: z.string().length(2).optional().default('de'),
  userContext: z.string().max(1000).optional(),
})

const AnalyzeByFilesSchema = ReviewExtras.extend({
  files: z.array(FileSchema).min(1).max(PIPELINE.maxDocuments),
  caseId: z.string().optional(),
  uiLanguage: z.string().length(2).optional().default('de'),
  userContext: z.string().max(1000).optional(),
})

const AnalyzeSchema = z.union([AnalyzeByIdSchema, AnalyzeByFilesSchema])

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

    const { caseId, uiLanguage, reviewMode, existingBescheidData, userAnswers, userContext } = parsed.data
    type AnalysisFile = { name: string; type: string; base64: string; sizeBytes: number }
    let files: AnalysisFile[]

    if ('uploadId' in parsed.data) {
      const stored = consumeUpload(parsed.data.uploadId, userId)
      if (!stored) {
        return jsonResponse({ error: 'Upload nicht gefunden oder abgelaufen' }, 410)
      }
      files = stored.map((f) => ({
        name: f.name,
        type: f.type,
        base64: f.buffer.toString('base64'),
        sizeBytes: f.buffer.length,
      }))
    } else {
      files = parsed.data.files.map((f) => ({
        name: f.name,
        type: f.type,
        base64: f.base64,
        sizeBytes: Math.ceil((f.base64.length * 3) / 4),
      }))
    }

    let totalBytes = 0
    for (const f of files) totalBytes += f.sizeBytes

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
        data: {
          status: 'ANALYZING',
          ...(userContext ? { userContext } : {}),
        },
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

    // In review mode, prepend existing analysis + user answers as context
    if (reviewMode && (existingBescheidData || userAnswers)) {
      const contextLines: string[] = ['=== PRIOR ANALYSIS (already extracted — do not repeat these fields) ===']
      if (existingBescheidData && Object.keys(existingBescheidData).length > 0) {
        contextLines.push(JSON.stringify(existingBescheidData, null, 2))
      }
      if (userAnswers && Object.keys(userAnswers).length > 0) {
        contextLines.push('\n=== USER ANSWERS TO FOLLOW-UP QUESTIONS ===')
        for (const [k, v] of Object.entries(userAnswers)) {
          contextLines.push(`${k}: ${v || '(not answered)'}`)
        }
      }
      contextLines.push('\n=== ADDITIONAL DOCUMENTS TO ANALYSE (extract only NEW information) ===')
      contentBlocks.unshift({ type: 'text', text: contextLines.join('\n') })
    }

    contentBlocks.push({
      type: 'text',
      text: `⚠️ OUTPUT LANGUAGE: ${uiLangName} ONLY. Every field label, question, background, and guidance must be in ${uiLangName} — not the document's language.

${reviewMode ? 'Extract only NEW fields from the additional documents above that are NOT already in the prior analysis. Focus on information that supplements or updates the existing data.' : 'Extract all key information from the document(s) above.'}

Your response must follow this EXACT format — no deviations, no markdown, no extra text:

First line — document type as one compact JSON object:
{"event":"doc_type","category":"<category>","label":"<document type name in ${uiLangName}>","icon":"<icon>"}

Then one compact JSON line per field as you identify each one:
{"event":"field","key":"<camelCaseKey>","label":"<human-readable label in ${uiLangName}>","value":"<extracted value as string>","icon":"<icon>","importance":"high|medium|low"}

After ALL fields, output this exact separator on its own line:
---QUESTIONS---

Then a JSON array of follow-up questions (may span multiple lines):
[{"id":"q1","question":"...in ${uiLangName}","required":true,"type":"text|yesno|amount|date","background":"legal basis and §§ citations in ${uiLangName}","guidance":"2-3 sentences in ${uiLangName}: what factors determine the answer, concrete examples (if X then answer A because..., if Y then answer B because...), and how the AI will use this to strengthen the objection letter"}]

Type rules (CRITICAL — do NOT mix types): "yesno" = the answer is yes/no/don't-know ONLY (even if the question mentions dates or amounts as context); "date" = the answer is ONLY a specific date or date range; "amount" = the answer is ONLY a monetary figure; "text" = everything else, including compound questions that ask for explanation or multiple pieces of information. If a question asks both yes/no AND a follow-up detail, split into TWO separate questions. Never assign "date" or "amount" to a question whose primary answer is yes or no.

Valid categories: tax_notice | traffic_fine | parking_ticket | kindergeld | job_center | rent_increase | insurance_rejection | termination_letter | other_official
Valid icons: building | hash | calendar | euro | scale | map-pin | clock | user | file-text | alert-circle | tag | shield | car | gavel | home | heart-pulse

Questions rules:
- Generate 3 to 6 questions. Always at least 3.
- Ask for FACTS the user can actually provide: documents they hold, dates they know, amounts they paid, things that happened to them. NEVER ask the user to verify legal correctness or check calculations — that is the AI's job, not theirs.
- Question TEXT must be plain language. A non-expert must immediately understand what is being asked. NEVER put §§ symbols, law names, or court citations inside the question text — they belong ONLY in the background field.
- YES/NO questions must be phrased as simple declarative questions: "Do you have...?", "Did you receive...?", "Is there...?", "Have you ever...?" — one fact per question.
- GOOD examples: "Do you have receipts for your work-related travel expenses?" / "When did you receive this notice?" / "Did the Finanzamt send you a separate letter about this deduction?"
- BAD examples: "Was the Splittingtarif correctly applied per §32a EStG?" / "Ist die Einspruchsfrist gemäß §357 AO gewahrt?" / "Did you comply with the documentation requirements under §4 EStG?"
- Cover: (1) documents or evidence the user holds, (2) key dates (when received, when paid, when notified), (3) factual circumstances (did X happen? is Y true for you?), (4) amounts already paid or claimed.
- Write ALL text in ${uiLangName}.`,
    })

    const { models } = await getActiveModels()
    const client = new Anthropic({ apiKey: config.anthropicApiKey })

    logger.debug('[ANALYZE] ─── Returning streaming response (Anthropic call deferred to stream start)', {
      model: models.analyzer.model,
      uiLang: uiLangName,
      contentBlocks: contentBlocks.length,
    })

    const encoder = new TextEncoder()

    const readableStream = new ReadableStream({
      async start(controller) {
        function send(eventName: string, data: unknown) {
          controller.enqueue(
            encoder.encode(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`)
          )
        }

        // Cloudflare and some proxies buffer SSE until their internal buffer fills
        // (typically 1-2 KB). Send a padding comment large enough to force an
        // immediate flush, then the real first event, before the Anthropic call.
        const pad = ': ' + 'x'.repeat(2048) + '\n\n'
        controller.enqueue(encoder.encode(pad))

        // Heartbeat every 10s keeps Cloudflare/nginx from closing the idle
        // connection during the Anthropic API call (which can take 30–60s for
        // large PDFs). SSE comment lines are ignored by the browser.
        const heartbeat = setInterval(() => {
          try { controller.enqueue(encoder.encode(':heartbeat\n\n')) } catch { /* client disconnected */ }
        }, 10_000)

        // Send immediately — this is the first SSE event the browser receives.
        // Because this runs inside start() (after HTTP headers are already sent),
        // the browser resolves fetch() and clears "Uploading..." BEFORE we even
        // call the Anthropic API. Large PDFs uploading to Anthropic no longer
        // block the client.
        send('analyzing_start', { status: 'started' })

        const collectedFields: Record<string, unknown> = {}
        let followUpQuestions: unknown[] = []
        let lineBuffer = ''
        let questionsBuffer = ''
        let inQuestionsSection = false

        try {
          const t0Api = Date.now()

          logger.debug('[ANALYZE] ─── Calling Anthropic API', { model: models.analyzer.model })

          const systemPrompt = reviewMode
            ? `You are an expert legal analyst supplementing a prior document analysis with NEW evidence. Extract only information NOT already captured in the existing analysis. Your response must follow EXACTLY the JSONL format specified — document type first, then NEW fields only as compact single-line JSON objects. After all fields output ---QUESTIONS--- on its own line, then output an empty JSON array: []. No markdown, no explanations, no other text. CRITICAL: All output text must be written in ${uiLangName}.`
            : `You are an expert legal analyst specialising in German administrative law and formal objection proceedings. Analyse official documents and extract structured information. Your response must follow EXACTLY the JSONL format specified — document type first, then each field as a compact single-line JSON object, then the ---QUESTIONS--- separator, then the questions JSON array. No markdown, no explanations, no other text. CRITICAL: All output text — every label, question, background, guidance — MUST be written in ${uiLangName}. The document language does not determine the output language. QUESTIONS MUST be in plain language a non-expert immediately understands — ask for facts the user can provide (documents, dates, amounts, yes/no about their situation), never ask them to verify legal correctness. §§ and legal citations go ONLY in the background field, never in the question text itself.`

          const messageStream = await client.messages.create({
            model: models.analyzer.model,
            max_tokens: PIPELINE.analyzeMaxTokens,
            system: systemPrompt,
            messages: [{ role: 'user', content: contentBlocks }],
            stream: true,
          })

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

          // ── Multi-agent question refinement ──────────────────────────────────
          // Three specialist agents propose questions from different angles, then
          // Claude consolidates into atomic, plain-language questions with "why" fields.
          // Runs only when we have at least one question from the initial extraction.
          // If any step fails, we silently fall back to the original questions.
          let questionProposalsRecord: Record<string, unknown> | null = null
          if (followUpQuestions.length > 0) {
            try {
              send('refining_questions', { status: 'refining' })

              const { buildQuestionAgents, callAgent: callQAgent } = await import('@/lib/agents')
              const { models: qModels } = await getActiveModels()
              const qAgents = buildQuestionAgents(qModels, uiLangName)

              // Context for proposers: structured extracted data (all agents can read JSON)
              const proposerContext = [
                userContext?.trim() ? `User's explanation of what they want to object and why:\n${userContext.trim()}` : null,
                `Extracted data from official document:\n${JSON.stringify(bescheidData, null, 2)}`,
                `Initial follow-up questions already identified:\n${JSON.stringify(followUpQuestions, null, 2)}`,
              ].filter(Boolean).join('\n\n')

              logger.debug('[ANALYZE] ─── Running 3 question-proposer agents in parallel')
              const t0Proposers = Date.now()

              const [reviewerOut, factcheckerOut, adversaryOut] = await Promise.all([
                callQAgent(qAgents['question-proposer-reviewer'], proposerContext),
                callQAgent(qAgents['question-proposer-factchecker'], proposerContext),
                callQAgent(qAgents['question-proposer-adversary'], proposerContext),
              ])

              logger.debug('[ANALYZE] ─── Proposers complete', { wallClockMs: Date.now() - t0Proposers })

              // Fact-audit pass: Claude tags each proposed question as CONFIRMED/SINGLE/DISPUTED/UNSUPPORTED
              // and removes questions not grounded in the extracted data (prevents hallucinated questions).
              const factAuditorInput = `Extracted document data (bescheidData):
${JSON.stringify(bescheidData, null, 2)}

Legal Reviewer proposed:
${reviewerOut}

Fact-Checker proposed:
${factcheckerOut}

Adversary (authority perspective) proposed:
${adversaryOut}

Initial AI analysis proposed:
${JSON.stringify(followUpQuestions, null, 2)}`

              logger.debug('[ANALYZE] ─── Running question-fact-auditor')
              const auditedQuestionsRaw = await callQAgent(qAgents['question-fact-auditor'], factAuditorInput)

              // Consolidate all proposals — now with fact-audit tags attached
              const consolidatorInput = `Fact-audited question proposals (tagged CONFIRMED/SINGLE/DISPUTED — UNSUPPORTED already removed):
${auditedQuestionsRaw}

Initial AI analysis proposed (for reference):
${JSON.stringify(followUpQuestions, null, 2)}`
              const consolidatedRaw = await callQAgent(qAgents['question-consolidator'], consolidatorInput)

              // Parse consolidated output — multiple fallback attempts
              let parsedConsolidated: { questions?: unknown[]; rationale?: string } | null = null
              try {
                parsedConsolidated = JSON.parse(consolidatedRaw)
              } catch {
                const match = consolidatedRaw.match(/\{[\s\S]*\}/)
                if (match) {
                  try { parsedConsolidated = JSON.parse(match[0]) } catch { /* ignore */ }
                }
              }

              if (parsedConsolidated?.questions && Array.isArray(parsedConsolidated.questions) && parsedConsolidated.questions.length > 0) {
                followUpQuestions = parsedConsolidated.questions
                questionProposalsRecord = {
                  reviewer: reviewerOut,
                  factchecker: factcheckerOut,
                  adversary: adversaryOut,
                  auditedQuestions: auditedQuestionsRaw,
                  rationale: parsedConsolidated.rationale ?? '',
                }
                logger.debug('[ANALYZE] ─── Questions consolidated', {
                  originalCount: Object.keys(collectedFields).length,
                  consolidatedCount: followUpQuestions.length,
                })
              } else {
                logger.debug('[ANALYZE] ─── Consolidation parse failed — keeping original questions')
              }
            } catch (refinementErr) {
              // Non-fatal — user still gets original questions
              logger.error('[ANALYZE] Question refinement failed', { error: refinementErr })
            }
          }

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
                    followUpQuestions: followUpQuestions as Parameters<
                      typeof db.case.updateMany
                    >[0]['data']['followUpQuestions'],
                    ...(questionProposalsRecord
                      ? { questionProposals: questionProposalsRecord as Parameters<typeof db.case.updateMany>[0]['data']['questionProposals'] }
                      : {}),
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
                      sizeBytes: file.sizeBytes,
                    },
                  })
                ),
              ])
              logger.debug('[ANALYZE] ─── DB: case saved', {
                caseId,
                docCount: files.length,
                hasProposals: !!questionProposalsRecord,
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
          clearInterval(heartbeat)
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
