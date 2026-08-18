import { z } from "zod";

import {
  CANDIDATE_EVIDENCE_LEVELS,
  CANDIDATE_IDENTITY_CONFIDENCE,
  CANDIDATE_MACHINE_USES,
  CANDIDATE_PROMOTION_STATES,
  CandidateAnalysisRunEventInputSchema,
  deriveCandidateAnalysisMachineState,
  type CandidateAnalysisMachineState,
  type CandidateEvidenceLevel,
  type CandidateIdentityConfidence,
  type CandidateMachineUse,
  type CandidatePromotionState,
} from "./candidate-analysis-contract";
import {
  summarizeLegacyLibraryCandidateProjection,
  type LegacyLibraryAnalysisRecordInput,
} from "./library-analysis-candidate-compat";

export const CANDIDATE_CONTROL_SNAPSHOT_SCHEMA_VERSION =
  "candidate-control-snapshot-v1" as const;

const HASH_PATTERN = /^[a-f0-9]{64}$/;
const COMMIT_PATTERN = /^[a-f0-9]{40}$/;
const UUID_PATTERN =
  /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const ISO_INSTANT_PATTERN =
  /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{3})?Z$/;
const TARGET_PROFILE_PATTERN = /^[^\u0000-\u001f\u007f]+$/;

const MACHINE_STATES = [
  "queued",
  "running",
  "candidate_complete",
  "partial",
  "failed",
  "blocked_input",
  "quarantined",
  "superseded",
] as const satisfies readonly CandidateAnalysisMachineState[];
const REVIEW_STATES = [
  "not_requested",
  "queued",
  "in_review",
  "accepted",
  "accepted_with_edits",
  "rejected",
  "deferred",
] as const;
const TERMINAL_REVIEW_STATES = new Set<CandidateReviewState>([
  "accepted",
  "accepted_with_edits",
  "rejected",
  "deferred",
]);

export type CandidateReviewState = (typeof REVIEW_STATES)[number];

export type CandidateControlSnapshot = {
  schemaVersion: typeof CANDIDATE_CONTROL_SNAPSHOT_SCHEMA_VERSION;
  generatedAt: string;
  provenance: {
    sourceCommit: string;
    runtimeCommit: string | null;
    databaseIdentityUuid: string;
    counterBasis: "current_unsuperseded_records";
    queryErrors: string[];
  };
  operational: boolean;
  machine: {
    runsTotal: number;
    currentByState: Record<CandidateAnalysisMachineState, number>;
    assertionsTotal: number;
    byMachineUse: Record<CandidateMachineUse, number>;
  };
  identity: {
    byConfidence: Record<CandidateIdentityConfidence, number>;
  };
  evidence: {
    byLevel: Record<CandidateEvidenceLevel, number>;
  };
  review: {
    currentByState: Record<CandidateReviewState, number>;
    backlogTotal: number;
    oldestPendingAt: string | null;
    oldestPendingAgeSeconds: number | null;
    reviewComplete: boolean;
    pendingIsExpectedWork: true;
  };
  promotion: {
    externalTargetProfile: string;
    externalBlockers: string[];
    byTargetProfile: Record<
      string,
      Record<CandidatePromotionState, number>
    >;
    externalReady: boolean;
  };
  reconciliation: {
    snapshotsTotal: number;
    conflictsTotal: number;
  };
  legacy: {
    recordsTotal: number;
    projectedCandidates: number;
    analysisAbsent: number;
    unclassifiedHumanSignals: number;
  };
  warnings: string[];
};

const hashSchema = z.string().regex(HASH_PATTERN);
const nonEmptyTextSchema = z.string().min(1);
const targetProfileSchema = z.string().regex(TARGET_PROFILE_PATTERN);
const isoInstantSchema = z
  .string()
  .regex(ISO_INSTANT_PATTERN)
  .refine(isSemanticIsoInstant, "invalid_iso_instant");

const CandidateControlRunSchema = z
  .object({
    id: nonEmptyTextSchema,
    events: z.array(CandidateAnalysisRunEventInputSchema),
  })
  .strict();

const CandidateControlAssertionSchema = z
  .object({
    id: nonEmptyTextSchema,
    runId: nonEmptyTextSchema,
    payloadHash: hashSchema,
    machineUse: z.enum(CANDIDATE_MACHINE_USES),
    identityConfidence: z.enum(CANDIDATE_IDENTITY_CONFIDENCE),
    evidenceLevel: z.enum(CANDIDATE_EVIDENCE_LEVELS),
    supersededAssertionId: nonEmptyTextSchema.nullable(),
    createdAt: isoInstantSchema,
  })
  .strict();

const CurrentReviewBindingSchema = z
  .object({
    assertionId: nonEmptyTextSchema,
    reviewProfile: nonEmptyTextSchema,
    assertionPayloadHash: hashSchema,
    sourceContentSetHash: hashSchema,
    evidenceSetHash: hashSchema,
    reviewProfileHash: hashSchema,
  })
  .strict();

