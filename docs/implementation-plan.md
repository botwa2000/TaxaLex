# Implementation Plan

> Single source of truth for all planned and in-progress development work.
> Update status as work completes. Reference this file at the start of every session.

---

## Status Legend
- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[-]` Deferred / blocked

---

## Phase 1 — Foundation Fixes ✦ DO FIRST
> Corrects standards violations from CLAUDE.md before any feature work.

| # | Task | File(s) | Status |
|---|---|---|---|
| 1.1 | Central env config — `requireEnv()`, all `process.env` reads | `src/config/env.ts` | `[x]` |
| 1.2 | Model name & pipeline constants — no more hardcoded strings in agents | `src/config/constants.ts` | `[x]` |
| 1.3 | Feature flags — isDev gates, future flags | `src/config/features.ts` | `[x]` |
| 1.4 | Update `agents.ts` to import from constants | `src/lib/agents.ts` | `[x]` |
| 1.5 | Zod schemas on both API routes | `src/app/api/analyze/route.ts`, `generate/route.ts` | `[x]` |
| 1.6 | Security headers in Next.js config | `next.config.js` | `[x]` |
| 1.7 | Global error boundary | `src/app/error.tsx` | `[x]` |
| 1.8 | Global loading state | `src/app/loading.tsx` | `[x]` |

---

## Phase 2 — Database
> Prisma + PostgreSQL. All persistence lives here.

| # | Task | File(s) | Status |
|---|---|---|---|
| 2.1 | Install Prisma + bcryptjs | `package.json` | `[x]` |
| 2.2 | Full Prisma schema — User, Account, Session, Case, Document, AgentOutput | `prisma/schema.prisma` | `[x]` |
| 2.3 | Prisma client singleton | `src/lib/db.ts` | `[x]` |
| 2.4 | Run initial migration (dev) | `prisma/migrations/` | `[-]` Needs local DB |

### Schema Summary

```
User ──< Case ──< Document
     ──< Case ──< AgentOutput
     ──< Account (OAuth)
     ──< Session
