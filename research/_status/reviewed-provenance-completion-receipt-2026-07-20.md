# Reviewed provenance completion receipt — 2026-07-20

## Result

The second reviewed provenance batch classified exactly 14 previously
unclassified `Report` rows and 25 previously `unknown` `SourceDoc` rows in the
local `foodsystems` database. The mutation changed `provenanceType` only.

- database identity UUID: `90e3e24d-230f-42f7-b178-5bcd5b861e84`
- manifest SHA-256: `de6a42f76e16615808d93888b611199d4de22afd37c9a0d0ceee9cae332a043b`
- reviewed pre-apply plan SHA-256: `820e71038f263a63b1bccc400c5797b58f8cc056aea3273cdcceca04e90353a7`
- seed identity SHA-256: `e7ef83e147f61fd30c4536cafa8ff1b48f4687f6d9289cea5c69b40f620cf4d3`
- pre/post non-provenance SHA-256: `9e89a6de5ffda9cc40f60ba3b6679219bca1a5d3a3587a713dd86becb60d3a87`
- pre/post enumerated-dependency SHA-256: `2ab1dd55b68af7bebaf17c8d1e99b0338984636e88a9957833237bcda8a76244`
- before full-state SHA-256: `0c80827e40d3866f0c0d362873ad7c74180cac605af761bc4b7bf78bb0f32ede`
- after full-state SHA-256: `fe920f0fd4af171096d7bb73b168e7ebdc01a5e648a9c075c12c6278ab6f8638`
- rows updated: 39
- post-apply dry-run: 0 pending / 39 applied / 0 conflicts

The guarded runner used an immutable reviewed manifest, exact seed and
full-row hashes, a pinned database identity, a named advisory lock, target
`FOR UPDATE` locks, enumerated dependency `FOR SHARE` locks, full-row
compare-and-swap, and a `Serializable` transaction. The enumerated dependency
surface covered bound Documents and their refs, relevant SourceCitations and
FieldCitations, LibraryAnalysisRecords, direct EvidenceAppraisals, SourceRefs,
MediaEntries, SourceDoc-to-Insight links, and Document refs from Insights,
Companies, and Actors. It did not claim a whole-schema dependency closure:
reverse Thesis/Report/SourceDoc bindings to shared Documents and all possible
primary-citation consumers were not part of this snapshot. Direct
`FieldCitation`-referenced `SourceCitation` rows were included even when they
had no Document or SourceDoc binding.

## Report dispositions

| Provenance | Report IDs | Review basis |
|---|---|---|
| `external_report` | `akademia-sifo-kundeprogram-2026`, `coop-2024`, `dk-salling-coop-decision-2025`, `emv-kartlegging-2023` | Exact full works were identified and visually checked: SIFO Report 1-2026, Coop annual and sustainability report 2024, the KFST decision of 26 March 2025, and Samfunnsøkonomisk Analyse Report 15-2023. |
| `internal_synthesis` | `akademia-nhh-butikkstruktur-2024`, `akademia-nhh-matbors-historie`, `akademia-sifo-retail-media-2025`, `fivh-etikk-2025` | The stored records are repo-authored syntheses; no one exact external publication supports the complete stored identity and claim set. |
| `composite_source` | `nbs-systemkritikk` | The row combines NBS, Ruralis, and event material rather than one independently identifiable work. |
| `blocked_source` | `akademia-nhh-foros-media-2025`, `akademia-uib-kjopermakt`, `coop-norge-2024`, `kfst-salling-coop-2025`, `soa-emv-2023` | The first two lack an exact supporting work; the last three are duplicate aliases whose full-text/citation bindings require a separate controlled transfer. |

The local PDF bound to `akademia-nhh-foros-media-2025` was rendered and
visually inspected. It is Øystein Foros' curriculum vitae, not the named
paper; SHA-256
`f550d57cebb16907e06659c9bab617ca3d14b0ca80fce2a7ebab03a6a463a4f5`.

## SourceDoc dispositions

