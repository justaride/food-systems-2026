import { createHash } from "node:crypto";

import {
  buildInitialCorpusLifecycle,
  hashCorpusLifecycleState,
  validateCorpusLifecycle,
} from "../../src/lib/knowledge/corpus-processing-lifecycle";
import {
  SOURCE_ANALYSIS_INPUT_PIPELINE_VERSION,
  SOURCE_ANALYSIS_INPUT_PRIVATE_STORAGE,
  SOURCE_ANALYSIS_INPUT_READINESS,
  SOURCE_ANALYSIS_INPUT_SCHEMA_VERSION,
  SOURCE_ANALYSIS_INPUT_SERIALIZATION,
  sealSourceAnalysisInputManifest,
  serializeNormalizedInput,
  sourceAnalysisEligibleWorkflowEligibility,
  sourceAnalysisInputTotals,
  type SourceAnalysisInputManifestBody,
  type SourceAnalysisInputPage,
} from "../../src/lib/knowledge/source-analysis-input-manifest";
import {
  MODEL_VERSION_NOT_EXPOSED,
  SOURCE_IDENTITY_MATCH_DIMENSIONS,
  SOURCE_IDENTITY_VERIFICATION_ARTIFACT_VERSION,
  SOURCE_IDENTITY_VERIFICATION_SCHEMA_VERSION,
  hashSourceIdentityVerificationPayload,
  sealSourceIdentityVerificationArtifact,
  sourceIdentitySha256,
  type SourceIdentityVerificationArtifact,
} from "../../src/lib/knowledge/source-identity-verification";
import {
  sourceAnalysisSha256,
  type SourceAnalysisArtifactFile,
  type SourceAnalysisBinding,
} from "../../src/lib/knowledge/source-analysis-artifact";

const TITLE = "Synthetic authority report 2025";
const SOURCE_ID = "source.synthetic.report";
const CANONICAL_IDENTITY = "document:synthetic-authority-report-2025";
const OFFICIAL_URL = "https://authority.example/reports/synthetic-2025.pdf";
const IDENTITY_PATH =
  "knowledge/corpus/source-identity-verification/synthetic-authority-report.identity.v1.json";
const MANIFEST_PATH =
  "knowledge/corpus/source-analysis-input-manifests/manifests/synthetic-authority-report.source-analysis-input-manifest.v1.json";
const EXTRACTION_PATH =
  "knowledge/corpus/pdf-page-extraction/receipts/synthetic-authority-report.receipt.v1.json";
const PAGE_MAP_PATH =
  "knowledge/corpus/pdf-page-extraction/page-maps/synthetic-authority-report.page-map.v1.json";

function rawSha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function prefixed(value: string): string {
  return `sha256:${value}`;
}

