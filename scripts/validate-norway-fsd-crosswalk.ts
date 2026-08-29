import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { parseCsv, type CsvRow } from "./lib/parse-rfc4180.ts";
import { readVerifiedGzipSnapshot } from "./lib/snapshot-integrity.ts";

type JsonRecord = Record<string, any>;

type FullExportManifest = {
  id: string;
  compressedPath: string;
  compressedBytes: number;
  compressedSha256: string;
  rawBytes: number;
  rawSha256: string;
  compression: string;
};

export type NorwayFsdBundle = {
  root: string;
  directory: string;
  indicators: JsonRecord[];
  crosswalk: JsonRecord[];
  sources: JsonRecord[];
  report: string;
  manifest: FullExportManifest;
  snapshotSources: JsonRecord[];
  fullExport: CsvRow[];
};

export type NorwayFsdSummary = {
  indicators: number;
  crosswalk: number;
  sources: number;
};

const comparisonStatuses = new Set([
  "exact_overlap",
  "partial_overlap",
  "same_theme_different_measure",
  "internal_conflict",
  "complementary_only",
  "no_match",
  "blocked_source",
]);
const dispositions = new Set([
  "reuse_internal",
  "external_reference_only",
  "dual_series",
  "needs_primary_check",
  "candidate_import",
  "no_import",
]);
const benchmarkStatuses = new Set(["Benchmark Met", "Close", "Moderately Close", "Far", "Very Far", "No benchmark"]);
const rawBenchmarkStatuses = new Set(["target-met", "close", "moderately-close", "far", "very-far", null]);
const sourceKinds = new Set(["fsd_dashboard", "fsd_export", "underlying_primary", "internal"]);
const citationReadiness = new Set(["citable_external", "citable_with_note", "internal_context", "blocked_unsourced"]);
const evidenceStatuses = new Set(["verified", "partially_verified", "needs_review", "failed", "unverified", "machine_verified", "human_verified", "disputed", "rejected"]);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const hashPattern = /^[a-f0-9]{64}$/;

function fail(message: string): never {
  throw new Error(message);
}

function readJsonl(filePath: string): JsonRecord[] {
  if (!fs.existsSync(filePath)) fail(`Mangler fil: ${path.relative(process.cwd(), filePath)}`);
  return fs.readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .map((line, index) => ({ line: line.trim(), index: index + 1 }))
    .filter(({ line }) => line.length > 0)
    .map(({ line, index }) => {
      try {
        return JSON.parse(line) as JsonRecord;
      } catch (error) {
        fail(`${path.basename(filePath)}:${index} er ikke gyldig JSON: ${String(error)}`);
      }
    });
}

function assertString(value: unknown, label: string, minLength = 1): void {
  if (typeof value !== "string" || value.trim().length < minLength) fail(`${label} må være en tekststreng`);
}

function assertStringOrNull(value: unknown, label: string): void {
  if (value !== null && (typeof value !== "string" || value.trim().length === 0)) fail(`${label} må være tekst eller null`);
}

function assertNumberOrNull(value: unknown, label: string): void {
  if (value !== null && (typeof value !== "number" || !Number.isFinite(value))) fail(`${label} må være tall eller null`);
}

function assertYearOrNull(value: unknown, label: string): void {
  if (value !== null && (typeof value !== "number" || !Number.isInteger(value) || value < 1900 || value > 2100)) fail(`${label} må være årstall eller null`);
}

function assertDate(value: unknown, label: string): void {
  if (typeof value !== "string" || !datePattern.test(value)) fail(`${label} må være YYYY-MM-DD`);
}

function assertUrl(value: unknown, label: string): void {
  if (typeof value !== "string" || !/^https?:\/\/[^\s]+$/i.test(value)) fail(`${label} må være http(s)-URL`);
}

function assertArrayOfStrings(value: unknown, label: string): void {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.length === 0)) fail(`${label} må være en liste med tekststrenger`);
}

