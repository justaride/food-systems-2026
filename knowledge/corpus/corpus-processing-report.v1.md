# Whole-corpus processing register

Register observation: 2026-08-02T20:58:11Z

Tracked ledger observation: 2026-07-28T05:32:26.743Z

Status: internal processing baseline; not evidence readiness, owner approval, external validation, rights clearance, or publication approval.

## Current boundary

| Boundary | Count | Treatment |
|---|---:|---|
| Active corpus identities | 1555 | Exactly one processing row per tracked ledger identity |
| Retained history | 17 | Separate, non-additive historical boundary |

The retained-history rows are never summed into the active corpus. The active boundary is pinned to the exact metadata-only live-inventory snapshot recorded at 2026-08-02T21:38:56.421Z; the portable generator verifies that snapshot and ledger hash without claiming a fresh database read.

## Repository files

| State | Count |
|---|---:|
| missing | 11 |
| no_locator | 18 |
| present | 1526 |

The recovery register records 11 primary/replica capture attestations. Portable generation did not re-open either private archive in this run (live verification performed: false); use the explicit private check to verify hashes, sizes and modes. Recorded recovery metadata does not change repository presence, prove full-text review, clear rights, or permit publication.

1537 active identities are bound to an observed repository-file hash or a recorded private-capture hash; 18 identities still have no available source-byte hash. A byte hash proves identity of bytes, not that their text has been read.

## Provisional source roles

| Role | Count |
|---|---:|
| generated_projection | 13 |
| internal_synthesis | 666 |
| operational_control | 185 |
| primary_evidence | 567 |
| unknown | 124 |

Machine rules provide provisional distinctions only. Every active identity remains in the role-classification queue until Gabriel signs an exact role-confirmation receipt; no concrete machine role counts as owner-confirmed.

2 known title/path alias mismatches are forced to unknown: the UNESCO Biosphere report is contextual pending owner review, while Beyond Zero architecture is likely out of scope pending owner review. Neither legacy filename may drive promotion.

## Explicit work queues

| Queue | Rows or groups |
|---|---:|
| missingFiles | 29 |
| roleClassification | 1555 |
| fullTextProcessingUnits | 1467 |
| fullTextIdentitiesPending | 1555 |
| ownerReview | 1555 |
| normalizedPathDuplicateGroups | 53 |
| contentHashDuplicateGroups | 80 |

Every active identity remains represented in both the content-hash-deduplicated full-text queue and the per-identity owner-review queue. Word count, an AI triage card, internal approval, or a private capture is not a full-text receipt.

## Duplicate review

- Normalized-path groups: 53
- Content-hash groups: 80

Duplicate groups are review signals only. The generator never deletes, merges, supersedes, or marks them resolved.

## Promotion boundary

Full-text complete: 0. Owner reviewed: 0. Internal knowledge ready: 0. External-use ready: 0. Coverage promotion allowed: 0. These states may change only through later content-addressed processing and review receipts.
