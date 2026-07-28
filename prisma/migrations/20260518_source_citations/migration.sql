-- Akademisk kildeføring fase 1: kanonisk citation-lag.
-- SourceCitation lagrer selve kilden; FieldCitation kobler en kilde til
-- et felt eller en hel rad via polymorf entityType/entityId.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SourceClass') THEN
    CREATE TYPE "SourceClass" AS ENUM (
      'primary',
      'secondary',
      'synthesis',
      'internal_construct',
      'registry_snapshot',
      'legacy_unsourced'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'VerificationStatus') THEN
    CREATE TYPE "VerificationStatus" AS ENUM (
      'unverified',
      'machine_verified',
      'human_verified',
      'disputed',
      'rejected'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "SourceCitation" (
  "id" TEXT NOT NULL,
  "sourceClass" "SourceClass" NOT NULL,
  "citationText" TEXT NOT NULL,
  "url" TEXT,
  "localPath" TEXT,
  "archivedUrl" TEXT,
  "accessedAt" TIMESTAMP(3) NOT NULL,
  "captureMethod" TEXT NOT NULL DEFAULT 'manual',
  "contentHash" TEXT,
  "hashAlgorithm" TEXT NOT NULL DEFAULT 'sha256',
  "sourceDocId" TEXT,
  "documentId" TEXT,
  "verifiedAt" TIMESTAMP(3),
  "verifiedBy" TEXT,
  "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'unverified',
  "confidence" INTEGER,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SourceCitation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SourceCitation_confidence_check" CHECK ("confidence" IS NULL OR ("confidence" >= 0 AND "confidence" <= 100)),
  CONSTRAINT "SourceCitation_locator_check" CHECK (
    "sourceClass" IN ('internal_construct', 'legacy_unsourced')
    OR "url" IS NOT NULL
    OR "localPath" IS NOT NULL
    OR "sourceDocId" IS NOT NULL
    OR "documentId" IS NOT NULL
  )
);

CREATE TABLE IF NOT EXISTS "FieldCitation" (
  "id" TEXT NOT NULL,
  "citationId" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "fieldPath" TEXT,

  CONSTRAINT "FieldCitation_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'SourceCitation_sourceDocId_fkey'
  ) THEN
    ALTER TABLE "SourceCitation"
      ADD CONSTRAINT "SourceCitation_sourceDocId_fkey"
      FOREIGN KEY ("sourceDocId") REFERENCES "SourceDoc"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'SourceCitation_documentId_fkey'
  ) THEN
    ALTER TABLE "SourceCitation"
      ADD CONSTRAINT "SourceCitation_documentId_fkey"
      FOREIGN KEY ("documentId") REFERENCES "Document"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'FieldCitation_citationId_fkey'
  ) THEN
    ALTER TABLE "FieldCitation"
      ADD CONSTRAINT "FieldCitation_citationId_fkey"
      FOREIGN KEY ("citationId") REFERENCES "SourceCitation"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "SourceCitation_url_idx" ON "SourceCitation"("url");
CREATE INDEX IF NOT EXISTS "SourceCitation_localPath_idx" ON "SourceCitation"("localPath");
CREATE INDEX IF NOT EXISTS "SourceCitation_sourceClass_idx" ON "SourceCitation"("sourceClass");
CREATE INDEX IF NOT EXISTS "SourceCitation_verificationStatus_idx" ON "SourceCitation"("verificationStatus");
CREATE INDEX IF NOT EXISTS "SourceCitation_sourceDocId_idx" ON "SourceCitation"("sourceDocId");
CREATE INDEX IF NOT EXISTS "SourceCitation_documentId_idx" ON "SourceCitation"("documentId");
CREATE INDEX IF NOT EXISTS "FieldCitation_citationId_idx" ON "FieldCitation"("citationId");
CREATE INDEX IF NOT EXISTS "FieldCitation_entityType_entityId_idx" ON "FieldCitation"("entityType", "entityId");
