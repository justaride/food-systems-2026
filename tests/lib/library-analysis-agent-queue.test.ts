import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, writeFileSync, chmodSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import {
  candidateAnalysisEvidenceLocatorHash,
  candidateAnalysisSha256,
} from "../../src/lib/knowledge/candidate-analysis-contract";
import {
  LibraryAnalysisAcquisitionResolutionSchema,
  libraryAnalysisAcquisitionResolutionHash,
  type LibraryAnalysisAcquisitionResolution,
} from "../../src/lib/knowledge/library-analysis-acquisition-contract";
import {
  buildLibraryAnalysisAgentQueue,
  libraryAnalysisAgentQueueHash,
  loadVerifiedLibraryAnalysisJob,
  verifyLibraryAnalysisAgentQueue,
} from "../../src/lib/knowledge/library-analysis-agent-queue";
import type { LibraryAnalysisContentUnitManifest } from "../../scripts/knowledge/emit-library-analysis-content-units";

const HASHES = {
  population: "1".repeat(64),
  plan: "2".repeat(64),
  cost: "3".repeat(64),
  inventory: "4".repeat(64),
};

type FixtureUnit = {
  sourceKind: string;
  sourceKey: string;
  ordinal: number;
  text: string;
};

function unit(sourceKey: string, ordinal: number, text: string): FixtureUnit {
  return { sourceKind: sourceKey.split(":")[0]!, sourceKey, ordinal, text };
}

function binding(id: string) {
  return { id, version: "1.0.0", path: `workflows/${id}.md`, hash: "a".repeat(64) };
}

function contentHash(text: string): string {
  return createHash("sha256").update(Buffer.from(text, "utf8")).digest("hex");
}

