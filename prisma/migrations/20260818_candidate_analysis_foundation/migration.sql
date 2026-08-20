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

CREATE FUNCTION public.candidate_json_number_to_javascript(candidate_number JSONB)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
STRICT
SET search_path = pg_catalog, public
SET extra_float_digits = 1
AS $function$
DECLARE
  numeric_value NUMERIC;
  float_value DOUBLE PRECISION;
  float_text TEXT;
  sign_text TEXT := '';
  mantissa TEXT;
  digits TEXT;
  exponent_value INTEGER;
  decimal_index INTEGER;
  dot_index INTEGER;
BEGIN
  IF jsonb_typeof(candidate_number) IS DISTINCT FROM 'number' THEN
    RAISE EXCEPTION 'invalid candidate machine payload';
  END IF;
  numeric_value := (candidate_number #>> '{}')::NUMERIC;
  BEGIN
    float_value := numeric_value::DOUBLE PRECISION;
  EXCEPTION WHEN numeric_value_out_of_range THEN
    RAISE EXCEPTION 'invalid candidate machine payload';
  END;
  float_text := float_value::TEXT;
  IF (float_text::NUMERIC) IS DISTINCT FROM numeric_value THEN
    RAISE EXCEPTION 'invalid candidate machine payload';
  END IF;
  IF float_value = 0 THEN
    RETURN '0';
  END IF;

  IF abs(float_value) >= 1e-6::DOUBLE PRECISION
    AND abs(float_value) < 1e21::DOUBLE PRECISION
  THEN
    IF position('e' IN lower(float_text)) = 0 THEN
      RETURN float_text;
    END IF;
    IF left(float_text, 1) = '-' THEN
      sign_text := '-';
      float_text := substr(float_text, 2);
    END IF;
    mantissa := split_part(lower(float_text), 'e', 1);
    exponent_value := split_part(lower(float_text), 'e', 2)::INTEGER;
    dot_index := position('.' IN mantissa);
    decimal_index := (CASE WHEN dot_index = 0 THEN length(mantissa) ELSE dot_index - 1 END)
      + exponent_value;
    digits := replace(mantissa, '.', '');
    IF decimal_index <= 0 THEN
      RETURN sign_text || '0.' || repeat('0', -decimal_index) || digits;
    ELSIF decimal_index >= length(digits) THEN
      RETURN sign_text || digits || repeat('0', decimal_index - length(digits));
    END IF;
    RETURN sign_text || left(digits, decimal_index) || '.' || substr(digits, decimal_index + 1);
  END IF;

  RETURN regexp_replace(lower(float_text), 'e([+-])0+([0-9]+)$', 'e\1\2');
END
$function$;

CREATE FUNCTION public.candidate_canonical_json(candidate_value JSONB)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
STRICT
SET search_path = pg_catalog, public
AS $function$
DECLARE
  value_type TEXT := jsonb_typeof(candidate_value);
  canonical_value TEXT;
BEGIN
  CASE value_type
    WHEN 'null' THEN
      RETURN 'null';
    WHEN 'boolean' THEN
      RETURN candidate_value::TEXT;
    WHEN 'number' THEN
      RETURN public.candidate_json_number_to_javascript(candidate_value);
    WHEN 'string' THEN
      RETURN to_jsonb(candidate_value #>> '{}')::TEXT;
    WHEN 'array' THEN
      SELECT '[' || COALESCE(string_agg(
        public.candidate_canonical_json(item.value), ',' ORDER BY item.ordinality
      ), '') || ']'
        INTO canonical_value
        FROM jsonb_array_elements(candidate_value) WITH ORDINALITY AS item(value, ordinality);
      RETURN canonical_value;
    WHEN 'object' THEN
      SELECT '{' || COALESCE(string_agg(
        to_jsonb(item.key)::TEXT || ':' || public.candidate_canonical_json(item.value),
        ',' ORDER BY convert_to(item.key, 'UTF8')
      ), '') || '}'
        INTO canonical_value
        FROM jsonb_each(candidate_value) AS item(key, value);
      RETURN canonical_value;
    ELSE
      RAISE EXCEPTION 'invalid candidate machine payload';
  END CASE;
END
$function$;

REVOKE ALL ON FUNCTION public.candidate_json_number_to_javascript(JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.candidate_canonical_json(JSONB) FROM PUBLIC;

CREATE FUNCTION public.reject_invalid_candidate_run_scope()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  expected_scope_hash TEXT;
BEGIN
  expected_scope_hash := encode(sha256(convert_to(
    'food-systems/run-scope/v1' || chr(10)
      || public.candidate_canonical_json(jsonb_build_object('runId', NEW."id")),
    'UTF8'
  )), 'hex');
  IF NEW."scopeHash" IS DISTINCT FROM expected_scope_hash THEN
    RAISE EXCEPTION 'invalid candidate run scope';
  END IF;
  RETURN NEW;
END
$function$;

REVOKE ALL ON FUNCTION public.reject_invalid_candidate_run_scope() FROM PUBLIC;

CREATE FUNCTION public.reject_invalid_candidate_machine_payload()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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
          PERFORM public.candidate_json_number_to_javascript(entry->'value');
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
    IF jsonb_typeof(manifest_item->'position') = 'number' THEN
      PERFORM public.candidate_json_number_to_javascript(manifest_item->'position');
    END IF;
    IF jsonb_typeof(manifest_item) IS DISTINCT FROM 'object'
      OR entry_keys IS DISTINCT FROM ARRAY['contentHash', 'contentUnitId', 'identityConfidence', 'position']::TEXT[]
      OR jsonb_typeof(manifest_item->'contentUnitId') IS DISTINCT FROM 'string'
      OR manifest_item->>'contentUnitId' !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR jsonb_typeof(manifest_item->'position') IS DISTINCT FROM 'number'
      OR (manifest_item->>'position')::NUMERIC < 0
      OR trunc((manifest_item->>'position')::NUMERIC) <> (manifest_item->>'position')::NUMERIC
      OR (manifest_item->>'position')::NUMERIC <> expected_position
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
      OR (jsonb_typeof(manifest_item->'confidence') = 'number' AND (
        public.candidate_json_number_to_javascript(manifest_item->'confidence') IS NULL
        OR (manifest_item->>'confidence')::NUMERIC < 0
        OR (manifest_item->>'confidence')::NUMERIC > 1
      ))
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
    IF jsonb_typeof(manifest_item->'conflictCount') = 'number' THEN
      PERFORM public.candidate_json_number_to_javascript(manifest_item->'conflictCount');
    END IF;
    IF jsonb_typeof(manifest_item) IS DISTINCT FROM 'object'
      OR entry_keys IS DISTINCT FROM ARRAY['conflictCount', 'id', 'payloadHash', 'scopeHash']::TEXT[]
      OR jsonb_typeof(manifest_item->'id') IS DISTINCT FROM 'string'
      OR manifest_item->>'id' !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR jsonb_typeof(manifest_item->'scopeHash') IS DISTINCT FROM 'string'
      OR manifest_item->>'scopeHash' !~ '^[0-9a-f]{64}$'
      OR jsonb_typeof(manifest_item->'payloadHash') IS DISTINCT FROM 'string'
      OR manifest_item->>'payloadHash' !~ '^[0-9a-f]{64}$'
      OR jsonb_typeof(manifest_item->'conflictCount') IS DISTINCT FROM 'number'
      OR (manifest_item->>'conflictCount')::NUMERIC < 0
      OR trunc((manifest_item->>'conflictCount')::NUMERIC) <> (manifest_item->>'conflictCount')::NUMERIC
      OR (last_id IS NOT NULL AND manifest_item->>'id' <= last_id)
    THEN
      RAISE EXCEPTION 'invalid candidate machine payload';
    END IF;
    last_id := manifest_item->>'id';
  END LOOP;

  IF candidate_payload->'data'->>'manifestHash' IS DISTINCT FROM encode(sha256(convert_to(
    'food-systems/output-manifest/v1' || chr(10)
      || public.candidate_canonical_json(manifest),
    'UTF8'
  )), 'hex') THEN
    RAISE EXCEPTION 'invalid candidate machine payload';
  END IF;

  RETURN NEW;
END
$function$;

REVOKE ALL ON FUNCTION public.reject_invalid_candidate_machine_payload() FROM PUBLIC;

CREATE FUNCTION public.candidate_writer_hash(hash_domain TEXT, hash_value JSONB)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
STRICT
SECURITY INVOKER
SET search_path = pg_catalog
AS $function$
  SELECT encode(sha256(convert_to(
    'food-systems/' || hash_domain || '/v1' || chr(10)
      || public.candidate_canonical_json(hash_value),
    'UTF8'
  )), 'hex')
$function$;

CREATE FUNCTION public.candidate_json_keys_equal(candidate_value JSONB, expected_keys TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
STRICT
SECURITY INVOKER
SET search_path = pg_catalog
AS $function$
  SELECT jsonb_typeof(candidate_value) = 'object'
    AND ARRAY(SELECT key FROM jsonb_object_keys(candidate_value) key ORDER BY key)
      = ARRAY(SELECT key FROM unnest(expected_keys) key ORDER BY key)
$function$;

CREATE FUNCTION public.candidate_json_integer(candidate_value JSONB)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
STRICT
SECURITY INVOKER
SET search_path = pg_catalog
AS $function$
  SELECT CASE jsonb_typeof(candidate_value)
    WHEN 'number' THEN
      trunc((candidate_value #>> '{}')::NUMERIC) =
        (candidate_value #>> '{}')::NUMERIC
    ELSE FALSE
  END
$function$;

CREATE FUNCTION public.candidate_json_nonempty_text_array(candidate_value JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
STRICT
SECURITY INVOKER
SET search_path = pg_catalog
AS $function$
BEGIN
  IF jsonb_typeof(candidate_value) <> 'array' THEN
    RETURN FALSE;
  END IF;
  RETURN NOT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(candidate_value) item(value)
    WHERE jsonb_typeof(value) <> 'string' OR length(value #>> '{}') = 0
  );
END
$function$;

CREATE FUNCTION public.candidate_writer_assert_open(candidate_run_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = pg_catalog
AS $function$
DECLARE latest_event_type public."CandidateRunEventType";
BEGIN
  SELECT event."eventType" INTO latest_event_type
  FROM public."CandidateAnalysisRunEvent" event
  WHERE event."runId" = candidate_run_id
  ORDER BY event."sequence" DESC
  LIMIT 1;
  IF latest_event_type IS NULL THEN
    RAISE EXCEPTION 'candidate_analysis_run_not_found';
  END IF;
  IF latest_event_type NOT IN ('queued', 'started', 'checkpoint') THEN
    RAISE EXCEPTION 'run_terminal';
  END IF;
END
$function$;

CREATE FUNCTION public.candidate_stored_output_manifest(candidate_run_id TEXT)
RETURNS JSONB
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = pg_catalog
AS $function$
  SELECT jsonb_build_object(
    'schemaVersion', 'candidate-output-manifest-v1',
    'inputs', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'contentUnitId', input."contentUnitId",
        'position', input."position",
        'contentHash', content."contentHash",
        'identityConfidence', content."identityConfidence"
      ) ORDER BY input."position")
      FROM public."CandidateAnalysisRunInput" input
      JOIN public."CandidateContentUnit" content ON content.id = input."contentUnitId"
      WHERE input."runId" = candidate_run_id
    ), '[]'::jsonb),
    'artifacts', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', artifact.id,
        'artifactType', artifact."artifactType",
        'schemaVersion', artifact."schemaVersion",
        'payloadHash', artifact."payloadHash"
      ) ORDER BY artifact.id)
      FROM public."CandidateAnalysisArtifact" artifact
      WHERE artifact."runId" = candidate_run_id
    ), '[]'::jsonb),
    'assertions', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', assertion.id,
        'assertionType', assertion."assertionType",
        'schemaVersion', assertion."schemaVersion",
        'payloadHash', assertion."payloadHash",
        'confidence', assertion.confidence,
        'machineUse', assertion."machineUse",
        'identityConfidence', assertion."identityConfidence",
        'evidenceLevel', assertion."evidenceLevel",
        'limitations', to_jsonb(assertion.limitations),
        'scopeKey', assertion."scopeKey",
        'scopeHash', assertion."scopeHash",
        'supersededAssertionId', assertion."supersededAssertionId",
        'supersededAssertionPayloadHash', assertion."supersededAssertionPayloadHash"
      ) ORDER BY assertion.id)
      FROM public."CandidateAssertion" assertion
      WHERE assertion."runId" = candidate_run_id
    ), '[]'::jsonb),
    'evidenceLinks', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', evidence.id,
        'assertionId', evidence."assertionId",
        'contentUnitId', evidence."contentUnitId",
        'relation', evidence.relation,
        'locatorHash', evidence."locatorHash",
        'excerptHash', evidence."excerptHash"
      ) ORDER BY evidence.id)
      FROM public."CandidateEvidenceLink" evidence
      JOIN public."CandidateAssertion" assertion ON assertion.id = evidence."assertionId"
      WHERE assertion."runId" = candidate_run_id
    ), '[]'::jsonb),
    'dependencies', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', dependency.id,
        'assertionId', dependency."assertionId",
        'upstreamAssertionId', dependency."upstreamAssertionId",
        'relation', dependency.relation,
        'inheritedLimitations', to_jsonb(dependency."inheritedLimitations")
      ) ORDER BY dependency.id)
      FROM public."CandidateDependency" dependency
      JOIN public."CandidateAssertion" assertion ON assertion.id = dependency."assertionId"
      WHERE assertion."runId" = candidate_run_id
    ), '[]'::jsonb),
    'reconciliationSnapshots', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', snapshot.id,
        'scopeHash', snapshot."scopeHash",
        'payloadHash', snapshot."payloadHash",
        'conflictCount', snapshot."conflictCount"
      ) ORDER BY snapshot.id)
      FROM public."CandidateReconciliationSnapshot" snapshot
      WHERE snapshot."runId" = candidate_run_id
    ), '[]'::jsonb)
  )
