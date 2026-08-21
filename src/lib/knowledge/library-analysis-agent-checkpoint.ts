import { z } from "zod";

import {
  type LibraryAnalysisSourceResult,
} from "./library-analysis-agent-response";
import type { LibraryAnalysisAgentQueue } from "./library-analysis-agent-queue";

const HASH = /^[a-f0-9]{64}$/u;
const ID = /^[a-z0-9][a-z0-9._:-]*$/u;
const hashSchema = z.string().regex(HASH);
const idSchema = z.string().regex(ID);

export const LIBRARY_ANALYSIS_AGENT_TERMINAL_RECEIPT_SCHEMA =
  "library-analysis-agent-terminal-receipt/v1" as const;

const modelSchema = z.object({
  provider: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
}).strict();

const artifactSchema = z.object({
  sha256: hashSchema,
  sizeBytes: z.number().int().nonnegative(),
  mode: z.union([z.literal(0o400), z.literal(0o600)]).optional(),
}).strict();

/** A receipt is a small, immutable statement about one sealed attempt. */
export const LibraryAnalysisAgentAttemptReceiptSchema = z.object({
  queueHash: hashSchema.optional(),
  jobId: idSchema.optional(),
  jobHash: hashSchema.optional(),
  attempt: z.number().int().min(1).max(3),
  inputHash: hashSchema.optional(),
  responseHash: hashSchema.optional(),
  status: z.enum(["accepted", "partial", "failed", "quarantined", "invalid", "missing"]).optional(),
  terminalState: z.enum(["accepted", "partial", "failed", "quarantined"]).optional(),
  terminalReason: z.string().min(1).optional(),
  model: modelSchema.optional(),
  verified: z.boolean().optional(),
  sealed: z.boolean().optional(),
  inputArtifact: artifactSchema.optional(),
  responseArtifact: artifactSchema.optional(),
}).strict().superRefine((value, context) => {
  if (value.status !== undefined && value.terminalState !== undefined &&
      value.status !== value.terminalState) {
    context.addIssue({ code: "custom", message: "attempt_state_conflict" });
  }
});
export type LibraryAnalysisAgentCheckpointAttemptReceipt = z.infer<
  typeof LibraryAnalysisAgentAttemptReceiptSchema
>;

const governanceSchema = z.object({
  automatedOnly: z.literal(true),
  externalReady: z.literal(false),
  externalApiUsed: z.literal(false),
  candidateDatabaseWritten: z.literal(false),
  productionDataMutated: z.literal(false),
  humanSourceReviewRequired: z.literal(false),
}).strict();
export type LibraryAnalysisAgentGovernance = z.infer<typeof governanceSchema>;

const terminalReceiptSchema = z.object({
  schema: z.literal(LIBRARY_ANALYSIS_AGENT_TERMINAL_RECEIPT_SCHEMA),
  queueId: idSchema.optional(),
  queueHash: hashSchema,
  selectionHash: hashSchema.optional(),
  sourceCount: z.number().int().nonnegative(),
  unitCount: z.number().int().nonnegative(),
  jobCount: z.number().int().nonnegative(),
  sourceResultHashes: z.array(hashSchema),
  validationResultHashes: z.array(hashSchema),
  acceptedAttemptReceipts: z.array(LibraryAnalysisAgentAttemptReceiptSchema),
  finalMergeHash: hashSchema,
  privateInventoryHash: hashSchema,
  inventoryHash: hashSchema,
  state: z.literal("queue_terminal"),
  governance: governanceSchema,
  executionPolicy: z.record(z.string(), z.unknown()).optional(),
}).strict();
export const LibraryAnalysisAgentTerminalReceiptSchema = terminalReceiptSchema;
export type LibraryAnalysisAgentTerminalReceipt = z.infer<typeof terminalReceiptSchema>;

