-- Tighten reviewed appraisal completeness without rewriting the already
-- applied EvidenceAppraisal base migration. Existing draft/excluded rows are
-- unaffected; reviewed rows must carry auditable methodological reasoning.
BEGIN;

ALTER TABLE "EvidenceAppraisal"
  ADD CONSTRAINT "EvidenceAppraisal_reviewed_quality_contract_check"
  CHECK (
    "status" <> 'reviewed'
    OR (
      NULLIF(BTRIM("methodologySummary"), '') IS NOT NULL
      AND NULLIF(BTRIM("sampleOrCoverage"), '') IS NOT NULL
      AND NULLIF(BTRIM("applicabilityContext"), '') IS NOT NULL
      AND NULLIF(BTRIM("riskOfBiasNotes"), '') IS NOT NULL
      AND (
        "studyDesign" NOT IN ('other', 'unclear', 'not_applicable')
        OR NULLIF(BTRIM("studyDesignDetails"), '') IS NOT NULL
      )
      AND (
        "applicability" = 'direct'
        OR NULLIF(BTRIM("applicabilityNotes"), '') IS NOT NULL
      )
      AND (
        "limitationsStatus" <> 'identified'
        OR NULLIF(BTRIM(array_to_string("limitations", ' ')), '') IS NOT NULL
      )
    )
  );

COMMIT;
