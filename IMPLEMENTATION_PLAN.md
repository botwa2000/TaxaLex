# TaxaLex — Implementation Plan

> Last updated: 2026-03-31

---

## Part 1: Strategic Foundation

### The Problem

Every year 3.3 million Einsprüche are filed against German government notices (BMF 2023).
67 % are fully or partially granted. Most people never file because the 30-day deadline
feels short, the language is opaque, and a professional charges €200–500 per letter.

**TaxaLex:** Remove every barrier. Upload the notice, answer a few questions, download
a professionally structured, fact-verified objection letter in under 5 minutes.

---

### Roles and Business Model

#### Individual users — the product

Everyone who received an official German notice has the same problem, regardless of whether
they are a Privatperson, Selbstständiger, or Expat. The process, the output, and the price
are identical. There are no user-group distinctions in the product.

| Plan | Price | What you get |
|---|---|---|
| **Einzelfall** | €5,99 | 1 complete Einspruch, all formats |
| **5er-Paket** | €19,99 | 5 Einsprüche, no expiry, document archive |
| **Monats-Flat** | €9,99 / month | Unlimited Einsprüche, all formats, archive |

No free generation tier. The demo (mock data, no real AI cost) is the marketing funnel.
At ~€0.97 per real generation (25 API calls across 5 providers), giving away real runs is
a direct loss. The demo gives a complete and compelling preview. Users who are serious pay €5.99.

#### Professional review — an optional add-on for users

After generation, any user can optionally request a review by a licensed professional
before submitting. This is NOT a product sold to advisors or lawyers — it is a feature
sold to users who want extra confidence.

| Trigger | Price |
|---|---|
| Einzelfall or 5er-Paket user requests review | **€99 / case** |
| Monats-Flat subscriber requests review | **€69 / case** |

**What the professional receives:**
- A secure, HMAC-signed, time-limited link (7 days) — no login required
- The complete AI-generated draft + 5-agent analysis summary + deadline
- Three actions only: **Freigeben** / **Kommentar** / **Rückfrage**
- Payment: €99 gross, platform fee deducted, net transferred within 7 days

**No subscription product for advisors or lawyers.** No multi-client portal. No billing tool.
They participate because a user invites them. TaxaLex does not market to them — users do.

#### Who can be a professional reviewer

Any licensed German professional who can provide a quality review:
- Steuerberater (StBerG §57)
- Rechtsanwalt (BRAO §1)
- Fachanwalt (specific area matching the case type)
- Steuerberater + Rechtsanwalt combined (Steuerfachangestellte do NOT qualify)

The `/advisor` public page explains the programme and drives registration.
Professionals register, select their expertise areas (Steuer, Soziales, Arbeit, Miete, Verwaltung),
confirm licence number, and TaxaLex verifies before activating their account as a reviewer.
They earn per review — no minimum commitment.

**Why this model works:**
- Professionals spend 15–20 min reviewing a near-finished draft (not 2 h drafting from scratch)
- They are invited by their own clients — no cold sales pitch needed
- TaxaLex gains credibility; users gain confidence; revenue stays clean

---

### AI Pipeline: 11 Steps, 5 Providers

The pipeline is identical for all use cases. System prompts are parameterised by use case:
agents act as domain experts for that specific Bescheid type and as that specific authority
in the final review stage.

```
STAGE A — DISCOVERY
  1. User uploads document + describes situation
  2. [PARALLEL] All 5 providers → expert questions list (domain expert role)
  3. [SEQUENTIAL] Claude consolidates questions → prioritised list for user
  4. User answers / uploads additional documents (or says "nothing more to add")

STAGE B — INITIAL DRAFT
  5. [SEQUENTIAL] Claude → Draft v1 (full structure, citations, Aussetzung request)

STAGE C — FIRST REVIEW ROUND
  6. [PARALLEL] All 5 providers critically review Draft v1
     (Perplexity: live-verify every cited §§ and court case)
  7. [SEQUENTIAL] Claude consolidates feedback → Draft v2

STAGE D — SECOND REVIEW ROUND
  8. [PARALLEL] All 5 providers review Draft v2
  9. [SEQUENTIAL] Claude → Draft v3

STAGE E — AUTHORITY PERSPECTIVE REVIEW
 10. [PARALLEL] All 5 providers read Draft v3 as the receiving authority
     (looking for grounds to reject, missing evidence, loopholes)
 11. [SEQUENTIAL] Claude consolidates authority feedback → FINAL DRAFT
```

