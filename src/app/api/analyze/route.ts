import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { logger } from '@/lib/logger'
import { PIPELINE } from '@/config/constants'
import { getActiveModels } from '@/lib/pipelineMode'
import { auth } from '@/auth'
import { rateLimit } from '@/lib/rateLimit'
import { config } from '@/config/env'

// Max upload size enforced here (10 MB total across all files)
const MAX_TOTAL_BYTES = PIPELINE.maxUploadBytes

// Mime types Claude can read natively
const PDF_TYPES = ['application/pdf']
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export async function POST(req: NextRequest) {
  // Rate limit: 30 analyze requests per IP per hour
  const limited = rateLimit(req, { maxRequests: 30, windowMs: 60 * 60 * 1000 })
  if (limited) return limited

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
  }

  const userId = session.user.id as string

  // Payment guard (skip for demo accounts)
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
    const formData = await req.formData()
    const caseId = formData.get('caseId') as string | null
    const uiLanguage = (formData.get('uiLanguage') as string) || 'de'

    // Collect all files from FormData
    const fileEntries: { name: string; type: string; bytes: Buffer }[] = []
    let totalBytes = 0

    for (const [key, value] of formData.entries()) {
      if (key === 'files' && value instanceof File) {
        const buffer = Buffer.from(await value.arrayBuffer())
        totalBytes += buffer.length
        if (totalBytes > MAX_TOTAL_BYTES) {
          return NextResponse.json({ error: 'Dateien zu groß (max. 10 MB)' }, { status: 413 })
        }
        fileEntries.push({ name: value.name, type: value.type, bytes: buffer })
      }
    }

    if (fileEntries.length === 0) {
      return NextResponse.json({ error: 'Mindestens ein Dokument erforderlich' }, { status: 400 })
    }

    if (fileEntries.length > PIPELINE.maxDocuments) {
      return NextResponse.json({ error: `Maximal ${PIPELINE.maxDocuments} Dokumente` }, { status: 400 })
    }

    // Mark case as analyzing
    if (caseId && !userId.startsWith('demo_')) {
      const { db } = await import('@/lib/db')
      await db.case.updateMany({
        where: { id: caseId, userId },
        data: { status: 'ANALYZING' },
      })
    }

    // Build Claude message content blocks — PDFs and images as native document/image blocks, text as text
    const contentBlocks: Anthropic.Messages.ContentBlockParam[] = []

    for (const file of fileEntries) {
      const base64 = file.bytes.toString('base64')

      if (PDF_TYPES.includes(file.type)) {
        contentBlocks.push({
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: base64 },
        })
      } else if (IMAGE_TYPES.includes(file.type)) {
        contentBlocks.push({
          type: 'image',
          source: { type: 'base64', media_type: file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp', data: base64 },
        })
      } else {
        // Text-based files (txt, docx as text) — decode as UTF-8
        const text = file.bytes.toString('utf-8')
        contentBlocks.push({ type: 'text', text: `### ${file.name}\n${text}` })
      }
    }

    const langInstruction =
      uiLanguage !== 'de'
        ? `\n\nIMPORTANT: Write all questions in the language with code "${uiLanguage}".`
        : ''

    // Add the extraction instruction as a text block
    contentBlocks.push({
      type: 'text',
      text: `Analysiere die obigen Dokumente und extrahiere die Daten im JSON-Format.

Antworte NUR mit einem JSON-Objekt:
{
  "bescheidData": {
    "finanzamt": "...",
    "steuernummer": "...",
    "bescheidDatum": "...",
    "steuerart": "...",
    "nachzahlung": 0,
    "streitigerBetrag": 0
  },
  "followUpQuestions": [
    { "id": "q1", "question": "...", "required": true }
  ],
  "extractedText": "Vollständiger extrahierter Text aus allen Dokumenten — wird für die spätere Einspruchsgenerierung benötigt"
}${langInstruction}`,
    })

    const { models } = await getActiveModels()

    const client = new Anthropic({ apiKey: config.anthropicApiKey })
    const response = await client.messages.create({
      model: models.drafter,
      max_tokens: PIPELINE.maxTokens,
      system: 'Du bist ein Steuerexperte. Extrahiere strukturierte Daten aus Steuerdokumenten und stelle gezielte Rückfragen. Antworte nur mit validem JSON. Im Feld "extractedText" gib den vollständigen Text aller Dokumente wieder, damit er für die weitere Verarbeitung verwendet werden kann.',
      messages: [{ role: 'user', content: contentBlocks }],
    })

    const result = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')

    logger.agent('drafter', 'anthropic', models.drafter, 0)

    const jsonMatch = result.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      logger.error('JSON extraction failed', { resultLength: result.length })
      return NextResponse.json({ error: 'Datenextraktion fehlgeschlagen' }, { status: 500 })
    }

    const data = JSON.parse(jsonMatch[0])

    // Save bescheidData to case and move to QUESTIONS status
    if (caseId && !userId.startsWith('demo_')) {
      const { db } = await import('@/lib/db')
      await Promise.all([
        db.case.updateMany({
          where: { id: caseId, userId },
          data: {
            status: 'QUESTIONS',
            bescheidData: data.bescheidData ?? {},
          },
        }),
        ...fileEntries.map((file) =>
          db.document.create({
            data: {
              caseId,
              name: file.name,
              type: 'BESCHEID',
              storagePath: 'memory', // not persisted per GDPR — metadata only
              mimeType: file.type || 'application/octet-stream',
              sizeBytes: file.bytes.length,
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
