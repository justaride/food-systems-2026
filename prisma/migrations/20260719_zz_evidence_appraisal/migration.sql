-- A structured, fail-closed appraisal layer for the mixed Report, Thesis,
-- and SourceDoc corpus. No appraisal rows are backfilled by this migration.
BEGIN;

CREATE TYPE "EvidenceAppraisalStatus" AS ENUM (
  'draft',
  'reviewed',
  'excluded_not_applicable'
);

CREATE TYPE "EvidenceAppraisalBasis" AS ENUM (
  'peer_reviewed',
  'formally_examined_thesis',
  'official_primary',
  'grey_literature',
  'internal_material',
  'other',
  'unclear'
);

CREATE TYPE "EvidenceStudyDesign" AS ENUM (
  'experimental',
  'quasi_experimental',
  'observational',
  'qualitative',
  'mixed_methods',
  'evidence_synthesis',
  'modelling',
  'economic_analysis',
  'legal_policy_analysis',
  'descriptive_document',
  'other',
  'unclear',
  'not_applicable'
);

CREATE TYPE "EvidenceApplicability" AS ENUM (
  'direct',
  'indirect',
  'limited',
  'unclear',
  'not_applicable'
);

CREATE TYPE "EvidenceLimitationsStatus" AS ENUM (
  'identified',
  'none_identified',
  'unclear',
  'not_applicable'
);

CREATE TYPE "EvidenceRiskOfBias" AS ENUM (
  'low',
  'some_concerns',
  'high',
  'critical',
  'unclear',
  'not_applicable'
);

CREATE TYPE "EvidenceReviewMethod" AS ENUM (
  'full_text',
  'partial_text',
  'metadata_only'
);

