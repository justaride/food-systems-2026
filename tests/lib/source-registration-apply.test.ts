import assert from "node:assert/strict";
import {
  chmodSync,
  linkSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import Ajv2020 from "ajv/dist/2020";

import {
  SOURCE_REGISTRATION_APPLY_ADVISORY_LOCK_KEY,
  SOURCE_REGISTRATION_APPLY_ACK,
  SOURCE_REGISTRATION_APPLY_AI_OPERATOR_ID,
  SOURCE_REGISTRATION_APPLY_CONTRACT_SCOPE,
  SOURCE_REGISTRATION_APPLY_DATABASE_CATALOG_SCHEMA_VERSION,
  SOURCE_REGISTRATION_APPLY_DATABASE_CATALOG_SCOPE,
  SOURCE_REGISTRATION_APPLY_DATABASE_TARGET_SCHEMA_VERSION,
  SOURCE_REGISTRATION_APPLY_DATABASE_ROLE,
  SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_CATALOG_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_BEFORE_SNAPSHOT_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_IDENTITY_UUID,
  SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET,
  SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_NODE_RUNTIME_CLOSURE_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_FILE_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_POSTGRESQL_TOOLSET_RUNTIME_MANIFEST_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_POSTGRESQL_TOOLSET_RUNTIME_VERIFIER_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_TARGET_SET_SHA256,
  SOURCE_REGISTRATION_APPLY_OWNER_SCOPE_AUTHORIZATION_REF,
  SourceRegistrationAfterSnapshotSchema,
  SourceRegistrationApplyMutationSummarySchema,
  buildSourceRegistrationApplyMutationSummary,
  classifySourceRegistrationExistingState,
  expectedPostApplyCounts,
  sealSourceRegistrationAfterSnapshot,
  sealSourceRegistrationApplyMutationSummary,
  sealSourceRegistrationDatabaseTarget,
  sourceRegistrationApplyCodeBindingsSha256,
  sourceRegistrationApplyContractSha256,
  sourceRegistrationApplyDependencyStateSha256,
  sourceRegistrationApplyOperationKey,
  sourceRegistrationApplyTargetSetSha256,
  sourceRegistrationAuditLeakFacts,
  sourceRegistrationExactOperatorAuthorizationRef,
  sourceRegistrationControlledMutationAudit,
  sourceRegistrationDatabaseFingerprintSha256,
  sourceRegistrationDatabaseCatalogSha256,
  validateLockedSourceRegistrationPlanBytes,
  validateSourceRegistrationApplyAuthorization,
  validateSourceRegistrationApplyMutationSummary,
  type SourceRegistrationApplyCodeBindings,
  type SourceRegistrationApplyMutationSummary,
  type SourceRegistrationReleaseEvidence,
} from "../../src/lib/knowledge/source-registration-apply";
import {
  assertReceiptedSourceRegistrationNoop,
  assertSourceRegistrationCurrentReplayBindings,
  executeSourceRegistrationMutationCore,
  inspectSourceRegistrationTargetSet,
  parseSourceRegistrationApplyArgs,
  readPrivateLeafInsideRoot,
  readStablePrivateEvidenceFile,
  sourceRegistrationBackupVerifierEnvironment,
  sourceRegistrationPhysicalDocumentRowsSha256,
  validateExactApplyOptions,
} from "../../scripts/knowledge/apply-source-registration-plan";

const projectRoot = process.cwd();
const lockedPlanBytes = readFileSync(
  join(
    projectRoot,
    "knowledge/corpus/source-registration/source-registration-dry-run-plan-2026-08-03.v1.json",
  ),
);
const plan = validateLockedSourceRegistrationPlanBytes(lockedPlanBytes);
const hash = (character: string) => character.repeat(64);

const fileBinding = (path: string, character: string) => ({
  path,
  fileSha256: hash(character),
});

const codeBindings: SourceRegistrationApplyCodeBindings = {
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
    "knowledge/corpus/source-registration/node-runtime-closure-darwin-arm64-2026-08-11.v1.json",
    "b",
  ),
  nodeRuntimeClosureVerifier: fileBinding(
    "scripts/knowledge/verify-node-runtime-closure.mjs",
    "c",
  ),
  nodeRuntimeClosureVerifierTest: fileBinding(
    "tests/lib/node-runtime-closure.test.ts",
    "d",
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
      entryCount: 12,
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
      runtimeClosureManifestSha256: hash("b"),
      runtimeClosureSha256:
        SOURCE_REGISTRATION_APPLY_LOCKED_NODE_RUNTIME_CLOSURE_SHA256,
      runtimeClosureVerifierFileSha256: hash("c"),
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

function receiptFixture() {
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
          codeBindings.runtimeEnvironment.runtimeAttestationSha256,
        authorizationEnvelopeSha256: hash("d"),
      }),
    databaseRole: SOURCE_REGISTRATION_APPLY_DATABASE_ROLE,
    runtimeAttestationSha256:
      codeBindings.runtimeEnvironment.runtimeAttestationSha256,
  });
  const dependencyStateSha256 = sourceRegistrationApplyDependencyStateSha256({
    plan,
    codeBindings,
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
    codeBindingsSha256: sourceRegistrationApplyCodeBindingsSha256(codeBindings),
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
    restoreRunnerSha256: codeBindings.restoreRunner.fileSha256,
    backupVerifierSha256: codeBindings.backupVerifier.fileSha256,
    backupContractHelperSha256: codeBindings.backupContractHelper.fileSha256,
    databaseLogicalDigestSha256:
      codeBindings.databaseLogicalStateDigest.fileSha256,
    psqlBinarySha256:
      codeBindings.runtimeEnvironment.postgresqlToolset.toolFileSha256.psql,
    psqlRuntimeClosureSha256:
      codeBindings.runtimeEnvironment.postgresqlToolset.closureSha256,
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
    codeBindings,
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
  return {
    summary,
    authorization,
    releaseAuthorization,
    releaseEvidence,
    afterSnapshot,
    operationKey,
  };
}

test("locked plan and contract pins are exact and bigint-free", () => {
  assert.equal(
    plan.planSha256,
    `sha256:${SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256}`,
  );
  assert.equal(plan.summary.pendingCount, 10);
  assert.equal(
    SOURCE_REGISTRATION_APPLY_ADVISORY_LOCK_KEY,
    "6538086643221537792",
  );
  assert.match(sourceRegistrationApplyContractSha256(), /^[a-f0-9]{64}$/);
  const tampered = Buffer.from(lockedPlanBytes);
  tampered[tampered.length - 2] =
    tampered[tampered.length - 2] === 10 ? 32 : 10;
  assert.throws(
    () => validateLockedSourceRegistrationPlanBytes(tampered),
    /drifted/,
  );
});

test("contract names DDL and host-utility trust boundaries without overclaim", () => {
  const contract = readFileSync(
    join(projectRoot, "knowledge/corpus/SOURCE-REGISTRATION-APPLY-CONTRACT.md"),
    "utf8",
  );
  assert.match(
    contract,
    /operational DDL-quiescence window is therefore mandatory/,
  );
  assert.match(contract, /do not claim global DDL exclusion/);
  assert.match(contract, /explicit operating-system toolchain trust boundary/);
  assert.match(contract, /does not claim to hash all definitions/);
});

test("CLI requires explicit roots, one mode occurrence, and redacts unknown flags", () => {
  assert.throws(
    () => parseSourceRegistrationApplyArgs(["--plan-only"]),
    /explicit absolute --primary-corpus-root/,
  );
  const secretBearingUnknown =
    "--mystery=postgresql://operator:must-not-leak@example.invalid/db";
  assert.throws(
    () =>
      parseSourceRegistrationApplyArgs([
        "--plan-only",
        "--primary-corpus-root=/private/a",
        "--replica-corpus-root=/private/b",
        secretBearingUnknown,
      ]),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /unknown or malformed argument/);
      assert.ok(!error.message.includes(secretBearingUnknown));
      assert.ok(!error.message.includes("must-not-leak"));
      return true;
    },
  );
  for (const duplicateMode of [
    "--plan-only",
    "--verify-release-evidence",
    "--apply",
  ]) {
    assert.throws(
      () =>
        parseSourceRegistrationApplyArgs([
          duplicateMode,
          duplicateMode,
          "--primary-corpus-root=/private/a",
          "--replica-corpus-root=/private/b",
        ]),
      /choose exactly one execution mode flag/,
    );
  }
  const parsed = parseSourceRegistrationApplyArgs([
    "--primary-corpus-root=/private/a",
    "--replica-corpus-root=/private/b",
  ]);
  assert.equal(parsed.mode, "plan_only");
  assert.throws(
    () =>
      parseSourceRegistrationApplyArgs([
        "--primary-corpus-root=/private/a",
        "--replica-corpus-root=/private/b",
        "--expected-backup-bytes=123junk",
      ]),
    /exact positive integer/,
  );
});

