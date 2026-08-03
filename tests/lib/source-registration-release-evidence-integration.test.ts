import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  linkSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_FILE_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_TARGET_SET_SHA256,
  type SourceRegistrationApplyCodeBindings,
} from "../../src/lib/knowledge/source-registration-apply";
import {
  sealSourceRegistrationLogicalCloneRehearsalReceipt,
  sealSourceRegistrationLogicalComparisonProof,
  sourceRegistrationLogicalCloneRehearsalOperationKey,
} from "../../src/lib/knowledge/source-registration-logical-clone-rehearsal";
import { canonicalSourceRegistrationJson } from "../../src/lib/knowledge/source-registration-plan";
import {
  LOGICAL_RESTORE_COMPANION_CANONICAL_JSON,
  LOGICAL_RESTORE_COMPANION_CLEANUP_POLICY,
  LOGICAL_RESTORE_COMPANION_CLONE_CLASS,
  LOGICAL_RESTORE_COMPANION_CLONE_LABEL,
  LOGICAL_RESTORE_COMPANION_EVIDENCE_CLASS,
  LOGICAL_RESTORE_COMPANION_LIMITATION,
  LOGICAL_RESTORE_COMPANION_OWNERSHIP_CLASS,
  LOGICAL_RESTORE_COMPANION_RECEIPT_FORMAT,
  LOGICAL_RESTORE_COMPANION_SCOPE,
  LOGICAL_RESTORE_COMPANION_SEMANTIC,
  LOGICAL_RESTORE_REHEARSAL_ARTIFACT_TYPE,
  LOGICAL_RESTORE_REHEARSAL_SCHEMA_VERSION,
  LOGICAL_RESTORE_REHEARSAL_TARGET_CLASS,
  canonicalLogicalRestoreCompanionJson,
} from "../../scripts/knowledge/logical-restore-companion-receipt.mjs";
import {
  parseSourceRegistrationApplyArgs,
  runSourceRegistrationApply,
  verifySourceRegistrationLogicalRestoreEvidence,
} from "../../scripts/knowledge/apply-source-registration-plan";

const projectRoot = realpathSync(process.cwd());
const now = new Date("2026-08-03T03:12:00.000Z");
const timestamp = (minute: number) =>
  `2026-08-03T03:${minute.toString().padStart(2, "0")}:00.000Z`;
const sha256 = (value: string | Buffer) =>
  createHash("sha256").update(value).digest("hex");
const hash = (label: string) => sha256(`release-evidence-test:${label}`);
const fileBinding = (path: string, label: string) => ({
  path,
  fileSha256: hash(label),
});
const verifyReleaseEvidenceBaseArguments = [
  "--verify-release-evidence",
  "--primary-corpus-root=/private/test-primary",
  "--replica-corpus-root=/private/test-replica",
  "--backup-file=/private/test-backup.dump",
  "--structural-restore-receipt=/private/test-structural.json",
  "--logical-restore-companion-receipt=/private/test-companion.json",
  "--logical-clone-rehearsal-receipt=/private/test-rehearsal.json",
] as const;
const verifyReleaseEvidencePinArguments = [
  `--expected-backup-sha256=${hash("pin-backup")}`,
  "--expected-backup-bytes=29494452",
  `--expected-backup-metadata-sha256=${hash("pin-metadata")}`,
  `--expected-structural-restore-receipt-sha256=${hash("pin-structural")}`,
  `--expected-logical-restore-companion-receipt-sha256=${hash("pin-companion")}`,
  `--expected-logical-clone-rehearsal-receipt-file-sha256=${hash("pin-rehearsal-file")}`,
  `--expected-logical-clone-rehearsal-receipt-self-sha256=${hash("pin-rehearsal-self")}`,
  `--expected-logical-comparison-proof-sha256=${hash("pin-proof")}`,
  `--expected-migration-ledger-sha256=${hash("pin-ledger")}`,
  `--expected-target-fingerprint-sha256=${hash("pin-fingerprint")}`,
] as const;

const companionSchemaPath = join(
  projectRoot,
  "knowledge/schema/database-logical-restore-companion-receipt.schema.v1.json",
);
const rehearsalSchemaPath = join(
  projectRoot,
  "knowledge/schema/source-registration-logical-clone-rehearsal-receipt.schema.v1.json",
);

