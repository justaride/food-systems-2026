import assert from "node:assert/strict";
import { createHash } from "node:crypto";
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
import { basename, dirname, join } from "node:path";
import { afterEach, describe, it } from "node:test";

import {
  hashCorpusLifecycleState,
  validateCorpusLifecycle,
  type CorpusLifecycleRecord,
} from "../../src/lib/knowledge/corpus-processing-lifecycle";
import { sourceAnalysisVerifiedInputManifestPath } from "../../src/lib/knowledge/corpus-processing-current-state";
import {
  sealSourceAnalysisInputManifest,
  type SourceAnalysisInputManifest,
} from "../../src/lib/knowledge/source-analysis-input-manifest";
import {
  sealPageMap,
  sealQualificationReceipt,
} from "../../src/lib/knowledge/pdf-page-extraction-qualification";
import {
  createAndWriteVerifiedSourceAnalysisInputManifestRevision,
  createVerifiedSourceAnalysisInputManifestRevision,
  parseVerifiedSourceAnalysisInputManifestRevisionCliArgs,
  runVerifiedSourceAnalysisInputManifestRevisionCli,
  type CreateVerifiedSourceAnalysisInputManifestRevisionInput,
} from "../../scripts/knowledge/create-verified-source-analysis-input-manifest-revision";
import * as revisionWriterModule from "../../scripts/knowledge/create-verified-source-analysis-input-manifest-revision";
import {
  hashSourceIdentityVerificationInputEnvelope,
  hashSourceIdentityVerificationPayload,
  sealSourceIdentityVerificationArtifact,
  sourceIdentitySha256,
  sourceIdentityVerificationArtifactPath,
  sourceIdentityVerificationInputEnvelope,
  validateSourceIdentityVerificationArtifact,
  type SourceIdentityVerificationArtifact,
} from "../../src/lib/knowledge/source-identity-verification";
import { sourceIdentityFullEvidenceFixture } from "../fixtures/source-identity-full-evidence-fixture";

const temporaryRoots: string[] = [];

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

