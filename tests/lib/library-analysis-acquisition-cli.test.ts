import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  buildLibraryAnalysisAcquisitionLocators,
  parseLibraryAnalysisAcquisitionPlanArgs,
} from "../../scripts/knowledge/plan-library-analysis-acquisition";
import {
  executeLibraryAnalysisAcquisitionPlan,
  parseLibraryAnalysisAcquisitionExecutionArgs,
  readControlledFetchBody,
} from "../../scripts/knowledge/execute-library-analysis-acquisition";
import {
  buildLibraryAnalysisAcquisitionPlan,
  type LibraryAnalysisAcquisitionPlan,
} from "../../src/lib/knowledge/library-analysis-acquisition-contract";
import {
  buildLibraryAnalysisPopulation,
  type LibraryAnalysisPopulationInputRow,
} from "../../src/lib/knowledge/library-analysis-population";
import { openPrivateLibraryAnalysisRunRoot } from "../../src/lib/knowledge/private-library-analysis-artifact-store";
import type { ControlledFetchResponse } from "../../scripts/knowledge/generate-source-acquisition-receipt";
import {
  parseLibraryAnalysisPrivateEmitArgs,
  runLibraryAnalysisPrivateEmitCli,
} from "../../scripts/knowledge/emit-library-analysis-content-units";
import {
  buildLibraryAnalysisPilotScope,
} from "../../scripts/knowledge/select-library-analysis-pilot";

