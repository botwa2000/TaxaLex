# Platform User Flow — Comprehensive Specification

> Living document. Update when flows change. All screens reference `src/app/` routes.

---

## Table of Contents

1. [User Roles & Permissions](#1-user-roles--permissions)
2. [Onboarding & Authentication](#2-onboarding--authentication)
3. [Dashboard — Home Screen](#3-dashboard--home-screen)
4. [Case Creation & Appeal Management](#4-case-creation--appeal-management)
5. [AI Generation Pipeline](#5-ai-generation-pipeline)
6. [Document Management](#6-document-management)
7. [Review, Edit & Submission](#7-review-edit--submission)
8. [Deadline & Status Tracking](#8-deadline--status-tracking)
9. [Payment & Pricing](#9-payment--pricing)
10. [Tax Advisor / Lawyer Connectivity](#10-tax-advisor--lawyer-connectivity)
11. [Notifications & Communications](#11-notifications--communications)
12. [Account & Profile Management](#12-account--profile-management)
13. [Admin Panel](#13-admin-panel)
14. [Edge Cases & Error States](#14-edge-cases--error-states)
15. [Entity State Machines](#15-entity-state-machines)
16. [Missing Pieces / Future Considerations](#16-missing-pieces--future-considerations)

---

## 1. User Roles & Permissions

### Role Hierarchy

```
Guest
  └─ User (registered, free tier)
       └─ User Pro (paid)
            └─ User Business (multi-case subscription)
Tax Advisor (professional account, verified)
  └─ Advisor Senior (can take on clients directly)
Lawyer (professional account, verified, bar membership)
Admin
  └─ Super Admin
```

### Permission Matrix

| Action | Guest | User Free | User Pro | Advisor | Lawyer | Admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Preview landing, use-case info | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create case (1) | — | ✓ (1 free) | ✓ | — | — | ✓ |
| Create unlimited cases | — | — | ✓ | — | — | ✓ |
| Download generated letter | — | ✓ | ✓ | ✓ | ✓ | ✓ |
| Edit generated letter | — | — | ✓ | ✓ | ✓ | ✓ |
| Assign case to advisor | — | ✓ | ✓ | — | — | ✓ |
| Accept / review assigned case | — | — | — | ✓ | ✓ | ✓ |
| Add legal comments to case | — | — | — | ✓ | ✓ | ✓ |
| Countersign / approve letter | — | — | — | ✓ | ✓ | — |
| View all platform cases | — | — | — | — | — | ✓ |
| Manage advisors | — | — | — | — | — | ✓ |
| Access billing dashboard | — | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## 2. Onboarding & Authentication

### 2.1 Guest → Registration

```
Landing page
  │
  ├─ "Kostenlos starten" CTA
  │     │
  │     ▼
  │   Registration modal / page
  │     ├─ Email + password
  │     ├─ OR: Google OAuth
  │     ├─ OR: Apple Sign-In
  │     │
  │     ▼
  │   Email verification sent
  │     │
  │     ▼
  │   Verify email (link click)
  │     │
  │     ▼
  │   Onboarding wizard (first-time only)
  │     ├─ Step 1: Language preference
  │     ├─ Step 2: "What brings you here?" (use-case selector)
  │     ├─ Step 3: Brief profile (name, optional Steuer-ID)
  │     └─ Step 4: Freemium explainer (what's free, what's paid)
  │           │
  │           ▼
  │         Dashboard (first case pre-started based on Step 2 selection)
  │
  └─ "Ich bin Steuerberater / Anwalt" link
        │
        ▼
      Professional registration (see §10.1)
```

### 2.2 Login

```
Login page
  ├─ Email + password
  ├─ Google / Apple OAuth
  ├─ "Passwort vergessen?" → email reset link (expires 1h)
  │
  └─ Success → redirect to last active case OR dashboard
```

### 2.3 Session & Security

- JWT access token (15 min) + refresh token (30 days, httpOnly cookie)
- Optional: TOTP 2FA (users with advisor-assigned cases should be encouraged to enable)
- Rate limit: 5 failed logins → 15 min lockout
- Session list visible in account settings (revoke individual sessions)

---

## 3. Dashboard — Home Screen

### Layout

```
┌─────────────────────────────────────────────────────┐
│  [Logo]          Notifications (bell)   Avatar menu │
├──────────────┬──────────────────────────────────────┤
│              │  OVERVIEW CARDS                       │
│  Sidebar     │  ┌──────────┐ ┌──────────┐ ┌──────┐  │
│              │  │ Open     │ │ Deadline │ │ Saved│  │
│  Dashboard   │  │ Cases: 2 │ │ in 3d: 1 │ │  €   │  │
│  My Cases    │  └──────────┘ └──────────┘ └──────┘  │
│  Documents   │                                       │
│  Advisors    │  MY CASES                             │
│  Billing     │  ┌─────────────────────────────────┐ │
│  Settings    │  │ Steuerbescheid 2023  [Draft]  →  │ │
│              │  │ Deadline: 12 days               │ │
│              │  ├─────────────────────────────────┤ │
│              │  │ Bußgeldbescheid     [Submitted] │ │
│              │  └─────────────────────────────────┘ │
│              │                                       │
│              │  [+ Neue Anfrage starten]             │
└──────────────┴──────────────────────────────────────┘
```

### Dashboard States

| State | What user sees |
|---|---|
| New user, no cases | Empty state + prominent "Erste Anfrage starten" CTA |
| Has draft cases | Case cards with deadline countdown |
| Has submitted cases | Status badges (Eingereicht / Antwort ausstehend / Erfolgreich) |
| Deadline warning (<7 days) | Red banner with case name and deadline |
| Advisor message waiting | Notification dot on case card |

---

## 4. Case Creation & Appeal Management

### 4.1 Use-Case Selection (Step 0)

```
"Neue Anfrage starten"
  │
  ▼
Use-Case Selector
  ├─ Steuerbescheid           → prompts: AO §347, BFH
  ├─ Jobcenter / Bürgergeld   → prompts: SGB II/III §§ 83-87
  ├─ Rentenbescheid           → prompts: SGB VI §§ 78-85
  ├─ Bußgeldbescheid          → prompts: OWiG §§ 67-71
  ├─ Krankenversicherung      → prompts: SGB V §§ 78-85
  ├─ Kündigung                → prompts: KSchG §§ 1-26
  └─ Mieterhöhung / Kaution   → prompts: BGB §§ 558-559
```

Each use case sets:
- System prompt set in agents pipeline
- Required document checklist
- Standard follow-up questions
- Applicable deadlines (e.g. Einspruchsfrist = 1 month from Bescheid date)

### 4.2 Case Lifecycle

```
CREATED
  │
  ▼
UPLOADING (documents being added)
  │
  ▼
ANALYZING (AI extracting data, generating follow-up questions)
  │
  ▼
QUESTIONS (user answering follow-up questions)
  │
  ├─ Save as draft, continue later ──────────────┐
  │                                              │
  ▼                                              │
GENERATING (5-agent pipeline running)            │
  │                                              │
  ▼                                              │
DRAFT_READY (letter generated, user reviewing)   │
  │                                              │
  ├─ Edit letter (Pro users)                     │
  ├─ Request advisor review (→ §10)              │
  ├─ Save as draft ──────────────────────────────┘
  │
  ▼
APPROVED (user/advisor signed off)
  │
  ▼
SUBMITTED (user marks as sent to authority)
  │
  ├─ Upload submission confirmation
  │
  ▼
AWAITING_RESPONSE
  │
  ├─ Upload authority response document
  │
  ├─ Response: Full success  → CLOSED_SUCCESS
  ├─ Response: Partial       → CLOSED_PARTIAL (new case can be opened)
  ├─ Response: Rejected      → REJECTED (escalation options shown)
  └─ No response after 6 months → DEEMED_REJECTED (§347 AO hint shown)
```

### 4.3 Case Detail Screen

```
┌─────────────────────────────────────────────────────┐
│ ← Back   Steuerbescheid 2023   [Status badge]        │
├─────────────────────────────────────────────────────┤
│ TIMELINE (vertical)                                 │
│  ● 15.03.2024  Bescheid hochgeladen                 │
│  ● 15.03.2024  KI-Analyse abgeschlossen             │
│  ● 16.03.2024  Einspruch erstellt                   │
│  ○ —           Eingereicht beim Finanzamt           │
│  ○ —           Antwort erhalten                     │
├─────────────────────────────────────────────────────┤
│ DEADLINE COUNTER                                    │
│  ⚠ Einspruchsfrist: 12 Tage (bis 15.04.2024)       │
├─────────────────────────────────────────────────────┤
│ TABS: Dokumente | Einspruchsschreiben | Berater | Nachrichten │
└─────────────────────────────────────────────────────┘
```

---

## 5. AI Generation Pipeline

### 5.1 During Generation (UX)

```
Generating screen
  │
  ├─ Progress: each agent lights up as it completes
  │    ● Drafter (Claude)      ✓ done
  │    ● Reviewer (Gemini)     ✓ done
  │    ● FactChecker (Perplexity) ⟳ running
  │    ○ Adversary (Claude)    waiting
  │    ○ Consolidator (Claude) waiting
  │
  ├─ Estimated time shown
  ├─ User can leave — email notification when done
  └─ If any agent fails → error state with retry option
```

### 5.2 Regeneration

- User can trigger a full regeneration (consumes 1 credit on free tier)
- User can edit answers and re-generate
- All versions stored (v1, v2, v3...) — user can compare and restore

---

## 6. Document Management

### 6.1 Document Center (per case)

```
Documents tab
  │
  ├─ UPLOADED DOCUMENTS
  │   ┌─────────────────────────────────────────┐
  │   │ 📄 Steuerbescheid_2023.pdf  [Bescheid] │
  │   │    Uploaded 15.03 · 2.3 MB · OCR ✓     │
  │   │    [Preview] [Download] [Delete]        │
  │   ├─────────────────────────────────────────┤
  │   │ 📄 Jahresabschluss_2022.pdf [Beleg]    │
  │   │    Uploaded 15.03 · 5.1 MB · OCR ✓     │
  │   └─────────────────────────────────────────┘
  │   [+ Dokument hinzufügen]
  │
  └─ GENERATED DOCUMENTS
      ┌─────────────────────────────────────────┐
      │ 📝 Einspruch_v1_15.03.2024.pdf  [Draft]│
      │    Erstellt von KI · Claude/Gemini      │
      │    [Preview] [Download] [Edit]          │
      ├─────────────────────────────────────────┤
      │ 📝 Einspruch_v2_16.03.2024.pdf  [Final]│
      │    Überarbeitet von Steuerberater       │
      │    [Preview] [Download] [Sign & Submit] │
      └─────────────────────────────────────────┘
```

### 6.2 Document Types

| Type | Who uploads | Purpose |
|---|---|---|
| `bescheid` | User | The official notice being appealed |
| `jahresabschluss` | User | Annual financial statements |
| `beleg` | User | Supporting receipts/evidence |
| `vollmacht` | User/Advisor | Power of attorney for advisor representation |
| `einspruch_draft` | System (AI) | Generated letter, draft |
| `einspruch_final` | System/Advisor | Approved letter |
| `behoerden_antwort` | User | Authority's response |
| `advisor_notes` | Advisor | Professional annotations |
| `korrespondenz` | User/Advisor | Any follow-up correspondence |

### 6.3 Document Processing Flow

```
Upload
  │
  ▼
Virus scan (ClamAV or equivalent)
  │
  ├─ Infected → reject, alert user
  │
  ▼
MIME type validation (server-side)
  │
  ▼
Store in encrypted object storage (Hetzner Storage Box or S3-compatible)
  │
  ▼
OCR processing (PDF/image → text)
  │  Background job, user notified when done
  ▼
Text available for AI pipeline
  │
  ▼
Retention:
  ├─ Active case: kept
  ├─ Closed case: kept 7 years (§147 AO retention requirement)
  └─ User requests deletion → anonymize metadata, delete file
     (GDPR right to erasure balanced against legal retention)
```

### 6.4 Document Permissions

| Document | Owner | Advisor (assigned) | Other Advisors | Admin |
|---|:---:|:---:|:---:|:---:|
| User-uploaded Bescheid | R/W/D | R | — | R |
| AI-generated draft | R | R/W | — | R |
| Advisor notes | — | R/W | — | R |
| Final signed letter | R | R | — | R |
| Authority response | R/W | R | — | R |

---

## 7. Review, Edit & Submission

### 7.1 Letter Review Screen

```
Einspruchsschreiben tab
  │
  ├─ VERSION SELECTOR: v1 | v2 (current) | + Neu generieren
  │
  ├─ LETTER PREVIEW (formatted, paginated)
  │   [Sachverhalt] [Begründung] [Antrag]  ← section tabs
  │
  ├─ AGENT ANALYSIS PANEL (collapsible, right rail)
  │   ├─ Gemini Review: 3 issues found ⚠
  │   ├─ Perplexity FactCheck: 1 citation updated ℹ
  │   └─ Adversary: 2 risks (1 high, 1 low) ⚠
  │
  ├─ ACTIONS
  │   ├─ [Herunterladen .TXT]
  │   ├─ [Herunterladen .DOCX]     ← Pro only
  │   ├─ [Bearbeiten]              ← Pro only
  │   ├─ [An Berater senden]       ← opens advisor flow
  │   └─ [Als eingereicht markieren]
  │
  └─ OUTPUT LANGUAGE SELECTOR
      Default: Deutsch
      Warning shown if non-German selected
```

### 7.2 Inline Editor (Pro)

- Rich-text editor (e.g. TipTap) with legal formatting presets
- Track changes mode when advisor edits
- User can accept/reject individual changes
- Re-run FactCheck on edited version (Perplexity call only, not full pipeline)

### 7.3 Submission Flow

```
"Als eingereicht markieren"
  │
  ▼
Submission confirmation dialog
  ├─ Date of submission (defaults to today)
  ├─ Method: Post | Fax | ELSTER | In person
  ├─ Optional: Upload proof of sending (Einschreiben-Scan)
  │
  ▼
Case status → SUBMITTED
  │
  ▼
Deadline tracker activates:
  ├─ 3-month response window (FA Bearbeitungszeit)
  ├─ Reminder at 10 weeks: "No response yet — check status"
  └─ At 6 months: "Duldung nach §347 AO — considered rejected"
```

---

## 8. Deadline & Status Tracking

### 8.1 Critical Deadlines by Use Case

| Use Case | Deadline | Law |
|---|---|---|
| Steuerbescheid | 1 month from Bescheid date | §355 AO |
| Jobcenter Bescheid | 1 month from delivery | §84 SGG |
| Rentenbescheid | 1 month from delivery | §84 SGG |
| Bußgeldbescheid | 2 weeks from delivery | §67 OWiG |
| Krankenversicherung | 1 month from delivery | §84 SGG |
| Kündigung | 3 weeks from receipt | §4 KSchG |
| Mieterhöhung | 2 months to respond | §558b BGB |

### 8.2 Deadline Notification Schedule

```
Bescheid date entered
  │
  ▼
System calculates Einspruchsfrist
  │
  ├─ T-14 days: first email reminder
  ├─ T-7 days:  email + in-app banner (orange)
  ├─ T-3 days:  email + in-app banner (red) + SMS (if opted in)
  ├─ T-1 day:   urgent email + push notification
  └─ T=0:       "Frist abgelaufen" warning — options shown:
                  ├─ Wiedereinsetzungsantrag (§110 AO)
                  └─ Consult lawyer CTA
```

### 8.3 Case Status Board (Kanban View)

```
In Bearbeitung | Eingereicht | Antwort ausstehend | Abgeschlossen
─────────────────────────────────────────────────────────────────
[Case A]       [Case B]      [Case C]             [Case D ✓]
Deadline: 5d   Sent: 12.03   Since: 45 days       Success
```

---

## 9. Payment & Pricing

### 9.1 Pricing Tiers

| Tier | Price | Cases | Features |
|---|---|---|---|
| **Free** | €0 | 1 | Full AI pipeline, TXT download, 7-day access |
| **Pro** | €19.90/case | Unlimited (pay-per-case) | + DOCX, edit, all use cases, advisor access |
| **Flat** | €49/month | Unlimited | Everything in Pro + priority queue |
| **Business** | €149/month | Unlimited | + team accounts, white-label, API access |
| **Advisor** | €79/month | N/A (reviewing only) | Advisor dashboard, client management |

### 9.2 Payment Flow

```
User clicks "Pro freischalten" or hits a Pro-gated feature
  │
  ▼
Pricing modal
  ├─ Pay-per-case: Stripe Checkout (one-time)
  └─ Subscription: Stripe Billing (recurring)
        │
        ▼
      Stripe hosted checkout
        │
        ├─ Payment methods: Card, SEPA Debit, Klarna, Sofort, PayPal
        │
        ▼
      Webhook: payment_intent.succeeded
        │
        ▼
      Activate entitlement in DB
        │
        ▼
      Send receipt (Rechnung with VAT — MwSt-konform)
        │
        ▼
      Redirect to case / dashboard
```

### 9.3 Billing Management Screen

```
Billing page
  ├─ Current plan + next billing date
  ├─ Payment method (update/delete)
  ├─ Invoice history
  │   ┌──────────────────────────────────────┐
  │   │ 01.03.2024  €49.00  [Download PDF]  │
  │   │ 01.02.2024  €49.00  [Download PDF]  │
  │   └──────────────────────────────────────┘
  ├─ [Plan upgraden / downgraden]
  └─ [Kündigen] → cancellation flow with retention offer
```

### 9.4 Edge Cases

- Payment failed → retry logic (3 attempts over 7 days) → downgrade to free, data retained
- Refund: within 14 days if letter not yet downloaded (EU consumer law)
- VAT: B2C Germany 19% MwSt; EU B2B: reverse charge; non-EU: no VAT
- Advisor revenue share: 70% to advisor, 30% platform (configurable in admin)

---

## 10. Tax Advisor / Lawyer Connectivity

### 10.1 Professional Onboarding

```
"Ich bin Steuerberater / Anwalt" registration
  │
  ▼
Professional registration form
  ├─ Name, firm name, address
  ├─ Profession: Steuerberater | Steuerberater (PartG) | Rechtsanwalt | Fachanwalt (Steuerrecht)
  ├─ Berufsregisternummer (Steuerberaterkammer / Rechtsanwaltskammer)
  ├─ DATEV Berater-Nr (optional, for Steuerberater)
  └─ Upload: Berufsausweis / Zulassungsbescheinigung
        │
        ▼
      Manual verification by platform admin (target: 24h)
        │
        ├─ Verified → Advisor account activated, welcome email
        └─ Rejected → Reason sent, can resubmit
```

### 10.2 Advisor Marketplace

```
User on case detail screen
  │
  └─ "Berater hinzuziehen"
        │
        ▼
      Advisor directory (filterable)
        ├─ Filter: Steuerberater | Rechtsanwalt | Fachanwalt Steuerrecht
        ├─ Filter: Sprache (DE, EN, TR, RU, AR...)
        ├─ Filter: Spezialisierung (Ertragsteuer, Umsatzsteuer, Strafrecht...)
        ├─ Sort: Rating | Response time | Price
        │
        ├─ Advisor card:
        │   ┌──────────────────────────────────────┐
        │   │ [Avatar]  Max Mustermann             │
        │   │           Steuerberater              │
        │   │           ★★★★☆ (42 reviews)        │
        │   │           Ø Antwortzeit: 4h          │
        │   │           Ab €150/Fall               │
        │   │           Sprachen: DE, EN            │
        │   │           [Anfragen] [Profil]         │
        │   └──────────────────────────────────────┘
        │
        └─ "Anfragen" clicked → assignment flow
```

### 10.3 Case Assignment Flow

```
User requests advisor review
  │
  ▼
Confirm sharing dialog
  ├─ "Sie teilen folgende Dokumente mit dem Berater:"
  │   ├─ [x] Steuerbescheid (required)
  │   ├─ [x] KI-generierter Einspruch
  │   └─ [ ] Jahresabschluss (optional)
  ├─ Advisor fee shown (fixed price or hourly estimate)
  └─ [Bestätigen & Zahlung autorisieren]
        │
        ▼
      Payment pre-authorized (held, not charged until advisor accepts)
        │
        ▼
      Advisor notified (email + in-app)
        │
        ├─ Advisor accepts (within 24h SLA) → payment captured
        │       │
        │       ▼
        │     Case status → ADVISOR_REVIEW
        │
        └─ Advisor declines / no response in 24h → pre-auth released
                │
                ▼
              User prompted to choose another advisor
```

### 10.4 Advisor Review Workspace

```
Advisor dashboard → assigned case
  │
  ├─ READ: all shared documents + AI-generated letter
  ├─ READ: AI agent analysis (Gemini review, Perplexity fact-check, adversary)
  │
  ├─ WRITE: Track-changes on the letter (TipTap)
  ├─ WRITE: Advisor notes (internal, not shared with user unless published)
  ├─ WRITE: Secure messages to user (in-app + email)
  │
  ├─ REQUEST: Additional documents from user
  │
  ├─ APPROVE: Sign off on letter → status ADVISOR_APPROVED
  │   ├─ Digital signature (qualified electronic signature, QES, via DocuSign/eIDAS)
  │   └─ Advisor badge shown on final document
  │
  └─ ESCALATE: "Klage erforderlich" → flag case, recommend next steps
```

### 10.5 Collaboration Timeline (Shared View)

```
Case timeline (user and advisor see same view)
  │
  ├─ 15.03  Bescheid hochgeladen (User)
  ├─ 15.03  KI-Analyse abgeschlossen
  ├─ 16.03  Berater Max Mustermann zugewiesen
  ├─ 16.03  [ADVISOR] Dokument angefordert: Kontoauszug 2022
  ├─ 17.03  Kontoauszug hochgeladen (User)
  ├─ 18.03  [ADVISOR] Überarbeiteter Einspruch hochgeladen
  ├─ 18.03  [ADVISOR] Freigabe erteilt ✓ (digital signiert)
  └─ 19.03  Als eingereicht markiert (User)
```

### 10.6 Lawyer-Specific Flow (Rechtsanwalt)

Additional capabilities vs Steuerberater:
- Can represent client formally (Vollmacht upload required)
- Can file via beA (besonderes elektronisches Anwaltspostfach) — future integration
- Can advise on Klage beim Finanzgericht if Einspruch fails
- Mandatory: "Ich berate im Rahmen meiner anwaltlichen Tätigkeit" disclaimer shown

---

## 11. Notifications & Communications

### 11.1 Notification Types

| Event | In-App | Email | SMS (opt-in) | Push (opt-in) |
|---|:---:|:---:|:---:|:---:|
| Case generation complete | ✓ | ✓ | — | ✓ |
| Deadline warning (14d) | ✓ | ✓ | — | — |
| Deadline warning (3d) | ✓ | ✓ | ✓ | ✓ |
| Advisor accepted case | ✓ | ✓ | — | ✓ |
| Advisor message | ✓ | ✓ | — | ✓ |
| Advisor approved letter | ✓ | ✓ | — | ✓ |
| Document requested by advisor | ✓ | ✓ | — | ✓ |
| Payment confirmed | ✓ | ✓ | — | — |
| Payment failed | ✓ | ✓ | ✓ | ✓ |
| Authority response uploaded | ✓ | ✓ | — | ✓ |
| Account security (new login) | — | ✓ | ✓ | — |

### 11.2 In-App Messaging (User ↔ Advisor)

- Threaded per case (not cross-case)
- Attachment support (documents shared within the case scope only)
- Read receipts
- Advisor response SLA visible to user (e.g. "Antwortet in Ø 4 Stunden")
- Archive on case close

---

## 12. Account & Profile Management

### 12.1 Profile Screen

```
Settings → Profil
  ├─ Name, email (change requires re-verification)
  ├─ Language preference (UI language)
  ├─ Default output language for letters
  ├─ Notification preferences
  ├─ 2FA setup (TOTP)
  ├─ Active sessions (revoke)
  └─ Connected accounts (Google, Apple)
```

### 12.2 Data & Privacy

```
Settings → Datenschutz
  ├─ Download my data (GDPR Art. 20 — all cases, documents, messages as ZIP)
  ├─ Delete my account
  │   ├─ Open cases: must close or transfer to advisor first
  │   ├─ Documents: deleted immediately
  │   ├─ Billing records: retained 10 years (§147 AO / HGB)
  │   └─ Account anonymized, email purged
  └─ Cookie preferences
```

---

## 13. Admin Panel

### 13.1 Admin Dashboard

```
/admin
  ├─ METRICS
  │   ├─ Cases today / week / month
  │   ├─ Conversion: free → paid
  │   ├─ AI pipeline avg duration & error rate
  │   └─ Revenue (MRR, churn)
  │
  ├─ CASES (all platform cases)
  │   ├─ Search by user, case ID, Finanzamt, status
  │   └─ Flag for manual review
  │
  ├─ USERS
  │   ├─ Search, view, impersonate (for support)
  │   └─ Suspend / delete
  │
  ├─ ADVISORS
  │   ├─ Pending verification queue
  │   ├─ Approve / reject with notes
  │   └─ Ratings oversight, dispute resolution
  │
  ├─ PAYMENTS
  │   ├─ Revenue, refunds, disputes
  │   └─ Manual credit (e.g. for support issues)
  │
  └─ SYSTEM
      ├─ AI provider status (health check per provider)
      ├─ Feature flags (enable/disable use cases, payment tiers)
      └─ Audit log (all admin actions)
```

---

## 14. Edge Cases & Error States

| Scenario | System behaviour |
|---|---|
| Deadline already passed at upload | Warning shown, Wiedereinsetzungsantrag option, lawyer CTA |
| AI pipeline partially fails (1 agent errors) | Retry that agent only; if persistent, proceed with available results + warning |
| Document OCR fails | Show "OCR fehlgeschlagen", allow manual text paste, fallback to file-only processing |
| Advisor goes inactive mid-case | Notify user, offer replacement or refund within 48h |
| Payment disputed (chargeback) | Case locked, user notified, support ticket auto-created |
| User uploads wrong document type | Client-side MIME check + server-side validation, clear error with accepted types listed |
| User loses 2FA device | Recovery codes (shown at 2FA setup), support identity verification process |
| Letter > 10 pages | Warn user, offer "Kurzfassung" mode with only critical sections |
| Authority response is partial approval | System suggests opening second case for the remaining contested amount |
| GDPR deletion request with open cases | Queue deletion until cases resolved or user explicitly closes them |

---

## 15. Entity State Machines

### Case

```
CREATED → UPLOADING → ANALYZING → QUESTIONS → GENERATING
    ↑                                               │
    └─────────────── DRAFT (save) ─────────────────┘
                                                    ↓
                                              DRAFT_READY
                                                    │
                              ┌─────────────────────┤
                              ↓                     ↓
                        ADVISOR_REVIEW          APPROVED
                              │                     │
                              ↓                     ↓
                        ADVISOR_APPROVED       SUBMITTED
                              │                     │
                              └──────────┬──────────┘
                                         ↓
                                  AWAITING_RESPONSE
                                         │
                    ┌────────────────────┼───────────────────┐
                    ↓                    ↓                    ↓
              CLOSED_SUCCESS      CLOSED_PARTIAL         REJECTED
```

### Document

```
UPLOADING → SCANNING → PROCESSING_OCR → READY
                │
                └→ INFECTED (quarantined, user notified)
```

### Advisor Assignment

```
REQUESTED → PENDING_ADVISOR_ACCEPT → ACCEPTED → IN_REVIEW → APPROVED
                        │                                       │
                        └→ DECLINED / EXPIRED                   └→ CLOSED
```

### Payment

```
PENDING → AUTHORIZED → CAPTURED → SETTLED
              │              │
              └→ CANCELLED   └→ REFUNDED / DISPUTED
```

---

## 16. Missing Pieces / Future Considerations

### Must-have before public launch
- [ ] ELSTER API integration (direct digital submission to Finanzamt)
- [ ] Qualified Electronic Signature (QES) via eIDAS-compliant provider
- [ ] beA integration (lawyer electronic mailbox, mandatory for Rechtsanwälte)
- [ ] DATEV export (Steuerberater data exchange format)
- [ ] Accessibility audit (WCAG 2.1 AA) — legal requirement for public-facing German services

### High-value near-term
- [ ] Outcome tracking ("Did your appeal succeed?") — builds trust/marketing data
- [ ] Success rate analytics per use case, per Finanzamt, per argument type
- [ ] Template library (common Einspruchs-Argumente reusable across cases)
- [ ] Calendar integration (Google/Outlook) for deadline export
- [ ] Browser extension: detect Bescheid PDFs in email, one-click "Start Einspruch"

### Business model expansions
- [ ] White-label for Lohnsteuerhilfevereine and Steuerberatungsgesellschaften
- [ ] API access (B2B) for accounting software (Lexware, DATEV, Agenda) to embed the engine
- [ ] Affiliate/referral program (user refers advisor, gets credit)
- [ ] Case outcome insurance (Prozesskostenversicherung partnership)

### Data & AI improvements
- [ ] PostgreSQL + pgvector RAG over BFH/FG case law corpus
- [ ] Fine-tuned model on successful Einspruch outcomes
- [ ] Automatic detection of Bescheid errors (ML classification before user reads it)
- [ ] Streaming responses (server-sent events) so agents appear to write in real time
