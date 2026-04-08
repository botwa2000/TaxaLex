import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { logger } from '@/lib/logger'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
  }

  const userId = session.user.id as string
  const { id } = await params

  try {
    const { db } = await import('@/lib/db')

    // deleteMany with userId guard ensures users can only delete their own cases
    const result = await db.case.deleteMany({
      where: { id, userId },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: 'Fall nicht gefunden' }, { status: 404 })
    }

    logger.info('Case deleted', { caseId: id, userId })
    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error('Case delete failed', { error, caseId: id })
    return NextResponse.json({ error: 'Löschen fehlgeschlagen' }, { status: 500 })
  }
}

const PatchSchema = z.object({
  action: z.enum(['submit']),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
  }

  const userId = session.user.id as string
  const { id } = await params

  const body = await req.json()
  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 })
  }

  try {
    const { db } = await import('@/lib/db')

    // updateMany with userId guard + status guard — only DRAFT_READY can be submitted
    const result = await db.case.updateMany({
      where: { id, userId, status: 'DRAFT_READY' },
      data: { status: 'SUBMITTED', submittedAt: new Date() },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: 'Fall nicht gefunden oder nicht bereit' }, { status: 404 })
    }

    logger.info('Case submitted', { caseId: id, userId })
    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error('Case submit failed', { error, caseId: id })
    return NextResponse.json({ error: 'Einreichen fehlgeschlagen' }, { status: 500 })
  }
}
