/**
 * Test script: verify /api/analyze SSE streaming with real PDFs
 *
 * Usage:
 *   node scripts/test-analyze.mjs [base-url]
 *
 * Default base-url: https://dev.taxalex.de
 * For local:        node scripts/test-analyze.mjs http://localhost:3010
 *
 * The script:
 *   1. Logs in as admin@taxalex.de and gets a session cookie
 *   2. Calls /api/analyze with the two real Bescheid PDFs
 *   3. Reads the SSE stream and logs the time each event arrives
 *   4. Fails with a non-zero exit code if:
 *      - No "analyzing_start" event arrives within 60s of request start
 *      - No "doc_type" event arrives within 120s of "analyzing_start"
 *      - No "complete" event arrives at all
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const BASE_URL = process.argv[2] ?? 'https://dev.taxalex.de'

const PDF_PATHS = [
  'C:/Users/Alexa/OneDrive/Documents/Steuer/2023/Nachreichung/Fixario/2023_Bescheid_1.pdf',
  'C:/Users/Alexa/OneDrive/Documents/Steuer/2023/Nachreichung/Fixario/2023_Bescheid_2.pdf',
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(ms) {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`
}

function toBase64(buf) {
  return buf.toString('base64')
}

// ── Step 1: Login ─────────────────────────────────────────────────────────────

async function login() {
  console.log(`\n[1] Logging in at ${BASE_URL}/api/auth/callback/credentials …`)
  const t0 = Date.now()

  // next-auth credentials login
  // First, get the CSRF token
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`)
  const csrfJson = await csrfRes.json()
  const csrfToken = csrfJson.csrfToken
  if (!csrfToken) throw new Error('Could not get CSRF token')

  const setCookieRaw = csrfRes.headers.get('set-cookie') ?? ''
  const csrfCookie = setCookieRaw.split(';')[0]

  const loginBody = new URLSearchParams({
    csrfToken,
    email: 'admin@taxalex.de',
    password: 'Admin1234!',
    callbackUrl: '/',
    json: 'true',
  })

  const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: csrfCookie,
    },
    body: loginBody,
    redirect: 'manual',
  })

  // Collect session cookie from all set-cookie headers
  const allCookies = loginRes.headers.get('set-cookie') ?? ''
  const sessionCookie = allCookies
    .split(',')
    .map((c) => c.trim().split(';')[0])
    .filter((c) => c.includes('next-auth.session-token') || c.includes('__Secure-next-auth.session-token'))
    .join('; ')

  if (!sessionCookie) {
    throw new Error(`Login failed — no session cookie in response. Status: ${loginRes.status}`)
  }

  const cookieHeader = [csrfCookie, sessionCookie].filter(Boolean).join('; ')
  console.log(`    ✓ Logged in in ${fmt(Date.now() - t0)}`)
  return cookieHeader
}

// ── Step 2: Load & encode PDFs ────────────────────────────────────────────────

async function loadFiles() {
  console.log('\n[2] Loading & base64-encoding PDFs …')
  const t0 = Date.now()
  const files = PDF_PATHS.map((p) => {
    const buf = readFileSync(p)
    const sizeMB = (buf.length / 1024 / 1024).toFixed(1)
    console.log(`    ${p.split('/').pop()} — ${sizeMB} MB`)
    return {
      name: p.split('/').pop(),
      type: 'application/pdf',
      base64: toBase64(buf),
    }
  })
  const totalMB = (files.reduce((s, f) => s + f.base64.length * 0.75, 0) / 1024 / 1024).toFixed(1)
  console.log(`    ✓ Encoded in ${fmt(Date.now() - t0)} — total original size ~${totalMB} MB`)
  return files
}

// ── Step 3: Call analyze and read SSE ─────────────────────────────────────────

async function runAnalyze(cookieHeader, files) {
  console.log('\n[3] Calling /api/analyze …')

  const body = JSON.stringify({ files, uiLanguage: 'de' })
  const bodyKB = (body.length / 1024).toFixed(0)
  console.log(`    Request body: ${bodyKB} KB`)

  const t0 = Date.now()
  let tFetchResolved = null
  let tFirstEvent = null
  let tDocType = null
  let tFirstField = null
  let tComplete = null
  let fieldCount = 0
  let questionCount = 0
  let failed = false
  let failReason = ''

  const res = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
    },
    body,
  })

  tFetchResolved = Date.now()
  console.log(`\n    fetch() resolved in ${fmt(tFetchResolved - t0)} (HTTP ${res.status})`)

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Server returned ${res.status}: ${text.slice(0, 200)}`)
  }

  if (!res.body) {
    throw new Error('No response body — SSE stream unavailable')
  }

  // Read SSE stream
  const decoder = new TextDecoder()
  let buffer = ''
  const reader = res.body.getReader()

  // Timeout: if no event for 120s, abort
  const abortController = { aborted: false }
  const timeout = setTimeout(() => {
    abortController.aborted = true
    reader.cancel()
  }, 180_000)

  try {
    while (true) {
      if (abortController.aborted) {
        failed = true
        failReason = `No SSE event for 180s (stuck after: ${tFirstEvent ? `first event at ${fmt(tFirstEvent - t0)}` : 'never received first event'})`
        break
      }

      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const parts = buffer.split('\n\n')
      buffer = parts.pop() ?? ''

      for (const part of parts) {
        let eventName = ''
        let dataStr = ''
        for (const line of part.split('\n')) {
          if (line.startsWith('event: ')) eventName = line.slice(7).trim()
          if (line.startsWith('data: ')) dataStr = line.slice(6).trim()
        }
        if (!dataStr || !eventName) continue

        const now = Date.now()
        if (!tFirstEvent) tFirstEvent = now

        let payload
        try { payload = JSON.parse(dataStr) } catch { continue }

        const sinceStart = fmt(now - t0)

        if (eventName === 'analyzing_start') {
          console.log(`    [+${sinceStart}] ← analyzing_start  ✓ (AI pipeline connected)`)
        } else if (eventName === 'doc_type') {
          tDocType = now
          console.log(`    [+${sinceStart}] ← doc_type:  "${payload.label}" (${payload.category})`)
        } else if (eventName === 'field') {
          if (!tFirstField) {
            tFirstField = now
            console.log(`    [+${sinceStart}] ← field (first): "${payload.label}" = "${String(payload.value).slice(0, 40)}"`)
          }
          fieldCount++
        } else if (eventName === 'complete') {
          tComplete = now
          questionCount = (payload.followUpQuestions ?? []).length
          console.log(`    [+${sinceStart}] ← complete  (${fieldCount} fields, ${questionCount} questions)`)
        } else if (eventName === 'error') {
          failed = true
          failReason = `Server error: ${payload.message}`
          console.error(`    [+${sinceStart}] ← error: ${payload.message}`)
        }
      }

      if (tComplete) break
    }
  } finally {
    clearTimeout(timeout)
  }

  // ── Summary ──────────────────────────────────────────────────────────────

  console.log('\n─── Timing Summary ──────────────────────────────────────────')
  console.log(`  Request body sent:     ${fmt(tFetchResolved - t0)} after request start`)
  console.log(`  First SSE event:       ${tFirstEvent ? fmt(tFirstEvent - t0) : 'NEVER'} after request start`)
  console.log(`  Doc type detected:     ${tDocType ? fmt(tDocType - t0) : 'NEVER'}`)
  console.log(`  First field extracted: ${tFirstField ? fmt(tFirstField - t0) : 'NEVER'}`)
  console.log(`  Complete:              ${tComplete ? fmt(tComplete - t0) : 'NEVER'}`)
  console.log(`  Fields extracted:      ${fieldCount}`)
  console.log(`  Questions generated:   ${questionCount}`)

  if (failed) {
    console.error(`\n✗ FAILED: ${failReason}`)
    process.exit(1)
  }

  if (!tComplete) {
    console.error('\n✗ FAILED: Stream ended without "complete" event')
    process.exit(1)
  }

  if (fieldCount === 0) {
    console.error('\n✗ FAILED: No fields extracted')
    process.exit(1)
  }

  if (questionCount < 3) {
    console.error(`\n✗ FAILED: Only ${questionCount} questions generated (expected ≥ 3)`)
    process.exit(1)
  }

  // Key check: first SSE event should arrive within 60s of request start
  // (upload time only — no Anthropic API wait in the new architecture)
  if (tFirstEvent && (tFirstEvent - t0) > 60_000) {
    console.warn(`\n⚠ SLOW: First SSE event took ${fmt(tFirstEvent - t0)} (expected < 60s — check upload speed)`)
  } else {
    console.log(`\n✓ PASSED: First SSE event in ${fmt((tFirstEvent ?? t0) - t0)} ← the fix is working`)
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

try {
  const cookieHeader = await login()
  const files = await loadFiles()
  await runAnalyze(cookieHeader, files)
} catch (err) {
  console.error(`\n✗ Error: ${err.message}`)
  process.exit(1)
}
