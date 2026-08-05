# Database release controls and backup v2 receipt — 2026-07-20

## Decision

- Local database structure and recoverability: **PASS**.
- Dedicated local MCP role: **PASS** for the exact 20-relation read allowlist and negative write/DDL probes.
- Controlled Matsvinnloven identity mutation: **BLOCKED / NOT APPLIED**.
- Off-node retention and production restore: **NOT PROVEN** by this receipt.

## Applied database controls

The local `foodsystems` PostgreSQL database is at 31/31 completed Prisma
migrations. The relevant additive controls are:

1. `20260720_controlled_mutation_release_controls`
2. `20260720_matsvinnloven_audit_dependency_binding`
3. `20260720_release_control_field_citation_integrity_v2`
4. `20260720_release_control_field_citation_integrity_v3`

Verified live state:

- canonical dangling `Thesis`/`Document`/`SourceDoc`/`Report` FieldCitations: 0
- forbidden `Thesis:matsvinnloven-2025` FieldCitations: 0
- quarantined synthetic `Document` targets: 0
- non-canonical case/whitespace aliases for controlled target types: 0
- `DatabaseIdentity`: exactly 1 immutable primary row
- `ControlledMutationAudit`: 0 rows; no controlled identity mutation was run
- the audit dependency hash and database-role binding are required and append-only
- target delete, target-ID update, target truncate, and cited-Document quarantine are blocked
- the v3 Document branch uses `FOR SHARE`; the two-connection regression proves both citation-first and quarantine-first races end in a legal state
- `foodsystems_mcp_ro` has no access to the two control tables
- MCP bootstrap removes default `PUBLIC EXECUTE` for current user-schema object owners; the verifier rejects future fail-open routine defaults

The reviewed access-date batches were also applied through pinned manifest,
plan-hash, Serializable transaction, row locks, and full-row CAS controls:

- Reports: 55 applied; one exact linked-Document mirror applied; two unrelated work-level Document locators protected unchanged
- SourceDocs: 48 applied; five exact old-URL linked-Document mirrors applied
- the historical first-pass residual was 11 Reports and 9 SourceDocs; after
  provenance/identity reconciliation the current access queue is 9 Reports,
  24 SourceDocs and the blocked synthetic Thesis

## Final metadata-v2 backup

- dump: `/Users/gabrielfreeman/.local/share/foodsystems/backups/foodsystems-post-identity-content-hardening-20260720-20260720T035014Z.dump`
- dump SHA-256: `8f7eca4ccc5210544ebfc06ee26f2d0e9d3b297eb93ebca653e310e826aabd52`
- dump bytes: `29494452`
- metadata SHA-256: `0bfcb01407fc589db776e855d53026bc33480603f95617aec8c12f8f629da1ad`
- database identity UUID: `90e3e24d-230f-42f7-b178-5bcd5b861e84`
- completed migration-ledger count/hash: `31` / `31a539201bc2a317d14c95fda235198488168dedb4086385e4c7ccf0db9e28ce`
- target database fingerprint SHA-256: `ff0b23e8b3570bc8a7d6d84546f11d58ca0dbe94adaf3bcfaa228044b2536d49`
- dump and sidecars: mode `0600`
- archive, checksum, required-object, metadata-v2, ledger, identity, exact-count, and fingerprint verification: **PASS**

Core counts bound into metadata v2:

| Relation | Rows |
|---|---:|
| `DatabaseIdentity` | 1 |
| `ControlledMutationAudit` | 0 |
| `Document` | 1539 |
| `Report` | 139 |
| `Thesis` | 79 |
| `SourceDoc` | 199 |
| `SourceCitation` | 2703 |
| `FieldCitation` | 244516 |
| `LibraryAnalysisRecord` | 1572 |
| `EvidenceAppraisal` | 0 |

## Restore receipt

- receipt: `/Users/gabrielfreeman/.local/share/foodsystems/restore-receipts/foodsystems-post-identity-content-hardening-20260720-20260720T035014Z.restore-receipt.json`
- receipt SHA-256: `2c88baa2c9537e65efcffb28c2ca858bbebc748def7b2c64243c33b4f2cc6549`
- receipt mode: `0600`
- disposable database: `foodsystems_restore_identity_content_20260720_035014_retry`
- full restore, exact core counts, completed migration ledger, constraints, indexes, database identity, metadata binding, and target fingerprint: **PASS**
- disposable drop and confirmed absence: **PASS**; remaining database count: 0

The first restore attempt deliberately used the long-running application role
and failed closed at `CREATE EXTENSION vector`, as that role is not a
superuser. Cleanup removed the exact disposable target and no receipt was
published. The successful retry used the local PostgreSQL administrator only
for create/restore/drop; the final receipt records the verified retry and
confirmed absence.

## Proof boundary

This proves a local, access-controlled backup and a disposable restore on the
same PostgreSQL installation. It does not prove off-node retention, scheduled
backup freshness, production parity, or a production restore. The Matsvinnloven
identity apply remains hard-disabled; a future attempt still needs a separately
authorized mutation, stronger backup-content/instance binding, and a complete
audit receipt in the same transaction.
