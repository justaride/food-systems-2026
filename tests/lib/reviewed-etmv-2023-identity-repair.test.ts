import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { reports } from "../../prisma/seed-data/reports";
import {
  PINNED_REVIEWED_ETMV_2023_IDENTITY_REPAIR_CONTRACT_SHA256,
  REVIEWED_ETMV_2023_CONTENT_HASHES,
  REVIEWED_ETMV_2023_DOCUMENT_ID,
  REVIEWED_ETMV_2023_IDENTITY_REPAIR_CONTRACT,
  REVIEWED_ETMV_2023_IDENTITY_REPAIR_CONTRACT_SHA256,
  REVIEWED_ETMV_2023_LIBRARY_ANALYSIS_ID,
  REVIEWED_ETMV_2023_LOCAL_CITATION_ID,
  REVIEWED_ETMV_2023_PDF_SHA256,
  REVIEWED_ETMV_2023_REPORT_ID,
  REVIEWED_ETMV_2023_REPOSITORY_PDF_PATH,
  REVIEWED_ETMV_2023_TITLE_AFTER,
  REVIEWED_ETMV_2023_TITLE_BEFORE,
  REVIEWED_ETMV_2023_URL_CITATION_ID,
  assertReviewedEtmv2023ReportSeed,
  reconcileReviewedEtmv2023DocumentContent,
  reconcileReviewedEtmv2023LibraryText,
  replaceReviewedEtmv2023ExactlyOnce,
  reviewedEtmv2023LibraryAnalysisContentHash,
  sha256ReviewedEtmv2023Text,
} from "../../src/lib/citations/reviewed-etmv-2023-identity-repair";
import {
  REVIEWED_ETMV_2023_IDENTITY_REPAIR_APPLY_ACK,
  assertReviewedEtmv2023PlanReady,
  assertReviewedEtmv2023PostApply,
  buildReviewedEtmv2023Plan,
  fullReviewedEtmv2023DocumentWhere,
  fullReviewedEtmv2023LibraryAnalysisWhere,
  fullReviewedEtmv2023SourceCitationWhere,
  parseReviewedEtmv2023Args,
  reviewedEtmv2023PlanSha256,
  type ReviewedEtmv2023Collections,
  type ReviewedEtmv2023DocumentRow,
  type ReviewedEtmv2023Inspection,
  type ReviewedEtmv2023LibraryAnalysisRow,
  type ReviewedEtmv2023Plan,
  type ReviewedEtmv2023SourceCitationRow,
} from "../../scripts/apply-reviewed-etmv-2023-identity-repair";

const createdAt = new Date("2026-05-19T23:52:33.288Z");
const updatedAt = new Date("2026-07-19T19:41:39.613Z");
const databaseIdentity = {
  currentDatabase: "foodsystems",
  key: "primary" as const,
  identityUuid: "90e3e24d-230f-42f7-b178-5bcd5b861e84",
  createdAt: "2026-07-20T00:00:00.000Z",
};

function emptyCollections(): ReviewedEtmv2023Collections {
  return {
    reports: [],
    documents: [],
    sourceCitations: [],
    fieldCitations: [],
    libraryAnalysisRecords: [],
    evidenceAppraisals: [],
    documentRefs: [],
    insightDocumentRefs: [],
    companyDocumentRefs: [],
    actorDocumentRefs: [],
    sourceDocBindings: [],
    thesisBindings: [],
    reportBindings: [],
    insightCitationBindings: [],
    producerCitationBindings: [],
  };
}

function documentFixture(): ReviewedEtmv2023DocumentRow {
  return {
    id: REVIEWED_ETMV_2023_DOCUMENT_ID,
    slug: "evidence-pack/nordisk/finland-food-market-ombudsman-2023",
    filePath: "evidence-pack/nordisk/finland-food-market-ombudsman-2023.pdf",
    title: REVIEWED_ETMV_2023_TITLE_BEFORE,
    author: "Ruokavirasto",
    year: 2024,
    documentType: "research",
    category: "evidence-pack",
    subcategory: "nordisk",
    country: "fi",
    content: "protected exact content",
    summary: "protected summary",
    url: "https://example.test/before.pdf",
    accessedAt: null,
    archivedUrl: null,
    wordCount: 5436,
    tags: ["pdf", "finland"],
    metadata: { backlog: { protected: true }, untouched: "yes" },
    createdAt,
    updatedAt,
  };
}

