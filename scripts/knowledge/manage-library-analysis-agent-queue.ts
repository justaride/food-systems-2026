#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  closeSync,
  constants,
  fstatSync,
  lstatSync,
  openSync,
  readdirSync,
  readFileSync,
  readSync,
  realpathSync,
} from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { z } from "zod";

import {
  canonicalCandidateJson,
  candidateAnalysisSha256,
  candidateWorkflowProfile,
  type CandidateJsonValue,
} from "../../src/lib/knowledge/candidate-analysis-contract";
import {
  buildLibraryAnalysisAgentQueue,
  loadVerifiedLibraryAnalysisJob,
  verifyLibraryAnalysisAgentQueue,
  type LibraryAnalysisAgentQueue,
  type LibraryAnalysisVerifiedJob,
} from "../../src/lib/knowledge/library-analysis-agent-queue";
import {
  LibraryAnalysisAgentAttemptInputSchema,
  LibraryAnalysisAgentModelReceiptSchema,
  LibraryAnalysisTerminalSegmentSchema,
  deriveLibraryAnalysisAgentTerminalState,
  mergeLibraryAnalysisSourceSegments,
  verifyLibraryAnalysisSourceResult,
  type LibraryAnalysisAgentAttemptInput,
  validateLibraryAnalysisAgentSegmentResponse,
  type LibraryAnalysisAcceptedSegment,
  type LibraryAnalysisSourceResult,
} from "../../src/lib/knowledge/library-analysis-agent-response";
import {
  buildLibraryAnalysisAgentValidationRequest,
  deriveLibraryAnalysisAgentValidationResult,
  LibraryAnalysisAgentValidationRequestSchema,
  verifyLibraryAnalysisAgentValidationResult,
  validateLibraryAnalysisAgentValidationResponse,
  type LibraryAnalysisAgentValidationRequest,
  type LibraryAnalysisAgentValidationResult,
  type LibraryAnalysisVerifiedSourceUnit,
} from "../../src/lib/knowledge/library-analysis-agent-validation";
import {
  LibraryAnalysisAcquisitionResolutionSchema,
} from "../../src/lib/knowledge/library-analysis-acquisition-contract";
import {
  auditPrivateLibraryAnalysisRunRoot,
  openPrivateLibraryAnalysisRunRoot,
  readAndVerifyPrivateArtifact,
  sealPrivateArtifact,
  writePrivateArtifactExclusive,
  writePrivateManifestAtomic,
} from "../../src/lib/knowledge/private-library-analysis-artifact-store";
import {
  verifyLibraryAnalysisContentUnitManifest,
} from "./emit-library-analysis-content-units";
import {
  buildLibraryAnalysisAgentTerminalReceipt,
  deriveLibraryAnalysisAgentQueueState,
  sanitizeLibraryAnalysisAgentReceipt,
  LibraryAnalysisAgentAttemptReceiptSchema,
  type AcceptedArtifactReadback,
} from "../../src/lib/knowledge/library-analysis-agent-checkpoint";

const hashSchema = z.string().regex(/^[a-f0-9]{64}$/u);
const absolutePathSchema = z.string().min(1).refine(
  (value) => isAbsolute(value) && !/[\u0000-\u001f\u007f]/u.test(value),
  "absolute_path_required",
).transform((value) => resolve(value));
const buildOptionsSchema = z.object({
  command: z.literal("build"),
  runRoot: absolutePathSchema,
  resolution: absolutePathSchema,
  manifest: absolutePathSchema,
  costEnvelopeHash: hashSchema,
  mergedInventoryHash: hashSchema,
  runtimeCommit: z.string().min(1),
  repositoryRoot: absolutePathSchema,
}).strict();
const prepareOptionsSchema = z.object({
  command: z.literal("prepare-attempt"),
  runRoot: absolutePathSchema,
  queue: absolutePathSchema,
  jobId: z.string().regex(/^[a-z0-9][a-z0-9._:-]*$/u),
  attempt: z.number().int().min(1).max(999),
  expectedModel: LibraryAnalysisAgentModelReceiptSchema,
}).strict();
const acceptOptionsSchema = z.object({
  command: z.literal("accept-attempt"),
  runRoot: absolutePathSchema,
  queue: absolutePathSchema,
  attemptInput: absolutePathSchema,
  response: absolutePathSchema,
}).strict();
const mergeSourceOptionsSchema = z.object({
  command: z.literal("merge-source"),
  runRoot: absolutePathSchema,
  queue: absolutePathSchema,
  sourceId: hashSchema.optional(),
  sourceKind: z.string().min(1).optional(),
  sourceKey: z.string().min(1).optional(),
}).strict().superRefine((value, context) => {
  if (value.sourceId === undefined && (value.sourceKind === undefined || value.sourceKey === undefined)) {
    context.addIssue({ code: "custom", message: "source_id_required" });
  }
  if (value.sourceId !== undefined && (value.sourceKind !== undefined || value.sourceKey !== undefined)) {
    context.addIssue({ code: "custom", message: "source_id_ambiguous" });
  }
});
const validateSourceOptionsSchema = z.object({
  command: z.literal("validate-source"),
  mode: z.enum(["prepare", "accept"]),
  runRoot: absolutePathSchema,
  queue: absolutePathSchema,
  sourceId: hashSchema.optional(),
  sourceKind: z.string().min(1).optional(),
  sourceKey: z.string().min(1).optional(),
  validatorModel: z.object({
    provider: z.literal("openai-codex"),
    name: z.string().min(1),
    version: z.string().min(1),
  }).strict().optional(),
  response: absolutePathSchema.optional(),
}).strict().superRefine((value, context) => {
  if (value.sourceId === undefined && (value.sourceKind === undefined || value.sourceKey === undefined)) {
    context.addIssue({ code: "custom", message: "source_id_required" });
  }
  if (value.sourceId !== undefined && (value.sourceKind !== undefined || value.sourceKey !== undefined)) {
    context.addIssue({ code: "custom", message: "source_id_ambiguous" });
  }
  if (value.mode === "prepare" && value.response !== undefined) {
    context.addIssue({ code: "custom", message: "validation_prepare_response_forbidden" });
  }
  if (value.mode === "accept" && (value.response === undefined || value.validatorModel !== undefined)) {
    context.addIssue({ code: "custom", message: "validation_accept_response_required" });
  }
});
const statusOptionsSchema = z.object({
  command: z.literal("status"),
  runRoot: absolutePathSchema,
  queue: absolutePathSchema,
}).strict();
const finalizeOptionsSchema = z.object({
  command: z.literal("finalize"),
  runRoot: absolutePathSchema,
  queue: absolutePathSchema,
  finalMergeHash: hashSchema,
}).strict();

export type BuildQueueOptions = z.infer<typeof buildOptionsSchema>;
export type PrepareAttemptOptions = z.infer<typeof prepareOptionsSchema>;
export type AcceptAttemptOptions = z.infer<typeof acceptOptionsSchema>;
export type MergeSourceOptions = z.infer<typeof mergeSourceOptionsSchema>;
export type ValidateSourceOptions = z.infer<typeof validateSourceOptionsSchema>;
export type StatusOptions = z.infer<typeof statusOptionsSchema>;
export type FinalizeOptions = z.infer<typeof finalizeOptionsSchema>;
export type LibraryAnalysisAgentQueueCommand = BuildQueueOptions | PrepareAttemptOptions | AcceptAttemptOptions | MergeSourceOptions | ValidateSourceOptions | StatusOptions | FinalizeOptions;

export type LibraryAnalysisAgentQueueBuildResult = {
  command: "build";
  queuePath: string;
  queueHash: string;
  sources: number;
  units: number;
  jobs: number;
  audit: ReturnType<typeof auditPrivateLibraryAnalysisRunRoot>;
  automatedOnly: true;
  externalReady: false;
};

