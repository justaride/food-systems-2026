#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  closeSync,
  createReadStream,
  fstatSync,
  lstatSync,
  openSync,
  readFileSync,
  realpathSync,
} from "node:fs";
import { isAbsolute } from "node:path";

export const NODE_RUNTIME_CLOSURE_FORMAT = "foodsystems-node-runtime-closure";
export const NODE_RUNTIME_CLOSURE_VERSION = 1;
export const NODE_RUNTIME_CLOSURE_DOMAIN =
  "food-systems-2026:node-runtime-closure:v1\0";
export const NODE_RUNTIME_CLOSURE_SHA256 =
  "4a5fb0d0903d4d0c78118c6bfda4e12796ff7a7f7d723db3b25a84d7ef6de04b";
export const NODE_RUNTIME_CLOSURE_MANIFEST_PATH =
  "knowledge/corpus/source-registration/node-runtime-closure-darwin-arm64-2026-08-20.v1.json";
export const NODE_RUNTIME_CLOSURE_MANIFEST_SHA256 =
  "f2ff38cbcb2e8bcec2bdecee6f7edea586355f80875b78f88df06f46f443d586";
export const NODE_RUNTIME_FILE_SHA256 =
  "08dad0581f00a0cabf4d49ec92ca1f25fdfd01c2c18fa8e92b35f04d4c24c164";
export const BOUND_SYSTEM_RUNTIME_CLOSURE_MANIFEST_SHA256 =
  "3047d302cc81c27ebbbbf1a40577091d0154509b13b9a4a8520c033e353a9c09";
export const BOUND_SYSTEM_RUNTIME_CLOSURE_SHA256 =
  "a77c02d31b0daf8f02e81eabc15f30aebc7b2a7fd3b9d045dddb2940b7d0db39";

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const NODE_VERSION = "v26.0.0";
const NODE_OBJECT_COUNT = 25;
const LOADER_ALIAS_COUNT = 30;
const SYSTEM_DYLIB_REFERENCE_COUNT = 6;
const SYSTEM_DYLD_CACHE_FILE_COUNT = 13;
const SYSTEM_DYLD_CACHE_BYTES = 5_820_841_984;
const RESOLUTION =
  "recursive_macho_load_commands_non_system_bytes_plus_bound_postgresql_toolset_system_dyld_closure";
const FORBIDDEN_EXACT_ENVIRONMENT = new Set([
  "NODE_EXTRA_CA_CERTS",
  "NODE_OPTIONS",
  "NODE_PATH",
  "NODE_PRESERVE_SYMLINKS",
  "NODE_PRESERVE_SYMLINKS_MAIN",
]);
const FORBIDDEN_ENVIRONMENT_PREFIXES = [
  "DOTENV_CONFIG_",
  "DYLD_",
  "LD_",
  "NODE_",
  "OPENSSL_",
  "PRISMA_",
  "TSX_",
];

function fail(message) {
  throw new Error(`node runtime-closure verification failed: ${message}`);
}

export function canonicalNodeRuntimeClosureJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalNodeRuntimeClosureJson(item)).join(",")}]`;
  }
  return `{${Object.keys(value)
    .sort()
    .map(
      (key) =>
        `${JSON.stringify(key)}:${canonicalNodeRuntimeClosureJson(value[key])}`,
    )
    .join(",")}}`;
}

export function nodeRuntimeClosureSha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function exactObject(value, keys, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    fail(`${label} must be an object`);
  }
  if (
    canonicalNodeRuntimeClosureJson(Object.keys(value).sort()) !==
    canonicalNodeRuntimeClosureJson([...keys].sort())
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
    canonicalNodeRuntimeClosureJson(selected) !==
      canonicalNodeRuntimeClosureJson(sorted)
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
  let pathStats;
  try {
    realPath = realpathSync(path);
    pathStats = lstatSync(path, { bigint: true });
  } catch {
    fail(`${label} is missing or unreadable`);
  }
  if (
    realPath !== path ||
    !pathStats.isFile() ||
    pathStats.isSymbolicLink() ||
    pathStats.nlink !== 1n
  ) {
    fail(`${label} is not the canonical regular file`);
  }

  const descriptor = openSync(path, "r");
  try {
    const before = fstatSync(descriptor, { bigint: true });
    if (
      before.dev !== pathStats.dev ||
      before.ino !== pathStats.ino ||
      before.size !== pathStats.size ||
      before.mtimeNs !== pathStats.mtimeNs ||
      !before.isFile()
    ) {
      fail(`${label} changed before it was opened`);
    }
    const hash = createHash("sha256");
    let bytes = 0;
    for await (const chunk of createReadStream(path, {
      fd: descriptor,
      autoClose: false,
    })) {
      hash.update(chunk);
      bytes += chunk.length;
    }
    const after = fstatSync(descriptor, { bigint: true });
    if (
      before.dev !== after.dev ||
      before.ino !== after.ino ||
      before.size !== after.size ||
      before.mtimeNs !== after.mtimeNs ||
      bytes !== Number(before.size)
    ) {
      fail(`${label} changed while it was hashed`);
    }
    return { bytes, sha256: hash.digest("hex") };
  } finally {
    closeSync(descriptor);
  }
}

function forbiddenRuntimeEnvironmentNames() {
  return Object.keys(process.env)
    .filter((name) => {
      if (!process.env[name]) return false;
      return (
        FORBIDDEN_EXACT_ENVIRONMENT.has(name) ||
        FORBIDDEN_ENVIRONMENT_PREFIXES.some((prefix) => name.startsWith(prefix))
      );
    })
    .sort((left, right) =>
      Buffer.compare(Buffer.from(left), Buffer.from(right)),
    );
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
      "nodeVersion",
      "platform",
      "resolution",
      "systemDylibReferences",
      "systemRuntimeBinding",
      "version",
    ],
    "manifest",
  );
  if (
    manifest.format !== NODE_RUNTIME_CLOSURE_FORMAT ||
    manifest.version !== NODE_RUNTIME_CLOSURE_VERSION ||
    manifest.platform !== "darwin" ||
    manifest.architecture !== "arm64" ||
    manifest.nodeVersion !== NODE_VERSION ||
    manifest.resolution !== RESOLUTION
  ) {
    fail("manifest identity is invalid");
  }
  sha256(manifest.closureSha256, "manifest closureSha256");
  if (
    !Array.isArray(manifest.homebrewObjects) ||
    manifest.homebrewObjects.length !== NODE_OBJECT_COUNT
  ) {
    fail(`manifest must contain exactly ${NODE_OBJECT_COUNT} Homebrew objects`);
  }
  if (
    !Array.isArray(manifest.loaderAliases) ||
    manifest.loaderAliases.length !== LOADER_ALIAS_COUNT
  ) {
    fail(`manifest must contain exactly ${LOADER_ALIAS_COUNT} loader aliases`);
  }
  if (
    !Array.isArray(manifest.systemDylibReferences) ||
    manifest.systemDylibReferences.length !== SYSTEM_DYLIB_REFERENCE_COUNT
  ) {
    fail(
      `manifest must contain exactly ${SYSTEM_DYLIB_REFERENCE_COUNT} system dylib references`,
    );
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

  const system = exactObject(
    manifest.systemRuntimeBinding,
    [
      "dyldCacheBytes",
      "dyldCacheFileCount",
      "postgresqlToolsetRuntimeClosureManifestSha256",
      "postgresqlToolsetRuntimeClosureSha256",
    ],
    "systemRuntimeBinding",
  );
  sha256(
    system.postgresqlToolsetRuntimeClosureManifestSha256,
    "systemRuntimeBinding postgresqlToolsetRuntimeClosureManifestSha256",
  );
  sha256(
    system.postgresqlToolsetRuntimeClosureSha256,
    "systemRuntimeBinding postgresqlToolsetRuntimeClosureSha256",
  );
  if (
    system.postgresqlToolsetRuntimeClosureManifestSha256 !==
      BOUND_SYSTEM_RUNTIME_CLOSURE_MANIFEST_SHA256 ||
    system.postgresqlToolsetRuntimeClosureSha256 !==
      BOUND_SYSTEM_RUNTIME_CLOSURE_SHA256 ||
    system.dyldCacheFileCount !== SYSTEM_DYLD_CACHE_FILE_COUNT ||
    system.dyldCacheBytes !== SYSTEM_DYLD_CACHE_BYTES
  ) {
    fail("system runtime binding is invalid");
  }
  return { manifest, aliases, objects, system };
}

/**
 * @param {{ manifestPath: string, expectedManifestSha256: string, expectedClosureSha256: string, verifiedSystemRuntimeClosureSha256: string }} input
 */
export async function verifyNodeRuntimeClosure({
  manifestPath,
  expectedManifestSha256,
  expectedClosureSha256,
  verifiedSystemRuntimeClosureSha256,
}) {
  sha256(expectedManifestSha256, "expected manifest SHA-256");
  sha256(expectedClosureSha256, "expected closure SHA-256");
  sha256(
    verifiedSystemRuntimeClosureSha256,
    "verified system runtime closure SHA-256",
  );
  if (
    expectedManifestSha256 !== NODE_RUNTIME_CLOSURE_MANIFEST_SHA256 ||
    expectedClosureSha256 !== NODE_RUNTIME_CLOSURE_SHA256
  ) {
    fail("caller expected bindings differ from the pinned runtime closure");
  }
  if (
    verifiedSystemRuntimeClosureSha256 !== BOUND_SYSTEM_RUNTIME_CLOSURE_SHA256
  ) {
    fail("caller did not provide the bound verified system runtime closure");
  }
  if (process.platform !== "darwin" || process.arch !== "arm64") {
    fail("runtime platform is not the pinned darwin arm64 target");
  }
  const forbiddenEnvironment = forbiddenRuntimeEnvironmentNames();
  if (forbiddenEnvironment.length > 0) {
    fail(
      `forbidden runtime environment is set: ${forbiddenEnvironment.join(", ")}`,
    );
  }
  if (process.version !== NODE_VERSION) {
    fail("active Node version differs from the pinned runtime");
  }

  const manifestBytes = readStableManifest(manifestPath);
  const manifestSha256 = nodeRuntimeClosureSha256(manifestBytes);
  if (manifestSha256 !== expectedManifestSha256) {
    fail("manifest SHA-256 differs from expected");
  }
  const { manifest, aliases, objects, system } = parseManifest(manifestBytes);
  const { closureSha256, ...body } = manifest;
  const computedClosureSha256 = nodeRuntimeClosureSha256(
    `${NODE_RUNTIME_CLOSURE_DOMAIN}${canonicalNodeRuntimeClosureJson(body)}`,
  );
  if (
    closureSha256 !== NODE_RUNTIME_CLOSURE_SHA256 ||
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

  let homebrewObjectBytes = 0;
  for (const [index, entry] of objects.entries()) {
    const facts = await fileFacts(entry.path, `runtime object ${index + 1}`);
    if (facts.bytes !== entry.bytes || facts.sha256 !== entry.sha256) {
      fail(`runtime object ${index + 1} bytes differ from the manifest`);
    }
    homebrewObjectBytes += facts.bytes;
  }
  const node = objects.find((entry) => entry.path.endsWith("/bin/node"));
  if (!node || node.sha256 !== NODE_RUNTIME_FILE_SHA256) {
    fail("Node root object is absent or invalid");
  }
  if (realpathSync(process.execPath) !== node.path) {
    fail("active Node executable is not the pinned root object");
  }

  return Object.freeze({
    manifestSha256,
    closureSha256,
    platform: manifest.platform,
    architecture: manifest.architecture,
    nodeVersion: manifest.nodeVersion,
    nodeFileSha256: node.sha256,
    homebrewObjectCount: objects.length,
    loaderAliasCount: aliases.length,
    systemDylibReferenceCount: manifest.systemDylibReferences.length,
    homebrewObjectBytes,
    totalRuntimeBytes: homebrewObjectBytes + system.dyldCacheBytes,
    verifiedSystemRuntimeClosureSha256,
    forbiddenRuntimeEnvironmentPresent: false,
  });
}
