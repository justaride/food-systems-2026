import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  readdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { TextDecoder } from "node:util";

import { z } from "zod";

import {
  PDF_PAGE_EXTRACTION_PIPELINE_VERSION,
  PDF_PAGE_EXTRACTION_SCHEMA_VERSION,
  PdfPageMapSchema,
  PdfQualificationReceiptSchema,
  buildPageExtractionRecord,
  canonicalJson,
  normalizeExtractedPageText,
  sealPageMap,
  sealQualificationReceipt,
  sha256,
  summarizeWarnings,
  type JsonValue,
  type PdfIdentityAssociation,
  type PdfPageExtractionRecord,
  type PdfPageMap,
  type PdfQualificationReceipt,
} from "../../src/lib/knowledge/pdf-page-extraction-qualification";

export const DEFAULT_BATCH_MANIFEST_PATH =
  "knowledge/corpus/pdf-page-extraction/pdf-page-extraction-batch-2026-08-02.v1.json";
export const PDF_PAGE_MAP_DIRECTORY =
  "knowledge/corpus/pdf-page-extraction/page-maps";
export const PDF_QUALIFICATION_RECEIPT_DIRECTORY =
  "knowledge/corpus/pdf-page-extraction/receipts";
export const PDF_QUALIFICATION_BLOCKER_QUEUE_PATH =
  "knowledge/corpus/pdf-page-extraction/pdf-page-extraction-blocker-queue.v1.jsonl";
export const PDF_QUALIFICATION_SUMMARY_PATH =
  "knowledge/corpus/pdf-page-extraction/pdf-page-extraction-summary.v1.json";
export const PDF_QUALIFICATION_GENERATION_MANIFEST_PATH =
  "knowledge/corpus/pdf-page-extraction/pdf-page-extraction-generation-manifest.v1.json";
export const PDF_QUALIFICATION_GENERATOR_PATH =
  "scripts/knowledge/qualify-pdf-page-extraction.ts";
export const PDF_QUALIFICATION_LIBRARY_PATH =
  "src/lib/knowledge/pdf-page-extraction-qualification.ts";

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const EXTRACTION_ARGUMENTS_TEMPLATE = [
  "-f",
  "{page}",
  "-l",
  "{page}",
  "-enc",
  "UTF-8",
  "-eol",
  "unix",
  "-nopgbrk",
  "{input_pdf}",
  "-",
] as const;

type SourceBindingCore = {
  title: string;
  doi: string | null;
  expectedPdfInfoTitle:
    { state: "observed"; value: string } | { state: "not_stated" };
  corpusIdentityVerified: false;
  scopeDisposition:
    | "pending_owner_classification"
    | "pending_owner_classification_indirect_context"
    | "pending_owner_disposition_likely_out_of_scope";
};

type SourceBinding = SourceBindingCore &
  ({ officialUrl: string } | { controlledPrivateLocator: string });

function sourceLocatorFields(
  binding: SourceBinding,
): { officialUrl: string } | { controlledPrivateLocator: string } {
  return "officialUrl" in binding
    ? { officialUrl: binding.officialUrl }
    : { controlledPrivateLocator: binding.controlledPrivateLocator };
}

function technicalSourceBinding(binding: SourceBinding) {
  return {
    title: binding.title,
    doi: binding.doi,
    ...sourceLocatorFields(binding),
    corpusIdentityVerified: false as const,
    scopeDisposition: binding.scopeDisposition,
  };
}

export type PdfExtractionTarget = {
  targetId: string;
  identityKeys: string[];
  legacyAlias: string;
  expectedSha256: string;
  expectedSizeBytes: number;
  expectedPageCount: number;
  expectedEncrypted: false;
  sourceBinding: SourceBinding;
  identityAssociation: PdfIdentityAssociation;
};

export type PdfExtractionBatchManifest = {
  schemaVersion: "1.0.0";
  batchId: string;
  observedOn: string;
  processingUnit: "raw_pdf_sha256";
  purpose: string;
  semantics: {
    technicalExtractionOnly: true;
    privateTextStorageOnly: true;
    aiAnalysisComplete: false;
    ownerReviewComplete: false;
    independentValidationComplete: false;
    rightsCleared: false;
    publicationReady: false;
    coveragePromotionAllowed: false;
  };
  targets: PdfExtractionTarget[];
};

const PDF_IDENTITY_ASSOCIATION_SCHEMA = z.discriminatedUnion("state", [
  z
    .object({
      state: z.literal("provisional_metadata_match"),
      intendedLabel: z.string().min(1),
      observedDocumentTitle: z.string().min(1),
      blockerCode: z.null(),
    })
    .strict(),
  z
    .object({
      state: z.literal("blocked_legacy_alias_scope_mismatch"),
      intendedLabel: z.string().min(1),
      observedDocumentTitle: z.string().min(1),
      blockerCode: z.literal("legacy_alias_scope_mismatch"),
    })
    .strict(),
  z
    .object({
      state: z.literal("unregistered_source_candidate"),
      intendedLabel: z.string().min(1),
      observedDocumentTitle: z.string().min(1),
      blockerCode: z.literal("database_registration_required"),
    })
    .strict(),
]);

export const PdfExtractionBatchManifestSchema = z
  .object({
    schemaVersion: z.literal("1.0.0"),
    batchId: z.string().min(1),
    observedOn: z.iso.date(),
    processingUnit: z.literal("raw_pdf_sha256"),
    purpose: z.string().min(1),
    semantics: z
      .object({
        technicalExtractionOnly: z.literal(true),
        privateTextStorageOnly: z.literal(true),
        aiAnalysisComplete: z.literal(false),
        ownerReviewComplete: z.literal(false),
        independentValidationComplete: z.literal(false),
        rightsCleared: z.literal(false),
        publicationReady: z.literal(false),
        coveragePromotionAllowed: z.literal(false),
      })
      .strict(),
    targets: z
      .array(
        z
          .object({
            targetId: z.string().min(1),
            identityKeys: z.array(z.string().min(1)).min(1),
            legacyAlias: z.string().min(1),
            expectedSha256: z.string().regex(SHA256_PATTERN),
            expectedSizeBytes: z.number().int().positive(),
            expectedPageCount: z.number().int().positive(),
            expectedEncrypted: z.literal(false),
            sourceBinding: z.union([
              z
                .object({
                  title: z.string().min(1),
                  doi: z.string().min(1).nullable(),
                  officialUrl: z.string().url().startsWith("https://"),
                  expectedPdfInfoTitle: z.discriminatedUnion("state", [
                    z
                      .object({
                        state: z.literal("observed"),
                        value: z.string().max(500),
                      })
                      .strict(),
                    z.object({ state: z.literal("not_stated") }).strict(),
                  ]),
                  corpusIdentityVerified: z.literal(false),
                  scopeDisposition: z.enum([
                    "pending_owner_classification",
                    "pending_owner_classification_indirect_context",
                    "pending_owner_disposition_likely_out_of_scope",
                  ]),
                })
                .strict(),
              z
                .object({
                  title: z.string().min(1),
                  doi: z.string().min(1).nullable(),
                  controlledPrivateLocator: z
                    .string()
                    .regex(/^private:\/\/[a-z0-9][a-z0-9._:/-]*$/),
                  expectedPdfInfoTitle: z.discriminatedUnion("state", [
                    z
                      .object({
                        state: z.literal("observed"),
                        value: z.string().max(500),
                      })
                      .strict(),
                    z.object({ state: z.literal("not_stated") }).strict(),
                  ]),
                  corpusIdentityVerified: z.literal(false),
                  scopeDisposition: z.enum([
                    "pending_owner_classification",
                    "pending_owner_classification_indirect_context",
                    "pending_owner_disposition_likely_out_of_scope",
                  ]),
                })
                .strict(),
            ]),
            identityAssociation: PDF_IDENTITY_ASSOCIATION_SCHEMA,
          })
          .strict(),
      )
      .min(1),
  })
  .strict()
  .superRefine((manifest, context) => {
    for (const field of ["targetId", "expectedSha256"] as const) {
      const seen = new Set<string>();
      for (const [index, target] of manifest.targets.entries()) {
        if (seen.has(target[field])) {
          context.addIssue({
            code: "custom",
            message: `Duplicate ${field}: ${target[field]}`,
            path: ["targets", index, field],
          });
        }
        seen.add(target[field]);
      }
    }
  });

export type ToolResult = {
  status: number;
  stdout: Buffer;
  stderr: Buffer;
};

export type ToolRunner = (command: string, args: string[]) => ToolResult;

type PdfInfoObservation = {
  title: { state: "observed"; value: string } | { state: "not_stated" };
  pages: number;
  encrypted: boolean;
  fileSizeBytes: number;
  pdfVersion: string;
};

