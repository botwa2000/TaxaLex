-- Migration: advisor_flow
-- Creates enums, extends Case + User, adds AdvisorAssignment, HandoffPacket, CaseAnnotation

-- ── New Enums ─────────────────────────────────────────────────────────────────

CREATE TYPE "ViabilityScore" AS ENUM ('HIGH', 'MEDIUM', 'LOW');
CREATE TYPE "AdvisorAssignmentStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'CHANGES_REQUESTED', 'APPROVED', 'FINALIZED');
CREATE TYPE "AuthorizationScope" AS ENUM ('REVIEW_ONLY', 'FULL_REPRESENTATION');
CREATE TYPE "AnnotationStatus" AS ENUM ('OPEN', 'ANSWERED', 'RESOLVED');
CREATE TYPE "PacketSection" AS ENUM ('BRIEF', 'FACTS', 'ANALYSIS', 'DRAFT', 'CLIENT_CONTEXT');

-- ── Extend Case ───────────────────────────────────────────────────────────────

ALTER TABLE "Case"
  ADD COLUMN "viabilityScore"   "ViabilityScore",
  ADD COLUMN "viabilitySummary" TEXT;

-- ── AdvisorAssignment ─────────────────────────────────────────────────────────

CREATE TABLE "AdvisorAssignment" (
  "id"            TEXT NOT NULL DEFAULT gen_random_uuid(),
  "caseId"        TEXT NOT NULL,
  "advisorId"     TEXT NOT NULL,
  "status"        "AdvisorAssignmentStatus" NOT NULL DEFAULT 'PENDING',
  "scope"         "AuthorizationScope" NOT NULL DEFAULT 'REVIEW_ONLY',
  "declineReason" TEXT,
  "acceptedAt"    TIMESTAMP(3),
  "finalizedAt"   TIMESTAMP(3),
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AdvisorAssignment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdvisorAssignment_caseId_key" ON "AdvisorAssignment"("caseId");
CREATE INDEX "AdvisorAssignment_advisorId_idx" ON "AdvisorAssignment"("advisorId");
CREATE INDEX "AdvisorAssignment_status_idx" ON "AdvisorAssignment"("status");

ALTER TABLE "AdvisorAssignment"
  ADD CONSTRAINT "AdvisorAssignment_caseId_fkey"
    FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "AdvisorAssignment_advisorId_fkey"
    FOREIGN KEY ("advisorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ── HandoffPacket ─────────────────────────────────────────────────────────────

CREATE TABLE "HandoffPacket" (
  "id"              TEXT NOT NULL DEFAULT gen_random_uuid(),
  "caseId"          TEXT NOT NULL,
  "version"         INTEGER NOT NULL DEFAULT 1,
  "briefSummary"    TEXT NOT NULL,
  "extractedFacts"  JSONB NOT NULL,
  "analysisSummary" JSONB NOT NULL,
  "draftContent"    TEXT NOT NULL,
  "clientContext"   JSONB NOT NULL,
  "documents"       JSONB NOT NULL,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "HandoffPacket_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HandoffPacket_caseId_key" ON "HandoffPacket"("caseId");

ALTER TABLE "HandoffPacket"
  ADD CONSTRAINT "HandoffPacket_caseId_fkey"
    FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── CaseAnnotation ────────────────────────────────────────────────────────────

CREATE TABLE "CaseAnnotation" (
  "id"             TEXT NOT NULL DEFAULT gen_random_uuid(),
  "caseId"         TEXT NOT NULL,
  "authorId"       TEXT NOT NULL,
  "section"        "PacketSection" NOT NULL,
  "paragraphIndex" INTEGER,
  "content"        TEXT NOT NULL,
  "status"         "AnnotationStatus" NOT NULL DEFAULT 'OPEN',
  "replyContent"   TEXT,
  "repliedAt"      TIMESTAMP(3),
  "aiPreFilled"    BOOLEAN NOT NULL DEFAULT FALSE,
  "aiPreFillText"  TEXT,
  "resolvedAt"     TIMESTAMP(3),
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CaseAnnotation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CaseAnnotation_caseId_idx" ON "CaseAnnotation"("caseId");
CREATE INDEX "CaseAnnotation_caseId_status_idx" ON "CaseAnnotation"("caseId", "status");

ALTER TABLE "CaseAnnotation"
  ADD CONSTRAINT "CaseAnnotation_caseId_fkey"
    FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "CaseAnnotation_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