function makeFixture(inputUnits: FixtureUnit[]) {
  const root = mkdtempSync(join(tmpdir(), "library-agent-queue-"));
  chmodSync(root, 0o700);
  const bySource = new Map<string, FixtureUnit[]>();
  for (const fixtureUnit of inputUnits) {
    const list = bySource.get(fixtureUnit.sourceKey) ?? [];
    list.push(fixtureUnit);
    bySource.set(fixtureUnit.sourceKey, list);
  }
  const units: LibraryAnalysisContentUnitManifest["units"] = [];
  const resolutionRows = [];
  for (const [sourceKey, sourceUnits] of bySource) {
    const sourceKind = sourceUnits[0]!.sourceKind;
    const resolvedUnits = [];
    for (const sourceUnit of [...sourceUnits].sort((a, b) => a.ordinal - b.ordinal)) {
      const text = sourceUnit.text;
      const hash = contentHash(text);
      const locator = `https://example.test/${sourceKey}/${sourceUnit.ordinal}`;
      const identityHash = candidateAnalysisSha256("library-analysis-content-unit", {
        sourceKind,
        sourceKey,
        sourceVersionHash: "b".repeat(64),
        unitType: "document_section" as const,
        ordinal: sourceUnit.ordinal,
        locator,
        contentHash: hash,
        chunkPolicyHash: "c".repeat(64),
      });
      const id = `content:library-analysis:${identityHash}`;
      const portablePath = `units/${hash}.txt`;
      mkdirSync(join(root, "units"), { recursive: true, mode: 0o700 });
      writeFileSync(join(root, portablePath), Buffer.from(text, "utf8"), { mode: 0o400 });
      units.push({
        id,
        sourceKind,
        sourceKey,
        sourceVersionHash: "b".repeat(64),
        unitType: "document_section" as const,
        ordinal: sourceUnit.ordinal,
        locator,
        locatorHash: candidateAnalysisEvidenceLocatorHash(locator),
        contentHash: hash,
        hashAlgorithm: "sha256",
        identityConfidence: "exact",
        populationSourceKey: sourceKey,
        chunkPolicyHash: "c".repeat(64),
        privateArtifact: {
          portablePath,
          sha256: hash,
          sizeBytes: Buffer.byteLength(text, "utf8"),
          codePoints: [...text].length,
        },
      });
      resolvedUnits.push({
        contentUnitId: id,
        sourceVersionHash: "b".repeat(64),
        unitType: "document_section" as const,
        ordinal: sourceUnit.ordinal,
        locator,
        contentHash: hash,
      });
    }
    resolutionRows.push({
      sourceKind,
      sourceKey,
      disposition: "content_units_ready" as const,
      reasonCode: null,
      contentUnits: resolvedUnits,
    });
  }
  units.sort((a, b) => a.id.localeCompare(b.id));
  resolutionRows.sort((a, b) => `${a.sourceKind}\u0000${a.sourceKey}`.localeCompare(`${b.sourceKind}\u0000${b.sourceKey}`));
  const resolutionCore = {
    schema: "library-analysis-acquisition-resolution/v1" as const,
    policyVersion: "1.0.0" as const,
    populationSnapshotId: "library-analysis-population:" + HASHES.population,
    populationHash: HASHES.population,
    planId: "library-analysis-acquisition-plan:" + HASHES.plan,
    planHash: HASHES.plan,
    rows: resolutionRows.map((row) => ({ ...row, attempt: null, maximumAttempts: null })),
  };
  const resolutionHash = libraryAnalysisAcquisitionResolutionHash({ ...resolutionCore, resolutionId: "pending", resolutionHash: "0".repeat(64) });
  const resolution: LibraryAnalysisAcquisitionResolution = LibraryAnalysisAcquisitionResolutionSchema.parse({
    ...resolutionCore,
    resolutionId: `library-analysis-acquisition-resolution:${resolutionHash}`,
    resolutionHash,
  });
  const manifestCore = {
    schema: "library-analysis-content-unit-manifest/v1" as const,
    populationSnapshotId: resolution.populationSnapshotId,
    populationHash: resolution.populationHash,
    planId: resolution.planId,
    planHash: resolution.planHash,
    resolutionId: resolution.resolutionId,
    resolutionHash: resolution.resolutionHash,
    chunkPolicyHash: "c".repeat(64),
    units,
  };
  const manifest: LibraryAnalysisContentUnitManifest = {
    ...manifestCore,
    manifestHash: candidateAnalysisSha256("library-analysis-content-unit-manifest", manifestCore),
  };
  return {
    root,
    resolution,
    manifest,
    input: {
      resolution,
      manifest,
      runRoot: root,
      costEnvelopeHash: HASHES.cost,
      mergedInventoryHash: HASHES.inventory,
      runtimeCommit: "5f3eb1c",
      workflow: binding("library_analysis_v1"),
      analysisPrompt: binding("library_analysis_agent_v1"),
      validationWorkflow: binding("library_validation_v1"),
      validationPrompt: binding("library_validation_agent_v1"),
    },
  };
}

function withManifestUnits(manifest: LibraryAnalysisContentUnitManifest, units: LibraryAnalysisContentUnitManifest["units"]): LibraryAnalysisContentUnitManifest {
  const core = { ...manifest, units };
  delete (core as Partial<LibraryAnalysisContentUnitManifest>).manifestHash;
  return { ...core, manifestHash: candidateAnalysisSha256("library-analysis-content-unit-manifest", core) };
}

test("queue selects ready resolution rows including formerly blocked routes", () => {
  const fixture = makeFixture([
    unit("document:a", 0, "alpha"),
    unit("source_doc:web", 0, "https text"),
  ]);
  const queue = buildLibraryAnalysisAgentQueue(fixture.input);
  assert.equal(queue.sources.length, 2);
  assert.equal(queue.jobs.flatMap((job) => job.unitIds).length, 2);
  assert.ok(queue.sources.some((source) => source.sourceKey === "source_doc:web"));
  assert.equal(queue.executionPolicy.externalApiUsed, false);
  assert.equal(queue.executionPolicy.candidateDatabaseWritten, false);
});

