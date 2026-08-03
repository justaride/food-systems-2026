import { createHash } from "node:crypto";

import { z } from "zod";

export const PDF_PAGE_EXTRACTION_SCHEMA_VERSION = "1.0.0" as const;
export const PDF_PAGE_EXTRACTION_PIPELINE_VERSION = "1.0.0" as const;
export const PDF_PAGE_LOW_TEXT_WORD_THRESHOLD = 25;

export type JsonPrimitive = null | boolean | number | string;
export type JsonValue =
  JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type PdfPageWarningCode =
  | "blank_extracted_text"
  | "low_extracted_text"
  | "extractor_stderr"
  | "replacement_character_present"
  | "nul_character_present"
  | "unexpected_control_character_present";

export type PdfIdentityAssociation =
  | {
      state: "provisional_metadata_match";
      intendedLabel: string;
      observedDocumentTitle: string;
      blockerCode: null;
    }
  | {
      state: "blocked_legacy_alias_scope_mismatch";
      intendedLabel: string;
      observedDocumentTitle: string;
      blockerCode: "legacy_alias_scope_mismatch";
    }
  | {
      state: "unregistered_source_candidate";
      intendedLabel: string;
      observedDocumentTitle: string;
      blockerCode: "database_registration_required";
    };

export type PageLanguageSignal = {
  state: "unavailable";
  languageCode: null;
  confidence: null;
  method: "not_computed";
  reason: "no_version_pinned_reliable_detector_configured";
};

export type PageTextMeasure = {
  sha256: string;
  sizeBytes: number;
  characterCount: number;
  lineCount: number;
};

export type PdfPageExtractionRecord = {
  pageNumber: number;
  storage: {
    rawTextLocator: string;
    normalizedTextLocator: string;
  };
  rawText: PageTextMeasure;
  normalizedText: PageTextMeasure & {
    wordCount: number;
  };
  extractorStderr: {
    present: boolean;
    sha256: string;
    sizeBytes: number;
  };
  languageSignal: PageLanguageSignal;
  warnings: PdfPageWarningCode[];
};

export type PdfPageMapBody = {
  schemaVersion: typeof PDF_PAGE_EXTRACTION_SCHEMA_VERSION;
  artifactType: "pdf_page_extraction_map";
  pipelineVersion: typeof PDF_PAGE_EXTRACTION_PIPELINE_VERSION;
  processingUnit: {
    algorithm: "sha256";
    rawPdfSha256: string;
  };
  identityKeys: string[];
  identityAssociation: PdfIdentityAssociation;
  sourceBinding: {
    title: string;
    doi: string | null;
    officialUrl: string;
    corpusIdentityVerified: false;
    scopeDisposition:
      | "pending_owner_classification"
      | "pending_owner_classification_indirect_context"
      | "pending_owner_disposition_likely_out_of_scope";
  };
  extractionEngine: {
    name: "pdftotext";
    version: string;
    argumentsTemplate: string[];
  };
  expectedPageCount: number;
  extractedPageCount: number;
  pageSequenceComplete: boolean;
  privateStorageOnly: true;
  textIncludedInTrackedArtifact: false;
  languagePolicy: {
    pageLanguageDetection: "not_computed";
    reason: "no_version_pinned_reliable_detector_configured";
  };
  promotionState: {
    aiAnalysisComplete: false;
    ownerReviewComplete: false;
    independentValidationComplete: false;
    rightsCleared: false;
    publicationReady: false;
    coveragePromotionAllowed: false;
  };
  pages: PdfPageExtractionRecord[];
};

export type PdfPageMap = PdfPageMapBody & {
  pageMapSha256: string;
};

export type WarningSummary = {
  code: PdfPageWarningCode;
  pageCount: number;
  pageNumbers: number[];
};

