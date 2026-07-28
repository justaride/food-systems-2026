# Coverage ledger

## Status: proposed foundation

This ledger contract is a proposed foundation for review, not an adopted statement that the Nordic food system has been mapped. It makes declared scope, evidence, unknowns and readiness queryable without turning them into one completion percentage.

The current generated baseline is a **scope skeleton**. Its cells identify questions that should be assessed; they do not prove that the questions have been researched. Schema validation proves record structure and declared provenance only. Until explicit adoption and evidence-backed assessment, generated records must not be described as adopted, audited, externally ready or complete.

## Coverage profiles and aggregation boundaries

The current skeleton contains 6,831 macro planning cells across two non-additive profiles:

```text
(8 political reporting scopes × 33 explicit stage/function units × 23 domains)
+
(1 overlapping Sápmi scope × 33 explicit stage/function units × 23 domains)
```

That object count is not an aggregatable Nordic denominator. The proposed skeleton exposes it as two non-additive profiles:

- `profile.canonical_political_macro`: 6,072 cells for Norway, Sweden, Denmark, Finland, Iceland, the Faroe Islands, Greenland and Åland;
- `profile.canonical_sapmi_overlap_macro`: 759 cells for the separate, overlapping, rights-holder-led Indigenous coverage profile.

Sápmi is not a ninth political unit. Never add Sápmi cells to political-Nordic cells or use one profile's readiness as evidence for the other. Sápmi completeness additionally requires an approved rights-holder review and a consent/authority path resolved by the cross-record validator. Within the political profile, Denmark/Greenland/Faroe Islands and Finland/Åland also require source-boundary reconciliation before numerical aggregation.

The 117-row legacy bridge is likewise two separate migration skeletons:

```text
(8 political reporting scopes × 13 fields) + (1 overlapping Sápmi scope × 13 fields)
```

Its 104 `profile.legacy_field_political` rows and 13 `profile.legacy_field_sapmi_overlap` rows must be reported separately. The legacy bridge is a navigation/corpus audit, not independent subject-matter evidence, and it must never be added to canonical coverage totals.

No report may aggregate across canonical, legacy, political-Nordic, Sápmi or project-health profiles. A summary must name exactly one profile, thresholds version, cell tier and assessment projection; comparisons may display profiles side by side but may not sum or average them.

## Cells are questions, not findings

A `CoverageCell` declares:

- its non-additive aggregation class and sorted, dimension-labelled profile-axis bindings;
- its tier and parent;
- required child dimensions and units;
- the system-boundary question and population definition;
- the named readiness profile against which completeness can be computed.

The stable cell ID is derived from `axisBindings`, sorted by dimension. `valueChainStageId`, `domainId` and `legacyFieldId` are query conveniences, not an alternative identity scheme. The cross-record validator must reject duplicate axis dimensions, disagreeing convenience fields and any political/Sápmi aggregation-class mismatch.

Tier 1 is the macro planning grid. Tier 2 enumerates relevant commodities, actors, flows, outcomes, subnational geographies, periods, metrics and relationships. Tier 3 binds claims, observations and measurements to exact evidence. A tier-1 cell cannot be complete while required child dimensions remain unknown or while relevant children are unenumerated.

## Assessments are append-only events

A `CoverageAssessment` records what was known at one audit event. It does not mutate the cell and it does not assert that the underlying subject stayed unchanged.

The time fields have distinct meanings:

- `auditObservedAt`, `recordedAt`, `retrievedAt` and `assessedAt` describe the audit and record-handling event;
- `sourceLastModified` and `sourceUpdatedThrough` describe source freshness when known;
- `assessmentValidFrom` and `assessmentValidTo` delimit the assessment projection;
- `subjectMatterPeriods` describe the period(s) the evidence is about.

Audit time must never be substituted for subject-matter time. An undated source, a current retrieval and a historical statistic are three different facts.

Each assessment keeps scope, inventory, depth, verification, citation, appraisal, freshness, temporal structure, archive state and workflow independent. It also records the explicit system boundary, universe, unit, method, exact evidence links, review receipts, represented/missing/not-applicable facet sets, limitations, monitoring and operational gap route.

Every event also carries `eventKind`, `baselineId`, `baselineAdoptionStatus`, `baselineSnapshotId`, the full `baseCommit` and any `artifactSnapshotIds`. These fields bind the event to the separately hash-bound snapshot manifest. They prove which repository snapshot was declared; they are not claim evidence, do not satisfy `evidenceLinks`, and do not promote readiness. A `scope_registration` event is forced to remain unassessed, unsourced and without a readiness result even when its snapshot provenance is complete.

