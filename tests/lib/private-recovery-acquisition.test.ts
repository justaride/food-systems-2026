import assert from "node:assert/strict";
import {
  chmodSync,
  linkSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  PRIVATE_RECOVERY_ACQUISITION_APPLY_RECEIPT_PATH,
  PRIVATE_RECOVERY_ACQUISITION_REGISTER_PATH,
  buildPrivateRecoveryAcquisitionPlan,
  privateRecoveryAcquisitionStrongAck,
  privateRecoverySha256,
  serializePrivateRecoveryJson,
  validatePrivateRecoveryAcquisitionApplyReceipt,
  validatePrivateRecoveryAcquisitionPlan,
  validatePrivateRecoveryDatabaseAuditBinding,
  validatePrivateRecoveryRegister,
  type PrivateRecoveryAcquisitionPlan,
  type PrivateRecoveryImplementationBinding,
  type VerifiedPrivateCopyPair,
} from "../../src/lib/knowledge/private-recovery-acquisition";
import {
  SOURCE_REGISTRATION_APPLY_ACK,
  SOURCE_REGISTRATION_APPLY_AI_OPERATOR_ID,
  SOURCE_REGISTRATION_APPLY_DATABASE_CATALOG_SCHEMA_VERSION,
  SOURCE_REGISTRATION_APPLY_DATABASE_CATALOG_SCOPE,
  SOURCE_REGISTRATION_APPLY_DATABASE_ROLE,
  SOURCE_REGISTRATION_APPLY_DATABASE_TARGET_SCHEMA_VERSION,
  SOURCE_REGISTRATION_APPLY_LOCKED_BEFORE_SNAPSHOT_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_CATALOG_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_IDENTITY_UUID,
  SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET,
  SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_FILE_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_NODE_RUNTIME_CLOSURE_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_POSTGRESQL_TOOLSET_RUNTIME_MANIFEST_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_POSTGRESQL_TOOLSET_RUNTIME_VERIFIER_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_TARGET_SET_SHA256,
  SOURCE_REGISTRATION_APPLY_OWNER_SCOPE_AUTHORIZATION_REF,
  buildSourceRegistrationApplyMutationSummary,
  expectedPostApplyCounts,
  sealSourceRegistrationAfterSnapshot,
  sealSourceRegistrationDatabaseTarget,
  sourceRegistrationApplyCodeBindingsSha256,
  sourceRegistrationApplyContractSha256,
  sourceRegistrationApplyDependencyStateSha256,
  sourceRegistrationApplyOperationKey,
  sourceRegistrationApplyTargetSetSha256,
  sourceRegistrationExactOperatorAuthorizationRef,
  sourceRegistrationControlledMutationAudit,
  sourceRegistrationDatabaseFingerprintSha256,
  validateSourceRegistrationApplyAuthorization,
  type SourceRegistrationApplyCodeBindings,
  type SourceRegistrationReleaseEvidence,
} from "../../src/lib/knowledge/source-registration-apply";
import {
  validateSourceRegistrationPlan,
  type SourceRegistrationPlan,
} from "../../src/lib/knowledge/source-registration-plan";
import {
  applyPreparedPrivateRecoveryAcquisitionPlan,
  classifyPrivateRecoveryFilesystemState,
  parsePrivateRecoveryAcquisitionArgs,
  readPrivateRecoveryLeaf,
} from "../../scripts/knowledge/manage-private-recovery-acquisition";

const projectRoot = process.cwd();
const sourcePlanBytes = readFileSync(
  join(
    projectRoot,
    "knowledge/corpus/source-registration/source-registration-dry-run-plan-2026-08-03.v1.json",
  ),
);
const sourcePlan = validateSourceRegistrationPlan(
  JSON.parse(sourcePlanBytes.toString("utf8")),
);
const beforeRegisterBytes = readFileSync(
  join(projectRoot, PRIVATE_RECOVERY_ACQUISITION_REGISTER_PATH),
);
const beforeRegister = validatePrivateRecoveryRegister(
  JSON.parse(beforeRegisterBytes.toString("utf8")),
);
const hash = (character: string) => character.repeat(64);

const fileBinding = (path: string, character: string) => ({
  path,
  fileSha256: hash(character),
});

