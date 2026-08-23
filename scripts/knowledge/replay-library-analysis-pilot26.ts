import { createHash } from "node:crypto";
import { lstatSync, readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";

import { LibraryAnalysisAgentTerminalReceiptSchema } from "../../src/lib/knowledge/library-analysis-agent-checkpoint";
import { verifyLibraryAnalysisAgentQueue } from "../../src/lib/knowledge/library-analysis-agent-queue";
import { validateLibraryAnalysisAgentSegmentResponse } from "../../src/lib/knowledge/library-analysis-agent-response";

const runRoot = "/Users/gabrielfreeman/.local/share/foodsystems/library-analysis-runs/20260823-ai-validation/codex-native-pilot-26";
const queueHash = "e83e94e45a46f32eda4684ee703e3dabda75c961f1f74667cf70901978ae8359";
const queuePath = join(runRoot, `queue/queue-${queueHash}.json`);
const receiptPath = join(runRoot, "terminal/receipt.json");
const terminalReceiptSha256 = "17b9b99699e5b2bf7711b653cac0f8ae0da8ac0cce472ac06eeada085087db14";
const responseRoot = join(process.cwd(), ".superpowers/sdd/2026-08-21-codex-native-library-analysis-orchestration/pilot26-worker-responses");

type AttemptInput = {
  queueHash: string;
  attempt: number;
  inputHash: string;
  expectedModel: unknown;
  job: Record<string, unknown> & { inputEnvelopeHash: string; jobId: string };
  units: Array<Record<string, unknown> & { text: string }>;
};
type Artifact = { mode: number; portablePath: string; sha256: string; sizeBytes: number };
type AttemptReceipt = {
  queueHash: string;
  jobId: string;
  jobHash: string;
  attempt: number;
  status: string;
  inputHash: string;
  inputArtifact: Artifact;
  responseArtifact: Artifact;
  responseHash: string;
  model?: unknown;
};
type AgentResponse = {
  jobId: string;
  responseHash: string;
  claims: Array<{ contentUnitId: string; localOrdinal: number }>;
  unitCoverage: Array<{ contentUnitId: string; status: string }>;
};

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
  if ((stat.mode & 0o777) !== expectedMode || artifact.mode !== 0o400) throw new Error(`${label}_mode_mismatch`);
  if (stat.size !== artifact.sizeBytes || sha256(path) !== artifact.sha256) throw new Error(`${label}_integrity_mismatch`);
}
function exactSetMatch(actual: ReadonlySet<string>, expected: ReadonlySet<string>): boolean {
  return actual.size === expected.size && [...expected].every((value) => actual.has(value));
}
function runReplayMutationSelfTests(): void {
  const expected = new Set(["a", "b"]);
  if (exactSetMatch(new Set(["a"]), expected)) throw new Error("replay_self_test_missing_value_not_detected");
  if (exactSetMatch(new Set(["a", "c"]), expected)) throw new Error("replay_self_test_substitution_not_detected");
  if (exactSetMatch(new Set(["a", "b", "c"]), expected)) throw new Error("replay_self_test_extra_value_not_detected");
}
runReplayMutationSelfTests();

function assertReceiptEnvelope(
  queue: { queueHash: string; jobs: ReadonlyArray<{ jobId: string; inputEnvelopeHash: string }> },
  receipt: { queueHash: string; jobCount: number; acceptedAttemptReceipts: ReadonlyArray<AttemptReceipt> },
): void {
  if (receipt.queueHash !== queue.queueHash || receipt.jobCount !== queue.jobs.length) throw new Error("receipt_queue_binding_mismatch");
  if (receipt.acceptedAttemptReceipts.length !== queue.jobs.length) throw new Error("receipt_attempt_count_mismatch");
  const byJob = new Map(receipt.acceptedAttemptReceipts.map((entry) => [entry.jobId, entry]));
  if (byJob.size !== receipt.acceptedAttemptReceipts.length) throw new Error("receipt_attempt_duplicate");
  for (const job of queue.jobs) {
    const entry = byJob.get(job.jobId);
    if (
      entry === undefined || entry.queueHash !== queue.queueHash || entry.jobHash !== job.inputEnvelopeHash ||
      entry.attempt !== 1 || entry.status !== "accepted" ||
      entry.inputArtifact.portablePath !== `jobs/${job.jobId}/attempt-001/input.json` ||
      entry.responseArtifact.portablePath !== `jobs/${job.jobId}/attempt-001/response.json`
    ) throw new Error("receipt_attempt_binding_mismatch");
  }
}

