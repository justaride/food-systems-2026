import { createHash } from "node:crypto";
import { lstatSync, readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";

import {
  validateLibraryAnalysisAgentSegmentResponse,
} from "../../src/lib/knowledge/library-analysis-agent-response";

const runRoot = "/Users/gabrielfreeman/.local/share/foodsystems/library-analysis-runs/20260823-ai-validation/codex-native-pilot-25";
const queuePath = join(runRoot, "queue/queue-4b8a6412fb288daeb17f42aeec0548dd21b224b98a5f6ea93f48a48dfa156e21.json");
const receiptPath = join(runRoot, "terminal/receipt.json");
const responseRoot = join(process.cwd(), ".superpowers/sdd/2026-08-21-codex-native-library-analysis-orchestration/pilot25-worker-responses");

type AttemptInput = {
  queueHash: string;
  attempt: number;
  inputHash: string;
  expectedModel: unknown;
  job: Record<string, unknown>;
  units: Array<Record<string, unknown> & { text: string }>;
};
type Artifact = { mode: number; portablePath: string; sha256: string; sizeBytes: number };
type AttemptReceipt = { jobId: string; inputHash: string; inputArtifact: Artifact; responseArtifact: Artifact; responseHash: string };

function readJson<T>(path: string): T { return JSON.parse(readFileSync(path, "utf8")) as T; }
function sha256(path: string): string { return createHash("sha256").update(readFileSync(path)).digest("hex"); }
function collectResponsePaths(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = join(directory, entry.name);
    return entry.isDirectory() ? collectResponsePaths(target) : entry.name.endsWith(".json") ? [target] : [];
  }).sort();
}
function assertArtifact(path: string, artifact: Artifact, expectedMode: number, label: string): void {
  const stat = lstatSync(path);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`${label}_not_regular_file`);
  if ((stat.mode & 0o777) !== expectedMode) throw new Error(`${label}_mode_mismatch`);
  if (stat.size !== artifact.sizeBytes || sha256(path) !== artifact.sha256) throw new Error(`${label}_integrity_mismatch`);
}
function exactSetMatch(actual: ReadonlySet<string>, expected: ReadonlySet<string>): boolean {
  return actual.size === expected.size && [...expected].every((value) => actual.has(value));
}
function runReplayMutationSelfTests(): void {
  const expectedAccepted = new Set(["accepted-a", "accepted-b"]);
  if (exactSetMatch(new Set(["accepted-a"]), expectedAccepted)) throw new Error("replay_self_test_missing_accepted_not_detected");
  if (exactSetMatch(new Set(["accepted-a", "unknown"]), expectedAccepted)) throw new Error("replay_self_test_substituted_accepted_not_detected");
  const expectedBinding = new Set(["job|claim|finding"]);
  if (exactSetMatch(new Set([...expectedBinding, "job|extra-claim|finding"]), expectedBinding)) throw new Error("replay_self_test_extra_rejected_claim_not_detected");
}
runReplayMutationSelfTests();

