# Fase 5B – KILDEREGISTER / metrics-forslag (konkurranse- og verdikjede)

Målet er å utvide `chart-metrics` med konkurranseindikatorer som allerede er forankret i de relevante `tilsyn`/`nordisk`-kildene, men **uten å legge inn råtekst/metadata** i denne fasen. Fokus er tall for sammenligning over tid og på tvers av land i chart-visningene.

## Forslag: ny struktur i `chart-metrics`

Legg forslagene inn under disse toppnivåene per land i `public/data/food-systems/{land}/chart-metrics.json`.

1. `marketStructure`
- `chainShares` (objektliste): kjededeling etter nasjonalt kjernemarked (butikk/forbruker).
- `chainSharesParent` (objektliste): morselskap-delinger der det er relevant for markedsmakt.
- `cr3`, `cr4`, `cr5` (nummer 0–100): konkurransesituasjon i hovedmarkedet.
- `hhi` (nummer): bevarbar konkurranseindikator ved siden av dagens `parentHHI`.
- `top5ConcentrationNarrative` (objekt med `hasEvidence` + `sourceYear`): kort flagg for hvorvidt top-5-forklaringen er robust i kilden.

2. `valueChain`
- `upstreamMarginIndex` (nummer/område): estimert andel bruttofortjeneste eller marginintervaller i innkjøpskjeden.
- `retailGrossMargin` (nummer eller serie): sentrale detaljistmarginer.
- `horecaConcentration` (objekt): andel av grossist-/horecamarked hos ledende aktører.
- `procurementConcentration` (nummer/serie): offentlig/privat innkjøpsmønster når det finnes kvantifisert.
- `realEstateExposure` (objekt): anslått eiendomseksponering og leiekompensasjon som konkurransekritisk faktor.

3. `priceDynamics`
- `wholesaleToRetailPassThroughGap` (prosent): indikasjon på hvordan kost/innsatsendringer slår ut i pris til forbruker.
- `priceGapToBenchmark` (objekt): avvik mot valgt benchmark (EU15/EØS/lignende).
- `inflationAlignment` (objekt): inflasjon i matpris vs. input-/kostnadskomponenter.
- `priceAdjustmentLagDays` eller `windowMedian` (hvis kvantifisert): justeringsvinduer for kampanje-/prisendring.

4. `enforcementSignals`
- `caseSignals`: antall/vesentlighet av pågående eller ferdige saker (kartlegging, bøter, avtalehjemler, undersøkelser).
- `supplierComplaintIntensity`: indikator for leverandørrådgivning/beskyttelse (bruk survey + henvendelser når målbare).
- `complianceCapacity` (objekt): bemanning/budsjett eller sakskapasitet i tilsynsmyndighet.

## Kildespecifikke anbefalinger (prioritert)

### Norge (`research/evidence-pack/tilsyn/`)
- I `marketStructure`:
  - Legg inn 2024 kjede-andeler (f.eks. NG, Coop, REMA, Bunnpris osv.) + beregn `cr3`, `hhi`.
  - Oppdater/paralleliser med `parentHHI` ved å holde nåværende felt og introdusere en tydelig `hhi`-metode for konsistens.
- I `valueChain`:
  - Legg inn sentrale marginindikatorer fra leverandør-/pris-/fortjenestestudier (både kjedenivå og verdikjedenivå).
  - Legg inn eiendomssporet (butikkporteføljer/vurdert leiebelastning) som strukturell konkurransekanal.
- I `priceDynamics`:
  - Innføre tidsseriefelt for innkjøpsprisforskjeller og eventuelt lag-dokumenterte justeringsvinduer (må bruke årstall/kvantifisert vindu dersom dokumentet angir dette).
- I `enforcementSignals`:
  - Legg inn indikatorer knyttet til konkurranse- og samhandlingsundersøkelser, herunder påtaleaksjoner/saker der offentlig dokumentasjon gir direkte telling.

### Danmark (`research/evidence-pack/nordisk/` + sammenlignbare analyser)
- I `marketStructure`:
  - Legg inn nyeste rapporterte kjedeandel/CR-verdier; marker usikkerhet per land hvis målegrunnlag varierer.
  - Behold `chainShares` parallelt med eldre nordiske referansepunkter (2000-tallet) i egen liste `historicalBenchmark`.
- I `valueChain`:
  - Legg inn grossist-/horeca-koblinger der de finnes (f.eks. vertskjede som også eier/driver grossistledd).
- I `priceDynamics`:
  - Legg inn matprisinflasjon og marginutvikling i perioden, med eksplisitt kobling til datakildeår.