export function loadNorwayFsdBundle(directory: string): NorwayFsdBundle {
  const root = path.resolve(directory, "..", "..");
  const snapshotManifest = JSON.parse(
    fs.readFileSync(path.join(directory, "norway-fsd-snapshot-manifest-2026-08-10.json"), "utf8"),
  ) as { sources: JsonRecord[] };
  const manifest = snapshotManifest.sources.find((source) => source.id === "fsd-full-export-2026-04-20") as FullExportManifest | undefined;
  if (!manifest) fail("Snapshotmanifestet mangler FSD full export");
  assertString(manifest.compressedPath, "fullExport.compressedPath");
  if (manifest.compression !== "gzip -n -9") fail("FSD full export må bruke gzip -n -9");
  if (!Number.isInteger(manifest.compressedBytes) || manifest.compressedBytes < 1) fail("fullExport.compressedBytes må være positivt heltall");
  if (!Number.isInteger(manifest.rawBytes) || manifest.rawBytes < 1) fail("fullExport.rawBytes må være positivt heltall");
  if (!hashPattern.test(manifest.compressedSha256)) fail("fullExport.compressedSha256 må være SHA-256");
  if (!hashPattern.test(manifest.rawSha256)) fail("fullExport.rawSha256 må være SHA-256");
  const fullExportPath = path.resolve(root, manifest.compressedPath);
  const raw = readVerifiedGzipSnapshot(fullExportPath, manifest.compressedSha256, manifest.rawSha256);
  if (fs.statSync(fullExportPath).size !== manifest.compressedBytes) fail("FSD full export har feil komprimert byteantall");
  if (raw.byteLength !== manifest.rawBytes) fail("FSD full export har feil rått byteantall");
  const fullExport = parseCsv(raw.toString("utf8"));
  for (const source of snapshotManifest.sources.filter((source) => source.id !== manifest.id)) {
    assertString(source.localPath, `${source.id}.localPath`);
    if (!Number.isInteger(source.bytes) || source.bytes < 1) fail(`${source.id}.bytes må være positivt heltall`);
    if (!hashPattern.test(source.sha256)) fail(`${source.id}.sha256 må være SHA-256`);
    const contents = fs.readFileSync(path.resolve(root, source.localPath));
    if (contents.byteLength !== source.bytes) fail(`${source.id} har feil byteantall`);
    if (createHash("sha256").update(contents).digest("hex") !== source.sha256) fail(`${source.id} har feil SHA-256`);
  }

  return {
    root,
    directory,
    indicators: readJsonl(path.join(directory, "norway-fsd-indicators-2026-08-10.jsonl")),
    crosswalk: readJsonl(path.join(directory, "norway-fsd-crosswalk-2026-08-10.jsonl")),
    sources: readJsonl(path.join(directory, "norway-fsd-source-ledger-2026-08-10.jsonl")),
    report: fs.readFileSync(path.join(directory, "norway-fsd-report-2026-08-10.md"), "utf8"),
    manifest,
    snapshotSources: snapshotManifest.sources,
    fullExport,
  };
}

function roundSignificant(value: number, significantFigures: number): number {
  if (!Number.isFinite(value) || value === 0) return value;
  const magnitude = Math.floor(Math.log10(Math.abs(value)));
  const decimalPlaces = significantFigures - magnitude - 1;
  const factor = 10 ** decimalPlaces;
  const rounded = Math.round((value + Math.sign(value) * Number.EPSILON * Math.abs(value)) * factor) / factor;
  return decimalPlaces > 0 ? Number(rounded.toFixed(decimalPlaces)) : rounded;
}

function expectedDisplayValue(rawValue: number, significantFigures: number | null): string {
  if (!significantFigures || significantFigures < 1) return String(rawValue);
  const rounded = roundSignificant(rawValue, significantFigures);
  const magnitude = rounded === 0 ? 0 : Math.floor(Math.log10(Math.abs(rounded)));
  const decimalPlaces = Math.max(significantFigures - magnitude - 1, 0);
  return decimalPlaces > 0 ? rounded.toFixed(decimalPlaces) : String(rounded);
}