const queue = readJson<{ queueHash: string; jobs: Array<{ jobId: string; inputEnvelopeHash: string }> }>(queuePath);
const receipt = readJson<{ queueHash: string; jobCount: number; state: string; acceptedAttemptReceipts: AttemptReceipt[] }>(receiptPath);
const expectedRejectedJobs = new Map([
  ["job:library-analysis-agent:5dbc4d81a1c11b6ec39bdb0195632ca77123fc4b81f80c623c3ec733f6b76656", "agent_response_blocked_material_claim"],
  ["job:library-analysis-agent:05f751c1472303b5b6c4c1a35a0c08c45911333265ab41c9e0c3337e4bf2ef2f", "agent_response_evidence_context_dependent"],
  ["job:library-analysis-agent:454768efa4f39c7d763d0ddae3e2db5c8223c79cd606d73649cda2f71d9342f0", "agent_response_context_dependent_claim"],
  ["job:library-analysis-agent:617fa81e8364e9563ac88a9b9d7a8ba288261846a13f7e806ddd17a1f820ac24", "agent_response_comparative_cost_context_missing"],
  ["job:library-analysis-agent:fe161ee8cf620662882b95ac6ab662123ffabf1606cb891bfa10e4274e29fa11", "agent_response_identification_actor_missing"],
  ["job:library-analysis-agent:ff236178c411189c7bad18278cd20b82e0b6b95e358d3dd7cbc36abde789529a", "agent_response_retention_as_of_missing"],
]);
const expectedAcceptedJobIds = new Set([
  "job:library-analysis-agent:13892c63e288799063dd59d4ef15d9ee57b8fce039e936617cbb0b249fbcebb0",
  "job:library-analysis-agent:332997ea481278fea9b640eca33943081fd24de57215363c3a78531d12380c0c",
  "job:library-analysis-agent:14c4df1d94a803c3aadd7fbd423fee8d9b6965681595771bf6ced7f17c7f81f5",
  "job:library-analysis-agent:fa7ebc12177c03857926f61dc6c0e2d39e64fdc5b525b7c31da96d76619fcfbb",
  "job:library-analysis-agent:eba50c672dd49238cea531d987824161a2954967145aad7535890fb60801ba6a",
  "job:library-analysis-agent:7337ef7fa9abe9363f5066d6d049fb9edff84dbbfaa597fcb41955ed77d9454a",
  "job:library-analysis-agent:c5417c13b8180edecca9982d38e7c3253c317a2fc8c1a40793edbf4323f9b0dc",
  "job:library-analysis-agent:de1d2f86a750570efdbc5adaeeb93e9112e5df29f959e6af86842beb87c5462e",
  "job:library-analysis-agent:bdfecf7798985adc8ea0d525d32996e2236923d2da0679dd99c21b0791389c5f",
  "job:library-analysis-agent:81efe211513b8f9e5ef12b60e82759199509daf9c02fa0fe429fc82b78426f20",
  "job:library-analysis-agent:4e98675199166c9b9d42e9d99f540d6e839181f088b16e11d1488145b31f9d8e",
  "job:library-analysis-agent:8f96c52d4212e43dd0612d952957a0d9bc64f2f2836f83f07129174c43e78456",
]);
const expectedRejectedClaims = new Map([
  ["job:library-analysis-agent:05f751c1472303b5b6c4c1a35a0c08c45911333265ab41c9e0c3337e4bf2ef2f", ["claim:library-agent:c757f6370a429b3558267d7d7860b9a5dc71ceb937911abb47ce366fbfad9e67", "agent_response_evidence_context_dependent"]],
  ["job:library-analysis-agent:454768efa4f39c7d763d0ddae3e2db5c8223c79cd606d73649cda2f71d9342f0", ["claim:library-agent:2c2d79eb0b5fb4dfbde4cb73bc7181084cb29ba72baf6e84d8452769a7cd0405", "agent_response_context_dependent_claim"]],
  ["job:library-analysis-agent:617fa81e8364e9563ac88a9b9d7a8ba288261846a13f7e806ddd17a1f820ac24", ["claim:library-agent:18c3a9679ce508fd9b45ebe48ff23cfd2d8212b85a6f653fd33e349e5c74879c", "agent_response_comparative_cost_context_missing"]],
  ["job:library-analysis-agent:fe161ee8cf620662882b95ac6ab662123ffabf1606cb891bfa10e4274e29fa11", ["claim:library-agent:93795259fe9c4afa2d9aa5f84e18aca8ca4f96b6a041d3a4d1f1cb77044e73bd", "agent_response_identification_actor_missing"]],
  ["job:library-analysis-agent:ff236178c411189c7bad18278cd20b82e0b6b95e358d3dd7cbc36abde789529a", ["claim:library-agent:98d2c4197111efa8b0b734b7b795f671e62e7ab00f510933412e3e8c0441984b", "agent_response_retention_as_of_missing"]],
]);
const expectedRejectedCoverageBindings = new Set([
  "job:library-analysis-agent:5dbc4d81a1c11b6ec39bdb0195632ca77123fc4b81f80c623c3ec733f6b76656|content:library-analysis:a0752ecef8bc66544a03f6fa57dd52e6efc5df369712cdb3478ca460cd54c384|agent_response_blocked_material_claim",
]);

const failures: Array<{ jobId: string; error: string }> = [];
const acceptedJobIds = new Set<string>();
const rejectedJobIds = new Set<string>();
const rejectedClaimBindings = new Set<string>();
const rejectedCoverageBindings = new Set<string>();
const responsePaths = collectResponsePaths(responseRoot);
const responseJobIds = responsePaths.map((path) => `job:library-analysis-agent:${basename(path, ".json")}`);
const responseSet = new Set(responseJobIds);
const queueSet = new Set(queue.jobs.map(({ jobId }) => jobId));
const receiptByJob = new Map(receipt.acceptedAttemptReceipts.map((entry) => [entry.jobId, entry]));
if (queue.queueHash !== receipt.queueHash || queue.jobs.length !== 18 || receipt.jobCount !== 18 || receipt.state !== "queue_terminal") failures.push({ jobId: "replay", error: "sealed_queue_or_terminal_receipt_mismatch" });
if (responsePaths.length !== 18 || responseSet.size !== responsePaths.length) failures.push({ jobId: "replay", error: "response_count_or_uniqueness_mismatch" });
if (queueSet.size !== queue.jobs.length || [...queueSet].some((id) => !responseSet.has(id)) || [...responseSet].some((id) => !queueSet.has(id))) failures.push({ jobId: "replay", error: "response_queue_job_set_mismatch" });
if (receiptByJob.size !== 18 || [...queueSet].some((id) => !receiptByJob.has(id))) failures.push({ jobId: "replay", error: "sealed_attempt_receipt_set_mismatch" });

