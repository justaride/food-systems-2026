# Bibliographic content, file and hash reconciliation queue — 2026-07-20

## Purpose and proof boundary

The guarded identity and scalar-mirror batches deliberately do not rewrite
canonical Markdown, imported full text, PDFs or analysis hashes. This queue
records the remaining content/file work so that a correct title or locator in
`Report`, `Thesis`, `SourceDoc`, `Document` or `SourceCitation` is not mistaken
for byte-level source parity.

This file is a review queue, not an apply manifest. Every database item below
still requires an exact before/after contract, full dependency inventory,
writer-blocking locks, full-row compare-and-swap and post-apply idempotence.
File changes must be byte-hashed before and after and must not silently rewrite
historical receipts, logs or snapshots.

## Completed in this hardening pass

| Target | Verified disposition |
|---|---|
| Finnish Food Market Ombudsman 2023 generated projection | Correct 2023 PDF bytes were pinned; the stale Document, two Document citations and direct LAR were repaired through an exact guarded transaction. See `reviewed-etmv-2023-identity-repair-receipt-2026-07-20.md`. |
| `SourceDoc:src-16` canonical content | One reviewed Riksrevisjonen URL line was added; exact file bytes, linked Document content and LAR hash are all-after. See `reviewed-source-doc-content-hash-reconciliation-receipt-2026-07-20.md`. |
| `SourceDoc:src-24` canonical content | One reviewed Finlex URL line was added; exact file bytes, linked Document content and LAR hash are all-after. See `reviewed-source-doc-content-hash-reconciliation-receipt-2026-07-20.md`. |
| `Thesis:sandanger-2012` canonical summary | The one stale Handle URL line, linked Document content and direct LAR hash are all-after. The separate entity-type review remains open. See `reviewed-sandanger-content-hash-reconciliation-receipt-2026-07-20.md`. |
| Five reviewed Thesis content projections | Exact bibliography-only projections for SLU, NMBU, Van Straten, Bueso-Bordils and the narrow Håndlykken title line are all-after across three repository files, five Documents and five direct LAR hashes. Findings and all five missing-PDF guards remain protected. See `reviewed-thesis-content-hash-reconciliation-receipt-2026-07-20.md`. |

## Open queue

| Priority | Target | Verified current state | Required bounded action |
|---|---|---|---|
| P1 | Finnish Food Market Ombudsman 2024 file coverage | The reviewed 739,748-byte PDF exists only in the canonical checkout raw archive at `research/arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Ruokavirasto - etmv toimintakertomus 2024 (2024).pdf`, SHA-256 `136b85c19ed2d652dcafd854c29898b97635dfe9ff2a0f734a6f7345cef4b761`. The live Document already names the intended active path `research/evidence-pack/nordisk/etmv-toimintakertomus-2024.pdf`, but the file is absent. Generated maps still point to the raw archive, and one manual plan names a third stale path. PDFs are ignored, not Git LFS-managed, not copied into the Docker image, and the fetcher skips the target because it sees the archive byte hash as a duplicate. | Establish a durable local/shared asset-bootstrap or mount policy first. Then materialize the exact bytes at the sole active evidence-pack path, normalize Report and `src-143` mappings, reconcile the two exact URL citations' `localPath`/`fileHash` through a guarded contract, and regenerate file-coverage artifacts. Do not create a worktree-only copy and call the gap closed. |
| P1 | `Thesis:slu-house-crickets-2025` source bytes | Bibliography-only source-note, Document content and LAR hash are reconciled, but the guarded path `research/evidence-pack/akademia/slu-house-crickets-2025.pdf` remains absent. | Acquire and hash authoritative bytes through the shared evidence-asset policy; do not infer source-file coverage from the locator note. |
| P1 | `Thesis:nmbu-circular-vegetables-2022` source bytes and access | Bibliography-only source-note, Document content and LAR hash are reconciled, but `research/evidence-pack/akademia/nmbu-circular-vegetables-2022.pdf` remains absent and the corrected Handle still needs independent access reverification. | Reverify the Handle separately, then acquire/hash authoritative bytes through the shared evidence-asset policy. |
| P1 | `Thesis:van-straten-2025` source file | Generated bibliography content and LAR hash are corrected, but `Document:cmppajyr60004njvmkuyujbnd` still points to missing `research/evidence-pack/akademia/van-straten-2025.pdf`. | Acquire and hash the authoritative bytes and verify licensing/repository policy. Do not mark local-file coverage from the stored URL alone. |
| P1 | `Thesis:bueso-bordils-2021` source file | Generated bibliography content and LAR hash are corrected, but `Document:cmppajyrr0008njvm72f0l3n2` still points to missing `research/evidence-pack/akademia/bueso-bordils-2021.pdf`. | Acquire and hash the authoritative bytes and verify licensing/repository policy. |
| P2 | `Thesis:handlykken-2023` broader source review | The exact full-title line, Document content and LAR hash are reconciled. The remaining summary prose still contains ASCII transliterations and an unproven `availabilityStatus: fulltext`; the guarded PDF path is absent. | Review exact Norwegian claim wording and availability against authoritative source bytes before changing prose or coverage. Typography cleanup must not silently alter claims. |

## Projection and release rule

After an applied content batch, regenerate only live projections such as the
library-analysis ledger, repair backlog and decision queue. Historical backup
rows, receipts, download logs, old link-rot snapshots and before-state
manifests remain immutable evidence of their generation time.

None of these items upgrades academic appraisal, claim anchoring or external
citation eligibility. Missing source bytes, unresolved entity type, and
unreviewed generated claims remain release blockers even when scalar metadata
is synchronized.
