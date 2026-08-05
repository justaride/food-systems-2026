import "dotenv/config";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { reports } from "../prisma/seed-data/reports";
import {
  REVIEWED_REPORT_ACCESS_DATE,
  REVIEWED_REPORT_ACCESS_DATE_IDS,
  REVIEWED_REPORT_LOCATOR_REPAIRS,
  UNRESOLVED_REPORT_ACCESS_DATE_IDS,
} from "../src/lib/citations/reviewed-report-access-date-batch";
import {
  PINNED_REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST_SHA256,
  REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST,
  REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST_SHA256,
  validateReviewedReportProvenanceCorrectionManifest,
} from "../src/lib/citations/reviewed-report-provenance-corrections";
import {
  PINNED_REVIEWED_ETMV_REPORT_TITLE_REPAIR_CONTRACT_SHA256,
  REVIEWED_ETMV_REPORT_ID,
  REVIEWED_ETMV_REPORT_TITLE_AFTER,
  REVIEWED_ETMV_REPORT_TITLE_BEFORE,
  REVIEWED_ETMV_REPORT_TITLE_REPAIR_CONTRACT_SHA256,
} from "../src/lib/citations/reviewed-etmv-report-title-repair";

const APPLY_ACK = "APPLY_REVIEWED_REPORT_ACCESS_DATES_2026_07_20";
const ADVISORY_LOCK_KEY =
  "foodsystems:reviewed-report-access-dates:2026-07-20:v1";
const MANIFEST_PATH = fileURLToPath(
  new URL(
    "../research/_status/reviewed-report-access-date-manifest-2026-07-20.json",
    import.meta.url,
  ),
);
const QUEUE_PATH = fileURLToPath(
  new URL(
    "../research/_status/academic-source-quality-repair-queue.json",
    import.meta.url,
  ),
);

export const PINNED_REVIEWED_REPORT_ACCESS_DATE_MANIFEST_SHA256 =
  "a6a0959188fc24e5dba10f9c94e111ce4e05df2c75d3342f643d7bdc6a603e20";

export type ReviewedReportAccessClassification =
  | "exact_verified"
  | "locator_repair_verified"
  | "generic_or_misbound_unresolved"
  | "bot_only_unverified"
  | "dead_unresolved";

export type ReviewedReportAccessReview = {
  id: string;
  title: string;
  urlBefore: string;
  classification: ReviewedReportAccessClassification;
  urlAfter: string | null;
  accessDate: string | null;
  seedRowSha256: string | null;
  evidenceKind: string;
  evidenceLocator: string;
  evidenceSha256: string | null;
  evidenceNote: string;
  bibliographicCaveat: string | null;
};

type ReviewedReportAccessManifest = {
  version: 1;
  reviewedAt: string;
  timezone: string;
  queueGeneratedAt: string;
  queueReportCount: number;
  classificationCounts: Record<ReviewedReportAccessClassification, number>;
  targetCount: number;
  mutationScope: string;
  proofBoundary: string;
  seedIdentitySha256: string;
  linkedDocumentDisposition: {
    update: {
      reportId: string;
      urlBefore: string;
      urlAfter: string;
      accessDate: string;
      evidenceNote: string;
    };
    preserve: Array<{
      reportId: string;
      expectedUrl: string;
      reason: string;
    }>;
  };
  reviews: ReviewedReportAccessReview[];
};

export type ReviewedReportAccessQueueRow = {
  id: string;
  title: string;
  url: string;
};

export type ReviewedReportAccessQueueState =
  | "pre_apply_full_scope"
  | "post_provenance_unresolved_residual";

export const POST_PROVENANCE_HISTORICAL_UNRESOLVED_REPORT_IDS = [
  "arla-farmahead-check-2024",
  "beredskap-nibio-selvforsyning-2026",
  "beredskap-nibio-selvforsyning-metode",
  "kt-markedsundersokelser-2026",
  "meld-st-4-dagligvare",
] as const;

export const POST_PROVENANCE_REMOVED_UNRESOLVED_REPORT_IDS = [
  "beredskap-finsk-modell-hvk",
  "is-markedsstruktur-2024",
  "kbh-food-strategy-madhus",
  "plantefonden-projects-2023-2025",
  "reitan-2024-25",
  "sodertaelje-diet-green-planet",
] as const;

export const POST_MANIFEST_EXTERNAL_REPORT_ACCESS_GAP_IDS = [
  "akademia-sifo-kundeprogram-2026",
  "coop-2024",
  "dk-salling-coop-decision-2025",
  "emv-kartlegging-2023",
] as const;

export const POST_PROVENANCE_REPORT_ACCESS_QUEUE_ROWS = Object.freeze([
  Object.freeze({
    id: "akademia-sifo-kundeprogram-2026",
    title: "SIFO: Lojalitetsprogrammer og prisdata",
    url: "https://www.regjeringen.no/contentassets/139405f88a35456986e5aa579de7f290/sifo-rapport-1-2026-kunnskapsgrunnlag-om-kundeprogrammene-i-dagligvaremarkedet.pdf",
  }),
  Object.freeze({
    id: "arla-farmahead-check-2024",
    title: "Arla FarmAhead Check — Sustainability Incentive Model 2024",
    url: "https://www.arla.com/sustainability/",
  }),
  Object.freeze({
    id: "beredskap-nibio-selvforsyning-2026",
    title: "NIBIO: Norsk selvforsyningsgrad 2026",
    url: "https://www.nibio.no/tema/landbruksokonomi/selvforsyningsgrad-og-engrosforbruk",
  }),
  Object.freeze({
    id: "beredskap-nibio-selvforsyning-metode",
    title: "NIBIO: Metode for selvforsyningsberegning",
    url: "https://hdl.handle.net/11250/3105805",
  }),
  Object.freeze({
    id: "coop-2024",
    title: "Coop Aarsresultat 2024",
    url: "https://www.coop.no/om-coop/virksomheten/arsrapport",
  }),
  Object.freeze({
    id: "dk-salling-coop-decision-2025",
    title:
      "Salling Group A/S erhvervelse af dele af Coop Danmark A/S (Konkurrencerådsafgørelse 26. marts 2025)",
    url: "https://kfst.dk/konkurrenceforhold/afgoerelser/afgoerelser-paa-konkurrenceomraadet/raads-og-styrelsesafgoerelser/2025/20250326-salling-group-dele-af-coop-danmark",
  }),
  Object.freeze({
    id: "emv-kartlegging-2023",
    title:
      "Kartlegging av egne merkevarer og vertikal integrasjon i dagligvaremarkedet",
    url: "https://www.regjeringen.no/contentassets/41847427caa14feb8b8578af3d6d45bc/r15-2023-kartlegging-av-egne-merkevarer-og-vertikal-integrasjon-i-dagligvaremarkedet.pdf",
  }),
  Object.freeze({
    id: "kt-markedsundersokelser-2026",
    title: "Markedsundersokelser § 14 — Status",
    url: "https://www.regjeringen.no/no/aktuelt/i-dag-far-konkurransetilsynet-et-nytt-verktoy-for-a-bekjempe-alvorlige-konkurranseproblemer/id3113837/",
  }),
  Object.freeze({
    id: "meld-st-4-dagligvare",
    title: "Status dagligvaretiltak (10-punktsplanen)",
    url: "https://www.regjeringen.no/no/dokumenter/meld.-st.-4-20242025/id3056808/",
  }),
]) satisfies readonly ReviewedReportAccessQueueRow[];

