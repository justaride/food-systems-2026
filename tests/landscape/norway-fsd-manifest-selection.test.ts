import assert from "node:assert/strict";
import { copyFileSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  buildNorwayFsdCrosswalk,
  loadNorwayFsdBuildInputs,
} from "../../scripts/build-norway-fsd-crosswalk";
import { versionSnapshotFileName } from "../../scripts/fetch-norway-fsd-snapshot";
import {
  readNorwayFsdSnapshotSet,
  resolveNorwayFsdManifestPath,
} from "../../scripts/lib/norway-fsd-snapshot-set";
import {
  loadNorwayFsdBundle,
  validateNorwayFsdBundle,
} from "../../scripts/validate-norway-fsd-crosswalk";

test("the real builder and validator preserve per-source dates for a selected future snapshot set", async () => {
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
  const fullManifest = manifest.sources.find((source: { id: string }) => source.id === "fsd-full-export-2026-04-20");
  fullManifest.compressedPath = futureFullPath;
  fullManifest.accessedAt = "2026-09-01";
  const metadataManifest = manifest.sources.find((source: { id: string }) => source.id === "fsd-metadata-export-2026-04-20");
  metadataManifest.localPath = futureMetadataPath;
  metadataManifest.accessedAt = "2026-09-01";
  const futureManifestPath = path.join(futureDirectory, "norway-fsd-snapshot-manifest-2026-09-01.json");
  const futureOutputDirectory = path.join(futureDirectory, "generated");
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

  await buildNorwayFsdCrosswalk({
    root,
    manifestPath: futureManifestPath,
    outputDirectory: futureOutputDirectory,
  });
  const bundle = loadNorwayFsdBundle(futureOutputDirectory, futureManifestPath, root);
  assert.deepEqual(validateNorwayFsdBundle(bundle), { indicators: 60, crosswalk: 64, sources: 31 });

  const sourceMap = new Map(bundle.sources.map((source) => [source.id, source]));
  assert.equal(sourceMap.get("src-fsd-full-export-2026-04-20")?.accessDate, "2026-09-01");
  assert.equal(sourceMap.get("src-fsd-metadata-export-2026-04-20")?.accessDate, "2026-09-01");
  assert.equal(sourceMap.get("src-fsd-norway-profile")?.accessDate, "2026-08-10");
  assert.equal(bundle.sources.find((source) => source.sourceKind === "underlying_primary")?.accessDate, "2026-08-10");
  assert.equal(bundle.sources.find((source) => source.sourceKind === "internal")?.accessDate, "2026-08-10");
  assert.equal(bundle.indicators.every((indicator) => indicator.accessDate === "2026-08-10"), true);
  assert.match(bundle.report, /\*\*Tilgangsdato:\*\* 2026-08-10/);
  assert.match(bundle.report, /\*\*Eksportoppfriskning:\*\* 2026-09-01/);

  assert.deepEqual(readFileSync(frozenManifestPath), frozenManifestBytes);
  assert.deepEqual(readFileSync(frozenFullPath), frozenFullBytes);
});
