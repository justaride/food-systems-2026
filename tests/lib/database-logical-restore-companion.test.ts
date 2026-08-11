import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  closeSync,
  constants,
  copyFileSync,
  fchmodSync,
  fstatSync,
  lstatSync,
  mkdtempSync,
  openSync,
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
import { sourceRegistrationRuntimeAttestation } from "../../scripts/knowledge/apply-source-registration-plan";

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
  CONTROLLED_ARCHIVE_CATALOG_INPUT_POLICY,
  CONTROLLED_EXTENSION_INITIALIZER_DIAGNOSTIC_POLICY,
  CONTROLLED_RESTORE_USE_LIST_POLICY,
  buildControlledRestoreSelection,
  canonicalControlledEvidenceUtcTimestamp,
  controlledNestedRehearsalRuntimeEnvelope,
  controlledCloneDropCommandArgs,
  controlledCloneName,
  controlledCloneOwnershipComment,
  controlledCloneDigestDatabaseUrl,
  controlledLogicalRestoreSignalExitCode,
  controlledRehearsalCodePinArguments,
  controlledRehearsalChildEnvironment,
  createControlledExtensionInitializerRequestCapability,
  createControlledRestoreListCapability,
  executeControlledReattestedNestedRehearsal,
  executeLogicalRestoreComparisonSession,
  hashStableFile,
  publishAtomicPrivateCanonicalJson,
  parseControlledExtensionInitializerDiagnostic,
  runControlledArchiveCatalogCommand,
  runControlledAttestedNestedRehearsalCommand,
  runControlledCommand,
  runControlledCommandPhase,
  runControlledNonInterruptibleNestedCommand,
  runControlledSelectedRestoreCommand,
  validateControlledDatabaseConnectionIdentity,
  validateControlledPostgresqlToolsetBinding,
  validateControlledLogicalRestoreLauncherEnvelope,
  verifyControlledCloneAbsence,
  verifyControlledCloneDropIdentity,
  verifyControlledCloneRecoveryIdentity,
  verifyControlledCloneOwnershipMarker,
} from "../../scripts/knowledge/run-controlled-logical-restore-companion.mjs";

const supportedRuntime =
  process.platform === "darwin" && process.arch === "arm64";
import {
  LOGICAL_RESTORE_EXTENSION_INITIALIZER_PURPOSE,
  LOGICAL_RESTORE_EXTENSION_INITIALIZER_REQUEST_FORMAT,
  canonicalExtensionInitializerJson,
  sealExtensionInitializerRequest,
} from "../../scripts/knowledge/run-logical-restore-extension-initializer.mjs";
import {
  POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_MANIFEST_SHA256,
  POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_SHA256,
} from "../../scripts/knowledge/verify-psql-runtime-closure.mjs";
import {
  SOURCE_REGISTRATION_RUNTIME_ATTESTATION_DOMAIN,
  SOURCE_REGISTRATION_RUNTIME_ENVELOPE_DOMAIN,
  canonicalRuntimeJson,
  runtimeSha256,
} from "../../scripts/knowledge/launch-locked-source-registration-apply.mjs";

