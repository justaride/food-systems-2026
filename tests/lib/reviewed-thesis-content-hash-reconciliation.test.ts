import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  PINNED_REVIEWED_THESIS_CONTENT_HASH_MANIFEST_SHA256,
  REVIEWED_THESIS_CONTENT_HASH_FILES,
  REVIEWED_THESIS_CONTENT_HASH_IDS,
  REVIEWED_THESIS_CONTENT_HASH_MANIFEST,
  REVIEWED_THESIS_CONTENT_HASH_MANIFEST_SHA256,
  REVIEWED_THESIS_CONTENT_HASH_MISSING_PDF_PATHS,
  applyReviewedThesisContentReplacements,
} from "../../src/lib/citations/reviewed-thesis-content-hash-reconciliation";
import { REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS } from "../../src/lib/citations/reviewed-thesis-bibliographic-repair";
import {
  REVIEWED_THESIS_CONTENT_HASH_APPLY_ACK,
  REVIEWED_THESIS_CONTENT_HASH_CONTRACT_SHA256,
  assertReviewedThesisContentHashApplyable,
  assertReviewedThesisContentHashPostApply,
  buildReviewedThesisContentHashPlan,
  classifyReviewedThesisContentHashFile,
  fullReviewedThesisContentHashDocumentWhere,
  fullReviewedThesisContentHashLibraryWhere,
  inspectReviewedThesisContentHashFiles,
  parseReviewedThesisContentHashArgs,
  reviewedThesisContentHashDocumentUpdateData,
  reviewedThesisContentHashLibraryUpdateData,
  reviewedThesisContentHashPlanSha256,
  type ReviewedThesisContentHashDependencyCollections,
  type ReviewedThesisContentHashDocumentRow,
  type ReviewedThesisContentHashLibraryRow,
} from "../../scripts/reconcile-reviewed-thesis-content-hashes";
import { portableThesisBibliographyToDatabaseRow } from "../../scripts/apply-reviewed-thesis-bibliographic-repair";

const databaseIdentity = {
  currentDatabase: "foodsystems",
  key: "primary" as const,
  identityUuid: "90e3e24d-230f-42f7-b178-5bcd5b861e84",
  createdAt: "2026-07-20T00:00:00.000Z",
};
const createdAt = new Date("2026-05-16T22:52:16.533Z");
const beforeUpdatedAt = new Date("2026-07-20T02:29:13.789Z");
const afterUpdatedAt = new Date("2026-07-20T08:00:00.000Z");

function documentFixture(
  index: number,
  state: "before" | "after",
): ReviewedThesisContentHashDocumentRow {
  const entry = REVIEWED_THESIS_CONTENT_HASH_MANIFEST[index]!;
  const identity = entry.documentIdentity;
  return {
    id: entry.documentId,
    slug: identity.slug,
    filePath: identity.filePath,
    title: identity.title,
    author: identity.author,
    year: identity.year,
    documentType: identity.documentType,
    category: identity.category,
    subcategory: identity.subcategory,
    country: identity.country,
    content:
      state === "before"
        ? entry.beforeDocumentContent
        : entry.afterDocumentContent,
    summary: identity.summary,
    url: identity.url,
    accessedAt: identity.accessedAt ? new Date(identity.accessedAt) : null,
    archivedUrl: identity.archivedUrl,
    wordCount:
      state === "before"
        ? entry.beforeDocumentWordCount
        : entry.afterDocumentWordCount,
    tags: [...identity.tags],
    metadata: JSON.parse(
      JSON.stringify(identity.metadata),
    ) as ReviewedThesisContentHashDocumentRow["metadata"],
    createdAt: new Date(createdAt.getTime() + index),
    updatedAt: state === "before" ? beforeUpdatedAt : afterUpdatedAt,
  };
}