const CandidateControlReviewDecisionSchema = z
  .object({
    id: nonEmptyTextSchema,
    assertionId: nonEmptyTextSchema,
    decision: z.enum([
      "accepted",
      "accepted_with_edits",
      "rejected",
      "deferred",
      "rerun_requested",
    ]),
    reviewProfile: nonEmptyTextSchema,
    reviewProfileHash: hashSchema,
    assertionPayloadHash: hashSchema,
    sourceContentSetHash: hashSchema,
    evidenceSetHash: hashSchema,
    supersededDecisionId: nonEmptyTextSchema.nullable(),
    createdAt: isoInstantSchema,
  })
  .strict();

const CurrentPromotionBindingSchema = z
  .object({
    assertionId: nonEmptyTextSchema,
    reviewDecisionId: nonEmptyTextSchema,
    targetProfile: targetProfileSchema,
    policyVersion: nonEmptyTextSchema,
    preconditionsHash: hashSchema,
  })
  .strict();

const CandidateControlPromotionDecisionSchema = z
  .object({
    id: nonEmptyTextSchema,
    assertionId: nonEmptyTextSchema,
    reviewDecisionId: nonEmptyTextSchema,
    targetProfile: targetProfileSchema,
    state: z.enum(CANDIDATE_PROMOTION_STATES),
    policyVersion: nonEmptyTextSchema,
    preconditionsHash: hashSchema,
    supersededDecisionId: nonEmptyTextSchema.nullable(),
    createdAt: isoInstantSchema,
  })
  .strict();

const CandidateControlReconciliationSnapshotSchema = z
  .object({
    id: nonEmptyTextSchema,
    scopeHash: hashSchema,
    payloadHash: hashSchema,
    conflictCount: z.number().int().nonnegative(),
    createdAt: isoInstantSchema,
  })
  .strict();

const LegacyLibraryAnalysisRecordInputSchema: z.ZodType<LegacyLibraryAnalysisRecordInput> =
  z
    .object({
      sourceKind: z.string(),
      sourceKey: z.string(),
      documentId: z.string().nullable().optional(),
      sourceDocId: z.string().nullable().optional(),
      status: z.string(),
      usageRule: z.string(),
      reviewStatus: z.string().nullable().optional(),
      aiCard: z.unknown(),
      claimCandidates: z.unknown().optional(),
      contentHash: z.string().nullable().optional(),
      reviewedAt: z.union([z.date(), z.string()]).nullable().optional(),
      reviewer: z.string().nullable().optional(),
    })
    .strict();

export const CandidateControlSnapshotInputSchema = z
  .object({
    generatedAt: isoInstantSchema,
    provenance: z
      .object({
        sourceCommit: z.string().regex(COMMIT_PATTERN),
        runtimeCommit: z.string().regex(COMMIT_PATTERN).nullable(),
        databaseIdentityUuid: z.string().regex(UUID_PATTERN),
        queryErrors: z.array(nonEmptyTextSchema),
      })
      .strict(),
    externalTargetProfile: targetProfileSchema,
    externalBlockers: z.array(nonEmptyTextSchema),
    runs: z.array(CandidateControlRunSchema),
    assertions: z.array(CandidateControlAssertionSchema),
    currentReviewBindings: z.array(CurrentReviewBindingSchema),
    reviewDecisions: z.array(CandidateControlReviewDecisionSchema),
    currentPromotionBindings: z.array(CurrentPromotionBindingSchema),
    promotionDecisions: z.array(CandidateControlPromotionDecisionSchema),
    reconciliationSnapshots: z.array(
      CandidateControlReconciliationSnapshotSchema,
    ),
    legacyRows: z.array(LegacyLibraryAnalysisRecordInputSchema),
  })
  .strict();

export type CandidateControlSnapshotInput = z.infer<
  typeof CandidateControlSnapshotInputSchema
>;

const nonnegativeIntegerSchema = z.number().int().nonnegative();
const machineStateCountsSchema = exactCounterObject(MACHINE_STATES);
const machineUseCountsSchema = exactCounterObject(CANDIDATE_MACHINE_USES);
const identityCountsSchema = exactCounterObject(CANDIDATE_IDENTITY_CONFIDENCE);
const evidenceCountsSchema = exactCounterObject(CANDIDATE_EVIDENCE_LEVELS);
const reviewCountsSchema = exactCounterObject(REVIEW_STATES);
const promotionCountsSchema = exactCounterObject(CANDIDATE_PROMOTION_STATES);

