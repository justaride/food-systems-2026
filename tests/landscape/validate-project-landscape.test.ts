import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import {
  loadLandscape,
  validateLandscape,
  type LandscapeData,
} from "../../scripts/validate-project-landscape";

const base = loadLandscape(path.join(process.cwd(), "research", "landscape"));
const fixture = (): LandscapeData => structuredClone(base);
const project = (data: LandscapeData, id: string) => data.projects.find((row) => row.id === id)!;
const source = (data: LandscapeData, id: string) => data.sources.find((row) => row.id === id)!;

test("the canonical landscape fixture is valid", () => {
  const summary = validateLandscape(fixture());
  assert.deepEqual(
    { projects: summary.projects, candidates: summary.candidates, sources: summary.sources },
    { projects: 40, candidates: 22, sources: 100 },
  );
});

test("same-owner or same-domain source cannot corroborate independently", () => {
  const data = fixture();
  source(data, "src-biebmolassi-funder").url = source(data, "src-biebmolassi-owner").url;
  assert.throws(() => validateLandscape(data), /same-domain corroboration/);
});

test("a reviewed source must have an exact locator", () => {
  const data = fixture();
  source(data, "src-biebmolassi-owner").locator.value = "";
  assert.throws(() => validateLandscape(data), /locator\.value must be a non-empty string/);
});

test("duplicate source ids are rejected", () => {
  const data = fixture();
  data.sources[1].id = data.sources[0].id;
  assert.throws(() => validateLandscape(data), /Duplicate or empty source id/);
});

test("orphan source ids are rejected", () => {
  const data = fixture();
  const candidateOnly = data.sources.find((row) => row.role === "discovery_only")!;
  candidateOnly.projectId = "missing-project";
  assert.throws(() => validateLandscape(data), /links discovery source|Orphan source/);
});

test("a longlist candidate cannot enter the ranking", () => {
  const data = fixture();
  data.candidates[0].workflowStatus = "eligible_main";
  assert.throws(() => validateLandscape(data), /cannot be ranked or eligible/);
});

test("active status cannot survive a documented past end date", () => {
  const data = fixture();
  project(data, "biebmolassi").lifecycle.endDate = "2025-12-31";
  assert.throws(() => validateLandscape(data), /unsupported active status/);
});

test("qualitative findings require claim-level provenance", () => {
  const data = fixture();
  project(data, "biebmolassi").qualitativeFindings[0].sourceIds = [];
  assert.throws(() => validateLandscape(data), /qualitativeFindings\[0\]\.sourceIds must be a non-empty array/);
});

test("priority score must reproduce the documented formula", () => {
  const data = fixture();
  project(data, "biebmolassi").analysis.priorityScore = 0;
  assert.throws(() => validateLandscape(data), /priorityScore 0 !=/);
});

test("evidence score cannot be inflated by source count", () => {
  const data = fixture();
  project(data, "digifood").analysis.evidenceScore = 5;
  assert.throws(() => validateLandscape(data), /evidenceScore 5 !=/);
});

test("report ranking must reproduce the JSONL register", () => {
  const data = fixture();
  data.report = data.report.replace(/<!-- TOP10_IDS: [a-z0-9,-]+ -->/, "<!-- TOP10_IDS: biebmolassi -->");
  assert.throws(() => validateLandscape(data), /TOP10_IDS does not reproduce/);
});
