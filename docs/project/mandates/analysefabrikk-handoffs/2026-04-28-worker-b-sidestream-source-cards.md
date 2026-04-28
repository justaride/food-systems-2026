# Worker handoff - B-sidestream: matsvinn, sidestrømmer og næringsstoffløkker

## 1. Scope

- Tildelt batch: Worker B / B-sidestream.
- Filer lest:
  - `docs/project/mandates/analysefabrikk-food-tg-arbeidsprosess-2026-04-28.md`
  - `docs/project/mandates/underlagsgjennomgang-food-tg-2026-04-28.md`
  - `docs/project/mandates/track-brief-b-sidestreams-nutrients.md`
  - `docs/project/mandates/claim-register-food-tg.md`
  - `docs/project/mandates/evidence-matrix-food-tg.md`
  - `research/norden/verdikjede/06-matsvinn-sirkulaer.md`
  - `research/bibliotek/sirkularitet/nordisk-matsvinn-rapport-2024.md`
  - `research/evidence-pack/offentlig/matsvinnutvalget-2024.pdf`
  - `research/bibliotek/sirkularitet/matsvinn-tidsserier-norden.md`
  - `research/bibliotek/akademia/masteroppgaver/albizzati-phd-2021.md`
  - `research/bibliotek/akademia/masteroppgaver/eriksson-phd-2015.md`
  - `research/bibliotek/akademia/pubmed/javourez-u-2021-waste-to-nutrition-a-review.md`
  - `research/bibliotek/akademia/pubmed/stoknes-k-2016-efficiency-of-a-novel-food.md`
  - `research/bibliotek/akademia/pubmed/falch-e-2026-maximizing-the-utilization-of-seafood.md`
- Filer ikke funnet: ingen i tildelt scope. Merk at `Stoknes` og `Falch`-kortene peker på `metadata_only`, ikke lokal fulltekst.
- Arbeidstype: source-card + claim-effekt + pilotspørsmål. Canonical dokumenter er ikke redigert.

## 2. Kort konklusjon

1. `CL-B-022` er sterkere enn de andre B-pilotene for første lavterskel/adoption-test: Eriksson, Albizzati, Nordisk ministerråd og Matsvinnutvalget støtter butikk/HORECA-retning med forebygging, redistribusjon, nedprising, donasjon, data og rutiner.
2. `CL-B-021` er faglig riktig som kaskade-/høyverdi-hypotese, men scoped kilder gir ikke konkrete prosess-sidestrømvolum. Okara eller tilsvarende batchstrøm må fortsatt aktørvalideres før pilotprioritering.
3. `CL-B-023` og `CL-B-016` blir ikke validert av denne batchen. Stoknes styrker ideen om næringsstoffløkke som konseptbevis, men RecoLab/Helsingborg krever fortsatt primærdata for tilkobling, N/P/K, sluttprodukter, regulatorisk status og overførbarhet.
4. Matsvinnutvalget bør løftes inn som ny sterk B/C-kilde. Rapporten gir norske tiltak, virkemidler, modellert effekt, datakrav og policyspørsmål som er mer beslutningsnært enn de interne nordiske syntesene.
5. Det er tallkonflikter mellom `06-matsvinn-sirkulaer.md`, `matsvinn-tidsserier-norden.md` og Matsvinnutvalget/Matvett-baserte tall. Master bør ikke bruke nøyaktige nordiske per-capita- eller sektorfordelingstall eksternt uten primærkildesjekk.
6. Hovednyansen for Spor B: beste argument er ikke "mest tonn", men "kvalitetsstyrt kaskade": renhet, tid, temperatur, proveniens, trygg sluttbruk, demand-side og rapporterbar KPI avgjør om en strøm kan flyttes opp fra biogass/restavfall.

## 3. Source cards / triage rows

### SRC-B-001 - Nordisk komparativ analyse: matsvinn og sirkulær økonomi

| Felt | Verdi |
|---|---|
| Filsti | `research/norden/verdikjede/06-matsvinn-sirkulaer.md` |
| Arkivlag | L3 |
| Spor | B/C/policy/baseline |
| Kildetype | intern syntese |
| Relevansscore | 5 |
| Evidensscore | 2 |
| Siterbarhet | Medium internt, Lav eksternt for tall |
| Status | needs-primary-check |
| Neste handling | Bruk som navigasjon og nordisk struktur; primærkildesjekk alle tall/lovpåstander før EV-/claim-oppgradering. |

Beslutningsfunn:
1. Godt komparativt kart over matsvinn, biogass, redistribusjon, panteordninger, policy og aktører i Norden.
2. Understøtter at virkemidler må skille mellom land, ledd og definisjon: Norge/Matvett måler ikke nødvendigvis det samme som Eurostat/Danmark/Sverige.
3. Har nyttige aktør- og casekandidater: Matsentralen, Too Good To Go, NORSUS, LUKE, biogassaktører, NAPKIN.

