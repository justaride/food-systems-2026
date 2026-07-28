import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { theses } from "../../prisma/seed-data/theses";
import {
  PINNED_REVIEWED_THESIS_BIBLIOGRAPHIC_MANIFEST_SHA256,
  REVIEWED_THESIS_BIBLIOGRAPHIC_EXCLUDED_IDS,
  REVIEWED_THESIS_BIBLIOGRAPHIC_MANIFEST_SHA256,
  REVIEWED_THESIS_BIBLIOGRAPHIC_MUTABLE_FIELDS,
  REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIR_IDS,
  REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIR_TARGET_COUNT,
  REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS,
  applyReviewedThesisBibliographicRepairsToSeed,
  buildReviewedThesisBibliographicRepairPlan,
  materializeThesisBibliographicSnapshot,
  normalizeThesisBibliographicSnapshot,
  reviewedThesisBibliographicManifestContract,
  reviewedThesisBibliographicRepairPlanContract,
  reviewedThesisBibliographicRepairPlanSha256,
  sha256ReviewedThesisBibliographicJson,
  validateReviewedThesisBibliographicRepairs,
} from "../../src/lib/citations/reviewed-thesis-bibliographic-repair";

function beforeRows() {
  return REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.map((repair) =>
    materializeThesisBibliographicSnapshot(structuredClone(repair.before)),
  );
}

function afterRows() {
  return REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.map((repair) =>
    materializeThesisBibliographicSnapshot(structuredClone(repair.after)),
  );
}

