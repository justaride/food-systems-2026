#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  lstatSync,
  readFileSync,
  realpathSync,
} from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { z } from "zod";

import {
  CANDIDATE_CONTENT_UNIT_TYPES,
  canonicalCandidateJson,
  candidateAnalysisEvidenceLocatorHash,
  candidateAnalysisSha256,
  CandidateContentUnitInputSchema,
  compareCandidateJsonKeysUtf8,
  type CandidateContentUnitInput,
  type CandidateJsonValue,
} from "../../src/lib/knowledge/candidate-analysis-contract";
import {
  LibraryAnalysisAcquisitionPlanSchema,
  sealLibraryAnalysisResolution,
  type LibraryAnalysisAcquisitionPlan,
  type LibraryAnalysisAcquisitionResolution,
  type LibraryAnalysisAcquisitionResolutionRowInput,
} from "../../src/lib/knowledge/library-analysis-acquisition-contract";
import {
  chunkLogicalContentUnit,
  DEFAULT_LIBRARY_ANALYSIS_CHUNK_POLICY,
  type LogicalContentUnit,
} from "../../src/lib/knowledge/library-analysis-content-chunker";
import {
  LibraryAnalysisPopulationSnapshotSchema,
  type LibraryAnalysisPopulationSnapshot,
} from "../../src/lib/knowledge/library-analysis-population";
import {
  readAndVerifyPrivateArtifact,
  sealPrivateArtifact,
  writePrivateArtifactExclusive,
  writePrivateManifestAtomic,
} from "../../src/lib/knowledge/private-library-analysis-artifact-store";

export type LibraryAnalysisPrivateEmitCliOptions = {
  snapshot: string;
  plan: string;
  runRoot: string;
  output: string;
};

export function parseLibraryAnalysisPrivateEmitArgs(
  arguments_: readonly string[],
): LibraryAnalysisPrivateEmitCliOptions {
  const values = new Map<string, string>();
  for (const argument of arguments_) {
    const match = /^--(snapshot|plan|run-root|output)=(.*)$/u.exec(argument);
    if (!match) throw new Error("library_analysis_private_emit_argument_unknown");
    const key = match[1]!;
    if (values.has(key)) throw new Error("library_analysis_private_emit_argument_duplicate");
    values.set(key, parsePrivateAbsolutePath(match[2]!));
  }
  const snapshot = values.get("snapshot");
  const plan = values.get("plan");
  const runRoot = values.get("run-root");
  const output = values.get("output");
  if (!snapshot || !plan || !runRoot || !output || new Set(values.values()).size !== 4) {
    throw new Error("library_analysis_private_emit_arguments_invalid");
  }
  if (!output.startsWith(`${runRoot}${sep}`)) {
    throw new Error("library_analysis_private_emit_output_outside_run_root");
  }
  return { snapshot, plan, runRoot, output };
}

export type PrivateLibraryAnalysisExtraction = {
  sourceKind: string;
  sourceKey: string;
  route:
    | "database_document"
    | "controlled_https"
    | "repository_csv"
    | "repository_pptx"
    | "database_derived_record";
  sourceVersionHash: string;
  rawSha256: string;
  units: LogicalContentUnit[];
};

export type PrivateLibraryAnalysisFailure = {
  sourceKind: string;
  sourceKey: string;
  state: "blocked" | "failed_retryable" | "quarantined";
  reasonCode:
    | "missing_locator"
    | "http_not_found"
    | "http_forbidden"
    | "transport_exhausted"
    | "response_too_large"
    | "unsupported_media_type"
    | "corrupt_payload"
    | "empty_extraction"
    | "ocr_required"
    | "identity_ambiguous"
    | "source_version_drift"
    | "derived_record_missing_dependencies";
  attempt?: number;
  maximumAttempts?: number;
};

export type EmittedLibraryAnalysisContentUnit = CandidateContentUnitInput & {
  populationSourceKey: string;
  chunkPolicyHash: string;
  privateArtifact: {
    portablePath: string;
    sha256: string;
    sizeBytes: number;
    codePoints: number;
  };
};

