import test from "node:test";
import assert from "node:assert/strict";

import {
  candidateAnalysisSha256,
} from "../../src/lib/knowledge/candidate-analysis-contract";
import {
  LibraryAnalysisAgentSegmentResponseSchema,
  deterministicLibraryAnalysisAgentClaimId,
  libraryAnalysisAgentSegmentResponseHash,
  validateLibraryAnalysisAgentSegmentResponse,
  type LibraryAnalysisAgentModelReceipt,
} from "../../src/lib/knowledge/library-analysis-agent-response";
import type {
  LibraryAnalysisAgentQueueUnit,
  LibraryAnalysisVerifiedJob,
} from "../../src/lib/knowledge/library-analysis-agent-queue";

const HASH = "a".repeat(64);
const EXPECTED_MODEL: LibraryAnalysisAgentModelReceipt = {
  provider: "openai-codex",
  name: "gpt-5.6-luna",
  version: "unknown",
};

function unit(id: string, ordinal: number, text: string): LibraryAnalysisAgentQueueUnit {
  return {
    id: `content:library-analysis:${id}`,
    sourceKind: "document",
    sourceKey: "document:fixture",
    populationSourceKey: "document:fixture",
    sourceVersionHash: "b".repeat(64),
    unitType: "document_section",
    ordinal,
    locator: `document:fixture#${ordinal}`,
    locatorHash: "c".repeat(64),
    contentHash: candidateAnalysisSha256("fixture-content", { id, text }),
    hashAlgorithm: "sha256",
    identityConfidence: "exact",
    chunkPolicyHash: "d".repeat(64),
    portablePath: `units/${"e".repeat(64)}.txt`,
    sizeBytes: Buffer.byteLength(text, "utf8"),
    codePoints: [...text].length,
  };
}

function verifiedJob(texts: string[]): LibraryAnalysisVerifiedJob {
  const units = texts.map((text, ordinal) => ({
    descriptor: unit(String(ordinal), ordinal, text),
    text,
  }));
  return {
    job: {
      jobId: "job:library-analysis:fixture",
      sourceKind: "document",
      sourceKey: "document:fixture",
      segmentOrdinal: 0,
      unitIds: units.map(({ descriptor }) => descriptor.id),
      unitOrdinalStart: 0,
      unitOrdinalEnd: Math.max(0, units.length - 1),
      codePoints: units.reduce((sum, { descriptor }) => sum + descriptor.codePoints, 0),
      bytes: units.reduce((sum, { descriptor }) => sum + descriptor.sizeBytes, 0),
      inputEnvelopeHash: HASH,
    },
    units,
  };
}

function segmentResponse(
  job: LibraryAnalysisVerifiedJob,
  overrides: Partial<{
    unitCoverage: unknown[];
    claims: unknown[];
    model: LibraryAnalysisAgentModelReceipt;
    responseHash: string;
  }> = {},
): Record<string, unknown> {
  const response = {
    schema: "library-analysis-agent-segment-response/v1" as const,
    jobId: job.job.jobId,
    jobHash: job.job.inputEnvelopeHash,
    model: EXPECTED_MODEL,
    unitCoverage: job.units.map(({ descriptor }) => ({
      contentUnitId: descriptor.id,
      status: "no_material_claim" as const,
    })),
    claims: [],
    responseHash: HASH,
    ...overrides,
  };
  response.responseHash = overrides.responseHash ?? libraryAnalysisAgentSegmentResponseHash(response);
  return response;
}

function claim(job: LibraryAnalysisVerifiedJob, localOrdinal: number, text: string) {
  const descriptor = job.units[localOrdinal]!.descriptor;
  return {
    localOrdinal,
    assertionType: "claim" as const,
    contentUnitId: descriptor.id,
    text,
    evidence: text,
    locator: descriptor.locator,
    confidence: 0.8,
  };
}

