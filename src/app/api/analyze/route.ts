import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { callAgent } from '@/lib/agents'
import { logger } from '@/lib/logger'
import { PIPELINE } from '@/config/constants'
import { getActiveModels } from '@/lib/pipelineMode'
import { auth } from '@/auth'

const AnalyzeSchema = z.object({
  documents: z
    .array(
      z.object({
        name: z.string().min(1).max(255),
        text: z.string().max(500_000),
      })
    )
    .min(1, 'At least one document is required')
    .max(PIPELINE.maxDocuments),
  caseId: z.string().optional(),
  uiLanguage: z.string().length(2).optional().default('de'),
})

export async function POST(req: NextRequest) {
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
    const body = await req.json()
    const parsed = AnalyzeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Ungültige Anfrage', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { documents, caseId, uiLanguage } = parsed.data

    // Mark case as analyzing
    if (caseId && !userId.startsWith('demo_')) {
      const { db } = await import('@/lib/db')
      await db.case.updateMany({
        where: { id: caseId, userId },
        data: { status: 'ANALYZING' },
      })
    }

    const langInstruction =
      uiLanguage !== 'de'
        ? `\n\nIMPORTANT: Write all questions in the language with code "${uiLanguage}".`
        : ''

    const extractionPrompt = `Analysiere die folgenden Dokumente und extrahiere die Daten im JSON-Format:

${documents.map((d) => `### ${d.name}\n${d.text}`).join('\n\n')}

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
  ]
}${langInstruction}`

    const { models } = await getActiveModels()
    const result = await callAgent(
      {
        role: 'drafter',
        provider: 'anthropic',
        model: models.drafter,
        systemPrompt:
          'Du bist ein Steuerexperte. Extrahiere strukturierte Daten aus Steuerdokumenten und stelle gezielte Rückfragen. Antworte nur mit validem JSON.',
      },
      extractionPrompt
    )

    const jsonMatch = result.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      logger.error('JSON extraction failed', { resultLength: result.length })
      return NextResponse.json({ error: 'Datenextraktion fehlgeschlagen' }, { status: 500 })
    }

    const data = JSON.parse(jsonMatch[0])

    // Save bescheidData to case and move to QUESTIONS status
    if (caseId && !userId.startsWith('demo_')) {
      const { db } = await import('@/lib/db')
      // Save uploaded document metadata (no file content per GDPR policy)
      await Promise.all([
        db.case.updateMany({
          where: { id: caseId, userId },
          data: {
            status: 'QUESTIONS',
            bescheidData: data.bescheidData ?? {},
          },
        }),
        ...documents.map((doc) =>
          db.document.create({
            data: {
              caseId,
              name: doc.name,
              type: 'BESCHEID',
              storagePath: 'memory', // not persisted per GDPR — metadata only
              mimeType: 'application/octet-stream',
              sizeBytes: doc.text.length,
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
