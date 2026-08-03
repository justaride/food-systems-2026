#!/usr/bin/env node

import { spawn } from "node:child_process";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import {
  closeSync,
  constants,
  createReadStream,
  fchmodSync,
  fstatSync,
  fsyncSync,
  linkSync,
  lstatSync,
  openSync,
  readFileSync,
  realpathSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { pipeline } from "node:stream/promises";
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

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  computeDatabaseLogicalStateDigest,
  resolveExecutable,
} from "./database-logical-state-digest.mjs";
import {
  LOGICAL_RESTORE_COMPANION_CANONICAL_JSON,
  LOGICAL_RESTORE_COMPANION_CLEANUP_POLICY,
  LOGICAL_RESTORE_COMPANION_CLONE_CLASS,
  LOGICAL_RESTORE_COMPANION_CLONE_LABEL,
  LOGICAL_RESTORE_COMPANION_EVIDENCE_CLASS,
  LOGICAL_RESTORE_COMPANION_LIMITATION,
  LOGICAL_RESTORE_COMPANION_OWNERSHIP_CLASS,
  LOGICAL_RESTORE_COMPANION_RECEIPT_FORMAT,
  LOGICAL_RESTORE_COMPANION_RECEIPT_VERSION,
  LOGICAL_RESTORE_COMPANION_SCOPE,
  LOGICAL_RESTORE_COMPANION_SEMANTIC,
  LOGICAL_RESTORE_REHEARSAL_ARTIFACT_TYPE,
  LOGICAL_RESTORE_REHEARSAL_PLAN_FILE_SHA256,
  LOGICAL_RESTORE_REHEARSAL_PLAN_SHA256,
  LOGICAL_RESTORE_REHEARSAL_SCHEMA_VERSION,
  LOGICAL_RESTORE_REHEARSAL_TARGET_CLASS,
  LOGICAL_RESTORE_REHEARSAL_TARGET_SET_SHA256,
  canonicalLogicalRestoreCompanionJson,
  logicalRestoreCompanionSha256,
  logicalRestoreRehearsalOperationKey,
  sealLogicalRestoreComparisonProof,
  validateLogicalRestoreCompanionReceipt,
} from "./logical-restore-companion-receipt.mjs";
import {
  PSQL_RUNTIME_CLOSURE_MANIFEST_PATH,
  PSQL_RUNTIME_CLOSURE_MANIFEST_SHA256,
  PSQL_RUNTIME_CLOSURE_SHA256,
  verifyPsqlRuntimeClosure,
} from "./verify-psql-runtime-closure.mjs";

export const CONTROLLED_LOGICAL_RESTORE_ACK =
  "I_HAVE_VERIFIED_LOGICAL_RESTORE_CLONE_IS_DISPOSABLE";
export const CONTROLLED_LOGICAL_RESTORE_CLONE_PREFIX =
  "foodsystems_restore_logical_";
export const CONTROLLED_LOGICAL_RESTORE_NAME_DOMAIN =
  "food-systems-2026:logical-restore-clone-name:v1\0";
export const CONTROLLED_LOGICAL_RESTORE_OWNERSHIP_DOMAIN =
  "food-systems-2026:logical-restore-clone-ownership:v1\0";
const CONTROLLED_LOGICAL_RESTORE_OWNERSHIP_COMMENT_PREFIX =
  "foodsystems-logical-restore-companion-owner-v1:";
const OWNERSHIP_TOKEN_PATTERN = /^[a-f0-9]{64}$/;

export function controlledLogicalRestoreSignalExitCode(signal) {
  if (signal === "SIGINT") return 130;
  if (signal === "SIGTERM") return 143;
  fail("SIGNAL_INVALID", "unsupported handled signal");
}

const MODULE_PATH = realpathSync(fileURLToPath(import.meta.url));
const PROJECT_ROOT = realpathSync(resolve(dirname(MODULE_PATH), "../.."));
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_UTC_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const SAFE_DATABASE_NAME = /^foodsystems_restore_[a-z0-9_]+$/;
const MAX_JSON_BYTES = 16 * 1024 * 1024;
const MAX_COMMAND_OUTPUT_BYTES = 16 * 1024 * 1024;
const MAX_REHEARSAL_RECEIPT_AGE_MS = 24 * 60 * 60 * 1000;
const MAX_REHEARSAL_DURATION_MS = 15 * 60 * 1000;
const MAX_FUTURE_SKEW_MS = 5 * 60 * 1000;
const SOURCE_REGISTRATION_BATCH_PATH =
  "knowledge/corpus/source-registration/source-registration-batch-2026-08-02.v1.json";
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
const REQUIRED_ARCHIVE_RELATIONS = Object.freeze([
  "ControlledMutationAudit",
  "DatabaseIdentity",
  "Document",
  "EvidenceAppraisal",
  "SourceCitation",
  "_prisma_migrations",
]);

const PROJECT_BINDING_PATHS = Object.freeze({
  backupContractHelper: "scripts/database-backup-contract.mjs",
  backupVerifier: "scripts/verify-database-backup.sh",
  companionReceiptSchema:
    "knowledge/schema/database-logical-restore-companion-receipt.schema.v1.json",
  companionReceiptValidator:
    "scripts/knowledge/logical-restore-companion-receipt.mjs",
  companionRunner:
    "scripts/knowledge/run-controlled-logical-restore-companion.mjs",
  databaseLogicalDigest: "scripts/knowledge/database-logical-state-digest.mjs",
  psqlRuntimeManifest: PSQL_RUNTIME_CLOSURE_MANIFEST_PATH,
  psqlRuntimeVerifier: "scripts/knowledge/verify-psql-runtime-closure.mjs",
  sourceRegistrationApplyRuntime:
    "src/lib/knowledge/source-registration-apply.ts",
  sourceRegistrationApplyRunner:
    "scripts/knowledge/apply-source-registration-plan.ts",
  sourceRegistrationLauncher:
    "scripts/knowledge/launch-locked-source-registration-apply.mjs",
  sourceRegistrationLogicalCloneRehearsalRuntime:
    "src/lib/knowledge/source-registration-logical-clone-rehearsal.ts",
  sourceRegistrationLogicalCloneRehearsalSchema:
    "knowledge/schema/source-registration-logical-clone-rehearsal-receipt.schema.v1.json",
  sourceRegistrationLogicalCloneRehearsalTest:
    "tests/lib/source-registration-logical-clone-rehearsal.test.ts",
  sourceRegistrationLogicalCloneRehearsalCommandRunner:
    "scripts/knowledge/run-source-registration-logical-clone-rehearsal.ts",
  structuralRestoreRunner: "scripts/restore-database-backup-drill.sh",
});

class ControlledLogicalRestoreError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "ControlledLogicalRestoreError";
    this.code = code;
  }
}

function fail(code, message) {
  throw new ControlledLogicalRestoreError(code, message);
}

function safeFailure(error, code, message) {
  if (error instanceof ControlledLogicalRestoreError) return error;
  return new ControlledLogicalRestoreError(code, message);
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function exactObject(value, keys, label) {
  if (!isPlainObject(value)) fail("EVIDENCE_SHAPE", `${label} is invalid`);
  if (
    JSON.stringify(Object.keys(value).sort()) !==
    JSON.stringify([...keys].sort())
  ) {
    fail("EVIDENCE_SHAPE", `${label} has an unexpected shape`);
  }
  return value;
}

function sha256(value, label) {
  if (typeof value !== "string" || !SHA256_PATTERN.test(value)) {
    fail("EVIDENCE_HASH", `${label} is not SHA-256`);
  }
  return value;
}

function nonNegativeInteger(value, label, { positive = false } = {}) {
  if (!Number.isSafeInteger(value) || value < 0 || (positive && value === 0)) {
    fail("EVIDENCE_COUNT", `${label} is invalid`);
  }
  return value;
}

function timestamp(value, label) {
  if (typeof value !== "string" || !ISO_UTC_PATTERN.test(value)) {
    fail("EVIDENCE_TIME", `${label} is invalid`);
  }
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed) || new Date(parsed).toISOString() !== value) {
    fail("EVIDENCE_TIME", `${label} is invalid`);
  }
  return parsed;
}

function canonicalEqual(left, right) {
  return (
    canonicalLogicalRestoreCompanionJson(left) ===
    canonicalLogicalRestoreCompanionJson(right)
  );
}

function requireCanonicalJson(bytes, label) {
  let value;
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    fail("EVIDENCE_UTF8", `${label} is not valid UTF-8`);
  }
  try {
    value = JSON.parse(text);
  } catch {
    fail("EVIDENCE_JSON", `${label} is not JSON`);
  }
  if (`${canonicalLogicalRestoreCompanionJson(value)}\n` !== text) {
    fail("EVIDENCE_CANONICAL", `${label} is not canonical JSON`);
  }
  return value;
}