export type LibraryAnalysisAgentQueueAttemptResult = {
  command: "prepare-attempt";
  inputPath: string;
  queueHash: string;
  jobId: string;
  attempt: number;
  units: number;
  codePoints: number;
  audit: ReturnType<typeof auditPrivateLibraryAnalysisRunRoot>;
  automatedOnly: true;
  externalReady: false;
};

export type LibraryAnalysisAgentQueueAcceptResult = {
  command: "accept-attempt";
  queueHash: string;
  jobId: string;
  attempt: number;
  claims: number;
  rawResponsePath: string;
  acceptedPath: string;
  audit: ReturnType<typeof auditPrivateLibraryAnalysisRunRoot>;
  automatedOnly: true;
  externalReady: false;
};

export type LibraryAnalysisAgentQueueMergeResult = {
  command: "merge-source";
  queueHash: string;
  sourceEnvelopeHash: string;
  units: number;
  segments: number;
  claims: number;
  analysisState: LibraryAnalysisSourceResult["analysisState"];
  sourceResultPath: string;
  audit: ReturnType<typeof auditPrivateLibraryAnalysisRunRoot>;
  automatedOnly: true;
  externalReady: false;
};
export type LibraryAnalysisAgentQueueValidationResult = {
  command: "validate-source";
  mode: "prepare" | "accept";
  queueHash: string;
  sourceEnvelopeHash: string;
  requestPath?: string;
  resultPath?: string;
  claims?: number;
  disposition?: LibraryAnalysisAgentValidationResult["disposition"];
  audit: ReturnType<typeof auditPrivateLibraryAnalysisRunRoot>;
  automatedOnly: true;
  externalReady: false;
};
export type LibraryAnalysisAgentQueueStatusResult = {
  command: "status";
  queueHash: string;
  sourceCount: number;
  unitCount: number;
  jobCount: number;
  state: ReturnType<typeof deriveLibraryAnalysisAgentQueueState>["state"];
  reusableJobs: number;
  pendingJobs: number;
  quarantinedJobs: number;
  auditInventoryHash: string;
  automatedOnly: true;
  externalReady: false;
};
export type LibraryAnalysisAgentQueueFinalizeResult = {
  command: "finalize";
  queueHash: string;
  receiptPath: string;
  receipt: Record<string, unknown>;
  postPublicationAuditInventoryHash: string;
  automatedOnly: true;
  externalReady: false;
};

export type LibraryAnalysisAgentQueueCliResult =
  | LibraryAnalysisAgentQueueBuildResult
  | LibraryAnalysisAgentQueueAttemptResult
  | LibraryAnalysisAgentQueueAcceptResult
  | LibraryAnalysisAgentQueueMergeResult
  | LibraryAnalysisAgentQueueValidationResult
  | LibraryAnalysisAgentQueueStatusResult
  | LibraryAnalysisAgentQueueFinalizeResult;

export function parseLibraryAnalysisAgentQueueArgs(
  argv: readonly string[],
): LibraryAnalysisAgentQueueCommand {
  const command = argv[0];
  if (command !== "build" && command !== "prepare-attempt" && command !== "accept-attempt" && command !== "merge-source" && command !== "validate-source" && command !== "status" && command !== "finalize") {
    throw new Error("agent_queue_cli_arguments_invalid");
  }
  const values = new Map<string, string>();
  for (const argument of argv.slice(1)) {
    const match = /^--([a-z-]+)=(.*)$/u.exec(argument);
    const allowed = command === "build"
      ? ["run-root", "resolution", "manifest", "cost-envelope-hash", "merged-inventory-hash", "runtime-commit", "repository-root"]
      : command === "prepare-attempt"
        ? ["run-root", "queue", "job-id", "attempt", "expected-model-provider", "expected-model-name", "expected-model-version"]
        : command === "accept-attempt"
          ? ["run-root", "queue", "attempt-input", "response"]
      : command === "merge-source"
            ? ["run-root", "queue", "source-id", "source-kind", "source-key"]
            : command === "validate-source"
              ? ["mode", "run-root", "queue", "source-id", "source-kind", "source-key", "validator-model-provider", "validator-model-name", "validator-model-version", "response"]
              : command === "status"
                ? ["run-root", "queue"]
                : ["run-root", "queue", "final-merge-hash"];
    if (!match || !allowed.includes(match[1]!) || values.has(match[1]!)) {
      throw new Error("agent_queue_cli_arguments_invalid");
    }
    values.set(match[1]!, match[2]!);
  }
  const value = (name: string): string | undefined => values.get(name);
  if (command === "build") {
    try {
      return buildOptionsSchema.parse({
        command,
        runRoot: value("run-root"),
        resolution: value("resolution"),
        manifest: value("manifest"),
        costEnvelopeHash: value("cost-envelope-hash"),
        mergedInventoryHash: value("merged-inventory-hash"),
        runtimeCommit: value("runtime-commit"),
        repositoryRoot: value("repository-root"),
      });
    } catch {
      throw new Error("agent_queue_cli_arguments_invalid");
    }
  }
  if (command === "prepare-attempt") {
    const attempt = value("attempt");
    try {
      return prepareOptionsSchema.parse({
        command,
        runRoot: value("run-root"),
        queue: value("queue"),
        jobId: value("job-id"),
        attempt: attempt === undefined ? undefined : Number(attempt),
        expectedModel: {
          provider: value("expected-model-provider"),
          name: value("expected-model-name"),
          version: value("expected-model-version"),
        },
      });
    } catch {
      throw new Error("agent_queue_cli_arguments_invalid");
    }
  }
  if (command === "merge-source") {
    try {
      const parsed = {
        command,
        runRoot: value("run-root"),
        queue: value("queue"),
        ...(value("source-id") === undefined ? {} : { sourceId: value("source-id") }),
        ...(value("source-kind") === undefined ? {} : { sourceKind: value("source-kind") }),
        ...(value("source-key") === undefined ? {} : { sourceKey: value("source-key") }),
      };
      return mergeSourceOptionsSchema.parse(parsed);
    } catch {
      throw new Error("agent_queue_cli_arguments_invalid");
    }
  }
  if (command === "validate-source") {
    try {
      const parsed = {
        command,
        mode: value("mode"),
        runRoot: value("run-root"),
        queue: value("queue"),
        ...(value("source-id") === undefined ? {} : { sourceId: value("source-id") }),
        ...(value("source-kind") === undefined ? {} : { sourceKind: value("source-kind") }),
        ...(value("source-key") === undefined ? {} : { sourceKey: value("source-key") }),
        ...(value("validator-model-provider") === undefined ? {} : { validatorModel: {
          provider: value("validator-model-provider"),
          name: value("validator-model-name"),
          version: value("validator-model-version"),
        } }),
        ...(value("response") === undefined ? {} : { response: value("response") }),
      };
      return validateSourceOptionsSchema.parse(parsed);
    } catch {
      throw new Error("agent_queue_cli_arguments_invalid");
    }
  }
  if (command === "status") {
    try {
      return statusOptionsSchema.parse({ command, runRoot: value("run-root"), queue: value("queue") });
    } catch {
      throw new Error("agent_queue_cli_arguments_invalid");
    }
  }
  if (command === "finalize") {
    try {
      return finalizeOptionsSchema.parse({ command, runRoot: value("run-root"), queue: value("queue"), finalMergeHash: value("final-merge-hash") });
    } catch {
      throw new Error("agent_queue_cli_arguments_invalid");
    }
  }
  try {
    return acceptOptionsSchema.parse({
      command,
      runRoot: value("run-root"),
      queue: value("queue"),
      attemptInput: value("attempt-input"),
      response: value("response"),
    });
  } catch {
    throw new Error("agent_queue_cli_arguments_invalid");
  }
}

