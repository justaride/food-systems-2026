import "dotenv/config";

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  closeSync,
  existsSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  realpathSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

import { Prisma, PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { z } from "zod";

import {
  PdfPageMapSchema,
  PdfQualificationReceiptSchema,
  verifySealedPageMap,
  verifySealedQualificationReceipt,
  type PdfPageMap,
  type PdfQualificationReceipt,
} from "../../src/lib/knowledge/pdf-page-extraction-qualification";
import {
  validateSourceAcquisitionReceipt,
  sourceAcquisitionContent,
  type SourceAcquisitionReceipt,
} from "../../src/lib/knowledge/source-acquisition-receipt";
import {
  verifySourceAnalysisInputManifest,
  type SourceAnalysisInputManifest,
} from "../../src/lib/knowledge/source-analysis-input-manifest";
import {
  SOURCE_REGISTRATION_CONTRACT_VERSION,
  SOURCE_REGISTRATION_DOCUMENT_CONTENT_SERIALIZATION,
  SOURCE_REGISTRATION_PLAN_SCHEMA_VERSION,
  SOURCE_REGISTRATION_PLAN_VERSION,
  SOURCE_REGISTRATION_TARGET_HASH_DOMAIN,
  canonicalDocumentIdentityKey,
  canonicalSourceRegistrationJson,
  defaultSourceRegistrationReleaseGates,
  documentTargetDataSha256,
  hashSourceRegistrationJson,
  libraryAnalysisIdForIdentity,
  libraryTargetDataSha256,
  lifecycleSourceIdForIdentity,
  parseSourceRegistrationBatch,
  sealDatabaseBeforeSnapshot,
  sealSourceRegistrationPlan,
  sourceRegistrationBareSha256,
  sourceRegistrationContractSha256,
  sourceRegistrationSha256,
  validateSourceRegistrationPlan,
  type DatabaseBeforeSnapshot,
  type DatabaseBeforeSnapshotBody,
  type DocumentSnapshotRow,
  type IntendedDocumentRow,
  type IntendedLibraryRow,
  type LibrarySnapshotRow,
  type PlannedPrivateRecoveryRow,
  type SourceRegistrationBatch,
  type SourceRegistrationJsonValue,
  type SourceRegistrationPlan,
  type SourceRegistrationTarget,
  type SourceRegistrationTargetPlan,
  type TargetArtifactEvidence,
} from "../../src/lib/knowledge/source-registration-plan";

export const SOURCE_REGISTRATION_PATHS = {
  batch:
    "knowledge/corpus/source-registration/source-registration-batch-2026-08-02.v1.json",
  contract: "knowledge/corpus/SOURCE-REGISTRATION-PLAN-CONTRACT.md",
  jsonSchema: "knowledge/schema/source-registration-plan.schema.v1.json",
  runtime: "src/lib/knowledge/source-registration-plan.ts",
  generator: "scripts/knowledge/generate-source-registration-plan.ts",
  databaseSchema: "prisma/schema.prisma",
  privateRecoveryRegister:
    "knowledge/corpus/corpus-private-recovery-candidates.v1.json",
  defaultOutput:
    "knowledge/corpus/source-registration/source-registration-dry-run-plan-2026-08-03.v1.json",
} as const;

const acquisitionBatchSchema = z
  .object({
    schemaVersion: z.literal("1.0.0"),
    batchId: z.string().min(1),
    purpose: z.string().min(1),
    tool: z.object({}).passthrough(),
    sources: z
      .array(
        z
          .object({
            receiptId: z.string().min(1),
            sourceId: z.string().startsWith("source."),
            requestedLocator: z.string().url().startsWith("https://"),
            expectedBodySha256: z.string().regex(/^sha256:[a-f0-9]{64}$/),
            expectedBodySizeBytes: z.number().int().positive(),
            archivePortablePath: z
              .string()
              .regex(/^sha256\/[a-f0-9]{64}\.pdf$/),
            archiveMode: z.enum(["create_new", "require_existing"]),
            receiptPath: z.string().min(1),
            transport: z.enum(["node_https1", "curl_http2"]),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

const extractionBatchTargetSchema = z
  .object({
    targetId: z.string().min(1),
    identityKeys: z.array(z.string().min(1)).min(1),
    legacyAlias: z.string().min(1),
    expectedSha256: z.string().regex(/^[a-f0-9]{64}$/),
    expectedSizeBytes: z.number().int().positive(),
    expectedPageCount: z.number().int().positive(),
    expectedEncrypted: z.literal(false),
    sourceBinding: z.object({}).passthrough(),
    identityAssociation: z.object({}).passthrough(),
  })
  .strict();

const extractionBatchSchema = z
  .object({
    schemaVersion: z.literal("1.0.0"),
    batchId: z.string().min(1),
    observedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    processingUnit: z.literal("raw_pdf_sha256"),
    purpose: z.string().min(1),
    semantics: z.object({}).passthrough(),
    targets: z.array(extractionBatchTargetSchema).min(1),
  })
  .strict();

const generationManifestSchema = z
  .object({
    schemaVersion: z.literal("1.0.0"),
    artifactType: z.literal("source_analysis_input_generation_manifest"),
    pipelineVersion: z.literal("1.0.0"),
    inputs: z.array(
      z
        .object({
          path: z.string().min(1),
          sha256: z.string().regex(/^[a-f0-9]{64}$/),
          sizeBytes: z.number().int().nonnegative(),
        })
        .strict(),
    ),
    outputs: z.array(
      z
        .object({
          path: z.string().min(1),
          sha256: z.string().regex(/^[a-f0-9]{64}$/),
          sizeBytes: z.number().int().nonnegative(),
        })
        .strict(),
    ),
  })
  .passthrough();

const privateRecoveryCandidateCoreSchema = z
  .object({
    identityKey: z.string().startsWith("document:"),
    canonicalPath: z.string().min(1),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    sizeBytes: z.number().int().positive(),
    internalLocator: z
      .string()
      .regex(/^private:\/\/corpus\/sha256\/[a-f0-9]{64}$/),
    replicaClass: z.literal("bigbrain_private_archive"),
    repositoryAvailable: z.literal(false),
    fullTextReviewed: z.literal(false),
    rightsState: z.literal("pending_not_cleared"),
  })
  .passthrough();

const privateRecoveryRegisterSchema = z
  .object({
    schemaVersion: z.literal("1.0.0"),
    registerId: z.literal("corpus-private-recovery-candidates.v1"),
    captureRecordedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    purpose: z.string().min(1),
    storageVerificationContract: z.object({}).passthrough(),
    candidates: z.array(privateRecoveryCandidateCoreSchema),
  })
  .strict();

const documentSelect = {
  id: true,
  slug: true,
  filePath: true,
  title: true,
  author: true,
  year: true,
  documentType: true,
  category: true,
  subcategory: true,
  country: true,
  content: true,
  summary: true,
  url: true,
  accessedAt: true,
  archivedUrl: true,
  wordCount: true,
  tags: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.DocumentSelect;

const librarySelect = {
  id: true,
  sourceKind: true,
  sourceKey: true,
  documentId: true,
  sourceDocId: true,
  canonicalPath: true,
  title: true,
  status: true,
  usageRule: true,
  reviewStatus: true,
  citationReadiness: true,
  analysisTier: true,
  aiCard: true,
  aiSummary: true,
  keyFindings: true,
  claimCandidates: true,
  projectImplications: true,
  gaps: true,
  controlLinks: true,
  riskFlags: true,
  contentHash: true,
  wordCount: true,
  processedAt: true,
  reviewedAt: true,
  reviewer: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.LibraryAnalysisRecordSelect;

type DocumentDbRow = Prisma.DocumentGetPayload<{
  select: typeof documentSelect;
}>;
type LibraryDbRow = Prisma.LibraryAnalysisRecordGetPayload<{
  select: typeof librarySelect;
}>;

export type SourceRegistrationArtifactFile = {
  path: string;
  bytes: Buffer;
  fileSha256Bare: string;
  fileSha256: string;
  sizeBytes: number;
  value: unknown;
};

export type PreparedSourceRegistrationTarget = {
  target: SourceRegistrationTarget;
  acquisitionReceipt: SourceAcquisitionReceipt;
  evidence: TargetArtifactEvidence;
  contentBinding: IntendedDocumentRow["contentBinding"];
};

type RegistrationIntent = {
  target: SourceRegistrationTarget;
  evidence: TargetArtifactEvidence;
  intendedDocumentRow: IntendedDocumentRow;
  intendedLibraryAnalysisRow: IntendedLibraryRow;
  intendedPrivateRecoveryRow: PlannedPrivateRecoveryRow;
};

export type SourceRegistrationDbInspection = {
  observedAt: string;
  transaction: DatabaseBeforeSnapshotBody["transaction"];
  databaseIdentity: DatabaseBeforeSnapshotBody["databaseIdentity"];
  completedMigrationLedger: DatabaseBeforeSnapshotBody["completedMigrationLedger"];
  coreCounts: DatabaseBeforeSnapshotBody["coreCounts"];
  documentRows: DocumentSnapshotRow[];
  libraryRows: LibrarySnapshotRow[];
};

type CliOptions = {
  manifestPath: string;
  primaryCorpusRoot: string;
  replicaCorpusRoot: string;
  outputPath: string | null;
};

function fail(message: string): never {
  throw new Error(`Source-registration dry run failed: ${message}`);
}

export function parseSourceRegistrationArgs(argv: string[]): CliOptions {
  if (argv.includes("--apply")) {
    fail("--apply is disabled and no database mutation implementation exists");
  }
  const allowedFlags = new Set(["--dry-run"]);
  const allowedPrefixes = [
    "--manifest=",
    "--primary-corpus-root=",
    "--replica-corpus-root=",
    "--output=",
  ];
  for (const argument of argv) {
    if (
      argument === "--apply" ||
      allowedFlags.has(argument) ||
      allowedPrefixes.some((prefix) => argument.startsWith(prefix))
    ) {
      continue;
    }
    fail(`unknown argument: ${argument}`);
  }
  const singleValue = (prefix: string): string | undefined => {
    const matches = argv.filter((argument) => argument.startsWith(prefix));
    if (matches.length > 1) fail(`${prefix.slice(0, -1)} may be supplied once`);
    const value = matches[0]?.slice(prefix.length);
    if (matches.length === 1 && !value) fail(`${prefix.slice(0, -1)} is empty`);
    return value;
  };
  const manifestPath =
    singleValue("--manifest=") ?? SOURCE_REGISTRATION_PATHS.batch;
  const primaryCorpusRoot = singleValue("--primary-corpus-root=");
  const replicaCorpusRoot = singleValue("--replica-corpus-root=");
  if (!primaryCorpusRoot || !isAbsolute(primaryCorpusRoot)) {
    fail("--primary-corpus-root must be an explicit absolute directory");
  }
  if (!replicaCorpusRoot || !isAbsolute(replicaCorpusRoot)) {
    fail("--replica-corpus-root must be an explicit absolute directory");
  }
  const outputPath = singleValue("--output=") ?? null;
  if (isAbsolute(manifestPath)) fail("--manifest must be repository-relative");
  if (outputPath && isAbsolute(outputPath)) {
    fail("--output must be repository-relative so private roots cannot leak");
  }
  return {
    manifestPath,
    primaryCorpusRoot,
    replicaCorpusRoot,
    outputPath,
  };
}

function isInside(root: string, candidate: string): boolean {
  const pathFromRoot = relative(root, candidate);
  return (
    pathFromRoot === "" ||
    (!pathFromRoot.startsWith(`..${sep}`) &&
      pathFromRoot !== ".." &&
      !isAbsolute(pathFromRoot))
  );
}

function assertPortablePath(path: string, label: string): void {
  if (
    !path ||
    isAbsolute(path) ||
    path.includes("\\") ||
    path
      .split("/")
      .some((segment) => segment === "" || segment === "." || segment === "..")
  ) {
    fail(`${label} is not a normalized portable relative path`);
  }
}

function readArtifactFile(
  projectRoot: string,
  path: string,
): SourceRegistrationArtifactFile {
  assertPortablePath(path, "artifact path");
  const root = realpathSync(projectRoot);
  const absolutePath = resolve(root, path);
  if (!isInside(root, absolutePath))
    fail(`artifact path escaped repository: ${path}`);
  if (!existsSync(absolutePath)) fail(`required artifact is missing: ${path}`);
  const observation = lstatSync(absolutePath);
  if (!observation.isFile() || observation.isSymbolicLink()) {
    fail(`artifact must be a regular non-symlink file: ${path}`);
  }
  const resolved = realpathSync(absolutePath);
  if (!isInside(root, resolved))
    fail(`artifact resolved outside repository: ${path}`);
  const bytes = readFileSync(resolved);
  let value: unknown;
  try {
    value = JSON.parse(bytes.toString("utf8"));
  } catch {
    fail(`artifact is not valid JSON: ${path}`);
  }
  return {
    path,
    bytes,
    fileSha256Bare: sourceRegistrationBareSha256(bytes),
    fileSha256: sourceRegistrationSha256(bytes),
    sizeBytes: bytes.length,
    value,
  };
}

function readPlainFileBinding(projectRoot: string, path: string) {
  assertPortablePath(path, "plain artifact path");
  const root = realpathSync(projectRoot);
  const absolutePath = resolve(root, path);
  if (!existsSync(absolutePath)) fail(`required artifact is missing: ${path}`);
  const observation = lstatSync(absolutePath);
  if (!observation.isFile() || observation.isSymbolicLink()) {
    fail(`artifact must be a regular non-symlink file: ${path}`);
  }
  const resolved = realpathSync(absolutePath);
  if (!isInside(root, resolved))
    fail(`artifact resolved outside repository: ${path}`);
  const bytes = readFileSync(resolved);
  return {
    path,
    fileSha256: sourceRegistrationSha256(bytes),
    sizeBytes: bytes.length,
  };
}

function exactFileBinding(file: SourceRegistrationArtifactFile) {
  return {
    path: file.path,
    fileSha256: file.fileSha256,
    sizeBytes: file.sizeBytes,
  };
}

function assertPinnedFile(
  projectRoot: string,
  binding: { path: string; fileSha256: string },
): SourceRegistrationArtifactFile {
  const file = readArtifactFile(projectRoot, binding.path);
  if (file.fileSha256Bare !== binding.fileSha256) {
    fail(
      `${binding.path} differs from the exact source-registration batch pin`,
    );
  }
  return file;
}

function oneBy<T>(
  values: T[],
  predicate: (value: T) => boolean,
  label: string,
): T {
  const matches = values.filter(predicate);
  if (matches.length !== 1)
    fail(`${label}: expected one match, observed ${matches.length}`);
  return matches[0]!;
}

function modeString(path: string): string {
  return (lstatSync(path).mode & 0o777).toString(8).padStart(4, "0");
}

type PrivateRoot = {
  realPath: string;
  device: number;
  inode: number;
};

function inspectPrivateRoot(path: string, label: string): PrivateRoot {
  if (!isAbsolute(path)) fail(`${label} root must be absolute`);
  if (!existsSync(path)) fail(`${label} root is missing`);
  const direct = lstatSync(path);
  if (!direct.isDirectory() || direct.isSymbolicLink()) {
    fail(`${label} root must be a regular non-symlink directory`);
  }
  if (modeString(path) !== "0700") fail(`${label} root must use mode 0700`);
  const realPath = realpathSync(path);
  const observation = statSync(realPath);
  return { realPath, device: observation.dev, inode: observation.ino };
}

type PrivateFileObservation = {
  bytes: Buffer;
  realPath: string;
  device: number;
  inode: number;
};

function verifyPrivateFile(input: {
  root: PrivateRoot;
  portablePath: string;
  expectedSha256Bare: string;
  expectedSizeBytes: number;
  label: string;
}): PrivateFileObservation {
  assertPortablePath(input.portablePath, `${input.label} path`);
  const candidate = resolve(input.root.realPath, input.portablePath);
  if (!isInside(input.root.realPath, candidate)) {
    fail(`${input.label} escaped the private corpus root`);
  }
  if (!existsSync(candidate)) fail(`${input.label} is missing`);
  const direct = lstatSync(candidate);
  if (!direct.isFile() || direct.isSymbolicLink()) {
    fail(`${input.label} must be a regular non-symlink file`);
  }
  if (modeString(candidate) !== "0400")
    fail(`${input.label} must use mode 0400`);
  const realPath = realpathSync(candidate);
  if (!isInside(input.root.realPath, realPath)) {
    fail(`${input.label} resolved outside its private corpus root`);
  }
  const bytes = readFileSync(realPath);
  if (bytes.length !== input.expectedSizeBytes) {
    fail(`${input.label} size differs from its sealed artifact`);
  }
  if (sourceRegistrationBareSha256(bytes) !== input.expectedSha256Bare) {
    fail(`${input.label} hash differs from its sealed artifact`);
  }
  return {
    bytes,
    realPath,
    device: direct.dev,
    inode: direct.ino,
  };
}

function assertDistinctPrivateCopies(
  primary: PrivateFileObservation,
  replica: PrivateFileObservation,
  label: string,
): void {
  if (
    primary.realPath === replica.realPath ||
    (primary.device === replica.device && primary.inode === replica.inode)
  ) {
    fail(`${label} primary and replica resolve to the same file`);
  }
  if (!primary.bytes.equals(replica.bytes)) {
    fail(`${label} primary and replica bytes differ`);
  }
}

function pagePath(
  rawHash: string,
  pageNumber: number,
  kind: "raw" | "normalized",
) {
  const suffix = kind === "raw" ? "raw.txt" : "normalized.txt";
  return `pdf-page-extraction/v1/sha256/${rawHash}/pages/page-${String(pageNumber).padStart(4, "0")}.${suffix}`;
}

function verifyTargetPrivateMaterial(input: {
  target: SourceRegistrationTarget;
  pageMap: PdfPageMap;
  inputManifest: SourceAnalysisInputManifest;
  primaryRoot: PrivateRoot;
  replicaRoot: PrivateRoot;
}): {
  evidence: TargetArtifactEvidence["privateVerification"];
  contentBinding: IntendedDocumentRow["contentBinding"];
} {
  const hash = input.target.source.rawContentSha256;
  const rawPdfPath = `sha256/${hash}.pdf`;
  const primaryPdf = verifyPrivateFile({
    root: input.primaryRoot,
    portablePath: rawPdfPath,
    expectedSha256Bare: hash,
    expectedSizeBytes: input.target.source.rawContentSizeBytes,
    label: `${input.target.targetId} primary PDF`,
  });
  const replicaPdf = verifyPrivateFile({
    root: input.replicaRoot,
    portablePath: rawPdfPath,
    expectedSha256Bare: hash,
    expectedSizeBytes: input.target.source.rawContentSizeBytes,
    label: `${input.target.targetId} replica PDF`,
  });
  assertDistinctPrivateCopies(
    primaryPdf,
    replicaPdf,
    `${input.target.targetId} PDF`,
  );

  const rawSet: SourceRegistrationJsonValue[] = [];
  const normalizedSet: SourceRegistrationJsonValue[] = [];
  const normalizedPageBytes: Buffer[] = [];
  for (const [index, page] of input.pageMap.pages.entries()) {
    const inputPage = input.inputManifest.pages[index];
    if (
      !inputPage ||
      page.pageNumber !== index + 1 ||
      inputPage.pageNumber !== page.pageNumber
    ) {
      fail(`${input.target.targetId}: non-contiguous page binding`);
    }
    if (
      inputPage.normalizedText.sha256 !== page.normalizedText.sha256 ||
      inputPage.normalizedText.sizeBytes !== page.normalizedText.sizeBytes
    ) {
      fail(`${input.target.targetId}: input manifest and page map differ`);
    }
    const rawPortablePath = pagePath(hash, page.pageNumber, "raw");
    const normalizedPortablePath = pagePath(
      hash,
      page.pageNumber,
      "normalized",
    );
    const primaryRaw = verifyPrivateFile({
      root: input.primaryRoot,
      portablePath: rawPortablePath,
      expectedSha256Bare: page.rawText.sha256,
      expectedSizeBytes: page.rawText.sizeBytes,
      label: `${input.target.targetId} primary raw page ${page.pageNumber}`,
    });
    const replicaRaw = verifyPrivateFile({
      root: input.replicaRoot,
      portablePath: rawPortablePath,
      expectedSha256Bare: page.rawText.sha256,
      expectedSizeBytes: page.rawText.sizeBytes,
      label: `${input.target.targetId} replica raw page ${page.pageNumber}`,
    });
    assertDistinctPrivateCopies(
      primaryRaw,
      replicaRaw,
      `${input.target.targetId} raw page ${page.pageNumber}`,
    );
    const primaryNormalized = verifyPrivateFile({
      root: input.primaryRoot,
      portablePath: normalizedPortablePath,
      expectedSha256Bare: page.normalizedText.sha256,
      expectedSizeBytes: page.normalizedText.sizeBytes,
      label: `${input.target.targetId} primary normalized page ${page.pageNumber}`,
    });
    const replicaNormalized = verifyPrivateFile({
      root: input.replicaRoot,
      portablePath: normalizedPortablePath,
      expectedSha256Bare: page.normalizedText.sha256,
      expectedSizeBytes: page.normalizedText.sizeBytes,
      label: `${input.target.targetId} replica normalized page ${page.pageNumber}`,
    });
    assertDistinctPrivateCopies(
      primaryNormalized,
      replicaNormalized,
      `${input.target.targetId} normalized page ${page.pageNumber}`,
    );
    if (
      !Buffer.from(primaryNormalized.bytes.toString("utf8"), "utf8").equals(
        primaryNormalized.bytes,
      )
    ) {
      fail(
        `${input.target.targetId}: normalized page ${page.pageNumber} is not canonical UTF-8`,
      );
    }
    rawSet.push({
      pageNumber: page.pageNumber,
      sha256: page.rawText.sha256,
      sizeBytes: page.rawText.sizeBytes,
    });
    normalizedSet.push({
      pageNumber: page.pageNumber,
      sha256: page.normalizedText.sha256,
      sizeBytes: page.normalizedText.sizeBytes,
    });
    normalizedPageBytes.push(primaryNormalized.bytes);
  }
  const delimiter = Buffer.from(
    SOURCE_REGISTRATION_DOCUMENT_CONTENT_SERIALIZATION.delimiterUtf8,
    "utf8",
  );
  const contentParts: Buffer[] = [];
  for (const [index, bytes] of normalizedPageBytes.entries()) {
    if (index > 0) contentParts.push(delimiter);
    contentParts.push(bytes);
  }
  const documentContent = Buffer.concat(contentParts);
  const decodedContent = documentContent.toString("utf8");
  return {
    evidence: {
      rawPdfPortablePath: rawPdfPath,
      rawPageTextPortablePathTemplate: `pdf-page-extraction/v1/sha256/${hash}/pages/page-{pageNumber:0000}.raw.txt`,
      normalizedPagePortablePathTemplate: `pdf-page-extraction/v1/sha256/${hash}/pages/page-{pageNumber:0000}.normalized.txt`,
      pageCount: input.pageMap.pages.length,
      rawPageTextFileCountPerCopy: input.pageMap.pages.length,
      normalizedPageFileCountPerCopy: input.pageMap.pages.length,
      rawPdfSha256: `sha256:${hash}`,
      rawPageTextSetSha256: hashSourceRegistrationJson(
        "food-systems-2026:source-registration-raw-page-set:v1\0",
        rawSet,
      ),
      normalizedPageSetSha256: hashSourceRegistrationJson(
        "food-systems-2026:source-registration-normalized-page-set:v1\0",
        normalizedSet,
      ),
      primaryCopyVerified: true,
      replicaCopyVerified: true,
      distinctRootsVerified: true,
      distinctFilesVerified: true,
      rootMode: "0700",
      fileMode: "0400",
      absoluteRootsStoredInPlan: false,
    },
    contentBinding: {
      source: "exact_private_normalized_pages",
      serializationId: SOURCE_REGISTRATION_DOCUMENT_CONTENT_SERIALIZATION.id,
      charset: "utf-8",
      pageOrder: "ascending_page_number",
      pageSequence: "contiguous_from_1",
      delimiterUtf8:
        SOURCE_REGISTRATION_DOCUMENT_CONTENT_SERIALIZATION.delimiterUtf8,
      sha256: sourceRegistrationSha256(documentContent),
      sizeBytes: documentContent.length,
      characterCount: Array.from(decodedContent).length,
      wordCount: input.inputManifest.totals.wordCount,
      pageCount: input.pageMap.pages.length,
      contentValueStoredInPlan: false,
      privateAbsolutePathStoredInPlan: false,
    },
  };
}

function assertInputEntry(
  entries: Array<{ path: string; sha256: string; sizeBytes: number }>,
  file: SourceRegistrationArtifactFile,
  label: string,
): void {
  const entry = oneBy(
    entries,
    (candidate) => candidate.path === file.path,
    label,
  );
  if (
    entry.sha256 !== file.fileSha256Bare ||
    entry.sizeBytes !== file.sizeBytes
  ) {
    fail(`${label}: generation manifest file binding differs`);
  }
}

function sealedBinding<
  T extends
    | TargetArtifactEvidence["acquisitionReceipt"]["internalSealType"]
    | TargetArtifactEvidence["extractionReceipt"]["internalSealType"]
    | TargetArtifactEvidence["pageMap"]["internalSealType"]
    | TargetArtifactEvidence["sourceAnalysisInputManifest"]["internalSealType"],
>(input: {
  file: SourceRegistrationArtifactFile;
  internalSealType: T;
  internalSeal: string;
}): {
  path: string;
  fileSha256: string;
  sizeBytes: number;
  internalSealType: T;
  internalSeal: string;
} {
  return {
    ...exactFileBinding(input.file),
    internalSealType: input.internalSealType,
    internalSeal: input.internalSeal.startsWith("sha256:")
      ? input.internalSeal
      : `sha256:${input.internalSeal}`,
  };
}

export function prepareSourceRegistrationInputs(input: {
  projectRoot: string;
  manifestPath: string;
  primaryCorpusRoot: string;
  replicaCorpusRoot: string;
}): {
  batch: SourceRegistrationBatch;
  preparedTargets: PreparedSourceRegistrationTarget[];
  inputBindings: SourceRegistrationPlan["inputBindings"];
  privateRecoveryRegister: z.infer<typeof privateRecoveryRegisterSchema>;
  privateRecoveryRegisterFile: SourceRegistrationArtifactFile;
} {
  const registrationFile = readArtifactFile(
    input.projectRoot,
    input.manifestPath,
  );
  const batch = parseSourceRegistrationBatch(registrationFile.value);
  const acquisitionBatchFile = assertPinnedFile(
    input.projectRoot,
    batch.preRegistrationBindings.sourceAcquisitionBatch,
  );
  const acquisitionBatch = acquisitionBatchSchema.parse(
    acquisitionBatchFile.value,
  );
  const extractionBatchFile = assertPinnedFile(
    input.projectRoot,
    batch.preRegistrationBindings.pdfExtractionBatch,
  );
  const extractionBatch = extractionBatchSchema.parse(
    extractionBatchFile.value,
  );
  const generationManifestFile = assertPinnedFile(
    input.projectRoot,
    batch.preRegistrationBindings.sourceAnalysisInputGenerationManifest,
  );
  const generationManifest = generationManifestSchema.parse(
    generationManifestFile.value,
  );
  const contractBinding = readPlainFileBinding(
    input.projectRoot,
    SOURCE_REGISTRATION_PATHS.contract,
  );
  const schemaBinding = readPlainFileBinding(
    input.projectRoot,
    SOURCE_REGISTRATION_PATHS.jsonSchema,
  );
  const runtimeBinding = readPlainFileBinding(
    input.projectRoot,
    SOURCE_REGISTRATION_PATHS.runtime,
  );
  const generatorBinding = readPlainFileBinding(
    input.projectRoot,
    SOURCE_REGISTRATION_PATHS.generator,
  );
  const databaseSchemaBinding = readPlainFileBinding(
    input.projectRoot,
    SOURCE_REGISTRATION_PATHS.databaseSchema,
  );
  const privateRecoveryRegisterFile = readArtifactFile(
    input.projectRoot,
    SOURCE_REGISTRATION_PATHS.privateRecoveryRegister,
  );
  const privateRecoveryRegister = privateRecoveryRegisterSchema.parse(
    privateRecoveryRegisterFile.value,
  );

  const primaryRoot = inspectPrivateRoot(
    input.primaryCorpusRoot,
    "primary private corpus",
  );
  const replicaRoot = inspectPrivateRoot(
    input.replicaCorpusRoot,
    "replica private corpus",
  );
  if (
    primaryRoot.realPath === replicaRoot.realPath ||
    (primaryRoot.device === replicaRoot.device &&
      primaryRoot.inode === replicaRoot.inode)
  ) {
    fail("primary and replica private roots must be distinct directories");
  }

  const preparedTargets = batch.targets.map(
    (target): PreparedSourceRegistrationTarget => {
      const expectedCandidateSourceId =
        target.preRegistrationCandidateKey.replace(/^candidate:/, "");
      const acquisitionBatchSource = oneBy(
        acquisitionBatch.sources,
        (source) => source.receiptPath === target.source.acquisitionReceiptPath,
        `${target.targetId} acquisition batch source`,
      );
      if (
        acquisitionBatchSource.sourceId !== expectedCandidateSourceId ||
        acquisitionBatchSource.requestedLocator !== target.source.officialUrl ||
        acquisitionBatchSource.expectedBodySha256 !==
          `sha256:${target.source.rawContentSha256}` ||
        acquisitionBatchSource.expectedBodySizeBytes !==
          target.source.rawContentSizeBytes ||
        acquisitionBatchSource.archivePortablePath !==
          `sha256/${target.source.rawContentSha256}.pdf`
      ) {
        fail(`${target.targetId}: acquisition batch binding differs`);
      }
      const acquisitionReceiptFile = readArtifactFile(
        input.projectRoot,
        target.source.acquisitionReceiptPath,
      );
      const acquisitionReceipt = validateSourceAcquisitionReceipt(
        acquisitionReceiptFile.value,
      );
      const acquiredContent = sourceAcquisitionContent(acquisitionReceipt);
      if (
        acquisitionReceipt.receiptId !== acquisitionBatchSource.receiptId ||
        acquisitionReceipt.sourceId !== expectedCandidateSourceId ||
        acquisitionReceipt.requestedLocator !== target.source.officialUrl ||
        acquiredContent.sha256 !== `sha256:${target.source.rawContentSha256}` ||
        acquiredContent.sizeBytes !== target.source.rawContentSizeBytes
      ) {
        fail(`${target.targetId}: acquisition receipt differs from target`);
      }

      const extractionTarget = oneBy(
        extractionBatch.targets,
        (candidate) =>
          candidate.expectedSha256 === target.source.rawContentSha256,
        `${target.targetId} extraction target`,
      );
      if (
        extractionTarget.identityKeys.length !== 1 ||
        extractionTarget.identityKeys[0] !==
          target.preRegistrationCandidateKey ||
        extractionTarget.expectedSizeBytes !==
          target.source.rawContentSizeBytes ||
        extractionTarget.expectedPageCount !== target.source.pageCount
      ) {
        fail(`${target.targetId}: extraction batch target differs`);
      }

      const inputManifestPath = `knowledge/corpus/source-analysis-input-manifests/manifests/${target.source.rawContentSha256}.source-analysis-input-manifest.v1.json`;
      const inputManifestFile = readArtifactFile(
        input.projectRoot,
        inputManifestPath,
      );
      assertInputEntry(
        generationManifest.outputs,
        inputManifestFile,
        `${target.targetId} input manifest output`,
      );
      const inputManifest = verifySourceAnalysisInputManifest(
        inputManifestFile.value,
      );
      if (
        inputManifest.processingUnit.rawPdfSha256 !==
          target.source.rawContentSha256 ||
        inputManifest.identityKeys.length !== 1 ||
        inputManifest.identityKeys[0] !== target.preRegistrationCandidateKey ||
        inputManifest.identityAssociation.state !==
          "unregistered_source_candidate" ||
        inputManifest.identityAssociation.blockerCode !==
          "database_registration_required" ||
        inputManifest.sourceBinding.officialUrl !== target.source.officialUrl ||
        inputManifest.workflowEligibility.sourceAnalysis.allowed !== false ||
        inputManifest.totals.pageCount !== target.source.pageCount
      ) {
        fail(`${target.targetId}: source-analysis input binding differs`);
      }

      const pageMapFile = readArtifactFile(
        input.projectRoot,
        inputManifest.bindings.pageMap.path,
      );
      assertInputEntry(
        generationManifest.inputs,
        pageMapFile,
        `${target.targetId} page-map input`,
      );
      if (
        pageMapFile.fileSha256Bare !== inputManifest.bindings.pageMap.fileSha256
      ) {
        fail(
          `${target.targetId}: page-map file hash differs from input manifest`,
        );
      }
      const pageMap = PdfPageMapSchema.parse(pageMapFile.value) as PdfPageMap;
      if (
        !verifySealedPageMap(pageMap) ||
        pageMap.pageMapSha256 !==
          inputManifest.bindings.pageMap.pageMapSha256 ||
        pageMap.processingUnit.rawPdfSha256 !==
          target.source.rawContentSha256 ||
        pageMap.pages.length !== target.source.pageCount
      ) {
        fail(`${target.targetId}: page map seal or target binding differs`);
      }

      const extractionReceiptFile = readArtifactFile(
        input.projectRoot,
        inputManifest.bindings.extractionReceipt.path,
      );
      assertInputEntry(
        generationManifest.inputs,
        extractionReceiptFile,
        `${target.targetId} extraction-receipt input`,
      );
      if (
        extractionReceiptFile.fileSha256Bare !==
        inputManifest.bindings.extractionReceipt.fileSha256
      ) {
        fail(`${target.targetId}: extraction receipt file hash differs`);
      }
      const extractionReceipt = PdfQualificationReceiptSchema.parse(
        extractionReceiptFile.value,
      ) as PdfQualificationReceipt;
      if (
        !verifySealedQualificationReceipt(extractionReceipt) ||
        extractionReceipt.receiptSha256 !==
          inputManifest.bindings.extractionReceipt.receiptSha256 ||
        extractionReceipt.processingUnit.rawPdfSha256 !==
          target.source.rawContentSha256 ||
        extractionReceipt.qualificationState !==
          "technical_extraction_passed_identity_blocked" ||
        extractionReceipt.sourceFile.primaryCopy.verified !== true ||
        extractionReceipt.sourceFile.replicaCopy.verified !== true ||
        extractionReceipt.extraction.primaryPrivateOutputVerified !== true ||
        extractionReceipt.extraction.replicaPrivateOutputVerified !== true
      ) {
        fail(`${target.targetId}: extraction receipt seal or state differs`);
      }

      const privateMaterial = verifyTargetPrivateMaterial({
        target,
        pageMap,
        inputManifest,
        primaryRoot,
        replicaRoot,
      });
      return {
        target,
        acquisitionReceipt,
        evidence: {
          acquisitionReceipt: sealedBinding({
            file: acquisitionReceiptFile,
            internalSealType: "source_acquisition_receipt_sha256",
            internalSeal: acquisitionReceipt.receiptSha256,
          }),
          extractionReceipt: sealedBinding({
            file: extractionReceiptFile,
            internalSealType: "pdf_qualification_receipt_sha256",
            internalSeal: extractionReceipt.receiptSha256,
          }),
          pageMap: sealedBinding({
            file: pageMapFile,
            internalSealType: "pdf_page_map_sha256",
            internalSeal: pageMap.pageMapSha256,
          }),
          sourceAnalysisInputManifest: sealedBinding({
            file: inputManifestFile,
            internalSealType: "source_analysis_input_manifest_sha256",
            internalSeal: inputManifest.manifestSha256,
          }),
          privateVerification: privateMaterial.evidence,
        },
        contentBinding: privateMaterial.contentBinding,
      };
    },
  );

  return {
    batch,
    preparedTargets,
    inputBindings: {
      sourceRegistrationBatch: exactFileBinding(registrationFile),
      sourceAcquisitionBatch: exactFileBinding(acquisitionBatchFile),
      pdfExtractionBatch: exactFileBinding(extractionBatchFile),
      sourceAnalysisInputGenerationManifest: exactFileBinding(
        generationManifestFile,
      ),
      sourceRegistrationContract: contractBinding,
      sourceRegistrationJsonSchema: schemaBinding,
      sourceRegistrationRuntime: runtimeBinding,
      sourceRegistrationGenerator: generatorBinding,
      databaseSchema: databaseSchemaBinding,
    },
    privateRecoveryRegister,
    privateRecoveryRegisterFile,
  };
}

function buildIntent(
  prepared: PreparedSourceRegistrationTarget,
  batch: SourceRegistrationBatch,
  observedAt: string,
): RegistrationIntent {
  const target = prepared.target;
  const identityKey = canonicalDocumentIdentityKey(target.document.id);
  const lifecycleSourceId = lifecycleSourceIdForIdentity(identityKey);
  const documentBody = {
    id: target.document.id,
    slug: target.document.slug,
    filePath: target.document.filePath,
    title: target.document.title,
    author: target.document.author,
    year: target.document.year,
    documentType: target.document.documentType,
    category: target.document.category,
    subcategory: null,
    country: target.document.country,
    summary: null,
    url: target.source.officialUrl,
    accessedAt: prepared.acquisitionReceipt.completedAt,
    archivedUrl: null,
    wordCount: prepared.contentBinding.wordCount,
    tags: [...target.document.tags],
    metadata: {
      registration: {
        batchId: batch.batchId,
        targetId: target.targetId,
        identityStatus: "provisional" as const,
        sourceRoleStatus: "machine_provisional_only" as const,
        canonicalIdentityKey: identityKey,
        lifecycleSourceId,
      },
      source: {
        officialUrl: target.source.officialUrl,
        doi: target.source.doi,
        publicationDateStatement: target.source.publicationDateStatement,
        languageCodes: [...target.source.languageCodes],
        rawContentSha256: target.source.rawContentSha256,
        rawContentSizeBytes: target.source.rawContentSizeBytes,
        pageCount: target.source.pageCount,
      },
      readiness: {
        identityVerified: false as const,
        sourceAnalysisComplete: false as const,
        ownerReviewComplete: false as const,
        independentExpertReviewComplete: false as const,
        partnerReviewComplete: false as const,
        rightsHolderReviewComplete: false as const,
        rightsCleared: false as const,
        publicationReady: false as const,
        externalUseAllowed: false as const,
        coveragePromotionAllowed: false as const,
      },
    },
    contentBinding: prepared.contentBinding,
  };
  const intendedDocumentRow: IntendedDocumentRow = {
    ...documentBody,
    createdAt: observedAt,
    updatedAt: observedAt,
    targetDataSha256: documentTargetDataSha256(documentBody),
  };
  const libraryBody = {
    id: libraryAnalysisIdForIdentity(identityKey),
    sourceKind: "document" as const,
    sourceKey: identityKey,
    documentId: target.document.id,
    sourceDocId: null,
    canonicalPath: target.document.filePath,
    title: target.document.title,
    status: "not_started" as const,
    usageRule: "internal_background" as const,
    reviewStatus: "not_reviewed" as const,
    citationReadiness: null,
    analysisTier: "inventory_only" as const,
    aiCard: null,
    aiSummary: null,
    keyFindings: [] as [],
    claimCandidates: null,
    projectImplications: [] as [],
    gaps: null,
    controlLinks: {
      sourceRegistrationBatch: SOURCE_REGISTRATION_PATHS.batch,
      acquisitionReceipt: prepared.evidence.acquisitionReceipt.path,
      extractionReceipt: prepared.evidence.extractionReceipt.path,
      pageMap: prepared.evidence.pageMap.path,
      sourceAnalysisInputManifest:
        prepared.evidence.sourceAnalysisInputManifest.path,
    },
    riskFlags: [
      "identity_provisional",
      "owner_review_required",
      "rights_pending_not_cleared",
      "source_analysis_not_started",
    ] as [
      "identity_provisional",
      "owner_review_required",
      "rights_pending_not_cleared",
      "source_analysis_not_started",
    ],
    contentHash: target.source.rawContentSha256,
    wordCount: prepared.contentBinding.wordCount,
    processedAt: null,
    reviewedAt: null,
    reviewer: null,
  };
  const intendedLibraryAnalysisRow: IntendedLibraryRow = {
    ...libraryBody,
    createdAt: observedAt,
    updatedAt: observedAt,
    targetDataSha256: libraryTargetDataSha256(libraryBody),
  };
  return {
    target,
    evidence: prepared.evidence,
    intendedDocumentRow,
    intendedLibraryAnalysisRow,
    intendedPrivateRecoveryRow: {
      identityKey,
      canonicalPath: target.document.filePath,
      sha256: target.source.rawContentSha256,
      sizeBytes: target.source.rawContentSizeBytes,
      internalLocator: `private://corpus/sha256/${target.source.rawContentSha256}`,
      replicaClass: "bigbrain_private_archive",
      repositoryAvailable: false,
      fullTextReviewed: false,
      rightsState: "pending_not_cleared",
    },
  };
}

function iso(value: Date | string | null): string | null {
  if (value === null) return null;
  return (value instanceof Date ? value : new Date(value)).toISOString();
}

function jsonHash(value: unknown): string {
  return hashSourceRegistrationJson(
    "food-systems-2026:source-registration-db-field:v1\0",
    value as SourceRegistrationJsonValue,
  );
}

function nullableJsonHash(value: unknown): string | null {
  return value === null || value === undefined ? null : jsonHash(value);
}

function targetDocumentContract(
  row: DocumentDbRow,
): SourceRegistrationJsonValue {
  return {
    id: row.id,
    slug: row.slug,
    filePath: row.filePath,
    title: row.title,
    author: row.author,
    year: row.year,
    documentType: row.documentType,
    category: row.category,
    subcategory: row.subcategory,
    country: row.country,
    contentSha256: sourceRegistrationSha256(Buffer.from(row.content, "utf8")),
    contentSizeBytes: Buffer.byteLength(row.content, "utf8"),
    summary: row.summary,
    url: row.url,
    accessedAt: iso(row.accessedAt),
    archivedUrl: row.archivedUrl,
    wordCount: row.wordCount,
    tags: row.tags,
    metadata: row.metadata,
  } as unknown as SourceRegistrationJsonValue;
}

function targetLibraryContract(row: LibraryDbRow): SourceRegistrationJsonValue {
  return {
    id: row.id,
    sourceKind: row.sourceKind,
    sourceKey: row.sourceKey,
    documentId: row.documentId,
    sourceDocId: row.sourceDocId,
    canonicalPath: row.canonicalPath,
    title: row.title,
    status: row.status,
    usageRule: row.usageRule,
    reviewStatus: row.reviewStatus,
    citationReadiness: row.citationReadiness,
    analysisTier: row.analysisTier,
    aiCard: row.aiCard as SourceRegistrationJsonValue,
    aiSummary: row.aiSummary,
    keyFindings: row.keyFindings,
    claimCandidates: row.claimCandidates as SourceRegistrationJsonValue,
    projectImplications: row.projectImplications,
    gaps: row.gaps as SourceRegistrationJsonValue,
    controlLinks: row.controlLinks as SourceRegistrationJsonValue,
    riskFlags: row.riskFlags,
    contentHash: row.contentHash,
    wordCount: row.wordCount,
    processedAt: iso(row.processedAt),
    reviewedAt: iso(row.reviewedAt),
    reviewer: row.reviewer,
  };
}

function documentCollisionFields(
  row: DocumentDbRow,
  intents: RegistrationIntent[],
): DocumentSnapshotRow["collisionFields"] {
  const fields = new Set<DocumentSnapshotRow["collisionFields"][number]>();
  for (const intent of intents) {
    const target = intent.intendedDocumentRow;
    if (row.id === target.id) fields.add("id");
    if (row.slug === target.slug) fields.add("slug");
    if (row.filePath === target.filePath) fields.add("filePath");
    if (row.url === target.url) fields.add("url");
  }
  return [...fields].sort();
}

function libraryCollisionFields(
  row: LibraryDbRow,
  intents: RegistrationIntent[],
): LibrarySnapshotRow["collisionFields"] {
  const fields = new Set<LibrarySnapshotRow["collisionFields"][number]>();
  for (const intent of intents) {
    const target = intent.intendedLibraryAnalysisRow;
    if (row.id === target.id) fields.add("id");
    if (row.sourceKey === target.sourceKey) fields.add("sourceKey");
    if (row.documentId === target.documentId) fields.add("documentId");
    if (row.canonicalPath === target.canonicalPath) fields.add("canonicalPath");
    if (row.contentHash === target.contentHash) fields.add("contentHash");
  }
  return [...fields].sort();
}

function safeDocumentSnapshot(
  row: DocumentDbRow,
  intents: RegistrationIntent[],
): DocumentSnapshotRow {
  const fullRow = {
    ...row,
    accessedAt: iso(row.accessedAt),
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
  const contentBytes = Buffer.from(row.content, "utf8");
  return {
    id: row.id,
    slug: row.slug,
    filePath: row.filePath,
    title: row.title,
    author: row.author,
    year: row.year,
    documentType: row.documentType,
    category: row.category,
    subcategory: row.subcategory,
    country: row.country,
    url: row.url,
    accessedAt: iso(row.accessedAt),
    archivedUrl: row.archivedUrl,
    wordCount: row.wordCount,
    tags: row.tags,
    createdAt: iso(row.createdAt)!,
    updatedAt: iso(row.updatedAt)!,
    contentSha256: sourceRegistrationSha256(contentBytes),
    contentSizeBytes: contentBytes.length,
    summarySha256:
      row.summary === null
        ? null
        : sourceRegistrationSha256(Buffer.from(row.summary, "utf8")),
    metadataSha256: nullableJsonHash(row.metadata),
    targetDataSha256: hashSourceRegistrationJson(
      SOURCE_REGISTRATION_TARGET_HASH_DOMAIN,
      targetDocumentContract(row),
    ),
    rowSha256: jsonHash(fullRow),
    collisionFields: documentCollisionFields(row, intents),
  };
}

function safeLibrarySnapshot(
  row: LibraryDbRow,
  intents: RegistrationIntent[],
): LibrarySnapshotRow {
  const fullRow = {
    ...row,
    processedAt: iso(row.processedAt),
    reviewedAt: iso(row.reviewedAt),
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
  return {
    id: row.id,
    sourceKind: row.sourceKind,
    sourceKey: row.sourceKey,
    documentId: row.documentId,
    sourceDocId: row.sourceDocId,
    canonicalPath: row.canonicalPath,
    title: row.title,
    status: row.status,
    usageRule: row.usageRule,
    reviewStatus: row.reviewStatus,
    citationReadiness: row.citationReadiness,
    analysisTier: row.analysisTier,
    contentHash: row.contentHash,
    wordCount: row.wordCount,
    processedAt: iso(row.processedAt),
    reviewedAt: iso(row.reviewedAt),
    reviewer: row.reviewer,
    createdAt: iso(row.createdAt)!,
    updatedAt: iso(row.updatedAt)!,
    riskFlags: row.riskFlags,
    aiCardSha256: nullableJsonHash(row.aiCard),
    aiSummarySha256:
      row.aiSummary === null
        ? null
        : sourceRegistrationSha256(Buffer.from(row.aiSummary, "utf8")),
    keyFindingsSha256: jsonHash(row.keyFindings),
    claimCandidatesSha256: nullableJsonHash(row.claimCandidates),
    projectImplicationsSha256: jsonHash(row.projectImplications),
    gapsSha256: nullableJsonHash(row.gaps),
    controlLinksSha256: nullableJsonHash(row.controlLinks),
    targetDataSha256: hashSourceRegistrationJson(
      SOURCE_REGISTRATION_TARGET_HASH_DOMAIN,
      targetLibraryContract(row),
    ),
    rowSha256: jsonHash(fullRow),
    collisionFields: libraryCollisionFields(row, intents),
  };
}

export async function inspectSourceRegistrationDatabase(
  prisma: PrismaClient,
  intentsAtPlaceholderTime: RegistrationIntent[],
): Promise<SourceRegistrationDbInspection> {
  return prisma.$transaction(
    async (tx) => {
      await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
      const transactionRows = (await tx.$queryRawUnsafe(`
        SELECT
          transaction_timestamp() AS observed_at,
          current_setting('transaction_read_only') AS transaction_read_only,
          current_user AS database_role,
          current_setting('server_version') AS server_version
      `)) as Array<{
        observed_at: Date;
        transaction_read_only: string;
        database_role: string;
        server_version: string;
      }>;
      const transactionRow = transactionRows[0];
      if (!transactionRow || transactionRow.transaction_read_only !== "on") {
        fail("database transaction did not prove transaction_read_only=on");
      }
      const identityRows = (await tx.$queryRawUnsafe(`
        SELECT "key", "identityUuid"::text AS identity_uuid
        FROM "DatabaseIdentity"
        WHERE "key" = 'primary'
        ORDER BY "key"
      `)) as Array<{ key: string; identity_uuid: string }>;
      if (identityRows.length !== 1 || identityRows[0]!.key !== "primary") {
        fail("expected exactly one primary DatabaseIdentity row");
      }
      const migrationRows = (await tx.$queryRawUnsafe(`
        SELECT migration_name, checksum, finished_at, applied_steps_count
        FROM _prisma_migrations
        WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL
        ORDER BY migration_name, finished_at, id
      `)) as Array<{
        migration_name: string;
        checksum: string;
        finished_at: Date;
        applied_steps_count: number;
      }>;
      if (migrationRows.length === 0)
        fail("completed migration ledger is empty");
      const countRows = (await tx.$queryRawUnsafe(`
        SELECT
          (SELECT COUNT(*)::int FROM "Document") AS documents,
          (SELECT COUNT(*)::int FROM "LibraryAnalysisRecord") AS library_analysis_records,
          (SELECT COUNT(*)::int FROM "ControlledMutationAudit") AS controlled_mutation_audits
      `)) as Array<{
        documents: number;
        library_analysis_records: number;
        controlled_mutation_audits: number;
      }>;
      const countRow = countRows[0];
      if (!countRow) fail("database counts query returned no row");
      const documentIds = intentsAtPlaceholderTime.map(
        (intent) => intent.intendedDocumentRow.id,
      );
      const slugs = intentsAtPlaceholderTime.map(
        (intent) => intent.intendedDocumentRow.slug,
      );
      const paths = intentsAtPlaceholderTime.map(
        (intent) => intent.intendedDocumentRow.filePath,
      );
      const urls = intentsAtPlaceholderTime.map(
        (intent) => intent.intendedDocumentRow.url,
      );
      const libraryIds = intentsAtPlaceholderTime.map(
        (intent) => intent.intendedLibraryAnalysisRow.id,
      );
      const sourceKeys = intentsAtPlaceholderTime.map(
        (intent) => intent.intendedLibraryAnalysisRow.sourceKey,
      );
      const contentHashes = intentsAtPlaceholderTime.map(
        (intent) => intent.intendedLibraryAnalysisRow.contentHash,
      );
      const [documents, libraries] = await Promise.all([
        tx.document.findMany({
          where: {
            OR: [
              { id: { in: documentIds } },
              { slug: { in: slugs } },
              { filePath: { in: paths } },
              { url: { in: urls } },
            ],
          },
          select: documentSelect,
          orderBy: { id: "asc" },
        }),
        tx.libraryAnalysisRecord.findMany({
          where: {
            OR: [
              { id: { in: libraryIds } },
              { sourceKey: { in: sourceKeys } },
              { documentId: { in: documentIds } },
              { canonicalPath: { in: paths } },
              { contentHash: { in: contentHashes } },
            ],
          },
          select: librarySelect,
          orderBy: { id: "asc" },
        }),
      ]);
      const migrationLedger = migrationRows.map((row) => ({
        migrationName: row.migration_name,
        checksum: row.checksum,
        finishedAt: iso(row.finished_at),
        appliedStepsCount: row.applied_steps_count,
      }));
      return {
        observedAt: transactionRow.observed_at.toISOString(),
        transaction: {
          readOnly: true,
          isolationLevel: "RepeatableRead",
          transactionReadOnlySetting: "on",
          databaseRole: transactionRow.database_role,
          serverVersion: transactionRow.server_version,
        },
        databaseIdentity: {
          key: "primary",
          identityUuid: identityRows[0]!.identity_uuid.toLowerCase(),
        },
        completedMigrationLedger: {
          count: migrationRows.length,
          sha256: jsonHash(migrationLedger),
        },
        coreCounts: {
          documents: countRow.documents,
          libraryAnalysisRecords: countRow.library_analysis_records,
          controlledMutationAudits: countRow.controlled_mutation_audits,
        },
        documentRows: documents.map((row) =>
          safeDocumentSnapshot(row, intentsAtPlaceholderTime),
        ),
        libraryRows: libraries.map((row) =>
          safeLibrarySnapshot(row, intentsAtPlaceholderTime),
        ),
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
      maxWait: 20_000,
      timeout: 120_000,
    },
  );
}

function documentMatchesTarget(
  row: DocumentSnapshotRow,
  target: IntendedDocumentRow,
): boolean {
  return (
    row.id === target.id ||
    row.slug === target.slug ||
    row.filePath === target.filePath ||
    row.url === target.url
  );
}

function libraryMatchesTarget(
  row: LibrarySnapshotRow,
  target: IntendedLibraryRow,
): boolean {
  return (
    row.id === target.id ||
    row.sourceKey === target.sourceKey ||
    row.documentId === target.documentId ||
    row.canonicalPath === target.canonicalPath ||
    row.contentHash === target.contentHash
  );
}

function samePrivateRecoveryRow(
  left: PlannedPrivateRecoveryRow,
  right: PlannedPrivateRecoveryRow,
): boolean {
  return (
    canonicalSourceRegistrationJson(left) ===
    canonicalSourceRegistrationJson(right)
  );
}

function classifyTarget(input: {
  intent: RegistrationIntent;
  beforeSnapshot: DatabaseBeforeSnapshot;
}): SourceRegistrationTargetPlan {
  const intent = input.intent;
  const documents = input.beforeSnapshot.targetScope.documentRows.filter(
    (row) => documentMatchesTarget(row, intent.intendedDocumentRow),
  );
  const libraries = input.beforeSnapshot.targetScope.libraryAnalysisRows.filter(
    (row) => libraryMatchesTarget(row, intent.intendedLibraryAnalysisRow),
  );
  const exactDocuments = documents.filter(
    (row) =>
      row.id === intent.intendedDocumentRow.id &&
      row.targetDataSha256 === intent.intendedDocumentRow.targetDataSha256,
  );
  const exactLibraries = libraries.filter(
    (row) =>
      row.id === intent.intendedLibraryAnalysisRow.id &&
      row.targetDataSha256 ===
        intent.intendedLibraryAnalysisRow.targetDataSha256,
  );
  const matchingRecovery =
    input.beforeSnapshot.privateRecoveryRegister.matchingRows.filter(
      (row) =>
        row.identityKey === intent.intendedPrivateRecoveryRow.identityKey ||
        row.canonicalPath === intent.intendedPrivateRecoveryRow.canonicalPath ||
        row.sha256 === intent.intendedPrivateRecoveryRow.sha256,
    );
  const exactRecovery = matchingRecovery.filter((row) =>
    samePrivateRecoveryRow(row, intent.intendedPrivateRecoveryRow),
  );
  const privateRecoveryState =
    matchingRecovery.length === 0
      ? ("pending_append" as const)
      : matchingRecovery.length === 1 && exactRecovery.length === 1
        ? ("already_present_exact" as const)
        : ("conflict" as const);
  const conflicts: SourceRegistrationTargetPlan["conflicts"] = [];
  const exactRegisteredPair =
    documents.length === 1 &&
    exactDocuments.length === 1 &&
    libraries.length === 1 &&
    exactLibraries.length === 1;
  const cleanPending = documents.length === 0 && libraries.length === 0;
  if (!cleanPending && !exactRegisteredPair) {
    if (documents.length > 0) {
      conflicts.push({
        code:
          exactDocuments.length > 0
            ? "registered_row_drift"
            : "document_collision",
        detail:
          exactDocuments.length > 0
            ? "An exact Document row is mixed with another collision or incomplete LibraryAnalysisRecord state."
            : "One or more Document rows collide on id, slug, filePath or URL without matching the exact target row.",
        evidenceRowSha256: documents.map((row) => row.rowSha256).sort(),
      });
    }
    if (libraries.length > 0) {
      conflicts.push({
        code:
          exactLibraries.length > 0
            ? "registered_row_drift"
            : "library_analysis_collision",
        detail:
          exactLibraries.length > 0
            ? "An exact LibraryAnalysisRecord is mixed with another collision or incomplete Document state."
            : "One or more LibraryAnalysisRecord rows collide without matching the exact inventory-only target row.",
        evidenceRowSha256: libraries.map((row) => row.rowSha256).sort(),
      });
    }
    if (
      (documents.length === 0 && libraries.length > 0) ||
      (documents.length > 0 && libraries.length === 0) ||
      exactDocuments.length !== exactLibraries.length
    ) {
      conflicts.push({
        code: "partial_registration_state",
        detail:
          "Document and LibraryAnalysisRecord are in a mixed or partial registration state.",
        evidenceRowSha256: [
          ...documents.map((row) => row.rowSha256),
          ...libraries.map((row) => row.rowSha256),
        ].sort(),
      });
    }
  }
  if (privateRecoveryState === "conflict") {
    conflicts.push({
      code: "private_recovery_collision",
      detail:
        "The private recovery register contains a non-exact row sharing the target identity, path or content hash.",
      evidenceRowSha256: matchingRecovery.map((row) => jsonHash(row)).sort(),
    });
  }
  const state =
    conflicts.length > 0
      ? ("conflict" as const)
      : exactRegisteredPair
        ? ("already_registered" as const)
        : ("pending" as const);
  return {
    targetId: intent.target.targetId,
    preRegistrationCandidateKey: intent.target.preRegistrationCandidateKey,
    canonicalIdentityKey: intent.intendedPrivateRecoveryRow.identityKey,
    lifecycleSourceId: lifecycleSourceIdForIdentity(
      intent.intendedPrivateRecoveryRow.identityKey,
    ),
    state,
    artifactEvidence: intent.evidence,
    intendedDocumentRow: intent.intendedDocumentRow,
    intendedLibraryAnalysisRow: intent.intendedLibraryAnalysisRow,
    intendedPrivateRecoveryRow: intent.intendedPrivateRecoveryRow,
    observedDocumentRowSha256: documents.map((row) => row.rowSha256).sort(),
    observedLibraryRowSha256: libraries.map((row) => row.rowSha256).sort(),
    privateRecoveryState,
    conflicts,
    permissions: {
      registrationApplyAllowed: false,
      identityVerificationComplete: false,
      sourceAnalysisAllowed: false,
      externalUseAllowed: false,
      coveragePromotionAllowed: false,
    },
  };
}

function recoveryRowsForTargets(input: {
  register: z.infer<typeof privateRecoveryRegisterSchema>;
  intents: RegistrationIntent[];
}): PlannedPrivateRecoveryRow[] {
  const identityKeys = new Set(
    input.intents.map(
      (intent) => intent.intendedPrivateRecoveryRow.identityKey,
    ),
  );
  const paths = new Set(
    input.intents.map(
      (intent) => intent.intendedPrivateRecoveryRow.canonicalPath,
    ),
  );
  const hashes = new Set(
    input.intents.map((intent) => intent.intendedPrivateRecoveryRow.sha256),
  );
  return input.register.candidates
    .filter(
      (candidate) =>
        identityKeys.has(candidate.identityKey) ||
        paths.has(candidate.canonicalPath) ||
        hashes.has(candidate.sha256),
    )
    .map((candidate) => ({
      identityKey: candidate.identityKey,
      canonicalPath: candidate.canonicalPath,
      sha256: candidate.sha256,
      sizeBytes: candidate.sizeBytes,
      internalLocator: candidate.internalLocator,
      replicaClass: candidate.replicaClass,
      repositoryAvailable: candidate.repositoryAvailable,
      fullTextReviewed: candidate.fullTextReviewed,
      rightsState: candidate.rightsState,
    }))
    .sort((left, right) => left.identityKey.localeCompare(right.identityKey));
}

export function buildSourceRegistrationPlan(input: {
  batch: SourceRegistrationBatch;
  preparedTargets: PreparedSourceRegistrationTarget[];
  inputBindings: SourceRegistrationPlan["inputBindings"];
  databaseInspection: SourceRegistrationDbInspection;
  privateRecoveryRegister: z.infer<typeof privateRecoveryRegisterSchema>;
  privateRecoveryRegisterFile: SourceRegistrationArtifactFile;
}): SourceRegistrationPlan {
  const intents = input.preparedTargets.map((prepared) =>
    buildIntent(prepared, input.batch, input.databaseInspection.observedAt),
  );
  const matchingRows = recoveryRowsForTargets({
    register: input.privateRecoveryRegister,
    intents,
  });
  const targetScope = {
    documentRows: input.databaseInspection.documentRows,
    libraryAnalysisRows: input.databaseInspection.libraryRows,
    targetScopeSha256: hashSourceRegistrationJson(
      "food-systems-2026:source-registration-target-scope:v1\0",
      {
        documentRows: input.databaseInspection.documentRows,
        libraryAnalysisRows: input.databaseInspection.libraryRows,
      },
    ),
  };
  const beforeSnapshot = sealDatabaseBeforeSnapshot({
    observedAt: input.databaseInspection.observedAt,
    transaction: input.databaseInspection.transaction,
    databaseIdentity: input.databaseInspection.databaseIdentity,
    completedMigrationLedger: input.databaseInspection.completedMigrationLedger,
    coreCounts: input.databaseInspection.coreCounts,
    targetScope,
    privateRecoveryRegister: {
      path: input.privateRecoveryRegisterFile.path,
      fileSha256: input.privateRecoveryRegisterFile.fileSha256,
      candidateCount: input.privateRecoveryRegister.candidates.length,
      matchingRows,
      matchingRowsSha256: jsonHash(matchingRows),
    },
  });
  const targets = intents
    .map((intent) => classifyTarget({ intent, beforeSnapshot }))
    .sort((left, right) => left.targetId.localeCompare(right.targetId));
  const body = {
    schemaVersion: SOURCE_REGISTRATION_PLAN_SCHEMA_VERSION,
    artifactType: "source_registration_dry_run_plan" as const,
    planVersion: SOURCE_REGISTRATION_PLAN_VERSION,
    contractVersion: SOURCE_REGISTRATION_CONTRACT_VERSION,
    mode: "read_only_dry_run" as const,
    batchId: input.batch.batchId,
    preparedOn: input.batch.preparedOn,
    observedAt: input.databaseInspection.observedAt,
    contractSha256: sourceRegistrationContractSha256(),
    inputBindings: input.inputBindings,
    beforeSnapshot,
    targets,
    summary: {
      targetCount: 10 as const,
      pendingCount: targets.filter((target) => target.state === "pending")
        .length,
      alreadyRegisteredCount: targets.filter(
        (target) => target.state === "already_registered",
      ).length,
      conflictCount: targets.filter((target) => target.state === "conflict")
        .length,
      privateRecoveryAppendCount: targets.filter(
        (target) => target.privateRecoveryState === "pending_append",
      ).length,
      pageCount: targets.reduce(
        (sum, target) =>
          sum + target.intendedDocumentRow.contentBinding.pageCount,
        0,
      ),
      normalizedWordCount: targets.reduce(
        (sum, target) => sum + target.intendedDocumentRow.wordCount,
        0,
      ),
    },
    executionBoundary: {
      networkAccessPerformed: false as const,
      databaseTransactionReadOnly: true as const,
      databaseMutationPerformed: false as const,
      privateArchiveMutationPerformed: false as const,
      privateRecoveryRegisterMutationPerformed: false as const,
      corpusRegisterMutationPerformed: false as const,
      lifecycleEventMutationPerformed: false as const,
      sourceTextStoredInPlan: false as const,
      privateAbsolutePathsStoredInPlan: false as const,
      applyCliEnabled: false as const,
    },
    releaseGates: defaultSourceRegistrationReleaseGates(),
  };
  return validateSourceRegistrationPlan(sealSourceRegistrationPlan(body));
}

function atomicExclusiveWrite(
  projectRoot: string,
  path: string,
  content: string,
): void {
  assertPortablePath(path, "output path");
  const root = realpathSync(projectRoot);
  const output = resolve(root, path);
  if (!isInside(root, output)) fail("output escaped repository root");
  if (existsSync(output))
    fail(`output already exists and will not be overwritten: ${path}`);
  mkdirSync(dirname(output), { recursive: true });
  const temporary = `${output}.tmp-${process.pid}`;
  let fd: number | null = null;
  try {
    fd = openSync(temporary, "wx", 0o600);
    writeFileSync(fd, content, "utf8");
    fsyncSync(fd);
    closeSync(fd);
    fd = null;
    renameSync(temporary, output);
  } catch (error) {
    if (fd !== null) closeSync(fd);
    if (existsSync(temporary)) unlinkSync(temporary);
    throw error;
  }
}

export async function generateLiveSourceRegistrationPlan(input: {
  projectRoot: string;
  manifestPath: string;
  primaryCorpusRoot: string;
  replicaCorpusRoot: string;
  databaseUrl: string;
}): Promise<SourceRegistrationPlan> {
  const prepared = prepareSourceRegistrationInputs(input);
  const placeholderObservedAt = "2000-01-01T00:00:00.000Z";
  const placeholderIntents = prepared.preparedTargets.map((target) =>
    buildIntent(target, prepared.batch, placeholderObservedAt),
  );
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: input.databaseUrl }),
  });
  try {
    const databaseInspection = await inspectSourceRegistrationDatabase(
      prisma,
      placeholderIntents,
    );
    return buildSourceRegistrationPlan({
      ...prepared,
      databaseInspection,
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function main(): Promise<void> {
  const options = parseSourceRegistrationArgs(process.argv.slice(2));
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl)
    fail("DATABASE_URL is required for the read-only DB snapshot");
  const projectRoot = process.cwd();
  const plan = await generateLiveSourceRegistrationPlan({
    projectRoot,
    manifestPath: options.manifestPath,
    primaryCorpusRoot: options.primaryCorpusRoot,
    replicaCorpusRoot: options.replicaCorpusRoot,
    databaseUrl,
  });
  const content = `${JSON.stringify(plan, null, 2)}\n`;
  if (options.outputPath)
    atomicExclusiveWrite(projectRoot, options.outputPath, content);
  process.stdout.write(
    `${JSON.stringify({
      mode: plan.mode,
      batchId: plan.batchId,
      planSha256: plan.planSha256,
      beforeSnapshotSha256: plan.beforeSnapshot.beforeSnapshotSha256,
      summary: plan.summary,
      output: options.outputPath,
      applyEnabled: false,
      databaseMutationPerformed: false,
      networkAccessPerformed: false,
    })}\n`,
  );
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : null;
if (invokedPath === import.meta.url) {
  main().catch((error) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  });
}
