import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  validateSourceAnalysisIdentityReference,
  type SourceAnalysisBinding,
} from "../../src/lib/knowledge/source-analysis-artifact";

import {
  SOURCE_ACQUISITION_RECEIPT_SCHEMA_VERSION,
  SOURCE_ACQUISITION_RECEIPT_VERSION,
  sealSourceAcquisitionReceipt,
  type ControlledHttpsFetchReceipt,
  type ControlledPrivateAccessReceipt,
} from "../../src/lib/knowledge/source-acquisition-receipt";

import {
  MODEL_VERSION_NOT_EXPOSED,
  SOURCE_IDENTITY_MATCH_DIMENSIONS,
  SOURCE_IDENTITY_VERIFICATION_ARTIFACT_VERSION,
  SOURCE_IDENTITY_VERIFICATION_SCHEMA_VERSION,
  hashSourceIdentityVerificationPayload,
  requireVerifiedSourceIdentity,
  sealSourceIdentityVerificationArtifact,
  sourceIdentitySha256,
  sourceIdentityVerificationPayload,
  sourceIdentityVerificationStructuralSchema,
  validateSourceIdentityVerificationArtifact,
  validateSourceIdentityVerificationBinding,
  validateSourceIdentityVerificationWithAcquisitionReceipt,
  type SourceIdentityVerificationArtifact,
} from "../../src/lib/knowledge/source-identity-verification";

const HASH = Object.fromEntries(
  "abcdefghijklmnopqrstuvwxyz"
    .split("")
    .map((character) => [
      character,
      sourceIdentitySha256(`identity-fixture-${character}`),
    ]),
) as Record<string, string>;
const RAW_CONTENT_BYTES = Buffer.from("%PDF-source-identity-fixture", "utf8");
HASH.e = sourceIdentitySha256(RAW_CONTENT_BYTES);

const ACQUISITION_RECEIPT_PATH =
  "knowledge/corpus/source-acquisition-receipts/receipts/example-report.https.v1.json";

function acquisitionReceiptFixture(): ControlledHttpsFetchReceipt {
  return sealSourceAcquisitionReceipt({
    schemaVersion: SOURCE_ACQUISITION_RECEIPT_SCHEMA_VERSION,
    artifactType: "source_acquisition_receipt",
    receiptId: "receipt.source.acquisition.example.https",
    receiptVersion: SOURCE_ACQUISITION_RECEIPT_VERSION,
    sourceId: "source.example.report",
    acquisitionType: "controlled_https_fetch",
    requestedLocator: "https://authority.example/reports/example-2024.pdf",
    finalLocator: "https://authority.example/reports/example-2024.pdf",
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
      contentLengthBytes: RAW_CONTENT_BYTES.length,
      bodySizeBytes: RAW_CONTENT_BYTES.length,
      bodySha256: HASH.e!,
      observedAt: "2026-08-03T08:02:00Z",
    },
    tool: {
      name: "controlled-source-fetch",
      version: "1.0.0",
      workflowRef: "workflow.source.acquisition.https",
      workflowVersion: "1.0.0",
    },
    startedAt: "2026-08-03T08:01:00Z",
    completedAt: "2026-08-03T08:03:00Z",
  }) as ControlledHttpsFetchReceipt;
}

function acquisitionReceiptBytes(
  receipt = acquisitionReceiptFixture(),
): Buffer {
  return Buffer.from(`${JSON.stringify(receipt, null, 2)}\n`, "utf8");
}

function privateAcquisitionReceiptFixture(): ControlledPrivateAccessReceipt {
  return sealSourceAcquisitionReceipt({
    schemaVersion: SOURCE_ACQUISITION_RECEIPT_SCHEMA_VERSION,
    artifactType: "source_acquisition_receipt",
    receiptId: "receipt.source.acquisition.example.private",
    receiptVersion: SOURCE_ACQUISITION_RECEIPT_VERSION,
    sourceId: "source.example.report",
    acquisitionType: "controlled_private_access",
    requestedLocator: "private://corpus/sha256/example-report.pdf",
    finalLocator: "private://corpus/sha256/example-report.pdf",
    recoveryManifest: {
      manifestId: "manifest.private.recovery.v1",
      manifestVersion: "1.0.0",
      manifestPath:
        "knowledge/corpus/corpus-private-recovery-candidates.v1.json",
      manifestFileSha256: HASH.r!,
      manifestReceiptSha256: HASH.l!,
      entryId: "recovery.entry.example.report",
      entryPath: "sha256/example-report.pdf",
      entryLocator: "private://corpus/sha256/example-report.pdf",
      entryContentSha256: HASH.e!,
      entrySizeBytes: RAW_CONTENT_BYTES.length,
    },
    content: { sha256: HASH.e!, sizeBytes: RAW_CONTENT_BYTES.length },
    copyAttestations: [
      {
        copyId: "primary",
        storageRootId: "storage.private.primary",
        storageClass: "private_primary",
        locator: "private://primary/sha256/example-report.pdf",
        portablePath: "sha256/example-report.pdf",
        contentSha256: HASH.e!,
        sizeBytes: RAW_CONTENT_BYTES.length,
        fileMode: "0400",
        verifiedAt: "2026-08-03T08:01:00Z",
      },
      {
        copyId: "replica",
        storageRootId: "storage.bigbrain.replica",
        storageClass: "bigbrain_private_replica",
        locator: "private://replica/sha256/example-report.pdf",
        portablePath: "sha256/example-report.pdf",
        contentSha256: HASH.e!,
        sizeBytes: RAW_CONTENT_BYTES.length,
        fileMode: "0400",
        verifiedAt: "2026-08-03T08:02:00Z",
      },
    ],
    twoCopyAttestation: {
      requiredCopyCount: 2,
      distinctStorageRoots: true,
      distinctFiles: true,
      contentHashesMatch: true,
      sizesMatch: true,
    },
    tool: {
      name: "controlled-private-verifier",
      version: "1.0.0",
      workflowRef: "workflow.source.acquisition.private",
      workflowVersion: "1.0.0",
    },
    startedAt: "2026-08-03T08:00:00Z",
    completedAt: "2026-08-03T08:02:00Z",
  }) as ControlledPrivateAccessReceipt;
}

