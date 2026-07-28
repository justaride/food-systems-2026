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

The 2026-07-27 assessment is **NO-GO** for reproducible internal analysis, external evidence support and observatory operation. Internal discovery is `ready_with_warnings` only. The principal blocker is a divergent code/database lineage: this HEAD has 14 migration directories and 392 seed evidence rows, while the local database has 31 completed migrations and 417 evidence rows. The database matches divergent hardening commit `407d984d61fb97392dfc25992c54e6e320e54b2d`, not this branch.

The generator keeps direct observations separate from reported status snapshots. In particular, the tracked academic and master status files are retained as foreign-lineage historical observations; they are not silently rewritten as current truth. The assessment also records 0/417 complete evidence appraisals, 568/2,703 durable citation archives, 1,855/2,376 external-readiness citations still needing archive, a 1,555/1,572 library identity difference, and two current vault-validation issues.

Generated health artifacts are:

- `health/corpus-health-source-snapshots.v1.json` — file, commit and read-only database-query hashes;
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
