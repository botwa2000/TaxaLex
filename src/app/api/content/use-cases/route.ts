import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUseCases } from '@/lib/contentFallbacks'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get('locale') ?? 'de'

  try {
    const rows = await db.useCase.findMany({
      where: { locale, isActive: true },
      orderBy: { sortOrder: 'asc' },
    })

    if (rows.length > 0) {
      return NextResponse.json(rows)
    }
  } catch (err) {
    // DB unavailable — fall through to static fallback
    logger.warn('use-cases DB query failed, using fallback', { err })
  }

  return NextResponse.json(getUseCases(locale))
}
