import assert from "node:assert/strict";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  readdirSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, isAbsolute, join, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { TextDecoder } from "node:util";

import { z } from "zod";

import {
  PdfPageMapSchema,
  PdfQualificationReceiptSchema,
  canonicalJson,
  countUnicodeCharacters,
  countUnicodeWords,
  sha256,
  verifySealedPageMap,
  verifySealedQualificationReceipt,
  type JsonValue,
  type PdfPageMap,
  type PdfQualificationReceipt,
} from "../../src/lib/knowledge/pdf-page-extraction-qualification";
import {
  SOURCE_ANALYSIS_INPUT_PIPELINE_VERSION,
  SOURCE_ANALYSIS_INPUT_PRIVATE_STORAGE,
  SOURCE_ANALYSIS_INPUT_READINESS,
  SOURCE_ANALYSIS_INPUT_SCHEMA_VERSION,
  SOURCE_ANALYSIS_INPUT_SERIALIZATION,
  SourceAnalysisInputManifestSchema,
  SourceAnalysisInputRepositoryPathSchema,
  sealSourceAnalysisInputManifest,
  serializeNormalizedInput,
  sourceAnalysisInputWorkflowEligibility,
  sourceAnalysisInputTotals,
  verifySourceAnalysisInputManifest,
  type SourceAnalysisInputManifest,
  type SourceAnalysisInputPage,
} from "../../src/lib/knowledge/source-analysis-input-manifest";

export const SOURCE_ANALYSIS_INPUT_ROOT =
  "knowledge/corpus/source-analysis-input-manifests";
export const SOURCE_ANALYSIS_INPUT_MANIFEST_DIRECTORY = `${SOURCE_ANALYSIS_INPUT_ROOT}/manifests`;
export const SOURCE_ANALYSIS_INPUT_SUMMARY_PATH = `${SOURCE_ANALYSIS_INPUT_ROOT}/source-analysis-input-summary.v1.json`;
export const SOURCE_ANALYSIS_INPUT_GENERATION_MANIFEST_PATH = `${SOURCE_ANALYSIS_INPUT_ROOT}/source-analysis-input-generation-manifest.v1.json`;
export const SOURCE_ANALYSIS_INPUT_README_PATH = `${SOURCE_ANALYSIS_INPUT_ROOT}/README.md`;
export const SOURCE_ANALYSIS_INPUT_GENERATOR_PATH =
  "scripts/knowledge/generate-source-analysis-input-manifests.ts";
export const SOURCE_ANALYSIS_INPUT_LIBRARY_PATH =
  "src/lib/knowledge/source-analysis-input-manifest.ts";
export const SOURCE_ANALYSIS_INPUT_JSON_SCHEMA_PATH =
  "knowledge/schema/source-analysis-input-manifest.schema.v1.json";
export const PDF_EXTRACTION_LIBRARY_PATH =
  "src/lib/knowledge/pdf-page-extraction-qualification.ts";
export const PDF_PAGE_MAP_DIRECTORY =
  "knowledge/corpus/pdf-page-extraction/page-maps";
export const PDF_EXTRACTION_RECEIPT_DIRECTORY =
  "knowledge/corpus/pdf-page-extraction/receipts";

const HASH_PATTERN = /^[a-f0-9]{64}$/;
const PAGE_MAP_NAME_PATTERN = /^([a-f0-9]{64})\.page-map\.v1\.json$/;
const RECEIPT_NAME_PATTERN = /^([a-f0-9]{64})\.receipt\.v1\.json$/;

type SourceUnit = {
  rawPdfSha256: string;
  pageMapPath: string;
  pageMapBytes: Buffer;
  pageMapFileSha256: string;
  pageMap: PdfPageMap;
  receiptPath: string;
  receiptBytes: Buffer;
  receiptFileSha256: string;
  receipt: PdfQualificationReceipt;
};

type TrackedArtifact = { path: string; content: string };
type FileSnapshot = { path: string; sha256: string; sizeBytes: number };

const SUMMARY_SCHEMA = z
  .object({
    schemaVersion: z.literal(SOURCE_ANALYSIS_INPUT_SCHEMA_VERSION),
    artifactType: z.literal("source_analysis_input_summary"),
    pipelineVersion: z.literal(SOURCE_ANALYSIS_INPUT_PIPELINE_VERSION),
    processingUnit: z.literal("raw_pdf_sha256"),
    sourceCount: z.number().int().positive(),
    totals: z
      .object({
        pageCount: z.number().int().positive(),
        normalizedSizeBytes: z.number().int().nonnegative(),
        normalizedCharacterCount: z.number().int().nonnegative(),
        wordCount: z.number().int().nonnegative(),
      })
      .strict(),
    documents: z
      .array(
        z
          .object({
            rawPdfSha256: z.string().regex(HASH_PATTERN),
            manifestPath: SourceAnalysisInputRepositoryPathSchema,
            manifestSha256: z.string().regex(HASH_PATTERN),
            normalizedInputSha256: z.string().regex(HASH_PATTERN),
            workflowEligibilityState: z.enum([
              "identity_verification_candidate",
              "blocked_identity_association",
              "source_analysis_eligible",
            ]),
            identityVerificationAllowed: z.boolean(),
            sourceAnalysisAllowed: z.boolean(),
            pageCount: z.number().int().positive(),
            normalizedSizeBytes: z.number().int().nonnegative(),
            normalizedCharacterCount: z.number().int().nonnegative(),
            wordCount: z.number().int().nonnegative(),
          })
          .strict(),
      )
      .min(1),
    workflowEligibility: z
      .object({
        identityVerificationCandidateCount: z.number().int().nonnegative(),
        blockedIdentityAssociationCount: z.number().int().nonnegative(),
        sourceAnalysisAllowedCount: z.number().int().nonnegative(),
      })
      .strict(),
    textIncludedInTrackedArtifact: z.literal(false),
    readiness: z
      .object({
        aiAnalysisComplete: z.literal(false),
        ownerReviewComplete: z.literal(false),
        independentExpertReviewComplete: z.literal(false),
        partnerReviewComplete: z.literal(false),
        rightsHolderReviewComplete: z.literal(false),
        rightsCleared: z.literal(false),
        publicationReady: z.literal(false),
        coveragePromotionAllowed: z.literal(false),
      })
      .strict(),
    summarySha256: z.string().regex(HASH_PATTERN),
  })
  .strict();

type Summary = z.infer<typeof SUMMARY_SCHEMA>;

