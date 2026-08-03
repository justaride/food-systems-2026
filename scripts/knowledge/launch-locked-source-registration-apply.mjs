#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  accessSync,
  chmodSync,
  closeSync,
  constants,
  fsyncSync,
  lstatSync,
  mkdtempSync,
  openSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  realpathSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import {
  delimiter,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const SOURCE_REGISTRATION_RUNTIME_ATTESTATION_SCHEMA_VERSION =
  "source-registration-runtime-attestation-v1";
export const SOURCE_REGISTRATION_RUNTIME_ATTESTATION_DOMAIN =
  "food-systems-2026:source-registration-runtime-attestation:v1\0";
export const SOURCE_REGISTRATION_RUNTIME_TREE_DOMAIN =
  "food-systems-2026:source-registration-runtime-tree:v1\0";
export const SOURCE_REGISTRATION_RUNTIME_CLOSURE_DOMAIN =
  "food-systems-2026:source-registration-local-closure:v1\0";
export const SOURCE_REGISTRATION_RUNTIME_ENVELOPE_DOMAIN =
  "food-systems-2026:source-registration-runtime-envelope:v1\0";
export const SOURCE_REGISTRATION_LOCKED_PSQL_RUNTIME_CLOSURE_SHA256 =
  "993193f3570f3ebad21b69af81c8099edf1bfa7f23492d6e9e489e7a351368aa";
export const SOURCE_REGISTRATION_LOCKED_PSQL_RUNTIME_MANIFEST_SHA256 =
  "d06073d91bb7da04318b0a95ce2d482369f336af69599cca7daa14fa614819e6";
export const SOURCE_REGISTRATION_LOCKED_PSQL_RUNTIME_VERIFIER_SHA256 =
  "7bf29c5fcb75efee5916716a0c067a386242eaea3d1d07d76d235a72f4591ac5";
export const SOURCE_REGISTRATION_LOCKED_NODE_RUNTIME_CLOSURE_SHA256 =
  "0382c34b2669ec93e84f2c6280be36ac5071e93d0a793d6845707726cfffb504";
export const SOURCE_REGISTRATION_LOCKED_NODE_RUNTIME_MANIFEST_SHA256 =
  "ce9cf8f7820d55d973f6935b98c468c716288b28dc345a4125a80bccdb814943";
export const SOURCE_REGISTRATION_LOCKED_NODE_RUNTIME_VERIFIER_SHA256 =
  "d38d483d28939b332dd75836adefdd29844ef2d0dac8071020b339cb347ebdb8";

const FORBIDDEN_RUNTIME_ENVIRONMENT_NAMES = new Set([
  "NODE_EXTRA_CA_CERTS",
  "NODE_OPTIONS",
  "NODE_PATH",
  "NODE_PRESERVE_SYMLINKS",
  "NODE_PRESERVE_SYMLINKS_MAIN",
]);
const FORBIDDEN_RUNTIME_ENVIRONMENT_PREFIXES = [
  "DOTENV_CONFIG_",
  "DYLD_",
  "LD_",
  "NODE_",
  "OPENSSL_",
  "PRISMA_",
  "TSX_",
];
const CHILD_ONLY_FORBIDDEN_ENVIRONMENT_PREFIXES = ["NODE_REPL_"];
const LAUNCHER_ONLY_ENVIRONMENT_PREFIX = "SOURCE_REGISTRATION_LAUNCH_";
const FIXED_SYSTEM_PATHS = ["/usr/bin", "/bin", "/usr/sbin", "/sbin"];
const LOGICAL_CLONE_REHEARSAL_ENVIRONMENT_NAMES = [
  "SOURCE_REGISTRATION_REHEARSAL_LOGICAL_COMPARISON_PROOF_BASE64",
  "SOURCE_REGISTRATION_REHEARSAL_OUTPUT_FILE",
  "SOURCE_REGISTRATION_REHEARSAL_PRIMARY_CORPUS_ROOT",
  "SOURCE_REGISTRATION_REHEARSAL_REPLICA_CORPUS_ROOT",
];
const LOGICAL_CLONE_REHEARSAL_RUNNER =
  "scripts/knowledge/run-source-registration-logical-clone-rehearsal.ts";

const launcherPath = realpathSync(fileURLToPath(import.meta.url));

function fail(message) {
  throw new Error(`Locked source-registration launcher refused: ${message}`);
}

function isForbiddenRuntimeEnvironmentName(name) {
  return (
    FORBIDDEN_RUNTIME_ENVIRONMENT_NAMES.has(name) ||
    FORBIDDEN_RUNTIME_ENVIRONMENT_PREFIXES.some((prefix) =>
      name.startsWith(prefix),
    )
  );
}

function isForbiddenChildEnvironmentName(name) {
  return (
    isForbiddenRuntimeEnvironmentName(name) ||
    CHILD_ONLY_FORBIDDEN_ENVIRONMENT_PREFIXES.some((prefix) =>
      name.startsWith(prefix),
    )
  );
}

export function forbiddenRuntimeEnvironmentNames(environment = process.env) {
  return Object.keys(environment)
    .filter((name) => isForbiddenRuntimeEnvironmentName(name))
    .sort(byteSort);
}

export function assertControlledLauncherEnvironment(
  environment = process.env,
  execArgv = process.execArgv,
) {
  const forbidden = forbiddenRuntimeEnvironmentNames(environment);
  if (forbidden.length > 0) {
    fail(`forbidden runtime environment is present: ${forbidden.join(",")}`);
  }
  if (!Array.isArray(execArgv) || execArgv.length !== 0) {
    fail("launcher must start without Node execution flags");
  }
}

export function controlledChildEnvironment(
  environment = process.env,
  { additions = {}, inheritedNames = [] } = {},
) {
  const controlled = {};
  for (const name of [...inheritedNames].sort(byteSort)) {
    const value = environment[name];
    if (
      value === undefined ||
      isForbiddenChildEnvironmentName(name) ||
      name.startsWith(LAUNCHER_ONLY_ENVIRONMENT_PREFIX)
    ) {
      fail("controlled child environment inheritance is invalid");
    }
    controlled[name] = value;
  }
  for (const name of Object.keys(additions).sort(byteSort)) {
    const value = additions[name];
    if (
      typeof value !== "string" ||
      isForbiddenChildEnvironmentName(name) ||
      (!name.startsWith(LAUNCHER_ONLY_ENVIRONMENT_PREFIX) &&
        Object.hasOwn(controlled, name))
    ) {
      fail("controlled child environment additions are invalid");
    }
    controlled[name] = value;
  }
  return controlled;
}

function controlledRuntimePath(nodeBinary, psqlBinary) {
  const directories = [
    dirname(nodeBinary),
    dirname(psqlBinary),
    ...FIXED_SYSTEM_PATHS,
  ];
  return [...new Set(directories)].join(delimiter);
}

function minimalRuntimeEnvironment({
  additions = {},
  databaseUrl,
  nodeBinary = realpathSync(process.execPath),
  psqlBinary,
}) {
  const resolvedPsql = psqlBinary ?? resolveExecutable("psql");
  const baseAdditions = {
    LANG: "C",
    LC_ALL: "C",
    PATH: controlledRuntimePath(nodeBinary, resolvedPsql),
    TMPDIR: "/tmp",
    TZ: "UTC",
    ...additions,
  };
  if (databaseUrl !== undefined) {
    if (typeof databaseUrl !== "string" || databaseUrl.length === 0) {
      fail("controlled database URL environment is invalid");
    }
    baseAdditions.DATABASE_URL = databaseUrl;
  }
  return controlledChildEnvironment(process.env, {
    additions: baseAdditions,
  });
}

export function canonicalRuntimeJson(value) {
  if (value === null || typeof value !== "object") {
    if (typeof value === "number" && !Number.isFinite(value)) {
      fail("attestation contains a non-finite number");
    }
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalRuntimeJson(item)).join(",")}]`;
  }
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalRuntimeJson(value[key])}`)
    .join(",")}}`;
}

export function runtimeSha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function sha256FileSync(path) {
  const stats = lstatSync(path);
  if (!stats.isFile() || stats.isSymbolicLink()) {
    fail("runtime executable or code input is not a regular file");
  }
  return runtimeSha256(readFileSync(path));
}

function portablePath(root, path) {
  const result = relative(root, path).split(sep).join("/");
  if (
    !result ||
    result === ".." ||
    result.startsWith("../") ||
    isAbsolute(result) ||
    result.includes("\\")
  ) {
    fail("runtime path escaped its controlled root");
  }
  return result;
}

function byteSort(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function resolveExecutable(name, pathValue = process.env.PATH ?? "") {
  if (!name || name.includes("/") || name.includes("\\")) {
    fail("executable name must be bare");
  }
  for (const directory of pathValue.split(delimiter)) {
    if (!directory || !isAbsolute(directory)) continue;
    const candidate = join(directory, name);
    try {
      accessSync(candidate, constants.X_OK);
      const resolved = realpathSync(candidate);
      const stats = lstatSync(resolved);
      if (stats.isFile() && !stats.isSymbolicLink()) return resolved;
    } catch {
      // Continue to the next absolute PATH entry.
    }
  }
  fail(`could not resolve executable ${name}`);
}

function executableVersion(path, arguments_, environment) {
  const result = spawnSync(path, arguments_, {
    encoding: "utf8",
    env: environment,
  });
  if (result.error || result.status !== 0 || result.signal) {
    fail("runtime executable version probe failed");
  }
  const stderr = result.stderr.trim();
  const stdout = result.stdout.trim();
  if (stderr || !stdout || stdout.includes("\n")) {
    fail("runtime executable version probe was not one controlled line");
  }
  return stdout;
}

function strongPsqlRuntimeClosure(projectRoot, environment) {
  const verifierPath = resolve(
    projectRoot,
    "scripts/knowledge/verify-psql-runtime-closure.mjs",
  );
  const manifestPath = resolve(
    projectRoot,
    "knowledge/corpus/source-registration/psql-runtime-closure-darwin-arm64-2026-08-03.v1.json",
  );
  if (
    sha256FileSync(verifierPath) !==
      SOURCE_REGISTRATION_LOCKED_PSQL_RUNTIME_VERIFIER_SHA256 ||
    sha256FileSync(manifestPath) !==
      SOURCE_REGISTRATION_LOCKED_PSQL_RUNTIME_MANIFEST_SHA256
  ) {
    fail("psql runtime-closure verifier or manifest bytes drifted");
  }
  const verifierUrl = pathToFileURL(verifierPath).href;
  const program = [
    `import { verifyPsqlRuntimeClosure } from ${JSON.stringify(verifierUrl)};`,
    `const result = await verifyPsqlRuntimeClosure(${JSON.stringify({
      manifestPath,
      expectedManifestSha256:
        SOURCE_REGISTRATION_LOCKED_PSQL_RUNTIME_MANIFEST_SHA256,
      expectedClosureSha256:
        SOURCE_REGISTRATION_LOCKED_PSQL_RUNTIME_CLOSURE_SHA256,
    })});`,
    "process.stdout.write(JSON.stringify(result));",
  ].join("\n");
  const result = spawnSync(
    process.execPath,
    ["--input-type=module", "--eval", program],
    {
      cwd: projectRoot,
      encoding: "utf8",
      env: environment,
      maxBuffer: 1_000_000,
    },
  );
  if (
    result.error ||
    result.status !== 0 ||
    result.signal ||
    result.stderr.trim() ||
    !result.stdout.trim()
  ) {
    fail("strong psql runtime-closure verification did not pass");
  }
  let attestation;
  try {
    attestation = JSON.parse(result.stdout);
  } catch {
    fail("strong psql runtime-closure verifier returned invalid JSON");
  }
  if (
    attestation.manifestSha256 !==
      SOURCE_REGISTRATION_LOCKED_PSQL_RUNTIME_MANIFEST_SHA256 ||
    attestation.closureSha256 !==
      SOURCE_REGISTRATION_LOCKED_PSQL_RUNTIME_CLOSURE_SHA256 ||
    attestation.platform !== process.platform ||
    attestation.architecture !== process.arch ||
    attestation.homebrewObjectCount !== 11 ||
    attestation.loaderAliasCount !== 16 ||
    attestation.systemDylibReferenceCount !== 8 ||
    attestation.dyldCacheFileCount !== 13 ||
    attestation.forbiddenLoaderEnvironmentPresent !== false
  ) {
    fail("strong psql runtime-closure attestation facts are invalid");
  }
  return {
    ...attestation,
    verifierFileSha256: SOURCE_REGISTRATION_LOCKED_PSQL_RUNTIME_VERIFIER_SHA256,
  };
}

function strongNodeRuntimeClosure(projectRoot, environment, psqlRuntime) {
  const verifierPath = resolve(
    projectRoot,
    "scripts/knowledge/verify-node-runtime-closure.mjs",
  );
  const manifestPath = resolve(
    projectRoot,
    "knowledge/corpus/source-registration/node-runtime-closure-darwin-arm64-2026-08-03.v1.json",
  );
  if (
    sha256FileSync(verifierPath) !==
      SOURCE_REGISTRATION_LOCKED_NODE_RUNTIME_VERIFIER_SHA256 ||
    sha256FileSync(manifestPath) !==
      SOURCE_REGISTRATION_LOCKED_NODE_RUNTIME_MANIFEST_SHA256
  ) {
    fail("Node runtime-closure verifier or manifest bytes drifted");
  }
  const verifierUrl = pathToFileURL(verifierPath).href;
  const program = [
    `import { verifyNodeRuntimeClosure } from ${JSON.stringify(verifierUrl)};`,
    `const result = await verifyNodeRuntimeClosure(${JSON.stringify({
      manifestPath,
      expectedManifestSha256:
        SOURCE_REGISTRATION_LOCKED_NODE_RUNTIME_MANIFEST_SHA256,
      expectedClosureSha256:
        SOURCE_REGISTRATION_LOCKED_NODE_RUNTIME_CLOSURE_SHA256,
      verifiedSystemRuntimeClosureSha256: psqlRuntime.closureSha256,
    })});`,
    "process.stdout.write(JSON.stringify(result));",
  ].join("\n");
  const result = spawnSync(
    process.execPath,
    ["--input-type=module", "--eval", program],
    {
      cwd: projectRoot,
      encoding: "utf8",
      env: environment,
      maxBuffer: 1_000_000,
    },
  );
  if (
    result.error ||
    result.status !== 0 ||
    result.signal ||
    result.stderr.trim() ||
    !result.stdout.trim()
  ) {
    fail("strong Node runtime-closure verification did not pass");
  }
  let attestation;
  try {
    attestation = JSON.parse(result.stdout);
  } catch {
    fail("strong Node runtime-closure verifier returned invalid JSON");
  }
  if (
    attestation.manifestSha256 !==
      SOURCE_REGISTRATION_LOCKED_NODE_RUNTIME_MANIFEST_SHA256 ||
    attestation.closureSha256 !==
      SOURCE_REGISTRATION_LOCKED_NODE_RUNTIME_CLOSURE_SHA256 ||
    attestation.platform !== process.platform ||
    attestation.architecture !== process.arch ||
    attestation.nodeVersion !== process.version ||
    attestation.homebrewObjectCount !== 25 ||
    attestation.loaderAliasCount !== 30 ||
    attestation.systemDylibReferenceCount !== 6 ||
    attestation.homebrewObjectBytes !== 119_690_032 ||
    attestation.totalRuntimeBytes !== 5_920_396_080 ||
    attestation.verifiedSystemRuntimeClosureSha256 !==
      psqlRuntime.closureSha256 ||
    attestation.forbiddenRuntimeEnvironmentPresent !== false
  ) {
    fail("strong Node runtime-closure attestation facts are invalid");
  }
  return {
    ...attestation,
    verifierFileSha256: SOURCE_REGISTRATION_LOCKED_NODE_RUNTIME_VERIFIER_SHA256,
  };
}

/**
 * Hash every regular file byte plus directory and internal-symlink records in
 * the canonical tree. The externally linked root is resolved explicitly, but
 * its private absolute target is never serialized. Internal links are recorded
 * and must resolve within that same canonical tree.
 */
export function secureResolvedTreeBinding({
  projectRoot,
  portableRoot,
  requireExternalRootSymlink = true,
}) {
  const lexicalRoot = resolve(projectRoot, portableRoot);
  const lexicalStats = lstatSync(lexicalRoot);
  if (requireExternalRootSymlink && !lexicalStats.isSymbolicLink()) {
    fail(`${portableRoot} must be the reviewed external root symlink`);
  }
  const canonicalRoot = realpathSync(lexicalRoot);
  const canonicalStats = lstatSync(canonicalRoot);
  if (!canonicalStats.isDirectory() || canonicalStats.isSymbolicLink()) {
    fail(`${portableRoot} did not resolve to a regular directory tree`);
  }
  if (
    requireExternalRootSymlink &&
    (canonicalRoot === projectRoot ||
      canonicalRoot.startsWith(`${projectRoot}${sep}`))
  ) {
    fail(`${portableRoot} no longer resolves outside the repository root`);
  }

  const entries = [];
  let fileCount = 0;
  let symlinkCount = 0;
  let totalFileBytes = 0;
  const walk = (directory, prefix) => {
    const names = readdirSync(directory).sort(byteSort);
    for (const name of names) {
      const absolute = join(directory, name);
      const portable = prefix ? `${prefix}/${name}` : name;
      const stats = lstatSync(absolute);
      const mode = stats.mode & 0o7777;
      if (stats.isDirectory() && !stats.isSymbolicLink()) {
        entries.push({ kind: "directory", mode, path: portable });
        walk(absolute, portable);
        continue;
      }
      if (stats.isFile() && !stats.isSymbolicLink()) {
        const fileSha256 = sha256FileSync(absolute);
        entries.push({
          fileSha256,
          kind: "file",
          mode,
          path: portable,
          sizeBytes: stats.size,
        });
        fileCount += 1;
        totalFileBytes += stats.size;
        continue;
      }
      if (stats.isSymbolicLink()) {
        const linkTarget = readlinkSync(absolute);
        if (isAbsolute(linkTarget) || linkTarget.includes("\\")) {
          fail(
            `${portableRoot}/${portable} has an absolute or non-portable link`,
          );
        }
        const resolvedTarget = realpathSync(absolute);
        if (
          resolvedTarget !== canonicalRoot &&
          !resolvedTarget.startsWith(`${canonicalRoot}${sep}`)
        ) {
          fail(`${portableRoot}/${portable} links outside its canonical tree`);
        }
        entries.push({
          kind: "symlink",
          linkTarget,
          mode,
          path: portable,
          resolvedPath:
            resolvedTarget === canonicalRoot
              ? "."
              : portablePath(canonicalRoot, resolvedTarget),
        });
        symlinkCount += 1;
        continue;
      }
      fail(`${portableRoot}/${portable} is a special filesystem entry`);
    }
  };
  walk(canonicalRoot, "");
  if (fileCount === 0) fail(`${portableRoot} contains no regular files`);
  const manifest = {
    entries,
    rootKind: requireExternalRootSymlink
      ? "resolved_external_symlink"
      : "resolved_directory",
  };
  return {
    entryCount: entries.length,
    fileCount,
    path: portableRoot,
    rootKind: manifest.rootKind,
    symlinkCount,
    totalFileBytes,
    treeSha256: runtimeSha256(
      `${SOURCE_REGISTRATION_RUNTIME_TREE_DOMAIN}${portableRoot}\0${canonicalRuntimeJson(manifest)}`,
    ),
  };
}

const STATIC_IMPORT_PATTERN =
  /(?:^|\n)\s*(?:import|export)\s+(?:[^"'`]*?\s+from\s+)?["']([^"']+)["']/g;
