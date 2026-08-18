# Autonomous analysis contract

Status: canonical internal authority contract

Version: 1.0.0

## Purpose

This contract permits autonomous analysis of stable, readable, hash-bound bytes or records while keeping machine output, human review, canonical data, publication and coverage authority separate. It defines the candidate subsystem for internal work only; it does not authorize adapters, promotion execution, a pilot, credentials or an autonomous production run.

The three authority terms for later work are:

- `candidate`: an append-only machine or deterministic analysis result that can be inspected, compared and prioritized but has no canonical, publication or coverage authority.
- `human_review`: a separately recorded decision by the authorized human or other authorized reviewer over an exact bound work package. It is not created by a candidate run.
- `promotion`: a separately authorized, target-specific action that may move an exact bound result into a canonical target, publication path or named coverage readiness profile. It is not created by confidence or model agreement.

## Authority layers

Candidate analysis is an `ai_processing` activity under the [review-layer contract](../review/REVIEW-LAYER-CONTRACT.md). `human_review`, rights clearance, publication and coverage promotion are independent axes with their own authorized actors and receipts. A positive result on one axis does not satisfy another.

Candidate analysis may append candidate history only. It must not write a human-review receipt, canonical record, publication decision, coverage assessment or target-promotion record. A later promotion must name the exact candidate, evidence, source-content, policy and target-profile hashes that it evaluates.

## Analysis eligibility

Identity confidence is one of `exact | provisional | unresolved`. All three may enter candidate analysis when the exact bytes or records consumed are stable, readable and hash-bound. Identity confidence travels with every result. It changes which later target profiles may promote the result; it does not create a human precondition for machine reading.

Stable, readable and hash-bound means the coordinator records the consumed bytes or records, SHA-256, source identity key, content-unit locators, workflow version and prompt/configuration hashes before the run. The candidate route does not claim that an identity is verified, complete, reviewed, rights-cleared or coverage-ready.

## Independent status axes

Candidate status, human-review status, identity confidence, evidence status, rights status, publication status, coverage status and target-promotion status are independent. No status is inferred from another. In particular, candidate analysis may be complete while human review is absent, and a human-review receipt may be complete while rights, publication, coverage or target promotion remain pending.

Evidence records identify what supports or limits a candidate. Identity confidence constrains later promotion eligibility. A target profile defines the exact later promotion rules. Neither an evidence count nor a confidence level changes a candidate into canonical data.

Corrections are append-only and must preserve their authority history: a candidate correction must append a new candidate event and state the superseded candidate event hash; a human-review correction must append a new human-review decision and state the superseded human-review receipt hash; and a promotion correction must append a new promotion receipt and state the superseded promotion receipt hash. A correction never overwrites or silently displaces the prior event or receipt.

## Integrity sealing

All derived hashes use lowercase SHA-256 over `food-systems/<domain>/v1\n` followed by canonical JSON. Canonical JSON sorts object keys recursively, preserves array order, and adds no insignificant whitespace. A hash from one domain is never valid in another.

The candidate writer recomputes these machine-owned domains at its write boundary:

- `run-config` seals the complete run configuration;
- `run-input-envelope` seals the unique, contiguous ordered list of content-unit ID, position and stored content hash;
- `run-idempotency` seals the workflow and prompt ID/version/path/file hashes, model identity, configuration hash, input-envelope hash, purpose, output profile, attempt and predecessor;
- `run-scope` seals the run ID used by event supersession, while `run-event` seals event identity, run, sequence, type, payload and all supersession fields;
- `artifact-payload`, `assertion-payload`, `assertion-scope`, `evidence-locator`, `reconciliation-scope` and `reconciliation-payload` seal their named stored values; and
- `output-manifest` seals the complete ordered run inputs plus the complete sorted artifact, assertion, evidence-link, dependency and reconciliation identity/hash sets, including the stored row metadata that affects candidate meaning. Exact-locator assertions additionally require matching direct evidence before a terminal event can be appended.

A superseding run event binds the prior ID, prior hash and same run scope. A superseding assertion binds the prior ID, prior payload hash and same assertion-scope hash. The database repeats those bindings with composite foreign keys and rejects self-links.