const expectedAcceptedJobIds = new Set([
  "job:library-analysis-agent:13892c63e288799063dd59d4ef15d9ee57b8fce039e936617cbb0b249fbcebb0",
  "job:library-analysis-agent:14c4df1d94a803c3aadd7fbd423fee8d9b6965681595771bf6ced7f17c7f81f5",
  "job:library-analysis-agent:fa7ebc12177c03857926f61dc6c0e2d39e64fdc5b525b7c31da96d76619fcfbb",
  "job:library-analysis-agent:7337ef7fa9abe9363f5066d6d049fb9edff84dbbfaa597fcb41955ed77d9454a",
  "job:library-analysis-agent:bdfecf7798985adc8ea0d525d32996e2236923d2da0679dd99c21b0791389c5f",
  "job:library-analysis-agent:ff236178c411189c7bad18278cd20b82e0b6b95e358d3dd7cbc36abde789529a",
  "job:library-analysis-agent:05f751c1472303b5b6c4c1a35a0c08c45911333265ab41c9e0c3337e4bf2ef2f",
  "job:library-analysis-agent:4e98675199166c9b9d42e9d99f540d6e839181f088b16e11d1488145b31f9d8e",
  "job:library-analysis-agent:8f96c52d4212e43dd0612d952957a0d9bc64f2f2836f83f07129174c43e78456",
]);
const expectedRejectedClaimBindings = new Set([
  "job:library-analysis-agent:332997ea481278fea9b640eca33943081fd24de57215363c3a78531d12380c0c|claim:library-agent:4118c789bbe3f80bafd2766be79026fec86ac1505ff8c93a6dd0720777818ca9|agent_response_reported_measure_context_missing",
  "job:library-analysis-agent:454768efa4f39c7d763d0ddae3e2db5c8223c79cd606d73649cda2f71d9342f0|claim:library-agent:2c2d79eb0b5fb4dfbde4cb73bc7181084cb29ba72baf6e84d8452769a7cd0405|agent_response_evidence_context_dependent",
  "job:library-analysis-agent:617fa81e8364e9563ac88a9b9d7a8ba288261846a13f7e806ddd17a1f820ac24|claim:library-agent:0a43d34300c876ad48e8fc3709ac6f2b6079f813c0b554ac2eea9029fd287b53|agent_response_figure_context_missing",
  "job:library-analysis-agent:81efe211513b8f9e5ef12b60e82759199509daf9c02fa0fe429fc82b78426f20|claim:library-agent:8294a618901218d3152df2c8d2cc1d3215f34d11460574744f2dc97a9fd68e80|agent_response_evidence_context_dependent",
  "job:library-analysis-agent:c5417c13b8180edecca9982d38e7c3253c317a2fc8c1a40793edbf4323f9b0dc|claim:library-agent:bf562894c4bc2cef7810159c3194f694ac7971dc7b8e26b961c4f3eab79f461e|agent_response_ownership_scope_missing",
  "job:library-analysis-agent:de1d2f86a750570efdbc5adaeeb93e9112e5df29f959e6af86842beb87c5462e|claim:library-agent:20da17ea07367b22141d7add9c3ba1c6c91b07db5773e750d4cd45b7bf63b171|agent_response_staffing_scope_or_as_of_missing",
  "job:library-analysis-agent:eba50c672dd49238cea531d987824161a2954967145aad7535890fb60801ba6a|claim:library-agent:44bfd04003a540a9b7cb7d167e1b3e4bd10d275ce35db6bb881ea491fa92d51f|agent_response_footnote_context_missing",
  "job:library-analysis-agent:fe161ee8cf620662882b95ac6ab662123ffabf1606cb891bfa10e4274e29fa11|claim:library-agent:e712b3fec099fe9dec34c5adda7955d451fa04274a1e25db38f897163d4a9f9b|agent_response_evidence_incomplete",
]);
const blockedCoverageBinding = "job:library-analysis-agent:5dbc4d81a1c11b6ec39bdb0195632ca77123fc4b81f80c623c3ec733f6b76656|content:library-analysis:a0752ecef8bc66544a03f6fa57dd52e6efc5df369712cdb3478ca460cd54c384|agent_response_blocked_material_claim";
const expectedRejectedBindings = new Set([...expectedRejectedClaimBindings, blockedCoverageBinding]);
const expectedRejectedJobIds = new Set([...expectedRejectedBindings].map((value) => value.split("|", 1)[0]!));

