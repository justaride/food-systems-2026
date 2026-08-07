import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  buildSourceRegistrationPlan,
  parseSourceRegistrationArgs,
  type PreparedSourceRegistrationTarget,
  type SourceRegistrationArtifactFile,
  type SourceRegistrationDbInspection,
} from "../../scripts/knowledge/generate-source-registration-plan";
import {
  SOURCE_ACQUISITION_RECEIPT_SCHEMA_VERSION,
  SOURCE_ACQUISITION_RECEIPT_VERSION,
  sealSourceAcquisitionReceipt,
} from "../../src/lib/knowledge/source-acquisition-receipt";
import {
  SOURCE_REGISTRATION_DOCUMENT_CONTENT_SERIALIZATION,
  canonicalDocumentIdentityKey,
  lifecycleSourceIdForIdentity,
  parseSourceRegistrationBatch,
  sourceRegistrationBareSha256,
  sourceRegistrationContractSha256,
  sourceRegistrationSha256,
  validateSourceRegistrationPlan,
  type DocumentSnapshotRow,
  type LibrarySnapshotRow,
  type SourceRegistrationBatch,
  type SourceRegistrationPlan,
} from "../../src/lib/knowledge/source-registration-plan";

const OBSERVED_AT = "2026-08-03T12:00:00.000Z";
const UUID = "11111111-1111-4111-8111-111111111111";

const jsonSchema = JSON.parse(
  readFileSync(
    "knowledge/schema/source-registration-plan.schema.v1.json",
    "utf8",
  ),
) as object;
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateJsonSchema = ajv.compile(jsonSchema);

function hash(label: string): string {
  return sourceRegistrationSha256(`source-registration-test:${label}`);
}

function binding(path: string, label: string) {
  return { path, fileSha256: hash(label), sizeBytes: 100 + label.length };
}

function batchFixture(): SourceRegistrationBatch {
  return parseSourceRegistrationBatch(
    JSON.parse(
      readFileSync(
        "knowledge/corpus/source-registration/source-registration-batch-2026-08-02.v1.json",
        "utf8",
      ),
    ),
  );
}

