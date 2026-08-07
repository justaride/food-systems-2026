import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";

import {
  SOURCE_REGISTRATION_TSX_CONFIG,
  canonicalRuntimeJson,
  computeSourceRegistrationRuntimeAttestation,
  createSourceRegistrationExecutionSnapshot,
  removeSourceRegistrationExecutionSnapshot,
} from "../../scripts/knowledge/launch-locked-source-registration-apply.mjs";

const EXPECTED_MINIMAL_TSX_CONFIG = {
  compilerOptions: {
    esModuleInterop: true,
    isolatedModules: true,
    module: "ESNext",
    moduleResolution: "Bundler",
    resolveJsonModule: true,
    target: "ES2022",
  },
};

function fail(code) {
  throw new Error(code);
}

function fixedFailureCode(error) {
  return error instanceof Error && /^[A-Z0-9_]+$/.test(error.message)
    ? error.message
    : "UNEXPECTED_FAILURE";
}

function canaryEnvironment(markerPath, tsconfigPath) {
  return {
    LANG: "C",
    LC_ALL: "C",
    PATH: process.env.PATH ?? "/usr/bin:/bin:/usr/sbin:/sbin",
    SNAPSHOT_LOADER_CANARY_MARKER: markerPath,
    TMPDIR: "/tmp",
    TZ: "UTC",
    ...(tsconfigPath === undefined ? {} : { TSX_TSCONFIG_PATH: tsconfigPath }),
  };
}

function runCanary({ entryPath, markerPath, projectRoot, tsconfigPath }) {
  return spawnSync(process.execPath, ["--import=tsx", entryPath], {
    cwd: projectRoot,
    encoding: "utf8",
    env: canaryEnvironment(markerPath, tsconfigPath),
    maxBuffer: 100_000,
    timeout: 30_000,
  });
}

function main() {
  const projectRoot = realpathSync(process.cwd());
  const before = computeSourceRegistrationRuntimeAttestation({ projectRoot });
  const snapshot = createSourceRegistrationExecutionSnapshot({ projectRoot });
  try {
    const after = computeSourceRegistrationRuntimeAttestation({
      projectRoot: snapshot.projectRoot,
    });
    if (canonicalRuntimeJson(before) !== canonicalRuntimeJson(after)) {
      fail("SNAPSHOT_ATTESTATION_MISMATCH");
    }

    const sourceConfigPath = realpathSync(
      resolve(projectRoot, SOURCE_REGISTRATION_TSX_CONFIG),
    );
    const snapshotConfigPath = realpathSync(
      resolve(snapshot.projectRoot, SOURCE_REGISTRATION_TSX_CONFIG),
    );
    if (
      !readFileSync(sourceConfigPath).equals(readFileSync(snapshotConfigPath))
    ) {
      fail("SNAPSHOT_CONFIG_BYTES_MISMATCH");
    }
    const snapshotConfig = JSON.parse(readFileSync(snapshotConfigPath, "utf8"));
    if (
      canonicalRuntimeJson(snapshotConfig) !==
      canonicalRuntimeJson(EXPECTED_MINIMAL_TSX_CONFIG)
    ) {
      fail("SNAPSHOT_CONFIG_NOT_MINIMAL");
    }
    if (
      !before.localClosure.roots.includes(SOURCE_REGISTRATION_TSX_CONFIG) ||
      !after.localClosure.roots.includes(SOURCE_REGISTRATION_TSX_CONFIG)
    ) {
      fail("SNAPSHOT_CONFIG_NOT_ATTESTED");
    }

    const rootTsconfigPath = join(snapshot.projectRoot, "tsconfig.json");
    if (existsSync(rootTsconfigPath)) {
      fail("ROOT_TSCONFIG_PRESENT_BEFORE_CANARY");
    }
    const canaryDirectory = join(
      snapshot.projectRoot,
      "snapshot-loader-canary",
    );
    const canaryModulePath = join(canaryDirectory, "repo-root-canary.ts");
    const entryPath = join(canaryDirectory, "entry.ts");
    const markerPath = join(canaryDirectory, "canary-loaded.marker");
    mkdirSync(canaryDirectory, { mode: 0o700 });
    writeFileSync(
      rootTsconfigPath,
      `${JSON.stringify({
        compilerOptions: {
          baseUrl: ".",
          paths: {
            "@snapshot-loader-canary": [
              "./snapshot-loader-canary/repo-root-canary.ts",
            ],
          },
        },
      })}\n`,
      { flag: "wx", mode: 0o600 },
    );
    writeFileSync(
      canaryModulePath,
      [
        'import { writeFileSync } from "node:fs";',
        "const marker = process.env.SNAPSHOT_LOADER_CANARY_MARKER;",
        'if (!marker) throw new Error("missing marker");',
        'writeFileSync(marker, "loaded\\n", { flag: "wx", mode: 0o600 });',
        "",
      ].join("\n"),
      { flag: "wx", mode: 0o600 },
    );
    writeFileSync(
      entryPath,
      [
        'import "@snapshot-loader-canary";',
        'process.stdout.write("ENTRY_OK\\n");',
        "",
      ].join("\n"),
      { flag: "wx", mode: 0o600 },
    );

    const control = runCanary({
      entryPath,
      markerPath,
      projectRoot: snapshot.projectRoot,
    });
    if (
      control.error ||
      control.signal ||
      control.status !== 0 ||
      control.stderr !== "" ||
      control.stdout !== "ENTRY_OK\n" ||
      !existsSync(markerPath)
    ) {
      fail("CANARY_CONTROL_DID_NOT_EXECUTE");
    }
    rmSync(markerPath);

    const locked = runCanary({
      entryPath,
      markerPath,
      projectRoot: snapshot.projectRoot,
      tsconfigPath: snapshotConfigPath,
    });
    if (
      locked.error ||
      locked.signal ||
      locked.status !== 1 ||
      locked.stdout !== "" ||
      !locked.stderr.includes("@snapshot-loader-canary") ||
      existsSync(markerPath)
    ) {
      fail("LOCKED_CONFIG_DID_NOT_BLOCK_CANARY");
    }

    process.stdout.write(
      `${JSON.stringify({
        attestationEqual: true,
        canaryControlExecuted: true,
        lockedConfigBlockedCanary: true,
        minimalConfigAttested: true,
        minimalConfigCopiedExactly: true,
      })}\n`,
    );
  } finally {
    removeSourceRegistrationExecutionSnapshot(snapshot.snapshotRoot);
  }
}

try {
  main();
} catch (error) {
  process.stderr.write(`${fixedFailureCode(error)}\n`);
  process.exitCode = 1;
}