const GENERATION_MANIFEST_SCHEMA = z
  .object({
    schemaVersion: z.literal(SOURCE_ANALYSIS_INPUT_SCHEMA_VERSION),
    artifactType: z.literal("source_analysis_input_generation_manifest"),
    pipelineVersion: z.literal(SOURCE_ANALYSIS_INPUT_PIPELINE_VERSION),
    inputs: z
      .array(
        z
          .object({
            path: SourceAnalysisInputRepositoryPathSchema,
            sha256: z.string().regex(HASH_PATTERN),
            sizeBytes: z.number().int().nonnegative(),
          })
          .strict(),
      )
      .min(1),
    outputs: z
      .array(
        z
          .object({
            path: SourceAnalysisInputRepositoryPathSchema,
            sha256: z.string().regex(HASH_PATTERN),
            sizeBytes: z.number().int().nonnegative(),
          })
          .strict(),
      )
      .min(1),
    outputSetSha256: z.string().regex(HASH_PATTERN),
    semantics: z
      .object({
        portableTrackedValidationSupported: z.literal(true),
        privateValidationRequiresBothArchiveRoots: z.literal(true),
        privateFilesWrittenByThisPipeline: z.literal(false),
        sourceTextIncludedInTrackedArtifacts: z.literal(false),
        aiAnalysisComplete: z.literal(false),
        ownerReviewComplete: z.literal(false),
        independentExpertReviewComplete: z.literal(false),
        partnerReviewComplete: z.literal(false),
        rightsHolderReviewComplete: z.literal(false),
        rightsCleared: z.literal(false),
        publicationReady: z.literal(false),
        coveragePromotionAllowed: z.literal(false),
      })
      .strict(),
    generationManifestSha256: z.string().regex(HASH_PATTERN),
  })
  .strict();

type GenerationManifest = z.infer<typeof GENERATION_MANIFEST_SCHEMA>;

export class SourceAnalysisInputManifestError extends Error {
  constructor(
    readonly blockerCode: string,
    message: string,
  ) {
    super(`${blockerCode}: ${message}`);
    this.name = "SourceAnalysisInputManifestError";
  }
}

function fail(blockerCode: string, message: string): never {
  throw new SourceAnalysisInputManifestError(blockerCode, message);
}

type PrivateArchiveRoot = {
  copyId: "primary" | "replica";
  realPath: string;
  device: number;
  inode: number;
};

type PrivateFileObservation = {
  path: string;
  bytes: Buffer;
  device: number;
  inode: number;
};

function fileMode(path: string): string {
  return (lstatSync(path).mode & 0o777).toString(8).padStart(4, "0");
}

function inspectPrivateArchiveRoot(
  path: string,
  copyId: "primary" | "replica",
): PrivateArchiveRoot {
  if (!isAbsolute(path)) {
    fail(
      "private_archive_root_not_absolute",
      `${copyId} private archive root must be absolute`,
    );
  }
  if (!existsSync(path)) {
    fail(
      "private_archive_root_missing",
      `${copyId} private archive root is missing`,
    );
  }
  const requestedPath = resolve(path);
  const realPath = realpathSync(path);
  const observation = lstatSync(path);
  if (
    requestedPath !== realPath ||
    !observation.isDirectory() ||
    observation.isSymbolicLink()
  ) {
    fail(
      "private_archive_root_invalid",
      `${copyId} private archive root must be a real directory without symlink resolution`,
    );
  }
  if (fileMode(path) !== "0700") {
    fail(
      "private_archive_root_mode_mismatch",
      `${copyId} private archive root must have mode 0700`,
    );
  }
  const stat = statSync(realPath);
  return {
    copyId,
    realPath,
    device: stat.dev,
    inode: stat.ino,
  };
}

function assertDistinctPrivateArchiveRoots(input: {
  primaryCorpusRoot: string;
  replicaCorpusRoot: string;
}): { primary: PrivateArchiveRoot; replica: PrivateArchiveRoot } {
  const primary = inspectPrivateArchiveRoot(input.primaryCorpusRoot, "primary");
  const replica = inspectPrivateArchiveRoot(input.replicaCorpusRoot, "replica");
  if (
    primary.realPath === replica.realPath ||
    (primary.device === replica.device && primary.inode === replica.inode)
  ) {
    fail(
      "private_archive_roots_not_distinct",
      "Primary and replica corpus roots must resolve to different directories",
    );
  }
  return { primary, replica };
}

function readPrivateFile(input: {
  root: PrivateArchiveRoot;
  relativePath: string;
  label: string;
}): PrivateFileObservation {
  if (
    !SourceAnalysisInputRepositoryPathSchema.safeParse(input.relativePath)
      .success
  ) {
    fail(
      "private_relative_path_invalid",
      `${input.label} has a non-portable relative path`,
    );
  }
  const path = resolve(input.root.realPath, input.relativePath);
  if (!path.startsWith(`${input.root.realPath}${sep}`)) {
    fail(
      "private_path_escape",
      `${input.label} escapes its private archive root`,
    );
  }
  if (!existsSync(path))
    fail("private_file_missing", `${input.label} is missing`);
  const realPath = realpathSync(path);
  const observation = lstatSync(path);
  if (
    realPath !== path ||
    !observation.isFile() ||
    observation.isSymbolicLink()
  ) {
    fail(
      "private_file_not_regular",
      `${input.label} is not a real regular file within its archive root`,
    );
  }
  if (fileMode(path) !== "0400") {
    fail("private_file_mode_mismatch", `${input.label} must have mode 0400`);
  }
  return {
    path,
    bytes: readFileSync(path),
    device: observation.dev,
    inode: observation.ino,
  };
}

function assertDistinctPrivateFiles(
  primary: PrivateFileObservation,
  replica: PrivateFileObservation,
  label: string,
): void {
  if (
    primary.path === replica.path ||
    (primary.device === replica.device && primary.inode === replica.inode)
  ) {
    fail(
      "private_archive_files_not_distinct",
      `${label} primary and replica paths resolve to the same file`,
    );
  }
}

function prettyJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function readJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(
      "json_read_failed",
      `Could not read strict JSON at ${path}: ${String(error)}`,
    );
  }
}

function equalJson(left: unknown, right: unknown): boolean {
  return canonicalJson(left as JsonValue) === canonicalJson(right as JsonValue);
}

function manifestPath(rawPdfSha256: string): string {
  return `${SOURCE_ANALYSIS_INPUT_MANIFEST_DIRECTORY}/${rawPdfSha256}.source-analysis-input-manifest.v1.json`;
}

