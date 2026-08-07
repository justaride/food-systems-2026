import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  linkSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import {
  appendRequestToCorpusExternalAnchorSnapshot,
  createCorpusExternalAnchorVerifier,
  prepareCorpusExternalAnchorAppendRequest,
  type CorpusExternalAnchorLedgerSnapshot,
} from "../../src/lib/knowledge/corpus-event-history-external-ledger";
import {
  CORPUS_REPOSITORY_BUNDLE_TRANSACTION_DATA_PATH,
  CORPUS_REPOSITORY_BUNDLE_TRANSACTION_JOURNAL_PATH,
  CorpusRepositoryBundleSimulatedCrash,
  corpusRepositoryBundleRecoveryAcknowledgement,
  readCorpusRepositoryBundleTransactionJournal,
} from "../../src/lib/knowledge/corpus-repository-bundle-transaction";
import {
  CORPUS_STATE_EVENT_SCHEMA_VERSION,
  sealCorpusProcessingStateEvent,
  validateCorpusProcessingStateEvent,
} from "../../src/lib/knowledge/corpus-processing-current-state";
import {
  CORPUS_CURRENT_STATE_PATHS,
  buildCorpusCurrentStateArtifacts,
  buildCorpusPendingEventTransitionArtifacts,
} from "../../scripts/knowledge/generate-corpus-processing-current-state";
import {
  readAndValidateRepositoryAnchorContext,
  readCorpusExternalAnchorPreparedRequestFile,
} from "../../scripts/knowledge/manage-corpus-external-anchor-ledger";
import {
  CORPUS_TRUSTED_VERIFICATION_IMPLEMENTATION_PATHS,
  applyCorpusTrustedVerificationAppendPlan,
  buildCorpusTrustedVerificationAppendPlan,
  corpusTrustedVerificationApplyAcknowledgement,
} from "../../scripts/knowledge/append-corpus-trusted-verification";
import {
  CORPUS_PENDING_EVENT_IMPLEMENTATION_PATHS,
  applyCorpusPendingEventAppendPlan,
  assertCorpusPendingEventJournalMatchesPlan,
  buildCorpusPendingEventAppendPlan,
  corpusPendingEventApplyAcknowledgement,
  recoverCorpusPendingEventAppend,
  validateCorpusPendingEventAppendPlan,
} from "../../scripts/knowledge/append-corpus-pending-event";

const sourceRoot = process.cwd();
const oldNodeEnv = process.env.NODE_ENV;
Object.assign(process.env, { NODE_ENV: "test" });

const INPUT_MANIFEST_PATH =
  "knowledge/corpus/source-analysis-input-manifests/manifests/136b85c19ed2d652dcafd854c29898b97635dfe9ff2a0f734a6f7345cef4b761.source-analysis-input-manifest.v1.json";
const EXTRACTION_RECEIPT_PATH =
  "knowledge/corpus/pdf-page-extraction/receipts/136b85c19ed2d652dcafd854c29898b97635dfe9ff2a0f734a6f7345cef4b761.receipt.v1.json";
const TARGET_IDENTITY = "document:cmppajyue000rnjvmxrad483t";

type Fixture = {
  base: string;
  repositoryRoot: string;
  eventPath: string;
  snapshot: CorpusExternalAnchorLedgerSnapshot;
  identityCount: number;
};

function copyPath(root: string, path: string): void {
  const target = join(root, path);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(join(sourceRoot, path), target);
}

function manifestPaths(path: string): string[] {
  const manifest = JSON.parse(readFileSync(join(sourceRoot, path), "utf8")) as {
    inputs: Array<{ path: string }>;
    outputs: Array<{ path: string }>;
  };
  return [...manifest.inputs, ...manifest.outputs].map((item) => item.path);
}

function fixturePaths(): string[] {
  const corpusManifest =
    "knowledge/corpus/corpus-processing-generation-manifest.v1.json";
  const currentManifest =
    "knowledge/corpus/corpus-processing-current-state-generation-manifest.v1.json";
  return [
    corpusManifest,
    currentManifest,
    ...manifestPaths(corpusManifest),
    ...manifestPaths(currentManifest),
    ...Object.values(CORPUS_CURRENT_STATE_PATHS),
    ...CORPUS_TRUSTED_VERIFICATION_IMPLEMENTATION_PATHS,
    ...CORPUS_PENDING_EVENT_IMPLEMENTATION_PATHS,
    INPUT_MANIFEST_PATH,
    EXTRACTION_RECEIPT_PATH,
  ];
}

