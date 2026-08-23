import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  buildLibraryAnalysisPopulation,
  libraryAnalysisPopulationHash,
} from "../../src/lib/knowledge/library-analysis-population";
import {
  parseLibraryAnalysisPopulationArgs,
  readLibraryAnalysisPopulationRows,
} from "../../scripts/knowledge/export-library-analysis-population";

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

test("database population keeps the attested composite source version separate from raw content", async () => {
  const summary = "Reviewed summary";
  const content = "Exact source bytes supplied to analysis";
  const sourceVersionHash = createHash("sha256")
    .update(`${summary}\n\n${content}`)
    .digest("hex");
  const contentHash = createHash("sha256").update(content).digest("hex");
  const transaction = {
    $executeRawUnsafe: async (sql: string) => {
      assert.equal(sql, "SET TRANSACTION READ ONLY");
      return 0;
    },
    libraryAnalysisRecord: {
      findMany: async () => [{
        sourceKind: "document",
        sourceKey: "document:doc-1",
        status: "not_started",
        contentHash: sourceVersionHash,
        documentId: "doc-1",
        document: { id: "doc-1", summary, content },
      }],
    },
  };
  const prisma = {
    $transaction: async (callback: (value: typeof transaction) => unknown) =>
      callback(transaction),
  } as unknown as Parameters<typeof readLibraryAnalysisPopulationRows>[0];

  const rows = await readLibraryAnalysisPopulationRows(prisma, []);

  assert.equal(rows[0]?.sourceVersionHash, sourceVersionHash);
  assert.equal(rows[0]?.contentHash, contentHash);
  assert.equal(buildLibraryAnalysisPopulation(rows).rows[0]?.eligibility, "eligible");
});

test("database population terminates pinned retained history as superseded", async () => {
  const transaction = {
    $executeRawUnsafe: async () => 0,
    libraryAnalysisRecord: {
      findMany: async () => [{
        sourceKind: "document",
        sourceKey: "document:cmp8xyoej00k6vvvm63gli4a8",
        status: "ai_draft",
        contentHash:
          "dbeb7a854c17cce27a6c0fe314069354efe2e48de59c8ad2d033c51290fd6a89",
        documentId: null,
        document: null,
      }],
    },
  };
  const prisma = {
    $transaction: async (callback: (value: typeof transaction) => unknown) =>
      callback(transaction),
  } as unknown as Parameters<typeof readLibraryAnalysisPopulationRows>[0];

  const rows = await readLibraryAnalysisPopulationRows(prisma, []);
  const snapshot = buildLibraryAnalysisPopulation(rows);

  assert.equal(snapshot.rows[0]?.eligibility, "superseded");
  assert.deepEqual(snapshot.rows[0]?.blockers, ["source_superseded"]);
});