export function runLibraryAnalysisAgentQueueCli(
  options: BuildQueueOptions,
): Promise<LibraryAnalysisAgentQueueBuildResult>;
export function runLibraryAnalysisAgentQueueCli(
  options: PrepareAttemptOptions,
): Promise<LibraryAnalysisAgentQueueAttemptResult>;
export function runLibraryAnalysisAgentQueueCli(
  options: AcceptAttemptOptions,
): Promise<LibraryAnalysisAgentQueueAcceptResult>;
export function runLibraryAnalysisAgentQueueCli(
  options: MergeSourceOptions,
): Promise<LibraryAnalysisAgentQueueMergeResult>;
export function runLibraryAnalysisAgentQueueCli(
  options: ValidateSourceOptions,
): Promise<LibraryAnalysisAgentQueueValidationResult>;
export function runLibraryAnalysisAgentQueueCli(
  options: StatusOptions,
): Promise<LibraryAnalysisAgentQueueStatusResult>;
export function runLibraryAnalysisAgentQueueCli(
  options: FinalizeOptions,
): Promise<LibraryAnalysisAgentQueueFinalizeResult>;
export function runLibraryAnalysisAgentQueueCli(
  options: LibraryAnalysisAgentQueueCommand,
): Promise<LibraryAnalysisAgentQueueCliResult>;
export async function runLibraryAnalysisAgentQueueCli(
  options: LibraryAnalysisAgentQueueCommand,
): Promise<LibraryAnalysisAgentQueueCliResult> {
  if (options.command === "build") return runBuildQueue(options);
  if (options.command === "prepare-attempt") return runPrepareAttempt(options);
  if (options.command === "accept-attempt") return runAcceptAttempt(options);
  if (options.command === "merge-source") return runMergeSource(options);
  if (options.command === "validate-source") return runValidateSource(options);
  if (options.command === "status") return runStatus(options);
  return runFinalize(options);
}

async function runBuildQueue(
  rawOptions: BuildQueueOptions,
): Promise<LibraryAnalysisAgentQueueBuildResult> {
  const options = buildOptionsSchema.parse(rawOptions);
  const runRoot = openRunRoot(options.runRoot);
  const resolution = LibraryAnalysisAcquisitionResolutionSchema.parse(readJson(options.resolution));
  const manifest = verifyLibraryAnalysisContentUnitManifest(readJson(options.manifest));
  const analysis = repositoryBinding(options.repositoryRoot, "library_analysis_v1");
  const validation = repositoryBinding(options.repositoryRoot, "library_validation_v1");
  const queue = buildLibraryAnalysisAgentQueue({
    resolution,
    manifest,
    runRoot,
    costEnvelopeHash: options.costEnvelopeHash,
    mergedInventoryHash: options.mergedInventoryHash,
    runtimeCommit: options.runtimeCommit,
    workflow: analysis.workflow,
    analysisPrompt: analysis.prompt,
    validationWorkflow: validation.workflow,
    validationPrompt: validation.prompt,
  });
  const portablePath = `queue/queue-${queue.queueHash}.json`;
  const bytes = canonicalJsonBytes(queue);
  const receipt = writePrivateManifestAtomic(runRoot, portablePath, bytes);
  readAndVerifyPrivateArtifact(runRoot, portablePath, {
    sha256: receipt.sha256,
    sizeBytes: receipt.sizeBytes,
    mode: 0o400,
  });
  const audit = auditPrivateLibraryAnalysisRunRoot(runRoot);
  return {
    command: "build",
    queuePath: receipt.path,
    queueHash: queue.queueHash,
    sources: queue.sources.length,
    units: queue.units.length,
    jobs: queue.jobs.length,
    audit,
    automatedOnly: true,
    externalReady: false,
  };
}

async function runPrepareAttempt(
  rawOptions: PrepareAttemptOptions,
): Promise<LibraryAnalysisAgentQueueAttemptResult> {
  const options = prepareOptionsSchema.parse(rawOptions);
  const runRoot = openRunRoot(options.runRoot);
  const queue = readQueue(runRoot, options.queue);
  const collected = collectAttemptReceipts(runRoot, queue);
  const state = deriveLibraryAnalysisAgentQueueState({ queue, attempts: collected.attempts });
  const dispatch = state.nextAttempts.find((candidate) => candidate.jobId === options.jobId);
  if (dispatch === undefined || dispatch.attempt !== options.attempt) {
    throw new Error("agent_queue_attempt_not_dispatchable");
  }
  const loaded = loadVerifiedLibraryAnalysisJob(runRoot, queue, options.jobId);
  const input = {
    schema: "library-analysis-agent-job-input/v1" as const,
    queueId: queue.queueId,
    queueHash: queue.queueHash,
    jobId: loaded.job.jobId,
    attempt: options.attempt,
    expectedModel: options.expectedModel,
    job: loaded.job,
    executionPolicy: queue.executionPolicy,
    workflow: queue.workflow,
    analysisPrompt: queue.analysisPrompt,
    validationWorkflow: queue.validationWorkflow,
    validationPrompt: queue.validationPrompt,
    units: loaded.units.map(({ descriptor, text }) => ({ ...descriptor, text })),
  };
  const portablePath = `jobs/${loaded.job.jobId}/attempt-${String(options.attempt).padStart(3, "0")}/input.json`;
  const inputHash = candidateAnalysisSha256(
    "library-analysis-agent-attempt-input",
    input as CandidateJsonValue,
  );
  const bytes = canonicalJsonBytes({ ...input, inputHash } as CandidateJsonValue);
  const receipt = writePrivateArtifactExclusive(runRoot, portablePath, bytes);
  sealPrivateArtifact(runRoot, portablePath, {
    sha256: receipt.sha256,
    sizeBytes: receipt.sizeBytes,
  });
  readAndVerifyPrivateArtifact(runRoot, portablePath, {
    sha256: receipt.sha256,
    sizeBytes: receipt.sizeBytes,
    mode: 0o400,
  });
  const audit = auditPrivateLibraryAnalysisRunRoot(runRoot);
  return {
    command: "prepare-attempt",
    inputPath: receipt.path,
    queueHash: queue.queueHash,
    jobId: loaded.job.jobId,
    attempt: options.attempt,
    units: loaded.units.length,
    codePoints: loaded.units.reduce((sum, unit) => sum + unit.descriptor.codePoints, 0),
    audit,
    automatedOnly: true,
    externalReady: false,
  };
}

