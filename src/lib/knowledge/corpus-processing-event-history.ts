import { createHash } from "node:crypto";

import { z } from "zod";

import {
  canonicalCorpusJson,
  type CorpusCanonicalJsonValue,
} from "./corpus-processing-lifecycle";

export const CORPUS_EVENT_HISTORY_ANCHOR_SCHEMA_VERSION =
  "corpus-processing-event-history-anchor-v1" as const;
export const CORPUS_EVENT_HISTORY_ANCHOR_HASH_DOMAIN =
  "food-systems/corpus-processing-event-history-anchor/v1\n" as const;

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

const fileBindingSchema = z
  .object({
    path: repositoryPathSchema,
    fileSha256: sha256Schema,
    sizeBytes: z.number().int().nonnegative(),
  })
  .strict();

export const corpusEventHistoryAnchorCandidateSchema = z
  .object({
    schemaVersion: z.literal(CORPUS_EVENT_HISTORY_ANCHOR_SCHEMA_VERSION),
    recordType: z.literal("history_anchor_candidate"),
    anchorId: identifierSchema,
    sequence: z.number().int().positive(),
    predecessorRecordSha256: sha256Schema.nullable(),
    eventLogPrefix: fileBindingSchema,
    eventCount: z.number().int().nonnegative(),
    firstEventSha256: sha256Schema.nullable(),
    lastEventSha256: sha256Schema.nullable(),
    eventSetSha256: sha256Schema,
    eventManifest: fileBindingSchema.extend({
      manifestSha256: sha256Schema,
    }),
    createdAt: dateTimeSchema,
    recordSha256: sha256Schema,
  })
  .strict();

export const corpusEventHistoryTrustedVerificationSchema = z
  .object({
    schemaVersion: z.literal(CORPUS_EVENT_HISTORY_ANCHOR_SCHEMA_VERSION),
    recordType: z.literal("history_anchor_trusted_verification"),
    verificationId: identifierSchema,
    sequence: z.number().int().positive(),
    predecessorRecordSha256: sha256Schema,
    candidateRecordSha256: sha256Schema,
    verifierId: identifierSchema,
    method: z.enum([
      "controlled_project_identity",
      "cryptographic_signature",
      "verified_external_identity",
    ]),
    evidenceSha256: sha256Schema,
    verifiedAt: dateTimeSchema,
    recordSha256: sha256Schema,
  })
  .strict();

export const corpusEventHistoryAnchorRecordSchema = z.discriminatedUnion(
  "recordType",
  [
    corpusEventHistoryAnchorCandidateSchema,
    corpusEventHistoryTrustedVerificationSchema,
  ],
);

export type CorpusEventHistoryAnchorCandidate = z.infer<
  typeof corpusEventHistoryAnchorCandidateSchema
>;
export type CorpusEventHistoryTrustedVerification = z.infer<
  typeof corpusEventHistoryTrustedVerificationSchema
>;
export type CorpusEventHistoryAnchorRecord = z.infer<
  typeof corpusEventHistoryAnchorRecordSchema
>;

/**
 * External trust boundary. Returning true means the verifier independently
 * recognizes this exact candidate/verification pair as authentic and not
 * superseded by a later trusted checkpoint. Self-hashes are never sufficient.
 */
export type VerifyTrustedCorpusEventHistoryAnchor = (input: {
  candidate: CorpusEventHistoryAnchorCandidate;
  verification: CorpusEventHistoryTrustedVerification;
}) => boolean;

function fail(message: string): never {
  throw new Error(`Corpus event-history anchor validation failed: ${message}`);
}

function rawSha256(bytes: string | Buffer): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

export function hashCorpusEventHistoryAnchorRecord(
  value: Record<string, unknown>,
): string {
  const { recordSha256: _recordSha256, ...body } = value;
  return `sha256:${createHash("sha256")
    .update(CORPUS_EVENT_HISTORY_ANCHOR_HASH_DOMAIN)
    .update(canonicalCorpusJson(body as CorpusCanonicalJsonValue))
    .digest("hex")}`;
}

export function sealCorpusEventHistoryAnchorRecord<
  T extends Record<string, unknown>,
>(value: T): T & { recordSha256: string } {
  const { recordSha256: _recordSha256, ...body } = value;
  return {
    ...body,
    recordSha256: hashCorpusEventHistoryAnchorRecord(body),
  } as T & { recordSha256: string };
}

export function validateCorpusEventHistoryAnchorRecord(
  value: unknown,
): CorpusEventHistoryAnchorRecord {
  const parsed = corpusEventHistoryAnchorRecordSchema.safeParse(value);
  if (!parsed.success)
    fail(`record schema is invalid: ${parsed.error.message}`);
  const record = parsed.data;
  if (record.recordSha256 !== hashCorpusEventHistoryAnchorRecord(record)) {
    fail(`record ${record.sequence} self-hash mismatch`);
  }
  return record;
}

function eventPrefixBytes(eventLogBytes: Buffer, eventCount: number): Buffer {
  if (eventCount === 0) return Buffer.alloc(0);
  const text = new TextDecoder("utf-8", { fatal: true }).decode(eventLogBytes);
  if (!text.endsWith("\n")) fail("non-empty event log must end with a newline");
  const lines = text.trimEnd().split("\n");
  if (eventCount > lines.length) {
    fail(`anchor event count ${eventCount} exceeds the current event log`);
  }
  return Buffer.from(`${lines.slice(0, eventCount).join("\n")}\n`, "utf8");
}

