-- LibraryAnalysisRun: append-only history of machine analyses.
--
-- LibraryAnalysisRecord holds one row per source and is overwritten by every
-- upsert on ("sourceKind", "sourceKey"). That makes it impossible to run more
-- than one model against the same source and compare the results, and each new
-- run loses the previous analysis. This table stores one immutable row per
-- (source, run) so history and comparison are possible.
--
-- The authority axes (usageRule, reviewStatus, citationReadiness, reviewer)
-- deliberately stay on LibraryAnalysisRecord. A run row is machine output only
-- and carries no review or publication status.

CREATE TABLE IF NOT EXISTS "LibraryAnalysisRun" (
    "id" TEXT NOT NULL,
    "sourceKind" TEXT NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "documentId" TEXT,
    "sourceDocId" TEXT,
    "canonicalPath" TEXT,
    "title" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "aiModel" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
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
    "payloadHash" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LibraryAnalysisRun_pkey" PRIMARY KEY ("id")
);

-- One row per source per run. There is deliberately no unique index on
-- ("sourceKind", "sourceKey") alone: many runs per source is the point.
CREATE UNIQUE INDEX IF NOT EXISTS "LibraryAnalysisRun_sourceKind_sourceKey_runId_key"
  ON "LibraryAnalysisRun"("sourceKind", "sourceKey", "runId");
CREATE INDEX IF NOT EXISTS "LibraryAnalysisRun_sourceKind_sourceKey_idx"
  ON "LibraryAnalysisRun"("sourceKind", "sourceKey");
CREATE INDEX IF NOT EXISTS "LibraryAnalysisRun_runId_idx" ON "LibraryAnalysisRun"("runId");
CREATE INDEX IF NOT EXISTS "LibraryAnalysisRun_documentId_idx" ON "LibraryAnalysisRun"("documentId");
CREATE INDEX IF NOT EXISTS "LibraryAnalysisRun_sourceDocId_idx" ON "LibraryAnalysisRun"("sourceDocId");
CREATE INDEX IF NOT EXISTS "LibraryAnalysisRun_createdAt_idx" ON "LibraryAnalysisRun"("createdAt");

-- Pointer from the current-view record to the run it currently reflects.
ALTER TABLE "LibraryAnalysisRecord" ADD COLUMN IF NOT EXISTS "currentRunId" TEXT;
CREATE INDEX IF NOT EXISTS "LibraryAnalysisRecord_currentRunId_idx"
  ON "LibraryAnalysisRecord"("currentRunId");

DO $library_analysis_run_constraints$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'LibraryAnalysisRun_documentId_fkey'
  ) THEN
    ALTER TABLE "LibraryAnalysisRun"
      ADD CONSTRAINT "LibraryAnalysisRun_documentId_fkey"
      FOREIGN KEY ("documentId") REFERENCES "Document"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'LibraryAnalysisRun_sourceDocId_fkey'
  ) THEN
    ALTER TABLE "LibraryAnalysisRun"
      ADD CONSTRAINT "LibraryAnalysisRun_sourceDocId_fkey"
      FOREIGN KEY ("sourceDocId") REFERENCES "SourceDoc"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'LibraryAnalysisRecord_currentRunId_fkey'
  ) THEN
    ALTER TABLE "LibraryAnalysisRecord"
      ADD CONSTRAINT "LibraryAnalysisRecord_currentRunId_fkey"
      FOREIGN KEY ("currentRunId") REFERENCES "LibraryAnalysisRun"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$library_analysis_run_constraints$;

-- Append-only enforcement. Corrections are made by writing a new run row and
-- repointing LibraryAnalysisRecord."currentRunId", never by rewriting history.
CREATE OR REPLACE FUNCTION public.reject_library_analysis_run_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $library_analysis_run_immutable$
BEGIN
  RAISE EXCEPTION
    'LibraryAnalysisRun is append-only: % is not permitted; write a new run row instead',
    TG_OP;
END
$library_analysis_run_immutable$;

REVOKE ALL ON FUNCTION public.reject_library_analysis_run_change() FROM PUBLIC;

DROP TRIGGER IF EXISTS "LibraryAnalysisRun_reject_update_delete" ON "LibraryAnalysisRun";
CREATE TRIGGER "LibraryAnalysisRun_reject_update_delete"
BEFORE UPDATE OR DELETE ON "LibraryAnalysisRun"
FOR EACH ROW EXECUTE FUNCTION public.reject_library_analysis_run_change();

DROP TRIGGER IF EXISTS "LibraryAnalysisRun_reject_truncate" ON "LibraryAnalysisRun";
CREATE TRIGGER "LibraryAnalysisRun_reject_truncate"
BEFORE TRUNCATE ON "LibraryAnalysisRun"
FOR EACH STATEMENT EXECUTE FUNCTION public.reject_library_analysis_run_change();
