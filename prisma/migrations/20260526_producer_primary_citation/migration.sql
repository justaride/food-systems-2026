-- Producer.primaryCitationId — FK to SourceCitation.
-- Resolves kritisk-analyse anbefaling #5 (Producer mangler kildesporing).
-- Optional FK: NULL is allowed; existing rows stay NULL until backfill runs.

-- AlterTable
ALTER TABLE "Producer" ADD COLUMN "primaryCitationId" TEXT;

-- CreateIndex
CREATE INDEX "Producer_primaryCitationId_idx" ON "Producer"("primaryCitationId");

-- AddForeignKey
ALTER TABLE "Producer" ADD CONSTRAINT "Producer_primaryCitationId_fkey"
  FOREIGN KEY ("primaryCitationId") REFERENCES "SourceCitation"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
