import { createHash } from "node:crypto";
import type { Thesis } from "../types";

export const REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIR_VERSION =
  "2026-07-20-v1" as const;
export const REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIR_TARGET_COUNT = 9 as const;

export const REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIR_IDS = [
  "sandanger-2012",
  "granlund-lindskog-2024",
  "tallaksen-2022",
  "tesdal-2013",
  "handlykken-2023",
  "slu-house-crickets-2025",
  "van-straten-2025",
  "bueso-bordils-2021",
  "nmbu-circular-vegetables-2022",
] as const;

export const REVIEWED_THESIS_BIBLIOGRAPHIC_EXCLUDED_IDS = [
  "mattila-2024",
  "naess-2024",
  "halseth-phd-2024",
  "lund-beijer-2026",
  "rey-verge-2005",
] as const;

export const REVIEWED_THESIS_BIBLIOGRAPHIC_MUTABLE_FIELDS = [
  "authors",
  "institution",
  "year",
  "title",
  "url",
  "doi",
  "isbn",
  "publisher",
] as const;

export type ReviewedThesisBibliographicMutableField =
  (typeof REVIEWED_THESIS_BIBLIOGRAPHIC_MUTABLE_FIELDS)[number];

export type ThesisBibliographicPortableSnapshot = {
  id: string;
  authors: string;
  institution: string;
  year: number;
  title: string;
  titleNo: string | null;
  url: string;
  synthesis: string;
  keyFindings: string[];
  tags: Thesis["tags"];
  takeaways: string[];
  method: string | null;
  awardWinning: boolean;
  degree: Thesis["degree"];
  doi: string | null;
  isbn: string | null;
  publisher: string | null;
  accessDate: string | null;
  provenanceType: Thesis["provenanceType"] | null;
};

export type ReviewedThesisBibliographicRepair = Readonly<{
  id: string;
  before: ThesisBibliographicPortableSnapshot;
  after: ThesisBibliographicPortableSnapshot;
  mutatedFields: readonly ReviewedThesisBibliographicMutableField[];
  evidenceUrl: string;
  reviewBasis: string;
}>;

export type ReviewedThesisBibliographicConflict = {
  id: string;
  code: "missing" | "duplicate" | "snapshot_drift";
  detail: string;
};

export type ReviewedThesisBibliographicUpdate = {
  id: string;
  mutatedFields: readonly ReviewedThesisBibliographicMutableField[];
  before: ThesisBibliographicPortableSnapshot;
  after: ThesisBibliographicPortableSnapshot;
  beforeFullRowSha256: string;
  afterFullRowSha256: string;
  beforeNonTargetSha256: string;
  afterNonTargetSha256: string;
};

export type ReviewedThesisBibliographicRepairPlan = {
  version: typeof REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIR_VERSION;
  manifestSha256: string;
  updates: ReviewedThesisBibliographicUpdate[];
  alreadyAppliedIds: string[];
  conflicts: ReviewedThesisBibliographicConflict[];
  summary: {
    total: number;
    pending: number;
    alreadyApplied: number;
    conflicts: number;
  };
};

type CanonicalJsonValue =
  | null
  | boolean
  | number
  | string
  | CanonicalJsonValue[]
  | { [key: string]: CanonicalJsonValue };

const THESIS_BIBLIOGRAPHIC_SNAPSHOT_FIELDS = [
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
  "provenanceType",
] as const satisfies readonly (keyof ThesisBibliographicPortableSnapshot)[];

const mutableFieldSet = new Set<keyof ThesisBibliographicPortableSnapshot>(
  REVIEWED_THESIS_BIBLIOGRAPHIC_MUTABLE_FIELDS,
);

export function canonicalizeReviewedThesisBibliographicJson(
  value: unknown,
): CanonicalJsonValue {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string"
  ) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(canonicalizeReviewedThesisBibliographicJson);
  }
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [
          key,
          canonicalizeReviewedThesisBibliographicJson(entry),
        ]),
    );
  }
  throw new Error(
    `Reviewed Thesis bibliographic contract contains a non-JSON value: ${String(value)}`,
  );
}

export function sha256ReviewedThesisBibliographicJson(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(canonicalizeReviewedThesisBibliographicJson(value)))
    .digest("hex");
}

export function normalizeThesisBibliographicSnapshot(
  row: Thesis | ThesisBibliographicPortableSnapshot,
): ThesisBibliographicPortableSnapshot {
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
    provenanceType: row.provenanceType ?? null,
  };
}

