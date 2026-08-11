import { randomUUID } from "node:crypto";
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
import {
  basename,
  dirname,
  isAbsolute,
  relative,
  resolve,
  sep,
} from "node:path";
import { pathToFileURL } from "node:url";

import {
  sealSourceAnalysisArtifact,
  validateSourceAnalysisArtifact,
  validateSourceAnalysisArtifactWithEvidenceBundle,
  type SourceAnalysisArtifact,
  type SourceAnalysisArtifactFile,
  type SourceAnalysisExecutionEvidenceInputs,
} from "../../src/lib/knowledge/source-analysis-artifact";
import { isPortableRepositoryRelativePath } from "../../src/lib/knowledge/source-analysis-input-manifest";
import type { SourceIdentityVerificationEvidenceBundle } from "../../src/lib/knowledge/source-identity-verification";

export const SOURCE_ANALYSIS_ARTIFACT_SEALER_CONFIG_VERSION =
  "seal-source-analysis-artifact-config-v1" as const;
export const SOURCE_ANALYSIS_ARTIFACT_DIRECTORY =
  "knowledge/corpus/source-analysis/artifacts" as const;
export const SOURCE_ANALYSIS_ARTIFACT_FILE_SUFFIX =
  ".source-analysis.v1.json" as const;

const PRIVATE_ARTIFACT_MODE = 0o600;
const PRIVATE_DIRECTORY_MODE = 0o700;
const O_NOFOLLOW = constants.O_NOFOLLOW ?? 0;
const O_DIRECTORY = constants.O_DIRECTORY ?? 0;
const PREFIXED_SHA256 = /^sha256:[a-f0-9]{64}$/;

export type UnsealedSourceAnalysisArtifact = Omit<
  SourceAnalysisArtifact,
  "artifactSha256"
>;

export type CompleteSourceAnalysisEvidence = {
  predecessorInputManifestFile: SourceAnalysisArtifactFile;
  inputManifestFile: SourceAnalysisArtifactFile;
  identityArtifactFile: SourceAnalysisArtifactFile;
  identityVerificationPrestate: unknown;
  analysisPrestate: unknown;
  identityEvidenceBundle: SourceIdentityVerificationEvidenceBundle;
  predecessorAnalysisArtifactFile: SourceAnalysisArtifactFile | null;
  relatedAnalysisArtifactFiles: readonly SourceAnalysisArtifactFile[];
} & SourceAnalysisExecutionEvidenceInputs;

export type SealSourceAnalysisArtifactInput = {
  artifactBody: UnsealedSourceAnalysisArtifact;
  evidence: CompleteSourceAnalysisEvidence;
};

export type PreparedSourceAnalysisArtifact = {
  artifact: SourceAnalysisArtifact;
  bytes: Buffer;
  repositoryPath: string;
  fileName: string;
};

export type SealedSourceAnalysisArtifactWriteResult =
  PreparedSourceAnalysisArtifact & {
    absolutePath: string;
    status: "created" | "unchanged";
  };

type NormalizedPageConfig = {
  pageNumber: number;
  filePath: string;
};

type StablePhysicalFileSnapshot = {
  absolutePath: string;
  label: string;
  bytes: Buffer;
  stat: Stats;
};

type CanonicalDirectoryBinding = {
  path: string;
  label: string;
  device: number;
  inode: number;
  mode: number;
};

export type SourceAnalysisArtifactSealerRuntimeHooks = {
  beforeCollectiveInputRevalidation?: () => void;
};

export type SourceAnalysisArtifactSealerConfig = {
  schemaVersion: typeof SOURCE_ANALYSIS_ARTIFACT_SEALER_CONFIG_VERSION;
  repositoryRoot: string;
  artifactBodyFile: string;
  identityVerificationPrestateFile: string;
  analysisPrestateFile: string;
  evidenceFiles: {
    acquisitionReceiptPath: string;
    rawPdfFile: string;
    extractionReceiptPath: string;
    pageMapPath: string;
    predecessorInputManifestPath: string;
    inputManifestPath: string;
    identityArtifactPath: string;
    identityWorkflowPath: string;
    identityPromptTemplatePath: string;
    analysisWorkflowPath: string;
    analysisPromptTemplatePath: string;
    predecessorAnalysisArtifactPath: string | null;
    relatedAnalysisArtifactPaths: string[];
    normalizedPages: NormalizedPageConfig[];
  };
};

function fail(message: string): never {
  throw new Error(`Source-analysis artifact sealer failed: ${message}`);
}

function isErrno(error: unknown, code: string): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === code
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactKeys(
  value: Record<string, unknown>,
  expected: readonly string[],
  label: string,
): void {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
    fail(`${label} must contain exactly: ${wanted.join(", ")}`);
  }
}

function requiredString(
  value: Record<string, unknown>,
  key: string,
  label: string,
): string {
  const result = value[key];
  if (typeof result !== "string" || result.length === 0) {
    fail(`${label}.${key} must be a non-empty string`);
  }
  return result;
}

