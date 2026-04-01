import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { authConfig } from '@/auth.config'
import { db } from '@/lib/db'
import { config } from '@/config/env'
import { features } from '@/config/features'
import { AUTH } from '@/config/constants'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  providers: [
    Credentials({
      name: 'Email',
      credentials: {
        email: { label: 'E-Mail', type: 'email' },
        password: { label: 'Passwort', type: 'password' },
      },
      async authorize(credentials) {
        // Demo accounts — bypasses DB for UI testing
        const DEMO_ACCOUNTS: Record<string, { id: string; name: string; role: string; password: string }> = {
          'admin@taxalex.de':          { id: 'demo_admin_001',   name: 'Max Mustermann', role: 'ADMIN',   password: 'Admin1234!' },
          'advisor@demo.taxalex.de':   { id: 'demo_advisor_001', name: 'Karin Müller',   role: 'ADVISOR', password: 'Demo1234!' },
          'lawyer@demo.taxalex.de':    { id: 'demo_lawyer_001',  name: 'Dr. Fischer',    role: 'LAWYER',  password: 'Demo1234!' },
          'user@demo.taxalex.de':      { id: 'demo_user_001',    name: 'Anna Schmidt',   role: 'USER',    password: 'Demo1234!' },
          'expat@demo.taxalex.de':     { id: 'demo_expat_001',   name: 'James Wilson',   role: 'USER',    password: 'Demo1234!' },
          // Deprecated alias kept for backwards compatibility
          'admin@demo.com':            { id: 'demo_admin_001',   name: 'Max Mustermann', role: 'ADMIN',   password: 'admin' },
        }

        const email = (credentials?.email as string | undefined)?.toLowerCase() ?? ''
        const password = (credentials?.password as string | undefined) ?? ''

        const demo = DEMO_ACCOUNTS[email]
        if (demo && password === demo.password) {
          return { id: demo.id, email, name: demo.name, role: demo.role }
        }
        // Also accept the old "admin" / "admin" shorthand
        if ((email === 'admin') && password === 'admin') {
          return { id: 'demo_admin_001', email: 'admin@demo.com', name: 'Max Mustermann', role: 'ADMIN' }
        }

        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string().min(AUTH.minPasswordLength),
          })
          .safeParse(credentials)

        if (!parsed.success) return null

        const user = await db.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        })

        if (!user?.passwordHash) return null

        const passwordValid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash
        )
        if (!passwordValid) return null

        // Block login until email is verified
        if (!user.emailVerified) return null

        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),

    ...(features.googleAuth
      ? [
          Google({
            clientId: config.googleClientId,
            clientSecret: config.googleClientSecret,
          }),
        ]
      : []),
  ],
})