export function materializeThesisBibliographicSnapshot(
  snapshot: ThesisBibliographicPortableSnapshot,
): Thesis {
  return {
    id: snapshot.id,
    authors: snapshot.authors,
    institution: snapshot.institution,
    year: snapshot.year,
    title: snapshot.title,
    ...(snapshot.titleNo === null ? {} : { titleNo: snapshot.titleNo }),
    url: snapshot.url,
    synthesis: snapshot.synthesis,
    keyFindings: [...snapshot.keyFindings],
    tags: [...snapshot.tags],
    takeaways: [...snapshot.takeaways],
    ...(snapshot.method === null ? {} : { method: snapshot.method }),
    ...(snapshot.awardWinning ? { awardWinning: true } : {}),
    degree: snapshot.degree,
    ...(snapshot.doi === null ? {} : { doi: snapshot.doi }),
    ...(snapshot.isbn === null ? {} : { isbn: snapshot.isbn }),
    ...(snapshot.publisher === null ? {} : { publisher: snapshot.publisher }),
    ...(snapshot.accessDate === null
      ? {}
      : { accessDate: snapshot.accessDate }),
    ...(snapshot.provenanceType === null
      ? {}
      : { provenanceType: snapshot.provenanceType }),
  };
}

function snapshotsEqual(
  left: ThesisBibliographicPortableSnapshot,
  right: ThesisBibliographicPortableSnapshot,
) {
  return (
    sha256ReviewedThesisBibliographicJson(left) ===
    sha256ReviewedThesisBibliographicJson(right)
  );
}

function snapshotDiff(
  left: ThesisBibliographicPortableSnapshot,
  right: ThesisBibliographicPortableSnapshot,
) {
  return THESIS_BIBLIOGRAPHIC_SNAPSHOT_FIELDS.filter(
    (field) => JSON.stringify(left[field]) !== JSON.stringify(right[field]),
  );
}

function nonTargetSnapshot(snapshot: ThesisBibliographicPortableSnapshot) {
  return Object.fromEntries(
    THESIS_BIBLIOGRAPHIC_SNAPSHOT_FIELDS.filter(
      (field) => !mutableFieldSet.has(field),
    ).map((field) => [field, snapshot[field]]),
  );
}

function reviewedRepair(
  before: ThesisBibliographicPortableSnapshot,
  changes: Partial<
    Pick<
      ThesisBibliographicPortableSnapshot,
      ReviewedThesisBibliographicMutableField
    >
  >,
  evidenceUrl: string,
  reviewBasis: string,
): ReviewedThesisBibliographicRepair {
  const after = { ...before, ...changes };
  const mutatedFields = snapshotDiff(before, after).filter(
    (field): field is ReviewedThesisBibliographicMutableField =>
      mutableFieldSet.has(field),
  );
  return {
    id: before.id,
    before,
    after,
    mutatedFields,
    evidenceUrl,
    reviewBasis,
  };
}

const sandangerBefore: ThesisBibliographicPortableSnapshot = {
  id: "sandanger-2012",
  authors: "Sandanger",
  institution: "NHH",
  year: 2012,
  title:
    "Horisontal konkurranse i dagligvaremarkedet: Bruken av egne merkevarer",
  titleNo: null,
  url: "https://hdl.handle.net/11250/166778",
  synthesis:
    "EMV brukes primart til a differensiere butikkonsepter, ikke for a konkurrere direkte mot merkeleverandorer. EMV-vekst reduserer sammenlignbarhet mellom kjeder og kan dempe priskonkurranse.",
  keyFindings: [
    "Hovedinsentivet for EMV er differensiering av butikkonsept",
    "Firstprice (Kiwi) og Eldorado (NorgesGruppen) brukes strategisk for unike butikkprofiler",
    "EMV-vekst reduserer sammenlignbarhet mellom kjeder",
    "Redusert sammenlignbarhet kan dempe priskonkurransen",
  ],
  tags: ["emv", "prising", "konsentrasjon"],
  takeaways: [
    "EMV som konkurransedempende mekanisme bor inkluderes i analysen",
    "Sammenlignbarhet-argumentet er sterkt — forbrukere kan ikke sammenligne EMV-produkter",
  ],
  method: "Analyse av EMV-strategier og effekt pa horisontal konkurranse",
  awardWinning: false,
  degree: "master",
  doi: "hdl:11250/166778",
  isbn: null,
  publisher: "Norges Handelshoyskole",
  accessDate: "2026-07-20",
  provenanceType: null,
};