function makeCodeBindings(): SourceRegistrationApplyCodeBindings {
  const launcher = fileBinding(
    "scripts/knowledge/launch-locked-source-registration-apply.mjs",
    "launcher",
  );
  return {
    runtime: fileBinding(
      "src/lib/knowledge/source-registration-apply.ts",
      "apply-runtime",
    ),
    runner: fileBinding(
      "scripts/knowledge/apply-source-registration-plan.ts",
      "apply-runner",
    ),
    launcher,
    logicalCloneRehearsalRuntime: fileBinding(
      "src/lib/knowledge/source-registration-logical-clone-rehearsal.ts",
      "rehearsal-runtime",
    ),
    logicalCloneRehearsalJsonSchema: {
      path: "knowledge/schema/source-registration-logical-clone-rehearsal-receipt.schema.v1.json",
      fileSha256: sha256(readFileSync(rehearsalSchemaPath)),
    },
    logicalCloneRehearsalTest: fileBinding(
      "tests/lib/source-registration-logical-clone-rehearsal.test.ts",
      "rehearsal-test",
    ),
    logicalCloneRehearsalCommandRunner: fileBinding(
      "scripts/knowledge/run-source-registration-logical-clone-rehearsal.ts",
      "rehearsal-command-runner",
    ),
    logicalRestoreCompanionValidator: fileBinding(
      "scripts/knowledge/logical-restore-companion-receipt.mjs",
      "companion-validator",
    ),
    logicalRestoreCompanionJsonSchema: {
      path: "knowledge/schema/database-logical-restore-companion-receipt.schema.v1.json",
      fileSha256: sha256(readFileSync(companionSchemaPath)),
    },
    controlledLogicalRestoreCompanionRunner: fileBinding(
      "scripts/knowledge/run-controlled-logical-restore-companion.mjs",
      "companion-runner",
    ),
    databaseLogicalStateDigest: fileBinding(
      "scripts/knowledge/database-logical-state-digest.mjs",
      "logical-digest",
    ),
    backupVerifier: fileBinding(
      "scripts/verify-database-backup.sh",
      "backup-verifier",
    ),
    backupContractHelper: fileBinding(
      "scripts/database-backup-contract.mjs",
      "backup-contract-helper",
    ),
    restoreRunner: fileBinding(
      "scripts/restore-database-backup-drill.sh",
      "restore-runner",
    ),
    runtimeEnvironment: {
      schemaVersion: "source-registration-runtime-attestation-v1",
      launcher,
      localClosure: {
        closureSha256: hash("local-runtime-closure"),
        entryCount: 7,
        roots: [
          "scripts/knowledge/apply-source-registration-plan.ts",
          "scripts/knowledge/run-source-registration-logical-clone-rehearsal.ts",
          "scripts/knowledge/launch-locked-source-registration-apply.mjs",
          "scripts/knowledge/database-logical-state-digest.mjs",
          "scripts/knowledge/verify-psql-runtime-closure.mjs",
          "scripts/knowledge/verify-node-runtime-closure.mjs",
          "scripts/knowledge/generate-source-registration-plan.ts",
        ],
        totalFileBytes: 1,
      },
      node: {
        arch: "arm64",
        binaryFileSha256: hash("node-binary"),
        platform: "darwin",
        runtimeClosureManifestSha256: hash("node-manifest"),
        runtimeClosureSha256: hash("node-runtime-closure"),
        runtimeClosureVerifierFileSha256: hash("node-verifier"),
        version: "v24.4.1",
      },
      nodeModules: {
        entryCount: 2,
        fileCount: 1,
        path: "node_modules",
        rootKind: "resolved_external_symlink",
        symlinkCount: 0,
        totalFileBytes: 1,
        treeSha256: hash("node-modules-tree"),
      },
      prismaGeneratedClient: {
        entryCount: 2,
        fileCount: 1,
        path: "src/generated/prisma",
        rootKind: "resolved_external_symlink",
        symlinkCount: 0,
        totalFileBytes: 1,
        treeSha256: hash("prisma-tree"),
      },
      psql: {
        binaryFileSha256: hash("psql-binary"),
        runtimeClosureManifestSha256: hash("psql-manifest"),
        runtimeClosureSha256: hash("psql-runtime-closure"),
        runtimeClosureVerifierFileSha256: hash("psql-verifier"),
        version: "psql (PostgreSQL) 16.13",
      },
      runtimeAttestationSha256: hash("runtime-attestation"),
    },
  } as unknown as SourceRegistrationApplyCodeBindings;
}

const codeBindings = makeCodeBindings();
const backup = {
  dumpSha256: hash("backup-dump"),
  dumpBytes: 29_494_452,
  metadataSha256: hash("backup-metadata"),
  metadataCreatedAtUtc: timestamp(0),
  targetFingerprintSha256: hash("target-fingerprint"),
};
const structuralRestore = {
  receiptSha256: hash("structural-restore-receipt"),
  completedAtUtc: timestamp(5),
};

type ArtifactPair = ReturnType<typeof writeArtifactPair>;

function writePrivateFile(path: string, bytes: string): void {
  writeFileSync(path, bytes, { encoding: "utf8", flag: "wx", mode: 0o400 });
  chmodSync(path, 0o400);
}

