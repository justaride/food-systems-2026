import { readFileSync } from "node:fs";

import { prepareVerifiedSourceIdentityArtifact } from "../../scripts/knowledge/seal-source-identity-verification-artifact";

import {
  buildInitialCorpusLifecycle,
  hashCorpusLifecycleState,
  validateCorpusLifecycle,
  type CorpusLifecycleRecord,
} from "../../src/lib/knowledge/corpus-processing-lifecycle";
import {
  PDF_PAGE_EXTRACTION_PIPELINE_VERSION,
  PDF_PAGE_EXTRACTION_SCHEMA_VERSION,
  buildPageExtractionRecord,
  sealPageMap,
  sealQualificationReceipt,
  summarizeWarnings,
  type PdfPageMap,
  type PdfPageMapBody,
  type PdfQualificationReceipt,
  type PdfQualificationReceiptBody,
} from "../../src/lib/knowledge/pdf-page-extraction-qualification";
import {
  SOURCE_ACQUISITION_RECEIPT_SCHEMA_VERSION,
  SOURCE_ACQUISITION_RECEIPT_VERSION,
  sealSourceAcquisitionReceipt,
  type ControlledHttpsFetchReceipt,
} from "../../src/lib/knowledge/source-acquisition-receipt";
import {
  SOURCE_ANALYSIS_INPUT_PIPELINE_VERSION,
  SOURCE_ANALYSIS_INPUT_PRIVATE_STORAGE,
  SOURCE_ANALYSIS_INPUT_READINESS,
  SOURCE_ANALYSIS_INPUT_SCHEMA_VERSION,
  SOURCE_ANALYSIS_INPUT_SERIALIZATION,
  sealSourceAnalysisInputManifest,
  serializeNormalizedInput,
  sourceAnalysisInputTotals,
  sourceAnalysisInputWorkflowEligibility,
  type SourceAnalysisInputManifest,
  type SourceAnalysisInputManifestBody,
} from "../../src/lib/knowledge/source-analysis-input-manifest";
import {
  MODEL_VERSION_NOT_EXPOSED,
  SOURCE_IDENTITY_PROMPT_TEMPLATE_PATH,
  SOURCE_IDENTITY_VERIFICATION_ARTIFACT_VERSION,
  SOURCE_IDENTITY_VERIFICATION_SCHEMA_VERSION,
  SOURCE_IDENTITY_WORKFLOW_ID,
  SOURCE_IDENTITY_WORKFLOW_PATH,
  SOURCE_IDENTITY_WORKFLOW_VERSION,
  hashSourceIdentityVerificationInputEnvelope,
  hashSourceIdentityVerificationPayload,
  sourceIdentityExtractionReceiptId,
  sourceIdentityPageMapId,
  sourceIdentitySha256,
  sourceIdentityVerificationInputEnvelope,
  type SourceIdentityArtifactFile,
  type SourceIdentityVerificationArtifact,
  type SourceIdentityVerificationEvidenceBundle,
} from "../../src/lib/knowledge/source-identity-verification";

export const SOURCE_IDENTITY_FULL_EVIDENCE_SOURCE_ID =
  "source.example.report" as const;
export const SOURCE_IDENTITY_FULL_EVIDENCE_CANONICAL_IDENTITY =
  "document:cmpp-example-report" as const;
export const SOURCE_IDENTITY_FULL_EVIDENCE_TITLE =
  "Example authority report 2024" as const;
export const SOURCE_IDENTITY_FULL_EVIDENCE_OFFICIAL_URL =
  "https://authority.example/reports/example-2024.pdf" as const;
export const SOURCE_IDENTITY_FULL_EVIDENCE_RECORD_ID =
  "corpus.record.example" as const;
export const SOURCE_IDENTITY_FULL_EVIDENCE_ACQUISITION_PATH =
  "knowledge/corpus/source-acquisition-receipts/receipts/example-report.https.v1.json" as const;

