import assert from "node:assert/strict";
import test from "node:test";

import {
  buildLibraryAnalysisPopulation,
  libraryAnalysisPopulationHash,
} from "../../src/lib/knowledge/library-analysis-population";
import { parseLibraryAnalysisPopulationArgs } from "../../scripts/knowledge/export-library-analysis-population";

const rowA = {
  sourceKind: "document",
  sourceKey: "document:a",
  sourceVersionHash: "a".repeat(64),
  inputKind: "database_record" as const,
  locator: "database:Document:a:content",
  contentHash: "a".repeat(64),
  identityConfidence: "exact" as const,
  readableInput: true,
  superseded: false,
};

const rowB = {
  ...rowA,
  sourceKey: "document:b",
  sourceVersionHash: "b".repeat(64),
  locator: "database:Document:b:content",
  contentHash: "b".repeat(64),
};

test("population hash is independent of query order", () => {
  const first = buildLibraryAnalysisPopulation([rowB, rowA]);
  const second = buildLibraryAnalysisPopulation([rowA, rowB]);

  assert.equal(first.populationHash, second.populationHash);
  assert.equal(first.snapshotId, second.snapshotId);
  assert.deepEqual(
    first.rows.map((row) => row.sourceKey),
    ["document:a", "document:b"],
  );
  assert.equal(libraryAnalysisPopulationHash(first), first.populationHash);
});

test("a locator without readable bytes is blocked input", () => {
  const snapshot = buildLibraryAnalysisPopulation([
    { ...rowA, readableInput: false },
  ]);

  assert.equal(snapshot.rows[0]?.eligibility, "blocked_input");
  assert.deepEqual(snapshot.rows[0]?.blockers, ["readable_input_missing"]);
});

test("population rejects duplicate identities and never serializes source text", () => {
  assert.throws(
    () => buildLibraryAnalysisPopulation([rowA, rowA]),
    /duplicate_population_identity/,
  );
  const snapshot = buildLibraryAnalysisPopulation([
    { ...rowA, sourceText: "private fulltext" } as typeof rowA & {
      sourceText: string;
    },
  ]);
  assert.doesNotMatch(JSON.stringify(snapshot), /private fulltext/);
});

test("superseded input has one explicit terminal population eligibility", () => {
  const snapshot = buildLibraryAnalysisPopulation([
    { ...rowA, superseded: true },
  ]);

  assert.equal(snapshot.rows[0]?.eligibility, "superseded");
  assert.deepEqual(snapshot.rows[0]?.blockers, ["source_superseded"]);
});

test("population CLI requires one output and canonicalizes unique source keys", () => {
  assert.deepEqual(
    parseLibraryAnalysisPopulationArgs([
      "--source-key",
      "document:b",
      "--output=/tmp/population.json",
      "--source-key=document:a",
    ]),
    {
      output: "/tmp/population.json",
      sourceKeys: ["document:a", "document:b"],
    },
  );
  assert.throws(() => parseLibraryAnalysisPopulationArgs([]));
  assert.throws(() =>
    parseLibraryAnalysisPopulationArgs([
      "--output=/tmp/population.json",
      "--source-key=document:a",
      "--source-key=document:a",
    ]),
  );
});
