# Source-analysis artifact contract v1

Status: strict internal contract

Schema version: `source-analysis-artifact-v1`

Implementation version: `1.1.0`

This contract is the machine-checkable form of the candidate-analysis step in the whole-corpus source-analysis protocol. It records one complete, hash-bound AI reading of one verified source-text snapshot. It does not record owner approval, independent validation, rights clearance, publication approval or coverage promotion.

## The two full-text states are different

`fullTextEligibility` proves only that the exact source identity, bytes, extracted text and expected page or section sequence are available and have no unresolved technical blocker.

`actualFullTextReading` separately proves that named AI runs received the exact text hash and read the entire ordered locator sequence. A source is not AI-read when only the eligibility object exists, when any unit is missing, or when the reading run cannot be matched.

## Required binding

Every artifact binds all of the following:

- exact verified analysis lifecycle record ID, canonical lifecycle-snapshot hash and snapshot time;
- the immutable verified input-manifest revision and its exact provisional predecessor;
- the provisional identity-verification pre-state (`L1`) and distinct verified analysis pre-state (`L2`);
- exact source ID, verified identity state, metadata hash and content hash;
- exact verified identity-artifact ID, version, hash and canonical identity;
- exact normalized full-text hash;
- exact extraction artifact, extraction artifact hash and text-manifest hash;
- exact AI run IDs, provider, model, model version, canonical workflow and prompt-template IDs, versions, repository paths, whole-file hashes, input hashes, output hashes and timestamps;
- exact page or section locator IDs, their normalized text-unit hashes, byte counts, Unicode character counts and word counts;
- a stable artifact lineage, version, predecessor binding for revisions, analysis-payload hash and complete artifact hash.

The analysis lifecycle snapshot hash is the SHA-256 of its canonical JSON at the point the analysis begins. The positive manifest separately seals the earlier provisional identity snapshot. `validateSourceAnalysisArtifactWithEvidenceBundle` parses both manifests and the identity artifact from exact file bytes, requires the identity file's content-addressed repository path, validates the complete identity evidence bundle, recomputes file hashes and internal seals, and requires the only lifecycle transition between `L1` and `L2` to be the verified-identity change. It separately receives the canonical workflow bytes, prompt-template bytes and every ordered normalized-page byte, verifies their paths, hashes, UTF-8 validity and declared counts, and recomputes the complete framed normalized input. It compares the complete binding with the expected source, content, text and scope state rather than trusting fields copied from the analysis itself. The narrower `validateSourceAnalysisArtifactAfterReplayVerifiedIdentity` helper is decision-only and may be used solely after the same full deterministic event replay has already validated the exact identity bundle; it is not a standalone authorization boundary.

`validateSourceAnalysisIdentityVerificationBinding` additionally verifies that the named identity artifact is itself sealed and decided `verified`, then rejects source, canonical-identity, metadata, content or extraction drift. Provisional and rejected identity artifacts cannot be used as analysis prerequisites.

`scripts/knowledge/seal-source-analysis-artifact.ts` is the production sealer for an explicitly supplied, unsealed semantic analysis body. Its strict configuration names the complete identity evidence bundle, both manifest predecessors, both lifecycle pre-states, the canonical analysis workflow and prompt, every ordered normalized-page file, a nullable `predecessorAnalysisArtifactPath`, and the complete `relatedAnalysisArtifactPaths` list. The predecessor field must be `null` for an initial artifact and must name the exact predecessor for a revision. The related list may be empty, but when cross-source findings exist it must contain every referenced artifact exactly once and no unused artifact.

Every predecessor and related analysis dependency is opened from its portable repository-relative, content-addressed path, parsed from its exact bytes and validated with `validateSourceAnalysisArtifact`. A revision must match its predecessor's artifact ID, version, hash, lineage and source. Each cross-source evidence reference must match the opened artifact's source ID, source-content hash, artifact ID, version and hash, and every cited locator ID must exist in that artifact. Missing, duplicate, unsafe, self-source and unused dependencies fail closed. This validation authenticates the supplied sealed dependency artifact; it does not recursively replace the evidence-bundle validation that authorized creation of that dependency.

The sealer adds only `artifactSha256`, runs the complete standalone evidence-bundle validator, and derives the only permitted output path as `knowledge/corpus/source-analysis/artifacts/<artifact-sha256>.source-analysis.v1.json`. Publication is exclusive and byte-idempotent. The sealer never appends an event or promotes lifecycle, review, rights, publication or coverage state.

