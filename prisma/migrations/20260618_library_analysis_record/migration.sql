CREATE TABLE IF NOT EXISTS "LibraryAnalysisRecord" (
    "id" TEXT NOT NULL,
    "sourceKind" TEXT NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "documentId" TEXT,
    "sourceDocId" TEXT,
    "canonicalPath" TEXT,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "usageRule" TEXT NOT NULL DEFAULT 'internal_background',
    "reviewStatus" TEXT NOT NULL DEFAULT 'not_reviewed',
    "citationReadiness" TEXT,
    "analysisTier" TEXT NOT NULL DEFAULT 'triage_card',
    "aiCard" JSONB,
    "aiSummary" TEXT,
    "keyFindings" TEXT[] NOT NULL,
    "claimCandidates" JSONB,
    "projectImplications" TEXT[] NOT NULL,
    "gaps" JSONB,
    "controlLinks" JSONB,
    "riskFlags" TEXT[] NOT NULL,
    "contentHash" TEXT,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "processedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryAnalysisRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "LibraryAnalysisRecord_sourceKind_sourceKey_key" ON "LibraryAnalysisRecord"("sourceKind", "sourceKey");
CREATE INDEX IF NOT EXISTS "LibraryAnalysisRecord_status_idx" ON "LibraryAnalysisRecord"("status");
CREATE INDEX IF NOT EXISTS "LibraryAnalysisRecord_usageRule_idx" ON "LibraryAnalysisRecord"("usageRule");
CREATE INDEX IF NOT EXISTS "LibraryAnalysisRecord_reviewStatus_idx" ON "LibraryAnalysisRecord"("reviewStatus");
CREATE INDEX IF NOT EXISTS "LibraryAnalysisRecord_documentId_idx" ON "LibraryAnalysisRecord"("documentId");
CREATE INDEX IF NOT EXISTS "LibraryAnalysisRecord_sourceDocId_idx" ON "LibraryAnalysisRecord"("sourceDocId");
CREATE INDEX IF NOT EXISTS "LibraryAnalysisRecord_canonicalPath_idx" ON "LibraryAnalysisRecord"("canonicalPath");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'LibraryAnalysisRecord_documentId_fkey'
  ) THEN
    ALTER TABLE "LibraryAnalysisRecord"
      ADD CONSTRAINT "LibraryAnalysisRecord_documentId_fkey"
      FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'LibraryAnalysisRecord_sourceDocId_fkey'
  ) THEN
    ALTER TABLE "LibraryAnalysisRecord"
      ADD CONSTRAINT "LibraryAnalysisRecord_sourceDocId_fkey"
      FOREIGN KEY ("sourceDocId") REFERENCES "SourceDoc"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