export type LibraryAnalysisContentUnitManifest = {
  schema: "library-analysis-content-unit-manifest/v1";
  populationSnapshotId: string;
  populationHash: string;
  planId: string;
  planHash: string;
  resolutionId: string;
  resolutionHash: string;
  chunkPolicyHash: string;
  units: EmittedLibraryAnalysisContentUnit[];
  manifestHash: string;
};

export type LibraryAnalysisCostEnvelope = {
  schema: "library-analysis-cost-envelope/v1";
  estimatorVersion: "codepoints-interval/1.0.0";
  populationHash: string;
  resolutionHash: string;
  contentUnitManifestHash: string;
  automatedOnly: true;
  externalReady: false;
  billingTruth: false;
  totals: {
    sourcesReady: number;
    contentUnits: number;
    codePoints: number;
    bytes: number;
  };
  onePassInputTokens: { minimum: number; maximum: number };
  analysisAndValidationTokens: { minimum: number; maximum: number };
  envelopeHash: string;
};

export type LibraryAnalysisPrivateEmitOutput = {
  schema: "library-analysis-private-emit/v1";
  populationTotal: number;
  resolution: LibraryAnalysisAcquisitionResolution;
  contentUnitManifest: LibraryAnalysisContentUnitManifest;
  costEnvelope: LibraryAnalysisCostEnvelope;
};

