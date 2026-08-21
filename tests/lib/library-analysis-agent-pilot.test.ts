import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  candidateAnalysisSha256,
  candidateAnalysisEvidenceLocatorHash,
  compareCandidateJsonKeysUtf8,
} from "../../src/lib/knowledge/candidate-analysis-contract";
import {
  buildLibraryAnalysisAcquisitionPlan,
  type LibraryAnalysisAcquisitionLocator,
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

function unitText(id: string, codePoints: number): string {
  const seed = `${id}|`;
  return seed.repeat(Math.ceil(codePoints / seed.length)).slice(0, codePoints);
}

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
      const text = unitText(id, points);
      const contentHash = createHash("sha256").update(text, "utf8").digest("hex");
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
        contentHash,
        hashAlgorithm: "sha256",
        identityConfidence: "exact",
        chunkPolicyHash: HASH,
        portablePath: `units/${contentHash}.txt`,
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
  const plan = buildLibraryAnalysisAcquisitionPlan(population, specs.flatMap(([sourceKind, sourceKey]): LibraryAnalysisAcquisitionLocator[] => {
    if (sourceKind === "source_doc") return [{ sourceKind, sourceKey, route: "controlled_https" as const, locator: `https://example.test/${sourceKey}.pdf`, alternateLocators: [] }];
    if (sourceKind === "library_file" && sourceKey.includes("csv")) return [{ sourceKind, sourceKey, route: "repository_csv" as const, locator: `repository:${sourceKey}.csv`, alternateLocators: [] }];
    if (sourceKind === "library_file") return [{ sourceKind, sourceKey, route: "repository_pptx" as const, locator: `repository:${sourceKey}.pptx`, alternateLocators: [] }];
    if (sourceKind === "report") return [{ sourceKind, sourceKey, route: "database_derived_record" as const, locator: `database:Report:${sourceKey}`, alternateLocators: [] }];
    return [];
  }));
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

test("pilot proves a 700-source low-capacity pool impossible before Cartesian search", () => {
  const specs: FixtureSpec[] = [
    ...Array.from({ length: 100 }, (_, index) => ["document", `document:small-${index}`, "database_record", 1_000] as const),
    ...Array.from({ length: 100 }, (_, index) => ["document", `document:medium-${index}`, "database_record", 20_000] as const),
    ...Array.from({ length: 100 }, (_, index) => ["document", `document:segmented-${index}`, "database_record", 1_000, 1_000] as const),
    ...Array.from({ length: 100 }, (_, index) => ["source_doc", `source_doc:pdf-${index}`, "pdf_page", 1_000] as const),
    ...Array.from({ length: 100 }, (_, index) => ["library_file", `library_file:csv-${index}`, "sheet_range", 1_000] as const),
    ...Array.from({ length: 100 }, (_, index) => ["library_file", `library_file:pptx-${index}`, "slide", 1_000] as const),
    ...Array.from({ length: 100 }, (_, index) => ["report", `report:derived-${index}`, "database_record", 1_000] as const),
  ];
  assert.throws(() => selectLibraryAnalysisAgentPilot(shapeForSpecs(specs), { maxSearchNodes: 1_000 }), /agent_pilot_capacity_unsatisfied/);
});

test("pilot search budget exhaustion is distinct from capacity failure", () => {
  assert.throws(() => selectLibraryAnalysisAgentPilot(fullShapeFixture(), { maxSearchNodes: 1 }), /agent_pilot_search_budget_exhausted/);
});

test("pilot CLI publishes a dispatchable child queue beside the immutable full queue", async () => {
  const fixture = fullShapeFixture();
  const base = mkdtempSync(join(tmpdir(), "library-agent-pilot-cli-"));
  const runRoot = join(base, "run");
  const queueDirectory = join(runRoot, "queue");
  const unitsDirectory = join(runRoot, "units");
  mkdirSync(queueDirectory, { recursive: true, mode: 0o700 });
  mkdirSync(unitsDirectory, { recursive: true, mode: 0o700 });
  chmodSync(runRoot, 0o700);
  chmodSync(queueDirectory, 0o700);
  chmodSync(unitsDirectory, 0o700);
  for (const unit of fixture.queue.units) {
    writeFileSync(join(runRoot, unit.portablePath), unitText(unit.id, unit.codePoints), { mode: 0o400 });
  }
  const fullQueuePath = join(queueDirectory, `queue-${fixture.queue.queueHash}.json`);
  const fullQueueBytes = `${JSON.stringify(fixture.queue)}\n`;
  writeFileSync(fullQueuePath, fullQueueBytes, { mode: 0o400 });
  const planPath = join(base, "plan.json");
  writeFileSync(planPath, `${JSON.stringify(fixture.plan)}\n`, { mode: 0o400 });

  const selection = selectLibraryAnalysisAgentPilot(fixture);
  const pilotScript = join(process.cwd(), "scripts/knowledge/select-library-analysis-agent-pilot.ts");
  const queueScript = join(process.cwd(), "scripts/knowledge/manage-library-analysis-agent-queue.ts");
  const pilotRun = spawnSync(process.execPath, [
    "--import=tsx",
    pilotScript,
    `--queue=${fullQueuePath}`,
    `--plan=${planPath}`,
    `--output-root=${runRoot}`,
  ], { cwd: process.cwd(), encoding: "utf8" });
  assert.equal(pilotRun.status, 0, `${pilotRun.stderr}${pilotRun.stdout}`);
  assert.equal(pilotRun.stderr, "");
  assert.equal(JSON.parse(pilotRun.stdout).queueHash, selection.queue.queueHash);
  const childQueuePath = join(queueDirectory, `queue-${selection.queue.queueHash}.json`);
  const selectionPath = join(runRoot, "pilots", `pilot-${selection.selectionHash}`, "selection.v1.json");
  const fullQueueDigest = createHash("sha256").update(fullQueueBytes, "utf8").digest("hex");

  const preparedRun = spawnSync(process.execPath, [
    "--import=tsx",
    queueScript,
    "prepare-attempt",
    `--run-root=${runRoot}`,
    `--queue=${childQueuePath}`,
    `--job-id=${selection.queue.jobs[0]!.jobId}`,
    "--attempt=1",
    "--expected-model-provider=openai-codex",
    "--expected-model-name=gpt-5.6-luna",
    "--expected-model-version=unknown",
  ], { cwd: process.cwd(), encoding: "utf8" });
  assert.equal(preparedRun.status, 0, `${preparedRun.stderr}${preparedRun.stdout}`);
  assert.equal(preparedRun.stderr, "");
  const prepared = JSON.parse(preparedRun.stdout) as { jobId: string };
  const preparedInputPath = join(
    runRoot,
    "jobs",
    prepared.jobId,
    "attempt-001",
    "input.json",
  );

  assert.equal(statSync(fullQueuePath).mode & 0o777, 0o400);
  assert.equal(createHash("sha256").update(readFileSync(fullQueuePath)).digest("hex"), fullQueueDigest);
  assert.equal(statSync(childQueuePath).mode & 0o777, 0o400);
  assert.equal(statSync(selectionPath).mode & 0o777, 0o400);
  assert.equal(statSync(preparedInputPath).mode & 0o777, 0o400);
  assert.equal(existsSync(join(runRoot, "pilot-queue.v1.json")), false);
  assert.deepEqual(
    readdirSync(queueDirectory).sort(),
    [`queue-${fixture.queue.queueHash}.json`, `queue-${selection.queue.queueHash}.json`].sort(),
  );
  assert.doesNotThrow(() => verifyLibraryAnalysisAgentPilotQueue(
    fixture.queue,
    JSON.parse(readFileSync(childQueuePath, "utf8")),
    { ...JSON.parse(readFileSync(selectionPath, "utf8")), queue: selection.queue },
  ));
  const replay = spawnSync(process.execPath, [
    "--import=tsx",
    pilotScript,
    `--queue=${fullQueuePath}`,
    `--plan=${planPath}`,
    `--run-root=${runRoot}`,
  ], { cwd: process.cwd(), encoding: "utf8" });
  assert.notEqual(replay.status, 0);
  assert.equal(replay.stdout, "");
  assert.equal(replay.stderr.trim(), "library_analysis_agent_pilot_failed");
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
