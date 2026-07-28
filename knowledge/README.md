# Nordic food-system knowledge foundation

This directory is the proposed, versioned operating foundation for turning Food Systems 2026 into a compounding Nordic knowledge system. It is not adopted until an authorized review receipt says so.

It does **not** declare the Nordic food system complete. It defines what must be covered, records the current baseline without promotion by inference, and separates evidence from compiled knowledge and presentation.

## Start here

1. [Knowledge constitution](KNOWLEDGE-CONSTITUTION.md)
2. [Critical current-state audit](CURRENT-STATE-AUDIT.md)
3. [Compiled-wiki contract](COMPILED-WIKI-CONTRACT.md)
4. [Nordic food-system ontology](schema/nordic-food-system-ontology.v1.json)
5. [Knowledge-object schema](schema/knowledge-object.schema.v1.json)
6. [Coverage-ledger schema](schema/coverage-ledger.schema.v1.json)
7. [Coverage summary](coverage/coverage-summary.v1.json)
8. [Gate 1 corpus/evidence-health report](health/corpus-health-report.v1.md)
9. [Corpus/evidence-health contract](schema/corpus-evidence-health.schema.v1.json)
10. [Current-corpus migration map](migration/CURRENT-CORPUS-MAP.md)
11. [Compiled-wiki index](wiki/index.md)
12. [Append-only wiki log](wiki/log.md)
13. [Gate 2B Field 08 research-candidate pilot](pilots/field08/README.md)

## Canonical boundary

```text
immutable source artifacts and manifests
  -> evidence, claims, measurements and reviews
  -> typed database and compiled Markdown wiki
  -> Obsidian, app, MCP and exports
```

The current completion register remains the authority for project work status. This directory becomes the authority for knowledge-system scope, ontology and coverage semantics. Neither surface can promote evidence readiness.

## Generated coverage artifacts

Run:

```bash
npm run knowledge:coverage:generate
npm run knowledge:coverage:check
npm run knowledge:check
```

The generator reads the ontology and proposed baseline manifest, verifies every declared input against the named Git commit, stages the complete output bundle, and writes:

- `coverage/coverage-cells.v1.csv` — defined scope cells;
- `coverage/coverage-assessments-baseline.v1.jsonl` — content-addressed scope-registration events, frozen only after formal adoption;
- `coverage/coverage-ledger.v1.jsonl` — lossless canonical current-state projection;
- `coverage/coverage-ledger.v1.csv` — human/query convenience projection with the full records preserved as JSON columns;
- `coverage/coverage-summary.v1.json` — profile-local counts, with no political/Sápmi or canonical/legacy roll-up;
- `coverage/coverage-source-snapshots.v1.json` — SHA-256 and Git-object provenance for every declared baseline input;
- `coverage/coverage-generation-manifest.v1.json` — final commit marker and output hashes.

`knowledge:check` also compiles the relevant JSON Schemas, validates ontology and cross-record membership rules, validates the generated coverage/provenance graph, and recomputes the corpus-health bundle from its source snapshots. Generated files must not be edited manually. During proposal review, change the ontology or baseline manifest and regenerate them. After approval, the v1 baseline manifest and event file are immutable; corrections require new content-addressed events with `supersedesId`.

## Generated corpus/evidence health

Run:

```bash
npm run knowledge:health:generate
npm run knowledge:health:check
npm run knowledge:check
```

The [current Gate 1 report](health/corpus-health-report.v1.md) is a separate, hash-bound assessment of inventory, provenance, citation readiness, appraisal, archive durability, identity, queues, freshness, structural integrity, review, operational proof, conflicts, receipts and source snapshots. Its four intended-use profiles are non-additive and carry no overall score.

The 2026-07-28 assessment is **NO-GO** for reproducible internal analysis, external evidence support and observatory operation. Internal discovery is `ready_with_warnings` only. The canonical branch now contains the hardening lineage, and all 31 repository migration names and SQL checksums match the 31 completed local-database migrations. The principal remaining reproducibility blocker is classified evidence identity: current seeds contain 400 rows while the local database contains 417. The raw 18 database-only identities include 17 manifest-derived runtime-managed transcript SourceDocs, leaving one unclassified database-only Thesis, one seed-only official-law SourceDoc and zero missing declared runtime identities. Managed-runtime classification explains the expected row-count difference; it does not establish provenance, appraisal or external readiness.

