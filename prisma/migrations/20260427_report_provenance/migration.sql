ALTER TABLE "Report"
ADD COLUMN IF NOT EXISTS "provenanceType" TEXT,
ADD COLUMN IF NOT EXISTS "supportingSources" JSONB;

CREATE INDEX IF NOT EXISTS "Report_provenanceType_idx" ON "Report"("provenanceType");
