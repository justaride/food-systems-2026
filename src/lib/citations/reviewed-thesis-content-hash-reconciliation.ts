import { createHash } from "node:crypto";
import {
  REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS,
  canonicalizeReviewedThesisBibliographicJson,
  type ThesisBibliographicPortableSnapshot,
} from "./reviewed-thesis-bibliographic-repair";

export const REVIEWED_THESIS_CONTENT_HASH_VERSION = "2026-07-20-v1" as const;
export const REVIEWED_THESIS_CONTENT_HASH_IDS = [
  "slu-house-crickets-2025",
  "nmbu-circular-vegetables-2022",
  "van-straten-2025",
  "bueso-bordils-2021",
  "handlykken-2023",
] as const;

export type ReviewedThesisContentHashId =
  (typeof REVIEWED_THESIS_CONTENT_HASH_IDS)[number];

export type ReviewedThesisContentReplacement = Readonly<{
  before: string;
  after: string;
}>;

export type ReviewedThesisContentFileEntry = Readonly<{
  artifactId: string;
  thesisId: ReviewedThesisContentHashId;
  repositoryPath: string;
  beforeBytes: string;
  afterBytes: string;
  beforeByteLength: number;
  afterByteLength: number;
  beforeSha256: string;
  afterSha256: string;
}>;

export type ReviewedThesisDocumentStableIdentity = Readonly<{
  slug: string;
  filePath: string;
  title: string;
  author: string | null;
  year: number | null;
  documentType: string | null;
  category: string | null;
  subcategory: string | null;
  country: string | null;
  summary: string | null;
  url: string | null;
  accessedAt: string | null;
  archivedUrl: string | null;
  tags: readonly string[];
  metadata: Readonly<Record<string, unknown>>;
}>;

export type ReviewedThesisContentHashEntry = Readonly<{
  thesisId: ReviewedThesisContentHashId;
  documentId: string;
  libraryAnalysisRecordId: string;
  documentIdentity: ReviewedThesisDocumentStableIdentity;
  replacements: readonly ReviewedThesisContentReplacement[];
  beforeDocumentContent: string;
  afterDocumentContent: string;
  beforeDocumentContentSha256: string;
  afterDocumentContentSha256: string;
  beforeDocumentWordCount: number;
  afterDocumentWordCount: number;
  beforeLibraryContentHash: string;
  afterLibraryContentHash: string;
  semanticSnapshotSha256: string;
}>;

export const REVIEWED_THESIS_CONTENT_HASH_MISSING_PDF_PATHS = [
  "research/evidence-pack/akademia/slu-house-crickets-2025.pdf",
  "research/evidence-pack/akademia/nmbu-circular-vegetables-2022.pdf",
  "research/evidence-pack/akademia/van-straten-2025.pdf",
  "research/evidence-pack/akademia/bueso-bordils-2021.pdf",
  "research/evidence-pack/akademia/handlykken-2023.pdf",
] as const;

const ACCESSED_AT = "2026-07-20T00:00:00.000Z";

function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function wordCount(value: string) {
  const trimmed = value.trim();
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/u).length;
}

function lines(value: readonly string[]) {
  return `${value.join("\n")}\n`;
}

export function applyReviewedThesisContentReplacements(
  before: string,
  replacements: readonly ReviewedThesisContentReplacement[],
) {
  let value = before;
  for (const replacement of replacements) {
    const occurrences = value.split(replacement.before).length - 1;
    if (occurrences !== 1) {
      throw new Error(
        `Reviewed Thesis content replacement must occur exactly once; found ${occurrences}: ${replacement.before}`,
      );
    }
    value = value.replace(replacement.before, replacement.after);
  }
  return value;
}