function libraryFixture(
  index: number,
  state: "before" | "after",
): ReviewedThesisContentHashLibraryRow {
  const entry = REVIEWED_THESIS_CONTENT_HASH_MANIFEST[index]!;
  return {
    id: entry.libraryAnalysisRecordId,
    sourceKind: "document",
    sourceKey: `document:${entry.documentId}`,
    documentId: entry.documentId,
    sourceDocId: null,
    canonicalPath: entry.documentIdentity.filePath,
    title: entry.documentIdentity.title,
    status: "ai_draft",
    usageRule: "internal_background",
    reviewStatus: "not_required",
    citationReadiness: null,
    analysisTier: "triage_card",
    aiCard: {
      protected: true,
      shortSummary: `Protected summary for ${entry.thesisId}`,
    },
    aiSummary: `Protected AI summary for ${entry.thesisId}`,
    keyFindings: [`Protected finding for ${entry.thesisId}`],
    claimCandidates: [{ text: `Protected claim for ${entry.thesisId}` }],
    projectImplications: [`Protected implication for ${entry.thesisId}`],
    gaps: [{ kind: "protected" }],
    controlLinks: [{ href: `/protected/${entry.thesisId}` }],
    riskFlags: ["protected"],
    contentHash:
      state === "before"
        ? entry.beforeLibraryContentHash
        : entry.afterLibraryContentHash,
    wordCount:
      state === "before"
        ? entry.beforeDocumentWordCount
        : entry.afterDocumentWordCount,
    processedAt: new Date("2026-07-19T19:39:54.950Z"),
    reviewedAt: null,
    reviewer: null,
    createdAt: new Date(createdAt.getTime() + index),
    updatedAt: state === "before" ? beforeUpdatedAt : afterUpdatedAt,
  };
}

function fileStates(state: "before" | "after") {
  return REVIEWED_THESIS_CONTENT_HASH_FILES.map((entry) =>
    classifyReviewedThesisContentHashFile(
      entry,
      Buffer.from(state === "before" ? entry.beforeBytes : entry.afterBytes),
    ),
  );
}

function missingPdfStates(state: "missing" | "present" = "missing") {
  return REVIEWED_THESIS_CONTENT_HASH_MISSING_PDF_PATHS.map(
    (repositoryPath) => ({ repositoryPath, state }),
  );
}

