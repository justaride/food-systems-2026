#!/usr/bin/env node

/*
 * The source-registration apply port remains quarantined.  This file is the
 * database-free trust boundary that a future, separately reviewed apply
 * bootstrap may call.  It deliberately has no imports from node_modules.
 */

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  closeSync,
  constants,
  fchmodSync,
  fstatSync,
  fsyncSync,
  lstatSync,
  openSync,
  readFileSync,
  readSync,
  readdirSync,
  readlinkSync,
  realpathSync,
  statSync,
  unlinkSync,
} from "node:fs";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const TRUSTED_SOURCE_REGISTRATION_PURPOSE =
  "source_registration_apply";
export const TRUSTED_SOURCE_REGISTRATION_PUBLIC_FORMAT =
  "foodsystems-source-registration-apply-public-pins";
export const TRUSTED_SOURCE_REGISTRATION_SECRET_FORMAT =
  "foodsystems-source-registration-apply-secret-input";
export const TRUSTED_SOURCE_REGISTRATION_SCHEMA_VERSION = 1;
export const TRUSTED_SOURCE_REGISTRATION_HASH_DOMAIN =
  "food-systems-2026:source-registration-apply-trusted-entrypoint:v1\0";

export const TRUSTED_SOURCE_REGISTRATION_FDS = Object.freeze({
  launcher: Number(3),
  publicPins: Number(4),
  secretInput: Number(5),
});
export const TRUSTED_SOURCE_REGISTRATION_ENVIRONMENT_NAMES = Object.freeze({
  launcherFd: "SOURCE_REGISTRATION_TRUSTED_LAUNCHER_FD",
  bootstrapPid: "SOURCE_REGISTRATION_TRUSTED_BOOTSTRAP_PID",
  publicPinsFd: "SOURCE_REGISTRATION_TRUSTED_PUBLIC_PINS_FD",
  secretInputFd: "SOURCE_REGISTRATION_TRUSTED_SECRET_INPUT_FD",
  expectedPurpose: "SOURCE_REGISTRATION_TRUSTED_PURPOSE",
});

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const MAX_DESCRIPTOR_BYTES = 262_144;
const LAUNCHER_PREFIX = "foodsystems-source-registration-trusted-launcher-";
const FORBIDDEN_ENVIRONMENT_NAMES = new Set([
  "NODE_EXTRA_CA_CERTS",
  "NODE_OPTIONS",
  "NODE_PATH",
  "NODE_PRESERVE_SYMLINKS",
  "NODE_PRESERVE_SYMLINKS_MAIN",
]);
const FORBIDDEN_ENVIRONMENT_PREFIXES = Object.freeze([
  "DOTENV_CONFIG_",
  "DYLD_",
  "LD_",
  "NODE_",
  "OPENSSL_",
  "PRISMA_",
  "TSX_",
]);
const PROJECT_RUNTIME_FILES = Object.freeze([
  "knowledge/corpus/SOURCE-REGISTRATION-APPLY-CONTRACT.md",
  "knowledge/runtime/source-registration-tsx.runtime.json",
  "package-lock.json",
  "package.json",
  "scripts/knowledge/apply-source-registration-plan.ts",
  "scripts/knowledge/run-trusted-source-registration-apply.mjs",
  "src/lib/knowledge/source-registration-apply.ts",
]);
const NODE_RUNTIME_MANIFEST =
  "knowledge/corpus/source-registration/node-runtime-closure-darwin-arm64-2026-08-03.v1.json";
const POSTGRES_RUNTIME_MANIFEST =
  "knowledge/corpus/source-registration/psql-runtime-closure-darwin-arm64-2026-08-03.v1.json";
const POSTGRES_EXTENSION_MANIFEST =
  "knowledge/corpus/source-registration/postgresql-extension-runtime-closure-darwin-arm64-2026-08-03.v1.json";
