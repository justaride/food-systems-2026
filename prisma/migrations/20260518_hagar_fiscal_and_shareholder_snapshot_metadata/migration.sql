-- Akademisk kildeføring: explicit fiscal-period and shareholder snapshot metadata.

ALTER TABLE "CompanyFinancial"
ADD COLUMN IF NOT EXISTS "fiscalYearLabel" TEXT,
ADD COLUMN IF NOT EXISTS "fiscalPeriodStart" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "fiscalPeriodEnd" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "reportingCurrency" TEXT,
ADD COLUMN IF NOT EXISTS "fxRateNokPerUnit" DECIMAL(18,8),
ADD COLUMN IF NOT EXISTS "fxRateSource" TEXT;

CREATE INDEX IF NOT EXISTS "CompanyFinancial_fiscalPeriodStart_fiscalPeriodEnd_idx"
ON "CompanyFinancial"("fiscalPeriodStart", "fiscalPeriodEnd");

ALTER TABLE "Shareholder"
ADD COLUMN IF NOT EXISTS "sourceBasis" TEXT,
ADD COLUMN IF NOT EXISTS "sourceObservedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "sourceUpdatedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "sourceRank" INTEGER,
ADD COLUMN IF NOT EXISTS "shareCount" BIGINT;

CREATE INDEX IF NOT EXISTS "Shareholder_companyId_sourceBasis_idx"
ON "Shareholder"("companyId", "sourceBasis");
