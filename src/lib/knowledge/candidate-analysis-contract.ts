import { createHash } from "node:crypto";

import { z } from "zod";

export const CANDIDATE_ANALYSIS_SCHEMA_VERSION = "candidate-analysis-v1" as const;
export const CANDIDATE_OUTPUT_MANIFEST_VERSION =
  "candidate-output-manifest-v1" as const;
export const CANDIDATE_WORKFLOW_BINDING = {
  id: "workflow.candidate_analysis.v1",
  version: "1.0.0",
  path: "knowledge/corpus/workflows/candidate-analysis-v1.md",
} as const;
export const CANDIDATE_PROMPT_BINDING = {
  id: "prompt.candidate_analysis.v1",
  version: "1.0.0",
  path: "knowledge/corpus/workflows/candidate-analysis-prompt-v1.md",
} as const;

export const CANDIDATE_IDENTITY_CONFIDENCE = [
  "exact",
  "provisional",
  "unresolved",
] as const;
export const CANDIDATE_EVIDENCE_LEVELS = [
  "exact_locator",
  "partial_locator",
  "no_locator",
] as const;
export const CANDIDATE_MACHINE_USES = [
  "candidate_only",
  "reusable_for_ai_context",
  "quarantined",
] as const;
export const CANDIDATE_RUN_EVENT_TYPES = [
  "queued",
  "started",
  "checkpoint",
  "candidate_completed",
  "partial_completed",
  "failed",
  "blocked_input",
  "quarantined",
  "superseded",
] as const;
export const CANDIDATE_ASSERTION_TYPES = [
  "claim",
  "classification",
  "entity_link",
  "relationship",
  "quantitative_observation",
  "coverage_signal",
  "gap",
  "contradiction",
  "source_role_suggestion",
] as const;
export const CANDIDATE_EVIDENCE_RELATIONS = [
  "supports",
  "contradicts",
  "contextualizes",
] as const;
export const CANDIDATE_PROMOTION_STATES = [
  "candidate",
  "internal_curated",
  "external_eligible",
  "published",
  "revoked",
] as const;
export const CANDIDATE_REVIEW_DECISIONS = [
  "accepted",
  "accepted_with_edits",
  "rejected",
  "deferred",
  "rerun_requested",
] as const;
export const CANDIDATE_CONTENT_UNIT_TYPES = [
  "pdf_page",
  "document_section",
  "web_section",
  "slide",
  "sheet_range",
  "transcript_segment",
  "database_record",
  "dataset_slice",
  "media_segment",
] as const;

export type CandidateIdentityConfidence =
  (typeof CANDIDATE_IDENTITY_CONFIDENCE)[number];
export type CandidateEvidenceLevel = (typeof CANDIDATE_EVIDENCE_LEVELS)[number];
export type CandidateMachineUse = (typeof CANDIDATE_MACHINE_USES)[number];
export type CandidateRunEventType = (typeof CANDIDATE_RUN_EVENT_TYPES)[number];
export type CandidateAssertionType = (typeof CANDIDATE_ASSERTION_TYPES)[number];
export type CandidateEvidenceRelation =
  (typeof CANDIDATE_EVIDENCE_RELATIONS)[number];
export type CandidatePromotionState =
  (typeof CANDIDATE_PROMOTION_STATES)[number];
export type CandidateReviewDecision =
  (typeof CANDIDATE_REVIEW_DECISIONS)[number];
export type CandidateContentUnitType =
  (typeof CANDIDATE_CONTENT_UNIT_TYPES)[number];
export type CandidateAnalysisMachineState =
  | "queued"
  | "running"
  | "candidate_complete"
  | "partial"
  | "failed"
  | "blocked_input"
  | "quarantined"
  | "superseded";

export type CandidateJsonValue =
  | null
  | boolean
  | number
  | string
  | CandidateJsonValue[]
  | { [key: string]: CandidateJsonValue };

const HASH_PATTERN = /^[a-f0-9]{64}$/;
const IDENTIFIER_PATTERN = /^[a-z0-9][a-z0-9._:-]*$/;

const hashSchema = z.string().regex(HASH_PATTERN);
const identifierSchema = z.string().regex(IDENTIFIER_PATTERN);
const nonEmptyTextSchema = z.string().min(1);