export const POST_PROVENANCE_REPORT_ACCESS_QUEUE_ROW_SHA256 = Object.freeze({
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

export const POST_PROVENANCE_REPORT_ACCESS_QUEUE_IDS_SHA256 =
  "eb8ee51bae174d8f5a3b01fe20c0046a18d6b3e512c8f980175192aadcb9a963";
export const POST_PROVENANCE_REPORT_ACCESS_QUEUE_ROWS_SHA256 =
  "ff3f038fb03735ba35fb21f28b85317f5f43d1a5d64fe9fbdd4f5583cf9a1701";

export function validateReviewedReportAccessDateProvenanceOverlay() {
  validateReviewedReportProvenanceCorrectionManifest();
  if (
    REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST_SHA256 !==
      PINNED_REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST_SHA256 ||
    REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST.length !== 7
  ) {
    throw new Error("Reviewed Report provenance correction overlay drifted");
  }
  const correctionById = new Map(
    REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST.map((entry) => [
      entry.id,
      entry,
    ]),
  );
  const remainsExternal = new Set(["external_report", "external_article"]);
  const historicalResidual = UNRESOLVED_REPORT_ACCESS_DATE_IDS.filter((id) => {
    const correction = correctionById.get(id);
    return !correction || remainsExternal.has(correction.targetType);
  });
  const removed = UNRESOLVED_REPORT_ACCESS_DATE_IDS.filter(
    (id) => !historicalResidual.includes(id),
  );
  if (
    JSON.stringify(historicalResidual) !==
      JSON.stringify(POST_PROVENANCE_HISTORICAL_UNRESOLVED_REPORT_IDS) ||
    JSON.stringify(removed) !==
      JSON.stringify(POST_PROVENANCE_REMOVED_UNRESOLVED_REPORT_IDS)
  ) {
    throw new Error(
      "Reviewed Report provenance overlay no longer yields the exact 5 retained and 6 removed historical unresolved ids",
    );
  }
  const rowHashes = Object.fromEntries(
    POST_PROVENANCE_REPORT_ACCESS_QUEUE_ROWS.map((row) => [
      row.id,
      snapshotSha256(row),
    ]),
  );
  const ids = POST_PROVENANCE_REPORT_ACCESS_QUEUE_ROWS.map((row) => row.id);
  const added = ids.filter(
    (id) =>
      !(historicalResidual as readonly string[]).includes(id),
  );
  if (
    POST_PROVENANCE_REPORT_ACCESS_QUEUE_ROWS.length !== 9 ||
    new Set(ids).size !== 9 ||
    snapshotSha256(ids) !==
      POST_PROVENANCE_REPORT_ACCESS_QUEUE_IDS_SHA256 ||
    snapshotSha256(POST_PROVENANCE_REPORT_ACCESS_QUEUE_ROWS) !==
      POST_PROVENANCE_REPORT_ACCESS_QUEUE_ROWS_SHA256 ||
    JSON.stringify(rowHashes) !==
      JSON.stringify(POST_PROVENANCE_REPORT_ACCESS_QUEUE_ROW_SHA256) ||
    JSON.stringify(added) !==
      JSON.stringify(POST_MANIFEST_EXTERNAL_REPORT_ACCESS_GAP_IDS)
  ) {
    throw new Error(
      "Post-provenance Report access queue rows or SHA-256 pins drifted",
    );
  }
  for (const expected of POST_PROVENANCE_REPORT_ACCESS_QUEUE_ROWS) {
    const matches = reports.filter((row) => row.id === expected.id);
    if (
      matches.length !== 1 ||
      matches[0]?.title !== expected.title ||
      matches[0]?.sourceUrl !== expected.url ||
      !remainsExternal.has(matches[0]?.provenanceType ?? "") ||
      (matches[0]?.accessedAt !== undefined &&
        matches[0]?.accessedAt !== null)
    ) {
      throw new Error(
        `Post-provenance external Report access gap drifted: ${expected.id}`,
      );
    }
  }
  return {
    retainedHistoricalIds: [...historicalResidual],
    removedHistoricalIds: [...removed],
    postManifestIds: [...POST_MANIFEST_EXTERNAL_REPORT_ACCESS_GAP_IDS],
  };
}

export function validateReviewedReportAccessDateQueueState(input: {
  queueGeneratedAt: string;
  manifestQueueGeneratedAt: string;
  queueRows: readonly ReviewedReportAccessQueueRow[];
  manifestQueueRows: readonly ReviewedReportAccessQueueRow[];
  unresolvedIds: readonly string[];
}): ReviewedReportAccessQueueState {
  const fullScopeMatches =
    input.queueGeneratedAt === input.manifestQueueGeneratedAt &&
    JSON.stringify(input.queueRows) === JSON.stringify(input.manifestQueueRows);
  if (fullScopeMatches) return "pre_apply_full_scope";

  const manifestGeneratedAt = Date.parse(input.manifestQueueGeneratedAt);
  const queueGeneratedAt = Date.parse(input.queueGeneratedAt);
  const isLaterQueue =
    Number.isFinite(manifestGeneratedAt) &&
    Number.isFinite(queueGeneratedAt) &&
    queueGeneratedAt > manifestGeneratedAt;
  const overlay = validateReviewedReportAccessDateProvenanceOverlay();
  const historicalUnresolvedMatches =
    JSON.stringify(input.unresolvedIds) ===
    JSON.stringify(UNRESOLVED_REPORT_ACCESS_DATE_IDS);
  const historicalRowsById = new Map(
    input.manifestQueueRows.map((row) => [row.id, row]),
  );
  const retainedHistoricalRowsMatch = overlay.retainedHistoricalIds.every(
    (id) => {
      const historical = historicalRowsById.get(id);
      const current = POST_PROVENANCE_REPORT_ACCESS_QUEUE_ROWS.find(
        (row) => row.id === id,
      );
      return JSON.stringify(historical) === JSON.stringify(current);
    },
  );
  const postManifestRowsWereNotInHistoricalScope =
    overlay.postManifestIds.every((id) => !historicalRowsById.has(id));
  const residualScopeMatches =
    historicalUnresolvedMatches &&
    retainedHistoricalRowsMatch &&
    postManifestRowsWereNotInHistoricalScope &&
    snapshotSha256(input.queueRows.map((row) => row.id)) ===
      POST_PROVENANCE_REPORT_ACCESS_QUEUE_IDS_SHA256 &&
    snapshotSha256(input.queueRows) ===
      POST_PROVENANCE_REPORT_ACCESS_QUEUE_ROWS_SHA256 &&
    JSON.stringify(input.queueRows) ===
      JSON.stringify(POST_PROVENANCE_REPORT_ACCESS_QUEUE_ROWS);
  if (isLaterQueue && residualScopeMatches) {
    return "post_provenance_unresolved_residual";
  }

  throw new Error(
    "Fresh Report review queue must match either the pinned 66-row pre-apply scope or the exact 9-row post-provenance unresolved residual",
  );
}

export type ReviewedReportAccessTarget = ReviewedReportAccessReview & {
  classification: "exact_verified" | "locator_repair_verified";
  urlAfter: string;
  accessDate: string;
  seedRowSha256: string;
};

export type ReportSeedSnapshot = {
  id: string;
  title: string;
  fullTitle: string | null;
  author: string | null;
  institution: string | null;
  date: string | null;
  year: number | null;
  sourceUrl: string | null;
  reportCategory: string;
  country: string;
  keyFindings: string[];
  recommendations: string[];
  relevance: string;
  tags: string[];
  doi: string | null;
  isbn: string | null;
  issn: string | null;
  publisher: string | null;
  provenanceType: string | null;
  supportingSources: unknown | null;
  accessedAt: string | null;
};

export type ReportDatabaseSnapshot = ReportSeedSnapshot & {
  documentId: string | null;
};

export type LinkedReportDocumentSnapshot = {
  reportId: string;
  id: string;
  slug: string;
  filePath: string | null;
  title: string;
  author: string | null;
  year: number | null;
  documentType: string | null;
  category: string | null;
  subcategory: string | null;
  country: string | null;
  content: string;
  summary: string | null;
  url: string | null;
  accessedAt: string | null;
  archivedUrl: string | null;
  wordCount: number;
  tags: string[];
  metadata: unknown | null;
  createdAt: string;
  updatedAt: string;
};

export type LinkedReportDocumentUpdate = {
  reportId: string;
  beforeSnapshot: LinkedReportDocumentSnapshot;
  beforeSha256: string;
  urlAfter: string;
  accessDate: string;
};

export type ProtectedLinkedReportDocument = {
  reportId: string;
  snapshot: LinkedReportDocumentSnapshot;
  snapshotSha256: string;
};

export type ReviewedReportAccessDateConflict = {
  id: string;
  detail: string;
};

export type ReviewedReportAccessDateUpdate = {
  target: ReviewedReportAccessTarget;
  beforeSnapshot: ReportDatabaseSnapshot;
  beforeSha256: string;
  afterSha256: string;
};

export type ReviewedReportAccessDateRepairPlan = {
  version: 1;
  manifestSha256: string;
  updates: ReviewedReportAccessDateUpdate[];
  alreadyAppliedIds: string[];
  linkedDocumentUpdate: LinkedReportDocumentUpdate | null;
  linkedDocumentAlreadyApplied: boolean;
  protectedLinkedDocuments: ProtectedLinkedReportDocument[];
  conflicts: ReviewedReportAccessDateConflict[];
  summary: {
    total: number;
    pending: number;
    alreadyApplied: number;
    linkedDocumentPending: number;
    linkedDocumentAlreadyApplied: number;
    protectedLinkedDocuments: number;
    conflicts: number;
  };
};

const REPORT_SNAPSHOT_FIELDS = [
  "id",
  "title",
  "fullTitle",
  "author",
  "institution",
  "date",
  "year",
  "sourceUrl",
  "reportCategory",
  "country",
  "keyFindings",
  "recommendations",
  "relevance",
  "tags",
  "doi",
  "isbn",
  "issn",
  "publisher",
  "provenanceType",
  "supportingSources",
  "accessedAt",
  "documentId",
] as const;

function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort()
        .map((key) => [
          key,
          canonicalize((value as Record<string, unknown>)[key]),
        ]),
    );
  }
  return value;
}