function requirePortablePath(value: string, label: string): string {
  if (!isPortableRepositoryRelativePath(value)) {
    fail(`${label} must be a portable repository-relative path`);
  }
  return value;
}

function parseNormalizedPages(value: unknown): NormalizedPageConfig[] {
  if (!Array.isArray(value) || value.length === 0) {
    fail("config.evidenceFiles.normalizedPages must be a non-empty array");
  }
  const pages = value.map((item, index) => {
    const label = `config.evidenceFiles.normalizedPages[${index}]`;
    if (!isRecord(item)) fail(`${label} must be an object`);
    exactKeys(item, ["pageNumber", "filePath"], label);
    if (!Number.isInteger(item.pageNumber) || Number(item.pageNumber) <= 0) {
      fail(`${label}.pageNumber must be a positive integer`);
    }
    return {
      pageNumber: Number(item.pageNumber),
      filePath: requiredString(item, "filePath", label),
    };
  });
  if (new Set(pages.map((page) => page.pageNumber)).size !== pages.length) {
    fail("config.evidenceFiles.normalizedPages has duplicate page numbers");
  }
  return pages;
}

function parseRepositoryPathList(value: unknown, label: string): string[] {
  if (!Array.isArray(value)) fail(`${label} must be an array`);
  const paths = value.map((item, index) => {
    if (typeof item !== "string" || item.length === 0) {
      fail(`${label}[${index}] must be a non-empty string`);
    }
    return requirePortablePath(item, `${label}[${index}]`);
  });
  if (new Set(paths).size !== paths.length) {
    fail(`${label} must not contain duplicate paths`);
  }
  return paths;
}

export function parseSourceAnalysisArtifactSealerConfig(
  value: unknown,
): SourceAnalysisArtifactSealerConfig {
  if (!isRecord(value)) fail("config must be an object");
  exactKeys(
    value,
    [
      "schemaVersion",
      "repositoryRoot",
      "artifactBodyFile",
      "identityVerificationPrestateFile",
      "analysisPrestateFile",
      "evidenceFiles",
    ],
    "config",
  );
  if (value.schemaVersion !== SOURCE_ANALYSIS_ARTIFACT_SEALER_CONFIG_VERSION) {
    fail(
      `config.schemaVersion must be ${SOURCE_ANALYSIS_ARTIFACT_SEALER_CONFIG_VERSION}`,
    );
  }
  if (!isRecord(value.evidenceFiles)) {
    fail("config.evidenceFiles must be an object");
  }
  const evidence = value.evidenceFiles;
  exactKeys(
    evidence,
    [
      "acquisitionReceiptPath",
      "rawPdfFile",
      "extractionReceiptPath",
      "pageMapPath",
      "predecessorInputManifestPath",
      "inputManifestPath",
      "identityArtifactPath",
      "identityWorkflowPath",
      "identityPromptTemplatePath",
      "analysisWorkflowPath",
      "analysisPromptTemplatePath",
      "predecessorAnalysisArtifactPath",
      "relatedAnalysisArtifactPaths",
      "normalizedPages",
    ],
    "config.evidenceFiles",
  );
  const repositoryPath = (key: string): string =>
    requirePortablePath(
      requiredString(evidence, key, "config.evidenceFiles"),
      `config.evidenceFiles.${key}`,
    );
  const predecessorAnalysisArtifactPath =
    evidence.predecessorAnalysisArtifactPath === null
      ? null
      : requirePortablePath(
          requiredString(
            evidence,
            "predecessorAnalysisArtifactPath",
            "config.evidenceFiles",
          ),
          "config.evidenceFiles.predecessorAnalysisArtifactPath",
        );
  const relatedAnalysisArtifactPaths = parseRepositoryPathList(
    evidence.relatedAnalysisArtifactPaths,
    "config.evidenceFiles.relatedAnalysisArtifactPaths",
  );
  if (
    predecessorAnalysisArtifactPath !== null &&
    relatedAnalysisArtifactPaths.includes(predecessorAnalysisArtifactPath)
  ) {
    fail(
      "config cannot reuse the revision predecessor as a related analysis artifact",
    );
  }
  return {
    schemaVersion: SOURCE_ANALYSIS_ARTIFACT_SEALER_CONFIG_VERSION,
    repositoryRoot: requiredString(value, "repositoryRoot", "config"),
    artifactBodyFile: requiredString(value, "artifactBodyFile", "config"),
    identityVerificationPrestateFile: requiredString(
      value,
      "identityVerificationPrestateFile",
      "config",
    ),
    analysisPrestateFile: requiredString(
      value,
      "analysisPrestateFile",
      "config",
    ),
    evidenceFiles: {
      acquisitionReceiptPath: repositoryPath("acquisitionReceiptPath"),
      rawPdfFile: requiredString(
        evidence,
        "rawPdfFile",
        "config.evidenceFiles",
      ),
      extractionReceiptPath: repositoryPath("extractionReceiptPath"),
      pageMapPath: repositoryPath("pageMapPath"),
      predecessorInputManifestPath: repositoryPath(
        "predecessorInputManifestPath",
      ),
      inputManifestPath: repositoryPath("inputManifestPath"),
      identityArtifactPath: repositoryPath("identityArtifactPath"),
      identityWorkflowPath: repositoryPath("identityWorkflowPath"),
      identityPromptTemplatePath: repositoryPath("identityPromptTemplatePath"),
      analysisWorkflowPath: repositoryPath("analysisWorkflowPath"),
      analysisPromptTemplatePath: repositoryPath("analysisPromptTemplatePath"),
      predecessorAnalysisArtifactPath,
      relatedAnalysisArtifactPaths,
      normalizedPages: parseNormalizedPages(evidence.normalizedPages),
    },
  };
}

