import { createHash } from "node:crypto";
import {
  REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS,
  canonicalizeReviewedThesisBibliographicJson,
} from "./reviewed-thesis-bibliographic-repair";

export const REVIEWED_SANDANGER_CONTENT_HASH_VERSION =
  "2026-07-20-v1" as const;
export const REVIEWED_SANDANGER_THESIS_ID = "sandanger-2012" as const;
export const REVIEWED_SANDANGER_DOCUMENT_ID =
  "cmp8xyjjg005ivvvmu3hu9n2h" as const;
export const REVIEWED_SANDANGER_LIBRARY_ANALYSIS_RECORD_ID =
  "cmqjoevzb005hzpvm456wtzc1" as const;

export type ReviewedSandangerContentHashEntry = Readonly<{
  thesisId: typeof REVIEWED_SANDANGER_THESIS_ID;
  documentId: typeof REVIEWED_SANDANGER_DOCUMENT_ID;
  libraryAnalysisRecordId: typeof REVIEWED_SANDANGER_LIBRARY_ANALYSIS_RECORD_ID;
  repositoryPath: string;
  documentFilePath: string;
  reviewedThesisTitle: string;
  documentTitle: string;
  oldLocator: string;
  reviewedLocator: string;
  oldUrlLine: string;
  reviewedUrlLine: string;
  beforeFileBytes: string;
  afterFileBytes: string;
  beforeFileByteLength: number;
  afterFileByteLength: number;
  beforeFileSha256: string;
  afterFileSha256: string;
  documentSummary: string;
  beforeLibraryContentHash: string;
  afterLibraryContentHash: string;
  openEntityReview: Readonly<{
    title: string;
    status: "review_required";
    usageRule: "internal_background";
    reviewStatus: "queued";
    citationReadiness: null;
    analysisTier: "triage_card";
    riskFlags: readonly ["low_text_quality"];
    keyFindings: readonly ["Triage flag: low_text_quality"];
    claimCandidates: readonly [];
  }>;
}>;

function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function lines(value: readonly string[]) {
  return `${value.join("\n")}\n`;
}

function exactUrlLineReplacement(
  before: string,
  oldUrlLine: string,
  reviewedUrlLine: string,
) {
  if (before.split(oldUrlLine).length - 1 !== 1) {
    throw new Error("Reviewed Sandanger old URL line is not unique");
  }
  if (before.includes(reviewedUrlLine)) {
    throw new Error("Reviewed Sandanger URL line already exists before replacement");
  }
  const after = before.replace(oldUrlLine, reviewedUrlLine);
  if (after.split(reviewedUrlLine).length - 1 !== 1) {
    throw new Error("Reviewed Sandanger URL-line replacement is not exact");
  }
  return after;
}

const OLD_LOCATOR =
  "https://openaccess.nhh.no/nhh-xmlui/handle/11250/166778";
const REVIEWED_LOCATOR = "https://hdl.handle.net/11250/169513";
const OLD_URL_LINE = `**URL:** ${OLD_LOCATOR}`;
const REVIEWED_URL_LINE = `**URL:** ${REVIEWED_LOCATOR}`;

const BEFORE_FILE_BYTES = lines([
  "# Sammendrag: Sandanger (NHH, 2012) — EMV og horisontal konkurranse",
  "",
  "**Full tittel:** Horisontal konkurranse i dagligvaremarkedet: Bruken av egne merkevarer i konkurransen mellom norske dagligvarekjeder",
  "**Type:** Masteroppgave",
  "**Dato:** 13. mars 2026 (Analysert)",
  OLD_URL_LINE,
  "",
  "---",
  "",
  "## Hovedfunn",
  "1. **EMV som differensiering:** Kjedenes incentiv til å lansere egne merkevarer (EMV) er primært å differensiere butikkonseptene sine — ikke å konkurrere direkte mot nasjonale merkevarer.",
  "2. **Konseptbygging:** EMV brukes strategisk til å bygge unike butikkprofiler (f.eks. Firstprice hos Kiwi, Eldorado hos ASKO/NorgesGruppen).",
  "3. **Horisontal effekt:** EMV-vekst reduserer sammenlignbarheten mellom kjedene, noe som kan dempe priskonkurransen.",
  "",
  "## Metode",
  "Analyse av EMV-strategier og deres effekt på horisontal konkurranse mellom norske dagligvarekjeder.",
  "",
  "## Relevans for Food Systems 2026",
  "Tidlig analyse av EMV-dynamikken som nå utgjør 20–30 % av dagligvareomsetningen. Viser at EMV ikke bare er et marginverktøy, men et strategisk differensieringsverktøy som påvirker konkurransestrukturen.",
]);

