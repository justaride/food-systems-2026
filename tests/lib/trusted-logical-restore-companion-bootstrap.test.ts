import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test, { type TestContext } from "node:test";

import {
  TRUSTED_COMPANION_BOOTSTRAP_CLEAN_ENVIRONMENT,
  TRUSTED_COMPANION_BOOTSTRAP_PREFLIGHT_CALLBACK,
  TRUSTED_COMPANION_BOOTSTRAP_PROBE_CALLBACK,
  TRUSTED_LAUNCHER_COMPANION_DIAGNOSTIC_CODES,
  TrustedLogicalRestoreBootstrapError,
  assertTrustedCompanionLauncherCopyPin,
  assertTrustedCompanionBootstrapEnvironment,
  canonicalTrustedCompanionJson,
  classifyTrustedLauncherCompanionFailure,
  discoverTrustedCompanionCorpusRoots,
  loadTrustedCompanionEvidence,
  parseTrustedCompanionBootstrapArguments,
  parseTrustedLauncherCompanionDiagnostic,
  readStrictDatabaseEnvironmentTarget,
  runTrustedLogicalRestoreCompanionBootstrap,
  runTrustedLogicalRestoreCompanionBootstrapProbe,
  spawnBoundedNode,
  trustedCompanionBootstrapObservedCleanEnvironment,
} from "../../scripts/knowledge/run-trusted-logical-restore-companion.mjs";
import { CONTROLLED_LOGICAL_RESTORE_DIAGNOSTIC_CODES } from "../../scripts/knowledge/launch-locked-source-registration-apply.mjs";

const projectRoot = process.cwd();
const bootstrapPath = resolve(
  projectRoot,
  "scripts/knowledge/run-trusted-logical-restore-companion.mjs",
);
const probePath = resolve(
  projectRoot,
  "tests/fixtures/trusted-logical-restore-companion-bootstrap-probe.mjs",
);
const refusalProbePath = resolve(
  projectRoot,
  "tests/fixtures/trusted-logical-restore-companion-bootstrap-refusal-probe.mjs",
);
const supportedRuntime =
  process.platform === "darwin" && process.arch === "arm64";
const backupBasename =
  "foodsystems-bootstrap-test-20260803-20260803T120000Z.dump";
const outputBasename = "gate2c-20260803-abc123";
const sourceDatabaseName = "foodsystems";
const sourceDatabaseUrl =
  "postgresql://foodsystems:bootstrap-password@127.0.0.1:1/foodsystems?schema=public";

type Fixture = {
  configuration: {
    documentsRoot: string;
    envLinkPath: string;
    nodeBinary: string;
    privateDataRoot: string;
    projectRoot: string;
    temporaryRoot: string;
    volumesRoot: string;
  };
  dumpBindingPath: string;
  markerPath: string;
  replicaCorpusRoot: string;
  root: string;
};

function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalBytes(value: unknown): Buffer {
  return Buffer.from(`${canonicalTrustedCompanionJson(value)}\n`, "utf8");
}

function privateDirectory(path: string): void {
  mkdirSync(path, { mode: 0o700, recursive: true });
  chmodSync(path, 0o700);
}

function privateFile(path: string, bytes: string | Buffer, mode = 0o600): void {
  writeFileSync(path, bytes, { flag: "wx", mode });
  chmodSync(path, mode);
}