type QueueSource = {
  sourceKind?: string;
  sourceKey?: string;
  sourceEnvelopeHash?: string;
  unitIds: readonly string[];
};
type QueueJob = {
  jobId: string;
  sourceKind?: string;
  sourceKey?: string;
  unitIds: readonly string[];
  inputEnvelopeHash?: string;
};
type QueueLike = {
  queueId?: string;
  queueHash: string;
  selectionHash?: string;
  sources: readonly QueueSource[];
  units: readonly { id: string }[];
  jobs: readonly QueueJob[];
  executionPolicy?: Record<string, unknown>;
};

export type LibraryAnalysisAgentQueueState = {
  state: "pending" | "analysis_terminal" | "queue_terminal";
  reusableJobIds: string[];
  nextAttempts: Array<{ jobId: string; attempt: 1 | 2 | 3 }>;
  terminalJobIds: string[];
  quarantinedJobIds: string[];
  invalidAttempts: number;
};

export type DeriveQueueStateInput = {
  queue: LibraryAnalysisAgentQueue | QueueLike;
  attempts: readonly unknown[];
};

type NormalizedAttempt = LibraryAnalysisAgentCheckpointAttemptReceipt & { jobId: string };

function utf8Compare(left: string, right: string): number {
  return Buffer.from(left, "utf8").compare(Buffer.from(right, "utf8"));
}

function asQueue(input: unknown): QueueLike {
  if (input === null || typeof input !== "object") throw new Error("agent_queue_state_input_invalid");
  const queue = input as Partial<QueueLike>;
  if (!HASH.test(queue.queueHash ?? "") || !Array.isArray(queue.sources) ||
      !Array.isArray(queue.units) || !Array.isArray(queue.jobs)) {
    throw new Error("agent_queue_state_input_invalid");
  }
  return queue as QueueLike;
}

function normalizeAttempt(raw: unknown, queue: QueueLike): NormalizedAttempt {
  const parsed = LibraryAnalysisAgentAttemptReceiptSchema.parse(raw);
  if (parsed.jobId === undefined) throw new Error("agent_queue_attempt_job_binding_missing");
  if (parsed.queueHash !== undefined && parsed.queueHash !== queue.queueHash) {
    throw new Error("agent_queue_attempt_queue_hash_mismatch");
  }
  if (parsed.verified === false || parsed.sealed === false) {
    return { ...parsed, jobId: parsed.jobId, status: "invalid" };
  }
  const job = queue.jobs.find((candidate) => candidate.jobId === parsed.jobId);
  if (job === undefined) throw new Error("agent_queue_attempt_job_not_found");
  if (parsed.jobHash !== undefined && job.inputEnvelopeHash !== undefined && parsed.jobHash !== job.inputEnvelopeHash) {
    throw new Error("agent_queue_attempt_job_hash_mismatch");
  }
  if (parsed.inputHash === undefined || parsed.responseHash === undefined) {
    return { ...parsed, jobId: parsed.jobId, status: "invalid" };
  }
  const status = parsed.status ?? parsed.terminalState;
  return { ...parsed, jobId: parsed.jobId, status: status ?? "invalid" };
}

function normalizeAttempts(input: DeriveQueueStateInput): Map<string, NormalizedAttempt[]> {
  const queue = asQueue(input.queue);
  const byJob = new Map<string, NormalizedAttempt[]>();
  for (const raw of input.attempts) {
    const receipt = normalizeAttempt(raw, queue);
    const list = byJob.get(receipt.jobId) ?? [];
    if (list.some((candidate) => candidate.attempt === receipt.attempt)) {
      const prior = list.find((candidate) => candidate.attempt === receipt.attempt)!;
      if (JSON.stringify(prior) !== JSON.stringify(receipt)) {
        throw new Error("agent_queue_attempt_conflict");
      }
      throw new Error("agent_queue_attempt_duplicate");
    }
    list.push(receipt);
    byJob.set(receipt.jobId, list);
  }
  for (const list of byJob.values()) {
    list.sort((left, right) => left.attempt - right.attempt);
    for (let index = 0; index < list.length; index += 1) {
      if (list[index]!.attempt !== index + 1) throw new Error("agent_queue_attempt_gap");
      if (index < list.length - 1 &&
          (list[index]!.status === "accepted" || list[index]!.status === "partial" || list[index]!.status === "quarantined")) {
        throw new Error("agent_queue_attempt_after_terminal");
      }
    }
  }
  return byJob;
}

