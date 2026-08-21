import { z } from "zod";

import {
  CANDIDATE_ASSERTION_TYPES,
  canonicalCandidateJson,
  candidateAnalysisSha256,
  type CandidateJsonValue,
} from "./candidate-analysis-contract";
import type {
  LibraryAnalysisAgentQueueJob,
  LibraryAnalysisVerifiedJob,
} from "./library-analysis-agent-queue";

const HASH = /^[a-f0-9]{64}$/u;
const hashSchema = z.string().regex(HASH);
const idSchema = z.string().regex(/^[a-z0-9][a-z0-9._:-]*$/u);
const textSchema = z.string().min(1);

export const LIBRARY_ANALYSIS_AGENT_SEGMENT_RESPONSE_SCHEMA =
  "library-analysis-agent-segment-response/v1" as const;

export const LibraryAnalysisAgentModelReceiptSchema = z.object({
  provider: z.literal("openai-codex"),
  name: textSchema,
  version: textSchema,
}).strict();
export type LibraryAnalysisAgentModelReceipt = z.infer<
  typeof LibraryAnalysisAgentModelReceiptSchema
>;

const coverageStatusSchema = z.enum([
  "claims_extracted",
  "no_material_claim",
  "blocked",
]);

const coverageSchema = z.object({
  contentUnitId: idSchema,
  status: coverageStatusSchema,
  reason: textSchema.optional(),
  reasonCode: idSchema.optional(),
}).strict();

const responseClaimSchema = z.object({
  localOrdinal: z.number().int().nonnegative(),
  assertionType: z.enum(CANDIDATE_ASSERTION_TYPES),
  contentUnitId: idSchema,
  text: textSchema,
  evidence: textSchema,
  locator: textSchema,
  confidence: z.number().min(0).max(1).nullable(),
}).strict();

const responseCoreSchema = z.object({
  schema: z.literal(LIBRARY_ANALYSIS_AGENT_SEGMENT_RESPONSE_SCHEMA),
  jobId: idSchema,
  jobHash: hashSchema,
  model: LibraryAnalysisAgentModelReceiptSchema,
  unitCoverage: z.array(coverageSchema),
  claims: z.array(responseClaimSchema),
}).strict();

export const LibraryAnalysisAgentSegmentResponseSchema = responseCoreSchema
  .extend({ responseHash: hashSchema })
  .superRefine((response, context) => {
    const coverageIds = response.unitCoverage.map(({ contentUnitId }) => contentUnitId);
    if (new Set(coverageIds).size !== coverageIds.length) {
      context.addIssue({ code: "custom", message: "duplicate_unit_coverage" });
    }
    const localOrdinals = response.claims.map(({ localOrdinal }) => localOrdinal);
    if (new Set(localOrdinals).size !== localOrdinals.length) {
      context.addIssue({ code: "custom", message: "duplicate_claim_local_ordinal" });
    }
    for (const coverage of response.unitCoverage) {
      const hasReason = coverage.reason !== undefined || coverage.reasonCode !== undefined;
      if (coverage.status === "blocked" && !hasReason) {
        context.addIssue({ code: "custom", message: "blocked_reason_required" });
      }
    }
    const claimUnitIds = new Set(response.claims.map(({ contentUnitId }) => contentUnitId));
    for (const coverage of response.unitCoverage) {
      if (coverage.status === "claims_extracted" && !claimUnitIds.has(coverage.contentUnitId)) {
        context.addIssue({ code: "custom", message: "claims_extracted_requires_claim" });
      }
    }
  });
export type LibraryAnalysisAgentSegmentResponse = z.infer<
  typeof LibraryAnalysisAgentSegmentResponseSchema
>;

const acceptedClaimSchema = responseClaimSchema.extend({
  claimId: idSchema,
});

export const LibraryAnalysisAcceptedSegmentSchema = responseCoreSchema
  .extend({
    claims: z.array(acceptedClaimSchema),
    responseHash: hashSchema,
  });
export type LibraryAnalysisAcceptedSegment = z.infer<
  typeof LibraryAnalysisAcceptedSegmentSchema
>;