export type PdfQualificationReceiptBody = {
  schemaVersion: typeof PDF_PAGE_EXTRACTION_SCHEMA_VERSION;
  receiptType: "pdf_page_extraction_technical_qualification";
  pipelineVersion: typeof PDF_PAGE_EXTRACTION_PIPELINE_VERSION;
  qualificationState:
    | "technical_extraction_passed"
    | "technical_extraction_passed_with_warnings"
    | "technical_extraction_passed_identity_blocked";
  processingUnit: {
    algorithm: "sha256";
    rawPdfSha256: string;
  };
  identityKeys: string[];
  identityAssociation: PdfIdentityAssociation;
  sourceBinding: PdfPageMapBody["sourceBinding"];
  sourceFile: {
    expectedSizeBytes: number;
    observedSizeBytes: number;
    headerMagic: "%PDF-";
    encryptionState: "not_encrypted";
    pageCount: number;
    pdfVersion: string;
    primaryCopy: {
      locator: string;
      sha256: string;
      sizeBytes: number;
      fileMode: "0400";
      verified: true;
    };
    replicaCopy: {
      locator: string;
      sha256: string;
      sizeBytes: number;
      fileMode: "0400";
      verified: true;
    };
  };
  extraction: {
    pdfinfoVersion: string;
    pdftotextVersion: string;
    argumentsTemplate: string[];
    pageMapLocator: string;
    pageMapSha256: string;
    extractedPageCount: number;
    rawTextFileCount: number;
    normalizedTextFileCount: number;
    primaryPrivateOutputVerified: true;
    replicaPrivateOutputVerified: true;
  };
  totals: {
    rawSizeBytes: number;
    rawCharacterCount: number;
    normalizedSizeBytes: number;
    normalizedCharacterCount: number;
    wordCount: number;
    warningPageCount: number;
    blankPageCount: number;
    lowTextPageCount: number;
  };
  warningSummary: WarningSummary[];
  languagePolicy: {
    pageLanguageDetection: "not_computed";
    reason: "no_version_pinned_reliable_detector_configured";
  };
  semantics: {
    technicalExtractionOnly: true;
    fullTextStoredInRepository: false;
    aiAnalysisComplete: false;
    ownerReviewComplete: false;
    independentValidationComplete: false;
    rightsCleared: false;
    publicationReady: false;
    coveragePromotionAllowed: false;
  };
};

export type PdfQualificationReceipt = PdfQualificationReceiptBody & {
  receiptSha256: string;
};

