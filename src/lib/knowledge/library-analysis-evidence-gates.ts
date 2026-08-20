import { createHash } from "node:crypto";

import {
  AutomatedValidationFindingSchema,
  type AutomatedValidationFinding,
} from "./library-analysis-automated-validation";

export type ClaimFactKind =
  | "number"
  | "percentage"
  | "percentage_point"
  | "currency"
  | "year"
  | "period"
  | "geography";

export type ClaimFact = {
  kind: ClaimFactKind;
  normalized: string;
  raw: string;
};

export type EvidenceBindingInput = {
  evidence: string;
  sourceText: string;
  locator: string;
  sourcePath?: string;
  boundSourcePath?: string;
  excerptHash?: string;
  contentUnitId?: string;
  runInputContentUnitIds?: readonly string[];
  assertionId?: string;
};

export type QuantitativeFactsInput = {
  claim: string;
  evidence: string;
  contentUnitId?: string;
  assertionId?: string;
};

export type DeterministicLibraryGateInput = EvidenceBindingInput & {
  claim: string;
};

const NUMBER_PATTERN = /[+-]?(?:\d{1,3}(?:[ ,]\d{3})+|\d+)(?:[.,]\d+)?/g;
const SCALE_PATTERN = /^\s*(thousand|million|millions|billion|billions|milliard|milliarder)\b/i;
const PERCENTAGE_POINT_PATTERN = /^\s*(percentage\s+points?|prosentpoeng)\b/i;
const PERCENT_PATTERN = /^\s*(percent|percentage|prosent|%)\b/i;
const UNIT_PATTERN = /^\s*(litres?|liters?|l|kilograms?|kg|tonnes?|tons?|t|hectares?|ha|megawatt-hours?|mwh|kilowatt-hours?|kwh)\b/i;
const CURRENCY_PREFIX_PATTERN = /(?:^|\s)(NOK|USD|EUR|GBP|SEK|DKK|kr)\s*$/i;
const CURRENCY_SUFFIX_PATTERN = /^\s*(NOK|USD|EUR|GBP|SEK|DKK|kr)\b/i;

const GEOGRAPHIES = [
  "norway",
  "sweden",
  "denmark",
  "finland",
  "iceland",
  "europe",
  "norge",
  "sverige",
  "danmark",
  "island",
  "eu",
] as const;

const PERIOD_ALIASES: ReadonlyArray<[RegExp, string]> = [
  [/\b(?:per|each)\s+year\b|\bannually\b|\byearly\b/gi, "year"],
  [/\b(?:per|each)\s+month\b|\bmonthly\b/gi, "month"],
  [/\b(?:per|each)\s+week\b|\bweekly\b/gi, "week"],
  [/\b(?:per|each)\s+day\b|\bdaily\b/gi, "day"],
  [/\bper\s+quarter\b|\bquarterly\b/gi, "quarter"],
] as const;

function normalizeNumber(raw: string): string {
  const compact = raw.replaceAll(" ", "");
  if (/^[+-]?\d{1,3}(?:,\d{3})+$/.test(compact)) {
    return compact.replaceAll(",", "").replace(/^\+/, "");
  }
  return compact.replace(",", ".").replace(/^\+/, "");
}

function normalizeScale(raw: string | undefined): string | null {
  if (raw === undefined) return null;
  const scale = raw.toLowerCase();
  if (scale.startsWith("million")) return "million";
  if (scale.startsWith("billion") || scale.startsWith("milliard")) return "billion";
  return "thousand";
}

function normalizeCurrency(raw: string): string {
  return raw.toLowerCase() === "kr" ? "nok" : raw.toLowerCase();
}

function normalizeUnit(raw: string): string {
  const unit = raw.toLowerCase();
  if (/^lit/.test(unit) || unit === "l") return "litre";
  if (/^kilogram/.test(unit) || unit === "kg") return "kg";
  if (/^ton/.test(unit) || unit === "t") return "tonne";
  if (/^hectare/.test(unit) || unit === "ha") return "hectare";
  if (/^megawatt/.test(unit) || unit === "mwh") return "mwh";
  if (/^kilowatt/.test(unit) || unit === "kwh") return "kwh";
  return unit;
}

