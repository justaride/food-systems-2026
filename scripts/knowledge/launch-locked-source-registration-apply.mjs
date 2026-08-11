#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import {
  chmodSync,
  closeSync,
  constants,
  copyFileSync,
  fchmodSync,
  fstatSync,
  fsyncSync,
  linkSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  realpathSync,
  rmdirSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import {
  basename,
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
export const SOURCE_REGISTRATION_LOCKED_POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_SHA256 =
  "2f102d12bb738a5ec935e52a76cb6b156e58d86ef8e56a2bef3711c087de7bf0";
export const SOURCE_REGISTRATION_LOCKED_POSTGRESQL_TOOLSET_RUNTIME_MANIFEST_SHA256 =
  "7d0ac827430cd0d60c3884ac98fc5769223861fee17a18dd9375b10852fd8fdb";
export const SOURCE_REGISTRATION_LOCKED_POSTGRESQL_TOOLSET_RUNTIME_VERIFIER_SHA256 =
  "f5f0fb008f87f26246d39fbc3583742da49d3b257a0658178486d78e2d7ec0c7";
// Compatibility exports for existing attestation and CLI field names. The
// bound closure now covers psql, pg_restore, createdb and dropdb together.
export const SOURCE_REGISTRATION_LOCKED_PSQL_RUNTIME_CLOSURE_SHA256 =
  SOURCE_REGISTRATION_LOCKED_POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_SHA256;
export const SOURCE_REGISTRATION_LOCKED_PSQL_RUNTIME_MANIFEST_SHA256 =
  SOURCE_REGISTRATION_LOCKED_POSTGRESQL_TOOLSET_RUNTIME_MANIFEST_SHA256;
export const SOURCE_REGISTRATION_LOCKED_PSQL_RUNTIME_VERIFIER_SHA256 =
  SOURCE_REGISTRATION_LOCKED_POSTGRESQL_TOOLSET_RUNTIME_VERIFIER_SHA256;
export const SOURCE_REGISTRATION_LOCKED_NODE_RUNTIME_CLOSURE_SHA256 =
  "52cb48e8c77925a28d5c21574ea9867540ac71c88ba556ae3a48218bc67509bf";
export const SOURCE_REGISTRATION_LOCKED_NODE_RUNTIME_MANIFEST_SHA256 =
  "f224b177c6f2ce4864815627dccd62dae3ed794a24eb4945cc923d018bc749e4";
export const SOURCE_REGISTRATION_LOCKED_NODE_RUNTIME_VERIFIER_SHA256 =
  "09d760bcb798e5c87882116fa05f120818aa9169f53b391073a06a825f17059c";

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
const LAUNCHER_CONTROLLED_RUNTIME_ENVIRONMENT_NAMES = new Set([
  "TSX_TSCONFIG_PATH",
]);
const FIXED_SYSTEM_PATHS = ["/usr/bin", "/bin", "/usr/sbin", "/sbin"];
const SOURCE_REGISTRATION_LOCKED_PSQL_LOADER_PATH = "/opt/homebrew/bin/psql";
const LOGICAL_CLONE_REHEARSAL_RUNNER =
  "scripts/knowledge/run-source-registration-logical-clone-rehearsal.ts";
export const LOGICAL_RESTORE_COMPANION_MODE = "--logical-restore-companion";
export const LOGICAL_RESTORE_COMPANION_RUNNER =
  "scripts/knowledge/run-controlled-logical-restore-companion.mjs";
export const CONTROLLED_LOGICAL_RESTORE_DIAGNOSTIC_CODES = Object.freeze([
  "ACK_REQUIRED",
  "ARCHIVE_CATALOG",
  "ARGUMENTS_FORBIDDEN",
  "CATALOG_COMMAND_FAILED",
  "CLEANUP_ABSENCE",
  "CLEANUP_FAILED",
  "CLONE_NAME",
  "CLONE_IDENTITY",
  "CLONE_OWNERSHIP",
  "CLONE_PREEXISTS",
  "CLONE_CREATE_COMMAND_FAILED",
  "CLONE_EXTENSION_VERIFY_COMMAND_FAILED",
  "CLONE_INITIALIZE_COMMAND_FAILED",
  "CLONE_PREFLIGHT_COMMAND_FAILED",
  "CLONE_REHEARSAL_COMMAND_FAILED",
  "CLONE_RESTORE_COMMAND_FAILED",
  "COMMAND_FAILED",
  "COMMAND_INPUT",
  "COMMAND_START",
  "COMPARISON_FAILED",
  "COMPARISON_INCOMPLETE",
  "CONTROLLED_FAILURE",
  "DATABASE_EXISTENCE",
  "DATABASE_TARGET",
  "DATABASE_URL_INVALID",
  "DUMP_BINDING",
  "DUMP_CHANGED",
  "DUMP_STREAM",
  "ENVIRONMENT_REQUIRED",
  "EVIDENCE_CANONICAL",
  "EVIDENCE_COUNT",
  "EVIDENCE_DISCLOSURE",
  "EVIDENCE_DRIFT",
  "EVIDENCE_HASH",
  "EVIDENCE_JSON",
  "EVIDENCE_SHAPE",
  "EVIDENCE_TIME",
  "EVIDENCE_UTF8",
  "EXTENSION_INITIALIZER_ATTESTATION",
  "EXTENSION_INITIALIZER_FAILED",
  "EXTENSION_INITIALIZER_MUTATION",
  "EXTENSION_INITIALIZER_PREFLIGHT",
  "EXTENSION_INITIALIZER_REQUEST",
  "EXTENSION_INITIALIZER_RUNTIME",
  "EXTENSION_INITIALIZER_SOURCE_STATE",
  "EXTENSION_INITIALIZER_VERIFY",
  "EXECUTABLE_INVALID",
  "EXECUTABLE_SET",
  "EXPECTED_EVIDENCE_BINDING",
  "EXPECTED_PRELOAD_CONTEXT_BINDING",
  "EXPECTED_REHEARSAL_RUNTIME_BINDING",
  "FILE_CHANGED",
  "FILE_HASH_FAILED",
  "HANDLED_SIGNAL",
  "LAUNCHER_ATTESTATION",
  "LAUNCHER_REQUIRED",
  "LOGICAL_DIGEST",
  "LOGICAL_DIGEST_CLUSTER",
  "LOGICAL_DIGEST_COUNT",
  "LOGICAL_DIGEST_SHAPE",
  "LOGICAL_DIGEST_TARGET",
  "LOGICAL_DIGEST_TOOL",
  "LOGICAL_MISMATCH",
  "METADATA_BINDING",
  "METADATA_DUMP",
  "METADATA_FINGERPRINT",
  "METADATA_IDENTITY",
  "METADATA_SOURCE",
  "METADATA_VERSION",
  "PRIVATE_FILE_CHANGED",
  "PRIVATE_FILE_INVALID",
  "PRIVATE_FILE_READ_FAILED",
  "PRIVATE_FILE_TOO_LARGE",
  "PRIVATE_FILE_UNREADABLE",
  "PRIVATE_PATH_INVALID",
  "PRIVATE_PATH_SCOPE",
  "POSTGRESQL_EXTENSION_RUNTIME_BINDING",
  "POSTGRESQL_EXTENSION_RUNTIME_CLOSURE",
  "PSQL_RUNTIME_BINDING",
  "PSQL_RUNTIME_CLOSURE",
  "RECEIPT_EXISTS",
  "RECEIPT_NAME",
  "RECEIPT_PARENT",
  "RECEIPT_PARENT_DRIFT",
  "RECEIPT_PATH_COLLISION",
  "RECEIPT_PUBLICATION",
  "RECEIPT_TARGET",
  "REHEARSAL_BINDING",
  "REHEARSAL_CALLBACK",
  "REHEARSAL_CALLBACK_BINDING",
  "REHEARSAL_DATABASE_TARGET",
  "REHEARSAL_DRIFT",
  "REHEARSAL_EXECUTABLE",
  "REHEARSAL_INCOMPLETE",
  "REHEARSAL_INPUTS",
  "REHEARSAL_LAUNCHER_ATTESTATION",
  "REHEARSAL_PROOF_RUNTIME",
  "REHEARSAL_RECEIPT_CODE_BINDING",
  "REHEARSAL_RECEIPT_INVALID",
  "REHEARSAL_RECEIPT_MODE",
  "REHEARSAL_RECEIPT_PROOF",
  "REHEARSAL_RECEIPT_RUNTIME_BINDING",
  "REHEARSAL_RECEIPT_SCHEMA",
  "REHEARSAL_RESIDUE",
  "REHEARSAL_ROLLBACK",
  "REHEARSAL_RUNTIME",
  "REHEARSAL_RUNTIME_ATTESTATION",
  "REHEARSAL_RUNTIME_BINDING",
  "REHEARSAL_RUNTIME_DRIFT",
  "REHEARSAL_SCHEMA",
  "REHEARSAL_TIME",
  "RESTORE_LIST_CAPABILITY",
  "RESTORE_LIST_CATALOG",
  "RESTORE_LIST_DESCRIPTOR",
  "SIGNAL_INVALID",
  "SOURCE_DRIFT",
  "STRUCTURAL_RECEIPT_BINDING",
  "STRUCTURAL_RECEIPT_CHECK",
  "STRUCTURAL_RECEIPT_CLEANUP",
  "STRUCTURAL_RECEIPT_TIME",
  "STRUCTURAL_RECEIPT_VERSION",
  "TOOL_DRIFT",
  "TOOL_FILE_INVALID",
  "TOOL_FILE_UNREADABLE",
]);
const CONTROLLED_LOGICAL_RESTORE_EXACT_DIAGNOSTICS = Object.freeze(
  CONTROLLED_LOGICAL_RESTORE_DIAGNOSTIC_CODES.map((code) => [
    Buffer.from(`[logical-restore-companion] ERROR ${code}\n`, "utf8"),
    `COMPANION_CHILD_${code}`,
  ]),
);
export const LOGICAL_RESTORE_RECEIPT_PAIR_JOURNAL =
  "scripts/knowledge/logical-restore-receipt-pair-journal.mjs";
export const SOURCE_REGISTRATION_TSX_CONFIG =
  "knowledge/runtime/source-registration-tsx.runtime.json";
const SOURCE_REGISTRATION_PACKAGE_JSON = "package.json";
const SOURCE_REGISTRATION_EXECUTION_SNAPSHOT_PREFIX =
  "foodsystems-source-registration-execution-";
const SOURCE_REGISTRATION_FIXED_TEMPORARY_ROOT = "/tmp";
const SOURCE_REGISTRATION_TRUSTED_LAUNCHER_PREFIX =
  "foodsystems-source-registration-trusted-launcher-";
const SOURCE_REGISTRATION_TRUSTED_LAUNCHER_FD_NAME =
  "SOURCE_REGISTRATION_TRUSTED_LAUNCHER_FD";
const SOURCE_REGISTRATION_TRUSTED_BOOTSTRAP_PID_NAME =
  "SOURCE_REGISTRATION_TRUSTED_BOOTSTRAP_PID";
const SOURCE_REGISTRATION_TRUSTED_PUBLIC_PINS_FD_NAME =
  "SOURCE_REGISTRATION_TRUSTED_PUBLIC_PINS_FD";
const SOURCE_REGISTRATION_TRUSTED_SECRET_INPUT_FD_NAME =
  "SOURCE_REGISTRATION_TRUSTED_SECRET_INPUT_FD";
const SOURCE_REGISTRATION_TRUSTED_PUBLIC_PINS_FORMAT =
  "foodsystems-source-registration-trusted-public-pins";
const SOURCE_REGISTRATION_TRUSTED_SECRET_INPUT_FORMAT =
  "foodsystems-source-registration-trusted-secret-input";
const SOURCE_REGISTRATION_TRUSTED_COMPANION_PURPOSE =
  "logical_restore_companion";
const SOURCE_REGISTRATION_EXECUTION_PROJECT_DIRECTORIES = Object.freeze([
  "knowledge/corpus/pdf-page-extraction",
  "knowledge/corpus/source-acquisition-receipts",
  "knowledge/corpus/source-analysis-input-manifests",
  "knowledge/corpus/source-registration",
  "knowledge/keys",
  "knowledge/schema",
  "prisma",
  "scripts",
  "src/lib",
  "tests/lib",
]);
const SOURCE_REGISTRATION_EXECUTION_PROJECT_FILES = Object.freeze([
  "knowledge/corpus/SOURCE-REGISTRATION-APPLY-CONTRACT.md",
  "knowledge/corpus/SOURCE-REGISTRATION-PLAN-CONTRACT.md",
  "knowledge/corpus/SOURCE-REGISTRATION-RELEASE-AUTHORIZATION.md",
  "knowledge/corpus/corpus-private-recovery-candidates.v1.json",
  SOURCE_REGISTRATION_PACKAGE_JSON,
  "package-lock.json",
  SOURCE_REGISTRATION_TSX_CONFIG,
]);
export const LOGICAL_RESTORE_COMPANION_ENVIRONMENT_NAMES = Object.freeze([
  "DATABASE_RESTORE_ADMIN_URL",
  "LOGICAL_RESTORE_ACK",
  "LOGICAL_RESTORE_COMPANION_RECEIPT_PATH",
  "LOGICAL_RESTORE_DUMP_PATH",
  "LOGICAL_RESTORE_EXPECTED_DUMP_BYTES",
  "LOGICAL_RESTORE_EXPECTED_DUMP_SHA256",
  "LOGICAL_RESTORE_EXPECTED_METADATA_SHA256",
  "LOGICAL_RESTORE_EXPECTED_COMPANION_RECEIPT_SCHEMA_SHA256",
  "LOGICAL_RESTORE_EXPECTED_COMPANION_TEST_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_APPLY_RUNNER_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_APPLY_RUNTIME_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_LAUNCHER_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_LOCAL_RUNTIME_CLOSURE_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_BINARY_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_MODULES_TREE_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_RUNTIME_CLOSURE_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_RUNTIME_MANIFEST_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_RUNTIME_VERIFIER_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_POSTGRESQL_TOOLSET_CLOSURE_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_POSTGRESQL_TOOLSET_MANIFEST_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_POSTGRESQL_TOOLSET_VERIFIER_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_PRISMA_CLIENT_TREE_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_REHEARSAL_COMMAND_RUNNER_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_REHEARSAL_RUNTIME_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_REHEARSAL_SCHEMA_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_REHEARSAL_TEST_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_RUNTIME_ATTESTATION_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_PACKAGE_JSON_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_TSX_CONFIG_SHA256",
  "LOGICAL_RESTORE_EXPECTED_STRUCTURAL_COMPLETED_AT_UTC",
  "LOGICAL_RESTORE_EXPECTED_STRUCTURAL_RECEIPT_SHA256",
  "LOGICAL_RESTORE_METADATA_BINDING_PATH",
  "LOGICAL_RESTORE_METADATA_PATH",
  "LOGICAL_RESTORE_PRIMARY_CORPUS_ROOT",
  "LOGICAL_RESTORE_REHEARSAL_RECEIPT_PATH",
  "LOGICAL_RESTORE_REPLICA_CORPUS_ROOT",
  "LOGICAL_RESTORE_STRUCTURAL_RECEIPT_PATH",
]);
export const LOGICAL_RESTORE_COMPANION_PRELOAD_PIN_ENVIRONMENT_NAMES =
  Object.freeze([
    "LOGICAL_RESTORE_EXPECTED_COMPANION_RECEIPT_SCHEMA_SHA256",
    "LOGICAL_RESTORE_EXPECTED_COMPANION_TEST_SHA256",
    "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_APPLY_RUNNER_SHA256",
    "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_APPLY_RUNTIME_SHA256",
    "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_LAUNCHER_SHA256",
    "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_LOCAL_RUNTIME_CLOSURE_SHA256",
    "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_BINARY_SHA256",
    "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_MODULES_TREE_SHA256",
    "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_RUNTIME_CLOSURE_SHA256",
    "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_RUNTIME_MANIFEST_SHA256",
    "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_RUNTIME_VERIFIER_SHA256",
    "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_POSTGRESQL_TOOLSET_CLOSURE_SHA256",
    "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_POSTGRESQL_TOOLSET_MANIFEST_SHA256",
    "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_POSTGRESQL_TOOLSET_VERIFIER_SHA256",
    "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_PRISMA_CLIENT_TREE_SHA256",
    "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_REHEARSAL_COMMAND_RUNNER_SHA256",
    "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_REHEARSAL_RUNTIME_SHA256",
    "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_REHEARSAL_SCHEMA_SHA256",
    "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_REHEARSAL_TEST_SHA256",
    "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_RUNTIME_ATTESTATION_SHA256",
    "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_PACKAGE_JSON_SHA256",
    "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_TSX_CONFIG_SHA256",
  ]);
const LOGICAL_RESTORE_COMPANION_PRELOAD_PIN_ENVIRONMENT_NAME_SET = new Set(
  LOGICAL_RESTORE_COMPANION_PRELOAD_PIN_ENVIRONMENT_NAMES,
);
export const LOGICAL_RESTORE_COMPANION_SECRET_ENVIRONMENT_NAMES = Object.freeze(
  LOGICAL_RESTORE_COMPANION_ENVIRONMENT_NAMES.filter(
    (name) =>
      !LOGICAL_RESTORE_COMPANION_PRELOAD_PIN_ENVIRONMENT_NAME_SET.has(name),
  ),
);

const executingLauncherPath = realpathSync(fileURLToPath(import.meta.url));

let logicalRestoreCompanionDiagnosticWritten = false;
let logicalRestoreCompanionOuterDiagnostic = "COMPANION_REFUSED";

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
      (isForbiddenChildEnvironmentName(name) &&
        !LAUNCHER_CONTROLLED_RUNTIME_ENVIRONMENT_NAMES.has(name)) ||
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
  const resolvedPsql =
    psqlBinary ?? realpathSync(SOURCE_REGISTRATION_LOCKED_PSQL_LOADER_PATH);
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
    attestation.toolBinaryCount !== 4 ||
    attestation.homebrewObjectCount !== 16 ||
    attestation.loaderAliasCount !== 17 ||
    attestation.systemDylibReferenceCount !== 9 ||
    attestation.dyldCacheFileCount !== 13 ||
    attestation.totalRuntimeBytes !== 5_810_881_056 ||
    canonicalRuntimeJson(attestation.toolFileSha256) !==
      canonicalRuntimeJson({
        createdb:
          "4d903ba229ba993a2803ff36981a7890abfbaa097ed64548d59b6932e0a860b3",
        dropdb:
          "34f7f2143da5c450981806df325f14a71377d6b7bc5b6a9a78267254c1b38eb9",
        pgRestore:
          "973d13de60c55dbc374390fe87027f9434bddffe7b0abd27b4e947e6639feb0d",
        psql: "5d5b74a77b010cb7e199af2288e099c72c54b0f27039bf99233ed1a6eec76b66",
      }) ||
    attestation.psqlFileSha256 !== attestation.toolFileSha256?.psql ||
    attestation.forbiddenLoaderEnvironmentPresent !== false
  ) {
    fail(
      "strong PostgreSQL toolset runtime-closure attestation facts are invalid",
    );
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
    "knowledge/corpus/source-registration/node-runtime-closure-darwin-arm64-2026-08-11.v1.json",
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
    attestation.homebrewObjectBytes !== 119_598_928 ||
    attestation.totalRuntimeBytes !== 5_920_304_976 ||
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

function copyControlledSnapshotTree(sourceRoot, targetRoot) {
  const canonicalSourceRoot = realpathSync(sourceRoot);
  const rootStats = lstatSync(canonicalSourceRoot);
  if (!rootStats.isDirectory() || rootStats.isSymbolicLink()) {
    fail("execution snapshot source is not a canonical directory");
  }
  mkdirSync(targetRoot, { mode: 0o700, recursive: true });
  chmodSync(targetRoot, 0o700);
  const walk = (sourceDirectory, targetDirectory) => {
    for (const name of readdirSync(sourceDirectory).sort(byteSort)) {
      const source = join(sourceDirectory, name);
      const target = join(targetDirectory, name);
      const stats = lstatSync(source);
      const mode = stats.mode & 0o7777;
      if (stats.isDirectory() && !stats.isSymbolicLink()) {
        mkdirSync(target, { mode });
        chmodSync(target, mode);
        walk(source, target);
        continue;
      }
      if (stats.isFile() && !stats.isSymbolicLink()) {
        copyFileSync(
          source,
          target,
          (constants.COPYFILE_EXCL ?? 0) | (constants.COPYFILE_FICLONE ?? 0),
        );
        chmodSync(target, mode);
        const copied = lstatSync(target);
        if (
          !copied.isFile() ||
          copied.isSymbolicLink() ||
          copied.size !== stats.size
        ) {
          fail("execution snapshot file copy is not exact");
        }
        continue;
      }
      if (stats.isSymbolicLink()) {
        const linkTarget = readlinkSync(source);
        const resolvedTarget = realpathSync(source);
        if (
          isAbsolute(linkTarget) ||
          linkTarget.includes("\\") ||
          (resolvedTarget !== canonicalSourceRoot &&
            !resolvedTarget.startsWith(`${canonicalSourceRoot}${sep}`))
        ) {
          fail("execution snapshot link escaped its controlled tree");
        }
        symlinkSync(linkTarget, target);
        continue;
      }
      fail("execution snapshot contains a special filesystem entry");
    }
  };
  walk(canonicalSourceRoot, targetRoot);
}

function copyControlledSnapshotFile(projectRoot, snapshotProjectRoot, path) {
  const source = realpathSync(resolve(projectRoot, path));
  const portable = portablePath(projectRoot, source);
  if (portable !== path) {
    fail("execution snapshot file path differs from its controlled path");
  }
  const stats = lstatSync(source);
  if (!stats.isFile() || stats.isSymbolicLink()) {
    fail("execution snapshot input is not a regular file");
  }
  const target = resolve(snapshotProjectRoot, path);
  mkdirSync(dirname(target), { mode: 0o700, recursive: true });
  copyFileSync(
    source,
    target,
    (constants.COPYFILE_EXCL ?? 0) | (constants.COPYFILE_FICLONE ?? 0),
  );
  chmodSync(target, stats.mode & 0o7777);
}

function isOwnedExecutionSnapshotRoot(path) {
  try {
    const canonical = realpathSync(path);
    const canonicalTemporaryRoot = realpathSync(
      SOURCE_REGISTRATION_FIXED_TEMPORARY_ROOT,
    );
    return (
      dirname(canonical) === canonicalTemporaryRoot &&
      basename(canonical).startsWith(
        SOURCE_REGISTRATION_EXECUTION_SNAPSHOT_PREFIX,
      ) &&
      canonical !== canonicalTemporaryRoot
    );
  } catch {
    return false;
  }
}

export function removeSourceRegistrationExecutionSnapshot(snapshotRoot) {
  if (!isOwnedExecutionSnapshotRoot(snapshotRoot)) {
    fail("execution snapshot cleanup target is invalid");
  }
  rmSync(snapshotRoot, { force: true, recursive: true });
}

export function createSourceRegistrationExecutionSnapshot({
  projectRoot = process.cwd(),
} = {}) {
  const canonicalProjectRoot = realpathSync(projectRoot);
  const snapshotRoot = realpathSync(
    mkdtempSync(
      join(
        SOURCE_REGISTRATION_FIXED_TEMPORARY_ROOT,
        SOURCE_REGISTRATION_EXECUTION_SNAPSHOT_PREFIX,
      ),
    ),
  );
  chmodSync(snapshotRoot, 0o700);
  const snapshotProjectRoot = join(snapshotRoot, "project");
  try {
    mkdirSync(snapshotProjectRoot, { mode: 0o700 });
    for (const path of SOURCE_REGISTRATION_EXECUTION_PROJECT_DIRECTORIES) {
      const source = realpathSync(resolve(canonicalProjectRoot, path));
      if (portablePath(canonicalProjectRoot, source) !== path) {
        fail("execution snapshot directory path differs");
      }
      copyControlledSnapshotTree(source, resolve(snapshotProjectRoot, path));
    }
    for (const path of SOURCE_REGISTRATION_EXECUTION_PROJECT_FILES) {
      copyControlledSnapshotFile(
        canonicalProjectRoot,
        snapshotProjectRoot,
        path,
      );
    }

    const dependencySnapshotRoot = join(snapshotRoot, "node_modules");
    copyControlledSnapshotTree(
      realpathSync(resolve(canonicalProjectRoot, "node_modules")),
      dependencySnapshotRoot,
    );
    symlinkSync(
      relative(snapshotProjectRoot, dependencySnapshotRoot),
      join(snapshotProjectRoot, "node_modules"),
    );

    const prismaSnapshotRoot = join(snapshotRoot, "prisma-generated");
    copyControlledSnapshotTree(
      realpathSync(resolve(canonicalProjectRoot, "src/generated/prisma")),
      prismaSnapshotRoot,
    );
    const generatedDirectory = join(snapshotProjectRoot, "src/generated");
    mkdirSync(generatedDirectory, { mode: 0o700, recursive: true });
    symlinkSync(
      relative(generatedDirectory, prismaSnapshotRoot),
      join(generatedDirectory, "prisma"),
    );

    return {
      projectRoot: realpathSync(snapshotProjectRoot),
      snapshotRoot,
    };
  } catch (error) {
    try {
      removeSourceRegistrationExecutionSnapshot(snapshotRoot);
    } catch {
      // Preserve the original fail-closed snapshot error.
    }
    throw error;
  }
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
    SOURCE_REGISTRATION_PACKAGE_JSON,
    SOURCE_REGISTRATION_TSX_CONFIG,
    "scripts/knowledge/apply-source-registration-plan.ts",
    LOGICAL_CLONE_REHEARSAL_RUNNER,
    LOGICAL_RESTORE_COMPANION_RUNNER,
    LOGICAL_RESTORE_RECEIPT_PAIR_JOURNAL,
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
  const psqlBinary = realpathSync(SOURCE_REGISTRATION_LOCKED_PSQL_LOADER_PATH);
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
  if (psqlRuntime.psqlFileSha256 !== psqlBinaryFileSha256) {
    fail("resolved psql root differs from the verified runtime closure");
  }
  const psqlVersion = executableVersion(
    psqlBinary,
    ["--version"],
    runtimeEnvironment,
  );
  if (psqlRuntime.psqlVersion !== psqlVersion) {
    fail("resolved psql root differs from the verified runtime closure");
  }
  const launcherFileSha256 = sha256FileSync(
    realpathSync(
      resolve(
        canonicalProjectRoot,
        "scripts/knowledge/launch-locked-source-registration-apply.mjs",
      ),
    ),
  );
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
    postgresqlToolset: {
      closureSha256: psqlRuntime.closureSha256,
      manifestSha256: psqlRuntime.manifestSha256,
      psqlVersion,
      toolFileSha256: psqlRuntime.toolFileSha256,
      verifierFileSha256: psqlRuntime.verifierFileSha256,
    },
  };
  return {
    ...body,
    runtimeAttestationSha256: runtimeSha256(
      `${SOURCE_REGISTRATION_RUNTIME_ATTESTATION_DOMAIN}${canonicalRuntimeJson(body)}`,
    ),
  };
}