const SHA256_SCHEMA = z.string().regex(/^[a-f0-9]{64}$/);
const IDENTITY_ASSOCIATION_SCHEMA = z.discriminatedUnion("state", [
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
const SOURCE_BINDING_SCHEMA = z
  .object({
    title: z.string().min(1),
    doi: z.string().min(1).nullable(),
    officialUrl: z.string().url(),
    corpusIdentityVerified: z.literal(false),
    scopeDisposition: z.enum([
      "pending_owner_classification",
      "pending_owner_classification_indirect_context",
      "pending_owner_disposition_likely_out_of_scope",
    ]),
  })
  .strict();
const LANGUAGE_SIGNAL_SCHEMA = z
  .object({
    state: z.literal("unavailable"),
    languageCode: z.null(),
    confidence: z.null(),
    method: z.literal("not_computed"),
    reason: z.literal("no_version_pinned_reliable_detector_configured"),
  })
  .strict();
const TEXT_MEASURE_SCHEMA = z
  .object({
    sha256: SHA256_SCHEMA,
    sizeBytes: z.number().int().nonnegative(),
    characterCount: z.number().int().nonnegative(),
    lineCount: z.number().int().nonnegative(),
  })
  .strict();
const WARNING_CODE_SCHEMA = z.enum([
  "blank_extracted_text",
  "low_extracted_text",
  "extractor_stderr",
  "replacement_character_present",
  "nul_character_present",
  "unexpected_control_character_present",
]);
const PAGE_RECORD_SCHEMA = z
  .object({
    pageNumber: z.number().int().positive(),
    storage: z
      .object({
        rawTextLocator: z.string().startsWith("private://"),
        normalizedTextLocator: z.string().startsWith("private://"),
      })
      .strict(),
    rawText: TEXT_MEASURE_SCHEMA,
    normalizedText: TEXT_MEASURE_SCHEMA.extend({
      wordCount: z.number().int().nonnegative(),
    }).strict(),
    extractorStderr: z
      .object({
        present: z.boolean(),
        sha256: SHA256_SCHEMA,
        sizeBytes: z.number().int().nonnegative(),
      })
      .strict(),
    languageSignal: LANGUAGE_SIGNAL_SCHEMA,
    warnings: z.array(WARNING_CODE_SCHEMA),
  })
  .strict();
const PROMOTION_STATE_SCHEMA = z
  .object({
    aiAnalysisComplete: z.literal(false),
    ownerReviewComplete: z.literal(false),
    independentValidationComplete: z.literal(false),
    rightsCleared: z.literal(false),
    publicationReady: z.literal(false),
    coveragePromotionAllowed: z.literal(false),
  })
  .strict();

export const PdfPageMapSchema = z
  .object({
    schemaVersion: z.literal(PDF_PAGE_EXTRACTION_SCHEMA_VERSION),
    artifactType: z.literal("pdf_page_extraction_map"),
    pipelineVersion: z.literal(PDF_PAGE_EXTRACTION_PIPELINE_VERSION),
    processingUnit: z
      .object({
        algorithm: z.literal("sha256"),
        rawPdfSha256: SHA256_SCHEMA,
      })
      .strict(),
    identityKeys: z.array(z.string().min(1)).min(1),
    identityAssociation: IDENTITY_ASSOCIATION_SCHEMA,
    sourceBinding: SOURCE_BINDING_SCHEMA,
    extractionEngine: z
      .object({
        name: z.literal("pdftotext"),
        version: z.string().min(1),
        argumentsTemplate: z.array(z.string()),
      })
      .strict(),
    expectedPageCount: z.number().int().positive(),
    extractedPageCount: z.number().int().positive(),
    pageSequenceComplete: z.literal(true),
    privateStorageOnly: z.literal(true),
    textIncludedInTrackedArtifact: z.literal(false),
    languagePolicy: z
      .object({
        pageLanguageDetection: z.literal("not_computed"),
        reason: z.literal("no_version_pinned_reliable_detector_configured"),
      })
      .strict(),
    promotionState: PROMOTION_STATE_SCHEMA,
    pages: z.array(PAGE_RECORD_SCHEMA).min(1),
    pageMapSha256: SHA256_SCHEMA,
  })
  .strict();

export const PdfQualificationReceiptSchema = z
  .object({
    schemaVersion: z.literal(PDF_PAGE_EXTRACTION_SCHEMA_VERSION),
    receiptType: z.literal("pdf_page_extraction_technical_qualification"),
    pipelineVersion: z.literal(PDF_PAGE_EXTRACTION_PIPELINE_VERSION),
    qualificationState: z.enum([
      "technical_extraction_passed",
      "technical_extraction_passed_with_warnings",
      "technical_extraction_passed_identity_blocked",
    ]),
    processingUnit: z
      .object({ algorithm: z.literal("sha256"), rawPdfSha256: SHA256_SCHEMA })
      .strict(),
    identityKeys: z.array(z.string().min(1)).min(1),
    identityAssociation: IDENTITY_ASSOCIATION_SCHEMA,
    sourceBinding: SOURCE_BINDING_SCHEMA,
    sourceFile: z
      .object({
        expectedSizeBytes: z.number().int().positive(),
        observedSizeBytes: z.number().int().positive(),
        headerMagic: z.literal("%PDF-"),
        encryptionState: z.literal("not_encrypted"),
        pageCount: z.number().int().positive(),
        pdfVersion: z.string().min(1),
        primaryCopy: z
          .object({
            locator: z.string().startsWith("private://"),
            sha256: SHA256_SCHEMA,
            sizeBytes: z.number().int().positive(),
            fileMode: z.literal("0400"),
            verified: z.literal(true),
          })
          .strict(),
        replicaCopy: z
          .object({
            locator: z.string().startsWith("private://"),
            sha256: SHA256_SCHEMA,
            sizeBytes: z.number().int().positive(),
            fileMode: z.literal("0400"),
            verified: z.literal(true),
          })
          .strict(),
      })
      .strict(),
    extraction: z
      .object({
        pdfinfoVersion: z.string().min(1),
        pdftotextVersion: z.string().min(1),
        argumentsTemplate: z.array(z.string()),
        pageMapLocator: z.string().min(1),
        pageMapSha256: SHA256_SCHEMA,
        extractedPageCount: z.number().int().positive(),
        rawTextFileCount: z.number().int().positive(),
        normalizedTextFileCount: z.number().int().positive(),
        primaryPrivateOutputVerified: z.literal(true),
        replicaPrivateOutputVerified: z.literal(true),
      })
      .strict(),
    totals: z
      .object({
        rawSizeBytes: z.number().int().nonnegative(),
        rawCharacterCount: z.number().int().nonnegative(),
        normalizedSizeBytes: z.number().int().nonnegative(),
        normalizedCharacterCount: z.number().int().nonnegative(),
        wordCount: z.number().int().nonnegative(),
        warningPageCount: z.number().int().nonnegative(),
        blankPageCount: z.number().int().nonnegative(),
        lowTextPageCount: z.number().int().nonnegative(),
      })
      .strict(),
    warningSummary: z.array(
      z
        .object({
          code: WARNING_CODE_SCHEMA,
          pageCount: z.number().int().positive(),
          pageNumbers: z.array(z.number().int().positive()).min(1),
        })
        .strict(),
    ),
    languagePolicy: z
      .object({
        pageLanguageDetection: z.literal("not_computed"),
        reason: z.literal("no_version_pinned_reliable_detector_configured"),
      })
      .strict(),
    semantics: z
      .object({
        technicalExtractionOnly: z.literal(true),
        fullTextStoredInRepository: z.literal(false),
        aiAnalysisComplete: z.literal(false),
        ownerReviewComplete: z.literal(false),
        independentValidationComplete: z.literal(false),
        rightsCleared: z.literal(false),
        publicationReady: z.literal(false),
        coveragePromotionAllowed: z.literal(false),
      })
      .strict(),
    receiptSha256: SHA256_SCHEMA,
  })
  .strict();

function lexicalCompare(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function normalizeJson(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(normalizeJson);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => lexicalCompare(left, right))
        .map(([key, child]) => [key, normalizeJson(child)]),
    );
  }
  return value;
}