const sourceApplyCodeBindings: SourceRegistrationApplyCodeBindings = {
  runtime: fileBinding("src/lib/knowledge/source-registration-apply.ts", "1"),
  runner: fileBinding(
    "scripts/knowledge/apply-source-registration-plan.ts",
    "2",
  ),
  launcher: fileBinding(
    "scripts/knowledge/launch-locked-source-registration-apply.mjs",
    "3",
  ),
  runtimeLauncherTest: fileBinding(
    "tests/lib/source-registration-runtime-launcher.test.ts",
    "4",
  ),
  logicalCloneRehearsalRuntime: fileBinding(
    "src/lib/knowledge/source-registration-logical-clone-rehearsal.ts",
    "5",
  ),
  logicalCloneRehearsalJsonSchema: fileBinding(
    "knowledge/schema/source-registration-logical-clone-rehearsal-receipt.schema.v1.json",
    "6",
  ),
  logicalCloneRehearsalTest: fileBinding(
    "tests/lib/source-registration-logical-clone-rehearsal.test.ts",
    "7",
  ),
  logicalCloneRehearsalCommandRunner: fileBinding(
    "scripts/knowledge/run-source-registration-logical-clone-rehearsal.ts",
    "8",
  ),
  logicalRestoreCompanionValidator: fileBinding(
    "scripts/knowledge/logical-restore-companion-receipt.mjs",
    "9",
  ),
  logicalRestoreCompanionJsonSchema: fileBinding(
    "knowledge/schema/database-logical-restore-companion-receipt.schema.v1.json",
    "a",
  ),
  logicalRestoreCompanionTest: fileBinding(
    "tests/lib/database-logical-restore-companion.test.ts",
    "b",
  ),
  controlledLogicalRestoreCompanionRunner: fileBinding(
    "scripts/knowledge/run-controlled-logical-restore-companion.mjs",
    "c",
  ),
  pdfQualificationRuntime: fileBinding(
    "src/lib/knowledge/pdf-page-extraction-qualification.ts",
    "4",
  ),
  sourceAcquisitionRuntime: fileBinding(
    "src/lib/knowledge/source-acquisition-receipt.ts",
    "5",
  ),
  sourceAnalysisInputRuntime: fileBinding(
    "src/lib/knowledge/source-analysis-input-manifest.ts",
    "6",
  ),
  databaseLogicalStateDigest: fileBinding(
    "scripts/knowledge/database-logical-state-digest.mjs",
    "7",
  ),
  databaseLogicalStateDigestTest: fileBinding(
    "tests/lib/database-logical-state-digest.test.ts",
    "8",
  ),
  nodeRuntimeClosureManifest: fileBinding(
    "knowledge/corpus/source-registration/node-runtime-closure-darwin-arm64-2026-08-03.v1.json",
    "8",
  ),
  nodeRuntimeClosureVerifier: fileBinding(
    "scripts/knowledge/verify-node-runtime-closure.mjs",
    "9",
  ),
  nodeRuntimeClosureVerifierTest: fileBinding(
    "tests/lib/node-runtime-closure.test.ts",
    "a",
  ),
  postgresqlToolsetRuntimeClosureManifest: {
    path: "knowledge/corpus/source-registration/psql-runtime-closure-darwin-arm64-2026-08-03.v1.json",
    fileSha256:
      SOURCE_REGISTRATION_APPLY_LOCKED_POSTGRESQL_TOOLSET_RUNTIME_MANIFEST_SHA256,
  },
  postgresqlToolsetRuntimeClosureVerifier: {
    path: "scripts/knowledge/verify-psql-runtime-closure.mjs",
    fileSha256:
      SOURCE_REGISTRATION_APPLY_LOCKED_POSTGRESQL_TOOLSET_RUNTIME_VERIFIER_SHA256,
  },
  postgresqlToolsetRuntimeClosureVerifierTest: fileBinding(
    "tests/lib/psql-runtime-closure.test.ts",
    "a",
  ),
  restoreRunner: fileBinding("scripts/restore-database-backup-drill.sh", "9"),
  releaseAuthorizationVerifier: fileBinding(
    "scripts/knowledge/source-registration-release-authorization.mjs",
    "a",
  ),
  releaseAuthorizationJsonSchema: fileBinding(
    "knowledge/schema/source-registration-release-authorization.schema.v1.json",
    "b",
  ),
  releaseAuthorizationContract: fileBinding(
    "knowledge/corpus/SOURCE-REGISTRATION-RELEASE-AUTHORIZATION.md",
    "c",
  ),
  releaseAuthorizationPublicKey: fileBinding(
    "knowledge/keys/source-registration-2026-08-03-codex-operator-ed25519-v1.public.pem",
    "d",
  ),
  releaseAuthorizationVerifierTest: fileBinding(
    "tests/lib/source-registration-release-authorization.test.ts",
    "e",
  ),
  releaseAuthorizationSigner: fileBinding(
    "scripts/knowledge/sign-source-registration-release-authorization.mjs",
    "f",
  ),
  releaseAuthorizationSignerTest: fileBinding(
    "tests/lib/source-registration-release-signer.test.ts",
    "0",
  ),
  jsonSchema: fileBinding(
    "knowledge/schema/source-registration-apply-receipt.schema.v1.json",
    "1",
  ),
  contractDocument: fileBinding(
    "knowledge/corpus/SOURCE-REGISTRATION-APPLY-CONTRACT.md",
    "2",
  ),
  backupVerifier: fileBinding("scripts/verify-database-backup.sh", "3"),
  backupContractHelper: fileBinding(
    "scripts/database-backup-contract.mjs",
    "4",
  ),
  packageLock: fileBinding("package-lock.json", "5"),
  prismaGeneratedClientTree: {
    path: "src/generated/prisma",
    treeSha256: hash("6"),
  },
  runtimeEnvironment: {
    schemaVersion: "source-registration-runtime-attestation-v1",
    launcher: {
      path: "scripts/knowledge/launch-locked-source-registration-apply.mjs",
      fileSha256: hash("3"),
    },
    localClosure: {
      closureSha256: hash("7"),
      entryCount: 13,
      roots: [
        "package.json",
        "knowledge/runtime/source-registration-tsx.runtime.json",
        "scripts/knowledge/apply-source-registration-plan.ts",
        "scripts/knowledge/run-source-registration-logical-clone-rehearsal.ts",
        "scripts/knowledge/run-controlled-logical-restore-companion.mjs",
        "scripts/knowledge/logical-restore-receipt-pair-journal.mjs",
        "scripts/knowledge/launch-locked-source-registration-apply.mjs",
        "scripts/knowledge/database-logical-state-digest.mjs",
        "scripts/knowledge/verify-psql-runtime-closure.mjs",
        "scripts/knowledge/verify-node-runtime-closure.mjs",
        "scripts/knowledge/generate-source-registration-plan.ts",
      ],
      totalFileBytes: 1000,
    },
    node: {
      arch: "arm64",
      binaryFileSha256: hash("8"),
      platform: "darwin",
      runtimeClosureManifestSha256: hash("8"),
      runtimeClosureSha256:
        SOURCE_REGISTRATION_APPLY_LOCKED_NODE_RUNTIME_CLOSURE_SHA256,
      runtimeClosureVerifierFileSha256: hash("9"),
      version: "v26.0.0",
    },
    nodeModules: {
      entryCount: 2,
      fileCount: 1,
      path: "node_modules",
      rootKind: "resolved_external_symlink",
      symlinkCount: 0,
      totalFileBytes: 1,
      treeSha256: hash("9"),
    },
    prismaGeneratedClient: {
      entryCount: 2,
      fileCount: 1,
      path: "src/generated/prisma",
      rootKind: "resolved_external_symlink",
      symlinkCount: 0,
      totalFileBytes: 1,
      treeSha256: hash("6"),
    },
    postgresqlToolset: {
      closureSha256:
        SOURCE_REGISTRATION_APPLY_LOCKED_POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_SHA256,
      manifestSha256:
        SOURCE_REGISTRATION_APPLY_LOCKED_POSTGRESQL_TOOLSET_RUNTIME_MANIFEST_SHA256,
      psqlVersion: "psql (PostgreSQL) 16.13 (Homebrew)",
      toolFileSha256: {
        createdb: hash("7"),
        dropdb: hash("8"),
        pgRestore: hash("9"),
        psql: hash("a"),
      },
      verifierFileSha256:
        SOURCE_REGISTRATION_APPLY_LOCKED_POSTGRESQL_TOOLSET_RUNTIME_VERIFIER_SHA256,
    },
    runtimeAttestationSha256: hash("b"),
  },
};

