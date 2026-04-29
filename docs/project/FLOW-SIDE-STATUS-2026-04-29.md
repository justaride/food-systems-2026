# Flow-side status 2026-04-29

## Kort konklusjon

Flow-flaten er operativ som prototype, men ikke moden som totalbilde av nordisk matflyt. Den beste nåværende kjernen er `/forsyningskjede`, fordi den kombinerer DB-relasjoner, primærleveranser og et datakvalitetspanel. Den separate flowvisningen på `/kart/no/flow` er derimot en Norway-first visual prototype med 15 kuraterte origin-destination-kanter og `unit: "index"`, ikke observerte tonn, kroner eller varegrupper.

Status bør derfor være: klar for intern analyse og prioritering, ikke klar som beslutningsvisualisering av hele systemet.

## Hva som finnes nå

### `/forsyningskjede`

- Henter tre datalag parallelt: `getSupplyChainGraph()`, `getPrimaryProducerDeliveries()` og `getSupplyChainDataQuality()`.
- Viser kvalitetsscore, auditfunn, primærleveranser, kuraterte relasjoner, selvhandel og interaktiv relasjonsgraf.
- Verifiserte DB-tall 2026-04-29:
  - Kvalitetsscore etter første backfill: 98.
  - 60 275 leveranser fra 30 475 unike produsent-orgnr.
  - 60 275 av 60 275 leveranser er koblet til buyerId.
  - 0 leveranser mangler buyerId-kobling etter TINE-backfill.
  - 20 leveranser mangler kommune, alle knyttet til egg. 514 egg-rader er backfilled fra leverandørens `Company.metadata.komnr`; de siste 20 finnes ikke i Landbruksdirektoratets foretak-datasett og bør ikke fylles med forretningsadresse uten eksplisitt proxy-merking.
  - 121 kuraterte forretningsrelasjoner mellom 69 selskaper.
  - Relasjonene har 100 % kilde- og beskrivelsesdekning.
  - DB har 55 438 selskaper med verdikjedeledd, men dette er sterkt dominert av produksjonsleddet.

### `/kart/no/flow`

- Bruker `public/data/food-systems/no/flows.json`.
- Dekning: 15 flowkanter, 23 unike node-ID-er.
- Alle node-ID-er finnes i eksisterende havn-/hub-data.
- Enhet er `index`, og teksten i UI sier eksplisitt at volumene er illustrative, ikke observerte tonn.
- Begrensning: bare Norge. Sverige, Danmark, Finland og Island viser "Flowdata finnes ikke".

### `value-chain.json` og Sankey-grunnlag

- 5 land og 33 verdikjedeledd totalt.
- Målmodell er 8 ledd per land: primary, seafood, processing, distribution, retail, horeca, household, waste.
- Dekning:
  - Norge: 8/8 ledd.
  - Sverige: 7/8, mangler seafood.
  - Danmark: 7/8, mangler seafood.
  - Finland: 7/8, mangler seafood.
  - Island: 4/8, mangler processing, distribution, horeca og household.
- Volum- og waste-felt er mangelfulle på tvers av land. Dette er hovedgrunnen til at en helhetlig Sankey fortsatt vil bli misvisende.

## Datapunkter som bør inkorporeres

### Minimum for en meningsfull flowmodell

Hver flowkant bør ha:

- `source_id` og `target_id` koblet til samme nodekatalog som kart/graf.
- `commodity_group` med harmonisert varegruppe.
- `quantity`, `unit`, `year` og `frequency`.
- `origin_country`, `destination_country` og eventuelt kommune/region.
- `flow_type`: production, import, export, processing, distribution, retail, foodservice, household, waste, circular_return.
- `observed_or_estimated`: observed, estimated, proxy eller illustrative.
- `source_ref`, `last_verified`, `confidence` og metodekommentar.

Hver node bør ha:

- aktør/selskap, orgnr der det finnes, land, verdikjedeledd og eierkategori.
- geografisk punkt eller region.
- kapasitet eller rolle der det er relevant: havn, hub, foredlingsanlegg, akvalokalitet, grossistlager, butikknettverk.
- kobling til `/selskap`, `/eierskap`, `/havbruk`, `/subsidier` og `/sirkularitet` der data finnes.

### Datakilder i repoet som bør inn