function snapshotSha256(snapshot: unknown) {
  return sha256(JSON.stringify(canonicalize(snapshot)));
}

function absoluteHttpUrl(value: string) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function loadReviewedManifest(): ReviewedReportAccessManifest {
  const raw = readFileSync(MANIFEST_PATH);
  if (sha256(raw) !== PINNED_REVIEWED_REPORT_ACCESS_DATE_MANIFEST_SHA256) {
    throw new Error(
      "Reviewed Report access-date manifest drifted from its pinned SHA-256",
    );
  }
  const manifest = JSON.parse(
    raw.toString("utf8"),
  ) as ReviewedReportAccessManifest;
  const expectedCounts = {
    exact_verified: 52,
    locator_repair_verified: 3,
    generic_or_misbound_unresolved: 11,
    bot_only_unverified: 0,
    dead_unresolved: 0,
  };
  if (
    manifest.version !== 1 ||
    manifest.reviewedAt !== REVIEWED_REPORT_ACCESS_DATE ||
    manifest.timezone !== "Europe/Oslo" ||
    manifest.queueGeneratedAt !== "2026-07-19T23:10:41.682Z" ||
    manifest.queueReportCount !== 66 ||
    manifest.targetCount !== 55 ||
    JSON.stringify(manifest.classificationCounts) !==
      JSON.stringify(expectedCounts) ||
    !manifest.mutationScope ||
    !manifest.proofBoundary ||
    !/^[a-f0-9]{64}$/.test(manifest.seedIdentitySha256) ||
    manifest.linkedDocumentDisposition?.update.reportId !==
      "norgesgruppen-halvarsrapport-h1-2025" ||
    manifest.linkedDocumentDisposition.update.urlBefore !==
      "https://www.norgesgruppen.no/finans/finans-hjem/rapporter/" ||
    manifest.linkedDocumentDisposition.update.urlAfter !==
      REVIEWED_REPORT_LOCATOR_REPAIRS["norgesgruppen-halvarsrapport-h1-2025"] ||
    manifest.linkedDocumentDisposition.update.accessDate !==
      REVIEWED_REPORT_ACCESS_DATE ||
    manifest.linkedDocumentDisposition.preserve.length !== 2 ||
    JSON.stringify(
      manifest.linkedDocumentDisposition.preserve.map((row) => row.reportId),
    ) !== JSON.stringify(["kesko-annual-report-2024", "salling-group-2024"]) ||
    !Array.isArray(manifest.reviews) ||
    manifest.reviews.length !== 66
  ) {
    throw new Error("Reviewed Report access-date manifest header is invalid");
  }

  const ids = manifest.reviews.map((review) => review.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error("Reviewed Report access-date manifest has duplicate ids");
  }
  for (const review of manifest.reviews) {
    if (
      !review.id ||
      !review.title ||
      !absoluteHttpUrl(review.urlBefore) ||
      !absoluteHttpUrl(review.evidenceLocator) ||
      !review.evidenceKind ||
      !review.evidenceNote ||
      (review.evidenceSha256 !== null &&
        !/^[a-f0-9]{64}$/.test(review.evidenceSha256)) ||
      (review.bibliographicCaveat !== null &&
        !review.bibliographicCaveat.trim())
    ) {
      throw new Error(`Invalid reviewed Report evidence row: ${review.id}`);
    }
    const verified = ["exact_verified", "locator_repair_verified"].includes(
      review.classification,
    );
    if (
      verified !==
      (review.urlAfter !== null &&
        absoluteHttpUrl(review.urlAfter) &&
        review.accessDate === REVIEWED_REPORT_ACCESS_DATE &&
        review.seedRowSha256 !== null &&
        /^[a-f0-9]{64}$/.test(review.seedRowSha256))
    ) {
      throw new Error(`Invalid reviewed Report target boundary: ${review.id}`);
    }
  }

  const queue = JSON.parse(readFileSync(QUEUE_PATH, "utf8")) as {
    generatedAt: string;
    accessDateReviewRows: Array<{
      set: string;
      id: string;
      title: string;
      url: string;
    }>;
  };
  const queueRows = queue.accessDateReviewRows
    .filter((row) => row.set === "Report")
    .map(({ id, title, url }) => ({ id, title, url }));
  const manifestQueueRows = manifest.reviews.map((review) => ({
    id: review.id,
    title: review.title,
    url: review.urlBefore,
  }));
  validateReviewedReportAccessDateQueueState({
    queueGeneratedAt: queue.generatedAt,
    manifestQueueGeneratedAt: manifest.queueGeneratedAt,
    queueRows,
    manifestQueueRows,
    unresolvedIds: UNRESOLVED_REPORT_ACCESS_DATE_IDS,
  });

  const repairs = manifest.reviews.filter(
    (review) => review.classification === "locator_repair_verified",
  );
  if (
    JSON.stringify(repairs.map((review) => [review.id, review.urlAfter])) !==
    JSON.stringify(Object.entries(REVIEWED_REPORT_LOCATOR_REPAIRS))
  ) {
    throw new Error("Reviewed Report locator repair set drifted");
  }
  const unresolved = manifest.reviews
    .filter(
      (review) => review.classification === "generic_or_misbound_unresolved",
    )
    .map((review) => review.id);
  if (
    JSON.stringify(unresolved) !==
    JSON.stringify([...UNRESOLVED_REPORT_ACCESS_DATE_IDS])
  ) {
    throw new Error("Unresolved Report set drifted");
  }
  return manifest;
}