function rewritePrivateFile(path: string, bytes: string): void {
  chmodSync(path, 0o600);
  writeFileSync(path, bytes, { encoding: "utf8", flag: "w" });
  chmodSync(path, 0o400);
}

function companionDigest(
  state: {
    contentStateSha256: string;
    logicalStateSha256: string;
    relationCount: number;
    totalRowCount: number;
    sequenceRowCount: number;
  },
  psqlFileSha256: string,
) {
  return {
    contentStateSha256: state.contentStateSha256,
    logicalStateSha256: state.logicalStateSha256,
    psqlFileSha256,
    relationCount: state.relationCount,
    sequenceCount: state.sequenceRowCount,
    totalRowCount: state.totalRowCount,
  };
}

function writeArtifactPair(privateRoot: string, variant: string) {
  const runtime = codeBindings.runtimeEnvironment;
  const source = {
    contentStateSha256: hash(`content:${variant}`),
    logicalStateSha256: hash(`source-logical:${variant}`),
    relationCount: 56,
    totalRowCount: 555_189,
    sequenceRowCount: 5,
  };
  const restored = {
    ...source,
    logicalStateSha256: hash(`restored-logical:${variant}`),
  };
  const logicalComparisonProof = sealSourceRegistrationLogicalComparisonProof({
    schemaVersion: "source-registration-logical-comparison-proof-v1",
    backupSha256: backup.dumpSha256,
    backupMetadataSha256: backup.metadataSha256,
    structuralRestoreReceiptSha256: structuralRestore.receiptSha256,
    source,
    restored,
    contentStateAndCountsMatch: true,
    targetBoundLogicalStatesDiffer: true,
  });
  const operationKey = sourceRegistrationLogicalCloneRehearsalOperationKey({
    planSha256: SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256,
    targetSetSha256: SOURCE_REGISTRATION_APPLY_LOCKED_TARGET_SET_SHA256,
    applyRunnerSha256: codeBindings.runner.fileSha256,
    rehearsalRuntimeSha256:
      codeBindings.logicalCloneRehearsalRuntime.fileSha256,
    rehearsalSchemaSha256:
      codeBindings.logicalCloneRehearsalJsonSchema.fileSha256,
    rehearsalTestSha256: codeBindings.logicalCloneRehearsalTest.fileSha256,
    rehearsalCommandRunnerSha256:
      codeBindings.logicalCloneRehearsalCommandRunner.fileSha256,
    runtimeAttestationSha256: runtime.runtimeAttestationSha256,
    logicalComparisonProofSha256:
      logicalComparisonProof.logicalComparisonProofSha256,
  });
  const counts = {
    documents: 1_539,
    libraryAnalysisRecords: 1_572,
    controlledMutationAudits: 0,
  };
  const rehearsal = sealSourceRegistrationLogicalCloneRehearsalReceipt({
    schemaVersion: "source-registration-logical-clone-rehearsal-v1",
    artifactType:
      "source_registration_logical_clone_surrogate_rehearsal_receipt",
    targetClass: "logical_clone_surrogate",
    exactProductionTargetExercised: false,
    firstExactMutationRemainsLive: true,
    productionAuthorizationUsed: false,
    planSha256: SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256,
    planFileSha256: SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_FILE_SHA256,
    targetSetSha256: SOURCE_REGISTRATION_APPLY_LOCKED_TARGET_SET_SHA256,
    applyRunnerSha256: codeBindings.runner.fileSha256,
    rehearsalRuntimeSha256:
      codeBindings.logicalCloneRehearsalRuntime.fileSha256,
    rehearsalSchemaSha256:
      codeBindings.logicalCloneRehearsalJsonSchema.fileSha256,
    rehearsalTestSha256: codeBindings.logicalCloneRehearsalTest.fileSha256,
    rehearsalCommandRunnerSha256:
      codeBindings.logicalCloneRehearsalCommandRunner.fileSha256,
    executedRuntime: {
      runtimeAttestationSha256: runtime.runtimeAttestationSha256,
      launcherFileSha256: codeBindings.launcher.fileSha256,
      nodeBinaryFileSha256: runtime.node.binaryFileSha256,
      nodeRuntimeClosureSha256: runtime.node.runtimeClosureSha256,
      nodeVersion: runtime.node.version,
      nodePlatform: runtime.node.platform,
      nodeArch: runtime.node.arch,
      nodeModulesTreeSha256: runtime.nodeModules.treeSha256,
      prismaGeneratedClientTreeSha256: runtime.prismaGeneratedClient.treeSha256,
      localRuntimeClosureSha256: runtime.localClosure.closureSha256,
    },
    logicalComparisonProof,
    operationKey,
    rehearsalStartedAtUtc: timestamp(8),
    rehearsalCompletedAtUtc: timestamp(9),
    beforeCounts: counts,
    insideTransaction: {
      isolationLevel: "Serializable",
      documentCreates: 10,
      libraryAnalysisRecordCreates: 10,
      controlledMutationAuditCreates: 1,
      exactDocumentRows: 10,
      exactLibraryAnalysisRows: 10,
      dependencyRowCount: 0,
      physicalDocumentRowsSha256: hash(`physical-rows:${variant}`),
      libraryAnalysisRowsSha256: hash(`analysis-rows:${variant}`),
      rehearsalAuditSummarySha256: hash(`audit-summary:${variant}`),
    },
    rollback: {
      forcedBySentinel: true,
      transactionRolledBack: true,
      rollbackAbsenceConfirmed: true,
      afterCountsEqualBeforeCounts: true,
      targetRowsAbsentAfterRollback: true,
      rehearsalAuditAbsentAfterRollback: true,
    },
    afterRollbackCounts: counts,
    cloneDatabaseNameStored: false,
    privateAbsolutePathStored: false,
    databaseCredentialStored: false,
  });
  const rehearsalBytes = `${canonicalSourceRegistrationJson(rehearsal)}\n`;
  const rehearsalPath = join(privateRoot, `${variant}-rehearsal.json`);
  writePrivateFile(rehearsalPath, rehearsalBytes);
  const rehearsalFileSha256 = sha256(rehearsalBytes);

  const companion = {
    format: LOGICAL_RESTORE_COMPANION_RECEIPT_FORMAT,
    version: 1,
    canonicalJsonFormat: LOGICAL_RESTORE_COMPANION_CANONICAL_JSON,
    evidenceClass: LOGICAL_RESTORE_COMPANION_EVIDENCE_CLASS,
    completedAtUtc: timestamp(11),
    backup: {
      dumpBytes: backup.dumpBytes,
      dumpSha256: backup.dumpSha256,
      metadataCreatedAtUtc: backup.metadataCreatedAtUtc,
      metadataFormat: "foodsystems-database-backup-metadata",
      metadataSha256: backup.metadataSha256,
      metadataVersion: 2,
      targetDatabaseFingerprintSha256: backup.targetFingerprintSha256,
    },
    structuralRestore: {
      completedAtUtc: structuralRestore.completedAtUtc,
      receiptFormat: "foodsystems-database-restore-receipt",
      receiptSha256: structuralRestore.receiptSha256,
      receiptVersion: 1,
    },
    comparison: {
      startedAtUtc: timestamp(6),
      completedAtUtc: timestamp(7),
      source: companionDigest(source, runtime.psql.binaryFileSha256),
      restored: companionDigest(restored, runtime.psql.binaryFileSha256),
      contentStateEqual: true,
      logicalStateEqual: false,
      logicalComparisonProofSha256:
        logicalComparisonProof.logicalComparisonProofSha256,
      postRehearsalClone: companionDigest(
        restored,
        runtime.psql.binaryFileSha256,
      ),
      postRehearsalCloneFullStateMatched: true,
      postRehearsalSource: companionDigest(
        source,
        runtime.psql.binaryFileSha256,
      ),
      postRehearsalVerifiedAtUtc: timestamp(10),
      relationCountEqual: true,
      totalRowCountEqual: true,
      sequenceCountEqual: true,
      semantic: LOGICAL_RESTORE_COMPANION_SEMANTIC,
      sourceStillMatched: true,
    },
    logicalCloneRehearsal: {
      applyRunnerSha256: rehearsal.applyRunnerSha256,
      artifactType: LOGICAL_RESTORE_REHEARSAL_ARTIFACT_TYPE,
      canonicalJsonFormat: LOGICAL_RESTORE_COMPANION_CANONICAL_JSON,
      exactProductionTargetExercised: rehearsal.exactProductionTargetExercised,
      executedRuntime: rehearsal.executedRuntime,
      firstExactMutationRemainsLive: rehearsal.firstExactMutationRemainsLive,
      logicalCloneContentStateSha256:
        rehearsal.logicalComparisonProof.restored.contentStateSha256,
      logicalComparisonProofSha256:
        rehearsal.logicalComparisonProof.logicalComparisonProofSha256,
      operationKey: rehearsal.operationKey,
      planFileSha256: rehearsal.planFileSha256,
      planSha256: rehearsal.planSha256,
      privateReceiptStoredOutsideRepo: true,
      productionAuthorizationUsed: rehearsal.productionAuthorizationUsed,
      receiptFileSha256: rehearsalFileSha256,
      receiptSelfSha256: rehearsal.receiptSha256,
      rehearsalCommandRunnerSha256: rehearsal.rehearsalCommandRunnerSha256,
      rehearsalCompletedAtUtc: rehearsal.rehearsalCompletedAtUtc,
      rehearsalRuntimeSha256: rehearsal.rehearsalRuntimeSha256,
      rehearsalSchemaSha256: rehearsal.rehearsalSchemaSha256,
      rehearsalStartedAtUtc: rehearsal.rehearsalStartedAtUtc,
      rehearsalTestSha256: rehearsal.rehearsalTestSha256,
      rollback: rehearsal.rollback,
      schemaVersion: LOGICAL_RESTORE_REHEARSAL_SCHEMA_VERSION,
      runtimeAttestationSha256:
        rehearsal.executedRuntime.runtimeAttestationSha256,
      targetClass: LOGICAL_RESTORE_REHEARSAL_TARGET_CLASS,
      targetSetSha256: rehearsal.targetSetSha256,
    },
    clone: {
      nameClass: LOGICAL_RESTORE_COMPANION_CLONE_CLASS,
      label: LOGICAL_RESTORE_COMPANION_CLONE_LABEL,
      nameSha256: hash(`clone-name:${variant}`),
      ownershipMarkerClass: LOGICAL_RESTORE_COMPANION_OWNERSHIP_CLASS,
      ownershipMarkerSha256: hash(`clone-owner:${variant}`),
      createdFresh: true,
      preexistingDatabaseRefused: true,
    },
    cleanup: {
      policy: LOGICAL_RESTORE_COMPANION_CLEANUP_POLICY,
      drop: "pass",
      databaseAbsenceConfirmed: true,
      ownershipMarkerVerifiedBeforeDrop: true,
      completedAtUtc: timestamp(11),
    },
    tools: {
      contextBindings: {
        backupContractHelperSha256:
          codeBindings.backupContractHelper.fileSha256,
        backupVerifierSha256: codeBindings.backupVerifier.fileSha256,
        companionReceiptSchemaSha256:
          codeBindings.logicalRestoreCompanionJsonSchema.fileSha256,
        sourceRegistrationLogicalCloneRehearsalTestSha256:
          codeBindings.logicalCloneRehearsalTest.fileSha256,
        structuralRestoreRunnerSha256: codeBindings.restoreRunner.fileSha256,
      },
      executedTools: {
        companionReceiptValidatorSha256:
          codeBindings.logicalRestoreCompanionValidator.fileSha256,
        companionRunnerSha256:
          codeBindings.controlledLogicalRestoreCompanionRunner.fileSha256,
        createdbBinarySha256: hash("createdb-binary"),
        databaseLogicalDigestSha256:
          codeBindings.databaseLogicalStateDigest.fileSha256,
        dropdbBinarySha256: hash("dropdb-binary"),
        pgRestoreBinarySha256: hash("pg-restore-binary"),
        psqlBinarySha256: runtime.psql.binaryFileSha256,
        psqlRuntimeClosureSha256: runtime.psql.runtimeClosureSha256,
        psqlRuntimeManifestSha256: runtime.psql.runtimeClosureManifestSha256,
        psqlRuntimeVerifierSha256:
          runtime.psql.runtimeClosureVerifierFileSha256,
        sourceRegistrationApplyRunnerSha256: codeBindings.runner.fileSha256,
        sourceRegistrationApplyRuntimeSha256: codeBindings.runtime.fileSha256,
        sourceRegistrationLauncherSha256: codeBindings.launcher.fileSha256,
        sourceRegistrationLocalRuntimeClosureSha256:
          runtime.localClosure.closureSha256,
        sourceRegistrationLogicalCloneRehearsalRuntimeSha256:
          codeBindings.logicalCloneRehearsalRuntime.fileSha256,
        sourceRegistrationLogicalCloneRehearsalSchemaSha256:
          codeBindings.logicalCloneRehearsalJsonSchema.fileSha256,
        sourceRegistrationLogicalCloneRehearsalCommandRunnerSha256:
          codeBindings.logicalCloneRehearsalCommandRunner.fileSha256,
        sourceRegistrationNodeBinarySha256: runtime.node.binaryFileSha256,
        sourceRegistrationNodeModulesTreeSha256: runtime.nodeModules.treeSha256,
        sourceRegistrationNodeRuntimeClosureSha256:
          runtime.node.runtimeClosureSha256,
        sourceRegistrationNodeRuntimeManifestSha256:
          runtime.node.runtimeClosureManifestSha256,
        sourceRegistrationNodeRuntimeVerifierSha256:
          runtime.node.runtimeClosureVerifierFileSha256,
        sourceRegistrationPrismaGeneratedClientTreeSha256:
          runtime.prismaGeneratedClient.treeSha256,
        sourceRegistrationRuntimeAttestationSha256:
          runtime.runtimeAttestationSha256,
      },
    },
    limitations: {
      evidenceScope: LOGICAL_RESTORE_COMPANION_SCOPE,
      productionTargetExecution: false,
      exactProductionTargetExecutionClaimed: false,
      statement: LOGICAL_RESTORE_COMPANION_LIMITATION,
    },
  };
  const companionBytes = `${canonicalLogicalRestoreCompanionJson(companion)}\n`;
  const companionPath = join(privateRoot, `${variant}-companion.json`);
  writePrivateFile(companionPath, companionBytes);

  return {
    companion,
    companionPath,
    companionFileSha256: sha256(companionBytes),
    logicalComparisonProof,
    rehearsal,
    rehearsalPath,
    rehearsalFileSha256,
  };
}