const LOCKED_MANIFEST_SHA256 = Object.freeze({
  [NODE_RUNTIME_MANIFEST]:
    "9c262c5438fb5c6bad4b002b2516c45d3b935c6a2481e3841fd28b5d03d8e8f8",
  [POSTGRES_RUNTIME_MANIFEST]:
    "7d0ac827430cd0d60c3884ac98fc5769223861fee17a18dd9375b10852fd8fdb",
  [POSTGRES_EXTENSION_MANIFEST]:
    "4e70b953c0a69a8e320f4b091164fb13f834fb043a0fba95f04f804864ba11c4",
});
const LOCKED_CLOSURE_SHA256 = Object.freeze({
  [NODE_RUNTIME_MANIFEST]:
    "464410ef7bbe3c4da7468973f47a43442b51ef7ff3455d810dcf8f3b7ae4e434",
  [POSTGRES_RUNTIME_MANIFEST]:
    "2f102d12bb738a5ec935e52a76cb6b156e58d86ef8e56a2bef3711c087de7bf0",
  [POSTGRES_EXTENSION_MANIFEST]:
    "3b5540bc6b1d6fd25335b0f094470ee8da5214f09f04feabb583a06aa3b7487c",
});

function fail(message) {
  throw new Error(`Trusted source-registration launcher refused: ${message}`);
}

function byteSort(left, right) {
  return Buffer.from(left).compare(Buffer.from(right));
}

