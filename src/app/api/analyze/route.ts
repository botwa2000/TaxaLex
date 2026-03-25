import { NextRequest, NextResponse } from 'next/server'
import { callAgent, AGENTS } from '@/lib/agents'

export async function POST(req: NextRequest) {
  try {
    const { documents } = await req.json()

    if (!documents?.length) {
      return NextResponse.json(
        { error: 'Keine Dokumente hochgeladen' },
        { status: 400 }
      )
    }

    // Use the drafter agent to extract structured data from the documents
    const extractionPrompt = `Analysiere die folgenden Dokumente und extrahiere die Daten im JSON-Format:

${documents.map((d: any) => `### ${d.name}\n${d.text}`).join('\n\n')}

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
}`

    const result = await callAgent(
      {
        ...AGENTS.drafter,
        systemPrompt:
          'Du bist ein Steuerexperte. Extrahiere strukturierte Daten aus Steuerdokumenten und stelle gezielte Rückfragen. Antworte nur mit validem JSON.',
      },
      extractionPrompt
    )

    // Parse the JSON response
    const jsonMatch = result.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Datenextraktion fehlgeschlagen' },
        { status: 500 }
      )
    }

    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json(parsed)
  } catch (error) {
    console.error('[TaxPax] Analyze error:', error)
    return NextResponse.json(
      { error: 'Analyse fehlgeschlagen' },
      { status: 500 }
    )
  }
}
