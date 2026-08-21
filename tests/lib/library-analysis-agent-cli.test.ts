import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import {
  canonicalCandidateJson,
  candidateAnalysisEvidenceLocatorHash,
  candidateAnalysisSha256,
  type CandidateJsonValue,
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
import {
  libraryAnalysisAgentSegmentResponseHash,
} from "../../src/lib/knowledge/library-analysis-agent-response";
import { deriveLibraryAnalysisAgentQueueState } from "../../src/lib/knowledge/library-analysis-agent-checkpoint";
import { verifyLibraryAnalysisAgentQueue, type LibraryAnalysisAgentQueue } from "../../src/lib/knowledge/library-analysis-agent-queue";

const HASHES = {
  population: "1".repeat(64),
  plan: "2".repeat(64),
  cost: "3".repeat(64),
  inventory: "4".repeat(64),
};
const EXPECTED_MODEL = {
  provider: "openai-codex" as const,
  name: "gpt-5.6-luna" as const,
  version: "unknown",
};

function sha256(text: string): string {
  return createHash("sha256").update(Buffer.from(text, "utf8")).digest("hex");
}

type FixtureEntry = {
  sourceKind: string;
  sourceKey: string;
  populationSourceKey?: string;
  text: string;
};

function makeFixture(entriesOverride?: readonly FixtureEntry[]) {
  const base = mkdtempSync(join(tmpdir(), "library-agent-cli-"));
  const runRoot = join(base, "run");
  const repositoryRoot = process.cwd();
  mkdirSync(runRoot, { recursive: true, mode: 0o700 });
  chmodSync(runRoot, 0o700);
  mkdirSync(join(runRoot, "units"), { recursive: true, mode: 0o700 });
  const entries = entriesOverride ?? [
    { sourceKind: "document", sourceKey: "document:a", text: "private source bytes a reports 42 units" },
    { sourceKind: "web", sourceKey: "web:b", text: "private source bytes b contains no material claim" },
  ];
  const units: LibraryAnalysisContentUnitManifest["units"] = [];
  const rows: LibraryAnalysisAcquisitionResolution["rows"] = [];
  for (const [ordinal, entry] of entries.entries()) {
    const populationSourceKey = entry.populationSourceKey ?? entry.sourceKey;
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
      populationSourceKey,
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
      sourceKey: populationSourceKey,
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
    queue: built.queuePath, jobId, attempt: 1, expectedModel: EXPECTED_MODEL,
  });
  assert.equal(statSync(first.inputPath).mode & 0o777, 0o400);
  const input = readFileSync(first.inputPath, "utf8");
  assert.match(input, /private source bytes/);
  assert.doesNotMatch(input, /private source bytes b/);
  await assert.rejects(
    runLibraryAnalysisAgentQueueCli({
      command: "prepare-attempt", runRoot: fixture.runRoot,
      queue: built.queuePath, jobId, attempt: 1, expectedModel: EXPECTED_MODEL,
    }),
    /private_artifact_exists/,
  );
});

test("prepare-attempt rejects a non-dispatchable attempt without creating artifacts", async () => {
  const fixture = endToEndFixture(undefined);
  const built = await runLibraryAnalysisAgentQueueCli({
    command: "build", runRoot: fixture.runRoot, resolution: fixture.resolutionPath,
    manifest: fixture.manifestPath, costEnvelopeHash: fixture.costHash,
    mergedInventoryHash: fixture.inventoryHash, runtimeCommit: "5f3eb1c", repositoryRoot: fixture.repositoryRoot,
  });
  const queue = JSON.parse(readFileSync(built.queuePath, "utf8")) as { jobs: Array<{ jobId: string }> };
  const jobId = queue.jobs[0]!.jobId;
  await assert.rejects(
    runLibraryAnalysisAgentQueueCli({
      command: "prepare-attempt", runRoot: fixture.runRoot, queue: built.queuePath,
      jobId, attempt: 2, expectedModel: EXPECTED_MODEL,
    }),
    /agent_queue_attempt_not_dispatchable/u,
  );
  assert.equal(existsSync(join(fixture.runRoot, "jobs")), false);

  const first = await runLibraryAnalysisAgentQueueCli({
    command: "prepare-attempt", runRoot: fixture.runRoot, queue: built.queuePath,
    jobId, attempt: 1, expectedModel: EXPECTED_MODEL,
  });
  await fixture.writeValidLunaResponse(first);
  await runLibraryAnalysisAgentQueueCli({
    command: "accept-attempt", runRoot: fixture.runRoot, queue: built.queuePath,
    attemptInput: first.inputPath, response: fixture.lastLunaResponsePath!,
  });
  await assert.rejects(
    runLibraryAnalysisAgentQueueCli({
      command: "prepare-attempt", runRoot: fixture.runRoot, queue: built.queuePath,
      jobId, attempt: 2, expectedModel: EXPECTED_MODEL,
    }),
    /agent_queue_attempt_not_dispatchable/u,
  );
  assert.equal(readdirSync(join(fixture.runRoot, "jobs", jobId)).includes("attempt-002"), false);
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
      expectedModel: EXPECTED_MODEL,
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
      expectedModel: EXPECTED_MODEL,
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
    "--expected-model-provider=openai-codex",
    "--expected-model-name=gpt-5.6-luna",
    "--expected-model-version=unknown",
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
    "--expected-model-provider=openai-codex",
    "--expected-model-name=gpt-5.6-luna",
    "--expected-model-version=unknown",
  ], { cwd: fixture.repositoryRoot, encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.equal(result.stdout, "");
  assert.equal(result.stderr.trim(), "library_analysis_agent_queue_failed");
  assert.doesNotMatch(result.stderr, new RegExp(escapeRegExp(fixture.runRoot)));
  assert.doesNotMatch(result.stderr, /private-rejected\.json/);
});