CREATE TABLE "EvidenceAppraisal" (
  "id" TEXT NOT NULL,
  "reportId" TEXT,
  "thesisId" TEXT,
  "sourceDocId" TEXT,
  "status" "EvidenceAppraisalStatus" NOT NULL DEFAULT 'draft',
  "basis" "EvidenceAppraisalBasis",
  "studyDesign" "EvidenceStudyDesign",
  "studyDesignDetails" TEXT,
  "methodologySummary" TEXT,
  "sampleOrCoverage" TEXT,
  "applicability" "EvidenceApplicability",
  "applicabilityContext" TEXT,
  "applicabilityNotes" TEXT,
  "limitationsStatus" "EvidenceLimitationsStatus",
  "limitations" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "limitationsNotes" TEXT,
  "riskOfBias" "EvidenceRiskOfBias",
  "riskOfBiasNotes" TEXT,
  "framework" TEXT,
  "frameworkVersion" TEXT,
  "reviewMethod" "EvidenceReviewMethod",
  "reviewBasisCitationId" TEXT,
  "reviewedSourceHash" TEXT,
  "hashAlgorithm" TEXT NOT NULL DEFAULT 'sha256',
  "reviewedBy" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "notApplicableReason" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "EvidenceAppraisal_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "EvidenceAppraisal_exactly_one_target_check"
    CHECK (num_nonnulls("reportId", "thesisId", "sourceDocId") = 1),
  CONSTRAINT "EvidenceAppraisal_status_contract_check"
    CHECK (
      (
        "status" = 'draft'
        AND "reviewedAt" IS NULL
        AND "notApplicableReason" IS NULL
      )
      OR
      (
        "status" = 'reviewed'
        AND "basis" IS NOT NULL
        AND "studyDesign" IS NOT NULL
        AND "applicability" IS NOT NULL
        AND "limitationsStatus" IS NOT NULL
        AND "riskOfBias" IS NOT NULL
        AND "reviewMethod" = 'full_text'
        AND NULLIF(BTRIM("framework"), '') IS NOT NULL
        AND NULLIF(BTRIM("frameworkVersion"), '') IS NOT NULL
        AND "reviewBasisCitationId" IS NOT NULL
        AND "reviewedSourceHash" ~ '^[0-9a-f]{64}$'
        AND "hashAlgorithm" = 'sha256'
        AND NULLIF(BTRIM("reviewedBy"), '') IS NOT NULL
        AND "reviewedAt" IS NOT NULL
        AND "notApplicableReason" IS NULL
      )
      OR
      (
        "status" = 'excluded_not_applicable'
        AND "basis" IS NULL
        AND "studyDesign" IS NULL
        AND "studyDesignDetails" IS NULL
        AND "methodologySummary" IS NULL
        AND "sampleOrCoverage" IS NULL
        AND "applicability" IS NULL
        AND "applicabilityContext" IS NULL
        AND "applicabilityNotes" IS NULL
        AND "limitationsStatus" IS NULL
        AND cardinality("limitations") = 0
        AND "limitationsNotes" IS NULL
        AND "riskOfBias" IS NULL
        AND "riskOfBiasNotes" IS NULL
        AND "reviewMethod" IS NOT NULL
        AND "reviewBasisCitationId" IS NOT NULL
        AND "reviewedSourceHash" ~ '^[0-9a-f]{64}$'
        AND "hashAlgorithm" = 'sha256'
        AND NULLIF(BTRIM("reviewedBy"), '') IS NOT NULL
        AND "reviewedAt" IS NOT NULL
        AND NULLIF(BTRIM("notApplicableReason"), '') IS NOT NULL
      )
    ),
  CONSTRAINT "EvidenceAppraisal_limitations_contract_check"
    CHECK (
      "status" <> 'reviewed'
      OR (
        ("limitationsStatus" = 'identified' AND cardinality("limitations") > 0)
        OR (
          "limitationsStatus" IN ('none_identified', 'unclear', 'not_applicable')
          AND cardinality("limitations") = 0
          AND NULLIF(BTRIM("limitationsNotes"), '') IS NOT NULL
        )
      )
    ),
  CONSTRAINT "EvidenceAppraisal_not_applicable_explanations_check"
    CHECK (
      "status" <> 'reviewed'
      OR (
        ("studyDesign" <> 'not_applicable' OR NULLIF(BTRIM("studyDesignDetails"), '') IS NOT NULL)
        AND ("applicability" <> 'not_applicable' OR NULLIF(BTRIM("applicabilityNotes"), '') IS NOT NULL)
        AND ("riskOfBias" <> 'not_applicable' OR NULLIF(BTRIM("riskOfBiasNotes"), '') IS NOT NULL)
      )
    )
);

CREATE UNIQUE INDEX "EvidenceAppraisal_reportId_key" ON "EvidenceAppraisal"("reportId");
CREATE UNIQUE INDEX "EvidenceAppraisal_thesisId_key" ON "EvidenceAppraisal"("thesisId");
CREATE UNIQUE INDEX "EvidenceAppraisal_sourceDocId_key" ON "EvidenceAppraisal"("sourceDocId");
CREATE INDEX "EvidenceAppraisal_status_idx" ON "EvidenceAppraisal"("status");
CREATE INDEX "EvidenceAppraisal_basis_idx" ON "EvidenceAppraisal"("basis");
CREATE INDEX "EvidenceAppraisal_riskOfBias_idx" ON "EvidenceAppraisal"("riskOfBias");
CREATE INDEX "EvidenceAppraisal_reviewBasisCitationId_idx" ON "EvidenceAppraisal"("reviewBasisCitationId");

ALTER TABLE "EvidenceAppraisal"
  ADD CONSTRAINT "EvidenceAppraisal_reportId_fkey"
  FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "EvidenceAppraisal"
  ADD CONSTRAINT "EvidenceAppraisal_thesisId_fkey"
  FOREIGN KEY ("thesisId") REFERENCES "Thesis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "EvidenceAppraisal"
  ADD CONSTRAINT "EvidenceAppraisal_sourceDocId_fkey"
  FOREIGN KEY ("sourceDocId") REFERENCES "SourceDoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "EvidenceAppraisal"
  ADD CONSTRAINT "EvidenceAppraisal_reviewBasisCitationId_fkey"
  FOREIGN KEY ("reviewBasisCitationId") REFERENCES "SourceCitation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