function after(value: string, milliseconds: number): string {
  return new Date(Date.parse(value) + milliseconds).toISOString();
}

function fileSha256(bytes: Buffer): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function transactionClean(root: string): void {
  assert.equal(
    existsSync(join(root, CORPUS_REPOSITORY_BUNDLE_TRANSACTION_JOURNAL_PATH)),
    false,
  );
  assert.equal(
    existsSync(join(root, CORPUS_REPOSITORY_BUNDLE_TRANSACTION_DATA_PATH)),
    false,
  );
}

function stateBytes(root: string) {
  return Object.fromEntries(
    Object.values(CORPUS_CURRENT_STATE_PATHS).map((path) => [
      path,
      readFileSync(join(root, path)),
    ]),
  ) as Record<string, Buffer>;
}

function assertBytes(
  root: string,
  expected: Record<string, Buffer>,
  paths: string[],
): void {
  for (const path of paths) {
    assert.deepEqual(readFileSync(join(root, path)), expected[path]);
  }
}

async function trustGenesis(input: {
  repositoryRoot: string;
  base: string;
  identityCount: number;
}): Promise<CorpusExternalAnchorLedgerSnapshot> {
  const context = readAndValidateRepositoryAnchorContext({
    repositoryRoot: input.repositoryRoot,
    externalSnapshot: null,
    allowPendingCandidate: true,
  });
  const verifiedAt = after(context.latestCandidate.createdAt, 1_000);
  const request = prepareCorpusExternalAnchorAppendRequest({
    repositoryAnchorLogPath: CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
    repositoryAnchorLogBytes: context.anchorLogBytes,
    repositoryBaselineInputs: context.repositoryBaselineInputs,
    candidate: context.latestCandidate,
    externalSnapshot: null,
    verifiedAt,
  });
  const snapshot = appendRequestToCorpusExternalAnchorSnapshot({
    request,
    previousSnapshot: null,
    appendedAt: after(verifiedAt, 1_000),
  });
  const requestPath = join(input.base, "genesis-request.json");
  writeFileSync(requestPath, `${JSON.stringify(request, null, 2)}\n`, "utf8");
  chmodSync(requestPath, 0o600);
  const plan = buildCorpusTrustedVerificationAppendPlan({
    repositoryRoot: input.repositoryRoot,
    requestFile: readCorpusExternalAnchorPreparedRequestFile(requestPath),
    externalSnapshot: snapshot,
    createdAt: after(verifiedAt, 2_000),
    testOnlyExpectedIdentityCount: input.identityCount,
  });
  await applyCorpusTrustedVerificationAppendPlan({
    repositoryRoot: input.repositoryRoot,
    plan,
    requestPath,
    acknowledgement: corpusTrustedVerificationApplyAcknowledgement(
      plan.planSha256,
    ),
    loadExternalSnapshot: () => snapshot,
    testOnlyExpectedIdentityCount: input.identityCount,
  });
  return snapshot;
}