function preparedTargetsFixture(
  batch: SourceRegistrationBatch,
): PreparedSourceRegistrationTarget[] {
  return batch.targets.map((target, index) => {
    const acquisitionReceipt = sealSourceAcquisitionReceipt({
      schemaVersion: SOURCE_ACQUISITION_RECEIPT_SCHEMA_VERSION,
      artifactType: "source_acquisition_receipt",
      receiptId: `receipt.source.registration.test.${index + 1}`,
      receiptVersion: SOURCE_ACQUISITION_RECEIPT_VERSION,
      sourceId: target.preRegistrationCandidateKey.replace(/^candidate:/, ""),
      acquisitionType: "controlled_https_fetch",
      requestedLocator: target.source.officialUrl,
      finalLocator: target.source.officialUrl,
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
        contentLengthBytes: target.source.rawContentSizeBytes,
        bodySizeBytes: target.source.rawContentSizeBytes,
        bodySha256: `sha256:${target.source.rawContentSha256}`,
        observedAt: "2026-08-03T10:01:00Z",
      },
      tool: {
        name: "source-registration-test-fetch",
        version: "1.0.0",
        workflowRef:
          "knowledge/corpus/workflows/controlled-source-acquisition-v1.md",
        workflowVersion: "1.0.0",
      },
      startedAt: "2026-08-03T10:00:00Z",
      completedAt: "2026-08-03T10:02:00Z",
    });
    const pageMapPath = `knowledge/corpus/pdf-page-extraction/page-maps/${target.source.rawContentSha256}.page-map.v1.json`;
    const extractionReceiptPath = `knowledge/corpus/pdf-page-extraction/receipts/${target.source.rawContentSha256}.receipt.v1.json`;
    const inputPath = `knowledge/corpus/source-analysis-input-manifests/manifests/${target.source.rawContentSha256}.source-analysis-input-manifest.v1.json`;
    return {
      target,
      acquisitionReceipt,
      evidence: {
        acquisitionReceipt: {
          ...binding(
            target.source.acquisitionReceiptPath,
            `acquisition-${index}`,
          ),
          internalSealType: "source_acquisition_receipt_sha256",
          internalSeal: acquisitionReceipt.receiptSha256,
        },
        extractionReceipt: {
          ...binding(extractionReceiptPath, `extraction-${index}`),
          internalSealType: "pdf_qualification_receipt_sha256",
          internalSeal: hash(`extraction-seal-${index}`),
        },
        pageMap: {
          ...binding(pageMapPath, `page-map-${index}`),
          internalSealType: "pdf_page_map_sha256",
          internalSeal: hash(`page-map-seal-${index}`),
        },
        sourceAnalysisInputManifest: {
          ...binding(inputPath, `input-${index}`),
          internalSealType: "source_analysis_input_manifest_sha256",
          internalSeal: hash(`input-seal-${index}`),
        },
        privateVerification: {
          rawPdfPortablePath: `sha256/${target.source.rawContentSha256}.pdf`,
          rawPageTextPortablePathTemplate: `pdf-page-extraction/v1/sha256/${target.source.rawContentSha256}/pages/page-{pageNumber:0000}.raw.txt`,
          normalizedPagePortablePathTemplate: `pdf-page-extraction/v1/sha256/${target.source.rawContentSha256}/pages/page-{pageNumber:0000}.normalized.txt`,
          pageCount: target.source.pageCount,
          rawPageTextFileCountPerCopy: target.source.pageCount,
          normalizedPageFileCountPerCopy: target.source.pageCount,
          rawPdfSha256: `sha256:${target.source.rawContentSha256}`,
          rawPageTextSetSha256: hash(`raw-set-${index}`),
          normalizedPageSetSha256: hash(`normalized-set-${index}`),
          primaryCopyVerified: true,
          replicaCopyVerified: true,
          distinctRootsVerified: true,
          distinctFilesVerified: true,
          rootMode: "0700",
          fileMode: "0400",
          absoluteRootsStoredInPlan: false,
        },
      },
      contentBinding: {
        source: "exact_private_normalized_pages",
        serializationId: SOURCE_REGISTRATION_DOCUMENT_CONTENT_SERIALIZATION.id,
        charset: "utf-8",
        pageOrder: "ascending_page_number",
        pageSequence: "contiguous_from_1",
        delimiterUtf8:
          SOURCE_REGISTRATION_DOCUMENT_CONTENT_SERIALIZATION.delimiterUtf8,
        sha256: hash(`document-content-${index}`),
        sizeBytes: 1_000 + index,
        characterCount: 900 + index,
        wordCount: 100 + index,
        pageCount: target.source.pageCount,
        contentValueStoredInPlan: false,
        privateAbsolutePathStoredInPlan: false,
      },
    };
  });
}

function inputBindingsFixture(): SourceRegistrationPlan["inputBindings"] {
  return {
    sourceRegistrationBatch: binding(
      "knowledge/corpus/source-registration/source-registration-batch-2026-08-02.v1.json",
      "registration-batch",
    ),
    sourceAcquisitionBatch: binding(
      "knowledge/corpus/source-acquisition-receipts/source-acquisition-batch-new-official-2026-08-02.v1.json",
      "acquisition-batch",
    ),
    pdfExtractionBatch: binding(
      "knowledge/corpus/pdf-page-extraction/pdf-page-extraction-batch-2026-08-02.v1.json",
      "extraction-batch",
    ),
    sourceAnalysisInputGenerationManifest: binding(
      "knowledge/corpus/source-analysis-input-manifests/source-analysis-input-generation-manifest.v1.json",
      "input-generation",
    ),
    sourceRegistrationContract: binding(
      "knowledge/corpus/SOURCE-REGISTRATION-PLAN-CONTRACT.md",
      "contract",
    ),
    sourceRegistrationJsonSchema: binding(
      "knowledge/schema/source-registration-plan.schema.v1.json",
      "schema",
    ),
    sourceRegistrationRuntime: binding(
      "src/lib/knowledge/source-registration-plan.ts",
      "runtime",
    ),
    sourceRegistrationGenerator: binding(
      "scripts/knowledge/generate-source-registration-plan.ts",
      "generator",
    ),
    databaseSchema: binding("prisma/schema.prisma", "database-schema"),
  };
}