```

**User roles:** `USER | PRO | ADVISOR | LAWYER | ADMIN`

**Case statuses** (full lifecycle from userflow.md):
`CREATED → UPLOADING → ANALYZING → QUESTIONS → GENERATING → DRAFT_READY → ADVISOR_REVIEW → APPROVED → SUBMITTED → AWAITING_RESPONSE → CLOSED_SUCCESS | CLOSED_PARTIAL | REJECTED`

**Document types:**
`BESCHEID | JAHRESABSCHLUSS | BELEG | VOLLMACHT | EINSPRUCH_DRAFT | EINSPRUCH_FINAL | BEHOERDEN_ANTWORT | ADVISOR_NOTES | KORRESPONDENZ`

---

## Phase 3 — Authentication
> NextAuth v5 (already installed). Email/password + Google OAuth.

| # | Task | File(s) | Status |
|---|---|---|---|
| 3.1 | NextAuth core config — providers, callbacks, session strategy | `src/auth.ts` | `[x]` |
| 3.2 | NextAuth API route handler | `src/app/api/auth/[...nextauth]/route.ts` | `[x]` |
| 3.3 | Auth middleware — protect `/dashboard`, `/cases`, `/account` | `src/middleware.ts` | `[x]` |
| 3.4 | Add auth vars to env config | `src/config/env.ts` | `[x]` |
| 3.5 | Registration API (email + password, Prisma write) | `src/app/api/auth/register/route.ts` | `[x]` |

### Auth Strategy
- **Credentials provider**: email + bcrypt password hash
- **Google OAuth**: social login (requires `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`)
- **Session**: JWT (no DB session table needed initially, switch to DB sessions when advisor features land)
- **Protected routes**: `/dashboard/*`, `/cases/*`, `/account/*` — redirect to `/login`
- **Public routes**: `/`, `/login`, `/register`, `/api/auth/*`, `/impressum`, `/datenschutz`

---

## Phase 4 — Auth UI
> Login, register, password reset pages. Minimal, clean, consistent with brand.

| # | Task | File(s) | Status |
|---|---|---|---|
| 4.1 | Auth layout (centered card, no sidebar) | `src/app/(auth)/layout.tsx` | `[x]` |
| 4.2 | Login page | `src/app/(auth)/login/page.tsx` | `[x]` |
| 4.3 | Register page | `src/app/(auth)/register/page.tsx` | `[x]` |
| 4.4 | Post-login redirect logic | `src/middleware.ts` | `[x]` |

---

## Phase 5 — Protected App Shell
> Dashboard, case list, account settings. Replaces the current stateless wizard.

| # | Task | File(s) | Status |
|---|---|---|---|
| 5.1 | App layout with sidebar nav + session header | `src/app/(app)/layout.tsx` | `[x]` |
| 5.2 | Dashboard — case overview, deadline counters, CTA | `src/app/(app)/dashboard/page.tsx` | `[x]` |
| 5.3 | Account / profile settings page | `src/app/(app)/account/page.tsx` | `[x]` |
| 5.4 | Cases list page | `src/app/(app)/cases/page.tsx` | `[x]` |

---

## Phase 6 — Connect Wizard to DB
> Persist cases and documents. Wire session into the AI pipeline.

| # | Task | File(s) | Status |
|---|---|---|---|
| 6.1 | Create case on wizard start (DB write) | `src/app/api/cases/route.ts` | `[ ]` |
| 6.2 | Update case status through wizard steps | `src/app/api/cases/[id]/route.ts` | `[ ]` |
| 6.3 | Persist agent outputs to DB | `src/app/api/generate/route.ts` | `[ ]` |
| 6.4 | Case detail page (timeline, documents, letter) | `src/app/(app)/cases/[id]/page.tsx` | `[ ]` |
| 6.5 | Guard generate/analyze routes behind auth | `src/app/api/*/route.ts` | `[ ]` |

---

## Phase 7 — Security Hardening
> Rate limiting, CSRF, input hardening. Required before any public traffic.

| # | Task | File(s) | Status |
|---|---|---|---|
| 7.1 | Rate limiter utility (in-memory, swap to Redis later) | `src/lib/rateLimit.ts` | `[ ]` |
| 7.2 | Apply rate limiting to all API routes | `src/app/api/*/route.ts` | `[ ]` |
| 7.3 | File upload MIME + size validation (server-side) | `src/app/api/analyze/route.ts` | `[ ]` |
| 7.4 | Env validation at startup — fail fast if keys missing | `src/config/env.ts` | `[x]` |

---

## Phase 8 — German Legal Compliance
> Legally required for any German-facing website.

| # | Task | File(s) | Status |
|---|---|---|---|
| 8.1 | Impressum page (§5 TMG) | `src/app/impressum/page.tsx` | `[ ]` |
| 8.2 | Datenschutzerklärung (GDPR Art. 13/14) | `src/app/datenschutz/page.tsx` | `[ ]` |
| 8.3 | AGB / Terms of Service | `src/app/agb/page.tsx` | `[ ]` |
| 8.4 | Cookie consent banner (ePrivacy) | `src/components/CookieBanner.tsx` | `[ ]` |
| 8.5 | AI disclaimer — "not legal advice" | Landing page + result screen | `[ ]` |

---

## Phase 9 — CI/CD & Observability

| # | Task | File(s) | Status |
|---|---|---|---|
| 9.1 | GitHub Actions — lint + tsc + build on PR | `.github/workflows/ci.yml` | `[ ]` |
| 9.2 | Sentry error tracking (Next.js SDK) | `sentry.*.config.ts` | `[ ]` |
| 9.3 | Health check endpoint | `src/app/api/health/route.ts` | `[ ]` |
| 9.4 | Dockerfile + docker-entrypoint.sh | `Dockerfile`, `docker-entrypoint.sh` | `[ ]` |
| 9.5 | Docker Swarm stack file | `docker-stack.yml` | `[ ]` |

---

## Phase 10 — Payments (Stripe)

| # | Task | File(s) | Status |
|---|---|---|---|
| 10.1 | Install Stripe SDK | `package.json` | `[ ]` |
| 10.2 | Pricing page | `src/app/pricing/page.tsx` | `[ ]` |
| 10.3 | Checkout session API | `src/app/api/billing/checkout/route.ts` | `[ ]` |
| 10.4 | Stripe webhook handler | `src/app/api/billing/webhook/route.ts` | `[ ]` |
| 10.5 | Billing settings page | `src/app/(app)/billing/page.tsx` | `[ ]` |
| 10.6 | Entitlement check (gate Pro features) | `src/lib/entitlements.ts` | `[ ]` |

---

## Phase 11 — PDF/OCR & File Storage

| # | Task | File(s) | Status |
|---|---|---|---|
| 11.1 | PDF text extraction (pdf-parse or Tesseract) | `src/lib/ocr.ts` | `[ ]` |
| 11.2 | S3-compatible file storage (Hetzner Object Storage) | `src/lib/storage.ts` | `[ ]` |
| 11.3 | Virus scan on upload (ClamAV via API) | `src/lib/virusScan.ts` | `[ ]` |
| 11.4 | Update upload flow to store files, not pass text inline | `src/app/api/analyze/route.ts` | `[ ]` |

---

## Phase 12 — Advisor / Lawyer Module

| # | Task | File(s) | Status |
|---|---|---|---|
| 12.1 | Advisor registration + verification flow | `src/app/(auth)/register-advisor/page.tsx` | `[ ]` |
| 12.2 | Advisor dashboard (assigned cases) | `src/app/(advisor)/dashboard/page.tsx` | `[ ]` |
| 12.3 | Case assignment API | `src/app/api/cases/[id]/assign/route.ts` | `[ ]` |
| 12.4 | In-app messaging (user ↔ advisor) | `src/app/api/cases/[id]/messages/route.ts` | `[ ]` |
| 12.5 | Track-changes editor (TipTap) | `src/components/LetterEditor.tsx` | `[ ]` |
| 12.6 | Advisor approval + digital signature | `src/app/api/cases/[id]/approve/route.ts` | `[ ]` |

---

## Environment Variables — Complete Reference

```env
# AI Providers
ANTHROPIC_API_KEY=          # Drafter, Adversary, Consolidator
GOOGLE_AI_API_KEY=          # Reviewer (Gemini)
PERPLEXITY_API_KEY=         # FactChecker (Perplexity Sonar)
OPENAI_API_KEY=             # Optional / future

# Auth
NEXTAUTH_SECRET=            # openssl rand -base64 32
NEXTAUTH_URL=               # https://yourdomain.com
GOOGLE_CLIENT_ID=           # Google OAuth
GOOGLE_CLIENT_SECRET=       # Google OAuth

# Database
DATABASE_URL=               # postgresql://user:pass@host:5432/dbname

# App
NEXT_PUBLIC_APP_URL=        # Public base URL (used in emails, OAuth callbacks)

# Payments (Phase 10)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Storage (Phase 11)
S3_ENDPOINT=
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=

# Observability (Phase 9)
SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

---

## Package Install Reference

```bash
# Phase 2
npm install prisma @prisma/client bcryptjs
npm install -D @types/bcryptjs

# Phase 9
npm install @sentry/nextjs

# Phase 10
npm install stripe @stripe/stripe-js

# Phase 11
npm install pdf-parse @aws-sdk/client-s3
npm install -D @types/pdf-parse

# Phase 12
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-track-changes
```

---

## Dependency Map

```
Phase 1 (foundation)
  └─ Phase 2 (database)
       └─ Phase 3 (auth)
            ├─ Phase 4 (auth UI)
            └─ Phase 5 (app shell)
                 └─ Phase 6 (wizard → DB)
                      ├─ Phase 7 (security)
                      ├─ Phase 10 (payments)
                      ├─ Phase 11 (files)
                      └─ Phase 12 (advisors)

Phase 8 (legal) — independent, do any time
Phase 9 (CI/CD) — independent, do any time
```
