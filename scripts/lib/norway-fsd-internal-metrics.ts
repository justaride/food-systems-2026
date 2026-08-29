import fs from "node:fs";
import path from "node:path";

type JsonRecord = Record<string, any>;

export type ResolvedInternalMetric = {
  value: number | null;
  year: number | null;
  unit: string;
};

type MetricSpec = {
  unit: string | ((document: JsonRecord) => string);
  year: number | null | ((document: JsonRecord) => number | null);
  series?: true;
};

const VALUE_CHAIN = "public/data/food-systems/no/value-chain.json";
const SSB_LANDBRUK = "public/data/food-systems/ssb_landbruk_2024.json";
const CHART_METRICS = "public/data/food-systems/no/chart-metrics.json";
const FLOWS = "public/data/food-systems/no/flows.json";

const valueChainMetric = (unit: string, year: MetricSpec["year"] = (document) => document.year): MetricSpec => ({
  unit,
  year,
});

const supportedMetrics: Record<string, Record<string, MetricSpec>> = {
  [VALUE_CHAIN]: {
    "food_waste_by_category.summary.norway_total_food_waste_2023_tonnes": valueChainMetric("tonnes", 2023),
    "selfSufficiency.caloric_pct": valueChainMetric("%"),
    "selfSufficiency.feed_corrected_pct": valueChainMetric("%"),
    "steps[id=primary].breakdown.fruit_veg_breakdown.fruit": valueChainMetric("tonnes"),
    "steps[id=primary].breakdown.fruit_veg_breakdown.vegetables": valueChainMetric("tonnes"),
    "steps[id=primary].breakdown.grain_tonnes": valueChainMetric("tonnes"),
    "steps[id=primary].breakdown.meat_breakdown.beef": valueChainMetric("tonnes"),
    "steps[id=primary].breakdown.milk_tonnes": valueChainMetric("tonnes"),
    "steps[id=retail].concentration.hhi": valueChainMetric("HHI index"),
    "steps[id=waste].total_waste_tonnes": valueChainMetric("tonnes"),
  },
  [SSB_LANDBRUK]: {
    "economics.cpi_food_oct24_oct25": { unit: "ratio change", year: 2025 },
    "food_waste_2024.total_edible_tonnes": { unit: "tonnes", year: 2024 },
    "production.self_sufficiency_2023.calories": { unit: "ratio", year: 2023 },
    "production.self_sufficiency_2023.fruit": { unit: "ratio", year: 2023 },
    "production.self_sufficiency_2023.vegetables": { unit: "ratio", year: 2023 },
  },
  [CHART_METRICS]: {
    "parentCompany.parentHHI": { unit: "HHI index", year: null },
  },
  [FLOWS]: {
    "flows[*].value": {
      unit: (document) => document.unit,
      year: (document) => {
        const years = [...new Set(document.flows.map((row: JsonRecord) => row.year))];
        if (years.length !== 1 || typeof years[0] !== "number" || !Number.isInteger(years[0])) {
          throw new Error("flows[*].value does not have one source-bound year");
        }
        return years[0];
      },
      series: true,
    },
  },
};

function resolveSelector(document: JsonRecord, selector: string): unknown[] {
  let values: unknown[] = [document];
  for (const segment of selector.split(".")) {
    const match = /^([A-Za-z0-9_]+)(?:\[(\*|id=([A-Za-z0-9_-]+))\])?$/.exec(segment);
    if (!match) throw new Error(`unsupported internal metric selector: ${selector}`);
    const [, property, arraySelector, expectedId] = match;
    const next: unknown[] = [];
    for (const value of values) {
      if (value === null || typeof value !== "object" || !(property in value)) {
        throw new Error(`internal metric selector does not resolve: ${selector}`);
      }
      const selected = (value as JsonRecord)[property];
      if (arraySelector === "*") {
        if (!Array.isArray(selected) || selected.length === 0) {
          throw new Error(`internal metric selector does not resolve a non-empty array: ${selector}`);
        }
        next.push(...selected);
      } else if (expectedId !== undefined) {
        if (!Array.isArray(selected)) throw new Error(`internal metric selector expects an array: ${selector}`);
        const matches = selected.filter((row) => row && typeof row === "object" && row.id === expectedId);
        if (matches.length !== 1) throw new Error(`internal metric selector must resolve one id=${expectedId}: ${selector}`);
        next.push(matches[0]);
      } else {
        next.push(selected);
      }
    }
    values = next;
  }
  return values;
}

export function resolveSupportedInternalMetric(
  document: JsonRecord,
  file: string,
  metricKey: string,
): ResolvedInternalMetric {
  const metrics = supportedMetrics[file];
  if (!metrics) throw new Error(`unsupported internal metric origin: ${file}`);
  const spec = metrics[metricKey];
  if (!spec) throw new Error(`unsupported internal metric selector: ${file}#${metricKey}`);
  const values = resolveSelector(document, metricKey);
  if (values.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    throw new Error(`internal metric selector is not numeric: ${file}#${metricKey}`);
  }
  if (!spec.series && values.length !== 1) {
    throw new Error(`internal metric selector must resolve one value: ${file}#${metricKey}`);
  }
  const year = typeof spec.year === "function" ? spec.year(document) : spec.year;
  const unit = typeof spec.unit === "function" ? spec.unit(document) : spec.unit;
  if (year !== null && (typeof year !== "number" || !Number.isInteger(year))) {
    throw new Error(`internal metric year is not source-bound: ${file}#${metricKey}`);
  }
  if (typeof unit !== "string" || unit.length === 0) {
    throw new Error(`internal metric unit is not source-bound: ${file}#${metricKey}`);
  }
  return { value: spec.series ? null : values[0] as number, year, unit };
}

export function readSupportedInternalMetric(root: string, file: string, metricKey: string): ResolvedInternalMetric {
  if (!supportedMetrics[file]) throw new Error(`unsupported internal metric origin: ${file}`);
  const absolutePath = path.resolve(root, file);
  const document = JSON.parse(fs.readFileSync(absolutePath, "utf8")) as JsonRecord;
  return resolveSupportedInternalMetric(document, file, metricKey);
}
