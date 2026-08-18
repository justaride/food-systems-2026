CREATE TYPE "CandidateContentUnitType" AS ENUM (
  'pdf_page', 'document_section', 'web_section', 'slide', 'sheet_range',
  'transcript_segment', 'database_record', 'dataset_slice', 'media_segment'
);

CREATE TYPE "CandidateIdentityConfidence" AS ENUM ('exact', 'provisional', 'unresolved');
CREATE TYPE "CandidateEvidenceLevel" AS ENUM ('exact_locator', 'partial_locator', 'no_locator');
CREATE TYPE "CandidateMachineUse" AS ENUM ('candidate_only', 'reusable_for_ai_context', 'quarantined');
CREATE TYPE "CandidateRunEventType" AS ENUM (
  'queued', 'started', 'checkpoint', 'candidate_completed', 'partial_completed',
  'failed', 'blocked_input', 'quarantined', 'superseded'
);
CREATE TYPE "CandidateAssertionType" AS ENUM (
  'claim', 'classification', 'entity_link', 'relationship',
  'quantitative_observation', 'coverage_signal', 'gap', 'contradiction',
  'source_role_suggestion'
);
CREATE TYPE "CandidateEvidenceRelation" AS ENUM ('supports', 'contradicts', 'contextualizes');
CREATE TYPE "CandidatePromotionState" AS ENUM (
  'candidate', 'internal_curated', 'external_eligible', 'published', 'revoked'
);
CREATE TYPE "CandidateReviewDecision" AS ENUM (
  'accepted', 'accepted_with_edits', 'rejected', 'deferred', 'rerun_requested'
);

CREATE TABLE "CandidateContentUnit" (
  "id" TEXT NOT NULL,
  "sourceKind" TEXT NOT NULL,
  "sourceKey" TEXT NOT NULL,
  "sourceVersionHash" TEXT NOT NULL,
  "unitType" "CandidateContentUnitType" NOT NULL,
  "ordinal" INTEGER NOT NULL,
  "locator" TEXT NOT NULL,
  "locatorHash" TEXT NOT NULL,
  "contentHash" TEXT NOT NULL,
  "hashAlgorithm" TEXT NOT NULL DEFAULT 'sha256',
  "identityConfidence" "CandidateIdentityConfidence" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CandidateContentUnit_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CandidateContentUnit_sourceVersionHash_check" CHECK ("sourceVersionHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidateContentUnit_locatorHash_check" CHECK ("locatorHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidateContentUnit_contentHash_check" CHECK ("contentHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidateContentUnit_hashAlgorithm_check" CHECK ("hashAlgorithm" = 'sha256'),
  CONSTRAINT "CandidateContentUnit_ordinal_check" CHECK ("ordinal" >= 0)
);