const granlundLindskogBefore: ThesisBibliographicPortableSnapshot = {
  id: "granlund-lindskog-2024",
  authors: "Granlund & Lindskog",
  institution: "NTNU",
  year: 2024,
  title:
    "The Status of Operational Technology Cybersecurity within The Norwegian Food Supply Sector",
  titleNo: null,
  url: "https://ntnuopen.ntnu.no/ntnu-xmlui/handle/11250/3156088",
  synthesis:
    "Undersaker cybersikkerhetsarbarheter i operasjonell teknologi (OT) i norsk matforsyning. Klassifiserer cyberangrepstyper og vurderer beredskapen til matproduksjon og distribusjon.",
  keyFindings: [
    "Norsk matforsyningssektor har betydelige sarbarheter i operasjonell teknologi",
    "Cyberangrep kan forstyrre matproduksjon og distribusjon",
    "Beredskapen mot digitale trusler er mangelfull i matindustrien",
  ],
  tags: ["beredskap", "digital", "logistikk"],
  takeaways: [
    "Digital sarbarhet er en underkommunisert beredskapsrisiko",
    "Koble til diskusjonen om kritisk infrastruktur i matforsyningskjeden",
  ],
  method: "Kvalitativ studie av cybersikkerhet i norsk matforsyningssektor",
  awardWinning: false,
  degree: "master",
  doi: "hdl:11250/3156088",
  isbn: null,
  publisher: "Norges teknisk-naturvitenskapelige universitet",
  accessDate: "2026-07-20",
  provenanceType: null,
};

const tallaksenBefore: ThesisBibliographicPortableSnapshot = {
  id: "tallaksen-2022",
  authors: "Tallaksen",
  institution: "UiO",
  year: 2022,
  title: "Mot baerekraftige kostholdsendringer",
  titleNo: null,
  url: "https://hdl.handle.net/11250/3008873",
  synthesis:
    "Kvalitativ studie av norske studenters holdninger til kjottreduksjon. Identifiserer manglende motivasjon, pris, bekvemmelighet og informasjonsoverbelastning som hovedbarrierer.",
  keyFindings: [
    "Hoyt kjottkonsum koblet til maskulinitetsnormer",
    "Manglende motivasjon og ferdigheter viktigere enn mangel pa informasjon",
    "Pris og bekvemmelighet er praktiske barrierer for kostholdsendring",
    "Informasjonsoverbelastning skaper handlingslammelse",
  ],
  tags: ["protein", "klima", "atferd"],
  takeaways: [
    "Kjonnsaspektet ved kjottkonsum bor adresseres i politikkutforming",
    "Praktiske barrierer viktigere enn holdningskampanjer — koble til Sigurdardottir 2017",
  ],
  method:
    "Kvalitativ studie med individuelle intervjuer og fokusgrupper blant universitetsstudenter",
  awardWinning: false,
  degree: "master",
  doi: null,
  isbn: null,
  publisher: "Universitetet i Oslo",
  accessDate: "2026-07-20",
  provenanceType: null,
};

const tesdalBefore: ThesisBibliographicPortableSnapshot = {
  id: "tesdal-2013",
  authors: "Tesdal",
  institution: "UiO",
  year: 2013,
  title:
    "Nokkelhull pa matvarer — private aktorers okonomiske interesser og konsekvensene for myndighetenes merkeordning",
  titleNo: null,
  url: "https://www.duo.uio.no/handle/10852/34009",
  synthesis:
    "Analyserer hvordan matindustriens okonomiske interesser svekker Nokkelhull-merkeordningen. Priskrig forte til at produsenter fjernet Nokkelhull fra sunne produkter.",
  keyFindings: [
    "Priskrig forte til at produsenter fjernet Nokkelhull-merket fra sunne produkter",
    "Private aktorers okonomiske interesser kan svekke offentlige merkeordninger",
    "Spenning mellom kommersielle hensyn og folkehelsepolitikk i dagligvaremarkedet",
  ],
  tags: ["regulering", "makt", "atferd"],
  takeaways: [
    "Merkeordninger som politikkinstrument er saarbare for markedslogikk",
    "Koble til diskusjonen om kjedenes makt over produktsortiment og merking",
  ],
  method:
    "STS-analyse av samspillet mellom offentlig merkeordning og private aktorers interesser",
  awardWinning: false,
  degree: "master",
  doi: "hdl:10852/34009",
  isbn: null,
  publisher: "Universitetet i Oslo",
  accessDate: "2026-07-20",
  provenanceType: null,
};

