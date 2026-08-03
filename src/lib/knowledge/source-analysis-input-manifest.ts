import { createHash } from "node:crypto";
import { TextDecoder } from "node:util";

import { z } from "zod";

import {
  canonicalJson,
  type PdfIdentityAssociation,
  type JsonValue,
} from "./pdf-page-extraction-qualification";

export const SOURCE_ANALYSIS_INPUT_SCHEMA_VERSION = "1.0.0" as const;
export const SOURCE_ANALYSIS_INPUT_PIPELINE_VERSION = "1.0.0" as const;

export const SOURCE_ANALYSIS_INPUT_PREAMBLE =
  "food-systems/source-analysis-normalized-input/v1\n" as const;
export const SOURCE_ANALYSIS_INPUT_PAGE_DELIMITER =
  "\n--food-systems-normalized-page-v1--\n" as const;
export const SOURCE_ANALYSIS_INPUT_TRAILER_DELIMITER =
  "\n--food-systems-normalized-input-end-v1--\n" as const;

export const SOURCE_ANALYSIS_INPUT_SERIALIZATION = {
  id: "normalized-page-bytes-framed-v1",
  charset: "utf-8",
  pageOrder: "ascending_page_number",
  pageSequence: "contiguous_from_1",
  preambleUtf8: SOURCE_ANALYSIS_INPUT_PREAMBLE,
  pageDelimiterUtf8: SOURCE_ANALYSIS_INPUT_PAGE_DELIMITER,
  pageHeaderEncoding: "canonical_json_utf8",
  pageHeaderFields: ["normalizedSha256", "pageNumber", "sizeBytes"],
  pageHeaderTerminatorHex: "0a",
  pagePayload: "exact_normalized_utf8_file_bytes",
  pagePayloadBoundary: "sizeBytes_from_page_header",
  trailerDelimiterUtf8: SOURCE_ANALYSIS_INPUT_TRAILER_DELIMITER,
  trailerEncoding: "canonical_json_utf8",
  trailerFields: ["pageCount"],
  trailerTerminatorHex: "0a",
} as const;

export const SOURCE_ANALYSIS_INPUT_READINESS = {
  aiAnalysisComplete: false,
  ownerReviewComplete: false,
  independentExpertReviewComplete: false,
  partnerReviewComplete: false,
  rightsHolderReviewComplete: false,
  rightsCleared: false,
  publicationReady: false,
  coveragePromotionAllowed: false,
} as const;

export const NORMALIZED_PAGE_RELATIVE_PATH_TEMPLATE =
  "pdf-page-extraction/v1/sha256/{rawPdfSha256}/pages/page-{pageNumber:0000}.normalized.txt" as const;
export const RAW_PDF_RELATIVE_PATH_TEMPLATE =
  "sha256/{rawPdfSha256}.pdf" as const;

export const SOURCE_ANALYSIS_INPUT_PRIVATE_STORAGE = {
  normalizedPageRelativePathTemplate: NORMALIZED_PAGE_RELATIVE_PATH_TEMPLATE,
  rawPdfRelativePathTemplate: RAW_PDF_RELATIVE_PATH_TEMPLATE,
  expectedFileMode: "0400",
  copies: [
    {
      copyId: "primary",
      rootEnvironmentVariable: "FOOD_SYSTEMS_PRIVATE_CORPUS_ROOT",
      rawPdfLocatorTemplate: "private://corpus/sha256/{rawPdfSha256}.pdf",
      normalizedPageLocatorTemplate:
        "private://corpus/pdf-page-extraction/v1/sha256/{rawPdfSha256}/pages/page-{pageNumber:0000}.normalized.txt",
    },
    {
      copyId: "replica",
      rootEnvironmentVariable: "FOOD_SYSTEMS_PRIVATE_CORPUS_REPLICA_ROOT",
      rawPdfLocatorTemplate:
        "private://bigbrain-corpus/sha256/{rawPdfSha256}.pdf",
      normalizedPageLocatorTemplate:
        "private://bigbrain-corpus/pdf-page-extraction/v1/sha256/{rawPdfSha256}/pages/page-{pageNumber:0000}.normalized.txt",
    },
  ],
} as const;