function databaseInspectionFixture(
  overrides: Partial<SourceRegistrationDbInspection> = {},
): SourceRegistrationDbInspection {
  return {
    observedAt: OBSERVED_AT,
    transaction: {
      readOnly: true,
      isolationLevel: "RepeatableRead",
      transactionReadOnlySetting: "on",
      databaseRole: "foodsystems_test_reader",
      serverVersion: "17.5",
    },
    databaseIdentity: { key: "primary", identityUuid: UUID },
    completedMigrationLedger: { count: 1, sha256: hash("migrations") },
    coreCounts: {
      documents: 1_555,
      libraryAnalysisRecords: 1_555,
      controlledMutationAudits: 1,
    },
    documentRows: [],
    libraryRows: [],
    ...overrides,
  };
}

function privateRegisterFixture(candidates: unknown[] = []) {
  return {
    schemaVersion: "1.0.0",
    registerId: "corpus-private-recovery-candidates.v1",
    captureRecordedOn: "2026-08-02",
    purpose: "Test-only metadata register without source text.",
    storageVerificationContract: {},
    candidates,
  };
}

function privateRegisterFileFixture(): SourceRegistrationArtifactFile {
  const bytes = Buffer.from("{}\n");
  return {
    path: "knowledge/corpus/corpus-private-recovery-candidates.v1.json",
    bytes,
    fileSha256Bare: sourceRegistrationBareSha256(bytes),
    fileSha256: sourceRegistrationSha256(bytes),
    sizeBytes: bytes.length,
    value: {},
  };
}

function pendingPlanFixture() {
  const batch = batchFixture();
  const preparedTargets = preparedTargetsFixture(batch);
  return {
    batch,
    preparedTargets,
    plan: buildSourceRegistrationPlan({
      batch,
      preparedTargets,
      inputBindings: inputBindingsFixture(),
      databaseInspection: databaseInspectionFixture(),
      privateRecoveryRegister: privateRegisterFixture() as never,
      privateRecoveryRegisterFile: privateRegisterFileFixture(),
    }),
  };
}

function documentSnapshotFromPlan(
  plan: SourceRegistrationPlan,
  index: number,
): DocumentSnapshotRow {
  const target = plan.targets[index]!.intendedDocumentRow;
  return {
    id: target.id,
    slug: target.slug,
    filePath: target.filePath,
    title: target.title,
    author: target.author,
    year: target.year,
    documentType: target.documentType,
    category: target.category,
    subcategory: target.subcategory,
    country: target.country,
    url: target.url,
    accessedAt: target.accessedAt,
    archivedUrl: target.archivedUrl,
    wordCount: target.wordCount,
    tags: target.tags,
    createdAt: "2026-08-03T11:00:00.000Z",
    updatedAt: "2026-08-03T11:00:00.000Z",
    contentSha256: target.contentBinding.sha256,
    contentSizeBytes: target.contentBinding.sizeBytes,
    summarySha256: null,
    metadataSha256: hash("metadata-safe-fingerprint"),
    targetDataSha256: target.targetDataSha256,
    rowSha256: hash(`document-row-${index}`),
    collisionFields: ["filePath", "id", "slug", "url"],
  };
}

