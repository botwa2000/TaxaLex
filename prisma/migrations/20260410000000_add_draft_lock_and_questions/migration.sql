-- Migration: add_draft_lock_and_questions
-- Adds draftLocked flag (enables always-save-draft pattern) and followUpQuestions
-- for wizard resume support (persist AI questions across sessions)

ALTER TABLE "Case"
  ADD COLUMN "draftLocked"       BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "followUpQuestions" JSONB;