**Providers:**
| Provider | Primary role | Unique strength |
|---|---|---|
| Claude (Anthropic) | Drafter, all consolidation, final draft | Long-context reasoning, structured legal writing |
| Gemini (Google) | Review rounds — language & logic | Coherence and argumentation quality |
| Perplexity | Review rounds — fact verification | Live search: verify BFH/BSG/LAG cases and §§ |
| OpenAI GPT-4o | Review rounds — alternative perspective | Different training data = different blind spots |
| Grok (xAI) | Review rounds — adversarial | Questioning assumptions, finding weak points |

**Timing:** Steps 2, 6, 8, 10 run fully in parallel (Promise.all). Total ~2–3 min wall-clock.

**Cost per generation:** ~€0.80–1.20 (25 API calls). Detailed breakdown in Phase 1 section.

---

### Technical Infrastructure Audit

| Component | Status | Phase |
|---|---|---|
| Next.js 15 App Router + next-intl | ✅ solid | keep |
| PostgreSQL + Prisma | ✅ solid | expand Phase 3 |
| next-auth v5 | ✅ solid | extend Phase 2 |
| `agents.ts` 5-agent pipeline | ✅ works | redesign → 11-step Phase 1 |
| Einspruch page UI (5-step wizard) | ✅ great UX | wire to real backend Phase 1 |
| File upload | ❌ mocked | Phase 1 |
| OCR / text extraction | ❌ mocked | Phase 1 |
| Case persistence | ❌ stateless | Phase 1 |
| Streaming progress (SSE) | ❌ fake timers | Phase 1 |
| Email (transactional) | ❌ nothing | **Phase 2 — Brevo** |
| Email verification | ❌ missing | Phase 2 |
| Password reset | ❌ missing | Phase 2 |
| Professional review workflow | ❌ missing | Phase 6 |
| Payments (Stripe) | ❌ stubs | Phase 4 |
| GDPR compliance | ⚠️ partial | Phase 5 |
| Public pages | ✅ complete | done |

---

## Part 2: Implementation Phases

**Sequencing principle:** All phases are ordered by infrastructure cost, not feature importance.
Phases 0–3 require nothing beyond the existing stack (Next.js, Prisma, next-auth, no new paid APIs).
Phases 4–8 are deferred until the UI is complete and the business model is validated.
Appeal generation (real AI pipeline) is the final step — Phase 4.

Each phase leaves the site fully operational. No broken states between phases.

---

### Phase 0 — Critical Cleanup (1 week, no new infrastructure)

**Objective:** Remove legal exposure and broken content before any users arrive.

- [x] Impressum: filled with "TaxaLex (in Gründung), Bad Homburg, info@taxalex.de"; noindex added — update with real HRB/address on company registration
- [x] AGB: amber banner removed; date set to January 2025; noindex added
- [x] Datenschutz: noindex added
- [x] Create `/[locale]/kontakt` — contact page with email + support hours; linked from Footer
- [x] Sidebar "Kostenlos-Plan / 1/1 Einsprüche genutzt" hardcoded block removed from app layout
- [x] brand.ts: `supportEmail: 'info@taxalex.de'` added as single source of truth
- [ ] Audit all `#anchor` links on landing page — verify /#faq, /#use-cases, etc. resolve correctly
- [ ] Confirm `/advisor` page links to `/kontakt` correctly (no broken stubs)
- [ ] Verify zero fake statistics / fake testimonials / "first appeal free" claims across all pages

**Files:** `impressum/page.tsx`, `agb/page.tsx`, new `kontakt/page.tsx`, `(app)/layout.tsx`
**DB changes:** none | **New env vars:** none

---

### Phase 1 — Auth Pages + App Shell (pure UI, no new infrastructure)

**Objective:** Auth flows are complete and polished. App shell is functional for all roles.
No new env vars. No new API costs. Uses existing DB + next-auth.

#### 1a — Login page rebuild

- User type tabs: Privatperson | Steuerberater | Rechtsanwalt (cosmetic only — same auth flow)
- Demo credentials panel (collapsible): click any account to auto-fill credentials
  - admin@taxalex.de / Admin1234! → ADMIN
  - advisor@demo.taxalex.de / Demo1234! → ADVISOR
  - user@demo.taxalex.de / Demo1234! → USER
