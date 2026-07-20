import { createHash } from "node:crypto";
import {
  REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS,
  canonicalizeReviewedSourceDocIdentityJson,
} from "./reviewed-source-doc-identity-repair";

export const REVIEWED_SOURCE_DOC_CONTENT_HASH_VERSION =
  "2026-07-20-v1" as const;
export const REVIEWED_SOURCE_DOC_CONTENT_HASH_IDS = [
  "src-16",
  "src-24",
] as const;

export type ReviewedSourceDocContentHashId =
  (typeof REVIEWED_SOURCE_DOC_CONTENT_HASH_IDS)[number];

export type ReviewedSourceDocContentHashEntry = Readonly<{
  sourceDocId: ReviewedSourceDocContentHashId;
  documentId: string;
  libraryAnalysisRecordId: string;
  repositoryPath: string;
  documentFilePath: string;
  reviewedLocator: string;
  insertionAnchor: string;
  insertedLine: string;
  beforeFileBytes: string;
  afterFileBytes: string;
  beforeFileByteLength: number;
  afterFileByteLength: number;
  beforeFileSha256: string;
  afterFileSha256: string;
  documentSummary: string;
  beforeLibraryContentHash: string;
  afterLibraryContentHash: string;
}>;

function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function exactInsertAfterLine(
  before: string,
  anchor: string,
  insertedLine: string,
) {
  const needle = `${anchor}\n`;
  if (before.split(needle).length - 1 !== 1) {
    throw new Error(`Reviewed content/hash insertion anchor is not unique: ${anchor}`);
  }
  if (before.includes(`${insertedLine}\n`)) {
    throw new Error(`Reviewed content/hash line already exists before insertion: ${insertedLine}`);
  }
  return before.replace(needle, `${needle}${insertedLine}\n`);
}

function lines(value: readonly string[]) {
  return `${value.join("\n")}\n`;
}

const SRC_16_BEFORE_BYTES = lines([
  "# Sammendrag: Riksrevisjonens undersøkelse av matsikkerhet og beredskap (2023)",
  "",
  "**Full tittel:** Riksrevisjonens undersøkelse av matsikkerhet og beredskap på jordbruksområdet (Dokument 3:4 2023–2024)",
  "**Dato:** 11. mars 2026 (Analysert)",
  "**Kilde:** Riksrevisjonen (Okt 2023)",
  "",
  "---",
  "",
  "## Overordnet dom",
  "Riksrevisjonen gir myndighetene sterk kritikk og vurderer situasjonen som **kritikkverdig** (jordvern) og **ikke tilfredsstillende** (beredskapsforberedelser).",
  "",
  "## Hovedfunn",
  "1. **Sårbar beredskap:** Norge mangler planer for hvordan vi skal brødfø befolkningen hvis internasjonale forsyningskjeder svikter over tid. Vi baserer oss i for stor grad på at importen alltid vil fungere.",
  "2. **Importavhengighet:** Rapporten fastslår at rundt 60 % av maten vi spiser er basert på import (direkte eller via fôrråvarer). Dette er høyere enn de offisielle tallene ofte viser, da man her inkluderer innsatsfaktorer.",
  "3. **Produksjonsgrunnlag under press:**",
  "   - Den beste matjorda bygges ned til fordel for vei og bolig.",
  "   - Store arealer går ut av drift på grunn av dårlig lønnsomhet i distriktene.",
  "   - Vedlikeholdsetterslep på drenering gjør jorda sårbar for ekstremvær.",
  "4. **Manglende koordinering:** Det er for lite samarbeid mellom Landbruksdepartementet og Næringsdepartementet om matberedskap.",
  "",
  "## Anbefalinger",
  "- Utarbeide planer for krisekosthold (omlegging fra kjøtt til korn/grønt i krise).",
  "- Styrke jordvernet radikalt.",
  "- Sikre beredskapslagring av korn (nå iverksatt i 2024/2025 som følge av denne rapporten).",
  "",
  "## Relevans for Food Systems 2026",
  "Dette er den autoritative kilden på systemets svakheter. Den underbygger tesen om at vi trenger en systemisk omstilling for å sikre forsyningssikkerhet i en usikker verden.",
]);