function writeTechnicalEvent(root: string, eventPath: string): string {
  const state = readFileSync(
    join(root, CORPUS_CURRENT_STATE_PATHS.currentState),
    "utf8",
  )
    .trimEnd()
    .split("\n")
    .map((line) => JSON.parse(line) as Record<string, unknown>)
    .find((row) => row.identityKey === TARGET_IDENTITY) as {
    recordId: string;
    identityKey: string;
    baselineBinding: { baselineRowSha256: string };
    stateVersion: number;
    previousIdentityEventSha256: string | null;
    stateSha256: string;
    lifecycleSha256: string;
  };
  assert.ok(state);
  const manifestBytes = readFileSync(join(root, INPUT_MANIFEST_PATH));
  const manifest = JSON.parse(manifestBytes.toString("utf8")) as {
    pipelineVersion: string;
    manifestSha256: string;
    normalizedInput: { sha256: string };
    totals: { normalizedCharacterCount: number };
  };
  const receiptBytes = readFileSync(join(root, EXTRACTION_RECEIPT_PATH));
  const receipt = JSON.parse(receiptBytes.toString("utf8")) as {
    pipelineVersion: string;
    receiptSha256: string;
    processingUnit: { rawPdfSha256: string };
  };
  const occurredAt = "2026-08-03T00:00:00.000Z";
  const event = validateCorpusProcessingStateEvent(
    sealCorpusProcessingStateEvent({
      schemaVersion: CORPUS_STATE_EVENT_SCHEMA_VERSION,
      eventType: "technical_text_extracted" as const,
      eventId: "event.pending.technical.fixture",
      globalSequence: 1,
      previousGlobalEventSha256: null,
      identitySequence: state.stateVersion + 1,
      previousIdentityEventSha256: state.previousIdentityEventSha256,
      target: {
        recordId: state.recordId,
        identityKey: state.identityKey,
        baselineRowSha256: state.baselineBinding.baselineRowSha256,
        preStateVersion: state.stateVersion,
        preStateSha256: state.stateSha256,
        preStateLifecycleSha256: state.lifecycleSha256,
      },
      occurredAt,
      payload: {
        qualificationReceiptRef: {
          artifactType: "pdf_technical_qualification" as const,
          artifactId: `artifact.pdf_extraction.${receipt.processingUnit.rawPdfSha256}`,
          artifactVersion: receipt.pipelineVersion,
          path: EXTRACTION_RECEIPT_PATH,
          fileSha256: fileSha256(receiptBytes),
          artifactSha256: `sha256:${receipt.receiptSha256}`,
        },
        inputManifestRef: {
          artifactType: "source_analysis_input_manifest" as const,
          artifactId: `artifact.source_analysis_input.${manifest.manifestSha256}`,
          artifactVersion: manifest.pipelineVersion,
          path: INPUT_MANIFEST_PATH,
          fileSha256: fileSha256(manifestBytes),
          artifactSha256: `sha256:${manifest.manifestSha256}`,
        },
        textAvailability: {
          state: "full_text" as const,
          textSha256: `sha256:${manifest.normalizedInput.sha256}`,
          characterCount: manifest.totals.normalizedCharacterCount,
          extractionMethod: "born_digital" as const,
          observedAt: occurredAt,
        },
      },
    }),
  );
  writeFileSync(eventPath, `${JSON.stringify(event)}\n`, "utf8");
  chmodSync(eventPath, 0o600);
  return "2026-08-03T00:00:01.000Z";
}

async function makeFixture(): Promise<Fixture> {
  const base = mkdtempSync(
    join(realpathSync(tmpdir()), "corpus-pending-event-"),
  );
  const repositoryRoot = join(base, "repository");
  mkdirSync(repositoryRoot);
  for (const path of new Set(fixturePaths())) copyPath(repositoryRoot, path);
  execFileSync("git", ["-C", repositoryRoot, "init", "--quiet"]);
  execFileSync("git", ["-C", repositoryRoot, "add", "--all"]);
  const baseline = JSON.parse(
    readFileSync(
      join(
        repositoryRoot,
        "knowledge/corpus/corpus-processing-baseline.v1.json",
      ),
      "utf8",
    ),
  ) as { expectedActiveRows: number };
  const snapshot = await trustGenesis({
    repositoryRoot,
    base,
    identityCount: baseline.expectedActiveRows,
  });
  const eventPath = join(base, "pending-event.jsonl");
  writeTechnicalEvent(repositoryRoot, eventPath);
  return {
    base,
    repositoryRoot,
    eventPath,
    snapshot,
    identityCount: baseline.expectedActiveRows,
  };
}

function buildPlan(fixture: Fixture) {
  return buildCorpusPendingEventAppendPlan({
    repositoryRoot: fixture.repositoryRoot,
    eventPath: fixture.eventPath,
    createdAt: "2026-08-03T00:00:01.000Z",
    loadExternalSnapshot: () => fixture.snapshot,
    testOnlyExpectedIdentityCount: fixture.identityCount,
  });
}