test("accept-attempt seals raw and accepted responses without leaking private content", async () => {
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
  const prepared = await runLibraryAnalysisAgentQueueCli({
    command: "prepare-attempt",
    runRoot: fixture.runRoot,
    queue: built.queuePath,
    jobId: queue.jobs[0]!.jobId,
    attempt: 1,
    expectedModel: EXPECTED_MODEL,
  });
  const input = JSON.parse(readFileSync(prepared.inputPath, "utf8")) as {
    queueHash: string;
    attempt: number;
    inputHash: string;
    job: { jobId: string; inputEnvelopeHash: string };
    expectedModel: typeof EXPECTED_MODEL;
    units: Array<{ id: string; locator: string; text: string }>;
  };
  const response = {
    schema: "library-analysis-agent-segment-response/v1",
    queueHash: input.queueHash,
    jobId: input.job.jobId,
    jobHash: input.job.inputEnvelopeHash,
    attempt: input.attempt,
    inputHash: input.inputHash,
    model: input.expectedModel,
    unitCoverage: input.units.map((unit, index) => ({
      contentUnitId: unit.id,
      status: index === 0 ? "claims_extracted" : "no_material_claim",
    })),
    claims: [{
      localOrdinal: 0,
      assertionType: "claim",
      contentUnitId: input.units[0]!.id,
      text: input.units[0]!.text,
      evidence: input.units[0]!.text,
      locator: input.units[0]!.locator,
      confidence: 0.9,
    }],
    responseHash: "0".repeat(64),
  };
  response.responseHash = libraryAnalysisAgentSegmentResponseHash(response);
  const responsePath = join(fixture.base, "worker-response.json");
  writeFileSync(responsePath, JSON.stringify(response), { mode: 0o600 });
  const accepted = await runLibraryAnalysisAgentQueueCli({
    command: "accept-attempt",
    runRoot: fixture.runRoot,
    queue: built.queuePath,
    attemptInput: prepared.inputPath,
    response: responsePath,
  });
  assert.equal(statSync(accepted.rawResponsePath).mode & 0o777, 0o400);
  assert.equal(statSync(accepted.acceptedPath).mode & 0o777, 0o400);
  assert.match(readFileSync(accepted.acceptedPath, "utf8"), /claim:library-agent:[a-f0-9]{64}/u);
  await assert.rejects(
    runLibraryAnalysisAgentQueueCli({
      command: "accept-attempt",
      runRoot: fixture.runRoot,
      queue: built.queuePath,
      attemptInput: prepared.inputPath,
      response: responsePath,
    }),
    /private_artifact_exists/u,
  );
});

test("accept-attempt rejects a symlink response before reading it", async () => {
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
  const prepared = await runLibraryAnalysisAgentQueueCli({
    command: "prepare-attempt",
    runRoot: fixture.runRoot,
    queue: built.queuePath,
    jobId: queue.jobs[0]!.jobId,
    attempt: 1,
    expectedModel: EXPECTED_MODEL,
  });
  const responsePath = join(fixture.base, "response.json");
  const targetPath = join(fixture.base, "target.json");
  writeFileSync(targetPath, "private worker response", { mode: 0o600 });
  symlinkSync(targetPath, responsePath);
  await assert.rejects(
    runLibraryAnalysisAgentQueueCli({
      command: "accept-attempt",
      runRoot: fixture.runRoot,
      queue: built.queuePath,
      attemptInput: prepared.inputPath,
      response: responsePath,
    }),
    /agent_queue_attempt_input_artifact_invalid|agent_response_artifact_invalid/u,
  );
});

test("accept-attempt rejects a self-consistent forged attempt input", async () => {
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
  const prepared = await runLibraryAnalysisAgentQueueCli({
    command: "prepare-attempt",
    runRoot: fixture.runRoot,
    queue: built.queuePath,
    jobId: queue.jobs[0]!.jobId,
    attempt: 1,
    expectedModel: EXPECTED_MODEL,
  });
  const original = JSON.parse(readFileSync(prepared.inputPath, "utf8")) as Record<string, unknown>;
  const forgedCore = {
    ...original,
    attempt: 2,
    units: (original.units as Array<Record<string, unknown>>).map((unit, index) =>
      index === 0 ? { ...unit, text: "forged source bytes" } : unit),
  };
  const withoutHash = { ...forgedCore } as Record<string, unknown>;
  delete withoutHash.inputHash;
  const forged = {
    ...forgedCore,
    inputHash: candidateAnalysisSha256("library-analysis-agent-attempt-input", withoutHash as CandidateJsonValue),
  };
  const forgedPath = join(fixture.runRoot, "jobs", queue.jobs[0]!.jobId, "attempt-002", "input.json");
  mkdirSync(join(fixture.runRoot, "jobs", queue.jobs[0]!.jobId, "attempt-002"), { recursive: true, mode: 0o700 });
  writeFileSync(forgedPath, `${JSON.stringify(forged)}\n`, { mode: 0o400 });
  const responsePath = join(fixture.base, "unused-response.json");
  writeFileSync(responsePath, "{}", { mode: 0o600 });
  await assert.rejects(
    runLibraryAnalysisAgentQueueCli({
      command: "accept-attempt",
      runRoot: fixture.runRoot,
      queue: built.queuePath,
      attemptInput: forgedPath,
      response: responsePath,
    }),
    /attempt_input_authority_mismatch/u,
  );
});

