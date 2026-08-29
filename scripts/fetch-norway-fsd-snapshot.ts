import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = resolve(process.cwd());
const SNAPSHOT_DATE = "2026-08-10";
const SNAPSHOT_DIR = resolve(ROOT, "research/landscape/snapshots");

const SOURCES = [
  {
    id: "fsd-full-export-2026-04-20",
    role: "fsd_full_data_export",
    url: "https://d3e9iu03zzh17w.cloudfront.net/bulk-data-downloads/fsd-full-export-2026-04-20.csv",
    file: "fsd-full-export-2026-04-20.csv.gz",
    compress: true,
  },
  {
    id: "fsd-metadata-export-2026-04-20",
    role: "fsd_metadata_export",
    url: "https://d3e9iu03zzh17w.cloudfront.net/bulk-data-downloads/fsd-metadata-export-2026-04-20.csv",
    file: "fsd-metadata-export-2026-04-20.csv",
    compress: false,
  },
];

function sha256(contents: Uint8Array): string {
  return createHash("sha256").update(contents).digest("hex");
}

function gzipDeterministic(raw: Buffer): Buffer {
  const result = spawnSync("gzip", ["-n", "-9", "-c"], {
    input: raw,
    maxBuffer: 128 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`gzip -n -9 failed: ${result.stderr.toString("utf8")}`);
  }
  return result.stdout;
}

async function main() {
  await mkdir(SNAPSHOT_DIR, { recursive: true });
  const manifestSources: Array<Record<string, string | number>> = [];

  for (const source of SOURCES) {
    const response = await fetch(source.url, { headers: { accept: "text/csv,*/*" } });
    if (!response.ok) {
      throw new Error(`FSD snapshot failed for ${source.url}: ${response.status} ${response.statusText}`);
    }
    const raw = Buffer.from(await response.arrayBuffer());
    const snapshotPath = resolve(SNAPSHOT_DIR, source.file);
    if (source.compress) {
      const compressed = gzipDeterministic(raw);
      await writeFile(snapshotPath, compressed);
      manifestSources.push({
        id: source.id,
        role: source.role,
        url: source.url,
        compressedPath: `research/landscape/snapshots/${source.file}`,
        accessedAt: SNAPSHOT_DATE,
        contentType: response.headers.get("content-type") ?? "application/octet-stream",
        compressedBytes: compressed.byteLength,
        compressedSha256: sha256(compressed),
        rawBytes: raw.byteLength,
        rawSha256: sha256(raw),
        compression: "gzip -n -9",
      });
    } else {
      await writeFile(snapshotPath, raw);
      manifestSources.push({
        id: source.id,
        role: source.role,
        url: source.url,
        localPath: `research/landscape/snapshots/${source.file}`,
        accessedAt: SNAPSHOT_DATE,
        contentType: response.headers.get("content-type") ?? "text/csv",
        bytes: raw.byteLength,
        sha256: sha256(raw),
      });
    }
  }

  const profilePath = resolve(SNAPSHOT_DIR, "norway-fsd-profile-2026-08-10.json");
  manifestSources.push({
    id: "fsd-norway-profile-2026-08-10",
    role: "fsd_country_profile",
    url: "https://www.foodsystemsdashboard.org/countries/nor",
    localPath: "research/landscape/snapshots/norway-fsd-profile-2026-08-10.json",
    accessedAt: SNAPSHOT_DATE,
    contentType: "application/json",
    bytes: (await readFile(profilePath)).byteLength,
    sha256: sha256(await readFile(profilePath)),
  });

  const manifestPath = resolve(ROOT, `research/landscape/norway-fsd-snapshot-manifest-${SNAPSHOT_DATE}.json`);
  await mkdir(dirname(manifestPath), { recursive: true });
  await writeFile(
    manifestPath,
    `${JSON.stringify({ snapshotDate: SNAPSHOT_DATE, sources: manifestSources }, null, 2)}\n`,
    "utf8",
  );
  console.log(`Frozen ${manifestSources.length} FSD sources in ${manifestPath}`);
}

const invokedPath = process.argv[1];
if (invokedPath && import.meta.url === pathToFileURL(invokedPath).href) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
