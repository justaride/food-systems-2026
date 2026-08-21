import assert from "node:assert/strict";
import test from "node:test";

import {
  buildLibraryAnalysisAcquisitionLocators,
  parseLibraryAnalysisAcquisitionPlanArgs,
} from "../../scripts/knowledge/plan-library-analysis-acquisition";
import {
  parseLibraryAnalysisAcquisitionExecutionArgs,
} from "../../scripts/knowledge/execute-library-analysis-acquisition";
import { buildLibraryAnalysisPopulation } from "../../src/lib/knowledge/library-analysis-population";

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