function generatedThesisContent(snapshot: ThesisBibliographicPortableSnapshot) {
  if (!snapshot.publisher || !snapshot.method) {
    throw new Error(`Generated Thesis content requires publisher and method: ${snapshot.id}`);
  }
  const degree = snapshot.degree === "phd" ? "PhD" : "Masteroppgave";
  return [
    `# ${snapshot.title}`,
    "",
    "",
    `- **Forfatter(e):** ${snapshot.authors}`,
    `- **Institusjon:** ${snapshot.institution}`,
    `- **År:** ${snapshot.year}`,
    `- **Grad:** ${degree}`,
    `- **Utgiver:** ${snapshot.publisher}`,
    "",
    `- **URL:** ${snapshot.url}`,
    "",
    "## Sammendrag / Syntese",
    snapshot.synthesis,
    "",
    "## Hovedfunn (Key Findings)",
    ...snapshot.keyFindings.map((finding) => `- ${finding}`),
    "",
    "## Actionable Takeaways",
    ...snapshot.takeaways.map((takeaway) => `- ${takeaway}`),
    "",
    "## Metodikk (Methodology)",
    snapshot.method,
  ].join("\n");
}

function semanticSnapshot(snapshot: ThesisBibliographicPortableSnapshot) {
  return {
    id: snapshot.id,
    institution: snapshot.institution,
    year: snapshot.year,
    synthesis: snapshot.synthesis,
    keyFindings: snapshot.keyFindings,
    tags: snapshot.tags,
    takeaways: snapshot.takeaways,
    method: snapshot.method,
    awardWinning: snapshot.awardWinning,
    degree: snapshot.degree,
    provenanceType: snapshot.provenanceType,
  };
}

const repairsById = new Map(
  REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.map((repair) => [repair.id, repair]),
);

function repair(id: ReviewedThesisContentHashId) {
  const value = repairsById.get(id);
  if (!value) throw new Error(`Missing reviewed Thesis repair: ${id}`);
  return value;
}

const SLU_NOTE_BEFORE = lines([
  "# Source locator: slu-house-crickets-2025",
  "",
  "Title: Integrating house crickets in circular food systems",
  "Source URL: https://pub.epsilon.slu.se/id/document/20453027",
  "Local status: locator note",
  "Created: 2026-07-02",
  "",
  "This file is a local `Document.filePath` anchor for the DB row. It is not a full-text capture. Use the source URL as the canonical external locator until a full PDF or archive copy is added.",
]);
const SLU_NOTE_REPLACEMENTS = [
  {
    before: "Title: Integrating house crickets in circular food systems",
    after:
      "Title: House crickets in circular food systems: From crop residue diets to frass-based farming",
  },
] as const;
const SLU_NOTE_AFTER = applyReviewedThesisContentReplacements(
  SLU_NOTE_BEFORE,
  SLU_NOTE_REPLACEMENTS,
);

const NMBU_NOTE_BEFORE = lines([
  "# Source locator: nmbu-circular-vegetables-2022",
  "",
  "Title: Barriers and drivers to a circular economy for vegetables in the Norwegian food sector",
  "Source URL: https://agris.fao.org/search/en/providers/122576/records/6474afcaf2e6fe92b3632ace",
  "Local status: locator note",
  "Created: 2026-07-02",
  "",
  "This file is a local `Document.filePath` anchor for the DB row. It is not a full-text capture. Use the source URL as the canonical external locator until a full PDF or archive copy is added.",
]);
const NMBU_NOTE_REPLACEMENTS = [
  {
    before:
      "Source URL: https://agris.fao.org/search/en/providers/122576/records/6474afcaf2e6fe92b3632ace",
    after: "Source URL: https://hdl.handle.net/11250/3030715",
  },
] as const;
const NMBU_NOTE_AFTER = applyReviewedThesisContentReplacements(
  NMBU_NOTE_BEFORE,
  NMBU_NOTE_REPLACEMENTS,
);