function makePrivateRoot(): string {
  const root = realpathSync(
    mkdtempSync(join(realpathSync(tmpdir()), "source-release-evidence-")),
  );
  chmodSync(root, 0o700);
  return root;
}

function verifyPair(
  pair: ArtifactPair,
  overrides: Partial<
    Parameters<typeof verifySourceRegistrationLogicalRestoreEvidence>[0]
  > = {},
) {
  return verifySourceRegistrationLogicalRestoreEvidence({
    projectRoot,
    companionReceiptPath: pair.companionPath,
    rehearsalReceiptPath: pair.rehearsalPath,
    codeBindings,
    now,
    backup,
    structuralRestore,
    expectedCompanionReceiptFileSha256: pair.companionFileSha256,
    expectedRehearsalReceiptFileSha256: pair.rehearsalFileSha256,
    expectedRehearsalReceiptSelfSha256: pair.rehearsal.receiptSha256,
    expectedLogicalComparisonProofSha256:
      pair.logicalComparisonProof.logicalComparisonProofSha256,
    ...overrides,
  });
}

test("logical restore evidence joins canonical companion and nested rehearsal projections", () => {
  const privateRoot = makePrivateRoot();
  try {
    const pair = writeArtifactPair(privateRoot, "joined");
    const evidence = verifyPair(pair);
    assert.deepEqual(evidence.logicalRestoreCompanion.source, {
      contentStateSha256: pair.logicalComparisonProof.source.contentStateSha256,
      logicalStateSha256: pair.logicalComparisonProof.source.logicalStateSha256,
      relationCount: 56,
      totalRowCount: 555_189,
      sequenceRowCount: 5,
    });
    assert.deepEqual(evidence.logicalRestoreCompanion.restored, {
      contentStateSha256:
        pair.logicalComparisonProof.restored.contentStateSha256,
      logicalStateSha256:
        pair.logicalComparisonProof.restored.logicalStateSha256,
      relationCount: 56,
      totalRowCount: 555_189,
      sequenceRowCount: 5,
    });
    assert.equal(
      evidence.logicalRestoreCompanion.logicalComparisonProofSha256,
      pair.logicalComparisonProof.logicalComparisonProofSha256,
    );
    assert.equal(
      evidence.logicalCloneRehearsal.receiptFileSha256,
      pair.rehearsalFileSha256,
    );
    assert.equal(
      evidence.logicalCloneRehearsal.receiptSelfSha256,
      pair.rehearsal.receiptSha256,
    );
    assert.equal(
      evidence.logicalCloneRehearsal.operationKey,
      pair.rehearsal.operationKey,
    );
    assert.equal(evidence.logicalCloneRehearsal.transactionRolledBack, true);
    assert.equal(
      evidence.logicalRestoreCompanion.cloneDatabaseAbsenceConfirmed,
      true,
    );
  } finally {
    rmSync(privateRoot, { recursive: true, force: true });
  }
});

