import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  chmodSync,
  linkSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  CORPUS_EXTERNAL_ANCHOR_LEDGER_SCHEMA_VERSION,
  appendRequestToCorpusExternalAnchorSnapshot,
  assertExternalRootOutsideRepository,
  createCorpusExternalAnchorVerifier,
  hashCorpusExternalAnchorLedgerHead,
  hashCorpusExternalAnchorLedgerRecord,
  loadRootOwnedCorpusExternalAnchorLedger,
  prepareCorpusExternalAnchorAppendRequest,
  requireLatestExternalAnchorBinding,
  requireRequestIsLatestExternalAppend,
  validateCorpusExternalAnchorAppendRequest,
  validateCorpusExternalAnchorDirectoryEntries,
  validateCorpusExternalAnchorLedgerSnapshot,
  type CorpusExternalAnchorLedgerHead,
  type CorpusExternalAnchorRepositoryBaselineInputs,
} from "../../src/lib/knowledge/corpus-event-history-external-ledger";
import {
  CORPUS_EVENT_HISTORY_ANCHOR_SCHEMA_VERSION,
  sealCorpusEventHistoryAnchorRecord,
  validateCorpusEventHistoryAnchorRecord,
  type CorpusEventHistoryAnchorCandidate,
  type CorpusEventHistoryAnchorRecord,
} from "../../src/lib/knowledge/corpus-processing-event-history";
import {
  CORPUS_EXTERNAL_ANCHOR_MAX_REQUEST_FILE_BYTES,
  parseCorpusExternalAnchorCliArgs,
  readCorpusExternalAnchorPreparedRequestFile,
} from "../../scripts/knowledge/manage-corpus-external-anchor-ledger";

const ANCHOR_LOG_PATH =
  "knowledge/corpus/corpus-processing-state-event-history-anchors.v1.jsonl";

function sha(char: string): string {
  return `sha256:${char.repeat(64)}`;
}

function rawSha(value: Buffer): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function baselineInputs(
  overrides: Partial<CorpusExternalAnchorRepositoryBaselineInputs> = {},
): CorpusExternalAnchorRepositoryBaselineInputs {
  return {
    baseline: {
      path: "knowledge/corpus/corpus-processing-baseline.v1.json",
      fileSha256: sha("6"),
      sizeBytes: 1000,
    },
    processingRegister: {
      path: "knowledge/corpus/corpus-processing-register.v1.jsonl",
      fileSha256: sha("7"),
      sizeBytes: 2000,
    },
    baselineGenerationManifest: {
      path: "knowledge/corpus/corpus-processing-generation-manifest.v1.json",
      fileSha256: sha("8"),
      sizeBytes: 3000,
    },
    ...overrides,
  };
}

function candidate(input: {
  sequence: number;
  predecessorRecordSha256: string | null;
  createdAt: string;
  eventCount?: number;
}): CorpusEventHistoryAnchorCandidate {
  const eventCount = input.eventCount ?? 0;
  return validateCorpusEventHistoryAnchorRecord(
    sealCorpusEventHistoryAnchorRecord({
      schemaVersion: CORPUS_EVENT_HISTORY_ANCHOR_SCHEMA_VERSION,
      recordType: "history_anchor_candidate" as const,
      anchorId: `anchor.external.fixture.${input.sequence}`,
      sequence: input.sequence,
      predecessorRecordSha256: input.predecessorRecordSha256,
      eventLogPrefix: {
        path: "knowledge/corpus/corpus-processing-state-events.v1.jsonl",
        fileSha256: eventCount === 0 ? sha("0") : sha("1"),
        sizeBytes: eventCount === 0 ? 0 : 100,
      },
      eventCount,
      firstEventSha256: eventCount === 0 ? null : sha("2"),
      lastEventSha256: eventCount === 0 ? null : sha("2"),
      eventSetSha256: sha("3"),
      eventManifest: {
        path: "knowledge/corpus/corpus-processing-state-event-manifest.v1.json",
        fileSha256: sha("4"),
        sizeBytes: 200,
        manifestSha256: sha("5"),
      },
      createdAt: input.createdAt,
    }),
  ) as CorpusEventHistoryAnchorCandidate;
}

