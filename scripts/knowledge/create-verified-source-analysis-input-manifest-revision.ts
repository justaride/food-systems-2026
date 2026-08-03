import { createHash, randomUUID } from "node:crypto";
import {
  closeSync,
  constants,
  fchmodSync,
  fstatSync,
  fsyncSync,
  linkSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  realpathSync,
  unlinkSync,
  writeFileSync,
  type Stats,
} from "node:fs";
import { basename, dirname, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { TextDecoder } from "node:util";

import {
  canonicalCorpusJson,
  hashCorpusLifecycleState,
  validateCorpusLifecycle,
  type CorpusCanonicalJsonValue,
  type CorpusLifecycleRecord,
} from "../../src/lib/knowledge/corpus-processing-lifecycle";
import { sourceAnalysisVerifiedInputManifestPath } from "../../src/lib/knowledge/corpus-processing-current-state";
import {
  isPortableRepositoryRelativePath,
  sealSourceAnalysisInputManifest,
  sourceAnalysisEligibleWorkflowEligibility,
  verifySourceAnalysisInputManifest,
  type SourceAnalysisInputManifest,
} from "../../src/lib/knowledge/source-analysis-input-manifest";
import {
  SOURCE_IDENTITY_PROMPT_TEMPLATE_PATH,
  SOURCE_IDENTITY_WORKFLOW_PATH,
  requireVerifiedSourceIdentityWithEvidenceBundle,
  sourceIdentityVerificationArtifactPath,
  validateSourceIdentityVerificationArtifact,
  type SourceIdentityVerificationArtifact,
  type SourceIdentityVerificationEvidenceBundle,
} from "../../src/lib/knowledge/source-identity-verification";

export type ExactRepositoryFile = {
  path: string;
  bytes: Buffer | string;
};

export type CreateVerifiedSourceAnalysisInputManifestRevisionInput = {
  candidateManifestFile: ExactRepositoryFile;
  identityArtifactFile: ExactRepositoryFile;
  evidenceBundle: SourceIdentityVerificationEvidenceBundle;
  identityVerificationPrestate: unknown;
  analysisPrestate: unknown;
};

export type VerifiedSourceAnalysisInputManifestRevision = {
  manifest: SourceAnalysisInputManifest;
  path: string;
  bytes: Buffer;
};

export type VerifiedSourceAnalysisInputManifestRevisionWriteResult = {
  status: "created" | "unchanged";
  repositoryPath: string;
  absolutePath: string;
};

export type VerifiedSourceAnalysisInputManifestRevisionCliOptions = {
  repositoryRoot: string;
  candidateManifestPath: string;
  identityArtifactPath: string;
  rawPdfPath: string;
  identityVerificationPrestatePath: string;
  analysisPrestatePath: string;
};

const CLI_VALUE_FLAGS = new Set([
  "--repository-root",
  "--candidate-manifest",
  "--identity-artifact",
  "--raw-pdf",
  "--identity-verification-prestate",
  "--analysis-prestate",
]);

const PRIVATE_REVISION_FILE_MODE = 0o600;
const PRIVATE_REVISION_DIRECTORY_MODE = 0o700;
const O_NOFOLLOW = constants.O_NOFOLLOW ?? 0;
const O_DIRECTORY = constants.O_DIRECTORY ?? 0;

type VerifiedSourceIdentity = ReturnType<
  typeof requireVerifiedSourceIdentityWithEvidenceBundle
>["identity"];

function fail(message: string): never {
  throw new Error(
    `Verified source-analysis input-manifest revision failed: ${message}`,
  );
}

function exactBytes(file: ExactRepositoryFile): Buffer {
  return Buffer.isBuffer(file.bytes)
    ? Buffer.from(file.bytes)
    : Buffer.from(file.bytes, "utf8");
}

function sha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function prefixedSha256(rawSha256: string): string {
  return `sha256:${rawSha256}`;
}

function prettyManifestBytes(manifest: SourceAnalysisInputManifest): Buffer {
  return Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

function assertPortablePath(value: string, label: string): void {
  if (!isPortableRepositoryRelativePath(value)) {
    fail(`${label} must be a portable repository-relative path`);
  }
}

function parseExactJson(bytes: Buffer, label: string): unknown {
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    fail(`${label} is not valid UTF-8`);
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    fail(`${label} is not valid JSON`);
  }
}

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  if (actual !== expected) fail(`${label} mismatch`);
}

