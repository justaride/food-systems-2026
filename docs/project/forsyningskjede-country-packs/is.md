# Forsyningskjede country pack: Island

Opprettet: 2026-04-29  
Status: høyeste prioritet fordi relasjoner, sirkularitet og nutrient-flow fortsatt er klart svakest. Produksjonsproxyer har nå primærsnapshot for sjømat og landbruk, mens `value-chain.json` fortsatt har flere `local_research_needs_primary_check`-ledd.

## 1. Kilder og status

| Datalag | Status | Kommentar |
| --- | --- | --- |
| `value-chain.json` | 8/8 ledd | Fire ledd er backfilled fra lokal research og trenger primærsjekk |
| `DeliveryVolume` | Proxy-kilder funnet | Ingen islandsk ekvivalent i DB; seafood-first produksjonsproxy må metodegodkjennes |
| `BusinessRelationship` | Svært tynn | 1 `IS -> IS` |
| `trade-groups` | Klar med forbehold | 60 annual, 665 monthly rows |
| `core-series` | Klar med forbehold | Pris, handel og produksjon finnes |
| `analysis-panel` | Klar | 414 harmoniserte rader |
| Geo-assets | Staging | Stores/municipalities finnes; infrastruktur må landmerkes |
| Circularity | Mangler | Ingen IS-spesifikk loop funnet i current file |
| Nutrient flows | Mangler | IS ikke i nutrient `countries` |

## 2. Verdikjedeledd

Dekning: 8/8 etter lokal backfill.

Backfilled 2026-04-29:

- `processing`
- `distribution`
- `horeca`
- `household`

Også mangelfullt:

- Volum- og wastefelt mangler på de fleste ledd.
- De fire backfilled leddene må primærsjekkes før de brukes som validert data.

Neste handling:

- Primærsjekk kildene bak de fire backfilled leddene.
- Fyll volum/waste der offentlig datagrunnlag finnes.

## 3. Primærproduksjon

Status: mangler DB-ekvivalent.

Core-series produksjon:

- Nåværende produksjonsserie er biffproduksjon, 4 674 tonn i 2025.
- Dette er en smal volum-fallback og fanger ikke Islands dominerende sjømatproduksjon.
- Proxy-kandidater er lagt i `research/review/forsyningskjede-production-proxy-candidates-2026-04-29.csv`: villfangst, akvakultur, foredlingsgrad, melk, kjøtt, drivhus-/grønnsaksproxy, poteter, korn og havre.
- Primærsnapshot bekrefter sjømat 2024: ca. 994 000 tonn villfangst og ca. 54 800 tonn akvakultur fra Statistics Iceland.
- Primærsnapshot bekrefter landbruk 2024: melk 158 139 tonn, kjøtt totalt 30 643 tonn, poteter 5 514 tonn, tomat/agurk/paprika/salat 4 232 tonn, korn 5 939 tonn og havre 140 tonn.

Neste handling:

- Vurdere om primærproduksjon må deles tydelig mellom landbruk og sjømat.
- Bygg seafood-first proxy-metode rundt bekreftet villfangst og akvakultur, med landbruksdelen som separat supplement.
- Hold islandsk havre som kontekst, ikke som reell paritet med NO/SE/FI havre.

## 4. Sjømat og fôr

Status: delvis i value-chain, men ikke godt nok koblet.

Neste handling:

- Bygg seafood/fisheries som kjerneledd for Island.
- Finn kilder for fiskeri, sjømatforedling, eksport og eventuelle innsatsvarer.

## 5. Foredling

Status: strukturelt lagt inn, trenger primærsjekk.

Kandidater:

- Icelandic seafood processors
- MS Iceland Dairies
- Kaupfélag Skagfirðinga

Neste handling:

- Primærsjekk `processing`-ledd og legg 5-10 foredlingsaktører i review.

## 6. Distribusjon og logistikk

Status: strukturelt lagt inn, trenger primærsjekk.

Kandidater:

- Hagar supply/distribution
- Festi supply/distribution
- Havner og cold-chain nodes

Neste handling:

- Primærsjekk `distribution`-ledd.
- Etabler 3-5 infrastruktur-/logistikknoder med kilde.

## 7. Dagligvare og foodservice

Status: `retail` finnes; `horeca` og `household` er strukturelt backfilled, men må primærsjekkes.

Kandidater:

- Hagar
- Festi
- Samkaup
- HORECA/turisme-relatert matdistribusjon

Neste handling:

- Primærsjekk `horeca` og `household`.
- Bygg relasjonskandidater rundt retail, grossist og seafood.

## 8. Import/eksport og sårbarhet

Status: klar med forbehold.

Eksisterende:

- 60 annual import rows.
- 665 monthly import rows.
- 266 trade rows i core-series.
- Første import-sårbarhetskort er skrevet i `research/review/forsyningskjede-import-vulnerability-cards-2026-04-29.csv`.
- 2024-kort: største gruppe er frukt/grønt (32,3 %), deretter korn (24,1 %); største 2022-2024-endring er fett/oljer (+98,0 %).

Neste handling:

- Primærsjekk enhet/klassifikasjon før ekstern bruk.
- Vise tydelig at Island har annerledes sjømat-/importprofil enn de andre landene.

## 9. Matsvinn, sidestrømmer og retur

Status: gap.

Neste handling:

- Finne minst 3 IS-spesifikke case/loops.
- Avklare nutrient-flow eller eksplisitt avvik for Island.

## 10. Regulatorisk/styringsmessig ramme

Prioriter:

- Statistics Iceland
- Matvælastofnun
- Samkeppniseftirlitið
- Fiskeri-/sjømatforvaltning
- Matavfall/sirkularitet der kilder finnes

## 11. Nøkkelaktører og relasjoner

Kjent baseline:

- 8 Company-rader.
- 22 CountryMetric-rader.
- 2 relasjonsnoder.
- 1 islandsk relasjon.
- 6 nye review-kandidater seeded i `research/review/supply-chain-relationships-nordic-review-2026-04-29.csv` med `needs_primary_check` og `hold`.

Neste handling:

- Utvid fra 6 til minst 20 relasjonskandidater i review.
- Minst 10 godkjente/importerte relasjoner før islandsk graf regnes operativ.

## 12. Datagap og review-kø

Prioritert kø:

1. Primærsjekk `processing`, `distribution`, `horeca`, `household`.
2. Bygg islandsk seafood/fisheries-modul.
3. Utvid relasjonskø fra 6 til 20 kandidater.
4. Minst 3 sirkularitets-/returcase.
5. Avklar nutrient-flow eller eksplisitt avvik.
6. 8-12 claim cards.
