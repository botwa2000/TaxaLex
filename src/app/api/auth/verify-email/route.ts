import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/de/login?error=invalid_token', req.url))
  }

  try {
    const record = await db.emailVerificationToken.findUnique({ where: { token } })

    if (!record) {
      return NextResponse.redirect(new URL('/de/login?error=invalid_token', req.url))
    }

    if (record.expiresAt < new Date()) {
      await db.emailVerificationToken.delete({ where: { token } })
      return NextResponse.redirect(new URL('/de/login?error=token_expired', req.url))
    }

    // Mark email as verified and delete token in one transaction
    await db.$transaction([
      db.user.update({
        where: { id: record.userId },
        data: { emailVerified: new Date() },
      }),
      db.emailVerificationToken.delete({ where: { token } }),
    ])

    logger.info('Email verified', { userId: record.userId })

    // Redirect to dashboard — user will need to sign in
    return NextResponse.redirect(new URL('/de/login?verified=1', req.url))
  } catch (error) {
    logger.error('Email verification error', { error })
    return NextResponse.redirect(new URL('/de/login?error=server_error', req.url))
  }
}