const AFTER_FILE_BYTES = exactUrlLineReplacement(
  BEFORE_FILE_BYTES,
  OLD_URL_LINE,
  REVIEWED_URL_LINE,
);

const DOCUMENT_SUMMARY =
  "1. **EMV som differensiering:** Kjedenes incentiv til å lansere egne merkevarer (EMV) er primært å differensiere butikkonseptene sine — ikke å konkurrere direkte mot nasjonale merkevarer. 2.";
const REVIEWED_TITLE =
  "Horisontal konkurranse i dagligvaremarkedet: Bruken av egne merkevarer i konkurransen mellom norske dagligvarekjeder";
const DOCUMENT_TITLE =
  "Sammendrag: Sandanger (NHH, 2012) — EMV og horisontal konkurranse";

export const REVIEWED_SANDANGER_CONTENT_HASH_MANIFEST = Object.freeze({
  thesisId: REVIEWED_SANDANGER_THESIS_ID,
  documentId: REVIEWED_SANDANGER_DOCUMENT_ID,
  libraryAnalysisRecordId: REVIEWED_SANDANGER_LIBRARY_ANALYSIS_RECORD_ID,
  repositoryPath:
    "research/bibliotek/akademia/masteroppgaver/sandanger-2012.md",
  documentFilePath: "bibliotek/akademia/masteroppgaver/sandanger-2012.md",
  reviewedThesisTitle: REVIEWED_TITLE,
  documentTitle: DOCUMENT_TITLE,
  oldLocator: OLD_LOCATOR,
  reviewedLocator: REVIEWED_LOCATOR,
  oldUrlLine: OLD_URL_LINE,
  reviewedUrlLine: REVIEWED_URL_LINE,
  beforeFileBytes: BEFORE_FILE_BYTES,
  afterFileBytes: AFTER_FILE_BYTES,
  beforeFileByteLength: 1159,
  afterFileByteLength: 1139,
  beforeFileSha256:
    "9ba03e12bce5bcdbeddd635a67e4f404960b26913212700cc8b7a09d8ccf297b",
  afterFileSha256:
    "3fe17396a9a65bf93f74bb81ac9c247b200bee011810f608103f42426b55908e",
  documentSummary: DOCUMENT_SUMMARY,
  beforeLibraryContentHash:
    "a5b991d9f9fa80985469a3011f6a82e771edb28b68222e87d01cf7b5848e2a20",
  afterLibraryContentHash:
    "9d9deb46134812babfa5b7fdd18d38af50fdc4adda44f7752697589ffae0838d",
  openEntityReview: Object.freeze({
    title: DOCUMENT_TITLE,
    status: "review_required",
    usageRule: "internal_background",
    reviewStatus: "queued",
    citationReadiness: null,
    analysisTier: "triage_card",
    riskFlags: Object.freeze(["low_text_quality"]),
    keyFindings: Object.freeze(["Triage flag: low_text_quality"]),
    claimCandidates: Object.freeze([]),
  }),
}) as ReviewedSandangerContentHashEntry;

export function reviewedSandangerContentHashManifestContract() {
  const entry = REVIEWED_SANDANGER_CONTENT_HASH_MANIFEST;
  return {
    ...entry,
    beforeFileBytesSha256: sha256(entry.beforeFileBytes),
    afterFileBytesSha256: sha256(entry.afterFileBytes),
    beforeLarFormulaSha256: sha256(
      `${entry.documentSummary}\n\n${entry.beforeFileBytes}`,
    ),
    afterLarFormulaSha256: sha256(
      `${entry.documentSummary}\n\n${entry.afterFileBytes}`,
    ),
  };
}

