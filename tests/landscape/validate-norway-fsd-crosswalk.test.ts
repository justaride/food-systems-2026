import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { loadNorwayFsdBundle, validateNorwayFsdBundle } from "../../scripts/validate-norway-fsd-crosswalk";

type LocalTuple = {
  file: string;
  metricKey: string;
  value: number | null;
  year: number | null;
  unit: string;
};

const expectedLocalTuples: LocalTuple[] = [
  { file: "public/data/food-systems/no/chart-metrics.json", metricKey: "parentCompany.parentHHI", value: 3445, year: null, unit: "HHI index" },
  { file: "public/data/food-systems/no/flows.json", metricKey: "flows[*].value", value: null, year: 2024, unit: "index" },
  { file: "public/data/food-systems/no/value-chain.json", metricKey: "food_waste_by_category.summary.norway_total_food_waste_2023_tonnes", value: 451600, year: 2023, unit: "tonnes" },
  { file: "public/data/food-systems/no/value-chain.json", metricKey: "selfSufficiency.caloric_pct", value: 41.3, year: 2024, unit: "%" },
  { file: "public/data/food-systems/no/value-chain.json", metricKey: "selfSufficiency.feed_corrected_pct", value: 34.9, year: 2024, unit: "%" },
  { file: "public/data/food-systems/no/value-chain.json", metricKey: "steps[id=primary].breakdown.fruit_veg_breakdown.fruit", value: 25576, year: 2024, unit: "tonnes" },
  { file: "public/data/food-systems/no/value-chain.json", metricKey: "steps[id=primary].breakdown.fruit_veg_breakdown.vegetables", value: 184445, year: 2024, unit: "tonnes" },
  { file: "public/data/food-systems/no/value-chain.json", metricKey: "steps[id=primary].breakdown.grain_tonnes", value: 1183800, year: 2024, unit: "tonnes" },
  { file: "public/data/food-systems/no/value-chain.json", metricKey: "steps[id=primary].breakdown.meat_breakdown.beef", value: 86090, year: 2024, unit: "tonnes" },
  { file: "public/data/food-systems/no/value-chain.json", metricKey: "steps[id=primary].breakdown.milk_tonnes", value: 1524400, year: 2024, unit: "tonnes" },
  { file: "public/data/food-systems/no/value-chain.json", metricKey: "steps[id=retail].concentration.hhi", value: 3327, year: 2024, unit: "HHI index" },
  { file: "public/data/food-systems/no/value-chain.json", metricKey: "steps[id=waste].total_waste_tonnes", value: 407100, year: 2024, unit: "tonnes" },
  { file: "public/data/food-systems/ssb_landbruk_2024.json", metricKey: "economics.cpi_food_oct24_oct25", value: 0.031, year: 2025, unit: "ratio change" },
  { file: "public/data/food-systems/ssb_landbruk_2024.json", metricKey: "food_waste_2024.total_edible_tonnes", value: 390000, year: 2024, unit: "tonnes" },
  { file: "public/data/food-systems/ssb_landbruk_2024.json", metricKey: "production.self_sufficiency_2023.calories", value: 0.44, year: 2023, unit: "ratio" },
  { file: "public/data/food-systems/ssb_landbruk_2024.json", metricKey: "production.self_sufficiency_2023.fruit", value: 0.04, year: 2023, unit: "ratio" },
  { file: "public/data/food-systems/ssb_landbruk_2024.json", metricKey: "production.self_sufficiency_2023.vegetables", value: 0.49, year: 2023, unit: "ratio" },
];

const tupleKey = (row: LocalTuple) => JSON.stringify([row.file, row.metricKey, row.value, row.year, row.unit]);

function localTuples(bundle: ReturnType<typeof loadNorwayFsdBundle>): LocalTuple[] {
  const unique = new Map<string, LocalTuple>();
  for (const row of bundle.crosswalk) {
    for (const match of row.internalMatches) {
      const tuple = {
        file: match.file,
        metricKey: match.metricKey,
        value: match.value,
        year: match.year,
        unit: match.unit,
      } satisfies LocalTuple;
      unique.set(tupleKey(tuple), tuple);
    }
  }
  return [...unique.values()].sort((a, b) => tupleKey(a).localeCompare(tupleKey(b)));
}

function mutateFirstTuple(
  bundle: ReturnType<typeof loadNorwayFsdBundle>,
  tuple: LocalTuple,
  field: "value" | "year" | "unit",
): ReturnType<typeof loadNorwayFsdBundle> {
  const copy = { ...bundle, crosswalk: structuredClone(bundle.crosswalk) };
  for (const row of copy.crosswalk) {
    const match = row.internalMatches.find((candidate: LocalTuple) => tupleKey(candidate) === tupleKey(tuple));
    if (!match) continue;
    if (field === "value") match.value = tuple.value === null ? 1 : tuple.value + 1;
    if (field === "year") match.year = tuple.year === null ? 2000 : tuple.year + 1;
    if (field === "unit") match.unit = `${tuple.unit} drift`;
    return copy;
  }
  throw new Error(`test fixture tuple not found: ${tupleKey(tuple)}`);
}

test("the governed Norway FSD bundle is complete and reproducible", () => {
  const bundle = loadNorwayFsdBundle(path.join(process.cwd(), "research", "landscape"));
  const summary = validateNorwayFsdBundle(bundle);
  assert.deepEqual(
    { indicators: summary.indicators, crosswalk: summary.crosswalk, sources: summary.sources },
    { indicators: 60, crosswalk: 64, sources: 31 },
  );
  assert.match(bundle.report, /<!-- FSD_AUDIT_SUMMARY: /);
  assert.match(bundle.report, /external benchmark surface/i);
  assert.match(bundle.report, /not a Norwegian primary series/i);
  assert.match(bundle.report, /not production data/i);
});

