-- Akademisk kildeføring fase 1: nullable verification metadata.

ALTER TABLE "Shareholder"
ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "verificationStatus" TEXT,
ADD COLUMN IF NOT EXISTS "confidence" INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Shareholder_confidence_check'
  ) THEN
    ALTER TABLE "Shareholder"
      ADD CONSTRAINT "Shareholder_confidence_check"
      CHECK ("confidence" IS NULL OR ("confidence" >= 0 AND "confidence" <= 100));
  END IF;
END $$;

ALTER TABLE "BoardMember"
ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "verificationStatus" TEXT,
ADD COLUMN IF NOT EXISTS "effectiveFrom" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "effectiveTo" TIMESTAMP(3);

ALTER TABLE "PersonProfile"
ADD COLUMN IF NOT EXISTS "lastVerifiedAt" TIMESTAMP(3);

ALTER TABLE "Actor"
ADD COLUMN IF NOT EXISTS "lastVerifiedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "verificationStatus" TEXT;

ALTER TABLE "CompanyFinancial"
ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "verificationStatus" TEXT;

ALTER TABLE "Subsidy"
ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "verificationStatus" TEXT;

ALTER TABLE "BusinessRelationship"
ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "verificationStatus" TEXT;