- `Alert` component for auth errors (currently raw text)
- "Passwort vergessen?" link → `/forgot-password` (page exists, backend Phase 3)
- Correct callbackUrl redirect after login

#### 1b — Register page rebuild

- User type tabs: Privatperson | Steuerberater | Rechtsanwalt
- Per-type benefit bullets (3 × CheckCircle2) — what you get as this type
- Name, Email, Password, Confirm Password, Terms checkbox
- Password strength indicator (4-level: weak/fair/good/strong via regex — no library)
- Advisor/lawyer extra fields: profession type, licence number (saved to profile later)
- Post-register: redirect to dashboard with "Bitte bestätige deine E-Mail" banner (non-blocking until Phase 3)

#### 1c — Forgot password page (UI only)

- `/forgot-password` — email input, submit button, success message
- `/reset-password?token=` — new password + confirm, success redirect
- Backend (token generation + email) wired in Phase 3

#### 1d — Account settings page

Current `/account` page: read what exists, rebuild with:
- Profile section: name, email (read-only until verified), locale preference
- Password change: current password + new + confirm (functional — uses existing auth)
- Danger zone: "Konto löschen" button (UI only — modal confirms, backend Phase 5)

#### 1e — Dashboard improvements

- Role-based welcome: different heading for USER / ADVISOR / ADMIN
- Empty state: no cases yet → large CTA card "Ersten Einspruch starten"
- Real case count from DB (replace any hardcoded stats)
- Quick action cards: "Neuer Einspruch" / "Alle Fälle" / "Abrechnung"

#### 1f — Cases list page

- `Tabs` component: Alle | Aktiv | Eingereicht | Abgeschlossen
- `Badge` component for case status (color-coded)
- Case row: type icon + title + deadline countdown chip + status badge + "Öffnen" link
- Empty state per tab

#### 1g — Billing page UI

- Current plan card (hardcoded "Gratis" until payments wired)
- Three plan cards from `contentFallbacks.ts` with "Upgrade" buttons (disabled, tooltip "Zahlung folgt")
- Professional review add-on card (same as pricing page)
- Invoice history placeholder: "Noch keine Rechnungen"
- No Stripe — all buttons show "coming soon" state

#### 1h — Admin panel tabs

- `Tabs`: Übersicht | Nutzer | Einsprüche | Inhalte
- Übersicht: 4 stat cards (total users, active cases, generations today, revenue placeholder "—")
- Nutzer: table with search — reads from DB
- Einsprüche: table of all cases across all users
- Inhalte: lists FAQ/pricing/use-case counts with disabled "Bearbeiten" buttons

#### 1i — Advisor portal UI

`/advisor/dashboard`, `/advisor/clients`, `/advisor/appeals`, `/advisor/billing` — all using `DEMO_CLIENTS` mock data:
- Dashboard: 4 stat cards + recent activity list
- Clients: table with search + "Client hinzufügen" button (modal placeholder)
- Appeals: all reviews across clients with status tabs
- Billing: advisor plan info (placeholder) + payout history ("—")

**Files:** `(auth)/login/page.tsx`, `(auth)/register/page.tsx`, new `(auth)/forgot-password/page.tsx`, new `(auth)/reset-password/page.tsx`, `(app)/account/page.tsx`, `(app)/dashboard/page.tsx`, `(app)/cases/page.tsx`, `(app)/billing/page.tsx`, `(app)/admin/page.tsx`, `(app)/advisor/*`
**DB changes:** none | **New env vars:** none

---

### Phase 2 — Einspruch Wizard: Demo Mode Polish (pure UI, no API costs)

**Objective:** The demo flow is compelling and complete. When a user completes the demo,
they understand exactly what they'll get when they pay. No real AI costs incurred.

#### 2a — Wizard step 1: Upload

- Real file input (`<input type="file">`) — accepts PDF, JPEG, PNG
- File preview: filename + size + type icon
- Demo mode toggle: "Beispiel-Bescheid verwenden" (skips real upload, loads mock `DEMO_BESCHEID`)
- Clear "Diese Demo zeigt, wie TaxaLex arbeitet" label

#### 2b — Wizard step 2: Analysis animation

- Expand from 5 fake agent steps to 11 real-looking steps matching actual pipeline stages
- Stage labels: Dokument einlesen → Fragen generieren (5× parallel) → Fragen konsolidieren → ...
- During demo: animation plays at realistic speed (not instant), then shows mock questions
- Mock questions set per use case type (3–5 questions, tax/jobcenter/etc.)