Claim-effekt:

| Claim | Effekt | Begrunnelse |
|---|---|---|
| CL-B-001 | styrker/nyanserer | Støtter ulik fordeling mellom land og ledd, men tall må primærkildesjekkes. |
| CL-B-002 | styrker/nyanserer | Husholdninger fremstår sentralt, men nasjonale måledefinisjoner varierer. |
| CL-B-022 | styrker | Butikk/HORECA og redistribusjon/nedprising fremstår som operativt pilotfelt. |
| CL-C-015 | nyanserer | KPI-er må ta høyde for ulike definisjoner og rapporteringsregimer. |

Uttrekk:

| Type | Uttrekk | Bruk |
|---|---|---|
| Tall | Norden anslås i dokumentet til 3,5-4 mill. tonn mat årlig; Norge oppgis til ca. 407 100 tonn i 2024 og 73,4 kg/innbygger. | Kun internt inntil primærkilde låses. |
| Case | Too Good To Go, Matsentralen, biogasskapasitet, pantesystemer, NAPKIN. | Aktør-/casekø. |
| Usikkerhet | Dokumentet blander Matvett, Eurostat og nasjonale metoder; `matsvinn-tidsserier-norden.md` har avvikende Danmark/Norge-tall. | Primærkildesjekk. |

### SRC-B-002 - Empowering Effective Food Waste Solutions in the Nordic Region

| Felt | Verdi |
|---|---|
| Filsti | `research/bibliotek/sirkularitet/nordisk-matsvinn-rapport-2024.md` |
| Arkivlag | L2 |
| Spor | B/policy |
| Kildetype | sekundær rapport |
| Relevansscore | 4 |
| Evidensscore | 4 |
| Siterbarhet | Høy/Medium |
| Status | source-card |
| Neste handling | Bruk til nordisk policy- og tiltakskontekst; gå til PDF/rapport for sidetall før ekstern sitering. |

Beslutningsfunn:
1. Nordisk rapport peker på at reduksjon mot SDG 12.3 ikke går raskt nok.
2. Husholdninger beskrives som største og vanskeligste kilde i nordisk kontekst.
3. Rapporten støtter kombinerte virkemidler: atferd, teknologi, regulering og verdikjedesamarbeid.

Claim-effekt:

| Claim | Effekt | Begrunnelse |
|---|---|---|
| CL-B-002 | styrker | Direkte støtte for husholdninger som krevende matsvinnkilde og behov for virkemiddelmiks. |
| CL-B-022 | styrker | Butikk/HORECA-pilot bør kobles til forbruker- og verdikjedeeffekt, ikke bare butikkdrift. |
| CL-C-014 | styrker | Reduksjon krever praksis og samarbeid, ikke ett teknologitiltak. |

Uttrekk:

| Type | Uttrekk | Bruk |
|---|---|---|
| Tall | Rapportkortet oppgir ca. 10 % reduksjon 2015-2020 mot 15 % mål. | Bruk etter PDF-sjekk. |
| KPI | Harmonisert måling og rapportering. | KPI-/datakrav i pilot B2. |
| Usikkerhet | Ikke detaljert nok for norske pilotvolum. | Ikke bruk til volumclaim. |

### SRC-B-014-kandidat - Matsvinnutvalgets rapport 2023 / matsvinnutvalget-2024.pdf

| Felt | Verdi |
|---|---|
| Filsti | `research/evidence-pack/offentlig/matsvinnutvalget-2024.pdf` |
| Arkivlag | L1/L5 |
| Spor | B/C/policy/baseline |
| Kildetype | offentlig primær-/utvalgsrapport |
| Relevansscore | 5 |
| Evidensscore | 5 |
| Siterbarhet | Høy |
| Status | source-card; utvalgte sider tekstsjekket |
| Neste handling | Løft til shortlist/evidence matrix som ny B/C-kilde, foreslått EV-B-014 eller EV-C/B-policy. Sjekk endelig tittel/år og bruk PDF-sidetall ved ekstern sitering. |

Beslutningsfunn:
1. Rapporten anbefaler ikke én separat matkastelov, men flere regulatoriske og avtalebaserte bestemmelser: aktsomhetskrav, redegjørelse, matsvinnplan, donasjon, nedprising, rapportering, SSB-rolle, offentlige anskaffelser og kompetanse.
2. Rapporten er sterkest for `CL-B-022` og `CL-C-015`: den gjør butikk/servering/offentlig sektor til et styrings- og rapporteringsspørsmål med konkrete tiltak.
3. Den gir tallfestede, men usikre modellanslag for tiltakspotensial. Disse bør brukes som beslutningskontekst, ikke som sikre effektløfter.
4. Den peker på at nåværende reduksjonstakt bare gir ca. 25 % reduksjon innen 2030 hvis utviklingen fortsetter, altså ikke halvering.
5. Rapporten gjør datakvalitet og rapporteringssystemer til en forutsetning for styring: standardisert rapportering, SSB-rolle og harmonisering med EU-begreper.

