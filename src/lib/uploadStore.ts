import crypto from 'crypto'

export interface StoredFile {
  name: string
  type: string
  buffer: Buffer
}

interface UploadEntry {
  files: StoredFile[]
  userId: string
  createdAt: number
}

const store = new Map<string, UploadEntry>()
const TTL_MS = 15 * 60 * 1000 // 15 minutes

function pruneExpired() {
  const cutoff = Date.now() - TTL_MS
  for (const [id, entry] of store) {
    if (entry.createdAt < cutoff) store.delete(id)
  }
}

export function storeUpload(userId: string, files: StoredFile[]): string {
  pruneExpired()
  const id = crypto.randomUUID()
  store.set(id, { files, userId, createdAt: Date.now() })
  return id
}

// Consume-once: retrieve AND delete. Only the uploading user can retrieve.
export function consumeUpload(uploadId: string, userId: string): StoredFile[] | null {
  const entry = store.get(uploadId)
  if (!entry) return null
  if (entry.userId !== userId) return null
  if (Date.now() - entry.createdAt > TTL_MS) {
    store.delete(uploadId)
    return null
  }
  store.delete(uploadId)
  return entry.files
}
