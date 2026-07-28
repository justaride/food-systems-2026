# Current-corpus migration map

Foundation snapshot date: 2026-07-26

Gate 1 readback date: 2026-07-28

Base commit: pinned by the generated assessment and generation manifest

Migration state: planned; no existing vault notes or evidence records moved

## Snapshot boundary

This map describes the clean atlas commit used to create the knowledge foundation. The separately audited live checkout contained additional uncommitted research, evidence and vault work; those changes remain untouched and require their own reconciliation before merge.

At this snapshot, the existing vault contains 786 Markdown notes and 32 canvases. That inventory is preserved as a reader-facing and migration surface. It is not recast as 786 units of verified knowledge.

## Gate 1 lineage boundary

The [generated corpus/evidence-health report](../health/corpus-health-report.v1.md) records the hardening lineage as integrated. All 31 repository migration names and SQL checksums match the 31 completed local-database migrations, and `EvidenceAppraisal` plus the release controls are present in the branch. This closes the migration-lineage conflict only; evidence and library identity are still unreconciled.

This distinction is operationally material:

- the local database is a hash-bound read-only **runtime snapshot**, not production-parity truth;
- the academic status reproduces on the integrated lineage, while the master status remains a historical aggregate;
- 18 database evidence identities are absent from current seeds and one seed identity is absent from the database;
- the 1,555-row derived library inventory differs from 1,572 persisted analysis rows;
- 0/417 evidence records have complete current appraisal;
- 1,855/2,376 external-readiness citations still need durable archive;
- the current vault validator reports two orphan issues despite an earlier green completion-register statement.

No existing evidence or vault record was mutated to make these surfaces agree. Every conflict is preserved with its source mode and hash.

## Current surfaces and disposition

| Current surface | Present role | Target authority | Migration action |
|---|---|---|---|
| `research/evidence-pack/` | Source locators, downloads, snapshots and evidence notes | Immutable evidence/manifests | Preserve bytes and hashes; reconcile stable source identities; do not copy raw binaries into the wiki. |
| `research/bibliotek/` | Human and AI source notes and thematic library | Source discovery and evidence processing | Map each note to source IDs and exact locators; keep unreviewed analysis internal. |
| PostgreSQL/Prisma citation models | Typed documents, citations, appraisal and field-level provenance on the integrated migration lineage | Structured evidence authority | Reuse exact identities after seed/runtime reconciliation. Do not treat the current local runtime snapshot as production-parity truth. |
| `research/whitepaper/food-systems-2026-synthesis-v2.md` | Canonical internal narrative synthesis | Migration input and controlled synthesis | Decompose factual statements into stable claims; compile cross-system pages from those claims; preserve caveats. |
| `docs/project/status/food-systems-completion-register-2026-07-15.md` | Operational work-status authority | Operational status | Keep authoritative for delivery state; link coverage cells to it without copying or auto-promoting statuses. |
| `research/_status/domene-dekningsbok.csv` | 70 Norway-only actor inventory cells | Legacy assessment input | Preserve counts and universe caveats; map manually to canonical actor/stage/domain cells; retain `run_floor` semantics. |
| `research/norden/` | Nordic source discovery, indicators, data and broad syntheses | Country evidence packs and comparisons | Map source by source; separate five-state comparisons from whole-Nordic coverage and territory/Sápmi work. |
| `Food Systems Obsidian/1 Oversikt og navigasjon/` | Reader path, thirteen-field atlas and status views | Curated navigation | Keep paths during migration; dual-link each field to canonical stage/domain/geography pages. |
| `Food Systems Obsidian/10 Innsiktskart/` | Generated and curated insight views | Compiled-wiki projection | Backfill stable insight and claim IDs; replace synthesis-only provenance with claim-to-source resolution. |
| `Food Systems Obsidian/11 Maktkart/` | Company/person/ownership registry projection | Entity and power-map projection | Preserve generated registry; use organization number/personKey identity; resolve duplicate names before migration. |
| `Food Systems Obsidian/12 Kilder/` | Small source-navigation layer | Source-record projection | Generate one source record per stable source identity; never duplicate the raw evidence. |
| Existing canvases and graph settings | Visual navigation | Presentation | Preserve; regenerate only after stable page identities and redirects exist. |
| Application and `mcp/foodsystems-kb/` | Query and delivery | Read-only projection | Query structured evidence and compiled pages; fail closed for external claims; never become a parallel truth store. |

## What can migrate automatically

- Stable file paths and content hashes.
- Existing database IDs, organization numbers and reviewed person keys.
- Exact source, citation and field-citation relationships.
- Existing dated status values without semantic promotion.
- Unambiguous legacy stage values: inputs, primary, processing, distribution, market, consumption and return flows.
- The thirteen field-to-domain/stage navigation mappings in the ontology.
- Coverage skeleton cells and explicit `unassessed` states.