function jsonLines(records: CorpusEventHistoryAnchorRecord[]): Buffer {
  return Buffer.from(
    `${records.map((record) => JSON.stringify(record)).join("\n")}\n`,
    "utf8",
  );
}

function firstSnapshot() {
  const firstCandidate = candidate({
    sequence: 1,
    predecessorRecordSha256: null,
    createdAt: "2026-08-04T08:00:00Z",
  });
  const request = prepareCorpusExternalAnchorAppendRequest({
    repositoryAnchorLogPath: ANCHOR_LOG_PATH,
    repositoryAnchorLogBytes: jsonLines([firstCandidate]),
    repositoryBaselineInputs: baselineInputs(),
    candidate: firstCandidate,
    externalSnapshot: null,
    verifiedAt: "2026-08-04T08:01:00Z",
  });
  const snapshot = appendRequestToCorpusExternalAnchorSnapshot({
    request,
    previousSnapshot: null,
    appendedAt: "2026-08-04T08:02:00Z",
  });
  return { firstCandidate, request, snapshot };
}

test("prepares a deterministic non-claiming request and validates schema parity", () => {
  const { firstCandidate, request, snapshot } = firstSnapshot();
  const repeated = prepareCorpusExternalAnchorAppendRequest({
    repositoryAnchorLogPath: ANCHOR_LOG_PATH,
    repositoryAnchorLogBytes: jsonLines([firstCandidate]),
    repositoryBaselineInputs: baselineInputs(),
    candidate: firstCandidate,
    externalSnapshot: null,
    verifiedAt: "2026-08-04T08:01:00Z",
  });
  assert.deepEqual(repeated, request);
  assert.equal(request.verification.method, "controlled_project_identity");
  assert.equal(request.externalHeadPrecondition, null);
  assert.deepEqual(validateCorpusExternalAnchorAppendRequest(request), request);

  const schema = JSON.parse(
    readFileSync(
      "knowledge/schema/corpus-event-history-external-anchor-ledger.schema.v1.json",
      "utf8",
    ),
  ) as object;
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  for (const value of [request, snapshot.records[0], snapshot.head]) {
    assert.equal(validate(value), true, JSON.stringify(validate.errors));
  }
});

test("rejects invalid genesis, successor forks, skipped record counts, and baseline drift", () => {
  const invalidGenesis = candidate({
    sequence: 3,
    predecessorRecordSha256: sha("f"),
    createdAt: "2026-08-04T08:00:00Z",
  });
  assert.throws(
    () =>
      prepareCorpusExternalAnchorAppendRequest({
        repositoryAnchorLogPath: ANCHOR_LOG_PATH,
        repositoryAnchorLogBytes: jsonLines([invalidGenesis]),
        repositoryBaselineInputs: baselineInputs(),
        candidate: invalidGenesis,
        externalSnapshot: null,
        verifiedAt: "2026-08-04T08:01:00Z",
      }),
    /genesis requires candidate sequence 1 with a null predecessor/,
  );

  const first = firstSnapshot();
  const repositoryPrefix = [first.firstCandidate, first.request.verification];
  const forkedCandidate = candidate({
    sequence: 3,
    predecessorRecordSha256: sha("f"),
    createdAt: "2026-08-04T09:00:00Z",
    eventCount: 1,
  });
  assert.throws(
    () =>
      prepareCorpusExternalAnchorAppendRequest({
        repositoryAnchorLogPath: ANCHOR_LOG_PATH,
        repositoryAnchorLogBytes: jsonLines([
          ...repositoryPrefix,
          forkedCandidate,
        ]),
        repositoryBaselineInputs: baselineInputs(),
        candidate: forkedCandidate,
        externalSnapshot: first.snapshot,
        verifiedAt: "2026-08-04T09:01:00Z",
      }),
    /candidate predecessor does not match the prior trusted verification/,
  );

  const skippedSequenceCandidate = candidate({
    sequence: 5,
    predecessorRecordSha256: first.request.verification.recordSha256,
    createdAt: "2026-08-04T09:00:00Z",
    eventCount: 1,
  });
  assert.throws(
    () =>
      prepareCorpusExternalAnchorAppendRequest({
        repositoryAnchorLogPath: ANCHOR_LOG_PATH,
        repositoryAnchorLogBytes: jsonLines([
          ...repositoryPrefix,
          skippedSequenceCandidate,
        ]),
        repositoryBaselineInputs: baselineInputs(),
        candidate: skippedSequenceCandidate,
        externalSnapshot: first.snapshot,
        verifiedAt: "2026-08-04T09:01:00Z",
      }),
    /candidate sequence does not extend the prior repository record count/,
  );

  const validSuccessor = candidate({
    sequence: 3,
    predecessorRecordSha256: first.request.verification.recordSha256,
    createdAt: "2026-08-04T09:00:00Z",
    eventCount: 1,
  });
  assert.throws(
    () =>
      prepareCorpusExternalAnchorAppendRequest({
        repositoryAnchorLogPath: ANCHOR_LOG_PATH,
        repositoryAnchorLogBytes: jsonLines([
          ...repositoryPrefix,
          validSuccessor,
        ]),
        repositoryBaselineInputs: baselineInputs({
          baseline: {
            path: "knowledge/corpus/corpus-processing-baseline.v1.json",
            fileSha256: sha("a"),
            sizeBytes: 1000,
          },
        }),
        candidate: validSuccessor,
        externalSnapshot: first.snapshot,
        verifiedAt: "2026-08-04T09:01:00Z",
      }),
    /changes the immutable baseline, processing register, or baseline generation manifest/,
  );
});

