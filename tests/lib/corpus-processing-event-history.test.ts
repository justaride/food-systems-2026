import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  CORPUS_EVENT_HISTORY_ANCHOR_SCHEMA_VERSION,
  sealCorpusEventHistoryAnchorRecord,
  validateCorpusEventHistoryAnchorChain,
  validateCorpusEventHistoryAnchorRecord,
  type CorpusEventHistoryAnchorCandidate,
  type CorpusEventHistoryAnchorRecord,
} from "../../src/lib/knowledge/corpus-processing-event-history";

const EVENT_LOG_PATH =
  "knowledge/corpus/corpus-processing-state-events.v1.jsonl";
const EVENT_MANIFEST_PATH =
  "knowledge/corpus/corpus-processing-state-event-manifest.v1.json";

function sha256(value: string | Buffer): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function eventSetSha256(events: unknown[]): string {
  return sha256(JSON.stringify(events));
}

function jsonLines(events: unknown[]): Buffer {
  return Buffer.from(
    events.length === 0
      ? ""
      : `${events.map((event) => JSON.stringify(event)).join("\n")}\n`,
    "utf8",
  );
}

function candidate(input: {
  sequence: number;
  predecessorRecordSha256: string | null;
  events: unknown[];
  eventManifestBytes: Buffer;
  eventManifestSha256: string;
  createdAt: string;
}): CorpusEventHistoryAnchorCandidate {
  const prefix = jsonLines(input.events);
  const hashes = input.events.map(
    (event) => (event as { eventSha256: string }).eventSha256,
  );
  return validateCorpusEventHistoryAnchorRecord(
    sealCorpusEventHistoryAnchorRecord({
      schemaVersion: CORPUS_EVENT_HISTORY_ANCHOR_SCHEMA_VERSION,
      recordType: "history_anchor_candidate",
      anchorId: `anchor.fixture.${input.sequence}`,
      sequence: input.sequence,
      predecessorRecordSha256: input.predecessorRecordSha256,
      eventLogPrefix: {
        path: EVENT_LOG_PATH,
        fileSha256: sha256(prefix),
        sizeBytes: prefix.length,
      },
      eventCount: input.events.length,
      firstEventSha256: hashes[0] ?? null,
      lastEventSha256: hashes.at(-1) ?? null,
      eventSetSha256: eventSetSha256(input.events),
      eventManifest: {
        path: EVENT_MANIFEST_PATH,
        fileSha256: sha256(input.eventManifestBytes),
        sizeBytes: input.eventManifestBytes.length,
        manifestSha256: input.eventManifestSha256,
      },
      createdAt: input.createdAt,
    }),
  ) as CorpusEventHistoryAnchorCandidate;
}

function verification(
  candidateRecord: CorpusEventHistoryAnchorCandidate,
): CorpusEventHistoryAnchorRecord {
  return validateCorpusEventHistoryAnchorRecord(
    sealCorpusEventHistoryAnchorRecord({
      schemaVersion: CORPUS_EVENT_HISTORY_ANCHOR_SCHEMA_VERSION,
      recordType: "history_anchor_trusted_verification",
      verificationId: `verification.fixture.${candidateRecord.sequence}`,
      sequence: candidateRecord.sequence + 1,
      predecessorRecordSha256: candidateRecord.recordSha256,
      candidateRecordSha256: candidateRecord.recordSha256,
      verifierId: "verifier.fixture",
      method: "controlled_project_identity",
      evidenceSha256: sha256(`evidence:${candidateRecord.recordSha256}`),
      verifiedAt: candidateRecord.createdAt,
    }),
  );
}

const events = [
  { eventId: "event.fixture.1", eventSha256: `sha256:${"1".repeat(64)}` },
  { eventId: "event.fixture.2", eventSha256: `sha256:${"2".repeat(64)}` },
];
const eventLogBytes = jsonLines(events);
const currentManifestBytes = Buffer.from('{"manifest":"current"}\n', "utf8");
const currentManifestSha256 = `sha256:${"a".repeat(64)}`;
const genesisManifestBytes = Buffer.from('{"manifest":"genesis"}\n', "utf8");

function verifiedChain(): CorpusEventHistoryAnchorRecord[] {
  const genesis = candidate({
    sequence: 1,
    predecessorRecordSha256: null,
    events: [],
    eventManifestBytes: genesisManifestBytes,
    eventManifestSha256: `sha256:${"0".repeat(64)}`,
    createdAt: "2026-08-03T08:00:00Z",
  });
  const genesisVerification = verification(genesis);
  const current = candidate({
    sequence: 3,
    predecessorRecordSha256: genesisVerification.recordSha256,
    events,
    eventManifestBytes: currentManifestBytes,
    eventManifestSha256: currentManifestSha256,
    createdAt: "2026-08-03T09:00:00Z",
  });
  const currentVerification = verification(current);
  return [genesis, genesisVerification, current, currentVerification];
}

