#!/usr/bin/env node

import { readFileSync, lstatSync } from "node:fs";
import { basename, dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

import {
  candidateAnalysisSha256,
  compareCandidateJsonKeysUtf8,
} from "../../src/lib/knowledge/candidate-analysis-contract";
import {
  LibraryAnalysisAcquisitionPlanSchema,
  type LibraryAnalysisAcquisitionPlan,
} from "../../src/lib/knowledge/library-analysis-acquisition-contract";
import {
  deriveLibraryAnalysisAgentQueueSubset,
  verifyLibraryAnalysisAgentQueue,
  type LibraryAnalysisAgentQueue,
} from "../../src/lib/knowledge/library-analysis-agent-queue";
import {
  openPrivateLibraryAnalysisRunRoot,
  writePrivateManifestAtomic,
} from "../../src/lib/knowledge/private-library-analysis-artifact-store";

export const LIBRARY_ANALYSIS_AGENT_PILOT_SCHEMA =
  "library-analysis-agent-pilot-selection/v1" as const;
export const LIBRARY_ANALYSIS_AGENT_PILOT_STRATA = [
  "database_small",
  "database_medium",
  "database_segmented",
  "controlled_https_pdf",
  "repository_csv",
  "repository_pptx",
  "derived_record",
] as const;
export type LibraryAnalysisAgentPilotStratum =
  (typeof LIBRARY_ANALYSIS_AGENT_PILOT_STRATA)[number];

const MIN_SOURCES = 10;
const MAX_SOURCES = 12;
const MAX_UNITS = 100;
const MIN_CODE_POINTS = 200_000;
const MAX_CODE_POINTS = 300_000;
const DATABASE_SMALL_MAX = 16_000;
const DATABASE_MEDIUM_MAX = 48_000;

export type LibraryAnalysisAgentPilotInput = {
  queue: LibraryAnalysisAgentQueue;
  plan: LibraryAnalysisAcquisitionPlan;
};

export type LibraryAnalysisAgentPilotSelection = {
  schema: typeof LIBRARY_ANALYSIS_AGENT_PILOT_SCHEMA;
  parentFullQueueHash: string;
  parentSelectionHash: string;
  planHash: string;
  selectionHash: string;
  sourceIds: string[];
  strata: LibraryAnalysisAgentPilotStratum[];
  unitCount: number;
  codePoints: number;
  queue: LibraryAnalysisAgentQueue;
};

type Candidate = {
  source: LibraryAnalysisAgentQueue["sources"][number];
  stratum: LibraryAnalysisAgentPilotStratum | null;
};

export function selectLibraryAnalysisAgentPilot(
  input: LibraryAnalysisAgentPilotInput | LibraryAnalysisAgentQueue,
): LibraryAnalysisAgentPilotSelection {
  const queue = verifyLibraryAnalysisAgentQueue(
    "queue" in input ? input.queue : input,
  );
  const plan = LibraryAnalysisAcquisitionPlanSchema.parse(
    "queue" in input ? input.plan : undefined,
  );
  if (plan.planHash !== queue.acquisitionPlanHash) {
    throw new Error("agent_pilot_plan_queue_hash_mismatch");
  }
  const planByIdentity = new Map(
    plan.rows.map((row) => [`${row.sourceKind}\u0000${row.sourceKey}`, row]),
  );
  const candidates: Candidate[] = [];
  for (const source of queue.sources) {
    const row = planByIdentity.get(`${source.sourceKind}\u0000${source.sourceKey}`);
    if (row === undefined || row.sourceVersionHash !== source.sourceVersionHash) {
      throw new Error("agent_pilot_source_plan_binding_mismatch");
    }
    const stratum = classifySource(queue, source, row);
    candidates.push({ source, stratum });
  }
  const byStratum = new Map<LibraryAnalysisAgentPilotStratum, Candidate[]>();
  for (const stratum of LIBRARY_ANALYSIS_AGENT_PILOT_STRATA) {
    byStratum.set(stratum, candidates
      .filter((candidate) => candidate.stratum === stratum)
      .sort(compareCandidates));
    if (byStratum.get(stratum)!.length === 0) {
      throw new Error("agent_pilot_stratum_unavailable");
    }
  }
  const selected = new Map<string, Candidate>();
  for (const stratum of LIBRARY_ANALYSIS_AGENT_PILOT_STRATA) {
    const candidate = byStratum.get(stratum)!.find((item) => !selected.has(sourceIdentity(item.source)));
    if (candidate === undefined) throw new Error("agent_pilot_stratum_unavailable");
    selected.set(sourceIdentity(candidate.source), candidate);
  }
  let codePoints = totalCodePoints([...selected.values()]);
  let unitCount = totalUnits([...selected.values()]);
  if (codePoints > MAX_CODE_POINTS || unitCount > MAX_UNITS) {
    throw new Error("agent_pilot_capacity_unsatisfied");
  }

  const fillers = candidates.filter((candidate) => !selected.has(sourceIdentity(candidate.source))).sort(compareCandidates);
  for (const candidate of fillers) {
    if (selected.size >= MAX_SOURCES || (selected.size >= MIN_SOURCES && codePoints >= MIN_CODE_POINTS)) break;
    const nextCodePoints = codePoints + candidate.source.codePoints;
    const nextUnits = unitCount + candidate.source.unitCount;
    if (nextCodePoints > MAX_CODE_POINTS || nextUnits > MAX_UNITS) continue;
    selected.set(sourceIdentity(candidate.source), candidate);
    codePoints = nextCodePoints;
    unitCount = nextUnits;
  }
  if (selected.size < MIN_SOURCES || codePoints < MIN_CODE_POINTS) {
    throw new Error("agent_pilot_capacity_unsatisfied");
  }
  if (selected.size > MAX_SOURCES || unitCount > MAX_UNITS || codePoints > MAX_CODE_POINTS) {
    throw new Error("agent_pilot_capacity_unsatisfied");
  }

  const selectedCandidates = [...selected.values()].sort(compareCandidates);
  const sourceIds = selectedCandidates.map((candidate) => candidate.source.sourceEnvelopeHash);
  const strata = LIBRARY_ANALYSIS_AGENT_PILOT_STRATA.filter((stratum) =>
    selectedCandidates.some((candidate) => candidate.stratum === stratum),
  );
  const selectedIdentities = new Set(selectedCandidates.map((candidate) => sourceIdentity(candidate.source)));
  const pilotBinding = {
    schema: "library-analysis-agent-pilot-binding/v1" as const,
    parentFullQueueHash: queue.queueHash,
    parentSelectionHash: queue.selectionHash,
    planHash: plan.planHash,
  };
  const selectionHash = candidateAnalysisSha256("library-analysis-agent-selection", {
    sources: queue.sources.filter((source) => selectedIdentities.has(sourceIdentity(source))),
    units: queue.units
      .filter((unit) => selectedIdentities.has(sourceIdentity(unit)))
      .map(unitBinding),
    pilotBinding,
  });
  const pilotQueue = deriveLibraryAnalysisAgentQueueSubset({
    queue,
    sourceKeys: selectedCandidates.map((candidate) => ({
      sourceKind: candidate.source.sourceKind,
      sourceKey: candidate.source.sourceKey,
    })),
    pilotBinding: { ...pilotBinding, pilotSelectionHash: selectionHash },
  });
  return {
    schema: LIBRARY_ANALYSIS_AGENT_PILOT_SCHEMA,
    parentFullQueueHash: queue.queueHash,
    parentSelectionHash: queue.selectionHash,
    planHash: plan.planHash,
    selectionHash,
    sourceIds,
    strata,
    unitCount,
    codePoints,
    queue: pilotQueue,
  };
}

function classifySource(
  queue: LibraryAnalysisAgentQueue,
  source: LibraryAnalysisAgentQueue["sources"][number],
  row: LibraryAnalysisAcquisitionPlan["rows"][number],
): LibraryAnalysisAgentPilotStratum | null {
  if (row.route === "database_document" && source.sourceKind === "document") {
    const jobs = queue.jobs.filter((job) => sourceIdentity(job) === sourceIdentity(source));
    if (jobs.length > 1 || source.codePoints > DATABASE_MEDIUM_MAX) return "database_segmented";
    if (source.codePoints <= DATABASE_SMALL_MAX) return "database_small";
    return "database_medium";
  }
  if (row.route === "controlled_https" && sourceHasPdfEvidence(queue, source, row.locator)) return "controlled_https_pdf";
  if (row.route === "repository_csv" && (sourceHasUnitType(queue, source, "sheet_range") || sourceHasUnitType(queue, source, "dataset_slice"))) return "repository_csv";
  if (row.route === "repository_pptx" && sourceHasUnitType(queue, source, "slide")) return "repository_pptx";
  if (row.route === "database_derived_record" && sourceHasUnitType(queue, source, "database_record")) return "derived_record";
  return null;
}

function sourceHasUnitType(
  queue: LibraryAnalysisAgentQueue,
  source: LibraryAnalysisAgentQueue["sources"][number],
  unitType: LibraryAnalysisAgentQueue["units"][number]["unitType"],
): boolean {
  return queue.units.some((unit) => sourceIdentity(unit) === sourceIdentity(source) && unit.unitType === unitType);
}

function sourceHasPdfEvidence(
  queue: LibraryAnalysisAgentQueue,
  source: LibraryAnalysisAgentQueue["sources"][number],
  locator: string | null,
): boolean {
  if (!sourceHasUnitType(queue, source, "pdf_page") || locator === null) return false;
  try {
    return new URL(locator).pathname.toLowerCase().endsWith(".pdf");
  } catch {
    return false;
  }
}

function sourceIdentity(source: { sourceKind: string; sourceKey: string }): string {
  return `${source.sourceKind}\u0000${source.sourceKey}`;
}

function compareCandidates(left: Candidate, right: Candidate): number {
  return compareCandidateJsonKeysUtf8(left.source.sourceEnvelopeHash, right.source.sourceEnvelopeHash) ||
    compareCandidateJsonKeysUtf8(left.source.sourceKind, right.source.sourceKind) ||
    compareCandidateJsonKeysUtf8(left.source.sourceKey, right.source.sourceKey);
}

function totalCodePoints(candidates: readonly Candidate[]): number {
  return candidates.reduce((sum, candidate) => sum + candidate.source.codePoints, 0);
}

function totalUnits(candidates: readonly Candidate[]): number {
  return candidates.reduce((sum, candidate) => sum + candidate.source.unitCount, 0);
}

function unitBinding(unit: LibraryAnalysisAgentQueue["units"][number]) {
  return {
    id: unit.id,
    sourceKind: unit.sourceKind,
    sourceKey: unit.populationSourceKey,
    sourceVersionHash: unit.sourceVersionHash,
    unitType: unit.unitType,
    ordinal: unit.ordinal,
    locator: unit.locator,
    contentHash: unit.contentHash,
    sizeBytes: unit.sizeBytes,
    codePoints: unit.codePoints,
    chunkPolicyHash: unit.chunkPolicyHash,
  };
}

export type LibraryAnalysisAgentPilotCliOptions = {
  queue: string;
  plan: string;
  outputRoot: string;
};

export function parseLibraryAnalysisAgentPilotArgs(
  argv: readonly string[],
): LibraryAnalysisAgentPilotCliOptions {
  const values = new Map<string, string>();
  for (const argument of argv) {
    const match = /^--(queue|plan|output-root)=(.*)$/u.exec(argument);
    if (!match || values.has(match[1]!)) throw new Error("agent_pilot_arguments_invalid");
    if (!isAbsolute(match[2]!) || /[\u0000-\u001f\u007f]/u.test(match[2]!)) throw new Error("agent_pilot_arguments_invalid");
    values.set(match[1]!, resolve(match[2]!));
  }
  const queue = values.get("queue");
  const plan = values.get("plan");
  const outputRoot = values.get("output-root");
  if (!queue || !plan || !outputRoot || queue === plan || queue === outputRoot || plan === outputRoot) throw new Error("agent_pilot_arguments_invalid");
  return { queue, plan, outputRoot };
}

export async function runLibraryAnalysisAgentPilotCli(options: LibraryAnalysisAgentPilotCliOptions): Promise<LibraryAnalysisAgentPilotSelection> {
  const queueStat = lstatSync(options.queue);
  const planStat = lstatSync(options.plan);
  const queueDirectoryStat = lstatSync(dirname(options.queue));
  if (!queueStat.isFile() || !planStat.isFile() || !queueDirectoryStat.isDirectory()) throw new Error("agent_pilot_input_artifact_invalid");
  if ((queueStat.mode & 0o222) !== 0) throw new Error("agent_pilot_input_artifact_not_read_only");
  if ((planStat.mode & 0o222) !== 0 && !isRepositoryOwnedStablePlan(options.plan)) {
    throw new Error("agent_pilot_plan_artifact_not_read_only");
  }
  const queue = verifyLibraryAnalysisAgentQueue(JSON.parse(readFileSync(options.queue, "utf8")));
  if (basename(options.queue) !== `queue-${queue.queueHash}.json` || basename(dirname(options.queue)) !== "queue") {
    throw new Error("agent_pilot_queue_path_invalid");
  }
  const plan = LibraryAnalysisAcquisitionPlanSchema.parse(JSON.parse(readFileSync(options.plan, "utf8")));
  const selection = selectLibraryAnalysisAgentPilot({ queue, plan });
  const outputRoot = openPrivateLibraryAnalysisRunRoot(dirname(options.outputRoot), basename(options.outputRoot));
  if (outputRoot !== options.outputRoot) throw new Error("agent_pilot_output_root_mismatch");
  writePrivateManifestAtomic(outputRoot, "pilot-selection.v1.json", Buffer.from(`${JSON.stringify({
    schema: selection.schema,
    parentFullQueueHash: selection.parentFullQueueHash,
    parentSelectionHash: selection.parentSelectionHash,
    planHash: selection.planHash,
    selectionHash: selection.selectionHash,
    sourceIds: selection.sourceIds,
    strata: selection.strata,
    unitCount: selection.unitCount,
    codePoints: selection.codePoints,
  }, null, 2)}\n`, "utf8"));
  writePrivateManifestAtomic(outputRoot, "pilot-queue.v1.json", Buffer.from(`${JSON.stringify(selection.queue, null, 2)}\n`, "utf8"));
  process.stdout.write(`${JSON.stringify({ command: "agent-pilot", selectionHash: selection.selectionHash, queueHash: selection.queue.queueHash, sources: selection.sourceIds.length, units: selection.unitCount, codePoints: selection.codePoints, strata: selection.strata.length, automatedOnly: true, externalReady: false })}\n`);
  return selection;
}

function isRepositoryOwnedStablePlan(path: string): boolean {
  const repositoryRoot = resolve(process.cwd());
  const relativePath = relative(repositoryRoot, resolve(path));
  return relativePath.length > 0 && relativePath !== ".." && !relativePath.startsWith(`..${sep}`) && !isAbsolute(relativePath);
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  Promise.resolve().then(() => runLibraryAnalysisAgentPilotCli(
    parseLibraryAnalysisAgentPilotArgs(process.argv.slice(2)),
  )).catch(() => {
    process.stderr.write("library_analysis_agent_pilot_failed\n");
    process.exitCode = 1;
  });
}