export const CandidateControlSnapshotSchema = z
  .object({
    schemaVersion: z.literal(CANDIDATE_CONTROL_SNAPSHOT_SCHEMA_VERSION),
    generatedAt: isoInstantSchema,
    provenance: z
      .object({
        sourceCommit: z.string().regex(COMMIT_PATTERN),
        runtimeCommit: z.string().regex(COMMIT_PATTERN).nullable(),
        databaseIdentityUuid: z.string().regex(UUID_PATTERN),
        counterBasis: z.literal("current_unsuperseded_records"),
        queryErrors: z.array(nonEmptyTextSchema),
      })
      .strict(),
    operational: z.boolean(),
    machine: z
      .object({
        runsTotal: nonnegativeIntegerSchema,
        currentByState: machineStateCountsSchema,
        assertionsTotal: nonnegativeIntegerSchema,
        byMachineUse: machineUseCountsSchema,
      })
      .strict(),
    identity: z.object({ byConfidence: identityCountsSchema }).strict(),
    evidence: z.object({ byLevel: evidenceCountsSchema }).strict(),
    review: z
      .object({
        currentByState: reviewCountsSchema,
        backlogTotal: nonnegativeIntegerSchema,
        oldestPendingAt: isoInstantSchema.nullable(),
        oldestPendingAgeSeconds: nonnegativeIntegerSchema.nullable(),
        reviewComplete: z.boolean(),
        pendingIsExpectedWork: z.literal(true),
      })
      .strict(),
    promotion: z
      .object({
        externalTargetProfile: targetProfileSchema,
        externalBlockers: z.array(nonEmptyTextSchema),
        byTargetProfile: z.record(targetProfileSchema, promotionCountsSchema),
        externalReady: z.boolean(),
      })
      .strict(),
    reconciliation: z
      .object({
        snapshotsTotal: nonnegativeIntegerSchema,
        conflictsTotal: nonnegativeIntegerSchema,
      })
      .strict(),
    legacy: z
      .object({
        recordsTotal: nonnegativeIntegerSchema,
        projectedCandidates: nonnegativeIntegerSchema,
        analysisAbsent: nonnegativeIntegerSchema,
        unclassifiedHumanSignals: nonnegativeIntegerSchema,
      })
      .strict(),
    warnings: z.array(nonEmptyTextSchema),
  })
  .strict();

export type CandidateControlSnapshotValidation =
  | { ok: true; value: CandidateControlSnapshot }
  | { ok: false; errors: string[] };

export function validateCandidateControlSnapshot(
  value: unknown,
): CandidateControlSnapshotValidation {
  const result = CandidateControlSnapshotSchema.safeParse(value);
  if (result.success) {
    return { ok: true, value: result.data as CandidateControlSnapshot };
  }
  return {
    ok: false,
    errors: result.error.issues
      .map((issue) => `${issue.path.join(".") || "$"}:${issue.message}`)
      .sort(),
  };
}

export type CandidateControlSnapshotContractErrorCode =
  | "candidate_control_input_schema_invalid"
  | "duplicate_run_id"
  | "duplicate_run_event_id"
  | "duplicate_run_event_sequence"
  | "duplicate_run_event_hash"
  | "run_event_binding_mismatch"
  | "run_event_order_invalid"
  | "duplicate_assertion_id"
  | "duplicate_assertion_run_payload_hash"
  | "assertion_run_missing"
  | "assertion_self_supersession"
  | "assertion_supersession_target_missing"
  | "assertion_supersession_cycle"
  | "duplicate_review_decision_id"
  | "review_assertion_missing"
  | "review_self_supersession"
  | "review_supersession_target_missing"
  | "review_supersession_cycle"
  | "review_supersession_scope_mismatch"
  | "duplicate_promotion_decision_id"
  | "promotion_assertion_missing"
  | "promotion_review_decision_missing"
  | "promotion_review_assertion_mismatch"
  | "promotion_self_supersession"
  | "promotion_supersession_target_missing"
  | "promotion_supersession_cycle"
  | "promotion_supersession_scope_mismatch"
  | "duplicate_current_review_binding"
  | "review_binding_assertion_missing"
  | "review_binding_assertion_not_current"
  | "duplicate_current_promotion_binding"
  | "promotion_binding_assertion_missing"
  | "promotion_binding_assertion_not_current"
  | "promotion_binding_review_decision_missing"
  | "promotion_binding_review_assertion_mismatch"
  | "promotion_binding_review_not_current"
  | "duplicate_reconciliation_snapshot_id";

export class CandidateControlSnapshotContractError extends Error {
  readonly code: CandidateControlSnapshotContractErrorCode;

  constructor(code: CandidateControlSnapshotContractErrorCode) {
    super(code);
    this.name = "CandidateControlSnapshotContractError";
    this.code = code;
  }
}

