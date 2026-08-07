import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  REVIEWED_THESIS_CITATION_MIRROR_MUTABLE_FIELDS,
  REVIEWED_THESIS_CITATION_REVERIFICATION_IDS,
  REVIEWED_THESIS_CITATION_REVERIFICATION_BEFORE_EVIDENCE,
  REVIEWED_THESIS_CITATION_REVERIFICATION_MUTABLE_FIELDS,
  REVIEWED_THESIS_GENERATED_DOCUMENT_IDS,
  REVIEWED_THESIS_GENERATED_DOCUMENT_MUTABLE_FIELDS,
  REVIEWED_THESIS_LIBRARY_ANALYSIS_MUTABLE_FIELDS,
  REVIEWED_THESIS_LIBRARY_ANALYSIS_MUTATION_IDS,
  REVIEWED_THESIS_MIRROR_RECONCILIATION_APPLY_ACK,
  REVIEWED_THESIS_MIRROR_RECONCILIATION_CONTRACT_SHA256,
  REVIEWED_THESIS_SANDANGER_SUMMARY_DOCUMENT_MUTABLE_FIELDS,
  REVIEWED_THESIS_SUMMARY_DOCUMENT_IDS,
  REVIEWED_THESIS_SUMMARY_DOCUMENT_MUTABLE_FIELDS,
  assertReviewedThesisMirrorPostApply,
  buildReviewedThesisMirrorPlan,
  fullReviewedThesisMirrorDocumentWhere,
  fullReviewedThesisMirrorLibraryAnalysisWhere,
  fullReviewedThesisMirrorSourceCitationWhere,
  parseReviewedThesisMirrorArgs,
  reviewedThesisCitationMirrorSnapshot,
  reviewedThesisCitationMutableFields,
  reviewedThesisCitationMirrorUpdateData,
  reviewedThesisDocumentMirrorSnapshot,
  reviewedThesisDocumentMirrorUpdateData,
  reviewedThesisLibraryAnalysisMirrorSnapshot,
  reviewedThesisLibraryAnalysisUpdateData,
  reviewedThesisMirrorContract,
  reviewedThesisMirrorPlanSha256,
  type ReviewedThesisMirrorCollections,
  type ReviewedThesisMirrorDocumentRow,
  type ReviewedThesisMirrorInspection,
  type ReviewedThesisMirrorLibraryAnalysisRow,
  type ReviewedThesisMirrorSourceCitationRow,
} from "../../scripts/reconcile-reviewed-thesis-bibliographic-mirrors";
import { portableThesisBibliographyToDatabaseRow } from "../../scripts/apply-reviewed-thesis-bibliographic-repair";
import { REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS } from "../../src/lib/citations/reviewed-thesis-bibliographic-repair";

const databaseIdentity = {
  currentDatabase: "foodsystems",
  databaseIdentityUuid: "90e3e24d-230f-42f7-b178-5bcd5b861e84",
};
const createdAt = new Date("2026-05-19T10:00:00.000Z");
const updatedAt = new Date("2026-07-19T10:00:00.000Z");
const afterUpdatedAt = new Date("2026-07-20T10:00:00.000Z");
const summaryIds = new Set<string>(REVIEWED_THESIS_SUMMARY_DOCUMENT_IDS);
const generatedIds = new Set<string>(REVIEWED_THESIS_GENERATED_DOCUMENT_IDS);
const mutableLibraryIds = new Set<string>(
  REVIEWED_THESIS_LIBRARY_ANALYSIS_MUTATION_IDS,
);
const citationReverificationIds = new Set<string>(
  REVIEWED_THESIS_CITATION_REVERIFICATION_IDS,
);
const needsReviewAliasIds = new Set([
  "sandanger-2012",
  "tallaksen-2022",
  "handlykken-2023",
]);

function documentId(thesisId: string) {
  return thesisId === "tesdal-2013" ? null : `document-${thesisId}`;
}