The reserved human-authority tables have separate receipt domains even though Delivery 1 exposes no review or promotion writer. `human-review-decision` seals the decision ID, assertion and payload hash, review profile and profile hash, actor and authority, source-content and evidence-set hashes, limitations, edited-payload hash, and prior receipt ID/hash. `promotion-decision` seals the decision ID, assertion and review receipt bindings, state, target profile hash, policy hash, preconditions hash, target-set hash, result hash, actor and authority, and prior receipt ID/hash/policy hash. Their composite foreign keys require supersession to retain the same review or target scope. A later authorized writer must recompute these formulas before insert; shape-valid caller-supplied hashes are not authority.

## Recursive machine use

Machine systems may read, compare, reconcile, retry, rank or summarize prior candidate results when every consumed candidate and its inputs remain hash-bound. Recursive use creates a new append-only candidate event with its own provenance; it does not overwrite, merge away or promote the prior event.

Repetition, reconciliation and model agreement may prioritize human attention or request further analysis. They never record `human_review` or `promotion` and never supply the authority required by either.

Inherited limitations are always mandatory on both the dependency record and the dependent assertion. The dependent `machineUse` may never be more permissive than the weakest upstream authority in its recursive lineage. A dependent assertion may strengthen `identityConfidence` or `evidenceLevel` only when its own direct supporting `CandidateEvidenceLink` records independently justify the stronger value; otherwise the writer rejects the dependency with `upstream_authority_upgrade`. Qualifying evidence must reference a content unit in the dependent run's immutable input envelope, and that `CandidateAnalysisRunInput.inputHash` must equal the exact `CandidateContentUnit.contentHash`. Exact identity can be justified only by a qualifying directly linked content unit with at least the claimed identity confidence. An evidence-level upgrade is justified only when a qualifying direct supporting link's locator and locator hash exactly match its hash-bound content unit. The current schema does not distinguish partially located direct evidence from other non-exact locator relationships, so that case fails closed rather than inferring an upgrade.

No machine lineage changes human review or promotion state. Lineage and independent evidence may constrain or support a new candidate assertion only; they never create authority on another axis.

## Database roles

`CandidateAnalysisRun` is the reserved append-only run-record name for the candidate subsystem. Its sole worker write path is `src/lib/knowledge/candidate-analysis-writer.ts`; generic upsert, update, delete and generic or mutating raw SQL are forbidden for candidate history. The writer may use only narrow, parameterized, internal SQL for transaction-scoped advisory run/assertion locks and read-only recursive dependency-integrity checks. Advisory locks change transaction lock state only; this SQL must not be exposed and must not mutate candidate history. Content-unit creation remains a trusted/admin intake action and is not part of the worker API.

Candidate records are not canonical records. Human-review receipts, evidence records, target-promotion records, publication decisions and coverage assessments remain separate roles with their own schemas and append-only histories.

## Human boundary

Confidence is not authority. Repetition, reconciliation, model agreement and high confidence may affect prioritization but never change human-review or promotion state.

Only the authorized actor can record `human_review` for the exact bound candidate, evidence and source content. A human review must state its scope, decision, limitations and applicable policy; it cannot silently approve a different candidate, evidence set, content revision or target profile.

## Promotion stopline

Promotion remains target-specific and fail-closed. It requires the target profile and all required human, evidence, identity, rights, publication, privacy, safety, legal, expert, partner or rights-holder gates to be explicitly satisfied for the exact bound inputs. Identity confidence constrains which target profiles may promote a result; it never authorizes promotion by itself.

No candidate run may create or modify canonical data, a publication artifact, coverage readiness or a target-promotion event. Missing review, rights or publication authority is expected downstream state, not a machine-analysis error.

## Operational reporting

Report candidate analysis, human review, target promotion, publication and coverage as separate counts and gates. State the exact hashes and target profile for any claimed promotion. Distinguish local tests, CI, migration, deployment, runtime SHA, authenticated UI and external human authority; proof of an earlier gate never proves a later one.

When this contract is used, report candidate results as internal and pending downstream authority unless the separately bound receipts prove otherwise.