export function buildCandidateControlSnapshot(
  rawInput: CandidateControlSnapshotInput,
): CandidateControlSnapshot {
  const parsedInput = CandidateControlSnapshotInputSchema.safeParse(rawInput);
  if (!parsedInput.success) {
    throw new CandidateControlSnapshotContractError(
      "candidate_control_input_schema_invalid",
    );
  }
  const input = parsedInput.data;
  const queryErrors = sortedUnique(input.provenance.queryErrors);
  const referenceGaps = validateCandidateControlSnapshotInputGraph(input);
  const firstUnattributableGap = referenceGaps.find(
    (code) => !isPartialQueryReferenceGap(code, queryErrors, input),
  );
  if (firstUnattributableGap !== undefined) {
    throwSnapshotContract(firstUnattributableGap);
  }
  if (referenceGaps.length > 0) {
    return buildDegradedCandidateControlSnapshot(input, queryErrors);
  }
  const warnings = new Set<string>();
  const externalBlockers = sortedUnique(input.externalBlockers);
  let operational = queryErrors.length === 0;

  const machineStates = zeroCounts(MACHINE_STATES);
  for (const run of [...input.runs].sort(compareById)) {
    try {
      const state = deriveCandidateAnalysisMachineState(run.events);
      machineStates[state] += 1;
    } catch (error) {
      operational = false;
      warnings.add(
        `invalid_machine_event_history:${run.id}:${stableErrorCode(error)}`,
      );
    }
  }

  const supersededAssertionIds = new Set(
    input.assertions.flatMap((assertion) =>
      assertion.supersededAssertionId === null
        ? []
        : [assertion.supersededAssertionId],
    ),
  );
  const currentAssertions = [...input.assertions]
    .filter((assertion) => !supersededAssertionIds.has(assertion.id))
    .sort(compareById);
  const currentAssertionIds = new Set(
    currentAssertions.map((assertion) => assertion.id),
  );
  const currentAssertionsById = new Map(
    currentAssertions.map((assertion) => [assertion.id, assertion]),
  );

  const machineUses = zeroCounts(CANDIDATE_MACHINE_USES);
  const identity = zeroCounts(CANDIDATE_IDENTITY_CONFIDENCE);
  const evidence = zeroCounts(CANDIDATE_EVIDENCE_LEVELS);
  for (const assertion of currentAssertions) {
    machineUses[assertion.machineUse] += 1;
    identity[assertion.identityConfidence] += 1;
    evidence[assertion.evidenceLevel] += 1;
  }

  const reviewBindingMap = uniqueMap(
    input.currentReviewBindings,
    (binding) => reviewBindingKey(binding.assertionId, binding.reviewProfile),
    (key) => {
      operational = false;
      warnings.add(`duplicate_current_review_binding:${key}`);
    },
  );
  const promotionBindingMap = uniqueMap(
    input.currentPromotionBindings,
    (binding) =>
      promotionBindingKey(
        binding.assertionId,
        binding.reviewDecisionId,
        binding.targetProfile,
      ),
    (key) => {
      operational = false;
      warnings.add(`duplicate_current_promotion_binding:${key}`);
    },
  );

  const supersededReviewDecisionIds = new Set(
    input.reviewDecisions.flatMap((decision) =>
      decision.supersededDecisionId === null
        ? []
        : [decision.supersededDecisionId],
    ),
  );
  const validReviewsByAssertion = new Map<
    string,
    (typeof input.reviewDecisions)[number][]
  >();
  for (const decision of [...input.reviewDecisions].sort(compareById)) {
    if (supersededReviewDecisionIds.has(decision.id)) continue;
    if (!currentAssertionIds.has(decision.assertionId)) continue;
    const assertion = currentAssertionsById.get(decision.assertionId)!;
    const binding = reviewBindingMap.get(
      reviewBindingKey(decision.assertionId, decision.reviewProfile),
    );
    if (
      binding === undefined ||
      binding.assertionId !== decision.assertionId ||
      binding.reviewProfile !== decision.reviewProfile ||
      binding.assertionPayloadHash !== assertion.payloadHash ||
      decision.assertionPayloadHash !== binding.assertionPayloadHash ||
      decision.sourceContentSetHash !== binding.sourceContentSetHash ||
      decision.evidenceSetHash !== binding.evidenceSetHash ||
      decision.reviewProfileHash !== binding.reviewProfileHash
    ) {
      warnings.add(`stale_review_decision:${decision.id}`);
      continue;
    }
    const valid = validReviewsByAssertion.get(decision.assertionId) ?? [];
    valid.push(decision);
    validReviewsByAssertion.set(decision.assertionId, valid);
  }

  const reviewStates = zeroCounts(REVIEW_STATES);
  const authoritativeReviewsById = new Map<
    string,
    (typeof input.reviewDecisions)[number]
  >();
  const pendingAssertions: (typeof currentAssertions)[number][] = [];
  for (const assertion of currentAssertions) {
    const valid = validReviewsByAssertion.get(assertion.id) ?? [];
    let state: CandidateReviewState;
    if (valid.length === 0) {
      state = "not_requested";
    } else if (valid.length > 1) {
      warnings.add(`ambiguous_current_review_decisions:${assertion.id}`);
      state = "not_requested";
    } else {
      const decision = valid[0]!;
      authoritativeReviewsById.set(decision.id, decision);
      state =
        decision.decision === "rerun_requested"
          ? "queued"
          : decision.decision;
    }
    reviewStates[state] += 1;
    if (!TERMINAL_REVIEW_STATES.has(state)) pendingAssertions.push(assertion);
  }

  const targetProfiles = sortedUnique([
    input.externalTargetProfile,
    ...input.currentPromotionBindings.map((binding) => binding.targetProfile),
    ...input.promotionDecisions.map((decision) => decision.targetProfile),
  ]);
  const promotionByTarget: CandidateControlSnapshot["promotion"]["byTargetProfile"] =
    Object.fromEntries(
      targetProfiles.map((profile) => [
        profile,
        {
          ...zeroCounts(CANDIDATE_PROMOTION_STATES),
          candidate: currentAssertions.length,
        },
      ]),
    );

  const supersededPromotionDecisionIds = new Set(
    input.promotionDecisions.flatMap((decision) =>
      decision.supersededDecisionId === null
        ? []
        : [decision.supersededDecisionId],
    ),
  );
  const promotionCandidatesByKey = new Map<
    string,
    (typeof input.promotionDecisions)[number][]
  >();
  for (const decision of [...input.promotionDecisions].sort(compareById)) {
    if (supersededPromotionDecisionIds.has(decision.id)) continue;
    if (!currentAssertionIds.has(decision.assertionId)) continue;
    const key = tupleKey(decision.assertionId, decision.targetProfile);
    const decisions = promotionCandidatesByKey.get(key) ?? [];
    decisions.push(decision);
    promotionCandidatesByKey.set(key, decisions);
  }

  let hasEligibleExternalPromotion = false;
  for (const [key, decisions] of [...promotionCandidatesByKey].sort(([left], [right]) =>
    left.localeCompare(right),
  )) {
    if (decisions.length !== 1) {
      warnings.add(`ambiguous_current_promotion_decisions:${key}`);
      continue;
    }
    const decision = decisions[0]!;
    const binding = promotionBindingMap.get(
      promotionBindingKey(
        decision.assertionId,
        decision.reviewDecisionId,
        decision.targetProfile,
      ),
    );
    const reviewDecision = authoritativeReviewsById.get(
      decision.reviewDecisionId,
    );
    if (
      binding === undefined ||
      binding.assertionId !== decision.assertionId ||
      binding.reviewDecisionId !== decision.reviewDecisionId ||
      binding.targetProfile !== decision.targetProfile ||
      binding.policyVersion !== decision.policyVersion ||
      binding.preconditionsHash !== decision.preconditionsHash ||
      reviewDecision === undefined ||
      reviewDecision.assertionId !== decision.assertionId
    ) {
      warnings.add(`stale_promotion_decision:${decision.id}`);
      continue;
    }

    const counts = promotionByTarget[decision.targetProfile]!;
    counts.candidate -= 1;
    counts[decision.state] += 1;
    if (
      decision.targetProfile === input.externalTargetProfile &&
      (decision.state === "external_eligible" ||
        decision.state === "published") &&
      (reviewDecision.decision === "accepted" ||
        reviewDecision.decision === "accepted_with_edits")
    ) {
      hasEligibleExternalPromotion = true;
    }
  }

  const latestReconciliations = new Map<
    string,
    (typeof input.reconciliationSnapshots)[number]
  >();
  for (const snapshot of input.reconciliationSnapshots) {
    const current = latestReconciliations.get(snapshot.scopeHash);
    const snapshotEpoch = instantEpoch(snapshot.createdAt);
    const currentEpoch =
      current === undefined ? Number.NEGATIVE_INFINITY : instantEpoch(current.createdAt);
    if (
      current === undefined ||
      snapshotEpoch > currentEpoch ||
      (snapshotEpoch === currentEpoch && snapshot.id > current.id)
    ) {
      latestReconciliations.set(snapshot.scopeHash, snapshot);
    }
  }

  const oldestPendingAt = [...pendingAssertions]
    .sort(
      (left, right) =>
        instantEpoch(left.createdAt) - instantEpoch(right.createdAt) ||
        left.id.localeCompare(right.id),
    )[0]?.createdAt ?? null;
  const oldestPendingAgeSeconds =
    oldestPendingAt === null
      ? null
      : Math.max(
          0,
          Math.floor(
            (Date.parse(input.generatedAt) - Date.parse(oldestPendingAt)) / 1000,
          ),
        );
  const legacy = summarizeLegacyLibraryCandidateProjection(input.legacyRows);

  const result: CandidateControlSnapshot = {
    schemaVersion: CANDIDATE_CONTROL_SNAPSHOT_SCHEMA_VERSION,
    generatedAt: input.generatedAt,
    provenance: {
      sourceCommit: input.provenance.sourceCommit,
      runtimeCommit: input.provenance.runtimeCommit,
      databaseIdentityUuid: input.provenance.databaseIdentityUuid,
      counterBasis: "current_unsuperseded_records",
      queryErrors,
    },
    operational,
    machine: {
      runsTotal: input.runs.length,
      currentByState: machineStates,
      assertionsTotal: currentAssertions.length,
      byMachineUse: machineUses,
    },
    identity: { byConfidence: identity },
    evidence: { byLevel: evidence },
    review: {
      currentByState: reviewStates,
      backlogTotal: pendingAssertions.length,
      oldestPendingAt,
      oldestPendingAgeSeconds,
      reviewComplete: pendingAssertions.length === 0,
      pendingIsExpectedWork: true,
    },
    promotion: {
      externalTargetProfile: input.externalTargetProfile,
      externalBlockers,
      byTargetProfile: promotionByTarget,
      externalReady:
        hasEligibleExternalPromotion &&
        operational &&
        queryErrors.length === 0 &&
        externalBlockers.length === 0,
    },
    reconciliation: {
      snapshotsTotal: latestReconciliations.size,
      conflictsTotal: [...latestReconciliations.values()].reduce(
        (total, snapshot) => total + snapshot.conflictCount,
        0,
      ),
    },
    legacy,
    warnings: [...warnings].sort(),
  };

  return CandidateControlSnapshotSchema.parse(result) as CandidateControlSnapshot;
}