function makeFixture(t: TestContext): Fixture {
  const root = mkdtempSync(
    join(realpathSync(tmpdir()), "trusted-companion-bootstrap-test-"),
  );
  chmodSync(root, 0o700);
  t.after(() => rmSync(root, { force: true, recursive: true }));

  const documentsRoot = join(root, "Documents");
  const primaryCorpusRoot = join(
    documentsRoot,
    "Food Systems 2026",
    ".private-archive",
    "corpus",
  );
  privateDirectory(primaryCorpusRoot);
  privateFile(join(primaryCorpusRoot, "primary.marker"), "primary\n");

  const volumesRoot = join(root, "Volumes");
  const replicaCorpusRoot = join(
    volumesRoot,
    "ReplicaVolume",
    "Food Systems 2026 Private Archive",
    "corpus",
  );
  privateDirectory(replicaCorpusRoot);
  privateFile(join(replicaCorpusRoot, "replica.marker"), "replica\n");

  const privateDataRoot = join(root, "private-data");
  const backupRoot = join(privateDataRoot, "backups");
  const receiptRoot = join(privateDataRoot, "restore-receipts");
  const outputRoot = join(receiptRoot, outputBasename);
  privateDirectory(backupRoot);
  privateDirectory(outputRoot);

  const dumpPath = join(backupRoot, backupBasename);
  const dump = Buffer.from("database-free-custom-archive-fixture\n", "utf8");
  const dumpSha256 = sha256(dump);
  privateFile(dumpPath, dump);

  const coreCounts = {
    ControlledMutationAudit: 1,
    DatabaseIdentity: 1,
    Document: 2,
    EvidenceAppraisal: 1,
    FieldCitation: 1,
    LibraryAnalysisRecord: 1,
    Report: 1,
    SourceCitation: 1,
    SourceDoc: 1,
    Thesis: 1,
  };
  const databaseIdentity = {
    key: "primary",
    uuid: "123e4567-e89b-42d3-a456-426614174000",
  };
  const completedPrismaMigrationLedger = {
    completedCount: 1,
    sha256: sha256("migration-ledger"),
  };
  const targetDatabaseFingerprint = {
    canonicalJsonFormat: "sorted-keys-v1",
    sha256: sha256(
      canonicalTrustedCompanionJson({
        completedPrismaMigrationLedger,
        coreCounts,
        databaseIdentity,
      }),
    ),
  };
  const metadata = {
    completedPrismaMigrationLedger,
    coreCounts,
    createdAtUtc: "2026-08-03T10:00:00.000Z",
    databaseIdentity,
    dump: {
      archiveFormat: "postgresql-custom",
      bytes: dump.length,
      fileName: backupBasename,
      sha256: dumpSha256,
    },
    format: "foodsystems-database-backup-metadata",
    source: {
      databaseName: sourceDatabaseName,
      serverVersion: "PostgreSQL fixture",
    },
    targetDatabaseFingerprint,
    version: 2,
  };
  const metadataBytes = canonicalBytes(metadata);
  const metadataPath = `${dumpPath}.metadata`;
  const metadataSha256 = sha256(metadataBytes);
  privateFile(metadataPath, metadataBytes);
  privateFile(`${metadataPath}.sha256`, `${metadataSha256}\n`);
  const dumpBindingPath = `${dumpPath}.sha256`;
  privateFile(dumpBindingPath, `${dumpSha256}  ${backupBasename}\n`);

  const structuralReceipt = {
    backup: {
      dumpBytes: dump.length,
      dumpSha256,
      metadataSha256,
    },
    checks: {
      archiveChecksumAndCatalog: "pass",
      completedMigrationLedger: "pass",
      constraintsValidated: "pass",
      databaseIdentity: "pass",
      exactCoreCounts: "pass",
      indexesReady: "pass",
      metadataV2Binding: "pass",
      optionalOperatorExpectedCounts: { status: "pass", supplied: {} },
      requiredRelationsAndNonEmptyData: "pass",
      restoreCompleted: "pass",
      targetDatabaseFingerprint: "pass",
    },
    cleanup: {
      databaseAbsenceConfirmed: true,
      databaseName: "foodsystems_restore_fixture",
      drop: "pass",
    },
    completedAtUtc: "2026-08-03T11:00:00.000Z",
    completedPrismaMigrationLedger,
    coreCounts,
    databaseIdentity,
    format: "foodsystems-database-restore-receipt",
    targetDatabaseFingerprint,
    version: 1,
  };
  privateFile(
    join(
      receiptRoot,
      backupBasename.replace(/\.dump$/, ".restore-receipt.json"),
    ),
    canonicalBytes(structuralReceipt),
  );
  const markerPath = join(outputRoot, "preserved-existing-receipt.json");
  privateFile(markerPath, canonicalBytes({ status: "preserve" }), 0o400);

  const envTarget = join(root, "database.env.private");
  privateFile(
    envTarget,
    `# controlled test database\nDATABASE_URL="${sourceDatabaseUrl}"`,
  );
  const envLinkPath = join(root, "project.env");
  symlinkSync(envTarget, envLinkPath);

  const temporaryRoot = join(root, "temporary");
  privateDirectory(temporaryRoot);
  return {
    configuration: {
      documentsRoot,
      envLinkPath,
      nodeBinary: realpathSync(process.execPath),
      privateDataRoot,
      projectRoot,
      temporaryRoot,
      volumesRoot,
    },
    dumpBindingPath,
    markerPath,
    replicaCorpusRoot,
    root,
  };
}