function runtimeEnvelope(attestation, launchPurpose) {
  const body = {
    attestation,
    launcherPid: process.pid,
    ...(launchPurpose === undefined ? {} : { launchPurpose }),
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
    captureOutput = false,
    environmentAdditions = {},
    launchPurpose,
    projectRoot = process.cwd(),
    runner = "scripts/knowledge/apply-source-registration-plan.ts",
  } = {},
) {
  const directory = mkdtempSync(
    join(
      SOURCE_REGISTRATION_FIXED_TEMPORARY_ROOT,
      "foodsystems-source-registration-runtime-",
    ),
  );
  chmodSync(directory, 0o700);
  const envelopePath = join(directory, "runtime-attestation.json");
  let descriptor;
  try {
    writeFileSync(
      envelopePath,
      `${canonicalRuntimeJson(runtimeEnvelope(attestation, launchPurpose))}\n`,
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
        cwd: projectRoot,
        ...(captureOutput ? { encoding: "utf8", maxBuffer: 1_000_000 } : {}),
        env: minimalRuntimeEnvironment({
          additions: {
            ...environmentAdditions,
            SOURCE_REGISTRATION_LAUNCH_ATTESTATION_FD: "3",
            SOURCE_REGISTRATION_LAUNCHER_PID: String(process.pid),
            TSX_TSCONFIG_PATH: realpathSync(
              resolve(projectRoot, SOURCE_REGISTRATION_TSX_CONFIG),
            ),
          },
          databaseUrl,
        }),
        stdio: captureOutput
          ? ["inherit", "pipe", "pipe", descriptor]
          : ["inherit", "inherit", "inherit", descriptor],
      },
    );
    if (result.error) fail("runner process failed to start");
    return result;
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
    rmSync(directory, { force: true, recursive: true });
  }
}

