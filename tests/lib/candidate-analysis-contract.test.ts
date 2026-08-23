import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  CandidateAnalysisArtifactInputSchema,
  CandidateAnalysisRunInputSchema,
  CandidateAnalysisRunEventInputSchema,
  CandidateArtifactPayloadSchema,
  CandidateAssertionPayloadSchema,
  CandidateAssertionInputSchema,
  CandidateReconciliationPayloadSchema,
  CandidateReconciliationSnapshotInputSchema,
  CandidateRunEventPayloadSchema,
  assertCandidateJsonValue,
  canonicalCandidateJson,
  candidateAnalysisHumanReviewDecisionHash,
  candidateAnalysisOutputManifestHash,
  candidateAnalysisPromotionDecisionHash,
  candidateAnalysisSha256,
  candidateAnalysisAssertionPayloadHash,
  candidateAnalysisRunEventHash,
  candidateAnalysisRunIdempotencyKey,
  candidateAnalysisRunScopeHash,
  candidateWorkflowProfile,
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

test("structured authority is unrepresentable on every machine payload surface", () => {
  const forbiddenStructuredAuthority = [
    { lifecycle: "published" },
    { verdict: "approved" },
    { disposition: "canonical" },
    { release: "external_ready" },
  ] as const;

  for (const { kind, schema } of [
    { kind: "assertion", schema: CandidateAssertionPayloadSchema },
    { kind: "artifact", schema: CandidateArtifactPayloadSchema },
    { kind: "run_event", schema: CandidateRunEventPayloadSchema },
    { kind: "reconciliation", schema: CandidateReconciliationPayloadSchema },
  ] as const) {
    for (const data of forbiddenStructuredAuthority) {
      assert.equal(
        schema.safeParse({ namespace: "candidate", kind, data }).success,
        false,
      );
    }
  }
});

test("machine payload grammar accepts only strict typed candidate entries", () => {
  const valid = {
    namespace: "candidate",
    kind: "assertion",
    data: {
      entries: [
        {
          role: "proposition",
          valueType: "text",
          value: "A reviewable candidate claim.",
        },
        {
          role: "quantitative_observation",
          valueType: "number",
          value: 42,
          unit: "kg",
        },
        { role: "limitation", valueType: "flag", value: true },
        {
          role: "scope_reference",
          valueType: "reference",
          targetType: "content_unit",
          targetId: "content:fixture:1",
        },
      ],
    },
  } as const;
  assert.equal(CandidateAssertionPayloadSchema.safeParse(valid).success, true);

  const invalid = [
    { ...valid, unknown: true },
    { ...valid, data: { ...valid.data, unknown: true } },
    {
      ...valid,
      data: { entries: [{ ...valid.data.entries[0], unknown: true }] },
    },
    {
      ...valid,
      data: {
        entries: [{ role: "unknown", valueType: "text", value: "text" }],
      },
    },
    {
      ...valid,
      data: {
        entries: [{ role: "summary", valueType: "unknown", value: "text" }],
      },
    },
    {
      ...valid,
      data: {
        entries: [
          { role: "summary", valueType: "text", value: { nested: true } },
        ],
      },
    },
    {
      ...valid,
      data: {
        entries: [
          { role: "quantitative_observation", valueType: "number", value: Infinity, unit: null },
        ],
      },
    },
    { ...valid, data: { entries: [] } },
  ];
  for (const payload of invalid) {
    assert.equal(CandidateAssertionPayloadSchema.safeParse(payload).success, false);
  }
});

