import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  closeSync,
  copyFileSync,
  existsSync,
  mkdtempSync,
  openSync,
  readFileSync,
  realpathSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";

import {
  LOGICAL_RESTORE_COMPANION_ENVIRONMENT_NAMES,
  LOGICAL_RESTORE_COMPANION_MODE,
  LOGICAL_RESTORE_COMPANION_PRELOAD_PIN_ENVIRONMENT_NAMES,
  LOGICAL_RESTORE_COMPANION_RUNNER,
  LOGICAL_RESTORE_COMPANION_SECRET_ENVIRONMENT_NAMES,
  SOURCE_REGISTRATION_LOCKED_NODE_RUNTIME_CLOSURE_SHA256,
  SOURCE_REGISTRATION_LOCKED_PSQL_RUNTIME_CLOSURE_SHA256,
  assertControlledLauncherEnvironment,
  canonicalRuntimeJson,
  controlledChildEnvironment,
  logicalRestoreCompanionStagingStorage,
  logicalRestoreCompanionEnvironmentAdditions,
  promoteLogicalRestoreCompanionReceiptPair,
  requireLogicalRestoreCompanionExpectedPins,
  runtimeSha256,
  validateLogicalRestoreCompanionCallback,
} from "../../scripts/knowledge/launch-locked-source-registration-apply.mjs";
import {
  finalizeLogicalRestoreReceiptPairJournal,
  prepareLogicalRestoreReceiptPairJournal,
  recoverLogicalRestoreReceiptPairJournal,
} from "../../scripts/knowledge/logical-restore-receipt-pair-journal.mjs";

const receiptPairJournalRuntime = {
  finalizeLogicalRestoreReceiptPairJournal,
  prepareLogicalRestoreReceiptPairJournal,
  recoverLogicalRestoreReceiptPairJournal,
};

const projectRoot = process.cwd();
const launcher = resolve(
  projectRoot,
  "scripts/knowledge/launch-locked-source-registration-apply.mjs",
);
const runner = resolve(
  projectRoot,
  "scripts/knowledge/apply-source-registration-plan.ts",
);
const trustedEntrypointProbe = resolve(
  projectRoot,
  "tests/fixtures/source-registration-trusted-entrypoint-probe.mjs",
);
const supportedRuntime =
  process.platform === "darwin" && process.arch === "arm64";
const unreachableDatabaseUrl =
  "postgresql://launcher-test:launcher-test@127.0.0.1:1/launcher-test?connect_timeout=1";

type RuntimeAttestation = {
  launcher: { fileSha256: string };
  localClosure: { closureSha256: string; roots: string[] };
  node: {
    arch: string;
    binaryFileSha256: string;
    platform: string;
    runtimeClosureSha256: string;
    runtimeClosureManifestSha256: string;
    runtimeClosureVerifierFileSha256: string;
    version: string;
  };
  nodeModules: { treeSha256: string };
  prismaGeneratedClient: { treeSha256: string };
  postgresqlToolset: {
    closureSha256: string;
    manifestSha256: string;
    psqlVersion: string;
    toolFileSha256: {
      createdb: string;
      dropdb: string;
      pgRestore: string;
      psql: string;
    };
    verifierFileSha256: string;
  };
  runtimeAttestationSha256: string;
};

let cachedRuntimeAttestation: RuntimeAttestation | undefined;

function cleanParentEnvironment() {
  return {
    LANG: "C",
    LC_ALL: "C",
    PATH: process.env.PATH ?? "/usr/bin:/bin:/usr/sbin:/sbin",
    TMPDIR: "/tmp",
    TZ: "UTC",
  } as unknown as NodeJS.ProcessEnv;
}

