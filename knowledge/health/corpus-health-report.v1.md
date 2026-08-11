# Gate 1 — corpus and evidence health

**Assessment:** `health.assessment.2026-08-11.local.3af9a333`

**Snapshot:** 2026-08-11

**HEAD:** `3af9a333602381eeb4f93c97335d2459ef7c8c75`
**Threshold status:** `proposed`

## Decision

**NO-GO for reproducible internal analysis, external evidence support and observatory operation.** Internal discovery is usable only with explicit caveats. Repository and local-database migration names and SQL checksums are reconciled (29 mismatches across 31 migrations). Current HEAD has 400 seed rows and the local database has 463 evidence rows. Classified evidence identity is not reconciled. The raw 73 database-only rows comprise 17 declared runtime-managed and 56 unclassified identities; 10 seed-only and 0 missing declared-managed identities remain.

This is a corpus/evidence-health assessment, not a food-system coverage assessment. It creates no coverage cells, carries no global score and cannot support a claim that the Nordic food system is fully mapped.

## Whole-corpus processing boundary

- Active baseline: **1555** unique identities; **1537** bind exact source-content hashes representing **554322179 bytes**. **11** known files are missing and **18** identities have no locator.
- Processing queue: **1467** content-deduplicated units; full-text processing is **0/1555** and owner-confirmed source roles are **0/1555**.
- Human and authorization gates: Gabriel owner review **0**; independent expert validation **0**; partner validation **0**; rights-holder validation **0**; rights clearance **0**; publication approval **0**; separate coverage approval **0**.
- Tracked PDF extraction: **15** technical units with **0 technical failures**, **772/772 pages**, **272545 extracted words**, **35 warning pages** and **12 open identity blockers**: **2** legacy alias/scope blockers and **10** unregistered-source candidate blockers. These are extraction-volume facts, not AI reading or semantic analysis.
- PDF receipt boundary: portable tracked validation is **true**; live private-archive verification in this run is **false**. AI analysis, owner review, independent validation, rights clearance, publication readiness and coverage permission all remain false for this batch.
- Legacy Gate 2C: **0** canonical human approvals are created by status alone. All **5** legacy mappings retain an unclassified human-review component until signer authority, gate role and exact scope are evidenced.

## Intended-use verdicts

| Profile | Verdict | Ready | Main reason codes |
|---|---|---:|---|
| `health_profile.internal_discovery` | **READY_WITH_WARNINGS** | yes | active_corpus_enumerated, bounded_inventory_available, hash_bound_snapshot, migration_lineage_reconciled |
| `health_profile.internal_analysis` | **DEGRADED** | no | migration_lineage_mismatch, seed_identity_mismatch, library_identity_mismatch, library_projection_freshness_pending, whole_corpus_full_text_zero, status_vintage_conflicts |
| `health_profile.external_evidence_support` | **BLOCKED** | no | evidence_appraisal_zero, archive_gate_failed, owner_review_zero, independent_validation_zero, rights_clearance_zero, identity_unreconciled, human_review_pending |
| `health_profile.observatory_operations` | **BLOCKED** | no | migration_lineage_mismatch, identity_unreconciled, library_projection_freshness_pending, operational_layers_partially_proven, receipts_partial, conflicts_open |

## Critical evidence boundary

- Evidence appraisal: **0/463** complete current appraisals.
- Archive durability: **72/2611** citations have a durable archive; **2469/2541** external-readiness citations still need one.
- Exact claim locators: **0/240578** claim-text rows also carry a page or quote locator.
- Library state: **0/1555** live identities are materialized; the remaining **0** of **0** persisted rows are exact contract-bound history, with **1555** inventory-only rows and **1572** contract issues. The separately reported projection-freshness queue contains **15** metadata-only updates.
- Vault state: **786** Markdown notes and **32** canvases; the current validator reports **0** issues. Counts are navigation signals, not evidence completeness.

## Conflict register

| Conflict | Severity | Status | Boundary |
|---|---|---|---|
| `health.conflict.code_db_lineage` | blocker | open | Current code and local database have divergent migration lineages |
| `health.conflict.seed_database_identity` | blocker | open | Current seed identities and local database evidence identities differ |
| `health.conflict.historical_status_foreign_lineage` | high | open | Tracked academic status describes a different seed lineage |
| `health.conflict.library_inventory_materialization` | high | open | Derived library inventory and persisted materialization differ without a complete contract |
| `health.conflict.remediation_vintage` | warning | open | Remediation backlog counts have conflicting vintages |
| `health.conflict.vault_reported_vs_observed` | high | resolved | Completion register and current vault validation disagree |
| `health.conflict.academic_regression_reported_vs_head` | high | open | Tracked academic regression gate does not reproduce on current HEAD |

## Resolution sequence

1. Process the 1467 deduplicated corpus units through exact full-text, claim and cross-check receipts; do not treat PDF extraction volume as reading completion.
2. Record Gabriel's owner review separately from independent expert, partner and rights-holder validation, then complete rights, publication and coverage decisions only where required.
3. Resolve the 11 missing files, 18 no-locator identities and 12 PDF identity blockers (2 legacy alias/scope and 10 unregistered candidates).
4. Keep the receipt-bound 31/31 migration lineage check green as schema and migrations evolve.
5. Reconcile every unclassified database-only, seed-only and missing declared-managed identity while preserving the manifest-derived runtime identity boundary.
6. Keep the 0/1555 live library identity check exact, revalidate all 0 retained-history rows, and close the separate metadata-only projection-freshness queue.
7. Complete reviewed appraisal, durable archive work, fresh backup/restore proof, MCP role enforcement and runtime parity for each required use.

Gate 2 may now register the thirteen legacy fields as neutral artifact and navigation records because the canonical migration lineage is integrated. Those registrations must remain non-evidentiary and cannot promote coverage until reviewed against exact coverage cells.