| Provenance | SourceDoc IDs | Review basis |
|---|---|---|
| `internal_primary` | `src-7`, `src-107`, `src-108` | Original internal strategy/project records. |
| `internal_synthesis` | `src-34`, `src-51`, `src-52`, `src-136` | Internally assembled analyses rather than independent external works. |
| `official_primary` | `src-79`, `src-81`, `src-98`, `src-99` | Official competition, statistics, or public-project records. |
| `commissioned_report` | `src-21`, `src-91`, `src-147`, `src-150`, `src-170`, `src-182` | Reports produced under an identifiable public or institutional commissioning relationship. |
| `external_publication` | `src-20`, `src-23`, `src-86`, `src-90` | Working paper, institutional research report, institutional article, or dissertation published outside the project. |
| `advocacy_position` | `src-82`, `src-83`, `src-158`, `src-163` | Trade-association or mission-driven organization material, classified conservatively because the publisher has an interested position. |

`src-77` and `src-87` remain `unknown`. The CRESSE PDF proves a 2023 working
paper by Emil Mathias Strøm Halseth; it does not prove the claimed 2024 PhD
identity. Resolving either row requires an identity-and-dependency repair, not
another provenance-only update.

## SourceCitation reconciliation

The SourceDoc classifications were then propagated conservatively to every
directly or `FieldCitation`-linked `SourceCitation`. The reviewed registry is
the exact, overlap-free union of 44 legacy seed rows, 111 rows from the first
reviewed batch, 25 rows from this completion batch, and 17 managed runtime
transcripts: 197/197 reviewed SourceDocs in total.

- reviewed pre-apply plan SHA-256: `0e91cf7b0fcee2ea6ee7c967bfd388c450aab6610a4ac815d0c69aa125ac0513`
- rows updated: 213
- mutation surface: `sourceClass` only
- readiness changes: 0
- class transitions: 41 `internal_primary`, 68 `internal_synthesis`, 70
  `primary`, and 34 `secondary`
- post-apply dry-run plan SHA-256: `a62224c59753a898c16d3cde5d1e0cccc346d94970d3d22a0c8d39eeeab1a840`
- post-apply dry-run: 0 pending / 268 unchanged / 0 conflicts

The apply used the reviewed plan hash, a named advisory lock, `FOR SHARE`
locks on SourceDocs and linked FieldCitations, `FOR UPDATE` locks on the exact
SourceCitations, full-row compare-and-swap, and one `Serializable` transaction.
All 213 citations remained `blocked_unsourced`; provenance did not grant or
raise external citation readiness. The two unknown SourceDocs remain
fail-closed.

## Independent review disposition

An adversarial read-only review found no incorrect mapping among the 14
Reports or 25 SourceDocs and no severe issue. Its two high system findings
were handled separately:

1. The incomplete SourceCitation registry was replaced by the exact 197-row
   registry and reconciled as documented above.
2. Report query/filter evaluation now applies provenance ceilings before
   stored Document citations or fallbacks. `blocked_source` and explicit
   unknown Report provenance resolve to `blocked_unsourced`; internal and
   composite Reports resolve to `internal_context`. Focused tests pass 9/9,
   and a live local `getReports()` check confirms `nbs-systemkritikk`,
   `soa-emv-2023`, `akademia-nhh-foros-media-2025`, and `fivh-etikk-2025` are
   all externally excluded.

Two lower proof gaps remain explicit: the 39-row manifest still needs a
structured companion evidence contract beyond narrative review text, and the
guarded runner still lacks a disposable-PostgreSQL race/rollback integration
suite. These do not change the applied classification result, and they must
not be described as completed proof.

## Regenerated audit

After apply, `npm run audit:academic-source-quality` reported:

- Report provenance: 139/139 explicit
- live SourceDoc provenance: 197/199 explicit
- external Report locator syntax: 107/107
- external SourceDoc locator syntax: 98/102
- reviewed access date: Reports 92/107; SourceDocs 75/102
- complete current evidence appraisals: 0/417
- externally eligible records: 0/417

The wider academic/external gate therefore remains **NOT READY**. The higher
provenance counts improve evidence-role clarity only; they do not validate
stored findings, repair identities or locators, add claim anchors, or grant
external citation eligibility.

## Remaining controlled work

1. Apply the separately reviewed exact SourceDoc identity/locator repairs and
   reconcile the affected locator citations and Document mirrors atomically.
2. Apply the safe Thesis bibliographic batch, while keeping Mattila, Næss, and
   the three Thesis-to-Report migrations in separate scopes.
3. Quarantine the three Report alias pairs without deleting their records.
4. Complete named human appraisal and claim-level citation review.
5. Keep the Matsvinn identity mutation, registered MCP wrapper, integration,
   deployment, and production proof as separate authorization/proof layers.
