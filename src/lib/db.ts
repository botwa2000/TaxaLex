// Run `npx prisma generate` after setting DATABASE_URL to create the client
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client')
import { config } from '@/config/env'

// Singleton pattern — prevents multiple client instances in dev due to hot reload
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalForPrisma = globalThis as unknown as { prisma: any }

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.isDev ? ['query', 'error', 'warn'] : ['error'],
  })

if (config.isDev) globalForPrisma.prisma = db
