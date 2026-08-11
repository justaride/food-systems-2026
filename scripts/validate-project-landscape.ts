import fs from "node:fs";
import path from "node:path";

export type JsonRecord = Record<string, any>;

export interface LandscapeData {
  projects: JsonRecord[];
  candidates: JsonRecord[];
  sources: JsonRecord[];
  searchPasses: JsonRecord[];
  report: string;
}

export interface ValidationSummary {
  projects: number;
  candidates: number;
  sources: number;
  searchPasses: number;
  independentSources: number;
  qualitativeFindings: number;
}

const CUTOFF = "2026-08-10";
const projectKeys = ["recordType", "id", "canonicalName", "aliases", "entityKind", "organisations", "layer", "projectType", "geography", "coverage", "audience", "problem", "lifecycle", "methods", "dataAssets", "outputs", "qualitativeProfile", "qualitativeFindings", "urls", "evidence", "analysis", "seed", "seedReason", "notes"];
const candidateKeys = ["recordType", "id", "canonicalName", "aliases", "entityKind", "geography", "workflowStatus", "decision", "relevance", "discoverySourceIds", "knownUrls", "identityResolution", "promotionCriteria", "nextAction", "seed", "seedReason", "lastReviewedAt", "notes"];
const sourceKeys = ["recordType", "id", "projectId", "sourceType", "sourceClass", "role", "independence", "title", "url", "publisher", "publishedAt", "accessedAt", "locator", "supports", "verificationStatus", "citationReadiness", "retrievalStatus", "captureMethod", "archivedUrl", "localPath", "fileHash", "hashAlgorithm", "license", "rightsStatus", "intakeStatus", "notes"];
const searchKeys = ["recordType", "id", "sourceClass", "pass", "cutoff", "executedAt", "queryPortal", "geographies", "perspectives", "queries", "resultsReviewed", "newTierAB", "candidateIds", "promotedIds", "duplicateIds", "exclusions", "coverageCells", "stopRuleMet", "stopReason"];

const enumSets = {
  entityKind: new Set(["project", "programme", "platform", "dataset", "model", "network", "framework", "repository_reference"]),
  layer: new Set(["direct_platform", "model", "food_data", "supply_chain_geo", "knowledge_graph", "transition_program", "enabling_infrastructure"]),
  lifecycle: new Set(["active", "completed", "archived", "planned", "paused", "unknown"]),
  method: new Set(["quantitative", "qualitative", "ethnographic", "participatory", "model_based", "administrative_data", "document_analysis"]),
  dataType: new Set(["dataset", "document_collection", "geospatial", "indicator", "interview", "model_output", "observation", "registry", "survey"]),
  accessMode: new Set(["public_web", "public_summary_only", "restricted"]),
  outputType: new Set(["dashboard", "data_portal", "framework", "map", "model", "network", "other", "report", "toolkit"]),
  participation: new Set(["not_assessed", "consultation", "involvement", "collaboration", "co_creation", "community_control"]),
  finding: new Set(["barrier", "enabler", "tension", "reported_outcome", "evaluated_outcome", "failure", "unintended_effect", "transferable_practice", "open_question"]),
  evidenceStatus: new Set(["owner_reported", "project_reported", "documented", "independently_documented", "internal_analysis", "human_gate"]),
  outputStatus: new Set(["planned", "ongoing", "delivered", "withdrawn", "unknown"]),
  threat: new Set(["low", "medium", "high"]),
  fit: new Set(["direct_analogue", "high_value_partner", "adjacent_reference", "long_tail"]),
  workflow: new Set(["discovered", "identity_resolved", "metadata_verified", "content_acquired", "extracted", "analyst_reviewed", "eligible_main", "duplicate", "not_same", "source_blocked", "human_gated", "reference_only"]),
  decision: new Set(["candidate", "duplicate", "excluded", "reference_only", "human_gated"]),
  sourceClass: new Set(["primary", "secondary", "dataset", "unknown"]),
  sourceRole: new Set(["owner_primary", "funder_registry", "method_result", "independent_evaluation", "discovery_only"]),
  independence: new Set(["owner", "affiliated", "independent", "unknown"]),
  verification: new Set(["verified", "partially_verified", "unverified", "blocked"]),
  citation: new Set(["citable", "citable_with_note", "internal_context", "blocked_rights", "blocked_unsourced", "human_gate"]),
  retrieval: new Set(["metadata_only", "url_accessed", "archived", "local_capture", "blocked"]),
  capture: new Set(["manual_web_review", "api", "download", "local_file", "archive"]),
  rights: new Set(["link_only", "cleared", "restricted", "unknown", "human_gate"]),
  intake: new Set(["discovered", "identity_resolved", "metadata_verified", "content_acquired", "extracted", "analyst_reviewed", "eligible_main", "source_blocked", "human_gated", "reference_only"]),
};

