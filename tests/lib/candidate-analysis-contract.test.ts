import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  CandidateAnalysisArtifactInputSchema,
  CandidateAnalysisRunInputSchema,
  CandidateAnalysisRunEventInputSchema,
  CandidateAssertionInputSchema,
  CandidateReconciliationSnapshotInputSchema,
  candidateAnalysisHumanReviewDecisionHash,
  candidateAnalysisOutputManifestHash,
  candidateAnalysisPromotionDecisionHash,
  candidateAnalysisSha256,
  candidateAnalysisAssertionPayloadHash,
  candidateAnalysisRunEventHash,
  candidateAnalysisRunScopeHash,
  deriveCandidateAnalysisMachineState,
  type CandidateAnalysisRunEventInput,
  type CandidateOutputManifest,
} from "../../src/lib/knowledge/candidate-analysis-contract";
import { candidateAnalysisFixture } from "../fixtures/candidate-analysis-fixture";

test("accepts exact, provisional and unresolved identity without authority promotion", () => {
  for (const identityConfidence of [
    "exact",
    "provisional",
    "unresolved",
  ] as const) {
    const fixture = candidateAnalysisFixture({ identityConfidence });
    assert.equal(
      CandidateAssertionInputSchema.parse(fixture.assertion).promotionState,
      "candidate",
    );
  }
});

test("rejects review and publication fields in machine payloads", () => {
  const fixture = candidateAnalysisFixture();
  assert.throws(
    () =>
      CandidateAssertionInputSchema.parse({
        ...fixture.assertion,
        humanReviewed: true,
        externalReady: true,
      }),
    /unrecognized/i,
  );
});

test("rejects nested authority markers in every machine-owned payload", () => {
  const fixture = candidateAnalysisFixture();

  assert.throws(
    () =>
      CandidateAssertionInputSchema.parse({
        ...fixture.assertion,
        payload: {
          namespace: "candidate",
          kind: "assertion",
          data: { proposition: { promotionState: "published" } },
        },
      }),
    /reserved_machine_payload_field/,
  );
  assert.throws(
    () =>
      CandidateAnalysisArtifactInputSchema.parse({
        ...fixture.artifact,
        payload: {
          namespace: "candidate",
          kind: "artifact",
          data: { result: { humanReviewed: true } },
        },
      }),
    /reserved_machine_payload_field/,
  );
  assert.throws(
    () =>
      CandidateAnalysisArtifactInputSchema.parse({
        ...fixture.artifact,
        payload: {
          namespace: "candidate",
          kind: "artifact",
          data: { result: { publicationState: "published" } },
        },
      }),
    /reserved_machine_payload_field/,
  );
  assert.throws(
    () =>
      CandidateAnalysisRunEventInputSchema.parse({
        ...fixture.events.started,
        payload: {
          namespace: "candidate",
          kind: "run_event",
          data: { progress: { externalReady: true } },
        },
      }),
    /reserved_machine_payload_field/,
  );
  assert.throws(
    () =>
      CandidateAnalysisRunEventInputSchema.parse({
        ...fixture.events.started,
        payload: {
          namespace: "candidate",
          kind: "run_event",
          data: { progress: { coverageAuthority: "approved" } },
        },
      }),
    /reserved_machine_payload_field/,
  );
  assert.doesNotThrow(() =>
    CandidateAssertionInputSchema.parse((() => {
      const payload = {
        namespace: "candidate",
        kind: "assertion",
        data: { note: "This ordinary string may mention published review." },
      } as const;
      return {
        ...fixture.assertion,
        payload,
        payloadHash: candidateAnalysisAssertionPayloadHash(payload),
      };
    })()),
  );
});

test("rejects recursive approval markers across separator and case variants", () => {
  const fixture = candidateAnalysisFixture();

  assert.throws(
    () =>
      CandidateAssertionInputSchema.parse({
        ...fixture.assertion,
        payload: {
          namespace: "candidate",
          kind: "assertion",
          data: { result: { approvalState: "approved" } },
        },
      }),
    /reserved_machine_payload_field/,
  );
  assert.throws(
    () =>
      CandidateAnalysisArtifactInputSchema.parse({
        ...fixture.artifact,
        payload: {
          namespace: "candidate",
          kind: "artifact",
          data: { result: [{ nested: { humanApproved: true } }] },
        },
      }),
    /reserved_machine_payload_field/,
  );
  assert.throws(
    () =>
      CandidateAnalysisRunEventInputSchema.parse({
        ...fixture.events.started,
        payload: {
          namespace: "candidate",
          kind: "run_event",
          data: { progress: { "HuMaN-Approval_State": "approved" } },
        },
      }),
    /reserved_machine_payload_field/,
  );
});

