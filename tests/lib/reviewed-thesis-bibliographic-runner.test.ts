import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  REVIEWED_THESIS_BIBLIOGRAPHIC_APPLY_ACK,
  buildReviewedThesisBibliographicDependencySnapshot,
  classifyReviewedThesisBibliographicAtomicState,
  fullReviewedThesisBibliographicSnapshotWhere,
  inspectReviewedThesisBibliographicDatabaseState,
  parseReviewedThesisBibliographicArgs,
  portableThesisBibliographyToDatabaseRow,
  reviewedThesisBibliographicDatabasePlanSha256,
  reviewedThesisBibliographicUpdateData,
  type ReviewedThesisBibliographicDatabasePlan,
  type ReviewedThesisBibliographicDependencyCollections,
} from "../../scripts/apply-reviewed-thesis-bibliographic-repair";
import {
  REVIEWED_THESIS_BIBLIOGRAPHIC_MANIFEST_SHA256,
  REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS,
  buildReviewedThesisBibliographicRepairPlan,
  materializeThesisBibliographicSnapshot,
} from "../../src/lib/citations/reviewed-thesis-bibliographic-repair";

function pureRows(which: "before" | "after") {
  return REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.map((repair) =>
    materializeThesisBibliographicSnapshot(structuredClone(repair[which])),
  );
}

function dependencyFixtures(): ReviewedThesisBibliographicDependencyCollections {
  return {
    documents: [
      {
        id: "doc-2",
        title: "Second",
        updatedAt: new Date("2026-07-20T12:00:00.000Z"),
      },
      {
        id: "doc-1",
        title: "First",
        updatedAt: new Date("2026-07-20T11:00:00.000Z"),
      },
    ],
    sourceCitations: [{ id: "citation-1", documentId: "doc-1" }],
    fieldCitations: [
      {
        id: "field-1",
        citationId: "citation-1",
        entityType: "Thesis",
        entityId: "sandanger-2012",
      },
    ],
    libraryAnalysisRecords: [
      { id: "library-1", sourceKey: "thesis:sandanger-2012" },
    ],
    evidenceAppraisals: [
      { id: "appraisal-1", thesisId: "sandanger-2012" },
    ],
    documentRefs: [{ id: "ref-1", fromId: "doc-1", toId: "doc-x" }],
    insightDocumentRefs: [
      { id: "insight-ref-1", insightId: "insight-1", documentId: "doc-1" },
    ],
    companyDocumentRefs: [
      { id: "company-ref-1", companyId: "company-1", documentId: "doc-1" },
    ],
    actorDocumentRefs: [
      { id: "actor-ref-1", actorId: "actor-1", documentId: "doc-1" },
    ],
  };
}

function fixturePlan(): ReviewedThesisBibliographicDatabasePlan {
  return {
    version: "2026-07-20-v1",
    databaseIdentity: {
      currentDatabase: "foodsystems",
      databaseIdentityUuid: "90e3e24d-230f-42f7-b178-5bcd5b861e84",
    },
    manifestSha256: REVIEWED_THESIS_BIBLIOGRAPHIC_MANIFEST_SHA256,
    atomicState: "all_before",
    targetDocumentBindings: REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.map(
      (repair, index) => ({
        thesisId: repair.id,
        rowPresent: true,
        documentId: index === 0 ? "doc-1" : null,
      }),
    ).sort((left, right) => left.thesisId.localeCompare(right.thesisId)),
    targetStateSha256: "a".repeat(64),
    dependencySha256: "b".repeat(64),
    dependencyCounts: {
      documents: 1,
      sourceCitations: 1,
      fieldCitations: 1,
      libraryAnalysisRecords: 1,
      evidenceAppraisals: 1,
      documentRefs: 1,
      insightDocumentRefs: 1,
      companyDocumentRefs: 1,
      actorDocumentRefs: 1,
    },
    rows: [],
    conflicts: [],
    summary: { total: 9, pending: 9, applied: 0, conflicts: 0 },
  };
}