Claim-effekt:

| Claim | Effekt | Begrunnelse |
|---|---|---|
| CL-B-001 | styrker | Støtter verdikjede- og sektoravhengig virkemiddelbruk. |
| CL-B-002 | styrker/nyanserer | Husholdninger er store, men tiltak må gå via aktører, offentlig sektor og forbrukerintervensjoner. |
| CL-B-008 | styrker | Ressurspyramide/donasjon/nedprising støtter høyere verdi før avfall. |
| CL-B-022 | styrker sterkt | Gir konkrete tiltak for butikk/servering: nedprising, donasjon, rapportering, matvert, goodiebag, datadeling, kompetanse. |
| CL-C-015 | styrker | Standardisert rapportering og KPI-er er eksplisitt beslutningslogikk. |
| Ny claim | kandidat | Norsk virkemiddelpakke for matsvinn bør behandles som adoption-/policy-evidens, ikke bare bakgrunn. |

Uttrekk:

| Type | Uttrekk | Bruk |
|---|---|---|
| Tall | Kartlagt matsvinn i Norge 2021: 450 000 tonn; samlet tiltakspotensial anslått til 340 000 tonn / 75 % av kartlagt matsvinn, med usikkerhet og dobbelttellingsrisiko. PDF-side 10 og 48. | Beslutningskontekst; ikke ekstern effektpåstand uten kontekst. |
| Tall | 453 650 tonn spiselig mat endte som avfall i 2020; ca. 10 % lavere enn 2015; fem av åtte sektorer nådde 15 %-målet, matindustri og husholdning ligger lengst bak. PDF-side 27. | Baseline etter primærkontroll mot hovedrapport. |
| Tall | Nåværende reduksjonstakt estimeres til ca. 25 % reduksjon innen 2030, ikke 50 %. PDF-side 29. | Sterk urgency-kontekst. |
| Tall | Mat donert fra verdikjeden i 2022: 5 500 tonn, ca. 300 % økning siden 2017; åtte matsentraler. PDF-side 26. | Case/KPI for redistribusjon. |
| KPI | Anbefaler økt/standardisert rapportering i bransjeavtalen, SSB-rolle og harmonisering med EU-begreper. PDF-side 57-58 og 103-105. | Pilotdesign og roadmap-måling. |
| KPI | Vedlegg 1 angir modellert potensial: aktsomhetskrav 68 406 tonn, matsvinnplan 11 888, rapportering 12 215, donasjonsplikt 20 630, donasjon butikk/servering 9 727, nedprising 14 432. PDF-side 125 ff. | Prioriteringsgrunnlag, men usikkerhetsmerket. |
| Regulering | Donasjonsplikt og nedprising anbefales utredet/hjemlet, men innretning og omfang må videre utredes. PDF-side 96-102. | Valideringsspørsmål til myndigheter/Mattilsynet. |
| Usikkerhet | Mange potensialanslag har lav eller middels sikkerhet; rapporten advarer om dobbelttelling. | Ikke overselg effekt. |

### SRC-B-003 - Matsvinn tidsserier Norden 2015-2024

| Felt | Verdi |
|---|---|
| Filsti | `research/bibliotek/sirkularitet/matsvinn-tidsserier-norden.md` |
| Arkivlag | L2/L3-kompilat |
| Spor | B/baseline |
| Kildetype | sekundær/data-kompilat |
| Relevansscore | 4 |
| Evidensscore | 2 |
| Siterbarhet | Lav/Medium |
| Status | needs-primary-check |
| Neste handling | Bruk til å peke på nødvendige primærkilder, ikke som selvstendig tallgrunnlag. |

Beslutningsfunn:
1. Gir enkel tidsserie for norsk matsvinn og nordisk per-capita-tabell.
2. Nyttig for å identifisere sektor-KPI-er, men tallene bør ikke løftes eksternt uten Matvett/SSB/Eurostat/Naturvårdsverket-sjekk.
3. Avviker fra `06-matsvinn-sirkulaer.md` for enkelte land/ledd, særlig Danmark per capita og norske sektorfordelinger.

Claim-effekt:

| Claim | Effekt | Begrunnelse |
|---|---|---|
| CL-B-001 | nyanserer/svekker tallbruk | Støtter sektorlogikk, men svekker tryggheten i nøyaktige sammenligningstall. |
| CL-B-002 | styrker med forbehold | Husholdning fremstår stort, men absolutte tall må sjekkes. |
| CL-C-015 | styrker | Viser behov for konsistent datadefinisjon og rapportering. |