const SHA256_SCHEMA = z.string().regex(/^[a-f0-9]{64}$/);
const PREFIXED_SHA256_SCHEMA = z.string().regex(/^sha256:[a-f0-9]{64}$/);
const IDENTIFIER_SCHEMA = z.string().regex(/^[a-z0-9][a-z0-9._:-]*$/);
const VERSION_SCHEMA = z.string().regex(/^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/);
const DATE_TIME_SCHEMA = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/)
  .refine((value) => Number.isFinite(Date.parse(value)), {
    message: "Expected an ISO 8601 date-time with an explicit UTC offset",
  });
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;

export function isPortableRepositoryRelativePath(value: string): boolean {
  if (
    value.length === 0 ||
    value.trim() !== value ||
    value.startsWith("/") ||
    value.includes("~") ||
    value.includes(":") ||
    value.includes("\\") ||
    CONTROL_CHARACTER_PATTERN.test(value)
  ) {
    return false;
  }
  const segments = value.split("/");
  return segments.every(
    (segment) => segment.length > 0 && segment !== "." && segment !== "..",
  );
}

export const SourceAnalysisInputRepositoryPathSchema = z
  .string()
  .min(1)
  .refine(isPortableRepositoryRelativePath, {
    message: "Expected a portable repository-relative path",
  });

const PATH_SCHEMA = SourceAnalysisInputRepositoryPathSchema;

export const SourceAnalysisInputIdentityAssociationSchema =
  z.discriminatedUnion("state", [
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
    z
      .object({
        state: z.literal("verified_identity_match"),
        intendedLabel: z.string().min(1),
        observedDocumentTitle: z.string().min(1),
        sourceId: IDENTIFIER_SCHEMA,
        canonicalIdentity: z.string().min(1).max(2_000),
        blockerCode: z.null(),
      })
      .strict(),
  ]);

const sourceBindingCore = {
  title: z.string().min(1),
  doi: z.string().min(1).nullable(),
  officialUrl: z.string().url(),
};
const scopeDispositionSchema = z.enum([
  "pending_owner_classification",
  "pending_owner_classification_indirect_context",
  "pending_owner_disposition_likely_out_of_scope",
]);

export const SourceAnalysisInputSourceBindingSchema = z.discriminatedUnion(
  "corpusIdentityVerified",
  [
    z
      .object({
        ...sourceBindingCore,
        corpusIdentityVerified: z.literal(false),
        scopeDisposition: scopeDispositionSchema,
      })
      .strict(),
    z
      .object({
        ...sourceBindingCore,
        corpusIdentityVerified: z.literal(true),
        scopeDisposition: scopeDispositionSchema,
      })
      .strict(),
  ],
);

const verifiedIdentityArtifactReferenceSchema = z
  .object({
    artifactId: IDENTIFIER_SCHEMA,
    artifactVersion: VERSION_SCHEMA,
    path: PATH_SCHEMA,
    fileSha256: SHA256_SCHEMA,
    artifactSha256: PREFIXED_SHA256_SCHEMA,
    decision: z.literal("verified"),
  })
  .strict();

const lifecyclePrestateReferenceSchema = z
  .object({
    lifecycleRecordId: IDENTIFIER_SCHEMA,
    lifecycleSnapshotSha256: PREFIXED_SHA256_SCHEMA,
    lifecycleSnapshotUpdatedAt: DATE_TIME_SCHEMA,
  })
  .strict();

