import { NextResponse } from 'next/server'
import { auth, signOut } from '@/auth'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

// DELETE /api/user/account — deletes the authenticated user's account and all their data
export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 })
  }

  const userId = session.user.id

  // Block demo accounts from being deleted
  if (userId.startsWith('demo_')) {
    return NextResponse.json({ error: 'Demo-Konten können nicht gelöscht werden.' }, { status: 403 })
  }

  try {
    // Cascade deletes handle related records (tokens, cases) via Prisma schema onDelete: Cascade
    await db.user.delete({ where: { id: userId } })
    logger.info('User account deleted', { userId })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Account deletion failed', { userId, error })
    return NextResponse.json({ error: 'Konto konnte nicht gelöscht werden.' }, { status: 500 })
  }
}
