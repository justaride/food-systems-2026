import assert from "node:assert/strict";
import {
  chmodSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import Ajv2020 from "ajv/dist/2020";

import {
  SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_FILE_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_TARGET_SET_SHA256,
} from "../../src/lib/knowledge/source-registration-apply";
import {
  sealSourceRegistrationLogicalCloneRehearsalReceipt,
  sealSourceRegistrationLogicalComparisonProof,
  sourceRegistrationLogicalCloneRehearsalOperationKey,
  validateSourceRegistrationLogicalCloneRehearsalReceipt,
} from "../../src/lib/knowledge/source-registration-logical-clone-rehearsal";
import {
  publishPrivateReceipt,
  safeRehearsalRunnerErrorMessage,
} from "../../scripts/knowledge/run-source-registration-logical-clone-rehearsal";

const hash = (character: string) => character.repeat(64);

function fixture() {
  const logicalComparisonProof = sealSourceRegistrationLogicalComparisonProof({
    schemaVersion: "source-registration-logical-comparison-proof-v1",
    backupSha256: hash("a"),
    backupMetadataSha256: hash("b"),
    structuralRestoreReceiptSha256: hash("c"),
    source: {
      contentStateSha256: hash("3"),
      logicalStateSha256: hash("d"),
      relationCount: 56,
      totalRowCount: 555_189,
      sequenceRowCount: 0,
    },
    restored: {
      contentStateSha256: hash("3"),
      logicalStateSha256: hash("e"),
      relationCount: 56,
      totalRowCount: 555_189,
      sequenceRowCount: 0,
    },
    contentStateAndCountsMatch: true,
    targetBoundLogicalStatesDiffer: true,
  });
  const operationKey = sourceRegistrationLogicalCloneRehearsalOperationKey({
    planSha256: SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256,
    targetSetSha256: SOURCE_REGISTRATION_APPLY_LOCKED_TARGET_SET_SHA256,
    applyRunnerSha256: hash("2"),
    rehearsalRuntimeSha256: hash("3"),
    rehearsalSchemaSha256: hash("4"),
    rehearsalTestSha256: hash("5"),
    rehearsalCommandRunnerSha256: hash("6"),
    runtimeAttestationSha256: hash("7"),
    logicalComparisonProofSha256:
      logicalComparisonProof.logicalComparisonProofSha256,
  });
  return sealSourceRegistrationLogicalCloneRehearsalReceipt({
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
    applyRunnerSha256: hash("2"),
    rehearsalRuntimeSha256: hash("3"),
    rehearsalSchemaSha256: hash("4"),
    rehearsalTestSha256: hash("5"),
    rehearsalCommandRunnerSha256: hash("6"),
    executedRuntime: {
      runtimeAttestationSha256: hash("7"),
      launcherFileSha256: hash("8"),
      nodeBinaryFileSha256: hash("9"),
      nodeRuntimeClosureSha256: hash("a"),
      nodeVersion: "v24.4.1",
      nodePlatform: "darwin",
      nodeArch: "arm64",
      nodeModulesTreeSha256: hash("b"),
      prismaGeneratedClientTreeSha256: hash("c"),
      localRuntimeClosureSha256: hash("d"),
    },
    logicalComparisonProof,
    operationKey,
    rehearsalStartedAtUtc: "2026-08-03T03:00:00.000Z",
    rehearsalCompletedAtUtc: "2026-08-03T03:00:01.000Z",
    beforeCounts: {
      documents: 100,
      libraryAnalysisRecords: 200,
      controlledMutationAudits: 0,
    },
    insideTransaction: {
      isolationLevel: "Serializable",
      documentCreates: 10,
      libraryAnalysisRecordCreates: 10,
      controlledMutationAuditCreates: 1,
      exactDocumentRows: 10,
      exactLibraryAnalysisRows: 10,
      dependencyRowCount: 0,
      physicalDocumentRowsSha256: hash("5"),
      libraryAnalysisRowsSha256: hash("6"),
      rehearsalAuditSummarySha256: hash("7"),
    },
    rollback: {
      forcedBySentinel: true,
      transactionRolledBack: true,
      rollbackAbsenceConfirmed: true,
      afterCountsEqualBeforeCounts: true,
      targetRowsAbsentAfterRollback: true,
      rehearsalAuditAbsentAfterRollback: true,
    },
    afterRollbackCounts: {
      documents: 100,
      libraryAnalysisRecords: 200,
      controlledMutationAudits: 0,
    },
    cloneDatabaseNameStored: false,
    privateAbsolutePathStored: false,
    databaseCredentialStored: false,
  });
}

test("logical-clone rehearsal receipt is path-free, self-hashed, and explicitly surrogate", () => {
  const receipt = fixture();
  assert.doesNotThrow(() =>
    validateSourceRegistrationLogicalCloneRehearsalReceipt(receipt, {
      now: new Date("2026-08-03T03:10:00.000Z"),
    }),
  );
  assert.equal(receipt.targetClass, "logical_clone_surrogate");
  assert.equal(receipt.exactProductionTargetExercised, false);
  assert.equal(receipt.firstExactMutationRemainsLive, true);
  assert.equal(receipt.rollback.transactionRolledBack, true);
  assert.equal(JSON.stringify(receipt).includes('":"/'), false);

  const drifted = structuredClone(receipt);
  drifted.insideTransaction.physicalDocumentRowsSha256 = hash("8");
  assert.throws(
    () => validateSourceRegistrationLogicalCloneRehearsalReceipt(drifted),
    /self-hash mismatch/,
  );
});

test("logical-clone rehearsal rejects noncanonical, stale, and mismatched proof timing", () => {
  const receipt = fixture();
  assert.throws(
    () =>
      validateSourceRegistrationLogicalCloneRehearsalReceipt(receipt, {
        now: new Date("2026-08-05T03:10:00.000Z"),
      }),
    /stale or future-dated/,
  );
  const noncanonical = structuredClone(receipt) as Record<string, unknown>;
  noncanonical.rehearsalCompletedAtUtc = "2026-08-03T03:00:01.0Z";
  assert.throws(() =>
    validateSourceRegistrationLogicalCloneRehearsalReceipt(noncanonical, {
      now: new Date("2026-08-03T03:10:00.000Z"),
    }),
  );
  const mismatched = structuredClone(receipt);
  mismatched.logicalComparisonProof.restored.totalRowCount += 1;
  assert.throws(
    () =>
      validateSourceRegistrationLogicalCloneRehearsalReceipt(mismatched, {
        now: new Date("2026-08-03T03:10:00.000Z"),
      }),
    /self-hash mismatch|content state or counts differ/,
  );
  const {
    logicalComparisonProofSha256: _proofHash,
    ...equalLogicalStateProofBody
  } = receipt.logicalComparisonProof;
  equalLogicalStateProofBody.restored.logicalStateSha256 =
    equalLogicalStateProofBody.source.logicalStateSha256;
  assert.throws(
    () =>
      sealSourceRegistrationLogicalComparisonProof(equalLogicalStateProofBody),
    /logical state hashes must differ/,
  );

  const { receiptSha256: _receiptHash, ...overlongBody } = fixture();
  overlongBody.rehearsalCompletedAtUtc = "2026-08-03T03:16:00.001Z";
  assert.throws(
    () => sealSourceRegistrationLogicalCloneRehearsalReceipt(overlongBody),
    /exceeded its maximum duration/,
  );

  const { receiptSha256: _semanticHash, ...semanticallyDrifted } = fixture();
  semanticallyDrifted.rehearsalTestSha256 = hash("8");
  assert.throws(
    () =>
      sealSourceRegistrationLogicalCloneRehearsalReceipt(semanticallyDrifted),
    /operation key mismatch/,
  );
});

test("logical-clone rehearsal JSON Schema accepts only the exact rollback receipt", () => {
  const schema = JSON.parse(
    readFileSync(
      join(
        process.cwd(),
        "knowledge/schema/source-registration-logical-clone-rehearsal-receipt.schema.v1.json",
      ),
      "utf8",
    ),
  );
  const validate = new Ajv2020({ allErrors: true, strict: true }).compile(
    schema,
  );
  const receipt = fixture();
  assert.equal(validate(receipt), true, JSON.stringify(validate.errors));
  const unsafe = structuredClone(receipt) as Record<string, unknown>;
  unsafe.exactProductionTargetExercised = true;
  assert.equal(validate(unsafe), false);
});

test("private rehearsal publication is outside-repo, no-overwrite, durable, and cleanup-safe", () => {
  const sandbox = realpathSync(
    mkdtempSync(join(tmpdir(), "source-registration-rehearsal-publish-")),
  );
  const projectRoot = join(sandbox, "project");
  const privateRoot = join(sandbox, "private");
  mkdirSync(projectRoot, { mode: 0o700 });
  mkdirSync(privateRoot, { mode: 0o700 });
  chmodSync(projectRoot, 0o700);
  chmodSync(privateRoot, 0o700);
  const receiptBytes = Buffer.from('{"safe":true}\n', "utf8");
  try {
    const insideRoot = join(projectRoot, "private");
    mkdirSync(insideRoot, { mode: 0o700 });
    assert.throws(
      () =>
        publishPrivateReceipt(
          join(insideRoot, "receipt.json"),
          receiptBytes,
          projectRoot,
        ),
      /must be outside the project/,
    );

    const linkedParent = join(sandbox, "linked-private");
    symlinkSync(privateRoot, linkedParent);
    assert.throws(
      () =>
        publishPrivateReceipt(
          join(linkedParent, "receipt.json"),
          receiptBytes,
          projectRoot,
        ),
      /not canonical mode-0700 storage/,
    );

    const racedOutput = join(privateRoot, "raced.json");
    const attackerBytes = Buffer.from("attacker-owned\n", "utf8");
    assert.throws(
      () =>
        publishPrivateReceipt(racedOutput, receiptBytes, projectRoot, {
          afterOutputPathCheck() {
            writeFileSync(racedOutput, attackerBytes, { mode: 0o400 });
          },
        }),
      /could not be published safely/,
    );
    assert.deepEqual(readFileSync(racedOutput), attackerBytes);
    unlinkSync(racedOutput);

    const faultedOutput = join(privateRoot, "faulted.json");
    let fault: unknown;
    try {
      publishPrivateReceipt(faultedOutput, receiptBytes, projectRoot, {
        afterHardLink() {
          throw new Error(
            "private path /secret/rehearsal and postgresql://user:token@host/db",
          );
        },
      });
    } catch (error) {
      fault = error;
    }
    assert.equal(
      safeRehearsalRunnerErrorMessage(fault),
      "Source-registration logical-clone rehearsal runner refused: private rehearsal receipt could not be published safely",
    );
    assert.throws(() => lstatSync(faultedOutput), { code: "ENOENT" });

    const publishedOutput = join(privateRoot, "published.json");
    const publication = publishPrivateReceipt(
      publishedOutput,
      receiptBytes,
      projectRoot,
    );
    assert.equal(publication.privateReceiptStoredOutsideRepo, true);
    assert.deepEqual(readFileSync(publishedOutput), receiptBytes);
    const stats = lstatSync(publishedOutput);
    assert.equal(stats.isFile(), true);
    assert.equal(stats.isSymbolicLink(), false);
    assert.equal(stats.nlink, 1);
    assert.equal(stats.mode & 0o777, 0o400);
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
});