const RESERVED_MACHINE_PAYLOAD_REVIEW_KEYS = new Set([
  "reviewauthority",
  "reviewdecision",
  "reviewer",
  "reviewedat",
  "reviewprofile",
  "reviewreceipt",
  "reviewstatus",
]);
const AUTHORITY_STATE_VALUES = new Set([
  "accepted",
  "acceptedwithedits",
  "approved",
  "canonical",
  "cleared",
  "complete",
  "externaleligible",
  "externalready",
  "humanreviewed",
  "internalcurated",
  "promoted",
  "published",
  "rightscomplete",
]);
const AUTHORITY_FIELD_NAMES = new Set([
  "approval",
  "authority",
  "coverage",
  "humanreview",
  "promotion",
  "publication",
  "review",
  "rights",
]);

function isReservedMachinePayloadKey(key: string): boolean {
  const normalized = key.replace(/[^a-z0-9]/gi, "").toLowerCase();
  if (
    normalized.includes("humanreview") ||
    RESERVED_MACHINE_PAYLOAD_REVIEW_KEYS.has(normalized) ||
    normalized.includes("approval") ||
    normalized.includes("approved") ||
    normalized.includes("promotion") ||
    normalized.includes("publication") ||
    normalized.includes("published")
  ) {
    return true;
  }
  if (
    normalized.includes("external") &&
    (normalized.includes("ready") ||
      normalized.includes("eligible") ||
      normalized.includes("allowed"))
  ) {
    return true;
  }
  return (
    normalized.includes("coverage") &&
    (normalized.includes("authority") ||
      normalized.includes("ready") ||
      normalized.includes("promotion") ||
      normalized.includes("approval") ||
      normalized.includes("eligible") ||
      normalized.includes("allowed"))
  );
}

function isAuthorityBearingMachinePayloadEntry(
  key: string,
  value: CandidateJsonValue,
): boolean {
  const normalized = key.replace(/[^a-z0-9]/gi, "").toLowerCase();
  if (
    isReservedMachinePayloadKey(key) ||
    AUTHORITY_FIELD_NAMES.has(normalized) ||
    normalized.includes("canonical") ||
    normalized.includes("rights") ||
    normalized.includes("coverage") ||
    (normalized.includes("human") &&
      (normalized.includes("decision") ||
        normalized.includes("authority") ||
        normalized.includes("approval") ||
        normalized.includes("review")))
  ) {
    return true;
  }
  if (
    normalized === "status" ||
    normalized === "state" ||
    normalized.endsWith("status") ||
    normalized.endsWith("state") ||
    normalized.endsWith("decision") ||
    normalized.endsWith("authority") ||
    normalized.endsWith("readiness") ||
    normalized.endsWith("clearance") ||
    normalized.endsWith("eligibility")
  ) {
    if (typeof value !== "string") return false;
    const normalizedValue = value.replace(/[^a-z0-9]/gi, "").toLowerCase();
    return AUTHORITY_STATE_VALUES.has(normalizedValue);
  }
  return false;
}

function candidateJsonObjectSchema() {
  return z
    .record(z.string(), CandidateJsonValueSchema)
    .superRefine((value, ctx) => {
      for (const key of Object.keys(value)) {
        if (isAuthorityBearingMachinePayloadEntry(key, value[key]!)) {
          ctx.addIssue({
            code: "custom",
            message:
              "candidate_payload_authority_forbidden:reserved_machine_payload_field",
            path: [key],
          });
        }
      }
    });
}

const CandidateJsonValueSchema: z.ZodType<CandidateJsonValue> = z.lazy(() =>
  z.union([
    z.null(),
    z.boolean(),
    z.number(),
    z.string(),
    z.array(CandidateJsonValueSchema),
    candidateJsonObjectSchema(),
  ]),
);

function candidatePayloadSchema<Kind extends string>(kind: Kind) {
  return z
    .object({
      namespace: z.literal("candidate"),
      kind: z.literal(kind),
      data: CandidateJsonValueSchema,
    })
    .strict();
}

export const CandidateAssertionPayloadSchema = candidatePayloadSchema("assertion");
export const CandidateArtifactPayloadSchema = candidatePayloadSchema("artifact");
export const CandidateRunEventPayloadSchema = candidatePayloadSchema("run_event");
export const CandidateReconciliationPayloadSchema =
  candidatePayloadSchema("reconciliation");