export function canonicalJson(value) {
  if (value === null || typeof value !== "object") {
    if (typeof value === "number" && !Number.isFinite(value)) {
      fail("canonical JSON contains a non-finite number");
    }
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value)
    .sort(byteSort)
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
    .join(",")}}`;
}

export function sha256(value) {
  return createHash("sha256")
    .update(typeof value === "string" ? value : Buffer.from(value))
    .digest("hex");
}

function sha256File(path) {
  return sha256(readFileSync(path));
}

function sameFileIdentity(left, right) {
  return (
    left.dev === right.dev &&
    left.ino === right.ino &&
    left.mode === right.mode &&
    left.uid === right.uid &&
    left.gid === right.gid
  );
}

function descriptorNumber(environment, name, expected) {
  const value = environment[name];
  if (value !== String(expected)) fail(`${name} must be ${expected}`);
  return expected;
}

export function forbiddenEnvironmentNames(environment = process.env) {
  return Object.keys(environment)
    .filter(
      (name) =>
        FORBIDDEN_ENVIRONMENT_NAMES.has(name) ||
        FORBIDDEN_ENVIRONMENT_PREFIXES.some((prefix) => name.startsWith(prefix)),
    )
    .sort(byteSort);
}

export function assertCleanBootstrapEnvironment(
  environment = process.env,
  execArgv = process.execArgv,
) {
  const forbidden = forbiddenEnvironmentNames(environment);
  if (forbidden.length > 0) {
    fail(`forbidden inherited environment: ${forbidden.join(",")}`);
  }
  if (!Array.isArray(execArgv) || execArgv.length !== 0) {
    fail("Node execution flags are not accepted");
  }
}

function assertHash(value, label) {
  if (typeof value !== "string" || !SHA256_PATTERN.test(value)) {
    fail(`${label} is not a SHA-256 pin`);
  }
}

function assertExactKeys(value, keys, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    fail(`${label} must be an object`);
  }
  const actual = Object.keys(value).sort(byteSort);
  const expected = [...keys].sort(byteSort);
  if (canonicalJson(actual) !== canonicalJson(expected)) {
    fail(`${label} has unexpected keys`);
  }
}

function readDescriptorBytes(descriptor, size) {
  const bytes = Buffer.alloc(Number(size));
  let offset = 0;
  while (offset < bytes.length) {
    const read = readSync(descriptor, bytes, offset, bytes.length - offset, offset);
    if (read === 0) fail("descriptor ended before its sealed size");
    offset += read;
  }
  return bytes;
}

export function readCanonicalUnlinkedDescriptor(
  descriptor,
  label,
  { onRead } = {},
) {
  const before = fstatSync(descriptor);
  const currentUid = process.getuid?.();
  if (
    !before.isFile() ||
    before.isSymbolicLink() ||
    before.nlink !== 0 ||
    (before.mode & 0o777) !== 0o400 ||
    (currentUid !== undefined && before.uid !== currentUid) ||
    before.size <= 0 ||
    before.size > MAX_DESCRIPTOR_BYTES
  ) {
    fail(`${label} must be an unlinked mode-0400 regular file`);
  }
  onRead?.();
  const bytes = readDescriptorBytes(descriptor, before.size);
  const after = fstatSync(descriptor);
  if (
    !sameFileIdentity(before, after) ||
    after.nlink !== 0 ||
    after.size !== bytes.length ||
    (after.mode & 0o777) !== 0o400 ||
    !readDescriptorBytes(descriptor, after.size).equals(bytes)
  ) {
    fail(`${label} changed while it was read`);
  }
  let text;
  let value;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    value = JSON.parse(text);
  } catch {
    fail(`${label} is not canonical JSON`);
  }
  if (`${canonicalJson(value)}\n` !== text) {
    fail(`${label} is not canonical JSON`);
  }
  return value;
}

export function verifyTrustedLauncherDescriptor({
  launcherPath = process.argv[1] ? realpathSync(process.argv[1]) : undefined,
  descriptor = TRUSTED_SOURCE_REGISTRATION_FDS.launcher,
  expectedSha256,
  requireTemporaryParent = true,
} = {}) {
  if (!launcherPath) fail("the executing launcher path is unavailable");
  const path = realpathSync(launcherPath);
  const stats = lstatSync(path);
  const descriptorStats = fstatSync(descriptor);
  const parent = dirname(path);
  const parentStats = lstatSync(parent);
  const currentUid = process.getuid?.();
  if (
    !stats.isFile() ||
    stats.isSymbolicLink() ||
    stats.nlink !== 1 ||
    (stats.mode & 0o777) !== 0o400 ||
    (currentUid !== undefined && stats.uid !== currentUid) ||
    !sameFileIdentity(stats, descriptorStats)
  ) {
    fail("launcher inode, owner, mode or descriptor identity is invalid");
  }
  if (
    !parentStats.isDirectory() ||
    parentStats.isSymbolicLink() ||
    (parentStats.mode & 0o777) !== 0o700 ||
    (currentUid !== undefined && parentStats.uid !== currentUid) ||
    !basename(parent).startsWith(LAUNCHER_PREFIX)
  ) {
    fail("launcher parent is not a private mode-0700 directory");
  }
  if (
    requireTemporaryParent &&
    realpathSync(dirname(parent)) !== realpathSync("/tmp")
  ) {
    fail("launcher parent is not directly below /tmp");
  }
  if (expectedSha256 !== undefined) assertHash(expectedSha256, "launcher");
  const bytes = readDescriptorBytes(descriptor, stats.size);
  const afterRead = fstatSync(descriptor);
  if (
    !sameFileIdentity(stats, afterRead) ||
    afterRead.nlink !== 1 ||
    (afterRead.mode & 0o777) !== 0o400 ||
    canonicalJson(readdirSync(parent).sort(byteSort)) !==
      canonicalJson([basename(path)]) ||
    sha256(bytes) !== (expectedSha256 ?? sha256File(path))
  ) {
    fail("launcher bytes changed before trust was established");
  }
  return { bytes, path, parent, stats };
}

function validateRuntimeShape(runtime, { includeLauncher = false } = {}) {
  const keys = [
    "attestationSha256",
    "extensionClosureSha256",
    "localClosureSha256",
    "nodeBinarySha256",
    "nodeModulesTreeSha256",
    "nodeRuntimeClosureSha256",
    "nodeRuntimeManifestSha256",
    "nodeVersion",
    "postgresqlToolsetClosureSha256",
    "postgresqlToolsetManifestSha256",
    "prismaClientTreeSha256",
  ];
  if (includeLauncher) keys.push("launcherSha256");
  assertExactKeys(
    runtime,
    keys,
    "runtime pins",
  );
  assertHash(runtime.attestationSha256, "runtime attestation");
  for (const key of Object.keys(runtime).filter((key) => key.endsWith("Sha256"))) {
    assertHash(runtime[key], key);
  }
  if (typeof runtime.nodeVersion !== "string" || runtime.nodeVersion.length < 2) {
    fail("node version pin is invalid");
  }
}

export function readTrustedPublicPins(
  descriptor = TRUSTED_SOURCE_REGISTRATION_FDS.publicPins,
  { onRead } = {},
) {
  const envelope = readCanonicalUnlinkedDescriptor(
    descriptor,
    "trusted public pins",
    { onRead },
  );
  assertExactKeys(
    envelope,
    ["approval", "database", "ddl", "format", "launcherSha256", "purpose", "runtime", "version"],
    "trusted public-pin envelope",
  );
  if (
    envelope.format !== TRUSTED_SOURCE_REGISTRATION_PUBLIC_FORMAT ||
    envelope.purpose !== TRUSTED_SOURCE_REGISTRATION_PURPOSE ||
    envelope.version !== TRUSTED_SOURCE_REGISTRATION_SCHEMA_VERSION
  ) {
    fail("public-pin purpose, format or version differs");
  }
  assertHash(envelope.launcherSha256, "public launcher");
  validateRuntimeShape(envelope.runtime);
  assertExactKeys(envelope.database, ["role", "targetSha256"], "database pins");
  assertExactKeys(envelope.approval, ["authorizationSha256", "operationKeySha256"], "approval pins");
  assertExactKeys(envelope.ddl, ["catalogSha256"], "DDL pins");
  for (const value of [
    envelope.database.targetSha256,
    envelope.approval.authorizationSha256,
    envelope.approval.operationKeySha256,
    envelope.ddl.catalogSha256,
  ]) assertHash(value, "public control pin");
  if (envelope.database.role !== "foodsystems") {
    fail("database role is not the sealed role");
  }
  return envelope;
}

export function readTrustedSecretInput(
  descriptor = TRUSTED_SOURCE_REGISTRATION_FDS.secretInput,
  { onRead } = {},
) {
  const envelope = readCanonicalUnlinkedDescriptor(
    descriptor,
    "trusted secret input",
    { onRead },
  );
  assertExactKeys(envelope, ["format", "inputs", "purpose", "version"], "secret-input envelope");
  if (
    envelope.format !== TRUSTED_SOURCE_REGISTRATION_SECRET_FORMAT ||
    envelope.purpose !== TRUSTED_SOURCE_REGISTRATION_PURPOSE ||
    envelope.version !== TRUSTED_SOURCE_REGISTRATION_SCHEMA_VERSION
  ) {
    fail("secret-input purpose, format or version differs");
  }
  assertExactKeys(envelope.inputs, ["DATABASE_URL", "FOOD_SYSTEMS_PRIVATE_CORPUS_ROOT", "FOOD_SYSTEMS_PRIVATE_CORPUS_REPLICA_ROOT"], "secret inputs");
  for (const [name, value] of Object.entries(envelope.inputs)) {
    if (typeof value !== "string" || value.length === 0) {
      fail(`${name} secret input is invalid`);
    }
  }
  return envelope.inputs;
}

function canonicalEnvelopeBody(envelope) {
  return `${TRUSTED_SOURCE_REGISTRATION_HASH_DOMAIN}${canonicalJson(envelope)}`;
}

export function sealRuntimeAttestation(attestation) {
  const body = { ...attestation };
  delete body.attestationSha256;
  return {
    ...body,
    attestationSha256: sha256(canonicalEnvelopeBody(body)),
  };
}

export function verifyRuntimeAttestationSelfHash(attestation) {
  validateRuntimeShape(attestation, { includeLauncher: true });
  assertHash(attestation.launcherSha256, "launcher attestation");
  const { attestationSha256, ...body } = attestation;
  if (sha256(canonicalEnvelopeBody(body)) !== attestationSha256) {
    fail("runtime attestation self-hash differs");
  }
  return true;
}

function assertSealedManifest(projectRoot, path) {
  const absolute = resolve(projectRoot, path);
  const bytesHash = sha256File(absolute);
  if (bytesHash !== LOCKED_MANIFEST_SHA256[path]) {
    fail(`${path} differs from its sealed manifest bytes`);
  }
  const value = JSON.parse(readFileSync(absolute, "utf8"));
  if (value.closureSha256 !== LOCKED_CLOSURE_SHA256[path]) {
    fail(`${path} has a different closure hash`);
  }
  return value;
}

function assertManifestObjects(manifest, label) {
  const objects = manifest.homebrewObjects ?? manifest.files ?? [];
  if (!Array.isArray(objects) || objects.length === 0) {
    fail(`${label} has no sealed file objects`);
  }
  for (const object of objects) {
    if (
      typeof object.path !== "string" ||
      !Number.isInteger(object.bytes) ||
      !SHA256_PATTERN.test(object.sha256)
    ) {
      fail(`${label} contains an invalid file object`);
    }
    const path = realpathSync(object.path);
    const stats = lstatSync(path);
    if (!stats.isFile() || stats.isSymbolicLink() || stats.size !== object.bytes) {
      fail(`${label} file identity differs for ${basename(object.path)}`);
    }
    if (sha256File(path) !== object.sha256) {
      fail(`${label} file bytes differ for ${basename(object.path)}`);
    }
  }
}

function treeBinding(root, projectRoot) {
  const entries = [];
  const walk = (directory, prefix) => {
    for (const name of readdirSync(directory).sort(byteSort)) {
      const absolute = join(directory, name);
      const path = prefix ? `${prefix}/${name}` : name;
      const stats = lstatSync(absolute);
      if (stats.isDirectory() && !stats.isSymbolicLink()) {
        entries.push({ kind: "directory", mode: stats.mode & 0o7777, path });
        walk(absolute, path);
      } else if (stats.isFile() && !stats.isSymbolicLink()) {
        entries.push({
          fileSha256: sha256File(absolute),
          kind: "file",
          mode: stats.mode & 0o7777,
          path,
          sizeBytes: stats.size,
        });
      } else if (stats.isSymbolicLink()) {
        const linkTarget = readlinkSync(absolute);
        const resolvedTarget = realpathSync(absolute);
        const canonicalRoot = realpathSync(root);
        if (
          isAbsolute(linkTarget) ||
          resolvedTarget !== canonicalRoot &&
            !resolvedTarget.startsWith(`${canonicalRoot}${sep}`)
        ) {
          fail(`${path} is a non-portable or escaping symlink`);
        }
        entries.push({
          kind: "symlink",
          linkTarget,
          mode: stats.mode & 0o7777,
          path,
        });
      } else {
        fail(`${path} is not a regular directory or file`);
      }
    }
  };
  walk(root, "");
  return sha256(
    `${TRUSTED_SOURCE_REGISTRATION_HASH_DOMAIN}tree\0${canonicalJson({
      root: relative(projectRoot, root),
      entries,
    })}`,
  );
}

const LOCAL_IMPORT_PATTERN =
  /(?:^|\n)\s*(?:import|export)\s+(?:[^"'`]*?\s+from\s+)?["']([^"']+)["']/g;

