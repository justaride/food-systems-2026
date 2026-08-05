import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { theses } from "../../prisma/seed-data/theses";
import {
  PINNED_REMAINING_THESIS_ACCESS_DATE_MANIFEST_SHA256,
  REVIEWED_REMAINING_THESIS_ACCESS_DATE_TARGETS,
  VERIFIED_REMAINING_THESIS_ACCESS_DATE,
  buildRemainingThesisAccessDateRepairPlan,
  normalizeThesisSeedSnapshot,
  remainingThesisAccessDateRepairPlanSha256,
  validateRemainingThesisAccessDateManifest,
  validateRemainingThesisAccessDateSeedTargets,
  type ThesisDatabaseSnapshot,
} from "../../scripts/repair-remaining-thesis-access-dates";
import {
  REVIEWED_THESIS_BIBLIOGRAPHIC_MANIFEST_SHA256,
  REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS,
  materializeThesisBibliographicSnapshot,
  normalizeThesisBibliographicSnapshot,
  sha256ReviewedThesisBibliographicJson,
} from "../../src/lib/citations/reviewed-thesis-bibliographic-repair";

function databaseSnapshots(
  state:
    | "before-access"
    | "after-access-before-bibliographic"
    | "after-bibliographic",
): ThesisDatabaseSnapshot[] {
  return REVIEWED_REMAINING_THESIS_ACCESS_DATE_TARGETS.map((target) => {
    const seedRow = theses.find((row) => row.id === target.id);
    assert.ok(seedRow);
    const bibliographicRepair = REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.find(
      (repair) => repair.id === target.id,
    );
    const historicalSeedRow = bibliographicRepair
      ? materializeThesisBibliographicSnapshot(bibliographicRepair.before)
      : seedRow;
    const selectedSeedRow =
      state === "after-bibliographic" ? seedRow : historicalSeedRow;
    return {
      ...normalizeThesisSeedSnapshot(selectedSeedRow),
      url: state === "before-access" ? target.urlBefore : selectedSeedRow.url,
      accessDate:
        state === "before-access" ? null : (selectedSeedRow.accessDate ?? null),
      documentId: `document-${target.id}`,
    };
  });
}

function historicalSeedSha256(
  snapshot: ReturnType<typeof normalizeThesisSeedSnapshot>,
) {
  return createHash("sha256").update(JSON.stringify(snapshot)).digest("hex");
}

