import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get('locale') ?? 'de'
  const group = req.nextUrl.searchParams.get('group') ?? undefined

  try {
    const plans = await db.pricingPlan.findMany({
      where: {
        isActive: true,
        ...(group ? { userGroup: group } : {}),
      },
      include: {
        translations: { where: { locale } },
        features: { where: { locale }, orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(plans)
  } catch (err) {
    logger.error('pricing DB query failed', { err })
    return NextResponse.json({ error: 'Service temporarily unavailable.' }, { status: 503 })
  }
}
