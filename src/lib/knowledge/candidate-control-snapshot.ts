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
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

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
const isoInstantSchema = z
  .string()
  .regex(ISO_INSTANT_PATTERN)
  .refine((value) => Number.isFinite(Date.parse(value)), "invalid_iso_instant");

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
    targetProfile: nonEmptyTextSchema,
    policyVersion: nonEmptyTextSchema,
    preconditionsHash: hashSchema,
  })
  .strict();

const CandidateControlPromotionDecisionSchema = z
  .object({
    id: nonEmptyTextSchema,
    assertionId: nonEmptyTextSchema,
    reviewDecisionId: nonEmptyTextSchema,
    targetProfile: nonEmptyTextSchema,
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
    externalTargetProfile: nonEmptyTextSchema,
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
        externalTargetProfile: nonEmptyTextSchema,
        externalBlockers: z.array(nonEmptyTextSchema),
        byTargetProfile: z.record(nonEmptyTextSchema, promotionCountsSchema),
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

export function buildCandidateControlSnapshot(
  rawInput: CandidateControlSnapshotInput,
): CandidateControlSnapshot {
  const input = CandidateControlSnapshotInputSchema.parse(rawInput);
  const warnings = new Set<string>();
  const queryErrors = sortedUnique(input.provenance.queryErrors);
  const externalBlockers = sortedUnique(input.externalBlockers);
  let operational = queryErrors.length === 0;

  const machineStates = zeroCounts(MACHINE_STATES);
  for (const run of [...input.runs].sort(compareById)) {
    if (
      run.events.some(
        (event, index) =>
          event.runId !== run.id ||
          (index > 0 && event.sequence <= run.events[index - 1]!.sequence),
      )
    ) {
      operational = false;
      warnings.add(`invalid_machine_event_order_or_binding:${run.id}`);
      continue;
    }
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
    const assertion = currentAssertions.find(
      (candidate) => candidate.id === decision.assertionId,
    )!;
    const binding = reviewBindingMap.get(
      reviewBindingKey(decision.assertionId, decision.reviewProfile),
    );
    if (
      binding === undefined ||
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
    const key = `${decision.assertionId}\u0000${decision.targetProfile}`;
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
    if (
      current === undefined ||
      snapshot.createdAt > current.createdAt ||
      (snapshot.createdAt === current.createdAt && snapshot.id > current.id)
    ) {
      latestReconciliations.set(snapshot.scopeHash, snapshot);
    }
  }

  const oldestPendingAt = pendingAssertions
    .map((assertion) => assertion.createdAt)
    .sort()[0] ?? null;
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
  return `${assertionId}:${reviewProfile}`;
}

function promotionBindingKey(
  assertionId: string,
  reviewDecisionId: string,
  targetProfile: string,
): string {
  return `${assertionId}:${reviewDecisionId}:${targetProfile}`;
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