Uttrekk:

| Type | Uttrekk | Bruk |
|---|---|---|
| Tall | Norge 2024: total 407 100 tonn; husholdning 215 000; matindustri 80 000; dagligvare 50 000; storhusholdning 35 000. | Kun etter primærsjekk. |
| Tall | Per-capita-tabellen oppgir Danmark på 74 kg i 2024, mens `06` oppgir 254 kg. | Rødt flagg for definisjonsforskjell eller feil. |
| KPI | Sektorvise reduksjoner per capita fra 2015-baseline. | Kandidat til intern KPI-struktur, ikke eksternt tall. |

### SRC-B-005 - Albizzati PhD 2021: Sustainability Assessment of Food Waste Management

| Felt | Verdi |
|---|---|
| Filsti | `research/bibliotek/akademia/masteroppgaver/albizzati-phd-2021.md` |
| Arkivlag | L1 |
| Spor | B/policy |
| Kildetype | PhD / LCA |
| Relevansscore | 5 |
| Evidensscore | 4 |
| Siterbarhet | Høy etter fulltekst/sidetall |
| Status | source-card |
| Neste handling | Bruk som faglig kaskadeanker; sjekk original/fulltekst for presise formuleringer. |

Beslutningsfunn:
1. 21 matsvinnshåndteringsveier vurdert med LCA.
2. Forebygging først; deretter redistribusjon/donasjon og dyrefôr som ofte bedre enn biogass, kompostering, forbrenning og deponi.
3. LCA-rangering er fraksjons- og systemgrensefølsom.

Claim-effekt:

| Claim | Effekt | Begrunnelse |
|---|---|---|
| CL-B-008 | styrker sterkt | Faglig hovedanker for kaskadeprioritering. |
| CL-B-021 | styrker/nyanserer | Støtter "høyere verdi før biogass", men ikke en bestemt prosess-strøm. |
| CL-B-022 | styrker | Underbygger redistribusjon før restbehandling. |

Uttrekk:

| Type | Uttrekk | Bruk |
|---|---|---|
| KPI | Miljøresultat per håndteringsvei/fraksjon. | Pilot bør måle substitusjon og fraksjon, ikke bare tonn. |
| Usikkerhet | Lokale energisystemer, substitusjonsantakelser og fraksjonstype kan endre rangering. | Claim må ha forbehold. |

### SRC-B-004 - Eriksson PhD 2015: Supermarket food waste

| Felt | Verdi |
|---|---|
| Filsti | `research/bibliotek/akademia/masteroppgaver/eriksson-phd-2015.md` |
| Arkivlag | L1 |
| Spor | B/C |
| Kildetype | PhD / empirisk studie |
| Relevansscore | 5 |
| Evidensscore | 4 |
| Siterbarhet | Høy etter fulltekst/sidetall |
| Status | source-card |
| Neste handling | Bruk for butikkpilotdesign; sjekk fulltekst for kategoriandel og metodikk før tallbruk. |

Beslutningsfunn:
1. Kvantitativ kartlegging i seks svenske supermarkeder.
2. Ferskvarer som frukt/grønt, brød og kjøtt dominerer økonomisk og miljømessig tap.
3. Støtter forebygging først, deretter donasjon og biogass for restfraksjoner.

Claim-effekt:

| Claim | Effekt | Begrunnelse |
|---|---|---|
| CL-B-022 | styrker sterkt | Direkte relevant for butikkpilot: ferskvarer, rutiner, redistribusjon og restfraksjoner. |
| CL-B-008 | styrker | Praktisk støtte til kaskade i butikk. |
| CL-C-014 | styrker | Viser at drift og rutiner avgjør svinn, ikke bare policy. |

Uttrekk:

| Type | Uttrekk | Bruk |
|---|---|---|
| Case | Seks svenske supermarkeder med veiing/kategorisering. | Metodikk for norsk butikk/HORECA-kartlegging. |
| Usikkerhet | Eldre svensk empiri; overføring til Norge krever kontekst. | Valider med Matvett/dagligvare. |

### SRC-B-006 - Javourez et al. 2021: Waste-to-nutrition

| Felt | Verdi |
|---|---|
| Filsti | `research/bibliotek/akademia/pubmed/javourez-u-2021-waste-to-nutrition-a-review.md` |
| Arkivlag | L2 |
| Spor | B/A-feed |
| Kildetype | fagfellevurdert review |
| Relevansscore | 5 |
| Evidensscore | 4 |
| Siterbarhet | Høy etter PDF-sidetall |
| Status | source-card |
| Neste handling | Bruk som teknologikart; sjekk lokal PDF for sidetall før ekstern bruk. |

