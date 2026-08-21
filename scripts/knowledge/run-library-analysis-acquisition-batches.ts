#!/usr/bin/env node

import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { basename, dirname, isAbsolute, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import {
  LibraryAnalysisAcquisitionBatchSetManifestSchema,
  type LibraryAnalysisAcquisitionBatchSetManifest,
} from "../../src/lib/knowledge/library-analysis-acquisition-batches";
import {
  LibraryAnalysisAcquisitionPlanSchema,
  LibraryAnalysisAcquisitionResolutionSchema,
} from "../../src/lib/knowledge/library-analysis-acquisition-contract";
import {
  LibraryAnalysisPopulationSnapshotSchema,
} from "../../src/lib/knowledge/library-analysis-population";
import {
  auditPrivateLibraryAnalysisRunRoot,
  openPrivateLibraryAnalysisRunRoot,
  readAndVerifyPrivateArtifact,
  sealPrivateArtifact,
  writePrivateArtifactExclusive,
  writePrivateManifestAtomic,
} from "../../src/lib/knowledge/private-library-analysis-artifact-store";
import {
  runLibraryAnalysisAcquisitionExecutionCli,
} from "./execute-library-analysis-acquisition";
import {
  runLibraryAnalysisPrivateEmitCli,
  verifyLibraryAnalysisContentUnitManifest,
  type LibraryAnalysisPrivateEmitOutput,
} from "./emit-library-analysis-content-units";
import {
  mergeLibraryAnalysisAcquisitionBatchOutputs,
  type LibraryAnalysisCompletedBatch,
} from "./merge-library-analysis-acquisition-batches";

export type LibraryAnalysisBatchAttemptState = {
  attempt: number;
  completed: boolean;
};

export function selectLibraryAnalysisBatchAttempt(
  states: readonly LibraryAnalysisBatchAttemptState[],
): { reuseAttempt: number | null; nextAttempt: number | null } {
  const attempts = new Set<number>();
  let maximum = 0;
  let completed: number | null = null;
  for (const state of states) {
    if (!Number.isSafeInteger(state.attempt) || state.attempt < 1 || attempts.has(state.attempt)) {
      throw new Error("library_analysis_batch_attempt_state_invalid");
    }
    attempts.add(state.attempt);
    maximum = Math.max(maximum, state.attempt);
    if (state.completed && (completed === null || state.attempt > completed)) {
      completed = state.attempt;
    }
  }
  return completed === null
    ? { reuseAttempt: null, nextAttempt: maximum + 1 }
    : { reuseAttempt: completed, nextAttempt: null };
}

export type LibraryAnalysisBatchRunCliOptions = {
  snapshot: string;
  plan: string;
  batchSetRoot: string;
  executionRoot: string;
  executeNetwork: true;
};

export function parseLibraryAnalysisBatchRunArgs(
  arguments_: readonly string[],
): LibraryAnalysisBatchRunCliOptions {
  const values = new Map<string, string>();
  let executeNetwork = false;
  for (const argument of arguments_) {
    if (argument === "--execute-network") {
      if (executeNetwork) throw new Error("library_analysis_batch_run_arguments_invalid");
      executeNetwork = true;
      continue;
    }
    const match = /^--(snapshot|plan|batch-set-root|execution-root)=(.*)$/u.exec(argument);
    if (!match || values.has(match[1]!)) {
      throw new Error("library_analysis_batch_run_arguments_invalid");
    }
    values.set(match[1]!, match[2]!);
  }
  const snapshot = absolutePath(values.get("snapshot"));
  const plan = absolutePath(values.get("plan"));
  const batchSetRoot = absolutePath(values.get("batch-set-root"));
  const executionRoot = absolutePath(values.get("execution-root"));
  if (!snapshot || !plan || !batchSetRoot || !executionRoot || !executeNetwork) {
    throw new Error("library_analysis_batch_run_arguments_invalid");
  }
  return { snapshot, plan, batchSetRoot, executionRoot, executeNetwork: true };
}

export type LibraryAnalysisBatchRunSummary = {
  batchSetHash: string;
  batches: number;
  resumedBatches: number;
  executedBatches: number;
  resolutionHash: string;
  contentUnitManifestHash: string;
  costEnvelopeHash: string;
  sourcesReady: number;
  contentUnits: number;
  blockedSources: number;
  automatedOnly: true;
  externalReady: false;
  batchAuditInventoryHashes: string[];
  mergeAuditInventoryHash: string;
};

export async function runLibraryAnalysisAcquisitionBatches(
  options: LibraryAnalysisBatchRunCliOptions,
  onProgress: (progress: { sequence: number; batches: number; reused: boolean }) => void = () => {},
): Promise<LibraryAnalysisBatchRunSummary> {
  const snapshot = LibraryAnalysisPopulationSnapshotSchema.parse(readJson(options.snapshot));
  const plan = LibraryAnalysisAcquisitionPlanSchema.parse(readJson(options.plan));
  const batchSet = LibraryAnalysisAcquisitionBatchSetManifestSchema.parse(
    readJson(join(options.batchSetRoot, "batch-set.v1.json")),
  );
  const executionRoot = openPrivateLibraryAnalysisRunRoot(
    dirname(options.executionRoot),
    basename(options.executionRoot),
  );
  const completedBatches: LibraryAnalysisCompletedBatch[] = [];
  const batchAuditInventoryHashes: string[] = [];
  let resumedBatches = 0;
  let executedBatches = 0;
  for (const descriptor of batchSet.batches) {
    const preparedRoot = join(options.batchSetRoot, "batches", descriptor.batchId);
    const batchSnapshotPath = join(preparedRoot, "population.v1.json");
    const batchPlanPath = join(preparedRoot, "acquisition-plan.v1.json");
    const batchSnapshot = LibraryAnalysisPopulationSnapshotSchema.parse(readJson(batchSnapshotPath));
    const batchPlan = LibraryAnalysisAcquisitionPlanSchema.parse(readJson(batchPlanPath));
    const attemptBase = join(executionRoot, "batches", descriptor.batchId);
    const existing = discoverAttempts(attemptBase);
    const selection = selectLibraryAnalysisBatchAttempt(existing);
    let attempt: number;
    let attemptRoot: string;
    let output: LibraryAnalysisPrivateEmitOutput;
    if (selection.reuseAttempt !== null) {
      attempt = selection.reuseAttempt;
      attemptRoot = join(attemptBase, attemptName(attempt));
      output = readCompletedOutput(join(attemptRoot, "bundle.v1.json"));
      resumedBatches += 1;
    } else {
      attempt = selection.nextAttempt!;
      attemptRoot = openPrivateLibraryAnalysisRunRoot(attemptBase, attemptName(attempt));
      await runLibraryAnalysisAcquisitionExecutionCli({
        plan: batchPlanPath,
        runRoot: attemptRoot,
        mode: "execute_network",
      });
      output = await runLibraryAnalysisPrivateEmitCli({
        snapshot: batchSnapshotPath,
        plan: batchPlanPath,
        runRoot: attemptRoot,
        output: join(attemptRoot, "bundle.v1.json"),
      });
      executedBatches += 1;
    }
    const audit = auditPrivateLibraryAnalysisRunRoot(attemptRoot);
    batchAuditInventoryHashes.push(audit.inventoryHash);
    completedBatches.push({
      descriptor,
      snapshot: batchSnapshot,
      plan: batchPlan,
      output,
      readUnit: async (portablePath) => {
        const unit = output.contentUnitManifest.units.find(
          (candidate) => candidate.privateArtifact.portablePath === portablePath,
        );
        if (!unit) throw new Error("library_analysis_batch_run_unit_unknown");
        return readAndVerifyPrivateArtifact(attemptRoot, portablePath, {
          sha256: unit.privateArtifact.sha256,
          sizeBytes: unit.privateArtifact.sizeBytes,
          mode: 0o400,
        }).toString("utf8");
      },
    });
    onProgress({ sequence: descriptor.sequence, batches: batchSet.batches.length,
      reused: selection.reuseAttempt !== null });
  }

  const mergeBase = join(executionRoot, "merged");
  const mergeAttempt = nextMergeAttempt(mergeBase);
  const mergeRoot = openPrivateLibraryAnalysisRunRoot(mergeBase, attemptName(mergeAttempt));
  const merged = await mergeLibraryAnalysisAcquisitionBatchOutputs({
    snapshot,
    plan,
    batchSet,
    batches: completedBatches,
    writeUnit: async (portablePath, text) => writeAndSeal(mergeRoot, portablePath, text),
  });
  writePrivateManifestAtomic(
    mergeRoot,
    `manifests/resolution-${merged.resolution.resolutionHash}.json`,
    jsonBytes(merged.resolution),
  );
  writePrivateManifestAtomic(
    mergeRoot,
    `manifests/content-units-${merged.contentUnitManifest.manifestHash}.json`,
    jsonBytes(merged.contentUnitManifest),
  );
  writePrivateManifestAtomic(
    mergeRoot,
    `manifests/cost-envelope-${merged.costEnvelope.envelopeHash}.json`,
    jsonBytes(merged.costEnvelope),
  );
  writePrivateManifestAtomic(mergeRoot, "bundle.v1.json", jsonBytes(merged));
  const mergeAudit = auditPrivateLibraryAnalysisRunRoot(mergeRoot);
  return {
    batchSetHash: batchSet.batchSetHash,
    batches: batchSet.batches.length,
    resumedBatches,
    executedBatches,
    resolutionHash: merged.resolution.resolutionHash,
    contentUnitManifestHash: merged.contentUnitManifest.manifestHash,
    costEnvelopeHash: merged.costEnvelope.envelopeHash,
    sourcesReady: merged.costEnvelope.totals.sourcesReady,
    contentUnits: merged.costEnvelope.totals.contentUnits,
    blockedSources: merged.resolution.rows.filter((row) =>
      row.disposition !== "content_units_ready" && row.disposition !== "superseded").length,
    automatedOnly: true,
    externalReady: false,
    batchAuditInventoryHashes,
    mergeAuditInventoryHash: mergeAudit.inventoryHash,
  };
}

function discoverAttempts(base: string): LibraryAnalysisBatchAttemptState[] {
  if (!existsSync(base)) return [];
  const stat = lstatSync(base);
  if (!stat.isDirectory() || stat.isSymbolicLink()) {
    throw new Error("library_analysis_batch_attempt_base_invalid");
  }
  return readdirSync(base, { withFileTypes: true }).flatMap((entry) => {
    const match = /^attempt-([0-9]{3})$/u.exec(entry.name);
    if (!match) return [];
    if (!entry.isDirectory() || entry.isSymbolicLink()) {
      throw new Error("library_analysis_batch_attempt_directory_invalid");
    }
    const attempt = Number(match[1]);
    const bundlePath = join(base, entry.name, "bundle.v1.json");
    let completed = false;
    if (existsSync(bundlePath)) {
      try {
        readCompletedOutput(bundlePath);
        completed = true;
      } catch {
        completed = false;
      }
    }
    return [{ attempt, completed }];
  });
}

function readCompletedOutput(path: string): LibraryAnalysisPrivateEmitOutput {
  const output = readJson(path) as LibraryAnalysisPrivateEmitOutput;
  if (output.schema !== "library-analysis-private-emit/v1") {
    throw new Error("library_analysis_batch_output_invalid");
  }
  LibraryAnalysisAcquisitionResolutionSchema.parse(output.resolution);
  verifyLibraryAnalysisContentUnitManifest(output.contentUnitManifest);
  return output;
}

function nextMergeAttempt(base: string): number {
  if (!existsSync(base)) return 1;
  const attempts = readdirSync(base).flatMap((name) => {
    const match = /^attempt-([0-9]{3})$/u.exec(name);
    return match ? [Number(match[1])] : [];
  });
  return attempts.length === 0 ? 1 : Math.max(...attempts) + 1;
}

function writeAndSeal(root: string, portablePath: string, text: string): void {
  const bytes = Buffer.from(text, "utf8");
  const written = writePrivateArtifactExclusive(root, portablePath, bytes);
  sealPrivateArtifact(root, portablePath, {
    sha256: written.sha256,
    sizeBytes: written.sizeBytes,
  });
}

function attemptName(attempt: number): string {
  if (!Number.isSafeInteger(attempt) || attempt < 1 || attempt > 999) {
    throw new Error("library_analysis_batch_attempt_invalid");
  }
  return `attempt-${String(attempt).padStart(3, "0")}`;
}

function absolutePath(value: string | undefined): string | null {
  return value && isAbsolute(value) ? resolve(value) : null;
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function jsonBytes(value: unknown): Buffer {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function main(): Promise<void> {
  const summary = await runLibraryAnalysisAcquisitionBatches(
    parseLibraryAnalysisBatchRunArgs(process.argv.slice(2)),
    (progress) => process.stdout.write(`${JSON.stringify({ type: "batch_progress", ...progress })}\n`),
  );
  process.stdout.write(`${JSON.stringify({ type: "batch_complete", ...summary })}\n`);
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  main().catch(() => {
    process.stderr.write("library_analysis_batch_run_failed\n");
    process.exitCode = 1;
  });
}
