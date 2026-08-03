import { createHash } from "node:crypto";
import {
  closeSync,
  constants,
  fstatSync,
  lstatSync,
  openSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import {
  isAbsolute,
  join,
  normalize,
  parse,
  relative,
  resolve,
  sep,
} from "node:path";

import { z } from "zod";

import {
  canonicalCorpusJson,
  type CorpusCanonicalJsonValue,
} from "./corpus-processing-lifecycle";
import {
  corpusEventHistoryAnchorCandidateSchema,
  corpusEventHistoryTrustedVerificationSchema,
  hashCorpusEventHistoryAnchorRecord,
  sealCorpusEventHistoryAnchorRecord,
  validateCorpusEventHistoryAnchorRecord,
  type CorpusEventHistoryAnchorCandidate,
  type CorpusEventHistoryTrustedVerification,
  type VerifyTrustedCorpusEventHistoryAnchor,
} from "./corpus-processing-event-history";

export const CORPUS_EXTERNAL_ANCHOR_LEDGER_SCHEMA_VERSION =
  "corpus-event-history-external-anchor-ledger-v1" as const;
export const CORPUS_EXTERNAL_ANCHOR_PROJECT_ID = "food-systems-2026" as const;
export const CORPUS_EXTERNAL_ANCHOR_LEDGER_ID =
  "food-systems.corpus-event-history" as const;
export const CORPUS_EXTERNAL_ANCHOR_VERIFIER_ID =
  "project-identity.food-systems.root-ledger.v1" as const;
export const CORPUS_REPOSITORY_EVENT_HISTORY_ANCHOR_PATH =
  "knowledge/corpus/corpus-processing-state-event-history-anchors.v1.jsonl" as const;
export const CORPUS_REPOSITORY_BASELINE_PATH =
  "knowledge/corpus/corpus-processing-baseline.v1.json" as const;
export const CORPUS_REPOSITORY_PROCESSING_REGISTER_PATH =
  "knowledge/corpus/corpus-processing-register.v1.jsonl" as const;
export const CORPUS_REPOSITORY_BASELINE_GENERATION_MANIFEST_PATH =
  "knowledge/corpus/corpus-processing-generation-manifest.v1.json" as const;

export const CORPUS_EXTERNAL_ANCHOR_LEDGER_FILE =
  "corpus-event-history-anchors.v1.jsonl" as const;
export const CORPUS_EXTERNAL_ANCHOR_HEAD_FILE =
  "corpus-event-history-anchors-head.v1.json" as const;
export const CORPUS_EXTERNAL_ANCHOR_LOCK_FILE =
  ".corpus-event-history-anchors.append.lock" as const;

export const CORPUS_EXTERNAL_ANCHOR_EVIDENCE_HASH_DOMAIN =
  "food-systems/corpus-external-anchor-evidence/v1\n" as const;
export const CORPUS_EXTERNAL_ANCHOR_REQUEST_HASH_DOMAIN =
  "food-systems/corpus-external-anchor-request/v1\n" as const;
export const CORPUS_EXTERNAL_ANCHOR_RECORD_HASH_DOMAIN =
  "food-systems/corpus-external-anchor-record/v1\n" as const;
export const CORPUS_EXTERNAL_ANCHOR_HEAD_HASH_DOMAIN =
  "food-systems/corpus-external-anchor-head/v1\n" as const;

const sha256Schema = z.string().regex(/^sha256:[a-f0-9]{64}$/);
const identifierSchema = z.string().regex(/^[a-z0-9][a-z0-9._:-]*$/);
const dateTimeSchema = z
  .string()
  .refine(
    (value) =>
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
        value,
      ) && Number.isFinite(Date.parse(value)),
    "Expected an ISO 8601 date-time with an explicit UTC offset",
  );
const repositoryPathSchema = z
  .string()
  .min(1)
  .refine((value) => {
    if (
      value.startsWith("/") ||
      value.startsWith("~") ||
      value.includes("\\") ||
      /^[A-Za-z][A-Za-z0-9+.-]*:/.test(value) ||
      /[\u0000-\u001f\u007f]/.test(value)
    )
      return false;
    return value
      .split("/")
      .every(
        (segment) => segment.length > 0 && segment !== "." && segment !== "..",
      );
  }, "Expected a portable repository-relative path");

const repositoryAnchorLogPrefixSchema = z
  .object({
    path: repositoryPathSchema,
    fileSha256: sha256Schema,
    sizeBytes: z.number().int().positive(),
    recordCount: z.number().int().positive(),
    lastRecordSha256: sha256Schema,
  })
  .strict();

const nonEmptyFileBindingSchema = z
  .object({
    path: repositoryPathSchema,
    fileSha256: sha256Schema,
    sizeBytes: z.number().int().positive(),
  })
  .strict();

export const corpusExternalAnchorRepositoryBaselineInputsSchema = z
  .object({
    baseline: nonEmptyFileBindingSchema.extend({
      path: z.literal(CORPUS_REPOSITORY_BASELINE_PATH),
    }),
    processingRegister: nonEmptyFileBindingSchema.extend({
      path: z.literal(CORPUS_REPOSITORY_PROCESSING_REGISTER_PATH),
    }),
    baselineGenerationManifest: nonEmptyFileBindingSchema.extend({
      path: z.literal(CORPUS_REPOSITORY_BASELINE_GENERATION_MANIFEST_PATH),
    }),
  })
  .strict();

export const corpusExternalAnchorHeadPreconditionSchema = z
  .object({
    recordCount: z.number().int().positive(),
    latestRecordSha256: sha256Schema,
    headSha256: sha256Schema,
  })
  .strict();