function sha256File(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function logicalRestoreCompanionEnvironment(
  attestation: RuntimeAttestation,
): NodeJS.ProcessEnv {
  const environment = Object.fromEntries(
    LOGICAL_RESTORE_COMPANION_ENVIRONMENT_NAMES.map((name) => [
      name,
      "fixture",
    ]),
  ) as NodeJS.ProcessEnv;
  Object.assign(environment, {
    LOGICAL_RESTORE_EXPECTED_COMPANION_RECEIPT_SCHEMA_SHA256: sha256File(
      realpathSync(
        resolve(
          projectRoot,
          "knowledge/schema/database-logical-restore-companion-receipt.schema.v1.json",
        ),
      ),
    ),
    LOGICAL_RESTORE_EXPECTED_COMPANION_TEST_SHA256: sha256File(
      realpathSync(
        resolve(
          projectRoot,
          "tests/lib/database-logical-restore-companion.test.ts",
        ),
      ),
    ),
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_APPLY_RUNNER_SHA256:
      sha256File(
        realpathSync(
          resolve(
            projectRoot,
            "scripts/knowledge/apply-source-registration-plan.ts",
          ),
        ),
      ),
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_APPLY_RUNTIME_SHA256:
      sha256File(
        realpathSync(
          resolve(
            projectRoot,
            "src/lib/knowledge/source-registration-apply.ts",
          ),
        ),
      ),
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_LAUNCHER_SHA256:
      attestation.launcher.fileSha256,
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_LOCAL_RUNTIME_CLOSURE_SHA256:
      attestation.localClosure.closureSha256,
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_BINARY_SHA256:
      attestation.node.binaryFileSha256,
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_MODULES_TREE_SHA256:
      attestation.nodeModules.treeSha256,
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_RUNTIME_CLOSURE_SHA256:
      attestation.node.runtimeClosureSha256,
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_RUNTIME_MANIFEST_SHA256:
      attestation.node.runtimeClosureManifestSha256,
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_RUNTIME_VERIFIER_SHA256:
      attestation.node.runtimeClosureVerifierFileSha256,
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_POSTGRESQL_TOOLSET_CLOSURE_SHA256:
      attestation.postgresqlToolset.closureSha256,
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_POSTGRESQL_TOOLSET_MANIFEST_SHA256:
      attestation.postgresqlToolset.manifestSha256,
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_POSTGRESQL_TOOLSET_VERIFIER_SHA256:
      attestation.postgresqlToolset.verifierFileSha256,
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_PRISMA_CLIENT_TREE_SHA256:
      attestation.prismaGeneratedClient.treeSha256,
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_REHEARSAL_COMMAND_RUNNER_SHA256:
      sha256File(
        realpathSync(
          resolve(
            projectRoot,
            "scripts/knowledge/run-source-registration-logical-clone-rehearsal.ts",
          ),
        ),
      ),
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_REHEARSAL_RUNTIME_SHA256:
      sha256File(
        realpathSync(
          resolve(
            projectRoot,
            "src/lib/knowledge/source-registration-logical-clone-rehearsal.ts",
          ),
        ),
      ),
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_REHEARSAL_SCHEMA_SHA256:
      sha256File(
        realpathSync(
          resolve(
            projectRoot,
            "knowledge/schema/source-registration-logical-clone-rehearsal-receipt.schema.v1.json",
          ),
        ),
      ),
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_REHEARSAL_TEST_SHA256:
      sha256File(
        realpathSync(
          resolve(
            projectRoot,
            "tests/lib/source-registration-logical-clone-rehearsal.test.ts",
          ),
        ),
      ),
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_RUNTIME_ATTESTATION_SHA256:
      attestation.runtimeAttestationSha256,
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_PACKAGE_JSON_SHA256:
      sha256File(realpathSync(resolve(projectRoot, "package.json"))),
    LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_TSX_CONFIG_SHA256: sha256File(
      realpathSync(
        resolve(
          projectRoot,
          "knowledge/runtime/source-registration-tsx.runtime.json",
        ),
      ),
    ),
  });
  return environment;
}

function fixtureCompanionEnvironment(): NodeJS.ProcessEnv {
  const environment = Object.fromEntries(
    LOGICAL_RESTORE_COMPANION_ENVIRONMENT_NAMES.map((name) => [
      name,
      "fixture",
    ]),
  ) as NodeJS.ProcessEnv;
  environment.LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_LAUNCHER_SHA256 =
    sha256File(launcher);
  return environment;
}

function privateCompanionOutputEnvironment(environment: NodeJS.ProcessEnv) {
  const directory = realpathSync(
    mkdtempSync(join(tmpdir(), "locked-companion-output-test-")),
  );
  chmodSync(directory, 0o700);
  return {
    cleanup: () => rmSync(directory, { force: true, recursive: true }),
    environment: {
      ...environment,
      LOGICAL_RESTORE_COMPANION_RECEIPT_PATH: join(
        directory,
        "companion.v1.json",
      ),
      LOGICAL_RESTORE_REHEARSAL_RECEIPT_PATH: join(
        directory,
        "rehearsal.v1.json",
      ),
    } as NodeJS.ProcessEnv,
  };
}

function trustedCompanionLaunch(
  environment: NodeJS.ProcessEnv,
  {
    anchorMode = 0o400,
    differentAnchorDescriptor = false,
    probeOnly = false,
    publicPurpose = "logical_restore_companion",
    secretPurpose = "logical_restore_companion",
  }: {
    anchorMode?: number;
    differentAnchorDescriptor?: boolean;
    probeOnly?: boolean;
    publicPurpose?: string;
    secretPurpose?: string;
  } = {},
) {
  const temporaryRoot = realpathSync("/tmp");
  const anchorDirectory = realpathSync(
    mkdtempSync(
      join(temporaryRoot, "foodsystems-source-registration-trusted-launcher-"),
    ),
  );
  const capabilityDirectory = realpathSync(
    mkdtempSync(join(temporaryRoot, "trusted-companion-capabilities-test-")),
  );
  chmodSync(anchorDirectory, 0o700);
  chmodSync(capabilityDirectory, 0o700);
  const anchorPath = join(anchorDirectory, "launcher.mjs");
  copyFileSync(launcher, anchorPath);
  chmodSync(anchorPath, anchorMode);

  const publicEnvironment = Object.fromEntries(
    LOGICAL_RESTORE_COMPANION_PRELOAD_PIN_ENVIRONMENT_NAMES.map((name) => [
      name,
      environment[name],
    ]),
  );
  const secretEnvironment = Object.fromEntries([
    ["DATABASE_URL", unreachableDatabaseUrl],
    ...LOGICAL_RESTORE_COMPANION_SECRET_ENVIRONMENT_NAMES.map((name) => [
      name,
      environment[name],
    ]),
  ]);
  const writeCapability = (name: string, value: unknown) => {
    const path = join(capabilityDirectory, name);
    writeFileSync(path, `${canonicalRuntimeJson(value)}\n`, {
      flag: "wx",
      mode: 0o400,
    });
    chmodSync(path, 0o400);
    const descriptor = openSync(path, "r");
    unlinkSync(path);
    return descriptor;
  };
  let anchorDescriptorPath = anchorPath;
  if (differentAnchorDescriptor) {
    anchorDescriptorPath = join(capabilityDirectory, "different-launcher.mjs");
    copyFileSync(anchorPath, anchorDescriptorPath);
    chmodSync(anchorDescriptorPath, 0o400);
  }
  const anchorDescriptor = openSync(anchorDescriptorPath, "r");
  if (differentAnchorDescriptor) unlinkSync(anchorDescriptorPath);
  const publicDescriptor = writeCapability("public.json", {
    environment: publicEnvironment,
    format: "foodsystems-source-registration-trusted-public-pins",
    purpose: publicPurpose,
    version: 1,
  });
  const secretDescriptor = writeCapability("secret.json", {
    environment: secretEnvironment,
    format: "foodsystems-source-registration-trusted-secret-input",
    purpose: secretPurpose,
    version: 1,
  });
  try {
    const result = spawnSync(
      process.execPath,
      probeOnly
        ? [trustedEntrypointProbe, anchorPath, projectRoot]
        : [anchorPath, LOGICAL_RESTORE_COMPANION_MODE],
      {
        cwd: projectRoot,
        encoding: "utf8",
        env: {
          ...cleanParentEnvironment(),
          SOURCE_REGISTRATION_TRUSTED_BOOTSTRAP_PID: String(process.pid),
          SOURCE_REGISTRATION_TRUSTED_LAUNCHER_FD: "3",
          SOURCE_REGISTRATION_TRUSTED_PUBLIC_PINS_FD: "4",
          SOURCE_REGISTRATION_TRUSTED_SECRET_INPUT_FD: "5",
        },
        maxBuffer: 2_000_000,
        stdio: [
          "ignore",
          "pipe",
          "pipe",
          anchorDescriptor,
          publicDescriptor,
          secretDescriptor,
        ],
      },
    );
    const secretWasRead = readFileSync(secretDescriptor).length === 0;
    return { result, secretWasRead };
  } finally {
    closeSync(secretDescriptor);
    closeSync(publicDescriptor);
    closeSync(anchorDescriptor);
    rmSync(capabilityDirectory, { force: true, recursive: true });
    rmSync(anchorDirectory, { force: true, recursive: true });
  }
}

function currentRuntimeAttestation(): RuntimeAttestation {
  if (cachedRuntimeAttestation) return cachedRuntimeAttestation;
  const result = spawnSync(process.execPath, [launcher, "--attest-only"], {
    cwd: projectRoot,
    encoding: "utf8",
    env: cleanParentEnvironment(),
    maxBuffer: 2_000_000,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, "");
  cachedRuntimeAttestation = JSON.parse(result.stdout) as RuntimeAttestation;
  return cachedRuntimeAttestation;
}

test("child environment is an explicit allowlist and never inherits runtime injection", () => {
  const source = {
    DATABASE_URL: "postgresql://local/foodsystems",
    HOME: "/private/home",
    NODE_REPL_TRUSTED_CODE_PATHS: "/private/code",
    OPENSSL_CONF: "/private/openssl.cnf",
    PRISMA_QUERY_ENGINE_LIBRARY: "/private/query-engine.dylib",
    RANDOM_UNREVIEWED_VALUE: "must-not-cross",
  };
  const child = controlledChildEnvironment(
    source as unknown as NodeJS.ProcessEnv,
    {
      additions: {
        DATABASE_URL: source.DATABASE_URL,
        LANG: "C",
        LC_ALL: "C",
        PATH: "/controlled/bin:/usr/bin:/bin",
        SOURCE_REGISTRATION_LAUNCH_ATTESTATION_FD: "3",
        SOURCE_REGISTRATION_LAUNCHER_PID: "123",
        TMPDIR: "/tmp",
        TZ: "UTC",
      },
    },
  );
  assert.deepEqual(Object.keys(child).sort(), [
    "DATABASE_URL",
    "LANG",
    "LC_ALL",
    "PATH",
    "SOURCE_REGISTRATION_LAUNCHER_PID",
    "SOURCE_REGISTRATION_LAUNCH_ATTESTATION_FD",
    "TMPDIR",
    "TZ",
  ]);
  const serialized = JSON.stringify(child);
  assert.equal(serialized.includes("NODE_REPL"), false);
  assert.equal(serialized.includes("OPENSSL"), false);
  assert.equal(serialized.includes("PRISMA"), false);
  assert.equal(serialized.includes("RANDOM_UNREVIEWED"), false);
});

test("launcher parent boundary rejects Node, OpenSSL, Prisma and execution flags", () => {
  for (const name of [
    "NODE_REPL_TRUSTED_CODE_PATHS",
    "OPENSSL_CONF",
    "PRISMA_QUERY_ENGINE_LIBRARY",
    "TSX_TSCONFIG_PATH",
  ]) {
    assert.throws(
      () =>
        assertControlledLauncherEnvironment(
          { [name]: "unsafe" } as NodeJS.ProcessEnv,
          [],
        ),
      new RegExp(`forbidden runtime environment is present: ${name}`),
    );
  }
  assert.throws(
    () =>
      assertControlledLauncherEnvironment({} as NodeJS.ProcessEnv, [
        "--inspect",
      ]),
    /without Node execution flags/,
  );
});

test(
  "logical-restore companion has a fixed allowlist and every preload pin is caller-authorized",
  { skip: !supportedRuntime },
  () => {
    const attestation = currentRuntimeAttestation();
    const source: NodeJS.ProcessEnv = {
      ...logicalRestoreCompanionEnvironment(attestation),
      RANDOM_UNREVIEWED_VALUE: "must-not-cross",
    };
    const additions = logicalRestoreCompanionEnvironmentAdditions(source);
    assert.deepEqual(
      Object.keys(additions).sort(),
      [...LOGICAL_RESTORE_COMPANION_ENVIRONMENT_NAMES].sort(),
    );
    assert.equal(Object.hasOwn(additions, "RANDOM_UNREVIEWED_VALUE"), false);
    for (const name of LOGICAL_RESTORE_COMPANION_ENVIRONMENT_NAMES) {
      const incomplete: NodeJS.ProcessEnv = { ...source };
      delete incomplete[name];
      assert.throws(
        () => logicalRestoreCompanionEnvironmentAdditions(incomplete),
        /companion environment is incomplete/,
        `${name} must be present before attestation or preload`,
      );
    }
    const actual = requireLogicalRestoreCompanionExpectedPins({
      attestation,
      environment: additions,
      projectRoot,
    });
    for (const name of Object.keys(actual)) {
      assert.throws(
        () =>
          requireLogicalRestoreCompanionExpectedPins({
            attestation,
            environment: { ...additions, [name]: "0".repeat(64) },
            projectRoot,
          }),
        /expected pin differs before preload/,
        `${name} must gate the preload`,
      );
    }
  },
);

test("companion callback is exact, path-free, and success-only", () => {
  const valid = `${JSON.stringify({
    evidenceClass: "logical-comparison-surrogate",
    receiptSha256: "a".repeat(64),
    status: "pass",
  })}\n`;
  assert.deepEqual(validateLogicalRestoreCompanionCallback(valid), {
    evidenceClass: "logical-comparison-surrogate",
    receiptSha256: "a".repeat(64),
    status: "pass",
  });
  for (const invalid of [
    valid.trimEnd(),
    `${JSON.stringify({ status: "pass", receiptSha256: "a".repeat(64), evidenceClass: "logical-comparison-surrogate" })}\n`,
    `${JSON.stringify({ evidenceClass: "logical-comparison-surrogate", receiptSha256: "not-a-hash", status: "pass" })}\n`,
    `${JSON.stringify({ evidenceClass: "logical-comparison-surrogate", receiptSha256: "a".repeat(64), status: "failed" })}\n`,
    `${JSON.stringify({ evidenceClass: "logical-comparison-surrogate", receiptSha256: "a".repeat(64), status: "pass", path: "/private/output" })}\n`,
  ]) {
    assert.throws(
      () => validateLogicalRestoreCompanionCallback(invalid),
      /invalid controlled result/,
    );
  }
});

test(
  "private launcher copy authenticates before the secret descriptor is read",
  { skip: !supportedRuntime },
  () => {
    const outputs = privateCompanionOutputEnvironment(
      fixtureCompanionEnvironment(),
    );
    try {
      const launched = trustedCompanionLaunch(outputs.environment, {
        probeOnly: true,
      });
      assert.equal(launched.result.status, 0, launched.result.stderr);
      assert.equal(launched.result.stderr, "");
      assert.equal(launched.result.stdout, "TRUSTED_ENTRYPOINT_OK\n");
      assert.equal(launched.secretWasRead, false);
    } finally {
      outputs.cleanup();
    }
  },
);

test(
  "trusted entrypoint rejects wrong inode, mode, and bytes before secret input",
  { skip: !supportedRuntime },
  () => {
    for (const fixture of [
      {
        expected: /trusted launcher descriptor differs/,
        launch: { differentAnchorDescriptor: true },
      },
      {
        expected: /trusted launcher file identity is invalid/,
        launch: { anchorMode: 0o600 },
      },
      {
        expected: /trusted launcher bytes differ from the audited pin/,
        mutateEnvironment(environment: NodeJS.ProcessEnv) {
          environment.LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_LAUNCHER_SHA256 =
            "0".repeat(64);
        },
      },
      {
        expected: /trusted public pins envelope identity differs/,
        launch: { publicPurpose: "wrong_purpose" },
      },
    ]) {
      const environment = fixtureCompanionEnvironment();
      fixture.mutateEnvironment?.(environment);
      const outputs = privateCompanionOutputEnvironment(environment);
      try {
        const launched = trustedCompanionLaunch(outputs.environment, {
          ...fixture.launch,
          probeOnly: true,
        });
        assert.equal(launched.result.status, 1);
        assert.equal(launched.result.stdout, "");
        assert.match(launched.result.stderr, fixture.expected);
        assert.equal(launched.secretWasRead, false);
      } finally {
        outputs.cleanup();
      }
    }
  },
);

test(
  "actual companion mode reports one safe trusted-entrypoint diagnostic before secret input",
  { skip: !supportedRuntime },
  () => {
    for (const launch of [
      { differentAnchorDescriptor: true },
      { publicPurpose: "wrong_purpose" },
    ]) {
      const outputs = privateCompanionOutputEnvironment(
        logicalRestoreCompanionEnvironment(currentRuntimeAttestation()),
      );
      try {
        const launched = trustedCompanionLaunch(outputs.environment, launch);
        assert.equal(launched.result.status, 1);
        assert.equal(launched.result.stdout, "");
        assert.equal(
          launched.result.stderr,
          "[locked-source-registration-launcher] ERROR COMPANION_TRUSTED_ENTRYPOINT_FAILED\n",
        );
        assert.equal(launched.secretWasRead, false);
      } finally {
        outputs.cleanup();
      }
    }
  },
);

test("repository companion execution refuses before accepting private inputs", () => {
  const marker = "must-never-cross-the-trusted-anchor";
  const result = spawnSync(
    process.execPath,
    [launcher, LOGICAL_RESTORE_COMPANION_MODE],
    {
      cwd: projectRoot,
      encoding: "utf8",
      env: {
        ...cleanParentEnvironment(),
        DATABASE_URL: marker,
        LOGICAL_RESTORE_DUMP_PATH: marker,
      },
      maxBuffer: 100_000,
    },
  );
  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.equal(
    result.stderr,
    "[locked-source-registration-launcher] ERROR COMPANION_TRUSTED_ENTRYPOINT_FAILED\n",
  );
  assert.equal(result.stderr.includes(marker), false);
});

test(
  "attestation never executes a caller-PATH psql canary",
  { skip: !supportedRuntime },
  () => {
    const directory = realpathSync(
      mkdtempSync(join(realpathSync("/tmp"), "fake-psql-path-test-")),
    );
    const marker = join(directory, "executed.marker");
    const fakePsql = join(directory, "psql");
    try {
      writeFileSync(
        fakePsql,
        [
          "#!/bin/sh",
          `/usr/bin/touch ${JSON.stringify(marker)}`,
          'printf "%s\\n" "untrusted psql"',
          "",
        ].join("\n"),
        { flag: "wx", mode: 0o700 },
      );
      chmodSync(fakePsql, 0o700);
      const result = spawnSync(process.execPath, [launcher, "--attest-only"], {
        cwd: projectRoot,
        encoding: "utf8",
        env: {
          ...cleanParentEnvironment(),
          PATH: `${directory}:${cleanParentEnvironment().PATH}`,
        },
        maxBuffer: 2_000_000,
      });
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stderr, "");
      assert.equal(existsSync(marker), false);
    } finally {
      rmSync(directory, { force: true, recursive: true });
    }
  },
);

test(
  "wrong companion preload pin stops in the builtins-only launcher",
  { skip: !supportedRuntime },
  () => {
    const attestation = currentRuntimeAttestation();
    const outputs = privateCompanionOutputEnvironment(
      logicalRestoreCompanionEnvironment(attestation),
    );
    outputs.environment.LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_RUNTIME_ATTESTATION_SHA256 =
      "0".repeat(64);
    let result: { status: number | null; stderr: string; stdout: string };
    let secretWasRead = true;
    try {
      const launched = trustedCompanionLaunch(outputs.environment);
      result = launched.result as typeof result;
      secretWasRead = launched.secretWasRead;
    } finally {
      outputs.cleanup();
    }
    assert.equal(result.status, 1, result.stderr);
    assert.equal(result.stdout, "");
    assert.equal(
      result.stderr,
      "[locked-source-registration-launcher] ERROR COMPANION_SNAPSHOT_ATTESTATION_FAILED\n",
    );
    assert.equal(secretWasRead, false);
    assert.doesNotMatch(result.stderr, /logical-restore-companion/);
    assert.doesNotMatch(result.stderr, /launcher-test|127\.0\.0\.1|fixture/);
  },
);

test(
  "trusted secret input is purpose-bound before the database child starts",
  { skip: !supportedRuntime },
  () => {
    const attestation = currentRuntimeAttestation();
    const outputs = privateCompanionOutputEnvironment(
      logicalRestoreCompanionEnvironment(attestation),
    );
    try {
      const launched = trustedCompanionLaunch(outputs.environment, {
        secretPurpose: "wrong_purpose",
      });
      assert.equal(launched.result.status, 1, launched.result.stderr);
      assert.equal(launched.result.stdout, "");
      assert.equal(
        launched.result.stderr,
        "[locked-source-registration-launcher] ERROR COMPANION_SECRET_INPUT_FAILED\n",
      );
      assert.equal(launched.secretWasRead, true);
      assert.equal(
        existsSync(outputs.environment.LOGICAL_RESTORE_COMPANION_RECEIPT_PATH!),
        false,
      );
      assert.equal(
        existsSync(outputs.environment.LOGICAL_RESTORE_REHEARSAL_RECEIPT_PATH!),
        false,
      );
    } finally {
      outputs.cleanup();
    }
  },
);

test(
  "complete companion preload pins reach only the fixed attested child",
  { skip: !supportedRuntime },
  () => {
    const attestation = currentRuntimeAttestation();
    const outputs = privateCompanionOutputEnvironment(
      logicalRestoreCompanionEnvironment(attestation),
    );
    let result: { status: number | null; stderr: string; stdout: string };
    let secretWasRead = false;
    try {
      const launched = trustedCompanionLaunch(outputs.environment);
      result = launched.result as typeof result;
      secretWasRead = launched.secretWasRead;
    } finally {
      outputs.cleanup();
    }
    assert.equal(result.status, 1, result.stderr);
    assert.equal(result.stdout, "");
    assert.equal(
      result.stderr,
      "[locked-source-registration-launcher] ERROR COMPANION_CHILD_ACK_REQUIRED\n",
    );
    assert.equal(secretWasRead, true);
    assert.doesNotMatch(result.stderr, /expected pin differs before preload/);
    assert.doesNotMatch(result.stderr, /ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX/);
    assert.doesNotMatch(result.stderr, /launcher-test|127\.0\.0\.1|fixture/);
  },
);

test(
  "a committed receipt-pair journal refuses without database access and preserves the pair",
  { skip: !supportedRuntime },
  async () => {
    const attestation = currentRuntimeAttestation();
    const outputs = privateCompanionOutputEnvironment(
      logicalRestoreCompanionEnvironment(attestation),
    );
    const companionFinalPath =
      outputs.environment.LOGICAL_RESTORE_COMPANION_RECEIPT_PATH;
    const rehearsalFinalPath =
      outputs.environment.LOGICAL_RESTORE_REHEARSAL_RECEIPT_PATH;
    assert.ok(companionFinalPath);
    assert.ok(rehearsalFinalPath);
    assert.equal(dirname(companionFinalPath), dirname(rehearsalFinalPath));
    const companionStorage = logicalRestoreCompanionStagingStorage(
      companionFinalPath,
      { projectRoot },
    );
    const rehearsalStorage = logicalRestoreCompanionStagingStorage(
      rehearsalFinalPath,
      { projectRoot },
    );
    const rehearsalBytes = Buffer.from(
      `${canonicalRuntimeJson({
        evidenceClass: "logical-clone-rehearsal",
        status: "pass",
      })}\n`,
      "utf8",
    );
    const rehearsalReceiptSha256 = runtimeSha256(rehearsalBytes);
    const companionBytes = Buffer.from(
      `${canonicalRuntimeJson({
        evidenceClass: "logical-comparison-surrogate",
        logicalCloneRehearsal: {
          receiptFileSha256: rehearsalReceiptSha256,
        },
        status: "pass",
      })}\n`,
      "utf8",
    );
    const companionReceiptSha256 = runtimeSha256(companionBytes);
    try {
      writeFileSync(rehearsalStorage.stagingPath, rehearsalBytes, {
        flag: "wx",
        mode: 0o400,
      });
      writeFileSync(companionStorage.stagingPath, companionBytes, {
        flag: "wx",
        mode: 0o400,
      });
      chmodSync(rehearsalStorage.stagingPath, 0o400);
      chmodSync(companionStorage.stagingPath, 0o400);
      await promoteLogicalRestoreCompanionReceiptPair({
        companionStorage,
        expectedCompanionReceiptSha256: companionReceiptSha256,
        journalRuntime: receiptPairJournalRuntime,
        rehearsalStorage,
        signalGuard: { signal: undefined },
      });

      const launched = trustedCompanionLaunch(outputs.environment);
      assert.equal(launched.result.status, 1, launched.result.stderr);
      assert.equal(launched.result.stdout, "");
      assert.equal(
        launched.result.stderr,
        "[locked-source-registration-launcher] ERROR COMPANION_RECEIPTS_ALREADY_COMMITTED\n",
      );
      assert.equal(launched.secretWasRead, true);
      assert.equal(existsSync(companionFinalPath), true);
      assert.equal(existsSync(rehearsalFinalPath), true);
      const recovered = recoverLogicalRestoreReceiptPairJournal({
        companionFinalPath,
        rehearsalFinalPath,
      });
      assert.equal(recovered.status, "committed");
      assert.equal(recovered.companionReceiptSha256, companionReceiptSha256);
      assert.equal(recovered.rehearsalReceiptSha256, rehearsalReceiptSha256);
      assert.match(recovered.journalSha256, /^[a-f0-9]{64}$/);
    } finally {
      outputs.cleanup();
    }
  },
);

test("controlled runner import does not load the project dotenv sidecar", () => {
  const result = spawnSync(
    process.execPath,
    [
      "--import=tsx",
      runner,
      "--plan-only",
      "--primary-corpus-root=/tmp",
      "--replica-corpus-root=/tmp",
    ],
    {
      cwd: projectRoot,
      encoding: "utf8",
      env: cleanParentEnvironment(),
    },
  );
  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /DATABASE_URL is required/);
  assert.doesNotMatch(result.stderr, /private corpus root/);
});

