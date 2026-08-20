#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  closeSync,
  constants,
  createReadStream,
  fstatSync,
  lstatSync,
  openSync,
  readFileSync,
  readdirSync,
  realpathSync,
} from "node:fs";
import { basename, dirname, isAbsolute } from "node:path";

export const POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_FORMAT =
  "foodsystems-postgresql-toolset-runtime-closure";
export const POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_VERSION = 2;
export const POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_DOMAIN =
  "food-systems-2026:postgresql-toolset-runtime-closure:v2\0";
export const POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_SHA256 =
  "a77c02d31b0daf8f02e81eabc15f30aebc7b2a7fd3b9d045dddb2940b7d0db39";
export const POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_MANIFEST_PATH =
  "knowledge/corpus/source-registration/psql-runtime-closure-darwin-arm64-2026-08-20.v1.json";
export const POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_MANIFEST_SHA256 =
  "3047d302cc81c27ebbbbf1a40577091d0154509b13b9a4a8520c033e353a9c09";

// Compatibility exports keep the wider source-registration contract stable.
// The bound closure is now the complete four-binary PostgreSQL toolset.
export const PSQL_RUNTIME_CLOSURE_FORMAT =
  POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_FORMAT;
export const PSQL_RUNTIME_CLOSURE_VERSION =
  POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_VERSION;
export const PSQL_RUNTIME_CLOSURE_DOMAIN =
  POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_DOMAIN;
export const PSQL_RUNTIME_CLOSURE_SHA256 =
  POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_SHA256;
export const PSQL_RUNTIME_CLOSURE_MANIFEST_PATH =
  POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_MANIFEST_PATH;
export const PSQL_RUNTIME_CLOSURE_MANIFEST_SHA256 =
  POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_MANIFEST_SHA256;

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
const POSTGRESQL_TOOL_NAMES = Object.freeze([
  "createdb",
  "dropdb",
  "pg_restore",
  "psql",
]);
const MACHO_MAGIC_64_LE = 0xfeedfacf;
const MACHO_CPU_TYPE_ARM64 = 0x0100000c;
const MACHO_HEADER_64_BYTES = 32;
const MACHO_LOAD_DYLIB_COMMANDS = new Set([
  0x0c, // LC_LOAD_DYLIB
  0x20, // LC_LAZY_LOAD_DYLIB
  0x80000018, // LC_LOAD_WEAK_DYLIB
  0x8000001f, // LC_REEXPORT_DYLIB
  0x80000023, // LC_LOAD_UPWARD_DYLIB
]);

