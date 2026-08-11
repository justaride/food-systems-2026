import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  closeSync,
  constants,
  mkdtempSync,
  openSync,
  realpathSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

import {
  LOGICAL_RESTORE_EXTENSION_INITIALIZER_ATTESTATION_DOMAIN,
  LOGICAL_RESTORE_EXTENSION_INITIALIZER_ATTESTATION_FORMAT,
  LOGICAL_RESTORE_EXTENSION_INITIALIZER_FIXED_PLAN,
  LOGICAL_RESTORE_EXTENSION_INITIALIZER_FIXED_PLAN_SHA256,
  LOGICAL_RESTORE_EXTENSION_INITIALIZER_PURPOSE,
  LOGICAL_RESTORE_EXTENSION_INITIALIZER_REQUEST_FORMAT,
  buildExtensionInitializerSqlPlan,
  canonicalExtensionInitializerJson,
  extensionInitializerCleanEnvironment,
  extensionInitializerCfUserTextEncoding,
  extensionInitializerPsqlEnvironment,
  extensionInitializerSha256,
  loadExtensionInitializerRuntimeFacts,
  runExtensionInitializerProtocol,
  sealExtensionInitializerRequest,
  validateExtensionInitializerAttestation,
  validateExtensionInitializerRequest,
} from "../../scripts/knowledge/run-logical-restore-extension-initializer.mjs";

const repoRoot = resolve(import.meta.dirname, "../..");
const initializerPath = join(
  repoRoot,
  "scripts/knowledge/run-logical-restore-extension-initializer.mjs",
);
const HASH_A = "a".repeat(64);
const HASH_B = "b".repeat(64);
const issuedAtUtc = "2026-08-03T08:00:00.000Z";
const cloneName =
  "foodsystems_restore_logical_20260803_0123456789abcdef01234567";
const supportedRuntime =
  process.platform === "darwin" && process.arch === "arm64";

function requestFixture(parentPid = 4242) {
  return sealExtensionInitializerRequest({
    clone: {
      databaseName: cloneName,
      databaseOid: 123456,
      databaseOwner: "foodsystems",
      ownershipComment: `foodsystems-logical-restore-companion-owner-v1:${"1".repeat(64)}`,
    },
    cluster: {
      serverVersionNum: "160013",
      systemIdentifier: "7620055716543368057",
    },
    format: LOGICAL_RESTORE_EXTENSION_INITIALIZER_REQUEST_FORMAT,
    issuedAtUtc,
    nonce: "2".repeat(64),
    parentPid,
    purpose: LOGICAL_RESTORE_EXTENSION_INITIALIZER_PURPOSE,
    version: 1,
  });
}

function runtimeFacts() {
  return {
    brokerSha256: HASH_A,
    extensionClosureSha256: HASH_B,
    extensionManifestSha256: HASH_A,
    psqlClosureSha256: HASH_B,
    psqlManifestSha256: HASH_A,
    psqlSha256: HASH_B,
  };
}

function maintenancePreflight() {
  return {
    activeSessions: 0,
    allowConnections: true,
    connectionLimit: 0,
    currentUser: "gabrielfreeman",
    currentUserSuper: true,
    databaseComment: `foodsystems-logical-restore-companion-owner-v1:${"1".repeat(64)}`,
    databaseExists: true,
    databaseOid: "123456",
    databaseOwner: "foodsystems",
    databaseOwnerCreateDb: true,
    databaseOwnerSuper: false,
    encoding: "UTF8",
    inRecovery: false,
    isTemplate: false,
    serverVersionNum: "160013",
    sessionUser: "gabrielfreeman",
    systemIdentifier: "7620055716543368057",
  };
}

function extensionState(connectionLimit: number) {
  return {
    activeSessions: 1,
    connectionLimit,
    databaseName: cloneName,
    databaseOid: "123456",
    extensions: [
      {
        comment:
          "text similarity measurement and index searching based on trigrams",
        memberCount: 1,
        members: [
          {
            objectArgs: ["text"],
            objectNames: ["public", "show_trgm"],
            type: "function",
          },
        ],
        name: "pg_trgm",
        owner: "gabrielfreeman",
        relocatable: true,
        schema: "public",
        version: "1.6",
      },
      {
        comment: "vector data type and ivfflat and hnsw access methods",
        memberCount: 1,
        members: [
          {
            objectArgs: [],
            objectNames: ["public", "vector"],
            type: "type",
          },
        ],
        name: "vector",
        owner: "gabrielfreeman",
        relocatable: true,
        schema: "public",
        version: "0.8.2",
      },
    ],
    serverVersionNum: "160013",
    systemIdentifier: "7620055716543368057",
    vectorSmoke: "1",
  };
}

