# TaxAlex — Product Strategy & Build Guide

**Last Updated:** 2026-03-29
**Status:** Pre-build / Mockup phase
**Live URLs:** https://taxalex.de · https://dev.taxalex.de
**Repo:** github.com/botwa2000/TaxPax

---

## 1. What TaxAlex Is

An AI-powered tax objection letter generator for the DACH region (Germany, Austria, Switzerland).
Users upload a tax assessment notice, the app identifies grounds for appeal, and generates a
legally-structured objection letter ready to send to the tax authority — in minutes, not days.

**Core insight:** 3.3 million Einsprüche were filed in Germany in 2020 alone. Over two-thirds
were at least partially successful. Not a single consumer-grade AI product owns this space.

---

## 2. The Competitive Landscape

### What exists today

| Tool | Einspruch support | AI | English | Standalone* | DACH |
|---|---|---|---|---|---|
| WISO Steuer | Yes (via SteuerGPT) | Partial | No | No | DE only |
| SteuerSparErklärung | Named generator module | No | No | No | DE only |
| SteuerGo | Template letters | No | Yes | No | DE only |
| Taxfix | Static templates / guides | No | Yes | No | DE only |
| Lohnsteuer-Kompakt | Template letters | Partial | Yes | No | DE only |
| Accountable / finanzamt-brief.de | Explains letters only | Yes | Yes | Yes | DE only |
| DATEV Einspruchsgenerator | Full AI generation | Yes | No | No | DE only |
| Finanztip | Free static template | No | No | Yes | DE only |
| RelaxTax (AT) | None | No | Yes | — | AT only |
| myright.ch (CH) | Static Word template | No | No | Yes | CH only |

*Standalone = works regardless of how you originally filed your return

### The gaps we own

1. **The standalone problem**: Every incumbent requires you to have filed your return through
   their own software. Anyone who filed via ELSTER directly, through a Steuerberater, or through
   a different tool has no AI product to help them appeal. That is the majority of Einspruch filers.

2. **No English-first Einspruch generator exists**: Wundertax, SteuerGo, and Taxfix offer
   English filing — but their objection tools are templates at best, absent at worst. Germany
   has 13+ million foreign nationals. Zero dedicated English-first Einspruch tools exist.

3. **AI is either professional-only or superficial**: DATEV's Einspruchsgenerator is the only
   serious AI-powered letter generator — locked behind Steuerberater credentials. Consumer
   AI tools only explain what a notice says; none generate a reasoned objection.

4. **Austria and Switzerland are blank**: No dedicated app for Beschwerde (AT) or
   Einsprache (CH). Only government portals and static Word templates.

5. **No product combines all five**: analysis + AI generation + multilingual + standalone + DACH.
   TaxAlex can own all five simultaneously.

---

## 3. Target Users

### B2C

| Segment | Characteristics | Key need |
|---|---|---|
| **Employed individual (DE)** | German national, employed, receives Steuerbescheid | Fast, guided appeal; don't want to pay a Steuerberater for one letter |
| **Expat in DACH** | Foreign national, English preferred, unfamiliar with German tax system | English UI, German output, explanation of what the letter argues |
| **Self-employed / freelancer** | More complex returns, recurring appeals | Recurring use, possibly subscription |
| **Property owner** | Grundsteuer reform 2025 created wave of new assessments | Dedicated vertical; time-limited high-volume opportunity |

### B2B — Tax

| Segment | Characteristics | Key need |
|---|---|---|
| **Steuerberater (solo)** | Individual tax advisor, 20–100 clients | Bulk processing, client management, time saving |
| **Steuerberatungskanzlei** | Small/mid firm | White-label or firm account, multi-user |
| **Buchhalter / accountant** | Not licensed, handles basic cases | Basic appeal tool for clients |

### B2B — Legal

| Segment | Characteristics | Key need |
|---|---|---|
| **Fachanwalt für Steuerrecht** | Tax lawyer, handles Finanzgericht cases | Letter drafting for court prep, different templates |
| **General lawyer** | Handles some tax disputes | Same as above |

### B2B — Corporate

| Segment | Characteristics | Key need |
|---|---|---|
| **HR / Payroll** | Companies with expat workforce | Employee tax support as a benefit; bulk volume |
| **CFO / In-house finance** | Corporate tax disputes (KStG) | Different legal framework; enterprise pricing |

