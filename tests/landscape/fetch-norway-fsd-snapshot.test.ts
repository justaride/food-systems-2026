import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  promoteSnapshotTransaction,
  resolveAccessDate,
} from "../../scripts/fetch-norway-fsd-snapshot";

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
