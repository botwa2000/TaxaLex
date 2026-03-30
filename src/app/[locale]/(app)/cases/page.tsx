import { auth } from '@/auth'
import { DEMO_USER_ID, DEMO_CASES } from '@/lib/mockData'
import { CasesClient } from './CasesClient'

type CaseListItem = {
  id: string
  useCase: string
  status: string
  deadline: Date | null
  createdAt: Date
  updatedAt: Date
  _count: { documents: number }
}

export default async function CasesPage() {
  const session = await auth()
  const userId = session!.user!.id as string
  let cases: CaseListItem[] = []

  try {
    if (userId === DEMO_USER_ID) throw new Error('demo')
    const { db } = await import('@/lib/db')
    const raw = await db.case.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, useCase: true, status: true, deadline: true,
        createdAt: true, updatedAt: true,
        _count: { select: { documents: true } },
      },
    })
    cases = raw as CaseListItem[]
  } catch {
    cases = DEMO_CASES.map((c) => ({ ...c })) as CaseListItem[]
  }

  return <CasesClient cases={cases} />
}