export async function emitLibraryAnalysisContentUnitBundle(input: {
  snapshot: LibraryAnalysisPopulationSnapshot;
  plan: LibraryAnalysisAcquisitionPlan;
  extractions: readonly PrivateLibraryAnalysisExtraction[];
  failures: readonly PrivateLibraryAnalysisFailure[];
  writeUnit: (portablePath: string, text: string) => Promise<void>;
}): Promise<LibraryAnalysisPrivateEmitOutput> {
  const snapshot = LibraryAnalysisPopulationSnapshotSchema.parse(input.snapshot);
  const plan = LibraryAnalysisAcquisitionPlanSchema.parse(input.plan);
  if (
    plan.populationSnapshotId !== snapshot.snapshotId ||
    plan.populationHash !== snapshot.populationHash ||
    plan.rows.length !== snapshot.rows.length
  ) {
    throw new Error("library_analysis_emit_population_plan_mismatch");
  }

  const extractionByIdentity = uniqueByIdentity(input.extractions, "extraction");
  const failureByIdentity = uniqueByIdentity(input.failures, "failure");
  for (const identity of extractionByIdentity.keys()) {
    if (failureByIdentity.has(identity)) throw new Error("library_analysis_emit_conflicting_outcomes");
  }

  const contentUnits: EmittedLibraryAnalysisContentUnit[] = [];
  const resolutionRows: LibraryAnalysisAcquisitionResolutionRowInput[] = [];
  const writtenPayloads = new Map<string, string>();
  for (const planRow of plan.rows) {
    const identity = sourceIdentity(planRow.sourceKind, planRow.sourceKey);
    const extraction = extractionByIdentity.get(identity);
    const failure = failureByIdentity.get(identity);
    if (planRow.route === "superseded") {
      if (extraction || failure) throw new Error("library_analysis_emit_unexpected_outcome");
      resolutionRows.push({
        sourceKind: planRow.sourceKind,
        sourceKey: planRow.sourceKey,
        disposition: "superseded",
        reasonCode: "source_superseded",
        contentUnits: [],
      });
      continue;
    }
    if (planRow.route === "unresolvable") {
      if (extraction) throw new Error("library_analysis_emit_unexpected_extraction");
      resolutionRows.push(blockedResolutionRow(planRow, failure ?? {
        sourceKind: planRow.sourceKind,
        sourceKey: planRow.sourceKey,
        state: "blocked",
        reasonCode: "missing_locator",
      }));
      continue;
    }
    if (failure) {
      resolutionRows.push(blockedResolutionRow(planRow, failure));
      continue;
    }
    if (!extraction) {
      resolutionRows.push(blockedResolutionRow(planRow, {
        sourceKind: planRow.sourceKind,
        sourceKey: planRow.sourceKey,
        state: "quarantined",
        reasonCode: "source_version_drift",
      }));
      continue;
    }
    validateExtractionBinding(planRow, snapshot, extraction);
    const sourceUnits = buildEmittedUnits(planRow, extraction);
    if (sourceUnits.length === 0) {
      resolutionRows.push(blockedResolutionRow(planRow, {
        sourceKind: planRow.sourceKind,
        sourceKey: planRow.sourceKey,
        state: "blocked",
        reasonCode: "empty_extraction",
      }));
      continue;
    }
    for (const emitted of sourceUnits) {
      const payload = emitted.text;
      const prior = writtenPayloads.get(emitted.descriptor.privateArtifact.sha256);
      if (prior !== undefined && prior !== payload) {
        throw new Error("library_analysis_emit_content_hash_collision");
      }
      if (prior === undefined) {
        await input.writeUnit(emitted.descriptor.privateArtifact.portablePath, payload);
        writtenPayloads.set(emitted.descriptor.privateArtifact.sha256, payload);
      }
      contentUnits.push(emitted.descriptor);
    }
    resolutionRows.push({
      sourceKind: planRow.sourceKind,
      sourceKey: planRow.sourceKey,
      disposition: "content_units_ready",
      reasonCode: null,
      contentUnits: sourceUnits.map(({ descriptor }) => ({
        contentUnitId: descriptor.id,
        sourceVersionHash: descriptor.sourceVersionHash,
        unitType: descriptor.unitType,
        ordinal: descriptor.ordinal,
        locator: descriptor.locator,
        contentHash: descriptor.contentHash,
      })),
    });
  }

  assertNoOutcomesOutsidePlan(plan, extractionByIdentity, failureByIdentity);
  const resolution = sealLibraryAnalysisResolution(plan, resolutionRows);
  const chunkPolicyHash = candidateAnalysisSha256(
    "library-analysis-chunk-policy",
    DEFAULT_LIBRARY_ANALYSIS_CHUNK_POLICY,
  );
  const orderedUnits = contentUnits.sort(compareEmittedUnits);
  const contentManifestCore = {
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
    ...contentManifestCore,
    manifestHash: candidateAnalysisSha256(
      "library-analysis-content-unit-manifest",
      contentManifestCore,
    ),
  };
  const totalCodePoints = orderedUnits.reduce(
    (total, unit) => total + unit.privateArtifact.codePoints,
    0,
  );
  const totalBytes = orderedUnits.reduce(
    (total, unit) => total + unit.privateArtifact.sizeBytes,
    0,
  );
  const minimumInputTokens = Math.ceil(totalCodePoints / 4.2);
  const maximumInputTokens = Math.ceil(totalCodePoints / 3.0);
  const costCore = {
    schema: "library-analysis-cost-envelope/v1" as const,
    estimatorVersion: "codepoints-interval/1.0.0" as const,
    populationHash: snapshot.populationHash,
    resolutionHash: resolution.resolutionHash,
    contentUnitManifestHash: contentUnitManifest.manifestHash,
    automatedOnly: true as const,
    externalReady: false as const,
    billingTruth: false as const,
    totals: {
      sourcesReady: resolution.rows.filter((row) => row.disposition === "content_units_ready").length,
      contentUnits: orderedUnits.length,
      codePoints: totalCodePoints,
      bytes: totalBytes,
    },
    onePassInputTokens: { minimum: minimumInputTokens, maximum: maximumInputTokens },
    analysisAndValidationTokens: {
      minimum: minimumInputTokens * 2,
      maximum: maximumInputTokens * 2,
    },
  };
  const costEnvelope: LibraryAnalysisCostEnvelope = {
    ...costCore,
    envelopeHash: candidateAnalysisSha256("library-analysis-cost-envelope", costCore),
  };
  return {
    schema: "library-analysis-private-emit/v1",
    populationTotal: snapshot.rows.length,
    resolution,
    contentUnitManifest,
    costEnvelope,
  };
}