### Priority for launch
1. Employed individuals + expats (volume, simple cases, validates core product)
2. Steuerberater (B2B revenue, validates with professionals)
3. Lawyer tier (waitlist/manual initially)
4. Corporate/HR (needs more product maturity)

---

## 4. User Flows

### Onboarding
```
Landing → Who are you?
├── I received a tax notice        → private flow
├── I'm a tax advisor              → advisor flow
├── I'm a lawyer / legal firm      → legal flow
└── I have a Grundsteuer notice    → Grundsteuer vertical
```

### Private User Flow (core)
```
1. Sign up / Login (Gmail · Apple · Facebook)
2. Select region (DE / AT / CH)
3. Upload tax notice (Steuerbescheid / Finanzbescheid / Veranlagungsverfügung)
4. AI analyzes: identifies deviations and grounds for appeal
5. Show results:
   - "We found 3 grounds for appeal"
   - Estimated refund range
   - DEADLINE COUNTDOWN: "You have 23 days to file"
6. User selects which grounds to include
7. AI generates formal letter (always in German regardless of UI language)
8. [GATE] Show blurred preview → Pay to unlock full letter
9. Download PDF / Copy text
10. Optional: Add lawyer review (+€49, 24h turnaround)
11. Optional: Submit via ELSTER (placeholder → waitlist)
12. Appeal saved to history with status tracking
```

### Tax Advisor Flow
```
1. Sign up as professional → verify (email domain or Steuernummer)
2. Advisor dashboard → client list
3. Add client → upload their tax notice
4. Same analysis flow as private, but on behalf of client
5. Letter generated in client's name
6. Download / send to client or submit for them
7. Bulk view: all open appeals, deadlines, statuses
8. Template manager: save custom letter variations
9. Billing: flat monthly fee, unlimited appeals
```

### Escalation / Lawyer Flow
```
Finanzamt rejects appeal → TaxAlex notifies user
→ "Your appeal was rejected. Next step: Finanzgericht."
→ Option A: Connect with partner lawyer (referral marketplace)
→ Option B: Generate Klageschrift draft (Finanzgericht) — premium
→ Option C: Download case file for your own lawyer
```

---

## 5. Portal Structure

### Public (marketing)
```
/                          Landing — value prop, social proof, CTA
/wie-es-funktioniert       How it works (3-step visual)
/preise                    Pricing
/fuer-steuerberater        Advisor landing page
/fuer-expats               Expat-specific landing (EN/DE)
/grundsteuer               Grundsteuer vertical landing
/blog                      SEO content hub
/blog/[slug]               Individual articles (per objection type)
```

### App (authenticated)
```
/app/dashboard             Home: open appeals, deadlines, quick-start CTA
/app/appeal/new            Start a new appeal (upload + flow)
/app/appeal/[id]           View / edit / download a specific appeal
/app/appeals               Appeal history + statuses
/app/documents             Document vault (uploaded notices)
/app/settings              Profile, language, region, billing
/app/billing               Subscription, payment history, invoices
```

### Advisor (authenticated, professional account)
```
/advisor/dashboard         Client list + all deadlines
/advisor/clients/new       Add client
/advisor/clients/[id]      Per-client view + appeal history
/advisor/appeals           All appeals across all clients
/advisor/templates         Custom letter template manager
/advisor/settings          Firm details, team members, API access
/advisor/billing           Subscription management
```

---

## 6. Monetization

### Individual users — Pay-to-unlock

Do NOT use subscription for one-time users. Generate the full letter, then gate it:

1. Upload → analyze → show results (grounds found, estimated refund)
2. Show blurred letter preview with structure visible
3. "Unlock your letter" → one-time payment

Suggested pricing:
- Standard letter: **€29**
- Standard + lawyer review (24h): **€79**
- Unlimited plan (annual, for self-employed): **€79/year**

### Tax advisors — Subscription

- Solo plan: **€49/month** — unlimited appeals, client management
- Firm plan: **€149/month** — multi-user, white-label, API access
- Annual discount: 2 months free

### Lawyer marketplace — Revenue share

- User pays lawyer **€49–149** for letter review or Finanzgericht prep
- TaxAlex takes **25–30%**
- Lawyers get qualified, pre-analyzed leads — better than cold cases

### Future
- Enterprise / HR: custom pricing
- API access for third-party integrations
- ELSTER direct submission (once certified): premium add-on

