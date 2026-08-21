import assert from "node:assert/strict";
import test from "node:test";

import {
  candidateAnalysisSha256,
  candidateAnalysisEvidenceLocatorHash,
  compareCandidateJsonKeysUtf8,
} from "../../src/lib/knowledge/candidate-analysis-contract";
import {
  buildLibraryAnalysisAcquisitionPlan,
} from "../../src/lib/knowledge/library-analysis-acquisition-contract";
import { buildLibraryAnalysisPopulation } from "../../src/lib/knowledge/library-analysis-population";
import {
  verifyLibraryAnalysisAgentQueue,
  verifyLibraryAnalysisAgentPilotQueue,
  libraryAnalysisAgentQueueHash,
  type LibraryAnalysisAgentQueue,
  type LibraryAnalysisAgentQueueCore,
  type LibraryAnalysisAgentQueueJob,
  type LibraryAnalysisAgentQueueSource,
  type LibraryAnalysisAgentQueueUnit,
} from "../../src/lib/knowledge/library-analysis-agent-queue";
import {
  selectLibraryAnalysisAgentPilot,
  type LibraryAnalysisAgentPilotInput,
} from "../../scripts/knowledge/select-library-analysis-agent-pilot";

const HASH = "a".repeat(64);
type FixtureSpec = readonly [string, string, "database_record" | "pdf_page" | "sheet_range" | "slide", ...number[]];
const BASE_SPECS = [
  ["document", "document:small", "database_record", 5_000],
  ["document", "document:medium", "database_record", 20_000],
  ["document", "document:segmented", "database_record", 30_000, 30_000],
  ["source_doc", "source_doc:pdf", "pdf_page", 10_000],
  ["library_file", "library_file:csv", "sheet_range", 15_000],
  ["library_file", "library_file:pptx", "slide", 15_000],
  ["report", "report:derived", "database_record", 12_000],
  ["document", "document:filler-1", "database_record", 30_000],
  ["document", "document:filler-2", "database_record", 30_000],
  ["document", "document:filler-3", "database_record", 30_000],
  ["document", "document:filler-4", "database_record", 30_000],
  ["document", "document:filler-5", "database_record", 30_000],
] as readonly FixtureSpec[];