function expandPageRelativePath(
  rawPdfSha256: string,
  pageNumber: number,
): string {
  return SOURCE_ANALYSIS_INPUT_PRIVATE_STORAGE.normalizedPageRelativePathTemplate
    .replace("{rawPdfSha256}", rawPdfSha256)
    .replace("{pageNumber:0000}", String(pageNumber).padStart(4, "0"));
}

function expandRawPdfRelativePath(rawPdfSha256: string): string {
  return SOURCE_ANALYSIS_INPUT_PRIVATE_STORAGE.rawPdfRelativePathTemplate.replace(
    "{rawPdfSha256}",
    rawPdfSha256,
  );
}

function expandPrivateLocator(
  template: string,
  rawPdfSha256: string,
  pageNumber?: number,
): string {
  return template
    .replace("{rawPdfSha256}", rawPdfSha256)
    .replace("{pageNumber:0000}", String(pageNumber ?? 0).padStart(4, "0"));
}

function strictFileNames(
  directory: string,
  pattern: RegExp,
  label: string,
): string[] {
  if (!existsSync(directory))
    fail("source_directory_missing", `${label} directory is missing`);
  const entries = readdirSync(directory, { withFileTypes: true });
  if (entries.some((entry) => !entry.isFile())) {
    fail(
      "source_directory_non_file_entry",
      `${label} directory contains a non-file entry`,
    );
  }
  const names = entries.map((entry) => entry.name).sort();
  const unexpected = names.filter((name) => !pattern.test(name));
  if (unexpected.length > 0) {
    fail(
      "source_directory_unexpected_file",
      `${label} contains unexpected files: ${unexpected.join(", ")}`,
    );
  }
  return names;
}

function pageMapPages(pageMap: PdfPageMap): SourceAnalysisInputPage[] {
  return pageMap.pages.map((page) => ({
    pageNumber: page.pageNumber,
    normalizedText: {
      sha256: page.normalizedText.sha256,
      sizeBytes: page.normalizedText.sizeBytes,
      characterCount: page.normalizedText.characterCount,
      wordCount: page.normalizedText.wordCount,
    },
  }));
}

function expectedReceiptTotals(pageMap: PdfPageMap): {
  normalizedSizeBytes: number;
  normalizedCharacterCount: number;
  wordCount: number;
} {
  return {
    normalizedSizeBytes: pageMap.pages.reduce(
      (total, page) => total + page.normalizedText.sizeBytes,
      0,
    ),
    normalizedCharacterCount: pageMap.pages.reduce(
      (total, page) => total + page.normalizedText.characterCount,
      0,
    ),
    wordCount: pageMap.pages.reduce(
      (total, page) => total + page.normalizedText.wordCount,
      0,
    ),
  };
}

function validateSourceUnit(source: SourceUnit): void {
  const { rawPdfSha256, pageMap, receipt } = source;
  if (pageMap.processingUnit.rawPdfSha256 !== rawPdfSha256) {
    fail(
      "page_map_raw_hash_mismatch",
      `Page map processing unit differs for ${rawPdfSha256}`,
    );
  }
  if (receipt.processingUnit.rawPdfSha256 !== rawPdfSha256) {
    fail(
      "receipt_raw_hash_mismatch",
      `Receipt processing unit differs for ${rawPdfSha256}`,
    );
  }
  if (!verifySealedPageMap(pageMap)) {
    fail(
      "page_map_self_hash_mismatch",
      `Page map self-hash differs for ${rawPdfSha256}`,
    );
  }
  if (!verifySealedQualificationReceipt(receipt)) {
    fail(
      "receipt_self_hash_mismatch",
      `Receipt self-hash differs for ${rawPdfSha256}`,
    );
  }
  if (receipt.extraction.pageMapLocator !== source.pageMapPath) {
    fail(
      "receipt_page_map_path_mismatch",
      `Receipt page-map path differs for ${rawPdfSha256}`,
    );
  }
  if (receipt.extraction.pageMapSha256 !== pageMap.pageMapSha256) {
    fail(
      "receipt_page_map_seal_mismatch",
      `Receipt page-map seal differs for ${rawPdfSha256}`,
    );
  }
  if (!equalJson(receipt.identityKeys, pageMap.identityKeys)) {
    fail(
      "identity_key_mismatch",
      `Page map and receipt identity keys differ for ${rawPdfSha256}`,
    );
  }
  if (!equalJson(receipt.identityAssociation, pageMap.identityAssociation)) {
    fail(
      "identity_association_mismatch",
      `Identity associations differ for ${rawPdfSha256}`,
    );
  }
  if (!equalJson(receipt.sourceBinding, pageMap.sourceBinding)) {
    fail(
      "source_binding_mismatch",
      `Source bindings differ for ${rawPdfSha256}`,
    );
  }
  if (
    pageMap.expectedPageCount !== pageMap.pages.length ||
    pageMap.extractedPageCount !== pageMap.pages.length ||
    receipt.sourceFile.pageCount !== pageMap.pages.length ||
    receipt.extraction.extractedPageCount !== pageMap.pages.length
  ) {
    fail("page_count_mismatch", `Page counts differ for ${rawPdfSha256}`);
  }
  for (const [index, page] of pageMap.pages.entries()) {
    if (page.pageNumber !== index + 1) {
      fail(
        "page_sequence_mismatch",
        `Page sequence differs for ${rawPdfSha256}`,
      );
    }
    const expectedLocator = expandPrivateLocator(
      SOURCE_ANALYSIS_INPUT_PRIVATE_STORAGE.copies[0]
        .normalizedPageLocatorTemplate,
      rawPdfSha256,
      page.pageNumber,
    );
    if (page.storage.normalizedTextLocator !== expectedLocator) {
      fail(
        "normalized_locator_mismatch",
        `Normalized locator differs for ${rawPdfSha256} page ${page.pageNumber}`,
      );
    }
  }
  const primaryPdfLocator = expandPrivateLocator(
    SOURCE_ANALYSIS_INPUT_PRIVATE_STORAGE.copies[0].rawPdfLocatorTemplate,
    rawPdfSha256,
  );
  const replicaPdfLocator = expandPrivateLocator(
    SOURCE_ANALYSIS_INPUT_PRIVATE_STORAGE.copies[1].rawPdfLocatorTemplate,
    rawPdfSha256,
  );
  if (
    receipt.sourceFile.primaryCopy.locator !== primaryPdfLocator ||
    receipt.sourceFile.replicaCopy.locator !== replicaPdfLocator
  ) {
    fail(
      "raw_pdf_locator_mismatch",
      `Raw-PDF private locators differ for ${rawPdfSha256}`,
    );
  }
  for (const copy of [
    receipt.sourceFile.primaryCopy,
    receipt.sourceFile.replicaCopy,
  ]) {
    if (
      copy.sha256 !== rawPdfSha256 ||
      copy.sizeBytes !== receipt.sourceFile.observedSizeBytes ||
      copy.fileMode !== "0400"
    ) {
      fail(
        "raw_pdf_receipt_mismatch",
        `Raw-PDF receipt binding differs for ${rawPdfSha256}`,
      );
    }
  }
  const totals = expectedReceiptTotals(pageMap);
  if (
    receipt.totals.normalizedSizeBytes !== totals.normalizedSizeBytes ||
    receipt.totals.normalizedCharacterCount !==
      totals.normalizedCharacterCount ||
    receipt.totals.wordCount !== totals.wordCount
  ) {
    fail(
      "receipt_total_mismatch",
      `Receipt normalized totals differ for ${rawPdfSha256}`,
    );
  }
}