export function logicalRestoreCompanionEnvironmentAdditions(
  environment = process.env,
) {
  const additions = {};
  for (const name of LOGICAL_RESTORE_COMPANION_ENVIRONMENT_NAMES) {
    const value = environment[name];
    if (
      typeof value !== "string" ||
      value.length === 0 ||
      /[\0\r\n]/.test(value)
    ) {
      fail("logical-restore companion environment is incomplete");
    }
    additions[name] = value;
  }
  return additions;
}

export function requireLogicalRestoreCompanionExpectedPins({
  attestation,
  environment,
  projectRoot = process.cwd(),
}) {
  const actual = {
    LOGICAL_RESTORE_EXPECTED_COMPANION_RECEIPT_SCHEMA_SHA256: sha256FileSync(
      realpathSync(
        resolve(
          projectRoot,
          "knowledge/schema/database-logical-restore-companion-receipt.schema.v1.json",
        ),
      ),
    ),
    LOGICAL_RESTORE_EXPECTED_COMPANION_TEST_SHA256: sha256FileSync(
      realpathSync(
        resolve(
          projectRoot,
          "tests/lib/database-logical-restore-companion.test.ts",
        ),
      ),
    ),
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_APPLY_RUNNER_SHA256:
      sha256FileSync(
        realpathSync(
          resolve(
            projectRoot,
            "scripts/knowledge/apply-source-registration-plan.ts",
          ),
        ),
      ),
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_APPLY_RUNTIME_SHA256:
      sha256FileSync(
        realpathSync(
          resolve(
            projectRoot,
            "src/lib/knowledge/source-registration-apply.ts",
          ),
        ),
      ),
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_LAUNCHER_SHA256:
      attestation.launcher.fileSha256,
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_LOCAL_RUNTIME_CLOSURE_SHA256:
      attestation.localClosure.closureSha256,
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_BINARY_SHA256:
      attestation.node.binaryFileSha256,
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_MODULES_TREE_SHA256:
      attestation.nodeModules.treeSha256,
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_RUNTIME_CLOSURE_SHA256:
      attestation.node.runtimeClosureSha256,
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_RUNTIME_MANIFEST_SHA256:
      attestation.node.runtimeClosureManifestSha256,
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_RUNTIME_VERIFIER_SHA256:
      attestation.node.runtimeClosureVerifierFileSha256,
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_POSTGRESQL_TOOLSET_CLOSURE_SHA256:
      attestation.postgresqlToolset.closureSha256,
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_POSTGRESQL_TOOLSET_MANIFEST_SHA256:
      attestation.postgresqlToolset.manifestSha256,
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_POSTGRESQL_TOOLSET_VERIFIER_SHA256:
      attestation.postgresqlToolset.verifierFileSha256,
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_PRISMA_CLIENT_TREE_SHA256:
      attestation.prismaGeneratedClient.treeSha256,
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_REHEARSAL_COMMAND_RUNNER_SHA256:
      sha256FileSync(
        realpathSync(resolve(projectRoot, LOGICAL_CLONE_REHEARSAL_RUNNER)),
      ),
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_REHEARSAL_RUNTIME_SHA256:
      sha256FileSync(
        realpathSync(
          resolve(
            projectRoot,
            "src/lib/knowledge/source-registration-logical-clone-rehearsal.ts",
          ),
        ),
      ),
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_REHEARSAL_SCHEMA_SHA256:
      sha256FileSync(
        realpathSync(
          resolve(
            projectRoot,
            "knowledge/schema/source-registration-logical-clone-rehearsal-receipt.schema.v1.json",
          ),
        ),
      ),
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_REHEARSAL_TEST_SHA256:
      sha256FileSync(
        realpathSync(
          resolve(
            projectRoot,
            "tests/lib/source-registration-logical-clone-rehearsal.test.ts",
          ),
        ),
      ),
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_RUNTIME_ATTESTATION_SHA256:
      attestation.runtimeAttestationSha256,
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_PACKAGE_JSON_SHA256:
      sha256FileSync(
        realpathSync(resolve(projectRoot, SOURCE_REGISTRATION_PACKAGE_JSON)),
      ),
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_TSX_CONFIG_SHA256:
      sha256FileSync(
        realpathSync(resolve(projectRoot, SOURCE_REGISTRATION_TSX_CONFIG)),
      ),
  };
  for (const [name, current] of Object.entries(actual)) {
    if (environment[name] !== current) {
      fail("logical-restore companion expected pin differs before preload");
    }
  }
  return actual;
}

