import 'server-only'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { features } from '@/config/features'

export async function GET() {
  if (!features.advisorModule) {
    return NextResponse.json({ error: 'Not available' }, { status: 403 })
  }

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const advisors = await db.user.findMany({
    where: { role: { in: ['ADVISOR', 'LAWYER'] } },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      _count: {
        select: {
          advisorAssignments: {
            where: { status: { in: ['PENDING', 'ACCEPTED', 'CHANGES_REQUESTED'] } },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(
    advisors.map(a => ({
      id: a.id,
      name: a.name,
      email: a.email,
      role: a.role,
      activeAssignments: a._count.advisorAssignments,
    }))
  )
}
