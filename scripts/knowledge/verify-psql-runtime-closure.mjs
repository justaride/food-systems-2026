#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  createReadStream,
  fstatSync,
  lstatSync,
  openSync,
  closeSync,
  readFileSync,
  readdirSync,
  realpathSync,
} from "node:fs";
import { basename, dirname, isAbsolute } from "node:path";

export const PSQL_RUNTIME_CLOSURE_FORMAT = "foodsystems-psql-runtime-closure";
export const PSQL_RUNTIME_CLOSURE_VERSION = 1;
export const PSQL_RUNTIME_CLOSURE_DOMAIN =
  "food-systems-2026:psql-runtime-closure:v1\0";
export const PSQL_RUNTIME_CLOSURE_SHA256 =
  "993193f3570f3ebad21b69af81c8099edf1bfa7f23492d6e9e489e7a351368aa";
export const PSQL_RUNTIME_CLOSURE_MANIFEST_PATH =
  "knowledge/corpus/source-registration/psql-runtime-closure-darwin-arm64-2026-08-03.v1.json";
export const PSQL_RUNTIME_CLOSURE_MANIFEST_SHA256 =
  "d06073d91bb7da04318b0a95ce2d482369f336af69599cca7daa14fa614819e6";

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const SYSTEM_CACHE_ROOT =
  "/System/Volumes/Preboot/Cryptexes/OS/System/Library/dyld";
const SYSTEM_CACHE_FILE_PATTERN =
  /^dyld_shared_cache_arm64e(?:\.(?:\d+)(?:\.(?:dylddata|dyldreadonly|dyldlinkedit))?)?$/;
const FORBIDDEN_LOADER_ENVIRONMENT = [
  "DYLD_FRAMEWORK_PATH",
  "DYLD_FALLBACK_FRAMEWORK_PATH",
  "DYLD_FALLBACK_LIBRARY_PATH",
  "DYLD_INSERT_LIBRARIES",
  "DYLD_LIBRARY_PATH",
  "LD_LIBRARY_PATH",
  "LD_PRELOAD",
];

function fail(message) {
  throw new Error(`psql runtime-closure verification failed: ${message}`);
}

export function canonicalPsqlRuntimeClosureJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalPsqlRuntimeClosureJson(item)).join(",")}]`;
  }
  return `{${Object.keys(value)
    .sort()
    .map(
      (key) =>
        `${JSON.stringify(key)}:${canonicalPsqlRuntimeClosureJson(value[key])}`,
    )
    .join(",")}}`;
}

export function psqlRuntimeClosureSha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function exactObject(value, keys, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    fail(`${label} must be an object`);
  }
  if (
    canonicalPsqlRuntimeClosureJson(Object.keys(value).sort()) !==
    canonicalPsqlRuntimeClosureJson([...keys].sort())
  ) {
    fail(`${label} has an unexpected shape`);
  }
  return value;
}

function sha256(value, label) {
  if (typeof value !== "string" || !SHA256_PATTERN.test(value)) {
    fail(`${label} is not SHA-256`);
  }
  return value;
}

function positiveInteger(value, label) {
  if (!Number.isSafeInteger(value) || value <= 0) fail(`${label} is invalid`);
  return value;
}

function assertSortedUnique(values, label, select) {
  const selected = values.map(select);
  const sorted = [...selected].sort((left, right) =>
    Buffer.compare(Buffer.from(left), Buffer.from(right)),
  );
  if (
    new Set(selected).size !== selected.length ||
    canonicalPsqlRuntimeClosureJson(selected) !==
      canonicalPsqlRuntimeClosureJson(sorted)
  ) {
    fail(`${label} is not unique and byte-sorted`);
  }
}

function readStableManifest(path) {
  if (typeof path !== "string" || !isAbsolute(path)) {
    fail("manifest path must be absolute");
  }
  let stats;
  try {
    stats = lstatSync(path);
  } catch {
    fail("manifest is missing or unreadable");
  }
  if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) {
    fail("manifest is not a regular single-link file");
  }
  const descriptor = openSync(path, "r");
  try {
    const before = fstatSync(descriptor, { bigint: true });
    const bytes = readFileSync(descriptor);
    const after = fstatSync(descriptor, { bigint: true });
    if (
      before.dev !== after.dev ||
      before.ino !== after.ino ||
      before.size !== after.size ||
      before.mtimeNs !== after.mtimeNs ||
      bytes.length !== Number(before.size)
    ) {
      fail("manifest changed while it was read");
    }
    return bytes;
  } finally {
    closeSync(descriptor);
  }
}

async function fileFacts(path, label) {
  let realPath;
  let stats;
  try {
    realPath = realpathSync(path);
    stats = lstatSync(realPath);
  } catch {
    fail(`${label} is missing or unreadable`);
  }
  if (
    realPath !== path ||
    !stats.isFile() ||
    stats.isSymbolicLink() ||
    stats.nlink !== 1
  ) {
    fail(`${label} is not the canonical regular file`);
  }
  const hash = createHash("sha256");
  let bytes = 0;
  for await (const chunk of createReadStream(realPath)) {
    hash.update(chunk);
    bytes += chunk.length;
  }
  const after = lstatSync(realPath);
  if (
    after.dev !== stats.dev ||
    after.ino !== stats.ino ||
    after.size !== stats.size ||
    after.mtimeMs !== stats.mtimeMs ||
    bytes !== stats.size
  ) {
    fail(`${label} changed while it was hashed`);
  }
  return { bytes, sha256: hash.digest("hex") };
}

function parseManifest(bytes) {
  let value;
  try {
    value = JSON.parse(bytes.toString("utf8"));
  } catch {
    fail("manifest is not JSON");
  }
  const manifest = exactObject(
    value,
    [
      "architecture",
      "closureSha256",
      "format",
      "homebrewObjects",
      "loaderAliases",
      "platform",
      "psqlVersion",
      "resolution",
      "systemDyldCache",
      "systemDylibReferences",
      "version",
    ],
    "manifest",
  );
  if (
    manifest.format !== PSQL_RUNTIME_CLOSURE_FORMAT ||
    manifest.version !== PSQL_RUNTIME_CLOSURE_VERSION ||
    manifest.platform !== "darwin" ||
    manifest.architecture !== "arm64" ||
    manifest.psqlVersion !== "psql (PostgreSQL) 16.13 (Homebrew)" ||
    manifest.resolution !==
      "recursive_macho_load_commands_non_system_bytes_plus_complete_arm64e_dyld_subcache_set"
  ) {
    fail("manifest identity is invalid");
  }
  sha256(manifest.closureSha256, "manifest closureSha256");
  if (
    !Array.isArray(manifest.loaderAliases) ||
    manifest.loaderAliases.length !== 16
  ) {
    fail("manifest must contain exactly 16 loader aliases");
  }
  if (
    !Array.isArray(manifest.homebrewObjects) ||
    manifest.homebrewObjects.length !== 11
  ) {
    fail("manifest must contain exactly 11 Homebrew objects");
  }
  if (
    !Array.isArray(manifest.systemDylibReferences) ||
    manifest.systemDylibReferences.length !== 8
  ) {
    fail("manifest must contain exactly eight system dylib references");
  }
  const cache = exactObject(
    manifest.systemDyldCache,
    ["files", "root"],
    "systemDyldCache",
  );
  if (
    cache.root !== SYSTEM_CACHE_ROOT ||
    !Array.isArray(cache.files) ||
    cache.files.length !== 13
  ) {
    fail("system dyld cache scope is invalid");
  }

  const objects = manifest.homebrewObjects.map((entry, index) => {
    const object = exactObject(
      entry,
      ["bytes", "path", "sha256"],
      `homebrew object ${index + 1}`,
    );
    if (
      typeof object.path !== "string" ||
      !object.path.startsWith("/opt/homebrew/Cellar/")
    ) {
      fail(`homebrew object ${index + 1} path is invalid`);
    }
    positiveInteger(object.bytes, `homebrew object ${index + 1} bytes`);
    sha256(object.sha256, `homebrew object ${index + 1} sha256`);
    return object;
  });
  assertSortedUnique(objects, "Homebrew objects", (entry) => entry.path);
  const objectPaths = new Set(objects.map((entry) => entry.path));

  const aliases = manifest.loaderAliases.map((entry, index) => {
    const alias = exactObject(
      entry,
      ["loaderPath", "realPath"],
      `loader alias ${index + 1}`,
    );
    if (
      typeof alias.loaderPath !== "string" ||
      !alias.loaderPath.startsWith("/opt/homebrew/") ||
      typeof alias.realPath !== "string" ||
      !objectPaths.has(alias.realPath)
    ) {
      fail(`loader alias ${index + 1} is invalid`);
    }
    return alias;
  });
  assertSortedUnique(aliases, "loader aliases", (entry) => entry.loaderPath);

  for (const [index, reference] of manifest.systemDylibReferences.entries()) {
    if (
      typeof reference !== "string" ||
      (!reference.startsWith("/usr/lib/") &&
        !reference.startsWith("/System/Library/"))
    ) {
      fail(`system dylib reference ${index + 1} is invalid`);
    }
  }
  assertSortedUnique(
    manifest.systemDylibReferences,
    "system dylib references",
    (entry) => entry,
  );

  const cacheFiles = cache.files.map((entry, index) => {
    const file = exactObject(
      entry,
      ["bytes", "path", "sha256"],
      `dyld cache file ${index + 1}`,
    );
    if (
      typeof file.path !== "string" ||
      dirname(file.path) !== SYSTEM_CACHE_ROOT ||
      !SYSTEM_CACHE_FILE_PATTERN.test(basename(file.path))
    ) {
      fail(`dyld cache file ${index + 1} path is invalid`);
    }
    positiveInteger(file.bytes, `dyld cache file ${index + 1} bytes`);
    sha256(file.sha256, `dyld cache file ${index + 1} sha256`);
    return file;
  });
  assertSortedUnique(cacheFiles, "dyld cache files", (entry) => entry.path);
  return { manifest, aliases, objects, cacheFiles };
}

/**
 * @param {{ manifestPath: string, expectedManifestSha256: string, expectedClosureSha256: string }} input
 */
export async function verifyPsqlRuntimeClosure({
  manifestPath,
  expectedManifestSha256,
  expectedClosureSha256,
}) {
  sha256(expectedManifestSha256, "expected manifest SHA-256");
  sha256(expectedClosureSha256, "expected closure SHA-256");
  if (
    expectedManifestSha256 !== PSQL_RUNTIME_CLOSURE_MANIFEST_SHA256 ||
    expectedClosureSha256 !== PSQL_RUNTIME_CLOSURE_SHA256
  ) {
    fail("caller expected bindings differ from the pinned runtime closure");
  }
  if (process.platform !== "darwin" || process.arch !== "arm64") {
    fail("runtime platform is not the pinned darwin arm64 target");
  }
  for (const name of FORBIDDEN_LOADER_ENVIRONMENT) {
    if (process.env[name]) fail(`forbidden loader environment is set: ${name}`);
  }
  const manifestBytes = readStableManifest(manifestPath);
  const manifestSha256 = psqlRuntimeClosureSha256(manifestBytes);
  if (manifestSha256 !== expectedManifestSha256) {
    fail("manifest SHA-256 differs from expected");
  }
  const { manifest, aliases, objects, cacheFiles } =
    parseManifest(manifestBytes);
  const { closureSha256, ...body } = manifest;
  const computedClosureSha256 = psqlRuntimeClosureSha256(
    `${PSQL_RUNTIME_CLOSURE_DOMAIN}${canonicalPsqlRuntimeClosureJson(body)}`,
  );
  if (
    closureSha256 !== PSQL_RUNTIME_CLOSURE_SHA256 ||
    closureSha256 !== expectedClosureSha256 ||
    computedClosureSha256 !== closureSha256
  ) {
    fail("runtime closure self-hash or expected binding differs");
  }

  for (const [index, alias] of aliases.entries()) {
    let actual;
    try {
      actual = realpathSync(alias.loaderPath);
    } catch {
      fail(`loader alias ${index + 1} is missing or unreadable`);
    }
    if (actual !== alias.realPath)
      fail(`loader alias ${index + 1} was redirected`);
  }
  const actualCacheNames = readdirSync(SYSTEM_CACHE_ROOT)
    .filter((name) => SYSTEM_CACHE_FILE_PATTERN.test(name))
    .sort((left, right) =>
      Buffer.compare(Buffer.from(left), Buffer.from(right)),
    );
  const expectedCacheNames = cacheFiles.map((entry) => basename(entry.path));
  if (
    canonicalPsqlRuntimeClosureJson(actualCacheNames) !==
    canonicalPsqlRuntimeClosureJson(expectedCacheNames)
  ) {
    fail("the active arm64e dyld subcache set differs from the manifest");
  }

  let totalBytes = 0;
  for (const [index, entry] of [...objects, ...cacheFiles].entries()) {
    const facts = await fileFacts(entry.path, `runtime object ${index + 1}`);
    if (facts.bytes !== entry.bytes || facts.sha256 !== entry.sha256) {
      fail(`runtime object ${index + 1} bytes differ from the manifest`);
    }
    totalBytes += facts.bytes;
  }
  const psql = objects.find((entry) => entry.path.endsWith("/bin/psql"));
  if (!psql) fail("psql root object is absent");
  return Object.freeze({
    manifestSha256,
    closureSha256,
    platform: manifest.platform,
    architecture: manifest.architecture,
    psqlVersion: manifest.psqlVersion,
    psqlFileSha256: psql.sha256,
    homebrewObjectCount: objects.length,
    loaderAliasCount: aliases.length,
    systemDylibReferenceCount: manifest.systemDylibReferences.length,
    dyldCacheFileCount: cacheFiles.length,
    totalRuntimeBytes: totalBytes,
    forbiddenLoaderEnvironmentPresent: false,
  });
}