function unlockState() {
  return {
    activeSessions: 0,
    connectionLimit: 1,
    databaseComment: `foodsystems-logical-restore-companion-owner-v1:${"1".repeat(64)}`,
    databaseOid: "123456",
    databaseOwner: "foodsystems",
  };
}

function line(value: unknown) {
  return `${JSON.stringify(value)}\n`;
}

function expectCode(code: string) {
  return (error: unknown) =>
    error instanceof Error &&
    "code" in error &&
    (error as Error & { code: string }).code === code;
}

function resealAttestation<T extends Record<string, unknown>>(value: T) {
  const { attestationSha256: _ignored, ...body } = value;
  return {
    ...body,
    attestationSha256: extensionInitializerSha256(
      `${LOGICAL_RESTORE_EXTENSION_INITIALIZER_ATTESTATION_DOMAIN}${canonicalExtensionInitializerJson(
        body,
      )}`,
    ),
  };
}

async function validAttestationFixture() {
  const outputs = [
    line(maintenancePreflight()),
    line(extensionState(0)),
    line(unlockState()),
    line(extensionState(1)),
  ];
  const times = [new Date(issuedAtUtc), new Date("2026-08-03T08:00:01.000Z")];
  return runExtensionInitializerProtocol({
    clock: () => times.shift() ?? new Date("2026-08-03T08:00:01.000Z"),
    request: requestFixture(),
    async runPsql() {
      return outputs.shift()!;
    },
    runtimeFacts: runtimeFacts(),
  });
}

test("request is canonical, hash-sealed, fresh, parent-bound, and closed", () => {
  const request = requestFixture();
  assert.equal(
    validateExtensionInitializerRequest(request, {
      expectedParentPid: 4242,
      now: new Date(issuedAtUtc),
    }),
    request,
  );
  for (const tampered of [
    { ...request, parentPid: 4243 },
    { ...request, nonce: "x".repeat(64) },
    { ...request, requestSha256: HASH_A },
    { ...request, unexpected: true },
    {
      ...request,
      clone: { ...request.clone, databaseName: `${cloneName};DROP DATABASE x` },
    },
  ]) {
    assert.throws(
      () =>
        validateExtensionInitializerRequest(tampered, {
          expectedParentPid: 4242,
          now: new Date(issuedAtUtc),
        }),
      expectCode("EXTENSION_INITIALIZER_REQUEST"),
    );
  }
  assert.throws(
    () =>
      validateExtensionInitializerRequest(request, {
        expectedParentPid: 4242,
        now: new Date("2026-08-03T08:02:00.001Z"),
      }),
    expectCode("EXTENSION_INITIALIZER_REQUEST"),
  );
});

test("fixed SQL plan uses only the hash-bound stepwise pg_trgm path and vector 0.8.2", () => {
  assert.equal(
    LOGICAL_RESTORE_EXTENSION_INITIALIZER_FIXED_PLAN_SHA256,
    "fad5781af5501d12d2104f865cf158a068db787cc42ddb25934dccede8c56af7",
  );
  assert.deepEqual(LOGICAL_RESTORE_EXTENSION_INITIALIZER_FIXED_PLAN, [
    "CREATE EXTENSION pg_trgm WITH SCHEMA public VERSION '1.3'",
    "ALTER EXTENSION pg_trgm UPDATE TO '1.4'",
    "ALTER EXTENSION pg_trgm UPDATE TO '1.5'",
    "ALTER EXTENSION pg_trgm UPDATE TO '1.6'",
    "COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams'",
    "CREATE EXTENSION vector WITH SCHEMA public VERSION '0.8.2'",
    "COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods'",
  ]);
  const sql = buildExtensionInitializerSqlPlan(requestFixture());
  const mutationOffsets = LOGICAL_RESTORE_EXTENSION_INITIALIZER_FIXED_PLAN.map(
    (statement) => sql.targetMutation.indexOf(`${statement};`),
  );
  assert.equal(
    mutationOffsets.every((offset) => offset >= 0),
    true,
  );
  assert.deepEqual(
    mutationOffsets,
    [...mutationOffsets].sort((a, b) => a - b),
  );
  assert.doesNotMatch(sql.targetMutation, /IF NOT EXISTS|CASCADE/);
  assert.match(
    sql.targetMutation,
    /::public\.vector OPERATOR\(public\.<->\) '\[1,2,4\]'::public\.vector/,
  );
  assert.doesNotMatch(sql.targetMutation, /::public\.vector <->/);
  assert.doesNotMatch(
    canonicalExtensionInitializerJson(sql),
    /postgresql:\/\/|DATABASE_URL|DUMP|PASSWORD/i,
  );
});

