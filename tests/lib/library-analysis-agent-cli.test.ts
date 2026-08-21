import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, symlinkSync, writeFileSync } from "node:fs";
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
import type { LibraryAnalysisContentUnitManifest } from "../../scripts/knowledge/emit-library-analysis-content-units";
import {
  parseLibraryAnalysisAgentQueueArgs,
  runLibraryAnalysisAgentQueueCli,
} from "../../scripts/knowledge/manage-library-analysis-agent-queue";

const HASHES = {
  population: "1".repeat(64),
  plan: "2".repeat(64),
  cost: "3".repeat(64),
  inventory: "4".repeat(64),
};

function sha256(text: string): string {
  return createHash("sha256").update(Buffer.from(text, "utf8")).digest("hex");
}

function makeFixture() {
  const base = mkdtempSync(join(tmpdir(), "library-agent-cli-"));
  const runRoot = join(base, "run");
  const repositoryRoot = process.cwd();
  mkdirSync(runRoot, { recursive: true, mode: 0o700 });
  chmodSync(runRoot, 0o700);
  mkdirSync(join(runRoot, "units"), { recursive: true, mode: 0o700 });
  const entries = [
    { sourceKind: "document", sourceKey: "document:a", text: "private source bytes a" },
    { sourceKind: "web", sourceKey: "web:b", text: "private source bytes b" },
  ];
  const units: LibraryAnalysisContentUnitManifest["units"] = [];
  const rows: LibraryAnalysisAcquisitionResolution["rows"] = [];
  for (const [ordinal, entry] of entries.entries()) {
    const contentHash = sha256(entry.text);
    const locator = `https://example.test/${entry.sourceKey}`;
    const sourceVersionHash = "b".repeat(64);
    const chunkPolicyHash = "c".repeat(64);
    const idHash = candidateAnalysisSha256("library-analysis-content-unit", {
      sourceKind: entry.sourceKind,
      sourceKey: entry.sourceKey,
      sourceVersionHash,
      unitType: "document_section" as const,
      ordinal,
      locator,
      contentHash,
      chunkPolicyHash,
    });
    const id = `content:library-analysis:${idHash}`;
    const portablePath = `units/${contentHash}.txt`;
    writeFileSync(join(runRoot, portablePath), Buffer.from(entry.text, "utf8"), { mode: 0o400 });
    units.push({
      id,
      sourceKind: entry.sourceKind,
      sourceKey: entry.sourceKey,
      sourceVersionHash,
      unitType: "document_section",
      ordinal: 0,
      locator,
      locatorHash: candidateAnalysisEvidenceLocatorHash(locator),
      contentHash,
      hashAlgorithm: "sha256",
      identityConfidence: "exact",
      populationSourceKey: entry.sourceKey,
      chunkPolicyHash,
      privateArtifact: {
        portablePath,
        sha256: contentHash,
        sizeBytes: Buffer.byteLength(entry.text, "utf8"),
        codePoints: [...entry.text].length,
      },
    });
    rows.push({
      sourceKind: entry.sourceKind,
      sourceKey: entry.sourceKey,
      disposition: "content_units_ready",
      reasonCode: null,
      contentUnits: [{
        contentUnitId: id,
        sourceVersionHash,
        unitType: "document_section",
        ordinal: 0,
        locator,
        contentHash,
      }],
      attempt: null,
      maximumAttempts: null,
    });
  }
  units.sort((left, right) => left.id.localeCompare(right.id));
  rows.sort((left, right) => `${left.sourceKind}\u0000${left.sourceKey}`.localeCompare(`${right.sourceKind}\u0000${right.sourceKey}`));
  const resolutionCore = {
    schema: "library-analysis-acquisition-resolution/v1" as const,
    policyVersion: "1.0.0" as const,
    populationSnapshotId: `library-analysis-population:${HASHES.population}`,
    populationHash: HASHES.population,
    planId: `library-analysis-acquisition-plan:${HASHES.plan}`,
    planHash: HASHES.plan,
    rows,
  };
  const resolutionHash = libraryAnalysisAcquisitionResolutionHash({
    ...resolutionCore,
    resolutionId: "pending",
    resolutionHash: "0".repeat(64),
  });
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
  const resolutionPath = join(base, "resolution.json");
  const manifestPath = join(base, "manifest.json");
  writeFileSync(resolutionPath, JSON.stringify(resolution));
  writeFileSync(manifestPath, JSON.stringify(manifest));
  return {
    base,
    runRoot,
    repositoryRoot,
    resolutionPath,
    manifestPath,
    costHash: HASHES.cost,
    inventoryHash: HASHES.inventory,
  };
}