function librarySnapshotFromPlan(
  plan: SourceRegistrationPlan,
  index: number,
): LibrarySnapshotRow {
  const target = plan.targets[index]!.intendedLibraryAnalysisRow;
  return {
    id: target.id,
    sourceKind: target.sourceKind,
    sourceKey: target.sourceKey,
    documentId: target.documentId,
    sourceDocId: target.sourceDocId,
    canonicalPath: target.canonicalPath,
    title: target.title,
    status: target.status,
    usageRule: target.usageRule,
    reviewStatus: target.reviewStatus,
    citationReadiness: target.citationReadiness,
    analysisTier: target.analysisTier,
    contentHash: target.contentHash,
    wordCount: target.wordCount,
    processedAt: null,
    reviewedAt: null,
    reviewer: null,
    createdAt: "2026-08-03T11:00:00.000Z",
    updatedAt: "2026-08-03T11:00:00.000Z",
    riskFlags: [...target.riskFlags],
    aiCardSha256: null,
    aiSummarySha256: null,
    keyFindingsSha256: hash("empty-key-findings"),
    claimCandidatesSha256: null,
    projectImplicationsSha256: hash("empty-project-implications"),
    gapsSha256: null,
    controlLinksSha256: hash("safe-control-links"),
    targetDataSha256: target.targetDataSha256,
    rowSha256: hash(`library-row-${index}`),
    collisionFields: [
      "canonicalPath",
      "contentHash",
      "documentId",
      "id",
      "sourceKey",
    ],
  };
}

test("builds one deterministic, schema-valid and non-executable pending plan", () => {
  const first = pendingPlanFixture();
  const second = buildSourceRegistrationPlan({
    batch: first.batch,
    preparedTargets: first.preparedTargets,
    inputBindings: inputBindingsFixture(),
    databaseInspection: databaseInspectionFixture(),
    privateRecoveryRegister: privateRegisterFixture() as never,
    privateRecoveryRegisterFile: privateRegisterFileFixture(),
  });
  assert.deepEqual(second, first.plan);
  assert.equal(first.plan.contractSha256, sourceRegistrationContractSha256());
  assert.equal(first.plan.summary.pendingCount, 10);
  assert.equal(first.plan.summary.alreadyRegisteredCount, 0);
  assert.equal(first.plan.summary.conflictCount, 0);
  assert.equal(first.plan.summary.privateRecoveryAppendCount, 10);
  assert.equal(first.plan.executionBoundary.databaseMutationPerformed, false);
  assert.equal(first.plan.executionBoundary.applyCliEnabled, false);
  assert.equal(
    first.plan.releaseGates.ownerScopeAuthorization.exactPlanHashReviewed,
    false,
  );
  assert.equal(
    first.plan.releaseGates.exactPlanAuthorization.state,
    "not_recorded",
  );
  assert.doesNotThrow(() => validateSourceRegistrationPlan(first.plan));
  assert.equal(
    Boolean(validateJsonSchema(first.plan)),
    true,
    JSON.stringify(validateJsonSchema.errors),
  );
  const serialized = JSON.stringify(first.plan);
  assert.equal(serialized.includes("/Users/"), false);
  assert.equal(serialized.includes("/Volumes/"), false);
  assert.equal(serialized.includes("SENSITIVE SOURCE TEXT"), false);
});

test("derives stable canonical identities and lifecycle source IDs", () => {
  const identity = canonicalDocumentIdentityKey("official-fi-etmv-annual-2025");
  assert.equal(identity, "document:official-fi-etmv-annual-2025");
  assert.match(
    lifecycleSourceIdForIdentity(identity),
    /^source\.[a-f0-9]{24}$/,
  );
  assert.equal(
    lifecycleSourceIdForIdentity(identity),
    lifecycleSourceIdForIdentity(identity),
  );
  assert.throws(() => lifecycleSourceIdForIdentity("candidate:source.example"));
});