test(
  "attest-only executes both strong runtime verifiers before project imports",
  { skip: !supportedRuntime },
  () => {
    const attestation = currentRuntimeAttestation();
    assert.equal(
      attestation.node.runtimeClosureSha256,
      SOURCE_REGISTRATION_LOCKED_NODE_RUNTIME_CLOSURE_SHA256,
    );
    assert.equal(
      attestation.postgresqlToolset.closureSha256,
      SOURCE_REGISTRATION_LOCKED_PSQL_RUNTIME_CLOSURE_SHA256,
    );
    assert.deepEqual(attestation.localClosure.roots, [
      "package.json",
      "knowledge/runtime/source-registration-tsx.runtime.json",
      "scripts/knowledge/apply-source-registration-plan.ts",
      "scripts/knowledge/run-source-registration-logical-clone-rehearsal.ts",
      LOGICAL_RESTORE_COMPANION_RUNNER,
      "scripts/knowledge/logical-restore-receipt-pair-journal.mjs",
      "scripts/knowledge/launch-locked-source-registration-apply.mjs",
      "scripts/knowledge/database-logical-state-digest.mjs",
      "scripts/knowledge/verify-psql-runtime-closure.mjs",
      "scripts/knowledge/verify-node-runtime-closure.mjs",
      "scripts/knowledge/generate-source-registration-plan.ts",
    ]);
    assert.equal(JSON.stringify(attestation).includes("/opt/"), false);
    assert.equal(JSON.stringify(attestation).includes("/Users/"), false);
  },
);

