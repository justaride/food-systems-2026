import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  appendFileSync,
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import {
  appendRequestToCorpusExternalAnchorSnapshot,
  prepareCorpusExternalAnchorAppendRequest,
  type CorpusExternalAnchorAppendRequest,
  type CorpusExternalAnchorLedgerSnapshot,
} from "../../src/lib/knowledge/corpus-event-history-external-ledger";
import {
  CORPUS_REPOSITORY_BUNDLE_TRANSACTION_DATA_PATH,
  CORPUS_REPOSITORY_BUNDLE_TRANSACTION_JOURNAL_HASH_DOMAIN,
  CORPUS_REPOSITORY_BUNDLE_TRANSACTION_JOURNAL_PATH,
  CorpusRepositoryBundleSimulatedCrash,
  corpusRepositoryBundleRecoveryAcknowledgement,
  readCorpusRepositoryBundleTransactionJournal,
  type CorpusRepositoryBundleTransactionJournal,
} from "../../src/lib/knowledge/corpus-repository-bundle-transaction";
import {
  canonicalCorpusJson,
  type CorpusCanonicalJsonValue,
} from "../../src/lib/knowledge/corpus-processing-lifecycle";
import { CORPUS_CURRENT_STATE_PATHS } from "../../scripts/knowledge/generate-corpus-processing-current-state";
import {
  readAndValidateRepositoryAnchorContext,
  readCorpusExternalAnchorPreparedRequestFile,
} from "../../scripts/knowledge/manage-corpus-external-anchor-ledger";
import {
  CORPUS_TRUSTED_VERIFICATION_IMPLEMENTATION_PATHS,
  CORPUS_TRUSTED_VERIFICATION_REQUIRED_IDENTITY_COUNT,
  applyCorpusTrustedVerificationAppendPlan,
  assertCorpusTrustedVerificationAppendEligibility,
  assertCorpusTrustedVerificationJournalMatchesPlan,
  buildCorpusTrustedVerificationAppendPlan,
  corpusTrustedVerificationApplyAcknowledgement,
  recoverCorpusTrustedVerificationAppend,
  serializeCorpusTrustedVerificationAppendPlan,
  validateCorpusTrustedVerificationAppendPlan,
  type CorpusTrustedVerificationAppendPlan,
} from "../../scripts/knowledge/append-corpus-trusted-verification";

const sourceRoot = process.cwd();
const oldNodeEnv = process.env.NODE_ENV;
Object.assign(process.env, { NODE_ENV: "test" });

type Fixture = {
  base: string;
  repositoryRoot: string;
  requestPath: string;
  request: CorpusExternalAnchorAppendRequest;
  snapshot: CorpusExternalAnchorLedgerSnapshot;
  identityCount: number;
  createdAt: string;
};

function copyPath(source: string, root: string, path: string): void {
  const target = join(root, path);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(join(source, path), target);
}

function manifestPaths(path: string): string[] {
  const manifest = JSON.parse(readFileSync(join(sourceRoot, path), "utf8")) as {
    inputs: Array<{ path: string }>;
    outputs: Array<{ path: string }>;
  };
  return [...manifest.inputs, ...manifest.outputs].map((value) => value.path);
}

function repositoryFixturePaths(): string[] {
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
  ];
}

function millisecondsAfter(value: string, milliseconds: number): string {
  return new Date(Date.parse(value) + milliseconds).toISOString();
}

function writeRequest(
  path: string,
  request: CorpusExternalAnchorAppendRequest,
): void {
  writeFileSync(path, `${JSON.stringify(request, null, 2)}\n`, "utf8");
  chmodSync(path, 0o600);
}

