import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
  }

  const userId = session.user.id as string

  // Demo accounts always have access
  if (userId.startsWith('demo_')) {
    return NextResponse.json({ hasAccess: true, creditBalance: 999, isDemo: true })
  }

  const { db } = await import('@/lib/db')
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { creditBalance: true, subscription: { select: { status: true } } },
  })

  const creditBalance = user?.creditBalance ?? 0
  const hasSubscription = ['ACTIVE', 'TRIALING'].includes(user?.subscription?.status ?? '')
  const hasAccess = creditBalance > 0 || hasSubscription

  return NextResponse.json({ hasAccess, creditBalance, isDemo: false })
}