#### 2c — Wizard step 3: Questions

- Display consolidated questions from mock data
- Each question: title + short explanation of why it's asked
- Answer inputs: text areas, some with example placeholder text
- "Keine weiteren Infos" skip option

#### 2d — Wizard step 4: Generation animation

- 9-step progress display with provider logos (Claude, Gemini, Perplexity, GPT-4o, Grok)
- Parallel steps (steps 2/6/8/10) show all 5 provider icons spinning simultaneously
- Each step completes with a ✓ and a one-line summary of what was done
- Realistic timing: ~15 seconds total for demo (real will be 2–3 min)

#### 2e — Wizard step 5: Result

- Full mock Einspruch letter displayed in a styled preview card
- Letter preview: realistic German legal letter format, use-case-specific content
- Download buttons: TXT (enabled in demo), DOCX + PDF (locked — "Bezahlversion")
- "Profi-Prüfung anfordern" CTA: amber card, shows €99/€69 pricing, links to `/preise`
- Share/copy-link placeholder
- "Neuen Einspruch starten" reset button

**Files:** `(app)/einspruch/` wizard steps
**DB changes:** none | **New env vars:** none

---

### Phase 3 — Auth Backend: Forgot Password + Email Verification (infrastructure: Brevo)

**Objective:** Auth is complete end-to-end. Requires Brevo DNS + API key setup (see Appendix B).

**Prerequisite:** Brevo domain verification complete (SPF, DKIM, DMARC records in Cloudflare — see Appendix B).

**New env vars:** `BREVO_API_KEY`, `EMAIL_FROM=no-reply@taxalex.de`, `EMAIL_FROM_NAME=TaxaLex`

#### 3a — Email infrastructure

`src/lib/email.ts` — Brevo API wrapper (see Appendix B for code pattern).
React Email templates: `verify-email`, `password-reset`, `welcome`.
All templates bilingual (locale from user record).

#### 3b — Email verification

- `VerificationToken` model in Prisma
- On register: create token, send `verify-email` email
- `GET /api/auth/verify-email?token=` → sets `emailVerified`, redirects to dashboard
- Unverified banner on dashboard (non-blocking — can still use demo)

#### 3c — Password reset

- `PasswordResetToken` model in Prisma
- `POST /api/auth/forgot-password` + `POST /api/auth/reset-password`
- Wires up the `/forgot-password` and `/reset-password` pages built in Phase 1

#### 3d — Contact form backend

- `POST /api/contact` — Zod validation, save to `ContactMessage` table, send confirmation email
- Wires up the `/kontakt` page form

#### 3e — Google OAuth (optional)

Feature-flagged: `features.googleAuth`. New env vars: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

---

### Phase 4 — Real AI Pipeline (costs ~€0.97/run)

**Objective:** The thing the company sells actually works. Appeal generation is real.

**Prerequisite:** All 5 API keys obtained and added to secrets.
**New env vars:** `OPENAI_API_KEY` (required), `XAI_API_KEY` (Grok), `GOOGLE_VISION_API_KEY` (optional, image OCR), `UPLOAD_DIR`, `UPLOAD_MAX_MB=10`

#### 4a — File upload route

`POST /api/upload` — MIME validation, size limit, save to `UPLOAD_DIR`, return `fileId`.

#### 4b — OCR / text extraction

`src/lib/ocr.ts` — PDF: `pdf-parse` (free, no external service). Images: Google Vision if key set.

#### 4c — New providers: Grok + OpenAI

Add to `agents.ts`. Feature flag: `FEATURE_FULL_PIPELINE=true`.

#### 4d — `orchestrateFull()` pipeline

11-step pipeline replacing current `orchestrate()`. See Part 1 for full spec.
SSE streaming: `GET /api/generate/stream?jobId=` — replaces fake timers in wizard.

#### 4e — Generate + download routes

`POST /api/generate` (async, returns jobId) + `GET /api/cases/[id]/download?format=txt|docx|pdf`.

**Phase 4 deliverable:** Real Bescheid → real AI questions → user answers → real Einspruch → download.

---

### Phase 5 — Payments: Stripe

**Prerequisite:** Phase 4 complete (generation works). Stripe account with German tax settings.
**New env vars:** `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`

