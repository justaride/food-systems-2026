import "dotenv/config";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { theses } from "../prisma/seed-data/theses";
import {
  PINNED_REVIEWED_THESIS_BIBLIOGRAPHIC_MANIFEST_SHA256,
  REVIEWED_THESIS_BIBLIOGRAPHIC_MANIFEST_SHA256,
  REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS,
  materializeThesisBibliographicSnapshot,
  normalizeThesisBibliographicSnapshot,
  sha256ReviewedThesisBibliographicJson,
  validateReviewedThesisBibliographicRepairs,
} from "../src/lib/citations/reviewed-thesis-bibliographic-repair";

const APPLY_ACK = "APPLY_REMAINING_VERIFIED_THESIS_ACCESS_DATES_2026_07_20";
const ADVISORY_LOCK_KEY =
  "foodsystems:verified-thesis-access-dates:2026-07-20:v1";
const MANIFEST_PATH = fileURLToPath(
  new URL(
    "../research/_status/remaining-thesis-access-date-manifest-2026-07-20.json",
    import.meta.url,
  ),
);

export const VERIFIED_REMAINING_THESIS_ACCESS_DATE = "2026-07-20";
export const PINNED_REMAINING_THESIS_ACCESS_DATE_MANIFEST_SHA256 =
  "57e6c7c212472d6809141658854a942ff7b55f66596414ff8b9180037d00413d";

export type RemainingThesisAccessDateTarget = {
  id: string;
  authors: string;
  institution: string;
  year: number;
  title: string;
  urlBefore: string;
  urlAfter: string;
  accessDate: string;
  seedRowSha256: string;
  evidenceKind: string;
  evidenceLocator: string;
  evidenceSha256: string | null;
  evidenceNote: string;
  bibliographicCaveat: string | null;
};

type RemainingThesisAccessDateManifest = {
  version: 1;
  reviewedAt: string;
  timezone: string;
  targetCount: number;
  mutationScope: string;
  proofBoundary: string;
  targets: RemainingThesisAccessDateTarget[];
};

export type ThesisSeedSnapshot = {
  id: string;
  authors: string;
  institution: string;
  year: number;
  title: string;
  titleNo: string | null;
  url: string;
  synthesis: string;
  keyFindings: string[];
  tags: string[];
  takeaways: string[];
  method: string | null;
  awardWinning: boolean;
  degree: string;
  doi: string | null;
  isbn: string | null;
  publisher: string | null;
  accessDate: string | null;
};

export type ThesisDatabaseSnapshot = ThesisSeedSnapshot & {
  documentId: string | null;
};

export type RemainingThesisAccessDateConflict = {
  id: string;
  detail: string;
};

export type RemainingThesisAccessDateUpdate = {
  target: RemainingThesisAccessDateTarget;
  beforeSnapshot: ThesisDatabaseSnapshot;
  beforeSha256: string;
  afterSha256: string;
};

export type RemainingThesisAccessDateRepairPlan = {
  version: 1;
  manifestSha256: string;
  supersedingBibliographicManifestSha256: string;
  updates: RemainingThesisAccessDateUpdate[];
  alreadyAppliedIds: string[];
  conflicts: RemainingThesisAccessDateConflict[];
  summary: {
    total: number;
    pending: number;
    alreadyApplied: number;
    conflicts: number;
  };
};

const THESIS_SNAPSHOT_FIELDS = [
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
] as const;