test("queue rejects missing duplicate and drifted units", () => {
  const fixture = makeFixture([
    unit("document:a", 0, "alpha"),
    unit("document:a", 1, "beta"),
  ]);
  assert.throws(
    () => buildLibraryAnalysisAgentQueue({ ...fixture.input, manifest: withManifestUnits(fixture.manifest, fixture.manifest.units.slice(0, 1)) }),
    /agent_queue_resolution_manifest_coverage_mismatch/,
  );
  const drifted = { ...fixture.manifest.units[0]!, contentHash: "d".repeat(64), privateArtifact: { ...fixture.manifest.units[0]!.privateArtifact, portablePath: `units/${"d".repeat(64)}.txt`, sha256: "d".repeat(64) } };
  assert.throws(
    () => buildLibraryAnalysisAgentQueue({ ...fixture.input, manifest: withManifestUnits(fixture.manifest, [drifted, fixture.manifest.units[1]!]) }),
    /agent_queue_unit_binding_mismatch|private_artifact_hash_mismatch/,
  );
});

test("queue segments a source without crossing source or policy boundaries", () => {
  const fixture = makeFixture([
    unit("document:a", 0, "one"),
    unit("document:a", 1, "two"),
    unit("document:a", 2, "three"),
    unit("document:a", 3, "four"),
    unit("document:a", 4, "five"),
  ]);
  const queue = buildLibraryAnalysisAgentQueue({ ...fixture.input, policy: {
    maximumAttempts: 3,
    maximumConcurrentAnalyzers: 3,
    maximumCodePointsPerJob: 7,
    maximumUnitsPerJob: 2,
  } });
  assert.deepEqual(queue.jobs.map((job) => job.unitIds.length), [2, 1, 1, 1]);
  assert.ok(queue.jobs.every((job) => job.codePoints <= 7));
  assert.ok(queue.jobs.every((job) => job.sourceKey === "document:a"));
  assert.equal(verifyLibraryAnalysisAgentQueue(queue).queueHash, queue.queueHash);
});

test("verified job loading rechecks private bytes and code points", () => {
  const fixture = makeFixture([unit("document:a", 0, "å😀")]);
  const queue = buildLibraryAnalysisAgentQueue(fixture.input);
  const loaded = loadVerifiedLibraryAnalysisJob(fixture.root, queue, queue.jobs[0]!.jobId);
  assert.equal(loaded.units[0]!.text, "å😀");
  assert.ok(readFileSync(join(fixture.root, queue.units[0]!.portablePath)).length > 0);
  assert.throws(() => loadVerifiedLibraryAnalysisJob(fixture.root, queue, "missing-job"), /agent_queue_job_not_found/);
});

test("queue rejects policies above the absolute execution limits", () => {
  const fixture = makeFixture([unit("document:a", 0, "alpha")]);
  assert.throws(
    () => buildLibraryAnalysisAgentQueue({ ...fixture.input, policy: {
      maximumAttempts: 3,
      maximumConcurrentAnalyzers: 3,
      maximumCodePointsPerJob: 48_001,
      maximumUnitsPerJob: 4,
    } }),
    /agent_queue_policy_invalid/,
  );
  assert.throws(
    () => buildLibraryAnalysisAgentQueue({ ...fixture.input, policy: {
      maximumAttempts: 3,
      maximumConcurrentAnalyzers: 3,
      maximumCodePointsPerJob: 48_000,
      maximumUnitsPerJob: 5,
    } }),
    /agent_queue_policy_invalid/,
  );
  const queue = buildLibraryAnalysisAgentQueue(fixture.input);
  const driftedCore = {
    ...queue,
    executionPolicy: { ...queue.executionPolicy, maximumCodePointsPerJob: 48_001 },
  };
  const { queueId: _queueId, queueHash: _queueHash, ...core } = driftedCore;
  const driftedHash = libraryAnalysisAgentQueueHash(core);
  assert.throws(
    () => verifyLibraryAnalysisAgentQueue({ ...driftedCore, queueHash: driftedHash, queueId: `library-analysis-agent-queue:${driftedHash}` }),
    /agent_queue_policy_invalid/,
  );
});