function argumentsFor(preflight = false): string[] {
  return [
    `--backup-basename=${backupBasename}`,
    `--output-basename=${outputBasename}`,
    ...(preflight ? ["--preflight"] : []),
  ];
}

function fixedTemporaryBootstrapEntries(): string[] {
  return readdirSync(realpathSync("/tmp"))
    .filter(
      (name) =>
        name.startsWith("foodsystems-source-registration-trusted-launcher-") ||
        name.startsWith("foodsystems-logical-restore-capabilities-"),
    )
    .sort();
}

function expectBootstrapCode(code: string): (error: unknown) => boolean {
  return (error: unknown) =>
    error instanceof TrustedLogicalRestoreBootstrapError && error.code === code;
}

function processEnvironment(
  value: Readonly<Record<string, string>>,
): NodeJS.ProcessEnv {
  return value as unknown as NodeJS.ProcessEnv;
}

test("bootstrap accepts only two non-sensitive exact basenames", () => {
  assert.deepEqual(parseTrustedCompanionBootstrapArguments(argumentsFor()), {
    backupBasename,
    outputBasename,
    preflight: false,
  });
  for (const arguments_ of [
    [
      `--backup-basename=/private/${backupBasename}`,
      `--output-basename=${outputBasename}`,
    ],
    [
      `--backup-basename=postgresql://user:password@localhost/${backupBasename}`,
      `--output-basename=${outputBasename}`,
    ],
    [`--backup-basename=${backupBasename}`],
    [
      `--backup-basename=${backupBasename}`,
      `--backup-basename=${backupBasename}`,
      `--output-basename=${outputBasename}`,
    ],
  ]) {
    assert.throws(() => parseTrustedCompanionBootstrapArguments(arguments_));
  }
});

test("parent rejects a launcher copy that differs from its fresh pin", () => {
  const fresh = sha256("fresh-launcher");
  assert.equal(assertTrustedCompanionLauncherCopyPin(fresh, fresh), true);
  assert.throws(
    () =>
      assertTrustedCompanionLauncherCopyPin(sha256("changed-launcher"), fresh),
    expectBootstrapCode("LAUNCHER_PIN_CHANGED"),
  );
});

test("bootstrap relays only exact whitelisted launcher diagnostic bytes", () => {
  const childDiagnostics = CONTROLLED_LOGICAL_RESTORE_DIAGNOSTIC_CODES.map(
    (code) => `COMPANION_CHILD_${code}`,
  );
  for (const code of childDiagnostics) {
    assert.equal(
      TRUSTED_LAUNCHER_COMPANION_DIAGNOSTIC_CODES.includes(code),
      true,
      code,
    );
  }
  for (const code of TRUSTED_LAUNCHER_COMPANION_DIAGNOSTIC_CODES) {
    const exitCode = code === "COMPANION_INTERRUPTED" ? 130 : 1;
    const bytes = Buffer.from(
      `[locked-source-registration-launcher] ERROR ${code}\n`,
      "utf8",
    );
    assert.equal(
      parseTrustedLauncherCompanionDiagnostic(bytes, exitCode),
      code,
    );
    assert.equal(
      classifyTrustedLauncherCompanionFailure({
        code: exitCode,
        overflow: false,
        signal: null,
        stderrBytes: bytes,
        stdoutBytes: Buffer.alloc(0),
      }),
      code,
    );
  }
});