function assertPathAndCredentialFree(value, label) {
  const serialized = JSON.stringify(value);
  if (
    [
      /postgres(?:ql)?:\/\//i,
      /(?:^|["'])\/(?:Users|Volumes|private|tmp|var|home|opt|usr|etc)\//i,
      /[A-Za-z]:\\/,
      /\\\\/,
      /(?:password|passwd|pgpass|credential|database_url|databaseurl)/i,
      /(?:access[_-]?token|secret[_-]?key|private[_-]?key)/i,
    ].some((pattern) => pattern.test(serialized))
  ) {
    fail("EVIDENCE_DISCLOSURE", `${label} contains private material`);
  }
}

function assertOutsideProject(path, label) {
  const relationship = relative(PROJECT_ROOT, path);
  if (
    relationship === "" ||
    (!relationship.startsWith(`..${sep}`) && relationship !== "..")
  ) {
    fail("PRIVATE_PATH_SCOPE", `${label} must be outside the project`);
  }
}

function assertAbsolutePathValue(path, label) {
  if (typeof path !== "string" || !isAbsolute(path) || /[\0\r\n]/.test(path)) {
    fail("PRIVATE_PATH_INVALID", `${label} must be an absolute private path`);
  }
}

function privateFileIdentity(path, label) {
  assertAbsolutePathValue(path, label);
  let stats;
  let resolved;
  try {
    stats = lstatSync(path, { bigint: true });
    resolved = realpathSync(path);
  } catch {
    fail("PRIVATE_FILE_UNREADABLE", `${label} is missing or unreadable`);
  }
  if (
    resolved !== path ||
    !stats.isFile() ||
    stats.isSymbolicLink() ||
    stats.nlink !== 1n ||
    (Number(stats.mode) & 0o077) !== 0
  ) {
    fail("PRIVATE_FILE_INVALID", `${label} is not a canonical private file`);
  }
  assertOutsideProject(resolved, label);
  return {
    dev: stats.dev,
    ino: stats.ino,
    mode: stats.mode,
    mtimeNs: stats.mtimeNs,
    path: resolved,
    size: stats.size,
  };
}

function sameFileIdentity(left, right) {
  return (
    left.dev === right.dev &&
    left.ino === right.ino &&
    left.mode === right.mode &&
    left.mtimeNs === right.mtimeNs &&
    left.size === right.size
  );
}

function readStablePrivateFile(path, label) {
  const expected = privateFileIdentity(path, label);
  if (expected.size > BigInt(MAX_JSON_BYTES)) {
    fail(
      "PRIVATE_FILE_TOO_LARGE",
      `${label} exceeds the controlled size limit`,
    );
  }
  let descriptor;
  try {
    descriptor = openSync(
      expected.path,
      constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
    );
    const before = fstatSync(descriptor, { bigint: true });
    if (!sameFileIdentity(expected, before)) {
      fail("PRIVATE_FILE_CHANGED", `${label} changed before it was read`);
    }
    const bytes = readFileSync(descriptor);
    const after = fstatSync(descriptor, { bigint: true });
    if (
      !sameFileIdentity(expected, after) ||
      BigInt(bytes.length) !== expected.size
    ) {
      fail("PRIVATE_FILE_CHANGED", `${label} changed while it was read`);
    }
    return { bytes, identity: expected };
  } catch (error) {
    throw safeFailure(
      error,
      "PRIVATE_FILE_READ_FAILED",
      `${label} could not be read safely`,
    );
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
  }
}

async function hashStableFile(path, label, { privateFile = false } = {}) {
  const expected = privateFile
    ? privateFileIdentity(path, label)
    : (() => {
        let resolved;
        let stats;
        try {
          resolved = realpathSync(path);
          stats = lstatSync(resolved, { bigint: true });
        } catch {
          fail("TOOL_FILE_UNREADABLE", `${label} is missing or unreadable`);
        }
        if (
          resolved !== path ||
          !stats.isFile() ||
          stats.isSymbolicLink() ||
          stats.nlink !== 1n
        ) {
          fail("TOOL_FILE_INVALID", `${label} is not a canonical regular file`);
        }
        return {
          dev: stats.dev,
          ino: stats.ino,
          mode: stats.mode,
          mtimeNs: stats.mtimeNs,
          path: resolved,
          size: stats.size,
        };
      })();
  let descriptor;
  try {
    descriptor = openSync(
      expected.path,
      constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
    );
    const before = fstatSync(descriptor, { bigint: true });
    if (!sameFileIdentity(expected, before)) {
      fail("FILE_CHANGED", `${label} changed before hashing`);
    }
    const hash = createHash("sha256");
    let bytes = 0n;
    const stream = createReadStream(expected.path, {
      autoClose: false,
      fd: descriptor,
      start: 0,
    });
    for await (const chunk of stream) {
      hash.update(chunk);
      bytes += BigInt(chunk.length);
    }
    const after = fstatSync(descriptor, { bigint: true });
    if (!sameFileIdentity(expected, after) || bytes !== expected.size) {
      fail("FILE_CHANGED", `${label} changed while hashing`);
    }
    return {
      bytes: Number(bytes),
      identity: expected,
      sha256: hash.digest("hex"),
    };
  } catch (error) {
    throw safeFailure(
      error,
      "FILE_HASH_FAILED",
      `${label} could not be hashed safely`,
    );
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
  }
}

function validatePrivateOutputPath(path, label = "companion receipt output") {
  assertAbsolutePathValue(path, label);
  let targetStats;
  try {
    targetStats = lstatSync(path, { bigint: true });
  } catch (error) {
    if (!error || error.code !== "ENOENT") {
      fail("RECEIPT_TARGET", `${label} could not be checked safely`);
    }
  }
  if (targetStats) {
    fail("RECEIPT_EXISTS", `${label} already exists`);
  }
  const parent = dirname(path);
  let parentResolved;
  let parentStats;
  try {
    parentResolved = realpathSync(parent);
    parentStats = lstatSync(parentResolved, { bigint: true });
  } catch {
    fail("RECEIPT_PARENT", `${label} parent is missing or unreadable`);
  }
  if (
    parentResolved !== parent ||
    !parentStats.isDirectory() ||
    parentStats.isSymbolicLink() ||
    (Number(parentStats.mode) & 0o777) !== 0o700
  ) {
    fail(
      "RECEIPT_PARENT",
      `${label} parent is not canonical mode-0700 private storage`,
    );
  }
  assertOutsideProject(parentResolved, label);
  if (!basename(path) || basename(path) !== basename(path.trim())) {
    fail("RECEIPT_NAME", `${label} name is invalid`);
  }
  return {
    parent: parentResolved,
    parentIdentity: {
      dev: parentStats.dev,
      ino: parentStats.ino,
      mode: parentStats.mode,
    },
    path,
  };
}

function sameDirectoryIdentity(expected, actual) {
  return (
    actual.isDirectory() &&
    !actual.isSymbolicLink() &&
    expected.dev === actual.dev &&
    expected.ino === actual.ino &&
    expected.mode === actual.mode &&
    (Number(actual.mode) & 0o777) === 0o700
  );
}

function sameCreatedFileIdentity(expected, actual) {
  return expected.dev === actual.dev && expected.ino === actual.ino;
}

function assertPrivateOutputParentStable(storage, parentDescriptor, label) {
  let pathStats;
  let descriptorStats;
  let resolved;
  try {
    resolved = realpathSync(storage.parent);
    pathStats = lstatSync(storage.parent, { bigint: true });
    descriptorStats = fstatSync(parentDescriptor, { bigint: true });
  } catch {
    fail("RECEIPT_PARENT_DRIFT", `${label} parent changed`);
  }
  if (
    resolved !== storage.parent ||
    !sameDirectoryIdentity(storage.parentIdentity, pathStats) ||
    !sameDirectoryIdentity(storage.parentIdentity, descriptorStats)
  ) {
    fail("RECEIPT_PARENT_DRIFT", `${label} parent changed`);
  }
}

function assertTargetAbsentForPublication(path, label) {
  try {
    lstatSync(path, { bigint: true });
  } catch (error) {
    if (error && error.code === "ENOENT") return;
    fail("RECEIPT_TARGET", `${label} target could not be checked safely`);
  }
  fail("RECEIPT_EXISTS", `${label} already exists`);
}

function unlinkOnlyIfOwned(path, expectedIdentity) {
  if (!expectedIdentity) return false;
  try {
    const current = lstatSync(path, { bigint: true });
    if (!sameFileIdentity(expectedIdentity, current)) return false;
    unlinkSync(path);
    return true;
  } catch {
    return false;
  }
}

export function publishAtomicPrivateCanonicalJson(
  path,
  value,
  { label, validate },
) {
  const storage = validatePrivateOutputPath(path, label);
  validate(value);
  const bytes = `${canonicalLogicalRestoreCompanionJson(value)}\n`;
  const temporary = join(
    dirname(path),
    `.${basename(path)}.${process.pid}.${randomUUID()}.tmp`,
  );
  let descriptor;
  let parentDescriptor;
  let createdIdentity;
  try {
    parentDescriptor = openSync(
      storage.parent,
      constants.O_RDONLY |
        (constants.O_DIRECTORY ?? 0) |
        (constants.O_NOFOLLOW ?? 0),
    );
    assertPrivateOutputParentStable(storage, parentDescriptor, label);
    descriptor = openSync(
      temporary,
      constants.O_WRONLY |
        constants.O_CREAT |
        constants.O_EXCL |
        (constants.O_NOFOLLOW ?? 0),
      0o600,
    );
    const opened = fstatSync(descriptor, { bigint: true });
    if (!opened.isFile() || opened.isSymbolicLink() || opened.nlink !== 1n) {
      fail("RECEIPT_PUBLICATION", `${label} staging file is unsafe`);
    }
    createdIdentity = {
      dev: opened.dev,
      ino: opened.ino,
      mode: opened.mode,
      mtimeNs: opened.mtimeNs,
      size: opened.size,
    };
    writeFileSync(descriptor, bytes, { encoding: "utf8" });
    fchmodSync(descriptor, 0o400);
    fsyncSync(descriptor);
    const staged = fstatSync(descriptor, { bigint: true });
    if (
      !sameCreatedFileIdentity(createdIdentity, staged) ||
      staged.nlink !== 1n ||
      (Number(staged.mode) & 0o777) !== 0o400 ||
      staged.size !== BigInt(Buffer.byteLength(bytes, "utf8"))
    ) {
      fail("RECEIPT_PUBLICATION", `${label} staging identity changed`);
    }
    createdIdentity = {
      dev: staged.dev,
      ino: staged.ino,
      mode: staged.mode,
      mtimeNs: staged.mtimeNs,
      size: staged.size,
    };
    assertPrivateOutputParentStable(storage, parentDescriptor, label);
    assertTargetAbsentForPublication(path, label);
    linkSync(temporary, path);
    const afterLinkDescriptor = fstatSync(descriptor, { bigint: true });
    const linkedTemporary = lstatSync(temporary, { bigint: true });
    const linkedTarget = lstatSync(path, { bigint: true });
    if (
      !sameCreatedFileIdentity(createdIdentity, afterLinkDescriptor) ||
      !sameCreatedFileIdentity(createdIdentity, linkedTemporary) ||
      !sameCreatedFileIdentity(createdIdentity, linkedTarget) ||
      afterLinkDescriptor.nlink !== 2n ||
      linkedTemporary.nlink !== 2n ||
      linkedTarget.nlink !== 2n ||
      (Number(linkedTarget.mode) & 0o777) !== 0o400
    ) {
      fail("RECEIPT_PUBLICATION", `${label} hard-link identity differs`);
    }
    unlinkSync(temporary);
    const publishedDescriptor = fstatSync(descriptor, { bigint: true });
    const published = lstatSync(path, { bigint: true });
    if (
      !sameCreatedFileIdentity(createdIdentity, publishedDescriptor) ||
      !sameCreatedFileIdentity(createdIdentity, published) ||
      publishedDescriptor.nlink !== 1n ||
      published.nlink !== 1n ||
      (Number(published.mode) & 0o777) !== 0o400
    ) {
      fail(
        "RECEIPT_PUBLICATION",
        `published ${label} is not exact, single-link, and mode 0400`,
      );
    }
    assertPrivateOutputParentStable(storage, parentDescriptor, label);
    fsyncSync(parentDescriptor);
    const readBack = readStablePrivateFile(path, `published ${label}`);
    if (
      !sameCreatedFileIdentity(createdIdentity, readBack.identity) ||
      (Number(readBack.identity.mode) & 0o777) !== 0o400 ||
      !readBack.bytes.equals(Buffer.from(bytes, "utf8"))
    ) {
      fail("RECEIPT_PUBLICATION", `published ${label} bytes differ`);
    }
    const parsed = requireCanonicalJson(readBack.bytes, `published ${label}`);
    validate(parsed);
    assertPrivateOutputParentStable(storage, parentDescriptor, label);
    fsyncSync(parentDescriptor);
    return {
      bytes,
      receipt: parsed,
      receiptSha256: logicalRestoreCompanionSha256(readBack.bytes),
    };
  } catch (error) {
    if (descriptor !== undefined && createdIdentity) {
      try {
        const currentOwned = fstatSync(descriptor, { bigint: true });
        if (sameCreatedFileIdentity(createdIdentity, currentOwned)) {
          createdIdentity = {
            dev: currentOwned.dev,
            ino: currentOwned.ino,
            mode: currentOwned.mode,
            mtimeNs: currentOwned.mtimeNs,
            size: currentOwned.size,
          };
        }
      } catch {
        // Cleanup below only unlinks paths that still match known owned bytes.
      }
    }
    const removedTarget = unlinkOnlyIfOwned(path, createdIdentity);
    const removedTemporary = unlinkOnlyIfOwned(temporary, createdIdentity);
    if ((removedTarget || removedTemporary) && parentDescriptor !== undefined) {
      try {
        fsyncSync(parentDescriptor);
      } catch {
        // Publication still fails closed; no replacement path is removed.
      }
    }
    throw safeFailure(
      error,
      "RECEIPT_PUBLICATION",
      `${label} could not be published atomically`,
    );
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
    unlinkOnlyIfOwned(temporary, createdIdentity);
    if (parentDescriptor !== undefined) closeSync(parentDescriptor);
  }
}

function publishAtomicPrivateCanonicalReceipt(path, receipt) {
  return publishAtomicPrivateCanonicalJson(path, receipt, {
    label: "companion receipt output",
    validate: (value) => validateLogicalRestoreCompanionReceipt(value),
  });
}

function validateCoreCounts(value, label) {
  const counts = exactObject(value, CORE_COUNT_KEYS, label);
  for (const key of CORE_COUNT_KEYS) {
    nonNegativeInteger(counts[key], `${label}.${key}`);
  }
  if (counts.DatabaseIdentity !== 1) {
    fail("EVIDENCE_COUNT", `${label}.DatabaseIdentity must be one`);
  }
  return counts;
}

function validateBackupMetadata(value) {
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
    "backup metadata",
  );
  if (
    metadata.format !== "foodsystems-database-backup-metadata" ||
    metadata.version !== 2
  ) {
    fail("METADATA_VERSION", "backup metadata is not version 2");
  }
  timestamp(metadata.createdAtUtc, "backup metadata creation time");
  const source = exactObject(
    metadata.source,
    ["databaseName", "serverVersion"],
    "backup metadata source",
  );
  if (
    typeof source.databaseName !== "string" ||
    !/^[a-zA-Z0-9_.:@-]+$/.test(source.databaseName) ||
    typeof source.serverVersion !== "string" ||
    /[\0\r\n]/.test(source.serverVersion)
  ) {
    fail("METADATA_SOURCE", "backup metadata source is invalid");
  }
  const dump = exactObject(
    metadata.dump,
    ["archiveFormat", "bytes", "fileName", "sha256"],
    "backup metadata dump",
  );
  if (
    dump.archiveFormat !== "postgresql-custom" ||
    typeof dump.fileName !== "string" ||
    basename(dump.fileName) !== dump.fileName
  ) {
    fail("METADATA_DUMP", "backup metadata dump declaration is invalid");
  }
  nonNegativeInteger(dump.bytes, "backup metadata dump bytes", {
    positive: true,
  });
  sha256(dump.sha256, "backup metadata dump SHA-256");
  const identity = exactObject(
    metadata.databaseIdentity,
    ["key", "uuid"],
    "backup metadata database identity",
  );
  if (identity.key !== "primary" || !UUID_PATTERN.test(identity.uuid)) {
    fail("METADATA_IDENTITY", "backup metadata database identity is invalid");
  }
  const ledger = exactObject(
    metadata.completedPrismaMigrationLedger,
    ["completedCount", "sha256"],
    "backup metadata migration ledger",
  );
  nonNegativeInteger(ledger.completedCount, "backup metadata migration count", {
    positive: true,
  });
  sha256(ledger.sha256, "backup metadata migration SHA-256");
  const coreCounts = validateCoreCounts(
    metadata.coreCounts,
    "backup metadata core counts",
  );
  const fingerprint = exactObject(
    metadata.targetDatabaseFingerprint,
    ["canonicalJsonFormat", "sha256"],
    "backup metadata target fingerprint",
  );
  if (fingerprint.canonicalJsonFormat !== "sorted-keys-v1") {
    fail(
      "METADATA_FINGERPRINT",
      "backup metadata fingerprint format is invalid",
    );
  }
  sha256(fingerprint.sha256, "backup metadata target fingerprint SHA-256");
  const recomputedFingerprint = logicalRestoreCompanionSha256(
    canonicalLogicalRestoreCompanionJson({
      completedPrismaMigrationLedger: ledger,
      coreCounts,
      databaseIdentity: identity,
    }),
  );
  if (recomputedFingerprint !== fingerprint.sha256) {
    fail("METADATA_FINGERPRINT", "backup metadata target fingerprint differs");
  }
  return metadata;
}

function validateStructuralRestoreReceipt(value, metadata) {
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
    "structural restore receipt",
  );
  if (
    receipt.format !== "foodsystems-database-restore-receipt" ||
    receipt.version !== 1
  ) {
    fail(
      "STRUCTURAL_RECEIPT_VERSION",
      "structural restore receipt is not version 1",
    );
  }
  const completedAt = timestamp(
    receipt.completedAtUtc,
    "structural restore completion time",
  );
  if (completedAt < Date.parse(metadata.createdAtUtc)) {
    fail("STRUCTURAL_RECEIPT_TIME", "structural restore predates its backup");
  }
  const backup = exactObject(
    receipt.backup,
    ["dumpBytes", "dumpSha256", "metadataSha256"],
    "structural restore backup",
  );
  nonNegativeInteger(backup.dumpBytes, "structural restore dump bytes", {
    positive: true,
  });
  sha256(backup.dumpSha256, "structural restore dump SHA-256");
  sha256(backup.metadataSha256, "structural restore metadata SHA-256");
  if (
    backup.dumpBytes !== metadata.dump.bytes ||
    backup.dumpSha256 !== metadata.dump.sha256
  ) {
    fail(
      "STRUCTURAL_RECEIPT_BINDING",
      "structural restore dump binding differs",
    );
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
    fail(
      "STRUCTURAL_RECEIPT_BINDING",
      "structural restore metadata binding differs",
    );
  }
  const checks = exactObject(
    receipt.checks,
    [
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
    ],
    "structural restore checks",
  );
  for (const key of [
    "archiveChecksumAndCatalog",
    "completedMigrationLedger",
    "constraintsValidated",
    "databaseIdentity",
    "exactCoreCounts",
    "indexesReady",
    "metadataV2Binding",
    "requiredRelationsAndNonEmptyData",
    "restoreCompleted",
    "targetDatabaseFingerprint",
  ]) {
    if (checks[key] !== "pass") {
      fail(
        "STRUCTURAL_RECEIPT_CHECK",
        "a structural restore check did not pass",
      );
    }
  }
  const optionalCounts = exactObject(
    checks.optionalOperatorExpectedCounts,
    ["status", "supplied"],
    "structural restore optional counts",
  );
  if (
    optionalCounts.status !== "pass" ||
    !isPlainObject(optionalCounts.supplied)
  ) {
    fail(
      "STRUCTURAL_RECEIPT_CHECK",
      "structural restore optional counts are invalid",
    );
  }
  for (const [key, count] of Object.entries(optionalCounts.supplied)) {
    if (!CORE_COUNT_KEYS.includes(key)) {
      fail(
        "STRUCTURAL_RECEIPT_CHECK",
        "structural restore optional count is unknown",
      );
    }
    nonNegativeInteger(count, "structural restore optional count");
    if (metadata.coreCounts[key] !== count) {
      fail(
        "STRUCTURAL_RECEIPT_CHECK",
        "structural restore optional count differs",
      );
    }
  }
  const cleanup = exactObject(
    receipt.cleanup,
    ["databaseAbsenceConfirmed", "databaseName", "drop"],
    "structural restore cleanup",
  );
  if (
    cleanup.drop !== "pass" ||
    cleanup.databaseAbsenceConfirmed !== true ||
    typeof cleanup.databaseName !== "string" ||
    !SAFE_DATABASE_NAME.test(cleanup.databaseName)
  ) {
    fail("STRUCTURAL_RECEIPT_CLEANUP", "structural restore cleanup is invalid");
  }
  return receipt;
}