const SRC_24_BEFORE_BYTES = lines([
  "# Sammendrag: Finland KKV — Konkurranseloven § 4a (Dominans)",
  "",
  "**Full tittel:** Kilpailulaki (Competition Act) 948/2011, Section 4a",
  "**Dato:** 11. mars 2026 (Analysert)",
  "",
  "---",
  "",
  "## Bakgrunn",
  "Finland innførte i 2014 en unik bestemmelse i sin konkurranselov (§ 4a) rettet spesifikt mot dagligvaremarkedet. Bakgrunnen var en ekstremt høy markedskonsentrasjon, dominert av S-gruppen og K-gruppen (Kesko).",
  "",
  "## Hovedinnhold i § 4a",
  "- **30 %-grensen:** En aktør som har en markedsandel på over 30 % i det finske dagligvaremarkedet (både i butikk- og innkjøpsleddet), anses automatisk for å ha en dominerende stilling.",
  "- **Lavere terskel:** Dette er en betydelig lavere terskel enn i generell konkurranserett (som ofte krever 40-50 %).",
  "- **Konsekvens:** De to største aktørene er dermed underlagt strengere regler mot misbruk av markedsmakt enn andre selskaper.",
  "",
  "## Erfaringer og effekt (Status 2024/2025)",
  "1. **Preventiv effekt:** Selv om KKV (konkurransemyndigheten) ikke har utstedt store bøter med hjemmel i denne paragrafen, rapporteres det at de store kjedene har blitt mer forsiktige i sin forhandlingspraksis og prissetting.",
  "2. **Matmarkedsombudet:** Mye av oppfølgingen har i praksis flyttet seg til det finske Matmarkedsombudet, som håndterer \"unfair trading practices\" (UTP) med en lavere bevisbyrde enn i en ren misbrukssak.",
  "3. **Struktur:** Til tross for loven, er det finske markedet fortsatt et av de mest konsentrerte i Europa.",
  "",
  "## Relevans for Food Systems 2026",
  "Dette er det viktigste eksempelet på radikal lovgivning i Norden. Det viser at man kan definere markedsmakt politisk og juridisk, noe som er et aktuelt diskusjonstema også i Norge (f.eks. forslag om å tøyle NorgesGruppens innkjøpsmakt).",
]);

const SRC_16_ANCHOR = "**Kilde:** Riksrevisjonen (Okt 2023)";
const SRC_16_URL_LINE =
  "**URL:** https://www.riksrevisjonen.no/rapporter-mappe/no-2023-2024/matsikkerhet-og-beredskap-pa-landbruksomradet/";
const SRC_24_ANCHOR = "**Dato:** 11. mars 2026 (Analysert)";
const SRC_24_URL_LINE =
  "**URL:** https://www.finlex.fi/en/legislation/2011/948";

const SRC_16_AFTER_BYTES = exactInsertAfterLine(
  SRC_16_BEFORE_BYTES,
  SRC_16_ANCHOR,
  SRC_16_URL_LINE,
);
const SRC_24_AFTER_BYTES = exactInsertAfterLine(
  SRC_24_BEFORE_BYTES,
  SRC_24_ANCHOR,
  SRC_24_URL_LINE,
);

const SRC_16_SUMMARY =
  "Riksrevisjonen gir myndighetene sterk kritikk og vurderer situasjonen som **kritikkverdig** (jordvern) og **ikke tilfredsstillende** (beredskapsforberedelser). 1. **Sårbar beredskap:** Norge mangler planer for hvordan vi skal brødfø befolkningen hvis internasjonale forsyningskjeder svikter over tid.";
const SRC_24_SUMMARY =
  "Finland innførte i 2014 en unik bestemmelse i sin konkurranselov (§ 4a) rettet spesifikt mot dagligvaremarkedet. Bakgrunnen var en ekstremt høy markedskonsentrasjon, dominert av S-gruppen og K-gruppen (Kesko). - **30 %-grensen:** En aktør som har en markedsandel på over 30 % i det finske dagligvaremarkedet (både i butikk- og innkjøpsleddet), anses automatisk for å ha en dominerende stilling.";

const RAW_MANIFEST = [
  {
    sourceDocId: "src-16",
    documentId: "cmp8xymgm00ezvvvmzkdpagn3",
    libraryAnalysisRecordId: "cmqjoewfa00eszpvmg3tc21vs",
    repositoryPath: "research/bibliotek/riksrevisjonen/beredskap-2023.md",
    documentFilePath: "bibliotek/riksrevisjonen/beredskap-2023.md",
    reviewedLocator:
      "https://www.riksrevisjonen.no/rapporter-mappe/no-2023-2024/matsikkerhet-og-beredskap-pa-landbruksomradet/",
    insertionAnchor: SRC_16_ANCHOR,
    insertedLine: SRC_16_URL_LINE,
    beforeFileBytes: SRC_16_BEFORE_BYTES,
    afterFileBytes: SRC_16_AFTER_BYTES,
    beforeFileByteLength: Buffer.byteLength(SRC_16_BEFORE_BYTES),
    afterFileByteLength: Buffer.byteLength(SRC_16_AFTER_BYTES),
    beforeFileSha256:
      "74554e79852571a3cb986311d4b6b559330e393b798a5d33499052eeb1e1e032",
    afterFileSha256:
      "b7718cee84a2a10e01c55b1f0d67d99a1a3c14deba6bca9ecc21015ef0f393d0",
    documentSummary: SRC_16_SUMMARY,
    beforeLibraryContentHash:
      "a43cd1e8bb0f13ed10ca941d57f79faf737bc314f5747d40ad9e62a568ed230b",
    afterLibraryContentHash:
      "a3aef18bbe9a9d6859968c762f7feb3ddccb4b8edf320e85016819740e20ea4a",
  },
  {
    sourceDocId: "src-24",
    documentId: "cmp8xymbg00eivvvmgqp70y4r",
    libraryAnalysisRecordId: "cmqjoewes00ebzpvm7jh8ju63",
    repositoryPath:
      "research/bibliotek/nordisk-konkurranse/fi/kkv-4a-dominans.md",
    documentFilePath: "bibliotek/nordisk-konkurranse/fi/kkv-4a-dominans.md",
    reviewedLocator: "https://www.finlex.fi/en/legislation/2011/948",
    insertionAnchor: SRC_24_ANCHOR,
    insertedLine: SRC_24_URL_LINE,
    beforeFileBytes: SRC_24_BEFORE_BYTES,
    afterFileBytes: SRC_24_AFTER_BYTES,
    beforeFileByteLength: Buffer.byteLength(SRC_24_BEFORE_BYTES),
    afterFileByteLength: Buffer.byteLength(SRC_24_AFTER_BYTES),
    beforeFileSha256:
      "578fc6aacf5d05fb1cf54e269a91a43537ae562d1f4f3a4c36a64578091592b3",
    afterFileSha256:
      "f0e032c1c16644ac2c0f5aaa92eae6bfd0c94e075b4c51ace7400275e330bea6",
    documentSummary: SRC_24_SUMMARY,
    beforeLibraryContentHash:
      "75afa22cffb9dde1a9078ce942ecd282824debc4ac36195a8b8830cf60795674",
    afterLibraryContentHash:
      "c1390ec3df2d2a2e78ef1044cd96092bf3394e472328eaf1cdff1a9b1c6da3ef",
  },
] as const satisfies readonly ReviewedSourceDocContentHashEntry[];

