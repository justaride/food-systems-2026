import assert from "node:assert/strict";
import {
  chmodSync,
  existsSync,
  linkSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";

import {
  CORPUS_PRE_LIVE_REBASELINE_HISTORY_PATH,
  CORPUS_PRE_LIVE_REBASELINE_MANIFEST_PATH,
  CORPUS_PRE_LIVE_REBASELINE_SCHEMA_VERSION,
  CORPUS_PRE_LIVE_REBASELINE_TRANSACTION_DATA_PATH,
  CORPUS_PRE_LIVE_REBASELINE_TRANSACTION_JOURNAL_PATH,
  CORPUS_PRE_LIVE_REBASELINE_VERSION,
  CorpusPreLiveRebaselineSimulatedCrash,
  commitCorpusPreLiveRebaseline,
  corpusPreLiveRebaselineApplyAcknowledgement,
  corpusPreLiveRebaselineBindingSetSha256,
  corpusPreLiveRebaselineFileBinding,
  corpusPreLiveRebaselineRecoveryAcknowledgement,
  recoverCorpusPreLiveRebaselineTransaction,
  sealCorpusPreLiveRebaselineCommitManifest,
  sealCorpusPreLiveRebaselineDatabaseObservation,
  sealCorpusPreLiveRebaselineHistoryRecord,
  sealCorpusPreLiveRebaselinePlan,
  validateCorpusPreLiveRebaselineCommitManifest,
  validateCorpusPreLiveRebaselineDatabaseObservation,
  validateCorpusPreLiveRebaselineHistoryRecord,
  validateCorpusPreLiveRebaselinePlan,
  validateCorpusPreLiveRebaselineTransactionJournal,
  type CorpusPreLiveRebaselineDatabaseObservation,
  type CorpusPreLiveRebaselineFileBinding,
  type CorpusPreLiveRebaselineNamedBootstrapBindings,
  type CorpusPreLiveRebaselineOutput,
  type CorpusPreLiveRebaselinePlan,
} from "../../src/lib/knowledge/corpus-pre-live-rebaseline";
import {
  CORPUS_PROCESSING_BASELINE_PATH,
  CORPUS_PROCESSING_LEDGER_PATH,
  buildCorpusCurrentStateRebaselineArtifacts,
  buildCorpusProcessingRebaselineArtifacts,
  buildEmptyCorpusStateRebaselineBootstrap,
} from "../../scripts/knowledge/build-corpus-pre-live-rebaseline-overlays";
import { CORPUS_CURRENT_STATE_PATHS } from "../../scripts/knowledge/generate-corpus-processing-current-state";
import {
  CORPUS_PROCESSING_PATHS,
  LIVE_INVENTORY_SNAPSHOT_PATH,
  buildLiveInventorySnapshot,
} from "../../scripts/knowledge/generate-corpus-processing-register";
import {
  assertCorpusPreLiveRebaselineNoPromotion,
  inspectPreLiveBootstrap,
  parseCorpusPreLiveRebaselineArgs,
} from "../../scripts/knowledge/rebaseline-corpus-pre-live";

const hash = (character: string) => character.repeat(64);
const observedAt = "2026-08-03T12:00:00.000Z";
const existingPath = "knowledge/corpus/rebaseline-fixture.txt";
const oldContent = "old bootstrap\n";
const nextContent = "new bootstrap\n";

const safetyBoundary = {
  databaseMutationPerformed: false as const,
  privateSourceReadPerformed: true,
  privateSourceReadLimitedToExactAfterStateVerification: true as const,
  privateSourceMutationPerformed: false as const,
  lifecycleEventCreated: false as const,
  trustedVerificationCreated: false as const,
  externalAnchorBindingCreated: false as const,
  identityVerified: false as const,
  sourceAnalysisAllowed: false as const,
  ownerReviewComplete: false as const,
  rightsCleared: false as const,
  externalUseAllowed: false as const,
  coveragePromotionAllowed: false as const,
};

const sourceRegistration = {
  plan: {
    path: "knowledge/corpus/source-registration/plan.json",
    fileSha256: hash("1"),
    planSha256: hash("2"),
    beforeSnapshotSha256: hash("3"),
  },
  audit: {
    auditId: "audit.fixture",
    operationKey: "operation.fixture",
    recordSha256: hash("4"),
    recordedAt: "2026-08-03T11:59:00.000Z",
    contractScope: "source-registration-apply.v1",
    contractSha256: hash("5"),
    planSha256: hash("2"),
    beforeSnapshotSha256: hash("3"),
    afterSnapshotSha256: hash("6"),
    mutationSummarySha256: hash("7"),
    databaseIdentityUuid: "11111111-1111-4111-8111-111111111111",
    receiptState: "exact_apply_committed" as const,
    rows: {
      documentCreates: 10 as const,
      libraryAnalysisRecordCreates: 10 as const,
      controlledMutationAuditCreates: 1 as const,
    },
  },
};

function write(root: string, path: string, content: string): void {
  const target = join(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content, "utf8");
}

function preLiveInspectionFixture(repositoryRoot: string): string {
  const root = mkdtempSync(join(tmpdir(), "corpus-rebaseline-inspection-"));
  const corpusManifestPath =
    "knowledge/corpus/corpus-processing-generation-manifest.v1.json";
  const currentManifestPath =
    "knowledge/corpus/corpus-processing-current-state-generation-manifest.v1.json";
  const manifests = [corpusManifestPath, currentManifestPath].map(
    (path) =>
      JSON.parse(readFileSync(join(repositoryRoot, path), "utf8")) as {
        inputs: CorpusPreLiveRebaselineFileBinding[];
        outputs: CorpusPreLiveRebaselineFileBinding[];
      },
  );
  const paths = new Set<string>([
    CORPUS_PROCESSING_BASELINE_PATH,
    LIVE_INVENTORY_SNAPSHOT_PATH,
    corpusManifestPath,
    currentManifestPath,
    CORPUS_CURRENT_STATE_PATHS.events,
    CORPUS_CURRENT_STATE_PATHS.eventManifest,
    CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
    CORPUS_CURRENT_STATE_PATHS.currentState,
    ...manifests.flatMap((manifest) => [
      ...manifest.inputs
        .filter((binding) => binding.path !== CORPUS_PROCESSING_LEDGER_PATH)
        .map((binding) => binding.path),
      ...manifest.outputs.map((binding) => binding.path),
    ]),
  ]);
  for (const path of paths) {
    const target = join(root, path);
    mkdirSync(dirname(target), { recursive: true });
    linkSync(join(repositoryRoot, path), target);
  }
  return root;
}

function arbitraryBinding(
  path: string,
  character: string,
): CorpusPreLiveRebaselineFileBinding {
  return { path, sha256: hash(character), sizeBytes: 10 };
}

function bootstrapBindings(
  prefix: string,
): CorpusPreLiveRebaselineNamedBootstrapBindings {
  return {
    baseline: arbitraryBinding(`${prefix}/baseline.json`, "8"),
    liveInventorySnapshot: arbitraryBinding(`${prefix}/snapshot.json`, "9"),
    libraryLedger: arbitraryBinding(
      "research/_status/library-analysis-ledger.jsonl",
      "a",
    ),
    corpusRegister: arbitraryBinding(`${prefix}/register.jsonl`, "b"),
    corpusGenerationManifest: arbitraryBinding(
      `${prefix}/generation.json`,
      "c",
    ),
    currentState: arbitraryBinding(`${prefix}/current.jsonl`, "d"),
    currentStateGenerationManifest: arbitraryBinding(
      `${prefix}/current-generation.json`,
      "e",
    ),
    eventLog: arbitraryBinding(`${prefix}/events.jsonl`, "f"),
    eventManifest: arbitraryBinding(`${prefix}/events-manifest.json`, "0"),
    anchorLog: arbitraryBinding(`${prefix}/anchors.jsonl`, "1"),
  };
}

function databaseObservation(
  identityHash = "2",
): CorpusPreLiveRebaselineDatabaseObservation {
  return sealCorpusPreLiveRebaselineDatabaseObservation({
    observedAt,
    transaction: {
      isolationLevel: "RepeatableRead",
      readOnly: true,
      transactionReadOnlySetting: "on",
      observationScope:
        "source_registration_receipt_targets_core_counts_and_active_inventory",
    },
    databaseIdentityUuid: "11111111-1111-4111-8111-111111111111",
    counts: {
      documents: 1549,
      libraryAnalysisRecords: 1582,
      controlledMutationAudits: 1,
      activeLibraryLedgerRows: 1565,
    },
    exactAfterState: {
      targetCount: 10,
      exactDocumentTargets: 10,
      exactLibraryTargets: 10,
      dependencyRowCount: 0,
      exactReceiptedAuditCount: 1,
    },
    sourceRegistration,
    liveInventoryIdentityContentSetSha256: hash(identityHash),
    exportedLedgerSha256: hash("a"),
  });
}

function fixture(root: string): {
  plan: CorpusPreLiveRebaselinePlan;
  outputs: CorpusPreLiveRebaselineOutput[];
  manifest: ReturnType<typeof sealCorpusPreLiveRebaselineCommitManifest>;
  observation: CorpusPreLiveRebaselineDatabaseObservation;
} {
  write(root, existingPath, oldContent);
  const existing = corpusPreLiveRebaselineFileBinding(existingPath, oldContent);
  const oldBootstrap = bootstrapBindings("knowledge/corpus/old");
  const nextBootstrap = bootstrapBindings("knowledge/corpus/new");
  const history = sealCorpusPreLiveRebaselineHistoryRecord({
    schemaVersion: CORPUS_PRE_LIVE_REBASELINE_SCHEMA_VERSION,
    recordType: "corpus_pre_live_rebaseline_history",
    rebaselineVersion: CORPUS_PRE_LIVE_REBASELINE_VERSION,
    recordId: "history.fixture",
    sequence: 1,
    predecessorRecordSha256: null,
    observedAt,
    previousBootstrap: oldBootstrap,
    nextBootstrap,
    sourceRegistration,
    currentExportedLedger: arbitraryBinding(
      "research/_status/library-analysis-ledger.jsonl",
      "a",
    ),
    safetyBoundary,
    lineageMeaning:
      "sealed_bootstrap_replacement_not_lifecycle_event_or_trusted_anchor",
  });
  const historyContent = `${JSON.stringify(history)}\n`;
  const outputs = [
    { path: existingPath, content: nextContent },
    { path: CORPUS_PRE_LIVE_REBASELINE_HISTORY_PATH, content: historyContent },
  ];
  const outputBindings = outputs.map((output) =>
    corpusPreLiveRebaselineFileBinding(output.path, output.content),
  );
  const observation = databaseObservation();
  const plan = sealCorpusPreLiveRebaselinePlan({
    schemaVersion: CORPUS_PRE_LIVE_REBASELINE_SCHEMA_VERSION,
    artifactType: "corpus_pre_live_rebaseline_plan",
    planVersion: CORPUS_PRE_LIVE_REBASELINE_VERSION,
    planId: "fixture.plan",
    mode: "read_only_plan",
    createdAt: observedAt,
    newObservedAt: observedAt,
    oldBootstrap,
    currentExportedLedger: arbitraryBinding(
      "research/_status/library-analysis-ledger.jsonl",
      "a",
    ),
    sourceRegistration,
    databaseObservation: observation,
    compareAndSwapInputs: [existing],
    expectedAbsentPaths: [
      CORPUS_PRE_LIVE_REBASELINE_HISTORY_PATH,
      CORPUS_PRE_LIVE_REBASELINE_MANIFEST_PATH,
    ],
    proposedOutputs: outputBindings,
    safetyBoundary,
  });
  const manifest = sealCorpusPreLiveRebaselineCommitManifest({
    schemaVersion: CORPUS_PRE_LIVE_REBASELINE_SCHEMA_VERSION,
    artifactType: "corpus_pre_live_rebaseline_commit_manifest",
    manifestVersion: CORPUS_PRE_LIVE_REBASELINE_VERSION,
    manifestId: "corpus-pre-live-rebaseline-generation-manifest.v1",
    committedAt: observedAt,
    newObservedAt: observedAt,
    planSha256: plan.planSha256,
    databaseObservationSha256: observation.observationSha256,
    databaseStateSha256: observation.stateSha256,
    historyRecordSha256: history.recordSha256,
    compareAndSwapInputSetSha256: corpusPreLiveRebaselineBindingSetSha256(
      plan.compareAndSwapInputs,
    ),
    inputs: plan.compareAndSwapInputs,
    outputs: plan.proposedOutputs,
    safetyBoundary,
    commitMarkerSemantics:
      "recoverable_journaled_bundle_with_durable_backups_per_file_atomic_rename_and_manifest_last",
    externalAnchorNextStep:
      "prepare_new_external_request_against_new_baseline_register_generation_manifest_and_genesis_candidate",
  });
  return { plan, outputs, manifest, observation };
}

function transactionPathsAbsent(root: string): void {
  assert.equal(
    existsSync(join(root, CORPUS_PRE_LIVE_REBASELINE_TRANSACTION_JOURNAL_PATH)),
    false,
  );
  assert.equal(
    existsSync(join(root, CORPUS_PRE_LIVE_REBASELINE_TRANSACTION_DATA_PATH)),
    false,
  );
}

test("seals and rejects tampering in observations, plans, history, and manifests", () => {
  const root = mkdtempSync(join(tmpdir(), "corpus-rebaseline-seal-"));
  try {
    const value = fixture(root);
    validateCorpusPreLiveRebaselineDatabaseObservation(value.observation);
    validateCorpusPreLiveRebaselinePlan(value.plan);
    validateCorpusPreLiveRebaselineCommitManifest(value.manifest);
    const history = sealCorpusPreLiveRebaselineHistoryRecord({
      schemaVersion: CORPUS_PRE_LIVE_REBASELINE_SCHEMA_VERSION,
      recordType: "corpus_pre_live_rebaseline_history",
      rebaselineVersion: CORPUS_PRE_LIVE_REBASELINE_VERSION,
      recordId: "history.fixture",
      sequence: 1,
      predecessorRecordSha256: null,
      observedAt,
      previousBootstrap: bootstrapBindings("knowledge/corpus/old"),
      nextBootstrap: bootstrapBindings("knowledge/corpus/new"),
      sourceRegistration,
      currentExportedLedger: arbitraryBinding(
        "research/_status/library-analysis-ledger.jsonl",
        "a",
      ),
      safetyBoundary,
      lineageMeaning:
        "sealed_bootstrap_replacement_not_lifecycle_event_or_trusted_anchor",
    });
    validateCorpusPreLiveRebaselineHistoryRecord(history);
    assert.throws(
      () =>
        validateCorpusPreLiveRebaselinePlan({
          ...value.plan,
          planId: "tampered",
        }),
      /self-hash mismatch/,
    );
    assert.throws(
      () =>
        validateCorpusPreLiveRebaselineDatabaseObservation({
          ...value.observation,
          counts: { ...value.observation.counts, documents: 1550 },
        }),
      /self-hash mismatch|expected 1549/,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("commits a fully staged, revalidated bundle and cleans its transaction data", async () => {
  const root = mkdtempSync(join(tmpdir(), "corpus-rebaseline-commit-"));
  try {
    const value = fixture(root);
    await commitCorpusPreLiveRebaseline({
      root,
      plan: value.plan,
      acknowledgement: corpusPreLiveRebaselineApplyAcknowledgement(
        value.plan.planSha256,
      ),
      outputs: value.outputs,
      finalManifest: value.manifest,
      revalidateDatabaseObservation: async () => value.observation,
    });
    assert.equal(readFileSync(join(root, existingPath), "utf8"), nextContent);
    assert.equal(statSync(join(root, existingPath)).mode & 0o777, 0o644);
    assert.equal(
      readFileSync(join(root, CORPUS_PRE_LIVE_REBASELINE_HISTORY_PATH), "utf8"),
      value.outputs[1]!.content,
    );
    assert.equal(
      statSync(join(root, CORPUS_PRE_LIVE_REBASELINE_HISTORY_PATH)).mode &
        0o777,
      0o644,
    );
    assert.equal(
      existsSync(join(root, CORPUS_PRE_LIVE_REBASELINE_MANIFEST_PATH)),
      true,
    );
    transactionPathsAbsent(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("wrong acknowledgement and CAS drift leave every output untouched", async () => {
  for (const scenario of ["ack", "cas"] as const) {
    const root = mkdtempSync(join(tmpdir(), `corpus-rebaseline-${scenario}-`));
    try {
      const value = fixture(root);
      if (scenario === "cas") write(root, existingPath, "drifted\n");
      await assert.rejects(
        commitCorpusPreLiveRebaseline({
          root,
          plan: value.plan,
          acknowledgement:
            scenario === "ack"
              ? "wrong"
              : corpusPreLiveRebaselineApplyAcknowledgement(
                  value.plan.planSha256,
                ),
          outputs: value.outputs,
          finalManifest: value.manifest,
          revalidateDatabaseObservation: async () => value.observation,
        }),
        scenario === "ack" ? /acknowledgement/ : /CAS input drifted/,
      );
      assert.equal(
        readFileSync(join(root, existingPath), "utf8"),
        scenario === "ack" ? oldContent : "drifted\n",
      );
      assert.equal(
        existsSync(join(root, CORPUS_PRE_LIVE_REBASELINE_HISTORY_PATH)),
        false,
      );
      assert.equal(
        existsSync(join(root, CORPUS_PRE_LIVE_REBASELINE_MANIFEST_PATH)),
        false,
      );
      transactionPathsAbsent(root);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
});

test("apply refuses a target reached through a symlinked repository parent", async () => {
  const root = mkdtempSync(join(tmpdir(), "corpus-rebaseline-symlink-root-"));
  const outside = mkdtempSync(
    join(tmpdir(), "corpus-rebaseline-symlink-outside-"),
  );
  try {
    const value = fixture(root);
    const repositoryCorpus = join(root, "knowledge/corpus");
    const outsideCorpus = join(outside, "corpus");
    renameSync(repositoryCorpus, outsideCorpus);
    symlinkSync(outsideCorpus, repositoryCorpus, "dir");
    await assert.rejects(
      commitCorpusPreLiveRebaseline({
        root,
        plan: value.plan,
        acknowledgement: corpusPreLiveRebaselineApplyAcknowledgement(
          value.plan.planSha256,
        ),
        outputs: value.outputs,
        finalManifest: value.manifest,
        revalidateDatabaseObservation: async () => value.observation,
      }),
      /symlinked or non-directory ancestor/,
    );
    assert.equal(
      readFileSync(join(outsideCorpus, "rebaseline-fixture.txt"), "utf8"),
      oldContent,
    );
    assert.equal(
      existsSync(
        join(outsideCorpus, "corpus-pre-live-rebaseline-history.v1.jsonl"),
      ),
      false,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  }
});

test("database drift after durable staging automatically rolls back", async () => {
  const root = mkdtempSync(join(tmpdir(), "corpus-rebaseline-db-drift-"));
  try {
    const value = fixture(root);
    chmodSync(join(root, existingPath), 0o640);
    await assert.rejects(
      commitCorpusPreLiveRebaseline({
        root,
        plan: value.plan,
        acknowledgement: corpusPreLiveRebaselineApplyAcknowledgement(
          value.plan.planSha256,
        ),
        outputs: value.outputs,
        finalManifest: value.manifest,
        revalidateDatabaseObservation: async () => databaseObservation("3"),
      }),
      /database observation drifted/,
    );
    assert.equal(readFileSync(join(root, existingPath), "utf8"), oldContent);
    assert.equal(statSync(join(root, existingPath)).mode & 0o777, 0o640);
    assert.equal(
      existsSync(join(root, CORPUS_PRE_LIVE_REBASELINE_HISTORY_PATH)),
      false,
    );
    transactionPathsAbsent(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("explicit recovery cleans crashes before the prepared journal without touching targets", async () => {
  for (const crashPoint of [
    "journal_staging_durable",
    "staging_complete",
  ] as const) {
    const root = mkdtempSync(
      join(tmpdir(), `corpus-rebaseline-${crashPoint}-`),
    );
    try {
      const value = fixture(root);
      await assert.rejects(
        commitCorpusPreLiveRebaseline({
          root,
          plan: value.plan,
          acknowledgement: corpusPreLiveRebaselineApplyAcknowledgement(
            value.plan.planSha256,
          ),
          outputs: value.outputs,
          finalManifest: value.manifest,
          revalidateDatabaseObservation: async () => value.observation,
          testFaultInjector: (point) => {
            if (point === crashPoint) {
              throw new CorpusPreLiveRebaselineSimulatedCrash("fixture crash");
            }
          },
        }),
        CorpusPreLiveRebaselineSimulatedCrash,
      );
      assert.equal(readFileSync(join(root, existingPath), "utf8"), oldContent);
      const journal = validateCorpusPreLiveRebaselineTransactionJournal(
        JSON.parse(
          readFileSync(
            join(root, CORPUS_PRE_LIVE_REBASELINE_TRANSACTION_JOURNAL_PATH),
            "utf8",
          ),
        ),
      );
      assert.equal(journal.phase, "staging");
      assert.equal(
        recoverCorpusPreLiveRebaselineTransaction({
          root,
          acknowledgement: corpusPreLiveRebaselineRecoveryAcknowledgement(
            journal.journalSha256,
          ),
        }),
        "rolled_back",
      );
      assert.equal(readFileSync(join(root, existingPath), "utf8"), oldContent);
      transactionPathsAbsent(root);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
});

test("explicit recovery rolls a crash-partial bundle back to the exact old bytes", async () => {
  const root = mkdtempSync(join(tmpdir(), "corpus-rebaseline-crash-partial-"));
  try {
    const value = fixture(root);
    chmodSync(join(root, existingPath), 0o640);
    await assert.rejects(
      commitCorpusPreLiveRebaseline({
        root,
        plan: value.plan,
        acknowledgement: corpusPreLiveRebaselineApplyAcknowledgement(
          value.plan.planSha256,
        ),
        outputs: value.outputs,
        finalManifest: value.manifest,
        revalidateDatabaseObservation: async () => value.observation,
        testFaultInjector: (point) => {
          if (point === `target_renamed:${existingPath}`) {
            throw new CorpusPreLiveRebaselineSimulatedCrash("fixture crash");
          }
        },
      }),
      CorpusPreLiveRebaselineSimulatedCrash,
    );
    assert.equal(readFileSync(join(root, existingPath), "utf8"), nextContent);
    assert.equal(statSync(join(root, existingPath)).mode & 0o777, 0o640);
    assert.equal(
      existsSync(join(root, CORPUS_PRE_LIVE_REBASELINE_HISTORY_PATH)),
      false,
    );
    const journal = validateCorpusPreLiveRebaselineTransactionJournal(
      JSON.parse(
        readFileSync(
          join(root, CORPUS_PRE_LIVE_REBASELINE_TRANSACTION_JOURNAL_PATH),
          "utf8",
        ),
      ),
    );
    assert.throws(
      () =>
        recoverCorpusPreLiveRebaselineTransaction({
          root,
          acknowledgement: "wrong",
        }),
      /acknowledgement/,
    );
    assert.equal(
      recoverCorpusPreLiveRebaselineTransaction({
        root,
        acknowledgement: corpusPreLiveRebaselineRecoveryAcknowledgement(
          journal.journalSha256,
        ),
      }),
      "rolled_back",
    );
    assert.equal(readFileSync(join(root, existingPath), "utf8"), oldContent);
    assert.equal(statSync(join(root, existingPath)).mode & 0o777, 0o640);
    assert.equal(
      existsSync(join(root, CORPUS_PRE_LIVE_REBASELINE_HISTORY_PATH)),
      false,
    );
    transactionPathsAbsent(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("recovery recognizes a complete manifest-last bundle after a final crash", async () => {
  const root = mkdtempSync(join(tmpdir(), "corpus-rebaseline-crash-complete-"));
  try {
    const value = fixture(root);
    await assert.rejects(
      commitCorpusPreLiveRebaseline({
        root,
        plan: value.plan,
        acknowledgement: corpusPreLiveRebaselineApplyAcknowledgement(
          value.plan.planSha256,
        ),
        outputs: value.outputs,
        finalManifest: value.manifest,
        revalidateDatabaseObservation: async () => value.observation,
        testFaultInjector: (point) => {
          if (
            point ===
            `target_renamed:${CORPUS_PRE_LIVE_REBASELINE_MANIFEST_PATH}`
          ) {
            throw new CorpusPreLiveRebaselineSimulatedCrash(
              "fixture final crash",
            );
          }
        },
      }),
      CorpusPreLiveRebaselineSimulatedCrash,
    );
    const journal = validateCorpusPreLiveRebaselineTransactionJournal(
      JSON.parse(
        readFileSync(
          join(root, CORPUS_PRE_LIVE_REBASELINE_TRANSACTION_JOURNAL_PATH),
          "utf8",
        ),
      ),
    );
    assert.equal(
      recoverCorpusPreLiveRebaselineTransaction({
        root,
        acknowledgement: corpusPreLiveRebaselineRecoveryAcknowledgement(
          journal.journalSha256,
        ),
      }),
      "completed",
    );
    assert.equal(readFileSync(join(root, existingPath), "utf8"), nextContent);
    assert.equal(
      existsSync(join(root, CORPUS_PRE_LIVE_REBASELINE_HISTORY_PATH)),
      true,
    );
    assert.equal(
      existsSync(join(root, CORPUS_PRE_LIVE_REBASELINE_MANIFEST_PATH)),
      true,
    );
    transactionPathsAbsent(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("recovery refuses an unexpected target state instead of guessing", async () => {
  const root = mkdtempSync(join(tmpdir(), "corpus-rebaseline-crash-tamper-"));
  try {
    const value = fixture(root);
    await assert.rejects(
      commitCorpusPreLiveRebaseline({
        root,
        plan: value.plan,
        acknowledgement: corpusPreLiveRebaselineApplyAcknowledgement(
          value.plan.planSha256,
        ),
        outputs: value.outputs,
        finalManifest: value.manifest,
        revalidateDatabaseObservation: async () => value.observation,
        testFaultInjector: (point) => {
          if (point === `target_renamed:${existingPath}`) {
            throw new CorpusPreLiveRebaselineSimulatedCrash("fixture crash");
          }
        },
      }),
      CorpusPreLiveRebaselineSimulatedCrash,
    );
    write(root, existingPath, "third state\n");
    const journal = validateCorpusPreLiveRebaselineTransactionJournal(
      JSON.parse(
        readFileSync(
          join(root, CORPUS_PRE_LIVE_REBASELINE_TRANSACTION_JOURNAL_PATH),
          "utf8",
        ),
      ),
    );
    assert.throws(
      () =>
        recoverCorpusPreLiveRebaselineTransaction({
          root,
          acknowledgement: corpusPreLiveRebaselineRecoveryAcknowledgement(
            journal.journalSha256,
          ),
        }),
      /unexpected target state/,
    );
    assert.equal(
      existsSync(
        join(root, CORPUS_PRE_LIVE_REBASELINE_TRANSACTION_JOURNAL_PATH),
      ),
      true,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("recovery refuses unknown transaction data before deleting any evidence", async () => {
  const root = mkdtempSync(join(tmpdir(), "corpus-rebaseline-data-tamper-"));
  try {
    const value = fixture(root);
    await assert.rejects(
      commitCorpusPreLiveRebaseline({
        root,
        plan: value.plan,
        acknowledgement: corpusPreLiveRebaselineApplyAcknowledgement(
          value.plan.planSha256,
        ),
        outputs: value.outputs,
        finalManifest: value.manifest,
        revalidateDatabaseObservation: async () => value.observation,
        testFaultInjector: (point) => {
          if (point === "staging_complete") {
            throw new CorpusPreLiveRebaselineSimulatedCrash("fixture crash");
          }
        },
      }),
      CorpusPreLiveRebaselineSimulatedCrash,
    );
    const journalPath = join(
      root,
      CORPUS_PRE_LIVE_REBASELINE_TRANSACTION_JOURNAL_PATH,
    );
    const journal = validateCorpusPreLiveRebaselineTransactionJournal(
      JSON.parse(readFileSync(journalPath, "utf8")),
    );
    const dataPath = join(
      root,
      CORPUS_PRE_LIVE_REBASELINE_TRANSACTION_DATA_PATH,
    );
    const evidencePaths = journal.entries.flatMap((entry) => [
      join(root, entry.stagedPath),
      ...(entry.backupPath === null ? [] : [join(root, entry.backupPath)]),
    ]);
    assert.equal(
      evidencePaths.every((path) => existsSync(path)),
      true,
    );
    write(
      root,
      `${CORPUS_PRE_LIVE_REBASELINE_TRANSACTION_DATA_PATH}/foreign`,
      "do not delete\n",
    );
    assert.throws(
      () =>
        recoverCorpusPreLiveRebaselineTransaction({
          root,
          acknowledgement: corpusPreLiveRebaselineRecoveryAcknowledgement(
            journal.journalSha256,
          ),
        }),
      /unexpected files: foreign/,
    );
    assert.equal(existsSync(journalPath), true);
    assert.equal(
      evidencePaths.every((path) => existsSync(path)),
      true,
      "known transaction evidence must remain untouched",
    );
    assert.equal(
      existsSync(join(dataPath, "foreign")),
      true,
      "foreign evidence must remain untouched",
    );
    assert.equal(readFileSync(join(root, existingPath), "utf8"), oldContent);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("schema accepts every sealed artifact including a durable transaction journal", async () => {
  const root = mkdtempSync(join(tmpdir(), "corpus-rebaseline-schema-"));
  try {
    const schema = JSON.parse(
      readFileSync(
        join(
          process.cwd(),
          "knowledge/schema/corpus-pre-live-rebaseline.schema.v1.json",
        ),
        "utf8",
      ),
    );
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    addFormats(ajv);
    const validate = ajv.compile(schema);
    const value = fixture(root);
    assert.equal(validate(value.plan), true, JSON.stringify(validate.errors));
    assert.equal(
      validate(value.manifest),
      true,
      JSON.stringify(validate.errors),
    );
    await assert.rejects(
      commitCorpusPreLiveRebaseline({
        root,
        plan: value.plan,
        acknowledgement: corpusPreLiveRebaselineApplyAcknowledgement(
          value.plan.planSha256,
        ),
        outputs: value.outputs,
        finalManifest: value.manifest,
        revalidateDatabaseObservation: async () => value.observation,
        testFaultInjector: (point) => {
          if (point === "journal_prepared_durable") {
            throw new CorpusPreLiveRebaselineSimulatedCrash("fixture journal");
          }
        },
      }),
      CorpusPreLiveRebaselineSimulatedCrash,
    );
    const journal = JSON.parse(
      readFileSync(
        join(root, CORPUS_PRE_LIVE_REBASELINE_TRANSACTION_JOURNAL_PATH),
        "utf8",
      ),
    );
    assert.equal(validate(journal), true, JSON.stringify(validate.errors));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rebaseline overlays generate an in-memory 1,565-row bootstrap without changing legacy generators", () => {
  const root = mkdtempSync(join(tmpdir(), "corpus-rebaseline-overlay-"));
  const repositoryRoot = process.cwd();
  const registerGeneratorPath = join(
    repositoryRoot,
    "scripts/knowledge/generate-corpus-processing-register.ts",
  );
  const currentStateGeneratorPath = join(
    repositoryRoot,
    "scripts/knowledge/generate-corpus-processing-current-state.ts",
  );
  const registerGeneratorBefore = readFileSync(registerGeneratorPath);
  const currentStateGeneratorBefore = readFileSync(currentStateGeneratorPath);
  try {
    const seed = JSON.parse(
      readFileSync(
        join(repositoryRoot, "research/_status/library-analysis-ledger.jsonl"),
        "utf8",
      ).split("\n")[0]!,
    ) as Record<string, unknown>;
    const rows = Array.from({ length: 1565 }, (_, index) => {
      const id = `rebaseline-test-${index.toString().padStart(4, "0")}`;
      const contentHash = index.toString(16).padStart(64, "0");
      return {
        ...seed,
        sourceKey: `document:${id}`,
        title: `Rebaseline test ${index}`,
        canonicalPath: null,
        contentHash,
        currentContentHash: contentHash,
        linkedDocumentId: id,
      };
    });
    const ledgerContent = `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`;
    const snapshot = buildLiveInventorySnapshot({
      liveRows: rows.map((row) => ({
        sourceKind: String((row as Record<string, unknown>).sourceKind),
        sourceKey: String(row.sourceKey),
        contentHash: String(row.contentHash),
      })),
      ledgerContent,
      observedAt,
    });
    const oldBaseline = JSON.parse(
      readFileSync(
        join(repositoryRoot, CORPUS_PROCESSING_BASELINE_PATH),
        "utf8",
      ),
    ) as Record<string, unknown>;
    const baseline = {
      ...oldBaseline,
      observedAt,
      expectedActiveRows: 1565,
      authoritativeInventorySnapshot: {
        path: LIVE_INVENTORY_SNAPSHOT_PATH,
        snapshotId: snapshot.snapshotId,
        observedAt,
        activeRows: snapshot.activeRows,
        identityContentSetSha256: snapshot.identityContentSetSha256,
        sourceKindCountsSha256: snapshot.sourceKindCountsSha256,
        ledgerSha256: snapshot.ledger.sha256,
      },
    };
    const baselineContent = `${JSON.stringify(baseline, null, 2)}\n`;
    const snapshotContent = `${JSON.stringify(snapshot, null, 2)}\n`;
    write(root, CORPUS_PROCESSING_BASELINE_PATH, baselineContent);
    write(root, LIVE_INVENTORY_SNAPSHOT_PATH, snapshotContent);
    write(root, CORPUS_PROCESSING_LEDGER_PATH, ledgerContent);
    write(
      root,
      "knowledge/corpus/corpus-private-recovery-candidates.v1.json",
      `${JSON.stringify({
        schemaVersion: "1.0.0",
        registerId: "corpus-private-recovery-candidates.v1",
        captureRecordedOn: "2026-08-02",
        purpose: "Empty rebaseline overlay fixture.",
        storageVerificationContract: {
          requiredCopies: ["private_primary", "bigbrain_private_replica"],
          bothCopiesSha256MatchCandidate: true,
          bothCopiesSizeBytesMatchCandidate: true,
          bothCopiesFileMode: "0400",
          verificationRecordedOn: "2026-08-02",
        },
        candidates: [],
      })}\n`,
    );
    const dependencyPaths = [
      "src/lib/library-analysis-retained-history-contract.ts",
      "src/lib/knowledge/corpus-processing-lifecycle.ts",
      "src/lib/knowledge/corpus-processing-event-history.ts",
      "src/lib/knowledge/corpus-processing-current-state.ts",
      "src/lib/knowledge/pdf-page-extraction-qualification.ts",
      "src/lib/knowledge/source-analysis-input-manifest.ts",
      "src/lib/knowledge/source-acquisition-receipt.ts",
      "src/lib/knowledge/source-identity-verification.ts",
      "src/lib/knowledge/source-analysis-artifact.ts",
      "knowledge/schema/corpus-processing-lifecycle.schema.v1.json",
      "knowledge/schema/corpus-processing-event-history-anchor.schema.v1.json",
      "knowledge/schema/corpus-processing-state-event.schema.v1.json",
      "knowledge/schema/corpus-processing-current-state.schema.v1.json",
      "knowledge/schema/corpus-ready-for-owner-package.schema.v1.json",
      "knowledge/schema/source-acquisition-receipt.schema.v1.json",
      "scripts/knowledge/generate-corpus-processing-register.ts",
      "scripts/knowledge/generate-corpus-processing-current-state.ts",
      "scripts/knowledge/build-corpus-pre-live-rebaseline-overlays.ts",
    ];
    for (const path of dependencyPaths) {
      write(root, path, readFileSync(join(repositoryRoot, path), "utf8"));
    }
    const corpus = buildCorpusProcessingRebaselineArtifacts({
      root,
      baselineContent,
      liveSnapshotContent: snapshotContent,
      ledgerContent,
    });
    assert.equal(corpus.rows.length, 1565);
    const corpusBundle = new Map(
      corpus.bundle.map((item) => [item.path, item.content]),
    );
    const corpusManifest = JSON.parse(
      corpusBundle.get(CORPUS_PROCESSING_PATHS.generationManifest)!,
    ) as {
      activeCorpusExpectedRows: number;
      inputs: CorpusPreLiveRebaselineFileBinding[];
      rebaselineOverlay: { noReadinessOrCoveragePromotion: boolean };
    };
    assert.equal(corpusManifest.activeCorpusExpectedRows, 1565);
    assert.deepEqual(
      corpusManifest.inputs.find(
        (item) => item.path === CORPUS_PROCESSING_BASELINE_PATH,
      ),
      corpusPreLiveRebaselineFileBinding(
        CORPUS_PROCESSING_BASELINE_PATH,
        baselineContent,
      ),
    );
    assert.equal(
      corpusManifest.rebaselineOverlay.noReadinessOrCoveragePromotion,
      true,
    );
    const eventBootstrap = buildEmptyCorpusStateRebaselineBootstrap(observedAt);
    const overlays = new Map<string, string>([
      [CORPUS_PROCESSING_BASELINE_PATH, baselineContent],
      ...corpus.bundle.map((item) => [item.path, item.content] as const),
      ...eventBootstrap.bundle.map(
        (item) => [item.path, item.content] as const,
      ),
    ]);
    const current = buildCorpusCurrentStateRebaselineArtifacts({
      root,
      overlays,
    });
    assert.equal(current.states.length, 1565);
    assert.equal(current.events.length, 0);
    assert.equal(current.eventHistory.currentCheckpointTrusted, false);
    const registerContent = corpusBundle.get(CORPUS_PROCESSING_PATHS.register)!;
    const currentStateContent = current.bundle.find(
      (item) => item.path === CORPUS_CURRENT_STATE_PATHS.currentState,
    )!.content;
    assert.doesNotThrow(() =>
      assertCorpusPreLiveRebaselineNoPromotion(
        registerContent,
        currentStateContent,
      ),
    );
    const promotedCurrentRows = currentStateContent
      .trimEnd()
      .split("\n")
      .map((line) => JSON.parse(line) as Record<string, unknown>);
    const promotedLifecycle = promotedCurrentRows[0]!.lifecycle as Record<
      string,
      unknown
    >;
    promotedLifecycle.coverageStatus = {
      ...(promotedLifecycle.coverageStatus as Record<string, unknown>),
      coveragePromotionAllowed: true,
    };
    assert.throws(
      () =>
        assertCorpusPreLiveRebaselineNoPromotion(
          registerContent,
          `${promotedCurrentRows.map((row) => JSON.stringify(row)).join("\n")}\n`,
        ),
      /attempted lifecycle advancement, readiness, or coverage promotion/,
    );
    const currentManifest = JSON.parse(
      current.bundle.find(
        (item) => item.path === CORPUS_CURRENT_STATE_PATHS.generationManifest,
      )!.content,
    ) as { rebaselineOverlay: { noReadinessOrCoveragePromotion: boolean } };
    assert.equal(
      currentManifest.rebaselineOverlay.noReadinessOrCoveragePromotion,
      true,
    );
    assert.deepEqual(
      readFileSync(registerGeneratorPath),
      registerGeneratorBefore,
    );
    assert.deepEqual(
      readFileSync(currentStateGeneratorPath),
      currentStateGeneratorBefore,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("empty bootstrap has zero events and one unverified genesis candidate", () => {
  const bootstrap = buildEmptyCorpusStateRebaselineBootstrap(observedAt);
  assert.equal(bootstrap.bundle[0]!.content, "");
  assert.equal(bootstrap.manifest.eventCount, 0);
  assert.equal(bootstrap.manifest.initializedAt, observedAt);
  const anchors = bootstrap.bundle[2]!.content.trimEnd()
    .split("\n")
    .map((line) => JSON.parse(line) as Record<string, unknown>);
  assert.equal(anchors.length, 1);
  assert.equal(anchors[0]!.recordType, "history_anchor_candidate");
  assert.equal(anchors[0]!.sequence, 1);
  assert.equal(anchors[0]!.predecessorRecordSha256, null);
  assert.equal(anchors[0]!.verificationState, undefined);
});

test("CLI defaults to read-only planning and makes apply/recovery explicit", () => {
  const env: NodeJS.ProcessEnv = {
    NODE_ENV: "test",
    FOOD_SYSTEMS_PRIVATE_CORPUS_ROOT: "/private/primary",
    FOOD_SYSTEMS_PRIVATE_CORPUS_REPLICA_ROOT: "/private/replica",
  };
  assert.equal(parseCorpusPreLiveRebaselineArgs([], env).mode, "plan");
  assert.throws(
    () => parseCorpusPreLiveRebaselineArgs(["--apply"], env),
    /requires --plan-file and --ack/,
  );
  assert.throws(
    () => parseCorpusPreLiveRebaselineArgs(["--recover"], { NODE_ENV: "test" }),
    /recovery requires --ack/,
  );
  assert.equal(
    parseCorpusPreLiveRebaselineArgs(["--recover", "--ack=fixture"], {
      NODE_ENV: "test",
    }).mode,
    "recover",
  );
  assert.throws(
    () =>
      parseCorpusPreLiveRebaselineArgs(
        ["--recover", "--ack=fixture", "--primary-corpus-root=/unused"],
        { NODE_ENV: "test" },
      ),
    /accepts only --recover and --ack/,
  );
});

test("pre-live inspection refuses event, trust-anchor, and prior-history state", () => {
  const repositoryRoot = process.cwd();
  for (const path of [
    CORPUS_CURRENT_STATE_PATHS.events,
    CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
  ]) {
    const root = preLiveInspectionFixture(repositoryRoot);
    try {
      const target = join(root, path);
      unlinkSync(target);
      const original = readFileSync(join(repositoryRoot, path), "utf8");
      write(
        root,
        path,
        path === CORPUS_CURRENT_STATE_PATHS.events
          ? '{"unexpected":"event"}\n'
          : `${original}{"unexpected":"trusted-or-external-record"}\n`,
      );
      assert.throws(
        () => inspectPreLiveBootstrap(root),
        /binding drifted|event history|unverified genesis candidate/,
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
  const historyRoot = mkdtempSync(
    join(tmpdir(), "corpus-rebaseline-existing-history-"),
  );
  try {
    write(historyRoot, CORPUS_PRE_LIVE_REBASELINE_HISTORY_PATH, "{}\n");
    assert.throws(
      () => inspectPreLiveBootstrap(historyRoot),
      /history or interrupted transaction already exists/,
    );
  } finally {
    rmSync(historyRoot, { recursive: true, force: true });
  }
  const orphanDataRoot = mkdtempSync(
    join(tmpdir(), "corpus-rebaseline-orphan-data-"),
  );
  try {
    mkdirSync(
      join(orphanDataRoot, CORPUS_PRE_LIVE_REBASELINE_TRANSACTION_DATA_PATH),
      { recursive: true },
    );
    assert.throws(
      () => inspectPreLiveBootstrap(orphanDataRoot),
      /history or interrupted transaction already exists/,
    );
  } finally {
    rmSync(orphanDataRoot, { recursive: true, force: true });
  }
});
