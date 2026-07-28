# Critical current-state audit

Foundation snapshot: 2026-07-26

Gate 1 corpus-health snapshot: 2026-07-27

Base commit: `f7148da4bf679b7cbe187a2763a199b6fbba6e35`

Status: internal proposal; not externally citable and not an adoption receipt

## Verdict

Food Systems 2026 has a large, valuable and unusually well-documented corpus. It does **not** yet have evidence-backed, maintained coverage of every material part of the Nordic food system.

The strongest current assets are navigation, Norway-heavy actor and power mapping, source/citation infrastructure, internal synthesis, and explicit delivery controls. The weakest links are cell-specific evidence mapping, Nordic and territorial parity, source appraisal, activity and time-series data, archive durability, human evidence, Sápmi rights-holder review, and computed completeness against a stable scope.

The new foundation therefore records **6,948 defined scope cells, 117 neutral scope-registration events, zero evidence-backed coverage assessments and zero cells complete for their required readiness profile**. That is the honest starting line, not a finding that the corpus contains no knowledge.

Gate 1 is now generated as a separate corpus/evidence-health observatory. Its current decision is **NO-GO** for reproducible internal analysis, external evidence support and observatory operation; only internal discovery is `ready_with_warnings`. This does not change the subject-coverage ledger. It explains whether the material can safely support a named use.

## Gate 1 direct readback and lineage blocker

The [hash-bound Gate 1 assessment](health/corpus-health-report.v1.md) found that the local database is not reproducible from this branch:

| Direct observation, 2026-07-27 | Current result | Consequence |
|---|---:|---|
| HEAD migration directories | 14 | Current code is missing seventeen migrations completed in the local database. |
| Local database completed migrations | 31 | The schema and migration set match divergent hardening commit `407d984d61fb97392dfc25992c54e6e320e54b2d`; it is not an ancestor of this HEAD. |
| HEAD seed evidence rows | 392 = 132 reports + 78 theses + 182 SourceDocs | `npm run audit:academic-source-quality` currently exits 1 because SourceDoc URL coverage is 99/182, below the 55% minimum. |
| Local database evidence rows | 417 = 139 reports + 79 theses + 199 SourceDocs | Twenty-five database identities are absent from current seeds. This is a local runtime snapshot, not production-parity proof. |
| Complete current evidence appraisal | 0/417 | External evidence support remains blocked regardless of technical citation integrity. |
| Durable citation archive | 568/2,703 | 1,855/2,376 external-readiness rows still need durable archive; the archive audit fails. |
| Current library inventory / persisted analysis | 1,555 / 1,572 | Seventeen persisted identities are stale relative to the current inventory. |
| Current vault validation | 786 Markdown, 32 canvases, 2 orphan issues | The completion register's earlier green vault statement does not reproduce on this snapshot. Notes remain navigation, not evidence units. |

The tracked `academic-source-quality-status.json` and `public/data/masterhjerne/status.json` were generated from the hardening lineage. They remain useful historical observations, but their passing regression result and 18-record hardening-relative identity difference are **foreign-lineage status**, not current-HEAD proof. Gate 1 preserves both reported and directly observed values as an open conflict instead of choosing whichever looks better.

Seven machine-readable conflicts remain open: code/database lineage, seed/database identity, foreign-lineage academic status, library inventory/materialization, remediation backlog vintage, reported/current vault state, and reported/current academic regression state. No conflict is marked resolved because there is no resolution receipt.

## What was evaluated

This review treated the following as distinct truth surfaces:

1. the tracked source and evidence corpus;
2. structured citation and database records;
3. internal syntheses and status reports;
4. the Obsidian vault and its thirteen field maps;
5. generated application and data views;
6. operational completion and research queues.

The [current-corpus migration map](migration/CURRENT-CORPUS-MAP.md) records the disposition of those surfaces. Existing uncommitted work in the live checkout was deliberately excluded from this base-commit assessment.

## Karpathy pattern, adapted for a food-system observatory

The original LLM Wiki pattern makes raw sources immutable, puts an LLM-maintained wiki between sources and queries, and treats an evolving schema plus ingest/query/lint loops as the operating system. Food Systems 2026 needs the same compounding behavior, with stronger scientific and governance gates:

```text
immutable source snapshots
  -> typed citations, claims, observations, relationships, appraisals and reviews
  -> maintained compiled wiki
  -> Obsidian, app, MCP and exports
  -> questions and gaps written back into the research queue
```

The wiki is a maintained explanatory product, not the evidence authority. A new source must reconcile every affected entity, claim, comparison, contradiction, coverage cell and synthesis page. A useful query may become a draft page, but its prose cannot cite itself or promote readiness.

See the [compiled-wiki contract](COMPILED-WIKI-CONTRACT.md) for the ingest → query → lint contract.

## What the current corpus does and does not prove

| Current signal | What it supports | What it does not support |
|---|---|---|
| The tracked master status reports 1,555 library records, 417 academic/external evidence rows, 70 actor-inventory cells and 1,634 mapped actor registrations. | The project has substantial discoverable material and machine-readable inventories. | Whole-system, whole-Nordic or topic-by-topic completeness. The status itself is internal and not claim-locked. |
| The latest tracked actor-gap report totals 1,634 registrations across 70 Norway-only cells. | A useful Norway actor-discovery floor and a concrete migration input. | Exhaustive actor universes, current activity, volumes, turnover or Nordic parity. Fifty-nine cells are reported low-confidence. |
| The tracked status reports 244,516 field citations and 2,703 source citations, while academic appraisal remains 0/417. | Strong technical provenance machinery and a large citation graph. | Academic readiness or reviewed evidence quality. Technical source gates and appraisal are different controls. |
| The completion register records 50/50 R13 prompts received and 13/13 R14 decision batches. | Intake and control completion. | Research completion, partner validation or external claim readiness. |
| The tracked vault baseline contains 786 Markdown notes, 32 canvases and thirteen field maps. | A useful navigation and synthesis surface. | 786 verified knowledge units or full domain coverage. |
| Internal status reports identify a stronger Norwegian layer than Swedish, Danish, Finnish, Icelandic and territorial layers. | A known prioritization signal for parity work. | Permission to use Norway as a Nordic proxy. |
| Interview and partner-validation routes exist but are reported as not conducted. | The project knows where human evidence is required. | Lived-experience, producer, worker, household, partner or rights-holder validation. |

