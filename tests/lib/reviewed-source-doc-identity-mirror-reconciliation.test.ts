import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  REVIEWED_SOURCE_DOC_LINKED_CITATION_MUTABLE_FIELDS,
  REVIEWED_SOURCE_DOC_LAR_MUTABLE_PATHS,
  REVIEWED_SOURCE_DOC_MIRROR_APPLY_ACK,
  REVIEWED_SOURCE_DOC_MIRROR_BINDINGS,
  REVIEWED_SOURCE_DOC_MIRROR_CONTRACT_SHA256,
  REVIEWED_SOURCE_DOC_SOURCE_REF_MUTABLE_FIELDS,
  REVIEWED_SOURCE_DOC_URL_CITATION_MUTABLE_FIELDS,
  assertReviewedSourceDocMirrorPostApply,
  buildReviewedSourceDocMirrorPlan,
  fullReviewedSourceDocMirrorLibraryAnalysisWhere,
  fullReviewedSourceDocMirrorSourceCitationWhere,
  fullReviewedSourceDocMirrorSourceRefWhere,
  parseReviewedSourceDocMirrorArgs,
  reviewedSourceDocCitationMirrorSnapshot,
  reviewedSourceDocCitationMirrorUpdateData,
  reviewedSourceDocLiveLarSnapshot,
  reviewedSourceDocLiveLarUpdateData,
  reviewedSourceDocMirrorContract,
  reviewedSourceDocMirrorPlanSha256,
  reviewedSourceDocSourceRefSnapshot,
  reviewedSourceDocSourceRefUpdateData,
  type ReviewedSourceDocMirrorCollections,
  type ReviewedSourceDocMirrorFieldCitationRow,
  type ReviewedSourceDocMirrorLibraryAnalysisRow,
  type ReviewedSourceDocMirrorSourceCitationRow,
  type ReviewedSourceDocMirrorSourceRefRow,
} from "../../scripts/reconcile-reviewed-source-doc-identity-mirrors";
import {
  REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS,
} from "../../src/lib/citations/reviewed-source-doc-identity-repair";
import { portableSourceDocIdentityToDatabaseRow } from "../../scripts/apply-reviewed-source-doc-identity-repair";

const databaseIdentity = {
  currentDatabase: "foodsystems",
  key: "primary" as const,
  identityUuid: "90e3e24d-230f-42f7-b178-5bcd5b861e84",
  createdAt: "2026-07-19T12:00:00.000Z",
};
const createdAt = new Date("2026-05-19T23:52:33.339Z");
const beforeUpdatedAt = new Date("2026-07-20T01:17:35.937Z");
const afterUpdatedAt = new Date("2026-07-20T04:00:00.000Z");
const oldTitle = "Elintarvikemarkkinavaltuutettu toimintakertomus 2024";
const newTitle = "Elintarvikemarkkinavaltuutetun toimintakertomus 2024";
const documentIds: Record<string, string | null> = {
  "src-16": "cmp8xymgm00ezvvvmzkdpagn3",
  "src-24": "cmp8xymbg00eivvvmgqp70y4r",
  "src-143": null,
};

function sourceDocs() {
  return REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS.map((repair) =>
    portableSourceDocIdentityToDatabaseRow(
      repair.after,
      documentIds[repair.id] ?? null,
    ),
  );
}

function fieldCitationFixture(
  index: number,
): ReviewedSourceDocMirrorFieldCitationRow {
  const binding = REVIEWED_SOURCE_DOC_MIRROR_BINDINGS[index]!;
  return {
    id: binding.fieldCitationId,
    citationId: binding.sourceCitationId,
    entityType: "SourceDoc",
    entityId: binding.sourceDocId,
    fieldPath: binding.fieldPath,
    claimText: null,
    confidence: null,
    createdAt: new Date(createdAt.getTime() + index),
  };
}