function buildEmittedUnits(
  planRow: LibraryAnalysisAcquisitionPlan["rows"][number],
  extraction: PrivateLibraryAnalysisExtraction,
): Array<{ descriptor: EmittedLibraryAnalysisContentUnit; text: string }> {
  const logicalUnits = [...extraction.units].sort((left, right) => left.ordinal - right.ordinal);
  const logicalOrdinals = new Set<number>();
  const emitted: Array<{ descriptor: EmittedLibraryAnalysisContentUnit; text: string }> = [];
  for (const logical of logicalUnits) {
    if (logicalOrdinals.has(logical.ordinal)) {
      throw new Error("library_analysis_emit_logical_ordinal_duplicate");
    }
    logicalOrdinals.add(logical.ordinal);
    for (const chunk of chunkLogicalContentUnit(logical, DEFAULT_LIBRARY_ANALYSIS_CHUNK_POLICY)) {
      const ordinal = emitted.length;
      const identityHash = candidateAnalysisSha256("library-analysis-content-unit", {
        sourceKind: planRow.sourceKind,
        sourceKey: planRow.sourceKey,
        candidateSourceKey: candidateContentSourceKey(planRow.sourceKey),
        sourceVersionHash: extraction.sourceVersionHash,
        unitType: chunk.unitType,
        ordinal,
        locator: chunk.locator,
        contentHash: chunk.contentHash,
        chunkPolicyHash: chunk.chunkPolicyHash,
      });
      const candidate = CandidateContentUnitInputSchema.parse({
        id: `content:library-analysis:${identityHash}`,
        sourceKind: planRow.sourceKind,
        sourceKey: candidateContentSourceKey(planRow.sourceKey),
        sourceVersionHash: extraction.sourceVersionHash,
        unitType: chunk.unitType,
        ordinal,
        locator: chunk.locator,
        locatorHash: candidateAnalysisEvidenceLocatorHash(chunk.locator),
        contentHash: chunk.contentHash,
        hashAlgorithm: "sha256",
        identityConfidence: planRow.identityConfidence,
      });
      const bytes = Buffer.from(chunk.text, "utf8");
      emitted.push({
        text: chunk.text,
        descriptor: {
          ...candidate,
          populationSourceKey: planRow.sourceKey,
          chunkPolicyHash: chunk.chunkPolicyHash,
          privateArtifact: {
            portablePath: `units/${chunk.contentHash}.txt`,
            sha256: chunk.contentHash,
            sizeBytes: bytes.length,
            codePoints: Array.from(chunk.text).length,
          },
        },
      });
    }
  }
  return emitted;
}

function validateExtractionBinding(
  planRow: LibraryAnalysisAcquisitionPlan["rows"][number],
  snapshot: LibraryAnalysisPopulationSnapshot,
  extraction: PrivateLibraryAnalysisExtraction,
): void {
  if (
    extraction.route !== planRow.route ||
    !isHash(extraction.sourceVersionHash) ||
    !isHash(extraction.rawSha256) ||
    extraction.units.length === 0
  ) {
    throw new Error("library_analysis_emit_extraction_binding_invalid");
  }
  const populationRow = snapshot.rows.find(
    (row) => row.sourceKind === planRow.sourceKind && row.sourceKey === planRow.sourceKey,
  );
  if (!populationRow) throw new Error("library_analysis_emit_population_row_missing");
  if (planRow.route === "database_document") {
    if (
      planRow.sourceVersionHash !== extraction.sourceVersionHash ||
      populationRow.contentHash !== extraction.rawSha256
    ) {
      throw new Error("library_analysis_emit_database_hash_mismatch");
    }
    return;
  }
  if (extraction.sourceVersionHash !== extraction.rawSha256) {
    throw new Error("library_analysis_emit_route_version_hash_mismatch");
  }
}

function blockedResolutionRow(
  planRow: LibraryAnalysisAcquisitionPlan["rows"][number],
  failure: PrivateLibraryAnalysisFailure,
): LibraryAnalysisAcquisitionResolutionRowInput {
  if (failure.state === "failed_retryable") {
    return {
      sourceKind: planRow.sourceKind,
      sourceKey: planRow.sourceKey,
      disposition: "failed_retryable",
      reasonCode: failure.reasonCode,
      contentUnits: [],
      attempt: failure.attempt ?? 3,
      maximumAttempts: failure.maximumAttempts ?? 3,
    };
  }
  return {
    sourceKind: planRow.sourceKind,
    sourceKey: planRow.sourceKey,
    disposition: failure.state === "quarantined" ? "quarantined" : "blocked_input",
    reasonCode: failure.reasonCode,
    contentUnits: [],
  };
}

