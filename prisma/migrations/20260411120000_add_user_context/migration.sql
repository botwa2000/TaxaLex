-- Add userContext field to Case model
-- Stores the user's plain-language explanation of what they want to object and why.
-- Optional: NULL means the user left the field blank.
ALTER TABLE "Case" ADD COLUMN IF NOT EXISTS "userContext" TEXT;
