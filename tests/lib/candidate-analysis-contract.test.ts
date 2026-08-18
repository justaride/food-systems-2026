import assert from "node:assert/strict";
import test from "node:test";

import {
  CandidateAnalysisArtifactInputSchema,
  CandidateAnalysisRunEventInputSchema,
  CandidateAssertionInputSchema,
  candidateAnalysisSha256,
  deriveCandidateAnalysisMachineState,
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
        payload: { proposition: { promotionState: "published" } },
      }),
    /reserved_machine_payload_field/,
  );
  assert.throws(
    () =>
      CandidateAnalysisArtifactInputSchema.parse({
        ...fixture.artifact,
        payload: { result: { humanReviewed: true } },
      }),
    /reserved_machine_payload_field/,
  );
  assert.throws(
    () =>
      CandidateAnalysisArtifactInputSchema.parse({
        ...fixture.artifact,
        payload: { result: { publicationState: "published" } },
      }),
    /reserved_machine_payload_field/,
  );
  assert.throws(
    () =>
      CandidateAnalysisRunEventInputSchema.parse({
        ...fixture.events.started,
        payload: { progress: { externalReady: true } },
      }),
    /reserved_machine_payload_field/,
  );
  assert.throws(
    () =>
      CandidateAnalysisRunEventInputSchema.parse({
        ...fixture.events.started,
        payload: { progress: { coverageAuthority: "approved" } },
      }),
    /reserved_machine_payload_field/,
  );
  assert.doesNotThrow(() =>
    CandidateAssertionInputSchema.parse({
      ...fixture.assertion,
      payload: { note: "This ordinary string may mention published review." },
    }),
  );
});

test("rejects recursive approval markers across separator and case variants", () => {
  const fixture = candidateAnalysisFixture();

  assert.throws(
    () =>
      CandidateAssertionInputSchema.parse({
        ...fixture.assertion,
        payload: { result: { approvalState: "approved" } },
      }),
    /reserved_machine_payload_field/,
  );
  assert.throws(
    () =>
      CandidateAnalysisArtifactInputSchema.parse({
        ...fixture.artifact,
        payload: { result: [{ nested: { humanApproved: true } }] },
      }),
    /reserved_machine_payload_field/,
  );
  assert.throws(
    () =>
      CandidateAnalysisRunEventInputSchema.parse({
        ...fixture.events.started,
        payload: { progress: { "HuMaN-Approval_State": "approved" } },
      }),
    /reserved_machine_payload_field/,
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
        { ...fixture.events.completed, sequence: 3 },
      ]),
    /event_sequence_gap/,
  );
  assert.throws(
    () =>
      deriveCandidateAnalysisMachineState([
        fixture.events.queued,
        fixture.events.started,
        fixture.events.completed,
        { ...fixture.events.checkpoint1, sequence: 4 },
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
