import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

type SourceInput = {
  sourceId: string;
  path: string;
  sha256: string;
  gitBlob?: string;
};

type Replacement = {
  sourceIds: string[];
  sourceInputs: SourceInput[];
  replacementPath: string;
  canonicalUrl: string;
  disposition: string;
  authority: string;
  rightsStatus: string;
  publicationReady: boolean;
  deletionAuthorized: boolean;
};

type Manifest = {
  schemaVersion: number;
  authority: string;
  rightsStatus: string;
  deletionAuthorized: boolean;
  publicationReady: boolean;
  entries: Replacement[];
};

const manifestPath = "research/_status/visual-atlas-replacement-manifest-2026-08-31.json";
const expectedInputs: SourceInput[] = [
  {
    sourceId: "U01",
    path: "research/innhenting-2026-08-05/staging/brod-2017-ambio-fish-sludge-pmc.html",
    sha256: "7757de89f940ab5853a20b78f63f613f5c0eaae64e8431e3fd9b30ce19487656",
  },
  {
    sourceId: "U03",
    path: "research/innhenting-2026-08-05/staging/estatenyheter-coop-union-2015.md",
    sha256: "2a42785baf986bf27da0d7abd0d158f79f644f7f95415721ba88c84a6599756e",
  },
  {
    sourceId: "U04",
    path: "research/innhenting-2026-08-05/staging/frontiers-p-flow-norway-2023.html",
    sha256: "a53c3e5cd5e2a2a21feff75f650338bbd7c96d5d663b4bc08d8907589a17c014",
  },
  {
    sourceId: "T07",
    path: "research/bibliotek/primaerkilder-2026-08-05/riksdagen-prop-2025-26-205-beredskapslager.html",
    gitBlob: "4a34f10cdda13d14e02aaa079bf2b682efd7aefe",
    sha256: "d8c828f4ee8df48f800b914cac3dea9c69079e8e5ae6cd0a2dd66a2d5574340a",
  },
  {
    sourceId: "U05",
    path: "research/innhenting-2026-08-05/staging/lovdata-forskrift-2023-12-11-2037.html",
    sha256: "ec09e81c924a3ef8da8a39783247208b980ad82258ddb98aa3dd87b122d3e6b2",
  },
  {
    sourceId: "U06",
    path: "research/innhenting-2026-08-05/staging/lovdata-forskrift-2023-12-11-2037.txt",
    sha256: "b1983e65a2dcf3c76e85f23b7bba772cb26df635ba6afcdf12d823f860c85e22",
  },
];

const readManifest = (): Manifest => JSON.parse(fs.readFileSync(manifestPath, "utf8"));

test("replacement manifest preserves the candidate-only governance boundary", () => {
  const manifest = readManifest();

  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.authority, "candidate_only");
  assert.equal(manifest.rightsStatus, "human_gate");
  assert.equal(manifest.deletionAuthorized, false);
  assert.equal(manifest.publicationReady, false);
  assert.equal(manifest.entries.length, 5);
  for (const entry of manifest.entries) {
    assert.equal(entry.disposition, "replacement_candidate");
    assert.equal(entry.authority, "internal_only");
    assert.equal(entry.rightsStatus, "human_gate");
    assert.equal(entry.publicationReady, false);
    assert.equal(entry.deletionAuthorized, false);
  }
});

test("replacement manifest has exact one-time source coverage and immutable input provenance", () => {
  const manifest = readManifest();
  const inputs = manifest.entries.flatMap((entry) => entry.sourceInputs);

  assert.deepEqual(
    [...manifest.entries.flatMap((entry) => entry.sourceIds)].sort(),
    ["T07", "U01", "U03", "U04", "U05", "U06"],
  );
  assert.deepEqual(
    [...inputs].sort((a, b) => a.sourceId.localeCompare(b.sourceId)),
    [...expectedInputs].sort((a, b) => a.sourceId.localeCompare(b.sourceId)),
  );
  const regulation = manifest.entries.find((entry) => entry.sourceIds.includes("U05"));
  assert.deepEqual(regulation?.sourceIds, ["U05", "U06"]);
  assert.equal(regulation?.sourceInputs.length, 2);
});

test("replacement notes remain bounded, internal-only records", () => {
  const manifest = readManifest();

  for (const entry of manifest.entries) {
    assert.match(entry.replacementPath, /\.md$/);
    assert.ok(!entry.sourceInputs.some((input) => input.path === entry.replacementPath));
    assert.ok(fs.existsSync(entry.replacementPath), `missing ${entry.replacementPath}`);
    const note = fs.readFileSync(entry.replacementPath, "utf8");

    assert.match(note, /authority:\s*internal_only/);
    assert.match(note, /publication_ready:\s*false/);
    assert.match(note, /rights_status:\s*human_gate/);
    assert.match(note, new RegExp(entry.canonicalUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    for (const input of entry.sourceInputs) {
      assert.match(note, new RegExp(input.sha256));
    }
    for (const forbidden of [
      "<html",
      "<script",
      "dataLayer",
      "Frontiers in Sustainable Food Systems About us About us",
      "Eiendommen brukes i dag til hovedkontor",
    ]) {
      assert.doesNotMatch(note, new RegExp(forbidden, "i"));
    }
  }
});