export const corpusExternalAnchorAppendRequestSchema = z
  .object({
    schemaVersion: z.literal(CORPUS_EXTERNAL_ANCHOR_LEDGER_SCHEMA_VERSION),
    artifactType: z.literal("external_anchor_append_request"),
    projectId: z.literal(CORPUS_EXTERNAL_ANCHOR_PROJECT_ID),
    ledgerId: z.literal(CORPUS_EXTERNAL_ANCHOR_LEDGER_ID),
    requestId: identifierSchema,
    repositoryAnchorLogPrefix: repositoryAnchorLogPrefixSchema,
    repositoryBaselineInputs:
      corpusExternalAnchorRepositoryBaselineInputsSchema,
    candidate: corpusEventHistoryAnchorCandidateSchema,
    verification: corpusEventHistoryTrustedVerificationSchema,
    externalHeadPrecondition:
      corpusExternalAnchorHeadPreconditionSchema.nullable(),
    preparedAt: dateTimeSchema,
    requestSha256: sha256Schema,
  })
  .strict();

export const corpusExternalAnchorLedgerRecordSchema = z
  .object({
    schemaVersion: z.literal(CORPUS_EXTERNAL_ANCHOR_LEDGER_SCHEMA_VERSION),
    recordType: z.literal("trusted_anchor_append"),
    projectId: z.literal(CORPUS_EXTERNAL_ANCHOR_PROJECT_ID),
    ledgerId: z.literal(CORPUS_EXTERNAL_ANCHOR_LEDGER_ID),
    sequence: z.number().int().positive(),
    predecessorRecordSha256: sha256Schema.nullable(),
    requestSha256: sha256Schema,
    candidateAnchorId: identifierSchema,
    candidateRecordSha256: sha256Schema,
    verificationId: identifierSchema,
    verificationRecordSha256: sha256Schema,
    verifierId: z.literal(CORPUS_EXTERNAL_ANCHOR_VERIFIER_ID),
    method: z.literal("controlled_project_identity"),
    evidenceSha256: sha256Schema,
    repositoryAnchorLogPrefix: repositoryAnchorLogPrefixSchema,
    repositoryBaselineInputs:
      corpusExternalAnchorRepositoryBaselineInputsSchema,
    appendedAt: dateTimeSchema,
    recordSha256: sha256Schema,
  })
  .strict();

export const corpusExternalAnchorLedgerHeadSchema = z
  .object({
    schemaVersion: z.literal(CORPUS_EXTERNAL_ANCHOR_LEDGER_SCHEMA_VERSION),
    recordType: z.literal("external_anchor_ledger_head"),
    projectId: z.literal(CORPUS_EXTERNAL_ANCHOR_PROJECT_ID),
    ledgerId: z.literal(CORPUS_EXTERNAL_ANCHOR_LEDGER_ID),
    recordCount: z.number().int().positive(),
    ledgerFileSha256: sha256Schema,
    ledgerSizeBytes: z.number().int().positive(),
    firstRecordSha256: sha256Schema,
    latestRecordSha256: sha256Schema,
    latestCandidateRecordSha256: sha256Schema,
    latestVerificationRecordSha256: sha256Schema,
    updatedAt: dateTimeSchema,
    headSha256: sha256Schema,
  })
  .strict();

export type CorpusExternalAnchorAppendRequest = z.infer<
  typeof corpusExternalAnchorAppendRequestSchema
>;
export type CorpusExternalAnchorLedgerRecord = z.infer<
  typeof corpusExternalAnchorLedgerRecordSchema
>;
export type CorpusExternalAnchorLedgerHead = z.infer<
  typeof corpusExternalAnchorLedgerHeadSchema
>;
export type CorpusExternalAnchorRepositoryBaselineInputs = z.infer<
  typeof corpusExternalAnchorRepositoryBaselineInputsSchema
>;
export type CorpusExternalAnchorLedgerSnapshot = {
  records: CorpusExternalAnchorLedgerRecord[];
  head: CorpusExternalAnchorLedgerHead;
  ledgerBytes: Buffer;
  headBytes: Buffer;
};

function fail(message: string): never {
  throw new Error(
    `External corpus anchor ledger validation failed: ${message}`,
  );
}

function rawSha256(value: string | Buffer): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function domainHash(domain: string, value: CorpusCanonicalJsonValue): string {
  return `sha256:${createHash("sha256")
    .update(domain)
    .update(canonicalCorpusJson(value))
    .digest("hex")}`;
}

function hashWithoutField(
  domain: string,
  value: Record<string, unknown>,
  field: string,
): string {
  const body = Object.fromEntries(
    Object.entries(value).filter(([key]) => key !== field),
  );
  return domainHash(domain, body as CorpusCanonicalJsonValue);
}

function exactJson(left: unknown, right: unknown): boolean {
  return (
    canonicalCorpusJson(left as CorpusCanonicalJsonValue) ===
    canonicalCorpusJson(right as CorpusCanonicalJsonValue)
  );
}

function expectedVerificationId(candidateRecordSha256: string): string {
  return `verification.external-root-ledger.${candidateRecordSha256.slice("sha256:".length)}`;
}

function evidenceIntent(input: {
  repositoryAnchorLogPrefix: z.infer<typeof repositoryAnchorLogPrefixSchema>;
  repositoryBaselineInputs: CorpusExternalAnchorRepositoryBaselineInputs;
  candidateRecordSha256: string;
  externalHeadPrecondition: z.infer<
    typeof corpusExternalAnchorHeadPreconditionSchema
  > | null;
  verifiedAt: string;
}): CorpusCanonicalJsonValue {
  return {
    projectId: CORPUS_EXTERNAL_ANCHOR_PROJECT_ID,
    ledgerId: CORPUS_EXTERNAL_ANCHOR_LEDGER_ID,
    verifierId: CORPUS_EXTERNAL_ANCHOR_VERIFIER_ID,
    method: "controlled_project_identity",
    repositoryAnchorLogPrefix: input.repositoryAnchorLogPrefix,
    repositoryBaselineInputs: input.repositoryBaselineInputs,
    candidateRecordSha256: input.candidateRecordSha256,
    externalHeadPrecondition: input.externalHeadPrecondition,
    verifiedAt: input.verifiedAt,
  } as CorpusCanonicalJsonValue;
}