const scoreFields = ["directOverlap", "complementarity", "nordicRelevance", "qualitativeDepth", "learningNovelty", "transferability", "maturity", "collaborationPotential"];
const fieldSourcePaths = ["canonicalName", "entityKind", "organisations", "geography", "problem", "lifecycle.status", "methods", "dataAssets", "outputs"];
const requiredCountries = ["NO", "SE", "DK", "FI", "IS"];
const requiredThemes = ["production", "processing", "distribution", "consumption", "seafood", "local_food", "circularity", "preparedness", "governance", "data_models"];

function fail(message: string): never { throw new Error(message); }
function isObject(value: unknown): value is JsonRecord { return typeof value === "object" && value !== null && !Array.isArray(value); }
function requireObject(value: unknown, label: string): JsonRecord { if (!isObject(value)) fail(`${label} must be an object`); return value; }
function requireString(value: unknown, label: string, allowEmpty = false): string { if (typeof value !== "string" || (!allowEmpty && value.trim() === "")) fail(`${label} must be ${allowEmpty ? "a string" : "a non-empty string"}`); return value; }
function requireStringArray(value: unknown, label: string, allowEmpty = true): string[] { if (!Array.isArray(value) || value.some((item) => typeof item !== "string") || (!allowEmpty && value.length === 0)) fail(`${label} must be ${allowEmpty ? "an" : "a non-empty"} array of strings`); return value; }
function requireDate(value: unknown, label: string, nullable = false): string | null { if (nullable && value === null) return null; const date = requireString(value, label); if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) fail(`${label} must be an ISO date`); return date; }
function requireDateTime(value: unknown, label: string): string { const dateTime = requireString(value, label); if (Number.isNaN(Date.parse(dateTime)) || !dateTime.includes("T")) fail(`${label} must be an ISO date-time`); return dateTime; }
function requireUrl(value: unknown, label: string, allowEmpty = false): string { const url = requireString(value, label, allowEmpty); if (url !== "" && !/^https?:\/\/\S+$/.test(url)) fail(`${label} must be an http(s) URL`); return url; }
function requireEnum(value: unknown, allowed: Set<string>, label: string): string { const result = requireString(value, label); if (!allowed.has(result)) fail(`${label} has invalid value ${result}`); return result; }
function exactKeys(record: JsonRecord, expected: string[], label: string): void { const actual = Object.keys(record).sort(); const wanted = [...expected].sort(); if (actual.join("|") !== wanted.join("|")) fail(`${label} fields differ; expected ${wanted.join(", ")}; got ${actual.join(", ")}`); }
function round2(value: number): number { return Math.round(value * 100) / 100; }
function score(analysis: JsonRecord): number { return round2(0.20 * analysis.directOverlap + 0.15 * analysis.complementarity + 0.15 * analysis.nordicRelevance + 0.15 * analysis.qualitativeDepth + 0.15 * analysis.learningNovelty + 0.10 * analysis.transferability + 0.05 * analysis.maturity + 0.05 * analysis.collaborationPotential); }
function host(url: string): string { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; } }
function expectedEvidenceScore(project: JsonRecord, sourceMap: Map<string, JsonRecord>): number {
  const primary = project.evidence.primarySourceIds as string[];
  const corroborating = project.evidence.corroboratingSourceIds as string[];
  const fieldSources = project.evidence.fieldSources as JsonRecord;
  const linkedIds = new Set<string>([...primary, ...corroborating, ...fieldSourcePaths.flatMap((field) => fieldSources[field] as string[])]);
  const linked = [...linkedIds].map((id) => sourceMap.get(id)).filter((source): source is JsonRecord => Boolean(source));
  const supports = (source: JsonRecord, paths: string[]) => source.supports.some((claim: JsonRecord) => paths.includes(claim.fieldPath));
  const identityAndStatus = primary.some((id) => {
    const source = sourceMap.get(id);
    return source && ["owner_primary", "funder_registry"].includes(source.role)
      && ["verified", "partially_verified"].includes(source.verificationStatus)
      && supports(source, ["canonicalName"])
      && supports(source, ["lifecycle", "lifecycle.status"]);
  });
  const completeFieldProvenance = fieldSourcePaths.every((field) => Array.isArray(fieldSources[field]) && fieldSources[field].length > 0);
  const verifiedMethodOrResult = linked.some((source) => source.verificationStatus === "verified" && supports(source, ["methods", "dataAssets", "outputs", "qualitativeProfile", "qualitativeFindings"]));
  const independentCorroboration = corroborating.some((id) => sourceMap.get(id)?.independence === "independent");
  const independentEvaluation = linked.some((source) => source.role === "independent_evaluation" && source.independence === "independent" && source.verificationStatus === "verified" && supports(source, ["outputs", "qualitativeFindings"]));
  return [identityAndStatus, completeFieldProvenance, verifiedMethodOrResult, independentCorroboration, independentEvaluation].filter(Boolean).length;
}