test("preserves the full external chain and accepts every retained exact pair", () => {
  const first = firstSnapshot();
  const secondCandidate = candidate({
    sequence: 3,
    predecessorRecordSha256: first.request.verification.recordSha256,
    createdAt: "2026-08-04T09:00:00Z",
    eventCount: 1,
  });
  const repositoryRecords = [
    first.firstCandidate,
    first.request.verification,
    secondCandidate,
  ];
  const secondRequest = prepareCorpusExternalAnchorAppendRequest({
    repositoryAnchorLogPath: ANCHOR_LOG_PATH,
    repositoryAnchorLogBytes: jsonLines(repositoryRecords),
    repositoryBaselineInputs: baselineInputs(),
    candidate: secondCandidate,
    externalSnapshot: first.snapshot,
    verifiedAt: "2026-08-04T09:01:00Z",
  });
  const second = appendRequestToCorpusExternalAnchorSnapshot({
    request: secondRequest,
    previousSnapshot: first.snapshot,
    appendedAt: "2026-08-04T09:02:00Z",
  });
  assert.equal(second.records.length, 2);
  assert.equal(
    second.records[1]!.predecessorRecordSha256,
    second.records[0]!.recordSha256,
  );
  assert.equal(second.head.recordCount, 2);
  const verifier = createCorpusExternalAnchorVerifier({
    snapshot: second,
    latestCandidate: secondCandidate,
    latestVerification: secondRequest.verification,
    latestRepositoryBaselineInputs: baselineInputs(),
  });
  assert.equal(
    verifier({
      candidate: first.firstCandidate,
      verification: first.request.verification,
    }),
    true,
  );
  assert.equal(
    verifier({
      candidate: secondCandidate,
      verification: secondRequest.verification,
    }),
    true,
  );
  assert.throws(
    () =>
      requireLatestExternalAnchorBinding({
        snapshot: second,
        candidate: first.firstCandidate,
        verification: first.request.verification,
        repositoryBaselineInputs: baselineInputs(),
      }),
    /latest head does not exactly match/,
  );
  assert.equal(
    requireRequestIsLatestExternalAppend({
      request: secondRequest,
      snapshot: second,
    }).recordSha256,
    secondRequest.verification.recordSha256,
  );
  const forgedView = {
    ...second,
    records: structuredClone(second.records),
  };
  forgedView.records[0]!.candidateAnchorId = "anchor.forged.view";
  const verifierFromRevalidatedBytes = createCorpusExternalAnchorVerifier({
    snapshot: forgedView,
    latestCandidate: secondCandidate,
    latestVerification: secondRequest.verification,
    latestRepositoryBaselineInputs: baselineInputs(),
  });
  assert.equal(
    verifierFromRevalidatedBytes({
      candidate: first.firstCandidate,
      verification: first.request.verification,
    }),
    true,
  );
});