function uniqueByIdentity<T extends { sourceKind: string; sourceKey: string }>(
  values: readonly T[],
  label: string,
): Map<string, T> {
  const result = new Map<string, T>();
  for (const value of values) {
    const identity = sourceIdentity(value.sourceKind, value.sourceKey);
    if (result.has(identity)) throw new Error(`library_analysis_emit_duplicate_${label}`);
    result.set(identity, value);
  }
  return result;
}

function assertNoOutcomesOutsidePlan(
  plan: LibraryAnalysisAcquisitionPlan,
  extractions: ReadonlyMap<string, PrivateLibraryAnalysisExtraction>,
  failures: ReadonlyMap<string, PrivateLibraryAnalysisFailure>,
): void {
  const identities = new Set(
    plan.rows.map((row) => sourceIdentity(row.sourceKind, row.sourceKey)),
  );
  for (const identity of [...extractions.keys(), ...failures.keys()]) {
    if (!identities.has(identity)) throw new Error("library_analysis_emit_outcome_outside_plan");
  }
}

function compareEmittedUnits(
  left: EmittedLibraryAnalysisContentUnit,
  right: EmittedLibraryAnalysisContentUnit,
): number {
  for (const [leftValue, rightValue] of [
    [left.sourceKind, right.sourceKind],
    [left.sourceKey, right.sourceKey],
  ] as const) {
    const compared = compareCandidateJsonKeysUtf8(leftValue, rightValue);
    if (compared !== 0) return compared;
  }
  return left.ordinal - right.ordinal;
}

function candidateContentSourceKey(populationSourceKey: string): string {
  if (/^[a-z0-9][a-z0-9._:-]*$/.test(populationSourceKey)) return populationSourceKey;
  return `source:${candidateAnalysisSha256("library-analysis-candidate-source-key", populationSourceKey)}`;
}

function sourceIdentity(sourceKind: string, sourceKey: string): string {
  return `${sourceKind}\u0000${sourceKey}`;
}

function isHash(value: string): boolean {
  return /^[a-f0-9]{64}$/.test(value);
}

function sha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export function verifyPrivateUnitText(unit: EmittedLibraryAnalysisContentUnit, text: string): void {
  const bytes = Buffer.from(text, "utf8");
  if (
    createHash("sha256").update(bytes).digest("hex") !== unit.contentHash ||
    unit.privateArtifact.sha256 !== unit.contentHash ||
    unit.privateArtifact.sizeBytes !== bytes.length ||
    unit.privateArtifact.codePoints !== Array.from(text).length
  ) {
    throw new Error("library_analysis_private_unit_hash_mismatch");
  }
}

const emittedContentUnitSchema = z.object({
  id: z.string(),
  sourceKind: z.string(),
  sourceKey: z.string(),
  populationSourceKey: z.string().min(1),
  sourceVersionHash: z.string(),
  unitType: z.enum(CANDIDATE_CONTENT_UNIT_TYPES),
  ordinal: z.number(),
  locator: z.string(),
  locatorHash: z.string(),
  contentHash: z.string(),
  hashAlgorithm: z.literal("sha256"),
  identityConfidence: z.enum(["exact", "provisional", "unresolved"]),
  chunkPolicyHash: z.string().regex(/^[a-f0-9]{64}$/),
  privateArtifact: z.object({
    portablePath: z.string().min(1),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    sizeBytes: z.number().int().positive(),
    codePoints: z.number().int().positive(),
  }).strict(),
}).strict();

const contentUnitManifestSchema = z.object({
  schema: z.literal("library-analysis-content-unit-manifest/v1"),
  populationSnapshotId: z.string().min(1),
  populationHash: z.string().regex(/^[a-f0-9]{64}$/),
  planId: z.string().min(1),
  planHash: z.string().regex(/^[a-f0-9]{64}$/),
  resolutionId: z.string().min(1),
  resolutionHash: z.string().regex(/^[a-f0-9]{64}$/),
  chunkPolicyHash: z.string().regex(/^[a-f0-9]{64}$/),
  units: z.array(emittedContentUnitSchema),
  manifestHash: z.string().regex(/^[a-f0-9]{64}$/),
}).strict();

