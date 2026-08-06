-- Producer.primaryCitationId — FK to SourceCitation.
-- Resolves kritisk-analyse anbefaling #5 (Producer mangler kildesporing).
-- Optional FK: NULL is allowed; existing rows stay NULL until backfill runs.

-- AlterTable
ALTER TABLE "Producer" ADD COLUMN IF NOT EXISTS "primaryCitationId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Producer_primaryCitationId_idx" ON "Producer"("primaryCitationId");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Producer_primaryCitationId_fkey'
  ) THEN
    ALTER TABLE "Producer" ADD CONSTRAINT "Producer_primaryCitationId_fkey"
      FOREIGN KEY ("primaryCitationId") REFERENCES "SourceCitation"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