const CandidateOutputManifestSchema = z
  .object({
    schemaVersion: z.literal(CANDIDATE_OUTPUT_MANIFEST_VERSION),
    inputs: z.array(
      z
        .object({
          contentUnitId: identifierSchema,
          position: z.number().int().nonnegative(),
          contentHash: hashSchema,
          identityConfidence: z.enum(CANDIDATE_IDENTITY_CONFIDENCE),
        })
        .strict(),
    ),
    artifacts: z.array(
      z
        .object({
          id: identifierSchema,
          artifactType: identifierSchema,
          schemaVersion: z.literal(CANDIDATE_ANALYSIS_SCHEMA_VERSION),
          payloadHash: hashSchema,
        })
        .strict(),
    ),
    assertions: z.array(
      z
        .object({
          id: identifierSchema,
          assertionType: z.enum(CANDIDATE_ASSERTION_TYPES),
          schemaVersion: z.literal(CANDIDATE_ANALYSIS_SCHEMA_VERSION),
          payloadHash: hashSchema,
          confidence: z.number().min(0).max(1).nullable(),
          machineUse: z.enum(CANDIDATE_MACHINE_USES),
          identityConfidence: z.enum(CANDIDATE_IDENTITY_CONFIDENCE),
          evidenceLevel: z.enum(CANDIDATE_EVIDENCE_LEVELS),
          limitations: z.array(nonEmptyTextSchema),
          scopeKey: identifierSchema,
          scopeHash: hashSchema,
          supersededAssertionId: identifierSchema.nullable(),
          supersededAssertionPayloadHash: hashSchema.nullable(),
        })
        .strict(),
    ),
    evidenceLinks: z.array(
      z
        .object({
          id: identifierSchema,
          assertionId: identifierSchema,
          contentUnitId: identifierSchema,
          relation: z.enum(CANDIDATE_EVIDENCE_RELATIONS),
          locatorHash: hashSchema,
          excerptHash: hashSchema.nullable(),
        })
        .strict(),
    ),
    dependencies: z.array(
      z
        .object({
          id: identifierSchema,
          assertionId: identifierSchema,
          upstreamAssertionId: identifierSchema,
          relation: identifierSchema,
          inheritedLimitations: z.array(nonEmptyTextSchema),
        })
        .strict(),
    ),
    reconciliationSnapshots: z.array(
      z
        .object({
          id: identifierSchema,
          scopeHash: hashSchema,
          payloadHash: hashSchema,
          conflictCount: z.number().int().nonnegative(),
        })
        .strict(),
    ),
  })
  .strict()
  .superRefine((manifest, ctx) => {
    const sortedUnique = <T extends { id: string }>(values: T[]) => {
      const expected = [...new Set(values.map(({ id }) => id))].sort();
      return (
        expected.length === values.length &&
        values.every(({ id }, index) => id === expected[index])
      );
    };
    if (
      manifest.inputs.some(({ position }, index) => position !== index) ||
      new Set(manifest.inputs.map(({ contentUnitId }) => contentUnitId)).size !==
        manifest.inputs.length ||
      !sortedUnique(manifest.artifacts) ||
      !sortedUnique(manifest.assertions) ||
      !sortedUnique(manifest.evidenceLinks) ||
      !sortedUnique(manifest.dependencies) ||
      !sortedUnique(manifest.reconciliationSnapshots)
    ) {
      ctx.addIssue({ code: "custom", message: "candidate_manifest_not_canonical" });
    }
  });

export type CandidateOutputManifest = z.infer<
  typeof CandidateOutputManifestSchema
>;

export const CandidateRunTerminalPayloadSchema = z
  .object({
    namespace: z.literal("candidate"),
    kind: z.literal("run_terminal"),
    data: z
      .object({
        manifest: CandidateOutputManifestSchema,
        manifestHash: hashSchema,
      })
      .strict(),
  })
  .strict()
  .superRefine((payload, ctx) => {
    if (
      payload.data.manifestHash !==
      candidateAnalysisOutputManifestHash(payload.data.manifest)
    ) {
      ctx.addIssue({ code: "custom", message: "candidate_output_manifest_hash_mismatch" });
    }
  });

export const CandidateRunSupersessionPayloadSchema = z
  .object({
    namespace: z.literal("candidate"),
    kind: z.literal("run_supersession"),
    data: z.object({ reason: nonEmptyTextSchema }).strict(),
  })
  .strict();

export const CandidateContentUnitInputSchema = z
  .object({
    id: identifierSchema,
    sourceKind: identifierSchema,
    sourceKey: identifierSchema,
    sourceVersionHash: hashSchema,
    unitType: z.enum(CANDIDATE_CONTENT_UNIT_TYPES),
    ordinal: z.number().int().nonnegative(),
    locator: nonEmptyTextSchema,
    locatorHash: hashSchema,
    contentHash: hashSchema,
    hashAlgorithm: z.literal("sha256"),
    identityConfidence: z.enum(CANDIDATE_IDENTITY_CONFIDENCE),
  })
  .strict()
  .superRefine((contentUnit, ctx) => {
    if (
      contentUnit.locatorHash !==
      candidateAnalysisEvidenceLocatorHash(contentUnit.locator)
    ) {
      ctx.addIssue({ code: "custom", message: "candidate_locator_hash_mismatch" });
    }
  });