function assertLifecycleTransition(
  identityVerificationPrestate: CorpusLifecycleRecord,
  analysisPrestate: CorpusLifecycleRecord,
  identity: VerifiedSourceIdentity,
): void {
  assertEqual(
    identityVerificationPrestate.recordId,
    analysisPrestate.recordId,
    "lifecycle record ID",
  );
  assertEqual(
    identityVerificationPrestate.sourceIdentity.identityStatus,
    "provisional",
    "identity-verification pre-state status",
  );
  assertEqual(
    analysisPrestate.sourceIdentity.identityStatus,
    "verified",
    "analysis pre-state status",
  );

  const expectedAnalysisPrestate = structuredClone(
    identityVerificationPrestate,
  );
  expectedAnalysisPrestate.sourceIdentity.identityStatus = "verified";
  expectedAnalysisPrestate.sourceIdentity.identityKind =
    identity.candidateIdentity.identityKind;
  expectedAnalysisPrestate.sourceIdentity.canonicalIdentity =
    identity.decision.verifiedIdentity.canonicalIdentity;
  if (
    expectedAnalysisPrestate.sourceIdentity.contentHashEvidenceState ===
    "private_capture_attestation_recorded"
  ) {
    expectedAnalysisPrestate.sourceIdentity.contentHashEvidenceState =
      "private_live_verified";
    expectedAnalysisPrestate.sourceIdentity.contentHashVerifiedAt =
      analysisPrestate.updatedAt;
  }
  expectedAnalysisPrestate.updatedAt = analysisPrestate.updatedAt;

  if (
    canonicalCorpusJson(
      expectedAnalysisPrestate as unknown as CorpusCanonicalJsonValue,
    ) !==
    canonicalCorpusJson(analysisPrestate as unknown as CorpusCanonicalJsonValue)
  ) {
    fail(
      "analysis pre-state contains changes outside the exact verified-identity lifecycle transition",
    );
  }

  const analysisTime = Date.parse(analysisPrestate.updatedAt);
  for (const [label, value] of [
    ["identity-verification pre-state", identityVerificationPrestate.updatedAt],
    ["verified identity", identity.decision.verifiedIdentity.verifiedAt],
    ["identity decision", identity.decision.decidedAt],
    ["identity artifact", identity.createdAt],
  ] as const) {
    if (Date.parse(value) > analysisTime) {
      fail(`analysis pre-state predates ${label}`);
    }
  }
}

function requiredEvidenceAnchor(
  identity: VerifiedSourceIdentity,
  evidenceType:
    "source_analysis_input_manifest" | "extraction_receipt" | "page_map",
): (typeof identity.evidenceAnchors)[number] {
  const matches = identity.evidenceAnchors.filter(
    (anchor) => anchor.evidenceType === evidenceType,
  );
  if (matches.length !== 1) {
    fail(`verified identity must contain exactly one ${evidenceType} anchor`);
  }
  return matches[0]!;
}

