# Research plan: nordisk like-dekning for forsyningskjede

Dato: 2026-04-29  
Flater: `/forsyningskjede`, `/verdikjede`, `/sammenligning`, `/kart`, `/sirkularitet`  
Målstatus: internt beslutningsgrunnlag først; ekstern/ledergruppe etter kilde- og proxy-gates.

## 1. Formål

Målet er å bygge et like dekkende innsiktsgrunnlag og datagrunnlag for Norge, Sverige, Danmark, Finland og Island, slik at `/forsyningskjede` ikke lenger er Norway-first med nordisk kontekst, men en sammenlignbar nordisk arbeidsflate.

Planen skal gi tre konkrete resultater:

1. Samme minimumsmodell per land: ledd, aktører, varegrupper, infrastruktur, import, produksjon, returstrømmer og styringsregime.
2. Et eksplisitt dekningsregnskap som skiller `observed`, `estimated`, `proxy` og `illustrative`.
3. En import- og review-kø som lukker landgap før ny visualisering får status som beslutningsklar.

## 2. Nåværende baseline

### 2.1 Sterkest dekning

Norge har den klart sterkeste operative dekningen:

- `DeliveryVolume`: 60 275 norske primærleveranser fra 30 475 unike produsent-orgnr.
- Leverandører og avtakere i `DeliveryVolume` er per nå `NO`.
- `BusinessRelationship`: 121 kuraterte relasjoner totalt, men 106 er `NO -> NO`.
- `/kart/no/flow` har 15 flowkanter, men disse er `illustrative` og bruker `unit: index`, ikke observerte tonn.

### 2.2 Nordiske datalag som allerede finnes

Det finnes flere nordiske datalag som kan inngå i like-dekning, men de er ikke integrert som full forsyningskjedemodell:

| Datalag | Dekning nå | Status |
| --- | --- | --- |
| `public/data/food-systems/{no,se,dk,fi,is}/value-chain.json` | 5 land, 33 ledd | Klar som dekningspanel, ikke full flowmodell |
| `research/data/nordic/trade-groups/normalized/` | Annual-panelet `trade-group-imports-annual.csv` dekker NO, SE, DK, FI og IS; monthly-panelet mangler NO i v1 | Månedlig NO må eventuelt bygges senere |
| `research/data/nordic/core-series/` | Pris: 5 land; handel: 5 land; produksjon: 5 land | Klar med sammenlignbarhetsforbehold |
| `research/data/nordic/analysis-panel/nordic_harmonized_panel.csv` | 5 land, 1 859 rader | Klar som analysepanel |
| Geo-assets | Hubber, havner, anlegg, akvakultur | Må landmerkes og kildeharmoniseres |
| Fôr, sirkularitet og næringsstrømmer | Tverrgående, men ujevn landkobling | Staging |

### 2.3 Ledddekning i `value-chain.json`

Målmodell: 8 ledd per land: `primary`, `seafood`, `processing`, `distribution`, `retail`, `horeca`, `household`, `waste`.

| Land | Dekning | Mangler |
| --- | ---: | --- |
| Norge | 8/8 | Ingen |
| Sverige | 7/8 | `seafood` |
| Danmark | 7/8 | `seafood` |
| Finland | 7/8 | `seafood` |
| Island | 4/8 | `processing`, `distribution`, `horeca`, `household` |

Hovedgap: volum- og waste-felt er for ujevne til å lage én nordisk Sankey uten tydelig proxymerking.

## 3. Målmodell for like-dekning

Hvert land skal ha samme minimumspakke før vi kaller forsyningskjedegrunnlaget likeverdig.

### 3.1 Landpakke per land

For hvert land skal det finnes én eksplisitt landpakke:

- `docs/project/forsyningskjede-country-packs/no.md`
- `docs/project/forsyningskjede-country-packs/se.md`
- `docs/project/forsyningskjede-country-packs/dk.md`
- `docs/project/forsyningskjede-country-packs/fi.md`
- `docs/project/forsyningskjede-country-packs/is.md`

Hver landpakke skal bruke samme skjema:

1. Kilder og status
2. Verdikjedeledd
3. Primærproduksjon
4. Sjømat og fôr
5. Foredling
6. Distribusjon og logistikk
7. Dagligvare og foodservice
8. Import/eksport og sårbarhet
9. Matsvinn, sidestrømmer og retur
10. Regulatorisk/styringsmessig ramme
11. Nøkkelaktører og relasjoner
12. Datagap og review-kø

### 3.2 Minimumsdata per land