function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function absoluteHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function loadReviewedManifest(): RemainingThesisAccessDateManifest {
  const raw = readFileSync(MANIFEST_PATH);
  const digest = sha256(raw);
  if (digest !== PINNED_REMAINING_THESIS_ACCESS_DATE_MANIFEST_SHA256) {
    throw new Error(
      "Reviewed remaining-Thesis access-date manifest drifted from its pinned SHA-256",
    );
  }

  const parsed = JSON.parse(
    raw.toString("utf8"),
  ) as RemainingThesisAccessDateManifest;
  if (
    parsed.version !== 1 ||
    parsed.reviewedAt !== VERIFIED_REMAINING_THESIS_ACCESS_DATE ||
    parsed.timezone !== "Europe/Oslo" ||
    parsed.targetCount !== 76 ||
    !parsed.mutationScope ||
    !parsed.proofBoundary ||
    !Array.isArray(parsed.targets) ||
    parsed.targets.length !== parsed.targetCount
  ) {
    throw new Error(
      "Reviewed remaining-Thesis access-date manifest header is invalid",
    );
  }

  const ids = parsed.targets.map((target) => target.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error(
      "Reviewed remaining-Thesis access-date manifest contains duplicate ids",
    );
  }

  for (const target of parsed.targets) {
    if (
      !target.id ||
      !target.authors ||
      !target.institution ||
      !target.title ||
      !Number.isInteger(target.year) ||
      target.accessDate !== VERIFIED_REMAINING_THESIS_ACCESS_DATE ||
      !absoluteHttpUrl(target.urlBefore) ||
      !absoluteHttpUrl(target.urlAfter) ||
      !/^[a-f0-9]{64}$/.test(target.seedRowSha256) ||
      !target.evidenceKind.startsWith("official_") ||
      !target.evidenceLocator.startsWith("https://") ||
      !target.evidenceNote ||
      (target.evidenceSha256 !== null &&
        !/^[a-f0-9]{64}$/.test(target.evidenceSha256)) ||
      (target.bibliographicCaveat !== null &&
        !target.bibliographicCaveat.trim())
    ) {
      throw new Error(
        `Reviewed remaining-Thesis access-date target is invalid: ${target.id || "<missing id>"}`,
      );
    }
  }

  if (
    parsed.targets.filter((target) => target.bibliographicCaveat).length !== 14
  ) {
    throw new Error(
      "Reviewed remaining-Thesis access-date manifest must preserve exactly 14 bibliographic caveats",
    );
  }

  const repairedUrls = parsed.targets.filter(
    (target) => target.urlBefore !== target.urlAfter,
  );
  if (
    repairedUrls.length !== 1 ||
    repairedUrls[0]?.id !== "deljanin-2015" ||
    repairedUrls[0]?.urlAfter !==
      "https://research.cbs.dk/en/studentProjects/49894547-c253-4e00-b03c-38df6759a854"
  ) {
    throw new Error(
      "Reviewed manifest must contain exactly the pinned Deljanin locator repair",
    );
  }

  return parsed;
}

const reviewedManifest = loadReviewedManifest();

export const REVIEWED_REMAINING_THESIS_ACCESS_DATE_TARGETS: readonly RemainingThesisAccessDateTarget[] =
  reviewedManifest.targets.map((target) => ({ ...target }));

const reviewedBibliographicRepairsById = new Map(
  REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.map((repair) => [repair.id, repair]),
);

export function normalizeThesisSeedSnapshot(
  row: (typeof theses)[number],
): ThesisSeedSnapshot {
  return {
    id: row.id,
    authors: row.authors,
    institution: row.institution,
    year: row.year,
    title: row.title,
    titleNo: row.titleNo ?? null,
    url: row.url,
    synthesis: row.synthesis,
    keyFindings: [...row.keyFindings],
    tags: [...row.tags],
    takeaways: [...row.takeaways],
    method: row.method ?? null,
    awardWinning: row.awardWinning ?? false,
    degree: row.degree,
    doi: row.doi ?? null,
    isbn: row.isbn ?? null,
    publisher: row.publisher ?? null,
    accessDate: row.accessDate ?? null,
  };
}

function thesisSnapshotSha256(
  snapshot: ThesisDatabaseSnapshot | ThesisSeedSnapshot,
) {
  return sha256(JSON.stringify(snapshot));
}

export function validateRemainingThesisAccessDateManifest() {
  loadReviewedManifest();
  if (REVIEWED_REMAINING_THESIS_ACCESS_DATE_TARGETS.length !== 76) {
    throw new Error(
      "Reviewed remaining-Thesis access-date target count drifted",
    );
  }
}

