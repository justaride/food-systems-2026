import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  buildCandidateControlSnapshot,
  validateCandidateControlSnapshot,
  type CandidateControlSnapshotInput,
} from "../../src/lib/knowledge/candidate-control-snapshot";
import {
  parseCandidateControlSnapshotArgs,
  writeCandidateControlSnapshotAtomic,
} from "../../scripts/knowledge/export-candidate-control-snapshot";
import { candidateAnalysisFixture } from "../fixtures/candidate-analysis-fixture";

const HASH_A = "a".repeat(64);
const HASH_B = "b".repeat(64);
const HASH_C = "c".repeat(64);
const HASH_D = "d".repeat(64);
const GENERATED_AT = "2026-08-18T12:00:00.000Z";

const jsonSchema = JSON.parse(
  readFileSync(
    "knowledge/schema/candidate-control-snapshot.schema.v1.json",
    "utf8",
  ),
) as object;
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validateJsonSchema = ajv.compile(jsonSchema);

type FixtureOptions = {
  legacyReviewSignals?: number;
  review?: "none" | "accepted" | "rerun_requested";
  staleReview?: boolean;
  promotion?: "none" | "external_eligible" | "published";
  stalePromotion?: boolean;
  externalBlockers?: string[];
  queryErrors?: string[];
  quarantined?: boolean;
};

function candidateControlFixture(
  options: FixtureOptions = {},
): CandidateControlSnapshotInput {
  const candidate = candidateAnalysisFixture();
  const reviewDecisionId = "review:fixture:1";
  const review = options.review ?? "none";
  const promotion = options.promotion ?? "none";

  return {
    generatedAt: GENERATED_AT,
    provenance: {
      sourceCommit: "1".repeat(40),
      runtimeCommit: null,
      databaseIdentityUuid: "123e4567-e89b-42d3-a456-426614174000",
      queryErrors: options.queryErrors ?? [],
    },
    externalTargetProfile: "external-public-v1",
    externalBlockers: options.externalBlockers ?? [],
    runs: [
      {
        id: candidate.run.id,
        events: options.quarantined
          ? [
              candidate.events.queued,
              candidate.events.started,
              {
                ...candidate.events.completed,
                id: "event:fixture:quarantined",
                sequence: 3,
                eventType: "quarantined",
              },
            ]
          : [
              candidate.events.queued,
              candidate.events.started,
              { ...candidate.events.completed, sequence: 3 },
            ],
      },
    ],
    assertions: [
      {
        id: candidate.assertion.id,
        runId: candidate.run.id,
        payloadHash: candidate.assertion.payloadHash,
        machineUse: options.quarantined
          ? "quarantined"
          : candidate.assertion.machineUse,
        identityConfidence: candidate.assertion.identityConfidence,
        evidenceLevel: candidate.assertion.evidenceLevel,
        supersededAssertionId: null,
        createdAt: "2026-08-18T10:00:00.000Z",
      },
    ],
    currentReviewBindings: [
      {
        assertionId: candidate.assertion.id,
        reviewProfile: "external-review-v1",
        assertionPayloadHash: HASH_A,
        sourceContentSetHash: HASH_B,
        evidenceSetHash: HASH_C,
        reviewProfileHash: HASH_D,
      },
    ],
    reviewDecisions:
      review === "none"
        ? []
        : [
            {
              id: reviewDecisionId,
              assertionId: candidate.assertion.id,
              decision: review,
              reviewProfile: "external-review-v1",
              reviewProfileHash: HASH_D,
              assertionPayloadHash: options.staleReview ? HASH_B : HASH_A,
              sourceContentSetHash: HASH_B,
              evidenceSetHash: HASH_C,
              supersededDecisionId: null,
              createdAt: "2026-08-18T11:00:00.000Z",
            },
          ],
    currentPromotionBindings:
      review === "none"
        ? []
        : [
            {
              assertionId: candidate.assertion.id,
              reviewDecisionId,
              targetProfile: "external-public-v1",
              policyVersion: "policy-v1",
              preconditionsHash: HASH_A,
            },
          ],
    promotionDecisions:
      promotion === "none"
        ? []
        : [
            {
              id: "promotion:fixture:1",
              assertionId: candidate.assertion.id,
              reviewDecisionId,
              targetProfile: "external-public-v1",
              state: promotion,
              policyVersion: "policy-v1",
              preconditionsHash: options.stalePromotion ? HASH_B : HASH_A,
              supersededDecisionId: null,
              createdAt: "2026-08-18T11:30:00.000Z",
            },
          ],
    reconciliationSnapshots: [
      {
        id: "reconciliation:fixture:old",
        scopeHash: HASH_A,
        payloadHash: HASH_B,
        conflictCount: 7,
        createdAt: "2026-08-18T08:00:00.000Z",
      },
      {
        id: "reconciliation:fixture:current",
        scopeHash: HASH_A,
        payloadHash: HASH_C,
        conflictCount: 2,
        createdAt: "2026-08-18T09:00:00.000Z",
      },
    ],
    legacyRows: Array.from(
      { length: options.legacyReviewSignals ?? 0 },
      (_, index) => ({
        sourceKind: "document",
        sourceKey: `document:legacy-${index}`,
        documentId: `legacy-${index}`,
        sourceDocId: null,
        status: "approved_internal",
        usageRule: "safe_for_ai_context",
        reviewStatus: "approved",
        aiCard: { summary: "Legacy candidate" },
        claimCandidates: [],
        contentHash: HASH_A,
        reviewedAt: GENERATED_AT,
        reviewer: "legacy reviewer",
      }),
    ),
  };
}