async function runAcceptAttempt(
  rawOptions: AcceptAttemptOptions,
): Promise<LibraryAnalysisAgentQueueAcceptResult> {
  const options = acceptOptionsSchema.parse(rawOptions);
  const runRoot = openRunRoot(options.runRoot);
  const queue = readQueue(runRoot, options.queue);
  const inputArtifact = readSealedAttemptInput(runRoot, options.attemptInput);
  const inputBytes = inputArtifact.bytes;
  const input = LibraryAnalysisAgentAttemptInputSchema.parse(JSON.parse(inputBytes.toString("utf8")));
  const { inputHash, ...inputCore } = input;
  if (inputHash !== candidateAnalysisSha256("library-analysis-agent-attempt-input", inputCore as CandidateJsonValue)) {
    throw new Error("agent_queue_attempt_input_hash_mismatch");
  }
  if (
    inputArtifact.jobId !== input.jobId ||
    inputArtifact.attempt !== input.attempt ||
    input.queueId !== `library-analysis-agent-queue:${input.queueHash}` ||
    input.job.jobId !== input.jobId ||
    input.job.unitIds.length !== input.units.length ||
    input.job.unitIds.some((id, index) => id !== input.units[index]!.id)
  ) {
    throw new Error("agent_queue_attempt_input_binding_mismatch");
  }
  const authoritativeJob = loadVerifiedLibraryAnalysisJob(runRoot, queue, input.jobId);
  assertAttemptInputMatchesAuthoritative(queue, authoritativeJob, input);
  const responseArtifact = readExplicitPrivateResponse(options.response);
  let response: unknown;
  try {
    response = JSON.parse(responseArtifact.bytes.toString("utf8"));
  } catch {
    sealRawResponse(runRoot, input, responseArtifact.bytes);
    throw new Error("agent_response_json_invalid");
  }
  let accepted: LibraryAnalysisAcceptedSegment;
  try {
    accepted = validateLibraryAnalysisAgentSegmentResponse({
      queueHash: input.queueHash,
      attempt: input.attempt,
      inputHash: input.inputHash,
      expectedModel: input.expectedModel,
      job: authoritativeJob,
      response,
    });
  } catch (error) {
    sealRawResponse(runRoot, input, responseArtifact.bytes);
    throw error;
  }
  const attemptRoot = `jobs/${input.jobId}/attempt-${String(input.attempt).padStart(3, "0")}`;
  const rawReceipt = writePrivateArtifactExclusive(runRoot, `${attemptRoot}/response.json`, responseArtifact.bytes);
  sealPrivateArtifact(runRoot, `${attemptRoot}/response.json`, {
    sha256: rawReceipt.sha256,
    sizeBytes: rawReceipt.sizeBytes,
  });
  const acceptedBytes = canonicalJsonBytes(accepted as unknown as CandidateJsonValue);
  const acceptedReceipt = writePrivateArtifactExclusive(runRoot, `${attemptRoot}/accepted.json`, acceptedBytes);
  sealPrivateArtifact(runRoot, `${attemptRoot}/accepted.json`, {
    sha256: acceptedReceipt.sha256,
    sizeBytes: acceptedReceipt.sizeBytes,
  });
  const audit = auditPrivateLibraryAnalysisRunRoot(runRoot);
  return {
    command: "accept-attempt",
    queueHash: input.queueHash,
    jobId: input.jobId,
    attempt: input.attempt,
    claims: accepted.claims.length,
    rawResponsePath: rawReceipt.path,
    acceptedPath: acceptedReceipt.path,
    audit,
    automatedOnly: true,
    externalReady: false,
  };
}

async function runMergeSource(
  rawOptions: MergeSourceOptions,
): Promise<LibraryAnalysisAgentQueueMergeResult> {
  const options = mergeSourceOptionsSchema.parse(rawOptions);
  const runRoot = openRunRoot(options.runRoot);
  const queue = readQueue(runRoot, options.queue);
  const source = queue.sources.find((candidate) => {
    if (options.sourceKind !== undefined && options.sourceKey !== undefined) {
      return candidate.sourceKind === options.sourceKind && candidate.sourceKey === options.sourceKey;
    }
    const sourceId = options.sourceId!;
    return sourceId === candidate.sourceEnvelopeHash;
  });
  if (source === undefined) throw new Error("source_merge_source_not_found");
  const jobs = queue.jobs.filter((job) =>
    job.sourceKind === source.sourceKind && job.sourceKey === source.sourceKey);
  if (jobs.length === 0) throw new Error("source_merge_job_set_mismatch");
  const segments = jobs.map((job) => readCanonicalTerminalSegment(runRoot, queue.queueHash, job));
  const result = mergeLibraryAnalysisSourceSegments({
    queueHash: queue.queueHash,
    source,
    segments,
    expectedJobs: jobs,
  });
  const sourceResultPath = `sources/source-${source.sourceEnvelopeHash}.json`;
  const receipt = writePrivateManifestAtomic(
    runRoot,
    sourceResultPath,
    canonicalJsonBytes(result as unknown as CandidateJsonValue),
  );
  readAndVerifyPrivateArtifact(runRoot, sourceResultPath, {
    sha256: receipt.sha256,
    sizeBytes: receipt.sizeBytes,
    mode: 0o400,
  });
  const audit = auditPrivateLibraryAnalysisRunRoot(runRoot);
  return {
    command: "merge-source",
    queueHash: queue.queueHash,
    sourceEnvelopeHash: result.sourceEnvelopeHash,
    units: result.unitCoverage.length,
    segments: result.segments.length,
    claims: result.claims.length,
    analysisState: result.analysisState,
    sourceResultPath: receipt.path,
    audit,
    automatedOnly: true,
    externalReady: false,
  };
}

async function runValidateSource(
  rawOptions: ValidateSourceOptions,
): Promise<LibraryAnalysisAgentQueueValidationResult> {
  const options = validateSourceOptionsSchema.parse(rawOptions);
  const runRoot = openRunRoot(options.runRoot);
  const queue = readQueue(runRoot, options.queue);
  const source = queue.sources.find((candidate) => {
    if (options.sourceKind !== undefined && options.sourceKey !== undefined) {
      return candidate.sourceKind === options.sourceKind && candidate.sourceKey === options.sourceKey;
    }
    return candidate.sourceEnvelopeHash === options.sourceId;
  });
  if (source === undefined) throw new Error("validation_source_not_found");
  const sourceResultPortable = `sources/source-${source.sourceEnvelopeHash}.json`;
  const sourceResult = verifyLibraryAnalysisSourceResult(readSealedJsonWithReadback(runRoot, sourceResultPortable).value);
  if (sourceResult.queueHash !== queue.queueHash || sourceResult.sourceEnvelopeHash !== source.sourceEnvelopeHash) {
    throw new Error("validation_source_result_binding_mismatch");
  }
  const jobs = queue.jobs.filter((job) => job.sourceKind === source.sourceKind && job.sourceKey === source.sourceKey);
  if (jobs.length === 0) throw new Error("validation_source_job_set_missing");
  const unitsById = new Map<string, LibraryAnalysisVerifiedSourceUnit>();
  for (const job of jobs) {
    const verified = loadVerifiedLibraryAnalysisJob(runRoot, queue, job.jobId);
    for (const unit of verified.units) {
      if (unitsById.has(unit.descriptor.id)) throw new Error("validation_source_unit_duplicate");
      unitsById.set(unit.descriptor.id, { ...unit.descriptor, text: unit.text });
    }
  }
  if (unitsById.size !== source.unitIds.length || source.unitIds.some((id) => !unitsById.has(id))) {
    throw new Error("validation_source_unit_coverage_mismatch");
  }
  const validationRoot = `validation/source-${source.sourceEnvelopeHash}`;
  const requestPortable = `${validationRoot}/request.json`;
  if (options.mode === "prepare") {
    if (options.validatorModel === undefined) throw new Error("validation_validator_model_required");
    const request = buildLibraryAnalysisAgentValidationRequest({
      queueHash: queue.queueHash,
      sourceEnvelopeHash: source.sourceEnvelopeHash,
      sourceResult,
      units: source.unitIds.map((id) => unitsById.get(id)!),
      validatorModel: options.validatorModel,
      analysisModels: sourceResult.segments.map((segment) => segment.model),
    });
    const receipt = writePrivateManifestAtomic(runRoot, requestPortable, canonicalJsonBytes(request as unknown as CandidateJsonValue));
    readAndVerifyPrivateArtifact(runRoot, requestPortable, { sha256: receipt.sha256, sizeBytes: receipt.sizeBytes, mode: 0o400 });
    return {
      command: "validate-source",
      mode: "prepare",
      queueHash: queue.queueHash,
      sourceEnvelopeHash: source.sourceEnvelopeHash,
      requestPath: receipt.path,
      claims: request.claims.length,
      audit: auditPrivateLibraryAnalysisRunRoot(runRoot),
      automatedOnly: true,
      externalReady: false,
    };
  }
  const request = LibraryAnalysisAgentValidationRequestSchema.parse(readSealedJson(runRoot, requestPortable));
  const responseArtifact = readExplicitPrivateResponse(options.response!);
  let rawResponse: unknown;
  try {
    rawResponse = JSON.parse(responseArtifact.bytes.toString("utf8"));
  } catch {
    throw new Error("validation_response_json_invalid");
  }
  const response = validateLibraryAnalysisAgentValidationResponse({ request, response: rawResponse });
  const rawResponseReceipt = writePrivateArtifactExclusive(runRoot, `${validationRoot}/response.json`, responseArtifact.bytes);
  sealPrivateArtifact(runRoot, `${validationRoot}/response.json`, { sha256: rawResponseReceipt.sha256, sizeBytes: rawResponseReceipt.sizeBytes });
  const result = deriveLibraryAnalysisAgentValidationResult({
    candidateId: `source:${source.sourceKind}:${source.sourceKey}`,
    sourceResult,
    units: source.unitIds.map((id) => unitsById.get(id)!),
    analysisModels: sourceResult.segments.map((segment) => segment.model),
    validatorModel: response.validatorModel,
    populationEligibility: "eligible",
    modelFindings: response.findings,
    riskFlags: response.riskFlags,
    request,
    response,
  });
  const resultReceipt = writePrivateManifestAtomic(runRoot, `${validationRoot}/result.json`, canonicalJsonBytes(result as unknown as CandidateJsonValue));
  readAndVerifyPrivateArtifact(runRoot, `${validationRoot}/result.json`, { sha256: resultReceipt.sha256, sizeBytes: resultReceipt.sizeBytes, mode: 0o400 });
  return {
    command: "validate-source",
    mode: "accept",
    queueHash: queue.queueHash,
    sourceEnvelopeHash: source.sourceEnvelopeHash,
    resultPath: resultReceipt.path,
    claims: result.findings.length,
    disposition: result.disposition,
    audit: auditPrivateLibraryAnalysisRunRoot(runRoot),
    automatedOnly: true,
    externalReady: false,
  };
}