test("rejects a fully resealed external ledger that changes immutable baseline inputs", () => {
  const first = firstSnapshot();
  const secondCandidate = candidate({
    sequence: 3,
    predecessorRecordSha256: first.request.verification.recordSha256,
    createdAt: "2026-08-04T09:00:00Z",
    eventCount: 1,
  });
  const secondRequest = prepareCorpusExternalAnchorAppendRequest({
    repositoryAnchorLogPath: ANCHOR_LOG_PATH,
    repositoryAnchorLogBytes: jsonLines([
      first.firstCandidate,
      first.request.verification,
      secondCandidate,
    ]),
    repositoryBaselineInputs: baselineInputs(),
    candidate: secondCandidate,
    externalSnapshot: first.snapshot,
    verifiedAt: "2026-08-04T09:01:00Z",
  });
  const second = appendRequestToCorpusExternalAnchorSnapshot({
    request: secondRequest,
    previousSnapshot: first.snapshot,
    appendedAt: "2026-08-04T09:02:00Z",
  });
  const { recordSha256: _oldRecordSha256, ...secondRecordBody } =
    second.records[1]!;
  const driftedRecordBody = {
    ...secondRecordBody,
    repositoryBaselineInputs: baselineInputs({
      processingRegister: {
        path: "knowledge/corpus/corpus-processing-register.v1.jsonl",
        fileSha256: sha("a"),
        sizeBytes: 2000,
      },
    }),
  };
  const driftedRecord = {
    ...driftedRecordBody,
    recordSha256: hashCorpusExternalAnchorLedgerRecord(driftedRecordBody),
  };
  const ledgerBytes = Buffer.from(
    `${JSON.stringify(second.records[0])}\n${JSON.stringify(driftedRecord)}\n`,
  );
  const { headSha256: _oldHeadSha256, ...secondHeadBody } = second.head;
  const driftedHeadBody = {
    ...secondHeadBody,
    ledgerFileSha256: rawSha(ledgerBytes),
    ledgerSizeBytes: ledgerBytes.length,
    latestRecordSha256: driftedRecord.recordSha256,
  };
  const driftedHead = {
    ...driftedHeadBody,
    headSha256: hashCorpusExternalAnchorLedgerHead(driftedHeadBody),
  };
  assert.throws(
    () =>
      validateCorpusExternalAnchorLedgerSnapshot({
        ledgerBytes,
        headBytes: Buffer.from(`${JSON.stringify(driftedHead, null, 2)}\n`),
      }),
    /changes immutable repository baseline inputs/,
  );
});

test("fails closed on compare-and-swap conflict, rollback, head drift and noncanonical bytes", () => {
  const first = firstSnapshot();
  assert.throws(
    () =>
      appendRequestToCorpusExternalAnchorSnapshot({
        request: first.request,
        previousSnapshot: first.snapshot,
        appendedAt: "2026-08-04T08:03:00Z",
      }),
    /compare-and-swap precondition mismatch/,
  );
  assert.throws(
    () =>
      validateCorpusExternalAnchorLedgerSnapshot({
        ledgerBytes: Buffer.from("", "utf8"),
        headBytes: first.snapshot.headBytes,
      }),
    /non-empty canonical JSONL/,
  );
  const noncanonicalLedger = Buffer.from(
    `${JSON.stringify(first.snapshot.records[0], null, 2)}\n`,
    "utf8",
  );
  assert.throws(
    () =>
      validateCorpusExternalAnchorLedgerSnapshot({
        ledgerBytes: noncanonicalLedger,
        headBytes: first.snapshot.headBytes,
      }),
    /not canonical JSONL|invalid JSON/,
  );
  const driftedHeadBody = {
    ...first.snapshot.head,
    latestVerificationRecordSha256: sha("f"),
  };
  const driftedHead = {
    ...driftedHeadBody,
    headSha256: hashCorpusExternalAnchorLedgerHead(driftedHeadBody),
  } as CorpusExternalAnchorLedgerHead;
  assert.throws(
    () =>
      validateCorpusExternalAnchorLedgerSnapshot({
        ledgerBytes: first.snapshot.ledgerBytes,
        headBytes: Buffer.from(`${JSON.stringify(driftedHead, null, 2)}\n`),
      }),
    /does not exactly bind/,
  );
  const { recordSha256: _recordSeal, ...recordBody } =
    first.snapshot.records[0]!;
  const brokenPrefixBody = {
    ...recordBody,
    repositoryAnchorLogPrefix: {
      ...recordBody.repositoryAnchorLogPrefix,
      recordCount: 2,
    },
  };
  const brokenPrefixRecord = {
    ...brokenPrefixBody,
    recordSha256: hashCorpusExternalAnchorLedgerRecord(brokenPrefixBody),
  };
  const brokenLedgerBytes = Buffer.from(
    `${JSON.stringify(brokenPrefixRecord)}\n`,
    "utf8",
  );
  const brokenHeadBody = {
    ...first.snapshot.head,
    ledgerFileSha256: rawSha(brokenLedgerBytes),
    ledgerSizeBytes: brokenLedgerBytes.length,
    firstRecordSha256: brokenPrefixRecord.recordSha256,
    latestRecordSha256: brokenPrefixRecord.recordSha256,
  };
  const brokenHead = {
    ...brokenHeadBody,
    headSha256: hashCorpusExternalAnchorLedgerHead(brokenHeadBody),
  };
  assert.throws(
    () =>
      validateCorpusExternalAnchorLedgerSnapshot({
        ledgerBytes: brokenLedgerBytes,
        headBytes: Buffer.from(`${JSON.stringify(brokenHead, null, 2)}\n`),
      }),
    /breaks the repository anchor-prefix chain/,
  );
});

