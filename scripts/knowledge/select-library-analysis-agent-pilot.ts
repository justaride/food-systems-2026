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
  verifyLibraryAnalysisAgentPilotQueue,
  verifyLibraryAnalysisAgentQueue,
  type LibraryAnalysisAgentQueue,
} from "../../src/lib/knowledge/library-analysis-agent-queue";
import {
  openPrivateLibraryAnalysisRunRoot,
  readAndVerifyPrivateArtifact,
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
  const selectedCandidates = findFeasibleSelection(candidates, byStratum);
  if (selectedCandidates === null) throw new Error("agent_pilot_capacity_unsatisfied");
  const codePoints = totalCodePoints(selectedCandidates);
  const unitCount = totalUnits(selectedCandidates);
  const sourceIds = selectedCandidates.map((candidate) => candidate.source.sourceEnvelopeHash);
  const strata = LIBRARY_ANALYSIS_AGENT_PILOT_STRATA.filter((stratum) =>
    selectedCandidates.some((candidate) => candidate.stratum === stratum),
  );
  const selectedIdentities = new Set(selectedCandidates.map((candidate) => sourceIdentity(candidate.source)));
  const pilotBinding = {
    schema: "library-analysis-agent-pilot-binding/v1" as const,
    parentFullQueueHash: queue.queueHash,
    parentSelectionHash: queue.selectionHash,
    acquisitionPlanHash: plan.planHash,
  };
  const childSelectionHash = candidateAnalysisSha256("library-analysis-agent-selection", {
    sources: queue.sources.filter((source) => selectedIdentities.has(sourceIdentity(source))),
    units: queue.units
      .filter((unit) => selectedIdentities.has(unitSourceIdentity(unit)))
      .map(unitBinding),
    pilotBinding,
  });
  const selectionHash = candidateAnalysisSha256("library-analysis-agent-pilot-selection", {
    schema: LIBRARY_ANALYSIS_AGENT_PILOT_SCHEMA,
    parentFullQueueHash: queue.queueHash,
    parentSelectionHash: queue.selectionHash,
    planHash: plan.planHash,
    sourceIds,
    strata,
    childSelectionHash,
  });
  const pilotQueue = deriveLibraryAnalysisAgentQueueSubset({
    queue,
    sourceKeys: selectedCandidates.map((candidate) => ({
      sourceKind: candidate.source.sourceKind,
      sourceKey: candidate.source.sourceKey,
    })),
    pilotBinding: { ...pilotBinding, childSelectionHash },
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
    const jobs = queue.jobs.filter((job) => queueSourceIdentity(job) === queueSourceIdentity(source));
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
  return queue.units.some((unit) => unitSourceIdentity(unit) === queueSourceIdentity(source) && unit.unitType === unitType);
}

function sourceHasPdfEvidence(
  queue: LibraryAnalysisAgentQueue,
  source: LibraryAnalysisAgentQueue["sources"][number],
  locator: string | null,
): boolean {
  if (!sourceHasUnitType(queue, source, "pdf_page") || locator === null) return false;
  try {
    const url = new URL(locator);
    return url.protocol === "https:" && !url.username && !url.password && !url.hash && url.pathname.toLowerCase().endsWith(".pdf");
  } catch {
    return false;
  }
}

function sourceIdentity(source: { sourceKind: string; sourceKey: string }): string {
  return `${source.sourceKind}\u0000${source.sourceKey}`;
}

function queueSourceIdentity(source: { sourceKind: string; sourceKey: string }): string {
  return sourceIdentity(source);
}

function unitSourceIdentity(unit: { sourceKind: string; populationSourceKey: string }): string {
  return `${unit.sourceKind}\u0000${unit.populationSourceKey}`;
}

function findFeasibleSelection(
  candidates: readonly Candidate[],
  byStratum: ReadonlyMap<LibraryAnalysisAgentPilotStratum, Candidate[]>,
): Candidate[] | null {
  const orderedStrata = [...LIBRARY_ANALYSIS_AGENT_PILOT_STRATA];
  const selected: Candidate[] = [];
  const searchPrimary = (index: number): Candidate[] | null => {
    if (index === orderedStrata.length) {
      const primaryIds = new Set(selected.map((candidate) => sourceIdentity(candidate.source)));
      const fillers = candidates.filter((candidate) => !primaryIds.has(sourceIdentity(candidate.source))).sort(compareCandidates);
      for (let count = MIN_SOURCES - selected.length; count <= MAX_SOURCES - selected.length; count += 1) {
        const found = findFillers(fillers, totalCodePoints(selected), totalUnits(selected), count);
        if (found !== null) return [...selected, ...found];
      }
      return null;
    }
    const stratum = orderedStrata[index]!;
    for (const candidate of byStratum.get(stratum)!) {
      selected.push(candidate);
      if (totalCodePoints(selected) <= MAX_CODE_POINTS && totalUnits(selected) <= MAX_UNITS) {
        const found = searchPrimary(index + 1);
        if (found !== null) return found;
      }
      selected.pop();
    }
    return null;
  };
  return searchPrimary(0);
}

function findFillers(
  candidates: readonly Candidate[],
  baseCodePoints: number,
  baseUnits: number,
  count: number,
): Candidate[] | null {
  if (count < 0 || count > 5) return null;
  const largestSuffix = buildSuffixExtrema(candidates, true);
  const smallestSuffix = buildSuffixExtrema(candidates, false);
  const chosen: Candidate[] = [];
  const memo = new Map<string, Candidate[] | false>();
  const search = (start: number, codePoints: number, units: number): Candidate[] | null => {
    const memoKey = `${start}\u0000${chosen.length}\u0000${codePoints}\u0000${units}`;
    const memoized = memo.get(memoKey);
    if (memoized !== undefined) return memoized === false ? null : memoized;
    const remaining = count - chosen.length;
    if (remaining === 0) {
      const result = codePoints >= MIN_CODE_POINTS && codePoints <= MAX_CODE_POINTS && units <= MAX_UNITS ? [...chosen] : null;
      memo.set(memoKey, result ?? false);
      return result;
    }
    if (candidates.length - start < remaining || codePoints > MAX_CODE_POINTS || units > MAX_UNITS) {
      memo.set(memoKey, false);
      return null;
    }
    if (codePoints + (largestSuffix[start]?.[remaining] ?? Number.NEGATIVE_INFINITY) < MIN_CODE_POINTS) {
      memo.set(memoKey, false);
      return null;
    }
    if (codePoints + (smallestSuffix[start]?.[remaining] ?? Number.POSITIVE_INFINITY) > MAX_CODE_POINTS) {
      memo.set(memoKey, false);
      return null;
    }
    for (let index = start; index <= candidates.length - remaining; index += 1) {
      const candidate = candidates[index]!;
      const nextCodePoints = codePoints + candidate.source.codePoints;
      const nextUnits = units + candidate.source.unitCount;
      if (nextCodePoints > MAX_CODE_POINTS || nextUnits > MAX_UNITS) continue;
      chosen.push(candidate);
      const found = search(index + 1, nextCodePoints, nextUnits);
      if (found !== null) {
        memo.set(memoKey, found);
        return found;
      }
      chosen.pop();
    }
    memo.set(memoKey, false);
    return null;
  };
  return search(0, baseCodePoints, baseUnits);
}

function buildSuffixExtrema(
  candidates: readonly Candidate[],
  largest: boolean,
): number[][] {
  const impossible = largest ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
  const suffix = Array.from({ length: candidates.length + 1 }, () => Array<number>(6).fill(impossible));
  suffix[candidates.length]![0] = 0;
  for (let index = candidates.length - 1; index >= 0; index -= 1) {
    suffix[index]![0] = 0;
    for (let count = 1; count <= 5; count += 1) {
      const skip = suffix[index + 1]![count]!;
      const takePrevious = suffix[index + 1]![count - 1]!;
      const take = takePrevious === impossible ? impossible : candidates[index]!.source.codePoints + takePrevious;
      suffix[index]![count] = largest ? Math.max(skip, take) : Math.min(skip, take);
    }
  }
  return suffix;
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
  const selectionReceipt = writePrivateManifestAtomic(outputRoot, "pilot-selection.v1.json", Buffer.from(`${JSON.stringify({
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
  const queueReceipt = writePrivateManifestAtomic(outputRoot, "pilot-queue.v1.json", Buffer.from(`${JSON.stringify(selection.queue, null, 2)}\n`, "utf8"));
  const persistedQueue = JSON.parse(readAndVerifyPrivateArtifact(outputRoot, "pilot-queue.v1.json", { sha256: queueReceipt.sha256, sizeBytes: queueReceipt.sizeBytes, mode: 0o400 }).toString("utf8")) as LibraryAnalysisAgentQueue;
  const persistedSelection = JSON.parse(readAndVerifyPrivateArtifact(outputRoot, "pilot-selection.v1.json", { sha256: selectionReceipt.sha256, sizeBytes: selectionReceipt.sizeBytes, mode: 0o400 }).toString("utf8")) as Omit<LibraryAnalysisAgentPilotSelection, "queue">;
  verifyLibraryAnalysisAgentPilotQueue(queue, persistedQueue, { ...persistedSelection, queue: persistedQueue });
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