function validateSources(sources: JsonRecord[], root: string): Map<string, JsonRecord> {
  const sourceMap = new Map<string, JsonRecord>();
  for (const source of sources) {
    assertString(source.id, "source.id");
    if (sourceMap.has(source.id)) fail(`Duplikat source id: ${source.id}`);
    sourceMap.set(source.id, source);
    if (!sourceKinds.has(source.sourceKind)) fail(`${source.id} har ugyldig sourceKind ${source.sourceKind}`);
    assertString(source.name, `${source.id}.name`);
    assertString(source.role, `${source.id}.role`);
    assertString(source.owner, `${source.id}.owner`);
    assertString(source.sourceClass, `${source.id}.sourceClass`);
    if (!citationReadiness.has(source.citationReadiness)) fail(`${source.id} har ugyldig citationReadiness`);
    assertDate(source.accessDate, `${source.id}.accessDate`);
    if (source.contentHash !== undefined && !hashPattern.test(source.contentHash)) fail(`${source.id}.contentHash må være SHA-256`);
    if (source.url !== undefined) assertUrl(source.url, `${source.id}.url`);
    if (source.localPath !== undefined) {
      assertString(source.localPath, `${source.id}.localPath`);
      if (!fs.existsSync(path.join(root, source.localPath))) fail(`${source.id}.localPath peker ikke til eksisterende fil: ${source.localPath}`);
    }
    if (source.sourceKind === "underlying_primary" && source.url === undefined) fail(`${source.id} underliggende kilde mangler URL`);
    if (source.sourceKind === "fsd_export" && (!source.url || !source.localPath)) fail(`${source.id} FSD-eksport må ha URL og lokalt snapshot`);
    if (source.sourceKind === "internal" && !source.localPath) fail(`${source.id} intern kilde må ha localPath`);
  }
  return sourceMap;
}

