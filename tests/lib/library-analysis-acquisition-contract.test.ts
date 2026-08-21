import assert from "node:assert/strict";
import test from "node:test";

import {
  LibraryAnalysisAcquisitionPlanSchema,
  LibraryAnalysisAcquisitionResolutionSchema,
  buildLibraryAnalysisAcquisitionPlan,
  libraryAnalysisAcquisitionPlanHash,
  sealLibraryAnalysisResolution,
} from "../../src/lib/knowledge/library-analysis-acquisition-contract";
import { buildLibraryAnalysisPopulation } from "../../src/lib/knowledge/library-analysis-population";

const eligible = {
  sourceKind: "document",
  sourceKey: "document:a",
  sourceVersionHash: "a".repeat(64),
  inputKind: "database_record" as const,
  locator: "database:Document:a:content",
  contentHash: "b".repeat(64),
  identityConfidence: "exact" as const,
  readableInput: true,
  superseded: false,
};

const blocked = {
  sourceKind: "source_doc",
  sourceKey: "source_doc:src-1",
  sourceVersionHash: null,
  inputKind: "none" as const,
  locator: null,
  contentHash: null,
  identityConfidence: "unresolved" as const,
  readableInput: false,
  superseded: false,
};

const superseded = {
  ...eligible,
  sourceKey: "document:old",
  sourceVersionHash: null,
  inputKind: "none" as const,
  locator: null,
  contentHash: null,
  identityConfidence: "unresolved" as const,
  readableInput: false,
  superseded: true,
};

const population = buildLibraryAnalysisPopulation([
  blocked,
  superseded,
  eligible,
]);

const locator = {
  sourceKind: "source_doc",
  sourceKey: "source_doc:src-1",
  route: "controlled_https" as const,
  locator: "https://example.test/report.pdf",
  alternateLocators: ["https://doi.org/10.1000/example"],
};

test("acquisition plan is population-complete and independent of locator order", () => {
  const first = buildLibraryAnalysisAcquisitionPlan(population, [locator]);
  const second = buildLibraryAnalysisAcquisitionPlan(population, [
    { ...locator, alternateLocators: [...locator.alternateLocators] },
  ]);

  assert.equal(first.planHash, second.planHash);
  assert.equal(first.planId, `library-analysis-acquisition-plan:${first.planHash}`);
  assert.equal(first.populationHash, population.populationHash);
  assert.deepEqual(first.rows.map((row) => row.sourceKey), [
    "document:a",
    "document:old",
    "source_doc:src-1",
  ]);
  assert.equal(libraryAnalysisAcquisitionPlanHash(first), first.planHash);
  assert.equal(first.rows[0]?.route, "database_document");
  assert.equal(first.rows[1]?.route, "superseded");
  assert.equal(first.rows[2]?.route, "controlled_https");
});

test("acquisition plan rejects duplicate and foreign locator identities", () => {
  assert.throws(
    () => buildLibraryAnalysisAcquisitionPlan(population, [locator, locator]),
    /duplicate_acquisition_locator_identity/,
  );
  assert.throws(
    () => buildLibraryAnalysisAcquisitionPlan(population, [{
      ...locator,
      sourceKey: "source_doc:foreign",
    }]),
    /acquisition_locator_outside_population/,
  );
});

test("resolution refuses a missing population row", () => {
  const plan = buildLibraryAnalysisAcquisitionPlan(population, [locator]);

  assert.throws(
    () => sealLibraryAnalysisResolution(plan, [
      {
        sourceKind: "document",
        sourceKey: "document:a",
        disposition: "content_units_ready",
        reasonCode: null,
        contentUnits: [{
          contentUnitId: "content:one",
          sourceVersionHash: "a".repeat(64),
          unitType: "database_record",
          ordinal: 0,
          locator: "database:Document:a:content#chars=0-12",
          contentHash: "c".repeat(64),
        }],
      },
    ]),
    /resolution_population_incomplete/,
  );
});

test("resolution seals exactly one typed disposition for every plan row", () => {
  const plan = buildLibraryAnalysisAcquisitionPlan(population, [locator]);
  const resolution = sealLibraryAnalysisResolution(plan, [
    {
      sourceKind: "source_doc",
      sourceKey: "source_doc:src-1",
      disposition: "blocked_input",
      reasonCode: "http_not_found",
      contentUnits: [],
    },
    {
      sourceKind: "document",
      sourceKey: "document:old",
      disposition: "superseded",
      reasonCode: "source_superseded",
      contentUnits: [],
    },
    {
      sourceKind: "document",
      sourceKey: "document:a",
      disposition: "content_units_ready",
      reasonCode: null,
      contentUnits: [{
        contentUnitId: "content:one",
        sourceVersionHash: "a".repeat(64),
        unitType: "database_record",
        ordinal: 0,
        locator: "database:Document:a:content#chars=0-12",
        contentHash: "c".repeat(64),
      }],
    },
  ]);

  assert.equal(resolution.rows.length, population.rows.length);
  assert.equal(
    resolution.resolutionId,
    `library-analysis-acquisition-resolution:${resolution.resolutionHash}`,
  );
  assert.equal(
    LibraryAnalysisAcquisitionResolutionSchema.parse(resolution).resolutionHash,
    resolution.resolutionHash,
  );
  assert.throws(
    () => sealLibraryAnalysisResolution(plan, [{
      sourceKind: "document",
      sourceKey: "document:a",
      disposition: "blocked_input",
      reasonCode: null,
      contentUnits: [],
    }]),
    /resolution_blocker_reason_required|resolution_population_incomplete/,
  );
});

test("plan and resolution schemas reject hash drift and unknown fields", () => {
  const plan = buildLibraryAnalysisAcquisitionPlan(population, [locator]);
  assert.throws(() => LibraryAnalysisAcquisitionPlanSchema.parse({
    ...plan,
    planHash: "f".repeat(64),
  }), /acquisition_plan_hash_mismatch/);
  assert.throws(() => LibraryAnalysisAcquisitionPlanSchema.parse({
    ...plan,
    unexpected: true,
  }));
});
