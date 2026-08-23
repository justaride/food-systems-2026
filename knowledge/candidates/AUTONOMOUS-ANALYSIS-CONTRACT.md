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

## Machine payload grammar

Structured machine output is limited to strict typed candidate entries. The assertion, artifact, run-event and reconciliation surfaces accept exactly `{ namespace, kind, data: { entries } }`: `namespace` is exactly `candidate`; `kind` is exactly `assertion | artifact | run_event | reconciliation` and must match the surface; `data` contains only a non-empty `entries` array; and the envelope, `data` object and every entry reject unknown keys.

Each entry has one allowlisted role: `summary | proposition | observation | classification_label | entity_candidate | relationship_candidate | quantitative_observation | coverage_signal | gap | contradiction | source_role_suggestion | reason | worker_reference | checkpoint | scope_reference | limitation`. The strict `valueType` union is:

- `text`: `role`, `valueType` and a non-empty string `value` only;
- `number`: `role`, `valueType`, a finite numeric `value`, and a non-empty string or null `unit` only;
- `flag`: `role`, `valueType` and a boolean `value` only; or
- `reference`: `role`, `valueType`, an identifier `targetId`, and `targetType` is exactly `content_unit | run | artifact | assertion | evidence_link | dependency | reconciliation`.

Free text remains candidate text only and never represents a status or decision. It cannot encode human review, approval, canonical state, rights clearance, target promotion, publication, coverage readiness or external readiness as a structured field.

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

The workflow/prompt binding is exact and mutual:

- Workflow file `knowledge/corpus/workflows/candidate-analysis-v1.md` has ID `workflow.candidate_analysis.v1` and version `1.0.0`, and references the prompt's exact ID `prompt.candidate_analysis.v1`, version `1.0.0` and repository path `knowledge/corpus/workflows/candidate-analysis-prompt-v1.md`.
- Prompt file `knowledge/corpus/workflows/candidate-analysis-prompt-v1.md` has ID `prompt.candidate_analysis.v1` and version `1.0.0`, and references the workflow's exact ID `workflow.candidate_analysis.v1`, version `1.0.0` and repository path `knowledge/corpus/workflows/candidate-analysis-v1.md`.

Before a database transaction, each file is read exactly once as bytes. Its same immutable byte buffer is decoded for binding validation and hashed with SHA-256, so semantic validation and the declared hash cannot observe different file contents.

A superseding run event binds the prior ID, prior hash and same run scope by carrying `(supersededEventId, supersededEventHash, runId, supersededEventScopeHash)`. The tuple is a complete four-part prior event identity and the named database foreign key `CandidateRunEvent_supersession_hash_scope_fkey` references `(id, eventHash, runId, scopeHash)`. Supersession requires `scopeHash = supersededEventScopeHash`, and the database rejects incomplete tuples and self-links. A superseding assertion binds the prior ID, prior payload hash and same assertion-scope hash.

The reserved human-authority tables have separate receipt domains even though Delivery 1 exposes no review or promotion writer. `human-review-decision` seals the decision ID, assertion and payload hash, review profile and profile hash, actor and authority, source-content and evidence-set hashes, limitations, edited-payload hash, and prior receipt ID/hash. `promotion-decision` seals the decision ID, assertion and review receipt bindings, state, target profile hash, policy hash, preconditions hash, target-set hash, result hash, actor and authority, and prior receipt ID/hash/policy hash. Their composite foreign keys require supersession to retain the same review or target scope. A later authorized writer must recompute these formulas before insert; shape-valid caller-supplied hashes are not authority.

## Recursive machine use

Machine systems may read, compare, reconcile, retry, rank or summarize prior candidate results when every consumed candidate and its inputs remain hash-bound. Recursive use creates a new append-only candidate event with its own provenance; it does not overwrite, merge away or promote the prior event.

Repetition, reconciliation and model agreement may prioritize human attention or request further analysis. They never record `human_review` or `promotion` and never supply the authority required by either.