function fixtureRoot(t: test.TestContext): string {
  const root = mkdtempSync(join(tmpdir(), "library-analysis-execution-test."));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

function blockedSource(
  sourceKey: string,
  sourceKind = "source_doc",
): LibraryAnalysisPopulationInputRow {
  return {
    sourceKind,
    sourceKey,
    sourceVersionHash: null,
    inputKind: "none",
    locator: null,
    contentHash: null,
    identityConfidence: "unresolved",
    readableInput: false,
    superseded: false,
  };
}

function controlledPlan(sourceKey = "source_doc:src-1"): LibraryAnalysisAcquisitionPlan {
  const population = buildLibraryAnalysisPopulation([blockedSource(sourceKey)]);
  return buildLibraryAnalysisAcquisitionPlan(population, [{
    sourceKind: "source_doc",
    sourceKey,
    route: "controlled_https",
    locator: "https://example.test/source",
    alternateLocators: [],
  }]);
}

const unusedExtractionAdapters = {
  runPdfText: () => {
    throw new Error("unexpected_pdf_adapter_call");
  },
};

function response(
  status: number,
  body: string,
  headers: Record<string, string> = {},
): ControlledFetchResponse {
  return {
    status,
    headers,
    body: Buffer.from(body, "utf8"),
    observedAt: "2026-08-21T10:00:00.000Z",
  };
}

test("acquisition planning CLI requires one snapshot and one output", () => {
  assert.deepEqual(parseLibraryAnalysisAcquisitionPlanArgs([
    "--snapshot=/private/population.json",
    "--output=/private/plan.json",
  ]), {
    snapshot: "/private/population.json",
    output: "/private/plan.json",
  });
  assert.throws(
    () => parseLibraryAnalysisAcquisitionPlanArgs([]),
    /acquisition_plan_arguments_invalid/,
  );
  assert.throws(
    () => parseLibraryAnalysisAcquisitionPlanArgs([
      "--snapshot=/one",
      "--snapshot=/two",
      "--output=/plan",
    ]),
    /acquisition_plan_snapshot_duplicate/,
  );
  assert.throws(
    () => parseLibraryAnalysisAcquisitionPlanArgs([
      "--snapshot=/one",
      "--output=../tracked.json",
    ]),
    /acquisition_plan_path_invalid/,
  );
});

test("acquisition execution refuses implicit or conflicting side-effect modes", () => {
  const common = ["--plan=/private/plan.json", "--run-root=/private/run"];
  assert.deepEqual(parseLibraryAnalysisAcquisitionExecutionArgs([
    ...common,
    "--check-only",
  ]), {
    plan: "/private/plan.json",
    runRoot: "/private/run",
    mode: "check_only",
  });
  assert.deepEqual(parseLibraryAnalysisAcquisitionExecutionArgs([
    ...common,
    "--execute-network",
  ]), {
    plan: "/private/plan.json",
    runRoot: "/private/run",
    mode: "execute_network",
  });
  assert.throws(
    () => parseLibraryAnalysisAcquisitionExecutionArgs(common),
    /explicit_execution_mode_required/,
  );
  assert.throws(
    () => parseLibraryAnalysisAcquisitionExecutionArgs([
      ...common,
      "--check-only",
      "--execute-network",
    ]),
    /execution_modes_mutually_exclusive/,
  );
});

test("read-only planning facts route every blocked source without guessing", () => {
  const blocked = (sourceKind: string, sourceKey: string) => ({
    sourceKind,
    sourceKey,
    sourceVersionHash: null,
    inputKind: "none" as const,
    locator: null,
    contentHash: null,
    identityConfidence: "unresolved" as const,
    readableInput: false,
    superseded: false,
  });
  const population = buildLibraryAnalysisPopulation([
    blocked("source_doc", "source_doc:src-1"),
    blocked("report", "report:external"),
    blocked("report", "report:internal"),
    blocked("thesis", "thesis:t-1"),
    blocked("library_file", "library_file:research/a.csv"),
    blocked("library_file", "library_file:research/deck.pptx"),
    blocked("source_doc", "source_doc:missing"),
  ]);
  const locators = buildLibraryAnalysisAcquisitionLocators(population, {
    sourceDocs: [{
      id: "src-1",
      url: "http://insecure.test/report",
      doi: "10.1000/source",
      archivedUrl: null,
    }],
    reports: [
      { id: "external", sourceUrl: "https://example.test/report.pdf", doi: null, supportingSources: null },
      { id: "internal", sourceUrl: null, doi: null, supportingSources: [{ sourceId: "src-1" }] },
    ],
    theses: [{ id: "t-1", url: "https://example.test/thesis", doi: "10.1000/thesis" }],
    repositoryFiles: [
      { path: "research/a.csv", kind: "csv" },
      { path: "research/deck.pptx", kind: "pptx" },
    ],
  });

  assert.deepEqual(locators.map(({ sourceKey, route, locator }) => ({ sourceKey, route, locator })), [
    { sourceKey: "library_file:research/a.csv", route: "repository_csv", locator: "repository:research/a.csv" },
    { sourceKey: "library_file:research/deck.pptx", route: "repository_pptx", locator: "repository:research/deck.pptx" },
    { sourceKey: "report:external", route: "controlled_https", locator: "https://example.test/report.pdf" },
    { sourceKey: "report:internal", route: "database_derived_record", locator: "database:Report:internal" },
    { sourceKey: "source_doc:missing", route: "unresolvable", locator: null },
    { sourceKey: "source_doc:src-1", route: "controlled_https", locator: "https://doi.org/10.1000/source" },
    { sourceKey: "thesis:t-1", route: "controlled_https", locator: "https://example.test/thesis" },
  ]);
});

test("acquisition check-only validates a plan without network or filesystem writes", async (t) => {
  const runRoot = join(fixtureRoot(t), "must-not-exist");
  let fetchCalls = 0;
  const result = await executeLibraryAnalysisAcquisitionPlan({
    plan: controlledPlan(),
    runRoot,
    mode: "check_only",
    adapters: {
      fetch: async () => {
        fetchCalls += 1;
        return response(200, "not used");
      },
      extraction: unusedExtractionAdapters,
      wait: async () => undefined,
      now: () => "2026-08-21T10:00:00.000Z",
    },
  });

  assert.equal(result.mode, "check_only");
  assert.equal(result.planHash, controlledPlan().planHash);
  assert.deepEqual(result.routeCounts, { controlled_https: 1 });
  assert.deepEqual(result.rows, []);
  assert.equal(fetchCalls, 0);
  assert.equal(existsSync(runRoot), false);
});

test("controlled acquisition follows one same-origin PDF and seals sanitized artifacts", async (t) => {
  const runRoot = openPrivateLibraryAnalysisRunRoot(fixtureRoot(t), "run-success");
  const requested: string[] = [];
  const result = await executeLibraryAnalysisAcquisitionPlan({
    plan: controlledPlan(),
    runRoot,
    mode: "execute_network",
    adapters: {
      fetch: async (request) => {
        requested.push(request.url);
        if (request.url.endsWith("/source")) {
          return response(
            200,
            '<html><body><a href="/files/source.pdf">Full text</a></body></html>',
            { "content-type": "text/html" },
          );
        }
        return response(200, "%PDF-1.7 fixture", { "content-type": "application/pdf" });
      },
      extraction: {
        runPdfText: () => ({
          exitCode: 0,
          stdout: "Verified page text\f",
          stderr: "",
          toolVersion: "pdftotext 25.06.0",
        }),
      },
      wait: async () => undefined,
      now: () => "2026-08-21T10:00:00.000Z",
    },
  });

  assert.deepEqual(requested, [
    "https://example.test/source",
    "https://example.test/files/source.pdf",
  ]);
  assert.equal(result.rows.length, 1);
  assert.equal(result.rows[0]?.state, "ready");
  assert.equal(result.rows[0]?.reasonCode, null);
  assert.equal(result.rows[0]?.unitCount, 1);
  assert.match(result.rows[0]?.rawSha256 ?? "", /^[a-f0-9]{64}$/);
  assert.match(result.rows[0]?.normalizedTextSha256 ?? "", /^[a-f0-9]{64}$/);
  assert.doesNotMatch(JSON.stringify(result), /example\.test|Verified page text|library-analysis-execution-test/);
  assert.equal(existsSync(join(runRoot, `raw/${result.rows[0]!.rawSha256}.bin`)), true);
  assert.equal(existsSync(join(runRoot, `text/${result.rows[0]!.normalizedTextSha256}.txt`)), true);
});

test("controlled acquisition retries 429 and 5xx with bounded delays", async (t) => {
  const runRoot = openPrivateLibraryAnalysisRunRoot(fixtureRoot(t), "run-retry");
  const delays: number[] = [];
  let attempt = 0;
  const result = await executeLibraryAnalysisAcquisitionPlan({
    plan: controlledPlan("source_doc:retry"),
    runRoot,
    mode: "execute_network",
    adapters: {
      fetch: async () => {
        attempt += 1;
        if (attempt === 1) return response(500, "temporary");
        if (attempt === 2) return response(429, "slow down", { "retry-after": "30" });
        return response(200, "usable text", { "content-type": "text/plain" });
      },
      extraction: unusedExtractionAdapters,
      wait: async (milliseconds) => {
        delays.push(milliseconds);
      },
      now: () => "2026-08-21T10:00:00.000Z",
    },
  });

  assert.equal(attempt, 3);
  assert.deepEqual(delays, [1_000, 30_000]);
  assert.equal(result.rows[0]?.state, "ready");
});

test("controlled acquisition does not retry deterministic HTTP blockers", async (t) => {
  const runRoot = openPrivateLibraryAnalysisRunRoot(fixtureRoot(t), "run-not-found");
  let attempt = 0;
  const result = await executeLibraryAnalysisAcquisitionPlan({
    plan: controlledPlan("source_doc:not-found"),
    runRoot,
    mode: "execute_network",
    adapters: {
      fetch: async () => {
        attempt += 1;
        return response(404, "private response body");
      },
      extraction: unusedExtractionAdapters,
      wait: async () => undefined,
      now: () => "2026-08-21T10:00:00.000Z",
    },
  });

  assert.equal(attempt, 1);
  assert.deepEqual(result.rows, [{
    sourceKey: "source_doc:not-found",
    state: "blocked",
    reasonCode: "http_not_found",
    rawSha256: null,
    normalizedTextSha256: null,
    unitCount: 0,
  }]);
  assert.doesNotMatch(JSON.stringify(result), /private response body|example\.test/);
});

test("controlled acquisition uses an alternate locator only after not-found", async (t) => {
  const population = buildLibraryAnalysisPopulation([blockedSource("source_doc:fallback")]);
  const plan = buildLibraryAnalysisAcquisitionPlan(population, [{
    sourceKind: "source_doc",
    sourceKey: "source_doc:fallback",
    route: "controlled_https",
    locator: "https://example.test/missing",
    alternateLocators: ["https://doi.org/10.1000/fallback"],
  }]);
  const requested: string[] = [];
  const result = await executeLibraryAnalysisAcquisitionPlan({
    plan,
    runRoot: openPrivateLibraryAnalysisRunRoot(fixtureRoot(t), "run-fallback"),
    mode: "execute_network",
    adapters: {
      fetch: async (request) => {
        requested.push(request.url);
        return request.url.includes("missing")
          ? response(404, "not found")
          : response(200, "fallback source text", { "content-type": "text/plain" });
      },
      extraction: unusedExtractionAdapters,
      wait: async () => undefined,
      now: () => "2026-08-21T10:00:00.000Z",
    },
  });

  assert.deepEqual(requested, [
    "https://example.test/missing",
    "https://doi.org/10.1000/fallback",
  ]);
  assert.equal(result.rows[0]?.state, "ready");
});

test("controlled acquisition blocks oversized transport responses without retry", async (t) => {
  const runRoot = openPrivateLibraryAnalysisRunRoot(fixtureRoot(t), "run-too-large");
  let attempt = 0;
  const result = await executeLibraryAnalysisAcquisitionPlan({
    plan: controlledPlan("source_doc:too-large"),
    runRoot,
    mode: "execute_network",
    adapters: {
      fetch: async () => {
        attempt += 1;
        throw new Error("controlled_fetch_response_too_large with private locator");
      },
      extraction: unusedExtractionAdapters,
      wait: async () => undefined,
      now: () => "2026-08-21T10:00:00.000Z",
    },
  });

  assert.equal(attempt, 1);
  assert.equal(result.rows[0]?.state, "blocked");
  assert.equal(result.rows[0]?.reasonCode, "response_too_large");
  assert.doesNotMatch(JSON.stringify(result), /private locator/);
});

test("controlled acquisition safely reuses identical sealed content in one run", async (t) => {
  const population = buildLibraryAnalysisPopulation([
    blockedSource("source_doc:duplicate-a"),
    blockedSource("source_doc:duplicate-b"),
  ]);
  const plan = buildLibraryAnalysisAcquisitionPlan(population, [
    {
      sourceKind: "source_doc",
      sourceKey: "source_doc:duplicate-a",
      route: "controlled_https",
      locator: "https://example.test/a.txt",
      alternateLocators: [],
    },
    {
      sourceKind: "source_doc",
      sourceKey: "source_doc:duplicate-b",
      route: "controlled_https",
      locator: "https://example.test/b.txt",
      alternateLocators: [],
    },
  ]);
  const result = await executeLibraryAnalysisAcquisitionPlan({
    plan,
    runRoot: openPrivateLibraryAnalysisRunRoot(fixtureRoot(t), "run-duplicates"),
    mode: "execute_network",
    adapters: {
      fetch: async () => response(200, "same source text", { "content-type": "text/plain" }),
      extraction: unusedExtractionAdapters,
      wait: async () => undefined,
      now: () => "2026-08-21T10:00:00.000Z",
    },
  });

  assert.deepEqual(result.rows.map((row) => row.state), ["ready", "ready"]);
  assert.equal(result.rows[0]?.rawSha256, result.rows[1]?.rawSha256);
  assert.equal(result.rows[0]?.normalizedTextSha256, result.rows[1]?.normalizedTextSha256);
});

test("controlled fetch body reader enforces its limit while streaming", async () => {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(Buffer.from("abc"));
      controller.enqueue(Buffer.from("def"));
      controller.close();
    },
  });

  await assert.rejects(
    () => readControlledFetchBody(body, 5),
    /controlled_fetch_response_too_large/,
  );
});