const DYNAMIC_IMPORT_PATTERN = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;

function importedSpecifiers(source) {
  const values = new Set();
  for (const pattern of [STATIC_IMPORT_PATTERN, DYNAMIC_IMPORT_PATTERN]) {
    pattern.lastIndex = 0;
    for (
      let match = pattern.exec(source);
      match;
      match = pattern.exec(source)
    ) {
      values.add(match[1]);
    }
  }
  return [...values].sort(byteSort);
}

function resolveLocalModule(projectRoot, importer, specifier) {
  const base = resolve(dirname(importer), specifier);
  const lexicalPortable = portablePath(projectRoot, base);
  if (
    lexicalPortable === "src/generated/prisma" ||
    lexicalPortable.startsWith("src/generated/prisma/")
  ) {
    return null;
  }
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.mjs`,
    `${base}.js`,
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
        fail(`local import ${specifier} escaped the repository root`);
      }
      return real;
    } catch {
      // Try the next controlled extension.
    }
  }
  fail(`could not resolve local import ${specifier}`);
}

export function localRuntimeClosureBinding(projectRoot) {
  const roots = [
    "scripts/knowledge/apply-source-registration-plan.ts",
    LOGICAL_CLONE_REHEARSAL_RUNNER,
    "scripts/knowledge/launch-locked-source-registration-apply.mjs",
    "scripts/knowledge/database-logical-state-digest.mjs",
    "scripts/knowledge/verify-psql-runtime-closure.mjs",
    "scripts/knowledge/verify-node-runtime-closure.mjs",
    "scripts/knowledge/generate-source-registration-plan.ts",
  ];
  const pending = roots.map((path) => realpathSync(resolve(projectRoot, path)));
  const visited = new Set();
  const entries = [];
  let totalFileBytes = 0;
  while (pending.length > 0) {
    const absolute = pending.pop();
    if (visited.has(absolute)) continue;
    visited.add(absolute);
    const stats = lstatSync(absolute);
    if (!stats.isFile() || stats.isSymbolicLink()) {
      fail("local runtime closure contains a non-regular file");
    }
    const path = portablePath(projectRoot, absolute);
    const bytes = readFileSync(absolute);
    entries.push({
      fileSha256: runtimeSha256(bytes),
      path,
      sizeBytes: bytes.length,
    });
    totalFileBytes += bytes.length;
    const source = bytes.toString("utf8");
    if (!Buffer.from(source, "utf8").equals(bytes)) {
      fail(`${path} is not valid UTF-8 source code`);
    }
    for (const specifier of importedSpecifiers(source)) {
      if (!specifier.startsWith(".")) continue;
      const imported = resolveLocalModule(projectRoot, absolute, specifier);
      if (imported && !visited.has(imported)) pending.push(imported);
    }
  }
  entries.sort((left, right) => byteSort(left.path, right.path));
  return {
    closureSha256: runtimeSha256(
      `${SOURCE_REGISTRATION_RUNTIME_CLOSURE_DOMAIN}${canonicalRuntimeJson(entries)}`,
    ),
    entryCount: entries.length,
    roots,
    totalFileBytes,
  };
}

export function computeSourceRegistrationRuntimeAttestation({
  projectRoot = process.cwd(),
} = {}) {
  assertControlledLauncherEnvironment();
  const canonicalProjectRoot = realpathSync(projectRoot);
  const nodeBinary = realpathSync(process.execPath);
  const nodeStats = lstatSync(nodeBinary);
  if (!nodeStats.isFile() || nodeStats.isSymbolicLink()) {
    fail("process.execPath did not resolve to a regular Node binary");
  }
  const psqlBinary = resolveExecutable("psql");
  const runtimeEnvironment = minimalRuntimeEnvironment({
    nodeBinary,
    psqlBinary,
  });
  const psqlRuntime = strongPsqlRuntimeClosure(
    canonicalProjectRoot,
    runtimeEnvironment,
  );
  const nodeRuntime = strongNodeRuntimeClosure(
    canonicalProjectRoot,
    runtimeEnvironment,
    psqlRuntime,
  );
  const psqlBinaryFileSha256 = sha256FileSync(psqlBinary);
  const psqlVersion = executableVersion(
    psqlBinary,
    ["--version"],
    runtimeEnvironment,
  );
  if (
    psqlRuntime.psqlFileSha256 !== psqlBinaryFileSha256 ||
    psqlRuntime.psqlVersion !== psqlVersion
  ) {
    fail("resolved psql root differs from the verified runtime closure");
  }
  const launcherFileSha256 = sha256FileSync(launcherPath);
  const body = {
    schemaVersion: SOURCE_REGISTRATION_RUNTIME_ATTESTATION_SCHEMA_VERSION,
    launcher: {
      fileSha256: launcherFileSha256,
      path: "scripts/knowledge/launch-locked-source-registration-apply.mjs",
    },
    localClosure: localRuntimeClosureBinding(canonicalProjectRoot),
    node: {
      arch: process.arch,
      binaryFileSha256: sha256FileSync(nodeBinary),
      platform: process.platform,
      runtimeClosureManifestSha256: nodeRuntime.manifestSha256,
      runtimeClosureSha256: nodeRuntime.closureSha256,
      runtimeClosureVerifierFileSha256: nodeRuntime.verifierFileSha256,
      version: process.version,
    },
    nodeModules: secureResolvedTreeBinding({
      projectRoot: canonicalProjectRoot,
      portableRoot: "node_modules",
    }),
    prismaGeneratedClient: secureResolvedTreeBinding({
      projectRoot: canonicalProjectRoot,
      portableRoot: "src/generated/prisma",
    }),
    psql: {
      binaryFileSha256: psqlBinaryFileSha256,
      runtimeClosureManifestSha256: psqlRuntime.manifestSha256,
      runtimeClosureSha256: psqlRuntime.closureSha256,
      runtimeClosureVerifierFileSha256: psqlRuntime.verifierFileSha256,
      version: psqlVersion,
    },
  };
  return {
    ...body,
    runtimeAttestationSha256: runtimeSha256(
      `${SOURCE_REGISTRATION_RUNTIME_ATTESTATION_DOMAIN}${canonicalRuntimeJson(body)}`,
    ),
  };
}

function valueFlag(arguments_, prefix) {
  const matches = arguments_.filter((argument) => argument.startsWith(prefix));
  if (matches.length !== 1)
    fail(`locked execution requires exactly one ${prefix.slice(0, -1)}`);
  const value = matches[0].slice(prefix.length);
  if (!value) fail(`${prefix.slice(0, -1)} cannot be empty`);
  return value;
}

function requireRuntimePins(arguments_, attestation) {
  const expected = new Map([
    ["--launcher-file-sha256=", attestation.launcher.fileSha256],
    ["--node-binary-file-sha256=", attestation.node.binaryFileSha256],
    ["--node-runtime-closure-sha256=", attestation.node.runtimeClosureSha256],
    ["--node-version=", attestation.node.version],
    ["--node-platform=", attestation.node.platform],
    ["--node-arch=", attestation.node.arch],
    ["--node-modules-tree-sha256=", attestation.nodeModules.treeSha256],
    [
      "--prisma-generated-client-tree-sha256=",
      attestation.prismaGeneratedClient.treeSha256,
    ],
    ["--runtime-local-closure-sha256=", attestation.localClosure.closureSha256],
    ["--psql-binary-file-sha256=", attestation.psql.binaryFileSha256],
    ["--psql-runtime-closure-sha256=", attestation.psql.runtimeClosureSha256],
    ["--psql-version=", attestation.psql.version],
    ["--runtime-attestation-sha256=", attestation.runtimeAttestationSha256],
  ]);
  for (const [prefix, exact] of expected) {
    if (valueFlag(arguments_, prefix) !== exact) {
      fail(`${prefix.slice(0, -1)} differs from the pre-import attestation`);
    }
  }
}

function runtimeEnvelope(attestation) {
  const body = {
    attestation,
    launcherPid: process.pid,
  };
  return {
    ...body,
    envelopeSha256: runtimeSha256(
      `${SOURCE_REGISTRATION_RUNTIME_ENVELOPE_DOMAIN}${canonicalRuntimeJson(body)}`,
    ),
  };
}

function launchRunner(
  arguments_,
  attestation,
  databaseUrl,
  {
    environmentAdditions = {},
    runner = "scripts/knowledge/apply-source-registration-plan.ts",
  } = {},
) {
  const directory = mkdtempSync(
    join(tmpdir(), "foodsystems-source-registration-runtime-"),
  );
  chmodSync(directory, 0o700);
  const envelopePath = join(directory, "runtime-attestation.json");
  let descriptor;
  try {
    writeFileSync(
      envelopePath,
      `${canonicalRuntimeJson(runtimeEnvelope(attestation))}\n`,
      { mode: 0o400 },
    );
    chmodSync(envelopePath, 0o400);
    descriptor = openSync(envelopePath, "r");
    fsyncSync(descriptor);
    unlinkSync(envelopePath);
    const result = spawnSync(
      process.execPath,
      ["--import=tsx", runner, ...arguments_],
      {
        cwd: process.cwd(),
        env: minimalRuntimeEnvironment({
          additions: {
            ...environmentAdditions,
            SOURCE_REGISTRATION_LAUNCH_ATTESTATION_FD: "3",
            SOURCE_REGISTRATION_LAUNCHER_PID: String(process.pid),
          },
          databaseUrl,
        }),
        stdio: ["inherit", "inherit", "inherit", descriptor],
      },
    );
    if (result.error)
      fail(`runner process failed to start: ${result.error.message}`);
    return result;
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
    rmSync(directory, { force: true, recursive: true });
  }
}

function logicalCloneRehearsalEnvironmentAdditions(environment = process.env) {
  const additions = {};
  for (const name of LOGICAL_CLONE_REHEARSAL_ENVIRONMENT_NAMES) {
    const value = environment[name];
    if (
      typeof value !== "string" ||
      value.length === 0 ||
      /[\0\r\n]/.test(value)
    ) {
      fail("logical-clone rehearsal environment is incomplete");
    }
    additions[name] = value;
  }
  return additions;
}

function logicalCloneRehearsalCodePins(projectRoot = process.cwd()) {
  const bindings = [
    [
      "--apply-runner-sha256=",
      "scripts/knowledge/apply-source-registration-plan.ts",
    ],
    [
      "--rehearsal-runtime-sha256=",
      "src/lib/knowledge/source-registration-logical-clone-rehearsal.ts",
    ],
    [
      "--rehearsal-schema-sha256=",
      "knowledge/schema/source-registration-logical-clone-rehearsal-receipt.schema.v1.json",
    ],
    [
      "--rehearsal-test-sha256=",
      "tests/lib/source-registration-logical-clone-rehearsal.test.ts",
    ],
    ["--rehearsal-command-runner-sha256=", LOGICAL_CLONE_REHEARSAL_RUNNER],
  ];
  return bindings.map(
    ([prefix, path]) =>
      `${prefix}${sha256FileSync(realpathSync(resolve(projectRoot, path)))}`,
  );
}

function main() {
  assertControlledLauncherEnvironment();
  const arguments_ = process.argv.slice(2);
  if (arguments_.includes("--attest-only")) {
    if (arguments_.length !== 1)
      fail("--attest-only accepts no other arguments");
    process.stdout.write(
      `${canonicalRuntimeJson(computeSourceRegistrationRuntimeAttestation())}\n`,
    );
    return;
  }
  const databaseUrl = process.env.DATABASE_URL;
  if (typeof databaseUrl !== "string" || databaseUrl.length === 0) {
    fail(
      "DATABASE_URL must be supplied explicitly to the launcher environment",
    );
  }
  const attestation = computeSourceRegistrationRuntimeAttestation();
  const rehearsalCount = arguments_.filter(
    (argument) => argument === "--rehearse-logical-clone",
  ).length;
  if (rehearsalCount > 1) fail("duplicate rehearsal mode flag");
  if (rehearsalCount === 1) {
    if (arguments_.length !== 1) {
      fail("logical-clone rehearsal accepts no caller-supplied arguments");
    }
    const result = launchRunner(
      logicalCloneRehearsalCodePins(),
      attestation,
      databaseUrl,
      {
        environmentAdditions: logicalCloneRehearsalEnvironmentAdditions(),
        runner: LOGICAL_CLONE_REHEARSAL_RUNNER,
      },
    );
    const after = computeSourceRegistrationRuntimeAttestation();
    if (canonicalRuntimeJson(after) !== canonicalRuntimeJson(attestation)) {
      fail("runtime attestation changed while the rehearsal was active");
    }
    if (result.signal) fail(`rehearsal terminated by signal ${result.signal}`);
    if (result.status !== 0) process.exitCode = result.status ?? 1;
    return;
  }
  const applyCount = arguments_.filter(
    (argument) => argument === "--apply",
  ).length;
  if (applyCount > 1) fail("duplicate --apply mode flag");
  if (applyCount === 1) requireRuntimePins(arguments_, attestation);
  const result = launchRunner(arguments_, attestation, databaseUrl);
  const after = computeSourceRegistrationRuntimeAttestation();
  if (canonicalRuntimeJson(after) !== canonicalRuntimeJson(attestation)) {
    fail("runtime attestation changed while the runner was active");
  }
  if (result.signal) fail(`runner terminated by signal ${result.signal}`);
  if (result.status !== 0) process.exitCode = result.status ?? 1;
}

const invoked = process.argv[1]
  ? pathToFileURL(realpathSync(process.argv[1])).href
  : null;
if (invoked === import.meta.url) {
  try {
    main();
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  }
}