function requireLogicalRestoreReceiptPairJournalRuntime(value) {
  if (
    value === null ||
    typeof value !== "object" ||
    typeof value.prepareLogicalRestoreReceiptPairJournal !== "function" ||
    typeof value.finalizeLogicalRestoreReceiptPairJournal !== "function" ||
    typeof value.recoverLogicalRestoreReceiptPairJournal !== "function"
  ) {
    fail("logical-restore receipt-pair journal runtime is invalid");
  }
  return value;
}

async function loadLogicalRestoreReceiptPairJournalRuntime(projectRoot) {
  const modulePath = realpathSync(
    resolve(projectRoot, LOGICAL_RESTORE_RECEIPT_PAIR_JOURNAL),
  );
  return requireLogicalRestoreReceiptPairJournalRuntime(
    await import(pathToFileURL(modulePath).href),
  );
}

export function validateLogicalRestoreCompanionCallback(stdout) {
  if (
    typeof stdout !== "string" ||
    Buffer.byteLength(stdout, "utf8") > 16_384 ||
    !stdout.endsWith("\n")
  ) {
    fail("companion returned an invalid controlled result");
  }
  let value;
  try {
    value = JSON.parse(stdout);
  } catch {
    fail("companion returned an invalid controlled result");
  }
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).join(",") !== "evidenceClass,receiptSha256,status" ||
    value.evidenceClass !== "logical-comparison-surrogate" ||
    typeof value.receiptSha256 !== "string" ||
    !/^[a-f0-9]{64}$/.test(value.receiptSha256) ||
    value.status !== "pass" ||
    `${JSON.stringify(value)}\n` !== stdout
  ) {
    fail("companion returned an invalid controlled result");
  }
  return value;
}

function sameFileIdentity(left, right) {
  return left.dev === right.dev && left.ino === right.ino;
}

function requireExactObjectKeys(value, expectedKeys, label) {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype ||
    canonicalRuntimeJson(Object.keys(value).sort(byteSort)) !==
      canonicalRuntimeJson([...expectedKeys].sort(byteSort))
  ) {
    fail(`${label} has an unexpected shape`);
  }
  return value;
}

function requireExactStringEnvironment(value, expectedNames, label) {
  const environment = requireExactObjectKeys(value, expectedNames, label);
  for (const name of expectedNames) {
    const current = environment[name];
    if (
      typeof current !== "string" ||
      current.length === 0 ||
      /[\0\r\n]/.test(current)
    ) {
      fail(`${label} is incomplete`);
    }
  }
  return environment;
}

function trustedDescriptorNumber(environment, name, expectedNumber) {
  if (environment[name] !== String(expectedNumber)) {
    fail("trusted launcher capability descriptors are required");
  }
  return expectedNumber;
}

function readCanonicalUnlinkedCapability(descriptor, label) {
  const before = fstatSync(descriptor, { bigint: true });
  const currentUid = process.getuid?.();
  if (
    !before.isFile() ||
    before.isSymbolicLink() ||
    before.nlink !== 0n ||
    (Number(before.mode) & 0o777) !== 0o400 ||
    (currentUid !== undefined && before.uid !== BigInt(currentUid)) ||
    before.size <= 0n ||
    before.size > 262_144n
  ) {
    fail(`${label} capability is invalid`);
  }
  const bytes = readFileSync(descriptor);
  const after = fstatSync(descriptor, { bigint: true });
  if (
    !sameFileIdentity(before, after) ||
    after.nlink !== 0n ||
    after.size !== BigInt(bytes.length)
  ) {
    fail(`${label} capability changed while it was read`);
  }
  let text;
  let value;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    value = JSON.parse(text);
  } catch {
    fail(`${label} capability is not canonical JSON`);
  }
  if (`${canonicalRuntimeJson(value)}\n` !== text) {
    fail(`${label} capability is not canonical JSON`);
  }
  return value;
}

function readTrustedCompanionPublicPins(environment = process.env) {
  const descriptor = trustedDescriptorNumber(
    environment,
    SOURCE_REGISTRATION_TRUSTED_PUBLIC_PINS_FD_NAME,
    4,
  );
  try {
    const envelope = requireExactObjectKeys(
      readCanonicalUnlinkedCapability(descriptor, "trusted public pins"),
      ["environment", "format", "purpose", "version"],
      "trusted public pins envelope",
    );
    if (
      envelope.format !== SOURCE_REGISTRATION_TRUSTED_PUBLIC_PINS_FORMAT ||
      envelope.purpose !== SOURCE_REGISTRATION_TRUSTED_COMPANION_PURPOSE ||
      envelope.version !== 1
    ) {
      fail("trusted public pins envelope identity differs");
    }
    return requireExactStringEnvironment(
      envelope.environment,
      LOGICAL_RESTORE_COMPANION_PRELOAD_PIN_ENVIRONMENT_NAMES,
      "trusted public pins environment",
    );
  } finally {
    closeSync(descriptor);
  }
}

