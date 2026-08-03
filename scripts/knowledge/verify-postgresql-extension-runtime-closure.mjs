#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  closeSync,
  constants,
  fstatSync,
  lstatSync,
  openSync,
  readFileSync,
  realpathSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_DOMAIN =
  "food-systems-2026:postgresql-extension-runtime-closure:v1\0";
export const POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_MANIFEST_PATH =
  "knowledge/corpus/source-registration/postgresql-extension-runtime-closure-darwin-arm64-2026-08-03.v1.json";
export const POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_MANIFEST_SHA256 =
  "4e70b953c0a69a8e320f4b091164fb13f834fb043a0fba95f04f804864ba11c4";
export const POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_SHA256 =
  "3b5540bc6b1d6fd25335b0f094470ee8da5214f09f04feabb583a06aa3b7487c";
const POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_MANIFEST_BYTES = 2872;
const POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_MANIFEST_MODE = "0644";

const MODULE_PATH = realpathSync(fileURLToPath(import.meta.url));
const PROJECT_ROOT = realpathSync(resolve(dirname(MODULE_PATH), "../.."));
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const EXPECTED_EXTENSION_NAMES = Object.freeze(["pg_trgm", "vector"]);

function fail(message) {
  throw new Error(`PostgreSQL extension runtime closure failed: ${message}`);
}

function canonical(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`)
    .join(",")}}`;
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function exactKeys(value, keys, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    fail(`${label} is invalid`);
  }
  if (
    JSON.stringify(Object.keys(value).sort()) !==
    JSON.stringify([...keys].sort())
  ) {
    fail(`${label} shape differs`);
  }
  return value;
}

function sameStableIdentity(left, right) {
  return (
    left.ctimeNs === right.ctimeNs &&
    left.dev === right.dev &&
    left.gid === right.gid &&
    left.ino === right.ino &&
    left.mode === right.mode &&
    left.mtimeNs === right.mtimeNs &&
    left.nlink === right.nlink &&
    left.size === right.size &&
    left.uid === right.uid
  );
}

function readStableExactFile(path, expected) {
  if (typeof path !== "string" || realpathSync(path) !== path) {
    fail("runtime file path differs");
  }
  const pathStats = lstatSync(path, { bigint: true });
  if (
    !pathStats.isFile() ||
    pathStats.isSymbolicLink() ||
    pathStats.nlink !== 1n ||
    (Number(pathStats.mode) & 0o777).toString(8).padStart(4, "0") !==
      expected.mode ||
    pathStats.size !== BigInt(expected.bytes)
  ) {
    fail("runtime file identity differs");
  }
  let descriptor;
  try {
    descriptor = openSync(
      path,
      constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
    );
    const before = fstatSync(descriptor, { bigint: true });
    if (!sameStableIdentity(pathStats, before)) {
      fail("runtime file changed before read");
    }
    const bytes = readFileSync(descriptor);
    const after = fstatSync(descriptor, { bigint: true });
    if (
      !sameStableIdentity(before, after) ||
      bytes.length !== expected.bytes ||
      sha256(bytes) !== expected.sha256
    ) {
      fail("runtime file bytes differ");
    }
    return bytes;
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
  }
}

export function verifyPostgresqlExtensionRuntimeClosure({
  expectedClosureSha256 = POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_SHA256,
  expectedManifestSha256 = POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_MANIFEST_SHA256,
  manifestPath = resolve(
    PROJECT_ROOT,
    POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_MANIFEST_PATH,
  ),
} = {}) {
  if (
    !SHA256_PATTERN.test(expectedClosureSha256) ||
    !SHA256_PATTERN.test(expectedManifestSha256)
  ) {
    fail("expected hashes are invalid");
  }
  const canonicalManifestPath = realpathSync(manifestPath);
  if (canonicalManifestPath !== manifestPath) {
    fail("manifest path differs");
  }
  const manifestBytes = readStableExactFile(canonicalManifestPath, {
    bytes: POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_MANIFEST_BYTES,
    mode: POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_MANIFEST_MODE,
    sha256: expectedManifestSha256,
  });
  const manifestSha256 = sha256(manifestBytes);
  if (manifestSha256 !== expectedManifestSha256) {
    fail("manifest hash differs");
  }
  let manifest;
  try {
    manifest = JSON.parse(manifestBytes.toString("utf8"));
  } catch {
    fail("manifest JSON differs");
  }
  exactKeys(
    manifest,
    [
      "architecture",
      "closureSha256",
      "extensions",
      "files",
      "format",
      "platform",
      "postgresServerVersionNum",
      "resolution",
      "version",
    ],
    "manifest",
  );
  if (
    manifest.format !== "foodsystems-postgresql-extension-runtime-closure" ||
    manifest.version !== 1 ||
    manifest.platform !== process.platform ||
    manifest.architecture !== process.arch ||
    manifest.postgresServerVersionNum !== "160013" ||
    manifest.resolution !== "exact-install-control-sql-native-library-bytes" ||
    manifest.closureSha256 !== expectedClosureSha256 ||
    !Array.isArray(manifest.extensions) ||
    !Array.isArray(manifest.files) ||
    manifest.files.length !== 9
  ) {
    fail("manifest facts differ");
  }
  const names = manifest.extensions.map((extension) => {
    exactKeys(extension, ["comment", "name", "schema", "version"], "extension");
    if (
      extension.schema !== "public" ||
      typeof extension.comment !== "string" ||
      typeof extension.version !== "string"
    ) {
      fail("extension declaration differs");
    }
    return extension.name;
  });
  if (canonical(names) !== canonical(EXPECTED_EXTENSION_NAMES)) {
    fail("extension set differs");
  }
  const sortedPaths = [...manifest.files]
    .map((entry) => {
      exactKeys(entry, ["bytes", "mode", "path", "sha256"], "runtime file");
      if (
        !Number.isSafeInteger(entry.bytes) ||
        entry.bytes <= 0 ||
        !/^[0-7]{4}$/.test(entry.mode) ||
        !SHA256_PATTERN.test(entry.sha256)
      ) {
        fail("runtime file declaration differs");
      }
      readStableExactFile(entry.path, entry);
      return entry.path;
    })
    .sort();
  if (canonical(sortedPaths) !== canonical(manifest.files.map((x) => x.path))) {
    fail("runtime file order differs");
  }
  const { closureSha256: declaredClosureSha256, ...body } = manifest;
  const computedClosureSha256 = sha256(
    `${POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_DOMAIN}${canonical(body)}`,
  );
  if (
    declaredClosureSha256 !== computedClosureSha256 ||
    computedClosureSha256 !== expectedClosureSha256
  ) {
    fail("runtime closure hash differs");
  }
  return Object.freeze({
    closureSha256: computedClosureSha256,
    extensions: manifest.extensions,
    fileCount: manifest.files.length,
    manifestSha256,
  });
}

const invoked = process.argv[1]
  ? pathToFileURL(realpathSync(process.argv[1])).href
  : null;
if (invoked === import.meta.url) {
  try {
    const result = verifyPostgresqlExtensionRuntimeClosure();
    process.stdout.write(
      `${JSON.stringify({
        closureSha256: result.closureSha256,
        fileCount: result.fileCount,
        manifestSha256: result.manifestSha256,
        status: "pass",
      })}\n`,
    );
  } catch {
    process.stderr.write(
      "[postgresql-extension-runtime-closure] ERROR VERIFICATION_FAILED\n",
    );
    process.exitCode = 1;
  }
}