export const SourceAnalysisInputWorkflowEligibilitySchema =
  z.discriminatedUnion("state", [
    z
      .object({
        state: z.literal("identity_verification_candidate"),
        identityVerification: z
          .object({ allowed: z.literal(true), blockerCode: z.null() })
          .strict(),
        sourceAnalysis: z
          .object({
            allowed: z.literal(false),
            blockerCode: z.literal("verified_identity_required"),
          })
          .strict(),
      })
      .strict(),
    z
      .object({
        state: z.literal("blocked_identity_association"),
        identityVerification: z
          .object({
            allowed: z.literal(false),
            blockerCode: z.enum([
              "legacy_alias_scope_mismatch",
              "database_registration_required",
            ]),
          })
          .strict(),
        sourceAnalysis: z
          .object({
            allowed: z.literal(false),
            blockerCode: z.literal("identity_association_blocked"),
          })
          .strict(),
      })
      .strict(),
    z
      .object({
        state: z.literal("source_analysis_eligible"),
        identityVerification: z
          .object({ allowed: z.literal(true), blockerCode: z.null() })
          .strict(),
        sourceAnalysis: z
          .object({
            allowed: z.literal(true),
            blockerCode: z.null(),
            combinedValidationRequired: z.literal(true),
            identityArtifactReference: verifiedIdentityArtifactReferenceSchema,
            lifecyclePrestate: lifecyclePrestateReferenceSchema,
          })
          .strict(),
      })
      .strict(),
  ]);

export type SourceAnalysisInputWorkflowEligibility = z.infer<
  typeof SourceAnalysisInputWorkflowEligibilitySchema
>;

export function sourceAnalysisInputWorkflowEligibility(
  identityAssociation: PdfIdentityAssociation,
): SourceAnalysisInputWorkflowEligibility {
  if (identityAssociation.state === "provisional_metadata_match") {
    return {
      state: "identity_verification_candidate",
      identityVerification: { allowed: true, blockerCode: null },
      sourceAnalysis: {
        allowed: false,
        blockerCode: "verified_identity_required",
      },
    };
  }
  const blockerCode =
    identityAssociation.state === "unregistered_source_candidate"
      ? "database_registration_required"
      : "legacy_alias_scope_mismatch";
  return {
    state: "blocked_identity_association",
    identityVerification: {
      allowed: false,
      blockerCode,
    },
    sourceAnalysis: {
      allowed: false,
      blockerCode: "identity_association_blocked",
    },
  };
}

export function sourceAnalysisEligibleWorkflowEligibility(input: {
  identityArtifactReference: z.infer<
    typeof verifiedIdentityArtifactReferenceSchema
  >;
  lifecyclePrestate: z.infer<typeof lifecyclePrestateReferenceSchema>;
}): Extract<
  SourceAnalysisInputWorkflowEligibility,
  { state: "source_analysis_eligible" }
> {
  return {
    state: "source_analysis_eligible",
    identityVerification: { allowed: true, blockerCode: null },
    sourceAnalysis: {
      allowed: true,
      blockerCode: null,
      combinedValidationRequired: true,
      identityArtifactReference: input.identityArtifactReference,
      lifecyclePrestate: input.lifecyclePrestate,
    },
  };
}

export const SourceAnalysisInputReadinessSchema = z
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
  .strict();

export const SourceAnalysisInputSerializationSchema = z
  .object({
    id: z.literal(SOURCE_ANALYSIS_INPUT_SERIALIZATION.id),
    charset: z.literal(SOURCE_ANALYSIS_INPUT_SERIALIZATION.charset),
    pageOrder: z.literal(SOURCE_ANALYSIS_INPUT_SERIALIZATION.pageOrder),
    pageSequence: z.literal(SOURCE_ANALYSIS_INPUT_SERIALIZATION.pageSequence),
    preambleUtf8: z.literal(SOURCE_ANALYSIS_INPUT_SERIALIZATION.preambleUtf8),
    pageDelimiterUtf8: z.literal(
      SOURCE_ANALYSIS_INPUT_SERIALIZATION.pageDelimiterUtf8,
    ),
    pageHeaderEncoding: z.literal(
      SOURCE_ANALYSIS_INPUT_SERIALIZATION.pageHeaderEncoding,
    ),
    pageHeaderFields: z.tuple([
      z.literal("normalizedSha256"),
      z.literal("pageNumber"),
      z.literal("sizeBytes"),
    ]),
    pageHeaderTerminatorHex: z.literal("0a"),
    pagePayload: z.literal(SOURCE_ANALYSIS_INPUT_SERIALIZATION.pagePayload),
    pagePayloadBoundary: z.literal(
      SOURCE_ANALYSIS_INPUT_SERIALIZATION.pagePayloadBoundary,
    ),
    trailerDelimiterUtf8: z.literal(
      SOURCE_ANALYSIS_INPUT_SERIALIZATION.trailerDelimiterUtf8,
    ),
    trailerEncoding: z.literal(
      SOURCE_ANALYSIS_INPUT_SERIALIZATION.trailerEncoding,
    ),
    trailerFields: z.tuple([z.literal("pageCount")]),
    trailerTerminatorHex: z.literal("0a"),
  })
  .strict();