test("merge-source reads only sealed accepted segments and publishes an exclusive result", async () => {
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
  const queue = JSON.parse(readFileSync(built.queuePath, "utf8")) as {
    queueHash: string;
    jobs: Array<{ jobId: string; sourceKind: string; sourceKey: string }>;
    sources: Array<{ sourceKind: string; sourceKey: string; sourceEnvelopeHash: string }>;
  };
  const source = queue.sources.find((candidate) => candidate.sourceKey === "document:a")!;
  const job = queue.jobs.find((candidate) => candidate.sourceKey === source.sourceKey)!;
  const prepared = await runLibraryAnalysisAgentQueueCli({
    command: "prepare-attempt",
    runRoot: fixture.runRoot,
    queue: built.queuePath,
    jobId: job.jobId,
    attempt: 1,
    expectedModel: EXPECTED_MODEL,
  });
  const input = JSON.parse(readFileSync(prepared.inputPath, "utf8")) as {
    queueHash: string;
    attempt: number;
    inputHash: string;
    job: { jobId: string; inputEnvelopeHash: string; segmentOrdinal: number };
    expectedModel: typeof EXPECTED_MODEL;
    units: Array<{ id: string; locator: string }>;
  };
  const response = {
    schema: "library-analysis-agent-segment-response/v1" as const,
    queueHash: input.queueHash,
    jobId: input.job.jobId,
    jobHash: input.job.inputEnvelopeHash,
    attempt: input.attempt,
    inputHash: input.inputHash,
    model: input.expectedModel,
    unitCoverage: input.units.map((unit) => ({ contentUnitId: unit.id, status: "no_material_claim" as const })),
    claims: [],
    responseHash: "0".repeat(64),
  };
  response.responseHash = libraryAnalysisAgentSegmentResponseHash(response);
  const responsePath = join(fixture.base, "merge-response.json");
  writeFileSync(responsePath, JSON.stringify(response), { mode: 0o600 });
  const accepted = await runLibraryAnalysisAgentQueueCli({
    command: "accept-attempt",
    runRoot: fixture.runRoot,
    queue: built.queuePath,
    attemptInput: prepared.inputPath,
    response: responsePath,
  });
  const terminal = JSON.parse(readFileSync(accepted.acceptedPath, "utf8")) as Record<string, unknown>;
  terminal.attempt = 2;
  terminal.terminalReason = "terminal_without_explicit_state";
  mkdirSync(join(fixture.runRoot, "jobs", job.jobId, "attempt-002"), { recursive: true, mode: 0o700 });
  writeFileSync(
    join(fixture.runRoot, "jobs", job.jobId, "attempt-002", "terminal.json"),
    JSON.stringify(terminal),
    { mode: 0o400 },
  );

  const merged = await runLibraryAnalysisAgentQueueCli({
    command: "merge-source",
    runRoot: fixture.runRoot,
    queue: built.queuePath,
    sourceId: source.sourceEnvelopeHash,
  });
  assert.equal(merged.analysisState, "failed");
  assert.equal(merged.claims, 0);
  assert.equal(statSync(merged.sourceResultPath).mode & 0o777, 0o400);
  const mergedPayload = JSON.parse(readFileSync(merged.sourceResultPath, "utf8")) as {
    segments: Array<{ terminalReason?: string; attempts: Array<{ status: string; terminalReason?: string }> }>;
  };
  assert.equal(mergedPayload.segments[0]!.terminalReason, "terminal_without_explicit_state");
  assert.deepEqual(mergedPayload.segments[0]!.attempts.map((attempt) => attempt.status), ["accepted", "failed"]);
  assert.equal(mergedPayload.segments[0]!.attempts[1]!.terminalReason, "terminal_without_explicit_state");
  await assert.rejects(
    runLibraryAnalysisAgentQueueCli({
      command: "merge-source",
      runRoot: fixture.runRoot,
      queue: built.queuePath,
      sourceId: source.sourceEnvelopeHash,
    }),
    /private_artifact_exists/u,
  );
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
    "prepare-attempt", "--run-root=/tmp/run", "--queue=/tmp/queue.json",
    "--job-id=job:fixture", "--attempt=1",
    "--expected-model-provider=openai-codex", "--expected-model-name=gpt-5.6-sol",
    "--expected-model-version=unknown",
  ]), /agent_queue_cli_arguments_invalid/);
  assert.throws(() => parseLibraryAnalysisAgentQueueArgs([
    "build", "--unknown=value",
  ]), /agent_queue_cli_arguments_invalid/);
  assert.deepEqual(
    parseLibraryAnalysisAgentQueueArgs([
      "merge-source", "--run-root=/tmp/run", "--queue=/tmp/queue.json",
      "--source-id=" + "a".repeat(64),
    ]),
    {
      command: "merge-source",
      runRoot: "/tmp/run",
      queue: "/tmp/queue.json",
      sourceId: "a".repeat(64),
    },
  );
  assert.throws(() => parseLibraryAnalysisAgentQueueArgs([
    "merge-source", "--run-root=/tmp/run", "--queue=/tmp/queue.json",
  ]), /agent_queue_cli_arguments_invalid/);
  assert.throws(() => parseLibraryAnalysisAgentQueueArgs([
    "merge-source", "--run-root=/tmp/run", "--queue=/tmp/queue.json", "--source-id=document:a",
  ]), /agent_queue_cli_arguments_invalid/);
  assert.deepEqual(
    parseLibraryAnalysisAgentQueueArgs([
      "merge-source", "--run-root=/tmp/run", "--queue=/tmp/queue.json",
      "--source-kind=document", "--source-key=document:a",
    ]),
    {
      command: "merge-source",
      runRoot: "/tmp/run",
      queue: "/tmp/queue.json",
      sourceKind: "document",
      sourceKey: "document:a",
    },
  );
});

test("status and finalize commands have strict private-only arguments", () => {
  assert.deepEqual(
    parseLibraryAnalysisAgentQueueArgs([
      "status",
      "--run-root=/tmp/private-run",
      "--queue=/tmp/private-run/queue/queue-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.json",
    ]),
    {
      command: "status",
      runRoot: "/tmp/private-run",
      queue: "/tmp/private-run/queue/queue-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.json",
    },
  );
  assert.deepEqual(
    parseLibraryAnalysisAgentQueueArgs([
      "finalize",
      "--run-root=/tmp/private-run",
      "--queue=/tmp/private-run/queue/queue-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.json",
      `--final-merge-hash=${"b".repeat(64)}`,
    ]),
    {
      command: "finalize",
      runRoot: "/tmp/private-run",
      queue: "/tmp/private-run/queue/queue-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.json",
      finalMergeHash: "b".repeat(64),
    },
  );
  assert.throws(() => parseLibraryAnalysisAgentQueueArgs([
    "status", "--run-root=/tmp/private-run", "--queue=/tmp/private-run/queue.json", "--source-key=secret",
  ]), /agent_queue_cli_arguments_invalid/);
});

test("status derives a sanitized pending snapshot from a sealed queue", async () => {
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
  const status = await runLibraryAnalysisAgentQueueCli({
    command: "status",
    runRoot: fixture.runRoot,
    queue: built.queuePath,
  });
  assert.equal(status.command, "status");
  assert.equal(status.queueHash, built.queueHash);
  assert.equal(status.state, "pending");
  assert.equal(status.pendingJobs, built.jobs);
  assert.equal(status.automatedOnly, true);
  assert.equal(status.externalReady, false);
});