function assertCompanionPrivateInputsAbsentFromEnvironment(
  environment = process.env,
) {
  if (
    Object.keys(environment).some(
      (name) => name === "DATABASE_URL" || name.startsWith("LOGICAL_RESTORE_"),
    )
  ) {
    fail("companion private inputs must use the trusted descriptor");
  }
}

export function requireTrustedCompanionLauncherEntrypoint({
  environment = process.env,
  projectRoot = process.cwd(),
} = {}) {
  assertCompanionPrivateInputsAbsentFromEnvironment(environment);
  const preloadEnvironment = readTrustedCompanionPublicPins(environment);
  const expectedLauncherSha256 =
    preloadEnvironment.LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_LAUNCHER_SHA256;
  if (!/^[a-f0-9]{64}$/.test(expectedLauncherSha256)) {
    fail("trusted launcher SHA-256 is invalid");
  }
  const descriptor = trustedDescriptorNumber(
    environment,
    SOURCE_REGISTRATION_TRUSTED_LAUNCHER_FD_NAME,
    3,
  );
  trustedDescriptorNumber(
    environment,
    SOURCE_REGISTRATION_TRUSTED_SECRET_INPUT_FD_NAME,
    5,
  );
  if (
    environment[SOURCE_REGISTRATION_TRUSTED_BOOTSTRAP_PID_NAME] !==
    String(process.ppid)
  ) {
    fail("trusted bootstrap parent is required");
  }
  const canonicalProjectRoot = realpathSync(projectRoot);
  const launcherStats = lstatSync(executingLauncherPath, { bigint: true });
  const descriptorStats = fstatSync(descriptor, { bigint: true });
  const launcherParent = dirname(executingLauncherPath);
  const parentStats = lstatSync(launcherParent, { bigint: true });
  const canonicalTemporaryRoot = realpathSync("/tmp");
  const currentUid = process.getuid?.();
  if (realpathSync(executingLauncherPath) !== executingLauncherPath) {
    fail("trusted launcher path is not canonical");
  }
  if (
    !launcherStats.isFile() ||
    launcherStats.isSymbolicLink() ||
    launcherStats.nlink !== 1n ||
    (Number(launcherStats.mode) & 0o777) !== 0o400
  ) {
    fail("trusted launcher file identity is invalid");
  }
  if (!sameFileIdentity(launcherStats, descriptorStats)) {
    fail("trusted launcher descriptor differs");
  }
  if (currentUid !== undefined && launcherStats.uid !== BigInt(currentUid)) {
    fail("trusted launcher owner differs");
  }
  if (
    realpathSync(launcherParent) !== launcherParent ||
    dirname(launcherParent) !== canonicalTemporaryRoot ||
    !basename(launcherParent).startsWith(
      SOURCE_REGISTRATION_TRUSTED_LAUNCHER_PREFIX,
    )
  ) {
    fail("trusted launcher parent location is invalid");
  }
  if (
    !parentStats.isDirectory() ||
    parentStats.isSymbolicLink() ||
    (Number(parentStats.mode) & 0o777) !== 0o700 ||
    (currentUid !== undefined && parentStats.uid !== BigInt(currentUid))
  ) {
    fail("trusted launcher parent identity is invalid");
  }
  if (
    executingLauncherPath === canonicalProjectRoot ||
    executingLauncherPath.startsWith(`${canonicalProjectRoot}${sep}`)
  ) {
    fail("trusted launcher must execute outside the project");
  }
  if (
    canonicalRuntimeJson(readdirSync(launcherParent)) !==
    canonicalRuntimeJson([basename(executingLauncherPath)])
  ) {
    fail("trusted launcher parent contains unexpected entries");
  }
  const bytes = readFileSync(descriptor);
  const afterRead = fstatSync(descriptor, { bigint: true });
  if (
    !sameFileIdentity(launcherStats, afterRead) ||
    afterRead.nlink !== 1n ||
    afterRead.size !== BigInt(bytes.length) ||
    runtimeSha256(bytes) !== expectedLauncherSha256
  ) {
    fail("trusted launcher bytes differ from the audited pin");
  }
  let parentDescriptor;
  try {
    parentDescriptor = openSync(
      launcherParent,
      constants.O_RDONLY |
        (constants.O_DIRECTORY ?? 0) |
        (constants.O_NOFOLLOW ?? 0),
    );
    const openedParent = fstatSync(parentDescriptor, { bigint: true });
    if (!sameFileIdentity(parentStats, openedParent)) {
      fail("trusted launcher parent changed");
    }
    unlinkSync(executingLauncherPath);
    const unlinked = fstatSync(descriptor, { bigint: true });
    if (!sameFileIdentity(launcherStats, unlinked) || unlinked.nlink !== 0n) {
      fail("trusted launcher copy did not become private");
    }
    fsyncSync(parentDescriptor);
  } finally {
    if (parentDescriptor !== undefined) closeSync(parentDescriptor);
  }
  rmdirSync(launcherParent);
  return { descriptor, preloadEnvironment };
}

function readTrustedCompanionSecretInput(environment = process.env) {
  const descriptor = trustedDescriptorNumber(
    environment,
    SOURCE_REGISTRATION_TRUSTED_SECRET_INPUT_FD_NAME,
    5,
  );
  try {
    const envelope = requireExactObjectKeys(
      readCanonicalUnlinkedCapability(descriptor, "trusted secret input"),
      ["environment", "format", "purpose", "version"],
      "trusted secret input envelope",
    );
    if (
      envelope.format !== SOURCE_REGISTRATION_TRUSTED_SECRET_INPUT_FORMAT ||
      envelope.purpose !== SOURCE_REGISTRATION_TRUSTED_COMPANION_PURPOSE ||
      envelope.version !== 1
    ) {
      fail("trusted secret input envelope identity differs");
    }
    return requireExactStringEnvironment(
      envelope.environment,
      ["DATABASE_URL", ...LOGICAL_RESTORE_COMPANION_SECRET_ENVIRONMENT_NAMES],
      "trusted secret input environment",
    );
  } finally {
    closeSync(descriptor);
  }
}

function assertPrivateCompanionDirectory(storage, descriptor) {
  const pathStats = lstatSync(storage.parent, { bigint: true });
  const descriptorStats = fstatSync(descriptor, { bigint: true });
  if (
    realpathSync(storage.parent) !== storage.parent ||
    !pathStats.isDirectory() ||
    pathStats.isSymbolicLink() ||
    !descriptorStats.isDirectory() ||
    descriptorStats.isSymbolicLink() ||
    !sameFileIdentity(storage.parentIdentity, pathStats) ||
    !sameFileIdentity(storage.parentIdentity, descriptorStats) ||
    (Number(pathStats.mode) & 0o777) !== 0o700 ||
    (Number(descriptorStats.mode) & 0o777) !== 0o700
  ) {
    fail("companion receipt parent changed");
  }
}

function logicalRestoreCompanionFinalStorageBoundary(
  finalPath,
  { projectRoot = process.cwd(), requireAbsent = true } = {},
) {
  if (
    typeof finalPath !== "string" ||
    !isAbsolute(finalPath) ||
    /[\0\r\n]/.test(finalPath) ||
    !basename(finalPath) ||
    basename(finalPath) !== basename(finalPath.trim())
  ) {
    fail("companion receipt output path is invalid");
  }
  if (requireAbsent) {
    try {
      lstatSync(finalPath);
      fail("companion receipt output already exists");
    } catch (error) {
      if (!error || error.code !== "ENOENT") throw error;
    }
  }
  const parent = dirname(finalPath);
  const canonicalParent = realpathSync(parent);
  const parentStats = lstatSync(canonicalParent, { bigint: true });
  const canonicalProjectRoot = realpathSync(projectRoot);
  if (
    canonicalParent !== parent ||
    !parentStats.isDirectory() ||
    parentStats.isSymbolicLink() ||
    (Number(parentStats.mode) & 0o777) !== 0o700 ||
    canonicalParent === canonicalProjectRoot ||
    canonicalParent.startsWith(`${canonicalProjectRoot}${sep}`)
  ) {
    fail("companion receipt parent is not private external storage");
  }
  return {
    finalPath,
    parent: canonicalParent,
    parentIdentity: { dev: parentStats.dev, ino: parentStats.ino },
  };
}

export function logicalRestoreCompanionStagingStorage(
  finalPath,
  { projectRoot = process.cwd() } = {},
) {
  const boundary = logicalRestoreCompanionFinalStorageBoundary(finalPath, {
    projectRoot,
  });
  return {
    ...boundary,
    stagingPath: join(
      boundary.parent,
      `.${basename(finalPath)}.${process.pid}.${randomUUID()}.launcher-stage`,
    ),
  };
}

function unlinkOwnedCompanionStaging(storage, expectedIdentity) {
  if (!expectedIdentity) return false;
  try {
    const current = lstatSync(storage.stagingPath, { bigint: true });
    if (!sameFileIdentity(expectedIdentity, current)) return false;
    unlinkSync(storage.stagingPath);
    return true;
  } catch {
    return false;
  }
}

export function discardLogicalRestoreCompanionStaging(storage) {
  let stats;
  try {
    stats = lstatSync(storage.stagingPath, { bigint: true });
  } catch (error) {
    if (error && error.code === "ENOENT") return false;
    fail("companion staging receipt could not be inspected");
  }
  if (
    !stats.isFile() ||
    stats.isSymbolicLink() ||
    stats.nlink !== 1n ||
    (Number(stats.mode) & 0o777) !== 0o400
  ) {
    fail("companion staging receipt is not owned private evidence");
  }
  return unlinkOwnedCompanionStaging(storage, stats);
}

