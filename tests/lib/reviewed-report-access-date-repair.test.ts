import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { reports } from "../../prisma/seed-data/reports";
import {
  REVIEWED_REPORT_LOCATOR_REPAIRS,
  UNRESOLVED_REPORT_ACCESS_DATE_IDS,
} from "../../src/lib/citations/reviewed-report-access-date-batch";
import {
  REVIEWED_ETMV_REPORT_ID,
  REVIEWED_ETMV_REPORT_TITLE_AFTER,
  REVIEWED_ETMV_REPORT_TITLE_BEFORE,
} from "../../src/lib/citations/reviewed-etmv-report-title-repair";
import {
  POST_MANIFEST_EXTERNAL_REPORT_ACCESS_GAP_IDS,
  POST_PROVENANCE_HISTORICAL_UNRESOLVED_REPORT_IDS,
  POST_PROVENANCE_REMOVED_UNRESOLVED_REPORT_IDS,
  POST_PROVENANCE_REPORT_ACCESS_QUEUE_IDS_SHA256,
  POST_PROVENANCE_REPORT_ACCESS_QUEUE_ROWS,
  POST_PROVENANCE_REPORT_ACCESS_QUEUE_ROW_SHA256,
  POST_PROVENANCE_REPORT_ACCESS_QUEUE_ROWS_SHA256,
  PINNED_REVIEWED_REPORT_ACCESS_DATE_MANIFEST_SHA256,
  REVIEWED_REPORT_ACCESS_DATE_TARGETS,
  REVIEWED_REPORT_ACCESS_REVIEWS,
  buildReviewedReportAccessDateRepairPlan,
  normalizeReportSeedSnapshot,
  reviewedReportAccessDateRepairPlanSha256,
  validateReviewedReportAccessDateQueueState,
  validateReviewedReportAccessDateManifest,
  validateReviewedReportAccessDateProvenanceOverlay,
  validateReviewedReportAccessDateSeedTargets,
  type LinkedReportDocumentSnapshot,
  type ReportDatabaseSnapshot,
} from "../../scripts/repair-reviewed-report-access-dates";

function databaseSnapshots(
  state: "before" | "after",
): ReportDatabaseSnapshot[] {
  return REVIEWED_REPORT_ACCESS_DATE_TARGETS.map((target) => {
    const seedRow = reports.find((row) => row.id === target.id);
    assert.ok(seedRow);
    return {
      ...normalizeReportSeedSnapshot(seedRow),
      sourceUrl: state === "before" ? target.urlBefore : target.urlAfter,
      accessedAt: state === "before" ? null : target.accessDate,
      documentId: `document-${target.id}`,
    };
  });
}

function documentSnapshots(
  state: "before" | "after",
): LinkedReportDocumentSnapshot[] {
  const specs = [
    {
      reportId: "norgesgruppen-halvarsrapport-h1-2025",
      url:
        state === "before"
          ? "https://www.norgesgruppen.no/finans/finans-hjem/rapporter/"
          : REVIEWED_REPORT_LOCATOR_REPAIRS[
              "norgesgruppen-halvarsrapport-h1-2025"
            ],
      accessedAt: state === "before" ? null : "2026-07-20",
    },
    {
      reportId: "kesko-annual-report-2024",
      url: "http://kesko.fi/4930ac/contentassets/2e27fbfe66fb4e97a8c683de564a73d2/kesko-annual-report-2024.pdf",
      accessedAt: null,
    },
    {
      reportId: "salling-group-2024",
      url: "https://digitalassets.sallinggroup.com/raw/upload/fl_attachment%3AAnnual%20report%202024%252epdf/external_content_providers/magnolia/next/jcr%3Ac5f40c7a-153b-434d-8d7f-3c1eafb3dafe",
      accessedAt: null,
    },
  ];
  return specs.map((spec) => ({
    reportId: spec.reportId,
    id: `document-${spec.reportId}`,
    slug: `report-${spec.reportId}`,
    filePath: `research/evidence-pack/${spec.reportId}.pdf`,
    title: spec.reportId,
    author: "Reviewed institution",
    year: 2025,
    documentType: "report",
    category: "bibliotek",
    subcategory: "reports",
    country: "NO",
    content: `Exact local content for ${spec.reportId}`,
    summary: `Reviewed summary for ${spec.reportId}`,
    url: spec.url,
    accessedAt: spec.accessedAt,
    archivedUrl: null,
    wordCount: 6,
    tags: ["report"],
    metadata: { reportId: spec.reportId },
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-07-19T00:00:00.000Z",
  }));
}

