import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  parseGapRegister,
  validatePhaseReadiness,
  validatePhaseReadinessFromDisk,
} from "../../scripts/validate-phase-readiness";

const root = process.cwd();
const register = path.join(root, "research/_status/information-gap-register-2026-08-11.jsonl");
const report = path.join(root, "docs/project/status/food-systems-phase-readiness-2026-08-11.md");
const operatingPlan = path.join(root, "docs/project/mandates/gap-closure-operating-plan-2026-08-11.md");

function loadFixture() {
  return {
    root,
    gaps: parseGapRegister(fs.readFileSync(register, "utf8")),
    report: fs.readFileSync(report, "utf8"),
    operatingPlan: fs.readFileSync(operatingPlan, "utf8"),
  };
}

test("phase readiness register, report and operating plan stay in parity", () => {
  const summary = validatePhaseReadinessFromDisk(root);
  assert.deepEqual(summary, {
    gaps: 18,
    p0: 5,
    p1: 10,
    p2: 3,
    humanGated: 9,
    sourceGated: 6,
    trueC: 1,
    intakeStagedFiles: 135,
    intakeExtractionRecords: 128,
    intakeUniqueUrls: 125,
    intakeMissingUrls: 1,
    intakeFindings: 335,
    intakeVerdicts: 91,
    intakeMachineVerified: 90,
    intakeDisputed: 1,
  });
});

test("duplicate gap IDs fail closed", () => {
  const fixture = loadFixture();
  fixture.gaps[1] = { ...fixture.gaps[1], id: fixture.gaps[0].id };
  assert.throws(
    () => validatePhaseReadiness(fixture),
    /Gap IDs must be unique/,
  );
});

test("missing report parity fails closed", () => {
  const fixture = loadFixture();
  fixture.report = fixture.report.replaceAll("`IG-018`", "`GAP-REMOVED`");
  assert.throws(
    () => validatePhaseReadiness(fixture),
    /Readiness report is missing IG-018/,
  );
});

test("missing local evidence fails closed", () => {
  const fixture = loadFixture();
  fixture.gaps[0] = {
    ...fixture.gaps[0],
    evidenceRefs: ["docs/project/status/does-not-exist.md"],
  };
  assert.throws(
    () => validatePhaseReadiness(fixture),
    /evidence reference does not exist/,
  );
});

test("stale intake readback fails closed", () => {
  const fixture = loadFixture();
  fixture.report = fixture.report.replace(
    "135 staged filer, 128 ekstraksjonsposter, 125 unike ikke-tomme URL-er og 335 finding-poster",
    "165 staged filer, 128 ekstraksjonsposter, 125 unike ikke-tomme URL-er og 279 finding-poster",
  );
  assert.throws(
    () => validatePhaseReadiness(fixture),
    /missing reproducible intake readback/,
  );
});
