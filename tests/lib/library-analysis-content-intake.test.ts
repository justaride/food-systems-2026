import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  buildLibraryAnalysisContentUnits,
  ingestLibraryAnalysisContentUnits,
  parseLibraryAnalysisContentIntakeArgs,
} from "../../scripts/knowledge/ingest-library-analysis-content-units";
import { buildLibraryAnalysisPopulation } from "../../src/lib/knowledge/library-analysis-population";

const sourceText = "Source bytes that must never enter the receipt.";
const contentHash = createHash("sha256")
  .update(Buffer.from(sourceText, "utf8"))
  .digest("hex");

const population = buildLibraryAnalysisPopulation([
  {
    sourceKind: "document",
    sourceKey: "document:doc-1",
    sourceVersionHash: contentHash,
    inputKind: "database_record",
    locator: "database:Document:doc-1:content",
    contentHash,
    identityConfidence: "exact",
    readableInput: true,
    superseded: false,
  },
  {
    sourceKind: "document",
    sourceKey: "document:blocked",
    sourceVersionHash: null,
    inputKind: "none",
    locator: null,
    contentHash: null,
    identityConfidence: "unresolved",
    readableInput: false,
    superseded: false,
  },
]);

test("content intake CLI accepts exactly one sealed snapshot", () => {
  assert.deepEqual(parseLibraryAnalysisContentIntakeArgs([
    "--snapshot=/tmp/population.json",
  ]), { snapshot: "/tmp/population.json" });
  assert.throws(() => parseLibraryAnalysisContentIntakeArgs([]));
  assert.throws(() => parseLibraryAnalysisContentIntakeArgs([
    "--snapshot=/tmp/one.json",
    "--snapshot=/tmp/two.json",
  ]));
});

test("eligible population rows bind exact source bytes to deterministic content units", () => {
  const units = buildLibraryAnalysisContentUnits(population, [
    { documentId: "doc-1", summary: null, content: sourceText },
  ]);

  assert.equal(units.length, 1);
  assert.equal(units[0]?.sourceKey, "document:doc-1");
  assert.equal(units[0]?.sourceVersionHash, contentHash);
  assert.equal(units[0]?.contentHash, contentHash);
  assert.equal(units[0]?.locator, "database:Document:doc-1:content");
  assert.equal(units[0]?.unitType, "database_record");
  assert.equal(units[0]?.ordinal, 0);
  assert.doesNotMatch(JSON.stringify(units), /Source bytes/);
});

test("content intake verifies distinct content and source version hashes", () => {
  const summary = "A summary that is part of the source version.";
  const sourceVersionHash = createHash("sha256")
    .update(Buffer.from(`${summary}\n\n${sourceText}`, "utf8"))
    .digest("hex");
  const summarizedPopulation = buildLibraryAnalysisPopulation([
    {
      sourceKind: "document",
      sourceKey: "document:doc-1",
      sourceVersionHash,
      inputKind: "database_record",
      locator: "database:Document:doc-1:content",
      contentHash,
      identityConfidence: "exact",
      readableInput: true,
      superseded: false,
    },
  ]);

  const units = buildLibraryAnalysisContentUnits(summarizedPopulation, [
    { documentId: "doc-1", summary, content: sourceText },
  ]);

  assert.equal(units.length, 1);
  assert.equal(units[0]?.contentHash, contentHash);
  assert.equal(units[0]?.sourceVersionHash, sourceVersionHash);
});

test("content intake rejects source-byte drift and missing eligible bytes", () => {
  assert.throws(
    () => buildLibraryAnalysisContentUnits(population, [
      { documentId: "doc-1", summary: null, content: `${sourceText} changed` },
    ]),
    /library_analysis_content_hash_mismatch/,
  );
  assert.throws(
    () => buildLibraryAnalysisContentUnits(population, []),
    /library_analysis_source_bytes_missing/,
  );
});

test("content intake reports summary-only drift as source version drift", () => {
  const summary = "Original summary.";
  const sourceVersionHash = createHash("sha256")
    .update(Buffer.from(`${summary}\n\n${sourceText}`, "utf8"))
    .digest("hex");
  const summarizedPopulation = buildLibraryAnalysisPopulation([
    {
      sourceKind: "document",
      sourceKey: "document:doc-1",
      sourceVersionHash,
      inputKind: "database_record",
      locator: "database:Document:doc-1:content",
      contentHash,
      identityConfidence: "exact",
      readableInput: true,
      superseded: false,
    },
  ]);

  assert.throws(
    () => buildLibraryAnalysisContentUnits(summarizedPopulation, [
      { documentId: "doc-1", summary: "Changed summary.", content: sourceText },
    ]),
    /library_analysis_source_version_hash_mismatch/,
  );
});

test("intake receipt contains only identities hashes counts and replay state", async () => {
  const receipt = await ingestLibraryAnalysisContentUnits({
    snapshot: population,
    sourceRows: [{ documentId: "doc-1", summary: null, content: sourceText }],
    append: async (unit) => ({
      contentUnitId: unit.id,
      created: false,
    }),
  });

  assert.deepEqual(receipt.counts, {
    population: 2,
    eligible: 1,
    blocked: 1,
    created: 0,
    replayed: 1,
  });
  assert.equal(receipt.populationHash, population.populationHash);
  assert.equal(receipt.contentUnits[0]?.contentHash, contentHash);
  assert.equal(receipt.contentUnits[0]?.created, false);
  assert.doesNotMatch(JSON.stringify(receipt), /Source bytes/);
});
