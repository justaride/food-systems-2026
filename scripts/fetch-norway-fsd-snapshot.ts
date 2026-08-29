import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = resolve(process.cwd());
const PROFILE_ACCESS_DATE = "2026-08-10";
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

export type SnapshotPromotion = {
  targetPath: string;
  contents: Buffer;
};

export async function promoteSnapshotTransaction(
  outputs: SnapshotPromotion[],
  beforePromote: () => void | Promise<void> = () => undefined,
): Promise<void> {
  if (outputs.length === 0) return;
  await mkdir(dirname(outputs[0].targetPath), { recursive: true });
  const stageDirectory = await mkdtemp(resolve(dirname(outputs[0].targetPath), ".fsd-refresh-"));
  try {
    const staged = await Promise.all(outputs.map(async (output, index) => {
      await mkdir(dirname(output.targetPath), { recursive: true });
      const stagePath = resolve(stageDirectory, `${index}-${basename(output.targetPath)}`);
      await writeFile(stagePath, output.contents);
      return { stagePath, targetPath: output.targetPath };
    }));
    await beforePromote();
    for (const output of staged) await rename(output.stagePath, output.targetPath);
  } finally {
    await rm(stageDirectory, { recursive: true, force: true });
  }
}

export function resolveAccessDate(args: string[], invokedAt = new Date()): string {
  const supplied = args.find((argument) => argument.startsWith("--access-date="))?.slice("--access-date=".length);
  if (supplied !== undefined) {
    const parsed = new Date(`${supplied}T00:00:00.000Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(supplied) || Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== supplied) {
      throw new Error("--access-date must be a valid YYYY-MM-DD date");
    }
    return supplied;
  }
  const year = invokedAt.getFullYear();
  const month = String(invokedAt.getMonth() + 1).padStart(2, "0");
  const day = String(invokedAt.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function main(args = process.argv.slice(2), invokedAt = new Date()) {
  const accessDate = resolveAccessDate(args, invokedAt);
  const manifestSources: Array<Record<string, string | number>> = [];
  const promotionOutputs: SnapshotPromotion[] = [];

  for (const source of SOURCES) {
    const response = await fetch(source.url, { headers: { accept: "text/csv,*/*" } });
    if (!response.ok) {
      throw new Error(`FSD snapshot failed for ${source.url}: ${response.status} ${response.statusText}`);
    }
    const raw = Buffer.from(await response.arrayBuffer());
    const snapshotPath = resolve(SNAPSHOT_DIR, source.file);
    if (source.compress) {
      const compressed = gzipDeterministic(raw);
      promotionOutputs.push({ targetPath: snapshotPath, contents: compressed });
      manifestSources.push({
        id: source.id,
        role: source.role,
        url: source.url,
        compressedPath: `research/landscape/snapshots/${source.file}`,
        accessedAt: accessDate,
        contentType: response.headers.get("content-type") ?? "application/octet-stream",
        compressedBytes: compressed.byteLength,
        compressedSha256: sha256(compressed),
        rawBytes: raw.byteLength,
        rawSha256: sha256(raw),
        compression: "gzip -n -9",
      });
    } else {
      promotionOutputs.push({ targetPath: snapshotPath, contents: raw });
      manifestSources.push({
        id: source.id,
        role: source.role,
        url: source.url,
        localPath: `research/landscape/snapshots/${source.file}`,
        accessedAt: accessDate,
        contentType: response.headers.get("content-type") ?? "text/csv",
        bytes: raw.byteLength,
        sha256: sha256(raw),
      });
    }
  }

  const profilePath = resolve(SNAPSHOT_DIR, "norway-fsd-profile-2026-08-10.json");
  const profile = await readFile(profilePath);
  JSON.parse(profile.toString("utf8"));
  manifestSources.push({
    id: "fsd-norway-profile-2026-08-10",
    role: "fsd_country_profile",
    url: "https://www.foodsystemsdashboard.org/countries/nor",
    localPath: "research/landscape/snapshots/norway-fsd-profile-2026-08-10.json",
    accessedAt: PROFILE_ACCESS_DATE,
    contentType: "application/json",
    bytes: profile.byteLength,
    sha256: sha256(profile),
  });

  const manifestPath = resolve(ROOT, `research/landscape/norway-fsd-snapshot-manifest-${accessDate}.json`);
  promotionOutputs.push({
    targetPath: manifestPath,
    contents: Buffer.from(`${JSON.stringify({ snapshotDate: accessDate, sources: manifestSources }, null, 2)}\n`, "utf8"),
  });
  await promoteSnapshotTransaction(promotionOutputs);
  console.log(`Frozen ${manifestSources.length} FSD sources in ${manifestPath}`);
}

const invokedPath = process.argv[1];
if (invokedPath && import.meta.url === pathToFileURL(invokedPath).href) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
