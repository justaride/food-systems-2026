---
tittel: "Worker 4A handoff - A-feed/import/EUDR"
status: "worker-handoff"
worker: "4A"
dato: 2026-04-28
scope:
  - A-feed/import/EUDR
  - CL-A-020
  - CL-A-021
  - CL-C-011
  - EV-A-017
  - EV-A-018
  - EV-A-019
  - EV-A-020
  - EV-A-021
  - EV-C-017
canonical_docs_redigert: false
skrev_kun: "docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-4a-feed-import-eudr.md"
---

# Worker 4A handoff - A-feed/import/EUDR

## Kort konklusjon

Spor A er sterkt nok som strategisk hovedspor, men bare som import-, fôr- og sporbarhetsgate med tydelige datalag. Sterkeste baseline er SSB 08801 for offisiell import etter varenummer og opprinnelsesland, Fiskeridirektoratet/Sjømat Norge for total omsetning av oppdrettsfôr, Denofa som actor-case for soyabønner til Fredrikstad, Skretting som actor-benchmark for fôrsammensetning/SPC, og EU/norske EUDR-kilder for compliance.

Det viktigste ryddet er negativt: ikke gjør ett tall til sannhet for "norsk soya i laksefôr". SSB-import, Denofa actor-volum, Skretting råvareandeler, Fiskeridirektoratet totalfôr og EUDR-varekodescope har ulike systemgrenser.

`CL-A-020` bør beholdes som scopingpilot med Medium konfidens og snevrere formulering. `CL-A-021` bør holdes Lav til konkret lovlig substrat, risikodesign, insektaktør og kjøper er låst. `CL-C-011` er sterk for EU-scope og frister, men må fortsatt formuleres med klart skille mellom EU-marked, norsk/EØS-høringsstatus, varekoder og praktisk actor-effekt.

## Lest grunnlag

- `research-plan-food-tg-triangulation-runde-4-2026-04-28.md`
- `docs/project/mandates/analysefabrikk-handoffs/2026-04-28-master-merge-runde-3.md`
- `track-brief-a-feed-import.md`
- `evidence-matrix-food-tg.md`
- `claim-register-food-tg.md`
- `source-shortlist-food-tg.md`
- `docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-3a-eudr-norge.md`
- `docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-3b-ssb-hs-importdata.md`
- `docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-3c-foraktor-kryssjekk.md`
- Relevante A-feed source cards fra runde 2/3.

## Trianguleringstabell