Inherited limitations are always mandatory on both the dependency record and the dependent assertion. The dependent `machineUse` may never be more permissive than the weakest upstream authority in its recursive lineage. A dependent assertion may strengthen `identityConfidence` or `evidenceLevel` only when its own direct supporting `CandidateEvidenceLink` records independently justify the stronger value; otherwise the writer rejects the dependency with `upstream_authority_upgrade`. Qualifying evidence must reference a content unit in the dependent run's immutable input envelope, and that `CandidateAnalysisRunInput.inputHash` must equal the exact `CandidateContentUnit.contentHash`. Exact identity can be justified only by a qualifying directly linked content unit with at least the claimed identity confidence. An evidence-level upgrade is justified only when a qualifying direct supporting link's locator and locator hash exactly match its hash-bound content unit. The current schema does not distinguish partially located direct evidence from other non-exact locator relationships, so that case fails closed rather than inferring an upgrade.

No machine lineage changes human review or promotion state. Lineage and independent evidence may constrain or support a new candidate assertion only; they never create authority on another axis.

## Database roles

`CandidateAnalysisRun` is the reserved append-only run-record name for the candidate subsystem. Its sole runtime worker entry point is `src/lib/knowledge/candidate-analysis-writer.ts`; generic upsert, update, delete and generic or mutating raw SQL are forbidden for candidate history. The TypeScript entry point strictly parses input and invokes only the audited database functions `public.candidate_worker_append(text, jsonb)` and `public.candidate_reconciler_append(jsonb)`. The worker and reconciler roles have no table-level or column-level `INSERT` and no executable user routine outside their one exact function. Both functions are `SECURITY DEFINER` with fixed `search_path=pg_catalog`, are revoked from `PUBLIC`, and enforce their exact operation and payload schemas before appending.

The database writer boundary, not caller discipline, recomputes and enforces the run, input-envelope, stored-content, event-sequence and transition, terminal-manifest, artifact, assertion, evidence, recursive dependency and reconciliation invariants described above. Transaction-scoped advisory locks serialize each run and dependency endpoint. Content-unit creation remains a trusted/admin intake action and is not part of the worker API.

Candidate records are not canonical records. Human-review receipts, evidence records, target-promotion records, publication decisions and coverage assessments remain separate roles with their own schemas and append-only histories.

The truthful disabled-state recovery chain is `disable -> bootstrap grants -> enable existing credentials -> verify worker -> verify reconciler`. Disable is always the first recovery action. Bootstrap is exactly `scripts/bootstrap-candidate-analysis-roles.sh --apply --confirm-database-session-drain`; repeated successful bootstrap requires another disable first.

Bootstrap requires a planned maintenance window for the target database. Prepared transactions cause bootstrap to reject before drain. The drain is database-scoped: all other client backends in the target database are terminated, while clients in other databases are not. Catalog locks are bounded by a two-second timeout; a timeout requires the operator to finish the blocking writer and repeat the complete disable-to-bootstrap sequence. Grant repair starts only after the drain is proven. Bootstrap repairs the narrow grant allowlists and direct parameter ACLs in `pg_parameter_acl`, rejects an unexpected PUBLIC parameter grant without automatically revoking it, removes per-database role settings for the two exact cluster-global candidate roles, and pins their defaults to `session_replication_role=origin`. Bootstrap requires all 27 custom candidate integrity triggers to already use `ENABLE ALWAYS`; a missing, disabled, ordinary or unexpected custom trigger is drift and fails closed without repair, and internal foreign-key triggers are never altered. Bootstrap commits both candidate roles as `NOLOGIN` and leaves the service disabled.

The candidate identities are cluster-global PostgreSQL roles. Before bootstrap or enable, the administrator must prove database isolation: there is no other connectable database in the cluster, or every other database denies effective `CONNECT` to both candidate roles and `PUBLIC`. This is a dedicated-cluster or explicitly hardened database-ACL cost; the scripts fail closed and never auto-revoke another database's `PUBLIC` authority.

Disable binds its mutation and final verification to the attested system identifier, database name, server address and server port. Disable, bootstrap and enable use bounded lock and statement budgets. The hosted schema-migration guard runs `sh -n` on bootstrap, disable, enable and role verification so a shell syntax regression fails the hosted gate.

