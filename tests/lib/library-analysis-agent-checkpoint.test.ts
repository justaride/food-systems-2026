import assert from "node:assert/strict";
import test from "node:test";

import { candidateAnalysisSha256 } from "../../src/lib/knowledge/candidate-analysis-contract";

import {
  buildLibraryAnalysisAgentTerminalReceipt,
  deriveLibraryAnalysisAgentQueueState,
  sanitizeLibraryAnalysisAgentReceipt,
  selectNextLibraryAnalysisAgentJobs,
} from "../../src/lib/knowledge/library-analysis-agent-checkpoint";

const HASH = "a".repeat(64);
const HASH_B = "b".repeat(64);

function queueFixture() {
  return {
    queueId: `library-analysis-agent-queue:${HASH}`,
    queueHash: HASH,
    selectionHash: HASH_B,
    executionPolicy: {
      automatedOnly: true,
      externalReady: false,
      externalApiUsed: false,
      candidateDatabaseWritten: false,
      productionDataMutated: false,
      humanSourceReviewRequired: false,
      maximumAttempts: 3,
      maximumConcurrentAnalyzers: 3,
    },
    sources: [
      { sourceKind: "document", sourceKey: "source:a", sourceEnvelopeHash: "c".repeat(64), unitIds: ["unit:a"] },
      { sourceKind: "document", sourceKey: "source:b", sourceEnvelopeHash: "d".repeat(64), unitIds: ["unit:b"] },
    ],
    units: [{ id: "unit:a" }, { id: "unit:b" }],
    jobs: [
      { jobId: "job:accepted", sourceKind: "document", sourceKey: "source:a", unitIds: ["unit:a"], inputEnvelopeHash: "e".repeat(64) },
      { jobId: "job:invalid", sourceKind: "document", sourceKey: "source:b", unitIds: ["unit:b"], inputEnvelopeHash: "f".repeat(64) },
      { jobId: "job:missing", sourceKind: "document", sourceKey: "source:b", unitIds: ["unit:b"], inputEnvelopeHash: "1".repeat(64) },
    ],
  };
}

function receipt(jobId: string, attempt: number, status: string, inputHash = HASH, responseHash = HASH_B, jobHash = HASH) {
  const attemptRoot = `jobs/${jobId}/attempt-${String(attempt).padStart(3, "0")}`;
  const outputArtifact = status === "accepted" ? {
    portablePath: `${attemptRoot}/accepted.json`, sha256: HASH_B, sizeBytes: 10, mode: 0o400 as const,
  } : undefined;
  return {
    queueHash: HASH,
    jobId,
    jobHash,
    attempt,
    inputHash,
    responseHash,
    status,
    inputArtifact: { portablePath: `${attemptRoot}/input.json`, sha256: HASH, sizeBytes: 10, mode: 0o400 as const },
    responseArtifact: { portablePath: `${attemptRoot}/response.json`, sha256: responseHash, sizeBytes: 10, mode: 0o400 as const },
    ...(outputArtifact === undefined ? {} : { outputHash: responseHash, outputArtifact }),
  };
}

test("resume reuses verified terminal attempts and advances incomplete jobs", () => {
  const state = deriveLibraryAnalysisAgentQueueState({
    queue: queueFixture(),
    attempts: [
      receipt("job:accepted", 1, "accepted", HASH, HASH_B, "e".repeat(64)),
      receipt("job:invalid", 1, "failed", HASH, HASH_B, "f".repeat(64)),
    ],
  });
  assert.deepEqual(state.reusableJobIds, ["job:accepted"]);
  assert.deepEqual(state.nextAttempts, [
    { jobId: "job:invalid", attempt: 2 },
    { jobId: "job:missing", attempt: 1 },
  ]);
});

test("dispatch is deterministic and bounded to three jobs", () => {
  const queue = queueFixture();
  assert.deepEqual(
    selectNextLibraryAnalysisAgentJobs({ queue, attempts: [], limit: 3 }),
    [
      { jobId: "job:accepted", attempt: 1 },
      { jobId: "job:invalid", attempt: 1 },
      { jobId: "job:missing", attempt: 1 },
    ],
  );
  assert.throws(() => selectNextLibraryAnalysisAgentJobs({ queue, attempts: [], limit: 4 }), /agent_queue_dispatch_limit_invalid/);
});