function sourceRegistrationAuditFixture(plan: SourceRegistrationPlan) {
  const coreCounts = {
    ControlledMutationAudit: 0,
    DatabaseIdentity: 1 as const,
    Document: 1539,
    EvidenceAppraisal: 0,
    FieldCitation: 244516,
    LibraryAnalysisRecord: 1572,
    Report: 139,
    SourceCitation: 2703,
    SourceDoc: 199,
    Thesis: 79,
  };
  const migrationSha = hash("5");
  const preFingerprint = sourceRegistrationDatabaseFingerprintSha256({
    completedPrismaMigrationLedger: {
      completedCount: 31,
      sha256: migrationSha,
    },
    coreCounts,
    databaseIdentity: {
      key: "primary",
      uuid: SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_IDENTITY_UUID,
    },
  });
  const releaseEvidence: SourceRegistrationReleaseEvidence = {
    sourceDatabaseName: "foodsystems",
    backupSha256: hash("6"),
    backupBytes: 123,
    backupMetadataSha256: hash("7"),
    structuralRestoreReceiptSha256: hash("8"),
    databaseIdentityUuid:
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_IDENTITY_UUID,
    completedMigrationCount: 31,
    completedMigrationLedgerSha256: migrationSha,
    targetFingerprintSha256: preFingerprint,
    coreCounts,
    backupCreatedAtUtc: "2026-08-03T00:15:01.000Z",
    structuralRestoreCompletedAtUtc: "2026-08-03T00:15:48.860Z",
    logicalRestoreCompanion: {
      receiptFileSha256: hash("9"),
      completedAtUtc: "2026-08-03T00:15:59.000Z",
      logicalComparisonStartedAtUtc: "2026-08-03T00:15:49.000Z",
      logicalComparisonCompletedAtUtc: "2026-08-03T00:15:55.000Z",
      logicalComparisonProofSha256: hash("a"),
      source: {
        contentStateSha256: hash("0"),
        logicalStateSha256: hash("b"),
        relationCount: 56,
        totalRowCount: 555_189,
        sequenceRowCount: 0,
      },
      restored: {
        contentStateSha256: hash("0"),
        logicalStateSha256: hash("c"),
        relationCount: 56,
        totalRowCount: 555_189,
        sequenceRowCount: 0,
      },
      postRehearsalVerifiedAtUtc: "2026-08-03T00:15:58.000Z",
      postRehearsalCloneFullStateMatched: true,
      sourceStillMatched: true,
      cloneDatabaseDropped: true,
      cloneDatabaseAbsenceConfirmed: true,
    },
    logicalCloneRehearsal: {
      receiptFileSha256: hash("d"),
      receiptSelfSha256: hash("e"),
      operationKey: `source-registration-logical-clone-rehearsal-v1:${hash("f")}`,
      runtimeAttestationSha256: hash("1"),
      rehearsalStartedAtUtc: "2026-08-03T00:15:50.000Z",
      rehearsalCompletedAtUtc: "2026-08-03T00:15:54.000Z",
      targetSetSha256: SOURCE_REGISTRATION_APPLY_LOCKED_TARGET_SET_SHA256,
      exactProductionTargetExercised: false,
      productionAuthorizationUsed: false,
      transactionRolledBack: true,
      rollbackAbsenceConfirmed: true,
    },
    verification: {
      metadataVersion: 2,
      structuralRestoreReceiptVersion: 1,
      logicalRestoreCompanionReceiptVersion: 1,
      logicalCloneRehearsalSchemaVersion:
        "source-registration-logical-clone-rehearsal-v1",
      structuralVerifierPassed: true,
      structuralRestoreCleanupPassed: true,
      logicalRestoreCompanionValidated: true,
      logicalCloneRehearsalValidated: true,
      logicalRestoreCleanupPassed: true,
      evidenceFilesUnchanged: true,
    },
  };
  const counts = expectedPostApplyCounts(plan);
  const afterFingerprint = sourceRegistrationDatabaseFingerprintSha256({
    completedPrismaMigrationLedger: {
      completedCount: 31,
      sha256: migrationSha,
    },
    coreCounts: {
      ...coreCounts,
      ControlledMutationAudit: counts.controlledMutationAuditsAfterAppend,
      Document: counts.documents,
      LibraryAnalysisRecord: counts.libraryAnalysisRecords,
    },
    databaseIdentity: {
      key: "primary",
      uuid: SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_IDENTITY_UUID,
    },
  });
  const afterSnapshot = sealSourceRegistrationAfterSnapshot({
    databaseIdentityUuid:
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_IDENTITY_UUID,
    completedMigrationCount: 31,
    planStyleMigrationLedgerSha256: hash("9"),
    backupStyleMigrationLedgerSha256: migrationSha,
    preApplyTargetFingerprintSha256: preFingerprint,
    afterApplyTargetFingerprintSha256: afterFingerprint,
    targetSetSha256: sourceRegistrationApplyTargetSetSha256(plan),
    documentRowsSha256: hash("a"),
    libraryAnalysisRowsSha256: hash("b"),
    dependencyRowsSha256: hash("c"),
    dependencyRowCount: 0,
    counts,
  });
  const authorization = validateSourceRegistrationApplyAuthorization({
    authorizationEnvelopeSha256: hash("d"),
    operatorId: SOURCE_REGISTRATION_APPLY_AI_OPERATOR_ID,
    ownerScopeAuthorizationRef:
      SOURCE_REGISTRATION_APPLY_OWNER_SCOPE_AUTHORIZATION_REF,
    exactOperatorAuthorizationRef:
      sourceRegistrationExactOperatorAuthorizationRef({
        runtimeAttestationSha256:
          sourceApplyCodeBindings.runtimeEnvironment.runtimeAttestationSha256,
        authorizationEnvelopeSha256: hash("d"),
      }),
    databaseRole: SOURCE_REGISTRATION_APPLY_DATABASE_ROLE,
    runtimeAttestationSha256:
      sourceApplyCodeBindings.runtimeEnvironment.runtimeAttestationSha256,
  });
  const dependencyStateSha256 = sourceRegistrationApplyDependencyStateSha256({
    plan,
    codeBindings: sourceApplyCodeBindings,
  });
  const operationKey = sourceRegistrationApplyOperationKey({
    contractSha256: sourceRegistrationApplyContractSha256(),
    dependencyStateSha256,
  });
  const databaseTarget = sealSourceRegistrationDatabaseTarget({
    schemaVersion: SOURCE_REGISTRATION_APPLY_DATABASE_TARGET_SCHEMA_VERSION,
    ...SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET,
  });
  const databaseCatalog = {
    schemaVersion: SOURCE_REGISTRATION_APPLY_DATABASE_CATALOG_SCHEMA_VERSION,
    scope: SOURCE_REGISTRATION_APPLY_DATABASE_CATALOG_SCOPE,
    catalogSha256: SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_CATALOG_SHA256,
    relationCount: 4 as const,
    nonInternalTriggerCount: 8 as const,
    generatedExpressionFunctionCount: 2 as const,
    unexpectedWriteSurfaceCount: 0 as const,
  };
  const releaseAuthorization = {
    envelopeSha256: hash("d"),
    keyId: `ed25519-spki-sha256:${hash("e")}`,
    algorithm: "Ed25519" as const,
    authorizationId: "018f6f24-742a-7c01-8f4a-4fdfbf338721",
    authorizationScope:
      "source-registration.new-official-2026-08-02.exact-apply" as const,
    acknowledgement: SOURCE_REGISTRATION_APPLY_ACK,
    operatorId: authorization.operatorId,
    databaseRole: authorization.databaseRole,
    operatorAuthorityClass:
      "codex_ai_local_operator_pre_human_validation" as const,
    humanApprovalClaimed: false as const,
    ownerExactHashReviewClaimed: false as const,
    expertValidationClaimed: false as const,
    rightsHolderApprovalClaimed: false as const,
    authorizedAtUtc: "2026-08-03T00:16:00.000Z",
    notBeforeUtc: "2026-08-03T00:16:00.000Z",
    expiresAtUtc: "2026-08-03T04:16:00.000Z",
    nonceSha256: hash("f"),
    planSha256: SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256,
    planFileSha256: SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_FILE_SHA256,
    beforeSnapshotSha256:
      SOURCE_REGISTRATION_APPLY_LOCKED_BEFORE_SNAPSHOT_SHA256,
    databaseIdentityUuid:
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_IDENTITY_UUID,
    sourceDatabaseName: "foodsystems" as const,
    applyContractSha256: sourceRegistrationApplyContractSha256(),
    dependencyStateSha256,
    operationKey,
    codeBindingsSha256: sourceRegistrationApplyCodeBindingsSha256(
      sourceApplyCodeBindings,
    ),
    databaseTargetSha256:
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET_SHA256,
    databaseCatalogSha256:
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_CATALOG_SHA256,
    contentStateSha256: hash("0"),
    backupSha256: releaseEvidence.backupSha256,
    backupBytes: releaseEvidence.backupBytes,
    backupMetadataSha256: releaseEvidence.backupMetadataSha256,
    structuralRestoreReceiptSha256:
      releaseEvidence.structuralRestoreReceiptSha256,
    logicalRestoreCompanionReceiptSha256:
      releaseEvidence.logicalRestoreCompanion.receiptFileSha256,
    logicalCloneRehearsalReceiptFileSha256:
      releaseEvidence.logicalCloneRehearsal.receiptFileSha256,
    logicalCloneRehearsalReceiptSelfSha256:
      releaseEvidence.logicalCloneRehearsal.receiptSelfSha256,
    completedMigrationLedgerSha256:
      releaseEvidence.completedMigrationLedgerSha256,
    targetFingerprintSha256: releaseEvidence.targetFingerprintSha256,
    targetSetSha256: sourceRegistrationApplyTargetSetSha256(plan),
    structuralRestoreCompletedAtUtc:
      releaseEvidence.structuralRestoreCompletedAtUtc,
    logicalRestoreCompanionCompletedAtUtc:
      releaseEvidence.logicalRestoreCompanion.completedAtUtc,
    logicalComparisonProofSha256:
      releaseEvidence.logicalRestoreCompanion.logicalComparisonProofSha256,
    logicalCloneRehearsalOperationKey:
      releaseEvidence.logicalCloneRehearsal.operationKey,
    logicalCloneRehearsalRuntimeAttestationSha256:
      releaseEvidence.logicalCloneRehearsal.runtimeAttestationSha256,
    logicalCloneRehearsalCompletedAtUtc:
      releaseEvidence.logicalCloneRehearsal.rehearsalCompletedAtUtc,
    restoreRunnerSha256: sourceApplyCodeBindings.restoreRunner.fileSha256,
    backupVerifierSha256: sourceApplyCodeBindings.backupVerifier.fileSha256,
    backupContractHelperSha256:
      sourceApplyCodeBindings.backupContractHelper.fileSha256,
    databaseLogicalDigestSha256:
      sourceApplyCodeBindings.databaseLogicalStateDigest.fileSha256,
    psqlBinarySha256:
      sourceApplyCodeBindings.runtimeEnvironment.postgresqlToolset
        .toolFileSha256.psql,
    psqlRuntimeClosureSha256:
      sourceApplyCodeBindings.runtimeEnvironment.postgresqlToolset
        .closureSha256,
    restoredDatabaseDropped: true as const,
    restoredDatabaseAbsenceConfirmed: true as const,
    postRehearsalCloneFullStateMatched: true as const,
    sourceStillMatchedAfterRehearsal: true as const,
    documentCreatesMax: 10 as const,
    libraryAnalysisRecordCreatesMax: 10 as const,
    controlledMutationAuditCreatesMax: 1 as const,
    otherDatabaseWritesAuthorized: false as const,
    lifecyclePromotionAuthorized: false as const,
    sourceAnalysisPromotionAuthorized: false as const,
    externalUseAuthorized: false as const,
  };
  const summary = buildSourceRegistrationApplyMutationSummary({
    plan,
    codeBindings: sourceApplyCodeBindings,
    authorization,
    releaseAuthorization,
    releaseEvidence,
    liveContentState: {
      contentStateSha256: releaseAuthorization.contentStateSha256,
      logicalStateSha256: hash("1"),
      relationCount: 56,
      totalRowCount: 555_189,
      sequenceRowCount: 0,
      allPublicDataRelationsLocked: true,
      signedRestoreDigestMatched: true,
      checkedImmediatelyBeforeMutation: true,
    },
    databaseTarget,
    databaseCatalog,
    dependencyStateSha256,
    operationKey,
    afterSnapshot,
  });
  return sourceRegistrationControlledMutationAudit({ summary });
}