export const SourceAnalysisInputPageSchema = z
  .object({
    pageNumber: z.number().int().positive(),
    normalizedText: z
      .object({
        sha256: SHA256_SCHEMA,
        sizeBytes: z.number().int().nonnegative(),
        characterCount: z.number().int().nonnegative(),
        wordCount: z.number().int().nonnegative(),
      })
      .strict(),
  })
  .strict();

const PRIVATE_STORAGE_SCHEMA = z
  .object({
    normalizedPageRelativePathTemplate: z.literal(
      NORMALIZED_PAGE_RELATIVE_PATH_TEMPLATE,
    ),
    rawPdfRelativePathTemplate: z.literal(RAW_PDF_RELATIVE_PATH_TEMPLATE),
    expectedFileMode: z.literal("0400"),
    copies: z.tuple([
      z
        .object({
          copyId: z.literal("primary"),
          rootEnvironmentVariable: z.literal(
            "FOOD_SYSTEMS_PRIVATE_CORPUS_ROOT",
          ),
          rawPdfLocatorTemplate: z.literal(
            SOURCE_ANALYSIS_INPUT_PRIVATE_STORAGE.copies[0]
              .rawPdfLocatorTemplate,
          ),
          normalizedPageLocatorTemplate: z.literal(
            SOURCE_ANALYSIS_INPUT_PRIVATE_STORAGE.copies[0]
              .normalizedPageLocatorTemplate,
          ),
        })
        .strict(),
      z
        .object({
          copyId: z.literal("replica"),
          rootEnvironmentVariable: z.literal(
            "FOOD_SYSTEMS_PRIVATE_CORPUS_REPLICA_ROOT",
          ),
          rawPdfLocatorTemplate: z.literal(
            SOURCE_ANALYSIS_INPUT_PRIVATE_STORAGE.copies[1]
              .rawPdfLocatorTemplate,
          ),
          normalizedPageLocatorTemplate: z.literal(
            SOURCE_ANALYSIS_INPUT_PRIVATE_STORAGE.copies[1]
              .normalizedPageLocatorTemplate,
          ),
        })
        .strict(),
    ]),
  })
  .strict();

export const SourceAnalysisInputManifestSchema = z
  .object({
    schemaVersion: z.literal(SOURCE_ANALYSIS_INPUT_SCHEMA_VERSION),
    artifactType: z.literal("source_analysis_input_manifest"),
    pipelineVersion: z.literal(SOURCE_ANALYSIS_INPUT_PIPELINE_VERSION),
    processingUnit: z
      .object({
        algorithm: z.literal("sha256"),
        rawPdfSha256: SHA256_SCHEMA,
      })
      .strict(),
    identityKeys: z.array(z.string().min(1)).min(1),
    identityAssociation: SourceAnalysisInputIdentityAssociationSchema,
    sourceBinding: SourceAnalysisInputSourceBindingSchema,
    workflowEligibility: SourceAnalysisInputWorkflowEligibilitySchema,
    bindings: z
      .object({
        pageMap: z
          .object({
            path: PATH_SCHEMA,
            fileSha256: SHA256_SCHEMA,
            pageMapSha256: SHA256_SCHEMA,
          })
          .strict(),
        extractionReceipt: z
          .object({
            path: PATH_SCHEMA,
            fileSha256: SHA256_SCHEMA,
            receiptSha256: SHA256_SCHEMA,
          })
          .strict(),
      })
      .strict(),
    serialization: SourceAnalysisInputSerializationSchema,
    normalizedInput: z
      .object({
        algorithm: z.literal("sha256"),
        sha256: SHA256_SCHEMA,
        serializedSizeBytes: z.number().int().positive(),
      })
      .strict(),
    pages: z.array(SourceAnalysisInputPageSchema).min(1),
    totals: z
      .object({
        pageCount: z.number().int().positive(),
        normalizedSizeBytes: z.number().int().nonnegative(),
        normalizedCharacterCount: z.number().int().nonnegative(),
        wordCount: z.number().int().nonnegative(),
      })
      .strict(),
    privateStorage: PRIVATE_STORAGE_SCHEMA,
    textIncludedInTrackedArtifact: z.literal(false),
    readiness: SourceAnalysisInputReadinessSchema,
    manifestSha256: SHA256_SCHEMA,
  })
  .strict();

