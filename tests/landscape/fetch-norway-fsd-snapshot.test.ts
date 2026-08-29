import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { rename } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  assertRefreshTargetsAvailable,
  promoteSnapshotTransaction,
  resolveAccessDate,
} from "../../scripts/fetch-norway-fsd-snapshot";

test("frozen output collisions are rejected before promotion", () => {
  const frozenAccessDate = resolveAccessDate(["--access-date=2026-08-10"]);
  const frozenManifestPath = path.join(
    process.cwd(),
    `research/landscape/norway-fsd-snapshot-manifest-${frozenAccessDate}.json`,
  );
  const frozenBytes = readFileSync(frozenManifestPath);

  assert.throws(
    () => assertRefreshTargetsAvailable(
      [{ targetPath: frozenManifestPath }],
      frozenManifestPath,
    ),
    /frozen default/i,
  );
  assert.deepEqual(readFileSync(frozenManifestPath), frozenBytes);

  const directory = mkdtempSync(path.join(tmpdir(), "fsd-existing-set-"));
  const existingTarget = path.join(directory, "fsd-full-export-accessed-2026-09-01.csv.gz");
  writeFileSync(existingTarget, "existing frozen bytes");
  assert.throws(
    () => assertRefreshTargetsAvailable(
      [{ targetPath: existingTarget }],
      frozenManifestPath,
    ),
    /already exists/i,
  );
  assert.equal(readFileSync(existingTarget, "utf8"), "existing frozen bytes");
});

test("a pre-promotion failure leaves every governed snapshot target unchanged", async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "fsd-promotion-"));
  const first = path.join(directory, "first.csv.gz");
  const second = path.join(directory, "manifest.json");
  writeFileSync(first, "old-first");
  writeFileSync(second, "old-second");

  await assert.rejects(
    promoteSnapshotTransaction(
      [
        { targetPath: first, contents: Buffer.from("new-first") },
        { targetPath: second, contents: Buffer.from("new-second") },
      ],
      () => {
        throw new Error("simulated pre-promotion failure");
      },
    ),
    /simulated pre-promotion failure/,
  );

  assert.equal(readFileSync(first, "utf8"), "old-first");
  assert.equal(readFileSync(second, "utf8"), "old-second");
  assert.deepEqual(readdirSync(directory).sort(), ["first.csv.gz", "manifest.json"]);
});

test("access date reflects the invocation date unless explicitly supplied", () => {
  const invokedAt = new Date("2026-08-29T12:00:00.000Z");

  assert.equal(resolveAccessDate([], invokedAt), "2026-08-29");
  assert.equal(resolveAccessDate(["--access-date=2026-08-28"], invokedAt), "2026-08-28");
  assert.throws(() => resolveAccessDate(["--access-date=2026-02-30"], invokedAt), /valid YYYY-MM-DD/);
});

test("a mid-promotion rename failure restores replaced and previously absent targets", async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "fsd-rollback-"));
  const first = path.join(directory, "first.csv.gz");
  const second = path.join(directory, "second.csv");
  const third = path.join(directory, "manifest.json");
  writeFileSync(first, "old-first");
  writeFileSync(third, "old-third");

  await assert.rejects(
    promoteSnapshotTransaction(
      [
        { targetPath: first, contents: Buffer.from("new-first") },
        { targetPath: second, contents: Buffer.from("new-second") },
        { targetPath: third, contents: Buffer.from("new-third") },
      ],
      () => undefined,
      async (sourcePath, targetPath) => {
        if (path.basename(sourcePath).startsWith("staged-") && targetPath === third) {
          throw new Error("simulated mid-promotion rename failure");
        }
        await rename(sourcePath, targetPath);
      },
    ),
    /simulated mid-promotion rename failure/,
  );

  assert.equal(readFileSync(first, "utf8"), "old-first");
  assert.equal(existsSync(second), false);
  assert.equal(readFileSync(third, "utf8"), "old-third");
  assert.deepEqual(readdirSync(directory).sort(), ["first.csv.gz", "manifest.json"]);
});