export function promoteLogicalRestoreCompanionReceipt({
  expectedReceiptSha256,
  storage,
}) {
  let descriptor;
  let parentDescriptor;
  let identity;
  let linked = false;
  try {
    parentDescriptor = openSync(
      storage.parent,
      constants.O_RDONLY |
        (constants.O_DIRECTORY ?? 0) |
        (constants.O_NOFOLLOW ?? 0),
    );
    assertPrivateCompanionDirectory(storage, parentDescriptor);
    descriptor = openSync(
      storage.stagingPath,
      constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
    );
    const before = fstatSync(descriptor, { bigint: true });
    if (
      !before.isFile() ||
      before.isSymbolicLink() ||
      before.nlink !== 1n ||
      (Number(before.mode) & 0o777) !== 0o400 ||
      before.size <= 0n ||
      before.size > 16_777_216n
    ) {
      fail("companion staging receipt is invalid");
    }
    identity = before;
    const bytes = readFileSync(descriptor);
    const afterRead = fstatSync(descriptor, { bigint: true });
    if (
      !sameFileIdentity(identity, afterRead) ||
      afterRead.nlink !== 1n ||
      afterRead.size !== BigInt(bytes.length) ||
      runtimeSha256(bytes) !== expectedReceiptSha256
    ) {
      fail("companion staging receipt differs from its callback");
    }
    const text = bytes.toString("utf8");
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      fail("companion staging receipt is not canonical JSON");
    }
    if (
      !Buffer.from(text, "utf8").equals(bytes) ||
      `${canonicalRuntimeJson(parsed)}\n` !== text
    ) {
      fail("companion staging receipt is not canonical JSON");
    }
    assertPrivateCompanionDirectory(storage, parentDescriptor);
    try {
      lstatSync(storage.finalPath);
      fail("companion final receipt already exists");
    } catch (error) {
      if (!error || error.code !== "ENOENT") throw error;
    }
    linkSync(storage.stagingPath, storage.finalPath);
    linked = true;
    const linkedStaging = lstatSync(storage.stagingPath, { bigint: true });
    const linkedFinal = lstatSync(storage.finalPath, { bigint: true });
    if (
      !sameFileIdentity(identity, linkedStaging) ||
      !sameFileIdentity(identity, linkedFinal) ||
      linkedStaging.nlink !== 2n ||
      linkedFinal.nlink !== 2n ||
      (Number(linkedFinal.mode) & 0o777) !== 0o400
    ) {
      fail("companion receipt promotion identity differs");
    }
    unlinkSync(storage.stagingPath);
    const published = lstatSync(storage.finalPath, { bigint: true });
    if (
      !sameFileIdentity(identity, published) ||
      published.nlink !== 1n ||
      (Number(published.mode) & 0o777) !== 0o400
    ) {
      fail("companion receipt promotion was not atomic");
    }
    assertPrivateCompanionDirectory(storage, parentDescriptor);
    fsyncSync(parentDescriptor);
    return {
      identity: { dev: identity.dev, ino: identity.ino },
      receipt: parsed,
      receiptSha256: expectedReceiptSha256,
    };
  } catch (error) {
    if (linked && identity) {
      try {
        const finalStats = lstatSync(storage.finalPath, { bigint: true });
        if (sameFileIdentity(identity, finalStats))
          unlinkSync(storage.finalPath);
      } catch {
        // Never remove a path whose owned identity cannot be proven.
      }
    }
    unlinkOwnedCompanionStaging(storage, identity);
    throw error;
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
    if (parentDescriptor !== undefined) closeSync(parentDescriptor);
  }
}

function inspectLogicalRestoreCompanionStaging({
  expectedReceiptSha256,
  storage,
}) {
  let descriptor;
  let parentDescriptor;
  try {
    parentDescriptor = openSync(
      storage.parent,
      constants.O_RDONLY |
        (constants.O_DIRECTORY ?? 0) |
        (constants.O_NOFOLLOW ?? 0),
    );
    assertPrivateCompanionDirectory(storage, parentDescriptor);
    descriptor = openSync(
      storage.stagingPath,
      constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
    );
    const before = fstatSync(descriptor, { bigint: true });
    if (
      !before.isFile() ||
      before.isSymbolicLink() ||
      before.nlink !== 1n ||
      (Number(before.mode) & 0o777) !== 0o400 ||
      before.size <= 0n ||
      before.size > 16_777_216n
    ) {
      fail("companion staging receipt is invalid");
    }
    const bytes = readFileSync(descriptor);
    const after = fstatSync(descriptor, { bigint: true });
    if (
      !sameFileIdentity(before, after) ||
      after.nlink !== 1n ||
      after.size !== BigInt(bytes.length) ||
      runtimeSha256(bytes) !== expectedReceiptSha256
    ) {
      fail("companion staging receipt differs from its callback");
    }
    const text = bytes.toString("utf8");
    let receipt;
    try {
      receipt = JSON.parse(text);
    } catch {
      fail("companion staging receipt is not canonical JSON");
    }
    if (
      !Buffer.from(text, "utf8").equals(bytes) ||
      `${canonicalRuntimeJson(receipt)}\n` !== text
    ) {
      fail("companion staging receipt is not canonical JSON");
    }
    assertPrivateCompanionDirectory(storage, parentDescriptor);
    return { receipt };
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
    if (parentDescriptor !== undefined) closeSync(parentDescriptor);
  }
}

function rollbackPromotedLogicalRestoreReceipt(storage, identity) {
  if (!identity) return false;
  let parentDescriptor;
  try {
    parentDescriptor = openSync(
      storage.parent,
      constants.O_RDONLY |
        (constants.O_DIRECTORY ?? 0) |
        (constants.O_NOFOLLOW ?? 0),
    );
    assertPrivateCompanionDirectory(storage, parentDescriptor);
    const current = lstatSync(storage.finalPath, { bigint: true });
    if (
      !current.isFile() ||
      current.isSymbolicLink() ||
      current.nlink !== 1n ||
      !sameFileIdentity(identity, current)
    ) {
      return false;
    }
    unlinkSync(storage.finalPath);
    fsyncSync(parentDescriptor);
    return true;
  } catch {
    return false;
  } finally {
    if (parentDescriptor !== undefined) closeSync(parentDescriptor);
  }
}

function yieldLogicalRestoreCompanionSignalCheckpoint() {
  return new Promise((resolveCheckpoint) => setImmediate(resolveCheckpoint));
}

export async function promoteLogicalRestoreCompanionReceiptPair({
  companionStorage,
  expectedCompanionReceiptSha256,
  journalRuntime,
  rehearsalStorage,
  signalGuard,
}) {
  const journal =
    requireLogicalRestoreReceiptPairJournalRuntime(journalRuntime);
  const preview = inspectLogicalRestoreCompanionStaging({
    expectedReceiptSha256: expectedCompanionReceiptSha256,
    storage: companionStorage,
  });
  const expectedRehearsalReceiptSha256 =
    preview.receipt?.logicalCloneRehearsal?.receiptFileSha256;
  if (
    typeof expectedRehearsalReceiptSha256 !== "string" ||
    !/^[a-f0-9]{64}$/.test(expectedRehearsalReceiptSha256)
  ) {
    fail("companion receipt does not bind its rehearsal receipt file");
  }
  let companionPromotion;
  let rehearsalPromotion;
  try {
    journal.prepareLogicalRestoreReceiptPairJournal({
      companionStorage,
      expectedCompanionReceiptSha256,
      expectedRehearsalReceiptSha256,
      rehearsalStorage,
    });
    await yieldLogicalRestoreCompanionSignalCheckpoint();
    if (signalGuard.signal) fail("companion publication was interrupted");
    rehearsalPromotion = promoteLogicalRestoreCompanionReceipt({
      expectedReceiptSha256: expectedRehearsalReceiptSha256,
      storage: rehearsalStorage,
    });
    await yieldLogicalRestoreCompanionSignalCheckpoint();
    if (signalGuard.signal) fail("companion publication was interrupted");
    companionPromotion = promoteLogicalRestoreCompanionReceipt({
      expectedReceiptSha256: expectedCompanionReceiptSha256,
      storage: companionStorage,
    });
    await yieldLogicalRestoreCompanionSignalCheckpoint();
    if (signalGuard.signal) fail("companion publication was interrupted");
    const finalized = journal.finalizeLogicalRestoreReceiptPairJournal({
      companionFinalPath: companionStorage.finalPath,
      expectedCompanionReceiptSha256,
      expectedRehearsalReceiptSha256,
      rehearsalFinalPath: rehearsalStorage.finalPath,
    });
    if (
      finalized.status !== "committed" ||
      finalized.companionReceiptSha256 !== expectedCompanionReceiptSha256 ||
      finalized.rehearsalReceiptSha256 !== expectedRehearsalReceiptSha256
    ) {
      fail("logical-restore receipt-pair journal finalization differs");
    }
    return {
      companionReceiptSha256: expectedCompanionReceiptSha256,
      rehearsalReceiptSha256: expectedRehearsalReceiptSha256,
    };
  } catch (error) {
    rollbackPromotedLogicalRestoreReceipt(
      companionStorage,
      companionPromotion?.identity,
    );
    rollbackPromotedLogicalRestoreReceipt(
      rehearsalStorage,
      rehearsalPromotion?.identity,
    );
    throw error;
  }
}

