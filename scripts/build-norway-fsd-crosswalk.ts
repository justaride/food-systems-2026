import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parseCsv, type CsvRow } from "./lib/parse-rfc4180.ts";
import { readVerifiedGzipSnapshot } from "./lib/snapshot-integrity.ts";

const ROOT = resolve(process.cwd());
const ACCESS_DATE = "2026-08-10";
const SNAPSHOT_DATE = "2026-04-20";
const LANDSCAPE_DIR = resolve(ROOT, "research/landscape");
const SNAPSHOT_DIR = resolve(LANDSCAPE_DIR, "snapshots");

type AnyRecord = Record<string, any>;
type ComparisonStatus =
  | "exact_overlap"
  | "partial_overlap"
  | "same_theme_different_measure"
  | "internal_conflict"
  | "complementary_only"
  | "no_match"
  | "blocked_source";
type Disposition =
  | "reuse_internal"
  | "external_reference_only"
  | "dual_series"
  | "needs_primary_check"
  | "candidate_import"
  | "no_import";

interface InternalMatch {
  file: string;
  dataset: string;
  metricKey: string;
  value: number | null;
  unit: string | null;
  year: number | null;
  geography: string;
  definition: string;
  sourceRef: string;
  provenanceStatus: string;
  notes?: string;
}

interface SourceRow {
  id: string;
  name: string;
  sourceKind: "fsd_dashboard" | "fsd_export" | "underlying_primary" | "internal";
  role: string;
  owner: string;
  sourceClass: string;
  citationReadiness: string;
  verificationStatus: string;
  url?: string;
  localPath?: string;
  accessDate: string;
  contentHash?: string;
  license: string;
  notes: string;
}

type FullExportManifest = {
  id: string;
  compressedPath: string;
  compressedBytes: number;
  compressedSha256: string;
  rawBytes: number;
  rawSha256: string;
  compression: "gzip -n -9";
};

const sourceRows = new Map<string, SourceRow>();

const faoUrl = "https://www.fao.org/faostat/en/#data";
const FSD_PROFILE_URL = "https://www.foodsystemsdashboard.org/countries/nor";
const FSD_METHODOLOGY_URL = "https://www.foodsystemsdashboard.org/information/data-sources-and-methodology";
const FSD_DOWNLOADS_URL = "https://www.foodsystemsdashboard.org/downloads?default-indicator=69";

