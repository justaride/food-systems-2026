#!/usr/local/bin/node

import { createHash } from "node:crypto";
import {
  closeSync,
  constants,
  fchmodSync,
  fstatSync,
  fsyncSync,
  lstatSync,
  openSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import {
  dirname,
  isAbsolute,
  join,
  normalize,
  parse,
  relative,
  sep,
} from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const WRITER_VERSION = "1.0.0";
export const SCHEMA_VERSION = "corpus-event-history-external-anchor-ledger-v1";
export const PROJECT_ID = "food-systems-2026";
export const LEDGER_ID = "food-systems.corpus-event-history";
export const VERIFIER_ID = "project-identity.food-systems.root-ledger.v1";

export const FIXED_INSTALL_DIRECTORY =
  "/usr/local/libexec/food-systems-corpus-anchor-writer";
export const FIXED_WRITER_PATH = `${FIXED_INSTALL_DIRECTORY}/corpus-anchor-root-writer.mjs`;
export const FIXED_INSTALL_MANIFEST_PATH = `${FIXED_INSTALL_DIRECTORY}/install-manifest.v1.json`;
export const FIXED_NODE_PATH = "/usr/local/bin/node";
export const FIXED_EXTERNAL_ROOT = "/private/var/db/food-systems-corpus-anchor";

export const LEDGER_FILE = "corpus-event-history-anchors.v1.jsonl";
export const HEAD_FILE = "corpus-event-history-anchors-head.v1.json";
export const LOCK_FILE = ".corpus-event-history-anchors.append.lock";

export const REPOSITORY_ANCHOR_PATH =
  "knowledge/corpus/corpus-processing-state-event-history-anchors.v1.jsonl";
export const REPOSITORY_BASELINE_PATH =
  "knowledge/corpus/corpus-processing-baseline.v1.json";
export const REPOSITORY_REGISTER_PATH =
  "knowledge/corpus/corpus-processing-register.v1.jsonl";
export const REPOSITORY_BASELINE_MANIFEST_PATH =
  "knowledge/corpus/corpus-processing-generation-manifest.v1.json";

const EVENT_ANCHOR_SCHEMA_VERSION = "corpus-processing-event-history-anchor-v1";
const EVENT_ANCHOR_HASH_DOMAIN =
  "food-systems/corpus-processing-event-history-anchor/v1\n";
const EXTERNAL_EVIDENCE_HASH_DOMAIN =
  "food-systems/corpus-external-anchor-evidence/v1\n";
const EXTERNAL_REQUEST_HASH_DOMAIN =
  "food-systems/corpus-external-anchor-request/v1\n";
const EXTERNAL_RECORD_HASH_DOMAIN =
  "food-systems/corpus-external-anchor-record/v1\n";
const EXTERNAL_HEAD_HASH_DOMAIN =
  "food-systems/corpus-external-anchor-head/v1\n";

const SHA256_PATTERN = /^sha256:[a-f0-9]{64}$/;
const IDENTIFIER_PATTERN = /^[a-z0-9][a-z0-9._:-]*$/;
const DATETIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function fail(message) {
  throw new Error(`Root corpus anchor writer failed: ${message}`);
}

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function exactKeys(value, expected, label) {
  if (!isPlainObject(value)) fail(`${label} must be an object`);
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
    fail(`${label} keys differ from the fixed contract`);
  }
}

function requireString(value, label) {
  if (typeof value !== "string") fail(`${label} must be a string`);
  return value;
}

function requireLiteral(value, expected, label) {
  if (value !== expected) fail(`${label} must equal ${expected}`);
  return value;
}

function requirePositiveInteger(value, label) {
  if (!Number.isInteger(value) || value < 1) {
    fail(`${label} must be a positive integer`);
  }
  return value;
}

function requireNonnegativeInteger(value, label) {
  if (!Number.isInteger(value) || value < 0) {
    fail(`${label} must be a nonnegative integer`);
  }
  return value;
}

function requireSha256(value, label) {
  if (typeof value !== "string" || !SHA256_PATTERN.test(value)) {
    fail(`${label} must be a prefixed lowercase SHA-256`);
  }
  return value;
}

function requireIdentifier(value, label) {
  if (typeof value !== "string" || !IDENTIFIER_PATTERN.test(value)) {
    fail(`${label} must be a portable identifier`);
  }
  return value;
}

function requireDateTime(value, label) {
  if (
    typeof value !== "string" ||
    !DATETIME_PATTERN.test(value) ||
    !Number.isFinite(Date.parse(value))
  ) {
    fail(`${label} must be an ISO 8601 date-time with an explicit offset`);
  }
  return value;
}

function requireRepositoryPath(value, label) {
  requireString(value, label);
  if (
    value.startsWith("/") ||
    value.startsWith("~") ||
    value.includes("\\") ||
    /^[A-Za-z][A-Za-z0-9+.-]*:/.test(value) ||
    /[\u0000-\u001f\u007f]/.test(value) ||
    value
      .split("/")
      .some(
        (segment) =>
          segment.length === 0 || segment === "." || segment === "..",
      )
  ) {
    fail(`${label} must be a portable repository-relative path`);
  }
  return value;
}

