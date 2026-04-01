import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const Schema = z.object({ email: z.string().email() })

// Used by the login page to detect unverified users after a failed signIn,
// so we can redirect them to /verify-email rather than showing a generic error.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ needs_verification: false })
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    select: { emailVerified: true },
  })

  // Only return true when we can confirm the email exists and is unverified.
  // Any other case (no account, already verified) → false, login page shows generic error.
  const needs_verification = user !== null && user.emailVerified === null
  return NextResponse.json({ needs_verification })
}
