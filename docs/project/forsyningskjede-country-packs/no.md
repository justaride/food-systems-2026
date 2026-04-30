# Forsyningskjede country pack: Norge

Opprettet: 2026-04-29  
Status: referansemodell, men ikke ferdig validert for ekstern bruk.

## 1. Kilder og status

| Datalag | Status | Kommentar |
| --- | --- | --- |
| `value-chain.json` | 8/8 ledd | Sterkest strukturell dekning i Norden-pakken |
| `DeliveryVolume` | Operativ | 60 275 rader, 30 475 produsent-orgnr |
| `BusinessRelationship` | Operativ | 106 `NO -> NO` relasjoner |
| `trade-groups` | Klar med forbehold | Aktivt annual-panel `trade-group-imports-annual.csv` har NO; månedspanel mangler NO med vilje i v1 |
| `core-series` | Klar med forbehold | Pris, handel og produksjon finnes |
| Geo-assets | Delvis | NO-spesifikke geo-filer finnes; globalfiler mangler landfelt |
| Circularity | Delvis | Mange NO-case og gap, men case/volum må skilles |
| Nutrient flows | Delvis | Estimert modell, ikke primærvalidert |
| Feed | Delvis | Norsk laksefôr-spesifikk tidsserie |

## 2. Verdikjedeledd

Dekning: 8/8.

Mangler:

- Volumfelt mangler på `processing`, `distribution`, `retail`, `horeca`, `household`, `waste`.
- Wastefelt mangler på `distribution`.

Neste handling:

- Ikke bygg mer Norge-UI før landpariteten er bedre.
- Bruk Norge til å definere skjema og datakvalitetskrav.

## 3. Primærproduksjon

Status: observed/normalized.

Eksisterende DB-dekning:

- 60 275 leveranser.
- 30 475 unike produsent-orgnr.
- Leverandører og avtakere er `NO`.
- Varegrupper: melk, egg, korn, slakt og ull.
- Core-series produksjon: havreproduksjon 243,7 tusen tonn i 2025, sammenlignbar med SE/FI, men ikke komplett produksjonskurv.

Neste handling:

- Behold som Norge-only observerte primærleveranser.
- Ikke bruk disse som skjult proxy for Sverige/Danmark/Finland/Island.
- Bruk havre bare som smalt produksjonssubpanel til DK/IS har bedre proxy.

## 4. Sjømat og fôr

Status: extracted, needs primary check.

Eksisterende grunnlag:

- `feed-composition-timeseries.json` dekker norsk laksefôr 2010-2025.
- Aktører og råvareopprinnelse finnes delvis.

Neste handling:

- Skille norsk laksefôr som eget modulspor.
- Definere om de andre landene trenger parallell sjømat/fôr-modul eller bredere innsatsvaremodul.

## 5. Foredling

Status: delvis.

Eksisterende grunnlag:

- Norske selskaper og relasjoner i DB.
- `processing_plants.geojson` har mange norske anlegg, men globalfilen mangler landfelt.

Neste handling:

- Normaliser foredlingsanlegg med `country`, `source_ref`, `confidence`, `last_verified`.

## 6. Distribusjon og logistikk

Status: delvis.

Eksisterende grunnlag:

- NO-spesifikke logistikk-, havn- og anleggsfiler finnes.
- `/kart/no/flow` har 15 illustrative flowkanter.

Neste handling:

- Hold `flows.json` merket som illustrative.
- Ikke løft til beslutningsgraf før tonn/verdi/varegruppe er observert eller eksplisitt estimert.

## 7. Dagligvare og foodservice

Status: sterkere enn øvrige land, men ikke komplett.

Neste handling:

- Sikre foodservice/grossist-dekning som kan sammenlignes med DK/SE/FI/IS.

## 8. Import/eksport og sårbarhet

Status: annual-panel avklart; monthly-gap dokumentert.

Eksisterende:

- Aktiv app-/forsyningskjede-kilde er `research/data/nordic/trade-groups/normalized/trade-group-imports-annual.csv`.
- Annual-panelet har 66 NO-rader og samme seks varegrupper som de andre landene.
- NO finnes ikke i `trade-group-imports-monthly.csv`; `README.md` beskriver dette som en v1-avgrensning.
- `trade_groups_imports_annual_panel.csv` og `trade_groups_imports_monthly_panel.csv` er alternative/legacy paneler med svakere NO/IS-dekning og skal ikke brukes som styrende dekningsstatus for `/forsyningskjede`.
- Første import-sårbarhetskort er skrevet i `research/review/forsyningskjede-import-vulnerability-cards-2026-04-29.csv`.
- 2024-kort: største gruppe er fett/oljer (43,2 %), deretter frukt/grønt (31,0 %); største 2022-2024-endring er fisk/sjømat (+43,3 %).

Neste handling:

- Primærsjekk om NO fett/oljer-dominans skyldes varekodeklassifikasjon eller reell importeksponering.
- Behold monthly-gap som metodeforbehold; ikke presenter månedlig NO-sammenligning før egen SSB-månedspanel er laget.

## 9. Matsvinn, sidestrømmer og retur

Status: extracted.

Neste handling:

- Lage 3-5 validerte NO-casekort.
- Skille `case`, `observed_volume`, `estimated_volume` og `policy_target`.

## 10. Regulatorisk/styringsmessig ramme

Status: finnes spredt.

Neste handling:

- Koble matberedskap, konkurranse/UTP, matsvinn, sirkularitet og fôr/sjømat til claim cards.

## 11. Nøkkelaktører og relasjoner

Status: sterkest i DB.

Kjent baseline:

- 55 402 Company-rader.
- 140 CountryMetric-rader.
- 46 relasjonsnoder.
- 106 `NO -> NO` relasjoner.

Neste handling:

- Bruk relasjonsfelt og reviewkrav som modell for andre land.

## 12. Datagap og review-kø

Prioritert kø:

1. Bruk annual importpanel i sårbarhetskort; monthly NO forblir metodegap.
2. Normaliser geo-nodefelt.
3. Lag norske claim cards etter samme skjema som de andre landene.
4. Hold Norge igjen som UI-prioritet til paritetsgap for de andre landene er lukket.
