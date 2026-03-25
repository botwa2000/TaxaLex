# CLAUDE.md

## Project
TaxPax — KI-gestützte Einspruchsplattform für den deutschen Steuermarkt.
Multi-agent AI system that generates legally sound tax objection letters (Einspruchsschreiben).

## Commands
- `npm run dev` — Start dev server on port 3000
- `npm run build` — Production build
- `npm run lint` — ESLint check

## Architecture
- Next.js 15 with App Router (TypeScript strict)
- Tailwind CSS for styling
- Multi-agent orchestrator in `src/lib/agents.ts`
- API routes in `src/app/api/`
- All UI in German (de)

## Multi-Agent Pipeline
1. **Drafter** (Claude) — creates initial Einspruch
2. **Reviewer** (GPT-4o) — checks for legal/math errors
3. **Adversary** (Claude) — attacks from Finanzamt perspective
4. **Consolidator** (Claude) — produces final version

## Conventions
- Server components by default; use "use client" only when needed
- TypeScript strict mode; avoid `any` types
- All user-facing text in German
- API keys only on server side (never expose to client)
- GDPR-compliant: no external analytics, no cookies without consent
- German tax law terminology must use BFH-conform language
- Commit messages: imperative mood, < 72 chars

## Key Files
- `src/lib/agents.ts` — Core multi-agent orchestrator
- `src/types/index.ts` — All TypeScript interfaces
- `src/app/einspruch/page.tsx` — Main wizard UI
- `src/app/api/analyze/route.ts` — Document analysis
- `src/app/api/generate/route.ts` — Full pipeline endpoint

## Regulatory Context
- StBerG restricts individual tax advice to licensed professionals
- Our model: AI drafts, Steuerberater reviews and approves
- MiFID II not applicable (tax objections, not investment advice)
- §17 Abs. 2a EStG, §347 AO, §367 Abs. 2 AO are key statutes