function assertCandidateAndIdentityBindings(input: {
  candidate: SourceAnalysisInputManifest;
  candidatePath: string;
  candidateFileSha256: string;
  identity: VerifiedSourceIdentity;
  identityVerificationPrestate: CorpusLifecycleRecord;
  analysisPrestate: CorpusLifecycleRecord;
}): void {
  const {
    candidate,
    candidatePath,
    candidateFileSha256,
    identity,
    identityVerificationPrestate,
    analysisPrestate,
  } = input;
  const verifiedIdentity = identity.decision.verifiedIdentity;
  const rawPdfSha256 = prefixedSha256(candidate.processingUnit.rawPdfSha256);
  const normalizedInputSha256 = prefixedSha256(
    candidate.normalizedInput.sha256,
  );

  if (
    candidate.identityAssociation.state !== "provisional_metadata_match" ||
    candidate.sourceBinding.corpusIdentityVerified !== false ||
    candidate.workflowEligibility.state !== "identity_verification_candidate" ||
    candidate.workflowEligibility.identityVerification.allowed !== true ||
    candidate.workflowEligibility.sourceAnalysis.allowed !== false
  ) {
    fail("candidate is not the exact immutable provisional input manifest");
  }
  if (!Object.values(candidate.readiness).every((value) => value === false)) {
    fail("candidate readiness gates must all remain false");
  }

  const candidateAnchor = requiredEvidenceAnchor(
    identity,
    "source_analysis_input_manifest",
  );
  assertEqual(
    candidateAnchor.locator,
    candidatePath,
    "candidate-manifest evidence-anchor path",
  );
  assertEqual(
    candidateAnchor.evidenceSha256,
    prefixedSha256(candidateFileSha256),
    "candidate-manifest evidence-anchor file hash",
  );

  const extractionAnchor = requiredEvidenceAnchor(
    identity,
    "extraction_receipt",
  );
  assertEqual(
    extractionAnchor.locator,
    candidate.bindings.extractionReceipt.path,
    "extraction-receipt evidence-anchor path",
  );
  assertEqual(
    extractionAnchor.evidenceSha256,
    prefixedSha256(candidate.bindings.extractionReceipt.fileSha256),
    "extraction-receipt evidence-anchor file hash",
  );
  assertEqual(
    identity.extractionBinding.extractionReceiptSha256,
    prefixedSha256(candidate.bindings.extractionReceipt.receiptSha256),
    "extraction-receipt internal seal",
  );

  const pageMapAnchor = requiredEvidenceAnchor(identity, "page_map");
  assertEqual(
    pageMapAnchor.locator,
    candidate.bindings.pageMap.path,
    "page-map evidence-anchor path",
  );
  assertEqual(
    pageMapAnchor.evidenceSha256,
    prefixedSha256(candidate.bindings.pageMap.fileSha256),
    "page-map evidence-anchor file hash",
  );
  assertEqual(
    identity.extractionBinding.pageMapSha256,
    prefixedSha256(candidate.bindings.pageMap.pageMapSha256),
    "page-map internal seal",
  );

  for (const anchor of identity.evidenceAnchors) {
    if (!["cover_page", "bibliographic_page"].includes(anchor.evidenceType)) {
      continue;
    }
    const match = /^page:(\d+)$/.exec(anchor.locator);
    const page = match
      ? candidate.pages.find((item) => item.pageNumber === Number(match[1]))
      : undefined;
    if (
      !page ||
      anchor.evidenceSha256 !== prefixedSha256(page.normalizedText.sha256)
    ) {
      fail(
        `${anchor.evidenceType} anchor does not bind an exact candidate page`,
      );
    }
  }

  assertEqual(
    identity.binding.lifecycleRecordId,
    identityVerificationPrestate.recordId,
    "identity lifecycle record ID",
  );
  assertEqual(
    identity.binding.lifecycleSnapshotSha256,
    hashCorpusLifecycleState(identityVerificationPrestate),
    "identity lifecycle snapshot seal",
  );
  assertEqual(
    identity.binding.lifecycleSnapshotUpdatedAt,
    identityVerificationPrestate.updatedAt,
    "identity lifecycle snapshot timestamp",
  );
  assertEqual(
    identity.binding.lifecycleSourceIdentityStatus,
    identityVerificationPrestate.sourceIdentity.identityStatus,
    "identity lifecycle status",
  );

  for (const lifecycle of [
    identityVerificationPrestate,
    analysisPrestate,
  ] as const) {
    assertEqual(
      lifecycle.sourceIdentity.sourceId,
      verifiedIdentity.sourceId,
      "verified source ID",
    );
    assertEqual(
      lifecycle.sourceIdentity.canonicalIdentity,
      verifiedIdentity.canonicalIdentity,
      "verified canonical identity",
    );
    assertEqual(
      lifecycle.sourceIdentity.title,
      candidate.sourceBinding.title,
      "verified source title",
    );
    assertEqual(
      lifecycle.sourceIdentity.metadataSha256,
      identity.binding.sourceMetadataSha256,
      "source-metadata hash",
    );
    assertEqual(
      lifecycle.sourceIdentity.contentSha256,
      identity.binding.sourceContentSha256,
      "source-content hash",
    );
    assertEqual(
      lifecycle.textAvailability.textSha256,
      normalizedInputSha256,
      "normalized text hash",
    );
  }

  assertEqual(
    identity.binding.sourceId,
    verifiedIdentity.sourceId,
    "identity binding source ID",
  );
  assertEqual(
    identity.binding.sourceContentSha256,
    rawPdfSha256,
    "candidate raw-PDF hash",
  );
  assertEqual(
    identity.extractionBinding.rawContentSha256,
    rawPdfSha256,
    "identity raw-content hash",
  );
  assertEqual(
    identity.extractionBinding.extractedTextManifestSha256,
    normalizedInputSha256,
    "identity normalized-text hash",
  );
  assertEqual(
    identity.extractionBinding.expectedPageCount,
    candidate.totals.pageCount,
    "identity expected page count",
  );
  assertEqual(
    identity.extractionBinding.mappedPageCount,
    candidate.totals.pageCount,
    "identity mapped page count",
  );

  assertEqual(
    candidate.identityAssociation.intendedLabel,
    identity.candidateIdentity.candidateTitle,
    "candidate intended title",
  );
  assertEqual(
    candidate.identityAssociation.observedDocumentTitle,
    identity.observedMetadata.title,
    "candidate observed title",
  );
  assertEqual(
    candidate.sourceBinding.title,
    identity.candidateIdentity.candidateTitle,
    "candidate source title",
  );
  const titleDimension = identity.matchDimensions.find(
    (dimension) => dimension.dimension === "title",
  );
  if (
    !titleDimension ||
    !["exact_match", "normalized_match"].includes(titleDimension.matchState)
  ) {
    fail("verified title must be an exact or disclosed normalized match");
  }
  if (
    titleDimension.matchState === "exact_match" &&
    identity.observedMetadata.title !==
      identity.candidateIdentity.candidateTitle
  ) {
    fail("exact title match contains different candidate and observed titles");
  }
  if (
    !candidate.identityKeys.includes(verifiedIdentity.canonicalIdentity) ||
    identity.candidateIdentity.canonicalIdentity !==
      verifiedIdentity.canonicalIdentity
  ) {
    fail(
      "verified canonical identity is not bound by the candidate identity keys",
    );
  }
  if (identity.candidateIdentity.candidateLocator.kind === "official_url") {
    if (!("officialUrl" in candidate.sourceBinding)) {
      fail("official source identity requires exactly one officialUrl binding");
    }
    assertEqual(
      candidate.sourceBinding.officialUrl,
      identity.candidateIdentity.candidateLocator.url,
      "official source URL",
    );
  } else {
    if (!("controlledPrivateLocator" in candidate.sourceBinding)) {
      fail(
        "controlled private source must bind exactly one controlledPrivateLocator and no officialUrl",
      );
    }
    assertEqual(
      candidate.sourceBinding.controlledPrivateLocator,
      identity.candidateIdentity.candidateLocator.locator,
      "controlled private source locator",
    );
  }
}