test("plans and atomically installs only one pending event checkpoint", async () => {
  const fixture = await makeFixture();
  try {
    assert.throws(
      () =>
        buildCorpusPendingEventAppendPlan({
          repositoryRoot: fixture.repositoryRoot,
          eventPath: fixture.eventPath,
          createdAt: "2026-08-03T00:00:01.000Z",
          loadExternalSnapshot: () => fixture.snapshot,
        }),
      /external snapshot injection is test-only/,
    );
    const plan = buildPlan(fixture);
    const tamperedPlan = structuredClone(plan);
    tamperedPlan.compareAndSwapInputs[0]!.sha256 = `sha256:${"f".repeat(64)}`;
    assert.throws(
      () => validateCorpusPendingEventAppendPlan(tamperedPlan),
      /plan self-hash mismatch/,
    );
    chmodSync(fixture.eventPath, 0o644);
    assert.throws(() => buildPlan(fixture), /0400\/0600/);
    chmodSync(fixture.eventPath, 0o600);
    const hardlinkPath = join(fixture.base, "pending-event-hardlink.jsonl");
    linkSync(fixture.eventPath, hardlinkPath);
    assert.throws(() => buildPlan(fixture), /one-link/);
    unlinkSync(hardlinkPath);
    const before = stateBytes(fixture.repositoryRoot);
    await assert.rejects(
      applyCorpusPendingEventAppendPlan({
        repositoryRoot: fixture.repositoryRoot,
        plan,
        eventPath: fixture.eventPath,
        acknowledgement: "wrong",
        loadExternalSnapshot: () => fixture.snapshot,
        testOnlyExpectedIdentityCount: fixture.identityCount,
      }),
      /strong apply acknowledgement/,
    );
    const result = await applyCorpusPendingEventAppendPlan({
      repositoryRoot: fixture.repositoryRoot,
      plan,
      eventPath: fixture.eventPath,
      acknowledgement: corpusPendingEventApplyAcknowledgement(plan.planSha256),
      loadExternalSnapshot: () => fixture.snapshot,
      testOnlyExpectedIdentityCount: fixture.identityCount,
    });
    assert.equal(result, "committed");
    assertBytes(fixture.repositoryRoot, before, [
      CORPUS_CURRENT_STATE_PATHS.currentState,
      CORPUS_CURRENT_STATE_PATHS.summary,
      CORPUS_CURRENT_STATE_PATHS.conflictQueue,
      CORPUS_CURRENT_STATE_PATHS.generationManifest,
    ]);
    for (const path of [
      CORPUS_CURRENT_STATE_PATHS.events,
      CORPUS_CURRENT_STATE_PATHS.eventManifest,
      CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
    ]) {
      assert.notDeepEqual(
        readFileSync(join(fixture.repositoryRoot, path)),
        before[path],
      );
    }
    const context = readAndValidateRepositoryAnchorContext({
      repositoryRoot: fixture.repositoryRoot,
      externalSnapshot: fixture.snapshot,
      allowPendingCandidate: true,
    });
    assert.equal(context.latestVerification, null);
    assert.equal(context.latestCandidate.eventCount, 1);
    const previousPair = context.pairs.at(-1)!;
    const transition = buildCorpusPendingEventTransitionArtifacts(
      fixture.repositoryRoot,
      {
        eventLogBytes: readFileSync(
          join(fixture.repositoryRoot, CORPUS_CURRENT_STATE_PATHS.events),
        ),
        eventManifestBytes: readFileSync(
          join(
            fixture.repositoryRoot,
            CORPUS_CURRENT_STATE_PATHS.eventManifest,
          ),
        ),
        eventHistoryAnchorBytes: readFileSync(
          join(
            fixture.repositoryRoot,
            CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
          ),
        ),
        verifyTrustedEventHistoryAnchor: createCorpusExternalAnchorVerifier({
          snapshot: fixture.snapshot,
          latestCandidate: previousPair.candidate,
          latestVerification: previousPair.verification,
          latestRepositoryBaselineInputs: context.repositoryBaselineInputs,
        }),
      },
    );
    assert.equal(transition.previousTrusted.events.length, 0);
    assert.equal(transition.pending.events.length, 1);
    for (const path of [
      CORPUS_CURRENT_STATE_PATHS.currentState,
      CORPUS_CURRENT_STATE_PATHS.summary,
      CORPUS_CURRENT_STATE_PATHS.conflictQueue,
      CORPUS_CURRENT_STATE_PATHS.generationManifest,
    ]) {
      const generated = transition.previousTrusted.bundle.find(
        (artifact) => artifact.path === path,
      );
      assert.ok(generated);
      assert.deepEqual(Buffer.from(generated.content, "utf8"), before[path]);
    }
    assert.throws(
      () =>
        buildCorpusCurrentStateArtifacts(fixture.repositoryRoot, {
          verifyTrustedEventHistoryAnchor: () => true,
        }),
      /current non-empty event checkpoint has no trusted verification/,
    );
    assert.throws(
      () => buildPlan(fixture),
      /non-empty event checkpoint has no trusted verification/,
    );
    transactionClean(fixture.repositoryRoot);
  } finally {
    rmSync(fixture.base, { recursive: true, force: true });
  }
});