export const CandidateAnalysisRunContentInputSchema = z
  .object({
    contentUnitId: identifierSchema,
    position: z.number().int().nonnegative(),
    inputHash: hashSchema,
  })
  .strict();

const runEventBaseFields = {
  id: identifierSchema,
  runId: identifierSchema,
  sequence: z.number().int().positive(),
  eventHash: hashSchema,
};

const CandidateOrdinaryRunEventInputSchema = z
  .object({
    ...runEventBaseFields,
    eventType: z.enum([
      "queued",
      "started",
      "checkpoint",
      "failed",
      "blocked_input",
      "quarantined",
    ]),
    payload: CandidateRunEventPayloadSchema.nullable(),
    supersededEventId: z.null().optional().default(null),
    supersededEventHash: z.null().optional().default(null),
    supersessionScopeHash: z.null().optional().default(null),
  })
  .strict();

const CandidateCompletedRunEventInputSchema = z
  .object({
    ...runEventBaseFields,
    eventType: z.enum(["candidate_completed", "partial_completed"]),
    payload: CandidateRunTerminalPayloadSchema,
    supersededEventId: z.null().optional().default(null),
    supersededEventHash: z.null().optional().default(null),
    supersessionScopeHash: z.null().optional().default(null),
  })
  .strict();

const CandidateSupersededRunEventInputSchema = z
  .object({
    ...runEventBaseFields,
    eventType: z.literal("superseded"),
    payload: CandidateRunSupersessionPayloadSchema,
    supersededEventId: identifierSchema.optional(),
    supersededEventHash: hashSchema.optional(),
    supersessionScopeHash: hashSchema.optional(),
  })
  .strict()
  .superRefine((event, ctx) => {
    if (
      event.supersededEventId === undefined ||
      event.supersededEventHash === undefined ||
      event.supersessionScopeHash === undefined
    ) {
      ctx.addIssue({
        code: "custom",
        message: "superseded_event_binding_required",
      });
      return;
    }
    if (event.id === event.supersededEventId) {
      ctx.addIssue({ code: "custom", message: "event_self_supersession" });
    }
    if (event.supersessionScopeHash !== candidateAnalysisRunScopeHash(event.runId)) {
      ctx.addIssue({ code: "custom", message: "event_supersession_scope_mismatch" });
    }
  });

export const CandidateAnalysisRunEventInputSchema = z
  .discriminatedUnion("eventType", [
    CandidateOrdinaryRunEventInputSchema,
    CandidateCompletedRunEventInputSchema,
    CandidateSupersededRunEventInputSchema,
  ])
  .superRefine((event, ctx) => {
    if (event.eventHash !== candidateAnalysisRunEventHash(event)) {
      ctx.addIssue({ code: "custom", message: "candidate_event_hash_mismatch" });
    }
  });

export const CandidateAnalysisRunInputSchema = z
  .object({
    id: identifierSchema,
    workflowId: identifierSchema,
    workflowVersion: nonEmptyTextSchema,
    workflowPath: nonEmptyTextSchema,
    workflowHash: hashSchema,
    promptId: identifierSchema,
    promptVersion: nonEmptyTextSchema,
    promptPath: nonEmptyTextSchema,
    promptHash: hashSchema,
    modelProvider: nonEmptyTextSchema,
    modelName: nonEmptyTextSchema,
    modelVersion: nonEmptyTextSchema,
    config: CandidateJsonValueSchema,
    configHash: hashSchema,
    inputEnvelopeHash: hashSchema,
    purpose: nonEmptyTextSchema,
    outputProfile: identifierSchema,
    workerId: identifierSchema,
    idempotencyKey: hashSchema,
    attempt: z.number().int().positive(),
    predecessorRunId: identifierSchema.nullable(),
    inputs: z.array(CandidateAnalysisRunContentInputSchema).min(1),
    initialEvent: CandidateAnalysisRunEventInputSchema,
  })
  .strict()
  .superRefine((run, ctx) => {
    if (
      run.workflowId !== CANDIDATE_WORKFLOW_BINDING.id ||
      run.workflowVersion !== CANDIDATE_WORKFLOW_BINDING.version ||
      run.workflowPath !== CANDIDATE_WORKFLOW_BINDING.path ||
      run.promptId !== CANDIDATE_PROMPT_BINDING.id ||
      run.promptVersion !== CANDIDATE_PROMPT_BINDING.version ||
      run.promptPath !== CANDIDATE_PROMPT_BINDING.path
    ) {
      ctx.addIssue({ code: "custom", message: "candidate_run_binding_mismatch" });
    }
    if (
      run.initialEvent.runId !== run.id ||
      run.initialEvent.sequence !== 1 ||
      run.initialEvent.eventType !== "queued"
    ) {
      ctx.addIssue({ code: "custom", message: "candidate_initial_event_invalid" });
    }
    if (run.configHash !== candidateAnalysisConfigHash(run.config)) {
      ctx.addIssue({ code: "custom", message: "candidate_config_hash_mismatch" });
    }
    if (run.inputEnvelopeHash !== candidateAnalysisInputEnvelopeHash(run.inputs)) {
      ctx.addIssue({ code: "custom", message: "candidate_input_envelope_hash_mismatch" });
    }
    const positions = run.inputs.map(({ position }) => position);
    const contentIds = run.inputs.map(({ contentUnitId }) => contentUnitId);
    if (
      positions.some((position, index) => position !== index) ||
      new Set(contentIds).size !== contentIds.length
    ) {
      ctx.addIssue({ code: "custom", message: "candidate_run_inputs_not_canonical" });
    }
    if (run.idempotencyKey !== candidateAnalysisRunIdempotencyKey(run)) {
      ctx.addIssue({ code: "custom", message: "candidate_idempotency_mismatch" });
    }
  });