Beslutningsfunn:
1. Reviewen dekker over 950 kilder og mer enn 150 innsatsfaktorer i 10 kategorier.
2. Den strukturerer waste-to-nutrition i fire byggeklosser og åtte hovedfamilier.
3. Den er særlig sterk på å vise at biologisk mulighet ikke er nok: sikkerhet, regelverk, prosesskompleksitet, lukt/smak og aksept er sentrale barrierer.

Claim-effekt:

| Claim | Effekt | Begrunnelse |
|---|---|---|
| CL-B-009 | styrker sterkt | Direkte støtte for sikkerhets-, prosess- og regelverkskrav. |
| CL-B-021 | styrker/nyanserer | Støtter ren prosess-sidestrøm som mulig pilotkategori, men ikke spesifikt okara/volum. |
| CL-A-021 | styrker/nyanserer | Relevant for insekt-/fôrspor, men krever substratspesifikk lovlighet. |

Uttrekk:

| Type | Uttrekk | Bruk |
|---|---|---|
| KPI | Substratdata: renhet, kontaminanter, næringsprofil, prosesstrinn, sluttprodukt og aksept. | Minimumskrav for B1-pilot. |
| Usikkerhet | Reviewen rangerer ikke én nordisk beste rute og beviser ikke lønnsomhet. | Ikke bruk som skaleringsbevis. |

### SRC-B-008 - Stoknes et al. 2016: Food-to-waste-to-food

| Felt | Verdi |
|---|---|
| Filsti | `research/bibliotek/akademia/pubmed/stoknes-k-2016-efficiency-of-a-novel-food.md` |
| Arkivlag | L1/L2 metadata |
| Spor | B |
| Kildetype | primær studie, men lokalt metadata-only |
| Relevansscore | 5 |
| Evidensscore | 3 |
| Siterbarhet | Medium inntil fulltekst |
| Status | needs-primary-check |
| Neste handling | Skaff/fulltekstles artikkel før citation-ready og før konkrete tall brukes eksternt. |

Beslutningsfunn:
1. Norsk/nordisk demonstrasjonscase der matavfall kobles til biogass, digestat, CO2/energi og ny matproduksjon.
2. Kortet oppgir 80 % lavere energibehov enn konvensjonelt drivhus og kommersiell avling på digestatbasert dyrking.
3. Caset er konseptbevis, ikke bevis for storskala økonomi, regulatorisk aksept eller RecoLab-overførbarhet.

Claim-effekt:

| Claim | Effekt | Begrunnelse |
|---|---|---|
| CL-B-011 | styrker | Støtter food-to-waste-to-food som demonstrert konsept. |
| CL-B-023 | styrker/nyanserer | Støtter næringsløkke som idé, men ikke svartvann/Recolab-data. |
| CL-B-016 | ikke egnet | Sier ikke noe direkte om RecoLab/Helsingborg. |

Uttrekk:

| Type | Uttrekk | Bruk |
|---|---|---|
| Case | Lindum/Drammen-tilknyttet pilot med biogass, digestat og drivhus. | Illustrerende case for B3, ikke pilotbevis. |
| Tall | 80 % lavere energibehov oppgitt i kortet. | Må fulltekstsjekkes. |
| Usikkerhet | Metadata-only i repo. | Ikke eksternt tall uten fulltekst. |

### SRC-B-007 - Falch & Jensen 2026: Maximizing seafood utilization

| Felt | Verdi |
|---|---|
| Filsti | `research/bibliotek/akademia/pubmed/falch-e-2026-maximizing-the-utilization-of-seafood.md` |
| Arkivlag | L2 metadata |
| Spor | B/A-feed |
| Kildetype | review/oversiktskapittel, lokalt metadata-only |
| Relevansscore | 4 |
| Evidensscore | 3 |
| Siterbarhet | Medium inntil fulltekst |
| Status | needs-primary-check |
| Neste handling | Fulltekstles før master bruker konkrete teknologi-, volum- eller markedspåstander. |

Beslutningsfunn:
1. Støtter at sjømat-sidestrømmer kan oppgraderes til proteiner, marine lipider, peptider, kollagen og andre høyverdiressurser.
2. Underbygger skiftet fra avfallshåndtering til ressursoptimalisering.
3. Er ikke et lokalt pilotregnskap og mangler konkrete nordiske volum/aktørdata i MD-kortet.

Claim-effekt:

| Claim | Effekt | Begrunnelse |
|---|---|---|
| CL-B-009 | styrker/nyanserer | Høyverdi krever teknologi, regulatorikk og aksept. |
| CL-B-021 | nyanserer | Prosess-sidestrøm bør ikke begrenses til okara; sjømat kan være høyverdi, men krever data. |
| Ny claim | kandidat | Sjømat-sidestrømmer bør vurderes som egen B/A-bro, ikke bare biogass/fôr. |