test("a final-marker crash completes only through authenticated recovery", async () => {
  const fixture = await makeFixture();
  try {
    const plan = buildPlan(fixture);
    await assert.rejects(
      applyCorpusPendingEventAppendPlan({
        repositoryRoot: fixture.repositoryRoot,
        plan,
        eventPath: fixture.eventPath,
        acknowledgement: corpusPendingEventApplyAcknowledgement(
          plan.planSha256,
        ),
        loadExternalSnapshot: () => fixture.snapshot,
        testOnlyExpectedIdentityCount: fixture.identityCount,
        testFaultInjector: (point) => {
          if (
            point ===
            `target_renamed:${CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors}`
          ) {
            throw new CorpusRepositoryBundleSimulatedCrash("fixture crash");
          }
        },
      }),
      CorpusRepositoryBundleSimulatedCrash,
    );
    const journal = readCorpusRepositoryBundleTransactionJournal(
      fixture.repositoryRoot,
    );
    assert.doesNotThrow(() =>
      assertCorpusPendingEventJournalMatchesPlan({ journal, plan }),
    );
    const tamperedJournal = structuredClone(journal);
    tamperedJournal.entries[0]!.after.sizeBytes += 1;
    assert.throws(
      () =>
        assertCorpusPendingEventJournalMatchesPlan({
          journal: tamperedJournal,
          plan,
        }),
      /self-hash mismatch/,
    );
    const result = recoverCorpusPendingEventAppend({
      repositoryRoot: fixture.repositoryRoot,
      plan,
      eventPath: fixture.eventPath,
      acknowledgement: corpusRepositoryBundleRecoveryAcknowledgement(
        journal.journalSha256,
      ),
      loadExternalSnapshot: () => fixture.snapshot,
      testOnlyExpectedIdentityCount: fixture.identityCount,
    });
    assert.equal(result, "completed");
    transactionClean(fixture.repositoryRoot);
  } finally {
    rmSync(fixture.base, { recursive: true, force: true });
  }
});

test("evidence drift after durable staging rolls the checkpoint back", async () => {
  const fixture = await makeFixture();
  try {
    const plan = buildPlan(fixture);
    const before = stateBytes(fixture.repositoryRoot);
    await assert.rejects(
      applyCorpusPendingEventAppendPlan({
        repositoryRoot: fixture.repositoryRoot,
        plan,
        eventPath: fixture.eventPath,
        acknowledgement: corpusPendingEventApplyAcknowledgement(
          plan.planSha256,
        ),
        loadExternalSnapshot: () => fixture.snapshot,
        testOnlyExpectedIdentityCount: fixture.identityCount,
        testFaultInjector: (point) => {
          if (point === "journal_prepared_durable") {
            writeFileSync(
              join(fixture.repositoryRoot, INPUT_MANIFEST_PATH),
              Buffer.concat([
                readFileSync(join(fixture.repositoryRoot, INPUT_MANIFEST_PATH)),
                Buffer.from("\n", "utf8"),
              ]),
            );
          }
        },
      }),
      /artifact|drift|hash|bytes|reference/i,
    );
    assertBytes(fixture.repositoryRoot, before, [
      CORPUS_CURRENT_STATE_PATHS.events,
      CORPUS_CURRENT_STATE_PATHS.eventManifest,
      CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
    ]);
    transactionClean(fixture.repositoryRoot);
  } finally {
    rmSync(fixture.base, { recursive: true, force: true });
  }
});

test.after(() => {
  if (oldNodeEnv === undefined) Reflect.deleteProperty(process.env, "NODE_ENV");
  else Object.assign(process.env, { NODE_ENV: oldNodeEnv });
});
