import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { callAgent, AGENTS } from '@/lib/agents'
import { logger } from '@/lib/logger'
import { PIPELINE } from '@/config/constants'

const AnalyzeSchema = z.object({
  documents: z
    .array(
      z.object({
        name: z.string().min(1).max(255),
        text: z.string().max(500_000), // ~500KB of text per document
      })
    )
    .min(1, 'At least one document is required')
    .max(PIPELINE.maxDocuments),
  uiLanguage: z.string().length(2).optional().default('de'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = AnalyzeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Ungültige Anfrage', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { documents, uiLanguage } = parsed.data

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

    const result = await callAgent(
      {
        ...AGENTS.drafter,
        systemPrompt:
          'Du bist ein Steuerexperte. Extrahiere strukturierte Daten aus Steuerdokumenten und stelle gezielte Rückfragen. Antworte nur mit validem JSON.',
      },
      extractionPrompt
    )

    // Extract JSON block from model response (models sometimes add prose around it)
    const jsonMatch = result.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      logger.error('JSON extraction failed', { resultLength: result.length })
      return NextResponse.json(
        { error: 'Datenextraktion fehlgeschlagen' },
        { status: 500 }
      )
    }

    const data = JSON.parse(jsonMatch[0])
    return NextResponse.json(data)
  } catch (error) {
    logger.error('Analyze error', { error })
    return NextResponse.json({ error: 'Analyse fehlgeschlagen' }, { status: 500 })
  }
}