const rawQueue = readJson<unknown>(queuePath);
const queue = verifyLibraryAnalysisAgentQueue(rawQueue);
const receipt = LibraryAnalysisAgentTerminalReceiptSchema.parse(readJson<unknown>(receiptPath));
assertReceiptEnvelope(queue, receipt);
const mutatedQueue = structuredClone(rawQueue) as { executionPolicy?: { maximumCodePointsPerJob?: number } };
if (mutatedQueue.executionPolicy !== undefined) mutatedQueue.executionPolicy.maximumCodePointsPerJob = 1;
let queueMutationRejected = false;
try { verifyLibraryAnalysisAgentQueue(mutatedQueue); } catch { queueMutationRejected = true; }
if (!queueMutationRejected) throw new Error("replay_self_test_queue_mutation_not_detected");
const duplicateReceipt = structuredClone(receipt);
duplicateReceipt.acceptedAttemptReceipts.push(duplicateReceipt.acceptedAttemptReceipts[0]!);
let duplicateReceiptRejected = false;
try { assertReceiptEnvelope(queue, duplicateReceipt); } catch { duplicateReceiptRejected = true; }
if (!duplicateReceiptRejected) throw new Error("replay_self_test_receipt_duplicate_not_detected");
const pathMutationReceipt = structuredClone(receipt);
pathMutationReceipt.acceptedAttemptReceipts[0]!.responseArtifact.portablePath = "jobs/substituted/attempt-001/response.json";
let pathMutationRejected = false;
try { assertReceiptEnvelope(queue, pathMutationReceipt); } catch { pathMutationRejected = true; }
if (!pathMutationRejected) throw new Error("replay_self_test_receipt_path_mutation_not_detected");
const responsePaths = collectResponsePaths(responseRoot);
const responseJobIds = new Set(responsePaths.map((path) => `job:library-analysis-agent:${basename(path, ".json")}`));
const queueJobIds = new Set(queue.jobs.map(({ jobId }) => jobId));
const expectedQueueJobIds = new Set([...expectedAcceptedJobIds, ...expectedRejectedJobIds]);
const receiptByJob = new Map(receipt.acceptedAttemptReceipts.map((entry) => [entry.jobId, entry]));
const acceptedJobIds = new Set<string>();
const rejectedJobIds = new Set<string>();
const rejectedBindings = new Set<string>();
const failures: Array<{ jobId: string; error: string }> = [];
let totalClaims = 0;

if ((lstatSync(receiptPath).mode & 0o777) !== 0o400 || sha256(receiptPath) !== terminalReceiptSha256) failures.push({ jobId: "replay", error: "terminal_receipt_integrity_mismatch" });
if (queue.queueHash !== queueHash || receipt.queueHash !== queueHash || queue.jobs.length !== 18 || receipt.jobCount !== 18 || receipt.state !== "queue_terminal") failures.push({ jobId: "replay", error: "sealed_queue_or_terminal_receipt_mismatch" });
if (!exactSetMatch(queueJobIds, expectedQueueJobIds)) failures.push({ jobId: "replay", error: "sealed_queue_literal_set_mismatch" });
if (responsePaths.length !== 18 || !exactSetMatch(responseJobIds, queueJobIds)) failures.push({ jobId: "replay", error: "response_queue_job_set_mismatch" });
if (receiptByJob.size !== 18 || [...queueJobIds].some((jobId) => !receiptByJob.has(jobId))) failures.push({ jobId: "replay", error: "sealed_attempt_receipt_set_mismatch" });