export const CandidateAnalysisArtifactInputSchema = z
  .object({
    id: identifierSchema,
    runId: identifierSchema,
    artifactType: identifierSchema,
    schemaVersion: z.literal(CANDIDATE_ANALYSIS_SCHEMA_VERSION),
    payload: CandidateArtifactPayloadSchema,
    payloadHash: hashSchema,
  })
  .strict()
  .superRefine((artifact, ctx) => {
    if (artifact.payloadHash !== candidateAnalysisArtifactPayloadHash(artifact.payload)) {
      ctx.addIssue({ code: "custom", message: "candidate_artifact_hash_mismatch" });
    }
  });

export const CandidateAssertionInputSchema = z
  .object({
    id: identifierSchema,
    runId: identifierSchema,
    assertionType: z.enum(CANDIDATE_ASSERTION_TYPES),
    schemaVersion: z.literal(CANDIDATE_ANALYSIS_SCHEMA_VERSION),
    payload: CandidateAssertionPayloadSchema,
    payloadHash: hashSchema,
    confidence: z.number().min(0).max(1).nullable(),
    machineUse: z.enum(CANDIDATE_MACHINE_USES),
    identityConfidence: z.enum(CANDIDATE_IDENTITY_CONFIDENCE),
    evidenceLevel: z.enum(CANDIDATE_EVIDENCE_LEVELS),
    limitations: z.array(nonEmptyTextSchema),
    scopeKey: identifierSchema,
    scopeHash: hashSchema,
    supersededAssertionId: identifierSchema.nullable(),
    supersededAssertionPayloadHash: hashSchema.nullable(),
    promotionState: z.literal("candidate"),
  })
  .strict()
  .superRefine((assertion, ctx) => {
    if (assertion.payloadHash !== candidateAnalysisAssertionPayloadHash(assertion.payload)) {
      ctx.addIssue({ code: "custom", message: "candidate_assertion_hash_mismatch" });
    }
    if (assertion.scopeHash !== candidateAnalysisAssertionScopeHash(assertion.scopeKey)) {
      ctx.addIssue({ code: "custom", message: "candidate_assertion_scope_hash_mismatch" });
    }
    const hasSupersededId = assertion.supersededAssertionId !== null;
    const hasSupersededHash = assertion.supersededAssertionPayloadHash !== null;
    if (hasSupersededId !== hasSupersededHash) {
      ctx.addIssue({ code: "custom", message: "assertion_supersession_binding_incomplete" });
    }
    if (assertion.supersededAssertionId === assertion.id) {
      ctx.addIssue({ code: "custom", message: "assertion_self_supersession" });
    }
  });

export const CandidateEvidenceLinkInputSchema = z
  .object({
    id: identifierSchema,
    assertionId: identifierSchema,
    contentUnitId: identifierSchema,
    relation: z.enum(CANDIDATE_EVIDENCE_RELATIONS),
    locator: nonEmptyTextSchema,
    locatorHash: hashSchema,
    excerptHash: hashSchema.nullable(),
  })
  .strict()
  .superRefine((evidence, ctx) => {
    if (evidence.locatorHash !== candidateAnalysisEvidenceLocatorHash(evidence.locator)) {
      ctx.addIssue({ code: "custom", message: "candidate_evidence_locator_hash_mismatch" });
    }
  });

