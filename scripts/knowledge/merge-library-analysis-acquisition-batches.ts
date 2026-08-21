#!/usr/bin/env node

import {
  LibraryAnalysisAcquisitionBatchSetManifestSchema,
  partitionLibraryAnalysisAcquisition,
  type LibraryAnalysisAcquisitionBatchSetManifest,
} from "../../src/lib/knowledge/library-analysis-acquisition-batches";
import {
  LibraryAnalysisAcquisitionPlanSchema,
  LibraryAnalysisAcquisitionResolutionSchema,
  sealLibraryAnalysisResolution,
  type LibraryAnalysisAcquisitionPlan,
} from "../../src/lib/knowledge/library-analysis-acquisition-contract";
import {
  candidateAnalysisSha256,
  compareCandidateJsonKeysUtf8,
} from "../../src/lib/knowledge/candidate-analysis-contract";
import {
  LibraryAnalysisPopulationSnapshotSchema,
  type LibraryAnalysisPopulationSnapshot,
} from "../../src/lib/knowledge/library-analysis-population";
import {
  verifyLibraryAnalysisContentUnitManifest,
  verifyPrivateUnitText,
  type EmittedLibraryAnalysisContentUnit,
  type LibraryAnalysisContentUnitManifest,
  type LibraryAnalysisCostEnvelope,
  type LibraryAnalysisPrivateEmitOutput,
} from "./emit-library-analysis-content-units";

export type LibraryAnalysisCompletedBatch = {
  descriptor: LibraryAnalysisAcquisitionBatchSetManifest["batches"][number];
  snapshot: LibraryAnalysisPopulationSnapshot;
  plan: LibraryAnalysisAcquisitionPlan;
  output: LibraryAnalysisPrivateEmitOutput;
  readUnit: (portablePath: string) => Promise<string>;
};

export async function mergeLibraryAnalysisAcquisitionBatchOutputs(input: {
  snapshot: LibraryAnalysisPopulationSnapshot;
  plan: LibraryAnalysisAcquisitionPlan;
  batchSet: LibraryAnalysisAcquisitionBatchSetManifest;
  batches: readonly LibraryAnalysisCompletedBatch[];
  writeUnit: (portablePath: string, text: string) => Promise<void>;
}): Promise<LibraryAnalysisPrivateEmitOutput> {
  const snapshot = LibraryAnalysisPopulationSnapshotSchema.parse(input.snapshot);
  const plan = LibraryAnalysisAcquisitionPlanSchema.parse(input.plan);
  const batchSet = LibraryAnalysisAcquisitionBatchSetManifestSchema.parse(input.batchSet);
  if (
    plan.populationHash !== snapshot.populationHash ||
    plan.populationSnapshotId !== snapshot.snapshotId ||
    batchSet.parentPopulationHash !== snapshot.populationHash ||
    batchSet.parentPlanHash !== plan.planHash
  ) {
    throw new Error("library_analysis_batch_merge_parent_binding_mismatch");
  }
  const expected = partitionLibraryAnalysisAcquisition({
    snapshot,
    plan,
    policy: batchSet.policy,
  });
  if (JSON.stringify(expected.manifest) !== JSON.stringify(batchSet)) {
    throw new Error("library_analysis_batch_merge_manifest_replay_mismatch");
  }
  if (input.batches.length !== batchSet.batches.length) {
    throw new Error("library_analysis_batch_merge_incomplete");
  }

  const byBatchId = new Map(input.batches.map((batch) => [batch.descriptor.batchId, batch]));
  if (byBatchId.size !== input.batches.length) {
    throw new Error("library_analysis_batch_merge_duplicate_batch");
  }
  const resolutionRows = [];
  const units: EmittedLibraryAnalysisContentUnit[] = [];
  const unitIds = new Set<string>();
  const writtenHashes = new Set<string>();
  let chunkPolicyHash: string | null = null;
  for (const expectedBatch of expected.batches) {
    const batch = byBatchId.get(expectedBatch.descriptor.batchId);
    if (
      !batch ||
      JSON.stringify(batch.descriptor) !== JSON.stringify(expectedBatch.descriptor)
    ) {
      throw new Error("library_analysis_batch_merge_descriptor_mismatch");
    }
    const batchSnapshot = LibraryAnalysisPopulationSnapshotSchema.parse(batch.snapshot);
    const batchPlan = LibraryAnalysisAcquisitionPlanSchema.parse(batch.plan);
    if (
      batchSnapshot.populationHash !== batch.descriptor.populationHash ||
      batchPlan.planHash !== batch.descriptor.planHash ||
      JSON.stringify(batchSnapshot) !== JSON.stringify(expectedBatch.snapshot) ||
      JSON.stringify(batchPlan) !== JSON.stringify(expectedBatch.plan)
    ) {
      throw new Error("library_analysis_batch_merge_scope_mismatch");
    }
    if (batch.output.schema !== "library-analysis-private-emit/v1") {
      throw new Error("library_analysis_batch_merge_output_schema_invalid");
    }
    const resolution = LibraryAnalysisAcquisitionResolutionSchema.parse(batch.output.resolution);
    const manifest = verifyLibraryAnalysisContentUnitManifest(batch.output.contentUnitManifest);
    verifyCostEnvelope(batch.output.costEnvelope, manifest, resolution.resolutionHash);
    if (
      batch.output.populationTotal !== batchSnapshot.rows.length ||
      resolution.populationHash !== batchSnapshot.populationHash ||
      resolution.planHash !== batchPlan.planHash ||
      manifest.populationHash !== batchSnapshot.populationHash ||
      manifest.planHash !== batchPlan.planHash ||
      manifest.resolutionHash !== resolution.resolutionHash
    ) {
      throw new Error("library_analysis_batch_merge_output_binding_mismatch");
    }
    if (chunkPolicyHash !== null && chunkPolicyHash !== manifest.chunkPolicyHash) {
      throw new Error("library_analysis_batch_merge_chunk_policy_mismatch");
    }
    chunkPolicyHash = manifest.chunkPolicyHash;
    const resolvedUnitIds = new Set(resolution.rows.flatMap((row) =>
      row.contentUnits.map((unit) => unit.contentUnitId)));
    if (
      resolvedUnitIds.size !== manifest.units.length ||
      manifest.units.some((unit) => !resolvedUnitIds.has(unit.id))
    ) {
      throw new Error("library_analysis_batch_merge_unit_resolution_mismatch");
    }
    resolutionRows.push(...resolution.rows);
    for (const unit of manifest.units) {
      if (unitIds.has(unit.id)) throw new Error("library_analysis_batch_merge_unit_duplicate");
      unitIds.add(unit.id);
      const text = await batch.readUnit(unit.privateArtifact.portablePath);
      verifyPrivateUnitText(unit, text);
      if (!writtenHashes.has(unit.contentHash)) {
        await input.writeUnit(unit.privateArtifact.portablePath, text);
        writtenHashes.add(unit.contentHash);
      }
      units.push(unit);
    }
  }
  if (chunkPolicyHash === null) {
    throw new Error("library_analysis_batch_merge_chunk_policy_missing");
  }

  const resolution = sealLibraryAnalysisResolution(plan, resolutionRows);
  const orderedUnits = units.sort(compareUnits);
  const manifestCore = {
    schema: "library-analysis-content-unit-manifest/v1" as const,
    populationSnapshotId: snapshot.snapshotId,
    populationHash: snapshot.populationHash,
    planId: plan.planId,
    planHash: plan.planHash,
    resolutionId: resolution.resolutionId,
    resolutionHash: resolution.resolutionHash,
    chunkPolicyHash,
    units: orderedUnits,
  };
  const contentUnitManifest: LibraryAnalysisContentUnitManifest = {
    ...manifestCore,
    manifestHash: candidateAnalysisSha256("library-analysis-content-unit-manifest", manifestCore),
  };
  verifyLibraryAnalysisContentUnitManifest(contentUnitManifest);
  const costEnvelope = buildCostEnvelope(contentUnitManifest, resolution.resolutionHash,
    resolution.rows.filter((row) => row.disposition === "content_units_ready").length);
  return {
    schema: "library-analysis-private-emit/v1",
    populationTotal: snapshot.rows.length,
    resolution,
    contentUnitManifest,
    costEnvelope,
  };
}