const HANDLYKKEN_BEFORE = lines([
  "# Sammendrag: Handlykken (OsloMet, 2023) - Nudging i dagligvare og forbrukeratferd",
  "",
  "**Full tittel:** Hvordan brukes nudging som atferdsokonomisk virkemiddel i forhold til forbrukeratferd, og hvilke etiske implikasjoner kan dette medføre? (registeret bruker kortformen \"Nudging som virkemiddel for forbrukeratferd i dagligvare\")",
  "**Type:** Masteroppgave",
  "**Institusjon:** OsloMet",
  "**Dato:** 26. mars 2026 (Analysert)",
  "**URL:** https://hdl.handle.net/11250/3101983",
  "",
  "---",
  "",
  "## Hovedfunn",
  "1. **Systematisk litteraturstudie:** Oppgaven er bygget som en systematisk litteraturstudie og ser pa hvordan nudging brukes som atferdsokonomisk virkemiddel i forbrukersammenhenger, saerlig i dagligvaresektoren.",
  "2. **20 fagfellevurderte artikler inngar:** Funnene bygger pa 20 peer-reviewed artikler som dekker bide effekt og etikk.",
  "3. **Effekten er positiv, men varierende:** Nudging ser samlet sett ut til a ha en positiv, men variabel effekt, med sarlig tydelige utslag for baerekraftige og helsefremmende dagligvarer.",
  "4. **Etikken er omstridt, men ikke diskvalifiserende:** Oppgaven finner etiske argumenter mot nudging, men de anses ikke som tunge nok til a avvise metoden i forbrukersammenhenger.",
  "",
  "## Metode",
  "Systematisk litteraturstudie med tematisk inndeling av funn i effekt av nudging og etiske implikasjoner.",
  "",
  "## Relevans for Food Systems 2026",
  "Oppgaven er relevant for forbrukeradferd, valgarkitektur i dagligvare og hvordan myke virkemidler kan styre mot mer baerekraftige eller helsefremmende valg uten tradisjonell regulering.",
]);
const HANDLYKKEN_REPLACEMENTS = [
  {
    before:
      "**Full tittel:** Hvordan brukes nudging som atferdsokonomisk virkemiddel i forhold til forbrukeratferd, og hvilke etiske implikasjoner kan dette medføre? (registeret bruker kortformen \"Nudging som virkemiddel for forbrukeratferd i dagligvare\")",
    after:
      "**Full tittel:** Hvordan brukes nudging som atferdsøkonomisk virkemiddel i forhold til forbrukeratferd, og hvilke etiske implikasjoner kan dette medføre?",
  },
] as const;
const HANDLYKKEN_AFTER = applyReviewedThesisContentReplacements(
  HANDLYKKEN_BEFORE,
  HANDLYKKEN_REPLACEMENTS,
);

const fileEntries = [
  {
    artifactId: "slu-locator-note",
    thesisId: "slu-house-crickets-2025",
    repositoryPath:
      "research/evidence-pack/source-notes/slu-house-crickets-2025.md",
    beforeBytes: SLU_NOTE_BEFORE,
    afterBytes: SLU_NOTE_AFTER,
  },
  {
    artifactId: "nmbu-locator-note",
    thesisId: "nmbu-circular-vegetables-2022",
    repositoryPath:
      "research/evidence-pack/source-notes/nmbu-circular-vegetables-2022.md",
    beforeBytes: NMBU_NOTE_BEFORE,
    afterBytes: NMBU_NOTE_AFTER,
  },
  {
    artifactId: "handlykken-summary",
    thesisId: "handlykken-2023",
    repositoryPath:
      "research/bibliotek/akademia/masteroppgaver/handlykken-2023.md",
    beforeBytes: HANDLYKKEN_BEFORE,
    afterBytes: HANDLYKKEN_AFTER,
  },
] as const;

export const REVIEWED_THESIS_CONTENT_HASH_FILES = Object.freeze(
  fileEntries.map((entry) =>
    Object.freeze({
      ...entry,
      beforeByteLength: Buffer.byteLength(entry.beforeBytes),
      afterByteLength: Buffer.byteLength(entry.afterBytes),
      beforeSha256: sha256(entry.beforeBytes),
      afterSha256: sha256(entry.afterBytes),
    }),
  ),
) as readonly ReviewedThesisContentFileEntry[];

type GeneratedEntryInput = Readonly<{
  thesisId: Exclude<ReviewedThesisContentHashId, "handlykken-2023">;
  documentId: string;
  libraryAnalysisRecordId: string;
  filePath: string;
  country: string;
  tags: readonly string[];
}>;

