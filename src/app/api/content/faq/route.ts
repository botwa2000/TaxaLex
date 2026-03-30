import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getFAQs } from '@/lib/contentFallbacks'
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

    if (rows.length > 0) {
      return NextResponse.json(rows)
    }
  } catch (err) {
    logger.warn('faq DB query failed, using fallback', { err })
  }

  const faqs = getFAQs(locale, category === 'all' ? undefined : category)
  return NextResponse.json(faqs)
}