function parseJsonl(filePath: string): JsonRecord[] {
  if (!fs.existsSync(filePath)) fail(`Missing file: ${filePath}`);
  return fs.readFileSync(filePath, "utf8").split(/\r?\n/).map((line, index) => ({ line: line.trim(), index: index + 1 })).filter(({ line }) => line).map(({ line, index }) => {
    try { return JSON.parse(line) as JsonRecord; } catch (error) { fail(`${path.basename(filePath)}:${index} invalid JSON: ${String(error)}`); }
  });
}

export function loadLandscape(directory: string): LandscapeData {
  return {
    projects: parseJsonl(path.join(directory, "projects-2026-08-10.jsonl")),
    candidates: parseJsonl(path.join(directory, "longlist-2026-08-10.jsonl")),
    sources: parseJsonl(path.join(directory, "sources-2026-08-10.jsonl")),
    searchPasses: parseJsonl(path.join(directory, "search-log-2026-08-10.jsonl")),
    report: fs.readFileSync(path.join(directory, "report-2026-08-10.md"), "utf8"),
  };
}

function validateSource(source: JsonRecord, label: string): void {
  exactKeys(source, sourceKeys, label);
  if (source.recordType !== "source") fail(`${label}.recordType must be source`);
  for (const field of ["id", "projectId", "sourceType", "title", "publisher", "captureMethod", "hashAlgorithm", "license", "rightsStatus", "notes"]) requireString(source[field], `${label}.${field}`);
  requireEnum(source.sourceClass, enumSets.sourceClass, `${label}.sourceClass`);
  requireEnum(source.role, enumSets.sourceRole, `${label}.role`);
  requireEnum(source.independence, enumSets.independence, `${label}.independence`);
  requireEnum(source.verificationStatus, enumSets.verification, `${label}.verificationStatus`);
  requireEnum(source.citationReadiness, enumSets.citation, `${label}.citationReadiness`);
  requireEnum(source.intakeStatus, enumSets.intake, `${label}.intakeStatus`);
  requireEnum(source.retrievalStatus, enumSets.retrieval, `${label}.retrievalStatus`);
  requireEnum(source.captureMethod, enumSets.capture, `${label}.captureMethod`);
  requireEnum(source.rightsStatus, enumSets.rights, `${label}.rightsStatus`);
  requireUrl(source.url, `${label}.url`);
  requireDate(source.publishedAt, `${label}.publishedAt`, true);
  requireDate(source.accessedAt, `${label}.accessedAt`);
  const locator = requireObject(source.locator, `${label}.locator`);
  exactKeys(locator, ["type", "value"], `${label}.locator`);
  requireString(locator.type, `${label}.locator.type`);
  requireString(locator.value, `${label}.locator.value`);
  if (!Array.isArray(source.supports) || (["analyst_reviewed", "eligible_main"].includes(source.intakeStatus) && source.role !== "discovery_only" && source.supports.length === 0)) fail(`${label}.supports must not be empty after analyst review`);
  for (const [index, support] of source.supports.entries()) {
    const item = requireObject(support, `${label}.supports[${index}]`);
    exactKeys(item, ["fieldPath", "claimStatus"], `${label}.supports[${index}]`);
    requireString(item.fieldPath, `${label}.supports[${index}].fieldPath`);
    requireEnum(item.claimStatus, enumSets.evidenceStatus, `${label}.supports[${index}].claimStatus`);
  }
  for (const field of ["archivedUrl", "localPath", "fileHash"]) requireString(source[field], `${label}.${field}`, true);
  if (source.fileHash && !/^[a-f0-9]{64}$/i.test(source.fileHash)) fail(`${label}.fileHash must be sha256 hex`);
  if (source.role === "independent_evaluation" && source.independence !== "independent") fail(`${label} independent evaluation is not independent`);
  if (source.retrievalStatus === "url_accessed" && source.intakeStatus === "discovered") fail(`${label} accessed source cannot remain discovered`);
}