test("bootstrap diagnostic relay rejects malformed, mixed, and wrong-status output", () => {
  const prefix =
    "[locked-source-registration-launcher] ERROR COMPANION_CHILD_COMMAND_FAILED";
  for (const bytes of [
    Buffer.from(`${prefix}\r\n`, "utf8"),
    Buffer.from(prefix, "utf8"),
    Buffer.from(`${prefix} \n`, "utf8"),
    Buffer.from(`${prefix}\n${prefix}\n`, "utf8"),
    Buffer.from(`${prefix}\nsecret=/private/receipt.json\n`, "utf8"),
    Buffer.from(
      "[locked-source-registration-launcher] ERROR COMPANION_CHILD_UNKNOWN\n",
      "utf8",
    ),
    Buffer.concat([
      Buffer.from(prefix, "utf8"),
      Buffer.from([0]),
      Buffer.from("\n"),
    ]),
    Buffer.from([0xff, 0xfe, 0xfd]),
  ]) {
    assert.equal(parseTrustedLauncherCompanionDiagnostic(bytes, 1), null);
  }
  const exact = Buffer.from(`${prefix}\n`, "utf8");
  for (const facts of [
    { code: 0, overflow: false, signal: null, stdoutBytes: Buffer.alloc(0) },
    { code: 2, overflow: false, signal: null, stdoutBytes: Buffer.alloc(0) },
    { code: 1, overflow: true, signal: null, stdoutBytes: Buffer.alloc(0) },
    {
      code: 1,
      overflow: false,
      signal: "SIGTERM",
      stdoutBytes: Buffer.alloc(0),
    },
    {
      code: 1,
      overflow: false,
      signal: null,
      stdoutBytes: Buffer.from("secret"),
    },
  ]) {
    assert.equal(
      classifyTrustedLauncherCompanionFailure({
        ...facts,
        stderrBytes: exact,
      }),
      null,
    );
  }
});

test("bounded child normalizes an ordinary exit to an explicit null signal", async () => {
  const result = await spawnBoundedNode({
    arguments_: ["--input-type=module", "--eval", "process.exitCode = 1"],
    cwd: projectRoot,
    environment: trustedCompanionBootstrapObservedCleanEnvironment(),
    nodeBinary: process.execPath,
    stdio: ["ignore", "pipe", "pipe"],
  });
  assert.equal(result.code, 1);
  assert.equal(result.signal, null);
  assert.equal(result.overflow, false);
  assert.equal(result.stdout, "");
  assert.equal(result.stderr, "");
});

test("bootstrap refuses every inherited environment addition", () => {
  const clean = processEnvironment(
    trustedCompanionBootstrapObservedCleanEnvironment(),
  );
  assert.equal(assertTrustedCompanionBootstrapEnvironment(clean, []), true);
  assert.throws(
    () =>
      assertTrustedCompanionBootstrapEnvironment(
        processEnvironment({ ...clean, NODE_OPTIONS: "--inspect" }),
        [],
      ),
    expectBootstrapCode("PRE_NODE_ENVIRONMENT_DIRTY"),
  );
  assert.throws(
    () => assertTrustedCompanionBootstrapEnvironment(clean, ["--inspect"]),
    expectBootstrapCode("PRE_NODE_ENVIRONMENT_DIRTY"),
  );
  if (process.platform === "darwin") {
    assert.throws(
      () =>
        assertTrustedCompanionBootstrapEnvironment(
          processEnvironment({
            ...clean,
            __CF_USER_TEXT_ENCODING: "0x0:0x0:0x0",
          }),
          [],
        ),
      expectBootstrapCode("PRE_NODE_ENVIRONMENT_DIRTY"),
    );
  }
});