const jsonSchema = JSON.parse(
  readFileSync(
    "knowledge/schema/source-identity-verification.schema.v1.json",
    "utf8",
  ),
) as object;
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateJsonSchema = ajv.compile(jsonSchema);

function fixtureArtifact(): SourceIdentityVerificationArtifact {
  const acquisitionReceipt = acquisitionReceiptFixture();
  const receiptBytes = acquisitionReceiptBytes(acquisitionReceipt);
  const observedMetadata: SourceIdentityVerificationArtifact["observedMetadata"] =
    {
      title: "Example authority report 2024",
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
      url: "https://authority.example/reports/example-2024.pdf",
      accessState: "reachable",
      accessObservedAt: "2026-08-03T08:02:00Z",
      evidenceSha256: acquisitionReceipt.receiptSha256,
    };
  const evidenceAnchors: SourceIdentityVerificationArtifact["evidenceAnchors"] =
    [
      {
        anchorId: "anchor.cover",
        evidenceType: "cover_page",
        locator: "page:1",
        evidenceSha256: HASH.a!,
        observedAt: "2026-08-03T08:01:00Z",
      },
      {
        anchorId: "anchor.official",
        evidenceType: "official_landing_page",
        locator: "https://authority.example/reports/example-2024",
        evidenceSha256: HASH.b!,
        observedAt: "2026-08-03T08:02:00Z",
      },
      {
        anchorId: "anchor.receipt",
        evidenceType: "extraction_receipt",
        locator: "artifact.extraction.receipt.example",
        evidenceSha256: HASH.c!,
        observedAt: "2026-08-03T08:03:00Z",
      },
      {
        anchorId: "anchor.page.map",
        evidenceType: "page_map",
        locator: "artifact.page.map.example",
        evidenceSha256: HASH.d!,
        observedAt: "2026-08-03T08:03:00Z",
      },
    ];
  const exact = (
    dimension: SourceIdentityVerificationArtifact["matchDimensions"][number]["dimension"],
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
      exact("title", "Example authority report 2024", ["anchor.cover"]),
      exact("publisher", "Example Food Authority", ["anchor.cover"]),
      exact("publication_date", "2025-03-15", ["anchor.cover"]),
      exact("language", '["en"]', ["anchor.cover"]),
      exact(
        "canonical_locator",
        "https://authority.example/reports/example-2024.pdf",
        ["anchor.official"],
      ),
      exact("content_hash", HASH.e!, ["anchor.receipt"]),
      exact("extraction_binding", `${HASH.c!}|${HASH.d!}`, [
        "anchor.receipt",
        "anchor.page.map",
      ]),
    ];
  const decision: SourceIdentityVerificationArtifact["decision"] = {
    state: "verified",
    identityPromotionAllowed: true,
    blockingDiscrepancyCount: 0,
    reason:
      "All mandatory identity dimensions match the observed report and exact extracted bytes.",
    decidedAt: "2026-08-03T08:08:00Z",
    verifiedIdentity: {
      sourceId: "source.example.report",
      canonicalIdentity: "document:cmpp-example-report",
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
    canonicalLocatorEvidence,
    evidenceAnchors,
    matchDimensions,
    discrepancies: [],
    decision,
    downstreamBoundaries,
  });

  return sealSourceIdentityVerificationArtifact({
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
    binding: {
      lifecycleRecordId: "corpus.record.example",
      lifecycleSnapshotSha256: HASH.f!,
      lifecycleSnapshotUpdatedAt: "2026-08-03T08:00:00Z",
      sourceId: "source.example.report",
      sourceMetadataSha256: HASH.h!,
      sourceContentSha256: HASH.e!,
      lifecycleSourceIdentityStatus: "provisional",
    },
    candidateIdentity: {
      identityKind: "database_record",
      canonicalIdentity: "document:cmpp-example-report",
      candidateLocator: {
        kind: "official_url",
        url: "https://authority.example/reports/example-2024.pdf",
      },
      candidateTitle: "Example authority report 2024",
      candidatePublisher: "Example Food Authority",
      candidatePublicationDate: "2025-03-15",
      candidateLanguageCodes: ["en"],
      status: "provisional",
    },
    acquisitionReceipt: {
      receiptId: acquisitionReceipt.receiptId,
      receiptVersion: acquisitionReceipt.receiptVersion,
      receiptType: acquisitionReceipt.acquisitionType,
      receiptPath: ACQUISITION_RECEIPT_PATH,
      receiptFileSha256: sourceIdentitySha256(receiptBytes),
      receiptSha256: acquisitionReceipt.receiptSha256,
    },
    acquisitionProvenanceBoundary: {
      state: "receipt_reference_only",
      combinedReceiptValidationRequired: true,
      standaloneValidationEstablishesProvenance: false,
    },
    extractionBinding: {
      extractionReceiptId: "artifact.extraction.receipt.example",
      extractionReceiptVersion: "1.0.0",
      extractionReceiptSha256: HASH.c!,
      pageMapId: "artifact.page.map.example",
      pageMapVersion: "1.0.0",
      pageMapSha256: HASH.d!,
      rawContentSha256: HASH.e!,
      rawContentSizeBytes: RAW_CONTENT_BYTES.length,
      extractedTextManifestSha256: HASH.i!,
      expectedPageCount: 12,
      mappedPageCount: 12,
      pageSequenceComplete: true,
    },
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
          workflowRef: "workflow.source.identity.verification",
          workflowVersion: "1.0.0",
          promptTemplateSha256: HASH.j!,
          lifecycleSnapshotSha256: HASH.f!,
          sourceMetadataSha256: HASH.h!,
          sourceContentSha256: HASH.e!,
          acquisitionReceiptSha256: acquisitionReceipt.receiptSha256,
          extractionReceiptSha256: HASH.c!,
          pageMapSha256: HASH.d!,
          inputEnvelopeSha256: HASH.k!,
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
  });
}

