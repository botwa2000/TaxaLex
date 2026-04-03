import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import { logger } from '@/lib/logger'
import { PIPELINE } from '@/config/constants'
import { getActiveModels } from '@/lib/pipelineMode'
import { auth } from '@/auth'
import { rateLimit } from '@/lib/rateLimit'
import { config } from '@/config/env'

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
  const limited = rateLimit(req, { maxRequests: 30, windowMs: 60 * 60 * 1000 })
  if (limited) return limited

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
  }

  const userId = session.user.id as string

  // Payment guard
  if (!userId.startsWith('demo_')) {
    const { db } = await import('@/lib/db')
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { creditBalance: true, subscription: { select: { status: true } } },
    })
    const hasAccess =
      (user?.creditBalance ?? 0) > 0 ||
      ['ACTIVE', 'TRIALING'].includes(user?.subscription?.status ?? '')
    if (!hasAccess) {
      return NextResponse.json({ error: 'Kein Guthaben — bitte ein Paket kaufen' }, { status: 402 })
    }
  }

  try {
    const body = await req.json()
    const parsed = AnalyzeSchema.safeParse(body)
    if (!parsed.success) {
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
    if (totalBytes > MAX_TOTAL_BYTES) {
      return NextResponse.json({ error: `Dateien zu groß (max. ${MAX_TOTAL_BYTES / 1024 / 1024} MB)` }, { status: 413 })
    }

    // Mark case as analyzing
    if (caseId && !userId.startsWith('demo_')) {
      const { db } = await import('@/lib/db')
      await db.case.updateMany({
        where: { id: caseId, userId },
        data: { status: 'ANALYZING' },
      })
    }

    // Build Claude multimodal content blocks
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
            media_type: file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: file.base64,
          },
        })
      } else {
        // Text files — decode base64 to UTF-8
        const text = Buffer.from(file.base64, 'base64').toString('utf-8')
        contentBlocks.push({ type: 'text', text: `### ${file.name}\n${text}` })
      }
    }

    const langInstruction =
      uiLanguage !== 'de'
        ? `\n\nIMPORTANT: Write all questions in the language with code "${uiLanguage}".`
        : ''

    contentBlocks.push({
      type: 'text',
      text: `Analysiere die obigen Dokumente und extrahiere die Kerndaten im JSON-Format.

Antworte NUR mit einem JSON-Objekt (kein Markdown, kein Kommentar):
{
  "bescheidData": {
    "finanzamt": "Name des Finanzamts oder der Behörde",
    "steuernummer": "Steuernummer oder Aktenzeichen",
    "bescheidDatum": "Datum im Format DD.MM.YYYY",
    "steuerart": "Art des Bescheids (z.B. Einkommensteuer 2022)",
    "nachzahlung": 0,
    "streitigerBetrag": 0,
    "rawText": "Kurze Zusammenfassung des Dokuments in 2-3 Sätzen (max. 400 Zeichen) — der Hauptgrund für die Nachzahlung oder Ablehnung"
  },
  "followUpQuestions": [
    { "id": "q1", "question": "...", "required": true, "type": "text" }
  ]
}${langInstruction}

Beschränke followUpQuestions auf maximal 5 gezielte Fragen.
Für das Feld "type" in followUpQuestions: Nutze "yesno" für Ja/Nein-Fragen, "amount" für Betrags-/Zahlungsangaben, "text" für alle anderen.
Für rawText: Nur 2-3 Sätze — kein langer Dokumententext.`,
    })

    const { models } = await getActiveModels()
    const t0 = Date.now()

    const client = new Anthropic({ apiKey: config.anthropicApiKey })
    const response = await client.messages.create({
      model: models.drafter,
      max_tokens: PIPELINE.maxTokens,
      system: 'Du bist ein Steuerexperte. Extrahiere strukturierte Kerndaten aus Steuerdokumenten und stelle bis zu 5 gezielte Rückfragen. Antworte ausschließlich mit validem JSON — kein Markdown, keine Erklärungen. Das Feld rawText enthält nur eine 2-3-Satz-Zusammenfassung, NICHT den vollen Dokumententext.',
      messages: [{ role: 'user', content: contentBlocks }],
    })

    const durationMs = Date.now() - t0
    logger.agent('drafter', 'anthropic', models.drafter, durationMs)

    const result = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')

    const jsonMatch = result.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      logger.error('JSON extraction failed', { resultLength: result.length })
      return NextResponse.json({ error: 'Datenextraktion fehlgeschlagen' }, { status: 500 })
    }

    const data = JSON.parse(jsonMatch[0])

    // Save to DB
    if (caseId && !userId.startsWith('demo_')) {
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
    }

    return NextResponse.json(data)
  } catch (error) {
    logger.error('Analyze error', { error })
    return NextResponse.json({ error: 'Analyse fehlgeschlagen' }, { status: 500 })
  }
}
