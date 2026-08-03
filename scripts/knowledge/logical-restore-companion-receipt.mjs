#!/usr/bin/env node

import { createHash } from "node:crypto";

export const LOGICAL_RESTORE_COMPANION_RECEIPT_FORMAT =
  "foodsystems-database-logical-restore-companion-receipt";
export const LOGICAL_RESTORE_COMPANION_RECEIPT_VERSION = 1;
export const LOGICAL_RESTORE_COMPANION_CANONICAL_JSON = "sorted-keys-v1";
export const LOGICAL_RESTORE_COMPANION_EVIDENCE_CLASS =
  "logical-comparison-surrogate-not-production-target-execution";
export const LOGICAL_RESTORE_COMPANION_SCOPE = "logical-comparison-surrogate";
export const LOGICAL_RESTORE_COMPANION_SEMANTIC =
  "same-logical-content-different-database-target-envelope";
export const LOGICAL_RESTORE_COMPANION_CLONE_CLASS =
  "foodsystems_restore_disposable_v1";
export const LOGICAL_RESTORE_COMPANION_CLONE_LABEL =
  "logical-restore-comparison-surrogate";
export const LOGICAL_RESTORE_COMPANION_OWNERSHIP_CLASS =
  "database-comment-capability-v1";
export const LOGICAL_RESTORE_COMPANION_CLEANUP_POLICY =
  "drop-and-confirm-absence-on-success-error-or-handled-signal";
export const LOGICAL_RESTORE_COMPANION_LIMITATION =
  "This receipt proves a disposable logical-restore comparison surrogate; it does not prove execution against the exact production target.";
export const LOGICAL_RESTORE_COMPARISON_PROOF_SCHEMA_VERSION =
  "source-registration-logical-comparison-proof-v1";
export const LOGICAL_RESTORE_COMPARISON_PROOF_DOMAIN =
  "food-systems-2026:source-registration-logical-comparison-proof:v1\0";
export const LOGICAL_RESTORE_REHEARSAL_SCHEMA_VERSION =
  "source-registration-logical-clone-rehearsal-v1";
export const LOGICAL_RESTORE_REHEARSAL_ARTIFACT_TYPE =
  "source_registration_logical_clone_surrogate_rehearsal_receipt";
export const LOGICAL_RESTORE_REHEARSAL_TARGET_CLASS = "logical_clone_surrogate";
export const LOGICAL_RESTORE_REHEARSAL_PLAN_SHA256 =
  "631fef2595bf8f9e897485c1f064654716a3bdb2591bbfb20227370d496a4e2f";
export const LOGICAL_RESTORE_REHEARSAL_PLAN_FILE_SHA256 =
  "7a8de0151ad9d0c77bb7bb47a01c3bd08922805e933a5b379aea3dd59b84def9";
export const LOGICAL_RESTORE_REHEARSAL_TARGET_SET_SHA256 =
  "41c41a249cc54f0cad6cb4906a5b97b9d755bcd27d8830a990ed1d4eecb7264f";
export const LOGICAL_RESTORE_REHEARSAL_OPERATION_DOMAIN =
  "food-systems-2026:source-registration-logical-clone-rehearsal-operation:v1\0";

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const ISO_UTC_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const MAX_COMPARISON_DURATION_MS = 6 * 60 * 60 * 1000;
const MAX_REHEARSAL_DURATION_MS = 15 * 60 * 1000;
const MAX_REHEARSAL_CONSUMPTION_LAG_MS = 15 * 60 * 1000;
const MAX_FUTURE_SKEW_MS = 5 * 60 * 1000;