function makeQueue(specs = BASE_SPECS): LibraryAnalysisAgentQueue {
  const units: LibraryAnalysisAgentQueueUnit[] = [];
  const sources: LibraryAnalysisAgentQueueSource[] = [];
  const jobs: LibraryAnalysisAgentQueueJob[] = [];
  for (const [sourceKind, sourceKey, unitType, ...codePoints] of specs) {
    const candidateSourceKey = sourceKey === "document:medium" ? "candidate:document-medium" : sourceKey;
    const unitIds: string[] = [];
    for (const [ordinal, points] of codePoints.entries()) {
      const id = `content:${sourceKey.replaceAll(":", "-")}:${ordinal}`;
      unitIds.push(id);
      units.push({
        id,
        sourceKind,
        sourceKey: candidateSourceKey,
        populationSourceKey: sourceKey,
        sourceVersionHash: HASH,
        unitType,
        ordinal,
        locator: `locator:${sourceKey}:${ordinal}`,
        locatorHash: candidateAnalysisEvidenceLocatorHash(`locator:${sourceKey}:${ordinal}`),
        contentHash: candidateAnalysisSha256("content", id),
        hashAlgorithm: "sha256",
        identityConfidence: "exact",
        chunkPolicyHash: HASH,
        portablePath: `units/${candidateAnalysisSha256("content", id)}.txt`,
        sizeBytes: points,
        codePoints: points,
      });
    }
    const bytes = codePoints.reduce((sum, value) => sum + value, 0);
    const sourceCore = { sourceKind, sourceKey, sourceVersionHash: HASH, unitIds, unitCount: unitIds.length, codePoints: bytes, bytes };
    sources.push({ ...sourceCore, sourceEnvelopeHash: candidateAnalysisSha256("library-analysis-agent-source", sourceCore) });
    let segmentOrdinal = 0;
    for (let start = 0; start < unitIds.length; start += 1) {
      const ids = [unitIds[start]!];
      const descriptors = ids.map((id) => units.find((unit) => unit.id === id)!);
      const points = descriptors[0]!.codePoints;
      const jobCore = { sourceKind, sourceKey, segmentOrdinal, unitIds: ids };
      const inputEnvelopeHash = candidateAnalysisSha256("library-analysis-agent-input", { units: ids.map((id, position) => ({ contentUnitId: id, position, inputHash: units.find((unit) => unit.id === id)!.contentHash })) });
      jobs.push({
        jobId: `job:library-analysis-agent:${candidateAnalysisSha256("library-analysis-agent-job", jobCore)}`,
        sourceKind,
        sourceKey,
        segmentOrdinal,
        unitIds: ids,
        unitOrdinalStart: start,
        unitOrdinalEnd: start,
        codePoints: points,
        bytes: points,
        inputEnvelopeHash,
      });
      segmentOrdinal += 1;
    }
  }
  units.sort((left, right) => compareCandidateJsonKeysUtf8(left.sourceKind, right.sourceKind) || compareCandidateJsonKeysUtf8(left.sourceKey, right.sourceKey) || left.ordinal - right.ordinal);
  sources.sort((left, right) => compareCandidateJsonKeysUtf8(left.sourceKind, right.sourceKind) || compareCandidateJsonKeysUtf8(left.sourceKey, right.sourceKey));
  jobs.sort((left, right) => compareCandidateJsonKeysUtf8(left.sourceKind, right.sourceKind) || compareCandidateJsonKeysUtf8(left.sourceKey, right.sourceKey) || left.segmentOrdinal - right.segmentOrdinal);
  const selectionHash = candidateAnalysisSha256("library-analysis-agent-selection", { sources, units: units.map((unit) => ({ id: unit.id, sourceKind: unit.sourceKind, sourceKey: unit.populationSourceKey, sourceVersionHash: unit.sourceVersionHash, unitType: unit.unitType, ordinal: unit.ordinal, locator: unit.locator, contentHash: unit.contentHash, sizeBytes: unit.sizeBytes, codePoints: unit.codePoints, chunkPolicyHash: unit.chunkPolicyHash })) });
  const population = buildLibraryAnalysisPopulation(specs.map(([sourceKind, sourceKey]) => ({
    sourceKind,
    sourceKey,
    sourceVersionHash: HASH,
    inputKind: sourceKind === "document" ? "database_record" as const : sourceKind === "library_file" ? "repository_file" as const : "artifact" as const,
    locator: sourceKind === "source_doc" ? `https://example.test/${sourceKey}.pdf` : `database:${sourceKey}`,
    contentHash: HASH,
    identityConfidence: "exact" as const,
    readableInput: sourceKind === "document",
    superseded: false,
  })));
  const plan = buildLibraryAnalysisAcquisitionPlan(population, [
    { sourceKind: "source_doc", sourceKey: "source_doc:pdf", route: "controlled_https", locator: "https://example.test/pdf.pdf", alternateLocators: [] },
    { sourceKind: "library_file", sourceKey: "library_file:csv", route: "repository_csv", locator: "repository:data.csv", alternateLocators: [] },
    { sourceKind: "library_file", sourceKey: "library_file:pptx", route: "repository_pptx", locator: "repository:slides.pptx", alternateLocators: [] },
    { sourceKind: "report", sourceKey: "report:derived", route: "database_derived_record", locator: "database:Report:derived", alternateLocators: [] },
  ]);
  const core: LibraryAnalysisAgentQueueCore = {
    schema: "library-analysis-agent-queue/v1",
    createdAt: "2026-08-21T00:00:00.000Z",
    runtimeCommit: "46cf905",
    populationSnapshotId: population.snapshotId,
    populationHash: population.populationHash,
    acquisitionPlanHash: plan.planHash,
    resolutionHash: HASH,
    contentUnitManifestHash: HASH,
    costEnvelopeHash: HASH,
    mergedInventoryHash: HASH,
    chunkPolicyHash: HASH,
    selectionHash,
    workflow: { id: "workflow", version: "1", path: "workflow", hash: HASH },
    analysisPrompt: { id: "prompt", version: "1", path: "prompt", hash: HASH },
    validationWorkflow: { id: "validation", version: "1", path: "validation", hash: HASH },
    validationPrompt: { id: "validation-prompt", version: "1", path: "validation-prompt", hash: HASH },
    executionPolicy: { automatedOnly: true, externalReady: false, externalApiUsed: false, candidateDatabaseWritten: false, productionDataMutated: false, humanSourceReviewRequired: false, trackedSourceText: false, maximumAttempts: 3, maximumConcurrentAnalyzers: 3, maximumCodePointsPerJob: 48_000, maximumUnitsPerJob: 4 },
    units,
    sources,
    jobs,
  };
  const queueHash = candidateAnalysisSha256("library-analysis-agent-queue", core);
  const queue = verifyLibraryAnalysisAgentQueue({ ...core, queueId: `library-analysis-agent-queue:${queueHash}`, queueHash });
  Object.defineProperty(queue, "plan", { value: plan, enumerable: false });
  return queue;
}