function exactBytes(value: Buffer | string): Buffer {
  return Buffer.isBuffer(value)
    ? Buffer.from(value)
    : Buffer.from(value, "utf8");
}

function parseJson(bytes: Buffer, label: string): unknown {
  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch (error) {
    fail(`${label} is not valid JSON or UTF-8: ${(error as Error).message}`);
  }
}

export function sourceAnalysisArtifactRepositoryPath(
  artifactSha256: string,
): string {
  if (!PREFIXED_SHA256.test(artifactSha256)) {
    fail("artifact seal must be a prefixed lowercase SHA-256");
  }
  return `${SOURCE_ANALYSIS_ARTIFACT_DIRECTORY}/${artifactSha256.slice(
    "sha256:".length,
  )}${SOURCE_ANALYSIS_ARTIFACT_FILE_SUFFIX}`;
}

function validateContentAddressedAnalysisArtifactFile(
  file: SourceAnalysisArtifactFile,
  label: string,
): SourceAnalysisArtifact {
  if (!isRecord(file)) fail(`${label} evidence must be an object`);
  exactKeys(file, ["path", "bytes"], `${label} evidence`);
  if (typeof file.path !== "string" || file.path.length === 0) {
    fail(`${label} path must be a non-empty string`);
  }
  if (!Buffer.isBuffer(file.bytes) && typeof file.bytes !== "string") {
    fail(`${label} bytes must be a Buffer or UTF-8 string`);
  }
  requirePortablePath(file.path, `${label} path`);
  const bytes = exactBytes(file.bytes);
  const artifact = validateSourceAnalysisArtifact(parseJson(bytes, label));
  const expectedPath = sourceAnalysisArtifactRepositoryPath(
    artifact.artifactSha256,
  );
  if (file.path !== expectedPath) {
    fail(
      `${label} must use the content-addressed repository path ${expectedPath}`,
    );
  }
  const canonicalBytes = Buffer.from(
    `${JSON.stringify(artifact, null, 2)}\n`,
    "utf8",
  );
  if (!bytes.equals(canonicalBytes)) {
    fail(`${label} bytes must use the exact canonical artifact serialization`);
  }
  return artifact;
}

