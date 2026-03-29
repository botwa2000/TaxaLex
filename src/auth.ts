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
        // Demo credentials — bypasses DB for UI testing
        if (
          (credentials?.email === 'admin' || credentials?.email === 'admin@demo.com') &&
          credentials?.password === 'admin'
        ) {
          return {
            id: 'demo_admin_001',
            email: 'admin@demo.com',
            name: 'Admin Demo',
            role: 'ADMIN',
          }
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