const handlykkenBefore: ThesisBibliographicPortableSnapshot = {
  id: "handlykken-2023",
  authors: "Handlykken",
  institution: "OsloMet",
  year: 2023,
  title:
    "Nudging som atferdsoekonomisk virkemiddel for forbrukeratferd i dagligvare",
  titleNo: null,
  url: "https://hdl.handle.net/11250/3101983",
  synthesis:
    "Systematisk litteraturgjennomgang av nudging i dagligvare. Nudging har positive men variable effekter, saerlig for baerekraftige og helsefremmende valg.",
  keyFindings: [
    "Nudging har positive men variable effekter pa forbrukeratferd i dagligvare",
    "Staerkest effekt for baerekraftige og helsefremmende produktvalg",
    "Etiske innvendinger finnes men er ikke sterke nok til a utelukke metoden",
  ],
  tags: ["atferd", "klima", "regulering"],
  takeaways: [
    "Nudging i butikk er et realistisk virkemiddel for kostholdsendring",
    "Etikk-diskusjonen bor inkluderes nar nudging foreslas som tiltak",
  ],
  method:
    "Systematisk litteraturgjennomgang av 20 fagfellevurderte artikler om nudging i dagligvare",
  awardWinning: false,
  degree: "master",
  doi: "hdl:11250/3101983",
  isbn: null,
  publisher: "OsloMet - storbyuniversitetet",
  accessDate: "2026-07-20",
  provenanceType: null,
};

const sluHouseCricketsBefore: ThesisBibliographicPortableSnapshot = {
  id: "slu-house-crickets-2025",
  authors: "SLU doctoral candidate",
  institution: "Swedish University of Agricultural Sciences (SLU)",
  year: 2025,
  title: "Integrating house crickets in circular food systems",
  titleNo: null,
  url: "https://pub.epsilon.slu.se/id/document/20453027",
  synthesis:
    "Eksperimentell PhD-avhandling som undersoker hvordan hussirisser (Acheta domesticus) kan integreres i sirkulaere matsystemer ved a konvertere erte- og tomatrester til protein, samtidig som frass (insektavforing) brukes som gjodsel. Avhandlingen kvantifiserer hvordan ulike dietter og frass-behandlinger paavirker overlevelse, vekst og naeringssammensetning.",
  keyFindings: [
    "Hussirisser kan effektivt omdanne erte- og tomatrester til hoyverdig protein og bidra til sirkulaer bioressursutnyttelse",
    "Frass fra sirisser forbedrer jordnaering og mikrobiell biodiversitet naar det brukes som gjodsel",
    "Ulike sammensetninger av plantereststoffer i dietten paavirker overlevelsesrate, vekst og naeringsprofil hos sirissene",
    "Insektproduksjon kan kobles til avlsreststrommer og bidra til baade protein- og gjodselsproduksjon i samme system",
  ],
  tags: ["sirkulaer", "protein", "okologi"],
  takeaways: [
    "Proteinomstilling i Norden kan bruke plantereststoffer som substrat for insektproduksjon",
    "Frass som gjodsel kan inngaa i sirkulaere gardsokologier og redusere behovet for mineralgjodsel",
    "Eksperimentelle data gir grunnlag for a vurdere industriell oppskalering av insektbasert sirkulaer produksjon",
  ],
  method:
    "Eksperimentell foroppdrett av hussirisser pa erte- og tomatrester samt frasstesting som gjodsel",
  awardWinning: false,
  degree: "phd",
  doi: null,
  isbn: null,
  publisher: "SLU",
  accessDate: "2026-07-20",
  provenanceType: null,
};

const vanStratenBefore: ThesisBibliographicPortableSnapshot = {
  id: "van-straten-2025",
  authors: "Van Straten",
  institution: "Södertörn University",
  year: 2025,
  title: "Circular business models in Finnish food companies",
  titleNo: null,
  url: "https://www.diva-portal.org/smash/get/diva2:2041632/FULLTEXT01.pdf",
  synthesis:
    "Kvalitativ multippel casestudie av fire finske selskaper — Fazer, Hesburger, K-Supermarket og ResQ Club — som belyser hvordan fysiske og digitale aktorer adopterer sirkulaere forretningsmodeller. Fysiske selskaper gjor inkrementelle innovasjoner (sidestrom-valorisering, waste-to-energy, datadrevet svinnreduksjon), mens den digitale plattformen ResQ Club har sirkularitet som kjerne. Institusjonelt press driver engasjement, men selskapsspesifikke ressurser avgjor transformasjonsdybden.",
  keyFindings: [
    "Fysiske finske matselskaper (Fazer, Hesburger, K-Supermarket) satser paa inkrementelle sirkulaere innovasjoner som sidestromvalorisering og waste-to-energy",
    "Den digitale plattformen ResQ Club har sirkularitet som kjerne i forretningsmodellen — ikke som tillegg",
    "Institusjonelt press (regelverk, forbrukerforventninger, bransjeinitiativ) driver selskapenes engasjement i sirkulaere tiltak",
    "Selskapsspesifikke ressurser (kapital, kompetanse, data) avgjor dybden av sirkulaer transformasjon",
    "Datadrevet svinnreduksjon er et gjennomgaaende tema i finsk dagligvaresektor",
  ],
  tags: ["sirkulaer", "matsvinn", "digital", "nordisk"],
  takeaways: [
    "ResQ Club-modellen (digital matsvinnplattform) er direkte overforbar til Norge — Too Good To Go opererer tilsvarende",
    "Skillet mellom inkrementell og kjerne-sirkulaer forretningsmodell er nyttig for a klassifisere norske aktorer",
    "Norsk politikk bor kombinere institusjonelt press (krav) med stotte til selskapsspesifikk kapasitetsbygging",
  ],
  method: "Kvalitativ multippel casestudie av fire finske selskaper",
  awardWinning: false,
  degree: "master",
  doi: null,
  isbn: null,
  publisher: "Södertörn University",
  accessDate: "2026-07-20",
  provenanceType: null,
};