function reseal(
  artifact: SourceIdentityVerificationArtifact,
): SourceIdentityVerificationArtifact {
  const next = structuredClone(artifact);
  next.verificationPayloadSha256 = hashSourceIdentityVerificationPayload(
    sourceIdentityVerificationPayload(next),
  );
  next.aiExecution.runs.at(-1)!.outputSha256 = next.verificationPayloadSha256;
  next.aiExecution.finalOutputSha256 = next.verificationPayloadSha256;
  const { artifactSha256: _oldSeal, ...body } = next;
  return sealSourceIdentityVerificationArtifact(body);
}

function provisionalArtifact(): SourceIdentityVerificationArtifact {
  const artifact = fixtureArtifact();
  artifact.decision = {
    state: "provisional",
    identityPromotionAllowed: false,
    blockingDiscrepancyCount: 0,
    reason:
      "The evidence is retained, but the identity has not been promoted in this decision.",
    decidedAt: "2026-08-03T08:08:00Z",
    verifiedIdentity: null,
    nextActions: [
      "Re-run the exact identity decision after the remaining evidence check is complete.",
    ],
  };
  return reseal(artifact);
}

function rejectedArtifact(): SourceIdentityVerificationArtifact {
  const artifact = fixtureArtifact();
  artifact.observedMetadata.title = "Different report title";
  const titleDimension = artifact.matchDimensions.find(
    (item) => item.dimension === "title",
  )!;
  titleDimension.observedValue = "Different report title";
  titleDimension.matchState = "mismatch";
  titleDimension.discrepancyIds = ["discrepancy.title.mismatch"];
  artifact.discrepancies = [
    {
      discrepancyId: "discrepancy.title.mismatch",
      dimension: "title",
      severity: "blocking",
      status: "open",
      statement:
        "The observed report title identifies a different work from the provisional corpus record.",
      expectedValue: "Example authority report 2024",
      observedValue: "Different report title",
      evidenceAnchorIds: ["anchor.cover"],
    },
  ];
  artifact.decision = {
    state: "rejected",
    identityPromotionAllowed: false,
    blockingDiscrepancyCount: 1,
    reason:
      "A blocking title mismatch shows that the provisional identity points to another work.",
    decidedAt: "2026-08-03T08:08:00Z",
    verifiedIdentity: null,
    nextActions: [
      "Create a corrected corpus identity for the observed report before analysis.",
    ],
  };
  return reseal(artifact);
}

