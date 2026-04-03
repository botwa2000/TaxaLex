import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get('locale') ?? 'de'

  try {
    const rows = await db.useCase.findMany({
      where: { locale, isActive: true },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(rows)
  } catch (err) {
    logger.error('use-cases DB query failed', { err })
    return NextResponse.json({ error: 'Service temporarily unavailable.' }, { status: 503 })
  }
}