| Claim/spørsmål | Primærkilde | Forskning/fag | Actor/case | Benchmark | Hypotese/fortolkning | Kritisk svakhet | Konklusjon |
|---|---|---|---|---|---|---|---|
| Offisiell importbaseline for soya/fiskemel/prepared fish feed | SSB 08801/API (`SRC-A-017`, `EV-A-021`) | SSB metode for utenrikshandel; HS/varenummer | Ikke actor-spesifikk | Kan benchmarke mot Denofa/Skretting/Fiskeridir | Importserier kan brukes som faktagrunnlag for datagate | Sier ikke aktørbruk, fôrsammensetning, norsk produksjon eller substitusjon | Bruk som primær baseline per varekode, med 2024/2025 revisjonsforbehold |
| Soyabønner som norsk verdikjedepunkt | SSB `1201`; Denofa offentlig side (`EV-A-017`) | Import-/sporbarhetslogikk fra A-feed brief | Denofa Fredrikstad, ca. 450 000 tonn soyabønner/år | Denofa som sporbarhets- og soyaprosesseringscase | Soya er konkret nok til å bære actor-samtale | Denofa er ikke total norsk handelsstatistikk, ikke SPC, ikke akvakulturandel | Bruk Denofa som actor/case, ikke som totalclaim |
| SPC og vegetabilske råvarer i fôr | Skretting Impact Report 2024 (`EV-A-019`) | Foods of Norway/NMBU (`EV-A-001`) og fôrressurskilder | Skretting Norge: 16,6 % SPC, 71,3 % vegetabilske råvarer, 24,6 % marine råvarer, 0,8 % novel raw materials | Skretting som datakvalitetsbenchmark for BioMar/Cargill/Mowi | SPC er relevant for importsubstitusjon og compliance | Én aktør; ikke bransjeproxy. Produksjonsvolum/tonn ikke låst | Bruk som actor-benchmark og spørreskjema-mal |
| Total fôrvolumramme | Fiskeridirektoratet Nøkkeltall 2024 tabell 43 (`EV-A-018`) | Nofima/fôrressurskontekst i lokale kilder | Sjømat Norge som kilde for tabell | Norsk oppdrettsfôrvolum 2020-2024 | Stor volumramme gjør A-sporet beslutningsrelevant | Ikke råvarefordelt, ikke import, ikke bare laks | Bruk "oppdrettsfôr totalt", ikke "laksefôr" uten ekstra data |
| Fiskemel/fiskepellets import | SSB `23012010/90`; EUMOFA 2025 (`EV-A-020`, `EV-A-021`) | EUMOFA markedsanalyse | Importland: Island, Danmark, Færøyene, Peru, Chile m.fl. | Global/EU fiskemelproduksjon og akvakulturbruk | Fiskemel er relevant parallell import- og sporbarhetsråvare | Norsk faktisk fôrbruk og aktørfordeling er ikke låst | Bruk som norsk importserie + global/EU kontekst |
| EUDR for soya/fôrråvarer | EU-kommisjonen, EUR-Lex, regjeringen.no, Miljødirektoratet, Landbruksdirektoratet (`EV-C-017`) | Regelverks- og compliance-faglig ramme | Denofa/Skretting/fôraktører som praktiske dataeiere | EU-frister 30.12.2026 og 30.06.2027 som tidsbenchmark | EUDR gjør soya til sporbarhets- og dokumentasjonsspørsmål for EU-eksponerte kjeder | Norsk høringsgrunnlag sier delvis innlemmelse og ingen soya-varetyper; endelig Lovdata/EØS/Traces-varekodepraksis ikke låst | `CL-C-011` er sterk bare med EU/Norge-skille |
| Importavhengighet -> alternative proteiner | SSB/Fiskeridir/Skretting som baseline | NMBU/Foods of Norway, Nordic protein-kilder, waste-to-nutrition review | NMBU/Foods of Norway; Skretting; Sjømat Norge/Råvareløftet | Nordic protein ecosystem og fôraktørkrav | Alternative proteiner kan være relevant scopingpilot | Importavhengighet beviser ikke kost, LCA, volum, regulatorikk eller kommersiell modenhet | `CL-A-020` styrkes som strategisk scoping, ikke effektclaim |
| Insektprotein på godkjente sidestrømmer | Mattilsynet, EU ABP/TSE/PAP-kilder (`EV-A-013`-`EV-A-015`) | EFSA 2015, HACCP-lignende safety framework, Javourez review | Volare/Finnprotein og mulige fôr-/sjømatkjøpere | Axfoundation/Framtidens foder som governance-benchmark | A/B-kombinasjon kan være god hvis substratet er lovlig og etterspurt | Mange attraktive substrater er forbudt/uavklart; kapasitet/kjøper/QA ikke validert | `CL-A-021` holdes Lav til substratgate og demand-side er låst |

## Tallregister

Alle SSB-tall under gjelder import til Norge, alle opprinnelsesland samlet, tonn beregnet fra kg i `Mengde1`. SSB 2024/2025 bør brukes med revisjonsforbehold. Actor- og bransjetall holdes separat.