async function runStatus(
  rawOptions: StatusOptions,
): Promise<LibraryAnalysisAgentQueueStatusResult> {
  const options = statusOptionsSchema.parse(rawOptions);
  const runRoot = openRunRoot(options.runRoot);
  const queue = readQueue(runRoot, options.queue);
  const collected = collectAttemptReceipts(runRoot, queue);
  const state = deriveLibraryAnalysisAgentQueueState({ queue, attempts: collected.attempts });
  const audit = auditPrivateLibraryAnalysisRunRoot(runRoot);
  return {
    command: "status",
    queueHash: queue.queueHash,
    sourceCount: queue.sources.length,
    unitCount: queue.units.length,
    jobCount: queue.jobs.length,
    state: state.state,
    reusableJobs: state.reusableJobIds.length,
    pendingJobs: state.nextAttempts.length,
    quarantinedJobs: state.quarantinedJobIds.length,
    auditInventoryHash: audit.inventoryHash,
    automatedOnly: true,
    externalReady: false,
  };
}

async function runFinalize(
  rawOptions: FinalizeOptions,
): Promise<LibraryAnalysisAgentQueueFinalizeResult> {
  const options = finalizeOptionsSchema.parse(rawOptions);
  const runRoot = openRunRoot(options.runRoot);
  const queue = readQueue(runRoot, options.queue);
  const collected = collectAttemptReceipts(runRoot, queue);
  const sourceReadbacks = queue.sources.map((source) => {
    const portablePath = `sources/source-${source.sourceEnvelopeHash}.json`;
    const read = readSealedJsonWithReadback(runRoot, portablePath);
    const result = verifyLibraryAnalysisSourceResult(read.value);
    if (result.queueHash !== queue.queueHash || result.sourceEnvelopeHash !== source.sourceEnvelopeHash) {
      throw new Error("queue_terminal_source_binding_mismatch");
    }
    return {
      ...read.receipt,
      resultHash: result.sourceResultHash,
      queueHash: result.queueHash,
      sourceEnvelopeHash: result.sourceEnvelopeHash,
      sourceKind: source.sourceKind,
      sourceKey: source.sourceKey,
      value: result,
    };
  });
  const validationReadbacks = queue.sources.map((source) => {
    const portablePath = `validation/source-${source.sourceEnvelopeHash}/result.json`;
    const read = readSealedJsonWithReadback(runRoot, portablePath);
    const result = verifyLibraryAnalysisAgentValidationResult(read.value);
    if (result.queueHash !== queue.queueHash || result.sourceEnvelopeHash !== source.sourceEnvelopeHash) {
      throw new Error("queue_terminal_validation_binding_mismatch");
    }
    return {
      ...read.receipt,
      resultHash: result.resultHash,
      sourceResultHash: result.sourceResultHash,
      queueHash: result.queueHash,
      sourceEnvelopeHash: result.sourceEnvelopeHash,
      sourceKind: source.sourceKind,
      sourceKey: source.sourceKey,
      value: result,
    };
  });
  const preReceiptAudit = auditPrivateLibraryAnalysisRunRoot(runRoot);
  const receipt = buildLibraryAnalysisAgentTerminalReceipt({
    queue,
    attempts: collected.attempts,
    sourceResults: sourceReadbacks.map((entry) => entry.value),
    validationResults: validationReadbacks.map((entry) => entry.value),
    finalMergeHash: options.finalMergeHash,
    privateInventoryHash: preReceiptAudit.inventoryHash,
    privateAudit: preReceiptAudit,
    acceptedArtifacts: collected.acceptedArtifacts,
    sourceArtifacts: sourceReadbacks.map(({ value: _value, ...artifact }) => artifact),
    validationArtifacts: validationReadbacks.map(({ value: _value, ...artifact }) => artifact),
  });
  const receiptPortablePath = "terminal/receipt.json";
  const written = writePrivateManifestAtomic(
    runRoot,
    receiptPortablePath,
    canonicalJsonBytes(receipt as unknown as CandidateJsonValue),
  );
  readAndVerifyPrivateArtifact(runRoot, receiptPortablePath, {
    sha256: written.sha256,
    sizeBytes: written.sizeBytes,
    mode: 0o400,
  });
  const postPublicationAudit = auditPrivateLibraryAnalysisRunRoot(runRoot);
  return {
    command: "finalize",
    queueHash: queue.queueHash,
    receiptPath: written.path,
    receipt: sanitizeLibraryAnalysisAgentReceipt(receipt),
    postPublicationAuditInventoryHash: postPublicationAudit.inventoryHash,
    automatedOnly: true,
    externalReady: false,
  };
}