export function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  }
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
    .join(",")}}`;
}

function rawSha256(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function domainHash(domain, value) {
  return `sha256:${createHash("sha256")
    .update(domain)
    .update(canonicalJson(value))
    .digest("hex")}`;
}

function hashWithoutField(domain, value, field) {
  return domainHash(
    domain,
    Object.fromEntries(Object.entries(value).filter(([key]) => key !== field)),
  );
}

function exactJson(left, right) {
  return canonicalJson(left) === canonicalJson(right);
}

function validateFileBinding(value, options, label) {
  exactKeys(value, ["path", "fileSha256", "sizeBytes"], label);
  if (options.fixedPath) {
    requireLiteral(value.path, options.fixedPath, `${label}.path`);
  } else {
    requireRepositoryPath(value.path, `${label}.path`);
  }
  requireSha256(value.fileSha256, `${label}.fileSha256`);
  if (options.allowEmpty) {
    requireNonnegativeInteger(value.sizeBytes, `${label}.sizeBytes`);
  } else {
    requirePositiveInteger(value.sizeBytes, `${label}.sizeBytes`);
  }
  return value;
}

function validateBaselineInputs(value) {
  exactKeys(
    value,
    ["baseline", "processingRegister", "baselineGenerationManifest"],
    "repositoryBaselineInputs",
  );
  validateFileBinding(
    value.baseline,
    { fixedPath: REPOSITORY_BASELINE_PATH, allowEmpty: false },
    "repositoryBaselineInputs.baseline",
  );
  validateFileBinding(
    value.processingRegister,
    { fixedPath: REPOSITORY_REGISTER_PATH, allowEmpty: false },
    "repositoryBaselineInputs.processingRegister",
  );
  validateFileBinding(
    value.baselineGenerationManifest,
    { fixedPath: REPOSITORY_BASELINE_MANIFEST_PATH, allowEmpty: false },
    "repositoryBaselineInputs.baselineGenerationManifest",
  );
  return value;
}

function validateRepositoryPrefix(value) {
  exactKeys(
    value,
    ["path", "fileSha256", "sizeBytes", "recordCount", "lastRecordSha256"],
    "repositoryAnchorLogPrefix",
  );
  requireLiteral(value.path, REPOSITORY_ANCHOR_PATH, "repository prefix path");
  requireSha256(value.fileSha256, "repository prefix fileSha256");
  requirePositiveInteger(value.sizeBytes, "repository prefix sizeBytes");
  requirePositiveInteger(value.recordCount, "repository prefix recordCount");
  requireSha256(value.lastRecordSha256, "repository prefix head");
  return value;
}

function validateManifestBinding(value, label) {
  exactKeys(
    value,
    ["path", "fileSha256", "sizeBytes", "manifestSha256"],
    label,
  );
  requireRepositoryPath(value.path, `${label}.path`);
  requireSha256(value.fileSha256, `${label}.fileSha256`);
  requireNonnegativeInteger(value.sizeBytes, `${label}.sizeBytes`);
  requireSha256(value.manifestSha256, `${label}.manifestSha256`);
  return value;
}

function hashEventAnchorRecord(value) {
  return hashWithoutField(EVENT_ANCHOR_HASH_DOMAIN, value, "recordSha256");
}

function validateCandidate(value) {
  exactKeys(
    value,
    [
      "schemaVersion",
      "recordType",
      "anchorId",
      "sequence",
      "predecessorRecordSha256",
      "eventLogPrefix",
      "eventCount",
      "firstEventSha256",
      "lastEventSha256",
      "eventSetSha256",
      "eventManifest",
      "createdAt",
      "recordSha256",
    ],
    "candidate",
  );
  requireLiteral(
    value.schemaVersion,
    EVENT_ANCHOR_SCHEMA_VERSION,
    "candidate.schemaVersion",
  );
  requireLiteral(
    value.recordType,
    "history_anchor_candidate",
    "candidate.recordType",
  );
  requireIdentifier(value.anchorId, "candidate.anchorId");
  requirePositiveInteger(value.sequence, "candidate.sequence");
  if (value.predecessorRecordSha256 !== null) {
    requireSha256(
      value.predecessorRecordSha256,
      "candidate.predecessorRecordSha256",
    );
  }
  validateFileBinding(
    value.eventLogPrefix,
    { fixedPath: null, allowEmpty: true },
    "candidate.eventLogPrefix",
  );
  requireNonnegativeInteger(value.eventCount, "candidate.eventCount");
  if (value.firstEventSha256 !== null) {
    requireSha256(value.firstEventSha256, "candidate.firstEventSha256");
  }
  if (value.lastEventSha256 !== null) {
    requireSha256(value.lastEventSha256, "candidate.lastEventSha256");
  }
  if (
    (value.eventCount === 0) !==
    (value.firstEventSha256 === null && value.lastEventSha256 === null)
  ) {
    fail("candidate genesis event bindings are inconsistent");
  }
  requireSha256(value.eventSetSha256, "candidate.eventSetSha256");
  validateManifestBinding(value.eventManifest, "candidate.eventManifest");
  requireDateTime(value.createdAt, "candidate.createdAt");
  requireSha256(value.recordSha256, "candidate.recordSha256");
  if (value.recordSha256 !== hashEventAnchorRecord(value)) {
    fail("candidate self-hash mismatch");
  }
  return value;
}

function expectedVerificationId(candidateRecordSha256) {
  return `verification.external-root-ledger.${candidateRecordSha256.slice("sha256:".length)}`;
}

function validateVerification(value) {
  exactKeys(
    value,
    [
      "schemaVersion",
      "recordType",
      "verificationId",
      "sequence",
      "predecessorRecordSha256",
      "candidateRecordSha256",
      "verifierId",
      "method",
      "evidenceSha256",
      "verifiedAt",
      "recordSha256",
    ],
    "verification",
  );
  requireLiteral(
    value.schemaVersion,
    EVENT_ANCHOR_SCHEMA_VERSION,
    "verification.schemaVersion",
  );
  requireLiteral(
    value.recordType,
    "history_anchor_trusted_verification",
    "verification.recordType",
  );
  requireIdentifier(value.verificationId, "verification.verificationId");
  requirePositiveInteger(value.sequence, "verification.sequence");
  requireSha256(
    value.predecessorRecordSha256,
    "verification.predecessorRecordSha256",
  );
  requireSha256(
    value.candidateRecordSha256,
    "verification.candidateRecordSha256",
  );
  requireLiteral(value.verifierId, VERIFIER_ID, "verification.verifierId");
  requireLiteral(
    value.method,
    "controlled_project_identity",
    "verification.method",
  );
  requireSha256(value.evidenceSha256, "verification.evidenceSha256");
  requireDateTime(value.verifiedAt, "verification.verifiedAt");
  requireSha256(value.recordSha256, "verification.recordSha256");
  if (value.recordSha256 !== hashEventAnchorRecord(value)) {
    fail("verification self-hash mismatch");
  }
  return value;
}

function validateHeadPrecondition(value) {
  if (value === null) return null;
  exactKeys(
    value,
    ["recordCount", "latestRecordSha256", "headSha256"],
    "externalHeadPrecondition",
  );
  requirePositiveInteger(value.recordCount, "head precondition recordCount");
  requireSha256(
    value.latestRecordSha256,
    "head precondition latestRecordSha256",
  );
  requireSha256(value.headSha256, "head precondition headSha256");
  return value;
}

function evidenceIntent(request) {
  return {
    projectId: PROJECT_ID,
    ledgerId: LEDGER_ID,
    verifierId: VERIFIER_ID,
    method: "controlled_project_identity",
    repositoryAnchorLogPrefix: request.repositoryAnchorLogPrefix,
    repositoryBaselineInputs: request.repositoryBaselineInputs,
    candidateRecordSha256: request.candidate.recordSha256,
    externalHeadPrecondition: request.externalHeadPrecondition,
    verifiedAt: request.preparedAt,
  };
}

export function validatePreparedRequest(value) {
  exactKeys(
    value,
    [
      "schemaVersion",
      "artifactType",
      "projectId",
      "ledgerId",
      "requestId",
      "repositoryAnchorLogPrefix",
      "repositoryBaselineInputs",
      "candidate",
      "verification",
      "externalHeadPrecondition",
      "preparedAt",
      "requestSha256",
    ],
    "prepared request",
  );
  requireLiteral(value.schemaVersion, SCHEMA_VERSION, "request.schemaVersion");
  requireLiteral(
    value.artifactType,
    "external_anchor_append_request",
    "request.artifactType",
  );
  requireLiteral(value.projectId, PROJECT_ID, "request.projectId");
  requireLiteral(value.ledgerId, LEDGER_ID, "request.ledgerId");
  requireIdentifier(value.requestId, "request.requestId");
  validateRepositoryPrefix(value.repositoryAnchorLogPrefix);
  validateBaselineInputs(value.repositoryBaselineInputs);
  const candidate = validateCandidate(value.candidate);
  const verification = validateVerification(value.verification);
  validateHeadPrecondition(value.externalHeadPrecondition);
  requireDateTime(value.preparedAt, "request.preparedAt");
  requireSha256(value.requestSha256, "request.requestSha256");
  if (
    value.requestId !==
    `request.external-anchor.${candidate.recordSha256.slice("sha256:".length)}`
  ) {
    fail("requestId does not derive from the candidate");
  }
  if (
    value.repositoryAnchorLogPrefix.recordCount !== candidate.sequence ||
    value.repositoryAnchorLogPrefix.lastRecordSha256 !== candidate.recordSha256
  ) {
    fail("request repository prefix does not end at the candidate");
  }
  if (
    verification.sequence !== candidate.sequence + 1 ||
    verification.predecessorRecordSha256 !== candidate.recordSha256 ||
    verification.candidateRecordSha256 !== candidate.recordSha256 ||
    verification.verificationId !==
      expectedVerificationId(candidate.recordSha256)
  ) {
    fail("request verification does not bind the exact candidate");
  }
  if (
    value.preparedAt !== verification.verifiedAt ||
    Date.parse(value.preparedAt) < Date.parse(candidate.createdAt)
  ) {
    fail("request verification time is inconsistent");
  }
  const expectedEvidence = domainHash(
    EXTERNAL_EVIDENCE_HASH_DOMAIN,
    evidenceIntent(value),
  );
  if (verification.evidenceSha256 !== expectedEvidence) {
    fail("request evidence-intent hash mismatch");
  }
  if (
    value.requestSha256 !==
    hashWithoutField(EXTERNAL_REQUEST_HASH_DOMAIN, value, "requestSha256")
  ) {
    fail("request self-hash mismatch");
  }
  return value;
}

function validateLedgerRecord(value) {
  exactKeys(
    value,
    [
      "schemaVersion",
      "recordType",
      "projectId",
      "ledgerId",
      "sequence",
      "predecessorRecordSha256",
      "requestSha256",
      "candidateAnchorId",
      "candidateRecordSha256",
      "verificationId",
      "verificationRecordSha256",
      "verifierId",
      "method",
      "evidenceSha256",
      "repositoryAnchorLogPrefix",
      "repositoryBaselineInputs",
      "appendedAt",
      "recordSha256",
    ],
    "ledger record",
  );
  requireLiteral(value.schemaVersion, SCHEMA_VERSION, "record.schemaVersion");
  requireLiteral(
    value.recordType,
    "trusted_anchor_append",
    "record.recordType",
  );
  requireLiteral(value.projectId, PROJECT_ID, "record.projectId");
  requireLiteral(value.ledgerId, LEDGER_ID, "record.ledgerId");
  requirePositiveInteger(value.sequence, "record.sequence");
  if (value.predecessorRecordSha256 !== null) {
    requireSha256(
      value.predecessorRecordSha256,
      "record.predecessorRecordSha256",
    );
  }
  requireSha256(value.requestSha256, "record.requestSha256");
  requireIdentifier(value.candidateAnchorId, "record.candidateAnchorId");
  requireSha256(value.candidateRecordSha256, "record.candidateRecordSha256");
  requireIdentifier(value.verificationId, "record.verificationId");
  requireSha256(
    value.verificationRecordSha256,
    "record.verificationRecordSha256",
  );
  requireLiteral(value.verifierId, VERIFIER_ID, "record.verifierId");
  requireLiteral(value.method, "controlled_project_identity", "record.method");
  requireSha256(value.evidenceSha256, "record.evidenceSha256");
  validateRepositoryPrefix(value.repositoryAnchorLogPrefix);
  validateBaselineInputs(value.repositoryBaselineInputs);
  requireDateTime(value.appendedAt, "record.appendedAt");
  requireSha256(value.recordSha256, "record.recordSha256");
  if (
    value.repositoryAnchorLogPrefix.lastRecordSha256 !==
    value.candidateRecordSha256
  ) {
    fail("ledger record repository prefix does not end at its candidate");
  }
  if (
    value.recordSha256 !==
    hashWithoutField(EXTERNAL_RECORD_HASH_DOMAIN, value, "recordSha256")
  ) {
    fail("ledger record self-hash mismatch");
  }
  return value;
}

function validateHead(value) {
  exactKeys(
    value,
    [
      "schemaVersion",
      "recordType",
      "projectId",
      "ledgerId",
      "recordCount",
      "ledgerFileSha256",
      "ledgerSizeBytes",
      "firstRecordSha256",
      "latestRecordSha256",
      "latestCandidateRecordSha256",
      "latestVerificationRecordSha256",
      "updatedAt",
      "headSha256",
    ],
    "ledger head",
  );
  requireLiteral(value.schemaVersion, SCHEMA_VERSION, "head.schemaVersion");
  requireLiteral(
    value.recordType,
    "external_anchor_ledger_head",
    "head.recordType",
  );
  requireLiteral(value.projectId, PROJECT_ID, "head.projectId");
  requireLiteral(value.ledgerId, LEDGER_ID, "head.ledgerId");
  requirePositiveInteger(value.recordCount, "head.recordCount");
  requireSha256(value.ledgerFileSha256, "head.ledgerFileSha256");
  requirePositiveInteger(value.ledgerSizeBytes, "head.ledgerSizeBytes");
  requireSha256(value.firstRecordSha256, "head.firstRecordSha256");
  requireSha256(value.latestRecordSha256, "head.latestRecordSha256");
  requireSha256(
    value.latestCandidateRecordSha256,
    "head.latestCandidateRecordSha256",
  );
  requireSha256(
    value.latestVerificationRecordSha256,
    "head.latestVerificationRecordSha256",
  );
  requireDateTime(value.updatedAt, "head.updatedAt");
  requireSha256(value.headSha256, "head.headSha256");
  if (
    value.headSha256 !==
    hashWithoutField(EXTERNAL_HEAD_HASH_DOMAIN, value, "headSha256")
  ) {
    fail("ledger head self-hash mismatch");
  }
  return value;
}

function parseCanonicalLedger(bytes) {
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  if (text.length === 0 || !text.endsWith("\n")) {
    fail("ledger must be non-empty canonical JSONL ending in a newline");
  }
  return text
    .slice(0, -1)
    .split("\n")
    .map((line, index) => {
      let value;
      try {
        value = JSON.parse(line);
      } catch (error) {
        fail(`ledger line ${index + 1} is invalid JSON: ${error.message}`);
      }
      const record = validateLedgerRecord(value);
      if (line !== JSON.stringify(record)) {
        fail(`ledger line ${index + 1} is not canonical JSONL`);
      }
      return record;
    });
}

export function validateLedgerSnapshot({ ledgerBytes, headBytes }) {
  const records = parseCanonicalLedger(ledgerBytes);
  let headValue;
  try {
    headValue = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(headBytes),
    );
  } catch (error) {
    fail(`ledger head is invalid JSON or UTF-8: ${error.message}`);
  }
  const head = validateHead(headValue);
  if (headBytes.toString("utf8") !== `${JSON.stringify(head, null, 2)}\n`) {
    fail("ledger head is not canonical pretty JSON");
  }
  const requests = new Set();
  const candidates = new Set();
  const candidateIds = new Set();
  const verifications = new Set();
  const verificationIds = new Set();
  let predecessor = null;
  let previousAt = null;
  let previousRepositoryCount = null;
  for (const [index, record] of records.entries()) {
    if (
      record.sequence !== index + 1 ||
      record.predecessorRecordSha256 !== predecessor
    ) {
      fail(`ledger record ${record.sequence} breaks the full hash chain`);
    }
    if (
      requests.has(record.requestSha256) ||
      candidates.has(record.candidateRecordSha256) ||
      candidateIds.has(record.candidateAnchorId) ||
      verifications.has(record.verificationRecordSha256) ||
      verificationIds.has(record.verificationId)
    ) {
      fail(`ledger record ${record.sequence} duplicates a trust binding`);
    }
    if (
      previousRepositoryCount === null
        ? record.repositoryAnchorLogPrefix.recordCount !== 1
        : record.repositoryAnchorLogPrefix.recordCount !==
          previousRepositoryCount + 2
    ) {
      fail(
        `ledger record ${record.sequence} breaks the repository prefix chain`,
      );
    }
    const appendedAt = Date.parse(record.appendedAt);
    if (previousAt !== null && appendedAt < previousAt) {
      fail(`ledger record ${record.sequence} regresses time`);
    }
    requests.add(record.requestSha256);
    candidates.add(record.candidateRecordSha256);
    candidateIds.add(record.candidateAnchorId);
    verifications.add(record.verificationRecordSha256);
    verificationIds.add(record.verificationId);
    predecessor = record.recordSha256;
    previousAt = appendedAt;
    previousRepositoryCount = record.repositoryAnchorLogPrefix.recordCount;
  }
  const first = records[0];
  const latest = records.at(-1);
  if (
    head.recordCount !== records.length ||
    head.ledgerFileSha256 !== rawSha256(ledgerBytes) ||
    head.ledgerSizeBytes !== ledgerBytes.length ||
    head.firstRecordSha256 !== first.recordSha256 ||
    head.latestRecordSha256 !== latest.recordSha256 ||
    head.latestCandidateRecordSha256 !== latest.candidateRecordSha256 ||
    head.latestVerificationRecordSha256 !== latest.verificationRecordSha256 ||
    head.updatedAt !== latest.appendedAt
  ) {
    fail("head does not exactly bind the complete ledger and latest record");
  }
  return {
    records,
    head,
    ledgerBytes: Buffer.from(ledgerBytes),
    headBytes: Buffer.from(headBytes),
  };
}

function buildLedgerFiles(records) {
  if (records.length === 0) fail("cannot build an empty initialized ledger");
  const ledgerBytes = Buffer.from(
    `${records.map((record) => JSON.stringify(record)).join("\n")}\n`,
    "utf8",
  );
  const latest = records.at(-1);
  const headBody = {
    schemaVersion: SCHEMA_VERSION,
    recordType: "external_anchor_ledger_head",
    projectId: PROJECT_ID,
    ledgerId: LEDGER_ID,
    recordCount: records.length,
    ledgerFileSha256: rawSha256(ledgerBytes),
    ledgerSizeBytes: ledgerBytes.length,
    firstRecordSha256: records[0].recordSha256,
    latestRecordSha256: latest.recordSha256,
    latestCandidateRecordSha256: latest.candidateRecordSha256,
    latestVerificationRecordSha256: latest.verificationRecordSha256,
    updatedAt: latest.appendedAt,
  };
  const head = {
    ...headBody,
    headSha256: hashWithoutField(
      EXTERNAL_HEAD_HASH_DOMAIN,
      headBody,
      "headSha256",
    ),
  };
  const headBytes = Buffer.from(`${JSON.stringify(head, null, 2)}\n`, "utf8");
  return { ledgerBytes, headBytes, head };
}

function headPrecondition(snapshot) {
  return snapshot
    ? {
        recordCount: snapshot.head.recordCount,
        latestRecordSha256: snapshot.head.latestRecordSha256,
        headSha256: snapshot.head.headSha256,
      }
    : null;
}

function requireRequestIsLatest(request, snapshot) {
  const latest = snapshot.records.at(-1);
  const previousRecords = snapshot.records.slice(0, -1);
  const previousSnapshot =
    previousRecords.length === 0
      ? null
      : validateLedgerSnapshot(buildLedgerFiles(previousRecords));
  if (
    !exactJson(
      request.externalHeadPrecondition,
      headPrecondition(previousSnapshot),
    ) ||
    latest.requestSha256 !== request.requestSha256 ||
    latest.candidateAnchorId !== request.candidate.anchorId ||
    latest.candidateRecordSha256 !== request.candidate.recordSha256 ||
    latest.verificationId !== request.verification.verificationId ||
    latest.verificationRecordSha256 !== request.verification.recordSha256 ||
    latest.evidenceSha256 !== request.verification.evidenceSha256 ||
    !exactJson(
      latest.repositoryAnchorLogPrefix,
      request.repositoryAnchorLogPrefix,
    ) ||
    !exactJson(
      latest.repositoryBaselineInputs,
      request.repositoryBaselineInputs,
    ) ||
    Date.parse(latest.appendedAt) < Date.parse(request.verification.verifiedAt)
  ) {
    fail("request is not the exact latest external append");
  }
}

function appendRequestToSnapshot(request, previousSnapshot, appendedAt) {
  validatePreparedRequest(request);
  requireDateTime(appendedAt, "appendedAt");
  if (Date.parse(appendedAt) < Date.parse(request.verification.verifiedAt)) {
    fail("external append predates the prepared verification");
  }
  if (
    !exactJson(
      request.externalHeadPrecondition,
      headPrecondition(previousSnapshot),
    )
  ) {
    fail("external head compare-and-swap precondition mismatch");
  }
  const previousRecords = previousSnapshot?.records ?? [];
  if (
    previousRecords.some(
      (record) =>
        record.requestSha256 === request.requestSha256 ||
        record.candidateRecordSha256 === request.candidate.recordSha256 ||
        record.verificationRecordSha256 === request.verification.recordSha256,
    )
  ) {
    fail("request, candidate or verification is a replay");
  }
  const previous = previousRecords.at(-1);
  if (previous && Date.parse(appendedAt) < Date.parse(previous.appendedAt)) {
    fail("external append timestamp regresses");
  }
  const recordBody = {
    schemaVersion: SCHEMA_VERSION,
    recordType: "trusted_anchor_append",
    projectId: PROJECT_ID,
    ledgerId: LEDGER_ID,
    sequence: previousRecords.length + 1,
    predecessorRecordSha256: previous?.recordSha256 ?? null,
    requestSha256: request.requestSha256,
    candidateAnchorId: request.candidate.anchorId,
    candidateRecordSha256: request.candidate.recordSha256,
    verificationId: request.verification.verificationId,
    verificationRecordSha256: request.verification.recordSha256,
    verifierId: VERIFIER_ID,
    method: "controlled_project_identity",
    evidenceSha256: request.verification.evidenceSha256,
    repositoryAnchorLogPrefix: request.repositoryAnchorLogPrefix,
    repositoryBaselineInputs: request.repositoryBaselineInputs,
    appendedAt,
  };
  const record = validateLedgerRecord({
    ...recordBody,
    recordSha256: hashWithoutField(
      EXTERNAL_RECORD_HASH_DOMAIN,
      recordBody,
      "recordSha256",
    ),
  });
  const files = buildLedgerFiles([...previousRecords, record]);
  return validateLedgerSnapshot(files);
}

function lstatIfExists(path) {
  try {
    return lstatSync(path);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

function pathComponents(path) {
  if (
    !isAbsolute(path) ||
    normalize(path) !== path ||
    (path !== parse(path).root && path.endsWith(sep)) ||
    path.includes("\u0000")
  ) {
    fail(`path must be absolute and normalized: ${path}`);
  }
  const root = parse(path).root;
  const components = [root];
  let current = root;
  const suffix = path.slice(root.length);
  for (const component of suffix === "" ? [] : suffix.split(sep)) {
    current = join(current, component);
    components.push(current);
  }
  return components;
}

function assertNoSymlinkPath(path, { finalMayBeAbsent = false } = {}) {
  const components = pathComponents(path);
  for (const [index, component] of components.entries()) {
    const stat = lstatIfExists(component);
    if (!stat && finalMayBeAbsent && index === components.length - 1) continue;
    if (!stat) fail(`path component is absent: ${component}`);
    if (stat.isSymbolicLink())
      fail(`path component is a symlink: ${component}`);
    if (index < components.length - 1 && !stat.isDirectory()) {
      fail(`path component is not a directory: ${component}`);
    }
  }
  return components;
}

function fileIdentity(stat) {
  return {
    dev: stat.dev,
    ino: stat.ino,
    size: stat.size,
    mode: stat.mode,
    uid: stat.uid,
    nlink: stat.nlink,
    mtimeMs: stat.mtimeMs,
    ctimeMs: stat.ctimeMs,
  };
}

function sameIdentity(left, right) {
  return exactJson(fileIdentity(left), fileIdentity(right));
}

function assertExternalRoot(policy) {
  const components = assertNoSymlinkPath(policy.externalRoot);
  const target = lstatSync(policy.externalRoot);
  if (!target.isDirectory()) fail("external root is not a directory");
  if (target.uid !== policy.expectedUid) fail("external root owner is invalid");
  if ((target.mode & 0o777) !== 0o755) {
    fail("external root mode must be exactly 0755");
  }
  if (policy.requireSecureAncestors) {
    for (const component of components) {
      const stat = lstatSync(component);
      if (stat.uid !== policy.expectedUid) {
        fail(`secure path component has the wrong owner: ${component}`);
      }
      if ((stat.mode & 0o022) !== 0) {
        fail(`secure path component is group- or world-writable: ${component}`);
      }
    }
  }
}

function readSecureFile(path, policy, expectedMode) {
  assertNoSymlinkPath(path);
  const before = lstatSync(path);
  if (!before.isFile()) fail(`secure path is not a regular file: ${path}`);
  if (before.uid !== policy.expectedUid)
    fail(`secure file owner is invalid: ${path}`);
  if ((before.mode & 0o777) !== expectedMode) {
    fail(`secure file mode is invalid: ${path}`);
  }
  if (before.nlink !== 1) fail(`secure file has multiple hard links: ${path}`);
  const descriptor = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const openedBefore = fstatSync(descriptor);
    const bytes = readFileSync(descriptor);
    const openedAfter = fstatSync(descriptor);
    const afterPath = lstatSync(path);
    if (
      !openedBefore.isFile() ||
      openedBefore.uid !== policy.expectedUid ||
      (openedBefore.mode & 0o777) !== expectedMode ||
      openedBefore.nlink !== 1 ||
      !sameIdentity(openedBefore, openedAfter) ||
      !sameIdentity(openedAfter, afterPath) ||
      bytes.length !== openedBefore.size
    ) {
      fail(`secure file changed while it was read: ${path}`);
    }
    return { bytes, identity: fileIdentity(openedBefore) };
  } finally {
    closeSync(descriptor);
  }
}

function readPreparedRequest(path, policy) {
  assertNoSymlinkPath(path);
  const relation = relative(policy.externalRoot, path);
  if (
    relation === "" ||
    (!relation.startsWith(`..${sep}`) && relation !== "..")
  ) {
    fail("prepared request must be outside the external ledger root");
  }
  const before = lstatSync(path);
  if (!before.isFile() || before.nlink !== 1) {
    fail("prepared request must be a single-link regular file");
  }
  const descriptor = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const openedBefore = fstatSync(descriptor);
    const bytes = readFileSync(descriptor);
    const openedAfter = fstatSync(descriptor);
    const afterPath = lstatSync(path);
    if (
      !openedBefore.isFile() ||
      openedBefore.nlink !== 1 ||
      !sameIdentity(openedBefore, openedAfter) ||
      !sameIdentity(openedAfter, afterPath) ||
      bytes.length !== openedBefore.size
    ) {
      fail("prepared request changed while it was read");
    }
    let value;
    try {
      value = JSON.parse(
        new TextDecoder("utf-8", { fatal: true }).decode(bytes),
      );
    } catch (error) {
      fail(`prepared request is invalid JSON or UTF-8: ${error.message}`);
    }
    const request = validatePreparedRequest(value);
    if (bytes.toString("utf8") !== `${JSON.stringify(request, null, 2)}\n`) {
      fail("prepared request is not canonical pretty JSON");
    }
    return request;
  } finally {
    closeSync(descriptor);
  }
}

function assertNoLock(policy, allowedLockIdentity = null) {
  const lockPath = join(policy.externalRoot, LOCK_FILE);
  const stat = lstatIfExists(lockPath);
  if (!stat) {
    if (allowedLockIdentity) fail("owned append lock disappeared during write");
    return;
  }
  if (stat.isSymbolicLink()) fail("append lock path is a symlink");
  if (
    !allowedLockIdentity ||
    !exactJson(fileIdentity(stat), allowedLockIdentity)
  ) {
    fail("append lock is present; refusing a concurrent or stale operation");
  }
}

function checkDirectoryEntries(policy, allowedLockIdentity = null) {
  const allowed = new Set([LEDGER_FILE, HEAD_FILE]);
  if (allowedLockIdentity) allowed.add(LOCK_FILE);
  const unexpected = readdirSync(policy.externalRoot).filter(
    (entry) => !allowed.has(entry),
  );
  if (unexpected.length > 0) {
    fail(`external root contains unexpected entries: ${unexpected.join(", ")}`);
  }
}

function loadExternalState(policy, options = {}) {
  assertExternalRoot(policy);
  assertNoLock(policy, options.allowedLockIdentity ?? null);
  checkDirectoryEntries(policy, options.allowedLockIdentity ?? null);
  const ledgerPath = join(policy.externalRoot, LEDGER_FILE);
  const headPath = join(policy.externalRoot, HEAD_FILE);
  const ledgerStat = lstatIfExists(ledgerPath);
  const headStat = lstatIfExists(headPath);
  if (ledgerStat?.isSymbolicLink() || headStat?.isSymbolicLink()) {
    fail("ledger or head path is a symlink");
  }
  if (!ledgerStat || !headStat) {
    if (Boolean(ledgerStat) !== Boolean(headStat)) {
      fail("ledger and head must either both exist or both be absent");
    }
    if (options.allowEmpty) return null;
    fail("external ledger is not initialized");
  }
  const ledger = readSecureFile(ledgerPath, policy, 0o444);
  const head = readSecureFile(headPath, policy, 0o444);
  assertNoLock(policy, options.allowedLockIdentity ?? null);
  if (
    !exactJson(ledger.identity, fileIdentity(lstatSync(ledgerPath))) ||
    !exactJson(head.identity, fileIdentity(lstatSync(headPath)))
  ) {
    fail("ledger or head changed during snapshot read");
  }
  return validateLedgerSnapshot({
    ledgerBytes: ledger.bytes,
    headBytes: head.bytes,
  });
}

function fsyncDirectory(path) {
  const descriptor = openSync(
    path,
    constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW,
  );
  try {
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
}

function writeDurableTemporary(path, bytes, policy) {
  assertNoSymlinkPath(path, { finalMayBeAbsent: true });
  const descriptor = openSync(
    path,
    constants.O_WRONLY |
      constants.O_CREAT |
      constants.O_EXCL |
      constants.O_NOFOLLOW,
    0o400,
  );
  try {
    const created = fstatSync(descriptor);
    if (
      !created.isFile() ||
      created.uid !== policy.expectedUid ||
      created.nlink !== 1
    ) {
      fail(`temporary file security check failed: ${path}`);
    }
    writeFileSync(descriptor, bytes);
    fchmodSync(descriptor, 0o444);
    fsyncSync(descriptor);
    const finalized = fstatSync(descriptor);
    if (finalized.size !== bytes.length || (finalized.mode & 0o777) !== 0o444) {
      fail(`temporary file durability check failed: ${path}`);
    }
    return fileIdentity(finalized);
  } finally {
    closeSync(descriptor);
  }
}

function acquireLock(policy, request, startedAt) {
  const lockPath = join(policy.externalRoot, LOCK_FILE);
  assertNoSymlinkPath(lockPath, { finalMayBeAbsent: true });
  let descriptor;
  try {
    descriptor = openSync(
      lockPath,
      constants.O_WRONLY |
        constants.O_CREAT |
        constants.O_EXCL |
        constants.O_NOFOLLOW,
      0o600,
    );
  } catch (error) {
    if (error.code === "EEXIST") {
      fail("exclusive append lock already exists");
    }
    throw error;
  }
  const lockBody = {
    schemaVersion: "corpus-external-anchor-writer-lock-v1",
    pid: process.pid,
    requestSha256: request.requestSha256,
    startedAt,
  };
  writeFileSync(descriptor, `${JSON.stringify(lockBody)}\n`);
  fchmodSync(descriptor, 0o600);
  fsyncSync(descriptor);
  const stat = fstatSync(descriptor);
  if (
    !stat.isFile() ||
    stat.uid !== policy.expectedUid ||
    stat.nlink !== 1 ||
    (stat.mode & 0o777) !== 0o600
  ) {
    closeSync(descriptor);
    fail("exclusive append lock security check failed");
  }
  fsyncDirectory(policy.externalRoot);
  return { path: lockPath, descriptor, identity: fileIdentity(stat) };
}

function releaseOwnedLock(lock, policy) {
  const stat = lstatSync(lock.path);
  if (
    stat.isSymbolicLink() ||
    !exactJson(fileIdentity(stat), lock.identity) ||
    stat.uid !== policy.expectedUid ||
    (stat.mode & 0o777) !== 0o600 ||
    stat.nlink !== 1
  ) {
    fail("refusing to remove a lock whose identity changed");
  }
  unlinkSync(lock.path);
  fsyncDirectory(policy.externalRoot);
  closeSync(lock.descriptor);
}

function closePreservedLock(lock) {
  if (lock) closeSync(lock.descriptor);
}

function removeOwnedTemporary(path, identity, policy) {
  if (!identity) return;
  const stat = lstatIfExists(path);
  if (!stat) return;
  if (
    stat.isSymbolicLink() ||
    stat.uid !== policy.expectedUid ||
    stat.nlink !== 1 ||
    !exactJson(fileIdentity(stat), identity)
  ) {
    fail(`refusing to remove a changed temporary file: ${path}`);
  }
  unlinkSync(path);
}

function callFault(policy, point) {
  policy.faultInjector?.(point);
}

/**
 * @param {{
 *   externalRoot: string;
 *   expectedUid?: number;
 *   faultInjector?: ((point: string) => void) | null;
 * }} input
 */
export function createTestPolicy({
  externalRoot,
  expectedUid = process.getuid?.() ?? 0,
  faultInjector = null,
}) {
  return {
    externalRoot,
    expectedUid,
    requireSecureAncestors: false,
    faultInjector,
  };
}

export function checkExternalLedgerForPolicy(
  policy,
  { allowEmpty = true } = {},
) {
  const snapshot = loadExternalState(policy, { allowEmpty });
  return snapshot
    ? {
        initialized: true,
        recordCount: snapshot.head.recordCount,
        latestRecordSha256: snapshot.head.latestRecordSha256,
        latestCandidateRecordSha256: snapshot.head.latestCandidateRecordSha256,
        latestVerificationRecordSha256:
          snapshot.head.latestVerificationRecordSha256,
      }
    : { initialized: false, recordCount: 0 };
}

export function appendPreparedRequestForPolicy({
  requestPath,
  policy,
  now = () => new Date().toISOString(),
}) {
  assertExternalRoot(policy);
  const request = readPreparedRequest(requestPath, policy);
  const startedAt = now();
  requireDateTime(startedAt, "writer lock time");
  let lock = null;
  let ledgerTemporaryIdentity = null;
  let headTemporaryIdentity = null;
  let mutationStarted = false;
  let success = false;
  const suffix = request.requestSha256.slice("sha256:".length);
  const ledgerTemporary = join(
    policy.externalRoot,
    `.corpus-event-history-anchors.${suffix}.ledger.tmp`,
  );
  const headTemporary = join(
    policy.externalRoot,
    `.corpus-event-history-anchors.${suffix}.head.tmp`,
  );
  try {
    lock = acquireLock(policy, request, startedAt);
    callFault(policy, "after_lock");
    const previous = loadExternalState(policy, {
      allowEmpty: true,
      allowedLockIdentity: lock.identity,
    });
    callFault(policy, "after_snapshot_read");
    const appendedAt = now();
    const next = appendRequestToSnapshot(request, previous, appendedAt);
    ledgerTemporaryIdentity = writeDurableTemporary(
      ledgerTemporary,
      next.ledgerBytes,
      policy,
    );
    headTemporaryIdentity = writeDurableTemporary(
      headTemporary,
      next.headBytes,
      policy,
    );
    fsyncDirectory(policy.externalRoot);
    callFault(policy, "after_temp_files_fsynced");
    renameSync(ledgerTemporary, join(policy.externalRoot, LEDGER_FILE));
    mutationStarted = true;
    ledgerTemporaryIdentity = null;
    fsyncDirectory(policy.externalRoot);
    callFault(policy, "after_ledger_replace");
    renameSync(headTemporary, join(policy.externalRoot, HEAD_FILE));
    headTemporaryIdentity = null;
    fsyncDirectory(policy.externalRoot);
    callFault(policy, "after_head_replace");
    const observed = loadExternalState(policy, {
      allowEmpty: false,
      allowedLockIdentity: lock.identity,
    });
    requireRequestIsLatest(request, observed);
    if (
      observed.head.headSha256 !== next.head.headSha256 ||
      observed.head.latestRecordSha256 !== next.head.latestRecordSha256
    ) {
      fail("post-write verification differs from the prepared transaction");
    }
    callFault(policy, "after_postverify");
    success = true;
    return {
      status: "external_anchor_append_committed",
      requestSha256: request.requestSha256,
      recordCount: observed.head.recordCount,
      latestRecordSha256: observed.head.latestRecordSha256,
      latestCandidateRecordSha256: observed.head.latestCandidateRecordSha256,
      latestVerificationRecordSha256:
        observed.head.latestVerificationRecordSha256,
      repositoryModified: false,
      repositoryVerificationAppended: false,
      humanContentValidationClaimed: false,
      independentExternalNotarizationClaimed: false,
    };
  } finally {
    if (!mutationStarted) {
      removeOwnedTemporary(ledgerTemporary, ledgerTemporaryIdentity, policy);
      removeOwnedTemporary(headTemporary, headTemporaryIdentity, policy);
    }
    if (lock) {
      if (success || !mutationStarted) {
        releaseOwnedLock(lock, policy);
      } else {
        closePreservedLock(lock);
      }
    }
  }
}

function validateInstallManifest(value) {
  exactKeys(
    value,
    [
      "schemaVersion",
      "packageId",
      "packageVersion",
      "writerArtifact",
      "installManifest",
      "nodeRuntime",
      "externalLedger",
      "safetyBoundary",
    ],
    "install manifest",
  );
  requireLiteral(
    value.schemaVersion,
    "root-anchor-writer-install-v1",
    "manifest schema",
  );
  requireLiteral(
    value.packageId,
    "food-systems-corpus-anchor-root-writer",
    "manifest packageId",
  );
  requireLiteral(
    value.packageVersion,
    WRITER_VERSION,
    "manifest packageVersion",
  );
  exactKeys(
    value.writerArtifact,
    ["sourcePath", "installPath", "sha256", "sizeBytes", "mode", "ownerUid"],
    "manifest.writerArtifact",
  );
  requireRepositoryPath(value.writerArtifact.sourcePath, "writer sourcePath");
  requireLiteral(
    value.writerArtifact.installPath,
    FIXED_WRITER_PATH,
    "writer installPath",
  );
  requireSha256(value.writerArtifact.sha256, "writer sha256");
  requirePositiveInteger(value.writerArtifact.sizeBytes, "writer sizeBytes");
  requireLiteral(value.writerArtifact.mode, "0555", "writer mode");
  requireLiteral(value.writerArtifact.ownerUid, 0, "writer ownerUid");
  exactKeys(
    value.installManifest,
    ["sourcePath", "installPath", "mode", "ownerUid"],
    "manifest.installManifest",
  );
  requireRepositoryPath(
    value.installManifest.sourcePath,
    "manifest sourcePath",
  );
  requireLiteral(
    value.installManifest.installPath,
    FIXED_INSTALL_MANIFEST_PATH,
    "manifest installPath",
  );
  requireLiteral(value.installManifest.mode, "0444", "manifest mode");
  requireLiteral(value.installManifest.ownerUid, 0, "manifest ownerUid");
  exactKeys(
    value.nodeRuntime,
    ["path", "minimumMajor", "rootOwned", "noSymlink", "writableByNonRoot"],
    "manifest.nodeRuntime",
  );
  requireLiteral(value.nodeRuntime.path, FIXED_NODE_PATH, "node runtime path");
  if (
    !Number.isInteger(value.nodeRuntime.minimumMajor) ||
    value.nodeRuntime.minimumMajor < 20
  ) {
    fail("node runtime minimum major is invalid");
  }
  requireLiteral(value.nodeRuntime.rootOwned, true, "node rootOwned");
  requireLiteral(value.nodeRuntime.noSymlink, true, "node noSymlink");
  requireLiteral(
    value.nodeRuntime.writableByNonRoot,
    false,
    "node writableByNonRoot",
  );
  exactKeys(
    value.externalLedger,
    [
      "rootPath",
      "rootMode",
      "ledgerFile",
      "headFile",
      "dataFileMode",
      "lockFile",
      "lockMode",
    ],
    "manifest.externalLedger",
  );
  requireLiteral(
    value.externalLedger.rootPath,
    FIXED_EXTERNAL_ROOT,
    "ledger rootPath",
  );
  requireLiteral(value.externalLedger.rootMode, "0755", "ledger rootMode");
  requireLiteral(value.externalLedger.ledgerFile, LEDGER_FILE, "ledger file");
  requireLiteral(value.externalLedger.headFile, HEAD_FILE, "head file");
  requireLiteral(value.externalLedger.dataFileMode, "0444", "data mode");
  requireLiteral(value.externalLedger.lockFile, LOCK_FILE, "lock file");
  requireLiteral(value.externalLedger.lockMode, "0600", "lock mode");
  exactKeys(
    value.safetyBoundary,
    [
      "repositoryWritesAllowed",
      "internalVerificationAppendAllowed",
      "automaticLedgerDeletionAllowed",
      "humanValidationClaimed",
      "independentNotarizationClaimed",
    ],
    "manifest.safetyBoundary",
  );
  for (const key of Object.keys(value.safetyBoundary)) {
    requireLiteral(value.safetyBoundary[key], false, `safetyBoundary.${key}`);
  }
  return value;
}

function assertSecureExecutable(path, expectedUid) {
  const components = assertNoSymlinkPath(path);
  for (const component of components.slice(0, -1)) {
    const stat = lstatSync(component);
    if (stat.uid !== expectedUid || (stat.mode & 0o022) !== 0) {
      fail(`runtime path component is not root-controlled: ${component}`);
    }
  }
  const stat = lstatSync(path);
  if (
    !stat.isFile() ||
    stat.uid !== expectedUid ||
    (stat.mode & 0o022) !== 0 ||
    (stat.mode & 0o111) === 0 ||
    stat.nlink !== 1
  ) {
    fail("node runtime is not a single-link root-controlled executable");
  }
}

function validateInstalledPackage() {
  if ((process.getuid?.() ?? -1) !== 0) fail("writer CLI must run as uid 0");
  if (process.execPath !== FIXED_NODE_PATH) {
    fail(`writer requires the fixed Node runtime ${FIXED_NODE_PATH}`);
  }
  assertSecureExecutable(FIXED_NODE_PATH, 0);
  const currentPath = fileURLToPath(import.meta.url);
  if (
    currentPath !== FIXED_WRITER_PATH ||
    realpathSync(currentPath) !== FIXED_WRITER_PATH
  ) {
    fail("writer is not running from its fixed libexec path");
  }
  const policy = {
    externalRoot: FIXED_INSTALL_DIRECTORY,
    expectedUid: 0,
    requireSecureAncestors: true,
  };
  assertExternalRoot(policy);
  const writer = readSecureFile(FIXED_WRITER_PATH, policy, 0o555);
  const manifestFile = readSecureFile(
    FIXED_INSTALL_MANIFEST_PATH,
    policy,
    0o444,
  );
  let manifestValue;
  try {
    manifestValue = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(manifestFile.bytes),
    );
  } catch (error) {
    fail(`install manifest is invalid JSON or UTF-8: ${error.message}`);
  }
  const manifest = validateInstallManifest(manifestValue);
  if (
    manifestFile.bytes.toString("utf8") !==
    `${JSON.stringify(manifest, null, 2)}\n`
  ) {
    fail("install manifest is not canonical pretty JSON");
  }
  if (
    manifest.writerArtifact.sha256 !== rawSha256(writer.bytes) ||
    manifest.writerArtifact.sizeBytes !== writer.bytes.length
  ) {
    fail("installed writer differs from the audited manifest");
  }
  const major = Number(process.versions.node.split(".")[0]);
  if (major < manifest.nodeRuntime.minimumMajor) {
    fail("installed Node runtime is older than the audited minimum");
  }
  return manifest;
}

function productionPolicy() {
  return {
    externalRoot: FIXED_EXTERNAL_ROOT,
    expectedUid: 0,
    requireSecureAncestors: true,
    faultInjector: null,
  };
}

function parseCli(args) {
  if (args.length === 1 && args[0] === "check") {
    return { mode: "check", requestPath: null };
  }
  if (
    args.length === 2 &&
    args[0] === "append" &&
    args[1].startsWith("--request=") &&
    args[1].slice("--request=".length) !== ""
  ) {
    const requestPath = args[1].slice("--request=".length);
    if (!isAbsolute(requestPath)) fail("request path must be absolute");
    return { mode: "append", requestPath };
  }
  fail(
    "usage: corpus-anchor-root-writer.mjs check | append --request=/absolute/path",
  );
}

function main() {
  const options = parseCli(process.argv.slice(2));
  validateInstalledPackage();
  const policy = productionPolicy();
  const result =
    options.mode === "check"
      ? {
          status: "root_anchor_writer_check_passed",
          ...checkExternalLedgerForPolicy(policy, { allowEmpty: true }),
          repositoryModified: false,
          humanContentValidationClaimed: false,
          independentExternalNotarizationClaimed: false,
        }
      : appendPreparedRequestForPolicy({
          requestPath: options.requestPath,
          policy,
        });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