test("build publishes a sealed queue without embedding source text", async (t) => {
  const fixture = makeFixture();
  t.after(() => undefined);
  const result = await runLibraryAnalysisAgentQueueCli({
    command: "build",
    runRoot: fixture.runRoot,
    resolution: fixture.resolutionPath,
    manifest: fixture.manifestPath,
    costEnvelopeHash: fixture.costHash,
    mergedInventoryHash: fixture.inventoryHash,
    runtimeCommit: "5f3eb1c",
    repositoryRoot: fixture.repositoryRoot,
  });
  assert.equal(result.sources, 2);
  assert.equal(statSync(result.queuePath).mode & 0o777, 0o400);
  assert.doesNotMatch(readFileSync(result.queuePath, "utf8"), /private source bytes/);
  assert.match(result.queuePath, /queue\/queue-[a-f0-9]{64}\.json$/);
});

test("prepare-attempt emits exactly one job and refuses overwrite", async () => {
  const fixture = makeFixture();
  const built = await runLibraryAnalysisAgentQueueCli({
    command: "build",
    runRoot: fixture.runRoot,
    resolution: fixture.resolutionPath,
    manifest: fixture.manifestPath,
    costEnvelopeHash: fixture.costHash,
    mergedInventoryHash: fixture.inventoryHash,
    runtimeCommit: "5f3eb1c",
    repositoryRoot: fixture.repositoryRoot,
  });
  const queue = JSON.parse(readFileSync(built.queuePath, "utf8")) as { jobs: Array<{ jobId: string }> };
  const jobId = queue.jobs[0]!.jobId;
  const first = await runLibraryAnalysisAgentQueueCli({
    command: "prepare-attempt", runRoot: fixture.runRoot,
    queue: built.queuePath, jobId, attempt: 1,
  });
  assert.equal(statSync(first.inputPath).mode & 0o777, 0o400);
  const input = readFileSync(first.inputPath, "utf8");
  assert.match(input, /private source bytes/);
  assert.doesNotMatch(input, /private source bytes b/);
  await assert.rejects(
    runLibraryAnalysisAgentQueueCli({
      command: "prepare-attempt", runRoot: fixture.runRoot,
      queue: built.queuePath, jobId, attempt: 1,
    }),
    /private_artifact_exists/,
  );
});

test("prepare-attempt accepts only the authoritative queue path for its queue hash", async () => {
  const fixture = makeFixture();
  const built = await runLibraryAnalysisAgentQueueCli({
    command: "build",
    runRoot: fixture.runRoot,
    resolution: fixture.resolutionPath,
    manifest: fixture.manifestPath,
    costEnvelopeHash: fixture.costHash,
    mergedInventoryHash: fixture.inventoryHash,
    runtimeCommit: "5f3eb1c",
    repositoryRoot: fixture.repositoryRoot,
  });
  const queue = JSON.parse(readFileSync(built.queuePath, "utf8")) as { jobs: Array<{ jobId: string }> };
  const aliasPath = join(fixture.runRoot, "queue", "alias.json");
  writeFileSync(aliasPath, readFileSync(built.queuePath), { mode: 0o400 });
  await assert.rejects(
    runLibraryAnalysisAgentQueueCli({
      command: "prepare-attempt",
      runRoot: fixture.runRoot,
      queue: aliasPath,
      jobId: queue.jobs[0]!.jobId,
      attempt: 1,
    }),
    /agent_queue_queue_path_mismatch/,
  );
  const symlinkPath = join(fixture.runRoot, "queue", "queue-symlink.json");
  symlinkSync(built.queuePath, symlinkPath);
  await assert.rejects(
    runLibraryAnalysisAgentQueueCli({
      command: "prepare-attempt",
      runRoot: fixture.runRoot,
      queue: symlinkPath,
      jobId: queue.jobs[0]!.jobId,
      attempt: 2,
    }),
    /agent_queue_queue_artifact_invalid/,
  );
});

