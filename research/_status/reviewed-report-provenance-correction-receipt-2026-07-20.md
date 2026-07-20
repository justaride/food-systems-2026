# Reviewed Report provenance correction receipt — 2026-07-20

## Result

Seven evidence-reviewed Report provenance corrections were applied to the
local `foodsystems` database in one `Serializable` transaction. The runner
accepted only the exact all-before state and changed only `provenanceType`.

- database identity UUID: `90e3e24d-230f-42f7-b178-5bcd5b861e84`
- manifest SHA-256: `50439ce9a76fbcbd842abd7a8d101c509ad5eb1fc9a20b8ac12075b8f7326d8d`
- reviewed pre-apply plan SHA-256: `bfe46c670164ea2c6a3cb36a4e8892e3a4ca36453b996310bf4de4ba008c5789`
- seed identity SHA-256: `324abb58a40ed4441313aa2d3ee4e63e6693dc1ee5156fb35d7802ce3afd98f5`
- database non-provenance SHA-256, unchanged: `b6141940d88623c5fede860b6c8139e3eafb84a6459dee127cc30a385aa2cc89`
- pre-apply full-state SHA-256: `aa7ca993fdacee23b24996b47a3404e9993348b4a615299d1b7e15712fc129d2`
- post-apply full-state SHA-256: `5e46d118b6c6dae9d5f33efa96eb787b1c547b7f91f2d31c8943f1764521e4fb`
- pre/post dependency SHA-256: `857f5727630672f1e1a5c7a7e1dc79aa03181cd9a4a1a811dece578b71ea9546`
- rows updated: 7
- post-apply dry-run plan SHA-256: `eddb6e17e83533a5c32ac83d2ba58cf8471eeca9762643082cb75cb869bc8e90`
- post-apply dry-run: 0 pending / 7 applied / 0 conflicts

The enumerated dependency snapshot contained one database identity row, 7
Documents, 0 DocumentRefs, 18 SourceCitations, 18 FieldCitations, 7
LibraryAnalysisRecords, and 0 EvidenceAppraisals. Those rows were preserved;
the dependency hash was identical before and after the mutation. No transitive
or reverse consumer beyond that enumerated scope is claimed by this receipt.

## Applied classifications

| Report | Before | After |
|---|---|---|
| `beredskap-finsk-modell-hvk` | `external_report` | `composite_source` |
| `is-markedsstruktur-2024` | `external_report` | `composite_source` |
| `kbh-food-strategy-madhus` | `external_report` | `composite_source` |
| `kt-markedsundersokelser-2026` | `external_report` | `external_article` |
| `plantefonden-projects-2023-2025` | `external_report` | `composite_source` |
| `reitan-2024-25` | `external_report` | `blocked_source` |
| `sodertaelje-diet-green-planet` | `external_report` | `composite_source` |

These are evidence-role corrections only. They do not validate stored
findings, create appraisals or claim anchors, or grant external-use
eligibility. The failed CLI invocation with an extra `--` and the refused
stale-plan invocation both stopped before mutation; only the exact reviewed
plan above committed rows.