function validateProject(project: JsonRecord, sourceMap: Map<string, JsonRecord>): void {
  const label = `project/${project.id ?? "unknown"}`;
  exactKeys(project, projectKeys, label);
  if (project.recordType !== "project") fail(`${label}.recordType must be project`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(requireString(project.id, `${label}.id`))) fail(`${label}.id is invalid`);
  requireString(project.canonicalName, `${label}.canonicalName`);
  requireStringArray(project.aliases, `${label}.aliases`);
  requireEnum(project.entityKind, enumSets.entityKind, `${label}.entityKind`);
  requireEnum(project.layer, enumSets.layer, `${label}.layer`);
  requireString(project.projectType, `${label}.projectType`);
  if (!Array.isArray(project.organisations) || project.organisations.length === 0) fail(`${label}.organisations must not be empty`);
  for (const [index, organisation] of project.organisations.entries()) {
    const item = requireObject(organisation, `${label}.organisations[${index}]`);
    exactKeys(item, ["name", "role", "country", "countries"], `${label}.organisations[${index}]`);
    for (const field of ["name", "role", "country"]) requireString(item[field], `${label}.organisations[${index}].${field}`);
    requireStringArray(item.countries, `${label}.organisations[${index}].countries`);
  }
  const geography = requireObject(project.geography, `${label}.geography`);
  exactKeys(geography, ["scope", "countries", "places", "indigenousRegions"], `${label}.geography`);
  requireString(geography.scope, `${label}.geography.scope`);
  requireStringArray(geography.countries, `${label}.geography.countries`);
  requireStringArray(geography.places, `${label}.geography.places`);
  requireStringArray(geography.indigenousRegions, `${label}.geography.indigenousRegions`);
  const coverage = requireObject(project.coverage, `${label}.coverage`);
  exactKeys(coverage, ["valueChainStages", "themes", "stakeholderGroups"], `${label}.coverage`);
  for (const field of ["valueChainStages", "themes", "stakeholderGroups"]) requireStringArray(coverage[field], `${label}.coverage.${field}`, false);
  requireStringArray(project.audience, `${label}.audience`, false);
  requireString(project.problem, `${label}.problem`);

  const lifecycle = requireObject(project.lifecycle, `${label}.lifecycle`);
  exactKeys(lifecycle, ["status", "startDate", "endDate", "lastActivityDate", "statusSourceIds"], `${label}.lifecycle`);
  const status = requireEnum(lifecycle.status, enumSets.lifecycle, `${label}.lifecycle.status`);
  const start = requireDate(lifecycle.startDate, `${label}.lifecycle.startDate`, true);
  const end = requireDate(lifecycle.endDate, `${label}.lifecycle.endDate`, true);
  requireDate(lifecycle.lastActivityDate, `${label}.lifecycle.lastActivityDate`);
  const statusSourceIds = requireStringArray(lifecycle.statusSourceIds, `${label}.lifecycle.statusSourceIds`, false);
  if (start && end && start > end) fail(`${label}.lifecycle starts after it ends`);
  if (status === "active" && end && end < CUTOFF) fail(`${label} has unsupported active status after end date`);

  if (!Array.isArray(project.methods) || project.methods.length === 0) fail(`${label}.methods must not be empty`);
  for (const [index, method] of project.methods.entries()) {
    const item = requireObject(method, `${label}.methods[${index}]`);
    exactKeys(item, ["name", "type", "sourceIds"], `${label}.methods[${index}]`);
    requireString(item.name, `${label}.methods[${index}].name`);
    requireEnum(item.type, enumSets.method, `${label}.methods[${index}].type`);
    requireStringArray(item.sourceIds, `${label}.methods[${index}].sourceIds`, false);
  }
  if (!Array.isArray(project.dataAssets) || project.dataAssets.length === 0) fail(`${label}.dataAssets must not be empty`);
  for (const [index, asset] of project.dataAssets.entries()) {
    const item = requireObject(asset, `${label}.dataAssets[${index}]`);
    exactKeys(item, ["name", "dataType", "geography", "period", "granularity", "accessMode", "license", "updateCadence", "knownBiases", "sourceIds"], `${label}.dataAssets[${index}]`);
    for (const field of ["name", "geography", "period", "granularity", "license", "updateCadence"]) requireString(item[field], `${label}.dataAssets[${index}].${field}`);
    requireEnum(item.dataType, enumSets.dataType, `${label}.dataAssets[${index}].dataType`);
    requireEnum(item.accessMode, enumSets.accessMode, `${label}.dataAssets[${index}].accessMode`);
    requireStringArray(item.knownBiases, `${label}.dataAssets[${index}].knownBiases`, false);
    requireStringArray(item.sourceIds, `${label}.dataAssets[${index}].sourceIds`, false);
  }
  if (!Array.isArray(project.outputs) || project.outputs.length === 0) fail(`${label}.outputs must not be empty`);
  for (const [index, output] of project.outputs.entries()) {
    const item = requireObject(output, `${label}.outputs[${index}]`);
    exactKeys(item, ["name", "outputType", "date", "status", "sourceIds"], `${label}.outputs[${index}]`);
    requireString(item.name, `${label}.outputs[${index}].name`);
    requireEnum(item.outputType, enumSets.outputType, `${label}.outputs[${index}].outputType`);
    requireDate(item.date, `${label}.outputs[${index}].date`, true);
    requireEnum(item.status, enumSets.outputStatus, `${label}.outputs[${index}].status`);
    requireStringArray(item.sourceIds, `${label}.outputs[${index}].sourceIds`, false);
  }

  const qualitative = requireObject(project.qualitativeProfile, `${label}.qualitativeProfile`);
  exactKeys(qualitative, ["participantGroups", "knowledgeTypes", "participationDepth", "ethicsRightsNotes"], `${label}.qualitativeProfile`);
  requireStringArray(qualitative.participantGroups, `${label}.qualitativeProfile.participantGroups`);
  requireStringArray(qualitative.knowledgeTypes, `${label}.qualitativeProfile.knowledgeTypes`, false);
  requireEnum(qualitative.participationDepth, enumSets.participation, `${label}.qualitativeProfile.participationDepth`);
  requireString(qualitative.ethicsRightsNotes, `${label}.qualitativeProfile.ethicsRightsNotes`);
  if (!Array.isArray(project.qualitativeFindings)) fail(`${label}.qualitativeFindings must be an array`);
  for (const [index, finding] of project.qualitativeFindings.entries()) {
    const item = requireObject(finding, `${label}.qualitativeFindings[${index}]`);
    exactKeys(item, ["id", "type", "statement", "evidenceStatus", "sourceIds", "transferability"], `${label}.qualitativeFindings[${index}]`);
    requireString(item.id, `${label}.qualitativeFindings[${index}].id`);
    requireEnum(item.type, enumSets.finding, `${label}.qualitativeFindings[${index}].type`);
    requireString(item.statement, `${label}.qualitativeFindings[${index}].statement`);
    requireEnum(item.evidenceStatus, enumSets.evidenceStatus, `${label}.qualitativeFindings[${index}].evidenceStatus`);
    requireStringArray(item.sourceIds, `${label}.qualitativeFindings[${index}].sourceIds`, false);
    requireString(item.transferability, `${label}.qualitativeFindings[${index}].transferability`);
  }

  const evidence = requireObject(project.evidence, `${label}.evidence`);
  exactKeys(evidence, ["primarySourceIds", "corroboratingSourceIds", "confidence", "lastVerifiedAt", "fieldSources"], `${label}.evidence`);
  const primary = requireStringArray(evidence.primarySourceIds, `${label}.evidence.primarySourceIds`, false);
  const corroborating = requireStringArray(evidence.corroboratingSourceIds, `${label}.evidence.corroboratingSourceIds`);
  requireString(evidence.confidence, `${label}.evidence.confidence`);
  requireDate(evidence.lastVerifiedAt, `${label}.evidence.lastVerifiedAt`);
  const fieldSources = requireObject(evidence.fieldSources, `${label}.evidence.fieldSources`);
  exactKeys(fieldSources, fieldSourcePaths, `${label}.evidence.fieldSources`);
  for (const field of fieldSourcePaths) requireStringArray(fieldSources[field], `${label}.evidence.fieldSources.${field}`, false);
  const allNestedSourceIds = [statusSourceIds, ...project.methods.map((item: JsonRecord) => item.sourceIds), ...project.dataAssets.map((item: JsonRecord) => item.sourceIds), ...project.outputs.map((item: JsonRecord) => item.sourceIds), ...project.qualitativeFindings.map((item: JsonRecord) => item.sourceIds), ...fieldSourcePaths.map((field) => fieldSources[field])].flat();
  for (const sourceId of new Set([...primary, ...corroborating, ...allNestedSourceIds])) {
    const source = sourceMap.get(sourceId);
    if (!source) fail(`${label} links missing source ${sourceId}`);
    if (source.projectId !== project.id) fail(`${label} links source ${sourceId} owned by ${source.projectId}`);
  }
  const ownerDomains = new Set(primary.map((id) => sourceMap.get(id)!).filter((source) => ["owner", "affiliated"].includes(source.independence)).map((source) => host(source.url)));
  for (const sourceId of corroborating) {
    const source = sourceMap.get(sourceId)!;
    if (source.independence !== "independent") fail(`${label} uses non-independent corroboration ${sourceId}`);
    if (ownerDomains.has(host(source.url))) fail(`${label} uses same-domain corroboration ${sourceId}`);
  }

  const analysis = requireObject(project.analysis, `${label}.analysis`);
  exactKeys(analysis, [...scoreFields, "competitiveThreat", "fitCategory", "overlap", "complementarityNarrative", "nextAction", "priorityScore", "evidenceScore"], `${label}.analysis`);
  for (const field of scoreFields) if (typeof analysis[field] !== "number" || analysis[field] < 0 || analysis[field] > 5) fail(`${label}.analysis.${field} must be 0–5`);
  if (typeof analysis.priorityScore !== "number" || analysis.priorityScore !== score(analysis)) fail(`${label}.analysis.priorityScore ${analysis.priorityScore} != ${score(analysis)}`);
  const expectedEvidence = expectedEvidenceScore(project, sourceMap);
  if (typeof analysis.evidenceScore !== "number" || analysis.evidenceScore !== expectedEvidence) fail(`${label}.analysis.evidenceScore ${analysis.evidenceScore} != ${expectedEvidence}`);
  requireEnum(analysis.competitiveThreat, enumSets.threat, `${label}.analysis.competitiveThreat`);
  requireEnum(analysis.fitCategory, enumSets.fit, `${label}.analysis.fitCategory`);
  for (const field of ["overlap", "complementarityNarrative", "nextAction"]) requireString(analysis[field], `${label}.analysis.${field}`);
  const urls = requireObject(project.urls, `${label}.urls`);
  exactKeys(urls, ["official", "repository", "documentation", "liveProduct", "publication", "funding"], `${label}.urls`);
  for (const field of ["official", "repository", "documentation", "liveProduct", "publication", "funding"]) requireUrl(urls[field], `${label}.urls.${field}`, true);
  if (typeof project.seed !== "boolean") fail(`${label}.seed must be boolean`);
  requireString(project.seedReason, `${label}.seedReason`);
  requireString(project.notes, `${label}.notes`);
}