test("candidate payload namespaces cannot represent authority on any machine surface", () => {
  const fixture = candidateAnalysisFixture();
  const cases = [
    [
      CandidateAssertionInputSchema,
      {
        ...fixture.assertion,
        payload: {
          namespace: "candidate",
          kind: "assertion",
          data: { canonicalState: "canonical" },
        },
      },
    ],
    [
      CandidateAnalysisArtifactInputSchema,
      {
        ...fixture.artifact,
        payload: {
          namespace: "candidate",
          kind: "artifact",
          data: { rightsStatus: "cleared" },
        },
      },
    ],
    [
      CandidateAnalysisRunEventInputSchema,
      {
        ...fixture.events.started,
        payload: {
          namespace: "candidate",
          kind: "run_event",
          data: { coverageStatus: "complete" },
        },
      },
    ],
    [
      CandidateReconciliationSnapshotInputSchema,
      {
        id: "snapshot:authority:negative",
        runId: fixture.run.id,
        scopeHash: "c".repeat(64),
        payload: {
          namespace: "candidate",
          kind: "reconciliation",
          data: { status: "published" },
        },
        payloadHash: "d".repeat(64),
        conflictCount: 0,
      },
    ],
    [
      CandidateAssertionInputSchema,
      {
        ...fixture.assertion,
        payload: {
          namespace: "candidate",
          kind: "assertion",
          data: { rights: "cleared" },
        },
      },
    ],
    [
      CandidateAnalysisArtifactInputSchema,
      {
        ...fixture.artifact,
        payload: {
          namespace: "candidate",
          kind: "artifact",
          data: { coverage: "complete" },
        },
      },
    ],
    [
      CandidateAnalysisRunEventInputSchema,
      {
        ...fixture.events.started,
        payload: {
          namespace: "candidate",
          kind: "run_event",
          data: { authority: "human" },
        },
      },
    ],
    [
      CandidateReconciliationSnapshotInputSchema,
      {
        id: "snapshot:authority:decision",
        runId: fixture.run.id,
        scope: { assertionIds: [fixture.assertion.id] },
        scopeHash: "c".repeat(64),
        payload: {
          namespace: "candidate",
          kind: "reconciliation",
          data: { decision: "accepted" },
        },
        payloadHash: "d".repeat(64),
        conflictCount: 0,
      },
    ],
    [
      CandidateAssertionInputSchema,
      {
        ...fixture.assertion,
        payload: {
          namespace: "candidate",
          kind: "assertion",
          data: { rightsComplete: true },
        },
      },
    ],
    [
      CandidateAnalysisArtifactInputSchema,
      {
        ...fixture.artifact,
        payload: {
          namespace: "candidate",
          kind: "artifact",
          data: { coverageReadiness: true },
        },
      },
    ],
    [
      CandidateAnalysisRunEventInputSchema,
      {
        ...fixture.events.started,
        payload: {
          namespace: "candidate",
          kind: "run_event",
          data: { review: true },
        },
      },
    ],
  ] as const;

  for (const [schema, input] of cases) {
    assert.throws(() => schema.parse(input), /candidate_payload_authority_forbidden/);
  }
});