Uttrekk:

| Type | Uttrekk | Bruk |
|---|---|---|
| Case/KPI | Høyverdiutnyttelse av marine restråstoff: funksjon, stabilitet, markedskanal, regulatorikk. | Kandidat til bredere B1-spørsmål. |
| Usikkerhet | Metadata-only; ingen konkrete volum. | Må sjekkes først. |

## 4. B-claims som styrkes/svekkes/nyanseres

| Claim | Effekt | Master-notat |
|---|---|---|
| CL-B-001 | styrker/nyanserer | Sterkt som strukturclaim. Må omskrives med tydelig forbehold om definisjoner og primærdata hvis tall brukes. |
| CL-B-002 | styrker | Nordisk rapport og Matsvinnutvalget støtter husholdninger som stor/vanskelig kilde. Nyansen er at pilotintervensjoner ofte må gå via butikk, servering, offentlig sektor og forbrukernære rutiner. |
| CL-B-008 | styrker | Albizzati + Eriksson + Matsvinnutvalget støtter kaskade: forebygging, redistribusjon/donasjon, fôr/høyverdi før biogass og lavere behandling. Behold fraksjonsforbehold. |
| CL-B-009 | styrker | Javourez og Falch styrker at høyverdi krever sikkerhet, prosess, regulatorikk og aksept. |
| CL-B-011 | styrker/nyanserer | Stoknes styrker konseptbeviset, men metadata-only og casebasert. Ikke bruk som skalaøkonomi eller regulatorisk bevis. |
| CL-B-014 | nyanserer/svekker operasjonelt | Scope gir ikke direkte okara-/plantebatch-volum. Behold Lav konfidens; aktørdata er fortsatt gate. |
| CL-B-016 | svekker/ikke styrket | Ingen scoped primærkilde validerer RecoLab/Helsingborg. Stoknes er ikke RecoLab. Hold Lav og `needs-actor-validation`. |
| CL-B-021 | styrker konseptuelt, ikke datamessig | Kaskade og waste-to-nutrition støtter pilotideen, men konkret strøm, volum, holdbarhet, lovlig sluttbruk og kjøper må sjekkes først. |
| CL-B-022 | styrker sterkt | Best dokumenterte B-pilot i batchen. Kilder støtter butikk/HORECA med ferskvarer, redistribusjon, nedprising, donasjon, rapportering og rutineendring. |
| CL-B-023 | styrker konseptuelt, ikke RecoLab-spesifikt | Stoknes + biogass/næringsloop-logikk støtter benchmarkspørsmål, men ikke første pilot uten primærdata. |
| CL-C-014 | styrker | Eriksson/Matsvinnutvalget peker på rutiner, sortering, matvert, goodiebag, rapportering og butikkdrift. |
| CL-C-015 | styrker | Matsvinnutvalget og tidsserieproblemet viser at KPI-er må forankres i faktisk rapportering og definisjoner. |

## 5. Pilotspørsmål

### Pilot B1 - ren prosess-sidestrøm før biogass/lavverdi

1. Hvilken konkret strøm finnes: okara, bryggerimask, potetskrell, sjømatrestråstoff eller annen batchstrøm?
2. Hva er månedlig/årlig volum, batchstørrelse, sesongvariasjon og historisk stabilitet?
3. Hvilken kvalitet måles i dag: tørrstoff, protein/fett/fiber, vannaktivitet, pH, salt, allergener, mikrobiologi, tungmetaller, fremmedstoffer?
4. Når i prosessen oppstår strømmen, og hvor lenge er den ren før blanding, temperaturtap eller transport gjør den lavere verdt?
5. Hva er dagens destinasjon og økonomi: internt gjenbruk, dyrefôr, biogass, avfall, betaling/mottaksgebyr, kontraktsbinding?
6. Hvilken lovlig sluttbruk er realistisk: mat/ingrediens, fôr, insekt-substrat, fermentering, biogass/digestat?
7. Hvem er demand-side-kjøperen, og hvilke spesifikasjoner, volumterskler og dokumentasjon krever de?
8. Hvilke investeringer trengs for kjøling, separasjon, hygienisk lagring, emballering eller transport?
9. Hvilken KPI avgjør go/no-go: andel til høyere verdi, kg N/protein reddet, tonn CO2e unngått, netto verdi per tonn, eller reduksjon i lavverdiavsetning?
10. Hva er "beste fallback" hvis mat/ingrediens feiler: fôr/insekt, biogass med digestat, eller annen kaskade?

### Pilot B2 - matsvinnkvalitet i butikk/HORECA

