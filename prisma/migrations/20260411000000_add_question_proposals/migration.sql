-- AlterTable: add questionProposals JSON field to Case
ALTER TABLE "Case" ADD COLUMN "questionProposals" JSONB;