export function validateRemainingThesisAccessDateSeedTargets(
  rows: typeof theses = theses,
) {
  validateRemainingThesisAccessDateManifest();
  validateReviewedThesisBibliographicRepairs();
  if (
    REVIEWED_THESIS_BIBLIOGRAPHIC_MANIFEST_SHA256 !==
    PINNED_REVIEWED_THESIS_BIBLIOGRAPHIC_MANIFEST_SHA256
  ) {
    throw new Error(
      "Reviewed Thesis bibliographic manifest drifted from its pinned SHA-256",
    );
  }

  const overlapIds = REVIEWED_REMAINING_THESIS_ACCESS_DATE_TARGETS.filter(
    (target) => reviewedBibliographicRepairsById.has(target.id),
  )
    .map((target) => target.id)
    .sort();
  const bibliographicIds = REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.map(
    (repair) => repair.id,
  ).sort();
  if (JSON.stringify(overlapIds) !== JSON.stringify(bibliographicIds)) {
    throw new Error(
      "Reviewed Thesis bibliographic repairs must be an exact subset of the 76-row historical access-date manifest",
    );
  }

  for (const target of REVIEWED_REMAINING_THESIS_ACCESS_DATE_TARGETS) {
    const matches = rows.filter((row) => row.id === target.id);
    if (matches.length !== 1) {
      throw new Error(
        `Expected exactly one seed Thesis for ${target.id}; found ${matches.length}`,
      );
    }
    const currentSeedRow = matches[0]!;
    const bibliographicRepair = reviewedBibliographicRepairsById.get(target.id);
    if (bibliographicRepair) {
      const historicalSeedSnapshot = normalizeThesisSeedSnapshot(
        materializeThesisBibliographicSnapshot(bibliographicRepair.before),
      );
      const historicalDigest = thesisSnapshotSha256(historicalSeedSnapshot);
      if (historicalDigest !== target.seedRowSha256) {
        throw new Error(
          `Historical seed Thesis hash no longer matches the exact bibliographic before-snapshot for ${target.id}: ${historicalDigest}`,
        );
      }
      if (
        historicalSeedSnapshot.url !== target.urlAfter ||
        historicalSeedSnapshot.accessDate !== target.accessDate
      ) {
        throw new Error(
          `Bibliographic before-snapshot no longer represents the historically applied access state for ${target.id}`,
        );
      }

      const currentBibliographicSnapshot =
        normalizeThesisBibliographicSnapshot(currentSeedRow);
      const currentDigest = sha256ReviewedThesisBibliographicJson(
        currentBibliographicSnapshot,
      );
      const expectedDigest = sha256ReviewedThesisBibliographicJson(
        bibliographicRepair.after,
      );
      if (currentDigest !== expectedDigest) {
        throw new Error(
          `Current seed Thesis no longer matches the exact bibliographic after-snapshot for ${target.id}: ${currentDigest}`,
        );
      }
      continue;
    }

    const snapshot = normalizeThesisSeedSnapshot(currentSeedRow);
    const digest = thesisSnapshotSha256(snapshot);
    if (digest !== target.seedRowSha256) {
      throw new Error(
        `Full seed Thesis snapshot drifted for ${target.id}: ${digest}`,
      );
    }
  }
}

function snapshotsEqual(
  left: ThesisDatabaseSnapshot,
  right: ThesisDatabaseSnapshot,
) {
  return THESIS_SNAPSHOT_FIELDS.every(
    (field) => JSON.stringify(left[field]) === JSON.stringify(right[field]),
  );
}

function snapshotDiff(
  actual: ThesisDatabaseSnapshot,
  expected: ThesisDatabaseSnapshot,
) {
  return THESIS_SNAPSHOT_FIELDS.filter(
    (field) =>
      JSON.stringify(actual[field]) !== JSON.stringify(expected[field]),
  );
}

