import assert from "node:assert/strict";
import {
  chmodSync,
  existsSync,
  linkSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  readdirSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  parseSourceIdentitySealerConfig,
  prepareVerifiedSourceIdentityArtifact,
  sealAndWriteVerifiedSourceIdentityArtifact,
  type UnsealedSourceIdentityVerificationArtifact,
} from "../../scripts/knowledge/seal-source-identity-verification-artifact";
import {
  hashSourceIdentityVerificationPayload,
  requireVerifiedSourceIdentityWithEvidenceBundle,
  sealSourceIdentityVerificationArtifact,
  sourceIdentityVerificationArtifactPath,
  sourceIdentityVerificationPayload,
  type SourceIdentityVerificationArtifact,
} from "../../src/lib/knowledge/source-identity-verification";
import { sourceIdentityFullEvidenceFixture } from "../fixtures/source-identity-full-evidence-fixture";

function unsealed(
  artifact: SourceIdentityVerificationArtifact,
): UnsealedSourceIdentityVerificationArtifact {
  const { artifactSha256: _seal, ...body } = structuredClone(artifact);
  return body;
}

function provisionalBody(): UnsealedSourceIdentityVerificationArtifact {
  const fixture = sourceIdentityFullEvidenceFixture();
  const artifact = structuredClone(fixture.identity);
  artifact.decision = {
    state: "provisional",
    identityPromotionAllowed: false,
    blockingDiscrepancyCount: 0,
    reason:
      "The complete evidence remains available, but the identity decision is still provisional.",
    decidedAt: "2026-08-03T08:08:00Z",
    verifiedIdentity: null,
    nextActions: [
      "Resolve the identity hold before attempting verified artifact publication.",
    ],
  };
  artifact.verificationPayloadSha256 = hashSourceIdentityVerificationPayload(
    sourceIdentityVerificationPayload(artifact),
  );
  artifact.aiExecution.runs.at(-1)!.outputSha256 =
    artifact.verificationPayloadSha256;
  artifact.aiExecution.finalOutputSha256 = artifact.verificationPayloadSha256;
  return unsealed(sealSourceIdentityVerificationArtifact(unsealed(artifact)));
}

test("sealer preserves the supplied semantic body and validates the complete evidence bundle", () => {
  const fixture = sourceIdentityFullEvidenceFixture();
  const artifactBody = unsealed(fixture.identity);
  const prepared = prepareVerifiedSourceIdentityArtifact({
    artifactBody,
    evidenceBundle: fixture.bundle,
  });

  const { artifactSha256: _seal, ...writtenBody } = prepared.artifact;
  assert.deepEqual(writtenBody, artifactBody);
  assert.match(
    prepared.fileName,
    /^[a-f0-9]{64}\.source-identity-verification\.v1\.json$/,
  );
  assert.equal(
    prepared.repositoryPath,
    sourceIdentityVerificationArtifactPath(prepared.artifact.artifactSha256),
  );
  assert.equal(
    prepared.repositoryPath,
    `knowledge/corpus/source-identity-verification/artifacts/${prepared.fileName}`,
  );
  assert.deepEqual(
    JSON.parse(prepared.bytes.toString("utf8")),
    prepared.artifact,
  );
  assert.doesNotThrow(() =>
    requireVerifiedSourceIdentityWithEvidenceBundle(
      prepared.artifact,
      fixture.bundle,
    ),
  );
});

test("repository identity path accepts only the artifact's prefixed internal seal", () => {
  const fixture = sourceIdentityFullEvidenceFixture();
  const contentAddress = fixture.identity.artifactSha256.slice(
    "sha256:".length,
  );
  assert.equal(
    sourceIdentityVerificationArtifactPath(fixture.identity.artifactSha256),
    `knowledge/corpus/source-identity-verification/artifacts/${contentAddress}.source-identity-verification.v1.json`,
  );
  for (const invalid of [
    contentAddress,
    `sha256:${contentAddress.slice(1)}`,
    `sha256:${"g".repeat(64)}`,
  ]) {
    assert.throws(
      () => sourceIdentityVerificationArtifactPath(invalid),
      /prefixed SHA-256 artifact seal/,
    );
  }
});