function prettyBytes(value: unknown): Buffer {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function rawSha256(value: Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function normalizedTitleEvidenceFixture(): ReturnType<
  typeof sourceIdentityFullEvidenceFixture
> {
  const fixture = sourceIdentityFullEvidenceFixture();
  const observedTitle = "Example Authority Report: 2024";
  if (
    fixture.candidateInputManifest.identityAssociation.state !==
    "provisional_metadata_match"
  ) {
    throw new Error("Expected a provisional candidate fixture");
  }
  const identityAssociation = {
    state: "provisional_metadata_match" as const,
    intendedLabel:
      fixture.candidateInputManifest.identityAssociation.intendedLabel,
    observedDocumentTitle: observedTitle,
    blockerCode: null,
  };

  const { pageMapSha256: _oldPageMapSeal, ...pageMapBody } = fixture.pageMap;
  const pageMap = sealPageMap({
    ...pageMapBody,
    identityAssociation,
  });
  const pageMapBytes = prettyBytes(pageMap);

  const { receiptSha256: _oldReceiptSeal, ...receiptBody } =
    fixture.extractionReceipt;
  const extractionReceipt = sealQualificationReceipt({
    ...receiptBody,
    identityAssociation,
    extraction: {
      ...receiptBody.extraction,
      pageMapSha256: pageMap.pageMapSha256,
    },
  });
  const extractionReceiptBytes = prettyBytes(extractionReceipt);

  const { manifestSha256: _oldManifestSeal, ...manifestBody } =
    fixture.candidateInputManifest;
  const candidateInputManifest = sealSourceAnalysisInputManifest({
    ...manifestBody,
    identityAssociation,
    bindings: {
      pageMap: {
        ...manifestBody.bindings.pageMap,
        fileSha256: rawSha256(pageMapBytes),
        pageMapSha256: pageMap.pageMapSha256,
      },
      extractionReceipt: {
        ...manifestBody.bindings.extractionReceipt,
        fileSha256: rawSha256(extractionReceiptBytes),
        receiptSha256: extractionReceipt.receiptSha256,
      },
    },
  });
  const candidateInputManifestBytes = prettyBytes(candidateInputManifest);

  const { artifactSha256: _oldIdentitySeal, ...identityBody } =
    fixture.identity;
  const extractionBinding: SourceIdentityVerificationArtifact["extractionBinding"] =
    {
      ...identityBody.extractionBinding,
      extractionReceiptSha256: `sha256:${extractionReceipt.receiptSha256}`,
      pageMapSha256: `sha256:${pageMap.pageMapSha256}`,
    };
  const evidenceAnchors: SourceIdentityVerificationArtifact["evidenceAnchors"] =
    identityBody.evidenceAnchors.map((anchor) => {
      if (anchor.evidenceType === "extraction_receipt") {
        return {
          ...anchor,
          evidenceSha256: sourceIdentitySha256(extractionReceiptBytes),
        };
      }
      if (anchor.evidenceType === "page_map") {
        return {
          ...anchor,
          evidenceSha256: sourceIdentitySha256(pageMapBytes),
        };
      }
      if (anchor.evidenceType === "source_analysis_input_manifest") {
        return {
          ...anchor,
          evidenceSha256: sourceIdentitySha256(candidateInputManifestBytes),
        };
      }
      return anchor;
    });
  const observedMetadata: SourceIdentityVerificationArtifact["observedMetadata"] =
    {
      ...identityBody.observedMetadata,
      title: observedTitle,
    };
  const matchDimensions: SourceIdentityVerificationArtifact["matchDimensions"] =
    identityBody.matchDimensions.map((dimension) => {
      if (dimension.dimension === "title") {
        return {
          ...dimension,
          observedValue: observedTitle,
          matchState: "normalized_match" as const,
          normalizationStatement:
            "Case and punctuation differ while the normalized report title and year remain identical.",
        };
      }
      if (dimension.dimension === "extraction_binding") {
        const bindingValue = `${extractionBinding.extractionReceiptSha256}|${extractionBinding.pageMapSha256}`;
        return {
          ...dimension,
          expectedValue: bindingValue,
          observedValue: bindingValue,
        };
      }
      return dimension;
    });
  const firstRun = identityBody.aiExecution.runs[0]!;
  const inputEnvelopeSha256 = hashSourceIdentityVerificationInputEnvelope(
    sourceIdentityVerificationInputEnvelope({
      binding: identityBody.binding,
      candidateIdentity: identityBody.candidateIdentity,
      acquisitionReceipt: identityBody.acquisitionReceipt,
      extractionBinding,
      evidenceAnchors,
      workflow: {
        workflowRef: firstRun.workflowRef,
        workflowVersion: firstRun.workflowVersion,
        workflowFileSha256: firstRun.workflowFileSha256,
        promptTemplateSha256: firstRun.promptTemplateSha256,
      },
    }),
  );
  const verificationPayloadSha256 = hashSourceIdentityVerificationPayload({
    observedMetadata,
    canonicalLocatorEvidence: identityBody.canonicalLocatorEvidence,
    evidenceAnchors,
    matchDimensions,
    discrepancies: identityBody.discrepancies,
    decision: identityBody.decision,
    downstreamBoundaries: identityBody.downstreamBoundaries,
  });
  const identity = sealSourceIdentityVerificationArtifact({
    ...identityBody,
    extractionBinding,
    observedMetadata,
    evidenceAnchors,
    matchDimensions,
    aiExecution: {
      ...identityBody.aiExecution,
      runs: identityBody.aiExecution.runs.map((run) => ({
        ...run,
        extractionReceiptSha256: extractionBinding.extractionReceiptSha256,
        pageMapSha256: extractionBinding.pageMapSha256,
        inputEnvelopeSha256,
        outputSha256: verificationPayloadSha256,
      })),
      finalOutputSha256: verificationPayloadSha256,
    },
    verificationPayloadSha256,
  });
  const identityArtifactBytes = prettyBytes(identity);

  return {
    ...fixture,
    extractionReceipt,
    extractionReceiptBytes,
    pageMap,
    pageMapBytes,
    candidateInputManifest,
    candidateInputManifestBytes,
    identity,
    identityArtifactPath: sourceIdentityVerificationArtifactPath(
      identity.artifactSha256,
    ),
    identityArtifactBytes,
    bundle: {
      ...fixture.bundle,
      extractionReceiptFile: {
        ...fixture.bundle.extractionReceiptFile,
        bytes: extractionReceiptBytes,
      },
      pageMapFile: {
        ...fixture.bundle.pageMapFile,
        bytes: pageMapBytes,
      },
      sourceAnalysisInputManifestFile: {
        ...fixture.bundle.sourceAnalysisInputManifestFile,
        bytes: candidateInputManifestBytes,
      },
    },
  };
}

function analysisPrestateFixture(
  lifecycleL1: CorpusLifecycleRecord,
  identity: ReturnType<typeof sourceIdentityFullEvidenceFixture>["identity"],
): CorpusLifecycleRecord {
  if (identity.decision.state !== "verified") {
    throw new Error("Test fixture identity must be verified");
  }
  const lifecycleL2 = structuredClone(lifecycleL1);
  lifecycleL2.sourceIdentity.identityStatus = "verified";
  lifecycleL2.sourceIdentity.identityKind =
    identity.candidateIdentity.identityKind;
  lifecycleL2.sourceIdentity.canonicalIdentity =
    identity.decision.verifiedIdentity.canonicalIdentity;
  lifecycleL2.sourceIdentity.contentHashEvidenceState = "private_live_verified";
  lifecycleL2.sourceIdentity.contentHashVerifiedAt = "2026-08-03T08:10:30Z";
  lifecycleL2.updatedAt = "2026-08-03T08:10:30Z";
  return validateCorpusLifecycle(lifecycleL2);
}

function revisionFixture(): {
  fixture: ReturnType<typeof sourceIdentityFullEvidenceFixture>;
  lifecycleL2: CorpusLifecycleRecord;
  input: CreateVerifiedSourceAnalysisInputManifestRevisionInput;
} {
  const fixture = sourceIdentityFullEvidenceFixture();
  const lifecycleL2 = analysisPrestateFixture(
    fixture.lifecycleL1,
    fixture.identity,
  );
  return {
    fixture,
    lifecycleL2,
    input: {
      candidateManifestFile: {
        path: fixture.candidateInputManifestPath,
        bytes: fixture.candidateInputManifestBytes,
      },
      identityArtifactFile: {
        path: fixture.identityArtifactPath,
        bytes: fixture.identityArtifactBytes,
      },
      evidenceBundle: fixture.bundle,
      identityVerificationPrestate: fixture.lifecycleL1,
      analysisPrestate: lifecycleL2,
    },
  };
}

function writeRepositoryFile(
  repositoryRoot: string,
  repositoryPath: string,
  bytes: Buffer,
): void {
  const absolutePath = join(repositoryRoot, repositoryPath);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, bytes);
}

function writeCompleteEvidenceRepository(
  repositoryRoot: string,
  fixture: ReturnType<typeof sourceIdentityFullEvidenceFixture>,
): string {
  for (const file of [
    fixture.bundle.acquisitionReceiptFile,
    fixture.bundle.extractionReceiptFile,
    fixture.bundle.pageMapFile,
    fixture.bundle.sourceAnalysisInputManifestFile,
    fixture.bundle.workflowFile,
    fixture.bundle.promptTemplateFile,
  ]) {
    writeRepositoryFile(
      repositoryRoot,
      file.path,
      Buffer.isBuffer(file.bytes)
        ? Buffer.from(file.bytes)
        : Buffer.from(file.bytes, "utf8"),
    );
  }
  const rawPdfPath = join(repositoryRoot, "private", "source.pdf");
  mkdirSync(dirname(rawPdfPath), { recursive: true });
  writeFileSync(rawPdfPath, fixture.rawPdfBytes);
  return rawPdfPath;
}

describe("verified source-analysis input-manifest revision", () => {
  it("deterministically seals the positive revision and binds every supplied predecessor", () => {
    const { fixture, lifecycleL2, input } = revisionFixture();
    const first = createVerifiedSourceAnalysisInputManifestRevision(input);
    const second = createVerifiedSourceAnalysisInputManifestRevision(input);

    assert.equal(first.path, second.path);
    assert.deepEqual(first.bytes, second.bytes);
    assert.deepEqual(first.manifest, second.manifest);
    assert.equal(
      first.path,
      sourceAnalysisVerifiedInputManifestPath({
        rawPdfSha256: first.manifest.processingUnit.rawPdfSha256,
        manifestSha256: first.manifest.manifestSha256,
      }),
    );
    assert.notEqual(first.path, fixture.candidateInputManifestPath);
    assert.equal(
      first.manifest.identityAssociation.state,
      "verified_identity_match",
    );
    assert.equal(first.manifest.sourceBinding.corpusIdentityVerified, true);
    assert.equal(
      first.manifest.workflowEligibility.state,
      "source_analysis_eligible",
    );
    assert.ok(
      Object.values(first.manifest.readiness).every((value) => value === false),
    );

    if (
      first.manifest.workflowEligibility.state !== "source_analysis_eligible"
    ) {
      assert.fail("Expected positive workflow eligibility");
    }
    const eligibility = first.manifest.workflowEligibility.sourceAnalysis;
    assert.equal(
      eligibility.identityArtifactReference.path,
      fixture.identityArtifactPath,
    );
    assert.equal(
      eligibility.identityArtifactReference.fileSha256,
      rawSha256(fixture.identityArtifactBytes),
    );
    assert.equal(
      eligibility.identityArtifactReference.artifactSha256,
      fixture.identity.artifactSha256,
    );
    assert.deepEqual(eligibility.predecessorInputManifestReference, {
      schemaVersion: fixture.candidateInputManifest.schemaVersion,
      pipelineVersion: fixture.candidateInputManifest.pipelineVersion,
      path: fixture.candidateInputManifestPath,
      fileSha256: rawSha256(fixture.candidateInputManifestBytes),
      manifestSha256: fixture.candidateInputManifest.manifestSha256,
    });
    assert.equal(
      eligibility.lifecycleTransition.identityVerificationPrestate
        .lifecycleSnapshotSha256,
      hashCorpusLifecycleState(fixture.lifecycleL1),
    );
    assert.equal(
      eligibility.lifecycleTransition.analysisPrestate.lifecycleSnapshotSha256,
      hashCorpusLifecycleState(lifecycleL2),
    );
  });

  it("preserves the stable candidate title while accepting a disclosed normalized observed title", () => {
    const fixture = normalizedTitleEvidenceFixture();
    const lifecycleL2 = analysisPrestateFixture(
      fixture.lifecycleL1,
      fixture.identity,
    );
    const revision = createVerifiedSourceAnalysisInputManifestRevision({
      candidateManifestFile: {
        path: fixture.candidateInputManifestPath,
        bytes: fixture.candidateInputManifestBytes,
      },
      identityArtifactFile: {
        path: fixture.identityArtifactPath,
        bytes: fixture.identityArtifactBytes,
      },
      evidenceBundle: fixture.bundle,
      identityVerificationPrestate: fixture.lifecycleL1,
      analysisPrestate: lifecycleL2,
    });

    assert.equal(
      revision.manifest.sourceBinding.title,
      fixture.identity.candidateIdentity.candidateTitle,
    );
    assert.equal(
      revision.manifest.identityAssociation.intendedLabel,
      fixture.identity.candidateIdentity.candidateTitle,
    );
    assert.equal(
      revision.manifest.identityAssociation.observedDocumentTitle,
      fixture.identity.observedMetadata.title,
    );
    assert.notEqual(
      fixture.identity.candidateIdentity.candidateTitle,
      fixture.identity.observedMetadata.title,
    );
  });

  it("fails closed for tampered seals, drifted references, unsafe paths, and non-exact transitions", () => {
    const { fixture, lifecycleL2, input } = revisionFixture();

    const tamperedCandidate = JSON.parse(
      fixture.candidateInputManifestBytes.toString("utf8"),
    ) as SourceAnalysisInputManifest;
    tamperedCandidate.sourceBinding.title = "Tampered candidate title";
    assert.throws(
      () =>
        createVerifiedSourceAnalysisInputManifestRevision({
          ...input,
          candidateManifestFile: {
            ...input.candidateManifestFile,
            bytes: prettyBytes(tamperedCandidate),
          },
        }),
      /candidate manifest must be exactly identical to the complete evidence bundle/,
    );

    const tamperedIdentity = JSON.parse(
      fixture.identityArtifactBytes.toString("utf8"),
    ) as Record<string, unknown>;
    tamperedIdentity.createdAt = "2026-08-03T08:10:01Z";
    assert.throws(
      () =>
        createVerifiedSourceAnalysisInputManifestRevision({
          ...input,
          identityArtifactFile: {
            ...input.identityArtifactFile,
            bytes: prettyBytes(tamperedIdentity),
          },
        }),
      /Source-identity verification failed/,
    );

    const { manifestSha256: _seal, ...candidateBody } =
      fixture.candidateInputManifest;
    const validButDifferentCandidate = sealSourceAnalysisInputManifest({
      ...candidateBody,
      sourceBinding: {
        ...candidateBody.sourceBinding,
        officialUrl: "https://authority.example/reports/different.pdf",
      },
    });
    assert.throws(
      () =>
        createVerifiedSourceAnalysisInputManifestRevision({
          ...input,
          candidateManifestFile: {
            ...input.candidateManifestFile,
            bytes: prettyBytes(validButDifferentCandidate),
          },
        }),
      /candidate manifest must be exactly identical to the complete evidence bundle/,
    );

    const driftedL1 = structuredClone(fixture.lifecycleL1);
    driftedL1.sourceIdentity.title = "A different lifecycle title";
    assert.throws(
      () =>
        createVerifiedSourceAnalysisInputManifestRevision({
          ...input,
          identityVerificationPrestate: driftedL1,
        }),
      /identity lifecycle snapshot seal mismatch|exact verified-identity lifecycle transition/,
    );

    const driftedL2 = structuredClone(lifecycleL2);
    driftedL2.scope.geographyIds.push("geo.no");
    assert.throws(
      () =>
        createVerifiedSourceAnalysisInputManifestRevision({
          ...input,
          analysisPrestate: driftedL2,
        }),
      /exact verified-identity lifecycle transition/,
    );

    assert.throws(
      () =>
        createVerifiedSourceAnalysisInputManifestRevision({
          ...input,
          identityArtifactFile: {
            ...input.identityArtifactFile,
            path: "../identity.json",
          },
        }),
      /portable repository-relative path/,
    );
    assert.throws(
      () =>
        createVerifiedSourceAnalysisInputManifestRevision({
          ...input,
          identityArtifactFile: {
            ...input.identityArtifactFile,
            path: "knowledge/corpus/source-identity-verification/artifacts/arbitrary.source-identity-verification.v1.json",
          },
        }),
      /repository path derived from its internal artifact seal/,
    );
  });

  it("requires complete evidence and rejects a decision-only-valid identity against unrelated evidence", () => {
    const { fixture, input } = revisionFixture();
    assert.doesNotThrow(() =>
      validateSourceIdentityVerificationArtifact(
        JSON.parse(fixture.identityArtifactBytes.toString("utf8")),
      ),
    );

    assert.throws(
      () =>
        createVerifiedSourceAnalysisInputManifestRevision({
          ...input,
          evidenceBundle: {
            ...input.evidenceBundle,
            rawContentBytes: Buffer.concat([
              input.evidenceBundle.rawContentBytes,
              Buffer.from("tampered"),
            ]),
          },
        }),
      /Source-identity verification failed/,
    );

    const unrelated = sourceIdentityFullEvidenceFixture({
      identityKeys: [...fixture.identityKeys, "source.example.unrelated"],
    });
    assert.doesNotThrow(() =>
      validateSourceIdentityVerificationArtifact(
        JSON.parse(fixture.identityArtifactBytes.toString("utf8")),
      ),
    );
    assert.throws(
      () =>
        createVerifiedSourceAnalysisInputManifestRevision({
          ...input,
          candidateManifestFile: {
            path: unrelated.candidateInputManifestPath,
            bytes: unrelated.candidateInputManifestBytes,
          },
          evidenceBundle: unrelated.bundle,
        }),
      /Source-identity verification failed/,
    );
  });

  it("writes exclusively, permits byte-identical retries, rejects collisions, and never overwrites the candidate", () => {
    const { fixture, lifecycleL2, input } = revisionFixture();
    const repositoryRoot = realpathSync(
      mkdtempSync(join(tmpdir(), "verified-input-revision-")),
    );
    temporaryRoots.push(repositoryRoot);
    const lifecycleL1Path = "work/lifecycle-l1.json";
    const lifecycleL2Path = "work/lifecycle-l2.json";
    const rawPdfPath = writeCompleteEvidenceRepository(repositoryRoot, fixture);
    writeRepositoryFile(
      repositoryRoot,
      fixture.identityArtifactPath,
      fixture.identityArtifactBytes,
    );
    writeRepositoryFile(
      repositoryRoot,
      lifecycleL1Path,
      prettyBytes(fixture.lifecycleL1),
    );
    writeRepositoryFile(
      repositoryRoot,
      lifecycleL2Path,
      prettyBytes(lifecycleL2),
    );
    const candidateAbsolutePath = join(
      repositoryRoot,
      fixture.candidateInputManifestPath,
    );
    const candidateBefore = readFileSync(candidateAbsolutePath);
    const args = [
      "--repository-root",
      repositoryRoot,
      "--candidate-manifest",
      fixture.candidateInputManifestPath,
      "--identity-artifact",
      fixture.identityArtifactPath,
      "--raw-pdf",
      rawPdfPath,
      "--identity-verification-prestate",
      lifecycleL1Path,
      "--analysis-prestate",
      lifecycleL2Path,
    ];

    const created = runVerifiedSourceAnalysisInputManifestRevisionCli(args);
    assert.equal(created.status, "created");
    const createdBytes = readFileSync(created.absolutePath);
    assert.equal(statSync(created.absolutePath).mode & 0o777, 0o600);
    assert.equal(statSync(created.absolutePath).nlink, 1);
    assert.equal(
      readdirSync(dirname(created.absolutePath)).some((name) =>
        name.endsWith(".tmp"),
      ),
      false,
    );
    const unchanged = runVerifiedSourceAnalysisInputManifestRevisionCli(args);
    assert.equal(unchanged.status, "unchanged");
    assert.deepEqual(readFileSync(unchanged.absolutePath), createdBytes);
    assert.deepEqual(readFileSync(candidateAbsolutePath), candidateBefore);

    assert.equal(
      "writeVerifiedSourceAnalysisInputManifestRevision" in
        revisionWriterModule,
      false,
    );
    assert.equal(
      createAndWriteVerifiedSourceAnalysisInputManifestRevision(
        repositoryRoot,
        input,
      ).status,
      "unchanged",
    );
    assert.deepEqual(readFileSync(candidateAbsolutePath), candidateBefore);

    chmodSync(created.absolutePath, 0o644);
    assert.throws(
      () => runVerifiedSourceAnalysisInputManifestRevisionCli(args),
      /private mode 0600/,
    );
    assert.deepEqual(readFileSync(created.absolutePath), createdBytes);
    chmodSync(created.absolutePath, 0o600);
    writeFileSync(created.absolutePath, "conflicting bytes\n", "utf8");
    assert.throws(
      () => runVerifiedSourceAnalysisInputManifestRevisionCli(args),
      /already contains conflicting bytes/,
    );
    assert.equal(
      readFileSync(created.absolutePath, "utf8"),
      "conflicting bytes\n",
    );
    assert.deepEqual(readFileSync(candidateAbsolutePath), candidateBefore);
  });

  it("rejects an existing revision with multiple hard links", () => {
    const { fixture, input } = revisionFixture();
    const repositoryRoot = realpathSync(
      mkdtempSync(join(tmpdir(), "verified-input-hard-link-")),
    );
    temporaryRoots.push(repositoryRoot);
    writeCompleteEvidenceRepository(repositoryRoot, fixture);

    const created = createAndWriteVerifiedSourceAnalysisInputManifestRevision(
      repositoryRoot,
      input,
    );
    const secondLink = join(repositoryRoot, "revision-second-link.json");
    linkSync(created.absolutePath, secondLink);
    assert.equal(statSync(created.absolutePath).nlink, 2);
    assert.throws(
      () =>
        createAndWriteVerifiedSourceAnalysisInputManifestRevision(
          repositoryRoot,
          input,
        ),
      /exactly one hard link/,
    );
    assert.equal(
      readFileSync(created.absolutePath).equals(readFileSync(secondLink)),
      true,
    );
  });

  it("rejects a symlink at the content-addressed revision path", () => {
    const { fixture, input } = revisionFixture();
    const repositoryRoot = realpathSync(
      mkdtempSync(join(tmpdir(), "verified-input-output-link-")),
    );
    temporaryRoots.push(repositoryRoot);
    writeCompleteEvidenceRepository(repositoryRoot, fixture);
    const revision = createVerifiedSourceAnalysisInputManifestRevision(input);
    const absolutePath = join(repositoryRoot, revision.path);
    mkdirSync(dirname(absolutePath), { recursive: true, mode: 0o700 });
    const outside = join(repositoryRoot, "outside-revision.json");
    writeFileSync(outside, revision.bytes, { mode: 0o600 });
    symlinkSync(outside, absolutePath);

    assert.throws(
      () =>
        createAndWriteVerifiedSourceAnalysisInputManifestRevision(
          repositoryRoot,
          input,
        ),
      /not a regular non-symlink file/,
    );
    assert.equal(lstatSync(absolutePath).isSymbolicLink(), true);
    assert.equal(readFileSync(outside).equals(revision.bytes), true);
    assert.equal(
      readdirSync(dirname(absolutePath)).some((name) => name.endsWith(".tmp")),
      false,
    );
  });

  it("rejects a symlinked revision-directory component without writing through it", () => {
    const { fixture, input } = revisionFixture();
    const repositoryRoot = realpathSync(
      mkdtempSync(join(tmpdir(), "verified-input-directory-link-")),
    );
    temporaryRoots.push(repositoryRoot);
    writeCompleteEvidenceRepository(repositoryRoot, fixture);
    const revision = createVerifiedSourceAnalysisInputManifestRevision(input);
    const absolutePath = join(repositoryRoot, revision.path);
    const outputDirectory = dirname(absolutePath);
    mkdirSync(dirname(outputDirectory), { recursive: true, mode: 0o700 });
    const outsideDirectory = join(repositoryRoot, "outside-revision-directory");
    mkdirSync(outsideDirectory, { mode: 0o700 });
    symlinkSync(outsideDirectory, outputDirectory, "dir");

    assert.throws(
      () =>
        createAndWriteVerifiedSourceAnalysisInputManifestRevision(
          repositoryRoot,
          input,
        ),
      /non-directory or symlink component/,
    );
    assert.equal(
      existsSync(join(outsideDirectory, basename(absolutePath))),
      false,
    );
  });

  it("refuses publication when the exact sealed predecessor is missing or unrelated", () => {
    const { fixture, input } = revisionFixture();
    const repositoryRoot = realpathSync(
      mkdtempSync(join(tmpdir(), "verified-input-predecessor-")),
    );
    temporaryRoots.push(repositoryRoot);
    writeCompleteEvidenceRepository(repositoryRoot, fixture);
    const candidateAbsolutePath = join(
      repositoryRoot,
      fixture.candidateInputManifestPath,
    );

    rmSync(candidateAbsolutePath);
    assert.throws(
      () =>
        createAndWriteVerifiedSourceAnalysisInputManifestRevision(
          repositoryRoot,
          input,
        ),
      /candidate manifest predecessor does not exist/,
    );

    const unrelated = sourceIdentityFullEvidenceFixture({
      identityKeys: [...fixture.identityKeys, "source.example.unrelated"],
    });
    writeFileSync(candidateAbsolutePath, unrelated.candidateInputManifestBytes);
    assert.throws(
      () =>
        createAndWriteVerifiedSourceAnalysisInputManifestRevision(
          repositoryRoot,
          input,
        ),
      /predecessor bytes do not exactly match/,
    );

    assert.throws(
      () =>
        createAndWriteVerifiedSourceAnalysisInputManifestRevision(
          repositoryRoot,
          {
            ...input,
            candidateManifestFile: {
              path: "knowledge/corpus/source-analysis-input-manifests/manifests/unrelated.json",
              bytes: fixture.candidateInputManifestBytes,
            },
          },
        ),
      /candidate manifest must be exactly identical to the complete evidence bundle/,
    );
  });

  it("rejects missing, unknown, and duplicate CLI arguments", () => {
    assert.throws(
      () => parseVerifiedSourceAnalysisInputManifestRevisionCliArgs([]),
      /missing required CLI argument/,
    );
    assert.throws(
      () =>
        parseVerifiedSourceAnalysisInputManifestRevisionCliArgs([
          "--unknown",
          "value",
        ]),
      /unknown CLI argument/,
    );
    assert.throws(
      () =>
        parseVerifiedSourceAnalysisInputManifestRevisionCliArgs([
          "--candidate-manifest",
          "a.json",
          "--candidate-manifest",
          "b.json",
        ]),
      /supplied twice/,
    );
  });
});
