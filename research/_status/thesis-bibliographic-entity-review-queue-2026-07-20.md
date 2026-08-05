# Thesis bibliographic and entity review queue — 2026-07-20

## Purpose and proof boundary

Work-level access verification found 14 records where the stored Thesis
identity differed from, or was weaker than, the authoritative record. Nine
safe bibliographic corrections have since been applied with full-row CAS, and
their citation/Document mirrors have been reconciled in a separate guarded
transaction. A working locator, access date or synchronized mirror is still
not evidence that the stored findings or entity type are correct.

The evidence for each row is pinned in
`remaining-thesis-access-date-manifest-2026-07-20.json`. Applied work is
recorded in
`reviewed-thesis-bibliographic-repair-receipt-2026-07-20.md` and
`reviewed-thesis-bibliographic-mirror-reconciliation-receipt-2026-07-20.md`.
This queue records the remaining disposition only; it is not an apply
manifest and authorizes no further database mutation.

## Queue

| Thesis id | Current disposition | Verified result or issue | Required next step |
|---|---|---|---|
| `sandanger-2012` | `bibliography_applied_entity_type_review_open` | Exact author, title, Handle and publisher are applied and mirrored. NVA currently classifies the imported record as a working paper/report while the seed says master. | Inspect the full authoritative registration and original work before choosing Thesis versus Report; do not infer type from the Handle alone. |
| `halseth-phd-2024` | `entity_migration_required` | The stored locator identifies a 2023 conference/working paper, not a complete 2024 PhD dissertation. | Replace the synthetic PhD identity with the actual work identity in the correct entity set through a separately authorized dependency-aware migration. |
| `granlund-lindskog-2024` | `bibliography_and_mirrors_applied` | Exact authors and canonical Handle `11250/3156087` are applied; old-locator verification was cleared on the citation mirror. | Reverify the corrected citation locator before any external-use upgrade. |
| `tallaksen-2022` | `bibliography_and_mirrors_applied` | Exact creator, English title and Universitetet i Agder identity are applied and mirrored. | No bibliographic action; appraisal and claim anchoring remain separate. |
| `tesdal-2013` | `bibliography_and_mirror_applied` | Publication year 2012, exact creator and title are applied and mirrored. | No bibliographic action; appraisal and claim anchoring remain separate. |
| `handlykken-2023` | `bibliography_and_mirrors_applied` | Exact creator and question-form title are applied and mirrored. | Reconcile the canonical Markdown wording/diacritics only through the separate content-and-hash queue. |
| `mattila-2024` | `metadata_and_claim_conflict_review` | The authoritative record conflicts with both stored year and stored result percentages. | Full-text reviewer must resolve identity and claim content together; do not apply a metadata-only patch. |
| `naess-2024` | `locator_and_metadata_review` | The official UiB list places the work in spring 2025, while the seed gives 2024; the stored locator is a year index rather than a work permalink. | Obtain a work-level stable locator and authoritative metadata before changing either URL or year. |
| `lund-beijer-2026` | `entity_migration_required` | The located work is a 2026 *Cleaner Food Systems* article and the seed author field names institutions. | Move to the correct publication entity with exact authors through a separately authorized dependency-aware migration. |
| `rey-verge-2005` | `entity_migration_required` | The located work is a conference paper, not a thesis. | Move to the correct publication entity through a separately authorized dependency-aware migration; do not relabel the Thesis row in place. |
| `slu-house-crickets-2025` | `bibliography_and_mirrors_applied` | Exact dissertation title, Sara Capitán, DOI, ISBN and SLU publisher are applied; scalar mirrors and analysis-card title are synchronized. | Reconcile generated Document/source-note content and hashes in the separate content queue. |
| `van-straten-2025` | `bibliography_and_mirrors_applied` | Exact author and full title are applied; scalar mirrors and analysis-card title are synchronized. | Reconcile generated Document content and hashes in the separate content queue. |
| `bueso-bordils-2021` | `bibliography_and_mirrors_applied` | Exact author and title are applied; scalar mirrors and analysis-card title are synchronized. | Reconcile generated Document content and hashes in the separate content queue. |
| `nmbu-circular-vegetables-2022` | `bibliography_and_mirrors_applied` | Andrea Christine Kunz Skrede and canonical Handle `11250/3030715` are applied; old-locator verification was cleared. | Reverify the corrected citation locator and reconcile generated content/hashes separately. |

## Counts and release rule

- 9 guarded Thesis bibliographic repairs applied and idempotence-verified.
- 9 citation mirrors, 8 Document scalar mirrors and 3 changed analysis-card
  titles reconciled; the NMBU analysis title was already correct and remained
  a protected no-op.
- 8 original queue items are bibliographically closed.
- 1 item (`sandanger-2012`) has repaired bibliography but an open entity-type
  decision.
- 5 other items remain unresolved: Mattila, Næss and three entity migrations.
- 6 human or destructive decision items remain in total.

No item is externally ready merely because its bibliography and mirrors are
now synchronized. Generated content/file parity, appraisal and claim anchors
remain separate. Entity migrations additionally require dependency scans,
fresh backup/restore evidence, append-only mutation audit, and explicit
destructive authorization.