function mutateAtPath(
  value: unknown,
  path: readonly (string | number)[],
  replacement: unknown,
): unknown {
  const clone = structuredClone(value);
  let cursor = clone as Record<string | number, unknown>;
  for (const component of path.slice(0, -1)) {
    cursor = cursor[component] as Record<string | number, unknown>;
  }
  cursor[path.at(-1)!] = replacement;
  return clone;
}

function assertRejectedByBoth(value: unknown): void {
  assert.equal(validateCandidateControlSnapshot(value).ok, false);
  assert.equal(validateJsonSchema(value), false);
}

function assertContractError(
  input: CandidateControlSnapshotInput,
  expectedCode: string,
): void {
  assert.throws(
    () => buildCandidateControlSnapshot(input),
    (error: unknown) =>
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === expectedCode &&
      "message" in error &&
      error.message === expectedCode,
  );
}

describe("candidate control snapshot", () => {
  it("closes every concrete JSON Schema object against unknown fields", () => {
    const visit = (value: unknown, path = "$schema"): void => {
      if (typeof value !== "object" || value === null) return;
      const record = value as Record<string, unknown>;
      if (record.type === "object") {
        assert.equal(
          record.additionalProperties,
          false,
          `${path} must set additionalProperties false`,
        );
      }
      for (const [key, child] of Object.entries(record)) {
        visit(child, `${path}.${key}`);
      }
    };

    visit(jsonSchema);
  });

  it("reports an operational machine pipeline independently from human and external readiness", () => {
    const snapshot = buildCandidateControlSnapshot(candidateControlFixture());

    assert.equal(snapshot.operational, true);
    assert.equal(snapshot.machine.runsTotal, 1);
    assert.equal(snapshot.machine.currentByState.candidate_complete, 1);
    assert.equal(snapshot.review.currentByState.not_requested, 1);
    assert.equal(snapshot.review.backlogTotal, 1);
    assert.equal(snapshot.review.oldestPendingAt, "2026-08-18T10:00:00.000Z");
    assert.equal(snapshot.review.oldestPendingAgeSeconds, 7200);
    assert.equal(snapshot.review.reviewComplete, false);
    assert.equal(snapshot.review.pendingIsExpectedWork, true);
    assert.equal(snapshot.promotion.externalReady, false);
    assert.equal(snapshot.reconciliation.snapshotsTotal, 1);
    assert.equal(snapshot.reconciliation.conflictsTotal, 2);
  });

  it("tracks legacy unclassified review signals without granting acceptance", () => {
    const snapshot = buildCandidateControlSnapshot(
      candidateControlFixture({ legacyReviewSignals: 2 }),
    );

    assert.equal(snapshot.legacy.unclassifiedHumanSignals, 2);
    assert.equal(snapshot.review.currentByState.accepted, 0);
  });

  it("treats missing or stale current review bindings as non-authoritative", () => {
    for (const input of [
      candidateControlFixture({ review: "accepted", staleReview: true }),
      {
        ...candidateControlFixture({ review: "accepted" }),
        currentReviewBindings: [],
      },
    ]) {
      const snapshot = buildCandidateControlSnapshot(input);
      assert.equal(snapshot.operational, true);
      assert.equal(snapshot.review.currentByState.accepted, 0);
      assert.equal(snapshot.review.currentByState.not_requested, 1);
      assert.equal(snapshot.review.reviewComplete, false);
      assert.ok(
        snapshot.warnings.some((value) =>
          value.startsWith("stale_review_decision:"),
        ),
      );
      assert.equal(snapshot.promotion.externalReady, false);
    }
  });

  it("uses collision-free review-binding tuple identity", () => {
    const input = candidateControlFixture({ review: "accepted" });
    const secondAssertion = {
      ...input.assertions[0]!,
      id: "a:b",
      createdAt: "2026-08-18T10:01:00.000Z",
    };
    input.assertions = [
      { ...input.assertions[0]!, id: "a" },
      secondAssertion,
    ];
    input.reviewDecisions = [
      {
        ...input.reviewDecisions[0]!,
        assertionId: "a",
        reviewProfile: "b:c",
      },
    ];
    input.currentReviewBindings = [
      {
        ...input.currentReviewBindings[0]!,
        assertionId: "a:b",
        reviewProfile: "c",
      },
    ];
    input.currentPromotionBindings = [];

    const snapshot = buildCandidateControlSnapshot(input);
    assert.equal(snapshot.review.currentByState.accepted, 0);
    assert.equal(snapshot.review.currentByState.not_requested, 2);
    assert.ok(
      snapshot.warnings.includes(`stale_review_decision:${input.reviewDecisions[0]!.id}`),
    );
  });

  it("uses collision-free promotion-binding tuple identity", () => {
    const input = candidateControlFixture({
      review: "accepted",
      promotion: "external_eligible",
    });
    input.externalTargetProfile = "d";
    input.assertions = [
      { ...input.assertions[0]!, id: "a" },
      {
        ...input.assertions[0]!,
        id: "a:b",
        createdAt: "2026-08-18T10:01:00.000Z",
      },
    ];
    input.reviewDecisions = [
      {
        ...input.reviewDecisions[0]!,
        id: "b:c",
        assertionId: "a",
      },
      {
        ...input.reviewDecisions[0]!,
        id: "c",
        assertionId: "a:b",
        reviewProfile: "other-review-v1",
      },
    ];
    input.currentReviewBindings = [
      { ...input.currentReviewBindings[0]!, assertionId: "a" },
      {
        ...input.currentReviewBindings[0]!,
        assertionId: "a:b",
        reviewProfile: "other-review-v1",
      },
    ];
    input.promotionDecisions = [
      {
        ...input.promotionDecisions[0]!,
        assertionId: "a",
        reviewDecisionId: "b:c",
        targetProfile: "d",
      },
    ];
    input.currentPromotionBindings = [
      {
        ...input.currentPromotionBindings[0]!,
        assertionId: "a:b",
        reviewDecisionId: "c",
        targetProfile: "d",
      },
    ];

    const snapshot = buildCandidateControlSnapshot(input);
    assert.equal(snapshot.promotion.externalReady, false);
    assert.equal(snapshot.promotion.byTargetProfile.d?.external_eligible, 0);
    assert.ok(
      snapshot.warnings.includes(
        `stale_promotion_decision:${input.promotionDecisions[0]!.id}`,
      ),
    );
  });

  it("requires current accepted review and exact current promotion bindings for external readiness", () => {
    const eligible = buildCandidateControlSnapshot(
      candidateControlFixture({
        review: "accepted",
        promotion: "external_eligible",
      }),
    );
    assert.equal(eligible.review.currentByState.accepted, 1);
    assert.equal(eligible.review.reviewComplete, true);
    assert.equal(eligible.promotion.externalReady, true);

    for (const input of [
      candidateControlFixture({
        review: "accepted",
        promotion: "external_eligible",
        stalePromotion: true,
      }),
      candidateControlFixture({
        review: "accepted",
        promotion: "published",
        externalBlockers: ["rights_review_pending"],
      }),
      candidateControlFixture({
        review: "accepted",
        promotion: "published",
        queryErrors: ["promotion_query_failed"],
      }),
    ]) {
      assert.equal(buildCandidateControlSnapshot(input).promotion.externalReady, false);
    }
  });

  it("uses only unsuperseded assertions and decisions", () => {
    const base = candidateControlFixture({
      review: "accepted",
      promotion: "external_eligible",
    });
    const oldAssertion = {
      ...base.assertions[0]!,
      id: "assertion:fixture:old",
      createdAt: "2026-08-18T07:00:00.000Z",
    };
    const currentAssertion = {
      ...base.assertions[0]!,
      supersededAssertionId: oldAssertion.id,
    };
    const oldReview = {
      ...base.reviewDecisions[0]!,
      id: "review:fixture:old",
      decision: "rejected" as const,
      createdAt: "2026-08-18T10:59:00.000Z",
    };
    const currentReview = {
      ...base.reviewDecisions[0]!,
      supersededDecisionId: oldReview.id,
    };
    const oldPromotion = {
      ...base.promotionDecisions[0]!,
      id: "promotion:fixture:old",
      state: "revoked" as const,
      createdAt: "2026-08-18T11:29:00.000Z",
    };
    const currentPromotion = {
      ...base.promotionDecisions[0]!,
      supersededDecisionId: oldPromotion.id,
    };

    const snapshot = buildCandidateControlSnapshot({
      ...base,
      assertions: [oldAssertion, currentAssertion],
      reviewDecisions: [oldReview, currentReview],
      promotionDecisions: [oldPromotion, currentPromotion],
    });

    assert.equal(snapshot.machine.assertionsTotal, 1);
    assert.equal(snapshot.review.currentByState.rejected, 0);
    assert.equal(snapshot.review.currentByState.accepted, 1);
    assert.equal(
      snapshot.promotion.byTargetProfile["external-public-v1"]
        ?.external_eligible,
      1,
    );
    assert.equal(snapshot.promotion.byTargetProfile["external-public-v1"]?.revoked, 0);
  });

  it("rejects invalid public-input graphs before deriving counters", () => {
    const duplicateRun = candidateControlFixture();
    duplicateRun.runs.push(structuredClone(duplicateRun.runs[0]!));
    assertContractError(duplicateRun, "duplicate_run_id");

    const duplicateEvent = candidateControlFixture();
    duplicateEvent.runs[0]!.events[1]!.id =
      duplicateEvent.runs[0]!.events[0]!.id;
    assertContractError(duplicateEvent, "duplicate_run_event_id");

    const duplicateSequence = candidateControlFixture();
    duplicateSequence.runs[0]!.events[1]!.sequence =
      duplicateSequence.runs[0]!.events[0]!.sequence;
    assertContractError(duplicateSequence, "duplicate_run_event_sequence");

    const missingRun = candidateControlFixture();
    missingRun.assertions[0]!.runId = "run:missing";
    assertContractError(missingRun, "assertion_run_missing");

    const duplicateAssertion = candidateControlFixture();
    duplicateAssertion.assertions.push(
      structuredClone(duplicateAssertion.assertions[0]!),
    );
    assertContractError(duplicateAssertion, "duplicate_assertion_id");

    const selfSuperseding = candidateControlFixture();
    selfSuperseding.assertions[0]!.supersededAssertionId =
      selfSuperseding.assertions[0]!.id;
    assertContractError(selfSuperseding, "assertion_self_supersession");

    const missingAssertionTarget = candidateControlFixture();
    missingAssertionTarget.assertions[0]!.supersededAssertionId =
      "assertion:missing";
    assertContractError(
      missingAssertionTarget,
      "assertion_supersession_target_missing",
    );

    const assertionCycle = candidateControlFixture();
    assertionCycle.assertions = [
      {
        ...assertionCycle.assertions[0]!,
        id: "assertion:cycle:a",
        supersededAssertionId: "assertion:cycle:b",
      },
      {
        ...assertionCycle.assertions[0]!,
        id: "assertion:cycle:b",
        supersededAssertionId: "assertion:cycle:a",
        createdAt: "2026-08-18T10:01:00.000Z",
      },
    ];
    assertContractError(assertionCycle, "assertion_supersession_cycle");

    const reversedAssertion = candidateControlFixture();
    reversedAssertion.assertions = [
      {
        ...reversedAssertion.assertions[0]!,
        id: "assertion:older",
      },
      {
        ...reversedAssertion.assertions[0]!,
        id: "assertion:wrong-direction",
        supersededAssertionId: "assertion:older",
        createdAt: "2026-08-18T09:59:00.000Z",
      },
    ];
    assertContractError(
      reversedAssertion,
      "assertion_supersession_direction_invalid",
    );

    const duplicateBinding = candidateControlFixture();
    duplicateBinding.currentReviewBindings.push(
      structuredClone(duplicateBinding.currentReviewBindings[0]!),
    );
    assertContractError(duplicateBinding, "duplicate_current_review_binding");

    const missingBindingAssertion = candidateControlFixture();
    missingBindingAssertion.currentReviewBindings[0]!.assertionId =
      "assertion:missing";
    assertContractError(
      missingBindingAssertion,
      "review_binding_assertion_missing",
    );

    const duplicateReview = candidateControlFixture({ review: "accepted" });
    duplicateReview.reviewDecisions.push(
      structuredClone(duplicateReview.reviewDecisions[0]!),
    );
    assertContractError(duplicateReview, "duplicate_review_decision_id");

    const missingReviewAssertion = candidateControlFixture({
      review: "accepted",
    });
    missingReviewAssertion.reviewDecisions[0]!.assertionId =
      "assertion:missing";
    assertContractError(missingReviewAssertion, "review_assertion_missing");

    const reviewCycle = candidateControlFixture({ review: "accepted" });
    reviewCycle.reviewDecisions = [
      {
        ...reviewCycle.reviewDecisions[0]!,
        id: "review:cycle:a",
        supersededDecisionId: "review:cycle:b",
      },
      {
        ...reviewCycle.reviewDecisions[0]!,
        id: "review:cycle:b",
        supersededDecisionId: "review:cycle:a",
        createdAt: "2026-08-18T11:01:00.000Z",
      },
    ];
    assertContractError(reviewCycle, "review_supersession_cycle");

    const reversedReview = candidateControlFixture({ review: "accepted" });
    reversedReview.reviewDecisions = [
      {
        ...reversedReview.reviewDecisions[0]!,
        id: "review:direction:old",
      },
      {
        ...reversedReview.reviewDecisions[0]!,
        id: "review:direction:new",
        supersededDecisionId: "review:direction:old",
        createdAt: "2026-08-18T10:59:00.000Z",
      },
    ];
    assertContractError(
      reversedReview,
      "review_supersession_direction_invalid",
    );

    const crossScopeReview = candidateControlFixture({ review: "accepted" });
    crossScopeReview.assertions.push({
      ...crossScopeReview.assertions[0]!,
      id: "assertion:fixture:2",
      createdAt: "2026-08-18T10:01:00.000Z",
    });
    crossScopeReview.reviewDecisions.push({
      ...crossScopeReview.reviewDecisions[0]!,
      id: "review:fixture:2",
      assertionId: "assertion:fixture:2",
      supersededDecisionId: crossScopeReview.reviewDecisions[0]!.id,
      createdAt: "2026-08-18T11:01:00.000Z",
    });
    assertContractError(crossScopeReview, "review_supersession_scope_mismatch");

    const missingPromotionReview = candidateControlFixture({
      promotion: "external_eligible",
    });
    missingPromotionReview.promotionDecisions[0]!.reviewDecisionId =
      "review:missing";
    assertContractError(
      missingPromotionReview,
      "promotion_review_decision_missing",
    );

    const crossAssertionPromotion = candidateControlFixture({
      review: "accepted",
      promotion: "external_eligible",
    });
    crossAssertionPromotion.assertions.push({
      ...crossAssertionPromotion.assertions[0]!,
      id: "assertion:fixture:other",
      createdAt: "2026-08-18T10:01:00.000Z",
    });
    crossAssertionPromotion.reviewDecisions[0]!.assertionId =
      "assertion:fixture:other";
    assertContractError(
      crossAssertionPromotion,
      "promotion_review_assertion_mismatch",
    );

    const duplicatePromotion = candidateControlFixture({
      review: "accepted",
      promotion: "external_eligible",
    });
    duplicatePromotion.promotionDecisions.push(
      structuredClone(duplicatePromotion.promotionDecisions[0]!),
    );
    assertContractError(
      duplicatePromotion,
      "duplicate_promotion_decision_id",
    );

    const promotionCycle = candidateControlFixture({
      review: "accepted",
      promotion: "external_eligible",
    });
    promotionCycle.promotionDecisions = [
      {
        ...promotionCycle.promotionDecisions[0]!,
        id: "promotion:cycle:a",
        supersededDecisionId: "promotion:cycle:b",
      },
      {
        ...promotionCycle.promotionDecisions[0]!,
        id: "promotion:cycle:b",
        supersededDecisionId: "promotion:cycle:a",
        createdAt: "2026-08-18T11:31:00.000Z",
      },
    ];
    assertContractError(promotionCycle, "promotion_supersession_cycle");

    const reversedPromotion = candidateControlFixture({
      review: "accepted",
      promotion: "external_eligible",
    });
    reversedPromotion.promotionDecisions = [
      {
        ...reversedPromotion.promotionDecisions[0]!,
        id: "promotion:direction:old",
      },
      {
        ...reversedPromotion.promotionDecisions[0]!,
        id: "promotion:direction:new",
        supersededDecisionId: "promotion:direction:old",
        createdAt: "2026-08-18T11:29:00.000Z",
      },
    ];
    assertContractError(
      reversedPromotion,
      "promotion_supersession_direction_invalid",
    );

    const duplicatePromotionBinding = candidateControlFixture({
      review: "accepted",
    });
    duplicatePromotionBinding.currentPromotionBindings.push(
      structuredClone(duplicatePromotionBinding.currentPromotionBindings[0]!),
    );
    assertContractError(
      duplicatePromotionBinding,
      "duplicate_current_promotion_binding",
    );

    const crossAssertionPromotionBinding = candidateControlFixture({
      review: "accepted",
    });
    crossAssertionPromotionBinding.assertions.push({
      ...crossAssertionPromotionBinding.assertions[0]!,
      id: "assertion:fixture:other",
      createdAt: "2026-08-18T10:01:00.000Z",
    });
    crossAssertionPromotionBinding.currentPromotionBindings[0]!.assertionId =
      "assertion:fixture:other";
    assertContractError(
      crossAssertionPromotionBinding,
      "promotion_binding_review_assertion_mismatch",
    );

    const crossScopePromotion = candidateControlFixture({
      review: "accepted",
      promotion: "external_eligible",
    });
    crossScopePromotion.promotionDecisions.push({
      ...crossScopePromotion.promotionDecisions[0]!,
      id: "promotion:fixture:2",
      targetProfile: "different-target",
      supersededDecisionId: crossScopePromotion.promotionDecisions[0]!.id,
      createdAt: "2026-08-18T11:31:00.000Z",
    });
    assertContractError(
      crossScopePromotion,
      "promotion_supersession_scope_mismatch",
    );

    const duplicateReconciliation = candidateControlFixture();
    duplicateReconciliation.reconciliationSnapshots.push(
      structuredClone(duplicateReconciliation.reconciliationSnapshots[0]!),
    );
    assertContractError(
      duplicateReconciliation,
      "duplicate_reconciliation_snapshot_id",
    );

    const invalidInputSchema = candidateControlFixture() as CandidateControlSnapshotInput & {
      unexpected?: boolean;
    };
    invalidInputSchema.unexpected = true;
    assertContractError(
      invalidInputSchema,
      "candidate_control_input_schema_invalid",
    );
  });

  it("maps rerun requests to queued backlog and keeps quarantine explicit", () => {
    const snapshot = buildCandidateControlSnapshot(
      candidateControlFixture({ review: "rerun_requested", quarantined: true }),
    );

    assert.equal(snapshot.operational, true);
    assert.equal(snapshot.machine.currentByState.quarantined, 1);
    assert.equal(snapshot.machine.byMachineUse.quarantined, 1);
    assert.equal(snapshot.review.currentByState.queued, 1);
    assert.equal(snapshot.review.backlogTotal, 1);
  });

  it("turns invalid machine history and query errors into operational failures", () => {
    const invalidHistory = candidateControlFixture();
    invalidHistory.runs[0]!.events = [invalidHistory.runs[0]!.events[1]!];
    const invalidSnapshot = buildCandidateControlSnapshot(invalidHistory);
    assert.equal(invalidSnapshot.operational, false);
    assert.ok(
      invalidSnapshot.warnings.some((warning) =>
        warning.startsWith("invalid_machine_event_history:"),
      ),
    );

    const unorderedHistory = candidateControlFixture();
    unorderedHistory.runs[0]!.events = [
      unorderedHistory.runs[0]!.events[1]!,
      unorderedHistory.runs[0]!.events[0]!,
      unorderedHistory.runs[0]!.events[2]!,
    ];
    assertContractError(unorderedHistory, "run_event_order_invalid");

    const authorityOnInvalidHistory = candidateControlFixture({
      review: "accepted",
      promotion: "external_eligible",
    });
    authorityOnInvalidHistory.runs[0]!.events = [
      authorityOnInvalidHistory.runs[0]!.events[1]!,
    ];
    assert.equal(
      buildCandidateControlSnapshot(authorityOnInvalidHistory).promotion
        .externalReady,
      false,
    );

    const queryFailure = buildCandidateControlSnapshot(
      candidateControlFixture({ queryErrors: ["candidate_runs_query_failed"] }),
    );
    assert.equal(queryFailure.operational, false);
    assert.equal(queryFailure.promotion.externalReady, false);
  });

  it("is deterministic regardless of input order", () => {
    const input = candidateControlFixture({
      review: "accepted",
      promotion: "external_eligible",
      externalBlockers: ["z_blocker", "a_blocker", "z_blocker"],
      queryErrors: ["z_query", "a_query", "z_query"],
    });
    const forward = buildCandidateControlSnapshot(input);
    const reversed = buildCandidateControlSnapshot({
      ...input,
      reviewDecisions: [...input.reviewDecisions].reverse(),
      promotionDecisions: [...input.promotionDecisions].reverse(),
      reconciliationSnapshots: [...input.reconciliationSnapshots].reverse(),
    });

    assert.deepEqual(reversed, forward);
    assert.deepEqual(forward.provenance.queryErrors, ["a_query", "z_query"]);
    assert.deepEqual(forward.promotion.externalBlockers, ["a_blocker", "z_blocker"]);
    assert.deepEqual([...forward.warnings].sort(), forward.warnings);
  });

  it("compares mixed-precision timestamps chronologically", () => {
    const input = candidateControlFixture();
    input.assertions = [
      {
        ...input.assertions[0]!,
        id: "assertion:whole-second",
        createdAt: "2026-08-18T10:00:00Z",
      },
      {
        ...input.assertions[0]!,
        id: "assertion:milliseconds",
        createdAt: "2026-08-18T10:00:00.500Z",
      },
    ];
    input.currentReviewBindings = [];
    input.reconciliationSnapshots = [
      {
        ...input.reconciliationSnapshots[0]!,
        id: "reconciliation:whole-second",
        createdAt: "2026-08-18T09:00:00Z",
        conflictCount: 1,
      },
      {
        ...input.reconciliationSnapshots[0]!,
        id: "reconciliation:milliseconds",
        createdAt: "2026-08-18T09:00:00.500Z",
        conflictCount: 3,
      },
    ];

    const snapshot = buildCandidateControlSnapshot(input);
    assert.equal(snapshot.review.oldestPendingAt, "2026-08-18T10:00:00Z");
    assert.equal(snapshot.reconciliation.conflictsTotal, 3);
  });

  it("keeps runtime validation and draft-2020-12 JSON Schema mutation-sensitive", () => {
    const snapshot = buildCandidateControlSnapshot(candidateControlFixture());
    assert.equal(validateCandidateControlSnapshot(snapshot).ok, true);
    assert.equal(validateJsonSchema(snapshot), true);

    const invalidValues = [
      { ...snapshot, externalReady: true },
      mutateAtPath(snapshot, ["provenance", "extra"], true),
      mutateAtPath(snapshot, ["machine", "currentByState", "extra"], 0),
      mutateAtPath(snapshot, ["promotion", "byTargetProfile"], {
        external: {
          candidate: 0,
          internal_curated: 0,
          external_eligible: 0,
          published: 0,
          revoked: 0,
          extra: 0,
        },
      }),
      mutateAtPath(snapshot, ["generatedAt"], "2026-08-18"),
      mutateAtPath(snapshot, ["generatedAt"], "2026-02-30T12:00:00.000Z"),
      mutateAtPath(snapshot, ["generatedAt"], "2026-08-18T12:00:60Z"),
      mutateAtPath(snapshot, ["provenance", "sourceCommit"], "not-a-commit"),
      mutateAtPath(snapshot, ["provenance", "runtimeCommit"], "f".repeat(41)),
      mutateAtPath(snapshot, ["provenance", "databaseIdentityUuid"], "not-a-uuid"),
      mutateAtPath(snapshot, ["machine", "runsTotal"], -1),
      mutateAtPath(snapshot, ["machine", "assertionsTotal"], 1.5),
      mutateAtPath(snapshot, ["review", "oldestPendingAgeSeconds"], -1),
      mutateAtPath(snapshot, ["review", "pendingIsExpectedWork"], false),
      mutateAtPath(snapshot, ["review", "oldestPendingAt"], "yesterday"),
      mutateAtPath(snapshot, ["promotion", "externalTargetProfile"], "bad\nprofile"),
      mutateAtPath(snapshot, ["promotion", "byTargetProfile"], {
        "bad\nprofile": snapshot.promotion.byTargetProfile["external-public-v1"],
      }),
      mutateAtPath(snapshot, ["machine", "byMachineUse", "unknown"], 0),
      mutateAtPath(snapshot, ["identity", "byConfidence", "unknown"], 0),
      mutateAtPath(snapshot, ["evidence", "byLevel", "unknown"], 0),
      mutateAtPath(snapshot, ["review", "currentByState", "unknown"], 0),
    ];

    for (const invalid of invalidValues) assertRejectedByBoth(invalid);
  });
});

