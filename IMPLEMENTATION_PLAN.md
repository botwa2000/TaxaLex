# TaxaLex — Final Implementation Plan

> Last updated: 2026-03-31

---

## Part 1: Strategic Analysis

### The Problem Being Solved

Every year, 3.3 million Einsprüche are filed against German government notices
(BMF Finanzbericht 2023). 67% are fully or partially granted (BMF Steuerstatistik).
Most people never file because:

1. The 30-day legal deadline feels impossibly short
2. German bureaucratic language is opaque even to native speakers
3. A lawyer or tax advisor charges €200–500 for a single Einspruch
4. The process is intimidating — people assume authority is always right

**TaxaLex's job:** Remove every one of those barriers in under 10 minutes.

---

### User Jobs-to-be-Done (Real, Not Assumed)

| User type | Core job | Underlying fear | Frequency |
|---|---|---|---|
| Private individual | "I need to formally object before the deadline passes" | "I'll miss my chance and lose money" | 1–3 times/year |
| Self-employed | "I need to challenge this tax demand — it's eating my cash flow" | "I can't afford this, but I also can't afford a lawyer" | 4–10 times/year |
| Expat | "I received an official notice in German and have no idea what it means or what to do" | "I'll be penalised for not responding" | 2–5 times/year |
| Tax advisor | "I need to draft this Einspruch for my client today — I have 12 others waiting" | "I'm billing for drafting time that AI could do in seconds" | 50–200 per year |
| Lawyer | "My client's Einspruch was rejected — I need the original letter and all supporting analysis to file a Klage" | "A bad initial Einspruch weakens my Klage" | 20–80 per year |

**Key insight:** Individuals have a time-limited, episodic problem — they are not in the market
for a subscription. They have a letter to send. They will pay once to solve that problem well.
Tax advisors and lawyers have a recurring volume problem — they will subscribe if the ROI is clear.

---

### Realistic Usage Frequency — Pricing Implications

#### API cost reality

Every full 5-agent generation run costs real money in API calls:
- Claude Sonnet (drafter × 1, adversary × 1, consolidator × 1): ~€0.08–0.12
- Gemini 1.5 Pro (reviewer × 1): ~€0.01–0.02
- Perplexity Sonar Pro (factchecker × 1, with live web search): ~€0.05–0.08
- **Total per generation: ~€0.15–0.22 in API costs**

This means a "first appeal free" model gives away real value at a direct cost.
There is no free generation tier. The demo flow (with mock data) is free and
shows the full experience — that is the marketing funnel.

#### Pricing model (from user perspective)

A private user who receives one Steuerbescheid per year should NOT be locked into a
€9.99/month subscription for a problem they have once a year. The model matches how
users actually experience their problem: episodic for individuals, volume-driven for
self-employed.

| Tier | Price | Who it's for | Rationale |
|---|---|---|---|
| **Demo** | Free | Anyone curious | Full 5-step demo with mock data — shows the experience, no real document |
| **Einzelfall** (one-off) | **€9.99** per case | Individuals with a single notice | Pay to solve today's problem; all download formats; deadline tracked |
| **Monatspass** | **€19.99/month** | Users with recurring notices | Cancel anytime; unlimited cases; all formats; 12 months of case history |
| **Jahrespass** | **€149/year** (~€12.42/month) | Committed recurring users | 38% savings vs monthly; all features |
| **Selbstständig** | **€34.99/month** (€349/year) | Freelancers and sole traders | Unlimited cases; invoice-ready receipt as Betriebsausgabe; priority queue |

**No advisor or lawyer subscription product.**
Advisors and lawyers participate as reviewers in the user's workflow (see below).
They do not pay for a separate product tier.

#### Why no free generation

- At €0.20 per run, a "first appeal free" offer has a direct cost and undervalues the product
- The demo (mock data, no AI cost) gives a complete and compelling preview
- Users who are serious about their appeal will pay €9.99 — that's 5% of what a
  Steuerberater would charge for the same letter
- Giving it away attracts high-volume testers and low-intent users who inflate support costs

---

### Can We Track User Progress?

**What we can track automatically:**
- Case created, document uploaded, questions answered, letter generated
- Download events (format + timestamp)
- Deadline calculated and logged
- User marks case as submitted (voluntary action button)
- Days between generation and submission

**What we cannot track without user cooperation:**
- Whether the letter was actually mailed
- The authority's response (Einspruchsentscheidung)
- Final outcome

**Solution:** After submission, show a friendly follow-up card:
"Es sind 6 Wochen vergangen. Hat das Finanzamt bereits geantwortet?"
Options: Stattgegeben / Teilweise stattgegeben / Abgelehnt / Noch kein Bescheid / Einspruch zurückgenommen

