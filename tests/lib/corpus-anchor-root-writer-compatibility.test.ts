import assert from "node:assert/strict";
import {
  chmodSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  appendPreparedRequestForPolicy,
  createTestPolicy,
} from "../../scripts/knowledge/root-anchor-writer/corpus-anchor-root-writer.mjs";
import {
  appendRequestToCorpusExternalAnchorSnapshot,
  prepareCorpusExternalAnchorAppendRequest,
  requireRequestIsLatestExternalAppend,
  validateCorpusExternalAnchorLedgerSnapshot,
  type CorpusExternalAnchorRepositoryBaselineInputs,
} from "../../src/lib/knowledge/corpus-event-history-external-ledger";
import {
  CORPUS_EVENT_HISTORY_ANCHOR_SCHEMA_VERSION,
  sealCorpusEventHistoryAnchorRecord,
  validateCorpusEventHistoryAnchorRecord,
  type CorpusEventHistoryAnchorCandidate,
} from "../../src/lib/knowledge/corpus-processing-event-history";

const ANCHOR_LOG_PATH =
  "knowledge/corpus/corpus-processing-state-event-history-anchors.v1.jsonl";

function sha(char: string): string {
  return `sha256:${char.repeat(64)}`;
}

function candidate(): CorpusEventHistoryAnchorCandidate {
  return validateCorpusEventHistoryAnchorRecord(
    sealCorpusEventHistoryAnchorRecord({
      schemaVersion: CORPUS_EVENT_HISTORY_ANCHOR_SCHEMA_VERSION,
      recordType: "history_anchor_candidate" as const,
      anchorId: "anchor.root-writer.compatibility.1",
      sequence: 1,
      predecessorRecordSha256: null,
      eventLogPrefix: {
        path: "knowledge/corpus/corpus-processing-state-events.v1.jsonl",
        fileSha256: sha("0"),
        sizeBytes: 0,
      },
      eventCount: 0,
      firstEventSha256: null,
      lastEventSha256: null,
      eventSetSha256: sha("1"),
      eventManifest: {
        path: "knowledge/corpus/corpus-processing-state-event-manifest.v1.json",
        fileSha256: sha("2"),
        sizeBytes: 800,
        manifestSha256: sha("3"),
      },
      createdAt: "2026-08-04T10:00:00Z",
    }),
  ) as CorpusEventHistoryAnchorCandidate;
}

function baselineInputs(): CorpusExternalAnchorRepositoryBaselineInputs {
  return {
    baseline: {
      path: "knowledge/corpus/corpus-processing-baseline.v1.json",
      fileSha256: sha("4"),
      sizeBytes: 1000,
    },
    processingRegister: {
      path: "knowledge/corpus/corpus-processing-register.v1.jsonl",
      fileSha256: sha("5"),
      sizeBytes: 2000,
    },
    baselineGenerationManifest: {
      path: "knowledge/corpus/corpus-processing-generation-manifest.v1.json",
      fileSha256: sha("6"),
      sizeBytes: 3000,
    },
  };
}

test("self-contained root writer is byte-compatible with the repository contract", () => {
  const anchor = candidate();
  const anchorBytes = Buffer.from(`${JSON.stringify(anchor)}\n`, "utf8");
  const request = prepareCorpusExternalAnchorAppendRequest({
    repositoryAnchorLogPath: ANCHOR_LOG_PATH,
    repositoryAnchorLogBytes: anchorBytes,
    repositoryBaselineInputs: baselineInputs(),
    candidate: anchor,
    externalSnapshot: null,
    verifiedAt: "2026-08-04T10:01:00Z",
  });
  const parent = realpathSync(tmpdir());
  const externalRoot = mkdtempSync(join(parent, "root-writer-compat-ledger-"));
  chmodSync(externalRoot, 0o755);
  const requestRoot = mkdtempSync(join(parent, "root-writer-compat-request-"));
  const requestPath = join(requestRoot, "request.json");
  writeFileSync(requestPath, `${JSON.stringify(request, null, 2)}\n`, {
    mode: 0o600,
  });
  const times = ["2026-08-04T10:02:00Z", "2026-08-04T10:03:00Z"];
  appendPreparedRequestForPolicy({
    requestPath,
    policy: createTestPolicy({ externalRoot }),
    now: () => times.shift() ?? "2026-08-04T10:03:00Z",
  });
  const observed = validateCorpusExternalAnchorLedgerSnapshot({
    ledgerBytes: readFileSync(
      join(externalRoot, "corpus-event-history-anchors.v1.jsonl"),
    ),
    headBytes: readFileSync(
      join(externalRoot, "corpus-event-history-anchors-head.v1.json"),
    ),
  });
  const expected = appendRequestToCorpusExternalAnchorSnapshot({
    request,
    previousSnapshot: null,
    appendedAt: "2026-08-04T10:03:00Z",
  });
  assert.deepEqual(observed.records, expected.records);
  assert.deepEqual(observed.head, expected.head);
  assert.equal(
    requireRequestIsLatestExternalAppend({ request, snapshot: observed })
      .recordSha256,
    request.verification.recordSha256,
  );
});