test("attempt reuse requires sealed proof fields and canonical bindings", () => {
  const valid = receipt("job:accepted", 1, "accepted", HASH, HASH_B, "e".repeat(64));
  assert.throws(() => deriveLibraryAnalysisAgentQueueState({
    queue: queueFixture(), attempts: [{ ...valid, inputArtifact: undefined }],
  }), /invalid|expected/iu);
  assert.throws(() => deriveLibraryAnalysisAgentQueueState({
    queue: queueFixture(), attempts: [{ ...valid, queueHash: HASH_B }],
  }), /queue_hash_mismatch/iu);
  assert.throws(() => deriveLibraryAnalysisAgentQueueState({
    queue: queueFixture(), attempts: [{ ...valid, inputArtifact: { ...valid.inputArtifact, portablePath: "jobs/job:accepted/attempt-002/input.json" } }],
  }), /input_path_mismatch/iu);
});

test("terminal receipt requires exact coverage relative to the sealed queue selection", () => {
  const queue = queueFixture();
  assert.throws(
    () => buildLibraryAnalysisAgentTerminalReceipt({
      queue,
      sourceResults: [],
      validationResults: [],
      attempts: [],
      finalMergeHash: HASH,
      privateInventoryHash: HASH_B,
      acceptedArtifacts: [],
      sourceArtifacts: [],
      validationArtifacts: [],
    }),
    /queue_terminal_coverage_mismatch/,
  );
});

test("terminal receipt seals pilot-sized queue coverage without full-corpus constants", () => {
  const queue = queueFixture();
  queue.jobs = queue.jobs.slice(0, 2);
  queue.jobs[1] = { ...queue.jobs[1]!, jobId: "job:b", unitIds: ["unit:b"] };
  const sourceResults = queue.sources.map((source, index) => {
    const job = queue.jobs[index]!;
    const segment = {
      jobId: job.jobId,
      segmentOrdinal: index,
      jobHash: job.inputEnvelopeHash,
      terminalState: "accepted" as const,
      attempts: [{ attempt: 1, inputHash: HASH, responseHash: HASH_B, status: "accepted" as const, model: { provider: "openai-codex" as const, name: "gpt-5.6-luna" as const, version: "v1" } }],
      model: { provider: "openai-codex" as const, name: "gpt-5.6-luna" as const, version: "v1" },
      attempt: 1,
      inputHash: HASH,
      responseHash: HASH_B,
    };
    const core = {
      schema: "library-analysis-source-result/v1" as const,
      queueHash: queue.queueHash,
      sourceEnvelopeHash: source.sourceEnvelopeHash,
      unitCoverage: source.unitIds.map((contentUnitId) => ({ contentUnitId, status: "no_material_claim" as const })),
      claims: [],
      segments: [segment],
      analysisState: "complete" as const,
    };
    return {
      ...core,
      sourceResultHash: candidateAnalysisSha256("library-analysis-source-result", core as never),
    };
  });
  const validationResults = sourceResults.map((sourceResult, index) => {
    const core = {
      schema: "library-analysis-agent-validation-result/v1" as const,
      candidateId: `source:document:${index === 0 ? "source:a" : "source:b"}`,
      automatedOnly: true as const,
      disposition: "candidate_complete" as const,
      machineUse: "reusable_for_ai_context" as const,
      validatorSeparation: "same_model" as const,
      riskFlags: [],
      findings: [],
      limitations: [],
      queueHash: queue.queueHash,
      sourceEnvelopeHash: sourceResult.sourceEnvelopeHash,
      sourceResultHash: sourceResult.sourceResultHash,
      requestHash: HASH,
      analysisState: "complete" as const,
      contentHashStatus: "current" as const,
      locatorStatus: "exact" as const,
      externalReady: false as const,
      externalApiUsed: false as const,
      candidateDatabaseWritten: false as const,
      productionDataMutated: false as const,
      humanSourceReviewRequired: false as const,
    };
    return { ...core, resultHash: candidateAnalysisSha256("library-analysis-agent-validation-result", core as never) };
  });
  const attemptReceipts = queue.jobs.map((job) => receipt(job.jobId, 1, "accepted", HASH, HASH_B, job.inputEnvelopeHash!));
  const acceptedArtifacts = queue.jobs.map((job) => ({
    portablePath: `jobs/${job.jobId}/attempt-001/accepted.json`, sha256: HASH_B, sizeBytes: 10, mode: 0o400 as const,
    outputHash: HASH_B, queueHash: queue.queueHash, jobId: job.jobId, jobHash: job.inputEnvelopeHash!, attempt: 1,
  }));
  const sourceArtifacts = sourceResults.map((sourceResult) => ({
    portablePath: `sources/source-${sourceResult.sourceEnvelopeHash}.json`, sha256: HASH, sizeBytes: 10, mode: 0o400 as const,
    resultHash: sourceResult.sourceResultHash, queueHash: queue.queueHash, sourceEnvelopeHash: sourceResult.sourceEnvelopeHash,
    sourceKind: queue.sources.find((source) => source.sourceEnvelopeHash === sourceResult.sourceEnvelopeHash)!.sourceKind!,
    sourceKey: queue.sources.find((source) => source.sourceEnvelopeHash === sourceResult.sourceEnvelopeHash)!.sourceKey!,
  }));
  const validationArtifacts = validationResults.map((validation) => ({
    portablePath: `validation/source-${validation.sourceEnvelopeHash}/result.json`, sha256: HASH, sizeBytes: 10, mode: 0o400 as const,
    resultHash: validation.resultHash, sourceResultHash: validation.sourceResultHash, queueHash: queue.queueHash, sourceEnvelopeHash: validation.sourceEnvelopeHash,
    sourceKind: queue.sources.find((source) => source.sourceEnvelopeHash === validation.sourceEnvelopeHash)!.sourceKind!,
    sourceKey: queue.sources.find((source) => source.sourceEnvelopeHash === validation.sourceEnvelopeHash)!.sourceKey!,
  }));
  const terminalReceipt = buildLibraryAnalysisAgentTerminalReceipt({
    queue,
    sourceResults,
    validationResults,
    attempts: attemptReceipts,
    finalMergeHash: HASH,
    privateInventoryHash: HASH_B,
    expectedCoverage: { sourceCount: 2, unitCount: 2, jobCount: 2 },
    acceptedArtifacts,
    sourceArtifacts,
    validationArtifacts,
  });
  assert.equal(terminalReceipt.sourceCount, 2);
  assert.equal(terminalReceipt.unitCount, 2);
  assert.equal(terminalReceipt.jobCount, 2);
  assert.equal(terminalReceipt.governance.externalReady, false);
  assert.throws(() => buildLibraryAnalysisAgentTerminalReceipt({
    queue,
    sourceResults: [{ ...sourceResults[0]!, sourceResultHash: HASH } , sourceResults[1]!],
    validationResults,
    attempts: attemptReceipts,
    finalMergeHash: HASH,
    privateInventoryHash: HASH_B,
    acceptedArtifacts,
    sourceArtifacts,
    validationArtifacts,
  }), /source_result_hash_mismatch/);
  assert.throws(() => buildLibraryAnalysisAgentTerminalReceipt({
    queue,
    sourceResults,
    validationResults: [{ ...validationResults[0]!, resultHash: HASH }, validationResults[1]!],
    attempts: attemptReceipts,
    finalMergeHash: HASH,
    privateInventoryHash: HASH_B,
    acceptedArtifacts,
    sourceArtifacts,
    validationArtifacts,
  }), /validation_result_hash_mismatch/);
});

