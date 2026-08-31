import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

const sha256 = (value: Buffer) => createHash("sha256").update(value).digest("hex");

export function readVerifiedGzipSnapshot(
  filePath: string,
  expectedCompressedSha256: string,
  expectedRawSha256: string,
): Buffer {
  const compressed = readFileSync(filePath);
  const compressedSha256 = sha256(compressed);
  if (compressedSha256 !== expectedCompressedSha256) {
    throw new Error(`compressed SHA-256 mismatch: ${compressedSha256}`);
  }
  const raw = gunzipSync(compressed);
  const rawSha256 = sha256(raw);
  if (rawSha256 !== expectedRawSha256) {
    throw new Error(`raw SHA-256 mismatch: ${rawSha256}`);
  }
  return raw;
}