export function loadSourceUnits(repositoryRoot: string): SourceUnit[] {
  const pageMapRoot = join(repositoryRoot, PDF_PAGE_MAP_DIRECTORY);
  const receiptRoot = join(repositoryRoot, PDF_EXTRACTION_RECEIPT_DIRECTORY);
  const pageMapNames = strictFileNames(
    pageMapRoot,
    PAGE_MAP_NAME_PATTERN,
    "Page-map",
  );
  const receiptNames = strictFileNames(
    receiptRoot,
    RECEIPT_NAME_PATTERN,
    "Receipt",
  );
  if (pageMapNames.length === 0)
    fail("source_set_empty", "No PDF page maps were found");
  const pageHashes = pageMapNames.map(
    (name) => PAGE_MAP_NAME_PATTERN.exec(name)?.[1],
  );
  const receiptHashes = receiptNames.map(
    (name) => RECEIPT_NAME_PATTERN.exec(name)?.[1],
  );
  if (!equalJson(pageHashes, receiptHashes)) {
    fail(
      "source_set_mismatch",
      "Page-map and extraction-receipt hash sets differ",
    );
  }
  return pageHashes.map((rawPdfSha256) => {
    assert(rawPdfSha256);
    const pageMapPath = `${PDF_PAGE_MAP_DIRECTORY}/${rawPdfSha256}.page-map.v1.json`;
    const receiptPath = `${PDF_EXTRACTION_RECEIPT_DIRECTORY}/${rawPdfSha256}.receipt.v1.json`;
    const pageMapBytes = readFileSync(join(repositoryRoot, pageMapPath));
    const receiptBytes = readFileSync(join(repositoryRoot, receiptPath));
    const parsedPageMap = PdfPageMapSchema.safeParse(
      JSON.parse(pageMapBytes.toString("utf8")),
    );
    if (!parsedPageMap.success) {
      fail(
        "page_map_schema_invalid",
        `Page-map schema is invalid for ${rawPdfSha256}`,
      );
    }
    const parsedReceipt = PdfQualificationReceiptSchema.safeParse(
      JSON.parse(receiptBytes.toString("utf8")),
    );
    if (!parsedReceipt.success) {
      fail(
        "receipt_schema_invalid",
        `Extraction-receipt schema is invalid for ${rawPdfSha256}`,
      );
    }
    const source: SourceUnit = {
      rawPdfSha256,
      pageMapPath,
      pageMapBytes,
      pageMapFileSha256: sha256(pageMapBytes),
      pageMap: parsedPageMap.data,
      receiptPath,
      receiptBytes,
      receiptFileSha256: sha256(receiptBytes),
      receipt: parsedReceipt.data,
    };
    validateSourceUnit(source);
    return source;
  });
}

function decodeUtf8(bytes: Buffer, label: string): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    fail("private_page_invalid_utf8", `${label} is not valid UTF-8`);
  }
}

function inspectPrivateCopy(input: {
  source: SourceUnit;
  pages: SourceAnalysisInputPage[];
  root: PrivateArchiveRoot;
}): {
  normalizedPageBytes: Buffer[];
  inputSha256: string;
  serializedSizeBytes: number;
  rawPdfFile: PrivateFileObservation;
  normalizedPageFiles: PrivateFileObservation[];
} {
  const rawPdfFile = readPrivateFile({
    root: input.root,
    relativePath: expandRawPdfRelativePath(input.source.rawPdfSha256),
    label: `${input.root.copyId} raw PDF ${input.source.rawPdfSha256}`,
  });
  const rawPdf = rawPdfFile.bytes;
  if (
    rawPdf.length !== input.source.receipt.sourceFile.observedSizeBytes ||
    sha256(rawPdf) !== input.source.rawPdfSha256
  ) {
    fail(
      "private_raw_pdf_mismatch",
      `${input.root.copyId} raw PDF differs for ${input.source.rawPdfSha256}`,
    );
  }
  const normalizedPageFiles = input.pages.map((page) => {
    const observation = readPrivateFile({
      root: input.root,
      relativePath: expandPageRelativePath(
        input.source.rawPdfSha256,
        page.pageNumber,
      ),
      label: `${input.root.copyId} normalized page ${input.source.rawPdfSha256}:${page.pageNumber}`,
    });
    const bytes = observation.bytes;
    const text = decodeUtf8(
      bytes,
      `${input.root.copyId} normalized page ${page.pageNumber}`,
    );
    if (
      sha256(bytes) !== page.normalizedText.sha256 ||
      bytes.length !== page.normalizedText.sizeBytes ||
      countUnicodeCharacters(text) !== page.normalizedText.characterCount ||
      countUnicodeWords(text) !== page.normalizedText.wordCount
    ) {
      fail(
        "private_normalized_page_mismatch",
        `${input.root.copyId} normalized page differs for ${input.source.rawPdfSha256}:${page.pageNumber}`,
      );
    }
    return observation;
  });
  const normalizedPageBytes = normalizedPageFiles.map((file) => file.bytes);
  const serialized = serializeNormalizedInput({
    pages: input.pages,
    normalizedPageBytes,
  });
  return {
    normalizedPageBytes,
    inputSha256: serialized.sha256,
    serializedSizeBytes: serialized.serializedSizeBytes,
    rawPdfFile,
    normalizedPageFiles,
  };
}