function createRequestAndSnapshot(input: {
  repositoryRoot: string;
  requestPath: string;
  verifiedOffset?: number;
}): {
  request: CorpusExternalAnchorAppendRequest;
  snapshot: CorpusExternalAnchorLedgerSnapshot;
  createdAt: string;
} {
  const context = readAndValidateRepositoryAnchorContext({
    repositoryRoot: input.repositoryRoot,
    externalSnapshot: null,
    allowPendingCandidate: true,
  });
  const verifiedAt = millisecondsAfter(
    context.latestCandidate.createdAt,
    input.verifiedOffset ?? 1_000,
  );
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
    appendedAt: millisecondsAfter(verifiedAt, 1_000),
  });
  writeRequest(input.requestPath, request);
  return {
    request,
    snapshot,
    createdAt: millisecondsAfter(verifiedAt, 2_000),
  };
}

function makeFixture(): Fixture {
  const base = mkdtempSync(
    join(realpathSync(tmpdir()), "corpus-trusted-verification-"),
  );
  const repositoryRoot = join(base, "repository");
  mkdirSync(repositoryRoot);
  for (const path of new Set(repositoryFixturePaths())) {
    copyPath(sourceRoot, repositoryRoot, path);
  }
  const requestPath = join(base, "prepared-request.json");
  const authority = createRequestAndSnapshot({
    repositoryRoot,
    requestPath,
  });
  const baseline = JSON.parse(
    readFileSync(
      join(
        repositoryRoot,
        "knowledge/corpus/corpus-processing-baseline.v1.json",
      ),
      "utf8",
    ),
  ) as { expectedActiveRows: number };
  return {
    base,
    repositoryRoot,
    requestPath,
    request: authority.request,
    snapshot: authority.snapshot,
    identityCount: baseline.expectedActiveRows,
    createdAt: authority.createdAt,
  };
}

function buildFixturePlan(
  fixture: Fixture,
): CorpusTrustedVerificationAppendPlan {
  return buildCorpusTrustedVerificationAppendPlan({
    repositoryRoot: fixture.repositoryRoot,
    requestFile: readCorpusExternalAnchorPreparedRequestFile(
      fixture.requestPath,
    ),
    externalSnapshot: fixture.snapshot,
    createdAt: fixture.createdAt,
    testOnlyExpectedIdentityCount: fixture.identityCount,
  });
}

function writePlan(
  fixture: Fixture,
  plan: CorpusTrustedVerificationAppendPlan,
) {
  const path = join(fixture.base, "append-plan.json");
  writeFileSync(path, serializeCorpusTrustedVerificationAppendPlan(plan));
  chmodSync(path, 0o600);
  return path;
}

function transactionPath(root: string, path: string): string {
  return join(root, path);
}

function assertTransactionClean(root: string): void {
  assert.equal(
    existsSync(
      transactionPath(root, CORPUS_REPOSITORY_BUNDLE_TRANSACTION_JOURNAL_PATH),
    ),
    false,
  );
  assert.equal(
    existsSync(
      transactionPath(root, CORPUS_REPOSITORY_BUNDLE_TRANSACTION_DATA_PATH),
    ),
    false,
  );
}

function resealJournal(
  journal: CorpusRepositoryBundleTransactionJournal,
  mutate: (
    body: Omit<CorpusRepositoryBundleTransactionJournal, "journalSha256">,
  ) => void,
): CorpusRepositoryBundleTransactionJournal {
  const { journalSha256: _journalSha256, ...rawBody } =
    structuredClone(journal);
  mutate(rawBody);
  return {
    ...rawBody,
    journalSha256: `sha256:${createHash("sha256")
      .update(CORPUS_REPOSITORY_BUNDLE_TRANSACTION_JOURNAL_HASH_DOMAIN)
      .update(canonicalCorpusJson(rawBody as CorpusCanonicalJsonValue))
      .digest("hex")}`,
  };
}

function outputBytes(root: string): Record<string, Buffer> {
  return Object.fromEntries(
    [
      CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
      CORPUS_CURRENT_STATE_PATHS.summary,
      CORPUS_CURRENT_STATE_PATHS.generationManifest,
      CORPUS_CURRENT_STATE_PATHS.currentState,
      CORPUS_CURRENT_STATE_PATHS.conflictQueue,
    ].map((path) => [path, readFileSync(join(root, path))]),
  );
}

