import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import { loadNorwayFsdBundle, validateNorwayFsdBundle } from "../../scripts/validate-norway-fsd-crosswalk";

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
