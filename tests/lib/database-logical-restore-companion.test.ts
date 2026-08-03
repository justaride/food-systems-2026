import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  lstatSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import { sealSourceRegistrationLogicalComparisonProof } from "../../src/lib/knowledge/source-registration-logical-clone-rehearsal";

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
  LOGICAL_RESTORE_REHEARSAL_PLAN_FILE_SHA256,
  LOGICAL_RESTORE_REHEARSAL_PLAN_SHA256,
  LOGICAL_RESTORE_REHEARSAL_SCHEMA_VERSION,
  LOGICAL_RESTORE_REHEARSAL_TARGET_CLASS,
  LOGICAL_RESTORE_REHEARSAL_TARGET_SET_SHA256,
  canonicalLogicalRestoreCompanionJson,
  logicalRestoreCompanionSha256,
  logicalRestoreRehearsalOperationKey,
  sealLogicalRestoreComparisonProof,
  parseCanonicalLogicalRestoreCompanionReceipt,
  validateLogicalRestoreCompanionReceipt,
} from "../../scripts/knowledge/logical-restore-companion-receipt.mjs";
import {
  canonicalControlledEvidenceUtcTimestamp,
  controlledCloneOwnershipComment,
  controlledCloneDigestDatabaseUrl,
  controlledLogicalRestoreSignalExitCode,
  executeLogicalRestoreComparisonSession,
  publishAtomicPrivateCanonicalJson,
  runControlledNonInterruptibleNestedCommand,
  verifyControlledCloneOwnershipMarker,
} from "../../scripts/knowledge/run-controlled-logical-restore-companion.mjs";

const repoRoot = resolve(import.meta.dirname, "../..");
const runnerPath = join(
  repoRoot,
  "scripts/knowledge/run-controlled-logical-restore-companion.mjs",
);
const schema = JSON.parse(
  readFileSync(
    join(
      repoRoot,
      "knowledge/schema/database-logical-restore-companion-receipt.schema.v1.json",
    ),
    "utf8",
  ),
) as Record<string, unknown>;
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateSchema = ajv.compile(schema);

const HASH_A = "a".repeat(64);
const HASH_B = "b".repeat(64);
const HASH_C = "c".repeat(64);
const HASH_D = "d".repeat(64);
const HASH_E = "e".repeat(64);
const baseTime = Date.now() - 60 * 60 * 1000;
const at = (offsetMinutes: number) =>
  new Date(baseTime + offsetMinutes * 60 * 1000).toISOString();

function toolBindings() {
  return {
    contextBindings: {
      backupContractHelperSha256: HASH_A,
      backupVerifierSha256: HASH_B,
      companionReceiptSchemaSha256: HASH_C,
      sourceRegistrationLogicalCloneRehearsalTestSha256: HASH_E,
      structuralRestoreRunnerSha256: HASH_D,
    },
    executedTools: {
      companionReceiptValidatorSha256: HASH_A,
      companionRunnerSha256: HASH_B,
      createdbBinarySha256: HASH_C,
      databaseLogicalDigestSha256: HASH_D,
      dropdbBinarySha256: HASH_E,
      pgRestoreBinarySha256: HASH_A,
      psqlBinarySha256: HASH_B,
      psqlRuntimeClosureSha256: HASH_C,
      psqlRuntimeManifestSha256: HASH_D,
      psqlRuntimeVerifierSha256: HASH_E,
      sourceRegistrationApplyRunnerSha256: HASH_A,
      sourceRegistrationApplyRuntimeSha256: HASH_B,
      sourceRegistrationLauncherSha256: HASH_C,
      sourceRegistrationLocalRuntimeClosureSha256: HASH_D,
      sourceRegistrationLogicalCloneRehearsalRuntimeSha256: HASH_B,
      sourceRegistrationLogicalCloneRehearsalSchemaSha256: HASH_C,
      sourceRegistrationLogicalCloneRehearsalCommandRunnerSha256: HASH_D,
      sourceRegistrationNodeBinarySha256: HASH_E,
      sourceRegistrationNodeModulesTreeSha256: HASH_A,
      sourceRegistrationNodeRuntimeClosureSha256: HASH_B,
      sourceRegistrationNodeRuntimeManifestSha256: HASH_C,
      sourceRegistrationNodeRuntimeVerifierSha256: HASH_D,
      sourceRegistrationPrismaGeneratedClientTreeSha256: HASH_E,
      sourceRegistrationRuntimeAttestationSha256: HASH_A,
    },
  };
}