test("every explicit companion, rehearsal, self-hash, and proof pin fails closed", () => {
  const privateRoot = makePrivateRoot();
  try {
    const pair = writeArtifactPair(privateRoot, "pins");
    const cases: Array<
      [
        Partial<
          Parameters<typeof verifySourceRegistrationLogicalRestoreEvidence>[0]
        >,
        RegExp,
      ]
    > = [
      [
        { expectedCompanionReceiptFileSha256: hash("wrong-companion-pin") },
        /companion receipt file SHA-256 differs from its explicit pin/,
      ],
      [
        { expectedRehearsalReceiptFileSha256: hash("wrong-rehearsal-pin") },
        /rehearsal receipt file SHA-256 differs from its explicit pin/,
      ],
      [
        { expectedRehearsalReceiptSelfSha256: hash("wrong-self-pin") },
        /rehearsal receipt self SHA-256 differs from its explicit pin/,
      ],
      [
        { expectedLogicalComparisonProofSha256: hash("wrong-proof-pin") },
        /logical-comparison proof SHA-256 differs from its explicit pin/,
      ],
    ];
    for (const [override, expected] of cases) {
      assert.throws(() => verifyPair(pair, override), expected);
    }
  } finally {
    rmSync(privateRoot, { recursive: true, force: true });
  }
});