This gives us **real, verified aggregate outcome data** that will eventually replace fake statistics.
It also closes the loop for the user and gives them a path forward (e.g., "Your Einspruch was rejected —
here's what happens next").

---

### Regulatory Feasibility — Can Phase I Launch Without Advisors?

**Yes. Unambiguously.**

The RDG (Rechtsdienstleistungsgesetz §2) applies to *Rechtsdienstleistungen* — giving legal advice
in a specific individual matter. TaxaLex does not give legal advice. It generates a **draft document**
that the user reviews, modifies, and submits themselves.

This is the same legal position as:
- WISO Steuer (generates tax returns, doesn't give advice)
- TurboTax (same)
- German court form generators (Amtsgericht self-help portals)
- Smart Rechtsassistent tools in the Steuerkammer's own online tools

**The required disclaimers are already in place:**
- "Diese Vorlage dient zur Information und ist kein Rechtsrat i.S.d. RDG"
- "Bitte vor Einreichung prüfen"

**The user submits the letter themselves.** TaxaLex never acts as their agent.

**Conclusion:** Phase I (individual users, self-service, no advisor involvement) is legally
clean and can launch without any advisor or lawyer participation.

---

### AI Pipeline: Architecture and Design

#### Current state

`src/lib/agents.ts` has a working 5-agent sequential pipeline: drafter → reviewer (Gemini)
→ factchecker (Perplexity) → adversary → consolidator (Claude). The code is production-quality.
But the Einspruch page is entirely mocked — `orchestrate()` is never called. File upload
stores nothing, no OCR runs, and cases are not persisted to DB.

#### The full pipeline design (11 steps)

This is a complete redesign from the current 5-agent sequential approach.
The new pipeline runs 5 AI providers across multiple rounds, each round improving the draft.

**The core idea:** No single AI system produces a reliable draft on the first pass.
AI systems hallucinate legal citations, miss domain-specific questions, and fail to
anticipate how an authority will read the letter. Each weakness is addressed by a
dedicated stage in this pipeline.

**The pipeline is identical for all use cases.** For a tax appeal, agents act as
tax experts; for a Jobcenter case, as social security experts; for a Mieterhöhung,
as tenancy law experts. In the authority review stage, agents act as the specific
receiving authority (Finanzamt, Jobcenter, Mietgericht) looking for grounds to reject.
The system prompts are parameterized by use case — not hardcoded to tax law.

---

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  STAGE A — DISCOVERY                                                         │
│                                                                               │
│  1. User uploads document + describes situation                               │
│                                                                               │
│  2. [PARALLEL] All 5 providers analyze document as domain experts             │
│     Each generates: list of expert questions for more info or documents       │
│     → Claude, Gemini, Perplexity, Grok, OpenAI  (simultaneous)               │
│                                                                               │
│  3. [SEQUENTIAL] Claude consolidates questions                                │
│     → Deduplicates, prioritises by importance, formats for user               │
│                                                                               │
│  4. User answers questions / uploads additional documents                     │
│     (or confirms "no additional information available")                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  STAGE B — INITIAL DRAFT                                                      │
│                                                                               │
│  5. [SEQUENTIAL] Claude prepares the first complete draft                     │
│     Includes: factual summary, account/balance references, court decisions,   │
│     applicable regulations, formal structure, request for Aussetzung (§361 AO)│
└─────────────────────────────────────────────────────────────────────────────┘
                                      ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  STAGE C — FIRST REVIEW ROUND                                                 │
│                                                                               │
│  6. [PARALLEL] All 5 providers critically review the draft                    │
│     → Find: controversies, missing arguments, hallucinated citations,         │
│       terminology errors, factual inconsistencies                             │
│     → Perplexity specifically: live-verify all cited cases and §§             │
│                                                                               │
│  7. [SEQUENTIAL] Claude consolidates feedback → Draft v2                      │
│     → Incorporates all corrections, removes weaknesses                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  STAGE D — SECOND REVIEW ROUND                                                │
│                                                                               │
│  8. [PARALLEL] All 5 providers review Draft v2 again                          │
│     → Deeper check: coherence of arguments, strength of legal basis,          │
│       gaps that could be exploited by the authority                           │
│                                                                               │
│  9. [SEQUENTIAL] Claude produces Draft v3                                     │
│     → Tightest, most complete version so far                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  STAGE E — AUTHORITY PERSPECTIVE REVIEW                                       │
│                                                                               │
│ 10. [PARALLEL] All 5 providers read Draft v3 as the receiving authority       │
│     → Find: loopholes, ambiguities, arguments the authority can dismiss,      │
│       missing evidence that would be required for a positive decision          │
│                                                                               │
│ 11. [SEQUENTIAL] Claude consolidates authority perspective → FINAL DRAFT      │
│     → Pre-empts rejection grounds, strengthens evidence requirements          │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Providers and specialization

| Provider | Primary role in pipeline | Unique strength |
|---|---|---|
| Claude (Anthropic) | Drafter, all consolidation steps, final draft | Long-context reasoning, structured legal writing |
| Gemini (Google) | Review rounds — language and logic | Coherence and argumentation quality |
| Perplexity | Review rounds — fact verification | Live web search: verify BFH cases, §§ text, official guidance |
| OpenAI GPT-4o | Review rounds — alternative perspective | Different training data = different blind spots |
| Grok (xAI) | Review rounds — adversarial | Questioning assumptions, finding unexpected weak points |

Perplexity is uniquely valuable for verifying that cited BFH judgments exist with
correct Aktenzeichen and have not been overturned. This is the hallucination-catching step.

#### Parallel execution

Steps 2, 6, 8, 10 (the "all providers" steps) run fully in parallel. All 5 API calls
fire simultaneously; Claude waits for all results before consolidating.
This keeps wall-clock time to approximately:
- Steps 2+3 (parallel + consolidate): ~25–35s
- Steps 5 (draft): ~20–30s
- Steps 6+7: ~25–35s
- Steps 8+9: ~25–35s
- Steps 10+11: ~25–35s
- **Total generation time: ~2–3 minutes** (not 10+ minutes sequential)

#### Context compression between rounds

By stage D, the accumulated context (original doc + Q&A + draft + 5 reviews × 2 rounds)
can reach 25,000+ tokens. A context compression step runs before each Claude consolidation:
summarise the previous round's review consensus rather than including all raw outputs.
This caps input size growth and controls cost.

#### Use case parameterization

The `AGENTS` map in `agents.ts` will be extended from static config to a function:

```ts
buildAgentConfig(useCase: string, stage: PipelineStage): AgentConfig
```

System prompts are parameterized:
- `{{expertRole}}` → "Einkommensteuer-Experte", "SGG-Fachanwalt", "Mietrechts-Experte"
- `{{authorityRole}}` → "Finanzamt-Sachbearbeiter", "Jobcenter-Mitarbeiter", "Vermieter-Anwalt"
- `{{legalBasis}}` → pulled from `UseCase.legalBasis` in DB

This ensures the same pipeline code handles all 8+ use case types without per-case branches.

#### API cost estimate (per generation)

| Stage | Step | Providers | API calls | Est. cost |
|---|---|---|---|---|
| A — Discovery | Step 2 (parallel questions) | All 5 | 5 | €0.08 |
| A — Discovery | Step 3 (consolidate questions) | Claude | 1 | €0.02 |
| B — Draft | Step 5 (initial draft) | Claude | 1 | €0.05 |
| C — Review 1 | Step 6 (parallel review) | All 5 | 5 | €0.18 |
| C — Review 1 | Step 7 (consolidate + draft v2) | Claude | 1 | €0.06 |
| D — Review 2 | Step 8 (parallel review) | All 5 | 5 | €0.21 |
| D — Review 2 | Step 9 (draft v3) | Claude | 1 | €0.07 |
| E — Authority | Step 10 (parallel authority) | All 5 | 5 | €0.21 |
| E — Authority | Step 11 (final draft) | Claude | 1 | €0.09 |
| **Total** | | | **25 calls** | **~€0.97** |

*Estimates based on current API pricing (Claude Sonnet 4.6 $3/$15 per MTok; Gemini $3.50/$10.50;
Perplexity Sonar Pro $3/$15 + $5/1000 req; OpenAI GPT-4o $2.50/$10; xAI Grok-2 $2/$10).
Context grows across rounds; estimates assume context compression between stages.
Actual cost: **€0.80–1.20 per generation** depending on document complexity.*

#### Pricing implications

| Plan | Price | Max economic cases/month | Notes |
|---|---|---|---|
| Einzelfall | €9.99 | 1 (by design) | €8.99+ margin per case |
| Monatspass | €19.99 | ~8–10 before cost pressure | Include 8 cases; €1.99/additional |
| Jahrespass | €149/year | ~12/year easily | €11.50/month effective = ~10 cases |
| Selbstständig | €34.99/month | ~20 | Include 20 cases; €1.49/additional |

The monthly unlimited model becomes economically risky only at >20 cases/month,
which is beyond typical individual-user behaviour. A fair-use soft limit prevents abuse.

#### New env vars for additional providers

```
OPENAI_API_KEY         # already optional in env.ts — make required
XAI_API_KEY            # Grok — xAI API, OpenAI-compatible base URL
```

xAI Grok uses `https://api.x.ai/v1` as base URL with OpenAI client — no new SDK needed.

#### Infrastructure audit

| Component | Status | Action |
|---|---|---|
| Next.js 15 App Router | ✅ solid | keep |
| PostgreSQL + Prisma schema | ✅ solid | expand (Phase 3) |
| next-auth v5 | ✅ solid | extend (Phase 2) |
| next-intl 11 locales | ✅ solid | keep |
| `agents.ts` pipeline | ✅ works, 5-agent | **redesign to 11-step (Phase 1)** |
| Einspruch page UI | ✅ great UX | **wire to real backend (Phase 1)** |
| File upload → OCR | ❌ mocked | **build (Phase 1)** |
| Case persistence | ❌ stateless | **build (Phase 1)** |
| Streaming progress | ❌ fake timers | **build (Phase 1)** |
| Billing | ❌ all stubs | build (Phase 4) |
| Email | ❌ nothing | build (Phase 2) |
| GDPR compliance | ⚠️ partial | complete (Phase 5) |
| Public pages | ✅ complete | fix dead links (Phase 0) |
| Component library | ✅ complete | keep |

**Nothing needs to be torn out.** `agents.ts` gets extended, not replaced.
The 5-agent pattern becomes 11 steps with the same underlying `callAgent()` primitive.

---

### Advisors and Lawyers: Role and Workflow

#### What TaxaLex Is NOT for Advisors and Lawyers

TaxaLex does not sell a separate service or product to tax advisors or lawyers.
It does not offer them an appeal creation service, a multi-client management portal,
or a billing tool. These are businesses in themselves and not the focus here.

#### What TaxaLex IS for Advisors and Lawyers

A user generates their letter in TaxaLex and optionally requests a professional review
before submitting. The advisor or lawyer receives a review link, reads the letter,
and responds — approve, comment, or ask a question. That is the entire interaction.

**Their role in the user's workflow:**
1. User generates their Einspruch draft in TaxaLex
2. User clicks "Profi-Prüfung anfordern" on the result screen (optional)
3. User enters their advisor's or lawyer's email address
4. System sends a clean review invitation email with a secure single-use link
5. Professional opens the review link — sees the letter, the 5-agent summary, key deadline
6. Professional chooses one of three actions:
   - **Freigeben** — approve as-is → user is notified, case status → APPROVED
   - **Kommentar hinzufügen** — text note sent to user → user can revise answers and regenerate
   - **Frage stellen** — opens a simple back-and-forth thread visible to both parties
7. Professional's name and timestamp are shown on the approved letter output

**What the professional gets:**
- A fast, clean interface optimised for reading and reviewing — not writing
- No subscription required to review a letter
- The review link is valid for 7 days and requires only their email to verify identity
- If they review frequently, they can register a free professional account to see all pending reviews in one place

#### Why This Is Better Than a Full Advisor Portal

A full advisor portal (separate dashboard, multi-client management, billing tools) is a
separate B2B product with its own sales cycle, onboarding, and support cost. It would
also create the tension where advisors' own clients could bypass them using the self-service
product. The review-only model avoids this entirely:

- Advisors participate because **their own client invites them** — not because TaxaLex markets to them
- They spend 15–20 minutes reviewing rather than 2+ hours drafting — the ROI is clear without any sales pitch
- The platform gains credibility (real professionals are reviewing letters), users gain confidence
- Revenue stays clean: users pay, professionals participate for free (their value is the review, which users are already paying for)

#### Online vs Offline Activities

**Online (in TaxaLex):**
- Receive review invitation email
- Read the letter and the 5-agent analysis summary
- Approve, comment, or ask a clarifying question
- View a simple list of all pending reviews if they have a professional account

**Offline (not in TaxaLex, and not our concern for Phase I/II):**
- ELSTER submission
- Court representation
- Client invoicing
- DATEV integration
- Face-to-face consultations

---

### Phase I Without Advisor/Lawyer Participation: Decision

**Build Phase I and II for self-service individual users only.**
The professional review feature is a Phase II addition (one route, one email template,
one review UI page). It requires no portal, no subscription, no separate product.

**The DB schema is designed to support it from Phase 3** — `CaseAssignment`,
`AdvisorClient`, and the `ADVISOR_REVIEW` case status are already in the schema.
In Phase II, they get wired to a lightweight review UI, not a full portal.

---

## Part 2: Implementation Phases

Each phase leaves the site fully operational. No broken links, no regressions.

---

### Phase 0 — Critical Cleanup (1 week, no new infrastructure)

**Objective:** Remove anything that creates legal exposure or user confusion.

**Tasks:**
- [ ] Fill Impressum: company name, address, HRB, USt-IdNr., responsible editor
- [ ] AGB: remove amber "vor Launch" banner; add "Stand: März 2026" footer; do not publish publicly until a lawyer reviews the payment terms (add `noindex` until paid)
- [ ] Create `/[locale]/kontakt` — minimal page: email link, response time promise, contact form (mailto for now, real API in Phase 2)
- [ ] `fuer-steuerberater/page.tsx`: replace `/kontakt` link with the new page
- [ ] Anchor check: verify all `#` anchor links in navigation resolve correctly on their target pages
- [ ] Remove `noindex` from any public content pages that were incorrectly suppressed
- [ ] Confirm no fake statistics or testimonials visible on any public page

**Files:** `impressum/page.tsx`, `agb/page.tsx`, new `kontakt/page.tsx`, `fuer-steuerberater/page.tsx`
**DB changes:** none
**New env vars:** none

---

### Phase 1 — Core Product: Real AI Pipeline (4 weeks)

**Objective:** Make the thing the company sells actually work end-to-end.
Implement the 11-step pipeline (see architecture above) and wire it to the UI.

This is the most important phase. Everything else is infrastructure for this.

#### 1a — File Upload: Real Storage

**New env vars:** `UPLOAD_DIR` (server filesystem path outside `public/`), max `UPLOAD_MAX_MB=10`

**New route:** `POST /api/upload`
- Validates: file present, MIME type in allowlist (`application/pdf`, `image/jpeg`, `image/png`, `image/tiff`), size ≤ 10MB
- Strips path traversal from filename
- Saves to `UPLOAD_DIR/{userId|session}/{uuid}.{ext}`
- Returns `{ fileId, name, mimeType, sizeBytes }`
- Rate-limited: 5 uploads per minute per IP

**Einspruch page change:** Replace fake "Demo starten" with real file input that POSTs to `/api/upload`

#### 1b — OCR: Text Extraction

**Package:** `pdf-parse` (text-layer PDFs, no external service)
**Feature flag:** `features.ocrProcessing` — enable in env

**New file:** `src/lib/ocr.ts`
- `extractText(filePath, mimeType): Promise<string>`
- PDF: use `pdf-parse`, extract text layer
- Image (JPEG/PNG/TIFF): use Google Cloud Vision API if `GOOGLE_VISION_API_KEY` set; otherwise return helpful error "Bildbasierte PDFs werden demnächst unterstützt"
- Returns extracted text, truncated to `PIPELINE.maxInputChars` (configurable in `constants.ts`)

**New env var:** `GOOGLE_VISION_API_KEY` (optional, for image OCR)

#### 1c — New Providers: Grok + OpenAI

**New env vars:** `XAI_API_KEY`, `OPENAI_API_KEY` (promote from optional to required)

**Update `src/lib/agents.ts`:**

Add xAI Grok client (OpenAI-compatible, different base URL):
```ts
function getGrok(): OpenAI {
  return new OpenAI({ apiKey: config.xaiApiKey, baseURL: 'https://api.x.ai/v1' })
}
```

Add to `callAgent()`: handle `provider === 'xai'` using the Grok client.

**Update `src/config/constants.ts`:** add `MODELS.grok`, `MODELS.openai`

#### 1d — Pipeline Redesign: `orchestrate()` → `orchestrateFull()`

**Rewrite `src/lib/agents.ts`** to implement the 11-step pipeline:

```ts
export async function orchestrateFull(
  bescheidData: BescheidData,
  documents: { name: string; text: string }[],
  userAnswers: Record<string, string>,
  useCase: string,          // determines domain expertise + authority framing
  outputLanguage: string,
  uiLanguage: string,
  onProgress: (step: PipelineStep) => void   // for SSE streaming
): Promise<{ outputs: AgentOutput[]; finalDraft: string; questions?: Question[] }>
```

Key patterns:
- `Promise.all([claude, gemini, perplexity, grok, openai])` for parallel steps
- `buildAgentConfig(useCase, stage)` returns parameterized system prompts
- `compressContext(outputs)` summarises previous round before next consolidation
- `onProgress(step)` emits SSE events as each step completes

The existing `orchestrate()` function remains as a fast fallback (5 agents, 1 round)
used only if `features.fullPipeline` is disabled.

**New feature flag:** `FEATURE_FULL_PIPELINE=true` — enables 11-step pipeline; false falls back to 5-agent for lower cost during development.

#### 1e — Document Analysis Route

**New route:** `POST /api/analyze`

Input: `{ fileId: string; locale: string; useCase?: string }`

Process (Pipeline Stage A, Steps 1–3):
1. Retrieve file from storage, verify ownership
2. Extract text via `ocr.ts`
3. Call lightweight Claude prompt to extract structured `BescheidData` (type, authority, date, deadline, amounts) — the "Erkennung" step
4. **Run Steps 2–3 of the pipeline:** all 5 providers generate expert questions in parallel → Claude consolidates → return prioritised question list

Returns: `{ bescheidData, questions, detectedText: null }` — never return raw document text to client.

**Einspruch page change:** `handleAnalyze()` calls `/api/analyze`. The questions shown in step 3 of the UI come from the real parallel question-generation phase, not hardcoded defaults.

#### 1f — Generation Route

**New route:** `POST /api/generate`

Input:
```ts
{
  fileId: string;
  bescheidData: Record<string, string>;
  answers: Record<string, string>;
  useCase: string;
  outputLanguage: string;
  uiLanguage: string;
}
```

Process (Pipeline Stages B–E, Steps 5–11):
1. Verify file ownership
2. Retrieve extracted text from storage (never trust client for document content)
3. Call `orchestrateFull()` — runs the 8-step generation pipeline (steps 5–11)
4. Each step fires `onProgress` → queued to SSE stream
5. If authenticated: persist `Case` + all 9 `CaseOutput` records (one per agent output), store deadline
6. Return: `{ caseId?, finalDraft, agentOutputs }`

**Important:** Steps 5–11 take 2–3 minutes. This MUST run as an async job with SSE progress.
Do NOT run synchronously — the HTTP connection will time out at 30 seconds.

**Free user limit:** If `features.payments` enabled and user has no credits/subscription,
return `{ error: 'LIMIT_REACHED', upgradeUrl: '/preise' }`. Show upgrade modal.
If `features.payments` disabled: no limits (dev mode).

#### 1g — Streaming Progress (Server-Sent Events)

Generation takes 2–3 minutes. SSE is mandatory — not optional.

**New route:** `GET /api/generate/stream?jobId=`
- SSE endpoint: `data: { step: 5, label: 'Entwurf formulieren', done: true }`
- Events fire as each of the 9 pipeline steps completes
- `EventSource` on the client replaces mock timers in `generating` step

**Implementation:** `/api/generate` starts the job (returns `{ jobId }` immediately, status 202),
then client connects to `/api/generate/stream?jobId=` for events.
Job state stored in `GenerationJob` DB table (already in Phase 3 schema).

**Einspruch page update:** The `AGENTS` array in the UI (currently 5 items) expands to show
all 9 generation steps with labels:
1. Entwurf formulieren (Step 5)
2. Experten-Review 1 (Step 6 — parallel)
3. Entwurf v2 (Step 7)
4. Experten-Review 2 (Step 8 — parallel)
5. Entwurf v3 (Step 9)
6. Behörden-Perspektive (Step 10 — parallel)
7. Finale Überarbeitung (Step 11)

Each parallel step shows all 5 provider logos spinning simultaneously.

**New env var:** `REDIS_URL` (optional; in-memory Map as fallback for single-server deploys)

#### 1c — Case Persistence

When generation completes and user is authenticated:
- Create `Case` record with `bescheidData`, `userAnswers`, `status: DRAFT_READY`, `deadline`
- Create `CaseOutput` records for all 5 agent outputs
- Return `caseId` to client

When user is not authenticated:
- Store `{ finalDraft, bescheidData }` in `sessionStorage` (JSON, max 50KB)
- On result step: show "Jetzt anmelden, um diesen Einspruch zu speichern" CTA
- After registration: retrieve from sessionStorage and persist

#### 1d — Download Endpoint

**New route:** `GET /api/cases/[id]/download?format=txt`

- Auth required
- Format `txt`: available to all (free)
- Formats `docx`, `pdf`: PRO/subscription required (check entitlements)
- Returns file with correct content-type and filename
- Logs download event to `AuditLog`

**DOCX package:** `docx` — generate DIN 5008-formatted letter
**PDF package:** `@react-pdf/renderer` — server-side PDF from same template

**Einspruch result step:** Replace download button to call this route.
Show lock icon + "Upgrade" for locked formats if `features.payments` enabled.

#### Phase 1 Deliverable
Users can: upload a real Bescheid → receive AI-analyzed questions → answer them →
receive a 5-agent generated Einspruch → download as .txt. The full product loop works.

---

### Phase 2 — Auth: Complete Flow (2 weeks)

**Objective:** Email verification, password reset, OAuth expansion, 2FA.
Required before taking payments.

#### 2a — Email Infrastructure

**Package:** `resend`, `@react-email/components`
**New env vars:** `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`

**New file:** `src/lib/email.ts` — typed wrapper: `sendEmail(to, templateKey, payload)`.
Reads `RESEND_API_KEY`; suppresses in dev unless key is set.

**Email templates** (`src/lib/emailTemplates/`):
- `WelcomeEmail.tsx` — sent on first registration
- `VerifyEmailEmail.tsx` — verification link (expires 24h)
- `PasswordResetEmail.tsx` — reset link (expires 1h)
- `DeadlineReminderEmail.tsx` — "N days until your appeal deadline"
- `CaseReadyEmail.tsx` — "Your Einspruch draft is ready"
- `ReceiptEmail.tsx` — German-format payment receipt
- `SubscriptionCancelledEmail.tsx`
- `AdvisorClientInviteEmail.tsx` (Phase 6)

#### 2b — Email Verification

On registration: create `VerificationToken`, send `VerifyEmailEmail`.

**New route:** `GET /api/auth/verify-email?token=` — validates, sets `User.emailVerified`, redirects to dashboard with `?verified=1`.

Unverified users: banner on dashboard; AI generation blocked (returns `{ error: 'UNVERIFIED' }`).
Resend button: rate-limited, 1 per 5 minutes.

#### 2c — Password Reset

**New model:**
```prisma
model PasswordResetToken {
  id        String    @id @default(cuid())
  userId    String
  token     String    @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
}
```

**New routes:**
- `POST /api/auth/forgot-password` — creates token (1h TTL), sends `PasswordResetEmail`, returns 200 regardless (no user enumeration)
- `POST /api/auth/reset-password` — validates token, updates `passwordHash` (bcrypt cost 12), marks token used

**New pages:**
- `/[locale]/(auth)/forgot-password`
- `/[locale]/(auth)/reset-password?token=`

#### 2d — Apple Sign-In

**New env vars:** `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`

Add to `src/auth.ts`. Note: Apple sends email only on first login — store it on account creation.
Required for any future iOS app.

#### 2e — Facebook Login

**New env vars:** `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`

Add to `src/auth.ts`. Feature-flag behind `features.facebookAuth` (separate from googleAuth).
Note: lower trust in German market — enable only if user research confirms demand.

#### 2f — Two-Factor Authentication (TOTP)

**New DB fields on `User`:**
```prisma
twoFactorEnabled     Boolean  @default(false)
twoFactorSecret      String?  // AES-256 encrypted before storage
twoFactorBackupCodes String[] // bcrypt-hashed, 8 codes, one-time use
```

**Package:** `otplib`, `qrcode`

Flow:
1. Account settings → enable 2FA → show QR + secret → verify first code → save hashed backup codes
2. On login, if `twoFactorEnabled` → redirect to `/[locale]/(auth)/verify-2fa`
3. Backup code path for lost authenticator

#### 2g — Contact Form (Phase 0 completes the page; this completes the backend)

**New route:** `POST /api/contact`
- Zod validation (name, email, subject, message)
- Creates `ContactMessage` in DB
- Sends confirmation to user + alert to `support@taxalex.de`
- Rate-limited: 3 per hour per IP

---

### Phase 3 — DB Schema Expansion (1 week)

**Objective:** Add all models needed for payments, blog, notifications, advisor relationships.
Do this before Phase 4 (payments) so migrations are clean.

**Add to `prisma/schema.prisma`:**

```prisma
// ── Subscriptions ─────────────────────────────────────────────────────────────

model Subscription {
  id                   String             @id @default(cuid())
  userId               String             @unique
  stripeCustomerId     String             @unique
  stripeSubscriptionId String?            @unique
  stripePriceId        String?
  planSlug             String
  status               SubscriptionStatus
  currentPeriodStart   DateTime
  currentPeriodEnd     DateTime
  cancelAtPeriodEnd    Boolean            @default(false)
  cancelledAt          DateTime?
  trialEnd             DateTime?
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt
  user                 User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  invoices             Invoice[]
  @@index([userId])
  @@index([stripeCustomerId])
}

enum SubscriptionStatus {
  TRIALING
  ACTIVE
  PAST_DUE
  CANCELLED
  UNPAID
  INCOMPLETE
}

// One-off purchases (Einzelfall and pack plans)
model Purchase {
  id                    String   @id @default(cuid())
  userId                String
  stripePaymentIntentId String   @unique
  planSlug              String
  amountCents           Int
  currency              String   @default("EUR")
  creditsGranted        Int      @default(1)
  receiptUrl            String?
  createdAt             DateTime @default(now())
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
}

model CreditBalance {
  id         String   @id @default(cuid())
  userId     String   @unique
  credits    Int      @default(0)
  updatedAt  DateTime @updatedAt
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Invoice {
  id                String        @id @default(cuid())
  subscriptionId    String?
  userId            String
  stripeInvoiceId   String        @unique
  invoiceNumber     String?       // sequential German-format: 2026-0001
  amountCents       Int
  taxCents          Int           @default(0)
  currency          String        @default("EUR")
  status            InvoiceStatus
  pdfUrl            String?
  dueDate           DateTime?
  paidAt            DateTime?
  createdAt         DateTime      @default(now())
  user              User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  subscription      Subscription? @relation(fields: [subscriptionId], references: [id])
  @@index([userId])
}

enum InvoiceStatus { DRAFT OPEN PAID VOID UNCOLLECTIBLE }

model InvoiceCounter {
  year    Int @id
  nextSeq Int @default(1)
}

// ── Blog ──────────────────────────────────────────────────────────────────────

model BlogPost {
  id          String          @id @default(cuid())
  slug        String          @unique
  status      BlogStatus      @default(DRAFT)
  authorId    String
  publishedAt DateTime?
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  author      User            @relation(fields: [authorId], references: [id])
  translations BlogTranslation[]
  tags        BlogPostTag[]
  @@index([status, publishedAt])
}

enum BlogStatus { DRAFT PUBLISHED ARCHIVED }

model BlogTranslation {
  id        String   @id @default(cuid())
  postId    String
  locale    String
  title     String
  excerpt   String   @db.Text
  content   String   @db.Text
  metaTitle String?
  metaDesc  String?
  post      BlogPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  @@unique([postId, locale])
}

model BlogTag {
  id    String       @id @default(cuid())
  slug  String       @unique
  label String
  posts BlogPostTag[]
}

model BlogPostTag {
  postId String
  tagId  String
  post   BlogPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag    BlogTag  @relation(fields: [tagId], references: [id], onDelete: Cascade)
  @@id([postId, tagId])
}

// ── Notifications ─────────────────────────────────────────────────────────────

model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  body      String?
  caseId    String?
  isRead    Boolean          @default(false)
  createdAt DateTime         @default(now())
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId, isRead])
  @@index([userId, createdAt])
}

enum NotificationType {
  CASE_READY
  DEADLINE_REMINDER
  PAYMENT_SUCCESS
  PAYMENT_FAILED
  ADVISOR_ASSIGNED
  CASE_SUBMITTED
  OUTCOME_REQUESTED
  SYSTEM
}

// ── Email queue (scheduled deadline reminders) ────────────────────────────────

model EmailQueue {
  id          String    @id @default(cuid())
  userId      String?
  to          String
  templateKey String
  payload     Json
  scheduledAt DateTime
  sentAt      DateTime?
  failedAt    DateTime?
  attempts    Int       @default(0)
  @@index([scheduledAt, sentAt])
}

// ── Advisor ↔ Client ──────────────────────────────────────────────────────────

model AdvisorClient {
  id          String              @id @default(cuid())
  advisorId   String
  clientId    String?
  inviteEmail String?
  inviteToken String?             @unique
  status      AdvisorClientStatus @default(PENDING)
  notes       String?             @db.Text
  createdAt   DateTime            @default(now())
  advisor     User                @relation("AdvisorClients", fields: [advisorId], references: [id], onDelete: Cascade)
  client      User?               @relation("ClientAdvisors", fields: [clientId], references: [id])
  @@unique([advisorId, clientId])
  @@index([advisorId])
  @@index([clientId])
}

enum AdvisorClientStatus { PENDING ACTIVE SUSPENDED }

model CaseAssignment {
  id         String   @id @default(cuid())
  caseId     String   @unique
  advisorId  String
  assignedAt DateTime @default(now())
  notes      String?  @db.Text
  case       Case     @relation(fields: [caseId], references: [id], onDelete: Cascade)
  advisor    User     @relation(fields: [advisorId], references: [id])
  @@index([advisorId])
}

// ── Outcome tracking ──────────────────────────────────────────────────────────

model CaseOutcome {
  id           String        @id @default(cuid())
  caseId       String        @unique
  outcome      OutcomeResult
  reportedAt   DateTime      @default(now())
  amountSaved  Decimal?      @db.Decimal(10, 2)
  notes        String?
  case         Case          @relation(fields: [caseId], references: [id], onDelete: Cascade)
}

enum OutcomeResult {
  GRANTED
  PARTIALLY_GRANTED
  REJECTED
  WITHDRAWN
  PENDING
}

// ── Generation jobs (for streaming) ──────────────────────────────────────────

model GenerationJob {
  id            String   @id @default(cuid())
  caseId        String?
  userId        String?
  status        String   @default("pending") // pending | running | done | failed
  agentStatuses Json     @default("{}")       // { drafter: "done", reviewer: "running", ... }
  expiresAt     DateTime
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  @@index([userId])
}

// ── Audit log ─────────────────────────────────────────────────────────────────

model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  action    String   // "user.login" | "case.generate" | "subscription.cancel" | ...
  target    String?
  targetId  String?
  ipHash    String?  // SHA-256(IP + daily salt), never raw IP
  meta      Json?    // non-PII context only
  createdAt DateTime @default(now())
  @@index([userId, createdAt])
  @@index([action, createdAt])
}

// ── Contact messages ──────────────────────────────────────────────────────────

model ContactMessage {
  id        String   @id @default(cuid())
  name      String
  email     String
  subject   String
  message   String   @db.Text
  userId    String?
  status    String   @default("new")
  createdAt DateTime @default(now())
  @@index([status, createdAt])
}
```

**New fields on `User`:**
```prisma
twoFactorEnabled     Boolean       @default(false)
twoFactorSecret      String?
stripeCustomerId     String?       @unique
firmName             String?       // for advisor white-label
firmAddress          String?
firmLogo             String?       // storage path
subscription         Subscription?
purchases            Purchase[]
creditBalance        CreditBalance?
invoices             Invoice[]
notifications        Notification[]
blogPosts            BlogPost[]
advisorClients       AdvisorClient[] @relation("AdvisorClients")
clientAdvisors       AdvisorClient[] @relation("ClientAdvisors")
caseAssignments      CaseAssignment[]
passwordResets       PasswordResetToken[]
```

**New `CaseStatus` values to add:**
```prisma
enum CaseStatus {
  // existing ...
  ADVISOR_REVIEW   // already exists
  // new:
  OUTCOME_PENDING  // submitted, awaiting user to report outcome
  OUTCOME_REPORTED // outcome recorded
}
```

**Migration:** `npx prisma migrate dev --name expand-schema`

---

### Phase 4 — Stripe: Full Payment Implementation (2 weeks)

**Objective:** Real subscriptions, one-off purchases, invoices, dunning, free vs paid gating.

#### 4a — Stripe Configuration

**New env vars:**
```
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY  (NEXT_PUBLIC_)
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_ID_EINZELFALL        # €7.99 one-off
STRIPE_PRICE_ID_JAHRESPASS        # €29.99/year
STRIPE_PRICE_ID_SELBSTSTAENDIG    # €49.99/month
STRIPE_PRICE_ID_ADVISOR_STARTER   # €99/month
STRIPE_PRICE_ID_ADVISOR_TEAM      # €249/month
STRIPE_PRICE_ID_LAWYER            # €149/month
```

**New file:** `src/lib/stripe.ts`
- Typed Stripe client singleton
- `getOrCreateCustomer(userId, email)` — creates Stripe customer if `stripeCustomerId` null
- `createCheckoutSession(userId, priceId, mode: 'payment'|'subscription', successUrl, cancelUrl)`
- `createPortalSession(stripeCustomerId, returnUrl)`

**New file:** `src/lib/entitlements.ts`
```ts
export async function getUserEntitlements(userId: string): Promise<Entitlements>
// Returns: { canGenerate, maxSavedCases, canDownloadDocx, canDownloadPdf, isAdvisor, isLawyer }
```
This is the single source of truth for feature gating. Components and API routes import this.
Never check `user.role` directly for feature access — always use entitlements.

#### 4b — Checkout & Portal Routes

**`POST /api/billing/checkout`:**
- Auth required
- Body: `{ priceId: string; locale: string }`
- Creates/retrieves Stripe customer
- Creates Checkout session with `locale`, `customer`, `success_url`, `cancel_url`
- Returns `{ url }`

**`POST /api/billing/portal`:**
- Auth required
- Retrieves `stripeCustomerId` from DB
- Creates Stripe Portal session
- Returns `{ url }`

#### 4c — Stripe Webhooks

**`POST /api/webhooks/stripe`:**
- `req.arrayBuffer()` → `Buffer.from()` → `stripe.webhooks.constructEvent()` (raw body required)
- Handle:

| Event | DB action | Email |
|---|---|---|
| `checkout.session.completed` | Create `Subscription` or `Purchase`; grant credits; update `User.role` | `ReceiptEmail` |
| `invoice.paid` | Create/update `Invoice`; store PDF URL | (Stripe sends its own) |
| `invoice.payment_failed` | Set subscription `PAST_DUE`; create `Notification` | `PaymentFailedEmail` |
| `customer.subscription.updated` | Sync all `Subscription` fields | — |
| `customer.subscription.deleted` | Set `CANCELLED`; downgrade role | `SubscriptionCancelledEmail` |
| `customer.subscription.trial_will_end` | Create `Notification` | Reminder email |

#### 4d — Billing Page Rebuild

Replace all `alert()` stubs in `/(app)/billing/page.tsx`:
- Current plan card (status badge, next billing date, cancel option)
- Plan grid from `contentFallbacks.ts` (updated with new prices)
- "Abonnieren" / "Upgrade" → POST to `/api/billing/checkout`
- "Verwalten" → POST to `/api/billing/portal`
- Invoice table from `Invoice` DB records

#### 4e — Free vs Paid Gating

Enable `features.payments` in production.

**In `/api/generate`:** Call `getUserEntitlements(userId)`:
- If `!canGenerate`: return `{ error: 'LIMIT_REACHED' }`
- Deduct credit from `CreditBalance` if credit-based plan

**In download route:** Check `canDownloadDocx` / `canDownloadPdf`.

**In Einspruch page:** If `LIMIT_REACHED` returned, show upgrade modal (the Modal component already exists).

#### 4f — German Invoice Compliance

Sequential invoice numbers: `2026-0001`, `2026-0002`, etc.
**`src/lib/invoiceNumber.ts`:** Atomic increment using `InvoiceCounter` table:
```sql
UPDATE invoice_counter SET next_seq = next_seq + 1 WHERE year = $1 RETURNING next_seq
```
Format: `${year}-${String(seq).padStart(4, '0')}`

Invoices include: TaxaLex company data, customer VAT number (if provided), net amount,
19% VAT, gross total, payment date. Stripe Tax handles VAT calculation; we format for German law.

---

### Phase 5 — GDPR & Security Hardening (1 week)

**Objective:** Legally compliant before taking payment. Non-negotiable.

#### 5a — Security Headers

Add to `next.config.js`:
```js
'Content-Security-Policy': [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com",
  "frame-src https://js.stripe.com",
  "connect-src 'self' https://api.stripe.com https://api.resend.com",
].join('; '),
'X-Frame-Options': 'DENY',
'X-Content-Type-Options': 'nosniff',
'Referrer-Policy': 'strict-origin-when-cross-origin',
'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
```

#### 5b — Rate Limiting

**New file:** `src/lib/rateLimit.ts` — sliding window, in-memory Map (upgrade to Redis later)
Apply to: `POST /api/auth/*` (10/min), `POST /api/generate` (5/min), `POST /api/contact` (3/h per IP)

#### 5c — Cookie Consent Banner

**New component:** `src/components/CookieBanner.tsx`
- Appears on first visit for all public pages
- "Nur Notwendige" (session cookie only) / "Alle akzeptieren" (+ Stripe.js + analytics)
- Stores `cookie_consent=necessary|all` cookie + `localStorage`
- Stripe.js only loads when `all` consent given
- Settings changeable at `/[locale]/cookies`

#### 5d — GDPR Data Rights

**`GET /api/account/export-data`:**
- Queues async export job
- Packages: user record (no passwordHash), all cases, all outputs, all invoices
- Format: ZIP with JSON files
- Sends download link via email when ready (link expires 48h)
- Logs to `AuditLog`

**`POST /api/account/delete`:**
- 14-day grace period (account suspended, user can cancel)
- After 14 days: cron purges personal data
- `bescheidData` and `userAnswers` set to null
- `CaseOutput.content` truncated to first 20 chars
- Stripe customer deleted
- `AuditLog` entries: `userId` → null (anonymised)
- Email confirmation sent

#### 5e — Audit Logging

**New utility:** `src/lib/audit.ts` — `logAudit(action, userId?, targetId?, meta?)`
Log on: login, logout, case generation, file upload, plan change, password change, 2FA toggle, export, deletion.
`ipHash = sha256(ip + dailySalt)` — never log raw IP.
Never include personal data or document content in `meta`.

#### 5f — Sensitive Data Encryption

`User.twoFactorSecret`: encrypt with AES-256 before write, decrypt on read.
**New file:** `src/lib/crypto.ts` — `encrypt(plaintext)`, `decrypt(ciphertext)` using `ENCRYPTION_KEY` env var.
**New env var:** `ENCRYPTION_KEY` (32 bytes, base64) — different from `NEXTAUTH_SECRET`

---

### Phase 6 — User Portal: Complete (1 week)

**Objective:** Dashboard with real data, cases with outcome tracking, account settings.

#### 6a — Dashboard

Replace mock stats with real DB queries:
- Cases by status, upcoming deadlines (next 14 days)
- Notification feed from `Notification` model (bell icon + unread count in nav)
- "Ergebnis melden" prompts for cases in `OUTCOME_PENDING` status (submitted >4 weeks ago)
- Quick-action card: "Neuen Einspruch erstellen" → `/[locale]/einspruch`
- Deadline alert banners: red for ≤3 days, amber for ≤7 days

#### 6b — Case Detail: Outcome Tracking

On cases with status `SUBMITTED` or `OUTCOME_PENDING`:
- Banner: "Hat die Behörde geantwortet?" → outcome selection
- Options: Stattgegeben ✓ / Teilweise stattgegeben / Abgelehnt / Noch kein Bescheid
- Creates `CaseOutcome` record
- Updates case status to `OUTCOME_REPORTED`
- If outcome = REJECTED: show "Nächste Schritte" card with link to contact an advisor (Phase II)

#### 6c — iCal Deadline Export

"Zur Kalender hinzufügen" button on case detail page.
**New route:** `GET /api/cases/[id]/ical` — returns `.ics` file
Include: summary (Einspruchsfrist), date, location (Finanzamt name), description with case ID.

#### 6d — Account Settings

`/[locale]/(app)/account` — complete rebuild:
- Personal info tab: name, email (re-verification on change), locale, outputLanguage
- Security tab: change password, 2FA setup/disable, active sessions list (revoke)
- Notifications tab: toggles per `NotificationType`
- Advisor firm tab (only if role = ADVISOR or LAWYER): firmName, firmAddress, logo upload
- Data tab: export data button, delete account button

---

### Phase 7 — Deadline Reminder System (3 days)

**Objective:** Proactively remind users before their 30-day window closes.

**New cron endpoint:** `POST /api/cron/deadline-reminders`
- Auth: `Authorization: Bearer {CRON_SECRET}` header required
- Queries cases where `deadline BETWEEN now() AND now() + 7 days` AND status not closed
- Creates `EmailQueue` entries for each (7-day and 3-day reminders)
- Also creates in-app `Notification` records
- Idempotent: checks `EmailQueue` for existing entry before creating

**New env var:** `CRON_SECRET`

**Schedule:** Configure in hosting environment as daily cron at 08:00 Europe/Berlin.
For Docker Swarm: add a `cron` service that runs `curl -H "Authorization: Bearer $CRON_SECRET" https://taxalex.de/api/cron/deadline-reminders` daily.

---

### Phase 8 — Blog & SEO (2 weeks)

**Objective:** Organic traffic from people searching "Einspruch gegen Steuerbescheid" etc.

#### 8a — Blog Pages

- `/[locale]/blog` — article list, 10/page, tag filter
- `/[locale]/blog/[slug]` — article page with MDX content, reading time, table of contents, CTA
- `/[locale]/blog/tag/[tag]` — tag-filtered list

**Package:** `next-mdx-remote`

JSON-LD `Article` structured data on every article page.
Open Graph image auto-generated per article (title overlay on brand background).

#### 8b — Starter Articles (DE first, then EN)

1. "Steuerbescheid falsch? So legen Sie erfolgreich Einspruch ein" — highest volume keyword
2. "Einspruchsfrist verpasst: Was Sie jetzt noch tun können"
3. "Jobcenter-Bescheid anfechten: Ihre Rechte nach SGG"
4. "Grundsteuerreform 2025: So prüfen Sie Ihren Bescheid"
5. "Als Expat Steuern in Deutschland: Behördenbescheide verstehen"
6. "Wann lohnt sich ein Einspruch? Die Erfolgsquoten im Überblick" (with BMF source citations)

#### 8c — Sitemap, Robots, Structured Data

`src/app/sitemap.ts` — all public pages + all published blog posts per locale.
`src/app/robots.ts` — disallow `/api`, `/(app)`, allow rest.

Homepage JSON-LD: `Organization` + `WebSite` with sitelinks searchbox.
Pricing page: `Product` + `Offer` per plan.
FAQ page: `FAQPage` schema.
How-it-works: `HowTo` schema.

---

### Phase 9 — Admin CMS (1 week)

**Objective:** Non-technical team can manage content without deployments.

#### Admin tabs (expand existing `/[locale]/(app)/admin`):

**Blog tab** — article list, create/edit/publish, translation management
**Pricing tab** — edit plan prices and features; "Publish" button clears cache
**FAQs tab** — add/edit/delete/reorder by locale + category
**Use Cases tab** — edit descriptions, deadlines, success rates
**Trust Stats tab** — manage verified statistics with sources
**Users tab** — search, role assignment, 2FA reset, subscription view, GDPR deletion trigger
**Contact Messages tab** — inbox for contact form submissions

---

### Phase 10 — Professional Review Feature (1 week, after Phase 6)

**Objective:** Allow users to optionally request a quick review from their own tax advisor
or lawyer. No separate portal, no advisor subscription, no full dashboard.

#### 10a — Review Request

On the result step of the Einspruch flow, add "Profi-Prüfung anfordern" button.

Clicking opens a small modal:
- Email input field (user enters their advisor's/lawyer's email)
- Optional note: "Ich habe eine Frage zu..." (free text, 280 chars)
- Sends `AdvisorReviewInviteEmail` to the professional with a secure signed review link
- Creates `CaseAssignment` record with status `PENDING`
- Sets `Case.status = ADVISOR_REVIEW`

The review link is signed with HMAC-SHA256 (caseId + email + secret), valid 7 days.
No account required to follow the link.

#### 10b — Review Interface (public, no login required)

**New page:** `/review/[token]`

A clean, read-only page showing:
- Case type, deadline, and Bescheid summary (no personal Steuernummer — redacted)
- The final letter in full
- The 5-agent review panel: one-line verdict per agent (collapsed by default)
- Three action buttons:

```
[✅ Freigeben]   [💬 Kommentar senden]   [❓ Frage stellen]
```

**Freigeben:** `POST /api/review/[token]/approve`
- Validates HMAC token
- Sets `CaseAssignment.status = APPROVED`
- Sets `Case.status = APPROVED`
- Logs to `AuditLog`: professional email hash + timestamp
- Sends notification to user: "Ihr Einspruch wurde von [professional name/email] geprüft"
- Professional sees confirmation screen: "Freigabe erfolgreich übermittelt"

**Kommentar senden / Frage stellen:** Opens a text field. Submits to
`POST /api/review/[token]/comment` → creates a `ReviewMessage` (see schema below).
User is notified → can view comments in their case detail page.
If user responds, professional gets email with the reply.

#### 10c — Schema additions

```prisma
model ReviewMessage {
  id         String   @id @default(cuid())
  caseId     String
  fromAdvisor Boolean @default(false)
  message    String   @db.Text
  createdAt  DateTime @default(now())
  case       Case     @relation(fields: [caseId], references: [id], onDelete: Cascade)
  @@index([caseId])
}
```

Add `reviewMessages ReviewMessage[]` to `Case` model.

#### 10d — Professional account (optional, free)

If a professional reviews letters frequently, they can register a free account
with role `ADVISOR` or `LAWYER`. This gives them:
- `/[locale]/(app)/advisor/reviews` — list of all pending and completed reviews sent to their email
- No billing, no subscription, no management tools — purely a review inbox

The account is free. Their value to the platform is the professional credibility they lend
to reviewed letters. There is no product sold to them.

#### 10e — Files

- `src/app/review/[token]/page.tsx` — **create** (no locale needed, public link)
- `src/app/api/review/[token]/approve/route.ts` — **create**
- `src/app/api/review/[token]/comment/route.ts` — **create**
- `src/lib/emailTemplates/AdvisorReviewInviteEmail.tsx` — **create**
- `src/app/[locale]/(app)/advisor/reviews/page.tsx` — **create** (for professional inbox)
- `prisma/schema.prisma` — add `ReviewMessage` model

---

## Part 3: What You May Have Missed

**Regulatory:**
- AGB MUST be reviewed by a German Verbraucherrechts or IT-Recht specialist before enabling
  payments. Key: Fernabsatzrichtlinie (VRRL), 14-day Widerrufsrecht for digital services
  (§§ 355-361 BGB), Klarheit über Leistungsgegenstand.
- If/when advisors file Einsprüche on behalf of clients using TaxaLex-generated letters,
  the StBerG (Steuerberatungsgesetz) governs. The platform enables their work; it doesn't
  become the Steuerberater. This is analogous to Word being a tool used to write legal documents.
- For any EU B2B sales: reverse charge VAT rule. Stripe Tax handles this automatically.

**Pricing infrastructure:**
- Enable **Stripe Tax** in the Stripe dashboard before the first charge. It handles
  19% German VAT for B2C, reverse charge for EU B2B, and foreign VAT rules.
- Add a VAT ID field to the billing form for B2B customers (advisors, lawyers, self-employed).
- Stripe supports coupon codes natively — implement a `couponCode` param in checkout sessions
  for launch promotions with no extra code.

**Missing features worth building (not asked, but important):**
1. **PWA manifest** (`manifest.webmanifest` + service worker) — gives free installable mobile
   app, improves Lighthouse score significantly. 1 day of work.
2. **Social sharing** — after successful result: pre-written shareable text.
   Organic growth with zero cost.
3. **"Rejected Einspruch" intake for non-advisors** — user whose Einspruch was rejected
   can upload the rejection and get guidance on next steps. This bridges individual users
   to the lawyer portal without needing a lawyer yet.
4. **ApiKey model** — add now even if API isn't built. Schema:
   `{ userId, keyHash, name, lastUsedAt, rateLimit }`. When you build the advisor API,
   the migration is additive, not destructive.
5. **Aggregate outcome statistics** — once 200+ outcomes are reported, surface real numbers:
   "TaxaLex users who filed saw X% success rate across Y cases." Replace trust stats.
   Add a cron job that recalculates these weekly and caches them.
6. **Apple Sign-In** is mandatory if you ever release a native iOS app (App Store requirement:
   if any third-party OAuth is offered, Apple Sign-In must also be offered). Build it early.

---

## Part 4: Execution Order

| Phase | What it delivers | When |
|---|---|---|
| 0 | No dead links, no placeholder legal content | Week 1 |
| 1 | **The product actually works** (real AI pipeline, real file upload) | Weeks 2–4 |
| 2 | Full auth (verify email, reset password, Apple, 2FA) | Weeks 5–6 |
| 3 | DB schema expanded (no visible change, enables everything after) | Week 5 (parallel with 2) |
| 4 | **Stripe payments — revenue begins** | Weeks 7–8 |
| 5 | GDPR compliant, security headers, rate limiting | Week 7 (parallel with 4) |
| 6 | User portal with real data + outcome tracking | Week 9 |
| 7 | Deadline reminder emails | Week 9 (3 days) |
| 8 | Blog + SEO + sitemap | Weeks 10–11 |
| 9 | Admin CMS | Week 12 |
| 10 | **Advisor portal — B2B revenue begins** | Weeks 13–16 |
| 11 | Lawyer portal | Week 17+ |

**Decision gates:**
- Do not start Phase 4 (payments) until Phase 2 (email verification) is done.
  Paying users who cannot verify their email is a support nightmare.
- Do not launch Phase 10 (advisor portal) until Phase 1 has real usage data.
  Build the B2B product based on what individual users actually struggle with.
- Do not open AGB to search indexing until a lawyer has reviewed the payment terms.

---

## Part 5: Files Summary

### Phase 0 (fix now)
- `src/app/[locale]/impressum/page.tsx` — fill placeholders
- `src/app/[locale]/agb/page.tsx` — remove amber notice
- `src/app/[locale]/kontakt/page.tsx` — **create**
- `src/app/[locale]/fuer-steuerberater/page.tsx` — fix /kontakt link

### Phase 1 (core product — highest priority)
- `src/lib/ocr.ts` — **create**
- `src/lib/exportDocx.ts` — **create**
- `src/app/api/upload/route.ts` — **create**
- `src/app/api/analyze/route.ts` — **create**
- `src/app/api/generate/route.ts` — **create** (replaces/extends existing)
- `src/app/api/generate/stream/route.ts` — **create**
- `src/app/api/cases/[id]/download/route.ts` — **create**
- `src/app/[locale]/einspruch/page.tsx` — **wire to real API** (remove all DEMO_ constants)

### Phase 2 (auth)
- `src/lib/email.ts` — **create**
- `src/lib/emailTemplates/*.tsx` — **create** (8 templates)
- `src/app/api/auth/verify-email/route.ts` — **create**
- `src/app/api/auth/forgot-password/route.ts` — **create**
- `src/app/api/auth/reset-password/route.ts` — **create**
- `src/app/[locale]/(auth)/forgot-password/page.tsx` — **create**
- `src/app/[locale]/(auth)/reset-password/page.tsx` — **create**
- `src/app/[locale]/(auth)/verify-2fa/page.tsx` — **create**
- `src/auth.ts` — add Apple + Facebook providers
- `src/app/api/contact/route.ts` — **create**

### Phase 3 (schema)
- `prisma/schema.prisma` — expand (13 new models, 12 new User fields)
- `prisma/migrations/*` — generated

### Phase 4 (payments)
- `src/lib/stripe.ts` — **create**
- `src/lib/entitlements.ts` — **create**
- `src/lib/invoiceNumber.ts` — **create**
- `src/app/api/billing/checkout/route.ts` — **create**
- `src/app/api/billing/portal/route.ts` — **create**
- `src/app/api/webhooks/stripe/route.ts` — **create**
- `src/app/[locale]/(app)/billing/page.tsx` — **rebuild** (remove all stubs)
- `src/lib/contentFallbacks.ts` — update prices to revised model

### Phase 5 (GDPR + security)
- `src/lib/audit.ts` — **create**
- `src/lib/crypto.ts` — **create**
- `src/lib/rateLimit.ts` — **create**
- `src/components/CookieBanner.tsx` — **create**
- `src/app/api/account/export-data/route.ts` — **create**
- `src/app/api/account/delete/route.ts` — **create**
- `next.config.js` — add security headers

### Phase 6 (user portal)
- `src/app/[locale]/(app)/dashboard/page.tsx` — rebuild with real data
- `src/app/[locale]/(app)/cases/[id]/page.tsx` — add outcome tracking
- `src/app/[locale]/(app)/account/page.tsx` — full rebuild
- `src/app/api/cases/[id]/ical/route.ts` — **create**

### Phase 7 (reminders)
- `src/app/api/cron/deadline-reminders/route.ts` — **create**

### Phase 8 (blog + SEO)
- `src/app/[locale]/blog/page.tsx` — **create**
- `src/app/[locale]/blog/[slug]/page.tsx` — **create**
- `src/app/[locale]/blog/tag/[tag]/page.tsx` — **create**
- `src/app/sitemap.ts` — **create**
- `src/app/robots.ts` — **create**

### Phase 9 (admin CMS)
- `src/app/[locale]/(app)/admin/AdminClient.tsx` — expand tabs

### Phase 10 (advisor portal)
- `src/app/[locale]/(app)/advisor/` — expand existing pages
- `src/app/api/advisor/clients/route.ts` — **create**
- `src/app/api/cases/[id]/approve/route.ts` — **create**

**Total new/rebuilt files across all phases: ~55**
**Total new DB models: 14**
**Total new env vars: ~22**
