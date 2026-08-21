import { z } from "zod";

import {
  CANDIDATE_CONTENT_UNIT_TYPES,
  CANDIDATE_IDENTITY_CONFIDENCE,
  CandidateContentUnitInputSchema,
  canonicalCandidateJson,
  candidateAnalysisSha256,
  compareCandidateJsonKeysUtf8,
  type CandidateJsonValue,
} from "./candidate-analysis-contract";
import {
  LibraryAnalysisAcquisitionResolutionSchema,
  type LibraryAnalysisAcquisitionResolution,
} from "./library-analysis-acquisition-contract";
import { readAndVerifyPrivateArtifact } from "./private-library-analysis-artifact-store";
import {
  verifyLibraryAnalysisContentUnitManifest,
  type LibraryAnalysisContentUnitManifest,
} from "../../../scripts/knowledge/emit-library-analysis-content-units";

const HASH = /^[a-f0-9]{64}$/;
const hashSchema = z.string().regex(HASH);
const textSchema = z.string().min(1);
const idSchema = z.string().regex(/^[a-z0-9][a-z0-9._:-]*$/);

export const LIBRARY_ANALYSIS_AGENT_QUEUE_SCHEMA =
  "library-analysis-agent-queue/v1" as const;
const MAXIMUM_CODE_POINTS_PER_JOB = 48_000;
const MAXIMUM_UNITS_PER_JOB = 4;

export const AgentFileBindingSchema = z.object({
  id: idSchema,
  version: textSchema,
  path: textSchema,
  hash: hashSchema,
}).strict();
export type AgentFileBinding = z.infer<typeof AgentFileBindingSchema>;

const executionPolicySchema = z.object({
  automatedOnly: z.literal(true),
  externalReady: z.literal(false),
  externalApiUsed: z.literal(false),
  candidateDatabaseWritten: z.literal(false),
  productionDataMutated: z.literal(false),
  humanSourceReviewRequired: z.literal(false),
  trackedSourceText: z.literal(false),
  maximumAttempts: z.literal(3),
  maximumConcurrentAnalyzers: z.literal(3),
  maximumCodePointsPerJob: z.number().int().positive(),
  maximumUnitsPerJob: z.number().int().positive(),
}).strict();

export type LibraryAnalysisAgentExecutionPolicy = z.infer<
  typeof executionPolicySchema
>;

const unitSchema = z.object({
  id: idSchema,
  sourceKind: idSchema,
  sourceKey: idSchema,
  populationSourceKey: textSchema,
  sourceVersionHash: hashSchema,
  unitType: z.enum(CANDIDATE_CONTENT_UNIT_TYPES),
  ordinal: z.number().int().nonnegative(),
  locator: textSchema,
  locatorHash: hashSchema,
  contentHash: hashSchema,
  hashAlgorithm: z.literal("sha256"),
  identityConfidence: z.enum(CANDIDATE_IDENTITY_CONFIDENCE),
  chunkPolicyHash: hashSchema,
  portablePath: textSchema,
  sizeBytes: z.number().int().positive(),
  codePoints: z.number().int().positive(),
}).strict();

export type LibraryAnalysisAgentQueueUnit = z.infer<typeof unitSchema>;

const sourceSchema = z.object({
  sourceKind: idSchema,
  sourceKey: textSchema,
  sourceVersionHash: hashSchema,
  unitIds: z.array(idSchema).min(1),
  unitCount: z.number().int().positive(),
  codePoints: z.number().int().positive(),
  bytes: z.number().int().positive(),
  sourceEnvelopeHash: hashSchema,
}).strict();

export type LibraryAnalysisAgentQueueSource = z.infer<typeof sourceSchema>;

