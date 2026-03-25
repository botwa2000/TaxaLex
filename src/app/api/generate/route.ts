import { NextRequest, NextResponse } from 'next/server'
import { orchestrate } from '@/lib/agents'

export const maxDuration = 120 // Allow up to 2 minutes for multi-agent pipeline

export async function POST(req: NextRequest) {
  try {
    const { bescheidData, documents, userAnswers } = await req.json()

    if (!bescheidData) {
      return NextResponse.json(
        { error: 'Bescheid-Daten fehlen' },
        { status: 400 }
      )
    }

    const { outputs, finalDraft } = await orchestrate(
      bescheidData,
      documents ?? [],
      userAnswers ?? {}
    )

    return NextResponse.json({
      outputs: outputs.map((o) => ({
        role: o.role,
        provider: o.provider,
        model: o.model,
        content: o.content,
        timestamp: o.timestamp,
      })),
      finalDraft,
      status: 'success',
    })
  } catch (error) {
    console.error('[TaxPax] Generate error:', error)
    return NextResponse.json(
      { error: 'Einspruch-Generierung fehlgeschlagen' },
      { status: 500 }
    )
  }
}
