# Gate 1 — corpus and evidence health

**Assessment:** `health.assessment.2026-07-27.local.f7148da4`

**Snapshot:** 2026-07-27

**HEAD:** `f7148da4bf679b7cbe187a2763a199b6fbba6e35`
**Threshold status:** `proposed`

## Decision

**NO-GO for reproducible internal analysis, external evidence support and observatory operation.** Internal discovery is usable only with explicit caveats. The principal blocker is a code/database lineage mismatch: current HEAD has 14 migrations and 392 seed evidence rows, while the local database has 31 completed migrations and 417 evidence rows.

This is a corpus/evidence-health assessment, not a food-system coverage assessment. It creates no coverage cells, carries no global score and cannot support a claim that the Nordic food system is fully mapped.

## Intended-use verdicts

| Profile | Verdict | Ready | Main reason codes |
|---|---|---:|---|
| `health_profile.internal_discovery` | **READY_WITH_WARNINGS** | yes | bounded_inventory_available, hash_bound_snapshot, lineage_caveat_required |
| `health_profile.internal_analysis` | **DEGRADED** | no | code_database_lineage_mismatch, seed_identity_mismatch, status_not_reproducible |
| `health_profile.external_evidence_support` | **BLOCKED** | no | evidence_appraisal_zero, archive_gate_failed, identity_unreconciled, human_review_pending |
| `health_profile.observatory_operations` | **BLOCKED** | no | lineage_unreconciled, operational_layers_unproven, receipts_missing, conflicts_open |

## Critical evidence boundary

- Evidence appraisal: **0/417** complete current appraisals.
- Archive durability: **568/2703** citations have a durable archive; **1855/2376** external-readiness citations still need one.
- Exact claim locators: **4/241121** claim-text rows also carry a page or quote locator.
- Library state: **1555** current inventory rows versus **1572** persisted rows.
- Vault state: **786** Markdown notes and **32** canvases; the current validator reports **2** issues. Counts are navigation signals, not evidence completeness.

## Open conflicts

| Conflict | Severity | Status | Boundary |
|---|---|---|---|
| `health.conflict.code_db_lineage` | blocker | open | Current code and local database have divergent migration lineages |
| `health.conflict.seed_database_identity` | blocker | open | Current seed identities and local database evidence identities differ |
| `health.conflict.historical_status_foreign_lineage` | high | open | Tracked academic status describes a foreign seed lineage |
| `health.conflict.library_inventory_materialization` | high | open | Derived library inventory and persisted materialization differ |
| `health.conflict.remediation_vintage` | warning | open | Remediation backlog counts have conflicting vintages |
| `health.conflict.vault_reported_vs_observed` | high | open | Completion register and current vault validation disagree |
| `health.conflict.academic_regression_reported_vs_head` | high | open | Tracked academic regression gate does not reproduce on current HEAD |

## Resolution sequence

1. Choose and document one canonical code/database lineage.
2. Integrate schema, all migrations, seeds and auditors atomically.
3. Reconcile the 392/417 evidence identities and 1,555/1,572 library identities.
4. Regenerate the academic, master, remediation and vault status surfaces from the pinned lineage.
5. Complete reviewed appraisal and durable archive work for the required external scope.
6. Prove backup/restore, MCP read-only behavior, runtime parity and required human gates with immutable receipts.

Only then should Gate 2 map the thirteen legacy fields into neutral artifact registrations; those registrations must remain non-evidentiary until reviewed against exact coverage cells.
