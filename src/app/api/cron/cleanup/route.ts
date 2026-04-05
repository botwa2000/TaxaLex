import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/config/env'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * GET /api/cron/cleanup
 *
 * Deletes case data for free (non-paying) users older than RETENTION_DAYS.
 * Called daily by a server cron job via:
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://taxalex.de/api/cron/cleanup
 *
 * "Free user" = no active/trialing subscription AND creditBalance <= 0.
 * Paid users' cases are never touched regardless of age.
 *
 * The delete cascades via Prisma schema (onDelete: Cascade) to:
 *   Document, CaseOutput, AdvisorAssignment rows for those cases.
 */
const RETENTION_DAYS = 30

export async function GET(req: NextRequest) {
  const secret = config.cronSecret
  const auth = req.headers.get('authorization')

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000)

  logger.info('[CRON] cleanup started', { cutoff: cutoff.toISOString(), retentionDays: RETENTION_DAYS })

  try {
    const result = await db.case.deleteMany({
      where: {
        createdAt: { lt: cutoff },
        user: {
          creditBalance: { lte: 0 },
          // No active or trialing subscription
          OR: [
            { subscription: { is: null } },
            { subscription: { status: { notIn: ['ACTIVE', 'TRIALING'] } } },
          ],
        },
      },
    })

    logger.info('[CRON] cleanup complete', {
      deletedCases: result.count,
      cutoff: cutoff.toISOString(),
    })

    return NextResponse.json({
      ok: true,
      deleted: result.count,
      cutoff: cutoff.toISOString(),
    })
  } catch (error) {
    logger.error('[CRON] cleanup failed', { error })
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 })
  }
}