function sourceIdFromUrl(url: string): string {
  const normalized = url.trim().replace(/^http:\/\//, "https://");
  const known: Record<string, string> = {
    "https://www.fao.org/faostat/en/#data/CAHD": "src-faostat-cahd",
    "https://www.fao.org/faostat/en/#data/FBS": "src-faostat-food-balances",
    "https://www.fao.org/faostat/en/#data/FS": "src-faostat-food-security",
    "https://www.fao.org/faostat/en/#data/GT": "src-faostat-ghg-total",
    "https://www.fao.org/faostat/en/#data/EI": "src-faostat-ghg-intensity",
    "https://www.fao.org/faostat/en/#data/QCL": "src-faostat-crops-livestock",
    "https://www.fao.org/faostat/en/#data/QC": "src-faostat-crops",
    "https://data.worldbank.org/indicator/SP.POP.TOTL": "src-world-bank-population",
    "https://www.ilo.org/shinyapps/bulkexplorer12/?lang=en&segment=indicator&id=UNE_2EAP_SEX_AGE_GEO_RT_A": "src-ilo-unemployment",
    "https://www.dietquality.org/": "src-global-diet-quality-project",
  };
  if (known[normalized]) return known[normalized];
  const digest = createHash("sha1").update(normalized).digest("hex").slice(0, 10);
  return `src-external-${digest}`;
}

function addSource(row: SourceRow): string {
  if (!sourceRows.has(row.id)) sourceRows.set(row.id, row);
  return row.id;
}

function addExternalSource({
  url,
  name,
  owner,
  role,
  sourceKind,
  notes,
}: {
  url: string;
  name: string;
  owner: string;
  role: string;
  sourceKind: SourceRow["sourceKind"];
  notes: string;
}): string {
  const normalized = url.trim().replace(/^http:\/\//, "https://");
  return addSource({
    id: sourceIdFromUrl(normalized),
    name,
    sourceKind,
    role,
    owner,
    sourceClass: sourceKind === "underlying_primary" ? "dataset" : "secondary",
    citationReadiness: "citable_with_note",
    verificationStatus: "partially_verified",
    url: normalized,
    accessDate: ACCESS_DATE,
    license: normalized.includes("fao.org") ? "CC-BY-4.0 oppgitt for FAOSTAT; kontroller gjeldende vilkår før redistribusjon" : "Ikke fastslått i dette auditsteget",
    notes,
  });
}

async function sha256(path: string): Promise<string> {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

function addLocalSource({
  id,
  name,
  file,
  sourceClass,
  role,
  notes,
}: {
  id: string;
  name: string;
  file: string;
  sourceClass: string;
  role: string;
  notes: string;
}): Promise<string> {
  const path = resolve(ROOT, file);
  return sha256(path).then((contentHash) =>
    addSource({
      id,
      name,
      sourceKind: "internal",
      role,
      owner: "Food Systems 2026",
      sourceClass,
      citationReadiness: "internal_context",
      verificationStatus: "partially_verified",
      localPath: file,
      accessDate: ACCESS_DATE,
      contentHash,
      license: "Intern arbeidsmateriale; ikke ekstern publisering uten kilde- og rettighetskontroll",
      notes,
    }),
  );
}

function urlsFromCell(value: string | undefined): string[] {
  return [...new Set((value ?? "").match(/https?:\/\/[^;\s]+/g)?.map((url) => url.replace(/[),.]+$/, "")) ?? [])];
}

function numeric(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function year(value: unknown): number | null {
  const numberValue = numeric(value);
  return numberValue !== null && Number.isInteger(numberValue) ? numberValue : null;
}

function roundSignificant(value: number, significantFigures: number): number {
  if (!Number.isFinite(value) || value === 0) return value;
  const magnitude = Math.floor(Math.log10(Math.abs(value)));
  const decimalPlaces = significantFigures - magnitude - 1;
  const factor = 10 ** decimalPlaces;
  const rounded = Math.round((value + Math.sign(value) * Number.EPSILON * Math.abs(value)) * factor) / factor;
  return decimalPlaces > 0 ? Number(rounded.toFixed(decimalPlaces)) : rounded;
}

function displayValue(rawValue: number | null, significantFigures: number | null): string | null {
  if (rawValue === null) return null;
  if (!significantFigures || significantFigures < 1) return String(rawValue);
  const rounded = roundSignificant(rawValue, significantFigures);
  const magnitude = rounded === 0 ? 0 : Math.floor(Math.log10(Math.abs(rounded)));
  const decimalPlaces = Math.max(significantFigures - magnitude - 1, 0);
  return decimalPlaces > 0 ? rounded.toFixed(decimalPlaces) : String(rounded);
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function metadataFor(profileName: string, metadata: Map<string, CsvRow>): CsvRow | undefined {
  const aliases: Record<string, string> = {
    "Civil society participation index": "Core civil society index",
    "Legal recognition of the right to food": "Degree of legal recognition of the right to food",
    "Fruit availability": "Availability of fruits",
    "Vegetable availability": "Availability of vegetables",
    "Food systems greenhouse gas emissions": "Agri-food systems greenhouse gas emissions",
    "Food systems greenhouse gas emissions change": "Agri-food systems greenhouse gas emissions",
    "Greenhouse gas emissions intensity for milk": "Greenhouse gas emissions intensity for cow's milk",
    "Zero fruit or vegetable consumption for adults": "Age 15+: Zero vegetable or fruit consumption",
    "Zero fruit or vegetable consumption for children": "Children (6-23 months): Zero vegetable or fruit consumption",
    "Unemployment": "Unemployment rate",
    "Population who cannot afford a healthy diet": "Percent of the population who cannot afford a healthy diet",
  };
  const exact = metadata.get(profileName);
  if (exact) return exact;
  return metadata.get(aliases[profileName] ?? "");
}

function internalMatch(input: Omit<InternalMatch, "provenanceStatus"> & { provenanceStatus?: string }): InternalMatch {
  return { provenanceStatus: "internal_primary", ...input };
}

function baseMatch(sourceRef: string, file: string, dataset: string, metricKey: string, value: number | null, unit: string, yearValue: number | null, definition: string, notes?: string): InternalMatch {
  return internalMatch({ file, dataset, metricKey, value, unit, year: yearValue, geography: "Norway", definition, sourceRef, notes });
}

function crosswalkFor(
  indicator: AnyRecord,
  internal: {
    ssb: AnyRecord;
    valueChain: AnyRecord;
    trade: AnyRecord;
    chart: AnyRecord;
    flows: AnyRecord;
    refs: Record<string, string>;
  },
): {
  comparisonStatus: ComparisonStatus;
  internalMatches: InternalMatch[];
  numericDifference: number | null;
  differenceReason: string;
  disposition: Disposition;
  nextAction: string;
} {
  const year2023 = 2023;
  const valueChainYear = internal.valueChain.year ?? 2024;
  const no = internal.refs;
  const name = indicator.name as string;

  if (name === "Fruit availability") {
    return {
      comparisonStatus: "same_theme_different_measure",
      internalMatches: [
        baseMatch(no.valueChain, "public/data/food-systems/no/value-chain.json", "no_value_chain", "steps.primary.breakdown.fruit_veg_breakdown.fruit", 25576, "tonnes", valueChainYear, "Intern registrert norsk fruktproduksjon; måler innenlandsk produksjon, ikke matforsyningstilgjengelighet."),
        baseMatch(no.ssb, "public/data/food-systems/ssb_landbruk_2024.json", "ssb_landbruk_2024", "production.self_sufficiency_2023.fruit", 4, "%", year2023, "Selvforsyningsgrad for frukt basert på kalorier; norsk del av forbruket.", "0,04 som andel i JSON er projisert til 4 prosentpoeng."),
      ],
      numericDifference: null,
      differenceReason: "FSD måler tilgjengelig mengde fra nasjonal matbalanse (produksjon + import + lager minus anvendelser) i g/capita/day. Våre tall måler produksjon og selvforsyning; geografi/år er delvis sammenfallende, men enhet og denominator er ikke det.",
      disposition: "dual_series",
      nextAction: "Behold FSD som tilgjengelighetsserie og bruk NIBIO/SSB selvforsyning separat; kontroller FAOSTAT Food Balance Sheet mot norsk primærserie før eventuell import.",
    };
  }

  if (name === "Vegetable availability") {
    return {
      comparisonStatus: "same_theme_different_measure",
      internalMatches: [
        baseMatch(no.valueChain, "public/data/food-systems/no/value-chain.json", "no_value_chain", "steps.primary.breakdown.fruit_veg_breakdown.vegetables", 184445, "tonnes", valueChainYear, "Intern registrert norsk grønnsaksproduksjon; ikke nasjonal tilgjengelighet."),
        baseMatch(no.ssb, "public/data/food-systems/ssb_landbruk_2024.json", "ssb_landbruk_2024", "production.self_sufficiency_2023.vegetables", 49, "%", year2023, "Selvforsyningsgrad for grønnsaker basert på kalorier."),
      ],
      numericDifference: null,
      differenceReason: "FSDs 401,04 g/capita/day er matbalanse-tilgjengelighet, mens intern 49 % er selvforsyning. De kan ikke subtraheres eller konverteres uten felles denominator og metode.",
      disposition: "dual_series",
      nextAction: "Primærkontroller FAOSTAT Food Balances og NIBIO/SSB før en eventuell samlet norsk matmiljøserie.",
    };
  }

  if (name === "Food supply variability") {
    return {
      comparisonStatus: "blocked_source",
      internalMatches: [
        baseMatch(no.flows, "public/data/food-systems/no/flows.json", "norway_flow_prototype", "flows[].value", null, "illustrative weight", 2024, "Prototypeflyt for visualisering; verdiene er ikke observerte tonn, kroner eller frekvens.", "Må aldri brukes som empirisk matforsyningsvariabilitet."),
      ],
      numericDifference: null,
      differenceReason: "FSD-indikatoren er beregnet standardavvik i kcal/capita/day over foregående fem år. Intern flows.json er eksplisitt illustrativ og har ikke samme måleenhet, observasjonsstatus eller tidsserie.",
      disposition: "no_import",
      nextAction: "Ikke importer. Skaff en femårig FAOSTAT Food Supply-serie eller norsk primærserie dersom resiliensindikatoren skal bygges.",
    };
  }

  if (name === "Food price volatility") {
    return {
      comparisonStatus: "same_theme_different_measure",
      internalMatches: [
        baseMatch(no.ssb, "public/data/food-systems/ssb_landbruk_2024.json", "ssb_landbruk_2024", "economics.cpi_food_oct24_oct25", 3.1, "% change", 2025, "Års-/periodeendring i mat-KPI, ikke volatilitetsstandardavvik."),
      ],
      numericDifference: null,
      differenceReason: "FSD måler prisvolatilitet med en modellert/avledet variasjonsindikator; intern 3,1 % er en bestemt mat-KPI-periode. Samme tema, ulik statistikk.",
      disposition: "dual_series",
      nextAction: "Behold begge med tydelige definisjoner; hent FSD/FAOSTAT-beregningen før kvantitativ sammenligning.",
    };
  }

  const yieldMap: Record<string, { key: string; value: number; definition: string }> = {
    "Fruit yield": { key: "steps.primary.breakdown.fruit_veg_tonnes", value: 25576, definition: "Intern fruktproduksjon i tonn; volum, ikke avling per hektar." },
    "Vegetable yield": { key: "steps.primary.breakdown.fruit_veg_tonnes", value: 184445, definition: "Intern grønnsaksproduksjon i tonn; volum, ikke avling per hektar." },
    "Cereals yield": { key: "steps.primary.breakdown.grain_tonnes", value: 1183800, definition: "Intern kornproduksjon i tonn; volum, ikke avling per hektar." },
    "Cow's milk yield": { key: "steps.primary.breakdown.milk_tonnes", value: 1524400, definition: "Intern melkeproduksjon i tonn; volum, ikke yield per dyr." },
    "Beef yield": { key: "steps.primary.breakdown.meat_breakdown.beef", value: 86090, definition: "Intern storfekjøttproduksjon i tonn; volum, ikke kg per dyr." },
  };
  const yieldEntry = yieldMap[name];
  if (yieldEntry) {
    return {
      comparisonStatus: "same_theme_different_measure",
      internalMatches: [baseMatch(no.trade, "public/data/food-systems/trade_volumes_2024.json", "trade_volumes_2024", `domestic_production.${yieldEntry.key.split(".").pop()}`, yieldEntry.value, "tonnes", 2024, yieldEntry.definition)],
      numericDifference: null,
      differenceReason: "FSD er FAOSTAT-avling per hektar eller per dyr for siste tilgjengelige år. Intern verdi er total norsk produksjon i tonn og mangler felles denominator.",
      disposition: "dual_series",
      nextAction: "Bruk FSD som effektivitet/yield-referanse; bruk intern produksjon som volumserie. Ikke differensier tallene.",
    };
  }

  if (name.includes("greenhouse gas emissions") || name.includes("Greenhouse gas emissions intensity")) {
    return {
      comparisonStatus: "no_match",
      internalMatches: [
        baseMatch(no.sustainability, "prisma/seed-data/sustainability-country-metrics.ts", "sustainability_country_metrics", "Norway-specific GHG row", null, indicator.unit ?? null, indicator.endYear ?? null, "Intern seed har relaterte nordiske klima-/landbruksmetrikker, men ingen verifisert Norge-rad med samme FSD-scope.", "Ikke en nullobservasjon; uttrykker at intern match ikke er etablert."),
      ],
      numericDifference: null,
      differenceReason: "FSD bruker FAOSTAT food-system/agri-food scope eller farm-gate intensity. Intern klimadekning er enten et annet scope eller andre nordiske land; ingen legitim norsk differanse.",
      disposition: "needs_primary_check",
      nextAction: "Primærkontroller FAOSTAT GT/EI og avgrens mot norsk utslippsregnskap før en eventuell intern Norge-serie.",
    };
  }

  if (name === "Cost of a healthy diet" || name === "Population who cannot afford a healthy diet") {
    return {
      comparisonStatus: "complementary_only",
      internalMatches: [
        baseMatch(no.sustainability, "prisma/seed-data/sustainability-country-metrics.ts", "sustainability_country_metrics", "Nordic Nutrition Recommendations diet targets", null, indicator.unit ?? null, null, "Interne NNR-/kostholdsreferanser gir mål eller anbefalinger, ikke FSDs PPP-kostnad eller fordelingsestimat."),
      ],
      numericDifference: null,
      differenceReason: "FSD er en internasjonalt sammenlignbar affordability-modell i PPP-dollar eller et estimat av befolkningsandel; våre kostholdsdata er normative/tematiske og har ingen legitim norsk differanse.",
      disposition: "external_reference_only",
      nextAction: "Bruk som ekstern benchmark; vurder norsk husholdningsbudsjett/forbruksundersøkelse som primærkontroll før import.",
    };
  }

  if (name === "Ultra-processed food sales") {
    return {
      comparisonStatus: "no_match",
      internalMatches: [],
      numericDifference: null,
      differenceReason: "Ingen intern norsk serie med samme salgsdefinisjon, klassifisering og USD/capita-denominator er funnet i dette passet.",
      disposition: "external_reference_only",
      nextAction: "Avklar NOVA-/produktklassifisering og norsk salgs-/forbruksprimærkilde før import.",
    };
  }

  return {
    comparisonStatus: "no_match",
    internalMatches: [],
    numericDifference: null,
    differenceReason: "Ingen intern norsk datapunkt med samsvarende begrep, geografi, periode, enhet, denominator og metode er funnet i dette auditpasset.",
    disposition: indicator.rawValue === null ? "needs_primary_check" : "external_reference_only",
    nextAction: indicator.rawValue === null ? "Finn eller dokumenter eierkilde og manglende norsk observasjon før videre bruk." : "Behold som FSD-ekstern referanse inntil intern primærkilde er identifisert.",
  };
}

function internalConflictRows(internal: { ssb: AnyRecord; valueChain: AnyRecord; chart: AnyRecord; refs: Record<string, string> }) {
  const no = internal.refs;
  const row = (input: AnyRecord) => ({
    sourceType: "internal_audit",
    ...input,
  });
  return [
    row({
      id: "crosswalk-internal-conflict-self-sufficiency-no",
      fsdIndicatorId: null,
      indicatorName: "Intern kontroll: norsk selvforsyning",
      comparisonStatus: "internal_conflict" as const,
      internalMatches: [
        baseMatch(no.ssb, "public/data/food-systems/ssb_landbruk_2024.json", "ssb_landbruk_2024", "production.self_sufficiency_2023.calories", 44, "%", 2023, "Kaloribasert selvforsyning i chart-/SSB-datasettet."),
        baseMatch(no.valueChain, "public/data/food-systems/no/value-chain.json", "no_value_chain", "selfSufficiency.caloric_pct", 41.3, "%", 2024, "Nyere NIBIO-baserte totalserie, inkl. fisk."),
        baseMatch(no.valueChain, "public/data/food-systems/no/value-chain.json", "no_value_chain", "selfSufficiency.feed_corrected_pct", 34.9, "%", 2024, "NIBIO-baserte selvforsyning korrigert for importert kraftfôr; ikke fiskefôr."),
      ],
      numericDifference: null,
      differenceReason: "44 % er 2023-serien i ssb_landbruk/chart; 41,3 % og 34,9 % er 2024 value-chain-serier med annen kilde-/scopebeskrivelse. 34,9 % er feed-korrigert og skal ikke avrundes inn i 41,3 %.",
      disposition: "needs_primary_check" as const,
      nextAction: "Velg ikke kanonisk verdi ennå. Reproduser NIBIO/SSB-beregningen, dokumenter fisk-/fôrbehandling og versjoner seriene separat.",
      internalConflictKey: "self_sufficiency_no",
    }),
    row({
      id: "crosswalk-internal-conflict-market-hhi-no",
      fsdIndicatorId: null,
      indicatorName: "Intern kontroll: dagligvarekonsentrasjon",
      comparisonStatus: "internal_conflict" as const,
      internalMatches: [
        baseMatch(no.chart, "public/data/food-systems/no/chart-metrics.json", "chart_metrics_no", "parentCompany.parentHHI", 3445, "HHI index", 2024, "HHI beregnet på butikkantall/OSM-kjedeattribusjon."),
        baseMatch(no.valueChain, "public/data/food-systems/no/value-chain.json", "no_value_chain", "steps.retail.concentration.hhi", 3327, "HHI index", 2024, "HHI beregnet på omsetningsandeler fra Konkurransetilsynets dagligvarerapport."),
      ],
      numericDifference: 118,
      differenceReason: "3445 − 3327 = 118, men differansen er ikke en tidsendring: denominatoren er butikkantall versus omsetningsandel. HHI-tallene er derfor ikke samme indikator.",
      disposition: "needs_primary_check" as const,
      nextAction: "Bruk 3327 som omsetnings-HHI og 3445 som butikkantalls-HHI med eksplisitt etikett; ikke publiser én som erstatning for den andre.",
      internalConflictKey: "market_concentration_hhi_no",
    }),
    row({
      id: "crosswalk-internal-conflict-food-waste-no",
      fsdIndicatorId: null,
      indicatorName: "Intern kontroll: matsvinn",
      comparisonStatus: "internal_conflict" as const,
      internalMatches: [
        baseMatch(no.ssb, "public/data/food-systems/ssb_landbruk_2024.json", "ssb_landbruk_2024", "food_waste_2024.total_edible_tonnes", 390000, "tonnes edible", 2024, "Spiselig matsvinn-estimat med kategorifordeling; kilden beskriver begrensninger."),
        baseMatch(no.valueChain, "public/data/food-systems/no/value-chain.json", "no_value_chain", "food_waste_by_category.summary.norway_total_food_waste_2023_tonnes", 451600, "tonnes", 2023, "Value-chain/NORSUS/Matvett/Nordic estimate with broader stated scope and year."),
        baseMatch(no.valueChain, "public/data/food-systems/no/value-chain.json", "no_value_chain", "steps.waste.total_waste_tonnes", 407100, "tonnes", 2024, "Separat value-chain step total; scope not identical to the summary estimate."),
      ],
      numericDifference: 61600,
      differenceReason: "451 600 − 390 000 = 61 600 tonn, men år, avgrensning (spiselig versus total/estimert) og metode er ikke like. 407 100 tonn er i tillegg en separat value-chain-baseline.",
      disposition: "needs_primary_check" as const,
      nextAction: "Lås scopeordliste (spiselig/total, år, ledd), hent Matvett/NORSUS-tabellene og hold alle serier separate til reconciliert.",
      internalConflictKey: "food_waste_no",
    }),
    row({
      id: "crosswalk-internal-conflict-illustrative-flows-no",
      fsdIndicatorId: null,
      indicatorName: "Intern kontroll: illustrerte verdikjedestrømmer",
      comparisonStatus: "blocked_source" as const,
      internalMatches: [baseMatch(no.flows, "public/data/food-systems/no/flows.json", "norway_flow_prototype", "flows[].value", null, "illustrative weight", 2024, "Illustrert prototypevekt; ikke observert tonn, kroner eller handelsvolum.", "observedOrEstimated=illustrative; confidence=low." )],
      numericDifference: null,
      differenceReason: "Visualiseringsvekter har ikke empirisk enhet eller fullstendig observasjonsgrunnlag.",
      disposition: "no_import" as const,
      nextAction: "Hold utenfor alle kvantitative benchmarker og eksporterte datapunkter.",
      internalConflictKey: "illustrative_flows_no",
    }),
  ];
}

function markdownTable(rows: AnyRecord[], columns: Array<[string, (row: AnyRecord) => string]>): string {
  const header = `| ${columns.map(([label]) => label).join(" | ")} |`;
  const divider = `| ${columns.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${columns.map(([, value]) => value(row).replace(/\|/g, "\\|")).join(" | ")} |`).join("\n");
  return `${header}\n${divider}\n${body}`;
}

async function main() {
  const profile = JSON.parse(await readFile(resolve(SNAPSHOT_DIR, "norway-fsd-profile-2026-08-10.json"), "utf8"));
  const metadataRows = parseCsv(await readFile(resolve(SNAPSHOT_DIR, "fsd-metadata-export-2026-04-20.csv"), "utf8"));
  const snapshotManifest = JSON.parse(
    await readFile(resolve(LANDSCAPE_DIR, "norway-fsd-snapshot-manifest-2026-08-10.json"), "utf8"),
  ) as { sources: FullExportManifest[] };
  const manifest = snapshotManifest.sources.find((source) => source.id === "fsd-full-export-2026-04-20");
  if (!manifest) throw new Error("FSD snapshot manifest mangler full export");
  const fullExportPath = resolve(ROOT, manifest.compressedPath);
  const fullExport = parseCsv(
    readVerifiedGzipSnapshot(fullExportPath, manifest.compressedSha256, manifest.rawSha256).toString("utf8"),
  );
  const metadata = new Map(metadataRows.map((row) => [row.Name, row]));
  const fullNorway = fullExport.filter((row) => row.ISO3 === "NOR");

  const ssb = JSON.parse(await readFile(resolve(ROOT, "public/data/food-systems/ssb_landbruk_2024.json"), "utf8"));
  const valueChain = JSON.parse(await readFile(resolve(ROOT, "public/data/food-systems/no/value-chain.json"), "utf8"));
  const trade = JSON.parse(await readFile(resolve(ROOT, "public/data/food-systems/trade_volumes_2024.json"), "utf8"));
  const chart = JSON.parse(await readFile(resolve(ROOT, "public/data/food-systems/no/chart-metrics.json"), "utf8"));
  const flows = JSON.parse(await readFile(resolve(ROOT, "public/data/food-systems/no/flows.json"), "utf8"));

  const refs = {
    fsdProfile: addSource({
      id: "src-fsd-norway-profile",
      name: "Food Systems Dashboard – Norway profile",
      sourceKind: "fsd_dashboard",
      role: "rendered country profile and displayed benchmark status",
      owner: "Food Systems Dashboard",
      sourceClass: "secondary",
      citationReadiness: "citable_with_note",
      verificationStatus: "verified",
      url: FSD_PROFILE_URL,
      localPath: "research/landscape/snapshots/norway-fsd-profile-2026-08-10.json",
      accessDate: ACCESS_DATE,
      contentHash: await sha256(resolve(SNAPSHOT_DIR, "norway-fsd-profile-2026-08-10.json")),
      license: "FSD-/underliggende datakildevilkår må kontrolleres per indikator",
      notes: "Snapshot av renderte Norway-indikatorer; FSD benchmark-status er avledet fra profilens avstandskategori.",
    }),
    fsdMethodology: addExternalSource({ url: FSD_METHODOLOGY_URL, name: "FSD Data Sources and Methodology", owner: "Food Systems Dashboard", role: "metadata, calculation, missing-data and benchmark method", sourceKind: "fsd_dashboard", notes: "Metode- og kildebeskrivelse for dashboardet." }),
    fsdDownloads: addExternalSource({ url: FSD_DOWNLOADS_URL, name: "FSD Downloads", owner: "Food Systems Dashboard", role: "download instructions and citation guidance", sourceKind: "fsd_dashboard", notes: "FSDs egen anbefaling om å sitere underliggende primærkilde og FSD." }),
    fsdFull: addSource({
      id: "src-fsd-full-export-2026-04-20",
      name: "FSD full data export 2026-04-20",
      sourceKind: "fsd_export",
      role: "full indicator-country-year export",
      owner: "Food Systems Dashboard",
      sourceClass: "dataset",
      citationReadiness: "citable_with_note",
      verificationStatus: "verified",
      url: "https://d3e9iu03zzh17w.cloudfront.net/bulk-data-downloads/fsd-full-export-2026-04-20.csv",
      localPath: manifest.compressedPath,
      accessDate: ACCESS_DATE,
      contentHash: manifest.compressedSha256,
      license: "FSD-/underliggende datakildevilkår må kontrolleres per indikator",
      notes: `Eksportfilen er datert ${SNAPSHOT_DATE}; lokalt snapshot hentet ${ACCESS_DATE}. Komprimert SHA-256 ${manifest.compressedSha256}; rå SHA-256 ${manifest.rawSha256}.`,
    }),
    fsdMetadata: addSource({
      id: "src-fsd-metadata-export-2026-04-20",
      name: "FSD metadata export 2026-04-20",
      sourceKind: "fsd_export",
      role: "indicator definitions, relevance, calculation and missing-value metadata",
      owner: "Food Systems Dashboard",
      sourceClass: "dataset",
      citationReadiness: "citable_with_note",
      verificationStatus: "verified",
      url: "https://d3e9iu03zzh17w.cloudfront.net/bulk-data-downloads/fsd-metadata-export-2026-04-20.csv",
      localPath: "research/landscape/snapshots/fsd-metadata-export-2026-04-20.csv",
      accessDate: ACCESS_DATE,
      contentHash: await sha256(resolve(SNAPSHOT_DIR, "fsd-metadata-export-2026-04-20.csv")),
      license: "FSD-/underliggende datakildevilkår må kontrolleres per indikator",
      notes: `Eksportfilen er datert ${SNAPSHOT_DATE}; lokalt snapshot hentet ${ACCESS_DATE}.`,
    }),
    ssb: await addLocalSource({ id: "src-internal-ssb-landbruk-2024", name: "Intern SSB/Landbruksdirektoratet/Matvett datasett", file: "public/data/food-systems/ssb_landbruk_2024.json", sourceClass: "internal_primary", role: "Norway production, self-sufficiency, market and food-waste baseline", notes: "DATA-SOURCES.md sier at selvforsyning er kalenderåret 2023 og matsvinnfordelingen er estimert." }),
    valueChain: await addLocalSource({ id: "src-internal-value-chain-no", name: "Intern Norway value-chain baseline", file: "public/data/food-systems/no/value-chain.json", sourceClass: "internal_synthesis", role: "Norway value-chain synthesis and conflict register", notes: "Beholder eksplisitte scope-, quality- og needs-primary-check-notater." }),
    trade: await addLocalSource({ id: "src-internal-trade-volumes-2024", name: "Intern trade volumes 2024", file: "public/data/food-systems/trade_volumes_2024.json", sourceClass: "internal_primary", role: "Norway domestic production/import/export baseline", notes: "Kombinerer SSB utenrikshandel, Sjømatrådet og Landbruksdirektoratet; kategorier kan være aggregert." }),
    chart: await addLocalSource({ id: "src-internal-chart-metrics-no", name: "Intern Norway chart metrics", file: "public/data/food-systems/no/chart-metrics.json", sourceClass: "internal_construct", role: "store-count-derived market structure metrics", notes: "HHI 3445 er butikkantallsbasert og skal ikke blandes med omsetnings-HHI 3327." }),
    flows: await addLocalSource({ id: "src-internal-flows-no", name: "Intern Norway flow prototype", file: "public/data/food-systems/no/flows.json", sourceClass: "internal_construct", role: "illustrative value-chain flow visualization", notes: "Verdier er illustrative, low confidence og ikke observerte tonn/kroner/frekvens." }),
    sustainability: await addLocalSource({ id: "src-internal-sustainability-country-metrics", name: "Intern sustainability country metrics seed", file: "prisma/seed-data/sustainability-country-metrics.ts", sourceClass: "internal_synthesis", role: "Nordic sustainability metric definitions and staged rows", notes: "Ikke endret; brukes kun til å vise at en tilsvarende verifisert norsk GHG-rad ikke er etablert." }),
  };

  const sourceUrlsByIndicator = new Map<string, string[]>();
  const indicatorRows: AnyRecord[] = [];
  const crosswalkRows: AnyRecord[] = [];

  for (const indicator of profile.indicators as AnyRecord[]) {
    const metadataRow = metadataFor(indicator.name, metadata);
    const sourceUrls = urlsFromCell(metadataRow?.["Source URL"]);
    sourceUrlsByIndicator.set(String(indicator.fsdIndicatorId), sourceUrls);
    const primaryRefs = sourceUrls.map((url) => addExternalSource({
      url,
      name: metadataRow?.Source ?? "FSD underliggende kilde",
      owner: metadataRow?.Source ?? "FSD underliggende kilde",
      role: "underlying source named by FSD metadata",
      sourceKind: "underlying_primary",
      notes: "FSD metadata er primær kobling; råverdien er ikke automatisk godkjent som direkte primærkildeobservasjon.",
    }));
    const fullDataRows = fullNorway.filter((row) => row.Indicator === (metadataRow?.Name ?? indicator.name));
    const latestFull = fullDataRows.find((row) => year(row["End Year"]) === indicator.endYear) ?? fullDataRows.at(-1);
    const rawValue = numeric(indicator.rawValue);
    const status = crosswalkFor(indicator, { ssb, valueChain, trade, chart, flows, refs: { ssb: refs.ssb, valueChain: refs.valueChain, trade: refs.trade, chart: refs.chart, flows: refs.flows, sustainability: refs.sustainability } });
    const benchmarkValue = indicator.benchmarkGlobal?.achievedValue ?? indicator.benchmarkTarget?.achievedValue ?? null;
    const benchmarkType = indicator.benchmarkGlobal ? "global_benchmark_quartile" : indicator.benchmarkTarget ? "global_target_or_quartile" : "none";
    const license = (indicator.additionalInformation ?? "").includes("CC-BY-4.0") || primaryRefs.some((ref) => ref.startsWith("src-faostat"))
      ? "CC-BY-4.0 oppgitt/indikert for underliggende FAOSTAT; verifiser per datasett"
      : "Ikke oppgitt i FSD-metadata; avklar før redistribusjon";
    const row = {
      id: `fsd-nor-${indicator.fsdIndicatorId}`,
      fsdIndicatorId: indicator.fsdIndicatorId,
      name: indicator.name,
      slug: indicator.slug ?? slug(indicator.name),
      theme: indicator.fsciTheme,
      domain: indicator.fsciDomain,
      rawValue,
      displayValue: displayValue(rawValue, numeric(indicator.significantFigures)),
      displayValueRule: "Avledet med FSD significantFigures når feltet finnes; råverdi beholdes separat og skal brukes i beregninger.",
      significantFigures: numeric(indicator.significantFigures),
      unit: indicator.unit,
      unitStatus: indicator.unit ? "provided_by_fsd" : "not_provided_by_fsd",
      geographyScope: "Norway national profile (ISO3 NOR)",
      startYear: year(indicator.startYear),
      endYear: year(indicator.endYear),
      dimensions: indicator.dimensions,
      definition: indicator.definition,
      relevance: indicator.relevance,
      calculation: indicator.calculation,
      missingDataTreatment: indicator.treatmentOfMissingValues,
      dataAvailability: rawValue === null ? "insufficient_data_in_norway_profile" : "observed_or_reported_value_in_snapshot",
      isProjection: Boolean(indicator.isProjection),
      benchmarkValue,
      benchmarkType,
      benchmarkStatus: indicator.benchmarkStatus,
      benchmarkStatusRaw: indicator.benchmarkStatusRaw,
      benchmarkStatusInterpretation: "Avledet fra FSD-profilens global-benchmark distanceCategory; ikke et norsk datapunkt.",
      primarySourceRefs: primaryRefs,
      fsdSourceRefs: [refs.fsdProfile, refs.fsdMetadata, refs.fsdFull, refs.fsdMethodology],
      recommendedCitation: `Food Systems Dashboard, ${indicator.name}, Norway, accessed ${ACCESS_DATE}; cite underlying source ${metadataRow?.Source ?? "as named in FSD metadata"} and FSD DOI https://doi.org/10.36072/db.`,
      license,
      snapshotUrl: FSD_PROFILE_URL,
      accessDate: ACCESS_DATE,
      contentHash: await sha256(resolve(SNAPSHOT_DIR, "norway-fsd-profile-2026-08-10.json")),
      metadataSourceName: metadataRow?.Source ?? null,
      metadataSourceUrl: sourceUrls,
      fullExportIndicatorName: latestFull?.Indicator ?? null,
      fullExportLatestYear: year(latestFull?.["End Year"]),
      evidenceStatus: rawValue === null || primaryRefs.length === 0 ? "needs_review" : "machine_verified",
      citationReadiness: primaryRefs.length > 0 ? "citable_with_note" : "blocked_unsourced",
      primaryCheckStatus: primaryRefs.length > 0 ? "not_required_for_locator" : "needs_primary_check",
      nextAction: status.nextAction,
    };
    indicatorRows.push(row);
    crosswalkRows.push({
      id: `crosswalk-fsd-nor-${indicator.fsdIndicatorId}`,
      fsdIndicatorId: indicator.fsdIndicatorId,
      indicatorName: indicator.name,
      fsdRegisterId: row.id,
      internalMatches: status.internalMatches,
      comparisonStatus: status.comparisonStatus,
      numericDifference: status.numericDifference,
      differenceReason: status.differenceReason,
      disposition: status.disposition,
      nextAction: status.nextAction,
      comparisonRule: "Ingen numerisk matching uten begrep, definisjon, geografi, periode, enhet, denominator og metode-samsvar.",
    });
  }

  const conflicts = internalConflictRows({ ssb, valueChain, chart, refs: { ssb: refs.ssb, valueChain: refs.valueChain, chart: refs.chart, flows: refs.flows } });
  crosswalkRows.push(...conflicts);

  const jsonl = (rows: AnyRecord[]) => `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`;
  const indicatorPath = resolve(LANDSCAPE_DIR, "norway-fsd-indicators-2026-08-10.jsonl");
  const crosswalkPath = resolve(LANDSCAPE_DIR, "norway-fsd-crosswalk-2026-08-10.jsonl");
  const sourcePath = resolve(LANDSCAPE_DIR, "norway-fsd-source-ledger-2026-08-10.jsonl");
  await writeFile(indicatorPath, jsonl(indicatorRows), "utf8");
  await writeFile(crosswalkPath, jsonl(crosswalkRows), "utf8");
  await writeFile(sourcePath, jsonl([...sourceRows.values()]), "utf8");

  const comparisonCounts = Object.fromEntries([...new Set(crosswalkRows.map((row) => row.comparisonStatus))].map((status) => [status, crosswalkRows.filter((row) => row.comparisonStatus === status).length]));
  const dispositionCounts = Object.fromEntries([...new Set(crosswalkRows.map((row) => row.disposition))].map((disposition) => [disposition, crosswalkRows.filter((row) => row.disposition === disposition).length]));
  const missing = indicatorRows.filter((row) => row.rawValue === null);
  const recommended = crosswalkRows.filter((row) => ["reuse_internal", "dual_series", "candidate_import"].includes(row.disposition));
  const externalOnly = crosswalkRows.filter((row) => row.disposition === "external_reference_only");
  const noImport = crosswalkRows.filter((row) => row.disposition === "no_import");
  const auditSummary = { indicators: indicatorRows.length, indicatorCrosswalkRows: crosswalkRows.length - conflicts.length, internalControlRows: conflicts.length, sources: sourceRows.size, missingNorwayValues: missing.length, comparisonCounts, dispositionCounts };
  const report = `# Norge/FSD-indikatoraudit mot vårt eksisterende datagrunnlag

<!-- FSD_AUDIT_SUMMARY: ${JSON.stringify(auditSummary)} -->

**Tilgangsdato:** ${ACCESS_DATE}

**FSD-eksport snapshot:** ${SNAPSHOT_DATE}

**Omfang:** ${indicatorRows.length} indikatorer fra Norway-profilen, ${crosswalkRows.length - conflicts.length} indikator-krysskoblinger og ${conflicts.length} eksplisitte interne kontrollrader.

## Konklusjon

FSD Norway-profilen er en bred sammenstillings- og benchmarkflate, ikke én norsk primærstatistikk. Profilen viser **${profile.profileSummary.assessed} av ${indicatorRows.length} indikatorer vurdert**, mens **${profile.profileSummary.insufficientData} indikatorer mangler tilstrekkelige Norge-data**. Benchmark-statusen er FSDs avledede sammenligning mot globalt benchmark/target og skal ikke lagres som norsk observasjon.

In governance terms, this is an **external benchmark surface**, **not a Norwegian primary series**, and **not production data**.

Dette auditpasset finner ingen grunnlag for blind import. De mest nyttige videre seriene er enten:

- en **dual series** for FSDs matbalanse-tilgjengelighet versus vår produksjon/selvforsyning;
- en **ekstern referanse** for kostnad/affordability av sunt kosthold;
- en separat **primærkontroll** av FSD/FAOSTAT GHG-serier;
- en eksplisitt intern konfliktlogg for selvforsyning, HHI, matsvinn og illustrerte flyter.

## Hva Norway-profilen faktisk måler

Profilens 60 indikatorer fordeler seg over FSD-temaene Governance, Resilience, Diets, Nutrition, and Health, Environment, Natural Resources, and Production og Livelihoods, Poverty, and Equity. Den tilgjengelige Norge-profilen har ${profile.profileSummary.statusCounts.benchmarkMet} «Benchmark Met», ${profile.profileSummary.statusCounts.close} «Close», ${profile.profileSummary.statusCounts.moderatelyClose} «Moderately Close», ${profile.profileSummary.statusCounts.far} «Far» og ${profile.profileSummary.statusCounts.veryFar} «Very Far» blant de ${profile.profileSummary.assessed} vurderte.

Eksempler på målte størrelser:

${markdownTable(indicatorRows.filter((row) => [69, 889, 30, 32, 179, 109, 1103, 121, 124, 275].includes(row.fsdIndicatorId)), [
  ["FSD-indikator", (row) => row.name],
  ["Råverdi", (row) => row.rawValue === null ? "mangler" : String(row.rawValue)],
  ["Visning", (row) => row.displayValue ?? "mangler"],
  ["Enhet/år", (row) => `${row.unit ?? "uten enhet"} / ${row.endYear ?? "mangler"}`],
  ["Benchmark", (row) => row.benchmarkStatus],
])}

Råverdien og visningsverdien er lagret separat. For eksempel beholdes FSDs **4.55 PPP dollar/capita/day** som råverdi, mens visningsfeltet blir **4.6** etter den registrerte significant-figures-regelen. Visningsverdien skal aldri brukes i beregning eller differanse.

### Komplett indikatorliste

${markdownTable(indicatorRows, [
  ["Register-ID", (row) => row.id],
  ["FSD-ID", (row) => String(row.fsdIndicatorId)],
  ["Indikator", (row) => row.name],
  ["Tema", (row) => row.theme],
  ["Råverdi", (row) => row.rawValue === null ? "mangler" : String(row.rawValue)],
  ["Enhet/år", (row) => `${row.unit ?? "ikke oppgitt"} / ${row.endYear ?? "mangler"}`],
  ["Status", (row) => row.benchmarkStatus],
])}

## Overlapp mot vårt datagrunnlag

${markdownTable(crosswalkRows.filter((row) => ["Fruit availability", "Vegetable availability", "Food supply variability", "Food price volatility", "Fruit yield", "Vegetable yield", "Cereals yield", "Cost of a healthy diet", "Population who cannot afford a healthy diet"].includes(row.indicatorName)), [
  ["FSD-indikator", (row) => row.indicatorName],
  ["Status", (row) => row.comparisonStatus],
  ["Disposisjon", (row) => row.disposition],
  ["Hovedgrunn", (row) => row.differenceReason],
])}

FSD «Availability of fruits/vegetables» er den tydeligste tematiske overlappen, men ikke en eksakt overlapp: FSD måler nasjonal matbalanse-tilgjengelighet i gram per capita per dag, mens våre 4 % frukt og 49 % grønnsaker er selvforsyningsgrader og value-chain har produksjonston. Det er derfor riktig å beholde **dual_series**, ikke velge en vinner ved navnlikhet.

### Eksakt og delvis overlapp

Dette passet finner **ingen exact_overlap** og **ingen partial_overlap** blant de 60 FSD-indikatorene. De åtte relevante treffene er derfor klassifisert som **same_theme_different_measure**: de deler tema med våre norske serier, men mangler samsvar i enhet, denominator, scope eller målemetode. Det er en viktig negativ konklusjon: FSD-tallene kan ikke gjøres til «våre» tall ved ren navnematching.

## Interne konflikter som ikke skal skjules

${markdownTable(conflicts, [
  ["Kontroll", (row) => row.indicatorName],
  ["Status", (row) => row.comparisonStatus],
  ["Konflikt", (row) => row.differenceReason],
  ["Neste steg", (row) => row.nextAction],
])}

Spesielt:

- Selvforsyning er 44 % i eksisterende chart/SSB-data mot 41,3 % og 34,9 % i nyere value-chain-data. Dette er ikke en avrundingsfeil; år, kilde og fôr-/fiskescope må avklares.
- HHI 3445 er butikkantallsbasert, mens 3327 er omsetningsbasert. Differansen 118 er ikke en tidsserieendring.
- Matsvinn 390 000 tonn og 451 600 tonn har ulikt år og scope; 407 100 tonn ligger i tillegg som en separat value-chain-baseline.
- **flows.json** er en illustrativ prototype. Den kan ikke brukes som observerte tonn, kroner, handelsvolum eller frekvens.

## Rangering for videre bruk

Krysskoblingsstatusene er reproduserbare fra JSONL-registeret:

~~~json
${JSON.stringify({ comparisonCounts, dispositionCounts }, null, 2)}
~~~

Anbefalt praksis er:

1. **Ta videre som dual series:** frukt-/grønnsakstilgjengelighet mot intern selvforsyning/produksjon, og yield mot produksjonsvolum.
2. **Bruk eksternt:** cost of a healthy diet og population who cannot afford a healthy diet, inntil vi har norsk husholdnings-/forbruksprimærkilde med samme definisjon.
3. **Primærkontroller først:** FAOSTAT food-system GHG og intensitetsserier; ikke sammenlign med intern nordisk seed uten Norge- og scope-samsvar.
4. **Ikke importer:** FSD benchmark-status som norsk verdi, illustrerte flyter og råserier uten definisjon/denominator.

## Kilde- og lisensregler

FSD-siden, FSD metadataeksporten, FSD full dataeksporten, underliggende primærkilder og interne kilder ligger som separate rader i source ledger. FSDs egen nedlastingsveiledning sier at sitat bør peke til underliggende primærkilde, samtidig som FSD bør krediteres som distribusjonsflate. Dette auditsettet bruker derfor **citable_with_note** for FSD-aggregert materiale: direkte locator, tilgangsdato og hash finnes, men FSDs beregningslag og underliggende primærdata må fortsatt beskrives.

FAOSTAT-kilder er merket med lisensnotat om CC-BY-4.0 der dette er oppgitt, men lisens må kontrolleres per datasett før redistribusjon. Interne JSON/TS-filer er **internal_context**, ikke ekstern primærkilde.

## Datagap og neste primærkontroller

- Hent og arkiver FAOSTAT-uttrekk for Food Balances, Food Supply Variability, CAHD, GT og EI med samme Norge-år som FSD.
- Reproduser selvforsyningsseriene fra NIBIO/SSB og dokumenter inklusjon av fisk, importert kraftfôr og eventuell sjømateksportjustering.
- Reconciler matsvinn med eksplisitt scopeordliste (spiselig/total, husholdning/verdikjede, år).
- Hold omsetnings-HHI og butikkantalls-HHI som ulike metrikker, med hver sin kilde og denominator.
- Kontroller indikatorer med utilstrekkelige data før de eventuelt går fra **needs_primary_check** til **candidate_import**.

## Artefakter og reproduksjon

- Register: [norway-fsd-indicators-2026-08-10.jsonl](./norway-fsd-indicators-2026-08-10.jsonl)
- Krysskobling: [norway-fsd-crosswalk-2026-08-10.jsonl](./norway-fsd-crosswalk-2026-08-10.jsonl)
- Kildelog: [norway-fsd-source-ledger-2026-08-10.jsonl](./norway-fsd-source-ledger-2026-08-10.jsonl)
- Snapshotmanifest: [norway-fsd-snapshot-manifest-2026-08-10.json](./norway-fsd-snapshot-manifest-2026-08-10.json)
- Validering: **npm run landscape:norway-fsd:validate**

Ingen Prisma-, API- eller produksjonsdatabasefiler inngår i denne fasen.

### Eksterne metodereferanser

- [Food Systems Dashboard – Norway](https://www.foodsystemsdashboard.org/countries/nor)
- [FSD data sources and methodology](${FSD_METHODOLOGY_URL})
- [FSD downloads and citation guidance](${FSD_DOWNLOADS_URL})
- [FAOSTAT Cost and Affordability of a Healthy Diet](https://www.fao.org/faostat/en/#data/CAHD)
- [FAOSTAT Food Balance Sheets](https://www.fao.org/faostat/en/#data/FBS)
- [FAOSTAT GHG emissions totals](https://www.fao.org/faostat/en/#data/GT)
- [FAOSTAT GHG emissions intensity](https://www.fao.org/faostat/en/#data/EI)

_Rapporten er generert fra de tre JSONL-artiklene og kan kontrolleres med validatoren._
`;
  await writeFile(resolve(LANDSCAPE_DIR, "norway-fsd-report-2026-08-10.md"), report, "utf8");
  console.log(`Wrote ${indicatorRows.length} indicators, ${crosswalkRows.length} crosswalk rows and ${sourceRows.size} sources.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
