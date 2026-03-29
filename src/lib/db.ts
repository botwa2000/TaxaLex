import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from '@/config/env'

// Singleton pattern — prevents multiple client instances in dev due to hot reload
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createClient(): PrismaClient {
  // Prisma 7 with engineType "client" requires an adapter at construction time.
  // We always provide PrismaPg; when DATABASE_URL is absent we use a placeholder
  // so the constructor succeeds — actual queries will fail at runtime, not at import.
  // This allows the app to start and serve non-DB routes (landing page, etc.).
  const connectionString = config.databaseUrl ?? 'postgresql://placeholder:placeholder@localhost:5432/placeholder'
  const adapter = new PrismaPg(connectionString)
  return new PrismaClient({
    adapter,
    log: config.isDev ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const db = globalForPrisma.prisma ?? createClient()

if (config.isDev) globalForPrisma.prisma = db
