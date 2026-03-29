# TaxPax – KI-gestützter Widerspruch & Einspruch

Multi-agent AI platform that generates legally sound objection letters for any German administrative decision (*Bescheid*). Upload your document, answer a few questions, and receive a bulletproof letter — reviewed by five specialized AI agents across four different providers.

## Supported Use Cases

| Bescheid-Typ | Gegenstelle | Rechtsgrundlage |
|---|---|---|
| Steuerbescheid | Finanzamt | §347 AO |
| Jobcenter / Bürgergeld | Jobcenter / BA | §§ 83–87 SGG |
| Rentenbescheid | Deutsche Rentenversicherung | §§ 78–85 SGG |
| Bußgeldbescheid | Bußgeldstelle | §§ 67–71 OWiG |
| Krankenversicherung | Krankenkasse | §§ 78–85 SGG |
| Kündigung | Arbeitgeber | §§ 1–26 KSchG |
| Mieterhöhung / Kaution | Vermieter | §§ 558–559 BGB |

## How It Works

1. **Wählen** — select your Bescheid type
2. **Hochladen** — upload your Bescheid and any supporting documents
3. **Rückfragen** — AI extracts key data and asks targeted follow-up questions
4. **Multi-Agent-Pipeline** — five specialized AI agents produce your letter:

```
Drafter (Claude)
  → creates the initial objection letter

Reviewer (Gemini 1.5 Pro)
  → checks for legal/math errors, missing arguments

FactChecker (Perplexity Sonar Pro)
  → verifies citations, case law, and paragraph numbers
    against live legal sources

Adversary (Claude)
  → attacks the draft from the authority's perspective,
    identifies weaknesses and Verböserungsrisiken

Consolidator (Claude)
  → produces the final bulletproof version incorporating
    all feedback
```

5. **Herunterladen** — copy or download the ready-to-submit letter

## Tech Stack

- **Next.js 15** (React 19, App Router, TypeScript)
- **Tailwind CSS**
- **Anthropic Claude** — Drafter, Adversary, Consolidator
- **Google Gemini 1.5 Pro** — Reviewer
- **Perplexity Sonar Pro** — Fact-checker (live web search)
- **Hetzner Cloud** — GDPR-compliant hosting (Germany)

## Quick Start

```bash
git clone https://github.com/botwa2000/TaxPax.git
cd TaxPax
npm install
cp .env.example .env.local
# Fill in your API keys (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
ANTHROPIC_API_KEY=sk-ant-...       # Drafter, Adversary, Consolidator
GOOGLE_AI_API_KEY=...              # Reviewer (Gemini 1.5 Pro)
PERPLEXITY_API_KEY=pplx-...        # Fact-checker (Sonar Pro)
OPENAI_API_KEY=sk-...              # Optional / future use
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx                   # Landing page
│   ├── layout.tsx                 # Root layout
│   ├── einspruch/
│   │   └── page.tsx               # Multi-step wizard UI
│   └── api/
│       ├── analyze/route.ts       # Document analysis endpoint
│       └── generate/route.ts      # Multi-agent pipeline endpoint
├── lib/
│   └── agents.ts                  # Multi-agent orchestrator (core engine)
├── types/
│   └── index.ts                   # TypeScript type definitions
└── components/                    # Reusable UI components (TODO)
```

## Roadmap

- [ ] Use-case selector (Bescheid type chooser at start of flow)
- [ ] Per-use-case system prompts (AO, SGB, BGB, OWiG, KSchG)
- [ ] PDF/OCR document processing
- [ ] Streaming responses with per-agent live progress
- [ ] DOCX export with proper formal letter formatting
- [ ] User authentication (NextAuth)
- [ ] PostgreSQL + pgvector for Fachliteratur-RAG
- [ ] Steuerberater / Anwalt review & approval workflow
- [ ] German legal knowledge base (BFH, BAG, BSG case law)
- [ ] Deadline tracking (Einspruchs- / Widerspruchsfristen)

## License

Proprietary – All rights reserved.
