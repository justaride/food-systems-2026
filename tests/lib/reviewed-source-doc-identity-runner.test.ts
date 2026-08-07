import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  REVIEWED_SOURCE_DOC_IDENTITY_DATABASE_APPLY_ACK,
  assertReviewedSourceDocIdentityDatabasePlanReady,
  assertReviewedSourceDocIdentityPostApply,
  buildReviewedSourceDocIdentityDatabasePlan,
  buildReviewedSourceDocIdentityDependencySnapshot,
  fullReviewedSourceDocIdentitySnapshotWhere,
  parseReviewedSourceDocIdentityDatabaseArgs,
  portableSourceDocIdentityToDatabaseRow,
  reviewedSourceDocIdentityDatabasePlanSha256,
  reviewedSourceDocIdentityUpdateData,
  type ReviewedSourceDocIdentityDatabaseIdentity,
  type ReviewedSourceDocIdentityDatabaseInspection,
  type ReviewedSourceDocIdentityDatabasePlan,
  type ReviewedSourceDocIdentityDependencyCollections,
} from "../../scripts/apply-reviewed-source-doc-identity-repair";
import {
  REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS,
  REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS,
} from "../../src/lib/citations/reviewed-source-doc-identity-repair";

const databaseIdentity: ReviewedSourceDocIdentityDatabaseIdentity = {
  currentDatabase: "foodsystems",
  key: "primary",
  identityUuid: "90e3e24d-230f-42f7-b178-5bcd5b861e84",
  createdAt: "2026-07-20T08:00:00.000Z",
};

type MutableDependencyCollections = {
  -readonly [Name in keyof ReviewedSourceDocIdentityDependencyCollections]: ReviewedSourceDocIdentityDependencyCollections[Name];
};

function dependencyFixtures(): ReviewedSourceDocIdentityDependencyCollections {
  return {
    documents: [
      {
        id: "doc-1",
        title: "Bound document",
        updatedAt: new Date("2026-07-20T09:00:00.000Z"),
      },
    ],
    documentRefs: [{ id: "doc-ref-1", fromId: "doc-1", toId: "other" }],
    documentSourceDocBindings: [
      { id: "src-16", documentId: "doc-1" },
    ],
    reportDocumentConsumers: [
      { id: "report-1", documentId: "doc-1", title: "Report" },
    ],
    thesisDocumentConsumers: [
      { id: "thesis-1", documentId: "doc-1", title: "Thesis" },
    ],
    sourceCitations: [
      { id: "citation-1", sourceDocId: "src-16", documentId: "doc-1" },
    ],
    fieldCitations: [
      {
        id: "field-1",
        citationId: "citation-1",
        entityType: "SourceDoc",
        entityId: "src-16",
      },
    ],
    libraryAnalysisRecords: [
      {
        id: "library-1",
        sourceDocId: "src-16",
        sourceKey: "source_doc:src-16",
      },
    ],
    evidenceAppraisals: [
      {
        id: "appraisal-1",
        sourceDocId: "src-16",
        reviewBasisCitationId: "citation-1",
      },
    ],
    sourceRefs: [{ id: "source-ref-1", sourceDocId: "src-16" }],
    mediaEntries: [{ id: "media-1", sourceDocId: "src-16" }],
    sourceDocInsightLinks: [
      {
        id: "insight-1->src-16",
        insightId: "insight-1",
        sourceDocId: "src-16",
      },
    ],
    insights: [{ id: "insight-1", primaryCitationId: "citation-1" }],
    producerCitationConsumers: [
      { id: "producer-1", primaryCitationId: "citation-1" },
    ],
    opportunitySourceConsumers: [
      { id: "opportunity-1", sourceIds: ["src-16"] },
    ],
    insightDocumentRefs: [
      { id: "insight-doc-1", insightId: "insight-1", documentId: "doc-1" },
    ],
    companyDocumentRefs: [
      { id: "company-doc-1", companyId: "company-1", documentId: "doc-1" },
    ],
    actorDocumentRefs: [
      { id: "actor-doc-1", actorId: "actor-1", documentId: "doc-1" },
    ],
  } as MutableDependencyCollections;
}