async function loadAndVerifyBackupEvidence(paths) {
  const metadataRead = readStablePrivateFile(
    paths.metadataPath,
    "backup metadata",
  );
  const metadata = validateBackupMetadata(
    requireCanonicalJson(metadataRead.bytes, "backup metadata"),
  );
  const metadataSha256 = logicalRestoreCompanionSha256(metadataRead.bytes);
  const metadataBindingRead = readStablePrivateFile(
    paths.metadataBindingPath,
    "backup metadata binding",
  );
  if (metadataBindingRead.bytes.toString("utf8") !== `${metadataSha256}\n`) {
    fail("METADATA_BINDING", "backup metadata binding differs");
  }
  const dump = await hashStableFile(paths.dumpPath, "backup dump", {
    privateFile: true,
  });
  if (
    dump.bytes !== metadata.dump.bytes ||
    dump.sha256 !== metadata.dump.sha256
  ) {
    fail("DUMP_BINDING", "backup dump bytes differ from metadata");
  }
  const structuralRead = readStablePrivateFile(
    paths.structuralReceiptPath,
    "structural restore receipt",
  );
  const structuralReceipt = validateStructuralRestoreReceipt(
    requireCanonicalJson(structuralRead.bytes, "structural restore receipt"),
    metadata,
  );
  if (structuralReceipt.backup.metadataSha256 !== metadataSha256) {
    fail(
      "STRUCTURAL_RECEIPT_BINDING",
      "structural restore metadata hash differs",
    );
  }
  return {
    backup: {
      dumpBytes: dump.bytes,
      dumpSha256: dump.sha256,
      metadataCreatedAtUtc: metadata.createdAtUtc,
      metadataFormat: metadata.format,
      metadataSha256,
      metadataVersion: metadata.version,
      targetDatabaseFingerprintSha256:
        metadata.targetDatabaseFingerprint.sha256,
    },
    dumpIdentity: dump.identity,
    metadata,
    structuralRestore: {
      completedAtUtc: structuralReceipt.completedAtUtc,
      receiptFormat: structuralReceipt.format,
      receiptSha256: logicalRestoreCompanionSha256(structuralRead.bytes),
      receiptVersion: structuralReceipt.version,
    },
  };
}

function resolveCanonicalExecutable(name) {
  const resolved = resolveExecutable(name);
  const stats = lstatSync(resolved);
  if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) {
    fail(
      "EXECUTABLE_INVALID",
      `${name} is not a canonical single-link executable`,
    );
  }
  return resolved;
}

async function loadToolBindings() {
  const projectFacts = {};
  for (const [key, relativePath] of Object.entries(PROJECT_BINDING_PATHS)) {
    const path = realpathSync(join(PROJECT_ROOT, relativePath));
    projectFacts[key] = await hashStableFile(path, `${key} tool`);
  }
  const psqlPath = resolveCanonicalExecutable("psql");
  const pgRestorePath = resolveCanonicalExecutable("pg_restore");
  const createdbPath = resolveCanonicalExecutable("createdb");
  const dropdbPath = resolveCanonicalExecutable("dropdb");
  if (
    new Set(
      [psqlPath, pgRestorePath, createdbPath, dropdbPath].map((path) =>
        dirname(path),
      ),
    ).size !== 1
  ) {
    fail(
      "EXECUTABLE_SET",
      "PostgreSQL executables do not share one canonical bin directory",
    );
  }
  const [psql, pgRestore, createdb, dropdb] = await Promise.all([
    hashStableFile(psqlPath, "psql binary"),
    hashStableFile(pgRestorePath, "pg_restore binary"),
    hashStableFile(createdbPath, "createdb binary"),
    hashStableFile(dropdbPath, "dropdb binary"),
  ]);
  let closure;
  try {
    closure = await verifyPsqlRuntimeClosure({
      expectedClosureSha256: PSQL_RUNTIME_CLOSURE_SHA256,
      expectedManifestSha256: PSQL_RUNTIME_CLOSURE_MANIFEST_SHA256,
      manifestPath: realpathSync(
        join(PROJECT_ROOT, PSQL_RUNTIME_CLOSURE_MANIFEST_PATH),
      ),
    });
  } catch (error) {
    throw safeFailure(
      error,
      "PSQL_RUNTIME_CLOSURE",
      "psql runtime closure verification failed",
    );
  }
  if (
    closure.psqlFileSha256 !== psql.sha256 ||
    closure.closureSha256 !== PSQL_RUNTIME_CLOSURE_SHA256 ||
    closure.manifestSha256 !== PSQL_RUNTIME_CLOSURE_MANIFEST_SHA256 ||
    projectFacts.psqlRuntimeManifest.sha256 !==
      PSQL_RUNTIME_CLOSURE_MANIFEST_SHA256
  ) {
    fail("PSQL_RUNTIME_BINDING", "psql runtime bindings differ");
  }
  return {
    executables: {
      createdbPath,
      dropdbPath,
      pgRestorePath,
      psqlPath,
    },
    projectFacts,
    tools: {
      contextBindings: {
        backupContractHelperSha256: projectFacts.backupContractHelper.sha256,
        backupVerifierSha256: projectFacts.backupVerifier.sha256,
        companionReceiptSchemaSha256:
          projectFacts.companionReceiptSchema.sha256,
        sourceRegistrationLogicalCloneRehearsalTestSha256:
          projectFacts.sourceRegistrationLogicalCloneRehearsalTest.sha256,
        structuralRestoreRunnerSha256:
          projectFacts.structuralRestoreRunner.sha256,
      },
      executedTools: {
        companionReceiptValidatorSha256:
          projectFacts.companionReceiptValidator.sha256,
        companionRunnerSha256: projectFacts.companionRunner.sha256,
        createdbBinarySha256: createdb.sha256,
        databaseLogicalDigestSha256: projectFacts.databaseLogicalDigest.sha256,
        dropdbBinarySha256: dropdb.sha256,
        pgRestoreBinarySha256: pgRestore.sha256,
        psqlBinarySha256: psql.sha256,
        psqlRuntimeClosureSha256: closure.closureSha256,
        psqlRuntimeManifestSha256: closure.manifestSha256,
        psqlRuntimeVerifierSha256: projectFacts.psqlRuntimeVerifier.sha256,
        sourceRegistrationApplyRunnerSha256:
          projectFacts.sourceRegistrationApplyRunner.sha256,
        sourceRegistrationApplyRuntimeSha256:
          projectFacts.sourceRegistrationApplyRuntime.sha256,
        sourceRegistrationLauncherSha256:
          projectFacts.sourceRegistrationLauncher.sha256,
        sourceRegistrationLogicalCloneRehearsalRuntimeSha256:
          projectFacts.sourceRegistrationLogicalCloneRehearsalRuntime.sha256,
        sourceRegistrationLogicalCloneRehearsalSchemaSha256:
          projectFacts.sourceRegistrationLogicalCloneRehearsalSchema.sha256,
        sourceRegistrationLogicalCloneRehearsalCommandRunnerSha256:
          projectFacts.sourceRegistrationLogicalCloneRehearsalCommandRunner
            .sha256,
      },
    },
  };
}

async function assertToolBindingsStable(toolBindings) {
  for (const [key, relativePath] of Object.entries(PROJECT_BINDING_PATHS)) {
    const facts = await hashStableFile(
      realpathSync(join(PROJECT_ROOT, relativePath)),
      `${key} tool recheck`,
    );
    if (facts.sha256 !== toolBindings.projectFacts[key].sha256) {
      fail("TOOL_DRIFT", "a bound tool changed during the comparison");
    }
  }
  for (const [key, toolKey] of [
    ["createdbPath", "createdbBinarySha256"],
    ["dropdbPath", "dropdbBinarySha256"],
    ["pgRestorePath", "pgRestoreBinarySha256"],
    ["psqlPath", "psqlBinarySha256"],
  ]) {
    const facts = await hashStableFile(
      toolBindings.executables[key],
      `${key} recheck`,
    );
    if (facts.sha256 !== toolBindings.tools.executedTools[toolKey]) {
      fail(
        "TOOL_DRIFT",
        "a PostgreSQL executable changed during the comparison",
      );
    }
  }
  let closure;
  try {
    closure = await verifyPsqlRuntimeClosure({
      expectedClosureSha256:
        toolBindings.tools.executedTools.psqlRuntimeClosureSha256,
      expectedManifestSha256:
        toolBindings.tools.executedTools.psqlRuntimeManifestSha256,
      manifestPath: realpathSync(
        join(PROJECT_ROOT, PSQL_RUNTIME_CLOSURE_MANIFEST_PATH),
      ),
    });
  } catch (error) {
    throw safeFailure(
      error,
      "TOOL_DRIFT",
      "psql runtime closure changed during the comparison",
    );
  }
  if (
    closure.psqlFileSha256 !==
      toolBindings.tools.executedTools.psqlBinarySha256 ||
    closure.closureSha256 !==
      toolBindings.tools.executedTools.psqlRuntimeClosureSha256 ||
    closure.manifestSha256 !==
      toolBindings.tools.executedTools.psqlRuntimeManifestSha256
  ) {
    fail("TOOL_DRIFT", "psql runtime closure changed during the comparison");
  }
}

async function importSourceRegistrationRehearsalModules() {
  const originalDirectory = process.cwd();
  try {
    process.chdir(PROJECT_ROOT);
    const [applyRunner, rehearsalRuntime] = await Promise.all([
      import(
        pathToFileURL(
          join(
            PROJECT_ROOT,
            PROJECT_BINDING_PATHS.sourceRegistrationApplyRunner,
          ),
        ).href
      ),
      import(
        pathToFileURL(
          join(
            PROJECT_ROOT,
            PROJECT_BINDING_PATHS.sourceRegistrationLogicalCloneRehearsalRuntime,
          ),
        ).href
      ),
    ]);
    for (const [module, names] of [
      [
        applyRunner,
        [
          "loadLockedSourceRegistrationPlan",
          "reconstructLockedDocumentContents",
          "sourceRegistrationApplyCodeBindings",
          "sourceRegistrationRuntimeAttestation",
          "verifyLockedPlanInputs",
        ],
      ],
      [
        rehearsalRuntime,
        [
          "sealSourceRegistrationLogicalComparisonProof",
          "validateSourceRegistrationLogicalCloneRehearsalReceipt",
        ],
      ],
    ]) {
      if (names.some((name) => typeof module[name] !== "function")) {
        fail(
          "REHEARSAL_RUNTIME",
          "source-registration rehearsal runtime API is incomplete",
        );
      }
    }
    return { applyRunner, rehearsalRuntime };
  } catch (error) {
    throw safeFailure(
      error,
      "REHEARSAL_RUNTIME",
      "source-registration rehearsal runtime could not be loaded",
    );
  } finally {
    process.chdir(originalDirectory);
  }
}

function sourceRegistrationRuntimeToolFacts(codeBindings) {
  const runtime = codeBindings.runtimeEnvironment;
  return {
    sourceRegistrationApplyRunnerSha256: codeBindings.runner.fileSha256,
    sourceRegistrationApplyRuntimeSha256: codeBindings.runtime.fileSha256,
    sourceRegistrationLauncherSha256: runtime.launcher.fileSha256,
    sourceRegistrationLocalRuntimeClosureSha256:
      runtime.localClosure.closureSha256,
    sourceRegistrationLogicalCloneRehearsalRuntimeSha256:
      codeBindings.logicalCloneRehearsalRuntime.fileSha256,
    sourceRegistrationLogicalCloneRehearsalSchemaSha256:
      codeBindings.logicalCloneRehearsalJsonSchema.fileSha256,
    sourceRegistrationLogicalCloneRehearsalCommandRunnerSha256:
      codeBindings.logicalCloneRehearsalCommandRunner.fileSha256,
    sourceRegistrationNodeBinarySha256: runtime.node.binaryFileSha256,
    sourceRegistrationNodeModulesTreeSha256: runtime.nodeModules.treeSha256,
    sourceRegistrationNodeRuntimeClosureSha256:
      runtime.node.runtimeClosureSha256,
    sourceRegistrationNodeRuntimeManifestSha256:
      runtime.node.runtimeClosureManifestSha256,
    sourceRegistrationNodeRuntimeVerifierSha256:
      runtime.node.runtimeClosureVerifierFileSha256,
    sourceRegistrationPrismaGeneratedClientTreeSha256:
      runtime.prismaGeneratedClient.treeSha256,
    sourceRegistrationRuntimeAttestationSha256:
      runtime.runtimeAttestationSha256,
  };
}

