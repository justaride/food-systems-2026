import assert from "node:assert/strict";
import {
  chmodSync,
  closeSync,
  fchmodSync,
  linkSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import {
  TRUSTED_SOURCE_REGISTRATION_ENVIRONMENT_NAMES as ENV,
  TRUSTED_SOURCE_REGISTRATION_PUBLIC_FORMAT,
  TRUSTED_SOURCE_REGISTRATION_PURPOSE,
  TRUSTED_SOURCE_REGISTRATION_SCHEMA_VERSION,
  TRUSTED_SOURCE_REGISTRATION_SECRET_FORMAT,
  assertCleanBootstrapEnvironment,
  canonicalJson,
  computeTrustedRuntimeAttestation,
  reattestAfterTrustedChild,
  readCanonicalUnlinkedDescriptor,
  releaseTrustedChildOutput,
  requireTrustedSourceRegistrationEntrypoint,
  runTrustedSourceRegistrationProbe,
  sealRuntimeAttestation,
  sha256,
  trustedChildContinuity,
  verifyRuntimeAttestationSelfHash,
  verifyTrustedLauncherDescriptor,
} from "../../scripts/knowledge/run-trusted-source-registration-apply.mjs";

const requireTrustedForTest = requireTrustedSourceRegistrationEntrypoint as unknown as (
  options: Record<string, unknown>,
) => any;
const runTrustedProbeForTest = runTrustedSourceRegistrationProbe as unknown as (
  options: Record<string, unknown>,
) => any;

const MODULE_BYTES = `// trusted source-registration launcher test copy\n`;

function asProcessEnv(value: Record<string, string>): NodeJS.ProcessEnv {
  return value as unknown as NodeJS.ProcessEnv;
}

function fixture() {
  const root = mkdtempSync("/tmp/foodsystems-source-registration-trusted-launcher-");
  chmodSync(root, 0o700);
  const launcherPath = join(root, "launcher.mjs");
  writeFileSync(launcherPath, MODULE_BYTES, { mode: 0o400 });
  chmodSync(launcherPath, 0o400);
  const launcherFd = openSync(launcherPath, "r");
  const publicPath = join(root, "public.json");
  const secretPath = join(root, "secret.json");
  const hash = sha256("in-memory test pin");
  const attestation = sealRuntimeAttestation({
    extensionClosureSha256: hash,
    localClosureSha256: hash,
    nodeBinarySha256: hash,
    nodeModulesTreeSha256: hash,
    nodeRuntimeClosureSha256: hash,
    nodeRuntimeManifestSha256: hash,
    nodeVersion: "v26.0.0",
    postgresqlToolsetClosureSha256: hash,
    postgresqlToolsetManifestSha256: hash,
    prismaClientTreeSha256: hash,
    launcherSha256: sha256(MODULE_BYTES),
  });
  const { launcherSha256: _launcherSha256, ...runtime } = attestation;
  const publicPins = {
    approval: {
      authorizationSha256: hash,
      operationKeySha256: hash,
    },
    database: { role: "foodsystems", targetSha256: hash },
    ddl: { catalogSha256: hash },
    format: TRUSTED_SOURCE_REGISTRATION_PUBLIC_FORMAT,
    launcherSha256: attestation.launcherSha256,
    purpose: TRUSTED_SOURCE_REGISTRATION_PURPOSE,
    runtime,
    version: TRUSTED_SOURCE_REGISTRATION_SCHEMA_VERSION,
  };
  const secretInput = {
    format: TRUSTED_SOURCE_REGISTRATION_SECRET_FORMAT,
    inputs: {
      DATABASE_URL: "in-memory-only",
      FOOD_SYSTEMS_PRIVATE_CORPUS_REPLICA_ROOT: "in-memory-only",
      FOOD_SYSTEMS_PRIVATE_CORPUS_ROOT: "in-memory-only",
    },
    purpose: TRUSTED_SOURCE_REGISTRATION_PURPOSE,
    version: TRUSTED_SOURCE_REGISTRATION_SCHEMA_VERSION,
  };
  const writeUnlinked = (path: string, value: unknown) => {
    writeFileSync(path, `${canonicalJson(value)}\n`, { mode: 0o400 });
    chmodSync(path, 0o400);
    const fd = openSync(path, "r");
    unlinkSync(path);
    return fd;
  };
  const publicFd = writeUnlinked(publicPath, publicPins);
  const secretFd = writeUnlinked(secretPath, secretInput);
  const environment = {
    [ENV.bootstrapPid]: String(process.ppid),
    [ENV.expectedPurpose]: TRUSTED_SOURCE_REGISTRATION_PURPOSE,
    [ENV.launcherFd]: "3",
    [ENV.publicPinsFd]: "4",
    [ENV.secretInputFd]: "5",
  };
  return {
    attestation,
    environment,
    launcherFd,
    launcherPath,
    publicFd,
    publicPins,
    root,
    runtime,
    secretFd,
  };
}

function closeFixture(value: ReturnType<typeof fixture>) {
  for (const fd of [value.launcherFd, value.publicFd, value.secretFd]) {
    try {
      closeSync(fd);
    } catch {
      // The assertion that consumed a descriptor may already have closed it.
    }
  }
}

test("accepts a purpose-bound FD3/FD4/FD5 envelope", () => {
  const value = fixture();
  try {
    const result = requireTrustedForTest({
      descriptor: value.launcherFd,
      environment: asProcessEnv(value.environment),
      execArgv: [],
      launcherPath: value.launcherPath,
      publicDescriptor: value.publicFd,
      runtimeAttestation: value.attestation,
      secretDescriptor: value.secretFd,
    });
    assert.equal(result.publicPins.purpose, TRUSTED_SOURCE_REGISTRATION_PURPOSE);
    assert.equal(result.secretInput.DATABASE_URL, "in-memory-only");
  } finally {
    closeFixture(value);
  }
});

test("rejects missing, misidentified, wrong-mode and multiply-linked launchers", () => {
  const missing = fixture();
  try {
    assert.throws(() =>
      verifyTrustedLauncherDescriptor({
        descriptor: openSync("/dev/null", "r"),
        launcherPath: missing.launcherPath,
      }),
    );
  } finally {
    closeFixture(missing);
  }

  const wrongIdentity = fixture();
  try {
    const other = join(wrongIdentity.root, "other.mjs");
    writeFileSync(other, "other\n", { mode: 0o400 });
    const fd = openSync(other, "r");
    assert.throws(() =>
      verifyTrustedLauncherDescriptor({
        descriptor: fd,
        launcherPath: wrongIdentity.launcherPath,
      }),
    );
    closeSync(fd);
  } finally {
    closeFixture(wrongIdentity);
  }

  const wrongMode = fixture();
  try {
    chmodSync(wrongMode.launcherPath, 0o600);
    assert.throws(() =>
      verifyTrustedLauncherDescriptor({
        descriptor: wrongMode.launcherFd,
        launcherPath: wrongMode.launcherPath,
      }),
    );
  } finally {
    closeFixture(wrongMode);
  }

  const wrongLinks = fixture();
  try {
    const hardLink = join(wrongLinks.root, "hard-link.mjs");
    linkSync(wrongLinks.launcherPath, hardLink);
    assert.throws(() =>
      verifyTrustedLauncherDescriptor({
        descriptor: wrongLinks.launcherFd,
        launcherPath: hardLink,
      }),
    );
  } finally {
    closeFixture(wrongLinks);
  }
});

test("rejects descriptor drift before accepting canonical JSON", () => {
  const value = fixture();
  try {
    assert.throws(() =>
      readCanonicalUnlinkedDescriptor(value.publicFd, "public pins", {
        onRead: () => fchmodSync(value.publicFd, 0o600),
      }),
    );
  } finally {
    closeFixture(value);
  }
});

test("rejects wrong parent PID, purpose and inner runtime self-hash", () => {
  const value = fixture();
  try {
    assert.throws(() =>
      requireTrustedForTest({
        descriptor: value.launcherFd,
        environment: asProcessEnv({ ...value.environment, [ENV.bootstrapPid]: "1" }),
        execArgv: [],
        launcherPath: value.launcherPath,
        publicDescriptor: value.publicFd,
        runtimeAttestation: value.attestation,
        secretDescriptor: value.secretFd,
      }),
    );
  } finally {
    closeFixture(value);
  }

  const purpose = fixture();
  try {
    assert.throws(() =>
      requireTrustedForTest({
        descriptor: purpose.launcherFd,
        environment: asProcessEnv({ ...purpose.environment, [ENV.expectedPurpose]: "other" }),
        execArgv: [],
        launcherPath: purpose.launcherPath,
        publicDescriptor: purpose.publicFd,
        runtimeAttestation: purpose.attestation,
        secretDescriptor: purpose.secretFd,
      }),
    );
  } finally {
    closeFixture(purpose);
  }

  const tampered = fixture();
  try {
    const runtime = { ...tampered.attestation, nodeVersion: "tampered" };
    assert.throws(() =>
      requireTrustedForTest({
        descriptor: tampered.launcherFd,
        environment: asProcessEnv(tampered.environment),
        execArgv: [],
        launcherPath: tampered.launcherPath,
        publicDescriptor: tampered.publicFd,
        runtimeAttestation: runtime,
        secretDescriptor: tampered.secretFd,
      }),
    );
    assert.throws(() => verifyRuntimeAttestationSelfHash(runtime));
  } finally {
    closeFixture(tampered);
  }
});

test("rejects every forbidden inherited prefix and every Node execution flag", () => {
  for (const prefix of ["NODE_", "OPENSSL_", "PRISMA_", "TSX_", "DOTENV_CONFIG_", "DYLD_", "LD_"]) {
    assert.throws(() =>
      assertCleanBootstrapEnvironment(asProcessEnv({ [`${prefix}TEST`]: "1" }), []),
    );
  }
  assert.throws(() => assertCleanBootstrapEnvironment(asProcessEnv({}), ["--require=bad"]));
});

test("does not read FD5 when an earlier public/runtime check fails", () => {
  const value = fixture();
  let secretRead = 0;
  try {
    assert.throws(() =>
      requireTrustedForTest({
        descriptor: value.launcherFd,
        environment: asProcessEnv(value.environment),
        execArgv: [],
        launcherPath: value.launcherPath,
        publicDescriptor: value.publicFd,
        runtimeAttestation: { ...value.attestation, nodeVersion: "tampered" },
        secretDescriptor: value.secretFd,
        onSecretRead: () => {
          secretRead += 1;
        },
      }),
    );
    assert.equal(secretRead, 0);
  } finally {
    closeFixture(value);
  }
});

test("direct child execution is refused and post-child drift fails closed", () => {
  assert.throws(() => trustedChildContinuity({ environment: asProcessEnv({}), execArgv: [] }));
  const before = { runtime: "sealed" };
  assert.equal(
    reattestAfterTrustedChild({ before, after: { runtime: "sealed" }, status: 0 }),
    true,
  );
  assert.equal(
    releaseTrustedChildOutput({
      after: { runtime: "sealed" },
      before,
      status: 0,
      stdout: "held until reattestation",
    }),
    "held until reattestation",
  );
  assert.throws(() =>
    reattestAfterTrustedChild({ before, after: { runtime: "drifted" }, status: 0 }),
  );
  assert.throws(() =>
    reattestAfterTrustedChild({ before, after: before, status: 1 }),
  );
});

test("runs the database-free trusted probe child and reattests after child failure", () => {
  const root = mkdtempSync("/tmp/foodsystems-source-registration-trusted-launcher-");
  chmodSync(root, 0o700);
  const projectRoot = process.cwd();
  const launcherPath = join(root, "launcher.mjs");
  const launcherBytes = readFileSync(
    join(projectRoot, "scripts/knowledge/run-trusted-source-registration-apply.mjs"),
  );
  writeFileSync(launcherPath, launcherBytes, { mode: 0o400 });
  chmodSync(launcherPath, 0o400);
  const launcherFd = openSync(launcherPath, "r");
  const attestation = computeTrustedRuntimeAttestation({
    launcherPath,
    projectRoot,
  });
  const hash = sha256("in-memory probe pin");
  const { launcherSha256: _launcherSha256, ...runtime } = attestation;
  const publicPins = {
    approval: { authorizationSha256: hash, operationKeySha256: hash },
    database: { role: "foodsystems", targetSha256: hash },
    ddl: { catalogSha256: hash },
    format: TRUSTED_SOURCE_REGISTRATION_PUBLIC_FORMAT,
    launcherSha256: attestation.launcherSha256,
    purpose: TRUSTED_SOURCE_REGISTRATION_PURPOSE,
    runtime,
    version: TRUSTED_SOURCE_REGISTRATION_SCHEMA_VERSION,
  };
  const secretInput = {
    format: TRUSTED_SOURCE_REGISTRATION_SECRET_FORMAT,
    inputs: {
      DATABASE_URL: "in-memory-only",
      FOOD_SYSTEMS_PRIVATE_CORPUS_REPLICA_ROOT: "in-memory-only",
      FOOD_SYSTEMS_PRIVATE_CORPUS_ROOT: "in-memory-only",
    },
    purpose: TRUSTED_SOURCE_REGISTRATION_PURPOSE,
    version: TRUSTED_SOURCE_REGISTRATION_SCHEMA_VERSION,
  };
  const writeUnlinked = (name: string, value: unknown) => {
    const path = join(root, name);
    writeFileSync(path, `${canonicalJson(value)}\n`, { mode: 0o400 });
    chmodSync(path, 0o400);
    const fd = openSync(path, "r");
    unlinkSync(path);
    return fd;
  };
  const publicFd = writeUnlinked("public.json", publicPins);
  const secretFd = writeUnlinked("secret.json", secretInput);
  const environment = asProcessEnv({
    [ENV.bootstrapPid]: String(process.ppid),
    [ENV.expectedPurpose]: TRUSTED_SOURCE_REGISTRATION_PURPOSE,
    [ENV.launcherFd]: "3",
    [ENV.publicPinsFd]: "4",
    [ENV.secretInputFd]: "5",
  });
  try {
    const result = runTrustedProbeForTest({
      descriptor: launcherFd,
      environment,
      execArgv: [],
      launcherPath,
      projectRoot,
      publicDescriptor: publicFd,
      runtimeAttestation: attestation,
      secretDescriptor: secretFd,
    });
    assert.equal(result.status, 0);
    assert.equal(result.stderr, "");
    assert.equal(JSON.parse(result.stdout).status, "pass");
    assert.throws(() =>
      runTrustedProbeForTest({
        descriptor: launcherFd,
        environment,
        execArgv: [],
        launcherPath,
        projectRoot,
        publicDescriptor: publicFd,
        runtimeAttestation: attestation,
        secretDescriptor: secretFd,
        childMode: "--trusted-child-probe-fail",
      }),
    );
  } finally {
    closeSync(launcherFd);
    closeSync(publicFd);
    closeSync(secretFd);
  }
});
