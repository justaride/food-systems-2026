# Source-analysis artifact contract v1

Status: strict internal contract

Schema version: `source-analysis-artifact-v1`

Implementation version: `1.0.0`

This contract is the machine-checkable form of the candidate-analysis step in the whole-corpus source-analysis protocol. It records one complete, hash-bound AI reading of one verified source-text snapshot. It does not record owner approval, independent validation, rights clearance, publication approval or coverage promotion.

## The two full-text states are different

`fullTextEligibility` proves only that the exact source identity, bytes, extracted text and expected page or section sequence are available and have no unresolved technical blocker.

`actualFullTextReading` separately proves that named AI runs received the exact text hash and read the entire ordered locator sequence. A source is not AI-read when only the eligibility object exists, when any unit is missing, or when the reading run cannot be matched.

## Required binding

Every artifact binds all of the following:

- exact lifecycle record ID, canonical lifecycle-snapshot hash and snapshot time;
- exact source ID, verified identity state, metadata hash and content hash;
- exact verified identity-artifact ID, version, hash and canonical identity;
- exact normalized full-text hash;
- exact extraction artifact, extraction artifact hash and text-manifest hash;
- exact AI run IDs, provider, model, model version, workflow, workflow version, prompt hash, input hashes, output hashes and timestamps;
- exact page or section locator IDs and their normalized text-unit hashes;
- a stable artifact lineage, version, predecessor binding for revisions, analysis-payload hash and complete artifact hash.

The lifecycle snapshot hash is the SHA-256 of its canonical JSON at the point the analysis begins. `validateSourceAnalysisBinding` compares the entire binding object with the expected lifecycle/source/content/text snapshot rather than trusting fields copied from the analysis itself.

`validateSourceAnalysisIdentityVerificationBinding` additionally verifies that the named identity artifact is itself sealed and decided `verified`, then rejects source, canonical-identity, metadata, content or extraction drift. Provisional and rejected identity artifacts cannot be used as analysis prerequisites.

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