let accepted = 0;
for (const responsePath of responsePaths) {
  const response = readJson<{ jobId: string; claims: Array<{ contentUnitId: string; localOrdinal: number }>; responseHash: string; unitCoverage: Array<{ contentUnitId: string; status: string }> }>(responsePath);
  const sealed = receiptByJob.get(response.jobId);
  const inputPath = join(runRoot, "jobs", response.jobId, "attempt-001/input.json");
  try {
    if (sealed === undefined) throw new Error("missing_sealed_attempt_receipt");
    if (basename(responsePath, ".json") !== response.jobId.split(":").at(-1)) throw new Error("response_filename_job_binding_mismatch");
    assertArtifact(responsePath, sealed.responseArtifact, 0o600, "response_artifact");
    const sealedResponse = readJson<{ responseHash: string }>(join(runRoot, "jobs", response.jobId, "attempt-001/response.json"));
    if (response.responseHash !== sealedResponse.responseHash) throw new Error("response_hash_receipt_mismatch");
    assertArtifact(inputPath, sealed.inputArtifact, 0o400, "input_artifact");
    const input = readJson<AttemptInput>(inputPath);
    const queueJob = queue.jobs.find(({ jobId }) => jobId === response.jobId);
    if (queueJob === undefined || input.job.jobId !== response.jobId || input.job.inputEnvelopeHash !== queueJob.inputEnvelopeHash || input.inputHash !== sealed.inputHash) throw new Error("input_queue_binding_mismatch");
    validateLibraryAnalysisAgentSegmentResponse({
      queueHash: input.queueHash,
      attempt: input.attempt,
      inputHash: input.inputHash,
      expectedModel: input.expectedModel as never,
      job: { job: input.job, units: input.units.map(({ text, ...descriptor }) => ({ descriptor, text })) } as never,
      response,
    });
    accepted += 1;
    acceptedJobIds.add(response.jobId);
  } catch (error) {
    rejectedJobIds.add(response.jobId);
    const detail = error instanceof Error ? error.message : String(error);
    const claimBinding = /^(.*):(claim:library-agent:[a-f0-9]{64})$/u.exec(detail);
    if (claimBinding !== null) {
      rejectedClaimBindings.add(`${response.jobId}|${claimBinding[2]}|${claimBinding[1]}`);
      failures.push({ jobId: response.jobId, error: claimBinding[1]! });
    } else if (detail === "agent_response_blocked_material_claim") {
      const contentUnitId = "content:library-analysis:a0752ecef8bc66544a03f6fa57dd52e6efc5df369712cdb3478ca460cd54c384";
      if (!response.unitCoverage.some((entry) => entry.contentUnitId === contentUnitId && entry.status === "blocked")) {
        failures.push({ jobId: response.jobId, error: "blocked_coverage_binding_mismatch" });
      }
      rejectedCoverageBindings.add(`${response.jobId}|${contentUnitId}|${detail}`);
      failures.push({ jobId: response.jobId, error: detail });
    } else {
      failures.push({ jobId: response.jobId, error: detail });
    }
  }
}

const expectedRejected = new Set(expectedRejectedJobs.keys());
const expectedQueueIds = new Set([...expectedAcceptedJobIds, ...expectedRejected]);
const expectedRejectedBindings = new Set([...expectedRejectedClaims].map(([jobId, [claimId, finding]]) => `${jobId}|${claimId}|${finding}`));
const partitionExact = expectedAcceptedJobIds.size === 12 &&
  exactSetMatch(acceptedJobIds, expectedAcceptedJobIds) &&
  exactSetMatch(queueSet, expectedQueueIds) &&
  exactSetMatch(rejectedJobIds, expectedRejected) &&
  exactSetMatch(rejectedClaimBindings, expectedRejectedBindings) &&
  exactSetMatch(rejectedCoverageBindings, expectedRejectedCoverageBindings);
if (!exactSetMatch(acceptedJobIds, expectedAcceptedJobIds)) failures.push({ jobId: "replay", error: "accepted_job_set_mismatch" });
if (!exactSetMatch(queueSet, expectedQueueIds)) failures.push({ jobId: "replay", error: "sealed_queue_literal_set_mismatch" });
if (!exactSetMatch(rejectedJobIds, expectedRejected)) failures.push({ jobId: "replay", error: "rejected_job_set_mismatch" });
if (!exactSetMatch(rejectedClaimBindings, expectedRejectedBindings)) failures.push({ jobId: "replay", error: "rejected_claim_binding_set_mismatch" });
if (!exactSetMatch(rejectedCoverageBindings, expectedRejectedCoverageBindings)) failures.push({ jobId: "replay", error: "rejected_coverage_binding_set_mismatch" });

const errors = Object.fromEntries([...new Set(failures.map(({ error }) => error))].sort().map((error) => [error, failures.filter((failure) => failure.error === error).length]));
const exact = failures.length === expectedRejectedJobs.size && accepted === expectedAcceptedJobIds.size && partitionExact;
console.log(JSON.stringify({ jobs: queue.jobs.length, accepted, rejected: failures.filter(({ jobId }) => jobId !== "replay").length, errors, rejectedJobs: failures.filter(({ jobId }) => jobId !== "replay").sort((a, b) => a.jobId.localeCompare(b.jobId)), exact, writeFree: true }, null, 2));
if (!exact) process.exitCode = 1;