1. Hvilke ferskvarekategorier mister mest verdi i butikk/HORECA: frukt/grønt, brød, kjøtt/fisk, meieri, buffet/tallerken, ferdigmat?
2. Hvor går grensen mellom nedprising, donasjon, personalmat, Too Good To Go, biogass og restavfall i dag?
3. Hvilke tidsvinduer avgjør redistribusjonsverdi: timer til utløp, temperaturhistorikk, åpnet/ikke åpnet emballasje, cut-off for henting?
4. Hvilke operative rutiner kan endres raskt: varetrykk, prognose, STAND/holdbarhetsfordeling, datomerking, nedprisingslogikk, henting, goodiebag?
5. Hvilke data finnes allerede i POS/ERP/avfallsavtale: volum, varegruppe, dato, prisavslag, donert mengde, årsak, temperatur, destinasjon?
6. Kan Matvett/Too Good To Go/dagligvare eller HORECA-partner dokumentere baseline og måle endring over 4-8 uker?
7. Hva er KPI: kg unngått svinn, andel redistribuert, andel solgt nedpriset, kroner reddet, måltider donert, restfraksjon per omsatt kg, kvalitet ved mottak?
8. Hvilke mattrygghets- og ansvarsbarrierer stopper donasjon i praksis?
9. Påvirker tiltaket forbrukerleddet eller flytter det bare svinn mellom ledd?
10. Hvilken driftsaktør eier endringen etter pilot: butikksjef, kjøkkensjef, kategori, logistikk, avfallsleverandør eller matsentral?

### Pilot B3 - svartvann, biorest og næringsstoffløkker

1. Hvilken strøm vurderes: svartvann, slam, digestat, biorest, struvit, ammoniumsulfat eller annen næringsfraksjon?
2. Hva er dokumenterte N/P/K-mengder, tørrstoff, kontaminanter, legemiddelrester, mikroplast og hygieniseringsstatus?
3. Hvilke sluttprodukter finnes i dag, og hvilke er lovlige å bruke på matjord, park, grøntareal, drivhus eller annen anvendelse?
4. Hvilken regulatorisk myndighet må avklare sluttbruk: avløp, gjødselvare, Mattilsynet, miljømyndighet, kommune?
5. Finnes det faktisk separering ved kilden, eller blandes strømmen med systemer som gjør næringsgjenvinning vanskelig?
6. Hva er tilkoblingsgrad, befolkning/brukergrunnlag og årlig strømvolum i et RecoLab-/norsk case?
7. Hva er energibalanse, transportbehov, behandlingskost og marked for sluttproduktet?
8. Hvem er kjøper/bruker av næringsproduktet, og hvilken kvalitet/sertifisering kreves?
9. Hvilke akseptbarrierer finnes hos kommune, landbruk, forbruker og mataktør?
10. Er caset egnet som pilot eller bare som benchmark/learning case i første fase?

## 6. Tall, case, KPI og usikkerhet

| Kategori | Funn | Bruk | Usikkerhet |
|---|---|---|---|
| Tall | Matsvinnutvalget: 450 000 tonn kartlagt matsvinn i Norge 2021; tiltakspotensial 340 000 tonn/75 %. | Vise at virkemiddelpakke kan være stor nok til å påvirke roadmap. | Modellert, lav/middels sikkerhet for flere tiltak, risiko for dobbelttelling. |
| Tall | Matsvinnutvalget: 453 650 tonn spiselig matsvinn i 2020; ca. 10 % lavere enn 2015. | Norsk baseline. | Bør sjekkes mot hovedrapport/bransjeavtalen før ekstern bruk. |
| Tall | Matsvinnutvalget: nåværende trend peker mot ca. 25 % reduksjon i 2030, ikke 50 %. | Urgency/why-now. | Basert på rapportens scenario. |
| Tall | Donert mat fra verdikjeden: 5 500 tonn i 2022, ca. +300 % siden 2017. | Redistribusjon som faktisk infrastruktur. | Sjekk mot Matsentralen/rapport før ekstern bruk. |
| Tall | Nedprisingstiltak i Matsvinnutvalget: modellert 14 432 tonn, høy sikkerhet, kort tidshorisont. | B2 pilot-KPI og lavterskel tiltak. | Omfang av regelkrav må utredes. |
| Tall | `06` og `matsvinn-tidsserier` har avvikende per-capita- og sektortall. | Viser behov for datagovernance. | Ikke bruk tall uten primærkilde. |
| Case | Eriksson: seks svenske supermarkeder; ferskvarer dominerer tap. | B2 metodikk. | Eldre/svensk; krever norsk kontekst. |
| Case | Stoknes: food-to-waste-to-food med biogass, digestat og drivhus. | B3 illustrasjon. | Metadata-only; ikke RecoLab. |
| Case | Sjømat-sidestrømmer hos Falch/Jensen. | Utvide B1 fra okara til marine restråstoff. | Metadata-only og ingen volum. |
| KPI | For B1: renhet, batchstabilitet, temperatur, holdbarhet, lovlig sluttbruk, netto verdi, andel oppgradert. | Go/no-go. | Må aktørvalideres. |
| KPI | For B2: kg unngått svinn, andel nedpriset/redistribuert, restfraksjon, måltider donert, kvalitet ved mottak, kroner reddet. | Målbar adoption-pilot. | Datatilgang hos partner må bekreftes. |
| KPI | For B3: N/P/K gjenvunnet, kontaminanter, hygienisering, lovlig sluttbruk, sluttproduktavsetning, aksept. | Næringsløkke benchmark. | RecoLab/norsk anlegg må levere primærdata. |