describe("reviewed Thesis bibliographic repair", () => {
  it("pins exactly nine evidence-bound before/after records", () => {
    const repairs = validateReviewedThesisBibliographicRepairs();
    assert.equal(
      repairs.length,
      REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIR_TARGET_COUNT,
    );
    assert.deepEqual(
      repairs.map((repair) => repair.id),
      [...REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIR_IDS],
    );
    assert.equal(
      sha256ReviewedThesisBibliographicJson(
        reviewedThesisBibliographicManifestContract(),
      ),
      PINNED_REVIEWED_THESIS_BIBLIOGRAPHIC_MANIFEST_SHA256,
    );
    assert.equal(
      REVIEWED_THESIS_BIBLIOGRAPHIC_MANIFEST_SHA256,
      "bc76d1c5b8454ad843ce5b0dde0d726edf085305c77ad744aa2919692b5249fe",
    );
    assert.ok(
      repairs.every(
        (repair) =>
          repair.evidenceUrl.startsWith("https://") &&
          repair.reviewBasis.trim().length > 0 &&
          repair.mutatedFields.length > 0,
      ),
    );
    assert.deepEqual(REVIEWED_THESIS_BIBLIOGRAPHIC_MUTABLE_FIELDS, [
      "authors",
      "institution",
      "year",
      "title",
      "url",
      "doi",
      "isbn",
      "publisher",
    ]);
  });

  it("keeps Mattila, Naess, and all three entity migrations outside this batch", () => {
    assert.deepEqual(REVIEWED_THESIS_BIBLIOGRAPHIC_EXCLUDED_IDS, [
      "mattila-2024",
      "naess-2024",
      "halseth-phd-2024",
      "lund-beijer-2026",
      "rey-verge-2005",
    ]);
    const ids = new Set(
      REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.map((repair) => repair.id),
    );
    for (const excluded of REVIEWED_THESIS_BIBLIOGRAPHIC_EXCLUDED_IDS) {
      assert.equal(ids.has(excluded), false);
    }
  });

  it("materializes the reviewed identities in the seed without inventing Handle DOIs", () => {
    const expected = {
      "sandanger-2012": {
        authors: "Elise Sandanger",
        title:
          "Horisontal konkurranse i dagligvaremarkedet: Bruken av egne merkevarer i konkurransen mellom norske dagligvarekjeder",
        url: "https://hdl.handle.net/11250/169513",
        doi: "hdl:11250/169513",
        publisher: "Norges Handelshøyskole",
      },
      "granlund-lindskog-2024": {
        authors: "Henrik Granlund; Herman Lindskog",
        url: "https://hdl.handle.net/11250/3156087",
        doi: "hdl:11250/3156087",
      },
      "tallaksen-2022": {
        authors: "Amalie Tallaksen",
        institution: "Universitetet i Agder",
        title:
          "Towards Sustainable Dietary Change: An Exploration of Norwegian University Student's Attitudes toward Meat Reduction",
        publisher: "Universitetet i Agder",
      },
      "tesdal-2013": {
        authors: "Kari Tesdal",
        year: 2012,
        title:
          "Nøkkelhull på matvarer - en analyse av private aktørers økonomiske interesser og konsekvensene for myndighetenes merkeordning",
      },
      "handlykken-2023": {
        authors: "Vilje S. Håndlykken",
        title:
          "Hvordan brukes nudging som atferdsøkonomisk virkemiddel i forhold til forbrukeratferd, og hvilke etiske implikasjoner kan dette medføre?",
      },
      "slu-house-crickets-2025": {
        authors: "Sara Capitán",
        title:
          "House crickets in circular food systems: From crop residue diets to frass-based farming",
        doi: "10.54612/a.7ersgt4v2k",
        isbn: "978-91-8124-092-4",
        publisher: "Swedish University of Agricultural Sciences",
      },
      "van-straten-2025": {
        authors: "Elizabeth Van Straten",
        title:
          "How food companies operating in Finland translate circular economy principles into business model innovation: A Qualitative Multiple-Case Study of Circular Business Models in the Food System",
      },
      "bueso-bordils-2021": {
        authors: "Vicente Bueso Bordils",
        title:
          "Study on food waste streams and creation of circular solutions on Bornholm",
      },
      "nmbu-circular-vegetables-2022": {
        authors: "Andrea Christine Kunz Skrede",
        url: "https://hdl.handle.net/11250/3030715",
      },
    } as const;

    for (const [id, fields] of Object.entries(expected)) {
      const row = theses.find((candidate) => candidate.id === id);
      assert.ok(row, id);
      for (const [field, value] of Object.entries(fields)) {
        assert.equal(row[field as keyof typeof row], value, `${id}.${field}`);
      }
    }

    assert.equal(
      theses.find((row) => row.id === "nmbu-circular-vegetables-2022")?.doi,
      undefined,
    );
    assert.equal(
      theses.find((row) => row.id === "tallaksen-2022")?.doi,
      undefined,
    );
  });

  it("builds a deterministic pending plan with full-row and non-target hashes", () => {
    const rows = beforeRows();
    const plan = buildReviewedThesisBibliographicRepairPlan(rows);
    assert.deepEqual(plan.summary, {
      total: 9,
      pending: 9,
      alreadyApplied: 0,
      conflicts: 0,
    });
    assert.equal(plan.updates.length, 9);
    for (const update of plan.updates) {
      assert.match(update.beforeFullRowSha256, /^[a-f0-9]{64}$/);
      assert.match(update.afterFullRowSha256, /^[a-f0-9]{64}$/);
      assert.notEqual(update.beforeFullRowSha256, update.afterFullRowSha256);
      assert.equal(update.beforeNonTargetSha256, update.afterNonTargetSha256);
    }

    const reversed = buildReviewedThesisBibliographicRepairPlan(
      [...rows].reverse(),
    );
    assert.deepEqual(
      reviewedThesisBibliographicRepairPlanContract(plan),
      reviewedThesisBibliographicRepairPlanContract(reversed),
    );
    assert.equal(
      reviewedThesisBibliographicRepairPlanSha256(plan),
      reviewedThesisBibliographicRepairPlanSha256(reversed),
    );
  });

  it("applies before to after, preserves claim arrays, and is idempotent", () => {
    const before = beforeRows();
    const claimArrays = new Map(
      before.map((row) => [
        row.id,
        {
          keyFindings: row.keyFindings,
          tags: row.tags,
          takeaways: row.takeaways,
        },
      ]),
    );
    const applied = applyReviewedThesisBibliographicRepairsToSeed(before);

    assert.deepEqual(
      applied.map(normalizeThesisBibliographicSnapshot),
      REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.map((repair) => repair.after),
    );
    for (const row of applied) {
      const claims = claimArrays.get(row.id)!;
      assert.equal(row.keyFindings, claims.keyFindings);
      assert.equal(row.tags, claims.tags);
      assert.equal(row.takeaways, claims.takeaways);
    }

    const appliedAgain = applyReviewedThesisBibliographicRepairsToSeed(applied);
    assert.deepEqual(appliedAgain, applied);
    for (let index = 0; index < applied.length; index += 1) {
      assert.equal(appliedAgain[index], applied[index]);
    }

    const afterPlan = buildReviewedThesisBibliographicRepairPlan(afterRows());
    assert.deepEqual(afterPlan.summary, {
      total: 9,
      pending: 0,
      alreadyApplied: 9,
      conflicts: 0,
    });
    assert.deepEqual(
      buildReviewedThesisBibliographicRepairPlan(theses).summary,
      afterPlan.summary,
    );
  });

  it("fails closed on missing, duplicate, partially applied, or non-target drift", () => {
    const missing = buildReviewedThesisBibliographicRepairPlan(
      beforeRows().slice(1),
    );
    assert.equal(missing.conflicts[0]?.code, "missing");
    assert.equal(missing.conflicts[0]?.id, "sandanger-2012");

    const duplicateRows = beforeRows();
    duplicateRows.push(structuredClone(duplicateRows[0]!));
    const duplicate = buildReviewedThesisBibliographicRepairPlan(duplicateRows);
    assert.equal(
      duplicate.conflicts.find((row) => row.id === "sandanger-2012")?.code,
      "duplicate",
    );

    const partialRows = beforeRows();
    partialRows[0] = {
      ...partialRows[0]!,
      authors: REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS[0]!.after.authors,
    };
    const partial = buildReviewedThesisBibliographicRepairPlan(partialRows);
    assert.equal(
      partial.conflicts.find((row) => row.id === "sandanger-2012")?.code,
      "snapshot_drift",
    );

    const claimDriftRows = beforeRows();
    claimDriftRows[1] = {
      ...claimDriftRows[1]!,
      keyFindings: [...claimDriftRows[1]!.keyFindings, "Unreviewed finding"],
    };
    const claimDrift =
      buildReviewedThesisBibliographicRepairPlan(claimDriftRows);
    assert.match(
      claimDrift.conflicts.find((row) => row.id === "granlund-lindskog-2024")
        ?.detail ?? "",
      /keyFindings/,
    );
    assert.throws(
      () => applyReviewedThesisBibliographicRepairsToSeed(claimDriftRows),
      /seed conflict/,
    );
  });
});