test("candidate-only run contract binds canonical workflow and prompt metadata", () => {
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

test("binds analysis and validation to different workflow and prompt bytes", () => {
  const analysis = candidateWorkflowProfile("library_analysis_v1");
  const validation = candidateWorkflowProfile("library_validation_v1");

  assert.equal(analysis.workflow.version, "1.0.23");
  assert.equal(analysis.prompt.version, "1.0.23");
  assert.equal(validation.workflow.version, "1.0.23");
  assert.equal(validation.prompt.version, "1.0.23");
  assert.equal(analysis.workflow.hash, createHash("sha256").update(readFileSync(analysis.workflow.path)).digest("hex"));
  assert.equal(analysis.prompt.hash, createHash("sha256").update(readFileSync(analysis.prompt.path)).digest("hex"));
  assert.equal(validation.workflow.hash, createHash("sha256").update(readFileSync(validation.workflow.path)).digest("hex"));
  assert.equal(validation.prompt.hash, createHash("sha256").update(readFileSync(validation.prompt.path)).digest("hex"));
  assert.notEqual(analysis.workflow.path, validation.workflow.path);
  assert.notEqual(analysis.prompt.path, validation.prompt.path);
  assert.notEqual(analysis.workflow.id, validation.workflow.id);
  assert.notEqual(analysis.prompt.id, validation.prompt.id);
});

test("library profiles reject valid but non-canonical workflow and prompt hashes", () => {
  const fixture = candidateAnalysisFixture();
  for (const outputProfile of ["library_analysis_v1", "library_validation_v1"] as const) {
    const profile = candidateWorkflowProfile(outputProfile);
    assert.ok("hash" in profile.workflow);
    assert.ok("hash" in profile.prompt);
    const binding = {
      ...fixture.run,
      outputProfile,
      workflowId: profile.workflow.id,
      workflowVersion: profile.workflow.version,
      workflowPath: profile.workflow.path,
      workflowHash: profile.workflow.hash,
      promptId: profile.prompt.id,
      promptVersion: profile.prompt.version,
      promptPath: profile.prompt.path,
      promptHash: profile.prompt.hash,
    };
    for (const mutation of [
      { workflowHash: "f".repeat(64) },
      { promptHash: "e".repeat(64) },
    ]) {
      const mutated = { ...binding, ...mutation };
      assert.throws(
        () => CandidateAnalysisRunInputSchema.parse({
          ...mutated,
          idempotencyKey: candidateAnalysisRunIdempotencyKey(mutated),
        }),
        /candidate_run_binding_mismatch/u,
      );
    }
  }
});

test("rejects an analysis prompt on a validation output profile", () => {
  const fixture = candidateAnalysisFixture();
  const analysis = candidateWorkflowProfile("library_analysis_v1");
  const validation = candidateWorkflowProfile("library_validation_v1");
  assert.ok("hash" in validation.workflow);
  assert.ok("hash" in validation.prompt);
  const runBinding = {
    ...fixture.run,
    outputProfile: "library_validation_v1",
    workflowId: validation.workflow.id,
    workflowVersion: validation.workflow.version,
    workflowPath: validation.workflow.path,
    workflowHash: validation.workflow.hash,
    promptId: validation.prompt.id,
    promptVersion: validation.prompt.version,
    promptPath: analysis.prompt.path,
    promptHash: validation.prompt.hash,
  };
  const run = {
    ...runBinding,
    idempotencyKey: candidateAnalysisRunIdempotencyKey(runBinding),
  };

  assert.throws(
    () => CandidateAnalysisRunInputSchema.parse(run),
    /candidate_run_binding_mismatch/,
  );
});

test("run scope and ordinary event scope are derived from run identity", () => {
  const fixture = candidateAnalysisFixture();
  const derivedScope = candidateAnalysisRunScopeHash(fixture.run.id);

  assert.equal(fixture.run.scopeHash, derivedScope);
  assert.equal(fixture.events.queued.scopeHash, derivedScope);
  assert.equal(fixture.events.started.scopeHash, derivedScope);
  assert.doesNotThrow(() => CandidateAnalysisRunInputSchema.parse(fixture.run));
  assert.doesNotThrow(() =>
    CandidateAnalysisRunEventInputSchema.parse(fixture.events.started),
  );

  assert.throws(
    () =>
      CandidateAnalysisRunInputSchema.parse({
        ...fixture.run,
        scopeHash: "f".repeat(64),
      }),
    /candidate_run_scope_mismatch/,
  );
  const wrongEventScope = {
    ...fixture.events.started,
    scopeHash: "f".repeat(64),
  };
  assert.throws(
    () =>
      CandidateAnalysisRunEventInputSchema.parse({
        ...wrongEventScope,
        eventHash: candidateAnalysisRunEventHash(wrongEventScope),
      }),
    /candidate_event_scope_mismatch/,
  );
});

test("supersession scope requires the complete prior event identity", () => {
  const fixture = candidateAnalysisFixture();
  const prior = fixture.events.completed;
  const supersedingBase = {
    id: "event:supersession:complete",
    runId: fixture.run.id,
    scopeHash: fixture.run.scopeHash,
    sequence: prior.sequence + 1,
    eventType: "superseded" as const,
    payload: {
      namespace: "candidate" as const,
      kind: "run_supersession" as const,
      data: { reason: "replacement" },
    },
    supersededEventId: prior.id,
    supersededEventHash: prior.eventHash,
    supersededEventScopeHash: prior.scopeHash,
  };
  const superseding = {
    ...supersedingBase,
    eventHash: candidateAnalysisRunEventHash(supersedingBase),
  };

  assert.doesNotThrow(() =>
    CandidateAnalysisRunEventInputSchema.parse(superseding),
  );
  assert.equal(superseding.supersededEventScopeHash, prior.scopeHash);

  for (const field of [
    "supersededEventId",
    "supersededEventHash",
    "supersededEventScopeHash",
  ] as const) {
    const incomplete = { ...supersedingBase, [field]: undefined };
    assert.throws(
      () =>
        CandidateAnalysisRunEventInputSchema.parse({
          ...incomplete,
          eventHash: candidateAnalysisRunEventHash(incomplete),
        }),
      /superseded_event_binding_required/,
    );
  }
  const missingRun = { ...supersedingBase, runId: undefined };
  assert.throws(
    () => candidateAnalysisRunEventHash(missingRun as never),
    /candidate_json_type/,
  );
  assert.equal(
    CandidateAnalysisRunEventInputSchema.safeParse({
      ...missingRun,
      eventHash: "f".repeat(64),
    }).success,
    false,
  );

  const wrongPriorScope = {
    ...supersedingBase,
    supersededEventScopeHash: "f".repeat(64),
  };
  assert.throws(
    () =>
      CandidateAnalysisRunEventInputSchema.parse({
        ...wrongPriorScope,
        eventHash: candidateAnalysisRunEventHash(wrongPriorScope),
      }),
    /event_supersession_scope_mismatch/,
  );
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
        supersededEventScopeHash: undefined,
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
      scopeHash: fixture.run.scopeHash,
      sequence: 4,
      eventType: "superseded",
      payload: {
        namespace: "candidate",
        kind: "run_supersession",
        data: { reason: "replacement run" },
      },
      supersededEventId: terminal.id,
      supersededEventHash: terminal.eventHash,
      supersededEventScopeHash: terminal.scopeHash,
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

test("canonical candidate JSON sorts object keys by UTF-8 bytes", () => {
  assert.equal(
    canonicalCandidateJson({ "\uE000": 1, "😀": 2 }),
    '{"\uE000":1,"😀":2}',
  );
});

test("candidate JSON rejects values PostgreSQL JSONB cannot represent", () => {
  assert.throws(() => assertCandidateJsonValue("a\u0000b"), /candidate_json_nul/);
  assert.throws(
    () => assertCandidateJsonValue("\uD800"),
    /candidate_json_surrogate/,
  );
  assert.throws(
    () => assertCandidateJsonValue({ "\uDC00": true }),
    /candidate_json_surrogate/,
  );
});

test("candidate JSON preserves nested JSON null", () => {
  assert.equal(
    canonicalCandidateJson({ config: null, nested: [null] }),
    '{"config":null,"nested":[null]}',
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