function fail(message) {
  throw new Error(
    `PostgreSQL toolset runtime-closure verification failed: ${message}`,
  );
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

function byteSort(left, right) {
  return Buffer.compare(Buffer.from(left), Buffer.from(right));
}

function assertSortedUnique(values, label, select) {
  const selected = values.map(select);
  const sorted = [...selected].sort(byteSort);
  if (
    new Set(selected).size !== selected.length ||
    canonicalPsqlRuntimeClosureJson(selected) !==
      canonicalPsqlRuntimeClosureJson(sorted)
  ) {
    fail(`${label} is not unique and byte-sorted`);
  }
}

function sameFileIdentity(left, right) {
  return (
    left.dev === right.dev &&
    left.ino === right.ino &&
    left.mode === right.mode &&
    left.nlink === right.nlink &&
    left.size === right.size &&
    left.mtimeNs === right.mtimeNs
  );
}

function canonicalSingleLinkFile(path, label) {
  if (typeof path !== "string" || !isAbsolute(path)) {
    fail(`${label} path must be absolute`);
  }
  let realPath;
  let stats;
  try {
    realPath = realpathSync(path);
    stats = lstatSync(realPath, { bigint: true });
  } catch {
    fail(`${label} is missing or unreadable`);
  }
  if (
    realPath !== path ||
    !stats.isFile() ||
    stats.isSymbolicLink() ||
    stats.nlink !== 1n
  ) {
    fail(`${label} is not the canonical regular single-link file`);
  }
  return { realPath, stats };
}

function readStableManifest(path) {
  const expected = canonicalSingleLinkFile(path, "manifest");
  let descriptor;
  try {
    descriptor = openSync(
      expected.realPath,
      constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
    );
    const before = fstatSync(descriptor, { bigint: true });
    if (!sameFileIdentity(expected.stats, before)) {
      fail("manifest changed before it was read");
    }
    const bytes = readFileSync(descriptor);
    const after = fstatSync(descriptor, { bigint: true });
    const pathAfter = lstatSync(expected.realPath, { bigint: true });
    if (
      !sameFileIdentity(before, after) ||
      !sameFileIdentity(after, pathAfter) ||
      bytes.length !== Number(before.size)
    ) {
      fail("manifest changed while it was read");
    }
    return bytes;
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
  }
}

async function fileFacts(path, label, { includeBytes = false } = {}) {
  const expected = canonicalSingleLinkFile(path, label);
  let descriptor;
  try {
    descriptor = openSync(
      expected.realPath,
      constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
    );
    const before = fstatSync(descriptor, { bigint: true });
    if (!sameFileIdentity(expected.stats, before)) {
      fail(`${label} changed before it was hashed`);
    }
    const hash = createHash("sha256");
    const chunks = [];
    let bytes = 0;
    const stream = createReadStream(expected.realPath, {
      autoClose: false,
      fd: descriptor,
      start: 0,
    });
    for await (const chunk of stream) {
      hash.update(chunk);
      if (includeBytes) chunks.push(chunk);
      bytes += chunk.length;
    }
    const after = fstatSync(descriptor, { bigint: true });
    const pathAfter = lstatSync(expected.realPath, { bigint: true });
    if (
      !sameFileIdentity(before, after) ||
      !sameFileIdentity(after, pathAfter) ||
      BigInt(bytes) !== before.size
    ) {
      fail(`${label} changed while it was hashed`);
    }
    return {
      bytes,
      fileBytes: includeBytes ? Buffer.concat(chunks, bytes) : undefined,
      mode: before.mode,
      sha256: hash.digest("hex"),
    };
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
  }
}

function readMachOCString(bytes, start, end, label) {
  if (start < 0 || start >= end || end > bytes.length) {
    fail(`${label} string offset is outside its load command`);
  }
  const nul = bytes.indexOf(0, start);
  if (nul < start || nul >= end || nul === start) {
    fail(`${label} string is not a terminated non-empty value`);
  }
  const valueBytes = bytes.subarray(start, nul);
  if ([...valueBytes].some((byte) => byte < 0x20 || byte > 0x7e)) {
    fail(`${label} string is not controlled ASCII`);
  }
  return valueBytes.toString("ascii");
}

/**
 * Builtins-only Mach-O dependency parser. It deliberately accepts only the
 * pinned thin arm64 64-bit shape; no host inspection executable participates.
 */
export function parseArm64MachOLoadedDylibs(bytes, label = "Mach-O object") {
  if (!Buffer.isBuffer(bytes) || bytes.length < MACHO_HEADER_64_BYTES) {
    fail(`${label} is not a complete Mach-O header`);
  }
  if (
    bytes.readUInt32LE(0) !== MACHO_MAGIC_64_LE ||
    bytes.readUInt32LE(4) !== MACHO_CPU_TYPE_ARM64
  ) {
    fail(`${label} is not a thin arm64 Mach-O object`);
  }
  const commandCount = bytes.readUInt32LE(16);
  const commandBytes = bytes.readUInt32LE(20);
  if (
    commandCount === 0 ||
    commandCount > 4096 ||
    commandBytes === 0 ||
    MACHO_HEADER_64_BYTES + commandBytes > bytes.length
  ) {
    fail(`${label} has an invalid load-command table`);
  }
  const dependencies = [];
  let cursor = MACHO_HEADER_64_BYTES;
  const commandsEnd = MACHO_HEADER_64_BYTES + commandBytes;
  for (let index = 0; index < commandCount; index += 1) {
    if (cursor + 8 > commandsEnd) {
      fail(`${label} load command ${index + 1} is truncated`);
    }
    const command = bytes.readUInt32LE(cursor);
    const commandSize = bytes.readUInt32LE(cursor + 4);
    if (
      commandSize < 8 ||
      commandSize % 4 !== 0 ||
      cursor + commandSize > commandsEnd
    ) {
      fail(`${label} load command ${index + 1} has an invalid size`);
    }
    if (MACHO_LOAD_DYLIB_COMMANDS.has(command)) {
      if (commandSize < 24) {
        fail(`${label} dylib command ${index + 1} is truncated`);
      }
      const pathOffset = bytes.readUInt32LE(cursor + 8);
      if (pathOffset < 24 || pathOffset >= commandSize) {
        fail(`${label} dylib command ${index + 1} has an invalid path offset`);
      }
      dependencies.push(
        readMachOCString(
          bytes,
          cursor + pathOffset,
          cursor + commandSize,
          `${label} dylib command ${index + 1}`,
        ),
      );
    }
    cursor += commandSize;
  }
  if (
    cursor !== commandsEnd ||
    new Set(dependencies).size !== dependencies.length
  ) {
    fail(`${label} load-command table is not exact and dependency-unique`);
  }
  return Object.freeze([...dependencies]);
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
      "toolRoots",
      "version",
    ],
    "manifest",
  );
  if (
    manifest.format !== POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_FORMAT ||
    manifest.version !== POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_VERSION ||
    manifest.platform !== "darwin" ||
    manifest.architecture !== "arm64" ||
    manifest.psqlVersion !== "psql (PostgreSQL) 16.13 (Homebrew)" ||
    manifest.resolution !==
      "recursive_builtin_macho_load_commands_non_system_bytes_plus_complete_arm64e_dyld_subcache_set"
  ) {
    fail("manifest identity is invalid");
  }
  sha256(manifest.closureSha256, "manifest closureSha256");
  if (
    !Array.isArray(manifest.toolRoots) ||
    manifest.toolRoots.length !== POSTGRESQL_TOOL_NAMES.length
  ) {
    fail("manifest must contain exactly four PostgreSQL tool roots");
  }
  if (
    !Array.isArray(manifest.loaderAliases) ||
    manifest.loaderAliases.length !== 17
  ) {
    fail("manifest must contain exactly 17 loader aliases");
  }
  if (
    !Array.isArray(manifest.homebrewObjects) ||
    manifest.homebrewObjects.length !== 16
  ) {
    fail("manifest must contain exactly 16 Homebrew objects");
  }
  if (
    !Array.isArray(manifest.systemDylibReferences) ||
    manifest.systemDylibReferences.length !== 9
  ) {
    fail("manifest must contain exactly nine system dylib references");
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
      `Homebrew object ${index + 1}`,
    );
    if (
      typeof object.path !== "string" ||
      !object.path.startsWith("/opt/homebrew/Cellar/")
    ) {
      fail(`Homebrew object ${index + 1} path is invalid`);
    }
    positiveInteger(object.bytes, `Homebrew object ${index + 1} bytes`);
    sha256(object.sha256, `Homebrew object ${index + 1} sha256`);
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

  const toolRoots = manifest.toolRoots.map((entry, index) => {
    const root = exactObject(
      entry,
      ["loaderPath", "name", "realPath"],
      `tool root ${index + 1}`,
    );
    const expectedName = POSTGRESQL_TOOL_NAMES[index];
    if (
      root.name !== expectedName ||
      root.loaderPath !== `/opt/homebrew/bin/${expectedName}` ||
      root.realPath !==
        `/opt/homebrew/Cellar/postgresql@16/16.13/bin/${expectedName}` ||
      !objectPaths.has(root.realPath)
    ) {
      fail(`tool root ${index + 1} is invalid`);
    }
    return root;
  });
  assertSortedUnique(toolRoots, "tool roots", (entry) => entry.name);

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
  return { manifest, aliases, objects, cacheFiles, toolRoots };
}