const TOP_LEVEL_KEYS = Object.freeze([
  "backup",
  "canonicalJsonFormat",
  "cleanup",
  "clone",
  "comparison",
  "completedAtUtc",
  "evidenceClass",
  "format",
  "limitations",
  "logicalCloneRehearsal",
  "structuralRestore",
  "tools",
  "version",
]);
const BACKUP_KEYS = Object.freeze([
  "dumpBytes",
  "dumpSha256",
  "metadataCreatedAtUtc",
  "metadataFormat",
  "metadataSha256",
  "metadataVersion",
  "targetDatabaseFingerprintSha256",
]);
const STRUCTURAL_RESTORE_KEYS = Object.freeze([
  "completedAtUtc",
  "receiptFormat",
  "receiptSha256",
  "receiptVersion",
]);
const COMPARISON_KEYS = Object.freeze([
  "completedAtUtc",
  "contentStateEqual",
  "logicalStateEqual",
  "logicalComparisonProofSha256",
  "postRehearsalClone",
  "postRehearsalCloneFullStateMatched",
  "postRehearsalSource",
  "postRehearsalVerifiedAtUtc",
  "relationCountEqual",
  "restored",
  "semantic",
  "sequenceCountEqual",
  "source",
  "startedAtUtc",
  "sourceStillMatched",
  "totalRowCountEqual",
]);
const REHEARSAL_KEYS = Object.freeze([
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
const REHEARSAL_EXECUTED_RUNTIME_KEYS = Object.freeze([
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
const REHEARSAL_ROLLBACK_KEYS = Object.freeze([
  "afterCountsEqualBeforeCounts",
  "forcedBySentinel",
  "rehearsalAuditAbsentAfterRollback",
  "rollbackAbsenceConfirmed",
  "targetRowsAbsentAfterRollback",
  "transactionRolledBack",
]);
const DIGEST_KEYS = Object.freeze([
  "contentStateSha256",
  "logicalStateSha256",
  "psqlFileSha256",
  "relationCount",
  "sequenceCount",
  "totalRowCount",
]);
const CLONE_KEYS = Object.freeze([
  "createdFresh",
  "label",
  "nameClass",
  "nameSha256",
  "ownershipMarkerClass",
  "ownershipMarkerSha256",
  "preexistingDatabaseRefused",
]);
const CLEANUP_KEYS = Object.freeze([
  "completedAtUtc",
  "databaseAbsenceConfirmed",
  "drop",
  "ownershipMarkerVerifiedBeforeDrop",
  "policy",
]);
export const LOGICAL_RESTORE_COMPANION_EXECUTED_TOOL_KEYS = Object.freeze([
  "companionReceiptValidatorSha256",
  "companionRunnerSha256",
  "createdbBinarySha256",
  "databaseLogicalDigestSha256",
  "dropdbBinarySha256",
  "pgRestoreBinarySha256",
  "psqlBinarySha256",
  "psqlRuntimeClosureSha256",
  "psqlRuntimeManifestSha256",
  "psqlRuntimeVerifierSha256",
  "sourceRegistrationApplyRunnerSha256",
  "sourceRegistrationApplyRuntimeSha256",
  "sourceRegistrationLauncherSha256",
  "sourceRegistrationLocalRuntimeClosureSha256",
  "sourceRegistrationLogicalCloneRehearsalRuntimeSha256",
  "sourceRegistrationLogicalCloneRehearsalSchemaSha256",
  "sourceRegistrationLogicalCloneRehearsalCommandRunnerSha256",
  "sourceRegistrationNodeBinarySha256",
  "sourceRegistrationNodeModulesTreeSha256",
  "sourceRegistrationNodeRuntimeClosureSha256",
  "sourceRegistrationNodeRuntimeManifestSha256",
  "sourceRegistrationNodeRuntimeVerifierSha256",
  "sourceRegistrationPrismaGeneratedClientTreeSha256",
  "sourceRegistrationRuntimeAttestationSha256",
]);
export const LOGICAL_RESTORE_COMPANION_CONTEXT_BINDING_KEYS = Object.freeze([
  "backupContractHelperSha256",
  "backupVerifierSha256",
  "companionReceiptSchemaSha256",
  "structuralRestoreRunnerSha256",
  "sourceRegistrationLogicalCloneRehearsalTestSha256",
]);
const TOOL_KEYS = Object.freeze(["contextBindings", "executedTools"]);
const LIMITATION_KEYS = Object.freeze([
  "evidenceScope",
  "exactProductionTargetExecutionClaimed",
  "productionTargetExecution",
  "statement",
]);

function fail(message) {
  throw new Error(`Logical restore companion receipt failed: ${message}`);
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function exactObject(value, keys, label) {
  if (!isPlainObject(value)) fail(`${label} must be an object`);
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    fail(`${label} has an unexpected shape`);
  }
  return value;
}

export function canonicalLogicalRestoreCompanionJson(value) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value))
      fail("canonical JSON contains a non-finite number");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value
      .map((item) => canonicalLogicalRestoreCompanionJson(item))
      .join(",")}]`;
  }
  if (isPlainObject(value)) {
    return `{${Object.keys(value)
      .sort()
      .map(
        (key) =>
          `${JSON.stringify(key)}:${canonicalLogicalRestoreCompanionJson(value[key])}`,
      )
      .join(",")}}`;
  }
  fail("canonical JSON contains an unsupported value");
}

export function logicalRestoreCompanionSha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Builds the proof bound into both the rehearsal and final companion receipt.
 * The final receipt hash is intentionally excluded to avoid a hash cycle.
 */
export function sealLogicalRestoreComparisonProof({
  backup,
  restored,
  source,
  structuralRestore,
}) {
  const summarize = (digest) => ({
    contentStateSha256: digest.contentStateSha256,
    logicalStateSha256: digest.logicalStateSha256,
    relationCount: digest.relationCount,
    sequenceRowCount: digest.sequenceCount,
    totalRowCount: digest.totalRowCount,
  });
  const body = {
    backupMetadataSha256: backup.metadataSha256,
    backupSha256: backup.dumpSha256,
    contentStateAndCountsMatch: true,
    restored: summarize(restored),
    schemaVersion: LOGICAL_RESTORE_COMPARISON_PROOF_SCHEMA_VERSION,
    source: summarize(source),
    structuralRestoreReceiptSha256: structuralRestore.receiptSha256,
    targetBoundLogicalStatesDiffer: true,
  };
  return {
    ...body,
    logicalComparisonProofSha256: logicalRestoreCompanionSha256(
      `${LOGICAL_RESTORE_COMPARISON_PROOF_DOMAIN}${canonicalLogicalRestoreCompanionJson(
        body,
      )}`,
    ),
  };
}

export function logicalRestoreComparisonProofSha256(input) {
  return sealLogicalRestoreComparisonProof(input).logicalComparisonProofSha256;
}

export function logicalRestoreRehearsalOperationKey({
  applyRunnerSha256,
  logicalComparisonProofSha256,
  rehearsalCommandRunnerSha256,
  rehearsalRuntimeSha256,
  rehearsalSchemaSha256,
  rehearsalTestSha256,
  runtimeAttestationSha256,
}) {
  const body = {
    applyRunnerSha256,
    logicalComparisonProofSha256,
    planSha256: LOGICAL_RESTORE_REHEARSAL_PLAN_SHA256,
    rehearsalCommandRunnerSha256,
    rehearsalRuntimeSha256,
    rehearsalSchemaSha256,
    rehearsalTestSha256,
    runtimeAttestationSha256,
    targetSetSha256: LOGICAL_RESTORE_REHEARSAL_TARGET_SET_SHA256,
  };
  return `${LOGICAL_RESTORE_REHEARSAL_SCHEMA_VERSION}:${logicalRestoreCompanionSha256(
    `${LOGICAL_RESTORE_REHEARSAL_OPERATION_DOMAIN}${canonicalLogicalRestoreCompanionJson(
      body,
    )}`,
  )}`;
}

function sha256(value, label) {
  if (typeof value !== "string" || !SHA256_PATTERN.test(value)) {
    fail(`${label} must be a lowercase SHA-256`);
  }
  return value;
}

function nonNegativeInteger(value, label, { positive = false } = {}) {
  if (!Number.isSafeInteger(value) || value < 0 || (positive && value === 0)) {
    fail(
      `${label} must be a ${positive ? "positive" : "non-negative"} safe integer`,
    );
  }
  return value;
}

function timestamp(value, label) {
  if (typeof value !== "string" || !ISO_UTC_PATTERN.test(value)) {
    fail(`${label} must be a canonical UTC timestamp`);
  }
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed) || new Date(parsed).toISOString() !== value) {
    fail(`${label} is not a real canonical UTC timestamp`);
  }
  return parsed;
}

function assertLiteral(value, expected, label) {
  if (value !== expected) fail(`${label} is invalid`);
}

function validateDigest(value, label) {
  const digest = exactObject(value, DIGEST_KEYS, label);
  sha256(digest.contentStateSha256, `${label}.contentStateSha256`);
  sha256(digest.logicalStateSha256, `${label}.logicalStateSha256`);
  sha256(digest.psqlFileSha256, `${label}.psqlFileSha256`);
  nonNegativeInteger(digest.relationCount, `${label}.relationCount`, {
    positive: true,
  });
  nonNegativeInteger(digest.totalRowCount, `${label}.totalRowCount`, {
    positive: true,
  });
  nonNegativeInteger(digest.sequenceCount, `${label}.sequenceCount`);
  return digest;
}

function assertReceiptContainsNoPathOrCredentialMaterial(value) {
  const serialized = JSON.stringify(value);
  const forbidden = [
    /postgres(?:ql)?:\/\//i,
    /:\/\//,
    /(?:^|["'])\/(?:Users|Volumes|private|tmp|var|home|opt|usr|etc)\//i,
    /[A-Za-z]:\\/,
    /\\\\/,
    /(?:password|passwd|pgpass|credential|database_url|databaseurl)/i,
    /(?:access[_-]?token|secret[_-]?key|private[_-]?key)/i,
  ];
  if (forbidden.some((pattern) => pattern.test(serialized))) {
    fail("receipt contains path or credential material");
  }
}

/**
 * Strictly validates the semantic v1 receipt contract. JSON Schema validation
 * is complementary; this function enforces cross-field equality and time
 * ordering that JSON Schema cannot express.
 *
 * @param {unknown} value
 * @param {{ now?: Date, maxReceiptAgeMs?: number }} [options]
 */
export function validateLogicalRestoreCompanionReceipt(
  value,
  { now = new Date(), maxReceiptAgeMs } = {},
) {
  const receipt = exactObject(value, TOP_LEVEL_KEYS, "receipt");
  assertLiteral(
    receipt.format,
    LOGICAL_RESTORE_COMPANION_RECEIPT_FORMAT,
    "receipt.format",
  );
  assertLiteral(
    receipt.version,
    LOGICAL_RESTORE_COMPANION_RECEIPT_VERSION,
    "receipt.version",
  );
  assertLiteral(
    receipt.canonicalJsonFormat,
    LOGICAL_RESTORE_COMPANION_CANONICAL_JSON,
    "receipt.canonicalJsonFormat",
  );
  assertLiteral(
    receipt.evidenceClass,
    LOGICAL_RESTORE_COMPANION_EVIDENCE_CLASS,
    "receipt.evidenceClass",
  );

  const backup = exactObject(receipt.backup, BACKUP_KEYS, "receipt.backup");
  nonNegativeInteger(backup.dumpBytes, "receipt.backup.dumpBytes", {
    positive: true,
  });
  sha256(backup.dumpSha256, "receipt.backup.dumpSha256");
  sha256(backup.metadataSha256, "receipt.backup.metadataSha256");
  sha256(
    backup.targetDatabaseFingerprintSha256,
    "receipt.backup.targetDatabaseFingerprintSha256",
  );
  assertLiteral(
    backup.metadataFormat,
    "foodsystems-database-backup-metadata",
    "receipt.backup.metadataFormat",
  );
  assertLiteral(backup.metadataVersion, 2, "receipt.backup.metadataVersion");
  const metadataAt = timestamp(
    backup.metadataCreatedAtUtc,
    "receipt.backup.metadataCreatedAtUtc",
  );

  const structural = exactObject(
    receipt.structuralRestore,
    STRUCTURAL_RESTORE_KEYS,
    "receipt.structuralRestore",
  );
  sha256(structural.receiptSha256, "receipt.structuralRestore.receiptSha256");
  assertLiteral(
    structural.receiptFormat,
    "foodsystems-database-restore-receipt",
    "receipt.structuralRestore.receiptFormat",
  );
  assertLiteral(
    structural.receiptVersion,
    1,
    "receipt.structuralRestore.receiptVersion",
  );
  const structuralAt = timestamp(
    structural.completedAtUtc,
    "receipt.structuralRestore.completedAtUtc",
  );

  const comparison = exactObject(
    receipt.comparison,
    COMPARISON_KEYS,
    "receipt.comparison",
  );
  const comparisonStartedAt = timestamp(
    comparison.startedAtUtc,
    "receipt.comparison.startedAtUtc",
  );
  const comparisonCompletedAt = timestamp(
    comparison.completedAtUtc,
    "receipt.comparison.completedAtUtc",
  );
  const source = validateDigest(comparison.source, "receipt.comparison.source");
  const restored = validateDigest(
    comparison.restored,
    "receipt.comparison.restored",
  );
  const postRehearsalClone = validateDigest(
    comparison.postRehearsalClone,
    "receipt.comparison.postRehearsalClone",
  );
  const postRehearsalSource = validateDigest(
    comparison.postRehearsalSource,
    "receipt.comparison.postRehearsalSource",
  );
  const postRehearsalVerifiedAt = timestamp(
    comparison.postRehearsalVerifiedAtUtc,
    "receipt.comparison.postRehearsalVerifiedAtUtc",
  );
  sha256(
    comparison.logicalComparisonProofSha256,
    "receipt.comparison.logicalComparisonProofSha256",
  );
  assertLiteral(
    comparison.semantic,
    LOGICAL_RESTORE_COMPANION_SEMANTIC,
    "receipt.comparison.semantic",
  );
  for (const key of [
    "contentStateEqual",
    "relationCountEqual",
    "totalRowCountEqual",
    "sequenceCountEqual",
    "postRehearsalCloneFullStateMatched",
    "sourceStillMatched",
  ]) {
    assertLiteral(comparison[key], true, `receipt.comparison.${key}`);
  }
  assertLiteral(
    comparison.logicalStateEqual,
    false,
    "receipt.comparison.logicalStateEqual",
  );
  if (
    source.contentStateSha256 !== restored.contentStateSha256 ||
    source.relationCount !== restored.relationCount ||
    source.totalRowCount !== restored.totalRowCount ||
    source.sequenceCount !== restored.sequenceCount
  ) {
    fail("source and restored logical content or counts differ");
  }
  if (source.logicalStateSha256 === restored.logicalStateSha256) {
    fail("source and restored target-bound logical states must differ");
  }
  if (
    canonicalLogicalRestoreCompanionJson(postRehearsalClone) !==
      canonicalLogicalRestoreCompanionJson(restored) ||
    canonicalLogicalRestoreCompanionJson(postRehearsalSource) !==
      canonicalLogicalRestoreCompanionJson(source)
  ) {
    fail("post-rehearsal clone or source full logical state differs");
  }
  const expectedComparisonProofSha256 = logicalRestoreComparisonProofSha256({
    backup,
    restored,
    source,
    structuralRestore: structural,
  });
  if (
    comparison.logicalComparisonProofSha256 !== expectedComparisonProofSha256
  ) {
    fail("logical comparison proof hash differs from the receipt evidence");
  }

  const rehearsal = exactObject(
    receipt.logicalCloneRehearsal,
    REHEARSAL_KEYS,
    "receipt.logicalCloneRehearsal",
  );
  assertLiteral(
    rehearsal.schemaVersion,
    LOGICAL_RESTORE_REHEARSAL_SCHEMA_VERSION,
    "receipt.logicalCloneRehearsal.schemaVersion",
  );
  assertLiteral(
    rehearsal.artifactType,
    LOGICAL_RESTORE_REHEARSAL_ARTIFACT_TYPE,
    "receipt.logicalCloneRehearsal.artifactType",
  );
  assertLiteral(
    rehearsal.targetClass,
    LOGICAL_RESTORE_REHEARSAL_TARGET_CLASS,
    "receipt.logicalCloneRehearsal.targetClass",
  );
  assertLiteral(
    rehearsal.canonicalJsonFormat,
    LOGICAL_RESTORE_COMPANION_CANONICAL_JSON,
    "receipt.logicalCloneRehearsal.canonicalJsonFormat",
  );
  for (const key of [
    "exactProductionTargetExercised",
    "productionAuthorizationUsed",
  ]) {
    assertLiteral(
      rehearsal[key],
      false,
      `receipt.logicalCloneRehearsal.${key}`,
    );
  }
  for (const key of [
    "firstExactMutationRemainsLive",
    "privateReceiptStoredOutsideRepo",
  ]) {
    assertLiteral(rehearsal[key], true, `receipt.logicalCloneRehearsal.${key}`);
  }
  assertLiteral(
    rehearsal.planSha256,
    LOGICAL_RESTORE_REHEARSAL_PLAN_SHA256,
    "receipt.logicalCloneRehearsal.planSha256",
  );
  assertLiteral(
    rehearsal.planFileSha256,
    LOGICAL_RESTORE_REHEARSAL_PLAN_FILE_SHA256,
    "receipt.logicalCloneRehearsal.planFileSha256",
  );
  assertLiteral(
    rehearsal.targetSetSha256,
    LOGICAL_RESTORE_REHEARSAL_TARGET_SET_SHA256,
    "receipt.logicalCloneRehearsal.targetSetSha256",
  );
  for (const key of [
    "targetSetSha256",
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
  ]) {
    sha256(rehearsal[key], `receipt.logicalCloneRehearsal.${key}`);
  }
  const rehearsalExecutedRuntime = exactObject(
    rehearsal.executedRuntime,
    REHEARSAL_EXECUTED_RUNTIME_KEYS,
    "receipt.logicalCloneRehearsal.executedRuntime",
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
    sha256(
      rehearsalExecutedRuntime[key],
      `receipt.logicalCloneRehearsal.executedRuntime.${key}`,
    );
  }
  if (
    typeof rehearsalExecutedRuntime.nodeVersion !== "string" ||
    !/^v\d+\.\d+\.\d+$/.test(rehearsalExecutedRuntime.nodeVersion) ||
    typeof rehearsalExecutedRuntime.nodePlatform !== "string" ||
    !/^[A-Za-z0-9._-]+$/.test(rehearsalExecutedRuntime.nodePlatform) ||
    typeof rehearsalExecutedRuntime.nodeArch !== "string" ||
    !/^[A-Za-z0-9._-]+$/.test(rehearsalExecutedRuntime.nodeArch)
  ) {
    fail("receipt.logicalCloneRehearsal.executedRuntime text is invalid");
  }
  if (
    typeof rehearsal.operationKey !== "string" ||
    !/^source-registration-logical-clone-rehearsal-v1:[a-f0-9]{64}$/.test(
      rehearsal.operationKey,
    )
  ) {
    fail("receipt.logicalCloneRehearsal.operationKey is invalid");
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
    fail("receipt.logicalCloneRehearsal.operationKey binding differs");
  }
  const rehearsalStartedAt = timestamp(
    rehearsal.rehearsalStartedAtUtc,
    "receipt.logicalCloneRehearsal.rehearsalStartedAtUtc",
  );
  const rehearsalCompletedAt = timestamp(
    rehearsal.rehearsalCompletedAtUtc,
    "receipt.logicalCloneRehearsal.rehearsalCompletedAtUtc",
  );
  const rehearsalRollback = exactObject(
    rehearsal.rollback,
    REHEARSAL_ROLLBACK_KEYS,
    "receipt.logicalCloneRehearsal.rollback",
  );
  for (const key of REHEARSAL_ROLLBACK_KEYS) {
    assertLiteral(
      rehearsalRollback[key],
      true,
      `receipt.logicalCloneRehearsal.rollback.${key}`,
    );
  }
  if (
    rehearsal.logicalCloneContentStateSha256 !== restored.contentStateSha256 ||
    rehearsal.logicalComparisonProofSha256 !==
      comparison.logicalComparisonProofSha256
  ) {
    fail("logical-clone rehearsal binding differs from the comparison proof");
  }

  const clone = exactObject(receipt.clone, CLONE_KEYS, "receipt.clone");
  assertLiteral(
    clone.nameClass,
    LOGICAL_RESTORE_COMPANION_CLONE_CLASS,
    "receipt.clone.nameClass",
  );
  assertLiteral(
    clone.label,
    LOGICAL_RESTORE_COMPANION_CLONE_LABEL,
    "receipt.clone.label",
  );
  sha256(clone.nameSha256, "receipt.clone.nameSha256");
  assertLiteral(
    clone.ownershipMarkerClass,
    LOGICAL_RESTORE_COMPANION_OWNERSHIP_CLASS,
    "receipt.clone.ownershipMarkerClass",
  );
  sha256(clone.ownershipMarkerSha256, "receipt.clone.ownershipMarkerSha256");
  assertLiteral(clone.createdFresh, true, "receipt.clone.createdFresh");
  assertLiteral(
    clone.preexistingDatabaseRefused,
    true,
    "receipt.clone.preexistingDatabaseRefused",
  );

  const cleanup = exactObject(receipt.cleanup, CLEANUP_KEYS, "receipt.cleanup");
  assertLiteral(
    cleanup.policy,
    LOGICAL_RESTORE_COMPANION_CLEANUP_POLICY,
    "receipt.cleanup.policy",
  );
  assertLiteral(cleanup.drop, "pass", "receipt.cleanup.drop");
  assertLiteral(
    cleanup.ownershipMarkerVerifiedBeforeDrop,
    true,
    "receipt.cleanup.ownershipMarkerVerifiedBeforeDrop",
  );
  assertLiteral(
    cleanup.databaseAbsenceConfirmed,
    true,
    "receipt.cleanup.databaseAbsenceConfirmed",
  );
  const cleanupAt = timestamp(
    cleanup.completedAtUtc,
    "receipt.cleanup.completedAtUtc",
  );

  const tools = exactObject(receipt.tools, TOOL_KEYS, "receipt.tools");
  const executedTools = exactObject(
    tools.executedTools,
    LOGICAL_RESTORE_COMPANION_EXECUTED_TOOL_KEYS,
    "receipt.tools.executedTools",
  );
  const contextBindings = exactObject(
    tools.contextBindings,
    LOGICAL_RESTORE_COMPANION_CONTEXT_BINDING_KEYS,
    "receipt.tools.contextBindings",
  );
  for (const key of LOGICAL_RESTORE_COMPANION_EXECUTED_TOOL_KEYS) {
    sha256(executedTools[key], `receipt.tools.executedTools.${key}`);
  }
  for (const key of LOGICAL_RESTORE_COMPANION_CONTEXT_BINDING_KEYS) {
    sha256(contextBindings[key], `receipt.tools.contextBindings.${key}`);
  }
  if (
    rehearsal.applyRunnerSha256 !==
    executedTools.sourceRegistrationApplyRunnerSha256
  ) {
    fail("logical-clone rehearsal apply-runner binding differs");
  }
  if (
    rehearsal.rehearsalCommandRunnerSha256 !==
      executedTools.sourceRegistrationLogicalCloneRehearsalCommandRunnerSha256 ||
    rehearsal.rehearsalRuntimeSha256 !==
      executedTools.sourceRegistrationLogicalCloneRehearsalRuntimeSha256 ||
    rehearsal.rehearsalSchemaSha256 !==
      executedTools.sourceRegistrationLogicalCloneRehearsalSchemaSha256 ||
    rehearsal.rehearsalTestSha256 !==
      contextBindings.sourceRegistrationLogicalCloneRehearsalTestSha256 ||
    rehearsal.runtimeAttestationSha256 !==
      executedTools.sourceRegistrationRuntimeAttestationSha256
  ) {
    fail("logical-clone rehearsal runtime or code binding differs");
  }
  if (
    rehearsal.runtimeAttestationSha256 !==
      rehearsalExecutedRuntime.runtimeAttestationSha256 ||
    rehearsalExecutedRuntime.launcherFileSha256 !==
      executedTools.sourceRegistrationLauncherSha256 ||
    rehearsalExecutedRuntime.localRuntimeClosureSha256 !==
      executedTools.sourceRegistrationLocalRuntimeClosureSha256 ||
    rehearsalExecutedRuntime.nodeBinaryFileSha256 !==
      executedTools.sourceRegistrationNodeBinarySha256 ||
    rehearsalExecutedRuntime.nodeModulesTreeSha256 !==
      executedTools.sourceRegistrationNodeModulesTreeSha256 ||
    rehearsalExecutedRuntime.nodeRuntimeClosureSha256 !==
      executedTools.sourceRegistrationNodeRuntimeClosureSha256 ||
    rehearsalExecutedRuntime.prismaGeneratedClientTreeSha256 !==
      executedTools.sourceRegistrationPrismaGeneratedClientTreeSha256
  ) {
    fail("logical-clone rehearsal full executed runtime binding differs");
  }
  if (
    source.psqlFileSha256 !== executedTools.psqlBinarySha256 ||
    restored.psqlFileSha256 !== executedTools.psqlBinarySha256 ||
    postRehearsalClone.psqlFileSha256 !== executedTools.psqlBinarySha256 ||
    postRehearsalSource.psqlFileSha256 !== executedTools.psqlBinarySha256
  ) {
    fail("digest psql binding differs from the verified psql binary");
  }

  const limitations = exactObject(
    receipt.limitations,
    LIMITATION_KEYS,
    "receipt.limitations",
  );
  assertLiteral(
    limitations.evidenceScope,
    LOGICAL_RESTORE_COMPANION_SCOPE,
    "receipt.limitations.evidenceScope",
  );
  assertLiteral(
    limitations.productionTargetExecution,
    false,
    "receipt.limitations.productionTargetExecution",
  );
  assertLiteral(
    limitations.exactProductionTargetExecutionClaimed,
    false,
    "receipt.limitations.exactProductionTargetExecutionClaimed",
  );
  assertLiteral(
    limitations.statement,
    LOGICAL_RESTORE_COMPANION_LIMITATION,
    "receipt.limitations.statement",
  );

  const completedAt = timestamp(
    receipt.completedAtUtc,
    "receipt.completedAtUtc",
  );
  if (
    metadataAt > structuralAt ||
    structuralAt > comparisonStartedAt ||
    comparisonStartedAt > comparisonCompletedAt ||
    comparisonCompletedAt > rehearsalStartedAt ||
    rehearsalStartedAt > rehearsalCompletedAt ||
    rehearsalCompletedAt > postRehearsalVerifiedAt ||
    postRehearsalVerifiedAt > cleanupAt ||
    cleanupAt !== completedAt
  ) {
    fail("receipt timestamps are out of order");
  }
  const nowMs = now.valueOf();
  if (!Number.isFinite(nowMs)) fail("validation now is invalid");
  if (completedAt > nowMs + MAX_FUTURE_SKEW_MS) {
    fail("receipt completion is future-dated");
  }
  if (
    comparisonCompletedAt - comparisonStartedAt >
    MAX_COMPARISON_DURATION_MS
  ) {
    fail("logical comparison duration exceeds six hours");
  }
  if (rehearsalCompletedAt - rehearsalStartedAt > MAX_REHEARSAL_DURATION_MS) {
    fail("logical-clone rehearsal duration exceeds fifteen minutes");
  }
  if (cleanupAt - rehearsalCompletedAt > MAX_REHEARSAL_CONSUMPTION_LAG_MS) {
    fail("logical-clone rehearsal evidence was stale when consumed");
  }
  if (maxReceiptAgeMs !== undefined) {
    if (!Number.isSafeInteger(maxReceiptAgeMs) || maxReceiptAgeMs < 0) {
      fail("maxReceiptAgeMs is invalid");
    }
    if (nowMs - completedAt > maxReceiptAgeMs) {
      fail("receipt completion is stale");
    }
  }

  assertReceiptContainsNoPathOrCredentialMaterial(receipt);
  return receipt;
}

/**
 * Parses only canonical v1 bytes. One trailing LF is mandatory; alternate
 * whitespace, key order, BOMs, and duplicate-key rewrites are rejected.
 *
 * @param {string | Buffer | Uint8Array} bytes
 * @param {{ now?: Date, maxReceiptAgeMs?: number }} [options]
 */
export function parseCanonicalLogicalRestoreCompanionReceipt(bytes, options) {
  let text;
  if (Buffer.isBuffer(bytes) || bytes instanceof Uint8Array) {
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      fail("receipt bytes are not valid UTF-8");
    }
  } else {
    text = bytes;
  }
  if (typeof text !== "string") fail("receipt bytes must be UTF-8 text");
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    fail("receipt bytes are not JSON");
  }
  validateLogicalRestoreCompanionReceipt(value, options);
  const canonical = `${canonicalLogicalRestoreCompanionJson(value)}\n`;
  if (text !== canonical)
    fail("receipt bytes are not canonical sorted-keys-v1 JSON");
  return value;
}
