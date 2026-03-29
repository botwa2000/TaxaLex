import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from '@/config/env'

// Singleton pattern — prevents multiple client instances in dev due to hot reload
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createClient(): PrismaClient {
  // Prisma 7 requires a driver adapter for direct DB connections.
  // Falls back gracefully when DATABASE_URL is not set (mockup / build phase).
  if (config.databaseUrl) {
    const adapter = new PrismaPg({ connectionString: config.databaseUrl })
    return new PrismaClient({
      adapter,
      log: config.isDev ? ['query', 'error', 'warn'] : ['error'],
    })
  }
  // No DB configured — Prisma client will throw only on actual queries, not on import.
  // This allows the app to start and serve non-DB routes (landing page, etc.).
  return new PrismaClient({
    log: config.isDev ? ['error', 'warn'] : ['error'],
  })
}

export const db = globalForPrisma.prisma ?? createClient()

if (config.isDev) globalForPrisma.prisma = db