test("direct apply and standalone rehearsal are quarantined before private input use", () => {
  const marker = "must-never-cross-untrusted-privileged-launcher";
  for (const fixture of [
    {
      arguments_: ["--apply", `--primary-corpus-root=/${marker}`],
      diagnostic: "APPLY_TRUSTED_ENTRYPOINT_REQUIRED",
    },
    {
      arguments_: ["--rehearse-logical-clone"],
      diagnostic: "REHEARSAL_TRUSTED_ENTRYPOINT_REQUIRED",
    },
  ]) {
    const result = spawnSync(
      process.execPath,
      [launcher, ...fixture.arguments_],
      {
        cwd: projectRoot,
        encoding: "utf8",
        env: {
          ...cleanParentEnvironment(),
          DATABASE_URL: marker,
          SOURCE_REGISTRATION_REHEARSAL_LOGICAL_COMPARISON_PROOF_BASE64: marker,
          SOURCE_REGISTRATION_REHEARSAL_OUTPUT_FILE: marker,
          SOURCE_REGISTRATION_REHEARSAL_PRIMARY_CORPUS_ROOT: marker,
          SOURCE_REGISTRATION_REHEARSAL_REPLICA_CORPUS_ROOT: marker,
        },
        maxBuffer: 100_000,
      },
    );
    assert.equal(result.status, 1);
    assert.equal(result.stdout, "");
    assert.equal(
      result.stderr,
      `[locked-source-registration-launcher] ERROR ${fixture.diagnostic}\n`,
    );
    assert.equal(result.stderr.includes(marker), false);
  }
});