function analysisBindingFor(
  identity: SourceIdentityVerificationArtifact,
): SourceAnalysisBinding {
  const canonicalIdentity =
    identity.decision.state === "verified"
      ? identity.decision.verifiedIdentity.canonicalIdentity
      : identity.candidateIdentity.canonicalIdentity;
  return {
    sourceAnalysisInputManifestPath:
      "knowledge/corpus/source-analysis-input-manifests/manifests/example.source-analysis-input-manifest.v1.json",
    sourceAnalysisInputManifestFileSha256: HASH.m!,
    sourceAnalysisInputManifestSchemaVersion: "1.0.0",
    sourceAnalysisInputManifestPipelineVersion: "1.0.0",
    sourceAnalysisInputManifestSha256: HASH.n!,
    lifecycleRecordId: identity.binding.lifecycleRecordId,
    lifecycleSnapshotSha256: identity.binding.lifecycleSnapshotSha256,
    lifecycleSnapshotUpdatedAt: identity.binding.lifecycleSnapshotUpdatedAt,
    sourceId: identity.binding.sourceId,
    sourceTitle: identity.observedMetadata.title,
    sourceCanonicalIdentity: canonicalIdentity,
    sourceIdentityStatus: "verified",
    sourceIdentityVerificationArtifactId: identity.artifactId,
    sourceIdentityVerificationArtifactVersion: identity.artifactVersion,
    sourceIdentityVerificationArtifactPath:
      "knowledge/corpus/source-identity-verification/example.identity.v1.json",
    sourceIdentityVerificationArtifactFileSha256: HASH.o!,
    sourceIdentityVerificationArtifactSha256: identity.artifactSha256,
    sourceIdentityVerificationDecision: "verified",
    sourceMetadataSha256: identity.binding.sourceMetadataSha256,
    sourceContentSha256: identity.binding.sourceContentSha256,
    rawPdfSha256: identity.extractionBinding.rawContentSha256,
    textSha256: HASH.q!,
    textAvailabilityState: "full_text",
    extractionArtifactId: identity.extractionBinding.extractionReceiptId,
    extractionArtifactVersion:
      identity.extractionBinding.extractionReceiptVersion,
    extractionArtifactSha256:
      identity.extractionBinding.extractionReceiptSha256,
    extractionArtifactPath:
      "knowledge/corpus/pdf-page-extraction/receipts/example.receipt.v1.json",
    extractionArtifactFileSha256: HASH.p!,
    extractionTextManifestSha256:
      identity.extractionBinding.extractedTextManifestSha256,
    pageMapPath:
      "knowledge/corpus/pdf-page-extraction/page-maps/example.page-map.v1.json",
    pageMapFileSha256: HASH.q!,
    pageMapSha256: identity.extractionBinding.pageMapSha256,
  };
}

function assertStructuralParity(value: unknown, expected: boolean): void {
  assert.equal(
    sourceIdentityVerificationStructuralSchema.safeParse(value).success,
    expected,
  );
  assert.equal(
    validateJsonSchema(value),
    expected,
    JSON.stringify(validateJsonSchema.errors),
  );
}

test("verifies one provisional identity against exact source and extraction evidence", () => {
  const artifact = fixtureArtifact();
  assertStructuralParity(artifact, true);
  assert.deepEqual(
    validateSourceIdentityVerificationArtifact(artifact),
    artifact,
  );
  assert.equal(
    requireVerifiedSourceIdentity(artifact).decision.state,
    "verified",
  );
  assert.deepEqual(
    artifact.matchDimensions.map((item) => item.dimension),
    [...SOURCE_IDENTITY_MATCH_DIMENSIONS],
  );
});

test("establishes HTTPS provenance only through exact combined receipt validation", () => {
  const identity = fixtureArtifact();
  const receipt = acquisitionReceiptFixture();
  const receiptBytes = acquisitionReceiptBytes(receipt);
  assert.equal(
    identity.acquisitionProvenanceBoundary
      .standaloneValidationEstablishesProvenance,
    false,
  );
  const combined = validateSourceIdentityVerificationWithAcquisitionReceipt(
    identity,
    {
      receiptPath: ACQUISITION_RECEIPT_PATH,
      receiptBytes,
      rawContentBytes: RAW_CONTENT_BYTES,
    },
  );
  assert.equal(combined.acquisitionProvenanceValidated, true);
  assert.equal(
    combined.acquisitionReceipt.receiptSha256,
    receipt.receiptSha256,
  );

  const wrongPath = `${ACQUISITION_RECEIPT_PATH}.other`;
  assert.throws(
    () =>
      validateSourceIdentityVerificationWithAcquisitionReceipt(identity, {
        receiptPath: wrongPath,
        receiptBytes,
        rawContentBytes: RAW_CONTENT_BYTES,
      }),
    /receipt path does not match/,
  );

  const wrongBytes = Buffer.from(receiptBytes);
  wrongBytes[wrongBytes.length - 2] = 0x20;
  assert.throws(
    () =>
      validateSourceIdentityVerificationWithAcquisitionReceipt(identity, {
        receiptPath: ACQUISITION_RECEIPT_PATH,
        receiptBytes: wrongBytes,
        rawContentBytes: RAW_CONTENT_BYTES,
      }),
    /receipt file hash does not match/,
  );

  assert.throws(
    () =>
      validateSourceIdentityVerificationWithAcquisitionReceipt(identity, {
        receiptPath: ACQUISITION_RECEIPT_PATH,
        receiptBytes,
        rawContentBytes: Buffer.from("different raw bytes"),
      }),
    /exact raw-content hash and size/,
  );
});

