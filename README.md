# TaxPax – KI-gestützter Steuer-Einspruch

Multi-agent AI platform that generates legally sound tax objection letters (Einspruchsschreiben) for the German market.

## How it works

1. **Upload** your Steuerbescheid and supporting documents
2. **AI Analysis** extracts data and asks targeted follow-up questions
3. **Multi-Agent Pipeline** runs 4 AI agents:
   - **Drafter** (Claude) – creates initial objection letter
   - **Reviewer** (GPT-4o) – checks for legal/math errors
   - **Adversary** (Claude) – attacks from Finanzamt perspective
   - **Consolidator** (Claude) – produces final bulletproof version
4. **Download** your ready-to-submit Einspruchsschreiben

## Tech Stack

- **Next.js 15** (React 19, App Router, TypeScript)
- **Tailwind CSS** for styling
- **Anthropic Claude** + **OpenAI GPT-4o** for multi-agent AI
- **Hetzner Cloud** for GDPR-compliant hosting

## Quick Start

```bash
# Clone the repo
git clone https://github.com/botwa2000/TaxPax.git
cd TaxPax

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Tailwind + CSS vars
│   ├── einspruch/
│   │   └── page.tsx          # Multi-step wizard UI
│   └── api/
│       ├── analyze/route.ts  # Document analysis endpoint
│       └── generate/route.ts # Multi-agent pipeline endpoint
├── lib/
│   └── agents.ts             # Multi-agent orchestrator (core engine)
├── types/
│   └── index.ts              # TypeScript type definitions
└── components/               # Reusable UI components (TODO)
```

## Roadmap

- [ ] PDF/OCR document processing
- [ ] User authentication (NextAuth)
- [ ] PostgreSQL + pgvector for Fachliteratur-RAG
- [ ] Steuerberater review/approval workflow
- [ ] DOCX export with proper formatting
- [ ] Streaming responses for real-time progress
- [ ] German tax law knowledge base

## License

Proprietary – All rights reserved.
