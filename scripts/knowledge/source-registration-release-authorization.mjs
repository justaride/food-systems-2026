#!/usr/bin/env node

import {
  createHash,
  createPrivateKey,
  createPublicKey,
  sign,
  verify,
} from "node:crypto";
import {
  closeSync,
  constants,
  fstatSync,
  lstatSync,
  openSync,
  readFileSync,
  realpathSync,
} from "node:fs";
import { sep } from "node:path";
import { fileURLToPath } from "node:url";

export const SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_FORMAT =
  "foodsystems-source-registration-release-authorization";
export const SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_VERSION = 1;
export const SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_ALGORITHM = "Ed25519";
export const SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_SCOPE =
  "source-registration.new-official-2026-08-02.exact-apply";
export const SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_KEY_ID =
  "ed25519-spki-sha256:e22fee895bf45398983485329a23cb2e53b18f44480a6c837ff3ae5c9444a35b";
export const SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_PUBLIC_KEY_PATH =
  "knowledge/keys/source-registration-2026-08-03-codex-operator-ed25519-v1.public.pem";
export const SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_PUBLIC_KEY_SHA256 =
  "fade88077a899be8fd70946b0398c282b254dcfaa4a16b1893e1fb7965a5e4d2";
export const SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_DOMAIN =
  "food-systems-2026:source-registration-release-authorization:v1\0";
export const SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_MAX_LIFETIME_MS =
  4 * 60 * 60 * 1_000;
export const SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_MAX_EVIDENCE_AGE_MS =
  24 * 60 * 60 * 1_000;
export const SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_CLOCK_SKEW_MS =
  5 * 60 * 1_000;
export const SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_ACKNOWLEDGEMENT =
  "REGISTER_10_LOCKED_OFFICIAL_SOURCES_PLAN_631FEF2595BF";
export const SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_DATABASE_ROLE =
  "foodsystems";
export const SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_OPERATOR_ID =
  "codex-ai:food-systems-2026-local-operator";

const BARE_SHA256_PATTERN = /^[a-f0-9]{64}$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const OPERATOR_ID_PATTERN = /^[a-z0-9][a-z0-9._:-]{2,127}$/;
const OPERATION_KEY_PATTERN =
  /^source-registration-new-official-v1:[a-f0-9]{64}$/;
const REHEARSAL_OPERATION_KEY_PATTERN =
  /^source-registration-logical-clone-rehearsal-v1:[a-f0-9]{64}$/;
const SIGNATURE_BASE64_PATTERN = /^[A-Za-z0-9+/]{86}==$/;
const MAX_ENVELOPE_BYTES = 64 * 1_024;

const EXPECTED_KEYS = [
  "acknowledgement",
  "applyContractSha256",
  "authorizationEnvelopeSha256",
  "backupBytes",
  "backupContractHelperSha256",
  "backupMetadataSha256",
  "backupSha256",
  "backupVerifierSha256",
  "beforeSnapshotSha256",
  "codeBindingsSha256",
  "completedMigrationLedgerSha256",
  "contentStateSha256",
  "databaseCatalogSha256",
  "databaseIdentityUuid",
  "databaseLogicalDigestSha256",
  "databaseRole",
  "databaseTargetSha256",
  "dependencyStateSha256",
  "logicalCloneRehearsalCompletedAtUtc",
  "logicalCloneRehearsalOperationKey",
  "logicalCloneRehearsalReceiptFileSha256",
  "logicalCloneRehearsalReceiptSelfSha256",
  "logicalCloneRehearsalRuntimeAttestationSha256",
  "logicalComparisonProofSha256",
  "logicalRestoreCompanionCompletedAtUtc",
  "logicalRestoreCompanionReceiptSha256",
  "operatorId",
  "operationKey",
  "planFileSha256",
  "planSha256",
  "psqlBinarySha256",
  "psqlRuntimeClosureSha256",
  "publicKeyFileSha256",
  "postRehearsalCloneFullStateMatched",
  "restoredDatabaseAbsenceConfirmed",
  "restoredDatabaseDropped",
  "restoreRunnerSha256",
  "sourceDatabaseName",
  "sourceStillMatchedAfterRehearsal",
  "structuralRestoreCompletedAtUtc",
  "structuralRestoreReceiptSha256",
  "targetFingerprintSha256",
  "targetSetSha256",
];

