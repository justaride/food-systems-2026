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
  parse,
  relative,
  resolve,
  sep,
} from "node:path";
import { pathToFileURL } from "node:url";

import {
  SOURCE_IDENTITY_VERIFICATION_ARTIFACT_FILE_SUFFIX,
  requireVerifiedSourceIdentityWithEvidenceBundle,
  sealSourceIdentityVerificationArtifact,
  sourceIdentityVerificationArtifactPath,
  type SourceIdentityArtifactFile,
  type SourceIdentityVerificationArtifact,
  type SourceIdentityVerificationEvidenceBundle,
} from "../../src/lib/knowledge/source-identity-verification";

export const SOURCE_IDENTITY_SEALER_CONFIG_VERSION =
  "seal-source-identity-verification-artifact-config-v1" as const;
export const SOURCE_IDENTITY_ARTIFACT_FILE_SUFFIX =
  SOURCE_IDENTITY_VERIFICATION_ARTIFACT_FILE_SUFFIX;

const PRIVATE_ARTIFACT_MODE = 0o600;
const PRIVATE_DIRECTORY_MODE = 0o700;
const O_NOFOLLOW = constants.O_NOFOLLOW ?? 0;

export type UnsealedSourceIdentityVerificationArtifact = Omit<
  SourceIdentityVerificationArtifact,
  "artifactSha256"
>;

export type SealSourceIdentityVerificationInput = {
  /** AI-authored semantic output. The sealer adds only artifactSha256. */
  artifactBody: UnsealedSourceIdentityVerificationArtifact;
  evidenceBundle: SourceIdentityVerificationEvidenceBundle;
  outputDirectory: string;
};

export type PreparedVerifiedSourceIdentityArtifact = {
  artifact: SourceIdentityVerificationArtifact;
  bytes: Buffer;
  repositoryPath: string;
  fileName: string;
};

export type SealedSourceIdentityWriteResult =
  PreparedVerifiedSourceIdentityArtifact & {
    outputPath: string;
    writeState: "written" | "already_present";
  };

type ConfigArtifactFile = {
  artifactPath: string;
  filePath: string;
};

export type SourceIdentitySealerConfig = {
  schemaVersion: typeof SOURCE_IDENTITY_SEALER_CONFIG_VERSION;
  artifactBodyFile: string;
  outputDirectory: string;
  evidenceFiles: {
    acquisitionReceipt: ConfigArtifactFile;
    rawPdfFile: string;
    extractionReceipt: ConfigArtifactFile;
    pageMap: ConfigArtifactFile;
    candidateInputManifest: ConfigArtifactFile;
    workflow: ConfigArtifactFile;
    promptTemplate: ConfigArtifactFile;
  };
};