function validateCandidate(candidate: JsonRecord): void {
  const label = `candidate/${candidate.id ?? "unknown"}`;
  exactKeys(candidate, candidateKeys, label);
  if (candidate.recordType !== "candidate") fail(`${label}.recordType must be candidate`);
  requireString(candidate.id, `${label}.id`);
  requireString(candidate.canonicalName, `${label}.canonicalName`);
  requireStringArray(candidate.aliases, `${label}.aliases`);
  requireEnum(candidate.entityKind, enumSets.entityKind, `${label}.entityKind`);
  const geography = requireObject(candidate.geography, `${label}.geography`);
  exactKeys(geography, ["scope", "countries", "places", "indigenousRegions"], `${label}.geography`);
  requireString(geography.scope, `${label}.geography.scope`);
  for (const field of ["countries", "places", "indigenousRegions"]) requireStringArray(geography[field], `${label}.geography.${field}`);
  requireEnum(candidate.workflowStatus, enumSets.workflow, `${label}.workflowStatus`);
  requireEnum(candidate.decision, enumSets.decision, `${label}.decision`);
  requireString(candidate.relevance, `${label}.relevance`);
  requireStringArray(candidate.discoverySourceIds, `${label}.discoverySourceIds`, false);
  for (const [index, url] of requireStringArray(candidate.knownUrls, `${label}.knownUrls`).entries()) requireUrl(url, `${label}.knownUrls[${index}]`);
  const identity = requireObject(candidate.identityResolution, `${label}.identityResolution`);
  exactKeys(identity, ["suspectedOwner", "duplicateOf", "unresolvedQuestions"], `${label}.identityResolution`);
  if (identity.suspectedOwner !== null) requireString(identity.suspectedOwner, `${label}.identityResolution.suspectedOwner`);
  if (identity.duplicateOf !== null) requireString(identity.duplicateOf, `${label}.identityResolution.duplicateOf`);
  requireStringArray(identity.unresolvedQuestions, `${label}.identityResolution.unresolvedQuestions`);
  requireStringArray(candidate.promotionCriteria, `${label}.promotionCriteria`, false);
  requireString(candidate.nextAction, `${label}.nextAction`);
  requireDate(candidate.lastReviewedAt, `${label}.lastReviewedAt`);
  if (typeof candidate.seed !== "boolean") fail(`${label}.seed must be boolean`);
  requireString(candidate.seedReason, `${label}.seedReason`);
  requireString(candidate.notes, `${label}.notes`);
  if ("analysis" in candidate || "priorityScore" in candidate || candidate.workflowStatus === "eligible_main") fail(`${label} cannot be ranked or eligible while on longlist`);
}

