import assert from "node:assert/strict";
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
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import {
  CORPUS_REPOSITORY_BUNDLE_ORPHAN_INITIAL_JOURNAL_ACKNOWLEDGEMENT,
  CORPUS_REPOSITORY_BUNDLE_TRANSACTION_DATA_PATH,
  CORPUS_REPOSITORY_BUNDLE_TRANSACTION_JOURNAL_PATH,
  CorpusRepositoryBundleSimulatedCrash,
  commitCorpusRepositoryBundleTransaction,
  corpusRepositoryBundleRecoveryAcknowledgement,
  readCorpusRepositoryBundleFileBinding,
  recoverCorpusRepositoryBundleTransaction,
  validateCorpusRepositoryBundleTransactionJournal,
  type CorpusRepositoryBundleTransactionJournal,
} from "../../src/lib/knowledge/corpus-repository-bundle-transaction";

const authorizationSha256 = `sha256:${"a".repeat(64)}`;
const aPath = "knowledge/a.txt";
const bPath = "knowledge/b.txt";
const dependencyPath = "knowledge/dependency.txt";
const markerPath = "knowledge/commit.json";

type Fixture = {
  root: string;
  a: string;
  b: string;
  dependency: string;
  marker: string;
};

type CommitInput = Parameters<
  typeof commitCorpusRepositoryBundleTransaction
>[0];

function makeFixture(): Fixture {
  const root = mkdtempSync(
    join(realpathSync(tmpdir()), "corpus-repository-bundle-"),
  );
  const fixture = {
    root,
    a: join(root, aPath),
    b: join(root, bPath),
    dependency: join(root, dependencyPath),
    marker: join(root, markerPath),
  };
  mkdirSync(dirname(fixture.a), { recursive: true });
  writeFileSync(fixture.a, "a-before\n", "utf8");
  writeFileSync(fixture.b, "b-before\n", "utf8");
  writeFileSync(fixture.dependency, "dependency-before\n", "utf8");
  writeFileSync(fixture.marker, '{"state":"before"}\n', "utf8");
  return fixture;
}

function transactionInput(
  fixture: Fixture,
  override: Partial<CommitInput> = {},
): CommitInput {
  return {
    root: fixture.root,
    transactionId: "bundle.fixture.1",
    transactionKind: "fixture_bundle",
    authorizationSha256,
    expectedInputs: [aPath, bPath, dependencyPath, markerPath].map((path) =>
      readCorpusRepositoryBundleFileBinding(fixture.root, path),
    ),
    outputs: [
      { path: aPath, content: "a-after\n" },
      { path: bPath, content: "b-after\n" },
      { path: markerPath, content: '{"state":"after"}\n' },
    ],
    finalCommitMarkerPath: markerPath,
    revalidate: () => undefined,
    confirmCommittedState: () => undefined,
    ...override,
  };
}

function read(path: string): string {
  return readFileSync(path, "utf8");
}

function journalPath(root: string): string {
  return join(root, CORPUS_REPOSITORY_BUNDLE_TRANSACTION_JOURNAL_PATH);
}

function journalTemporaryPath(root: string): string {
  return `${journalPath(root)}.tmp`;
}

function dataPath(root: string): string {
  return join(root, CORPUS_REPOSITORY_BUNDLE_TRANSACTION_DATA_PATH);
}

function readJournal(root: string): CorpusRepositoryBundleTransactionJournal {
  return validateCorpusRepositoryBundleTransactionJournal(
    JSON.parse(read(journalPath(root))),
  );
}

function recoveryAcknowledgement(root: string): string {
  return corpusRepositoryBundleRecoveryAcknowledgement(
    readJournal(root).journalSha256,
  );
}

function confirmNothing(): void {}

function assertBefore(fixture: Fixture): void {
  assert.equal(read(fixture.a), "a-before\n");
  assert.equal(read(fixture.b), "b-before\n");
  assert.equal(read(fixture.marker), '{"state":"before"}\n');
}

function assertAfter(fixture: Fixture): void {
  assert.equal(read(fixture.a), "a-after\n");
  assert.equal(read(fixture.b), "b-after\n");
  assert.equal(read(fixture.marker), '{"state":"after"}\n');
}

