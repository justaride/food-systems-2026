import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import {
  BOUND_SYSTEM_RUNTIME_CLOSURE_MANIFEST_SHA256,
  BOUND_SYSTEM_RUNTIME_CLOSURE_SHA256,
  NODE_RUNTIME_CLOSURE_DOMAIN,
  NODE_RUNTIME_CLOSURE_MANIFEST_PATH,
  NODE_RUNTIME_CLOSURE_MANIFEST_SHA256,
  NODE_RUNTIME_CLOSURE_SHA256,
  canonicalNodeRuntimeClosureJson,
  nodeRuntimeClosureSha256,
  verifyNodeRuntimeClosure,
} from "../../scripts/knowledge/verify-node-runtime-closure.mjs";
import {
  POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_MANIFEST_SHA256,
  POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_SHA256,
} from "../../scripts/knowledge/verify-psql-runtime-closure.mjs";

const manifestPath = resolve(NODE_RUNTIME_CLOSURE_MANIFEST_PATH);
const supportedRuntime =
  process.platform === "darwin" && process.arch === "arm64";
const forbiddenEnvironmentName =
  /^(?:NODE_|OPENSSL_|PRISMA_|TSX_|DOTENV_CONFIG_|DYLD_|LD_)/;

async function withCleanRuntimeEnvironment<T>(
  run: () => Promise<T>,
): Promise<T> {
  const saved = Object.entries(process.env).filter(([name]) =>
    forbiddenEnvironmentName.test(name),
  );
  for (const [name] of saved) delete process.env[name];
  try {
    return await run();
  } finally {
    for (const name of Object.keys(process.env)) {
      if (forbiddenEnvironmentName.test(name)) delete process.env[name];
    }
    for (const [name, value] of saved) process.env[name] = value;
  }
}

test("tracked Node manifest has the pinned file and domain-separated closure hashes", () => {
  const bytes = readFileSync(manifestPath);
  assert.equal(
    nodeRuntimeClosureSha256(bytes),
    NODE_RUNTIME_CLOSURE_MANIFEST_SHA256,
  );
  const manifest = JSON.parse(bytes.toString("utf8"));
  const { closureSha256, ...body } = manifest;
  assert.equal(closureSha256, NODE_RUNTIME_CLOSURE_SHA256);
  assert.equal(
    nodeRuntimeClosureSha256(
      `${NODE_RUNTIME_CLOSURE_DOMAIN}${canonicalNodeRuntimeClosureJson(body)}`,
    ),
    NODE_RUNTIME_CLOSURE_SHA256,
  );
});

test("Node runtime binds the same verified PostgreSQL toolset closure", () => {
  assert.equal(
    BOUND_SYSTEM_RUNTIME_CLOSURE_MANIFEST_SHA256,
    POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_MANIFEST_SHA256,
  );
  assert.equal(
    BOUND_SYSTEM_RUNTIME_CLOSURE_SHA256,
    POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_SHA256,
  );
});

test(
  "rehashes the exact Node, dylib and loader-alias closure bound to the verified system runtime",
  { skip: !supportedRuntime },
  async () => {
    const result = await withCleanRuntimeEnvironment(() =>
      verifyNodeRuntimeClosure({
        manifestPath,
        expectedManifestSha256: NODE_RUNTIME_CLOSURE_MANIFEST_SHA256,
        expectedClosureSha256: NODE_RUNTIME_CLOSURE_SHA256,
        verifiedSystemRuntimeClosureSha256: BOUND_SYSTEM_RUNTIME_CLOSURE_SHA256,
      }),
    );
    assert.equal(result.homebrewObjectCount, 25);
    assert.equal(result.loaderAliasCount, 30);
    assert.equal(result.systemDylibReferenceCount, 6);
    assert.equal(result.homebrewObjectBytes, 119_598_928);
    assert.equal(result.totalRuntimeBytes, 5_920_304_976);
    assert.equal(
      result.nodeFileSha256,
      "08dad0581f00a0cabf4d49ec92ca1f25fdfd01c2c18fa8e92b35f04d4c24c164",
    );
    assert.equal(
      result.verifiedSystemRuntimeClosureSha256,
      BOUND_SYSTEM_RUNTIME_CLOSURE_SHA256,
    );
    assert.equal(JSON.stringify(result).includes("/opt/"), false);
    assert.equal(JSON.stringify(result).includes("/System/"), false);
  },
);

test("caller cannot substitute a different Node manifest binding", async () => {
  await assert.rejects(
    verifyNodeRuntimeClosure({
      manifestPath,
      expectedManifestSha256: "0".repeat(64),
      expectedClosureSha256: NODE_RUNTIME_CLOSURE_SHA256,
      verifiedSystemRuntimeClosureSha256: BOUND_SYSTEM_RUNTIME_CLOSURE_SHA256,
    }),
    /expected bindings differ from the pinned runtime closure/,
  );
});

test("caller cannot substitute an unverified system runtime binding", async () => {
  await assert.rejects(
    verifyNodeRuntimeClosure({
      manifestPath,
      expectedManifestSha256: NODE_RUNTIME_CLOSURE_MANIFEST_SHA256,
      expectedClosureSha256: NODE_RUNTIME_CLOSURE_SHA256,
      verifiedSystemRuntimeClosureSha256: "0".repeat(64),
    }),
    /did not provide the bound verified system runtime closure/,
  );
});

test(
  "forbidden Node and loader environment fails before runtime verification",
  { skip: !supportedRuntime },
  async () => {
    const cases = [
      ["NODE_OPTIONS", "--require=/tmp/not-loaded-by-test.cjs"],
      ["NODE_PRESERVE_SYMLINKS", "1"],
      ["NODE_PRESERVE_SYMLINKS_MAIN", "1"],
      ["PRISMA_QUERY_ENGINE_LIBRARY", "/tmp/not-loaded-by-test.dylib"],
      ["TSX_TSCONFIG_PATH", "/tmp/not-loaded-by-test.json"],
      ["DOTENV_CONFIG_PATH", "/tmp/not-loaded-by-test.env"],
      ["OPENSSL_CONF", "/tmp/not-loaded-by-test.cnf"],
      ["OPENSSL_MODULES", "/tmp/not-loaded-by-test-modules"],
      ["DYLD_INSERT_LIBRARIES", "/tmp/not-loaded-by-test.dylib"],
      ["LD_PRELOAD", "/tmp/not-loaded-by-test.dylib"],
    ];
    for (const [name, value] of cases) {
      await withCleanRuntimeEnvironment(async () => {
        process.env[name] = value;
        await assert.rejects(
          verifyNodeRuntimeClosure({
            manifestPath,
            expectedManifestSha256: NODE_RUNTIME_CLOSURE_MANIFEST_SHA256,
            expectedClosureSha256: NODE_RUNTIME_CLOSURE_SHA256,
            verifiedSystemRuntimeClosureSha256:
              BOUND_SYSTEM_RUNTIME_CLOSURE_SHA256,
          }),
          new RegExp(`forbidden runtime environment is set: ${name}`),
        );
      });
    }
  },
);