The enable step uses `scripts/enable-candidate-analysis-logins.sh --apply --confirm-existing-credentials`, does not provision, generate, rotate, change or log credentials, and immediately verifies the worker and then the reconciler through their supplied dedicated URLs. It retains the attested target identity and private connection material until both verification and any fail-safe attempt finish. When fail-safe succeeds after an enable or verification failure, both roles are `NOLOGIN`, exact writer-function execution and any residual candidate `INSERT` authority are revoked, exact candidate sessions are terminated, and all existing candidate rows are preserved. A target mismatch, lock timeout, statement timeout or other failure to prove this disabled state returns the stable `unresolved_active_security_incident` outcome with retry guidance; it must never be reported as a completed disable. Recovery does not create external readiness: human review and promotion remain separate, independently authorized gates.

## Human boundary

Confidence is not authority. Repetition, reconciliation, model agreement and high confidence may affect prioritization but never change human-review or promotion state.

Only the authorized actor can record `human_review` for the exact bound candidate, evidence and source content. A human review must state its scope, decision, limitations and applicable policy; it cannot silently approve a different candidate, evidence set, content revision or target profile.

## Promotion stopline

Promotion remains target-specific and fail-closed. It requires the target profile and all required human, evidence, identity, rights, publication, privacy, safety, legal, expert, partner or rights-holder gates to be explicitly satisfied for the exact bound inputs. Identity confidence constrains which target profiles may promote a result; it never authorizes promotion by itself.

No candidate run may create or modify canonical data, a publication artifact, coverage readiness or a target-promotion event. Missing review, rights or publication authority is expected downstream state, not a machine-analysis error.

## Operational reporting

Report candidate analysis, human review, target promotion, publication and coverage as separate counts and gates. State the exact hashes and target profile for any claimed promotion. Distinguish local tests, CI, migration, deployment, runtime SHA, authenticated UI and external human authority; proof of an earlier gate never proves a later one.

Any query or contract error from a required control-snapshot source degrades the whole snapshot. It sets data completeness and review completeness false, closes candidate authority and external readiness, and emits the stable `degraded_snapshot:query_errors` warning plus the sanitized query errors. A surviving partial graph cannot retain authority.

When this contract is used, report candidate results as internal and pending downstream authority unless the separately bound receipts prove otherwise.

## Semantic attestation amendment v1 (2026-08-20)

Semantic-attestation amendment version: `1.1.0`. This section is append-only and preserves every earlier authority boundary.

Candidate Canonical JSON v1 is identical in TypeScript and PostgreSQL for the representable domain: object keys use exact UTF-8 byte order, arrays preserve order, strings contain only valid Unicode scalar values, numbers are finite, and JSON `null` remains distinct from SQL `NULL` at the database boundary.

The recovery flow reads the canonical security manifest without following symbolic links, independently derives the checker descriptor from `pg_catalog`, and attests routine bodies, owners, ACLs and trigger semantics for exactly 27 custom triggers before candidate roles can receive `LOGIN`.

Bootstrap and enable never repair drifted code. A checker, graph or manifest mismatch fails closed with its stable diagnostic and requires a reviewed migration rather than an operational grant script changing schema code.

The roles remain disabled until a migration repair has been committed and applied and the complete `disable -> bootstrap grants -> enable existing credentials -> verify worker -> verify reconciler` recovery chain succeeds against the same attested PostgreSQL target.

Technical candidate readiness does not create human review, promotion or external readiness. It proves only the named machine controls for internal candidate decision support; all downstream authority axes remain independently closed until their own exact receipts exist.

## Errata (2026-08-20)

- Target-rebinding proof: earlier wording could be read as a connection-string comparison. Recovery now binds the exact system identifier, database, server address and server port before mutation and again during final verification; a different target fails closed.
- Mixed-case schema coverage: the shell scripts continue to quote configured identifiers safely, but Candidate Security Graph v1 is anchored to `public`, which is the only supported semantic-graph schema. Mixed-case or non-`public` schema deployment is not proven and must not be claimed without a new manifest, migration and mutation-test set.