test("private emit CLI requires four absolute paths and keeps output inside the run root", () => {
  assert.deepEqual(parseLibraryAnalysisPrivateEmitArgs([
    "--snapshot=/private/population.json",
    "--plan=/private/plan.json",
    "--run-root=/private/run",
    "--output=/private/run/manifests/emit.json",
  ]), {
    snapshot: "/private/population.json",
    plan: "/private/plan.json",
    runRoot: "/private/run",
    output: "/private/run/manifests/emit.json",
  });
  assert.throws(
    () => parseLibraryAnalysisPrivateEmitArgs([
      "--snapshot=/private/population.json",
      "--plan=/private/plan.json",
      "--run-root=/private/run",
      "--output=/tracked/emit.json",
    ]),
    /library_analysis_private_emit_output_outside_run_root/,
  );
});

test("private emit CLI reads sealed extraction evidence and seals complete manifests", async (t) => {
  const base = fixtureRoot(t);
  const runRoot = openPrivateLibraryAnalysisRunRoot(base, "run-private-emit");
  const population = buildLibraryAnalysisPopulation([blockedSource("source_doc:emit")]);
  const plan = buildLibraryAnalysisAcquisitionPlan(population, [{
    sourceKind: "source_doc",
    sourceKey: "source_doc:emit",
    route: "controlled_https",
    locator: "https://example.test/emit.txt",
    alternateLocators: [],
  }]);
  await executeLibraryAnalysisAcquisitionPlan({
    plan,
    runRoot,
    mode: "execute_network",
    adapters: {
      fetch: async () => response(200, "emitted private text", { "content-type": "text/plain" }),
      extraction: unusedExtractionAdapters,
      wait: async () => undefined,
      now: () => "2026-08-21T10:00:00.000Z",
    },
  });
  const snapshotPath = join(base, "population.json");
  const planPath = join(base, "plan.json");
  writeFileSync(snapshotPath, JSON.stringify(population), { mode: 0o600 });
  writeFileSync(planPath, JSON.stringify(plan), { mode: 0o600 });
  const outputPath = join(runRoot, "manifests", "private-emit.json");

  const output = await runLibraryAnalysisPrivateEmitCli({
    snapshot: snapshotPath,
    plan: planPath,
    runRoot,
    output: outputPath,
  });

  assert.equal(output.resolution.rows[0]?.disposition, "content_units_ready");
  assert.equal(output.contentUnitManifest.units.length, 1);
  assert.equal(output.costEnvelope.externalReady, false);
  assert.equal(statSync(outputPath).mode & 0o777, 0o400);
  assert.equal(
    statSync(join(
      runRoot,
      `manifests/resolution-${output.resolution.resolutionHash}.json`,
    )).mode & 0o777,
    0o400,
  );
  assert.doesNotMatch(JSON.stringify(output), /emitted private text/);
});

