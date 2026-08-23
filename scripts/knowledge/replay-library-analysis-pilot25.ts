import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { validateLibraryAnalysisAgentSegmentResponse } from "../../src/lib/knowledge/library-analysis-agent-response";

const runRoot = "/Users/gabrielfreeman/.local/share/foodsystems/library-analysis-runs/20260823-ai-validation/codex-native-pilot-25";
const queuePath = join(runRoot, "queue", "queue-4b8a6412fb288daeb17f42aeec0548dd21b224b98a5f6ea93f48a48dfa156e21.json");
const responseRoot = join(process.cwd(), ".superpowers/sdd/2026-08-21-codex-native-library-analysis-orchestration/pilot25-worker-responses");

type AttemptInput = {
  queueHash: string;
  attempt: number;
  inputHash: string;
  expectedModel: unknown;
  job: Record<string, unknown>;
  units: Array<Record<string, unknown> & { text: string }>;
};

function collectResponsePaths(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = join(directory, entry.name);
    return entry.isDirectory() ? collectResponsePaths(target) : entry.name.endsWith(".json") ? [target] : [];
  }).sort();
}

const queue = JSON.parse(readFileSync(queuePath, "utf8")) as { jobs: Array<{ jobId: string }> };
const failures: Array<{ jobId: string; error: string }> = [];
let accepted = 0;
for (const responsePath of collectResponsePaths(responseRoot)) {
  const response = JSON.parse(readFileSync(responsePath, "utf8")) as { jobId: string };
  const input = JSON.parse(readFileSync(join(runRoot, "jobs", response.jobId, "attempt-001", "input.json"), "utf8")) as AttemptInput;
  try {
    validateLibraryAnalysisAgentSegmentResponse({
      queueHash: input.queueHash,
      attempt: input.attempt,
      inputHash: input.inputHash,
      expectedModel: input.expectedModel as never,
      job: { job: input.job, units: input.units.map(({ text, ...descriptor }) => ({ descriptor, text })) } as never,
      response,
    });
    accepted += 1;
  } catch (error) {
    failures.push({ jobId: response.jobId, error: error instanceof Error ? error.message : String(error) });
  }
}

const errors = Object.fromEntries([...new Set(failures.map(({ error }) => error))].sort().map((error) => [
  error,
  failures.filter((failure) => failure.error === error).length,
]));
const expectedRejectedJobs = new Map([
  ["job:library-analysis-agent:05f751c1472303b5b6c4c1a35a0c08c45911333265ab41c9e0c3337e4bf2ef2f", "agent_response_evidence_context_dependent"],
  ["job:library-analysis-agent:454768efa4f39c7d763d0ddae3e2db5c8223c79cd606d73649cda2f71d9342f0", "agent_response_context_dependent_claim"],
  ["job:library-analysis-agent:617fa81e8364e9563ac88a9b9d7a8ba288261846a13f7e806ddd17a1f820ac24", "agent_response_comparative_cost_context_missing"],
  ["job:library-analysis-agent:fe161ee8cf620662882b95ac6ab662123ffabf1606cb891bfa10e4274e29fa11", "agent_response_identification_actor_missing"],
  ["job:library-analysis-agent:ff236178c411189c7bad18278cd20b82e0b6b95e358d3dd7cbc36abde789529a", "agent_response_retention_as_of_missing"],
]);
const expectedFailures = [...expectedRejectedJobs].map(([jobId, error]) => ({ jobId, error }));
const exact = queue.jobs.length === 18 && accepted === 13 && failures.length === expectedFailures.length &&
  JSON.stringify(failures.sort((left, right) => left.jobId.localeCompare(right.jobId))) ===
  JSON.stringify(expectedFailures.sort((left, right) => left.jobId.localeCompare(right.jobId)));

console.log(JSON.stringify({
  jobs: queue.jobs.length,
  accepted,
  rejected: failures.length,
  errors,
  rejectedJobs: failures.sort((left, right) => left.jobId.localeCompare(right.jobId)),
  exact,
  writeFree: true,
}, null, 2));
if (!exact) process.exitCode = 1;