function documentFixture(
  thesisId: string,
  state: "before" | "after",
): ReviewedThesisMirrorDocumentRow {
  const repair = REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.find(
    (candidate) => candidate.id === thesisId,
  )!;
  const generated = generatedIds.has(thesisId);
  const mirror = reviewedThesisDocumentMirrorSnapshot(thesisId, state)!;
  const summaryTitle = `Curated summary for ${thesisId}`;
  return {
    id: documentId(thesisId)!,
    slug: `slug-${thesisId}`,
    filePath: `research/${thesisId}.md`,
    title: generated ? (mirror.title as string) : summaryTitle,
    author: generated ? (mirror.author as string) : `Summary author ${thesisId}`,
    year: generated ? (mirror.year as number) : 2000,
    documentType: generated ? "academic" : "thesis-summary",
    category: generated ? "evidence-pack" : "bibliotek",
    subcategory: "akademia",
    country: "NO",
    content: `Protected full content for ${thesisId}`,
    summary: `Protected summary for ${thesisId}`,
    url:
      thesisId === "sandanger-2012" || generated
        ? (mirror.url as string)
        : `https://example.test/preserved/${thesisId}`,
    accessedAt:
      mirror.accessedAt === null
        ? null
        : new Date(mirror.accessedAt as string),
    archivedUrl: `https://archive.test/${thesisId}`,
    wordCount: 100 + repair.after.year,
    tags: ["thesis", thesisId],
    metadata: generated
      ? {
          generatedFrom: "prisma/seed-data/theses.ts",
          protectedContentHash: `content-${thesisId}`,
        }
      : { curated: true, protectedContentHash: `content-${thesisId}` },
    createdAt,
    updatedAt: state === "before" ? updatedAt : afterUpdatedAt,
  };
}

function citationFixture(
  thesisId: string,
  state: "before" | "after",
): ReviewedThesisMirrorSourceCitationRow {
  const mirror = reviewedThesisCitationMirrorSnapshot(thesisId, state);
  const reverifyAfter =
    citationReverificationIds.has(thesisId) && state === "after";
  const needsReview = needsReviewAliasIds.has(thesisId) || reverifyAfter;
  const reverifyBeforeEvidence =
    citationReverificationIds.has(thesisId) && state === "before"
      ? REVIEWED_THESIS_CITATION_REVERIFICATION_BEFORE_EVIDENCE[
          thesisId as keyof typeof REVIEWED_THESIS_CITATION_REVERIFICATION_BEFORE_EVIDENCE
        ]
      : null;
  return {
    id: `citation-${thesisId}`,
    sourceClass: "secondary",
    citationReadiness: "citable_with_note",
    verificationStatus: needsReview ? "needs_review" : "machine_verified",
    citationText: mirror.citationText,
    title: mirror.title,
    publisher: mirror.publisher,
    author: mirror.author,
    year: mirror.year,
    url: mirror.url,
    archivedUrl:
      thesisId === "sandanger-2012" || reverifyAfter
        ? null
        : (reverifyBeforeEvidence?.archivedUrl ??
          `https://archive.test/citation/${thesisId}`),
    localPath: null,
    fileHash: null,
    contentHash: `citation-content-${thesisId}`,
    hashAlgorithm: "sha256",
    pageRef: null,
    quote: null,
    accessedAt:
      mirror.accessedAt === null ? null : new Date(mirror.accessedAt),
    captureMethod: "backfill-existing-locators",
    verifiedAt: needsReview
      ? null
      : new Date(
          reverifyBeforeEvidence?.verifiedAt ?? "2026-06-15T10:00:00.000Z",
        ),
    verifiedBy: needsReview || reverifyBeforeEvidence ? null : "machine",
    confidence: 95,
    notes: `Protected policy note ${thesisId}`,
    documentId: null,
    sourceDocId: null,
    createdAt,
    updatedAt: state === "before" ? updatedAt : afterUpdatedAt,
  };
}

