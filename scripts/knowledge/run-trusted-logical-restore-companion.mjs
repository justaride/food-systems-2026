#!/usr/bin/env node

import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import {
  chmodSync,
  closeSync,
  constants,
  createReadStream,
  fchmodSync,
  fstatSync,
  fsyncSync,
  lstatSync,
  mkdtempSync,
  openSync,
  readFileSync,
  readSync,
  readdirSync,
  readlinkSync,
  realpathSync,
  rmdirSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import { pathToFileURL } from "node:url";

export const TRUSTED_COMPANION_BOOTSTRAP_CLEAN_ENVIRONMENT = Object.freeze({
  LANG: "C",
  LC_ALL: "C",
  PATH: "/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin",
  TMPDIR: "/tmp",
  TZ: "UTC",
});
export const TRUSTED_COMPANION_BOOTSTRAP_PREFLIGHT_CALLBACK =
  '{"evidenceClass":"logical-restore-companion-bootstrap-preflight","status":"pass"}\n';
export const TRUSTED_COMPANION_BOOTSTRAP_PROBE_CALLBACK =
  '{"evidenceClass":"trusted-logical-restore-bootstrap-probe","status":"pass"}\n';
export const TRUSTED_LAUNCHER_COMPANION_DIAGNOSTIC_CODES = Object.freeze([
  "COMPANION_FAILED",
  "COMPANION_INTERRUPTED",
  "COMPANION_POST_ATTESTATION_FAILED",
  "COMPANION_PROTOCOL_FAILED",
  "COMPANION_RECEIPTS_ALREADY_COMMITTED",
  "COMPANION_RECEIPT_PUBLICATION_FAILED",
  "COMPANION_RECEIPT_RECOVERY_FAILED",
  "COMPANION_RECEIPT_STAGING_FAILED",
  "COMPANION_REFUSED",
  "COMPANION_SECRET_INPUT_FAILED",
  "COMPANION_SNAPSHOT_ATTESTATION_FAILED",
  "COMPANION_SNAPSHOT_CLEANUP_FAILED",
  "COMPANION_SNAPSHOT_PREPARE_FAILED",
  "COMPANION_SUPERVISION_FAILED",
  "COMPANION_JOURNAL_RUNTIME_FAILED",
  "COMPANION_TRUSTED_ENTRYPOINT_FAILED",
  "COMPANION_EXECUTION_FAILED",
  "COMPANION_ENTRYPOINT_CLEANUP_FAILED",
  "COMPANION_CHILD_ACK_REQUIRED",
  "COMPANION_CHILD_ARCHIVE_CATALOG",
  "COMPANION_CHILD_ARGUMENTS_FORBIDDEN",
  "COMPANION_CHILD_CATALOG_COMMAND_FAILED",
  "COMPANION_CHILD_CLEANUP_ABSENCE",
  "COMPANION_CHILD_CLEANUP_FAILED",
  "COMPANION_CHILD_CLONE_IDENTITY",
  "COMPANION_CHILD_CLONE_NAME",
  "COMPANION_CHILD_CLONE_OWNERSHIP",
  "COMPANION_CHILD_CLONE_PREEXISTS",
  "COMPANION_CHILD_CLONE_CREATE_COMMAND_FAILED",
  "COMPANION_CHILD_CLONE_EXTENSION_VERIFY_COMMAND_FAILED",
  "COMPANION_CHILD_CLONE_INITIALIZE_COMMAND_FAILED",
  "COMPANION_CHILD_CLONE_PREFLIGHT_COMMAND_FAILED",
  "COMPANION_CHILD_CLONE_REHEARSAL_COMMAND_FAILED",
  "COMPANION_CHILD_CLONE_RESTORE_COMMAND_FAILED",
  "COMPANION_CHILD_COMMAND_FAILED",
  "COMPANION_CHILD_COMMAND_INPUT",
  "COMPANION_CHILD_COMMAND_START",
  "COMPANION_CHILD_COMPARISON_FAILED",
  "COMPANION_CHILD_COMPARISON_INCOMPLETE",
  "COMPANION_CHILD_CONTROLLED_FAILURE",
  "COMPANION_CHILD_DATABASE_EXISTENCE",
  "COMPANION_CHILD_DATABASE_TARGET",
  "COMPANION_CHILD_DATABASE_URL_INVALID",
  "COMPANION_CHILD_DUMP_BINDING",
  "COMPANION_CHILD_DUMP_CHANGED",
  "COMPANION_CHILD_DUMP_STREAM",
  "COMPANION_CHILD_ENVIRONMENT_REQUIRED",
  "COMPANION_CHILD_EVIDENCE_CANONICAL",
  "COMPANION_CHILD_EVIDENCE_COUNT",
  "COMPANION_CHILD_EVIDENCE_DISCLOSURE",
  "COMPANION_CHILD_EVIDENCE_DRIFT",
  "COMPANION_CHILD_EVIDENCE_HASH",
  "COMPANION_CHILD_EVIDENCE_JSON",
  "COMPANION_CHILD_EVIDENCE_SHAPE",
  "COMPANION_CHILD_EVIDENCE_TIME",
  "COMPANION_CHILD_EVIDENCE_UTF8",
  "COMPANION_CHILD_EXTENSION_INITIALIZER_ATTESTATION",
  "COMPANION_CHILD_EXTENSION_INITIALIZER_FAILED",
  "COMPANION_CHILD_EXTENSION_INITIALIZER_MUTATION",
  "COMPANION_CHILD_EXTENSION_INITIALIZER_PREFLIGHT",
  "COMPANION_CHILD_EXTENSION_INITIALIZER_REQUEST",
  "COMPANION_CHILD_EXTENSION_INITIALIZER_RUNTIME",
  "COMPANION_CHILD_EXTENSION_INITIALIZER_SOURCE_STATE",
  "COMPANION_CHILD_EXTENSION_INITIALIZER_VERIFY",
  "COMPANION_CHILD_EXECUTABLE_INVALID",
  "COMPANION_CHILD_EXECUTABLE_SET",
  "COMPANION_CHILD_EXPECTED_EVIDENCE_BINDING",
  "COMPANION_CHILD_EXPECTED_PRELOAD_CONTEXT_BINDING",
  "COMPANION_CHILD_EXPECTED_REHEARSAL_RUNTIME_BINDING",
  "COMPANION_CHILD_FILE_CHANGED",
  "COMPANION_CHILD_FILE_HASH_FAILED",
  "COMPANION_CHILD_HANDLED_SIGNAL",
  "COMPANION_CHILD_LAUNCHER_ATTESTATION",
  "COMPANION_CHILD_LAUNCHER_REQUIRED",
  "COMPANION_CHILD_LOGICAL_DIGEST",
  "COMPANION_CHILD_LOGICAL_DIGEST_CLUSTER",
  "COMPANION_CHILD_LOGICAL_DIGEST_COUNT",
  "COMPANION_CHILD_LOGICAL_DIGEST_SHAPE",
  "COMPANION_CHILD_LOGICAL_DIGEST_TARGET",
  "COMPANION_CHILD_LOGICAL_DIGEST_TOOL",
  "COMPANION_CHILD_LOGICAL_MISMATCH",
  "COMPANION_CHILD_METADATA_BINDING",
  "COMPANION_CHILD_METADATA_DUMP",
  "COMPANION_CHILD_METADATA_FINGERPRINT",
  "COMPANION_CHILD_METADATA_IDENTITY",
  "COMPANION_CHILD_METADATA_SOURCE",
  "COMPANION_CHILD_METADATA_VERSION",
  "COMPANION_CHILD_PRIVATE_FILE_CHANGED",
  "COMPANION_CHILD_PRIVATE_FILE_INVALID",
  "COMPANION_CHILD_PRIVATE_FILE_READ_FAILED",
  "COMPANION_CHILD_PRIVATE_FILE_TOO_LARGE",
  "COMPANION_CHILD_PRIVATE_FILE_UNREADABLE",
  "COMPANION_CHILD_PRIVATE_PATH_INVALID",
  "COMPANION_CHILD_PRIVATE_PATH_SCOPE",
  "COMPANION_CHILD_POSTGRESQL_EXTENSION_RUNTIME_BINDING",
  "COMPANION_CHILD_POSTGRESQL_EXTENSION_RUNTIME_CLOSURE",
  "COMPANION_CHILD_PSQL_RUNTIME_BINDING",
  "COMPANION_CHILD_PSQL_RUNTIME_CLOSURE",
  "COMPANION_CHILD_RECEIPT_EXISTS",
  "COMPANION_CHILD_RECEIPT_NAME",
  "COMPANION_CHILD_RECEIPT_PARENT",
  "COMPANION_CHILD_RECEIPT_PARENT_DRIFT",
  "COMPANION_CHILD_RECEIPT_PATH_COLLISION",
  "COMPANION_CHILD_RECEIPT_PUBLICATION",
  "COMPANION_CHILD_RECEIPT_TARGET",
  "COMPANION_CHILD_REHEARSAL_BINDING",
  "COMPANION_CHILD_REHEARSAL_CALLBACK",
  "COMPANION_CHILD_REHEARSAL_CALLBACK_BINDING",
  "COMPANION_CHILD_REHEARSAL_DATABASE_TARGET",
  "COMPANION_CHILD_REHEARSAL_DRIFT",
  "COMPANION_CHILD_REHEARSAL_EXECUTABLE",
  "COMPANION_CHILD_REHEARSAL_INCOMPLETE",
  "COMPANION_CHILD_REHEARSAL_INPUTS",
  "COMPANION_CHILD_REHEARSAL_LAUNCHER_ATTESTATION",
  "COMPANION_CHILD_REHEARSAL_PROOF_RUNTIME",
  "COMPANION_CHILD_REHEARSAL_RECEIPT_CODE_BINDING",
  "COMPANION_CHILD_REHEARSAL_RECEIPT_INVALID",
  "COMPANION_CHILD_REHEARSAL_RECEIPT_MODE",
  "COMPANION_CHILD_REHEARSAL_RECEIPT_PROOF",
  "COMPANION_CHILD_REHEARSAL_RECEIPT_RUNTIME_BINDING",
  "COMPANION_CHILD_REHEARSAL_RECEIPT_SCHEMA",
  "COMPANION_CHILD_REHEARSAL_RESIDUE",
  "COMPANION_CHILD_REHEARSAL_ROLLBACK",
  "COMPANION_CHILD_REHEARSAL_RUNTIME",
  "COMPANION_CHILD_REHEARSAL_RUNTIME_ATTESTATION",
  "COMPANION_CHILD_REHEARSAL_RUNTIME_BINDING",
  "COMPANION_CHILD_REHEARSAL_RUNTIME_DRIFT",
  "COMPANION_CHILD_REHEARSAL_SCHEMA",
  "COMPANION_CHILD_REHEARSAL_TIME",
  "COMPANION_CHILD_RESTORE_LIST_CAPABILITY",
  "COMPANION_CHILD_RESTORE_LIST_CATALOG",
  "COMPANION_CHILD_RESTORE_LIST_DESCRIPTOR",
  "COMPANION_CHILD_SIGNAL_INVALID",
  "COMPANION_CHILD_SOURCE_DRIFT",
  "COMPANION_CHILD_STRUCTURAL_RECEIPT_BINDING",
  "COMPANION_CHILD_STRUCTURAL_RECEIPT_CHECK",
  "COMPANION_CHILD_STRUCTURAL_RECEIPT_CLEANUP",
  "COMPANION_CHILD_STRUCTURAL_RECEIPT_TIME",
  "COMPANION_CHILD_STRUCTURAL_RECEIPT_VERSION",
  "COMPANION_CHILD_TOOL_DRIFT",
  "COMPANION_CHILD_TOOL_FILE_INVALID",
  "COMPANION_CHILD_TOOL_FILE_UNREADABLE",
]);
const TRUSTED_LAUNCHER_EXACT_DIAGNOSTICS = Object.freeze(
  TRUSTED_LAUNCHER_COMPANION_DIAGNOSTIC_CODES.map((code) => ({
    bytes: Buffer.from(
      `[locked-source-registration-launcher] ERROR ${code}\n`,
      "utf8",
    ),
    code,
    exitCodes: code === "COMPANION_INTERRUPTED" ? [130, 143] : [1],
  })),
);

const BOOTSTRAP_DIAGNOSTIC_PREFIX = "trusted-logical-restore-bootstrap";
const TRUSTED_PURPOSE = "logical_restore_companion";
const TRUSTED_PUBLIC_FORMAT =
  "foodsystems-source-registration-trusted-public-pins";
const TRUSTED_SECRET_FORMAT =
  "foodsystems-source-registration-trusted-secret-input";
const RUNTIME_ATTESTATION_DOMAIN =
  "food-systems-2026:source-registration-runtime-attestation:v1\0";
const COMPANION_ACK = "I_HAVE_VERIFIED_LOGICAL_RESTORE_CLONE_IS_DISPOSABLE";
const COMPANION_RECEIPT_BASENAME = "logical-restore-companion.receipt.v1.json";
const REHEARSAL_RECEIPT_BASENAME = "logical-clone-rehearsal.receipt.v1.json";
const LAUNCHER_RELATIVE_PATH =
  "scripts/knowledge/launch-locked-source-registration-apply.mjs";
const PRIMARY_PROJECT_BASENAME = "Food Systems 2026";
const REPLICA_ARCHIVE_BASENAME = "Food Systems 2026 Private Archive";
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_UTC_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const BACKUP_BASENAME_PATTERN =
  /^foodsystems-[a-z0-9][a-z0-9-]{0,150}-\d{8}(?:-\d{8}T\d{6}Z)?\.dump$/;
const OUTPUT_BASENAME_PATTERN = /^gate2c-\d{8}-[a-z0-9]{6}$/;
const MAX_JSON_BYTES = 16 * 1024 * 1024;
const MAX_CAPABILITY_BYTES = 262_144;
const MAX_CHILD_OUTPUT_BYTES = 16_384;
const MAX_ATTESTATION_OUTPUT_BYTES = 2 * 1024 * 1024;
const CORE_COUNT_KEYS = Object.freeze([
  "ControlledMutationAudit",
  "DatabaseIdentity",
  "Document",
  "EvidenceAppraisal",
  "FieldCitation",
  "LibraryAnalysisRecord",
  "Report",
  "SourceCitation",
  "SourceDoc",
  "Thesis",
]);

export const TRUSTED_COMPANION_PUBLIC_PIN_NAMES = Object.freeze([
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

export const TRUSTED_COMPANION_SECRET_NAMES = Object.freeze([
  "DATABASE_RESTORE_ADMIN_URL",
  "LOGICAL_RESTORE_ACK",
  "LOGICAL_RESTORE_COMPANION_RECEIPT_PATH",
  "LOGICAL_RESTORE_DUMP_PATH",
  "LOGICAL_RESTORE_EXPECTED_DUMP_BYTES",
  "LOGICAL_RESTORE_EXPECTED_DUMP_SHA256",
  "LOGICAL_RESTORE_EXPECTED_METADATA_SHA256",
  "LOGICAL_RESTORE_EXPECTED_STRUCTURAL_COMPLETED_AT_UTC",
  "LOGICAL_RESTORE_EXPECTED_STRUCTURAL_RECEIPT_SHA256",
  "LOGICAL_RESTORE_METADATA_BINDING_PATH",
  "LOGICAL_RESTORE_METADATA_PATH",
  "LOGICAL_RESTORE_PRIMARY_CORPUS_ROOT",
  "LOGICAL_RESTORE_REHEARSAL_RECEIPT_PATH",
  "LOGICAL_RESTORE_REPLICA_CORPUS_ROOT",
  "LOGICAL_RESTORE_STRUCTURAL_RECEIPT_PATH",
]);

const DIRECT_PUBLIC_PIN_PATHS = Object.freeze({
  LOGICAL_RESTORE_EXPECTED_COMPANION_RECEIPT_SCHEMA_SHA256:
    "knowledge/schema/database-logical-restore-companion-receipt.schema.v1.json",
  LOGICAL_RESTORE_EXPECTED_COMPANION_TEST_SHA256:
    "tests/lib/database-logical-restore-companion.test.ts",
  LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_APPLY_RUNNER_SHA256:
    "scripts/knowledge/apply-source-registration-plan.ts",
  LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_APPLY_RUNTIME_SHA256:
    "src/lib/knowledge/source-registration-apply.ts",
  LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_REHEARSAL_COMMAND_RUNNER_SHA256:
    "scripts/knowledge/run-source-registration-logical-clone-rehearsal.ts",
  LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_REHEARSAL_RUNTIME_SHA256:
    "src/lib/knowledge/source-registration-logical-clone-rehearsal.ts",
  LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_REHEARSAL_SCHEMA_SHA256:
    "knowledge/schema/source-registration-logical-clone-rehearsal-receipt.schema.v1.json",
  LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_REHEARSAL_TEST_SHA256:
    "tests/lib/source-registration-logical-clone-rehearsal.test.ts",
  LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_PACKAGE_JSON_SHA256:
    "package.json",
  LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_TSX_CONFIG_SHA256:
    "knowledge/runtime/source-registration-tsx.runtime.json",
});
const EXPECTED_LOCAL_RUNTIME_ROOTS = Object.freeze([
  "package.json",
  "knowledge/runtime/source-registration-tsx.runtime.json",
  "scripts/knowledge/apply-source-registration-plan.ts",
  "scripts/knowledge/run-source-registration-logical-clone-rehearsal.ts",
  "scripts/knowledge/run-controlled-logical-restore-companion.mjs",
  "scripts/knowledge/logical-restore-receipt-pair-journal.mjs",
  "scripts/knowledge/launch-locked-source-registration-apply.mjs",
  "scripts/knowledge/database-logical-state-digest.mjs",
  "scripts/knowledge/verify-psql-runtime-closure.mjs",
  "scripts/knowledge/verify-node-runtime-closure.mjs",
  "scripts/knowledge/generate-source-registration-plan.ts",
]);

export class TrustedLogicalRestoreBootstrapError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "TrustedLogicalRestoreBootstrapError";
    this.code = code;
  }
}

function fail(code, message) {
  throw new TrustedLogicalRestoreBootstrapError(code, message);
}

function safeBoundary(error, code = "BOOTSTRAP_FAILED") {
  if (error instanceof TrustedLogicalRestoreBootstrapError) return error;
  return new TrustedLogicalRestoreBootstrapError(
    code,
    "trusted logical-restore bootstrap failed",
  );
}

function byteSort(left, right) {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

export function canonicalTrustedCompanionJson(value) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value))
      fail("JSON_INVALID", "canonical JSON is invalid");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalTrustedCompanionJson).join(",")}]`;
  }
  if (isPlainObject(value)) {
    return `{${Object.keys(value)
      .sort(byteSort)
      .map(
        (key) =>
          `${JSON.stringify(key)}:${canonicalTrustedCompanionJson(value[key])}`,
      )
      .join(",")}}`;
  }
  fail("JSON_INVALID", "canonical JSON is invalid");
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function exactObject(value, keys, code = "EVIDENCE_INVALID") {
  if (
    !isPlainObject(value) ||
    canonicalTrustedCompanionJson(Object.keys(value).sort(byteSort)) !==
      canonicalTrustedCompanionJson([...keys].sort(byteSort))
  ) {
    fail(code, "controlled object has an unexpected shape");
  }
  return value;
}

function exactStringMap(value, names, code) {
  const map = exactObject(value, names, code);
  for (const name of names) {
    if (
      typeof map[name] !== "string" ||
      map[name].length === 0 ||
      /[\0\r\n]/.test(map[name])
    ) {
      fail(code, "controlled environment map is invalid");
    }
  }
  return map;
}

function assertSha256(value, code = "EVIDENCE_INVALID") {
  if (typeof value !== "string" || !SHA256_PATTERN.test(value)) {
    fail(code, "SHA-256 binding is invalid");
  }
  return value;
}

export function assertTrustedCompanionLauncherCopyPin(
  copySha256,
  expectedSha256,
) {
  assertSha256(copySha256, "LAUNCHER_PIN_CHANGED");
  assertSha256(expectedSha256, "LAUNCHER_PIN_CHANGED");
  if (copySha256 !== expectedSha256) {
    fail("LAUNCHER_PIN_CHANGED", "launcher copy differs from fresh pin");
  }
  return true;
}

function assertPositiveInteger(value, code = "EVIDENCE_INVALID") {
  if (!Number.isSafeInteger(value) || value <= 0) {
    fail(code, "positive evidence count is invalid");
  }
  return value;
}

function assertNonNegativeInteger(value, code = "EVIDENCE_INVALID") {
  if (!Number.isSafeInteger(value) || value < 0) {
    fail(code, "evidence count is invalid");
  }
  return value;
}

function assertTimestamp(value, code = "EVIDENCE_INVALID") {
  if (
    typeof value !== "string" ||
    !ISO_UTC_PATTERN.test(value) ||
    !Number.isFinite(Date.parse(value))
  ) {
    fail(code, "evidence timestamp is invalid");
  }
  return value;
}

function sameIdentity(left, right) {
  return left.dev === right.dev && left.ino === right.ino;
}

function stableIdentity(stats) {
  return {
    dev: stats.dev,
    ino: stats.ino,
    mode: stats.mode,
    mtimeNs: stats.mtimeNs,
    nlink: stats.nlink,
    size: stats.size,
    uid: stats.uid,
  };
}

function sameStableIdentity(left, right) {
  return (
    sameIdentity(left, right) &&
    left.mode === right.mode &&
    left.mtimeNs === right.mtimeNs &&
    left.nlink === right.nlink &&
    left.size === right.size &&
    left.uid === right.uid
  );
}

function safeBasename(value, pattern, code = "ARGUMENTS_INVALID") {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value !== basename(value) ||
    /[\\/\0\r\n:@]/.test(value) ||
    !pattern.test(value)
  ) {
    fail(code, "non-sensitive basename is invalid");
  }
  return value;
}

export function parseTrustedCompanionBootstrapArguments(arguments_) {
  if (!Array.isArray(arguments_)) {
    fail("ARGUMENTS_INVALID", "bootstrap arguments are invalid");
  }
  const values = new Map();
  let preflight = false;
  for (const argument of arguments_) {
    if (
      typeof argument !== "string" ||
      argument.length === 0 ||
      /[\0\r\n]/.test(argument) ||
      argument.includes("://") ||
      argument.includes("@") ||
      argument.includes("/") ||
      argument.includes("\\")
    ) {
      fail(
        "ARGUMENTS_PRIVATE",
        "private or credential-bearing argv is forbidden",
      );
    }
    if (argument === "--preflight") {
      if (preflight)
        fail("ARGUMENTS_DUPLICATE", "duplicate bootstrap argument");
      preflight = true;
      continue;
    }
    const match = /^(--backup-basename|--output-basename)=(.+)$/.exec(argument);
    if (!match) fail("ARGUMENTS_INVALID", "bootstrap arguments are invalid");
    if (values.has(match[1])) {
      fail("ARGUMENTS_DUPLICATE", "duplicate bootstrap argument");
    }
    values.set(match[1], match[2]);
  }
  if (values.size !== 2) {
    fail(
      "ARGUMENTS_REQUIRED",
      "exact backup and output basenames are required",
    );
  }
  return Object.freeze({
    backupBasename: safeBasename(
      values.get("--backup-basename"),
      BACKUP_BASENAME_PATTERN,
    ),
    outputBasename: safeBasename(
      values.get("--output-basename"),
      OUTPUT_BASENAME_PATTERN,
    ),
    preflight,
  });
}

export function assertTrustedCompanionBootstrapEnvironment(
  environment = process.env,
  execArgv = process.execArgv,
) {
  const expected = { ...TRUSTED_COMPANION_BOOTSTRAP_CLEAN_ENVIRONMENT };
  if (process.platform === "darwin") {
    const currentUid = process.getuid?.();
    const expectedEncoding =
      currentUid === undefined
        ? undefined
        : `0x${currentUid.toString(16).toUpperCase()}:0x0:0x0`;
    if (environment?.__CF_USER_TEXT_ENCODING !== expectedEncoding) {
      fail(
        "PRE_NODE_ENVIRONMENT_DIRTY",
        "Darwin process encoding environment differs",
      );
    }
    expected.__CF_USER_TEXT_ENCODING = expectedEncoding;
  }
  if (
    environment === null ||
    typeof environment !== "object" ||
    Array.isArray(environment) ||
    Object.values(environment).some((value) => typeof value !== "string") ||
    canonicalTrustedCompanionJson(
      Object.fromEntries(Object.entries(environment)),
    ) !== canonicalTrustedCompanionJson(expected) ||
    !Array.isArray(execArgv) ||
    execArgv.length !== 0
  ) {
    fail(
      "PRE_NODE_ENVIRONMENT_DIRTY",
      "bootstrap requires the exact clean pre-Node environment",
    );
  }
  return true;
}

export function trustedCompanionBootstrapObservedCleanEnvironment() {
  const environment = { ...TRUSTED_COMPANION_BOOTSTRAP_CLEAN_ENVIRONMENT };
  if (process.platform === "darwin") {
    const currentUid = process.getuid?.();
    if (currentUid === undefined) {
      fail("PRE_NODE_ENVIRONMENT_DIRTY", "Darwin process owner is unavailable");
    }
    environment.__CF_USER_TEXT_ENCODING = `0x${currentUid.toString(16).toUpperCase()}:0x0:0x0`;
  }
  return Object.freeze(environment);
}

function assertOwner(stats, code) {
  const currentUid = process.getuid?.();
  if (currentUid !== undefined && stats.uid !== BigInt(currentUid)) {
    fail(code, "private storage owner differs");
  }
}

function openCanonicalDirectory(path, { mode, code }) {
  if (typeof path !== "string" || !isAbsolute(path) || /[\0\r\n]/.test(path)) {
    fail(code, "controlled directory is invalid");
  }
  let canonical;
  let pathStats;
  let descriptor;
  try {
    canonical = realpathSync(path);
    pathStats = lstatSync(canonical, { bigint: true });
    descriptor = openSync(
      canonical,
      constants.O_RDONLY |
        (constants.O_DIRECTORY ?? 0) |
        (constants.O_NOFOLLOW ?? 0) |
        (constants.O_CLOEXEC ?? 0),
    );
    const opened = fstatSync(descriptor, { bigint: true });
    if (
      canonical !== path ||
      !pathStats.isDirectory() ||
      pathStats.isSymbolicLink() ||
      !opened.isDirectory() ||
      opened.isSymbolicLink() ||
      !sameIdentity(pathStats, opened) ||
      (Number(pathStats.mode) & 0o777) !== mode ||
      (Number(opened.mode) & 0o777) !== mode
    ) {
      fail(code, "controlled directory identity differs");
    }
    assertOwner(pathStats, code);
    return {
      descriptor,
      identity: stableIdentity(pathStats),
      path: canonical,
    };
  } catch (error) {
    if (descriptor !== undefined) closeSync(descriptor);
    if (error instanceof TrustedLogicalRestoreBootstrapError) throw error;
    fail(code, "controlled directory is missing or unreadable");
  }
}

function closeDirectory(directory) {
  if (directory?.descriptor !== undefined) closeSync(directory.descriptor);
}

function assertDirectoryStable(directory, code) {
  const pathStats = lstatSync(directory.path, { bigint: true });
  const opened = fstatSync(directory.descriptor, { bigint: true });
  if (
    realpathSync(directory.path) !== directory.path ||
    !sameStableIdentity(directory.identity, stableIdentity(pathStats)) ||
    !sameStableIdentity(directory.identity, stableIdentity(opened))
  ) {
    fail(code, "controlled directory changed");
  }
}

function assertInsideRoot(root, path, code) {
  const relationship = relative(root, path);
  if (
    relationship === "" ||
    relationship === ".." ||
    relationship.startsWith(`..${sep}`) ||
    isAbsolute(relationship)
  ) {
    fail(code, "controlled path escaped fixed storage");
  }
}

function openStableFile(
  path,
  { allowedModes, code, maxBytes = MAX_JSON_BYTES, ownerOnly = false, root },
) {
  let canonical;
  let pathStats;
  let descriptor;
  try {
    canonical = realpathSync(path);
    pathStats = lstatSync(canonical, { bigint: true });
    if (root) assertInsideRoot(root, canonical, code);
    descriptor = openSync(
      canonical,
      constants.O_RDONLY |
        (constants.O_NOFOLLOW ?? 0) |
        (constants.O_CLOEXEC ?? 0),
    );
    const opened = fstatSync(descriptor, { bigint: true });
    if (
      canonical !== path ||
      !pathStats.isFile() ||
      pathStats.isSymbolicLink() ||
      pathStats.nlink !== 1n ||
      !sameStableIdentity(stableIdentity(pathStats), stableIdentity(opened)) ||
      pathStats.size <= 0n ||
      pathStats.size > BigInt(maxBytes) ||
      (ownerOnly && (Number(pathStats.mode) & 0o077) !== 0) ||
      (allowedModes && !allowedModes.includes(Number(pathStats.mode) & 0o777))
    ) {
      fail(code, "controlled file identity differs");
    }
    assertOwner(pathStats, code);
    return {
      descriptor,
      identity: stableIdentity(pathStats),
      path: canonical,
    };
  } catch (error) {
    if (descriptor !== undefined) closeSync(descriptor);
    if (error instanceof TrustedLogicalRestoreBootstrapError) throw error;
    fail(code, "controlled file is missing or unreadable");
  }
}

function readStableFile(path, options) {
  const opened = openStableFile(path, options);
  try {
    const bytes = readFileSync(opened.descriptor);
    const after = fstatSync(opened.descriptor, { bigint: true });
    if (
      !sameStableIdentity(opened.identity, stableIdentity(after)) ||
      after.size !== BigInt(bytes.length)
    ) {
      fail(options.code, "controlled file changed while it was read");
    }
    return { bytes, identity: opened.identity };
  } finally {
    closeSync(opened.descriptor);
  }
}

function requireCanonicalJson(bytes, code) {
  let text;
  let value;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    value = JSON.parse(text);
  } catch {
    fail(code, "controlled JSON is invalid");
  }
  if (`${canonicalTrustedCompanionJson(value)}\n` !== text) {
    fail(code, "controlled JSON is not canonical");
  }
  return value;
}

export function readStrictDatabaseEnvironmentTarget({
  envLinkPath,
  projectRoot,
}) {
  let linkStats;
  let linkText;
  let target;
  try {
    linkStats = lstatSync(envLinkPath, { bigint: true });
    if (!linkStats.isSymbolicLink()) {
      fail("DOTENV_LINK_INVALID", "project .env must be one external symlink");
    }
    assertOwner(linkStats, "DOTENV_LINK_INVALID");
    linkText = readlinkSync(envLinkPath);
    const lexicalTarget = resolve(dirname(envLinkPath), linkText);
    target = realpathSync(envLinkPath);
    if (realpathSync(lexicalTarget) !== target) {
      fail("DOTENV_LINK_INVALID", "project .env target differs");
    }
    const canonicalProjectRoot = realpathSync(projectRoot);
    if (
      target === canonicalProjectRoot ||
      target.startsWith(`${canonicalProjectRoot}${sep}`)
    ) {
      fail(
        "DOTENV_SCOPE_INVALID",
        "database environment target must be external",
      );
    }
  } catch (error) {
    if (error instanceof TrustedLogicalRestoreBootstrapError) throw error;
    fail("DOTENV_LINK_INVALID", "project .env link is invalid");
  }
  const read = readStableFile(target, {
    code: "DOTENV_TARGET_INVALID",
    maxBytes: 16_384,
  });
  if (![0o400, 0o600].includes(Number(read.identity.mode) & 0o777)) {
    fail("DOTENV_TARGET_MODE", "database environment target is not owner-only");
  }
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(read.bytes);
  } catch {
    fail("DOTENV_SYNTAX_INVALID", "database environment syntax is invalid");
  }
  if (text.includes("\r") || text.includes("\0")) {
    fail("DOTENV_SYNTAX_INVALID", "database environment syntax is invalid");
  }
  let databaseUrl;
  let assignments = 0;
  for (const line of text.split("\n")) {
    if (line === "" || line.startsWith("#")) continue;
    const match = /^DATABASE_URL="([^"\\]+)"$/.exec(line);
    if (!match) {
      fail("DOTENV_SYNTAX_INVALID", "database environment syntax is invalid");
    }
    assignments += 1;
    databaseUrl = match[1];
  }
  if (assignments !== 1 || !databaseUrl) {
    fail(
      "DOTENV_KEY_INVALID",
      "exactly one DATABASE_URL assignment is required",
    );
  }
  const source = parseControlledPostgresUrl(databaseUrl);
  const admin = new URL(source.url.href);
  admin.pathname = "/postgres";
  const reparsedAdmin = parseControlledPostgresUrl(admin.href);
  if (
    reparsedAdmin.databaseName !== "postgres" ||
    source.databaseName !== "foodsystems" ||
    source.user !== "foodsystems" ||
    reparsedAdmin.user !== "foodsystems" ||
    source.host !== reparsedAdmin.host ||
    source.port !== reparsedAdmin.port ||
    source.user !== reparsedAdmin.user ||
    source.password !== reparsedAdmin.password ||
    source.url.search !== reparsedAdmin.url.search ||
    source.url.hash !== reparsedAdmin.url.hash
  ) {
    fail("DATABASE_ADMIN_DERIVATION", "restore admin URL derivation differs");
  }
  try {
    const afterLink = lstatSync(envLinkPath, { bigint: true });
    if (
      !afterLink.isSymbolicLink() ||
      !sameStableIdentity(
        stableIdentity(linkStats),
        stableIdentity(afterLink),
      ) ||
      readlinkSync(envLinkPath) !== linkText ||
      realpathSync(envLinkPath) !== target
    ) {
      fail(
        "DOTENV_LINK_CHANGED",
        "project .env link changed while it was read",
      );
    }
  } catch (error) {
    if (error instanceof TrustedLogicalRestoreBootstrapError) throw error;
    fail("DOTENV_LINK_CHANGED", "project .env link changed while it was read");
  }
  return Object.freeze({
    adminDatabaseUrl: reparsedAdmin.url.href,
    sourceDatabaseName: source.databaseName,
    sourceDatabaseUrl: source.url.href,
  });
}

function parseControlledPostgresUrl(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    fail("DATABASE_URL_INVALID", "database URL is invalid");
  }
  if (
    !url ||
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    url.href !== raw ||
    url.hash !== ""
  ) {
    fail("DATABASE_URL_INVALID", "database URL is invalid");
  }
  let databaseName;
  let host;
  let password;
  let user;
  try {
    databaseName = decodeURIComponent(url.pathname.replace(/^\//, ""));
    host = decodeURIComponent(url.hostname);
    password = decodeURIComponent(url.password);
    user = decodeURIComponent(url.username);
  } catch {
    fail("DATABASE_URL_INVALID", "database URL encoding is invalid");
  }
  const port = url.port || "5432";
  const queryEntries = [...url.searchParams.entries()];
  if (
    !databaseName ||
    databaseName.includes("/") ||
    !host ||
    !user ||
    !password ||
    !/^\d+$/.test(port) ||
    !["127.0.0.1", "::1", "localhost"].includes(host) ||
    queryEntries.length !== 1 ||
    queryEntries[0][0] !== "schema" ||
    queryEntries[0][1].length === 0 ||
    [databaseName, host, password, user].some((value) => /[\0\r\n]/.test(value))
  ) {
    fail("DATABASE_URL_INVALID", "database URL fields are invalid");
  }
  return { databaseName, host, password, port, url, user };
}

function canonicalEqual(left, right) {
  return (
    canonicalTrustedCompanionJson(left) === canonicalTrustedCompanionJson(right)
  );
}

function validateCoreCounts(value, code = "EVIDENCE_INVALID") {
  const counts = exactObject(value, CORE_COUNT_KEYS, code);
  for (const key of CORE_COUNT_KEYS) {
    assertNonNegativeInteger(counts[key], code);
  }
  if (counts.DatabaseIdentity !== 1) {
    fail(code, "database identity count is invalid");
  }
  return counts;
}

function validateBackupMetadata(value, backupBasename, sourceDatabaseName) {
  const metadata = exactObject(
    value,
    [
      "completedPrismaMigrationLedger",
      "coreCounts",
      "createdAtUtc",
      "databaseIdentity",
      "dump",
      "format",
      "source",
      "targetDatabaseFingerprint",
      "version",
    ],
    "METADATA_INVALID",
  );
  if (
    metadata.format !== "foodsystems-database-backup-metadata" ||
    metadata.version !== 2
  ) {
    fail("METADATA_INVALID", "backup metadata identity differs");
  }
  assertTimestamp(metadata.createdAtUtc, "METADATA_INVALID");
  const source = exactObject(
    metadata.source,
    ["databaseName", "serverVersion"],
    "METADATA_INVALID",
  );
  if (
    source.databaseName !== sourceDatabaseName ||
    !/^[a-zA-Z0-9_.:@-]+$/.test(source.databaseName) ||
    typeof source.serverVersion !== "string" ||
    source.serverVersion.length === 0 ||
    /[\0\r\n]/.test(source.serverVersion)
  ) {
    fail("METADATA_INVALID", "backup metadata source differs");
  }
  const dump = exactObject(
    metadata.dump,
    ["archiveFormat", "bytes", "fileName", "sha256"],
    "METADATA_INVALID",
  );
  if (
    dump.archiveFormat !== "postgresql-custom" ||
    dump.fileName !== backupBasename
  ) {
    fail("METADATA_INVALID", "backup metadata dump declaration differs");
  }
  assertPositiveInteger(dump.bytes, "METADATA_INVALID");
  assertSha256(dump.sha256, "METADATA_INVALID");
  const identity = exactObject(
    metadata.databaseIdentity,
    ["key", "uuid"],
    "METADATA_INVALID",
  );
  if (identity.key !== "primary" || !UUID_PATTERN.test(identity.uuid)) {
    fail("METADATA_INVALID", "backup database identity differs");
  }
  const ledger = exactObject(
    metadata.completedPrismaMigrationLedger,
    ["completedCount", "sha256"],
    "METADATA_INVALID",
  );
  assertPositiveInteger(ledger.completedCount, "METADATA_INVALID");
  assertSha256(ledger.sha256, "METADATA_INVALID");
  const coreCounts = validateCoreCounts(
    metadata.coreCounts,
    "METADATA_INVALID",
  );
  const fingerprint = exactObject(
    metadata.targetDatabaseFingerprint,
    ["canonicalJsonFormat", "sha256"],
    "METADATA_INVALID",
  );
  if (fingerprint.canonicalJsonFormat !== "sorted-keys-v1") {
    fail("METADATA_INVALID", "backup fingerprint format differs");
  }
  assertSha256(fingerprint.sha256, "METADATA_INVALID");
  const recomputed = sha256(
    canonicalTrustedCompanionJson({
      completedPrismaMigrationLedger: ledger,
      coreCounts,
      databaseIdentity: identity,
    }),
  );
  if (recomputed !== fingerprint.sha256) {
    fail("METADATA_INVALID", "backup fingerprint binding differs");
  }
  return metadata;
}

function validateStructuralRestoreReceipt(value, metadata, metadataSha256) {
  const receipt = exactObject(
    value,
    [
      "backup",
      "checks",
      "cleanup",
      "completedAtUtc",
      "completedPrismaMigrationLedger",
      "coreCounts",
      "databaseIdentity",
      "format",
      "targetDatabaseFingerprint",
      "version",
    ],
    "STRUCTURAL_RECEIPT_INVALID",
  );
  if (
    receipt.format !== "foodsystems-database-restore-receipt" ||
    receipt.version !== 1 ||
    Date.parse(
      assertTimestamp(receipt.completedAtUtc, "STRUCTURAL_RECEIPT_INVALID"),
    ) < Date.parse(metadata.createdAtUtc)
  ) {
    fail("STRUCTURAL_RECEIPT_INVALID", "structural receipt identity differs");
  }
  const backup = exactObject(
    receipt.backup,
    ["dumpBytes", "dumpSha256", "metadataSha256"],
    "STRUCTURAL_RECEIPT_INVALID",
  );
  if (
    backup.dumpBytes !== metadata.dump.bytes ||
    backup.dumpSha256 !== metadata.dump.sha256 ||
    backup.metadataSha256 !== metadataSha256
  ) {
    fail("STRUCTURAL_RECEIPT_INVALID", "structural backup binding differs");
  }
  if (
    !canonicalEqual(receipt.databaseIdentity, metadata.databaseIdentity) ||
    !canonicalEqual(
      receipt.completedPrismaMigrationLedger,
      metadata.completedPrismaMigrationLedger,
    ) ||
    !canonicalEqual(receipt.coreCounts, metadata.coreCounts) ||
    !canonicalEqual(
      receipt.targetDatabaseFingerprint,
      metadata.targetDatabaseFingerprint,
    )
  ) {
    fail("STRUCTURAL_RECEIPT_INVALID", "structural metadata binding differs");
  }
  const checkNames = [
    "archiveChecksumAndCatalog",
    "completedMigrationLedger",
    "constraintsValidated",
    "databaseIdentity",
    "exactCoreCounts",
    "indexesReady",
    "metadataV2Binding",
    "optionalOperatorExpectedCounts",
    "requiredRelationsAndNonEmptyData",
    "restoreCompleted",
    "targetDatabaseFingerprint",
  ];
  const checks = exactObject(
    receipt.checks,
    checkNames,
    "STRUCTURAL_RECEIPT_INVALID",
  );
  for (const name of checkNames) {
    if (name !== "optionalOperatorExpectedCounts" && checks[name] !== "pass") {
      fail("STRUCTURAL_RECEIPT_INVALID", "structural check did not pass");
    }
  }
  const optional = exactObject(
    checks.optionalOperatorExpectedCounts,
    ["status", "supplied"],
    "STRUCTURAL_RECEIPT_INVALID",
  );
  if (optional.status !== "pass" || !isPlainObject(optional.supplied)) {
    fail("STRUCTURAL_RECEIPT_INVALID", "optional count checks differ");
  }
  for (const [name, count] of Object.entries(optional.supplied)) {
    if (
      !CORE_COUNT_KEYS.includes(name) ||
      !Number.isSafeInteger(count) ||
      count < 0 ||
      metadata.coreCounts[name] !== count
    ) {
      fail("STRUCTURAL_RECEIPT_INVALID", "optional count binding differs");
    }
  }
  const cleanup = exactObject(
    receipt.cleanup,
    ["databaseAbsenceConfirmed", "databaseName", "drop"],
    "STRUCTURAL_RECEIPT_INVALID",
  );
  if (
    cleanup.databaseAbsenceConfirmed !== true ||
    cleanup.drop !== "pass" ||
    typeof cleanup.databaseName !== "string" ||
    !/^foodsystems_restore_[a-z0-9_]+$/.test(cleanup.databaseName)
  ) {
    fail("STRUCTURAL_RECEIPT_INVALID", "structural cleanup differs");
  }
  return receipt;
}

async function hashStableFile(path, options) {
  const opened = openStableFile(path, {
    ...options,
    maxBytes: Number.MAX_SAFE_INTEGER,
  });
  const digest = createHash("sha256");
  let bytes = 0;
  try {
    await new Promise((resolveStream, rejectStream) => {
      const stream = createReadStream(opened.path, {
        autoClose: false,
        fd: opened.descriptor,
      });
      stream.on("data", (chunk) => {
        bytes += chunk.length;
        digest.update(chunk);
      });
      stream.once("end", resolveStream);
      stream.once("error", rejectStream);
    });
    const after = fstatSync(opened.descriptor, { bigint: true });
    if (
      !sameStableIdentity(opened.identity, stableIdentity(after)) ||
      BigInt(bytes) !== after.size
    ) {
      fail(options.code, "controlled file changed while it was hashed");
    }
    return Object.freeze({
      bytes,
      identity: opened.identity,
      sha256: digest.digest("hex"),
    });
  } catch (error) {
    if (error instanceof TrustedLogicalRestoreBootstrapError) throw error;
    fail(options.code, "controlled file could not be hashed");
  } finally {
    closeSync(opened.descriptor);
  }
}

function privateCorpusDirectory(path, code) {
  const directory = openCanonicalDirectory(path, { code, mode: 0o700 });
  try {
    if (readdirSync(directory.path).length === 0) {
      fail(code, "private corpus root is empty");
    }
    assertDirectoryStable(directory, code);
    return Object.freeze({
      identity: directory.identity,
      path: directory.path,
    });
  } finally {
    closeDirectory(directory);
  }
}

export function discoverTrustedCompanionCorpusRoots({
  documentsRoot = join(homedir(), "Documents"),
  volumesRoot = "/Volumes",
} = {}) {
  let primary;
  let replicaCandidates;
  try {
    const canonicalDocuments = realpathSync(documentsRoot);
    const canonicalVolumes = realpathSync(volumesRoot);
    if (
      canonicalDocuments !== documentsRoot ||
      canonicalVolumes !== volumesRoot
    ) {
      fail("CORPUS_ROOT_DISCOVERY", "corpus discovery roots are not canonical");
    }
    primary = privateCorpusDirectory(
      join(
        canonicalDocuments,
        PRIMARY_PROJECT_BASENAME,
        ".private-archive",
        "corpus",
      ),
      "PRIMARY_CORPUS_INVALID",
    );
    replicaCandidates = [];
    for (const volumeName of readdirSync(canonicalVolumes).sort(byteSort)) {
      if (
        !volumeName ||
        volumeName === "." ||
        volumeName === ".." ||
        volumeName.includes(sep) ||
        /[\0\r\n]/.test(volumeName)
      ) {
        continue;
      }
      const candidate = join(
        canonicalVolumes,
        volumeName,
        REPLICA_ARCHIVE_BASENAME,
        "corpus",
      );
      try {
        lstatSync(candidate);
      } catch (error) {
        if (error?.code === "ENOENT") continue;
        throw error;
      }
      replicaCandidates.push(
        privateCorpusDirectory(candidate, "REPLICA_CORPUS_INVALID"),
      );
    }
  } catch (error) {
    if (error instanceof TrustedLogicalRestoreBootstrapError) throw error;
    fail(
      "CORPUS_ROOT_DISCOVERY",
      "private corpus roots could not be discovered",
    );
  }
  if (replicaCandidates.length !== 1) {
    fail("REPLICA_CORPUS_AMBIGUOUS", "exactly one private replica is required");
  }
  const replica = replicaCandidates[0];
  if (
    primary.path === replica.path ||
    sameIdentity(primary.identity, replica.identity)
  ) {
    fail("CORPUS_ROOT_COLLISION", "primary and replica roots must be distinct");
  }
  return Object.freeze({
    primaryCorpusRoot: primary.path,
    replicaCorpusRoot: replica.path,
  });
}

function assertReceiptTarget(path, root) {
  assertInsideRoot(root, path, "RECEIPT_TARGET_INVALID");
  try {
    const stats = lstatSync(path, { bigint: true });
    if (
      !stats.isFile() ||
      stats.isSymbolicLink() ||
      stats.nlink !== 1n ||
      (Number(stats.mode) & 0o777) !== 0o400
    ) {
      fail("RECEIPT_TARGET_INVALID", "existing receipt target is unsafe");
    }
    assertOwner(stats, "RECEIPT_TARGET_INVALID");
    const opened = openStableFile(path, {
      allowedModes: [0o400],
      code: "RECEIPT_TARGET_INVALID",
      maxBytes: MAX_JSON_BYTES,
      ownerOnly: true,
      root,
    });
    closeSync(opened.descriptor);
    return "present";
  } catch (error) {
    if (error instanceof TrustedLogicalRestoreBootstrapError) throw error;
    if (error?.code !== "ENOENT") {
      fail("RECEIPT_TARGET_INVALID", "receipt target could not be inspected");
    }
    return "absent";
  }
}

export async function loadTrustedCompanionEvidence({
  backupBasename,
  outputBasename,
  privateDataRoot = join(homedir(), ".local", "share", "foodsystems"),
  sourceDatabaseName,
}) {
  safeBasename(backupBasename, BACKUP_BASENAME_PATTERN);
  safeBasename(outputBasename, OUTPUT_BASENAME_PATTERN);
  const backupRootPath = join(privateDataRoot, "backups");
  const receiptRootPath = join(privateDataRoot, "restore-receipts");
  const dataRoot = openCanonicalDirectory(privateDataRoot, {
    code: "PRIVATE_STORAGE_INVALID",
    mode: 0o700,
  });
  let backupRoot;
  let receiptRoot;
  let outputRoot;
  try {
    backupRoot = openCanonicalDirectory(backupRootPath, {
      code: "BACKUP_STORAGE_INVALID",
      mode: 0o700,
    });
    receiptRoot = openCanonicalDirectory(receiptRootPath, {
      code: "RECEIPT_STORAGE_INVALID",
      mode: 0o700,
    });
    outputRoot = openCanonicalDirectory(
      join(receiptRoot.path, outputBasename),
      {
        code: "OUTPUT_STORAGE_INVALID",
        mode: 0o700,
      },
    );
    const dumpPath = join(backupRoot.path, backupBasename);
    const metadataPath = `${dumpPath}.metadata`;
    const metadataBindingPath = `${metadataPath}.sha256`;
    const dumpBindingPath = `${dumpPath}.sha256`;
    const structuralBasename = backupBasename.replace(
      /\.dump$/,
      ".restore-receipt.json",
    );
    const structuralReceiptPath = join(receiptRoot.path, structuralBasename);
    const metadataRead = readStableFile(metadataPath, {
      allowedModes: [0o400, 0o600],
      code: "METADATA_INVALID",
      ownerOnly: true,
      root: backupRoot.path,
    });
    const metadataSha256 = sha256(metadataRead.bytes);
    const metadata = validateBackupMetadata(
      requireCanonicalJson(metadataRead.bytes, "METADATA_INVALID"),
      backupBasename,
      sourceDatabaseName,
    );
    const metadataBinding = readStableFile(metadataBindingPath, {
      allowedModes: [0o400, 0o600],
      code: "METADATA_BINDING_INVALID",
      maxBytes: 128,
      ownerOnly: true,
      root: backupRoot.path,
    });
    if (metadataBinding.bytes.toString("utf8") !== `${metadataSha256}\n`) {
      fail("METADATA_BINDING_INVALID", "metadata hash binding differs");
    }
    const dump = await hashStableFile(dumpPath, {
      allowedModes: [0o400, 0o600],
      code: "DUMP_INVALID",
      ownerOnly: true,
      root: backupRoot.path,
    });
    if (
      dump.bytes !== metadata.dump.bytes ||
      dump.sha256 !== metadata.dump.sha256
    ) {
      fail("DUMP_BINDING_INVALID", "dump binding differs");
    }
    const dumpBinding = readStableFile(dumpBindingPath, {
      allowedModes: [0o400, 0o600],
      code: "DUMP_BINDING_INVALID",
      maxBytes: 512,
      ownerOnly: true,
      root: backupRoot.path,
    });
    if (
      dumpBinding.bytes.toString("utf8") !==
      `${dump.sha256}  ${backupBasename}\n`
    ) {
      fail("DUMP_BINDING_INVALID", "dump sidecar binding differs");
    }
    const structuralRead = readStableFile(structuralReceiptPath, {
      allowedModes: [0o400, 0o600],
      code: "STRUCTURAL_RECEIPT_INVALID",
      ownerOnly: true,
      root: receiptRoot.path,
    });
    const structuralReceipt = validateStructuralRestoreReceipt(
      requireCanonicalJson(structuralRead.bytes, "STRUCTURAL_RECEIPT_INVALID"),
      metadata,
      metadataSha256,
    );
    const companionReceiptPath = join(
      outputRoot.path,
      COMPANION_RECEIPT_BASENAME,
    );
    const rehearsalReceiptPath = join(
      outputRoot.path,
      REHEARSAL_RECEIPT_BASENAME,
    );
    assertReceiptTarget(companionReceiptPath, outputRoot.path);
    assertReceiptTarget(rehearsalReceiptPath, outputRoot.path);
    assertDirectoryStable(dataRoot, "PRIVATE_STORAGE_INVALID");
    assertDirectoryStable(backupRoot, "BACKUP_STORAGE_INVALID");
    assertDirectoryStable(receiptRoot, "RECEIPT_STORAGE_INVALID");
    assertDirectoryStable(outputRoot, "OUTPUT_STORAGE_INVALID");
    return Object.freeze({
      companionReceiptPath,
      dumpBytes: dump.bytes,
      dumpPath,
      dumpSha256: dump.sha256,
      metadataBindingPath,
      metadataPath,
      metadataSha256,
      rehearsalReceiptPath,
      structuralCompletedAtUtc: structuralReceipt.completedAtUtc,
      structuralReceiptPath,
      structuralReceiptSha256: sha256(structuralRead.bytes),
    });
  } finally {
    closeDirectory(outputRoot);
    closeDirectory(receiptRoot);
    closeDirectory(backupRoot);
    closeDirectory(dataRoot);
  }
}

function validateTemporaryRoot(path) {
  try {
    const canonical = realpathSync(path);
    const stats = lstatSync(canonical, { bigint: true });
    if (
      (path !== "/tmp" && canonical !== path) ||
      !stats.isDirectory() ||
      stats.isSymbolicLink() ||
      (path !== "/tmp" && (Number(stats.mode) & 0o777) !== 0o700)
    ) {
      fail("TEMPORARY_ROOT_INVALID", "temporary root differs");
    }
    return canonical;
  } catch (error) {
    if (error instanceof TrustedLogicalRestoreBootstrapError) throw error;
    fail("TEMPORARY_ROOT_INVALID", "temporary root is unavailable");
  }
}

function createPrivateLauncherCopy({ sourcePath, temporaryRoot }) {
  const root = validateTemporaryRoot(temporaryRoot);
  const source = readStableFile(realpathSync(sourcePath), {
    code: "LAUNCHER_SOURCE_INVALID",
    maxBytes: MAX_JSON_BYTES,
  });
  const directory = mkdtempSync(
    join(root, "foodsystems-source-registration-trusted-launcher-"),
  );
  chmodSync(directory, 0o700);
  const targetPath = join(directory, basename(sourcePath));
  let descriptor;
  try {
    descriptor = openSync(
      targetPath,
      constants.O_WRONLY |
        constants.O_CREAT |
        constants.O_EXCL |
        (constants.O_NOFOLLOW ?? 0),
      0o400,
    );
    writeFileSync(descriptor, source.bytes);
    fsyncSync(descriptor);
    fchmodSync(descriptor, 0o400);
    closeSync(descriptor);
    descriptor = undefined;
    const directoryDescriptor = openSync(
      directory,
      constants.O_RDONLY | (constants.O_DIRECTORY ?? 0),
    );
    try {
      fsyncSync(directoryDescriptor);
    } finally {
      closeSync(directoryDescriptor);
    }
    const stats = lstatSync(targetPath, { bigint: true });
    if (
      !stats.isFile() ||
      stats.isSymbolicLink() ||
      stats.nlink !== 1n ||
      (Number(stats.mode) & 0o777) !== 0o400 ||
      stats.size !== BigInt(source.bytes.length) ||
      sha256(readFileSync(targetPath)) !== sha256(source.bytes) ||
      !canonicalEqual(readdirSync(directory), [basename(targetPath)])
    ) {
      fail("LAUNCHER_COPY_INVALID", "private launcher copy differs");
    }
    assertOwner(stats, "LAUNCHER_COPY_INVALID");
    return Object.freeze({
      bytesSha256: sha256(source.bytes),
      directory,
      path: targetPath,
    });
  } catch (error) {
    if (descriptor !== undefined) closeSync(descriptor);
    rmSync(directory, { force: true, recursive: true });
    if (error instanceof TrustedLogicalRestoreBootstrapError) throw error;
    fail("LAUNCHER_COPY_INVALID", "private launcher copy could not be created");
  }
}

function removePrivateLauncherCopy(copy) {
  if (!copy) return;
  try {
    rmSync(copy.directory, { force: true, recursive: true });
  } catch {
    fail("TEMPORARY_CLEANUP_FAILED", "private launcher cleanup failed");
  }
}

function appendBounded(chunks, chunk, state, limit) {
  state.bytes += chunk.length;
  if (state.bytes > limit) {
    state.overflow = true;
    return;
  }
  chunks.push(chunk);
}

export function parseTrustedLauncherCompanionDiagnostic(stderrBytes, exitCode) {
  if (!Buffer.isBuffer(stderrBytes) || !Number.isInteger(exitCode)) {
    return null;
  }
  for (const candidate of TRUSTED_LAUNCHER_EXACT_DIAGNOSTICS) {
    if (
      candidate.exitCodes.includes(exitCode) &&
      stderrBytes.equals(candidate.bytes)
    ) {
      return candidate.code;
    }
  }
  return null;
}

export function classifyTrustedLauncherCompanionFailure({
  code,
  overflow,
  signal,
  stderrBytes,
  stdoutBytes,
}) {
  if (
    signal !== null ||
    overflow !== false ||
    !Buffer.isBuffer(stdoutBytes) ||
    stdoutBytes.length !== 0 ||
    !Buffer.isBuffer(stderrBytes) ||
    !Number.isInteger(code)
  ) {
    return null;
  }
  return parseTrustedLauncherCompanionDiagnostic(stderrBytes, code);
}

export async function spawnBoundedNode({
  arguments_,
  cwd,
  environment,
  nodeBinary,
  stdio,
  maxStdoutBytes = MAX_CHILD_OUTPUT_BYTES,
}) {
  let child;
  try {
    child = spawn(nodeBinary, arguments_, {
      cwd,
      env: environment,
      stdio,
    });
  } catch {
    fail("CHILD_START_FAILED", "controlled child could not start");
  }
  const stdoutChunks = [];
  const stderrChunks = [];
  const stdoutState = { bytes: 0, overflow: false };
  const stderrState = { bytes: 0, overflow: false };
  child.stdout?.on("data", (chunk) => {
    appendBounded(stdoutChunks, chunk, stdoutState, maxStdoutBytes);
    if (stdoutState.overflow) {
      child.kill("SIGTERM");
    }
  });
  child.stderr?.on("data", (chunk) => {
    appendBounded(stderrChunks, chunk, stderrState, MAX_CHILD_OUTPUT_BYTES);
    if (stderrState.overflow) {
      child.kill("SIGTERM");
    }
  });
  let forwardedSignal;
  const forward = (signal) => {
    forwardedSignal ??= signal;
    child.kill(signal);
  };
  const onInterrupt = () => forward("SIGINT");
  const onTerminate = () => forward("SIGTERM");
  process.once("SIGINT", onInterrupt);
  process.once("SIGTERM", onTerminate);
  try {
    const outcome = await new Promise((resolveChild) => {
      child.once("error", () =>
        resolveChild({ code: null, signal: null, startError: true }),
      );
      child.once("close", (code, signal) =>
        resolveChild({ code, signal, startError: false }),
      );
    });
    if (outcome.startError) {
      fail("CHILD_START_FAILED", "controlled child could not start");
    }
    const stderrBytes = Buffer.concat(stderrChunks);
    const stdoutBytes = Buffer.concat(stdoutChunks);
    return Object.freeze({
      code: outcome.code,
      overflow: stdoutState.overflow || stderrState.overflow,
      signal: outcome.signal ?? forwardedSignal ?? null,
      stderr: stderrBytes.toString("utf8"),
      stderrBytes,
      stdout: stdoutBytes.toString("utf8"),
      stdoutBytes,
    });
  } finally {
    process.removeListener("SIGINT", onInterrupt);
    process.removeListener("SIGTERM", onTerminate);
  }
}

function assertCanonicalAttestation(value, launcherSha256) {
  const attestation = exactObject(
    value,
    [
      "launcher",
      "localClosure",
      "node",
      "nodeModules",
      "postgresqlToolset",
      "prismaGeneratedClient",
      "runtimeAttestationSha256",
      "schemaVersion",
    ],
    "ATTESTATION_INVALID",
  );
  if (
    attestation.schemaVersion !== "source-registration-runtime-attestation-v1"
  ) {
    fail("ATTESTATION_INVALID", "runtime attestation version differs");
  }
  const launcher = exactObject(
    attestation.launcher,
    ["fileSha256", "path"],
    "ATTESTATION_INVALID",
  );
  if (
    launcher.path !== LAUNCHER_RELATIVE_PATH ||
    launcher.fileSha256 !== launcherSha256
  ) {
    fail("ATTESTATION_INVALID", "runtime launcher binding differs");
  }
  const localClosure = exactObject(
    attestation.localClosure,
    ["closureSha256", "entryCount", "roots", "totalFileBytes"],
    "ATTESTATION_INVALID",
  );
  assertSha256(localClosure.closureSha256, "ATTESTATION_INVALID");
  assertPositiveInteger(localClosure.entryCount, "ATTESTATION_INVALID");
  assertPositiveInteger(localClosure.totalFileBytes, "ATTESTATION_INVALID");
  if (
    !Array.isArray(localClosure.roots) ||
    !canonicalEqual(localClosure.roots, EXPECTED_LOCAL_RUNTIME_ROOTS) ||
    localClosure.roots.some(
      (path) =>
        typeof path !== "string" ||
        !path ||
        isAbsolute(path) ||
        path.includes("\\") ||
        path === ".." ||
        path.startsWith("../"),
    )
  ) {
    fail("ATTESTATION_INVALID", "runtime closure roots differ");
  }
  const node = exactObject(
    attestation.node,
    [
      "arch",
      "binaryFileSha256",
      "platform",
      "runtimeClosureManifestSha256",
      "runtimeClosureSha256",
      "runtimeClosureVerifierFileSha256",
      "version",
    ],
    "ATTESTATION_INVALID",
  );
  for (const name of [
    "binaryFileSha256",
    "runtimeClosureManifestSha256",
    "runtimeClosureSha256",
    "runtimeClosureVerifierFileSha256",
  ]) {
    assertSha256(node[name], "ATTESTATION_INVALID");
  }
  if (
    node.arch !== process.arch ||
    node.platform !== process.platform ||
    node.version !== process.version
  ) {
    fail("ATTESTATION_INVALID", "Node runtime identity differs");
  }
  const validateTree = (tree) => {
    const binding = exactObject(
      tree,
      [
        "entryCount",
        "fileCount",
        "path",
        "rootKind",
        "symlinkCount",
        "totalFileBytes",
        "treeSha256",
      ],
      "ATTESTATION_INVALID",
    );
    assertPositiveInteger(binding.entryCount, "ATTESTATION_INVALID");
    assertPositiveInteger(binding.fileCount, "ATTESTATION_INVALID");
    assertNonNegativeInteger(binding.symlinkCount, "ATTESTATION_INVALID");
    assertPositiveInteger(binding.totalFileBytes, "ATTESTATION_INVALID");
    assertSha256(binding.treeSha256, "ATTESTATION_INVALID");
    if (
      !["node_modules", "src/generated/prisma"].includes(binding.path) ||
      binding.rootKind !== "resolved_external_symlink"
    ) {
      fail("ATTESTATION_INVALID", "runtime tree binding differs");
    }
    return binding;
  };
  const nodeModules = validateTree(attestation.nodeModules);
  const prismaGeneratedClient = validateTree(attestation.prismaGeneratedClient);
  if (
    nodeModules.path !== "node_modules" ||
    prismaGeneratedClient.path !== "src/generated/prisma"
  ) {
    fail("ATTESTATION_INVALID", "runtime tree mapping differs");
  }
  const toolset = exactObject(
    attestation.postgresqlToolset,
    [
      "closureSha256",
      "manifestSha256",
      "psqlVersion",
      "toolFileSha256",
      "verifierFileSha256",
    ],
    "ATTESTATION_INVALID",
  );
  for (const name of [
    "closureSha256",
    "manifestSha256",
    "verifierFileSha256",
  ]) {
    assertSha256(toolset[name], "ATTESTATION_INVALID");
  }
  const tools = exactObject(
    toolset.toolFileSha256,
    ["createdb", "dropdb", "pgRestore", "psql"],
    "ATTESTATION_INVALID",
  );
  for (const value of Object.values(tools)) {
    assertSha256(value, "ATTESTATION_INVALID");
  }
  if (
    typeof toolset.psqlVersion !== "string" ||
    !toolset.psqlVersion.startsWith("psql (PostgreSQL) ") ||
    /[\0\r\n]/.test(toolset.psqlVersion)
  ) {
    fail("ATTESTATION_INVALID", "PostgreSQL runtime identity differs");
  }
  const { runtimeAttestationSha256, ...body } = attestation;
  assertSha256(runtimeAttestationSha256, "ATTESTATION_INVALID");
  if (
    sha256(
      `${RUNTIME_ATTESTATION_DOMAIN}${canonicalTrustedCompanionJson(body)}`,
    ) !== runtimeAttestationSha256
  ) {
    fail("ATTESTATION_INVALID", "runtime attestation self-binding differs");
  }
  return attestation;
}

async function computeFreshPublicPins({
  nodeBinary,
  projectRoot,
  temporaryRoot,
}) {
  const launcherSourcePath = realpathSync(
    join(projectRoot, LAUNCHER_RELATIVE_PATH),
  );
  const copy = createPrivateLauncherCopy({
    sourcePath: launcherSourcePath,
    temporaryRoot,
  });
  try {
    const result = await spawnBoundedNode({
      arguments_: [copy.path, "--attest-only"],
      cwd: projectRoot,
      environment: TRUSTED_COMPANION_BOOTSTRAP_CLEAN_ENVIRONMENT,
      maxStdoutBytes: MAX_ATTESTATION_OUTPUT_BYTES,
      nodeBinary,
      stdio: ["ignore", "pipe", "pipe"],
    });
    if (
      result.code !== 0 ||
      result.signal ||
      result.overflow ||
      result.stderr !== "" ||
      !result.stdout.endsWith("\n")
    ) {
      fail("ATTESTATION_FAILED", "runtime attestation did not pass");
    }
    const attestation = assertCanonicalAttestation(
      requireCanonicalJson(Buffer.from(result.stdout), "ATTESTATION_INVALID"),
      copy.bytesSha256,
    );
    const nodePath = realpathSync(nodeBinary);
    const nodeStats = lstatSync(nodePath, { bigint: true });
    if (
      nodePath !== nodeBinary ||
      !nodeStats.isFile() ||
      nodeStats.isSymbolicLink() ||
      sha256(readFileSync(nodePath)) !== attestation.node.binaryFileSha256
    ) {
      fail("NODE_RUNTIME_INVALID", "absolute Node runtime binding differs");
    }
    const pins = {};
    for (const [name, relativePath] of Object.entries(
      DIRECT_PUBLIC_PIN_PATHS,
    )) {
      const path = realpathSync(join(projectRoot, relativePath));
      assertInsideRoot(projectRoot, path, "PUBLIC_PIN_INVALID");
      pins[name] = sha256(
        readStableFile(path, {
          code: "PUBLIC_PIN_INVALID",
          maxBytes: MAX_JSON_BYTES,
        }).bytes,
      );
    }
    Object.assign(pins, {
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
      LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_RUNTIME_ATTESTATION_SHA256:
        attestation.runtimeAttestationSha256,
    });
    exactStringMap(
      pins,
      TRUSTED_COMPANION_PUBLIC_PIN_NAMES,
      "PUBLIC_PIN_INVALID",
    );
    for (const value of Object.values(pins)) {
      assertSha256(value, "PUBLIC_PIN_INVALID");
    }
    return Object.freeze(pins);
  } catch (error) {
    throw safeBoundary(error, "ATTESTATION_FAILED");
  } finally {
    removePrivateLauncherCopy(copy);
  }
}

function canonicalCapabilityEnvelope(format, environment) {
  return {
    environment,
    format,
    purpose: TRUSTED_PURPOSE,
    version: 1,
  };
}

function writeCapabilityFile(directory, name, envelope) {
  const bytes = Buffer.from(`${canonicalTrustedCompanionJson(envelope)}\n`);
  if (bytes.length === 0 || bytes.length > MAX_CAPABILITY_BYTES) {
    fail("CAPABILITY_INVALID", "trusted capability size differs");
  }
  const path = join(directory, `${name}-${randomUUID()}.json`);
  let writer;
  let reader;
  try {
    writer = openSync(
      path,
      constants.O_WRONLY |
        constants.O_CREAT |
        constants.O_EXCL |
        (constants.O_NOFOLLOW ?? 0),
      0o400,
    );
    writeFileSync(writer, bytes);
    fsyncSync(writer);
    fchmodSync(writer, 0o400);
    closeSync(writer);
    writer = undefined;
    reader = openSync(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
    const check = Buffer.alloc(bytes.length);
    if (
      readSync(reader, check, 0, check.length, 0) !== check.length ||
      !check.equals(bytes)
    ) {
      fail("CAPABILITY_INVALID", "trusted capability bytes differ");
    }
    unlinkSync(path);
    const stats = fstatSync(reader, { bigint: true });
    if (
      !stats.isFile() ||
      stats.nlink !== 0n ||
      (Number(stats.mode) & 0o777) !== 0o400 ||
      stats.size !== BigInt(bytes.length)
    ) {
      fail("CAPABILITY_INVALID", "trusted capability descriptor differs");
    }
    assertOwner(stats, "CAPABILITY_INVALID");
    return reader;
  } catch (error) {
    if (writer !== undefined) closeSync(writer);
    if (reader !== undefined) closeSync(reader);
    try {
      unlinkSync(path);
    } catch {
      // The file may already be unlinked; no path is retained.
    }
    if (error instanceof TrustedLogicalRestoreBootstrapError) throw error;
    fail("CAPABILITY_INVALID", "trusted capability could not be created");
  }
}

function createTrustedCapabilities({ publicPins, secretInput, temporaryRoot }) {
  exactStringMap(
    publicPins,
    TRUSTED_COMPANION_PUBLIC_PIN_NAMES,
    "PUBLIC_PIN_INVALID",
  );
  exactStringMap(
    secretInput,
    ["DATABASE_URL", ...TRUSTED_COMPANION_SECRET_NAMES],
    "SECRET_INPUT_INVALID",
  );
  const root = validateTemporaryRoot(temporaryRoot);
  const directory = mkdtempSync(
    join(root, "foodsystems-logical-restore-capabilities-"),
  );
  chmodSync(directory, 0o700);
  let publicDescriptor;
  let secretDescriptor;
  try {
    publicDescriptor = writeCapabilityFile(
      directory,
      "public",
      canonicalCapabilityEnvelope(TRUSTED_PUBLIC_FORMAT, publicPins),
    );
    secretDescriptor = writeCapabilityFile(
      directory,
      "secret",
      canonicalCapabilityEnvelope(TRUSTED_SECRET_FORMAT, secretInput),
    );
    const directoryDescriptor = openSync(
      directory,
      constants.O_RDONLY | (constants.O_DIRECTORY ?? 0),
    );
    try {
      fsyncSync(directoryDescriptor);
    } finally {
      closeSync(directoryDescriptor);
    }
    if (readdirSync(directory).length !== 0) {
      fail("CAPABILITY_INVALID", "capability paths remain linked");
    }
    rmdirSync(directory);
    return { publicDescriptor, secretDescriptor };
  } catch (error) {
    if (publicDescriptor !== undefined) closeSync(publicDescriptor);
    if (secretDescriptor !== undefined) closeSync(secretDescriptor);
    rmSync(directory, { force: true, recursive: true });
    throw safeBoundary(error, "CAPABILITY_INVALID");
  }
}

function closeCapabilities(capabilities) {
  if (!capabilities) return;
  if (capabilities.publicDescriptor !== undefined) {
    closeSync(capabilities.publicDescriptor);
  }
  if (capabilities.secretDescriptor !== undefined) {
    closeSync(capabilities.secretDescriptor);
  }
}

function verifyPrivateLauncherDescriptorPair({
  expectedLauncherSha256,
  sourcePath,
  temporaryRoot,
}) {
  const copy = createPrivateLauncherCopy({ sourcePath, temporaryRoot });
  let launcherDescriptor;
  let entryDescriptor;
  try {
    assertTrustedCompanionLauncherCopyPin(
      copy.bytesSha256,
      expectedLauncherSha256,
    );
    launcherDescriptor = openSync(
      copy.path,
      constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
    );
    entryDescriptor = openSync(
      copy.path,
      constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
    );
    const launcherStats = fstatSync(launcherDescriptor, { bigint: true });
    const entryStats = fstatSync(entryDescriptor, { bigint: true });
    if (
      !sameIdentity(launcherStats, entryStats) ||
      launcherStats.nlink !== 1n ||
      (Number(launcherStats.mode) & 0o777) !== 0o400
    ) {
      fail("LAUNCHER_DESCRIPTOR_INVALID", "launcher descriptors differ");
    }
    return true;
  } finally {
    if (launcherDescriptor !== undefined) closeSync(launcherDescriptor);
    if (entryDescriptor !== undefined) closeSync(entryDescriptor);
    removePrivateLauncherCopy(copy);
  }
}

async function assertFreshNodeBinaryPin(nodeBinary, expectedSha256) {
  assertSha256(expectedSha256, "NODE_RUNTIME_INVALID");
  const binding = await hashStableFile(nodeBinary, {
    code: "NODE_RUNTIME_INVALID",
  });
  if (binding.sha256 !== expectedSha256) {
    fail("NODE_RUNTIME_CHANGED", "Node binary differs from fresh pin");
  }
}

function trustedChildEnvironment() {
  return Object.freeze({
    ...TRUSTED_COMPANION_BOOTSTRAP_CLEAN_ENVIRONMENT,
    SOURCE_REGISTRATION_TRUSTED_BOOTSTRAP_PID: String(process.pid),
    SOURCE_REGISTRATION_TRUSTED_LAUNCHER_FD: "3",
    SOURCE_REGISTRATION_TRUSTED_PUBLIC_PINS_FD: "4",
    SOURCE_REGISTRATION_TRUSTED_SECRET_INPUT_FD: "5",
  });
}

function buildSecretInput({ database, evidence, roots }) {
  const environment = {
    DATABASE_RESTORE_ADMIN_URL: database.adminDatabaseUrl,
    DATABASE_URL: database.sourceDatabaseUrl,
    LOGICAL_RESTORE_ACK: COMPANION_ACK,
    LOGICAL_RESTORE_COMPANION_RECEIPT_PATH: evidence.companionReceiptPath,
    LOGICAL_RESTORE_DUMP_PATH: evidence.dumpPath,
    LOGICAL_RESTORE_EXPECTED_DUMP_BYTES: String(evidence.dumpBytes),
    LOGICAL_RESTORE_EXPECTED_DUMP_SHA256: evidence.dumpSha256,
    LOGICAL_RESTORE_EXPECTED_METADATA_SHA256: evidence.metadataSha256,
    LOGICAL_RESTORE_EXPECTED_STRUCTURAL_COMPLETED_AT_UTC:
      evidence.structuralCompletedAtUtc,
    LOGICAL_RESTORE_EXPECTED_STRUCTURAL_RECEIPT_SHA256:
      evidence.structuralReceiptSha256,
    LOGICAL_RESTORE_METADATA_BINDING_PATH: evidence.metadataBindingPath,
    LOGICAL_RESTORE_METADATA_PATH: evidence.metadataPath,
    LOGICAL_RESTORE_PRIMARY_CORPUS_ROOT: roots.primaryCorpusRoot,
    LOGICAL_RESTORE_REHEARSAL_RECEIPT_PATH: evidence.rehearsalReceiptPath,
    LOGICAL_RESTORE_REPLICA_CORPUS_ROOT: roots.replicaCorpusRoot,
    LOGICAL_RESTORE_STRUCTURAL_RECEIPT_PATH: evidence.structuralReceiptPath,
  };
  exactStringMap(
    environment,
    ["DATABASE_URL", ...TRUSTED_COMPANION_SECRET_NAMES],
    "SECRET_INPUT_INVALID",
  );
  return Object.freeze(environment);
}

function validateRealCompanionCallback(text) {
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    fail("CHILD_PROTOCOL_INVALID", "controlled child callback differs");
  }
  if (
    !canonicalEqual(Object.keys(value), [
      "evidenceClass",
      "receiptSha256",
      "status",
    ]) ||
    value.evidenceClass !== "logical-comparison-surrogate" ||
    !SHA256_PATTERN.test(value.receiptSha256) ||
    value.status !== "pass" ||
    `${canonicalTrustedCompanionJson(value)}\n` !== text
  ) {
    fail("CHILD_PROTOCOL_INVALID", "controlled child callback differs");
  }
  return text;
}

function validateProbeCallback(text) {
  if (text !== TRUSTED_COMPANION_BOOTSTRAP_PROBE_CALLBACK) {
    fail("PROBE_PROTOCOL_INVALID", "bootstrap probe callback differs");
  }
  return text;
}

function resolveBootstrapConfiguration(configuration = {}) {
  const projectRoot = realpathSync(configuration.projectRoot ?? process.cwd());
  const nodeBinary = realpathSync(configuration.nodeBinary ?? process.execPath);
  return Object.freeze({
    documentsRoot: configuration.documentsRoot ?? join(homedir(), "Documents"),
    envLinkPath: configuration.envLinkPath ?? join(projectRoot, ".env"),
    nodeBinary,
    privateDataRoot:
      configuration.privateDataRoot ??
      join(homedir(), ".local", "share", "foodsystems"),
    projectRoot,
    temporaryRoot: configuration.temporaryRoot ?? "/tmp",
    volumesRoot: configuration.volumesRoot ?? "/Volumes",
  });
}

async function prepareBootstrap({
  arguments_,
  configuration,
  environment,
  execArgv,
}) {
  assertTrustedCompanionBootstrapEnvironment(environment, execArgv);
  const options = parseTrustedCompanionBootstrapArguments(arguments_);
  const config = resolveBootstrapConfiguration(configuration);
  const database = readStrictDatabaseEnvironmentTarget({
    envLinkPath: config.envLinkPath,
    projectRoot: config.projectRoot,
  });
  const results = await Promise.allSettled([
    Promise.resolve(
      discoverTrustedCompanionCorpusRoots({
        documentsRoot: config.documentsRoot,
        volumesRoot: config.volumesRoot,
      }),
    ),
    loadTrustedCompanionEvidence({
      backupBasename: options.backupBasename,
      outputBasename: options.outputBasename,
      privateDataRoot: config.privateDataRoot,
      sourceDatabaseName: database.sourceDatabaseName,
    }),
    computeFreshPublicPins({
      nodeBinary: config.nodeBinary,
      projectRoot: config.projectRoot,
      temporaryRoot: config.temporaryRoot,
    }),
  ]);
  const failed = results.find((result) => result.status === "rejected");
  if (failed?.status === "rejected") {
    throw safeBoundary(failed.reason);
  }
  const [rootsResult, evidenceResult, publicPinsResult] = results;
  if (
    rootsResult.status !== "fulfilled" ||
    evidenceResult.status !== "fulfilled" ||
    publicPinsResult.status !== "fulfilled"
  ) {
    fail("BOOTSTRAP_FAILED", "bootstrap preparation differs");
  }
  const roots = rootsResult.value;
  const evidence = evidenceResult.value;
  const publicPins = publicPinsResult.value;
  const secretInput = buildSecretInput({ database, evidence, roots });
  return Object.freeze({ config, options, publicPins, secretInput });
}

async function launchPreparedBootstrap(prepared, entrySourcePath, probe) {
  const entryCopy = createPrivateLauncherCopy({
    sourcePath: entrySourcePath,
    temporaryRoot: prepared.config.temporaryRoot,
  });
  let capabilities;
  let launcherDescriptor;
  try {
    const expectedLauncherSha256 =
      prepared.publicPins
        .LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_LAUNCHER_SHA256;
    if (!probe) {
      assertTrustedCompanionLauncherCopyPin(
        entryCopy.bytesSha256,
        expectedLauncherSha256,
      );
    }
    capabilities = createTrustedCapabilities({
      publicPins: prepared.publicPins,
      secretInput: prepared.secretInput,
      temporaryRoot: prepared.config.temporaryRoot,
    });
    launcherDescriptor = openSync(
      entryCopy.path,
      constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
    );
    const entryStats = lstatSync(entryCopy.path, { bigint: true });
    const launcherStats = fstatSync(launcherDescriptor, { bigint: true });
    if (
      !sameIdentity(launcherStats, entryStats) ||
      launcherStats.nlink !== 1n ||
      (Number(launcherStats.mode) & 0o777) !== 0o400
    ) {
      fail("LAUNCHER_DESCRIPTOR_INVALID", "launcher descriptors differ");
    }
    await assertFreshNodeBinaryPin(
      prepared.config.nodeBinary,
      prepared.publicPins
        .LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_BINARY_SHA256,
    );
    const result = await spawnBoundedNode({
      arguments_: [
        entryCopy.path,
        probe ? "--probe" : "--logical-restore-companion",
      ],
      cwd: prepared.config.projectRoot,
      environment: trustedChildEnvironment(),
      nodeBinary: prepared.config.nodeBinary,
      stdio: [
        "ignore",
        "pipe",
        "pipe",
        launcherDescriptor,
        capabilities.publicDescriptor,
        capabilities.secretDescriptor,
      ],
    });
    if (result.signal) {
      fail("CHILD_INTERRUPTED", "controlled child was interrupted");
    }
    const relayedDiagnostic = !probe
      ? classifyTrustedLauncherCompanionFailure(result)
      : null;
    if (relayedDiagnostic) {
      fail(relayedDiagnostic, "controlled companion failed safely");
    }
    if (result.code !== 0 || result.overflow || result.stderr !== "") {
      fail(
        probe ? "PROBE_REFUSED" : "COMPANION_REFUSED",
        "controlled child refused",
      );
    }
    return probe
      ? validateProbeCallback(result.stdout)
      : validateRealCompanionCallback(result.stdout);
  } finally {
    if (launcherDescriptor !== undefined) closeSync(launcherDescriptor);
    closeCapabilities(capabilities);
    removePrivateLauncherCopy(entryCopy);
  }
}

/**
 * @typedef {object} TrustedCompanionBootstrapConfiguration
 * @property {string} [documentsRoot]
 * @property {string} [envLinkPath]
 * @property {string} [nodeBinary]
 * @property {string} [privateDataRoot]
 * @property {string} [projectRoot]
 * @property {string} [temporaryRoot]
 * @property {string} [volumesRoot]
 */

/**
 * @param {{
 *   arguments_?: string[],
 *   configuration?: TrustedCompanionBootstrapConfiguration,
 *   environment?: NodeJS.ProcessEnv,
 *   execArgv?: string[],
 * }} [options]
 */
export async function runTrustedLogicalRestoreCompanionBootstrap({
  arguments_ = process.argv.slice(2),
  configuration,
  environment = process.env,
  execArgv = process.execArgv,
} = {}) {
  const prepared = await prepareBootstrap({
    arguments_,
    configuration,
    environment,
    execArgv,
  });
  if (prepared.options.preflight) {
    const capabilities = createTrustedCapabilities({
      publicPins: prepared.publicPins,
      secretInput: prepared.secretInput,
      temporaryRoot: prepared.config.temporaryRoot,
    });
    try {
      await assertFreshNodeBinaryPin(
        prepared.config.nodeBinary,
        prepared.publicPins
          .LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_BINARY_SHA256,
      );
      verifyPrivateLauncherDescriptorPair({
        expectedLauncherSha256:
          prepared.publicPins
            .LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_LAUNCHER_SHA256,
        sourcePath: join(prepared.config.projectRoot, LAUNCHER_RELATIVE_PATH),
        temporaryRoot: prepared.config.temporaryRoot,
      });
    } finally {
      closeCapabilities(capabilities);
    }
    return TRUSTED_COMPANION_BOOTSTRAP_PREFLIGHT_CALLBACK;
  }
  return launchPreparedBootstrap(
    prepared,
    join(prepared.config.projectRoot, LAUNCHER_RELATIVE_PATH),
    false,
  );
}

/**
 * @param {{
 *   arguments_: string[],
 *   configuration?: TrustedCompanionBootstrapConfiguration,
 *   environment?: NodeJS.ProcessEnv,
 *   execArgv?: string[],
 *   probeEntryPath: string,
 * }} options
 */
export async function runTrustedLogicalRestoreCompanionBootstrapProbe({
  arguments_,
  configuration,
  environment = trustedCompanionBootstrapObservedCleanEnvironment(),
  execArgv = [],
  probeEntryPath,
}) {
  if (
    typeof probeEntryPath !== "string" ||
    !isAbsolute(probeEntryPath) ||
    /[\0\r\n]/.test(probeEntryPath)
  ) {
    fail("PROBE_ENTRY_INVALID", "bootstrap probe entry differs");
  }
  const prepared = await prepareBootstrap({
    arguments_,
    configuration,
    environment,
    execArgv,
  });
  if (prepared.options.preflight) {
    fail("PROBE_ARGUMENTS_INVALID", "probe cannot use preflight mode");
  }
  return launchPreparedBootstrap(prepared, realpathSync(probeEntryPath), true);
}

function writeBootstrapDiagnostic(error) {
  const safe = safeBoundary(error);
  const code = /^[A-Z0-9_]+$/.test(safe.code) ? safe.code : "BOOTSTRAP_FAILED";
  process.stderr.write(`[${BOOTSTRAP_DIAGNOSTIC_PREFIX}] ERROR ${code}\n`);
}

async function main() {
  const callback = await runTrustedLogicalRestoreCompanionBootstrap();
  process.stdout.write(callback);
}

let invoked = null;
try {
  invoked = process.argv[1]
    ? pathToFileURL(realpathSync(process.argv[1])).href
    : null;
} catch (error) {
  writeBootstrapDiagnostic(safeBoundary(error, "BOOTSTRAP_ENTRY_INVALID"));
  process.exitCode = 1;
}
if (invoked === import.meta.url) {
  main().catch((error) => {
    writeBootstrapDiagnostic(error);
    process.exitCode = 1;
  });
}
