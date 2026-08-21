#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { z } from "zod";

import {
  canonicalCandidateJson,
  candidateWorkflowProfile,
  type CandidateJsonValue,
} from "../../src/lib/knowledge/candidate-analysis-contract";
import {
  buildLibraryAnalysisAgentQueue,
  loadVerifiedLibraryAnalysisJob,
  verifyLibraryAnalysisAgentQueue,
  type LibraryAnalysisAgentQueue,
} from "../../src/lib/knowledge/library-analysis-agent-queue";
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
}).strict();

export type BuildQueueOptions = z.infer<typeof buildOptionsSchema>;
export type PrepareAttemptOptions = z.infer<typeof prepareOptionsSchema>;
export type LibraryAnalysisAgentQueueCommand = BuildQueueOptions | PrepareAttemptOptions;

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

export type LibraryAnalysisAgentQueueCliResult =
  | LibraryAnalysisAgentQueueBuildResult
  | LibraryAnalysisAgentQueueAttemptResult;

export function parseLibraryAnalysisAgentQueueArgs(
  argv: readonly string[],
): LibraryAnalysisAgentQueueCommand {
  const command = argv[0];
  if (command !== "build" && command !== "prepare-attempt") {
    throw new Error("agent_queue_cli_arguments_invalid");
  }
  const values = new Map<string, string>();
  for (const argument of argv.slice(1)) {
    const match = /^--([a-z-]+)=(.*)$/u.exec(argument);
    const allowed = command === "build"
      ? ["run-root", "resolution", "manifest", "cost-envelope-hash", "merged-inventory-hash", "runtime-commit", "repository-root"]
      : ["run-root", "queue", "job-id", "attempt"];
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
  const attempt = value("attempt");
  try {
    return prepareOptionsSchema.parse({
      command,
      runRoot: value("run-root"),
      queue: value("queue"),
      jobId: value("job-id"),
      attempt: attempt === undefined ? undefined : Number(attempt),
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
  options: LibraryAnalysisAgentQueueCommand,
): Promise<LibraryAnalysisAgentQueueCliResult>;
export async function runLibraryAnalysisAgentQueueCli(
  options: LibraryAnalysisAgentQueueCommand,
): Promise<LibraryAnalysisAgentQueueCliResult> {
  if (options.command === "build") return runBuildQueue(options);
  return runPrepareAttempt(options);
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
  const loaded = loadVerifiedLibraryAnalysisJob(runRoot, queue, options.jobId);
  const input = {
    schema: "library-analysis-agent-job-input/v1" as const,
    queueId: queue.queueId,
    queueHash: queue.queueHash,
    jobId: loaded.job.jobId,
    attempt: options.attempt,
    job: loaded.job,
    executionPolicy: queue.executionPolicy,
    workflow: queue.workflow,
    analysisPrompt: queue.analysisPrompt,
    validationWorkflow: queue.validationWorkflow,
    validationPrompt: queue.validationPrompt,
    units: loaded.units.map(({ descriptor, text }) => ({ ...descriptor, text })),
  };
  const portablePath = `jobs/${loaded.job.jobId}/attempt-${String(options.attempt).padStart(3, "0")}/input.json`;
  const bytes = canonicalJsonBytes(input as CandidateJsonValue);
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
  const queuePath = resolve(rawQueuePath);
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
  const bytes = readFileSync(queuePath);
  const queue = verifyLibraryAnalysisAgentQueue(JSON.parse(bytes.toString("utf8")));
  return verifyLibraryAnalysisAgentQueue(
    JSON.parse(readAndVerifyPrivateArtifact(runRoot, portablePath, {
      sha256: createHash("sha256").update(bytes).digest("hex"),
      sizeBytes: bytes.length,
      mode: 0o400,
    }).toString("utf8")),
  );
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
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
