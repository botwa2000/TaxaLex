import type { NextAuthConfig } from 'next-auth'
import { config } from '@/config/env'

/**
 * Edge-safe auth config — no Prisma/bcrypt imports.
 * Used by middleware (Edge Runtime). Providers that need DB are added in auth.ts.
 */
export const authConfig: NextAuthConfig = {
  secret: config.nextAuthSecret,
  // Required when running behind a reverse proxy (nginx → Docker container).
  // Auth.js v5 rejects internal hostnames like 127.0.0.1 without this.
  trustHost: true,

  providers: [],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id     = user.id
        token.role   = (user as { role?: string }).role    ?? 'USER'
        token.theme  = (user as { theme?: string }).theme  ?? 'system'
        token.locale = (user as { locale?: string }).locale ?? 'de'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id     = token.id     as string
        session.user.role   = token.role   as string
        session.user.theme  = (token.theme  as string | undefined) ?? 'system'
        session.user.locale = (token.locale as string | undefined) ?? 'de'
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
}
