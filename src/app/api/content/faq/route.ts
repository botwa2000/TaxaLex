import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get('locale') ?? 'de'
  const category = req.nextUrl.searchParams.get('category') ?? 'all'
  const userGroup = req.nextUrl.searchParams.get('userGroup') ?? undefined

  try {
    const rows = await db.fAQ.findMany({
      where: {
        locale,
        isActive: true,
        ...(category !== 'all' ? { category } : {}),
        ...(userGroup ? { OR: [{ userGroup }, { userGroup: null }] } : {}),
      },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(rows)
  } catch (err) {
    logger.error('faq DB query failed', { err })
    return NextResponse.json({ error: 'Service temporarily unavailable.' }, { status: 503 })
  }
}