function libraryFixture(
  thesisId: string,
  state: "before" | "after",
): ReviewedThesisMirrorLibraryAnalysisRow {
  const id = documentId(thesisId)!;
  const mirror = reviewedThesisLibraryAnalysisMirrorSnapshot(thesisId, state);
  const repair = REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.find(
    (candidate) => candidate.id === thesisId,
  )!;
  const visibleTitle = mutableLibraryIds.has(thesisId)
    ? repair[state].title
    : repair.after.title;
  return {
    id: `library-${thesisId}`,
    sourceKind: "document",
    sourceKey: `document:${id}`,
    documentId: id,
    sourceDocId: null,
    canonicalPath: `research/${thesisId}.md`,
    title:
      mirror?.title ??
      (generatedIds.has(thesisId)
        ? REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.find(
            (repair) => repair.id === thesisId,
          )!.after.title
        : `Curated summary for ${thesisId}`),
    status: "ai_draft",
    usageRule: "internal_background",
    reviewStatus: "not_required",
    citationReadiness: null,
    analysisTier: "triage_card",
    aiCard: {
      protected: thesisId,
      shortSummary: `Short analysis of ${visibleTitle}.`,
      nested: { mustRemain: true },
    },
    aiSummary: `Analysis of ${visibleTitle}. Protected conclusion.`,
    keyFindings: [`Protected finding ${thesisId}`],
    claimCandidates: { protected: true },
    projectImplications: [`Protected implication ${thesisId}`],
    gaps: { protected: true },
    controlLinks: { protected: true },
    riskFlags: ["protected"],
    contentHash: `lar-content-${thesisId}`,
    wordCount: 500,
    processedAt: new Date("2026-07-01T10:00:00.000Z"),
    reviewedAt: null,
    reviewer: null,
    createdAt,
    updatedAt:
      mutableLibraryIds.has(thesisId) && state === "after"
        ? afterUpdatedAt
        : updatedAt,
  };
}

function collections(
  state: "before" | "after",
): ReviewedThesisMirrorCollections {
  const theses = REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.map((repair) =>
    portableThesisBibliographyToDatabaseRow(
      repair.after,
      documentId(repair.id),
    ),
  );
  const boundIds = REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.filter(
    (repair) => documentId(repair.id) !== null,
  ).map((repair) => repair.id);
  return {
    theses,
    documents: boundIds.map((id) => documentFixture(id, state)),
    sourceCitations: REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.map((repair) =>
      citationFixture(repair.id, state),
    ),
    fieldCitations: REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.map(
      (repair, index) => ({
        id: `field-${repair.id}`,
        citationId: `citation-${repair.id}`,
        entityType: "Thesis",
        entityId: repair.id,
        fieldPath: "url",
        claimText: null,
        confidence: 0.95,
        createdAt: new Date(createdAt.getTime() + index),
      }),
    ),
    libraryAnalysisRecords: boundIds.map((id) => libraryFixture(id, state)),
    evidenceAppraisals: [],
    documentRefs: [
      {
        id: "document-ref-1",
        fromId: "document-sandanger-2012",
        toId: "external-document",
        refType: "supports",
      },
    ],
    insightDocumentRefs: [],
    companyDocumentRefs: [
      {
        id: "company-document-ref-1",
        companyId: "company-1",
        documentId: "document-granlund-lindskog-2024",
        context: "protected",
      },
    ],
    actorDocumentRefs: [],
    sourceDocBindings: [],
    reportBindings: [],
    insightCitationBindings: [],
    producerCitationBindings: [],
  };
}

function inspection(
  state: "before" | "after",
): ReviewedThesisMirrorInspection {
  return buildReviewedThesisMirrorPlan({
    databaseIdentity,
    collections: collections(state),
  });
}