function validate(
  records: unknown[],
  overrides: Partial<{
    eventLogBytes: Buffer;
    events: unknown[];
    requireCurrentCheckpointTrusted: boolean;
    verifyTrustedAnchor: () => boolean;
  }> = {},
) {
  return validateCorpusEventHistoryAnchorChain({
    records,
    eventLogPath: EVENT_LOG_PATH,
    eventLogBytes: overrides.eventLogBytes ?? eventLogBytes,
    events: overrides.events ?? events,
    eventSetSha256,
    currentEventManifest: {
      path: EVENT_MANIFEST_PATH,
      bytes: currentManifestBytes,
      manifestSha256: currentManifestSha256,
    },
    verifyTrustedAnchor: overrides.verifyTrustedAnchor ?? (() => true),
    requireCurrentCheckpointTrusted:
      overrides.requireCurrentCheckpointTrusted ?? true,
  });
}

test("accepts a separately verified, prefix-preserving anchor chain with JSON Schema parity", () => {
  const records = verifiedChain();
  const schema = JSON.parse(
    readFileSync(
      "knowledge/schema/corpus-processing-event-history-anchor.schema.v1.json",
      "utf8",
    ),
  ) as object;
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const validateSchema = ajv.compile(schema);
  for (const record of records) {
    assert.equal(
      validateSchema(record),
      true,
      JSON.stringify(validateSchema.errors),
    );
  }
  const result = validate(records);
  assert.equal(result.currentCheckpointTrusted, true);
  assert.equal(result.latestCandidate.eventCount, 2);
});

test("keeps an empty genesis anchor explicitly unverified but blocks a non-empty candidate", () => {
  const genesis = verifiedChain()[0]!;
  const emptyManifestBytes = genesisManifestBytes;
  const empty = validateCorpusEventHistoryAnchorChain({
    records: [genesis],
    eventLogPath: EVENT_LOG_PATH,
    eventLogBytes: Buffer.alloc(0),
    events: [],
    eventSetSha256,
    currentEventManifest: {
      path: EVENT_MANIFEST_PATH,
      bytes: emptyManifestBytes,
      manifestSha256: `sha256:${"0".repeat(64)}`,
    },
    requireCurrentCheckpointTrusted: false,
  });
  assert.equal(empty.currentCheckpointTrusted, false);

  const records = verifiedChain().slice(0, 3);
  assert.throws(
    () => validate(records),
    /current non-empty event checkpoint has no trusted verification/,
  );
});

test("requires a configured trusted verifier and rejects prefix rewrite or truncation", () => {
  const records = verifiedChain();
  assert.throws(
    () =>
      validateCorpusEventHistoryAnchorChain({
        records,
        eventLogPath: EVENT_LOG_PATH,
        eventLogBytes,
        events,
        eventSetSha256,
        currentEventManifest: {
          path: EVENT_MANIFEST_PATH,
          bytes: currentManifestBytes,
          manifestSha256: currentManifestSha256,
        },
        requireCurrentCheckpointTrusted: true,
      }),
    /is not trusted by the configured verifier/,
  );
  assert.throws(
    () =>
      validate(records, {
        eventLogBytes: Buffer.from(
          eventLogBytes
            .toString("utf8")
            .replace("event.fixture.1", "event.rewrite.1"),
          "utf8",
        ),
      }),
    /does not bind its exact event prefix/,
  );
  assert.throws(
    () =>
      validate(records, {
        eventLogBytes: jsonLines(events.slice(0, 1)),
        events: events.slice(0, 1),
      }),
    /exceeds the current event log|latest candidate does not bind/,
  );
});

test("rejects a fabricated verification and a resealed anchor-chain fork", () => {
  const records = verifiedChain();
  assert.throws(
    () => validate(records, { verifyTrustedAnchor: () => false }),
    /is not trusted by the configured verifier/,
  );
  const forked = structuredClone(records);
  const last = forked.at(-1)!;
  last.predecessorRecordSha256 = records[0]!.recordSha256;
  const resealed = sealCorpusEventHistoryAnchorRecord(last);
  forked[forked.length - 1] = resealed as CorpusEventHistoryAnchorRecord;
  assert.throws(() => validate(forked), /breaks the anchor-record hash chain/);
});