export type SourceAnalysisInputPage = z.infer<
  typeof SourceAnalysisInputPageSchema
>;
export type SourceAnalysisInputManifest = z.infer<
  typeof SourceAnalysisInputManifestSchema
>;
export type SourceAnalysisInputManifestBody = Omit<
  SourceAnalysisInputManifest,
  "manifestSha256"
>;

export type SerializedNormalizedInput = {
  sha256: string;
  serializedSizeBytes: number;
};

type NormalizedInputMaterial = {
  pages: SourceAnalysisInputPage[];
  normalizedPageBytes: Buffer[];
};

function pageHeader(page: SourceAnalysisInputPage): Buffer {
  return Buffer.from(
    `${canonicalJson({
      normalizedSha256: page.normalizedText.sha256,
      pageNumber: page.pageNumber,
      sizeBytes: page.normalizedText.sizeBytes,
    })}\n`,
    "utf8",
  );
}

function trailer(pageCount: number): Buffer {
  return Buffer.from(`${canonicalJson({ pageCount })}\n`, "utf8");
}

export function canonicalNormalizedInputBytes(
  input: NormalizedInputMaterial,
): Buffer {
  if (
    input.pages.length === 0 ||
    input.pages.length !== input.normalizedPageBytes.length
  ) {
    throw new Error(
      "Normalized input pages and byte payloads must be non-empty and have equal length",
    );
  }
  const chunks: Buffer[] = [
    Buffer.from(SOURCE_ANALYSIS_INPUT_PREAMBLE, "utf8"),
  ];
  for (const [index, page] of input.pages.entries()) {
    if (page.pageNumber !== index + 1) {
      throw new Error(
        `Normalized input page sequence is not contiguous at page ${index + 1}`,
      );
    }
    const bytes = input.normalizedPageBytes[index];
    if (!bytes)
      throw new Error(
        `Normalized input bytes are missing for page ${page.pageNumber}`,
      );
    if (bytes.length !== page.normalizedText.sizeBytes) {
      throw new Error(
        `Normalized input byte count differs for page ${page.pageNumber}`,
      );
    }
    const observedSha256 = createHash("sha256").update(bytes).digest("hex");
    if (observedSha256 !== page.normalizedText.sha256) {
      throw new Error(
        `Normalized input SHA-256 differs for page ${page.pageNumber}`,
      );
    }
    try {
      new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      throw new Error(
        `Normalized input bytes are not valid UTF-8 for page ${page.pageNumber}`,
      );
    }
    chunks.push(
      Buffer.from(SOURCE_ANALYSIS_INPUT_PAGE_DELIMITER, "utf8"),
      pageHeader(page),
      bytes,
    );
  }
  chunks.push(
    Buffer.from(SOURCE_ANALYSIS_INPUT_TRAILER_DELIMITER, "utf8"),
    trailer(input.pages.length),
  );
  return Buffer.concat(chunks);
}