test("standalone identity seal cannot substitute for receipt bytes, locator or content size", () => {
  const fabricated = fixtureArtifact();
  fabricated.acquisitionReceipt.receiptId = "receipt.fabricated";
  fabricated.acquisitionReceipt.receiptSha256 = HASH.z!;
  fabricated.acquisitionReceipt.receiptFileSha256 = HASH.y!;
  fabricated.canonicalLocatorEvidence.evidenceSha256 = HASH.z!;
  fabricated.aiExecution.runs[0]!.acquisitionReceiptSha256 = HASH.z!;
  const resealedFabrication = reseal(fabricated);
  assert.doesNotThrow(() =>
    validateSourceIdentityVerificationArtifact(resealedFabrication),
  );
  assert.throws(
    () =>
      validateSourceIdentityVerificationWithAcquisitionReceipt(
        resealedFabrication,
        {
          receiptPath: ACQUISITION_RECEIPT_PATH,
          receiptBytes: acquisitionReceiptBytes(),
          rawContentBytes: RAW_CONTENT_BYTES,
        },
      ),
    /receipt file hash does not match/,
  );

  const sizeDrift = fixtureArtifact();
  sizeDrift.extractionBinding.rawContentSizeBytes += 1;
  const resealedSizeDrift = reseal(sizeDrift);
  assert.throws(
    () =>
      validateSourceIdentityVerificationWithAcquisitionReceipt(
        resealedSizeDrift,
        {
          receiptPath: ACQUISITION_RECEIPT_PATH,
          receiptBytes: acquisitionReceiptBytes(),
          rawContentBytes: RAW_CONTENT_BYTES,
        },
      ),
    /exact raw-content hash and size/,
  );

  const driftedReceipt = acquisitionReceiptFixture();
  driftedReceipt.requestedLocator =
    "https://authority.example/reports/other.pdf";
  driftedReceipt.finalLocator = "https://authority.example/reports/other.pdf";
  const { receiptSha256: _oldSeal, ...driftedReceiptBody } = driftedReceipt;
  const sealedDriftedReceipt = sealSourceAcquisitionReceipt(driftedReceiptBody);
  const driftedReceiptBytes = acquisitionReceiptBytes(
    sealedDriftedReceipt as ControlledHttpsFetchReceipt,
  );
  const locatorDrift = fixtureArtifact();
  locatorDrift.acquisitionReceipt.receiptSha256 =
    sealedDriftedReceipt.receiptSha256;
  locatorDrift.acquisitionReceipt.receiptFileSha256 =
    sourceIdentitySha256(driftedReceiptBytes);
  locatorDrift.canonicalLocatorEvidence.evidenceSha256 =
    sealedDriftedReceipt.receiptSha256;
  locatorDrift.aiExecution.runs[0]!.acquisitionReceiptSha256 =
    sealedDriftedReceipt.receiptSha256;
  const resealedLocatorDrift = reseal(locatorDrift);
  assert.throws(
    () =>
      validateSourceIdentityVerificationWithAcquisitionReceipt(
        resealedLocatorDrift,
        {
          receiptPath: ACQUISITION_RECEIPT_PATH,
          receiptBytes: driftedReceiptBytes,
          rawContentBytes: RAW_CONTENT_BYTES,
        },
      ),
    /requested and final identity locators/,
  );
});

