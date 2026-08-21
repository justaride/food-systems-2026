#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { basename, dirname, isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import {
  LibraryAnalysisAcquisitionBatchPolicySchema,
  partitionLibraryAnalysisAcquisition,
  type LibraryAnalysisAcquisitionBatchPartition,
} from "../../src/lib/knowledge/library-analysis-acquisition-batches";
import {
  LibraryAnalysisAcquisitionPlanSchema,
} from "../../src/lib/knowledge/library-analysis-acquisition-contract";
import {
  LibraryAnalysisPopulationSnapshotSchema,
} from "../../src/lib/knowledge/library-analysis-population";
import {
  openPrivateLibraryAnalysisRunRoot,
  writePrivateManifestAtomic,
} from "../../src/lib/knowledge/private-library-analysis-artifact-store";

export type LibraryAnalysisBatchPreparationCliOptions = {
  snapshot: string;
  plan: string;
  outputRoot: string;
  localBatchSize: number;
  externalBatchSize: number;
};

export function parseLibraryAnalysisBatchPreparationArgs(
  arguments_: readonly string[],
): LibraryAnalysisBatchPreparationCliOptions {
  const values = new Map<string, string>();
  for (const argument of arguments_) {
    const match = /^--(snapshot|plan|output-root|local-batch-size|external-batch-size)=(.*)$/u.exec(argument);
    if (!match || values.has(match[1]!)) {
      throw new Error("library_analysis_batch_preparation_arguments_invalid");
    }
    values.set(match[1]!, match[2]!);
  }
  const snapshot = parseAbsolute(values.get("snapshot"));
  const plan = parseAbsolute(values.get("plan"));
  const outputRoot = parseAbsolute(values.get("output-root"));
  const localBatchSize = parseInteger(values.get("local-batch-size") ?? "200");
  const externalBatchSize = parseInteger(values.get("external-batch-size") ?? "5");
  const policy = LibraryAnalysisAcquisitionBatchPolicySchema.safeParse({
    version: "1.0.0",
    localBatchSize,
    externalBatchSize,
  });
  if (!snapshot || !plan || !outputRoot || !policy.success) {
    throw new Error("library_analysis_batch_preparation_arguments_invalid");
  }
  return { snapshot, plan, outputRoot, localBatchSize, externalBatchSize };
}

export function runLibraryAnalysisBatchPreparationCli(
  options: LibraryAnalysisBatchPreparationCliOptions,
): LibraryAnalysisAcquisitionBatchPartition {
  const snapshot = LibraryAnalysisPopulationSnapshotSchema.parse(
    JSON.parse(readFileSync(options.snapshot, "utf8")),
  );
  const plan = LibraryAnalysisAcquisitionPlanSchema.parse(
    JSON.parse(readFileSync(options.plan, "utf8")),
  );
  const partition = partitionLibraryAnalysisAcquisition({
    snapshot,
    plan,
    policy: {
      version: "1.0.0",
      localBatchSize: options.localBatchSize,
      externalBatchSize: options.externalBatchSize,
    },
  });
  const outputRoot = openPrivateLibraryAnalysisRunRoot(
    dirname(options.outputRoot),
    basename(options.outputRoot),
  );
  writePrivateManifestAtomic(outputRoot, "batch-set.v1.json", jsonBytes(partition.manifest));
  for (const batch of partition.batches) {
    const prefix = `batches/${batch.descriptor.batchId}`;
    writePrivateManifestAtomic(
      outputRoot,
      `${prefix}/population.v1.json`,
      jsonBytes(batch.snapshot),
    );
    writePrivateManifestAtomic(
      outputRoot,
      `${prefix}/acquisition-plan.v1.json`,
      jsonBytes(batch.plan),
    );
  }
  return partition;
}

function parseAbsolute(value: string | undefined): string | null {
  if (!value || !isAbsolute(value)) return null;
  return resolve(value);
}

function parseInteger(value: string): number {
  if (!/^[0-9]+$/u.test(value)) return Number.NaN;
  return Number(value);
}

function jsonBytes(value: unknown): Buffer {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function main(): Promise<void> {
  const output = runLibraryAnalysisBatchPreparationCli(
    parseLibraryAnalysisBatchPreparationArgs(process.argv.slice(2)),
  );
  process.stdout.write(`${JSON.stringify({
    batchSetHash: output.manifest.batchSetHash,
    rows: output.manifest.rowCount,
    batches: output.manifest.batches.length,
    localBatches: output.manifest.batches.filter((batch) => batch.kind === "local").length,
    externalBatches: output.manifest.batches.filter(
      (batch) => batch.kind === "controlled_https",
    ).length,
  })}\n`);
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  main().catch(() => {
    process.stderr.write("library_analysis_batch_preparation_failed\n");
    process.exitCode = 1;
  });
}