function dependencies(
  identity: ReviewedSourceDocIdentityDatabaseIdentity = databaseIdentity,
) {
  return buildReviewedSourceDocIdentityDependencySnapshot(
    identity,
    dependencyFixtures(),
  );
}

function targetRows(which: "before" | "after") {
  return REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS.map((repair, index) =>
    portableSourceDocIdentityToDatabaseRow(
      repair[which],
      index === 0 ? "doc-1" : null,
    ),
  );
}

function inspection(
  plan: ReviewedSourceDocIdentityDatabasePlan,
): ReviewedSourceDocIdentityDatabaseInspection {
  return {
    plan,
    targetRows: [],
    dependencySnapshot: {},
    dependencyIds: dependencies().ids,
  };
}

describe("reviewed three-row SourceDoc identity database runner", () => {
  it("defaults to dry-run and accepts only unambiguous apply arguments", () => {
    assert.deepEqual(parseReviewedSourceDocIdentityDatabaseArgs([]), {
      apply: false,
      ack: undefined,
      expectedPlanSha256: undefined,
    });
    assert.deepEqual(
      parseReviewedSourceDocIdentityDatabaseArgs([
        "--apply",
        `--ack=${REVIEWED_SOURCE_DOC_IDENTITY_DATABASE_APPLY_ACK}`,
        `--plan-sha256=${"a".repeat(64)}`,
      ]),
      {
        apply: true,
        ack: REVIEWED_SOURCE_DOC_IDENTITY_DATABASE_APPLY_ACK,
        expectedPlanSha256: "a".repeat(64),
      },
    );
    assert.throws(
      () =>
        parseReviewedSourceDocIdentityDatabaseArgs([
          "--apply",
          "--dry-run",
        ]),
      /mutually exclusive/,
    );
    assert.throws(
      () => parseReviewedSourceDocIdentityDatabaseArgs(["--ack=unused"]),
      /valid only with --apply/,
    );
    assert.throws(
      () => parseReviewedSourceDocIdentityDatabaseArgs(["--apply", "--apply"]),
      /must not be repeated/,
    );
    assert.throws(
      () => parseReviewedSourceDocIdentityDatabaseArgs(["--unknown"]),
      /Unknown reviewed SourceDoc identity argument/,
    );
  });

  it("materializes Prisma year as String and accessedAt as Date", () => {
    const before = portableSourceDocIdentityToDatabaseRow(
      REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS[1].before,
      "doc-24",
    );
    const after = portableSourceDocIdentityToDatabaseRow(
      REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS[1].after,
      "doc-24",
    );
    assert.equal(before.year, "2014");
    assert.equal(before.accessedAt, null);
    assert.equal(after.year, "2013");
    assert.ok(after.accessedAt instanceof Date);
    assert.equal(after.accessedAt?.toISOString(), "2026-07-20T00:00:00.000Z");
  });

  it("requires exact all-before or all-after state and fails closed on hybrids, missing rows, duplicates, and drift", () => {
    const before = buildReviewedSourceDocIdentityDatabasePlan(
      targetRows("before"),
      databaseIdentity,
      dependencies(),
    );
    const after = buildReviewedSourceDocIdentityDatabasePlan(
      targetRows("after"),
      databaseIdentity,
      dependencies(),
    );
    assert.equal(before.atomicState, "all_before");
    assert.equal(before.summary.pending, 3);
    assert.equal(after.atomicState, "all_after");
    assert.equal(after.summary.applied, 3);
    assert.equal(assertReviewedSourceDocIdentityDatabasePlanReady(before), "all_before");
    assert.equal(assertReviewedSourceDocIdentityDatabasePlanReady(after), "all_after");

    const hybrid = targetRows("before");
    hybrid[0] = targetRows("after")[0]!;
    const hybridPlan = buildReviewedSourceDocIdentityDatabasePlan(
      hybrid,
      databaseIdentity,
      dependencies(),
    );
    assert.equal(hybridPlan.atomicState, "conflict");
    assert.match(hybridPlan.conflicts[0]!.reason, /atomic_hybrid/);

    const missingPlan = buildReviewedSourceDocIdentityDatabasePlan(
      targetRows("before").slice(1),
      databaseIdentity,
      dependencies(),
    );
    assert.equal(missingPlan.conflicts[0]?.reason, "missing_row");

    const duplicated = targetRows("before");
    duplicated.push(structuredClone(duplicated[0]!));
    const duplicatePlan = buildReviewedSourceDocIdentityDatabasePlan(
      duplicated,
      databaseIdentity,
      dependencies(),
    );
    assert.equal(duplicatePlan.conflicts[0]?.reason, "duplicate_row");

    const drifted = targetRows("before");
    drifted[0] = { ...drifted[0]!, filename: "unreviewed-name.md" };
    const driftPlan = buildReviewedSourceDocIdentityDatabasePlan(
      drifted,
      databaseIdentity,
      dependencies(),
    );
    assert.equal(driftPlan.conflicts[0]?.reason, "protected_field_drift");

    const wrongTime = targetRows("after");
    wrongTime[0] = {
      ...wrongTime[0]!,
      accessedAt: new Date("2026-07-20T12:00:00.000Z"),
    };
    const wrongTimePlan = buildReviewedSourceDocIdentityDatabasePlan(
      wrongTime,
      databaseIdentity,
      dependencies(),
    );
    assert.equal(
      wrongTimePlan.conflicts[0]?.reason,
      "identity_snapshot_drift",
    );

    const wrongProvenance = targetRows("before");
    wrongProvenance[0] = {
      ...wrongProvenance[0]!,
      provenanceType: "unknown",
    };
    const wrongProvenancePlan = buildReviewedSourceDocIdentityDatabasePlan(
      wrongProvenance,
      databaseIdentity,
      dependencies(),
    );
    assert.equal(
      wrongProvenancePlan.conflicts[0]?.reason,
      "protected_field_drift",
    );
  });

  it("hashes DatabaseIdentity and every explicitly enumerated dependency deterministically", () => {
    const first = dependencies();
    const reorderedFixtures = {
      ...dependencyFixtures(),
      sourceCitations: [
        { id: "citation-2" },
        ...dependencyFixtures().sourceCitations,
      ],
    };
    const ordered = buildReviewedSourceDocIdentityDependencySnapshot(
      databaseIdentity,
      reorderedFixtures,
    );
    const reversed = buildReviewedSourceDocIdentityDependencySnapshot(
      databaseIdentity,
      {
        ...reorderedFixtures,
        sourceCitations: [...reorderedFixtures.sourceCitations].reverse(),
      },
    );
    assert.equal(ordered.sha256, reversed.sha256);
    assert.match(first.sha256, /^[a-f0-9]{64}$/);
    assert.equal(first.counts.databaseIdentity, 1);
    for (const name of Object.keys(dependencyFixtures()) as Array<
      keyof ReviewedSourceDocIdentityDependencyCollections
    >) {
      assert.equal(first.counts[name], 1, name);
      assert.equal(first.ids[name].length, 1, name);
    }
    assert.match(
      JSON.stringify(first.snapshot),
      /2026-07-20T09:00:00.000Z/,
    );

    const identityDrift = { ...databaseIdentity, currentDatabase: "other" };
    assert.notEqual(dependencies(identityDrift).sha256, first.sha256);
    for (const name of Object.keys(dependencyFixtures()) as Array<
      keyof ReviewedSourceDocIdentityDependencyCollections
    >) {
      const changed = dependencyFixtures() as MutableDependencyCollections;
      changed[name] = changed[name].map((row, index) =>
        index === 0 ? { ...row, driftProbe: name } : row,
      );
      assert.notEqual(
        buildReviewedSourceDocIdentityDependencySnapshot(
          databaseIdentity,
          changed,
        ).sha256,
        first.sha256,
        name,
      );
    }

    const duplicate = dependencyFixtures() as MutableDependencyCollections;
    duplicate.sourceRefs = [
      ...duplicate.sourceRefs,
      structuredClone(duplicate.sourceRefs[0]!),
    ];
    assert.throws(
      () =>
        buildReviewedSourceDocIdentityDependencySnapshot(
          databaseIdentity,
          duplicate,
        ),
      /duplicate ids/,
    );
  });

  it("builds full-row SourceDoc CAS and writes only manifest fields", () => {
    for (const repair of REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS) {
      const before = portableSourceDocIdentityToDatabaseRow(
        repair.before,
        `document:${repair.id}`,
      );
      const where = fullReviewedSourceDocIdentitySnapshotWhere(before) as Record<
        string,
        unknown
      >;
      assert.deepEqual(Object.keys(where), [
        "id",
        "filename",
        "title",
        "author",
        "year",
        "sourceType",
        "description",
        "relevance",
        "url",
        "isDuplicate",
        "doi",
        "publisher",
        "provenanceType",
        "accessedAt",
        "archivedUrl",
        "documentId",
      ]);
      assert.equal(where.documentId, `document:${repair.id}`);
      const data = reviewedSourceDocIdentityUpdateData(repair) as Record<
        string,
        unknown
      >;
      assert.deepEqual(Object.keys(data), [...repair.mutatedFields]);
      for (const protectedField of [
        "id",
        "filename",
        "sourceType",
        "description",
        "relevance",
        "isDuplicate",
        "doi",
        "provenanceType",
        "archivedUrl",
        "documentId",
      ]) {
        assert.equal(protectedField in data, false, `${repair.id}:${protectedField}`);
      }
    }
    const src24 = reviewedSourceDocIdentityUpdateData(
      REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS[1],
    ) as Record<string, unknown>;
    assert.equal(src24.year, "2013");
    assert.ok(src24.accessedAt instanceof Date);
  });

  it("binds identity, dependency state, target rows, and Document bindings into the plan hash", () => {
    const plan = buildReviewedSourceDocIdentityDatabasePlan(
      targetRows("before"),
      databaseIdentity,
      dependencies(),
    );
    const digest = reviewedSourceDocIdentityDatabasePlanSha256(plan);
    assert.match(digest, /^[a-f0-9]{64}$/);
    assert.equal(
      reviewedSourceDocIdentityDatabasePlanSha256(structuredClone(plan)),
      digest,
    );

    const identityDrift = {
      ...plan,
      databaseIdentity: {
        ...plan.databaseIdentity,
        identityUuid: "90e3e24d-230f-42f7-b178-5bcd5b861e85",
      },
    };
    assert.notEqual(
      reviewedSourceDocIdentityDatabasePlanSha256(identityDrift),
      digest,
    );
    const dependencyDrift = { ...plan, dependencySha256: "c".repeat(64) };
    assert.notEqual(
      reviewedSourceDocIdentityDatabasePlanSha256(dependencyDrift),
      digest,
    );
    const bindingDrift = {
      ...plan,
      targetDocumentBindings: plan.targetDocumentBindings.map(
        (binding, index) =>
          index === 0 ? { ...binding, documentId: "doc-other" } : binding,
      ),
    };
    assert.notEqual(
      reviewedSourceDocIdentityDatabasePlanSha256(bindingDrift),
      digest,
    );
    const rowDrift = {
      ...plan,
      rows: plan.rows.map((row, index) =>
        index === 0
          ? { ...row, currentFullDatabaseRowSha256: "d".repeat(64) }
          : row,
      ),
    };
    assert.notEqual(
      reviewedSourceDocIdentityDatabasePlanSha256(rowDrift),
      digest,
    );
  });

  it("turns every failed postcondition into a rollback-triggering exception", () => {
    const beforePlan = buildReviewedSourceDocIdentityDatabasePlan(
      targetRows("before"),
      databaseIdentity,
      dependencies(),
    );
    const afterPlan = buildReviewedSourceDocIdentityDatabasePlan(
      targetRows("after"),
      databaseIdentity,
      dependencies(),
    );
    const before = inspection(beforePlan);
    const after = inspection(afterPlan);
    assert.doesNotThrow(() =>
      assertReviewedSourceDocIdentityPostApply(before, after),
    );

    const dependencyDrift = {
      ...after,
      plan: { ...after.plan, dependencySha256: "e".repeat(64) },
    };
    assert.throws(
      () => assertReviewedSourceDocIdentityPostApply(before, dependencyDrift),
      /transaction must roll back/,
    );
    const bindingDrift = {
      ...after,
      plan: {
        ...after.plan,
        targetDocumentBindings: after.plan.targetDocumentBindings.map(
          (binding, index) =>
            index === 0 ? { ...binding, documentId: "doc-other" } : binding,
        ),
      },
    };
    assert.throws(
      () => assertReviewedSourceDocIdentityPostApply(before, bindingDrift),
      /transaction must roll back/,
    );
    assert.throws(
      () => assertReviewedSourceDocIdentityPostApply(before, before),
      /transaction must roll back/,
    );
  });

  it("wires sourceKey/document/citation paths, broad dependency locks, exact reinspection, and Serializable rollback", () => {
    const runner = readFileSync(
      "scripts/apply-reviewed-source-doc-identity-repair.ts",
      "utf8",
    );
    const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
      scripts: Record<string, string>;
    };
    assert.equal(
      packageJson.scripts["repair:reviewed-source-doc-identity"],
      "tsx scripts/apply-reviewed-source-doc-identity-repair.ts",
    );
    assert.match(runner, /current_database\(\)/);
    assert.match(runner, /row\?\.key !== "primary"/);
    assert.match(runner, /`source_doc:\$\{id\}`/);
    assert.match(runner, /`document:\$\{id\}`/);
    assert.match(runner, /sourceDocId: \{ in: sourceDocIds \}/);
    assert.match(runner, /documentId: \{ in: documentIds \}/);
    assert.match(runner, /reviewBasisCitationId: \{ in: citationIds \}/);
    assert.match(runner, /entityType: "SourceDoc"/);
    assert.match(runner, /entityType: "Document"/);
    assert.match(runner, /"_InsightSourceDoc"/);
    assert.match(runner, /"OpportunityEntry"/);
    assert.match(runner, /sourceIds: \{ hasSome: sourceDocIds \}/);
    assert.match(runner, /Prisma Unsupported columns/);
    assert.match(runner, /IN SHARE ROW EXCLUSIVE MODE/);
    assert.match(runner, /ORDER BY "id" FOR UPDATE/);
    assert.match(runner, /ORDER BY "key" FOR SHARE/);
    assert.match(runner, /pg_advisory_xact_lock/);
    assert.match(runner, /isolationLevel: "Serializable"/);
    assert.match(
      runner,
      /inspectReviewedSourceDocIdentityDatabaseState\(transaction\)/,
    );
    assert.match(runner, /lockedDigest !== args\.expectedPlanSha256/);
    assert.match(runner, /assertReviewedSourceDocIdentityPostApply\(locked, after\)/);
    assert.equal((runner.match(/\.updateMany\(/g) ?? []).length, 1);
    assert.doesNotMatch(
      runner,
      /\.(?:create|createMany|delete|deleteMany|upsert)\(/,
    );
    assert.deepEqual(REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS, [
      "src-16",
      "src-24",
      "src-143",
    ]);
  });
});