function finalStatus(receipts: readonly NormalizedAttempt[]): "accepted" | "partial" | "quarantined" | "pending" {
  if (receipts.length === 0) return "pending";
  const last = receipts[receipts.length - 1]!;
  if (last.status === "accepted" || last.status === "partial") return last.status;
  if (last.status === "quarantined" || last.attempt >= 3) return "quarantined";
  return "pending";
}

export function deriveLibraryAnalysisAgentQueueState(
  input: DeriveQueueStateInput,
): LibraryAnalysisAgentQueueState {
  const queue = asQueue(input.queue);
  const byJob = normalizeAttempts(input);
  const reusableJobIds: string[] = [];
  const nextAttempts: Array<{ jobId: string; attempt: 1 | 2 | 3 }> = [];
  const terminalJobIds: string[] = [];
  const quarantinedJobIds: string[] = [];
  let invalidAttempts = 0;
  for (const job of [...queue.jobs].sort((left, right) => utf8Compare(left.jobId, right.jobId))) {
    const receipts = byJob.get(job.jobId) ?? [];
    invalidAttempts += receipts.filter((receipt) => receipt.status === "invalid" || receipt.status === "missing").length;
    const status = finalStatus(receipts);
    if (status === "accepted" || status === "partial") reusableJobIds.push(job.jobId);
    if (status === "quarantined") {
      terminalJobIds.push(job.jobId);
      quarantinedJobIds.push(job.jobId);
      continue;
    }
    if (status === "accepted" || status === "partial") {
      terminalJobIds.push(job.jobId);
      continue;
    }
    const attempt = ((receipts[receipts.length - 1]?.attempt ?? 0) + 1) as 1 | 2 | 3;
    if (attempt > 3) {
      terminalJobIds.push(job.jobId);
      quarantinedJobIds.push(job.jobId);
    } else {
      nextAttempts.push({ jobId: job.jobId, attempt });
    }
  }
  const state = terminalJobIds.length === queue.jobs.length ? "analysis_terminal" : "pending";
  return { state, reusableJobIds, nextAttempts, terminalJobIds, quarantinedJobIds, invalidAttempts };
}

export function selectNextLibraryAnalysisAgentJobs(input: {
  queue: LibraryAnalysisAgentQueue | QueueLike;
  attempts: readonly unknown[];
  limit: number;
}): Array<{ jobId: string; attempt: 1 | 2 | 3 }> {
  if (!Number.isSafeInteger(input.limit) || input.limit < 1 || input.limit > 3) {
    throw new Error("agent_queue_dispatch_limit_invalid");
  }
  return deriveLibraryAnalysisAgentQueueState(input).nextAttempts
    .sort((left, right) => utf8Compare(left.jobId, right.jobId))
    .slice(0, input.limit);
}

type SourceResultLike = Partial<LibraryAnalysisSourceResult> & {
  sourceEnvelopeHash?: string;
  sourceResultHash?: string;
  queueHash?: string;
  unitCoverage?: readonly { contentUnitId: string }[];
  segments?: ReadonlyArray<{
    jobId: string;
    jobHash?: string;
    terminalState?: string;
    status?: string;
    unitCoverage?: readonly { contentUnitId: string }[];
    attempts?: readonly unknown[];
  }>;
};
type ValidationResultLike = {
  queueHash?: string;
  sourceEnvelopeHash?: string;
  sourceResultHash?: string;
  resultHash?: string;
  analysisState?: string;
  disposition?: string;
};

export type BuildTerminalReceiptInput = {
  queue: LibraryAnalysisAgentQueue | QueueLike;
  attempts: readonly unknown[];
  sourceResults: readonly unknown[];
  validationResults: readonly unknown[];
  finalMergeHash: string;
  privateInventoryHash: string;
  privateAudit?: { inventoryHash: string; files?: number; directories?: number; totalBytes?: number };
  acceptedArtifacts?: readonly { jobId: string; attempt: number; sha256: string; sizeBytes: number; mode?: number }[];
  expectedCoverage?: { sourceCount?: number; unitCount?: number; jobCount?: number };
};