export function hashCorpusExternalAnchorAppendRequest(
  value: Record<string, unknown>,
): string {
  return hashWithoutField(
    CORPUS_EXTERNAL_ANCHOR_REQUEST_HASH_DOMAIN,
    value,
    "requestSha256",
  );
}

export function hashCorpusExternalAnchorLedgerRecord(
  value: Record<string, unknown>,
): string {
  return hashWithoutField(
    CORPUS_EXTERNAL_ANCHOR_RECORD_HASH_DOMAIN,
    value,
    "recordSha256",
  );
}

export function hashCorpusExternalAnchorLedgerHead(
  value: Record<string, unknown>,
): string {
  return hashWithoutField(
    CORPUS_EXTERNAL_ANCHOR_HEAD_HASH_DOMAIN,
    value,
    "headSha256",
  );
}

function currentHeadPrecondition(
  snapshot: CorpusExternalAnchorLedgerSnapshot | null,
): CorpusExternalAnchorAppendRequest["externalHeadPrecondition"] {
  return snapshot
    ? {
        recordCount: snapshot.head.recordCount,
        latestRecordSha256: snapshot.head.latestRecordSha256,
        headSha256: snapshot.head.headSha256,
      }
    : null;
}

function revalidateExternalSnapshot(
  snapshot: CorpusExternalAnchorLedgerSnapshot,
): CorpusExternalAnchorLedgerSnapshot {
  return validateCorpusExternalAnchorLedgerSnapshot({
    ledgerBytes: snapshot.ledgerBytes,
    headBytes: snapshot.headBytes,
  });
}

function requireRequestExtendsExternalSnapshot(input: {
  request: CorpusExternalAnchorAppendRequest;
  previousSnapshot: CorpusExternalAnchorLedgerSnapshot | null;
}): void {
  const previous = input.previousSnapshot?.records.at(-1);
  if (!previous) {
    if (
      input.request.candidate.sequence !== 1 ||
      input.request.candidate.predecessorRecordSha256 !== null ||
      input.request.repositoryAnchorLogPrefix.recordCount !== 1
    ) {
      fail(
        "external-ledger genesis requires candidate sequence 1 with a null predecessor",
      );
    }
    return;
  }
  const expectedCandidateSequence =
    previous.repositoryAnchorLogPrefix.recordCount + 2;
  if (
    input.request.candidate.sequence !== expectedCandidateSequence ||
    input.request.repositoryAnchorLogPrefix.recordCount !==
      expectedCandidateSequence
  ) {
    fail(
      "append request candidate sequence does not extend the prior repository record count",
    );
  }
  if (
    input.request.candidate.predecessorRecordSha256 !==
    previous.verificationRecordSha256
  ) {
    fail(
      "append request candidate predecessor does not match the prior trusted verification",
    );
  }
  if (
    !exactJson(
      input.request.repositoryBaselineInputs,
      previous.repositoryBaselineInputs,
    )
  ) {
    fail(
      "append request changes the immutable baseline, processing register, or baseline generation manifest",
    );
  }
}

export function prepareCorpusExternalAnchorAppendRequest(input: {
  repositoryAnchorLogPath: string;
  repositoryAnchorLogBytes: Buffer;
  repositoryBaselineInputs: CorpusExternalAnchorRepositoryBaselineInputs;
  candidate: CorpusEventHistoryAnchorCandidate;
  externalSnapshot: CorpusExternalAnchorLedgerSnapshot | null;
  verifiedAt: string;
}): CorpusExternalAnchorAppendRequest {
  const externalSnapshot = input.externalSnapshot
    ? revalidateExternalSnapshot(input.externalSnapshot)
    : null;
  const candidate = validateCorpusEventHistoryAnchorRecord(input.candidate);
  if (candidate.recordType !== "history_anchor_candidate") {
    fail("append request input is not an anchor candidate");
  }
  if (!dateTimeSchema.safeParse(input.verifiedAt).success) {
    fail("verifiedAt is not an ISO 8601 date-time with an explicit offset");
  }
  if (Date.parse(input.verifiedAt) < Date.parse(candidate.createdAt)) {
    fail("verifiedAt predates the anchor candidate");
  }
  if (!input.repositoryAnchorLogBytes.toString("utf8").endsWith("\n")) {
    fail("repository anchor log prefix must end with a newline");
  }
  const repositoryAnchorLogPrefix = repositoryAnchorLogPrefixSchema.parse({
    path: input.repositoryAnchorLogPath,
    fileSha256: rawSha256(input.repositoryAnchorLogBytes),
    sizeBytes: input.repositoryAnchorLogBytes.length,
    recordCount: candidate.sequence,
    lastRecordSha256: candidate.recordSha256,
  });
  const repositoryBaselineInputs =
    corpusExternalAnchorRepositoryBaselineInputsSchema.parse(
      input.repositoryBaselineInputs,
    );
  const externalHeadPrecondition = currentHeadPrecondition(externalSnapshot);
  const evidenceSha256 = domainHash(
    CORPUS_EXTERNAL_ANCHOR_EVIDENCE_HASH_DOMAIN,
    evidenceIntent({
      repositoryAnchorLogPrefix,
      repositoryBaselineInputs,
      candidateRecordSha256: candidate.recordSha256,
      externalHeadPrecondition,
      verifiedAt: input.verifiedAt,
    }),
  );
  const verification = validateCorpusEventHistoryAnchorRecord(
    sealCorpusEventHistoryAnchorRecord({
      schemaVersion: candidate.schemaVersion,
      recordType: "history_anchor_trusted_verification" as const,
      verificationId: expectedVerificationId(candidate.recordSha256),
      sequence: candidate.sequence + 1,
      predecessorRecordSha256: candidate.recordSha256,
      candidateRecordSha256: candidate.recordSha256,
      verifierId: CORPUS_EXTERNAL_ANCHOR_VERIFIER_ID,
      method: "controlled_project_identity" as const,
      evidenceSha256,
      verifiedAt: input.verifiedAt,
    }),
  );
  if (verification.recordType !== "history_anchor_trusted_verification") {
    fail("prepared verification has the wrong record type");
  }
  const body = {
    schemaVersion: CORPUS_EXTERNAL_ANCHOR_LEDGER_SCHEMA_VERSION,
    artifactType: "external_anchor_append_request" as const,
    projectId: CORPUS_EXTERNAL_ANCHOR_PROJECT_ID,
    ledgerId: CORPUS_EXTERNAL_ANCHOR_LEDGER_ID,
    requestId: `request.external-anchor.${candidate.recordSha256.slice("sha256:".length)}`,
    repositoryAnchorLogPrefix,
    repositoryBaselineInputs,
    candidate,
    verification,
    externalHeadPrecondition,
    preparedAt: input.verifiedAt,
  };
  const request = validateCorpusExternalAnchorAppendRequest({
    ...body,
    requestSha256: hashCorpusExternalAnchorAppendRequest(body),
  });
  requireRequestExtendsExternalSnapshot({
    request,
    previousSnapshot: externalSnapshot,
  });
  return request;
}