function pushUnique(facts: ClaimFact[], fact: ClaimFact): void {
  if (!facts.some(({ kind, normalized }) =>
    kind === fact.kind && normalized === fact.normalized
  )) {
    facts.push(fact);
  }
}

export function decomposeClaimFacts(text: string): ClaimFact[] {
  const facts: ClaimFact[] = [];
  for (const match of text.matchAll(NUMBER_PATTERN)) {
    const rawNumber = match[0];
    const number = normalizeNumber(rawNumber);
    const start = match.index ?? 0;
    const end = start + rawNumber.length;
    const before = text.slice(Math.max(0, start - 16), start);
    const after = text.slice(end);
    const scaleMatch = SCALE_PATTERN.exec(after);
    const scale = normalizeScale(scaleMatch?.[1]);
    const afterScale = scaleMatch === null
      ? after
      : after.slice(scaleMatch[0].length);
    const percentagePoint = PERCENTAGE_POINT_PATTERN.exec(afterScale);
    const percentage = PERCENT_PATTERN.exec(afterScale);
    const currencyPrefix = CURRENCY_PREFIX_PATTERN.exec(before);
    const currencySuffix = CURRENCY_SUFFIX_PATTERN.exec(afterScale);
    const unit = UNIT_PATTERN.exec(afterScale);

    if (/^\d{4}$/.test(number) && Number(number) >= 1900 && Number(number) <= 2099) {
      pushUnique(facts, { kind: "year", normalized: number, raw: rawNumber });
    } else if (percentagePoint !== null) {
      pushUnique(facts, {
        kind: "percentage_point",
        normalized: number,
        raw: `${rawNumber}${percentagePoint[0]}`,
      });
    } else if (percentage !== null) {
      pushUnique(facts, {
        kind: "percentage",
        normalized: number,
        raw: `${rawNumber}${percentage[0]}`,
      });
    } else if (currencyPrefix?.[1] !== undefined || currencySuffix?.[1] !== undefined) {
      const currency = normalizeCurrency(
        currencyPrefix?.[1] ?? currencySuffix?.[1] ?? "",
      );
      pushUnique(facts, {
        kind: "currency",
        normalized: [currency, number, scale].filter(Boolean).join(":"),
        raw: `${currencyPrefix?.[1] ?? ""}${rawNumber}${scaleMatch?.[0] ?? ""}${currencySuffix?.[0] ?? ""}`,
      });
    } else if (unit?.[1] !== undefined) {
      pushUnique(facts, {
        kind: "number",
        normalized: [number, scale, normalizeUnit(unit[1])]
          .filter(Boolean)
          .join(":"),
        raw: `${rawNumber}${scaleMatch?.[0] ?? ""}${unit[0]}`,
      });
    } else {
      pushUnique(facts, {
        kind: "number",
        normalized: [number, scale].filter(Boolean).join(":"),
        raw: `${rawNumber}${scaleMatch?.[0] ?? ""}`,
      });
    }
  }

  for (const [pattern, normalized] of PERIOD_ALIASES) {
    for (const match of text.matchAll(pattern)) {
      pushUnique(facts, { kind: "period", normalized, raw: match[0] });
    }
  }
  const geographyPattern = new RegExp(
    `\\b(${GEOGRAPHIES.join("|")})\\b`,
    "gi",
  );
  for (const match of text.matchAll(geographyPattern)) {
    pushUnique(facts, {
      kind: "geography",
      normalized: match[0].toLowerCase(),
      raw: match[0],
    });
  }
  return facts;
}

function sha256(value: string): string {
  return createHash("sha256").update(Buffer.from(value, "utf8")).digest("hex");
}

function defaultContentUnitId(input: { contentUnitId?: string; sourceText?: string }): string {
  return input.contentUnitId ?? `content:gate:${sha256(input.sourceText ?? "unknown")}`;
}