function fullShapeFixture(): LibraryAnalysisAgentPilotInput {
  return shapeForSpecs(BASE_SPECS);
}

function shapeForSpecs(specs: readonly FixtureSpec[]): LibraryAnalysisAgentPilotInput {
  const queue = makeQueue(specs);
  return { queue, plan: (queue as LibraryAnalysisAgentQueue & { plan: unknown }).plan as never };
}

test("pilot is deterministic stratified and stays inside all caps", () => {
  const first = selectLibraryAnalysisAgentPilot(fullShapeFixture());
  const second = selectLibraryAnalysisAgentPilot(fullShapeFixture());
  assert.deepEqual(second, first);
  assert.ok(first.sourceIds.length >= 10 && first.sourceIds.length <= 12);
  assert.ok(first.unitCount <= 100);
  assert.ok(first.codePoints >= 200_000 && first.codePoints <= 300_000);
  assert.deepEqual(new Set(first.strata), new Set([
    "database_small", "database_medium", "database_segmented",
    "controlled_https_pdf", "repository_csv", "repository_pptx", "derived_record",
  ]));
  assert.equal(first.parentFullQueueHash, fullShapeFixture().queue.queueHash);
  assert.equal(verifyLibraryAnalysisAgentQueue(first.queue).queueHash, first.queue.queueHash);
});

test("pilot fails closed when the canonical plan does not bind the queue", () => {
  const fixture = fullShapeFixture();
  assert.throws(() => selectLibraryAnalysisAgentPilot({ ...fixture, plan: { ...fixture.plan, planHash: "f".repeat(64) } as never }), /acquisition_plan_hash_mismatch|acquisition_plan/);
});

test("pilot binds units through populationSourceKey when candidate source keys differ", () => {
  const fixture = fullShapeFixture();
  const pilot = selectLibraryAnalysisAgentPilot(fixture);
  const medium = pilot.queue.sources.find((source) => source.sourceKey === "document:medium");
  assert.ok(medium);
  assert.ok(pilot.queue.units.filter((unit) => unit.populationSourceKey === medium.sourceKey).every((unit) => unit.sourceKey !== unit.populationSourceKey));
  assert.doesNotThrow(() => verifyLibraryAnalysisAgentPilotQueue(fixture.queue, pilot.queue, pilot));
});

test("pilot rejects HTTP PDF evidence even with a pdf_page unit", () => {
  const fixture = fullShapeFixture();
  const plan = { ...fixture.plan, rows: fixture.plan.rows.map((row) => row.sourceKey === "source_doc:pdf" ? { ...row, locator: "http://example.test/pdf.pdf" } : row) };
  assert.throws(() => selectLibraryAnalysisAgentPilot({ ...fixture, plan: { ...plan, planHash: "0".repeat(64) } as never }), /acquisition_plan/);
  const selfConsistentPlan = buildLibraryAnalysisPlanWithPdfLocator(fixture, "http://example.test/pdf.pdf");
  assert.throws(() => selectLibraryAnalysisAgentPilot({ ...fixture, plan: selfConsistentPlan }), /agent_pilot_plan_queue_hash_mismatch|agent_pilot_stratum_unavailable|agent_pilot_capacity_unsatisfied/);
});