---

## 7. Document Storage

Store, but with user control.

- All uploaded documents encrypted at rest (AES-256), per-user keys
- Users can delete any document or their entire account at any time (GDPR)
- Default retention: 12 months, then auto-delete (configurable)
- Option to connect Google Drive or OneDrive — store in user's own cloud, nothing on our servers
- Tax advisors: documents stored per client, accessible to advisor account only
- Final generated letters: stored as PDF in the user's vault

Do NOT store documents in plaintext. Do NOT retain anything after user deletion.

---

## 8. Regional Strategy

**Phase 1 (launch): Germany only**

DE is the largest market (83M population, highest Einspruch volume) and has the most
developed legal framework for AI tools to work with.

**Phase 2: Austria**

Similar legal system (AO-equivalent: BAO), FinanzOnline as the submission portal.
Key difference: appeal is called Beschwerde, goes to Bundesfinanzgericht (BFG).
Relatively easy to add as a region toggle once DE templates are solid.

**Phase 3: Switzerland**

Hardest — cantonal tax law means ~26 different frameworks. Start with major cantons
(Zurich, Bern, Vaud). No unified submission portal. High-income market justifies the complexity.

### Region affects:
- Letter template (different legal references, authority names, deadlines)
- AI prompt (region-specific legal context)
- UI labels (Einspruch / Beschwerde / Einsprache)
- Deadline logic (DE: 1 month, AT: 1 month, CH: 30 days cantonal)
- Submission options (ELSTER / FinanzOnline / cantonal portals)

Implementation: `region` field on each case, template and prompt selection by region.

---

## 9. Language Strategy

**UI language**: Full multilingual support. User selects preferred language in profile;
default detected from browser locale. Priority languages for UI translation:
DE, EN, RU, PL, RO, TR, AR, UK, FR, ES, IT (cover the largest expat communities in DACH).

**Input**: Any language. User can upload documents, type descriptions, or answer questions
in whatever language they are comfortable with. No restriction. The AI handles translation
and legal reasoning internally.

**Document OCR**: Tax notices are always in German/French/Italian (CH) or German (DE/AT).
OCR extracts the German text; the user's chosen language only affects the UI and summaries.

**Processing**: AI always reasons in the DE/AT/CH legal context regardless of input language.
The prompt is constructed in German for legal accuracy; input context is translated internally.

**Output letter**: Always formal German (DE/AT) or German/French/Italian (CH) —
this is a legal requirement and cannot be changed. The letter must be in the language of
the tax authority.

**User-facing summary**: Shown in the user's chosen language alongside the formal letter.
Explains what each argument means, what the user is claiming, and what to expect.
This is the key differentiator — a Turkish expat in Munich gets the full letter in German
plus a plain-language summary in Turkish explaining exactly what they are submitting.

**Lawyer review**: If the user requests lawyer review, the lawyer receives the German letter
plus an internal EN summary. The lawyer communicates with the user in the user's language
if possible (language preference shown to matched lawyers).

**SEO**: German-language content for high-volume DE keywords. English content for expat
segment. Consider landing pages in RU, PL, RO for the largest non-German expat groups —
virtually no competition exists for those languages in this space.

---

## 10. Integrations

### Phase 1 (mockup): Placeholders only
Show integration UI, capture interest / waitlist signups.

### Phase 2: ELSTER (Germany)
- Direct electronic submission of Einspruch
- Requires official ERIC certification from German tax authority
- Complex process (6–12 months minimum) — plan early

### Phase 3: FinanzOnline (Austria)
- Simpler API than ELSTER, similar concept

### Phase 4: DATEV
- Export case data to DATEV format for advisors who use it
- Not letter generation (DATEV has their own) — data portability

### Payment
- Stripe (already configured in Docker secrets)

### Auth
- NextAuth with Google, Apple, Facebook providers

### Document processing
- OCR for uploaded PDFs (tax notices are often scanned)
- Consider AWS Textract or Azure Document Intelligence for German-language OCR accuracy

### AI
- Anthropic Claude for letter generation (API key already in secrets)
- OpenAI as fallback / comparison (already in secrets)

---

## 11. Compliance & Legal

