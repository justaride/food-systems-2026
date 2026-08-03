import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import {
  POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_FORMAT,
  POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_VERSION,
  PSQL_RUNTIME_CLOSURE_DOMAIN,
  PSQL_RUNTIME_CLOSURE_MANIFEST_PATH,
  PSQL_RUNTIME_CLOSURE_MANIFEST_SHA256,
  PSQL_RUNTIME_CLOSURE_SHA256,
  canonicalPsqlRuntimeClosureJson,
  parseArm64MachOLoadedDylibs,
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
  assert.equal(manifest.format, POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_FORMAT);
  assert.equal(manifest.version, POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_VERSION);
  assert.deepEqual(
    manifest.toolRoots.map((root: { name: string }) => root.name),
    ["createdb", "dropdb", "pg_restore", "psql"],
  );
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
  "rehashes all four PostgreSQL tools and their exact recursive loader closure",
  { skip: !supportedRuntime },
  async () => {
    const result = await verifyPsqlRuntimeClosure({
      manifestPath,
      expectedManifestSha256: PSQL_RUNTIME_CLOSURE_MANIFEST_SHA256,
      expectedClosureSha256: PSQL_RUNTIME_CLOSURE_SHA256,
    });
    assert.equal(result.toolBinaryCount, 4);
    assert.equal(result.homebrewObjectCount, 16);
    assert.equal(result.loaderAliasCount, 17);
    assert.equal(result.systemDylibReferenceCount, 9);
    assert.equal(result.dyldCacheFileCount, 13);
    assert.equal(result.totalRuntimeBytes, 5_810_881_056);
    assert.equal(
      result.psqlFileSha256,
      "5d5b74a77b010cb7e199af2288e099c72c54b0f27039bf99233ed1a6eec76b66",
    );
    assert.deepEqual(result.toolFileSha256, {
      createdb:
        "4d903ba229ba993a2803ff36981a7890abfbaa097ed64548d59b6932e0a860b3",
      dropdb:
        "34f7f2143da5c450981806df325f14a71377d6b7bc5b6a9a78267254c1b38eb9",
      pgRestore:
        "973d13de60c55dbc374390fe87027f9434bddffe7b0abd27b4e947e6639feb0d",
      psql: "5d5b74a77b010cb7e199af2288e099c72c54b0f27039bf99233ed1a6eec76b66",
    });
    assert.equal(JSON.stringify(result).includes("/opt/"), false);
    assert.equal(JSON.stringify(result).includes("/System/"), false);
  },
);

test("builtins-only parser reads a thin arm64 Mach-O dependency command", () => {
  const dependency = "/usr/lib/libSystem.B.dylib";
  const commandSize = 24 + Math.ceil((dependency.length + 1) / 4) * 4;
  const bytes = Buffer.alloc(32 + commandSize);
  bytes.writeUInt32LE(0xfeedfacf, 0);
  bytes.writeUInt32LE(0x0100000c, 4);
  bytes.writeUInt32LE(1, 16);
  bytes.writeUInt32LE(commandSize, 20);
  bytes.writeUInt32LE(0x0c, 32);
  bytes.writeUInt32LE(commandSize, 36);
  bytes.writeUInt32LE(24, 40);
  bytes.write(dependency, 56, "ascii");
  assert.deepEqual(parseArm64MachOLoadedDylibs(bytes), [dependency]);

  const malformed = Buffer.from(bytes);
  malformed.writeUInt32LE(commandSize + 4, 36);
  assert.throws(
    () => parseArm64MachOLoadedDylibs(malformed),
    /load command 1 has an invalid size/,
  );
  const invalidOffset = Buffer.from(bytes);
  invalidOffset.writeUInt32LE(8, 40);
  assert.throws(
    () => parseArm64MachOLoadedDylibs(invalidOffset),
    /dylib command 1 has an invalid path offset/,
  );
});

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