export const CandidateDependencyInputSchema = z
  .object({
    id: identifierSchema,
    assertionId: identifierSchema,
    upstreamAssertionId: identifierSchema,
    relation: identifierSchema,
    inheritedLimitations: z.array(nonEmptyTextSchema).superRefine((value, ctx) => {
      const expected = [...new Set(value)].sort();
      if (value.length !== expected.length || value.some((item, index) => item !== expected[index])) {
        ctx.addIssue({
          code: "custom",
          message: "inherited_limitations_not_sorted_deduplicated",
        });
      }
    }),
  })
  .strict();

export const CandidateReconciliationSnapshotInputSchema = z
  .object({
    id: identifierSchema,
    runId: identifierSchema,
    scope: CandidateJsonValueSchema,
    scopeHash: hashSchema,
    payload: CandidateReconciliationPayloadSchema,
    payloadHash: hashSchema,
    conflictCount: z.number().int().nonnegative(),
  })
  .strict()
  .superRefine((snapshot, ctx) => {
    if (snapshot.scopeHash !== candidateAnalysisReconciliationScopeHash(snapshot.scope)) {
      ctx.addIssue({ code: "custom", message: "candidate_reconciliation_scope_hash_mismatch" });
    }
    if (snapshot.payloadHash !== candidateAnalysisReconciliationPayloadHash(snapshot.payload)) {
      ctx.addIssue({ code: "custom", message: "candidate_reconciliation_payload_hash_mismatch" });
    }
  });

export type CandidateContentUnitInput = z.infer<
  typeof CandidateContentUnitInputSchema
>;
export type CandidateAnalysisRunContentInput = z.infer<
  typeof CandidateAnalysisRunContentInputSchema
>;
export type CandidateAnalysisRunInput = z.infer<
  typeof CandidateAnalysisRunInputSchema
>;
export type CandidateAnalysisRunEventInput = z.infer<
  typeof CandidateAnalysisRunEventInputSchema
>;
export type CandidateAnalysisArtifactInput = z.infer<
  typeof CandidateAnalysisArtifactInputSchema
>;
export type CandidateAssertionInput = z.infer<
  typeof CandidateAssertionInputSchema
>;
export type CandidateEvidenceLinkInput = z.infer<
  typeof CandidateEvidenceLinkInputSchema
>;
export type CandidateDependencyInput = z.infer<
  typeof CandidateDependencyInputSchema
>;
export type CandidateReconciliationSnapshotInput = z.infer<
  typeof CandidateReconciliationSnapshotInputSchema
>;

export type CandidateAnalysisContractErrorCode =
  | "event_sequence_gap"
  | "event_after_terminal_state"
  | "invalid_initial_event"
  | "invalid_event_transition"
  | "invalid_event_supersession";

export class CandidateAnalysisContractError extends Error {
  readonly code: CandidateAnalysisContractErrorCode;

  constructor(code: CandidateAnalysisContractErrorCode) {
    super(code);
    this.name = "CandidateAnalysisContractError";
    this.code = code;
  }
}

export function canonicalCandidateJson(value: CandidateJsonValue): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalCandidateJson).join(",")}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalCandidateJson(value[key]!)}`)
    .join(",")}}`;
}

export function candidateAnalysisSha256(
  domain: string,
  value: CandidateJsonValue,
): string {
  return createHash("sha256")
    .update(`food-systems/${domain}/v1\n`)
    .update(canonicalCandidateJson(value))
    .digest("hex");
}

export function candidateAnalysisConfigHash(config: CandidateJsonValue): string {
  return candidateAnalysisSha256("run-config", config);
}

export function candidateAnalysisInputEnvelopeHash(
  inputs: readonly CandidateAnalysisRunContentInput[],
): string {
  return candidateAnalysisSha256("run-input-envelope", {
    inputs: inputs.map(({ contentUnitId, position, inputHash }) => ({
      contentUnitId,
      position,
      inputHash,
    })),
  });
}

export function candidateAnalysisRunIdempotencyKey(run: {
  workflowId: string;
  workflowVersion: string;
  workflowPath: string;
  workflowHash: string;
  promptId: string;
  promptVersion: string;
  promptPath: string;
  promptHash: string;
  modelProvider: string;
  modelName: string;
  modelVersion: string;
  configHash: string;
  inputEnvelopeHash: string;
  purpose: string;
  outputProfile: string;
  attempt: number;
  predecessorRunId: string | null;
}): string {
  return candidateAnalysisSha256("run-idempotency", {
    workflow: {
      id: run.workflowId,
      version: run.workflowVersion,
      path: run.workflowPath,
      hash: run.workflowHash,
    },
    prompt: {
      id: run.promptId,
      version: run.promptVersion,
      path: run.promptPath,
      hash: run.promptHash,
    },
    model: {
      provider: run.modelProvider,
      name: run.modelName,
      version: run.modelVersion,
    },
    configHash: run.configHash,
    inputEnvelopeHash: run.inputEnvelopeHash,
    purpose: run.purpose,
    outputProfile: run.outputProfile,
    attempt: run.attempt,
    predecessorRunId: run.predecessorRunId,
  });
}