test("pilot lineage rejects removed, rehashed, and parent-mismatched children", () => {
  const fixture = fullShapeFixture();
  const pilot = selectLibraryAnalysisAgentPilot(fixture);
  const { pilotBinding: _pilotBinding, ...childWithoutBinding } = pilot.queue;
  assert.throws(() => verifyLibraryAnalysisAgentPilotQueue(fixture.queue, childWithoutBinding, pilot), /agent_queue|agent_pilot_lineage/);
  assert.throws(() => verifyLibraryAnalysisAgentPilotQueue({ ...fixture.queue, queueHash: "f".repeat(64) } as never, pilot.queue, pilot), /agent_queue|agent_pilot_lineage/);
  assert.throws(() => verifyLibraryAnalysisAgentPilotQueue(fixture.queue, pilot.queue, { ...pilot, selectionHash: "e".repeat(64) }), /agent_pilot_lineage/);
  const { queueId: _queueId, queueHash: _queueHash, ...childCore } = pilot.queue;
  const rehashedBinding = { ...pilot.queue.pilotBinding!, childSelectionHash: "f".repeat(64) };
  const rehashedCore = { ...childCore, pilotBinding: rehashedBinding };
  const rehashedHash = libraryAnalysisAgentQueueHash(rehashedCore);
  assert.throws(() => verifyLibraryAnalysisAgentPilotQueue(fixture.queue, { ...rehashedCore, queueId: `library-analysis-agent-queue:${rehashedHash}`, queueHash: rehashedHash }, pilot), /agent_queue_pilot_lineage_binding_mismatch|agent_pilot_lineage/);
});

test("pilot searches beyond early low-code-point fillers", () => {
  const specs = [
    ["document", "document:small", "database_record", 5_000],
    ["document", "document:medium", "database_record", 20_000],
    ["document", "document:segmented", "database_record", 34_000, 34_000],
    ["source_doc", "source_doc:pdf", "pdf_page", 10_000],
    ["library_file", "library_file:csv", "sheet_range", 15_000],
    ["library_file", "library_file:pptx", "slide", 15_000],
    ["report", "report:derived", "database_record", 12_000],
    ["artifact", "artifact:l77-1", "database_record", 9_000],
    ["artifact", "artifact:l77-4", "database_record", 9_000],
    ["artifact", "artifact:l77-0", "database_record", 9_000],
    ["artifact", "artifact:l77-3", "database_record", 9_000],
    ["artifact", "artifact:l77-2", "database_record", 9_000],
    ["artifact", "artifact:h77-1", "database_record", 17_000],
    ["artifact", "artifact:h77-2", "database_record", 17_000],
    ["artifact", "artifact:h77-0", "database_record", 17_000],
  ] as const;
  const pilot = selectLibraryAnalysisAgentPilot(shapeForSpecs(specs));
  assert.ok(pilot.codePoints >= 200_000);
  assert.ok(pilot.sourceIds.length <= 12);
});

test("pilot falls back to an alternate primary when the lowest one cannot fit caps", () => {
  const specs = [
    ...BASE_SPECS,
    ["document", "document:seg-low-0", "database_record", 46_000, 46_000, 46_000, 46_000, 46_000],
    ["document", "document:seg-good-0", "database_record", 30_000, 30_000],
  ] as const;
  const pilot = selectLibraryAnalysisAgentPilot(shapeForSpecs(specs));
  assert.ok(pilot.queue.sources.some((source) => source.sourceKey === "document:seg-good-0"));
  assert.ok(!pilot.queue.sources.some((source) => source.sourceKey === "document:seg-low-0"));
});

function buildLibraryAnalysisPlanWithPdfLocator(
  fixture: LibraryAnalysisAgentPilotInput,
  locator: string,
): LibraryAnalysisAgentPilotInput["plan"] {
  const rows = fixture.plan.rows.map((row) => row.sourceKey === "source_doc:pdf" ? { ...row, locator } : row);
  const core = { schema: fixture.plan.schema, policyVersion: fixture.plan.policyVersion, populationSnapshotId: fixture.plan.populationSnapshotId, populationHash: fixture.plan.populationHash, rows };
  const planHash = candidateAnalysisSha256("library-analysis-acquisition-plan", core);
  return { ...core, planId: `library-analysis-acquisition-plan:${planHash}`, planHash } as LibraryAnalysisAgentPilotInput["plan"];
}