function assertExpectedSourceRegistrationPins(input, facts, toolBindings) {
  const expected = {
    sourceRegistrationApplyRunnerSha256:
      input.expectedSourceRegistrationApplyRunnerSha256,
    sourceRegistrationApplyRuntimeSha256:
      input.expectedSourceRegistrationApplyRuntimeSha256,
    sourceRegistrationLauncherSha256:
      input.expectedSourceRegistrationLauncherSha256,
    sourceRegistrationLocalRuntimeClosureSha256:
      input.expectedSourceRegistrationLocalRuntimeClosureSha256,
    sourceRegistrationLogicalCloneRehearsalRuntimeSha256:
      input.expectedSourceRegistrationLogicalCloneRehearsalRuntimeSha256,
    sourceRegistrationLogicalCloneRehearsalSchemaSha256:
      input.expectedSourceRegistrationLogicalCloneRehearsalSchemaSha256,
    sourceRegistrationLogicalCloneRehearsalCommandRunnerSha256:
      input.expectedSourceRegistrationLogicalCloneRehearsalCommandRunnerSha256,
    sourceRegistrationNodeBinarySha256:
      input.expectedSourceRegistrationNodeBinarySha256,
    sourceRegistrationNodeModulesTreeSha256:
      input.expectedSourceRegistrationNodeModulesTreeSha256,
    sourceRegistrationNodeRuntimeClosureSha256:
      input.expectedSourceRegistrationNodeRuntimeClosureSha256,
    sourceRegistrationNodeRuntimeManifestSha256:
      input.expectedSourceRegistrationNodeRuntimeManifestSha256,
    sourceRegistrationNodeRuntimeVerifierSha256:
      input.expectedSourceRegistrationNodeRuntimeVerifierSha256,
    sourceRegistrationPrismaGeneratedClientTreeSha256:
      input.expectedSourceRegistrationPrismaGeneratedClientTreeSha256,
    sourceRegistrationRuntimeAttestationSha256:
      input.expectedSourceRegistrationRuntimeAttestationSha256,
  };
  for (const [key, expectedSha256] of Object.entries(expected)) {
    if (facts[key] !== expectedSha256) {
      fail(
        "EXPECTED_REHEARSAL_RUNTIME_BINDING",
        "source-registration rehearsal runtime differs from an expected pin",
      );
    }
  }
  if (
    toolBindings.projectFacts.sourceRegistrationLogicalCloneRehearsalTest
      .sha256 !==
    input.expectedSourceRegistrationLogicalCloneRehearsalTestSha256
  ) {
    fail(
      "EXPECTED_REHEARSAL_RUNTIME_BINDING",
      "source-registration rehearsal test differs from its expected pin",
    );
  }
}

function logicalCloneRehearsalBinding(receipt, receiptFileSha256) {
  return {
    applyRunnerSha256: receipt.applyRunnerSha256,
    artifactType: receipt.artifactType,
    canonicalJsonFormat: LOGICAL_RESTORE_COMPANION_CANONICAL_JSON,
    exactProductionTargetExercised: receipt.exactProductionTargetExercised,
    executedRuntime: { ...receipt.executedRuntime },
    firstExactMutationRemainsLive: receipt.firstExactMutationRemainsLive,
    logicalCloneContentStateSha256:
      receipt.logicalComparisonProof.restored.contentStateSha256,
    logicalComparisonProofSha256:
      receipt.logicalComparisonProof.logicalComparisonProofSha256,
    operationKey: receipt.operationKey,
    planFileSha256: receipt.planFileSha256,
    planSha256: receipt.planSha256,
    privateReceiptStoredOutsideRepo: true,
    productionAuthorizationUsed: receipt.productionAuthorizationUsed,
    receiptFileSha256,
    receiptSelfSha256: receipt.receiptSha256,
    rehearsalCommandRunnerSha256: receipt.rehearsalCommandRunnerSha256,
    rehearsalCompletedAtUtc: receipt.rehearsalCompletedAtUtc,
    rehearsalRuntimeSha256: receipt.rehearsalRuntimeSha256,
    rehearsalSchemaSha256: receipt.rehearsalSchemaSha256,
    rehearsalStartedAtUtc: receipt.rehearsalStartedAtUtc,
    rehearsalTestSha256: receipt.rehearsalTestSha256,
    rollback: { ...receipt.rollback },
    schemaVersion: receipt.schemaVersion,
    runtimeAttestationSha256: receipt.executedRuntime.runtimeAttestationSha256,
    targetClass: receipt.targetClass,
    targetSetSha256: receipt.targetSetSha256,
  };
}

const REHEARSAL_CALLBACK_KEYS = Object.freeze([
  "artifactType",
  "exactProductionTargetExercised",
  "fileSha256",
  "firstExactMutationRemainsLive",
  "logicalComparisonProofSha256",
  "privateReceiptStoredOutsideRepo",
  "receiptSha256",
  "runtimeAttestationSha256",
  "targetClass",
  "transactionRolledBack",
]);

function parseLogicalCloneRehearsalCallback(stdout) {
  if (
    typeof stdout !== "string" ||
    Buffer.byteLength(stdout, "utf8") > 16_384 ||
    !stdout.endsWith("\n")
  ) {
    fail("REHEARSAL_CALLBACK", "rehearsal callback bytes are invalid");
  }
  let callback;
  try {
    callback = JSON.parse(stdout);
  } catch {
    fail("REHEARSAL_CALLBACK", "rehearsal callback is not JSON");
  }
  const value = exactObject(
    callback,
    REHEARSAL_CALLBACK_KEYS,
    "rehearsal callback",
  );
  if (`${JSON.stringify(value)}\n` !== stdout) {
    fail("REHEARSAL_CALLBACK", "rehearsal callback bytes are not exact");
  }
  for (const key of [
    "fileSha256",
    "logicalComparisonProofSha256",
    "receiptSha256",
    "runtimeAttestationSha256",
  ]) {
    sha256(value[key], `rehearsal callback ${key}`);
  }
  if (
    value.artifactType !== LOGICAL_RESTORE_REHEARSAL_ARTIFACT_TYPE ||
    value.targetClass !== LOGICAL_RESTORE_REHEARSAL_TARGET_CLASS ||
    value.exactProductionTargetExercised !== false ||
    value.firstExactMutationRemainsLive !== true ||
    value.privateReceiptStoredOutsideRepo !== true ||
    value.transactionRolledBack !== true
  ) {
    fail("REHEARSAL_CALLBACK", "rehearsal callback facts are invalid");
  }
  assertPathAndCredentialFree(value, "rehearsal callback");
  return value;
}

function controlledRehearsalLauncherEnvironment({
  cloneDatabaseUrl,
  logicalComparisonProof,
  input,
  toolBindings,
}) {
  const proofBytes = Buffer.from(
    canonicalLogicalRestoreCompanionJson(logicalComparisonProof),
    "utf8",
  );
  return {
    DATABASE_URL: cloneDatabaseUrl,
    LANG: "C",
    LC_ALL: "C",
    PATH: [
      dirname(realpathSync(process.execPath)),
      dirname(toolBindings.executables.psqlPath),
      "/usr/bin",
      "/bin",
      "/usr/sbin",
      "/sbin",
    ]
      .filter((value, index, values) => values.indexOf(value) === index)
      .join(delimiter),
    SOURCE_REGISTRATION_REHEARSAL_LOGICAL_COMPARISON_PROOF_BASE64:
      proofBytes.toString("base64"),
    SOURCE_REGISTRATION_REHEARSAL_OUTPUT_FILE: input.rehearsalOutputPath,
    SOURCE_REGISTRATION_REHEARSAL_PRIMARY_CORPUS_ROOT: input.primaryCorpusRoot,
    SOURCE_REGISTRATION_REHEARSAL_REPLICA_CORPUS_ROOT: input.replicaCorpusRoot,
    TMPDIR: "/tmp",
    TZ: "UTC",
  };
}

function validateRehearsalReceiptValue({
  expectedRuntime,
  expectedLogicalComparisonProof,
  schemaValidator,
  sharedValidator,
  toolBindings,
  value,
}) {
  let receipt;
  try {
    receipt = sharedValidator(value, { now: new Date() });
  } catch (error) {
    throw safeFailure(
      error,
      "REHEARSAL_RECEIPT_INVALID",
      "logical-clone rehearsal receipt failed its runtime contract",
    );
  }
  if (!schemaValidator(receipt)) {
    fail(
      "REHEARSAL_RECEIPT_SCHEMA",
      "logical-clone rehearsal receipt failed JSON Schema validation",
    );
  }
  if (
    !canonicalEqual(
      receipt.logicalComparisonProof,
      expectedLogicalComparisonProof,
    )
  ) {
    fail(
      "REHEARSAL_RECEIPT_PROOF",
      "logical-clone rehearsal receipt bound a different comparison proof",
    );
  }
  const executedTools = toolBindings.tools.executedTools;
  const codeFacts = {
    applyRunnerSha256: executedTools.sourceRegistrationApplyRunnerSha256,
    rehearsalCommandRunnerSha256:
      executedTools.sourceRegistrationLogicalCloneRehearsalCommandRunnerSha256,
    rehearsalRuntimeSha256:
      executedTools.sourceRegistrationLogicalCloneRehearsalRuntimeSha256,
    rehearsalSchemaSha256:
      executedTools.sourceRegistrationLogicalCloneRehearsalSchemaSha256,
    rehearsalTestSha256:
      toolBindings.tools.contextBindings
        .sourceRegistrationLogicalCloneRehearsalTestSha256,
  };
  for (const [key, expected] of Object.entries(codeFacts)) {
    if (receipt[key] !== expected) {
      fail(
        "REHEARSAL_RECEIPT_CODE_BINDING",
        "logical-clone rehearsal receipt code binding differs",
      );
    }
  }
  const expectedExecutedRuntime = {
    launcherFileSha256: executedTools.sourceRegistrationLauncherSha256,
    localRuntimeClosureSha256:
      executedTools.sourceRegistrationLocalRuntimeClosureSha256,
    nodeArch: expectedRuntime.node.arch,
    nodeBinaryFileSha256: executedTools.sourceRegistrationNodeBinarySha256,
    nodeModulesTreeSha256:
      executedTools.sourceRegistrationNodeModulesTreeSha256,
    nodePlatform: expectedRuntime.node.platform,
    nodeRuntimeClosureSha256:
      executedTools.sourceRegistrationNodeRuntimeClosureSha256,
    nodeVersion: expectedRuntime.node.version,
    prismaGeneratedClientTreeSha256:
      executedTools.sourceRegistrationPrismaGeneratedClientTreeSha256,
    runtimeAttestationSha256:
      executedTools.sourceRegistrationRuntimeAttestationSha256,
  };
  if (!canonicalEqual(receipt.executedRuntime, expectedExecutedRuntime)) {
    fail(
      "REHEARSAL_RECEIPT_RUNTIME_BINDING",
      "logical-clone rehearsal receipt runtime binding differs",
    );
  }
  return receipt;
}

