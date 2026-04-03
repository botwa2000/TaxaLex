import 'server-only'
import { db } from '@/lib/db'
import { MODELS_DEV, MODELS_PROD } from '@/config/constants'

export type PipelineMode = 'dev' | 'prod'

// In-memory cache — avoids a DB round-trip on every agent call.
// 30-second TTL: admin toggle takes effect within half a minute.
let cached: { mode: PipelineMode; expiresAt: number } | null = null

export async function getPipelineMode(): Promise<PipelineMode> {
  if (cached && Date.now() < cached.expiresAt) return cached.mode

  try {
    const setting = await db.appSetting.findUnique({ where: { key: 'pipeline_mode' } })
    const mode: PipelineMode = setting?.value === 'prod' ? 'prod' : 'dev'
    cached = { mode, expiresAt: Date.now() + 30_000 }
    return mode
  } catch {
    // DB unavailable — default to dev (safer, cheaper)
    return 'dev'
  }
}

export async function setPipelineMode(mode: PipelineMode): Promise<void> {
  await db.appSetting.upsert({
    where: { key: 'pipeline_mode' },
    create: { key: 'pipeline_mode', value: mode },
    update: { value: mode },
  })
  // Invalidate cache immediately
  cached = null
}

export async function getActiveModels(): Promise<{ models: typeof MODELS_DEV | typeof MODELS_PROD; mode: PipelineMode }> {
  const mode = await getPipelineMode()
  return { models: mode === 'prod' ? MODELS_PROD : MODELS_DEV, mode }
}