function generatedEntry(input: GeneratedEntryInput): ReviewedThesisContentHashEntry {
  const reviewed = repair(input.thesisId);
  const beforeDocumentContent = generatedThesisContent(reviewed.before);
  const afterDocumentContent = generatedThesisContent(reviewed.after);
  const replacements: ReviewedThesisContentReplacement[] = [];
  for (const field of reviewed.mutatedFields) {
    if (field === "title") {
      replacements.push({
        before: `# ${reviewed.before.title}`,
        after: `# ${reviewed.after.title}`,
      });
    } else if (field === "authors") {
      replacements.push({
        before: `- **Forfatter(e):** ${reviewed.before.authors}`,
        after: `- **Forfatter(e):** ${reviewed.after.authors}`,
      });
    } else if (field === "publisher") {
      replacements.push({
        before: `- **Utgiver:** ${reviewed.before.publisher}`,
        after: `- **Utgiver:** ${reviewed.after.publisher}`,
      });
    } else if (field === "url") {
      replacements.push({
        before: `- **URL:** ${reviewed.before.url}`,
        after: `- **URL:** ${reviewed.after.url}`,
      });
    }
  }
  const applied = applyReviewedThesisContentReplacements(
    beforeDocumentContent,
    replacements,
  );
  if (applied !== afterDocumentContent) {
    throw new Error(
      `Generated Thesis content differs outside declared visible bibliography lines: ${input.thesisId}`,
    );
  }
  const institutionSlug = reviewed.after.institution
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return {
    thesisId: input.thesisId,
    documentId: input.documentId,
    libraryAnalysisRecordId: input.libraryAnalysisRecordId,
    documentIdentity: {
      slug: `thesis-${input.thesisId}`,
      filePath: input.filePath,
      title: reviewed.after.title,
      author: reviewed.after.authors,
      year: reviewed.after.year,
      documentType: "thesis",
      category: "bibliotek",
      subcategory: "theses",
      country: input.country,
      summary: reviewed.after.synthesis,
      url: reviewed.after.url,
      accessedAt: ACCESSED_AT,
      archivedUrl: null,
      tags: [...input.tags, "thesis", reviewed.after.degree, institutionSlug],
      metadata: {
        degree: reviewed.after.degree,
        thesisId: input.thesisId,
        institution: reviewed.after.institution,
        awardWinning: reviewed.after.awardWinning,
        generatedFrom: "prisma/seed-data/theses.ts",
      },
    },
    replacements,
    beforeDocumentContent,
    afterDocumentContent,
    beforeDocumentContentSha256: sha256(beforeDocumentContent),
    afterDocumentContentSha256: sha256(afterDocumentContent),
    beforeDocumentWordCount: wordCount(beforeDocumentContent),
    afterDocumentWordCount: wordCount(afterDocumentContent),
    beforeLibraryContentHash: sha256(
      `${reviewed.after.synthesis}\n\n${beforeDocumentContent}`,
    ),
    afterLibraryContentHash: sha256(
      `${reviewed.after.synthesis}\n\n${afterDocumentContent}`,
    ),
    semanticSnapshotSha256: sha256(
      JSON.stringify(
        canonicalizeReviewedThesisBibliographicJson(
          semanticSnapshot(reviewed.after),
        ),
      ),
    ),
  };
}

