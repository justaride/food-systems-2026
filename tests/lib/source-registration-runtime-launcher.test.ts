import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import test from "node:test";

import {
  SOURCE_REGISTRATION_LOCKED_NODE_RUNTIME_CLOSURE_SHA256,
  SOURCE_REGISTRATION_LOCKED_PSQL_RUNTIME_CLOSURE_SHA256,
  assertControlledLauncherEnvironment,
  controlledChildEnvironment,
} from "../../scripts/knowledge/launch-locked-source-registration-apply.mjs";

const projectRoot = process.cwd();
const launcher = resolve(
  projectRoot,
  "scripts/knowledge/launch-locked-source-registration-apply.mjs",
);
const runner = resolve(
  projectRoot,
  "scripts/knowledge/apply-source-registration-plan.ts",
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
    version: string;
  };
  nodeModules: { treeSha256: string };
  prismaGeneratedClient: { treeSha256: string };
  psql: {
    binaryFileSha256: string;
    runtimeClosureSha256: string;
    version: string;
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

function runtimePinArguments(attestation: RuntimeAttestation): string[] {
  return [
    `--launcher-file-sha256=${attestation.launcher.fileSha256}`,
    `--node-binary-file-sha256=${attestation.node.binaryFileSha256}`,
    `--node-runtime-closure-sha256=${attestation.node.runtimeClosureSha256}`,
    `--node-version=${attestation.node.version}`,
    `--node-platform=${attestation.node.platform}`,
    `--node-arch=${attestation.node.arch}`,
    `--node-modules-tree-sha256=${attestation.nodeModules.treeSha256}`,
    `--prisma-generated-client-tree-sha256=${attestation.prismaGeneratedClient.treeSha256}`,
    `--runtime-local-closure-sha256=${attestation.localClosure.closureSha256}`,
    `--psql-binary-file-sha256=${attestation.psql.binaryFileSha256}`,
    `--psql-runtime-closure-sha256=${attestation.psql.runtimeClosureSha256}`,
    `--psql-version=${attestation.psql.version}`,
    `--runtime-attestation-sha256=${attestation.runtimeAttestationSha256}`,
  ];
}

function launchApply(arguments_: string[]) {
  return spawnSync(process.execPath, [launcher, "--apply", ...arguments_], {
    cwd: projectRoot,
    encoding: "utf8",
    env: {
      ...cleanParentEnvironment(),
      DATABASE_URL: unreachableDatabaseUrl,
    },
    maxBuffer: 2_000_000,
  });
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
      attestation.psql.runtimeClosureSha256,
      SOURCE_REGISTRATION_LOCKED_PSQL_RUNTIME_CLOSURE_SHA256,
    );
    assert.deepEqual(attestation.localClosure.roots, [
      "scripts/knowledge/apply-source-registration-plan.ts",
      "scripts/knowledge/run-source-registration-logical-clone-rehearsal.ts",
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

test(
  "launcher rejects missing or wrong current runtime pins before starting the apply runner",
  { skip: !supportedRuntime },
  () => {
    const currentPins = runtimePinArguments(currentRuntimeAttestation());
    const runtimeAttestationPrefix = "--runtime-attestation-sha256=";
    const commonArguments = [
      "--primary-corpus-root=/tmp",
      "--replica-corpus-root=/tmp",
    ];

    const missing = launchApply([
      ...commonArguments,
      ...currentPins.filter(
        (argument) => !argument.startsWith(runtimeAttestationPrefix),
      ),
    ]);
    assert.equal(missing.status, 1, missing.stderr);
    assert.equal(missing.stdout, "");
    assert.match(
      missing.stderr,
      /locked execution requires exactly one --runtime-attestation-sha256/,
    );
    assert.doesNotMatch(
      missing.stderr,
      /Locked source-registration apply refused/,
    );

    const wrong = launchApply([
      ...commonArguments,
      ...currentPins.map((argument) =>
        argument.startsWith(runtimeAttestationPrefix)
          ? `${runtimeAttestationPrefix}${"0".repeat(64)}`
          : argument,
      ),
    ]);
    assert.equal(wrong.status, 1, wrong.stderr);
    assert.equal(wrong.stdout, "");
    assert.match(
      wrong.stderr,
      /--runtime-attestation-sha256 differs from the pre-import attestation/,
    );
    assert.doesNotMatch(
      wrong.stderr,
      /Locked source-registration apply refused/,
    );
  },
);

test(
  "complete current runtime pins reach the runner and stop at a missing non-runtime apply gate",
  { skip: !supportedRuntime },
  () => {
    const result = launchApply([
      "--primary-corpus-root=/tmp",
      "--replica-corpus-root=/tmp",
      ...runtimePinArguments(currentRuntimeAttestation()),
    ]);
    assert.equal(result.status, 1, result.stderr);
    assert.equal(result.stdout, "");
    assert.match(
      result.stderr,
      /Locked source-registration apply refused: --apply requires --ack=/,
    );
    assert.doesNotMatch(
      result.stderr,
      /pre-import attestation|requires exactly one --.*sha256/,
    );
    assert.doesNotMatch(
      result.stderr,
      /ECONNREFUSED|P1001|Can't reach database server|connection refused/i,
    );
  },
);