export function verifyLibraryAnalysisContentUnitManifest(
  rawManifest: unknown,
): LibraryAnalysisContentUnitManifest {
  const manifest = contentUnitManifestSchema.parse(rawManifest) as LibraryAnalysisContentUnitManifest;
  const { manifestHash, ...core } = manifest;
  if (
    manifest.schema !== "library-analysis-content-unit-manifest/v1" ||
    !isHash(manifestHash) ||
    candidateAnalysisSha256("library-analysis-content-unit-manifest", core) !== manifestHash
  ) {
    throw new Error("library_analysis_content_unit_manifest_hash_mismatch");
  }
  const ids = new Set<string>();
  for (const unit of manifest.units) {
    CandidateContentUnitInputSchema.parse({
      id: unit.id,
      sourceKind: unit.sourceKind,
      sourceKey: unit.sourceKey,
      sourceVersionHash: unit.sourceVersionHash,
      unitType: unit.unitType,
      ordinal: unit.ordinal,
      locator: unit.locator,
      locatorHash: unit.locatorHash,
      contentHash: unit.contentHash,
      hashAlgorithm: unit.hashAlgorithm,
      identityConfidence: unit.identityConfidence,
    });
    if (
      ids.has(unit.id) ||
      unit.populationSourceKey.length === 0 ||
      unit.chunkPolicyHash !== manifest.chunkPolicyHash ||
      unit.privateArtifact.sha256 !== unit.contentHash ||
      unit.privateArtifact.portablePath !== `units/${unit.contentHash}.txt` ||
      !Number.isSafeInteger(unit.privateArtifact.sizeBytes) ||
      unit.privateArtifact.sizeBytes < 1 ||
      !Number.isSafeInteger(unit.privateArtifact.codePoints) ||
      unit.privateArtifact.codePoints < 1
    ) {
      throw new Error("library_analysis_content_unit_manifest_invalid");
    }
    ids.add(unit.id);
  }
  return manifest;
}

const privateExtractionSchema = z.object({
  schema: z.literal("library-analysis-source-extraction/v1"),
  sourceKind: z.string().min(1),
  sourceKey: z.string().min(1),
  route: z.enum([
    "database_document",
    "controlled_https",
    "repository_csv",
    "repository_pptx",
    "database_derived_record",
  ]),
  sourceVersionHash: z.string().regex(/^[a-f0-9]{64}$/),
  rawSha256: z.string().regex(/^[a-f0-9]{64}$/),
  rawSizeBytes: z.number().int().positive(),
  normalizedTextSha256: z.string().regex(/^[a-f0-9]{64}$/),
  extractor: z.object({
    name: z.string().min(1),
    version: z.string().min(1),
    workflowRef: z.string().min(1),
    workflowVersion: z.string().min(1),
  }).strict(),
  units: z.array(z.object({
    unitType: z.enum(CANDIDATE_CONTENT_UNIT_TYPES),
    baseLocator: z.string().min(1),
    ordinal: z.number().int().nonnegative(),
    text: z.string(),
  }).strict()).min(1),
  warnings: z.array(z.string()),
}).strict();

const executionCheckpointSchema = z.object({
  mode: z.literal("execute_network"),
  planHash: z.string().regex(/^[a-f0-9]{64}$/),
  routeCounts: z.record(z.string(), z.number().int().nonnegative()),
  rows: z.array(z.object({
    sourceKey: z.string().min(1),
    state: z.enum(["ready", "blocked", "failed_retryable", "quarantined", "not_executed"]),
    reasonCode: z.string().nullable(),
    rawSha256: z.string().regex(/^[a-f0-9]{64}$/).nullable(),
    normalizedTextSha256: z.string().regex(/^[a-f0-9]{64}$/).nullable(),
    unitCount: z.number().int().nonnegative(),
  }).strict()),
}).strict();