function collectAttemptReceipts(
  runRoot: string,
  queue: LibraryAnalysisAgentQueue,
): { attempts: Array<Record<string, unknown>>; acceptedArtifacts: AcceptedArtifactReadback[] } {
  const receipts: Array<Record<string, unknown>> = [];
  const acceptedArtifacts: AcceptedArtifactReadback[] = [];
  for (const job of queue.jobs) {
    let jobDirectory: string;
    let attemptDirectories: string[];
    try {
      jobDirectory = safePrivatePath(runRoot, ["jobs", job.jobId]);
      attemptDirectories = readdirSync(jobDirectory).filter((name) => /^attempt-\d{3}$/u.test(name)).sort();
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") continue;
      throw new Error("agent_queue_attempt_artifact_invalid");
    }
    for (const attemptDirectory of attemptDirectories) {
      const attempt = Number(attemptDirectory.slice("attempt-".length));
      const attemptRoot = `jobs/${job.jobId}/${attemptDirectory}`;
      const names = readdirSync(safePrivatePath(runRoot, ["jobs", job.jobId, attemptDirectory])).sort();
      const allowed = new Set(["input.json", "response.json", "accepted.json", "terminal.json"]);
      if (names.some((name) => !allowed.has(name))) throw new Error("agent_queue_attempt_artifact_unexpected");
      const hasAccepted = names.includes("accepted.json");
      const hasTerminal = names.includes("terminal.json");
      if (hasAccepted && hasTerminal) throw new Error("agent_queue_attempt_terminal_conflict");
      if (!names.includes("input.json") || !names.includes("response.json")) continue;
      const inputRead = readSealedJsonWithReadback(runRoot, `${attemptRoot}/input.json`);
      const input = LibraryAnalysisAgentAttemptInputSchema.parse(inputRead.value);
      const inputCore = { ...input } as Record<string, unknown>;
      delete inputCore.inputHash;
      if (input.queueHash !== queue.queueHash || input.queueId !== queue.queueId || input.jobId !== job.jobId ||
          input.attempt !== attempt || input.job.jobId !== job.jobId || input.job.inputEnvelopeHash !== job.inputEnvelopeHash ||
          inputHashOf(inputCore) !== input.inputHash) {
        throw new Error("agent_queue_attempt_authority_mismatch");
      }
      const responseRead = readSealedJsonWithReadback(runRoot, `${attemptRoot}/response.json`);
      let response: Record<string, unknown> | null = null;
      try {
        const parsed = JSON.parse(responseRead.bytes.toString("utf8")) as unknown;
        if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) response = parsed as Record<string, unknown>;
      } catch {
        response = null;
      }
      const outputName = hasAccepted ? "accepted.json" : hasTerminal ? "terminal.json" : null;
      const outputRead = outputName === null ? null : readSealedJsonWithReadback(runRoot, `${attemptRoot}/${outputName}`);
      let output: Record<string, unknown> | null = null;
      if (outputRead !== null) {
        output = outputRead.value as Record<string, unknown>;
        const segment = LibraryAnalysisTerminalSegmentSchema.parse(output);
        if (segment.queueHash !== queue.queueHash || segment.jobId !== job.jobId || segment.jobHash !== job.inputEnvelopeHash || segment.attempt !== attempt) {
          throw new Error("agent_queue_attempt_output_binding_mismatch");
        }
      }
      const outputHash = typeof output?.responseHash === "string" ? output.responseHash : undefined;
      if (response !== null) {
        if ((response.queueHash !== undefined && response.queueHash !== queue.queueHash) ||
            (response.jobId !== undefined && response.jobId !== job.jobId) ||
            (response.attempt !== undefined && response.attempt !== attempt) ||
            (response.jobHash !== undefined && response.jobHash !== job.inputEnvelopeHash) ||
            (outputHash !== undefined && response.responseHash !== undefined && response.responseHash !== outputHash)) {
          throw new Error("agent_queue_attempt_response_binding_mismatch");
        }
      }
      const status = outputName === "accepted.json" ? "accepted" : outputName === "terminal.json" ? (output?.terminalState ?? output?.status ?? "failed") : "invalid";
      const receipt = LibraryAnalysisAgentAttemptReceiptSchema.parse({
        queueHash: queue.queueHash,
        jobId: job.jobId,
        jobHash: job.inputEnvelopeHash,
        attempt,
        inputHash: input.inputHash,
        responseHash: responseRead.receipt.sha256,
        status,
        inputArtifact: inputRead.receipt,
        responseArtifact: responseRead.receipt,
        ...(outputHash === undefined ? {} : { outputHash }),
        ...(outputRead === null ? {} : { outputArtifact: outputRead.receipt }),
        ...(output?.terminalReason === undefined ? {} : { terminalReason: output.terminalReason }),
        ...(output?.model === undefined ? {} : { model: output.model }),
      });
      receipts.push(receipt as Record<string, unknown>);
      if (outputName === "accepted.json" && outputHash !== undefined && outputRead !== null) {
        acceptedArtifacts.push({
          portablePath: outputRead.receipt.portablePath,
          sha256: outputRead.receipt.sha256,
          sizeBytes: outputRead.receipt.sizeBytes,
          mode: 0o400,
          outputHash,
          queueHash: queue.queueHash,
          jobId: job.jobId,
          jobHash: job.inputEnvelopeHash,
          attempt,
        });
      }
    }
  }
  return { attempts: receipts, acceptedArtifacts };
}

function readCanonicalTerminalSegment(
  runRoot: string,
  queueHash: string,
  job: LibraryAnalysisAgentQueue["jobs"][number],
): import("../../src/lib/knowledge/library-analysis-agent-response").LibraryAnalysisTerminalSegment {
  const jobDirectory = safePrivatePath(runRoot, ["jobs", job.jobId]);
  const directoryStat = lstatSync(jobDirectory);
  if (!directoryStat.isDirectory() || (directoryStat.mode & 0o777) !== 0o700) {
    throw new Error("source_merge_segment_artifact_invalid");
  }
  const attempts = readdirSync(jobDirectory).filter((name) => /^attempt-\d{3}$/u.test(name)).sort();
  const artifacts: Array<{ path: string; kind: "accepted" | "terminal"; attempt: number }> = [];
  for (const attempt of attempts) {
    const attemptDirectory = safePrivatePath(runRoot, ["jobs", job.jobId, attempt]);
    const attemptStat = lstatSync(attemptDirectory);
    if (!attemptStat.isDirectory() || (attemptStat.mode & 0o777) !== 0o700) {
      throw new Error("source_merge_segment_artifact_invalid");
    }
    const names = readdirSync(attemptDirectory).sort();
    if (names.some((name) => !new Set(["input.json", "response.json", "accepted.json", "terminal.json"]).has(name))) {
      throw new Error("source_merge_segment_artifact_invalid");
    }
    if (names.includes("accepted.json") && names.includes("terminal.json")) {
      throw new Error("source_merge_terminal_conflict");
    }
    for (const name of ["accepted.json", "terminal.json"]) {
      let artifactPath: string;
      try {
        artifactPath = safePrivatePath(runRoot, ["jobs", job.jobId, attempt, name]);
        const stat = lstatSync(artifactPath);
        if (stat.isFile()) {
          artifacts.push({
            path: artifactPath,
            kind: name === "terminal.json" ? "terminal" : "accepted",
            attempt: Number(attempt.slice("attempt-".length)),
          });
        }
      } catch (error) {
        if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) {
          throw new Error("source_merge_segment_artifact_invalid");
        }
      }
    }
  }
  const terminalArtifacts = artifacts.filter((artifact) => artifact.kind === "terminal");
  const acceptedArtifacts = artifacts.filter((artifact) => artifact.kind === "accepted");
  if (terminalArtifacts.length > 1 || (terminalArtifacts.length === 0 && acceptedArtifacts.length !== 1)) {
    throw new Error("source_merge_terminal_ambiguity");
  }
  const selectedArtifact = terminalArtifacts[0] ?? acceptedArtifacts[0];
  if (selectedArtifact === undefined) throw new Error("source_merge_segment_artifact_missing");
  const parsedArtifacts = [...artifacts].sort((left, right) =>
    left.attempt - right.attempt || left.kind.localeCompare(right.kind) || left.path.localeCompare(right.path),
  ).map((artifact) => ({ artifact, segment: readAndBindTerminalSegment(queueHash, job, artifact) }));
  const selected = parsedArtifacts.find(({ artifact }) => artifact.path === selectedArtifact.path);
  if (selected === undefined) throw new Error("source_merge_segment_artifact_missing");
  const receipts = new Map<number, {
    attempt: number;
    inputHash: string;
    responseHash: string;
    status: "accepted" | "partial" | "failed" | "quarantined";
    terminalReason?: string;
    model: typeof selected.segment.model;
  }>();
  for (const { artifact, segment } of parsedArtifacts) {
    const status = deriveLibraryAnalysisAgentTerminalState(segment, artifact.kind === "terminal" ? "failed" : "accepted");
    const receipt = {
      attempt: segment.attempt,
      inputHash: segment.inputHash,
      responseHash: segment.responseHash,
      status,
      model: segment.model,
      ...(segment.terminalReason === undefined ? {} : { terminalReason: segment.terminalReason }),
    };
    const existing = receipts.get(receipt.attempt);
    if (existing !== undefined) {
      if (canonicalCandidateJson(existing as unknown as CandidateJsonValue) !== canonicalCandidateJson(receipt as unknown as CandidateJsonValue)) {
        throw new Error("source_merge_attempt_duplicate");
      }
      continue;
    }
    receipts.set(receipt.attempt, receipt);
  }
  const selectedState = deriveLibraryAnalysisAgentTerminalState(
    selected.segment,
    selectedArtifact.kind === "terminal" ? "failed" : "accepted",
  );
  const nested = selected.segment.attempts ?? [];
  for (const receipt of nested) {
    const normalized = {
      attempt: receipt.attempt,
      inputHash: receipt.inputHash,
      responseHash: receipt.responseHash,
      status: receipt.status ?? selectedState,
      model: receipt.model,
      ...(receipt.terminalReason === undefined ? {} : { terminalReason: receipt.terminalReason }),
    };
    const existing = receipts.get(receipt.attempt);
    if (existing !== undefined) {
      if (canonicalCandidateJson(existing as unknown as CandidateJsonValue) !== canonicalCandidateJson(normalized as unknown as CandidateJsonValue)) {
        throw new Error("source_merge_attempt_duplicate");
      }
      continue;
    }
    receipts.set(receipt.attempt, normalized);
  }
  return {
    ...selected.segment,
    status: selectedState,
    attempts: [...receipts.values()].sort((left, right) => left.attempt - right.attempt),
  };
}