export function buildRemainingThesisAccessDateRepairPlan(
  rows: readonly ThesisDatabaseSnapshot[],
): RemainingThesisAccessDateRepairPlan {
  validateRemainingThesisAccessDateSeedTargets();
  const updates: RemainingThesisAccessDateUpdate[] = [];
  const alreadyAppliedIds: string[] = [];
  const conflicts: RemainingThesisAccessDateConflict[] = [];

  for (const target of REVIEWED_REMAINING_THESIS_ACCESS_DATE_TARGETS) {
    const matches = rows.filter((row) => row.id === target.id);
    if (matches.length !== 1) {
      conflicts.push({
        id: target.id,
        detail: `Expected exactly one database row; found ${matches.length}.`,
      });
      continue;
    }

    const row = matches[0]!;
    const seedRow = theses.find((candidate) => candidate.id === target.id)!;
    const bibliographicRepair = reviewedBibliographicRepairsById.get(target.id);
    const historicallyReviewedSeedSnapshot = bibliographicRepair
      ? normalizeThesisSeedSnapshot(
          materializeThesisBibliographicSnapshot(bibliographicRepair.before),
        )
      : normalizeThesisSeedSnapshot(seedRow);
    const currentReviewedSeedSnapshot = bibliographicRepair
      ? normalizeThesisSeedSnapshot(
          materializeThesisBibliographicSnapshot(bibliographicRepair.after),
        )
      : historicallyReviewedSeedSnapshot;
    const beforeSnapshot: ThesisDatabaseSnapshot = {
      ...historicallyReviewedSeedSnapshot,
      url: target.urlBefore,
      accessDate: null,
      documentId: row.documentId,
    };
    const historicallyAppliedSnapshot: ThesisDatabaseSnapshot = {
      ...historicallyReviewedSeedSnapshot,
      url: target.urlAfter,
      accessDate: target.accessDate,
      documentId: row.documentId,
    };
    const supersedingBibliographicSnapshot: ThesisDatabaseSnapshot = {
      ...currentReviewedSeedSnapshot,
      documentId: row.documentId,
    };

    if (
      snapshotsEqual(row, historicallyAppliedSnapshot) ||
      snapshotsEqual(row, supersedingBibliographicSnapshot)
    ) {
      alreadyAppliedIds.push(target.id);
      continue;
    }
    if (snapshotsEqual(row, beforeSnapshot)) {
      updates.push({
        target,
        beforeSnapshot,
        beforeSha256: thesisSnapshotSha256(beforeSnapshot),
        afterSha256: thesisSnapshotSha256(historicallyAppliedSnapshot),
      });
      continue;
    }

    const driftedFields = snapshotDiff(row, beforeSnapshot);
    conflicts.push({
      id: target.id,
      detail: `Full reviewed database snapshot drifted: ${driftedFields.join(", ")}.`,
    });
  }

  return {
    version: 1,
    manifestSha256: PINNED_REMAINING_THESIS_ACCESS_DATE_MANIFEST_SHA256,
    supersedingBibliographicManifestSha256:
      REVIEWED_THESIS_BIBLIOGRAPHIC_MANIFEST_SHA256,
    updates,
    alreadyAppliedIds,
    conflicts,
    summary: {
      total: REVIEWED_REMAINING_THESIS_ACCESS_DATE_TARGETS.length,
      pending: updates.length,
      alreadyApplied: alreadyAppliedIds.length,
      conflicts: conflicts.length,
    },
  };
}

export function remainingThesisAccessDateRepairPlanContract(
  plan: RemainingThesisAccessDateRepairPlan,
) {
  return {
    version: plan.version,
    manifestSha256: plan.manifestSha256,
    supersedingBibliographicManifestSha256:
      plan.supersedingBibliographicManifestSha256,
    updates: plan.updates,
    alreadyAppliedIds: plan.alreadyAppliedIds,
    conflicts: plan.conflicts,
    summary: plan.summary,
  };
}

export function remainingThesisAccessDateRepairPlanSha256(
  plan: RemainingThesisAccessDateRepairPlan,
) {
  return sha256(
    JSON.stringify(remainingThesisAccessDateRepairPlanContract(plan)),
  );
}