type PrivateFilePayload = {
  relativePath: string;
  bytes: Buffer;
};

type QualificationResult = {
  target: PdfExtractionTarget;
  pageMap: PdfPageMap;
  receipt: PdfQualificationReceipt;
  privateFiles: PrivateFilePayload[];
};

export type QualificationBlocker = {
  schemaVersion: "1.0.0";
  queueId: string;
  targetId: string;
  rawPdfSha256: string;
  identityKeys: string[];
  blockerCode: string;
  blockerState: "open";
  technicalExtractionState: "passed" | "not_qualified";
  corpusIdentityVerified: false;
  aiAnalysisComplete: false;
  ownerReviewComplete: false;
  rightsCleared: false;
  publicationReady: false;
  coveragePromotionAllowed: false;
  nextAction: string;
  diagnosticSha256: string | null;
};

export class PdfQualificationError extends Error {
  readonly blockerCode: string;

  constructor(blockerCode: string, message: string) {
    super(message);
    this.name = "PdfQualificationError";
    this.blockerCode = blockerCode;
  }
}

function fail(blockerCode: string, message: string): never {
  throw new PdfQualificationError(blockerCode, message);
}

function assertDistinctArchiveRoots(
  primaryCorpusRoot: string,
  replicaCorpusRoot: string,
): void {
  const primaryRealPath = realpathSync(primaryCorpusRoot);
  const replicaRealPath = realpathSync(replicaCorpusRoot);
  const primaryStat = statSync(primaryRealPath);
  const replicaStat = statSync(replicaRealPath);
  if (
    primaryRealPath === replicaRealPath ||
    (primaryStat.dev === replicaStat.dev && primaryStat.ino === replicaStat.ino)
  ) {
    fail(
      "private_archive_roots_not_distinct",
      "Primary and replica corpus roots must resolve to different directories",
    );
  }
}