const queueJobSchema = z.object({
  jobId: idSchema,
  sourceKind: idSchema,
  sourceKey: textSchema,
  segmentOrdinal: z.number().int().nonnegative(),
  unitIds: z.array(idSchema).min(1),
  unitOrdinalStart: z.number().int().nonnegative(),
  unitOrdinalEnd: z.number().int().nonnegative(),
  codePoints: z.number().int().positive(),
  bytes: z.number().int().positive(),
  inputEnvelopeHash: hashSchema,
}).strict();

const attemptUnitSchema = z.object({
  id: idSchema,
  sourceKind: idSchema,
  sourceKey: idSchema,
  populationSourceKey: textSchema,
  sourceVersionHash: hashSchema,
  unitType: z.string().min(1),
  ordinal: z.number().int().nonnegative(),
  locator: textSchema,
  locatorHash: hashSchema,
  contentHash: hashSchema,
  hashAlgorithm: z.literal("sha256"),
  identityConfidence: z.string().min(1),
  chunkPolicyHash: hashSchema,
  portablePath: textSchema,
  sizeBytes: z.number().int().positive(),
  codePoints: z.number().int().positive(),
  text: textSchema,
}).strict();

const fileBindingSchema = z.object({
  id: idSchema,
  version: textSchema,
  path: textSchema,
  hash: hashSchema,
}).strict();

export const LibraryAnalysisAgentAttemptInputSchema = z.object({
  schema: z.literal("library-analysis-agent-job-input/v1"),
  queueId: idSchema,
  queueHash: hashSchema,
  jobId: idSchema,
  attempt: z.number().int().positive(),
  expectedModel: LibraryAnalysisAgentModelReceiptSchema,
  job: queueJobSchema,
  executionPolicy: z.record(z.string(), z.unknown()),
  workflow: fileBindingSchema,
  analysisPrompt: fileBindingSchema,
  validationWorkflow: fileBindingSchema,
  validationPrompt: fileBindingSchema,
  units: z.array(attemptUnitSchema).min(1),
  inputHash: hashSchema,
}).strict();
export type LibraryAnalysisAgentAttemptInput = z.infer<
  typeof LibraryAnalysisAgentAttemptInputSchema
>;

export type LibraryAnalysisAgentSegmentResponseValidationInput = {
  queueHash: string;
  expectedModel: LibraryAnalysisAgentModelReceipt;
  job: LibraryAnalysisVerifiedJob;
  response: unknown;
};

export function libraryAnalysisAgentSegmentResponseHash(response: unknown): string {
  if (response === null || typeof response !== "object" || Array.isArray(response)) {
    throw new Error("agent_response_shape_invalid");
  }
  const { responseHash: _responseHash, ...core } = response as Record<string, unknown>;
  return candidateAnalysisSha256(
    "library-analysis-agent-segment-response",
    core as CandidateJsonValue,
  );
}

export function validateLibraryAnalysisAgentSegmentResponse(
  input: LibraryAnalysisAgentSegmentResponseValidationInput,
): LibraryAnalysisAcceptedSegment {
  const expectedModel = LibraryAnalysisAgentModelReceiptSchema.parse(input.expectedModel);
  if (!HASH.test(input.queueHash)) throw new Error("agent_response_queue_hash_invalid");
  const response = LibraryAnalysisAgentSegmentResponseSchema.parse(input.response);
  if (response.responseHash !== libraryAnalysisAgentSegmentResponseHash(response)) {
    throw new Error("agent_response_response_hash_mismatch");
  }
  if (response.jobId !== input.job.job.jobId || response.jobHash !== input.job.job.inputEnvelopeHash) {
    throw new Error("agent_response_job_binding_mismatch");
  }
  if (
    response.model.provider !== expectedModel.provider ||
    response.model.name !== expectedModel.name ||
    response.model.version !== expectedModel.version
  ) {
    throw new Error("agent_response_model_receipt_mismatch");
  }
  assertExactCoverage(input.job, response.unitCoverage);
  const coverageByUnit = new Map(response.unitCoverage.map((coverage) => [coverage.contentUnitId, coverage]));
  const claims = response.claims.map((claim) => {
    const unit = ownedUnit(input.job, claim.contentUnitId);
    const coverage = coverageByUnit.get(claim.contentUnitId);
    if (coverage?.status !== "claims_extracted") {
      throw new Error("agent_response_claim_coverage_mismatch");
    }
    if (claim.locator !== unit.descriptor.locator) {
      throw new Error("agent_response_locator_ownership_mismatch");
    }
    if (!unit.text.includes(claim.evidence)) {
      throw new Error("agent_response_evidence_not_contained");
    }
    assertNumericTokens(claim.text, claim.evidence);
    return {
      ...claim,
      claimId: deterministicLibraryAnalysisAgentClaimId(input.job.job, claim),
    };
  });
  return LibraryAnalysisAcceptedSegmentSchema.parse({ ...response, claims });
}