function assertTransactionClean(root: string): void {
  assert.equal(existsSync(journalPath(root)), false);
  assert.equal(existsSync(journalTemporaryPath(root)), false);
  assert.equal(existsSync(dataPath(root)), false);
}

test("commits all outputs with the final marker last and removes transaction data", async () => {
  const fixture = makeFixture();
  try {
    const faults: string[] = [];
    const confirmed: string[] = [];
    const outcome = await commitCorpusRepositoryBundleTransaction(
      transactionInput(fixture, {
        testFaultInjector: (point) => faults.push(point),
        confirmCommittedState: (journal) =>
          confirmed.push(journal.journalSha256),
      }),
    );

    assert.equal(outcome, "committed");
    assertAfter(fixture);
    assert.equal(read(fixture.dependency), "dependency-before\n");
    assert.equal(faults.at(-1), `target_renamed:${markerPath}`);
    assert.equal(confirmed.length, 1);
    assertTransactionClean(fixture.root);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("rolls back a prepared transaction when domain revalidation fails", async () => {
  const fixture = makeFixture();
  try {
    await assert.rejects(
      commitCorpusRepositoryBundleTransaction(
        transactionInput(fixture, {
          revalidate: () => {
            throw new Error("fixture domain revalidation failed");
          },
        }),
      ),
      /fixture domain revalidation failed/,
    );
    assertBefore(fixture);
    assertTransactionClean(fixture.root);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("rechecks sealed CAS inputs after revalidation and leaves outputs unchanged", async () => {
  const fixture = makeFixture();
  try {
    await assert.rejects(
      commitCorpusRepositoryBundleTransaction(
        transactionInput(fixture, {
          revalidate: () => {
            writeFileSync(fixture.dependency, "dependency-drifted\n", "utf8");
          },
        }),
      ),
      /CAS input drifted/,
    );
    assertBefore(fixture);
    assert.equal(read(fixture.dependency), "dependency-drifted\n");
    assertTransactionClean(fixture.root);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

for (const faultPoint of [
  "journal_staging_durable",
  "journal_prepared_durable",
] as const) {
  test(`recovers an explicit ${faultPoint} crash to the exact before state`, async () => {
    const fixture = makeFixture();
    try {
      await assert.rejects(
        commitCorpusRepositoryBundleTransaction(
          transactionInput(fixture, {
            testFaultInjector: (point) => {
              if (point === faultPoint) {
                throw new CorpusRepositoryBundleSimulatedCrash("fixture crash");
              }
            },
          }),
        ),
        CorpusRepositoryBundleSimulatedCrash,
      );
      assertBefore(fixture);
      assert.equal(existsSync(journalPath(fixture.root)), true);
      assert.throws(
        () =>
          recoverCorpusRepositoryBundleTransaction({
            root: fixture.root,
            acknowledgement: "wrong",
            confirmCommittedState: confirmNothing,
          }),
        /acknowledgement is missing/,
      );
      assert.equal(
        recoverCorpusRepositoryBundleTransaction({
          root: fixture.root,
          acknowledgement: recoveryAcknowledgement(fixture.root),
          confirmCommittedState: confirmNothing,
        }),
        "rolled_back",
      );
      assertBefore(fixture);
      assertTransactionClean(fixture.root);
    } finally {
      rmSync(fixture.root, { recursive: true, force: true });
    }
  });
}

test("rolls back a crash after the first target rename without restore residue", async () => {
  const fixture = makeFixture();
  try {
    await assert.rejects(
      commitCorpusRepositoryBundleTransaction(
        transactionInput(fixture, {
          testFaultInjector: (point) => {
            if (point === `target_renamed:${aPath}`) {
              throw new CorpusRepositoryBundleSimulatedCrash("fixture crash");
            }
          },
        }),
      ),
      CorpusRepositoryBundleSimulatedCrash,
    );
    assert.equal(read(fixture.a), "a-after\n");
    assert.equal(read(fixture.b), "b-before\n");

    assert.equal(
      recoverCorpusRepositoryBundleTransaction({
        root: fixture.root,
        acknowledgement: recoveryAcknowledgement(fixture.root),
        confirmCommittedState: confirmNothing,
      }),
      "rolled_back",
    );
    assertBefore(fixture);
    assert.equal(
      readdirSync(join(fixture.root, "knowledge")).some((name) =>
        name.includes("bundle-restore"),
      ),
      false,
    );
    assertTransactionClean(fixture.root);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("resumes cleanly when recovery crashed after consuming a backup", async () => {
  const fixture = makeFixture();
  try {
    await assert.rejects(
      commitCorpusRepositoryBundleTransaction(
        transactionInput(fixture, {
          testFaultInjector: (point) => {
            if (point === `target_renamed:${aPath}`) {
              throw new CorpusRepositoryBundleSimulatedCrash("fixture crash");
            }
          },
        }),
      ),
      CorpusRepositoryBundleSimulatedCrash,
    );
    const journal = readJournal(fixture.root);
    const aEntry = journal.entries.find((entry) => entry.path === aPath)!;
    assert.ok(aEntry.backupPath);
    chmodSync(join(fixture.root, aEntry.backupPath), aEntry.beforeMode!);
    renameSync(join(fixture.root, aEntry.backupPath), fixture.a);

    assert.equal(
      recoverCorpusRepositoryBundleTransaction({
        root: fixture.root,
        acknowledgement: recoveryAcknowledgement(fixture.root),
        confirmCommittedState: confirmNothing,
      }),
      "rolled_back",
    );
    assertBefore(fixture);
    assertTransactionClean(fixture.root);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("treats an ordinary post-marker error as committed after verified recovery", async () => {
  const fixture = makeFixture();
  try {
    let confirmations = 0;
    const outcome = await commitCorpusRepositoryBundleTransaction(
      transactionInput(fixture, {
        testFaultInjector: (point) => {
          if (point === `target_renamed:${markerPath}`) {
            throw new Error("fixture post-marker error");
          }
        },
        confirmCommittedState: () => {
          confirmations += 1;
        },
      }),
    );
    assert.equal(outcome, "committed_after_recovery");
    assert.equal(confirmations, 1);
    assertAfter(fixture);
    assertTransactionClean(fixture.root);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("requires domain confirmation before completing post-marker crash recovery", async () => {
  const fixture = makeFixture();
  try {
    await assert.rejects(
      commitCorpusRepositoryBundleTransaction(
        transactionInput(fixture, {
          testFaultInjector: (point) => {
            if (point === `target_renamed:${markerPath}`) {
              throw new CorpusRepositoryBundleSimulatedCrash("fixture crash");
            }
          },
        }),
      ),
      CorpusRepositoryBundleSimulatedCrash,
    );
    assertAfter(fixture);
    const acknowledgement = recoveryAcknowledgement(fixture.root);
    assert.throws(
      () =>
        recoverCorpusRepositoryBundleTransaction({
          root: fixture.root,
          acknowledgement,
          confirmCommittedState: () => {
            throw new Error("external head drifted");
          },
        }),
      /external head drifted/,
    );
    assert.equal(existsSync(journalPath(fixture.root)), true);

    let confirmedPhase = "";
    assert.equal(
      recoverCorpusRepositoryBundleTransaction({
        root: fixture.root,
        acknowledgement,
        confirmCommittedState: (journal) => {
          confirmedPhase = journal.phase;
        },
      }),
      "completed",
    );
    assert.equal(confirmedPhase, "prepared");
    assertAfter(fixture);
    assertTransactionClean(fixture.root);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("refuses recovery when a partially renamed target has unexpected bytes", async () => {
  const fixture = makeFixture();
  try {
    await assert.rejects(
      commitCorpusRepositoryBundleTransaction(
        transactionInput(fixture, {
          testFaultInjector: (point) => {
            if (point === `target_renamed:${aPath}`) {
              throw new CorpusRepositoryBundleSimulatedCrash("fixture crash");
            }
          },
        }),
      ),
      CorpusRepositoryBundleSimulatedCrash,
    );
    writeFileSync(fixture.a, "unexpected-third-state\n", "utf8");
    assert.throws(
      () =>
        recoverCorpusRepositoryBundleTransaction({
          root: fixture.root,
          acknowledgement: recoveryAcknowledgement(fixture.root),
          confirmCommittedState: confirmNothing,
        }),
      /unexpected target state/,
    );
    assert.equal(existsSync(journalPath(fixture.root)), true);
    assert.equal(existsSync(dataPath(fixture.root)), true);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("refuses recovery when transaction data contains an unknown file", async () => {
  const fixture = makeFixture();
  try {
    await assert.rejects(
      commitCorpusRepositoryBundleTransaction(
        transactionInput(fixture, {
          testFaultInjector: (point) => {
            if (point === "journal_prepared_durable") {
              throw new CorpusRepositoryBundleSimulatedCrash("fixture crash");
            }
          },
        }),
      ),
      CorpusRepositoryBundleSimulatedCrash,
    );
    writeFileSync(join(dataPath(fixture.root), "rogue"), "rogue\n", "utf8");
    assert.throws(
      () =>
        recoverCorpusRepositoryBundleTransaction({
          root: fixture.root,
          acknowledgement: recoveryAcknowledgement(fixture.root),
          confirmCommittedState: confirmNothing,
        }),
      /unexpected files: rogue/,
    );
    assert.equal(existsSync(journalPath(fixture.root)), true);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("snapshots absence guards so revalidation cannot remove one", async () => {
  const fixture = makeFixture();
  const guardPath = "knowledge/guard.lock";
  const guard = join(fixture.root, guardPath);
  const absent = [guardPath];
  try {
    await assert.rejects(
      commitCorpusRepositoryBundleTransaction(
        transactionInput(fixture, {
          expectedAbsentPaths: absent,
          revalidate: () => {
            writeFileSync(guard, "guard\n", "utf8");
            absent.splice(0, absent.length);
          },
        }),
      ),
      /expected-absent path exists/,
    );
    assertBefore(fixture);
    assert.equal(read(guard), "guard\n");
    assertTransactionClean(fixture.root);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("rejects an unreadable output mode before creating transaction artifacts", async () => {
  const fixture = makeFixture();
  try {
    const input = transactionInput(fixture);
    input.outputs = input.outputs.map((output) =>
      output.path === markerPath ? { ...output, mode: 0o200 } : output,
    );
    await assert.rejects(
      commitCorpusRepositoryBundleTransaction(input),
      /output mode is invalid/,
    );
    assertBefore(fixture);
    assertTransactionClean(fixture.root);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("rejects an unchanged final commit marker before journaling", async () => {
  const fixture = makeFixture();
  try {
    const input = transactionInput(fixture);
    input.outputs = input.outputs.map((output) =>
      output.path === markerPath
        ? { ...output, content: '{"state":"before"}\n' }
        : output,
    );
    await assert.rejects(
      commitCorpusRepositoryBundleTransaction(input),
      /final commit marker must change state/,
    );
    assertBefore(fixture);
    assertTransactionClean(fixture.root);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("rejects the internal journal temporary path as an output", async () => {
  const fixture = makeFixture();
  try {
    for (const internalPath of [
      `${CORPUS_REPOSITORY_BUNDLE_TRANSACTION_JOURNAL_PATH}.tmp`,
      CORPUS_REPOSITORY_BUNDLE_TRANSACTION_JOURNAL_PATH.toUpperCase(),
    ]) {
      const input = transactionInput(fixture, {
        outputs: [
          { path: aPath, content: "a-after\n" },
          { path: internalPath, content: "not-a-marker\n" },
        ],
        expectedAbsentPaths: [internalPath],
        finalCommitMarkerPath: internalPath,
      });
      await assert.rejects(
        commitCorpusRepositoryBundleTransaction(input),
        /overlaps transaction data/,
      );
    }
    assertBefore(fixture);
    assertTransactionClean(fixture.root);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("treats a dangling symlink as present instead of sealed absent", async () => {
  const fixture = makeFixture();
  const newMarkerPath = "knowledge/new-marker.json";
  const newMarker = join(fixture.root, newMarkerPath);
  try {
    symlinkSync("missing-target", newMarker);
    const input = transactionInput(fixture, {
      outputs: [
        { path: aPath, content: "a-after\n" },
        { path: newMarkerPath, content: "new-marker\n" },
      ],
      expectedAbsentPaths: [newMarkerPath],
      finalCommitMarkerPath: newMarkerPath,
    });
    await assert.rejects(
      commitCorpusRepositoryBundleTransaction(input),
      /expected-absent path exists/,
    );
    assert.equal(lstatSync(newMarker).isSymbolicLink(), true);
    assertBefore(fixture);
    assertTransactionClean(fixture.root);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("rejects symlink and hardlink inputs before journaling", async () => {
  for (const kind of ["symlink", "hardlink"] as const) {
    const fixture = makeFixture();
    const input = transactionInput(fixture);
    try {
      if (kind === "symlink") {
        const outside = join(fixture.root, "outside.txt");
        writeFileSync(outside, "a-before\n", "utf8");
        unlinkSync(fixture.a);
        symlinkSync(outside, fixture.a);
      } else {
        linkSync(fixture.a, join(fixture.root, "a-hardlink.txt"));
      }
      await assert.rejects(
        commitCorpusRepositoryBundleTransaction(input),
        /one-link regular file/,
      );
      assertTransactionClean(fixture.root);
    } finally {
      rmSync(fixture.root, { recursive: true, force: true });
    }
  }
});

test("rejects case and Unicode aliases among outputs", async () => {
  const fixture = makeFixture();
  try {
    const input = transactionInput(fixture, {
      outputs: [
        { path: "knowledge/Alias.txt", content: "one\n" },
        { path: "knowledge/alias.txt", content: "two\n" },
      ],
      expectedAbsentPaths: ["knowledge/Alias.txt", "knowledge/alias.txt"],
      finalCommitMarkerPath: "knowledge/alias.txt",
    });
    await assert.rejects(
      commitCorpusRepositoryBundleTransaction(input),
      /case or Unicode path aliases/,
    );
    assertTransactionClean(fixture.root);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("rejects a symlink repository root", async () => {
  const fixture = makeFixture();
  const linkRoot = `${fixture.root}-link`;
  try {
    symlinkSync(fixture.root, linkRoot, "dir");
    await assert.rejects(
      commitCorpusRepositoryBundleTransaction(
        transactionInput(fixture, { root: linkRoot }),
      ),
      /root is not a regular directory/,
    );
    assertTransactionClean(fixture.root);
  } finally {
    rmSync(linkRoot, { force: true });
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("requires a fixed acknowledgement to remove a torn initial journal temp", () => {
  const fixture = makeFixture();
  try {
    writeFileSync(journalTemporaryPath(fixture.root), "{torn", {
      encoding: "utf8",
      mode: 0o600,
    });
    assert.throws(
      () =>
        recoverCorpusRepositoryBundleTransaction({
          root: fixture.root,
          acknowledgement: "wrong",
          confirmCommittedState: confirmNothing,
        }),
      /orphan initial-journal recovery acknowledgement is missing/,
    );
    assert.equal(
      recoverCorpusRepositoryBundleTransaction({
        root: fixture.root,
        acknowledgement:
          CORPUS_REPOSITORY_BUNDLE_ORPHAN_INITIAL_JOURNAL_ACKNOWLEDGEMENT,
        confirmCommittedState: confirmNothing,
      }),
      "rolled_back",
    );
    assertBefore(fixture);
    assertTransactionClean(fixture.root);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("rejects a journal whose internal staging path is not deterministic", async () => {
  const fixture = makeFixture();
  try {
    await assert.rejects(
      commitCorpusRepositoryBundleTransaction(
        transactionInput(fixture, {
          testFaultInjector: (point) => {
            if (point === "journal_prepared_durable") {
              throw new CorpusRepositoryBundleSimulatedCrash("fixture crash");
            }
          },
        }),
      ),
      CorpusRepositoryBundleSimulatedCrash,
    );
    const journal = JSON.parse(read(journalPath(fixture.root))) as {
      entries: Array<{ stagedPath: string }>;
    };
    journal.entries[0]!.stagedPath = aPath;
    assert.throws(
      () => validateCorpusRepositoryBundleTransactionJournal(journal),
      /entry is inconsistent/,
    );
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("refuses orphan transaction data when no journal exists", () => {
  const fixture = makeFixture();
  try {
    mkdirSync(dataPath(fixture.root), { mode: 0o700 });
    assert.throws(
      () =>
        recoverCorpusRepositoryBundleTransaction({
          root: fixture.root,
          acknowledgement:
            CORPUS_REPOSITORY_BUNDLE_ORPHAN_INITIAL_JOURNAL_ACKNOWLEDGEMENT,
          confirmCommittedState: confirmNothing,
        }),
      /manual inspection/,
    );
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});