function parseArgs(argv: string[]) {
  const allowedFlags = new Set(["--apply", "--dry-run"]);
  for (const argument of argv) {
    if (
      !allowedFlags.has(argument) &&
      !argument.startsWith("--ack=") &&
      !argument.startsWith("--plan-sha256=")
    ) {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  const apply = argv.includes("--apply");
  if (apply && argv.includes("--dry-run")) {
    throw new Error("--apply and --dry-run are mutually exclusive");
  }
  return {
    apply,
    ack: argv
      .find((argument) => argument.startsWith("--ack="))
      ?.slice("--ack=".length),
    expectedPlanSha256: argv
      .find((argument) => argument.startsWith("--plan-sha256="))
      ?.slice("--plan-sha256=".length),
  };
}

const thesisSelect = {
  id: true,
  authors: true,
  institution: true,
  year: true,
  title: true,
  titleNo: true,
  url: true,
  synthesis: true,
  keyFindings: true,
  tags: true,
  takeaways: true,
  method: true,
  awardWinning: true,
  degree: true,
  doi: true,
  isbn: true,
  publisher: true,
  accessDate: true,
  documentId: true,
} satisfies Prisma.ThesisSelect;

type RemainingThesisAccessDateClient = Pick<PrismaClient, "thesis">;

async function inspectRemainingThesisAccessDates(
  client: RemainingThesisAccessDateClient,
) {
  const rows = await client.thesis.findMany({
    where: {
      id: {
        in: REVIEWED_REMAINING_THESIS_ACCESS_DATE_TARGETS.map(
          (target) => target.id,
        ),
      },
    },
    select: thesisSelect,
    orderBy: { id: "asc" },
  });
  return buildRemainingThesisAccessDateRepairPlan(rows);
}

function printPlan(plan: RemainingThesisAccessDateRepairPlan, digest: string) {
  console.log("Verified remaining Thesis access-date repair plan");
  console.log(`Plan SHA-256: ${digest}`);
  console.log(`Reviewed manifest SHA-256: ${plan.manifestSha256}`);
  console.log(
    `Rows: ${plan.summary.total}; pending: ${plan.summary.pending}; ` +
      `already applied: ${plan.summary.alreadyApplied}; conflicts: ${plan.summary.conflicts}`,
  );
  for (const update of plan.updates) {
    const { target } = update;
    const locator =
      target.urlBefore === target.urlAfter
        ? ""
        : `; locator ${target.urlBefore} -> ${target.urlAfter}`;
    console.log(
      `Pending Thesis:${target.id} accessDate null -> ${target.accessDate}${locator}; ` +
        `before ${update.beforeSha256}; after ${update.afterSha256}`,
    );
  }
  for (const id of plan.alreadyAppliedIds)
    console.log(`Already applied Thesis:${id}`);
  for (const conflict of plan.conflicts) {
    console.log(`Conflict Thesis:${conflict.id}: ${conflict.detail}`);
  }
}

function fullSnapshotWhere(
  row: ThesisDatabaseSnapshot,
): Prisma.ThesisWhereInput {
  return {
    id: row.id,
    authors: row.authors,
    institution: row.institution,
    year: row.year,
    title: row.title,
    titleNo: row.titleNo,
    url: row.url,
    synthesis: row.synthesis,
    keyFindings: { equals: row.keyFindings },
    tags: { equals: row.tags },
    takeaways: { equals: row.takeaways },
    method: row.method,
    awardWinning: row.awardWinning,
    degree: row.degree,
    doi: row.doi,
    isbn: row.isbn,
    publisher: row.publisher,
    accessDate: row.accessDate,
    documentId: row.documentId,
  };
}

async function findCasPreflightMismatches(
  client: RemainingThesisAccessDateClient,
  plan: RemainingThesisAccessDateRepairPlan,
) {
  const checks = await Promise.all(
    plan.updates.map(async (update) => {
      const row = update.beforeSnapshot;
      return {
        id: row.id,
        count: await client.thesis.count({ where: fullSnapshotWhere(row) }),
      };
    }),
  );
  return checks.filter((check) => check.count !== 1);
}

function exactIds(rows: Array<{ id: string }>, expected: readonly string[]) {
  return (
    JSON.stringify(rows.map((row) => row.id).sort()) ===
    JSON.stringify([...expected].sort())
  );
}

async function lockReviewedRows(transaction: Prisma.TransactionClient) {
  const ids = REVIEWED_REMAINING_THESIS_ACCESS_DATE_TARGETS.map(
    (target) => target.id,
  );
  const locked = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM "Thesis"
    WHERE "id" IN (${Prisma.join(ids)})
    ORDER BY "id" FOR UPDATE
  `);
  if (!exactIds(locked, ids)) {
    throw new Error(
      "Reviewed remaining Thesis rows changed after planning; no rows updated",
    );
  }
}

async function applyUpdate(
  transaction: Prisma.TransactionClient,
  update: RemainingThesisAccessDateUpdate,
) {
  const row = update.beforeSnapshot;
  const result = await transaction.thesis.updateMany({
    where: {
      id: row.id,
      authors: row.authors,
      institution: row.institution,
      year: row.year,
      title: row.title,
      titleNo: row.titleNo,
      url: row.url,
      synthesis: row.synthesis,
      keyFindings: { equals: row.keyFindings },
      tags: { equals: row.tags },
      takeaways: { equals: row.takeaways },
      method: row.method,
      awardWinning: row.awardWinning,
      degree: row.degree,
      doi: row.doi,
      isbn: row.isbn,
      publisher: row.publisher,
      accessDate: row.accessDate,
      documentId: row.documentId,
    },
    data: {
      url: update.target.urlAfter,
      accessDate: update.target.accessDate,
    },
  });
  if (result.count !== 1) {
    throw new Error(
      `Concurrent remaining Thesis access-date CAS conflict: ${row.id}; no rows updated`,
    );
  }
}

function isConcurrentWriteConflict(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /P2034|serialize|serialization|deadlock|concurrent|changed after planning/i.test(
    message,
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.apply && args.ack !== APPLY_ACK) {
    throw new Error(`--apply requires --ack=${APPLY_ACK}`);
  }
  if (args.apply && !/^[a-f0-9]{64}$/.test(args.expectedPlanSha256 ?? "")) {
    throw new Error(
      "--apply requires the exact --plan-sha256=<64 lowercase hex> emitted by a reviewed dry run",
    );
  }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

  validateRemainingThesisAccessDateSeedTargets();
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  try {
    const plan = await inspectRemainingThesisAccessDates(prisma);
    const digest = remainingThesisAccessDateRepairPlanSha256(plan);
    printPlan(plan, digest);
    if (plan.conflicts.length > 0) {
      throw new Error(
        "Reviewed remaining Thesis access-date conflicts detected; refusing mutation",
      );
    }

    const preflightMismatches = await findCasPreflightMismatches(prisma, plan);
    if (preflightMismatches.length > 0) {
      throw new Error(
        `Remaining Thesis access-date full-row CAS preflight mismatch: ` +
          preflightMismatches.map((row) => row.id).join(", "),
      );
    }
    console.log(
      `Full-row CAS preflight: ${plan.updates.length}/${plan.updates.length} ` +
        "exact pending Thesis snapshots matched",
    );

    if (!args.apply) {
      console.log(
        `Dry run only. After review, re-run with --apply --ack=${APPLY_ACK} ` +
          `--plan-sha256=${digest}`,
      );
      return;
    }
    if (digest !== args.expectedPlanSha256) {
      throw new Error(
        "Current plan differs from --plan-sha256; rerun dry-run and review the new plan",
      );
    }

    const applied = await prisma.$transaction(
      async (transaction) => {
        await transaction.$executeRaw`
        SELECT pg_advisory_xact_lock(hashtext(${ADVISORY_LOCK_KEY}))
      `;
        await lockReviewedRows(transaction);

        const lockedPlan = await inspectRemainingThesisAccessDates(transaction);
        if (
          lockedPlan.conflicts.length > 0 ||
          remainingThesisAccessDateRepairPlanSha256(lockedPlan) !==
            args.expectedPlanSha256
        ) {
          throw new Error(
            "Concurrent remaining Thesis snapshot drift detected; no rows updated",
          );
        }
        for (const update of lockedPlan.updates)
          await applyUpdate(transaction, update);

        const afterPlan = await inspectRemainingThesisAccessDates(transaction);
        if (
          afterPlan.conflicts.length > 0 ||
          afterPlan.updates.length > 0 ||
          afterPlan.alreadyAppliedIds.length !==
            REVIEWED_REMAINING_THESIS_ACCESS_DATE_TARGETS.length
        ) {
          throw new Error(
            "Post-apply remaining Thesis state did not match the reviewed target; no rows updated",
          );
        }
        return lockedPlan.updates.length;
      },
      // prettier-ignore
      { isolationLevel: 'Serializable' },
    );

    console.log(
      `Verified remaining Thesis access-date repair applied: ${applied} row(s)`,
    );
  } catch (error) {
    if (args.apply && isConcurrentWriteConflict(error)) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(
        "Verified remaining Thesis access-date repair conflicted with a concurrent write; " +
          `the Serializable transaction rolled back and zero rows were committed. Cause: ${detail}. ` +
          "Rerun dry-run.",
        { cause: error },
      );
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

const isEntrypoint = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;

if (isEntrypoint) {
  main().catch((error) => {
    console.error(
      error instanceof Error
        ? error.message
        : "Verified remaining Thesis access-date repair failed",
    );
    process.exitCode = 1;
  });
}
