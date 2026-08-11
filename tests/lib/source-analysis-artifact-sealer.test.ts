import assert from "node:assert/strict";
import {
  chmodSync,
  existsSync,
  linkSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import {
  SOURCE_ANALYSIS_ARTIFACT_DIRECTORY,
  SOURCE_ANALYSIS_ARTIFACT_FILE_SUFFIX,
  parseSourceAnalysisArtifactSealerConfig,
  prepareSourceAnalysisArtifact,
  runSourceAnalysisArtifactSealerConfig,
  sealAndWriteSourceAnalysisArtifact,
  sourceAnalysisArtifactRepositoryPath,
  type CompleteSourceAnalysisEvidence,
  type SealSourceAnalysisArtifactInput,
  type SourceAnalysisArtifactSealerConfig,
  type UnsealedSourceAnalysisArtifact,
} from "../../scripts/knowledge/seal-source-analysis-artifact";
import {
  hashSourceAnalysisCheckpoint,
  hashSourceAnalysisFinalOutput,
  hashSourceAnalysisPayload,
  hashSourceAnalysisStagePayload,
  sealSourceAnalysisArtifact,
  sourceAnalysisStagePayload,
  type SourceAnalysisArtifact,
} from "../../src/lib/knowledge/source-analysis-artifact";
import {
  hashSourceIdentityVerificationPayload,
  sealSourceIdentityVerificationArtifact,
  sourceIdentityVerificationArtifactPath,
  sourceIdentityVerificationPayload,
} from "../../src/lib/knowledge/source-identity-verification";
import { corpusProcessingFullChainFixture } from "../fixtures/corpus-processing-full-chain-fixture";

function unsealed(
  artifact: ReturnType<
    typeof corpusProcessingFullChainFixture
  >["analysisArtifact"],
): UnsealedSourceAnalysisArtifact {
  const { artifactSha256: _seal, ...body } = structuredClone(artifact);
  return body;
}

function exactEvidence(
  chain: ReturnType<typeof corpusProcessingFullChainFixture>,
): CompleteSourceAnalysisEvidence {
  return {
    predecessorInputManifestFile: {
      path: chain.identityFixture.candidateInputManifestPath,
      bytes: chain.identityFixture.candidateInputManifestBytes,
    },
    inputManifestFile: {
      path: chain.verifiedInputManifestPath,
      bytes: chain.verifiedInputManifestBytes,
    },
    identityArtifactFile: {
      path: chain.identityFixture.identityArtifactPath,
      bytes: chain.identityFixture.identityArtifactBytes,
    },
    identityVerificationPrestate: chain.identityFixture.lifecycleL1,
    analysisPrestate: chain.lifecycleL2,
    identityEvidenceBundle: chain.identityFixture.bundle,
    workflowFile: chain.analysisExecutionEvidence.workflowFile,
    promptTemplateFile: chain.analysisExecutionEvidence.promptTemplateFile,
    normalizedPages: chain.analysisExecutionEvidence.normalizedPages,
    predecessorAnalysisArtifactFile: null,
    relatedAnalysisArtifactFiles: [],
  };
}

function exactInput(
  chain = corpusProcessingFullChainFixture(),
): SealSourceAnalysisArtifactInput {
  return {
    artifactBody: unsealed(chain.analysisArtifact),
    evidence: exactEvidence(chain),
  };
}

function resealWithRecomputedExecution(
  artifactBody: UnsealedSourceAnalysisArtifact,
): SourceAnalysisArtifact {
  artifactBody.analysisPayloadSha256 = hashSourceAnalysisPayload({
    locators: artifactBody.locators,
    analysis: artifactBody.analysis,
  });
  let predecessorRunOutputSha256: string | null = null;
  for (const run of artifactBody.analysisExecution.runs) {
    run.predecessorOutputSha256 = predecessorRunOutputSha256;
    let predecessorCheckpointSha256: string | null = null;
    run.checkpoints = run.stages.map((stage) => {
      const inputSha256 =
        predecessorCheckpointSha256 ?? run.inputEnvelopeSha256;
      const stagePayload = sourceAnalysisStagePayload(
        stage,
        artifactBody,
        run.inputEnvelopeSha256,
      );
      const stagePayloadSha256 = hashSourceAnalysisStagePayload(stagePayload);
      const outputSha256 = hashSourceAnalysisCheckpoint({
        stage,
        inputSha256,
        predecessorCheckpointSha256,
        stagePayloadSha256,
        completedAt: run.checkpoints.find(
          (checkpoint) => checkpoint.stage === stage,
        )!.completedAt,
      });
      const completedAt = run.checkpoints.find(
        (checkpoint) => checkpoint.stage === stage,
      )!.completedAt;
      const checkpoint = {
        stage,
        inputSha256,
        predecessorCheckpointSha256,
        stagePayload,
        stagePayloadSha256,
        outputSha256,
        completedAt,
      };
      predecessorCheckpointSha256 = outputSha256;
      return checkpoint;
    });
    run.outputSha256 = run.checkpoints.at(-1)!.outputSha256;
    predecessorRunOutputSha256 = run.outputSha256;
  }
  artifactBody.analysisExecution.finalOutputSha256 =
    hashSourceAnalysisFinalOutput({
      analysisPayloadSha256: artifactBody.analysisPayloadSha256,
      lastCheckpointOutputSha256: predecessorRunOutputSha256!,
    });
  return sealSourceAnalysisArtifact(artifactBody);
}

function contentAddressedArtifactFile(artifact: SourceAnalysisArtifact): {
  path: string;
  bytes: Buffer;
} {
  return {
    path: sourceAnalysisArtifactRepositoryPath(artifact.artifactSha256),
    bytes: Buffer.from(`${JSON.stringify(artifact, null, 2)}\n`, "utf8"),
  };
}

function relatedAnalysisArtifact(
  chain: ReturnType<typeof corpusProcessingFullChainFixture>,
): SourceAnalysisArtifact {
  const body = unsealed(chain.analysisArtifact);
  body.artifactId = "artifact.source.analysis.related.full.chain.v1";
  body.lineageId = "lineage.source.analysis.related.full.chain";
  body.binding.sourceId = "source.related.full.chain";
  body.binding.sourceTitle = "Related source analysis fixture";
  body.binding.sourceCanonicalIdentity =
    "sha256:related-source-analysis-fixture";
  body.binding.sourceContentSha256 = `sha256:${"b".repeat(64)}`;
  return resealWithRecomputedExecution(body);
}

function revisionInput(): {
  input: SealSourceAnalysisArtifactInput;
  predecessor: SourceAnalysisArtifact;
} {
  const chain = corpusProcessingFullChainFixture();
  const predecessor = chain.analysisArtifact;
  const body = unsealed(predecessor);
  body.artifactVersion = "1.0.1";
  body.continuity = {
    kind: "revision",
    predecessorArtifactId: predecessor.artifactId,
    predecessorArtifactVersion: predecessor.artifactVersion,
    predecessorArtifactSha256: predecessor.artifactSha256,
    changeSummary:
      "This fixture revision exercises exact predecessor evidence binding.",
  };
  const revision = resealWithRecomputedExecution(body);
  return {
    predecessor,
    input: {
      artifactBody: unsealed(revision),
      evidence: {
        ...exactEvidence(chain),
        predecessorAnalysisArtifactFile:
          contentAddressedArtifactFile(predecessor),
      },
    },
  };
}

function crossSourceInput(): {
  input: SealSourceAnalysisArtifactInput;
  related: SourceAnalysisArtifact;
} {
  const chain = corpusProcessingFullChainFixture();
  const related = relatedAnalysisArtifact(chain);
  const body = unsealed(chain.analysisArtifact);
  body.analysis.reconciliation.corroborations = [
    {
      findingId: "finding.cross.source.fixture",
      topic: "Cross-source fixture",
      statement:
        "The related source independently supports this bounded candidate finding.",
      thisSourceLocatorIds: [body.locators[0]!.locatorId],
      otherSourceEvidence: [
        {
          sourceId: related.binding.sourceId,
          sourceContentSha256: related.binding.sourceContentSha256,
          analysisArtifactId: related.artifactId,
          analysisArtifactVersion: related.artifactVersion,
          analysisArtifactSha256: related.artifactSha256,
          locatorIds: [related.locators[0]!.locatorId],
        },
      ],
      status: "open_candidate",
    },
  ];
  const artifact = resealWithRecomputedExecution(body);
  return {
    related,
    input: {
      artifactBody: unsealed(artifact),
      evidence: {
        ...exactEvidence(chain),
        relatedAnalysisArtifactFiles: [contentAddressedArtifactFile(related)],
      },
    },
  };
}

function write(path: string, bytes: Buffer | string, mode = 0o600): void {
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  writeFileSync(path, bytes, { mode });
}

type ConfigWorkspace = {
  root: string;
  configDirectory: string;
  config: SourceAnalysisArtifactSealerConfig;
  chain: ReturnType<typeof corpusProcessingFullChainFixture>;
  normalizedPagePaths: string[];
};

function configWorkspace(): ConfigWorkspace {
  const chain = corpusProcessingFullChainFixture();
  const root = realpathSync(
    mkdtempSync(join(tmpdir(), "source-analysis-sealer-config-")),
  );
  const configDirectory = join(root, "sealer-input");
  mkdirSync(configDirectory, { mode: 0o700 });
  const repositoryFile = (path: string, bytes: Buffer | string): void =>
    write(join(root, path), bytes);

  const identity = chain.identityFixture;
  repositoryFile(
    identity.acquisitionReceiptPath,
    identity.acquisitionReceiptBytes,
  );
  repositoryFile(
    identity.extractionReceiptPath,
    identity.extractionReceiptBytes,
  );
  repositoryFile(identity.pageMapPath, identity.pageMapBytes);
  repositoryFile(
    identity.candidateInputManifestPath,
    identity.candidateInputManifestBytes,
  );
  repositoryFile(identity.identityArtifactPath, identity.identityArtifactBytes);
  repositoryFile(identity.workflowFile.path, identity.workflowFile.bytes);
  repositoryFile(
    identity.promptTemplateFile.path,
    identity.promptTemplateFile.bytes,
  );
  repositoryFile(
    chain.verifiedInputManifestPath,
    chain.verifiedInputManifestBytes,
  );
  repositoryFile(
    chain.analysisExecutionEvidence.workflowFile.path,
    chain.analysisExecutionEvidence.workflowFile.bytes,
  );
  repositoryFile(
    chain.analysisExecutionEvidence.promptTemplateFile.path,
    chain.analysisExecutionEvidence.promptTemplateFile.bytes,
  );

  const artifactBodyFile = join(configDirectory, "analysis.body.json");
  const identityPrestateFile = join(configDirectory, "lifecycle-l1.json");
  const analysisPrestateFile = join(configDirectory, "lifecycle-l2.json");
  const rawPdfFile = join(configDirectory, "raw.pdf");
  write(
    artifactBodyFile,
    `${JSON.stringify(unsealed(chain.analysisArtifact), null, 2)}\n`,
  );
  write(
    identityPrestateFile,
    `${JSON.stringify(identity.lifecycleL1, null, 2)}\n`,
  );
  write(
    analysisPrestateFile,
    `${JSON.stringify(chain.lifecycleL2, null, 2)}\n`,
  );
  write(rawPdfFile, identity.rawPdfBytes);
  const normalizedPagePaths =
    chain.analysisExecutionEvidence.normalizedPages.map((page) => {
      const path = join(
        configDirectory,
        `page-${String(page.pageNumber).padStart(4, "0")}.normalized.txt`,
      );
      write(path, Buffer.from(page.bytes));
      return path;
    });

  const config: SourceAnalysisArtifactSealerConfig = {
    schemaVersion: "seal-source-analysis-artifact-config-v1",
    repositoryRoot: root,
    artifactBodyFile,
    identityVerificationPrestateFile: identityPrestateFile,
    analysisPrestateFile,
    evidenceFiles: {
      acquisitionReceiptPath: identity.acquisitionReceiptPath,
      rawPdfFile,
      extractionReceiptPath: identity.extractionReceiptPath,
      pageMapPath: identity.pageMapPath,
      predecessorInputManifestPath: identity.candidateInputManifestPath,
      inputManifestPath: chain.verifiedInputManifestPath,
      identityArtifactPath: identity.identityArtifactPath,
      identityWorkflowPath: identity.workflowFile.path,
      identityPromptTemplatePath: identity.promptTemplateFile.path,
      analysisWorkflowPath: chain.analysisExecutionEvidence.workflowFile.path,
      analysisPromptTemplatePath:
        chain.analysisExecutionEvidence.promptTemplateFile.path,
      predecessorAnalysisArtifactPath: null,
      relatedAnalysisArtifactPaths: [],
      normalizedPages: normalizedPagePaths.map((filePath, index) => ({
        pageNumber:
          chain.analysisExecutionEvidence.normalizedPages[index]!.pageNumber,
        filePath,
      })),
    },
  };
  return { root, configDirectory, config, chain, normalizedPagePaths };
}

test("seals, fully validates and byte-idempotently publishes only to the derived repository path", () => {
  const workspace = configWorkspace();
  try {
    const first = runSourceAnalysisArtifactSealerConfig(
      workspace.config,
      workspace.configDirectory,
    );
    assert.equal(first.status, "created");
    assert.equal(
      first.repositoryPath,
      sourceAnalysisArtifactRepositoryPath(first.artifact.artifactSha256),
    );
    assert.equal(
      first.repositoryPath,
      `${SOURCE_ANALYSIS_ARTIFACT_DIRECTORY}/${first.fileName}`,
    );
    assert.match(first.fileName, /^[a-f0-9]{64}\.source-analysis\.v1\.json$/);
    assert.equal(readFileSync(first.absolutePath).equals(first.bytes), true);
    assert.equal(statSync(first.absolutePath).mode & 0o777, 0o600);
    assert.equal(statSync(first.absolutePath).nlink, 1);

    const second = runSourceAnalysisArtifactSealerConfig(
      workspace.config,
      workspace.configDirectory,
    );
    assert.equal(second.status, "unchanged");
    assert.equal(second.absolutePath, first.absolutePath);
    assert.equal(
      readdirSync(dirname(first.absolutePath)).some((name) =>
        name.endsWith(".tmp"),
      ),
      false,
    );
  } finally {
    rmSync(workspace.root, { recursive: true, force: true });
  }
});

test("rejects a provisional identity before artifact publication", () => {
  const chain = corpusProcessingFullChainFixture();
  const provisional = structuredClone(chain.identityFixture.identity);
  provisional.decision = {
    state: "provisional",
    identityPromotionAllowed: false,
    blockingDiscrepancyCount: 0,
    reason:
      "The complete evidence remains available, but the identity decision is still provisional.",
    decidedAt: "2026-08-03T08:08:00Z",
    verifiedIdentity: null,
    nextActions: [
      "Resolve the identity hold before attempting source analysis.",
    ],
  };
  provisional.verificationPayloadSha256 = hashSourceIdentityVerificationPayload(
    sourceIdentityVerificationPayload(provisional),
  );
  provisional.aiExecution.runs.at(-1)!.outputSha256 =
    provisional.verificationPayloadSha256;
  provisional.aiExecution.finalOutputSha256 =
    provisional.verificationPayloadSha256;
  const { artifactSha256: _seal, ...body } = provisional;
  const sealed = sealSourceIdentityVerificationArtifact(body);
  const input = exactInput(chain);
  input.evidence.identityArtifactFile = {
    path: sourceIdentityVerificationArtifactPath(sealed.artifactSha256),
    bytes: Buffer.from(`${JSON.stringify(sealed, null, 2)}\n`, "utf8"),
  };
  const root = realpathSync(
    mkdtempSync(join(tmpdir(), "source-analysis-sealer-provisional-")),
  );
  try {
    assert.throws(
      () => sealAndWriteSourceAnalysisArtifact(root, input),
      /identity decision provisional cannot establish verified identity/,
    );
    assert.equal(
      existsSync(join(root, SOURCE_ANALYSIS_ARTIFACT_DIRECTORY)),
      false,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("fails closed on missing repository evidence and tampered normalized page bytes", () => {
  const workspace = configWorkspace();
  try {
    unlinkSync(
      join(
        workspace.root,
        workspace.config.evidenceFiles.analysisPromptTemplatePath,
      ),
    );
    assert.throws(
      () =>
        runSourceAnalysisArtifactSealerConfig(
          workspace.config,
          workspace.configDirectory,
        ),
      /analysis prompt template does not exist/,
    );

    write(
      join(
        workspace.root,
        workspace.config.evidenceFiles.analysisPromptTemplatePath,
      ),
      workspace.chain.analysisExecutionEvidence.promptTemplateFile.bytes,
    );
    writeFileSync(workspace.normalizedPagePaths[0]!, "tampered page\n");
    assert.throws(
      () =>
        runSourceAnalysisArtifactSealerConfig(
          workspace.config,
          workspace.configDirectory,
        ),
      /normalized|text|hash|serialized/i,
    );
    assert.equal(
      existsSync(join(workspace.root, SOURCE_ANALYSIS_ARTIFACT_DIRECTORY)),
      false,
    );
  } finally {
    rmSync(workspace.root, { recursive: true, force: true });
  }
});

test("strict config requires every evidence path and rejects arbitrary output control", () => {
  const workspace = configWorkspace();
  try {
    assert.deepEqual(
      parseSourceAnalysisArtifactSealerConfig(workspace.config),
      workspace.config,
    );
    assert.throws(
      () =>
        parseSourceAnalysisArtifactSealerConfig({
          ...workspace.config,
          outputPath: "/tmp/arbitrary.json",
        }),
      /must contain exactly/,
    );
    const missing = structuredClone(workspace.config) as Record<
      string,
      unknown
    >;
    const files = missing.evidenceFiles as Record<string, unknown>;
    delete files.pageMapPath;
    assert.throws(
      () => parseSourceAnalysisArtifactSealerConfig(missing),
      /must contain exactly/,
    );

    const duplicateRelated = structuredClone(workspace.config);
    duplicateRelated.evidenceFiles.relatedAnalysisArtifactPaths = [
      "knowledge/corpus/source-analysis/artifacts/a.source-analysis.v1.json",
      "knowledge/corpus/source-analysis/artifacts/a.source-analysis.v1.json",
    ];
    assert.throws(
      () => parseSourceAnalysisArtifactSealerConfig(duplicateRelated),
      /must not contain duplicate paths/,
    );

    const unsafeRelated = structuredClone(workspace.config);
    unsafeRelated.evidenceFiles.relatedAnalysisArtifactPaths = [
      "../outside.source-analysis.v1.json",
    ];
    assert.throws(
      () => parseSourceAnalysisArtifactSealerConfig(unsafeRelated),
      /portable repository-relative path/,
    );
  } finally {
    rmSync(workspace.root, { recursive: true, force: true });
  }
});

test("requires and exactly matches the content-addressed revision predecessor", () => {
  const valid = revisionInput();
  assert.doesNotThrow(() => prepareSourceAnalysisArtifact(valid.input));

  const missing = revisionInput();
  missing.input.evidence.predecessorAnalysisArtifactFile = null;
  assert.throws(
    () => prepareSourceAnalysisArtifact(missing.input),
    /revision analysis requires its predecessor analysis artifact file/,
  );

  const forged = revisionInput();
  const unrelated = relatedAnalysisArtifact(corpusProcessingFullChainFixture());
  forged.input.evidence.predecessorAnalysisArtifactFile =
    contentAddressedArtifactFile(unrelated);
  assert.throws(
    () => prepareSourceAnalysisArtifact(forged.input),
    /continuity does not match the exact predecessor artifact ID, version and hash/,
  );
});

test("opens cross-source artifacts and matches every source, seal and locator reference", () => {
  const valid = crossSourceInput();
  assert.doesNotThrow(() => prepareSourceAnalysisArtifact(valid.input));

  const missing = crossSourceInput();
  missing.input.evidence.relatedAnalysisArtifactFiles = [];
  assert.throws(
    () => prepareSourceAnalysisArtifact(missing.input),
    /missing its related content-addressed analysis artifact file/,
  );

  const forgedBinding = crossSourceInput();
  const forgedBindingBody = structuredClone(forgedBinding.input.artifactBody);
  forgedBindingBody.analysis.reconciliation.corroborations[0]!.otherSourceEvidence[0]!.sourceContentSha256 = `sha256:${"c".repeat(64)}`;
  forgedBinding.input.artifactBody = unsealed(
    resealWithRecomputedExecution(forgedBindingBody),
  );
  assert.throws(
    () => prepareSourceAnalysisArtifact(forgedBinding.input),
    /does not match the related source, content hash, artifact ID, version and hash/,
  );

  const forgedLocator = crossSourceInput();
  const forgedLocatorBody = structuredClone(forgedLocator.input.artifactBody);
  forgedLocatorBody.analysis.reconciliation.corroborations[0]!.otherSourceEvidence[0]!.locatorIds =
    ["locator.page.not-present"];
  forgedLocator.input.artifactBody = unsealed(
    resealWithRecomputedExecution(forgedLocatorBody),
  );
  assert.throws(
    () => prepareSourceAnalysisArtifact(forgedLocator.input),
    /references missing related locator/,
  );
});

test("rejects duplicate, unsafe and unused related dependency files", () => {
  const chain = corpusProcessingFullChainFixture();
  const related = relatedAnalysisArtifact(chain);

  const incomplete = exactInput(chain);
  delete (incomplete.evidence as unknown as Record<string, unknown>)
    .relatedAnalysisArtifactFiles;
  assert.throws(
    () => prepareSourceAnalysisArtifact(incomplete),
    /must supply a related analysis artifact file array/,
  );

  const unused = exactInput(chain);
  unused.evidence.relatedAnalysisArtifactFiles = [
    contentAddressedArtifactFile(related),
  ];
  assert.throws(
    () => prepareSourceAnalysisArtifact(unused),
    /is supplied but unused/,
  );

  const duplicate = crossSourceInput();
  duplicate.input.evidence.relatedAnalysisArtifactFiles = [
    contentAddressedArtifactFile(duplicate.related),
    contentAddressedArtifactFile(duplicate.related),
  ];
  assert.throws(
    () => prepareSourceAnalysisArtifact(duplicate.input),
    /must not contain duplicate paths/,
  );

  const unsafe = crossSourceInput();
  unsafe.input.evidence.relatedAnalysisArtifactFiles = [
    {
      ...contentAddressedArtifactFile(unsafe.related),
      path: "../outside.source-analysis.v1.json",
    },
  ];
  assert.throws(
    () => prepareSourceAnalysisArtifact(unsafe.input),
    /portable repository-relative path/,
  );
});

test("rejects hard-linked inputs and collective input drift before publication", () => {
  const hardLinked = configWorkspace();
  try {
    linkSync(
      hardLinked.config.evidenceFiles.rawPdfFile,
      join(hardLinked.configDirectory, "raw-hard-link.pdf"),
    );
    assert.throws(
      () =>
        runSourceAnalysisArtifactSealerConfig(
          hardLinked.config,
          hardLinked.configDirectory,
        ),
      /raw PDF must have exactly one hard link/,
    );
  } finally {
    rmSync(hardLinked.root, { recursive: true, force: true });
  }

  const drifted = configWorkspace();
  try {
    assert.throws(
      () =>
        runSourceAnalysisArtifactSealerConfig(
          drifted.config,
          drifted.configDirectory,
          {
            beforeCollectiveInputRevalidation: () => {
              chmodSync(drifted.normalizedPagePaths[0]!, 0o400);
            },
          },
        ),
      /normalized page 1 drifted after the collective input set was read/,
    );
    const artifactDirectory = join(
      drifted.root,
      SOURCE_ANALYSIS_ARTIFACT_DIRECTORY,
    );
    assert.equal(
      existsSync(artifactDirectory) &&
        readdirSync(artifactDirectory).some((name) =>
          name.endsWith(SOURCE_ANALYSIS_ARTIFACT_FILE_SUFFIX),
        ),
      false,
    );
  } finally {
    rmSync(drifted.root, { recursive: true, force: true });
  }
});

test("accepts class-appropriate private, repository and read-only input modes", () => {
  const workspace = configWorkspace();
  try {
    chmodSync(
      join(workspace.root, workspace.config.evidenceFiles.analysisWorkflowPath),
      0o644,
    );
    chmodSync(workspace.normalizedPagePaths[0]!, 0o400);
    const result = runSourceAnalysisArtifactSealerConfig(
      workspace.config,
      workspace.configDirectory,
    );
    assert.equal(result.status, "created");
  } finally {
    rmSync(workspace.root, { recursive: true, force: true });
  }
});

test("rejects symlinked output parents and a symlink at the derived leaf", () => {
  const input = exactInput();
  const parentRoot = realpathSync(
    mkdtempSync(join(tmpdir(), "source-analysis-sealer-parent-link-")),
  );
  const outside = realpathSync(
    mkdtempSync(join(tmpdir(), "source-analysis-sealer-outside-")),
  );
  try {
    mkdirSync(join(parentRoot, "knowledge/corpus"), { recursive: true });
    symlinkSync(outside, join(parentRoot, "knowledge/corpus/source-analysis"));
    assert.throws(
      () => sealAndWriteSourceAnalysisArtifact(parentRoot, input),
      /symlinked or non-directory component/,
    );
    assert.deepEqual(readdirSync(outside), []);
  } finally {
    rmSync(parentRoot, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  }

  const leafRoot = realpathSync(
    mkdtempSync(join(tmpdir(), "source-analysis-sealer-leaf-link-")),
  );
  try {
    const prepared = prepareSourceAnalysisArtifact(input);
    const outputPath = join(leafRoot, prepared.repositoryPath);
    mkdirSync(dirname(outputPath), { recursive: true, mode: 0o700 });
    const external = join(leafRoot, "external.json");
    write(external, prepared.bytes);
    symlinkSync(external, outputPath);
    assert.throws(
      () => sealAndWriteSourceAnalysisArtifact(leafRoot, input),
      /not a regular non-symlink file/,
    );
    assert.equal(lstatSync(outputPath).isSymbolicLink(), true);
    assert.equal(readFileSync(external).equals(prepared.bytes), true);
  } finally {
    rmSync(leafRoot, { recursive: true, force: true });
  }
});

test("rejects an output-directory swap before new or idempotent publication", () => {
  for (const existing of [false, true]) {
    const root = realpathSync(
      mkdtempSync(
        join(
          tmpdir(),
          `source-analysis-sealer-dynamic-parent-${existing ? "existing" : "new"}-`,
        ),
      ),
    );
    const outside = realpathSync(
      mkdtempSync(join(tmpdir(), "source-analysis-sealer-dynamic-outside-")),
    );
    const input = exactInput();
    const prepared = prepareSourceAnalysisArtifact(input);
    const outputPath = join(root, prepared.repositoryPath);
    const outputDirectory = dirname(outputPath);
    const movedDirectory = join(outside, "moved-artifacts");
    try {
      if (existing) {
        assert.equal(
          sealAndWriteSourceAnalysisArtifact(root, input).status,
          "created",
        );
      }
      assert.throws(
        () =>
          sealAndWriteSourceAnalysisArtifact(root, input, () => {
            renameSync(outputDirectory, movedDirectory);
            symlinkSync(movedDirectory, outputDirectory, "dir");
          }),
        /artifact output directory is a symlink|artifact output directory changed physical identity/,
      );
      assert.equal(
        existsSync(join(movedDirectory, prepared.fileName)),
        existing,
      );
      assert.equal(lstatSync(outputDirectory).isSymbolicLink(), true);
    } finally {
      rmSync(root, { recursive: true, force: true });
      rmSync(outside, { recursive: true, force: true });
    }
  }
});

test("already-present output must remain a private single-link file", () => {
  const root = realpathSync(
    mkdtempSync(join(tmpdir(), "source-analysis-sealer-hardlink-")),
  );
  const input = exactInput();
  try {
    const first = sealAndWriteSourceAnalysisArtifact(root, input);
    chmodSync(first.absolutePath, 0o644);
    assert.throws(
      () => sealAndWriteSourceAnalysisArtifact(root, input),
      /private mode 0600/,
    );
    chmodSync(first.absolutePath, 0o600);
    linkSync(first.absolutePath, join(root, "second-link.json"));
    assert.throws(
      () => sealAndWriteSourceAnalysisArtifact(root, input),
      /exactly one hard link/,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("same-address byte collision is rejected without overwrite", () => {
  const root = realpathSync(
    mkdtempSync(join(tmpdir(), "source-analysis-sealer-collision-")),
  );
  const input = exactInput();
  try {
    const first = sealAndWriteSourceAnalysisArtifact(root, input);
    writeFileSync(first.absolutePath, "conflicting bytes", { mode: 0o600 });
    assert.throws(
      () => sealAndWriteSourceAnalysisArtifact(root, input),
      /content-addressed artifact path contains conflicting bytes/,
    );
    assert.equal(readFileSync(first.absolutePath, "utf8"), "conflicting bytes");
    assert.equal(
      readdirSync(dirname(first.absolutePath)).some((name) =>
        name.endsWith(".tmp"),
      ),
      false,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