function prettyBytes(value: unknown): Buffer {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function normalizedFixture(): {
  pages: SourceAnalysisInputPage[];
  normalizedPageBytes: Buffer[];
  normalizedInput: { sha256: string; serializedSizeBytes: number };
} {
  const normalizedPageBytes = [
    Buffer.from("Synthetic cover and declared report identity.\n", "utf8"),
    Buffer.from(
      "Synthetic method, result, limitation and reconciliation evidence.\n",
      "utf8",
    ),
  ];
  const pages = normalizedPageBytes.map((bytes, index) => {
    const text = bytes.toString("utf8");
    return {
      pageNumber: index + 1,
      normalizedText: {
        sha256: rawSha256(bytes),
        sizeBytes: bytes.length,
        characterCount: [...text].length,
        wordCount: text.trim().split(/\s+/).length,
      },
    };
  });
  return {
    pages,
    normalizedPageBytes,
    normalizedInput: serializeNormalizedInput({ pages, normalizedPageBytes }),
  };
}

function identityFixture(input: {
  lifecycleSnapshotSha256: string;
  rawPdfSha256: string;
  normalizedInputSha256: string;
  extractionReceiptSha256: string;
  pageMapSha256: string;
}): SourceIdentityVerificationArtifact {
  const observedMetadata: SourceIdentityVerificationArtifact["observedMetadata"] =
    {
      title: TITLE,
      publisher: { state: "observed", value: "Synthetic Food Authority" },
      publicationDate: {
        state: "observed",
        sourceValue: "1 July 2025",
        normalizedDate: "2025-07-01",
        normalizedYear: 2025,
      },
      languageCodes: ["en"],
      languageObservationMethod: "document_declared",
    };
  const evidenceAnchors: SourceIdentityVerificationArtifact["evidenceAnchors"] =
    [
      {
        anchorId: "anchor.cover",
        evidenceType: "cover_page",
        locator: "page:1",
        evidenceSha256: sourceIdentitySha256("synthetic-cover"),
        observedAt: "2026-08-03T08:01:00Z",
      },
      {
        anchorId: "anchor.official",
        evidenceType: "official_landing_page",
        locator: OFFICIAL_URL,
        evidenceSha256: sourceIdentitySha256("synthetic-official-locator"),
        observedAt: "2026-08-03T08:02:00Z",
      },
      {
        anchorId: "anchor.receipt",
        evidenceType: "extraction_receipt",
        locator: "artifact.extraction.synthetic",
        evidenceSha256: input.extractionReceiptSha256,
        observedAt: "2026-08-03T08:03:00Z",
      },
      {
        anchorId: "anchor.page.map",
        evidenceType: "page_map",
        locator: "artifact.page.map.synthetic",
        evidenceSha256: input.pageMapSha256,
        observedAt: "2026-08-03T08:03:00Z",
      },
    ];
  const exact = (
    dimension: (typeof SOURCE_IDENTITY_MATCH_DIMENSIONS)[number],
    value: string,
    evidenceAnchorIds: string[],
  ): SourceIdentityVerificationArtifact["matchDimensions"][number] => ({
    dimension,
    expectedValue: value,
    observedValue: value,
    matchState: "exact_match",
    normalizationStatement: null,
    discrepancyIds: [],
    evidenceAnchorIds,
  });
  const matchDimensions: SourceIdentityVerificationArtifact["matchDimensions"] =
    [
      exact("title", TITLE, ["anchor.cover"]),
      exact("publisher", "Synthetic Food Authority", ["anchor.cover"]),
      exact("publication_date", "2025-07-01", ["anchor.cover"]),
      exact("language", '["en"]', ["anchor.cover"]),
      exact("canonical_locator", OFFICIAL_URL, ["anchor.official"]),
      exact("content_hash", input.rawPdfSha256, ["anchor.receipt"]),
      exact(
        "extraction_binding",
        `${input.extractionReceiptSha256}|${input.pageMapSha256}`,
        ["anchor.receipt", "anchor.page.map"],
      ),
    ];
  const decision: SourceIdentityVerificationArtifact["decision"] = {
    state: "verified",
    identityPromotionAllowed: true,
    blockingDiscrepancyCount: 0,
    reason:
      "Every mandatory identity dimension matches the exact synthetic source and extraction bindings.",
    decidedAt: "2026-08-03T08:08:00Z",
    verifiedIdentity: {
      sourceId: SOURCE_ID,
      canonicalIdentity: CANONICAL_IDENTITY,
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
  const verificationPayloadSha256 = hashSourceIdentityVerificationPayload({
    observedMetadata,
    canonicalLocatorEvidence: {
      kind: "official_url",
      locatorId: "locator.official.synthetic",
      url: OFFICIAL_URL,
      accessState: "reachable",
      accessObservedAt: "2026-08-03T08:02:00Z",
      evidenceSha256: sourceIdentitySha256("synthetic-acquisition-receipt"),
    },
    evidenceAnchors,
    matchDimensions,
    discrepancies: [],
    decision,
    downstreamBoundaries,
  });
  return sealSourceIdentityVerificationArtifact({
    schemaVersion: SOURCE_IDENTITY_VERIFICATION_SCHEMA_VERSION,
    artifactType: "source_identity_verification",
    artifactId: "artifact.source.identity.synthetic.v1",
    artifactVersion: SOURCE_IDENTITY_VERIFICATION_ARTIFACT_VERSION,
    lineageId: "lineage.source.identity.synthetic",
    continuity: {
      kind: "initial",
      predecessorArtifactId: null,
      predecessorArtifactVersion: null,
      predecessorArtifactSha256: null,
      changeSummary: null,
    },
    binding: {
      lifecycleRecordId: "corpus.record.synthetic",
      lifecycleSnapshotSha256: input.lifecycleSnapshotSha256,
      lifecycleSnapshotUpdatedAt: "2026-08-03T08:03:00Z",
      sourceId: SOURCE_ID,
      sourceMetadataSha256: sourceIdentitySha256("synthetic-metadata"),
      sourceContentSha256: input.rawPdfSha256,
      lifecycleSourceIdentityStatus: "provisional",
    },
    candidateIdentity: {
      identityKind: "database_record",
      canonicalIdentity: CANONICAL_IDENTITY,
      candidateLocator: { kind: "official_url", url: OFFICIAL_URL },
      candidateTitle: TITLE,
      candidatePublisher: "Synthetic Food Authority",
      candidatePublicationDate: "2025-07-01",
      candidateLanguageCodes: ["en"],
      status: "provisional",
    },
    acquisitionReceipt: {
      receiptId: "receipt.source.acquisition.synthetic",
      receiptVersion: "1.0.0",
      receiptType: "controlled_https_fetch",
      receiptPath:
        "knowledge/corpus/source-acquisition-receipts/receipts/synthetic-report.https.v1.json",
      receiptFileSha256: sourceIdentitySha256("synthetic-acquisition-file"),
      receiptSha256: sourceIdentitySha256("synthetic-acquisition-receipt"),
    },
    acquisitionProvenanceBoundary: {
      state: "receipt_reference_only",
      combinedReceiptValidationRequired: true,
      standaloneValidationEstablishesProvenance: false,
    },
    extractionBinding: {
      extractionReceiptId: "artifact.extraction.synthetic",
      extractionReceiptVersion: "1.0.0",
      extractionReceiptSha256: input.extractionReceiptSha256,
      pageMapId: "artifact.page.map.synthetic",
      pageMapVersion: "1.0.0",
      pageMapSha256: input.pageMapSha256,
      rawContentSha256: input.rawPdfSha256,
      rawContentSizeBytes: 1_024,
      extractedTextManifestSha256: input.normalizedInputSha256,
      expectedPageCount: 2,
      mappedPageCount: 2,
      pageSequenceComplete: true,
    },
    observedMetadata,
    canonicalLocatorEvidence: {
      kind: "official_url",
      locatorId: "locator.official.synthetic",
      url: OFFICIAL_URL,
      accessState: "reachable",
      accessObservedAt: "2026-08-03T08:02:00Z",
      evidenceSha256: sourceIdentitySha256("synthetic-acquisition-receipt"),
    },
    evidenceAnchors,
    matchDimensions,
    discrepancies: [],
    decision,
    downstreamBoundaries,
    aiExecution: {
      executionMode: "ai_assisted",
      runs: [
        {
          runId: "ai.run.identity.synthetic",
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
          workflowRef: "workflow.source.identity.verification",
          workflowVersion: "1.0.0",
          promptTemplateSha256: sourceIdentitySha256("identity-prompt"),
          lifecycleSnapshotSha256: input.lifecycleSnapshotSha256,
          sourceMetadataSha256: sourceIdentitySha256("synthetic-metadata"),
          sourceContentSha256: input.rawPdfSha256,
          acquisitionReceiptSha256: sourceIdentitySha256(
            "synthetic-acquisition-receipt",
          ),
          extractionReceiptSha256: input.extractionReceiptSha256,
          pageMapSha256: input.pageMapSha256,
          inputEnvelopeSha256: sourceIdentitySha256(
            "synthetic-identity-input-envelope",
          ),
          predecessorOutputSha256: null,
          outputSha256: verificationPayloadSha256,
          timeEvidence: "coordinator_observed_window",
          timeEvidenceExplanation:
            "The coordinator observed the synthetic request window; provider timestamps were not exposed.",
          startedAt: "2026-08-03T08:04:00Z",
          completedAt: "2026-08-03T08:09:00Z",
        },
      ],
      finalOutputSha256: verificationPayloadSha256,
    },
    verificationPayloadSha256,
    createdAt: "2026-08-03T08:10:00Z",
  });
}

export function sourceAnalysisCombinedInputFixture(): {
  inputManifestFile: SourceAnalysisArtifactFile;
  identityArtifactFile: SourceAnalysisArtifactFile;
  lifecyclePrestate: ReturnType<typeof validateCorpusLifecycle>;
  binding: SourceAnalysisBinding;
} {
  const normalized = normalizedFixture();
  const rawPdfSha256Raw = rawSha256("synthetic-pdf-processing-unit");
  const rawPdfSha256 = prefixed(rawPdfSha256Raw);
  const extractionReceiptSha256Raw = rawSha256("synthetic-extraction-receipt");
  const pageMapSha256Raw = rawSha256("synthetic-page-map");
  const normalizedInputSha256 = prefixed(normalized.normalizedInput.sha256);
  const lifecyclePrestate = structuredClone(
    buildInitialCorpusLifecycle({
      recordId: "corpus.record.synthetic",
      sourceId: SOURCE_ID,
      title: TITLE,
      sourceRole: "primary_evidence",
      identityKind: "database_record",
      canonicalIdentity: CANONICAL_IDENTITY,
      identityStatus: "provisional",
      metadataSha256: sourceIdentitySha256("synthetic-metadata"),
      contentSha256: rawPdfSha256,
      contentHashEvidenceState: "private_capture_attestation_recorded",
      contentHashVerifiedAt: "2026-08-03T08:03:00Z",
      observedAt: "2026-08-03T08:03:00Z",
      geographyIds: ["geo.dk"],
      materialProfileIds: ["material.food_products"],
      fileAvailable: false,
    }),
  );
  lifecyclePrestate.textAvailability = {
    state: "full_text",
    textSha256: normalizedInputSha256,
    characterCount: normalized.pages.reduce(
      (total, page) => total + page.normalizedText.characterCount,
      0,
    ),
    extractionMethod: "born_digital",
    observedAt: "2026-08-03T08:03:00Z",
  };
  const lifecycle = validateCorpusLifecycle(lifecyclePrestate);
  const lifecycleSnapshotSha256 = hashCorpusLifecycleState(lifecycle);
  const identity = identityFixture({
    lifecycleSnapshotSha256,
    rawPdfSha256,
    normalizedInputSha256,
    extractionReceiptSha256: prefixed(extractionReceiptSha256Raw),
    pageMapSha256: prefixed(pageMapSha256Raw),
  });
  const identityBytes = prettyBytes(identity);
  const identityFileSha256Raw = rawSha256(identityBytes);
  const identityArtifactFile = { path: IDENTITY_PATH, bytes: identityBytes };
  const workflowEligibility = sourceAnalysisEligibleWorkflowEligibility({
    identityArtifactReference: {
      artifactId: identity.artifactId,
      artifactVersion: identity.artifactVersion,
      path: IDENTITY_PATH,
      fileSha256: identityFileSha256Raw,
      artifactSha256: identity.artifactSha256,
      decision: "verified",
    },
    lifecyclePrestate: {
      lifecycleRecordId: lifecycle.recordId,
      lifecycleSnapshotSha256,
      lifecycleSnapshotUpdatedAt: lifecycle.updatedAt,
    },
  });
  const manifest = sealSourceAnalysisInputManifest({
    schemaVersion: SOURCE_ANALYSIS_INPUT_SCHEMA_VERSION,
    artifactType: "source_analysis_input_manifest",
    pipelineVersion: SOURCE_ANALYSIS_INPUT_PIPELINE_VERSION,
    processingUnit: { algorithm: "sha256", rawPdfSha256: rawPdfSha256Raw },
    identityKeys: [CANONICAL_IDENTITY],
    identityAssociation: {
      state: "verified_identity_match",
      intendedLabel: TITLE,
      observedDocumentTitle: TITLE,
      sourceId: SOURCE_ID,
      canonicalIdentity: CANONICAL_IDENTITY,
      blockerCode: null,
    },
    sourceBinding: {
      title: TITLE,
      doi: null,
      officialUrl: OFFICIAL_URL,
      corpusIdentityVerified: true,
      scopeDisposition: "pending_owner_classification",
    },
    workflowEligibility,
    bindings: {
      pageMap: {
        path: PAGE_MAP_PATH,
        fileSha256: rawSha256("synthetic-page-map-file"),
        pageMapSha256: pageMapSha256Raw,
      },
      extractionReceipt: {
        path: EXTRACTION_PATH,
        fileSha256: rawSha256("synthetic-extraction-receipt-file"),
        receiptSha256: extractionReceiptSha256Raw,
      },
    },
    serialization: structuredClone(
      SOURCE_ANALYSIS_INPUT_SERIALIZATION,
    ) as unknown as SourceAnalysisInputManifestBody["serialization"],
    normalizedInput: { algorithm: "sha256", ...normalized.normalizedInput },
    pages: normalized.pages,
    totals: sourceAnalysisInputTotals(normalized.pages),
    privateStorage: structuredClone(
      SOURCE_ANALYSIS_INPUT_PRIVATE_STORAGE,
    ) as unknown as SourceAnalysisInputManifestBody["privateStorage"],
    textIncludedInTrackedArtifact: false,
    readiness: SOURCE_ANALYSIS_INPUT_READINESS,
  });
  const manifestBytes = prettyBytes(manifest);
  const inputManifestFile = { path: MANIFEST_PATH, bytes: manifestBytes };
  const binding: SourceAnalysisBinding = {
    sourceAnalysisInputManifestPath: MANIFEST_PATH,
    sourceAnalysisInputManifestFileSha256: sourceAnalysisSha256(manifestBytes),
    sourceAnalysisInputManifestSchemaVersion: manifest.schemaVersion,
    sourceAnalysisInputManifestPipelineVersion: manifest.pipelineVersion,
    sourceAnalysisInputManifestSha256: prefixed(manifest.manifestSha256),
    lifecycleRecordId: lifecycle.recordId,
    lifecycleSnapshotSha256,
    lifecycleSnapshotUpdatedAt: lifecycle.updatedAt,
    sourceId: SOURCE_ID,
    sourceTitle: TITLE,
    sourceCanonicalIdentity: CANONICAL_IDENTITY,
    sourceIdentityStatus: "verified",
    sourceIdentityVerificationArtifactId: identity.artifactId,
    sourceIdentityVerificationArtifactVersion: identity.artifactVersion,
    sourceIdentityVerificationArtifactPath: IDENTITY_PATH,
    sourceIdentityVerificationArtifactFileSha256:
      sourceAnalysisSha256(identityBytes),
    sourceIdentityVerificationArtifactSha256: identity.artifactSha256,
    sourceIdentityVerificationDecision: "verified",
    sourceMetadataSha256: identity.binding.sourceMetadataSha256,
    sourceContentSha256: rawPdfSha256,
    rawPdfSha256,
    textSha256: normalizedInputSha256,
    textAvailabilityState: "full_text",
    extractionArtifactId: identity.extractionBinding.extractionReceiptId,
    extractionArtifactVersion:
      identity.extractionBinding.extractionReceiptVersion,
    extractionArtifactSha256: prefixed(extractionReceiptSha256Raw),
    extractionArtifactPath: EXTRACTION_PATH,
    extractionArtifactFileSha256: prefixed(
      manifest.bindings.extractionReceipt.fileSha256,
    ),
    extractionTextManifestSha256: normalizedInputSha256,
    pageMapPath: PAGE_MAP_PATH,
    pageMapFileSha256: prefixed(manifest.bindings.pageMap.fileSha256),
    pageMapSha256: prefixed(pageMapSha256Raw),
  };
  return {
    inputManifestFile,
    identityArtifactFile,
    lifecyclePrestate: lifecycle,
    binding,
  };
}