function rehash(response: Record<string, unknown>): Record<string, unknown> {
  return { ...response, responseHash: libraryAnalysisAgentSegmentResponseHash(response) };
}

test("accepts complete coverage and derives claim IDs", () => {
  const job = verifiedJob(["Alpha grew by 12 percent.", "No material claim here."]);
  const response = segmentResponse(job, {
    unitCoverage: [
      { contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" },
      { contentUnitId: job.units[1]!.descriptor.id, status: "no_material_claim" },
    ],
    claims: [claim(job, 0, "Alpha grew by 12 percent.")],
  });
  const accepted = validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    expectedModel: EXPECTED_MODEL,
    job,
    response,
  });
  assert.match(accepted.claims[0]!.claimId, /^claim:library-agent:[a-f0-9]{64}$/u);
  assert.equal(
    accepted.claims[0]!.claimId,
    deterministicLibraryAnalysisAgentClaimId(job.job, accepted.claims[0]!),
  );
});

test("rejects omitted units, foreign locators, fabricated evidence, and hash drift", () => {
  const job = verifiedJob(["verified evidence"]);
  const complete = segmentResponse(job, {
    unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
    claims: [claim(job, 0, "verified evidence")],
  });
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({ queueHash: HASH, expectedModel: EXPECTED_MODEL, job, response: rehash({ ...complete, unitCoverage: [] }) }), /unit_coverage_mismatch/u);
  const completeClaim = (complete.claims as unknown[])[0] as Record<string, unknown>;
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({ queueHash: HASH, expectedModel: EXPECTED_MODEL, job, response: rehash({ ...complete, claims: [{ ...completeClaim, locator: "foreign:locator" },] }) }), /locator_ownership_mismatch/u);
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({ queueHash: HASH, expectedModel: EXPECTED_MODEL, job, response: rehash({ ...complete, claims: [{ ...completeClaim, evidence: "invented" },] }) }), /evidence_not_contained/u);
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({ queueHash: HASH, expectedModel: EXPECTED_MODEL, job, response: { ...complete, responseHash: "0".repeat(64) } }), /response_hash_mismatch/u);
});

test("requires the controller model receipt and never trusts a worker self-report", () => {
  const job = verifiedJob(["Alpha grew by 12 percent."]);
  const response = segmentResponse(job, {
    unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
    claims: [claim(job, 0, "Alpha grew by 12 percent.")],
    model: { provider: "openai-codex", name: "gpt-5.6-sol", version: "unknown" },
  });
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({ queueHash: HASH, expectedModel: EXPECTED_MODEL, job, response }), /model_receipt_mismatch/u);
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({ queueHash: HASH, expectedModel: EXPECTED_MODEL, job, response: { ...response, model: EXPECTED_MODEL } }), /response_hash_mismatch|model_receipt_mismatch/u);
});

test("requires typed blocked coverage and rejects claims without owned numeric evidence", () => {
  const job = verifiedJob(["Revenue was -12% and cost €4.50."]);
  const blocked = segmentResponse(job, {
    unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "blocked" }],
  });
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({ queueHash: HASH, expectedModel: EXPECTED_MODEL, job, response: blocked }), /blocked_reason_required/u);
  const numericDrift = segmentResponse(job, {
    unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
    claims: [{ ...claim(job, 0, "Revenue was 12 percent and cost $4.50."), evidence: "Revenue was -12% and cost €4.50." }],
  });
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({ queueHash: HASH, expectedModel: EXPECTED_MODEL, job, response: numericDrift }), /numeric_token_mismatch/u);
});

test("response schema rejects worker-supplied final claim IDs", () => {
  const job = verifiedJob(["evidence"]);
  const response = segmentResponse(job, {
    claims: [{ ...claim(job, 0, "evidence"), claimId: "claim:forged" }],
    unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
  });
  assert.throws(() => LibraryAnalysisAgentSegmentResponseSchema.parse(response));
});
