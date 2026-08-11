import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

type JsonRecord = Record<string, unknown>;

export interface GapClosureProcess {
  ownerRole: string;
  method: string[];
  requiredInputs: string[];
  dependencies: string[];
  rightsEthics: string;
  exitCriteria: string[];
  validation: string;
}

export interface InformationGap {
  schemaVersion: string;
  id: string;
  title: string;
  domain: string;
  gapType: string;
  priority: string;
  status: string;
  currentState: string;
  impact: string;
  evidenceRefs: string[];
  targetPhase: string;
  decisionRequired: boolean;
  closureProcess: GapClosureProcess;
  nextAction: string;
  lastVerifiedAt: string;
}

export interface PhaseReadinessSummary {
  gaps: number;
  p0: number;
  p1: number;
  p2: number;
  humanGated: number;
  sourceGated: number;
  trueC: number;
  intakeStagedFiles: number;
  intakeExtractionRecords: number;
  intakeUniqueUrls: number;
  intakeMissingUrls: number;
  intakeFindings: number;
  intakeVerdicts: number;
  intakeMachineVerified: number;
  intakeDisputed: number;
}

const GAP_KEYS = [
  "schemaVersion",
  "id",
  "title",
  "domain",
  "gapType",
  "priority",
  "status",
  "currentState",
  "impact",
  "evidenceRefs",
  "targetPhase",
  "decisionRequired",
  "closureProcess",
  "nextAction",
  "lastVerifiedAt",
];

const CLOSURE_KEYS = [
  "ownerRole",
  "method",
  "requiredInputs",
  "dependencies",
  "rightsEthics",
  "exitCriteria",
  "validation",
];

const DOMAINS = new Set([
  "governance",
  "evidence",
  "qualitative",
  "nordic",
  "domain_data",
  "methods",
  "operations",
  "product",
]);

const GAP_TYPES = new Set([
  "human_gated",
  "source_gated",
  "true_c",
  "synthesis_needed",
  "future",
]);

const PRIORITIES = new Set(["P0", "P1", "P2"]);
const STATUSES = new Set([
  "open",
  "ready_to_execute",
  "blocked_external",
  "monitoring",
  "parked",
  "closed",
]);

const TARGET_PHASES = new Set([
  "phase_0_governance_closeout",
  "phase_1_controlled_validation",
  "phase_2_evidence_deepening",
  "phase_3_external_product",
  "phase_4_nordic_observatory",
]);