test("terminal receipt rejects missing private readback proof arrays", () => {
  assert.throws(() => buildLibraryAnalysisAgentTerminalReceipt({
    queue: queueFixture(), sourceResults: [], validationResults: [], attempts: [],
    finalMergeHash: HASH, privateInventoryHash: HASH_B,
    // @ts-expect-error intentional proof omission
    acceptedArtifacts: undefined, sourceArtifacts: undefined, validationArtifacts: undefined,
  }), /queue_terminal_coverage_mismatch|queue_terminal/);
});

test("sanitized receipt structurally excludes identifiers, content, and paths", () => {
  const sanitized = sanitizeLibraryAnalysisAgentReceipt({
    schema: "library-analysis-agent-terminal-receipt/v1",
    queueHash: HASH,
    selectionHash: HASH_B,
    sourceKey: "source:a",
    portablePath: "/private/source.txt",
    sourceCount: 2,
    unitCount: 2,
    jobCount: 3,
    claims: [{ text: "private source", evidence: "private source" }],
    nested: { sourceKey: "source:a", path: "/private/source.txt" },
    governance: {
      automatedOnly: true,
      externalReady: false,
      externalApiUsed: false,
      candidateDatabaseWritten: false,
      productionDataMutated: false,
      humanSourceReviewRequired: false,
    },
    state: "queue_terminal",
  });
  const json = JSON.stringify(sanitized);
  assert.doesNotMatch(json, /sourceKey|portablePath|evidence|claims|private source/);
  assert.deepEqual(sanitized, {
    schema: "library-analysis-agent-terminal-receipt/v1",
    queueHash: HASH,
    selectionHash: HASH_B,
    sourceCount: 2,
    unitCount: 2,
    jobCount: 3,
    governance: {
      automatedOnly: true,
      externalReady: false,
      externalApiUsed: false,
      candidateDatabaseWritten: false,
      productionDataMutated: false,
      humanSourceReviewRequired: false,
    },
    state: "queue_terminal",
  });
});