function citationFixture(
  index: number,
  state: "before" | "after",
): ReviewedSourceDocMirrorSourceCitationRow {
  const binding = REVIEWED_SOURCE_DOC_MIRROR_BINDINGS[index]!;
  const snapshot = reviewedSourceDocCitationMirrorSnapshot(binding, state);
  const linked = binding.kind === "linked_document";
  return {
    id: binding.sourceCitationId,
    sourceClass: "primary",
    citationReadiness: snapshot.citationReadiness ?? "blocked_unsourced",
    verificationStatus: snapshot.verificationStatus ?? "needs_review",
    citationText: snapshot.citationText,
    title: snapshot.title,
    publisher: snapshot.publisher,
    author: snapshot.author,
    year: snapshot.year,
    url: snapshot.url ?? null,
    archivedUrl: snapshot.archivedUrl ?? null,
    localPath: null,
    fileHash: null,
    contentHash: null,
    hashAlgorithm: "sha256",
    pageRef: null,
    quote: null,
    accessedAt:
      typeof snapshot.accessedAt === "string"
        ? new Date(snapshot.accessedAt)
        : null,
    captureMethod: "backfill-existing-locators",
    verifiedAt:
      typeof snapshot.verifiedAt === "string"
        ? new Date(snapshot.verifiedAt)
        : null,
    verifiedBy: null,
    confidence: null,
    notes: null,
    documentId: linked ? documentIds[binding.sourceDocId]! : null,
    sourceDocId: linked ? binding.sourceDocId : null,
    createdAt: new Date(createdAt.getTime() + index),
    updatedAt: state === "before" ? beforeUpdatedAt : afterUpdatedAt,
  };
}

function larBase(
  id: string,
  sourceKind: string,
  sourceKey: string,
  title: string,
  summary: string,
): ReviewedSourceDocMirrorLibraryAnalysisRow {
  return {
    id,
    sourceKind,
    sourceKey,
    documentId: null,
    sourceDocId: "src-143",
    canonicalPath: sourceKind === "document" ? "research/stale.pdf" : null,
    title,
    status: sourceKind === "source_doc" ? "review_required" : "ai_draft",
    usageRule: "internal_background",
    reviewStatus: sourceKind === "source_doc" ? "queued" : "not_required",
    citationReadiness: null,
    analysisTier: "triage_card",
    aiCard: {
      status: sourceKind === "source_doc" ? "review_required" : "ai_draft",
      shortSummary: summary,
      keyFindings: ["Protected finding"],
      nested: { protected: true },
    },
    aiSummary: summary,
    keyFindings: ["Protected finding"],
    claimCandidates: [],
    projectImplications: ["Protected implication"],
    gaps: [],
    controlLinks: [],
    riskFlags: [],
    contentHash: `protected-${id}`,
    wordCount: sourceKind === "source_doc" ? 13 : 4115,
    processedAt: new Date("2026-07-19T19:39:54.950Z"),
    reviewedAt: null,
    reviewer: null,
    createdAt: new Date("2026-07-19T19:39:54.950Z"),
    updatedAt: beforeUpdatedAt,
  };
}

function liveLar(
  state: "before" | "after",
): ReviewedSourceDocMirrorLibraryAnalysisRow {
  const title = state === "before" ? oldTitle : newTitle;
  const row = larBase(
    "cmrs79oee007eqkvmi00wjttn",
    "source_doc",
    "source_doc:src-143",
    title,
    `${title} er triagert som source_doc med 13 ord i lokalt grunnlag.`,
  );
  if (state === "after") row.updatedAt = afterUpdatedAt;
  return row;
}

function staleRetainedLar(): ReviewedSourceDocMirrorLibraryAnalysisRow {
  return larBase(
    "cmqjoex2v00wvzpvmi24d0g5n",
    "document",
    "document:cmq8rsnhl000mekvmou6qjq2j",
    oldTitle,
    `${oldTitle} er triagert som document med 4115 ord i lokalt grunnlag.`,
  );
}

function sourceRefFixture(
  state: "before" | "after",
): ReviewedSourceDocMirrorSourceRefRow {
  const snapshot = reviewedSourceDocSourceRefSnapshot(state);
  return {
    id: "cmp8xyewq000avqvmwez3gwtc",
    sourceDocId: "src-24",
    label: snapshot.label,
    url: snapshot.url,
    note: "Finsk dominansterskel 30 %",
    insightId: "ins-09",
    meetingId: null,
  };
}

