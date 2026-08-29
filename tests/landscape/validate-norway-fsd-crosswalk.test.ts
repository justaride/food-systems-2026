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
