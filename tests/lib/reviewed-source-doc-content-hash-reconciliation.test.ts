import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST,
  REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST_SHA256,
  PINNED_REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST_SHA256,
  reviewedSourceDocContentHashManifestContract,
} from "../../src/lib/citations/reviewed-source-doc-content-hash-reconciliation";
import { REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS } from "../../src/lib/citations/reviewed-source-doc-identity-repair";
import {
  REVIEWED_SOURCE_DOC_CONTENT_HASH_APPLY_ACK,
  REVIEWED_SOURCE_DOC_CONTENT_HASH_CONTRACT_SHA256,
  assertReviewedSourceDocContentHashApplyable,
  assertReviewedSourceDocContentHashPostApply,
  buildReviewedSourceDocContentHashPlan,
  classifyReviewedSourceDocContentHashFile,
  fullReviewedSourceDocContentHashDocumentWhere,
  fullReviewedSourceDocContentHashLibraryWhere,
  inspectReviewedSourceDocContentHashFiles,
  parseReviewedSourceDocContentHashArgs,
  reviewedSourceDocContentHashDocumentUpdateData,
  reviewedSourceDocContentHashLibraryUpdateData,
  reviewedSourceDocContentHashPlanSha256,
  type ReviewedSourceDocContentHashDependencyCollections,
  type ReviewedSourceDocContentHashDocumentRow,
  type ReviewedSourceDocContentHashLibraryRow,
} from "../../scripts/reconcile-reviewed-source-doc-content-hashes";
import { portableSourceDocIdentityToDatabaseRow } from "../../scripts/apply-reviewed-source-doc-identity-repair";

const databaseIdentity = {
  currentDatabase: "foodsystems",
  key: "primary" as const,
  identityUuid: "90e3e24d-230f-42f7-b178-5bcd5b861e84",
  createdAt: "2026-07-20T00:00:00.000Z",
};
const createdAt = new Date("2026-05-19T23:52:33.339Z");
const beforeUpdatedAt = new Date("2026-07-20T01:17:35.937Z");
const afterUpdatedAt = new Date("2026-07-20T04:00:00.000Z");

function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function documentFixture(
  index: number,
  state: "before" | "after",
): ReviewedSourceDocContentHashDocumentRow {
  const entry = REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST[index]!;
  return {
    id: entry.documentId,
    slug: `reviewed-content-${entry.sourceDocId}`,
    filePath: entry.documentFilePath,
    title: `Protected title ${entry.sourceDocId}`,
    author: `Protected author ${entry.sourceDocId}`,
    year: 2023,
    documentType: "bibliotek",
    category: "research",
    subcategory: "official",
    country: index === 0 ? "NO" : "FI",
    content:
      state === "before" ? entry.beforeFileBytes : entry.afterFileBytes,
    summary: entry.documentSummary,
    url: entry.reviewedLocator,
    accessedAt: new Date("2026-07-20T00:00:00.000Z"),
    archivedUrl: null,
    wordCount: 321 + index,
    tags: ["protected", entry.sourceDocId],
    metadata: { protected: true, sourceDocId: entry.sourceDocId },
    createdAt: new Date(createdAt.getTime() + index),
    updatedAt: state === "before" ? beforeUpdatedAt : afterUpdatedAt,
  };
}

function libraryFixture(
  index: number,
  state: "before" | "after",
): ReviewedSourceDocContentHashLibraryRow {
  const entry = REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST[index]!;
  return {
    id: entry.libraryAnalysisRecordId,
    sourceKind: "document",
    sourceKey: `document:${entry.documentId}`,
    documentId: entry.documentId,
    sourceDocId: entry.sourceDocId,
    canonicalPath: entry.documentFilePath,
    title: `Protected analysis ${entry.sourceDocId}`,
    status: "approved_internal",
    usageRule: "safe_for_ai_context",
    reviewStatus: "not_required",
    citationReadiness: "citable",
    analysisTier: "deep_analysis",
    aiCard: { protected: true, nested: { sourceDocId: entry.sourceDocId } },
    aiSummary: `Protected AI summary ${entry.sourceDocId}`,
    keyFindings: [`Protected finding ${entry.sourceDocId}`],
    claimCandidates: { protected: true },
    projectImplications: [`Protected implication ${entry.sourceDocId}`],
    gaps: { protected: true },
    controlLinks: { protected: true },
    riskFlags: ["protected"],
    contentHash:
      state === "before"
        ? entry.beforeLibraryContentHash
        : entry.afterLibraryContentHash,
    wordCount: 321 + index,
    processedAt: new Date("2026-07-19T19:39:54.950Z"),
    reviewedAt: new Date("2026-07-20T00:00:00.000Z"),
    reviewer: "reviewer",
    createdAt: new Date(createdAt.getTime() + index),
    updatedAt: state === "before" ? beforeUpdatedAt : afterUpdatedAt,
  };
}