## 7. Hva master kan integrere nå vs. må sjekke først

### Integrer nå

1. Oppgrader `CL-B-022` som mest moden første B-pilot eller fallback-pilot: kildene støtter butikk/HORECA som konkret, målbart adoption-spor.
2. Legg inn Matsvinnutvalget som ny sterk kilde i source shortlist/evidence matrix, med status `source-card` og sterk siterbarhet for anbefalte virkemidler, rapportering og modellert potensial.
3. Bruk Albizzati + Eriksson + Javourez som kaskade- og designkrav: høyverdi først, men bare med fraksjonsspesifikk LCA, mattrygghet og regelverksgate.
4. Behold `CL-B-021` som pilotkandidat, men formulert som datakrav/gate, ikke som forhåndsvalgt okara-case.
5. Behold `CL-B-023` som benchmark/sekundærpilot, ikke første pilot, inntil RecoLab/norsk anleggsdata foreligger.
6. Bruk rapporterings-/KPI-kravet fra Matsvinnutvalget til å styrke `CL-C-015` og B-pilotdesign.

### Må sjekkes først

1. Alle tall fra `06-matsvinn-sirkulaer.md` og `matsvinn-tidsserier-norden.md`, særlig nordisk per capita, Danmark, norsk sektorfordeling og 2024-tall.
2. Eventuelle påstander om gjeldende norsk Matsvinnlov/status i 2026. Denne batchen har bare sjekket Matsvinnutvalgets anbefalinger i PDF-en, ikke gjeldende lovstatus.
3. Okara/plantebaserte sidestrømvolum, nåværende destinasjon, pris, logistikk og kjøperkrav.
4. Fulltekst for Stoknes 2016 før bruk av 80 %-energitallet eller avlingspåstander.
5. Fulltekst for Falch & Jensen 2026 før sterke sjømat-sidestrømclaims.
6. RecoLab/Helsingborg primærkilder: tilkoblingsgrad, N/P/K, sluttprodukt, regelverk, governance, overførbarhet.
7. Aktørvalidering fra Matvett, Too Good To Go, dagligvare/HORECA, Matsentralen, NMBU, Mattilsynet, avløps-/gjødselmyndigheter og aktuelle produsenter.

## 8. Nye kandidater til masterkø

| Kilde | Hvorfor |
|---|---|
| `research/evidence-pack/offentlig/matsvinnutvalget-2024.pdf` | Bør få egen `SRC-B-014`/EV-rad. Primær norsk beslutningskilde for virkemidler, rapportering, nedprising, donasjon og data. |
| Matsvinnutvalget referanser: Hovedrapport 2020 bransjeavtalen, Matvett/NORSUS kartleggingsrapporter, Miljødirektoratet M-2600 | Trengs for å verifisere tall og definisjoner. |
| RecoLab/Helsingborg/NSVA primærkilder | Nåværende `CL-B-016`/`CL-B-023` står på uvalidert dossier. |
| Fulltekst Stoknes 2016 og Falch & Jensen 2026 | Nødvendig før citation-ready for B3 og sjømat-sidestrømmer. |

## 9. Røde flagg

- Ikke bruk `matsvinn-tidsserier-norden.md` som ekstern tallkilde før primærsjekk. Den har minst ett tydelig avvik mot `06-matsvinn-sirkulaer.md`.
- Ikke marker RecoLab- eller okara-claims som validert. Scope-kildene styrker bare generell retning.
- Ikke bruk Stoknes/Falch som `citation-ready` uten fulltekst.
- Ikke formulér Matsvinnutvalgets modellanslag som sikre effekter; flere tiltak har lav sikkerhet og rapporten advarer om dobbelttelling.
- Ikke la biogass bli implisitt "dårlig". Albizzati/Eriksson støtter høyere verdi først, men biogass/digestat er fortsatt relevant for restfraksjoner og næringsløkker når høyere bruk ikke er trygg eller realistisk.