test("CLI diagnostics never echo rejected path, credential, or dirty value", () => {
  const secret = "do-not-echo-bootstrap-secret";
  const privateArgument = `--backup-basename=/private/${secret}.dump`;
  const result = spawnSync(process.execPath, [bootstrapPath, privateArgument], {
    cwd: projectRoot,
    encoding: "utf8",
    env: processEnvironment(TRUSTED_COMPANION_BOOTSTRAP_CLEAN_ENVIRONMENT),
  });
  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.equal(
    result.stderr,
    "[trusted-logical-restore-bootstrap] ERROR ARGUMENTS_PRIVATE\n",
  );
  assert.doesNotMatch(
    `${result.stdout}${result.stderr}`,
    /private|do-not-echo/,
  );

  const dirty = spawnSync(
    process.execPath,
    [bootstrapPath, ...argumentsFor(true)],
    {
      cwd: projectRoot,
      encoding: "utf8",
      env: processEnvironment({
        ...TRUSTED_COMPANION_BOOTSTRAP_CLEAN_ENVIRONMENT,
        BOOTSTRAP_SECRET: secret,
      }),
    },
  );
  assert.equal(dirty.status, 1);
  assert.equal(dirty.stdout, "");
  assert.equal(
    dirty.stderr,
    "[trusted-logical-restore-bootstrap] ERROR PRE_NODE_ENVIRONMENT_DIRTY\n",
  );
  assert.doesNotMatch(dirty.stderr, new RegExp(secret));
});

test("strict dotenv reader accepts one quoted key and rejects mode or syntax drift", (t) => {
  const fixture = makeFixture(t);
  const result = readStrictDatabaseEnvironmentTarget({
    envLinkPath: fixture.configuration.envLinkPath,
    projectRoot,
  });
  assert.equal(result.sourceDatabaseName, sourceDatabaseName);
  assert.equal(new URL(result.adminDatabaseUrl).pathname, "/postgres");
  assert.equal(
    new URL(result.sourceDatabaseUrl).pathname,
    `/${sourceDatabaseName}`,
  );

  const target = realpathSync(fixture.configuration.envLinkPath);
  chmodSync(target, 0o644);
  assert.throws(
    () =>
      readStrictDatabaseEnvironmentTarget({
        envLinkPath: fixture.configuration.envLinkPath,
        projectRoot,
      }),
    expectBootstrapCode("DOTENV_TARGET_MODE"),
  );
  chmodSync(target, 0o600);
  writeFileSync(
    target,
    `DATABASE_URL="${sourceDatabaseUrl}"\nDATABASE_URL="${sourceDatabaseUrl}"`,
  );
  assert.throws(
    () =>
      readStrictDatabaseEnvironmentTarget({
        envLinkPath: fixture.configuration.envLinkPath,
        projectRoot,
      }),
    expectBootstrapCode("DOTENV_KEY_INVALID"),
  );
  writeFileSync(
    target,
    `DATABASE_URL="${sourceDatabaseUrl}&host=attacker.invalid"`,
  );
  assert.throws(
    () =>
      readStrictDatabaseEnvironmentTarget({
        envLinkPath: fixture.configuration.envLinkPath,
        projectRoot,
      }),
    expectBootstrapCode("DATABASE_URL_INVALID"),
  );
  writeFileSync(
    target,
    `DATABASE_URL="postgresql://restore_admin:bootstrap-password@127.0.0.1:1/foodsystems?schema=public"`,
  );
  assert.throws(
    () =>
      readStrictDatabaseEnvironmentTarget({
        envLinkPath: fixture.configuration.envLinkPath,
        projectRoot,
      }),
    expectBootstrapCode("DATABASE_ADMIN_DERIVATION"),
  );
});

test("corpus discovery requires one distinct private primary and replica", (t) => {
  const fixture = makeFixture(t);
  const roots = discoverTrustedCompanionCorpusRoots({
    documentsRoot: fixture.configuration.documentsRoot,
    volumesRoot: fixture.configuration.volumesRoot,
  });
  assert.notEqual(roots.primaryCorpusRoot, roots.replicaCorpusRoot);
  chmodSync(fixture.replicaCorpusRoot, 0o755);
  assert.throws(
    () =>
      discoverTrustedCompanionCorpusRoots({
        documentsRoot: fixture.configuration.documentsRoot,
        volumesRoot: fixture.configuration.volumesRoot,
      }),
    expectBootstrapCode("REPLICA_CORPUS_INVALID"),
  );
});

