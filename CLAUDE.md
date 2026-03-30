# TaxPax – Development Framework

This file is the single source of truth for all development standards.
It is read automatically by Claude Code and must be followed in every coding session.

---

## 1. Environment Management

### Two environments only: `development` and `production`
- Never add a third environment without explicit discussion.
- `NODE_ENV` is the single switch — never branch on anything else.
- All environment-specific behavior must go through the central `env.ts` config (see §3).

### Secrets & configuration
- **Never hardcode any value** that could vary between environments or users.
  This includes API keys, URLs, timeouts, limits, feature flags, copy/labels, model names.
- **Dev**: use `.env.local` (gitignored). Copy from `.env.example`.
- **Prod**: use Docker Swarm secrets injected via `docker-entrypoint.sh` (see `docker-stack.yml`).
- `.env`, `.env.local`, `*.pem`, `secrets/` are gitignored — verify before every commit.
- If a value is used in more than one place, it belongs in `src/config/env.ts`, not inline.

### Feature flags
- Store in `src/config/features.ts` as a typed object, driven by env vars.
- Never use `if (process.env.NODE_ENV === 'development')` directly in components or lib code.
  Use `import { isDev } from '@/config/env'` instead.

---

## 2. Logging Standards

### Never use `console.log` directly
- All logging must go through `src/lib/logger.ts`.
- `console.log` is banned in committed code. Use `logger.debug(...)`.

### Log levels and behavior by environment

| Level | Dev | Prod |
|---|---|---|
| `logger.debug` | printed, colored | suppressed |
| `logger.info` | printed | JSON to stdout |
| `logger.warn` | printed + stack | JSON to stdout |
| `logger.error` | printed + full stack | JSON to stdout + alert |

### What must never appear in logs
- API keys, tokens, passwords, or any secret.
- Full document text from user uploads.
- Personal data (name, Steuernummer, Finanzamt) in prod logs.
- Raw request bodies.

### Log format in production
Structured JSON, one object per line, always including:
```json
{ "level": "info", "ts": "ISO8601", "msg": "...", "env": "production", "context": {} }
```

### Agent pipeline logging
Every agent call must log: `role`, `provider`, `model`, `durationMs`.
Never log `content` (the AI response) in production.

---

## 3. Configuration — `src/config/env.ts`

This file is the **only** place where `process.env` is read.
All other files import from here. This makes config auditable and testable.

```ts
// Pattern to follow
export const config = {
  isDev: process.env.NODE_ENV !== 'production',
  isProd: process.env.NODE_ENV === 'production',
  anthropicApiKey: requireEnv('ANTHROPIC_API_KEY'),
  googleAiApiKey: requireEnv('GOOGLE_AI_API_KEY'),
  perplexityApiKey: requireEnv('PERPLEXITY_API_KEY'),
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',       // optional
  nextAuthSecret: requireEnv('NEXTAUTH_SECRET'),
  nextAuthUrl: process.env.NEXTAUTH_URL ?? 'http://localhost:3000',
} as const
```

`requireEnv` throws a clear error at startup if a required variable is missing,
rather than failing silently at runtime.

---

## 4. Security Standards

### Input validation
- All API route inputs must be validated with **Zod** before use.
- Never trust `req.json()` directly — always parse through a Zod schema.
- Validation schemas live alongside the route: `route.schema.ts`.

### API routes
- Every route must check `req.method` explicitly.
- Rate-limit all public routes (add `src/lib/rateLimit.ts` when auth is added).
- Return generic error messages to clients; log specific errors server-side only.
- Never expose stack traces or internal errors in API responses.