async function prepareSourceRegistrationRehearsal({ input, toolBindings }) {
  validatePrivateOutputPath(
    input.rehearsalOutputPath,
    "logical-clone rehearsal receipt output",
  );
  const { applyRunner, rehearsalRuntime } =
    await importSourceRegistrationRehearsalModules();
  let schema;
  let schemaValidator;
  try {
    schema = JSON.parse(
      readFileSync(
        realpathSync(
          join(
            PROJECT_ROOT,
            PROJECT_BINDING_PATHS.sourceRegistrationLogicalCloneRehearsalSchema,
          ),
        ),
        "utf8",
      ),
    );
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    addFormats(ajv);
    schemaValidator = ajv.compile(schema);
  } catch (error) {
    throw safeFailure(
      error,
      "REHEARSAL_SCHEMA",
      "logical-clone rehearsal JSON Schema could not be compiled",
    );
  }
  let codeBindings;
  let plan;
  try {
    codeBindings =
      applyRunner.sourceRegistrationApplyCodeBindings(PROJECT_ROOT);
    plan = applyRunner.loadLockedSourceRegistrationPlan(PROJECT_ROOT);
    applyRunner.verifyLockedPlanInputs({
      manifestPath: SOURCE_REGISTRATION_BATCH_PATH,
      plan,
      primaryCorpusRoot: input.primaryCorpusRoot,
      projectRoot: PROJECT_ROOT,
      replicaCorpusRoot: input.replicaCorpusRoot,
    });
    applyRunner.reconstructLockedDocumentContents({
      plan,
      primaryCorpusRoot: input.primaryCorpusRoot,
      projectRoot: PROJECT_ROOT,
      replicaCorpusRoot: input.replicaCorpusRoot,
    });
  } catch (error) {
    throw safeFailure(
      error,
      "REHEARSAL_INPUTS",
      "locked source-registration rehearsal inputs failed verification",
    );
  }
  const runtimeFacts = sourceRegistrationRuntimeToolFacts(codeBindings);
  assertExpectedSourceRegistrationPins(input, runtimeFacts, toolBindings);
  const directFacts = {
    sourceRegistrationApplyRunnerSha256:
      toolBindings.projectFacts.sourceRegistrationApplyRunner.sha256,
    sourceRegistrationApplyRuntimeSha256:
      toolBindings.projectFacts.sourceRegistrationApplyRuntime.sha256,
    sourceRegistrationLauncherSha256:
      toolBindings.projectFacts.sourceRegistrationLauncher.sha256,
    sourceRegistrationLogicalCloneRehearsalRuntimeSha256:
      toolBindings.projectFacts.sourceRegistrationLogicalCloneRehearsalRuntime
        .sha256,
    sourceRegistrationLogicalCloneRehearsalSchemaSha256:
      toolBindings.projectFacts.sourceRegistrationLogicalCloneRehearsalSchema
        .sha256,
    sourceRegistrationLogicalCloneRehearsalCommandRunnerSha256:
      toolBindings.projectFacts
        .sourceRegistrationLogicalCloneRehearsalCommandRunner.sha256,
  };
  for (const [key, value] of Object.entries(directFacts)) {
    if (runtimeFacts[key] !== value) {
      fail(
        "REHEARSAL_RUNTIME_BINDING",
        "source-registration code binding differs from direct file hashing",
      );
    }
  }
  const currentNode = await hashStableFile(
    realpathSync(process.execPath),
    "active Node binary",
  );
  if (currentNode.sha256 !== runtimeFacts.sourceRegistrationNodeBinarySha256) {
    fail(
      "REHEARSAL_RUNTIME_BINDING",
      "active Node binary differs from the runtime attestation",
    );
  }
  Object.assign(toolBindings.tools.executedTools, runtimeFacts);

  const validatePublishedValue = (value, expectedLogicalComparisonProof) =>
    validateRehearsalReceiptValue({
      expectedRuntime: codeBindings.runtimeEnvironment,
      expectedLogicalComparisonProof,
      schemaValidator,
      sharedValidator:
        rehearsalRuntime.validateSourceRegistrationLogicalCloneRehearsalReceipt,
      toolBindings,
      value,
    });

  const readAndBind = (expectedLogicalComparisonProof) => {
    const read = readStablePrivateFile(
      input.rehearsalOutputPath,
      "logical-clone rehearsal receipt",
    );
    if ((Number(read.identity.mode) & 0o777) !== 0o400) {
      fail(
        "REHEARSAL_RECEIPT_MODE",
        "logical-clone rehearsal receipt is not mode 0400",
      );
    }
    const receipt = validatePublishedValue(
      requireCanonicalJson(read.bytes, "logical-clone rehearsal receipt"),
      expectedLogicalComparisonProof,
    );
    return logicalCloneRehearsalBinding(
      receipt,
      logicalRestoreCompanionSha256(read.bytes),
    );
  };

  return {
    async assertRuntimeStable() {
      let current;
      try {
        current =
          applyRunner.sourceRegistrationRuntimeAttestation(PROJECT_ROOT);
      } catch (error) {
        throw safeFailure(
          error,
          "REHEARSAL_RUNTIME_DRIFT",
          "source-registration runtime could not be re-attested",
        );
      }
      if (!canonicalEqual(current, codeBindings.runtimeEnvironment)) {
        fail(
          "REHEARSAL_RUNTIME_DRIFT",
          "source-registration runtime attestation changed",
        );
      }
    },
    async run({ cloneDatabaseUrl, logicalComparisonProof, signal }) {
      const { logicalComparisonProofSha256, ...proofBody } =
        logicalComparisonProof;
      const sharedProof =
        rehearsalRuntime.sealSourceRegistrationLogicalComparisonProof(
          proofBody,
        );
      if (
        sharedProof.logicalComparisonProofSha256 !==
          logicalComparisonProofSha256 ||
        !canonicalEqual(sharedProof, logicalComparisonProof)
      ) {
        fail(
          "REHEARSAL_PROOF_RUNTIME",
          "independent comparison-proof runtimes disagree",
        );
      }
      validatePrivateOutputPath(
        input.rehearsalOutputPath,
        "logical-clone rehearsal receipt output",
      );
      const result = await runControlledNonInterruptibleNestedCommand({
        abortSignal: signal,
        args: [
          realpathSync(
            join(
              PROJECT_ROOT,
              PROJECT_BINDING_PATHS.sourceRegistrationLauncher,
            ),
          ),
          "--rehearse-logical-clone",
        ],
        environment: controlledRehearsalLauncherEnvironment({
          cloneDatabaseUrl,
          input,
          logicalComparisonProof: sharedProof,
          toolBindings,
        }),
        executable: realpathSync(process.execPath),
        cwd: PROJECT_ROOT,
      });
      const callback = parseLogicalCloneRehearsalCallback(result.stdout);
      const binding = readAndBind(sharedProof);
      if (
        callback.fileSha256 !== binding.receiptFileSha256 ||
        callback.receiptSha256 !== binding.receiptSelfSha256 ||
        callback.logicalComparisonProofSha256 !==
          binding.logicalComparisonProofSha256 ||
        callback.runtimeAttestationSha256 !==
          toolBindings.tools.executedTools
            .sourceRegistrationRuntimeAttestationSha256
      ) {
        fail(
          "REHEARSAL_CALLBACK_BINDING",
          "rehearsal callback differs from the private receipt",
        );
      }
      return binding;
    },
    async reverify(expectedLogicalComparisonProof) {
      await assertToolBindingsStable(toolBindings);
      await this.assertRuntimeStable();
      return readAndBind(expectedLogicalComparisonProof);
    },
  };
}

