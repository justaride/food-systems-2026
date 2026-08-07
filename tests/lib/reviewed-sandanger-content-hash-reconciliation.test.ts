import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  PINNED_REVIEWED_SANDANGER_CONTENT_HASH_MANIFEST_SHA256,
  REVIEWED_SANDANGER_CONTENT_HASH_MANIFEST,
  REVIEWED_SANDANGER_CONTENT_HASH_MANIFEST_SHA256,
  reviewedSandangerContentHashManifestContract,
} from "../../src/lib/citations/reviewed-sandanger-content-hash-reconciliation";
import { REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS } from "../../src/lib/citations/reviewed-thesis-bibliographic-repair";
import {
  REVIEWED_SANDANGER_CONTENT_HASH_APPLY_ACK,
  REVIEWED_SANDANGER_CONTENT_HASH_CONTRACT_SHA256,
  assertReviewedSandangerContentHashApplyable,
  assertReviewedSandangerContentHashPostApply,
  buildReviewedSandangerContentHashPlan,
  classifyReviewedSandangerFile,
  fullReviewedSandangerDocumentWhere,
  fullReviewedSandangerLibraryWhere,
  inspectReviewedSandangerFile,
  parseReviewedSandangerContentHashArgs,
  reviewedSandangerContentHashPlanSha256,
  reviewedSandangerDocumentUpdateData,
  reviewedSandangerLibraryUpdateData,
  type ReviewedSandangerDependencyCollections,
  type ReviewedSandangerDocumentRow,
  type ReviewedSandangerLibraryRow,
} from "../../scripts/reconcile-reviewed-sandanger-content-hash";
import { portableThesisBibliographyToDatabaseRow } from "../../scripts/apply-reviewed-thesis-bibliographic-repair";

const entry = REVIEWED_SANDANGER_CONTENT_HASH_MANIFEST;
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

function thesisFixture() {
  const repair = REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.find(
    (candidate) => candidate.id === entry.thesisId,
  )!;
  return portableThesisBibliographyToDatabaseRow(repair.after, entry.documentId);
}

function documentFixture(
  state: "before" | "after",
): ReviewedSandangerDocumentRow {
  return {
    id: entry.documentId,
    slug: "sandanger-2012-summary",
    filePath: entry.documentFilePath,
    title: entry.documentTitle,
    author: null,
    year: null,
    documentType: "thesis",
    category: "bibliotek",
    subcategory: "akademia/masteroppgaver",
    country: null,
    content:
      state === "before" ? entry.beforeFileBytes : entry.afterFileBytes,
    summary: entry.documentSummary,
    url: entry.reviewedLocator,
    accessedAt: new Date("2026-07-20T00:00:00.000Z"),
    archivedUrl: null,
    wordCount: 139,
    tags: ["emv", "pricing"],
    metadata: { curated: true, entityReview: "open" },
    createdAt,
    updatedAt: state === "before" ? beforeUpdatedAt : afterUpdatedAt,
  };
}

function libraryFixture(
  state: "before" | "after",
): ReviewedSandangerLibraryRow {
  return {
    id: entry.libraryAnalysisRecordId,
    sourceKind: "document",
    sourceKey: `document:${entry.documentId}`,
    documentId: entry.documentId,
    sourceDocId: null,
    canonicalPath: entry.documentFilePath,
    title: entry.openEntityReview.title,
    status: entry.openEntityReview.status,
    usageRule: entry.openEntityReview.usageRule,
    reviewStatus: entry.openEntityReview.reviewStatus,
    citationReadiness: entry.openEntityReview.citationReadiness,
    analysisTier: entry.openEntityReview.analysisTier,
    aiCard: {
      status: "review_required",
      claimCandidates: [],
      keyFindings: ["Triage flag: low_text_quality"],
      nested: { protected: true },
    },
    aiSummary: `${entry.documentTitle} er triagert som document med 139 ord i lokalt grunnlag.`,
    keyFindings: [...entry.openEntityReview.keyFindings],
    claimCandidates: [...entry.openEntityReview.claimCandidates],
    projectImplications: [
      "Kilden kan brukes som intern bakgrunn etter review av status og lokator.",
    ],
    gaps: [{ kind: "needs_text_extraction", note: "low_text_quality" }],
    controlLinks: [
      { href: `/bibliotek/${entry.documentId}`, label: "Bibliotek" },
    ],
    riskFlags: [...entry.openEntityReview.riskFlags],
    contentHash:
      state === "before"
        ? entry.beforeLibraryContentHash
        : entry.afterLibraryContentHash,
    wordCount: 139,
    processedAt: new Date("2026-07-19T19:39:54.950Z"),
    reviewedAt: null,
    reviewer: null,
    createdAt,
    updatedAt: state === "before" ? beforeUpdatedAt : afterUpdatedAt,
  };
}