function fileStates(state: "before" | "after") {
  return REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST.map((entry) =>
    classifyReviewedSourceDocContentHashFile(
      entry,
      Buffer.from(
        state === "before" ? entry.beforeFileBytes : entry.afterFileBytes,
        "utf8",
      ),
    ),
  );
}

function collections(
  state: "before" | "after",
): ReviewedSourceDocContentHashDependencyCollections {
  return {
    sourceDocs: REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST.map((entry) => {
      const repair = REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS.find(
        (candidate) => candidate.id === entry.sourceDocId,
      )!;
      return portableSourceDocIdentityToDatabaseRow(
        repair.after,
        entry.documentId,
      );
    }),
    documents: REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST.map((_, index) =>
      documentFixture(index, state),
    ),
    libraryAnalysisRecords:
      REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST.map((_, index) =>
        libraryFixture(index, state),
      ),
    sourceCitations: [],
    fieldCitations: [],
    evidenceAppraisals: [],
    documentRefs: [],
    sourceRefs: [
      { id: "source-ref-2", note: "protected second" },
      { id: "source-ref-1", note: "protected first" },
    ],
    mediaEntries: [],
    sourceDocInsightLinks: [],
    insights: [],
    producerCitationConsumers: [],
    opportunitySourceConsumers: [],
    reportDocumentConsumers: [],
    thesisDocumentConsumers: [],
    insightDocumentRefs: [],
    companyDocumentRefs: [],
    actorDocumentRefs: [],
  };
}

function inspection(
  files: "before" | "after",
  database: "before" | "after",
) {
  return buildReviewedSourceDocContentHashPlan({
    databaseIdentity,
    files: fileStates(files),
    collections: collections(database),
  });
}

