# Forsyningskjede local primary snapshot

Dato: 2026-04-29

Formål: dokumentere hvilke Gate 1-felt som allerede kan spores til lokale API-/statistikk-snapshots, uten å markere dem som fullstendig primærvalidert.

## Sjømatimport SE/DK/FI

| Land | Felt i `value-chain.json` | Lokal kilde | Beregnet 2024-sum | Status |
| --- | --- | --- | ---: | --- |
| SE | `seafood.trade.import_value_bn_sek = 61.8` | `research/data/nordic/trade-groups/normalized/se-trade-group-fish-seafood.csv` | 61.756 mrd SEK | Importfelt matcher lokal SCB-basert normalized snapshot |
| DK | `seafood.trade.import_value_bn_dkk = 23` | `research/data/nordic/trade-groups/normalized/dk-trade-group-fish-seafood.csv` | 22.710 mrd DKK | Importfelt matcher lokal StatBank-basert normalized snapshot |
| FI | `seafood.trade.import_value_m_eur = 560` | `research/data/nordic/trade-groups/normalized/fi-trade-group-fish-seafood.csv` | 559.918 mill EUR | Importfelt matcher lokal Luke-basert normalized snapshot |

## Metode

Summering er gjort over `flow=imports`, `group_code=fish_seafood`, månedlige rader i 2024.

Manifest-kilder:

- SE: `SCB imports and exports CN monthly`, table `ImpExpKNTotMan`.
- DK: `StatBank imports and exports SITC`, table `SITC2R4`.
- FI: `Luke agri-food foreign trade`, table `Luke_maa_Ukaup_kk.px`.

## Gjenstående primærsjekk

- Eksportverdier for SE/DK/FI seafood er ikke løftet av denne kontrollen.
- Aktørlister er ikke primærvalidert.
- Klassifikasjon og sammenlignbarhet må fortsatt vurderes før cross-country nivåer brukes som beslutningsdata.
- Danmark må fortsatt sjekkes for behandling av Grønland/Færøyene/re-eksport i seafood hub-påstanden.