function fileState(state: "before" | "after") {
  return classifyReviewedSandangerFile(
    entry,
    Buffer.from(
      state === "before" ? entry.beforeFileBytes : entry.afterFileBytes,
      "utf8",
    ),
  );
}

function collections(
  state: "before" | "after",
): ReviewedSandangerDependencyCollections {
  return {
    theses: [thesisFixture()],
    documents: [documentFixture(state)],
    libraryAnalysisRecords: [libraryFixture(state)],
    sourceCitations: [],
    fieldCitations: [],
    evidenceAppraisals: [],
    documentRefs: [
      { id: "document-ref-2", note: "protected second" },
      { id: "document-ref-1", note: "protected first" },
    ],
    insightDocumentRefs: [],
    companyDocumentRefs: [],
    actorDocumentRefs: [],
    sourceDocBindings: [],
    reportBindings: [],
    insightCitationConsumers: [],
    producerCitationConsumers: [],
  };
}

function inspection(
  file: "before" | "after",
  database: "before" | "after",
) {
  return buildReviewedSandangerContentHashPlan({
    databaseIdentity,
    file: fileState(file),
    collections: collections(database),
  });
}

describe("reviewed Sandanger content/hash reconciliation", () => {
  it("pins exact one-line URL bytes, reviewed identity, and LAR formula", () => {
    assert.equal(
      REVIEWED_SANDANGER_CONTENT_HASH_MANIFEST_SHA256,
      PINNED_REVIEWED_SANDANGER_CONTENT_HASH_MANIFEST_SHA256,
    );
    assert.match(REVIEWED_SANDANGER_CONTENT_HASH_CONTRACT_SHA256, /^[a-f0-9]{64}$/);
    assert.equal(entry.thesisId, "sandanger-2012");
    assert.equal(entry.documentId, "cmp8xyjjg005ivvvmu3hu9n2h");
    assert.equal(entry.libraryAnalysisRecordId, "cmqjoevzb005hzpvm456wtzc1");
    assert.equal(entry.beforeFileByteLength, 1159);
    assert.equal(entry.afterFileByteLength, 1139);
    assert.equal(
      entry.beforeFileSha256,
      "9ba03e12bce5bcdbeddd635a67e4f404960b26913212700cc8b7a09d8ccf297b",
    );
    assert.equal(
      entry.afterFileSha256,
      "3fe17396a9a65bf93f74bb81ac9c247b200bee011810f608103f42426b55908e",
    );
    assert.equal(
      entry.afterFileBytes,
      entry.beforeFileBytes.replace(entry.oldUrlLine, entry.reviewedUrlLine),
    );
    assert.equal(entry.beforeFileBytes.split(entry.oldUrlLine).length - 1, 1);
    assert.equal(entry.afterFileBytes.split(entry.reviewedUrlLine).length - 1, 1);
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
    const repair = REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.find(
      (candidate) => candidate.id === entry.thesisId,
    )!;
    assert.equal(repair.after.url, entry.reviewedLocator);
    assert.equal(repair.after.title, entry.reviewedThesisTitle);
    const contract = reviewedSandangerContentHashManifestContract();
    assert.equal(contract.beforeFileBytesSha256, entry.beforeFileSha256);
    assert.equal(contract.afterFileBytesSha256, entry.afterFileSha256);
    assert.equal(contract.beforeLarFormulaSha256, entry.beforeLibraryContentHash);
    assert.equal(contract.afterLarFormulaSha256, entry.afterLibraryContentHash);
  });

  it("classifies the current canonical Markdown as exact after bytes", () => {
    assert.deepEqual(inspectReviewedSandangerFile(process.cwd()), {
      thesisId: entry.thesisId,
      repositoryPath: entry.repositoryPath,
      state: "after",
      byteLength: entry.afterFileByteLength,
      sha256: entry.afterFileSha256,
    });
  });

  it("defaults to dry-run and rejects ambiguous arguments", () => {
    assert.deepEqual(parseReviewedSandangerContentHashArgs([]), {
      apply: false,
      ack: undefined,
      expectedPlanSha256: undefined,
    });
    assert.deepEqual(
      parseReviewedSandangerContentHashArgs([
        "--apply",
        `--ack=${REVIEWED_SANDANGER_CONTENT_HASH_APPLY_ACK}`,
        `--plan-sha256=${"a".repeat(64)}`,
      ]),
      {
        apply: true,
        ack: REVIEWED_SANDANGER_CONTENT_HASH_APPLY_ACK,
        expectedPlanSha256: "a".repeat(64),
      },
    );
    assert.throws(
      () => parseReviewedSandangerContentHashArgs(["--apply", "--dry-run"]),
      /mutually exclusive/,
    );
    assert.throws(
      () => parseReviewedSandangerContentHashArgs(["--ack=no"]),
      /valid only with --apply/,
    );
    assert.throws(
      () => parseReviewedSandangerContentHashArgs(["--apply", "--apply"]),
      /must not be repeated/,
    );
    assert.throws(
      () => parseReviewedSandangerContentHashArgs(["--unknown"]),
      /Unknown reviewed Sandanger content\/hash argument/,
    );
  });

  it("classifies all-before, the sole recoverable transition, and idempotent all-after", () => {
    const allBefore = inspection("before", "before");
    assert.equal(allBefore.plan.transition, "all_before");
    assert.equal(allBefore.plan.summary.pendingDatabaseRows, 2);
    assert.throws(
      () => assertReviewedSandangerContentHashApplyable(allBefore),
      /files_after_db_before/,
    );

    const recoverable = inspection("after", "before");
    assert.equal(recoverable.plan.transition, "files_after_db_before");
    assert.equal(recoverable.plan.target.openEntityReviewState, "open");
    assert.doesNotThrow(() =>
      assertReviewedSandangerContentHashApplyable(recoverable),
    );

    const allAfter = inspection("after", "after");
    assert.equal(allAfter.plan.transition, "all_after");
    assert.equal(allAfter.plan.summary.appliedDatabaseRows, 2);
    assert.throws(
      () => assertReviewedSandangerContentHashApplyable(allAfter),
      /files_after_db_before/,
    );
    assert.doesNotThrow(() =>
      assertReviewedSandangerContentHashPostApply(recoverable, allAfter),
    );
  });

  it("fails closed on file drift, DB hybrid, and cross-boundary hybrid", () => {
    const fileDrift = buildReviewedSandangerContentHashPlan({
      databaseIdentity,
      file: classifyReviewedSandangerFile(entry, Buffer.from("drift\n")),
      collections: collections("before"),
    });
    assert.equal(fileDrift.plan.transition, "conflict");
    assert.ok(
      fileDrift.plan.conflicts.some((item) => item.code === "file_bytes_drift"),
    );

    const hybridRows = collections("before");
    hybridRows.documents[0] = documentFixture("after");
    const databaseHybrid = buildReviewedSandangerContentHashPlan({
      databaseIdentity,
      file: fileState("after"),
      collections: hybridRows,
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

  it("rejects Thesis, scalar, content, binding, review, title, findings, claims, and hash drift", () => {
    const cases: Array<{
      code: string;
      mutate: (value: ReviewedSandangerDependencyCollections) => void;
    }> = [
      {
        code: "thesis_identity_drift",
        mutate: (value) => {
          value.theses[0]!.url = entry.oldLocator;
        },
      },
      {
        code: "document_scalar_drift",
        mutate: (value) => {
          value.documents[0]!.url = entry.oldLocator;
        },
      },
      {
        code: "document_content_drift",
        mutate: (value) => {
          value.documents[0]!.content += " drift";
        },
      },
      {
        code: "open_entity_review_drift",
        mutate: (value) => {
          value.libraryAnalysisRecords[0]!.sourceKey = "document:wrong";
        },
      },
      {
        code: "open_entity_review_drift",
        mutate: (value) => {
          value.libraryAnalysisRecords[0]!.reviewStatus = "not_required";
        },
      },
      {
        code: "open_entity_review_drift",
        mutate: (value) => {
          value.libraryAnalysisRecords[0]!.title = "changed";
        },
      },
      {
        code: "open_entity_review_drift",
        mutate: (value) => {
          value.libraryAnalysisRecords[0]!.keyFindings = ["changed"];
        },
      },
      {
        code: "open_entity_review_drift",
        mutate: (value) => {
          value.libraryAnalysisRecords[0]!.claimCandidates = [
            { claim: "forbidden" },
          ];
        },
      },
      {
        code: "library_content_hash_drift",
        mutate: (value) => {
          value.libraryAnalysisRecords[0]!.contentHash = "0".repeat(64);
        },
      },
    ];
    for (const testCase of cases) {
      const value = collections("before");
      testCase.mutate(value);
      const result = buildReviewedSandangerContentHashPlan({
        databaseIdentity,
        file: fileState("after"),
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
    const document = documentFixture("before");
    const library = libraryFixture("before");
    assert.deepEqual(Object.keys(reviewedSandangerDocumentUpdateData(entry)), [
      "content",
    ]);
    assert.deepEqual(Object.keys(reviewedSandangerLibraryUpdateData(entry)), [
      "contentHash",
    ]);
    const documentWhere = fullReviewedSandangerDocumentWhere(document);
    const libraryWhere = fullReviewedSandangerLibraryWhere(library);
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

  it("binds plan SHA to DatabaseIdentity and normalized dependency closure", () => {
    const baseline = inspection("after", "before");
    const digest = reviewedSandangerContentHashPlanSha256(baseline);
    assert.match(digest, /^[a-f0-9]{64}$/);

    const reordered = collections("before");
    reordered.documentRefs.reverse();
    assert.equal(
      reviewedSandangerContentHashPlanSha256(
        buildReviewedSandangerContentHashPlan({
          databaseIdentity,
          file: fileState("after"),
          collections: reordered,
        }),
      ),
      digest,
    );
    assert.deepEqual(baseline.plan.dependencyIds.documentRefs, [
      "document-ref-1",
      "document-ref-2",
    ]);

    const changedIdentity = buildReviewedSandangerContentHashPlan({
      databaseIdentity: {
        ...databaseIdentity,
        identityUuid: "67a6e709-dcbf-490f-af95-0de00ba6240c",
      },
      file: fileState("after"),
      collections: collections("before"),
    });
    assert.notEqual(reviewedSandangerContentHashPlanSha256(changedIdentity), digest);

    const dependencyRows = collections("before");
    dependencyRows.documentRefs[0]!.note = "changed protected dependency";
    const dependencyDrift = buildReviewedSandangerContentHashPlan({
      databaseIdentity,
      file: fileState("after"),
      collections: dependencyRows,
    });
    assert.notEqual(
      dependencyDrift.plan.preservedDependencySha256,
      baseline.plan.preservedDependencySha256,
    );
    assert.notEqual(reviewedSandangerContentHashPlanSha256(dependencyDrift), digest);
  });

  it("post proof rejects protected row, entity-review, identity, and inventory drift", () => {
    const before = inspection("after", "before");

    const protectedRows = collections("after");
    protectedRows.libraryAnalysisRecords[0]!.aiSummary += " drift";
    const protectedDrift = buildReviewedSandangerContentHashPlan({
      databaseIdentity,
      file: fileState("after"),
      collections: protectedRows,
    });
    assert.equal(protectedDrift.plan.transition, "all_after");
    assert.throws(
      () => assertReviewedSandangerContentHashPostApply(before, protectedDrift),
      /Post-apply/,
    );

    const reviewRows = collections("after");
    reviewRows.libraryAnalysisRecords[0]!.status = "approved_internal";
    const reviewDrift = buildReviewedSandangerContentHashPlan({
      databaseIdentity,
      file: fileState("after"),
      collections: reviewRows,
    });
    assert.equal(reviewDrift.plan.transition, "conflict");
    assert.throws(
      () => assertReviewedSandangerContentHashPostApply(before, reviewDrift),
      /Post-apply/,
    );

    const identityDrift = buildReviewedSandangerContentHashPlan({
      databaseIdentity: {
        ...databaseIdentity,
        identityUuid: "67a6e709-dcbf-490f-af95-0de00ba6240c",
      },
      file: fileState("after"),
      collections: collections("after"),
    });
    assert.throws(
      () => assertReviewedSandangerContentHashPostApply(before, identityDrift),
      /Post-apply/,
    );

    const inventoryRows = collections("after");
    inventoryRows.evidenceAppraisals.push({ id: "new-dependent-row" });
    const inventoryDrift = buildReviewedSandangerContentHashPlan({
      databaseIdentity,
      file: fileState("after"),
      collections: inventoryRows,
    });
    assert.throws(
      () => assertReviewedSandangerContentHashPostApply(before, inventoryDrift),
      /Post-apply/,
    );
  });

  it("pins writer-blocking locks, Serializable reinspection, rollback, and update-only writes", () => {
    const runner = readFileSync(
      "scripts/reconcile-reviewed-sandanger-content-hash.ts",
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
      (runner.match(/inspectReviewedSandangerDatabaseState\(transaction\)/g) ?? [])
        .length,
      2,
    );
    assert.match(runner, /transaction rolled back and zero DB rows were committed/);
    assert.match(runner, /files_after_db_before/);
    assert.match(runner, /closesEntityTypeReview: false/);
    for (const table of [
      "DatabaseIdentity",
      "Thesis",
      "Document",
      "LibraryAnalysisRecord",
      "SourceCitation",
      "FieldCitation",
      "EvidenceAppraisal",
      "DocumentRef",
      "InsightDocumentRef",
      "CompanyDocumentRef",
      "ActorDocumentRef",
      "SourceDoc",
      "Report",
      "Insight",
      "Producer",
    ]) {
      assert.match(runner, new RegExp(`"${table}"`));
    }
    assert.equal((runner.match(/\.updateMany\(/g) ?? []).length, 2);
    assert.doesNotMatch(
      runner,
      /\.(?:create|createMany|delete|deleteMany|upsert)\(/,
    );
    assert.doesNotMatch(runner, /thesis\.update/);
    assert.doesNotMatch(
      runner,
      /\b(?:writeFile|writeFileSync|appendFile|rename|unlink|rmSync)\s*\(/,
    );
    assert.match(runner, /readFileSync/);
  });
});
