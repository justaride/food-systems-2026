# Nordic trade groups v1

Forste operative uttrekk av importverdier for brede matvaregrupper fra identifiserte nordiske API-kilder.

## Innhold

- `raw-json/`
  Raa JSON- eller JSON-stat-svar per kilde, inkludert request-payload.
- `normalized/`
  To samlepaneler i long-format:
  `trade-group-imports-monthly.csv` og `trade-group-imports-annual.csv`.
- `manifest.csv`
  Oversikt over hvert uttrekk, status, radtall og filbaner.
- `run-summary.json`
  Kort oppsummering av dekning, grupper og bevisste avgrensninger.

## Scope i denne versjonen

Denne `v1`-pakken fokuserer paa importverdier for:

- `meat`
- `dairy_eggs`
- `fish_seafood`
- `cereals`
- `fruit_veg`
- `fats_oils`

Kilder i denne runden:

- Norge: SSB `08801` (aarlig, aggregert fra detaljkoder)
- Danmark: StatBank `SITC2R4`
- Sverige: SCB `ImpExpKNTotMan`
- Finland: Luke `Luke_maa_Ukaup_kk.px`
- Island: Statistics Iceland `UTA06201.px`

## Bevisst ikke inkludert i v1

- Eksport er ikke med i denne versjonen; panelet er importfokusert.
- Norge finnes bare i aarspanelet i denne versjonen; maanedspanel er forelopig bare `DK`, `SE`, `FI` og `IS`.

## Les dette for sammenlikning

- Nivaer er ikke direkte krysslands-sammenliknbare fordi kildene bruker ulike valutaer og noe ulike vareklassifikasjoner.
- Panelet er sterkest for utvikling over tid innen hvert land.
- Panelet er sterkt for komposisjon mellom gruppene innen hvert land.
- Aarsfilen inkluderer `share_of_selected_food_basket` for relative sammenlikninger innen hvert land.