| Domene | Minimum | Statuskrav |
| --- | --- | --- |
| Verdikjedeledd | 8/8 mål-ledd med kilder | `observed` eller tydelig `proxy` |
| Produksjon | Minst 3 sammenlignbare serier: korn/plante, husdyr/meieri, sjømat der relevant | År, enhet, kilde |
| Import | 6 varegrupper: korn, kjøtt, fisk/sjømat, meieri/egg, frukt/grønt, fett/oljer | Harmonisert panel |
| Pris/marked | HICP/CPI food + minst én handels-/omsetningsserie | Indeks/valuta skilt |
| Infrastruktur | Havner, logistikkhubber, foredlingsanlegg, akvakultur der relevant | Geometri + kilde |
| Aktører | Top 10 aktører per land fordelt på retail, processing, inputs/logistics, seafood | Orgnr/ID der mulig |
| Relasjoner | Minst 20 kildebelagte `BusinessRelationship`-kandidater per land | Review før import |
| Returstrømmer | Waste og minst 3 case/loops per land | Ikke bland case og volum |
| Policy | Matberedskap, konkurranse/UTP, matsvinn, sirkularitet, sjømat/fôr der relevant | År + ansvarlig myndighet |
| Innsikt | 8-12 landspesifikke claim cards per land | Kilde, styrke, usikkerhet |

## 4. Dekningsnivåer

Alle datapunkter skal merkes etter denne stigen:

| Nivå | Status | Bruk |
| --- | --- | --- |
| L0 | Mangler | Synlig gap, ikke visualiser |
| L1 | Kilde funnet | Kan stå i research-kø |
| L2 | Ekstrahert | Kan inngå i landpakke |
| L3 | Normalisert | Kan inngå i tabell/graf med forbehold |
| L4 | Sammenlignbar | Kan inngå i nordisk sammenligning |
| L5 | Validert | Kan brukes i ekstern/ledergruppe |

Stop-regel: Ingen tverrnasjonal graf får beslutningsklar status før alle fem land har minst L3 på samme domene og usikkerheten vises i UI.

## 5. Arbeidsprogram

### Fase 0: Etabler dekningsregister

Varighet: 0,5-1 dag  
Output:

- `docs/project/forsyningskjede-nordic-coverage-ledger-2026-04-29.csv`
- `docs/project/forsyningskjede-country-packs/`
- Første score per land/domene: `missing`, `source-found`, `extracted`, `normalized`, `comparable`, `validated`

Arbeid:

1. Les eksisterende `value-chain.json`, `chart-metrics.json`, `CountryMetric`, `BusinessRelationship`, `DeliveryVolume`, `trade-groups`, `core-series`, `analysis-panel`, geo-assets og circularity-filer.
2. Lag matrise: land x domene x status x kilde x neste handling.
3. Merk alle eksisterende data med `observed`, `estimated`, `proxy` eller `illustrative`.

Gate 0:

- Ingen nye importjobber før baseline-ledger er skrevet.
- Norge skal ikke brukes som skjult standard for andre land; hvert land må ha egen kilde og metodefelt.

### Fase 1: Lukk value-chain-ledd og kildedekning

Varighet: 1-2 dager  
Prioritet: Island først, deretter SE/DK/FI seafood.

Arbeid:

1. Island: finn og normaliser `processing`, `distribution`, `horeca`, `household`.
2. Sverige, Danmark, Finland: fyll `seafood`-ledd eller merk eksplisitt hvorfor sjømat behandles som produksjon/handel og ikke eget ledd.
3. Legg inn `sources`, `last_verified`, `confidence`, `method_note` på hvert nytt eller endret ledd.
4. Skill volum, verdi, indeks og kvalitative claims.

Gate 1:

- Alle fem land har 8/8 mål-ledd, eller et eksplisitt dokumentert avvik.
- Minst én primær/offentlig kilde per ledd.
- Ingen Sankey/flowbruk uten volum- og enhetsmerking.

### Fase 2: Harmoniser import- og produksjonsserier

Varighet: 2-3 dager  
Prioritet: bruke avklart annual-panel for alle fem land og etablere sammenlignbare varegruppefelt. NO mangler bare i månedspanel i v1.

Arbeid:

1. Bruk `trade-group-imports-annual.csv` som styrende annual-panel; dokumenter at `trade_groups_imports_annual_panel.csv` er legacy/alternativt panel med svakere NO/IS-dekning.
2. Standardiser varegrupper:
   - cereals
   - meat
   - fish_seafood
   - dairy_eggs
   - fruit_veg
   - fats_oils
3. For hver serie: bevar original enhet, standardisert enhet, indeksverdi og sammenlignbarhetsflagg.
4. Lag landvis import-sårbarhetskort: største varegruppe, endring 2022-2025, datakvalitet, klassifikasjonsforbehold.

Gate 2:

- Alle fem land har annual importpanel for samme seks varegrupper.
- Cross-country nivåer brukes bare når enhet og klassifikasjon er forsvarlig; ellers brukes trend/andel/indeks.
- Produksjon er foreløpig bare delvis paritet: NO/SE/FI har direkte havresubpanel, DK har primærsjekket minimumskurv for korn/H170, melk, svin, poteter, landinger og akvakultur, og IS har primærsjekket seafood-first proxy med landbrukssupplement. Proxyene må metodegodkjennes før de vises som produksjonsparitet.

