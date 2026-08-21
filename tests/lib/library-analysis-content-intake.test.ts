import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  buildLibraryAnalysisContentUnits,
  ingestLibraryAnalysisContentUnits,
  ingestResolvedLibraryAnalysisContentUnits,
  parseLibraryAnalysisContentIntakeArgs,
} from "../../scripts/knowledge/ingest-library-analysis-content-units";
import {
  emitLibraryAnalysisContentUnitBundle,
} from "../../scripts/knowledge/emit-library-analysis-content-units";
import { buildLibraryAnalysisAcquisitionPlan } from "../../src/lib/knowledge/library-analysis-acquisition-contract";
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

test("content intake CLI requires the sealed resolution chain and private run root", () => {
  assert.deepEqual(parseLibraryAnalysisContentIntakeArgs([
    "--snapshot=/tmp/population.json",
    "--plan=/tmp/plan.json",
    "--resolution=/tmp/resolution.json",
    "--content-units=/tmp/content-units.json",
    "--run-root=/tmp/private-run",
  ]), {
    snapshot: "/tmp/population.json",
    plan: "/tmp/plan.json",
    resolution: "/tmp/resolution.json",
    contentUnits: "/tmp/content-units.json",
    runRoot: "/tmp/private-run",
  });
  assert.throws(() => parseLibraryAnalysisContentIntakeArgs([]));
  assert.throws(() => parseLibraryAnalysisContentIntakeArgs([
    "--snapshot=/tmp/one.json",
    "--snapshot=/tmp/two.json",
    "--plan=/tmp/plan.json",
    "--resolution=/tmp/resolution.json",
    "--content-units=/tmp/content-units.json",
    "--run-root=/tmp/private-run",
  ]), /duplicate_library_analysis_content_intake_argument/);
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

test("private emit resolves the whole population without exposing source text", async () => {
  const acquiredText = "Acquired source text.";
  const acquiredHash = createHash("sha256")
    .update(Buffer.from(acquiredText, "utf8"))
    .digest("hex");
  const emitPopulation = buildLibraryAnalysisPopulation([
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
      sourceKind: "source_doc",
      sourceKey: "source_doc:acquired",
      sourceVersionHash: null,
      inputKind: "none",
      locator: null,
      contentHash: null,
      identityConfidence: "unresolved",
      readableInput: false,
      superseded: false,
    },
    {
      sourceKind: "source_doc",
      sourceKey: "source_doc:missing",
      sourceVersionHash: null,
      inputKind: "none",
      locator: null,
      contentHash: null,
      identityConfidence: "unresolved",
      readableInput: false,
      superseded: false,
    },
    {
      sourceKind: "document",
      sourceKey: "document:old",
      sourceVersionHash: null,
      inputKind: "none",
      locator: null,
      contentHash: null,
      identityConfidence: "unresolved",
      readableInput: false,
      superseded: true,
    },
  ]);
  const plan = buildLibraryAnalysisAcquisitionPlan(emitPopulation, [
    {
      sourceKind: "source_doc",
      sourceKey: "source_doc:acquired",
      route: "controlled_https",
      locator: "https://example.test/acquired.txt",
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
  const written: Array<{ portablePath: string; text: string }> = [];
  const output = await emitLibraryAnalysisContentUnitBundle({
    snapshot: emitPopulation,
    plan,
    extractions: [
      {
        sourceKind: "document",
        sourceKey: "document:doc-1",
        route: "database_document",
        sourceVersionHash: contentHash,
        rawSha256: contentHash,
        units: [{
          unitType: "database_record",
          baseLocator: "database:Document:doc-1:content",
          ordinal: 0,
          text: sourceText,
        }],
      },
      {
        sourceKind: "source_doc",
        sourceKey: "source_doc:acquired",
        route: "controlled_https",
        sourceVersionHash: acquiredHash,
        rawSha256: acquiredHash,
        units: [{
          unitType: "document_section",
          baseLocator: "https://example.test/acquired.txt",
          ordinal: 0,
          text: acquiredText,
        }],
      },
    ],
    failures: [],
    writeUnit: async (portablePath, text) => {
      written.push({ portablePath, text });
    },
  });

  assert.equal(output.populationTotal, 4);
  assert.equal(output.resolution.rows.length, output.populationTotal);
  assert.equal(output.resolution.populationHash, emitPopulation.populationHash);
  assert.equal(output.resolution.planHash, plan.planHash);
  assert.equal(output.contentUnitManifest.units.length, 2);
  assert.ok(output.contentUnitManifest.units.every((unit) => !("text" in unit)));
  assert.equal(written.length, 2);
  assert.equal(output.costEnvelope.automatedOnly, true);
  assert.equal(output.costEnvelope.externalReady, false);
  assert.equal(output.costEnvelope.estimatorVersion, "codepoints-interval/1.0.0");
  const totalCodePoints = Array.from(sourceText).length + Array.from(acquiredText).length;
  assert.equal(output.costEnvelope.onePassInputTokens.minimum, Math.ceil(totalCodePoints / 4.2));
  assert.equal(output.costEnvelope.onePassInputTokens.maximum, Math.ceil(totalCodePoints / 3));
  assert.equal(
    output.costEnvelope.analysisAndValidationTokens.maximum,
    Math.ceil(totalCodePoints / 3) * 2,
  );
  assert.equal(
    output.resolution.rows.find((row) => row.sourceKey === "source_doc:missing")?.reasonCode,
    "missing_locator",
  );
  assert.equal(
    output.resolution.rows.find((row) => row.sourceKey === "document:old")?.disposition,
    "superseded",
  );
  assert.doesNotMatch(JSON.stringify(output), /Source bytes|Acquired source text/);
});

test("resolution-aware intake verifies every private payload before the first append", async () => {
  const singlePopulation = buildLibraryAnalysisPopulation([{
    sourceKind: "document",
    sourceKey: "document:doc-1",
    sourceVersionHash: contentHash,
    inputKind: "database_record",
    locator: "database:Document:doc-1:content",
    contentHash,
    identityConfidence: "exact",
    readableInput: true,
    superseded: false,
  }]);
  const plan = buildLibraryAnalysisAcquisitionPlan(singlePopulation, []);
  const payloads = new Map<string, string>();
  const output = await emitLibraryAnalysisContentUnitBundle({
    snapshot: singlePopulation,
    plan,
    extractions: [{
      sourceKind: "document",
      sourceKey: "document:doc-1",
      route: "database_document",
      sourceVersionHash: contentHash,
      rawSha256: contentHash,
      units: [{
        unitType: "database_record",
        baseLocator: "database:Document:doc-1:content",
        ordinal: 0,
        text: sourceText,
      }],
    }],
    failures: [],
    writeUnit: async (path, text) => {
      payloads.set(path, text);
    },
  });
  let appendCalls = 0;
  await assert.rejects(
    () => ingestResolvedLibraryAnalysisContentUnits({
      snapshot: singlePopulation,
      plan,
      resolution: output.resolution,
      contentUnitManifest: output.contentUnitManifest,
      readUnit: async () => Buffer.from("drifted private payload", "utf8"),
      append: async (unit) => {
        appendCalls += 1;
        return { contentUnitId: unit.id, created: true };
      },
    }),
    /library_analysis_private_unit_hash_mismatch/,
  );
  assert.equal(appendCalls, 0);

  const receipt = await ingestResolvedLibraryAnalysisContentUnits({
    snapshot: singlePopulation,
    plan,
    resolution: output.resolution,
    contentUnitManifest: output.contentUnitManifest,
    readUnit: async (path) => Buffer.from(payloads.get(path) ?? "", "utf8"),
    append: async (unit) => {
      appendCalls += 1;
      return { contentUnitId: unit.id, created: false };
    },
  });
  assert.equal(appendCalls, 1);
  assert.equal(receipt.resolutionHash, output.resolution.resolutionHash);
  assert.equal(receipt.counts.replayed, 1);
});

test("private emit preserves repository source keys with normalized path separators", async () => {
  const repositoryText = "id,title\n1,Example";
  const repositoryHash = createHash("sha256")
    .update(Buffer.from(repositoryText, "utf8"))
    .digest("hex");
  const repositoryPopulation = buildLibraryAnalysisPopulation([{
    sourceKind: "library_file",
    sourceKey: "library_file:research/bibliotek/example.csv",
    sourceVersionHash: null,
    inputKind: "none",
    locator: null,
    contentHash: null,
    identityConfidence: "unresolved",
    readableInput: false,
    superseded: false,
  }]);
  const plan = buildLibraryAnalysisAcquisitionPlan(repositoryPopulation, [{
    sourceKind: "library_file",
    sourceKey: "library_file:research/bibliotek/example.csv",
    route: "repository_csv",
    locator: "repository:research/bibliotek/example.csv",
    alternateLocators: [],
  }]);
  const output = await emitLibraryAnalysisContentUnitBundle({
    snapshot: repositoryPopulation,
    plan,
    extractions: [{
      sourceKind: "library_file",
      sourceKey: "library_file:research/bibliotek/example.csv",
      route: "repository_csv",
      sourceVersionHash: repositoryHash,
      rawSha256: repositoryHash,
      units: [{
        unitType: "sheet_range",
        baseLocator: "repository:research/bibliotek/example.csv#rows=2-2",
        ordinal: 0,
        text: repositoryText,
      }],
    }],
    failures: [],
    writeUnit: async () => undefined,
  });

  assert.equal(
    output.contentUnitManifest.units[0]?.populationSourceKey,
    "library_file:research/bibliotek/example.csv",
  );
  assert.match(
    output.contentUnitManifest.units[0]?.sourceKey ?? "",
    /^source:[a-f0-9]{64}$/,
  );
});