export function validateCorpusExternalAnchorAppendRequest(
  value: unknown,
): CorpusExternalAnchorAppendRequest {
  const parsed = corpusExternalAnchorAppendRequestSchema.safeParse(value);
  if (!parsed.success)
    fail(`append request schema is invalid: ${parsed.error.message}`);
  const request = parsed.data;
  if (
    request.requestSha256 !== hashCorpusExternalAnchorAppendRequest(request)
  ) {
    fail("append request self-hash mismatch");
  }
  const candidate = validateCorpusEventHistoryAnchorRecord(request.candidate);
  const verification = validateCorpusEventHistoryAnchorRecord(
    request.verification,
  );
  if (
    candidate.recordType !== "history_anchor_candidate" ||
    verification.recordType !== "history_anchor_trusted_verification"
  ) {
    fail("append request has invalid anchor record types");
  }
  if (
    request.repositoryAnchorLogPrefix.path !==
      CORPUS_REPOSITORY_EVENT_HISTORY_ANCHOR_PATH ||
    request.repositoryAnchorLogPrefix.recordCount !== candidate.sequence ||
    request.repositoryAnchorLogPrefix.lastRecordSha256 !==
      candidate.recordSha256
  ) {
    fail(
      "append request does not bind the candidate as repository prefix head",
    );
  }
  if (
    request.externalHeadPrecondition === null &&
    (candidate.sequence !== 1 ||
      candidate.predecessorRecordSha256 !== null ||
      request.repositoryAnchorLogPrefix.recordCount !== 1)
  ) {
    fail(
      "external-ledger genesis requires candidate sequence 1 with a null predecessor",
    );
  }
  if (
    request.externalHeadPrecondition !== null &&
    (candidate.sequence < 3 || candidate.predecessorRecordSha256 === null)
  ) {
    fail(
      "non-genesis append request requires a successor candidate and predecessor",
    );
  }
  if (
    verification.sequence !== candidate.sequence + 1 ||
    verification.predecessorRecordSha256 !== candidate.recordSha256 ||
    verification.candidateRecordSha256 !== candidate.recordSha256 ||
    verification.verifierId !== CORPUS_EXTERNAL_ANCHOR_VERIFIER_ID ||
    verification.method !== "controlled_project_identity" ||
    verification.verificationId !==
      expectedVerificationId(candidate.recordSha256)
  ) {
    fail(
      "prepared verification does not bind the exact candidate and project identity",
    );
  }
  const expectedEvidence = domainHash(
    CORPUS_EXTERNAL_ANCHOR_EVIDENCE_HASH_DOMAIN,
    evidenceIntent({
      repositoryAnchorLogPrefix: request.repositoryAnchorLogPrefix,
      repositoryBaselineInputs: request.repositoryBaselineInputs,
      candidateRecordSha256: candidate.recordSha256,
      externalHeadPrecondition: request.externalHeadPrecondition,
      verifiedAt: request.preparedAt,
    }),
  );
  if (
    request.preparedAt !== verification.verifiedAt ||
    verification.evidenceSha256 !== expectedEvidence
  ) {
    fail("prepared verification evidence intent mismatch");
  }
  return request;
}