function handlykkenEntry(): ReviewedThesisContentHashEntry {
  const reviewed = repair("handlykken-2023");
  const summary =
    "1. **Systematisk litteraturstudie:** Oppgaven er bygget som en systematisk litteraturstudie og ser pa hvordan nudging brukes som atferdsokonomisk virkemiddel i forbrukersammenhenger, saerlig i dagligvaresektoren. 2.";
  return {
    thesisId: "handlykken-2023",
    documentId: "cmp8xyj9x004ovvvm9fxrvhzu",
    libraryAnalysisRecordId: "cmqjoevyf004nzpvmxeml6avr",
    documentIdentity: {
      slug: "bibliotek/akademia/masteroppgaver/handlykken-2023",
      filePath: "bibliotek/akademia/masteroppgaver/handlykken-2023.md",
      title:
        "Sammendrag: Handlykken (OsloMet, 2023) - Nudging i dagligvare og forbrukeratferd",
      author: null,
      year: null,
      documentType: "thesis",
      category: "bibliotek",
      subcategory: "akademia/masteroppgaver",
      country: null,
      summary,
      url: reviewed.after.url,
      accessedAt: ACCESSED_AT,
      archivedUrl: null,
      tags: ["bibliotek", "akademia/masteroppgaver", "thesis"],
      metadata: {
        localPath: "bibliotek/akademia/masteroppgaver/handlykken-2023.md",
        canonicalFileType: "md",
        availabilityStatus: "fulltext",
      },
    },
    replacements: HANDLYKKEN_REPLACEMENTS,
    beforeDocumentContent: HANDLYKKEN_BEFORE,
    afterDocumentContent: HANDLYKKEN_AFTER,
    beforeDocumentContentSha256: sha256(HANDLYKKEN_BEFORE),
    afterDocumentContentSha256: sha256(HANDLYKKEN_AFTER),
    beforeDocumentWordCount: wordCount(HANDLYKKEN_BEFORE),
    afterDocumentWordCount: wordCount(HANDLYKKEN_AFTER),
    beforeLibraryContentHash: sha256(`${summary}\n\n${HANDLYKKEN_BEFORE}`),
    afterLibraryContentHash: sha256(`${summary}\n\n${HANDLYKKEN_AFTER}`),
    semanticSnapshotSha256: sha256(
      JSON.stringify(
        canonicalizeReviewedThesisBibliographicJson(
          semanticSnapshot(reviewed.after),
        ),
      ),
    ),
  };
}

export const REVIEWED_THESIS_CONTENT_HASH_MANIFEST = Object.freeze([
  generatedEntry({
    thesisId: "slu-house-crickets-2025",
    documentId: "cmppajyrn0007njvmd1h15xme",
    libraryAnalysisRecordId: "cmqjoeww900t1zpvm5m6ivksu",
    filePath: "research/evidence-pack/source-notes/slu-house-crickets-2025.md",
    country: "NO",
    tags: ["sirkulaer", "protein", "okologi"],
  }),
  generatedEntry({
    thesisId: "nmbu-circular-vegetables-2022",
    documentId: "cmppajyr30003njvmka3xvjsc",
    libraryAnalysisRecordId: "cmqjoeww600sxzpvm1y02svnh",
    filePath:
      "research/evidence-pack/source-notes/nmbu-circular-vegetables-2022.md",
    country: "NO",
    tags: ["sirkulaer", "verdikjede", "regulering", "okologi"],
  }),
  generatedEntry({
    thesisId: "van-straten-2025",
    documentId: "cmppajyr60004njvmkuyujbnd",
    libraryAnalysisRecordId: "cmqjoeww700syzpvmzudpyrwh",
    filePath: "research/evidence-pack/akademia/van-straten-2025.pdf",
    country: "Nordic",
    tags: ["sirkulaer", "matsvinn", "digital", "nordisk"],
  }),
  generatedEntry({
    thesisId: "bueso-bordils-2021",
    documentId: "cmppajyrr0008njvm72f0l3n2",
    libraryAnalysisRecordId: "cmqjoewwa00t2zpvmkge4qbfh",
    filePath: "research/evidence-pack/akademia/bueso-bordils-2021.pdf",
    country: "DK",
    tags: ["sirkulaer", "matsvinn", "verdikjede", "offentlig-innkjop"],
  }),
  handlykkenEntry(),
]) as readonly ReviewedThesisContentHashEntry[];

export function reviewedThesisContentHashManifestContract() {
  return {
    version: REVIEWED_THESIS_CONTENT_HASH_VERSION,
    targetIds: REVIEWED_THESIS_CONTENT_HASH_IDS,
    missingPdfPaths: REVIEWED_THESIS_CONTENT_HASH_MISSING_PDF_PATHS,
    files: REVIEWED_THESIS_CONTENT_HASH_FILES,
    entries: REVIEWED_THESIS_CONTENT_HASH_MANIFEST,
    hashFormula: 'sha256(Document.summary + "\\n\\n" + Document.content)',
    proofBoundary: {
      sourceNotesAreLocatorMetadataOnly: true,
      missingPdfBytesRemainMissing: true,
      semanticFindingsMayChange: false,
      runnerWritesRepositoryFiles: false,
    },
  };
}