export async function runLibraryAnalysisPrivateEmitCli(
  options: LibraryAnalysisPrivateEmitCliOptions,
): Promise<LibraryAnalysisPrivateEmitOutput> {
  const snapshot = LibraryAnalysisPopulationSnapshotSchema.parse(
    JSON.parse(readFileSync(options.snapshot, "utf8")),
  );
  const plan = LibraryAnalysisAcquisitionPlanSchema.parse(
    JSON.parse(readFileSync(options.plan, "utf8")),
  );
  const failures = readExecutionFailures(options.runRoot, plan);
  const failedIdentities = new Set(
    failures.map((failure) => sourceIdentity(failure.sourceKind, failure.sourceKey)),
  );
  const extractions: PrivateLibraryAnalysisExtraction[] = [];
  for (const row of plan.rows) {
    if (
      row.route === "superseded" ||
      row.route === "unresolvable"
    ) continue;
    const sourceHash = candidateAnalysisSha256(
      "library-analysis-acquisition-source",
      row.sourceKey,
    );
    const portablePath = `extraction/${sourceHash}.json`;
    if (!privateArtifactExists(options.runRoot, portablePath)) continue;
    const extraction = privateExtractionSchema.parse(
      JSON.parse(readSealedPrivateArtifact(options.runRoot, portablePath).toString("utf8")),
    );
    if (extraction.sourceKind !== row.sourceKind || extraction.sourceKey !== row.sourceKey) {
      throw new Error("library_analysis_private_emit_extraction_identity_mismatch");
    }
    const raw = readAndVerifyPrivateArtifact(options.runRoot, `raw/${extraction.rawSha256}.bin`, {
      sha256: extraction.rawSha256,
      sizeBytes: extraction.rawSizeBytes,
      mode: 0o400,
    });
    if (sha256(raw) !== extraction.rawSha256) {
      throw new Error("library_analysis_private_emit_raw_hash_mismatch");
    }
    const normalized = extraction.units.map((unit) => unit.text).join("\f");
    if (sha256(Buffer.from(normalized, "utf8")) !== extraction.normalizedTextSha256) {
      throw new Error("library_analysis_private_emit_normalized_hash_mismatch");
    }
    const sealedText = readSealedPrivateArtifact(
      options.runRoot,
      `text/${extraction.normalizedTextSha256}.txt`,
    );
    if (!sealedText.equals(Buffer.from(normalized, "utf8"))) {
      throw new Error("library_analysis_private_emit_text_readback_mismatch");
    }
    if (!failedIdentities.has(sourceIdentity(extraction.sourceKind, extraction.sourceKey))) {
      extractions.push({
        sourceKind: extraction.sourceKind,
        sourceKey: extraction.sourceKey,
        route: extraction.route,
        sourceVersionHash: extraction.sourceVersionHash,
        rawSha256: extraction.rawSha256,
        units: extraction.units,
      });
    }
  }

  const output = await emitLibraryAnalysisContentUnitBundle({
    snapshot,
    plan,
    extractions,
    failures,
    writeUnit: async (portablePath, text) => {
      writeOrVerifySealed(options.runRoot, portablePath, Buffer.from(text, "utf8"));
    },
  });
  writePrivateManifestAtomic(
    options.runRoot,
    `manifests/resolution-${output.resolution.resolutionHash}.json`,
    canonicalJsonBytes(output.resolution),
  );
  writePrivateManifestAtomic(
    options.runRoot,
    `manifests/content-units-${output.contentUnitManifest.manifestHash}.json`,
    canonicalJsonBytes(output.contentUnitManifest),
  );
  writePrivateManifestAtomic(
    options.runRoot,
    `manifests/cost-envelope-${output.costEnvelope.envelopeHash}.json`,
    canonicalJsonBytes(output.costEnvelope),
  );
  writePrivateManifestAtomic(
    options.runRoot,
    portableOutputPath(options.runRoot, options.output),
    canonicalJsonBytes(output),
  );
  return output;
}

function readExecutionFailures(
  runRoot: string,
  plan: LibraryAnalysisAcquisitionPlan,
): PrivateLibraryAnalysisFailure[] {
  const portablePath = `checkpoints/acquisition-execution-${plan.planHash}.json`;
  if (!privateArtifactExists(runRoot, portablePath)) return [];
  const checkpoint = executionCheckpointSchema.parse(
    JSON.parse(readSealedPrivateArtifact(runRoot, portablePath).toString("utf8")),
  );
  if (checkpoint.planHash !== plan.planHash) {
    throw new Error("library_analysis_private_emit_checkpoint_plan_mismatch");
  }
  const planByKey = new Map(plan.rows.map((row) => [row.sourceKey, row]));
  return checkpoint.rows.flatMap((row): PrivateLibraryAnalysisFailure[] => {
    const planRow = planByKey.get(row.sourceKey);
    if (!planRow) throw new Error("library_analysis_private_emit_checkpoint_source_unknown");
    if (
      row.state === "ready" ||
      row.state === "not_executed" ||
      planRow.route === "superseded"
    ) return [];
    if (!isFailureReason(row.reasonCode)) {
      throw new Error("library_analysis_private_emit_checkpoint_reason_invalid");
    }
    return [{
      sourceKind: planRow.sourceKind,
      sourceKey: planRow.sourceKey,
      state: row.state,
      reasonCode: row.reasonCode,
      ...(row.state === "failed_retryable" ? { attempt: 3, maximumAttempts: 3 } : {}),
    }];
  });
}