export function appendRequestToCorpusExternalAnchorSnapshot(input: {
  request: CorpusExternalAnchorAppendRequest;
  previousSnapshot: CorpusExternalAnchorLedgerSnapshot | null;
  appendedAt: string;
}): CorpusExternalAnchorLedgerSnapshot {
  const request = validateCorpusExternalAnchorAppendRequest(input.request);
  const previousSnapshot = input.previousSnapshot
    ? revalidateExternalSnapshot(input.previousSnapshot)
    : null;
  if (!dateTimeSchema.safeParse(input.appendedAt).success) {
    fail("appendedAt is not an ISO 8601 date-time with an explicit offset");
  }
  if (
    Date.parse(input.appendedAt) < Date.parse(request.verification.verifiedAt)
  ) {
    fail("external append predates its prepared verification");
  }
  const observedPrecondition = currentHeadPrecondition(previousSnapshot);
  if (!exactJson(request.externalHeadPrecondition, observedPrecondition)) {
    fail("external head compare-and-swap precondition mismatch");
  }
  requireRequestExtendsExternalSnapshot({ request, previousSnapshot });
  const previousRecords = previousSnapshot?.records ?? [];
  if (
    previousRecords.some(
      (record) =>
        record.requestSha256 === request.requestSha256 ||
        record.candidateRecordSha256 === request.candidate.recordSha256 ||
        record.verificationRecordSha256 === request.verification.recordSha256,
    )
  ) {
    fail(
      "external ledger already contains this request, candidate or verification",
    );
  }
  const previous = previousRecords.at(-1);
  if (
    previous &&
    Date.parse(input.appendedAt) < Date.parse(previous.appendedAt)
  ) {
    fail("external append timestamp regresses");
  }
  const body = {
    schemaVersion: CORPUS_EXTERNAL_ANCHOR_LEDGER_SCHEMA_VERSION,
    recordType: "trusted_anchor_append" as const,
    projectId: CORPUS_EXTERNAL_ANCHOR_PROJECT_ID,
    ledgerId: CORPUS_EXTERNAL_ANCHOR_LEDGER_ID,
    sequence: previousRecords.length + 1,
    predecessorRecordSha256: previous?.recordSha256 ?? null,
    requestSha256: request.requestSha256,
    candidateAnchorId: request.candidate.anchorId,
    candidateRecordSha256: request.candidate.recordSha256,
    verificationId: request.verification.verificationId,
    verificationRecordSha256: request.verification.recordSha256,
    verifierId: CORPUS_EXTERNAL_ANCHOR_VERIFIER_ID,
    method: "controlled_project_identity" as const,
    evidenceSha256: request.verification.evidenceSha256,
    repositoryAnchorLogPrefix: request.repositoryAnchorLogPrefix,
    repositoryBaselineInputs: request.repositoryBaselineInputs,
    appendedAt: input.appendedAt,
  };
  const record = validateCorpusExternalAnchorLedgerRecord({
    ...body,
    recordSha256: hashCorpusExternalAnchorLedgerRecord(body),
  });
  const records = [...previousRecords, record];
  const files = buildExternalLedgerFiles(records);
  return validateCorpusExternalAnchorLedgerSnapshot(files);
}

function buildExternalLedgerFiles(
  records: CorpusExternalAnchorLedgerRecord[],
): { ledgerBytes: Buffer; headBytes: Buffer } {
  if (records.length === 0)
    fail("cannot build external files for an empty ledger");
  const ledgerBytes = Buffer.from(
    `${records.map((item) => JSON.stringify(item)).join("\n")}\n`,
    "utf8",
  );
  const latest = records.at(-1)!;
  const headBody = {
    schemaVersion: CORPUS_EXTERNAL_ANCHOR_LEDGER_SCHEMA_VERSION,
    recordType: "external_anchor_ledger_head" as const,
    projectId: CORPUS_EXTERNAL_ANCHOR_PROJECT_ID,
    ledgerId: CORPUS_EXTERNAL_ANCHOR_LEDGER_ID,
    recordCount: records.length,
    ledgerFileSha256: rawSha256(ledgerBytes),
    ledgerSizeBytes: ledgerBytes.length,
    firstRecordSha256: records[0]!.recordSha256,
    latestRecordSha256: latest.recordSha256,
    latestCandidateRecordSha256: latest.candidateRecordSha256,
    latestVerificationRecordSha256: latest.verificationRecordSha256,
    updatedAt: latest.appendedAt,
  };
  const head = validateCorpusExternalAnchorLedgerHead({
    ...headBody,
    headSha256: hashCorpusExternalAnchorLedgerHead(headBody),
  });
  const headBytes = Buffer.from(`${JSON.stringify(head, null, 2)}\n`, "utf8");
  return { ledgerBytes, headBytes };
}

export function validateCorpusExternalAnchorLedgerRecord(
  value: unknown,
): CorpusExternalAnchorLedgerRecord {
  const parsed = corpusExternalAnchorLedgerRecordSchema.safeParse(value);
  if (!parsed.success)
    fail(`ledger record schema is invalid: ${parsed.error.message}`);
  if (
    parsed.data.recordSha256 !==
    hashCorpusExternalAnchorLedgerRecord(parsed.data)
  ) {
    fail(`ledger record ${parsed.data.sequence} self-hash mismatch`);
  }
  return parsed.data;
}

export function validateCorpusExternalAnchorLedgerHead(
  value: unknown,
): CorpusExternalAnchorLedgerHead {
  const parsed = corpusExternalAnchorLedgerHeadSchema.safeParse(value);
  if (!parsed.success)
    fail(`ledger head schema is invalid: ${parsed.error.message}`);
  if (
    parsed.data.headSha256 !== hashCorpusExternalAnchorLedgerHead(parsed.data)
  ) {
    fail("ledger head self-hash mismatch");
  }
  return parsed.data;
}

function parseCanonicalLedger(
  bytes: Buffer,
): CorpusExternalAnchorLedgerRecord[] {
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  if (text.length === 0 || !text.endsWith("\n")) {
    fail(
      "external ledger must be non-empty canonical JSONL ending in a newline",
    );
  }
  return text
    .slice(0, -1)
    .split("\n")
    .map((line, index) => {
      let value: unknown;
      try {
        value = JSON.parse(line);
      } catch (error) {
        fail(
          `external ledger line ${index + 1} is invalid JSON: ${(error as Error).message}`,
        );
      }
      const record = validateCorpusExternalAnchorLedgerRecord(value);
      if (line !== JSON.stringify(record)) {
        fail(`external ledger line ${index + 1} is not canonical JSONL`);
      }
      return record;
    });
}