export function createVerifiedSourceAnalysisInputManifestRevision(
  input: CreateVerifiedSourceAnalysisInputManifestRevisionInput,
): VerifiedSourceAnalysisInputManifestRevision {
  assertPortablePath(
    input.candidateManifestFile.path,
    "candidate manifest path",
  );
  assertPortablePath(input.identityArtifactFile.path, "identity artifact path");
  for (const [label, file] of [
    ["acquisition receipt", input.evidenceBundle.acquisitionReceiptFile],
    ["extraction receipt", input.evidenceBundle.extractionReceiptFile],
    ["page map", input.evidenceBundle.pageMapFile],
    [
      "source-analysis input manifest evidence",
      input.evidenceBundle.sourceAnalysisInputManifestFile,
    ],
    ["identity workflow", input.evidenceBundle.workflowFile],
    ["identity prompt template", input.evidenceBundle.promptTemplateFile],
  ] as const) {
    assertPortablePath(file.path, `${label} path`);
  }

  const candidateBytes = exactBytes(input.candidateManifestFile);
  const evidenceCandidateBytes = exactBytes(
    input.evidenceBundle.sourceAnalysisInputManifestFile,
  );
  if (
    input.candidateManifestFile.path !==
      input.evidenceBundle.sourceAnalysisInputManifestFile.path ||
    !candidateBytes.equals(evidenceCandidateBytes)
  ) {
    fail(
      "candidate manifest must be exactly identical to the complete evidence bundle source-analysis input manifest",
    );
  }
  const candidate = verifySourceAnalysisInputManifest(
    parseExactJson(candidateBytes, "candidate manifest"),
  );
  const identityBytes = exactBytes(input.identityArtifactFile);
  const identity = requireVerifiedSourceIdentityWithEvidenceBundle(
    parseExactJson(identityBytes, "identity artifact"),
    input.evidenceBundle,
  ).identity;
  if (
    input.identityArtifactFile.path !==
    sourceIdentityVerificationArtifactPath(identity.artifactSha256)
  ) {
    fail(
      "identity artifact must use the repository path derived from its internal artifact seal",
    );
  }
  const identityVerificationPrestate = validateCorpusLifecycle(
    input.identityVerificationPrestate,
  );
  const analysisPrestate = validateCorpusLifecycle(input.analysisPrestate);

  assertLifecycleTransition(
    identityVerificationPrestate,
    analysisPrestate,
    identity,
  );
  assertCandidateAndIdentityBindings({
    candidate,
    candidatePath: input.candidateManifestFile.path,
    candidateFileSha256: sha256(candidateBytes),
    identity,
    identityVerificationPrestate,
    analysisPrestate,
  });

  const { manifestSha256: _candidateSeal, ...candidateBody } = candidate;
  const manifest = sealSourceAnalysisInputManifest({
    ...candidateBody,
    identityAssociation: {
      state: "verified_identity_match",
      intendedLabel: candidate.identityAssociation.intendedLabel,
      observedDocumentTitle:
        candidate.identityAssociation.observedDocumentTitle,
      sourceId: identity.decision.verifiedIdentity.sourceId,
      canonicalIdentity: identity.decision.verifiedIdentity.canonicalIdentity,
      blockerCode: null,
    },
    sourceBinding: {
      ...candidate.sourceBinding,
      corpusIdentityVerified: true,
    },
    workflowEligibility: sourceAnalysisEligibleWorkflowEligibility({
      identityArtifactReference: {
        artifactId: identity.artifactId,
        artifactVersion: identity.artifactVersion,
        path: input.identityArtifactFile.path,
        fileSha256: sha256(identityBytes),
        artifactSha256: identity.artifactSha256,
        decision: "verified",
      },
      predecessorInputManifestReference: {
        schemaVersion: candidate.schemaVersion,
        pipelineVersion: candidate.pipelineVersion,
        path: input.candidateManifestFile.path,
        fileSha256: sha256(candidateBytes),
        manifestSha256: candidate.manifestSha256,
      },
      lifecycleTransition: {
        identityVerificationPrestate: {
          lifecycleRecordId: identityVerificationPrestate.recordId,
          lifecycleSnapshotSha256: hashCorpusLifecycleState(
            identityVerificationPrestate,
          ),
          lifecycleSnapshotUpdatedAt: identityVerificationPrestate.updatedAt,
          sourceIdentityStatus: "provisional",
        },
        analysisPrestate: {
          lifecycleRecordId: analysisPrestate.recordId,
          lifecycleSnapshotSha256: hashCorpusLifecycleState(analysisPrestate),
          lifecycleSnapshotUpdatedAt: analysisPrestate.updatedAt,
          sourceIdentityStatus: "verified",
        },
      },
    }),
  });
  const verifiedManifest = verifySourceAnalysisInputManifest(manifest);
  if (
    !Object.values(verifiedManifest.readiness).every((value) => value === false)
  ) {
    fail("positive revision changed a readiness gate");
  }

  const repositoryPath = sourceAnalysisVerifiedInputManifestPath({
    rawPdfSha256: verifiedManifest.processingUnit.rawPdfSha256,
    manifestSha256: verifiedManifest.manifestSha256,
  });
  if (repositoryPath === input.candidateManifestFile.path) {
    fail(
      "positive revision path collides with the immutable candidate manifest",
    );
  }
  const bytes = prettyManifestBytes(verifiedManifest);
  if (bytes.equals(candidateBytes)) {
    fail("positive revision bytes unexpectedly equal the candidate bytes");
  }
  return { manifest: verifiedManifest, path: repositoryPath, bytes };
}