export function serializeNormalizedInput(
  input: NormalizedInputMaterial,
): SerializedNormalizedInput {
  const bytes = canonicalNormalizedInputBytes(input);
  return {
    sha256: createHash("sha256").update(bytes).digest("hex"),
    serializedSizeBytes: bytes.length,
  };
}

export function serializedNormalizedInputSize(
  pages: SourceAnalysisInputPage[],
): number {
  if (pages.length === 0)
    throw new Error("Normalized input must contain at least one page");
  let size = Buffer.byteLength(SOURCE_ANALYSIS_INPUT_PREAMBLE);
  for (const [index, page] of pages.entries()) {
    if (page.pageNumber !== index + 1) {
      throw new Error(
        `Normalized input page sequence is not contiguous at page ${index + 1}`,
      );
    }
    size += Buffer.byteLength(SOURCE_ANALYSIS_INPUT_PAGE_DELIMITER);
    size += pageHeader(page).length;
    size += page.normalizedText.sizeBytes;
  }
  size += Buffer.byteLength(SOURCE_ANALYSIS_INPUT_TRAILER_DELIMITER);
  size += trailer(pages.length).length;
  return size;
}

export function sourceAnalysisInputTotals(
  pages: SourceAnalysisInputPage[],
): SourceAnalysisInputManifest["totals"] {
  return {
    pageCount: pages.length,
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
  };
}

export function sealSourceAnalysisInputManifest(
  body: SourceAnalysisInputManifestBody,
): SourceAnalysisInputManifest {
  return {
    ...body,
    manifestSha256: createHash("sha256")
      .update(canonicalJson(body as unknown as JsonValue))
      .digest("hex"),
  };
}

export function verifySourceAnalysisInputManifest(
  value: unknown,
): SourceAnalysisInputManifest {
  const parsed = SourceAnalysisInputManifestSchema.safeParse(value);
  if (!parsed.success)
    throw new Error("Source-analysis input manifest schema validation failed");
  const manifest = parsed.data;
  const { manifestSha256, ...body } = manifest;
  const expectedSeal = createHash("sha256")
    .update(canonicalJson(body as unknown as JsonValue))
    .digest("hex");
  if (manifestSha256 !== expectedSeal) {
    throw new Error("Source-analysis input manifest self-hash mismatch");
  }
  const pageNumbers = manifest.pages.map((page) => page.pageNumber);
  if (pageNumbers.some((pageNumber, index) => pageNumber !== index + 1)) {
    throw new Error(
      "Source-analysis input manifest page sequence is not contiguous",
    );
  }
  const expectedTotals = sourceAnalysisInputTotals(manifest.pages);
  if (canonicalJson(manifest.totals) !== canonicalJson(expectedTotals)) {
    throw new Error("Source-analysis input manifest totals mismatch");
  }
  if (
    manifest.normalizedInput.serializedSizeBytes !==
    serializedNormalizedInputSize(manifest.pages)
  ) {
    throw new Error(
      "Source-analysis input manifest serialized byte count mismatch",
    );
  }
  if (manifest.identityAssociation.state === "verified_identity_match") {
    if (
      manifest.sourceBinding.corpusIdentityVerified !== true ||
      manifest.workflowEligibility.state !== "source_analysis_eligible" ||
      manifest.workflowEligibility.sourceAnalysis.allowed !== true ||
      manifest.workflowEligibility.sourceAnalysis.combinedValidationRequired !==
        true
    ) {
      throw new Error(
        "Verified source-analysis eligibility requires the exact positive association, source and combined-validation state",
      );
    }
  } else {
    if (manifest.sourceBinding.corpusIdentityVerified !== false) {
      throw new Error(
        "Unverified source-analysis input cannot claim a verified corpus identity",
      );
    }
    const expectedWorkflowEligibility = sourceAnalysisInputWorkflowEligibility(
      manifest.identityAssociation,
    );
    if (
      canonicalJson(manifest.workflowEligibility) !==
      canonicalJson(expectedWorkflowEligibility)
    ) {
      throw new Error(
        "Source-analysis input manifest workflow eligibility mismatch",
      );
    }
  }
  return manifest;
}