test("rejects a changed and resealed baseline/register under the same event candidate", () => {
  const first = firstSnapshot();
  const changedInputs = baselineInputs({
    baseline: {
      path: "knowledge/corpus/corpus-processing-baseline.v1.json",
      fileSha256: sha("a"),
      sizeBytes: 1000,
    },
    processingRegister: {
      path: "knowledge/corpus/corpus-processing-register.v1.jsonl",
      fileSha256: sha("b"),
      sizeBytes: 2000,
    },
    baselineGenerationManifest: {
      path: "knowledge/corpus/corpus-processing-generation-manifest.v1.json",
      fileSha256: sha("c"),
      sizeBytes: 3000,
    },
  });
  assert.throws(
    () =>
      createCorpusExternalAnchorVerifier({
        snapshot: first.snapshot,
        latestCandidate: first.firstCandidate,
        latestVerification: first.request.verification,
        latestRepositoryBaselineInputs: changedInputs,
      }),
    /latest head does not exactly match/,
  );
});

test("rejects user-owned and symlinked external roots and repository-contained roots", () => {
  const userOwned = mkdtempSync(
    join(realpathSync(tmpdir()), "external-anchor-user-owned-"),
  );
  chmodSync(userOwned, 0o755);
  assert.throws(
    () =>
      loadRootOwnedCorpusExternalAnchorLedger(userOwned, { allowEmpty: true }),
    /not root-owned|group- or world-writable/,
  );
  const symlink = `${userOwned}-symlink`;
  symlinkSync(userOwned, symlink, "dir");
  assert.throws(
    () =>
      loadRootOwnedCorpusExternalAnchorLedger(symlink, { allowEmpty: true }),
    /symlink/,
  );
  if (process.platform === "darwin") {
    assert.throws(
      () =>
        loadRootOwnedCorpusExternalAnchorLedger(
          "/var/db/food-systems-corpus-anchor",
          { allowEmpty: true },
        ),
      /symlink/,
    );
  }
  assert.throws(
    () =>
      assertExternalRootOutsideRepository({
        repositoryRoot: "/private/tmp/project",
        externalRoot: "/private/tmp/project/external",
      }),
    /outside the repository/,
  );
});

test("rejects unexpected, temporary and lock entries in the external authority root", () => {
  assert.doesNotThrow(() => validateCorpusExternalAnchorDirectoryEntries([]));
  assert.doesNotThrow(() =>
    validateCorpusExternalAnchorDirectoryEntries([
      "corpus-event-history-anchors.v1.jsonl",
      "corpus-event-history-anchors-head.v1.json",
    ]),
  );
  for (const entry of [
    ".corpus-event-history-anchors.append.lock",
    ".ledger.tmp-123",
    "unexpected.json",
  ]) {
    assert.throws(
      () => validateCorpusExternalAnchorDirectoryEntries([entry]),
      /unexpected entries/,
    );
  }
});

