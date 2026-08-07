-- Akademisk kildeføring fase 1: additive structured citation fields for insights.

ALTER TABLE "Insight"
ADD COLUMN IF NOT EXISTS "sourceLabel" TEXT,
ADD COLUMN IF NOT EXISTS "primaryCitationId" TEXT;

UPDATE "Insight"
SET "sourceLabel" = "source"
WHERE "sourceLabel" IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Insight_primaryCitationId_fkey'
  ) THEN
    ALTER TABLE "Insight"
      ADD CONSTRAINT "Insight_primaryCitationId_fkey"
      FOREIGN KEY ("primaryCitationId") REFERENCES "SourceCitation"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Insight_primaryCitationId_idx" ON "Insight"("primaryCitationId");