Plans: Einzelfall €5,99 (1 credit), 5er-Paket €19,99 (5 credits), Monats-Flat €9,99/mo (unlimited).
Review add-on: €99 (standard) / €69 (monthly subscriber) — separate PaymentIntent per case.

Routes: `POST /api/billing/create-checkout`, `POST /api/billing/webhook`, `GET /api/billing/portal`.
Webhook handler updates `CreditBalance` or `Subscription` on payment confirmation.

---

### Phase 6 — GDPR + DB Schema Cleanup

- All DB models for review workflow, audit log, credit balance (run migrations cleanly before Phase 7)
- Data deletion endpoint, data export, cookie consent blocking analytics
- AGB + Datenschutz: add Stripe + Brevo as data processors (Art. 28 DSGVO)

---

### Phase 7 — Professional Review Workflow

Requires: Phase 4 (generation), Phase 5 (payment for €99/€69), Phase 3 (email for notifications).

- `POST /api/review/request` — user requests review, pays, creates `ReviewAssignment` + HMAC token
- `/review/[token]` — public token-gated reviewer interface
- Reviewer actions: Freigeben / Kommentar / Rückfrage
- Email notifications: `advisor-review-invite` + `advisor-review-done`
- Reviewer registration: extra fields on `/register?role=advisor`, admin verification flow

---

### Phase 8 — SEO + Monitoring

- Blog: `BlogPost` DB model, `/blog`, `/blog/[slug]` pages
- 6 pillar posts targeting German tax/legal search terms
- Sentry error tracking, PostHog funnel events, uptime monitoring

---

## Appendix A: Environment Variables (complete list)

```bash
# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://taxalex.de
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI providers
ANTHROPIC_API_KEY=        # required
GOOGLE_AI_API_KEY=        # required (Gemini)
PERPLEXITY_API_KEY=       # required
OPENAI_API_KEY=           # required (Phase 1)
XAI_API_KEY=              # required (Phase 1, Grok)
GOOGLE_VISION_API_KEY=    # optional (image OCR)

# Email
BREVO_API_KEY=            # required Phase 2
EMAIL_FROM=no-reply@taxalex.de
EMAIL_FROM_NAME=TaxaLex

# Payments
STRIPE_SECRET_KEY=        # Phase 4
STRIPE_PUBLISHABLE_KEY=   # Phase 4
STRIPE_WEBHOOK_SECRET=    # Phase 4

# Storage
UPLOAD_DIR=/opt/taxalex/uploads
UPLOAD_MAX_MB=10

# Infrastructure
DATABASE_URL=
REDIS_URL=                # optional (SSE job state; in-memory fallback)
NEXTAUTH_URL=

# Feature flags
FEATURE_FULL_PIPELINE=true
```

---

## Appendix B: Brevo Setup (Email)

### Why Brevo

Brevo (formerly Sendinblue) is the right choice for TaxaLex:
- German company, EU data processing, DSGVO-native
- Transactional email (SMTP + API) + contact list management in one
- Free tier: 300 emails/day — enough for development and early launch
- Starter from €25/month for 20,000 emails — covers months of real usage
- No per-contact pricing for transactional (unlike Mailchimp)
- Simple REST API with an official Node.js SDK

### What You Need to Do in Brevo

#### Step 1 — Account and domain setup

1. Sign up at brevo.com with your business email
2. In **Senders & IP → Domains**, add `taxalex.de`
3. Brevo will show you three DNS records to add in Cloudflare:
   - **SPF** TXT record on `taxalex.de` — authorises Brevo to send on your behalf
   - **DKIM** TXT record (usually `brevo._domainkey.taxalex.de`) — cryptographic sender verification
   - **DMARC** TXT record on `_dmarc.taxalex.de` — policy for failed SPF/DKIM (start with `p=none` to monitor, move to `p=quarantine` after 2 weeks)
4. Click "Verify" in Brevo — all three records must show green before sending
5. Add sender: `no-reply@taxalex.de` (display name: TaxaLex)
6. Optionally add `support@taxalex.de` as a second sender for contact form replies

The three DNS records to add in Cloudflare (DNS tab → Add record):

```
Type  Name                         Value (Brevo shows exact values)
TXT   taxalex.de                   "v=spf1 include:sendinblue.com ~all"
TXT   brevo._domainkey.taxalex.de  (Brevo provides full DKIM value)
TXT   _dmarc.taxalex.de            "v=DMARC1; p=none; rua=mailto:dmarc@taxalex.de"
```

