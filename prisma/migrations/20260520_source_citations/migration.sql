-- Source citation hardening.
--
-- This migration is deliberately non-destructive because the live local
-- database already contains an earlier SourceCitation/FieldCitation draft with
-- data. It preserves those rows and adds the canonical citation-readiness layer
-- used by the application code. Enum creation/value additions live in the
-- preceding 20260520_source_citation_enum_values migration because PostgreSQL
-- requires newly added enum values to be committed before use as defaults.

CREATE TABLE IF NOT EXISTS "SourceCitation" (
  "id" TEXT NOT NULL,
  "sourceClass" "SourceClass" NOT NULL DEFAULT 'unknown',
  "citationReadiness" "CitationReadiness" NOT NULL DEFAULT 'blocked_unsourced',
  "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'needs_review',
  "citationText" TEXT NOT NULL,
  "title" TEXT,
  "publisher" TEXT,
  "author" TEXT,
  "year" INTEGER,
  "url" TEXT,
  "archivedUrl" TEXT,
  "localPath" TEXT,
  "fileHash" TEXT,
  "contentHash" TEXT,
  "hashAlgorithm" TEXT NOT NULL DEFAULT 'sha256',
  "pageRef" TEXT,
  "quote" TEXT,
  "accessedAt" TIMESTAMP(3),
  "captureMethod" TEXT NOT NULL DEFAULT 'manual',
  "verifiedAt" TIMESTAMP(3),
  "verifiedBy" TEXT,
  "confidence" INTEGER,
  "notes" TEXT,
  "documentId" TEXT,
  "sourceDocId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SourceCitation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "FieldCitation" (
  "id" TEXT NOT NULL,
  "citationId" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "fieldPath" TEXT,
  "claimText" TEXT,
  "confidence" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "FieldCitation_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "SourceCitation"
  ADD COLUMN IF NOT EXISTS "citationReadiness" "CitationReadiness" NOT NULL DEFAULT 'blocked_unsourced',
  ADD COLUMN IF NOT EXISTS "title" TEXT,
  ADD COLUMN IF NOT EXISTS "publisher" TEXT,
  ADD COLUMN IF NOT EXISTS "author" TEXT,
  ADD COLUMN IF NOT EXISTS "year" INTEGER,
  ADD COLUMN IF NOT EXISTS "fileHash" TEXT,
  ADD COLUMN IF NOT EXISTS "contentHash" TEXT,
  ADD COLUMN IF NOT EXISTS "pageRef" TEXT,
  ADD COLUMN IF NOT EXISTS "quote" TEXT,
  ADD COLUMN IF NOT EXISTS "captureMethod" TEXT NOT NULL DEFAULT 'manual';

ALTER TABLE "SourceCitation"
  ALTER COLUMN "accessedAt" DROP NOT NULL,
  ALTER COLUMN "hashAlgorithm" SET DEFAULT 'sha256',
  ALTER COLUMN "verificationStatus" SET DEFAULT 'needs_review',
  ALTER COLUMN "sourceClass" SET DEFAULT 'unknown';

ALTER TABLE "FieldCitation"
  ADD COLUMN IF NOT EXISTS "claimText" TEXT,
  ADD COLUMN IF NOT EXISTS "confidence" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'FieldCitation_citationId_fkey'
  ) THEN
    ALTER TABLE "FieldCitation" DROP CONSTRAINT "FieldCitation_citationId_fkey";
  END IF;
END $$;

ALTER TABLE "FieldCitation"
  ADD CONSTRAINT "FieldCitation_citationId_fkey"
  FOREIGN KEY ("citationId") REFERENCES "SourceCitation"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'SourceCitation_documentId_fkey'
  ) THEN
    ALTER TABLE "SourceCitation"
      ADD CONSTRAINT "SourceCitation_documentId_fkey"
      FOREIGN KEY ("documentId") REFERENCES "Document"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'SourceCitation_sourceDocId_fkey'
  ) THEN
    ALTER TABLE "SourceCitation"
      ADD CONSTRAINT "SourceCitation_sourceDocId_fkey"
      FOREIGN KEY ("sourceDocId") REFERENCES "SourceDoc"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'SourceCitation_locator_check'
  ) THEN
    ALTER TABLE "SourceCitation" DROP CONSTRAINT "SourceCitation_locator_check";
  END IF;
END $$;

ALTER TABLE "SourceCitation"
  ADD CONSTRAINT "SourceCitation_locator_check"
  CHECK (
    "citationReadiness" IN ('internal_context', 'blocked_unsourced')
    OR "sourceClass" IN ('internal_synthesis', 'internal_construct', 'legacy_unsourced')
    OR "url" IS NOT NULL
    OR "localPath" IS NOT NULL
    OR "sourceDocId" IS NOT NULL
    OR "documentId" IS NOT NULL
  );

CREATE INDEX IF NOT EXISTS "SourceCitation_citationReadiness_idx" ON "SourceCitation"("citationReadiness");
CREATE INDEX IF NOT EXISTS "SourceCitation_verificationStatus_idx" ON "SourceCitation"("verificationStatus");
CREATE INDEX IF NOT EXISTS "SourceCitation_documentId_idx" ON "SourceCitation"("documentId");
CREATE INDEX IF NOT EXISTS "SourceCitation_sourceDocId_idx" ON "SourceCitation"("sourceDocId");
CREATE INDEX IF NOT EXISTS "SourceCitation_url_idx" ON "SourceCitation"("url");
CREATE INDEX IF NOT EXISTS "SourceCitation_localPath_idx" ON "SourceCitation"("localPath");

CREATE INDEX IF NOT EXISTS "FieldCitation_entityType_entityId_idx" ON "FieldCitation"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "FieldCitation_fieldPath_idx" ON "FieldCitation"("fieldPath");
CREATE UNIQUE INDEX IF NOT EXISTS "FieldCitation_citationId_entityType_entityId_fieldPath_key"
  ON "FieldCitation"("citationId", "entityType", "entityId", "fieldPath");
