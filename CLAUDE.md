# CLAUDE.md

## Project
TaxAlex — AI-powered tax objection letter generator for DACH (DE/AT/CH).
Multi-agent AI system that generates legally sound Einspruchsschreiben / Beschwerde / Einsprache.
Full product strategy in PRODUCT.md.

## Commands
- `npm run dev` — Start dev server on port 3000
- `npm run build` — Production build
- `npm run lint` — ESLint check

## Architecture
- Next.js 15 with App Router (TypeScript strict)
- Tailwind CSS for styling
- Multi-agent orchestrator in `src/lib/agents.ts`
- API routes in `src/app/api/`
- Config values in environment variables or centralized config — never hardcoded

## Multi-Agent Pipeline
1. **Drafter** (claude-sonnet-4-6) — creates initial Einspruch
2. **Reviewer** (gpt-4o) — checks for legal/math errors
3. **Adversary** (claude-sonnet-4-6) — attacks from Finanzamt perspective
4. **Consolidator** (claude-sonnet-4-6) — produces final version

## Conventions
- Server components by default; use "use client" only when needed
- TypeScript strict mode; avoid `any` types
- UI language driven by user profile setting — all input languages supported
- Output letters always in formal German (legal requirement for DACH authorities)
- API keys only on server side (never expose to client)
- GDPR-compliant: no external analytics without consent, no cookies without consent
- German tax law terminology must use BFH-conform language
- Commit messages: imperative mood, < 72 chars
- No hardcoded values — use environment variables or centralized config files
- Never fix issues at the individual user/record level; always fix at system/code level

## Key Files
- `src/lib/agents.ts` — Core multi-agent orchestrator
- `src/types/index.ts` — All TypeScript interfaces
- `src/app/einspruch/page.tsx` — Appeal wizard UI
- `src/app/api/analyze/route.ts` — Document analysis endpoint
- `src/app/api/generate/route.ts` — Full pipeline endpoint
- `PRODUCT.md` — Full product strategy, user segments, monetization, build order

## Portal Structure
```
/                      Marketing landing page
/app/dashboard         Authenticated user home
/app/appeal/new        Start a new appeal (wizard)
/app/appeal/[id]       View / edit / download appeal
/app/appeals           History
/app/documents         Document vault
/app/settings          Profile, language, billing
/advisor/dashboard     Tax advisor home
/advisor/clients/[id]  Per-client view
```

## User Segments
- Private individuals (employed, expat, self-employed)
- Tax advisors (Steuerberater)
- Lawyers (Fachanwalt für Steuerrecht)
- Corporate HR / finance (phase 2+)

## Regulatory Context
- RDG: TaxAlex is a drafting tool, not legal advice — disclaimer on all AI output
- StBerG: AI drafts, user / Steuerberater reviews and submits
- §347 AO (Einspruch), §367 Abs. 2 AO (Verböserungsverbot), §17 Abs. 2a EStG
- GDPR: EU hosting only (Hetzner DE), encrypted storage, right to erasure implemented

## Secrets (loaded via entrypoint.sh from Docker Swarm secrets)
- ANTHROPIC_API_KEY
- OPENAI_API_KEY
- NEXTAUTH_SECRET