describe("reviewed Thesis bibliographic mirror reconciliation", () => {
  it("pins a deterministic nine-target contract and the no-DOI-creation boundary", () => {
    assert.match(
      REVIEWED_THESIS_MIRROR_RECONCILIATION_CONTRACT_SHA256,
      /^[a-f0-9]{64}$/,
    );
    assert.equal(
      reviewedThesisMirrorContract().boundary.createsDoiSourceCitations,
      false,
    );
    assert.equal(
      reviewedThesisMirrorContract().boundary.createsDoiFieldCitations,
      false,
    );
    assert.equal(reviewedThesisMirrorContract().boundary.mutatesThesisRows, false);
    assert.equal(reviewedThesisMirrorContract().targetIds.length, 9);
    assert.equal(reviewedThesisMirrorContract().summaryDocumentIds.length, 4);
    assert.equal(reviewedThesisMirrorContract().generatedDocumentIds.length, 4);
    assert.equal(reviewedThesisMirrorContract().libraryAnalysisMutationIds.length, 3);
    assert.equal(reviewedThesisMirrorContract().citationReverificationIds.length, 2);
    assert.deepEqual(
      reviewedThesisMirrorContract().citationReverificationBeforeEvidence,
      REVIEWED_THESIS_CITATION_REVERIFICATION_BEFORE_EVIDENCE,
    );
    assert.equal(reviewedThesisMirrorContract().noDocumentIds.length, 1);
  });

  it("defaults to dry-run and requires unambiguous apply arguments", () => {
    assert.deepEqual(parseReviewedThesisMirrorArgs([]), {
      apply: false,
      ack: undefined,
      expectedPlanSha256: undefined,
    });
    assert.deepEqual(
      parseReviewedThesisMirrorArgs([
        "--apply",
        `--ack=${REVIEWED_THESIS_MIRROR_RECONCILIATION_APPLY_ACK}`,
        `--plan-sha256=${"a".repeat(64)}`,
      ]),
      {
        apply: true,
        ack: REVIEWED_THESIS_MIRROR_RECONCILIATION_APPLY_ACK,
        expectedPlanSha256: "a".repeat(64),
      },
    );
    assert.throws(
      () => parseReviewedThesisMirrorArgs(["--apply", "--dry-run"]),
      /mutually exclusive/,
    );
    assert.throws(
      () => parseReviewedThesisMirrorArgs(["--ack=no"]),
      /valid only with --apply/,
    );
    assert.throws(
      () => parseReviewedThesisMirrorArgs(["--apply", "--apply"]),
      /must not be repeated/,
    );
    assert.throws(
      () => parseReviewedThesisMirrorArgs(["--unknown"]),
      /Unknown reviewed Thesis mirror argument/,
    );
  });

  it("classifies exact all-before and all-after mirror states", () => {
    const before = inspection("before");
    const after = inspection("after");
    assert.equal(before.plan.atomicState, "all_before");
    assert.equal(
      after.plan.atomicState,
      "all_after",
      JSON.stringify({ conflicts: after.plan.conflicts, targets: after.plan.targets }),
    );
    assert.equal(before.plan.conflicts.length, 0);
    assert.equal(after.plan.conflicts.length, 0);
    assert.deepEqual(before.plan.summary, {
      targets: 9,
      citations: 9,
      documents: 8,
      libraryAnalysisRecords: 3,
      directLibraryAnalysisRecords: 8,
      pendingTargets: 9,
      appliedTargets: 0,
      conflicts: 0,
    });
    assert.equal(after.plan.summary.appliedTargets, 9);
    assert.notEqual(before.plan.dependencySha256, after.plan.dependencySha256);
    assert.equal(
      before.plan.preservedDependencySha256,
      after.plan.preservedDependencySha256,
    );
    assert.doesNotThrow(() =>
      assertReviewedThesisMirrorPostApply(before, after),
    );
    const nmbuBefore = before.plan.targets.find(
      (target) => target.thesisId === "nmbu-circular-vegetables-2022",
    )!;
    const nmbuAfter = after.plan.targets.find(
      (target) => target.thesisId === "nmbu-circular-vegetables-2022",
    )!;
    assert.equal(nmbuBefore.libraryAnalysisState, "protected_noop");
    assert.equal(nmbuAfter.libraryAnalysisState, "protected_noop");
    assert.equal(
      nmbuBefore.libraryAnalysisFullRowSha256,
      nmbuAfter.libraryAnalysisFullRowSha256,
    );
  });

  it("pins three exact legacy URL aliases and clears verification evidence only for two changed locators", () => {
    assert.equal(
      reviewedThesisCitationMirrorSnapshot("sandanger-2012", "before").url,
      "https://openaccess.nhh.no/nhh-xmlui/handle/11250/166778",
    );
    assert.equal(
      reviewedThesisCitationMirrorSnapshot("tallaksen-2022", "before").url,
      "https://uia.brage.unit.no/uia-xmlui/handle/11250/3008873",
    );
    assert.equal(
      reviewedThesisCitationMirrorSnapshot("handlykken-2023", "before").url,
      "https://oda.oslomet.no/oda-xmlui/handle/11250/3101983",
    );
    assert.equal(
      reviewedThesisCitationMirrorSnapshot("sandanger-2012", "after").url,
      "https://hdl.handle.net/11250/169513",
    );
    assert.equal(
      reviewedThesisCitationMirrorSnapshot("tallaksen-2022", "after").url,
      "https://hdl.handle.net/11250/3008873",
    );
    assert.equal(
      reviewedThesisCitationMirrorSnapshot("handlykken-2023", "after").url,
      "https://hdl.handle.net/11250/3101983",
    );

    for (const id of REVIEWED_THESIS_CITATION_REVERIFICATION_IDS) {
      const data = reviewedThesisCitationMirrorUpdateData(id);
      assert.equal(data.verificationStatus, "needs_review");
      assert.equal(data.verifiedAt, null);
      assert.equal(data.verifiedBy, null);
      assert.equal(data.archivedUrl, null);

      const evidenceDrift = collections("before");
      const citation = evidenceDrift.sourceCitations.find(
        (row) => row.id === `citation-${id}`,
      )!;
      citation.verifiedAt = new Date(citation.verifiedAt!.getTime() + 1);
      const driftPlan = buildReviewedThesisMirrorPlan({
        databaseIdentity,
        collections: evidenceDrift,
      });
      assert.equal(driftPlan.plan.atomicState, "conflict");
      assert.ok(
        driftPlan.plan.conflicts.some(
          (item) =>
            item.subject === id && item.code === "citation_policy_drift",
        ),
      );
    }
    for (const id of [
      "sandanger-2012",
      "tallaksen-2022",
      "handlykken-2023",
      "slu-house-crickets-2025",
    ]) {
      const data = reviewedThesisCitationMirrorUpdateData(id) as Record<
        string,
        unknown
      >;
      for (const field of
        REVIEWED_THESIS_CITATION_REVERIFICATION_MUTABLE_FIELDS) {
        assert.equal(field in data, false, `${id}:${field}`);
      }
    }
  });

  it("rejects a partial before/after hybrid", () => {
    const hybrid = collections("before");
    hybrid.sourceCitations[0] = citationFixture(
      REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS[0]!.id,
      "after",
    );
    const result = buildReviewedThesisMirrorPlan({
      databaseIdentity,
      collections: hybrid,
    });
    assert.equal(result.plan.atomicState, "conflict");
    assert.ok(
      result.plan.conflicts.some((item) => item.code === "atomic_hybrid"),
    );
  });

  it("fails closed on missing, duplicate, binding, generated-marker, Thesis, and citation-policy drift", () => {
    const cases: Array<{
      code: string;
      mutate: (value: ReviewedThesisMirrorCollections) => void;
    }> = [
      {
        code: "missing_url_field_citation",
        mutate: (value) => {
          value.fieldCitations = value.fieldCitations.slice(1);
        },
      },
      {
        code: "duplicate_url_field_citation",
        mutate: (value) => {
          value.fieldCitations.push({
            ...value.fieldCitations[0]!,
            id: "duplicate-field",
          });
        },
      },
      {
        code: "missing_document_binding",
        mutate: (value) => {
          value.theses.find((row) => row.id === "sandanger-2012")!.documentId =
            null;
        },
      },
      {
        code: "unexpected_document_binding",
        mutate: (value) => {
          value.theses.find((row) => row.id === "tesdal-2013")!.documentId =
            "document-tesdal-2013";
        },
      },
      {
        code: "generated_document_marker_drift",
        mutate: (value) => {
          value.documents.find(
            (row) => row.id === "document-bueso-bordils-2021",
          )!.metadata = { generatedFrom: "wrong" };
        },
      },
      {
        code: "thesis_not_reviewed_after",
        mutate: (value) => {
          value.theses[0]!.title = "drift";
        },
      },
      {
        code: "citation_policy_drift",
        mutate: (value) => {
          value.sourceCitations[0]!.sourceClass = "primary";
        },
      },
    ];
    for (const testCase of cases) {
      const value = collections("before");
      testCase.mutate(value);
      const result = buildReviewedThesisMirrorPlan({
        databaseIdentity,
        collections: value,
      });
      assert.equal(result.plan.atomicState, "conflict", testCase.code);
      assert.ok(
        result.plan.conflicts.some((item) => item.code === testCase.code),
        `${testCase.code}: ${JSON.stringify(result.plan.conflicts)}`,
      );
    }
  });

  it("binds plan SHA to DatabaseIdentity, full dependency state, preserved fields, and inventory", () => {
    const baseline = inspection("before");
    const digest = reviewedThesisMirrorPlanSha256(baseline);
    assert.match(digest, /^[a-f0-9]{64}$/);
    assert.equal(
      reviewedThesisMirrorPlanSha256(
        buildReviewedThesisMirrorPlan({
          databaseIdentity,
          collections: {
            ...collections("before"),
            documents: [...collections("before").documents].reverse(),
          },
        }),
      ),
      digest,
    );

    const identityDrift = inspection("before");
    identityDrift.plan.databaseIdentity.databaseIdentityUuid =
      "90e3e24d-230f-42f7-b178-5bcd5b861e85";
    assert.notEqual(reviewedThesisMirrorPlanSha256(identityDrift), digest);

    const dependencyDrift = collections("before");
    dependencyDrift.documentRefs[0]!.refType = "contradicts";
    const changed = buildReviewedThesisMirrorPlan({
      databaseIdentity,
      collections: dependencyDrift,
    });
    assert.notEqual(changed.plan.dependencySha256, baseline.plan.dependencySha256);
    assert.notEqual(
      changed.plan.preservedDependencySha256,
      baseline.plan.preservedDependencySha256,
    );
    assert.notEqual(reviewedThesisMirrorPlanSha256(changed), digest);
  });

  it("limits mutation payloads to the exact reviewed mirror fields", () => {
    for (const repair of REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS) {
      assert.deepEqual(
        Object.keys(reviewedThesisCitationMirrorUpdateData(repair.id)),
        reviewedThesisCitationMutableFields(repair.id),
      );
      if (citationReverificationIds.has(repair.id)) {
        assert.deepEqual(reviewedThesisCitationMutableFields(repair.id), [
          ...REVIEWED_THESIS_CITATION_MIRROR_MUTABLE_FIELDS,
          ...REVIEWED_THESIS_CITATION_REVERIFICATION_MUTABLE_FIELDS,
        ]);
      }
      if (repair.id === "tesdal-2013") continue;
      const documentKeys = Object.keys(
        reviewedThesisDocumentMirrorUpdateData(repair.id),
      );
      if (generatedIds.has(repair.id)) {
        assert.deepEqual(documentKeys, [
          ...REVIEWED_THESIS_GENERATED_DOCUMENT_MUTABLE_FIELDS,
        ]);
        if (mutableLibraryIds.has(repair.id)) {
          const row = collections("before").libraryAnalysisRecords.find(
            (candidate) => candidate.sourceKey === `document:document-${repair.id}`,
          )!;
          const data = reviewedThesisLibraryAnalysisUpdateData(repair.id, row);
          assert.deepEqual(Object.keys(data), ["title", "aiSummary", "aiCard"]);
          assert.deepEqual(
            REVIEWED_THESIS_LIBRARY_ANALYSIS_MUTABLE_FIELDS,
            ["title", "aiSummary", "aiCard.shortSummary"],
          );
          assert.equal(
            (data.aiCard as Record<string, unknown>).protected,
            repair.id,
          );
          assert.deepEqual(
            (data.aiCard as Record<string, unknown>).nested,
            { mustRemain: true },
          );
          assert.equal(
            (data.aiSummary as string).split(repair.after.title).length - 1,
            1,
          );
          assert.equal(
            ((data.aiCard as Record<string, string>).shortSummary ?? "").split(
              repair.after.title,
            ).length - 1,
            1,
          );
        } else {
          assert.equal(repair.id, "nmbu-circular-vegetables-2022");
          assert.throws(
            () =>
              reviewedThesisLibraryAnalysisUpdateData(
                repair.id,
                collections("before").libraryAnalysisRecords.find(
                  (candidate) =>
                    candidate.sourceKey === `document:document-${repair.id}`,
                )!,
              ),
            /no mutable LibraryAnalysisRecord mirror/,
          );
        }
      } else if (repair.id === "sandanger-2012") {
        assert.deepEqual(documentKeys, [
          ...REVIEWED_THESIS_SANDANGER_SUMMARY_DOCUMENT_MUTABLE_FIELDS,
        ]);
      } else {
        assert.ok(summaryIds.has(repair.id));
        assert.deepEqual(documentKeys, [
          ...REVIEWED_THESIS_SUMMARY_DOCUMENT_MUTABLE_FIELDS,
        ]);
      }
    }
  });

  it("requires one old-title occurrence in each mutable LAR location and preserves every other aiCard value", () => {
    const before = collections("before");
    const slu = before.libraryAnalysisRecords.find(
      (row) => row.sourceKey === "document:document-slu-house-crickets-2025",
    )!;
    const update = reviewedThesisLibraryAnalysisUpdateData(
      "slu-house-crickets-2025",
      slu,
    );
    assert.deepEqual((update.aiCard as Record<string, unknown>).nested, {
      mustRemain: true,
    });
    assert.equal((update.aiCard as Record<string, unknown>).protected, "slu-house-crickets-2025");

    const duplicateSummary = collections("before");
    const duplicateRow = duplicateSummary.libraryAnalysisRecords.find(
      (row) => row.sourceKey === "document:document-slu-house-crickets-2025",
    )!;
    duplicateRow.aiSummary = `${duplicateRow.aiSummary} ${REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.find(
      (repair) => repair.id === "slu-house-crickets-2025",
    )!.before.title}`;
    const duplicatePlan = buildReviewedThesisMirrorPlan({
      databaseIdentity,
      collections: duplicateSummary,
    });
    assert.ok(
      duplicatePlan.plan.conflicts.some(
        (item) => item.code === "library_analysis_projection_drift",
      ),
    );
    assert.throws(
      () =>
        reviewedThesisLibraryAnalysisUpdateData(
          "slu-house-crickets-2025",
          duplicateRow,
        ),
      /aiSummary must contain the old reviewed title exactly once/,
    );

    const missingCardLocation = collections("before");
    const missingCardRow = missingCardLocation.libraryAnalysisRecords.find(
      (row) => row.sourceKey === "document:document-van-straten-2025",
    )!;
    missingCardRow.aiCard = { protected: true, shortSummary: "No title here" };
    const missingPlan = buildReviewedThesisMirrorPlan({
      databaseIdentity,
      collections: missingCardLocation,
    });
    assert.ok(
      missingPlan.plan.conflicts.some(
        (item) => item.code === "library_analysis_projection_drift",
      ),
    );
    assert.throws(
      () =>
        reviewedThesisLibraryAnalysisUpdateData(
          "van-straten-2025",
          missingCardRow,
        ),
      /aiCard\.shortSummary must contain the old reviewed title exactly once/,
    );
  });

  it("uses full selected rows as CAS predicates", () => {
    const before = collections("before");
    const citation = before.sourceCitations[0]!;
    const document = before.documents[0]!;
    const library = before.libraryAnalysisRecords[0]!;
    assert.deepEqual(
      Object.keys(fullReviewedThesisMirrorSourceCitationWhere(citation)),
      Object.keys(citation),
    );
    assert.deepEqual(
      Object.keys(fullReviewedThesisMirrorDocumentWhere(document)),
      Object.keys(document),
    );
    assert.deepEqual(
      Object.keys(fullReviewedThesisMirrorLibraryAnalysisWhere(library)),
      Object.keys(library),
    );
    assert.deepEqual(
      (fullReviewedThesisMirrorDocumentWhere(document).tags as { equals: string[] })
        .equals,
      document.tags,
    );
    assert.deepEqual(
      (
        fullReviewedThesisMirrorLibraryAnalysisWhere(library)
          .keyFindings as { equals: string[] }
      ).equals,
      library.keyFindings,
    );
  });

  it("post-apply proof rejects protected dependency and inventory drift", () => {
    const before = inspection("before");
    const protectedDriftCollections = collections("after");
    protectedDriftCollections.documents[0]!.content = "changed protected content";
    const protectedDrift = buildReviewedThesisMirrorPlan({
      databaseIdentity,
      collections: protectedDriftCollections,
    });
    assert.throws(
      () => assertReviewedThesisMirrorPostApply(before, protectedDrift),
      /preserved dependency/,
    );

    const inventoryDriftCollections = collections("after");
    inventoryDriftCollections.documentRefs.push({
      id: "document-ref-2",
      fromId: "document-sandanger-2012",
      toId: "another-document",
      refType: "supports",
    });
    const inventoryDrift = buildReviewedThesisMirrorPlan({
      databaseIdentity,
      collections: inventoryDriftCollections,
    });
    assert.throws(
      () => assertReviewedThesisMirrorPostApply(before, inventoryDrift),
      /direct inventory proof/,
    );
  });

  it("pins DatabaseIdentity, exhaustive direct locks, Serializable reinspection, and update-only writes", () => {
    const runner = readFileSync(
      "scripts/reconcile-reviewed-thesis-bibliographic-mirrors.ts",
      "utf8",
    );
    assert.match(runner, /current_database\(\)/);
    assert.match(runner, /to_regclass\('public\."DatabaseIdentity"'\)/);
    assert.match(runner, /WHERE "key" = 'primary'/);
    assert.match(runner, /pg_advisory_xact_lock/);
    assert.match(runner, /ORDER BY "id" FOR \$\{Prisma\.raw\(mode\)\}/);
    assert.match(runner, /isolationLevel: "Serializable"/);
    assert.match(
      runner,
      /inspectReviewedThesisMirrorDatabaseState\(transaction\)/,
    );
    for (const table of [
      "Thesis",
      "Document",
      "SourceCitation",
      "FieldCitation",
      "LibraryAnalysisRecord",
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
      assert.match(
        runner,
        new RegExp(`lockIds\\(\\s*transaction,\\s*"${table}"`),
      );
    }
    assert.equal((runner.match(/\.updateMany\(/g) ?? []).length, 3);
    assert.doesNotMatch(
      runner,
      /\.(?:create|createMany|delete|deleteMany|upsert)\(/,
    );
    assert.doesNotMatch(runner, /fieldCitation\.update/);
    assert.doesNotMatch(runner, /thesis\.update/);
  });
});