function parsePostgresUrl(raw, label) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    fail("DATABASE_URL_INVALID", `${label} is invalid`);
  }
  if (!url || !["postgres:", "postgresql:"].includes(url.protocol)) {
    fail("DATABASE_URL_INVALID", `${label} has an unsupported protocol`);
  }
  const databaseName = decodeURIComponent(url.pathname.replace(/^\//, ""));
  const user = decodeURIComponent(url.username);
  const password = decodeURIComponent(url.password);
  const host = decodeURIComponent(url.hostname);
  const port = url.port || "5432";
  const sslmode = url.searchParams.get("sslmode") || "prefer";
  if (
    !databaseName ||
    !user ||
    !host ||
    !/^\d+$/.test(port) ||
    ![
      "disable",
      "allow",
      "prefer",
      "require",
      "verify-ca",
      "verify-full",
    ].includes(sslmode) ||
    [databaseName, user, password, host].some((value) => /[\0\r\n]/.test(value))
  ) {
    fail(
      "DATABASE_URL_INVALID",
      `${label} is missing controlled connection fields`,
    );
  }
  return { databaseName, host, password, port, sslmode, url, user };
}

function libpqEnvironment(connection, databaseName = connection.databaseName) {
  return {
    LANG: "C",
    LC_ALL: "C",
    TZ: "UTC",
    PGAPPNAME: "foodsystems-logical-restore-companion-v1",
    PGCLIENTENCODING: "UTF8",
    PGCONNECT_TIMEOUT: "5",
    PGDATABASE: databaseName,
    PGHOST: connection.host,
    PGOPTIONS:
      "-c timezone=UTC -c DateStyle=ISO,YMD -c bytea_output=hex -c extra_float_digits=3",
    PGPASSWORD: connection.password,
    PGPORT: connection.port,
    PGSSLMODE: connection.sslmode,
    PGUSER: connection.user,
  };
}

function cloneDatabaseUrl(source, cloneName) {
  const value = new URL(source.url.href);
  value.pathname = `/${encodeURIComponent(cloneName)}`;
  return value.href;
}

export function controlledCloneDigestDatabaseUrl(adminDatabaseUrl, cloneName) {
  if (!SAFE_DATABASE_NAME.test(cloneName)) {
    fail("CLONE_NAME", "generated clone name is not safe");
  }
  return cloneDatabaseUrl(
    parsePostgresUrl(adminDatabaseUrl, "restore admin database URL"),
    cloneName,
  );
}

function controlledCloneName(now = new Date()) {
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  return `${CONTROLLED_LOGICAL_RESTORE_CLONE_PREFIX}${date}_${randomBytes(12).toString("hex")}`;
}

function cloneNameSha256(cloneName) {
  return logicalRestoreCompanionSha256(
    `${CONTROLLED_LOGICAL_RESTORE_NAME_DOMAIN}${cloneName}`,
  );
}

function ownershipMarkerSha256(ownershipToken) {
  if (!OWNERSHIP_TOKEN_PATTERN.test(ownershipToken)) {
    fail("CLONE_OWNERSHIP", "clone ownership token is invalid");
  }
  return logicalRestoreCompanionSha256(
    `${CONTROLLED_LOGICAL_RESTORE_OWNERSHIP_DOMAIN}${ownershipToken}`,
  );
}

async function runCommand({
  args,
  cwd,
  environment,
  executable,
  inputFile,
  inputIdentity,
  inputText,
  signal,
}) {
  if (inputFile && inputText !== undefined) {
    fail("COMMAND_INPUT", "controlled command input is ambiguous");
  }
  let child;
  let inputDescriptor;
  try {
    child = spawn(executable, args, {
      cwd,
      env: environment,
      signal,
      stdio: [
        inputFile || inputText !== undefined ? "pipe" : "ignore",
        "pipe",
        "pipe",
      ],
    });
  } catch (error) {
    throw safeFailure(
      error,
      "COMMAND_START",
      "a controlled database command could not start",
    );
  }
  const stdout = [];
  const stderr = [];
  let stdoutBytes = 0;
  let stderrBytes = 0;
  let overflow = false;
  child.stdout.on("data", (chunk) => {
    stdoutBytes += chunk.length;
    if (stdoutBytes > MAX_COMMAND_OUTPUT_BYTES) {
      overflow = true;
      child.kill("SIGTERM");
      return;
    }
    stdout.push(chunk);
  });
  child.stderr.on("data", (chunk) => {
    stderrBytes += chunk.length;
    if (stderrBytes > MAX_COMMAND_OUTPUT_BYTES) {
      overflow = true;
      child.kill("SIGTERM");
      return;
    }
    stderr.push(chunk);
  });
  const completion = new Promise((resolveCompletion, rejectCompletion) => {
    child.on("error", rejectCompletion);
    child.on("close", (code, exitSignal) => {
      resolveCompletion({ code, exitSignal });
    });
  });
  let inputCompletion = Promise.resolve();
  if (inputFile) {
    try {
      inputDescriptor = openSync(
        inputFile,
        constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
      );
      const before = fstatSync(inputDescriptor, { bigint: true });
      if (!sameFileIdentity(inputIdentity, before)) {
        fail("DUMP_CHANGED", "backup dump changed before command input");
      }
      const stream = createReadStream(inputFile, {
        autoClose: false,
        fd: inputDescriptor,
        start: 0,
      });
      inputCompletion = pipeline(stream, child.stdin).then(() => {
        const after = fstatSync(inputDescriptor, { bigint: true });
        if (!sameFileIdentity(inputIdentity, after)) {
          fail("DUMP_CHANGED", "backup dump changed during command input");
        }
      });
    } catch (error) {
      child.kill("SIGTERM");
      throw safeFailure(
        error,
        "DUMP_STREAM",
        "backup dump could not be streamed safely",
      );
    }
  } else if (inputText !== undefined) {
    if (typeof inputText !== "string" || /\0/.test(inputText)) {
      child.kill("SIGTERM");
      fail("COMMAND_INPUT", "controlled command text input is invalid");
    }
    inputCompletion = new Promise((resolveInput, rejectInput) => {
      child.stdin.once("error", rejectInput);
      child.stdin.end(inputText, "utf8", resolveInput);
    });
  }
  let result;
  try {
    [result] = await Promise.all([completion, inputCompletion]);
  } catch (error) {
    child.kill("SIGTERM");
    throw safeFailure(
      error,
      "COMMAND_FAILED",
      "a controlled database command failed",
    );
  } finally {
    if (inputDescriptor !== undefined) closeSync(inputDescriptor);
  }
  if (
    overflow ||
    result.code !== 0 ||
    result.exitSignal ||
    Buffer.concat(stderr).toString("utf8").trim() !== ""
  ) {
    fail("COMMAND_FAILED", "a controlled database command failed closed");
  }
  return {
    stderr: Buffer.concat(stderr).toString("utf8"),
    stdout: Buffer.concat(stdout).toString("utf8"),
  };
}

/**
 * The locked launcher currently owns a synchronous nested runner. It must not
 * be killed mid-run because that could orphan the database transaction. Abort
 * is observed before launch and again by the caller after bounded completion.
 */
export async function runControlledNonInterruptibleNestedCommand({
  abortSignal,
  args,
  cwd,
  environment,
  executable,
}) {
  if (abortSignal?.aborted) {
    fail("HANDLED_SIGNAL", "handled signal interrupted before nested launch");
  }
  const result = await runCommand({
    args,
    cwd,
    environment,
    executable,
  });
  return {
    ...result,
    abortObservedAfterCompletion: Boolean(abortSignal?.aborted),
  };
}

function assertArchiveCatalog(catalog) {
  if (typeof catalog !== "string" || catalog.length === 0) {
    fail("ARCHIVE_CATALOG", "backup archive catalog is empty");
  }
  for (const relation of REQUIRED_ARCHIVE_RELATIONS) {
    const escaped = relation.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(
      `(?:^|\\n)[^\\n]*\\sTABLE\\s+public\\s+${escaped}(?:\\s|$)`,
    );
    if (!pattern.test(catalog)) {
      fail("ARCHIVE_CATALOG", "backup archive is missing a required relation");
    }
  }
}

function databaseExistsSql(databaseName) {
  if (!SAFE_DATABASE_NAME.test(databaseName)) {
    fail("CLONE_NAME", "generated clone name is not safe");
  }
  return `SELECT EXISTS (SELECT 1 FROM pg_database WHERE datname = '${databaseName}');`;
}

export function controlledCloneOwnershipComment(ownershipToken) {
  if (!OWNERSHIP_TOKEN_PATTERN.test(ownershipToken)) {
    fail("CLONE_OWNERSHIP", "clone ownership token is invalid");
  }
  return `${CONTROLLED_LOGICAL_RESTORE_OWNERSHIP_COMMENT_PREFIX}${ownershipToken}`;
}

export function verifyControlledCloneOwnershipMarker({
  actualComment,
  databaseExists,
  ownershipToken,
}) {
  if (typeof databaseExists !== "boolean") {
    fail("CLONE_OWNERSHIP", "clone existence fact is invalid");
  }
  if (!databaseExists) return "already_absent";
  if (actualComment !== controlledCloneOwnershipComment(ownershipToken)) {
    fail(
      "CLONE_OWNERSHIP",
      "disposable clone ownership marker was not verified before drop",
    );
  }
  return "owned";
}

function databaseOwnershipCommentSql(databaseName, ownershipToken) {
  if (!SAFE_DATABASE_NAME.test(databaseName)) {
    fail("CLONE_NAME", "generated clone name is not safe");
  }
  return `COMMENT ON DATABASE ${databaseName} IS '${controlledCloneOwnershipComment(ownershipToken)}';`;
}

function databaseOwnershipQuerySql(databaseName) {
  if (!SAFE_DATABASE_NAME.test(databaseName)) {
    fail("CLONE_NAME", "generated clone name is not safe");
  }
  return `SELECT COALESCE((SELECT shobj_description(oid, 'pg_database') FROM pg_database WHERE datname = '${databaseName}'), '');`;
}

function createProductionOperations({
  abortSignal,
  adminConnection,
  dumpIdentity,
  dumpPath,
  executables,
  ownershipToken,
  rehearsalContext,
}) {
  const adminEnvironment = libpqEnvironment(adminConnection);
  let rehearsalLogicalComparisonProof;
  async function databaseExists(databaseName, signal) {
    const result = await runCommand({
      args: [
        "-X",
        "-A",
        "-t",
        "-q",
        "-v",
        "ON_ERROR_STOP=1",
        "-c",
        databaseExistsSql(databaseName),
      ],
      environment: adminEnvironment,
      executable: executables.psqlPath,
      signal,
    });
    const value = result.stdout.trim();
    if (!["t", "f"].includes(value)) {
      fail(
        "DATABASE_EXISTENCE",
        "database existence query returned an invalid value",
      );
    }
    return value === "t";
  }
  return {
    async assertContinue() {
      if (abortSignal?.aborted) {
        fail("HANDLED_SIGNAL", "handled signal interrupted the comparison");
      }
    },
    async assertAbsent(databaseName) {
      if (await databaseExists(databaseName, abortSignal)) {
        fail("CLONE_PREEXISTS", "generated disposable clone already exists");
      }
    },
    async catalog() {
      const result = await runCommand({
        args: ["--list"],
        environment: adminEnvironment,
        executable: executables.pgRestorePath,
        inputFile: dumpPath,
        inputIdentity: dumpIdentity,
        signal: abortSignal,
      });
      assertArchiveCatalog(result.stdout);
    },
    async create(databaseName) {
      await runCommand({
        args: [
          "--maintenance-db=postgres",
          "--template=template0",
          "--encoding=UTF8",
          databaseName,
        ],
        environment: adminEnvironment,
        executable: executables.createdbPath,
        signal: abortSignal,
      });
      await runCommand({
        args: ["-X", "-A", "-t", "-q", "-v", "ON_ERROR_STOP=1"],
        environment: adminEnvironment,
        executable: executables.psqlPath,
        inputText: `${databaseOwnershipCommentSql(databaseName, ownershipToken)}\n`,
      });
    },
    async digest(databaseUrl) {
      if (abortSignal?.aborted) {
        fail("HANDLED_SIGNAL", "handled signal interrupted the comparison");
      }
      try {
        const digest = await computeDatabaseLogicalStateDigest({
          databaseUrl,
          psqlPath: executables.psqlPath,
        });
        if (abortSignal?.aborted) {
          fail("HANDLED_SIGNAL", "handled signal interrupted the comparison");
        }
        return digest;
      } catch (error) {
        throw safeFailure(
          error,
          "LOGICAL_DIGEST",
          "database logical digest computation failed",
        );
      }
    },
    async drop(databaseName) {
      const marker = await runCommand({
        args: [
          "-X",
          "-A",
          "-t",
          "-q",
          "-v",
          "ON_ERROR_STOP=1",
          "-c",
          databaseOwnershipQuerySql(databaseName),
        ],
        environment: adminEnvironment,
        executable: executables.psqlPath,
      });
      const actualComment = marker.stdout.trim();
      const markerMatches =
        actualComment === controlledCloneOwnershipComment(ownershipToken);
      const decision = verifyControlledCloneOwnershipMarker({
        actualComment,
        databaseExists: markerMatches
          ? true
          : await databaseExists(databaseName),
        ownershipToken,
      });
      if (decision === "already_absent") return decision;
      await runCommand({
        args: ["--maintenance-db=postgres", "--if-exists", databaseName],
        environment: adminEnvironment,
        executable: executables.dropdbPath,
      });
      return decision;
    },
    async confirmAbsent(databaseName) {
      return !(await databaseExists(databaseName));
    },
    async restore(databaseName) {
      await runCommand({
        args: [
          "--exit-on-error",
          "--no-owner",
          "--no-acl",
          `--dbname=${databaseName}`,
        ],
        environment: libpqEnvironment(adminConnection, databaseName),
        executable: executables.pgRestorePath,
        inputFile: dumpPath,
        inputIdentity: dumpIdentity,
        signal: abortSignal,
      });
    },
    async rehearse({ cloneDatabaseUrl, logicalComparisonProof }) {
      if (abortSignal?.aborted) {
        fail("HANDLED_SIGNAL", "handled signal interrupted the rehearsal");
      }
      rehearsalLogicalComparisonProof = logicalComparisonProof;
      const binding = await rehearsalContext.run({
        cloneDatabaseUrl,
        logicalComparisonProof,
        signal: abortSignal,
      });
      if (abortSignal?.aborted) {
        fail("HANDLED_SIGNAL", "handled signal interrupted the rehearsal");
      }
      return binding;
    },
    async reverifyRehearsal() {
      if (!rehearsalLogicalComparisonProof) {
        fail("REHEARSAL_INCOMPLETE", "logical-clone rehearsal was not run");
      }
      return rehearsalContext.reverify(rehearsalLogicalComparisonProof);
    },
    cloneDatabaseUrl(databaseName) {
      return cloneDatabaseUrl(adminConnection, databaseName);
    },
  };
}

function digestSummary(digest, expectedDatabaseName, expectedPsqlSha256) {
  if (!isPlainObject(digest)) {
    fail("LOGICAL_DIGEST_SHAPE", "database logical digest is not an object");
  }
  sha256(digest.contentStateSha256, "logical content state SHA-256");
  sha256(digest.logicalStateSha256, "logical state SHA-256");
  nonNegativeInteger(digest.relationCount, "logical digest relation count", {
    positive: true,
  });
  if (
    !Array.isArray(digest.relations) ||
    digest.relations.length !== digest.relationCount
  ) {
    fail(
      "LOGICAL_DIGEST_SHAPE",
      "logical digest relation inventory is invalid",
    );
  }
  let totalRowCount = 0;
  for (const relation of digest.relations) {
    if (!isPlainObject(relation)) {
      fail("LOGICAL_DIGEST_SHAPE", "logical digest relation is invalid");
    }
    nonNegativeInteger(relation.rowCount, "logical digest relation row count");
    totalRowCount += relation.rowCount;
    if (!Number.isSafeInteger(totalRowCount)) {
      fail("LOGICAL_DIGEST_COUNT", "logical digest total row count overflowed");
    }
  }
  nonNegativeInteger(totalRowCount, "logical digest total row count", {
    positive: true,
  });
  if (!isPlainObject(digest.sequences)) {
    fail("LOGICAL_DIGEST_SHAPE", "logical digest sequence summary is invalid");
  }
  nonNegativeInteger(
    digest.sequences.rowCount,
    "logical digest sequence count",
  );
  if (
    !isPlainObject(digest.databaseTarget) ||
    digest.databaseTarget.databaseName !== expectedDatabaseName
  ) {
    fail("LOGICAL_DIGEST_TARGET", "logical digest database target differs");
  }
  if (
    !isPlainObject(digest.tool) ||
    digest.tool.psqlFileSha256 !== expectedPsqlSha256
  ) {
    fail("LOGICAL_DIGEST_TOOL", "logical digest psql binding differs");
  }
  return {
    contentStateSha256: digest.contentStateSha256,
    logicalStateSha256: digest.logicalStateSha256,
    psqlFileSha256: digest.tool.psqlFileSha256,
    relationCount: digest.relationCount,
    sequenceCount: digest.sequences.rowCount,
    totalRowCount,
  };
}

function assertSameDatabaseSystem(sourceDigest, restoredDigest) {
  const source = sourceDigest.databaseTarget;
  const restored = restoredDigest.databaseTarget;
  for (const key of [
    "serverAddress",
    "serverPort",
    "serverVersionNum",
    "systemIdentifier",
  ]) {
    if (source[key] !== restored[key]) {
      fail(
        "LOGICAL_DIGEST_CLUSTER",
        "source and clone are not on the same database system",
      );
    }
  }
}

const LOGICAL_CLONE_REHEARSAL_BINDING_KEYS = Object.freeze([
  "applyRunnerSha256",
  "artifactType",
  "canonicalJsonFormat",
  "exactProductionTargetExercised",
  "executedRuntime",
  "firstExactMutationRemainsLive",
  "logicalCloneContentStateSha256",
  "logicalComparisonProofSha256",
  "operationKey",
  "planFileSha256",
  "planSha256",
  "privateReceiptStoredOutsideRepo",
  "productionAuthorizationUsed",
  "receiptFileSha256",
  "receiptSelfSha256",
  "rehearsalCommandRunnerSha256",
  "rehearsalCompletedAtUtc",
  "rehearsalRuntimeSha256",
  "rehearsalSchemaSha256",
  "rehearsalStartedAtUtc",
  "rehearsalTestSha256",
  "rollback",
  "schemaVersion",
  "runtimeAttestationSha256",
  "targetClass",
  "targetSetSha256",
]);
const LOGICAL_CLONE_REHEARSAL_ROLLBACK_KEYS = Object.freeze([
  "afterCountsEqualBeforeCounts",
  "forcedBySentinel",
  "rehearsalAuditAbsentAfterRollback",
  "rollbackAbsenceConfirmed",
  "targetRowsAbsentAfterRollback",
  "transactionRolledBack",
]);
const LOGICAL_CLONE_REHEARSAL_EXECUTED_RUNTIME_KEYS = Object.freeze([
  "launcherFileSha256",
  "localRuntimeClosureSha256",
  "nodeArch",
  "nodeBinaryFileSha256",
  "nodeModulesTreeSha256",
  "nodePlatform",
  "nodeRuntimeClosureSha256",
  "nodeVersion",
  "prismaGeneratedClientTreeSha256",
  "runtimeAttestationSha256",
]);

function assertLogicalCloneRehearsalBinding({
  binding,
  comparisonCompletedAtUtc,
  logicalComparisonProof,
  now,
  restoredContentStateSha256,
  tools,
}) {
  const rehearsal = exactObject(
    binding,
    LOGICAL_CLONE_REHEARSAL_BINDING_KEYS,
    "logical-clone rehearsal binding",
  );
  const literals = {
    artifactType: LOGICAL_RESTORE_REHEARSAL_ARTIFACT_TYPE,
    canonicalJsonFormat: LOGICAL_RESTORE_COMPANION_CANONICAL_JSON,
    exactProductionTargetExercised: false,
    firstExactMutationRemainsLive: true,
    planFileSha256: LOGICAL_RESTORE_REHEARSAL_PLAN_FILE_SHA256,
    planSha256: LOGICAL_RESTORE_REHEARSAL_PLAN_SHA256,
    privateReceiptStoredOutsideRepo: true,
    productionAuthorizationUsed: false,
    schemaVersion: LOGICAL_RESTORE_REHEARSAL_SCHEMA_VERSION,
    targetClass: LOGICAL_RESTORE_REHEARSAL_TARGET_CLASS,
  };
  for (const [key, expected] of Object.entries(literals)) {
    if (rehearsal[key] !== expected) {
      fail("REHEARSAL_BINDING", "logical-clone rehearsal literal differs");
    }
  }
  for (const key of [
    "applyRunnerSha256",
    "logicalCloneContentStateSha256",
    "logicalComparisonProofSha256",
    "receiptFileSha256",
    "receiptSelfSha256",
    "rehearsalCommandRunnerSha256",
    "rehearsalRuntimeSha256",
    "rehearsalSchemaSha256",
    "rehearsalTestSha256",
    "runtimeAttestationSha256",
    "targetSetSha256",
  ]) {
    sha256(rehearsal[key], `logical-clone rehearsal ${key}`);
  }
  const executedRuntime = exactObject(
    rehearsal.executedRuntime,
    LOGICAL_CLONE_REHEARSAL_EXECUTED_RUNTIME_KEYS,
    "logical-clone rehearsal executed runtime",
  );
  for (const key of [
    "launcherFileSha256",
    "localRuntimeClosureSha256",
    "nodeBinaryFileSha256",
    "nodeModulesTreeSha256",
    "nodeRuntimeClosureSha256",
    "prismaGeneratedClientTreeSha256",
    "runtimeAttestationSha256",
  ]) {
    sha256(executedRuntime[key], `logical-clone rehearsal runtime ${key}`);
  }
  if (
    typeof executedRuntime.nodeVersion !== "string" ||
    !/^v\d+\.\d+\.\d+$/.test(executedRuntime.nodeVersion) ||
    typeof executedRuntime.nodePlatform !== "string" ||
    !/^[A-Za-z0-9._-]+$/.test(executedRuntime.nodePlatform) ||
    typeof executedRuntime.nodeArch !== "string" ||
    !/^[A-Za-z0-9._-]+$/.test(executedRuntime.nodeArch) ||
    executedRuntime.launcherFileSha256 !==
      tools.executedTools.sourceRegistrationLauncherSha256 ||
    executedRuntime.localRuntimeClosureSha256 !==
      tools.executedTools.sourceRegistrationLocalRuntimeClosureSha256 ||
    executedRuntime.nodeBinaryFileSha256 !==
      tools.executedTools.sourceRegistrationNodeBinarySha256 ||
    executedRuntime.nodeModulesTreeSha256 !==
      tools.executedTools.sourceRegistrationNodeModulesTreeSha256 ||
    executedRuntime.nodeRuntimeClosureSha256 !==
      tools.executedTools.sourceRegistrationNodeRuntimeClosureSha256 ||
    executedRuntime.prismaGeneratedClientTreeSha256 !==
      tools.executedTools.sourceRegistrationPrismaGeneratedClientTreeSha256 ||
    executedRuntime.runtimeAttestationSha256 !==
      tools.executedTools.sourceRegistrationRuntimeAttestationSha256
  ) {
    fail(
      "REHEARSAL_RUNTIME_BINDING",
      "logical-clone rehearsal full executed runtime differs",
    );
  }
  if (
    rehearsal.applyRunnerSha256 !==
      tools.executedTools.sourceRegistrationApplyRunnerSha256 ||
    rehearsal.logicalCloneContentStateSha256 !== restoredContentStateSha256 ||
    rehearsal.logicalComparisonProofSha256 !==
      logicalComparisonProof.logicalComparisonProofSha256 ||
    rehearsal.targetSetSha256 !== LOGICAL_RESTORE_REHEARSAL_TARGET_SET_SHA256 ||
    rehearsal.rehearsalCommandRunnerSha256 !==
      tools.executedTools
        .sourceRegistrationLogicalCloneRehearsalCommandRunnerSha256 ||
    rehearsal.rehearsalRuntimeSha256 !==
      tools.executedTools
        .sourceRegistrationLogicalCloneRehearsalRuntimeSha256 ||
    rehearsal.rehearsalSchemaSha256 !==
      tools.executedTools.sourceRegistrationLogicalCloneRehearsalSchemaSha256 ||
    rehearsal.rehearsalTestSha256 !==
      tools.contextBindings.sourceRegistrationLogicalCloneRehearsalTestSha256 ||
    rehearsal.runtimeAttestationSha256 !==
      tools.executedTools.sourceRegistrationRuntimeAttestationSha256 ||
    typeof rehearsal.operationKey !== "string" ||
    !/^source-registration-logical-clone-rehearsal-v1:[a-f0-9]{64}$/.test(
      rehearsal.operationKey,
    )
  ) {
    fail("REHEARSAL_BINDING", "logical-clone rehearsal proof binding differs");
  }
  if (
    rehearsal.operationKey !==
    logicalRestoreRehearsalOperationKey({
      applyRunnerSha256: rehearsal.applyRunnerSha256,
      logicalComparisonProofSha256: rehearsal.logicalComparisonProofSha256,
      rehearsalCommandRunnerSha256: rehearsal.rehearsalCommandRunnerSha256,
      rehearsalRuntimeSha256: rehearsal.rehearsalRuntimeSha256,
      rehearsalSchemaSha256: rehearsal.rehearsalSchemaSha256,
      rehearsalTestSha256: rehearsal.rehearsalTestSha256,
      runtimeAttestationSha256: rehearsal.runtimeAttestationSha256,
    })
  ) {
    fail("REHEARSAL_BINDING", "logical-clone rehearsal operation key differs");
  }
  const rollback = exactObject(
    rehearsal.rollback,
    LOGICAL_CLONE_REHEARSAL_ROLLBACK_KEYS,
    "logical-clone rehearsal rollback",
  );
  if (
    LOGICAL_CLONE_REHEARSAL_ROLLBACK_KEYS.some((key) => rollback[key] !== true)
  ) {
    fail(
      "REHEARSAL_ROLLBACK",
      "logical-clone rehearsal rollback is incomplete",
    );
  }
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(
      rehearsal.rehearsalStartedAtUtc,
    ) ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(
      rehearsal.rehearsalCompletedAtUtc,
    )
  ) {
    fail("REHEARSAL_TIME", "logical-clone rehearsal time is not canonical");
  }
  const comparisonCompletedAt = timestamp(
    comparisonCompletedAtUtc,
    "logical comparison completion time",
  );
  const startedAt = timestamp(
    rehearsal.rehearsalStartedAtUtc,
    "logical-clone rehearsal start time",
  );
  const completedAt = timestamp(
    rehearsal.rehearsalCompletedAtUtc,
    "logical-clone rehearsal completion time",
  );
  const consumedAt = now.valueOf();
  if (!Number.isFinite(consumedAt)) {
    fail(
      "REHEARSAL_TIME",
      "logical-clone rehearsal consumption time is invalid",
    );
  }
  if (
    startedAt < comparisonCompletedAt ||
    completedAt < startedAt ||
    completedAt - startedAt > MAX_REHEARSAL_DURATION_MS ||
    completedAt > consumedAt + MAX_FUTURE_SKEW_MS ||
    consumedAt - completedAt > MAX_REHEARSAL_RECEIPT_AGE_MS
  ) {
    fail(
      "REHEARSAL_TIME",
      "logical-clone rehearsal timing or freshness is invalid",
    );
  }
  return rehearsal;
}