const RAW_PDF_BYTES = Buffer.from(
  "%PDF-source-identity-full-evidence-fixture",
  "utf8",
);
const RAW_PDF_SHA256 = sourceIdentitySha256(RAW_PDF_BYTES);
const RAW_PDF_SHA256_UNPREFIXED = RAW_PDF_SHA256.replace(/^sha256:/, "");
const EXTRACTION_RECEIPT_PATH = `knowledge/corpus/pdf-page-extraction/receipts/${RAW_PDF_SHA256_UNPREFIXED}.receipt.v1.json`;
const PAGE_MAP_PATH = `knowledge/corpus/pdf-page-extraction/page-maps/${RAW_PDF_SHA256_UNPREFIXED}.page-map.v1.json`;
const CANDIDATE_INPUT_MANIFEST_PATH = `knowledge/corpus/source-analysis-input-manifests/manifests/${RAW_PDF_SHA256_UNPREFIXED}.source-analysis-input-manifest.v1.json`;
const INITIAL_OBSERVED_AT = "2026-08-03T08:00:00Z";
const TECHNICAL_TEXT_APPLIED_AT = "2026-08-03T08:03:00Z";

function prettyBytes(value: unknown): Buffer {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function deterministicHash(label: string): string {
  return sourceIdentitySha256(`source-identity-full-evidence:${label}`);
}

export type SourceIdentityFullEvidenceFixtureOptions = {
  identityKeys?: string[];
  observedTitle?: string;
};

export type SourceIdentityFullEvidenceFixture = {
  sourceId: typeof SOURCE_IDENTITY_FULL_EVIDENCE_SOURCE_ID;
  canonicalIdentity: string;
  identityKeys: string[];
  rawPdfSha256: string;
  rawPdfSha256Unprefixed: string;
  rawPdfBytes: Buffer;
  normalizedPageBytes: Buffer[];
  acquisitionReceipt: ControlledHttpsFetchReceipt;
  acquisitionReceiptPath: string;
  acquisitionReceiptBytes: Buffer;
  extractionReceipt: PdfQualificationReceipt;
  extractionReceiptPath: string;
  extractionReceiptBytes: Buffer;
  pageMap: PdfPageMap;
  pageMapPath: string;
  pageMapBytes: Buffer;
  candidateInputManifest: SourceAnalysisInputManifest;
  candidateInputManifestPath: string;
  candidateInputManifestBytes: Buffer;
  workflowFile: SourceIdentityArtifactFile;
  promptTemplateFile: SourceIdentityArtifactFile;
  lifecycleL1: CorpusLifecycleRecord;
  lifecycleL1Sha256: string;
  identity: SourceIdentityVerificationArtifact;
  identityArtifactPath: string;
  identityArtifactBytes: Buffer;
  bundle: SourceIdentityVerificationEvidenceBundle;
};

function acquisitionReceipt(): ControlledHttpsFetchReceipt {
  return sealSourceAcquisitionReceipt({
    schemaVersion: SOURCE_ACQUISITION_RECEIPT_SCHEMA_VERSION,
    artifactType: "source_acquisition_receipt",
    receiptId: "receipt.source.acquisition.example.https",
    receiptVersion: SOURCE_ACQUISITION_RECEIPT_VERSION,
    sourceId: SOURCE_IDENTITY_FULL_EVIDENCE_SOURCE_ID,
    acquisitionType: "controlled_https_fetch",
    requestedLocator: SOURCE_IDENTITY_FULL_EVIDENCE_OFFICIAL_URL,
    finalLocator: SOURCE_IDENTITY_FULL_EVIDENCE_OFFICIAL_URL,
    request: {
      method: "GET",
      redirectMode: "manual",
      credentialsMode: "omit",
      maximumRedirects: 5,
    },
    redirectChain: [],
    response: {
      status: 200,
      contentType: "application/pdf",
      contentLengthBytes: RAW_PDF_BYTES.length,
      bodySizeBytes: RAW_PDF_BYTES.length,
      bodySha256: RAW_PDF_SHA256,
      observedAt: "2026-08-03T08:02:00Z",
    },
    tool: {
      name: "controlled-source-fetch",
      version: "1.0.0",
      workflowRef: "workflow.source.acquisition.https",
      workflowVersion: "1.0.0",
    },
    startedAt: "2026-08-03T08:01:00Z",
    completedAt: TECHNICAL_TEXT_APPLIED_AT,
  }) as ControlledHttpsFetchReceipt;
}

function exactDimension(
  dimension: SourceIdentityVerificationArtifact["matchDimensions"][number]["dimension"],
  value: string,
  evidenceAnchorIds: string[],
): SourceIdentityVerificationArtifact["matchDimensions"][number] {
  return {
    dimension,
    expectedValue: value,
    observedValue: value,
    matchState: "exact_match",
    normalizationStatement: null,
    discrepancyIds: [],
    evidenceAnchorIds,
  };
}

export function sourceIdentityFullEvidenceFixture(
  options: SourceIdentityFullEvidenceFixtureOptions = {},
): SourceIdentityFullEvidenceFixture {
  const identityKeys = [
    ...(options.identityKeys ?? [
      SOURCE_IDENTITY_FULL_EVIDENCE_CANONICAL_IDENTITY,
    ]),
  ];
  if (identityKeys.length === 0) {
    throw new Error("Full-evidence fixture requires at least one identity key");
  }
  const canonicalIdentity = identityKeys[0]!;
  const observedTitle =
    options.observedTitle ?? SOURCE_IDENTITY_FULL_EVIDENCE_TITLE;
  const identityAssociation = {
    state: "provisional_metadata_match" as const,
    intendedLabel: SOURCE_IDENTITY_FULL_EVIDENCE_TITLE,
    observedDocumentTitle: observedTitle,
    blockerCode: null,
  };
  const sourceBinding = {
    title: SOURCE_IDENTITY_FULL_EVIDENCE_TITLE,
    doi: null,
    officialUrl: SOURCE_IDENTITY_FULL_EVIDENCE_OFFICIAL_URL,
    corpusIdentityVerified: false as const,
    scopeDisposition: "pending_owner_classification" as const,
  };
  const normalizedText = `${observedTitle}. Example Food Authority. Published 15 March 2025 in English.\n`;
  const normalizedBytes = Buffer.from(normalizedText, "utf8");
  const page = buildPageExtractionRecord({
    pageNumber: 1,
    rawBytes: normalizedBytes,
    rawText: normalizedText,
    normalizedBytes,
    normalizedText,
    extractorStderr: Buffer.alloc(0),
    rawTextLocator: `private://corpus/pdf-page-extraction/v1/sha256/${RAW_PDF_SHA256_UNPREFIXED}/pages/page-0001.raw.txt`,
    normalizedTextLocator: `private://corpus/pdf-page-extraction/v1/sha256/${RAW_PDF_SHA256_UNPREFIXED}/pages/page-0001.normalized.txt`,
  });
  const pageMapBody: PdfPageMapBody = {
    schemaVersion: PDF_PAGE_EXTRACTION_SCHEMA_VERSION,
    artifactType: "pdf_page_extraction_map",
    pipelineVersion: PDF_PAGE_EXTRACTION_PIPELINE_VERSION,
    processingUnit: {
      algorithm: "sha256",
      rawPdfSha256: RAW_PDF_SHA256_UNPREFIXED,
    },
    identityKeys,
    identityAssociation,
    sourceBinding,
    extractionEngine: {
      name: "pdftotext",
      version: "fixture-1.0.0",
      argumentsTemplate: ["-f", "{page}", "-l", "{page}"],
    },
    expectedPageCount: 1,
    extractedPageCount: 1,
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
    pages: [page],
  };
  const pageMap = sealPageMap(pageMapBody);
  const pageMapBytes = prettyBytes(pageMap);
  const warningSummary = summarizeWarnings([page]);
  const extractionReceiptBody: PdfQualificationReceiptBody = {
    schemaVersion: PDF_PAGE_EXTRACTION_SCHEMA_VERSION,
    receiptType: "pdf_page_extraction_technical_qualification",
    pipelineVersion: PDF_PAGE_EXTRACTION_PIPELINE_VERSION,
    qualificationState:
      page.warnings.length === 0
        ? "technical_extraction_passed"
        : "technical_extraction_passed_with_warnings",
    processingUnit: {
      algorithm: "sha256",
      rawPdfSha256: RAW_PDF_SHA256_UNPREFIXED,
    },
    identityKeys,
    identityAssociation,
    sourceBinding,
    sourceFile: {
      expectedSizeBytes: RAW_PDF_BYTES.length,
      observedSizeBytes: RAW_PDF_BYTES.length,
      headerMagic: "%PDF-",
      encryptionState: "not_encrypted",
      pageCount: 1,
      pdfVersion: "1.7",
      primaryCopy: {
        locator: `private://corpus/sha256/${RAW_PDF_SHA256_UNPREFIXED}.pdf`,
        sha256: RAW_PDF_SHA256_UNPREFIXED,
        sizeBytes: RAW_PDF_BYTES.length,
        fileMode: "0400",
        verified: true,
      },
      replicaCopy: {
        locator: `private://bigbrain-corpus/sha256/${RAW_PDF_SHA256_UNPREFIXED}.pdf`,
        sha256: RAW_PDF_SHA256_UNPREFIXED,
        sizeBytes: RAW_PDF_BYTES.length,
        fileMode: "0400",
        verified: true,
      },
    },
    extraction: {
      pdfinfoVersion: "fixture-1.0.0",
      pdftotextVersion: "fixture-1.0.0",
      argumentsTemplate: ["-f", "{page}", "-l", "{page}"],
      pageMapLocator: PAGE_MAP_PATH,
      pageMapSha256: pageMap.pageMapSha256,
      extractedPageCount: 1,
      rawTextFileCount: 1,
      normalizedTextFileCount: 1,
      primaryPrivateOutputVerified: true,
      replicaPrivateOutputVerified: true,
    },
    totals: {
      rawSizeBytes: page.rawText.sizeBytes,
      rawCharacterCount: page.rawText.characterCount,
      normalizedSizeBytes: page.normalizedText.sizeBytes,
      normalizedCharacterCount: page.normalizedText.characterCount,
      wordCount: page.normalizedText.wordCount,
      warningPageCount: page.warnings.length > 0 ? 1 : 0,
      blankPageCount: page.warnings.includes("blank_extracted_text") ? 1 : 0,
      lowTextPageCount: page.warnings.includes("low_extracted_text") ? 1 : 0,
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
  };
  const extractionReceipt = sealQualificationReceipt(extractionReceiptBody);
  const extractionReceiptBytes = prettyBytes(extractionReceipt);
  const manifestPages = [
    {
      pageNumber: 1,
      normalizedText: {
        sha256: page.normalizedText.sha256,
        sizeBytes: page.normalizedText.sizeBytes,
        characterCount: page.normalizedText.characterCount,
        wordCount: page.normalizedText.wordCount,
      },
    },
  ];
  const normalizedInput = serializeNormalizedInput({
    pages: manifestPages,
    normalizedPageBytes: [normalizedBytes],
  });
  const candidateManifestBody: SourceAnalysisInputManifestBody = {
    schemaVersion: SOURCE_ANALYSIS_INPUT_SCHEMA_VERSION,
    artifactType: "source_analysis_input_manifest",
    pipelineVersion: SOURCE_ANALYSIS_INPUT_PIPELINE_VERSION,
    processingUnit: {
      algorithm: "sha256",
      rawPdfSha256: RAW_PDF_SHA256_UNPREFIXED,
    },
    identityKeys,
    identityAssociation,
    sourceBinding,
    workflowEligibility:
      sourceAnalysisInputWorkflowEligibility(identityAssociation),
    bindings: {
      pageMap: {
        path: PAGE_MAP_PATH,
        fileSha256: sourceIdentitySha256(pageMapBytes).replace(/^sha256:/, ""),
        pageMapSha256: pageMap.pageMapSha256,
      },
      extractionReceipt: {
        path: EXTRACTION_RECEIPT_PATH,
        fileSha256: sourceIdentitySha256(extractionReceiptBytes).replace(
          /^sha256:/,
          "",
        ),
        receiptSha256: extractionReceipt.receiptSha256,
      },
    },
    serialization: structuredClone(
      SOURCE_ANALYSIS_INPUT_SERIALIZATION,
    ) as SourceAnalysisInputManifestBody["serialization"],
    normalizedInput: { algorithm: "sha256", ...normalizedInput },
    pages: manifestPages,
    totals: sourceAnalysisInputTotals(manifestPages),
    privateStorage: structuredClone(
      SOURCE_ANALYSIS_INPUT_PRIVATE_STORAGE,
    ) as SourceAnalysisInputManifestBody["privateStorage"],
    textIncludedInTrackedArtifact: false,
    readiness: SOURCE_ANALYSIS_INPUT_READINESS,
  };
  const candidateInputManifest = sealSourceAnalysisInputManifest(
    candidateManifestBody,
  );
  const candidateInputManifestBytes = prettyBytes(candidateInputManifest);

  const lifecycleDraft = structuredClone(
    buildInitialCorpusLifecycle({
      recordId: SOURCE_IDENTITY_FULL_EVIDENCE_RECORD_ID,
      sourceId: SOURCE_IDENTITY_FULL_EVIDENCE_SOURCE_ID,
      title: SOURCE_IDENTITY_FULL_EVIDENCE_TITLE,
      sourceRole: "primary_evidence",
      identityKind: "database_record",
      canonicalIdentity,
      identityStatus: "provisional",
      metadataSha256: deterministicHash("source-metadata"),
      contentSha256: RAW_PDF_SHA256,
      contentHashEvidenceState: "private_capture_attestation_recorded",
      contentHashVerifiedAt: INITIAL_OBSERVED_AT,
      observedAt: INITIAL_OBSERVED_AT,
      geographyIds: ["geo.dk"],
      materialProfileIds: ["material.food_products"],
      fileAvailable: false,
      mediaType: "application/pdf",
    }),
  );
  lifecycleDraft.textAvailability = {
    state: "full_text",
    textSha256: `sha256:${candidateInputManifest.normalizedInput.sha256}`,
    characterCount: candidateInputManifest.totals.normalizedCharacterCount,
    extractionMethod: "born_digital",
    observedAt: TECHNICAL_TEXT_APPLIED_AT,
  };
  lifecycleDraft.updatedAt = TECHNICAL_TEXT_APPLIED_AT;
  const lifecycleL1 = validateCorpusLifecycle(lifecycleDraft);
  const lifecycleL1Sha256 = hashCorpusLifecycleState(lifecycleL1);

  const acquisition = acquisitionReceipt();
  const acquisitionReceiptBytes = prettyBytes(acquisition);
  const workflowBytes = readFileSync(SOURCE_IDENTITY_WORKFLOW_PATH);
  const promptTemplateBytes = readFileSync(
    SOURCE_IDENTITY_PROMPT_TEMPLATE_PATH,
  );
  const acquisitionReceiptReference: SourceIdentityVerificationArtifact["acquisitionReceipt"] =
    {
      receiptId: acquisition.receiptId,
      receiptVersion: acquisition.receiptVersion,
      receiptType: acquisition.acquisitionType,
      receiptPath: SOURCE_IDENTITY_FULL_EVIDENCE_ACQUISITION_PATH,
      receiptFileSha256: sourceIdentitySha256(acquisitionReceiptBytes),
      receiptSha256: acquisition.receiptSha256,
    };
  const extractionBinding: SourceIdentityVerificationArtifact["extractionBinding"] =
    {
      extractionReceiptId: sourceIdentityExtractionReceiptId(RAW_PDF_SHA256),
      extractionReceiptVersion: extractionReceipt.pipelineVersion,
      extractionReceiptSha256: `sha256:${extractionReceipt.receiptSha256}`,
      pageMapId: sourceIdentityPageMapId(RAW_PDF_SHA256),
      pageMapVersion: pageMap.pipelineVersion,
      pageMapSha256: `sha256:${pageMap.pageMapSha256}`,
      rawContentSha256: RAW_PDF_SHA256,
      rawContentSizeBytes: RAW_PDF_BYTES.length,
      extractedTextManifestSha256: `sha256:${candidateInputManifest.normalizedInput.sha256}`,
      expectedPageCount: 1,
      mappedPageCount: 1,
      pageSequenceComplete: true,
    };
  const evidenceAnchors: SourceIdentityVerificationArtifact["evidenceAnchors"] =
    [
      {
        anchorId: "anchor.cover",
        evidenceType: "cover_page",
        locator: "page:1",
        evidenceSha256: `sha256:${page.normalizedText.sha256}`,
        observedAt: "2026-08-03T08:01:00Z",
      },
      {
        anchorId: "anchor.acquisition",
        evidenceType: "source_acquisition_receipt",
        locator: SOURCE_IDENTITY_FULL_EVIDENCE_ACQUISITION_PATH,
        evidenceSha256: sourceIdentitySha256(acquisitionReceiptBytes),
        observedAt: "2026-08-03T08:02:00Z",
      },
      {
        anchorId: "anchor.official",
        evidenceType: "official_landing_page",
        locator: "https://authority.example/reports/example-2024",
        evidenceSha256: deterministicHash("official-landing-page"),
        observedAt: "2026-08-03T08:02:00Z",
      },
      {
        anchorId: "anchor.receipt",
        evidenceType: "extraction_receipt",
        locator: EXTRACTION_RECEIPT_PATH,
        evidenceSha256: sourceIdentitySha256(extractionReceiptBytes),
        observedAt: TECHNICAL_TEXT_APPLIED_AT,
      },
      {
        anchorId: "anchor.page.map",
        evidenceType: "page_map",
        locator: PAGE_MAP_PATH,
        evidenceSha256: sourceIdentitySha256(pageMapBytes),
        observedAt: TECHNICAL_TEXT_APPLIED_AT,
      },
      {
        anchorId: "anchor.input.manifest",
        evidenceType: "source_analysis_input_manifest",
        locator: CANDIDATE_INPUT_MANIFEST_PATH,
        evidenceSha256: sourceIdentitySha256(candidateInputManifestBytes),
        observedAt: TECHNICAL_TEXT_APPLIED_AT,
      },
    ];
  const observedMetadata: SourceIdentityVerificationArtifact["observedMetadata"] =
    {
      title: observedTitle,
      publisher: { state: "observed", value: "Example Food Authority" },
      publicationDate: {
        state: "observed",
        sourceValue: "15 March 2025",
        normalizedDate: "2025-03-15",
        normalizedYear: 2025,
      },
      languageCodes: ["en"],
      languageObservationMethod: "document_declared",
    };
  const canonicalLocatorEvidence: SourceIdentityVerificationArtifact["canonicalLocatorEvidence"] =
    {
      kind: "official_url",
      locatorId: "locator.official.report",
      url: SOURCE_IDENTITY_FULL_EVIDENCE_OFFICIAL_URL,
      accessState: "reachable",
      accessObservedAt: "2026-08-03T08:02:00Z",
      evidenceSha256: acquisition.receiptSha256,
    };
  const titleDimension: SourceIdentityVerificationArtifact["matchDimensions"][number] =
    observedTitle === SOURCE_IDENTITY_FULL_EVIDENCE_TITLE
      ? exactDimension("title", SOURCE_IDENTITY_FULL_EVIDENCE_TITLE, [
          "anchor.cover",
        ])
      : {
          dimension: "title",
          expectedValue: SOURCE_IDENTITY_FULL_EVIDENCE_TITLE,
          observedValue: observedTitle,
          matchState: "normalized_match",
          normalizationStatement:
            "Case and punctuation differ while the deterministic ordered title tokens remain identical.",
          discrepancyIds: [],
          evidenceAnchorIds: ["anchor.cover"],
        };
  const matchDimensions: SourceIdentityVerificationArtifact["matchDimensions"] =
    [
      titleDimension,
      exactDimension("publisher", "Example Food Authority", ["anchor.cover"]),
      exactDimension("publication_date", "2025-03-15", ["anchor.cover"]),
      exactDimension("language", '["en"]', ["anchor.cover"]),
      exactDimension(
        "canonical_locator",
        SOURCE_IDENTITY_FULL_EVIDENCE_OFFICIAL_URL,
        ["anchor.acquisition"],
      ),
      exactDimension("content_hash", RAW_PDF_SHA256, ["anchor.acquisition"]),
      exactDimension(
        "extraction_binding",
        `${extractionBinding.extractionReceiptSha256}|${extractionBinding.pageMapSha256}`,
        ["anchor.receipt", "anchor.page.map"],
      ),
    ];
  const decision: SourceIdentityVerificationArtifact["decision"] = {
    state: "verified",
    identityPromotionAllowed: true,
    blockingDiscrepancyCount: 0,
    reason:
      "All mandatory identity dimensions match the observed report and exact extracted bytes.",
    decidedAt: "2026-08-03T08:08:00Z",
    verifiedIdentity: {
      sourceId: SOURCE_IDENTITY_FULL_EVIDENCE_SOURCE_ID,
      canonicalIdentity,
      verifiedAt: "2026-08-03T08:08:00Z",
    },
    nextActions: [],
  };
  const downstreamBoundaries: SourceIdentityVerificationArtifact["downstreamBoundaries"] =
    {
      sourceRoleOwnerConfirmed: false,
      ownerReviewComplete: false,
      independentExpertValidationComplete: false,
      partnerValidationComplete: false,
      rightsHolderValidationComplete: false,
      rightsCleared: false,
      publicationReady: false,
      coveragePromotionAllowed: false,
    };
  const binding: SourceIdentityVerificationArtifact["binding"] = {
    lifecycleRecordId: lifecycleL1.recordId,
    lifecycleSnapshotSha256: lifecycleL1Sha256,
    lifecycleSnapshotUpdatedAt: lifecycleL1.updatedAt,
    sourceId: lifecycleL1.sourceIdentity.sourceId,
    sourceMetadataSha256: lifecycleL1.sourceIdentity.metadataSha256,
    sourceContentSha256: RAW_PDF_SHA256,
    lifecycleSourceIdentityStatus: "provisional",
  };
  const candidateIdentity: SourceIdentityVerificationArtifact["candidateIdentity"] =
    {
      identityKind: "database_record",
      canonicalIdentity,
      candidateLocator: {
        kind: "official_url",
        url: SOURCE_IDENTITY_FULL_EVIDENCE_OFFICIAL_URL,
      },
      candidateTitle: SOURCE_IDENTITY_FULL_EVIDENCE_TITLE,
      candidatePublisher: "Example Food Authority",
      candidatePublicationDate: "2025-03-15",
      candidateLanguageCodes: ["en"],
      status: "provisional",
    };
  const workflowFileSha256 = sourceIdentitySha256(workflowBytes);
  const promptTemplateSha256 = sourceIdentitySha256(promptTemplateBytes);
  const inputEnvelopeSha256 = hashSourceIdentityVerificationInputEnvelope(
    sourceIdentityVerificationInputEnvelope({
      binding,
      candidateIdentity,
      acquisitionReceipt: acquisitionReceiptReference,
      extractionBinding,
      evidenceAnchors,
      workflow: {
        workflowRef: SOURCE_IDENTITY_WORKFLOW_ID,
        workflowVersion: SOURCE_IDENTITY_WORKFLOW_VERSION,
        workflowFileSha256,
        promptTemplateSha256,
      },
    }),
  );
  const verificationPayloadSha256 = hashSourceIdentityVerificationPayload({
    observedMetadata,
    canonicalLocatorEvidence,
    evidenceAnchors,
    matchDimensions,
    discrepancies: [],
    decision,
    downstreamBoundaries,
  });
  const identityBody: Omit<
    SourceIdentityVerificationArtifact,
    "artifactSha256"
  > = {
    schemaVersion: SOURCE_IDENTITY_VERIFICATION_SCHEMA_VERSION,
    artifactType: "source_identity_verification",
    artifactId: "artifact.source.identity.example.v1",
    artifactVersion: SOURCE_IDENTITY_VERIFICATION_ARTIFACT_VERSION,
    lineageId: "lineage.source.identity.example",
    continuity: {
      kind: "initial",
      predecessorArtifactId: null,
      predecessorArtifactVersion: null,
      predecessorArtifactSha256: null,
      changeSummary: null,
    },
    binding,
    candidateIdentity,
    acquisitionReceipt: acquisitionReceiptReference,
    acquisitionProvenanceBoundary: {
      state: "receipt_reference_only",
      combinedReceiptValidationRequired: true,
      standaloneValidationEstablishesProvenance: false,
    },
    extractionBinding,
    observedMetadata,
    canonicalLocatorEvidence,
    evidenceAnchors,
    matchDimensions,
    discrepancies: [],
    decision,
    downstreamBoundaries,
    aiExecution: {
      executionMode: "ai_assisted",
      runs: [
        {
          runId: "ai.run.identity.example",
          stages: [
            "metadata_observation",
            "locator_assessment",
            "identity_match",
            "decision",
          ],
          provider: "OpenAI",
          model: "gpt-5",
          modelVersionState: "runtime_not_exposed",
          modelVersion: MODEL_VERSION_NOT_EXPOSED,
          workflowRef: SOURCE_IDENTITY_WORKFLOW_ID,
          workflowVersion: SOURCE_IDENTITY_WORKFLOW_VERSION,
          workflowFileSha256,
          promptTemplateSha256,
          lifecycleSnapshotSha256: lifecycleL1Sha256,
          sourceMetadataSha256: binding.sourceMetadataSha256,
          sourceContentSha256: RAW_PDF_SHA256,
          acquisitionReceiptSha256: acquisition.receiptSha256,
          extractionReceiptSha256: extractionBinding.extractionReceiptSha256,
          pageMapSha256: extractionBinding.pageMapSha256,
          inputEnvelopeSha256,
          predecessorOutputSha256: null,
          outputSha256: verificationPayloadSha256,
          timeEvidence: "coordinator_observed_window",
          timeEvidenceExplanation:
            "The coordinator observed the request window; provider timestamps were not exposed.",
          startedAt: "2026-08-03T08:04:00Z",
          completedAt: "2026-08-03T08:09:00Z",
        },
      ],
      finalOutputSha256: verificationPayloadSha256,
    },
    verificationPayloadSha256,
    createdAt: "2026-08-03T08:10:00Z",
  };
  const workflowFile = {
    path: SOURCE_IDENTITY_WORKFLOW_PATH,
    bytes: workflowBytes,
  };
  const promptTemplateFile = {
    path: SOURCE_IDENTITY_PROMPT_TEMPLATE_PATH,
    bytes: promptTemplateBytes,
  };
  const bundle: SourceIdentityVerificationEvidenceBundle = {
    acquisitionReceiptFile: {
      path: SOURCE_IDENTITY_FULL_EVIDENCE_ACQUISITION_PATH,
      bytes: acquisitionReceiptBytes,
    },
    rawContentBytes: Buffer.from(RAW_PDF_BYTES),
    extractionReceiptFile: {
      path: EXTRACTION_RECEIPT_PATH,
      bytes: extractionReceiptBytes,
    },
    pageMapFile: { path: PAGE_MAP_PATH, bytes: pageMapBytes },
    sourceAnalysisInputManifestFile: {
      path: CANDIDATE_INPUT_MANIFEST_PATH,
      bytes: candidateInputManifestBytes,
    },
    workflowFile,
    promptTemplateFile,
  };
  const preparedIdentity = prepareVerifiedSourceIdentityArtifact({
    artifactBody: identityBody,
    evidenceBundle: bundle,
  });
  const identity = preparedIdentity.artifact;
  const identityArtifactBytes = preparedIdentity.bytes;

  return {
    sourceId: SOURCE_IDENTITY_FULL_EVIDENCE_SOURCE_ID,
    canonicalIdentity,
    identityKeys,
    rawPdfSha256: RAW_PDF_SHA256,
    rawPdfSha256Unprefixed: RAW_PDF_SHA256_UNPREFIXED,
    rawPdfBytes: Buffer.from(RAW_PDF_BYTES),
    normalizedPageBytes: [Buffer.from(normalizedBytes)],
    acquisitionReceipt: acquisition,
    acquisitionReceiptPath: SOURCE_IDENTITY_FULL_EVIDENCE_ACQUISITION_PATH,
    acquisitionReceiptBytes,
    extractionReceipt,
    extractionReceiptPath: EXTRACTION_RECEIPT_PATH,
    extractionReceiptBytes,
    pageMap,
    pageMapPath: PAGE_MAP_PATH,
    pageMapBytes,
    candidateInputManifest,
    candidateInputManifestPath: CANDIDATE_INPUT_MANIFEST_PATH,
    candidateInputManifestBytes,
    workflowFile,
    promptTemplateFile,
    lifecycleL1,
    lifecycleL1Sha256,
    identity,
    identityArtifactPath: preparedIdentity.repositoryPath,
    identityArtifactBytes,
    bundle,
  };
}