The generator keeps direct observations separate from reported status snapshots. The academic audit now reproduces on the integrated lineage, while the master status remains a historical aggregate rather than current operational truth. The assessment also records 0/417 complete evidence appraisals, 568/2,703 durable citation archives, 1,855/2,376 external-readiness citations still needing archive, and two current vault-validation issues. Library live identity is exact at 1,555/1,555; the additional 17 persisted rows are individually hash-bound retained history with zero external use, zero missing counterparts and zero contract issues. A separately reported 15-row metadata projection-freshness queue is not identity drift or evidence approval.

## Gate 2A — neutral legacy-field navigation

The thirteen existing Obsidian field pages are registered separately as navigation artifacts. The generated register binds each field page, the root field map and the atlas canvas to exact repository objects, then creates 104 political-Nordic and 13 separate Sápmi navigation-only bindings. Every binding is forced to remain `unassessed`, `not_evidence`, `geographyRepresentation: unknown` and `coverageImplication: none`. The Sápmi bindings are non-additive and require a rights-holder review before any later substantive assessment.

This registry does not modify the historical 117 scope-registration events, does not claim that any geography appears in the field-page content, and cannot promote a coverage cell. Run `npm run knowledge:navigation:generate` after changing its source map or generator and `npm run knowledge:navigation:check` in validation.

## Gate 2B — Field 08 research candidates

The [Field 08 pilot](pilots/field08/README.md) moves one legacy field beyond navigation without pretending that source discovery is evidence-backed coverage. Its normalized source map contains authoritative source leads, exact candidate locators, source-to-cell boundary judgments, bounded observation candidates, explicit unknowns and next actions for Norway, Sweden, Denmark, Finland, Iceland, the Faroe Islands, Greenland and Åland. Finland and Åland are kept non-additive wherever source boundaries overlap or remain unresolved.

The generator expands the 34 Field 08 ontology facets across all nine profile-local geography cells: 272 political rows and 34 separate Sápmi rows. A row may record a substantive measurement lead, method lead, context lead, boundary-reconciliation requirement, rights-holder route or no candidate. Every state has `coverageImplication: none`; all nine cells remain `unassessed`, and the historical 117 scope-registration events are unchanged.

Sápmi receives zero substantive desk-research credit. Its candidate rows identify authority, consent and data-governance routes only and require an approved rights-holder-led scope, evidence and review process before any later assessment.

Run `npm run knowledge:field08:generate` after committing source changes, then `npm run knowledge:field08:check` to reproduce the pinned register and report. The generated report is the review surface; it is not an evidence, appraisal or adoption receipt.

Generated health artifacts are:

- `health/corpus-health-source-snapshots.v1.json` — file, commit and read-only database-query hashes;
- `health/corpus-health-source-snapshot-history.v1.jsonl` — immutable source-snapshot sets for every assessment vintage;
- `health/corpus-health-assessments.v1.jsonl` — immutable assessment history;
- `health/corpus-health-current.v1.json` — hash-bound pointer to the current assessment;
- `health/corpus-health-summary.v1.json` and `health/corpus-health-report.v1.md` — machine and human readouts;
- `health/corpus-health-generation-manifest.v1.json` — output hashes and final generation marker.

These controls cannot create evidence-backed coverage, promote any of the 6,948 scope cells, collapse political-Nordic and Sápmi profiles, or establish that the Nordic food system is fully mapped. Thresholds remain `proposed` until a named adoption receipt exists.

## Phase-one limits

- The political-Nordic macro profile defines 6,072 cells: eight political reporting scopes × 33 explicit stage/function coverage units × 23 analytical domains.
- The overlapping Sápmi macro profile defines 759 separate, non-additive cells. It requires a rights-holder-led evidence and review route.
- The 117 legacy-field cells are neutral scope registrations only. They are not evidence-backed assessments.
- Commodity, actor, flow, outcome, time and evidence facets are controlled registries and mandatory drill-down dimensions, not a fully materialized Cartesian product.
- All 6,948 defined cells currently remain subject-matter `unassessed`; zero are complete for their required readiness profile.
- File existence, note count, directory presence and keyword mentions do not establish coverage.
- This file-backed ledger is a proposed scope skeleton. Database event models, evidence migration and Obsidian projections follow only after the contract is reviewed.