test("reads one exact stable prepared-request file and rejects unsafe file states", () => {
  const directory = mkdtempSync(
    join(realpathSync(tmpdir()), "anchor-request-"),
  );
  const requestPath = join(directory, "request.json");
  const requestBytes = Buffer.from(
    `${JSON.stringify(firstSnapshot().request, null, 2)}\n`,
    "utf8",
  );
  try {
    writeFileSync(requestPath, requestBytes, { mode: 0o600 });
    const read = readCorpusExternalAnchorPreparedRequestFile(requestPath);
    assert.equal(read.absolutePath, requestPath);
    assert.equal(read.fileSha256, rawSha(requestBytes));
    assert.equal(read.sizeBytes, requestBytes.length);
    assert.deepEqual(read.request, firstSnapshot().request);

    chmodSync(requestPath, 0o644);
    assert.throws(
      () => readCorpusExternalAnchorPreparedRequestFile(requestPath),
      /mode 0400 or 0600/,
    );
    chmodSync(requestPath, 0o600);

    const hardLinkPath = join(directory, "hard-link.json");
    linkSync(requestPath, hardLinkPath);
    assert.throws(
      () => readCorpusExternalAnchorPreparedRequestFile(requestPath),
      /one-link regular/,
    );
    rmSync(hardLinkPath);

    const symlinkPath = join(directory, "symlink.json");
    symlinkSync(requestPath, symlinkPath);
    assert.throws(
      () => readCorpusExternalAnchorPreparedRequestFile(symlinkPath),
      /must not cross a symlink/,
    );

    const emptyPath = join(directory, "empty.json");
    writeFileSync(emptyPath, "", { mode: 0o600 });
    assert.throws(
      () => readCorpusExternalAnchorPreparedRequestFile(emptyPath),
      /fixed safety limit/,
    );

    const oversizedPath = join(directory, "oversized.json");
    writeFileSync(
      oversizedPath,
      Buffer.alloc(CORPUS_EXTERNAL_ANCHOR_MAX_REQUEST_FILE_BYTES + 1),
      { mode: 0o600 },
    );
    assert.throws(
      () => readCorpusExternalAnchorPreparedRequestFile(oversizedPath),
      /fixed safety limit/,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("parses only explicit prepare, check and verify modes", () => {
  assert.deepEqual(
    parseCorpusExternalAnchorCliArgs([
      "--prepare",
      "--external-root=/private/var/db/food-systems-corpus-anchor",
      "--verified-at=2026-08-04T08:01:00Z",
      "--expect-empty-external",
    ]),
    {
      mode: "prepare",
      externalRoot: "/private/var/db/food-systems-corpus-anchor",
      verifiedAt: "2026-08-04T08:01:00Z",
      requestPath: null,
      expectEmptyExternal: true,
    },
  );
  assert.deepEqual(
    parseCorpusExternalAnchorCliArgs([
      "--check-request",
      "--external-root=/private/var/db/food-systems-corpus-anchor",
      "--request=/private/tmp/request.json",
    ]).mode,
    "check_request",
  );
  assert.throws(
    () =>
      parseCorpusExternalAnchorCliArgs([
        "--prepare",
        "--prepare",
        "--external-root=/private/var/db/food-systems-corpus-anchor",
        "--verified-at=2026-08-04T08:01:00Z",
      ]),
    /exactly one command mode/,
  );
  assert.throws(
    () =>
      parseCorpusExternalAnchorCliArgs([
        "--prepare",
        "--check-external",
        "--external-root=/private/var/db/food-systems-corpus-anchor",
        "--verified-at=2026-08-04T08:01:00Z",
      ]),
    /exactly one command mode/,
  );
  assert.throws(
    () =>
      parseCorpusExternalAnchorCliArgs([
        "--check-external",
        "--external-root=relative",
      ]),
    /must be absolute/,
  );
  assert.throws(
    () =>
      parseCorpusExternalAnchorCliArgs([
        "--check-external",
        "--external-root=/private/var/db/caller-selected-anchor",
      ]),
    /fixed production authority/,
  );
  assert.equal(
    CORPUS_EXTERNAL_ANCHOR_LEDGER_SCHEMA_VERSION.endsWith("-v1"),
    true,
  );
});