function isErrno(error: unknown, code: string): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === code
  );
}

function assertInsideRoot(
  root: string,
  absolutePath: string,
  label: string,
): void {
  const fromRoot = relative(root, absolutePath);
  if (
    fromRoot === ".." ||
    fromRoot.startsWith(`..${sep}`) ||
    resolve(root, fromRoot) !== absolutePath
  ) {
    fail(`${label} escapes the repository root`);
  }
}

function repositoryAbsolutePath(
  repositoryRoot: string,
  repositoryPath: string,
  label: string,
): string {
  assertPortablePath(repositoryPath, label);
  const absolutePath = resolve(repositoryRoot, repositoryPath);
  assertInsideRoot(repositoryRoot, absolutePath, label);
  return absolutePath;
}

function readExactRepositoryFile(
  repositoryRoot: string,
  repositoryPath: string,
  label: string,
): ExactRepositoryFile {
  const absolutePath = repositoryAbsolutePath(
    repositoryRoot,
    repositoryPath,
    label,
  );
  let stat;
  try {
    stat = lstatSync(absolutePath);
  } catch (error) {
    if (isErrno(error, "ENOENT")) fail(`${label} does not exist`);
    throw error;
  }
  if (stat.isSymbolicLink() || !stat.isFile()) {
    fail(`${label} must be a regular non-symlink file`);
  }
  if (realpathSync(absolutePath) !== absolutePath) {
    fail(`${label} must not traverse a symlink`);
  }
  return { path: repositoryPath, bytes: readFileSync(absolutePath) };
}

function readExactPhysicalFile(
  physicalPathValue: string,
  label: string,
): Buffer {
  const absolutePath = resolve(physicalPathValue);
  let stat;
  try {
    stat = lstatSync(absolutePath);
  } catch (error) {
    if (isErrno(error, "ENOENT")) fail(`${label} does not exist`);
    throw error;
  }
  if (stat.isSymbolicLink() || !stat.isFile()) {
    fail(`${label} must be a regular non-symlink file`);
  }
  if (realpathSync(absolutePath) !== absolutePath) {
    fail(`${label} must not traverse a symlink`);
  }
  return readFileSync(absolutePath);
}

function requiredIdentityEvidencePath(
  identity: SourceIdentityVerificationArtifact,
  evidenceType:
    | "source_acquisition_receipt"
    | "extraction_receipt"
    | "page_map"
    | "source_analysis_input_manifest",
): string {
  const matches = identity.evidenceAnchors.filter(
    (anchor) => anchor.evidenceType === evidenceType,
  );
  if (matches.length !== 1) {
    fail(`identity artifact must contain exactly one ${evidenceType} anchor`);
  }
  const path = matches[0]!.locator;
  assertPortablePath(path, `${evidenceType} evidence path`);
  return path;
}

function sameFileIdentityAndSize(left: Stats, right: Stats): boolean {
  return (
    left.dev === right.dev && left.ino === right.ino && left.size === right.size
  );
}

function assertCanonicalDirectory(path: string, label: string): Stats {
  let stat: Stats;
  try {
    stat = lstatSync(path);
  } catch (error) {
    fail(`cannot inspect ${label} ${path}: ${(error as Error).message}`);
  }
  if (stat.isSymbolicLink() || !stat.isDirectory()) {
    fail(`${label} is a symlink or non-directory: ${path}`);
  }
  if (realpathSync(path) !== path) {
    fail(`${label} is not canonical: ${path}`);
  }
  return stat;
}

function fsyncDirectory(path: string): void {
  const before = assertCanonicalDirectory(path, "revision directory");
  let descriptor: number;
  try {
    descriptor = openSync(path, constants.O_RDONLY | O_DIRECTORY | O_NOFOLLOW);
  } catch (error) {
    fail(
      `cannot safely open revision directory ${path}: ${(error as Error).message}`,
    );
  }
  try {
    const opened = fstatSync(descriptor);
    const afterOpen = assertCanonicalDirectory(path, "revision directory");
    if (
      !opened.isDirectory() ||
      !sameFileIdentityAndSize(before, opened) ||
      !sameFileIdentityAndSize(opened, afterOpen)
    ) {
      fail(`revision directory changed while it was opened: ${path}`);
    }
    fsyncSync(descriptor);
    const afterSync = fstatSync(descriptor);
    const pathAfterSync = assertCanonicalDirectory(path, "revision directory");
    if (
      !sameFileIdentityAndSize(opened, afterSync) ||
      !sameFileIdentityAndSize(afterSync, pathAfterSync)
    ) {
      fail(`revision directory changed while it was synced: ${path}`);
    }
  } finally {
    closeSync(descriptor);
  }
}