function assertExactBytes(
  root: string,
  expected: Record<string, Buffer>,
  paths = Object.keys(expected),
): void {
  for (const path of paths) {
    assert.deepEqual(readFileSync(join(root, path)), expected[path]);
  }
}

test("production policy rejects the inherited 1,555 genesis and the test policy seals a complete plan", () => {
  const fixture = makeFixture();
  try {
    assert.equal(fixture.identityCount, 1555);
    assert.notEqual(
      fixture.identityCount,
      CORPUS_TRUSTED_VERIFICATION_REQUIRED_IDENTITY_COUNT,
    );
    assert.throws(
      () =>
        buildCorpusTrustedVerificationAppendPlan({
          repositoryRoot: fixture.repositoryRoot,
          requestFile: readCorpusExternalAnchorPreparedRequestFile(
            fixture.requestPath,
          ),
          externalSnapshot: fixture.snapshot,
          createdAt: fixture.createdAt,
        }),
      /external snapshot injection is test-only/,
    );
    assert.throws(
      () =>
        assertCorpusTrustedVerificationAppendEligibility({
          identityCount: 1555,
          eventCount: 0,
          anchorRecordCount: 1,
          trustedPairCount: 0,
          candidateSequence: 1,
          candidatePredecessorRecordSha256: null,
        }),
      /required 1565/,
    );
    const requestFile = readCorpusExternalAnchorPreparedRequestFile(
      fixture.requestPath,
    );
    const plan = buildFixturePlan(fixture);
    assert.equal(plan.eligibility.policy, "test_only_fixture");
    assert.equal(plan.orderedOutputs.length, 3);
    assert.equal(
      plan.orderedOutputs.at(-1)!.path,
      CORPUS_CURRENT_STATE_PATHS.generationManifest,
    );
    assert.equal(plan.requestFile.requestSha256, fixture.request.requestSha256);
    assert.equal(plan.requestFile.fileSha256, requestFile.fileSha256);
    assert.equal(plan.requestFile.sizeBytes, requestFile.sizeBytes);
    assert.equal(plan.repositoryBefore.anchorRecordCount, 1);
    assert.equal(plan.proposedAnchor.anchorRecordCount, 2);
    assert.equal(plan.safetyBoundary.coveragePromotionAllowed, false);
    assert.doesNotThrow(() =>
      validateCorpusTrustedVerificationAppendPlan(plan),
    );

    const tampered = structuredClone(plan);
    tampered.orderedOutputs[0]!.sha256 = `sha256:${"f".repeat(64)}`;
    assert.throws(
      () => validateCorpusTrustedVerificationAppendPlan(tampered),
      /self-hash mismatch/,
    );
  } finally {
    rmSync(fixture.base, { recursive: true, force: true });
  }
});