export const REVIEWED_THESIS_CONTENT_HASH_MANIFEST_SHA256 = sha256(
  JSON.stringify(
    canonicalizeReviewedThesisBibliographicJson(
      reviewedThesisContentHashManifestContract(),
    ),
  ),
);

export const PINNED_REVIEWED_THESIS_CONTENT_HASH_MANIFEST_SHA256 =
  "9e1412b4d90c142ff38761f0fdbeb80d242c886a10a4135b67c408c71060183f" as const;

export function validateReviewedThesisContentHashManifest() {
  const entries = REVIEWED_THESIS_CONTENT_HASH_MANIFEST;
  if (
    entries.length !== 5 ||
    JSON.stringify(entries.map((entry) => entry.thesisId)) !==
      JSON.stringify(REVIEWED_THESIS_CONTENT_HASH_IDS)
  ) {
    throw new Error("Reviewed Thesis content/hash target drift");
  }
  if (
    REVIEWED_THESIS_CONTENT_HASH_FILES.length !== 3 ||
    new Set(REVIEWED_THESIS_CONTENT_HASH_MISSING_PDF_PATHS).size !== 5
  ) {
    throw new Error("Reviewed Thesis content/hash file boundary drift");
  }
  for (const file of REVIEWED_THESIS_CONTENT_HASH_FILES) {
    if (
      sha256(file.beforeBytes) !== file.beforeSha256 ||
      sha256(file.afterBytes) !== file.afterSha256 ||
      Buffer.byteLength(file.beforeBytes) !== file.beforeByteLength ||
      Buffer.byteLength(file.afterBytes) !== file.afterByteLength
    ) {
      throw new Error(`Reviewed Thesis repository-byte drift: ${file.artifactId}`);
    }
  }
  for (const entry of entries) {
    const reviewed = repair(entry.thesisId);
    if (
      sha256(entry.beforeDocumentContent) !==
        entry.beforeDocumentContentSha256 ||
      sha256(entry.afterDocumentContent) !==
        entry.afterDocumentContentSha256 ||
      wordCount(entry.beforeDocumentContent) !== entry.beforeDocumentWordCount ||
      wordCount(entry.afterDocumentContent) !== entry.afterDocumentWordCount ||
      sha256(
        `${entry.documentIdentity.summary}\n\n${entry.beforeDocumentContent}`,
      ) !== entry.beforeLibraryContentHash ||
      sha256(
        `${entry.documentIdentity.summary}\n\n${entry.afterDocumentContent}`,
      ) !== entry.afterLibraryContentHash ||
      applyReviewedThesisContentReplacements(
        entry.beforeDocumentContent,
        entry.replacements,
      ) !== entry.afterDocumentContent ||
      sha256(
        JSON.stringify(
          canonicalizeReviewedThesisBibliographicJson(
            semanticSnapshot(reviewed.before),
          ),
        ),
      ) !== entry.semanticSnapshotSha256 ||
      sha256(
        JSON.stringify(
          canonicalizeReviewedThesisBibliographicJson(
            semanticSnapshot(reviewed.after),
          ),
        ),
      ) !== entry.semanticSnapshotSha256
    ) {
      throw new Error(
        `Reviewed Thesis content/hash or protected semantic contract drift: ${entry.thesisId}`,
      );
    }
  }
  return entries;
}

validateReviewedThesisContentHashManifest();

export function assertReviewedThesisContentHashManifestPinned() {
  if (
    REVIEWED_THESIS_CONTENT_HASH_MANIFEST_SHA256 !==
    PINNED_REVIEWED_THESIS_CONTENT_HASH_MANIFEST_SHA256
  ) {
    throw new Error(
      "Reviewed Thesis content/hash manifest SHA-256 drifted from pinned contract",
    );
  }
}

assertReviewedThesisContentHashManifestPinned();