function ensureCanonicalRevisionDirectoryTree(
  repositoryRoot: string,
  targetDirectory: string,
): void {
  const fromRoot = relative(repositoryRoot, targetDirectory);
  assertInsideRoot(repositoryRoot, targetDirectory, "revision directory");
  assertCanonicalDirectory(repositoryRoot, "repository root");
  let current = repositoryRoot;
  for (const segment of fromRoot.split(sep).filter(Boolean)) {
    current = resolve(current, segment);
    let created = false;
    try {
      const stat = lstatSync(current);
      if (stat.isSymbolicLink() || !stat.isDirectory()) {
        fail(
          "revision directory contains a non-directory or symlink component",
        );
      }
    } catch (error) {
      if (!isErrno(error, "ENOENT")) throw error;
      try {
        mkdirSync(current, { mode: PRIVATE_REVISION_DIRECTORY_MODE });
        created = true;
      } catch (mkdirError) {
        if (!isErrno(mkdirError, "EEXIST")) throw mkdirError;
      }
      const stat = lstatSync(current);
      if (stat.isSymbolicLink() || !stat.isDirectory()) {
        fail("revision directory creation collided with an unsafe path");
      }
    }
    if (realpathSync(current) !== current) {
      fail("revision directory must not traverse a symlink");
    }
    if (created) {
      fsyncDirectory(dirname(current));
      fsyncDirectory(current);
    }
  }
}

function assertSecureRevisionFileStat(stat: Stats, path: string): void {
  if (stat.isSymbolicLink() || !stat.isFile()) {
    fail(`revision output is not a regular non-symlink file: ${path}`);
  }
  if (stat.nlink !== 1) {
    fail(`revision output does not have exactly one hard link: ${path}`);
  }
  if ((stat.mode & 0o777) !== PRIVATE_REVISION_FILE_MODE) {
    fail(`revision output does not have private mode 0600: ${path}`);
  }
}

function existingRevisionStatus(
  absolutePath: string,
  bytes: Buffer,
): "unchanged" | null {
  let stat;
  try {
    stat = lstatSync(absolutePath);
  } catch (error) {
    if (isErrno(error, "ENOENT")) return null;
    throw error;
  }
  assertSecureRevisionFileStat(stat, absolutePath);

  let descriptor: number;
  try {
    descriptor = openSync(absolutePath, constants.O_RDONLY | O_NOFOLLOW);
  } catch (error) {
    fail(
      `cannot safely open revision output ${absolutePath}: ${(error as Error).message}`,
    );
  }
  try {
    const openedBefore = fstatSync(descriptor);
    const pathAfterOpen = lstatSync(absolutePath);
    assertSecureRevisionFileStat(openedBefore, absolutePath);
    assertSecureRevisionFileStat(pathAfterOpen, absolutePath);
    if (
      !sameFileIdentityAndSize(stat, openedBefore) ||
      !sameFileIdentityAndSize(openedBefore, pathAfterOpen)
    ) {
      fail(`revision output changed while it was opened: ${absolutePath}`);
    }

    const existing = readFileSync(descriptor);
    const openedAfter = fstatSync(descriptor);
    const pathAfterRead = lstatSync(absolutePath);
    assertSecureRevisionFileStat(openedAfter, absolutePath);
    assertSecureRevisionFileStat(pathAfterRead, absolutePath);
    if (
      !sameFileIdentityAndSize(openedBefore, openedAfter) ||
      !sameFileIdentityAndSize(openedAfter, pathAfterRead) ||
      existing.length !== openedAfter.size
    ) {
      fail(`revision output changed while it was read: ${absolutePath}`);
    }
    if (!existing.equals(bytes)) {
      fail(
        "content-addressed revision path already contains conflicting bytes",
      );
    }
  } finally {
    closeSync(descriptor);
  }
  return "unchanged";
}

function validateRevisionForWrite(
  revision: VerifiedSourceAnalysisInputManifestRevision,
): void {
  const manifest = verifySourceAnalysisInputManifest(revision.manifest);
  const expectedPath = sourceAnalysisVerifiedInputManifestPath({
    rawPdfSha256: manifest.processingUnit.rawPdfSha256,
    manifestSha256: manifest.manifestSha256,
  });
  if (revision.path !== expectedPath) {
    fail("revision path is not the exported content-addressed path");
  }
  if (!revision.bytes.equals(prettyManifestBytes(manifest))) {
    fail("revision bytes do not exactly serialize the sealed manifest");
  }
  if (!Object.values(manifest.readiness).every((value) => value === false)) {
    fail("revision readiness gates must all remain false");
  }
}

function predecessorInputManifestReference(
  manifest: SourceAnalysisInputManifest,
): Extract<
  SourceAnalysisInputManifest["workflowEligibility"],
  { state: "source_analysis_eligible" }
>["sourceAnalysis"]["predecessorInputManifestReference"] {
  if (manifest.workflowEligibility.state !== "source_analysis_eligible") {
    fail("revision does not contain a positive source-analysis eligibility");
  }
  return manifest.workflowEligibility.sourceAnalysis
    .predecessorInputManifestReference;
}

