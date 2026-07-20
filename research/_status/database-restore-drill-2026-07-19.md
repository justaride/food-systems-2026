# Local Database Restore Drill — 2026-07-19

## Result

- Status: **PASS**
- Backup created at: `2026-07-19T21:50:41Z`
- Successful disposable target:
  `foodsystems_restore_20260719_215043_final`
- Cleanup: **PASS** — the exact disposable target was removed
- Scope: local Food Systems database after EvidenceAppraisal migrations,
  academic identity/provenance/citation repairs, and library-analysis repair

## Backup under test

- Archive:
  `foodsystems-post-appraisal-hardening-20260719-20260719T215041Z.dump`
- Absolute path:
  `/Users/gabrielfreeman/.local/share/foodsystems/backups/foodsystems-post-appraisal-hardening-20260719-20260719T215041Z.dump`
- Format: PostgreSQL custom
- Source database: `foodsystems`
- PostgreSQL server version: `16.13 (Homebrew)`
- Size: `29 470 870` bytes
- SHA-256:
  `a224f5cb8366d1a5332e8e9be64fb53ea075276ab37e3369f0818e7f11746bc5`
- Dump boundary: `--no-owner --no-acl`; roles, ownership, grants and default
  ACL are not included
- Storage boundary: local and off-repo under
  `~/.local/share/foodsystems/backups`; no access-controlled off-node copy was
  proven

## Exact restored counts

| Relation | Expected | Restored |
|---|---:|---:|
| `Document` | 1 539 | 1 539 |
| `SourceCitation` | 2 703 | 2 703 |
| `FieldCitation` | 244 521 | 244 521 |
| `Report` | 139 | 139 |
| `Thesis` | 79 | 79 |
| `SourceDoc` | 199 | 199 |
| `LibraryAnalysisRecord` | 1 572 | 1 572 |
| `EvidenceAppraisal` | 0 | 0 |

Zero `EvidenceAppraisal` rows is the expected fail-closed state before human
full-text appraisal; it is not external-readiness evidence.

## Checks completed

1. The archive checksum matched its atomically published sidecar.
2. The archive catalog contained all eight counted relations plus
   `_prisma_migrations`.
3. The restricted `foodsystems_restore_*` target did not already exist.
4. Restore completed with `pg_restore --exit-on-error --no-owner --no-acl`.
5. All eight exact relation counts matched the source snapshot.
6. The restored Prisma ledger contained completed, non-rolled-back migrations.
7. No invalid or unready indexes were present.
8. No unvalidated constraints were present.
9. The exact disposable database was dropped after the checks.

## Credential and proof boundary

The local PostgreSQL administrator was used only to create, restore and remove
the disposable target. The long-running application and MCP roles were not
granted extension-creation or restore-administration privileges. Separate
read-only-role verification is required because the archive intentionally does
not carry roles or ACL.

This receipt proves recoverability only for the local snapshot named above.
It does not prove an off-node copy, production backup configuration,
production restore, production migration parity, or production MCP health.

## Replication command

The admin URL must come from a protected operator environment and is omitted
from this artifact.

```bash
export DATABASE_RESTORE_ADMIN_URL='FROM_SECRET_MANAGER'
export RESTORE_DATABASE_NAME='foodsystems_restore_YYYYMMDD_unique'
export RESTORE_DRILL_ACK='I_HAVE_VERIFIED_THIS_TARGET_IS_DISPOSABLE'
export RESTORE_EXPECTED_DOCUMENT_COUNT='1539'
export RESTORE_EXPECTED_SOURCE_CITATION_COUNT='2703'
export RESTORE_EXPECTED_FIELD_CITATION_COUNT='244521'
export RESTORE_EXPECTED_REPORT_COUNT='139'
export RESTORE_EXPECTED_THESIS_COUNT='79'
export RESTORE_EXPECTED_SOURCE_DOC_COUNT='199'
export RESTORE_EXPECTED_LIBRARY_ANALYSIS_COUNT='1572'
export RESTORE_EXPECTED_EVIDENCE_APPRAISAL_COUNT='0'
export BACKUP_REQUIRED_TABLES='Document SourceCitation FieldCitation Report Thesis SourceDoc LibraryAnalysisRecord EvidenceAppraisal _prisma_migrations'

scripts/restore-database-backup-drill.sh \
  '/absolute/off-repo/path/to/foodsystems-TIMESTAMP.dump'
```
