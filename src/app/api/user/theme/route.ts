import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { z } from 'zod'

const ThemeSchema = z.object({ theme: z.enum(['light', 'dark', 'system']) })

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = ThemeSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid theme' }, { status: 400 })

  const userId = session.user.id as string
  // Demo users: silently ignore — no DB row
  if (userId.startsWith('demo_')) return NextResponse.json({ ok: true })

  const { db } = await import('@/lib/db')
  await db.user.update({ where: { id: userId }, data: { theme: parsed.data.theme } })
  return NextResponse.json({ ok: true })
}