export function canonicalJson(value: JsonValue): string {
  return JSON.stringify(normalizeJson(value));
}

export function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

export function normalizeExtractedPageText(rawText: string): string {
  const normalized = rawText
    .normalize("NFC")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[\t\v ]+/g, " ")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return normalized.length === 0 ? "" : `${normalized}\n`;
}

export function countUnicodeCharacters(text: string): number {
  return Array.from(text).length;
}

export function countLines(text: string): number {
  if (text.length === 0) return 0;
  const newlineCount = Array.from(text).filter(
    (character) => character === "\n",
  ).length;
  return text.endsWith("\n") ? newlineCount : newlineCount + 1;
}

export function countUnicodeWords(text: string): number {
  return (
    text.match(/[\p{L}\p{N}](?:[\p{L}\p{M}\p{N}'’\-]*[\p{L}\p{N}])?/gu)
      ?.length ?? 0
  );
}

export function pageWarnings(input: {
  rawText: string;
  normalizedText: string;
  wordCount: number;
  extractorStderr: Buffer;
}): PdfPageWarningCode[] {
  const warnings = new Set<PdfPageWarningCode>();
  if (input.normalizedText.length === 0) warnings.add("blank_extracted_text");
  if (
    input.wordCount > 0 &&
    input.wordCount < PDF_PAGE_LOW_TEXT_WORD_THRESHOLD
  ) {
    warnings.add("low_extracted_text");
  }
  if (input.extractorStderr.length > 0) warnings.add("extractor_stderr");
  if (input.rawText.includes("\uFFFD"))
    warnings.add("replacement_character_present");
  if (input.rawText.includes("\u0000")) warnings.add("nul_character_present");
  if (
    Array.from(input.rawText).some(
      (character) =>
        /\p{Cc}/u.test(character) && !["\t", "\n", "\r"].includes(character),
    )
  ) {
    warnings.add("unexpected_control_character_present");
  }
  return [...warnings].sort(lexicalCompare);
}

export function unavailablePageLanguageSignal(): PageLanguageSignal {
  return {
    state: "unavailable",
    languageCode: null,
    confidence: null,
    method: "not_computed",
    reason: "no_version_pinned_reliable_detector_configured",
  };
}

export function buildPageExtractionRecord(input: {
  pageNumber: number;
  rawBytes: Buffer;
  rawText: string;
  normalizedBytes: Buffer;
  normalizedText: string;
  extractorStderr: Buffer;
  rawTextLocator: string;
  normalizedTextLocator: string;
}): PdfPageExtractionRecord {
  const wordCount = countUnicodeWords(input.normalizedText);
  return {
    pageNumber: input.pageNumber,
    storage: {
      rawTextLocator: input.rawTextLocator,
      normalizedTextLocator: input.normalizedTextLocator,
    },
    rawText: {
      sha256: sha256(input.rawBytes),
      sizeBytes: input.rawBytes.length,
      characterCount: countUnicodeCharacters(input.rawText),
      lineCount: countLines(input.rawText),
    },
    normalizedText: {
      sha256: sha256(input.normalizedBytes),
      sizeBytes: input.normalizedBytes.length,
      characterCount: countUnicodeCharacters(input.normalizedText),
      lineCount: countLines(input.normalizedText),
      wordCount,
    },
    extractorStderr: {
      present: input.extractorStderr.length > 0,
      sha256: sha256(input.extractorStderr),
      sizeBytes: input.extractorStderr.length,
    },
    languageSignal: unavailablePageLanguageSignal(),
    warnings: pageWarnings({
      rawText: input.rawText,
      normalizedText: input.normalizedText,
      wordCount,
      extractorStderr: input.extractorStderr,
    }),
  };
}

export function sealPageMap(body: PdfPageMapBody): PdfPageMap {
  return {
    ...body,
    pageMapSha256: sha256(canonicalJson(body as unknown as JsonValue)),
  };
}

export function summarizeWarnings(
  pages: PdfPageExtractionRecord[],
): WarningSummary[] {
  const byCode = new Map<PdfPageWarningCode, number[]>();
  for (const page of pages) {
    for (const code of page.warnings) {
      byCode.set(code, [...(byCode.get(code) ?? []), page.pageNumber]);
    }
  }
  return [...byCode.entries()]
    .sort(([left], [right]) => lexicalCompare(left, right))
    .map(([code, pageNumbers]) => ({
      code,
      pageCount: pageNumbers.length,
      pageNumbers,
    }));
}

export function sealQualificationReceipt(
  body: PdfQualificationReceiptBody,
): PdfQualificationReceipt {
  return {
    ...body,
    receiptSha256: sha256(canonicalJson(body as unknown as JsonValue)),
  };
}

export function verifySealedPageMap(pageMap: PdfPageMap): boolean {
  const { pageMapSha256, ...body } = pageMap;
  return pageMapSha256 === sha256(canonicalJson(body as unknown as JsonValue));
}

export function verifySealedQualificationReceipt(
  receipt: PdfQualificationReceipt,
): boolean {
  const { receiptSha256, ...body } = receipt;
  return receiptSha256 === sha256(canonicalJson(body as unknown as JsonValue));
}
