# Gate 1 — corpus and evidence health

**Assessment:** `health.assessment.2026-07-28.local.e9babbc2`

**Snapshot:** 2026-07-28

**HEAD:** `e9babbc298ac6a3481e5df640df0400a1f1688fb`
**Threshold status:** `proposed`

## Decision

**NO-GO for reproducible internal analysis, external evidence support and observatory operation.** Internal discovery is usable only with explicit caveats. Repository and local-database migration names and SQL checksums are reconciled (0 mismatches across 31 migrations). Current HEAD has 400 seed rows and the local database has 417 evidence rows. Classified evidence identity is not reconciled. The raw 18 database-only rows comprise 17 declared runtime-managed and 1 unclassified identities; 1 seed-only and 0 missing declared-managed identities remain.

This is a corpus/evidence-health assessment, not a food-system coverage assessment. It creates no coverage cells, carries no global score and cannot support a claim that the Nordic food system is fully mapped.

## Intended-use verdicts

| Profile | Verdict | Ready | Main reason codes |
|---|---|---:|---|
| `health_profile.internal_discovery` | **READY_WITH_WARNINGS** | yes | bounded_inventory_available, hash_bound_snapshot, migration_lineage_reconciled |
| `health_profile.internal_analysis` | **DEGRADED** | no | migration_lineage_reconciled, seed_identity_mismatch, library_projection_freshness_pending, status_vintage_conflicts |
| `health_profile.external_evidence_support` | **BLOCKED** | no | evidence_appraisal_zero, archive_gate_failed, identity_unreconciled, human_review_pending |
| `health_profile.observatory_operations` | **BLOCKED** | no | migration_lineage_reconciled, identity_unreconciled, library_projection_freshness_pending, operational_layers_partially_proven, receipts_partial, conflicts_open |

## Critical evidence boundary

- Evidence appraisal: **0/417** complete current appraisals.
- Archive durability: **568/2703** citations have a durable archive; **1855/2376** external-readiness citations still need one.
- Exact claim locators: **4/241121** claim-text rows also carry a page or quote locator.
- Library state: **1555/1555** live identities are materialized; the remaining **17** of **1572** persisted rows are exact contract-bound history, with **0** inventory-only rows and **0** contract issues. The separately reported projection-freshness queue contains **15** metadata-only updates.
- Vault state: **786** Markdown notes and **32** canvases; the current validator reports **2** issues. Counts are navigation signals, not evidence completeness.

## Conflict register

| Conflict | Severity | Status | Boundary |
|---|---|---|---|
| `health.conflict.code_db_lineage` | blocker | resolved | Repository and local database migration lineages are reconciled |
| `health.conflict.seed_database_identity` | blocker | open | Current seed identities and local database evidence identities differ |
| `health.conflict.historical_status_foreign_lineage` | high | resolved | Tracked academic status is reproduced on the integrated lineage |
| `health.conflict.library_inventory_materialization` | high | accepted_tension | Live library identity is exact; persisted retained history is contract-bound |
| `health.conflict.remediation_vintage` | warning | open | Remediation backlog counts have conflicting vintages |
| `health.conflict.vault_reported_vs_observed` | high | open | Completion register and current vault validation disagree |
| `health.conflict.academic_regression_reported_vs_head` | high | resolved | Tracked academic regression gate reproduces on current HEAD |

## Resolution sequence

1. Keep the receipt-bound 31/31 migration lineage check green as schema and migrations evolve.
2. Reconcile every unclassified database-only, seed-only and missing declared-managed identity while preserving the manifest-derived runtime identity boundary.
3. Keep the 1555/1555 live library identity check exact, revalidate all 17 retained-history rows, and close the separate metadata-only projection-freshness queue.
4. Regenerate or supersede the master, remediation and vault status surfaces from explicit pinned vintages.
5. Complete reviewed appraisal and durable archive work for the required external scope.
6. Prove current backup/restore, MCP role enforcement, runtime parity and required human gates with immutable receipts.

Gate 2 may now register the thirteen legacy fields as neutral artifact and navigation records because the canonical migration lineage is integrated. Those registrations must remain non-evidentiary and cannot promote coverage until reviewed against exact coverage cells.