## What requires semantic or human review

- `seafood` used as a stage: map to fishery/aquaculture/processing/distribution plus an aquatic commodity.
- `waste` used without generation, collection, recovery or disposal stage.
- `import` and `export` used as material/flow types instead of trade direction and a physical commodity flow.
- Synthesis prose without exact claim and source locators.
- Duplicate or normalized-collision person/company names.
- Claims that conflate observed, verified, citable, complete, potential, pilot or realized states.
- Any `geo.nordic` claim that does not list represented and missing geographies.
- Sápmi or lived-experience synthesis without an authorized human-evidence route.
- Causal, health, environmental-effect or intervention-effect claims without reviewed appraisal.

## Migration waves

### Wave 0 — lock the contract

- Review and adopt the constitution, ontology, coverage schema and status vector.
- Keep the foundation and corpus-health thresholds `proposed` until named receipts exist.
- Preserve the integrated hardening lineage and separately audit the live checkout's unrelated uncommitted work before any adoption or merge.
- Record the current vault file hashes and normalized-name collisions.

Exit: scope and identity rules approved; canonical lineage named; no existing content moved.

### Wave 0.5 — close Gate 1

- Keep schema, all migrations and auditors atomic on the chosen lineage; the current 31/31 migration receipt must remain green.
- Reconcile 400/417 evidence identities and 1,555/1,572 library identities.
- Regenerate academic, master, remediation and vault status surfaces from the pinned snapshot.
- Rerun citation, appraisal, archive, graph, vault, backup/restore and MCP gates.
- Add immutable receipts for lineage adoption, human review and every required operational layer.

Exit: internal analysis is reproducible; external and observatory profiles remain blocked unless their stricter appraisal, archive, review and operational requirements also pass.

### Wave 1 — map the thirteen fields

- Map each field page and the canonical internal synthesis into canonical cells.
- Register every supporting artifact and explicit limitation.
- Keep unsupported cells `unassessed`; do not promote by keyword mention.

Exit: every existing field view links to canonical cells, with represented/missing geography visible.

### Wave 2 — evidence and claims pilot

- Select claims from I01–I26 and map them to exact citations and locators.
- Compile source, claim, concept and contradiction pages using managed blocks.
- Prove dry-run output, human-section preservation and double-run idempotence.

Exit: one reviewed claim chain resolves source → citation → claim → compiled page → query.

### Wave 3 — vertical food-system slices

Migrate complete cross-system pilots before bulk generation:

1. grain, feed, fertilizer and N-P-K;
2. dairy and meat;
3. fisheries, aquaculture and aquafeed;
4. public meals, household consumption, redistribution and waste.

Each pilot crosses every mandatory geography and declares absent, unknown, blocked and not-applicable cells explicitly.

Exit: ontology and coverage rules survive real end-to-end systems without category collapse.

### Wave 4 — Nordic parity

- Build source and evidence packs for Iceland, the Faroe Islands, Greenland and Åland.
- Harmonize definitions, periods, units and system boundaries across the five states and three territories.
- Run Sápmi as a separate rights-holder-led programme.

Exit: comparisons distinguish five-state, whole-political-Nordic and Sápmi coverage.

### Wave 5 — observatory

- Add temporal validity, monitoring rules, update triggers, contradiction queues and staleness lint.
- Generate Obsidian, app and MCP projections from the same identities and assessments.
- Add named quarterly red-team review and annual method/privacy/licensing audit.

Exit: priority cells are maintained over time rather than merely documented once.

## Database target after contract review

The eventual database should store five related records:

1. `CoverageCell` — stable expected knowledge unit;
2. `CoverageAssessment` — append-only state observed at a point in time;
3. `CoverageEvidenceLink` — exact source/citation/appraisal support or counterevidence;
4. `CoverageReview` — immutable named human-review receipt;
5. `MonitoringRule` — cadence, trigger, staleness threshold and owner.

Existing `SourceDoc`, `SourceCitation`, `FieldCitation`, report, thesis, library-analysis and `EvidenceAppraisal` identities are the intended evidence authorities on the integrated migration lineage. Appraisal remains 0/417 and seed/runtime identities remain unreconciled, so the coverage database must reference reviewed, reconciled records rather than create a second source registry.

## Migration acceptance

- Zero altered human-owned sections.
- Zero broken vault links or unresolved redirects created by the migration.
- Unique stable IDs independent of filenames.
- Deterministic compilation and projection generation.
- Explicit unknowns for every expected core cell.
- No automatic external-citability or human-review promotion.
- No legacy page retirement without parity validation and human approval.