### Fase 3: Bygg aktør- og relasjonsparitet

Varighet: 3-5 dager  
Prioritet: løfte SE/DK/FI/IS til minst 20 kildebelagte relasjonskandidater per land.

Arbeid:

1. For hvert land, kartlegg top 10-15 aktører:
   - dagligvare
   - grossist/foodservice
   - foredling
   - landbrukskooperativer
   - sjømat/fôr
   - logistikk/infrastruktur
2. Finn relasjoner:
   - leverandør/kjøper
   - distributør
   - franchise
   - joint venture
   - egenhandel/vertikal integrasjon
3. Legg kandidater i review-fil før DB-import:
   - `research/review/supply-chain-relationships-nordic-review-2026-04-29.csv`
4. Importer først etter review:
   - `ready_for_import`
   - `needs-primary-check`
   - `reject/archive`

Gate 3:

- Minst 20 relasjonskandidater per land.
- Minst 10 importerte/kildegodkjente relasjoner per land før grafen presenteres som nordisk relasjonsgraf.
- `source` og `description` er obligatorisk på alle `BusinessRelationship`.

### Fase 4: Infrastruktur og flaskehalser

Varighet: 2-3 dager  
Prioritet: landmerking, ID-harmonisering og kildefelt.

Arbeid:

1. Revider:
   - `public/data/food-systems/logistics_hubs.geojson`
   - `public/data/food-systems/ports.geojson`
   - `public/data/food-systems/processing_plants.geojson`
   - `public/data/food-systems/aquaculture_sites.geojson`
2. Krav per node:
   - `id`
   - `name`
   - `country`
   - `node_type`
   - `value_chain_stage`
   - `source_ref`
   - `last_verified`
   - `confidence`
3. Legg inn minimum per land:
   - 3-5 logistikk-/grossistnoder
   - 3-5 foredlingsnoder
   - havner der relevant
   - akvakultur/sjømat der relevant

Gate 4:

- Kartlaget kan vise alle fem land uten at Norge alene bærer logikken.
- Ingen node uten land og kilde.

### Fase 5: Returstrømmer, matsvinn og sirkularitet

Varighet: 2-4 dager  
Prioritet: skille case, mengde, policy og teknologi.

Arbeid:

1. Revider:
   - `public/data/food-systems/circularity-loops.json`
   - `public/data/food-systems/nutrient-flows.json`
   - `public/data/food-systems/feed-composition-timeseries.json`
2. Lag per land:
   - matsvinnstatus
   - sidestrømmer
   - biogass/næringsstrøm
   - fôr/alternativ protein der relevant
   - 3 case med kilde og modenhet
3. Merk hvert element:
   - `case`
   - `observed_volume`
   - `estimated_volume`
   - `policy_target`
   - `technology_pathway`

Gate 5:

- Minst 3 case/loops per land.
- Volum og case blandes ikke i samme indikator uten metodefelt.

### Fase 6: Landvise innsiktskort

Varighet: 2-3 dager  
Output per land: 8-12 claim cards.

Skjema:

- `claim_id`
- `country`
- `domain`
- `claim`
- `evidence`
- `source_ref`
- `data_status`
- `confidence`
- `counterpoint`
- `ui_surface`

Innsiktstyper:

1. Konsentrasjon og kjøpermakt
2. Importavhengighet
3. Primærproduksjonsrisiko
4. Sjømat/fôr-risiko
5. Logistisk flaskehals
6. Matsvinn/returstrøm
7. Regulatorisk særtrekk
8. Mulig sirkulær mulighet

Gate 6:

- Like mange claim cards per land.
- Minst to kildetyper per land: statistikk + rapport/tilsyn/forskning.
- Claims med svak kilde får `needs-primary-check`.

### Fase 7: Integrasjon tilbake i appen

Varighet: 2-4 dager etter research-gates.

Arbeid:

1. Utvid `getSupplyChainDataQuality()` til å lese coverage-ledger, ikke bare telle rader.
2. Legg inn landfilter og dekningspanel på `/forsyningskjede`.
3. Skill faner:
   - Primærleveranser
   - Relasjonsgraf
   - Import og sårbarhet
   - Infrastruktur
   - Returstrømmer
   - Datadekning
4. Koble `/sammenligning` til samme coverage-status.
5. Hold `/kart/no/flow` merket som Norway-only inntil de andre landene har tilsvarende flowdata.

Gate 7:

- UI må vise hva som er `observed`, `estimated`, `proxy` og `illustrative`.
- Ingen totalnordisk flytgraf uten sammenlignbare flowkanter.

