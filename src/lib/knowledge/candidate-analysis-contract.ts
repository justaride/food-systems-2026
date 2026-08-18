import { createHash } from "node:crypto";

import { z } from "zod";

export const CANDIDATE_ANALYSIS_SCHEMA_VERSION = "candidate-analysis-v1" as const;

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
const CandidateJsonValueSchema: z.ZodType<CandidateJsonValue> = z.lazy(() =>
  z.union([
    z.null(),
    z.boolean(),
    z.number(),
    z.string(),
    z.array(CandidateJsonValueSchema),
    z.record(z.string(), CandidateJsonValueSchema),
  ]),
);

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
  .strict();

export const CandidateAnalysisRunContentInputSchema = z
  .object({
    contentUnitId: identifierSchema,
    position: z.number().int().nonnegative(),
    inputHash: hashSchema,
  })
  .strict();

export const CandidateAnalysisRunInputSchema = z
  .object({
    id: identifierSchema,
    workflowId: identifierSchema,
    workflowVersion: nonEmptyTextSchema,
    modelProvider: nonEmptyTextSchema,
    modelName: nonEmptyTextSchema,
    modelVersion: nonEmptyTextSchema,
    promptHash: hashSchema,
    configHash: hashSchema,
    inputEnvelopeHash: hashSchema,
    purpose: nonEmptyTextSchema,
    outputProfile: identifierSchema,
    workerId: identifierSchema,
    idempotencyKey: identifierSchema,
    attempt: z.number().int().positive(),
    predecessorRunId: identifierSchema.nullable(),
    inputs: z.array(CandidateAnalysisRunContentInputSchema).min(1),
  })
  .strict();

export const CandidateAnalysisRunEventInputSchema = z
  .object({
    id: identifierSchema,
    runId: identifierSchema,
    sequence: z.number().int().positive(),
    eventType: z.enum(CANDIDATE_RUN_EVENT_TYPES),
    payload: CandidateJsonValueSchema.nullable(),
    eventHash: hashSchema,
  })
  .strict();

export const CandidateAnalysisArtifactInputSchema = z
  .object({
    id: identifierSchema,
    runId: identifierSchema,
    artifactType: identifierSchema,
    schemaVersion: z.literal(CANDIDATE_ANALYSIS_SCHEMA_VERSION),
    payload: CandidateJsonValueSchema,
    payloadHash: hashSchema,
  })
  .strict();

export const CandidateAssertionInputSchema = z
  .object({
    id: identifierSchema,
    runId: identifierSchema,
    assertionType: z.enum(CANDIDATE_ASSERTION_TYPES),
    schemaVersion: z.literal(CANDIDATE_ANALYSIS_SCHEMA_VERSION),
    payload: CandidateJsonValueSchema,
    payloadHash: hashSchema,
    confidence: z.number().min(0).max(1).nullable(),
    machineUse: z.enum(CANDIDATE_MACHINE_USES),
    identityConfidence: z.enum(CANDIDATE_IDENTITY_CONFIDENCE),
    evidenceLevel: z.enum(CANDIDATE_EVIDENCE_LEVELS),
    limitations: z.array(nonEmptyTextSchema),
    supersededAssertionId: identifierSchema.nullable(),
    promotionState: z.literal("candidate"),
  })
  .strict();

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
  .strict();

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
    scopeHash: hashSchema,
    payload: CandidateJsonValueSchema,
    payloadHash: hashSchema,
    conflictCount: z.number().int().nonnegative(),
  })
  .strict();

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
  | "invalid_event_transition";

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
  for (const event of validatedEvents) {
    if (terminalEventType !== null) {
      const isAllowedSupersession =
        event.eventType === "superseded" &&
        (terminalEventType === "candidate_completed" ||
          terminalEventType === "partial_completed");
      if (!isAllowedSupersession) {
        throw new CandidateAnalysisContractError("event_after_terminal_state");
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