test("writer is exclusive, byte-idempotent, content-addressed and fail-closed on conflict", () => {
  const fixture = sourceIdentityFullEvidenceFixture();
  const root = realpathSync(
    mkdtempSync(join(tmpdir(), "source-identity-sealer-")),
  );
  const outputDirectory = join(root, "verified");
  try {
    const input = {
      artifactBody: unsealed(fixture.identity),
      evidenceBundle: fixture.bundle,
      outputDirectory,
    };
    const first = sealAndWriteVerifiedSourceIdentityArtifact(input);
    assert.equal(first.writeState, "written");
    assert.equal(readFileSync(first.outputPath).equals(first.bytes), true);
    assert.equal(statSync(first.outputPath).mode & 0o777, 0o600);
    assert.equal(first.outputPath, join(outputDirectory, first.fileName));
    assert.equal(
      first.repositoryPath,
      sourceIdentityVerificationArtifactPath(first.artifact.artifactSha256),
    );

    const second = sealAndWriteVerifiedSourceIdentityArtifact(input);
    assert.equal(second.writeState, "already_present");
    assert.equal(second.outputPath, first.outputPath);

    writeFileSync(first.outputPath, "conflicting bytes", "utf8");
    assert.throws(
      () => sealAndWriteVerifiedSourceIdentityArtifact(input),
      /content-address conflict/,
    );
    assert.equal(readFileSync(first.outputPath, "utf8"), "conflicting bytes");
    assert.equal(
      readdirSync(outputDirectory).some((name) => name.endsWith(".tmp")),
      false,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("writer never treats a symlink at the content address as already present", () => {
  const fixture = sourceIdentityFullEvidenceFixture();
  const root = realpathSync(
    mkdtempSync(join(tmpdir(), "source-identity-sealer-link-")),
  );
  const outputDirectory = join(root, "verified");
  try {
    const prepared = prepareVerifiedSourceIdentityArtifact({
      artifactBody: unsealed(fixture.identity),
      evidenceBundle: fixture.bundle,
    });
    mkdirSync(outputDirectory, { mode: 0o700 });
    const outside = join(root, "outside.json");
    writeFileSync(outside, prepared.bytes, { mode: 0o600 });
    const outputPath = join(outputDirectory, prepared.fileName);
    symlinkSync(outside, outputPath);

    assert.throws(
      () =>
        sealAndWriteVerifiedSourceIdentityArtifact({
          artifactBody: unsealed(fixture.identity),
          evidenceBundle: fixture.bundle,
          outputDirectory,
        }),
      /not a regular non-symlink file/,
    );
    assert.equal(lstatSync(outputPath).isSymbolicLink(), true);
    assert.equal(readFileSync(outside).equals(prepared.bytes), true);
    assert.equal(
      readdirSync(outputDirectory).some((name) => name.endsWith(".tmp")),
      false,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("writer rejects a symlinked output-directory component", () => {
  const fixture = sourceIdentityFullEvidenceFixture();
  const root = realpathSync(
    mkdtempSync(join(tmpdir(), "source-identity-sealer-dir-link-")),
  );
  const outside = join(root, "outside");
  const linkedParent = join(root, "linked-parent");
  try {
    mkdirSync(outside, { mode: 0o700 });
    symlinkSync(outside, linkedParent, "dir");
    assert.throws(
      () =>
        sealAndWriteVerifiedSourceIdentityArtifact({
          artifactBody: unsealed(fixture.identity),
          evidenceBundle: fixture.bundle,
          outputDirectory: join(linkedParent, "verified"),
        }),
      /symlinked or non-directory component/,
    );
    assert.equal(existsSync(join(outside, "verified")), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("already-present output must remain a private single-link regular file", () => {
  const fixture = sourceIdentityFullEvidenceFixture();
  const root = realpathSync(
    mkdtempSync(join(tmpdir(), "source-identity-sealer-existing-")),
  );
  const outputDirectory = join(root, "verified");
  const input = {
    artifactBody: unsealed(fixture.identity),
    evidenceBundle: fixture.bundle,
    outputDirectory,
  };
  try {
    const first = sealAndWriteVerifiedSourceIdentityArtifact(input);
    chmodSync(first.outputPath, 0o644);
    assert.throws(
      () => sealAndWriteVerifiedSourceIdentityArtifact(input),
      /private mode 0600/,
    );
    chmodSync(first.outputPath, 0o600);

    const secondLink = join(root, "second-link.json");
    linkSync(first.outputPath, secondLink);
    assert.throws(
      () => sealAndWriteVerifiedSourceIdentityArtifact(input),
      /exactly one hard link/,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("provisional semantic output is rejected before any verified artifact is written", () => {
  const fixture = sourceIdentityFullEvidenceFixture();
  const root = realpathSync(
    mkdtempSync(join(tmpdir(), "source-identity-sealer-hold-")),
  );
  const outputDirectory = join(root, "verified");
  try {
    assert.throws(
      () =>
        sealAndWriteVerifiedSourceIdentityArtifact({
          artifactBody: provisionalBody(),
          evidenceBundle: fixture.bundle,
          outputDirectory,
        }),
      /provisional cannot establish verified identity/,
    );
    assert.equal(existsSync(outputDirectory), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("config parser rejects extra fields and requires explicit paths for every input", () => {
  const config = {
    schemaVersion: "seal-source-identity-verification-artifact-config-v1",
    artifactBodyFile: "identity.body.json",
    outputDirectory: "verified",
    evidenceFiles: {
      acquisitionReceipt: {
        artifactPath:
          "knowledge/corpus/source-acquisition-receipts/receipts/a.json",
        filePath: "a.json",
      },
      rawPdfFile: "/private/corpus/a.pdf",
      extractionReceipt: {
        artifactPath: "receipt.json",
        filePath: "receipt.json",
      },
      pageMap: { artifactPath: "page-map.json", filePath: "page-map.json" },
      candidateInputManifest: {
        artifactPath: "candidate.json",
        filePath: "candidate.json",
      },
      workflow: { artifactPath: "workflow.md", filePath: "workflow.md" },
      promptTemplate: { artifactPath: "prompt.md", filePath: "prompt.md" },
    },
  };
  assert.deepEqual(parseSourceIdentitySealerConfig(config), config);
  assert.throws(
    () => parseSourceIdentitySealerConfig({ ...config, inventAiOutput: true }),
    /must contain exactly/,
  );
});