function fail(message: string): never {
  throw new Error(message);
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactKeys(value: JsonRecord, expected: string[], label: string): void {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (actual.join("|") !== wanted.join("|")) {
    fail(`${label} fields differ; expected ${wanted.join(", ")}; got ${actual.join(", ")}`);
  }
}

function nonEmptyString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${label} must be a non-empty string`);
  }
  return value;
}

function stringArray(value: unknown, label: string, minimum = 1): string[] {
  if (
    !Array.isArray(value)
    || value.length < minimum
    || value.some((item) => typeof item !== "string" || item.trim() === "")
  ) {
    fail(`${label} must be an array with at least ${minimum} non-empty string(s)`);
  }
  return value as string[];
}

function enumValue(value: unknown, allowed: Set<string>, label: string): string {
  const result = nonEmptyString(value, label);
  if (!allowed.has(result)) fail(`${label} has invalid value ${result}`);
  return result;
}

function isoDate(value: unknown, label: string): string {
  const result = nonEmptyString(value, label);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result) || Number.isNaN(Date.parse(`${result}T00:00:00Z`))) {
    fail(`${label} must be an ISO date`);
  }
  return result;
}

export function parseGapRegister(contents: string, label = "information gap register"): InformationGap[] {
  return contents
    .split(/\r?\n/)
    .map((line, index) => ({ line: line.trim(), lineNumber: index + 1 }))
    .filter(({ line }) => line.length > 0)
    .map(({ line, lineNumber }) => {
      try {
        return JSON.parse(line) as InformationGap;
      } catch (error) {
        fail(`${label}:${lineNumber} invalid JSON: ${String(error)}`);
      }
    });
}

function validateGapShape(gap: InformationGap, index: number): void {
  const label = `gap[${index}]/${gap.id ?? "unknown"}`;
  if (!isRecord(gap)) fail(`${label} must be an object`);
  exactKeys(gap, GAP_KEYS, label);
  if (gap.schemaVersion !== "1.0") fail(`${label}.schemaVersion must be 1.0`);
  if (!/^IG-\d{3}$/.test(nonEmptyString(gap.id, `${label}.id`))) {
    fail(`${label}.id must match IG-NNN`);
  }
  for (const field of ["title", "currentState", "impact", "nextAction"] as const) {
    nonEmptyString(gap[field], `${label}.${field}`);
  }
  enumValue(gap.domain, DOMAINS, `${label}.domain`);
  enumValue(gap.gapType, GAP_TYPES, `${label}.gapType`);
  enumValue(gap.priority, PRIORITIES, `${label}.priority`);
  enumValue(gap.status, STATUSES, `${label}.status`);
  enumValue(gap.targetPhase, TARGET_PHASES, `${label}.targetPhase`);
  if (typeof gap.decisionRequired !== "boolean") {
    fail(`${label}.decisionRequired must be boolean`);
  }
  stringArray(gap.evidenceRefs, `${label}.evidenceRefs`);
  isoDate(gap.lastVerifiedAt, `${label}.lastVerifiedAt`);

  if (!isRecord(gap.closureProcess)) fail(`${label}.closureProcess must be an object`);
  exactKeys(gap.closureProcess, CLOSURE_KEYS, `${label}.closureProcess`);
  nonEmptyString(gap.closureProcess.ownerRole, `${label}.closureProcess.ownerRole`);
  stringArray(gap.closureProcess.method, `${label}.closureProcess.method`);
  stringArray(gap.closureProcess.requiredInputs, `${label}.closureProcess.requiredInputs`);
  stringArray(gap.closureProcess.dependencies, `${label}.closureProcess.dependencies`, 0);
  nonEmptyString(gap.closureProcess.rightsEthics, `${label}.closureProcess.rightsEthics`);
  stringArray(gap.closureProcess.exitCriteria, `${label}.closureProcess.exitCriteria`);
  nonEmptyString(gap.closureProcess.validation, `${label}.closureProcess.validation`);

  if (gap.priority === "P0" && gap.targetPhase !== "phase_0_governance_closeout") {
    fail(`${label} P0 gaps must target phase_0_governance_closeout`);
  }
  if (gap.status === "blocked_external" && !gap.decisionRequired) {
    fail(`${label} blocked_external must require a decision`);
  }
  if (gap.gapType === "future" && gap.status !== "parked") {
    fail(`${label} future gaps must be parked`);
  }
}

function validateLocalEvidence(root: string, gaps: InformationGap[]): void {
  for (const gap of gaps) {
    for (const evidenceRef of gap.evidenceRefs) {
      if (/^https?:\/\//.test(evidenceRef)) continue;
      const absolute = path.resolve(root, evidenceRef);
      if (!fs.existsSync(absolute)) {
        fail(`${gap.id} evidence reference does not exist: ${evidenceRef}`);
      }
    }
  }
}

function validateDependencies(gaps: InformationGap[]): void {
  const ids = new Set(gaps.map((gap) => gap.id));
  for (const gap of gaps) {
    for (const dependency of gap.closureProcess.dependencies) {
      if (!ids.has(dependency)) fail(`${gap.id} links missing dependency ${dependency}`);
      if (dependency === gap.id) fail(`${gap.id} cannot depend on itself`);
    }
  }
}

function validateDocumentParity(gaps: InformationGap[], report: string, operatingPlan: string): void {
  for (const gap of gaps) {
    if (!report.includes(`\`${gap.id}\``)) fail(`Readiness report is missing ${gap.id}`);
    if (!operatingPlan.includes(`\`${gap.id}\``)) fail(`Operating plan is missing ${gap.id}`);
  }
}

function listFilesRecursively(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFilesRecursively(entryPath) : [entryPath];
  });
}

function readJsonlRecords(files: string[], label: string): JsonRecord[] {
  return files.flatMap((file) => fs.readFileSync(file, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      try {
        const parsed = JSON.parse(line) as unknown;
        if (!isRecord(parsed)) fail(`${label}/${path.basename(file)}:${index + 1} must be an object`);
        return parsed;
      } catch (error) {
        fail(`${label}/${path.basename(file)}:${index + 1} invalid JSON: ${String(error)}`);
      }
    }));
}