test("evidence loader fails closed on a changed dump sidecar", async (t) => {
  const fixture = makeFixture(t);
  await loadTrustedCompanionEvidence({
    backupBasename,
    outputBasename,
    privateDataRoot: fixture.configuration.privateDataRoot,
    sourceDatabaseName,
  });
  writeFileSync(
    fixture.dumpBindingPath,
    `${sha256("wrong")}  ${backupBasename}\n`,
  );
  await assert.rejects(
    loadTrustedCompanionEvidence({
      backupBasename,
      outputBasename,
      privateDataRoot: fixture.configuration.privateDataRoot,
      sourceDatabaseName,
    }),
    expectBootstrapCode("DUMP_BINDING_INVALID"),
  );
});

test(
  "preflight verifies runtime, roots, evidence and unlinked capabilities without a database",
  { skip: !supportedRuntime, timeout: 30_000 },
  async (t) => {
    const fixture = makeFixture(t);
    const callback = await runTrustedLogicalRestoreCompanionBootstrap({
      arguments_: argumentsFor(true),
      configuration: fixture.configuration,
      environment: processEnvironment(
        trustedCompanionBootstrapObservedCleanEnvironment(),
      ),
      execArgv: [],
    });
    assert.equal(callback, TRUSTED_COMPANION_BOOTSTRAP_PREFLIGHT_CALLBACK);
    assert.deepEqual(readdirSync(fixture.configuration.temporaryRoot), []);
    assert.equal(
      readFileSync(fixture.markerPath, "utf8"),
      '{"status":"preserve"}\n',
    );
    assert.doesNotMatch(callback, /postgresql:|\/private|Volumes|Documents/);
  },
);

test(
  "parent removes launcher and capabilities after a path-free child refusal",
  { skip: !supportedRuntime, timeout: 30_000 },
  async (t) => {
    const fixture = makeFixture(t);
    await assert.rejects(
      runTrustedLogicalRestoreCompanionBootstrapProbe({
        arguments_: argumentsFor(),
        configuration: fixture.configuration,
        environment: processEnvironment(
          trustedCompanionBootstrapObservedCleanEnvironment(),
        ),
        execArgv: [],
        probeEntryPath: refusalProbePath,
      }),
      expectBootstrapCode("PROBE_REFUSED"),
    );
    assert.deepEqual(readdirSync(fixture.configuration.temporaryRoot), []);
    assert.equal(
      readFileSync(fixture.markerPath, "utf8"),
      '{"status":"preserve"}\n',
    );
  },
);

test(
  "harmless probe proves clean argv, copy-path/FD3 identity, unlinked FD4/FD5 and cleanup",
  { skip: !supportedRuntime, timeout: 30_000 },
  async (t) => {
    const fixture = makeFixture(t);
    const temporaryBefore = fixedTemporaryBootstrapEntries();
    const callback = await runTrustedLogicalRestoreCompanionBootstrapProbe({
      arguments_: argumentsFor(),
      configuration: { ...fixture.configuration, temporaryRoot: "/tmp" },
      environment: processEnvironment(
        trustedCompanionBootstrapObservedCleanEnvironment(),
      ),
      execArgv: [],
      probeEntryPath: probePath,
    });
    assert.equal(callback, TRUSTED_COMPANION_BOOTSTRAP_PROBE_CALLBACK);
    assert.deepEqual(fixedTemporaryBootstrapEntries(), temporaryBefore);
    assert.equal(
      readFileSync(fixture.markerPath, "utf8"),
      '{"status":"preserve"}\n',
    );
    assert.doesNotMatch(
      callback,
      /postgresql:|bootstrap-password|Volumes|Documents/,
    );
  },
);