export const REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST = Object.freeze(
  RAW_MANIFEST.map((entry) => Object.freeze({ ...entry })),
) as readonly ReviewedSourceDocContentHashEntry[];

export function reviewedSourceDocContentHashManifestContract() {
  return REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST.map((entry) => ({
    ...entry,
    beforeFileBytesSha256: sha256(entry.beforeFileBytes),
    afterFileBytesSha256: sha256(entry.afterFileBytes),
    beforeLarFormulaSha256: sha256(
      `${entry.documentSummary}\n\n${entry.beforeFileBytes}`,
    ),
    afterLarFormulaSha256: sha256(
      `${entry.documentSummary}\n\n${entry.afterFileBytes}`,
    ),
  }));
}

export const REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST_SHA256 = sha256(
  JSON.stringify(
    canonicalizeReviewedSourceDocIdentityJson(
      reviewedSourceDocContentHashManifestContract(),
    ),
  ),
);

export const PINNED_REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST_SHA256 =
  "55b15b302dd924a88ba414094a48e0e50c49f4099f0575841ad65f5f9de758ce" as const;

export function validateReviewedSourceDocContentHashManifest() {
  const entries = REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST;
  if (
    entries.length !== 2 ||
    JSON.stringify(entries.map((entry) => entry.sourceDocId)) !==
      JSON.stringify(REVIEWED_SOURCE_DOC_CONTENT_HASH_IDS)
  ) {
    throw new Error("Reviewed SourceDoc content/hash manifest target drift");
  }
  for (const entry of entries) {
    const identity = REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS.find(
      (repair) => repair.id === entry.sourceDocId,
    );
    if (!identity || identity.after.url !== entry.reviewedLocator) {
      throw new Error(
        `Reviewed SourceDoc content/hash locator drift: ${entry.sourceDocId}`,
      );
    }
    if (
      sha256(entry.beforeFileBytes) !== entry.beforeFileSha256 ||
      sha256(entry.afterFileBytes) !== entry.afterFileSha256 ||
      Buffer.byteLength(entry.beforeFileBytes) !== entry.beforeFileByteLength ||
      Buffer.byteLength(entry.afterFileBytes) !== entry.afterFileByteLength
    ) {
      throw new Error(
        `Reviewed SourceDoc content/hash file-byte contract drift: ${entry.sourceDocId}`,
      );
    }
    if (
      exactInsertAfterLine(
        entry.beforeFileBytes,
        entry.insertionAnchor,
        entry.insertedLine,
      ) !== entry.afterFileBytes ||
      entry.insertedLine !== `**URL:** ${entry.reviewedLocator}`
    ) {
      throw new Error(
        `Reviewed SourceDoc content/hash insertion drift: ${entry.sourceDocId}`,
      );
    }
    if (
      sha256(`${entry.documentSummary}\n\n${entry.beforeFileBytes}`) !==
        entry.beforeLibraryContentHash ||
      sha256(`${entry.documentSummary}\n\n${entry.afterFileBytes}`) !==
        entry.afterLibraryContentHash
    ) {
      throw new Error(
        `Reviewed SourceDoc content/hash LAR formula drift: ${entry.sourceDocId}`,
      );
    }
  }
  return entries;
}

validateReviewedSourceDocContentHashManifest();

export function assertReviewedSourceDocContentHashManifestPinned() {
  if (
    REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST_SHA256 !==
    PINNED_REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST_SHA256
  ) {
    throw new Error(
      "Reviewed SourceDoc content/hash manifest SHA-256 drifted from pinned contract",
    );
  }
}

assertReviewedSourceDocContentHashManifestPinned();