describe("remaining verified Thesis access-date repair", () => {
  it("pins a 76-row work-level evidence manifest and the reviewed seed state", () => {
    validateRemainingThesisAccessDateManifest();
    validateRemainingThesisAccessDateSeedTargets(theses);

    assert.equal(
      PINNED_REMAINING_THESIS_ACCESS_DATE_MANIFEST_SHA256.length,
      64,
    );
    assert.equal(REVIEWED_REMAINING_THESIS_ACCESS_DATE_TARGETS.length, 76);
    assert.equal(
      new Set(
        REVIEWED_REMAINING_THESIS_ACCESS_DATE_TARGETS.map((row) => row.id),
      ).size,
      76,
    );
    assert.ok(
      REVIEWED_REMAINING_THESIS_ACCESS_DATE_TARGETS.every(
        (target) =>
          target.accessDate === VERIFIED_REMAINING_THESIS_ACCESS_DATE &&
          ["http:", "https:"].includes(new URL(target.urlAfter).protocol) &&
          target.evidenceLocator.startsWith("https://") &&
          target.evidenceKind.length > 0 &&
          target.evidenceNote.length > 0,
      ),
    );
    assert.equal(
      REVIEWED_REMAINING_THESIS_ACCESS_DATE_TARGETS.filter(
        (target) => target.bibliographicCaveat,
      ).length,
      14,
    );
    assert.deepEqual(
      REVIEWED_REMAINING_THESIS_ACCESS_DATE_TARGETS.filter(
        (target) => target.urlBefore !== target.urlAfter,
      ).map((target) => target.id),
      ["deljanin-2015"],
    );
    assert.equal(
      REVIEWED_REMAINING_THESIS_ACCESS_DATE_TARGETS.find(
        (target) => target.id === "deljanin-2015",
      )?.urlAfter,
      "https://research.cbs.dk/en/studentProjects/49894547-c253-4e00-b03c-38df6759a854",
    );
    assert.equal(
      theses.filter((row) => row.accessDate === "2026-07-19").length,
      2,
    );
    assert.equal(
      theses.filter((row) => row.accessDate === "2026-07-20").length,
      76,
    );

    for (const repair of REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS) {
      const historicalTarget =
        REVIEWED_REMAINING_THESIS_ACCESS_DATE_TARGETS.find(
          (target) => target.id === repair.id,
        );
      const currentSeed = theses.find((row) => row.id === repair.id);
      assert.ok(historicalTarget);
      assert.ok(currentSeed);
      assert.equal(
        historicalTarget.seedRowSha256,
        historicalSeedSha256(
          normalizeThesisSeedSnapshot(
            materializeThesisBibliographicSnapshot(repair.before),
          ),
        ),
        `${repair.id} historical before hash`,
      );
      assert.equal(
        sha256ReviewedThesisBibliographicJson(
          normalizeThesisBibliographicSnapshot(currentSeed),
        ),
        sha256ReviewedThesisBibliographicJson(repair.after),
        `${repair.id} current after hash`,
      );
    }
  });

  it("builds a deterministic full-row 76-update plan", () => {
    const plan = buildRemainingThesisAccessDateRepairPlan(
      databaseSnapshots("before-access"),
    );

    assert.deepEqual(plan.summary, {
      total: 76,
      pending: 76,
      alreadyApplied: 0,
      conflicts: 0,
    });
    assert.equal(plan.updates.length, 76);
    assert.equal(
      plan.supersedingBibliographicManifestSha256,
      REVIEWED_THESIS_BIBLIOGRAPHIC_MANIFEST_SHA256,
    );
    assert.ok(
      plan.updates.every(
        (update) =>
          /^[a-f0-9]{64}$/.test(update.beforeSha256) &&
          /^[a-f0-9]{64}$/.test(update.afterSha256) &&
          update.beforeSha256 !== update.afterSha256,
      ),
    );
    assert.equal(
      remainingThesisAccessDateRepairPlanSha256(plan),
      remainingThesisAccessDateRepairPlanSha256(plan),
    );
  });

  it("is idempotent in the historically applied state before the bibliographic batch", () => {
    const plan = buildRemainingThesisAccessDateRepairPlan(
      databaseSnapshots("after-access-before-bibliographic"),
    );

    assert.deepEqual(plan.summary, {
      total: 76,
      pending: 0,
      alreadyApplied: 76,
      conflicts: 0,
    });
    assert.equal(plan.updates.length, 0);
  });

  it("is idempotent in the exact superseding post-bibliographic state", () => {
    const plan = buildRemainingThesisAccessDateRepairPlan(
      databaseSnapshots("after-bibliographic"),
    );

    assert.deepEqual(plan.summary, {
      total: 76,
      pending: 0,
      alreadyApplied: 76,
      conflicts: 0,
    });
    assert.equal(plan.updates.length, 0);
  });

  it("fails closed on missing, content-drifted, partially applied, or previously dated rows", () => {
    const missing = buildRemainingThesisAccessDateRepairPlan(
      databaseSnapshots("before-access").slice(1),
    );
    assert.equal(missing.conflicts.length, 1);

    const contentDrift = databaseSnapshots("before-access");
    contentDrift[0] = {
      ...contentDrift[0]!,
      keyFindings: [...contentDrift[0]!.keyFindings, "Unreviewed finding"],
    };
    const contentDriftPlan =
      buildRemainingThesisAccessDateRepairPlan(contentDrift);
    assert.match(contentDriftPlan.conflicts[0]?.detail ?? "", /keyFindings/);

    const partial = databaseSnapshots("before-access");
    const deljaninIndex = partial.findIndex(
      (row) => row.id === "deljanin-2015",
    );
    const deljaninTarget = REVIEWED_REMAINING_THESIS_ACCESS_DATE_TARGETS.find(
      (target) => target.id === "deljanin-2015",
    )!;
    partial[deljaninIndex] = {
      ...partial[deljaninIndex]!,
      url: deljaninTarget.urlAfter,
    };
    const partialPlan = buildRemainingThesisAccessDateRepairPlan(partial);
    assert.match(
      partialPlan.conflicts.find((row) => row.id === "deljanin-2015")?.detail ??
        "",
      /url/,
    );

    const previouslyDated = databaseSnapshots("before-access");
    previouslyDated[2] = { ...previouslyDated[2]!, accessDate: "2026-07-18" };
    const previouslyDatedPlan =
      buildRemainingThesisAccessDateRepairPlan(previouslyDated);
    assert.match(previouslyDatedPlan.conflicts[0]?.detail ?? "", /accessDate/);

    const partiallySuperseded = databaseSnapshots(
      "after-access-before-bibliographic",
    );
    const sandangerIndex = partiallySuperseded.findIndex(
      (row) => row.id === "sandanger-2012",
    );
    const sandangerRepair = REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.find(
      (repair) => repair.id === "sandanger-2012",
    )!;
    partiallySuperseded[sandangerIndex] = {
      ...partiallySuperseded[sandangerIndex]!,
      authors: sandangerRepair.after.authors,
    };
    const partiallySupersededPlan =
      buildRemainingThesisAccessDateRepairPlan(partiallySuperseded);
    assert.match(
      partiallySupersededPlan.conflicts.find(
        (row) => row.id === "sandanger-2012",
      )?.detail ?? "",
      /authors/,
    );

    const postBibliographicDrift = databaseSnapshots("after-bibliographic");
    postBibliographicDrift[sandangerIndex] = {
      ...postBibliographicDrift[sandangerIndex]!,
      keyFindings: [
        ...postBibliographicDrift[sandangerIndex]!.keyFindings,
        "Unreviewed finding",
      ],
    };
    const postBibliographicDriftPlan = buildRemainingThesisAccessDateRepairPlan(
      postBibliographicDrift,
    );
    assert.match(
      postBibliographicDriftPlan.conflicts.find(
        (row) => row.id === "sandanger-2012",
      )?.detail ?? "",
      /keyFindings/,
    );
  });

  it("binds relationship state into the reviewed plan SHA", () => {
    const initial = databaseSnapshots("before-access");
    const changedRelationship = databaseSnapshots("before-access");
    changedRelationship[0] = {
      ...changedRelationship[0]!,
      documentId: "different-document",
    };

    const initialPlan = buildRemainingThesisAccessDateRepairPlan(initial);
    const changedPlan =
      buildRemainingThesisAccessDateRepairPlan(changedRelationship);
    assert.notEqual(
      remainingThesisAccessDateRepairPlanSha256(initialPlan),
      remainingThesisAccessDateRepairPlanSha256(changedPlan),
    );
  });

  it("keeps apply behind plan ACK, lock, Serializable transaction, and full-field CAS", () => {
    const source = readFileSync(
      "scripts/repair-remaining-thesis-access-dates.ts",
      "utf8",
    );
    const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
      scripts: Record<string, string>;
    };

    assert.equal(
      packageJson.scripts["repair:remaining-thesis-access-dates"],
      "tsx scripts/repair-remaining-thesis-access-dates.ts",
    );
    assert.match(source, /--apply requires --ack=\$\{APPLY_ACK\}/);
    assert.match(source, /--plan-sha256=<64 lowercase hex>/);
    assert.match(source, /pg_advisory_xact_lock/);
    assert.match(source, /FOR UPDATE/);
    assert.match(source, /updateMany/);
    assert.match(source, /keyFindings: \{ equals: row\.keyFindings \}/);
    assert.match(source, /takeaways: \{ equals: row\.takeaways \}/);
    assert.match(source, /documentId: row\.documentId/);
    assert.match(source, /isolationLevel: 'Serializable'/);
  });
});