| Tall | År | Geografi | Enhet | Definisjon | Kilde | Varekode/metode | Status |
|---|---:|---|---:|---|---|---|---|
| 347 191 | 2024 | Norge | tonn | Import av soyabønner, alle opprinnelsesland | SSB 08801 / `EV-A-021` | `12011000+12019010+12019090` | kan brukes internt |
| 399 331 | 2025 | Norge | tonn | Import av soyabønner, alle opprinnelsesland | SSB 08801 / `EV-A-021` | Samme | kan brukes internt, revisjonsforbehold |
| 31 | 2024 | Norge | tonn | Import av soyabønnemel | SSB 08801 | `12081010+12081090` | kan brukes internt |
| 34 | 2025 | Norge | tonn | Import av soyabønnemel | SSB 08801 | Samme | kan brukes internt, revisjonsforbehold |
| 4 814 | 2024 | Norge | tonn | Import av soyakaker/reststoff etter utvinning av soyaolje | SSB 08801 | `23040010+23040090` | kan brukes internt |
| 13 377 | 2025 | Norge | tonn | Import av soyakaker/reststoff etter utvinning av soyaolje | SSB 08801 | Samme | kan brukes internt, revisjonsforbehold |
| 952 | 2024 | Norge | tonn | Import av soyaolje | SSB 08801 | `15071010+15071090+15079010+15079090` | kan brukes internt |
| 992 | 2025 | Norge | tonn | Import av soyaolje | SSB 08801 | Samme | kan brukes internt, revisjonsforbehold |
| 747,9 | 2024 | Norge | tonn | Proteinkonsentrater/teksturerte proteinsubstanser til fiskefôr, ikke soyaspesifikk | SSB 08801 / 3B | `21061002_2022` | needs-primary-check |
| 1 421 | 2025 | Norge | tonn | Proteinkonsentrater/teksturerte proteinsubstanser til fiskefôr, ikke soyaspesifikk | SSB 08801 / 3B | `21061002_2022` | needs-primary-check |
| 482 641 | 2024 | Norge | tonn | Import av fiskefôr, ikke akvariefisk, uten landdyr-kjøtt/slakteavfall | SSB 08801 / 3B | `23099040_1995` | needs-actor-validation |
| 501 484 | 2025 | Norge | tonn | Import av fiskefôr, ikke akvariefisk, uten landdyr-kjøtt/slakteavfall | SSB 08801 / 3B | `23099040_1995` | needs-actor-validation |
| 217 991 | 2024 | Norge | tonn | Import av fiskemel/fiskepellets, utjenlig til menneskeføde | SSB 08801 / `EV-A-021` | `23012010+23012090` | kan brukes internt |
| 245 339 | 2025 | Norge | tonn | Import av fiskemel/fiskepellets, utjenlig til menneskeføde | SSB 08801 / `EV-A-021` | Samme | kan brukes internt, revisjonsforbehold |
| 2 185 945 | 2024 | Norge | tonn | Omsetning av fôr i oppdrettsnæringen, total | Fiskeridirektoratet Nøkkeltall 2024 tabell 43, kilde Sjømat Norge / `EV-A-018` | Ikke HS; bransjevolum | kan brukes internt |
| ca. 450 000 | årlig, nettside lest 2026-04-28 | Denofa Fredrikstad/Norge | tonn/år | Soyabønner til Denofas anlegg | Denofa / `EV-A-017` | Actor-primary | actor/case |
| 16,6 | 2024 | Skretting Norge | prosent av gjennomsnittlig fôr | SPC i Skretting Norges gjennomsnittlige fôr | Skretting / `EV-A-019` | Actor-primary | actor-benchmark |
| 71,3 / 24,6 / 0,8 | 2024 | Skretting Norge | prosent av gjennomsnittlig fôr | Vegetabilske råvarer / marine råvarer / novel raw materials | Skretting / `EV-A-019` | Actor-primary | actor-benchmark |
| ca. 5,1 mill. | siste tiår, EUMOFA 2025 | Globalt | tonn/år | Global fiskemelproduksjon | EUMOFA / `EV-A-020` | Sekundær markedsrapport | benchmark/kontekst |
| 92 | 2023 | Globalt | prosent | Global fiskemelbruk til akvakultur | EUMOFA / `EV-A-020` | Sekundær markedsrapport | benchmark/kontekst |

## Source cards

### SRC-A-017 / EV-A-021 - SSB Statistikkbanken 08801

| Felt | Vurdering |
|---|---|
| Type | Primærkilde / institusjonskilde |
| Bruk | Offisiell norsk importbaseline per varenummer, import/eksport, opprinnelsesland, mengde, verdi og år |
| Styrker | Låser bedre tallgrunnlag enn L4-estimater for soyabønner, soyabønnemel, soyaolje, soyakaker/reststoff, fiskemel og prepared fish feed |
| Kritisk svakhet | Handelsstatistikk er ikke aktørbruk, råvareandel i fôr, norsk produksjon eller substitusjonseffekt |
| Status | kan brukes internt; SPC/prepared-feed og 2024/2025 må metode-/aktørsjekkes |
| Masterbruk | Bruk som tallanker i decision memo, men bare med varekode, år, enhet, definisjon og revisjonsnote |

### SRC-C-018 / EV-C-017 - EU- og norske EUDR-kilder

| Felt | Vurdering |
|---|---|
| Type | Primærkilde / regelverkskilde |
| Bruk | EU-scope, EU-frister, norsk høringsstatus, DDS/Traces-praksis |
| Styrker | EU-scope og frister er godt dokumentert; norske høringskilder nyanserer EØS-innlemmelse |
| Kritisk svakhet | Endelig EØS-komitébeslutning, Stortingssamtykke, Lovdata/forskrift, varekoder for SPC/prepared feed og praktisk Traces/EORI er ikke lukket |
| Status | kan brukes internt for EU-scope og norsk høringsstatus; needs-primary-check for endelig Norge/EØS |
| Masterbruk | Formuler EUDR som EU-markeds-, kunde- og dokumentasjonsrisiko for norske fôr-/soyaaktører, ikke som avklart norsk soya-plikt |