function readAndBindTerminalSegment(
  queueHash: string,
  job: LibraryAnalysisAgentQueue["jobs"][number],
  artifact: { path: string; attempt: number },
): import("../../src/lib/knowledge/library-analysis-agent-response").LibraryAnalysisTerminalSegment {
  const bytes = readPrivateFileByDescriptor(
    artifact.path,
    0o400,
    "source_merge_segment_artifact_invalid",
  );
  let raw: unknown;
  try {
    raw = JSON.parse(bytes.toString("utf8"));
  } catch {
    throw new Error("source_merge_segment_artifact_invalid");
  }
  const segment = LibraryAnalysisTerminalSegmentSchema.parse(raw);
  if (
    segment.queueHash !== queueHash ||
    segment.jobId !== job.jobId ||
    segment.jobHash !== job.inputEnvelopeHash ||
    segment.segmentOrdinal !== job.segmentOrdinal ||
    segment.attempt !== artifact.attempt ||
    segment.unitCoverage.length !== job.unitIds.length ||
    segment.unitCoverage.some((coverage, index) => coverage.contentUnitId !== job.unitIds[index])
  ) {
    throw new Error("source_merge_segment_binding_mismatch");
  }
  return segment;
}

function safePrivatePath(root: string, segments: readonly string[]): string {
  let current = resolve(root);
  for (const segment of segments) {
    if (!/^[a-zA-Z0-9._:-]+$/u.test(segment)) throw new Error("source_merge_segment_artifact_invalid");
    current = resolve(current, segment);
    const stat = lstatSync(current);
    if (stat.isSymbolicLink()) throw new Error("source_merge_segment_artifact_invalid");
    if (stat.isDirectory() && (stat.mode & 0o777) !== 0o700) {
      throw new Error("source_merge_segment_artifact_invalid");
    }
  }
  return current;
}

type ExplicitPrivateArtifact = { path: string; portablePath: string; bytes: Buffer };

function readSealedAttemptInput(runRoot: string, rawPath: string): ExplicitPrivateArtifact & { jobId: string; attempt: number } {
  const path = resolve(rawPath);
  const resolvedPath = realpathSync(path);
  const portablePath = relative(runRoot, resolvedPath);
  const match = /^jobs\/([a-z0-9][a-z0-9._:-]*)\/attempt-(\d{3})\/input\.json$/u.exec(portablePath);
  if (!match || portablePath.includes("\\") || portablePath.startsWith("..")) {
    throw new Error("agent_queue_attempt_input_path_invalid");
  }
  const bytes = readPrivateFileByDescriptor(path, 0o400, "agent_queue_attempt_input_artifact_invalid");
  return {
    path,
    portablePath,
    bytes,
    jobId: match[1]!,
    attempt: Number(match[2]),
  };
}

function readExplicitPrivateResponse(rawPath: string): ExplicitPrivateArtifact {
  const path = resolve(rawPath);
  return {
    path,
    portablePath: path,
    bytes: readPrivateFileByDescriptor(path, [0o400, 0o600], "agent_response_artifact_invalid"),
  };
}

function readPrivateFileByDescriptor(
  path: string,
  expectedMode: 0o400 | 0o600 | readonly (0o400 | 0o600)[],
  errorCode: string,
): Buffer {
  let descriptor: number | null = null;
  try {
    descriptor = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
    const initial = fstatSync(descriptor);
    const modes = Array.isArray(expectedMode) ? expectedMode : [expectedMode];
    if (!initial.isFile() || !modes.includes((initial.mode & 0o777) as 0o400 | 0o600)) {
      throw new Error(errorCode);
    }
    const bytes = Buffer.alloc(initial.size);
    let offset = 0;
    while (offset < bytes.length) {
      const read = readSync(descriptor, bytes, offset, bytes.length - offset, offset);
      if (read === 0) throw new Error(errorCode);
      offset += read;
    }
    const final = fstatSync(descriptor);
    if (
      !final.isFile() ||
      final.dev !== initial.dev ||
      final.ino !== initial.ino ||
      final.size !== initial.size ||
      (final.mode & 0o777) !== (initial.mode & 0o777)
    ) {
      throw new Error(errorCode);
    }
    return bytes;
  } catch (error) {
    if (error instanceof Error && error.message === errorCode) throw error;
    throw new Error(errorCode);
  } finally {
    if (descriptor !== null) closeSync(descriptor);
  }
}

function assertAttemptInputMatchesAuthoritative(
  queue: LibraryAnalysisAgentQueue,
  authoritativeJob: LibraryAnalysisVerifiedJob,
  input: LibraryAnalysisAgentAttemptInput,
): void {
  const expectedCore = {
    schema: "library-analysis-agent-job-input/v1" as const,
    queueId: queue.queueId,
    queueHash: queue.queueHash,
    jobId: authoritativeJob.job.jobId,
    attempt: input.attempt,
    expectedModel: input.expectedModel,
    job: authoritativeJob.job,
    executionPolicy: queue.executionPolicy,
    workflow: queue.workflow,
    analysisPrompt: queue.analysisPrompt,
    validationWorkflow: queue.validationWorkflow,
    validationPrompt: queue.validationPrompt,
    units: authoritativeJob.units.map(({ descriptor, text }) => ({ ...descriptor, text })),
  };
  const { inputHash: _inputHash, ...actualCore } = input;
  if (canonicalCandidateJson(actualCore as CandidateJsonValue) !== canonicalCandidateJson(expectedCore as CandidateJsonValue)) {
    throw new Error("agent_queue_attempt_input_authority_mismatch");
  }
}