const reviewedManifest = loadReviewedManifest();

export const REVIEWED_REPORT_ACCESS_REVIEWS: readonly ReviewedReportAccessReview[] =
  reviewedManifest.reviews.map((review) => ({ ...review }));

export const REVIEWED_REPORT_ACCESS_DATE_TARGETS: readonly ReviewedReportAccessTarget[] =
  reviewedManifest.reviews
    .filter(
      (review): review is ReviewedReportAccessTarget =>
        review.classification === "exact_verified" ||
        review.classification === "locator_repair_verified",
    )
    .map((target) => ({ ...target }));

export function normalizeReportSeedSnapshot(
  row: (typeof reports)[number],
): ReportSeedSnapshot {
  return {
    id: row.id,
    title: row.title,
    fullTitle: row.fullTitle ?? null,
    author: row.author ?? null,
    institution: row.institution ?? null,
    date: row.date ?? null,
    year: row.year ?? null,
    sourceUrl: row.sourceUrl ?? null,
    reportCategory: row.reportCategory,
    country: row.country ?? "NO",
    keyFindings: [...row.keyFindings],
    recommendations: [...row.recommendations],
    relevance: row.relevance,
    tags: [...row.tags],
    doi: row.doi ?? null,
    isbn: row.isbn ?? null,
    issn: row.issn ?? null,
    publisher: row.publisher ?? null,
    provenanceType: row.provenanceType ?? null,
    supportingSources: row.supportingSources ?? null,
    accessedAt: row.accessedAt ?? null,
  };
}

