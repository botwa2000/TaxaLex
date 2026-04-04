import { NextRequest, NextResponse } from 'next/server'
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

const MAX_TOTAL_BYTES = PIPELINE.maxUploadBytes // 10 MB

// Mime types Claude can read natively
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

export async function POST(req: NextRequest) {
  const t0Route = Date.now()
  const limited = rateLimit(req, { maxRequests: 30, windowMs: 60 * 60 * 1000 })
  if (limited) return limited

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
  }

  const userId = session.user.id as string
  const isDemo = userId.startsWith('demo_')

  // Analyze is always free — no payment gate here.
  // Credits are only consumed when the final draft is saved in /api/generate.
  // Users with no credits get a locked result at the end (freemium preview gate).
  logger.debug('[ANALYZE] ─── Request received', { userId: userId.slice(-8), isDemo })

  try {
    const body = await req.json()
    const parsed = AnalyzeSchema.safeParse(body)
    if (!parsed.success) {
      logger.debug('[ANALYZE] ─── Schema validation failed', { errors: parsed.error.flatten() })
      return NextResponse.json(
        { error: 'Ungültige Anfrage', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { files, caseId, uiLanguage } = parsed.data

    // Validate total size
    let totalBytes = 0
    for (const f of files) {
      // base64 is ~4/3 the size of the original binary
      totalBytes += Math.ceil(f.base64.length * 3 / 4)
    }

    logger.debug('[ANALYZE] ─── Files received', {
      fileCount: files.length,
      totalKB: Math.round(totalBytes / 1024),
      caseId: caseId ?? 'none',
      uiLanguage,
      files: files.map((f) => ({
        name: f.name,
        type: f.type,
        sizeKB: Math.round(f.base64.length * 3 / 4 / 1024),
      })),
    })

    if (totalBytes > MAX_TOTAL_BYTES) {
      return NextResponse.json({ error: `Dateien zu groß (max. ${MAX_TOTAL_BYTES / 1024 / 1024} MB)` }, { status: 413 })
    }

    // Mark case as analyzing
    if (caseId && !isDemo) {
      const { db } = await import('@/lib/db')
      await db.case.updateMany({
        where: { id: caseId, userId },
        data: { status: 'ANALYZING' },
      })
      logger.debug('[ANALYZE] ─── DB: case status → ANALYZING', { caseId })
    }

    // Build Claude multimodal content blocks
    logger.debug('[ANALYZE] ─── Building content blocks…')
    const contentBlocks: Anthropic.Messages.ContentBlockParam[] = []

    for (const file of files) {
      if (PDF_TYPES.has(file.type)) {
        logger.debug('[ANALYZE]      PDF block', { name: file.name, sizeKB: Math.round(file.base64.length * 3 / 4 / 1024) })
        contentBlocks.push({
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: file.base64 },
        })
      } else if (IMAGE_TYPES.has(file.type)) {
        logger.debug('[ANALYZE]      Image block', { name: file.name, mimeType: file.type, sizeKB: Math.round(file.base64.length * 3 / 4 / 1024) })
        contentBlocks.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: file.base64,
          },
        })
      } else {
        // Text files — decode base64 to UTF-8
        const text = Buffer.from(file.base64, 'base64').toString('utf-8')
        logger.debug('[ANALYZE]      Text block', { name: file.name, chars: text.length })
        contentBlocks.push({ type: 'text', text: `### ${file.name}\n${text}` })
      }
    }

    const uiLangName = languageNames[uiLanguage] ?? uiLanguage

    contentBlocks.push({
      type: 'text',
      text: `Analyse the documents above and extract the core data as JSON.

Respond ONLY with a JSON object (no markdown, no comments):
{
  "bescheidData": {
    "finanzamt": "name of the authority",
    "steuernummer": "tax number or file reference",
    "bescheidDatum": "date in format DD.MM.YYYY",
    "steuerart": "type of notice (e.g. Einkommensteuer 2022)",
    "nachzahlung": 0,
    "streitigerBetrag": 0,
    "rawText": "2–3 sentence summary of the document — the main reason for the payment demand or rejection (max 400 chars)"
  },
  "followUpQuestions": [
    { "id": "q1", "question": "...", "required": true, "type": "text" }
  ]
}

Rules:
- Limit followUpQuestions to at most 5 targeted questions.
- For the "type" field: use "yesno" for yes/no questions, "amount" for monetary amounts, "text" for everything else.
- rawText: 2–3 sentences only — no full document text.
- LANGUAGE: Write all followUpQuestions in ${uiLangName}. The bescheidData field values must remain in their original language as found in the document.`,
    })

    const { models } = await getActiveModels()

    logger.debug('[ANALYZE] ─── Calling Claude (analyzer)', {
      model: models.analyzer.model,
      contentBlocks: contentBlocks.length,
      outputLang: uiLangName,
      maxTokens: PIPELINE.analyzeMaxTokens,
    })

    const t0Api = Date.now()

    // Analyze always uses Anthropic — the route builds Claude-native PDF/image
    // content blocks. The admin-controlled provider in models.analyzer is ignored here;
    // only the model name is used (Haiku in both dev and prod for speed).
    const client = new Anthropic({ apiKey: config.anthropicApiKey })
    const response = await client.messages.create({
      model: models.analyzer.model,
      max_tokens: PIPELINE.analyzeMaxTokens,
      system: `You are a tax law expert. Extract structured data from official notices and generate targeted follow-up questions. Respond ONLY with valid JSON — no markdown, no explanations. All followUpQuestions must be written in ${uiLangName}.`,
      messages: [{ role: 'user', content: contentBlocks }],
    })

    const durationMs = Date.now() - t0Api
    logger.agent('analyzer', 'anthropic', models.analyzer.model, durationMs)
    logger.debug('[ANALYZE] ─── Claude responded', {
      durationMs,
      inputTokens: response.usage?.input_tokens,
      outputTokens: response.usage?.output_tokens,
      stopReason: response.stop_reason,
      responseBlocks: response.content.length,
    })

    const result = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')

    logger.debug('[ANALYZE] ─── Extracting JSON from response', { rawResponseChars: result.length })

    const jsonMatch = result.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      logger.error('[ANALYZE] JSON extraction failed — no JSON found in response', {
        resultLength: result.length,
        preview: result.slice(0, 200),
      })
      return NextResponse.json({ error: 'Datenextraktion fehlgeschlagen' }, { status: 500 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any
    try {
      data = JSON.parse(jsonMatch[0])
    } catch (parseErr) {
      logger.error('[ANALYZE] JSON.parse failed', { parseErr, snippet: jsonMatch[0].slice(0, 300) })
      return NextResponse.json({ error: 'Datenextraktion fehlgeschlagen' }, { status: 500 })
    }

    const bescheidKeys = Object.keys(data.bescheidData ?? {})
    const questionCount = (data.followUpQuestions as unknown[])?.length ?? 0
    logger.debug('[ANALYZE] ─── JSON parsed successfully', {
      bescheidKeys,
      questionCount,
      questions: (data.followUpQuestions as Array<{ id: string; question: string; type: string }> | undefined)
        ?.map((q) => ({ id: q.id, type: q.type, questionPreview: q.question?.slice(0, 60) })),
    })

    // Save to DB
    if (caseId && !isDemo) {
      logger.debug('[ANALYZE] ─── Saving to DB…', { caseId, docCount: files.length })
      const t = Date.now()
      const { db } = await import('@/lib/db')
      await Promise.all([
        db.case.updateMany({
          where: { id: caseId, userId },
          data: { status: 'QUESTIONS', bescheidData: data.bescheidData ?? {} },
        }),
        ...files.map((file) =>
          db.document.create({
            data: {
              caseId,
              name: file.name,
              type: 'BESCHEID',
              storagePath: 'memory',
              mimeType: file.type || 'application/octet-stream',
              sizeBytes: Math.ceil(file.base64.length * 3 / 4),
            },
          })
        ),
      ])
      logger.debug('[ANALYZE] ─── DB: case status → QUESTIONS, documents saved', {
        caseId,
        docCount: files.length,
        dbMs: Date.now() - t,
      })
    }

    logger.debug('[ANALYZE] ─── Complete', { totalMs: Date.now() - t0Route })
    return NextResponse.json(data)
  } catch (error) {
    logger.error('[ANALYZE] Unhandled error', { error, elapsedMs: Date.now() - t0Route })
    return NextResponse.json({ error: 'Analyse fehlgeschlagen' }, { status: 500 })
  }
}