- `DeliveryVolume`: primærleveranser fra produsenter til avtagere. Klar for Norge etter første backfill: buyerId-gapet er lukket, og restgapet er 20 egg-rader uten produksjonsnær kommune.
- `BusinessRelationship`: kuraterte relasjoner. God proveniens, men bare 121 kanter, altså for tynt til totalbilde.
- `public/data/food-systems/{no,se,dk,fi,is}/value-chain.json`: struktur, selvforsyning, waste, policy og kilder. Klar som dekningspanel, ikke som full flowmodell.
- `research/data/nordic/trade-groups/normalized/trade_groups_imports_annual_panel.csv`: 216 årlige importpanelrader.
- `research/data/nordic/trade-groups/normalized/trade_groups_imports_monthly_panel.csv`: 2 471 månedlige importpanelrader.
- `research/data/nordic/core-series/`: 660 prisrader, 1 134 handelsrader og 65 produksjonsrader.
- `research/data/nordic/analysis-panel/nordic_harmonized_panel.csv`: 1 859 harmoniserte analysepanelrader.
- `public/data/food-systems/logistics_hubs.geojson`: 19 hubber.
- `public/data/food-systems/ports.geojson`: 25 havner.
- `public/data/food-systems/processing_plants.geojson`: 30 anlegg.
- `public/data/food-systems/aquaculture_sites.geojson`: 1 782 akvakulturlokaliteter.
- `public/data/food-systems/feed-composition-timeseries.json`: 6 tidsseriepunkter for fôrkomposisjon.
- `public/data/food-systems/circularity-loops.json`: 62 loop-/case-rader.
- `public/data/food-systems/nutrient-flows.json`: 9 næringsstrøm-rader.

## Vurdering av totalbildet

Vi kan få et hensiktsmessig totalbilde hvis siden defineres som et lagdelt beslutningskart, ikke som én stor "alt flyter overalt"-Sankey.

Det vi kan vise relativt trygt nå:

- Norsk primærproduksjon til hovedavtagere.
- Kuraterte makt-/forsyningsrelasjoner mellom sentrale selskaper.
- Importavhengighet per varegruppe på nordisk nivå.
- Infrastruktur og flaskehalskandidater: havner, hubber, foredlingsanlegg og akvakultur.
- Fôr-/sjømat-sårbarhet som eget modulspor.
- Sirkulære returstrømmer og næringsstrømmer som case-/staging-lag.

Det vi ikke bør visualisere som totalmodell ennå:

- Full nordisk tonnflyt fra jord/sjø til husholdning og avfall.
- Sammenlignbar land-til-land Sankey for alle varegrupper.
- Estimert flyt gjennom dagligvare, HoReCa og husholdning uten tydelig proxy-merking.
- Island som like komplett sammenligningsland.

## Anbefalt utviklingsløp

1. Etabler en typed `FlowEdge`/`FlowNode`-modell og flytt `no/flows.json` fra illustrativ prototype til eksplisitt `observed_or_estimated`-modell. Utført første tranche 2026-04-29: `src/lib/map/types.ts` har nå `FlowDataset`/`FlowRecord`, `no/flows.json` har `schemaVersion`, metode/statusfelt og kantvis `observedOrEstimated`, `confidence`, `commodityGroup`, `flowType`, `sourceRef` og `lastVerified`. UI-et på `/kart/no/flow` viser nå at alle 15 kanter er illustrative og at `index` ikke er tonn.
2. Lukk buyerId-gap for melk/geitmelk og kommune-gap for egg i `DeliveryVolume`. Utført første tranche 2026-04-29: `scripts/import-leveransedata.ts` bruker nå riktig TINE-orgnr `947942638` og kommune-fallback fra leverandørmetadata. `scripts/backfill-delivery-quality.ts --apply` oppdaterte 6 640 TINE-buyerId-rader og 514 egg-kommune-rader. Restgap: 20 egg-rader uten produksjonsnær kommune i Landbruksdirektoratets foretak-data.
3. Bygg første beslutningsvisning rundt fire faner:
   - `Primærflyt`: norske leveranser og avtagere.
   - `Import og sårbarhet`: nordiske importpaneler og produksjons-/pris-/handelsserier.
   - `Infrastruktur`: havner, hubber, anlegg, akvakultur og flaskehalsnotater.
   - `Returstrømmer`: matsvinn, næringsstrømmer, biogass, sidestrømmer og sirkulære case.
4. Bruk Sankey kun der mengdene er sammenlignbare innen samme land, år, varegruppe og enhet.
5. Legg alltid inn deknings- og usikkerhetsmerking i visualiseringen: `observed`, `estimated`, `proxy`, `illustrative`.
6. Når volumdekning er god nok, koble flowmodellen tilbake til `/forsyningskjede`, `/verdikjede`, `/sammenligning`, `/sirkularitet` og `/havbruk`.

## Statuskode

- Produktflate: gul.
- Datatilgang: gul/grønn.
- Modellkonsistens: gul.
- Visualiseringsmodenhet: rød/gul.
- Beslutningsklarhet: intern bruk nå, ekstern/ledergruppe først etter observasjons-/proxy-skille og volumdekning.