function buildInputManifest(input: {
  source: SourceUnit;
  primaryRoot: PrivateArchiveRoot;
  replicaRoot: PrivateArchiveRoot;
}): SourceAnalysisInputManifest {
  const pages = pageMapPages(input.source.pageMap);
  const primary = inspectPrivateCopy({
    source: input.source,
    pages,
    root: input.primaryRoot,
  });
  const replica = inspectPrivateCopy({
    source: input.source,
    pages,
    root: input.replicaRoot,
  });
  assertDistinctPrivateFiles(
    primary.rawPdfFile,
    replica.rawPdfFile,
    `Raw PDF ${input.source.rawPdfSha256}`,
  );
  for (const [index, primaryPage] of primary.normalizedPageFiles.entries()) {
    const replicaPage = replica.normalizedPageFiles[index];
    assert(replicaPage);
    assertDistinctPrivateFiles(
      primaryPage,
      replicaPage,
      `Normalized page ${input.source.rawPdfSha256}:${index + 1}`,
    );
  }
  if (
    primary.inputSha256 !== replica.inputSha256 ||
    primary.serializedSizeBytes !== replica.serializedSizeBytes ||
    primary.normalizedPageBytes.some(
      (bytes, index) =>
        !bytes.equals(replica.normalizedPageBytes[index] ?? Buffer.alloc(0)),
    )
  ) {
    fail(
      "private_replica_mismatch",
      `Private normalized replicas differ for ${input.source.rawPdfSha256}`,
    );
  }
  return sealSourceAnalysisInputManifest({
    schemaVersion: SOURCE_ANALYSIS_INPUT_SCHEMA_VERSION,
    artifactType: "source_analysis_input_manifest",
    pipelineVersion: SOURCE_ANALYSIS_INPUT_PIPELINE_VERSION,
    processingUnit: {
      algorithm: "sha256",
      rawPdfSha256: input.source.rawPdfSha256,
    },
    identityKeys: input.source.pageMap.identityKeys,
    identityAssociation: input.source.pageMap.identityAssociation,
    sourceBinding: input.source.pageMap.sourceBinding,
    workflowEligibility: sourceAnalysisInputWorkflowEligibility(
      input.source.pageMap.identityAssociation,
    ),
    bindings: {
      pageMap: {
        path: input.source.pageMapPath,
        fileSha256: input.source.pageMapFileSha256,
        pageMapSha256: input.source.pageMap.pageMapSha256,
      },
      extractionReceipt: {
        path: input.source.receiptPath,
        fileSha256: input.source.receiptFileSha256,
        receiptSha256: input.source.receipt.receiptSha256,
      },
    },
    serialization: {
      ...SOURCE_ANALYSIS_INPUT_SERIALIZATION,
      pageHeaderFields: ["normalizedSha256", "pageNumber", "sizeBytes"],
      trailerFields: ["pageCount"],
    },
    normalizedInput: {
      algorithm: "sha256",
      sha256: primary.inputSha256,
      serializedSizeBytes: primary.serializedSizeBytes,
    },
    pages,
    totals: sourceAnalysisInputTotals(pages),
    privateStorage: {
      ...SOURCE_ANALYSIS_INPUT_PRIVATE_STORAGE,
      copies: [
        { ...SOURCE_ANALYSIS_INPUT_PRIVATE_STORAGE.copies[0] },
        { ...SOURCE_ANALYSIS_INPUT_PRIVATE_STORAGE.copies[1] },
      ],
    },
    textIncludedInTrackedArtifact: false,
    readiness: SOURCE_ANALYSIS_INPUT_READINESS,
  });
}

function validateManifestAgainstSource(
  manifest: SourceAnalysisInputManifest,
  source: SourceUnit,
): void {
  if (manifest.processingUnit.rawPdfSha256 !== source.rawPdfSha256) {
    fail(
      "manifest_raw_hash_mismatch",
      `Manifest raw hash differs for ${source.rawPdfSha256}`,
    );
  }
  if (!equalJson(manifest.identityKeys, source.pageMap.identityKeys)) {
    fail(
      "manifest_identity_mismatch",
      `Manifest identity keys differ for ${source.rawPdfSha256}`,
    );
  }
  if (
    !equalJson(
      {
        identityAssociation: manifest.identityAssociation,
        sourceBinding: manifest.sourceBinding,
        workflowEligibility: manifest.workflowEligibility,
      },
      {
        identityAssociation: source.pageMap.identityAssociation,
        sourceBinding: source.pageMap.sourceBinding,
        workflowEligibility: sourceAnalysisInputWorkflowEligibility(
          source.pageMap.identityAssociation,
        ),
      },
    )
  ) {
    fail(
      "manifest_workflow_binding_mismatch",
      `Manifest identity association, source binding or workflow eligibility differs for ${source.rawPdfSha256}`,
    );
  }
  const expectedBindings = {
    pageMap: {
      path: source.pageMapPath,
      fileSha256: source.pageMapFileSha256,
      pageMapSha256: source.pageMap.pageMapSha256,
    },
    extractionReceipt: {
      path: source.receiptPath,
      fileSha256: source.receiptFileSha256,
      receiptSha256: source.receipt.receiptSha256,
    },
  };
  if (!equalJson(manifest.bindings, expectedBindings)) {
    fail(
      "manifest_source_binding_mismatch",
      `Manifest source bindings differ for ${source.rawPdfSha256}`,
    );
  }
  if (!equalJson(manifest.pages, pageMapPages(source.pageMap))) {
    fail(
      "manifest_page_binding_mismatch",
      `Manifest page bindings differ for ${source.rawPdfSha256}`,
    );
  }
}

function sealBody<T extends Record<string, unknown>, K extends string>(
  body: T,
  sealKey: K,
): T & Record<K, string> {
  return {
    ...body,
    [sealKey]: sha256(canonicalJson(body as unknown as JsonValue)),
  } as T & Record<K, string>;
}

