import type {
  CandidateAnalysisArtifactInput,
  CandidateAnalysisRunEventInput,
  CandidateAnalysisRunInput,
  CandidateAssertionInput,
  CandidateContentUnitInput,
  CandidateEvidenceLinkInput,
  CandidateIdentityConfidence,
} from "../../src/lib/knowledge/candidate-analysis-contract";

const HASH = "a".repeat(64);
const HASH_B = "b".repeat(64);

export function candidateAnalysisFixture(
  overrides: {
    identityConfidence?: CandidateIdentityConfidence;
    contentUnitId?: string;
    runId?: string;
    assertionId?: string;
    idempotencyKey?: string;
    attempt?: number;
    predecessorRunId?: string | null;
  } = {},
): {
  contentUnit: CandidateContentUnitInput;
  run: CandidateAnalysisRunInput;
  events: Record<
    "queued" | "started" | "checkpoint1" | "checkpoint2" | "completed",
    CandidateAnalysisRunEventInput
  >;
  artifact: CandidateAnalysisArtifactInput;
  assertion: CandidateAssertionInput;
  evidenceLink: CandidateEvidenceLinkInput;
} {
  const contentUnitId = overrides.contentUnitId ?? "content:fixture:1";
  const runId = overrides.runId ?? "run:fixture:1";
  const assertionId = overrides.assertionId ?? "assertion:fixture:1";
  const identityConfidence = overrides.identityConfidence ?? "provisional";

  return {
    contentUnit: {
      id: contentUnitId,
      sourceKind: "source",
      sourceKey: "source:fixture:1",
      sourceVersionHash: HASH,
      unitType: "document_section",
      ordinal: 0,
      locator: "section:1",
      locatorHash: HASH_B,
      contentHash: HASH,
      hashAlgorithm: "sha256",
      identityConfidence,
    },
    run: {
      id: runId,
      workflowId: "workflow.candidate_analysis.v1",
      workflowVersion: "1.0.0",
      modelProvider: "fixture-provider",
      modelName: "fixture-model",
      modelVersion: "fixture-build",
      promptHash: HASH,
      configHash: HASH_B,
      inputEnvelopeHash: HASH,
      purpose: "candidate analysis fixture",
      outputProfile: "candidate_only",
      workerId: "worker:fixture:1",
      idempotencyKey: overrides.idempotencyKey ?? "idempotency:fixture:1",
      attempt: overrides.attempt ?? 1,
      predecessorRunId: overrides.predecessorRunId ?? null,
      inputs: [{ contentUnitId, position: 0, inputHash: HASH }],
    },
    events: {
      queued: {
        id: "event:fixture:1",
        runId,
        sequence: 1,
        eventType: "queued",
        payload: { reason: "scheduled" },
        eventHash: HASH,
      },
      started: {
        id: "event:fixture:2",
        runId,
        sequence: 2,
        eventType: "started",
        payload: { workerId: "worker:fixture:1" },
        eventHash: HASH_B,
      },
      checkpoint1: {
        id: "event:fixture:3",
        runId,
        sequence: 3,
        eventType: "checkpoint",
        payload: { checkpoint: 1 },
        eventHash: HASH,
      },
      checkpoint2: {
        id: "event:fixture:4",
        runId,
        sequence: 4,
        eventType: "checkpoint",
        payload: { checkpoint: 2 },
        eventHash: HASH_B,
      },
      completed: {
        id: "event:fixture:5",
        runId,
        sequence: 5,
        eventType: "candidate_completed",
        payload: { result: "complete" },
        eventHash: HASH,
      },
    },
    artifact: {
      id: "artifact:fixture:1",
      runId,
      artifactType: "summary",
      schemaVersion: "candidate-analysis-v1",
      payload: { summary: "Candidate-only machine output." },
      payloadHash: HASH,
    },
    assertion: {
      id: assertionId,
      runId,
      assertionType: "claim",
      schemaVersion: "candidate-analysis-v1",
      payload: { proposition: "A reviewable candidate claim." },
      payloadHash: HASH,
      confidence: 0.7,
      machineUse: "candidate_only",
      identityConfidence,
      evidenceLevel: "exact_locator",
      limitations: ["machine_generated"],
      supersededAssertionId: null,
      promotionState: "candidate",
    },
    evidenceLink: {
      id: "evidence:fixture:1",
      assertionId,
      contentUnitId,
      relation: "supports",
      locator: "section:1",
      locatorHash: HASH_B,
      excerptHash: HASH,
    },
  };
}