test("strong acknowledgement commits three outputs while state rows and conflicts remain byte-exact", async () => {
  const fixture = makeFixture();
  try {
    const plan = buildFixturePlan(fixture);
    const before = outputBytes(fixture.repositoryRoot);
    await assert.rejects(
      applyCorpusTrustedVerificationAppendPlan({
        repositoryRoot: fixture.repositoryRoot,
        plan,
        requestPath: fixture.requestPath,
        acknowledgement: "wrong",
        loadExternalSnapshot: () => fixture.snapshot,
        testOnlyExpectedIdentityCount: fixture.identityCount,
      }),
      /strong apply acknowledgement/,
    );
    assertExactBytes(fixture.repositoryRoot, before);

    const result = await applyCorpusTrustedVerificationAppendPlan({
      repositoryRoot: fixture.repositoryRoot,
      plan,
      requestPath: fixture.requestPath,
      acknowledgement: corpusTrustedVerificationApplyAcknowledgement(
        plan.planSha256,
      ),
      loadExternalSnapshot: () => fixture.snapshot,
      testOnlyExpectedIdentityCount: fixture.identityCount,
    });
    assert.equal(result, "committed");
    assert.notDeepEqual(
      readFileSync(
        join(
          fixture.repositoryRoot,
          CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
        ),
      ),
      before[CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors],
    );
    assertExactBytes(fixture.repositoryRoot, before, [
      CORPUS_CURRENT_STATE_PATHS.currentState,
      CORPUS_CURRENT_STATE_PATHS.conflictQueue,
    ]);
    const context = readAndValidateRepositoryAnchorContext({
      repositoryRoot: fixture.repositoryRoot,
      externalSnapshot: fixture.snapshot,
      allowPendingCandidate: false,
    });
    assert.equal(context.records.length, 2);
    assert.equal(context.pairs.length, 1);
    assertTransactionClean(fixture.repositoryRoot);
  } finally {
    rmSync(fixture.base, { recursive: true, force: true });
  }
});

test("CAS drift after durable staging rolls every planned output back", async () => {
  const fixture = makeFixture();
  try {
    const plan = buildFixturePlan(fixture);
    const before = outputBytes(fixture.repositoryRoot);
    await assert.rejects(
      applyCorpusTrustedVerificationAppendPlan({
        repositoryRoot: fixture.repositoryRoot,
        plan,
        requestPath: fixture.requestPath,
        acknowledgement: corpusTrustedVerificationApplyAcknowledgement(
          plan.planSha256,
        ),
        loadExternalSnapshot: () => fixture.snapshot,
        testOnlyExpectedIdentityCount: fixture.identityCount,
        testFaultInjector: (point) => {
          if (point === "journal_prepared_durable") {
            appendFileSync(
              join(
                fixture.repositoryRoot,
                CORPUS_CURRENT_STATE_PATHS.currentState,
              ),
              "drift\n",
            );
          }
        },
      }),
      /current-state rows and conflict queue byte-exact|CAS input drifted/,
    );
    assertExactBytes(fixture.repositoryRoot, before, [
      CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
      CORPUS_CURRENT_STATE_PATHS.summary,
      CORPUS_CURRENT_STATE_PATHS.generationManifest,
    ]);
    assertTransactionClean(fixture.repositoryRoot);
  } finally {
    rmSync(fixture.base, { recursive: true, force: true });
  }
});