### Sverige (`research/evidence-pack/nordisk/`)
- I `marketStructure`:
  - Legg inn andeler for top 3–5 kjeder i detaljistleddet + `cr3`/`cr4`/`hhi`.
  - Legg til kommune-/regionvarians der kilden dokumenterer markedsstruktur ulikt by/sted.
- I `valueChain`:
  - Legg inn indikator på markedsdominans i sentrale grossistledd dersom dokumentet gir andeler.
- I `priceDynamics`:
  - Legg inn prisnivå/utvikling (inflasjon i dagligvarer over tid) vs. kostnadsutvikling/inntektsindikator.

### Finland (`research/evidence-pack/nordisk/`)
- I `marketStructure`:
  - Legg inn duopol-andeler (S-Group + K-group) som `cr2` + avledet `cr3` med neste store aktør.
  - `hhi` bør vises separat fra norske tall for å kunne sammenlikne konsistens.
- I `enforcementSignals`:
  - Legg inn kapasitetsindikator fra tilsynet (budsjetter/styrke) som kontekst for gjennomførbar konkurransepolitikk.
- I `priceDynamics`:
  - Legg inn matprissnivå eller sammenligningsindikatorer der datagrunnlag er tydelig tidsseriebasert.

### Island (`research/evidence-pack/nordisk/`)
- I `valueChain`:
  - Legg inn konkurranseforhold mot grossist/retailleddet når tallene finnes i rapportene om markedssituasjon.
- I `enforcementSignals`:
  - Legg inn sakstilgang (`mergerReviews`, `fusionskontroll`, `complaints`) og kapasitet som objekt med tall og datoperiode.
- I `priceDynamics`:
  - Legg inn indikatorer på konkurranseproblemer i forbrukermarked med tydelig skår (f.eks. andel positive funn fra undersøkelser).

## Konkrete plasseringer i JSON (eksempelmal)

```json
{
  "marketStructure": {
    "chainShares": [{"name":"NorgesGruppen","share": 43.5}],
    "cr3": 96.6,
    "cr4": 98.5,
    "hhi": 3445
  },
  "valueChain": {
    "retailGrossMargin": {"value": 20.0, "year": 2024, "unit": "%", "source": "konkurransetilsyn"},
    "upstreamMarginIndex": {"value": 52.0, "year": 2024, "unit": "%", "source": "marginstudier"},
    "horecaConcentration": [{"segment":"servering","leaders":[{"name":"ASKO Servering","share": 70}]},
    {"segment":"grossist","shareTop2": 80}],
    "realEstateExposure": {"ownedValue": "NOK bn", "rentEstimate": "NOK bn/år"}
  },
  "priceDynamics": {
    "wholesaleToRetailPassThroughGap": {"value": 0.4, "unit": "ratio", "description":"andel av kostnadsendring som når sluttkunde"}
  },
  "enforcementSignals": {
    "antiCompetitiveCases": [{"authority":"Konkurransetilsynet","year": 2024, "type":"sanksjon/sak"}],
    "supplierComplaintIntensity": {"value": 0.5}
  }
}
```

- Tallene over er eksempler på feltstruktur; bruk ekte verdier og dataperioder fra kildene.

## Minimumssett for fase 5B (anbefalt å implementere først)

- Norge: `marketStructure.cr3/hhi`, `marketStructure.chainShares`, `valueChain.retailGrossMargin`, `valueChain.upstreamMarginIndex`, `priceDynamics.wholesaleToRetailPassThroughGap`, `priceDynamics.priceGapToBenchmark`, `valueChain.realEstateExposure`.
- Finland: `marketStructure.cr2/cr3`, `marketStructure.chainShares`, `enforcementSignals.complianceCapacity`, `valueChain.horecaConcentration`.
- Sverige: `marketStructure.chainShares`, `marketStructure.cr4`, `priceDynamics.inflationAlignment`, `valueChain.distributionLinks`.
- Danmark: `marketStructure.chainShares`, `marketStructure.hhi`, `priceDynamics.inflationAlignment`, `valueChain.horecaConcentration`.
- Island: `marketStructure.chainShares`/`cr3` (dersom tilgjengelig), `enforcementSignals.caseSignals`, `enforcementSignals.complianceCapacity`.

## Datakvalitetsregime for `chart-metrics`

- Sett alle felt med datakildeår i et konsistent `sourceYear`-felt.
- Bruk `confidence`-felt (høy/middels/lav) der tallene kommer fra ulike definisjoner mellom land.
- Der eksakte tall mangler, legg i `metrics.status: "to_verify"` i stedet for å fjerne feltet helt.

