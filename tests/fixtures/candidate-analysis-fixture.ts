import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import {
  CANDIDATE_ANALYSIS_SCHEMA_VERSION,
  CANDIDATE_OUTPUT_MANIFEST_VERSION,
  CANDIDATE_PROMPT_BINDING,
  CANDIDATE_WORKFLOW_BINDING,
  candidateAnalysisArtifactPayloadHash,
  candidateAnalysisAssertionPayloadHash,
  candidateAnalysisAssertionScopeHash,
  candidateAnalysisConfigHash,
  candidateAnalysisEvidenceLocatorHash,
  candidateAnalysisInputEnvelopeHash,
  candidateAnalysisOutputManifestHash,
  candidateAnalysisRunEventHash,
  candidateAnalysisRunIdempotencyKey,
  type CandidateAnalysisArtifactInput,
  type CandidateAnalysisRunEventInput,
  type CandidateAnalysisRunInput,
  type CandidateAssertionInput,
  type CandidateContentUnitInput,
  type CandidateEvidenceLinkInput,
  type CandidateIdentityConfidence,
  type CandidateOutputManifest,
} from "../../src/lib/knowledge/candidate-analysis-contract";

const HASH = "a".repeat(64);

function repositoryFileHash(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function sealEvent(
  event: Omit<CandidateAnalysisRunEventInput, "eventHash">,
): CandidateAnalysisRunEventInput {
  return {
    ...event,
    eventHash: candidateAnalysisRunEventHash(event),
  } as CandidateAnalysisRunEventInput;
}

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
  const locator = "section:1";
  const locatorHash = candidateAnalysisEvidenceLocatorHash(locator);

  const contentUnit: CandidateContentUnitInput = {
    id: contentUnitId,
    sourceKind: "source",
    sourceKey: "source:fixture:1",
    sourceVersionHash: HASH,
    unitType: "document_section",
    ordinal: 0,
    locator,
    locatorHash,
    contentHash: HASH,
    hashAlgorithm: "sha256",
    identityConfidence,
  };
  const inputs = [{ contentUnitId, position: 0, inputHash: contentUnit.contentHash }];
  const config = { temperature: 0 };
  const workflowHash = repositoryFileHash(CANDIDATE_WORKFLOW_BINDING.path);
  const promptHash = repositoryFileHash(CANDIDATE_PROMPT_BINDING.path);

  const queued = sealEvent({
    id: `event:${runId}:1`,
    runId,
    sequence: 1,
    eventType: "queued",
    payload: {
      namespace: "candidate",
      kind: "run_event",
      data: { reason: "scheduled" },
    },
    supersededEventId: null,
    supersededEventHash: null,
    supersessionScopeHash: null,
  });

  const runBinding = {
    workflowId: CANDIDATE_WORKFLOW_BINDING.id,
    workflowVersion: CANDIDATE_WORKFLOW_BINDING.version,
    workflowPath: CANDIDATE_WORKFLOW_BINDING.path,
    workflowHash,
    promptId: CANDIDATE_PROMPT_BINDING.id,
    promptVersion: CANDIDATE_PROMPT_BINDING.version,
    promptPath: CANDIDATE_PROMPT_BINDING.path,
    promptHash,
    modelProvider: "fixture-provider",
    modelName: "fixture-model",
    modelVersion: "fixture-build",
    configHash: candidateAnalysisConfigHash(config),
    inputEnvelopeHash: candidateAnalysisInputEnvelopeHash(inputs),
    purpose: "candidate analysis fixture",
    outputProfile: "candidate_only",
    attempt: overrides.attempt ?? 1,
    predecessorRunId: overrides.predecessorRunId ?? null,
  };
  const run: CandidateAnalysisRunInput = {
    id: runId,
    ...runBinding,
    config,
    workerId: "worker:fixture:1",
    idempotencyKey:
      overrides.idempotencyKey ?? candidateAnalysisRunIdempotencyKey(runBinding),
    inputs,
    initialEvent: queued,
  };

  const artifactPayload = {
    namespace: "candidate",
    kind: "artifact",
    data: { summary: "Candidate-only machine output." },
  } as const;
  const artifact: CandidateAnalysisArtifactInput = {
    id: "artifact:fixture:1",
    runId,
    artifactType: "summary",
    schemaVersion: CANDIDATE_ANALYSIS_SCHEMA_VERSION,
    payload: artifactPayload,
    payloadHash: candidateAnalysisArtifactPayloadHash(artifactPayload),
  };

  const assertionPayload = {
    namespace: "candidate",
    kind: "assertion",
    data: { proposition: "A reviewable candidate claim." },
  } as const;
  const assertion: CandidateAssertionInput = {
    id: assertionId,
    runId,
    assertionType: "claim",
    schemaVersion: CANDIDATE_ANALYSIS_SCHEMA_VERSION,
    payload: assertionPayload,
    payloadHash: candidateAnalysisAssertionPayloadHash(assertionPayload),
    confidence: 0.7,
    machineUse: "candidate_only",
    identityConfidence,
    evidenceLevel: "exact_locator",
    limitations: ["machine_generated"],
    scopeKey: "claim:fixture:1",
    scopeHash: candidateAnalysisAssertionScopeHash("claim:fixture:1"),
    supersededAssertionId: null,
    supersededAssertionPayloadHash: null,
    promotionState: "candidate",
  };

  const evidenceLink: CandidateEvidenceLinkInput = {
    id: "evidence:fixture:1",
    assertionId,
    contentUnitId,
    relation: "supports",
    locator,
    locatorHash,
    excerptHash: HASH,
  };

  const manifest: CandidateOutputManifest = {
    schemaVersion: CANDIDATE_OUTPUT_MANIFEST_VERSION,
    inputs: [
      {
        contentUnitId,
        position: 0,
        contentHash: contentUnit.contentHash,
        identityConfidence,
      },
    ],
    artifacts: [
      {
        id: artifact.id,
        artifactType: artifact.artifactType,
        schemaVersion: artifact.schemaVersion,
        payloadHash: artifact.payloadHash,
      },
    ],
    assertions: [
      {
        id: assertion.id,
        assertionType: assertion.assertionType,
        schemaVersion: assertion.schemaVersion,
        payloadHash: assertion.payloadHash,
        confidence: assertion.confidence,
        machineUse: assertion.machineUse,
        identityConfidence,
        evidenceLevel: assertion.evidenceLevel,
        limitations: assertion.limitations,
        scopeKey: assertion.scopeKey,
        scopeHash: assertion.scopeHash,
        supersededAssertionId: assertion.supersededAssertionId,
        supersededAssertionPayloadHash:
          assertion.supersededAssertionPayloadHash,
      },
    ],
    evidenceLinks: [
      {
        id: evidenceLink.id,
        assertionId,
        contentUnitId,
        relation: evidenceLink.relation,
        locatorHash,
        excerptHash: evidenceLink.excerptHash,
      },
    ],
    dependencies: [],
    reconciliationSnapshots: [],
  };

  const started = sealEvent({
    id: `event:${runId}:2`,
    runId,
    sequence: 2,
    eventType: "started",
    payload: {
      namespace: "candidate",
      kind: "run_event",
      data: { workerId: "worker:fixture:1" },
    },
    supersededEventId: null,
    supersededEventHash: null,
    supersessionScopeHash: null,
  });
  const checkpoint1 = sealEvent({
    id: `event:${runId}:3`,
    runId,
    sequence: 3,
    eventType: "checkpoint",
    payload: {
      namespace: "candidate",
      kind: "run_event",
      data: { checkpoint: 1 },
    },
    supersededEventId: null,
    supersededEventHash: null,
    supersessionScopeHash: null,
  });
  const checkpoint2 = sealEvent({
    id: `event:${runId}:4`,
    runId,
    sequence: 4,
    eventType: "checkpoint",
    payload: {
      namespace: "candidate",
      kind: "run_event",
      data: { checkpoint: 2 },
    },
    supersededEventId: null,
    supersededEventHash: null,
    supersessionScopeHash: null,
  });
  const completed = sealEvent({
    id: `event:${runId}:5`,
    runId,
    sequence: 5,
    eventType: "candidate_completed",
    payload: {
      namespace: "candidate",
      kind: "run_terminal",
      data: {
        manifest,
        manifestHash: candidateAnalysisOutputManifestHash(manifest),
      },
    },
    supersededEventId: null,
    supersededEventHash: null,
    supersessionScopeHash: null,
  });

  return {
    contentUnit,
    run,
    events: { queued, started, checkpoint1, checkpoint2, completed },
    artifact,
    assertion,
    evidenceLink,
  };
}