test("status rejects accepted and terminal artifacts coexisting in one attempt directory", async () => {
  const fixture = makeFixture();
  const built = await runLibraryAnalysisAgentQueueCli({
    command: "build", runRoot: fixture.runRoot, resolution: fixture.resolutionPath,
    manifest: fixture.manifestPath, costEnvelopeHash: fixture.costHash,
    mergedInventoryHash: fixture.inventoryHash, runtimeCommit: "5f3eb1c", repositoryRoot: fixture.repositoryRoot,
  });
  const queue = JSON.parse(readFileSync(built.queuePath, "utf8")) as { jobs: Array<{ jobId: string }> };
  const job = queue.jobs[0]!;
  const prepared = await runLibraryAnalysisAgentQueueCli({ command: "prepare-attempt", runRoot: fixture.runRoot,
    queue: built.queuePath, jobId: job.jobId, attempt: 1, expectedModel: EXPECTED_MODEL });
  const input = JSON.parse(readFileSync(prepared.inputPath, "utf8")) as {
    queueHash: string; jobId: string; attempt: number; inputHash: string;
    job: { inputEnvelopeHash: string }; expectedModel: typeof EXPECTED_MODEL; units: Array<{ id: string }>;
  };
  const response = {
    schema: "library-analysis-agent-segment-response/v1" as const,
    queueHash: input.queueHash, jobId: input.jobId, jobHash: input.job.inputEnvelopeHash,
    attempt: input.attempt, inputHash: input.inputHash, model: input.expectedModel,
    unitCoverage: input.units.map((unit) => ({ contentUnitId: unit.id, status: "no_material_claim" as const })),
    claims: [], responseHash: "0".repeat(64),
  };
  response.responseHash = libraryAnalysisAgentSegmentResponseHash(response);
  const responsePath = join(fixture.base, "conflict-response.json");
  writeFileSync(responsePath, JSON.stringify(response), { mode: 0o600 });
  const accepted = await runLibraryAnalysisAgentQueueCli({ command: "accept-attempt", runRoot: fixture.runRoot,
    queue: built.queuePath, attemptInput: prepared.inputPath, response: responsePath });
  const acceptedBytes = readFileSync(accepted.acceptedPath);
  const terminalPayload = JSON.parse(acceptedBytes.toString("utf8")) as Record<string, unknown>;
  terminalPayload.terminalState = "failed";
  terminalPayload.status = "failed";
  terminalPayload.terminalReason = "adversarial-terminal-sentinel";
  const terminalBytes = Buffer.from(`${canonicalCandidateJson(terminalPayload as CandidateJsonValue)}\n`, "utf8");
  const terminalPath = join(fixture.runRoot, "jobs", job.jobId, "attempt-001", "terminal.json");
  writeFileSync(terminalPath, terminalBytes, { mode: 0o400 });
  const acceptedHashBefore = createHash("sha256").update(acceptedBytes).digest("hex");
  const terminalHashBefore = createHash("sha256").update(terminalBytes).digest("hex");
  await assert.rejects(runLibraryAnalysisAgentQueueCli({ command: "status", runRoot: fixture.runRoot,
    queue: built.queuePath }), /agent_queue_attempt_terminal_conflict/);
  const acceptedAfter = readFileSync(accepted.acceptedPath);
  const terminalAfter = readFileSync(terminalPath);
  assert.deepEqual(acceptedAfter, acceptedBytes);
  assert.deepEqual(terminalAfter, terminalBytes);
  assert.equal(createHash("sha256").update(acceptedAfter).digest("hex"), acceptedHashBefore);
  assert.equal(createHash("sha256").update(terminalAfter).digest("hex"), terminalHashBefore);
  assert.notDeepEqual(acceptedAfter, terminalAfter);
});

test("finalize seals complete private readback arrays and separates pre/post inventory audit", async () => {
  const fixture = makeFixture();
  const built = await runLibraryAnalysisAgentQueueCli({
    command: "build", runRoot: fixture.runRoot, resolution: fixture.resolutionPath,
    manifest: fixture.manifestPath, costEnvelopeHash: fixture.costHash,
    mergedInventoryHash: fixture.inventoryHash, runtimeCommit: "5f3eb1c", repositoryRoot: fixture.repositoryRoot,
  });
  const queue = JSON.parse(readFileSync(built.queuePath, "utf8")) as {
    queueHash: string;
    queueId: string;
    jobs: Array<{ jobId: string; sourceKind: string; sourceKey: string; inputEnvelopeHash: string }>;
    sources: Array<{ sourceEnvelopeHash: string; sourceKind: string; sourceKey: string }>;
  };
  for (const job of queue.jobs) {
    const prepared = await runLibraryAnalysisAgentQueueCli({
      command: "prepare-attempt", runRoot: fixture.runRoot, queue: built.queuePath,
      jobId: job.jobId, attempt: 1, expectedModel: EXPECTED_MODEL,
    });
    const input = JSON.parse(readFileSync(prepared.inputPath, "utf8")) as {
      queueHash: string; jobId: string; attempt: number; inputHash: string;
      job: { inputEnvelopeHash: string }; expectedModel: typeof EXPECTED_MODEL;
      units: Array<{ id: string }>;
    };
    const response = {
      schema: "library-analysis-agent-segment-response/v1" as const,
      queueHash: input.queueHash, jobId: input.jobId, jobHash: input.job.inputEnvelopeHash,
      attempt: input.attempt, inputHash: input.inputHash, model: input.expectedModel,
      unitCoverage: input.units.map((unit) => ({ contentUnitId: unit.id, status: "no_material_claim" as const })),
      claims: [], responseHash: "0".repeat(64),
    };
    response.responseHash = libraryAnalysisAgentSegmentResponseHash(response);
    const responsePath = join(fixture.base, `${job.jobId.replaceAll(":", "-")}-response.json`);
    writeFileSync(responsePath, JSON.stringify(response), { mode: 0o600 });
    await runLibraryAnalysisAgentQueueCli({ command: "accept-attempt", runRoot: fixture.runRoot,
      queue: built.queuePath, attemptInput: prepared.inputPath, response: responsePath });
  }
  for (const source of queue.sources) {
    await runLibraryAnalysisAgentQueueCli({ command: "merge-source", runRoot: fixture.runRoot,
      queue: built.queuePath, sourceId: source.sourceEnvelopeHash });
    const prepared = await runLibraryAnalysisAgentQueueCli({ command: "validate-source", mode: "prepare",
      runRoot: fixture.runRoot, queue: built.queuePath, sourceId: source.sourceEnvelopeHash,
      validatorModel: { provider: "openai-codex", name: "gpt-5.6-sol", version: "receipt-b" } });
    const request = JSON.parse(readFileSync(prepared.requestPath!, "utf8")) as {
      requestHash: string; sourceResultHash: string; queueHash: string; sourceEnvelopeHash: string;
      validatorModel: { provider: "openai-codex"; name: string; version: string };
    };
    const response = {
      schema: "library-analysis-agent-validation-response/v1" as const,
      requestHash: request.requestHash, sourceResultHash: request.sourceResultHash,
      queueHash: request.queueHash, sourceEnvelopeHash: request.sourceEnvelopeHash,
      validatorModel: request.validatorModel, findings: [], riskFlags: [], responseHash: "0".repeat(64),
    };
    response.responseHash = candidateAnalysisSha256("library-analysis-agent-validation-response", (() => {
      const { responseHash: _hash, ...core } = response;
      return core;
    })() as unknown as CandidateJsonValue);
    const responsePath = join(fixture.base, `${source.sourceEnvelopeHash}-validation.json`);
    writeFileSync(responsePath, JSON.stringify(response), { mode: 0o600 });
    await runLibraryAnalysisAgentQueueCli({ command: "validate-source", mode: "accept",
      runRoot: fixture.runRoot, queue: built.queuePath, sourceId: source.sourceEnvelopeHash, response: responsePath });
  }
  const finalized = await runLibraryAnalysisAgentQueueCli({ command: "finalize", runRoot: fixture.runRoot,
    queue: built.queuePath, finalMergeHash: "f".repeat(64) });
  const privateReceipt = JSON.parse(readFileSync(finalized.receiptPath, "utf8")) as Record<string, unknown>;
  assert.equal(finalized.receipt.sourceCount, queue.sources.length);
  assert.equal((privateReceipt.sourceArtifacts as unknown[]).length, queue.sources.length);
  assert.equal((privateReceipt.validationArtifacts as unknown[]).length, queue.sources.length);
  assert.equal((privateReceipt.acceptedArtifacts as unknown[]).length, queue.jobs.length);
  assert.notEqual(finalized.postPublicationAuditInventoryHash, privateReceipt.privateInventoryHash);
  assert.equal(statSync(finalized.receiptPath).mode & 0o777, 0o400);
});

