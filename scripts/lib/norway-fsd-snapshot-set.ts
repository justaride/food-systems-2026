import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";

import { parseCsv, type CsvRow } from "./parse-rfc4180.ts";
import { readVerifiedGzipSnapshot } from "./snapshot-integrity.ts";

type JsonRecord = Record<string, any>;

export const DEFAULT_NORWAY_FSD_MANIFEST = "norway-fsd-snapshot-manifest-2026-08-10.json";

export type NorwayFsdSnapshotSet = {
  manifestPath: string;
  snapshotDate: string;
  sources: JsonRecord[];
  fullManifest: JsonRecord;
  metadataManifest: JsonRecord;
  profileManifest: JsonRecord;
  fullExport: CsvRow[];
  metadataRows: CsvRow[];
  profile: JsonRecord;
};

const hashPattern = /^[a-f0-9]{64}$/;

function fail(message: string): never {
  throw new Error(message);
}

function readVerifiedFile(root: string, manifest: JsonRecord): Buffer {
  if (typeof manifest.localPath !== "string" || manifest.localPath.length === 0) fail(`${manifest.id}.localPath is required`);
  if (!Number.isInteger(manifest.bytes) || manifest.bytes < 1) fail(`${manifest.id}.bytes must be a positive integer`);
  if (!hashPattern.test(manifest.sha256)) fail(`${manifest.id}.sha256 must be SHA-256`);
  const filePath = path.resolve(root, manifest.localPath);
  const contents = readFileSync(filePath);
  if (contents.byteLength !== manifest.bytes) fail(`${manifest.id} byte count mismatch`);
  const actualSha256 = createHash("sha256").update(contents).digest("hex");
  if (actualSha256 !== manifest.sha256) fail(`${manifest.id} SHA-256 mismatch`);
  return contents;
}

export function resolveNorwayFsdManifestPath(args: string[], landscapeDirectory: string): string {
  const inline = args.find((argument) => argument.startsWith("--manifest="))?.slice("--manifest=".length);
  const optionIndex = args.indexOf("--manifest");
  const selected = inline ?? (optionIndex >= 0 ? args[optionIndex + 1] : undefined);
  if (optionIndex >= 0 && !selected) fail("--manifest requires a path");
  if (!selected) return path.resolve(landscapeDirectory, DEFAULT_NORWAY_FSD_MANIFEST);
  return path.resolve(landscapeDirectory, selected);
}

export function readNorwayFsdSnapshotSet(root: string, manifestPath: string): NorwayFsdSnapshotSet {
  const snapshotManifest = JSON.parse(readFileSync(manifestPath, "utf8")) as { snapshotDate: string; sources: JsonRecord[] };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(snapshotManifest.snapshotDate)) fail("snapshotDate must be YYYY-MM-DD");
  if (!Array.isArray(snapshotManifest.sources)) fail("snapshot manifest sources must be an array");
  const manifestMap = new Map(snapshotManifest.sources.map((source) => [source.id, source]));
  const fullManifest = manifestMap.get("fsd-full-export-2026-04-20");
  const metadataManifest = manifestMap.get("fsd-metadata-export-2026-04-20");
  const profileManifest = manifestMap.get("fsd-norway-profile-2026-08-10");
  if (!fullManifest || !metadataManifest || !profileManifest) fail("snapshot manifest is missing a governed FSD source");

  if (fullManifest.compression !== "gzip -n -9") fail("FSD full export must use gzip -n -9");
  if (typeof fullManifest.compressedPath !== "string" || fullManifest.compressedPath.length === 0) fail("full export compressedPath is required");
  if (!Number.isInteger(fullManifest.compressedBytes) || fullManifest.compressedBytes < 1) fail("full export compressedBytes must be a positive integer");
  if (!Number.isInteger(fullManifest.rawBytes) || fullManifest.rawBytes < 1) fail("full export rawBytes must be a positive integer");
  if (!hashPattern.test(fullManifest.compressedSha256) || !hashPattern.test(fullManifest.rawSha256)) fail("full export hashes must be SHA-256");
  const fullExportPath = path.resolve(root, fullManifest.compressedPath);
  const raw = readVerifiedGzipSnapshot(fullExportPath, fullManifest.compressedSha256, fullManifest.rawSha256);
  if (statSync(fullExportPath).size !== fullManifest.compressedBytes) fail("full export compressed byte count mismatch");
  if (raw.byteLength !== fullManifest.rawBytes) fail("full export raw byte count mismatch");

  const metadata = readVerifiedFile(root, metadataManifest);
  const profileContents = readVerifiedFile(root, profileManifest);
  return {
    manifestPath: path.resolve(manifestPath),
    snapshotDate: snapshotManifest.snapshotDate,
    sources: snapshotManifest.sources,
    fullManifest,
    metadataManifest,
    profileManifest,
    fullExport: parseCsv(raw.toString("utf8")),
    metadataRows: parseCsv(metadata.toString("utf8")),
    profile: JSON.parse(profileContents.toString("utf8")) as JsonRecord,
  };
}