const buesoBordilsBefore: ThesisBibliographicPortableSnapshot = {
  id: "bueso-bordils-2021",
  authors: "Bueso Bordils",
  institution: "Aalborg University",
  year: 2021,
  title: "Circular economy mapping on Bornholm island",
  titleNo: null,
  url: "https://vbn.aau.dk/ws/files/423552694/Master_Thesis_Vicente_Bueso_Bordils.pdf",
  synthesis:
    "Kartlegger retail-matsvinnsstrommer pa den danske oya Bornholm og identifiserer aktorer langs verdikjeden. Foreslaar tettere samarbeid mellom butikker, veldedighet og kommuner for a redusere svinn, kutte klimagassutslipp og generere sosiale og okonomiske gevinster. Lokale myndigheter tildeles en tilretteleggerrolle.",
  keyFindings: [
    "Detaljert kartlegging av retail-matsvinnsstrommer pa Bornholm identifiserer aktorer og volum langs verdikjeden",
    "Samarbeid mellom butikker, veldedige organisasjoner og kommuner er noekkelen til a omdirigere svinn til mat-redistribusjon",
    "Sirkulaere tiltak pa oya kan gi lavere klimagassutslipp, okonomisk gevinst og samfunnsmessig nytte gjennom mat til sarbare grupper",
    "Lokale myndigheter pekes ut som tilrettelegger for nettverk mellom aktorer — ikke nodvendigvis eier eller drifter",
  ],
  tags: ["sirkulaer", "matsvinn", "verdikjede", "offentlig-innkjop"],
  takeaways: [
    "Metoden er overforbar til norske oy- og distriktskommuner der dagligvarestruktur er oversiktlig",
    "Lokale kommuner kan tildeles tilretteleggerrolle i matsvinnsreduksjon — ikke bare tilsynsmyndighet",
    "Aktorkartlegging gir nyttig datagrunnlag for a prioritere hvor kommunalt samarbeid gir storst effekt",
  ],
  method:
    "Kartlegging av retail-matsvinnsstrommer pa Bornholm med aktoranalyse",
  awardWinning: false,
  degree: "master",
  doi: null,
  isbn: null,
  publisher: "Aalborg University",
  accessDate: "2026-07-20",
  provenanceType: null,
};

const nmbuCircularVegetablesBefore: ThesisBibliographicPortableSnapshot = {
  id: "nmbu-circular-vegetables-2022",
  authors: "NMBU master candidate",
  institution: "NMBU",
  year: 2022,
  title:
    "Barriers and drivers to a circular economy for vegetables in the Norwegian food sector",
  titleNo: null,
  url: "https://agris.fao.org/search/en/providers/122576/records/6474afcaf2e6fe92b3632ace",
  synthesis:
    "Systemanalyse av barrierer og drivere for sirkulaer gronnsaksproduksjon i Norge. Barrierer omfatter regelverk, manglende politiske incentiver, okonomisk risiko, forbrukerpreferanser, kunnskapsgap og etablerte maktstrukturer; drivere inkluderer kunnskap, lonnsomhet, politiske incentiver, verdikjedesamarbeid og ny teknologi.",
  keyFindings: [
    "Barrierer for sirkulaer gronnsaksproduksjon i Norge: regelverk, manglende politiske incentiver, okonomisk risiko og forbrukerpreferanser",
    "Tilleggsbarrierer: kunnskapsgap hos aktorer og etablerte maktstrukturer i verdikjeden som motvirker endring",
    "Drivere: kunnskapsbygging, lonnsomhetspotensial, politiske incentiver, verdikjedesamarbeid og ny teknologi",
    "Systemanalysen viser at barrierer og drivere er sammenvevet — enkelttiltak har begrenset effekt uten helhetlig politikk",
  ],
  tags: ["sirkulaer", "verdikjede", "regulering", "okologi"],
  takeaways: [
    "Norsk sirkulaer-politikk for gronnsaker maa adressere baade regelverk, incentiver og kunnskapsoverforing samtidig",
    "Etablerte maktstrukturer i gronnsaksverdikjeden er en underkommunisert barriere som fortjener eksplisitt politikkoppmerksomhet",
    "Verdikjedesamarbeid mellom produsenter, grossister og kjeder pekes ut som sentral driver — bor stottes av myndighetene",
  ],
  method: "Kvalitativ analyse av barrierer og drivere i norsk gronnsakssektor",
  awardWinning: false,
  degree: "master",
  doi: null,
  isbn: null,
  publisher: "NMBU",
  accessDate: "2026-07-20",
  provenanceType: null,
};