function eventHashes(events: unknown[]): string[] {
  return events.map((event, index) => {
    if (!event || typeof event !== "object" || Array.isArray(event)) {
      fail(`event ${index + 1} is not an object`);
    }
    const hash = (event as Record<string, unknown>).eventSha256;
    if (typeof hash !== "string" || !sha256Schema.safeParse(hash).success) {
      fail(`event ${index + 1} has no valid eventSha256`);
    }
    return hash;
  });
}

export function validateCorpusEventHistoryAnchorChain(input: {
  records: unknown[];
  eventLogPath: string;
  eventLogBytes: Buffer;
  events: unknown[];
  eventSetSha256: (events: unknown[]) => string;
  currentEventManifest: {
    path: string;
    bytes: Buffer;
    manifestSha256: string;
  };
  verifyTrustedAnchor?: VerifyTrustedCorpusEventHistoryAnchor;
  requireCurrentCheckpointTrusted: boolean;
}): {
  records: CorpusEventHistoryAnchorRecord[];
  latestCandidate: CorpusEventHistoryAnchorCandidate;
  currentCheckpointTrusted: boolean;
} {
  if (input.records.length === 0) fail("anchor record log is empty");
  const records = input.records.map(validateCorpusEventHistoryAnchorRecord);
  const hashes = eventHashes(input.events);
  let previousRecordSha256: string | null = null;
  let previousCandidate: CorpusEventHistoryAnchorCandidate | null = null;
  let pendingCandidate: CorpusEventHistoryAnchorCandidate | null = null;
  let currentCheckpointTrusted = false;

  for (const [index, record] of records.entries()) {
    if (
      record.sequence !== index + 1 ||
      record.predecessorRecordSha256 !== previousRecordSha256
    ) {
      fail(`record ${record.sequence} breaks the anchor-record hash chain`);
    }
    if (record.recordType === "history_anchor_candidate") {
      if (pendingCandidate) {
        fail(`candidate ${record.anchorId} follows an unverified candidate`);
      }
      if (
        previousCandidate &&
        record.eventCount <= previousCandidate.eventCount
      ) {
        fail(`candidate ${record.anchorId} does not extend the event prefix`);
      }
      const prefix = eventPrefixBytes(input.eventLogBytes, record.eventCount);
      const prefixEventHashes = hashes.slice(0, record.eventCount);
      if (
        record.eventLogPrefix.path !== input.eventLogPath ||
        record.eventLogPrefix.sizeBytes !== prefix.length ||
        record.eventLogPrefix.fileSha256 !== rawSha256(prefix)
      ) {
        fail(
          `candidate ${record.anchorId} does not bind its exact event prefix`,
        );
      }
      if (
        record.firstEventSha256 !== (prefixEventHashes[0] ?? null) ||
        record.lastEventSha256 !== (prefixEventHashes.at(-1) ?? null) ||
        record.eventSetSha256 !==
          input.eventSetSha256(input.events.slice(0, record.eventCount))
      ) {
        fail(`candidate ${record.anchorId} has event-head or event-set drift`);
      }
      if (
        (record.eventCount === 0) !==
        (record.firstEventSha256 === null && record.lastEventSha256 === null)
      ) {
        fail(`candidate ${record.anchorId} has invalid genesis event bindings`);
      }
      previousCandidate = record;
      pendingCandidate = record;
      currentCheckpointTrusted = false;
    } else {
      if (
        !pendingCandidate ||
        record.candidateRecordSha256 !== pendingCandidate.recordSha256 ||
        record.predecessorRecordSha256 !== pendingCandidate.recordSha256
      ) {
        fail(
          `verification ${record.verificationId} does not bind the pending candidate`,
        );
      }
      if (
        Date.parse(record.verifiedAt) < Date.parse(pendingCandidate.createdAt)
      ) {
        fail(`verification ${record.verificationId} predates its candidate`);
      }
      if (
        !input.verifyTrustedAnchor ||
        !input.verifyTrustedAnchor({
          candidate: pendingCandidate,
          verification: record,
        })
      ) {
        fail(
          `verification ${record.verificationId} is not trusted by the configured verifier`,
        );
      }
      pendingCandidate = null;
      currentCheckpointTrusted = true;
    }
    previousRecordSha256 = record.recordSha256;
  }

  if (!previousCandidate) fail("anchor chain contains no candidate");
  const manifestBytes = input.currentEventManifest.bytes;
  if (
    previousCandidate.eventCount !== input.events.length ||
    previousCandidate.eventLogPrefix.sizeBytes !== input.eventLogBytes.length ||
    previousCandidate.eventLogPrefix.fileSha256 !==
      rawSha256(input.eventLogBytes) ||
    previousCandidate.eventManifest.path !== input.currentEventManifest.path ||
    previousCandidate.eventManifest.sizeBytes !== manifestBytes.length ||
    previousCandidate.eventManifest.fileSha256 !== rawSha256(manifestBytes) ||
    previousCandidate.eventManifest.manifestSha256 !==
      input.currentEventManifest.manifestSha256
  ) {
    fail(
      "latest candidate does not bind the exact current event log and manifest",
    );
  }
  if (input.requireCurrentCheckpointTrusted && !currentCheckpointTrusted) {
    fail("current non-empty event checkpoint has no trusted verification");
  }
  return {
    records,
    latestCandidate: previousCandidate,
    currentCheckpointTrusted,
  };
}