**RDG (Rechtsdienstleistungsgesetz)**: TaxAlex is a drafting tool, not legal advice.
Every letter and output must include: "Dieses Schreiben wurde mit KI-Unterstützung erstellt und
stellt keine Rechtsberatung oder Steuerberatung dar."

**GDPR**:
- Cookie consent banner
- Privacy policy covering AI processing of tax documents
- Data processing agreement (DPA) for B2B advisor accounts
- Right to erasure implemented for all user data and documents
- Data residency: EU servers only (Hetzner DE is compliant)

**Tax disclaimer**: Partner with a licensed Steuerberater for content review and as a trust signal.
Consider having a Steuerberater listed as "fachlich geprüft" (professionally reviewed).

**Finanzgericht note**: Letters for Finanzgericht proceedings (level 2 appeal) carry higher legal
risk. Always recommend lawyer review before submission at this stage.

---

## 12. SEO Strategy

### High-value German keywords
- "Einspruch Steuerbescheid" (~8,000/mo)
- "Einspruch Steuerbescheid Muster" (~4,000/mo)
- "Einspruchsfrist Finanzamt" (~2,500/mo)
- "Steuereinspruch einlegen" (~2,000/mo)
- "Widerspruch Steuerbescheid" (common misnomer → capture and redirect)

### Expat / English keywords
- "appeal tax notice Germany" (low competition, high intent)
- "Einspruch in English"
- "Germany tax assessment letter English"
- "expat tax appeal Germany"

### Vertical landing pages (one per objection ground)
- "Einspruch Homeoffice-Pauschale"
- "Einspruch Pendlerpauschale"
- "Einspruch Grundsteuer 2025"
- "Einspruch Schätzungsbescheid"
- "Einspruch Verspätungszuschlag"

Each page: what the issue is, who it affects, how TaxAlex solves it, direct CTA.

---

## 13. Trust Signals

- Number of letters generated (show on landing page once live)
- "Durchschnittliche Rückerstattung: €1.100" (match SteuerGo's data point)
- Data security: GDPR badge, encrypted storage, EU servers
- "Fachlich geprüft von [Steuerberater Name]" once partnership confirmed
- Deadline urgency on dashboard (always show days remaining)
- No dark patterns — show price before generating, not after

---

## 14. Build Order (Mockup Phase)

All UI is static / mock data at this stage. No real API calls, no real auth.
Goal: clickable end-to-end user journey for UX testing and demo.

1. **Landing page** — value prop, how it works, pricing, social proof, CTA
2. **Onboarding** — sign up form, user type selection, region selection
3. **Private user flow** — upload screen → analysis results → letter preview (blurred) → pay gate
4. **Advisor dashboard** — client list, per-client appeals, deadline list
5. **Document vault** — uploaded documents list, statuses
6. **Settings + billing UI** — profile, language toggle, subscription management
7. **Blog / SEO pages** — structure and navigation, placeholder articles
8. **Lawyer marketplace UI** — review request flow, placeholder lawyer profiles

Then layer in: real auth → real AI processing → real payments → real document storage → ELSTER.

---

## 15. Open Questions

- [ ] Grundsteuer as a separate vertical at launch or phase 2?
- [ ] Lawyer marketplace: build in-house or white-label a legal marketplace (e.g., Advocado)?
- [ ] Do we want a "no win, no fee" option like Taxefy (10% of refund)?
- [ ] Partnership with a licensed Steuerberater for content credibility — who?
- [ ] ELSTER certification: start the process early as it takes 6–12 months
- [ ] White-label offering for large Steuerberatungskanzleien?
- [ ] App Store presence (mobile) — phase 1 or phase 2?
- [ ] Grundsteuer notices — different format, different authority (Grundsteueramt vs Finanzamt)

---

## 16. Competitor Quick Reference

| Competitor | Our edge over them |
|---|---|
| WISO Steuer / SteuerSparErklärung | Standalone (no filing lock-in), English, AI-first |
| SteuerGo | AI generation (not just templates), DACH expansion, standalone |
| Taxfix | Actual integrated tool, not just support articles |
| Lohnsteuer-Kompakt | AI generation, DACH, self-employed coverage |
| Accountable / finanzamt-brief.de | We generate the response, not just explain the notice |
| DATEV Einspruchsgenerator | Consumer-accessible, English, no professional credentials needed |
| Finanztip | Personalized AI letter vs one-size-fits-all template |
| Austrian/Swiss tools | We exist (they effectively don't) |