function ranked(projects: JsonRecord[]): JsonRecord[] { return [...projects].sort((a, b) => b.analysis.priorityScore - a.analysis.priorityScore || a.canonicalName.localeCompare(b.canonicalName, "nb")); }

export function validateLandscape(data: LandscapeData): ValidationSummary {
  if (data.projects.length !== 40) fail(`Main register must contain exactly 40 projects, got ${data.projects.length}`);
  if (data.candidates.length < 1) fail("Longlist must remain evidence-driven and non-empty");
  const allIds = new Set<string>();
  for (const record of [...data.projects, ...data.candidates]) { if (!record.id || allIds.has(record.id)) fail(`Duplicate or empty project/candidate id: ${record.id}`); allIds.add(record.id); }
  const sourceMap = new Map<string, JsonRecord>();
  for (const source of data.sources) { if (!source.id || sourceMap.has(source.id)) fail(`Duplicate or empty source id: ${source.id}`); sourceMap.set(source.id, source); validateSource(source, `source/${source.id}`); }
  for (const project of data.projects) validateProject(project, sourceMap);
  for (const candidate of data.candidates) {
    validateCandidate(candidate);
    for (const sourceId of candidate.discoverySourceIds) {
      const source = sourceMap.get(sourceId);
      if (!source) fail(`candidate/${candidate.id} links missing discovery source ${sourceId}`);
      if (source.projectId !== candidate.id) fail(`candidate/${candidate.id} links discovery source ${sourceId} owned by ${source.projectId}`);
    }
  }
  for (const source of data.sources) if (!allIds.has(source.projectId)) fail(`Orphan source ${source.id} points to ${source.projectId}`);

  const countries = new Set(data.projects.flatMap((project) => project.geography.countries));
  for (const code of requiredCountries) if (!countries.has(code)) fail(`Coverage gap is not resolved for ${code}`);
  if (!["FO", "GL", "AX"].some((code) => countries.has(code))) fail("At least one of Faroe Islands, Greenland or Åland must have verified coverage");
  if (!data.projects.some((project) => project.geography.indigenousRegions.includes("Sápmi"))) fail("Sápmi coverage is missing");
  const stages = new Set(data.projects.flatMap((project) => project.coverage.valueChainStages));
  const themes = new Set(data.projects.flatMap((project) => project.coverage.themes));
  for (const requirement of requiredThemes) if (!(stages.has(requirement) || themes.has(requirement))) fail(`Thematic coverage is missing ${requirement}`);

  const searchMap = new Map<string, JsonRecord>();
  for (const pass of data.searchPasses) {
    const label = `search/${pass.id ?? "unknown"}`;
    exactKeys(pass, searchKeys, label);
    if (pass.recordType !== "search_pass") fail(`${label}.recordType must be search_pass`);
    requireString(pass.sourceClass, `${label}.sourceClass`);
    if (![1, 2].includes(pass.pass)) fail(`${label}.pass must be 1 or 2`);
    requireDate(pass.cutoff, `${label}.cutoff`);
    requireDateTime(pass.executedAt, `${label}.executedAt`);
    for (const field of ["geographies", "perspectives", "queries", "candidateIds", "promotedIds", "duplicateIds", "coverageCells"]) requireStringArray(pass[field], `${label}.${field}`);
    if (!Array.isArray(pass.exclusions)) fail(`${label}.exclusions must be an array`);
    for (const [index, exclusion] of pass.exclusions.entries()) {
      const item = requireObject(exclusion, `${label}.exclusions[${index}]`);
      exactKeys(item, ["candidateId", "decision", "reason"], `${label}.exclusions[${index}]`);
      for (const field of ["candidateId", "decision", "reason"]) requireString(item[field], `${label}.exclusions[${index}].${field}`);
    }
    requireString(pass.queryPortal, `${label}.queryPortal`);
    if (typeof pass.resultsReviewed !== "number" || pass.resultsReviewed < 0) fail(`${label}.resultsReviewed must be non-negative`);
    if (typeof pass.newTierAB !== "number" || pass.newTierAB < 0) fail(`${label}.newTierAB must be non-negative`);
    const key = `${pass.sourceClass}:${pass.pass}`;
    if (searchMap.has(key)) fail(`Duplicate search pass ${key}`);
    searchMap.set(key, pass);
    for (const id of [...pass.candidateIds, ...pass.promotedIds, ...pass.duplicateIds]) if (!allIds.has(id)) fail(`${label} references unknown project/candidate ${id}`);
    for (const exclusion of pass.exclusions) if (!allIds.has(exclusion.candidateId)) fail(`${label} excludes unknown candidate ${exclusion.candidateId}`);
  }
  for (const sourceClass of new Set(data.searchPasses.map((pass) => pass.sourceClass))) {
    if (!searchMap.has(`${sourceClass}:1`) || !searchMap.has(`${sourceClass}:2`)) fail(`Missing two-pass evidence for ${sourceClass}`);
    const second = searchMap.get(`${sourceClass}:2`)!;
    if (second.newTierAB !== 0 || second.stopRuleMet !== true || typeof second.stopReason !== "string" || second.stopReason.trim() === "") fail(`Pass 2 for ${sourceClass} does not satisfy stop rule`);
  }
  const loggedCoverage = new Set(data.searchPasses.flatMap((pass) => pass.coverageCells));
  for (const cell of ["NO", "SE", "DK", "FI", "IS", "Sápmi"]) if (![...loggedCoverage].some((entry) => entry.includes(cell))) fail(`Search log lacks coverage cell ${cell}`);

  const ranking = ranked(data.projects);
  for (const count of [10, 25, 40]) {
    const marker = data.report.match(new RegExp(`<!-- TOP${count}_IDS: ([a-z0-9,-]+) -->`));
    if (!marker) fail(`Report is missing TOP${count}_IDS reproducibility marker`);
    const expected = ranking.slice(0, count).map((project) => project.id).join(",");
    if (marker[1] !== expected) fail(`Report TOP${count}_IDS does not reproduce register ranking`);
  }
  for (const project of data.projects) if (!data.report.includes(`\`${project.id}\``)) fail(`Report does not mention main project id ${project.id}`);
  for (const heading of ["Go/no-go", "Topp 10", "Topp 25", "Topp 40", "Geografisk dekning", "Tematisk dekning", "Dataunderlag", "Kvalitative læringsmønstre", "Usikkerhet og konflikter", "Prioriterte neste handlinger"]) if (!data.report.includes(heading)) fail(`Report is missing section ${heading}`);

  return {
    projects: data.projects.length,
    candidates: data.candidates.length,
    sources: data.sources.length,
    searchPasses: data.searchPasses.length,
    independentSources: data.sources.filter((source) => source.independence === "independent").length,
    qualitativeFindings: data.projects.reduce((sum, project) => sum + project.qualitativeFindings.length, 0),
  };
}

function main(): void {
  const dirArg = process.argv.find((argument) => argument.startsWith("--dir="));
  const directory = path.resolve(dirArg ? dirArg.slice("--dir=".length) : path.join(process.cwd(), "research", "landscape"));
  const summary = validateLandscape(loadLandscape(directory));
  console.log(`Landscape validation passed: ${summary.projects} main, ${summary.candidates} candidates/dispositions, ${summary.sources} sources, ${summary.independentSources} independent sources, ${summary.qualitativeFindings} qualitative findings, ${summary.searchPasses} search passes.`);
}

if (process.argv[1]?.endsWith("validate-project-landscape.ts")) main();