test("a final-marker crash is authenticated against the plan and completed by real-verifier recovery", async () => {
  const fixture = makeFixture();
  try {
    const plan = buildFixturePlan(fixture);
    writePlan(fixture, plan);
    await assert.rejects(
      applyCorpusTrustedVerificationAppendPlan({
        repositoryRoot: fixture.repositoryRoot,
        plan,
        requestPath: fixture.requestPath,
        acknowledgement: corpusTrustedVerificationApplyAcknowledgement(
          plan.planSha256,
        ),
        loadExternalSnapshot: () => fixture.snapshot,
        testOnlyExpectedIdentityCount: fixture.identityCount,
        testFaultInjector: (point) => {
          if (
            point ===
            `target_renamed:${CORPUS_CURRENT_STATE_PATHS.generationManifest}`
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
      assertCorpusTrustedVerificationJournalMatchesPlan({ journal, plan }),
    );
    const foreignKind = resealJournal(journal, (body) => {
      body.transactionKind = "foreign_trusted_verification_transaction";
    });
    assert.throws(
      () =>
        assertCorpusTrustedVerificationJournalMatchesPlan({
          journal: foreignKind,
          plan,
        }),
      /not authorized by the sealed appender plan/,
    );
    const foreignAfterBinding = resealJournal(journal, (body) => {
      body.entries[0]!.after.sha256 = `sha256:${"f".repeat(64)}`;
    });
    assert.throws(
      () =>
        assertCorpusTrustedVerificationJournalMatchesPlan({
          journal: foreignAfterBinding,
          plan,
        }),
      /after-binding differs from plan/,
    );
    const foreignBeforeMode = resealJournal(journal, (body) => {
      body.entries[0]!.beforeMode = 0o400;
    });
    assert.throws(
      () =>
        assertCorpusTrustedVerificationJournalMatchesPlan({
          journal: foreignBeforeMode,
          plan,
        }),
      /after-binding differs from plan/,
    );
    assert.throws(
      () =>
        recoverCorpusTrustedVerificationAppend({
          repositoryRoot: fixture.repositoryRoot,
          plan,
          requestPath: fixture.requestPath,
          acknowledgement: "wrong",
          loadExternalSnapshot: () => fixture.snapshot,
          testOnlyExpectedIdentityCount: fixture.identityCount,
        }),
      /recovery acknowledgement/,
    );
    assert.equal(
      recoverCorpusTrustedVerificationAppend({
        repositoryRoot: fixture.repositoryRoot,
        plan,
        requestPath: fixture.requestPath,
        acknowledgement: corpusRepositoryBundleRecoveryAcknowledgement(
          journal.journalSha256,
        ),
        loadExternalSnapshot: () => fixture.snapshot,
        testOnlyExpectedIdentityCount: fixture.identityCount,
      }),
      "completed",
    );
    assertTransactionClean(fixture.repositoryRoot);
  } finally {
    rmSync(fixture.base, { recursive: true, force: true });
  }
});

test("request and external-authority drift fail before commit or during revalidation", async () => {
  const requestFixture = makeFixture();
  try {
    const plan = buildFixturePlan(requestFixture);
    const different = createRequestAndSnapshot({
      repositoryRoot: requestFixture.repositoryRoot,
      requestPath: requestFixture.requestPath,
      verifiedOffset: 5_000,
    });
    await assert.rejects(
      applyCorpusTrustedVerificationAppendPlan({
        repositoryRoot: requestFixture.repositoryRoot,
        plan,
        requestPath: requestFixture.requestPath,
        acknowledgement: corpusTrustedVerificationApplyAcknowledgement(
          plan.planSha256,
        ),
        loadExternalSnapshot: () => different.snapshot,
        testOnlyExpectedIdentityCount: requestFixture.identityCount,
      }),
      /sealed plan|latest external append|prepared request/,
    );
    assertTransactionClean(requestFixture.repositoryRoot);
  } finally {
    rmSync(requestFixture.base, { recursive: true, force: true });
  }

  const externalFixture = makeFixture();
  try {
    const plan = buildFixturePlan(externalFixture);
    const alternatePath = join(externalFixture.base, "alternate-request.json");
    const alternate = createRequestAndSnapshot({
      repositoryRoot: externalFixture.repositoryRoot,
      requestPath: alternatePath,
      verifiedOffset: 9_000,
    });
    let snapshot = externalFixture.snapshot;
    await assert.rejects(
      applyCorpusTrustedVerificationAppendPlan({
        repositoryRoot: externalFixture.repositoryRoot,
        plan,
        requestPath: externalFixture.requestPath,
        acknowledgement: corpusTrustedVerificationApplyAcknowledgement(
          plan.planSha256,
        ),
        loadExternalSnapshot: () => snapshot,
        testOnlyExpectedIdentityCount: externalFixture.identityCount,
        testFaultInjector: (point) => {
          if (point === "journal_prepared_durable") {
            snapshot = alternate.snapshot;
          }
        },
      }),
      /latest external append|sealed plan/,
    );
    assertTransactionClean(externalFixture.repositoryRoot);
  } finally {
    rmSync(externalFixture.base, { recursive: true, force: true });
  }
});

test.after(() => {
  if (oldNodeEnv === undefined) Reflect.deleteProperty(process.env, "NODE_ENV");
  else Object.assign(process.env, { NODE_ENV: oldNodeEnv });
});