test("private emit keeps ambiguous HTML extraction as evidence but resolves the source blocked", async (t) => {
  const base = fixtureRoot(t);
  const runRoot = openPrivateLibraryAnalysisRunRoot(base, "run-private-emit-ambiguous");
  const population = buildLibraryAnalysisPopulation([blockedSource("source_doc:ambiguous")]);
  const plan = buildLibraryAnalysisAcquisitionPlan(population, [{
    sourceKind: "source_doc",
    sourceKey: "source_doc:ambiguous",
    route: "controlled_https",
    locator: "https://example.test/landing",
    alternateLocators: [],
  }]);
  await executeLibraryAnalysisAcquisitionPlan({
    plan,
    runRoot,
    mode: "execute_network",
    adapters: {
      fetch: async () => response(200,
        '<html><body><a href="/one.pdf">One</a><a href="/two.pdf">Two</a></body></html>',
        { "content-type": "text/html" }),
      extraction: unusedExtractionAdapters,
      wait: async () => undefined,
      now: () => "2026-08-21T10:00:00.000Z",
    },
  });
  const snapshotPath = join(base, "population-ambiguous.json");
  const planPath = join(base, "plan-ambiguous.json");
  writeFileSync(snapshotPath, JSON.stringify(population), { mode: 0o600 });
  writeFileSync(planPath, JSON.stringify(plan), { mode: 0o600 });

  const output = await runLibraryAnalysisPrivateEmitCli({
    snapshot: snapshotPath,
    plan: planPath,
    runRoot,
    output: join(runRoot, "manifests", "private-emit.json"),
  });

  assert.equal(output.resolution.rows[0]?.disposition, "blocked_input");
  assert.equal(output.resolution.rows[0]?.reasonCode, "identity_ambiguous");
  assert.equal(output.contentUnitManifest.units.length, 0);
});