const implementationRoles: PrivateRecoveryImplementationBinding["role"][] = [
  "private_recovery_runtime",
  "private_recovery_runner",
  "private_recovery_plan_schema",
  "private_recovery_apply_schema",
  "private_recovery_contract",
  "source_acquisition_runtime",
  "source_acquisition_schema",
  "source_registration_plan_runtime",
  "source_registration_apply_runtime",
  "source_registration_apply_runner",
];

function implementationBindingsFixture(): PrivateRecoveryImplementationBinding[] {
  return implementationRoles.map((role, index) => ({
    role,
    path: `fixtures/${role}.txt`,
    fileSha256: `sha256:${(index + 1).toString(16).repeat(64).slice(0, 64)}`,
    sizeBytes: index + 1,
  }));
}

function copyFixtures(plan: SourceRegistrationPlan): VerifiedPrivateCopyPair[] {
  return plan.targets.map((target) => {
    const row = target.intendedPrivateRecoveryRow;
    const portablePath = `sha256/${row.sha256}.pdf`;
    return {
      targetId: target.targetId,
      lifecycleSourceId: target.lifecycleSourceId,
      primary: {
        copyId: "primary",
        storageRootId: "private_primary",
        storageClass: "private_primary",
        locator: `private://primary/${portablePath}`,
        portablePath,
        contentSha256: `sha256:${row.sha256}`,
        sizeBytes: row.sizeBytes,
        fileMode: "0400",
        verifiedAt: "2026-08-03T12:00:00.000Z",
      },
      replica: {
        copyId: "replica",
        storageRootId: "bigbrain_private_replica",
        storageClass: "bigbrain_private_archive",
        locator: `private://replica/${portablePath}`,
        portablePath,
        contentSha256: `sha256:${row.sha256}`,
        sizeBytes: row.sizeBytes,
        fileMode: "0400",
        verifiedAt: "2026-08-03T12:00:00.000Z",
      },
      distinctStorageRoots: true,
      distinctFiles: true,
      contentHashesMatch: true,
      sizesMatch: true,
      rootModes: "0700",
      absoluteRootsStored: false,
    };
  });
}

