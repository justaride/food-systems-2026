import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  lstatSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  auditPrivateLibraryAnalysisRunRoot,
  openPrivateLibraryAnalysisRunRoot,
  readAndVerifyPrivateArtifact,
  sealPrivateArtifact,
  writePrivateArtifactExclusive,
  writePrivateManifestAtomic,
} from "../../src/lib/knowledge/private-library-analysis-artifact-store";

function fixtureRoot(t: test.TestContext): string {
  const root = mkdtempSync(join(tmpdir(), "library-analysis-store-test."));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

function sha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

test("private store writes exclusively and seals verified artifacts", (t) => {
  const base = fixtureRoot(t);
  const root = openPrivateLibraryAnalysisRunRoot(base, "run-1");
  assert.equal(openPrivateLibraryAnalysisRunRoot(base, "run-1"), root);
  const bytes = Buffer.from("private source bytes", "utf8");
  const written = writePrivateArtifactExclusive(root, "raw/source.bin", bytes);

  assert.equal(statSync(root).mode & 0o777, 0o700);
  assert.equal(statSync(join(root, "raw")).mode & 0o777, 0o700);
  assert.equal(statSync(written.path).mode & 0o777, 0o600);
  assert.equal(written.sha256, sha256(bytes));
  assert.equal(written.sizeBytes, bytes.length);

  const sealed = sealPrivateArtifact(root, "raw/source.bin", {
    sha256: sha256(bytes),
    sizeBytes: bytes.length,
  });
  assert.equal(statSync(sealed.path).mode & 0o777, 0o400);
  assert.deepEqual(
    readAndVerifyPrivateArtifact(root, "raw/source.bin", {
      sha256: sha256(bytes),
      sizeBytes: bytes.length,
      mode: 0o400,
    }),
    bytes,
  );
});

test("private store rejects traversal absolute paths backslashes and overwrite", (t) => {
  const root = openPrivateLibraryAnalysisRunRoot(fixtureRoot(t), "run-2");
  const bytes = Buffer.from("one", "utf8");

  for (const path of ["../escape", "/absolute", "a/../../escape", "a\\b", "", ".", "a//b"]) {
    assert.throws(
      () => writePrivateArtifactExclusive(root, path, bytes),
      /private_artifact_path_invalid/,
      path,
    );
  }

  writePrivateArtifactExclusive(root, "raw/one.bin", bytes);
  assert.throws(
    () => writePrivateArtifactExclusive(root, "raw/one.bin", Buffer.from("two")),
    /private_artifact_exists/,
  );
  assert.equal(readFileSync(join(root, "raw/one.bin"), "utf8"), "one");
});

test("private store rejects symlinked parents and targets", (t) => {
  const base = fixtureRoot(t);
  const outside = fixtureRoot(t);
  const root = openPrivateLibraryAnalysisRunRoot(base, "run-3");
  symlinkSync(outside, join(root, "linked-parent"));
  symlinkSync(join(outside, "target"), join(root, "linked-target"));

  assert.throws(
    () => writePrivateArtifactExclusive(root, "linked-parent/escape.bin", Buffer.from("x")),
    /private_artifact_symlink_forbidden/,
  );
  assert.throws(
    () => writePrivateArtifactExclusive(root, "linked-target", Buffer.from("x")),
    /private_artifact_exists|private_artifact_symlink_forbidden/,
  );
  assert.equal(lstatSync(join(root, "linked-target")).isSymbolicLink(), true);
});

test("private readback and sealing fail closed on hash size and mode drift", (t) => {
  const root = openPrivateLibraryAnalysisRunRoot(fixtureRoot(t), "run-4");
  const bytes = Buffer.from("verified", "utf8");
  writePrivateArtifactExclusive(root, "raw/value.bin", bytes);

  assert.throws(
    () => sealPrivateArtifact(root, "raw/value.bin", {
      sha256: "0".repeat(64),
      sizeBytes: bytes.length,
    }),
    /private_artifact_hash_mismatch/,
  );
  assert.throws(
    () => readAndVerifyPrivateArtifact(root, "raw/value.bin", {
      sha256: sha256(bytes),
      sizeBytes: bytes.length + 1,
      mode: 0o600,
    }),
    /private_artifact_size_mismatch/,
  );
  assert.throws(
    () => readAndVerifyPrivateArtifact(root, "raw/value.bin", {
      sha256: sha256(bytes),
      sizeBytes: bytes.length,
      mode: 0o400,
    }),
    /private_artifact_mode_mismatch/,
  );
});

test("private manifest publication is atomic sealed and non-overwriting", (t) => {
  const root = openPrivateLibraryAnalysisRunRoot(fixtureRoot(t), "run-5");
  const bytes = Buffer.from('{"schema":"fixture/v1"}\n', "utf8");
  const published = writePrivateManifestAtomic(root, "manifests/plan.json", bytes);

  assert.equal(statSync(published.path).mode & 0o777, 0o400);
  assert.equal(published.sha256, sha256(bytes));
  assert.equal(readFileSync(published.path, "utf8"), bytes.toString("utf8"));
  assert.deepEqual(readdirSync(join(root, "manifests")), ["plan.json"]);

  assert.throws(
    () => writePrivateManifestAtomic(
      root,
      "manifests/plan.json",
      Buffer.from('{"schema":"changed"}\n'),
    ),
    /private_artifact_exists/,
  );
  assert.equal(readFileSync(published.path, "utf8"), bytes.toString("utf8"));
  assert.deepEqual(readdirSync(join(root, "manifests")), ["plan.json"]);
});

test("private run audit reads every sealed file and returns a stable inventory hash", (t) => {
  const root = openPrivateLibraryAnalysisRunRoot(fixtureRoot(t), "run-audit");
  const first = Buffer.from("first", "utf8");
  const second = Buffer.from("second", "utf8");
  for (const [path, bytes] of [["raw/first.bin", first], ["manifests/second.json", second]] as const) {
    const written = writePrivateArtifactExclusive(root, path, bytes);
    sealPrivateArtifact(root, path, {
      sha256: written.sha256,
      sizeBytes: written.sizeBytes,
    });
  }

  const audit = auditPrivateLibraryAnalysisRunRoot(root);
  assert.equal(audit.files, 2);
  assert.equal(audit.directories, 3);
  assert.equal(audit.totalBytes, first.length + second.length);
  assert.match(audit.inventoryHash, /^[a-f0-9]{64}$/);
  assert.deepEqual(auditPrivateLibraryAnalysisRunRoot(root), audit);
});