function citationFixture(
  id: string = REVIEWED_ETMV_2023_URL_CITATION_ID,
): ReviewedEtmv2023SourceCitationRow {
  return {
    id,
    sourceClass: "primary",
    citationReadiness: "citable_with_note",
    verificationStatus: "machine_verified",
    citationText: "protected citation text",
    title: REVIEWED_ETMV_2023_TITLE_BEFORE,
    publisher: null,
    author: "Ruokavirasto",
    year: 2024,
    url: "https://example.test/before.pdf",
    archivedUrl: "https://archive.test/before.pdf",
    localPath: null,
    fileHash: null,
    contentHash: null,
    hashAlgorithm: "sha256",
    pageRef: null,
    quote: null,
    accessedAt: null,
    captureMethod: "backfill-existing-locators",
    verifiedAt: new Date("2026-05-26T06:35:13.195Z"),
    verifiedBy: null,
    confidence: null,
    notes: null,
    documentId: null,
    sourceDocId: null,
    createdAt,
    updatedAt,
  };
}

function libraryFixture(): ReviewedEtmv2023LibraryAnalysisRow {
  return {
    id: REVIEWED_ETMV_2023_LIBRARY_ANALYSIS_ID,
    sourceKind: "document",
    sourceKey: `document:${REVIEWED_ETMV_2023_DOCUMENT_ID}`,
    documentId: REVIEWED_ETMV_2023_DOCUMENT_ID,
    sourceDocId: null,
    canonicalPath:
      "evidence-pack/nordisk/finland-food-market-ombudsman-2023.pdf",
    title: REVIEWED_ETMV_2023_TITLE_BEFORE,
    status: "ai_draft",
    usageRule: "internal_background",
    reviewStatus: "not_required",
    citationReadiness: null,
    analysisTier: "triage_card",
    aiCard: { shortSummary: "protected", untouched: true },
    aiSummary: "protected",
    keyFindings: ["protected finding"],
    claimCandidates: [],
    projectImplications: ["protected implication"],
    gaps: [],
    controlLinks: [],
    riskFlags: [],
    contentHash: "protected-content-hash",
    wordCount: 5436,
    processedAt: new Date("2026-07-19T19:42:21.764Z"),
    reviewedAt: null,
    reviewer: null,
    createdAt,
    updatedAt,
  };
}

function readyPlan(state: "all_before" | "all_after"): ReviewedEtmv2023Plan {
  const ids = Object.fromEntries(
    Object.keys(emptyCollections()).map((name) => [name, []]),
  ) as unknown as ReviewedEtmv2023Plan["dependencyIds"];
  const counts = Object.fromEntries(
    Object.keys(emptyCollections()).map((name) => [name, 0]),
  ) as unknown as ReviewedEtmv2023Plan["dependencyCounts"];
  const targetState = state === "all_before" ? "before" : "after";
  return {
    version: "2026-07-20-v1",
    contractSha256: REVIEWED_ETMV_2023_IDENTITY_REPAIR_CONTRACT_SHA256,
    seedTargetSha256: "1".repeat(64),
    artifactSha256: REVIEWED_ETMV_2023_PDF_SHA256,
    databaseIdentity,
    atomicState: state,
    targetStateSha256: "2".repeat(64),
    dependencySha256: "3".repeat(64),
    preservedDependencySha256: "4".repeat(64),
    dependencyScope: [],
    dependencyCounts: counts,
    dependencyIds: ids,
    targetStates: {
      document: targetState,
      urlCitation: targetState,
      localCitation: targetState,
      libraryAnalysisRecord: targetState,
    },
    targetHashes: {
      report: "5".repeat(64),
      document: "6".repeat(64),
      urlCitation: "7".repeat(64),
      localCitation: "8".repeat(64),
      urlFieldCitation: "9".repeat(64),
      localFieldCitation: "a".repeat(64),
      protectedReportCitation: "b".repeat(64),
      protectedReportFieldCitation: "c".repeat(64),
      libraryAnalysisRecord: "d".repeat(64),
    },
    conflicts: [],
    summary: {
      targets: 4,
      pendingTargets: state === "all_before" ? 4 : 0,
      appliedTargets: state === "all_after" ? 4 : 0,
      conflicts: 0,
    },
    boundary: REVIEWED_ETMV_2023_IDENTITY_REPAIR_CONTRACT.boundary,
  };
}