> Note: Cloudflare proxies (orange cloud) should be OFF for TXT records — set to DNS-only (grey cloud).

#### Step 2 — Get your API key

1. In Brevo: **SMTP & API → API Keys → Generate a new API key**
2. Name it `taxalex-production` (create a second one named `taxalex-dev` for local testing)
3. Copy the key — it is shown only once
4. Add to Docker Swarm secrets:
   ```bash
   echo "your-key-here" | docker secret create brevo_api_key_prod -
   echo "your-dev-key-here" | docker secret create brevo_api_key_dev -
   ```
5. Reference in `docker-stack.yml` the same way as existing API key secrets
6. Add `BREVO_API_KEY` to your `.secrets` file for local dev

#### Step 3 — Verify sending before going live

1. In Brevo **SMTP & API → SMTP**, note the SMTP credentials (needed as fallback)
2. Use the "Send a test email" button in the Brevo dashboard — verify it lands in inbox (not spam)
3. Check **Reports** tab — confirm delivery rate 100% and no SPF/DKIM failures
4. Test with an external address (Gmail, not the same domain) to verify

#### Step 4 — Configure unsubscribe handling

1. In **Contacts → Lists**, create a list named `TaxaLex Users`
2. Enable "Manage unsubscribes automatically" — Brevo handles the unsubscribe link in every email
3. Transactional emails (password reset, receipt) are exempt from unsubscribe — mark them as transactional in the API call
4. Marketing emails (if any) must include unsubscribe link — never send marketing to unverified contacts

#### Step 5 — What NOT to use in Brevo

- Do NOT use Brevo's drag-and-drop template editor for TaxaLex — templates are built in code using React Email (see Phase 2) and sent via API
- Do NOT store user personal data in Brevo contact lists beyond email + locale — keep PII minimal
- Do NOT use Brevo automation flows for transactional emails — all triggers come from your code

### How TaxaLex Uses Brevo (in code)

```ts
// src/lib/email.ts
import * as Brevo from '@getbrevo/brevo'

const client = new Brevo.TransactionalEmailsApi()
client.authentications['api-key'].apiKey = config.brevoApiKey

export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string,   // rendered from React Email template
): Promise<void> {
  if (!config.brevoApiKey) {
    logger.warn('BREVO_API_KEY not set — email suppressed', { to, subject })
    return
  }
  await client.sendTransacEmail({
    sender: { email: config.emailFrom, name: config.emailFromName },
    to: [{ email: to }],
    subject,
    htmlContent,
  })
}
```

All templates are React components rendered server-side to HTML string using `@react-email/render`,
then passed to `sendEmail()`. No Brevo template IDs — the template lives in code, is version-controlled,
and can be tested without Brevo.

### Emails to implement (Phase 2 priority order)

1. **verify-email** — blocks generation until done; highest friction point
2. **password-reset** — required for auth to be complete
3. **welcome** — sent on registration; one CTA to start first case
4. **case-ready** — sent when async generation completes (Phase 1b, if job queue added)
5. **receipt** — sent on payment (Phase 4)
6. **deadline-reminder** — sent 7 days and 2 days before Einspruch deadline (cron Phase 4)
7. **advisor-review-invite** — sent to reviewer when user requests review (Phase 6)
8. **advisor-review-done** — sent to user when reviewer responds (Phase 6)

---

## Part 3: Advisor Communication Flow — Detailed Build Specification

> Status: **In progress** — 2026-04-02  
> This section supersedes the Phase 7 stub above and contains the full implementation spec.

---

### Design Principles

- Advisor touches zero email, zero attachments, zero "please resend the document"
- Everything the advisor needs is in one compiled packet at one URL
- Standard case: 10 minutes advisor time max
- All communication is async, section-anchored, and threaded in-platform
- Feature-flagged: `FEATURE_ADVISOR=true` gates all routes and UI

---

### New Database Models

**Add to `prisma/schema.prisma`:**