function collections(
  state: "before" | "after",
): ReviewedThesisContentHashDependencyCollections {
  return {
    theses: REVIEWED_THESIS_CONTENT_HASH_MANIFEST.map((entry) => {
      const repair = REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.find(
        (candidate) => candidate.id === entry.thesisId,
      )!;
      return portableThesisBibliographyToDatabaseRow(
        repair.after,
        entry.documentId,
      );
    }),
    documents: REVIEWED_THESIS_CONTENT_HASH_MANIFEST.map((_, index) =>
      documentFixture(index, state),
    ),
    libraryAnalysisRecords: REVIEWED_THESIS_CONTENT_HASH_MANIFEST.map(
      (_, index) => libraryFixture(index, state),
    ),
    sourceCitations: [
      { id: "citation-protected", title: "Protected citation" },
    ],
    fieldCitations: [
      {
        id: "field-citation-protected",
        citationId: "citation-protected",
        claimText: "Protected claim text",
      },
    ],
    evidenceAppraisals: [],
    documentRefs: [{ id: "document-ref-protected", refType: "supports" }],
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
  files: "before" | "after",
  database: "before" | "after",
) {
  return buildReviewedThesisContentHashPlan({
    databaseIdentity,
    files: fileStates(files),
    missingPdfs: missingPdfStates(),
    collections: collections(database),
  });
}

describe("reviewed Thesis content/hash reconciliation", () => {
  it("pins exactly five Thesis rows, three repository files, five absent PDFs, and the LAR formula", () => {
    assert.equal(
      REVIEWED_THESIS_CONTENT_HASH_MANIFEST_SHA256,
      PINNED_REVIEWED_THESIS_CONTENT_HASH_MANIFEST_SHA256,
    );
    assert.equal(
      REVIEWED_THESIS_CONTENT_HASH_MANIFEST_SHA256,
      "9e1412b4d90c142ff38761f0fdbeb80d242c886a10a4135b67c408c71060183f",
    );
    assert.match(REVIEWED_THESIS_CONTENT_HASH_CONTRACT_SHA256, /^[a-f0-9]{64}$/);
    assert.deepEqual(
      REVIEWED_THESIS_CONTENT_HASH_MANIFEST.map((entry) => entry.thesisId),
      [...REVIEWED_THESIS_CONTENT_HASH_IDS],
    );
    assert.equal(REVIEWED_THESIS_CONTENT_HASH_FILES.length, 3);
    assert.equal(REVIEWED_THESIS_CONTENT_HASH_MISSING_PDF_PATHS.length, 5);
    assert.deepEqual(
      REVIEWED_THESIS_CONTENT_HASH_MANIFEST.map((entry) => [
        entry.thesisId,
        entry.beforeDocumentContentSha256,
        entry.afterDocumentContentSha256,
        entry.beforeLibraryContentHash,
        entry.afterLibraryContentHash,
        entry.beforeDocumentWordCount,
        entry.afterDocumentWordCount,
      ]),
      [
        [
          "slu-house-crickets-2025",
          "5cebf74e9085714379ffec12d57c157376a98af3f7e6af66a13a97562dc9bf99",
          "2834ae0c0683d6b9ad4e989d90ceef555a622b0e9efdc5da9195208f0c3b36ef",
          "33bb5723ce54543a4c7ab5f0e318219561183874ea04edff0703cc2b13b48005",
          "38d49790068d1c58accd23474857c7eb29d77cfbece34893acfe0242e9b831f9",
          198,
          207,
        ],
        [
          "nmbu-circular-vegetables-2022",
          "f4f12a60c753bd8764a08ed709e75b614fc446c8eb05fa227db8cb4971305fbd",
          "e48291c0861bea62bfb213d6b4b56cb28ee9e560f747006f463be33194f26b25",
          "17fd68b859617a41a85f3d7baf23ac7b030e7abb1d86deac2fa2230534d42a25",
          "54e231e03ddc4b427d4be68a544e9c5f9050cdd97555e27be4f903f9820c67c4",
          189,
          190,
        ],
        [
          "van-straten-2025",
          "48cfa315db479649ccded851f1f9459b48b0aa5d17ead0b2438bf03586a1aea3",
          "6f7f1f4f23bb2094e432bbfb020b418140b5cf556115ffc262d7259f0e0cfbba",
          "79df74c57c95019159b29f323d184a8fec1c03bcfbab32b749685c643f2a7b75",
          "4c4d177cf2e3a83caa6e6294f03e232a965e173bd1de2f71fdd84f4048877f41",
          212,
          232,
        ],
        [
          "bueso-bordils-2021",
          "dac72370220960b7e9e63be7ef5082d29b5febcfa833964fe765d49cbad87085",
          "79bdf5880a6425fa2d26b10a030c53e74254caf9de3fabbfca7e111472a43564",
          "2e81237edbba1ce2aab13c4d12a08e46fab9dbc99ecbf180826489a9b7d950d0",
          "9f573e20b26b7b54ac0521eb8f64768cc34ff7729f7499e0f77a1a0e3fe3934e",
          190,
          197,
        ],
        [
          "handlykken-2023",
          "e8ca07e12c3e28140d8829bbea4d5d749679d0686afb0ea5793c327f31117ba1",
          "d8366ea949b5eb26024c54aa8124e4fa59ddb352b15e9cd64f7848c4b7d7e5d7",
          "6c6bbdba0a2a067a452e5dee9bf0eb8d829b437141a57bfe84e4dca6b1fff3c7",
          "acf87dbf4e552cbdd67f932b661051f378c19e70b090ea39599923e010e8e36d",
          194,
          184,
        ],
      ],
    );
  });

  it("keeps every change to exact visible bibliography metadata and protects semantic findings", () => {
    for (const entry of REVIEWED_THESIS_CONTENT_HASH_MANIFEST) {
      assert.equal(
        applyReviewedThesisContentReplacements(
          entry.beforeDocumentContent,
          entry.replacements,
        ),
        entry.afterDocumentContent,
      );
      const beforeBody = entry.beforeDocumentContent.split(
        entry.thesisId === "handlykken-2023"
          ? "## Hovedfunn"
          : "## Sammendrag / Syntese",
      )[1];
      const afterBody = entry.afterDocumentContent.split(
        entry.thesisId === "handlykken-2023"
          ? "## Hovedfunn"
          : "## Sammendrag / Syntese",
      )[1];
      assert.equal(afterBody, beforeBody);
      assert.deepEqual(
        Object.keys(reviewedThesisContentHashDocumentUpdateData(entry)).sort(),
        ["content", "wordCount"],
      );
      assert.deepEqual(
        Object.keys(reviewedThesisContentHashLibraryUpdateData(entry)).sort(),
        ["contentHash", "wordCount"],
      );
    }
    const handlykken = REVIEWED_THESIS_CONTENT_HASH_MANIFEST.at(-1)!;
    assert.equal(handlykken.replacements.length, 1);
    assert.match(handlykken.replacements[0]!.after, /atferdsøkonomisk/);
    assert.doesNotMatch(handlykken.afterDocumentContent, /registeret bruker kortformen/);
    assert.match(handlykken.afterDocumentContent, /ser pa hvordan nudging brukes som atferdsokonomisk/);
  });

  it("sees exact after repository bytes while all guarded PDF targets remain absent", () => {
    const current = inspectReviewedThesisContentHashFiles(process.cwd());
    assert.deepEqual(
      current.files.map((row) => [
        row.artifactId,
        row.state,
        row.byteLength,
        row.sha256,
      ]),
      REVIEWED_THESIS_CONTENT_HASH_FILES.map((entry) => [
        entry.artifactId,
        "after",
        entry.afterByteLength,
        entry.afterSha256,
      ]),
    );
    assert.ok(current.missingPdfs.every((row) => row.state === "missing"));
  });

  it("defaults to dry-run and rejects ambiguous arguments", () => {
    assert.deepEqual(parseReviewedThesisContentHashArgs([]), {
      apply: false,
      ack: undefined,
      expectedPlanSha256: undefined,
    });
    assert.deepEqual(
      parseReviewedThesisContentHashArgs([
        "--apply",
        `--ack=${REVIEWED_THESIS_CONTENT_HASH_APPLY_ACK}`,
        `--plan-sha256=${"a".repeat(64)}`,
      ]),
      {
        apply: true,
        ack: REVIEWED_THESIS_CONTENT_HASH_APPLY_ACK,
        expectedPlanSha256: "a".repeat(64),
      },
    );
    assert.throws(
      () => parseReviewedThesisContentHashArgs(["--apply", "--dry-run"]),
      /mutually exclusive/,
    );
    assert.throws(
      () => parseReviewedThesisContentHashArgs(["--ack=no"]),
      /valid only with --apply/,
    );
    assert.throws(
      () => parseReviewedThesisContentHashArgs(["--unknown"]),
      /Unknown reviewed Thesis content\/hash argument/,
    );
  });

  it("classifies all-before, the sole recoverable transition, and idempotent all-after", () => {
    const allBefore = inspection("before", "before");
    assert.equal(allBefore.plan.transition, "all_before");
    assert.equal(allBefore.plan.summary.pendingDatabaseRows, 10);
    assert.throws(
      () => assertReviewedThesisContentHashApplyable(allBefore),
      /files_after_db_before/,
    );

    const recoverable = inspection("after", "before");
    assert.equal(recoverable.plan.transition, "files_after_db_before");
    assert.doesNotThrow(() =>
      assertReviewedThesisContentHashApplyable(recoverable),
    );

    const allAfter = inspection("after", "after");
    assert.equal(allAfter.plan.transition, "all_after");
    assert.equal(allAfter.plan.summary.appliedDatabaseRows, 10);
    assert.throws(
      () => assertReviewedThesisContentHashApplyable(allAfter),
      /files_after_db_before/,
    );
    assert.doesNotThrow(() =>
      assertReviewedThesisContentHashPostApply(recoverable, allAfter),
    );
    assert.match(reviewedThesisContentHashPlanSha256(recoverable), /^[a-f0-9]{64}$/);
  });

  it("fails closed on hybrid files, appeared PDFs, Thesis drift, and protected semantic changes", () => {
    const hybrid = buildReviewedThesisContentHashPlan({
      databaseIdentity,
      files: fileStates("after").map((row, index) =>
        index === 0 ? fileStates("before")[0]! : row,
      ),
      missingPdfs: missingPdfStates(),
      collections: collections("before"),
    });
    assert.equal(hybrid.plan.transition, "conflict");

    const appearedPdf = buildReviewedThesisContentHashPlan({
      databaseIdentity,
      files: fileStates("after"),
      missingPdfs: missingPdfStates().map((row, index) =>
        index === 0 ? { ...row, state: "present" as const } : row,
      ),
      collections: collections("before"),
    });
    assert.ok(
      appearedPdf.plan.conflicts.some(
        (item) => item.code === "unexpected_pdf_bytes",
      ),
    );

    const thesisDriftCollections = collections("before");
    thesisDriftCollections.theses[0]!.synthesis = "Changed protected synthesis";
    const thesisDrift = buildReviewedThesisContentHashPlan({
      databaseIdentity,
      files: fileStates("after"),
      missingPdfs: missingPdfStates(),
      collections: thesisDriftCollections,
    });
    assert.ok(
      thesisDrift.plan.conflicts.some(
        (item) => item.code === "thesis_identity_drift",
      ),
    );

    const recoverable = inspection("after", "before");
    const semanticCollections = collections("after");
    semanticCollections.libraryAnalysisRecords[0]!.keyFindings = [
      "Changed protected finding",
    ];
    const semanticAfter = buildReviewedThesisContentHashPlan({
      databaseIdentity,
      files: fileStates("after"),
      missingPdfs: missingPdfStates(),
      collections: semanticCollections,
    });
    assert.equal(semanticAfter.plan.transition, "all_after");
    assert.throws(
      () =>
        assertReviewedThesisContentHashPostApply(recoverable, semanticAfter),
      /protected semantic dependency/,
    );
  });

  it("uses full-row CAS and keeps all protected analysis fields out of mutation data", () => {
    const document = documentFixture(0, "before");
    const library = libraryFixture(0, "before");
    const documentWhere = fullReviewedThesisContentHashDocumentWhere(document);
    const libraryWhere = fullReviewedThesisContentHashLibraryWhere(library);
    assert.equal(documentWhere.content, document.content);
    assert.equal(documentWhere.summary, document.summary);
    assert.equal(documentWhere.metadata && "equals" in documentWhere.metadata, true);
    assert.equal(documentWhere.updatedAt, beforeUpdatedAt);
    assert.equal(libraryWhere.aiSummary, library.aiSummary);
    assert.deepEqual(libraryWhere.keyFindings, { equals: library.keyFindings });
    assert.equal(libraryWhere.updatedAt, beforeUpdatedAt);
  });

  it("keeps the runner guarded, Serializable, file-read-only, and package-addressable", () => {
    const source = readFileSync(
      "scripts/reconcile-reviewed-thesis-content-hashes.ts",
      "utf8",
    );
    assert.match(source, /LOCK TABLE "DatabaseIdentity", "Thesis", "Document"/);
    assert.match(source, /isolationLevel: "Serializable"/);
    assert.match(source, /pg_advisory_xact_lock/);
    assert.match(source, /fullReviewedThesisContentHashDocumentWhere/);
    assert.match(source, /fullReviewedThesisContentHashLibraryWhere/);
    assert.doesNotMatch(source, /writeFileSync|renameSync|copyFileSync/);
    const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
    assert.equal(
      packageJson.scripts["reconcile:reviewed-thesis-content-hashes"],
      "tsx scripts/reconcile-reviewed-thesis-content-hashes.ts",
    );
  });
});