The production configuration runner opens each unique input with no symbolic-link following, requires a canonical regular file with exactly one hard link, and rejects group- or world-writable input. It does not invent one universal read-only mode: controlled private inputs may be `0600`, repository inputs may be `0644`, and read-only inputs may be `0400` or `0444`. Its snapshot binds device, inode, size, link count, permission mode, modification time, change time and exact bytes. Immediately before an existing artifact is accepted or a new artifact is linked into place, the runner collectively reopens and compares the complete input set; any drift aborts publication.

Sealing requires an exclusive maintenance window under a trusted local account for the complete input set and the repository artifact directory. The collective revalidation is an ordered second pass, and the output directory's canonical path, device, inode and mode are rebound after that pass and on both sides of publication. These checks reject static or persistent input/output replacement. Node's path API on macOS is not represented as a hostile same-account sandbox against an attacker able to swap and fully restore a path entirely between checks.

The newly published artifact must be a mode-`0600`, one-link regular file inside the canonical non-symlink repository boundary. Mode `0600` is a local worktree/runtime invariant, not a portable Git guarantee: Git does not preserve owner/group/other permission bits across checkout or clone. Any copied or freshly checked-out artifact store must re-establish and verify its private local permissions before it is treated as the active sealing store.

The sealer validates the supplied execution record: exact workflow, prompt, normalized input, stage/checkpoint hashes, output continuity and declared timing relationships. Those deterministic checks do not by themselves prove that a live model invocation actually occurred at the named provider. Provider-side receipts, signed attestations or independently captured invocation telemetry remain a separate provenance layer and must not be inferred from a successfully sealed artifact.

The lifecycle and source binding retain the stable candidate/corpus title. A separately observed document title may differ only when the identity artifact has passed the deterministic dimension-specific normalization policy; that observed value stays explicit in the manifest and identity evidence. A caller-written explanation is not enough to establish a normalized match.

When the runtime exposes no exact model build, `modelVersionState` is `runtime_not_exposed` and `modelVersion` must use the explicit `runtime_not_exposed` sentinel. Run timing similarly distinguishes `provider_exact` from an honestly described `coordinator_observed_window`.

## Required candidate analysis

The artifact always contains bounded, paraphrased sections for:

- purpose, summary, source-role candidate, system boundary, period and matters not assessed;
- located claims and exact supporting text-unit hashes;
- quantitative observations with numeric measure, unit, universe, period, method and uncertainty;
- actor and policy candidates;
- relationship candidates;
- separate material, financial and information flow candidates;
- methods, limitations, conflict-of-interest reporting and claims the source cannot support;
- internal inconsistencies with at least two exact text positions, plus cross-source corroborations, contradictions and open questions;
- ontology-link and coverage-cell candidates.

All candidate objects remain `candidate_only`. Entity references, locator references, supporting hashes, observation references and coverage evidence references are checked at runtime. No identity is merged by name alone.

## No retained source text

The tracked artifact has no source-text or quotation field. Claim and observation wording must be paraphrased, individual narrative fields are length-bounded, and the fixed source-text policy declares that long text and direct quotes are absent. Exact interpretation remains auditable through locators and text-unit hashes. Controlled full text stays in the private extraction layer.

## Promotion stopline

The artifact fixes each downstream gate independently:

- owner review: incomplete;
- independent expert validation: incomplete;
- partner validation: incomplete;
- rights-holder validation: incomplete;
- rights review: incomplete and pending;
- publication: incomplete and internal-only;
- coverage: incomplete, candidate-only and automatic promotion forbidden.

Those outcomes can change only in separately receipted lifecycle records. They cannot be changed inside a source-analysis artifact.

## Validation layers

The JSON Schema and Zod schema enforce the same strict object shape, required fields, closed enums, candidate-only semantics and absence of unknown fields. Runtime validation additionally fails closed on:

- skipped or reordered pages or sections;
- changed workflow bytes, prompt-template bytes or normalized-page bytes, even when their names are unchanged;
- mismatched lifecycle, content or text hashes;
- broken AI-run chronology or output continuity;
- missing reading, analysis or reconciliation stages;
- stale supporting text-unit hashes;
- internally inconsistent findings with fewer than two exact positions or mismatched text-unit hashes;
- broken entity, flow, claim, observation or coverage references;
- inconsistent quantitative ranges, universes, periods or calculations;
- missing revision predecessors;
- changed analysis payloads or invalid artifact seals.

The normative implementation is `src/lib/knowledge/source-analysis-artifact.ts`; the portable schema is `knowledge/schema/source-analysis-artifact.schema.v1.json`.