function validateReviewedReportAccessDateSeedIdentityOverlays() {
  if (
    REVIEWED_ETMV_REPORT_TITLE_REPAIR_CONTRACT_SHA256 !==
    PINNED_REVIEWED_ETMV_REPORT_TITLE_REPAIR_CONTRACT_SHA256
  ) {
    throw new Error(
      "Reviewed ETMV Report title overlay drifted from its pinned contract",
    );
  }
}

export function reviewedReportAccessDateHistoricalSeedSnapshot(
  snapshot: ReportSeedSnapshot,
): ReportSeedSnapshot {
  validateReviewedReportAccessDateSeedIdentityOverlays();
  if (snapshot.id !== REVIEWED_ETMV_REPORT_ID) return snapshot;
  if (
    snapshot.title !== REVIEWED_ETMV_REPORT_TITLE_BEFORE &&
    snapshot.title !== REVIEWED_ETMV_REPORT_TITLE_AFTER
  ) {
    throw new Error(
      `Reviewed ETMV Report title is outside the exact reviewed transition: ${snapshot.title}`,
    );
  }
  return snapshot.title === REVIEWED_ETMV_REPORT_TITLE_BEFORE
    ? snapshot
    : { ...snapshot, title: REVIEWED_ETMV_REPORT_TITLE_BEFORE };
}

export function reviewedReportAccessDateSeedSnapshotVariants(
  snapshot: ReportSeedSnapshot,
): readonly ReportSeedSnapshot[] {
  const historical = reviewedReportAccessDateHistoricalSeedSnapshot(snapshot);
  if (snapshot.id !== REVIEWED_ETMV_REPORT_ID) return [snapshot];
  const current =
    snapshot.title === REVIEWED_ETMV_REPORT_TITLE_AFTER
      ? snapshot
      : { ...snapshot, title: REVIEWED_ETMV_REPORT_TITLE_AFTER };
  return [historical, current];
}

export function validateReviewedReportAccessDateManifest() {
  loadReviewedManifest();
  if (
    REVIEWED_REPORT_ACCESS_REVIEWS.length !== 66 ||
    REVIEWED_REPORT_ACCESS_DATE_TARGETS.length !== 55
  ) {
    throw new Error("Reviewed Report access-date counts drifted");
  }
}

export function validateReviewedReportAccessDateSeedTargets(
  rows: typeof reports = reports,
) {
  validateReviewedReportAccessDateManifest();
  const targetSnapshots: ReportSeedSnapshot[] = [];
  for (const target of REVIEWED_REPORT_ACCESS_DATE_TARGETS) {
    const matches = rows.filter((row) => row.id === target.id);
    if (matches.length !== 1) {
      throw new Error(
        `Expected exactly one seed Report for ${target.id}; found ${matches.length}`,
      );
    }
    const currentSnapshot = normalizeReportSeedSnapshot(matches[0]!);
    const snapshot =
      reviewedReportAccessDateHistoricalSeedSnapshot(currentSnapshot);
    const digest = snapshotSha256(snapshot);
    if (digest !== target.seedRowSha256) {
      throw new Error(
        `Full seed Report snapshot drifted for ${target.id}: ${digest}`,
      );
    }
    targetSnapshots.push(snapshot);
  }
  targetSnapshots.sort((left, right) => left.id.localeCompare(right.id));
  if (snapshotSha256(targetSnapshots) !== reviewedManifest.seedIdentitySha256) {
    throw new Error("Aggregate reviewed Report seed identity drifted");
  }
}

function snapshotsEqual(
  left: ReportDatabaseSnapshot,
  right: ReportDatabaseSnapshot,
) {
  return REPORT_SNAPSHOT_FIELDS.every(
    (field) =>
      JSON.stringify(canonicalize(left[field])) ===
      JSON.stringify(canonicalize(right[field])),
  );
}

function snapshotDiff(
  actual: ReportDatabaseSnapshot,
  expected: ReportDatabaseSnapshot,
) {
  return REPORT_SNAPSHOT_FIELDS.filter(
    (field) =>
      JSON.stringify(canonicalize(actual[field])) !==
      JSON.stringify(canonicalize(expected[field])),
  );
}