test("run contract binds canonical workflow and prompt path version and file hashes", () => {
  const fixture = candidateAnalysisFixture();
  const workflowPath = "knowledge/corpus/workflows/candidate-analysis-v1.md";
  const promptPath =
    "knowledge/corpus/workflows/candidate-analysis-prompt-v1.md";
  const fileHash = (path: string) =>
    createHash("sha256").update(readFileSync(path)).digest("hex");
  const boundRun = {
    ...fixture.run,
    workflowPath,
    workflowHash: fileHash(workflowPath),
    promptId: "prompt.candidate_analysis.v1",
    promptVersion: "1.0.0",
    promptPath,
    promptHash: fileHash(promptPath),
    config: { temperature: 0 },
    configHash: candidateAnalysisSha256("run-config", { temperature: 0 }),
  };

  assert.doesNotThrow(() => CandidateAnalysisRunInputSchema.parse(boundRun));
  for (const mutation of [
    { workflowPath: "knowledge/corpus/workflows/source-analysis-v1.md" },
    { workflowVersion: "1.0.1" },
    { promptId: "prompt.other.v1" },
    { promptVersion: "1.0.1" },
    { promptPath: "knowledge/corpus/workflows/source-analysis-prompt-v1.md" },
  ]) {
    assert.throws(
      () => CandidateAnalysisRunInputSchema.parse({ ...boundRun, ...mutation }),
      /candidate_run_binding_mismatch/,
    );
  }
});

test("superseded is a discriminated event that cannot omit the prior hash binding", () => {
  const fixture = candidateAnalysisFixture();
  assert.throws(
    () =>
      CandidateAnalysisRunEventInputSchema.parse({
        ...fixture.events.completed,
        id: "event:supersession:unbound",
        sequence: 4,
        eventType: "superseded",
        payload: {
          namespace: "candidate",
          kind: "run_supersession",
          data: { reason: "replacement" },
        },
        supersededEventId: undefined,
        supersededEventHash: undefined,
        supersessionScopeHash: undefined,
      }),
    /superseded_event_binding_required/,
  );
});

test("complete and partial terminal events permit only an exact next-event supersession", () => {
  const fixture = candidateAnalysisFixture();
  const seal = (
    event: Omit<CandidateAnalysisRunEventInput, "eventHash">,
  ): CandidateAnalysisRunEventInput => ({
    ...event,
    eventHash: candidateAnalysisRunEventHash(event),
  }) as CandidateAnalysisRunEventInput;

  for (const eventType of [
    "candidate_completed",
    "partial_completed",
  ] as const) {
    const terminal = seal({
      ...fixture.events.completed,
      id: `event:${eventType}:terminal`,
      sequence: 3,
      eventType,
    });
    const superseded = seal({
      id: `event:${eventType}:superseded`,
      runId: fixture.run.id,
      sequence: 4,
      eventType: "superseded",
      payload: {
        namespace: "candidate",
        kind: "run_supersession",
        data: { reason: "replacement run" },
      },
      supersededEventId: terminal.id,
      supersededEventHash: terminal.eventHash,
      supersessionScopeHash: candidateAnalysisRunScopeHash(fixture.run.id),
    });
    const prefix = [fixture.events.queued, fixture.events.started, terminal];

    assert.equal(
      deriveCandidateAnalysisMachineState([...prefix, superseded]),
      "superseded",
    );

    const wrongPriorHash = seal({
      ...superseded,
      supersededEventHash: "f".repeat(64),
    });
    assert.throws(
      () => deriveCandidateAnalysisMachineState([...prefix, wrongPriorHash]),
      /invalid_event_supersession/,
    );
  }
});

test("terminal manifest seals dependency and reconciliation output alongside row metadata", () => {
  const fixture = candidateAnalysisFixture();
  const baseManifest = (
    fixture.events.completed.payload as {
      data: { manifest: CandidateOutputManifest };
    }
  ).data.manifest;
  const manifest = {
    ...baseManifest,
    artifacts: baseManifest.artifacts.map((artifact) => ({
      ...artifact,
      artifactType: fixture.artifact.artifactType,
      schemaVersion: fixture.artifact.schemaVersion,
    })),
    assertions: baseManifest.assertions.map((assertion) => ({
      ...assertion,
      assertionType: fixture.assertion.assertionType,
      schemaVersion: fixture.assertion.schemaVersion,
      confidence: fixture.assertion.confidence,
      machineUse: fixture.assertion.machineUse,
      limitations: fixture.assertion.limitations,
      scopeKey: fixture.assertion.scopeKey,
      scopeHash: fixture.assertion.scopeHash,
      supersededAssertionId: null,
      supersededAssertionPayloadHash: null,
    })),
    dependencies: [
      {
        id: "dependency:manifest:1",
        assertionId: fixture.assertion.id,
        upstreamAssertionId: "assertion:upstream:1",
        relation: "derived_from",
        inheritedLimitations: ["machine_generated"],
      },
    ],
    reconciliationSnapshots: [
      {
        id: "snapshot:manifest:1",
        scopeHash: "1".repeat(64),
        payloadHash: "2".repeat(64),
        conflictCount: 0,
      },
    ],
  };
  const payload = {
    namespace: "candidate" as const,
    kind: "run_terminal" as const,
    data: {
      manifest,
      manifestHash: candidateAnalysisOutputManifestHash(
        manifest as CandidateOutputManifest,
      ),
    },
  };
  const event = {
    ...fixture.events.completed,
    payload,
  };

  assert.doesNotThrow(() =>
    CandidateAnalysisRunEventInputSchema.parse({
      ...event,
      eventHash: candidateAnalysisRunEventHash(event),
    }),
  );
});