function validateSourceAnalysisArtifactDependencies(
  artifact: SourceAnalysisArtifact,
  evidence: CompleteSourceAnalysisEvidence,
): void {
  if (
    !Object.prototype.hasOwnProperty.call(
      evidence,
      "predecessorAnalysisArtifactFile",
    )
  ) {
    fail("analysis evidence must explicitly declare its revision predecessor");
  }
  if (!Array.isArray(evidence.relatedAnalysisArtifactFiles)) {
    fail(
      "analysis evidence must supply a related analysis artifact file array",
    );
  }
  const predecessorFile = evidence.predecessorAnalysisArtifactFile;
  let predecessor: SourceAnalysisArtifact | null = null;
  if (artifact.continuity.kind === "initial") {
    if (predecessorFile !== null) {
      fail("initial analysis must not supply a revision predecessor artifact");
    }
  } else {
    if (predecessorFile === null) {
      fail("revision analysis requires its predecessor analysis artifact file");
    }
    predecessor = validateContentAddressedAnalysisArtifactFile(
      predecessorFile,
      "revision predecessor analysis artifact",
    );
    if (
      artifact.continuity.predecessorArtifactId !== predecessor.artifactId ||
      artifact.continuity.predecessorArtifactVersion !==
        predecessor.artifactVersion ||
      artifact.continuity.predecessorArtifactSha256 !==
        predecessor.artifactSha256
    ) {
      fail(
        "revision continuity does not match the exact predecessor artifact ID, version and hash",
      );
    }
    if (
      artifact.lineageId !== predecessor.lineageId ||
      artifact.binding.sourceId !== predecessor.binding.sourceId
    ) {
      fail(
        "revision predecessor must belong to the same analysis lineage and source",
      );
    }
  }

  const relatedPaths = evidence.relatedAnalysisArtifactFiles.map(
    (file) => file.path,
  );
  if (new Set(relatedPaths).size !== relatedPaths.length) {
    fail("related analysis artifact files must not contain duplicate paths");
  }
  if (predecessorFile !== null && relatedPaths.includes(predecessorFile.path)) {
    fail(
      "revision predecessor cannot also be supplied as a related analysis artifact",
    );
  }

  const relatedBySeal = new Map<string, SourceAnalysisArtifact>();
  for (const [index, file] of evidence.relatedAnalysisArtifactFiles.entries()) {
    const related = validateContentAddressedAnalysisArtifactFile(
      file,
      `related analysis artifact ${index + 1}`,
    );
    if (
      related.artifactSha256 === artifact.artifactSha256 ||
      related.binding.sourceId === artifact.binding.sourceId
    ) {
      fail(
        `related analysis artifact ${index + 1} must be a different source artifact`,
      );
    }
    if (relatedBySeal.has(related.artifactSha256)) {
      fail("related analysis artifact files contain a duplicate artifact hash");
    }
    relatedBySeal.set(related.artifactSha256, related);
  }

  const references = [
    ...artifact.analysis.reconciliation.corroborations,
    ...artifact.analysis.reconciliation.contradictions,
  ].flatMap((finding) =>
    finding.otherSourceEvidence.map((reference) => ({
      findingId: finding.findingId,
      reference,
    })),
  );
  const usedRelatedSeals = new Set<string>();
  for (const { findingId, reference } of references) {
    const related = relatedBySeal.get(reference.analysisArtifactSha256);
    if (!related) {
      fail(
        `cross-source finding ${findingId} is missing its related content-addressed analysis artifact file`,
      );
    }
    if (
      reference.sourceId !== related.binding.sourceId ||
      reference.sourceContentSha256 !== related.binding.sourceContentSha256 ||
      reference.analysisArtifactId !== related.artifactId ||
      reference.analysisArtifactVersion !== related.artifactVersion ||
      reference.analysisArtifactSha256 !== related.artifactSha256
    ) {
      fail(
        `cross-source finding ${findingId} does not match the related source, content hash, artifact ID, version and hash`,
      );
    }
    if (new Set(reference.locatorIds).size !== reference.locatorIds.length) {
      fail(
        `cross-source finding ${findingId} has duplicate related locator IDs`,
      );
    }
    const relatedLocatorIds = new Set(
      related.locators.map((locator) => locator.locatorId),
    );
    for (const locatorId of reference.locatorIds) {
      if (!relatedLocatorIds.has(locatorId)) {
        fail(
          `cross-source finding ${findingId} references missing related locator ${locatorId}`,
        );
      }
    }
    usedRelatedSeals.add(related.artifactSha256);
  }
  for (const seal of relatedBySeal.keys()) {
    if (!usedRelatedSeals.has(seal)) {
      fail(`related analysis artifact ${seal} is supplied but unused`);
    }
  }
}

/**
 * Adds only the artifact seal and validates the complete authorization bundle.
 * It never creates evidence, repairs AI output, or changes lifecycle state.
 */
export function prepareSourceAnalysisArtifact(
  input: SealSourceAnalysisArtifactInput,
): PreparedSourceAnalysisArtifact {
  if (
    !isRecord(input.artifactBody) ||
    Object.prototype.hasOwnProperty.call(input.artifactBody, "artifactSha256")
  ) {
    fail("artifactBody must be an explicitly unsealed semantic artifact body");
  }
  const artifact = sealSourceAnalysisArtifact(input.artifactBody);
  validateSourceAnalysisArtifactWithEvidenceBundle(artifact, input.evidence);
  validateSourceAnalysisArtifactDependencies(artifact, input.evidence);
  const repositoryPath = sourceAnalysisArtifactRepositoryPath(
    artifact.artifactSha256,
  );
  return {
    artifact,
    bytes: Buffer.from(`${JSON.stringify(artifact, null, 2)}\n`, "utf8"),
    repositoryPath,
    fileName: basename(repositoryPath),
  };
}

function sameFileIdentityAndSize(left: Stats, right: Stats): boolean {
  return (
    left.dev === right.dev && left.ino === right.ino && left.size === right.size
  );
}

function canonicalRepositoryRoot(value: string): string {
  if (!isAbsolute(value)) fail("repositoryRoot must be an absolute path");
  const absolute = resolve(value);
  let canonical: string;
  try {
    canonical = realpathSync(absolute);
  } catch (error) {
    fail(`cannot resolve repositoryRoot: ${(error as Error).message}`);
  }
  if (canonical !== absolute) {
    fail("repositoryRoot must be canonical and must not traverse a symlink");
  }
  const stat = lstatSync(canonical);
  if (stat.isSymbolicLink() || !stat.isDirectory()) {
    fail("repositoryRoot must be a regular non-symlink directory");
  }
  return canonical;
}

function assertInsideRepository(
  repositoryRoot: string,
  absolutePath: string,
  label: string,
): void {
  const fromRoot = relative(repositoryRoot, absolutePath);
  if (
    fromRoot === "" ||
    fromRoot === ".." ||
    fromRoot.startsWith(`..${sep}`) ||
    resolve(repositoryRoot, fromRoot) !== absolutePath
  ) {
    fail(`${label} escapes the repository root`);
  }
}