function isPartialQueryReferenceGap(
  code: CandidateControlSnapshotContractErrorCode,
  queryErrors: readonly string[],
  input: CandidateControlSnapshotInput,
): boolean {
  switch (code) {
    case "assertion_run_missing":
      return (
        input.runs.length === 0 &&
        queryErrors.includes("candidate_runs_query_failed")
      );
    case "review_assertion_missing":
    case "promotion_assertion_missing":
      return (
        input.assertions.length === 0 &&
        queryErrors.includes("candidate_assertions_query_failed")
      );
    case "promotion_review_decision_missing":
      return (
        input.reviewDecisions.length === 0 &&
        queryErrors.includes("candidate_review_decisions_query_failed")
      );
    default:
      return false;
  }
}

function buildDegradedCandidateControlSnapshot(
  input: CandidateControlSnapshotInput,
  queryErrors: string[],
): CandidateControlSnapshot {
  const result: CandidateControlSnapshot = {
    schemaVersion: CANDIDATE_CONTROL_SNAPSHOT_SCHEMA_VERSION,
    generatedAt: input.generatedAt,
    provenance: {
      sourceCommit: input.provenance.sourceCommit,
      runtimeCommit: input.provenance.runtimeCommit,
      databaseIdentityUuid: input.provenance.databaseIdentityUuid,
      counterBasis: "current_unsuperseded_records",
      queryErrors,
    },
    operational: false,
    machine: {
      runsTotal: 0,
      currentByState: zeroCounts(MACHINE_STATES),
      assertionsTotal: 0,
      byMachineUse: zeroCounts(CANDIDATE_MACHINE_USES),
    },
    identity: { byConfidence: zeroCounts(CANDIDATE_IDENTITY_CONFIDENCE) },
    evidence: { byLevel: zeroCounts(CANDIDATE_EVIDENCE_LEVELS) },
    review: {
      currentByState: zeroCounts(REVIEW_STATES),
      backlogTotal: 0,
      oldestPendingAt: null,
      oldestPendingAgeSeconds: null,
      reviewComplete: false,
      pendingIsExpectedWork: true,
    },
    promotion: {
      externalTargetProfile: input.externalTargetProfile,
      externalBlockers: sortedUnique(input.externalBlockers),
      byTargetProfile: {
        [input.externalTargetProfile]: zeroCounts(CANDIDATE_PROMOTION_STATES),
      },
      externalReady: false,
    },
    reconciliation: { snapshotsTotal: 0, conflictsTotal: 0 },
    legacy: {
      recordsTotal: 0,
      projectedCandidates: 0,
      analysisAbsent: 0,
      unclassifiedHumanSignals: 0,
    },
    warnings: ["degraded_snapshot:partial_query_graph_invalid"],
  };

  return CandidateControlSnapshotSchema.parse(result) as CandidateControlSnapshot;
}