function validReceipt() {
  const backup = {
    dumpBytes: 29_494_452,
    dumpSha256: HASH_A,
    metadataCreatedAtUtc: at(0),
    metadataFormat: "foodsystems-database-backup-metadata",
    metadataSha256: HASH_B,
    metadataVersion: 2,
    targetDatabaseFingerprintSha256: HASH_C,
  };
  const structuralRestore = {
    completedAtUtc: at(10),
    receiptFormat: "foodsystems-database-restore-receipt",
    receiptSha256: HASH_D,
    receiptVersion: 1,
  };
  const source = {
    contentStateSha256: HASH_A,
    logicalStateSha256: HASH_C,
    psqlFileSha256: HASH_B,
    relationCount: 56,
    sequenceCount: 5,
    totalRowCount: 555_189,
  };
  const restored = {
    contentStateSha256: HASH_A,
    logicalStateSha256: HASH_D,
    psqlFileSha256: HASH_B,
    relationCount: 56,
    sequenceCount: 5,
    totalRowCount: 555_189,
  };
  const logicalComparisonProof = sealLogicalRestoreComparisonProof({
    backup,
    restored,
    source,
    structuralRestore,
  });
  const tools = toolBindings();
  const operationKey = logicalRestoreRehearsalOperationKey({
    applyRunnerSha256: HASH_A,
    logicalComparisonProofSha256:
      logicalComparisonProof.logicalComparisonProofSha256,
    rehearsalCommandRunnerSha256: HASH_D,
    rehearsalRuntimeSha256: HASH_B,
    rehearsalSchemaSha256: HASH_C,
    rehearsalTestSha256: HASH_E,
    runtimeAttestationSha256: HASH_A,
  });
  return {
    format: LOGICAL_RESTORE_COMPANION_RECEIPT_FORMAT,
    version: 1,
    canonicalJsonFormat: LOGICAL_RESTORE_COMPANION_CANONICAL_JSON,
    evidenceClass: LOGICAL_RESTORE_COMPANION_EVIDENCE_CLASS,
    completedAtUtc: at(30),
    backup,
    structuralRestore,
    comparison: {
      startedAtUtc: at(20),
      completedAtUtc: at(25),
      source,
      restored,
      contentStateEqual: true,
      logicalStateEqual: false,
      logicalComparisonProofSha256:
        logicalComparisonProof.logicalComparisonProofSha256,
      postRehearsalClone: { ...restored },
      postRehearsalCloneFullStateMatched: true,
      postRehearsalSource: { ...source },
      postRehearsalVerifiedAtUtc: at(29),
      relationCountEqual: true,
      totalRowCountEqual: true,
      sequenceCountEqual: true,
      semantic: LOGICAL_RESTORE_COMPANION_SEMANTIC,
      sourceStillMatched: true,
    },
    logicalCloneRehearsal: {
      applyRunnerSha256: HASH_A,
      artifactType: LOGICAL_RESTORE_REHEARSAL_ARTIFACT_TYPE,
      canonicalJsonFormat: LOGICAL_RESTORE_COMPANION_CANONICAL_JSON,
      exactProductionTargetExercised: false,
      executedRuntime: {
        launcherFileSha256: HASH_C,
        localRuntimeClosureSha256: HASH_D,
        nodeArch: "arm64",
        nodeBinaryFileSha256: HASH_E,
        nodeModulesTreeSha256: HASH_A,
        nodePlatform: "darwin",
        nodeRuntimeClosureSha256: HASH_B,
        nodeVersion: "v22.17.0",
        prismaGeneratedClientTreeSha256: HASH_E,
        runtimeAttestationSha256: HASH_A,
      },
      firstExactMutationRemainsLive: true,
      logicalCloneContentStateSha256: HASH_A,
      logicalComparisonProofSha256:
        logicalComparisonProof.logicalComparisonProofSha256,
      operationKey,
      planFileSha256: LOGICAL_RESTORE_REHEARSAL_PLAN_FILE_SHA256,
      planSha256: LOGICAL_RESTORE_REHEARSAL_PLAN_SHA256,
      privateReceiptStoredOutsideRepo: true,
      productionAuthorizationUsed: false,
      receiptFileSha256: HASH_D,
      receiptSelfSha256: HASH_C,
      rehearsalCommandRunnerSha256: HASH_D,
      rehearsalCompletedAtUtc: at(28),
      rehearsalRuntimeSha256: HASH_B,
      rehearsalSchemaSha256: HASH_C,
      rehearsalStartedAtUtc: at(26),
      rehearsalTestSha256: HASH_E,
      rollback: {
        afterCountsEqualBeforeCounts: true,
        forcedBySentinel: true,
        rehearsalAuditAbsentAfterRollback: true,
        rollbackAbsenceConfirmed: true,
        targetRowsAbsentAfterRollback: true,
        transactionRolledBack: true,
      },
      schemaVersion: LOGICAL_RESTORE_REHEARSAL_SCHEMA_VERSION,
      runtimeAttestationSha256: HASH_A,
      targetClass: LOGICAL_RESTORE_REHEARSAL_TARGET_CLASS,
      targetSetSha256: LOGICAL_RESTORE_REHEARSAL_TARGET_SET_SHA256,
    },
    clone: {
      nameClass: LOGICAL_RESTORE_COMPANION_CLONE_CLASS,
      label: LOGICAL_RESTORE_COMPANION_CLONE_LABEL,
      nameSha256: HASH_E,
      ownershipMarkerClass: LOGICAL_RESTORE_COMPANION_OWNERSHIP_CLASS,
      ownershipMarkerSha256: HASH_A,
      createdFresh: true,
      preexistingDatabaseRefused: true,
    },
    cleanup: {
      policy: LOGICAL_RESTORE_COMPANION_CLEANUP_POLICY,
      drop: "pass",
      databaseAbsenceConfirmed: true,
      ownershipMarkerVerifiedBeforeDrop: true,
      completedAtUtc: at(30),
    },
    tools,
    limitations: {
      evidenceScope: LOGICAL_RESTORE_COMPANION_SCOPE,
      productionTargetExecution: false,
      exactProductionTargetExecutionClaimed: false,
      statement: LOGICAL_RESTORE_COMPANION_LIMITATION,
    },
  };
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

test("v1 fixture satisfies JSON Schema and semantic validation", () => {
  const receipt = validReceipt();
  assert.equal(
    validateSchema(receipt),
    true,
    JSON.stringify(validateSchema.errors),
  );
  assert.equal(
    validateLogicalRestoreCompanionReceipt(receipt, {
      now: new Date(baseTime + 31 * 60 * 1000),
    }),
    receipt,
  );
  assert.equal(
    JSON.stringify(receipt).includes('productionTargetExecution":true'),
    false,
  );
});

test("companion and source-registration runtimes seal the identical comparison proof", () => {
  const receipt = validReceipt();
  const local = sealLogicalRestoreComparisonProof({
    backup: receipt.backup,
    restored: receipt.comparison.restored,
    source: receipt.comparison.source,
    structuralRestore: receipt.structuralRestore,
  });
  const { logicalComparisonProofSha256, ...body } = local;
  const shared = sealSourceRegistrationLogicalComparisonProof(
    body as Parameters<typeof sealSourceRegistrationLogicalComparisonProof>[0],
  );
  assert.deepEqual(shared, local);
  assert.equal(
    shared.logicalComparisonProofSha256,
    logicalComparisonProofSha256,
  );
});

test("canonical parser rejects whitespace, key-order, BOM, and invalid UTF-8 tampering", () => {
  const receipt = validReceipt();
  const canonical = `${canonicalLogicalRestoreCompanionJson(receipt)}\n`;
  assert.deepEqual(
    parseCanonicalLogicalRestoreCompanionReceipt(canonical, {
      now: new Date(baseTime + 31 * 60 * 1000),
    }),
    receipt,
  );
  assert.throws(
    () =>
      parseCanonicalLogicalRestoreCompanionReceipt(
        `${JSON.stringify(receipt, null, 2)}\n`,
        {
          now: new Date(baseTime + 31 * 60 * 1000),
        },
      ),
    /not canonical/,
  );
  assert.throws(
    () => parseCanonicalLogicalRestoreCompanionReceipt(`\ufeff${canonical}`),
    /not JSON/,
  );
  const invalidUtf8 = Buffer.from(canonical);
  invalidUtf8[invalidUtf8.indexOf(Buffer.from(HASH_A))] = 0xff;
  assert.throws(
    () => parseCanonicalLogicalRestoreCompanionReceipt(invalidUtf8),
    /not valid UTF-8/,
  );
});

test("timestamps require exact millisecond UTC form and internal ordering", () => {
  const missingMilliseconds = clone(validReceipt());
  missingMilliseconds.completedAtUtc =
    missingMilliseconds.completedAtUtc.replace(/\.\d{3}Z$/, "Z");
  missingMilliseconds.cleanup.completedAtUtc =
    missingMilliseconds.completedAtUtc;
  assert.equal(validateSchema(missingMilliseconds), false);
  assert.throws(
    () => validateLogicalRestoreCompanionReceipt(missingMilliseconds),
    /canonical UTC timestamp/,
  );

  const reordered = clone(validReceipt());
  reordered.comparison.startedAtUtc = at(26);
  assert.throws(
    () => validateLogicalRestoreCompanionReceipt(reordered),
    /timestamps are out of order/,
  );

  const future = clone(validReceipt());
  const farFuture = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  future.completedAtUtc = farFuture;
  future.cleanup.completedAtUtc = farFuture;
  assert.throws(
    () => validateLogicalRestoreCompanionReceipt(future),
    /future-dated/,
  );

  const overlongRehearsal = clone(validReceipt());
  overlongRehearsal.logicalCloneRehearsal.rehearsalCompletedAtUtc = at(42);
  overlongRehearsal.comparison.postRehearsalVerifiedAtUtc = at(43);
  overlongRehearsal.cleanup.completedAtUtc = at(44);
  overlongRehearsal.completedAtUtc = at(44);
  assert.throws(
    () =>
      validateLogicalRestoreCompanionReceipt(overlongRehearsal, {
        now: new Date(baseTime + 45 * 60 * 1000),
      }),
    /exceeds fifteen minutes/,
  );

  const staleAtConsumption = clone(validReceipt());
  staleAtConsumption.comparison.postRehearsalVerifiedAtUtc = at(45);
  staleAtConsumption.cleanup.completedAtUtc = at(46);
  staleAtConsumption.completedAtUtc = at(46);
  assert.throws(
    () =>
      validateLogicalRestoreCompanionReceipt(staleAtConsumption, {
        now: new Date(baseTime + 47 * 60 * 1000),
      }),
    /stale when consumed/,
  );
});

test("whole-second backup evidence time canonicalizes to the strict receipt form", () => {
  assert.equal(
    canonicalControlledEvidenceUtcTimestamp("2026-08-03T00:15:01Z"),
    "2026-08-03T00:15:01.000Z",
  );
  assert.equal(
    canonicalControlledEvidenceUtcTimestamp("2026-08-03T00:15:01.123Z"),
    "2026-08-03T00:15:01.123Z",
  );
  for (const invalid of [
    "2026-02-30T00:15:01Z",
    "2026-08-03T00:15:01+00:00",
    "2026-08-03T00:15:01.1Z",
    "2026-08-03T00:15:01.12Z",
    "2026-08-03T00:15:01.1234Z",
    "2026-08-03T00:15:01",
  ]) {
    assert.throws(
      () => canonicalControlledEvidenceUtcTimestamp(invalid),
      /evidence timestamp is invalid/,
    );
  }
});

test("hash, equality, count, and tool-binding tampering fail closed", () => {
  const uppercaseHash = clone(validReceipt());
  uppercaseHash.backup.dumpSha256 = HASH_A.toUpperCase();
  assert.throws(
    () => validateLogicalRestoreCompanionReceipt(uppercaseHash),
    /lowercase SHA-256/,
  );

  const falseEquality = clone(validReceipt());
  falseEquality.comparison.contentStateEqual = false;
  assert.throws(
    () => validateLogicalRestoreCompanionReceipt(falseEquality),
    /contentStateEqual is invalid/,
  );

  const countMismatch = clone(validReceipt());
  countMismatch.comparison.restored.totalRowCount += 1;
  assert.throws(
    () => validateLogicalRestoreCompanionReceipt(countMismatch),
    /logical content or counts differ/,
  );

  const toolMismatch = clone(validReceipt());
  toolMismatch.tools.executedTools.psqlBinarySha256 = HASH_E;
  assert.throws(
    () => validateLogicalRestoreCompanionReceipt(toolMismatch),
    /psql binding differs/,
  );

  const contextToolMismatch = clone(validReceipt());
  contextToolMismatch.tools.contextBindings.backupVerifierSha256 = "not-a-hash";
  assert.throws(
    () => validateLogicalRestoreCompanionReceipt(contextToolMismatch),
    /lowercase SHA-256/,
  );

  const comparisonProofMismatch = clone(validReceipt());
  comparisonProofMismatch.comparison.logicalComparisonProofSha256 = HASH_E;
  assert.throws(
    () => validateLogicalRestoreCompanionReceipt(comparisonProofMismatch),
    /comparison proof hash differs/,
  );

  const operationKeyMismatch = clone(validReceipt());
  operationKeyMismatch.logicalCloneRehearsal.operationKey = `source-registration-logical-clone-rehearsal-v1:${HASH_E}`;
  assert.throws(
    () => validateLogicalRestoreCompanionReceipt(operationKeyMismatch),
    /operationKey binding differs/,
  );

  const targetSetMismatch = clone(validReceipt());
  targetSetMismatch.logicalCloneRehearsal.targetSetSha256 = HASH_A;
  assert.equal(validateSchema(targetSetMismatch), false);
  assert.throws(
    () => validateLogicalRestoreCompanionReceipt(targetSetMismatch),
    /targetSetSha256 is invalid/,
  );

  const executedRuntimeMismatch = clone(validReceipt());
  executedRuntimeMismatch.logicalCloneRehearsal.executedRuntime.localRuntimeClosureSha256 =
    HASH_E;
  assert.throws(
    () => validateLogicalRestoreCompanionReceipt(executedRuntimeMismatch),
    /full executed runtime binding differs/,
  );

  const postRehearsalResidue = clone(validReceipt());
  postRehearsalResidue.comparison.postRehearsalClone.logicalStateSha256 =
    HASH_E;
  assert.throws(
    () => validateLogicalRestoreCompanionReceipt(postRehearsalResidue),
    /post-rehearsal clone or source full logical state differs/,
  );

  const incompleteRollback = clone(validReceipt());
  incompleteRollback.logicalCloneRehearsal.rollback.transactionRolledBack = false;
  assert.equal(validateSchema(incompleteRollback), false);
  assert.throws(
    () => validateLogicalRestoreCompanionReceipt(incompleteRollback),
    /transactionRolledBack is invalid/,
  );
});

test("path and credential material cannot be added to the closed receipt shape", () => {
  const pathInjection = clone(validReceipt()) as ReturnType<
    typeof validReceipt
  > & {
    privatePath?: string;
  };
  pathInjection.privatePath = "/Users/operator/private/backup.dump";
  assert.equal(validateSchema(pathInjection), false);
  assert.throws(
    () => validateLogicalRestoreCompanionReceipt(pathInjection),
    /unexpected shape/,
  );

  const credentialInjection = clone(validReceipt()) as ReturnType<
    typeof validReceipt
  > & {
    password?: string;
  };
  credentialInjection.password = "postgresql://user:secret@host/db";
  assert.equal(validateSchema(credentialInjection), false);
  assert.throws(
    () => validateLogicalRestoreCompanionReceipt(credentialInjection),
    /unexpected shape/,
  );
});

function privateOutput(name: string) {
  const root = realpathSync(
    mkdtempSync(join(tmpdir(), "logical-restore-companion-")),
  );
  chmodSync(root, 0o700);
  return { path: join(root, name), root };
}

test("private publisher refuses an existing target without changing it", () => {
  const output = privateOutput("receipt.json");
  try {
    writeFileSync(output.path, "operator-owned-existing-bytes", {
      mode: 0o400,
    });
    chmodSync(output.path, 0o400);
    const before = lstatSync(output.path, { bigint: true });
    assert.throws(
      () =>
        publishAtomicPrivateCanonicalJson(
          output.path,
          { artifact: "new" },
          { label: "test receipt", validate: () => {} },
        ),
      /already exists/,
    );
    const after = lstatSync(output.path, { bigint: true });
    assert.equal(after.ino, before.ino);
    assert.equal(
      readFileSync(output.path, "utf8"),
      "operator-owned-existing-bytes",
    );
    assert.deepEqual(readdirSync(output.root), ["receipt.json"]);
  } finally {
    rmSync(output.root, { force: true, recursive: true });
  }
});

test("private publisher never removes a replacement inode during failure cleanup", () => {
  const output = privateOutput("receipt.json");
  let validations = 0;
  try {
    assert.throws(
      () =>
        publishAtomicPrivateCanonicalJson(
          output.path,
          { artifact: "candidate" },
          {
            label: "test receipt",
            validate: () => {
              validations += 1;
              if (validations === 2) {
                unlinkSync(output.path);
                writeFileSync(output.path, "replacement-owned-elsewhere", {
                  mode: 0o400,
                });
                chmodSync(output.path, 0o400);
                throw new Error("simulated post-link validation race");
              }
            },
          },
        ),
      /could not be published atomically/,
    );
    assert.equal(
      readFileSync(output.path, "utf8"),
      "replacement-owned-elsewhere",
    );
    assert.equal(statSync(output.path).mode & 0o777, 0o400);
    assert.deepEqual(readdirSync(output.root), ["receipt.json"]);
  } finally {
    rmSync(output.root, { force: true, recursive: true });
  }
});

function digest(
  databaseName: string,
  logicalStateSha256: string,
  content = HASH_A,
) {
  return {
    contentStateSha256: content,
    logicalStateSha256,
    relationCount: 2,
    relations: [{ rowCount: 2 }, { rowCount: 1 }],
    sequences: { rowCount: 1 },
    databaseTarget: {
      databaseName,
      serverAddress: "127.0.0.1/32",
      serverPort: 5432,
      serverVersionNum: "160013",
      systemIdentifier: "7620055716543368057",
    },
    tool: { psqlFileSha256: HASH_B },
  };
}

function sessionEvidence() {
  const receipt = validReceipt();
  return {
    backup: receipt.backup,
    ownershipMarkerSha256: receipt.clone.ownershipMarkerSha256,
    structuralRestore: receipt.structuralRestore,
    tools: receipt.tools,
  };
}

function sessionClock() {
  const values = [at(20), at(25), at(29), at(30)];
  return () => new Date(values.shift() ?? at(30));
}

function successfulOperations(calls: string[]) {
  const cloneName = "foodsystems_restore_logical_test_0123456789abcdef";
  return {
    cloneName,
    operations: {
      async assertContinue() {},
      async assertAbsent(name: string) {
        calls.push(`absent:${name}`);
      },
      async create(name: string) {
        calls.push(`create:${name}`);
      },
      async restore(name: string) {
        calls.push(`restore:${name}`);
      },
      async digest(url: string) {
        calls.push(`digest:${url}`);
        return url === "clone-db"
          ? digest(cloneName, HASH_D)
          : digest("foodsystems", HASH_C);
      },
      async drop(name: string) {
        calls.push(`drop:${name}`);
        return "owned" as const;
      },
      async confirmAbsent(name: string) {
        calls.push(`confirm:${name}`);
        return true;
      },
      cloneDatabaseUrl() {
        return "clone-db";
      },
      async rehearse({
        logicalComparisonProof,
      }: {
        logicalComparisonProof: { logicalComparisonProofSha256: string };
      }) {
        calls.push("rehearse:clone-db");
        const binding = clone(validReceipt().logicalCloneRehearsal);
        binding.logicalComparisonProofSha256 =
          logicalComparisonProof.logicalComparisonProofSha256;
        binding.operationKey = logicalRestoreRehearsalOperationKey({
          applyRunnerSha256: binding.applyRunnerSha256,
          logicalComparisonProofSha256: binding.logicalComparisonProofSha256,
          rehearsalCommandRunnerSha256: binding.rehearsalCommandRunnerSha256,
          rehearsalRuntimeSha256: binding.rehearsalRuntimeSha256,
          rehearsalSchemaSha256: binding.rehearsalSchemaSha256,
          rehearsalTestSha256: binding.rehearsalTestSha256,
          runtimeAttestationSha256: binding.runtimeAttestationSha256,
        });
        return binding;
      },
      async reverifyRehearsal({
        expectedBinding,
        phase,
      }: {
        expectedBinding: ReturnType<
          typeof validReceipt
        >["logicalCloneRehearsal"];
        phase: string;
      }) {
        calls.push(`reverify:rehearsal:${phase}`);
        return expectedBinding;
      },
    },
  };
}

test("mocked end-to-end session publishes one canonical private receipt only after cleanup", async () => {
  const output = privateOutput("receipt.json");
  const calls: string[] = [];
  const { backup, ownershipMarkerSha256, structuralRestore, tools } =
    sessionEvidence();
  const { cloneName, operations } = successfulOperations(calls);
  try {
    const result = await executeLogicalRestoreComparisonSession({
      backup,
      cloneName,
      clock: sessionClock(),
      operations,
      outputPath: output.path,
      ownershipMarkerSha256,
      async reverifyEvidence() {
        calls.push("reverify:evidence");
      },
      async reverifyTools() {
        calls.push("reverify:tools");
      },
      sourceDatabaseName: "foodsystems",
      sourceDatabaseUrl: "source-db",
      structuralRestore,
      tools,
    });
    assert.deepEqual(calls, [
      `absent:${cloneName}`,
      `create:${cloneName}`,
      `restore:${cloneName}`,
      "digest:source-db",
      "digest:clone-db",
      "digest:source-db",
      "rehearse:clone-db",
      "digest:clone-db",
      "digest:source-db",
      "reverify:rehearsal:post-digest",
      `drop:${cloneName}`,
      `confirm:${cloneName}`,
      "reverify:evidence",
      "reverify:tools",
      "reverify:rehearsal:pre-publication",
    ]);
    const bytes = readFileSync(output.path);
    assert.equal(statSync(output.path).mode & 0o777, 0o400);
    assert.equal(logicalRestoreCompanionSha256(bytes), result.receiptSha256);
    assert.deepEqual(
      parseCanonicalLogicalRestoreCompanionReceipt(bytes),
      result.receipt,
    );
    assert.equal(bytes.toString("utf8").includes(output.root), false);
    assert.equal(bytes.toString("utf8").includes("source-db"), false);
  } finally {
    rmSync(output.root, { force: true, recursive: true });
  }
});

test("clone digest uses admin credentials while receipt serialization includes neither role", () => {
  const cloneName = "foodsystems_restore_logical_roles_0123456789abcdef";
  const cloneUrl = controlledCloneDigestDatabaseUrl(
    "postgresql://restore_admin:admin-secret@127.0.0.1:5432/postgres?sslmode=require",
    cloneName,
  );
  const parsed = new URL(cloneUrl);
  assert.equal(parsed.username, "restore_admin");
  assert.equal(parsed.password, "admin-secret");
  assert.equal(parsed.pathname, `/${cloneName}`);
  const serialized = canonicalLogicalRestoreCompanionJson(validReceipt());
  assert.doesNotMatch(serialized, /restore_admin|source_reader|admin-secret/);
});

test("production drop guard requires the exact private ownership marker", () => {
  const ownershipToken = "1".repeat(64);
  const exactMarker = controlledCloneOwnershipComment(ownershipToken);
  assert.equal(
    verifyControlledCloneOwnershipMarker({
      actualComment: exactMarker,
      databaseExists: true,
      ownershipToken,
    }),
    "owned",
  );
  assert.throws(
    () =>
      verifyControlledCloneOwnershipMarker({
        actualComment: "",
        databaseExists: true,
        ownershipToken,
      }),
    /ownership marker was not verified/,
  );
  assert.throws(
    () =>
      verifyControlledCloneOwnershipMarker({
        actualComment: controlledCloneOwnershipComment("2".repeat(64)),
        databaseExists: true,
        ownershipToken,
      }),
    /ownership marker was not verified/,
  );
  assert.equal(
    verifyControlledCloneOwnershipMarker({
      actualComment: "",
      databaseExists: false,
      ownershipToken,
    }),
    "already_absent",
  );
});

test("preexisting clone is refused without create or drop", async () => {
  const output = privateOutput("receipt.json");
  const calls: string[] = [];
  const evidence = sessionEvidence();
  const { cloneName, operations } = successfulOperations(calls);
  operations.assertAbsent = async () => {
    calls.push("preexisting");
    throw new Error("exists");
  };
  try {
    await assert.rejects(
      executeLogicalRestoreComparisonSession({
        ...evidence,
        cloneName,
        clock: sessionClock(),
        operations,
        outputPath: output.path,
        sourceDatabaseName: "foodsystems",
        sourceDatabaseUrl: "source-db",
      }),
      /logical restore comparison failed/,
    );
    assert.deepEqual(calls, ["preexisting"]);
    assert.throws(() => readFileSync(output.path));
  } finally {
    rmSync(output.root, { force: true, recursive: true });
  }
});

test("handled-signal checkpoint uses shell exit codes and cleans an armed clone", async () => {
  assert.equal(controlledLogicalRestoreSignalExitCode("SIGINT"), 130);
  assert.equal(controlledLogicalRestoreSignalExitCode("SIGTERM"), 143);
  const output = privateOutput("receipt.json");
  const calls: string[] = [];
  const evidence = sessionEvidence();
  const { cloneName, operations } = successfulOperations(calls);
  let checkpoints = 0;
  operations.assertContinue = async () => {
    checkpoints += 1;
    if (checkpoints === 3) throw new Error("simulated handled signal");
  };
  try {
    await assert.rejects(
      executeLogicalRestoreComparisonSession({
        ...evidence,
        cloneName,
        clock: sessionClock(),
        operations,
        outputPath: output.path,
        sourceDatabaseName: "foodsystems",
        sourceDatabaseUrl: "source-db",
      }),
    );
    assert.equal(calls.includes(`drop:${cloneName}`), true);
    assert.equal(calls.includes(`confirm:${cloneName}`), true);
    assert.throws(() => readFileSync(output.path));
  } finally {
    rmSync(output.root, { force: true, recursive: true });
  }
});

test("nested synchronous rehearsal child is allowed to finish before an abort is observed", async () => {
  const controller = new AbortController();
  const grandchild =
    "setTimeout(() => process.stdout.write('grandchild-finished'), 80)";
  const child = [
    "const { spawnSync } = require('node:child_process');",
    `const result = spawnSync(process.execPath, ['-e', ${JSON.stringify(grandchild)}], { encoding: 'utf8' });`,
    "if (result.status !== 0 || result.signal || result.stderr) process.exit(7);",
    "process.stdout.write(result.stdout);",
  ].join("\n");
  const abortTimer = setTimeout(() => controller.abort(), 20);
  try {
    const result = await runControlledNonInterruptibleNestedCommand({
      abortSignal: controller.signal,
      args: ["-e", child],
      cwd: repoRoot,
      environment: { PATH: process.env.PATH ?? "/usr/bin:/bin" },
      executable: process.execPath,
    });
    assert.equal(result.stdout, "grandchild-finished");
    assert.equal(result.abortObservedAfterCompletion, true);
  } finally {
    clearTimeout(abortTimer);
  }
});

for (const failingStage of ["create", "restore", "digest"] as const) {
  test(`failure during ${failingStage} still drops and confirms clone absence`, async () => {
    const output = privateOutput("receipt.json");
    const calls: string[] = [];
    const evidence = sessionEvidence();
    const { cloneName, operations } = successfulOperations(calls);
    const mutableOperations = operations as unknown as Record<
      string,
      (...args: string[]) => Promise<unknown>
    >;
    const original = mutableOperations[failingStage];
    mutableOperations[failingStage] = async (...args: string[]) => {
      calls.push(`failed:${failingStage}`);
      if (
        failingStage === "digest" &&
        calls.filter((value) => value === "failed:digest").length < 2
      ) {
        return original(...args);
      }
      throw new Error(`${failingStage} failed`);
    };
    try {
      await assert.rejects(
        executeLogicalRestoreComparisonSession({
          ...evidence,
          cloneName,
          clock: sessionClock(),
          operations,
          outputPath: output.path,
          sourceDatabaseName: "foodsystems",
          sourceDatabaseUrl: "source-db",
        }),
      );
      assert.equal(calls.includes(`drop:${cloneName}`), true);
      assert.equal(calls.includes(`confirm:${cloneName}`), true);
      assert.throws(() => readFileSync(output.path));
    } finally {
      rmSync(output.root, { force: true, recursive: true });
    }
  });
}

test("logical mismatch, source drift, and evidence recheck failure never publish", async (t) => {
  for (const scenario of [
    "logical-mismatch",
    "source-drift",
    "evidence-drift",
  ] as const) {
    await t.test(scenario, async () => {
      const output = privateOutput("receipt.json");
      const calls: string[] = [];
      const evidence = sessionEvidence();
      const { cloneName, operations } = successfulOperations(calls);
      if (scenario === "logical-mismatch") {
        operations.digest = async (url: string) =>
          url === "clone-db"
            ? digest(cloneName, HASH_D, HASH_E)
            : digest("foodsystems", HASH_C);
      }
      if (scenario === "source-drift") {
        let sourceReads = 0;
        operations.digest = async (url: string) => {
          if (url === "clone-db") return digest(cloneName, HASH_D);
          sourceReads += 1;
          return digest("foodsystems", sourceReads === 1 ? HASH_C : HASH_E);
        };
      }
      try {
        await assert.rejects(
          executeLogicalRestoreComparisonSession({
            ...evidence,
            cloneName,
            clock: sessionClock(),
            operations,
            outputPath: output.path,
            async reverifyEvidence() {
              if (scenario === "evidence-drift") throw new Error("drift");
            },
            sourceDatabaseName: "foodsystems",
            sourceDatabaseUrl: "source-db",
          }),
        );
        assert.equal(calls.includes(`drop:${cloneName}`), true);
        assert.equal(calls.includes(`confirm:${cloneName}`), true);
        assert.throws(() => readFileSync(output.path));
      } finally {
        rmSync(output.root, { force: true, recursive: true });
      }
    });
  }
});

test("rehearsal failure, residue, source drift, or receipt drift always cleans and suppresses companion publication", async (t) => {
  for (const scenario of [
    "execution-failure",
    "invalid-binding",
    "clone-residue",
    "source-drift-after-rehearsal",
    "post-digest-receipt-drift",
    "pre-publication-receipt-drift",
  ] as const) {
    await t.test(scenario, async () => {
      const output = privateOutput("receipt.json");
      const calls: string[] = [];
      const evidence = sessionEvidence();
      const { cloneName, operations } = successfulOperations(calls);
      const originalRehearse = operations.rehearse.bind(operations);
      const originalDigest = operations.digest.bind(operations);
      const originalReverify = operations.reverifyRehearsal.bind(operations);
      if (scenario === "execution-failure") {
        operations.rehearse = async () => {
          calls.push("rehearse:failed");
          throw new Error("simulated rehearsal failure");
        };
      }
      if (scenario === "invalid-binding") {
        operations.rehearse = async (input) => {
          const binding = await originalRehearse(input);
          binding.rollback.transactionRolledBack = false;
          return binding;
        };
      }
      if (
        scenario === "clone-residue" ||
        scenario === "source-drift-after-rehearsal"
      ) {
        let cloneReads = 0;
        let sourceReads = 0;
        operations.digest = async (url: string) => {
          if (url === "clone-db") {
            cloneReads += 1;
            if (scenario === "clone-residue" && cloneReads === 2) {
              return digest(cloneName, HASH_E);
            }
          } else {
            sourceReads += 1;
            if (
              scenario === "source-drift-after-rehearsal" &&
              sourceReads === 3
            ) {
              return digest("foodsystems", HASH_E);
            }
          }
          return originalDigest(url);
        };
      }
      if (
        scenario === "post-digest-receipt-drift" ||
        scenario === "pre-publication-receipt-drift"
      ) {
        let reads = 0;
        operations.reverifyRehearsal = async (input) => {
          reads += 1;
          const binding = clone(await originalReverify(input));
          if (
            (scenario === "post-digest-receipt-drift" && reads === 1) ||
            (scenario === "pre-publication-receipt-drift" && reads === 2)
          ) {
            binding.receiptFileSha256 = HASH_E;
          }
          return binding;
        };
      }
      try {
        await assert.rejects(
          executeLogicalRestoreComparisonSession({
            ...evidence,
            cloneName,
            clock: sessionClock(),
            operations,
            outputPath: output.path,
            sourceDatabaseName: "foodsystems",
            sourceDatabaseUrl: "source-db",
          }),
        );
        assert.equal(calls.includes(`drop:${cloneName}`), true);
        assert.equal(calls.includes(`confirm:${cloneName}`), true);
        assert.throws(() => readFileSync(output.path));
      } finally {
        rmSync(output.root, { force: true, recursive: true });
      }
    });
  }
});

test("cleanup failure or unconfirmed absence suppresses the receipt", async (t) => {
  for (const scenario of ["drop-failure", "absence-failure"] as const) {
    await t.test(scenario, async () => {
      const output = privateOutput("receipt.json");
      const calls: string[] = [];
      const evidence = sessionEvidence();
      const { cloneName, operations } = successfulOperations(calls);
      if (scenario === "drop-failure") {
        operations.drop = async () => {
          calls.push("drop-failed");
          throw new Error("drop failed");
        };
      } else {
        operations.confirmAbsent = async () => {
          calls.push("absence-failed");
          return false;
        };
      }
      try {
        await assert.rejects(
          executeLogicalRestoreComparisonSession({
            ...evidence,
            cloneName,
            clock: sessionClock(),
            operations,
            outputPath: output.path,
            sourceDatabaseName: "foodsystems",
            sourceDatabaseUrl: "source-db",
          }),
          /disposable clone (?:cleanup failed|absence was not confirmed)/,
        );
        assert.throws(() => readFileSync(output.path));
      } finally {
        rmSync(output.root, { force: true, recursive: true });
      }
    });
  }
});

test("CLI rejects path argv and never echoes argv or environment secrets", () => {
  const secret =
    "postgresql://operator:never-print-this@private.example/foodsystems";
  const result = spawnSync(
    process.execPath,
    [runnerPath, "/private/hidden/backup.dump"],
    {
      cwd: repoRoot,
      encoding: "utf8",
      env: {
        ...process.env,
        DATABASE_URL: secret,
        LOGICAL_RESTORE_DUMP_PATH: "/private/hidden/backup.dump",
      },
    },
  );
  assert.notEqual(result.status, 0);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /ERROR ARGUMENTS_FORBIDDEN/);
  assert.doesNotMatch(
    result.stderr,
    /hidden|never-print-this|private\.example|postgresql:\/\//,
  );
});