export const REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS = [
  reviewedRepair(
    sandangerBefore,
    {
      authors: "Elise Sandanger",
      title:
        "Horisontal konkurranse i dagligvaremarkedet: Bruken av egne merkevarer i konkurransen mellom norske dagligvarekjeder",
      url: "https://hdl.handle.net/11250/169513",
      doi: "hdl:11250/169513",
      publisher: "Norges Handelshøyskole",
    },
    "https://api.nva.unit.no/search/resources?query=0199147018cd-e28230b0-f5bd-4f23-9f71-48afe6faf444&size=2",
    "The NVA registration and NHH full text identify Elise Sandanger, the complete title, and Handle 11250/169513; the existing pseudo-Handle DOI is updated consistently.",
  ),
  reviewedRepair(
    granlundLindskogBefore,
    {
      authors: "Henrik Granlund; Herman Lindskog",
      url: "https://hdl.handle.net/11250/3156087",
      doi: "hdl:11250/3156087",
    },
    "https://api.nva.unit.no/search/resources?query=0198cc481285-fc6c407c-a620-4d84-9ea8-f79a0f8cdf50&size=2",
    "The NVA registration identifies both creators and canonical Handle 11250/3156087; the existing pseudo-Handle DOI is updated consistently.",
  ),
  reviewedRepair(
    tallaksenBefore,
    {
      authors: "Amalie Tallaksen",
      institution: "Universitetet i Agder",
      title:
        "Towards Sustainable Dietary Change: An Exploration of Norwegian University Student's Attitudes toward Meat Reduction",
      publisher: "Universitetet i Agder",
    },
    "https://api.nva.unit.no/search/resources?query=01999f1e7b9c-bd81bcf6-8ae3-4266-9f96-5edbcdd5ef3d&size=2",
    "The NVA registration supplies the full English title, Amalie Tallaksen as creator, and Universitetet i Agder as the degree institution.",
  ),
  reviewedRepair(
    tesdalBefore,
    {
      authors: "Kari Tesdal",
      year: 2012,
      title:
        "Nøkkelhull på matvarer - en analyse av private aktørers økonomiske interesser og konsekvensene for myndighetenes merkeordning",
    },
    "https://api.nva.unit.no/search/resources?query=019c95276ac1-6b96ca8d-628e-4298-8215-1ec6f6b38579&size=2",
    "The NVA registration gives Kari Tesdal, publication year 2012, and the exact Norwegian title with its original diacritics.",
  ),
  reviewedRepair(
    handlykkenBefore,
    {
      authors: "Vilje S. Håndlykken",
      title:
        "Hvordan brukes nudging som atferdsøkonomisk virkemiddel i forhold til forbrukeratferd, og hvilke etiske implikasjoner kan dette medføre?",
    },
    "https://api.nva.unit.no/search/resources?query=0198f5fb30ce-ca839e60-2b1b-453c-b71c-e4453f424e27&size=2",
    "The NVA registration identifies Vilje S. Håndlykken and the complete question-form title instead of the seed paraphrase.",
  ),
  reviewedRepair(
    sluHouseCricketsBefore,
    {
      authors: "Sara Capitán",
      title:
        "House crickets in circular food systems: From crop residue diets to frass-based farming",
      doi: "10.54612/a.7ersgt4v2k",
      isbn: "978-91-8124-092-4",
      publisher: "Swedish University of Agricultural Sciences",
    },
    "https://pub.epsilon.slu.se/38477/1/capitan-s-20250923.pdf",
    "The SLU dissertation full text identifies Sara Capitán, the exact title, DOI 10.54612/a.7ersgt4v2k, e-ISBN 978-91-8124-092-4, and the full publisher name.",
  ),
  reviewedRepair(
    vanStratenBefore,
    {
      authors: "Elizabeth Van Straten",
      title:
        "How food companies operating in Finland translate circular economy principles into business model innovation: A Qualitative Multiple-Case Study of Circular Business Models in the Food System",
    },
    "https://www.diva-portal.org/smash/get/diva2:2041632/FULLTEXT01.pdf",
    "The official full text identifies Elizabeth Van Straten and the complete title while retaining publication year 2025.",
  ),
  reviewedRepair(
    buesoBordilsBefore,
    {
      authors: "Vicente Bueso Bordils",
      title:
        "Study on food waste streams and creation of circular solutions on Bornholm",
    },
    "https://vbn.aau.dk/ws/files/423552694/Master_Thesis_Vicente_Bueso_Bordils.pdf",
    "The Aalborg University full text identifies Vicente Bueso Bordils and the exact thesis title.",
  ),
  reviewedRepair(
    nmbuCircularVegetablesBefore,
    {
      authors: "Andrea Christine Kunz Skrede",
      url: "https://hdl.handle.net/11250/3030715",
    },
    "https://nmbu.brage.unit.no/nmbu-xmlui/bitstream/handle/11250/3030715/Skrede_Master_2022.pdf?isAllowed=y&sequence=1",
    "The NMBU full text identifies Andrea Christine Kunz Skrede and the institutional Handle; the Handle is retained only as URL and is not invented as a DOI.",
  ),
] as const satisfies readonly ReviewedThesisBibliographicRepair[];

function absoluteHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function reviewedThesisBibliographicManifestContract() {
  return {
    version: REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIR_VERSION,
    targetCount: REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIR_TARGET_COUNT,
    repairs: REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS,
    excludedIds: REVIEWED_THESIS_BIBLIOGRAPHIC_EXCLUDED_IDS,
  };
}

export function validateReviewedThesisBibliographicRepairs(
  repairs: readonly ReviewedThesisBibliographicRepair[] = REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS,
) {
  const ids = repairs.map((repair) => repair.id);
  if (
    repairs.length !== REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIR_TARGET_COUNT ||
    new Set(ids).size !== repairs.length ||
    JSON.stringify([...ids].sort()) !==
      JSON.stringify([...REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIR_IDS].sort())
  ) {
    throw new Error(
      "Reviewed Thesis bibliographic manifest must contain exactly the nine pinned ids",
    );
  }

  const excluded = new Set(REVIEWED_THESIS_BIBLIOGRAPHIC_EXCLUDED_IDS);
  const accidentallyIncluded = ids.filter((id) => excluded.has(id as never));
  if (accidentallyIncluded.length > 0) {
    throw new Error(
      `Reviewed Thesis bibliographic manifest includes unresolved or entity-migration ids: ${accidentallyIncluded.join(", ")}`,
    );
  }

  for (const repair of repairs) {
    if (
      repair.before.id !== repair.id ||
      repair.after.id !== repair.id ||
      !absoluteHttpUrl(repair.evidenceUrl) ||
      repair.reviewBasis.trim().length === 0
    ) {
      throw new Error(
        `Reviewed Thesis bibliographic evidence contract is invalid: ${repair.id}`,
      );
    }

    const actualMutatedFields = snapshotDiff(repair.before, repair.after);
    if (
      actualMutatedFields.length === 0 ||
      actualMutatedFields.some((field) => !mutableFieldSet.has(field)) ||
      JSON.stringify(actualMutatedFields) !==
        JSON.stringify(repair.mutatedFields)
    ) {
      throw new Error(
        `Reviewed Thesis bibliographic mutation scope drifted: ${repair.id}`,
      );
    }

    const beforeNonTargetSha256 = sha256ReviewedThesisBibliographicJson(
      nonTargetSnapshot(repair.before),
    );
    const afterNonTargetSha256 = sha256ReviewedThesisBibliographicJson(
      nonTargetSnapshot(repair.after),
    );
    if (beforeNonTargetSha256 !== afterNonTargetSha256) {
      throw new Error(
        `Reviewed Thesis bibliographic non-target fields drifted: ${repair.id}`,
      );
    }
  }

  return repairs;
}

export const PINNED_REVIEWED_THESIS_BIBLIOGRAPHIC_MANIFEST_SHA256 =
  "bc76d1c5b8454ad843ce5b0dde0d726edf085305c77ad744aa2919692b5249fe" as const;

export const REVIEWED_THESIS_BIBLIOGRAPHIC_MANIFEST_SHA256 =
  sha256ReviewedThesisBibliographicJson(
    reviewedThesisBibliographicManifestContract(),
  );

if (
  REVIEWED_THESIS_BIBLIOGRAPHIC_MANIFEST_SHA256 !==
  PINNED_REVIEWED_THESIS_BIBLIOGRAPHIC_MANIFEST_SHA256
) {
  throw new Error(
    "Reviewed Thesis bibliographic manifest SHA-256 drifted from the approved nine-row contract",
  );
}

