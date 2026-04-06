import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { rateLimit } from '@/lib/rateLimit'
import { storeUpload } from '@/lib/uploadStore'
import { PIPELINE } from '@/config/constants'
import { logger } from '@/lib/logger'

export const maxDuration = 60

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'text/plain',
])

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { maxRequests: 30, windowMs: 60 * 60 * 1000 })
  if (limited) return limited

  const session = await auth()
  if (!session?.user?.id)
    return Response.json({ error: 'Nicht angemeldet' }, { status: 401 })

  const userId = session.user.id as string

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return Response.json({ error: 'Ungültige Anfrage' }, { status: 400 })
  }

  const stored: Array<{ name: string; type: string; buffer: Buffer }> = []
  let totalBytes = 0

  for (const [, value] of formData) {
    if (!(value instanceof File)) continue
    if (stored.length >= PIPELINE.maxDocuments) break

    if (!ALLOWED_MIME_TYPES.has(value.type)) {
      return Response.json({ error: `Dateityp nicht erlaubt: ${value.type}` }, { status: 415 })
    }

    const buffer = Buffer.from(await value.arrayBuffer())
    totalBytes += buffer.length

    if (totalBytes > PIPELINE.maxUploadBytes) {
      return Response.json(
        { error: `Dateien zu groß (max. ${PIPELINE.maxUploadBytes / 1024 / 1024} MB)` },
        { status: 413 }
      )
    }

    stored.push({ name: value.name, type: value.type, buffer })
  }

  if (stored.length === 0) {
    return Response.json({ error: 'Keine Dateien empfangen' }, { status: 400 })
  }

  const uploadId = storeUpload(userId, stored)

  logger.debug('[UPLOAD] ─── Files stored', {
    userId: userId.slice(-8),
    fileCount: stored.length,
    totalKB: Math.round(totalBytes / 1024),
    uploadId: uploadId.slice(-8),
  })

  return Response.json({ uploadId })
}