function publishVerifiedSourceAnalysisInputManifestRevision(
  repositoryRootValue: string,
  revision: VerifiedSourceAnalysisInputManifestRevision,
  creationInput: CreateVerifiedSourceAnalysisInputManifestRevisionInput,
): VerifiedSourceAnalysisInputManifestRevisionWriteResult {
  const repositoryRoot = realpathSync(resolve(repositoryRootValue));
  validateRevisionForWrite(revision);
  const predecessor = predecessorInputManifestReference(revision.manifest);
  const candidateManifestPath = creationInput.candidateManifestFile.path;
  if (candidateManifestPath !== predecessor.path) {
    fail(
      "candidate manifest path does not exactly equal the sealed predecessor reference",
    );
  }
  const candidateAbsolutePath = repositoryAbsolutePath(
    repositoryRoot,
    candidateManifestPath,
    "candidate manifest path",
  );
  const absolutePath = repositoryAbsolutePath(
    repositoryRoot,
    revision.path,
    "revision path",
  );
  if (candidateAbsolutePath === absolutePath) {
    fail("revision target is the immutable candidate manifest");
  }
  const onDiskCandidate = readExactRepositoryFile(
    repositoryRoot,
    candidateManifestPath,
    "candidate manifest predecessor",
  );
  const onDiskCandidateBytes = exactBytes(onDiskCandidate);
  const suppliedCandidateBytes = exactBytes(
    creationInput.candidateManifestFile,
  );
  if (!onDiskCandidateBytes.equals(suppliedCandidateBytes)) {
    fail(
      "candidate manifest predecessor bytes do not exactly match the validated creation input",
    );
  }
  const candidate = verifySourceAnalysisInputManifest(
    parseExactJson(onDiskCandidateBytes, "candidate manifest predecessor"),
  );
  if (
    predecessor.path !== onDiskCandidate.path ||
    predecessor.fileSha256 !== sha256(onDiskCandidateBytes) ||
    predecessor.manifestSha256 !== candidate.manifestSha256 ||
    predecessor.schemaVersion !== candidate.schemaVersion ||
    predecessor.pipelineVersion !== candidate.pipelineVersion
  ) {
    fail(
      "candidate manifest predecessor path, bytes, file hash, or internal seal does not match the sealed predecessor reference",
    );
  }
  if (realpathSync(candidateAbsolutePath) === absolutePath) {
    fail("revision target aliases the immutable candidate manifest");
  }

  const outputDirectory = dirname(absolutePath);
  ensureCanonicalRevisionDirectoryTree(repositoryRoot, outputDirectory);
  const existingStatus = existingRevisionStatus(absolutePath, revision.bytes);
  if (existingStatus) {
    return {
      status: existingStatus,
      repositoryPath: revision.path,
      absolutePath,
    };
  }

  const temporaryPath = resolve(
    outputDirectory,
    `.${basename(absolutePath)}.${randomUUID()}.tmp`,
  );
  if (dirname(temporaryPath) !== outputDirectory) {
    fail("temporary revision path escaped the canonical output directory");
  }
  let descriptor: number | null = null;
  let temporaryCreated = false;
  try {
    descriptor = openSync(
      temporaryPath,
      constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | O_NOFOLLOW,
      PRIVATE_REVISION_FILE_MODE,
    );
    temporaryCreated = true;
    fchmodSync(descriptor, PRIVATE_REVISION_FILE_MODE);
    writeFileSync(descriptor, revision.bytes);
    const temporaryStat = fstatSync(descriptor);
    assertSecureRevisionFileStat(temporaryStat, temporaryPath);
    if (temporaryStat.size !== revision.bytes.length) {
      fail("temporary revision size differs from the complete sealed bytes");
    }
    fsyncSync(descriptor);
    closeSync(descriptor);
    descriptor = null;

    try {
      ensureCanonicalRevisionDirectoryTree(repositoryRoot, outputDirectory);
      linkSync(temporaryPath, absolutePath);
      unlinkSync(temporaryPath);
      temporaryCreated = false;
      fsyncDirectory(outputDirectory);
      ensureCanonicalRevisionDirectoryTree(repositoryRoot, outputDirectory);
      if (!existingRevisionStatus(absolutePath, revision.bytes)) {
        fail("newly published revision disappeared before validation");
      }
      return {
        status: "created",
        repositoryPath: revision.path,
        absolutePath,
      };
    } catch (error) {
      if (!isErrno(error, "EEXIST")) throw error;
      ensureCanonicalRevisionDirectoryTree(repositoryRoot, outputDirectory);
      const racedStatus = existingRevisionStatus(absolutePath, revision.bytes);
      if (!racedStatus) fail("revision target disappeared during publication");
      return {
        status: racedStatus,
        repositoryPath: revision.path,
        absolutePath,
      };
    }
  } finally {
    if (descriptor !== null) closeSync(descriptor);
    if (temporaryCreated) {
      try {
        unlinkSync(temporaryPath);
        fsyncDirectory(outputDirectory);
      } catch (error) {
        if (!isErrno(error, "ENOENT")) throw error;
      }
    }
  }
}

/**
 * Creates and publishes one revision from the complete validated evidence
 * input. No public API accepts a prebuilt revision for publication.
 */
export function createAndWriteVerifiedSourceAnalysisInputManifestRevision(
  repositoryRoot: string,
  input: CreateVerifiedSourceAnalysisInputManifestRevisionInput,
): VerifiedSourceAnalysisInputManifestRevisionWriteResult & {
  manifestSha256: string;
} {
  const revision = createVerifiedSourceAnalysisInputManifestRevision(input);
  const result = publishVerifiedSourceAnalysisInputManifestRevision(
    repositoryRoot,
    revision,
    input,
  );
  return { ...result, manifestSha256: revision.manifest.manifestSha256 };
}