function buildSummary(manifests: SourceAnalysisInputManifest[]): Summary {
  const ordered = [...manifests].sort((left, right) =>
    left.processingUnit.rawPdfSha256.localeCompare(
      right.processingUnit.rawPdfSha256,
    ),
  );
  const body = {
    schemaVersion: SOURCE_ANALYSIS_INPUT_SCHEMA_VERSION,
    artifactType: "source_analysis_input_summary" as const,
    pipelineVersion: SOURCE_ANALYSIS_INPUT_PIPELINE_VERSION,
    processingUnit: "raw_pdf_sha256" as const,
    sourceCount: ordered.length,
    totals: {
      pageCount: ordered.reduce(
        (total, manifest) => total + manifest.totals.pageCount,
        0,
      ),
      normalizedSizeBytes: ordered.reduce(
        (total, manifest) => total + manifest.totals.normalizedSizeBytes,
        0,
      ),
      normalizedCharacterCount: ordered.reduce(
        (total, manifest) => total + manifest.totals.normalizedCharacterCount,
        0,
      ),
      wordCount: ordered.reduce(
        (total, manifest) => total + manifest.totals.wordCount,
        0,
      ),
    },
    documents: ordered.map((manifest) => ({
      rawPdfSha256: manifest.processingUnit.rawPdfSha256,
      manifestPath: manifestPath(manifest.processingUnit.rawPdfSha256),
      manifestSha256: manifest.manifestSha256,
      normalizedInputSha256: manifest.normalizedInput.sha256,
      workflowEligibilityState: manifest.workflowEligibility.state,
      identityVerificationAllowed:
        manifest.workflowEligibility.identityVerification.allowed,
      sourceAnalysisAllowed:
        manifest.workflowEligibility.sourceAnalysis.allowed,
      pageCount: manifest.totals.pageCount,
      normalizedSizeBytes: manifest.totals.normalizedSizeBytes,
      normalizedCharacterCount: manifest.totals.normalizedCharacterCount,
      wordCount: manifest.totals.wordCount,
    })),
    workflowEligibility: {
      identityVerificationCandidateCount: ordered.filter(
        (manifest) =>
          manifest.workflowEligibility.state ===
          "identity_verification_candidate",
      ).length,
      blockedIdentityAssociationCount: ordered.filter(
        (manifest) =>
          manifest.workflowEligibility.state === "blocked_identity_association",
      ).length,
      sourceAnalysisAllowedCount: ordered.filter(
        (manifest) => manifest.workflowEligibility.sourceAnalysis.allowed,
      ).length,
    },
    textIncludedInTrackedArtifact: false as const,
    readiness: SOURCE_ANALYSIS_INPUT_READINESS,
  };
  return sealBody(body, "summarySha256");
}

function snapshot(repositoryRoot: string, path: string): FileSnapshot {
  const bytes = readFileSync(join(repositoryRoot, path));
  return { path, sha256: sha256(bytes), sizeBytes: bytes.length };
}

function artifactSnapshot(artifact: TrackedArtifact): FileSnapshot {
  const bytes = Buffer.from(artifact.content, "utf8");
  return {
    path: artifact.path,
    sha256: sha256(bytes),
    sizeBytes: bytes.length,
  };
}

function generationInputPaths(sources: SourceUnit[]): string[] {
  return [
    SOURCE_ANALYSIS_INPUT_GENERATOR_PATH,
    SOURCE_ANALYSIS_INPUT_LIBRARY_PATH,
    SOURCE_ANALYSIS_INPUT_JSON_SCHEMA_PATH,
    PDF_EXTRACTION_LIBRARY_PATH,
    ...sources.flatMap((source) => [source.pageMapPath, source.receiptPath]),
  ].sort();
}

function buildGenerationManifest(input: {
  repositoryRoot: string;
  sources: SourceUnit[];
  artifacts: TrackedArtifact[];
}): GenerationManifest {
  const inputs = generationInputPaths(input.sources).map((path) =>
    snapshot(input.repositoryRoot, path),
  );
  const outputs = input.artifacts
    .map(artifactSnapshot)
    .sort((left, right) => left.path.localeCompare(right.path));
  const body = {
    schemaVersion: SOURCE_ANALYSIS_INPUT_SCHEMA_VERSION,
    artifactType: "source_analysis_input_generation_manifest" as const,
    pipelineVersion: SOURCE_ANALYSIS_INPUT_PIPELINE_VERSION,
    inputs,
    outputs,
    outputSetSha256: sha256(canonicalJson(outputs as unknown as JsonValue)),
    semantics: {
      portableTrackedValidationSupported: true as const,
      privateValidationRequiresBothArchiveRoots: true as const,
      privateFilesWrittenByThisPipeline: false as const,
      sourceTextIncludedInTrackedArtifacts: false as const,
      ...SOURCE_ANALYSIS_INPUT_READINESS,
    },
  };
  return sealBody(body, "generationManifestSha256");
}

function trackedArtifacts(
  manifests: SourceAnalysisInputManifest[],
  summary: Summary,
): TrackedArtifact[] {
  return [
    ...manifests.map((manifest) => ({
      path: manifestPath(manifest.processingUnit.rawPdfSha256),
      content: prettyJson(manifest),
    })),
    { path: SOURCE_ANALYSIS_INPUT_SUMMARY_PATH, content: prettyJson(summary) },
  ].sort((left, right) => left.path.localeCompare(right.path));
}

function writeTrackedBundleAtomically(
  repositoryRoot: string,
  artifacts: TrackedArtifact[],
  generationManifest: GenerationManifest,
): void {
  const complete = [
    ...artifacts,
    {
      path: SOURCE_ANALYSIS_INPUT_GENERATION_MANIFEST_PATH,
      content: prettyJson(generationManifest),
    },
  ];
  const temporaryFiles: Array<{ temporaryPath: string; finalPath: string }> =
    [];
  try {
    for (const artifact of complete) {
      const finalPath = join(repositoryRoot, artifact.path);
      mkdirSync(dirname(finalPath), { recursive: true });
      const temporaryPath = `${finalPath}.${process.pid}.tmp`;
      if (existsSync(temporaryPath)) {
        fail(
          "tracked_temp_collision",
          `Temporary path already exists: ${artifact.path}`,
        );
      }
      writeFileSync(temporaryPath, artifact.content, {
        encoding: "utf8",
        flag: "wx",
      });
      if (readFileSync(temporaryPath, "utf8") !== artifact.content) {
        fail(
          "tracked_temp_verification_failed",
          `Temporary file differs: ${artifact.path}`,
        );
      }
      temporaryFiles.push({ temporaryPath, finalPath });
    }
    for (const file of temporaryFiles.filter(
      (entry) =>
        !entry.finalPath.endsWith(
          SOURCE_ANALYSIS_INPUT_GENERATION_MANIFEST_PATH,
        ),
    )) {
      renameSync(file.temporaryPath, file.finalPath);
    }
    const last = temporaryFiles.find((entry) =>
      entry.finalPath.endsWith(SOURCE_ANALYSIS_INPUT_GENERATION_MANIFEST_PATH),
    );
    assert(last);
    renameSync(last.temporaryPath, last.finalPath);
  } finally {
    for (const file of temporaryFiles) {
      if (existsSync(file.temporaryPath)) unlinkSync(file.temporaryPath);
    }
  }
}