CREATE TABLE "CandidateAnalysisRun" (
  "id" TEXT NOT NULL,
  "scopeHash" TEXT NOT NULL,
  "workflowId" TEXT NOT NULL,
  "workflowVersion" TEXT NOT NULL,
  "workflowPath" TEXT NOT NULL,
  "workflowHash" TEXT NOT NULL,
  "promptId" TEXT NOT NULL,
  "promptVersion" TEXT NOT NULL,
  "promptPath" TEXT NOT NULL,
  "modelProvider" TEXT NOT NULL,
  "modelName" TEXT NOT NULL,
  "modelVersion" TEXT NOT NULL,
  "promptHash" TEXT NOT NULL,
  "config" JSONB NOT NULL,
  "configHash" TEXT NOT NULL,
  "inputEnvelopeHash" TEXT NOT NULL,
  "purpose" TEXT NOT NULL,
  "outputProfile" TEXT NOT NULL,
  "workerId" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "attempt" INTEGER NOT NULL,
  "predecessorRunId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CandidateAnalysisRun_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CandidateAnalysisRun_scopeHash_check" CHECK ("scopeHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidateAnalysisRun_workflowHash_check" CHECK ("workflowHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidateAnalysisRun_promptHash_check" CHECK ("promptHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidateAnalysisRun_configHash_check" CHECK ("configHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidateAnalysisRun_inputEnvelopeHash_check" CHECK ("inputEnvelopeHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidateAnalysisRun_idempotencyKey_check" CHECK ("idempotencyKey" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidateAnalysisRun_attempt_check" CHECK ("attempt" > 0),
  CONSTRAINT "CandidateAnalysisRun_workerId_check" CHECK (btrim("workerId") <> '')
);

CREATE TABLE "CandidateAnalysisRunInput" (
  "id" TEXT NOT NULL,
  "runId" TEXT NOT NULL,
  "contentUnitId" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "inputHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CandidateAnalysisRunInput_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CandidateAnalysisRunInput_inputHash_check" CHECK ("inputHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidateAnalysisRunInput_position_check" CHECK ("position" >= 0)
);

CREATE TABLE "CandidateAnalysisRunEvent" (
  "id" TEXT NOT NULL,
  "runId" TEXT NOT NULL,
  "scopeHash" TEXT NOT NULL,
  "sequence" INTEGER NOT NULL,
  "eventType" "CandidateRunEventType" NOT NULL,
  "payload" JSONB,
  "eventHash" TEXT NOT NULL,
  "supersededEventId" TEXT,
  "supersededEventHash" TEXT,
  "supersededEventScopeHash" TEXT,
  "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CandidateAnalysisRunEvent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CandidateAnalysisRunEvent_scopeHash_check" CHECK ("scopeHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidateAnalysisRunEvent_eventHash_check" CHECK ("eventHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidateAnalysisRunEvent_sequence_check" CHECK ("sequence" > 0),
  CONSTRAINT "CandidateAnalysisRunEvent_supersededEventHash_check" CHECK ("supersededEventHash" IS NULL OR "supersededEventHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidateAnalysisRunEvent_supersededEventScopeHash_check" CHECK ("supersededEventScopeHash" IS NULL OR "supersededEventScopeHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidateAnalysisRunEvent_supersession_binding_check" CHECK (
    (("eventType" = 'superseded') AND "supersededEventId" IS NOT NULL AND "supersededEventHash" IS NOT NULL AND "supersededEventScopeHash" IS NOT NULL AND "scopeHash" = "supersededEventScopeHash")
    OR (("eventType" <> 'superseded') AND "supersededEventId" IS NULL AND "supersededEventHash" IS NULL AND "supersededEventScopeHash" IS NULL)
  ),
  CONSTRAINT "CandidateAnalysisRunEvent_self_supersession_check" CHECK ("supersededEventId" IS NULL OR "id" <> "supersededEventId")
);

CREATE TABLE "CandidateAnalysisArtifact" (
  "id" TEXT NOT NULL,
  "runId" TEXT NOT NULL,
  "artifactType" TEXT NOT NULL,
  "schemaVersion" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "payloadHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CandidateAnalysisArtifact_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CandidateAnalysisArtifact_payloadHash_check" CHECK ("payloadHash" ~ '^[0-9a-f]{64}$')
);

CREATE TABLE "CandidateAssertion" (
  "id" TEXT NOT NULL,
  "runId" TEXT NOT NULL,
  "assertionType" "CandidateAssertionType" NOT NULL,
  "schemaVersion" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "payloadHash" TEXT NOT NULL,
  "confidence" DOUBLE PRECISION,
  "machineUse" "CandidateMachineUse" NOT NULL,
  "identityConfidence" "CandidateIdentityConfidence" NOT NULL,
  "evidenceLevel" "CandidateEvidenceLevel" NOT NULL,
  "limitations" TEXT[] NOT NULL,
  "scopeKey" TEXT NOT NULL,
  "scopeHash" TEXT NOT NULL,
  "supersededAssertionId" TEXT,
  "supersededAssertionPayloadHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CandidateAssertion_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CandidateAssertion_payloadHash_check" CHECK ("payloadHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidateAssertion_scopeHash_check" CHECK ("scopeHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidateAssertion_supersededAssertionPayloadHash_check" CHECK ("supersededAssertionPayloadHash" IS NULL OR "supersededAssertionPayloadHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidateAssertion_supersession_pair_check" CHECK (("supersededAssertionId" IS NULL) = ("supersededAssertionPayloadHash" IS NULL)),
  CONSTRAINT "CandidateAssertion_self_supersession_check" CHECK ("supersededAssertionId" IS NULL OR "id" <> "supersededAssertionId"),
  CONSTRAINT "CandidateAssertion_confidence_check" CHECK ("confidence" IS NULL OR ("confidence" >= 0 AND "confidence" <= 1))
);

CREATE TABLE "CandidateEvidenceLink" (
  "id" TEXT NOT NULL,
  "assertionId" TEXT NOT NULL,
  "contentUnitId" TEXT NOT NULL,
  "relation" "CandidateEvidenceRelation" NOT NULL,
  "locator" TEXT NOT NULL,
  "locatorHash" TEXT NOT NULL,
  "excerptHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CandidateEvidenceLink_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CandidateEvidenceLink_locatorHash_check" CHECK ("locatorHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidateEvidenceLink_excerptHash_check" CHECK ("excerptHash" IS NULL OR "excerptHash" ~ '^[0-9a-f]{64}$')
);

CREATE TABLE "CandidateDependency" (
  "id" TEXT NOT NULL,
  "assertionId" TEXT NOT NULL,
  "upstreamAssertionId" TEXT NOT NULL,
  "relation" TEXT NOT NULL,
  "inheritedLimitations" TEXT[] NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CandidateDependency_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CandidateDependency_no_self_edge_check" CHECK ("assertionId" <> "upstreamAssertionId")
);

CREATE TABLE "CandidateReconciliationSnapshot" (
  "id" TEXT NOT NULL,
  "runId" TEXT NOT NULL,
  "scope" JSONB NOT NULL,
  "scopeHash" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "payloadHash" TEXT NOT NULL,
  "conflictCount" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CandidateReconciliationSnapshot_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CandidateReconciliationSnapshot_scopeHash_check" CHECK ("scopeHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidateReconciliationSnapshot_payloadHash_check" CHECK ("payloadHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidateReconciliationSnapshot_conflictCount_check" CHECK ("conflictCount" >= 0)
);

CREATE TABLE "CandidateHumanReviewDecision" (
  "id" TEXT NOT NULL,
  "assertionId" TEXT NOT NULL,
  "decision" "CandidateReviewDecision" NOT NULL,
  "reviewProfile" TEXT NOT NULL,
  "reviewProfileHash" TEXT NOT NULL,
  "reviewer" TEXT NOT NULL,
  "authority" TEXT NOT NULL,
  "assertionPayloadHash" TEXT NOT NULL,
  "sourceContentSetHash" TEXT NOT NULL,
  "evidenceSetHash" TEXT NOT NULL,
  "decisionHash" TEXT NOT NULL,
  "limitations" TEXT[] NOT NULL,
  "editedPayload" JSONB,
  "editedPayloadHash" TEXT,
  "supersededDecisionId" TEXT,
  "supersededDecisionHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CandidateHumanReviewDecision_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CandidateHumanReviewDecision_reviewProfileHash_check" CHECK ("reviewProfileHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidateHumanReviewDecision_assertionPayloadHash_check" CHECK ("assertionPayloadHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidateHumanReviewDecision_sourceContentSetHash_check" CHECK ("sourceContentSetHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidateHumanReviewDecision_evidenceSetHash_check" CHECK ("evidenceSetHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidateHumanReviewDecision_decisionHash_check" CHECK ("decisionHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidateHumanReviewDecision_editedPayloadHash_check" CHECK ("editedPayloadHash" IS NULL OR "editedPayloadHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidateHumanReviewDecision_editedPayload_pair_check" CHECK (("editedPayload" IS NULL) = ("editedPayloadHash" IS NULL)),
  CONSTRAINT "CandidateHumanReviewDecision_supersededDecisionHash_check" CHECK ("supersededDecisionHash" IS NULL OR "supersededDecisionHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidateHumanReviewDecision_supersession_pair_check" CHECK (("supersededDecisionId" IS NULL) = ("supersededDecisionHash" IS NULL)),
  CONSTRAINT "CandidateHumanReviewDecision_self_supersession_check" CHECK ("supersededDecisionId" IS NULL OR "id" <> "supersededDecisionId"),
  CONSTRAINT "CandidateHumanReviewDecision_reviewer_check" CHECK (btrim("reviewer") <> ''),
  CONSTRAINT "CandidateHumanReviewDecision_authority_check" CHECK (btrim("authority") <> '')
);

CREATE TABLE "CandidatePromotionDecision" (
  "id" TEXT NOT NULL,
  "assertionId" TEXT NOT NULL,
  "assertionPayloadHash" TEXT NOT NULL,
  "reviewDecisionId" TEXT NOT NULL,
  "reviewDecisionHash" TEXT NOT NULL,
  "targetProfile" TEXT NOT NULL,
  "targetProfileHash" TEXT NOT NULL,
  "state" "CandidatePromotionState" NOT NULL,
  "policyVersion" TEXT NOT NULL,
  "policyHash" TEXT NOT NULL,
  "preconditionsHash" TEXT NOT NULL,
  "targetRefs" JSONB NOT NULL,
  "targetSetHash" TEXT NOT NULL,
  "result" JSONB NOT NULL,
  "resultHash" TEXT NOT NULL,
  "decisionHash" TEXT NOT NULL,
  "operator" TEXT NOT NULL,
  "authority" TEXT NOT NULL,
  "supersededDecisionId" TEXT,
  "supersededDecisionHash" TEXT,
  "supersededPolicyHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CandidatePromotionDecision_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CandidatePromotionDecision_assertionPayloadHash_check" CHECK ("assertionPayloadHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidatePromotionDecision_reviewDecisionHash_check" CHECK ("reviewDecisionHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidatePromotionDecision_targetProfileHash_check" CHECK ("targetProfileHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidatePromotionDecision_policyHash_check" CHECK ("policyHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidatePromotionDecision_preconditionsHash_check" CHECK ("preconditionsHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidatePromotionDecision_targetSetHash_check" CHECK ("targetSetHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidatePromotionDecision_resultHash_check" CHECK ("resultHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidatePromotionDecision_decisionHash_check" CHECK ("decisionHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidatePromotionDecision_supersededDecisionHash_check" CHECK ("supersededDecisionHash" IS NULL OR "supersededDecisionHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidatePromotionDecision_supersededPolicyHash_check" CHECK ("supersededPolicyHash" IS NULL OR "supersededPolicyHash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "CandidatePromotionDecision_supersession_binding_check" CHECK (
    ("supersededDecisionId" IS NULL AND "supersededDecisionHash" IS NULL AND "supersededPolicyHash" IS NULL)
    OR ("supersededDecisionId" IS NOT NULL AND "supersededDecisionHash" IS NOT NULL AND "supersededPolicyHash" IS NOT NULL)
  ),
  CONSTRAINT "CandidatePromotionDecision_self_supersession_check" CHECK ("supersededDecisionId" IS NULL OR "id" <> "supersededDecisionId"),
  CONSTRAINT "CandidatePromotionDecision_operator_check" CHECK (btrim("operator") <> ''),
  CONSTRAINT "CandidatePromotionDecision_authority_check" CHECK (btrim("authority") <> '')
);

CREATE UNIQUE INDEX "CandidateContentUnit_sourceKind_sourceKey_sourceVersionHash_key"
  ON "CandidateContentUnit"("sourceKind", "sourceKey", "sourceVersionHash", "unitType", "ordinal");
CREATE INDEX "CandidateContentUnit_sourceKey_idx" ON "CandidateContentUnit"("sourceKey");
CREATE INDEX "CandidateContentUnit_contentHash_idx" ON "CandidateContentUnit"("contentHash");

CREATE UNIQUE INDEX "CandidateAnalysisRun_idempotencyKey_key" ON "CandidateAnalysisRun"("idempotencyKey");
CREATE UNIQUE INDEX "CandidateAnalysisRun_id_scopeHash_key" ON "CandidateAnalysisRun"("id", "scopeHash");
CREATE INDEX "CandidateAnalysisRun_workflowId_workflowVersion_idx" ON "CandidateAnalysisRun"("workflowId", "workflowVersion");
CREATE INDEX "CandidateAnalysisRun_createdAt_idx" ON "CandidateAnalysisRun"("createdAt");

CREATE UNIQUE INDEX "CandidateAnalysisRunInput_runId_position_key" ON "CandidateAnalysisRunInput"("runId", "position");
CREATE UNIQUE INDEX "CandidateAnalysisRunInput_runId_contentUnitId_key" ON "CandidateAnalysisRunInput"("runId", "contentUnitId");
CREATE UNIQUE INDEX "CandidateAnalysisRunEvent_runId_sequence_key" ON "CandidateAnalysisRunEvent"("runId", "sequence");
CREATE UNIQUE INDEX "CandidateAnalysisRunEvent_runId_eventHash_key" ON "CandidateAnalysisRunEvent"("runId", "eventHash");
CREATE UNIQUE INDEX "CandidateAnalysisRunEvent_id_eventHash_runId_scopeHash_key" ON "CandidateAnalysisRunEvent"("id", "eventHash", "runId", "scopeHash");
CREATE UNIQUE INDEX "CandidateAnalysisArtifact_runId_payloadHash_key" ON "CandidateAnalysisArtifact"("runId", "payloadHash");
CREATE UNIQUE INDEX "CandidateAssertion_runId_payloadHash_key" ON "CandidateAssertion"("runId", "payloadHash");
CREATE UNIQUE INDEX "CandidateAssertion_id_payloadHash_key" ON "CandidateAssertion"("id", "payloadHash");
CREATE UNIQUE INDEX "CandidateAssertion_id_payloadHash_scopeHash_key" ON "CandidateAssertion"("id", "payloadHash", "scopeHash");
CREATE INDEX "CandidateAssertion_assertionType_idx" ON "CandidateAssertion"("assertionType");
CREATE INDEX "CandidateAssertion_machineUse_idx" ON "CandidateAssertion"("machineUse");
CREATE INDEX "CandidateAssertion_identityConfidence_idx" ON "CandidateAssertion"("identityConfidence");
CREATE INDEX "CandidateAssertion_evidenceLevel_idx" ON "CandidateAssertion"("evidenceLevel");
CREATE UNIQUE INDEX "CandidateEvidenceLink_assertionId_contentUnitId_relation_lo_key" ON "CandidateEvidenceLink"("assertionId", "contentUnitId", "relation", "locatorHash");
CREATE UNIQUE INDEX "CandidateDependency_assertionId_upstreamAssertionId_relatio_key" ON "CandidateDependency"("assertionId", "upstreamAssertionId", "relation");
CREATE UNIQUE INDEX "CandidateReconciliationSnapshot_runId_payloadHash_key" ON "CandidateReconciliationSnapshot"("runId", "payloadHash");
CREATE UNIQUE INDEX "CandidateHumanReviewDecision_id_assertionId_key" ON "CandidateHumanReviewDecision"("id", "assertionId");
CREATE UNIQUE INDEX "CandidateHumanReviewDecision_id_decisionHash_assertionId_key" ON "CandidateHumanReviewDecision"("id", "decisionHash", "assertionId");
CREATE UNIQUE INDEX "CandidateHumanReviewDecision_id_decisionHash_assertionId_reviewProfile_reviewProfileHash_key" ON "CandidateHumanReviewDecision"("id", "decisionHash", "assertionId", "reviewProfile", "reviewProfileHash");
CREATE INDEX "CandidateHumanReviewDecision_assertionId_idx" ON "CandidateHumanReviewDecision"("assertionId");
CREATE INDEX "CandidateHumanReviewDecision_decision_idx" ON "CandidateHumanReviewDecision"("decision");
CREATE INDEX "CandidateHumanReviewDecision_reviewProfile_idx" ON "CandidateHumanReviewDecision"("reviewProfile");
CREATE INDEX "CandidatePromotionDecision_assertionId_idx" ON "CandidatePromotionDecision"("assertionId");
CREATE INDEX "CandidatePromotionDecision_targetProfile_state_idx" ON "CandidatePromotionDecision"("targetProfile", "state");
CREATE UNIQUE INDEX "CandidatePromotionDecision_id_decisionHash_assertionId_targetProfile_targetProfileHash_policyHash_key" ON "CandidatePromotionDecision"("id", "decisionHash", "assertionId", "targetProfile", "targetProfileHash", "policyHash");

ALTER TABLE "CandidateAnalysisRun"
  ADD CONSTRAINT "CandidateAnalysisRun_predecessorRunId_fkey" FOREIGN KEY ("predecessorRunId") REFERENCES "CandidateAnalysisRun"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "CandidateAnalysisRunInput"
  ADD CONSTRAINT "CandidateAnalysisRunInput_runId_fkey" FOREIGN KEY ("runId") REFERENCES "CandidateAnalysisRun"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT "CandidateAnalysisRunInput_contentUnitId_fkey" FOREIGN KEY ("contentUnitId") REFERENCES "CandidateContentUnit"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "CandidateAnalysisRunEvent"
  ADD CONSTRAINT "CandidateRunEvent_run_scope_fkey" FOREIGN KEY ("runId", "scopeHash") REFERENCES "CandidateAnalysisRun"("id", "scopeHash") ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT "CandidateRunEvent_supersession_hash_scope_fkey" FOREIGN KEY ("supersededEventId", "supersededEventHash", "runId", "supersededEventScopeHash") REFERENCES "CandidateAnalysisRunEvent"("id", "eventHash", "runId", "scopeHash") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "CandidateAnalysisArtifact"
  ADD CONSTRAINT "CandidateAnalysisArtifact_runId_fkey" FOREIGN KEY ("runId") REFERENCES "CandidateAnalysisRun"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "CandidateAssertion"
  ADD CONSTRAINT "CandidateAssertion_runId_fkey" FOREIGN KEY ("runId") REFERENCES "CandidateAnalysisRun"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT "CandidateAssertion_supersession_hash_scope_fkey" FOREIGN KEY ("supersededAssertionId", "supersededAssertionPayloadHash", "scopeHash") REFERENCES "CandidateAssertion"("id", "payloadHash", "scopeHash") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "CandidateEvidenceLink"
  ADD CONSTRAINT "CandidateEvidenceLink_assertionId_fkey" FOREIGN KEY ("assertionId") REFERENCES "CandidateAssertion"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT "CandidateEvidenceLink_contentUnitId_fkey" FOREIGN KEY ("contentUnitId") REFERENCES "CandidateContentUnit"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "CandidateDependency"
  ADD CONSTRAINT "CandidateDependency_assertionId_fkey" FOREIGN KEY ("assertionId") REFERENCES "CandidateAssertion"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT "CandidateDependency_upstreamAssertionId_fkey" FOREIGN KEY ("upstreamAssertionId") REFERENCES "CandidateAssertion"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "CandidateReconciliationSnapshot"
  ADD CONSTRAINT "CandidateReconciliationSnapshot_runId_fkey" FOREIGN KEY ("runId") REFERENCES "CandidateAnalysisRun"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "CandidateHumanReviewDecision"
  ADD CONSTRAINT "CandidateHumanReviewDecision_assertionId_assertionPayloadH_fkey" FOREIGN KEY ("assertionId", "assertionPayloadHash") REFERENCES "CandidateAssertion"("id", "payloadHash") ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT "CandidateReview_supersession_receipt_scope_fkey" FOREIGN KEY ("supersededDecisionId", "supersededDecisionHash", "assertionId", "reviewProfile", "reviewProfileHash") REFERENCES "CandidateHumanReviewDecision"("id", "decisionHash", "assertionId", "reviewProfile", "reviewProfileHash") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "CandidatePromotionDecision"
  ADD CONSTRAINT "CandidatePromotionDecision_assertionId_assertionPayloadHash_fkey" FOREIGN KEY ("assertionId", "assertionPayloadHash") REFERENCES "CandidateAssertion"("id", "payloadHash") ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT "CandidatePromotion_review_receipt_fkey" FOREIGN KEY ("reviewDecisionId", "reviewDecisionHash", "assertionId") REFERENCES "CandidateHumanReviewDecision"("id", "decisionHash", "assertionId") ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT "CandidatePromotion_supersession_receipt_scope_fkey" FOREIGN KEY ("supersededDecisionId", "supersededDecisionHash", "assertionId", "targetProfile", "targetProfileHash", "supersededPolicyHash") REFERENCES "CandidatePromotionDecision"("id", "decisionHash", "assertionId", "targetProfile", "targetProfileHash", "policyHash") ON DELETE RESTRICT ON UPDATE RESTRICT;

CREATE FUNCTION public.reject_candidate_history_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $function$
BEGIN
  RAISE EXCEPTION '% is immutable: % is not permitted', TG_TABLE_NAME, TG_OP;
END
$function$;

REVOKE ALL ON FUNCTION public.reject_candidate_history_change() FROM PUBLIC;

CREATE FUNCTION public.reject_invalid_candidate_machine_payload()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $function$
DECLARE
  candidate_payload JSONB := NEW."payload";
  expected_kind TEXT;
  payload_keys TEXT[];
  data_keys TEXT[];
  entry_keys TEXT[];
  entry JSONB;
  manifest JSONB;
  manifest_item JSONB;
  manifest_text JSONB;
  last_id TEXT;
  expected_position INTEGER := 0;
  seen_content_unit_ids TEXT[] := ARRAY[]::TEXT[];
BEGIN
  IF TG_TABLE_NAME = 'CandidateAnalysisArtifact' THEN
    expected_kind := 'artifact';
  ELSIF TG_TABLE_NAME = 'CandidateAssertion' THEN
    expected_kind := 'assertion';
  ELSIF TG_TABLE_NAME = 'CandidateReconciliationSnapshot' THEN
    expected_kind := 'reconciliation';
  ELSIF TG_TABLE_NAME = 'CandidateAnalysisRunEvent' THEN
    IF NEW."eventType" IN ('candidate_completed', 'partial_completed') THEN
      expected_kind := 'run_terminal';
    ELSIF NEW."eventType" = 'superseded' THEN
      expected_kind := 'run_supersession';
    ELSE
      expected_kind := 'run_event';
      IF candidate_payload IS NULL THEN
        RETURN NEW;
      END IF;
    END IF;
  ELSE
    RAISE EXCEPTION 'invalid candidate machine payload';
  END IF;

  IF jsonb_typeof(candidate_payload) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION 'invalid candidate machine payload';
  END IF;
  SELECT array_agg(key ORDER BY key)
    INTO payload_keys
    FROM jsonb_object_keys(candidate_payload) AS key;
  IF payload_keys IS DISTINCT FROM ARRAY['data', 'kind', 'namespace']::TEXT[]
    OR candidate_payload->>'namespace' IS DISTINCT FROM 'candidate'
    OR candidate_payload->>'kind' IS DISTINCT FROM expected_kind
    OR jsonb_typeof(candidate_payload->'data') IS DISTINCT FROM 'object'
  THEN
    RAISE EXCEPTION 'invalid candidate machine payload';
  END IF;

  IF expected_kind IN ('artifact', 'assertion', 'reconciliation', 'run_event') THEN
    SELECT array_agg(key ORDER BY key)
      INTO data_keys
      FROM jsonb_object_keys(candidate_payload->'data') AS key;
    IF data_keys IS DISTINCT FROM ARRAY['entries']::TEXT[]
      OR jsonb_typeof(candidate_payload->'data'->'entries') IS DISTINCT FROM 'array'
      OR jsonb_array_length(candidate_payload->'data'->'entries') = 0
    THEN
      RAISE EXCEPTION 'invalid candidate machine payload';
    END IF;

    FOR entry IN
      SELECT value FROM jsonb_array_elements(candidate_payload->'data'->'entries')
    LOOP
      IF jsonb_typeof(entry) IS DISTINCT FROM 'object'
        OR jsonb_typeof(entry->'role') IS DISTINCT FROM 'string'
        OR NOT (entry->>'role' = ANY (ARRAY[
          'summary', 'proposition', 'observation', 'classification_label',
          'entity_candidate', 'relationship_candidate', 'quantitative_observation',
          'coverage_signal', 'gap', 'contradiction', 'source_role_suggestion',
          'reason', 'worker_reference', 'checkpoint', 'scope_reference', 'limitation'
        ]::TEXT[]))
        OR jsonb_typeof(entry->'valueType') IS DISTINCT FROM 'string'
      THEN
        RAISE EXCEPTION 'invalid candidate machine payload';
      END IF;
      SELECT array_agg(key ORDER BY key)
        INTO entry_keys
        FROM jsonb_object_keys(entry) AS key;
      CASE entry->>'valueType'
        WHEN 'text' THEN
          IF entry_keys IS DISTINCT FROM ARRAY['role', 'value', 'valueType']::TEXT[]
            OR jsonb_typeof(entry->'value') IS DISTINCT FROM 'string'
            OR length(entry->>'value') = 0
          THEN
            RAISE EXCEPTION 'invalid candidate machine payload';
          END IF;
        WHEN 'number' THEN
          IF entry_keys IS DISTINCT FROM ARRAY['role', 'unit', 'value', 'valueType']::TEXT[]
            OR jsonb_typeof(entry->'value') IS DISTINCT FROM 'number'
            OR (
              jsonb_typeof(entry->'unit') IS DISTINCT FROM 'null'
              AND (
                jsonb_typeof(entry->'unit') IS DISTINCT FROM 'string'
                OR length(entry->>'unit') = 0
              )
            )
          THEN
            RAISE EXCEPTION 'invalid candidate machine payload';
          END IF;
          IF (entry->>'value')::NUMERIC < '-1.7976931348623157e308'::NUMERIC
            OR (entry->>'value')::NUMERIC > '1.7976931348623157e308'::NUMERIC
          THEN
            RAISE EXCEPTION 'invalid candidate machine payload';
          END IF;
        WHEN 'flag' THEN
          IF entry_keys IS DISTINCT FROM ARRAY['role', 'value', 'valueType']::TEXT[]
            OR jsonb_typeof(entry->'value') IS DISTINCT FROM 'boolean'
          THEN
            RAISE EXCEPTION 'invalid candidate machine payload';
          END IF;
        WHEN 'reference' THEN
          IF entry_keys IS DISTINCT FROM ARRAY['role', 'targetId', 'targetType', 'valueType']::TEXT[]
            OR jsonb_typeof(entry->'targetType') IS DISTINCT FROM 'string'
            OR NOT (entry->>'targetType' = ANY (ARRAY[
              'content_unit', 'run', 'artifact', 'assertion', 'evidence_link',
              'dependency', 'reconciliation'
            ]::TEXT[]))
            OR jsonb_typeof(entry->'targetId') IS DISTINCT FROM 'string'
            OR entry->>'targetId' !~ '^[a-z0-9][a-z0-9._:-]*$'
          THEN
            RAISE EXCEPTION 'invalid candidate machine payload';
          END IF;
        ELSE
          RAISE EXCEPTION 'invalid candidate machine payload';
      END CASE;
    END LOOP;
    RETURN NEW;
  END IF;

  IF expected_kind = 'run_supersession' THEN
    SELECT array_agg(key ORDER BY key)
      INTO data_keys
      FROM jsonb_object_keys(candidate_payload->'data') AS key;
    IF data_keys IS DISTINCT FROM ARRAY['reason']::TEXT[]
      OR jsonb_typeof(candidate_payload->'data'->'reason') IS DISTINCT FROM 'string'
      OR length(candidate_payload->'data'->>'reason') = 0
    THEN
      RAISE EXCEPTION 'invalid candidate machine payload';
    END IF;
    RETURN NEW;
  END IF;

  SELECT array_agg(key ORDER BY key)
    INTO data_keys
    FROM jsonb_object_keys(candidate_payload->'data') AS key;
  IF data_keys IS DISTINCT FROM ARRAY['manifest', 'manifestHash']::TEXT[]
    OR jsonb_typeof(candidate_payload->'data'->'manifest') IS DISTINCT FROM 'object'
    OR jsonb_typeof(candidate_payload->'data'->'manifestHash') IS DISTINCT FROM 'string'
    OR candidate_payload->'data'->>'manifestHash' !~ '^[0-9a-f]{64}$'
  THEN
    RAISE EXCEPTION 'invalid candidate machine payload';
  END IF;
  manifest := candidate_payload->'data'->'manifest';
  SELECT array_agg(key ORDER BY key)
    INTO payload_keys
    FROM jsonb_object_keys(manifest) AS key;
  IF payload_keys IS DISTINCT FROM ARRAY[
      'artifacts', 'assertions', 'dependencies', 'evidenceLinks', 'inputs',
      'reconciliationSnapshots', 'schemaVersion'
    ]::TEXT[]
    OR manifest->>'schemaVersion' IS DISTINCT FROM 'candidate-output-manifest-v1'
    OR jsonb_typeof(manifest->'inputs') IS DISTINCT FROM 'array'
    OR jsonb_typeof(manifest->'artifacts') IS DISTINCT FROM 'array'
    OR jsonb_typeof(manifest->'assertions') IS DISTINCT FROM 'array'
    OR jsonb_typeof(manifest->'evidenceLinks') IS DISTINCT FROM 'array'
    OR jsonb_typeof(manifest->'dependencies') IS DISTINCT FROM 'array'
    OR jsonb_typeof(manifest->'reconciliationSnapshots') IS DISTINCT FROM 'array'
  THEN
    RAISE EXCEPTION 'invalid candidate machine payload';
  END IF;

  FOR manifest_item IN SELECT value FROM jsonb_array_elements(manifest->'inputs') LOOP
    SELECT array_agg(key ORDER BY key) INTO entry_keys FROM jsonb_object_keys(manifest_item) AS key;
    IF jsonb_typeof(manifest_item) IS DISTINCT FROM 'object'
      OR entry_keys IS DISTINCT FROM ARRAY['contentHash', 'contentUnitId', 'identityConfidence', 'position']::TEXT[]
      OR jsonb_typeof(manifest_item->'contentUnitId') IS DISTINCT FROM 'string'
      OR manifest_item->>'contentUnitId' !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR jsonb_typeof(manifest_item->'position') IS DISTINCT FROM 'number'
      OR manifest_item->>'position' !~ '^(0|[1-9][0-9]*)$'
      OR (manifest_item->>'position')::INTEGER <> expected_position
      OR jsonb_typeof(manifest_item->'contentHash') IS DISTINCT FROM 'string'
      OR manifest_item->>'contentHash' !~ '^[0-9a-f]{64}$'
      OR jsonb_typeof(manifest_item->'identityConfidence') IS DISTINCT FROM 'string'
      OR NOT (manifest_item->>'identityConfidence' = ANY (ARRAY['exact', 'provisional', 'unresolved']::TEXT[]))
      OR manifest_item->>'contentUnitId' = ANY (seen_content_unit_ids)
    THEN
      RAISE EXCEPTION 'invalid candidate machine payload';
    END IF;
    seen_content_unit_ids := array_append(seen_content_unit_ids, manifest_item->>'contentUnitId');
    expected_position := expected_position + 1;
  END LOOP;

  last_id := NULL;
  FOR manifest_item IN SELECT value FROM jsonb_array_elements(manifest->'artifacts') LOOP
    SELECT array_agg(key ORDER BY key) INTO entry_keys FROM jsonb_object_keys(manifest_item) AS key;
    IF jsonb_typeof(manifest_item) IS DISTINCT FROM 'object'
      OR entry_keys IS DISTINCT FROM ARRAY['artifactType', 'id', 'payloadHash', 'schemaVersion']::TEXT[]
      OR jsonb_typeof(manifest_item->'id') IS DISTINCT FROM 'string'
      OR manifest_item->>'id' !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR jsonb_typeof(manifest_item->'artifactType') IS DISTINCT FROM 'string'
      OR manifest_item->>'artifactType' !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR manifest_item->>'schemaVersion' IS DISTINCT FROM 'candidate-analysis-v1'
      OR jsonb_typeof(manifest_item->'payloadHash') IS DISTINCT FROM 'string'
      OR manifest_item->>'payloadHash' !~ '^[0-9a-f]{64}$'
      OR (last_id IS NOT NULL AND manifest_item->>'id' <= last_id)
    THEN
      RAISE EXCEPTION 'invalid candidate machine payload';
    END IF;
    last_id := manifest_item->>'id';
  END LOOP;

  last_id := NULL;
  FOR manifest_item IN SELECT value FROM jsonb_array_elements(manifest->'assertions') LOOP
    SELECT array_agg(key ORDER BY key) INTO entry_keys FROM jsonb_object_keys(manifest_item) AS key;
    IF jsonb_typeof(manifest_item) IS DISTINCT FROM 'object'
      OR entry_keys IS DISTINCT FROM ARRAY[
        'assertionType', 'confidence', 'evidenceLevel', 'id', 'identityConfidence',
        'limitations', 'machineUse', 'payloadHash', 'schemaVersion', 'scopeHash',
        'scopeKey', 'supersededAssertionId', 'supersededAssertionPayloadHash'
      ]::TEXT[]
      OR jsonb_typeof(manifest_item->'id') IS DISTINCT FROM 'string'
      OR manifest_item->>'id' !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR jsonb_typeof(manifest_item->'assertionType') IS DISTINCT FROM 'string'
      OR NOT (manifest_item->>'assertionType' = ANY (ARRAY[
        'claim', 'classification', 'entity_link', 'relationship',
        'quantitative_observation', 'coverage_signal', 'gap', 'contradiction',
        'source_role_suggestion'
      ]::TEXT[]))
      OR manifest_item->>'schemaVersion' IS DISTINCT FROM 'candidate-analysis-v1'
      OR jsonb_typeof(manifest_item->'payloadHash') IS DISTINCT FROM 'string'
      OR manifest_item->>'payloadHash' !~ '^[0-9a-f]{64}$'
      OR NOT (jsonb_typeof(manifest_item->'confidence') IN ('null', 'number'))
      OR (jsonb_typeof(manifest_item->'confidence') = 'number' AND ((manifest_item->>'confidence')::NUMERIC < 0 OR (manifest_item->>'confidence')::NUMERIC > 1))
      OR jsonb_typeof(manifest_item->'machineUse') IS DISTINCT FROM 'string'
      OR NOT (manifest_item->>'machineUse' = ANY (ARRAY['candidate_only', 'reusable_for_ai_context', 'quarantined']::TEXT[]))
      OR jsonb_typeof(manifest_item->'identityConfidence') IS DISTINCT FROM 'string'
      OR NOT (manifest_item->>'identityConfidence' = ANY (ARRAY['exact', 'provisional', 'unresolved']::TEXT[]))
      OR jsonb_typeof(manifest_item->'evidenceLevel') IS DISTINCT FROM 'string'
      OR NOT (manifest_item->>'evidenceLevel' = ANY (ARRAY['exact_locator', 'partial_locator', 'no_locator']::TEXT[]))
      OR jsonb_typeof(manifest_item->'limitations') IS DISTINCT FROM 'array'
      OR jsonb_typeof(manifest_item->'scopeKey') IS DISTINCT FROM 'string'
      OR manifest_item->>'scopeKey' !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR jsonb_typeof(manifest_item->'scopeHash') IS DISTINCT FROM 'string'
      OR manifest_item->>'scopeHash' !~ '^[0-9a-f]{64}$'
      OR NOT (jsonb_typeof(manifest_item->'supersededAssertionId') IN ('null', 'string'))
      OR (jsonb_typeof(manifest_item->'supersededAssertionId') = 'string' AND manifest_item->>'supersededAssertionId' !~ '^[a-z0-9][a-z0-9._:-]*$')
      OR NOT (jsonb_typeof(manifest_item->'supersededAssertionPayloadHash') IN ('null', 'string'))
      OR (jsonb_typeof(manifest_item->'supersededAssertionPayloadHash') = 'string' AND manifest_item->>'supersededAssertionPayloadHash' !~ '^[0-9a-f]{64}$')
      OR (last_id IS NOT NULL AND manifest_item->>'id' <= last_id)
    THEN
      RAISE EXCEPTION 'invalid candidate machine payload';
    END IF;
    FOR manifest_text IN SELECT value FROM jsonb_array_elements(manifest_item->'limitations') LOOP
      IF jsonb_typeof(manifest_text) IS DISTINCT FROM 'string' OR length(manifest_text#>>'{}') = 0 THEN
        RAISE EXCEPTION 'invalid candidate machine payload';
      END IF;
    END LOOP;
    last_id := manifest_item->>'id';
  END LOOP;

  last_id := NULL;
  FOR manifest_item IN SELECT value FROM jsonb_array_elements(manifest->'evidenceLinks') LOOP
    SELECT array_agg(key ORDER BY key) INTO entry_keys FROM jsonb_object_keys(manifest_item) AS key;
    IF jsonb_typeof(manifest_item) IS DISTINCT FROM 'object'
      OR entry_keys IS DISTINCT FROM ARRAY['assertionId', 'contentUnitId', 'excerptHash', 'id', 'locatorHash', 'relation']::TEXT[]
      OR jsonb_typeof(manifest_item->'id') IS DISTINCT FROM 'string'
      OR manifest_item->>'id' !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR jsonb_typeof(manifest_item->'assertionId') IS DISTINCT FROM 'string'
      OR manifest_item->>'assertionId' !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR jsonb_typeof(manifest_item->'contentUnitId') IS DISTINCT FROM 'string'
      OR manifest_item->>'contentUnitId' !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR jsonb_typeof(manifest_item->'relation') IS DISTINCT FROM 'string'
      OR NOT (manifest_item->>'relation' = ANY (ARRAY['supports', 'contradicts', 'contextualizes']::TEXT[]))
      OR jsonb_typeof(manifest_item->'locatorHash') IS DISTINCT FROM 'string'
      OR manifest_item->>'locatorHash' !~ '^[0-9a-f]{64}$'
      OR NOT (jsonb_typeof(manifest_item->'excerptHash') IN ('null', 'string'))
      OR (jsonb_typeof(manifest_item->'excerptHash') = 'string' AND manifest_item->>'excerptHash' !~ '^[0-9a-f]{64}$')
      OR (last_id IS NOT NULL AND manifest_item->>'id' <= last_id)
    THEN
      RAISE EXCEPTION 'invalid candidate machine payload';
    END IF;
    last_id := manifest_item->>'id';
  END LOOP;

  last_id := NULL;
  FOR manifest_item IN SELECT value FROM jsonb_array_elements(manifest->'dependencies') LOOP
    SELECT array_agg(key ORDER BY key) INTO entry_keys FROM jsonb_object_keys(manifest_item) AS key;
    IF jsonb_typeof(manifest_item) IS DISTINCT FROM 'object'
      OR entry_keys IS DISTINCT FROM ARRAY['assertionId', 'id', 'inheritedLimitations', 'relation', 'upstreamAssertionId']::TEXT[]
      OR jsonb_typeof(manifest_item->'id') IS DISTINCT FROM 'string'
      OR manifest_item->>'id' !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR jsonb_typeof(manifest_item->'assertionId') IS DISTINCT FROM 'string'
      OR manifest_item->>'assertionId' !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR jsonb_typeof(manifest_item->'upstreamAssertionId') IS DISTINCT FROM 'string'
      OR manifest_item->>'upstreamAssertionId' !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR jsonb_typeof(manifest_item->'relation') IS DISTINCT FROM 'string'
      OR manifest_item->>'relation' !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR jsonb_typeof(manifest_item->'inheritedLimitations') IS DISTINCT FROM 'array'
      OR (last_id IS NOT NULL AND manifest_item->>'id' <= last_id)
    THEN
      RAISE EXCEPTION 'invalid candidate machine payload';
    END IF;
    FOR manifest_text IN SELECT value FROM jsonb_array_elements(manifest_item->'inheritedLimitations') LOOP
      IF jsonb_typeof(manifest_text) IS DISTINCT FROM 'string' OR length(manifest_text#>>'{}') = 0 THEN
        RAISE EXCEPTION 'invalid candidate machine payload';
      END IF;
    END LOOP;
    last_id := manifest_item->>'id';
  END LOOP;

  last_id := NULL;
  FOR manifest_item IN SELECT value FROM jsonb_array_elements(manifest->'reconciliationSnapshots') LOOP
    SELECT array_agg(key ORDER BY key) INTO entry_keys FROM jsonb_object_keys(manifest_item) AS key;
    IF jsonb_typeof(manifest_item) IS DISTINCT FROM 'object'
      OR entry_keys IS DISTINCT FROM ARRAY['conflictCount', 'id', 'payloadHash', 'scopeHash']::TEXT[]
      OR jsonb_typeof(manifest_item->'id') IS DISTINCT FROM 'string'
      OR manifest_item->>'id' !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR jsonb_typeof(manifest_item->'scopeHash') IS DISTINCT FROM 'string'
      OR manifest_item->>'scopeHash' !~ '^[0-9a-f]{64}$'
      OR jsonb_typeof(manifest_item->'payloadHash') IS DISTINCT FROM 'string'
      OR manifest_item->>'payloadHash' !~ '^[0-9a-f]{64}$'
      OR jsonb_typeof(manifest_item->'conflictCount') IS DISTINCT FROM 'number'
      OR manifest_item->>'conflictCount' !~ '^(0|[1-9][0-9]*)$'
      OR (last_id IS NOT NULL AND manifest_item->>'id' <= last_id)
    THEN
      RAISE EXCEPTION 'invalid candidate machine payload';
    END IF;
    last_id := manifest_item->>'id';
  END LOOP;

  RETURN NEW;
END
$function$;

REVOKE ALL ON FUNCTION public.reject_invalid_candidate_machine_payload() FROM PUBLIC;

REVOKE ALL PRIVILEGES ON TABLE "CandidateContentUnit" FROM PUBLIC;
CREATE TRIGGER "CandidateContentUnit_reject_update_delete" BEFORE UPDATE OR DELETE ON "CandidateContentUnit" FOR EACH ROW EXECUTE FUNCTION public.reject_candidate_history_change();
CREATE TRIGGER "CandidateContentUnit_reject_truncate" BEFORE TRUNCATE ON "CandidateContentUnit" FOR EACH STATEMENT EXECUTE FUNCTION public.reject_candidate_history_change();

REVOKE ALL PRIVILEGES ON TABLE "CandidateAnalysisRun" FROM PUBLIC;
CREATE TRIGGER "CandidateAnalysisRun_reject_update_delete" BEFORE UPDATE OR DELETE ON "CandidateAnalysisRun" FOR EACH ROW EXECUTE FUNCTION public.reject_candidate_history_change();
CREATE TRIGGER "CandidateAnalysisRun_reject_truncate" BEFORE TRUNCATE ON "CandidateAnalysisRun" FOR EACH STATEMENT EXECUTE FUNCTION public.reject_candidate_history_change();

REVOKE ALL PRIVILEGES ON TABLE "CandidateAnalysisRunInput" FROM PUBLIC;
CREATE TRIGGER "CandidateAnalysisRunInput_reject_update_delete" BEFORE UPDATE OR DELETE ON "CandidateAnalysisRunInput" FOR EACH ROW EXECUTE FUNCTION public.reject_candidate_history_change();
CREATE TRIGGER "CandidateAnalysisRunInput_reject_truncate" BEFORE TRUNCATE ON "CandidateAnalysisRunInput" FOR EACH STATEMENT EXECUTE FUNCTION public.reject_candidate_history_change();

REVOKE ALL PRIVILEGES ON TABLE "CandidateAnalysisRunEvent" FROM PUBLIC;
CREATE TRIGGER "CandidateAnalysisRunEvent_reject_invalid_machine_payload" BEFORE INSERT ON "CandidateAnalysisRunEvent" FOR EACH ROW EXECUTE FUNCTION public.reject_invalid_candidate_machine_payload();
CREATE TRIGGER "CandidateAnalysisRunEvent_reject_update_delete" BEFORE UPDATE OR DELETE ON "CandidateAnalysisRunEvent" FOR EACH ROW EXECUTE FUNCTION public.reject_candidate_history_change();
CREATE TRIGGER "CandidateAnalysisRunEvent_reject_truncate" BEFORE TRUNCATE ON "CandidateAnalysisRunEvent" FOR EACH STATEMENT EXECUTE FUNCTION public.reject_candidate_history_change();

REVOKE ALL PRIVILEGES ON TABLE "CandidateAnalysisArtifact" FROM PUBLIC;
CREATE TRIGGER "CandidateAnalysisArtifact_reject_invalid_machine_payload" BEFORE INSERT ON "CandidateAnalysisArtifact" FOR EACH ROW EXECUTE FUNCTION public.reject_invalid_candidate_machine_payload();
CREATE TRIGGER "CandidateAnalysisArtifact_reject_update_delete" BEFORE UPDATE OR DELETE ON "CandidateAnalysisArtifact" FOR EACH ROW EXECUTE FUNCTION public.reject_candidate_history_change();
CREATE TRIGGER "CandidateAnalysisArtifact_reject_truncate" BEFORE TRUNCATE ON "CandidateAnalysisArtifact" FOR EACH STATEMENT EXECUTE FUNCTION public.reject_candidate_history_change();

REVOKE ALL PRIVILEGES ON TABLE "CandidateAssertion" FROM PUBLIC;
CREATE TRIGGER "CandidateAssertion_reject_invalid_machine_payload" BEFORE INSERT ON "CandidateAssertion" FOR EACH ROW EXECUTE FUNCTION public.reject_invalid_candidate_machine_payload();
CREATE TRIGGER "CandidateAssertion_reject_update_delete" BEFORE UPDATE OR DELETE ON "CandidateAssertion" FOR EACH ROW EXECUTE FUNCTION public.reject_candidate_history_change();
CREATE TRIGGER "CandidateAssertion_reject_truncate" BEFORE TRUNCATE ON "CandidateAssertion" FOR EACH STATEMENT EXECUTE FUNCTION public.reject_candidate_history_change();

REVOKE ALL PRIVILEGES ON TABLE "CandidateEvidenceLink" FROM PUBLIC;
CREATE TRIGGER "CandidateEvidenceLink_reject_update_delete" BEFORE UPDATE OR DELETE ON "CandidateEvidenceLink" FOR EACH ROW EXECUTE FUNCTION public.reject_candidate_history_change();
CREATE TRIGGER "CandidateEvidenceLink_reject_truncate" BEFORE TRUNCATE ON "CandidateEvidenceLink" FOR EACH STATEMENT EXECUTE FUNCTION public.reject_candidate_history_change();

REVOKE ALL PRIVILEGES ON TABLE "CandidateDependency" FROM PUBLIC;
CREATE TRIGGER "CandidateDependency_reject_update_delete" BEFORE UPDATE OR DELETE ON "CandidateDependency" FOR EACH ROW EXECUTE FUNCTION public.reject_candidate_history_change();
CREATE TRIGGER "CandidateDependency_reject_truncate" BEFORE TRUNCATE ON "CandidateDependency" FOR EACH STATEMENT EXECUTE FUNCTION public.reject_candidate_history_change();

REVOKE ALL PRIVILEGES ON TABLE "CandidateReconciliationSnapshot" FROM PUBLIC;
CREATE TRIGGER "CandidateReconciliationSnapshot_reject_invalid_machine_payload" BEFORE INSERT ON "CandidateReconciliationSnapshot" FOR EACH ROW EXECUTE FUNCTION public.reject_invalid_candidate_machine_payload();
CREATE TRIGGER "CandidateReconciliationSnapshot_reject_update_delete" BEFORE UPDATE OR DELETE ON "CandidateReconciliationSnapshot" FOR EACH ROW EXECUTE FUNCTION public.reject_candidate_history_change();
CREATE TRIGGER "CandidateReconciliationSnapshot_reject_truncate" BEFORE TRUNCATE ON "CandidateReconciliationSnapshot" FOR EACH STATEMENT EXECUTE FUNCTION public.reject_candidate_history_change();

REVOKE ALL PRIVILEGES ON TABLE "CandidateHumanReviewDecision" FROM PUBLIC;
CREATE TRIGGER "CandidateHumanReviewDecision_reject_update_delete" BEFORE UPDATE OR DELETE ON "CandidateHumanReviewDecision" FOR EACH ROW EXECUTE FUNCTION public.reject_candidate_history_change();
CREATE TRIGGER "CandidateHumanReviewDecision_reject_truncate" BEFORE TRUNCATE ON "CandidateHumanReviewDecision" FOR EACH STATEMENT EXECUTE FUNCTION public.reject_candidate_history_change();

REVOKE ALL PRIVILEGES ON TABLE "CandidatePromotionDecision" FROM PUBLIC;
CREATE TRIGGER "CandidatePromotionDecision_reject_update_delete" BEFORE UPDATE OR DELETE ON "CandidatePromotionDecision" FOR EACH ROW EXECUTE FUNCTION public.reject_candidate_history_change();
CREATE TRIGGER "CandidatePromotionDecision_reject_truncate" BEFORE TRUNCATE ON "CandidatePromotionDecision" FOR EACH STATEMENT EXECUTE FUNCTION public.reject_candidate_history_change();
