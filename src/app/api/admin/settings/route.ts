import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { getPipelineMode, setPipelineMode } from '@/lib/pipelineMode'

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const pipelineMode = await getPipelineMode()
  return NextResponse.json({ pipelineMode })
}

const UpdateSchema = z.object({
  pipelineMode: z.enum(['dev', 'prod']),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  await setPipelineMode(parsed.data.pipelineMode)
  return NextResponse.json({ pipelineMode: parsed.data.pipelineMode })
}
