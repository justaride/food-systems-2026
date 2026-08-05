-- Akademisk kildeføring fase 1: skill registrerte selskaper fra forskningskonstrukter.

ALTER TABLE "Company"
ADD COLUMN IF NOT EXISTS "isResearchConstruct" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "orgNrFormat" TEXT NOT NULL DEFAULT 'bronnoysund',
ADD COLUMN IF NOT EXISTS "registrySource" TEXT,
ADD COLUMN IF NOT EXISTS "registryVerifiedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Company_isResearchConstruct_idx" ON "Company"("isResearchConstruct");
CREATE INDEX IF NOT EXISTS "Company_orgNrFormat_idx" ON "Company"("orgNrFormat");