test("execution stages database repository and derived routes without network", async (t) => {
  const databaseSummary = "Database summary";
  const databaseContent = "Database content";
  const databaseContentHash = createHash("sha256")
    .update(Buffer.from(databaseContent, "utf8"))
    .digest("hex");
  const databaseVersionHash = createHash("sha256")
    .update(Buffer.from(`${databaseSummary}\n\n${databaseContent}`, "utf8"))
    .digest("hex");
  const population = buildLibraryAnalysisPopulation([
    {
      sourceKind: "document",
      sourceKey: "document:doc-local",
      sourceVersionHash: databaseVersionHash,
      inputKind: "database_record",
      locator: "database:Document:doc-local:content",
      contentHash: databaseContentHash,
      identityConfidence: "exact",
      readableInput: true,
      superseded: false,
    },
    blockedSource("library_file:research/example.csv", "library_file"),
    blockedSource("report:derived-local", "report"),
  ]);
  const plan = buildLibraryAnalysisAcquisitionPlan(population, [
    {
      sourceKind: "library_file",
      sourceKey: "library_file:research/example.csv",
      route: "repository_csv",
      locator: "repository:research/example.csv",
      alternateLocators: [],
    },
    {
      sourceKind: "report",
      sourceKey: "report:derived-local",
      route: "database_derived_record",
      locator: "database:Report:derived-local",
      alternateLocators: [],
    },
  ]);
  let fetchCalls = 0;
  const result = await executeLibraryAnalysisAcquisitionPlan({
    plan,
    runRoot: openPrivateLibraryAnalysisRunRoot(fixtureRoot(t), "run-local-routes"),
    mode: "execute_network",
    adapters: {
      fetch: async () => {
        fetchCalls += 1;
        return response(200, "unexpected");
      },
      extraction: unusedExtractionAdapters,
      readDatabaseDocument: async () => ({
        summary: databaseSummary,
        content: databaseContent,
      }),
      readRepositoryFile: async () => Buffer.from("id,title\n1,Example\n", "utf8"),
      readDerivedReport: async () => ({
        id: "derived-local",
        title: "Derived local",
        fullTitle: null,
        author: null,
        institution: "Food Systems",
        date: "2026-08-21",
        year: 2026,
        reportCategory: "internal_synthesis",
        country: "NO",
        keyFindings: [],
        recommendations: [],
        relevance: "Internal source graph",
        tags: ["internal"],
        provenanceType: "internal_synthesis",
        supportingSources: [{ sourceId: "source-1" }],
      }),
      wait: async () => undefined,
      now: () => "2026-08-21T10:00:00.000Z",
    },
  });

  assert.equal(fetchCalls, 0);
  assert.deepEqual(result.rows.map((row) => row.state), ["ready", "ready", "ready"]);
  assert.equal(result.rows.find((row) => row.sourceKey === "document:doc-local")?.rawSha256, databaseContentHash);
});

