# Full source analysis workflow v1

Workflow ID: `workflow.full_source_analysis.v1`

Workflow version: `1.0.0`

Status: internal AI workflow; candidate knowledge only

## Purpose

Read and structurally analyse one complete, verified source input. The result may support lifecycle progress through `cross_check`. It must not by itself create an owner decision, independent validation, partner validation, rights-holder validation, rights clearance, publication approval or coverage promotion.

## Required inputs

The coordinator must call the combined validator with exact file bytes and validate and hash-bind:

1. the exact baseline or current lifecycle pre-state;
2. the exact verified source-identity artifact and its validated acquisition/private-access receipt;
3. the exact source-analysis input manifest;
4. the canonical framed input bytes produced from every ordered page in that manifest;
5. this workflow file and its exact SHA-256;
6. any predecessor analysis artifacts used for cross-source reconciliation.

The source-analysis artifact names the manifest schema/pipeline version, repository path, file SHA-256 and internal manifest seal. It separately names the identity artifact ID/version, repository path, file SHA-256 and internal artifact seal. The manifest's positive eligibility state must name those same identity fields with `decision: verified`, plus the exact lifecycle record ID, domain-separated state hash and `updatedAt`.

The validator parses both files as fatal UTF-8 JSON, validates both internal seals, validates the identity decision and validates the lifecycle object before comparison. The source ID, title, canonical identity, metadata hash, raw-PDF/content hash, normalized full-text hash, extraction receipt path/file hash/seal, page-map path/file hash/seal, page count, ordered page numbers and every normalized text-unit hash must all agree. `workflowEligibility.sourceAnalysis.allowed` must be exactly `true`; all other eligibility states stop the run.

## Exact ordered stages

1. `full_text_read` — consume every framed page in ascending order and account for every locator.
2. `locator_grounding` — build the complete ordered page/section locator set and preserve each normalized text-unit hash.
3. `structured_analysis` — extract paraphrased claims, quantitative observations, actors, policies, relationships, material/financial/information flows, methods, limitations, conflicts, cannot-support boundaries, ontology candidates and coverage candidates.
4. `reconciliation` — test internal consistency, compare exact predecessor sources, separate corroboration from contradiction, and record open questions.

Stages must occur exactly once, in this order, across the complete ordered run list. A run's declared stage list must exactly equal its checkpoint stage list.

Every run embeds the canonical input envelope rather than only asserting a hash. The envelope contains the exact manifest reference, identity-artifact reference, lifecycle pre-state reference and workflow hash. `inputEnvelopeSha256` is recomputed with the `food-systems/source-analysis-input-envelope/v1` domain. The workflow hash is independently recomputed from workflow reference/version, prompt-template hash and the four required stages.

Every checkpoint contains the exact canonical stage payload, its recomputed domain-separated hash, its predecessor checkpoint seal, its consumed input hash, completion time and a recomputed checkpoint output seal. The first checkpoint consumes the input-envelope hash; every later checkpoint consumes and names the immediately preceding checkpoint output. Stage payloads bind the complete ordered locator IDs and text-unit hashes. Stage result hashes bind the reading declaration, locator set, structured analysis without reconciliation, and final sealed analysis payload respectively. The final output seal is recomputed from the analysis-payload seal and final checkpoint output; it is not accepted as a format-only hash.

## Completeness and evidence rules

- Account for every expected page or structured unit. A completeness flag without an exact ordered locator set is invalid.
- For PDF manifests, the combined validator requires exactly one canonical `locator.page.N` locator per manifest page, in ascending contiguous order, with the fixed page label, no invented section path and the exact normalized page hash. Extra, missing, relabelled or reordered locators fail.
- Every claim and quantitative observation must cite exact locator IDs and matching normalized text-unit hashes.
- Quantitative observations must preserve value, unit, universe, period, method and uncertainty. Do not infer missing sample sizes or causal effects.
- Internal inconsistencies require at least two exact source positions.
- Cross-source findings require exact predecessor artifact IDs, versions, hashes and locators.
- Keep source-reported findings, analyst calculations and analyst inference visibly separate.
- Record what the source cannot support, including scope, representativeness, causality, recency and measurement limits.
- Use paraphrases and locators only. Do not put direct quotes or long source text in the tracked artifact.

## Output boundary

Return one strict source-analysis payload plus honest AI-run provenance. All extracted objects remain `candidate_only`; automatic ontology or coverage promotion is forbidden. Source-role classification remains machine-provisional until Gabriel records a separate owner receipt. The source therefore stops at `cross_check`, not `ready_for_owner`.

## Current live stopline

The contract now supports a synthetic positive end-to-end case, but none of the five live input manifests is eligible. Three require an actual validated identity artifact; two remain blocked on legacy-alias scope mismatch. No live full-text analysis, owner review or promotion is asserted by this contract work.
