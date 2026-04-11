import { auth } from '@/auth'
import { DEMO_CASES } from '@/lib/mockData'
import { logger } from '@/lib/logger'
import { CasesClient } from './CasesClient'

type CaseListItem = {
  id: string
  useCase: string
  status: string
  deadline: Date | null
  createdAt: Date
  updatedAt: Date
  _count: { documents: number }
  answersCount: number
  draftLocked: boolean
  bescheidData: Record<string, unknown> | null
}

export default async function CasesPage() {
  const session = await auth()
  const userId = session!.user!.id as string
  let cases: CaseListItem[] = []

  const isDemo = userId.startsWith('demo_')

  try {
    if (isDemo) throw new Error('demo')
    const { db } = await import('@/lib/db')
    const raw = await db.case.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, useCase: true, status: true, deadline: true,
        createdAt: true, updatedAt: true,
        userAnswers: true,
        draftLocked: true,
        bescheidData: true,
        _count: { select: { documents: true } },
      },
    })
    cases = raw.map((c) => ({
      id: c.id,
      useCase: c.useCase,
      status: c.status,
      deadline: c.deadline,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      _count: c._count,
      answersCount: Object.keys((c.userAnswers as Record<string, unknown>) ?? {}).length,
      draftLocked: c.draftLocked,
      bescheidData: (c.bescheidData as Record<string, unknown>) ?? null,
    }))
  } catch (err) {
    // Only show demo cases for demo accounts — real users with DB errors see empty list
    if (isDemo) {
      cases = (DEMO_CASES as unknown as CaseListItem[]).map((c) => ({ ...c, answersCount: 0, draftLocked: false }))
    } else {
      logger.error('Cases fetch failed', { error: err, userId: userId.slice(-8) })
    }
  }

  return <CasesClient cases={cases} />
}