test("queue rejects every manifest-resolution header mismatch", () => {
  const fixture = makeFixture([unit("document:a", 0, "alpha")]);
  const headers = [
    "populationSnapshotId",
    "populationHash",
    "planId",
    "planHash",
    "resolutionId",
    "resolutionHash",
  ] as const;
  for (const header of headers) {
    const manifestCore = { ...fixture.manifest, [header]: header === "populationHash" || header === "planHash" || header === "resolutionHash" ? "e".repeat(64) : `${header}-drift` };
    delete (manifestCore as Partial<LibraryAnalysisContentUnitManifest>).manifestHash;
    const manifest = { ...manifestCore, manifestHash: candidateAnalysisSha256("library-analysis-content-unit-manifest", manifestCore) };
    assert.throws(
      () => buildLibraryAnalysisAgentQueue({ ...fixture.input, manifest }),
      /agent_queue_resolution_manifest_binding_mismatch/,
      header,
    );
  }
});

test("queue rejects invalid UTF-8 even when descriptor counts are adapted", () => {
  const fixture = makeFixture([unit("document:a", 0, "alpha")]);
  const original = fixture.manifest.units[0]!;
  const invalid = Buffer.from([0xff]);
  const invalidHash = createHash("sha256").update(invalid).digest("hex");
  const invalidPortablePath = `units/${invalidHash}.txt`;
  writeFileSync(join(fixture.root, invalidPortablePath), invalid, { mode: 0o600 });
  chmodSync(join(fixture.root, invalidPortablePath), 0o400);
  const unitWithInvalidBytes = {
    ...original,
    contentHash: invalidHash,
    privateArtifact: { ...original.privateArtifact, portablePath: invalidPortablePath, sha256: invalidHash, sizeBytes: 1, codePoints: 1 },
  };
  const resolutionCore = {
    ...fixture.resolution,
    rows: fixture.resolution.rows.map((row) => ({ ...row, contentUnits: row.contentUnits.map((resolved) => ({ ...resolved, contentHash: invalidHash })) })),
  };
  delete (resolutionCore as Partial<LibraryAnalysisAcquisitionResolution>).resolutionHash;
  delete (resolutionCore as Partial<LibraryAnalysisAcquisitionResolution>).resolutionId;
  const resolutionHash = libraryAnalysisAcquisitionResolutionHash({ ...resolutionCore, resolutionId: "pending", resolutionHash: "0".repeat(64) });
  const resolution = LibraryAnalysisAcquisitionResolutionSchema.parse({ ...resolutionCore, resolutionId: `library-analysis-acquisition-resolution:${resolutionHash}`, resolutionHash });
  const manifestCore = { ...fixture.manifest, resolutionId: resolution.resolutionId, resolutionHash: resolution.resolutionHash, units: [unitWithInvalidBytes] };
  delete (manifestCore as Partial<LibraryAnalysisContentUnitManifest>).manifestHash;
  const manifest = { ...manifestCore, manifestHash: candidateAnalysisSha256("library-analysis-content-unit-manifest", manifestCore) };
  assert.throws(
    () => buildLibraryAnalysisAgentQueue({ ...fixture.input, resolution, manifest }),
    /agent_queue_unit_utf8_invalid/,
  );
});

test("queue rejects ordinal gaps and reordered job unit ids", () => {
  const gapFixture = makeFixture([unit("document:a", 0, "alpha"), unit("document:a", 2, "beta")]);
  assert.throws(() => buildLibraryAnalysisAgentQueue(gapFixture.input), /agent_queue_unit_ordinal_gap/);

  const fixture = makeFixture([unit("document:a", 0, "alpha"), unit("document:a", 1, "beta")]);
  const queue = buildLibraryAnalysisAgentQueue(fixture.input);
  const job = queue.jobs[0]!;
  const reorderedJob = { ...job, unitIds: [...job.unitIds].reverse() };
  const tamperedCore = { ...queue, jobs: [reorderedJob] };
  const { queueId: _queueId, queueHash: _queueHash, ...core } = tamperedCore;
  const tamperedHash = libraryAnalysisAgentQueueHash(core);
  assert.throws(
    () => verifyLibraryAnalysisAgentQueue({ ...tamperedCore, queueHash: tamperedHash, queueId: `library-analysis-agent-queue:${tamperedHash}` }),
    /agent_queue_job_unit_range_invalid/,
  );
});
