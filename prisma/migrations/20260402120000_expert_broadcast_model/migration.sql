-- Migration: expert_broadcast_model
-- Adds EXPERT role, PracticeArea enum, broadcast assignment model

-- 1. Extend UserRole enum
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'EXPERT';

-- 2. Create PracticeArea enum
DO $$ BEGIN
  CREATE TYPE "PracticeArea" AS ENUM ('TAX', 'LEGAL');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 3. Extend AdvisorAssignmentStatus enum
ALTER TYPE "AdvisorAssignmentStatus" ADD VALUE IF NOT EXISTS 'SUPERSEDED';
ALTER TYPE "AdvisorAssignmentStatus" ADD VALUE IF NOT EXISTS 'WITHDRAWN';
ALTER TYPE "AdvisorAssignmentStatus" ADD VALUE IF NOT EXISTS 'EXPIRED';

-- 4. Add expert fields to User
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "practiceAreas" "PracticeArea"[] NOT NULL DEFAULT ARRAY[]::"PracticeArea"[],
  ADD COLUMN IF NOT EXISTS "isAcceptingCases" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "maxConcurrentCases" INTEGER NOT NULL DEFAULT 10;

-- 5. Seed practiceAreas for existing role-based experts
UPDATE "User" SET "practiceAreas" = ARRAY['TAX']::"PracticeArea"[]   WHERE role = 'ADVISOR' AND "practiceAreas" = ARRAY[]::"PracticeArea"[];
UPDATE "User" SET "practiceAreas" = ARRAY['LEGAL']::"PracticeArea"[] WHERE role = 'LAWYER'  AND "practiceAreas" = ARRAY[]::"PracticeArea"[];

-- 6. Convert AdvisorAssignment from one-to-one to one-to-many (broadcast model)
--    Drop the single caseId unique constraint
ALTER TABLE "AdvisorAssignment" DROP CONSTRAINT IF EXISTS "AdvisorAssignment_caseId_key";

--    Add composite unique (one assignment per advisor per case)
ALTER TABLE "AdvisorAssignment"
  ADD CONSTRAINT "AdvisorAssignment_caseId_advisorId_key" UNIQUE ("caseId", "advisorId");

--    Add plain index on caseId for query performance
CREATE INDEX IF NOT EXISTS "AdvisorAssignment_caseId_idx" ON "AdvisorAssignment"("caseId");