for (const responsePath of responsePaths) {
  const filenameJobId = `job:library-analysis-agent:${basename(responsePath, ".json")}`;
  const sealed = receiptByJob.get(filenameJobId);
  const inputPath = join(runRoot, "jobs", filenameJobId, "attempt-001/input.json");
  let response: AgentResponse | undefined;
  try {
    if (sealed === undefined) throw new Error("missing_sealed_attempt_receipt");
    assertArtifact(responsePath, sealed.responseArtifact, 0o600, "response_artifact");
    response = readJson<AgentResponse>(responsePath);
    if (!Array.isArray(response.claims) || !Array.isArray(response.unitCoverage)) throw new Error("response_shape_invalid");
    totalClaims += response.claims.length;
    if (response.jobId !== filenameJobId) throw new Error("response_filename_job_binding_mismatch");
    assertArtifact(inputPath, sealed.inputArtifact, 0o400, "input_artifact");
    const sealedResponse = readJson<{ responseHash: string }>(join(runRoot, "jobs", filenameJobId, "attempt-001/response.json"));
    if (response.responseHash !== sealedResponse.responseHash || sha256(responsePath) !== sealed.responseHash) throw new Error("response_hash_receipt_mismatch");
    const input = readJson<AttemptInput>(inputPath);
    const queueJob = queue.jobs.find(({ jobId }) => jobId === filenameJobId);
    const inputModel = input.expectedModel as { provider?: string; name?: string; version?: string };
    const receiptModel = sealed.model as { provider?: string; name?: string; version?: string } | undefined;
    if (queueJob === undefined || input.job.jobId !== filenameJobId || input.job.inputEnvelopeHash !== queueJob.inputEnvelopeHash || input.inputHash !== sealed.inputHash || input.queueHash !== queueHash || receiptModel === undefined || inputModel.provider !== receiptModel.provider || inputModel.name !== receiptModel.name || inputModel.version !== receiptModel.version) throw new Error("input_queue_binding_mismatch");
    validateLibraryAnalysisAgentSegmentResponse({
      queueHash: input.queueHash,
      attempt: input.attempt,
      inputHash: input.inputHash,
      expectedModel: input.expectedModel as never,
      job: { job: input.job, units: input.units.map(({ text, ...descriptor }) => ({ descriptor, text })) } as never,
      response,
    });
    acceptedJobIds.add(filenameJobId);
  } catch (error) {
    rejectedJobIds.add(filenameJobId);
    const detail = error instanceof Error ? error.message : String(error);
    const claimBinding = /^(.*):(claim:library-agent:[a-f0-9]{64})$/u.exec(detail);
    if (claimBinding !== null) {
      rejectedBindings.add(`${filenameJobId}|${claimBinding[2]}|${claimBinding[1]}`);
      continue;
    }
    if (filenameJobId === blockedCoverageBinding.split("|", 1)[0] && detail === "agent_response_blocked_material_claim" && response !== undefined) {
      const contentUnitId = blockedCoverageBinding.split("|")[1]!;
      const coverage = response.unitCoverage.find((entry) => entry.contentUnitId === contentUnitId);
      if (coverage?.status !== "blocked") failures.push({ jobId: filenameJobId, error: "blocked_coverage_binding_mismatch" });
      rejectedBindings.add(`${filenameJobId}|${contentUnitId}|${detail}`);
      continue;
    }
    failures.push({ jobId: filenameJobId, error: detail });
  }
}

if (!exactSetMatch(acceptedJobIds, expectedAcceptedJobIds)) failures.push({ jobId: "replay", error: "accepted_job_set_mismatch" });
if (!exactSetMatch(rejectedJobIds, expectedRejectedJobIds)) failures.push({ jobId: "replay", error: "rejected_job_set_mismatch" });
if (!exactSetMatch(rejectedBindings, expectedRejectedBindings)) failures.push({ jobId: "replay", error: "rejected_binding_set_mismatch" });
const exact = failures.length === 0 && totalClaims === 81;
console.log(JSON.stringify({ jobs: queue.jobs.length, totalClaims, accepted: acceptedJobIds.size, rejected: rejectedJobIds.size, rejectedBindings: rejectedBindings.size, exact, writeFree: true, failures }, null, 2));
if (!exact) process.exitCode = 1;
