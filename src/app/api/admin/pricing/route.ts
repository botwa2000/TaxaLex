import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const plans = await db.pricingPlan.findMany({
      orderBy: [{ userGroup: 'asc' }, { sortOrder: 'asc' }],
      include: {
        translations: { where: { locale: 'de' } },
        features:     { where: { locale: 'de' }, orderBy: { sortOrder: 'asc' } },
      },
    })
    return NextResponse.json(plans)
  } catch (error) {
    logger.error('Admin pricing fetch failed', { error })
    return NextResponse.json({ error: 'Fehlgeschlagen' }, { status: 500 })
  }
}