### SRC-A-013 / EV-A-017 - Denofa soya og produkter

| Felt | Vurdering |
|---|---|
| Type | Actor/case, actor-primary |
| Bruk | Konkret norsk soyabønne- og prosesseringsnode |
| Styrker | Gjør soyaimport og sporbarhet praktisk: ca. 450 000 tonn soyabønner/år til Fredrikstad, råvare til soyamel, olje og lecitin |
| Kritisk svakhet | Ikke offisiell totalstatistikk, ikke SPC, ikke årvis tidsserie, ikke kundesplitt mot akvakultur |
| Status | actor/case; needs-actor-validation for produktutbytte, opprinnelse og kundekrav |
| Masterbruk | Bruk Denofa som første P1-samtale om soya, produktstrømmer og EUDR-/kundedokumentasjon |

### SRC-A-015 / EV-A-019 - Skretting Norway Impact Report 2024

| Felt | Vurdering |
|---|---|
| Type | Actor/case og benchmark |
| Bruk | Fôrsammensetning, SPC-andel, vegetabilske/marine råvarer, sertifisering og sporbarhetspraksis hos én aktør |
| Styrker | Gir detaljert actor-benchmark for hvilke data TG må be BioMar, Cargill, Mowi Feed og Sjømat Norge om |
| Kritisk svakhet | Ikke bransjeproxy; prosent kan ikke gjøres om til tonn uten volum/metode |
| Status | actor-benchmark; needs-actor-validation for representativitet |
| Masterbruk | Bruk som spørreskjema-mal og eksempel, ikke som norsk snitt |

### SRC-A-014 / EV-A-018 - Fiskeridirektoratet/Sjømat Norge oppdrettsfôr

| Felt | Vurdering |
|---|---|
| Type | Primærkilde / institusjonskilde |
| Bruk | Total omsetning av fôr i norsk oppdrettsnæring 2020-2024 |
| Styrker | 2 185 945 tonn i 2024 gir beslutningsrelevant volumramme |
| Kritisk svakhet | Ikke råvarefordeling, ikke importandel, ikke bare laks |
| Status | kan brukes internt med definisjon |
| Masterbruk | Skriv "oppdrettsfôr totalt" til artsfordelt serie eller bransjedata finnes |

### SRC-A-001 / EV-A-001 - NMBU/Foods of Norway novel feed

| Felt | Vurdering |
|---|---|
| Type | Forskning / fagkilde |
| Bruk | Teknisk mulighet for metanotroft bakterieprotein og gjær-/encelleprotein i laksefôr |
| Styrker | Støtter at alternativt protein er et reelt FoU-spor og relevant for `CL-A-020` |
| Kritisk svakhet | Dokumenterer ikke kommersiell skala, kost, full LCA, råvaretilgang eller regulatorisk aksept; originalartikkel/tall må låses før ekstern tallbruk |
| Status | needs-primary-check for DOI/originalartikkel og tall |
| Masterbruk | Bruk som teknisk scopinggrunnlag og NMBU/Foods of Norway-intervjuspørsmål |

### SRC-REG-001 til SRC-REG-006 / EV-A-013 til EV-A-016 - insekt/fôrsubstrat

| Felt | Vurdering |
|---|---|
| Type | Primærkilde + forskning |
| Bruk | Legal/safety gate for `CL-A-021` |
| Styrker | Mattilsynet/EU-kilder viser at insekt-PAP kan være lovlig i fôr til fisk/svin/fjørfe under vilkår, men substratreglene er stramme; EFSA og fagartikler støtter casevis risikovurdering |
| Kritisk svakhet | Mange attraktive sirkulære substrater, som kjøkken-/matavfall, gjødsel, slam, catering waste og fiskeslam, er forbudt eller uavklart |
| Status | legal gate; needs-primary-check for konkrete substrater |
| Masterbruk | Ikke løft `CL-A-021` før grønn/gul/rød substratliste og demand-side er bekreftet |

### SRC-A-016 / EV-A-020 - EUMOFA fishmeal and fish oil 2025