export function candidateAnalysisRunScopeHash(runId: string): string {
  return candidateAnalysisSha256("run-scope", { runId });
}

export function candidateAnalysisRunEventHash(event: {
  id: string;
  runId: string;
  sequence: number;
  eventType: CandidateRunEventType;
  payload: CandidateJsonValue | null;
  supersededEventId?: string | null;
  supersededEventHash?: string | null;
  supersessionScopeHash?: string | null;
}): string {
  return candidateAnalysisSha256("run-event", {
    id: event.id,
    runId: event.runId,
    sequence: event.sequence,
    eventType: event.eventType,
    payload: event.payload,
    supersededEventId: event.supersededEventId ?? null,
    supersededEventHash: event.supersededEventHash ?? null,
    supersessionScopeHash: event.supersessionScopeHash ?? null,
  });
}

export function candidateAnalysisArtifactPayloadHash(
  payload: z.infer<typeof CandidateArtifactPayloadSchema>,
): string {
  return candidateAnalysisSha256("artifact-payload", payload);
}

export function candidateAnalysisAssertionPayloadHash(
  payload: z.infer<typeof CandidateAssertionPayloadSchema>,
): string {
  return candidateAnalysisSha256("assertion-payload", payload);
}

export function candidateAnalysisAssertionScopeHash(scopeKey: string): string {
  return candidateAnalysisSha256("assertion-scope", { scopeKey });
}

export function candidateAnalysisEvidenceLocatorHash(locator: string): string {
  return candidateAnalysisSha256("evidence-locator", { locator });
}

export function candidateAnalysisReconciliationScopeHash(
  scope: CandidateJsonValue,
): string {
  return candidateAnalysisSha256("reconciliation-scope", scope);
}

export function candidateAnalysisReconciliationPayloadHash(
  payload: z.infer<typeof CandidateReconciliationPayloadSchema>,
): string {
  return candidateAnalysisSha256("reconciliation-payload", payload);
}

export function candidateAnalysisOutputManifestHash(
  manifest: CandidateOutputManifest,
): string {
  return candidateAnalysisSha256("output-manifest", manifest);
}

export type CandidateHumanReviewDecisionHashInput = {
  id: string;
  assertionId: string;
  decision: CandidateReviewDecision;
  reviewProfile: string;
  reviewProfileHash: string;
  reviewer: string;
  authority: string;
  assertionPayloadHash: string;
  sourceContentSetHash: string;
  evidenceSetHash: string;
  limitations: readonly string[];
  editedPayloadHash: string | null;
  supersededDecisionId: string | null;
  supersededDecisionHash: string | null;
};

export function candidateAnalysisHumanReviewDecisionHash(
  receipt: CandidateHumanReviewDecisionHashInput,
): string {
  return candidateAnalysisSha256("human-review-decision", {
    id: receipt.id,
    assertionId: receipt.assertionId,
    decision: receipt.decision,
    reviewProfile: receipt.reviewProfile,
    reviewProfileHash: receipt.reviewProfileHash,
    reviewer: receipt.reviewer,
    authority: receipt.authority,
    assertionPayloadHash: receipt.assertionPayloadHash,
    sourceContentSetHash: receipt.sourceContentSetHash,
    evidenceSetHash: receipt.evidenceSetHash,
    limitations: [...receipt.limitations],
    editedPayloadHash: receipt.editedPayloadHash,
    supersededDecisionId: receipt.supersededDecisionId,
    supersededDecisionHash: receipt.supersededDecisionHash,
  });
}

export type CandidatePromotionDecisionHashInput = {
  id: string;
  assertionId: string;
  assertionPayloadHash: string;
  reviewDecisionId: string;
  reviewDecisionHash: string;
  targetProfile: string;
  targetProfileHash: string;
  state: CandidatePromotionState;
  policyVersion: string;
  policyHash: string;
  preconditionsHash: string;
  targetSetHash: string;
  resultHash: string;
  operator: string;
  authority: string;
  supersededDecisionId: string | null;
  supersededDecisionHash: string | null;
  supersededPolicyHash: string | null;
};