test("accepts either an official URL or a controlled private locator", () => {
  const privateArtifact = fixtureArtifact();
  const privateReceipt = privateAcquisitionReceiptFixture();
  const privateReceiptPath =
    "knowledge/corpus/source-acquisition-receipts/receipts/example-report.private.v1.json";
  const privateReceiptBytes = Buffer.from(
    `${JSON.stringify(privateReceipt, null, 2)}\n`,
  );
  privateArtifact.candidateIdentity.candidateLocator = {
    kind: "controlled_private_locator",
    locator: "private://corpus/sha256/example-report.pdf",
  };
  privateArtifact.acquisitionReceipt = {
    receiptId: privateReceipt.receiptId,
    receiptVersion: privateReceipt.receiptVersion,
    receiptType: privateReceipt.acquisitionType,
    receiptPath: privateReceiptPath,
    receiptFileSha256: sourceIdentitySha256(privateReceiptBytes),
    receiptSha256: privateReceipt.receiptSha256,
  };
  privateArtifact.aiExecution.runs[0]!.acquisitionReceiptSha256 =
    privateReceipt.receiptSha256;
  privateArtifact.canonicalLocatorEvidence = {
    kind: "controlled_private_locator",
    locatorId: "locator.private.report",
    locator: "private://corpus/sha256/example-report.pdf",
    accessClass: "controlled_private",
    accessVerifiedAt: privateReceipt.completedAt,
    manifestSha256: privateReceipt.recoveryManifest.manifestReceiptSha256,
    evidenceSha256: privateReceipt.receiptSha256,
  };
  const locatorDimension = privateArtifact.matchDimensions.find(
    (item) => item.dimension === "canonical_locator",
  )!;
  locatorDimension.expectedValue = "private://corpus/sha256/example-report.pdf";
  locatorDimension.observedValue = "private://corpus/sha256/example-report.pdf";
  const sealed = reseal(privateArtifact);
  assertStructuralParity(sealed, true);
  assert.equal(
    requireVerifiedSourceIdentity(sealed).decision.state,
    "verified",
  );
  assert.equal(
    validateSourceIdentityVerificationWithAcquisitionReceipt(sealed, {
      receiptPath: privateReceiptPath,
      receiptBytes: privateReceiptBytes,
      rawContentBytes: RAW_CONTENT_BYTES,
    }).acquisitionProvenanceValidated,
    true,
  );
});

test("keeps database identity separate from an exact official locator", () => {
  const artifact = fixtureArtifact();
  assert.equal(artifact.candidateIdentity.identityKind, "database_record");
  assert.equal(
    artifact.candidateIdentity.canonicalIdentity,
    "document:cmpp-example-report",
  );
  assert.deepEqual(artifact.candidateIdentity.candidateLocator, {
    kind: "official_url",
    url: "https://authority.example/reports/example-2024.pdf",
  });
  const locatorMatch = artifact.matchDimensions.find(
    (item) => item.dimension === "canonical_locator",
  )!;
  assert.equal(locatorMatch.matchState, "exact_match");
  assert.equal(
    locatorMatch.expectedValue,
    "https://authority.example/reports/example-2024.pdf",
  );
  assert.equal(
    locatorMatch.observedValue,
    "https://authority.example/reports/example-2024.pdf",
  );
  assert.equal(
    requireVerifiedSourceIdentity(artifact).decision.verifiedIdentity
      .canonicalIdentity,
    "document:cmpp-example-report",
  );

  const urlDrift = structuredClone(artifact);
  assert.equal(urlDrift.canonicalLocatorEvidence.kind, "official_url");
  if (urlDrift.canonicalLocatorEvidence.kind === "official_url") {
    urlDrift.canonicalLocatorEvidence.url =
      "https://authority.example/reports/different.pdf";
  }
  assert.throws(
    () => validateSourceIdentityVerificationArtifact(urlDrift),
    /canonical_locator values drift from the bound candidate or observed evidence/,
  );
});

test("requires all seven explicit match dimensions exactly once", () => {
  const missing = structuredClone(fixtureArtifact());
  missing.matchDimensions.pop();
  assertStructuralParity(missing, false);

  const duplicate = structuredClone(fixtureArtifact());
  duplicate.matchDimensions[6]!.dimension = "title";
  assertStructuralParity(duplicate, true);
  assert.throws(
    () => validateSourceIdentityVerificationArtifact(duplicate),
    /identity-match dimensions must be unique/,
  );
});

test("rejects metadata, content, extraction and page-map drift", () => {
  const contentDrift = structuredClone(fixtureArtifact());
  contentDrift.extractionBinding.rawContentSha256 = HASH.z!;
  assert.throws(
    () => validateSourceIdentityVerificationArtifact(contentDrift),
    /raw-content hash must match/,
  );

  const pageDrift = structuredClone(fixtureArtifact());
  pageDrift.extractionBinding.mappedPageCount = 11;
  assert.throws(
    () => validateSourceIdentityVerificationArtifact(pageDrift),
    /page map must represent every expected page/,
  );

  const runDrift = structuredClone(fixtureArtifact());
  runDrift.aiExecution.runs[0]!.sourceMetadataSha256 = HASH.z!;
  assert.throws(
    () => validateSourceIdentityVerificationArtifact(runDrift),
    /drifted source metadata hash/,
  );

  const officialBytesDrift = structuredClone(fixtureArtifact());
  assert.equal(
    officialBytesDrift.canonicalLocatorEvidence.kind,
    "official_url",
  );
  if (officialBytesDrift.canonicalLocatorEvidence.kind === "official_url") {
    officialBytesDrift.canonicalLocatorEvidence.evidenceSha256 = HASH.z!;
  }
  assert.throws(
    () => validateSourceIdentityVerificationArtifact(officialBytesDrift),
    /canonical locator evidence must bind the referenced acquisition receipt seal/,
  );

  const detachedTitleMatch = structuredClone(fixtureArtifact());
  detachedTitleMatch.matchDimensions.find(
    (item) => item.dimension === "title",
  )!.observedValue = "A different but internally exact-looking value";
  assert.throws(
    () => validateSourceIdentityVerificationArtifact(detachedTitleMatch),
    /title (?:exact match must bind|values drift from)/,
  );
});

