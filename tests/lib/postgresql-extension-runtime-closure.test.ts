import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import {
  POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_DOMAIN,
  POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_MANIFEST_PATH,
  POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_MANIFEST_SHA256,
  POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_SHA256,
  verifyPostgresqlExtensionRuntimeClosure,
} from "../../scripts/knowledge/verify-postgresql-extension-runtime-closure.mjs";

const manifestPath = resolve(
  POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_MANIFEST_PATH,
);
const supportedRuntime =
  process.platform === "darwin" && process.arch === "arm64";

function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonical).join(",")}]`;
  }
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonical(record[key])}`)
    .join(",")}}`;
}

function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

test("tracked extension manifest has exact declarations and domain-separated hashes", () => {
  const bytes = readFileSync(manifestPath);
  assert.equal(
    sha256(bytes),
    POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_MANIFEST_SHA256,
  );
  const manifest = JSON.parse(bytes.toString("utf8"));
  assert.deepEqual(
    manifest.extensions.map(
      (extension: { name: string; version: string }) =>
        `${extension.name}@${extension.version}`,
    ),
    ["pg_trgm@1.6", "vector@0.8.2"],
  );
  assert.equal(manifest.files.length, 9);
  const { closureSha256, ...body } = manifest;
  assert.equal(closureSha256, POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_SHA256);
  assert.equal(
    sha256(`${POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_DOMAIN}${canonical(body)}`),
    POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_SHA256,
  );
});

test(
  "rehashes every exact extension control, SQL, and native-library file",
  { skip: !supportedRuntime },
  () => {
    const result = verifyPostgresqlExtensionRuntimeClosure({
      expectedClosureSha256: POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_SHA256,
      expectedManifestSha256:
        POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_MANIFEST_SHA256,
      manifestPath,
    });
    assert.equal(result.fileCount, 9);
    assert.deepEqual(
      result.extensions.map(
        (extension: { name: string; version: string }) =>
          `${extension.name}@${extension.version}`,
      ),
      ["pg_trgm@1.6", "vector@0.8.2"],
    );
    assert.equal(JSON.stringify(result).includes("/opt/"), false);
  },
);

test("caller cannot substitute either reviewed extension binding", () => {
  for (const override of [
    {
      expectedClosureSha256: "0".repeat(64),
      expectedManifestSha256:
        POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_MANIFEST_SHA256,
    },
    {
      expectedClosureSha256: POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_SHA256,
      expectedManifestSha256: "0".repeat(64),
    },
  ]) {
    assert.throws(
      () =>
        verifyPostgresqlExtensionRuntimeClosure({
          ...override,
          manifestPath,
        }),
      /PostgreSQL extension runtime closure failed/,
    );
  }
});