function coverageMismatch(): never { throw new Error("queue_terminal_coverage_mismatch"); }

function exactIds(values: readonly string[]): boolean {
  return new Set(values).size === values.length;
}

function sourceKey(source: QueueSource): string {
  return `${source.sourceKind ?? ""}\u0000${source.sourceKey ?? ""}`;
}

function validateQueueCoverage(queue: QueueLike): void {
  const sourceUnits = queue.sources.flatMap((source) => source.unitIds);
  if (!exactIds(sourceUnits) || sourceUnits.length !== queue.units.length ||
      queue.units.some((unit) => !sourceUnits.includes(unit.id))) coverageMismatch();
  const jobUnits = queue.jobs.flatMap((job) => job.unitIds);
  if (!exactIds(jobUnits) || jobUnits.length !== sourceUnits.length ||
      jobUnits.some((id) => !sourceUnits.includes(id))) coverageMismatch();
  if (queue.jobs.some((job) => job.unitIds.length === 0 ||
      !queue.sources.some((source) => sourceKey(source) === `${job.sourceKind ?? ""}\u0000${job.sourceKey ?? ""}`))) coverageMismatch();
  if (!exactIds(queue.jobs.map((job) => job.jobId))) coverageMismatch();
}

function assertTerminalState(value: string | undefined): void {
  if (value !== "accepted" && value !== "partial" && value !== "failed" && value !== "quarantined") {
    throw new Error("queue_terminal_analysis_nonterminal");
  }
}