function fail(message: string): never {
  throw new Error(`Source identity artifact sealer failed: ${message}`);
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

function parseConfigArtifactFile(
  value: unknown,
  label: string,
): ConfigArtifactFile {
  if (!isRecord(value)) fail(`${label} must be an object`);
  exactKeys(value, ["artifactPath", "filePath"], label);
  return {
    artifactPath: requiredString(value, "artifactPath", label),
    filePath: requiredString(value, "filePath", label),
  };
}

export function parseSourceIdentitySealerConfig(
  value: unknown,
): SourceIdentitySealerConfig {
  if (!isRecord(value)) fail("config must be an object");
  exactKeys(
    value,
    ["schemaVersion", "artifactBodyFile", "outputDirectory", "evidenceFiles"],
    "config",
  );
  if (value.schemaVersion !== SOURCE_IDENTITY_SEALER_CONFIG_VERSION) {
    fail(
      `config.schemaVersion must be ${SOURCE_IDENTITY_SEALER_CONFIG_VERSION}`,
    );
  }
  if (!isRecord(value.evidenceFiles)) {
    fail("config.evidenceFiles must be an object");
  }
  const evidence = value.evidenceFiles;
  exactKeys(
    evidence,
    [
      "acquisitionReceipt",
      "rawPdfFile",
      "extractionReceipt",
      "pageMap",
      "candidateInputManifest",
      "workflow",
      "promptTemplate",
    ],
    "config.evidenceFiles",
  );
  return {
    schemaVersion: SOURCE_IDENTITY_SEALER_CONFIG_VERSION,
    artifactBodyFile: requiredString(value, "artifactBodyFile", "config"),
    outputDirectory: requiredString(value, "outputDirectory", "config"),
    evidenceFiles: {
      acquisitionReceipt: parseConfigArtifactFile(
        evidence.acquisitionReceipt,
        "config.evidenceFiles.acquisitionReceipt",
      ),
      rawPdfFile: requiredString(
        evidence,
        "rawPdfFile",
        "config.evidenceFiles",
      ),
      extractionReceipt: parseConfigArtifactFile(
        evidence.extractionReceipt,
        "config.evidenceFiles.extractionReceipt",
      ),
      pageMap: parseConfigArtifactFile(
        evidence.pageMap,
        "config.evidenceFiles.pageMap",
      ),
      candidateInputManifest: parseConfigArtifactFile(
        evidence.candidateInputManifest,
        "config.evidenceFiles.candidateInputManifest",
      ),
      workflow: parseConfigArtifactFile(
        evidence.workflow,
        "config.evidenceFiles.workflow",
      ),
      promptTemplate: parseConfigArtifactFile(
        evidence.promptTemplate,
        "config.evidenceFiles.promptTemplate",
      ),
    },
  };
}

function parseJson(bytes: Buffer, label: string): unknown {
  try {
    return JSON.parse(bytes.toString("utf8"));
  } catch (error) {
    fail(`${label} is not valid JSON: ${(error as Error).message}`);
  }
}

/**
 * Seals and fully verifies an explicitly supplied semantic artifact body.
 * It does not create, repair, infer, or otherwise alter AI-authored fields.
 */
export function prepareVerifiedSourceIdentityArtifact(
  input: Omit<SealSourceIdentityVerificationInput, "outputDirectory">,
): PreparedVerifiedSourceIdentityArtifact {
  if (
    !isRecord(input.artifactBody) ||
    Object.prototype.hasOwnProperty.call(input.artifactBody, "artifactSha256")
  ) {
    fail("artifactBody must be an explicitly unsealed semantic artifact body");
  }
  const artifact = sealSourceIdentityVerificationArtifact(input.artifactBody);
  requireVerifiedSourceIdentityWithEvidenceBundle(
    artifact,
    input.evidenceBundle,
  );
  const contentAddress = artifact.artifactSha256.replace(/^sha256:/, "");
  if (!/^[a-f0-9]{64}$/.test(contentAddress)) {
    fail("sealed artifact did not produce a valid SHA-256 content address");
  }
  const repositoryPath = sourceIdentityVerificationArtifactPath(
    artifact.artifactSha256,
  );
  return {
    artifact,
    bytes: Buffer.from(`${JSON.stringify(artifact, null, 2)}\n`, "utf8"),
    repositoryPath,
    fileName: basename(repositoryPath),
  };
}

function isErrno(error: unknown, code: string): boolean {
  return (error as NodeJS.ErrnoException).code === code;
}

function ensureCanonicalOutputDirectoryTree(
  configuredOutputDirectory: string,
): string {
  const outputDirectory = resolve(configuredOutputDirectory);
  const root = parse(outputDirectory).root;
  let current = root;
  const segments = relative(root, outputDirectory).split(sep).filter(Boolean);

  for (const segment of ["", ...segments]) {
    if (segment) current = resolve(current, segment);
    let stat: Stats;
    try {
      stat = lstatSync(current);
    } catch (error) {
      if (!isErrno(error, "ENOENT")) throw error;
      try {
        mkdirSync(current, { mode: PRIVATE_DIRECTORY_MODE });
      } catch (mkdirError) {
        if (!isErrno(mkdirError, "EEXIST")) throw mkdirError;
      }
      stat = lstatSync(current);
    }
    if (stat.isSymbolicLink() || !stat.isDirectory()) {
      fail(
        `outputDirectory contains a symlinked or non-directory component: ${current}`,
      );
    }
    if (realpathSync(current) !== current) {
      fail(`outputDirectory is not canonical at component: ${current}`);
    }
  }
  return outputDirectory;
}

function sameFileIdentity(left: Stats, right: Stats): boolean {
  return left.dev === right.dev && left.ino === right.ino;
}

function assertSecureArtifactStat(stat: Stats, path: string): void {
  if (stat.isSymbolicLink() || !stat.isFile()) {
    fail(`pre-existing output is not a regular non-symlink file: ${path}`);
  }
  if (stat.nlink !== 1) {
    fail(`pre-existing output does not have exactly one hard link: ${path}`);
  }
  if ((stat.mode & 0o777) !== PRIVATE_ARTIFACT_MODE) {
    fail(`pre-existing output does not have private mode 0600: ${path}`);
  }
}

function assertExistingArtifactIsExact(path: string, expected: Buffer): void {
  let before: Stats;
  try {
    before = lstatSync(path);
  } catch (error) {
    fail(
      `cannot inspect pre-existing output ${path}: ${(error as Error).message}`,
    );
  }
  assertSecureArtifactStat(before, path);

  let descriptor: number;
  try {
    descriptor = openSync(path, constants.O_RDONLY | O_NOFOLLOW);
  } catch (error) {
    fail(
      `cannot safely open pre-existing output ${path}: ${(error as Error).message}`,
    );
  }
  try {
    const openedBefore = fstatSync(descriptor);
    const pathAfterOpen = lstatSync(path);
    assertSecureArtifactStat(openedBefore, path);
    assertSecureArtifactStat(pathAfterOpen, path);
    if (
      !sameFileIdentity(before, openedBefore) ||
      !sameFileIdentity(openedBefore, pathAfterOpen)
    ) {
      fail(`pre-existing output changed while it was opened: ${path}`);
    }

    const existing = readFileSync(descriptor);
    const openedAfter = fstatSync(descriptor);
    const pathAfterRead = lstatSync(path);
    assertSecureArtifactStat(openedAfter, path);
    assertSecureArtifactStat(pathAfterRead, path);
    if (
      !sameFileIdentity(openedBefore, openedAfter) ||
      !sameFileIdentity(openedAfter, pathAfterRead)
    ) {
      fail(`pre-existing output changed while it was read: ${path}`);
    }
    if (!existing.equals(expected)) {
      fail(`content-address conflict at ${path}`);
    }
  } finally {
    closeSync(descriptor);
  }
}

/**
 * Atomically publishes a complete file through an exclusive hard link. An
 * existing byte-identical artifact is idempotent; any same-address conflict
 * fails closed and is never overwritten.
 */
export function sealAndWriteVerifiedSourceIdentityArtifact(
  input: SealSourceIdentityVerificationInput,
): SealedSourceIdentityWriteResult {
  if (!isAbsolute(input.outputDirectory)) {
    fail("outputDirectory must be an absolute path");
  }
  const prepared = prepareVerifiedSourceIdentityArtifact(input);
  const outputDirectory = ensureCanonicalOutputDirectoryTree(
    input.outputDirectory,
  );
  const outputPath = resolve(outputDirectory, prepared.fileName);
  if (dirname(outputPath) !== outputDirectory) {
    fail("derived output path escaped outputDirectory");
  }

  const temporaryPath = resolve(
    outputDirectory,
    `.${basename(prepared.fileName)}.${randomUUID()}.tmp`,
  );
  let temporaryCreated = false;
  let descriptor: number | null = null;
  try {
    descriptor = openSync(
      temporaryPath,
      constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | O_NOFOLLOW,
      PRIVATE_ARTIFACT_MODE,
    );
    temporaryCreated = true;
    fchmodSync(descriptor, PRIVATE_ARTIFACT_MODE);
    writeFileSync(descriptor, prepared.bytes);
    fsyncSync(descriptor);
    closeSync(descriptor);
    descriptor = null;
    try {
      ensureCanonicalOutputDirectoryTree(outputDirectory);
      linkSync(temporaryPath, outputPath);
      unlinkSync(temporaryPath);
      temporaryCreated = false;
      ensureCanonicalOutputDirectoryTree(outputDirectory);
      assertExistingArtifactIsExact(outputPath, prepared.bytes);
      return { ...prepared, outputPath, writeState: "written" };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      ensureCanonicalOutputDirectoryTree(outputDirectory);
      assertExistingArtifactIsExact(outputPath, prepared.bytes);
      return { ...prepared, outputPath, writeState: "already_present" };
    }
  } finally {
    if (descriptor !== null) closeSync(descriptor);
    if (temporaryCreated) {
      try {
        unlinkSync(temporaryPath);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
    }
  }
}

function physicalFile(configDirectory: string, configuredPath: string): string {
  return isAbsolute(configuredPath)
    ? resolve(configuredPath)
    : resolve(configDirectory, configuredPath);
}

function artifactFile(
  configDirectory: string,
  configured: ConfigArtifactFile,
): SourceIdentityArtifactFile {
  return {
    path: configured.artifactPath,
    bytes: readFileSync(physicalFile(configDirectory, configured.filePath)),
  };
}

export function runSourceIdentitySealerConfig(
  config: SourceIdentitySealerConfig,
  configDirectory: string,
): SealedSourceIdentityWriteResult {
  const artifactBodyValue = parseJson(
    readFileSync(physicalFile(configDirectory, config.artifactBodyFile)),
    "artifactBodyFile",
  );
  if (!isRecord(artifactBodyValue)) {
    fail("artifactBodyFile must contain a JSON object");
  }
  const evidence = config.evidenceFiles;
  return sealAndWriteVerifiedSourceIdentityArtifact({
    artifactBody:
      artifactBodyValue as unknown as UnsealedSourceIdentityVerificationArtifact,
    evidenceBundle: {
      acquisitionReceiptFile: artifactFile(
        configDirectory,
        evidence.acquisitionReceipt,
      ),
      rawContentBytes: readFileSync(
        physicalFile(configDirectory, evidence.rawPdfFile),
      ),
      extractionReceiptFile: artifactFile(
        configDirectory,
        evidence.extractionReceipt,
      ),
      pageMapFile: artifactFile(configDirectory, evidence.pageMap),
      sourceAnalysisInputManifestFile: artifactFile(
        configDirectory,
        evidence.candidateInputManifest,
      ),
      workflowFile: artifactFile(configDirectory, evidence.workflow),
      promptTemplateFile: artifactFile(
        configDirectory,
        evidence.promptTemplate,
      ),
    },
    outputDirectory: physicalFile(configDirectory, config.outputDirectory),
  });
}

function configArgument(argv: string[]): string {
  if (argv.length !== 1 || !argv[0]?.startsWith("--config=")) {
    fail(
      "usage: tsx scripts/knowledge/seal-source-identity-verification-artifact.ts --config=<path>",
    );
  }
  const value = argv[0].slice("--config=".length);
  if (!value) fail("--config requires a path");
  return resolve(value);
}

export function main(argv = process.argv.slice(2)): void {
  const configPath = configArgument(argv);
  const config = parseSourceIdentitySealerConfig(
    parseJson(readFileSync(configPath), "config"),
  );
  const result = runSourceIdentitySealerConfig(config, dirname(configPath));
  process.stdout.write(
    `${JSON.stringify({
      artifactId: result.artifact.artifactId,
      artifactSha256: result.artifact.artifactSha256,
      repositoryPath: result.repositoryPath,
      outputPath: result.outputPath,
      writeState: result.writeState,
    })}\n`,
  );
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : "";
if (import.meta.url === invokedPath) main();