function repositoryAbsolutePath(
  repositoryRoot: string,
  repositoryPath: string,
  label: string,
): string {
  requirePortablePath(repositoryPath, label);
  const absolutePath = resolve(repositoryRoot, repositoryPath);
  assertInsideRepository(repositoryRoot, absolutePath, label);
  return absolutePath;
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

function captureCanonicalDirectoryBinding(
  path: string,
  label: string,
): CanonicalDirectoryBinding {
  const stat = assertCanonicalDirectory(path, label);
  return {
    path,
    label,
    device: stat.dev,
    inode: stat.ino,
    mode: stat.mode,
  };
}

function assertCanonicalDirectoryBindingUnchanged(
  binding: CanonicalDirectoryBinding,
): void {
  const current = assertCanonicalDirectory(binding.path, binding.label);
  if (
    current.dev !== binding.device ||
    current.ino !== binding.inode ||
    current.mode !== binding.mode
  ) {
    fail(`${binding.label} changed physical identity during publication`);
  }
}

function fsyncDirectory(path: string): void {
  const before = assertCanonicalDirectory(path, "artifact directory");
  let descriptor: number;
  try {
    descriptor = openSync(path, constants.O_RDONLY | O_DIRECTORY | O_NOFOLLOW);
  } catch (error) {
    fail(
      `cannot safely open artifact directory ${path}: ${(error as Error).message}`,
    );
  }
  try {
    const opened = fstatSync(descriptor);
    const afterOpen = assertCanonicalDirectory(path, "artifact directory");
    if (
      !opened.isDirectory() ||
      !sameFileIdentityAndSize(before, opened) ||
      !sameFileIdentityAndSize(opened, afterOpen)
    ) {
      fail(`artifact directory changed while it was opened: ${path}`);
    }
    fsyncSync(descriptor);
    const afterSync = fstatSync(descriptor);
    const pathAfterSync = assertCanonicalDirectory(path, "artifact directory");
    if (
      !sameFileIdentityAndSize(opened, afterSync) ||
      !sameFileIdentityAndSize(afterSync, pathAfterSync)
    ) {
      fail(`artifact directory changed while it was synced: ${path}`);
    }
  } finally {
    closeSync(descriptor);
  }
}

function ensureCanonicalArtifactDirectoryTree(
  repositoryRoot: string,
  targetDirectory: string,
): void {
  assertInsideRepository(repositoryRoot, targetDirectory, "artifact directory");
  assertCanonicalDirectory(repositoryRoot, "repository root");
  const fromRoot = relative(repositoryRoot, targetDirectory);
  let current = repositoryRoot;
  for (const segment of fromRoot.split(sep).filter(Boolean)) {
    current = resolve(current, segment);
    let created = false;
    try {
      const stat = lstatSync(current);
      if (stat.isSymbolicLink() || !stat.isDirectory()) {
        fail(
          "artifact directory contains a symlinked or non-directory component",
        );
      }
    } catch (error) {
      if (!isErrno(error, "ENOENT")) throw error;
      try {
        mkdirSync(current, { mode: PRIVATE_DIRECTORY_MODE });
        created = true;
      } catch (mkdirError) {
        if (!isErrno(mkdirError, "EEXIST")) throw mkdirError;
      }
      const stat = lstatSync(current);
      if (stat.isSymbolicLink() || !stat.isDirectory()) {
        fail("artifact directory creation collided with an unsafe path");
      }
    }
    if (realpathSync(current) !== current) {
      fail("artifact directory must not traverse a symlink");
    }
    if (created) {
      fsyncDirectory(dirname(current));
      fsyncDirectory(current);
    }
  }
}

function assertSecureArtifactFileStat(stat: Stats, path: string): void {
  if (stat.isSymbolicLink() || !stat.isFile()) {
    fail(`artifact output is not a regular non-symlink file: ${path}`);
  }
  if (stat.nlink !== 1) {
    fail(`artifact output does not have exactly one hard link: ${path}`);
  }
  if ((stat.mode & 0o777) !== PRIVATE_ARTIFACT_MODE) {
    fail(`artifact output does not have private mode 0600: ${path}`);
  }
}

function existingArtifactStatus(
  absolutePath: string,
  expected: Buffer,
): "unchanged" | null {
  let before: Stats;
  try {
    before = lstatSync(absolutePath);
  } catch (error) {
    if (isErrno(error, "ENOENT")) return null;
    throw error;
  }
  assertSecureArtifactFileStat(before, absolutePath);

  let descriptor: number;
  try {
    descriptor = openSync(absolutePath, constants.O_RDONLY | O_NOFOLLOW);
  } catch (error) {
    fail(
      `cannot safely open artifact output ${absolutePath}: ${(error as Error).message}`,
    );
  }
  try {
    const openedBefore = fstatSync(descriptor);
    const pathAfterOpen = lstatSync(absolutePath);
    assertSecureArtifactFileStat(openedBefore, absolutePath);
    assertSecureArtifactFileStat(pathAfterOpen, absolutePath);
    if (
      !sameFileIdentityAndSize(before, openedBefore) ||
      !sameFileIdentityAndSize(openedBefore, pathAfterOpen)
    ) {
      fail(`artifact output changed while it was opened: ${absolutePath}`);
    }
    const existing = readFileSync(descriptor);
    const openedAfter = fstatSync(descriptor);
    const pathAfterRead = lstatSync(absolutePath);
    assertSecureArtifactFileStat(openedAfter, absolutePath);
    assertSecureArtifactFileStat(pathAfterRead, absolutePath);
    if (
      !sameFileIdentityAndSize(openedBefore, openedAfter) ||
      !sameFileIdentityAndSize(openedAfter, pathAfterRead) ||
      existing.length !== openedAfter.size
    ) {
      fail(`artifact output changed while it was read: ${absolutePath}`);
    }
    if (!existing.equals(expected)) {
      fail("content-addressed artifact path contains conflicting bytes");
    }
  } finally {
    closeSync(descriptor);
  }
  return "unchanged";
}

/**
 * Publishes only to the repository path derived from the validated artifact
 * seal. Existing identical bytes are idempotent; all conflicts fail closed.
 */
export function sealAndWriteSourceAnalysisArtifact(
  repositoryRootValue: string,
  input: SealSourceAnalysisArtifactInput,
  beforePublication?: () => void,
): SealedSourceAnalysisArtifactWriteResult {
  const repositoryRoot = canonicalRepositoryRoot(repositoryRootValue);
  const prepared = prepareSourceAnalysisArtifact(input);
  const absolutePath = repositoryAbsolutePath(
    repositoryRoot,
    prepared.repositoryPath,
    "derived artifact path",
  );
  const outputDirectory = dirname(absolutePath);
  ensureCanonicalArtifactDirectoryTree(repositoryRoot, outputDirectory);
  const outputDirectoryBinding = captureCanonicalDirectoryBinding(
    outputDirectory,
    "artifact output directory",
  );
  const existing = existingArtifactStatus(absolutePath, prepared.bytes);
  if (existing) {
    beforePublication?.();
    assertCanonicalDirectoryBindingUnchanged(outputDirectoryBinding);
    const revalidated = existingArtifactStatus(absolutePath, prepared.bytes);
    if (!revalidated) {
      fail("existing artifact disappeared during input revalidation");
    }
    assertCanonicalDirectoryBindingUnchanged(outputDirectoryBinding);
    return { ...prepared, absolutePath, status: revalidated };
  }

  const temporaryPath = resolve(
    outputDirectory,
    `.${basename(absolutePath)}.${randomUUID()}.tmp`,
  );
  if (dirname(temporaryPath) !== outputDirectory) {
    fail("temporary artifact path escaped the canonical output directory");
  }
  let descriptor: number | null = null;
  let temporaryCreated = false;
  try {
    descriptor = openSync(
      temporaryPath,
      constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | O_NOFOLLOW,
      PRIVATE_ARTIFACT_MODE,
    );
    temporaryCreated = true;
    fchmodSync(descriptor, PRIVATE_ARTIFACT_MODE);
    writeFileSync(descriptor, prepared.bytes);
    const temporaryStat = fstatSync(descriptor);
    assertSecureArtifactFileStat(temporaryStat, temporaryPath);
    if (temporaryStat.size !== prepared.bytes.length) {
      fail("temporary artifact size differs from the complete sealed bytes");
    }
    fsyncSync(descriptor);
    closeSync(descriptor);
    descriptor = null;

    try {
      ensureCanonicalArtifactDirectoryTree(repositoryRoot, outputDirectory);
      beforePublication?.();
      assertCanonicalDirectoryBindingUnchanged(outputDirectoryBinding);
      linkSync(temporaryPath, absolutePath);
      unlinkSync(temporaryPath);
      temporaryCreated = false;
      fsyncDirectory(outputDirectory);
      ensureCanonicalArtifactDirectoryTree(repositoryRoot, outputDirectory);
      assertCanonicalDirectoryBindingUnchanged(outputDirectoryBinding);
      if (!existingArtifactStatus(absolutePath, prepared.bytes)) {
        fail("new artifact disappeared before post-publication validation");
      }
      return { ...prepared, absolutePath, status: "created" };
    } catch (error) {
      if (!isErrno(error, "EEXIST")) throw error;
      ensureCanonicalArtifactDirectoryTree(repositoryRoot, outputDirectory);
      assertCanonicalDirectoryBindingUnchanged(outputDirectoryBinding);
      const raced = existingArtifactStatus(absolutePath, prepared.bytes);
      if (!raced) fail("artifact target disappeared during publication");
      return { ...prepared, absolutePath, status: raced };
    }
  } finally {
    if (descriptor !== null) closeSync(descriptor);
    if (temporaryCreated) {
      let controlledDirectoryStillBound = false;
      try {
        assertCanonicalDirectoryBindingUnchanged(outputDirectoryBinding);
        controlledDirectoryStillBound = true;
      } catch {
        // A moved/replaced directory cannot be cleaned safely through its old
        // path. Leave the temporary file for controlled inspection.
      }
      if (controlledDirectoryStillBound) {
        try {
          unlinkSync(temporaryPath);
          fsyncDirectory(outputDirectory);
        } catch (error) {
          if (!isErrno(error, "ENOENT")) throw error;
        }
      }
    }
  }
}

function resolvePhysical(configDirectory: string, value: string): string {
  return isAbsolute(value) ? resolve(value) : resolve(configDirectory, value);
}

function assertSecureInputFileStat(stat: Stats, label: string): void {
  if (stat.isSymbolicLink() || !stat.isFile()) {
    fail(`${label} must be a regular non-symlink file`);
  }
  if (stat.nlink !== 1) {
    fail(`${label} must have exactly one hard link`);
  }
  if ((stat.mode & 0o022) !== 0) {
    fail(`${label} must not be group-writable or world-writable`);
  }
}

function sameStableInputFileState(left: Stats, right: Stats): boolean {
  return (
    left.dev === right.dev &&
    left.ino === right.ino &&
    left.size === right.size &&
    left.nlink === right.nlink &&
    (left.mode & 0o7777) === (right.mode & 0o7777) &&
    left.mtimeMs === right.mtimeMs &&
    left.ctimeMs === right.ctimeMs
  );
}

function readStablePhysicalFileSnapshot(
  pathValue: string,
  label: string,
): StablePhysicalFileSnapshot {
  const absolutePath = resolve(pathValue);
  let before: Stats;
  try {
    before = lstatSync(absolutePath);
  } catch (error) {
    if (isErrno(error, "ENOENT")) fail(`${label} does not exist`);
    throw error;
  }
  assertSecureInputFileStat(before, label);
  if (realpathSync(absolutePath) !== absolutePath) {
    fail(`${label} must not traverse a symlink`);
  }
  let descriptor: number;
  try {
    descriptor = openSync(absolutePath, constants.O_RDONLY | O_NOFOLLOW);
  } catch (error) {
    fail(`cannot safely open ${label}: ${(error as Error).message}`);
  }
  try {
    const openedBefore = fstatSync(descriptor);
    const pathAfterOpen = lstatSync(absolutePath);
    assertSecureInputFileStat(openedBefore, label);
    assertSecureInputFileStat(pathAfterOpen, label);
    if (
      !sameStableInputFileState(before, openedBefore) ||
      !sameStableInputFileState(openedBefore, pathAfterOpen)
    ) {
      fail(`${label} changed while it was opened`);
    }
    const bytes = readFileSync(descriptor);
    const openedAfter = fstatSync(descriptor);
    const pathAfterRead = lstatSync(absolutePath);
    assertSecureInputFileStat(openedAfter, label);
    assertSecureInputFileStat(pathAfterRead, label);
    if (
      !sameStableInputFileState(openedBefore, openedAfter) ||
      !sameStableInputFileState(openedAfter, pathAfterRead) ||
      bytes.length !== openedAfter.size
    ) {
      fail(`${label} changed while it was read`);
    }
    return {
      absolutePath,
      label,
      bytes,
      stat: openedAfter,
    };
  } finally {
    closeSync(descriptor);
  }
}

function readStablePhysicalFile(pathValue: string, label: string): Buffer {
  return readStablePhysicalFileSnapshot(pathValue, label).bytes;
}

function revalidateStablePhysicalFileSet(
  snapshots: Iterable<StablePhysicalFileSnapshot>,
): void {
  for (const snapshot of snapshots) {
    const current = readStablePhysicalFileSnapshot(
      snapshot.absolutePath,
      snapshot.label,
    );
    if (
      !sameStableInputFileState(snapshot.stat, current.stat) ||
      !snapshot.bytes.equals(current.bytes)
    ) {
      fail(`${snapshot.label} drifted after the collective input set was read`);
    }
  }
}

function readStableRepositoryFile(
  repositoryRoot: string,
  repositoryPath: string,
  label: string,
  readPhysicalFile: (
    path: string,
    label: string,
  ) => Buffer = readStablePhysicalFile,
): SourceAnalysisArtifactFile {
  const absolutePath = repositoryAbsolutePath(
    repositoryRoot,
    repositoryPath,
    label,
  );
  return {
    path: repositoryPath,
    bytes: readPhysicalFile(absolutePath, label),
  };
}

export function runSourceAnalysisArtifactSealerConfig(
  config: SourceAnalysisArtifactSealerConfig,
  configDirectory: string,
  hooks: SourceAnalysisArtifactSealerRuntimeHooks = {},
): SealedSourceAnalysisArtifactWriteResult {
  const repositoryRoot = canonicalRepositoryRoot(
    resolvePhysical(configDirectory, config.repositoryRoot),
  );
  const inputSnapshots = new Map<string, StablePhysicalFileSnapshot>();
  const physicalFile = (pathValue: string, label: string): Buffer => {
    const absolutePath = resolve(pathValue);
    const existing = inputSnapshots.get(absolutePath);
    if (existing) return Buffer.from(existing.bytes);
    const snapshot = readStablePhysicalFileSnapshot(absolutePath, label);
    inputSnapshots.set(absolutePath, snapshot);
    return Buffer.from(snapshot.bytes);
  };
  const evidence = config.evidenceFiles;
  const repositoryFile = (path: string, label: string) =>
    readStableRepositoryFile(repositoryRoot, path, label, physicalFile);
  const artifactBodyValue = parseJson(
    physicalFile(
      resolvePhysical(configDirectory, config.artifactBodyFile),
      "artifactBodyFile",
    ),
    "artifactBodyFile",
  );
  if (!isRecord(artifactBodyValue)) {
    fail("artifactBodyFile must contain a JSON object");
  }
  const predecessorInputManifestFile = repositoryFile(
    evidence.predecessorInputManifestPath,
    "predecessor input manifest",
  );
  const input: SealSourceAnalysisArtifactInput = {
    artifactBody:
      artifactBodyValue as unknown as UnsealedSourceAnalysisArtifact,
    evidence: {
      predecessorInputManifestFile,
      inputManifestFile: repositoryFile(
        evidence.inputManifestPath,
        "verified input manifest",
      ),
      identityArtifactFile: repositoryFile(
        evidence.identityArtifactPath,
        "identity artifact",
      ),
      identityVerificationPrestate: parseJson(
        physicalFile(
          resolvePhysical(
            configDirectory,
            config.identityVerificationPrestateFile,
          ),
          "identity-verification pre-state",
        ),
        "identity-verification pre-state",
      ),
      analysisPrestate: parseJson(
        physicalFile(
          resolvePhysical(configDirectory, config.analysisPrestateFile),
          "analysis pre-state",
        ),
        "analysis pre-state",
      ),
      identityEvidenceBundle: {
        acquisitionReceiptFile: repositoryFile(
          evidence.acquisitionReceiptPath,
          "acquisition receipt",
        ),
        rawContentBytes: physicalFile(
          resolvePhysical(configDirectory, evidence.rawPdfFile),
          "raw PDF",
        ),
        extractionReceiptFile: repositoryFile(
          evidence.extractionReceiptPath,
          "extraction receipt",
        ),
        pageMapFile: repositoryFile(evidence.pageMapPath, "page map"),
        sourceAnalysisInputManifestFile: predecessorInputManifestFile,
        workflowFile: repositoryFile(
          evidence.identityWorkflowPath,
          "identity workflow",
        ),
        promptTemplateFile: repositoryFile(
          evidence.identityPromptTemplatePath,
          "identity prompt template",
        ),
      },
      workflowFile: repositoryFile(
        evidence.analysisWorkflowPath,
        "analysis workflow",
      ),
      promptTemplateFile: repositoryFile(
        evidence.analysisPromptTemplatePath,
        "analysis prompt template",
      ),
      normalizedPages: evidence.normalizedPages.map((page) => ({
        pageNumber: page.pageNumber,
        bytes: physicalFile(
          resolvePhysical(configDirectory, page.filePath),
          `normalized page ${page.pageNumber}`,
        ),
      })),
      predecessorAnalysisArtifactFile:
        evidence.predecessorAnalysisArtifactPath === null
          ? null
          : repositoryFile(
              evidence.predecessorAnalysisArtifactPath,
              "revision predecessor analysis artifact",
            ),
      relatedAnalysisArtifactFiles: evidence.relatedAnalysisArtifactPaths.map(
        (path, index) =>
          repositoryFile(path, `related analysis artifact ${index + 1}`),
      ),
    },
  };
  return sealAndWriteSourceAnalysisArtifact(repositoryRoot, input, () => {
    hooks.beforeCollectiveInputRevalidation?.();
    revalidateStablePhysicalFileSet(inputSnapshots.values());
  });
}

function configArgument(argv: string[]): string {
  if (argv.length !== 1 || !argv[0]?.startsWith("--config=")) {
    fail(
      "usage: tsx scripts/knowledge/seal-source-analysis-artifact.ts --config=<path>",
    );
  }
  const value = argv[0].slice("--config=".length);
  if (!value) fail("--config requires a path");
  return resolve(value);
}

export function main(argv = process.argv.slice(2)): void {
  const configPath = configArgument(argv);
  const config = parseSourceAnalysisArtifactSealerConfig(
    parseJson(readStablePhysicalFile(configPath, "config"), "config"),
  );
  const result = runSourceAnalysisArtifactSealerConfig(
    config,
    dirname(configPath),
  );
  process.stdout.write(
    `${JSON.stringify({
      artifactId: result.artifact.artifactId,
      artifactSha256: result.artifact.artifactSha256,
      repositoryPath: result.repositoryPath,
      absolutePath: result.absolutePath,
      status: result.status,
      lifecycleEventCreated: false,
      lifecyclePromotionPerformed: false,
    })}\n`,
  );
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : "";
if (import.meta.url === invokedPath) main();