export function buildLibraryAnalysisAgentTerminalReceipt(
  input: BuildTerminalReceiptInput,
): LibraryAnalysisAgentTerminalReceipt {
  const queue = asQueue(input.queue);
  if (!HASH.test(input.finalMergeHash) || !HASH.test(input.privateInventoryHash)) {
    throw new Error("queue_terminal_hash_invalid");
  }
  if (input.privateAudit !== undefined && input.privateAudit.inventoryHash !== input.privateInventoryHash) {
    throw new Error("queue_terminal_inventory_hash_mismatch");
  }
  validateQueueCoverage(queue);
  const expected = input.expectedCoverage ?? {};
  if ((expected.sourceCount ?? queue.sources.length) !== queue.sources.length ||
      (expected.unitCount ?? queue.units.length) !== queue.units.length ||
      (expected.jobCount ?? queue.jobs.length) !== queue.jobs.length) coverageMismatch();
  const sourceByEnvelope = new Map(queue.sources.map((source) => [source.sourceEnvelopeHash, source]));
  const sourceResults = input.sourceResults.map((raw) => raw as SourceResultLike);
  if (sourceResults.length !== queue.sources.length ||
      sourceResults.some((result) => result.queueHash !== undefined && result.queueHash !== queue.queueHash)) coverageMismatch();
  const sourceResultHashes: string[] = [];
  const sourceSeen = new Set<string>();
  for (const result of sourceResults) {
    if (!HASH.test(result.sourceEnvelopeHash ?? "") || !HASH.test(result.sourceResultHash ?? "") ||
        sourceSeen.has(result.sourceEnvelopeHash!)) coverageMismatch();
    const source = sourceByEnvelope.get(result.sourceEnvelopeHash);
    if (source === undefined) coverageMismatch();
    sourceSeen.add(result.sourceEnvelopeHash!);
    const coverage = result.unitCoverage?.map((row) => row.contentUnitId) ?? [];
    if (coverage.length !== source.unitIds.length || new Set(coverage).size !== coverage.length ||
        source.unitIds.some((id) => !coverage.includes(id))) coverageMismatch();
    const jobs = queue.jobs.filter((job) => sourceKey(job) === sourceKey(source));
    const segments = result.segments ?? [];
    if (segments.length !== jobs.length) coverageMismatch();
    const segmentJobs = new Set<string>();
    for (const segment of segments) {
      const job = jobs.find((candidate) => candidate.jobId === segment.jobId);
      if (job === undefined || segmentJobs.has(segment.jobId)) coverageMismatch();
      if (segment.jobHash !== undefined && segment.jobHash !== job.inputEnvelopeHash) coverageMismatch();
      // Task 4 source-result segment receipts intentionally carry the job's
      // binding hashes and attempt receipts, while the source result carries
      // the complete unit coverage. In that canonical shape the queue job is
      // the authoritative per-segment partition.
      const segmentCoverage = segment.unitCoverage?.map((row) => row.contentUnitId) ??
        (result.schema === "library-analysis-source-result/v1" ? [...job.unitIds] : []);
      if (segmentCoverage.length !== job.unitIds.length || segmentCoverage.some((id, index) => id !== job.unitIds[index])) coverageMismatch();
      assertTerminalState(segment.terminalState ?? segment.status);
      segmentJobs.add(segment.jobId);
    }
    if (segmentJobs.size !== jobs.length) coverageMismatch();
    sourceResultHashes.push(result.sourceResultHash!);
  }
  if (sourceSeen.size !== queue.sources.length) coverageMismatch();
  const validationResults = input.validationResults.map((raw) => raw as ValidationResultLike);
  const validationResultHashes: string[] = [];
  const validationsBySource = new Set<string>();
  for (const result of validationResults) {
    if (!HASH.test(result.queueHash ?? "") || result.queueHash !== queue.queueHash ||
        !HASH.test(result.sourceEnvelopeHash ?? "") || !HASH.test(result.sourceResultHash ?? "") ||
        !HASH.test(result.resultHash ?? "") || validationsBySource.has(result.sourceEnvelopeHash!)) coverageMismatch();
    const sourceResult = sourceResults.find((candidate) => candidate.sourceEnvelopeHash === result.sourceEnvelopeHash);
    if (sourceResult === undefined || sourceResult.sourceResultHash !== result.sourceResultHash) coverageMismatch();
    validationsBySource.add(result.sourceEnvelopeHash!);
    validationResultHashes.push(result.resultHash!);
  }
  if (validationsBySource.size !== queue.sources.length) coverageMismatch();
  const state = deriveLibraryAnalysisAgentQueueState({ queue, attempts: input.attempts });
  if (state.terminalJobIds.length !== queue.jobs.length) throw new Error("queue_terminal_analysis_nonterminal");
  const normalizedAttempts = normalizeAttempts({ queue, attempts: input.attempts });
  if (input.acceptedArtifacts !== undefined) {
    const accepted = [...normalizedAttempts.values()].flat().filter((attempt) => attempt.status === "accepted");
    const artifactKeys = new Set<string>();
    for (const artifact of input.acceptedArtifacts) {
      if (!ID.test(artifact.jobId) || !Number.isInteger(artifact.attempt) ||
          !HASH.test(artifact.sha256) || !Number.isSafeInteger(artifact.sizeBytes) || artifact.sizeBytes < 0 ||
          (artifact.mode !== undefined && artifact.mode !== 0o400 && artifact.mode !== 0o600)) {
        throw new Error("queue_terminal_artifact_readback_invalid");
      }
      const key = `${artifact.jobId}\u0000${artifact.attempt}`;
      if (artifactKeys.has(key)) throw new Error("queue_terminal_artifact_readback_duplicate");
      artifactKeys.add(key);
      if (!accepted.some((attempt) => attempt.jobId === artifact.jobId && attempt.attempt === artifact.attempt)) {
        throw new Error("queue_terminal_artifact_readback_unexpected");
      }
    }
    if (accepted.some((attempt) => !artifactKeys.has(`${attempt.jobId}\u0000${attempt.attempt}`))) {
      throw new Error("queue_terminal_artifact_readback_missing");
    }
  }
  const governance: LibraryAnalysisAgentGovernance = {
    automatedOnly: true,
    externalReady: false,
    externalApiUsed: false,
    candidateDatabaseWritten: false,
    productionDataMutated: false,
    humanSourceReviewRequired: false,
  };
  const sortedSourceHashes = [...sourceResultHashes].sort(utf8Compare);
  const sortedValidationHashes = [...validationResultHashes].sort(utf8Compare);
  const receipts = [...normalizedAttempts.values()]
    .flat()
    .sort((left, right) => utf8Compare(left.jobId, right.jobId) || left.attempt - right.attempt)
    .map((receipt) => LibraryAnalysisAgentAttemptReceiptSchema.parse(receipt));
  return terminalReceiptSchema.parse({
    schema: LIBRARY_ANALYSIS_AGENT_TERMINAL_RECEIPT_SCHEMA,
    ...(queue.queueId === undefined ? {} : { queueId: queue.queueId }),
    queueHash: queue.queueHash,
    ...(queue.selectionHash === undefined ? {} : { selectionHash: queue.selectionHash }),
    sourceCount: queue.sources.length,
    unitCount: queue.units.length,
    jobCount: queue.jobs.length,
    sourceResultHashes: sortedSourceHashes,
    validationResultHashes: sortedValidationHashes,
    acceptedAttemptReceipts: receipts,
    finalMergeHash: input.finalMergeHash,
    privateInventoryHash: input.privateInventoryHash,
    inventoryHash: input.privateInventoryHash,
    state: "queue_terminal",
    governance,
    ...(queue.executionPolicy === undefined ? {} : { executionPolicy: queue.executionPolicy }),
  });
}