export function buildReviewedReportAccessDateRepairPlan(
  rows: readonly ReportDatabaseSnapshot[],
  documents: readonly LinkedReportDocumentSnapshot[] = [],
): ReviewedReportAccessDateRepairPlan {
  validateReviewedReportAccessDateSeedTargets();
  const updates: ReviewedReportAccessDateUpdate[] = [];
  const alreadyAppliedIds: string[] = [];
  const conflicts: ReviewedReportAccessDateConflict[] = [];
  const protectedLinkedDocuments: ProtectedLinkedReportDocument[] = [];

  for (const target of REVIEWED_REPORT_ACCESS_DATE_TARGETS) {
    const matches = rows.filter((row) => row.id === target.id);
    if (matches.length !== 1) {
      conflicts.push({
        id: target.id,
        detail: `Expected exactly one database row; found ${matches.length}.`,
      });
      continue;
    }
    const row = matches[0]!;
    const seedRow = reports.find((candidate) => candidate.id === target.id)!;
    const reviewedSeedSnapshot = normalizeReportSeedSnapshot(seedRow);
    const snapshotVariants = reviewedReportAccessDateSeedSnapshotVariants(
      reviewedSeedSnapshot,
    );
    const transitions = snapshotVariants.map((variant) => ({
      beforeSnapshot: {
        ...variant,
        sourceUrl: target.urlBefore,
        accessedAt: null,
        documentId: row.documentId,
      } satisfies ReportDatabaseSnapshot,
      afterSnapshot: {
        ...variant,
        sourceUrl: target.urlAfter,
        accessedAt: target.accessDate,
        documentId: row.documentId,
      } satisfies ReportDatabaseSnapshot,
    }));
    const appliedTransition = transitions.find((transition) =>
      snapshotsEqual(row, transition.afterSnapshot),
    );
    if (appliedTransition) {
      alreadyAppliedIds.push(target.id);
      continue;
    }
    const pendingTransition = transitions.find((transition) =>
      snapshotsEqual(row, transition.beforeSnapshot),
    );
    if (pendingTransition) {
      updates.push({
        target,
        beforeSnapshot: pendingTransition.beforeSnapshot,
        beforeSha256: snapshotSha256(pendingTransition.beforeSnapshot),
        afterSha256: snapshotSha256(pendingTransition.afterSnapshot),
      });
      continue;
    }
    const expected = transitions[0]!.beforeSnapshot;
    conflicts.push({
      id: target.id,
      detail: `Full reviewed database snapshot drifted: ${snapshotDiff(row, expected).join(", ")}.`,
    });
  }

  const linkedDocument = reviewedManifest.linkedDocumentDisposition.update;
  const linkedReportRow = rows.find(
    (row) => row.id === linkedDocument.reportId,
  );
  const linkedDocumentRows = documents.filter(
    (row) => row.reportId === linkedDocument.reportId,
  );
  let linkedDocumentUpdate: LinkedReportDocumentUpdate | null = null;
  let linkedDocumentAlreadyApplied = false;
  if (
    !linkedReportRow ||
    linkedDocumentRows.length !== 1 ||
    linkedReportRow.documentId !== linkedDocumentRows[0]?.id
  ) {
    conflicts.push({
      id: `Document:${linkedDocument.reportId}`,
      detail:
        "Expected exactly one linked Document whose id matches Report.documentId.",
    });
  } else {
    const document = linkedDocumentRows[0]!;
    if (
      document.url === linkedDocument.urlAfter &&
      document.accessedAt === linkedDocument.accessDate
    ) {
      linkedDocumentAlreadyApplied = true;
    } else if (
      document.url === linkedDocument.urlBefore &&
      document.accessedAt === null
    ) {
      linkedDocumentUpdate = {
        reportId: linkedDocument.reportId,
        beforeSnapshot: document,
        beforeSha256: snapshotSha256(document),
        urlAfter: linkedDocument.urlAfter,
        accessDate: linkedDocument.accessDate,
      };
    } else {
      conflicts.push({
        id: `Document:${linkedDocument.reportId}`,
        detail:
          "Linked Document matches neither the exact reviewed before URL/date nor the reviewed after URL/date.",
      });
    }
  }

  for (const disposition of reviewedManifest.linkedDocumentDisposition
    .preserve) {
    const reportRow = rows.find((row) => row.id === disposition.reportId);
    const matching = documents.filter(
      (row) => row.reportId === disposition.reportId,
    );
    const document = matching[0];
    if (
      !reportRow ||
      matching.length !== 1 ||
      !document ||
      reportRow.documentId !== document.id ||
      document.url !== disposition.expectedUrl
    ) {
      conflicts.push({
        id: `Document:${disposition.reportId}`,
        detail:
          "Protected linked Document relation or exact work-level URL drifted; no mutation is allowed.",
      });
      continue;
    }
    protectedLinkedDocuments.push({
      reportId: disposition.reportId,
      snapshot: document,
      snapshotSha256: snapshotSha256(document),
    });
  }

  if (updates.length > 0 && alreadyAppliedIds.length > 0) {
    conflicts.push({
      id: "Batch:Report",
      detail:
        "Reviewed Report batch is partially applied; only the all-before or all-after state is accepted.",
    });
  }
  const linkedReportPending = updates.some(
    (update) => update.target.id === linkedDocument.reportId,
  );
  const linkedReportApplied = alreadyAppliedIds.includes(
    linkedDocument.reportId,
  );
  if (
    (linkedReportPending && !linkedDocumentUpdate) ||
    (linkedReportApplied && !linkedDocumentAlreadyApplied)
  ) {
    conflicts.push({
      id: `Batch:${linkedDocument.reportId}`,
      detail:
        "Report and linked Document mirror are in a partial state; both must be before or both after.",
    });
  }

  return {
    version: 1,
    manifestSha256: PINNED_REVIEWED_REPORT_ACCESS_DATE_MANIFEST_SHA256,
    updates,
    alreadyAppliedIds,
    linkedDocumentUpdate,
    linkedDocumentAlreadyApplied,
    protectedLinkedDocuments,
    conflicts,
    summary: {
      total: REVIEWED_REPORT_ACCESS_DATE_TARGETS.length,
      pending: updates.length,
      alreadyApplied: alreadyAppliedIds.length,
      linkedDocumentPending: linkedDocumentUpdate ? 1 : 0,
      linkedDocumentAlreadyApplied: linkedDocumentAlreadyApplied ? 1 : 0,
      protectedLinkedDocuments: protectedLinkedDocuments.length,
      conflicts: conflicts.length,
    },
  };
}

export function reviewedReportAccessDateRepairPlanSha256(
  plan: ReviewedReportAccessDateRepairPlan,
) {
  return sha256(JSON.stringify(canonicalize(plan)));
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
    ack: argv.find((argument) => argument.startsWith("--ack="))?.slice(6),
    expectedPlanSha256: argv
      .find((argument) => argument.startsWith("--plan-sha256="))
      ?.slice("--plan-sha256=".length),
  };
}

const reportSelect = {
  id: true,
  title: true,
  fullTitle: true,
  author: true,
  institution: true,
  date: true,
  year: true,
  sourceUrl: true,
  reportCategory: true,
  country: true,
  keyFindings: true,
  recommendations: true,
  relevance: true,
  tags: true,
  doi: true,
  isbn: true,
  issn: true,
  publisher: true,
  provenanceType: true,
  supportingSources: true,
  accessedAt: true,
  documentId: true,
} satisfies Prisma.ReportSelect;