Primary internal boundaries for this table are documented in:

- [Masterhjernen status, 2026-07-21](../masterhjerne/MASTERHJERNE-STATUS-2026-07-21.md);
- [completion register, 2026-07-15](../docs/project/status/food-systems-completion-register-2026-07-15.md);
- [Norway actor-domain gap report, 2026-07-02](../research/_status/domene-dekning-hull-2026-07-02.md);
- [the existing thirteen-field map](../Food%20Systems%20Obsidian/1%20Oversikt%20og%20navigasjon/Feltkart%20%E2%80%93%20kunnskapsbasen.md).

These snapshots contain known vintage and lineage conflicts. They remain migration evidence, not normalized current truth. The separate corpus/evidence-health profile is now generated and makes those conflicts explicit; it does not resolve them or promote their numbers into subject coverage.

## Why “every detail” is not a finite checklist

A food system is open, changing and multi-scalar. Completeness is only meaningful against a declared profile:

```text
named geography and territorial rule
× explicit stage or system function
× analytical domain
× required child dimensions
× period, unit, universe and system boundary
× evidence, review and freshness threshold
```

The tier-1 macro matrix is therefore a planning surface, not an atomic partition. Packaging, cold chain, public procurement, consumption contexts and loss generation overlap other processes. Each materially heterogeneous cell must declare tier-2 children for subnational geography, commodity, actor, flow, outcome, period, metric, relationship and knowledge object. Tier 3 contains the claims, observations and evidence links.

## Material gaps that remain

1. **Evidence-to-cell mapping:** existing sources and claims have not been reconciled into the 6,831 macro cells.
2. **Geographic parity:** all eight political reporting scopes need evidence packs and harmonized boundaries; Sápmi is a separate, non-additive, rights-holder-led programme.
3. **Commodity and material resolution:** `macro_v1` is only a tier-1 grouping. Species, product, feed, fertilizer, packaging, nutrient and side-stream crosswalks remain tier-2 work.
4. **Activity and quantities:** actor existence cannot substitute for current operation, capacity use, volumes, prices, margins, material balances or outcomes.
5. **Time:** observations need subject periods, validity intervals, update triggers and comparable series. Audit date is not subject-matter time.
6. **Evidence quality:** causal, intervention, health and environmental claims need reviewed appraisal; exact claim-to-locator migration remains incomplete.
7. **Archive durability:** externally usable citations require durable copies or verified hashes where licensing permits.
8. **Human and Indigenous evidence:** producer, worker, household, partner and Sápmi knowledge require consented, named review routes.
9. **Contradictions and identity:** claims must coexist through support/challenge/supersession relations; entity resolution must happen before pages merge.
10. **Maintenance:** laws, company structures, prices, technology, climate, trade and policy require monitoring rather than one-time documentation.

## Research and build programme

### Gate 0 — review the foundation

Review and authorize the constitution, ontology, schemas, readiness thresholds and anti-double-count rules. Until a named receipt exists, the baseline remains `proposed`.

### Gate 1 — reconcile corpus health

The first dated corpus/evidence-health profile is generated. Keep it fail-closed while resolving the 14/31 migration lineage, 392/417 evidence identity set, 1,555/1,572 library materialization, foreign-lineage status snapshots, two vault orphans, appraisal zero-state and archive backlog. Regenerate every dependent status artifact from one pinned lineage. Do not force these controls into food-system coverage cells.

Gate 1 exit requires a named canonical lineage, exact schema/migration/seed parity, regenerated status surfaces, complete required appraisal and archive work, passing structural gates, and current receipts for backup/restore, MCP read-only behavior, runtime parity and required human review.

### Gate 2 — map the thirteen fields

For each legacy field and geography, register exact artifacts, citations, locators, boundaries, represented and missing facets, limitations and review receipts. Leave the state unknown when the evidence is not cell-specific.

### Gate 3 — prove vertical slices

Run reviewed end-to-end pilots for:

1. grain, feed, fertilizer and N-P-K;
2. dairy and meat;
3. fisheries, aquaculture and aquafeed;
4. public meals, household consumption, redistribution and waste.

Each pilot must cross all political geographies, keep Sápmi separate, and compile source → citation → claim/observation → coverage assessment → wiki page → query.

### Gate 4 — close priority parity and depth gaps

Build territorial and country evidence packs, tier-2 commodity/actor/flow cells, harmonized metrics, human evidence and reviewed appraisal. Prioritize decision relevance and risk, not filling every cell equally.

### Gate 5 — operate the observatory

Automate ingest receipts, contradiction queues, drift checks, monitoring deadlines, generated indexes and safe wiki compilation. A source update should produce an inspectable semantic diff and never overwrite human-owned sections.

## Decision rule

The project can say “complete for profile X” only when the generator computes it from frozen scope, explicit inventory, typed evidence with exact locators, mandatory facet accounting, required child coverage and immutable review receipts. No person or model may set that status directly.