const governanceKeys = new Set([
  "automatedOnly", "externalReady", "externalApiUsed", "candidateDatabaseWritten",
  "productionDataMutated", "humanSourceReviewRequired",
]);
const countKeys = new Set(["sourceCount", "unitCount", "jobCount", "files", "directories", "totalBytes", "claims", "segments", "attempt", "invalidAttempts"]);
const stateKeys = new Set(["state", "status", "analysisState", "validationState", "disposition", "terminalState"]);
const hashKey = /(?:hash|hashes)$/iu;

/** Produce the only shape permitted to cross into tracked/public reporting. */
export function sanitizeLibraryAnalysisAgentReceipt(input: unknown): Record<string, unknown> {
  if (input === null || typeof input !== "object" || Array.isArray(input)) return {};
  const source = input as Record<string, unknown>;
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(source)) {
    if (key === "governance") {
      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        const governance: Record<string, boolean> = {};
        for (const governanceKey of governanceKeys) {
          if (typeof (value as Record<string, unknown>)[governanceKey] === "boolean") {
            governance[governanceKey] = (value as Record<string, boolean>)[governanceKey]!;
          }
        }
        if (Object.keys(governance).length === governanceKeys.size) output[key] = governance;
      }
      continue;
    }
    if (key === "executionPolicy" || key === "policy") {
      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        const policy: Record<string, unknown> = {};
        for (const [policyKey, policyValue] of Object.entries(value as Record<string, unknown>)) {
          if (governanceKeys.has(policyKey) && typeof policyValue === "boolean") policy[policyKey] = policyValue;
          if (/^maximum(?:Attempts|ConcurrentAnalyzers|CodePointsPerJob|UnitsPerJob)$/u.test(policyKey) && typeof policyValue === "number") policy[policyKey] = policyValue;
        }
        if (Object.keys(policy).length > 0) output[key] = policy;
      }
      continue;
    }
    if (key === "schema" && typeof value === "string") output[key] = value;
    else if (hashKey.test(key) && (typeof value === "string" ? HASH.test(value) : (Array.isArray(value) && value.every((entry) => typeof entry === "string" && HASH.test(entry))))) output[key] = value;
    else if (countKeys.has(key) && typeof value === "number" && Number.isSafeInteger(value)) output[key] = value;
    else if (stateKeys.has(key) && typeof value === "string") output[key] = value;
    else if (governanceKeys.has(key) && typeof value === "boolean") output[key] = value;
  }
  return output;
}

export type { LibraryAnalysisAgentAttemptReceipt } from "./library-analysis-agent-response";
