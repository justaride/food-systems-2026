-- Schema drift catch-up.
--
-- 38 columns were added to schema.prisma over time and applied to the local
-- database via `prisma db push`, but no migration files were committed — so
-- production never received them. Prisma queries that select these tables
-- fail with P2022 (ColumnNotFound); getCompanies() in particular swallowed
-- the error and rendered an empty company list.
--
-- Column names/types mirror the local (schema.prisma-synced) database.
-- Idempotent: safe to apply via psql on any database state.

ALTER TABLE "Actor"
  ADD COLUMN IF NOT EXISTS "lastVerifiedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "verificationStatus" TEXT;

ALTER TABLE "BoardMember"
  ADD COLUMN IF NOT EXISTS "effectiveFrom" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "effectiveTo" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "verificationStatus" TEXT;

ALTER TABLE "BusinessRelationship"
  ADD COLUMN IF NOT EXISTS "verificationStatus" TEXT,
  ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);

ALTER TABLE "Company"
  ADD COLUMN IF NOT EXISTS "isResearchConstruct" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "orgNrFormat" TEXT NOT NULL DEFAULT 'bronnoysund',
  ADD COLUMN IF NOT EXISTS "registrySource" TEXT,
  ADD COLUMN IF NOT EXISTS "registryVerifiedAt" TIMESTAMP(3);

ALTER TABLE "CompanyFinancial"
  ADD COLUMN IF NOT EXISTS "fiscalPeriodEnd" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "fiscalPeriodStart" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "fiscalYearLabel" TEXT,
  ADD COLUMN IF NOT EXISTS "fxRateNokPerUnit" DECIMAL(18,8),
  ADD COLUMN IF NOT EXISTS "fxRateSource" TEXT,
  ADD COLUMN IF NOT EXISTS "reportingCurrency" TEXT,
  ADD COLUMN IF NOT EXISTS "verificationStatus" TEXT,
  ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);

ALTER TABLE "Document"
  ADD COLUMN IF NOT EXISTS "accessedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "archivedUrl" TEXT;

ALTER TABLE "Insight"
  ADD COLUMN IF NOT EXISTS "primaryCitationId" TEXT,
  ADD COLUMN IF NOT EXISTS "sourceLabel" TEXT;

ALTER TABLE "PersonProfile"
  ADD COLUMN IF NOT EXISTS "lastVerifiedAt" TIMESTAMP(3);

ALTER TABLE "Shareholder"
  ADD COLUMN IF NOT EXISTS "confidence" INTEGER,
  ADD COLUMN IF NOT EXISTS "shareCount" BIGINT,
  ADD COLUMN IF NOT EXISTS "source" TEXT,
  ADD COLUMN IF NOT EXISTS "sourceBasis" TEXT,
  ADD COLUMN IF NOT EXISTS "sourceObservedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "sourceRank" INTEGER,
  ADD COLUMN IF NOT EXISTS "sourceUpdatedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "sourceUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "verificationStatus" TEXT,
  ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);

ALTER TABLE "SourceDoc"
  ADD COLUMN IF NOT EXISTS "accessedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "archivedUrl" TEXT;

ALTER TABLE "Subsidy"
  ADD COLUMN IF NOT EXISTS "verificationStatus" TEXT,
  ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);
