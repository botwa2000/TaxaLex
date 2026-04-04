import { NextRequest, NextResponse } from 'next/server'
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

    // updateMany with userId guard ensures users can only delete their own cases
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