describe("reviewed Thesis bibliographic database runner", () => {
  it("defaults to dry-run and requires exact, unambiguous apply arguments", () => {
    assert.deepEqual(parseReviewedThesisBibliographicArgs([]), {
      apply: false,
      ack: undefined,
      expectedPlanSha256: undefined,
    });
    assert.deepEqual(
      parseReviewedThesisBibliographicArgs([
        "--apply",
        `--ack=${REVIEWED_THESIS_BIBLIOGRAPHIC_APPLY_ACK}`,
        `--plan-sha256=${"a".repeat(64)}`,
      ]),
      {
        apply: true,
        ack: REVIEWED_THESIS_BIBLIOGRAPHIC_APPLY_ACK,
        expectedPlanSha256: "a".repeat(64),
      },
    );
    assert.throws(
      () => parseReviewedThesisBibliographicArgs(["--apply", "--dry-run"]),
      /mutually exclusive/,
    );
    assert.throws(
      () => parseReviewedThesisBibliographicArgs(["--ack=unused"]),
      /valid only with --apply/,
    );
    assert.throws(
      () => parseReviewedThesisBibliographicArgs(["--apply", "--apply"]),
      /must not be repeated/,
    );
    assert.throws(
      () => parseReviewedThesisBibliographicArgs(["--unknown"]),
      /Unknown reviewed Thesis bibliographic argument/,
    );
  });

  it("accepts only all-before or all-after pure plans and rejects a valid-row hybrid", () => {
    const before = buildReviewedThesisBibliographicRepairPlan(
      pureRows("before"),
    );
    const after = buildReviewedThesisBibliographicRepairPlan(pureRows("after"));
    const hybridRows = pureRows("before");
    hybridRows[0] = pureRows("after")[0]!;
    const hybrid = buildReviewedThesisBibliographicRepairPlan(hybridRows);

    assert.equal(
      classifyReviewedThesisBibliographicAtomicState(before),
      "all_before",
    );
    assert.equal(
      classifyReviewedThesisBibliographicAtomicState(after),
      "all_after",
    );
    assert.equal(hybrid.conflicts.length, 0);
    assert.equal(hybrid.summary.pending, 8);
    assert.equal(hybrid.summary.alreadyApplied, 1);
    assert.equal(
      classifyReviewedThesisBibliographicAtomicState(hybrid),
      "conflict",
    );
  });

  it("hashes every explicitly enumerated dependency collection deterministically", () => {
    const fixtures = dependencyFixtures();
    const inspection = buildReviewedThesisBibliographicDependencySnapshot(
      fixtures,
    );
    const reordered = buildReviewedThesisBibliographicDependencySnapshot({
      ...fixtures,
      documents: [...fixtures.documents].reverse(),
    });

    assert.deepEqual(inspection.counts, {
      documents: 2,
      sourceCitations: 1,
      fieldCitations: 1,
      libraryAnalysisRecords: 1,
      evidenceAppraisals: 1,
      documentRefs: 1,
      insightDocumentRefs: 1,
      companyDocumentRefs: 1,
      actorDocumentRefs: 1,
    });
    assert.deepEqual(inspection.ids.documents, ["doc-1", "doc-2"]);
    assert.equal(inspection.sha256, reordered.sha256);
    assert.match(inspection.sha256, /^[a-f0-9]{64}$/);
    assert.match(JSON.stringify(inspection.snapshot), /2026-07-20T11:00:00.000Z/);

    const changed = dependencyFixtures();
    changed.evidenceAppraisals = [
      { ...changed.evidenceAppraisals[0], status: "reviewed" },
    ];
    assert.notEqual(
      buildReviewedThesisBibliographicDependencySnapshot(changed).sha256,
      inspection.sha256,
    );
  });

  it("builds full-row CAS predicates and mutation data limited to reviewed fields", () => {
    for (const repair of REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS) {
      const purePlan = buildReviewedThesisBibliographicRepairPlan([
        materializeThesisBibliographicSnapshot(repair.before),
        ...REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.filter(
          (candidate) => candidate.id !== repair.id,
        ).map((candidate) =>
          materializeThesisBibliographicSnapshot(candidate.before),
        ),
      ]);
      const update = purePlan.updates.find((candidate) => candidate.id === repair.id)!;
      const row = portableThesisBibliographyToDatabaseRow(
        repair.before,
        `document:${repair.id}`,
      );
      const where = fullReviewedThesisBibliographicSnapshotWhere(row) as Record<
        string,
        unknown
      >;
      assert.deepEqual(Object.keys(where), [
        "id",
        "authors",
        "institution",
        "year",
        "title",
        "titleNo",
        "url",
        "synthesis",
        "keyFindings",
        "tags",
        "takeaways",
        "method",
        "awardWinning",
        "degree",
        "doi",
        "isbn",
        "publisher",
        "accessDate",
        "documentId",
      ]);
      assert.equal(where.documentId, `document:${repair.id}`);
      assert.deepEqual(where.keyFindings, { equals: repair.before.keyFindings });
      assert.deepEqual(where.tags, { equals: repair.before.tags });
      assert.deepEqual(where.takeaways, { equals: repair.before.takeaways });

      const data = reviewedThesisBibliographicUpdateData(update) as Record<
        string,
        unknown
      >;
      assert.deepEqual(Object.keys(data), [...repair.mutatedFields]);
      for (const field of repair.mutatedFields) {
        assert.equal(data[field], repair.after[field]);
      }
      for (const protectedField of [
        "synthesis",
        "keyFindings",
        "tags",
        "takeaways",
        "accessDate",
        "documentId",
      ]) {
        assert.equal(protectedField in data, false, `${repair.id}:${protectedField}`);
      }
    }
  });

  it("pins identity, dependency state, and Thesis-to-Document bindings in the plan hash", () => {
    const plan = fixturePlan();
    const digest = reviewedThesisBibliographicDatabasePlanSha256(plan);
    assert.match(digest, /^[a-f0-9]{64}$/);
    assert.equal(
      reviewedThesisBibliographicDatabasePlanSha256(structuredClone(plan)),
      digest,
    );

    const identityDrift = structuredClone(plan);
    identityDrift.databaseIdentity.databaseIdentityUuid =
      "90e3e24d-230f-42f7-b178-5bcd5b861e85";
    assert.notEqual(
      reviewedThesisBibliographicDatabasePlanSha256(identityDrift),
      digest,
    );
    const dependencyDrift = structuredClone(plan);
    dependencyDrift.dependencySha256 = "c".repeat(64);
    assert.notEqual(
      reviewedThesisBibliographicDatabasePlanSha256(dependencyDrift),
      digest,
    );
    const bindingDrift = structuredClone(plan);
    bindingDrift.targetDocumentBindings[0]!.documentId = "doc-other";
    assert.notEqual(
      reviewedThesisBibliographicDatabasePlanSha256(bindingDrift),
      digest,
    );
  });

  it("inspects exactly nine full Thesis rows and follows every dependency edge", async () => {
    const calls = new Map<string, unknown[]>();
    const record = (name: string, value: unknown) => {
      const entries = calls.get(name) ?? [];
      entries.push(value);
      calls.set(name, entries);
    };
    const thesisRows = REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.map(
      (repair, index) =>
        portableThesisBibliographyToDatabaseRow(
          repair.before,
          index < 2 ? `doc-${index + 1}` : null,
        ),
    );
    let rawQueryIndex = 0;
    const mockClient = {
      $queryRaw: async (query: unknown) => {
        record("$queryRaw", query);
        rawQueryIndex += 1;
        return rawQueryIndex === 1
          ? [{ currentDatabase: "foodsystems", identityTable: "DatabaseIdentity" }]
          : [
              {
                identityUuid: "90e3e24d-230f-42f7-b178-5bcd5b861e84",
              },
            ];
      },
      thesis: {
        findMany: async (args: unknown) => {
          record("thesis.findMany", args);
          return thesisRows;
        },
      },
      document: {
        findMany: async (args: unknown) => {
          record("document.findMany", args);
          return [{ id: "doc-1" }, { id: "doc-2" }];
        },
      },
      sourceCitation: {
        findMany: async (args: unknown) => {
          record("sourceCitation.findMany", args);
          return [{ id: "citation-1", documentId: "doc-1" }];
        },
      },
      fieldCitation: {
        findMany: async (args: unknown) => {
          record("fieldCitation.findMany", args);
          return [{ id: "field-1", citationId: "citation-1" }];
        },
      },
      libraryAnalysisRecord: {
        findMany: async (args: unknown) => {
          record("libraryAnalysisRecord.findMany", args);
          return [{ id: "library-1", documentId: "doc-1" }];
        },
      },
      evidenceAppraisal: {
        findMany: async (args: unknown) => {
          record("evidenceAppraisal.findMany", args);
          return [{ id: "appraisal-1", thesisId: "sandanger-2012" }];
        },
      },
      documentRef: {
        findMany: async (args: unknown) => {
          record("documentRef.findMany", args);
          return [{ id: "document-ref-1" }];
        },
      },
      insightDocumentRef: {
        findMany: async (args: unknown) => {
          record("insightDocumentRef.findMany", args);
          return [{ id: "insight-ref-1" }];
        },
      },
      companyDocumentRef: {
        findMany: async (args: unknown) => {
          record("companyDocumentRef.findMany", args);
          return [{ id: "company-ref-1" }];
        },
      },
      actorDocumentRef: {
        findMany: async (args: unknown) => {
          record("actorDocumentRef.findMany", args);
          return [{ id: "actor-ref-1" }];
        },
      },
    } as unknown as Parameters<
      typeof inspectReviewedThesisBibliographicDatabaseState
    >[0];

    const inspection =
      await inspectReviewedThesisBibliographicDatabaseState(mockClient);
    assert.equal(inspection.plan.atomicState, "all_before");
    assert.equal(inspection.plan.rows.length, 9);
    assert.equal(inspection.plan.targetDocumentBindings.length, 9);
    assert.deepEqual(
      inspection.plan.targetDocumentBindings
        .filter((binding) => binding.documentId)
        .map((binding) => binding.documentId)
        .sort(),
      ["doc-1", "doc-2"],
    );
    assert.deepEqual(inspection.plan.dependencyCounts, {
      documents: 2,
      sourceCitations: 1,
      fieldCitations: 1,
      libraryAnalysisRecords: 1,
      evidenceAppraisals: 1,
      documentRefs: 1,
      insightDocumentRefs: 1,
      companyDocumentRefs: 1,
      actorDocumentRefs: 1,
    });

    const thesisQuery = calls.get("thesis.findMany")![0] as {
      where: { id: { in: string[] } };
      select: Record<string, boolean>;
    };
    assert.equal(thesisQuery.where.id.in.length, 9);
    assert.deepEqual(Object.keys(thesisQuery.select), [
      "id",
      "authors",
      "institution",
      "year",
      "title",
      "titleNo",
      "url",
      "synthesis",
      "keyFindings",
      "tags",
      "takeaways",
      "method",
      "awardWinning",
      "degree",
      "doi",
      "isbn",
      "publisher",
      "accessDate",
      "documentId",
    ]);
    const sourceCitationQuery = calls.get("sourceCitation.findMany")![0] as {
      where: { OR: unknown[] };
    };
    assert.deepEqual(sourceCitationQuery.where.OR, [
      { documentId: { in: ["doc-1", "doc-2"] } },
      {
        fieldCitations: {
          some: {
            entityType: "Thesis",
            entityId: {
              in: REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.map(
                (repair) => repair.id,
              ),
            },
          },
        },
      },
    ]);
    const fieldCitationQuery = calls.get("fieldCitation.findMany")![0] as {
      where: { OR: unknown[] };
    };
    assert.deepEqual(fieldCitationQuery.where.OR[0], {
      citationId: { in: ["citation-1"] },
    });
    const libraryQuery = calls.get("libraryAnalysisRecord.findMany")![0] as {
      where: { OR: unknown[] };
    };
    assert.deepEqual(libraryQuery.where.OR[0], {
      documentId: { in: ["doc-1", "doc-2"] },
    });
    assert.equal(calls.get("evidenceAppraisal.findMany")?.length, 1);
    for (const relation of [
      "documentRef.findMany",
      "insightDocumentRef.findMany",
      "companyDocumentRef.findMany",
      "actorDocumentRef.findMany",
    ]) {
      assert.equal(calls.get(relation)?.length, 1, relation);
    }
  });

  it("wires exact locks, locked-plan reinspection, Serializable apply, and no broad writes", () => {
    const runner = readFileSync(
      "scripts/apply-reviewed-thesis-bibliographic-repair.ts",
      "utf8",
    );
    const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
      scripts: Record<string, string>;
    };
    assert.equal(
      packageJson.scripts["repair:reviewed-thesis-bibliography"],
      "tsx scripts/apply-reviewed-thesis-bibliographic-repair.ts",
    );
    assert.match(runner, /current_database\(\)/);
    assert.match(runner, /WHERE "key" = 'primary'/);
    assert.match(runner, /ORDER BY "id" FOR UPDATE/);
    assert.match(runner, /ORDER BY "id" FOR SHARE/);
    assert.match(runner, /pg_advisory_xact_lock/);
    assert.match(runner, /isolationLevel: "Serializable"/);
    assert.match(
      runner,
      /inspectReviewedThesisBibliographicDatabaseState\(transaction\)/,
    );
    assert.match(runner, /lockedDigest !== args\.expectedPlanSha256/);
    assert.match(runner, /after\.plan\.dependencySha256 !== locked\.plan\.dependencySha256/);
    assert.equal((runner.match(/\.updateMany\(/g) ?? []).length, 1);
    assert.doesNotMatch(
      runner,
      /\.(?:create|createMany|delete|deleteMany|upsert)\(/,
    );
  });
});