function planFixture(): PrivateRecoveryAcquisitionPlan {
  return buildPrivateRecoveryAcquisitionPlan({
    preparedAt: "2026-08-03T12:00:00.000Z",
    sourceRegistrationPlan: sourcePlan,
    sourceRegistrationPlanBytes: sourcePlanBytes,
    sourceRegistrationAudit: sourceRegistrationAuditFixture(sourcePlan),
    beforeRegister,
    beforeRegisterBytes,
    privateCopies: copyFixtures(sourcePlan),
    implementationBindings: implementationBindingsFixture(),
  });
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function makeProjectFixture(plan: PrivateRecoveryAcquisitionPlan): string {
  const root = mkdtempSync(join(tmpdir(), "private-recovery-apply-test-"));
  const registerPath = join(root, PRIVATE_RECOVERY_ACQUISITION_REGISTER_PATH);
  mkdirSync(dirname(registerPath), { recursive: true });
  writeFileSync(
    registerPath,
    serializePrivateRecoveryJson(plan.recoveryRegister.before.document),
  );
  return root;
}

const plan = planFixture();
const planBytes = serializePrivateRecoveryJson(plan);

test("exact plan freezes 11 + 10 rows, canonical receipts and zero promotion", () => {
  assert.equal(plan.recoveryRegister.before.document.candidates.length, 11);
  assert.equal(plan.recoveryRegister.after.document.candidates.length, 21);
  assert.deepEqual(
    plan.recoveryRegister.after.document.candidates.slice(0, 11),
    plan.recoveryRegister.before.document.candidates,
  );
  assert.equal(plan.targets.length, 10);
  for (const target of plan.targets) {
    assert.equal(
      target.acquisitionReceipt.receipt.sourceId,
      target.lifecycleSourceId,
    );
    assert.equal(
      target.acquisitionReceipt.receipt.acquisitionType,
      "controlled_private_access",
    );
    assert.equal(target.recoveryRow.fullTextReviewed, false);
    assert.equal(target.recoveryRow.repositoryAvailable, false);
    assert.equal(target.recoveryRow.rightsState, "pending_not_cleared");
    assert.match(
      target.acquisitionReceipt.file.fileSha256,
      /^sha256:[a-f0-9]{64}$/,
    );
  }
  assert.equal(plan.applyReceipt.receipt.mutations.databaseWrites, 0);
  assert.equal(plan.applyReceipt.receipt.mutations.rebaselineRuns, 0);
  assert.match(
    privateRecoveryAcquisitionStrongAck(plan),
    /^APPLY_PRIVATE_RECOVERY_10_PLAN_[A-F0-9]{12}$/,
  );
  const serialized = planBytes.toString("utf8");
  assert.doesNotMatch(serialized, /\/(?:Users|Volumes|private|tmp)\//);
  assert.doesNotMatch(
    serialized,
    /"(?:sourceText|contentValue|rawText|normalizedText)"/,
  );
});

test("JSON Schemas validate the complete plan, embedded receipts and apply receipt", () => {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const sourceReceiptSchema = JSON.parse(
    readFileSync(
      join(
        projectRoot,
        "knowledge/schema/source-acquisition-receipt.schema.v1.json",
      ),
      "utf8",
    ),
  );
  const applySchema = JSON.parse(
    readFileSync(
      join(
        projectRoot,
        "knowledge/schema/private-recovery-acquisition-apply-receipt.schema.v1.json",
      ),
      "utf8",
    ),
  );
  const planSchema = JSON.parse(
    readFileSync(
      join(
        projectRoot,
        "knowledge/schema/private-recovery-acquisition-plan.schema.v1.json",
      ),
      "utf8",
    ),
  );
  ajv.addSchema(sourceReceiptSchema);
  ajv.addSchema(applySchema);
  const validate = ajv.compile(planSchema);
  assert.equal(validate(plan), true, JSON.stringify(validate.errors));
  const validateApply = ajv.getSchema(applySchema.$id)!;
  assert.equal(
    validateApply(plan.applyReceipt.receipt),
    true,
    JSON.stringify(validateApply.errors),
  );
});

test("tamper, audit drift and absolute private payloads fail closed", () => {
  const rowTamper = clone(plan);
  rowTamper.targets[0]!.recoveryRow.sizeBytes += 1;
  assert.throws(
    () => validatePrivateRecoveryAcquisitionPlan(rowTamper),
    /self-hash mismatch|binding mismatch/,
  );

  const receiptTamper = clone(plan.applyReceipt.receipt);
  receiptTamper.mutations.databaseWrites = 1 as 0;
  assert.throws(() =>
    validatePrivateRecoveryAcquisitionApplyReceipt(receiptTamper),
  );

  const pathTamper = clone(plan);
  pathTamper.inputBindings.implementation[0]!.path =
    "/Volumes/private/source.pdf";
  assert.throws(() => validatePrivateRecoveryAcquisitionPlan(pathTamper));

  const audit = sourceRegistrationAuditFixture(sourcePlan);
  const auditTamper = clone(audit);
  auditTamper.databaseRole = "different_writer";
  assert.throws(() =>
    validatePrivateRecoveryDatabaseAuditBinding({
      binding: plan.inputBindings.sourceRegistrationApplyAudit,
      audit: auditTamper,
      sourceRegistrationPlan: sourcePlan,
    }),
  );
});

test("CLI defaults read-only and requires two independent exact apply gates", () => {
  assert.throws(
    () => parsePrivateRecoveryAcquisitionArgs([], "/tmp/project", {}),
    /requires DATABASE_URL/,
  );
  const check = parsePrivateRecoveryAcquisitionArgs(
    [
      "--check",
      "--primary-corpus-root=/private/primary",
      "--replica-corpus-root=/private/replica",
    ],
    "/tmp/project",
    { DATABASE_URL: "test-database-url" },
  );
  assert.equal(check.mode, "check");
  assert.throws(
    () =>
      parsePrivateRecoveryAcquisitionArgs(
        [
          "--database-url=must-not-appear-in-argv",
          "--primary-corpus-root=/private/primary",
          "--replica-corpus-root=/private/replica",
        ],
        "/tmp/project",
        { DATABASE_URL: "test-database-url" },
      ),
    /unknown argument --database-url/,
  );
  assert.throws(
    () =>
      parsePrivateRecoveryAcquisitionArgs(
        [
          "--apply",
          "--primary-corpus-root=/private/primary",
          "--replica-corpus-root=/private/replica",
        ],
        "/tmp/project",
        { DATABASE_URL: "test-database-url" },
      ),
    /requires --ack/,
  );
  assert.throws(
    () =>
      parsePrivateRecoveryAcquisitionArgs(
        [
          "--plan",
          "--apply",
          "--primary-corpus-root=/private/primary",
          "--replica-corpus-root=/private/replica",
        ],
        "/tmp/project",
        { DATABASE_URL: "test-database-url" },
      ),
    /exactly one operation mode/,
  );
});

test("private leaf verifier rejects wrong mode, symlinks, hard links and tamper", () => {
  const root = mkdtempSync(join(tmpdir(), "private-leaf-test-"));
  chmodSync(root, 0o700);
  const directory = join(root, "sha256");
  mkdirSync(directory, { mode: 0o700 });
  const content = Buffer.from("controlled private fixture", "utf8");
  const expectedSha256 = privateRecoverySha256(content);
  const leaf = join(directory, "fixture.pdf");
  writeFileSync(leaf, content);
  chmodSync(leaf, 0o400);
  try {
    const verified = readPrivateRecoveryLeaf({
      rootPath: root,
      portablePath: "sha256/fixture.pdf",
      expectedSha256,
      expectedSizeBytes: content.length,
    });
    assert.equal(verified.contentSha256, expectedSha256);

    chmodSync(leaf, 0o600);
    assert.throws(
      () =>
        readPrivateRecoveryLeaf({
          rootPath: root,
          portablePath: "sha256/fixture.pdf",
          expectedSha256,
          expectedSizeBytes: content.length,
        }),
      /mode.*0400/,
    );
    chmodSync(leaf, 0o400);

    const hard = join(directory, "hard.pdf");
    linkSync(leaf, hard);
    assert.throws(
      () =>
        readPrivateRecoveryLeaf({
          rootPath: root,
          portablePath: "sha256/fixture.pdf",
          expectedSha256,
          expectedSizeBytes: content.length,
        }),
      /hard-linked/,
    );
    unlinkSync(hard);

    const symlink = join(directory, "symlink.pdf");
    symlinkSync(leaf, symlink);
    assert.throws(() =>
      readPrivateRecoveryLeaf({
        rootPath: root,
        portablePath: "sha256/symlink.pdf",
        expectedSha256,
        expectedSizeBytes: content.length,
      }),
    );
    unlinkSync(symlink);

    const linkedParent = join(root, "linked-parent");
    symlinkSync(directory, linkedParent);
    assert.throws(
      () =>
        readPrivateRecoveryLeaf({
          rootPath: root,
          portablePath: "linked-parent/fixture.pdf",
          expectedSha256,
          expectedSizeBytes: content.length,
        }),
      /symlink path component rejected/,
    );
    unlinkSync(linkedParent);

    chmodSync(leaf, 0o600);
    writeFileSync(leaf, Buffer.from("tampered private fixture", "utf8"));
    chmodSync(leaf, 0o400);
    assert.throws(
      () =>
        readPrivateRecoveryLeaf({
          rootPath: root,
          portablePath: "sha256/fixture.pdf",
          expectedSha256,
          expectedSizeBytes: content.length,
        }),
      /differs from the exact content binding/,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("durable writer resumes a crash during receipts and exact replay is a no-op", async () => {
  const root = makeProjectFixture(plan);
  let reverifyCalls = 0;
  try {
    await assert.rejects(
      applyPreparedPrivateRecoveryAcquisitionPlan({
        projectRoot: root,
        plan,
        planBytes,
        reverifyInputs: async () => {
          reverifyCalls += 1;
        },
        faultAfterStep: 4,
      }),
      /Injected crash/,
    );
    assert.equal(
      classifyPrivateRecoveryFilesystemState({
        projectRoot: root,
        plan,
        planFileSha256: privateRecoverySha256(planBytes),
      }),
      "resumable",
    );
    const resumed = await applyPreparedPrivateRecoveryAcquisitionPlan({
      projectRoot: root,
      plan,
      planBytes,
      reverifyInputs: async (state) => {
        assert.equal(state, "resumable");
        reverifyCalls += 1;
      },
    });
    assert.equal(resumed.state, "resumed");
    assert.equal(
      JSON.parse(
        readFileSync(
          join(root, PRIVATE_RECOVERY_ACQUISITION_REGISTER_PATH),
          "utf8",
        ),
      ).candidates.length,
      21,
    );
    assert.doesNotThrow(() =>
      validatePrivateRecoveryAcquisitionApplyReceipt(
        JSON.parse(
          readFileSync(
            join(root, PRIVATE_RECOVERY_ACQUISITION_APPLY_RECEIPT_PATH),
            "utf8",
          ),
        ),
      ),
    );
    const replay = await applyPreparedPrivateRecoveryAcquisitionPlan({
      projectRoot: root,
      plan,
      planBytes,
      reverifyInputs: async (state) => {
        assert.equal(state, "committed");
        reverifyCalls += 1;
      },
    });
    assert.deepEqual(replay, { state: "receipted_noop", filesCreated: 0 });
    assert.equal(reverifyCalls, 3);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("crash after register replacement resumes without losing the 11 preserved rows", async () => {
  const root = makeProjectFixture(plan);
  try {
    await assert.rejects(
      applyPreparedPrivateRecoveryAcquisitionPlan({
        projectRoot: root,
        plan,
        planBytes,
        reverifyInputs: async () => undefined,
        faultAfterStep: 12,
      }),
      /Injected crash/,
    );
    const afterCrash = JSON.parse(
      readFileSync(
        join(root, PRIVATE_RECOVERY_ACQUISITION_REGISTER_PATH),
        "utf8",
      ),
    );
    assert.equal(afterCrash.candidates.length, 21);
    assert.deepEqual(
      afterCrash.candidates.slice(0, 11),
      beforeRegister.candidates,
    );
    const resumed = await applyPreparedPrivateRecoveryAcquisitionPlan({
      projectRoot: root,
      plan,
      planBytes,
      reverifyInputs: async (state) => assert.equal(state, "resumable"),
    });
    assert.equal(resumed.state, "resumed");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("unjournaled partial output and committed-output tamper are conflicts", async () => {
  const root = makeProjectFixture(plan);
  try {
    await assert.rejects(
      applyPreparedPrivateRecoveryAcquisitionPlan({
        projectRoot: root,
        plan,
        planBytes,
        reverifyInputs: async () => undefined,
        faultAfterStep: 3,
      }),
      /Injected crash/,
    );
    const journal = join(
      root,
      "knowledge/corpus/private-recovery-acquisition/.private-recovery-acquisition-journal.v1.json",
    );
    unlinkSync(journal);
    assert.throws(
      () =>
        classifyPrivateRecoveryFilesystemState({
          projectRoot: root,
          plan,
          planFileSha256: privateRecoverySha256(planBytes),
        }),
      /without their durable journal/,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }

  const committedRoot = makeProjectFixture(plan);
  try {
    await applyPreparedPrivateRecoveryAcquisitionPlan({
      projectRoot: committedRoot,
      plan,
      planBytes,
      reverifyInputs: async () => undefined,
    });
    const receiptPath = join(
      committedRoot,
      plan.targets[0]!.acquisitionReceipt.file.path,
    );
    writeFileSync(receiptPath, Buffer.from("tampered\n"));
    await assert.rejects(
      applyPreparedPrivateRecoveryAcquisitionPlan({
        projectRoot: committedRoot,
        plan,
        planBytes,
        reverifyInputs: async () => undefined,
      }),
      /conflicting bytes/,
    );
  } finally {
    rmSync(committedRoot, { recursive: true, force: true });
  }
});
