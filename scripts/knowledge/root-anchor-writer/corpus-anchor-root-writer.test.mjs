import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  chmodSync,
  existsSync,
  linkSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  HEAD_FILE,
  LEDGER_FILE,
  LOCK_FILE,
  REQUEST_FILE_MODE,
  appendPreparedRequestForTestPolicy,
  checkExternalLedgerForPolicy,
  createTestPolicy,
  validateLedgerSnapshot,
} from "./corpus-anchor-root-writer.mjs";

const EVENT_ANCHOR_DOMAIN =
  "food-systems/corpus-processing-event-history-anchor/v1\n";
const EVIDENCE_DOMAIN = "food-systems/corpus-external-anchor-evidence/v1\n";
const REQUEST_DOMAIN = "food-systems/corpus-external-anchor-request/v1\n";
const RECORD_DOMAIN = "food-systems/corpus-external-anchor-record/v1\n";
const HEAD_DOMAIN = "food-systems/corpus-external-anchor-head/v1\n";

function canonical(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonical(item)).join(",")}]`;
  }
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`)
    .join(",")}}`;
}

function hash(domain, value) {
  return `sha256:${createHash("sha256")
    .update(domain)
    .update(canonical(value))
    .digest("hex")}`;
}

function rawFileSha256(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function seal(domain, value, field) {
  const body = Object.fromEntries(
    Object.entries(value).filter(([key]) => key !== field),
  );
  return { ...body, [field]: hash(domain, body) };
}

function sha(char) {
  return `sha256:${char.repeat(64)}`;
}

function baselineInputs() {
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
  };
}

function candidate({
  sequence = 1,
  predecessorRecordSha256 = null,
  createdAt = "2026-08-04T08:00:00Z",
  eventCount = 0,
} = {}) {
  return seal(
    EVENT_ANCHOR_DOMAIN,
    {
      schemaVersion: "corpus-processing-event-history-anchor-v1",
      recordType: "history_anchor_candidate",
      anchorId: `anchor.root-writer.fixture.${sequence}`,
      sequence,
      predecessorRecordSha256,
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
      createdAt,
    },
    "recordSha256",
  );
}

function request({
  anchorCandidate = candidate(),
  precondition = null,
  preparedAt = "2026-08-04T08:01:00Z",
  baseline = baselineInputs(),
} = {}) {
  const repositoryAnchorLogPrefix = {
    path: "knowledge/corpus/corpus-processing-state-event-history-anchors.v1.jsonl",
    fileSha256: sha("9"),
    sizeBytes: 1001,
    recordCount: anchorCandidate.sequence,
    lastRecordSha256: anchorCandidate.recordSha256,
  };
  const evidence = {
    projectId: "food-systems-2026",
    ledgerId: "food-systems.corpus-event-history",
    verifierId: "project-identity.food-systems.root-ledger.v1",
    method: "controlled_project_identity",
    repositoryAnchorLogPrefix,
    repositoryBaselineInputs: baseline,
    candidateRecordSha256: anchorCandidate.recordSha256,
    externalHeadPrecondition: precondition,
    verifiedAt: preparedAt,
  };
  const verification = seal(
    EVENT_ANCHOR_DOMAIN,
    {
      schemaVersion: "corpus-processing-event-history-anchor-v1",
      recordType: "history_anchor_trusted_verification",
      verificationId: `verification.external-root-ledger.${anchorCandidate.recordSha256.slice("sha256:".length)}`,
      sequence: anchorCandidate.sequence + 1,
      predecessorRecordSha256: anchorCandidate.recordSha256,
      candidateRecordSha256: anchorCandidate.recordSha256,
      verifierId: "project-identity.food-systems.root-ledger.v1",
      method: "controlled_project_identity",
      evidenceSha256: hash(EVIDENCE_DOMAIN, evidence),
      verifiedAt: preparedAt,
    },
    "recordSha256",
  );
  return seal(
    REQUEST_DOMAIN,
    {
      schemaVersion: "corpus-event-history-external-anchor-ledger-v1",
      artifactType: "external_anchor_append_request",
      projectId: "food-systems-2026",
      ledgerId: "food-systems.corpus-event-history",
      requestId: `request.external-anchor.${anchorCandidate.recordSha256.slice("sha256:".length)}`,
      repositoryAnchorLogPrefix,
      repositoryBaselineInputs: baseline,
      candidate: anchorCandidate,
      verification,
      externalHeadPrecondition: precondition,
      preparedAt,
    },
    "requestSha256",
  );
}

function makeFixture(options = {}) {
  const parent = realpathSync(tmpdir());
  const root = mkdtempSync(join(parent, "root-anchor-writer-ledger-"));
  chmodSync(root, 0o755);
  const requestRoot = mkdtempSync(join(parent, "root-anchor-writer-request-"));
  const value = options.request ?? request();
  const requestPath = join(requestRoot, "request.json");
  const requestBytes = Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
  writeFileSync(requestPath, requestBytes, { mode: REQUEST_FILE_MODE });
  return {
    root,
    requestRoot,
    requestPath,
    requestFileSha256: rawFileSha256(requestBytes),
    request: value,
    policy: createTestPolicy({
      externalRoot: root,
      requestRoot,
      faultInjector: options.faultInjector ?? null,
    }),
  };
}

function clock(...values) {
  let index = 0;
  return () => values[Math.min(index++, values.length - 1)];
}

function appendFirst(fixture) {
  return appendPreparedRequestForTestPolicy({
    requestPath: fixture.requestPath,
    expectedRequestFileSha256: fixture.requestFileSha256,
    policy: fixture.policy,
    now: clock("2026-08-04T08:02:00Z", "2026-08-04T08:03:00Z"),
  });
}

function currentPrecondition(root) {
  const head = JSON.parse(readFileSync(join(root, HEAD_FILE), "utf8"));
  return {
    recordCount: head.recordCount,
    latestRecordSha256: head.latestRecordSha256,
    headSha256: head.headSha256,
  };
}

test("requires the administrator-pinned SHA-256 of the exact request file bytes", () => {
  const fixture = makeFixture();
  assert.throws(
    () =>
      appendPreparedRequestForTestPolicy({
        requestPath: fixture.requestPath,
        policy: fixture.policy,
      }),
    /administrator-pinned expected request file SHA-256/,
  );
  assert.throws(
    () =>
      appendPreparedRequestForTestPolicy({
        requestPath: fixture.requestPath,
        expectedRequestFileSha256: sha("f"),
        policy: fixture.policy,
      }),
    /do not match the administrator-pinned expected SHA-256/,
  );
  assert.deepEqual(readdirSyncSorted(fixture.root), []);
});

test("rejects invalid genesis, successor forks, skipped record counts, and baseline drift", () => {
  const invalidGenesis = makeFixture({
    request: request({
      anchorCandidate: candidate({
        sequence: 3,
        predecessorRecordSha256: sha("f"),
      }),
    }),
  });
  assert.throws(
    () => appendFirst(invalidGenesis),
    /genesis requires candidate sequence 1 with a null predecessor/,
  );

  const fixture = makeFixture();
  appendFirst(fixture);
  const attempt = (value, expected) => {
    const bytes = Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
    chmodSync(fixture.requestPath, 0o600);
    writeFileSync(fixture.requestPath, bytes);
    chmodSync(fixture.requestPath, REQUEST_FILE_MODE);
    assert.throws(
      () =>
        appendPreparedRequestForTestPolicy({
          requestPath: fixture.requestPath,
          expectedRequestFileSha256: rawFileSha256(bytes),
          policy: fixture.policy,
          now: clock("2026-08-04T09:02:00Z", "2026-08-04T09:03:00Z"),
        }),
      expected,
    );
    assert.equal(checkExternalLedgerForPolicy(fixture.policy).recordCount, 1);
  };
  attempt(
    request({
      anchorCandidate: candidate({
        sequence: 3,
        predecessorRecordSha256: sha("f"),
        createdAt: "2026-08-04T09:00:00Z",
        eventCount: 1,
      }),
      precondition: currentPrecondition(fixture.root),
      preparedAt: "2026-08-04T09:01:00Z",
    }),
    /candidate predecessor does not match the prior trusted verification/,
  );
  attempt(
    request({
      anchorCandidate: candidate({
        sequence: 5,
        predecessorRecordSha256: fixture.request.verification.recordSha256,
        createdAt: "2026-08-04T09:00:00Z",
        eventCount: 1,
      }),
      precondition: currentPrecondition(fixture.root),
      preparedAt: "2026-08-04T09:01:00Z",
    }),
    /candidate sequence does not extend the prior repository record count/,
  );
  attempt(
    request({
      anchorCandidate: candidate({
        sequence: 3,
        predecessorRecordSha256: fixture.request.verification.recordSha256,
        createdAt: "2026-08-04T09:00:00Z",
        eventCount: 1,
      }),
      precondition: currentPrecondition(fixture.root),
      preparedAt: "2026-08-04T09:01:00Z",
      baseline: {
        ...baselineInputs(),
        baseline: {
          ...baselineInputs().baseline,
          fileSha256: sha("a"),
        },
      },
    }),
    /changes the immutable baseline, processing register, or baseline generation manifest/,
  );
});

test("rejects a valid replacement request when the administrator pinned the original file", () => {
  const fixture = makeFixture();
  const replacement = request({ preparedAt: "2026-08-04T08:01:30Z" });
  const replacementBytes = Buffer.from(
    `${JSON.stringify(replacement, null, 2)}\n`,
  );
  chmodSync(fixture.requestPath, 0o600);
  writeFileSync(fixture.requestPath, replacementBytes);
  chmodSync(fixture.requestPath, REQUEST_FILE_MODE);
  assert.throws(
    () =>
      appendPreparedRequestForTestPolicy({
        requestPath: fixture.requestPath,
        expectedRequestFileSha256: fixture.requestFileSha256,
        policy: fixture.policy,
      }),
    /do not match the administrator-pinned expected SHA-256/,
  );
  assert.deepEqual(readdirSyncSorted(fixture.root), []);
});

test("rejects request hard links, loose modes, nested paths, and overlapping roots", () => {
  const hardlinkFixture = makeFixture();
  linkSync(
    hardlinkFixture.requestPath,
    join(hardlinkFixture.requestRoot, "request-hardlink.json"),
  );
  assert.throws(() => appendFirst(hardlinkFixture), /must have one hard link/);

  const modeFixture = makeFixture();
  chmodSync(modeFixture.requestPath, 0o600);
  assert.throws(() => appendFirst(modeFixture), /mode must be exactly 0400/);

  const ownerFixture = makeFixture();
  const wrongOwnerPolicy = createTestPolicy({
    externalRoot: ownerFixture.root,
    requestRoot: ownerFixture.requestRoot,
    requestFileExpectedUid: (process.getuid?.() ?? 0) + 1,
  });
  assert.throws(
    () =>
      appendPreparedRequestForTestPolicy({
        requestPath: ownerFixture.requestPath,
        expectedRequestFileSha256: ownerFixture.requestFileSha256,
        policy: wrongOwnerPolicy,
      }),
    /owner is invalid/,
  );

  const nestedFixture = makeFixture();
  const nestedRoot = join(nestedFixture.requestRoot, "nested");
  mkdirSync(nestedRoot, { mode: 0o700 });
  const nestedPath = join(nestedRoot, "request.json");
  const nestedBytes = readFileSync(nestedFixture.requestPath);
  writeFileSync(nestedPath, nestedBytes, { mode: REQUEST_FILE_MODE });
  assert.throws(
    () =>
      appendPreparedRequestForTestPolicy({
        requestPath: nestedPath,
        expectedRequestFileSha256: rawFileSha256(nestedBytes),
        policy: nestedFixture.policy,
      }),
    /direct file in the fixed request root/,
  );

  const overlapFixture = makeFixture();
  const requestRootInsideLedger = join(overlapFixture.root, "requests");
  mkdirSync(requestRootInsideLedger, { mode: 0o700 });
  const overlappingPolicy = createTestPolicy({
    externalRoot: overlapFixture.root,
    requestRoot: requestRootInsideLedger,
  });
  assert.throws(
    () =>
      appendPreparedRequestForTestPolicy({
        requestPath: overlapFixture.requestPath,
        expectedRequestFileSha256: overlapFixture.requestFileSha256,
        policy: overlappingPolicy,
      }),
    /request root and external root must be disjoint/,
  );
});

test("rejects a handcrafted caller-selected policy at the append boundary", () => {
  const fixture = makeFixture();
  assert.throws(
    () =>
      appendPreparedRequestForTestPolicy({
        requestPath: fixture.requestPath,
        expectedRequestFileSha256: fixture.requestFileSha256,
        policy: {
          externalRoot: fixture.root,
          requestRoot: fixture.requestRoot,
          expectedUid: process.getuid?.() ?? 0,
          requestRootExpectedUid: process.getuid?.() ?? 0,
          requestFileExpectedUid: process.getuid?.() ?? 0,
          requireSecureAncestors: false,
          requireSecureRequestAncestors: false,
          faultInjector: null,
        },
      }),
    /policy created by createTestPolicy/,
  );
  assert.deepEqual(readdirSyncSorted(fixture.root), []);
});

test("durably initializes the fixed-format external files without touching repository state", () => {
  const fixture = makeFixture();
  const result = appendFirst(fixture);
  assert.equal(result.status, "external_anchor_append_committed");
  assert.equal(result.repositoryModified, false);
  assert.equal(result.repositoryVerificationAppended, false);
  assert.equal(existsSync(join(fixture.root, LOCK_FILE)), false);
  assert.equal(lstatSync(join(fixture.root, LEDGER_FILE)).mode & 0o777, 0o444);
  assert.equal(lstatSync(join(fixture.root, HEAD_FILE)).mode & 0o777, 0o444);
  assert.deepEqual(
    readdirSyncSorted(fixture.root),
    [HEAD_FILE, LEDGER_FILE].sort(),
  );
  const check = checkExternalLedgerForPolicy(fixture.policy);
  assert.equal(check.initialized, true);
  assert.equal(check.recordCount, 1);
  const record = JSON.parse(
    readFileSync(join(fixture.root, LEDGER_FILE), "utf8").trimEnd(),
  );
  assert.deepEqual(record.repositoryBaselineInputs, baselineInputs());
});

function readdirSyncSorted(path) {
  return readdirSync(path).sort();
}

test("check fails closed when the fixed request root is absent or insecure", () => {
  const absentFixture = makeFixture();
  const absentRequestRoot = `${absentFixture.requestRoot}-absent`;
  assert.throws(
    () =>
      checkExternalLedgerForPolicy(
        createTestPolicy({
          externalRoot: absentFixture.root,
          requestRoot: absentRequestRoot,
        }),
      ),
    /path component is absent/,
  );

  const insecureFixture = makeFixture();
  chmodSync(insecureFixture.requestRoot, 0o755);
  assert.throws(
    () => checkExternalLedgerForPolicy(insecureFixture.policy),
    /request root mode must be exactly 0700/,
  );
});

test("rejects a replay even when it carries the latest compare-and-swap head", () => {
  const fixture = makeFixture();
  appendFirst(fixture);
  const replay = request({
    anchorCandidate: fixture.request.candidate,
    precondition: currentPrecondition(fixture.root),
    preparedAt: "2026-08-04T08:04:00Z",
  });
  const replayBytes = Buffer.from(`${JSON.stringify(replay, null, 2)}\n`);
  chmodSync(fixture.requestPath, 0o600);
  writeFileSync(fixture.requestPath, replayBytes);
  chmodSync(fixture.requestPath, REQUEST_FILE_MODE);
  assert.throws(
    () =>
      appendPreparedRequestForTestPolicy({
        requestPath: fixture.requestPath,
        expectedRequestFileSha256: rawFileSha256(replayBytes),
        policy: fixture.policy,
        now: clock("2026-08-04T08:05:00Z", "2026-08-04T08:06:00Z"),
      }),
    /non-genesis append request|candidate or verification is a replay/,
  );
  assert.equal(existsSync(join(fixture.root, LOCK_FILE)), false);
});

test("extends the full chain and rejects a stale compare-and-swap head", () => {
  const fixture = makeFixture();
  appendFirst(fixture);
  const secondCandidate = candidate({
    sequence: 3,
    predecessorRecordSha256: fixture.request.verification.recordSha256,
    createdAt: "2026-08-04T09:00:00Z",
    eventCount: 1,
  });
  const stale = request({
    anchorCandidate: secondCandidate,
    precondition: {
      recordCount: 1,
      latestRecordSha256: sha("a"),
      headSha256: sha("b"),
    },
    preparedAt: "2026-08-04T09:01:00Z",
  });
  const staleBytes = Buffer.from(`${JSON.stringify(stale, null, 2)}\n`);
  chmodSync(fixture.requestPath, 0o600);
  writeFileSync(fixture.requestPath, staleBytes);
  chmodSync(fixture.requestPath, REQUEST_FILE_MODE);
  assert.throws(
    () =>
      appendPreparedRequestForTestPolicy({
        requestPath: fixture.requestPath,
        expectedRequestFileSha256: rawFileSha256(staleBytes),
        policy: fixture.policy,
        now: clock("2026-08-04T09:02:00Z", "2026-08-04T09:03:00Z"),
      }),
    /compare-and-swap precondition mismatch/,
  );
  const current = request({
    anchorCandidate: secondCandidate,
    precondition: currentPrecondition(fixture.root),
    preparedAt: "2026-08-04T09:01:00Z",
  });
  const currentBytes = Buffer.from(`${JSON.stringify(current, null, 2)}\n`);
  chmodSync(fixture.requestPath, 0o600);
  writeFileSync(fixture.requestPath, currentBytes);
  chmodSync(fixture.requestPath, REQUEST_FILE_MODE);
  appendPreparedRequestForTestPolicy({
    requestPath: fixture.requestPath,
    expectedRequestFileSha256: rawFileSha256(currentBytes),
    policy: fixture.policy,
    now: clock("2026-08-04T09:02:00Z", "2026-08-04T09:03:00Z"),
  });
  const records = readFileSync(join(fixture.root, LEDGER_FILE), "utf8")
    .trimEnd()
    .split("\n")
    .map((line) => JSON.parse(line));
  assert.equal(records.length, 2);
  assert.equal(records[1].sequence, 2);
  assert.equal(records[1].predecessorRecordSha256, records[0].recordSha256);
  assert.equal(
    records[1].repositoryAnchorLogPrefix.recordCount,
    records[0].repositoryAnchorLogPrefix.recordCount + 2,
  );
});

test("rejects a fully resealed ledger that changes immutable baseline inputs", () => {
  const fixture = makeFixture();
  appendFirst(fixture);
  const secondRequest = request({
    anchorCandidate: candidate({
      sequence: 3,
      predecessorRecordSha256: fixture.request.verification.recordSha256,
      createdAt: "2026-08-04T09:00:00Z",
      eventCount: 1,
    }),
    precondition: currentPrecondition(fixture.root),
    preparedAt: "2026-08-04T09:01:00Z",
  });
  const secondBytes = Buffer.from(
    `${JSON.stringify(secondRequest, null, 2)}\n`,
  );
  chmodSync(fixture.requestPath, 0o600);
  writeFileSync(fixture.requestPath, secondBytes);
  chmodSync(fixture.requestPath, REQUEST_FILE_MODE);
  appendPreparedRequestForTestPolicy({
    requestPath: fixture.requestPath,
    expectedRequestFileSha256: rawFileSha256(secondBytes),
    policy: fixture.policy,
    now: clock("2026-08-04T09:02:00Z", "2026-08-04T09:03:00Z"),
  });
  const records = readFileSync(join(fixture.root, LEDGER_FILE), "utf8")
    .trimEnd()
    .split("\n")
    .map((line) => JSON.parse(line));
  const driftedRecord = seal(
    RECORD_DOMAIN,
    {
      ...records[1],
      repositoryBaselineInputs: {
        ...records[1].repositoryBaselineInputs,
        processingRegister: {
          ...records[1].repositoryBaselineInputs.processingRegister,
          fileSha256: sha("a"),
        },
      },
    },
    "recordSha256",
  );
  const ledgerBytes = Buffer.from(
    `${JSON.stringify(records[0])}\n${JSON.stringify(driftedRecord)}\n`,
  );
  const head = JSON.parse(readFileSync(join(fixture.root, HEAD_FILE), "utf8"));
  const driftedHead = seal(
    HEAD_DOMAIN,
    {
      ...head,
      ledgerFileSha256: rawFileSha256(ledgerBytes),
      ledgerSizeBytes: ledgerBytes.length,
      latestRecordSha256: driftedRecord.recordSha256,
    },
    "headSha256",
  );
  assert.throws(
    () =>
      validateLedgerSnapshot({
        ledgerBytes,
        headBytes: Buffer.from(`${JSON.stringify(driftedHead, null, 2)}\n`),
      }),
    /changes immutable repository baseline inputs/,
  );
});

test("exclusive lock rejects a racing writer while the first append completes", () => {
  let fixture;
  let raceError = null;
  const faultInjector = (point) => {
    if (point !== "after_lock" || raceError) return;
    try {
      appendPreparedRequestForTestPolicy({
        requestPath: fixture.requestPath,
        expectedRequestFileSha256: fixture.requestFileSha256,
        policy: createTestPolicy({
          externalRoot: fixture.root,
          requestRoot: fixture.requestRoot,
        }),
        now: clock("2026-08-04T08:02:30Z", "2026-08-04T08:02:31Z"),
      });
    } catch (error) {
      raceError = error;
    }
  };
  fixture = makeFixture({ faultInjector });
  appendFirst(fixture);
  assert.match(
    raceError?.message ?? "",
    /exclusive append lock already exists/,
  );
  assert.equal(checkExternalLedgerForPolicy(fixture.policy).recordCount, 1);
});

test("a crash after ledger replacement preserves the lock and fails closed", () => {
  const fixture = makeFixture({
    faultInjector: (point) => {
      if (point === "after_ledger_replace") throw new Error("simulated crash");
    },
  });
  assert.throws(() => appendFirst(fixture), /simulated crash/);
  assert.equal(existsSync(join(fixture.root, LOCK_FILE)), true);
  assert.equal(existsSync(join(fixture.root, LEDGER_FILE)), true);
  assert.equal(existsSync(join(fixture.root, HEAD_FILE)), false);
  assert.throws(
    () => checkExternalLedgerForPolicy(fixture.policy),
    /append lock is present/,
  );
  unlinkSync(join(fixture.root, LOCK_FILE));
  const leftover = readdirSyncSorted(fixture.root).find((name) =>
    name.endsWith(".head.tmp"),
  );
  assert.ok(leftover);
  unlinkSync(join(fixture.root, leftover));
  assert.throws(
    () => checkExternalLedgerForPolicy(fixture.policy),
    /must either both exist or both be absent/,
  );
});

test("rejects symlink and hardlink substitution", () => {
  const symlinkFixture = makeFixture();
  appendFirst(symlinkFixture);
  const ledgerPath = join(symlinkFixture.root, LEDGER_FILE);
  const backingPath = join(
    dirnameOutside(symlinkFixture.root),
    "ledger-backing",
  );
  renameSync(ledgerPath, backingPath);
  symlinkSync(backingPath, ledgerPath);
  assert.throws(
    () => checkExternalLedgerForPolicy(symlinkFixture.policy),
    /symlink/,
  );

  const hardlinkFixture = makeFixture();
  appendFirst(hardlinkFixture);
  const hardlinkPath = join(
    dirnameOutside(hardlinkFixture.root),
    "ledger-hardlink",
  );
  linkSync(join(hardlinkFixture.root, LEDGER_FILE), hardlinkPath);
  assert.throws(
    () => checkExternalLedgerForPolicy(hardlinkFixture.policy),
    /multiple hard links/,
  );
});

function dirnameOutside(root) {
  return mkdtempSync(
    join(realpathSync(tmpdir()), `${root.split("/").at(-1)}-outside-`),
  );
}

test("rejects a self-resealed head that disagrees with the full ledger", () => {
  const fixture = makeFixture();
  appendFirst(fixture);
  const headPath = join(fixture.root, HEAD_FILE);
  const head = JSON.parse(readFileSync(headPath, "utf8"));
  const drifted = seal(
    HEAD_DOMAIN,
    { ...head, latestVerificationRecordSha256: sha("f") },
    "headSha256",
  );
  chmodSync(headPath, 0o600);
  writeFileSync(headPath, `${JSON.stringify(drifted, null, 2)}\n`);
  chmodSync(headPath, 0o444);
  assert.throws(
    () => checkExternalLedgerForPolicy(fixture.policy),
    /head does not exactly bind/,
  );
});

test("rejects a prepared request reached through a symlink", () => {
  const fixture = makeFixture();
  const linked = `${fixture.requestPath}.link`;
  symlinkSync(fixture.requestPath, linked);
  assert.throws(
    () =>
      appendPreparedRequestForTestPolicy({
        requestPath: linked,
        expectedRequestFileSha256: fixture.requestFileSha256,
        policy: fixture.policy,
        now: clock("2026-08-04T08:02:00Z", "2026-08-04T08:03:00Z"),
      }),
    /symlink/,
  );
  assert.deepEqual(readdirSyncSorted(fixture.root), []);
});

test("install manifest binds the exact reviewable writer bytes", () => {
  const packageRoot = fileURLToPath(new URL(".", import.meta.url));
  const writerBytes = readFileSync(
    join(packageRoot, "corpus-anchor-root-writer.mjs"),
  );
  const manifestBytes = readFileSync(
    join(packageRoot, "install-manifest.v1.json"),
  );
  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  assert.equal(
    manifest.writerArtifact.sha256,
    `sha256:${createHash("sha256").update(writerBytes).digest("hex")}`,
  );
  assert.equal(manifest.writerArtifact.sizeBytes, writerBytes.length);
  assert.equal(
    manifest.writerArtifact.installPath,
    "/usr/local/libexec/food-systems-corpus-anchor-writer/corpus-anchor-root-writer.mjs",
  );
  assert.equal(
    manifest.externalLedger.rootPath,
    "/private/var/db/food-systems-corpus-anchor",
  );
  assert.equal(
    manifest.requestIntake.rootPath,
    "/private/var/db/food-systems-corpus-anchor-requests",
  );
  assert.equal(manifest.requestIntake.rootMode, "0700");
  assert.equal(manifest.requestIntake.fileMode, "0400");
  assert.equal(manifest.requestIntake.expectedFileSha256Required, true);
  assert.equal(
    manifest.safetyBoundary.callerSelectedExternalRootAllowed,
    false,
  );
  assert.equal(manifest.safetyBoundary.unhashedRequestAllowed, false);
  assert.equal(
    manifestBytes.toString("utf8"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  const sums = readFileSync(join(packageRoot, "SHA256SUMS"), "utf8")
    .trimEnd()
    .split("\n");
  assert.deepEqual(sums, [
    `${manifest.writerArtifact.sha256.slice("sha256:".length)}  corpus-anchor-root-writer.mjs`,
    `${createHash("sha256").update(manifestBytes).digest("hex")}  install-manifest.v1.json`,
  ]);
});