function expectedArtifactPaths(sources: SourceUnit[]): string[] {
  return [
    ...sources.map((source) => manifestPath(source.rawPdfSha256)),
    SOURCE_ANALYSIS_INPUT_SUMMARY_PATH,
  ].sort();
}

function assertExactTrackedSet(
  repositoryRoot: string,
  sources: SourceUnit[],
): void {
  const root = join(repositoryRoot, SOURCE_ANALYSIS_INPUT_ROOT);
  if (!existsSync(root))
    fail("tracked_root_missing", "Source-analysis input root is missing");
  const expectedRootEntries = [
    basename(SOURCE_ANALYSIS_INPUT_README_PATH),
    basename(SOURCE_ANALYSIS_INPUT_GENERATION_MANIFEST_PATH),
    basename(SOURCE_ANALYSIS_INPUT_SUMMARY_PATH),
    basename(SOURCE_ANALYSIS_INPUT_MANIFEST_DIRECTORY),
  ].sort();
  const actualRootEntries = readdirSync(root).sort();
  if (!equalJson(actualRootEntries, expectedRootEntries)) {
    fail(
      "tracked_output_orphan",
      "Source-analysis input root has an unexpected or missing entry",
    );
  }
  const expectedManifests = sources
    .map((source) => basename(manifestPath(source.rawPdfSha256)))
    .sort();
  const manifestRoot = join(
    repositoryRoot,
    SOURCE_ANALYSIS_INPUT_MANIFEST_DIRECTORY,
  );
  const entries = readdirSync(manifestRoot, { withFileTypes: true });
  if (entries.some((entry) => !entry.isFile())) {
    fail(
      "tracked_output_orphan",
      "Source-analysis input manifest directory has a non-file entry",
    );
  }
  const actualManifests = entries.map((entry) => entry.name).sort();
  if (!equalJson(actualManifests, expectedManifests)) {
    fail("tracked_output_orphan", "Source-analysis input manifest set differs");
  }
}

export function writeSourceAnalysisInputBundle(input: {
  repositoryRoot: string;
  primaryCorpusRoot: string;
  replicaCorpusRoot: string;
}): { manifests: SourceAnalysisInputManifest[]; summary: Summary } {
  const roots = assertDistinctPrivateArchiveRoots(input);
  const sources = loadSourceUnits(input.repositoryRoot);
  const manifests = sources.map((source) =>
    buildInputManifest({
      source,
      primaryRoot: roots.primary,
      replicaRoot: roots.replica,
    }),
  );
  const summary = buildSummary(manifests);
  const artifacts = trackedArtifacts(manifests, summary);
  const generationManifest = buildGenerationManifest({
    repositoryRoot: input.repositoryRoot,
    sources,
    artifacts,
  });
  writeTrackedBundleAtomically(
    input.repositoryRoot,
    artifacts,
    generationManifest,
  );
  return { manifests, summary };
}

export function checkTrackedSourceAnalysisInputBundle(input: {
  repositoryRoot: string;
}): {
  sources: SourceUnit[];
  manifests: SourceAnalysisInputManifest[];
  summary: Summary;
  privateVerificationPerformed: false;
} {
  const sources = loadSourceUnits(input.repositoryRoot);
  const generationPath = join(
    input.repositoryRoot,
    SOURCE_ANALYSIS_INPUT_GENERATION_MANIFEST_PATH,
  );
  if (!existsSync(generationPath)) {
    fail(
      "generation_manifest_missing",
      "Source-analysis input generation manifest is missing",
    );
  }
  const generationResult = GENERATION_MANIFEST_SCHEMA.safeParse(
    readJson(generationPath),
  );
  if (!generationResult.success) {
    fail(
      "generation_manifest_schema_invalid",
      "Generation manifest schema is invalid",
    );
  }
  const generationManifest = generationResult.data;
  const { generationManifestSha256, ...generationBody } = generationManifest;
  if (
    generationManifestSha256 !==
    sha256(canonicalJson(generationBody as JsonValue))
  ) {
    fail(
      "generation_manifest_self_hash_mismatch",
      "Generation manifest self-hash differs",
    );
  }
  const expectedInputs = generationInputPaths(sources);
  if (
    !equalJson(
      generationManifest.inputs.map((entry) => entry.path),
      expectedInputs,
    )
  ) {
    fail(
      "generation_manifest_input_set_mismatch",
      "Generation manifest input set differs",
    );
  }
  for (const entry of generationManifest.inputs) {
    const observed = snapshot(input.repositoryRoot, entry.path);
    if (!equalJson(observed, entry)) {
      fail(
        "generation_manifest_input_hash_mismatch",
        `Generation input differs: ${entry.path}`,
      );
    }
  }
  const expectedOutputs = expectedArtifactPaths(sources);
  if (
    !equalJson(
      generationManifest.outputs.map((entry) => entry.path),
      expectedOutputs,
    )
  ) {
    fail(
      "generation_manifest_output_set_mismatch",
      "Generation manifest output set differs",
    );
  }
  if (
    generationManifest.outputSetSha256 !==
    sha256(canonicalJson(generationManifest.outputs as unknown as JsonValue))
  ) {
    fail(
      "generation_manifest_output_set_hash_mismatch",
      "Generation output-set hash differs",
    );
  }
  for (const entry of generationManifest.outputs) {
    const observed = snapshot(input.repositoryRoot, entry.path);
    if (!equalJson(observed, entry)) {
      fail(
        "generation_manifest_output_hash_mismatch",
        `Generated output differs: ${entry.path}`,
      );
    }
  }
  assertExactTrackedSet(input.repositoryRoot, sources);
  const manifests = sources.map((source) => {
    const path = join(input.repositoryRoot, manifestPath(source.rawPdfSha256));
    const manifest = verifySourceAnalysisInputManifest(readJson(path));
    validateManifestAgainstSource(manifest, source);
    return manifest;
  });
  const expectedSummary = buildSummary(manifests);
  const summaryPath = join(
    input.repositoryRoot,
    SOURCE_ANALYSIS_INPUT_SUMMARY_PATH,
  );
  const parsedSummary = SUMMARY_SCHEMA.safeParse(readJson(summaryPath));
  if (!parsedSummary.success)
    fail("summary_schema_invalid", "Source-analysis input summary is invalid");
  const summary = parsedSummary.data;
  const { summarySha256, ...summaryBody } = summary;
  if (summarySha256 !== sha256(canonicalJson(summaryBody as JsonValue))) {
    fail(
      "summary_self_hash_mismatch",
      "Source-analysis input summary self-hash differs",
    );
  }
  if (prettyJson(summary) !== prettyJson(expectedSummary)) {
    fail(
      "summary_content_mismatch",
      "Source-analysis input summary content differs",
    );
  }
  const artifacts = trackedArtifacts(manifests, summary);
  const expectedGeneration = buildGenerationManifest({
    repositoryRoot: input.repositoryRoot,
    sources,
    artifacts,
  });
  if (prettyJson(generationManifest) !== prettyJson(expectedGeneration)) {
    fail(
      "generation_manifest_content_mismatch",
      "Generation manifest content differs",
    );
  }
  return { sources, manifests, summary, privateVerificationPerformed: false };
}