test("every local metric tuple is an exact supported selector result", () => {
  const bundle = loadNorwayFsdBundle(path.join(process.cwd(), "research", "landscape"));

  assert.deepEqual(
    localTuples(bundle),
    [...expectedLocalTuples].sort((a, b) => tupleKey(a).localeCompare(tupleKey(b))),
  );
  assert.doesNotThrow(() => validateNorwayFsdBundle(bundle));
});

test("every internal source ledger hash matches the actual local bytes", () => {
  const bundle = loadNorwayFsdBundle(path.join(process.cwd(), "research", "landscape"));
  const internalSources = bundle.sources.filter((source) => source.sourceKind === "internal");

  assert.ok(internalSources.length > 0);
  for (const source of internalSources) {
    const actual = createHash("sha256")
      .update(fs.readFileSync(path.resolve(bundle.root, source.localPath)))
      .digest("hex");
    assert.equal(source.contentHash, actual, source.id);
  }
});

for (const field of ["value", "year", "unit"] as const) {
  test(`validation rejects ${field} drift for every local metric tuple`, () => {
    const bundle = loadNorwayFsdBundle(path.join(process.cwd(), "research", "landscape"));
    const jsonTuples = localTuples(bundle).filter((tuple) => tuple.file.endsWith(".json"));
    assert.ok(jsonTuples.length > 0);
    for (const tuple of jsonTuples) {
      assert.throws(
        () => validateNorwayFsdBundle(mutateFirstTuple(bundle, tuple, field)),
        new RegExp(`internal metric ${field}`, "i"),
        tupleKey(tuple),
      );
    }
  });
}

test("validation recomputes internal source hashes from actual bytes", () => {
  const bundle = loadNorwayFsdBundle(path.join(process.cwd(), "research", "landscape"));
  const sources = bundle.sources.map((source) =>
    source.id === "src-internal-value-chain-no"
      ? { ...source, contentHash: "0".repeat(64) }
      : source,
  );

  assert.throws(
    () => validateNorwayFsdBundle({ ...bundle, sources }),
    /internal source contentHash.*actual bytes/i,
  );
});

test("validation fails closed for unsupported local selectors and origins", () => {
  const bundle = loadNorwayFsdBundle(path.join(process.cwd(), "research", "landscape"));
  const selectorBundle = { ...bundle, crosswalk: structuredClone(bundle.crosswalk) };
  const selectorRow = selectorBundle.crosswalk.find((row) => row.internalMatches.length > 0);
  assert.ok(selectorRow);
  const selectorMatch = selectorRow.internalMatches[0];
  assert.ok(selectorMatch);
  selectorMatch.metricKey = "steps[0].value";
  assert.throws(() => validateNorwayFsdBundle(selectorBundle), /unsupported internal metric selector/i);

  const originBundle = { ...bundle, crosswalk: structuredClone(bundle.crosswalk) };
  const originRow = originBundle.crosswalk.find((row) => row.internalMatches.length > 0);
  assert.ok(originRow);
  const match = originRow.internalMatches[0];
  assert.ok(match);
  match.file = "prisma/seed-data/sustainability-country-metrics.ts";
  match.sourceRef = "src-internal-sustainability-country-metrics";
  assert.throws(() => validateNorwayFsdBundle(originBundle), /unsupported internal metric origin/i);
});

test("validation rejects a source ledger detached from the verified snapshot manifest", () => {
  const bundle = loadNorwayFsdBundle(path.join(process.cwd(), "research", "landscape"));
  const sources = bundle.sources.map((source) =>
    source.id === "src-fsd-full-export-2026-04-20"
      ? { ...source, contentHash: "0".repeat(64) }
      : source,
  );

  assert.throws(
    () => validateNorwayFsdBundle({ ...bundle, sources }),
    /full export.*manifest/i,
  );
});

test("validation reconstructs a direct indicator value from the verified profile", () => {
  const bundle = loadNorwayFsdBundle(path.join(process.cwd(), "research", "landscape"));
  const indicators = bundle.indicators.map((indicator) =>
    indicator.id === "fsd-nor-66"
      ? { ...indicator, rawValue: 0.986, displayValue: "0.986" }
      : indicator,
  );

  assert.throws(
    () => validateNorwayFsdBundle({ ...bundle, indicators }),
    /verified Norway profile/i,
  );
});

test("validation reconstructs a mapped indicator value from the verified profile", () => {
  const bundle = loadNorwayFsdBundle(path.join(process.cwd(), "research", "landscape"));
  const indicators = bundle.indicators.map((indicator) =>
    indicator.id === "fsd-nor-1103"
      ? { ...indicator, rawValue: 91.25, displayValue: "91.25" }
      : indicator,
  );

  assert.throws(
    () => validateNorwayFsdBundle({ ...bundle, indicators }),
    /verified Norway profile/i,
  );
});

test("validation fails closed for an unsupported indicator value origin", () => {
  const bundle = loadNorwayFsdBundle(path.join(process.cwd(), "research", "landscape"));
  const indicators = bundle.indicators.map((indicator, index) =>
    index === 0 ? { ...indicator, valueOrigin: "unreconstructable" } : indicator,
  );

  assert.throws(
    () => validateNorwayFsdBundle({ ...bundle, indicators }),
    /unsupported value origin/i,
  );
});