test("clean outer and psql environments contain no credential or loader channel", () => {
  const outer = extensionInitializerCleanEnvironment();
  assert.equal(
    outer.__CF_USER_TEXT_ENCODING,
    extensionInitializerCfUserTextEncoding(),
  );
  assert.deepEqual(Object.keys(outer).sort(), [
    "LANG",
    "LC_ALL",
    "LOGICAL_RESTORE_EXTENSION_PARENT_PID",
    "LOGICAL_RESTORE_EXTENSION_REQUEST_FD",
    "TMPDIR",
    "TZ",
    "__CF_USER_TEXT_ENCODING",
  ]);
  const psql = extensionInitializerPsqlEnvironment(cloneName);
  assert.deepEqual(Object.keys(psql).sort(), [
    "LANG",
    "LC_ALL",
    "PGAPPNAME",
    "PGCLIENTENCODING",
    "PGCONNECT_TIMEOUT",
    "PGDATABASE",
    "PGHOST",
    "PGOPTIONS",
    "PGPORT",
    "PGSERVICEFILE",
    "PGSSLMODE",
    "PGTARGETSESSIONATTRS",
    "PGUSER",
    "TZ",
  ]);
  const serialized = canonicalExtensionInitializerJson({ outer, psql });
  assert.doesNotMatch(
    serialized,
    /HOME|PATH|NODE_OPTIONS|NODE_PATH|DYLD_|LD_PRELOAD|PGPASSWORD|DATABASE_URL|postgresql:\/\//,
  );
});

test(
  "runtime fact loading awaits the complete PostgreSQL toolset closure",
  { skip: !supportedRuntime, timeout: 30_000 },
  async () => {
    const facts = await loadExtensionInitializerRuntimeFacts();
    assert.deepEqual(Object.keys(facts).sort(), [
      "brokerSha256",
      "extensionClosureSha256",
      "extensionManifestSha256",
      "psqlClosureSha256",
      "psqlManifestSha256",
      "psqlSha256",
    ]);
    for (const value of Object.values(facts)) {
      assert.match(value, /^[a-f0-9]{64}$/);
    }
  },
);

test("protocol orders preflight, mutation, unlock, and post-verification before sealing", async () => {
  const request = requestFixture();
  const calls: Array<{ databaseName: string; sql: string }> = [];
  const outputs = [
    line(maintenancePreflight()),
    line(extensionState(0)),
    line(unlockState()),
    line(extensionState(1)),
  ];
  const times = [new Date(issuedAtUtc), new Date("2026-08-03T08:00:01.000Z")];
  const attestation = await runExtensionInitializerProtocol({
    clock: () => times.shift() ?? new Date("2026-08-03T08:00:01.000Z"),
    request,
    async runPsql(input: { databaseName: string; sql: string }) {
      calls.push(input);
      return outputs.shift()!;
    },
    runtimeFacts: runtimeFacts(),
  });
  assert.deepEqual(
    calls.map(({ databaseName }) => databaseName),
    ["postgres", cloneName, "postgres", cloneName],
  );
  assert.equal(
    attestation.format,
    LOGICAL_RESTORE_EXTENSION_INITIALIZER_ATTESTATION_FORMAT,
  );
  assert.equal(attestation.transactionCommitted, true);
  assert.equal(attestation.target.connectionLimitBefore, 0);
  assert.equal(attestation.target.connectionLimitAfter, 1);
  assert.equal(attestation.extensions.length, 2);
  assert.equal(attestation.extensions[0].memberCount, 1);
  const { attestationSha256, ...body } = attestation;
  assert.equal(
    attestationSha256,
    extensionInitializerSha256(
      `${LOGICAL_RESTORE_EXTENSION_INITIALIZER_ATTESTATION_DOMAIN}${canonicalExtensionInitializerJson(
        body,
      )}`,
    ),
  );
});

