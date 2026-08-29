import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { gzipSync } from "node:zlib";

import { readVerifiedGzipSnapshot } from "../../scripts/lib/snapshot-integrity";

const sha256 = (value: Buffer) => createHash("sha256").update(value).digest("hex");

test("verified gzip snapshot enforces compressed and raw hashes", () => {
  const raw = Buffer.from("indicator,value\nA,1\n", "utf8");
  const compressed = gzipSync(raw, { level: 9 });
  const dir = mkdtempSync(path.join(tmpdir(), "fsd-snapshot-"));
  const file = path.join(dir, "fixture.csv.gz");
  writeFileSync(file, compressed);

  assert.deepEqual(readVerifiedGzipSnapshot(file, sha256(compressed), sha256(raw)), raw);
  assert.throws(() => readVerifiedGzipSnapshot(file, "0".repeat(64), sha256(raw)), /compressed SHA-256/);
  assert.throws(() => readVerifiedGzipSnapshot(file, sha256(compressed), "0".repeat(64)), /raw SHA-256/);
});
