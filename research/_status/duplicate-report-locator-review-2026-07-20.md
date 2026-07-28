# Duplicate Report locator review — 2026-07-20

## Decision

The academic-source audit finds four canonical locator groups covering eight
Report rows. This review separates probable duplicate identities from generic
landing-page misbindings. It does not delete, merge, or retarget any row.

A shared URL is not itself proof of a duplicate, and a reviewed duplicate is
not externally usable twice. Any merge must preserve citations, field anchors,
library records, documents, and audit history through a separately guarded
identity migration.

## Reviewed groups

| Canonical locator | Rows | Disposition | Canonical direction / next action |
|---|---|---|---|
| KFST decision on Salling Group / Coop Danmark | `dk-salling-coop-decision-2025`, `kfst-salling-coop-2025` | `probable_true_duplicate` | Prefer the full legal-decision identity `dk-salling-coop-decision-2025`; run a dependency scan before proposing a merge or tombstone for the shortened duplicate. |
| Coop annual-report landing page | `coop-2024`, `coop-norge-2024` | `unresolved_generic_landing_page` | Locate the exact 2024 annual-result and annual/sustainability artifacts. Keep both blocked until the named works and their relationship are proven. |
| NHH FOOD centre landing page | `akademia-nhh-butikkstruktur-2024`, `akademia-nhh-matbors-historie` | `generic_locator_misbinding` | These are topical synthesis identities, not works identified by the centre homepage. Keep them internal/blocked and either attach exact underlying publications or remove the misleading work-locator claim. |
| NFD/Samfunnsøkonomisk Analyse EMV PDF | `emv-kartlegging-2023`, `soa-emv-2023` | `probable_true_duplicate` | Prefer the full report identity `emv-kartlegging-2023`; run a dependency scan before proposing a merge or tombstone for the topical duplicate. |

## Release state

- 2 probable true-duplicate groups / 4 rows
- 2 generic-locator or unresolved groups / 4 rows
- 0 rows mutated by this review

All eight remain outside a clean duplicate-locator readiness result until the
two true-duplicate pairs are dependency-safe and the two generic groups have
work-level identities or an explicit internal/no-public-locator disposition.