export function checkPrivateSourceAnalysisInputBundle(input: {
  repositoryRoot: string;
  primaryCorpusRoot: string;
  replicaCorpusRoot: string;
}): {
  manifests: SourceAnalysisInputManifest[];
  summary: Summary;
  privateVerificationPerformed: true;
} {
  const roots = assertDistinctPrivateArchiveRoots(input);
  const tracked = checkTrackedSourceAnalysisInputBundle({
    repositoryRoot: input.repositoryRoot,
  });
  for (const [index, source] of tracked.sources.entries()) {
    const manifest = tracked.manifests[index];
    assert(manifest);
    const primary = inspectPrivateCopy({
      source,
      pages: manifest.pages,
      root: roots.primary,
    });
    const replica = inspectPrivateCopy({
      source,
      pages: manifest.pages,
      root: roots.replica,
    });
    assertDistinctPrivateFiles(
      primary.rawPdfFile,
      replica.rawPdfFile,
      `Raw PDF ${source.rawPdfSha256}`,
    );
    for (const [
      pageIndex,
      primaryPage,
    ] of primary.normalizedPageFiles.entries()) {
      const replicaPage = replica.normalizedPageFiles[pageIndex];
      assert(replicaPage);
      assertDistinctPrivateFiles(
        primaryPage,
        replicaPage,
        `Normalized page ${source.rawPdfSha256}:${pageIndex + 1}`,
      );
    }
    for (const observed of [primary, replica]) {
      if (
        observed.inputSha256 !== manifest.normalizedInput.sha256 ||
        observed.serializedSizeBytes !==
          manifest.normalizedInput.serializedSizeBytes
      ) {
        fail(
          "private_combined_input_mismatch",
          `Combined input differs for ${source.rawPdfSha256}`,
        );
      }
    }
    if (
      primary.normalizedPageBytes.some(
        (bytes, pageIndex) =>
          !bytes.equals(
            replica.normalizedPageBytes[pageIndex] ?? Buffer.alloc(0),
          ),
      )
    ) {
      fail(
        "private_replica_mismatch",
        `Private normalized replicas differ for ${source.rawPdfSha256}`,
      );
    }
  }
  return {
    manifests: tracked.manifests,
    summary: tracked.summary,
    privateVerificationPerformed: true,
  };
}

export type SourceAnalysisInputCliOptions = {
  mode: "write" | "check-tracked" | "check-private";
  primaryCorpusRoot: string | null;
  replicaCorpusRoot: string | null;
};

export function parseSourceAnalysisInputCliArgs(
  args: string[],
  env: NodeJS.ProcessEnv = process.env,
): SourceAnalysisInputCliOptions {
  const modeArgs = args.filter((arg) =>
    ["--write", "--check-tracked", "--check-private"].includes(arg),
  );
  const unknown = args.filter(
    (arg) => !["--write", "--check-tracked", "--check-private"].includes(arg),
  );
  if (unknown.length > 0)
    fail("cli_unknown_argument", `Unknown argument(s): ${unknown.join(", ")}`);
  if (modeArgs.length > 1)
    fail("cli_mode_conflict", "Choose only one execution mode");
  const mode = (modeArgs[0]?.slice(2) ??
    "check-tracked") as SourceAnalysisInputCliOptions["mode"];
  const primaryCorpusRoot =
    env.FOOD_SYSTEMS_PRIVATE_CORPUS_ROOT?.trim() || null;
  const replicaCorpusRoot =
    env.FOOD_SYSTEMS_PRIVATE_CORPUS_REPLICA_ROOT?.trim() || null;
  if (mode !== "check-tracked" && (!primaryCorpusRoot || !replicaCorpusRoot)) {
    fail(
      "private_root_missing",
      "FOOD_SYSTEMS_PRIVATE_CORPUS_ROOT and FOOD_SYSTEMS_PRIVATE_CORPUS_REPLICA_ROOT are required",
    );
  }
  return { mode, primaryCorpusRoot, replicaCorpusRoot };
}

function main(): void {
  const options = parseSourceAnalysisInputCliArgs(process.argv.slice(2));
  const repositoryRoot = process.cwd();
  if (options.mode === "check-tracked") {
    const result = checkTrackedSourceAnalysisInputBundle({ repositoryRoot });
    process.stdout.write(
      `Source-analysis input tracked check passed: ${result.manifests.length} source(s), ${result.summary.totals.pageCount} page(s).\n`,
    );
    return;
  }
  assert(options.primaryCorpusRoot);
  assert(options.replicaCorpusRoot);
  if (options.mode === "write") {
    const result = writeSourceAnalysisInputBundle({
      repositoryRoot,
      primaryCorpusRoot: options.primaryCorpusRoot,
      replicaCorpusRoot: options.replicaCorpusRoot,
    });
    process.stdout.write(
      `Source-analysis input manifests written: ${result.manifests.length} source(s), ${result.summary.totals.pageCount} page(s); private archives were read only.\n`,
    );
    return;
  }
  const result = checkPrivateSourceAnalysisInputBundle({
    repositoryRoot,
    primaryCorpusRoot: options.primaryCorpusRoot,
    replicaCorpusRoot: options.replicaCorpusRoot,
  });
  process.stdout.write(
    `Source-analysis input private check passed: ${result.manifests.length} source(s), both archive copies verified.\n`,
  );
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === invokedPath) main();