export function parseVerifiedSourceAnalysisInputManifestRevisionCliArgs(
  args: string[],
  cwd = process.cwd(),
): VerifiedSourceAnalysisInputManifestRevisionCliOptions {
  const values = new Map<string, string>();
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index];
    const value = args[index + 1];
    if (!flag || !CLI_VALUE_FLAGS.has(flag)) {
      fail(`unknown CLI argument ${flag ?? "<missing>"}`);
    }
    if (!value || value.startsWith("--")) {
      fail(`CLI argument ${flag} requires one value`);
    }
    if (values.has(flag)) fail(`CLI argument ${flag} was supplied twice`);
    values.set(flag, value);
  }

  const required = (flag: string): string => {
    const value = values.get(flag);
    if (!value) fail(`missing required CLI argument ${flag}`);
    return value;
  };
  const options = {
    repositoryRoot: resolve(cwd, values.get("--repository-root") ?? "."),
    candidateManifestPath: required("--candidate-manifest"),
    identityArtifactPath: required("--identity-artifact"),
    rawPdfPath: resolve(cwd, required("--raw-pdf")),
    identityVerificationPrestatePath: required(
      "--identity-verification-prestate",
    ),
    analysisPrestatePath: required("--analysis-prestate"),
  };
  assertPortablePath(options.candidateManifestPath, "candidate manifest path");
  assertPortablePath(options.identityArtifactPath, "identity artifact path");
  assertPortablePath(
    options.identityVerificationPrestatePath,
    "identity-verification pre-state path",
  );
  assertPortablePath(options.analysisPrestatePath, "analysis pre-state path");
  return options;
}

export function runVerifiedSourceAnalysisInputManifestRevisionCli(
  args: string[],
  cwd = process.cwd(),
): VerifiedSourceAnalysisInputManifestRevisionWriteResult & {
  manifestSha256: string;
} {
  const options = parseVerifiedSourceAnalysisInputManifestRevisionCliArgs(
    args,
    cwd,
  );
  const repositoryRoot = realpathSync(options.repositoryRoot);
  const candidateManifestFile = readExactRepositoryFile(
    repositoryRoot,
    options.candidateManifestPath,
    "candidate manifest",
  );
  const identityArtifactFile = readExactRepositoryFile(
    repositoryRoot,
    options.identityArtifactPath,
    "identity artifact",
  );
  const identityValue = parseExactJson(
    exactBytes(identityArtifactFile),
    "identity artifact",
  );
  const identity = validateSourceIdentityVerificationArtifact(identityValue);
  const acquisitionReceiptFile = readExactRepositoryFile(
    repositoryRoot,
    requiredIdentityEvidencePath(identity, "source_acquisition_receipt"),
    "acquisition receipt evidence",
  );
  const extractionReceiptFile = readExactRepositoryFile(
    repositoryRoot,
    requiredIdentityEvidencePath(identity, "extraction_receipt"),
    "extraction receipt evidence",
  );
  const pageMapFile = readExactRepositoryFile(
    repositoryRoot,
    requiredIdentityEvidencePath(identity, "page_map"),
    "page-map evidence",
  );
  const sourceAnalysisInputManifestFile = readExactRepositoryFile(
    repositoryRoot,
    requiredIdentityEvidencePath(identity, "source_analysis_input_manifest"),
    "source-analysis input-manifest evidence",
  );
  const workflowFile = readExactRepositoryFile(
    repositoryRoot,
    SOURCE_IDENTITY_WORKFLOW_PATH,
    "identity workflow evidence",
  );
  const promptTemplateFile = readExactRepositoryFile(
    repositoryRoot,
    SOURCE_IDENTITY_PROMPT_TEMPLATE_PATH,
    "identity prompt-template evidence",
  );
  const identityVerificationPrestateFile = readExactRepositoryFile(
    repositoryRoot,
    options.identityVerificationPrestatePath,
    "identity-verification pre-state",
  );
  const analysisPrestateFile = readExactRepositoryFile(
    repositoryRoot,
    options.analysisPrestatePath,
    "analysis pre-state",
  );
  return createAndWriteVerifiedSourceAnalysisInputManifestRevision(
    repositoryRoot,
    {
      candidateManifestFile,
      identityArtifactFile,
      evidenceBundle: {
        acquisitionReceiptFile,
        rawContentBytes: readExactPhysicalFile(options.rawPdfPath, "raw PDF"),
        extractionReceiptFile,
        pageMapFile,
        sourceAnalysisInputManifestFile,
        workflowFile,
        promptTemplateFile,
      },
      identityVerificationPrestate: parseExactJson(
        exactBytes(identityVerificationPrestateFile),
        "identity-verification pre-state",
      ),
      analysisPrestate: parseExactJson(
        exactBytes(analysisPrestateFile),
        "analysis pre-state",
      ),
    },
  );
}

function main(): void {
  const result = runVerifiedSourceAnalysisInputManifestRevisionCli(
    process.argv.slice(2),
  );
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  main();
}