`workflowStage: absent` is permitted only when `inventoryState: none_observed`. `none_observed` means a bounded negative search found no instance; it does not mean that an instance does not exist. It requires a named negative-search method, search boundary, sources checked, subject period, exact evidence and approved human/partner/rights-holder review. `exhaustive` additionally requires a frozen universe and enumeration method.

## Readiness profiles

`readinessResult` is computed against `coverage-readiness-v1`; it is never manually promoted. Its `checks` array contains only checks required by the selected profile, so every emitted check is readiness-bearing. Every successful result must have no failed or unknown check. All profiles share these minimums when `completeForProfile` is true: frozen scope and system boundary, declared non-unknown inventory, an audited or published assessment event, a named method, exact evidence, an approved human/partner/rights-holder completeness review, and resolved required child coverage.

| Profile | Additional threshold |
| --- | --- |
| `internal_navigation` | Compiled or later; at least needs-review verification; at least internal-context citation readiness. |
| `internal_analysis` | Reviewed or later; machine- or human-verified; at least internal-context citation readiness; at least one subject-matter period; universe estimated, frozen or explicitly not applicable. |
| `external_claim` | `citable_external`, which requires human verification, reviewed or explicitly excluded appraisal, current evidence, durable/hash-verified archive, frozen boundary, a supporting `SourceCitation` with exact locator, a named method and approved external-readiness review. |
| `monitored_indicator` | Monitored workflow, human verification, current dated series or bitemporal data, unit, subject period, durable archive, assigned cadence/next review/staleness threshold and approved human indicator review. |

The validator must also confirm that an assessment's readiness profile matches its cell's `requiredReadinessProfile`; this relationship cannot be guaranteed by validating either record in isolation.

Draft/unassessed events may use unknown boundary/universe/facet states, `method: null`, empty evidence and review arrays, and `readinessResult: null`. The contract fails closed for `audited`, `none_observed`, `exhaustive`, `citable_external` and `completeForProfile: true` states.

Operational gap routing is deliberately separate. Closing a task, assigning an owner or changing `operationalGap.status` never promotes evidence readiness and never makes a profile complete.

## Files and proof boundary

- `../schema/coverage-ledger.schema.v1.json` — proposed normative record contract and fail-closed readiness thresholds;
- `baseline-manifest.v1.json` — current scope-skeleton generation rules, not an adoption receipt;
- `coverage-cells.v1.csv` — generated skeleton/projection of cells defined by each named scope profile;
- `coverage-assessments-baseline.v1.jsonl` — generated scope-registration events, not subject-matter assessments;
- `coverage-ledger.v1.jsonl` — lossless canonical latest-state projection, including full cell and latest-event records;
- `coverage-ledger.v1.csv` — latest-state convenience projection, never the source of history;
- `coverage-summary.v1.json` — convenience counts only, never a synthetic completion score.
- `coverage-source-snapshots.v1.json` — hash-bound artifact snapshot manifest resolved by baseline/artifact snapshot IDs;
- `coverage-generation-manifest.v1.json` — generation inputs and output hashes, not subject-matter evidence.

Project-health reporting is deferred. A `project-health-baseline.v1.json` is intentionally not created until each health fact can cite a tracked canonical artifact with an exact locator, base commit and Git blob ID. Project health must remain separate from subject coverage, and repository evidence must not be presented as live-runtime, partner, rights-holder or external-validation proof.

## Adoption and update rules

During proposal review, the schema and baseline rules may change and the scope skeleton may be regenerated. Every semantic diff must be inspected; passing generation alone is not adoption.

Adoption requires an explicit human approval receipt naming the exact schema, ontology, baseline-manifest and generated-artifact commit/blob identities, successful schema validation of every adopted record, and confirmation that political-Nordic and Sápmi projections remain separate.

After adoption:

1. freeze the adopted manifest, cell IDs and assessment events;
2. append a new assessment with a new ID and `supersedesId` for corrections or newer evidence;
3. never rewrite, delete or re-date historical assessment events;
4. recompute latest-state projections and profile summaries from the immutable event history;
5. version thresholds or profile definitions when their meaning changes rather than silently changing prior results.

A database may replace the file event store only after record, history, hash and projection parity are proven.