```prisma
enum ViabilityScore { HIGH MEDIUM LOW }

enum AdvisorAssignmentStatus {
  PENDING             // awaiting advisor accept/decline
  ACCEPTED            // advisor is reviewing
  DECLINED            // advisor declined, reason logged
  CHANGES_REQUESTED   // advisor sent annotations, waiting for client
  APPROVED            // advisor approved the draft
  FINALIZED           // final document generated
}

enum AuthorizationScope {
  REVIEW_ONLY          // advisor reviews, client sends
  FULL_REPRESENTATION  // advisor handles filing
}

enum AnnotationStatus { OPEN ANSWERED RESOLVED }

enum PacketSection { BRIEF FACTS ANALYSIS DRAFT CLIENT_CONTEXT }

// Extend Case model — add these fields:
// viabilityScore      ViabilityScore?
// viabilitySummary    String?
// assignment          AdvisorAssignment?
// handoffPacket       HandoffPacket?
// annotations         CaseAnnotation[]

model AdvisorAssignment {
  id            String                  @id @default(cuid())
  caseId        String                  @unique
  case          Case                    @relation(fields: [caseId], references: [id], onDelete: Cascade)
  advisorId     String
  advisor       User                    @relation("AdvisorAssignments", fields: [advisorId], references: [id])
  status        AdvisorAssignmentStatus @default(PENDING)
  scope         AuthorizationScope      @default(REVIEW_ONLY)
  declineReason String?
  acceptedAt    DateTime?
  finalizedAt   DateTime?
  createdAt     DateTime                @default(now())
  updatedAt     DateTime                @updatedAt
}

model HandoffPacket {
  id             String   @id @default(cuid())
  caseId         String   @unique
  case           Case     @relation(fields: [caseId], references: [id], onDelete: Cascade)
  version        Int      @default(1)
  briefSummary   String   // "Einkommensteuer 2022 · €3,240 · deadline in 14 days"
  extractedFacts Json     // { finanzamt, steuernummer, amounts, periods, paragraphs, deadline }
  analysisSummary Json    // { coreArgument, evidenceGaps[], counterarguments[], viabilityScore, viabilitySummary }
  draftContent   String   @db.Text
  clientContext  Json     // { userAnswers, clientNotes, scope }
  documents      Json     // [{ id, name, type, storagePath }]
  createdAt      DateTime @default(now())
}

model CaseAnnotation {
  id             String           @id @default(cuid())
  caseId         String
  case           Case             @relation(fields: [caseId], references: [id], onDelete: Cascade)
  authorId       String
  author         User             @relation("AnnotationAuthor", fields: [authorId], references: [id])
  section        PacketSection
  paragraphIndex Int?             // null = entire section
  content        String           @db.Text
  status         AnnotationStatus @default(OPEN)
  replyContent   String?          @db.Text
  repliedAt      DateTime?
  aiPreFilled    Boolean          @default(false)
  aiPreFillText  String?          @db.Text
  resolvedAt     DateTime?
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
}
```

**Add to User model:**
```prisma
advisorAssignments  AdvisorAssignment[]  @relation("AdvisorAssignments")
authoredAnnotations CaseAnnotation[]     @relation("AnnotationAuthor")
```

---

### New Types (`src/types/index.ts`)

```typescript
type ViabilityScore = 'HIGH' | 'MEDIUM' | 'LOW'
type AdvisorAssignmentStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CHANGES_REQUESTED' | 'APPROVED' | 'FINALIZED'
type AuthorizationScope = 'REVIEW_ONLY' | 'FULL_REPRESENTATION'
type AnnotationStatus = 'OPEN' | 'ANSWERED' | 'RESOLVED'
type PacketSection = 'BRIEF' | 'FACTS' | 'ANALYSIS' | 'DRAFT' | 'CLIENT_CONTEXT'

interface HandoffPacketData {
  id: string; caseId: string; version: number
  briefSummary: string
  extractedFacts: ExtractedFacts
  analysisSummary: AnalysisSummary
  draftContent: string
  clientContext: ClientContext
  documents: PacketDocument[]
  createdAt: Date
}

interface ExtractedFacts {
  finanzamt: string; steuernummer: string; steuerart: string
  bescheidDatum: string; amountDisputed: number; amountTotal: number
  periods: string[]; paragraphsCited: string[]; deadline: string | null
}

interface AnalysisSummary {
  coreArgument: string; evidenceGaps: string[]
  counterarguments: string[]; viabilityScore: ViabilityScore; viabilitySummary: string
}

interface ClientContext {
  userAnswers: Record<string, string>; clientNotes?: string; scope: AuthorizationScope
}

interface PacketDocument { id: string; name: string; type: string; storagePath: string }

interface AnnotationData {
  id: string; section: PacketSection; paragraphIndex?: number
  content: string; status: AnnotationStatus
  author: { id: string; name: string | null }
  replyContent?: string; repliedAt?: Date
  aiPreFilled: boolean; aiPreFillText?: string; createdAt: Date
}
```

