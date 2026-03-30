import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Excluded from auth middleware via matcher. Used only by Docker healthcheck.
export function GET() {
  return NextResponse.json({ ok: true })
}