const documentSelect = {
  id: true,
  slug: true,
  filePath: true,
  title: true,
  author: true,
  year: true,
  documentType: true,
  category: true,
  subcategory: true,
  country: true,
  content: true,
  summary: true,
  url: true,
  accessedAt: true,
  archivedUrl: true,
  wordCount: true,
  tags: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.DocumentSelect;

type ReviewedReportAccessDateClient = Pick<PrismaClient, "report" | "document">;

function isoDate(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : null;
}

async function inspectReviewedReportAccessDates(
  client: ReviewedReportAccessDateClient,
) {
  const rows = await client.report.findMany({
    where: {
      id: {
        in: REVIEWED_REPORT_ACCESS_DATE_TARGETS.map((target) => target.id),
      },
    },
    select: reportSelect,
    orderBy: { id: "asc" },
  });
  const documentDispositions = [
    reviewedManifest.linkedDocumentDisposition.update.reportId,
    ...reviewedManifest.linkedDocumentDisposition.preserve.map(
      (disposition) => disposition.reportId,
    ),
  ];
  const reportDocumentIds = new Map(
    rows
      .filter(
        (row) =>
          documentDispositions.includes(row.id) && row.documentId !== null,
      )
      .map((row) => [row.documentId!, row.id]),
  );
  const documentRows = await client.document.findMany({
    where: { id: { in: [...reportDocumentIds.keys()] } },
    select: documentSelect,
    orderBy: { id: "asc" },
  });
  return buildReviewedReportAccessDateRepairPlan(
    rows.map((row) => ({
      ...row,
      supportingSources: row.supportingSources,
      accessedAt: isoDate(row.accessedAt),
    })),
    documentRows.map((row) => ({
      ...row,
      reportId: reportDocumentIds.get(row.id) ?? "",
      metadata: row.metadata,
      accessedAt: isoDate(row.accessedAt),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    })),
  );
}

function printPlan(plan: ReviewedReportAccessDateRepairPlan, digest: string) {
  console.log("Reviewed Report work-level access-date repair plan");
  console.log(`Plan SHA-256: ${digest}`);
  console.log(`Reviewed manifest SHA-256: ${plan.manifestSha256}`);
  console.log(
    `Rows: ${plan.summary.total}; pending: ${plan.summary.pending}; ` +
      `already applied: ${plan.summary.alreadyApplied}; conflicts: ${plan.summary.conflicts}`,
  );
  console.log(
    `Linked Documents: pending mirror update ${plan.summary.linkedDocumentPending}; ` +
      `already applied ${plan.summary.linkedDocumentAlreadyApplied}; ` +
      `protected unchanged ${plan.summary.protectedLinkedDocuments}`,
  );
  for (const update of plan.updates) {
    const locator =
      update.target.urlBefore === update.target.urlAfter
        ? ""
        : `; locator ${update.target.urlBefore} -> ${update.target.urlAfter}`;
    console.log(
      `Pending Report:${update.target.id} accessedAt null -> ${update.target.accessDate}${locator}; ` +
        `before ${update.beforeSha256}; after ${update.afterSha256}`,
    );
  }
  for (const id of plan.alreadyAppliedIds)
    console.log(`Already applied Report:${id}`);
  if (plan.linkedDocumentUpdate) {
    console.log(
      `Pending Document mirror:${plan.linkedDocumentUpdate.reportId} ` +
        `${plan.linkedDocumentUpdate.beforeSnapshot.url} -> ${plan.linkedDocumentUpdate.urlAfter}; ` +
        `accessedAt null -> ${plan.linkedDocumentUpdate.accessDate}; ` +
        `before ${plan.linkedDocumentUpdate.beforeSha256}`,
    );
  }
  if (plan.linkedDocumentAlreadyApplied) {
    console.log(
      `Already applied Document mirror:${reviewedManifest.linkedDocumentDisposition.update.reportId}`,
    );
  }
  for (const protectedDocument of plan.protectedLinkedDocuments) {
    console.log(
      `Protected unchanged Document:${protectedDocument.reportId}; ` +
        `snapshot ${protectedDocument.snapshotSha256}`,
    );
  }
  for (const conflict of plan.conflicts) {
    console.log(`Conflict Report:${conflict.id}: ${conflict.detail}`);
  }
}

function databaseDate(value: string | null) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

function fullSnapshotWhere(
  row: ReportDatabaseSnapshot,
): Prisma.ReportWhereInput {
  return {
    id: row.id,
    title: row.title,
    fullTitle: row.fullTitle,
    author: row.author,
    institution: row.institution,
    date: row.date,
    year: row.year,
    sourceUrl: row.sourceUrl,
    reportCategory: row.reportCategory,
    country: row.country,
    keyFindings: { equals: row.keyFindings },
    recommendations: { equals: row.recommendations },
    relevance: row.relevance,
    tags: { equals: row.tags },
    doi: row.doi,
    isbn: row.isbn,
    issn: row.issn,
    publisher: row.publisher,
    provenanceType: row.provenanceType,
    supportingSources:
      row.supportingSources === null
        ? { equals: Prisma.DbNull }
        : { equals: row.supportingSources as Prisma.InputJsonValue },
    accessedAt: databaseDate(row.accessedAt),
    documentId: row.documentId,
  };
}

function fullDocumentSnapshotWhere(
  row: LinkedReportDocumentSnapshot,
): Prisma.DocumentWhereInput {
  return {
    id: row.id,
    slug: row.slug,
    filePath: row.filePath,
    title: row.title,
    author: row.author,
    year: row.year,
    documentType: row.documentType,
    category: row.category,
    subcategory: row.subcategory,
    country: row.country,
    content: row.content,
    summary: row.summary,
    url: row.url,
    accessedAt: databaseDate(row.accessedAt),
    archivedUrl: row.archivedUrl,
    wordCount: row.wordCount,
    tags: { equals: row.tags },
    metadata:
      row.metadata === null
        ? { equals: Prisma.DbNull }
        : { equals: row.metadata as Prisma.InputJsonValue },
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

async function findCasPreflightMismatches(
  client: ReviewedReportAccessDateClient,
  plan: ReviewedReportAccessDateRepairPlan,
) {
  const reportChecks = await Promise.all(
    plan.updates.map(async (update) => ({
      id: `Report:${update.target.id}`,
      count: await client.report.count({
        where: fullSnapshotWhere(update.beforeSnapshot),
      }),
    })),
  );
  const guardedDocuments = [
    ...(plan.linkedDocumentUpdate
      ? [plan.linkedDocumentUpdate.beforeSnapshot]
      : []),
    ...plan.protectedLinkedDocuments.map((entry) => entry.snapshot),
  ];
  const documentChecks = await Promise.all(
    guardedDocuments.map(async (row) => ({
      id: `Document:${row.reportId}`,
      count: await client.document.count({
        where: fullDocumentSnapshotWhere(row),
      }),
    })),
  );
  return [...reportChecks, ...documentChecks].filter(
    (check) => check.count !== 1,
  );
}

function exactIds(rows: Array<{ id: string }>, expected: readonly string[]) {
  return (
    JSON.stringify(rows.map((row) => row.id).sort()) ===
    JSON.stringify([...expected].sort())
  );
}

async function lockReviewedRows(transaction: Prisma.TransactionClient) {
  const ids = REVIEWED_REPORT_ACCESS_DATE_TARGETS.map((target) => target.id);
  const locked = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM "Report"
    WHERE "id" IN (${Prisma.join(ids)})
    ORDER BY "id" FOR UPDATE
  `);
  if (!exactIds(locked, ids)) {
    throw new Error(
      "Reviewed Report rows changed after planning; no rows updated",
    );
  }

  const linkedReportIds = [
    reviewedManifest.linkedDocumentDisposition.update.reportId,
    ...reviewedManifest.linkedDocumentDisposition.preserve.map(
      (disposition) => disposition.reportId,
    ),
  ];
  const linkedReports = await transaction.report.findMany({
    where: { id: { in: linkedReportIds } },
    select: { id: true, documentId: true },
    orderBy: { id: "asc" },
  });
  if (
    !exactIds(linkedReports, linkedReportIds) ||
    linkedReports.some((row) => row.documentId === null)
  ) {
    throw new Error(
      "Reviewed linked Document relations changed after planning; no rows updated",
    );
  }
  const documentIds = linkedReports.map((row) => row.documentId!);
  const lockedDocuments = await transaction.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`
      SELECT "id" FROM "Document"
      WHERE "id" IN (${Prisma.join(documentIds)})
      ORDER BY "id" FOR UPDATE
    `,
  );
  if (!exactIds(lockedDocuments, documentIds)) {
    throw new Error(
      "Reviewed linked Documents changed after planning; no rows updated",
    );
  }
}

async function applyUpdate(
  transaction: Prisma.TransactionClient,
  update: ReviewedReportAccessDateUpdate,
) {
  const result = await transaction.report.updateMany({
    where: fullSnapshotWhere(update.beforeSnapshot),
    data: {
      sourceUrl: update.target.urlAfter,
      accessedAt: databaseDate(update.target.accessDate),
    },
  });
  if (result.count !== 1) {
    throw new Error(
      `Concurrent reviewed Report access-date CAS conflict: ${update.target.id}; no rows updated`,
    );
  }
}

async function applyLinkedDocumentUpdate(
  transaction: Prisma.TransactionClient,
  update: LinkedReportDocumentUpdate,
) {
  const result = await transaction.document.updateMany({
    where: fullDocumentSnapshotWhere(update.beforeSnapshot),
    data: {
      url: update.urlAfter,
      accessedAt: databaseDate(update.accessDate),
    },
  });
  if (result.count !== 1) {
    throw new Error(
      `Concurrent linked Document CAS conflict: ${update.reportId}; no rows updated`,
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

  validateReviewedReportAccessDateSeedTargets();
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  try {
    const plan = await inspectReviewedReportAccessDates(prisma);
    const digest = reviewedReportAccessDateRepairPlanSha256(plan);
    printPlan(plan, digest);
    if (plan.conflicts.length > 0) {
      throw new Error(
        "Reviewed Report access-date conflicts detected; refusing mutation",
      );
    }
    const preflightMismatches = await findCasPreflightMismatches(prisma, plan);
    if (preflightMismatches.length > 0) {
      throw new Error(
        `Reviewed Report full-row CAS preflight mismatch: ${preflightMismatches
          .map((row) => row.id)
          .join(", ")}`,
      );
    }
    console.log(
      `Full-row CAS preflight: ${plan.updates.length} pending Reports plus ` +
        `${plan.linkedDocumentUpdate ? 1 : 0} pending and ` +
        `${plan.protectedLinkedDocuments.length} protected Documents matched`,
    );

    if (!args.apply) {
      console.log(
        `Dry run only. After review, re-run with --apply --ack=${APPLY_ACK} --plan-sha256=${digest}`,
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
        const lockedPlan = await inspectReviewedReportAccessDates(transaction);
        if (
          lockedPlan.conflicts.length > 0 ||
          reviewedReportAccessDateRepairPlanSha256(lockedPlan) !==
            args.expectedPlanSha256
        ) {
          throw new Error(
            "Concurrent reviewed Report snapshot drift detected; no rows updated",
          );
        }
        for (const update of lockedPlan.updates) {
          await applyUpdate(transaction, update);
        }
        if (lockedPlan.linkedDocumentUpdate) {
          await applyLinkedDocumentUpdate(
            transaction,
            lockedPlan.linkedDocumentUpdate,
          );
        }
        const afterPlan = await inspectReviewedReportAccessDates(transaction);
        if (
          afterPlan.conflicts.length > 0 ||
          afterPlan.updates.length > 0 ||
          afterPlan.linkedDocumentUpdate !== null ||
          !afterPlan.linkedDocumentAlreadyApplied ||
          afterPlan.protectedLinkedDocuments.length !== 2 ||
          afterPlan.alreadyAppliedIds.length !==
            REVIEWED_REPORT_ACCESS_DATE_TARGETS.length
        ) {
          throw new Error(
            "Post-apply reviewed Report state did not match target; no rows updated",
          );
        }
        return lockedPlan.updates.length;
      },
      // prettier-ignore
      { isolationLevel: 'Serializable' },
    );
    console.log(
      `Reviewed Report access-date repair applied: ${applied} row(s)`,
    );
  } catch (error) {
    if (args.apply && isConcurrentWriteConflict(error)) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(
        "Reviewed Report access-date repair conflicted with a concurrent write; " +
          `the Serializable transaction rolled back and zero rows were committed. Cause: ${detail}. Rerun dry-run.`,
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
        : "Reviewed Report access-date repair failed",
    );
    process.exitCode = 1;
  });
}