---

### New Constants (`src/config/constants.ts`)

```typescript
export const ADVISOR = {
  autoDeclineAfterHours: 48,
  maxAnnotationsPerCase: 20,
  maxAnnotationLength: 2000,
  notificationReminderHours: [24, 6],
} as const
```

---

### New Lib Files

| File | Purpose |
|---|---|
| `src/lib/viability.ts` | Score HIGH/MEDIUM/LOW from adversary + factchecker outputs |
| `src/lib/handoff.ts` | Compile HandoffPacket from case data + agent outputs |
| `src/lib/emails/advisorEmails.ts` | 5 transactional emails for advisor flow |

---

### API Routes

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/case/[id]/handoff` | POST | case owner | Compile packet, create assignment |
| `/api/advisors` | GET | authenticated | List available advisors |
| `/api/advisor/cases` | GET | ADVISOR/LAWYER | List assigned cases |
| `/api/advisor/cases/[id]` | GET | assigned advisor | Full packet + annotations |
| `/api/advisor/cases/[id]/status` | PATCH | assigned advisor | Accept / decline |
| `/api/case/[id]/annotations` | POST | advisor or owner | Add annotation |
| `/api/case/[id]/annotations/[annotationId]` | PATCH | role-appropriate | Reply / resolve |
| `/api/advisor/cases/[id]/finalize` | POST | assigned advisor | Approve → APPROVED |

---

### UI Pages

| Page | Who sees it | Purpose |
|---|---|---|
| `/[locale]/(app)/advisor/dashboard` | ADVISOR / LAWYER | Case queue: PENDING / ACCEPTED / FINALIZED columns |
| `/[locale]/(app)/advisor/cases/[id]` | assigned advisor | Two-panel: packet left, annotation thread right |
| `/[locale]/(app)/cases/[id]` (extended) | case owner | Handoff request section + annotation replies |

---

### UI Components

| Component | Location |
|---|---|
| `ViabilityBadge` | `src/components/advisor/ViabilityBadge.tsx` |
| `CaseCard` | `src/components/advisor/CaseCard.tsx` |
| `HandoffPacketViewer` | `src/components/advisor/HandoffPacketViewer.tsx` |
| `AnnotationPanel` | `src/components/advisor/AnnotationPanel.tsx` |
| `AnnotationThread` | `src/components/advisor/AnnotationThread.tsx` |
| `DeclineModal` | `src/components/advisor/DeclineModal.tsx` |
| `HandoffRequestForm` | `src/components/client/HandoffRequestForm.tsx` |
| `AnnotationReplyCard` | `src/components/client/AnnotationReplyCard.tsx` |

---

### Build Checklist

- [x] IMPLEMENTATION_PLAN.md updated
- [x] Schema migration: 3 new models + 5 new enums + Case + User extensions
- [x] Types: all advisor flow types added to `src/types/index.ts`
- [x] Constants: ADVISOR block added to `src/config/constants.ts`
- [x] `src/lib/viability.ts` — viability scorer
- [x] `src/lib/handoff.ts` — packet compiler
- [x] `src/lib/emails/advisorEmails.ts` — 5 notification emails
- [x] `POST /api/case/[id]/handoff` — with Zod schema
- [x] `GET /api/advisors`
- [x] `GET /api/advisor/cases`
- [x] `GET /api/advisor/cases/[id]`
- [x] `PATCH /api/advisor/cases/[id]/status`
- [x] `POST /api/case/[id]/annotations`
- [x] `PATCH /api/case/[id]/annotations/[annotationId]`
- [x] `POST /api/advisor/cases/[id]/finalize`
- [x] Components: ViabilityBadge, CaseCard, HandoffPacketViewer, AnnotationPanel, AnnotationThread, DeclineModal
- [x] Components: HandoffRequestForm, AnnotationReplyCard
- [x] Page: `/advisor/dashboard`
- [x] Page: `/advisor/cases/[id]`
- [x] Client case detail extensions
- [x] Translations: advisor.* keys in all 11 locales
- [x] `npx tsc --noEmit` passes — 0 errors
- [x] `npm run build` passes — 356 static pages, 0 errors
- [ ] Migration runs on dev DB (runs on deploy via deploy.sh)
- [ ] Deployed and smoke-tested