function validateIndicators(indicators: JsonRecord[], sourceMap: Map<string, JsonRecord>): Set<number> {
  if (indicators.length !== 60) fail(`Forventet 60 FSD Norway-indikatorer, fikk ${indicators.length}`);
  const ids = new Set<number>();
  for (const indicator of indicators) {
    if (!/^fsd-nor-\d+$/.test(indicator.id)) fail(`Ugyldig indikator-id: ${indicator.id}`);
    if (typeof indicator.fsdIndicatorId !== "number" || !Number.isInteger(indicator.fsdIndicatorId)) fail(`${indicator.id} mangler numerisk fsdIndicatorId`);
    if (ids.has(indicator.fsdIndicatorId)) fail(`Duplikat FSD-indikator-ID: ${indicator.fsdIndicatorId}`);
    ids.add(indicator.fsdIndicatorId);
    for (const field of ["name", "slug", "theme", "definition", "displayValueRule", "geographyScope", "recommendedCitation", "nextAction"]) assertString(indicator[field], `${indicator.id}.${field}`);
    for (const field of ["relevance", "calculation", "missingDataTreatment"]) assertStringOrNull(indicator[field], `${indicator.id}.${field}`);
    if (!Object.prototype.hasOwnProperty.call(indicator, "unit")) fail(`${indicator.id} mangler unit-felt (null er tillatt når FSD ikke oppgir enhet)`);
    if (indicator.unit !== null && typeof indicator.unit !== "string") fail(`${indicator.id}.unit må være tekst eller null`);
    assertString(indicator.unitStatus, `${indicator.id}.unitStatus`);
    assertNumberOrNull(indicator.rawValue, `${indicator.id}.rawValue`);
    if (indicator.rawValue === null && indicator.displayValue !== null) fail(`${indicator.id} har displayValue selv om rawValue er null`);
    if (indicator.rawValue !== null && typeof indicator.displayValue !== "string") fail(`${indicator.id} må lagre displayValue som tekst separat fra rawValue`);
    assertNumberOrNull(indicator.significantFigures, `${indicator.id}.significantFigures`);
    if (indicator.rawValue !== null) {
      assertYearOrNull(indicator.startYear, `${indicator.id}.startYear`);
      assertYearOrNull(indicator.endYear, `${indicator.id}.endYear`);
      if (indicator.startYear === null || indicator.endYear === null) fail(`${indicator.id} numerisk datapunkt mangler periode`);
      const expected = expectedDisplayValue(indicator.rawValue, indicator.significantFigures);
      if (indicator.displayValue !== expected) fail(`${indicator.id} blander rå-/visningsverdi: forventet ${expected}, fikk ${indicator.displayValue}`);
    }
    assertYearOrNull(indicator.startYear, `${indicator.id}.startYear`);
    assertYearOrNull(indicator.endYear, `${indicator.id}.endYear`);
    assertNumberOrNull(indicator.benchmarkValue, `${indicator.id}.benchmarkValue`);
    if (!benchmarkStatuses.has(indicator.benchmarkStatus)) fail(`${indicator.id} har ugyldig benchmarkStatus ${indicator.benchmarkStatus}`);
    if (!rawBenchmarkStatuses.has(indicator.benchmarkStatusRaw)) fail(`${indicator.id} har ugyldig benchmarkStatusRaw`);
    assertArrayOfStrings(indicator.primarySourceRefs, `${indicator.id}.primarySourceRefs`);
    assertArrayOfStrings(indicator.fsdSourceRefs, `${indicator.id}.fsdSourceRefs`);
    for (const sourceRef of [...indicator.primarySourceRefs, ...indicator.fsdSourceRefs]) if (!sourceMap.has(sourceRef)) fail(`${indicator.id} peker til ukjent kilde ${sourceRef}`);
    if (indicator.primarySourceRefs.length === 0 && indicator.citationReadiness !== "blocked_unsourced") fail(`${indicator.id} uten primærkilde må være blocked_unsourced`);
    if (!citationReadiness.has(indicator.citationReadiness)) fail(`${indicator.id} har ugyldig citationReadiness`);
    if (!evidenceStatuses.has(indicator.evidenceStatus)) fail(`${indicator.id} har ugyldig evidenceStatus`);
    if (indicator.primaryCheckStatus !== (indicator.primarySourceRefs.length > 0 ? "not_required_for_locator" : "needs_primary_check")) fail(`${indicator.id} har feil primaryCheckStatus`);
    assertUrl(indicator.snapshotUrl, `${indicator.id}.snapshotUrl`);
    assertDate(indicator.accessDate, `${indicator.id}.accessDate`);
    if (indicator.accessDate !== "2026-08-10") fail(`${indicator.id} har feil tilgangsdato`);
    if (!hashPattern.test(indicator.contentHash)) fail(`${indicator.id}.contentHash må være SHA-256`);
    if (!Array.isArray(indicator.metadataSourceUrl) || indicator.metadataSourceUrl.some((url: unknown) => typeof url !== "string")) fail(`${indicator.id}.metadataSourceUrl må være liste`);
    for (const url of indicator.metadataSourceUrl) assertUrl(url, `${indicator.id}.metadataSourceUrl`);
  }
  return ids;
}

function validateInternalMatch(match: JsonRecord, label: string, sourceMap: Map<string, JsonRecord>, root: string): void {
  for (const field of ["file", "dataset", "metricKey", "geography", "definition", "sourceRef", "provenanceStatus"]) assertString(match[field], `${label}.${field}`);
  if (!fs.existsSync(path.join(root, match.file))) fail(`${label}.file finnes ikke: ${match.file}`);
  if (!sourceMap.has(match.sourceRef)) fail(`${label}.sourceRef peker til ukjent kilde ${match.sourceRef}`);
  assertNumberOrNull(match.value, `${label}.value`);
  assertYearOrNull(match.year, `${label}.year`);
  if (match.value !== null && (!match.unit || match.year === null)) fail(`${label} numerisk internverdi mangler unit eller year`);
}

