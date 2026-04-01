import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { orchestrate } from '@/lib/agents'
import { logger } from '@/lib/logger'
import { PIPELINE } from '@/config/constants'
import { auth } from '@/auth'

export const maxDuration = 120

const BescheidDataSchema = z.object({
  finanzamt: z.string().min(1).max(200),
  steuernummer: z.string().max(50),
  bescheidDatum: z.string().max(20),
  steuerart: z.string().max(100),
  nachzahlung: z.number().nonnegative(),
  streitigerBetrag: z.number().nonnegative(),
  rawText: z.string().optional(),
})

const GenerateSchema = z.object({
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

export async function POST(req: NextRequest) {
  // Auth guard
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
  }

  // Payment guard (skip for demo accounts)
  const userId = session.user.id as string
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
    const parsed = GenerateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Ungültige Anfrage', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { bescheidData, documents, userAnswers, outputLanguage, uiLanguage } =
      parsed.data

    const { outputs, finalDraft } = await orchestrate(
      bescheidData,
      documents,
      userAnswers,
      outputLanguage,
      uiLanguage
    )

    return NextResponse.json({
      outputs: outputs.map((o) => ({
        role: o.role,
        provider: o.provider,
        model: o.model,
        // content omitted from response in prod — frontend uses finalDraft
        timestamp: o.timestamp,
      })),
      finalDraft,
      status: 'success',
    })
  } catch (error) {
    logger.error('Generate error', { error })
    return NextResponse.json(
      { error: 'Einspruch-Generierung fehlgeschlagen' },
      { status: 500 }
    )
  }
}