describe("reviewed SourceDoc content/hash reconciliation", () => {
  it("pins exactly src-16/src-24 bytes, reviewed locators, and LAR formula", () => {
    assert.equal(
      REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST_SHA256,
      PINNED_REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST_SHA256,
    );
    assert.match(REVIEWED_SOURCE_DOC_CONTENT_HASH_CONTRACT_SHA256, /^[a-f0-9]{64}$/);
    assert.deepEqual(
      REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST.map((entry) => entry.sourceDocId),
      ["src-16", "src-24"],
    );
    assert.deepEqual(
      REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST.map((entry) => [
        entry.sourceDocId,
        entry.beforeFileByteLength,
        entry.afterFileByteLength,
        entry.beforeFileSha256,
        entry.afterFileSha256,
      ]),
      [
        [
          "src-16",
          1746,
          1861,
          "74554e79852571a3cb986311d4b6b559330e393b798a5d33499052eeb1e1e032",
          "b7718cee84a2a10e01c55b1f0d67d99a1a3c14deba6bca9ecc21015ef0f393d0",
        ],
        [
          "src-24",
          1722,
          1777,
          "578fc6aacf5d05fb1cf54e269a91a43537ae562d1f4f3a4c36a64578091592b3",
          "f0e032c1c16644ac2c0f5aaa92eae6bfd0c94e075b4c51ace7400275e330bea6",
        ],
      ],
    );
    for (const entry of REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST) {
      const repair = REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS.find(
        (candidate) => candidate.id === entry.sourceDocId,
      )!;
      assert.equal(entry.reviewedLocator, repair.after.url);
      assert.equal(entry.insertedLine, `**URL:** ${entry.reviewedLocator}`);
      assert.equal(
        entry.afterFileBytes,
        entry.beforeFileBytes.replace(
          `${entry.insertionAnchor}\n`,
          `${entry.insertionAnchor}\n${entry.insertedLine}\n`,
        ),
      );
      assert.equal(entry.afterFileBytes.split(entry.insertedLine).length - 1, 1);
      assert.equal(Buffer.byteLength(entry.beforeFileBytes), entry.beforeFileByteLength);
      assert.equal(Buffer.byteLength(entry.afterFileBytes), entry.afterFileByteLength);
      assert.equal(sha256(entry.beforeFileBytes), entry.beforeFileSha256);
      assert.equal(sha256(entry.afterFileBytes), entry.afterFileSha256);
      assert.equal(
        sha256(`${entry.documentSummary}\n\n${entry.beforeFileBytes}`),
        entry.beforeLibraryContentHash,
      );
      assert.equal(
        sha256(`${entry.documentSummary}\n\n${entry.afterFileBytes}`),
        entry.afterLibraryContentHash,
      );
    }
    assert.deepEqual(
      reviewedSourceDocContentHashManifestContract().map((entry) => [
        entry.beforeFileBytesSha256,
        entry.afterFileBytesSha256,
        entry.beforeLarFormulaSha256,
        entry.afterLarFormulaSha256,
      ]),
      REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST.map((entry) => [
        entry.beforeFileSha256,
        entry.afterFileSha256,
        entry.beforeLibraryContentHash,
        entry.afterLibraryContentHash,
      ]),
    );
  });

  it("classifies the two current canonical Markdown files as exact after bytes", () => {
    const files = inspectReviewedSourceDocContentHashFiles(process.cwd());
    assert.deepEqual(
      files.map(({ sourceDocId, state, byteLength, sha256: digest }) => [
        sourceDocId,
        state,
        byteLength,
        digest,
      ]),
      REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST.map((entry) => [
        entry.sourceDocId,
        "after",
        entry.afterFileByteLength,
        entry.afterFileSha256,
      ]),
    );
  });

  it("defaults to dry-run and rejects ambiguous arguments", () => {
    assert.deepEqual(parseReviewedSourceDocContentHashArgs([]), {
      apply: false,
      ack: undefined,
      expectedPlanSha256: undefined,
    });
    assert.deepEqual(
      parseReviewedSourceDocContentHashArgs([
        "--apply",
        `--ack=${REVIEWED_SOURCE_DOC_CONTENT_HASH_APPLY_ACK}`,
        `--plan-sha256=${"a".repeat(64)}`,
      ]),
      {
        apply: true,
        ack: REVIEWED_SOURCE_DOC_CONTENT_HASH_APPLY_ACK,
        expectedPlanSha256: "a".repeat(64),
      },
    );
    assert.throws(
      () => parseReviewedSourceDocContentHashArgs(["--apply", "--dry-run"]),
      /mutually exclusive/,
    );
    assert.throws(
      () => parseReviewedSourceDocContentHashArgs(["--ack=no"]),
      /valid only with --apply/,
    );
    assert.throws(
      () => parseReviewedSourceDocContentHashArgs(["--apply", "--apply"]),
      /must not be repeated/,
    );
    assert.throws(
      () => parseReviewedSourceDocContentHashArgs(["--unknown"]),
      /Unknown reviewed SourceDoc content\/hash argument/,
    );
  });

  it("classifies all-before, the sole recoverable transition, and idempotent all-after", () => {
    const allBefore = inspection("before", "before");
    assert.equal(allBefore.plan.transition, "all_before");
    assert.equal(allBefore.plan.summary.pendingDatabaseRows, 4);
    assert.throws(
      () => assertReviewedSourceDocContentHashApplyable(allBefore),
      /files_after_db_before/,
    );

    const recoverable = inspection("after", "before");
    assert.equal(recoverable.plan.fileAtomicState, "all_after");
    assert.equal(recoverable.plan.databaseAtomicState, "all_before");
    assert.equal(recoverable.plan.transition, "files_after_db_before");
    assert.doesNotThrow(() =>
      assertReviewedSourceDocContentHashApplyable(recoverable),
    );

    const allAfter = inspection("after", "after");
    assert.equal(allAfter.plan.transition, "all_after");
    assert.equal(allAfter.plan.summary.appliedDatabaseRows, 4);
    assert.throws(
      () => assertReviewedSourceDocContentHashApplyable(allAfter),
      /files_after_db_before/,
    );
    assert.doesNotThrow(() =>
      assertReviewedSourceDocContentHashPostApply(recoverable, allAfter),
    );
  });

  it("fails closed on filesystem, DB, and cross-boundary hybrids", () => {
    const mixedFiles = fileStates("after");
    mixedFiles[0] = fileStates("before")[0]!;
    const fileHybrid = buildReviewedSourceDocContentHashPlan({
      databaseIdentity,
      files: mixedFiles,
      collections: collections("before"),
    });
    assert.equal(fileHybrid.plan.transition, "conflict");
    assert.ok(
      fileHybrid.plan.conflicts.some((item) => item.code === "file_atomic_hybrid"),
      JSON.stringify(fileHybrid.plan.conflicts),
    );

    const mixedDatabase = collections("before");
    mixedDatabase.documents[0] = documentFixture(0, "after");
    mixedDatabase.libraryAnalysisRecords[0] = libraryFixture(0, "after");
    const databaseHybrid = buildReviewedSourceDocContentHashPlan({
      databaseIdentity,
      files: fileStates("after"),
      collections: mixedDatabase,
    });
    assert.equal(databaseHybrid.plan.transition, "conflict");
    assert.ok(
      databaseHybrid.plan.conflicts.some(
        (item) => item.code === "database_atomic_hybrid",
      ),
      JSON.stringify(databaseHybrid.plan.conflicts),
    );

    const crossBoundary = inspection("before", "after");
    assert.equal(crossBoundary.plan.transition, "conflict");
    assert.ok(
      crossBoundary.plan.conflicts.some(
        (item) => item.code === "cross_boundary_hybrid",
      ),
      JSON.stringify(crossBoundary.plan.conflicts),
    );
  });

  it("rejects exact SourceDoc, Document, LAR binding, summary, content, and hash drift", () => {
    const cases: Array<{
      code: string;
      mutate: (value: ReviewedSourceDocContentHashDependencyCollections) => void;
    }> = [
      {
        code: "source_doc_identity_drift",
        mutate: (value) => {
          value.sourceDocs[0]!.url = "https://example.test/drift";
        },
      },
      {
        code: "document_snapshot_drift",
        mutate: (value) => {
          value.documents[0]!.filePath = "bibliotek/wrong.md";
        },
      },
      {
        code: "document_snapshot_drift",
        mutate: (value) => {
          value.documents[0]!.summary += " drift";
        },
      },
      {
        code: "document_snapshot_drift",
        mutate: (value) => {
          value.documents[0]!.content += " drift";
        },
      },
      {
        code: "library_analysis_snapshot_drift",
        mutate: (value) => {
          value.libraryAnalysisRecords[0]!.sourceKey = "document:wrong";
        },
      },
      {
        code: "library_analysis_snapshot_drift",
        mutate: (value) => {
          value.libraryAnalysisRecords[0]!.contentHash = "0".repeat(64);
        },
      },
    ];
    for (const testCase of cases) {
      const value = collections("before");
      testCase.mutate(value);
      const result = buildReviewedSourceDocContentHashPlan({
        databaseIdentity,
        files: fileStates("after"),
        collections: value,
      });
      assert.equal(result.plan.transition, "conflict", testCase.code);
      assert.ok(
        result.plan.conflicts.some((item) => item.code === testCase.code),
        `${testCase.code}: ${JSON.stringify(result.plan.conflicts)}`,
      );
    }
  });

  it("updates only Document.content and LAR.contentHash using full-row CAS", () => {
    const document = documentFixture(0, "before");
    const library = libraryFixture(0, "before");
    const entry = REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST[0]!;
    assert.deepEqual(
      Object.keys(reviewedSourceDocContentHashDocumentUpdateData(entry)),
      ["content"],
    );
    assert.deepEqual(
      Object.keys(reviewedSourceDocContentHashLibraryUpdateData(entry)),
      ["contentHash"],
    );
    const documentWhere = fullReviewedSourceDocContentHashDocumentWhere(document);
    const libraryWhere = fullReviewedSourceDocContentHashLibraryWhere(library);
    assert.deepEqual(Object.keys(documentWhere), Object.keys(document));
    assert.deepEqual(Object.keys(libraryWhere), Object.keys(library));
    assert.deepEqual(
      (documentWhere.tags as { equals: string[] }).equals,
      document.tags,
    );
    assert.deepEqual(
      (documentWhere.metadata as { equals: unknown }).equals,
      document.metadata,
    );
    assert.deepEqual(
      (libraryWhere.keyFindings as { equals: string[] }).equals,
      library.keyFindings,
    );
    assert.deepEqual(
      (libraryWhere.claimCandidates as { equals: unknown }).equals,
      library.claimCandidates,
    );
  });

  it("binds plan SHA to DatabaseIdentity and the normalized dependency closure", () => {
    const baseline = inspection("after", "before");
    const digest = reviewedSourceDocContentHashPlanSha256(baseline);
    assert.match(digest, /^[a-f0-9]{64}$/);

    const reordered = collections("before");
    reordered.sourceRefs.reverse();
    assert.equal(
      reviewedSourceDocContentHashPlanSha256(
        buildReviewedSourceDocContentHashPlan({
          databaseIdentity,
          files: fileStates("after"),
          collections: reordered,
        }),
      ),
      digest,
    );
    assert.deepEqual(baseline.plan.dependencyIds.sourceRefs, [
      "source-ref-1",
      "source-ref-2",
    ]);

    const changedIdentity = buildReviewedSourceDocContentHashPlan({
      databaseIdentity: {
        ...databaseIdentity,
        identityUuid: "67a6e709-dcbf-490f-af95-0de00ba6240c",
      },
      files: fileStates("after"),
      collections: collections("before"),
    });
    assert.notEqual(reviewedSourceDocContentHashPlanSha256(changedIdentity), digest);

    const dependencyDrift = collections("before");
    dependencyDrift.sourceRefs[0]!.note = "changed protected dependency";
    const changedDependency = buildReviewedSourceDocContentHashPlan({
      databaseIdentity,
      files: fileStates("after"),
      collections: dependencyDrift,
    });
    assert.notEqual(
      changedDependency.plan.preservedDependencySha256,
      baseline.plan.preservedDependencySha256,
    );
    assert.notEqual(reviewedSourceDocContentHashPlanSha256(changedDependency), digest);
  });

  it("post proof rejects protected-row, DatabaseIdentity, and inventory drift", () => {
    const before = inspection("after", "before");

    const protectedRows = collections("after");
    protectedRows.documents[0]!.title = "Protected title drift";
    const protectedDrift = buildReviewedSourceDocContentHashPlan({
      databaseIdentity,
      files: fileStates("after"),
      collections: protectedRows,
    });
    assert.equal(protectedDrift.plan.transition, "all_after");
    assert.throws(
      () => assertReviewedSourceDocContentHashPostApply(before, protectedDrift),
      /Post-apply/,
    );

    const identityDrift = buildReviewedSourceDocContentHashPlan({
      databaseIdentity: {
        ...databaseIdentity,
        identityUuid: "67a6e709-dcbf-490f-af95-0de00ba6240c",
      },
      files: fileStates("after"),
      collections: collections("after"),
    });
    assert.throws(
      () => assertReviewedSourceDocContentHashPostApply(before, identityDrift),
      /Post-apply/,
    );

    const inventoryRows = collections("after");
    inventoryRows.evidenceAppraisals.push({ id: "new-dependent-row" });
    const inventoryDrift = buildReviewedSourceDocContentHashPlan({
      databaseIdentity,
      files: fileStates("after"),
      collections: inventoryRows,
    });
    assert.throws(
      () => assertReviewedSourceDocContentHashPostApply(before, inventoryDrift),
      /Post-apply/,
    );
  });

  it("pins writer-blocking locks, Serializable reinspection, rollback, and update-only writes", () => {
    const runner = readFileSync(
      "scripts/reconcile-reviewed-source-doc-content-hashes.ts",
      "utf8",
    );
    assert.match(runner, /current_database\(\)/);
    assert.match(runner, /to_regclass\('public\."DatabaseIdentity"'\)/);
    assert.match(runner, /WHERE "key" = 'primary'/);
    assert.match(runner, /pg_advisory_xact_lock/);
    assert.match(runner, /IN SHARE ROW EXCLUSIVE MODE/);
    assert.match(runner, /FOR SHARE/);
    assert.match(runner, /isolationLevel: "Serializable"/);
    assert.equal(
      (
        runner.match(
          /inspectReviewedSourceDocContentHashDatabaseState\(transaction\)/g,
        ) ?? []
      ).length,
      2,
    );
    assert.match(runner, /transaction rolled back and zero DB rows were committed/);
    assert.match(runner, /files_after_db_before/);
    for (const table of [
      "DatabaseIdentity",
      "SourceDoc",
      "Document",
      "LibraryAnalysisRecord",
      "SourceCitation",
      "FieldCitation",
      "EvidenceAppraisal",
      "DocumentRef",
      "SourceRef",
      "MediaEntry",
      "Insight",
      "Producer",
      "OpportunityEntry",
      "Report",
      "Thesis",
      "InsightDocumentRef",
      "CompanyDocumentRef",
      "ActorDocumentRef",
      "_InsightSourceDoc",
    ]) {
      assert.match(runner, new RegExp(`"${table}"`));
    }
    assert.equal((runner.match(/\.updateMany\(/g) ?? []).length, 2);
    assert.doesNotMatch(
      runner,
      /\.(?:create|createMany|delete|deleteMany|upsert)\(/,
    );
    assert.doesNotMatch(runner, /sourceDoc\.update/);
    assert.doesNotMatch(
      runner,
      /\b(?:writeFile|writeFileSync|appendFile|rename|unlink|rmSync)\s*\(/,
    );
    assert.match(runner, /readFileSync/);
  });
});