export function validateCorpusExternalAnchorLedgerSnapshot(input: {
  ledgerBytes: Buffer;
  headBytes: Buffer;
}): CorpusExternalAnchorLedgerSnapshot {
  const records = parseCanonicalLedger(input.ledgerBytes);
  let headValue: unknown;
  try {
    headValue = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(input.headBytes),
    );
  } catch (error) {
    fail(
      `external ledger head is invalid JSON or UTF-8: ${(error as Error).message}`,
    );
  }
  const head = validateCorpusExternalAnchorLedgerHead(headValue);
  if (
    input.headBytes.toString("utf8") !== `${JSON.stringify(head, null, 2)}\n`
  ) {
    fail("external ledger head is not canonical pretty JSON");
  }
  const requests = new Set<string>();
  const candidates = new Set<string>();
  const verifications = new Set<string>();
  const candidateIds = new Set<string>();
  const verificationIds = new Set<string>();
  let predecessor: string | null = null;
  let previousAt: number | null = null;
  let previousRepositoryRecordCount: number | null = null;
  let repositoryBaselineInputs: CorpusExternalAnchorRepositoryBaselineInputs | null =
    null;
  for (const [index, record] of records.entries()) {
    if (
      record.sequence !== index + 1 ||
      record.predecessorRecordSha256 !== predecessor
    ) {
      fail(
        `external ledger record ${record.sequence} breaks the full hash chain`,
      );
    }
    if (
      requests.has(record.requestSha256) ||
      candidates.has(record.candidateRecordSha256) ||
      verifications.has(record.verificationRecordSha256) ||
      candidateIds.has(record.candidateAnchorId) ||
      verificationIds.has(record.verificationId)
    ) {
      fail(
        `external ledger record ${record.sequence} duplicates a trust binding`,
      );
    }
    const at = Date.parse(record.appendedAt);
    if (previousAt !== null && at < previousAt) {
      fail(`external ledger record ${record.sequence} regresses time`);
    }
    if (
      record.repositoryAnchorLogPrefix.path !==
        CORPUS_REPOSITORY_EVENT_HISTORY_ANCHOR_PATH ||
      record.repositoryAnchorLogPrefix.lastRecordSha256 !==
        record.candidateRecordSha256 ||
      (previousRepositoryRecordCount === null
        ? record.repositoryAnchorLogPrefix.recordCount !== 1
        : record.repositoryAnchorLogPrefix.recordCount !==
          previousRepositoryRecordCount + 2)
    ) {
      fail(
        `external ledger record ${record.sequence} breaks the repository anchor-prefix chain`,
      );
    }
    if (
      repositoryBaselineInputs !== null &&
      !exactJson(repositoryBaselineInputs, record.repositoryBaselineInputs)
    ) {
      fail(
        `external ledger record ${record.sequence} changes immutable repository baseline inputs`,
      );
    }
    requests.add(record.requestSha256);
    candidates.add(record.candidateRecordSha256);
    verifications.add(record.verificationRecordSha256);
    candidateIds.add(record.candidateAnchorId);
    verificationIds.add(record.verificationId);
    predecessor = record.recordSha256;
    previousAt = at;
    previousRepositoryRecordCount =
      record.repositoryAnchorLogPrefix.recordCount;
    repositoryBaselineInputs ??= record.repositoryBaselineInputs;
  }
  const first = records[0]!;
  const latest = records.at(-1)!;
  if (
    head.recordCount !== records.length ||
    head.ledgerFileSha256 !== rawSha256(input.ledgerBytes) ||
    head.ledgerSizeBytes !== input.ledgerBytes.length ||
    head.firstRecordSha256 !== first.recordSha256 ||
    head.latestRecordSha256 !== latest.recordSha256 ||
    head.latestCandidateRecordSha256 !== latest.candidateRecordSha256 ||
    head.latestVerificationRecordSha256 !== latest.verificationRecordSha256 ||
    head.updatedAt !== latest.appendedAt
  ) {
    fail(
      "external ledger head does not exactly bind the full ledger and latest record",
    );
  }
  return {
    records,
    head,
    ledgerBytes: Buffer.from(input.ledgerBytes),
    headBytes: Buffer.from(input.headBytes),
  };
}

type FileIdentity = {
  dev: number;
  ino: number;
  size: number;
  mode: number;
  uid: number;
  nlink: number;
  mtimeMs: number;
  ctimeMs: number;
};