function resolveLocalImport(projectRoot, importer, specifier) {
  const base = resolve(dirname(importer), specifier);
  const portable = relative(projectRoot, base).split(sep).join("/");
  if (
    portable === "src/generated/prisma" ||
    portable.startsWith("src/generated/prisma/")
  ) {
    return null;
  }
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.mjs`,
    `${base}.js`,
    `${base}.json`,
    join(base, "index.ts"),
    join(base, "index.mjs"),
    join(base, "index.js"),
  ];
  for (const candidate of candidates) {
    try {
      const stats = lstatSync(candidate);
      if (!stats.isFile() || stats.isSymbolicLink()) continue;
      const real = realpathSync(candidate);
      if (real !== projectRoot && !real.startsWith(`${projectRoot}${sep}`)) {
        fail(`local runtime import escaped the project root: ${specifier}`);
      }
      return real;
    } catch {
      // Try the next controlled extension.
    }
  }
  fail(`local runtime import could not be resolved: ${specifier}`);
}

function localRuntimeBinding(projectRoot) {
  const pending = PROJECT_RUNTIME_FILES.map((path) =>
    realpathSync(resolve(projectRoot, path)),
  );
  const visited = new Set();
  const entries = [];
  while (pending.length > 0) {
    const absolute = pending.pop();
    if (visited.has(absolute)) continue;
    visited.add(absolute);
    const path = relative(projectRoot, absolute).split(sep).join("/");
    const bytes = readFileSync(absolute);
    entries.push({ fileSha256: sha256(bytes), path });
    const source = bytes.toString("utf8");
    LOCAL_IMPORT_PATTERN.lastIndex = 0;
    for (
      let match = LOCAL_IMPORT_PATTERN.exec(source);
      match;
      match = LOCAL_IMPORT_PATTERN.exec(source)
    ) {
      const specifier = match[1];
      if (!specifier.startsWith(".")) continue;
      const imported = resolveLocalImport(projectRoot, absolute, specifier);
      if (imported && !visited.has(imported)) pending.push(imported);
    }
  }
  entries.sort((left, right) => byteSort(left.path, right.path));
  return sha256(
    `${TRUSTED_SOURCE_REGISTRATION_HASH_DOMAIN}local\0${canonicalJson(entries)}`,
  );
}

export function computeTrustedRuntimeAttestation({
  projectRoot = process.cwd(),
  launcherPath = process.argv[1] ? realpathSync(process.argv[1]) : undefined,
} = {}) {
  if (!launcherPath) fail("launcher path is unavailable");
  const root = realpathSync(projectRoot);
  const nodeManifest = assertSealedManifest(root, NODE_RUNTIME_MANIFEST);
  const postgresManifest = assertSealedManifest(root, POSTGRES_RUNTIME_MANIFEST);
  const extensionManifest = assertSealedManifest(root, POSTGRES_EXTENSION_MANIFEST);
  assertManifestObjects(nodeManifest, "Node runtime closure");
  assertManifestObjects(postgresManifest, "PostgreSQL toolset closure");
  assertManifestObjects(extensionManifest, "PostgreSQL extension closure");
  if (nodeManifest.nodeVersion !== process.version) {
    fail("active Node version differs from the sealed Node runtime");
  }
  const nodeBinarySha256 = sha256File(realpathSync(process.execPath));
  const body = {
    extensionClosureSha256: extensionManifest.closureSha256,
    localClosureSha256: localRuntimeBinding(root),
    nodeBinarySha256,
    nodeModulesTreeSha256: treeBinding(resolve(root, "node_modules"), root),
    nodeRuntimeClosureSha256: nodeManifest.closureSha256,
    nodeRuntimeManifestSha256: LOCKED_MANIFEST_SHA256[NODE_RUNTIME_MANIFEST],
    nodeVersion: process.version,
    postgresqlToolsetClosureSha256: postgresManifest.closureSha256,
    postgresqlToolsetManifestSha256: LOCKED_MANIFEST_SHA256[POSTGRES_RUNTIME_MANIFEST],
    prismaClientTreeSha256: treeBinding(resolve(root, "src/generated/prisma"), root),
    launcherSha256: sha256File(launcherPath),
  };
  const { launcherSha256, ...runtime } = body;
  return sealRuntimeAttestation({
    ...runtime,
    launcherSha256,
  });
}

function assertRuntimePins(publicPins, runtimeAttestation) {
  verifyRuntimeAttestationSelfHash(runtimeAttestation);
  if (publicPins.launcherSha256 !== runtimeAttestation.launcherSha256) {
    fail("launcher pin differs from the current launcher bytes");
  }
  const expected = { ...publicPins.runtime };
  const actual = { ...runtimeAttestation };
  delete actual.launcherSha256;
  if (canonicalJson(expected) !== canonicalJson(actual)) {
    fail("public runtime pins differ from the current attestation");
  }
}

export function requireTrustedSourceRegistrationEntrypoint({
  environment = process.env,
  execArgv = process.execArgv,
  launcherPath = process.argv[1] ? realpathSync(process.argv[1]) : undefined,
  descriptor = TRUSTED_SOURCE_REGISTRATION_FDS.launcher,
  publicDescriptor = TRUSTED_SOURCE_REGISTRATION_FDS.publicPins,
  secretDescriptor = TRUSTED_SOURCE_REGISTRATION_FDS.secretInput,
  projectRoot = process.cwd(),
  runtimeAttestation,
  onSecretRead,
} = {}) {
  assertCleanBootstrapEnvironment(environment, execArgv);
  for (const name of [
    "DATABASE_URL",
    "FOOD_SYSTEMS_PRIVATE_CORPUS_ROOT",
    "FOOD_SYSTEMS_PRIVATE_CORPUS_REPLICA_ROOT",
  ]) {
    if (Object.hasOwn(environment, name)) fail(`${name} must not be inherited`);
  }
  descriptorNumber(environment, TRUSTED_SOURCE_REGISTRATION_ENVIRONMENT_NAMES.launcherFd, 3);
  descriptorNumber(environment, TRUSTED_SOURCE_REGISTRATION_ENVIRONMENT_NAMES.publicPinsFd, 4);
  descriptorNumber(environment, TRUSTED_SOURCE_REGISTRATION_ENVIRONMENT_NAMES.secretInputFd, 5);
  if (
    environment[TRUSTED_SOURCE_REGISTRATION_ENVIRONMENT_NAMES.bootstrapPid] !==
    String(process.ppid)
  ) {
    fail("trusted bootstrap parent PID differs");
  }
  if (environment[TRUSTED_SOURCE_REGISTRATION_ENVIRONMENT_NAMES.expectedPurpose] !== TRUSTED_SOURCE_REGISTRATION_PURPOSE) {
    fail("trusted purpose binding is absent");
  }

  const launcher = verifyTrustedLauncherDescriptor({
    descriptor,
    launcherPath,
  });
  const publicPins = readTrustedPublicPins(publicDescriptor);
  if (publicPins.purpose !== TRUSTED_SOURCE_REGISTRATION_PURPOSE) {
    fail("public purpose is not source_registration_apply");
  }
  const attestation = runtimeAttestation ?? computeTrustedRuntimeAttestation({ projectRoot, launcherPath });
  if (attestation.launcherSha256 !== sha256(launcher.bytes)) {
    fail("FD3 launcher bytes differ from the runtime attestation");
  }
  assertRuntimePins(publicPins, attestation);

  // This is the first and only call site that may read FD5.  All public,
  // inode, PID, purpose, environment and runtime checks are above it.
  const secretInput = readTrustedSecretInput(secretDescriptor, {
    onRead: onSecretRead,
  });
  return { attestation, launcher, publicPins, secretInput };
}

export function reattestAfterTrustedChild({
  before,
  after,
  status,
  signal = undefined,
}) {
  if (canonicalJson(before) !== canonicalJson(after)) {
    fail("runtime attestation changed after the child exited");
  }
  if (signal) fail(`trusted child terminated by ${signal}`);
  if (status !== 0) fail(`trusted child failed with status ${status}`);
  return true;
}

export function releaseTrustedChildOutput({
  before,
  after,
  status,
  signal = undefined,
  stdout,
}) {
  reattestAfterTrustedChild({ before, after, status, signal });
  if (typeof stdout !== "string") fail("trusted child stdout is not text");
  return stdout;
}

export function trustedChildContinuity({
  environment = process.env,
  execArgv = process.execArgv,
  runtimeAttestation,
  ...options
} = {}) {
  return requireTrustedSourceRegistrationEntrypoint({
    environment,
    execArgv,
    runtimeAttestation,
    ...options,
  });
}

export function runTrustedSourceRegistrationProbe({
  environment = process.env,
  execArgv = process.execArgv,
  launcherPath = process.argv[1] ? realpathSync(process.argv[1]) : undefined,
  descriptor = TRUSTED_SOURCE_REGISTRATION_FDS.launcher,
  publicDescriptor = TRUSTED_SOURCE_REGISTRATION_FDS.publicPins,
  secretDescriptor = TRUSTED_SOURCE_REGISTRATION_FDS.secretInput,
  projectRoot = process.cwd(),
  runtimeAttestation,
  childMode = "--trusted-child-probe",
} = {}) {
  const trusted = requireTrustedSourceRegistrationEntrypoint({
    environment,
    execArgv,
    launcherPath,
    descriptor,
    publicDescriptor,
    secretDescriptor,
    projectRoot,
    runtimeAttestation,
  });
  const before = trusted.attestation;
  let result;
  let after;
  try {
    result = spawnSync(
      process.execPath,
      [launcherPath, childMode],
      {
        cwd: projectRoot,
        encoding: "utf8",
        env: {
          LANG: "C",
          LC_ALL: "C",
          PATH: process.env.PATH ?? "/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin",
          TMPDIR: "/tmp",
          TZ: "UTC",
          [TRUSTED_SOURCE_REGISTRATION_ENVIRONMENT_NAMES.bootstrapPid]: String(process.pid),
          [TRUSTED_SOURCE_REGISTRATION_ENVIRONMENT_NAMES.expectedPurpose]: TRUSTED_SOURCE_REGISTRATION_PURPOSE,
          [TRUSTED_SOURCE_REGISTRATION_ENVIRONMENT_NAMES.launcherFd]: "3",
          [TRUSTED_SOURCE_REGISTRATION_ENVIRONMENT_NAMES.publicPinsFd]: "4",
          [TRUSTED_SOURCE_REGISTRATION_ENVIRONMENT_NAMES.secretInputFd]: "5",
        },
        maxBuffer: 1_000_000,
        stdio: ["ignore", "pipe", "pipe", descriptor, publicDescriptor, secretDescriptor],
      },
    );
  } finally {
    // Re-attestation is deliberately in finally: a failed child is still a
    // possible drift window and must not bypass the post-child barrier.
    after = computeTrustedRuntimeAttestation({ projectRoot, launcherPath });
  }
  if (result?.error) fail("trusted probe child failed to start");
  if (!result) fail("trusted probe child produced no process result");
  const stdout = releaseTrustedChildOutput({
    before,
    after,
    signal: result.signal,
    status: result.status,
    stdout: result.stdout ?? "",
  });
  return {
    stderr: result.stderr ?? "",
    stdout,
    status: result.status,
  };
}

async function main() {
  assertCleanBootstrapEnvironment();
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === "--attest-only") {
    process.stdout.write(
      `${canonicalJson(computeTrustedRuntimeAttestation())}\n`,
    );
    return;
  }
  if (args.length === 1 && args[0] === "--trusted-child-probe") {
    requireTrustedSourceRegistrationEntrypoint();
    process.stdout.write(
      '{"evidenceClass":"source-registration-trusted-entrypoint-probe","status":"pass"}\n',
    );
    return;
  }
  if (args.length === 1 && args[0] === "--trusted-child-probe-fail") {
    requireTrustedSourceRegistrationEntrypoint();
    process.stderr.write("[trusted-source-registration-child] ERROR PROBE_FAILURE\n");
    process.exitCode = 23;
    return;
  }
  if (args.includes("--apply") || args.includes("--trusted-apply")) {
    process.stderr.write(
      "[trusted-source-registration-launcher] ERROR SOURCE_REGISTRATION_TRUSTED_ENTRYPOINT_REQUIRED\n",
    );
    process.exitCode = 1;
    return;
  }
  fail("only --attest-only is available in this quarantined revision");
}

const invoked = process.argv[1]
  ? pathToFileURL(realpathSync(process.argv[1])).href
  : null;
if (invoked === import.meta.url) {
  main().catch((error) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  });
}