test("keeps provisional and rejected decisions from establishing verified identity", () => {
  const provisional = provisionalArtifact();
  const rejected = rejectedArtifact();
  assertStructuralParity(provisional, true);
  assertStructuralParity(rejected, true);
  assert.throws(
    () => requireVerifiedSourceIdentity(provisional),
    /provisional cannot establish/,
  );
  assert.throws(
    () => requireVerifiedSourceIdentity(rejected),
    /rejected cannot establish/,
  );
});

test("lets source analysis reference only the exact verified identity artifact", () => {
  const verified = fixtureArtifact();
  assert.doesNotThrow(() =>
    validateSourceAnalysisIdentityReference(
      analysisBindingFor(verified),
      verified,
    ),
  );

  const drifted = analysisBindingFor(verified);
  drifted.sourceIdentityVerificationArtifactSha256 = HASH.z!;
  assert.throws(
    () => validateSourceAnalysisIdentityReference(drifted, verified),
    /does not reference the exact verified identity artifact/,
  );

  const provisional = provisionalArtifact();
  const rejected = rejectedArtifact();
  assert.throws(
    () =>
      validateSourceAnalysisIdentityReference(
        analysisBindingFor(provisional),
        provisional,
      ),
    /provisional cannot establish verified identity/,
  );
  assert.throws(
    () =>
      validateSourceAnalysisIdentityReference(
        analysisBindingFor(rejected),
        rejected,
      ),
    /rejected cannot establish verified identity/,
  );
});

test("blocks verified decisions when a blocking mismatch remains open", () => {
  const rejected = rejectedArtifact();
  assert.equal(rejected.decision.state, "rejected");
  const invalid = structuredClone(
    rejected,
  ) as unknown as SourceIdentityVerificationArtifact;
  invalid.decision = fixtureArtifact().decision;
  assert.throws(
    () => validateSourceIdentityVerificationArtifact(invalid),
    /blocking-discrepancy count must match|cannot accept title match state/,
  );
});

test("permits a disclosed source-not-stated publisher only as an accepted non-blocking discrepancy", () => {
  const artifact = fixtureArtifact();
  artifact.observedMetadata.publisher = { state: "not_stated", value: null };
  const publisher = artifact.matchDimensions.find(
    (item) => item.dimension === "publisher",
  )!;
  publisher.observedValue = null;
  publisher.matchState = "source_not_stated";
  publisher.discrepancyIds = ["discrepancy.publisher.not.stated"];
  artifact.discrepancies = [
    {
      discrepancyId: "discrepancy.publisher.not.stated",
      dimension: "publisher",
      severity: "non_blocking",
      status: "accepted_for_identity",
      statement:
        "The source does not state a publisher, while the official authority locator fixes provenance.",
      expectedValue: "Example Food Authority",
      observedValue: null,
      evidenceAnchorIds: ["anchor.cover", "anchor.official"],
    },
  ];
  const sealed = reseal(artifact);
  assert.equal(
    requireVerifiedSourceIdentity(sealed).decision.state,
    "verified",
  );

  const open = structuredClone(sealed);
  open.discrepancies[0]!.status = "open";
  assert.throws(
    () => validateSourceIdentityVerificationArtifact(open),
    /verified identity may retain only accepted non-blocking discrepancies/,
  );
});

test("permits publisher and date observed in the source but absent from the corpus candidate", () => {
  const artifact = fixtureArtifact();
  artifact.candidateIdentity.candidatePublisher = null;
  artifact.candidateIdentity.candidatePublicationDate = null;
  const publisher = artifact.matchDimensions.find(
    (item) => item.dimension === "publisher",
  )!;
  publisher.expectedValue = null;
  publisher.matchState = "candidate_not_stated";
  publisher.discrepancyIds = ["discrepancy.publisher.candidate.missing"];
  const date = artifact.matchDimensions.find(
    (item) => item.dimension === "publication_date",
  )!;
  date.expectedValue = null;
  date.matchState = "candidate_not_stated";
  date.discrepancyIds = ["discrepancy.date.candidate.missing"];
  artifact.discrepancies = [
    {
      discrepancyId: "discrepancy.publisher.candidate.missing",
      dimension: "publisher",
      severity: "non_blocking",
      status: "accepted_for_identity",
      statement:
        "The official source states a publisher that is absent from the provisional corpus metadata.",
      expectedValue: null,
      observedValue: "Example Food Authority",
      evidenceAnchorIds: ["anchor.cover"],
    },
    {
      discrepancyId: "discrepancy.date.candidate.missing",
      dimension: "publication_date",
      severity: "non_blocking",
      status: "accepted_for_identity",
      statement:
        "The source states a publication date that is absent from the provisional corpus metadata.",
      expectedValue: null,
      observedValue: "2025-03-15",
      evidenceAnchorIds: ["anchor.cover"],
    },
  ];
  const sealed = reseal(artifact);
  assert.equal(
    requireVerifiedSourceIdentity(sealed).decision.state,
    "verified",
  );
});