export function installLogicalRestoreCompanionSignalGuard() {
  let child;
  let forwarded = false;
  let signal;
  const record = (received) => {
    if (signal) return;
    signal = received;
    if (child && !forwarded) {
      forwarded = true;
      try {
        child.kill(received);
      } catch {
        // The child-close event remains the authoritative completion gate.
      }
    }
  };
  const onInterrupt = () => record("SIGINT");
  const onTerminate = () => record("SIGTERM");
  process.on("SIGINT", onInterrupt);
  process.on("SIGTERM", onTerminate);
  return {
    attachChild(value) {
      child = value;
      if (signal && !forwarded) {
        forwarded = true;
        try {
          child.kill(signal);
        } catch {
          // The child-close event remains the authoritative completion gate.
        }
      }
    },
    dispose() {
      process.off("SIGINT", onInterrupt);
      process.off("SIGTERM", onTerminate);
    },
    get signal() {
      return signal;
    },
    terminateChild() {
      if (!child) return;
      try {
        child.kill("SIGTERM");
      } catch {
        // The child-close event remains the authoritative completion gate.
      }
    },
  };
}

function appendBoundedOutput(state, chunk, signalGuard) {
  const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
  if (state.totalBytes + bytes.length > state.limit) {
    state.overflow = true;
    if (!state.terminationRequested) {
      state.terminationRequested = true;
      signalGuard.terminateChild();
    }
  }
  const remaining = Math.max(0, state.limit - state.storedBytes);
  if (remaining > 0) {
    const kept = bytes.subarray(0, remaining);
    state.chunks.push(kept);
    state.storedBytes += kept.length;
  }
  state.totalBytes += bytes.length;
}

export function parseControlledLogicalRestoreDiagnostic(stderrBytes) {
  if (!Buffer.isBuffer(stderrBytes)) return null;
  for (const [
    expected,
    diagnostic,
  ] of CONTROLLED_LOGICAL_RESTORE_EXACT_DIAGNOSTICS) {
    if (stderrBytes.equals(expected)) return diagnostic;
  }
  return null;
}

export async function superviseControlledCompanionChild({
  arguments_,
  cwd,
  descriptor,
  environment,
  executable,
  postAttestation,
  signalGuard,
}) {
  const stdout = {
    chunks: [],
    limit: 16_384,
    overflow: false,
    storedBytes: 0,
    terminationRequested: false,
    totalBytes: 0,
  };
  const stderr = {
    chunks: [],
    limit: 16_384,
    overflow: false,
    storedBytes: 0,
    terminationRequested: false,
    totalBytes: 0,
  };
  let child;
  let startFailed = false;
  let closeCode = null;
  let closeSignal = null;
  try {
    child = spawn(executable, arguments_, {
      cwd,
      detached: false,
      env: environment,
      stdio: ["ignore", "pipe", "pipe", descriptor],
    });
    signalGuard.attachChild(child);
    child.stdout.on("data", (chunk) =>
      appendBoundedOutput(stdout, chunk, signalGuard),
    );
    child.stderr.on("data", (chunk) =>
      appendBoundedOutput(stderr, chunk, signalGuard),
    );
    await new Promise((resolveClose) => {
      child.once("error", () => {
        startFailed = true;
      });
      child.once("close", (code, receivedSignal) => {
        closeCode = code;
        closeSignal = receivedSignal;
        resolveClose();
      });
    });
  } catch {
    startFailed = true;
  }

  let postAttestationFailed = false;
  try {
    await postAttestation();
  } catch {
    postAttestationFailed = true;
  }
  await yieldLogicalRestoreCompanionSignalCheckpoint();
  if (postAttestationFailed) {
    return {
      diagnostic: "COMPANION_POST_ATTESTATION_FAILED",
      exitCode: 1,
    };
  }
  if (signalGuard.signal) {
    return {
      diagnostic: "COMPANION_INTERRUPTED",
      exitCode: signalGuard.signal === "SIGINT" ? 130 : 143,
    };
  }
  const controlledDiagnostic =
    !startFailed &&
    !stdout.overflow &&
    !stderr.overflow &&
    stdout.totalBytes === 0 &&
    closeCode === 1 &&
    closeSignal === null
      ? parseControlledLogicalRestoreDiagnostic(Buffer.concat(stderr.chunks))
      : null;
  if (controlledDiagnostic) {
    return { diagnostic: controlledDiagnostic, exitCode: 1 };
  }
  if (
    startFailed ||
    stdout.overflow ||
    stderr.overflow ||
    closeCode !== 0 ||
    closeSignal !== null ||
    stderr.totalBytes !== 0
  ) {
    return { diagnostic: "COMPANION_FAILED", exitCode: 1 };
  }
  let stdoutText;
  try {
    stdoutText = new TextDecoder("utf-8", { fatal: true }).decode(
      Buffer.concat(stdout.chunks),
    );
  } catch {
    return { diagnostic: "COMPANION_PROTOCOL_FAILED", exitCode: 1 };
  }
  let callback;
  try {
    callback = validateLogicalRestoreCompanionCallback(stdoutText);
  } catch {
    return { diagnostic: "COMPANION_PROTOCOL_FAILED", exitCode: 1 };
  }
  return {
    callback,
    callbackText: `${JSON.stringify({
      evidenceClass: callback.evidenceClass,
      receiptSha256: callback.receiptSha256,
      status: callback.status,
    })}\n`,
    exitCode: 0,
  };
}

async function superviseLogicalRestoreCompanion({
  attestation,
  databaseUrl,
  environmentAdditions,
  postAttestation,
  projectRoot,
  signalGuard,
}) {
  const directory = mkdtempSync(
    join(
      SOURCE_REGISTRATION_FIXED_TEMPORARY_ROOT,
      "foodsystems-source-registration-runtime-",
    ),
  );
  chmodSync(directory, 0o700);
  const envelopePath = join(directory, "runtime-attestation.json");
  let descriptor;
  try {
    writeFileSync(
      envelopePath,
      `${canonicalRuntimeJson(
        runtimeEnvelope(attestation, "logical_restore_companion"),
      )}\n`,
      { mode: 0o400 },
    );
    chmodSync(envelopePath, 0o400);
    descriptor = openSync(envelopePath, "r");
    fsyncSync(descriptor);
    unlinkSync(envelopePath);
    return await superviseControlledCompanionChild({
      arguments_: ["--import=tsx", LOGICAL_RESTORE_COMPANION_RUNNER],
      cwd: projectRoot,
      descriptor,
      environment: minimalRuntimeEnvironment({
        additions: {
          ...environmentAdditions,
          SOURCE_REGISTRATION_LAUNCH_ATTESTATION_FD: "3",
          SOURCE_REGISTRATION_LAUNCHER_PID: String(process.pid),
          TSX_TSCONFIG_PATH: realpathSync(
            resolve(projectRoot, SOURCE_REGISTRATION_TSX_CONFIG),
          ),
        },
        databaseUrl,
      }),
      executable: process.execPath,
      postAttestation,
      signalGuard,
    });
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
    rmSync(directory, { force: true, recursive: true });
  }
}

function writeLogicalRestoreCompanionDiagnostic(code) {
  if (logicalRestoreCompanionDiagnosticWritten) return false;
  logicalRestoreCompanionDiagnosticWritten = true;
  process.stderr.write(`[locked-source-registration-launcher] ERROR ${code}\n`);
  return true;
}

function writeLockedLauncherDiagnostic(code) {
  process.stderr.write(`[locked-source-registration-launcher] ERROR ${code}\n`);
}

function logicalRestoreCompanionInterruptedOutcome(signalGuard) {
  return {
    diagnostic: "COMPANION_INTERRUPTED",
    exitCode: signalGuard.signal === "SIGINT" ? 130 : 143,
  };
}