describe("reviewed ETMV 2023 generated-projection identity repair", () => {
  it("pins the distinct 2023 contract, local PDF, and already-correct Report seed", () => {
    assert.equal(
      REVIEWED_ETMV_2023_IDENTITY_REPAIR_CONTRACT_SHA256,
      PINNED_REVIEWED_ETMV_2023_IDENTITY_REPAIR_CONTRACT_SHA256,
    );
    assert.equal(
      REVIEWED_ETMV_2023_IDENTITY_REPAIR_CONTRACT.boundary.mutatesReport,
      false,
    );
    assert.equal(
      REVIEWED_ETMV_2023_IDENTITY_REPAIR_CONTRACT.boundary
        .mutatesFieldCitations,
      false,
    );
    const bytes = readFileSync(REVIEWED_ETMV_2023_REPOSITORY_PDF_PATH);
    assert.equal(sha256ReviewedEtmv2023Text(bytes), REVIEWED_ETMV_2023_PDF_SHA256);
    const seed = assertReviewedEtmv2023ReportSeed(reports);
    assert.equal(seed.id, REVIEWED_ETMV_2023_REPORT_ID);
    assert.equal(seed.title, REVIEWED_ETMV_2023_TITLE_AFTER);
    assert.equal(seed.year, 2023);
    assert.equal(
      seed.sourceUrl,
      "https://www.ruokavirasto.fi/globalassets/etmv/etmv-toimintakertomus-2023-liitteineen.pdf",
    );
  });

  it("requires exact, non-repeatable dry/apply arguments and a reviewed plan digest", () => {
    assert.deepEqual(parseReviewedEtmv2023Args([]), {
      apply: false,
      ack: undefined,
      expectedPlanSha256: undefined,
    });
    assert.deepEqual(
      parseReviewedEtmv2023Args([
        "--apply",
        `--ack=${REVIEWED_ETMV_2023_IDENTITY_REPAIR_APPLY_ACK}`,
        `--plan-sha256=${"a".repeat(64)}`,
      ]),
      {
        apply: true,
        ack: REVIEWED_ETMV_2023_IDENTITY_REPAIR_APPLY_ACK,
        expectedPlanSha256: "a".repeat(64),
      },
    );
    assert.throws(
      () => parseReviewedEtmv2023Args(["--apply", "--dry-run"]),
      /mutually exclusive/,
    );
    assert.throws(
      () => parseReviewedEtmv2023Args(["--ack=unused"]),
      /valid only with --apply/,
    );
    assert.throws(
      () => parseReviewedEtmv2023Args(["--apply", "--apply"]),
      /must not be repeated/,
    );
    assert.throws(
      () => parseReviewedEtmv2023Args(["--unknown"]),
      /Unknown reviewed ETMV 2023 argument/,
    );
  });

  it("replaces only exact reviewed semantic markers and refuses hash drift", () => {
    assert.equal(
      replaceReviewedEtmv2023ExactlyOnce(
        `prefix ${REVIEWED_ETMV_2023_TITLE_BEFORE} suffix`,
        REVIEWED_ETMV_2023_TITLE_BEFORE,
        REVIEWED_ETMV_2023_TITLE_AFTER,
        "fixture",
      ),
      `prefix ${REVIEWED_ETMV_2023_TITLE_AFTER} suffix`,
    );
    assert.throws(
      () =>
        replaceReviewedEtmv2023ExactlyOnce(
          "no marker",
          REVIEWED_ETMV_2023_TITLE_BEFORE,
          REVIEWED_ETMV_2023_TITLE_AFTER,
          "fixture",
        ),
      /exactly once/,
    );
    assert.throws(
      () =>
        replaceReviewedEtmv2023ExactlyOnce(
          `${REVIEWED_ETMV_2023_TITLE_BEFORE} ${REVIEWED_ETMV_2023_TITLE_BEFORE}`,
          REVIEWED_ETMV_2023_TITLE_BEFORE,
          REVIEWED_ETMV_2023_TITLE_AFTER,
          "fixture",
        ),
      /actual=2/,
    );
    assert.equal(
      reconcileReviewedEtmv2023LibraryText(
        `${REVIEWED_ETMV_2023_TITLE_BEFORE} summary`,
        "fixture",
      ),
      `${REVIEWED_ETMV_2023_TITLE_AFTER} summary`,
    );
    assert.throws(
      () => reconcileReviewedEtmv2023DocumentContent("unreviewed content"),
      /content hash drifted/,
    );
    assert.equal(
      reviewedEtmv2023LibraryAnalysisContentHash({
        summary: "summary",
        content: "content",
      }),
      sha256ReviewedEtmv2023Text("summary\n\ncontent"),
    );
    assert.notEqual(
      REVIEWED_ETMV_2023_CONTENT_HASHES.documentContentBefore,
      REVIEWED_ETMV_2023_CONTENT_HASHES.documentContentAfter,
    );
  });

  it("fails closed when any reviewed target or artifact is missing or drifted", () => {
    const missing = buildReviewedEtmv2023Plan({
      databaseIdentity,
      artifactSha256: REVIEWED_ETMV_2023_PDF_SHA256,
      collections: emptyCollections(),
    });
    assert.equal(missing.plan.atomicState, "conflict");
    assert.ok(missing.plan.conflicts.some((item) => item.code === "missing_target"));
    assert.throws(
      () => assertReviewedEtmv2023PlanReady(missing.plan),
      /conflicts or hybrid state/,
    );

    const artifactDrift = buildReviewedEtmv2023Plan({
      databaseIdentity,
      artifactSha256: "0".repeat(64),
      collections: emptyCollections(),
    });
    assert.ok(
      artifactDrift.plan.conflicts.some(
        (item) => item.code === "artifact_hash_drift",
      ),
    );
    assert.match(reviewedEtmv2023PlanSha256(missing.plan), /^[a-f0-9]{64}$/);
  });

  it("constructs full-row CAS predicates for every mutable database row", () => {
    const document = documentFixture();
    const citation = citationFixture();
    const localCitation = citationFixture(REVIEWED_ETMV_2023_LOCAL_CITATION_ID);
    const library = libraryFixture();
    const documentWhere = fullReviewedEtmv2023DocumentWhere(document);
    const citationWhere = fullReviewedEtmv2023SourceCitationWhere(citation);
    const localCitationWhere =
      fullReviewedEtmv2023SourceCitationWhere(localCitation);
    const libraryWhere = fullReviewedEtmv2023LibraryAnalysisWhere(library);

    assert.equal(documentWhere.id, document.id);
    assert.equal(documentWhere.content, document.content);
    assert.equal(documentWhere.updatedAt, document.updatedAt);
    assert.deepEqual(documentWhere.tags, { equals: document.tags });
    assert.deepEqual(documentWhere.metadata, { equals: document.metadata });
    assert.equal(citationWhere.citationText, citation.citationText);
    assert.equal(citationWhere.archivedUrl, citation.archivedUrl);
    assert.equal(citationWhere.verifiedAt, citation.verifiedAt);
    assert.equal(citationWhere.updatedAt, citation.updatedAt);
    assert.equal(localCitationWhere.localPath, localCitation.localPath);
    assert.equal(libraryWhere.aiSummary, library.aiSummary);
    assert.equal(libraryWhere.contentHash, library.contentHash);
    assert.equal(libraryWhere.updatedAt, library.updatedAt);
  });

  it("post-apply proof requires all-after and unchanged identity, seed, artifact, dependencies, and IDs", () => {
    const before: ReviewedEtmv2023Inspection = {
      plan: readyPlan("all_before"),
      collections: emptyCollections(),
    };
    const after: ReviewedEtmv2023Inspection = {
      plan: readyPlan("all_after"),
      collections: emptyCollections(),
    };
    assert.doesNotThrow(() => assertReviewedEtmv2023PostApply(before, after));

    const changedIdentity = structuredClone(after);
    changedIdentity.plan.databaseIdentity.identityUuid =
      "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    assert.throws(
      () => assertReviewedEtmv2023PostApply(before, changedIdentity),
      /post-apply identity/,
    );

    const changedDependency = structuredClone(after);
    changedDependency.plan.preservedDependencySha256 = "f".repeat(64);
    assert.throws(
      () => assertReviewedEtmv2023PostApply(before, changedDependency),
      /post-apply identity/,
    );

    const hybrid = structuredClone(after);
    hybrid.plan.atomicState = "hybrid";
    hybrid.plan.conflicts = [
      { code: "atomic_hybrid", subject: "fixture", detail: "fixture" },
    ];
    hybrid.plan.summary.conflicts = 1;
    assert.throws(
      () => assertReviewedEtmv2023PostApply(before, hybrid),
      /conflicts or hybrid state/,
    );
  });

  it("keeps Report and FieldCitation rows protected in the executable runner", () => {
    const source = readFileSync(
      "scripts/apply-reviewed-etmv-2023-identity-repair.ts",
      "utf8",
    );
    assert.match(source, /LOCK TABLE/);
    assert.match(source, /SHARE ROW EXCLUSIVE MODE/);
    assert.match(source, /isolationLevel: 'Serializable'/);
    assert.match(source, /pg_advisory_xact_lock/);
    assert.match(source, /fullReviewedEtmv2023DocumentWhere/);
    assert.match(source, /fullReviewedEtmv2023SourceCitationWhere/);
    assert.match(source, /fullReviewedEtmv2023LibraryAnalysisWhere/);
    assert.doesNotMatch(source, /transaction\.report\.update/);
    assert.doesNotMatch(source, /transaction\.fieldCitation\.update/);
    assert.doesNotMatch(source, /writeFile|rename\(|copyFile|unlink/);
  });
});
