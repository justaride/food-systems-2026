# CAR Coverage Map

Date: 2026-06-24
Status: CAR-012 final QC/export artifact

## Verified Export Counts

Total verified rows in `CAR-registry-verified.csv`: 31

### By Category

| Category | Rows |
|---|---|
| FoU/nettverk | 5 |
| alternativt protein | 1 |
| biogass/digestat | 7 |
| finansiering/støtte | 1 |
| insekter | 3 |
| kompost/jord | 1 |
| matsvinn/prevention | 2 |
| redistribusjon | 1 |
| regenerativ/lokal praksis | 3 |
| sidestrøm/upcycling | 4 |
| tang/tare | 3 |

### By Country

| Country | Rows |
|---|---|
| NO | 31 |

### Norwegian Verified Rows By County

| County | Rows |
|---|---|
| Agder | 1 |
| Akershus | 5 |
| Buskerud | 1 |
| Innlandet | 3 |
| More og Romsdal | 2 |
| Møre og Romsdal | 1 |
| Oslo | 4 |
| Ostfold | 2 |
| Rogaland | 1 |
| Troms | 1 |
| Trondelag | 3 |
| Vestfold | 2 |
| Vestland | 5 |

## Candidate And Context Coverage

All parsed candidate/delta rows across CAR seeds and batches: 162

### All Rows By Category

| Category | Rows |
|---|---|
| CEA/vertical farming | 4 |
| FoU/nettverk | 16 |
| alternativt protein | 3 |
| biogass/digestat | 16 |
| finansiering/støtte | 9 |
| insekter | 12 |
| kompost/jord | 5 |
| konkurs/failure case | 9 |
| matsvinn/prevention | 12 |
| mykoprotein/fermentering | 7 |
| redistribusjon | 2 |
| regenerativ/lokal praksis | 20 |
| sidestrøm/upcycling | 19 |
| sirkulært fôr | 5 |
| tang/tare | 23 |

## Dedupe Notes

Actor IDs seen in multiple source files were treated as update/dedupe candidates, not separate actors. Important cases:

- `car-no-pronofa-asa` supersedes the older Pronofa seed where current primary source supports Ciona/Purply and historical insect assets are separated.
- `car-no-biomega-group-as` is the export row; `car-no-biomega-norway-as` stays an entity/site mapping candidate.
- `car-no-greve-biogass-as`, `car-no-lindum-as` and `car-no-den-magiske-fabrikken-as` replace the combined Greve/Lindum seed logic.
- CAR-008 practice rows stay candidate/context because maps and directories are not verified active producer registers.
- CAR-011 Nordic/global failure rows stay context unless a direct legal/source basis is strong enough for a future verified context export.

## Open Coverage Gaps

- Small-scale/regenerative producer coverage is not complete.
- Food-waste prevention still lacks municipal/HORECA participant-level rows.
- Biogas/nutrient-return rows need current owner/operator and realized annual volume checks for several facilities.
- Founders/key people remain intentionally partial.
- Nordic/global context is illustrative only and not Norwegian coverage.