function validateCrosswalk(crosswalk: JsonRecord[], indicatorIds: Set<number>, sourceMap: Map<string, JsonRecord>, root: string): void {
  const ids = new Set<string>();
  const covered = new Set<number>();
  for (const row of crosswalk) {
    assertString(row.id, "crosswalk.id");
    if (ids.has(row.id)) fail(`Duplikat crosswalk-id: ${row.id}`);
    ids.add(row.id);
    if (!comparisonStatuses.has(row.comparisonStatus)) fail(`${row.id} har ugyldig comparisonStatus ${row.comparisonStatus}`);
    if (!dispositions.has(row.disposition)) fail(`${row.id} har ugyldig disposition ${row.disposition}`);
    assertString(row.indicatorName, `${row.id}.indicatorName`);
    assertString(row.differenceReason, `${row.id}.differenceReason`);
    assertString(row.nextAction, `${row.id}.nextAction`);
    assertNumberOrNull(row.numericDifference, `${row.id}.numericDifference`);
    if (!Array.isArray(row.internalMatches)) fail(`${row.id}.internalMatches må være liste`);
    row.internalMatches.forEach((match: JsonRecord, index: number) => validateInternalMatch(match, `${row.id}.internalMatches[${index}]`, sourceMap, root));
    if (row.fsdIndicatorId === null) {
      if (row.sourceType !== "internal_audit") fail(`${row.id} uten FSD-ID må være internal_audit`);
      if (row.comparisonStatus === "internal_conflict" && !row.internalConflictKey) fail(`${row.id} internal_conflict mangler internalConflictKey`);
    } else {
      if (!indicatorIds.has(row.fsdIndicatorId)) fail(`${row.id} peker til ukjent FSD-indikator ${row.fsdIndicatorId}`);
      if (covered.has(row.fsdIndicatorId)) fail(`FSD-indikator ${row.fsdIndicatorId} har mer enn én hovedkrysskobling`);
      covered.add(row.fsdIndicatorId);
    }
    if (row.comparisonStatus === "internal_conflict" && (!row.differenceReason || !row.nextAction)) fail(`${row.id} intern konflikt mangler forklaring eller neste handling`);
    if (row.disposition === "candidate_import" && (row.production === true || row.target === "production" || row.productionData === true)) fail(`${row.id} candidate_import er merket som produksjonsdata`);
  }
  if (covered.size !== indicatorIds.size) fail(`Krysskoblingen dekker ${covered.size} av ${indicatorIds.size} FSD-indikatorer`);
}

function validateReport(report: string, indicators: JsonRecord[], sources: JsonRecord[], crosswalk: JsonRecord[]): void {
  const marker = report.match(/<!-- FSD_AUDIT_SUMMARY: (\{.*\}) -->/);
  if (!marker) fail("Rapport mangler FSD_AUDIT_SUMMARY-reproduserbarhetsmarkør");
  let summary: JsonRecord;
  try {
    summary = JSON.parse(marker[1]) as JsonRecord;
  } catch (error) {
    fail(`Rapportens FSD_AUDIT_SUMMARY er ikke gyldig JSON: ${String(error)}`);
  }
  const indicatorRows = crosswalk.filter((row) => row.fsdIndicatorId !== null);
  const comparisonCounts = Object.fromEntries([...new Set(crosswalk.map((row) => row.comparisonStatus))].map((status) => [status, crosswalk.filter((row) => row.comparisonStatus === status).length]));
  const dispositionCounts = Object.fromEntries([...new Set(crosswalk.map((row) => row.disposition))].map((disposition) => [disposition, crosswalk.filter((row) => row.disposition === disposition).length]));
  const expected = {
    indicators: indicators.length,
    indicatorCrosswalkRows: indicatorRows.length,
    internalControlRows: crosswalk.length - indicatorRows.length,
    sources: sources.length,
    missingNorwayValues: indicators.filter((row) => row.rawValue === null).length,
    comparisonCounts,
    dispositionCounts,
  };
  if (JSON.stringify(summary) !== JSON.stringify(expected)) fail(`Rapportens reproduserbarhetsmarkør avviker fra JSONL: ${JSON.stringify({ expected, summary })}`);
  for (const indicator of indicators) {
    if (!report.includes(indicator.id)) fail(`Rapportens komplettliste mangler ${indicator.id}`);
    if (!report.includes(indicator.name)) fail(`Rapportens komplettliste mangler ${indicator.name}`);
  }
  if (!report.includes("4.55") || !report.includes("4.6")) fail("Rapporten mangler eksplisitt rå-/visningsverdi-eksempel");
  if (!report.includes("390 000") || !report.includes("451 600") || !report.includes("3445") || !report.includes("3327")) fail("Rapporten mangler påkrevde interne konfliktverdier");
}