test("transitive verifier or generated-client drift changes dependency and operation keys", () => {
  const originalDependency = sourceRegistrationApplyDependencyStateSha256({
    plan,
    codeBindings,
  });
  const originalOperation = sourceRegistrationApplyOperationKey({
    contractSha256: sourceRegistrationApplyContractSha256(),
    dependencyStateSha256: originalDependency,
  });
  const drifted = structuredClone(codeBindings);
  drifted.backupVerifier.fileSha256 = hash("a");
  drifted.prismaGeneratedClientTree.treeSha256 = hash("b");
  const driftedDependency = sourceRegistrationApplyDependencyStateSha256({
    plan,
    codeBindings: drifted,
  });
  const driftedOperation = sourceRegistrationApplyOperationKey({
    contractSha256: sourceRegistrationApplyContractSha256(),
    dependencyStateSha256: driftedDependency,
  });
  assert.notEqual(driftedDependency, originalDependency);
  assert.notEqual(driftedOperation, originalOperation);
});

test("launcher integration test drift changes dependency and operation keys", () => {
  const originalDependency = sourceRegistrationApplyDependencyStateSha256({
    plan,
    codeBindings,
  });
  const drifted = structuredClone(codeBindings);
  drifted.runtimeLauncherTest.fileSha256 = hash("f");
  const driftedDependency = sourceRegistrationApplyDependencyStateSha256({
    plan,
    codeBindings: drifted,
  });
  assert.notEqual(driftedDependency, originalDependency);
  assert.notEqual(
    sourceRegistrationApplyOperationKey({
      contractSha256: sourceRegistrationApplyContractSha256(),
      dependencyStateSha256: driftedDependency,
    }),
    sourceRegistrationApplyOperationKey({
      contractSha256: sourceRegistrationApplyContractSha256(),
      dependencyStateSha256: originalDependency,
    }),
  );
});

test("physical Document row and generated-function body drift change exact hashes", () => {
  const physicalRow = {
    id: "document-1",
    embedding: null,
    search_vector: "'food':1A",
  };
  const basePhysicalHash = sourceRegistrationPhysicalDocumentRowsSha256([
    physicalRow,
  ]);
  assert.notEqual(
    sourceRegistrationPhysicalDocumentRowsSha256([
      { ...physicalRow, embedding: "[0.1,0.2]" },
    ]),
    basePhysicalHash,
  );
  assert.notEqual(
    sourceRegistrationPhysicalDocumentRowsSha256([
      { ...physicalRow, search_vector: "'system':1A" },
    ]),
    basePhysicalHash,
  );

  const catalog = {
    generatedExpressionFunctions: [
      {
        functionSchema: "public",
        functionName: "immutable_to_tsvector_no",
        identityArguments: "text",
        definition: "SELECT original_body",
      },
    ],
  };
  assert.notEqual(
    sourceRegistrationDatabaseCatalogSha256({
      generatedExpressionFunctions: [
        {
          ...catalog.generatedExpressionFunctions[0],
          definition: "SELECT drifted_body",
        },
      ],
    }),
    sourceRegistrationDatabaseCatalogSha256(catalog),
  );
});