### Headers (add to `next.config.js`)
```
Content-Security-Policy
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### File uploads
- Validate MIME type server-side (never trust the client's declared type).
- Enforce max file size (10 MB default) before processing.
- Store uploaded files outside the `public/` directory.
- Scan filenames: strip path traversal characters before saving.

### Dependencies
- Run `npm audit` before every release.
- Never install a package to solve a problem that can be solved in 10 lines.

---

## 5. No Hardcoding Rules

### What goes where

| Type of value | Where it lives |
|---|---|
| API keys, secrets | `.env.local` / Docker Swarm secrets |
| Timeouts, limits, model names | `src/config/env.ts` or `src/config/constants.ts` |
| UI labels, button text | `src/config/copy.ts` (or i18n later) |
| Agent system prompts | `src/lib/agents.ts` AGENTS map — never inline in orchestrate() |
| Colors, spacing | Tailwind config + CSS variables in `globals.css` |
| Feature flags | `src/config/features.ts` |
| Legal/domain constants (deadlines, §§) | `src/config/legal.ts` |

### Brand / product name
The product name must never be hardcoded as a string literal anywhere in `src/`.
Always import from `src/config/brand.ts`:
```ts
import { brand } from '@/config/brand'
// then use brand.name, brand.metaTitle, brand.logPrefix, etc.
```
The only files that may contain the literal product name are:
- `src/config/brand.ts` (the definition)
- `messages/*.json` via the `common.appName` key
- `README.md`, `CLAUDE.md`, `package.json` (non-compiled, manual update acceptable)

### Model names
Model names (`claude-sonnet-4-20250514`, `gemini-1.5-pro`, etc.) must be defined
in `src/config/constants.ts`, not scattered across agent configs.
This makes model upgrades a one-line change.

---

## 6. UI Component Standards

### Centralized components
All reusable UI lives in `src/components/`. Before building any UI element,
check if a component already exists. Never duplicate.

Required base components (create before building new pages):
- `Button` — variants: `primary | secondary | danger | ghost`; states: `loading | disabled`
- `Input`, `Textarea` — with label, error, and hint slots
- `Card` — wrapper with consistent padding and border
- `Badge` — for status/role indicators (agent roles, case status)
- `Alert` — variants: `error | warning | info | success`
- `Spinner` / `Loader` — single animation used everywhere
- `StepIndicator` — the pipeline progress bar (currently duplicated)

### Styling rules
- Use Tailwind utility classes. No inline `style={{}}` props.
- Use CSS variables from `globals.css` for semantic colors (`var(--border)`, `var(--muted)`).
- Use `brand-*` tokens from `tailwind.config.js` for brand colors — never raw hex.
- Dark mode: design tokens in `globals.css` handle this — components must not hardcode light colors.
- No `!important`. If you need it, the component structure is wrong.

### Forms
- All form state goes through controlled React state or a form library (React Hook Form when complexity warrants it).
- Every input needs an associated `<label>` — no placeholder-only labels.
- Show field-level validation errors, not just form-level.

---

## 7. Code Style & Comments

### Comments: explain *why*, not *what*
```ts
// BAD — describes what the code does (obvious from reading it)
// Loop through agents and call each one
for (const agent of agents) { ... }

// GOOD — explains why a non-obvious decision was made
// Perplexity requires sequential calls; parallel requests hit rate limits at sonar-pro tier
for (const agent of agents) { ... }
```

### When to comment
- Non-obvious business logic (legal rules, edge cases).
- Workarounds for external API quirks.
- Security-sensitive sections.
- TODO/FIXME must include a reason and a GitHub issue reference: `// TODO(#42): add rate limiting`

### TypeScript
- `strict: true` is non-negotiable.
- No `any` — use `unknown` and narrow it, or define a proper type.
- No `@ts-ignore` — fix the type error.
- Prefer `interface` for object shapes, `type` for unions and aliases.
- Export types from `src/types/index.ts`; never define one-off types inline in components.

### Functions
- Max ~40 lines per function. If longer, extract.
- One responsibility per function.
- Pure functions preferred — side effects only at the edges (API routes, DB calls).
- Async functions must handle errors — never a floating `Promise` without `.catch` or `try/catch`.

### File naming
- Components: `PascalCase.tsx`
- Utilities, lib, config: `camelCase.ts`
- API routes: Next.js convention (`route.ts`)
- Test files: `*.test.ts` alongside the file they test

---

## 8. Error Handling

### Pattern
```ts
// API routes: always return a typed error shape
return NextResponse.json({ error: 'Human-readable message' }, { status: 400 })

// Never expose internals
// BAD
return NextResponse.json({ error: error.message }, { status: 500 })

// GOOD
logger.error('Generate failed', { error })
return NextResponse.json({ error: 'Generierung fehlgeschlagen' }, { status: 500 })
```

### Agent pipeline errors
- If one agent fails, the pipeline must fail fast and return a clear error.
- Never silently skip an agent and proceed to consolidation with incomplete input.
- Log which agent failed, the provider, model, and duration before throwing.

---

## 9. Database (when added)

- All queries go through a single DB client in `src/lib/db.ts`.
- Never build SQL strings with string concatenation — always parameterized queries or an ORM.
- Migrations are versioned files in `migrations/` — never `ALTER TABLE` manually on prod.
- Sensitive columns (Steuernummer, personal data) must be encrypted at rest.
- No business logic in raw SQL — keep queries simple, logic in TypeScript.
- Connection pooling must be configured (max 10 connections for a single VPS).

---

## 10. Git & Release Standards

### Commits
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- One logical change per commit — do not bundle unrelated changes.
- Never commit `.env.local`, API keys, or generated files.

### Branches
- `main` is always deployable.
- Feature branches: `feat/description`, bug branches: `fix/description`.
- Merge via PR — no direct pushes to `main`.

### Before every PR
- [ ] `npm run build` passes
- [ ] `npx tsc --noEmit` passes
- [ ] `npm audit` — no high/critical issues
- [ ] No `console.log` in changed files
- [ ] No hardcoded values introduced
- [ ] `.env.example` updated if new env vars added

---

## 11. Multilingual Standards

### Two independent language axes
- **`uiLanguage`** — the language the user reads the interface and agent analysis in.
  Detected from `Accept-Language` header, overridable by user.
- **`outputLanguage`** — the language the generated legal document is written in.
  Defaults to `de`. Non-German outputs are marked "for review only" since German authorities
  require German.

### Rules
- All UI strings live in `messages/{locale}.json`. Never hardcode visible text in components.
- Add new strings to `de.json` first, then all other locales. Missing keys fall back to `de`.
- Supported locales are defined only in `src/config/i18n.ts` — never duplicated elsewhere.
- `process.env` locale detection lives in `src/config/i18n.ts` (`resolveLocale`).
- Language names for prompt injection come from `languageNames` in `src/config/i18n.ts`.
- AI models (Claude, Gemini, Perplexity) handle multilingual input natively — never translate
  user input before sending to agents.
- Analysis agents (reviewer, factchecker, adversary) respond in `uiLanguage`.
- Document agents (drafter, consolidator) produce output in `outputLanguage`.
- When `outputLanguage !== 'de'`, always append the "for review only" warning in the UI.
- RTL languages (Arabic) require `dir="rtl"` on the root element — handle via locale config,
  not per-component.

### Adding a new locale
1. Add the code to `locales` array in `src/config/i18n.ts`
2. Add the label to `localeLabels`
3. Add to `languageNames` map
4. Create `messages/{code}.json` (copy from `en.json`, translate)
5. If RTL, add to `rtlLocales` set in `src/config/i18n.ts`

## 12. Project-Specific Rules

### Agent pipeline
- Agent configs (model, provider, system prompt) live exclusively in `AGENTS` map in `src/lib/agents.ts`.
- Model names are constants imported from `src/config/constants.ts`.
- Adding a new agent = add to `AgentRole` type + `AGENTS` map + orchestrate() + UI step label. All four, always.
- The Consolidator always receives all prior agent outputs — never skip passing one.

### Use-case system prompts (future)
- Each Bescheid type gets its own system prompt set in `src/config/useCases.ts`.
- System prompts must reference the correct legal basis (§ AO, § SGG, § BGB, etc.).
- Never reuse tax-specific prompts (§347 AO, BFH) for non-tax use cases.

### GDPR
- No personal data (name, Steuernummer, address) may be logged in production.
- Document text from uploads must not be stored permanently without explicit user consent.
- Uploads are processed in memory and deleted — no permanent storage until auth + consent flow is built.

## 13. Dependency Management

**Policy:** Always use the latest stable version within the current major for all packages. Never pin to outdated minors.

**Upgrade workflow:**
```bash
npx npm-check-updates -u --target minor   # bump all deps within current major
npm install
npm run build                             # verify — fix any compile errors before committing
```

**Before bumping to a new major version** — these require dedicated migrations with code compliance updates:

| Package | Breaking change in next major |
|---|---|
| Next.js 16 | Async params/searchParams, middleware→proxy model |
| Tailwind 4 | CSS-first config (no tailwind.config.js), new utility names |
| TypeScript 6 | Stricter defaults, decorator changes |
| Zod 4 | Error API rewrite (`z.ZodError` shape changes) |
| ESLint 10 | `next lint` removed, flat config only |
| Prisma 8 | TBD — monitor release notes |

Do not bump a major version without: (1) reading the migration guide, (2) updating all affected code, (3) verifying the build passes.