test("attestation validation rejects both raw and correctly rehashed tampering", async () => {
  const attestation = await validAttestationFixture();
  const options = {
    expectedRequest: requestFixture(),
    expectedRuntimeFacts: runtimeFacts(),
    now: new Date("2026-08-03T08:00:01.000Z"),
  };
  assert.deepEqual(
    validateExtensionInitializerAttestation(attestation, options),
    attestation,
  );

  const rawTamper = {
    ...attestation,
    transactionCommitted: false,
  };
  assert.throws(
    () => validateExtensionInitializerAttestation(rawTamper, options),
    expectCode("EXTENSION_INITIALIZER_ATTESTATION"),
  );

  const targetTamper = resealAttestation({
    ...attestation,
    target: { ...attestation.target, databaseOid: 654321 },
  });
  const runtimeTamper = resealAttestation({
    ...attestation,
    runtime: { ...attestation.runtime, brokerSha256: HASH_B },
  });
  const requestTamper = resealAttestation({
    ...attestation,
    requestSha256: HASH_A,
  });
  const staleTamper = resealAttestation({
    ...attestation,
    completedAtUtc: "2026-08-03T07:59:59.999Z",
  });
  const changedExtensions = structuredClone(attestation.extensions);
  changedExtensions[1].version = "0.8.1";
  const extensionTamper = resealAttestation({
    ...attestation,
    extensions: changedExtensions,
    extensionStateSha256: extensionInitializerSha256(
      canonicalExtensionInitializerJson(changedExtensions),
    ),
  });
  for (const tampered of [
    targetTamper,
    runtimeTamper,
    requestTamper,
    staleTamper,
    extensionTamper,
  ]) {
    assert.throws(
      () => validateExtensionInitializerAttestation(tampered, options),
      expectCode("EXTENSION_INITIALIZER_ATTESTATION"),
    );
  }
});

test("protocol fails closed on every phase mismatch and never advances", async (t) => {
  const scenarios = [
    {
      code: "EXTENSION_INITIALIZER_PREFLIGHT",
      mutate(outputs: unknown[]) {
        (outputs[0] as ReturnType<typeof maintenancePreflight>).databaseOid =
          "654321";
      },
      expectedCalls: 1,
    },
    {
      code: "EXTENSION_INITIALIZER_MUTATION",
      mutate(outputs: unknown[]) {
        outputs[1] = { malformed: true };
      },
      expectedCalls: 2,
    },
    {
      code: "EXTENSION_INITIALIZER_VERIFY",
      mutate(outputs: unknown[]) {
        (outputs[2] as ReturnType<typeof unlockState>).connectionLimit = 2;
      },
      expectedCalls: 3,
    },
    {
      code: "EXTENSION_INITIALIZER_VERIFY",
      mutate(outputs: unknown[]) {
        (
          outputs[3] as ReturnType<typeof extensionState>
        ).extensions[1].members[0].objectNames = ["public", "vector_changed"];
      },
      expectedCalls: 4,
    },
  ];
  for (const scenario of scenarios) {
    await t.test(scenario.code, async () => {
      const outputs: unknown[] = [
        maintenancePreflight(),
        extensionState(0),
        unlockState(),
        extensionState(1),
      ];
      scenario.mutate(outputs);
      let calls = 0;
      await assert.rejects(
        runExtensionInitializerProtocol({
          clock: () => new Date(issuedAtUtc),
          request: requestFixture(),
          async runPsql() {
            const output = outputs[calls];
            calls += 1;
            return line(output);
          },
          runtimeFacts: runtimeFacts(),
        }),
        expectCode(scenario.code),
      );
      assert.equal(calls, scenario.expectedCalls);
    });
  }
});

test("CLI rejects linked, wrong-mode, wrong-parent, and malformed FD3 requests before database access", () => {
  for (const scenario of [
    "linked",
    "wrong-mode",
    "wrong-parent",
    "malformed",
  ] as const) {
    const root = mkdtempSync(
      join(realpathSync(tmpdir()), "extension-initializer-request-test-"),
    );
    const path = join(root, "request.json");
    const request = requestFixture(
      scenario === "wrong-parent" ? process.pid + 1 : process.pid,
    );
    const bytes =
      scenario === "malformed"
        ? Buffer.from("{not-json}\n", "utf8")
        : Buffer.from(
            `${canonicalExtensionInitializerJson(request)}\n`,
            "utf8",
          );
    let descriptor: number | undefined;
    try {
      writeFileSync(path, bytes, { mode: 0o600 });
      chmodSync(path, scenario === "wrong-mode" ? 0o600 : 0o400);
      descriptor = openSync(
        path,
        constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
      );
      if (scenario !== "linked") unlinkSync(path);
      const result = spawnSync(process.execPath, [initializerPath], {
        cwd: repoRoot,
        encoding: "utf8",
        env: extensionInitializerCleanEnvironment() as unknown as NodeJS.ProcessEnv,
        stdio: ["ignore", "pipe", "pipe", descriptor],
      });
      assert.equal(result.status, 1, scenario);
      assert.equal(result.stdout, "", scenario);
      assert.equal(
        result.stderr,
        "[logical-restore-extension-initializer] ERROR EXTENSION_INITIALIZER_REQUEST\n",
        scenario,
      );
      assert.doesNotMatch(
        result.stderr,
        /postgresql:\/\/|foodsystems_restore|DATABASE_URL|request\.json/,
      );
    } finally {
      if (descriptor !== undefined) closeSync(descriptor);
      rmSync(root, { force: true, recursive: true });
    }
  }
});