export const REVIEWED_SANDANGER_CONTENT_HASH_MANIFEST_SHA256 = sha256(
  JSON.stringify(
    canonicalizeReviewedThesisBibliographicJson(
      reviewedSandangerContentHashManifestContract(),
    ),
  ),
);

export const PINNED_REVIEWED_SANDANGER_CONTENT_HASH_MANIFEST_SHA256 =
  "3affb4f4da68a30770235049c198b4e241fad2c14ebfd6b1e0eb55ce7e0bc9aa" as const;

export function validateReviewedSandangerContentHashManifest() {
  const entry = REVIEWED_SANDANGER_CONTENT_HASH_MANIFEST;
  const repair = REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.find(
    (candidate) => candidate.id === REVIEWED_SANDANGER_THESIS_ID,
  );
  if (
    !repair ||
    repair.after.url !== entry.reviewedLocator ||
    repair.after.title !== entry.reviewedThesisTitle
  ) {
    throw new Error("Reviewed Sandanger Thesis identity or locator drift");
  }
  if (
    entry.thesisId !== REVIEWED_SANDANGER_THESIS_ID ||
    entry.documentId !== REVIEWED_SANDANGER_DOCUMENT_ID ||
    entry.libraryAnalysisRecordId !==
      REVIEWED_SANDANGER_LIBRARY_ANALYSIS_RECORD_ID
  ) {
    throw new Error("Reviewed Sandanger target identity drift");
  }
  if (
    Buffer.byteLength(entry.beforeFileBytes) !== entry.beforeFileByteLength ||
    Buffer.byteLength(entry.afterFileBytes) !== entry.afterFileByteLength ||
    sha256(entry.beforeFileBytes) !== entry.beforeFileSha256 ||
    sha256(entry.afterFileBytes) !== entry.afterFileSha256
  ) {
    throw new Error("Reviewed Sandanger exact file-byte contract drift");
  }
  if (
    entry.oldUrlLine !== `**URL:** ${entry.oldLocator}` ||
    entry.reviewedUrlLine !== `**URL:** ${entry.reviewedLocator}` ||
    exactUrlLineReplacement(
      entry.beforeFileBytes,
      entry.oldUrlLine,
      entry.reviewedUrlLine,
    ) !== entry.afterFileBytes
  ) {
    throw new Error("Reviewed Sandanger one-line URL replacement drift");
  }
  if (
    sha256(`${entry.documentSummary}\n\n${entry.beforeFileBytes}`) !==
      entry.beforeLibraryContentHash ||
    sha256(`${entry.documentSummary}\n\n${entry.afterFileBytes}`) !==
      entry.afterLibraryContentHash
  ) {
    throw new Error("Reviewed Sandanger LAR composite hash formula drift");
  }
  if (
    entry.openEntityReview.title !== entry.documentTitle ||
    entry.openEntityReview.status !== "review_required" ||
    entry.openEntityReview.usageRule !== "internal_background" ||
    entry.openEntityReview.reviewStatus !== "queued" ||
    entry.openEntityReview.citationReadiness !== null ||
    entry.openEntityReview.analysisTier !== "triage_card" ||
    JSON.stringify(entry.openEntityReview.riskFlags) !==
      JSON.stringify(["low_text_quality"]) ||
    JSON.stringify(entry.openEntityReview.keyFindings) !==
      JSON.stringify(["Triage flag: low_text_quality"]) ||
    JSON.stringify(entry.openEntityReview.claimCandidates) !==
      JSON.stringify([])
  ) {
    throw new Error("Reviewed Sandanger open entity-review policy drift");
  }
  return entry;
}

validateReviewedSandangerContentHashManifest();

export function assertReviewedSandangerContentHashManifestPinned() {
  if (
    REVIEWED_SANDANGER_CONTENT_HASH_MANIFEST_SHA256 !==
    PINNED_REVIEWED_SANDANGER_CONTENT_HASH_MANIFEST_SHA256
  ) {
    throw new Error(
      "Reviewed Sandanger content/hash manifest SHA-256 drifted from pinned contract",
    );
  }
}

assertReviewedSandangerContentHashManifestPinned();