function isFailureReason(value: string | null): value is PrivateLibraryAnalysisFailure["reasonCode"] {
  return [
    "missing_locator",
    "http_not_found",
    "http_forbidden",
    "transport_exhausted",
    "response_too_large",
    "unsupported_media_type",
    "corrupt_payload",
    "empty_extraction",
    "ocr_required",
    "identity_ambiguous",
    "source_version_drift",
    "derived_record_missing_dependencies",
  ].includes(value ?? "");
}

function privateArtifactExists(runRoot: string, portablePath: string): boolean {
  try {
    lstatSync(resolve(runRoot, portablePath));
    return true;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return false;
    throw error;
  }
}

function readSealedPrivateArtifact(runRoot: string, portablePath: string): Buffer {
  const root = realpathSync(runRoot);
  const target = resolve(root, portablePath);
  if (!target.startsWith(`${root}${sep}`)) throw new Error("library_analysis_private_emit_path_invalid");
  const stat = lstatSync(target);
  if (stat.isSymbolicLink() || !stat.isFile() || (stat.mode & 0o777) !== 0o400) {
    throw new Error("library_analysis_private_emit_artifact_not_sealed");
  }
  if (!realpathSync(target).startsWith(`${root}${sep}`)) {
    throw new Error("library_analysis_private_emit_path_invalid");
  }
  return readFileSync(target);
}

function writeOrVerifySealed(runRoot: string, portablePath: string, bytes: Buffer): void {
  try {
    const written = writePrivateArtifactExclusive(runRoot, portablePath, bytes);
    sealPrivateArtifact(runRoot, portablePath, {
      sha256: written.sha256,
      sizeBytes: written.sizeBytes,
    });
  } catch (error) {
    if (!(error instanceof Error) || error.message !== "private_artifact_exists") throw error;
    readAndVerifyPrivateArtifact(runRoot, portablePath, {
      sha256: sha256(bytes),
      sizeBytes: bytes.length,
      mode: 0o400,
    });
  }
}

function portableOutputPath(runRoot: string, output: string): string {
  const portable = relative(realpathSync(runRoot), output);
  if (
    portable.length === 0 ||
    portable.startsWith("..") ||
    isAbsolute(portable) ||
    portable.includes("\\")
  ) {
    throw new Error("library_analysis_private_emit_output_invalid");
  }
  return portable;
}

function canonicalJsonBytes(value: CandidateJsonValue): Buffer {
  return Buffer.from(`${canonicalCandidateJson(value)}\n`, "utf8");
}

function parsePrivateAbsolutePath(value: string): string {
  if (value.length === 0 || !isAbsolute(value) || /[\u0000-\u001f\u007f]/.test(value)) {
    throw new Error("library_analysis_private_emit_path_invalid");
  }
  return resolve(value);
}

async function main(): Promise<void> {
  const output = await runLibraryAnalysisPrivateEmitCli(
    parseLibraryAnalysisPrivateEmitArgs(process.argv.slice(2)),
  );
  process.stdout.write(`${JSON.stringify({
    populationTotal: output.populationTotal,
    resolutionHash: output.resolution.resolutionHash,
    contentUnitManifestHash: output.contentUnitManifest.manifestHash,
    costEnvelopeHash: output.costEnvelope.envelopeHash,
    contentUnits: output.contentUnitManifest.units.length,
    blockers: output.resolution.rows.filter((row) => row.disposition !== "content_units_ready").length,
    automatedOnly: output.costEnvelope.automatedOnly,
    externalReady: output.costEnvelope.externalReady,
  })}\n`);
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  main().catch(() => {
    process.stderr.write("library_analysis_private_emit_failed\n");
    process.exitCode = 1;
  });
}