const jobSchema = z.object({
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

export type LibraryAnalysisAgentQueueJob = z.infer<typeof jobSchema>;

const pilotBindingSchema = z.object({
  schema: z.literal("library-analysis-agent-pilot-binding/v1"),
  parentFullQueueHash: hashSchema,
  parentSelectionHash: hashSchema,
  acquisitionPlanHash: hashSchema,
  childSelectionHash: hashSchema,
}).strict();

const queueCoreSchema = z.object({
  schema: z.literal(LIBRARY_ANALYSIS_AGENT_QUEUE_SCHEMA),
  createdAt: z.string().datetime({ offset: true }),
  runtimeCommit: textSchema,
  populationSnapshotId: textSchema,
  populationHash: hashSchema,
  acquisitionPlanHash: hashSchema,
  resolutionHash: hashSchema,
  contentUnitManifestHash: hashSchema,
  costEnvelopeHash: hashSchema,
  mergedInventoryHash: hashSchema,
  chunkPolicyHash: hashSchema,
  selectionHash: hashSchema,
  workflow: AgentFileBindingSchema,
  analysisPrompt: AgentFileBindingSchema,
  validationWorkflow: AgentFileBindingSchema,
  validationPrompt: AgentFileBindingSchema,
  executionPolicy: executionPolicySchema,
  units: z.array(unitSchema),
  sources: z.array(sourceSchema),
  jobs: z.array(jobSchema),
  pilotBinding: pilotBindingSchema.optional(),
}).strict();

const queueSchema = queueCoreSchema.extend({
  queueId: idSchema,
  queueHash: hashSchema,
}).strict();

export const LibraryAnalysisAgentQueueSchema = queueSchema;
export type LibraryAnalysisAgentQueueCore = z.infer<typeof queueCoreSchema>;
export type LibraryAnalysisAgentQueue = z.infer<typeof queueSchema>;

export type LibraryAnalysisAgentPilotBinding = z.infer<typeof pilotBindingSchema>;

export type DeriveLibraryAnalysisAgentQueueSubsetInput = {
  queue: LibraryAnalysisAgentQueue;
  sourceKeys: ReadonlyArray<{ sourceKind: string; sourceKey: string }>;
  pilotBinding: LibraryAnalysisAgentPilotBinding;
};

export type LibraryAnalysisAgentPilotSelectionProof = {
  parentFullQueueHash: string;
  parentSelectionHash: string;
  planHash: string;
  selectionHash: string;
  sourceIds: readonly string[];
  strata: readonly string[];
  queue: LibraryAnalysisAgentQueue;
};

export type BuildLibraryAnalysisAgentQueueInput = {
  resolution: LibraryAnalysisAcquisitionResolution;
  manifest: LibraryAnalysisContentUnitManifest;
  runRoot: string;
  costEnvelopeHash: string;
  mergedInventoryHash: string;
  runtimeCommit: string;
  workflow: AgentFileBinding;
  analysisPrompt: AgentFileBinding;
  validationWorkflow: AgentFileBinding;
  validationPrompt: AgentFileBinding;
  createdAt?: string;
  policy?: {
    maximumAttempts: 3;
    maximumConcurrentAnalyzers: 3;
    maximumCodePointsPerJob: number;
    maximumUnitsPerJob: number;
  };
};

export type LibraryAnalysisVerifiedJob = {
  job: LibraryAnalysisAgentQueueJob;
  units: Array<{ descriptor: LibraryAnalysisAgentQueueUnit; text: string }>;
};

export function libraryAnalysisAgentQueueHash(
  core: LibraryAnalysisAgentQueueCore,
): string {
  return candidateAnalysisSha256("library-analysis-agent-queue", core as CandidateJsonValue);
}

export function buildLibraryAnalysisAgentQueue(
  input: BuildLibraryAnalysisAgentQueueInput,
): LibraryAnalysisAgentQueue {
  const resolution = LibraryAnalysisAcquisitionResolutionSchema.parse(input.resolution);
  const manifest = verifyLibraryAnalysisContentUnitManifest(input.manifest);
  if (
    manifest.populationSnapshotId !== resolution.populationSnapshotId ||
    manifest.populationHash !== resolution.populationHash ||
    manifest.planId !== resolution.planId ||
    manifest.planHash !== resolution.planHash ||
    manifest.resolutionId !== resolution.resolutionId ||
    manifest.resolutionHash !== resolution.resolutionHash
  ) {
    throw new Error("agent_queue_resolution_manifest_binding_mismatch");
  }
  const readyRows = resolution.rows.filter((row) => row.disposition === "content_units_ready");
  const manifestById = new Map(manifest.units.map((unit) => [unit.id, unit]));
  const used = new Set<string>();
  const sourceInputs: Array<{
    sourceKind: string;
    sourceKey: string;
    sourceVersionHash: string;
    units: LibraryAnalysisAgentQueueUnit[];
  }> = [];

  for (const row of readyRows) {
    const descriptors: LibraryAnalysisAgentQueueUnit[] = [];
    const rowIds = new Set<string>();
    for (const resolved of row.contentUnits) {
      if (rowIds.has(resolved.contentUnitId) || used.has(resolved.contentUnitId)) {
        throw new Error("agent_queue_resolution_manifest_coverage_mismatch");
      }
      rowIds.add(resolved.contentUnitId);
      used.add(resolved.contentUnitId);
      const manifestUnit = manifestById.get(resolved.contentUnitId);
      if (manifestUnit === undefined || manifestUnit.populationSourceKey !== row.sourceKey) {
        throw new Error("agent_queue_resolution_manifest_coverage_mismatch");
      }
      if (
        resolved.sourceVersionHash !== manifestUnit.sourceVersionHash ||
        resolved.unitType !== manifestUnit.unitType ||
        resolved.ordinal !== manifestUnit.ordinal ||
        resolved.locator !== manifestUnit.locator ||
        resolved.contentHash !== manifestUnit.contentHash
      ) {
        throw new Error("agent_queue_unit_binding_mismatch");
      }
      descriptors.push(toQueueUnit(manifestUnit));
    }
    if (descriptors.length === 0) throw new Error("agent_queue_ready_source_empty");
    descriptors.sort((left, right) => left.ordinal - right.ordinal || compareCandidateJsonKeysUtf8(left.id, right.id));
    const ordinals = new Set<number>();
    for (const [index, descriptor] of descriptors.entries()) {
      if (ordinals.has(descriptor.ordinal)) throw new Error("agent_queue_unit_binding_mismatch");
      if (descriptor.ordinal !== index) throw new Error("agent_queue_unit_ordinal_gap");
      ordinals.add(descriptor.ordinal);
      readAndVerifyUnit(input.runRoot, descriptor);
    }
    sourceInputs.push({
      sourceKind: row.sourceKind,
      sourceKey: row.sourceKey,
      sourceVersionHash: descriptors[0]!.sourceVersionHash,
      units: descriptors,
    });
    if (descriptors.some((descriptor) => descriptor.sourceVersionHash !== descriptors[0]!.sourceVersionHash)) {
      throw new Error("agent_queue_unit_binding_mismatch");
    }
  }
  if (used.size !== manifest.units.length) {
    throw new Error("agent_queue_resolution_manifest_coverage_mismatch");
  }
  sourceInputs.sort((left, right) => compareIdentity(left, right));

  const policy = {
    maximumAttempts: 3 as const,
    maximumConcurrentAnalyzers: 3 as const,
    maximumCodePointsPerJob: input.policy?.maximumCodePointsPerJob ?? 48_000,
    maximumUnitsPerJob: input.policy?.maximumUnitsPerJob ?? 4,
  };
  if (
    policy.maximumCodePointsPerJob < 1 ||
    policy.maximumCodePointsPerJob > MAXIMUM_CODE_POINTS_PER_JOB ||
    policy.maximumUnitsPerJob < 1 ||
    policy.maximumUnitsPerJob > MAXIMUM_UNITS_PER_JOB
  ) {
    throw new Error("agent_queue_policy_invalid");
  }
  const units = sourceInputs.flatMap((source) => source.units);
  const sources = sourceInputs.map((source) => {
    const unitIds = source.units.map((unit) => unit.id);
    const codePoints = source.units.reduce((sum, unit) => sum + unit.codePoints, 0);
    const bytes = source.units.reduce((sum, unit) => sum + unit.sizeBytes, 0);
    const core = { sourceKind: source.sourceKind, sourceKey: source.sourceKey, sourceVersionHash: source.sourceVersionHash, unitIds, unitCount: unitIds.length, codePoints, bytes };
    return { ...core, sourceEnvelopeHash: candidateAnalysisSha256("library-analysis-agent-source", core) };
  });
  const selectionCore = { sources, units: units.map((unit) => unitBinding(unit)) };
  const selectionHash = candidateAnalysisSha256("library-analysis-agent-selection", selectionCore);
  const jobs = sourceInputs.flatMap((source) => buildJobs(source, policy));
  const core: LibraryAnalysisAgentQueueCore = {
    schema: LIBRARY_ANALYSIS_AGENT_QUEUE_SCHEMA,
    createdAt: input.createdAt ?? new Date().toISOString(),
    runtimeCommit: input.runtimeCommit,
    populationSnapshotId: resolution.populationSnapshotId,
    populationHash: resolution.populationHash,
    acquisitionPlanHash: resolution.planHash,
    resolutionHash: resolution.resolutionHash,
    contentUnitManifestHash: manifest.manifestHash,
    costEnvelopeHash: input.costEnvelopeHash,
    mergedInventoryHash: input.mergedInventoryHash,
    chunkPolicyHash: manifest.chunkPolicyHash,
    selectionHash,
    workflow: input.workflow,
    analysisPrompt: input.analysisPrompt,
    validationWorkflow: input.validationWorkflow,
    validationPrompt: input.validationPrompt,
    executionPolicy: {
      automatedOnly: true,
      externalReady: false,
      externalApiUsed: false,
      candidateDatabaseWritten: false,
      productionDataMutated: false,
      humanSourceReviewRequired: false,
      trackedSourceText: false,
      ...policy,
    },
    units,
    sources,
    jobs,
  };
  const parsedCore = queueCoreSchema.parse(core);
  const queueHash = libraryAnalysisAgentQueueHash(parsedCore);
  return verifyLibraryAnalysisAgentQueue(queueSchema.parse({
    ...parsedCore,
    queueId: `library-analysis-agent-queue:${queueHash}`,
    queueHash,
  }));
}

export function verifyLibraryAnalysisAgentQueue(rawQueue: unknown): LibraryAnalysisAgentQueue {
  const queue = queueSchema.parse(rawQueue);
  if (
    queue.executionPolicy.maximumCodePointsPerJob < 1 ||
    queue.executionPolicy.maximumCodePointsPerJob > MAXIMUM_CODE_POINTS_PER_JOB ||
    queue.executionPolicy.maximumUnitsPerJob < 1 ||
    queue.executionPolicy.maximumUnitsPerJob > MAXIMUM_UNITS_PER_JOB
  ) throw new Error("agent_queue_policy_invalid");
  const { queueId, queueHash, ...core } = queue;
  const expectedHash = libraryAnalysisAgentQueueHash(core);
  if (queueHash !== expectedHash) throw new Error("agent_queue_hash_mismatch");
  if (queueId !== `library-analysis-agent-queue:${queueHash}`) throw new Error("agent_queue_id_mismatch");
  const unitById = uniqueMap(queue.units, "id", "agent_queue_unit_duplicate");
  for (const unit of queue.units) {
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
    if (unit.portablePath !== `units/${unit.contentHash}.txt`) throw new Error("agent_queue_unit_path_mismatch");
  }
  const canonicalUnits = [...queue.units].sort((left, right) =>
    compareIdentity(unitPopulationIdentity(left), unitPopulationIdentity(right)) ||
    left.ordinal - right.ordinal ||
    compareCandidateJsonKeysUtf8(left.id, right.id));
  if (canonicalCandidateJson(queue.units) !== canonicalCandidateJson(canonicalUnits)) {
    throw new Error("agent_queue_units_not_canonical");
  }
  const sourceByKey = new Map(queue.sources.map((source) => [`${source.sourceKind}\u0000${source.sourceKey}`, source]));
  if (sourceByKey.size !== queue.sources.length) throw new Error("agent_queue_source_duplicate");
  for (let index = 1; index < queue.sources.length; index += 1) {
    if (compareIdentity(queue.sources[index - 1]!, queue.sources[index]!) >= 0) throw new Error("agent_queue_sources_not_canonical");
  }
  const covered = new Set<string>();
  for (const source of queue.sources) {
    if (source.unitCount !== source.unitIds.length) throw new Error("agent_queue_source_unit_count_mismatch");
    const sourceUnits = source.unitIds.map((id) => {
      const descriptor = unitById.get(id);
      if (descriptor === undefined) throw new Error("agent_queue_source_unit_missing");
      if (sourceIdentity(unitPopulationIdentity(descriptor)) !== sourceIdentity(source)) throw new Error("agent_queue_unit_binding_mismatch");
      covered.add(id);
      return descriptor;
    });
    for (const [index, descriptor] of sourceUnits.entries()) {
      if (descriptor.ordinal !== index) throw new Error("agent_queue_unit_ordinal_gap");
      if (index > 0 && sourceUnits[index - 1]!.ordinal + 1 !== descriptor.ordinal) throw new Error("agent_queue_unit_ordinal_gap");
    }
    const codePoints = sourceUnits.reduce((sum, unit) => sum + unit.codePoints, 0);
    const bytes = sourceUnits.reduce((sum, unit) => sum + unit.sizeBytes, 0);
    if (codePoints !== source.codePoints || bytes !== source.bytes || source.sourceEnvelopeHash !== candidateAnalysisSha256("library-analysis-agent-source", { sourceKind: source.sourceKind, sourceKey: source.sourceKey, sourceVersionHash: source.sourceVersionHash, unitIds: source.unitIds, unitCount: source.unitCount, codePoints, bytes })) throw new Error("agent_queue_source_hash_mismatch");
  }
  if (covered.size !== queue.units.length) throw new Error("agent_queue_unit_coverage_mismatch");
  const seenJobs = new Set<string>();
  const seenJobUnits = new Set<string>();
  const expectedJobs = [...queue.sources].flatMap((source) => queue.jobs.filter((job) => job.sourceKind === source.sourceKind && job.sourceKey === source.sourceKey));
  let previousSource = "";
  const segmentOrdinals = new Map<string, number>();
  const nextSourceUnitIndex = new Map<string, number>();
  for (const job of queue.jobs) {
    if (seenJobs.has(job.jobId)) throw new Error("agent_queue_job_duplicate");
    seenJobs.add(job.jobId);
    const source = sourceByKey.get(`${job.sourceKind}\u0000${job.sourceKey}`);
    if (source === undefined) throw new Error("agent_queue_job_source_missing");
    const sourceIdentity = `${job.sourceKind}\u0000${job.sourceKey}`;
    const expectedSegmentOrdinal = segmentOrdinals.get(sourceIdentity) ?? 0;
    if (job.segmentOrdinal !== expectedSegmentOrdinal) throw new Error("agent_queue_job_segment_invalid");
    segmentOrdinals.set(sourceIdentity, expectedSegmentOrdinal + 1);
    if (previousSource.length > 0 && sourceIdentity !== previousSource && compareIdentity({ sourceKind: job.sourceKind, sourceKey: job.sourceKey }, { sourceKind: previousSource.split("\u0000")[0]!, sourceKey: previousSource.split("\u0000")[1]! }) < 0) throw new Error("agent_queue_jobs_not_canonical");
    previousSource = sourceIdentity;
    const descriptors = job.unitIds.map((id) => {
      if (!source.unitIds.includes(id)) throw new Error("agent_queue_job_unit_binding_mismatch");
      if (seenJobUnits.has(id)) throw new Error("agent_queue_job_unit_duplicate");
      seenJobUnits.add(id);
      const descriptor = unitById.get(id);
      if (!descriptor) throw new Error("agent_queue_job_unit_missing");
      return descriptor;
    });
    const sourceUnitIndex = nextSourceUnitIndex.get(sourceIdentity) ?? 0;
    const expectedUnitIds = source.unitIds.slice(sourceUnitIndex, sourceUnitIndex + job.unitIds.length);
    if (expectedUnitIds.length !== job.unitIds.length || expectedUnitIds.some((id, index) => id !== job.unitIds[index])) {
      throw new Error("agent_queue_job_unit_range_invalid");
    }
    nextSourceUnitIndex.set(sourceIdentity, sourceUnitIndex + job.unitIds.length);
    if (
      queue.executionPolicy.maximumCodePointsPerJob > MAXIMUM_CODE_POINTS_PER_JOB ||
      queue.executionPolicy.maximumUnitsPerJob > MAXIMUM_UNITS_PER_JOB
    ) throw new Error("agent_queue_policy_invalid");
    if (job.unitIds.length > queue.executionPolicy.maximumUnitsPerJob || job.codePoints > queue.executionPolicy.maximumCodePointsPerJob) throw new Error("agent_queue_job_limit_invalid");
    const codePoints = descriptors.reduce((sum, unit) => sum + unit.codePoints, 0);
    const bytes = descriptors.reduce((sum, unit) => sum + unit.sizeBytes, 0);
    if (codePoints !== job.codePoints || bytes !== job.bytes || job.unitOrdinalStart !== descriptors[0]!.ordinal || job.unitOrdinalEnd !== descriptors[descriptors.length - 1]!.ordinal || job.inputEnvelopeHash !== inputEnvelopeHash(descriptors)) throw new Error("agent_queue_job_hash_mismatch");
  }
  if (seenJobUnits.size !== queue.units.length) throw new Error("agent_queue_job_coverage_mismatch");
  for (const source of queue.sources) {
    const sourceIdentity = `${source.sourceKind}\u0000${source.sourceKey}`;
    if ((nextSourceUnitIndex.get(sourceIdentity) ?? 0) !== source.unitIds.length) throw new Error("agent_queue_job_coverage_mismatch");
  }
  if (expectedJobs.length !== queue.jobs.length) throw new Error("agent_queue_job_source_coverage_mismatch");
  const expectedSelection = candidateAnalysisSha256("library-analysis-agent-selection", {
    sources: queue.sources,
    units: queue.units.map((unit) => unitBinding(unit)),
    ...(queue.pilotBinding === undefined ? {} : { pilotBinding: pilotBindingHashInput(queue.pilotBinding) }),
  });
  if (queue.selectionHash !== expectedSelection) throw new Error("agent_queue_selection_hash_mismatch");
  if (queue.pilotBinding !== undefined) {
    if (queue.pilotBinding.parentFullQueueHash === queue.queueHash) {
      throw new Error("agent_queue_pilot_parent_self_reference");
    }
    if (queue.pilotBinding.acquisitionPlanHash !== queue.acquisitionPlanHash || queue.pilotBinding.childSelectionHash !== queue.selectionHash) {
      throw new Error("agent_queue_pilot_lineage_binding_mismatch");
    }
  }
  return queue;
}

/**
 * Derive a queue over complete sources/jobs only. The pilot binding is carried
 * in the queue core and therefore participates in both selectionHash and
 * queueHash; the result is never mistaken for the parent full queue.
 */
export function deriveLibraryAnalysisAgentQueueSubset(
  input: DeriveLibraryAnalysisAgentQueueSubsetInput,
): LibraryAnalysisAgentQueue {
  const parent = verifyLibraryAnalysisAgentQueue(input.queue);
  const identities = new Set<string>();
  for (const identity of input.sourceKeys) {
    const key = `${identity.sourceKind}\u0000${identity.sourceKey}`;
    if (identities.has(key)) throw new Error("agent_queue_subset_source_duplicate");
    identities.add(key);
  }
  if (identities.size === 0) throw new Error("agent_queue_subset_empty");
  const sources = parent.sources.filter((source) => identities.has(`${source.sourceKind}\u0000${source.sourceKey}`));
  if (sources.length !== identities.size) throw new Error("agent_queue_subset_source_missing");
  const units = parent.units.filter((unit) => identities.has(sourceIdentity(unitPopulationIdentity(unit))));
  const jobs = parent.jobs.filter((job) => identities.has(`${job.sourceKind}\u0000${job.sourceKey}`));
  const pilotBinding = pilotBindingSchema.parse(input.pilotBinding);
  if (pilotBinding.parentFullQueueHash !== parent.queueHash || pilotBinding.parentSelectionHash !== parent.selectionHash || pilotBinding.acquisitionPlanHash !== parent.acquisitionPlanHash) {
    throw new Error("agent_queue_subset_parent_binding_mismatch");
  }
  const selectionHash = candidateAnalysisSha256("library-analysis-agent-selection", {
    sources,
    units: units.map((unit) => unitBinding(unit)),
    pilotBinding: pilotBindingHashInput(pilotBinding),
  });
  if (selectionHash !== pilotBinding.childSelectionHash) throw new Error("agent_queue_subset_selection_binding_mismatch");
  const { queueId: _queueId, queueHash: _queueHash, ...parentCore } = parent;
  const core: LibraryAnalysisAgentQueueCore = {
    ...parentCore,
    pilotBinding,
    selectionHash,
    sources,
    units,
    jobs,
  };
  const queueHash = libraryAnalysisAgentQueueHash(core);
  return verifyLibraryAnalysisAgentQueue(queueSchema.parse({
    ...core,
    queueId: `library-analysis-agent-queue:${queueHash}`,
    queueHash,
  }));
}

export function verifyLibraryAnalysisAgentPilotQueue(
  parentRaw: unknown,
  childRaw: unknown,
  proofRaw: LibraryAnalysisAgentPilotSelectionProof,
): LibraryAnalysisAgentQueue {
  const parent = verifyLibraryAnalysisAgentQueue(parentRaw);
  const child = verifyLibraryAnalysisAgentQueue(childRaw);
  const proof = proofRaw;
  if (
    proof.parentFullQueueHash !== parent.queueHash ||
    proof.parentSelectionHash !== parent.selectionHash ||
    proof.planHash !== parent.acquisitionPlanHash ||
    proof.queue.queueHash !== child.queueHash ||
    !/^[a-f0-9]{64}$/u.test(proof.selectionHash)
  ) {
    throw new Error("agent_pilot_lineage_parent_binding_mismatch");
  }
  const binding = child.pilotBinding;
  if (
    binding === undefined ||
    binding.parentFullQueueHash !== parent.queueHash ||
    binding.parentSelectionHash !== parent.selectionHash ||
    binding.acquisitionPlanHash !== parent.acquisitionPlanHash ||
    binding.childSelectionHash !== child.selectionHash
  ) {
    throw new Error("agent_pilot_lineage_binding_mismatch");
  }
  const parentSources = new Map(parent.sources.map((source) => [sourceIdentity(source), source]));
  const parentUnits = new Map(parent.units.map((unit) => [unit.id, unit]));
  const parentJobs = new Map(parent.jobs.map((job) => [job.jobId, job]));
  for (const source of child.sources) {
    const parentSource = parentSources.get(sourceIdentity(source));
    if (parentSource === undefined || canonicalCandidateJson(source) !== canonicalCandidateJson(parentSource)) throw new Error("agent_pilot_lineage_source_subset_mismatch");
  }
  for (const unit of child.units) {
    const parentUnit = parentUnits.get(unit.id);
    if (parentUnit === undefined || canonicalCandidateJson(unit) !== canonicalCandidateJson(parentUnit)) throw new Error("agent_pilot_lineage_unit_subset_mismatch");
  }
  for (const job of child.jobs) {
    const parentJob = parentJobs.get(job.jobId);
    if (parentJob === undefined || canonicalCandidateJson(job) !== canonicalCandidateJson(parentJob)) throw new Error("agent_pilot_lineage_job_subset_mismatch");
  }
  if (
    child.sources.length !== proof.sourceIds.length ||
    child.sources.map((source) => source.sourceEnvelopeHash).sort(compareCandidateJsonKeysUtf8).join("\u0000") !== [...proof.sourceIds].sort(compareCandidateJsonKeysUtf8).join("\u0000")
  ) throw new Error("agent_pilot_lineage_source_ids_mismatch");
  const expectedPilotSelectionHash = candidateAnalysisSha256("library-analysis-agent-pilot-selection", {
    schema: "library-analysis-agent-pilot-selection/v1",
    parentFullQueueHash: parent.queueHash,
    parentSelectionHash: parent.selectionHash,
    planHash: parent.acquisitionPlanHash,
    sourceIds: [...proof.sourceIds],
    strata: [...proof.strata],
    childSelectionHash: child.selectionHash,
  });
  if (proof.selectionHash !== expectedPilotSelectionHash) throw new Error("agent_pilot_lineage_selection_hash_mismatch");
  return child;
}

function pilotBindingHashInput(binding: LibraryAnalysisAgentPilotBinding): CandidateJsonValue {
  return {
    schema: binding.schema,
    parentFullQueueHash: binding.parentFullQueueHash,
    parentSelectionHash: binding.parentSelectionHash,
    acquisitionPlanHash: binding.acquisitionPlanHash,
  };
}

export function loadVerifiedLibraryAnalysisJob(
  runRoot: string,
  queue: LibraryAnalysisAgentQueue,
  jobId: string,
): LibraryAnalysisVerifiedJob {
  const verifiedQueue = verifyLibraryAnalysisAgentQueue(queue);
  const job = verifiedQueue.jobs.find((candidate) => candidate.jobId === jobId);
  if (job === undefined) throw new Error("agent_queue_job_not_found");
  const unitMap = uniqueMap(verifiedQueue.units, "id", "agent_queue_unit_duplicate");
  return {
    job,
    units: job.unitIds.map((id) => {
      const descriptor = unitMap.get(id);
      if (descriptor === undefined) throw new Error("agent_queue_unit_missing");
      const bytes = readAndVerifyPrivateArtifact(runRoot, descriptor.portablePath, { sha256: descriptor.contentHash, sizeBytes: descriptor.sizeBytes, mode: 0o400 });
      const text = bytes.toString("utf8");
      if (Buffer.byteLength(text, "utf8") !== descriptor.sizeBytes || [...text].length !== descriptor.codePoints) throw new Error("agent_queue_unit_size_mismatch");
      return { descriptor, text };
    }),
  };
}

function readAndVerifyUnit(runRoot: string, unit: LibraryAnalysisAgentQueueUnit): void {
  const bytes = readAndVerifyPrivateArtifact(runRoot, unit.portablePath, { sha256: unit.contentHash, sizeBytes: unit.sizeBytes, mode: 0o400 });
  const text = bytes.toString("utf8");
  if (!Buffer.from(text, "utf8").equals(bytes)) throw new Error("agent_queue_unit_utf8_invalid");
  if (Buffer.byteLength(text, "utf8") !== unit.sizeBytes || [...text].length !== unit.codePoints) throw new Error("agent_queue_unit_size_mismatch");
}

function toQueueUnit(unit: LibraryAnalysisContentUnitManifest["units"][number]): LibraryAnalysisAgentQueueUnit {
  return {
    id: unit.id,
    sourceKind: unit.sourceKind,
    sourceKey: unit.sourceKey,
    populationSourceKey: unit.populationSourceKey,
    sourceVersionHash: unit.sourceVersionHash,
    unitType: unit.unitType,
    ordinal: unit.ordinal,
    locator: unit.locator,
    locatorHash: unit.locatorHash,
    contentHash: unit.contentHash,
    hashAlgorithm: unit.hashAlgorithm,
    identityConfidence: unit.identityConfidence,
    chunkPolicyHash: unit.chunkPolicyHash,
    portablePath: unit.privateArtifact.portablePath,
    sizeBytes: unit.privateArtifact.sizeBytes,
    codePoints: unit.privateArtifact.codePoints,
  };
}

function unitBinding(unit: LibraryAnalysisAgentQueueUnit): CandidateJsonValue {
  const identity = unitPopulationIdentity(unit);
  return { id: unit.id, sourceKind: identity.sourceKind, sourceKey: identity.sourceKey, sourceVersionHash: unit.sourceVersionHash, unitType: unit.unitType, ordinal: unit.ordinal, locator: unit.locator, contentHash: unit.contentHash, sizeBytes: unit.sizeBytes, codePoints: unit.codePoints, chunkPolicyHash: unit.chunkPolicyHash };
}

function inputEnvelopeHash(units: readonly LibraryAnalysisAgentQueueUnit[]): string {
  return candidateAnalysisSha256("library-analysis-agent-input", { units: units.map((unit, position) => ({ contentUnitId: unit.id, position, inputHash: unit.contentHash })) });
}

function buildJobs(source: { sourceKind: string; sourceKey: string; units: LibraryAnalysisAgentQueueUnit[] }, policy: { maximumCodePointsPerJob: number; maximumUnitsPerJob: number }): LibraryAnalysisAgentQueueJob[] {
  const jobs: LibraryAnalysisAgentQueueJob[] = [];
  let segment: LibraryAnalysisAgentQueueUnit[] = [];
  const flush = () => {
    if (segment.length === 0) return;
    const segmentOrdinal = jobs.length;
    const unitIds = segment.map((unit) => unit.id);
    const codePoints = segment.reduce((sum, unit) => sum + unit.codePoints, 0);
    const bytes = segment.reduce((sum, unit) => sum + unit.sizeBytes, 0);
    const identity = candidateAnalysisSha256("library-analysis-agent-job", { sourceKind: source.sourceKind, sourceKey: source.sourceKey, segmentOrdinal, unitIds });
    jobs.push({ jobId: `job:library-analysis-agent:${identity}`, sourceKind: source.sourceKind, sourceKey: source.sourceKey, segmentOrdinal, unitIds, unitOrdinalStart: segment[0]!.ordinal, unitOrdinalEnd: segment[segment.length - 1]!.ordinal, codePoints, bytes, inputEnvelopeHash: inputEnvelopeHash(segment) });
    segment = [];
  };
  for (const unit of source.units) {
    if (unit.codePoints > policy.maximumCodePointsPerJob) throw new Error("agent_queue_unit_exceeds_job_limit");
    const nextCodePoints = segment.reduce((sum, current) => sum + current.codePoints, 0) + unit.codePoints;
    if (segment.length > 0 && (segment.length >= policy.maximumUnitsPerJob || nextCodePoints > policy.maximumCodePointsPerJob)) flush();
    segment.push(unit);
  }
  flush();
  return jobs;
}

function compareIdentity(left: { sourceKind: string; sourceKey: string }, right: { sourceKind: string; sourceKey: string }): number {
  return compareCandidateJsonKeysUtf8(left.sourceKind, right.sourceKind) || compareCandidateJsonKeysUtf8(left.sourceKey, right.sourceKey);
}

function unitPopulationIdentity(unit: LibraryAnalysisAgentQueueUnit): { sourceKind: string; sourceKey: string } {
  return { sourceKind: unit.sourceKind, sourceKey: unit.populationSourceKey };
}

function sourceIdentity(source: { sourceKind: string; sourceKey: string }): string {
  return `${source.sourceKind}\u0000${source.sourceKey}`;
}

function uniqueMap<T extends Record<string, unknown>>(values: readonly T[], key: keyof T, error: string): Map<string, T> {
  const result = new Map<string, T>();
  for (const value of values) {
    const id = String(value[key]);
    if (result.has(id)) throw new Error(error);
    result.set(id, value);
  }
  return result;
}