function buildReceipt({
  backup,
  cleanupCompletedAtUtc,
  cloneName,
  comparisonCompletedAtUtc,
  comparisonStartedAtUtc,
  logicalCloneRehearsal,
  logicalComparisonProofSha256,
  ownershipMarkerDigest,
  postRehearsalRestored,
  postRehearsalSource,
  postRehearsalVerifiedAtUtc,
  restored,
  source,
  structuralRestore,
  tools,
}) {
  const receipt = {
    format: LOGICAL_RESTORE_COMPANION_RECEIPT_FORMAT,
    version: LOGICAL_RESTORE_COMPANION_RECEIPT_VERSION,
    canonicalJsonFormat: LOGICAL_RESTORE_COMPANION_CANONICAL_JSON,
    evidenceClass: LOGICAL_RESTORE_COMPANION_EVIDENCE_CLASS,
    completedAtUtc: cleanupCompletedAtUtc,
    backup,
    structuralRestore,
    comparison: {
      startedAtUtc: comparisonStartedAtUtc,
      completedAtUtc: comparisonCompletedAtUtc,
      source,
      restored,
      contentStateEqual: true,
      logicalStateEqual: false,
      logicalComparisonProofSha256,
      postRehearsalClone: postRehearsalRestored,
      postRehearsalCloneFullStateMatched: true,
      postRehearsalSource,
      postRehearsalVerifiedAtUtc,
      relationCountEqual: true,
      totalRowCountEqual: true,
      sequenceCountEqual: true,
      semantic: LOGICAL_RESTORE_COMPANION_SEMANTIC,
      sourceStillMatched: true,
    },
    logicalCloneRehearsal,
    clone: {
      nameClass: LOGICAL_RESTORE_COMPANION_CLONE_CLASS,
      label: LOGICAL_RESTORE_COMPANION_CLONE_LABEL,
      nameSha256: cloneNameSha256(cloneName),
      ownershipMarkerClass: LOGICAL_RESTORE_COMPANION_OWNERSHIP_CLASS,
      ownershipMarkerSha256: ownershipMarkerDigest,
      createdFresh: true,
      preexistingDatabaseRefused: true,
    },
    cleanup: {
      policy: LOGICAL_RESTORE_COMPANION_CLEANUP_POLICY,
      drop: "pass",
      databaseAbsenceConfirmed: true,
      ownershipMarkerVerifiedBeforeDrop: true,
      completedAtUtc: cleanupCompletedAtUtc,
    },
    tools,
    limitations: {
      evidenceScope: LOGICAL_RESTORE_COMPANION_SCOPE,
      productionTargetExecution: false,
      exactProductionTargetExecutionClaimed: false,
      statement: LOGICAL_RESTORE_COMPANION_LIMITATION,
    },
  };
  validateLogicalRestoreCompanionReceipt(receipt, {
    now: new Date(cleanupCompletedAtUtc),
  });
  return receipt;
}

/**
 * Runs the mutation-bearing comparison session with injected operations. This
 * is exported so cleanup behavior can be exhaustively tested without creating
 * a database. Production callers should use runControlledLogicalRestoreCompanion.
 */
export async function executeLogicalRestoreComparisonSession({
  backup,
  cloneName,
  clock = () => new Date(),
  operations,
  outputPath,
  ownershipMarkerSha256: ownershipMarkerDigest,
  reverifyEvidence = async () => {},
  reverifyTools = async () => {},
  sourceDatabaseName,
  sourceDatabaseUrl,
  structuralRestore,
  tools,
}) {
  if (!SAFE_DATABASE_NAME.test(cloneName)) {
    fail("CLONE_NAME", "generated clone name is invalid");
  }
  sha256(ownershipMarkerDigest, "clone ownership marker SHA-256");
  validatePrivateOutputPath(outputPath);
  let cleanupArmed = false;
  let createdFresh = false;
  let primaryFailure;
  let cleanupFailure;
  let ownershipMarkerVerifiedBeforeDrop = false;
  let comparisonStartedAtUtc;
  let comparisonCompletedAtUtc;
  let logicalCloneRehearsal;
  let logicalComparisonProof;
  let postRehearsalRestoredSummary;
  let postRehearsalSourceSummary;
  let postRehearsalVerifiedAtUtc;
  let sourceSummary;
  let restoredSummary;
  try {
    await operations.assertAbsent(cloneName);
    await operations.assertContinue?.();
    cleanupArmed = true;
    await operations.create(cloneName);
    createdFresh = true;
    await operations.assertContinue?.();
    await operations.restore(cloneName);
    await operations.assertContinue?.();
    comparisonStartedAtUtc = clock().toISOString();
    const firstSourceDigest = await operations.digest(sourceDatabaseUrl);
    const restoredDigest = await operations.digest(
      operations.cloneDatabaseUrl(cloneName),
    );
    const finalSourceDigest = await operations.digest(sourceDatabaseUrl);
    const firstSourceSummary = digestSummary(
      firstSourceDigest,
      sourceDatabaseName,
      tools.executedTools.psqlBinarySha256,
    );
    sourceSummary = digestSummary(
      finalSourceDigest,
      sourceDatabaseName,
      tools.executedTools.psqlBinarySha256,
    );
    restoredSummary = digestSummary(
      restoredDigest,
      cloneName,
      tools.executedTools.psqlBinarySha256,
    );
    if (!canonicalEqual(firstSourceSummary, sourceSummary)) {
      fail(
        "SOURCE_DRIFT",
        "source logical state changed during the comparison",
      );
    }
    assertSameDatabaseSystem(finalSourceDigest, restoredDigest);
    if (
      sourceSummary.contentStateSha256 !== restoredSummary.contentStateSha256 ||
      sourceSummary.relationCount !== restoredSummary.relationCount ||
      sourceSummary.totalRowCount !== restoredSummary.totalRowCount ||
      sourceSummary.sequenceCount !== restoredSummary.sequenceCount ||
      sourceSummary.logicalStateSha256 === restoredSummary.logicalStateSha256
    ) {
      fail(
        "LOGICAL_MISMATCH",
        "source and restored logical comparison differs",
      );
    }
    comparisonCompletedAtUtc = clock().toISOString();
    await operations.assertContinue?.();
    logicalComparisonProof = sealLogicalRestoreComparisonProof({
      backup,
      restored: restoredSummary,
      source: sourceSummary,
      structuralRestore,
    });
    logicalCloneRehearsal = await operations.rehearse({
      cloneDatabaseUrl: operations.cloneDatabaseUrl(cloneName),
      comparisonCompletedAtUtc,
      logicalComparisonProof,
    });
    assertLogicalCloneRehearsalBinding({
      binding: logicalCloneRehearsal,
      comparisonCompletedAtUtc,
      logicalComparisonProof,
      now: new Date(),
      restoredContentStateSha256: restoredSummary.contentStateSha256,
      tools,
    });
    await operations.assertContinue?.();
    const postRehearsalRestoredDigest = await operations.digest(
      operations.cloneDatabaseUrl(cloneName),
    );
    const postRehearsalSourceDigest =
      await operations.digest(sourceDatabaseUrl);
    postRehearsalRestoredSummary = digestSummary(
      postRehearsalRestoredDigest,
      cloneName,
      tools.executedTools.psqlBinarySha256,
    );
    postRehearsalSourceSummary = digestSummary(
      postRehearsalSourceDigest,
      sourceDatabaseName,
      tools.executedTools.psqlBinarySha256,
    );
    assertSameDatabaseSystem(
      postRehearsalSourceDigest,
      postRehearsalRestoredDigest,
    );
    if (
      !canonicalEqual(postRehearsalRestoredSummary, restoredSummary) ||
      !canonicalEqual(postRehearsalSourceSummary, sourceSummary)
    ) {
      fail(
        "REHEARSAL_RESIDUE",
        "logical-clone rehearsal or concurrent source activity changed logical state",
      );
    }
    const postDigestRehearsal = await operations.reverifyRehearsal({
      expectedBinding: logicalCloneRehearsal,
      phase: "post-digest",
    });
    assertLogicalCloneRehearsalBinding({
      binding: postDigestRehearsal,
      comparisonCompletedAtUtc,
      logicalComparisonProof,
      now: new Date(),
      restoredContentStateSha256: restoredSummary.contentStateSha256,
      tools,
    });
    if (!canonicalEqual(postDigestRehearsal, logicalCloneRehearsal)) {
      fail("REHEARSAL_DRIFT", "logical-clone rehearsal receipt changed");
    }
    postRehearsalVerifiedAtUtc = clock().toISOString();
    await operations.assertContinue?.();
  } catch (error) {
    primaryFailure = safeFailure(
      error,
      "COMPARISON_FAILED",
      "logical restore comparison failed",
    );
  } finally {
    if (cleanupArmed) {
      try {
        const dropDecision = await operations.drop(cloneName);
        ownershipMarkerVerifiedBeforeDrop = dropDecision === "owned";
        if (!(await operations.confirmAbsent(cloneName))) {
          fail("CLEANUP_ABSENCE", "disposable clone absence was not confirmed");
        }
      } catch (error) {
        cleanupFailure = safeFailure(
          error,
          "CLEANUP_FAILED",
          "disposable clone cleanup failed",
        );
      }
    }
  }
  if (cleanupFailure) throw cleanupFailure;
  if (primaryFailure) throw primaryFailure;
  if (
    !createdFresh ||
    !ownershipMarkerVerifiedBeforeDrop ||
    !logicalCloneRehearsal ||
    !logicalComparisonProof ||
    !postRehearsalRestoredSummary ||
    !postRehearsalSourceSummary ||
    !postRehearsalVerifiedAtUtc ||
    !sourceSummary ||
    !restoredSummary
  ) {
    fail(
      "COMPARISON_INCOMPLETE",
      "logical restore comparison did not complete",
    );
  }
  await operations.assertContinue?.();
  await reverifyEvidence();
  await reverifyTools();
  const finalRehearsal = await operations.reverifyRehearsal({
    expectedBinding: logicalCloneRehearsal,
    phase: "pre-publication",
  });
  assertLogicalCloneRehearsalBinding({
    binding: finalRehearsal,
    comparisonCompletedAtUtc,
    logicalComparisonProof,
    now: new Date(),
    restoredContentStateSha256: restoredSummary.contentStateSha256,
    tools,
  });
  if (!canonicalEqual(finalRehearsal, logicalCloneRehearsal)) {
    fail("REHEARSAL_DRIFT", "logical-clone rehearsal receipt changed");
  }
  logicalCloneRehearsal = finalRehearsal;
  await operations.assertContinue?.();
  const cleanupCompletedAtUtc = clock().toISOString();
  const receipt = buildReceipt({
    backup,
    cleanupCompletedAtUtc,
    cloneName,
    comparisonCompletedAtUtc,
    comparisonStartedAtUtc,
    logicalCloneRehearsal,
    logicalComparisonProofSha256:
      logicalComparisonProof.logicalComparisonProofSha256,
    ownershipMarkerDigest,
    postRehearsalRestored: postRehearsalRestoredSummary,
    postRehearsalSource: postRehearsalSourceSummary,
    postRehearsalVerifiedAtUtc,
    restored: restoredSummary,
    source: sourceSummary,
    structuralRestore,
    tools,
  });
  const publication = publishAtomicPrivateCanonicalReceipt(outputPath, receipt);
  return { receipt, receiptSha256: publication.receiptSha256 };
}

