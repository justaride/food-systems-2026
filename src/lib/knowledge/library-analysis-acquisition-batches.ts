import { z } from "zod";

import {
  buildLibraryAnalysisAcquisitionPlan,
  LibraryAnalysisAcquisitionPlanSchema,
  type LibraryAnalysisAcquisitionLocator,
  type LibraryAnalysisAcquisitionPlan,
} from "./library-analysis-acquisition-contract";
import {
  candidateAnalysisSha256,
  compareCandidateJsonKeysUtf8,
} from "./candidate-analysis-contract";
import {
  LIBRARY_ANALYSIS_POPULATION_SCHEMA,
  LibraryAnalysisPopulationSnapshotSchema,
  libraryAnalysisPopulationHash,
  type LibraryAnalysisPopulationSnapshot,
} from "./library-analysis-population";

const hashSchema = z.string().regex(/^[a-f0-9]{64}$/);

export const LibraryAnalysisAcquisitionBatchPolicySchema = z.object({
  version: z.literal("1.0.0"),
  localBatchSize: z.number().int().min(1).max(500),
  externalBatchSize: z.number().int().min(1).max(10),
}).strict();

export type LibraryAnalysisAcquisitionBatchPolicy = z.infer<
  typeof LibraryAnalysisAcquisitionBatchPolicySchema
>;

const batchDescriptorSchema = z.object({
  batchId: z.string().regex(/^(local|controlled-https)-[0-9]{3}-[a-f0-9]{12}$/),
  sequence: z.number().int().positive(),
  kind: z.enum(["local", "controlled_https"]),
  rowCount: z.number().int().positive(),
  routeCounts: z.record(z.string(), z.number().int().positive()),
  populationHash: hashSchema,
  planHash: hashSchema,
}).strict();

const batchSetCoreSchema = z.object({
  schema: z.literal("library-analysis-acquisition-batch-set/v1"),
  policy: LibraryAnalysisAcquisitionBatchPolicySchema,
  parentPopulationHash: hashSchema,
  parentPlanHash: hashSchema,
  rowCount: z.number().int().positive(),
  batches: z.array(batchDescriptorSchema).min(1),
}).strict();

export const LibraryAnalysisAcquisitionBatchSetManifestSchema = batchSetCoreSchema.extend({
  batchSetHash: hashSchema,
}).strict().superRefine((manifest, context) => {
  if (manifest.batchSetHash !== libraryAnalysisAcquisitionBatchSetHash(manifest)) {
    context.addIssue({ code: "custom", message: "acquisition_batch_set_hash_mismatch" });
  }
  if (manifest.batches.reduce((total, batch) => total + batch.rowCount, 0) !== manifest.rowCount) {
    context.addIssue({ code: "custom", message: "acquisition_batch_set_row_count_mismatch" });
  }
  const ids = new Set<string>();
  for (const [index, batch] of manifest.batches.entries()) {
    if (batch.sequence !== index + 1 || ids.has(batch.batchId)) {
      context.addIssue({ code: "custom", message: "acquisition_batch_set_order_invalid" });
      return;
    }
    ids.add(batch.batchId);
  }
});

export type LibraryAnalysisAcquisitionBatchSetManifest = z.infer<
  typeof LibraryAnalysisAcquisitionBatchSetManifestSchema
>;

export type LibraryAnalysisAcquisitionBatchScope = {
  descriptor: LibraryAnalysisAcquisitionBatchSetManifest["batches"][number];
  kind: "local" | "controlled_https";
  snapshot: LibraryAnalysisPopulationSnapshot;
  plan: LibraryAnalysisAcquisitionPlan;
};

export type LibraryAnalysisAcquisitionBatchPartition = {
  manifest: LibraryAnalysisAcquisitionBatchSetManifest;
  batches: LibraryAnalysisAcquisitionBatchScope[];
};

export function libraryAnalysisAcquisitionBatchSetHash(
  input: Omit<LibraryAnalysisAcquisitionBatchSetManifest, "batchSetHash"> |
    LibraryAnalysisAcquisitionBatchSetManifest,
): string {
  return candidateAnalysisSha256("library-analysis-acquisition-batch-set", {
    schema: input.schema,
    policy: input.policy,
    parentPopulationHash: input.parentPopulationHash,
    parentPlanHash: input.parentPlanHash,
    rowCount: input.rowCount,
    batches: input.batches,
  });
}