test("swapped valid artifacts and a mutated companion projection are rejected", () => {
  const privateRoot = makePrivateRoot();
  try {
    const first = writeArtifactPair(privateRoot, "first");
    const second = writeArtifactPair(privateRoot, "second");
    assert.throws(
      () =>
        verifySourceRegistrationLogicalRestoreEvidence({
          projectRoot,
          companionReceiptPath: first.companionPath,
          rehearsalReceiptPath: second.rehearsalPath,
          codeBindings,
          now,
          backup,
          structuralRestore,
          expectedCompanionReceiptFileSha256: first.companionFileSha256,
          expectedRehearsalReceiptFileSha256: second.rehearsalFileSha256,
          expectedRehearsalReceiptSelfSha256: second.rehearsal.receiptSha256,
          expectedLogicalComparisonProofSha256:
            second.logicalComparisonProof.logicalComparisonProofSha256,
        }),
      /logical-comparison proof differs across companion and rehearsal/,
    );

    const changedCompanion = structuredClone(first.companion);
    changedCompanion.logicalCloneRehearsal.receiptSelfSha256 = hash(
      "mutated-projected-self-hash",
    );
    const changedBytes = `${canonicalLogicalRestoreCompanionJson(
      changedCompanion,
    )}\n`;
    rewritePrivateFile(first.companionPath, changedBytes);
    assert.throws(
      () =>
        verifyPair(first, {
          expectedCompanionReceiptFileSha256: sha256(changedBytes),
        }),
      /logical-clone rehearsal file differs from companion binding/,
    );
  } finally {
    rmSync(privateRoot, { recursive: true, force: true });
  }
});