test("production and surrogate share the exact 10 + 10 + audit mutation core", async () => {
  const events: string[] = [];
  const contents = new Map(
    plan.targets.map((target) => [
      target.intendedDocumentRow.id,
      `reconstructed:${target.targetId}`,
    ]),
  );
  const operationKey = `source-registration-logical-clone-rehearsal-v1:${hash("4")}`;
  const tx = {
    document: {
      createMany: async ({ data }: { data: unknown[] }) => {
        events.push(`documents:${data.length}`);
        return { count: data.length };
      },
    },
    libraryAnalysisRecord: {
      createMany: async ({ data }: { data: unknown[] }) => {
        events.push(`libraries:${data.length}`);
        return { count: data.length };
      },
    },
    controlledMutationAudit: {
      create: async () => {
        events.push("audit:1");
        return { operationKey };
      },
    },
  };
  const result = await executeSourceRegistrationMutationCore({
    tx: tx as never,
    plan,
    contents,
    expectedOperationKey: operationKey,
    inspectAfterCreates: async () => {
      events.push("inspect:after-creates");
      return "after-creates";
    },
    buildAudit: async () => {
      events.push("build:audit");
      return {} as never;
    },
    inspectAfterAudit: async () => {
      events.push("inspect:after-audit");
      return "after-audit";
    },
    validateAfterAudit: () => {
      events.push("validate:after-audit");
    },
  });
  assert.deepEqual(events, [
    "documents:10",
    "libraries:10",
    "inspect:after-creates",
    "build:audit",
    "audit:1",
    "inspect:after-audit",
    "validate:after-audit",
  ]);
  assert.deepEqual(result, {
    afterCreates: "after-creates",
    afterAudit: "after-audit",
  });
});