describe("reviewed Report work-level access-date repair", () => {
  it("pins all 66 queue rows while restricting mutation to 55 verified works", () => {
    validateReviewedReportAccessDateManifest();
    validateReviewedReportAccessDateSeedTargets(reports);

    assert.match(
      PINNED_REVIEWED_REPORT_ACCESS_DATE_MANIFEST_SHA256,
      /^[a-f0-9]{64}$/,
    );
    assert.equal(REVIEWED_REPORT_ACCESS_REVIEWS.length, 66);
    assert.equal(REVIEWED_REPORT_ACCESS_DATE_TARGETS.length, 55);
    assert.deepEqual(
      Object.fromEntries(
        [
          "exact_verified",
          "locator_repair_verified",
          "generic_or_misbound_unresolved",
          "bot_only_unverified",
          "dead_unresolved",
        ].map((classification) => [
          classification,
          REVIEWED_REPORT_ACCESS_REVIEWS.filter(
            (review) => review.classification === classification,
          ).length,
        ]),
      ),
      {
        exact_verified: 52,
        locator_repair_verified: 3,
        generic_or_misbound_unresolved: 11,
        bot_only_unverified: 0,
        dead_unresolved: 0,
      },
    );
    assert.deepEqual(
      REVIEWED_REPORT_ACCESS_REVIEWS.filter(
        (review) => review.classification === "generic_or_misbound_unresolved",
      ).map((review) => review.id),
      [...UNRESOLVED_REPORT_ACCESS_DATE_IDS],
    );
    assert.deepEqual(
      REVIEWED_REPORT_ACCESS_REVIEWS.filter(
        (review) => review.classification === "locator_repair_verified",
      ).map((review) => [review.id, review.urlAfter]),
      Object.entries(REVIEWED_REPORT_LOCATOR_REPAIRS),
    );
  });

  it("updates only verified seed rows and leaves every unresolved row untouched", () => {
    for (const target of REVIEWED_REPORT_ACCESS_DATE_TARGETS) {
      const seedRow = reports.find((row) => row.id === target.id);
      assert.ok(seedRow);
      assert.equal(seedRow.sourceUrl, target.urlAfter);
      assert.equal(seedRow.accessedAt, "2026-07-20");
    }
    for (const id of UNRESOLVED_REPORT_ACCESS_DATE_IDS) {
      const seedRow = reports.find((row) => row.id === id);
      const review = REVIEWED_REPORT_ACCESS_REVIEWS.find(
        (row) => row.id === id,
      );
      assert.ok(seedRow);
      assert.ok(review);
      assert.equal(seedRow.sourceUrl, review.urlBefore);
      assert.equal(seedRow.accessedAt, undefined);
    }
  });

  it("accepts only the exact pre-apply queue or exact 9-row post-provenance residual", () => {
    const manifest = JSON.parse(
      readFileSync(
        "research/_status/reviewed-report-access-date-manifest-2026-07-20.json",
        "utf8",
      ),
    ) as { queueGeneratedAt: string };
    const manifestQueueRows = REVIEWED_REPORT_ACCESS_REVIEWS.map((review) => ({
      id: review.id,
      title: review.title,
      url: review.urlBefore,
    }));
    const historicalUnresolved = new Set<string>(
      UNRESOLVED_REPORT_ACCESS_DATE_IDS,
    );
    const historicalElevenRows = manifestQueueRows.filter((row) =>
      historicalUnresolved.has(row.id),
    );
    const residualRows = POST_PROVENANCE_REPORT_ACCESS_QUEUE_ROWS.map((row) => ({
      ...row,
    }));
    const laterQueueGeneratedAt = "2026-07-20T02:52:59.668Z";
    const validate = (
      queueRows: typeof manifestQueueRows,
      queueGeneratedAt = laterQueueGeneratedAt,
    ) =>
      validateReviewedReportAccessDateQueueState({
        queueGeneratedAt,
        manifestQueueGeneratedAt: manifest.queueGeneratedAt,
        queueRows,
        manifestQueueRows,
        unresolvedIds: UNRESOLVED_REPORT_ACCESS_DATE_IDS,
      });

    assert.equal(
      validate(manifestQueueRows, manifest.queueGeneratedAt),
      "pre_apply_full_scope",
    );
    assert.equal(
      validate(residualRows),
      "post_provenance_unresolved_residual",
    );

    assert.throws(() => validate(historicalElevenRows), /exact 9-row/);
    assert.throws(() => validate(residualRows.slice(1)), /exact 9-row/);
    assert.throws(
      () =>
        validate([
          ...residualRows,
          {
            id: "unknown-report",
            title: "Unknown Report",
            url: "https://example.invalid/unknown",
          },
        ]),
      /exact 9-row/,
    );
    assert.throws(
      () =>
        validate([
          ...residualRows.slice(0, -1),
          manifestQueueRows.find(
            (row) => row.id === REVIEWED_REPORT_ACCESS_DATE_TARGETS[0]!.id,
          )!,
        ]),
      /exact 9-row/,
    );
    assert.throws(
      () => validate(residualRows, manifest.queueGeneratedAt),
      /exact 9-row/,
    );
    assert.throws(
      () => validate([...residualRows].reverse()),
      /exact 9-row/,
    );
  });

  it("pins the seven-row provenance overlay and every exact 9-row residual hash", () => {
    assert.deepEqual(validateReviewedReportAccessDateProvenanceOverlay(), {
      retainedHistoricalIds: [
        ...POST_PROVENANCE_HISTORICAL_UNRESOLVED_REPORT_IDS,
      ],
      removedHistoricalIds: [
        ...POST_PROVENANCE_REMOVED_UNRESOLVED_REPORT_IDS,
      ],
      postManifestIds: [...POST_MANIFEST_EXTERNAL_REPORT_ACCESS_GAP_IDS],
    });
    assert.deepEqual(
      POST_PROVENANCE_REPORT_ACCESS_QUEUE_ROWS.map((row) => row.id),
      [
        "akademia-sifo-kundeprogram-2026",
        "arla-farmahead-check-2024",
        "beredskap-nibio-selvforsyning-2026",
        "beredskap-nibio-selvforsyning-metode",
        "coop-2024",
        "dk-salling-coop-decision-2025",
        "emv-kartlegging-2023",
        "kt-markedsundersokelser-2026",
        "meld-st-4-dagligvare",
      ],
    );
    assert.equal(
      POST_PROVENANCE_REPORT_ACCESS_QUEUE_IDS_SHA256,
      "eb8ee51bae174d8f5a3b01fe20c0046a18d6b3e512c8f980175192aadcb9a963",
    );
    assert.equal(
      POST_PROVENANCE_REPORT_ACCESS_QUEUE_ROWS_SHA256,
      "ff3f038fb03735ba35fb21f28b85317f5f43d1a5d64fe9fbdd4f5583cf9a1701",
    );
    assert.deepEqual(POST_PROVENANCE_REPORT_ACCESS_QUEUE_ROW_SHA256, {
      "akademia-sifo-kundeprogram-2026":
        "f63abb1ef579382eec29f1984c538c91e01396f8c50054553595469f1b3e65cc",
      "arla-farmahead-check-2024":
        "02750be88f25baf31cc0035f7031068075e93281398a9949200429642d3753ac",
      "beredskap-nibio-selvforsyning-2026":
        "56d3a0fe99d024aaa152fd87e67da4a71173947de9e6fe09bcdca421dff764e6",
      "beredskap-nibio-selvforsyning-metode":
        "80e282862d2acd1ffd6a2d876a82599aca74091c1dcc3b69c2ffbab6d0cdb8f3",
      "coop-2024":
        "ff25c26973799fb068ebfac0f8a661d4c76f36b26dce2cf171aa08f514655685",
      "dk-salling-coop-decision-2025":
        "92a147c8eaaaa2eb6a97c8ca1b65d5b7667c7f0c77a49a921826982d770b1333",
      "emv-kartlegging-2023":
        "0a3b65bc48283d09611b1dfc3a764f754ff57a78da9413f6ba738b043f94a6cb",
      "kt-markedsundersokelser-2026":
        "47f481b1ae8e57670bf333f140b2b173e12aaac06614302c543e25819a123a68",
      "meld-st-4-dagligvare":
        "7c53796ec6c1e7206a1d04b0672806a4a7283d0475c485933c12c79620351931",
    });
  });

  it("builds a deterministic full-row 55-update plan", () => {
    const plan = buildReviewedReportAccessDateRepairPlan(
      databaseSnapshots("before"),
      documentSnapshots("before"),
    );
    assert.deepEqual(plan.summary, {
      total: 55,
      pending: 55,
      alreadyApplied: 0,
      linkedDocumentPending: 1,
      linkedDocumentAlreadyApplied: 0,
      protectedLinkedDocuments: 2,
      conflicts: 0,
    });
    assert.ok(
      plan.updates.every(
        (update) =>
          /^[a-f0-9]{64}$/.test(update.beforeSha256) &&
          /^[a-f0-9]{64}$/.test(update.afterSha256) &&
          update.beforeSha256 !== update.afterSha256,
      ),
    );
    assert.equal(
      plan.linkedDocumentUpdate?.reportId,
      "norgesgruppen-halvarsrapport-h1-2025",
    );
    assert.deepEqual(
      plan.protectedLinkedDocuments.map((row) => row.reportId),
      ["kesko-annual-report-2024", "salling-group-2024"],
    );
    assert.equal(
      reviewedReportAccessDateRepairPlanSha256(plan),
      reviewedReportAccessDateRepairPlanSha256(plan),
    );
  });

  it("is idempotent after all reviewed dates and locator repairs are present", () => {
    const plan = buildReviewedReportAccessDateRepairPlan(
      databaseSnapshots("after"),
      documentSnapshots("after"),
    );
    assert.deepEqual(plan.summary, {
      total: 55,
      pending: 0,
      alreadyApplied: 55,
      linkedDocumentPending: 0,
      linkedDocumentAlreadyApplied: 1,
      protectedLinkedDocuments: 2,
      conflicts: 0,
    });
    assert.equal(plan.updates.length, 0);
  });

  it("binds and preserves both exact states of the reviewed ETMV title overlay", () => {
    const appliedBeforeTitleRepair = databaseSnapshots("after");
    const targetIndex = appliedBeforeTitleRepair.findIndex(
      (row) => row.id === REVIEWED_ETMV_REPORT_ID,
    );
    assert.notEqual(targetIndex, -1);
    assert.equal(
      appliedBeforeTitleRepair[targetIndex]?.title,
      REVIEWED_ETMV_REPORT_TITLE_AFTER,
    );
    appliedBeforeTitleRepair[targetIndex] = {
      ...appliedBeforeTitleRepair[targetIndex]!,
      title: REVIEWED_ETMV_REPORT_TITLE_BEFORE,
    };
    const idempotent = buildReviewedReportAccessDateRepairPlan(
      appliedBeforeTitleRepair,
      documentSnapshots("after"),
    );
    assert.equal(idempotent.summary.alreadyApplied, 55);
    assert.equal(idempotent.summary.conflicts, 0);

    const pendingBeforeTitleRepair = databaseSnapshots("before");
    pendingBeforeTitleRepair[targetIndex] = {
      ...pendingBeforeTitleRepair[targetIndex]!,
      title: REVIEWED_ETMV_REPORT_TITLE_BEFORE,
    };
    const pending = buildReviewedReportAccessDateRepairPlan(
      pendingBeforeTitleRepair,
      documentSnapshots("before"),
    );
    const targetUpdate = pending.updates.find(
      (update) => update.target.id === REVIEWED_ETMV_REPORT_ID,
    );
    assert.equal(
      targetUpdate?.beforeSnapshot.title,
      REVIEWED_ETMV_REPORT_TITLE_BEFORE,
    );
    assert.equal(pending.summary.conflicts, 0);

    appliedBeforeTitleRepair[targetIndex] = {
      ...appliedBeforeTitleRepair[targetIndex]!,
      title: "Unreviewed ETMV title",
    };
    const drift = buildReviewedReportAccessDateRepairPlan(
      appliedBeforeTitleRepair,
      documentSnapshots("after"),
    );
    assert.match(
      drift.conflicts.find(
        (conflict) => conflict.id === REVIEWED_ETMV_REPORT_ID,
      )?.detail ?? "",
      /title/,
    );
  });

  it("fails closed on missing, content-drifted, partial, or previously dated rows", () => {
    const missing = buildReviewedReportAccessDateRepairPlan(
      databaseSnapshots("before").slice(1),
      documentSnapshots("before"),
    );
    assert.equal(missing.conflicts.length, 1);

    const contentDrift = databaseSnapshots("before");
    contentDrift[0] = {
      ...contentDrift[0]!,
      keyFindings: [...contentDrift[0]!.keyFindings, "Unreviewed finding"],
    };
    assert.match(
      buildReviewedReportAccessDateRepairPlan(
        contentDrift,
        documentSnapshots("before"),
      ).conflicts[0]?.detail ?? "",
      /keyFindings/,
    );

    const partial = databaseSnapshots("before");
    const repairIndex = REVIEWED_REPORT_ACCESS_DATE_TARGETS.findIndex(
      (target) => target.id === "kesko-annual-report-2024",
    );
    partial[repairIndex] = {
      ...partial[repairIndex]!,
      sourceUrl: REVIEWED_REPORT_ACCESS_DATE_TARGETS[repairIndex]!.urlAfter,
    };
    assert.match(
      buildReviewedReportAccessDateRepairPlan(
        partial,
        documentSnapshots("before"),
      ).conflicts.find((conflict) => conflict.id === "kesko-annual-report-2024")
        ?.detail ?? "",
      /sourceUrl/,
    );

    const previouslyDated = databaseSnapshots("before");
    previouslyDated[2] = {
      ...previouslyDated[2]!,
      accessedAt: "2026-07-18",
    };
    assert.match(
      buildReviewedReportAccessDateRepairPlan(
        previouslyDated,
        documentSnapshots("before"),
      ).conflicts[0]?.detail ?? "",
      /accessedAt/,
    );

    const mixedBatch = databaseSnapshots("before");
    mixedBatch[0] = databaseSnapshots("after")[0]!;
    assert.match(
      buildReviewedReportAccessDateRepairPlan(
        mixedBatch,
        documentSnapshots("before"),
      ).conflicts.find((row) => row.id === "Batch:Report")?.detail ?? "",
      /partially applied/,
    );

    assert.match(
      buildReviewedReportAccessDateRepairPlan(
        databaseSnapshots("before"),
        documentSnapshots("after"),
      ).conflicts.find((row) => row.id.startsWith("Batch:"))?.detail ?? "",
      /partial state/,
    );
  });

  it("binds relationship state into the reviewed plan SHA", () => {
    const initial = databaseSnapshots("before");
    const relationshipDrift = databaseSnapshots("before");
    relationshipDrift[0] = {
      ...relationshipDrift[0]!,
      documentId: "different-document",
    };
    assert.notEqual(
      reviewedReportAccessDateRepairPlanSha256(
        buildReviewedReportAccessDateRepairPlan(
          initial,
          documentSnapshots("before"),
        ),
      ),
      reviewedReportAccessDateRepairPlanSha256(
        buildReviewedReportAccessDateRepairPlan(
          relationshipDrift,
          documentSnapshots("before"),
        ),
      ),
    );
  });

  it("binds linked-Document content and fails closed on relation or protected-URL drift", () => {
    const reportsBefore = databaseSnapshots("before");

    const contentDrift = documentSnapshots("before");
    contentDrift[0] = {
      ...contentDrift[0]!,
      content: `${contentDrift[0]!.content} unreviewed`,
    };
    const contentPlan = buildReviewedReportAccessDateRepairPlan(
      reportsBefore,
      contentDrift,
    );
    assert.notEqual(
      contentPlan.linkedDocumentUpdate?.beforeSha256,
      buildReviewedReportAccessDateRepairPlan(
        reportsBefore,
        documentSnapshots("before"),
      ).linkedDocumentUpdate?.beforeSha256,
    );

    const brokenRelation = databaseSnapshots("before");
    const norgesIndex = brokenRelation.findIndex(
      (row) => row.id === "norgesgruppen-halvarsrapport-h1-2025",
    );
    brokenRelation[norgesIndex] = {
      ...brokenRelation[norgesIndex]!,
      documentId: "different-document",
    };
    assert.match(
      buildReviewedReportAccessDateRepairPlan(
        brokenRelation,
        documentSnapshots("before"),
      ).conflicts.find((row) => row.id.startsWith("Document:"))?.detail ?? "",
      /Report\.documentId/,
    );

    const protectedUrlDrift = documentSnapshots("before");
    protectedUrlDrift[1] = {
      ...protectedUrlDrift[1]!,
      url: "https://example.invalid/not-reviewed.pdf",
    };
    assert.match(
      buildReviewedReportAccessDateRepairPlan(
        reportsBefore,
        protectedUrlDrift,
      ).conflicts.find((row) => row.id === "Document:kesko-annual-report-2024")
        ?.detail ?? "",
      /Protected linked Document/,
    );
  });

  it("keeps apply behind plan ACK, row locks, Serializable, and full-field CAS", () => {
    const source = readFileSync(
      "scripts/repair-reviewed-report-access-dates.ts",
      "utf8",
    );
    const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
      scripts: Record<string, string>;
    };
    assert.equal(
      packageJson.scripts["repair:reviewed-report-access-dates"],
      "tsx scripts/repair-reviewed-report-access-dates.ts",
    );
    assert.match(source, /--apply requires --ack=\$\{APPLY_ACK\}/);
    assert.match(source, /--plan-sha256=<64 lowercase hex>/);
    assert.match(source, /pg_advisory_xact_lock/);
    assert.match(source, /FOR UPDATE/);
    assert.match(source, /updateMany/);
    assert.match(source, /transaction\.document\.updateMany/);
    assert.match(source, /keyFindings: \{ equals: row\.keyFindings \}/);
    assert.match(source, /recommendations: \{ equals: row\.recommendations \}/);
    assert.match(source, /supportingSources:/);
    assert.match(source, /documentId: row\.documentId/);
    assert.match(source, /isolationLevel: 'Serializable'/);

    const importer = readFileSync("scripts/import-ts-data.ts", "utf8");
    assert.doesNotMatch(importer, /prisma\.report\.findUnique\(/);
    assert.match(
      importer,
      /guardedSeedAccessMetadata[\s\S]*seedAccessDate: r\.accessedAt/,
    );
    assert.match(
      importer,
      /prisma\.report\.updateMany\(\{[\s\S]*where: \{ id: r\.id, accessedAt: null \}[\s\S]*data: \{ sourceUrl: r\.sourceUrl \?\? null \}/,
    );
    const reportImport = importer.slice(
      importer.indexOf("async function importReports()"),
      importer.indexOf("async function importCountryMetrics()"),
    );
    const reportUpdate = reportImport.slice(
      reportImport.indexOf("update: {"),
      reportImport.indexOf("create: {"),
    );
    assert.doesNotMatch(reportUpdate, /accessedAt:/);
    assert.doesNotMatch(reportUpdate, /provenanceType:/);
  });
});
