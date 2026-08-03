import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import {
  PSQL_RUNTIME_CLOSURE_DOMAIN,
  PSQL_RUNTIME_CLOSURE_MANIFEST_PATH,
  PSQL_RUNTIME_CLOSURE_MANIFEST_SHA256,
  PSQL_RUNTIME_CLOSURE_SHA256,
  canonicalPsqlRuntimeClosureJson,
  psqlRuntimeClosureSha256,
  verifyPsqlRuntimeClosure,
} from "../../scripts/knowledge/verify-psql-runtime-closure.mjs";

const manifestPath = resolve(PSQL_RUNTIME_CLOSURE_MANIFEST_PATH);
const supportedRuntime =
  process.platform === "darwin" && process.arch === "arm64";

test("tracked manifest has the pinned file and domain-separated closure hashes", () => {
  const bytes = readFileSync(manifestPath);
  assert.equal(
    psqlRuntimeClosureSha256(bytes),
    PSQL_RUNTIME_CLOSURE_MANIFEST_SHA256,
  );
  const manifest = JSON.parse(bytes.toString("utf8"));
  const { closureSha256, ...body } = manifest;
  assert.equal(closureSha256, PSQL_RUNTIME_CLOSURE_SHA256);
  assert.equal(
    psqlRuntimeClosureSha256(
      `${PSQL_RUNTIME_CLOSURE_DOMAIN}${canonicalPsqlRuntimeClosureJson(body)}`,
    ),
    PSQL_RUNTIME_CLOSURE_SHA256,
  );
});

test(
  "rehashes the exact psql, dylib, loader-alias and system-cache closure",
  { skip: !supportedRuntime },
  async () => {
    const result = await verifyPsqlRuntimeClosure({
      manifestPath,
      expectedManifestSha256: PSQL_RUNTIME_CLOSURE_MANIFEST_SHA256,
      expectedClosureSha256: PSQL_RUNTIME_CLOSURE_SHA256,
    });
    assert.equal(result.homebrewObjectCount, 11);
    assert.equal(result.loaderAliasCount, 16);
    assert.equal(result.systemDylibReferenceCount, 8);
    assert.equal(result.dyldCacheFileCount, 13);
    assert.equal(result.totalRuntimeBytes, 5_809_514_128);
    assert.equal(
      result.psqlFileSha256,
      "5d5b74a77b010cb7e199af2288e099c72c54b0f27039bf99233ed1a6eec76b66",
    );
    assert.equal(JSON.stringify(result).includes("/opt/"), false);
    assert.equal(JSON.stringify(result).includes("/System/"), false);
  },
);

test("caller cannot substitute a different manifest binding", async () => {
  await assert.rejects(
    verifyPsqlRuntimeClosure({
      manifestPath,
      expectedManifestSha256: "0".repeat(64),
      expectedClosureSha256: PSQL_RUNTIME_CLOSURE_SHA256,
    }),
    /expected bindings differ from the pinned runtime closure/,
  );
});

test(
  "forbidden dynamic-loader environment fails before runtime execution",
  { skip: !supportedRuntime },
  async () => {
    const prior = process.env.DYLD_INSERT_LIBRARIES;
    process.env.DYLD_INSERT_LIBRARIES = "/tmp/not-loaded-by-test.dylib";
    try {
      await assert.rejects(
        verifyPsqlRuntimeClosure({
          manifestPath,
          expectedManifestSha256: PSQL_RUNTIME_CLOSURE_MANIFEST_SHA256,
          expectedClosureSha256: PSQL_RUNTIME_CLOSURE_SHA256,
        }),
        /forbidden loader environment is set/,
      );
    } finally {
      if (prior === undefined) delete process.env.DYLD_INSERT_LIBRARIES;
      else process.env.DYLD_INSERT_LIBRARIES = prior;
    }
  },
);