export function deterministicLibraryAnalysisAgentClaimId(
  job: LibraryAnalysisAgentQueueJob,
  claim: { contentUnitId: string; localOrdinal: number },
): string {
  const digest = candidateAnalysisSha256("library-analysis-agent-claim", {
    jobId: job.jobId,
    jobHash: job.inputEnvelopeHash,
    sourceKind: job.sourceKind,
    sourceKey: job.sourceKey,
    contentUnitId: claim.contentUnitId,
    localOrdinal: claim.localOrdinal,
  });
  return `claim:library-agent:${digest}`;
}

export const deterministicClaimId = deterministicLibraryAnalysisAgentClaimId;

function assertExactCoverage(
  job: LibraryAnalysisVerifiedJob,
  coverage: readonly z.infer<typeof coverageSchema>[],
): void {
  const expected = job.units.map(({ descriptor }) => descriptor.id);
  const actual = coverage.map(({ contentUnitId }) => contentUnitId);
  if (
    actual.length !== expected.length ||
    new Set(actual).size !== actual.length ||
    expected.some((id) => !actual.includes(id))
  ) {
    throw new Error("agent_response_unit_coverage_mismatch");
  }
}

function ownedUnit(
  job: LibraryAnalysisVerifiedJob,
  contentUnitId: string,
): LibraryAnalysisVerifiedJob["units"][number] {
  const unit = job.units.find(({ descriptor }) => descriptor.id === contentUnitId);
  if (unit === undefined) throw new Error("agent_response_content_unit_ownership_mismatch");
  return unit;
}

type NumericToken = {
  value: string;
  sign: "negative" | "positive" | "unsigned";
  marker: "percent" | "currency" | "none";
};

function assertNumericTokens(claimText: string, evidence: string): void {
  const claimed = numericTokens(claimText);
  const available = numericTokens(evidence);
  const remaining = [...available];
  for (const token of claimed) {
    const index = remaining.findIndex((candidate) =>
      candidate.value === token.value &&
      candidate.sign === token.sign &&
      (token.marker === "none" || candidate.marker === token.marker));
    if (index < 0) throw new Error("agent_response_numeric_token_mismatch");
    remaining.splice(index, 1);
  }
}

function numericTokens(text: string): NumericToken[] {
  const tokens: NumericToken[] = [];
  const pattern = /[+\-−]?\d+(?:[.,]\d+)?/gu;
  for (const match of text.matchAll(pattern)) {
    const raw = match[0]!;
    const start = match.index ?? 0;
    const context = text.slice(Math.max(0, start - 16), Math.min(text.length, start + raw.length + 16));
    const sign = raw.startsWith("-") || raw.startsWith("−")
      ? "negative"
      : raw.startsWith("+") ? "positive" : "unsigned";
    const marker = /(?:%|percent(?:age)?|prosent)/iu.test(context)
      ? "percent"
      : /(?:[$€£]|\b(?:kr|nok|usd|eur|gbp)\b)/iu.test(context)
        ? "currency"
        : "none";
    tokens.push({ value: normalizeNumber(raw), sign, marker });
  }
  return tokens;
}

function normalizeNumber(raw: string): string {
  const unsigned = raw.replace(/^[+\-−]/u, "").replaceAll(" ", "");
  if (unsigned.includes(",") && unsigned.includes(".")) {
    return unsigned.replaceAll(",", "");
  }
  if (unsigned.includes(",")) {
    const [whole, fraction] = unsigned.split(",");
    return fraction !== undefined && fraction.length === 3
      ? `${whole}${fraction}`
      : `${whole}.${fraction ?? ""}`;
  }
  return unsigned;
}

export function canonicalLibraryAnalysisAgentSegmentResponse(
  response: LibraryAnalysisAgentSegmentResponse,
): string {
  return canonicalCandidateJson(response as unknown as CandidateJsonValue);
}