| Felt | Vurdering |
|---|---|
| Type | Benchmark / sekundær markedsrapport |
| Bruk | Global/EU fiskemel- og fiskeoljekontekst |
| Styrker | Setter norsk import i global akvakultur- og EU/Danmark-kontekst |
| Kritisk svakhet | Ikke norsk importserie, ikke norsk aktørfordeling, ikke leverandørkjedevalidering |
| Status | benchmark/kontekst |
| Masterbruk | Bruk for kontekst, ikke som norsk baseline alene |

### Hypotesekilder - Axfoundation/Volare/Nordic protein ecosystem

| Felt | Vurdering |
|---|---|
| Type | Hypotese / actor-kandidater / benchmark |
| Bruk | Intervjukø, governance-case, finansierings- og pilotlandskap |
| Styrker | Gir mulige innganger til CL-A-021 og A/B-pilotdesign |
| Kritisk svakhet | Kapasitet, kundestatus, regulatorisk modenhet, funding og overføringsverdi er ikke låst |
| Status | hypotese eller benchmark |
| Masterbruk | Bruk til outreach og workshopspørsmål, ikke som effekt- eller pilotklarhet |

## Claim-effekt

| Claim | Effekt fra 4A | Konfidens etter 4A | Hva styrker | Hva svekker | Anbefalt formulering |
|---|---|---|---|---|---|
| `CL-A-020` | Styrkes som beslutningsrelevant scopingpilot, men snevres inn | Medium | SSB-importserier, Fiskeridir totalfôr, Denofa/Skretting actor-data, NMBU/Foods of Norway FoU, EUDR som sporbarhetsdriver | SPC-metode ulåst; Skretting ikke bransjeproxy; Denofa ikke SPC/akvakulturandel; FoU ikke kommersiell skala; systemgrenser blandes lett | "Encelle-/gjærprotein er et relevant scoping- og importsubstitusjonsspor for oppdrettsfôr der modenhet, kost, LCA, råvaretilgang, regulatorisk vei og aktørdata bekreftes." |
| `CL-A-021` | Nyanseres og holdes tilbake | Lav, mulig Medium etter substratgate | Mattilsynet/EU viser at insekt-PAP kan ha lovlig sluttbruk under vilkår; fagkilder støtter casevis risikodesign; A/B-koblingen er strategisk god | Substratregler er stramme; flere attraktive strømmer er forbudt/uavklart; Volare/andre aktører og kjøperkrav er ikke validert | "Insektprotein på godkjente nordiske sidestrømmer er en A/B-kandidat bare etter juridisk substratgate, risikovurdering, actor-kapasitet og demand-side." |
| `CL-C-011` | Styrkes hvis EU/Norge holdes adskilt | Høy for EU-scope/frister; Medium for norsk/praktisk actor-effekt | EU-kilder dekker soya og frister; norske høringer viser delvis innlemmelse; Landbruksdirektoratet peker på DDS/Traces-praksis | Endelig norsk rettsstatus og varekoder er ikke lukket; SPC/prepared feed kan ikke antas; kundekrav må aktørvalideres | "EUDR gjør soya til EU-rettslig sporbarhets- og compliance-tema; for norske fôr-/soyaaktører må praktisk betydning beskrives som EU-markeds-, kunde- og dokumentasjonsrisiko til norsk/EØS-status og varekoder er avklart." |

## Interessante funn

1. SSB `1201`-serien og Denofas ca. 450 000 tonn/år er nær nok til å invitere til sammenligning, men metodisk ulike nok til at sammenligning uten forklaring blir misvisende.
2. `21061002` for proteinkonsentrater til fiskefôr er for liten og ikke soyaspesifikk; nasjonalt SPC-volum må sannsynligvis finnes gjennom fôraktører, ikke SSB alene.
3. `23099040` er stor og opprinnelseslandene Brasil/Russland/Storbritannia gjør serien interessant, men den må ikke kalles SPC, laksefôr eller fôrforbruk uten metode.
4. EUDR virker som sterkere datakrav enn volumdriver: den kan gjøre sporbarhet, geolokasjon, sertifisering og leverandørdata til praktiske gates selv om norsk soya ikke er foreslått innlemmet.
5. Skretting er mer verdifull som "datamal" enn som tallproxy. Rapporten viser nøyaktig hvilke felt master bør kreve fra BioMar, Cargill, Mowi Feed og Sjømat Norge.
6. Insektsporet er strategisk elegant fordi det kobler A/B/C, men det juridiske substratfilteret kan gjøre det mindre operativt enn en renere B- eller C-pilot hvis Mattilsynet-svaret blir smalt.