function validateIntakeReadback(root: string, gaps: InformationGap[], report: string) {
  const intakeRoot = path.join(root, "research/innhenting-2026-08-05");
  const stagedFiles = listFilesRecursively(path.join(intakeRoot, "staging")).length;
  const extractionFiles = listFilesRecursively(path.join(intakeRoot, "ekstrakt"))
    .filter((file) => /^innhenting-.*\.jsonl$/.test(path.basename(file)));
  const verdictFiles = listFilesRecursively(path.join(intakeRoot, "verifisering"))
    .filter((file) => /^verdict-.*\.jsonl$/.test(path.basename(file)));
  const extractions = readJsonlRecords(extractionFiles, "extraction");
  const verdicts = readJsonlRecords(verdictFiles, "verdict");
  const urls = extractions.map((record) => typeof record.url === "string" ? record.url.trim() : "");
  const uniqueUrls = new Set(urls.filter(Boolean)).size;
  const missingUrls = urls.filter((url) => url === "").length;
  const findings = extractions.reduce((sum, record, index) => {
    if (!Array.isArray(record.findings)) fail(`extraction[${index}].findings must be an array`);
    return sum + record.findings.length;
  }, 0);
  const machineVerified = verdicts.filter((record) => record.verdict === "machine_verified").length;
  const disputed = verdicts.filter((record) => record.verdict === "disputed").length;

  const canonicalText = `${stagedFiles} staged filer, ${extractions.length} ekstraksjonsposter, ${uniqueUrls} unike ikke-tomme URL-er og ${findings} finding-poster`;
  if (!report.includes(canonicalText)) fail(`Readiness report is missing reproducible intake readback: ${canonicalText}`);
  const locatorText = `${missingUrls} ekstraksjonspost${missingUrls === 1 ? "" : "er"} mangler URL-lokator`;
  if (!report.includes(locatorText)) fail(`Readiness report is missing intake locator exception: ${locatorText}`);
  const intakeGap = gaps.find((gap) => gap.id === "IG-018");
  if (!intakeGap?.currentState.includes(canonicalText)) {
    fail(`IG-018 currentState is missing reproducible intake readback: ${canonicalText}`);
  }
  if (!intakeGap.currentState.includes(locatorText)) {
    fail(`IG-018 currentState is missing intake locator exception: ${locatorText}`);
  }

  return {
    intakeStagedFiles: stagedFiles,
    intakeExtractionRecords: extractions.length,
    intakeUniqueUrls: uniqueUrls,
    intakeMissingUrls: missingUrls,
    intakeFindings: findings,
    intakeVerdicts: verdicts.length,
    intakeMachineVerified: machineVerified,
    intakeDisputed: disputed,
  };
}

export function validatePhaseReadiness(args: {
  root: string;
  gaps: InformationGap[];
  report: string;
  operatingPlan: string;
}): PhaseReadinessSummary {
  const { root, gaps, report, operatingPlan } = args;
  if (gaps.length !== 18) fail(`Expected exactly 18 gaps, got ${gaps.length}`);

  gaps.forEach(validateGapShape);
  const ids = gaps.map((gap) => gap.id);
  if (new Set(ids).size !== ids.length) fail("Gap IDs must be unique");
  const sortedIds = [...ids].sort();
  const expectedIds = Array.from({ length: 18 }, (_, index) => `IG-${String(index + 1).padStart(3, "0")}`);
  if (sortedIds.join("|") !== expectedIds.join("|")) {
    fail(`Gap ID sequence differs; expected ${expectedIds.join(", ")}`);
  }

  const p0 = gaps.filter((gap) => gap.priority === "P0").length;
  if (p0 !== 5) fail(`Expected exactly 5 P0 gaps, got ${p0}`);
  validateDependencies(gaps);
  validateLocalEvidence(root, gaps);
  validateDocumentParity(gaps, report, operatingPlan);
  const intake = validateIntakeReadback(root, gaps, report);

  return {
    gaps: gaps.length,
    p0,
    p1: gaps.filter((gap) => gap.priority === "P1").length,
    p2: gaps.filter((gap) => gap.priority === "P2").length,
    humanGated: gaps.filter((gap) => gap.gapType === "human_gated").length,
    sourceGated: gaps.filter((gap) => gap.gapType === "source_gated").length,
    trueC: gaps.filter((gap) => gap.gapType === "true_c").length,
    ...intake,
  };
}

export function validatePhaseReadinessFromDisk(root = process.cwd()): PhaseReadinessSummary {
  const registerPath = path.join(root, "research/_status/information-gap-register-2026-08-11.jsonl");
  const reportPath = path.join(root, "docs/project/status/food-systems-phase-readiness-2026-08-11.md");
  const operatingPlanPath = path.join(root, "docs/project/mandates/gap-closure-operating-plan-2026-08-11.md");
  const gaps = parseGapRegister(fs.readFileSync(registerPath, "utf8"), path.basename(registerPath));
  return validatePhaseReadiness({
    root,
    gaps,
    report: fs.readFileSync(reportPath, "utf8"),
    operatingPlan: fs.readFileSync(operatingPlanPath, "utf8"),
  });
}

function runCli(): void {
  const summary = validatePhaseReadinessFromDisk();
  console.log(
    `Phase readiness OK: ${summary.gaps} gaps (${summary.p0} P0, ${summary.p1} P1, ${summary.p2} P2; ${summary.humanGated} human-gated, ${summary.sourceGated} source-gated, ${summary.trueC} true-C); intake ${summary.intakeStagedFiles} staged / ${summary.intakeExtractionRecords} extractions / ${summary.intakeUniqueUrls} URLs (${summary.intakeMissingUrls} missing) / ${summary.intakeFindings} findings / ${summary.intakeVerdicts} verdicts (${summary.intakeMachineVerified} machine-verified, ${summary.intakeDisputed} disputed).`,
  );
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) {
  try {
    runCli();
  } catch (error) {
    console.error(`Phase readiness validation failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
