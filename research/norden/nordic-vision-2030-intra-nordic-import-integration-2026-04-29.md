# Nordic Vision 2030: intra-nordisk matimport integrasjon

**Dato:** 2026-04-29  
**Status:** All-country runtime-integrert datapakke  
**Vision-indikator:** `2.5.2` Imports from Nordic countries  
**Runtime target:** `CountryMetric.intraNordicImportShare`

## Hva er gjort

Det er laget et partnerbasert all-country panel for intra-nordisk importandel i valgte matvaregrupper.

Nye/oppdaterte filer:

- `scripts/fetch-intra-nordic-food-imports.ts`
- `research/data/nordic/trade-groups/raw-json/dk-food-group-imports-by-partner-monthly.json`
- `research/data/nordic/trade-groups/raw-json/fi-food-group-imports-by-partner-monthly.json`
- `research/data/nordic/trade-groups/raw-json/no-food-group-imports-by-partner-annual.json`
- `research/data/nordic/trade-groups/raw-json/se-food-group-imports-by-partner-annual.json`
- `research/data/nordic/trade-groups/normalized/intra-nordic-food-import-share-annual.csv`
- `research/data/nordic/trade-groups/normalized/intra-nordic-food-import-share-annual.meta.json`
- `research/data/nordic/trade-groups/normalized/partial-intra-nordic-food-import-share-annual.csv`
- `research/data/nordic/trade-groups/normalized/partial-intra-nordic-food-import-share-annual.meta.json`
- `research/norden/nordic-vision-2030-intra-nordic-import-queue-2026-04-29.csv`

`partial-*`-filen er beholdt som kompatibilitetsnavn for eksisterende referanser. Det kanoniske panelet videre er `intra-nordic-food-import-share-annual.csv`.

## Runtime-seedede indikatorer

`CountryMetric.intraNordicImportShare` har fått ti rader: core og extended share for DK, FI, IS, NO og SE.

| Land | År | Core nordisk andel | Extended nordisk andel | Kilde |
|---|---:|---:|---:|---|
| DK | 2025 | 18.2425% | 26.6599% | StatBank SITC2R4 partner refetch |
| FI | 2024 | 27.0475% | 27.0781% | Luke agri-food foreign trade partner refetch |
| IS | 2025 | 15.5305% | 17.3504% | Statistics Iceland UTA06201 partner extract |
| NO | 2025 | 14.2020% | 16.1070% | SSB 08801 partner refetch |
| SE | 2025 | 56.8052% | 56.8114% | SCB ImpTotalKNAr partner refetch |

Core-partnere betyr nordiske naboland uten autonome områder:

- DK: FI, IS, NO, SE
- FI: DK, IS, NO, SE
- IS: DK, FI, NO, SE
- NO: DK, FI, IS, SE
- SE: DK, FI, IS, NO

Extended-partnere inkluderer også Færøyene, Grønland og/eller Åland der kilden har dem.

## Kilde-/endpoint-notat

- DK: StatBank `SITC2R4`, SITC matgrupper med `LAND=W1` total og nordiske partnere.
- FI: Luke `Luke_maa_Ukaup_kk.px`, oppdatert til gjeldende `maa/zzz_lak`-path.
- IS: Statistics Iceland `UTA06201.px`, fra eksisterende partnerdimensjon i lokalt raw-uttrekk.
- NO: SSB `08801`, partnerverdier refetchet fra samme varekodelister som eksisterende all-country importpanel; totalverdier gjenbrukt fra etablert SSB 08801-uttrekk.
- SE: SCB `ImpTotalKNAr`, CN to-siffer matgrupper, partnerland og eksplisitt `TOT` trading-partner total.

## Viktige avgrensninger

- Kildene bruker ulike vareklassifikasjoner og valuta/enheter. Bruk andeler innen land, ikke nivåer på tvers av land.
- DK har 2026-rader i råuttaket, men 2025 brukes som siste fullår i runtime-seeden.
- FI-panelet stopper på 2024 i Luke-kilden som ble hentet i denne runden.
- IS extended inkluderer Åland (`AX`) fordi den lokale Statistics Iceland-kilden har den partnerkoden; DK/FI/NO/SE-utvidet bruker Færøyene og Grønland når kilden har dem.

## Gjenstående arbeid

1. Vurder om filnavnet `partial-intra-nordic-*` skal fases ut etter at alle interne referanser er flyttet til `intra-nordic-food-import-share-annual.csv`.
2. Legg eventuelt gruppevise `CountryMetric`-rader for kjøtt, meieri/egg, sjømat, korn, frukt/grønt og fett/oljer hvis UI trenger mer enn valgt matkurv.
3. Harmoniser metodebeskrivelsen i en offentlig indikatornote før ekstern bruk.