function requiredEnvironment(env, name) {
  const value = env[name];
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    /[\0\r\n]/.test(value)
  ) {
    fail("ENVIRONMENT_REQUIRED", `${name} is required`);
  }
  return value;
}

function controlledEnvironmentInput(env) {
  const input = {
    ack: requiredEnvironment(env, "LOGICAL_RESTORE_ACK"),
    adminDatabaseUrl: requiredEnvironment(env, "DATABASE_RESTORE_ADMIN_URL"),
    dumpPath: requiredEnvironment(env, "LOGICAL_RESTORE_DUMP_PATH"),
    metadataBindingPath: requiredEnvironment(
      env,
      "LOGICAL_RESTORE_METADATA_BINDING_PATH",
    ),
    metadataPath: requiredEnvironment(env, "LOGICAL_RESTORE_METADATA_PATH"),
    expectedDumpBytes: requiredEnvironment(
      env,
      "LOGICAL_RESTORE_EXPECTED_DUMP_BYTES",
    ),
    expectedDumpSha256: requiredEnvironment(
      env,
      "LOGICAL_RESTORE_EXPECTED_DUMP_SHA256",
    ),
    expectedMetadataSha256: requiredEnvironment(
      env,
      "LOGICAL_RESTORE_EXPECTED_METADATA_SHA256",
    ),
    expectedSourceRegistrationApplyRunnerSha256: requiredEnvironment(
      env,
      "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_APPLY_RUNNER_SHA256",
    ),
    expectedSourceRegistrationApplyRuntimeSha256: requiredEnvironment(
      env,
      "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_APPLY_RUNTIME_SHA256",
    ),
    expectedSourceRegistrationLauncherSha256: requiredEnvironment(
      env,
      "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_LAUNCHER_SHA256",
    ),
    expectedSourceRegistrationLocalRuntimeClosureSha256: requiredEnvironment(
      env,
      "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_LOCAL_RUNTIME_CLOSURE_SHA256",
    ),
    expectedSourceRegistrationLogicalCloneRehearsalRuntimeSha256:
      requiredEnvironment(
        env,
        "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_REHEARSAL_RUNTIME_SHA256",
      ),
    expectedSourceRegistrationLogicalCloneRehearsalSchemaSha256:
      requiredEnvironment(
        env,
        "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_REHEARSAL_SCHEMA_SHA256",
      ),
    expectedSourceRegistrationLogicalCloneRehearsalCommandRunnerSha256:
      requiredEnvironment(
        env,
        "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_REHEARSAL_COMMAND_RUNNER_SHA256",
      ),
    expectedSourceRegistrationLogicalCloneRehearsalTestSha256:
      requiredEnvironment(
        env,
        "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_REHEARSAL_TEST_SHA256",
      ),
    expectedSourceRegistrationNodeBinarySha256: requiredEnvironment(
      env,
      "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_BINARY_SHA256",
    ),
    expectedSourceRegistrationNodeModulesTreeSha256: requiredEnvironment(
      env,
      "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_MODULES_TREE_SHA256",
    ),
    expectedSourceRegistrationNodeRuntimeClosureSha256: requiredEnvironment(
      env,
      "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_RUNTIME_CLOSURE_SHA256",
    ),
    expectedSourceRegistrationNodeRuntimeManifestSha256: requiredEnvironment(
      env,
      "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_RUNTIME_MANIFEST_SHA256",
    ),
    expectedSourceRegistrationNodeRuntimeVerifierSha256: requiredEnvironment(
      env,
      "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_RUNTIME_VERIFIER_SHA256",
    ),
    expectedSourceRegistrationPrismaGeneratedClientTreeSha256:
      requiredEnvironment(
        env,
        "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_PRISMA_CLIENT_TREE_SHA256",
      ),
    expectedSourceRegistrationRuntimeAttestationSha256: requiredEnvironment(
      env,
      "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_RUNTIME_ATTESTATION_SHA256",
    ),
    expectedStructuralCompletedAtUtc: requiredEnvironment(
      env,
      "LOGICAL_RESTORE_EXPECTED_STRUCTURAL_COMPLETED_AT_UTC",
    ),
    expectedStructuralReceiptSha256: requiredEnvironment(
      env,
      "LOGICAL_RESTORE_EXPECTED_STRUCTURAL_RECEIPT_SHA256",
    ),
    outputPath: requiredEnvironment(
      env,
      "LOGICAL_RESTORE_COMPANION_RECEIPT_PATH",
    ),
    primaryCorpusRoot: requiredEnvironment(
      env,
      "LOGICAL_RESTORE_PRIMARY_CORPUS_ROOT",
    ),
    rehearsalOutputPath: requiredEnvironment(
      env,
      "LOGICAL_RESTORE_REHEARSAL_RECEIPT_PATH",
    ),
    replicaCorpusRoot: requiredEnvironment(
      env,
      "LOGICAL_RESTORE_REPLICA_CORPUS_ROOT",
    ),
    sourceDatabaseUrl: requiredEnvironment(env, "DATABASE_URL"),
    structuralReceiptPath: requiredEnvironment(
      env,
      "LOGICAL_RESTORE_STRUCTURAL_RECEIPT_PATH",
    ),
  };
  if (input.ack !== CONTROLLED_LOGICAL_RESTORE_ACK) {
    fail("ACK_REQUIRED", "exact logical restore acknowledgement is required");
  }
  if (!/^[1-9]\d*$/.test(input.expectedDumpBytes)) {
    fail("EXPECTED_EVIDENCE_BINDING", "expected dump bytes are invalid");
  }
  input.expectedDumpBytes = Number(input.expectedDumpBytes);
  nonNegativeInteger(input.expectedDumpBytes, "expected dump bytes", {
    positive: true,
  });
  sha256(input.expectedDumpSha256, "expected dump SHA-256");
  sha256(input.expectedMetadataSha256, "expected metadata SHA-256");
  for (const [key, value] of Object.entries(input)) {
    if (key.startsWith("expectedSourceRegistration")) {
      sha256(value, `${key} SHA-256`);
    }
  }
  sha256(
    input.expectedStructuralReceiptSha256,
    "expected structural receipt SHA-256",
  );
  timestamp(
    input.expectedStructuralCompletedAtUtc,
    "expected structural completion time",
  );
  if (input.outputPath === input.rehearsalOutputPath) {
    fail("RECEIPT_PATH_COLLISION", "private receipt outputs must be distinct");
  }
  return input;
}

/**
 * Production entry point. Private paths and both database URLs are accepted
 * only from environment values. No path or credential is returned.
 */
export async function runControlledLogicalRestoreCompanion({
  abortSignal,
  env = process.env,
} = {}) {
  const input = controlledEnvironmentInput(env);
  validatePrivateOutputPath(input.outputPath);
  validatePrivateOutputPath(
    input.rehearsalOutputPath,
    "logical-clone rehearsal receipt output",
  );
  const sourceConnection = parsePostgresUrl(
    input.sourceDatabaseUrl,
    "source database URL",
  );
  const adminConnection = parsePostgresUrl(
    input.adminDatabaseUrl,
    "restore admin database URL",
  );
  if (
    adminConnection.databaseName !== "postgres" ||
    sourceConnection.host !== adminConnection.host ||
    sourceConnection.port !== adminConnection.port
  ) {
    fail(
      "DATABASE_TARGET",
      "source and restore admin endpoints are not the controlled target",
    );
  }
  const evidence = await loadAndVerifyBackupEvidence(input);
  if (
    evidence.backup.dumpBytes !== input.expectedDumpBytes ||
    evidence.backup.dumpSha256 !== input.expectedDumpSha256 ||
    evidence.backup.metadataSha256 !== input.expectedMetadataSha256 ||
    evidence.structuralRestore.receiptSha256 !==
      input.expectedStructuralReceiptSha256 ||
    evidence.structuralRestore.completedAtUtc !==
      input.expectedStructuralCompletedAtUtc
  ) {
    fail(
      "EXPECTED_EVIDENCE_BINDING",
      "private backup or structural restore evidence differs from expected",
    );
  }
  if (sourceConnection.databaseName !== evidence.metadata.source.databaseName) {
    fail("DATABASE_TARGET", "source database differs from backup metadata");
  }
  const toolBindings = await loadToolBindings();
  const rehearsalContext = await prepareSourceRegistrationRehearsal({
    input,
    toolBindings,
  });
  const ownershipToken = randomBytes(32).toString("hex");
  const operations = createProductionOperations({
    abortSignal,
    adminConnection,
    dumpIdentity: evidence.dumpIdentity,
    dumpPath: input.dumpPath,
    executables: toolBindings.executables,
    ownershipToken,
    rehearsalContext,
  });
  await operations.catalog();
  const cloneName = controlledCloneName();
  return executeLogicalRestoreComparisonSession({
    backup: evidence.backup,
    cloneName,
    operations,
    outputPath: input.outputPath,
    ownershipMarkerSha256: ownershipMarkerSha256(ownershipToken),
    reverifyEvidence: async () => {
      const rechecked = await loadAndVerifyBackupEvidence(input);
      if (
        !canonicalEqual(rechecked.backup, evidence.backup) ||
        !canonicalEqual(
          rechecked.structuralRestore,
          evidence.structuralRestore,
        ) ||
        !sameFileIdentity(rechecked.dumpIdentity, evidence.dumpIdentity)
      ) {
        fail("EVIDENCE_DRIFT", "backup evidence changed during the comparison");
      }
    },
    reverifyTools: async () => {
      await assertToolBindingsStable(toolBindings);
      await rehearsalContext.assertRuntimeStable();
    },
    sourceDatabaseName: sourceConnection.databaseName,
    sourceDatabaseUrl: input.sourceDatabaseUrl,
    structuralRestore: evidence.structuralRestore,
    tools: toolBindings.tools,
  });
}

async function main() {
  if (process.argv.slice(2).length !== 0) {
    fail("ARGUMENTS_FORBIDDEN", "command-line arguments are forbidden");
  }
  const controller = new AbortController();
  let handledSignal = null;
  const handleSignal = (signal) => {
    if (handledSignal === null) handledSignal = signal;
    process.exitCode = controlledLogicalRestoreSignalExitCode(signal);
    controller.abort();
  };
  const handleSigint = () => handleSignal("SIGINT");
  const handleSigterm = () => handleSignal("SIGTERM");
  process.on("SIGINT", handleSigint);
  process.on("SIGTERM", handleSigterm);
  try {
    const result = await runControlledLogicalRestoreCompanion({
      abortSignal: controller.signal,
    });
    process.stdout.write(
      `${JSON.stringify({
        evidenceClass: LOGICAL_RESTORE_COMPANION_SCOPE,
        receiptSha256: result.receiptSha256,
        status: "pass",
      })}\n`,
    );
  } finally {
    process.removeListener("SIGINT", handleSigint);
    process.removeListener("SIGTERM", handleSigterm);
  }
  if (handledSignal === "SIGINT") process.exitCode = 130;
  if (handledSignal === "SIGTERM") process.exitCode = 143;
}

const invoked = process.argv[1]
  ? pathToFileURL(realpathSync(process.argv[1])).href
  : null;
if (invoked === import.meta.url) {
  main().catch((error) => {
    const safe = safeFailure(
      error,
      "CONTROLLED_FAILURE",
      "controlled logical restore companion failed",
    );
    process.stderr.write(`[logical-restore-companion] ERROR ${safe.code}\n`);
    if (![130, 143].includes(process.exitCode ?? 0)) process.exitCode = 1;
  });
}