function collections(
  state: "before" | "after",
): ReviewedSourceDocMirrorCollections {
  return {
    sourceDocs: sourceDocs(),
    sourceCitations: REVIEWED_SOURCE_DOC_MIRROR_BINDINGS.map((_, index) =>
      citationFixture(index, state),
    ),
    fieldCitations: REVIEWED_SOURCE_DOC_MIRROR_BINDINGS.map((_, index) =>
      fieldCitationFixture(index),
    ),
    libraryAnalysisRecords: [staleRetainedLar(), liveLar(state)],
    sourceRefs: [sourceRefFixture(state)],
    evidenceAppraisals: [],
    insightCitationConsumers: [],
    producerCitationConsumers: [],
  };
}

function inspection(state: "before" | "after") {
  return buildReviewedSourceDocMirrorPlan({
    databaseIdentity,
    collections: collections(state),
  });
}

describe("reviewed SourceDoc identity mirror reconciliation", () => {
  it("pins the exact five citation bindings and corrected 5+1+1 boundary", () => {
    assert.match(REVIEWED_SOURCE_DOC_MIRROR_CONTRACT_SHA256, /^[a-f0-9]{64}$/);
    assert.equal(REVIEWED_SOURCE_DOC_MIRROR_BINDINGS.length, 5);
    assert.equal(
      new Set(
        REVIEWED_SOURCE_DOC_MIRROR_BINDINGS.map(
          (binding) => binding.sourceCitationId,
        ),
      ).size,
      5,
    );
    assert.deepEqual(
      REVIEWED_SOURCE_DOC_MIRROR_BINDINGS.map(
        ({ sourceDocId, fieldPath }) => `${sourceDocId}:${fieldPath}`,
      ),
      [
        "src-16:url",
        "src-16:documentId",
        "src-24:url",
        "src-24:documentId",
        "src-143:url",
      ],
    );
    assert.deepEqual(
      REVIEWED_SOURCE_DOC_MIRROR_BINDINGS.map(
        ({ fieldCitationId, sourceCitationId }) =>
          `${fieldCitationId}->${sourceCitationId}`,
      ),
      [
        "cmpdafmb303a8sxvm65jwuzqg->cmpdafm1f01azsxvmbqqjt0c9",
        "cmpdafmb303a9sxvm4bqtr6ry->cmpdafm1f01b0sxvmg8p9r21p",
        "cmpdafmb3038hsxvmfr14rmyr->cmpdafm0r0198sxvmx8iqz2lj",
        "cmpdafmb3038isxvmflrxx4od->cmpdafm0r0199sxvmr4zgesuf",
        "cmpdafmb303dqsxvm1tt62pmu->cmpdafm2l01ehsxvm6y85tbr1",
      ],
    );
    const contract = reviewedSourceDocMirrorContract();
    assert.equal(
      contract.staleRetainedLibraryAnalysisRecord.disposition,
      "staleRetained",
    );
    assert.equal(
      contract.liveLibraryAnalysisRecordId,
      "cmrs79oee007eqkvmi00wjttn",
    );
    assert.equal(contract.sourceRef.id, "cmp8xyewq000avqvmwez3gwtc");
    assert.deepEqual(contract.libraryAnalysisMutablePaths, [
      ...REVIEWED_SOURCE_DOC_LAR_MUTABLE_PATHS,
    ]);
    assert.equal(contract.boundary.mutatesReports, false);
    assert.equal(contract.boundary.mutatesDocuments, false);
    assert.equal(contract.boundary.mutatesFieldCitations, false);
  });

  it("pins exact URL verification evidence before and conservative after", () => {
    const expected = {
      "src-16": [
        "failed",
        "2026-05-26T06:35:54.980Z",
        null,
      ],
      "src-24": [
        "needs_review",
        null,
        "https://web.archive.org/web/20260513103214/https://www.kkv.fi/en/",
      ],
      "src-143": [
        "failed",
        "2026-05-26T06:36:24.631Z",
        null,
      ],
    } as const;
    for (const binding of REVIEWED_SOURCE_DOC_MIRROR_BINDINGS.filter(
      (candidate) => candidate.kind === "url",
    )) {
      const before = reviewedSourceDocCitationMirrorSnapshot(binding, "before");
      assert.deepEqual(
        [before.verificationStatus, before.verifiedAt, before.archivedUrl],
        expected[binding.sourceDocId],
      );
      const after = reviewedSourceDocCitationMirrorSnapshot(binding, "after");
      assert.equal(after.verificationStatus, "needs_review");
      assert.equal(after.verifiedAt, null);
      assert.equal(after.verifiedBy, null);
      assert.equal(after.archivedUrl, null);
      assert.equal(after.citationReadiness, "blocked_unsourced");
      assert.equal(
        after.accessedAt,
        "2026-07-20T00:00:00.000Z",
      );
    }
  });

  it("defaults to dry-run and rejects ambiguous apply arguments", () => {
    assert.deepEqual(parseReviewedSourceDocMirrorArgs([]), {
      apply: false,
      ack: undefined,
      expectedPlanSha256: undefined,
    });
    assert.deepEqual(
      parseReviewedSourceDocMirrorArgs([
        "--apply",
        `--ack=${REVIEWED_SOURCE_DOC_MIRROR_APPLY_ACK}`,
        `--plan-sha256=${"a".repeat(64)}`,
      ]),
      {
        apply: true,
        ack: REVIEWED_SOURCE_DOC_MIRROR_APPLY_ACK,
        expectedPlanSha256: "a".repeat(64),
      },
    );
    assert.throws(
      () => parseReviewedSourceDocMirrorArgs(["--apply", "--dry-run"]),
      /mutually exclusive/,
    );
    assert.throws(
      () => parseReviewedSourceDocMirrorArgs(["--ack=no"]),
      /valid only with --apply/,
    );
    assert.throws(
      () => parseReviewedSourceDocMirrorArgs(["--apply", "--apply"]),
      /must not be repeated/,
    );
    assert.throws(
      () => parseReviewedSourceDocMirrorArgs(["--unknown"]),
      /Unknown reviewed SourceDoc mirror argument/,
    );
  });

  it("classifies exact all-before/all-after and preserves the immutable closure", () => {
    const before = inspection("before");
    const after = inspection("after");
    assert.equal(
      before.plan.atomicState,
      "all_before",
      JSON.stringify(before.plan.conflicts),
    );
    assert.equal(
      after.plan.atomicState,
      "all_after",
      JSON.stringify(after.plan.conflicts),
    );
    assert.equal(before.plan.summary.pendingRows, 7);
    assert.equal(after.plan.summary.appliedRows, 7);
    assert.notEqual(before.plan.dependencySha256, after.plan.dependencySha256);
    assert.equal(
      before.plan.preservedDependencySha256,
      after.plan.preservedDependencySha256,
    );
    assert.equal(
      before.plan.staleRetainedLibraryAnalysis.fullRowSha256,
      after.plan.staleRetainedLibraryAnalysis.fullRowSha256,
    );
    assert.doesNotThrow(() =>
      assertReviewedSourceDocMirrorPostApply(before, after),
    );
  });

  it("fails closed on hybrid, identity, binding, evidence, LAR, and SourceRef drift", () => {
    const cases: Array<{
      code: string;
      mutate: (value: ReviewedSourceDocMirrorCollections) => void;
    }> = [
      {
        code: "atomic_hybrid",
        mutate: (value) => {
          value.sourceCitations[0] = citationFixture(0, "after");
        },
      },
      {
        code: "source_doc_not_exact_after",
        mutate: (value) => {
          value.sourceDocs[0]!.title = "drift";
        },
      },
      {
        code: "field_citation_binding_drift",
        mutate: (value) => {
          value.fieldCitations[0]!.citationId = "wrong";
        },
      },
      {
        code: "source_citation_snapshot_drift",
        mutate: (value) => {
          value.sourceCitations.find(
            (row) => row.id === "cmpdafm1f01azsxvmbqqjt0c9",
          )!.verifiedAt = new Date("2026-05-26T06:35:54.981Z");
        },
      },
      {
        code: "live_library_analysis_snapshot_drift",
        mutate: (value) => {
          value.libraryAnalysisRecords.find(
            (row) => row.id === "cmrs79oee007eqkvmi00wjttn",
          )!.aiSummary = `${oldTitle} and ${oldTitle}`;
        },
      },
      {
        code: "stale_retained_library_analysis_drift",
        mutate: (value) => {
          value.libraryAnalysisRecords.find(
            (row) => row.id === "cmqjoex2v00wvzpvmi24d0g5n",
          )!.title = newTitle;
        },
      },
      {
        code: "source_ref_snapshot_drift",
        mutate: (value) => {
          value.sourceRefs[0]!.insightId = "other";
        },
      },
    ];
    for (const testCase of cases) {
      const value = collections("before");
      testCase.mutate(value);
      const result = buildReviewedSourceDocMirrorPlan({
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

  it("updates only the pinned fields and one exact title occurrence", () => {
    for (const binding of REVIEWED_SOURCE_DOC_MIRROR_BINDINGS) {
      assert.deepEqual(
        Object.keys(reviewedSourceDocCitationMirrorUpdateData(binding)),
        binding.kind === "url"
          ? [...REVIEWED_SOURCE_DOC_URL_CITATION_MUTABLE_FIELDS]
          : [...REVIEWED_SOURCE_DOC_LINKED_CITATION_MUTABLE_FIELDS],
      );
    }
    const row = liveLar("before");
    assert.ok(reviewedSourceDocLiveLarSnapshot(row, "before"));
    const update = reviewedSourceDocLiveLarUpdateData(row);
    assert.deepEqual(Object.keys(update), ["title", "aiSummary", "aiCard"]);
    assert.equal(update.title, newTitle);
    assert.equal((update.aiSummary as string).split(newTitle).length - 1, 1);
    assert.equal(
      ((update.aiCard as Record<string, unknown>).shortSummary as string).split(
        newTitle,
      ).length - 1,
      1,
    );
    assert.deepEqual(
      (update.aiCard as Record<string, unknown>).nested,
      { protected: true },
    );
    assert.deepEqual(Object.keys(reviewedSourceDocSourceRefUpdateData()), [
      ...REVIEWED_SOURCE_DOC_SOURCE_REF_MUTABLE_FIELDS,
    ]);
  });

  it("uses every selected target field in full-row CAS predicates", () => {
    const value = collections("before");
    const citation = value.sourceCitations[0]!;
    const live = value.libraryAnalysisRecords.find(
      (row) => row.id === "cmrs79oee007eqkvmi00wjttn",
    )!;
    const sourceRef = value.sourceRefs[0]!;
    assert.deepEqual(
      Object.keys(fullReviewedSourceDocMirrorSourceCitationWhere(citation)),
      Object.keys(citation),
    );
    assert.deepEqual(
      Object.keys(fullReviewedSourceDocMirrorLibraryAnalysisWhere(live)),
      Object.keys(live),
    );
    assert.deepEqual(
      Object.keys(fullReviewedSourceDocMirrorSourceRefWhere(sourceRef)),
      Object.keys(sourceRef),
    );
    assert.deepEqual(
      (
        fullReviewedSourceDocMirrorLibraryAnalysisWhere(live)
          .keyFindings as { equals: string[] }
      ).equals,
      live.keyFindings,
    );
  });

  it("binds plan SHA to DatabaseIdentity, exact dependency IDs, and protected state", () => {
    const baseline = inspection("before");
    const digest = reviewedSourceDocMirrorPlanSha256(baseline);
    assert.match(digest, /^[a-f0-9]{64}$/);
    const reordered = collections("before");
    reordered.fieldCitations.reverse();
    assert.equal(
      reviewedSourceDocMirrorPlanSha256(
        buildReviewedSourceDocMirrorPlan({
          databaseIdentity,
          collections: reordered,
        }),
      ),
      digest,
    );
    const dependencyDrift = collections("before");
    dependencyDrift.sourceRefs[0]!.note = "changed protected note";
    const changed = buildReviewedSourceDocMirrorPlan({
      databaseIdentity,
      collections: dependencyDrift,
    });
    assert.notEqual(
      changed.plan.preservedDependencySha256,
      baseline.plan.preservedDependencySha256,
    );
    assert.notEqual(reviewedSourceDocMirrorPlanSha256(changed), digest);
    assert.deepEqual(
      baseline.plan.dependencyIds.fieldCitations,
      [...REVIEWED_SOURCE_DOC_MIRROR_BINDINGS]
        .map((binding) => binding.fieldCitationId)
        .sort((left, right) =>
          left.localeCompare(right, undefined, { numeric: true }),
        ),
    );
  });

  it("post proof rejects protected, staleRetained, and inventory drift", () => {
    const before = inspection("before");
    const protectedValue = collections("after");
    protectedValue.sourceCitations[0]!.sourceClass = "secondary";
    const protectedDrift = buildReviewedSourceDocMirrorPlan({
      databaseIdentity,
      collections: protectedValue,
    });
    assert.throws(
      () => assertReviewedSourceDocMirrorPostApply(before, protectedDrift),
      /Post-apply/,
    );

    const liveSummaryValue = collections("after");
    liveSummaryValue.libraryAnalysisRecords.find(
      (row) => row.id === "cmrs79oee007eqkvmi00wjttn",
    )!.aiSummary += " changed surrounding text";
    const liveSummaryDrift = buildReviewedSourceDocMirrorPlan({
      databaseIdentity,
      collections: liveSummaryValue,
    });
    assert.equal(liveSummaryDrift.plan.atomicState, "all_after");
    assert.throws(
      () => assertReviewedSourceDocMirrorPostApply(before, liveSummaryDrift),
      /Post-apply/,
    );

    const staleValue = collections("after");
    staleValue.libraryAnalysisRecords.find(
      (row) => row.id === "cmqjoex2v00wvzpvmi24d0g5n",
    )!.aiSummary = "protected drift";
    const staleDrift = buildReviewedSourceDocMirrorPlan({
      databaseIdentity,
      collections: staleValue,
    });
    assert.throws(
      () => assertReviewedSourceDocMirrorPostApply(before, staleDrift),
      /Post-apply/,
    );

    const inventoryValue = collections("after");
    inventoryValue.evidenceAppraisals.push({
      id: "appraisal-drift",
    } as ReviewedSourceDocMirrorCollections["evidenceAppraisals"][number]);
    const inventoryDrift = buildReviewedSourceDocMirrorPlan({
      databaseIdentity,
      collections: inventoryValue,
    });
    assert.throws(
      () => assertReviewedSourceDocMirrorPostApply(before, inventoryDrift),
      /Post-apply/,
    );
  });

  it("pins writer-blocking locks, Serializable reinspection, rollback proof, and update-only writes", () => {
    const runner = readFileSync(
      "scripts/reconcile-reviewed-source-doc-identity-mirrors.ts",
      "utf8",
    );
    assert.match(runner, /current_database\(\)/);
    assert.match(runner, /to_regclass\('public\."DatabaseIdentity"'\)/);
    assert.match(runner, /WHERE "key" = 'primary'/);
    assert.match(runner, /pg_advisory_xact_lock/);
    assert.match(runner, /IN SHARE ROW EXCLUSIVE MODE/);
    assert.match(runner, /isolationLevel: "Serializable"/);
    assert.match(
      runner,
      /inspectReviewedSourceDocMirrorDatabaseState\(transaction\)/,
    );
    assert.match(runner, /transaction rolled back and zero rows were committed/);
    for (const table of [
      "DatabaseIdentity",
      "SourceDoc",
      "SourceCitation",
      "FieldCitation",
      "LibraryAnalysisRecord",
      "SourceRef",
      "EvidenceAppraisal",
      "Insight",
      "Producer",
    ]) {
      assert.match(runner, new RegExp(`"${table}"`));
    }
    assert.equal((runner.match(/\.updateMany\(/g) ?? []).length, 3);
    assert.doesNotMatch(
      runner,
      /\.(?:create|createMany|delete|deleteMany|upsert)\(/,
    );
    assert.doesNotMatch(runner, /fieldCitation\.update/);
    assert.doesNotMatch(runner, /sourceDoc\.update/);
    assert.doesNotMatch(runner, /transaction\.report/);
  });
});