test("distinguishes exact already-registered rows from mixed or drifting state", () => {
  const base = pendingPlanFixture();
  const exact = buildSourceRegistrationPlan({
    batch: base.batch,
    preparedTargets: base.preparedTargets,
    inputBindings: inputBindingsFixture(),
    databaseInspection: databaseInspectionFixture({
      documentRows: [documentSnapshotFromPlan(base.plan, 0)],
      libraryRows: [librarySnapshotFromPlan(base.plan, 0)],
    }),
    privateRecoveryRegister: privateRegisterFixture() as never,
    privateRecoveryRegisterFile: privateRegisterFileFixture(),
  });
  assert.equal(exact.summary.alreadyRegisteredCount, 1);
  assert.equal(exact.summary.pendingCount, 9);
  assert.equal(exact.summary.conflictCount, 0);

  const driftedDocument = documentSnapshotFromPlan(base.plan, 0);
  driftedDocument.targetDataSha256 = hash("drifted-document-target");
  const conflict = buildSourceRegistrationPlan({
    batch: base.batch,
    preparedTargets: base.preparedTargets,
    inputBindings: inputBindingsFixture(),
    databaseInspection: databaseInspectionFixture({
      documentRows: [driftedDocument],
      libraryRows: [],
    }),
    privateRecoveryRegister: privateRegisterFixture() as never,
    privateRecoveryRegisterFile: privateRegisterFileFixture(),
  });
  assert.equal(conflict.summary.conflictCount, 1);
  assert.equal(conflict.targets[0]!.state, "conflict");
  assert.ok(
    conflict.targets[0]!.conflicts.some(
      (item) => item.code === "document_collision",
    ),
  );
  assert.ok(
    conflict.targets[0]!.conflicts.some(
      (item) => item.code === "partial_registration_state",
    ),
  );
});

test("rejects plan resealing, unknown fields and summary promotion", () => {
  const { plan } = pendingPlanFixture();
  const drifted = structuredClone(plan);
  drifted.targets[0]!.permissions.sourceAnalysisAllowed = true as false;
  assert.throws(() => validateSourceRegistrationPlan(drifted));

  const summaryDrift = structuredClone(plan);
  summaryDrift.summary.pendingCount = 9;
  assert.throws(
    () => validateSourceRegistrationPlan(summaryDrift),
    /self-hash mismatch|summary mismatch/,
  );

  const unknown = structuredClone(plan) as unknown as Record<string, unknown>;
  unknown.unreviewedApplyAuthority = true;
  assert.equal(Boolean(validateJsonSchema(unknown)), false);
});

test("batch parsing rejects duplicate identities and unstable tag order", () => {
  const batch = batchFixture();
  const duplicate = structuredClone(batch);
  duplicate.targets[1]!.document.id = duplicate.targets[0]!.document.id;
  assert.throws(
    () => parseSourceRegistrationBatch(duplicate),
    /duplicate Document IDs/,
  );

  const tags = structuredClone(batch);
  tags.targets[0]!.document.tags.reverse();
  assert.throws(
    () => parseSourceRegistrationBatch(tags),
    /tags must be sorted/,
  );
});

test("CLI rejects apply before roots or database access and requires explicit roots", () => {
  assert.throws(
    () => parseSourceRegistrationArgs(["--apply"]),
    /--apply is disabled/,
  );
  assert.throws(
    () => parseSourceRegistrationArgs(["--dry-run"]),
    /primary-corpus-root/,
  );
  assert.throws(
    () =>
      parseSourceRegistrationArgs([
        "--dry-run",
        "--primary-corpus-root=relative/private",
        "--replica-corpus-root=/private/replica",
      ]),
    /explicit absolute directory/,
  );
  assert.deepEqual(
    parseSourceRegistrationArgs([
      "--dry-run",
      "--primary-corpus-root=/private/primary",
      "--replica-corpus-root=/private/replica",
    ]),
    {
      manifestPath:
        "knowledge/corpus/source-registration/source-registration-batch-2026-08-02.v1.json",
      primaryCorpusRoot: "/private/primary",
      replicaCorpusRoot: "/private/replica",
      outputPath: null,
    },
  );
});