test("never permits candidate-not-stated for locator, content or extraction evidence", () => {
  for (const dimensionName of [
    "canonical_locator",
    "content_hash",
    "extraction_binding",
  ] as const) {
    const artifact = fixtureArtifact();
    const dimension = artifact.matchDimensions.find(
      (item) => item.dimension === dimensionName,
    )!;
    const observedValue = dimension.observedValue;
    dimension.expectedValue = null;
    dimension.matchState = "candidate_not_stated";
    dimension.discrepancyIds = [
      `discrepancy.${dimensionName}.candidate.missing`,
    ];
    artifact.discrepancies = [
      {
        discrepancyId: `discrepancy.${dimensionName}.candidate.missing`,
        dimension: dimensionName,
        severity: "non_blocking",
        status: "accepted_for_identity",
        statement:
          "This attempted absence exception is forbidden for a mandatory identity-binding dimension.",
        expectedValue: null,
        observedValue,
        evidenceAnchorIds: [...dimension.evidenceAnchorIds],
      },
    ];
    assert.throws(
      () => reseal(artifact),
      new RegExp(
        `${dimensionName} values drift|verified identity cannot accept`,
      ),
    );
  }
});

test("uses an explicit runtime sentinel instead of inventing a model build", () => {
  const artifact = fixtureArtifact();
  assert.equal(
    artifact.aiExecution.runs[0]!.modelVersionState,
    "runtime_not_exposed",
  );
  assert.equal(
    artifact.aiExecution.runs[0]!.modelVersion,
    MODEL_VERSION_NOT_EXPOSED,
  );
  assert.equal(
    artifact.aiExecution.runs[0]!.timeEvidence,
    "coordinator_observed_window",
  );

  const fabricated = structuredClone(artifact) as unknown as Record<
    string,
    unknown
  >;
  const execution = fabricated.aiExecution as Record<string, unknown>;
  const runs = execution.runs as Array<Record<string, unknown>>;
  runs[0]!.modelVersion = "invented-build-id";
  assertStructuralParity(fabricated, false);

  const falseExact = structuredClone(artifact) as unknown as Record<
    string,
    unknown
  >;
  const exactExecution = falseExact.aiExecution as Record<string, unknown>;
  const exactRuns = exactExecution.runs as Array<Record<string, unknown>>;
  exactRuns[0]!.modelVersionState = "exact";
  assertStructuralParity(falseExact, false);

  const exact = structuredClone(artifact);
  const run = exact.aiExecution.runs[0]!;
  run.modelVersionState = "exact";
  run.modelVersion = "provider-build-2026-08-03";
  assertStructuralParity(reseal(exact), true);
});

test("never promotes role, review, rights, publication or coverage", () => {
  const promoted = structuredClone(fixtureArtifact()) as unknown as Record<
    string,
    unknown
  >;
  const boundaries = promoted.downstreamBoundaries as Record<string, unknown>;
  boundaries.coveragePromotionAllowed = true;
  assertStructuralParity(promoted, false);
});

test("binds the caller expected lifecycle and source hashes exactly", () => {
  const artifact = fixtureArtifact();
  assert.doesNotThrow(() =>
    validateSourceIdentityVerificationBinding(artifact, artifact.binding),
  );
  const drifted = { ...artifact.binding, sourceContentSha256: HASH.z! };
  assert.throws(
    () => validateSourceIdentityVerificationBinding(artifact, drifted),
    /does not match the exact expected lifecycle\/source hash binding/,
  );
});

test("rejects unknown fields and detects payload or artifact-seal drift", () => {
  const unknown = structuredClone(fixtureArtifact()) as unknown as Record<
    string,
    unknown
  >;
  const metadata = unknown.observedMetadata as Record<string, unknown>;
  metadata.untrackedGuess = "not allowed";
  assertStructuralParity(unknown, false);

  const payloadDrift = structuredClone(fixtureArtifact());
  payloadDrift.decision.reason =
    "The sealed decision explanation was changed after the recorded AI output was produced.";
  assert.throws(
    () => validateSourceIdentityVerificationArtifact(payloadDrift),
    /verification payload hash does not match/,
  );

  const sealDrift = structuredClone(fixtureArtifact());
  sealDrift.artifactSha256 = HASH.z!;
  assert.throws(
    () => validateSourceIdentityVerificationArtifact(sealDrift),
    /artifact hash does not match/,
  );
});

export const sourceIdentityVerificationFixture = fixtureArtifact;
export const provisionalSourceIdentityVerificationFixture = provisionalArtifact;
export const rejectedSourceIdentityVerificationFixture = rejectedArtifact;