## 6. Prioritert landrekkefølge

1. Island: største strukturelle hull i `value-chain.json`.
2. Sverige: sterk eksisterende aktør-/researchbase, men mangler sjømatledd og mer relasjonsimport.
3. Danmark: god handels-/landbruksbase, men seafood og relasjonsgraf må styrkes.
4. Finland: gode data for handel/pris/produksjon, men aktør- og relasjonsdekning må opp.
5. Norge: brukes som referansemodell, men skal ikke få videre UI-prioritet før paritetsgapene er lukket.

## 7. Kildejakt per land

### Norge

Bruk eksisterende primærleveranser som referanse. Suppler bare der paritet krever det:

- annual importpanel inn i sårbarhetskort
- foodservice/grossist
- sjømatfôr og globale råvarekjeder
- returstrømmer og matsvinn

### Sverige

Prioriter:

- SCB handel, produksjon, matpriser
- Jordbruksverket
- Livsmedelsverket
- Konkurrensverket
- ICA, Axfood, Coop, Martin & Servera, Lantmännen, Arla Sverige
- sjømat/fôrledd hvis eget ledd beholdes i målmodellen

### Danmark

Prioriter:

- Danmarks Statistik / StatBank
- Fødevarestyrelsen
- Konkurrence- og Forbrugerstyrelsen
- Salling, Coop Danmark, Dagrofa, DLG, Danish Crown, Arla, DSV/DFDS der relevant
- seafood- og fiskerilink der det faktisk er systemrelevant

### Finland

Prioriter:

- StatFin
- Luke
- Ruokavirasto / Food Market Ombudsman
- K Group, S Group, Valio, HKScan, Atria, Fazer, Kesko logistics
- finske case på matsvinn og supply-chain collaboration

### Island

Prioriter:

- Statistics Iceland
- Matvælastofnun
- Samkeppniseftirlitið
- Hagar, Festi, Kaupfélag Skagfirðinga, Icelandic seafood actors, MS Iceland Dairies
- distribusjon/HORECA/husholdning, fordi dette er det største nåværende leddgapet

## 8. Review- og importregler

### 8.1 Kandidater før import

Alle nye aktører, relasjoner, infrastrukturpunkter og claims skal først inn i review-filer. Direkte DB-import skal bare skje etter at de har fått en av disse statusene:

- `ready_for_import`
- `needs-primary-check`
- `needs-actor-validation`
- `archive/reject`

### 8.2 Minimumsfelt

Ingen kandidat er importklar uten:

- land
- domene
- kilde
- år eller datoperiode
- metodekommentar
- confidence
- status

### 8.3 Sammenlignbarhet

Tverrnasjonale sammenligninger skal bruke en av tre godkjente metoder:

1. Samme indikator, samme enhet, samme periode.
2. Rebasert indeks med tydelig baseår.
3. Innenlands andel/rangering, ikke rå nivåer.

## 9. Foreslått tracker

Fil: `docs/project/forsyningskjede-nordic-coverage-ledger-2026-04-29.csv`

Kolonner:

```csv
country,domain,subdomain,dataset_or_claim,current_status,target_status,evidence_status,source_path_or_url,source_type,year_or_period,unit,comparability_flag,confidence,next_action,owner,review_status,ui_surface,notes
```

Eksempelstatus:

- `missing`
- `source_found`
- `extracted`
- `normalized`
- `comparable`
- `validated`

## 10. Ferdigdefinisjon

Arbeidet er ferdig når:

1. Alle fem land har 8/8 value-chain-ledd eller eksplisitt begrunnet avvik.
2. Alle fem land har samme seks importvaregrupper.
3. Alle fem land har minst 10 godkjente forsyningskjede-/maktrelasjoner i DB og minst 20 reviewede kandidater.
4. Alle fem land har infrastrukturdata med land, type, kilde og confidence.
5. Alle fem land har minst 3 sirkularitets-/returstrømcase.
6. Alle fem land har 8-12 claim cards med kilde og confidence.
7. `/forsyningskjede` viser dekningsstatus per land og ikke bare samlet kvalitetsscore.
8. Alle visualiseringer skiller observerte data, estimater, proxyer og illustrasjoner.

## 11. Første operative kø

Start her:

1. Opprett coverage-ledger og fem tomme landpakker.
2. Kjør lokal audit av `value-chain.json`, `trade-groups`, `core-series`, `analysis-panel`, geo-assets og DB-tabellene.
3. Fyll Island-gapene i `value-chain.json`.
4. Fyll seafood-ledd eller eksplisitt avvik for SE/DK/FI.
5. Bruk avklart annual importpanel og dokumenter monthly NO som eget metodegap.
6. Bygg review-fil for nordiske `BusinessRelationship`-kandidater.
7. Oppdater `/forsyningskjede` først når ledgeren kan vise landvis dekningsstatus.