test("private evidence rejects wrong mode, link count, parent mode, and project-local path", () => {
  const privateRoot = makePrivateRoot();
  let projectLocalRoot: string | undefined;
  try {
    const pair = writeArtifactPair(privateRoot, "storage");

    chmodSync(pair.rehearsalPath, 0o600);
    assert.throws(() => verifyPair(pair), /mode-0400 regular single-link file/);
    chmodSync(pair.rehearsalPath, 0o400);

    const hardLinkPath = join(privateRoot, "companion-hard-link.json");
    linkSync(pair.companionPath, hardLinkPath);
    assert.throws(() => verifyPair(pair), /mode-0400 regular single-link file/);
    unlinkSync(hardLinkPath);

    chmodSync(privateRoot, 0o750);
    assert.throws(
      () => verifyPair(pair),
      /parent must be canonical mode-0700 private storage/,
    );
    chmodSync(privateRoot, 0o700);

    projectLocalRoot = realpathSync(
      mkdtempSync(join(projectRoot, ".source-release-evidence-")),
    );
    chmodSync(projectLocalRoot, 0o700);
    const localCompanionPath = join(projectLocalRoot, "companion.json");
    writePrivateFile(
      localCompanionPath,
      readFileSync(pair.companionPath, "utf8"),
    );
    assert.throws(
      () => verifyPair(pair, { companionReceiptPath: localCompanionPath }),
      /must be canonical and outside the project/,
    );
  } finally {
    if (projectLocalRoot) {
      rmSync(projectLocalRoot, { recursive: true, force: true });
    }
    rmSync(privateRoot, { recursive: true, force: true });
  }
});

test("tracked schema, code, and runtime binding drift fail closed", () => {
  const privateRoot = makePrivateRoot();
  try {
    const pair = writeArtifactPair(privateRoot, "bindings");
    const cases: Array<[SourceRegistrationApplyCodeBindings, RegExp]> = [];

    const schemaDrift = structuredClone(codeBindings);
    schemaDrift.logicalRestoreCompanionJsonSchema.fileSha256 = hash(
      "drifted-companion-schema",
    );
    cases.push([schemaDrift, /companion receipt schema differs/]);

    const runnerDrift = structuredClone(codeBindings);
    runnerDrift.runner.fileSha256 = hash("drifted-apply-runner");
    cases.push([runnerDrift, /apply runner binding differs/]);

    const runtimeDrift = structuredClone(codeBindings);
    runtimeDrift.runtimeEnvironment.node.binaryFileSha256 = hash(
      "drifted-node-binary",
    );
    cases.push([runtimeDrift, /Node binary binding differs/]);

    const attestationDrift = structuredClone(codeBindings);
    attestationDrift.runtimeEnvironment.runtimeAttestationSha256 = hash(
      "drifted-runtime-attestation",
    );
    cases.push([attestationDrift, /runtime attestation binding differs/]);

    for (const [driftedCodeBindings, expected] of cases) {
      assert.throws(
        () => verifyPair(pair, { codeBindings: driftedCodeBindings }),
        expected,
      );
    }
  } finally {
    rmSync(privateRoot, { recursive: true, force: true });
  }
});