const BINDING_KEYS = [
  "applyContractSha256",
  "backupBytes",
  "backupMetadataSha256",
  "backupSha256",
  "beforeSnapshotSha256",
  "codeBindingsSha256",
  "completedMigrationLedgerSha256",
  "contentStateSha256",
  "databaseCatalogSha256",
  "databaseIdentityUuid",
  "databaseTargetSha256",
  "dependencyStateSha256",
  "logicalCloneRehearsalReceiptFileSha256",
  "logicalCloneRehearsalReceiptSelfSha256",
  "logicalRestoreCompanionReceiptSha256",
  "operationKey",
  "planFileSha256",
  "planSha256",
  "sourceDatabaseName",
  "structuralRestoreReceiptSha256",
  "targetFingerprintSha256",
  "targetSetSha256",
];

const RESTORE_PROOF_KEYS = [
  "backupContractHelperSha256",
  "backupVerifierSha256",
  "contentMatch",
  "databaseLogicalDigestSha256",
  "logicalCloneRehearsalCompletedAtUtc",
  "logicalCloneRehearsalOperationKey",
  "logicalCloneRehearsalRuntimeAttestationSha256",
  "logicalComparisonProofSha256",
  "logicalRestoreCompanionCompletedAtUtc",
  "postRehearsalCloneFullStateMatched",
  "psqlBinarySha256",
  "psqlRuntimeClosureSha256",
  "restoreRunnerSha256",
  "restoredContentStateSha256",
  "restoredDatabaseAbsenceConfirmed",
  "restoredDatabaseDropped",
  "sourceContentStateSha256",
  "sourceStillMatchedAfterRehearsal",
  "structuralRestoreCompletedAtUtc",
];

function fail(message) {
  throw new Error(
    `Source-registration release authorization failed: ${message}`,
  );
}

export function canonicalSourceRegistrationAuthorizationJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value
      .map((item) => canonicalSourceRegistrationAuthorizationJson(item))
      .join(",")}]`;
  }
  return `{${Object.keys(value)
    .sort()
    .map(
      (key) =>
        `${JSON.stringify(key)}:${canonicalSourceRegistrationAuthorizationJson(value[key])}`,
    )
    .join(",")}}`;
}

export function sourceRegistrationAuthorizationSha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function exactObject(value, keys, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    fail(`${label} must be an object`);
  }
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (
    canonicalSourceRegistrationAuthorizationJson(actual) !==
    canonicalSourceRegistrationAuthorizationJson(expected)
  ) {
    fail(`${label} has an unexpected shape`);
  }
  return value;
}

function exactString(value, label, pattern) {
  if (typeof value !== "string" || !pattern.test(value)) {
    fail(`${label} is invalid`);
  }
  return value;
}

function sha256(value, label) {
  return exactString(value, label, BARE_SHA256_PATTERN);
}

function positiveSafeInteger(value, label) {
  if (!Number.isSafeInteger(value) || value <= 0) fail(`${label} is invalid`);
  return value;
}

function timestamp(value, label) {
  exactString(value, label, DATE_TIME_PATTERN);
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed) || new Date(parsed).toISOString() !== value) {
    fail(`${label} is not a canonical UTC timestamp`);
  }
  return parsed;
}

function nowMilliseconds(now) {
  if (now === undefined) return Date.now();
  if (now instanceof Date) return now.valueOf();
  if (typeof now === "string") return timestamp(now, "now");
  if (typeof now === "number" && Number.isFinite(now)) return now;
  fail("now is invalid");
}

function hasPrivatePathClaim(value) {
  if (typeof value === "string") {
    return (
      value.startsWith("/") ||
      value.startsWith("~/") ||
      value.startsWith("file://") ||
      /^[A-Za-z]:[\\/]/.test(value) ||
      value.includes("/Users/") ||
      value.includes("\\Users\\")
    );
  }
  if (Array.isArray(value)) return value.some(hasPrivatePathClaim);
  if (value && typeof value === "object") {
    return Object.values(value).some(hasPrivatePathClaim);
  }
  return false;
}

function publicKeyFacts(publicKeyBytes) {
  let key;
  try {
    key = createPublicKey(publicKeyBytes);
  } catch {
    fail("public key could not be parsed");
  }
  if (key.asymmetricKeyType !== "ed25519") fail("public key is not Ed25519");
  const spki = key.export({ type: "spki", format: "der" });
  return {
    key,
    keyId: `ed25519-spki-sha256:${sourceRegistrationAuthorizationSha256(spki)}`,
    fileSha256: sourceRegistrationAuthorizationSha256(publicKeyBytes),
  };
}

function parseExpected(value) {
  const expected = exactObject(value, EXPECTED_KEYS, "expected bindings");
  for (const key of EXPECTED_KEYS.filter(
    (key) =>
      key.endsWith("Sha256") &&
      key !== "authorizationEnvelopeSha256" &&
      key !== "publicKeyFileSha256",
  )) {
    sha256(expected[key], `expected ${key}`);
  }
  sha256(
    expected.authorizationEnvelopeSha256,
    "expected authorizationEnvelopeSha256",
  );
  sha256(expected.publicKeyFileSha256, "expected publicKeyFileSha256");
  positiveSafeInteger(expected.backupBytes, "expected backupBytes");
  exactString(
    expected.databaseIdentityUuid,
    "expected databaseIdentityUuid",
    UUID_PATTERN,
  );
  exactString(
    expected.operationKey,
    "expected operationKey",
    OPERATION_KEY_PATTERN,
  );
  exactString(
    expected.logicalCloneRehearsalOperationKey,
    "expected logicalCloneRehearsalOperationKey",
    REHEARSAL_OPERATION_KEY_PATTERN,
  );
  exactString(expected.operatorId, "expected operatorId", OPERATOR_ID_PATTERN);
  if (
    expected.operatorId !==
    SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_OPERATOR_ID
  ) {
    fail("expected operatorId must be the pinned Codex AI operator");
  }
  if (
    expected.acknowledgement !==
    SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_ACKNOWLEDGEMENT
  ) {
    fail(
      "expected acknowledgement differs from the locked apply acknowledgement",
    );
  }
  if (
    expected.databaseRole !==
    SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_DATABASE_ROLE
  ) {
    fail("expected databaseRole must be foodsystems");
  }
  if (expected.sourceDatabaseName !== "foodsystems") {
    fail("expected sourceDatabaseName must be foodsystems");
  }
  for (const key of [
    "structuralRestoreCompletedAtUtc",
    "logicalCloneRehearsalCompletedAtUtc",
    "logicalRestoreCompanionCompletedAtUtc",
  ]) {
    timestamp(expected[key], `expected ${key}`);
  }
  for (const key of [
    "restoredDatabaseDropped",
    "restoredDatabaseAbsenceConfirmed",
    "postRehearsalCloneFullStateMatched",
    "sourceStillMatchedAfterRehearsal",
  ]) {
    if (expected[key] !== true) fail(`expected ${key} must be true`);
  }
  return expected;
}

function parseBody(value, now) {
  const body = exactObject(
    value,
    [
      "authorizationId",
      "bindings",
      "expiresAtUtc",
      "issuedAtUtc",
      "mutation",
      "nonce",
      "notBeforeUtc",
      "operator",
      "restoreProof",
      "scope",
    ],
    "authorization body",
  );
  exactString(body.authorizationId, "authorizationId", UUID_PATTERN);
  exactString(body.nonce, "nonce", BARE_SHA256_PATTERN);
  if (body.scope !== SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_SCOPE) {
    fail("authorization scope is invalid");
  }

  const operator = exactObject(
    body.operator,
    [
      "authorityClass",
      "exactApplyAuthorized",
      "expertValidationClaimed",
      "humanApprovalClaimed",
      "keyCustody",
      "operatorId",
      "ownerExactHashReviewClaimed",
      "rightsHolderApprovalClaimed",
    ],
    "operator",
  );
  exactString(operator.operatorId, "operatorId", OPERATOR_ID_PATTERN);
  if (
    operator.operatorId !==
      SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_OPERATOR_ID ||
    operator.authorityClass !==
      "codex_ai_local_operator_pre_human_validation" ||
    operator.keyCustody !== "local_owner_accessible_file_not_hardware_backed" ||
    operator.exactApplyAuthorized !== true ||
    operator.humanApprovalClaimed !== false ||
    operator.ownerExactHashReviewClaimed !== false ||
    operator.expertValidationClaimed !== false ||
    operator.rightsHolderApprovalClaimed !== false
  ) {
    fail("operator authority boundary is invalid");
  }

  const mutation = exactObject(
    body.mutation,
    [
      "action",
      "acknowledgement",
      "controlledMutationAuditCreatesMax",
      "documentCreatesMax",
      "databaseRole",
      "externalUseAuthorized",
      "libraryAnalysisRecordCreatesMax",
      "lifecyclePromotionAuthorized",
      "otherDatabaseWritesAuthorized",
      "sourceAnalysisPromotionAuthorized",
    ],
    "mutation",
  );
  if (
    mutation.action !== "register_exact_locked_official_sources" ||
    mutation.acknowledgement !==
      SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_ACKNOWLEDGEMENT ||
    mutation.databaseRole !==
      SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_DATABASE_ROLE ||
    mutation.documentCreatesMax !== 10 ||
    mutation.libraryAnalysisRecordCreatesMax !== 10 ||
    mutation.controlledMutationAuditCreatesMax !== 1 ||
    mutation.otherDatabaseWritesAuthorized !== false ||
    mutation.lifecyclePromotionAuthorized !== false ||
    mutation.sourceAnalysisPromotionAuthorized !== false ||
    mutation.externalUseAuthorized !== false
  ) {
    fail("mutation boundary is invalid");
  }

  const bindings = exactObject(body.bindings, BINDING_KEYS, "bindings");
  for (const key of BINDING_KEYS.filter((key) => key.endsWith("Sha256"))) {
    sha256(bindings[key], `bindings.${key}`);
  }
  positiveSafeInteger(bindings.backupBytes, "bindings.backupBytes");
  exactString(
    bindings.databaseIdentityUuid,
    "bindings.databaseIdentityUuid",
    UUID_PATTERN,
  );
  exactString(
    bindings.operationKey,
    "bindings.operationKey",
    OPERATION_KEY_PATTERN,
  );
  if (bindings.sourceDatabaseName !== "foodsystems") {
    fail("bindings.sourceDatabaseName must be foodsystems");
  }

  const proof = exactObject(
    body.restoreProof,
    RESTORE_PROOF_KEYS,
    "restoreProof",
  );
  for (const key of RESTORE_PROOF_KEYS.filter((key) =>
    key.endsWith("Sha256"),
  )) {
    sha256(proof[key], `restoreProof.${key}`);
  }
  exactString(
    proof.logicalCloneRehearsalOperationKey,
    "restoreProof.logicalCloneRehearsalOperationKey",
    REHEARSAL_OPERATION_KEY_PATTERN,
  );
  if (
    proof.contentMatch !== true ||
    proof.restoredDatabaseDropped !== true ||
    proof.restoredDatabaseAbsenceConfirmed !== true ||
    proof.postRehearsalCloneFullStateMatched !== true ||
    proof.sourceStillMatchedAfterRehearsal !== true ||
    proof.sourceContentStateSha256 !== bindings.contentStateSha256 ||
    proof.restoredContentStateSha256 !== bindings.contentStateSha256
  ) {
    fail("restore content or cleanup proof is invalid");
  }

  const issuedAt = timestamp(body.issuedAtUtc, "issuedAtUtc");
  const notBefore = timestamp(body.notBeforeUtc, "notBeforeUtc");
  const expiresAt = timestamp(body.expiresAtUtc, "expiresAtUtc");
  const structuralRestoreCompletedAt = timestamp(
    proof.structuralRestoreCompletedAtUtc,
    "restoreProof.structuralRestoreCompletedAtUtc",
  );
  const logicalCloneRehearsalCompletedAt = timestamp(
    proof.logicalCloneRehearsalCompletedAtUtc,
    "restoreProof.logicalCloneRehearsalCompletedAtUtc",
  );
  const logicalRestoreCompanionCompletedAt = timestamp(
    proof.logicalRestoreCompanionCompletedAtUtc,
    "restoreProof.logicalRestoreCompanionCompletedAtUtc",
  );
  const current = nowMilliseconds(now);
  if (
    issuedAt >
    current + SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_CLOCK_SKEW_MS
  ) {
    fail("authorization was issued in the future");
  }
  if (notBefore < issuedAt || notBefore > current) {
    fail("authorization is not active yet or has an invalid not-before time");
  }
  if (
    expiresAt <= current ||
    expiresAt <= notBefore ||
    expiresAt - issuedAt >
      SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_MAX_LIFETIME_MS
  ) {
    fail("authorization is expired or its lifetime is too long");
  }
  for (const completedAt of [
    structuralRestoreCompletedAt,
    logicalCloneRehearsalCompletedAt,
    logicalRestoreCompanionCompletedAt,
  ]) {
    if (
      completedAt >
        issuedAt + SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_CLOCK_SKEW_MS ||
      issuedAt - completedAt >
        SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_MAX_EVIDENCE_AGE_MS
    ) {
      fail("restore evidence is future-dated or stale");
    }
  }
  if (
    structuralRestoreCompletedAt > logicalCloneRehearsalCompletedAt ||
    logicalCloneRehearsalCompletedAt > logicalRestoreCompanionCompletedAt
  ) {
    fail("restore evidence completion order is invalid");
  }
  if (hasPrivatePathClaim(body)) {
    fail("authorization body contains a private path claim");
  }
  return body;
}

function compareExpected(body, expected) {
  if (
    body.operator.operatorId !== expected.operatorId ||
    body.operator.operatorId !==
      SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_OPERATOR_ID
  ) {
    fail("operatorId differs from expected");
  }
  if (body.mutation.acknowledgement !== expected.acknowledgement) {
    fail("mutation.acknowledgement differs from expected");
  }
  if (body.mutation.databaseRole !== expected.databaseRole) {
    fail("mutation.databaseRole differs from expected");
  }
  for (const key of BINDING_KEYS) {
    if (body.bindings[key] !== expected[key]) {
      fail(`bindings.${key} differs from expected`);
    }
  }
  for (const key of [
    "backupContractHelperSha256",
    "backupVerifierSha256",
    "databaseLogicalDigestSha256",
    "logicalCloneRehearsalCompletedAtUtc",
    "logicalCloneRehearsalOperationKey",
    "logicalCloneRehearsalRuntimeAttestationSha256",
    "logicalComparisonProofSha256",
    "logicalRestoreCompanionCompletedAtUtc",
    "postRehearsalCloneFullStateMatched",
    "psqlBinarySha256",
    "psqlRuntimeClosureSha256",
    "restoredDatabaseAbsenceConfirmed",
    "restoredDatabaseDropped",
    "restoreRunnerSha256",
    "sourceStillMatchedAfterRehearsal",
    "structuralRestoreCompletedAtUtc",
  ]) {
    if (body.restoreProof[key] !== expected[key]) {
      fail(`restoreProof.${key} differs from expected`);
    }
  }
  if (
    body.restoreProof.sourceContentStateSha256 !==
      expected.contentStateSha256 ||
    body.restoreProof.restoredContentStateSha256 !== expected.contentStateSha256
  ) {
    fail("restoreProof content state differs from expected");
  }
}

function signedPayloadBytes(envelopeWithoutSignature) {
  return Buffer.concat([
    Buffer.from(SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_DOMAIN, "utf8"),
    Buffer.from(
      canonicalSourceRegistrationAuthorizationJson(envelopeWithoutSignature),
      "utf8",
    ),
  ]);
}

function parseEnvelopeBytes(authorizationBytes) {
  if (!Buffer.isBuffer(authorizationBytes))
    fail("authorization bytes are required");
  if (
    authorizationBytes.length === 0 ||
    authorizationBytes.length > MAX_ENVELOPE_BYTES
  ) {
    fail("authorization file size is invalid");
  }
  let value;
  try {
    value = JSON.parse(authorizationBytes.toString("utf8"));
  } catch {
    fail("authorization file is not JSON");
  }
  const envelope = exactObject(
    value,
    ["algorithm", "body", "format", "keyId", "signatureBase64", "version"],
    "authorization envelope",
  );
  const canonicalBytes = Buffer.from(
    `${canonicalSourceRegistrationAuthorizationJson(envelope)}\n`,
    "utf8",
  );
  if (!authorizationBytes.equals(canonicalBytes)) {
    fail("authorization file is not canonical JSON with one final newline");
  }
  if (
    envelope.format !== SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_FORMAT ||
    envelope.version !== SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_VERSION ||
    envelope.algorithm !== SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_ALGORITHM
  ) {
    fail("authorization envelope format, version, or algorithm is invalid");
  }
  exactString(envelope.keyId, "keyId", /^ed25519-spki-sha256:[a-f0-9]{64}$/);
  exactString(
    envelope.signatureBase64,
    "signatureBase64",
    SIGNATURE_BASE64_PATTERN,
  );
  const signature = Buffer.from(envelope.signatureBase64, "base64");
  if (
    signature.length !== 64 ||
    signature.toString("base64") !== envelope.signatureBase64
  ) {
    fail("signatureBase64 is not canonical Ed25519 signature data");
  }
  return { envelope, signature };
}

/**
 * Generic byte-level verifier used by tests and by the pinned-path wrapper.
 * Production callers must use verifySourceRegistrationReleaseAuthorization.
 */
export function verifySourceRegistrationReleaseAuthorizationEnvelopeBytes({
  authorizationBytes,
  publicKeyBytes,
  expected: expectedInput,
  now,
}) {
  const expected = parseExpected(expectedInput);
  const envelopeSha256 =
    sourceRegistrationAuthorizationSha256(authorizationBytes);
  if (envelopeSha256 !== expected.authorizationEnvelopeSha256) {
    fail("authorization envelope SHA-256 differs from expected");
  }
  const publicKey = publicKeyFacts(publicKeyBytes);
  if (publicKey.fileSha256 !== expected.publicKeyFileSha256) {
    fail("public-key file SHA-256 differs from expected");
  }
  const { envelope, signature } = parseEnvelopeBytes(authorizationBytes);
  if (envelope.keyId !== publicKey.keyId)
    fail("envelope keyId is not the supplied key");
  const { signatureBase64: _signatureBase64, ...unsignedEnvelope } = envelope;
  if (
    !verify(
      null,
      signedPayloadBytes(unsignedEnvelope),
      publicKey.key,
      signature,
    )
  ) {
    fail("Ed25519 signature is invalid");
  }
  const body = parseBody(envelope.body, now);
  compareExpected(body, expected);
  return Object.freeze({
    envelopeSha256,
    keyId: envelope.keyId,
    algorithm: SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_ALGORITHM,
    authorizationId: body.authorizationId,
    authorizationScope: body.scope,
    acknowledgement: body.mutation.acknowledgement,
    operatorId: body.operator.operatorId,
    databaseRole: body.mutation.databaseRole,
    operatorAuthorityClass: body.operator.authorityClass,
    humanApprovalClaimed: false,
    ownerExactHashReviewClaimed: false,
    expertValidationClaimed: false,
    rightsHolderApprovalClaimed: false,
    authorizedAtUtc: body.issuedAtUtc,
    notBeforeUtc: body.notBeforeUtc,
    expiresAtUtc: body.expiresAtUtc,
    nonceSha256: sourceRegistrationAuthorizationSha256(body.nonce),
    planSha256: body.bindings.planSha256,
    planFileSha256: body.bindings.planFileSha256,
    beforeSnapshotSha256: body.bindings.beforeSnapshotSha256,
    databaseIdentityUuid: body.bindings.databaseIdentityUuid,
    sourceDatabaseName: body.bindings.sourceDatabaseName,
    applyContractSha256: body.bindings.applyContractSha256,
    dependencyStateSha256: body.bindings.dependencyStateSha256,
    operationKey: body.bindings.operationKey,
    codeBindingsSha256: body.bindings.codeBindingsSha256,
    databaseTargetSha256: body.bindings.databaseTargetSha256,
    databaseCatalogSha256: body.bindings.databaseCatalogSha256,
    contentStateSha256: body.bindings.contentStateSha256,
    backupSha256: body.bindings.backupSha256,
    backupBytes: body.bindings.backupBytes,
    backupMetadataSha256: body.bindings.backupMetadataSha256,
    structuralRestoreReceiptSha256:
      body.bindings.structuralRestoreReceiptSha256,
    logicalRestoreCompanionReceiptSha256:
      body.bindings.logicalRestoreCompanionReceiptSha256,
    logicalCloneRehearsalReceiptFileSha256:
      body.bindings.logicalCloneRehearsalReceiptFileSha256,
    logicalCloneRehearsalReceiptSelfSha256:
      body.bindings.logicalCloneRehearsalReceiptSelfSha256,
    completedMigrationLedgerSha256:
      body.bindings.completedMigrationLedgerSha256,
    targetFingerprintSha256: body.bindings.targetFingerprintSha256,
    targetSetSha256: body.bindings.targetSetSha256,
    structuralRestoreCompletedAtUtc:
      body.restoreProof.structuralRestoreCompletedAtUtc,
    logicalRestoreCompanionCompletedAtUtc:
      body.restoreProof.logicalRestoreCompanionCompletedAtUtc,
    logicalComparisonProofSha256:
      body.restoreProof.logicalComparisonProofSha256,
    logicalCloneRehearsalOperationKey:
      body.restoreProof.logicalCloneRehearsalOperationKey,
    logicalCloneRehearsalRuntimeAttestationSha256:
      body.restoreProof.logicalCloneRehearsalRuntimeAttestationSha256,
    logicalCloneRehearsalCompletedAtUtc:
      body.restoreProof.logicalCloneRehearsalCompletedAtUtc,
    restoreRunnerSha256: body.restoreProof.restoreRunnerSha256,
    backupVerifierSha256: body.restoreProof.backupVerifierSha256,
    backupContractHelperSha256: body.restoreProof.backupContractHelperSha256,
    databaseLogicalDigestSha256: body.restoreProof.databaseLogicalDigestSha256,
    psqlBinarySha256: body.restoreProof.psqlBinarySha256,
    psqlRuntimeClosureSha256: body.restoreProof.psqlRuntimeClosureSha256,
    restoredDatabaseDropped: true,
    restoredDatabaseAbsenceConfirmed: true,
    postRehearsalCloneFullStateMatched: true,
    sourceStillMatchedAfterRehearsal: true,
    documentCreatesMax: 10,
    libraryAnalysisRecordCreatesMax: 10,
    controlledMutationAuditCreatesMax: 1,
    otherDatabaseWritesAuthorized: false,
    lifecyclePromotionAuthorized: false,
    sourceAnalysisPromotionAuthorized: false,
    externalUseAuthorized: false,
  });
}

function readPrivateRegularFile(path, label) {
  if (typeof path !== "string" || !path.startsWith("/")) {
    fail(`${label} must be an absolute path`);
  }
  let pathStats;
  try {
    pathStats = lstatSync(path);
  } catch {
    fail(`${label} is missing or unreadable`);
  }
  if (
    !pathStats.isFile() ||
    pathStats.isSymbolicLink() ||
    pathStats.nlink !== 1 ||
    ((pathStats.mode & 0o777) !== 0o400 && (pathStats.mode & 0o777) !== 0o600)
  ) {
    fail(
      `${label} must be a private mode-0600-or-0400 regular single-link file`,
    );
  }
  const flags = constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0);
  let descriptor;
  try {
    descriptor = openSync(path, flags);
  } catch {
    fail(`${label} could not be opened safely`);
  }
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
      fail(`${label} changed while it was read`);
    }
    return bytes;
  } finally {
    closeSync(descriptor);
  }
}

/**
 * Production verifier. It always uses the one tracked, pinned public key.
 * @param {{ authorizationPath: string, expected: Record<string, unknown>, now?: Date | string | number }} input
 */
export function verifySourceRegistrationReleaseAuthorization({
  authorizationPath,
  expected,
  now,
}) {
  let authorizationRealPath;
  try {
    authorizationRealPath = realpathSync(authorizationPath);
  } catch {
    fail("authorization envelope is missing or unreadable");
  }
  const repositoryRoot = realpathSync(
    fileURLToPath(new URL("../../", import.meta.url)),
  );
  if (
    authorizationRealPath !== authorizationPath ||
    authorizationRealPath === repositoryRoot ||
    authorizationRealPath.startsWith(`${repositoryRoot}${sep}`)
  ) {
    fail("authorization envelope must be canonical and outside the repository");
  }
  const pinnedPublicKeyPath = fileURLToPath(
    new URL(
      `../../${SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_PUBLIC_KEY_PATH}`,
      import.meta.url,
    ),
  );
  let publicKeyStats;
  let publicKeyBytes;
  try {
    if (realpathSync(pinnedPublicKeyPath) !== pinnedPublicKeyPath) {
      fail("pinned public-key path is not canonical");
    }
    publicKeyStats = lstatSync(pinnedPublicKeyPath);
    publicKeyBytes = readFileSync(pinnedPublicKeyPath);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith(
        "Source-registration release authorization failed:",
      )
    ) {
      throw error;
    }
    fail("pinned public key is missing or unreadable");
  }
  if (!publicKeyStats.isFile() || publicKeyStats.isSymbolicLink()) {
    fail("pinned public key is not a regular file");
  }
  if (
    sourceRegistrationAuthorizationSha256(publicKeyBytes) !==
      SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_PUBLIC_KEY_SHA256 ||
    expected?.publicKeyFileSha256 !==
      SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_PUBLIC_KEY_SHA256
  ) {
    fail("pinned public-key bytes or expected binding drifted");
  }
  const authorizationBytes = readPrivateRegularFile(
    authorizationPath,
    "authorization envelope",
  );
  const verified = verifySourceRegistrationReleaseAuthorizationEnvelopeBytes({
    authorizationBytes,
    publicKeyBytes,
    expected,
    now,
  });
  if (verified.keyId !== SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_KEY_ID) {
    fail("verified keyId differs from the one pinned operator key");
  }
  return verified;
}

/**
 * Creates canonical signed bytes from an already complete, bounded body.
 * The caller owns private-key custody and atomic private-file publication.
 */
export function createSourceRegistrationReleaseAuthorizationEnvelope({
  body: bodyInput,
  privateKeyBytes,
  publicKeyBytes,
  now,
}) {
  const body = parseBody(bodyInput, now);
  const publicKey = publicKeyFacts(publicKeyBytes);
  let privateKey;
  try {
    privateKey = createPrivateKey(privateKeyBytes);
  } catch {
    fail("private key could not be parsed");
  }
  if (privateKey.asymmetricKeyType !== "ed25519") {
    fail("private key is not Ed25519");
  }
  const unsignedEnvelope = {
    format: SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_FORMAT,
    version: SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_VERSION,
    algorithm: SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_ALGORITHM,
    keyId: publicKey.keyId,
    body,
  };
  const signature = sign(
    null,
    signedPayloadBytes(unsignedEnvelope),
    privateKey,
  );
  if (
    !verify(
      null,
      signedPayloadBytes(unsignedEnvelope),
      publicKey.key,
      signature,
    )
  ) {
    fail("private key does not match the supplied public key");
  }
  return Buffer.from(
    `${canonicalSourceRegistrationAuthorizationJson({
      ...unsignedEnvelope,
      signatureBase64: signature.toString("base64"),
    })}\n`,
    "utf8",
  );
}