test("validate-source supports sealed prepare and later accept phases", () => {
  const prepare = parseLibraryAnalysisAgentQueueArgs([
    "validate-source",
    "--mode=prepare",
    "--run-root=/tmp/private-run",
    "--queue=/tmp/private-run/queue/queue-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.json",
    "--source-id=bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    "--validator-model-provider=openai-codex",
    "--validator-model-name=gpt-5.6-sol",
    "--validator-model-version=receipt-b",
  ]);
  assert.equal(prepare.command, "validate-source");
  assert.equal(prepare.mode, "prepare");
  assert.equal(prepare.validatorModel?.name, "gpt-5.6-sol");
  const accept = parseLibraryAnalysisAgentQueueArgs([
    "validate-source",
    "--mode=accept",
    "--run-root=/tmp/private-run",
    "--queue=/tmp/private-run/queue/queue-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.json",
    "--source-id=bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    "--response=/tmp/private-response.json",
  ]);
  assert.equal(accept.command, "validate-source");
  if (accept.command !== "validate-source") throw new Error("expected_validate_source");
  assert.equal(accept.mode, "accept");
  assert.equal(accept.response, "/tmp/private-response.json");
  assert.throws(() => parseLibraryAnalysisAgentQueueArgs([
    "validate-source",
    "--mode=accept",
    "--run-root=/tmp/private-run",
    "--queue=/tmp/private-run/queue/queue-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.json",
    "--source-id=bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  ]), /agent_queue_cli_arguments_invalid/);
});

async function prepareValidationAcceptance(entry: FixtureEntry) {
  const fixture = endToEndFixture(undefined, [entry]);
  const built = await runLibraryAnalysisAgentQueueCli({
    command: "build", runRoot: fixture.runRoot, resolution: fixture.resolutionPath,
    manifest: fixture.manifestPath, costEnvelopeHash: fixture.costHash,
    mergedInventoryHash: fixture.inventoryHash, runtimeCommit: "5f3eb1c",
    repositoryRoot: fixture.repositoryRoot,
  });
  const queue = verifyLibraryAnalysisAgentQueue(JSON.parse(readFileSync(built.queuePath, "utf8")));
  const source = queue.sources[0]!;
  const job = queue.jobs[0]!;
  const attempt = await runLibraryAnalysisAgentQueueCli({
    command: "prepare-attempt", runRoot: fixture.runRoot, queue: built.queuePath,
    jobId: job.jobId, attempt: 1, expectedModel: EXPECTED_MODEL,
  });
  await fixture.writeValidLunaResponse(attempt);
  await runLibraryAnalysisAgentQueueCli({
    command: "accept-attempt", runRoot: fixture.runRoot, queue: built.queuePath,
    attemptInput: attempt.inputPath, response: fixture.lastLunaResponsePath!,
  });
  await runLibraryAnalysisAgentQueueCli({
    command: "merge-source", runRoot: fixture.runRoot, queue: built.queuePath,
    sourceId: source.sourceEnvelopeHash,
  });
  await runLibraryAnalysisAgentQueueCli({
    command: "validate-source", mode: "prepare", runRoot: fixture.runRoot,
    queue: built.queuePath, sourceId: source.sourceEnvelopeHash,
    validatorModel: { provider: "openai-codex", name: "gpt-5.6-sol", version: "unknown" },
  });
  await fixture.writeValidMainValidationResponse(source.sourceEnvelopeHash);
  return { fixture, built, source, responsePath: fixture.lastValidationResponsePath! };
}

test("validate-source derives a hash-safe candidate id for file source keys", async () => {
  const prepared = await prepareValidationAcceptance({
    sourceKind: "library_file",
    sourceKey: `source:${"d".repeat(64)}`,
    populationSourceKey: "library_file:research/bibliotek/media/source.csv",
    text: "private source bytes reports 42 units",
  });
  const accepted = await runLibraryAnalysisAgentQueueCli({
    command: "validate-source", mode: "accept", runRoot: prepared.fixture.runRoot,
    queue: prepared.built.queuePath, sourceId: prepared.source.sourceEnvelopeHash,
    response: prepared.responsePath,
  });
  const result = JSON.parse(readFileSync(accepted.resultPath!, "utf8")) as { candidateId: string };
  assert.equal(result.candidateId, `source:${prepared.source.sourceEnvelopeHash}`);
});

test("validate-source resumes from an identical sealed response without overwriting it", async () => {
  const prepared = await prepareValidationAcceptance({
    sourceKind: "document", sourceKey: "document:resume", text: "private source bytes reports 42 units",
  });
  const responseBytes = readFileSync(prepared.responsePath);
  const sealedPath = join(
    prepared.fixture.runRoot, "validation", `source-${prepared.source.sourceEnvelopeHash}`, "response.json",
  );
  writeFileSync(sealedPath, responseBytes, { flag: "wx", mode: 0o400 });
  const accepted = await runLibraryAnalysisAgentQueueCli({
    command: "validate-source", mode: "accept", runRoot: prepared.fixture.runRoot,
    queue: prepared.built.queuePath, sourceId: prepared.source.sourceEnvelopeHash,
    response: prepared.responsePath,
  });
  assert.equal(statSync(accepted.resultPath!).mode & 0o777, 0o400);
  assert.deepEqual(readFileSync(sealedPath), responseBytes);
  assert.equal(statSync(sealedPath).mode & 0o777, 0o400);
});

test("validate-source rejects a different response when resuming a partial validation", async () => {
  const prepared = await prepareValidationAcceptance({
    sourceKind: "document", sourceKey: "document:resume-mismatch", text: "private source bytes reports 42 units",
  });
  const originalBytes = readFileSync(prepared.responsePath);
  const sealedPath = join(
    prepared.fixture.runRoot, "validation", `source-${prepared.source.sourceEnvelopeHash}`, "response.json",
  );
  writeFileSync(sealedPath, originalBytes, { flag: "wx", mode: 0o400 });
  const replacement = JSON.parse(originalBytes.toString("utf8")) as Record<string, unknown>;
  replacement.riskFlags = ["actor"];
  const { responseHash: _responseHash, ...replacementCore } = replacement;
  replacement.responseHash = candidateAnalysisSha256(
    "library-analysis-agent-validation-response", replacementCore as CandidateJsonValue,
  );
  const replacementPath = join(prepared.fixture.base, "validation-replacement.json");
  writeFileSync(replacementPath, JSON.stringify(replacement), { mode: 0o600 });
  await assert.rejects(
    runLibraryAnalysisAgentQueueCli({
      command: "validate-source", mode: "accept", runRoot: prepared.fixture.runRoot,
      queue: prepared.built.queuePath, sourceId: prepared.source.sourceEnvelopeHash,
      response: replacementPath,
    }),
    /validation_response_resume_mismatch/u,
  );
  assert.deepEqual(readFileSync(sealedPath), originalBytes);
  assert.equal(existsSync(join(
    prepared.fixture.runRoot, "validation", `source-${prepared.source.sourceEnvelopeHash}`, "result.json",
  )), false);
});

test("validate-source seals a private prepare-to-accept flow and rejects overwrite", async () => {
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
  const queue = JSON.parse(readFileSync(built.queuePath, "utf8")) as {
    queueHash: string;
    jobs: Array<{ jobId: string; sourceKind: string; sourceKey: string }>;
    sources: Array<{ sourceKind: string; sourceKey: string; sourceEnvelopeHash: string }>;
  };
  const source = queue.sources.find((candidate) => candidate.sourceKey === "document:a")!;
  const job = queue.jobs.find((candidate) => candidate.sourceKey === source.sourceKey)!;
  const prepared = await runLibraryAnalysisAgentQueueCli({
    command: "prepare-attempt",
    runRoot: fixture.runRoot,
    queue: built.queuePath,
    jobId: job.jobId,
    attempt: 1,
    expectedModel: EXPECTED_MODEL,
  });
  const input = JSON.parse(readFileSync(prepared.inputPath, "utf8")) as {
    queueHash: string;
    attempt: number;
    inputHash: string;
    job: { jobId: string; inputEnvelopeHash: string };
    expectedModel: typeof EXPECTED_MODEL;
    units: Array<{ id: string; locator: string; text: string }>;
  };
  const analysisResponse = {
    schema: "library-analysis-agent-segment-response/v1" as const,
    queueHash: input.queueHash,
    jobId: input.job.jobId,
    jobHash: input.job.inputEnvelopeHash,
    attempt: input.attempt,
    inputHash: input.inputHash,
    model: input.expectedModel,
    unitCoverage: input.units.map((unit) => ({ contentUnitId: unit.id, status: "claims_extracted" as const })),
    claims: input.units.map((unit, index) => ({
      localOrdinal: index,
      assertionType: "claim" as const,
      contentUnitId: unit.id,
      text: unit.text,
      evidence: unit.text,
      locator: unit.locator,
      confidence: 0.9,
    })),
    responseHash: "0".repeat(64),
  };
  analysisResponse.responseHash = libraryAnalysisAgentSegmentResponseHash(analysisResponse);
  const analysisResponsePath = join(fixture.base, "analysis-response.json");
  writeFileSync(analysisResponsePath, JSON.stringify(analysisResponse), { mode: 0o600 });
  await runLibraryAnalysisAgentQueueCli({
    command: "accept-attempt",
    runRoot: fixture.runRoot,
    queue: built.queuePath,
    attemptInput: prepared.inputPath,
    response: analysisResponsePath,
  });
  const sourceResult = await runLibraryAnalysisAgentQueueCli({
    command: "merge-source",
    runRoot: fixture.runRoot,
    queue: built.queuePath,
    sourceId: source.sourceEnvelopeHash,
  });

  const script = join(fixture.repositoryRoot, "scripts/knowledge/manage-library-analysis-agent-queue.ts");
  const run = (args: string[]) => spawnSync(process.execPath, ["--import=tsx", script, ...args], {
    cwd: fixture.repositoryRoot,
    encoding: "utf8",
  });
  const prepare = run([
    "validate-source",
    "--mode=prepare",
    `--run-root=${fixture.runRoot}`,
    `--queue=${built.queuePath}`,
    `--source-id=${source.sourceEnvelopeHash}`,
    "--validator-model-provider=openai-codex",
    "--validator-model-name=gpt-5.6-sol",
    "--validator-model-version=receipt-b",
  ]);
  assert.equal(prepare.status, 0, `${prepare.stderr}${prepare.stdout}`);
  assert.equal(prepare.stderr, "");
  const prepareSummary = JSON.parse(prepare.stdout) as Record<string, unknown>;
  assert.equal(prepareSummary.command, "validate-source");
  const requestPath = join(fixture.runRoot, "validation", `source-${source.sourceEnvelopeHash}`, "request.json");
  const request = JSON.parse(readFileSync(requestPath, "utf8")) as {
    requestHash: string;
    sourceResultHash: string;
    queueHash: string;
    sourceEnvelopeHash: string;
    validatorModel: typeof EXPECTED_MODEL & { name: string; version: string };
  };
  const validationResponse = {
    schema: "library-analysis-agent-validation-response/v1" as const,
    requestHash: request.requestHash,
    sourceResultHash: request.sourceResultHash,
    queueHash: request.queueHash,
    sourceEnvelopeHash: request.sourceEnvelopeHash,
    validatorModel: request.validatorModel,
    findings: [],
    riskFlags: [],
    responseHash: "0".repeat(64),
  };
  validationResponse.responseHash = candidateAnalysisSha256(
    "library-analysis-agent-validation-response",
    (() => {
      const { responseHash: _responseHash, ...core } = validationResponse;
      return core;
    })() as unknown as CandidateJsonValue,
  );
  const validationResponsePath = join(fixture.base, "validation-response.json");
  writeFileSync(validationResponsePath, JSON.stringify(validationResponse), { mode: 0o600 });
  const accept = run([
    "validate-source",
    "--mode=accept",
    `--run-root=${fixture.runRoot}`,
    `--queue=${built.queuePath}`,
    `--source-id=${source.sourceEnvelopeHash}`,
    `--response=${validationResponsePath}`,
  ]);
  assert.equal(accept.status, 0, `${accept.stderr}${accept.stdout}`);
  assert.equal(accept.stderr, "");
  const acceptSummary = JSON.parse(accept.stdout) as Record<string, unknown>;
  assert.equal(acceptSummary.command, "validate-source");
  assert.equal(acceptSummary.automatedOnly, true);
  assert.equal(acceptSummary.externalReady, false);
  const resultPath = join(fixture.runRoot, "validation", `source-${source.sourceEnvelopeHash}`, "result.json");
  assert.equal(statSync(resultPath).mode & 0o777, 0o400);
  const result = JSON.parse(readFileSync(resultPath, "utf8")) as Record<string, unknown>;
  assert.equal(result.validatorSeparation, "same_model");
  assert.equal(result.automatedOnly, true);
  assert.equal(result.externalReady, false);
  for (const value of [fixture.runRoot, "private source bytes"]) {
    assert.doesNotMatch(prepare.stdout, new RegExp(escapeRegExp(value)));
    assert.doesNotMatch(accept.stdout, new RegExp(escapeRegExp(value)));
  }
  await assert.rejects(
    runLibraryAnalysisAgentQueueCli({
      command: "validate-source",
      mode: "accept",
      runRoot: fixture.runRoot,
      queue: built.queuePath,
      sourceId: source.sourceEnvelopeHash,
      response: validationResponsePath,
    }),
    /private_artifact_exists/u,
  );
  assert.equal(sourceResult.externalReady, false);
});

test("private workflow builds dispatches validates resumes and finalizes without DB or network", async (t) => {
  const fixture = endToEndFixture(t);
  const queue = await runLibraryAnalysisAgentQueueCli({
    command: "build",
    runRoot: fixture.runRoot,
    resolution: fixture.resolutionPath,
    manifest: fixture.manifestPath,
    costEnvelopeHash: fixture.costHash,
    mergedInventoryHash: fixture.inventoryHash,
    runtimeCommit: "5f3eb1c",
    repositoryRoot: fixture.repositoryRoot,
  });
  const queueDocument = verifyLibraryAnalysisAgentQueue(JSON.parse(readFileSync(queue.queuePath, "utf8")));
  const invokePrepare = (jobId: string) => runLibraryAnalysisAgentQueueCli({
    command: "prepare-attempt", runRoot: fixture.runRoot, queue: queue.queuePath,
    jobId, attempt: 1, expectedModel: EXPECTED_MODEL,
  });
  const invokeAccept = (attemptInput: string) => runLibraryAnalysisAgentQueueCli({
    command: "accept-attempt", runRoot: fixture.runRoot, queue: queue.queuePath,
    attemptInput, response: fixture.lastLunaResponsePath!,
  });
  const [firstJob, ...remainingJobs] = queueDocument.jobs;
  assert.ok(firstJob);
  const firstAttempt = await invokePrepare(firstJob.jobId);
  await fixture.writeValidLunaResponse(firstAttempt);
  await invokeAccept(firstAttempt.inputPath);
  const resumed = await runLibraryAnalysisAgentQueueCli({
    command: "status", runRoot: fixture.runRoot, queue: queue.queuePath,
  });
  assert.equal(resumed.state, "pending");
  assert.equal(resumed.reusableJobs, 1);
  assert.equal(resumed.pendingJobs, 1);
  const state = deriveLibraryAnalysisAgentQueueState({
    queue: queueDocument,
    attempts: [readAcceptedAttemptReceipt(fixture, queueDocument, firstJob)],
  });
  assert.equal(state.nextAttempts.some((next) => next.jobId === firstJob.jobId), false);
  assert.deepEqual(state.nextAttempts, [{ jobId: remainingJobs[0]!.jobId, attempt: 1 }]);
  assert.equal(readdirSync(join(fixture.runRoot, "jobs", firstJob.jobId)).includes("attempt-002"), false);
  assert.equal(remainingJobs.length, 1);
  for (const job of remainingJobs) {
    const attempt = await invokePrepare(job.jobId);
    await fixture.writeValidLunaResponse(attempt);
    await invokeAccept(attempt.inputPath);
  }
  for (const source of queueDocument.sources) {
    const sourceId = source.sourceEnvelopeHash;
    await runLibraryAnalysisAgentQueueCli({
      command: "merge-source", runRoot: fixture.runRoot, queue: queue.queuePath, sourceId,
    });
    const preparedValidation = await runLibraryAnalysisAgentQueueCli({
      command: "validate-source", mode: "prepare", runRoot: fixture.runRoot,
      queue: queue.queuePath, sourceId,
      validatorModel: { provider: "openai-codex", name: "gpt-5.6-sol", version: "unknown" },
    });
    assert.equal(preparedValidation.mode, "prepare");
    await fixture.writeValidMainValidationResponse(sourceId);
    const acceptedValidation = await runLibraryAnalysisAgentQueueCli({
      command: "validate-source", mode: "accept", runRoot: fixture.runRoot,
      queue: queue.queuePath, sourceId, response: fixture.lastValidationResponsePath!,
    });
    const validationResult = JSON.parse(readFileSync(acceptedValidation.resultPath!, "utf8")) as Record<string, unknown>;
    assert.equal(validationResult.validatorSeparation, "same_model");
    assert.equal(validationResult.disposition, "partial");
    assert.equal(validationResult.machineUse, "candidate_only");
  }
  const terminal = await runLibraryAnalysisAgentQueueCli({
    command: "finalize", runRoot: fixture.runRoot, queue: queue.queuePath, finalMergeHash: "f".repeat(64),
  });
  assert.equal(terminal.automatedOnly, true);
  assert.equal(terminal.externalReady, false);
  assert.deepEqual(terminal.receipt.governance, {
    automatedOnly: true,
    externalReady: false,
    externalApiUsed: false,
    candidateDatabaseWritten: false,
    productionDataMutated: false,
    humanSourceReviewRequired: false,
  });
  for (const name of ["DATABASE_URL", "CANDIDATE_WORKER_DATABASE_URL", "OPENAI_API_KEY", "ANTHROPIC_API_KEY"]) {
    assert.equal(process.env[name], undefined, `${name} must not be configured by the fixture`);
  }
});

type EndToEndFixture = ReturnType<typeof makeFixture> & {
  lastLunaResponsePath?: string;
  lastValidationResponsePath?: string;
  writeValidLunaResponse: (attempt: { inputPath: string }) => Promise<void>;
  writeValidMainValidationResponse: (sourceId: string) => Promise<void>;
};

function endToEndFixture(_t: unknown, entries?: readonly FixtureEntry[]): EndToEndFixture {
  const fixture = makeFixture(entries) as EndToEndFixture;
  fixture.writeValidLunaResponse = async (attempt) => {
    const input = JSON.parse(readFileSync(attempt.inputPath, "utf8")) as {
      queueHash: string;
      attempt: number;
      inputHash: string;
      job: { jobId: string; inputEnvelopeHash: string; sourceKey: string };
      expectedModel: typeof EXPECTED_MODEL;
      units: Array<{ id: string; locator: string; text: string }>;
    };
    const zeroClaim = input.job.sourceKey === "web:b";
    const response = {
      schema: "library-analysis-agent-segment-response/v1" as const,
      queueHash: input.queueHash,
      jobId: input.job.jobId,
      jobHash: input.job.inputEnvelopeHash,
      attempt: input.attempt,
      inputHash: input.inputHash,
      model: input.expectedModel,
      unitCoverage: input.units.map((unit) => ({
        contentUnitId: unit.id,
        status: zeroClaim ? "no_material_claim" as const : "claims_extracted" as const,
      })),
      claims: zeroClaim ? [] : input.units.map((unit) => ({
        localOrdinal: 0,
        assertionType: "claim" as const,
        contentUnitId: unit.id,
        text: "The source reports 42 units",
        evidence: "42 units",
        locator: unit.locator,
        confidence: 0.9,
      })),
      responseHash: "0".repeat(64),
    };
    response.responseHash = libraryAnalysisAgentSegmentResponseHash(response);
    const responsePath = join(fixture.base, `luna-${input.job.jobId.replaceAll(":", "-")}.json`);
    writeFileSync(responsePath, JSON.stringify(response), { mode: 0o600 });
    fixture.lastLunaResponsePath = responsePath;
  };
  fixture.writeValidMainValidationResponse = async (sourceId) => {
    const requestPath = join(fixture.runRoot, "validation", `source-${sourceId}`, "request.json");
    const request = JSON.parse(readFileSync(requestPath, "utf8")) as {
      requestHash: string;
      sourceResultHash: string;
      queueHash: string;
      sourceEnvelopeHash: string;
      validatorModel: { provider: "openai-codex"; name: string; version: string };
    };
    const response = {
      schema: "library-analysis-agent-validation-response/v1" as const,
      requestHash: request.requestHash,
      sourceResultHash: request.sourceResultHash,
      queueHash: request.queueHash,
      sourceEnvelopeHash: request.sourceEnvelopeHash,
      validatorModel: request.validatorModel,
      findings: [],
      riskFlags: [],
      responseHash: "0".repeat(64),
    };
    response.responseHash = candidateAnalysisSha256(
      "library-analysis-agent-validation-response",
      (() => {
        const { responseHash: _responseHash, ...core } = response;
        return core;
      })() as unknown as CandidateJsonValue,
    );
    const responsePath = join(fixture.base, `validation-${sourceId}.json`);
    writeFileSync(responsePath, JSON.stringify(response), { mode: 0o600 });
    fixture.lastValidationResponsePath = responsePath;
  };
  return fixture;
}

function readAcceptedAttemptReceipt(
  fixture: ReturnType<typeof makeFixture>,
  queue: LibraryAnalysisAgentQueue,
  job: LibraryAnalysisAgentQueue["jobs"][number],
): Record<string, unknown> {
  const attemptRoot = `jobs/${job.jobId}/attempt-001`;
  const inputPath = join(fixture.runRoot, attemptRoot, "input.json");
  const responsePath = join(fixture.runRoot, attemptRoot, "response.json");
  const acceptedPath = join(fixture.runRoot, attemptRoot, "accepted.json");
  const artifact = (portablePath: string, path: string) => ({
    portablePath,
    sha256: sha256(readFileSync(path, "utf8")),
    sizeBytes: statSync(path).size,
    mode: 0o400,
  });
  const input = JSON.parse(readFileSync(inputPath, "utf8")) as { inputHash: string };
  const accepted = JSON.parse(readFileSync(acceptedPath, "utf8")) as { responseHash: string; model: typeof EXPECTED_MODEL };
  return {
    queueHash: queue.queueHash,
    jobId: job.jobId,
    jobHash: job.inputEnvelopeHash,
    attempt: 1,
    inputHash: input.inputHash,
    responseHash: sha256(readFileSync(responsePath, "utf8")),
    status: "accepted",
    inputArtifact: artifact(`${attemptRoot}/input.json`, inputPath),
    responseArtifact: artifact(`${attemptRoot}/response.json`, responsePath),
    outputHash: accepted.responseHash,
    outputArtifact: artifact(`${attemptRoot}/accepted.json`, acceptedPath),
    model: accepted.model,
  };
}

test("tracked implementation receipt is sanitized and states only allowed gates", () => {
  const receiptPath = join(process.cwd(), "research", "_status", "library-analysis-codex-native-orchestration-2026-08-21.md");
  const receipt = readFileSync(receiptPath, "utf8");
  for (const forbidden of [
    /\/Users\//u,
    /\b(?:sourceKey|sourceId|sourceEnvelopeHash|sourceVersionHash|sourceKind)\b/u,
    /\b(?:unitId|unitKey|jobId|jobHash)\b/u,
    /\b(?:locator|portablePath|privateArtifact|evidence|claims?)\b/u,
    /\b(?:Gabriel|Freeman)\b/u,
    /\b(?:the|a|this|actual)\s+(?:full queue|semantic pilot)\s+(?:was\s+)?(?:run|executed|completed)\b/iu,
  ]) assert.doesNotMatch(receipt, forbidden);
  assert.match(receipt, /Expected full coverage: `1,569 \/ 8,393`/u);
  assert.match(receipt, /Status: real semantic pilot terminal; full queue NO-GO and not executed\./u);
  assert.match(receipt, /Private pilot queue: terminal and sealed\./u);
  assert.match(receipt, /Full queue: deliberately not executed after pilot NO-GO\./u);
  assert.match(receipt, /Next gate: strengthen analysis eligibility/u);
  for (const flag of [
    "automatedOnly=true", "externalReady=false", "externalApiUsed=false",
    "candidateDatabaseWritten=false", "productionDataMutated=false", "humanSourceReviewRequired=false",
  ]) assert.match(receipt, new RegExp(`\\x60${flag}\\x60`, "u"));
  assert.match(receipt, /No external AI API, Ollama\/local model, candidate-database write, production mutation, push, PR, merge, or deployment occurred\./u);
});

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