test("database staging quarantines source version drift", async (t) => {
  const population = buildLibraryAnalysisPopulation([{
    sourceKind: "document",
    sourceKey: "document:drifted",
    sourceVersionHash: "1".repeat(64),
    inputKind: "database_record",
    locator: "database:Document:drifted:content",
    contentHash: "2".repeat(64),
    identityConfidence: "exact",
    readableInput: true,
    superseded: false,
  }]);
  const result = await executeLibraryAnalysisAcquisitionPlan({
    plan: buildLibraryAnalysisAcquisitionPlan(population, []),
    runRoot: openPrivateLibraryAnalysisRunRoot(fixtureRoot(t), "run-drifted-database"),
    mode: "execute_network",
    adapters: {
      fetch: async () => response(200, "unexpected"),
      extraction: unusedExtractionAdapters,
      readDatabaseDocument: async () => ({ summary: null, content: "changed" }),
      wait: async () => undefined,
      now: () => "2026-08-21T10:00:00.000Z",
    },
  });

  assert.equal(result.rows[0]?.state, "quarantined");
  assert.equal(result.rows[0]?.reasonCode, "source_version_drift");
});

test("pilot selector builds a complete deterministic eight-source scope", () => {
  const eligibleDocument = (
    id: string,
    sourceVersionHash: string,
    rawHash: string,
  ): LibraryAnalysisPopulationInputRow => ({
    sourceKind: "document",
    sourceKey: `document:${id}`,
    sourceVersionHash,
    inputKind: "database_record",
    locator: `database:Document:${id}:content`,
    contentHash: rawHash,
    identityConfidence: "exact",
    readableInput: true,
    superseded: false,
  });
  const population = buildLibraryAnalysisPopulation([
    eligibleDocument("largest", "1".repeat(64), "2".repeat(64)),
    eligibleDocument("summary", "3".repeat(64), "4".repeat(64)),
    eligibleDocument("other", "5".repeat(64), "6".repeat(64)),
    blockedSource("source_doc:html"),
    blockedSource("source_doc:pdf"),
    blockedSource("library_file:research/example.csv", "library_file"),
    blockedSource("library_file:research/example.pptx", "library_file"),
    blockedSource("report:derived", "report"),
    blockedSource("source_doc:missing"),
  ]);
  const plan = buildLibraryAnalysisAcquisitionPlan(population, [
    {
      sourceKind: "source_doc",
      sourceKey: "source_doc:html",
      route: "controlled_https",
      locator: "https://example.test/landing",
      alternateLocators: [],
    },
    {
      sourceKind: "source_doc",
      sourceKey: "source_doc:pdf",
      route: "controlled_https",
      locator: "https://example.test/report.pdf",
      alternateLocators: [],
    },
    {
      sourceKind: "library_file",
      sourceKey: "library_file:research/example.csv",
      route: "repository_csv",
      locator: "repository:research/example.csv",
      alternateLocators: [],
    },
    {
      sourceKind: "library_file",
      sourceKey: "library_file:research/example.pptx",
      route: "repository_pptx",
      locator: "repository:research/example.pptx",
      alternateLocators: [],
    },
    {
      sourceKind: "report",
      sourceKey: "report:derived",
      route: "database_derived_record",
      locator: "database:Report:derived",
      alternateLocators: [],
    },
    {
      sourceKind: "source_doc",
      sourceKey: "source_doc:missing",
      route: "unresolvable",
      locator: null,
      alternateLocators: [],
    },
  ]);
  const scope = buildLibraryAnalysisPilotScope({
    snapshot: population,
    plan,
    databaseDocuments: [
      { sourceKey: "document:largest", hasSummary: false, contentCodePoints: 50_000 },
      { sourceKey: "document:summary", hasSummary: true, contentCodePoints: 10_000 },
      { sourceKey: "document:other", hasSummary: false, contentCodePoints: 2_000 },
    ],
  });

  assert.equal(scope.snapshot.rows.length, 8);
  assert.equal(scope.plan.rows.length, 8);
  assert.equal(scope.plan.populationHash, scope.snapshot.populationHash);
  assert.deepEqual(
    Object.fromEntries(Object.entries(scope.routeCounts).sort()),
    {
      controlled_https: 2,
      database_derived_record: 1,
      database_document: 2,
      repository_csv: 1,
      repository_pptx: 1,
      unresolvable: 1,
    },
  );
  assert.ok(scope.snapshot.rows.some((row) => row.sourceKey === "document:largest"));
  assert.ok(scope.snapshot.rows.some((row) => row.sourceKey === "document:summary"));
});