$function$;

REVOKE ALL ON FUNCTION public.candidate_writer_hash(TEXT, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.candidate_json_keys_equal(JSONB, TEXT[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.candidate_json_integer(JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.candidate_json_nonempty_text_array(JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.candidate_writer_assert_open(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.candidate_stored_output_manifest(TEXT) FROM PUBLIC;

CREATE FUNCTION public.candidate_content_unit_append(write_payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog
AS $function$
DECLARE
  content_row public."CandidateContentUnit"%ROWTYPE;
  existing_row public."CandidateContentUnit"%ROWTYPE;
BEGIN
  IF NOT public.candidate_json_keys_equal(write_payload, ARRAY[
    'id', 'sourceKind', 'sourceKey', 'sourceVersionHash', 'unitType',
    'ordinal', 'locator', 'locatorHash', 'contentHash', 'hashAlgorithm',
    'identityConfidence'
  ]) OR EXISTS (
    SELECT 1 FROM unnest(ARRAY[
      'id', 'sourceKind', 'sourceKey', 'sourceVersionHash', 'unitType',
      'locator', 'locatorHash', 'contentHash', 'hashAlgorithm',
      'identityConfidence'
    ]) field(name)
    WHERE jsonb_typeof(write_payload->field.name) IS DISTINCT FROM 'string'
  ) OR NOT public.candidate_json_integer(write_payload->'ordinal')
  THEN
    RAISE EXCEPTION 'candidate_content_unit_input_schema_invalid';
  END IF;

  content_row := jsonb_populate_record(
    NULL::public."CandidateContentUnit",
    write_payload
  );
  IF content_row.id !~ '^[a-z0-9][a-z0-9._:-]*$'
    OR content_row."sourceKind" !~ '^[a-z0-9][a-z0-9._:-]*$'
    OR content_row."sourceKey" !~ '^[a-z0-9][a-z0-9._:-]*$'
    OR content_row."sourceVersionHash" !~ '^[0-9a-f]{64}$'
    OR content_row."contentHash" !~ '^[0-9a-f]{64}$'
    OR content_row."hashAlgorithm" <> 'sha256'
    OR content_row.ordinal < 0
    OR btrim(content_row.locator) = ''
    OR content_row."locatorHash" IS DISTINCT FROM public.candidate_writer_hash(
      'evidence-locator', jsonb_build_object('locator', content_row.locator)
    )
  THEN
    RAISE EXCEPTION 'candidate_content_unit_integrity_mismatch';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(
    'candidate-content:' || content_row."sourceKind" || ':' ||
    content_row."sourceKey" || ':' || content_row."sourceVersionHash" || ':' ||
    content_row."unitType"::TEXT || ':' || content_row.ordinal::TEXT,
    0
  ));
  SELECT * INTO existing_row
  FROM public."CandidateContentUnit"
  WHERE "sourceKind" = content_row."sourceKind"
    AND "sourceKey" = content_row."sourceKey"
    AND "sourceVersionHash" = content_row."sourceVersionHash"
    AND "unitType" = content_row."unitType"
    AND ordinal = content_row.ordinal;

  IF FOUND THEN
    IF existing_row.id IS DISTINCT FROM content_row.id
      OR existing_row.locator IS DISTINCT FROM content_row.locator
      OR existing_row."locatorHash" IS DISTINCT FROM content_row."locatorHash"
      OR existing_row."contentHash" IS DISTINCT FROM content_row."contentHash"
      OR existing_row."hashAlgorithm" IS DISTINCT FROM content_row."hashAlgorithm"
      OR existing_row."identityConfidence" IS DISTINCT FROM content_row."identityConfidence"
    THEN
      RAISE EXCEPTION 'candidate_content_unit_immutable_history_conflict';
    END IF;
    RETURN jsonb_build_object('contentUnitId', existing_row.id, 'created', false);
  END IF;

  INSERT INTO public."CandidateContentUnit" (
    id, "sourceKind", "sourceKey", "sourceVersionHash", "unitType", ordinal,
    locator, "locatorHash", "contentHash", "hashAlgorithm", "identityConfidence"
  ) VALUES (
    content_row.id, content_row."sourceKind", content_row."sourceKey",
    content_row."sourceVersionHash", content_row."unitType", content_row.ordinal,
    content_row.locator, content_row."locatorHash", content_row."contentHash",
    content_row."hashAlgorithm", content_row."identityConfidence"
  );
  RETURN jsonb_build_object('contentUnitId', content_row.id, 'created', true);
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'candidate_content_unit_immutable_history_conflict';
END
$function$;

REVOKE ALL ON FUNCTION public.candidate_content_unit_append(JSONB) FROM PUBLIC;

CREATE FUNCTION public.candidate_worker_append(
  writer_operation TEXT,
  write_payload JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog
AS $function$
DECLARE
  run_row public."CandidateAnalysisRun"%ROWTYPE;
  event_row public."CandidateAnalysisRunEvent"%ROWTYPE;
  artifact_row public."CandidateAnalysisArtifact"%ROWTYPE;
  assertion_row public."CandidateAssertion"%ROWTYPE;
  evidence_row public."CandidateEvidenceLink"%ROWTYPE;
  dependency_row public."CandidateDependency"%ROWTYPE;
  input_item JSONB;
  derived_inputs JSONB;
  derived_idempotency JSONB;
  stored_manifest JSONB;
  latest_event public."CandidateAnalysisRunEvent"%ROWTYPE;
  assertion_run_id TEXT;
  result_state TEXT;
  upstream_ids TEXT[];
  required_limitations TEXT[];
  dependent_machine_rank INTEGER;
  weakest_machine_rank INTEGER;
  dependent_identity_rank INTEGER;
  weakest_identity_rank INTEGER;
  dependent_evidence_rank INTEGER;
  weakest_evidence_rank INTEGER;
BEGIN
  IF writer_operation NOT IN (
    'create_run', 'append_event', 'append_artifact', 'append_assertion',
    'append_evidence', 'append_dependency'
  ) THEN
    RAISE EXCEPTION 'candidate_writer_operation_invalid';
  END IF;

  IF writer_operation = 'create_run' THEN
    IF NOT public.candidate_json_keys_equal(write_payload, ARRAY[
      'id', 'scopeHash', 'workflowId', 'workflowVersion', 'workflowPath',
      'workflowHash', 'promptId', 'promptVersion', 'promptPath', 'promptHash',
      'modelProvider', 'modelName', 'modelVersion', 'config', 'configHash',
      'inputEnvelopeHash', 'purpose', 'outputProfile', 'workerId',
      'idempotencyKey', 'attempt', 'predecessorRunId', 'inputs', 'initialEvent'
    ]) OR EXISTS (
      SELECT 1 FROM unnest(ARRAY[
        'id', 'scopeHash', 'workflowId', 'workflowVersion', 'workflowPath',
        'workflowHash', 'promptId', 'promptVersion', 'promptPath', 'promptHash',
        'modelProvider', 'modelName', 'modelVersion', 'configHash',
        'inputEnvelopeHash', 'purpose', 'outputProfile', 'workerId',
        'idempotencyKey'
      ]) field(name)
      WHERE jsonb_typeof(write_payload->field.name) IS DISTINCT FROM 'string'
    ) OR NOT public.candidate_json_integer(write_payload->'attempt')
      OR jsonb_typeof(write_payload->'inputs') IS DISTINCT FROM 'array'
      OR jsonb_typeof(write_payload->'initialEvent') IS DISTINCT FROM 'object'
      OR jsonb_typeof(write_payload->'predecessorRunId') NOT IN ('null', 'string')
      OR (
        jsonb_typeof(write_payload->'predecessorRunId') = 'string'
        AND write_payload->>'predecessorRunId' !~ '^[a-z0-9][a-z0-9._:-]*$'
      )
    THEN
      RAISE EXCEPTION 'candidate_run_input_schema_invalid';
    END IF;
    run_row := jsonb_populate_record(NULL::public."CandidateAnalysisRun", write_payload);
    IF run_row.id IS NULL OR run_row.id !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR run_row."scopeHash" IS DISTINCT FROM public.candidate_writer_hash(
        'run-scope', jsonb_build_object('runId', run_row.id)
      )
      OR run_row."workflowId" <> 'workflow.candidate_analysis.v1'
      OR run_row."workflowVersion" <> '1.0.0'
      OR run_row."workflowPath" <> 'knowledge/corpus/workflows/candidate-analysis-v1.md'
      OR run_row."workflowHash" <> '707ea0ebd78db21a539ce9fde6945bc4954476468d8ba297c86e8d6cbc0385d4'
      OR run_row."promptId" <> 'prompt.candidate_analysis.v1'
      OR run_row."promptVersion" <> '1.0.0'
      OR run_row."promptPath" <> 'knowledge/corpus/workflows/candidate-analysis-prompt-v1.md'
      OR run_row."promptHash" <> '483d34ca87cb5cdaae0923e617f78defafece7825e0afd5ef2e07b3261127e85'
      OR (write_payload->'config') IS NULL
      OR run_row."configHash" IS DISTINCT FROM public.candidate_writer_hash(
        'run-config', write_payload->'config'
      )
      OR run_row."outputProfile" <> 'candidate_only'
      OR btrim(run_row."modelProvider") = ''
      OR btrim(run_row."modelName") = ''
      OR btrim(run_row."modelVersion") = ''
      OR btrim(run_row.purpose) = ''
      OR run_row."workerId" !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR run_row.attempt <= 0
      OR jsonb_typeof(write_payload->'inputs') <> 'array'
      OR jsonb_array_length(write_payload->'inputs') = 0
    THEN
      RAISE EXCEPTION 'candidate_run_integrity_mismatch';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM jsonb_array_elements(write_payload->'inputs') supplied(value)
      WHERE NOT public.candidate_json_keys_equal(
          value, ARRAY['contentUnitId', 'position', 'inputHash']
        )
        OR jsonb_typeof(value->'contentUnitId') IS DISTINCT FROM 'string'
        OR NOT public.candidate_json_integer(value->'position')
        OR jsonb_typeof(value->'inputHash') IS DISTINCT FROM 'string'
    ) THEN
      RAISE EXCEPTION 'candidate_run_input_schema_invalid';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM jsonb_array_elements(write_payload->'inputs') WITH ORDINALITY supplied(value, ordinal)
      WHERE (value->>'position')::INTEGER <> ordinal - 1
        OR value->>'contentUnitId' !~ '^[a-z0-9][a-z0-9._:-]*$'
        OR value->>'inputHash' !~ '^[0-9a-f]{64}$'
        OR NOT EXISTS (
          SELECT 1 FROM public."CandidateContentUnit" content
          WHERE content.id = value->>'contentUnitId'
            AND content."contentHash" = value->>'inputHash'
        )
    ) OR (
      SELECT count(DISTINCT value->>'contentUnitId')
      FROM jsonb_array_elements(write_payload->'inputs') supplied(value)
    ) <> jsonb_array_length(write_payload->'inputs') THEN
      RAISE EXCEPTION 'candidate_run_input_content_binding_mismatch';
    END IF;

    SELECT jsonb_agg(jsonb_build_object(
      'contentUnitId', value->>'contentUnitId',
      'position', (value->>'position')::INTEGER,
      'inputHash', value->>'inputHash'
    ) ORDER BY (value->>'position')::INTEGER)
    INTO derived_inputs
    FROM jsonb_array_elements(write_payload->'inputs') supplied(value);
    IF run_row."inputEnvelopeHash" IS DISTINCT FROM public.candidate_writer_hash(
      'run-input-envelope', jsonb_build_object('inputs', derived_inputs)
    ) THEN
      RAISE EXCEPTION 'candidate_run_input_envelope_mismatch';
    END IF;

    derived_idempotency := jsonb_build_object(
      'workflow', jsonb_build_object(
        'id', run_row."workflowId", 'version', run_row."workflowVersion",
        'path', run_row."workflowPath", 'hash', run_row."workflowHash"
      ),
      'prompt', jsonb_build_object(
        'id', run_row."promptId", 'version', run_row."promptVersion",
        'path', run_row."promptPath", 'hash', run_row."promptHash"
      ),
      'model', jsonb_build_object(
        'provider', run_row."modelProvider", 'name', run_row."modelName",
        'version', run_row."modelVersion"
      ),
      'configHash', run_row."configHash",
      'inputEnvelopeHash', run_row."inputEnvelopeHash",
      'purpose', run_row.purpose,
      'outputProfile', run_row."outputProfile",
      'attempt', run_row.attempt,
      'predecessorRunId', run_row."predecessorRunId"
    );
    IF run_row."idempotencyKey" IS DISTINCT FROM public.candidate_writer_hash(
      'run-idempotency', derived_idempotency
    ) THEN
      RAISE EXCEPTION 'candidate_run_idempotency_mismatch';
    END IF;

    IF NOT public.candidate_json_keys_equal(write_payload->'initialEvent', ARRAY[
      'id', 'runId', 'scopeHash', 'sequence', 'eventType', 'payload',
      'eventHash', 'supersededEventId', 'supersededEventHash',
      'supersededEventScopeHash'
    ]) OR EXISTS (
      SELECT 1 FROM unnest(ARRAY[
        'id', 'runId', 'scopeHash', 'eventType', 'eventHash'
      ]) field(name)
      WHERE jsonb_typeof(write_payload->'initialEvent'->field.name)
        IS DISTINCT FROM 'string'
    ) OR NOT public.candidate_json_integer(
      write_payload->'initialEvent'->'sequence'
    ) OR jsonb_typeof(write_payload->'initialEvent'->'payload') NOT IN (
      'null', 'object'
    ) OR EXISTS (
      SELECT 1 FROM unnest(ARRAY[
        'supersededEventId', 'supersededEventHash', 'supersededEventScopeHash'
      ]) field(name)
      WHERE jsonb_typeof(write_payload->'initialEvent'->field.name)
        IS DISTINCT FROM 'null'
    ) THEN
      RAISE EXCEPTION 'candidate_initial_event_invalid';
    END IF;
    event_row := jsonb_populate_record(
      NULL::public."CandidateAnalysisRunEvent",
      write_payload->'initialEvent'
    );
    IF event_row.id !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR event_row."runId" <> run_row.id
      OR event_row."scopeHash" <> run_row."scopeHash"
      OR event_row.sequence <> 1
      OR event_row."eventType" <> 'queued'
      OR event_row."supersededEventId" IS NOT NULL
      OR event_row."supersededEventHash" IS NOT NULL
      OR event_row."supersededEventScopeHash" IS NOT NULL
      OR event_row."eventHash" IS DISTINCT FROM public.candidate_writer_hash(
        'run-event', jsonb_build_object(
          'id', event_row.id, 'runId', event_row."runId",
          'scopeHash', event_row."scopeHash", 'sequence', event_row.sequence,
          'eventType', event_row."eventType", 'payload', event_row.payload,
          'supersededEventId', event_row."supersededEventId",
          'supersededEventHash', event_row."supersededEventHash",
          'supersededEventScopeHash', event_row."supersededEventScopeHash"
        )
      )
    THEN
      RAISE EXCEPTION 'candidate_initial_event_invalid';
    END IF;

    PERFORM pg_advisory_xact_lock(hashtextextended('candidate-run:' || run_row.id, 0));
    INSERT INTO public."CandidateAnalysisRun" (
      id, "scopeHash", "workflowId", "workflowVersion", "workflowPath",
      "workflowHash", "promptId", "promptVersion", "promptPath", "promptHash",
      "modelProvider", "modelName", "modelVersion", config, "configHash",
      "inputEnvelopeHash", purpose, "outputProfile", "workerId",
      "idempotencyKey", attempt, "predecessorRunId"
    ) VALUES (
      run_row.id, run_row."scopeHash", run_row."workflowId",
      run_row."workflowVersion", run_row."workflowPath", run_row."workflowHash",
      run_row."promptId", run_row."promptVersion", run_row."promptPath",
      run_row."promptHash", run_row."modelProvider", run_row."modelName",
      run_row."modelVersion", write_payload->'config', run_row."configHash",
      run_row."inputEnvelopeHash", run_row.purpose, run_row."outputProfile",
      run_row."workerId", run_row."idempotencyKey", run_row.attempt,
      run_row."predecessorRunId"
    );
    FOR input_item IN
      SELECT value FROM jsonb_array_elements(write_payload->'inputs') value
      ORDER BY (value->>'position')::INTEGER
    LOOP
      INSERT INTO public."CandidateAnalysisRunInput" (
        id, "runId", "contentUnitId", position, "inputHash"
      ) VALUES (
        'candidate-run-input:' || public.candidate_writer_hash(
          'run-input-row', jsonb_build_object(
            'runId', run_row.id,
            'contentUnitId', input_item->>'contentUnitId',
            'position', (input_item->>'position')::INTEGER
          )
        ),
        run_row.id,
        input_item->>'contentUnitId',
        (input_item->>'position')::INTEGER,
        input_item->>'inputHash'
      );
    END LOOP;
    INSERT INTO public."CandidateAnalysisRunEvent" (
      id, "runId", "scopeHash", sequence, "eventType", payload, "eventHash",
      "supersededEventId", "supersededEventHash", "supersededEventScopeHash"
    ) VALUES (
      event_row.id, event_row."runId", event_row."scopeHash", event_row.sequence,
      event_row."eventType", event_row.payload, event_row."eventHash",
      event_row."supersededEventId", event_row."supersededEventHash",
      event_row."supersededEventScopeHash"
    );
    RETURN jsonb_build_object('runId', run_row.id, 'created', true);
  END IF;

  IF writer_operation = 'append_event' THEN
    IF NOT public.candidate_json_keys_equal(write_payload, ARRAY[
      'id', 'runId', 'scopeHash', 'sequence', 'eventType', 'payload',
      'eventHash', 'supersededEventId', 'supersededEventHash',
      'supersededEventScopeHash'
    ]) OR EXISTS (
      SELECT 1 FROM unnest(ARRAY[
        'id', 'runId', 'scopeHash', 'eventType', 'eventHash'
      ]) field(name)
      WHERE jsonb_typeof(write_payload->field.name) IS DISTINCT FROM 'string'
    ) OR NOT public.candidate_json_integer(write_payload->'sequence')
      OR jsonb_typeof(write_payload->'payload') NOT IN ('null', 'object')
      OR EXISTS (
        SELECT 1 FROM unnest(ARRAY[
          'supersededEventId', 'supersededEventHash',
          'supersededEventScopeHash'
        ]) field(name)
        WHERE jsonb_typeof(write_payload->field.name) NOT IN ('null', 'string')
      )
    THEN
      RAISE EXCEPTION 'candidate_event_input_schema_invalid';
    END IF;
    event_row := jsonb_populate_record(NULL::public."CandidateAnalysisRunEvent", write_payload);
    PERFORM pg_advisory_xact_lock(hashtextextended('candidate-run:' || event_row."runId", 0));
    IF event_row.id IS NULL OR event_row.id !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR event_row."runId" !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR (
        event_row."supersededEventId" IS NOT NULL
        AND event_row."supersededEventId" !~ '^[a-z0-9][a-z0-9._:-]*$'
      )
      OR event_row."scopeHash" IS DISTINCT FROM public.candidate_writer_hash(
        'run-scope', jsonb_build_object('runId', event_row."runId")
      )
      OR NOT EXISTS (
        SELECT 1 FROM public."CandidateAnalysisRun" run
        WHERE run.id = event_row."runId" AND run."scopeHash" = event_row."scopeHash"
      )
      OR event_row."eventHash" IS DISTINCT FROM public.candidate_writer_hash(
        'run-event', jsonb_build_object(
          'id', event_row.id, 'runId', event_row."runId",
          'scopeHash', event_row."scopeHash", 'sequence', event_row.sequence,
          'eventType', event_row."eventType", 'payload', event_row.payload,
          'supersededEventId', event_row."supersededEventId",
          'supersededEventHash', event_row."supersededEventHash",
          'supersededEventScopeHash', event_row."supersededEventScopeHash"
        )
      )
    THEN
      RAISE EXCEPTION 'candidate_event_integrity_mismatch';
    END IF;
    SELECT * INTO latest_event
    FROM public."CandidateAnalysisRunEvent" event
    WHERE event."runId" = event_row."runId"
    ORDER BY event.sequence DESC
    LIMIT 1;
    IF latest_event.id IS NULL OR event_row.sequence <> latest_event.sequence + 1 THEN
      RAISE EXCEPTION 'event_sequence_conflict';
    END IF;
    IF latest_event."eventType" = 'queued'
      AND event_row."eventType" NOT IN ('started', 'failed', 'blocked_input', 'quarantined') THEN
      RAISE EXCEPTION 'invalid_event_transition';
    ELSIF latest_event."eventType" IN ('started', 'checkpoint')
      AND event_row."eventType" NOT IN (
        'checkpoint', 'candidate_completed', 'partial_completed', 'failed',
        'blocked_input', 'quarantined'
      ) THEN
      RAISE EXCEPTION 'invalid_event_transition';
    ELSIF latest_event."eventType" IN ('candidate_completed', 'partial_completed') THEN
      IF event_row."eventType" <> 'superseded'
        OR event_row."supersededEventId" IS DISTINCT FROM latest_event.id
        OR event_row."supersededEventHash" IS DISTINCT FROM latest_event."eventHash"
        OR event_row."supersededEventScopeHash" IS DISTINCT FROM latest_event."scopeHash" THEN
        RAISE EXCEPTION 'invalid_event_supersession';
      END IF;
    ELSIF latest_event."eventType" IN (
      'failed', 'blocked_input', 'quarantined', 'superseded'
    ) THEN
      RAISE EXCEPTION 'event_after_terminal_state';
    END IF;

    IF event_row."eventType" IN ('candidate_completed', 'partial_completed') THEN
      stored_manifest := public.candidate_stored_output_manifest(event_row."runId");
      IF jsonb_array_length(stored_manifest->'artifacts') = 0
        OR jsonb_array_length(stored_manifest->'assertions') = 0 THEN
        RAISE EXCEPTION 'terminal_output_missing';
      END IF;
      IF EXISTS (
          SELECT 1
          FROM public."CandidateAnalysisRunInput" input
          JOIN public."CandidateContentUnit" content ON content.id = input."contentUnitId"
          WHERE input."runId" = event_row."runId"
            AND input."inputHash" <> content."contentHash"
        )
        OR EXISTS (
          SELECT 1 FROM public."CandidateAssertion" assertion
          WHERE assertion."runId" = event_row."runId"
            AND assertion."evidenceLevel" = 'exact_locator'
            AND NOT EXISTS (
              SELECT 1
              FROM public."CandidateEvidenceLink" evidence
              JOIN public."CandidateContentUnit" content ON content.id = evidence."contentUnitId"
              JOIN public."CandidateAnalysisRunInput" input
                ON input."runId" = assertion."runId"
               AND input."contentUnitId" = content.id
              WHERE evidence."assertionId" = assertion.id
                AND evidence.relation = 'supports'
                AND evidence.locator = content.locator
                AND evidence."locatorHash" = content."locatorHash"
                AND input."inputHash" = content."contentHash"
            )
        )
        OR event_row.payload #> '{data,manifest}' IS DISTINCT FROM stored_manifest
        OR event_row.payload #>> '{data,manifestHash}' IS DISTINCT FROM
          public.candidate_writer_hash('output-manifest', stored_manifest)
      THEN
        RAISE EXCEPTION 'terminal_output_integrity';
      END IF;
    END IF;

    INSERT INTO public."CandidateAnalysisRunEvent" (
      id, "runId", "scopeHash", sequence, "eventType", payload, "eventHash",
      "supersededEventId", "supersededEventHash", "supersededEventScopeHash"
    ) VALUES (
      event_row.id, event_row."runId", event_row."scopeHash", event_row.sequence,
      event_row."eventType", event_row.payload, event_row."eventHash",
      event_row."supersededEventId", event_row."supersededEventHash",
      event_row."supersededEventScopeHash"
    );
    result_state := CASE event_row."eventType"
      WHEN 'queued' THEN 'queued'
      WHEN 'started' THEN 'running'
      WHEN 'checkpoint' THEN 'running'
      WHEN 'candidate_completed' THEN 'candidate_complete'
      WHEN 'partial_completed' THEN 'partial'
      ELSE event_row."eventType"::TEXT
    END;
    RETURN jsonb_build_object(
      'runId', event_row."runId", 'sequence', event_row.sequence, 'state', result_state
    );
  END IF;

  IF writer_operation = 'append_artifact' THEN
    IF NOT public.candidate_json_keys_equal(write_payload, ARRAY[
      'id', 'runId', 'artifactType', 'schemaVersion', 'payload', 'payloadHash'
    ]) OR EXISTS (
      SELECT 1 FROM unnest(ARRAY[
        'id', 'runId', 'artifactType', 'schemaVersion', 'payloadHash'
      ]) field(name)
      WHERE jsonb_typeof(write_payload->field.name) IS DISTINCT FROM 'string'
    ) OR jsonb_typeof(write_payload->'payload') IS DISTINCT FROM 'object'
    THEN
      RAISE EXCEPTION 'candidate_artifact_input_schema_invalid';
    END IF;
    artifact_row := jsonb_populate_record(NULL::public."CandidateAnalysisArtifact", write_payload);
    PERFORM pg_advisory_xact_lock(hashtextextended('candidate-run:' || artifact_row."runId", 0));
    PERFORM public.candidate_writer_assert_open(artifact_row."runId");
    IF artifact_row.id !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR artifact_row."runId" !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR artifact_row."artifactType" !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR artifact_row."schemaVersion" <> 'candidate-analysis-v1'
      OR artifact_row."payloadHash" IS DISTINCT FROM public.candidate_writer_hash(
        'artifact-payload', artifact_row.payload
      ) THEN
      RAISE EXCEPTION 'candidate_artifact_integrity_mismatch';
    END IF;
    INSERT INTO public."CandidateAnalysisArtifact" (
      id, "runId", "artifactType", "schemaVersion", payload, "payloadHash"
    ) VALUES (
      artifact_row.id, artifact_row."runId", artifact_row."artifactType",
      artifact_row."schemaVersion", artifact_row.payload, artifact_row."payloadHash"
    );
    RETURN jsonb_build_object('artifactId', artifact_row.id);
  END IF;

  IF writer_operation = 'append_assertion' THEN
    IF NOT public.candidate_json_keys_equal(write_payload, ARRAY[
      'id', 'runId', 'assertionType', 'schemaVersion', 'payload', 'payloadHash',
      'confidence', 'machineUse', 'identityConfidence', 'evidenceLevel',
      'limitations', 'scopeKey', 'scopeHash', 'supersededAssertionId',
      'supersededAssertionPayloadHash', 'promotionState'
    ]) OR EXISTS (
      SELECT 1 FROM unnest(ARRAY[
        'id', 'runId', 'assertionType', 'schemaVersion', 'payloadHash',
        'machineUse', 'identityConfidence', 'evidenceLevel', 'scopeKey',
        'scopeHash', 'promotionState'
      ]) field(name)
      WHERE jsonb_typeof(write_payload->field.name) IS DISTINCT FROM 'string'
    ) OR jsonb_typeof(write_payload->'payload') IS DISTINCT FROM 'object'
      OR jsonb_typeof(write_payload->'confidence') NOT IN ('null', 'number')
      OR NOT public.candidate_json_nonempty_text_array(write_payload->'limitations')
      OR EXISTS (
        SELECT 1 FROM unnest(ARRAY[
          'supersededAssertionId', 'supersededAssertionPayloadHash'
        ]) field(name)
        WHERE jsonb_typeof(write_payload->field.name) NOT IN ('null', 'string')
      )
      OR write_payload->>'promotionState' <> 'candidate'
    THEN
      RAISE EXCEPTION 'candidate_assertion_input_schema_invalid';
    END IF;
    assertion_row := jsonb_populate_record(NULL::public."CandidateAssertion", write_payload);
    PERFORM pg_advisory_xact_lock(hashtextextended('candidate-run:' || assertion_row."runId", 0));
    PERFORM public.candidate_writer_assert_open(assertion_row."runId");
    IF assertion_row.id !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR assertion_row."runId" !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR assertion_row."schemaVersion" <> 'candidate-analysis-v1'
      OR assertion_row."scopeKey" !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR (
        assertion_row."supersededAssertionId" IS NOT NULL
        AND assertion_row."supersededAssertionId" !~ '^[a-z0-9][a-z0-9._:-]*$'
      )
      OR assertion_row."payloadHash" IS DISTINCT FROM public.candidate_writer_hash(
        'assertion-payload', assertion_row.payload
      )
      OR assertion_row."scopeHash" IS DISTINCT FROM public.candidate_writer_hash(
        'assertion-scope', jsonb_build_object('scopeKey', assertion_row."scopeKey")
      )
      OR ((assertion_row."supersededAssertionId" IS NULL)
        <> (assertion_row."supersededAssertionPayloadHash" IS NULL))
      OR assertion_row."supersededAssertionId" = assertion_row.id
      OR EXISTS (SELECT 1 FROM unnest(assertion_row.limitations) limitation WHERE btrim(limitation) = '')
    THEN
      RAISE EXCEPTION 'candidate_assertion_integrity_mismatch';
    END IF;
    IF assertion_row."supersededAssertionId" IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public."CandidateAssertion" prior
      WHERE prior.id = assertion_row."supersededAssertionId"
        AND prior."payloadHash" = assertion_row."supersededAssertionPayloadHash"
        AND prior."scopeHash" = assertion_row."scopeHash"
    ) THEN
      RAISE EXCEPTION 'supersession_conflict';
    END IF;
    INSERT INTO public."CandidateAssertion" (
      id, "runId", "assertionType", "schemaVersion", payload, "payloadHash",
      confidence, "machineUse", "identityConfidence", "evidenceLevel",
      limitations, "scopeKey", "scopeHash", "supersededAssertionId",
      "supersededAssertionPayloadHash"
    ) VALUES (
      assertion_row.id, assertion_row."runId", assertion_row."assertionType",
      assertion_row."schemaVersion", assertion_row.payload,
      assertion_row."payloadHash", assertion_row.confidence,
      assertion_row."machineUse", assertion_row."identityConfidence",
      assertion_row."evidenceLevel", assertion_row.limitations,
      assertion_row."scopeKey", assertion_row."scopeHash",
      assertion_row."supersededAssertionId",
      assertion_row."supersededAssertionPayloadHash"
    );
    RETURN jsonb_build_object('assertionId', assertion_row.id);
  END IF;

  IF writer_operation = 'append_evidence' THEN
    IF NOT public.candidate_json_keys_equal(write_payload, ARRAY[
      'id', 'assertionId', 'contentUnitId', 'relation', 'locator',
      'locatorHash', 'excerptHash'
    ]) OR EXISTS (
      SELECT 1 FROM unnest(ARRAY[
        'id', 'assertionId', 'contentUnitId', 'relation', 'locator',
        'locatorHash'
      ]) field(name)
      WHERE jsonb_typeof(write_payload->field.name) IS DISTINCT FROM 'string'
    ) OR jsonb_typeof(write_payload->'excerptHash') NOT IN ('null', 'string')
    THEN
      RAISE EXCEPTION 'candidate_evidence_input_schema_invalid';
    END IF;
    evidence_row := jsonb_populate_record(NULL::public."CandidateEvidenceLink", write_payload);
    SELECT assertion."runId" INTO assertion_run_id
    FROM public."CandidateAssertion" assertion WHERE assertion.id = evidence_row."assertionId";
    IF assertion_run_id IS NULL THEN RAISE EXCEPTION 'candidate_assertion_not_found'; END IF;
    PERFORM pg_advisory_xact_lock(hashtextextended('candidate-run:' || assertion_run_id, 0));
    PERFORM public.candidate_writer_assert_open(assertion_run_id);
    IF evidence_row.id !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR evidence_row."assertionId" !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR evidence_row."contentUnitId" !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR length(evidence_row.locator) = 0
      OR evidence_row."locatorHash" IS DISTINCT FROM public.candidate_writer_hash(
        'evidence-locator', jsonb_build_object('locator', evidence_row.locator)
      )
      OR NOT EXISTS (
        SELECT 1
        FROM public."CandidateAnalysisRunInput" input
        JOIN public."CandidateContentUnit" content ON content.id = input."contentUnitId"
        WHERE input."runId" = assertion_run_id
          AND input."contentUnitId" = evidence_row."contentUnitId"
          AND input."inputHash" = content."contentHash"
      ) THEN
      RAISE EXCEPTION 'candidate_evidence_integrity_mismatch';
    END IF;
    INSERT INTO public."CandidateEvidenceLink" (
      id, "assertionId", "contentUnitId", relation, locator, "locatorHash", "excerptHash"
    ) VALUES (
      evidence_row.id, evidence_row."assertionId", evidence_row."contentUnitId",
      evidence_row.relation, evidence_row.locator, evidence_row."locatorHash",
      evidence_row."excerptHash"
    );
    RETURN jsonb_build_object('evidenceLinkId', evidence_row.id);
  END IF;

  IF writer_operation = 'append_dependency' THEN
    IF NOT public.candidate_json_keys_equal(write_payload, ARRAY[
      'id', 'assertionId', 'upstreamAssertionId', 'relation',
      'inheritedLimitations'
    ]) OR EXISTS (
      SELECT 1 FROM unnest(ARRAY[
        'id', 'assertionId', 'upstreamAssertionId', 'relation'
      ]) field(name)
      WHERE jsonb_typeof(write_payload->field.name) IS DISTINCT FROM 'string'
    ) OR NOT public.candidate_json_nonempty_text_array(
      write_payload->'inheritedLimitations'
    ) THEN
      RAISE EXCEPTION 'candidate_dependency_input_schema_invalid';
    END IF;
    dependency_row := jsonb_populate_record(NULL::public."CandidateDependency", write_payload);
    FOR assertion_run_id IN
      SELECT identity FROM (VALUES
        (dependency_row."assertionId"),
        (dependency_row."upstreamAssertionId")
      ) candidate(identity) ORDER BY identity
    LOOP
      PERFORM pg_advisory_xact_lock(hashtextextended('candidate-assertion:' || assertion_run_id, 0));
    END LOOP;
    SELECT assertion."runId" INTO assertion_run_id
    FROM public."CandidateAssertion" assertion
    WHERE assertion.id = dependency_row."assertionId";
    IF assertion_run_id IS NULL OR NOT EXISTS (
      SELECT 1 FROM public."CandidateAssertion"
      WHERE id = dependency_row."upstreamAssertionId"
    ) THEN
      RAISE EXCEPTION 'candidate_assertion_not_found';
    END IF;
    PERFORM pg_advisory_xact_lock(hashtextextended('candidate-run:' || assertion_run_id, 0));
    PERFORM public.candidate_writer_assert_open(assertion_run_id);
    IF dependency_row.id !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR dependency_row."assertionId" !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR dependency_row."upstreamAssertionId" !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR dependency_row.relation !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR dependency_row."assertionId" = dependency_row."upstreamAssertionId"
      OR dependency_row."inheritedLimitations" IS DISTINCT FROM ARRAY(
        SELECT DISTINCT limitation
        FROM unnest(dependency_row."inheritedLimitations") limitation
        WHERE btrim(limitation) <> ''
        ORDER BY limitation
      ) THEN
      RAISE EXCEPTION 'candidate_dependency_integrity_mismatch';
    END IF;
    WITH RECURSIVE upstream_tree(id) AS (
      VALUES (dependency_row."upstreamAssertionId")
      UNION
      SELECT dependency."upstreamAssertionId"
      FROM public."CandidateDependency" dependency
      JOIN upstream_tree ON dependency."assertionId" = upstream_tree.id
    )
    SELECT array_agg(id ORDER BY id) INTO upstream_ids FROM upstream_tree;
    IF dependency_row."assertionId" = ANY(upstream_ids) THEN
      RAISE EXCEPTION 'dependency_cycle';
    END IF;

    SELECT ARRAY(
      SELECT DISTINCT limitation
      FROM (
        SELECT unnest(assertion.limitations) AS limitation
        FROM public."CandidateAssertion" assertion
        WHERE assertion.id = ANY(upstream_ids)
        UNION ALL
        SELECT unnest(dependency."inheritedLimitations")
        FROM public."CandidateDependency" dependency
        WHERE dependency."assertionId" = ANY(upstream_ids)
      ) inherited
      ORDER BY limitation
    ) INTO required_limitations;
    IF EXISTS (
      SELECT 1 FROM unnest(required_limitations) limitation
      WHERE NOT limitation = ANY(dependency_row."inheritedLimitations")
        OR NOT EXISTS (
          SELECT 1
          FROM public."CandidateAssertion" dependent
          WHERE dependent.id = dependency_row."assertionId"
            AND limitation = ANY(dependent.limitations)
        )
    ) THEN
      RAISE EXCEPTION 'upstream_authority_upgrade';
    END IF;

    SELECT CASE assertion."machineUse"
        WHEN 'quarantined' THEN 0 WHEN 'candidate_only' THEN 1 ELSE 2 END,
      CASE assertion."identityConfidence"
        WHEN 'unresolved' THEN 0 WHEN 'provisional' THEN 1 ELSE 2 END,
      CASE assertion."evidenceLevel"
        WHEN 'no_locator' THEN 0 WHEN 'partial_locator' THEN 1 ELSE 2 END
    INTO dependent_machine_rank, dependent_identity_rank, dependent_evidence_rank
    FROM public."CandidateAssertion" assertion
    WHERE assertion.id = dependency_row."assertionId";
    SELECT min(CASE assertion."machineUse"
        WHEN 'quarantined' THEN 0 WHEN 'candidate_only' THEN 1 ELSE 2 END),
      min(CASE assertion."identityConfidence"
        WHEN 'unresolved' THEN 0 WHEN 'provisional' THEN 1 ELSE 2 END),
      min(CASE assertion."evidenceLevel"
        WHEN 'no_locator' THEN 0 WHEN 'partial_locator' THEN 1 ELSE 2 END)
    INTO weakest_machine_rank, weakest_identity_rank, weakest_evidence_rank
    FROM public."CandidateAssertion" assertion
    WHERE assertion.id = ANY(upstream_ids);
    IF dependent_machine_rank > weakest_machine_rank THEN
      RAISE EXCEPTION 'upstream_authority_upgrade';
    END IF;
    IF dependent_identity_rank > weakest_identity_rank AND NOT EXISTS (
      SELECT 1
      FROM public."CandidateEvidenceLink" evidence
      JOIN public."CandidateContentUnit" content ON content.id = evidence."contentUnitId"
      JOIN public."CandidateAnalysisRunInput" input
        ON input."runId" = assertion_run_id
       AND input."contentUnitId" = content.id
      WHERE evidence."assertionId" = dependency_row."assertionId"
        AND evidence.relation = 'supports'
        AND input."inputHash" = content."contentHash"
        AND (CASE content."identityConfidence"
          WHEN 'unresolved' THEN 0 WHEN 'provisional' THEN 1 ELSE 2 END)
          >= dependent_identity_rank
    ) THEN
      RAISE EXCEPTION 'upstream_authority_upgrade';
    END IF;
    IF dependent_evidence_rank > weakest_evidence_rank AND NOT EXISTS (
      SELECT 1
      FROM public."CandidateEvidenceLink" evidence
      JOIN public."CandidateContentUnit" content ON content.id = evidence."contentUnitId"
      JOIN public."CandidateAnalysisRunInput" input
        ON input."runId" = assertion_run_id
       AND input."contentUnitId" = content.id
      WHERE evidence."assertionId" = dependency_row."assertionId"
        AND evidence.relation = 'supports'
        AND input."inputHash" = content."contentHash"
        AND evidence.locator = content.locator
        AND evidence."locatorHash" = content."locatorHash"
    ) THEN
      RAISE EXCEPTION 'upstream_authority_upgrade';
    END IF;
    INSERT INTO public."CandidateDependency" (
      id, "assertionId", "upstreamAssertionId", relation, "inheritedLimitations"
    ) VALUES (
      dependency_row.id, dependency_row."assertionId",
      dependency_row."upstreamAssertionId", dependency_row.relation,
      dependency_row."inheritedLimitations"
    );
    RETURN jsonb_build_object('dependencyId', dependency_row.id);
  END IF;

  RAISE EXCEPTION 'candidate_writer_operation_invalid';
END
$function$;

REVOKE ALL ON FUNCTION public.candidate_worker_append(TEXT, JSONB) FROM PUBLIC;

CREATE FUNCTION public.candidate_reconciler_append(write_payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog
AS $function$
DECLARE snapshot_row public."CandidateReconciliationSnapshot"%ROWTYPE;
BEGIN
  IF NOT public.candidate_json_keys_equal(write_payload, ARRAY[
    'id', 'runId', 'scope', 'scopeHash', 'payload', 'payloadHash',
    'conflictCount'
  ]) OR EXISTS (
    SELECT 1 FROM unnest(ARRAY[
      'id', 'runId', 'scopeHash', 'payloadHash'
    ]) field(name)
    WHERE jsonb_typeof(write_payload->field.name) IS DISTINCT FROM 'string'
  ) OR (write_payload->'scope') IS NULL
    OR jsonb_typeof(write_payload->'payload') IS DISTINCT FROM 'object'
    OR NOT public.candidate_json_integer(write_payload->'conflictCount')
  THEN
    RAISE EXCEPTION 'candidate_reconciliation_input_schema_invalid';
  END IF;
  snapshot_row := jsonb_populate_record(
    NULL::public."CandidateReconciliationSnapshot",
    write_payload
  );
  PERFORM pg_advisory_xact_lock(
    hashtextextended('candidate-run:' || snapshot_row."runId", 0)
  );
  PERFORM public.candidate_writer_assert_open(snapshot_row."runId");
  IF snapshot_row.id !~ '^[a-z0-9][a-z0-9._:-]*$'
    OR snapshot_row."runId" !~ '^[a-z0-9][a-z0-9._:-]*$'
    OR snapshot_row."scopeHash" IS DISTINCT FROM public.candidate_writer_hash(
      'reconciliation-scope', write_payload->'scope'
    )
    OR snapshot_row."payloadHash" IS DISTINCT FROM public.candidate_writer_hash(
      'reconciliation-payload', snapshot_row.payload
    )
    OR snapshot_row."conflictCount" < 0
  THEN
    RAISE EXCEPTION 'candidate_reconciliation_integrity_mismatch';
  END IF;
  INSERT INTO public."CandidateReconciliationSnapshot" (
    id, "runId", scope, "scopeHash", payload, "payloadHash", "conflictCount"
  ) VALUES (
    snapshot_row.id, snapshot_row."runId", write_payload->'scope',
    snapshot_row."scopeHash", snapshot_row.payload, snapshot_row."payloadHash",
    snapshot_row."conflictCount"
  );
  RETURN jsonb_build_object('snapshotId', snapshot_row.id);
END
$function$;

REVOKE ALL ON FUNCTION public.candidate_reconciler_append(JSONB) FROM PUBLIC;

CREATE FUNCTION public.candidate_critical_trigger_drift(candidate_schema TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog
AS $function$
  WITH expected(relname, trigger_name) AS (
    VALUES
      ('CandidateContentUnit', 'CandidateContentUnit_reject_update_delete'),
      ('CandidateContentUnit', 'CandidateContentUnit_reject_truncate'),
      ('CandidateAnalysisRun', 'CandidateAnalysisRun_reject_invalid_scope'),
      ('CandidateAnalysisRun', 'CandidateAnalysisRun_reject_update_delete'),
      ('CandidateAnalysisRun', 'CandidateAnalysisRun_reject_truncate'),
      ('CandidateAnalysisRunInput', 'CandidateAnalysisRunInput_reject_update_delete'),
      ('CandidateAnalysisRunInput', 'CandidateAnalysisRunInput_reject_truncate'),
      ('CandidateAnalysisRunEvent', 'CandidateAnalysisRunEvent_reject_invalid_machine_payload'),
      ('CandidateAnalysisRunEvent', 'CandidateAnalysisRunEvent_reject_update_delete'),
      ('CandidateAnalysisRunEvent', 'CandidateAnalysisRunEvent_reject_truncate'),
      ('CandidateAnalysisArtifact', 'CandidateAnalysisArtifact_reject_invalid_machine_payload'),
      ('CandidateAnalysisArtifact', 'CandidateAnalysisArtifact_reject_update_delete'),
      ('CandidateAnalysisArtifact', 'CandidateAnalysisArtifact_reject_truncate'),
      ('CandidateAssertion', 'CandidateAssertion_reject_invalid_machine_payload'),
      ('CandidateAssertion', 'CandidateAssertion_reject_update_delete'),
      ('CandidateAssertion', 'CandidateAssertion_reject_truncate'),
      ('CandidateEvidenceLink', 'CandidateEvidenceLink_reject_update_delete'),
      ('CandidateEvidenceLink', 'CandidateEvidenceLink_reject_truncate'),
      ('CandidateDependency', 'CandidateDependency_reject_update_delete'),
      ('CandidateDependency', 'CandidateDependency_reject_truncate'),
      ('CandidateReconciliationSnapshot', 'CandidateReconciliationSnapshot_reject_invalid_machine_payload'),
      ('CandidateReconciliationSnapshot', 'CandidateReconciliationSnapshot_reject_update_delete'),
      ('CandidateReconciliationSnapshot', 'CandidateReconciliationSnapshot_reject_truncate'),
      ('CandidateHumanReviewDecision', 'CandidateHumanReviewDecision_reject_update_delete'),
      ('CandidateHumanReviewDecision', 'CandidateHumanReviewDecision_reject_truncate'),
      ('CandidatePromotionDecision', 'CandidatePromotionDecision_reject_update_delete'),
      ('CandidatePromotionDecision', 'CandidatePromotionDecision_reject_truncate')
  ), actual AS (
    SELECT class.relname, trigger.tgname AS trigger_name, trigger.tgenabled,
      trigger.tgisinternal
    FROM pg_trigger trigger
    JOIN pg_class class ON class.oid = trigger.tgrelid
    JOIN pg_namespace namespace ON namespace.oid = class.relnamespace
    WHERE namespace.nspname = candidate_schema
      AND class.relname IN (SELECT relname FROM expected)
  ), issue AS (
    SELECT format('missing or non-ALWAYS trigger %I.%I', expected.relname, expected.trigger_name) AS value
    FROM expected
    LEFT JOIN actual USING (relname, trigger_name)
    WHERE actual.trigger_name IS NULL OR actual.tgenabled <> 'A'
    UNION ALL
    SELECT format('unexpected custom trigger %I.%I', actual.relname, actual.trigger_name)
    FROM actual
    LEFT JOIN expected USING (relname, trigger_name)
    WHERE NOT actual.tgisinternal AND expected.trigger_name IS NULL
  )
  SELECT string_agg(value, '; ' ORDER BY value) FROM issue
$function$;

CREATE FUNCTION public.candidate_other_database_connect_issue(
  worker_role_name TEXT,
  reconciler_role_name TEXT
)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog
AS $function$
  WITH candidate_role AS (
    SELECT oid FROM pg_roles
    WHERE rolname IN (worker_role_name, reconciler_role_name)
  ), reachable AS (
    SELECT database.oid, database.datname
    FROM pg_database database
    WHERE database.datallowconn
      AND database.datname <> current_database()
      AND (
        EXISTS (
          SELECT 1
          FROM aclexplode(COALESCE(database.datacl, acldefault('d', database.datdba))) privilege
          WHERE privilege.grantee = 0 AND privilege.privilege_type = 'CONNECT'
        )
        OR EXISTS (
          SELECT 1 FROM candidate_role role
          WHERE has_database_privilege(role.oid, database.oid, 'CONNECT')
        )
      )
  )
  SELECT CASE WHEN count(*) = 0 THEN NULL
    ELSE 'candidate role can reach other database(s): '
      || string_agg(datname, ', ' ORDER BY datname)
    END
  FROM reachable
$function$;

CREATE FUNCTION public.candidate_security_routine_descriptor(routine_oid OID)
RETURNS TEXT
LANGUAGE sql
STABLE
STRICT
SECURITY INVOKER
SET search_path = pg_catalog
AS $function$
  SELECT string_agg(
    field.name || '=' || encode(convert_to(field.value, 'UTF8'), 'base64'),
    E'\n' ORDER BY field.ordinal
  )
  FROM pg_proc procedure
  JOIN pg_namespace namespace ON namespace.oid = procedure.pronamespace
  JOIN pg_language language ON language.oid = procedure.prolang
  CROSS JOIN LATERAL (VALUES
    (1, 'schema', namespace.nspname),
    (2, 'name', procedure.proname),
    (3, 'identity_arguments', pg_get_function_identity_arguments(procedure.oid)),
    (4, 'argument_modes', COALESCE(procedure.proargmodes::TEXT, '')),
    (5, 'return_type', pg_get_function_result(procedure.oid)),
    (6, 'returns_set', procedure.proretset::TEXT),
    (7, 'prokind', procedure.prokind::TEXT),
    (8, 'language', language.lanname),
    (9, 'probin', COALESCE(procedure.probin, '')),
    (10, 'prosrc', procedure.prosrc),
    (11, 'prosqlbody', COALESCE(procedure.prosqlbody::TEXT, '')),
    (12, 'owner_is_database_owner', (
      procedure.proowner = (
        SELECT database.datdba FROM pg_database database
        WHERE database.datname = current_database()
      )
    )::TEXT),
    (13, 'security_definer', procedure.prosecdef::TEXT),
    (14, 'strict', procedure.proisstrict::TEXT),
    (15, 'leakproof', procedure.proleakproof::TEXT),
    (16, 'volatility', procedure.provolatile::TEXT),
    (17, 'parallel', procedure.proparallel::TEXT),
    (18, 'config', COALESCE((
      SELECT string_agg(setting, E'\x1f' ORDER BY setting COLLATE "C")
      FROM unnest(procedure.proconfig) setting
    ), '')),
    (19, 'public_execute', EXISTS (
      SELECT 1
      FROM aclexplode(COALESCE(
        procedure.proacl,
        acldefault('f', procedure.proowner)
      )) privilege
      WHERE privilege.grantee = 0
        AND privilege.privilege_type = 'EXECUTE'
    )::TEXT)
  ) AS field(ordinal, name, value)
  WHERE procedure.oid = routine_oid
$function$;

CREATE FUNCTION public.candidate_security_trigger_descriptor(trigger_oid OID)
RETURNS TEXT
LANGUAGE sql
STABLE
STRICT
SECURITY INVOKER
SET search_path = pg_catalog
AS $function$
  SELECT string_agg(
    field.name || '=' || encode(convert_to(field.value, 'UTF8'), 'base64'),
    E'\n' ORDER BY field.ordinal
  )
  FROM pg_trigger trigger
  JOIN pg_class class ON class.oid = trigger.tgrelid
  JOIN pg_namespace table_namespace ON table_namespace.oid = class.relnamespace
  JOIN pg_proc procedure ON procedure.oid = trigger.tgfoid
  JOIN pg_namespace routine_namespace ON routine_namespace.oid = procedure.pronamespace
  CROSS JOIN LATERAL (VALUES
    (1, 'schema', table_namespace.nspname),
    (2, 'table', class.relname),
    (3, 'trigger', trigger.tgname),
    (4, 'internal', trigger.tgisinternal::TEXT),
    (5, 'enabled', trigger.tgenabled::TEXT),
    (6, 'type', trigger.tgtype::TEXT),
    (7, 'routine', format(
      '%I.%I(%s)', routine_namespace.nspname, procedure.proname,
      pg_get_function_identity_arguments(procedure.oid)
    )),
    (8, 'deferrable', trigger.tgdeferrable::TEXT),
    (9, 'initially_deferred', trigger.tginitdeferred::TEXT),
    (10, 'arguments_hex', encode(trigger.tgargs, 'hex')),
    (11, 'attributes', trigger.tgattr::TEXT),
    (12, 'qualification', COALESCE(trigger.tgqual::TEXT, '')),
    (13, 'definition', pg_get_triggerdef(trigger.oid, false))
  ) AS field(ordinal, name, value)
  WHERE trigger.oid = trigger_oid
$function$;

CREATE FUNCTION public.candidate_security_checker_descriptor()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog
AS $function$
  WITH required(ordinal, signature) AS (
    VALUES
      (1, 'public.candidate_security_routine_descriptor(oid)'),
      (2, 'public.candidate_security_trigger_descriptor(oid)'),
      (3, 'public.candidate_security_checker_descriptor()'),
      (4, 'public.candidate_security_graph_descriptor()'),
      (5, 'public.candidate_security_graph_drift(text,text)')
  )
  SELECT string_agg(
    required.signature || E'\x1e' || COALESCE(
      public.candidate_security_routine_descriptor(
        to_regprocedure(required.signature)::OID
      ),
      'missing'
    ),
    E'\x1f' ORDER BY required.ordinal
  )
  FROM required
$function$;

CREATE FUNCTION public.candidate_security_graph_descriptor()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog
AS $function$
  WITH required_routine(signature) AS (
    VALUES
      ('public.candidate_json_number_to_javascript(jsonb)'),
      ('public.candidate_canonical_json(jsonb)'),
      ('public.candidate_writer_hash(text,jsonb)'),
      ('public.candidate_json_keys_equal(jsonb,text[])'),
      ('public.candidate_json_integer(jsonb)'),
      ('public.candidate_json_nonempty_text_array(jsonb)'),
      ('public.candidate_writer_assert_open(text)'),
      ('public.candidate_stored_output_manifest(text)'),
      ('public.candidate_content_unit_append(jsonb)'),
      ('public.candidate_worker_append(text,jsonb)'),
      ('public.candidate_reconciler_append(jsonb)'),
      ('public.reject_candidate_history_change()'),
      ('public.reject_invalid_candidate_run_scope()'),
      ('public.reject_invalid_candidate_machine_payload()'),
      ('public.candidate_critical_trigger_drift(text)'),
      ('public.candidate_other_database_connect_issue(text,text)'),
      ('public.candidate_security_routine_descriptor(oid)'),
      ('public.candidate_security_trigger_descriptor(oid)'),
      ('public.candidate_security_checker_descriptor()'),
      ('public.candidate_security_graph_descriptor()'),
      ('public.candidate_security_graph_drift(text,text)')
  ), candidate_table(relname) AS (
    VALUES
      ('CandidateContentUnit'), ('CandidateAnalysisRun'),
      ('CandidateAnalysisRunInput'), ('CandidateAnalysisRunEvent'),
      ('CandidateAnalysisArtifact'), ('CandidateAssertion'),
      ('CandidateEvidenceLink'), ('CandidateDependency'),
      ('CandidateReconciliationSnapshot'), ('CandidateHumanReviewDecision'),
      ('CandidatePromotionDecision')
  ), descriptor(label, value) AS (
    SELECT 'routine/' || signature,
      COALESCE(public.candidate_security_routine_descriptor(
        to_regprocedure(signature)::OID
      ), 'missing')
    FROM required_routine
    UNION ALL
    SELECT 'table/public.' || candidate_table.relname,
      'owner_is_database_owner=' || COALESCE((
        SELECT (class.relowner = database.datdba)::TEXT
        FROM pg_class class
        JOIN pg_namespace namespace ON namespace.oid = class.relnamespace
        JOIN pg_database database ON database.datname = current_database()
        WHERE namespace.nspname = 'public'
          AND class.relname = candidate_table.relname
          AND class.relkind IN ('r', 'p')
      ), 'missing')
    FROM candidate_table
    UNION ALL
    SELECT 'trigger/public.' || class.relname || '/' || trigger.tgname,
      public.candidate_security_trigger_descriptor(trigger.oid)
    FROM pg_trigger trigger
    JOIN pg_class class ON class.oid = trigger.tgrelid
    JOIN pg_namespace namespace ON namespace.oid = class.relnamespace
    WHERE namespace.nspname = 'public'
      AND class.relname IN (SELECT relname FROM candidate_table)
      AND NOT trigger.tgisinternal
  )
  SELECT string_agg(
    descriptor.label || E'\x1e' || descriptor.value,
    E'\x1f' ORDER BY descriptor.label COLLATE "C"
  )
  FROM descriptor
$function$;

CREATE FUNCTION public.candidate_security_graph_drift(
  expected_checker_sha256 TEXT,
  expected_graph_sha256 TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog
AS $function$
DECLARE
  actual_checker_sha256 TEXT;
  actual_graph_sha256 TEXT;
BEGIN
  IF expected_checker_sha256 !~ '^[0-9a-f]{64}$'
    OR expected_graph_sha256 !~ '^[0-9a-f]{64}$' THEN
    RETURN 'candidate_security_checker_drift';
  END IF;

  actual_checker_sha256 := encode(sha256(convert_to(
    public.candidate_security_checker_descriptor(), 'UTF8'
  )), 'hex');
  IF actual_checker_sha256 IS DISTINCT FROM expected_checker_sha256 THEN
    RETURN 'candidate_security_checker_drift';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_class class
    JOIN pg_namespace namespace ON namespace.oid = class.relnamespace
    JOIN pg_database database ON database.datname = current_database()
    WHERE namespace.nspname = 'public'
      AND class.relname IN (
        'CandidateContentUnit', 'CandidateAnalysisRun',
        'CandidateAnalysisRunInput', 'CandidateAnalysisRunEvent',
        'CandidateAnalysisArtifact', 'CandidateAssertion',
        'CandidateEvidenceLink', 'CandidateDependency',
        'CandidateReconciliationSnapshot', 'CandidateHumanReviewDecision',
        'CandidatePromotionDecision'
      )
      AND class.relowner <> database.datdba
  ) OR EXISTS (
    SELECT 1
    FROM pg_proc procedure
    JOIN pg_namespace namespace ON namespace.oid = procedure.pronamespace
    JOIN pg_database database ON database.datname = current_database()
    WHERE namespace.nspname = 'public'
      AND procedure.proname LIKE 'candidate_%'
      AND procedure.proowner <> database.datdba
  ) THEN
    RETURN 'candidate_security_owner_drift';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc procedure
    WHERE procedure.oid = to_regprocedure(
      'public.candidate_content_unit_append(jsonb)'
    ) AND procedure.prosecdef AND NOT procedure.proisstrict
      AND procedure.provolatile = 'v' AND procedure.proparallel = 'u'
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_proc procedure
    WHERE procedure.oid = to_regprocedure(
      'public.candidate_worker_append(text,jsonb)'
    ) AND procedure.prosecdef AND NOT procedure.proisstrict
      AND procedure.provolatile = 'v' AND procedure.proparallel = 'u'
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_proc procedure
    WHERE procedure.oid = to_regprocedure(
      'public.candidate_reconciler_append(jsonb)'
    ) AND procedure.prosecdef AND NOT procedure.proisstrict
      AND procedure.provolatile = 'v' AND procedure.proparallel = 'u'
  ) THEN
    RETURN 'candidate_writer_abi_drift';
  END IF;

  IF public.candidate_critical_trigger_drift('public') IS NOT NULL
    OR EXISTS (
      SELECT 1
      FROM pg_trigger trigger
      JOIN pg_class class ON class.oid = trigger.tgrelid
      JOIN pg_namespace namespace ON namespace.oid = class.relnamespace
      WHERE namespace.nspname = 'public'
        AND NOT trigger.tgisinternal
        AND class.relname IN (
          'CandidateContentUnit', 'CandidateAnalysisRun',
          'CandidateAnalysisRunInput', 'CandidateAnalysisRunEvent',
          'CandidateAnalysisArtifact', 'CandidateAssertion',
          'CandidateEvidenceLink', 'CandidateDependency',
          'CandidateReconciliationSnapshot', 'CandidateHumanReviewDecision',
          'CandidatePromotionDecision'
        )
        AND (
          trigger.tgdeferrable OR trigger.tginitdeferred
          OR octet_length(trigger.tgargs) <> 0
          OR trigger.tgattr::TEXT <> ''
          OR trigger.tgqual IS NOT NULL
          OR trigger.tgtype::INTEGER <> CASE
            WHEN trigger.tgname LIKE '%_reject_update_delete' THEN 27
            WHEN trigger.tgname LIKE '%_reject_truncate' THEN 34
            WHEN trigger.tgname LIKE '%_reject_invalid_scope' THEN 7
            WHEN trigger.tgname LIKE '%_reject_invalid_machine_payload' THEN 7
            ELSE -1
          END
        )
    ) THEN
    RETURN 'candidate_trigger_identity_drift';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_trigger trigger
    JOIN pg_class class ON class.oid = trigger.tgrelid
    JOIN pg_namespace namespace ON namespace.oid = class.relnamespace
    JOIN pg_proc procedure ON procedure.oid = trigger.tgfoid
    JOIN pg_namespace routine_namespace ON routine_namespace.oid = procedure.pronamespace
    WHERE namespace.nspname = 'public'
      AND NOT trigger.tgisinternal
      AND class.relname IN (
        'CandidateContentUnit', 'CandidateAnalysisRun',
        'CandidateAnalysisRunInput', 'CandidateAnalysisRunEvent',
        'CandidateAnalysisArtifact', 'CandidateAssertion',
        'CandidateEvidenceLink', 'CandidateDependency',
        'CandidateReconciliationSnapshot', 'CandidateHumanReviewDecision',
        'CandidatePromotionDecision'
      )
      AND (
        routine_namespace.nspname <> 'public'
        OR procedure.proname <> CASE
          WHEN trigger.tgname LIKE '%_reject_update_delete'
            OR trigger.tgname LIKE '%_reject_truncate'
            THEN 'reject_candidate_history_change'
          WHEN trigger.tgname LIKE '%_reject_invalid_scope'
            THEN 'reject_invalid_candidate_run_scope'
          WHEN trigger.tgname LIKE '%_reject_invalid_machine_payload'
            THEN 'reject_invalid_candidate_machine_payload'
          ELSE ''
        END
      )
  ) THEN
    RETURN 'candidate_trigger_function_drift';
  END IF;

  actual_graph_sha256 := encode(sha256(convert_to(
    public.candidate_security_graph_descriptor(), 'UTF8'
  )), 'hex');
  IF actual_graph_sha256 IS DISTINCT FROM expected_graph_sha256 THEN
    RETURN 'candidate_security_graph_hash_mismatch';
  END IF;
  RETURN NULL;
END
$function$;

REVOKE ALL ON FUNCTION public.candidate_critical_trigger_drift(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.candidate_other_database_connect_issue(TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.candidate_security_routine_descriptor(OID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.candidate_security_trigger_descriptor(OID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.candidate_security_checker_descriptor() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.candidate_security_graph_descriptor() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.candidate_security_graph_drift(TEXT, TEXT) FROM PUBLIC;

REVOKE ALL PRIVILEGES ON TABLE "CandidateContentUnit" FROM PUBLIC;
CREATE TRIGGER "CandidateContentUnit_reject_update_delete" BEFORE UPDATE OR DELETE ON "CandidateContentUnit" FOR EACH ROW EXECUTE FUNCTION public.reject_candidate_history_change();
CREATE TRIGGER "CandidateContentUnit_reject_truncate" BEFORE TRUNCATE ON "CandidateContentUnit" FOR EACH STATEMENT EXECUTE FUNCTION public.reject_candidate_history_change();
ALTER TABLE "CandidateContentUnit"
  ENABLE ALWAYS TRIGGER "CandidateContentUnit_reject_update_delete";
ALTER TABLE "CandidateContentUnit"
  ENABLE ALWAYS TRIGGER "CandidateContentUnit_reject_truncate";

REVOKE ALL PRIVILEGES ON TABLE "CandidateAnalysisRun" FROM PUBLIC;
CREATE TRIGGER "CandidateAnalysisRun_reject_invalid_scope" BEFORE INSERT ON "CandidateAnalysisRun" FOR EACH ROW EXECUTE FUNCTION public.reject_invalid_candidate_run_scope();
CREATE TRIGGER "CandidateAnalysisRun_reject_update_delete" BEFORE UPDATE OR DELETE ON "CandidateAnalysisRun" FOR EACH ROW EXECUTE FUNCTION public.reject_candidate_history_change();
CREATE TRIGGER "CandidateAnalysisRun_reject_truncate" BEFORE TRUNCATE ON "CandidateAnalysisRun" FOR EACH STATEMENT EXECUTE FUNCTION public.reject_candidate_history_change();
ALTER TABLE "CandidateAnalysisRun"
  ENABLE ALWAYS TRIGGER "CandidateAnalysisRun_reject_invalid_scope";
ALTER TABLE "CandidateAnalysisRun"
  ENABLE ALWAYS TRIGGER "CandidateAnalysisRun_reject_update_delete";
ALTER TABLE "CandidateAnalysisRun"
  ENABLE ALWAYS TRIGGER "CandidateAnalysisRun_reject_truncate";

REVOKE ALL PRIVILEGES ON TABLE "CandidateAnalysisRunInput" FROM PUBLIC;
CREATE TRIGGER "CandidateAnalysisRunInput_reject_update_delete" BEFORE UPDATE OR DELETE ON "CandidateAnalysisRunInput" FOR EACH ROW EXECUTE FUNCTION public.reject_candidate_history_change();
CREATE TRIGGER "CandidateAnalysisRunInput_reject_truncate" BEFORE TRUNCATE ON "CandidateAnalysisRunInput" FOR EACH STATEMENT EXECUTE FUNCTION public.reject_candidate_history_change();
ALTER TABLE "CandidateAnalysisRunInput"
  ENABLE ALWAYS TRIGGER "CandidateAnalysisRunInput_reject_update_delete";
ALTER TABLE "CandidateAnalysisRunInput"
  ENABLE ALWAYS TRIGGER "CandidateAnalysisRunInput_reject_truncate";

REVOKE ALL PRIVILEGES ON TABLE "CandidateAnalysisRunEvent" FROM PUBLIC;
CREATE TRIGGER "CandidateAnalysisRunEvent_reject_invalid_machine_payload" BEFORE INSERT ON "CandidateAnalysisRunEvent" FOR EACH ROW EXECUTE FUNCTION public.reject_invalid_candidate_machine_payload();
CREATE TRIGGER "CandidateAnalysisRunEvent_reject_update_delete" BEFORE UPDATE OR DELETE ON "CandidateAnalysisRunEvent" FOR EACH ROW EXECUTE FUNCTION public.reject_candidate_history_change();
CREATE TRIGGER "CandidateAnalysisRunEvent_reject_truncate" BEFORE TRUNCATE ON "CandidateAnalysisRunEvent" FOR EACH STATEMENT EXECUTE FUNCTION public.reject_candidate_history_change();
ALTER TABLE "CandidateAnalysisRunEvent"
  ENABLE ALWAYS TRIGGER "CandidateAnalysisRunEvent_reject_invalid_machine_payload";
ALTER TABLE "CandidateAnalysisRunEvent"
  ENABLE ALWAYS TRIGGER "CandidateAnalysisRunEvent_reject_update_delete";
ALTER TABLE "CandidateAnalysisRunEvent"
  ENABLE ALWAYS TRIGGER "CandidateAnalysisRunEvent_reject_truncate";

REVOKE ALL PRIVILEGES ON TABLE "CandidateAnalysisArtifact" FROM PUBLIC;
CREATE TRIGGER "CandidateAnalysisArtifact_reject_invalid_machine_payload" BEFORE INSERT ON "CandidateAnalysisArtifact" FOR EACH ROW EXECUTE FUNCTION public.reject_invalid_candidate_machine_payload();
CREATE TRIGGER "CandidateAnalysisArtifact_reject_update_delete" BEFORE UPDATE OR DELETE ON "CandidateAnalysisArtifact" FOR EACH ROW EXECUTE FUNCTION public.reject_candidate_history_change();
CREATE TRIGGER "CandidateAnalysisArtifact_reject_truncate" BEFORE TRUNCATE ON "CandidateAnalysisArtifact" FOR EACH STATEMENT EXECUTE FUNCTION public.reject_candidate_history_change();
ALTER TABLE "CandidateAnalysisArtifact"
  ENABLE ALWAYS TRIGGER "CandidateAnalysisArtifact_reject_invalid_machine_payload";
ALTER TABLE "CandidateAnalysisArtifact"
  ENABLE ALWAYS TRIGGER "CandidateAnalysisArtifact_reject_update_delete";
ALTER TABLE "CandidateAnalysisArtifact"
  ENABLE ALWAYS TRIGGER "CandidateAnalysisArtifact_reject_truncate";

REVOKE ALL PRIVILEGES ON TABLE "CandidateAssertion" FROM PUBLIC;
CREATE TRIGGER "CandidateAssertion_reject_invalid_machine_payload" BEFORE INSERT ON "CandidateAssertion" FOR EACH ROW EXECUTE FUNCTION public.reject_invalid_candidate_machine_payload();
CREATE TRIGGER "CandidateAssertion_reject_update_delete" BEFORE UPDATE OR DELETE ON "CandidateAssertion" FOR EACH ROW EXECUTE FUNCTION public.reject_candidate_history_change();
CREATE TRIGGER "CandidateAssertion_reject_truncate" BEFORE TRUNCATE ON "CandidateAssertion" FOR EACH STATEMENT EXECUTE FUNCTION public.reject_candidate_history_change();
ALTER TABLE "CandidateAssertion"
  ENABLE ALWAYS TRIGGER "CandidateAssertion_reject_invalid_machine_payload";
ALTER TABLE "CandidateAssertion"
  ENABLE ALWAYS TRIGGER "CandidateAssertion_reject_update_delete";
ALTER TABLE "CandidateAssertion"
  ENABLE ALWAYS TRIGGER "CandidateAssertion_reject_truncate";

REVOKE ALL PRIVILEGES ON TABLE "CandidateEvidenceLink" FROM PUBLIC;
CREATE TRIGGER "CandidateEvidenceLink_reject_update_delete" BEFORE UPDATE OR DELETE ON "CandidateEvidenceLink" FOR EACH ROW EXECUTE FUNCTION public.reject_candidate_history_change();
CREATE TRIGGER "CandidateEvidenceLink_reject_truncate" BEFORE TRUNCATE ON "CandidateEvidenceLink" FOR EACH STATEMENT EXECUTE FUNCTION public.reject_candidate_history_change();
ALTER TABLE "CandidateEvidenceLink"
  ENABLE ALWAYS TRIGGER "CandidateEvidenceLink_reject_update_delete";
ALTER TABLE "CandidateEvidenceLink"
  ENABLE ALWAYS TRIGGER "CandidateEvidenceLink_reject_truncate";

REVOKE ALL PRIVILEGES ON TABLE "CandidateDependency" FROM PUBLIC;
CREATE TRIGGER "CandidateDependency_reject_update_delete" BEFORE UPDATE OR DELETE ON "CandidateDependency" FOR EACH ROW EXECUTE FUNCTION public.reject_candidate_history_change();
CREATE TRIGGER "CandidateDependency_reject_truncate" BEFORE TRUNCATE ON "CandidateDependency" FOR EACH STATEMENT EXECUTE FUNCTION public.reject_candidate_history_change();
ALTER TABLE "CandidateDependency"
  ENABLE ALWAYS TRIGGER "CandidateDependency_reject_update_delete";
ALTER TABLE "CandidateDependency"
  ENABLE ALWAYS TRIGGER "CandidateDependency_reject_truncate";

REVOKE ALL PRIVILEGES ON TABLE "CandidateReconciliationSnapshot" FROM PUBLIC;
CREATE TRIGGER "CandidateReconciliationSnapshot_reject_invalid_machine_payload" BEFORE INSERT ON "CandidateReconciliationSnapshot" FOR EACH ROW EXECUTE FUNCTION public.reject_invalid_candidate_machine_payload();
CREATE TRIGGER "CandidateReconciliationSnapshot_reject_update_delete" BEFORE UPDATE OR DELETE ON "CandidateReconciliationSnapshot" FOR EACH ROW EXECUTE FUNCTION public.reject_candidate_history_change();
CREATE TRIGGER "CandidateReconciliationSnapshot_reject_truncate" BEFORE TRUNCATE ON "CandidateReconciliationSnapshot" FOR EACH STATEMENT EXECUTE FUNCTION public.reject_candidate_history_change();
ALTER TABLE "CandidateReconciliationSnapshot"
  ENABLE ALWAYS TRIGGER "CandidateReconciliationSnapshot_reject_invalid_machine_payload";
ALTER TABLE "CandidateReconciliationSnapshot"
  ENABLE ALWAYS TRIGGER "CandidateReconciliationSnapshot_reject_update_delete";
ALTER TABLE "CandidateReconciliationSnapshot"
  ENABLE ALWAYS TRIGGER "CandidateReconciliationSnapshot_reject_truncate";

REVOKE ALL PRIVILEGES ON TABLE "CandidateHumanReviewDecision" FROM PUBLIC;
CREATE TRIGGER "CandidateHumanReviewDecision_reject_update_delete" BEFORE UPDATE OR DELETE ON "CandidateHumanReviewDecision" FOR EACH ROW EXECUTE FUNCTION public.reject_candidate_history_change();
CREATE TRIGGER "CandidateHumanReviewDecision_reject_truncate" BEFORE TRUNCATE ON "CandidateHumanReviewDecision" FOR EACH STATEMENT EXECUTE FUNCTION public.reject_candidate_history_change();
ALTER TABLE "CandidateHumanReviewDecision"
  ENABLE ALWAYS TRIGGER "CandidateHumanReviewDecision_reject_update_delete";
ALTER TABLE "CandidateHumanReviewDecision"
  ENABLE ALWAYS TRIGGER "CandidateHumanReviewDecision_reject_truncate";

REVOKE ALL PRIVILEGES ON TABLE "CandidatePromotionDecision" FROM PUBLIC;
CREATE TRIGGER "CandidatePromotionDecision_reject_update_delete" BEFORE UPDATE OR DELETE ON "CandidatePromotionDecision" FOR EACH ROW EXECUTE FUNCTION public.reject_candidate_history_change();
CREATE TRIGGER "CandidatePromotionDecision_reject_truncate" BEFORE TRUNCATE ON "CandidatePromotionDecision" FOR EACH STATEMENT EXECUTE FUNCTION public.reject_candidate_history_change();
ALTER TABLE "CandidatePromotionDecision"
  ENABLE ALWAYS TRIGGER "CandidatePromotionDecision_reject_update_delete";
ALTER TABLE "CandidatePromotionDecision"
  ENABLE ALWAYS TRIGGER "CandidatePromotionDecision_reject_truncate";
