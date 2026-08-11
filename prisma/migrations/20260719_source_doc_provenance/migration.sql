-- SourceDoc mixes external publications with internal primary material,
-- syntheses, and duplicates. Keep unknown rows fail-closed until reviewed.
ALTER TYPE "SourceClass" ADD VALUE IF NOT EXISTS 'internal_primary';

ALTER TABLE "SourceDoc"
ADD COLUMN IF NOT EXISTS "provenanceType" TEXT NOT NULL DEFAULT 'unknown';

CREATE INDEX IF NOT EXISTS "SourceDoc_provenanceType_idx"
ON "SourceDoc"("provenanceType");