function finding(input: {
  errorClass: "F1" | "F2" | "F3";
  ruleId: string;
  explanation: string;
  contentUnitId: string;
  assertionId?: string;
}): AutomatedValidationFinding {
  const findingHash = sha256(JSON.stringify({
    errorClass: input.errorClass,
    ruleId: input.ruleId,
    explanation: input.explanation,
    contentUnitId: input.contentUnitId,
    assertionId: input.assertionId ?? "assertion:deterministic-gate",
  }));
  return AutomatedValidationFindingSchema.parse({
    findingId: `finding:gate:${findingHash}`,
    assertionId: input.assertionId ?? "assertion:deterministic-gate",
    errorClass: input.errorClass,
    severity: input.errorClass === "F3" ? "material" : "critical",
    affectsClaim: true,
    contentUnitIds: [input.contentUnitId],
    explanation: input.explanation,
    validatorKind: "deterministic",
    deterministicRuleIds: [input.ruleId],
  });
}

function normalizedWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function checkEvidenceBinding(
  input: EvidenceBindingInput,
): AutomatedValidationFinding[] {
  const findings: AutomatedValidationFinding[] = [];
  const contentUnitId = defaultContentUnitId(input);
  const append = (
    errorClass: "F1" | "F2",
    ruleId: string,
    explanation: string,
  ): void => {
    findings.push(finding({
      errorClass,
      ruleId,
      explanation,
      contentUnitId,
      assertionId: input.assertionId,
    }));
  };

  if (
    input.sourcePath !== undefined &&
    input.boundSourcePath !== undefined &&
    input.sourcePath !== input.boundSourcePath
  ) {
    append("F1", "rule:evidence:source-path-binding", "Bound source path does not match the supplied source path.");
  }
  if (
    input.runInputContentUnitIds !== undefined &&
    !input.runInputContentUnitIds.includes(contentUnitId)
  ) {
    append("F1", "rule:evidence:run-input-envelope", "Evidence content unit is outside the run input envelope.");
  }
  if (input.excerptHash !== undefined && input.excerptHash !== sha256(input.evidence)) {
    append("F1", "rule:evidence:excerpt-hash", "Evidence excerpt hash does not match the original excerpt bytes.");
  }
  if (input.locator.trim().length === 0) {
    append("F2", "rule:evidence:locator-required", "Evidence locator is missing.");
  }
  const normalizedEvidence = normalizedWhitespace(input.evidence);
  const normalizedSource = normalizedWhitespace(input.sourceText);
  if (
    normalizedEvidence.length === 0 ||
    !normalizedSource.includes(normalizedEvidence)
  ) {
    append("F2", "rule:evidence:excerpt-present", "Evidence excerpt is not present in the bound source bytes.");
  }
  return findings;
}

export function checkQuantitativeFacts(
  input: QuantitativeFactsInput,
): AutomatedValidationFinding[] {
  const claimFacts = decomposeClaimFacts(input.claim);
  const evidenceFacts = new Set(
    decomposeClaimFacts(input.evidence).map(
      ({ kind, normalized }) => `${kind}\u0000${normalized}`,
    ),
  );
  const contentUnitId = defaultContentUnitId({
    contentUnitId: input.contentUnitId,
    sourceText: input.evidence,
  });
  return claimFacts
    .filter(({ kind, normalized }) => !evidenceFacts.has(`${kind}\u0000${normalized}`))
    .map((fact) => finding({
      errorClass: "F3",
      ruleId: `rule:quantitative:${fact.kind}`,
      explanation: `Evidence does not contain the exact ${fact.kind} fact ${fact.normalized}.`,
      contentUnitId,
      assertionId: input.assertionId,
    }));
}

export function runDeterministicLibraryGates(
  input: DeterministicLibraryGateInput,
): {
  claimFacts: ClaimFact[];
  findings: AutomatedValidationFinding[];
} {
  return {
    claimFacts: decomposeClaimFacts(input.claim),
    findings: [
      ...checkEvidenceBinding(input),
      ...checkQuantitativeFacts(input),
    ],
  };
}