async function runTrustedLogicalRestoreCompanion({
  canonicalProjectRoot,
  preloadEnvironment,
  signalGuard,
}) {
  await yieldLogicalRestoreCompanionSignalCheckpoint();
  if (signalGuard.signal) {
    const interrupted = logicalRestoreCompanionInterruptedOutcome(signalGuard);
    writeLogicalRestoreCompanionDiagnostic(interrupted.diagnostic);
    process.exitCode = interrupted.exitCode;
    return;
  }

  let snapshot;
  try {
    snapshot = createSourceRegistrationExecutionSnapshot({
      projectRoot: canonicalProjectRoot,
    });
  } catch {
    writeLogicalRestoreCompanionDiagnostic("COMPANION_SNAPSHOT_PREPARE_FAILED");
    process.exitCode = 1;
    return;
  }
  let companionStorage;
  let journalRuntime;
  let rehearsalStorage;
  let outcome;
  let orchestrationFailureDiagnostic = "COMPANION_SNAPSHOT_ATTESTATION_FAILED";
  let receiptsCommitted = false;
  let snapshotCleanupFailed = false;
  try {
    await yieldLogicalRestoreCompanionSignalCheckpoint();
    if (signalGuard.signal) {
      outcome = logicalRestoreCompanionInterruptedOutcome(signalGuard);
    } else {
      const snapshotAttestation = computeSourceRegistrationRuntimeAttestation({
        projectRoot: snapshot.projectRoot,
      });
      requireLogicalRestoreCompanionExpectedPins({
        attestation: snapshotAttestation,
        environment: preloadEnvironment,
        projectRoot: snapshot.projectRoot,
      });
      orchestrationFailureDiagnostic = "COMPANION_JOURNAL_RUNTIME_FAILED";
      journalRuntime = await loadLogicalRestoreReceiptPairJournalRuntime(
        snapshot.projectRoot,
      );
      await yieldLogicalRestoreCompanionSignalCheckpoint();
      if (signalGuard.signal) {
        outcome = logicalRestoreCompanionInterruptedOutcome(signalGuard);
      } else {
        orchestrationFailureDiagnostic = "COMPANION_SECRET_INPUT_FAILED";
        const { DATABASE_URL: databaseUrl, ...secretCompanionEnvironment } =
          readTrustedCompanionSecretInput();
        const companionEnvironment =
          logicalRestoreCompanionEnvironmentAdditions({
            ...preloadEnvironment,
            ...secretCompanionEnvironment,
          });
        const companionBoundary = logicalRestoreCompanionFinalStorageBoundary(
          companionEnvironment.LOGICAL_RESTORE_COMPANION_RECEIPT_PATH,
          { projectRoot: canonicalProjectRoot, requireAbsent: false },
        );
        const rehearsalBoundary = logicalRestoreCompanionFinalStorageBoundary(
          companionEnvironment.LOGICAL_RESTORE_REHEARSAL_RECEIPT_PATH,
          { projectRoot: canonicalProjectRoot, requireAbsent: false },
        );
        if (
          companionBoundary.finalPath === rehearsalBoundary.finalPath ||
          companionBoundary.parent !== rehearsalBoundary.parent
        ) {
          fail("companion receipt outputs must be a distinct private pair");
        }
        orchestrationFailureDiagnostic = "COMPANION_RECEIPT_RECOVERY_FAILED";
        const recovery = journalRuntime.recoverLogicalRestoreReceiptPairJournal(
          {
            companionFinalPath: companionBoundary.finalPath,
            rehearsalFinalPath: rehearsalBoundary.finalPath,
          },
        );
        if (
          recovery.status !== "absent" &&
          recovery.status !== "replay_required" &&
          recovery.status !== "committed"
        ) {
          fail("logical-restore receipt-pair journal recovery differs");
        }
        await yieldLogicalRestoreCompanionSignalCheckpoint();
        if (signalGuard.signal) {
          outcome = logicalRestoreCompanionInterruptedOutcome(signalGuard);
        } else if (recovery.status === "committed") {
          outcome = {
            diagnostic: "COMPANION_RECEIPTS_ALREADY_COMMITTED",
            exitCode: 1,
          };
        } else {
          orchestrationFailureDiagnostic = "COMPANION_RECEIPT_STAGING_FAILED";
          companionStorage = logicalRestoreCompanionStagingStorage(
            companionBoundary.finalPath,
            { projectRoot: canonicalProjectRoot },
          );
          rehearsalStorage = logicalRestoreCompanionStagingStorage(
            rehearsalBoundary.finalPath,
            { projectRoot: canonicalProjectRoot },
          );
          const childEnvironment = {
            ...companionEnvironment,
            LOGICAL_RESTORE_COMPANION_RECEIPT_PATH:
              companionStorage.stagingPath,
            LOGICAL_RESTORE_REHEARSAL_RECEIPT_PATH:
              rehearsalStorage.stagingPath,
          };
          orchestrationFailureDiagnostic = "COMPANION_SUPERVISION_FAILED";
          const result = await superviseLogicalRestoreCompanion({
            attestation: snapshotAttestation,
            databaseUrl,
            environmentAdditions: childEnvironment,
            postAttestation: () => {
              const currentSnapshot =
                computeSourceRegistrationRuntimeAttestation({
                  projectRoot: snapshot.projectRoot,
                });
              if (
                canonicalRuntimeJson(currentSnapshot) !==
                canonicalRuntimeJson(snapshotAttestation)
              ) {
                fail("runtime attestation changed while companion was active");
              }
            },
            projectRoot: snapshot.projectRoot,
            signalGuard,
          });
          if (result.exitCode !== 0 || !result.callback) {
            outcome = {
              diagnostic: result.diagnostic ?? "COMPANION_FAILED",
              exitCode: result.exitCode || 1,
            };
          } else {
            outcome = {
              callback: result.callback,
              callbackText: result.callbackText,
              exitCode: 0,
            };
          }
        }
      }
    }
  } catch {
    outcome = {
      diagnostic: orchestrationFailureDiagnostic,
      exitCode: 1,
    };
  } finally {
    try {
      removeSourceRegistrationExecutionSnapshot(snapshot.snapshotRoot);
    } catch {
      snapshotCleanupFailed = true;
    }
  }
  if (snapshotCleanupFailed) {
    outcome = {
      diagnostic: "COMPANION_SNAPSHOT_CLEANUP_FAILED",
      exitCode: 1,
    };
  }
  await yieldLogicalRestoreCompanionSignalCheckpoint();
  if (signalGuard.signal) {
    outcome = logicalRestoreCompanionInterruptedOutcome(signalGuard);
  }

  if (companionStorage && rehearsalStorage) {
    try {
      if (outcome?.exitCode === 0 && outcome.callback) {
        try {
          await promoteLogicalRestoreCompanionReceiptPair({
            companionStorage,
            expectedCompanionReceiptSha256: outcome.callback.receiptSha256,
            journalRuntime,
            rehearsalStorage,
            signalGuard,
          });
          receiptsCommitted = true;
        } catch (error) {
          outcome = signalGuard.signal
            ? logicalRestoreCompanionInterruptedOutcome(signalGuard)
            : {
                diagnostic: "COMPANION_RECEIPT_PUBLICATION_FAILED",
                exitCode: 1,
              };
        }
      }
    } finally {
      discardLogicalRestoreCompanionStaging(companionStorage);
      discardLogicalRestoreCompanionStaging(rehearsalStorage);
    }
  }
  if (!receiptsCommitted) {
    await yieldLogicalRestoreCompanionSignalCheckpoint();
    if (signalGuard.signal) {
      outcome = logicalRestoreCompanionInterruptedOutcome(signalGuard);
    }
  }
  if (!outcome || outcome.exitCode !== 0) {
    writeLogicalRestoreCompanionDiagnostic(
      outcome?.diagnostic ?? "COMPANION_FAILED",
    );
    process.exitCode = outcome?.exitCode || 1;
    return;
  }
  signalGuard.dispose();
  process.stdout.write(outcome.callbackText);
}

async function main() {
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
  const companionCount = arguments_.filter(
    (argument) => argument === LOGICAL_RESTORE_COMPANION_MODE,
  ).length;
  if (companionCount > 1) fail("duplicate logical-restore companion mode flag");
  let companionSignalGuard;
  let trustedCompanionEntrypoint;
  const canonicalProjectRoot = realpathSync(process.cwd());
  try {
    if (companionCount === 1) {
      if (arguments_.length !== 1) {
        fail("logical-restore companion accepts no caller-supplied arguments");
      }
      logicalRestoreCompanionOuterDiagnostic =
        "COMPANION_TRUSTED_ENTRYPOINT_FAILED";
      trustedCompanionEntrypoint = requireTrustedCompanionLauncherEntrypoint({
        projectRoot: canonicalProjectRoot,
      });
      companionSignalGuard = installLogicalRestoreCompanionSignalGuard();
      logicalRestoreCompanionOuterDiagnostic = "COMPANION_EXECUTION_FAILED";
      await runTrustedLogicalRestoreCompanion({
        canonicalProjectRoot,
        preloadEnvironment: trustedCompanionEntrypoint.preloadEnvironment,
        signalGuard: companionSignalGuard,
      });
      logicalRestoreCompanionOuterDiagnostic =
        "COMPANION_ENTRYPOINT_CLEANUP_FAILED";
      return;
    }

    const rehearsalCount = arguments_.filter(
      (argument) => argument === "--rehearse-logical-clone",
    ).length;
    if (rehearsalCount > 1) fail("duplicate rehearsal mode flag");
    if (rehearsalCount === 1) {
      writeLockedLauncherDiagnostic("REHEARSAL_TRUSTED_ENTRYPOINT_REQUIRED");
      process.exitCode = 1;
      return;
    }
    const applyCount = arguments_.filter(
      (argument) => argument === "--apply",
    ).length;
    if (applyCount > 1) fail("duplicate --apply mode flag");
    if (applyCount === 1) {
      writeLockedLauncherDiagnostic("APPLY_TRUSTED_ENTRYPOINT_REQUIRED");
      process.exitCode = 1;
      return;
    }

    const databaseUrl = process.env.DATABASE_URL;
    if (typeof databaseUrl !== "string" || databaseUrl.length === 0) {
      fail(
        "DATABASE_URL must be supplied explicitly to the launcher environment",
      );
    }
    const attestation = computeSourceRegistrationRuntimeAttestation({
      projectRoot: canonicalProjectRoot,
    });
    const result = launchRunner(arguments_, attestation, databaseUrl);
    const after = computeSourceRegistrationRuntimeAttestation();
    if (canonicalRuntimeJson(after) !== canonicalRuntimeJson(attestation)) {
      fail("runtime attestation changed while the runner was active");
    }
    if (result.signal) fail(`runner terminated by signal ${result.signal}`);
    if (result.status !== 0) process.exitCode = result.status ?? 1;
  } finally {
    companionSignalGuard?.dispose();
    if (trustedCompanionEntrypoint) {
      closeSync(trustedCompanionEntrypoint.descriptor);
    }
  }
}

const invoked = process.argv[1]
  ? pathToFileURL(realpathSync(process.argv[1])).href
  : null;
if (invoked === import.meta.url) {
  main().catch((error) => {
    if (process.argv.includes(LOGICAL_RESTORE_COMPANION_MODE)) {
      writeLogicalRestoreCompanionDiagnostic(
        logicalRestoreCompanionOuterDiagnostic,
      );
    } else if (process.argv.includes("--apply")) {
      writeLockedLauncherDiagnostic("APPLY_REFUSED");
    } else if (process.argv.includes("--rehearse-logical-clone")) {
      writeLockedLauncherDiagnostic("REHEARSAL_REFUSED");
    } else {
      process.stderr.write(
        `${error instanceof Error ? error.message : String(error)}\n`,
      );
    }
    process.exitCode = 1;
  });
}
