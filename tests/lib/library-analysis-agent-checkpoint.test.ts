import assert from "node:assert/strict";
import test from "node:test";

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
  return {
    queueHash: HASH,
    jobId,
    jobHash,
    attempt,
    inputHash,
    responseHash,
    status,
    verified: true,
    sealed: true,
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
    }),
    /queue_terminal_coverage_mismatch/,
  );
});

test("terminal receipt seals pilot-sized queue coverage without full-corpus constants", () => {
  const queue = queueFixture();
  queue.jobs = queue.jobs.slice(0, 2);
  queue.jobs[1] = { ...queue.jobs[1]!, jobId: "job:b", unitIds: ["unit:b"] };
  const sourceResults = queue.sources.map((source, index) => ({
    schema: "library-analysis-source-result/v1",
    queueHash: queue.queueHash,
    sourceEnvelopeHash: source.sourceEnvelopeHash,
    sourceResultHash: `${String.fromCharCode(99 + index)}`.repeat(64),
    unitCoverage: source.unitIds.map((contentUnitId) => ({ contentUnitId })),
    segments: [{
      jobId: queue.jobs[index]!.jobId,
      jobHash: queue.jobs[index]!.inputEnvelopeHash,
      terminalState: "accepted",
    }],
  }));
  const validationResults = sourceResults.map((sourceResult, index) => ({
    queueHash: queue.queueHash,
    sourceEnvelopeHash: sourceResult.sourceEnvelopeHash,
    sourceResultHash: sourceResult.sourceResultHash,
    resultHash: `${String.fromCharCode(101 + index)}`.repeat(64),
  }));
  const receipt = buildLibraryAnalysisAgentTerminalReceipt({
    queue,
    sourceResults,
    validationResults,
    attempts: queue.jobs.map((job) => receiptForJob(job.jobId, job.inputEnvelopeHash!)),
    finalMergeHash: HASH,
    privateInventoryHash: HASH_B,
    expectedCoverage: { sourceCount: 2, unitCount: 2, jobCount: 2 },
  });
  assert.equal(receipt.sourceCount, 2);
  assert.equal(receipt.unitCount, 2);
  assert.equal(receipt.jobCount, 2);
  assert.equal(receipt.governance.externalReady, false);
});

function receiptForJob(jobId: string, jobHash: string) {
  return {
    queueHash: HASH,
    jobId,
    jobHash,
    attempt: 1,
    inputHash: HASH,
    responseHash: HASH_B,
    status: "accepted",
    verified: true,
    sealed: true,
  };
}

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