function validateCandidateControlSnapshotInputGraph(
  input: CandidateControlSnapshotInput,
): CandidateControlSnapshotContractErrorCode[] {
  const referenceGaps = new Set<CandidateControlSnapshotContractErrorCode>();
  const runsById = uniqueRecordsById(input.runs, "duplicate_run_id");
  const eventIds = new Set<string>();
  for (const run of [...input.runs].sort(compareById)) {
    const sequences = new Set<number>();
    const eventHashes = new Set<string>();
    let previousSequence = 0;
    for (const event of run.events) {
      if (eventIds.has(event.id)) {
        throwSnapshotContract("duplicate_run_event_id");
      }
      eventIds.add(event.id);
      if (event.runId !== run.id) {
        throwSnapshotContract("run_event_binding_mismatch");
      }
      if (sequences.has(event.sequence)) {
        throwSnapshotContract("duplicate_run_event_sequence");
      }
      sequences.add(event.sequence);
      if (eventHashes.has(event.eventHash)) {
        throwSnapshotContract("duplicate_run_event_hash");
      }
      eventHashes.add(event.eventHash);
      if (event.sequence <= previousSequence) {
        throwSnapshotContract("run_event_order_invalid");
      }
      previousSequence = event.sequence;
    }
  }

  const assertionsById = uniqueRecordsById(
    input.assertions,
    "duplicate_assertion_id",
  );
  const assertionRunPayloadKeys = new Set<string>();
  for (const assertion of [...input.assertions].sort(compareById)) {
    const runPayloadKey = tupleKey(assertion.runId, assertion.payloadHash);
    if (assertionRunPayloadKeys.has(runPayloadKey)) {
      throwSnapshotContract("duplicate_assertion_run_payload_hash");
    }
    assertionRunPayloadKeys.add(runPayloadKey);
    if (!runsById.has(assertion.runId)) {
      referenceGaps.add("assertion_run_missing");
    }
    const targetId = assertion.supersededAssertionId;
    if (targetId === null) continue;
    if (targetId === assertion.id) {
      throwSnapshotContract("assertion_self_supersession");
    }
    if (!assertionsById.has(targetId)) {
      referenceGaps.add("assertion_supersession_target_missing");
    }
  }
  if (
    hasSupersessionCycle(
      input.assertions,
      (assertion) => assertion.supersededAssertionId,
    )
  ) {
    throwSnapshotContract("assertion_supersession_cycle");
  }
  const supersededAssertionIds = new Set(
    input.assertions.flatMap((assertion) =>
      assertion.supersededAssertionId === null
        ? []
        : [assertion.supersededAssertionId],
    ),
  );

  const reviewsById = uniqueRecordsById(
    input.reviewDecisions,
    "duplicate_review_decision_id",
  );
  for (const decision of [...input.reviewDecisions].sort(compareById)) {
    if (!assertionsById.has(decision.assertionId)) {
      referenceGaps.add("review_assertion_missing");
    }
    const targetId = decision.supersededDecisionId;
    if (targetId === null) continue;
    if (targetId === decision.id) {
      throwSnapshotContract("review_self_supersession");
    }
    const target = reviewsById.get(targetId);
    if (target === undefined) {
      referenceGaps.add("review_supersession_target_missing");
      continue;
    }
    if (
      target.assertionId !== decision.assertionId ||
      target.reviewProfile !== decision.reviewProfile
    ) {
      throwSnapshotContract("review_supersession_scope_mismatch");
    }
  }
  if (
    hasSupersessionCycle(
      input.reviewDecisions,
      (decision) => decision.supersededDecisionId,
    )
  ) {
    throwSnapshotContract("review_supersession_cycle");
  }
  const supersededReviewIds = new Set(
    input.reviewDecisions.flatMap((decision) =>
      decision.supersededDecisionId === null
        ? []
        : [decision.supersededDecisionId],
    ),
  );

  const promotionsById = uniqueRecordsById(
    input.promotionDecisions,
    "duplicate_promotion_decision_id",
  );
  for (const decision of [...input.promotionDecisions].sort(compareById)) {
    if (!assertionsById.has(decision.assertionId)) {
      referenceGaps.add("promotion_assertion_missing");
    }
    const review = reviewsById.get(decision.reviewDecisionId);
    if (review === undefined) {
      referenceGaps.add("promotion_review_decision_missing");
    } else if (review.assertionId !== decision.assertionId) {
      throwSnapshotContract("promotion_review_assertion_mismatch");
    }
    const targetId = decision.supersededDecisionId;
    if (targetId === null) continue;
    if (targetId === decision.id) {
      throwSnapshotContract("promotion_self_supersession");
    }
    const target = promotionsById.get(targetId);
    if (target === undefined) {
      referenceGaps.add("promotion_supersession_target_missing");
      continue;
    }
    if (
      target.assertionId !== decision.assertionId ||
      target.targetProfile !== decision.targetProfile
    ) {
      throwSnapshotContract("promotion_supersession_scope_mismatch");
    }
  }
  if (
    hasSupersessionCycle(
      input.promotionDecisions,
      (decision) => decision.supersededDecisionId,
    )
  ) {
    throwSnapshotContract("promotion_supersession_cycle");
  }

  const reviewBindingKeys = new Set<string>();
  for (const binding of [...input.currentReviewBindings].sort((left, right) =>
    reviewBindingKey(left.assertionId, left.reviewProfile).localeCompare(
      reviewBindingKey(right.assertionId, right.reviewProfile),
    ),
  )) {
    const key = reviewBindingKey(binding.assertionId, binding.reviewProfile);
    if (reviewBindingKeys.has(key)) {
      throwSnapshotContract("duplicate_current_review_binding");
    }
    reviewBindingKeys.add(key);
    if (!assertionsById.has(binding.assertionId)) {
      referenceGaps.add("review_binding_assertion_missing");
    } else if (supersededAssertionIds.has(binding.assertionId)) {
      throwSnapshotContract("review_binding_assertion_not_current");
    }
  }

  const promotionBindingKeys = new Set<string>();
  for (const binding of [...input.currentPromotionBindings].sort((left, right) =>
    promotionBindingKey(
      left.assertionId,
      left.reviewDecisionId,
      left.targetProfile,
    ).localeCompare(
      promotionBindingKey(
        right.assertionId,
        right.reviewDecisionId,
        right.targetProfile,
      ),
    ),
  )) {
    const key = promotionBindingKey(
      binding.assertionId,
      binding.reviewDecisionId,
      binding.targetProfile,
    );
    if (promotionBindingKeys.has(key)) {
      throwSnapshotContract("duplicate_current_promotion_binding");
    }
    promotionBindingKeys.add(key);
    if (!assertionsById.has(binding.assertionId)) {
      referenceGaps.add("promotion_binding_assertion_missing");
    } else if (supersededAssertionIds.has(binding.assertionId)) {
      throwSnapshotContract("promotion_binding_assertion_not_current");
    }
    const review = reviewsById.get(binding.reviewDecisionId);
    if (review === undefined) {
      referenceGaps.add("promotion_binding_review_decision_missing");
    } else if (review.assertionId !== binding.assertionId) {
      throwSnapshotContract("promotion_binding_review_assertion_mismatch");
    } else if (supersededReviewIds.has(binding.reviewDecisionId)) {
      throwSnapshotContract("promotion_binding_review_not_current");
    }
  }

  uniqueRecordsById(
    input.reconciliationSnapshots,
    "duplicate_reconciliation_snapshot_id",
  );

  const referenceGapPriority: CandidateControlSnapshotContractErrorCode[] = [
    "assertion_supersession_target_missing",
    "review_supersession_target_missing",
    "promotion_supersession_target_missing",
    "review_binding_assertion_missing",
    "promotion_binding_assertion_missing",
    "promotion_binding_review_decision_missing",
    "assertion_run_missing",
    "review_assertion_missing",
    "promotion_assertion_missing",
    "promotion_review_decision_missing",
  ];
  return referenceGapPriority.filter((code) => referenceGaps.has(code));
}

