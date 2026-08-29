import assert from "node:assert/strict";
import { copyFileSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { loadNorwayFsdBuildInputs } from "../../scripts/build-norway-fsd-crosswalk";
import { versionSnapshotFileName } from "../../scripts/fetch-norway-fsd-snapshot";
import {
  readNorwayFsdSnapshotSet,
  resolveNorwayFsdManifestPath,
} from "../../scripts/lib/norway-fsd-snapshot-set";
import { loadNorwayFsdBundle } from "../../scripts/validate-norway-fsd-crosswalk";

test("a future versioned snapshot set is explicitly selectable without changing the frozen default", () => {
  const root = process.cwd();
  const landscapeDirectory = path.join(root, "research", "landscape");
  const frozenManifestPath = path.join(landscapeDirectory, "norway-fsd-snapshot-manifest-2026-08-10.json");
  const frozenManifestBytes = readFileSync(frozenManifestPath);
  const frozenFullPath = path.join(landscapeDirectory, "snapshots", "fsd-full-export-2026-04-20.csv.gz");
  const frozenFullBytes = readFileSync(frozenFullPath);
  const futureDirectory = mkdtempSync(path.join(tmpdir(), "fsd-future-set-"));
  const futureFullPath = path.join(futureDirectory, "fsd-full-export-2026-04-20-accessed-2026-09-01.csv.gz");
  const futureMetadataPath = path.join(futureDirectory, "fsd-metadata-export-2026-04-20-accessed-2026-09-01.csv");
  copyFileSync(frozenFullPath, futureFullPath);
  copyFileSync(path.join(landscapeDirectory, "snapshots", "fsd-metadata-export-2026-04-20.csv"), futureMetadataPath);

  const manifest = JSON.parse(frozenManifestBytes.toString("utf8"));
  manifest.snapshotDate = "2026-09-01";
  manifest.sources.find((source: { id: string }) => source.id === "fsd-full-export-2026-04-20").compressedPath = futureFullPath;
  manifest.sources.find((source: { id: string }) => source.id === "fsd-metadata-export-2026-04-20").localPath = futureMetadataPath;
  const futureManifestPath = path.join(futureDirectory, "norway-fsd-snapshot-manifest-2026-09-01.json");
  writeFileSync(futureManifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  assert.equal(
    versionSnapshotFileName("fsd-full-export-2026-04-20.csv.gz", "2026-09-01"),
    "fsd-full-export-2026-04-20-accessed-2026-09-01.csv.gz",
  );
  assert.equal(resolveNorwayFsdManifestPath([`--manifest=${futureManifestPath}`], landscapeDirectory), futureManifestPath);
  const snapshotSet = readNorwayFsdSnapshotSet(root, futureManifestPath);
  assert.equal(snapshotSet.manifestPath, futureManifestPath);
  assert.equal(snapshotSet.fullExport.length > 0, true);
  assert.equal(snapshotSet.profile.indicators.length, 60);
  assert.equal(loadNorwayFsdBuildInputs(root, futureManifestPath).manifestPath, futureManifestPath);
  assert.equal(loadNorwayFsdBundle(landscapeDirectory, futureManifestPath).manifestPath, futureManifestPath);

  assert.deepEqual(readFileSync(frozenManifestPath), frozenManifestBytes);
  assert.deepEqual(readFileSync(frozenFullPath), frozenFullBytes);
});