function validateSnapshotProvenance(bundle: NorwayFsdBundle, sourceMap: Map<string, JsonRecord>): void {
  const manifestMap = new Map(bundle.snapshotSources.map((source) => [source.id, source]));
  const bindings = [
    {
      label: "FSD full export",
      ledgerId: "src-fsd-full-export-2026-04-20",
      manifestId: "fsd-full-export-2026-04-20",
      pathKey: "compressedPath",
      hashKey: "compressedSha256",
    },
    {
      label: "FSD metadata export",
      ledgerId: "src-fsd-metadata-export-2026-04-20",
      manifestId: "fsd-metadata-export-2026-04-20",
      pathKey: "localPath",
      hashKey: "sha256",
    },
    {
      label: "FSD Norway profile",
      ledgerId: "src-fsd-norway-profile",
      manifestId: "fsd-norway-profile-2026-08-10",
      pathKey: "localPath",
      hashKey: "sha256",
    },
  ];

  for (const binding of bindings) {
    const ledger = sourceMap.get(binding.ledgerId);
    const manifest = manifestMap.get(binding.manifestId);
    if (!ledger || !manifest) fail(`${binding.label} mangler i source ledger eller snapshot manifest`);
    if (ledger.localPath !== manifest[binding.pathKey] || ledger.contentHash !== manifest[binding.hashKey]) {
      fail(`${binding.label} source ledger does not match snapshot manifest`);
    }
  }

  const profileManifest = manifestMap.get("fsd-norway-profile-2026-08-10");
  for (const indicator of bundle.indicators) {
    if (indicator.contentHash !== profileManifest?.sha256) {
      fail(`${indicator.id} does not match the verified Norway profile manifest`);
    }
    if (indicator.rawValue === null || indicator.fullExportIndicatorName === null) continue;
    const snapshotRow = bundle.fullExport.find((row) =>
      row.ISO3 === "NOR"
      && row.Indicator === indicator.fullExportIndicatorName
      && Number(row["End Year"]) === indicator.endYear,
    );
    if (
      !snapshotRow
      || (indicator.name === indicator.fullExportIndicatorName && Number(snapshotRow.Value) !== indicator.rawValue)
    ) {
      fail(`${indicator.id} does not match the verified full export snapshot`);
    }
  }
}

export function validateNorwayFsdBundle(bundle: NorwayFsdBundle): NorwayFsdSummary {
  const sourceMap = validateSources(bundle.sources, bundle.root);
  const indicatorIds = validateIndicators(bundle.indicators, sourceMap);
  validateSnapshotProvenance(bundle, sourceMap);
  validateCrosswalk(bundle.crosswalk, indicatorIds, sourceMap, bundle.root);
  validateReport(bundle.report, bundle.indicators, bundle.sources, bundle.crosswalk);
  if (!bundle.fullExport.some((row) => row.ISO3 === "NOR")) fail("FSD full export mangler Norge-rader");
  return {
    indicators: bundle.indicators.length,
    crosswalk: bundle.crosswalk.length,
    sources: bundle.sources.length,
  };
}

function main(): void {
  const bundle = loadNorwayFsdBundle(path.join(process.cwd(), "research", "landscape"));
  const summary = validateNorwayFsdBundle(bundle);
  console.log(`Norway FSD crosswalk validation passed: ${summary.indicators} indicators, ${summary.crosswalk} crosswalk rows, ${summary.sources} sources.`);
}

const invokedPath = process.argv[1];
if (invokedPath && import.meta.url === pathToFileURL(invokedPath).href) main();
