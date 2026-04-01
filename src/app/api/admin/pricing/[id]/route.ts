import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

const PatchSchema = z.object({
  priceOnce:    z.number().min(0).nullable().optional(),
  priceMonthly: z.number().min(0).nullable().optional(),
  priceAnnual:  z.number().min(0).nullable().optional(),
  isActive:     z.boolean().optional(),
  isPopular:    z.boolean().optional(),
  sortOrder:    z.number().int().min(0).optional(),
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
  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  const { id } = await context.params

  try {
    const plan = await db.pricingPlan.update({
      where: { id },
      data: {
        ...(parsed.data.priceOnce    !== undefined && { priceOnce:    parsed.data.priceOnce }),
        ...(parsed.data.priceMonthly !== undefined && { priceMonthly: parsed.data.priceMonthly }),
        ...(parsed.data.priceAnnual  !== undefined && { priceAnnual:  parsed.data.priceAnnual }),
        ...(parsed.data.isActive     !== undefined && { isActive:     parsed.data.isActive }),
        ...(parsed.data.isPopular    !== undefined && { isPopular:    parsed.data.isPopular }),
        ...(parsed.data.sortOrder    !== undefined && { sortOrder:    parsed.data.sortOrder }),
      },
      select: { id: true, priceOnce: true, priceMonthly: true, priceAnnual: true, isActive: true, isPopular: true },
    })
    return NextResponse.json(plan)
  } catch (error) {
    logger.error('Admin pricing update failed', { id, error })
    return NextResponse.json({ error: 'Fehlgeschlagen' }, { status: 500 })
  }
}