## Røde flagg

| Rødt flagg | Hvorfor det er farlig | Anbefalt håndtering |
|---|---|---|
| "Norge importerer/bruker 550-600 000 tonn soya" | L4-total er avvist; blander kilder og definisjoner | Bruk SSB per varekode og Denofa separat |
| "Denofa = norsk soyaimport = laksefôr" | Denofa er actor-case for soyabønner/prosessering, ikke SPC eller akvakulturandel | Be Denofa om produktutbytte og kundesplitt |
| "Skretting = norsk bransjesnitt" | Skretting er én aktør | Bruk som benchmark til flere fôraktører svarer |
| "`210610` = SPC" | Koden er ikke soyaspesifikk | Send til SSB/Tolletaten/fôraktører |
| "`23099040` = norsk laksefôrvolum" | Dette er import av prepared fish feed, ikke total omsetning eller artsspesifikk forbruk | Skill fra Fiskeridirektoratet/Sjømat Norge totalfôr |
| "EUDR gjelder direkte for norsk soyaimport" | Norsk høringsgrunnlag sier delvis EØS-innlemmelse og ingen soya-varetyper | Skriv EU-scope og norsk status separat |
| "Sertifisert soya = EUDR-klar" | Sertifisering er ikke automatisk geolokalisert due diligence | Spør aktører om geolokasjon, batch, DD statement og kundekrav |
| "Insektprotein kan bruke matavfall/slam nå" | Mattilsynet peker på forbud/uavklarte utviklingsspor | Krev grønn/gul/rød substratgate før pilotclaim |

## Uttaksbudskap

### Trygge formuleringer nå

1. "SSB 08801 gir en offisiell importbaseline for soyabønner, soyabønnemel, soyaolje, soyakaker/reststoff, fiskemel og prepared fish feed, men sier ikke hvordan råvarene brukes i norsk fôr."
2. "Fiskeridirektoratet/Sjømat Norge oppgir 2 185 945 tonn omsatt fôr i norsk oppdrettsnæring i 2024; dette er total oppdrettsfôr, ikke råvarefordeling."
3. "Denofa og Skretting gir nyttige actor-data for soya og fôrsammensetning, men de skal ikke brukes som bransjeproxy uten kryssjekk."
4. "EUDR gjør soya til et EU-sporbarhets- og compliance-tema; norsk/EØS-status og praktiske krav for norske aktører må formuleres separat."
5. "Alternative proteiner er relevante fordi import- og fôrvolumene er store, men pilotvalg må fortsatt passere modenhet, kost, LCA, regulatorikk og demand-side."

### Formuleringer som må unngås

1. "Norsk laksefôr bruker X tonn soya" uten arts-/fôraktørdata.
2. "SPC-importen kan leses direkte fra SSB."
3. "Prepared fish feed-importen er lik norsk fôrforbruk."
4. "EUDR gjør norsk soyaimport ulovlig/pliktsatt på samme måte som i EU."
5. "Insektprotein på sidestrømmer er pilotklart" uten konkret lovlig substrat, risikoanalyse, aktørkapasitet og kjøper.

## Anbefaling til master

1. Integrer 4A som en metode- og datagate, ikke som nytt pilotløfte. A-sporet bør være et hovedspor, men med `CL-A-020` som scopingpilot og `CL-A-021` som kandidat etter substratgate.
2. Bruk fire adskilte datalag i decision memo: SSB/HS import, Fiskeridirektoratet totalfôr, actor-data fra Denofa/Skretting, og EUDR/compliance. Ikke summer eller oversett på tvers uten metode.
3. Prioriter P1-avklaringer i denne rekkefølgen: Landbruksdirektoratet/Miljødirektoratet for EUDR/varekoder/Traces; SSB/Tolletaten for `210610` og `23099040`; Skretting/Denofa/Sjømat Norge for actor- og bransjedata; NMBU/Foods of Norway for teknisk modenhet.
4. Hold `CL-C-011` som høyverdi adoption/compliance-claim, men skriv norsk status med dato og forbehold: høringsgrunnlaget peker på delvis EØS-innlemmelse og ingen soya-varetyper i norsk virkeområde.
5. Ikke la A-sporet konkurrere mot B-sporet på "mest volum". Det sterkeste A-bidraget nå er å tvinge fram datadisiplin, sporbarhet og kjøperkrav som også styrker B/C.

