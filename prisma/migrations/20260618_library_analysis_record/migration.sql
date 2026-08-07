CREATE TABLE "LibraryAnalysisRecord" (
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

CREATE UNIQUE INDEX "LibraryAnalysisRecord_sourceKind_sourceKey_key" ON "LibraryAnalysisRecord"("sourceKind", "sourceKey");
CREATE INDEX "LibraryAnalysisRecord_status_idx" ON "LibraryAnalysisRecord"("status");
CREATE INDEX "LibraryAnalysisRecord_usageRule_idx" ON "LibraryAnalysisRecord"("usageRule");
CREATE INDEX "LibraryAnalysisRecord_reviewStatus_idx" ON "LibraryAnalysisRecord"("reviewStatus");
CREATE INDEX "LibraryAnalysisRecord_documentId_idx" ON "LibraryAnalysisRecord"("documentId");
CREATE INDEX "LibraryAnalysisRecord_sourceDocId_idx" ON "LibraryAnalysisRecord"("sourceDocId");
CREATE INDEX "LibraryAnalysisRecord_canonicalPath_idx" ON "LibraryAnalysisRecord"("canonicalPath");

ALTER TABLE "LibraryAnalysisRecord"
  ADD CONSTRAINT "LibraryAnalysisRecord_documentId_fkey"
  FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "LibraryAnalysisRecord"
  ADD CONSTRAINT "LibraryAnalysisRecord_sourceDocId_fkey"
  FOREIGN KEY ("sourceDocId") REFERENCES "SourceDoc"("id") ON DELETE SET NULL ON UPDATE CASCADE;