test("verify-release-evidence parser requires all ten pins and leaves apply staging unchanged", () => {
  assert.throws(
    () =>
      parseSourceRegistrationApplyArgs([...verifyReleaseEvidenceBaseArguments]),
    /--verify-release-evidence requires --expected-backup-sha256/,
  );

  for (const [
    index,
    missingArgument,
  ] of verifyReleaseEvidencePinArguments.entries()) {
    const partialPins = verifyReleaseEvidencePinArguments.filter(
      (_argument, candidateIndex) => candidateIndex !== index,
    );
    const missingFlag = missingArgument.slice(0, missingArgument.indexOf("="));
    assert.throws(
      () =>
        parseSourceRegistrationApplyArgs([
          ...verifyReleaseEvidenceBaseArguments,
          ...partialPins,
        ]),
      new RegExp(
        `--verify-release-evidence requires ${missingFlag.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&",
        )}`,
      ),
      `${missingFlag} must be mandatory in verify mode`,
    );
  }

  const verified = parseSourceRegistrationApplyArgs([
    ...verifyReleaseEvidenceBaseArguments,
    ...verifyReleaseEvidencePinArguments,
  ]);
  assert.equal(verified.mode, "verify_release_evidence");
  assert.equal(verified.expectedBackupBytes, 29_494_452);
  assert.equal(verified.expectedBackupSha256, hash("pin-backup"));
  assert.equal(
    verified.expectedLogicalCloneRehearsalReceiptSelfSha256,
    hash("pin-rehearsal-self"),
  );
  assert.equal(
    verified.expectedTargetFingerprintSha256,
    hash("pin-fingerprint"),
  );

  assert.throws(
    () =>
      parseSourceRegistrationApplyArgs([
        ...verifyReleaseEvidenceBaseArguments,
        ...verifyReleaseEvidencePinArguments.filter(
          (argument) => !argument.startsWith("--expected-backup-sha256="),
        ),
        "--expected-backup-sha256=not-a-sha256",
      ]),
    /--expected-backup-sha256 must be a lowercase SHA-256/,
  );

  const stagedApply = parseSourceRegistrationApplyArgs([
    "--apply",
    "--primary-corpus-root=/private/test-primary",
    "--replica-corpus-root=/private/test-replica",
  ]);
  assert.equal(stagedApply.mode, "apply");
  assert.equal(stagedApply.expectedBackupSha256, undefined);
});

test("verify-release-evidence process stops on missing or partial pins before environment access", () => {
  const runner = join(
    projectRoot,
    "scripts/knowledge/apply-source-registration-plan.ts",
  );
  const run = (arguments_: readonly string[]) =>
    spawnSync(process.execPath, ["--import=tsx", runner, ...arguments_], {
      cwd: projectRoot,
      encoding: "utf8",
      env: {
        LANG: "C",
        LC_ALL: "C",
        NODE_ENV: "test",
        PATH: process.env.PATH ?? "",
        TZ: "UTC",
      },
    });

  const missing = run(verifyReleaseEvidenceBaseArguments);
  assert.equal(missing.status, 1);
  assert.equal(missing.stdout, "");
  assert.match(
    missing.stderr,
    /--verify-release-evidence requires --expected-backup-sha256/,
  );
  assert.doesNotMatch(missing.stderr, /DATABASE_URL/);

  const partial = run([
    ...verifyReleaseEvidenceBaseArguments,
    ...verifyReleaseEvidencePinArguments.slice(0, -1),
  ]);
  assert.equal(partial.status, 1);
  assert.equal(partial.stdout, "");
  assert.match(
    partial.stderr,
    /--verify-release-evidence requires --expected-target-fingerprint-sha256/,
  );
  assert.doesNotMatch(partial.stderr, /DATABASE_URL/);

  const full = run([
    ...verifyReleaseEvidenceBaseArguments,
    ...verifyReleaseEvidencePinArguments,
  ]);
  assert.equal(full.status, 1);
  assert.equal(full.stdout, "");
  assert.match(full.stderr, /DATABASE_URL is required/);
  assert.doesNotMatch(full.stderr, /--verify-release-evidence requires/);
});

test("exported verify-release-evidence runner cannot bypass the pin gate", async () => {
  await assert.rejects(
    () =>
      runSourceRegistrationApply({
        projectRoot,
        databaseUrl: "postgresql://unused@example.invalid/unused",
        options: {
          mode: "verify_release_evidence",
          manifestPath:
            "knowledge/corpus/source-registration/source-registration-batch-2026-08-02.v1.json",
          primaryCorpusRoot: "/private/test-primary",
          replicaCorpusRoot: "/private/test-replica",
        },
      }),
    /--verify-release-evidence requires --expected-backup-sha256/,
  );
});