const repoRoot = resolve(import.meta.dirname, "../..");
const runnerPath = join(
  repoRoot,
  "scripts/knowledge/run-controlled-logical-restore-companion.mjs",
);
const nestedRehearsalProbePath = join(
  repoRoot,
  "tests/fixtures/source-registration-nested-rehearsal-probe.mjs",
);
const controlledPgRestoreCatalogFixturePath = join(
  repoRoot,
  "tests/fixtures/controlled-pg-restore-catalog-fixture.mjs",
);
const sourceRegistrationTsxConfigPath = join(
  repoRoot,
  "knowledge/runtime/source-registration-tsx.runtime.json",
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

function extensionInitializerRequestFixture(parentPid = process.pid) {
  return sealExtensionInitializerRequest({
    clone: {
      databaseName:
        "foodsystems_restore_logical_20260803_0123456789abcdef01234567",
      databaseOid: 123456,
      databaseOwner: "foodsystems",
      ownershipComment: `foodsystems-logical-restore-companion-owner-v1:${"1".repeat(64)}`,
    },
    cluster: {
      serverVersionNum: "160013",
      systemIdentifier: "7620055716543368057",
    },
    format: LOGICAL_RESTORE_EXTENSION_INITIALIZER_REQUEST_FORMAT,
    issuedAtUtc: new Date().toISOString(),
    nonce: "2".repeat(64),
    parentPid,
    purpose: LOGICAL_RESTORE_EXTENSION_INITIALIZER_PURPOSE,
    version: 1,
  });
}

function expectControlledCode(code: string): (error: unknown) => boolean {
  return (error: unknown) =>
    error instanceof Error &&
    "code" in error &&
    (error as Error & { code: string }).code === code;
}

test("non-private stable hashing binds the complete file identity", async () => {
  const root = mkdtempSync(join(realpathSync(tmpdir()), "stable-hash-test-"));
  const path = join(root, "bound-tool.txt");
  try {
    writeFileSync(path, "bound tool bytes\n", { mode: 0o400 });
    chmodSync(path, 0o400);
    const result = await hashStableFile(realpathSync(path), "test bound tool");
    assert.equal(
      result.sha256,
      logicalRestoreCompanionSha256("bound tool bytes\n"),
    );
    for (const field of ["ctimeNs", "gid", "nlink", "uid"] as const) {
      assert.equal(typeof result.identity[field], "bigint", field);
    }
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});

test("command failures map only to a fixed non-sensitive execution phase", async () => {
  await assert.rejects(
    runControlledCommandPhase({
      code: "CLONE_RESTORE_COMMAND_FAILED",
      operation: () =>
        runControlledCommand({
          args: ["--input-type=module", "--eval", "process.exitCode = 1"],
          environment: {
            LANG: "C",
            LC_ALL: "C",
            NODE_ENV: "test",
            TZ: "UTC",
          },
          executable: process.execPath,
        }),
    }),
    expectControlledCode("CLONE_RESTORE_COMMAND_FAILED"),
  );
  await assert.rejects(
    runControlledCommandPhase({
      code: "caller_selected_code",
      operation: async () => undefined,
    }),
    expectControlledCode("CONTROLLED_FAILURE"),
  );
});

test("extension initializer relays only exact fixed broker diagnostics", async () => {
  const cases = new Map([
    ["EXTENSION_INITIALIZER_ATTESTATION", "EXTENSION_INITIALIZER_ATTESTATION"],
    ["EXTENSION_INITIALIZER_FAILURE", "EXTENSION_INITIALIZER_FAILED"],
    ["EXTENSION_INITIALIZER_MUTATION", "EXTENSION_INITIALIZER_MUTATION"],
    ["EXTENSION_INITIALIZER_PREFLIGHT", "EXTENSION_INITIALIZER_PREFLIGHT"],
    ["EXTENSION_INITIALIZER_REQUEST", "EXTENSION_INITIALIZER_REQUEST"],
    ["EXTENSION_INITIALIZER_RUNTIME", "EXTENSION_INITIALIZER_RUNTIME"],
    ["EXTENSION_INITIALIZER_VERIFY", "EXTENSION_INITIALIZER_VERIFY"],
  ]);
  for (const [brokerCode, controlledCode] of cases) {
    const bytes = Buffer.from(
      `[logical-restore-extension-initializer] ERROR ${brokerCode}\n`,
      "utf8",
    );
    assert.equal(
      parseControlledExtensionInitializerDiagnostic(bytes, 1),
      controlledCode,
    );
    assert.equal(parseControlledExtensionInitializerDiagnostic(bytes, 2), null);
    assert.equal(
      parseControlledExtensionInitializerDiagnostic(
        Buffer.concat([bytes, Buffer.from("private-path-marker\n")]),
        1,
      ),
      null,
    );
  }
  assert.equal(
    parseControlledExtensionInitializerDiagnostic(
      Buffer.from(
        "[logical-restore-extension-initializer] ERROR EXTENSION_INITIALIZER_SIGNAL\n",
        "utf8",
      ),
      143,
    ),
    "HANDLED_SIGNAL",
  );
  await assert.rejects(
    runControlledCommand({
      args: ["--input-type=module", "--eval", "process.exitCode = 1"],
      environment: {
        LANG: "C",
        LC_ALL: "C",
        NODE_ENV: "test",
        TZ: "UTC",
      },
      executable: process.execPath,
      failureDiagnosticPolicy:
        CONTROLLED_EXTENSION_INITIALIZER_DIAGNOSTIC_POLICY,
    }),
    expectControlledCode("COMMAND_INPUT"),
  );
});

test(
  "pg_restore catalog accepts only validated early EPIPE and restore input remains strict",
  { timeout: 60_000 },
  async () => {
    const root = mkdtempSync(
      join(realpathSync(tmpdir()), "controlled-catalog-epipe-test-"),
    );
    const executable = join(root, "pg_restore");
    const inputFile = join(root, "backup.dump");
    try {
      copyFileSync(controlledPgRestoreCatalogFixturePath, executable);
      chmodSync(executable, 0o500);
      writeFileSync(inputFile, Buffer.alloc(32 * 1024 * 1024, 0x61), {
        mode: 0o600,
      });
      const run = (mode: string, catalogPolicy: boolean) => {
        const inputIdentity = statSync(inputFile, { bigint: true });
        const environment = {
          CONTROLLED_CATALOG_FIXTURE_INPUT_PATH: inputFile,
          CONTROLLED_CATALOG_FIXTURE_MODE: mode,
          NODE_ENV: "test" as const,
          PATH: process.env.PATH ?? "/usr/bin:/bin",
        };
        return catalogPolicy
          ? runControlledArchiveCatalogCommand({
              environment,
              executable,
              inputFile,
              inputIdentity,
            })
          : runControlledCommand({
              args: ["--list"],
              environment,
              executable,
              inputFile,
              inputIdentity,
            });
      };

      const accepted = await run("valid", true);
      assert.match(accepted.stdout, /TABLE public Document/);
      await assert.rejects(
        run("valid", false),
        expectControlledCode("COMMAND_FAILED"),
      );
      await assert.rejects(
        run("invalid-catalog", true),
        expectControlledCode("ARCHIVE_CATALOG"),
      );
      for (const mode of ["stderr", "nonzero", "signal", "overflow"]) {
        await assert.rejects(
          run(mode, true),
          expectControlledCode("COMMAND_FAILED"),
          mode,
        );
      }
      await assert.rejects(
        runControlledCommand({
          args: ["--exit-on-error", "--dbname=disposable"],
          environment: {
            CONTROLLED_CATALOG_FIXTURE_MODE: "valid",
            NODE_ENV: "test",
            PATH: process.env.PATH ?? "/usr/bin:/bin",
          },
          executable,
          inputEarlyClosePolicy: CONTROLLED_ARCHIVE_CATALOG_INPUT_POLICY,
          inputFile,
          inputIdentity: statSync(inputFile, { bigint: true }),
        }),
        expectControlledCode("COMMAND_INPUT"),
      );
      await assert.rejects(
        run("drift", true),
        expectControlledCode("DUMP_CHANGED"),
      );

      const runnerSource = readFileSync(runnerPath, "utf8");
      const restoreStart = runnerSource.indexOf(
        "    async restore(databaseName) {",
      );
      const verifyExtensionsStart = runnerSource.indexOf(
        "    async verifyExtensions(databaseName) {",
        restoreStart,
      );
      assert.notEqual(restoreStart, -1);
      assert.notEqual(verifyExtensionsStart, -1);
      const restoreBlock = runnerSource.slice(
        restoreStart,
        verifyExtensionsStart,
      );
      assert.doesNotMatch(restoreBlock, /inputEarlyClosePolicy/);
    } finally {
      rmSync(root, { force: true, recursive: true });
    }
  },
);

const controlledRestoreCatalog = [
  "; pg_restore catalog fixture",
  "1; 0 0 EXTENSION - pg_trgm",
  "2; 0 0 COMMENT - EXTENSION pg_trgm",
  "3; 0 0 EXTENSION - vector",
  "4; 0 0 COMMENT - EXTENSION vector",
  "5; 0 0 TABLE public ControlledMutationAudit owner",
  "6; 0 0 TABLE public DatabaseIdentity owner",
  "7; 0 0 TABLE public Document owner",
  "8; 0 0 TABLE public EvidenceAppraisal owner",
  "9; 0 0 TABLE public SourceCitation owner",
  "10; 0 0 TABLE public _prisma_migrations owner",
  "",
].join("\n");

test("restore selection excludes exactly the two controlled extension entries", () => {
  const selection = buildControlledRestoreSelection(controlledRestoreCatalog);
  assert.equal(selection.excludedExtensionCount, 2);
  assert.equal(selection.commentEntryCount, 2);
  assert.equal(
    selection.catalogSha256,
    logicalRestoreCompanionSha256(controlledRestoreCatalog),
  );
  assert.equal(
    selection.filteredCatalogSha256,
    logicalRestoreCompanionSha256(selection.filteredCatalog),
  );
  const originalLines = controlledRestoreCatalog.split("\n");
  const filteredLines = selection.filteredCatalog.split("\n");
  const changed = originalLines.flatMap((line, index) =>
    line === filteredLines[index] ? [] : [[line, filteredLines[index]]],
  );
  assert.deepEqual(changed, [
    ["1; 0 0 EXTENSION - pg_trgm", ";1; 0 0 EXTENSION - pg_trgm"],
    ["3; 0 0 EXTENSION - vector", ";3; 0 0 EXTENSION - vector"],
  ]);
  assert.match(selection.filteredCatalog, /4; 0 0 COMMENT - EXTENSION vector/);
  assert.match(selection.filteredCatalog, /7; 0 0 TABLE public Document owner/);
});

test("restore selection refuses missing, duplicate, extra, or disguised catalog entries", () => {
  const variants = [
    controlledRestoreCatalog.replace("3; 0 0 EXTENSION - vector\n", ""),
    controlledRestoreCatalog.replace(
      "3; 0 0 EXTENSION - vector\n",
      "3; 0 0 EXTENSION - vector\n30; 0 0 EXTENSION - vector\n",
    ),
    controlledRestoreCatalog.replace(
      "3; 0 0 EXTENSION - vector\n",
      "3; 0 0 EXTENSION - vector\n30; 0 0 EXTENSION - hstore\n",
    ),
    controlledRestoreCatalog.replace("4; 0 0 COMMENT - EXTENSION vector\n", ""),
    controlledRestoreCatalog.replace(
      "4; 0 0 COMMENT - EXTENSION vector\n",
      "4; 0 0 COMMENT - EXTENSION vector\n40; 0 0 COMMENT - TABLE Document\n",
    ),
    controlledRestoreCatalog.replace(
      "3; 0 0 EXTENSION - vector",
      ";3; 0 0 EXTENSION - vector",
    ),
    controlledRestoreCatalog.replace(
      "3; 0 0 EXTENSION - vector",
      "3; 0 0 EXTENSION - vector extra",
    ),
    controlledRestoreCatalog.replace(
      "3; 0 0 EXTENSION - vector",
      " 3; 0 0 EXTENSION - vector",
    ),
    controlledRestoreCatalog.replace(
      "3; 0 0 EXTENSION - vector",
      "\t3; 0 0 EXTENSION - vector",
    ),
    controlledRestoreCatalog.replace(
      "3; 0 0 EXTENSION - vector",
      "+3; 0 0 EXTENSION - vector",
    ),
    controlledRestoreCatalog.replace(
      "4; 0 0 COMMENT - EXTENSION vector",
      "3; 0 0 COMMENT - EXTENSION vector",
    ),
    controlledRestoreCatalog.replaceAll("\n", "\r\n"),
    controlledRestoreCatalog.replace(
      "3; 0 0 EXTENSION - vector",
      "3; 0 0 EXTENSION - vec\0tor",
    ),
    controlledRestoreCatalog.trimEnd(),
  ];
  for (const catalog of variants) {
    assert.throws(
      () => buildControlledRestoreSelection(catalog),
      expectControlledCode("RESTORE_LIST_CATALOG"),
    );
  }
  assert.throws(
    () =>
      buildControlledRestoreSelection(
        `${controlledRestoreCatalog.trimEnd()}\n;${"x".repeat(1024 * 1024)}\n`,
      ),
    expectControlledCode("RESTORE_LIST_CATALOG"),
  );
  assert.throws(
    () =>
      buildControlledRestoreSelection(
        controlledRestoreCatalog.replace(
          "7; 0 0 TABLE public Document owner",
          "; required 7; 0 0 TABLE public Document owner",
        ),
      ),
    expectControlledCode("ARCHIVE_CATALOG"),
  );
});

test("restore-list capability requires the exact sealed selection shape", () => {
  const selection = buildControlledRestoreSelection(controlledRestoreCatalog);
  for (const tampered of [
    { ...selection, catalogSha256: HASH_A },
    { ...selection, filteredCatalogSha256: HASH_A },
    { ...selection, excludedExtensionCount: 1 },
    { ...selection, unexpected: true },
  ]) {
    assert.throws(
      () => createControlledRestoreListCapability(tampered),
      expectControlledCode("RESTORE_LIST_CAPABILITY"),
    );
  }
});

test("extension initializer request capability is canonical, unlinked, exact, and close-once", () => {
  const request = extensionInitializerRequestFixture();
  const capability =
    createControlledExtensionInitializerRequestCapability(request);
  try {
    const before = fstatSync(capability.descriptor, { bigint: true });
    assert.equal(before.isFile(), true);
    assert.equal(before.nlink, BigInt(0));
    assert.equal(Number(before.mode) & 0o777, 0o400);
    assert.equal(capability.requestSha256, request.requestSha256);
    const expectedBytes = Buffer.from(
      `${canonicalExtensionInitializerJson(request)}\n`,
      "utf8",
    );
    const actualBytes = readFileSync(capability.descriptor);
    assert.deepEqual(actualBytes, expectedBytes);
    assert.equal(
      capability.sha256,
      logicalRestoreCompanionSha256(expectedBytes),
    );
    const after = fstatSync(capability.descriptor, { bigint: true });
    assert.equal(after.ino, before.ino);
    assert.equal(after.dev, before.dev);
    assert.equal(after.size, before.size);
    assert.equal(after.nlink, BigInt(0));
  } finally {
    capability.close();
    capability.close();
  }
  assert.throws(() => fstatSync(capability.descriptor, { bigint: true }));
});

test(
  "unlinked FD3 restore list is exact, identity-bound, and never relaxes archive EPIPE",
  { timeout: 60_000 },
  async () => {
    const root = mkdtempSync(
      join(realpathSync(tmpdir()), "controlled-restore-list-test-"),
    );
    const executable = join(root, "pg_restore");
    const inputFile = join(root, "backup.dump");
    const args = [
      "--exit-on-error",
      "--no-owner",
      "--no-acl",
      "--no-comments",
      "--single-transaction",
      "--use-list=/dev/fd/3",
      "--dbname=foodsystems_restore_logical_fixture_0123456789abcdef",
    ];
    const selection = buildControlledRestoreSelection(controlledRestoreCatalog);
    try {
      copyFileSync(controlledPgRestoreCatalogFixturePath, executable);
      chmodSync(executable, 0o500);
      writeFileSync(inputFile, Buffer.alloc(32 * 1024 * 1024, 0x62), {
        mode: 0o600,
      });
      const run = async (mode: string) => {
        return runControlledSelectedRestoreCommand({
          databaseName: "foodsystems_restore_logical_fixture_0123456789abcdef",
          environment: {
            CONTROLLED_CATALOG_FIXTURE_MODE: mode,
            NODE_ENV: "test",
            PATH: process.env.PATH ?? "/usr/bin:/bin",
          },
          executable,
          inputFile,
          inputIdentity: statSync(inputFile, { bigint: true }),
          selection,
        });
      };

      const result = await run("restore-valid");
      const observed = JSON.parse(result.stdout) as {
        archiveBytes: number;
        restoreListSha256Input: string;
      };
      assert.equal(observed.archiveBytes, 32 * 1024 * 1024);
      assert.equal(observed.restoreListSha256Input, selection.filteredCatalog);
      await assert.rejects(
        run("restore-drift-list"),
        expectControlledCode("RESTORE_LIST_DESCRIPTOR"),
      );
      await assert.rejects(
        run("restore-early-close"),
        expectControlledCode("COMMAND_FAILED"),
      );

      const linkedPath = join(root, "linked.list");
      writeFileSync(linkedPath, selection.filteredCatalog, { mode: 0o400 });
      chmodSync(linkedPath, 0o400);
      const linkedDescriptor = openSync(linkedPath, constants.O_RDONLY);
      try {
        await assert.rejects(
          runControlledCommand({
            args,
            auxiliaryDescriptor: linkedDescriptor,
            auxiliaryDescriptorIdentity: fstatSync(linkedDescriptor, {
              bigint: true,
            }),
            auxiliaryDescriptorPolicy: CONTROLLED_RESTORE_USE_LIST_POLICY,
            auxiliaryDescriptorSha256: selection.filteredCatalogSha256,
            environment: {
              CONTROLLED_CATALOG_FIXTURE_MODE: "restore-valid",
              NODE_ENV: "test",
              PATH: process.env.PATH ?? "/usr/bin:/bin",
            },
            executable,
            inputFile,
            inputIdentity: statSync(inputFile, { bigint: true }),
          }),
          expectControlledCode("RESTORE_LIST_DESCRIPTOR"),
        );
      } finally {
        closeSync(linkedDescriptor);
      }

      const capability = createControlledRestoreListCapability(selection);
      try {
        await assert.rejects(
          runControlledCommand({
            args,
            auxiliaryDescriptor: capability.descriptor,
            auxiliaryDescriptorIdentity: capability.identity,
            auxiliaryDescriptorPolicy: "wrong-policy",
            auxiliaryDescriptorSha256: capability.filteredCatalogSha256,
            environment: {
              CONTROLLED_CATALOG_FIXTURE_MODE: "restore-valid",
              NODE_ENV: "test",
              PATH: process.env.PATH ?? "/usr/bin:/bin",
            },
            executable,
            inputFile,
            inputIdentity: statSync(inputFile, { bigint: true }),
          }),
          expectControlledCode("COMMAND_INPUT"),
        );
        await assert.rejects(
          runControlledCommand({
            args,
            auxiliaryDescriptor: capability.descriptor,
            auxiliaryDescriptorIdentity: capability.identity,
            auxiliaryDescriptorPolicy: CONTROLLED_RESTORE_USE_LIST_POLICY,
            auxiliaryDescriptorSha256: HASH_A,
            environment: {
              CONTROLLED_CATALOG_FIXTURE_MODE: "restore-valid",
              NODE_ENV: "test",
              PATH: process.env.PATH ?? "/usr/bin:/bin",
            },
            executable,
            inputFile,
            inputIdentity: statSync(inputFile, { bigint: true }),
          }),
          expectControlledCode("RESTORE_LIST_DESCRIPTOR"),
        );
      } finally {
        capability.close();
        capability.close();
      }

      const runnerSource = readFileSync(runnerPath, "utf8");
      const catalogBlock = runnerSource.match(
        /async catalog\(\) \{[\s\S]*?\n    async create\(/,
      );
      const restoreStart = runnerSource.indexOf(
        "    async restore(databaseName) {",
      );
      const verifyExtensionsStart = runnerSource.indexOf(
        "    async verifyExtensions(databaseName) {",
        restoreStart,
      );
      assert.ok(catalogBlock);
      assert.notEqual(restoreStart, -1);
      assert.notEqual(verifyExtensionsStart, -1);
      const restoreBlock = runnerSource.slice(
        restoreStart,
        verifyExtensionsStart,
      );
      assert.match(catalogBlock[0], /buildControlledRestoreSelection/);
      assert.match(restoreBlock, /runControlledSelectedRestoreCommand/);
      assert.doesNotMatch(restoreBlock, /await runControlledCommand\(/);
    } finally {
      rmSync(root, { force: true, recursive: true });
    }
  },
);

let currentRuntimeAttestation:
  ReturnType<typeof sourceRegistrationRuntimeAttestation> | undefined;

function currentRuntimeAttestationFixture() {
  currentRuntimeAttestation ??= sourceRegistrationRuntimeAttestation(repoRoot);
  return currentRuntimeAttestation;
}

function runtimeAttestationFixture() {
  const body = {
    launcher: { fileSha256: HASH_A, path: "scripts/launcher.mjs" },
    localClosure: {
      closureSha256: HASH_B,
      entryCount: 1,
      roots: ["scripts/runner.mjs"],
      totalFileBytes: 1,
    },
    node: {
      arch: "arm64",
      binaryFileSha256: HASH_C,
      platform: "darwin",
      runtimeClosureManifestSha256: HASH_D,
      runtimeClosureSha256: HASH_E,
      runtimeClosureVerifierFileSha256: HASH_A,
      version: "v26.0.0",
    },
    nodeModules: { treeSha256: HASH_B },
    prismaGeneratedClient: { treeSha256: HASH_C },
    postgresqlToolset: {
      closureSha256: HASH_D,
      manifestSha256: HASH_E,
      psqlVersion: "psql fixture",
      toolFileSha256: {
        createdb: HASH_A,
        dropdb: HASH_B,
        pgRestore: HASH_C,
        psql: HASH_D,
      },
      verifierFileSha256: HASH_A,
    },
    schemaVersion: "source-registration-runtime-attestation-v1",
  };
  return {
    ...body,
    runtimeAttestationSha256: runtimeSha256(
      `${SOURCE_REGISTRATION_RUNTIME_ATTESTATION_DOMAIN}${canonicalRuntimeJson(
        body,
      )}`,
    ),
  };
}

function nestedRehearsalProbeEnvironment(markerPath: string) {
  return {
    DATABASE_URL:
      "postgresql://probe:nested-secret@127.0.0.1:5432/foodsystems_restore_logical_probe",
    LANG: "C",
    LC_ALL: "C",
    PATH: process.env.PATH ?? "/usr/bin:/bin",
    SOURCE_REGISTRATION_LAUNCH_ATTESTATION_FD: "3",
    SOURCE_REGISTRATION_LAUNCHER_PID: String(process.pid),
    SOURCE_REGISTRATION_NESTED_REHEARSAL_PROBE_MARKER: markerPath,
    TMPDIR: "/tmp",
    TSX_TSCONFIG_PATH: sourceRegistrationTsxConfigPath,
    TZ: "UTC",
  };
}

function productionNestedRehearsalProbeEnvironment(markerPath: string) {
  const cloneDatabaseUrl =
    "postgresql://probe:nested-secret@127.0.0.1:5432/foodsystems_restore_logical_probe";
  const environment = controlledRehearsalChildEnvironment({
    cloneDatabaseUrl,
    input: {
      primaryCorpusRoot: "/private/corpus-primary",
      rehearsalOutputPath: "/private/rehearsal-receipt.json",
      replicaCorpusRoot: "/private/corpus-replica",
    },
    logicalComparisonProof: { logicalComparisonProofSha256: HASH_A },
    toolBindings: { executables: { psqlPath: process.execPath } },
  });
  assert.equal(environment.DATABASE_URL, cloneDatabaseUrl);
  assert.equal(
    environment.TSX_TSCONFIG_PATH,
    realpathSync(sourceRegistrationTsxConfigPath),
  );
  assert.equal(Object.hasOwn(environment, "DATABASE_RESTORE_ADMIN_URL"), false);
  assert.equal(
    Object.hasOwn(environment, "LOGICAL_RESTORE_SOURCE_DATABASE_URL"),
    false,
  );
  assert.deepEqual(Object.keys(environment).sort(), [
    "DATABASE_URL",
    "LANG",
    "LC_ALL",
    "PATH",
    "SOURCE_REGISTRATION_LAUNCHER_PID",
    "SOURCE_REGISTRATION_LAUNCH_ATTESTATION_FD",
    "SOURCE_REGISTRATION_REHEARSAL_LOGICAL_COMPARISON_PROOF_BASE64",
    "SOURCE_REGISTRATION_REHEARSAL_OUTPUT_FILE",
    "SOURCE_REGISTRATION_REHEARSAL_PRIMARY_CORPUS_ROOT",
    "SOURCE_REGISTRATION_REHEARSAL_REPLICA_CORPUS_ROOT",
    "TMPDIR",
    "TSX_TSCONFIG_PATH",
    "TZ",
  ]);
  return {
    ...environment,
    SOURCE_REGISTRATION_NESTED_REHEARSAL_PROBE_MARKER: markerPath,
  };
}

function attestationDescriptor(
  envelope: unknown,
  { mode = 0o400, unlink = true } = {},
) {
  const root = mkdtempSync(
    join(tmpdir(), "foodsystems-nested-attestation-test-"),
  );
  chmodSync(root, 0o700);
  const path = join(root, "runtime-attestation.json");
  writeFileSync(path, `${canonicalRuntimeJson(envelope)}\n`, {
    encoding: "utf8",
    mode,
  });
  chmodSync(path, mode);
  const descriptor = openSync(
    path,
    constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
  );
  if (unlink) unlinkSync(path);
  return {
    descriptor,
    close() {
      closeSync(descriptor);
      rmSync(root, { force: true, recursive: true });
    },
  };
}

test("caller-frozen PostgreSQL toolset binding covers all four executables", () => {
  const binarySha256 = {
    createdb: HASH_A,
    dropdb: HASH_B,
    pgRestore: HASH_C,
    psql: HASH_D,
  };
  const closure = {
    closureSha256: POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_SHA256,
    manifestSha256: POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_MANIFEST_SHA256,
    psqlFileSha256: HASH_D,
    toolFileSha256: { ...binarySha256 },
  };
  assert.equal(
    validateControlledPostgresqlToolsetBinding({
      binarySha256,
      closure,
      expectedClosureSha256: POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_SHA256,
      expectedManifestSha256:
        POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_MANIFEST_SHA256,
      expectedVerifierSha256: HASH_E,
      manifestFileSha256: POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_MANIFEST_SHA256,
      verifierFileSha256: HASH_E,
    }),
    true,
  );
  assert.throws(
    () =>
      validateControlledPostgresqlToolsetBinding({
        binarySha256,
        closure: {
          ...closure,
          toolFileSha256: { ...binarySha256, dropdb: HASH_E },
        },
        expectedClosureSha256: POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_SHA256,
        expectedManifestSha256:
          POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_MANIFEST_SHA256,
        expectedVerifierSha256: HASH_E,
        manifestFileSha256: POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_MANIFEST_SHA256,
        verifierFileSha256: HASH_E,
      }),
    /PostgreSQL toolset runtime bindings differ/,
  );
});

test("nested rehearsal receives exactly the five caller-frozen code pins", () => {
  assert.deepEqual(
    controlledRehearsalCodePinArguments({
      projectFacts: {
        sourceRegistrationApplyRunner: { sha256: HASH_A },
        sourceRegistrationLogicalCloneRehearsalCommandRunner: {
          sha256: HASH_E,
        },
        sourceRegistrationLogicalCloneRehearsalRuntime: { sha256: HASH_B },
        sourceRegistrationLogicalCloneRehearsalSchema: { sha256: HASH_C },
        sourceRegistrationLogicalCloneRehearsalTest: { sha256: HASH_D },
      },
    }),
    [
      `--apply-runner-sha256=${HASH_A}`,
      `--rehearsal-runtime-sha256=${HASH_B}`,
      `--rehearsal-schema-sha256=${HASH_C}`,
      `--rehearsal-test-sha256=${HASH_D}`,
      `--rehearsal-command-runner-sha256=${HASH_E}`,
    ],
  );
});

function toolBindings() {
  return {
    contextBindings: {
      backupContractHelperSha256: HASH_A,
      backupVerifierSha256: HASH_B,
      companionReceiptSchemaSha256: HASH_C,
      postgresqlToolsetCreatedbBinarySha256: HASH_C,
      postgresqlExtensionInitializerTestSha256: HASH_A,
      postgresqlExtensionRuntimeManifestSha256: HASH_D,
      postgresqlExtensionRuntimeVerifierSha256: HASH_E,
      sourceRegistrationLogicalCloneRehearsalTestSha256: HASH_E,
      structuralRestoreRunnerSha256: HASH_D,
    },
    executedTools: {
      companionReceiptValidatorSha256: HASH_A,
      companionRunnerSha256: HASH_B,
      databaseLogicalDigestSha256: HASH_D,
      dropdbBinarySha256: HASH_E,
      pgRestoreBinarySha256: HASH_A,
      psqlBinarySha256: HASH_B,
      psqlRuntimeClosureSha256: HASH_C,
      psqlRuntimeManifestSha256: HASH_D,
      psqlRuntimeVerifierSha256: HASH_E,
      postgresqlExtensionInitializerSha256: HASH_B,
      postgresqlExtensionRuntimeClosureSha256: HASH_A,
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
  const extensions = [
    {
      comment:
        "text similarity measurement and index searching based on trigrams",
      memberCount: 74,
      memberInventorySha256: HASH_A,
      name: "pg_trgm",
      owner: "gabrielfreeman",
      relocatable: true,
      schema: "public",
      version: "1.6",
    },
    {
      comment: "vector data type and ivfflat and hnsw access methods",
      memberCount: 135,
      memberInventorySha256: HASH_B,
      name: "vector",
      owner: "gabrielfreeman",
      relocatable: true,
      schema: "public",
      version: "0.8.2",
    },
  ];
  const extensionStateSha256 = logicalRestoreCompanionSha256(
    canonicalLogicalRestoreCompanionJson(extensions),
  );
  return {
    format: LOGICAL_RESTORE_COMPANION_RECEIPT_FORMAT,
    version: 1,
    canonicalJsonFormat: LOGICAL_RESTORE_COMPANION_CANONICAL_JSON,
    evidenceClass: LOGICAL_RESTORE_COMPANION_EVIDENCE_CLASS,
    extensionInitialization: {
      attestationSha256: HASH_A,
      catalogSha256: HASH_B,
      connectionLimitAfter: 1,
      connectionLimitBefore: 0,
      excludedExtensionCount: 2,
      extensions,
      extensionStateSha256,
      filteredCatalogSha256: HASH_C,
      fixedMutationPlanSha256:
        "fad5781af5501d12d2104f865cf158a068db787cc42ddb25934dccede8c56af7",
      postRestoreVerified: true,
      requestSha256: HASH_D,
      selectionPolicy: "validated_pg_restore_use_list_fd3",
      selectionSha256: HASH_E,
      skippedCommentCount: 2,
      sourceExtensionStateSha256: extensionStateSha256,
      sourceStateMatched: true,
      transactionCommitted: true,
    },
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

test("companion validates the locked launcher envelope before runtime use", () => {
  const attestation = runtimeAttestationFixture();
  const launcherPid = 12_345;
  const body = {
    attestation,
    launcherPid,
    launchPurpose: "logical_restore_companion",
  };
  const envelope = {
    ...body,
    envelopeSha256: runtimeSha256(
      `${SOURCE_REGISTRATION_RUNTIME_ENVELOPE_DOMAIN}${canonicalRuntimeJson(body)}`,
    ),
  };
  assert.deepEqual(
    validateControlledLogicalRestoreLauncherEnvelope(envelope, {
      expectedParentPid: launcherPid,
    }),
    attestation,
  );
  assert.throws(
    () =>
      validateControlledLogicalRestoreLauncherEnvelope(envelope, {
        expectedParentPid: launcherPid + 1,
      }),
    /launcher runtime identity is invalid/,
  );
  assert.throws(
    () =>
      validateControlledLogicalRestoreLauncherEnvelope(
        { ...envelope, envelopeSha256: HASH_B },
        { expectedParentPid: launcherPid },
      ),
    /launcher runtime envelope differs/,
  );
  assert.throws(
    () =>
      validateControlledLogicalRestoreLauncherEnvelope(
        { ...envelope, launchPurpose: "apply" },
        { expectedParentPid: launcherPid },
      ),
    /launcher runtime identity is invalid/,
  );
  const wrongInner = {
    ...attestation,
    runtimeAttestationSha256: HASH_E,
  };
  const wrongInnerBody = {
    attestation: wrongInner,
    launcherPid,
    launchPurpose: "logical_restore_companion",
  };
  assert.throws(
    () =>
      validateControlledLogicalRestoreLauncherEnvelope(
        {
          ...wrongInnerBody,
          envelopeSha256: runtimeSha256(
            `${SOURCE_REGISTRATION_RUNTIME_ENVELOPE_DOMAIN}${canonicalRuntimeJson(
              wrongInnerBody,
            )}`,
          ),
        },
        { expectedParentPid: launcherPid },
      ),
    /launcher runtime attestation differs/,
  );
  assert.throws(
    () =>
      validateControlledLogicalRestoreLauncherEnvelope(
        { ...envelope, unexpected: true },
        { expectedParentPid: launcherPid },
      ),
    /unexpected shape/,
  );
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

  const extensionInventoryMismatch = clone(validReceipt());
  extensionInventoryMismatch.extensionInitialization.extensions[0].memberInventorySha256 =
    HASH_E;
  assert.throws(
    () => validateLogicalRestoreCompanionReceipt(extensionInventoryMismatch),
    /extension initialization state hash differs/,
  );

  const extensionSourceMismatch = clone(validReceipt());
  extensionSourceMismatch.extensionInitialization.sourceExtensionStateSha256 =
    HASH_E;
  assert.throws(
    () => validateLogicalRestoreCompanionReceipt(extensionSourceMismatch),
    /extension initialization proof differs/,
  );

  const extensionOwnerMismatch = clone(validReceipt());
  extensionOwnerMismatch.extensionInitialization.extensions[1].owner =
    "foodsystems";
  assert.throws(
    () => validateLogicalRestoreCompanionReceipt(extensionOwnerMismatch),
    /extension initialization row differs/,
  );

  const extensionSelectionMismatch = clone(validReceipt());
  extensionSelectionMismatch.extensionInitialization.selectionPolicy =
    "unfiltered_restore";
  assert.throws(
    () => validateLogicalRestoreCompanionReceipt(extensionSelectionMismatch),
    /extension initialization proof differs/,
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
  const extensionInitialization = clone(validReceipt().extensionInitialization);
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
      async initialize(name: string) {
        calls.push(`initialize:${name}`);
        return extensionInitialization;
      },
      async restore(name: string) {
        calls.push(`restore:${name}`);
      },
      async verifyExtensions(name: string) {
        calls.push(`verify-extensions:${name}`);
        return extensionInitialization;
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
      `initialize:${cloneName}`,
      `restore:${cloneName}`,
      `verify-extensions:${cloneName}`,
      "digest:source-db",
      "digest:clone-db",
      "digest:source-db",
      "rehearse:clone-db",
      "digest:clone-db",
      "digest:source-db",
      "reverify:rehearsal:post-digest",
      `verify-extensions:${cloneName}`,
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

test("clone digest uses only the controlled non-superuser credentials", () => {
  const cloneName = "foodsystems_restore_logical_roles_0123456789abcdef";
  const cloneUrl = controlledCloneDigestDatabaseUrl(
    "postgresql://foodsystems:database-secret@127.0.0.1:5432/postgres?sslmode=require",
    cloneName,
  );
  const parsed = new URL(cloneUrl);
  assert.equal(parsed.username, "foodsystems");
  assert.equal(parsed.password, "database-secret");
  assert.equal(parsed.pathname, `/${cloneName}`);
  assert.throws(
    () =>
      controlledCloneDigestDatabaseUrl(
        "postgresql://restore_admin:admin-secret@127.0.0.1:5432/postgres?sslmode=require",
        cloneName,
      ),
    expectControlledCode("DATABASE_TARGET"),
  );
  const serialized = canonicalLogicalRestoreCompanionJson(validReceipt());
  assert.doesNotMatch(
    serialized,
    /restore_admin|source_reader|admin-secret|database-secret/,
  );
});

test("live connection identity requires foodsystems, NOSUPERUSER, and CREATEDB", () => {
  const identity = {
    currentDatabase: "foodsystems",
    currentUser: "foodsystems",
    currentUserCreateDb: true,
    currentUserSuper: false,
    serverVersionNum: "160013",
    sessionUser: "foodsystems",
    systemIdentifier: "7620055716543368057",
  };
  assert.deepEqual(
    validateControlledDatabaseConnectionIdentity(identity, "foodsystems"),
    identity,
  );
  assert.deepEqual(
    validateControlledDatabaseConnectionIdentity(
      { ...identity, currentDatabase: "postgres" },
      "postgres",
    ),
    { ...identity, currentDatabase: "postgres" },
  );
  const cloneDatabaseName =
    "foodsystems_restore_logical_20260803_0123456789abcdef01234567";
  assert.deepEqual(
    validateControlledDatabaseConnectionIdentity(
      { ...identity, currentDatabase: cloneDatabaseName },
      cloneDatabaseName,
    ),
    { ...identity, currentDatabase: cloneDatabaseName },
  );
  for (const changed of [
    { ...identity, currentUser: "gabrielfreeman" },
    { ...identity, sessionUser: "gabrielfreeman" },
    { ...identity, currentUserSuper: true },
    { ...identity, currentUserCreateDb: false },
  ]) {
    assert.throws(
      () =>
        validateControlledDatabaseConnectionIdentity(changed, "foodsystems"),
      expectControlledCode("DATABASE_TARGET"),
    );
  }
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

test("production drop guard also binds cluster, database OID, owner, and name", () => {
  const ownershipToken = "1".repeat(64);
  const identity = {
    activeSessions: 0,
    allowConnections: true,
    connectionLimit: 1,
    databaseName: "foodsystems_restore_logical_test_0123456789abcdef",
    databaseOid: 123456,
    databaseOwner: "foodsystems",
    encoding: "UTF8",
    isTemplate: false,
    ownershipComment: controlledCloneOwnershipComment(ownershipToken),
    serverVersionNum: "160013",
    systemIdentifier: "7620055716543368057",
  };
  for (const activeSessions of [0, 1, 3]) {
    assert.equal(
      verifyControlledCloneDropIdentity({
        actualIdentity: { ...identity, activeSessions },
        expectedIdentity: identity,
        ownershipToken,
      }),
      "owned",
    );
  }
  assert.equal(
    verifyControlledCloneDropIdentity({
      actualIdentity: null,
      expectedIdentity: identity,
      ownershipToken,
    }),
    "already_absent",
  );
  const dropArgs = controlledCloneDropCommandArgs(identity.databaseName);
  assert.deepEqual(dropArgs, [
    "--maintenance-db=postgres",
    "--if-exists",
    identity.databaseName,
  ]);
  assert.equal(dropArgs.includes("--force"), false);
  for (const actualIdentity of [
    { ...identity, databaseOid: identity.databaseOid + 1 },
    { ...identity, databaseOwner: "gabrielfreeman" },
    { ...identity, activeSessions: -1 },
    { ...identity, activeSessions: 1.5 },
    { ...identity, activeSessions: "1" },
    { ...identity, activeSessions: Number.MAX_SAFE_INTEGER + 1 },
    { ...identity, connectionLimit: -1 },
    {
      ...identity,
      ownershipComment: controlledCloneOwnershipComment("2".repeat(64)),
    },
  ]) {
    assert.throws(
      () =>
        verifyControlledCloneDropIdentity({
          actualIdentity,
          expectedIdentity: identity,
          ownershipToken,
        }),
      expectControlledCode("CLONE_IDENTITY"),
    );
  }
});

test("post-drop proof requires both the exact clone name and OID to be absent", () => {
  const expectedIdentity = {
    serverVersionNum: "160013",
    systemIdentifier: "7620055716543368057",
  };
  const absence = {
    databaseNameExists: false,
    databaseOidExists: false,
    ...expectedIdentity,
  };
  assert.equal(
    verifyControlledCloneAbsence({ actualAbsence: absence, expectedIdentity }),
    true,
  );
  for (const actualAbsence of [
    { ...absence, databaseNameExists: true },
    { ...absence, databaseOidExists: true },
    { ...absence, serverVersionNum: "160012" },
    { ...absence, systemIdentifier: "1" },
  ]) {
    assert.throws(
      () =>
        verifyControlledCloneAbsence({
          actualAbsence,
          expectedIdentity,
        }),
      expectControlledCode("CLEANUP_ABSENCE"),
    );
  }
});

test("create-window recovery requires the token-bound exact name and clone facts", () => {
  const ownershipToken = "1".repeat(64);
  const databaseName = controlledCloneName(
    ownershipToken,
    new Date("2026-08-03T00:00:00.000Z"),
  );
  const identity = {
    activeSessions: 0,
    allowConnections: true,
    connectionLimit: 0,
    databaseName,
    databaseOid: 123456,
    databaseOwner: "foodsystems",
    encoding: "UTF8",
    isTemplate: false,
    ownershipComment: "",
    serverVersionNum: "160013",
    systemIdentifier: "7620055716543368057",
  };
  const recovered = verifyControlledCloneRecoveryIdentity({
    actualIdentity: identity,
    databaseName,
    ownershipToken,
  });
  assert.equal(recovered.markerRequired, true);
  assert.equal(
    recovered.identity?.ownershipComment,
    controlledCloneOwnershipComment(ownershipToken),
  );
  assert.deepEqual(
    verifyControlledCloneRecoveryIdentity({
      actualIdentity: null,
      databaseName,
      ownershipToken,
    }),
    { identity: null, markerRequired: false },
  );
  for (const changed of [
    { ...identity, databaseName: `${databaseName.slice(0, -1)}0` },
    { ...identity, databaseOwner: "gabrielfreeman" },
    { ...identity, connectionLimit: 1 },
    { ...identity, activeSessions: 1 },
    {
      ...identity,
      ownershipComment: controlledCloneOwnershipComment("2".repeat(64)),
    },
  ]) {
    assert.throws(
      () =>
        verifyControlledCloneRecoveryIdentity({
          actualIdentity: changed,
          databaseName: changed.databaseName,
          ownershipToken,
        }),
      expectControlledCode("CLONE_IDENTITY"),
    );
  }
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
  const output = privateOutput("nested-abort-marker.txt");
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
    const result = await runControlledAttestedNestedRehearsalCommand({
      abortSignal: controller.signal,
      args: ["-e", child],
      cwd: repoRoot,
      environment: productionNestedRehearsalProbeEnvironment(output.path),
      executable: process.execPath,
      runtimeAttestation: runtimeAttestationFixture(),
    });
    assert.equal(result.stdout, "grandchild-finished");
    assert.equal(result.abortObservedAfterCompletion, true);
  } finally {
    clearTimeout(abortTimer);
    rmSync(output.root, { force: true, recursive: true });
  }
});

test("nested rehearsal receives the purpose-limited FD3 attestation without any source or admin URL", { skip: !supportedRuntime }, async () => {
  const output = privateOutput("nested-rehearsal-probe-marker.txt");
  const runtimeAttestation = currentRuntimeAttestationFixture();
  try {
    const result = await runControlledAttestedNestedRehearsalCommand({
      abortSignal: undefined,
      args: ["--import=tsx", nestedRehearsalProbePath],
      cwd: repoRoot,
      environment: productionNestedRehearsalProbeEnvironment(output.path),
      executable: process.execPath,
      runtimeAttestation,
    });
    assert.equal(
      readFileSync(output.path, "utf8"),
      "reached-after-attestation\n",
    );
    assert.equal(result.stderr, "");
    assert.deepEqual(JSON.parse(result.stdout), {
      runtimeAttestationSha256: runtimeAttestation.runtimeAttestationSha256,
      status: "nested-rehearsal-attestation-pass",
    });
    assert.doesNotMatch(
      `${result.stdout}${result.stderr}`,
      /nested-secret|postgresql:\/\/|DATABASE_(?:RESTORE_ADMIN_)?URL/,
    );
  } finally {
    rmSync(output.root, { force: true, recursive: true });
  }
});

test("nested rehearsal refuses a missing or misidentified attestation descriptor before child start", async (t) => {
  const runtimeAttestation = runtimeAttestationFixture();
  const validEnvelope =
    controlledNestedRehearsalRuntimeEnvelope(runtimeAttestation);
  for (const scenario of [
    "missing",
    "linked",
    "wrong-mode",
    "wrong-fd",
    "wrong-parent",
  ] as const) {
    await t.test(scenario, async () => {
      const output = privateOutput(`nested-${scenario}-marker.txt`);
      const environment = nestedRehearsalProbeEnvironment(output.path);
      if (scenario === "wrong-fd") {
        environment.SOURCE_REGISTRATION_LAUNCH_ATTESTATION_FD = "4";
      }
      if (scenario === "wrong-parent") {
        environment.SOURCE_REGISTRATION_LAUNCHER_PID = String(process.pid + 1);
      }
      const inherited =
        scenario === "missing"
          ? undefined
          : attestationDescriptor(validEnvelope, {
              mode: scenario === "wrong-mode" ? 0o600 : 0o400,
              unlink: scenario !== "linked",
            });
      try {
        await assert.rejects(
          runControlledNonInterruptibleNestedCommand({
            abortSignal: undefined,
            args: ["--import=tsx", nestedRehearsalProbePath],
            attestationDescriptor: inherited?.descriptor,
            cwd: repoRoot,
            environment,
            executable: process.execPath,
          }),
          scenario === "missing"
            ? /nested rehearsal attestation descriptor is required/
            : /nested rehearsal attestation descriptor is invalid/,
        );
        assert.throws(() => statSync(output.path), /ENOENT/);
      } finally {
        inherited?.close();
        rmSync(output.root, { force: true, recursive: true });
      }
    });
  }
});

test("nested rehearsal detects FD3 identity drift after the child exits", async () => {
  const output = privateOutput("nested-identity-drift-marker.txt");
  const inherited = attestationDescriptor(
    controlledNestedRehearsalRuntimeEnvelope(runtimeAttestationFixture()),
  );
  const child = "setTimeout(() => process.stdout.write('finished'), 80)";
  const driftTimer = setTimeout(
    () => fchmodSync(inherited.descriptor, 0o600),
    20,
  );
  try {
    await assert.rejects(
      runControlledNonInterruptibleNestedCommand({
        abortSignal: undefined,
        args: ["-e", child],
        attestationDescriptor: inherited.descriptor,
        cwd: repoRoot,
        environment: nestedRehearsalProbeEnvironment(output.path),
        executable: process.execPath,
      }),
      /nested rehearsal attestation descriptor changed/,
    );
    assert.throws(() => statSync(output.path), /ENOENT/);
  } finally {
    clearTimeout(driftTimer);
    inherited.close();
    rmSync(output.root, { force: true, recursive: true });
  }
});

test("nested rehearsal fully reattests immediately before and after success or failure", async (t) => {
  for (const childOutcome of ["success", "failure"] as const) {
    await t.test(childOutcome, async () => {
      const calls: string[] = [];
      const rehearsal = executeControlledReattestedNestedRehearsal({
        async reattestRuntime() {
          calls.push("reattest");
          return runtimeAttestationFixture();
        },
        async runNestedChild(
          runtimeAttestation: ReturnType<
            typeof sourceRegistrationRuntimeAttestation
          >,
        ) {
          calls.push("child");
          assert.equal(
            runtimeAttestation.runtimeAttestationSha256,
            runtimeAttestationFixture().runtimeAttestationSha256,
          );
          if (childOutcome === "failure") throw new Error("child failed");
          return "child passed";
        },
      });
      if (childOutcome === "failure") {
        await assert.rejects(rehearsal, /child failed/);
      } else {
        assert.equal(await rehearsal, "child passed");
      }
      assert.deepEqual(calls, ["reattest", "child", "reattest"]);
    });
  }
});

test("nested rehearsal child rejects a wrong-purpose envelope or tampered inner runtime before private work", { skip: !supportedRuntime }, async (t) => {
  const runtimeAttestation = currentRuntimeAttestationFixture();
  const tamperedRuntime = {
    ...runtimeAttestation,
    runtimeAttestationSha256: "f".repeat(64),
  };
  const variants = {
    "tampered-inner-runtime": {
      attestation: tamperedRuntime,
      launcherPid: process.pid,
    },
    "wrong-envelope-parent": {
      attestation: runtimeAttestation,
      launcherPid: process.pid + 1,
    },
    "wrong-purpose": {
      attestation: runtimeAttestation,
      launcherPid: process.pid,
      launchPurpose: "apply",
    },
  };
  for (const [scenario, body] of Object.entries(variants)) {
    await t.test(scenario, async () => {
      const output = privateOutput(`nested-${scenario}-marker.txt`);
      const envelope = {
        ...body,
        envelopeSha256: runtimeSha256(
          `${SOURCE_REGISTRATION_RUNTIME_ENVELOPE_DOMAIN}${canonicalRuntimeJson(
            body,
          )}`,
        ),
      };
      const inherited = attestationDescriptor(envelope);
      try {
        await assert.rejects(
          runControlledNonInterruptibleNestedCommand({
            abortSignal: undefined,
            args: ["--import=tsx", nestedRehearsalProbePath],
            attestationDescriptor: inherited.descriptor,
            cwd: repoRoot,
            environment: nestedRehearsalProbeEnvironment(output.path),
            executable: process.execPath,
          }),
          (error: Error) => {
            assert.match(
              error.message,
              /controlled database command failed closed/,
            );
            assert.doesNotMatch(error.message, /nested-secret|postgresql:\/\//);
            return true;
          },
        );
        assert.throws(() => statSync(output.path), /ENOENT/);
      } finally {
        inherited.close();
        rmSync(output.root, { force: true, recursive: true });
      }
    });
  }
});

for (const failingStage of [
  "create",
  "initialize",
  "restore",
  "verifyExtensions",
  "digest",
] as const) {
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

test("direct companion execution fails before evidence or database access", () => {
  const result = spawnSync(process.execPath, [runnerPath], {
    cwd: repoRoot,
    encoding: "utf8",
    env: {
      LANG: "C",
      LC_ALL: "C",
      NODE_ENV: "test",
      PATH: process.env.PATH ?? "",
      TZ: "UTC",
    },
  });
  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.equal(
    result.stderr,
    "[logical-restore-companion] ERROR LAUNCHER_REQUIRED\n",
  );
  assert.doesNotMatch(result.stderr, /DATABASE_URL|private|receipt|dump/i);
});