export function partitionLibraryAnalysisAcquisition(input: {
  snapshot: LibraryAnalysisPopulationSnapshot;
  plan: LibraryAnalysisAcquisitionPlan;
  policy: LibraryAnalysisAcquisitionBatchPolicy;
}): LibraryAnalysisAcquisitionBatchPartition {
  const snapshot = LibraryAnalysisPopulationSnapshotSchema.parse(input.snapshot);
  const plan = LibraryAnalysisAcquisitionPlanSchema.parse(input.plan);
  const policy = LibraryAnalysisAcquisitionBatchPolicySchema.parse(input.policy);
  if (
    plan.populationSnapshotId !== snapshot.snapshotId ||
    plan.populationHash !== snapshot.populationHash ||
    plan.rows.length !== snapshot.rows.length
  ) {
    throw new Error("library_analysis_batch_parent_binding_mismatch");
  }

  const localRows = plan.rows.filter((row) => row.route !== "controlled_https");
  const externalRows = plan.rows.filter((row) => row.route === "controlled_https");
  const groups = [
    ...chunk(localRows, policy.localBatchSize).map((rows) => ({ kind: "local" as const, rows })),
    ...chunk(externalRows, policy.externalBatchSize).map((rows) => ({
      kind: "controlled_https" as const,
      rows,
    })),
  ];
  if (groups.length === 0) throw new Error("library_analysis_batch_population_empty");

  const populationByIdentity = new Map(snapshot.rows.map((row) => [identity(row), row]));
  const seen = new Set<string>();
  const scopes: LibraryAnalysisAcquisitionBatchScope[] = groups.map((group, index) => {
    const selectedPopulationRows = group.rows.map((row) => {
      const key = identity(row);
      if (seen.has(key)) throw new Error("library_analysis_batch_identity_duplicate");
      seen.add(key);
      const populationRow = populationByIdentity.get(key);
      if (!populationRow) throw new Error("library_analysis_batch_identity_outside_population");
      return populationRow;
    });
    const populationCore = {
      schema: LIBRARY_ANALYSIS_POPULATION_SCHEMA,
      rows: selectedPopulationRows,
    } as const;
    const populationHash = libraryAnalysisPopulationHash(populationCore);
    const batchSnapshot = LibraryAnalysisPopulationSnapshotSchema.parse({
      ...populationCore,
      snapshotId: `library-analysis-population:${populationHash}`,
      populationHash,
    });
    const locators: LibraryAnalysisAcquisitionLocator[] = group.rows.flatMap((row) => {
      if (row.route === "database_document" || row.route === "superseded") return [];
      return [{
        sourceKind: row.sourceKind,
        sourceKey: row.sourceKey,
        route: row.route,
        locator: row.locator,
        alternateLocators: row.alternateLocators,
      } as LibraryAnalysisAcquisitionLocator];
    });
    const batchPlan = buildLibraryAnalysisAcquisitionPlan(batchSnapshot, locators);
    if (JSON.stringify(batchPlan.rows) !== JSON.stringify(group.rows)) {
      throw new Error("library_analysis_batch_plan_projection_mismatch");
    }
    const routeCounts: Record<string, number> = {};
    for (const row of batchPlan.rows) routeCounts[row.route] = (routeCounts[row.route] ?? 0) + 1;
    const batchIdentityHash = candidateAnalysisSha256("library-analysis-acquisition-batch", {
      parentPopulationHash: snapshot.populationHash,
      parentPlanHash: plan.planHash,
      policy,
      kind: group.kind,
      identities: group.rows.map((row) => ({
        sourceKind: row.sourceKind,
        sourceKey: row.sourceKey,
      })),
    });
    const descriptor = batchDescriptorSchema.parse({
      batchId: `${group.kind === "local" ? "local" : "controlled-https"}-${String(index + 1).padStart(3, "0")}-${batchIdentityHash.slice(0, 12)}`,
      sequence: index + 1,
      kind: group.kind,
      rowCount: batchPlan.rows.length,
      routeCounts: Object.fromEntries(Object.entries(routeCounts).sort(([left], [right]) =>
        compareCandidateJsonKeysUtf8(left, right))),
      populationHash: batchSnapshot.populationHash,
      planHash: batchPlan.planHash,
    });
    return { descriptor, kind: group.kind, snapshot: batchSnapshot, plan: batchPlan };
  });
  if (seen.size !== plan.rows.length) throw new Error("library_analysis_batch_population_incomplete");

  const core = batchSetCoreSchema.parse({
    schema: "library-analysis-acquisition-batch-set/v1",
    policy,
    parentPopulationHash: snapshot.populationHash,
    parentPlanHash: plan.planHash,
    rowCount: plan.rows.length,
    batches: scopes.map((scope) => scope.descriptor),
  });
  const manifest = LibraryAnalysisAcquisitionBatchSetManifestSchema.parse({
    ...core,
    batchSetHash: libraryAnalysisAcquisitionBatchSetHash(core),
  });
  return { manifest, batches: scopes };
}

function chunk<T>(rows: readonly T[], size: number): T[][] {
  const groups: T[][] = [];
  for (let offset = 0; offset < rows.length; offset += size) {
    groups.push(rows.slice(offset, offset + size));
  }
  return groups;
}

function identity(row: { sourceKind: string; sourceKey: string }): string {
  return `${row.sourceKind}\u0000${row.sourceKey}`;
}