describe("candidate control snapshot CLI output boundary", () => {
  it("accepts only the two named CLI arguments", () => {
    assert.deepEqual(parseCandidateControlSnapshotArgs([]), {
      output: null,
      runtimeCommit: null,
    });
    assert.deepEqual(
      parseCandidateControlSnapshotArgs([
        "--output=var/candidate-snapshot.json",
        `--runtime-commit=${"f".repeat(40)}`,
      ]),
      {
        output: "var/candidate-snapshot.json",
        runtimeCommit: "f".repeat(40),
      },
    );
    for (const args of [
      ["--unknown=true"],
      ["--output"],
      ["--output=one.json", "--output=two.json"],
      ["--runtime-commit=not-a-sha"],
      ["--runtime-commit="],
      ["--output=../outside.json"],
      ["--output=unsafe\nname.json"],
    ]) {
      assert.throws(() => parseCandidateControlSnapshotArgs(args));
    }
  });

  it("sanitizes synchronous CLI argument failures", () => {
    const result = spawnSync(
      process.execPath,
      [
        "--import=tsx",
        "scripts/knowledge/export-candidate-control-snapshot.ts",
        "--unknown=do-not-print-this-value",
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );

    assert.equal(result.status, 1);
    assert.equal(result.stdout, "");
    assert.equal(result.stderr, "candidate_control_snapshot_export_failed\n");
    assert.doesNotMatch(
      `${result.stdout}${result.stderr}`,
      /do-not-print-this-value/,
    );
  });

  it("publishes atomically at mode 0600 and rejects symlink targets", () => {
    const root = mkdtempSync(join(tmpdir(), "candidate-snapshot-"));
    const target = join(root, "snapshot.json");
    const serialized = '{"safe":true}\n';

    writeCandidateControlSnapshotAtomic(target, serialized);
    assert.equal(readFileSync(target, "utf8"), serialized);
    assert.equal(lstatSync(target).mode & 0o777, 0o600);

    const symlinkTarget = join(root, "linked.json");
    symlinkSync(target, symlinkTarget);
    assert.throws(
      () => writeCandidateControlSnapshotAtomic(symlinkTarget, serialized),
      /symlink/i,
    );
  });

  it("rejects and preserves an explicit Git-tracked output target", () => {
    const root = mkdtempSync(join(tmpdir(), "candidate-snapshot-git-"));
    const target = join(root, "tracked.json");
    execFileSync("git", ["init", "--quiet", root]);
    writeFileSync(target, '{"tracked":true}\n', { mode: 0o600 });
    execFileSync("git", ["-C", root, "add", "tracked.json"]);
    const before = readFileSync(target);

    try {
      assert.throws(
        () => writeCandidateControlSnapshotAtomic(target, '{"unsafe":true}\n'),
        /git_tracked/i,
      );
    } finally {
      if (!readFileSync(target).equals(before)) writeFileSync(target, before);
    }
    assert.deepEqual(readFileSync(target), before);
  });

  it("cleans temporary files when atomic publication fails", () => {
    const root = mkdtempSync(join(tmpdir(), "candidate-snapshot-failure-"));
    const target = join(root, "snapshot.json");

    assert.throws(() =>
      writeCandidateControlSnapshotAtomic(target, "{}\n", {
        beforeRename() {
          throw new Error("injected_before_rename_failure");
        },
      }),
    );
    assert.equal(existsSync(join(root, ".snapshot.json.candidate-control.tmp")), false);
    assert.equal(existsSync(target), false);
    assert.deepEqual(readdirSync(root), []);
  });

  it("contains no database mutations or credential logging", () => {
    const source = readFileSync(
      "scripts/knowledge/export-candidate-control-snapshot.ts",
      "utf8",
    );

    assert.doesNotMatch(source, /\.(?:create|createMany|update|updateMany|upsert|delete|deleteMany)\s*\(/);
    assert.doesNotMatch(source, /\$(?:executeRaw|executeRawUnsafe|queryRawUnsafe)/);
    assert.doesNotMatch(source, /console\.(?:log|error)\([^\n]*DATABASE_URL/);
  });
});