test("package command emits sanitized summaries for build and prepare-attempt", async () => {
  const fixture = makeFixture();
  const script = join(fixture.repositoryRoot, "scripts/knowledge/manage-library-analysis-agent-queue.ts");
  const run = (args: string[]) => spawnSync(process.execPath, ["--import=tsx", script, ...args], {
    cwd: fixture.repositoryRoot,
    encoding: "utf8",
  });
  const build = run([
    "build",
    `--run-root=${fixture.runRoot}`,
    `--resolution=${fixture.resolutionPath}`,
    `--manifest=${fixture.manifestPath}`,
    `--cost-envelope-hash=${fixture.costHash}`,
    `--merged-inventory-hash=${fixture.inventoryHash}`,
    "--runtime-commit=5f3eb1c",
    `--repository-root=${fixture.repositoryRoot}`,
  ]);
  assert.equal(build.status, 0, `${build.stderr}${build.stdout}`);
  assert.equal(build.stderr, "");
  const buildSummary = JSON.parse(build.stdout) as Record<string, unknown>;
  assert.equal(buildSummary.command, "build");
  const queuePath = join(fixture.runRoot, "queue", readdirSync(join(fixture.runRoot, "queue"))[0]!);
  const queue = JSON.parse(readFileSync(queuePath, "utf8")) as { jobs: Array<{ jobId: string }> };
  const forbidden = [
    "document:a", "web:b", "https://example.test", "private source bytes", "claim", fixture.runRoot,
  ];
  for (const value of forbidden) assert.doesNotMatch(build.stdout, new RegExp(escapeRegExp(value)));
  const prepare = run([
    "prepare-attempt",
    `--run-root=${fixture.runRoot}`,
    `--queue=${queuePath}`,
    `--job-id=${queue.jobs[0]!.jobId}`,
    "--attempt=1",
  ]);
  assert.equal(prepare.status, 0, prepare.stderr);
  assert.equal(prepare.stderr, "");
  const prepareSummary = JSON.parse(prepare.stdout) as Record<string, unknown>;
  assert.equal(prepareSummary.command, "prepare-attempt");
  for (const value of forbidden) assert.doesNotMatch(prepare.stdout, new RegExp(escapeRegExp(value)));
});

test("package command reports generic diagnostics without rejected private arguments", () => {
  const fixture = makeFixture();
  const script = join(fixture.repositoryRoot, "scripts/knowledge/manage-library-analysis-agent-queue.ts");
  const rejectedPath = join(fixture.runRoot, "private-rejected.json");
  const result = spawnSync(process.execPath, [
    "--import=tsx", script, "prepare-attempt",
    `--run-root=${fixture.runRoot}`,
    `--queue=${rejectedPath}`,
    "--job-id=job:missing",
    "--attempt=1",
  ], { cwd: fixture.repositoryRoot, encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.equal(result.stdout, "");
  assert.equal(result.stderr.trim(), "library_analysis_agent_queue_failed");
  assert.doesNotMatch(result.stderr, new RegExp(escapeRegExp(fixture.runRoot)));
  assert.doesNotMatch(result.stderr, /private-rejected\.json/);
});

test("CLI argument parsing is strict and keeps command paths absolute", () => {
  assert.deepEqual(
    parseLibraryAnalysisAgentQueueArgs([
      "build",
      "--run-root=/tmp/run",
      "--resolution=/tmp/resolution.json",
      "--manifest=/tmp/manifest.json",
      "--cost-envelope-hash=" + "a".repeat(64),
      "--merged-inventory-hash=" + "b".repeat(64),
      "--runtime-commit=5f3eb1c",
      "--repository-root=/tmp/repo",
    ]),
    {
      command: "build",
      runRoot: "/tmp/run",
      resolution: "/tmp/resolution.json",
      manifest: "/tmp/manifest.json",
      costEnvelopeHash: "a".repeat(64),
      mergedInventoryHash: "b".repeat(64),
      runtimeCommit: "5f3eb1c",
      repositoryRoot: "/tmp/repo",
    },
  );
  assert.throws(() => parseLibraryAnalysisAgentQueueArgs(["build", "--run-root=/tmp/run"]), /agent_queue_cli_arguments_invalid/);
  assert.throws(() => parseLibraryAnalysisAgentQueueArgs([
    "build", "--unknown=value",
  ]), /agent_queue_cli_arguments_invalid/);
});

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
