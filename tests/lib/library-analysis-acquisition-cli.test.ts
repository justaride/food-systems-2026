import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
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

function fixtureRoot(t: test.TestContext): string {
  const root = mkdtempSync(join(tmpdir(), "library-analysis-execution-test."));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

function blockedSource(sourceKey: string): LibraryAnalysisPopulationInputRow {
  return {
    sourceKind: "source_doc",
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