export function candidateAnalysisPromotionDecisionHash(
  receipt: CandidatePromotionDecisionHashInput,
): string {
  return candidateAnalysisSha256("promotion-decision", {
    id: receipt.id,
    assertionId: receipt.assertionId,
    assertionPayloadHash: receipt.assertionPayloadHash,
    reviewDecisionId: receipt.reviewDecisionId,
    reviewDecisionHash: receipt.reviewDecisionHash,
    targetProfile: receipt.targetProfile,
    targetProfileHash: receipt.targetProfileHash,
    state: receipt.state,
    policyVersion: receipt.policyVersion,
    policyHash: receipt.policyHash,
    preconditionsHash: receipt.preconditionsHash,
    targetSetHash: receipt.targetSetHash,
    resultHash: receipt.resultHash,
    operator: receipt.operator,
    authority: receipt.authority,
    supersededDecisionId: receipt.supersededDecisionId,
    supersededDecisionHash: receipt.supersededDecisionHash,
    supersededPolicyHash: receipt.supersededPolicyHash,
  });
}

const terminalMachineStates = new Set<CandidateAnalysisMachineState>([
  "candidate_complete",
  "partial",
  "failed",
  "blocked_input",
  "quarantined",
  "superseded",
]);

function invalidTransition(): never {
  throw new CandidateAnalysisContractError("invalid_event_transition");
}

export function deriveCandidateAnalysisMachineState(
  events: CandidateAnalysisRunEventInput[],
): CandidateAnalysisMachineState {
  if (events.length === 0) {
    throw new CandidateAnalysisContractError("invalid_initial_event");
  }

  const validatedEvents = events.map((event) =>
    CandidateAnalysisRunEventInputSchema.parse(event),
  );
  let terminalEventType: CandidateRunEventType | null = null;
  for (const [index, event] of validatedEvents.entries()) {
    if (terminalEventType !== null) {
      const isAllowedSupersession =
        event.eventType === "superseded" &&
        (terminalEventType === "candidate_completed" ||
          terminalEventType === "partial_completed");
      if (!isAllowedSupersession) {
        throw new CandidateAnalysisContractError("event_after_terminal_state");
      }
      const prior = validatedEvents[index - 1];
      if (
        prior === undefined ||
        event.supersededEventId !== prior.id ||
        event.supersededEventHash !== prior.eventHash ||
        event.runId !== prior.runId
      ) {
        throw new CandidateAnalysisContractError("invalid_event_supersession");
      }
      terminalEventType = "superseded";
      continue;
    }
    if (
      event.eventType === "candidate_completed" ||
      event.eventType === "partial_completed" ||
      event.eventType === "failed" ||
      event.eventType === "blocked_input" ||
      event.eventType === "quarantined" ||
      event.eventType === "superseded"
    ) {
      terminalEventType = event.eventType;
    }
  }

  let state: CandidateAnalysisMachineState | null = null;

  for (const [index, event] of validatedEvents.entries()) {
    if (event.sequence !== index + 1) {
      throw new CandidateAnalysisContractError("event_sequence_gap");
    }
    if (index === 0 && event.eventType !== "queued") {
      throw new CandidateAnalysisContractError("invalid_initial_event");
    }
    if (state !== null && terminalMachineStates.has(state)) {
      if (
        event.eventType === "superseded" &&
        (state === "candidate_complete" || state === "partial")
      ) {
        state = "superseded";
        continue;
      }
      throw new CandidateAnalysisContractError("event_after_terminal_state");
    }

    if (state === null) {
      state = "queued";
      continue;
    }

    if (state === "queued") {
      if (event.eventType === "started") {
        state = "running";
        continue;
      }
      if (event.eventType === "failed") {
        state = "failed";
        continue;
      }
      if (event.eventType === "blocked_input") {
        state = "blocked_input";
        continue;
      }
      if (event.eventType === "quarantined") {
        state = "quarantined";
        continue;
      }
      invalidTransition();
    }

    if (state === "running") {
      if (event.eventType === "checkpoint") continue;
      if (event.eventType === "candidate_completed") {
        state = "candidate_complete";
        continue;
      }
      if (event.eventType === "partial_completed") {
        state = "partial";
        continue;
      }
      if (event.eventType === "failed") {
        state = "failed";
        continue;
      }
      if (event.eventType === "blocked_input") {
        state = "blocked_input";
        continue;
      }
      if (event.eventType === "quarantined") {
        state = "quarantined";
        continue;
      }
      invalidTransition();
    }

    throw new CandidateAnalysisContractError("event_after_terminal_state");
  }

  if (state === null) {
    throw new CandidateAnalysisContractError("invalid_initial_event");
  }
  return state;
}