function buildCostEnvelope(
  manifest: LibraryAnalysisContentUnitManifest,
  resolutionHash: string,
  sourcesReady: number,
): LibraryAnalysisCostEnvelope {
  const codePoints = manifest.units.reduce(
    (total, unit) => total + unit.privateArtifact.codePoints, 0);
  const bytes = manifest.units.reduce((total, unit) => total + unit.privateArtifact.sizeBytes, 0);
  const minimum = Math.ceil(codePoints / 4.2);
  const maximum = Math.ceil(codePoints / 3.0);
  const core = {
    schema: "library-analysis-cost-envelope/v1" as const,
    estimatorVersion: "codepoints-interval/1.0.0" as const,
    populationHash: manifest.populationHash,
    resolutionHash,
    contentUnitManifestHash: manifest.manifestHash,
    automatedOnly: true as const,
    externalReady: false as const,
    billingTruth: false as const,
    totals: { sourcesReady, contentUnits: manifest.units.length, codePoints, bytes },
    onePassInputTokens: { minimum, maximum },
    analysisAndValidationTokens: { minimum: minimum * 2, maximum: maximum * 2 },
  };
  return {
    ...core,
    envelopeHash: candidateAnalysisSha256("library-analysis-cost-envelope", core),
  };
}

function verifyCostEnvelope(
  envelope: LibraryAnalysisCostEnvelope,
  manifest: LibraryAnalysisContentUnitManifest,
  resolutionHash: string,
): void {
  const { envelopeHash, ...core } = envelope;
  if (
    candidateAnalysisSha256("library-analysis-cost-envelope", core) !== envelopeHash ||
    envelope.populationHash !== manifest.populationHash ||
    envelope.resolutionHash !== resolutionHash ||
    envelope.contentUnitManifestHash !== manifest.manifestHash ||
    envelope.automatedOnly !== true ||
    envelope.externalReady !== false ||
    envelope.billingTruth !== false
  ) {
    throw new Error("library_analysis_batch_merge_cost_envelope_invalid");
  }
}

function compareUnits(
  left: EmittedLibraryAnalysisContentUnit,
  right: EmittedLibraryAnalysisContentUnit,
): number {
  for (const [leftValue, rightValue] of [
    [left.sourceKind, right.sourceKind],
    [left.populationSourceKey, right.populationSourceKey],
    [left.unitType, right.unitType],
  ] as const) {
    const compared = compareCandidateJsonKeysUtf8(leftValue, rightValue);
    if (compared !== 0) return compared;
  }
  return left.ordinal - right.ordinal;
}