function uniqueRecordsById<T extends { id: string }>(
  records: readonly T[],
  code: CandidateControlSnapshotContractErrorCode,
): Map<string, T> {
  const result = new Map<string, T>();
  for (const record of [...records].sort(compareById)) {
    if (result.has(record.id)) throwSnapshotContract(code);
    result.set(record.id, record);
  }
  return result;
}

function hasSupersessionCycle<T extends { id: string }>(
  records: readonly T[],
  targetOf: (record: T) => string | null,
): boolean {
  const byId = new Map(records.map((record) => [record.id, record]));
  const finalized = new Set<string>();
  for (const start of [...records].sort(compareById)) {
    if (finalized.has(start.id)) continue;
    const path: string[] = [];
    const visitedOnPath = new Set<string>();
    let current: T | undefined = start;
    while (current !== undefined) {
      if (finalized.has(current.id)) break;
      if (visitedOnPath.has(current.id)) return true;
      visitedOnPath.add(current.id);
      path.push(current.id);
      const targetId = targetOf(current);
      current = targetId === null ? undefined : byId.get(targetId);
    }
    for (const id of path) finalized.add(id);
  }
  return false;
}

function throwSnapshotContract(
  code: CandidateControlSnapshotContractErrorCode,
): never {
  throw new CandidateControlSnapshotContractError(code);
}