export function buildReviewedThesisBibliographicRepairPlan(
  rows: readonly (Thesis | ThesisBibliographicPortableSnapshot)[],
): ReviewedThesisBibliographicRepairPlan {
  validateReviewedThesisBibliographicRepairs();
  const updates: ReviewedThesisBibliographicUpdate[] = [];
  const alreadyAppliedIds: string[] = [];
  const conflicts: ReviewedThesisBibliographicConflict[] = [];

  for (const repair of REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS) {
    const matches = rows.filter((row) => row.id === repair.id);
    if (matches.length === 0) {
      conflicts.push({
        id: repair.id,
        code: "missing",
        detail: "Expected exactly one reviewed Thesis row; found 0.",
      });
      continue;
    }
    if (matches.length !== 1) {
      conflicts.push({
        id: repair.id,
        code: "duplicate",
        detail: `Expected exactly one reviewed Thesis row; found ${matches.length}.`,
      });
      continue;
    }

    const normalized = normalizeThesisBibliographicSnapshot(matches[0]!);
    if (snapshotsEqual(normalized, repair.after)) {
      alreadyAppliedIds.push(repair.id);
      continue;
    }
    if (snapshotsEqual(normalized, repair.before)) {
      updates.push({
        id: repair.id,
        mutatedFields: repair.mutatedFields,
        before: repair.before,
        after: repair.after,
        beforeFullRowSha256: sha256ReviewedThesisBibliographicJson(
          repair.before,
        ),
        afterFullRowSha256: sha256ReviewedThesisBibliographicJson(repair.after),
        beforeNonTargetSha256: sha256ReviewedThesisBibliographicJson(
          nonTargetSnapshot(repair.before),
        ),
        afterNonTargetSha256: sha256ReviewedThesisBibliographicJson(
          nonTargetSnapshot(repair.after),
        ),
      });
      continue;
    }

    conflicts.push({
      id: repair.id,
      code: "snapshot_drift",
      detail: `Thesis matches neither exact reviewed before nor after snapshot; fields differing from before: ${snapshotDiff(normalized, repair.before).join(", ")}.`,
    });
  }

  return {
    version: REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIR_VERSION,
    manifestSha256: REVIEWED_THESIS_BIBLIOGRAPHIC_MANIFEST_SHA256,
    updates,
    alreadyAppliedIds,
    conflicts,
    summary: {
      total: REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIR_TARGET_COUNT,
      pending: updates.length,
      alreadyApplied: alreadyAppliedIds.length,
      conflicts: conflicts.length,
    },
  };
}

function applyRepairToRow(
  row: Thesis,
  repair: ReviewedThesisBibliographicRepair,
) {
  const result: Thesis = { ...row };
  const resultRecord = result as unknown as Record<string, unknown>;
  for (const field of repair.mutatedFields) {
    const value = repair.after[field];
    if (value === null) delete resultRecord[field];
    else resultRecord[field] = value;
  }
  if (
    !snapshotsEqual(normalizeThesisBibliographicSnapshot(result), repair.after)
  ) {
    throw new Error(
      `Reviewed Thesis bibliographic seed repair produced unexpected state: ${repair.id}`,
    );
  }
  return result;
}

export function applyReviewedThesisBibliographicRepairsToSeed(
  rows: readonly Thesis[],
): Thesis[] {
  const plan = buildReviewedThesisBibliographicRepairPlan(rows);
  if (plan.conflicts.length > 0) {
    throw new Error(
      `Reviewed Thesis bibliographic seed conflict: ${plan.conflicts
        .map((conflict) => `${conflict.id}:${conflict.code}`)
        .join(", ")}`,
    );
  }

  const pending = new Map(plan.updates.map((update) => [update.id, update]));
  const repairs = new Map(
    REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.map((repair) => [repair.id, repair]),
  );
  return rows.map((row) => {
    if (!pending.has(row.id)) return row;
    return applyRepairToRow(row, repairs.get(row.id)!);
  });
}

export function reviewedThesisBibliographicRepairPlanContract(
  plan: ReviewedThesisBibliographicRepairPlan,
) {
  return {
    version: plan.version,
    manifestSha256: plan.manifestSha256,
    updates: plan.updates,
    alreadyAppliedIds: plan.alreadyAppliedIds,
    conflicts: plan.conflicts,
    summary: plan.summary,
  };
}

export function reviewedThesisBibliographicRepairPlanSha256(
  plan: ReviewedThesisBibliographicRepairPlan,
) {
  return sha256ReviewedThesisBibliographicJson(
    reviewedThesisBibliographicRepairPlanContract(plan),
  );
}