function fileIdentity(path: string): FileIdentity {
  const stat = lstatSync(path);
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

function sameIdentity(left: FileIdentity, right: FileIdentity): boolean {
  return exactJson(left, right);
}

function assertRootOwnedExternalDirectory(externalRoot: string): string {
  if (
    !isAbsolute(externalRoot) ||
    normalize(externalRoot) !== externalRoot ||
    (externalRoot !== parse(externalRoot).root && externalRoot.endsWith(sep)) ||
    externalRoot.includes("\u0000")
  ) {
    fail("external root must be an absolute normalized path");
  }
  const root = parse(externalRoot).root;
  const suffix = externalRoot.slice(root.length);
  const components = suffix.length === 0 ? [] : suffix.split(sep);
  let current = root;
  const inspectedPaths: string[] = [root];
  for (const component of components) {
    current = join(current, component);
    const stat = lstatSync(current);
    if (stat.isSymbolicLink())
      fail(`external path component is a symlink: ${current}`);
    if (!stat.isDirectory())
      fail(`external path component is not a directory: ${current}`);
    inspectedPaths.push(current);
  }
  for (const inspectedPath of inspectedPaths) {
    const stat = lstatSync(inspectedPath);
    if (stat.uid !== 0)
      fail(`external path component is not root-owned: ${inspectedPath}`);
    if ((stat.mode & 0o022) !== 0) {
      fail(
        `external path component is group- or world-writable: ${inspectedPath}`,
      );
    }
  }
  const target = lstatSync(externalRoot);
  if ((target.mode & 0o777) !== 0o755) {
    fail("external root mode must be exactly 0755");
  }
  return externalRoot;
}

function assertNoAppendLock(externalRoot: string): void {
  const lockPath = join(externalRoot, CORPUS_EXTERNAL_ANCHOR_LOCK_FILE);
  const stat = lstatIfExists(lockPath);
  if (stat) {
    if (stat.isSymbolicLink()) fail("external append lock path is a symlink");
    fail(
      "external append lock is present; refusing a concurrent or stale read",
    );
  }
}

export function validateCorpusExternalAnchorDirectoryEntries(
  entries: string[],
): void {
  const allowed = new Set<string>([
    CORPUS_EXTERNAL_ANCHOR_LEDGER_FILE,
    CORPUS_EXTERNAL_ANCHOR_HEAD_FILE,
  ]);
  const unexpected = entries.filter((entry) => !allowed.has(entry));
  if (unexpected.length > 0) {
    fail(
      `external root contains unexpected entries: ${unexpected.sort().join(", ")}`,
    );
  }
}

function lstatIfExists(path: string): ReturnType<typeof lstatSync> | null {
  try {
    return lstatSync(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

function readSecureRootFile(path: string): {
  bytes: Buffer;
  identity: FileIdentity;
} {
  const before = lstatSync(path);
  if (before.isSymbolicLink()) fail(`external file is a symlink: ${path}`);
  if (!before.isFile()) fail(`external path is not a regular file: ${path}`);
  if (before.uid !== 0) fail(`external file is not root-owned: ${path}`);
  if ((before.mode & 0o777) !== 0o444) {
    fail(`external file mode must be exactly 0444: ${path}`);
  }
  if (before.nlink !== 1)
    fail(`external file must have exactly one hard link: ${path}`);
  const descriptor = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const openedBefore = fstatSync(descriptor);
    const bytes = readFileSync(descriptor);
    const openedAfter = fstatSync(descriptor);
    const initialIdentity = fileIdentity(path);
    const descriptorIdentity = {
      dev: openedBefore.dev,
      ino: openedBefore.ino,
      size: openedBefore.size,
      mode: openedBefore.mode,
      uid: openedBefore.uid,
      nlink: openedBefore.nlink,
      mtimeMs: openedBefore.mtimeMs,
      ctimeMs: openedBefore.ctimeMs,
    };
    const afterDescriptorIdentity = {
      dev: openedAfter.dev,
      ino: openedAfter.ino,
      size: openedAfter.size,
      mode: openedAfter.mode,
      uid: openedAfter.uid,
      nlink: openedAfter.nlink,
      mtimeMs: openedAfter.mtimeMs,
      ctimeMs: openedAfter.ctimeMs,
    };
    if (
      !openedBefore.isFile() ||
      openedBefore.uid !== 0 ||
      (openedBefore.mode & 0o777) !== 0o444 ||
      openedBefore.nlink !== 1 ||
      !sameIdentity(initialIdentity, descriptorIdentity) ||
      !sameIdentity(descriptorIdentity, afterDescriptorIdentity) ||
      bytes.length !== descriptorIdentity.size
    ) {
      fail(`external file changed while it was read: ${path}`);
    }
    return { bytes, identity: descriptorIdentity };
  } finally {
    closeSync(descriptor);
  }
}

export function loadRootOwnedCorpusExternalAnchorLedger(
  externalRoot: string,
  options: { allowEmpty?: boolean } = {},
): CorpusExternalAnchorLedgerSnapshot | null {
  const controlledRoot = assertRootOwnedExternalDirectory(externalRoot);
  assertNoAppendLock(controlledRoot);
  validateCorpusExternalAnchorDirectoryEntries(readdirSync(controlledRoot));
  const ledgerPath = join(controlledRoot, CORPUS_EXTERNAL_ANCHOR_LEDGER_FILE);
  const headPath = join(controlledRoot, CORPUS_EXTERNAL_ANCHOR_HEAD_FILE);
  const ledgerStat = lstatIfExists(ledgerPath);
  const headStat = lstatIfExists(headPath);
  if (ledgerStat?.isSymbolicLink() || headStat?.isSymbolicLink()) {
    fail("external ledger or head path is a symlink");
  }
  const ledgerExists = ledgerStat !== null;
  const headExists = headStat !== null;
  if (!ledgerExists || !headExists) {
    if (ledgerExists !== headExists) {
      fail("external ledger and head must either both exist or both be absent");
    }
    if (options.allowEmpty) return null;
    fail("external ledger has not been initialized");
  }
  const ledger = readSecureRootFile(ledgerPath);
  const head = readSecureRootFile(headPath);
  assertNoAppendLock(controlledRoot);
  validateCorpusExternalAnchorDirectoryEntries(readdirSync(controlledRoot));
  if (
    !sameIdentity(ledger.identity, fileIdentity(ledgerPath)) ||
    !sameIdentity(head.identity, fileIdentity(headPath))
  ) {
    fail("external ledger or head changed during the snapshot read");
  }
  return validateCorpusExternalAnchorLedgerSnapshot({
    ledgerBytes: ledger.bytes,
    headBytes: head.bytes,
  });
}

export function assertExternalRootOutsideRepository(input: {
  repositoryRoot: string;
  externalRoot: string;
}): void {
  const repositoryRoot = resolve(input.repositoryRoot);
  const externalRoot = resolve(input.externalRoot);
  const relation = relative(repositoryRoot, externalRoot);
  if (
    relation === "" ||
    (!relation.startsWith(`..${sep}`) && relation !== "..")
  ) {
    fail("external root must be outside the repository");
  }
}

export function requireLatestExternalAnchorBinding(input: {
  snapshot: CorpusExternalAnchorLedgerSnapshot;
  candidate: CorpusEventHistoryAnchorCandidate;
  verification: CorpusEventHistoryTrustedVerification;
  repositoryBaselineInputs: CorpusExternalAnchorRepositoryBaselineInputs;
}): CorpusExternalAnchorLedgerRecord {
  const snapshot = revalidateExternalSnapshot(input.snapshot);
  const candidate = validateCorpusEventHistoryAnchorRecord(input.candidate);
  const verification = validateCorpusEventHistoryAnchorRecord(
    input.verification,
  );
  if (
    candidate.recordType !== "history_anchor_candidate" ||
    verification.recordType !== "history_anchor_trusted_verification"
  ) {
    fail("latest repository pair has invalid record types");
  }
  const latest = snapshot.records.at(-1)!;
  const repositoryBaselineInputs =
    corpusExternalAnchorRepositoryBaselineInputsSchema.parse(
      input.repositoryBaselineInputs,
    );
  if (
    latest.candidateAnchorId !== candidate.anchorId ||
    latest.candidateRecordSha256 !== candidate.recordSha256 ||
    latest.verificationId !== verification.verificationId ||
    latest.verificationRecordSha256 !== verification.recordSha256 ||
    latest.verifierId !== verification.verifierId ||
    latest.method !== verification.method ||
    latest.evidenceSha256 !== verification.evidenceSha256 ||
    latest.repositoryAnchorLogPrefix.recordCount !== candidate.sequence ||
    latest.repositoryAnchorLogPrefix.lastRecordSha256 !==
      candidate.recordSha256 ||
    !exactJson(latest.repositoryBaselineInputs, repositoryBaselineInputs) ||
    Date.parse(latest.appendedAt) < Date.parse(verification.verifiedAt)
  ) {
    fail(
      "external latest head does not exactly match the latest repository verification pair",
    );
  }
  return latest;
}

export function createCorpusExternalAnchorVerifier(input: {
  snapshot: CorpusExternalAnchorLedgerSnapshot;
  latestCandidate: CorpusEventHistoryAnchorCandidate;
  latestVerification: CorpusEventHistoryTrustedVerification;
  latestRepositoryBaselineInputs: CorpusExternalAnchorRepositoryBaselineInputs;
}): VerifyTrustedCorpusEventHistoryAnchor {
  const snapshot = revalidateExternalSnapshot(input.snapshot);
  requireLatestExternalAnchorBinding({
    snapshot,
    candidate: input.latestCandidate,
    verification: input.latestVerification,
    repositoryBaselineInputs: input.latestRepositoryBaselineInputs,
  });
  const trusted = new Map(
    snapshot.records.map((record) => [
      `${record.candidateRecordSha256}:${record.verificationRecordSha256}`,
      record,
    ]),
  );
  return ({ candidate, verification }) => {
    if (
      candidate.recordSha256 !==
        hashCorpusEventHistoryAnchorRecord(candidate) ||
      verification.recordSha256 !==
        hashCorpusEventHistoryAnchorRecord(verification)
    ) {
      return false;
    }
    const record = trusted.get(
      `${candidate.recordSha256}:${verification.recordSha256}`,
    );
    return Boolean(
      record &&
      record.candidateAnchorId === candidate.anchorId &&
      record.verificationId === verification.verificationId &&
      record.verifierId === verification.verifierId &&
      record.method === verification.method &&
      record.evidenceSha256 === verification.evidenceSha256 &&
      record.repositoryAnchorLogPrefix.recordCount === candidate.sequence &&
      record.repositoryAnchorLogPrefix.lastRecordSha256 ===
        candidate.recordSha256 &&
      Date.parse(record.appendedAt) >= Date.parse(verification.verifiedAt),
    );
  };
}

export function requireRequestIsLatestExternalAppend(input: {
  request: CorpusExternalAnchorAppendRequest;
  snapshot: CorpusExternalAnchorLedgerSnapshot;
}): CorpusEventHistoryTrustedVerification {
  const request = validateCorpusExternalAnchorAppendRequest(input.request);
  const snapshot = revalidateExternalSnapshot(input.snapshot);
  const latest = snapshot.records.at(-1)!;
  const previousRecords = snapshot.records.slice(0, -1);
  const previousSnapshot =
    previousRecords.length === 0
      ? null
      : validateCorpusExternalAnchorLedgerSnapshot(
          buildExternalLedgerFiles(previousRecords),
        );
  const expectedPrecondition = currentHeadPrecondition(previousSnapshot);
  requireRequestExtendsExternalSnapshot({ request, previousSnapshot });
  if (
    !exactJson(request.externalHeadPrecondition, expectedPrecondition) ||
    latest.requestSha256 !== request.requestSha256 ||
    latest.candidateAnchorId !== request.candidate.anchorId ||
    latest.candidateRecordSha256 !== request.candidate.recordSha256 ||
    latest.verificationId !== request.verification.verificationId ||
    latest.verificationRecordSha256 !== request.verification.recordSha256 ||
    latest.evidenceSha256 !== request.verification.evidenceSha256 ||
    Date.parse(latest.appendedAt) <
      Date.parse(request.verification.verifiedAt) ||
    !exactJson(
      latest.repositoryAnchorLogPrefix,
      request.repositoryAnchorLogPrefix,
    ) ||
    !exactJson(
      latest.repositoryBaselineInputs,
      request.repositoryBaselineInputs,
    )
  ) {
    fail("prepared request is not the exact latest external append");
  }
  return request.verification;
}