function isSemanticIsoInstant(value: string): boolean {
  const epoch = Date.parse(value);
  if (!Number.isFinite(epoch)) return false;
  const normalized = value.includes(".")
    ? value
    : value.replace(/Z$/, ".000Z");
  return new Date(epoch).toISOString() === normalized;
}

function instantEpoch(value: string): number {
  return Date.parse(value);
}

function exactCounterObject<const Values extends readonly [string, ...string[]]>(
  values: Values,
) {
  return z
    .object(
      Object.fromEntries(
        values.map((value) => [value, nonnegativeIntegerSchema]),
      ) as Record<Values[number], typeof nonnegativeIntegerSchema>,
    )
    .strict();
}

function zeroCounts<const Value extends string>(
  values: readonly Value[],
): Record<Value, number> {
  return Object.fromEntries(values.map((value) => [value, 0])) as Record<
    Value,
    number
  >;
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function compareById<T extends { id: string }>(left: T, right: T): number {
  return left.id.localeCompare(right.id);
}

function stableErrorCode(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }
  return "invalid_contract";
}

function reviewBindingKey(assertionId: string, reviewProfile: string): string {
  return tupleKey(assertionId, reviewProfile);
}

function promotionBindingKey(
  assertionId: string,
  reviewDecisionId: string,
  targetProfile: string,
): string {
  return tupleKey(assertionId, reviewDecisionId, targetProfile);
}

function tupleKey(...parts: readonly string[]): string {
  return JSON.stringify(parts);
}

function uniqueMap<T>(
  values: readonly T[],
  keyOf: (value: T) => string,
  onDuplicate: (key: string) => void,
): Map<string, T> {
  const result = new Map<string, T>();
  for (const value of values) {
    const key = keyOf(value);
    if (result.has(key)) onDuplicate(key);
    else result.set(key, value);
  }
  return result;
}