test("allows repeated checkpoints but rejects gaps and post-terminal writes", () => {
  const fixture = candidateAnalysisFixture();
  assert.equal(
    deriveCandidateAnalysisMachineState([
      fixture.events.queued,
      fixture.events.started,
      fixture.events.checkpoint1,
      fixture.events.checkpoint2,
      fixture.events.completed,
    ]),
    "candidate_complete",
  );
  assert.throws(
    () =>
      deriveCandidateAnalysisMachineState([
        fixture.events.queued,
        (() => {
          const event = { ...fixture.events.completed, sequence: 3 };
          return { ...event, eventHash: candidateAnalysisRunEventHash(event) };
        })(),
      ]),
    /event_sequence_gap/,
  );
  assert.throws(
    () =>
      deriveCandidateAnalysisMachineState([
        fixture.events.queued,
        fixture.events.started,
        fixture.events.completed,
        (() => {
          const event = { ...fixture.events.checkpoint1, sequence: 4 };
          return { ...event, eventHash: candidateAnalysisRunEventHash(event) };
        })(),
      ]),
    /event_after_terminal_state/,
  );
});

test("canonical hashing ignores object key insertion order", () => {
  assert.equal(
    candidateAnalysisSha256("test", { a: 1, b: 2 }),
    candidateAnalysisSha256("test", { b: 2, a: 1 }),
  );
});

test("review and promotion receipts have distinct complete decision hash domains", () => {
  const review = {
    id: "review:hash:1",
    assertionId: "assertion:hash:1",
    decision: "accepted" as const,
    reviewProfile: "review-profile-v1",
    reviewProfileHash: "1".repeat(64),
    reviewer: "reviewer:one",
    authority: "authority:one",
    assertionPayloadHash: "2".repeat(64),
    sourceContentSetHash: "3".repeat(64),
    evidenceSetHash: "4".repeat(64),
    limitations: ["internal_only"],
    editedPayloadHash: null,
    supersededDecisionId: null,
    supersededDecisionHash: null,
  };
  const promotion = {
    id: "promotion:hash:1",
    assertionId: review.assertionId,
    assertionPayloadHash: review.assertionPayloadHash,
    reviewDecisionId: review.id,
    reviewDecisionHash: candidateAnalysisHumanReviewDecisionHash(review),
    targetProfile: "external-public-v1",
    targetProfileHash: "5".repeat(64),
    state: "external_eligible" as const,
    policyVersion: "policy-v1",
    policyHash: "6".repeat(64),
    preconditionsHash: "7".repeat(64),
    targetSetHash: "8".repeat(64),
    resultHash: "9".repeat(64),
    operator: "operator:one",
    authority: "authority:one",
    supersededDecisionId: null,
    supersededDecisionHash: null,
    supersededPolicyHash: null,
  };

  const reviewHash = candidateAnalysisHumanReviewDecisionHash(review);
  const promotionHash = candidateAnalysisPromotionDecisionHash(promotion);
  assert.notEqual(reviewHash, promotionHash);
  assert.notEqual(
    reviewHash,
    candidateAnalysisHumanReviewDecisionHash({
      ...review,
      evidenceSetHash: "a".repeat(64),
    }),
  );
  assert.notEqual(
    promotionHash,
    candidateAnalysisPromotionDecisionHash({
      ...promotion,
      supersededPolicyHash: "b".repeat(64),
    }),
  );
});
