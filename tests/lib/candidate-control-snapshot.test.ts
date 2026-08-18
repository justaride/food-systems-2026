import assert from "node:assert/strict";
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
const validateJsonSchema = new Ajv2020({
  allErrors: true,
  strict: true,
  formats: {
    "date-time": true,
  },
}).compile(jsonSchema);

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
    currentPromotionBindings: [
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
      candidateControlFixture({ promotion: "external_eligible" }),
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
    };
    const currentReview = {
      ...base.reviewDecisions[0]!,
      supersededDecisionId: oldReview.id,
    };
    const oldPromotion = {
      ...base.promotionDecisions[0]!,
      id: "promotion:fixture:old",
      state: "revoked" as const,
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
    const unorderedSnapshot = buildCandidateControlSnapshot(unorderedHistory);
    assert.equal(unorderedSnapshot.operational, false);
    assert.ok(
      unorderedSnapshot.warnings.some((warning) =>
        warning.startsWith("invalid_machine_event_order_or_binding:"),
      ),
    );

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
      mutateAtPath(snapshot, ["provenance", "sourceCommit"], "not-a-commit"),
      mutateAtPath(snapshot, ["provenance", "runtimeCommit"], "f".repeat(41)),
      mutateAtPath(snapshot, ["provenance", "databaseIdentityUuid"], "not-a-uuid"),
      mutateAtPath(snapshot, ["machine", "runsTotal"], -1),
      mutateAtPath(snapshot, ["machine", "assertionsTotal"], 1.5),
      mutateAtPath(snapshot, ["review", "oldestPendingAgeSeconds"], -1),
      mutateAtPath(snapshot, ["review", "pendingIsExpectedWork"], false),
      mutateAtPath(snapshot, ["review", "oldestPendingAt"], "yesterday"),
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
