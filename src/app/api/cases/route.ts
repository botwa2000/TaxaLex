import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { logger } from '@/lib/logger'

const CreateCaseSchema = z.object({
  useCase: z.string().min(1).max(50).default('tax'),
  outputLanguage: z.string().length(2).optional().default('de'),
  uiLanguage: z.string().length(2).optional().default('de'),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
  }

  const userId = session.user.id as string

  try {
    const body = await req.json()
    const parsed = CreateCaseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 })
    }

    const { useCase, outputLanguage, uiLanguage } = parsed.data
    const { db } = await import('@/lib/db')

    const newCase = await db.case.create({
      data: { userId, useCase, outputLanguage, uiLanguage, status: 'CREATED' },
      select: { id: true, status: true, createdAt: true },
    })

    logger.info('Case created', { caseId: newCase.id, useCase, userId })
    return NextResponse.json({ caseId: newCase.id, status: newCase.status })
  } catch (error) {
    logger.error('Case creation failed', { error })
    return NextResponse.json({ error: 'Fall konnte nicht erstellt werden' }, { status: 500 })
  }
}
