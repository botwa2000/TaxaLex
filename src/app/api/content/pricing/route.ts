import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getPricingPlans } from '@/lib/contentFallbacks'
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

    if (plans.length > 0) {
      return NextResponse.json(plans)
    }
  } catch (err) {
    logger.warn('pricing DB query failed, using fallback', { err })
  }

  const plans = getPricingPlans(group)
  return NextResponse.json(plans)
}