function assertDistinctArchiveFiles(
  primaryPath: string,
  replicaPath: string,
  label: string,
): void {
  const primaryStat = statSync(primaryPath);
  const replicaStat = statSync(replicaPath);
  if (
    primaryStat.dev === replicaStat.dev &&
    primaryStat.ino === replicaStat.ino
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

function jsonLines(values: unknown[]): string {
  return values.length === 0
    ? ""
    : `${values.map((value) => canonicalJson(value as JsonValue)).join("\n")}\n`;
}

function modeString(path: string): string {
  return (lstatSync(path).mode & 0o777).toString(8).padStart(4, "0");
}

function assertPrivateDirectory(path: string): void {
  const observation = lstatSync(path);
  if (!observation.isDirectory() || observation.isSymbolicLink()) {
    fail(
      "private_archive_directory_invalid",
      `Private archive path is not a real directory: ${path}`,
    );
  }
  if (modeString(path) !== "0700") {
    fail(
      "private_archive_directory_mode_mismatch",
      `Private archive directory must use mode 0700: ${path}`,
    );
  }
}

function ensurePrivateDirectory(path: string, checkOnly: boolean): void {
  if (!existsSync(path)) {
    if (checkOnly)
      fail(
        "private_extraction_directory_missing",
        `Private extraction directory is missing: ${path}`,
      );
    const parent = dirname(path);
    if (parent !== path && !existsSync(parent))
      ensurePrivateDirectory(parent, false);
    mkdirSync(path, { mode: 0o700 });
  }
  assertPrivateDirectory(path);
}

function verifyPrivateFile(path: string, expectedBytes: Buffer): void {
  if (!existsSync(path))
    fail(
      "private_output_missing",
      `Expected private output is missing: ${path}`,
    );
  const observation = lstatSync(path);
  if (!observation.isFile() || observation.isSymbolicLink()) {
    fail(
      "private_output_not_regular_file",
      `Private output must be a regular file: ${path}`,
    );
  }
  if (modeString(path) !== "0400") {
    fail(
      "private_output_mode_mismatch",
      `Private output must use mode 0400: ${path}`,
    );
  }
  if (observation.size !== expectedBytes.length) {
    fail(
      "private_output_size_mismatch",
      `Private output size mismatch: ${path}`,
    );
  }
  if (sha256(readFileSync(path)) !== sha256(expectedBytes)) {
    fail(
      "private_output_hash_mismatch",
      `Private output hash mismatch: ${path}`,
    );
  }
}

function writeOrVerifyPrivateFile(
  path: string,
  bytes: Buffer,
  checkOnly: boolean,
): void {
  ensurePrivateDirectory(dirname(path), checkOnly);
  if (!existsSync(path)) {
    if (checkOnly)
      fail(
        "private_output_missing",
        `Expected private output is missing: ${path}`,
      );
    const temporaryPath = `${path}.${process.pid}.tmp`;
    if (existsSync(temporaryPath)) {
      fail(
        "private_output_temp_collision",
        `Private output temporary path already exists: ${temporaryPath}`,
      );
    }
    writeFileSync(temporaryPath, bytes, { flag: "wx", mode: 0o600 });
    chmodSync(temporaryPath, 0o400);
    renameSync(temporaryPath, path);
  }
  verifyPrivateFile(path, bytes);
}

function verifyInputPdf(path: string, target: PdfExtractionTarget): Buffer {
  if (!existsSync(path))
    fail("input_pdf_missing", `Input PDF is missing: ${path}`);
  const observation = lstatSync(path);
  if (!observation.isFile() || observation.isSymbolicLink()) {
    fail(
      "input_pdf_not_regular_file",
      `Input PDF must be a regular file: ${path}`,
    );
  }
  if (modeString(path) !== "0400")
    fail("input_pdf_mode_mismatch", `Input PDF must use mode 0400: ${path}`);
  const bytes = readFileSync(path);
  if (bytes.subarray(0, 5).toString("ascii") !== "%PDF-") {
    fail(
      "input_pdf_header_mismatch",
      `Input does not start with the PDF header: ${path}`,
    );
  }
  if (bytes.length !== target.expectedSizeBytes) {
    fail(
      "input_pdf_size_mismatch",
      `Input PDF size does not match target ${target.targetId}`,
    );
  }
  if (sha256(bytes) !== target.expectedSha256) {
    fail(
      "input_pdf_sha256_mismatch",
      `Input PDF SHA-256 does not match target ${target.targetId}`,
    );
  }
  return bytes;
}

function defaultToolRunner(command: string, args: string[]): ToolResult {
  const result = spawnSync(command, args, {
    encoding: "buffer",
    env: { ...process.env, LANG: "C", LC_ALL: "C" },
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  return {
    status: result.status ?? 1,
    stdout: Buffer.isBuffer(result.stdout)
      ? result.stdout
      : Buffer.from(result.stdout ?? ""),
    stderr: Buffer.isBuffer(result.stderr)
      ? result.stderr
      : Buffer.from(result.stderr ?? ""),
  };
}

function toolVersion(command: string, runner: ToolRunner): string {
  const result = runner(command, ["-v"]);
  if (result.status !== 0)
    fail(
      "tool_version_probe_failed",
      `${command} -v failed with status ${result.status}`,
    );
  const output = Buffer.concat([result.stdout, result.stderr]).toString("utf8");
  const match = output.match(/version\s+([^\s]+)/i);
  if (!match?.[1])
    fail("tool_version_unparseable", `Could not parse ${command} version`);
  return match[1];
}

function parsePdfInfoOutput(output: Buffer): PdfInfoObservation {
  const fields = new Map<string, string>();
  for (const line of output.toString("utf8").split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    fields.set(
      line.slice(0, separator).trim(),
      line.slice(separator + 1).trim(),
    );
  }
  const titleValue = fields.get("Title");
  const pages = Number(fields.get("Pages"));
  const encryptedField = fields.get("Encrypted");
  const fileSizeMatch = fields.get("File size")?.match(/^(\d+)\s+bytes$/);
  const pdfVersion = fields.get("PDF version");
  if (!Number.isInteger(pages) || pages <= 0)
    fail("pdfinfo_page_count_invalid", "pdfinfo page count is invalid");
  if (encryptedField === undefined)
    fail(
      "pdfinfo_encryption_missing",
      "pdfinfo did not return encryption state",
    );
  if (!fileSizeMatch?.[1])
    fail("pdfinfo_size_unparseable", "pdfinfo file size is unparseable");
  if (!pdfVersion)
    fail("pdfinfo_version_missing", "pdfinfo did not return the PDF version");
  return {
    title:
      titleValue === undefined
        ? { state: "not_stated" }
        : { state: "observed", value: titleValue },
    pages,
    encrypted: !encryptedField.toLowerCase().startsWith("no"),
    fileSizeBytes: Number(fileSizeMatch[1]),
    pdfVersion,
  };
}

function inspectPdf(
  path: string,
  pdfinfoCommand: string,
  runner: ToolRunner,
): PdfInfoObservation {
  const result = runner(pdfinfoCommand, [path]);
  if (result.status !== 0)
    fail("pdfinfo_failed", `pdfinfo failed with status ${result.status}`);
  if (result.stderr.length > 0)
    fail("pdfinfo_stderr", "pdfinfo emitted stderr during qualification");
  return parsePdfInfoOutput(result.stdout);
}

function verifyPdfInfo(
  target: PdfExtractionTarget,
  primary: PdfInfoObservation,
  replica: PdfInfoObservation,
): void {
  if (JSON.stringify(primary) !== JSON.stringify(replica)) {
    fail(
      "pdfinfo_replica_mismatch",
      `Primary and replica pdfinfo differ for ${target.targetId}`,
    );
  }
  if (
    JSON.stringify(primary.title) !==
    JSON.stringify(target.sourceBinding.expectedPdfInfoTitle)
  ) {
    fail(
      "pdfinfo_title_mismatch",
      `pdfinfo title differs from the source binding for ${target.targetId}`,
    );
  }
  if (primary.pages !== target.expectedPageCount) {
    fail(
      "pdfinfo_page_count_mismatch",
      `pdfinfo page count differs from the target for ${target.targetId}`,
    );
  }
  if (primary.fileSizeBytes !== target.expectedSizeBytes) {
    fail(
      "pdfinfo_size_mismatch",
      `pdfinfo size differs from the target for ${target.targetId}`,
    );
  }
  if (primary.encrypted !== target.expectedEncrypted || primary.encrypted) {
    fail(
      "pdf_encryption_blocked",
      `Encrypted PDF extraction is not allowed for ${target.targetId}`,
    );
  }
}

function privateExtractionBase(sha: string): string {
  return join(
    "pdf-page-extraction",
    `v${PDF_PAGE_EXTRACTION_PIPELINE_VERSION.split(".")[0]}`,
    "sha256",
    sha,
  );
}

function privateLocator(relativePath: string): string {
  return `private://corpus/${relativePath.split("\\").join("/")}`;
}

function trackedPageMapPath(sha: string): string {
  return join(PDF_PAGE_MAP_DIRECTORY, `${sha}.page-map.v1.json`);
}

function trackedReceiptPath(sha: string): string {
  return join(PDF_QUALIFICATION_RECEIPT_DIRECTORY, `${sha}.receipt.v1.json`);
}

function extractPage(
  inputPath: string,
  pageNumber: number,
  pdftotextCommand: string,
  runner: ToolRunner,
): {
  rawBytes: Buffer;
  rawText: string;
  normalizedBytes: Buffer;
  normalizedText: string;
  stderr: Buffer;
} {
  const page = String(pageNumber);
  const result = runner(pdftotextCommand, [
    "-f",
    page,
    "-l",
    page,
    "-enc",
    "UTF-8",
    "-eol",
    "unix",
    "-nopgbrk",
    inputPath,
    "-",
  ]);
  if (result.status !== 0)
    fail("pdftotext_page_failed", `pdftotext failed for page ${pageNumber}`);
  let rawText: string;
  try {
    rawText = new TextDecoder("utf-8", { fatal: true }).decode(result.stdout);
  } catch {
    fail(
      "pdftotext_invalid_utf8",
      `pdftotext returned invalid UTF-8 for page ${pageNumber}`,
    );
  }
  const normalizedText = normalizeExtractedPageText(rawText);
  return {
    rawBytes: result.stdout,
    rawText,
    normalizedBytes: Buffer.from(normalizedText, "utf8"),
    normalizedText,
    stderr: result.stderr,
  };
}

function qualificationState(
  target: PdfExtractionTarget,
  pages: PdfPageExtractionRecord[],
): PdfQualificationReceipt["qualificationState"] {
  if (target.identityAssociation.state !== "provisional_metadata_match") {
    return "technical_extraction_passed_identity_blocked";
  }
  return pages.some((page) => page.warnings.length > 0)
    ? "technical_extraction_passed_with_warnings"
    : "technical_extraction_passed";
}

export function qualifyPdfTarget(input: {
  target: PdfExtractionTarget;
  primaryCorpusRoot: string;
  replicaCorpusRoot: string;
  pdfinfoCommand?: string;
  pdftotextCommand?: string;
  runner?: ToolRunner;
}): QualificationResult {
  const runner = input.runner ?? defaultToolRunner;
  const pdfinfoCommand = input.pdfinfoCommand ?? "pdfinfo";
  const pdftotextCommand = input.pdftotextCommand ?? "pdftotext";
  assertPrivateDirectory(input.primaryCorpusRoot);
  assertPrivateDirectory(input.replicaCorpusRoot);

  const pdfRelativePath = join("sha256", `${input.target.expectedSha256}.pdf`);
  const primaryPdfPath = join(input.primaryCorpusRoot, pdfRelativePath);
  const replicaPdfPath = join(input.replicaCorpusRoot, pdfRelativePath);
  assertDistinctArchiveFiles(
    primaryPdfPath,
    replicaPdfPath,
    `Raw PDF ${input.target.targetId}`,
  );
  const primaryBytes = verifyInputPdf(primaryPdfPath, input.target);
  const replicaBytes = verifyInputPdf(replicaPdfPath, input.target);
  if (sha256(primaryBytes) !== sha256(replicaBytes)) {
    fail(
      "input_pdf_replica_hash_mismatch",
      `Primary and replica input hashes differ for ${input.target.targetId}`,
    );
  }

  const pdfinfoVersion = toolVersion(pdfinfoCommand, runner);
  const pdftotextVersion = toolVersion(pdftotextCommand, runner);
  const primaryInfo = inspectPdf(primaryPdfPath, pdfinfoCommand, runner);
  const replicaInfo = inspectPdf(replicaPdfPath, pdfinfoCommand, runner);
  verifyPdfInfo(input.target, primaryInfo, replicaInfo);

  const privateBase = privateExtractionBase(input.target.expectedSha256);
  const pages: PdfPageExtractionRecord[] = [];
  const privateFiles: PrivateFilePayload[] = [];
  for (let pageNumber = 1; pageNumber <= primaryInfo.pages; pageNumber += 1) {
    const extracted = extractPage(
      primaryPdfPath,
      pageNumber,
      pdftotextCommand,
      runner,
    );
    const pageName = String(pageNumber).padStart(4, "0");
    const rawRelativePath = join(
      privateBase,
      "pages",
      `page-${pageName}.raw.txt`,
    );
    const normalizedRelativePath = join(
      privateBase,
      "pages",
      `page-${pageName}.normalized.txt`,
    );
    pages.push(
      buildPageExtractionRecord({
        pageNumber,
        rawBytes: extracted.rawBytes,
        rawText: extracted.rawText,
        normalizedBytes: extracted.normalizedBytes,
        normalizedText: extracted.normalizedText,
        extractorStderr: extracted.stderr,
        rawTextLocator: privateLocator(rawRelativePath),
        normalizedTextLocator: privateLocator(normalizedRelativePath),
      }),
    );
    privateFiles.push(
      { relativePath: rawRelativePath, bytes: extracted.rawBytes },
      {
        relativePath: normalizedRelativePath,
        bytes: extracted.normalizedBytes,
      },
    );
  }

  if (pages.length !== primaryInfo.pages) {
    fail(
      "extracted_page_count_mismatch",
      `Extracted page count differs for ${input.target.targetId}`,
    );
  }
  if (pages.some((page, index) => page.pageNumber !== index + 1)) {
    fail(
      "extracted_page_sequence_incomplete",
      `Extracted page sequence differs for ${input.target.targetId}`,
    );
  }

  const sourceBinding = technicalSourceBinding(input.target.sourceBinding);
  const pageMap = sealPageMap({
    schemaVersion: PDF_PAGE_EXTRACTION_SCHEMA_VERSION,
    artifactType: "pdf_page_extraction_map",
    pipelineVersion: PDF_PAGE_EXTRACTION_PIPELINE_VERSION,
    processingUnit: {
      algorithm: "sha256",
      rawPdfSha256: input.target.expectedSha256,
    },
    identityKeys: [...input.target.identityKeys].sort(),
    identityAssociation: input.target.identityAssociation,
    sourceBinding,
    extractionEngine: {
      name: "pdftotext",
      version: pdftotextVersion,
      argumentsTemplate: [...EXTRACTION_ARGUMENTS_TEMPLATE],
    },
    expectedPageCount: primaryInfo.pages,
    extractedPageCount: pages.length,
    pageSequenceComplete: true,
    privateStorageOnly: true,
    textIncludedInTrackedArtifact: false,
    languagePolicy: {
      pageLanguageDetection: "not_computed",
      reason: "no_version_pinned_reliable_detector_configured",
    },
    promotionState: {
      aiAnalysisComplete: false,
      ownerReviewComplete: false,
      independentValidationComplete: false,
      rightsCleared: false,
      publicationReady: false,
      coveragePromotionAllowed: false,
    },
    pages,
  });

  const warningSummary = summarizeWarnings(pages);
  const warningPages = pages.filter((page) => page.warnings.length > 0);
  const receipt = sealQualificationReceipt({
    schemaVersion: PDF_PAGE_EXTRACTION_SCHEMA_VERSION,
    receiptType: "pdf_page_extraction_technical_qualification",
    pipelineVersion: PDF_PAGE_EXTRACTION_PIPELINE_VERSION,
    qualificationState: qualificationState(input.target, pages),
    processingUnit: {
      algorithm: "sha256",
      rawPdfSha256: input.target.expectedSha256,
    },
    identityKeys: [...input.target.identityKeys].sort(),
    identityAssociation: input.target.identityAssociation,
    sourceBinding,
    sourceFile: {
      expectedSizeBytes: input.target.expectedSizeBytes,
      observedSizeBytes: primaryBytes.length,
      headerMagic: "%PDF-",
      encryptionState: "not_encrypted",
      pageCount: primaryInfo.pages,
      pdfVersion: primaryInfo.pdfVersion,
      primaryCopy: {
        locator: privateLocator(pdfRelativePath),
        sha256: sha256(primaryBytes),
        sizeBytes: primaryBytes.length,
        fileMode: "0400",
        verified: true,
      },
      replicaCopy: {
        locator: `private://bigbrain-corpus/${pdfRelativePath.split("\\").join("/")}`,
        sha256: sha256(replicaBytes),
        sizeBytes: replicaBytes.length,
        fileMode: "0400",
        verified: true,
      },
    },
    extraction: {
      pdfinfoVersion,
      pdftotextVersion,
      argumentsTemplate: [...EXTRACTION_ARGUMENTS_TEMPLATE],
      pageMapLocator: trackedPageMapPath(input.target.expectedSha256),
      pageMapSha256: pageMap.pageMapSha256,
      extractedPageCount: pages.length,
      rawTextFileCount: pages.length,
      normalizedTextFileCount: pages.length,
      primaryPrivateOutputVerified: true,
      replicaPrivateOutputVerified: true,
    },
    totals: {
      rawSizeBytes: pages.reduce(
        (total, page) => total + page.rawText.sizeBytes,
        0,
      ),
      rawCharacterCount: pages.reduce(
        (total, page) => total + page.rawText.characterCount,
        0,
      ),
      normalizedSizeBytes: pages.reduce(
        (total, page) => total + page.normalizedText.sizeBytes,
        0,
      ),
      normalizedCharacterCount: pages.reduce(
        (total, page) => total + page.normalizedText.characterCount,
        0,
      ),
      wordCount: pages.reduce(
        (total, page) => total + page.normalizedText.wordCount,
        0,
      ),
      warningPageCount: warningPages.length,
      blankPageCount: pages.filter((page) =>
        page.warnings.includes("blank_extracted_text"),
      ).length,
      lowTextPageCount: pages.filter((page) =>
        page.warnings.includes("low_extracted_text"),
      ).length,
    },
    warningSummary,
    languagePolicy: {
      pageLanguageDetection: "not_computed",
      reason: "no_version_pinned_reliable_detector_configured",
    },
    semantics: {
      technicalExtractionOnly: true,
      fullTextStoredInRepository: false,
      aiAnalysisComplete: false,
      ownerReviewComplete: false,
      independentValidationComplete: false,
      rightsCleared: false,
      publicationReady: false,
      coveragePromotionAllowed: false,
    },
  });

  privateFiles.push(
    {
      relativePath: join(privateBase, "page-map.v1.json"),
      bytes: Buffer.from(prettyJson(pageMap)),
    },
    {
      relativePath: join(privateBase, "qualification-receipt.v1.json"),
      bytes: Buffer.from(prettyJson(receipt)),
    },
  );
  return { target: input.target, pageMap, receipt, privateFiles };
}

export function parseBatchManifest(value: unknown): PdfExtractionBatchManifest {
  const parsed = PdfExtractionBatchManifestSchema.safeParse(value);
  if (!parsed.success) {
    fail(
      "batch_manifest_invalid",
      `Strict batch manifest validation failed: ${z.prettifyError(parsed.error)}`,
    );
  }
  return parsed.data;
}

function blocker(input: {
  target: PdfExtractionTarget;
  blockerCode: string;
  technicalExtractionState: "passed" | "not_qualified";
  nextAction: string;
  diagnostic?: string;
}): QualificationBlocker {
  return {
    schemaVersion: "1.0.0",
    queueId: `pdf-page-extraction-blocker.${sha256(`${input.target.expectedSha256}:${input.blockerCode}`).slice(0, 24)}`,
    targetId: input.target.targetId,
    rawPdfSha256: input.target.expectedSha256,
    identityKeys: [...input.target.identityKeys].sort(),
    blockerCode: input.blockerCode,
    blockerState: "open",
    technicalExtractionState: input.technicalExtractionState,
    corpusIdentityVerified: false,
    aiAnalysisComplete: false,
    ownerReviewComplete: false,
    rightsCleared: false,
    publicationReady: false,
    coveragePromotionAllowed: false,
    nextAction: input.nextAction,
    diagnosticSha256: input.diagnostic ? sha256(input.diagnostic) : null,
  };
}

type TrackedArtifact = { path: string; content: string };

type GenerationManifest = {
  schemaVersion: "1.0.0";
  artifactType: "pdf_page_extraction_generation_manifest";
  pipelineVersion: string;
  batchId: string;
  inputs: Array<{ path: string; sha256: string; sizeBytes: number }>;
  outputs: Array<{ path: string; sha256: string; sizeBytes: number }>;
  outputSetSha256: string;
  semantics: {
    portableTrackedValidationSupported: true;
    privateStorageValidationRequiresArchiveRoots: true;
    openBlockersAreNotTechnicalCheckFailures: true;
    technicalFailurePublishesTrackedBundle: false;
  };
  generationManifestSha256: string;
};

const GENERATION_MANIFEST_SCHEMA = z
  .object({
    schemaVersion: z.literal("1.0.0"),
    artifactType: z.literal("pdf_page_extraction_generation_manifest"),
    pipelineVersion: z.literal(PDF_PAGE_EXTRACTION_PIPELINE_VERSION),
    batchId: z.string().min(1),
    inputs: z
      .array(
        z
          .object({
            path: z.string().min(1),
            sha256: z.string().regex(SHA256_PATTERN),
            sizeBytes: z.number().int().positive(),
          })
          .strict(),
      )
      .min(1),
    outputs: z
      .array(
        z
          .object({
            path: z.string().min(1),
            sha256: z.string().regex(SHA256_PATTERN),
            sizeBytes: z.number().int().nonnegative(),
          })
          .strict(),
      )
      .min(1),
    outputSetSha256: z.string().regex(SHA256_PATTERN),
    semantics: z
      .object({
        portableTrackedValidationSupported: z.literal(true),
        privateStorageValidationRequiresArchiveRoots: z.literal(true),
        openBlockersAreNotTechnicalCheckFailures: z.literal(true),
        technicalFailurePublishesTrackedBundle: z.literal(false),
      })
      .strict(),
    generationManifestSha256: z.string().regex(SHA256_PATTERN),
  })
  .strict();

const BLOCKER_SCHEMA = z
  .object({
    schemaVersion: z.literal("1.0.0"),
    queueId: z.string().min(1),
    targetId: z.string().min(1),
    rawPdfSha256: z.string().regex(SHA256_PATTERN),
    identityKeys: z.array(z.string().min(1)).min(1),
    blockerCode: z.string().min(1),
    blockerState: z.literal("open"),
    technicalExtractionState: z.enum(["passed", "not_qualified"]),
    corpusIdentityVerified: z.literal(false),
    aiAnalysisComplete: z.literal(false),
    ownerReviewComplete: z.literal(false),
    rightsCleared: z.literal(false),
    publicationReady: z.literal(false),
    coveragePromotionAllowed: z.literal(false),
    nextAction: z.string().min(1),
    diagnosticSha256: z.string().regex(SHA256_PATTERN).nullable(),
  })
  .strict();

const SUMMARY_SCHEMA = z
  .object({
    schemaVersion: z.literal("1.0.0"),
    artifactType: z.literal("pdf_page_extraction_batch_summary"),
    batchId: z.string().min(1),
    observedOn: z.iso.date(),
    pipelineVersion: z.literal(PDF_PAGE_EXTRACTION_PIPELINE_VERSION),
    processingUnit: z.literal("raw_pdf_sha256"),
    targetCount: z.number().int().positive(),
    technicallyQualifiedCount: z.number().int().nonnegative(),
    technicalFailureCount: z.number().int().nonnegative(),
    openBlockerCount: z.number().int().nonnegative(),
    legacyAliasScopeMismatchCount: z.number().int().nonnegative(),
    unregisteredSourceCandidateCount: z.number().int().nonnegative(),
    totals: z
      .object({
        pageCount: z.number().int().nonnegative(),
        wordCount: z.number().int().nonnegative(),
        warningPageCount: z.number().int().nonnegative(),
        blankPageCount: z.number().int().nonnegative(),
        lowTextPageCount: z.number().int().nonnegative(),
      })
      .strict(),
    documents: z.array(
      z
        .object({
          targetId: z.string().min(1),
          rawPdfSha256: z.string().regex(SHA256_PATTERN),
          title: z.string().min(1),
          doi: z.string().min(1).nullable(),
          officialUrl: z.string().url().startsWith("https://").optional(),
          controlledPrivateLocator: z
            .string()
            .regex(/^private:\/\/[a-z0-9][a-z0-9._:/-]*$/)
            .optional(),
          qualificationState: z.enum([
            "technical_extraction_passed",
            "technical_extraction_passed_with_warnings",
            "technical_extraction_passed_identity_blocked",
          ]),
          scopeDisposition: z.enum([
            "pending_owner_classification",
            "pending_owner_classification_indirect_context",
            "pending_owner_disposition_likely_out_of_scope",
          ]),
          pageCount: z.number().int().positive(),
          wordCount: z.number().int().nonnegative(),
          warningPageCount: z.number().int().nonnegative(),
          blankPageCount: z.number().int().nonnegative(),
          lowTextPageCount: z.number().int().nonnegative(),
          pageMapSha256: z.string().regex(SHA256_PATTERN),
          receiptSha256: z.string().regex(SHA256_PATTERN),
        })
        .strict()
        .superRefine((document, context) => {
          if (
            (document.officialUrl === undefined) ===
            (document.controlledPrivateLocator === undefined)
          ) {
            context.addIssue({
              code: "custom",
              message:
                "Document summary requires exactly one official or controlled private locator",
            });
          }
        }),
    ),
    semantics: PdfExtractionBatchManifestSchema.shape.semantics,
    summarySha256: z.string().regex(SHA256_PATTERN),
  })
  .strict();

function snapshot(
  path: string,
  content: Buffer,
): { path: string; sha256: string; sizeBytes: number } {
  return { path, sha256: sha256(content), sizeBytes: content.length };
}

function trackedOutputPaths(manifest: PdfExtractionBatchManifest): string[] {
  return [
    ...manifest.targets.map((target) =>
      trackedPageMapPath(target.expectedSha256),
    ),
    ...manifest.targets.map((target) =>
      trackedReceiptPath(target.expectedSha256),
    ),
    PDF_QUALIFICATION_BLOCKER_QUEUE_PATH,
    PDF_QUALIFICATION_SUMMARY_PATH,
  ].sort();
}

function buildGenerationManifest(input: {
  repositoryRoot: string;
  manifestPath: string;
  manifest: PdfExtractionBatchManifest;
  artifacts: TrackedArtifact[];
}): GenerationManifest {
  const inputPaths = [
    input.manifestPath,
    PDF_QUALIFICATION_GENERATOR_PATH,
    PDF_QUALIFICATION_LIBRARY_PATH,
  ].sort();
  const inputs = inputPaths.map((path) =>
    snapshot(path, readFileSync(join(input.repositoryRoot, path))),
  );
  const outputs = [...input.artifacts]
    .sort((left, right) => left.path.localeCompare(right.path))
    .map((artifact) => snapshot(artifact.path, Buffer.from(artifact.content)));
  const body = {
    schemaVersion: "1.0.0" as const,
    artifactType: "pdf_page_extraction_generation_manifest" as const,
    pipelineVersion: PDF_PAGE_EXTRACTION_PIPELINE_VERSION,
    batchId: input.manifest.batchId,
    inputs,
    outputs,
    outputSetSha256: sha256(canonicalJson(outputs as unknown as JsonValue)),
    semantics: {
      portableTrackedValidationSupported: true as const,
      privateStorageValidationRequiresArchiveRoots: true as const,
      openBlockersAreNotTechnicalCheckFailures: true as const,
      technicalFailurePublishesTrackedBundle: false as const,
    },
  };
  return {
    ...body,
    generationManifestSha256: sha256(
      canonicalJson(body as unknown as JsonValue),
    ),
  };
}

function writeTrackedBundleAtomically(
  repositoryRoot: string,
  artifacts: TrackedArtifact[],
  generationManifest: GenerationManifest,
): void {
  const completeBundle = [
    ...artifacts,
    {
      path: PDF_QUALIFICATION_GENERATION_MANIFEST_PATH,
      content: prettyJson(generationManifest),
    },
  ];
  const temporaryFiles: Array<{ temporaryPath: string; finalPath: string }> =
    [];
  try {
    for (const artifact of completeBundle) {
      const finalPath = join(repositoryRoot, artifact.path);
      mkdirSync(dirname(finalPath), { recursive: true });
      const temporaryPath = `${finalPath}.${process.pid}.tmp`;
      if (existsSync(temporaryPath))
        fail(
          "tracked_temp_collision",
          `Tracked temporary path exists: ${artifact.path}`,
        );
      writeFileSync(temporaryPath, artifact.content, {
        flag: "wx",
        encoding: "utf8",
      });
      if (readFileSync(temporaryPath, "utf8") !== artifact.content) {
        fail(
          "tracked_temp_verification_failed",
          `Tracked temporary artifact differs: ${artifact.path}`,
        );
      }
      temporaryFiles.push({ temporaryPath, finalPath });
    }
    for (const file of temporaryFiles.filter(
      (file) =>
        !file.finalPath.endsWith(PDF_QUALIFICATION_GENERATION_MANIFEST_PATH),
    )) {
      renameSync(file.temporaryPath, file.finalPath);
    }
    const manifestFile = temporaryFiles.find((file) =>
      file.finalPath.endsWith(PDF_QUALIFICATION_GENERATION_MANIFEST_PATH),
    );
    assert(manifestFile, "Generation manifest temporary file is missing");
    renameSync(manifestFile.temporaryPath, manifestFile.finalPath);
  } finally {
    for (const file of temporaryFiles) {
      if (existsSync(file.temporaryPath)) unlinkSync(file.temporaryPath);
    }
  }
}

function checkTrackedContent(
  repositoryRoot: string,
  artifacts: TrackedArtifact[],
  manifest: GenerationManifest,
): void {
  for (const artifact of [
    ...artifacts,
    {
      path: PDF_QUALIFICATION_GENERATION_MANIFEST_PATH,
      content: prettyJson(manifest),
    },
  ]) {
    const path = join(repositoryRoot, artifact.path);
    if (!existsSync(path))
      fail(
        "tracked_artifact_missing",
        `Tracked artifact is missing: ${artifact.path}`,
      );
    if (readFileSync(path, "utf8") !== artifact.content)
      fail(
        "tracked_artifact_stale",
        `Tracked artifact is stale: ${artifact.path}`,
      );
  }
}

export function runQualificationBatch(input: {
  repositoryRoot: string;
  manifestPath?: string;
  manifest: PdfExtractionBatchManifest;
  primaryCorpusRoot: string;
  replicaCorpusRoot: string;
  checkOnly: boolean;
  runner?: ToolRunner;
}): {
  results: QualificationResult[];
  blockers: QualificationBlocker[];
  summary: Record<string, unknown>;
} {
  assertDistinctArchiveRoots(input.primaryCorpusRoot, input.replicaCorpusRoot);
  const results: QualificationResult[] = [];
  const blockers: QualificationBlocker[] = [];

  for (const target of input.manifest.targets) {
    try {
      const result = qualifyPdfTarget({
        target,
        primaryCorpusRoot: input.primaryCorpusRoot,
        replicaCorpusRoot: input.replicaCorpusRoot,
        runner: input.runner,
      });
      for (const payload of result.privateFiles) {
        writeOrVerifyPrivateFile(
          join(input.primaryCorpusRoot, payload.relativePath),
          payload.bytes,
          input.checkOnly,
        );
        writeOrVerifyPrivateFile(
          join(input.replicaCorpusRoot, payload.relativePath),
          payload.bytes,
          input.checkOnly,
        );
      }
      results.push(result);
      if (
        target.identityAssociation.state ===
        "blocked_legacy_alias_scope_mismatch"
      ) {
        blockers.push(
          blocker({
            target,
            blockerCode: "legacy_alias_scope_mismatch",
            technicalExtractionState: "passed",
            nextAction:
              "Owner must review the legacy alias and scope disposition before this raw PDF can bind to a verified corpus identity.",
          }),
        );
      } else if (
        target.identityAssociation.state === "unregistered_source_candidate"
      ) {
        blockers.push(
          blocker({
            target,
            blockerCode: "database_registration_required",
            technicalExtractionState: "passed",
            nextAction:
              "Complete controlled database registration and bind the resulting canonical identity before identity verification or source analysis.",
          }),
        );
      }
    } catch (error) {
      const blockerCode =
        error instanceof PdfQualificationError
          ? error.blockerCode
          : "unexpected_qualification_error";
      const diagnostic = error instanceof Error ? error.message : String(error);
      blockers.push(
        blocker({
          target,
          blockerCode,
          technicalExtractionState: "not_qualified",
          nextAction:
            "Resolve the technical mismatch, then rerun the content-hash-bound qualification.",
          diagnostic,
        }),
      );
    }
  }

  const orderedResults = [...results].sort((left, right) =>
    left.target.expectedSha256.localeCompare(right.target.expectedSha256),
  );
  const orderedBlockers = [...blockers].sort((left, right) =>
    left.queueId.localeCompare(right.queueId),
  );
  const technicalFailures = orderedBlockers.filter(
    (entry) => entry.technicalExtractionState === "not_qualified",
  );
  if (technicalFailures.length > 0) {
    fail(
      "batch_technical_failure",
      `No tracked bundle published because ${technicalFailures.length} target(s) failed technical qualification: ${technicalFailures.map((entry) => `${entry.targetId}:${entry.blockerCode}`).join(", ")}`,
    );
  }
  const summaryCore = {
    schemaVersion: "1.0.0",
    artifactType: "pdf_page_extraction_batch_summary",
    batchId: input.manifest.batchId,
    observedOn: input.manifest.observedOn,
    pipelineVersion: PDF_PAGE_EXTRACTION_PIPELINE_VERSION,
    processingUnit: "raw_pdf_sha256",
    targetCount: input.manifest.targets.length,
    technicallyQualifiedCount: orderedResults.length,
    technicalFailureCount: 0,
    openBlockerCount: orderedBlockers.length,
    legacyAliasScopeMismatchCount: orderedBlockers.filter(
      (entry) => entry.blockerCode === "legacy_alias_scope_mismatch",
    ).length,
    unregisteredSourceCandidateCount: orderedBlockers.filter(
      (entry) => entry.blockerCode === "database_registration_required",
    ).length,
    totals: {
      pageCount: orderedResults.reduce(
        (total, result) => total + result.receipt.sourceFile.pageCount,
        0,
      ),
      wordCount: orderedResults.reduce(
        (total, result) => total + result.receipt.totals.wordCount,
        0,
      ),
      warningPageCount: orderedResults.reduce(
        (total, result) => total + result.receipt.totals.warningPageCount,
        0,
      ),
      blankPageCount: orderedResults.reduce(
        (total, result) => total + result.receipt.totals.blankPageCount,
        0,
      ),
      lowTextPageCount: orderedResults.reduce(
        (total, result) => total + result.receipt.totals.lowTextPageCount,
        0,
      ),
    },
    documents: orderedResults.map((result) => ({
      targetId: result.target.targetId,
      rawPdfSha256: result.target.expectedSha256,
      title: result.target.sourceBinding.title,
      doi: result.target.sourceBinding.doi,
      ...sourceLocatorFields(result.target.sourceBinding),
      qualificationState: result.receipt.qualificationState,
      scopeDisposition: result.target.sourceBinding.scopeDisposition,
      pageCount: result.receipt.sourceFile.pageCount,
      wordCount: result.receipt.totals.wordCount,
      warningPageCount: result.receipt.totals.warningPageCount,
      blankPageCount: result.receipt.totals.blankPageCount,
      lowTextPageCount: result.receipt.totals.lowTextPageCount,
      pageMapSha256: result.pageMap.pageMapSha256,
      receiptSha256: result.receipt.receiptSha256,
    })),
    semantics: input.manifest.semantics,
  };
  const summary = {
    ...summaryCore,
    summarySha256: sha256(canonicalJson(summaryCore as unknown as JsonValue)),
  };
  const artifacts: TrackedArtifact[] = [];
  for (const result of orderedResults) {
    artifacts.push(
      {
        path: trackedPageMapPath(result.target.expectedSha256),
        content: prettyJson(result.pageMap),
      },
      {
        path: trackedReceiptPath(result.target.expectedSha256),
        content: prettyJson(result.receipt),
      },
    );
  }
  artifacts.push(
    {
      path: PDF_QUALIFICATION_BLOCKER_QUEUE_PATH,
      content: jsonLines(orderedBlockers),
    },
    { path: PDF_QUALIFICATION_SUMMARY_PATH, content: prettyJson(summary) },
  );
  const manifestPath = input.manifestPath ?? DEFAULT_BATCH_MANIFEST_PATH;
  const expectedPaths = trackedOutputPaths(input.manifest);
  assert.deepEqual(
    artifacts.map((artifact) => artifact.path).sort(),
    expectedPaths,
  );
  const generationManifest = buildGenerationManifest({
    repositoryRoot: input.repositoryRoot,
    manifestPath,
    manifest: input.manifest,
    artifacts,
  });
  if (input.checkOnly)
    checkTrackedContent(input.repositoryRoot, artifacts, generationManifest);
  else
    writeTrackedBundleAtomically(
      input.repositoryRoot,
      artifacts,
      generationManifest,
    );
  return { results: orderedResults, blockers: orderedBlockers, summary };
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function strictJsonLines(path: string): QualificationBlocker[] {
  const content = readFileSync(path, "utf8");
  if (content.length === 0) return [];
  if (!content.endsWith("\n"))
    fail(
      "tracked_blocker_queue_invalid",
      "Blocker queue must end with a newline",
    );
  return content
    .trimEnd()
    .split("\n")
    .map((line, index) => {
      const parsed = BLOCKER_SCHEMA.safeParse(JSON.parse(line));
      if (!parsed.success)
        fail(
          "tracked_blocker_queue_invalid",
          `Blocker queue line ${index + 1} is invalid`,
        );
      return parsed.data;
    });
}

function assertExactArtifactSet(
  repositoryRoot: string,
  manifest: PdfExtractionBatchManifest,
  manifestPath: string,
): void {
  if (manifestPath === DEFAULT_BATCH_MANIFEST_PATH) {
    const rootDirectory = dirname(
      join(repositoryRoot, PDF_QUALIFICATION_SUMMARY_PATH),
    );
    const expectedRootEntries = [
      basename(DEFAULT_BATCH_MANIFEST_PATH),
      basename(PDF_QUALIFICATION_BLOCKER_QUEUE_PATH),
      basename(PDF_QUALIFICATION_GENERATION_MANIFEST_PATH),
      basename(PDF_QUALIFICATION_SUMMARY_PATH),
      basename(PDF_PAGE_MAP_DIRECTORY),
      basename(PDF_QUALIFICATION_RECEIPT_DIRECTORY),
    ].sort();
    const actualRootEntries = readdirSync(rootDirectory).sort();
    if (
      JSON.stringify(actualRootEntries) !== JSON.stringify(expectedRootEntries)
    ) {
      fail(
        "tracked_output_orphan",
        "Tracked PDF extraction root contains an unexpected or missing entry",
      );
    }
  }
  const expectedPageMaps = new Set(
    manifest.targets.map(
      (target) => `${target.expectedSha256}.page-map.v1.json`,
    ),
  );
  const expectedReceipts = new Set(
    manifest.targets.map(
      (target) => `${target.expectedSha256}.receipt.v1.json`,
    ),
  );
  for (const [directory, expected] of [
    [PDF_PAGE_MAP_DIRECTORY, expectedPageMaps],
    [PDF_QUALIFICATION_RECEIPT_DIRECTORY, expectedReceipts],
  ] as const) {
    const absoluteDirectory = join(repositoryRoot, directory);
    if (!existsSync(absoluteDirectory))
      fail(
        "tracked_output_directory_missing",
        `Tracked output directory is missing: ${directory}`,
      );
    const actual = readdirSync(absoluteDirectory, { withFileTypes: true });
    if (actual.some((entry) => !entry.isFile()))
      fail("tracked_output_orphan", `Non-file entry found in ${directory}`);
    const actualNames = actual.map((entry) => entry.name).sort();
    const expectedNames = [...expected].sort();
    if (JSON.stringify(actualNames) !== JSON.stringify(expectedNames)) {
      fail(
        "tracked_output_orphan",
        `Tracked output set differs in ${directory}`,
      );
    }
  }
}

export function checkTrackedQualificationBundle(input: {
  repositoryRoot: string;
  manifestPath?: string;
}): {
  manifest: PdfExtractionBatchManifest;
  summary: z.infer<typeof SUMMARY_SCHEMA>;
  blockers: QualificationBlocker[];
  privateVerificationPerformed: false;
} {
  const manifestPath = input.manifestPath ?? DEFAULT_BATCH_MANIFEST_PATH;
  const manifest = parseBatchManifest(
    readJson(join(input.repositoryRoot, manifestPath)),
  );
  const generationPath = join(
    input.repositoryRoot,
    PDF_QUALIFICATION_GENERATION_MANIFEST_PATH,
  );
  if (!existsSync(generationPath))
    fail(
      "generation_manifest_missing",
      "PDF extraction generation manifest is missing",
    );
  const parsedGeneration = GENERATION_MANIFEST_SCHEMA.safeParse(
    readJson(generationPath),
  );
  if (!parsedGeneration.success)
    fail(
      "generation_manifest_invalid",
      "PDF extraction generation manifest is invalid",
    );
  const generationManifest = parsedGeneration.data;
  const { generationManifestSha256, ...generationBody } = generationManifest;
  if (
    generationManifestSha256 !==
    sha256(canonicalJson(generationBody as unknown as JsonValue))
  ) {
    fail(
      "generation_manifest_self_hash_mismatch",
      "Generation manifest self-hash mismatch",
    );
  }
  if (generationManifest.batchId !== manifest.batchId)
    fail(
      "generation_manifest_batch_mismatch",
      "Generation manifest batch differs",
    );

  const expectedInputPaths = [
    manifestPath,
    PDF_QUALIFICATION_GENERATOR_PATH,
    PDF_QUALIFICATION_LIBRARY_PATH,
  ].sort();
  if (
    JSON.stringify(generationManifest.inputs.map((entry) => entry.path)) !==
    JSON.stringify(expectedInputPaths)
  ) {
    fail(
      "generation_manifest_input_set_mismatch",
      "Generation manifest input set differs",
    );
  }
  for (const entry of generationManifest.inputs) {
    const bytes = readFileSync(join(input.repositoryRoot, entry.path));
    if (bytes.length !== entry.sizeBytes || sha256(bytes) !== entry.sha256) {
      fail(
        "generation_manifest_input_hash_mismatch",
        `Generation input differs: ${entry.path}`,
      );
    }
  }

  const expectedOutputPaths = trackedOutputPaths(manifest);
  if (
    JSON.stringify(generationManifest.outputs.map((entry) => entry.path)) !==
    JSON.stringify(expectedOutputPaths)
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
      "Generation manifest output-set hash mismatch",
    );
  }
  for (const entry of generationManifest.outputs) {
    const bytes = readFileSync(join(input.repositoryRoot, entry.path));
    if (bytes.length !== entry.sizeBytes || sha256(bytes) !== entry.sha256) {
      fail(
        "generation_manifest_output_hash_mismatch",
        `Tracked output differs: ${entry.path}`,
      );
    }
  }
  assertExactArtifactSet(input.repositoryRoot, manifest, manifestPath);

  const summaryResult = SUMMARY_SCHEMA.safeParse(
    readJson(join(input.repositoryRoot, PDF_QUALIFICATION_SUMMARY_PATH)),
  );
  if (!summaryResult.success)
    fail(
      "tracked_summary_invalid",
      "Tracked PDF extraction summary is invalid",
    );
  const summary = summaryResult.data;
  const { summarySha256, ...summaryBody } = summary;
  if (
    summarySha256 !== sha256(canonicalJson(summaryBody as unknown as JsonValue))
  ) {
    fail(
      "tracked_summary_self_hash_mismatch",
      "Tracked PDF extraction summary self-hash mismatch",
    );
  }
  if (
    summary.batchId !== manifest.batchId ||
    summary.targetCount !== manifest.targets.length
  ) {
    fail(
      "tracked_summary_batch_mismatch",
      "Tracked summary does not match the batch",
    );
  }
  const blockers = strictJsonLines(
    join(input.repositoryRoot, PDF_QUALIFICATION_BLOCKER_QUEUE_PATH),
  );
  if (blockers.length !== summary.openBlockerCount)
    fail(
      "tracked_blocker_count_mismatch",
      "Blocker count differs from summary",
    );

  const expectedBlockers = manifest.targets
    .filter(
      (target) =>
        target.identityAssociation.state !== "provisional_metadata_match",
    )
    .map((target) => {
      const legacyAlias =
        target.identityAssociation.state ===
        "blocked_legacy_alias_scope_mismatch";
      return blocker({
        target,
        blockerCode: legacyAlias
          ? "legacy_alias_scope_mismatch"
          : "database_registration_required",
        technicalExtractionState: "passed",
        nextAction: legacyAlias
          ? "Owner must review the legacy alias and scope disposition before this raw PDF can bind to a verified corpus identity."
          : "Complete controlled database registration and bind the resulting canonical identity before identity verification or source analysis.",
      });
    })
    .sort((left, right) => left.queueId.localeCompare(right.queueId));
  if (
    canonicalJson(blockers as unknown as JsonValue) !==
    canonicalJson(expectedBlockers as unknown as JsonValue)
  ) {
    fail(
      "tracked_blocker_content_mismatch",
      "Tracked blocker queue differs from the exact batch target dispositions",
    );
  }

  let totalPages = 0;
  let totalWords = 0;
  let totalWarningPages = 0;
  let totalBlankPages = 0;
  let totalLowTextPages = 0;
  const expectedDocuments: Array<Record<string, unknown>> = [];
  for (const target of manifest.targets) {
    const pageMapResult = PdfPageMapSchema.safeParse(
      readJson(
        join(input.repositoryRoot, trackedPageMapPath(target.expectedSha256)),
      ),
    );
    if (!pageMapResult.success)
      fail(
        "tracked_page_map_invalid",
        `Page map is invalid for ${target.targetId}`,
      );
    const receiptResult = PdfQualificationReceiptSchema.safeParse(
      readJson(
        join(input.repositoryRoot, trackedReceiptPath(target.expectedSha256)),
      ),
    );
    if (!receiptResult.success)
      fail(
        "tracked_receipt_invalid",
        `Receipt is invalid for ${target.targetId}`,
      );
    const pageMap = pageMapResult.data;
    const receipt = receiptResult.data;
    const { pageMapSha256, ...pageMapBody } = pageMap;
    const { receiptSha256, ...receiptBody } = receipt;
    if (
      pageMapSha256 !==
      sha256(canonicalJson(pageMapBody as unknown as JsonValue))
    ) {
      fail(
        "tracked_page_map_self_hash_mismatch",
        `Page map self-hash differs for ${target.targetId}`,
      );
    }
    if (
      receiptSha256 !==
      sha256(canonicalJson(receiptBody as unknown as JsonValue))
    ) {
      fail(
        "tracked_receipt_self_hash_mismatch",
        `Receipt self-hash differs for ${target.targetId}`,
      );
    }
    const expectedIdentityKeys = [...target.identityKeys].sort();
    const expectedSourceBinding = technicalSourceBinding(target.sourceBinding);
    const expectedTotals = {
      rawSizeBytes: pageMap.pages.reduce(
        (sum, page) => sum + page.rawText.sizeBytes,
        0,
      ),
      rawCharacterCount: pageMap.pages.reduce(
        (sum, page) => sum + page.rawText.characterCount,
        0,
      ),
      normalizedSizeBytes: pageMap.pages.reduce(
        (sum, page) => sum + page.normalizedText.sizeBytes,
        0,
      ),
      normalizedCharacterCount: pageMap.pages.reduce(
        (sum, page) => sum + page.normalizedText.characterCount,
        0,
      ),
      wordCount: pageMap.pages.reduce(
        (sum, page) => sum + page.normalizedText.wordCount,
        0,
      ),
      warningPageCount: pageMap.pages.filter((page) => page.warnings.length > 0)
        .length,
      blankPageCount: pageMap.pages.filter((page) =>
        page.warnings.includes("blank_extracted_text"),
      ).length,
      lowTextPageCount: pageMap.pages.filter((page) =>
        page.warnings.includes("low_extracted_text"),
      ).length,
    };
    if (
      pageMap.processingUnit.rawPdfSha256 !== target.expectedSha256 ||
      receipt.processingUnit.rawPdfSha256 !== target.expectedSha256 ||
      receipt.extraction.pageMapSha256 !== pageMapSha256 ||
      receipt.extraction.pageMapLocator !==
        trackedPageMapPath(target.expectedSha256) ||
      pageMap.expectedPageCount !== target.expectedPageCount ||
      receipt.sourceFile.pageCount !== target.expectedPageCount ||
      receipt.sourceFile.expectedSizeBytes !== target.expectedSizeBytes ||
      receipt.sourceFile.observedSizeBytes !== target.expectedSizeBytes ||
      receipt.sourceFile.encryptionState !== "not_encrypted" ||
      pageMap.extractedPageCount !== pageMap.pages.length ||
      receipt.extraction.extractedPageCount !== pageMap.pages.length ||
      receipt.extraction.rawTextFileCount !== pageMap.pages.length ||
      receipt.extraction.normalizedTextFileCount !== pageMap.pages.length ||
      pageMap.pages.some((page, index) => page.pageNumber !== index + 1) ||
      receipt.qualificationState !==
        qualificationState(target, pageMap.pages) ||
      canonicalJson(pageMap.identityKeys as unknown as JsonValue) !==
        canonicalJson(expectedIdentityKeys as unknown as JsonValue) ||
      canonicalJson(receipt.identityKeys as unknown as JsonValue) !==
        canonicalJson(expectedIdentityKeys as unknown as JsonValue) ||
      canonicalJson(pageMap.identityAssociation as unknown as JsonValue) !==
        canonicalJson(target.identityAssociation as unknown as JsonValue) ||
      canonicalJson(receipt.identityAssociation as unknown as JsonValue) !==
        canonicalJson(target.identityAssociation as unknown as JsonValue) ||
      canonicalJson(pageMap.sourceBinding as unknown as JsonValue) !==
        canonicalJson(expectedSourceBinding as unknown as JsonValue) ||
      canonicalJson(receipt.sourceBinding as unknown as JsonValue) !==
        canonicalJson(expectedSourceBinding as unknown as JsonValue) ||
      canonicalJson(receipt.totals as unknown as JsonValue) !==
        canonicalJson(expectedTotals as unknown as JsonValue) ||
      canonicalJson(receipt.warningSummary as unknown as JsonValue) !==
        canonicalJson(summarizeWarnings(pageMap.pages) as unknown as JsonValue)
    ) {
      fail(
        "tracked_cross_artifact_mismatch",
        `Tracked artifacts do not cross-bind for ${target.targetId}`,
      );
    }
    totalPages += pageMap.pages.length;
    totalWords += receipt.totals.wordCount;
    totalWarningPages += receipt.totals.warningPageCount;
    totalBlankPages += receipt.totals.blankPageCount;
    totalLowTextPages += receipt.totals.lowTextPageCount;
    expectedDocuments.push({
      targetId: target.targetId,
      rawPdfSha256: target.expectedSha256,
      title: target.sourceBinding.title,
      doi: target.sourceBinding.doi,
      ...sourceLocatorFields(target.sourceBinding),
      qualificationState: receipt.qualificationState,
      scopeDisposition: target.sourceBinding.scopeDisposition,
      pageCount: receipt.sourceFile.pageCount,
      wordCount: receipt.totals.wordCount,
      warningPageCount: receipt.totals.warningPageCount,
      blankPageCount: receipt.totals.blankPageCount,
      lowTextPageCount: receipt.totals.lowTextPageCount,
      pageMapSha256,
      receiptSha256,
    });
  }
  expectedDocuments.sort((left, right) =>
    String(left.rawPdfSha256).localeCompare(String(right.rawPdfSha256)),
  );
  if (
    canonicalJson(summary.totals as unknown as JsonValue) !==
      canonicalJson({
        pageCount: totalPages,
        wordCount: totalWords,
        warningPageCount: totalWarningPages,
        blankPageCount: totalBlankPages,
        lowTextPageCount: totalLowTextPages,
      }) ||
    canonicalJson(summary.documents as unknown as JsonValue) !==
      canonicalJson(expectedDocuments as unknown as JsonValue) ||
    summary.technicallyQualifiedCount !== manifest.targets.length ||
    summary.technicalFailureCount !== 0 ||
    summary.openBlockerCount !== expectedBlockers.length ||
    summary.legacyAliasScopeMismatchCount !==
      expectedBlockers.filter(
        (entry) => entry.blockerCode === "legacy_alias_scope_mismatch",
      ).length ||
    summary.unregisteredSourceCandidateCount !==
      expectedBlockers.filter(
        (entry) => entry.blockerCode === "database_registration_required",
      ).length ||
    canonicalJson(summary.semantics as unknown as JsonValue) !==
      canonicalJson(manifest.semantics as unknown as JsonValue)
  ) {
    fail(
      "tracked_summary_content_mismatch",
      "Tracked summary does not exactly match page maps, receipts and batch semantics",
    );
  }
  return { manifest, summary, blockers, privateVerificationPerformed: false };
}

type CliOptions = {
  mode: "write" | "check-private" | "check-tracked";
  manifestPath: string;
  primaryCorpusRoot: string | null;
  replicaCorpusRoot: string | null;
  requireNoOpenBlockers: boolean;
};

export function parseCliArgs(
  args: string[],
  env: NodeJS.ProcessEnv = process.env,
): CliOptions {
  let mode: CliOptions["mode"] | null = null;
  let manifestPath = DEFAULT_BATCH_MANIFEST_PATH;
  let primaryCorpusRoot = env.FOOD_SYSTEMS_PRIVATE_CORPUS_ROOT ?? "";
  let replicaCorpusRoot = env.FOOD_SYSTEMS_PRIVATE_CORPUS_REPLICA_ROOT ?? "";
  let requireNoOpenBlockers = false;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (
      ["--write", "--check", "--check-private", "--check-tracked"].includes(arg)
    ) {
      if (mode) fail("cli_invalid", "Choose exactly one operation mode");
      mode =
        arg === "--check"
          ? "check-private"
          : (arg.slice(2) as CliOptions["mode"]);
      continue;
    }
    if (arg === "--require-no-open-blockers") {
      requireNoOpenBlockers = true;
      continue;
    }
    if (
      ["--manifest", "--primary-corpus-root", "--replica-corpus-root"].includes(
        arg,
      )
    ) {
      const value = args[index + 1];
      if (!value) fail("cli_invalid", `${arg} requires a value`);
      if (arg === "--manifest") manifestPath = value;
      if (arg === "--primary-corpus-root") primaryCorpusRoot = value;
      if (arg === "--replica-corpus-root") replicaCorpusRoot = value;
      index += 1;
      continue;
    }
    fail("cli_invalid", `Unknown argument: ${arg}`);
  }
  if (!mode) fail("cli_invalid", "Choose exactly one operation mode");
  if (mode !== "check-tracked" && (!primaryCorpusRoot || !replicaCorpusRoot)) {
    fail(
      "cli_invalid",
      "Set both private corpus roots by environment or CLI flags",
    );
  }
  return {
    mode,
    manifestPath,
    primaryCorpusRoot: primaryCorpusRoot ? resolve(primaryCorpusRoot) : null,
    replicaCorpusRoot: replicaCorpusRoot ? resolve(replicaCorpusRoot) : null,
    requireNoOpenBlockers,
  };
}

function main(): void {
  const options = parseCliArgs(process.argv.slice(2));
  const repositoryRoot = process.cwd();
  if (options.mode === "check-tracked") {
    const checked = checkTrackedQualificationBundle({
      repositoryRoot,
      manifestPath: options.manifestPath,
    });
    console.log(
      JSON.stringify({
        mode: options.mode,
        batchId: checked.manifest.batchId,
        targets: checked.manifest.targets.length,
        blockers: checked.blockers.length,
        privateVerificationPerformed: false,
      }),
    );
    if (options.requireNoOpenBlockers && checked.blockers.length > 0)
      process.exitCode = 2;
    return;
  }
  assert(options.primaryCorpusRoot && options.replicaCorpusRoot);
  const manifest = parseBatchManifest(
    readJson(join(repositoryRoot, options.manifestPath)),
  );
  const result = runQualificationBatch({
    repositoryRoot,
    manifestPath: options.manifestPath,
    manifest,
    primaryCorpusRoot: options.primaryCorpusRoot,
    replicaCorpusRoot: options.replicaCorpusRoot,
    checkOnly: options.mode === "check-private",
  });
  const totals = result.summary.totals as Record<string, number>;
  console.log(
    JSON.stringify({
      mode: options.mode,
      batchId: manifest.batchId,
      targets: manifest.targets.length,
      technicallyQualified: result.results.length,
      blockers: result.blockers.length,
      pages: totals.pageCount,
      words: totals.wordCount,
      warningPages: totals.warningPageCount,
      blankPages: totals.blankPageCount,
      lowTextPages: totals.lowTextPageCount,
      privateVerificationPerformed: true,
    }),
  );
  if (options.requireNoOpenBlockers && result.blockers.length > 0)
    process.exitCode = 2;
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : "";
if (import.meta.url === invokedPath) main();