function sealRawResponse(
  runRoot: string,
  input: { jobId: string; attempt: number },
  bytes: Buffer,
): void {
  const portablePath = `jobs/${input.jobId}/attempt-${String(input.attempt).padStart(3, "0")}/response.json`;
  const receipt = writePrivateArtifactExclusive(runRoot, portablePath, bytes);
  sealPrivateArtifact(runRoot, portablePath, {
    sha256: receipt.sha256,
    sizeBytes: receipt.sizeBytes,
  });
}

function sha256Bytes(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function inputHashOf(input: Record<string, unknown>): string {
  return candidateAnalysisSha256("library-analysis-agent-attempt-input", input as CandidateJsonValue);
}

function repositoryBinding(
  repositoryRoot: string,
  profile: "library_analysis_v1" | "library_validation_v1",
): {
  workflow: { id: string; version: string; path: string; hash: string };
  prompt: { id: string; version: string; path: string; hash: string };
} {
  const binding = candidateWorkflowProfile(profile);
  const hash = (path: string): string => createHash("sha256")
    .update(readFileSync(resolve(repositoryRoot, path)))
    .digest("hex");
  return {
    workflow: { ...binding.workflow, hash: hash(binding.workflow.path) },
    prompt: { ...binding.prompt, hash: hash(binding.prompt.path) },
  };
}

function openRunRoot(rawPath: string): string {
  const path = resolve(rawPath);
  const name = path.slice(path.lastIndexOf(sep) + 1);
  if (!name) throw new Error("agent_queue_run_root_invalid");
  return openPrivateLibraryAnalysisRunRoot(dirname(path), name);
}

function readQueue(runRoot: string, rawQueuePath: string): LibraryAnalysisAgentQueue {
  const queuePathInput = resolve(rawQueuePath);
  const inputStat = lstatSync(queuePathInput);
  if (inputStat.isSymbolicLink()) {
    throw new Error("agent_queue_queue_artifact_invalid");
  }
  const queuePath = realpathSync(queuePathInput);
  const portablePath = relative(runRoot, queuePath);
  if (
    portablePath.length === 0 ||
    portablePath.startsWith(`..${sep}`) ||
    portablePath === ".." ||
    isAbsolute(portablePath) ||
    portablePath.includes("\\")
  ) {
    throw new Error("agent_queue_queue_outside_run_root");
  }
  const stat = lstatSync(queuePath);
  if (stat.isSymbolicLink() || !stat.isFile() || (stat.mode & 0o777) !== 0o400) {
    throw new Error("agent_queue_queue_artifact_invalid");
  }
  const bytes = readFileSync(queuePath);
  const queue = verifyLibraryAnalysisAgentQueue(JSON.parse(bytes.toString("utf8")));
  if (portablePath !== `queue/queue-${queue.queueHash}.json`) {
    throw new Error("agent_queue_queue_path_mismatch");
  }
  return verifyLibraryAnalysisAgentQueue(
    JSON.parse(readAndVerifyPrivateArtifact(runRoot, portablePath, {
      sha256: createHash("sha256").update(bytes).digest("hex"),
      sizeBytes: stat.size,
      mode: 0o400,
    }).toString("utf8")),
  );
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function readSealedJson(runRoot: string, portablePath: string): unknown {
  return readSealedJsonWithReadback(runRoot, portablePath).value;
}

function readSealedJsonWithReadback(
  runRoot: string,
  portablePath: string,
): { value: unknown; bytes: Buffer; receipt: { portablePath: string; sha256: string; sizeBytes: number; mode: 0o400 } } {
  if (!/^[a-zA-Z0-9._:-]+(?:\/[a-zA-Z0-9._:-]+)*$/u.test(portablePath)) throw new Error("validation_artifact_invalid");
  const path = resolve(runRoot, portablePath);
  const bytes = readPrivateFileByDescriptor(path, 0o400, "validation_artifact_invalid");
  let value: unknown;
  try {
    value = JSON.parse(bytes.toString("utf8"));
  } catch {
    throw new Error("validation_artifact_invalid");
  }
  return {
    value,
    bytes,
    receipt: { portablePath, sha256: sha256Bytes(bytes), sizeBytes: bytes.length, mode: 0o400 },
  };
}

function canonicalJsonBytes(value: CandidateJsonValue): Buffer {
  return Buffer.from(`${canonicalCandidateJson(value)}\n`, "utf8");
}

async function main(): Promise<void> {
  const result = await runLibraryAnalysisAgentQueueCli(
    parseLibraryAnalysisAgentQueueArgs(process.argv.slice(2)),
  );
  if (result.command === "build") {
    process.stdout.write(`${JSON.stringify({
      command: result.command,
      queueHash: result.queueHash,
      sources: result.sources,
      units: result.units,
      jobs: result.jobs,
      automatedOnly: result.automatedOnly,
      externalReady: result.externalReady,
      auditInventoryHash: result.audit.inventoryHash,
    })}\n`);
    return;
  }
  if (result.command === "accept-attempt") {
    process.stdout.write(`${JSON.stringify({
      command: result.command,
      queueHash: result.queueHash,
      jobId: result.jobId,
      attempt: result.attempt,
      claims: result.claims,
      automatedOnly: result.automatedOnly,
      externalReady: result.externalReady,
      auditInventoryHash: result.audit.inventoryHash,
    })}\n`);
    return;
  }
  if (result.command === "merge-source") {
    process.stdout.write(`${JSON.stringify({
      command: result.command,
      queueHash: result.queueHash,
      sourceEnvelopeHash: result.sourceEnvelopeHash,
      units: result.units,
      segments: result.segments,
      claims: result.claims,
      analysisState: result.analysisState,
      automatedOnly: result.automatedOnly,
      externalReady: result.externalReady,
      auditInventoryHash: result.audit.inventoryHash,
    })}\n`);
    return;
  }
  if (result.command === "validate-source") {
    process.stdout.write(`${JSON.stringify({
      command: result.command,
      mode: result.mode,
      queueHash: result.queueHash,
      sourceEnvelopeHash: result.sourceEnvelopeHash,
      ...(result.requestPath === undefined ? {} : { request: true }),
      ...(result.resultPath === undefined ? {} : { result: true, disposition: result.disposition }),
      ...(result.claims === undefined ? {} : { claims: result.claims }),
      automatedOnly: result.automatedOnly,
      externalReady: result.externalReady,
      auditInventoryHash: result.audit.inventoryHash,
    })}\n`);
    return;
  }
  if (result.command === "status") {
    process.stdout.write(`${JSON.stringify({
      command: result.command,
      queueHash: result.queueHash,
      sources: result.sourceCount,
      units: result.unitCount,
      jobs: result.jobCount,
      state: result.state,
      reusableJobs: result.reusableJobs,
      pendingJobs: result.pendingJobs,
      quarantinedJobs: result.quarantinedJobs,
      auditInventoryHash: result.auditInventoryHash,
      automatedOnly: result.automatedOnly,
      externalReady: result.externalReady,
    })}\n`);
    return;
  }
  if (result.command === "finalize") {
    process.stdout.write(`${JSON.stringify({
      command: result.command,
      queueHash: result.queueHash,
      receipt: result.receipt,
      postPublicationAuditInventoryHash: result.postPublicationAuditInventoryHash,
      automatedOnly: result.automatedOnly,
      externalReady: result.externalReady,
    })}\n`);
    return;
  }
  process.stdout.write(`${JSON.stringify({
    command: result.command,
    queueHash: result.queueHash,
    jobId: result.jobId,
    attempt: result.attempt,
    units: result.units,
    codePoints: result.codePoints,
    automatedOnly: result.automatedOnly,
    externalReady: result.externalReady,
    auditInventoryHash: result.audit.inventoryHash,
  })}\n`);
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  main().catch(() => {
    process.stderr.write("library_analysis_agent_queue_failed\n");
    process.exitCode = 1;
  });
}