function assertRecursiveMachOGraph({
  aliases,
  objectFacts,
  objects,
  manifest,
  toolRoots,
}) {
  const aliasesByLoaderPath = new Map(
    aliases.map((entry) => [entry.loaderPath, entry.realPath]),
  );
  const expectedObjectPaths = new Set(objects.map((entry) => entry.path));
  const expectedAliasPairs = new Set(
    aliases.map((entry) => `${entry.loaderPath}\0${entry.realPath}`),
  );
  const observedAliasPairs = new Set(
    toolRoots.map((entry) => `${entry.loaderPath}\0${entry.realPath}`),
  );
  const observedSystemReferences = new Set();
  const visited = new Set();
  const queue = toolRoots.map((entry) => entry.realPath);
  while (queue.length > 0) {
    const objectPath = queue.shift();
    if (visited.has(objectPath)) continue;
    if (!expectedObjectPaths.has(objectPath)) {
      fail("recursive Mach-O graph escaped the manifest object set");
    }
    visited.add(objectPath);
    const facts = objectFacts.get(objectPath);
    const dependencies = parseArm64MachOLoadedDylibs(
      facts.fileBytes,
      `runtime object ${visited.size}`,
    );
    for (const dependency of dependencies) {
      if (dependency.startsWith("/opt/homebrew/")) {
        const realPath = aliasesByLoaderPath.get(dependency);
        if (!realPath) {
          fail("a Homebrew Mach-O dependency is absent from loader aliases");
        }
        observedAliasPairs.add(`${dependency}\0${realPath}`);
        queue.push(realPath);
      } else if (
        dependency.startsWith("/usr/lib/") ||
        dependency.startsWith("/System/Library/")
      ) {
        observedSystemReferences.add(dependency);
      } else {
        fail("a Mach-O dependency uses an unsupported loader resolution form");
      }
    }
  }
  if (
    canonicalPsqlRuntimeClosureJson([...visited].sort(byteSort)) !==
      canonicalPsqlRuntimeClosureJson(
        [...expectedObjectPaths].sort(byteSort),
      ) ||
    canonicalPsqlRuntimeClosureJson([...observedAliasPairs].sort(byteSort)) !==
      canonicalPsqlRuntimeClosureJson([...expectedAliasPairs].sort(byteSort)) ||
    canonicalPsqlRuntimeClosureJson(
      [...observedSystemReferences].sort(byteSort),
    ) !== canonicalPsqlRuntimeClosureJson(manifest.systemDylibReferences)
  ) {
    fail("manifest is not the exact recursive Mach-O dependency graph");
  }
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
    expectedManifestSha256 !==
      POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_MANIFEST_SHA256 ||
    expectedClosureSha256 !== POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_SHA256
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
  const { manifest, aliases, objects, cacheFiles, toolRoots } =
    parseManifest(manifestBytes);
  const { closureSha256, ...body } = manifest;
  const computedClosureSha256 = psqlRuntimeClosureSha256(
    `${POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_DOMAIN}${canonicalPsqlRuntimeClosureJson(body)}`,
  );
  if (
    closureSha256 !== POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_SHA256 ||
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
    if (actual !== alias.realPath) {
      fail(`loader alias ${index + 1} was redirected`);
    }
  }
  const actualCacheNames = readdirSync(SYSTEM_CACHE_ROOT)
    .filter((name) => SYSTEM_CACHE_FILE_PATTERN.test(name))
    .sort(byteSort);
  const expectedCacheNames = cacheFiles.map((entry) => basename(entry.path));
  if (
    canonicalPsqlRuntimeClosureJson(actualCacheNames) !==
    canonicalPsqlRuntimeClosureJson(expectedCacheNames)
  ) {
    fail("the active arm64e dyld subcache set differs from the manifest");
  }

  const objectFacts = new Map();
  let totalBytes = 0;
  for (const [index, entry] of objects.entries()) {
    const facts = await fileFacts(entry.path, `runtime object ${index + 1}`, {
      includeBytes: true,
    });
    if (facts.bytes !== entry.bytes || facts.sha256 !== entry.sha256) {
      fail(`runtime object ${index + 1} bytes differ from the manifest`);
    }
    objectFacts.set(entry.path, facts);
    totalBytes += facts.bytes;
  }
  assertRecursiveMachOGraph({
    aliases,
    manifest,
    objectFacts,
    objects,
    toolRoots,
  });
  for (const [index, entry] of cacheFiles.entries()) {
    const facts = await fileFacts(entry.path, `dyld cache file ${index + 1}`);
    if (facts.bytes !== entry.bytes || facts.sha256 !== entry.sha256) {
      fail(`dyld cache file ${index + 1} bytes differ from the manifest`);
    }
    totalBytes += facts.bytes;
  }

  const rootsByName = new Map(toolRoots.map((entry) => [entry.name, entry]));
  const objectByPath = new Map(objects.map((entry) => [entry.path, entry]));
  const toolFileSha256 = Object.freeze({
    createdb: objectByPath.get(rootsByName.get("createdb").realPath).sha256,
    dropdb: objectByPath.get(rootsByName.get("dropdb").realPath).sha256,
    pgRestore: objectByPath.get(rootsByName.get("pg_restore").realPath).sha256,
    psql: objectByPath.get(rootsByName.get("psql").realPath).sha256,
  });
  return Object.freeze({
    manifestSha256,
    closureSha256,
    platform: manifest.platform,
    architecture: manifest.architecture,
    psqlVersion: manifest.psqlVersion,
    psqlFileSha256: toolFileSha256.psql,
    toolFileSha256,
    toolBinaryCount: toolRoots.length,
    homebrewObjectCount: objects.length,
    loaderAliasCount: aliases.length,
    systemDylibReferenceCount: manifest.systemDylibReferences.length,
    dyldCacheFileCount: cacheFiles.length,
    totalRuntimeBytes: totalBytes,
    forbiddenLoaderEnvironmentPresent: false,
  });
}