test("target-set inspection terminates through one shared mocked query path", async () => {
  const contents = new Map(
    plan.targets.map((target) => [
      target.intendedDocumentRow.id,
      `mocked-content:${target.targetId}`,
    ]),
  );
  const searchVectors = new Map(
    plan.targets.map((target) => [
      target.intendedDocumentRow.id,
      `'mocked':1A '${target.intendedDocumentRow.id}':2C`,
    ]),
  );
  const firstTarget = plan.targets[0]!;
  const {
    contentBinding: _contentBinding,
    targetDataSha256: _documentTargetHash,
    ...documentProjection
  } = firstTarget.intendedDocumentRow;
  const { targetDataSha256: _libraryTargetHash, ...libraryProjection } =
    firstTarget.intendedLibraryAnalysisRow;
  const events: string[] = [];
  const dependencyArguments: Record<string, unknown> = {};
  let rawQueryCount = 0;
  const dependencyModel = (
    label: string,
    rows: Array<{ id: string }> = [],
  ) => ({
    findMany: async (args: unknown) => {
      events.push(label);
      dependencyArguments[label] = args;
      return rows;
    },
  });
  const tx = {
    $queryRaw: async () => {
      rawQueryCount += 1;
      if (rawQueryCount === 1) {
        events.push("search-vectors");
        return plan.targets.map((target) => ({
          id: target.intendedDocumentRow.id,
          searchVector: searchVectors.get(target.intendedDocumentRow.id)!,
        }));
      }
      if (rawQueryCount === 2) {
        events.push("document-rows");
        return [
          {
            physicalRow: {
              ...documentProjection,
              content: contents.get(firstTarget.intendedDocumentRow.id)!,
              embedding: null,
              search_vector: searchVectors.get(
                firstTarget.intendedDocumentRow.id,
              )!,
            },
          },
        ];
      }
      throw new Error("unexpected mocked raw query");
    },
    libraryAnalysisRecord: {
      findMany: async (args: unknown) => {
        events.push("library-rows");
        dependencyArguments["library-rows"] = args;
        return [libraryProjection];
      },
    },
    documentRef: dependencyModel("DocumentRef", [
      { id: "dependency.document-ref.1" },
    ]),
    report: dependencyModel("Report"),
    thesis: dependencyModel("Thesis"),
    sourceDoc: dependencyModel("SourceDoc"),
    insightDocumentRef: dependencyModel("InsightDocumentRef"),
    companyDocumentRef: dependencyModel("CompanyDocumentRef"),
    actorDocumentRef: dependencyModel("ActorDocumentRef"),
    sourceCitation: dependencyModel("SourceCitation"),
    fieldCitation: dependencyModel("FieldCitation"),
    evidenceAppraisal: dependencyModel("EvidenceAppraisal"),
  };

  const inspection = await inspectSourceRegistrationTargetSet({
    tx: tx as never,
    plan,
    contents,
  });
  assert.equal(rawQueryCount, 2);
  assert.deepEqual(events, [
    "search-vectors",
    "document-rows",
    "library-rows",
    "DocumentRef",
    "Report",
    "Thesis",
    "SourceDoc",
    "InsightDocumentRef",
    "CompanyDocumentRef",
    "ActorDocumentRef",
    "SourceCitation",
    "FieldCitation",
    "EvidenceAppraisal",
  ]);
  assert.equal(inspection.targetStates.length, plan.targets.length);
  assert.deepEqual(inspection.targetStates[0], {
    targetId: firstTarget.targetId,
    documentState: "exact",
    libraryState: "exact",
  });
  assert.equal(
    inspection.targetStates
      .slice(1)
      .every(
        (target) =>
          target.documentState === "absent" && target.libraryState === "absent",
      ),
    true,
  );
  assert.deepEqual(inspection.dependencyRows, [
    { relation: "DocumentRef", id: "dependency.document-ref.1" },
  ]);
  assert.match(inspection.dependencyRowsSha256, /^[a-f0-9]{64}$/);
  assert.ok(dependencyArguments["library-rows"]);
  assert.ok(dependencyArguments.DocumentRef);
  assert.ok(dependencyArguments.FieldCitation);

  const runnerSource = readFileSync(
    join(projectRoot, "scripts/knowledge/apply-source-registration-plan.ts"),
    "utf8",
  );
  const fullInspectionBody = runnerSource.slice(
    runnerSource.indexOf(
      "export async function inspectSourceRegistrationApplyDatabaseState",
    ),
    runnerSource.indexOf("function assertLockedIdentityAndLedger"),
  );
  assert.match(
    fullInspectionBody,
    /const targetSet = await inspectSourceRegistrationTargetSet\(/,
  );
  assert.equal(
    fullInspectionBody.includes("expectedDocumentSearchVectors"),
    false,
  );
});

test("backup structural verifier receives no database credential or launcher capability", () => {
  const environment = sourceRegistrationBackupVerifierEnvironment({
    DATABASE_URL: "postgresql://credential-must-not-propagate",
    NODE_OPTIONS: "--require=unsafe",
    PATH: "/controlled/bin:/usr/bin:/bin",
    SOURCE_REGISTRATION_LAUNCH_ATTESTATION_FD: "9",
    SOURCE_REGISTRATION_LAUNCHER_PID: "123",
  });
  assert.deepEqual(Object.keys(environment).sort(), [
    "BACKUP_REQUIRED_TABLES",
    "BACKUP_REQUIRE_METADATA_V2",
    "LANG",
    "LC_ALL",
    "PATH",
    "TMPDIR",
    "TZ",
  ]);
  assert.equal(environment.PATH, "/controlled/bin:/usr/bin:/bin");
  assert.equal(environment.DATABASE_URL, undefined);
  assert.equal(environment.NODE_OPTIONS, undefined);
  assert.equal(
    environment.SOURCE_REGISTRATION_LAUNCH_ATTESTATION_FD,
    undefined,
  );
  assert.equal(environment.SOURCE_REGISTRATION_LAUNCHER_PID, undefined);
});

test("apply option gate requires every exact plan, code, authority, and evidence pin", () => {
  const base = {
    mode: "apply" as const,
    manifestPath:
      "knowledge/corpus/source-registration/source-registration-batch-2026-08-02.v1.json",
    primaryCorpusRoot: "/private/a",
    replicaCorpusRoot: "/private/b",
  };
  assert.throws(
    () => validateExactApplyOptions({ options: base, codeBindings }),
    /requires --ack/,
  );
  const validOptions = {
    ...base,
    ack: SOURCE_REGISTRATION_APPLY_ACK,
    planSha256: SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256,
    planFileSha256: SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_FILE_SHA256,
    beforeSnapshotSha256:
      SOURCE_REGISTRATION_APPLY_LOCKED_BEFORE_SNAPSHOT_SHA256,
    databaseIdentityUuid:
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_IDENTITY_UUID,
    applyContractSha256: sourceRegistrationApplyContractSha256(),
    runtimeFileSha256: codeBindings.runtime.fileSha256,
    runnerFileSha256: codeBindings.runner.fileSha256,
    launcherFileSha256: codeBindings.launcher.fileSha256,
    runtimeLauncherTestFileSha256: codeBindings.runtimeLauncherTest.fileSha256,
    logicalCloneRehearsalRuntimeFileSha256:
      codeBindings.logicalCloneRehearsalRuntime.fileSha256,
    logicalCloneRehearsalSchemaFileSha256:
      codeBindings.logicalCloneRehearsalJsonSchema.fileSha256,
    logicalCloneRehearsalTestFileSha256:
      codeBindings.logicalCloneRehearsalTest.fileSha256,
    logicalCloneRehearsalCommandRunnerFileSha256:
      codeBindings.logicalCloneRehearsalCommandRunner.fileSha256,
    logicalRestoreCompanionValidatorFileSha256:
      codeBindings.logicalRestoreCompanionValidator.fileSha256,
    logicalRestoreCompanionSchemaFileSha256:
      codeBindings.logicalRestoreCompanionJsonSchema.fileSha256,
    logicalRestoreCompanionTestFileSha256:
      codeBindings.logicalRestoreCompanionTest.fileSha256,
    controlledLogicalRestoreCompanionRunnerFileSha256:
      codeBindings.controlledLogicalRestoreCompanionRunner.fileSha256,
    pdfQualificationRuntimeFileSha256:
      codeBindings.pdfQualificationRuntime.fileSha256,
    sourceAcquisitionRuntimeFileSha256:
      codeBindings.sourceAcquisitionRuntime.fileSha256,
    sourceAnalysisInputRuntimeFileSha256:
      codeBindings.sourceAnalysisInputRuntime.fileSha256,
    databaseLogicalStateDigestFileSha256:
      codeBindings.databaseLogicalStateDigest.fileSha256,
    databaseLogicalStateDigestTestFileSha256:
      codeBindings.databaseLogicalStateDigestTest.fileSha256,
    nodeRuntimeClosureManifestFileSha256:
      codeBindings.nodeRuntimeClosureManifest.fileSha256,
    nodeRuntimeClosureVerifierFileSha256:
      codeBindings.nodeRuntimeClosureVerifier.fileSha256,
    nodeRuntimeClosureVerifierTestFileSha256:
      codeBindings.nodeRuntimeClosureVerifierTest.fileSha256,
    postgresqlToolsetRuntimeClosureManifestFileSha256:
      codeBindings.postgresqlToolsetRuntimeClosureManifest.fileSha256,
    postgresqlToolsetRuntimeClosureVerifierFileSha256:
      codeBindings.postgresqlToolsetRuntimeClosureVerifier.fileSha256,
    postgresqlToolsetRuntimeClosureVerifierTestFileSha256:
      codeBindings.postgresqlToolsetRuntimeClosureVerifierTest.fileSha256,
    restoreRunnerFileSha256: codeBindings.restoreRunner.fileSha256,
    releaseAuthorizationVerifierFileSha256:
      codeBindings.releaseAuthorizationVerifier.fileSha256,
    releaseAuthorizationSchemaFileSha256:
      codeBindings.releaseAuthorizationJsonSchema.fileSha256,
    releaseAuthorizationContractFileSha256:
      codeBindings.releaseAuthorizationContract.fileSha256,
    releaseAuthorizationPublicKeyFileSha256:
      codeBindings.releaseAuthorizationPublicKey.fileSha256,
    releaseAuthorizationVerifierTestFileSha256:
      codeBindings.releaseAuthorizationVerifierTest.fileSha256,
    releaseAuthorizationSignerFileSha256:
      codeBindings.releaseAuthorizationSigner.fileSha256,
    releaseAuthorizationSignerTestFileSha256:
      codeBindings.releaseAuthorizationSignerTest.fileSha256,
    schemaFileSha256: codeBindings.jsonSchema.fileSha256,
    contractDocumentFileSha256: codeBindings.contractDocument.fileSha256,
    backupVerifierFileSha256: codeBindings.backupVerifier.fileSha256,
    backupContractHelperFileSha256:
      codeBindings.backupContractHelper.fileSha256,
    packageLockFileSha256: codeBindings.packageLock.fileSha256,
    prismaGeneratedClientTreeSha256:
      codeBindings.prismaGeneratedClientTree.treeSha256,
    nodeBinaryFileSha256: codeBindings.runtimeEnvironment.node.binaryFileSha256,
    nodeVersion: codeBindings.runtimeEnvironment.node.version,
    nodePlatform: codeBindings.runtimeEnvironment.node.platform,
    nodeArch: codeBindings.runtimeEnvironment.node.arch,
    nodeRuntimeClosureSha256:
      codeBindings.runtimeEnvironment.node.runtimeClosureSha256,
    nodeModulesTreeSha256:
      codeBindings.runtimeEnvironment.nodeModules.treeSha256,
    runtimeLocalClosureSha256:
      codeBindings.runtimeEnvironment.localClosure.closureSha256,
    postgresqlToolsetCreatedbBinaryFileSha256:
      codeBindings.runtimeEnvironment.postgresqlToolset.toolFileSha256.createdb,
    postgresqlToolsetDropdbBinaryFileSha256:
      codeBindings.runtimeEnvironment.postgresqlToolset.toolFileSha256.dropdb,
    postgresqlToolsetPgRestoreBinaryFileSha256:
      codeBindings.runtimeEnvironment.postgresqlToolset.toolFileSha256
        .pgRestore,
    postgresqlToolsetPsqlBinaryFileSha256:
      codeBindings.runtimeEnvironment.postgresqlToolset.toolFileSha256.psql,
    postgresqlToolsetPsqlVersion:
      codeBindings.runtimeEnvironment.postgresqlToolset.psqlVersion,
    postgresqlToolsetRuntimeClosureSha256:
      codeBindings.runtimeEnvironment.postgresqlToolset.closureSha256,
    runtimeAttestationSha256:
      codeBindings.runtimeEnvironment.runtimeAttestationSha256,
    databaseTargetSha256:
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET_SHA256,
    databaseCatalogSha256:
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_CATALOG_SHA256,
    operatorId: SOURCE_REGISTRATION_APPLY_AI_OPERATOR_ID,
    ownerScopeAuthorizationRef:
      SOURCE_REGISTRATION_APPLY_OWNER_SCOPE_AUTHORIZATION_REF,
    exactOperatorAuthorizationRef:
      sourceRegistrationExactOperatorAuthorizationRef({
        runtimeAttestationSha256:
          codeBindings.runtimeEnvironment.runtimeAttestationSha256,
        authorizationEnvelopeSha256: hash("6"),
      }),
    databaseRole: SOURCE_REGISTRATION_APPLY_DATABASE_ROLE,
    backupFile: "/private/backup.dump",
    structuralRestoreReceipt: "/private/structural-restore.json",
    logicalRestoreCompanionReceipt: "/private/logical-companion.json",
    logicalCloneRehearsalReceipt: "/private/logical-rehearsal.json",
    releaseAuthorization: "/private/release-authorization.json",
    expectedReleaseAuthorizationSha256: hash("6"),
    expectedBackupSha256: hash("1"),
    expectedBackupBytes: 123,
    expectedBackupMetadataSha256: hash("2"),
    expectedStructuralRestoreReceiptSha256: hash("3"),
    expectedLogicalRestoreCompanionReceiptSha256: hash("4"),
    expectedLogicalCloneRehearsalReceiptFileSha256: hash("5"),
    expectedLogicalCloneRehearsalReceiptSelfSha256: hash("6"),
    expectedLogicalComparisonProofSha256: hash("7"),
    expectedMigrationLedgerSha256: hash("4"),
    expectedTargetFingerprintSha256: hash("5"),
  };
  const withoutOption = (key: keyof typeof validOptions) => {
    const candidate = { ...validOptions };
    Reflect.deleteProperty(candidate, key);
    return candidate;
  };
  const withOption = (key: keyof typeof validOptions, value: string) => {
    const candidate = { ...validOptions };
    Reflect.set(candidate, key, value);
    return candidate;
  };

  const exactCodeBindingPins = [
    [
      "logicalCloneRehearsalRuntimeFileSha256",
      "--logical-clone-rehearsal-runtime-file-sha256",
    ],
    [
      "logicalCloneRehearsalSchemaFileSha256",
      "--logical-clone-rehearsal-schema-file-sha256",
    ],
    [
      "logicalCloneRehearsalTestFileSha256",
      "--logical-clone-rehearsal-test-file-sha256",
    ],
    [
      "logicalCloneRehearsalCommandRunnerFileSha256",
      "--logical-clone-rehearsal-command-runner-file-sha256",
    ],
    [
      "logicalRestoreCompanionValidatorFileSha256",
      "--logical-restore-companion-validator-file-sha256",
    ],
    [
      "logicalRestoreCompanionSchemaFileSha256",
      "--logical-restore-companion-schema-file-sha256",
    ],
    [
      "logicalRestoreCompanionTestFileSha256",
      "--logical-restore-companion-test-file-sha256",
    ],
    [
      "controlledLogicalRestoreCompanionRunnerFileSha256",
      "--controlled-logical-restore-companion-runner-file-sha256",
    ],
    [
      "postgresqlToolsetRuntimeClosureManifestFileSha256",
      "--postgresql-toolset-runtime-closure-manifest-file-sha256",
    ],
    [
      "postgresqlToolsetRuntimeClosureVerifierFileSha256",
      "--postgresql-toolset-runtime-closure-verifier-file-sha256",
    ],
    [
      "postgresqlToolsetRuntimeClosureVerifierTestFileSha256",
      "--postgresql-toolset-runtime-closure-verifier-test-file-sha256",
    ],
    [
      "postgresqlToolsetCreatedbBinaryFileSha256",
      "--postgresql-toolset-createdb-binary-file-sha256",
    ],
    [
      "postgresqlToolsetDropdbBinaryFileSha256",
      "--postgresql-toolset-dropdb-binary-file-sha256",
    ],
    [
      "postgresqlToolsetPgRestoreBinaryFileSha256",
      "--postgresql-toolset-pg-restore-binary-file-sha256",
    ],
    [
      "postgresqlToolsetPsqlBinaryFileSha256",
      "--postgresql-toolset-psql-binary-file-sha256",
    ],
    ["postgresqlToolsetPsqlVersion", "--postgresql-toolset-psql-version"],
    [
      "postgresqlToolsetRuntimeClosureSha256",
      "--postgresql-toolset-runtime-closure-sha256",
    ],
  ] as const satisfies ReadonlyArray<
    readonly [keyof typeof validOptions, string]
  >;
  for (const [key, label] of exactCodeBindingPins) {
    const exactPinError = new RegExp(`${label} must equal`);
    assert.throws(
      () =>
        validateExactApplyOptions({
          codeBindings,
          options: withoutOption(key),
        }),
      exactPinError,
      `${label} deletion must fail closed`,
    );
    assert.throws(
      () =>
        validateExactApplyOptions({
          codeBindings,
          options: withOption(key, hash("f")),
        }),
      exactPinError,
      `${label} mutation must fail closed`,
    );
  }

  const evidencePaths = [
    ["structuralRestoreReceipt", "--structural-restore-receipt"],
    ["logicalRestoreCompanionReceipt", "--logical-restore-companion-receipt"],
    ["logicalCloneRehearsalReceipt", "--logical-clone-rehearsal-receipt"],
  ] as const satisfies ReadonlyArray<
    readonly [keyof typeof validOptions, string]
  >;
  for (const [key, label] of evidencePaths) {
    const requiredEvidenceError = new RegExp(`--apply requires ${label}`);
    assert.throws(
      () =>
        validateExactApplyOptions({
          codeBindings,
          options: withoutOption(key),
        }),
      requiredEvidenceError,
      `${label} deletion must fail closed`,
    );
    assert.throws(
      () =>
        validateExactApplyOptions({
          codeBindings,
          options: withOption(key, ""),
        }),
      requiredEvidenceError,
      `${label} empty mutation must fail closed`,
    );
  }

  const evidenceSha256Pins = [
    ["expectedBackupSha256", "--expected-backup-sha256"],
    ["expectedBackupMetadataSha256", "--expected-backup-metadata-sha256"],
    [
      "expectedStructuralRestoreReceiptSha256",
      "--expected-structural-restore-receipt-sha256",
    ],
    [
      "expectedLogicalRestoreCompanionReceiptSha256",
      "--expected-logical-restore-companion-receipt-sha256",
    ],
    [
      "expectedLogicalCloneRehearsalReceiptFileSha256",
      "--expected-logical-clone-rehearsal-receipt-file-sha256",
    ],
    [
      "expectedLogicalCloneRehearsalReceiptSelfSha256",
      "--expected-logical-clone-rehearsal-receipt-self-sha256",
    ],
    [
      "expectedLogicalComparisonProofSha256",
      "--expected-logical-comparison-proof-sha256",
    ],
    ["expectedMigrationLedgerSha256", "--expected-migration-ledger-sha256"],
    ["expectedTargetFingerprintSha256", "--expected-target-fingerprint-sha256"],
  ] as const satisfies ReadonlyArray<
    readonly [keyof typeof validOptions, string]
  >;
  for (const [key, label] of evidenceSha256Pins) {
    assert.throws(
      () =>
        validateExactApplyOptions({
          codeBindings,
          options: withoutOption(key),
        }),
      new RegExp(`--apply requires ${label}`),
      `${label} deletion must fail closed`,
    );
    assert.throws(
      () =>
        validateExactApplyOptions({
          codeBindings,
          options: withOption(key, "not-a-sha256"),
        }),
      new RegExp(`${label} must be a lowercase SHA-256`),
      `${label} malformed mutation must fail closed`,
    );
  }

  const authorization = validateExactApplyOptions({
    codeBindings,
    options: validOptions,
  });
  assert.equal(authorization.exactOperatorApplyAuthorized, false);
  assert.equal(authorization.signedReleaseAuthorizationRequired, true);
  assert.equal(authorization.ownerScopeApplyAuthorized, false);
});

test("owner scope cannot impersonate exact operator authority or an MCP role", () => {
  const runtimeAttestationSha256 =
    codeBindings.runtimeEnvironment.runtimeAttestationSha256;
  const authorizationEnvelopeSha256 = hash("d");
  const exact = sourceRegistrationExactOperatorAuthorizationRef({
    runtimeAttestationSha256,
    authorizationEnvelopeSha256,
  });
  const valid = validateSourceRegistrationApplyAuthorization({
    operatorId: SOURCE_REGISTRATION_APPLY_AI_OPERATOR_ID,
    ownerScopeAuthorizationRef:
      SOURCE_REGISTRATION_APPLY_OWNER_SCOPE_AUTHORIZATION_REF,
    exactOperatorAuthorizationRef: exact,
    databaseRole: SOURCE_REGISTRATION_APPLY_DATABASE_ROLE,
    runtimeAttestationSha256,
    authorizationEnvelopeSha256,
  });
  assert.equal(valid.ownerScopeApplyAuthorized, false);
  assert.equal(valid.exactOperatorApplyAuthorized, false);
  assert.equal(valid.signedReleaseAuthorizationRequired, true);
  assert.throws(
    () =>
      validateSourceRegistrationApplyAuthorization({
        operatorId: SOURCE_REGISTRATION_APPLY_AI_OPERATOR_ID,
        ownerScopeAuthorizationRef:
          SOURCE_REGISTRATION_APPLY_OWNER_SCOPE_AUTHORIZATION_REF,
        exactOperatorAuthorizationRef: "exact-plan-operator:missing-bindings",
        databaseRole: SOURCE_REGISTRATION_APPLY_DATABASE_ROLE,
        runtimeAttestationSha256,
        authorizationEnvelopeSha256,
      }),
    /Invalid string|derived path-free locked reference/,
  );
  assert.throws(
    () =>
      validateSourceRegistrationApplyAuthorization({
        operatorId: SOURCE_REGISTRATION_APPLY_AI_OPERATOR_ID,
        ownerScopeAuthorizationRef:
          SOURCE_REGISTRATION_APPLY_OWNER_SCOPE_AUTHORIZATION_REF,
        exactOperatorAuthorizationRef: exact,
        databaseRole: "foodsystems_mcp_writer",
        runtimeAttestationSha256,
        authorizationEnvelopeSha256,
      }),
    /Database role must be exactly foodsystems/,
  );
});

test("receipt distinguishes the pre-apply backup fingerprint from the after-state fingerprint", () => {
  const { summary } = receiptFixture();
  assert.notEqual(
    summary.afterSnapshot.preApplyTargetFingerprintSha256,
    summary.afterSnapshot.afterApplyTargetFingerprintSha256,
  );
  assert.equal(
    summary.afterSnapshot.preApplyTargetFingerprintSha256,
    summary.releaseEvidence.targetFingerprintSha256,
  );

  const { afterSnapshotSha256: _afterSeal, ...snapshotBody } =
    summary.afterSnapshot;
  const confusedSnapshot = sealSourceRegistrationAfterSnapshot({
    ...snapshotBody,
    preApplyTargetFingerprintSha256:
      summary.afterSnapshot.afterApplyTargetFingerprintSha256,
  });
  const { summarySha256: _seal, ...body } = summary;
  const confused = sealSourceRegistrationApplyMutationSummary({
    ...body,
    afterSnapshot: confusedSnapshot,
  });
  assert.throws(
    () => validateSourceRegistrationApplyMutationSummary(confused),
    /confuses pre-apply evidence/,
  );
});

test("legacy audit restore receipt binding remains the structural receipt", () => {
  const { summary, releaseEvidence } = receiptFixture();
  const audit = sourceRegistrationControlledMutationAudit({ summary });
  assert.equal(
    audit.restoreReceiptSha256,
    releaseEvidence.structuralRestoreReceiptSha256,
  );
  assert.notEqual(
    audit.restoreReceiptSha256,
    releaseEvidence.logicalRestoreCompanion.receiptFileSha256,
  );
});

test("receipted replay requires the exact current CLI, envelope, and proof bindings", () => {
  const { summary, authorization, releaseAuthorization, releaseEvidence } =
    receiptFixture();
  assert.doesNotThrow(() =>
    assertSourceRegistrationCurrentReplayBindings({
      summary,
      authorization,
      releaseAuthorization,
      releaseEvidence,
    }),
  );
  const driftedEnvelope = structuredClone(releaseAuthorization);
  driftedEnvelope.envelopeSha256 = hash("8");
  assert.throws(
    () =>
      assertSourceRegistrationCurrentReplayBindings({
        summary,
        authorization,
        releaseAuthorization: driftedEnvelope,
        releaseEvidence,
      }),
    /current signed release authorization/,
  );
  const driftedEvidence = structuredClone(releaseEvidence);
  driftedEvidence.logicalRestoreCompanion.receiptFileSha256 = hash("7");
  assert.throws(
    () =>
      assertSourceRegistrationCurrentReplayBindings({
        summary,
        authorization,
        releaseAuthorization,
        releaseEvidence: driftedEvidence,
      }),
    /current release evidence/,
  );
});

test("public receipted-noop path refuses different current proof before replay", () => {
  const {
    summary,
    authorization,
    releaseAuthorization,
    releaseEvidence,
    operationKey,
  } = receiptFixture();
  const audit = sourceRegistrationControlledMutationAudit({ summary });
  const driftedEvidence = {
    ...releaseEvidence,
    logicalCloneRehearsal: {
      ...releaseEvidence.logicalCloneRehearsal,
      receiptFileSha256: hash("9"),
    },
  };
  const classificationState = {
    targetStates: plan.targets.map((target) => ({
      targetId: target.targetId,
      documentState: "exact" as const,
      libraryState: "exact" as const,
    })),
    dependencyRows: [],
    audits: [audit],
  } as unknown as Parameters<
    typeof assertReceiptedSourceRegistrationNoop
  >[0]["state"];
  assert.throws(
    () =>
      assertReceiptedSourceRegistrationNoop({
        state: classificationState,
        plan,
        codeBindings,
        operationKey,
        currentReplayBindings: {
          authorization,
          releaseAuthorization,
          releaseEvidence: driftedEvidence,
        },
      }),
    /current release evidence/,
  );
});

test("only exact 10 + 10 state with one self-consistent audit is a no-op", () => {
  const { summary } = receiptFixture();
  const audit = sourceRegistrationControlledMutationAudit({ summary });
  const targets = plan.targets.map((target) => ({
    targetId: target.targetId,
    documentState: "exact" as const,
    libraryState: "exact" as const,
  }));
  assert.equal(
    classifySourceRegistrationExistingState({
      targets,
      dependencyRowCount: 0,
      audits: [audit],
    }).state,
    "receipted_noop",
  );
  assert.deepEqual(
    classifySourceRegistrationExistingState({
      targets,
      dependencyRowCount: 0,
      audits: [],
    }),
    { state: "conflict", codes: ["unreceipted_after_state"] },
  );
  assert.equal(
    classifySourceRegistrationExistingState({
      targets: targets.map((target, index) =>
        index === 0 ? { ...target, libraryState: "absent" as const } : target,
      ),
      dependencyRowCount: 0,
      audits: [],
    }).state,
    "conflict",
  );
  assert.equal(
    classifySourceRegistrationExistingState({
      targets,
      dependencyRowCount: 1,
      audits: [audit],
    }).state,
    "conflict",
  );
});

test("receipt self-hashes reject mutation and never contain source text or private paths", () => {
  const { summary } = receiptFixture();
  assert.doesNotThrow(() =>
    SourceRegistrationApplyMutationSummarySchema.parse(summary),
  );
  const changed = structuredClone(
    summary,
  ) as SourceRegistrationApplyMutationSummary;
  changed.rows.documentCreates = 9 as 10;
  assert.throws(
    () => validateSourceRegistrationApplyMutationSummary(changed),
    /expected 10|self-hash mismatch/,
  );
  const serialized = JSON.stringify(summary);
  assert.equal(serialized.includes('":"/'), false);
  assert.equal(serialized.includes("--food-systems-page-boundary-v1--"), false);
});

test("recursive audit leak facts catch embedded private paths, credentials, and source text", () => {
  for (const privatePath of [
    "ref:/private/archive/page.txt",
    "see /Volumes/private-corpus/page.txt",
    "see /home/operator/page.txt",
    "see /var/folders/ab/temp/page.txt",
    String.raw`see C:\Users\operator\page.txt`,
    String.raw`see \\server\private\page.txt`,
    "file:///Users/operator/page.txt",
  ]) {
    assert.equal(
      sourceRegistrationAuditLeakFacts({ nested: [{ ref: privatePath }] })
        .privateAbsolutePathsStoredInAudit,
      true,
      privatePath,
    );
  }
  assert.equal(
    sourceRegistrationAuditLeakFacts({
      nested: { ref: "https://operator:password@example.invalid/file" },
    }).credentialBearingTextStoredInAudit,
    true,
  );
  assert.equal(
    sourceRegistrationAuditLeakFacts({ nested: { content: "source body" } })
      .sourceTextStoredInAudit,
    true,
  );
  assert.deepEqual(
    sourceRegistrationAuditLeakFacts({
      officialUrl: "https://example.org/reports/official.pdf",
      portablePath: "knowledge/corpus/report.json",
    }),
    {
      credentialBearingTextStoredInAudit: false,
      privateAbsolutePathsStoredInAudit: false,
      sourceTextStoredInAudit: false,
    },
  );
});

test("private leaf verifier rejects a symlinked parent even when the leaf is mode 0400", () => {
  const root = mkdtempSync(join(tmpdir(), "source-registration-root-"));
  const outside = mkdtempSync(join(tmpdir(), "source-registration-outside-"));
  try {
    chmodSync(root, 0o700);
    chmodSync(outside, 0o700);
    const directDir = join(root, "direct");
    mkdirSync(directDir, { mode: 0o700 });
    const directFile = join(directDir, "page.txt");
    writeFileSync(directFile, "verified", { mode: 0o400 });
    assert.equal(
      readPrivateLeafInsideRoot({
        rootRealPath: realpathSync(root),
        portablePath: "direct/page.txt",
        label: "direct leaf",
      }).bytes.toString("utf8"),
      "verified",
    );

    const outsideFile = join(outside, "page.txt");
    writeFileSync(outsideFile, "escape", { mode: 0o400 });
    symlinkSync(outside, join(root, "linked"), "dir");
    assert.throws(
      () =>
        readPrivateLeafInsideRoot({
          rootRealPath: realpathSync(root),
          portablePath: "linked/page.txt",
          label: "linked parent leaf",
        }),
      /follows a symlink|outside the private root/,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  }
});

test("logical evidence reader requires exact mode 0400 and one filesystem link", () => {
  const root = realpathSync(
    mkdtempSync(join(tmpdir(), "source-registration-logical-evidence-")),
  );
  chmodSync(root, 0o700);
  const evidence = join(root, "companion.json");
  const alias = join(root, "companion-alias.json");
  try {
    writeFileSync(evidence, "{}\n", { mode: 0o400 });
    assert.equal(
      readStablePrivateEvidenceFile({
        path: evidence,
        projectRoot,
        label: "logical evidence",
      }).singleLink,
      true,
    );

    chmodSync(evidence, 0o600);
    assert.throws(
      () =>
        readStablePrivateEvidenceFile({
          path: evidence,
          projectRoot,
          label: "logical evidence",
        }),
      /mode-0400 regular single-link file/,
    );

    chmodSync(evidence, 0o400);
    linkSync(evidence, alias);
    assert.throws(
      () =>
        readStablePrivateEvidenceFile({
          path: evidence,
          projectRoot,
          label: "logical evidence",
        }),
      /mode-0400 regular single-link file/,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("JSON Schema validates the complete receipt and requires exact hardening fields", () => {
  const schema = JSON.parse(
    readFileSync(
      join(
        projectRoot,
        "knowledge/schema/source-registration-apply-receipt.schema.v1.json",
      ),
      "utf8",
    ),
  ) as Record<string, unknown>;
  const validate = new Ajv2020({ allErrors: true, strict: true }).compile(
    schema,
  );
  const { summary } = receiptFixture();
  assert.equal(validate(summary), true, JSON.stringify(validate.errors));
  for (const path of [
    ["releaseAuthorization", "acknowledgement"],
    ["releaseAuthorization", "databaseRole"],
    ["databaseTarget"],
    ["databaseCatalog"],
    ["auditDurability"],
  ]) {
    const missing = JSON.parse(JSON.stringify(summary));
    const parent = path
      .slice(0, -1)
      .reduce((value, key) => value[key], missing);
    delete parent[path.at(-1)!];
    assert.equal(validate(missing), false, path.join("."));
  }
  const afterSnapshot = (schema.properties as Record<string, unknown>)
    .afterSnapshot as {
    required: string[];
  };
  assert.ok(afterSnapshot.required.includes("preApplyTargetFingerprintSha256"));
  assert.ok(
    afterSnapshot.required.includes("afterApplyTargetFingerprintSha256"),
  );
  assert.equal(
    SourceRegistrationAfterSnapshotSchema.safeParse({}).success,
    false,
  );
});

assert.equal(SOURCE_REGISTRATION_APPLY_CONTRACT_SCOPE.length > 0, true);
assert.match(
  SOURCE_REGISTRATION_APPLY_LOCKED_BEFORE_SNAPSHOT_SHA256,
  /^[a-f0-9]{64}$/,
);
