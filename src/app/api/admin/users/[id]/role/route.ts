import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

const RoleSchema = z.object({
  role: z.enum(['USER', 'PRO', 'ADVISOR', 'LAWYER', 'ADMIN']),
})

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = RoleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const { id: userId } = await context.params

  try {
    await db.user.update({
      where: { id: userId },
      data: { role: parsed.data.role },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error('Admin role change failed', { userId, error })
    return NextResponse.json({ error: 'Fehlgeschlagen' }, { status: 500 })
  }
}
