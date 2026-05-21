# Datavisualisering: prosjektanalyse 2026-04-29

## Kort konklusjon

Prosjektet har mer strukturerte data enn visualiseringene utnytter i dag. Det beste neste grepet er ikke flere enkeltcharts, men en tydeligere visuell informasjonsarkitektur: hvert hovedområde bør svare på et bestemt beslutningsspørsmål, vise datadekning/proveniens, og bruke samme visuelle grammatikk for status, usikkerhet, land, verdikjedeledd og kildekvalitet.

Sterkest grunnlag akkurat nå:

1. `/forsyningskjede`: beste operative kjerne for flyt, relasjoner og datakvalitet.
2. `/sammenligning`: god nordisk sammenligningsflate, men kan bli mer utforskende og mindre statisk.
3. `/kart/[country]`: sterk geodataflate for butikknett, kommune, infrastruktur og sårbarhet.
4. `/subsidier`: stor datastruktur med klar kart- og fordelingslogikk.
5. `/okonomi`, `/eierskap`, `/styremedlemmer`: gode relasjons- og maktdata, men de bør kobles tettere.
6. `/media` og `/mandat`: gode kandidater for evidens-/claim-visualisering, ikke bare narrativkort.

Svakest som beslutningsvisualisering akkurat nå:

1. `/graf`: teknisk operativ, men for stor og dominert av isolerte selskapsnoder.
2. `/kart/no/flow`: visuelt interessant, men fortsatt illustrativt og Norway-first.
3. Full nordisk Sankey/totalflyt: ikke moden før flowenhet, år, varegruppe og observed/proxy/illustrative-status er harmonisert.

## Datagrunnlag sjekket i denne gjennomgangen

Kommandoer/verifikasjon:

- `npm run db:audit` passerte 2026-04-29.
- Direkte query-pass med `dotenv/config` mot query-laget for forsyningskjede, media og kunnskapsgraf.
- JSON/CSV-pass over `public/data/food-systems/*` og `research/data/nordic/*`.

Nøkkeltall fra DB-audit:

| Område | Antall |
| --- | ---: |
| Totale strukturerte DB-rader i audit | 240 856 |
| Company | 55 438 |
| Subsidy | 179 312 |
| BoardMember | 1 693 |
| PersonProfile | 1 335 |
| Document | 1 163 |
| SourceDoc | 307 |
| CompanyFinancial | 303 |
| Actor | 191 |
| ActorRelationship | 157 |
| Report | 154 |
| CompanyOwnership | 150 |
| BusinessRelationship | 121 |
| CompanyProperty | 120 |

Nøkkeltall fra filer:

| Datasett | Antall |
| --- | ---: |
| Butikker Norge | 3 849 |
| Butikker Sverige | 5 049 |
| Butikker Danmark | 3 869 |
| Butikker Finland | 2 860 |
| Butikker Island | 243 |
| Akvakulturlokaliteter | 1 782 |
| Foredlingsanlegg | 30 |
| Havner | 25 |
| Logistikkhubber | 19 |
| Farm-punkter | 50 |
| `value-chain.json`-ledd totalt | 33 |
| `no/flows.json` flowkanter | 15 |
| Sirkularitetslooper/gap | 62 |
| Næringsstrøm-teknologier | 9 |
| Importpanel, årlig | 216 rader |
| Importpanel, månedlig | 2 471 rader |
| Prisrader | 660 |
| Handelsrader | 1 134 |
| Produksjonsrader | 65 |
| Harmonisert nordisk analysepanel | 1 859 |

## Visualiseringsarkitektur som bør innføres

### 1. Lag en felles visualiseringsmodell

I dag finnes det mange gode komponenter, men de bruker delvis ulike begreper og UI-regler. Innfør en felles kontrakt for alle beslutningscharts:

- `question`: hvilket spørsmål visualiseringen svarer på.
- `unit`: tonn, NOK, prosent, indeks, antall, kg/innbygger.
- `year` / `period`: eksplisitt tidsgrunnlag.
- `geography`: land, kommune, region eller punkt.
- `sourceRefs`: kilder/proveniens.
- `confidence`: høy, middels, lav.
- `evidenceStatus`: observed, estimated, proxy, illustrative.
- `coverage`: hva er inkludert, hva mangler.
- `linkedEntities`: selskaper, aktører, kilder, dokumenter eller claims.

Dette bør ligge i en liten `src/lib/visualization/`-modul, ikke kopieres inn i hver side.

### 2. Skill alltid mellom fire datastatuser

Bruk samme status på tvers av `/forsyningskjede`, `/kart`, `/sirkularitet`, `/media`, `/mandat` og `/graf`:

| Status | Bruk |
| --- | --- |
| `observed` | Direkte observert/importert data, f.eks. leveranser eller registrerte lokasjoner |
| `estimated` | Beregnet på stabil metode |
| `proxy` | Representerer et nærliggende fenomen, men ikke direkte måling |
| `illustrative` | Forklarende modell, ikke beslutningsdata |

Dette er viktig fordi prosjektet blander registerdata, kuraterte relasjoner, kvalitative synteser, proxy-serier og illustrative modeller.

### 3. Bygg beslutningsflater, ikke bare charts

Hver hovedside bør ha samme analyseflyt:

1. Hva er spørsmålet?
2. Hva viser dataen nå?
3. Hvor sterk er datadekningen?
4. Hva er de viktigste outliers/gapene?
5. Hvilke relaterte aktører, kilder og dokumenter bør undersøkes?

## Prioriterte forbedringer

### Prioritet 1: Forsyningskjede som hoved-dashboard for systemflyt

Status: mest moden.

Nåværende styrke:

- Kvalitetsscore 98.
- 60 275 leveranser.
- 30 475 unike produsent-orgnr.
- 121 kuraterte forretningsrelasjoner.
- 100 % kilde- og beskrivelsesdekning på relasjoner.
- BuyerId-gapet er lukket.
- Value-chain-dekning er fortsatt bare 83 % og bør merkes.

Anbefalt visualisering:

- Fane 1: `Primærflyt`: leveranser fra produsent til avtakere, per varegruppe og kommune.
- Fane 2: `Maktrelasjoner`: BusinessRelationship, selvhandel, eierskap og kontraktskoblinger.
- Fane 3: `Import og sårbarhet`: importpanel, core-series, fôrkomposisjon og sjømatinput.
- Fane 4: `Infrastruktur`: havner, hubber, foredlingsanlegg og akvakultur.
- Fane 5: `Returstrømmer`: matsvinn, nutrient-flows, sirkulære looper og sidestrømmer.

Konkrete charts:

- Commodity x buyer heatmap for leveransedata.
- Top buyer concentration per commodity.
- Sankey kun innen samme enhet/år/varegruppe.
- Map-linked bars: klikk kommune -> leveranser, tilskudd, aktører, sårbarhet.
- Relationship graph med edge-status og kilde.

### Prioritet 2: Kunnskapsgrafen må bli fokuserte delgrafer

Status: teknisk operativ, analytisk for bred.

Nåværende status:

- 58 427 noder.
- 4 218 kanter.
- 56 077 isolerte noder.
- Bare 2 350 koblede noder.
- Bare 23 av 4 218 kanter har confidence.
- `company` dominerer med 55 438 noder.

Anbefalt endring:

- `/graf` bør ikke åpne på global graf.
- Standardvisning bør skjule isolerte noder.
- Legg inn domenevalg: `Dokument/innsikt`, `Selskap/eierskap`, `Aktør`, `Forsyningskjede`, `Food TG`.
- Bruk eksisterende `getDocumentGraph(id)` og `getRelatedEntities(id, type)` på entitetssider.

Mest verdifull visualisering:

- "Hvorfor vet vi dette?"-graf: claim -> dokument -> kilde -> aktør/selskap.
- "Hvem må validere dette?"-graf: claim -> aktører -> status `Utført internt` vs `Validert eksternt`.
- Entity neighborhood på `/selskap/[id]`, `/aktorer/[slug]`, `/personer/[personKey]`, `/bibliotek/[slug]`.

### Prioritet 3: Subsidier bør bli en fordelings- og maktanalyse

Status: stort datagrunnlag, enkel visualisering.

Nå:

- 179 312 subsidier i DB.
- `/subsidier` har kommunekart, kommunebars, ordningsbars og mottakertabell.

Anbefalt visualisering:

- Lorenz/Gini for tilskuddsfordeling.
- Top 1 %, top 10 %, median og long-tail.
- Kommune per innbygger / per jordbruksforetak / per areal.
- Ordning x verdikjedeledd heatmap.
- Mottaker -> selskap -> eierstruktur -> styre/rolle-kobling.
- Kart med toggle mellom total, per mottaker, per innbygger og per areal.

Dette kan gi langt bedre "follow the money"-analyse enn dagens rangeringstabeller.

### Prioritet 4: Nordisk sammenligning bør bli en eksplorativ matrix

Status: god førsteversjon, men statisk.

Nå:

- Viser markedsmakt, beredskap, verdikjede, sirkularitet og politikk.
- Henter fra `value-chain.json` og `chart-metrics.json`.
- Har per capita-toggle i enkelte charts.

Anbefalt visualisering:

- Land x indikator matrix med datadekningsmarkering.
- Sparklines for pris/import/produksjon der tidsserier finnes.
- Scenario-toggle: "beredskap", "markedsmakt", "sirkularitet", "matsvinn", "input-sårbarhet".
- Country drilldown som viser hvilke felt som er observed/proxy/mangler.
- Gaplist for Island og sjømatledd i SE/DK/FI.

Ikke bygg full nordisk total-Sankey ennå. Value-chain-dekningen er god nok til dekningspanel, men ikke til full flytmodell.

### Prioritet 5: Media bør visualiseres som evidenskorpus, ikke bare narrativside

Status: v2-laget er riktig, men lite volum.

Nå:

- 6 temaer.
- 8 outlets.
- 10 entries.
- 8 primærkilder.
- Landdekning: NO 3, SE 2, FI 2, IS 2, DK 1.

Anbefalt visualisering:

- Timeline med entry density per land/tema.
- Tema x land heatmap.
- Tone/frame matrix.
- Coverage funnel: candidate -> snapshot -> review -> accepted -> corpus.
- Kildekvalitet og primary/secondary split per land.
- "Narrativ vs evidens"-panel som viser syntesepåstand og faktiske entries side om side.

### Prioritet 6: Havbruk og geodata bør kobles tettere til økonomi og eierskap

Status: mye godt punktdata, men tabelltungt.

Nå:

- Havbruk har lokaliteter, søknader, operatører og kapasiteter.
- Kartet har akvakultur, havner, foredlingsanlegg, logistikkhubber, butikker, farm-punkter og sårbarhet.

Anbefalt visualisering:

- Operatørkonsentrasjon: lokaliteter og MTB per konsern.
- Akvakulturkart med capacity-weighted bubbles.
- Sjømatverdikjede: lokalitet -> operatør -> eierskap -> eksport/fôr-input.
- Fôrkomposisjon og input-import som sidepanel på havbruk.
- Koble Mowi/SalMar/Lerøy/Cermaq-relasjoner til `/eierskap` og `/forsyningskjede`.

### Prioritet 7: Økonomi bør vise struktur, ikke bare tidsserier

Status: god trendflate, men isolert.

Nå:

- 303 CompanyFinancial-rader.
- `/okonomi` viser omsetning, margin, EBITDA, egenkapitalandel og ansatte.

Anbefalt visualisering:

- Small multiples per verdikjedeledd.
- Revenue/profit concentration tree map.
- Margin vs omsetning scatterplot, farget etter verdikjedeledd/eierkategori.
- Kombiner subsidieandel og margin for selskaper som har støtte.
- "Konsernvis økonomi": summer datterselskaper under eiertrær.

### Prioritet 8: Mandat/Food TG bør få claim- og valideringsvisualisering

Status: godt strukturert tekstgrunnlag, men ikke nok visuell styring.

Anbefalt visualisering:

- Opportunity radar som ekte 2x2/score-matrix: materialitet, readiness, datatilgang, nordisk overførbarhet.
- Claim board: claim strength, evidence count, validation status, next action.
- Validation lanes: `Utført internt`, `needs-primary-check`, `needs-actor-validation`, `Validert eksternt`.
- Track A/B/C timeline med gate-status.

Dette er antakelig høyest verdi for beslutningsarbeidet fordi det gjør kunnskapsstatus synlig, ikke bare innholdet.

## Komponent- og kodegrep

### Ny struktur

Foreslått modul:

```text
src/lib/visualization/
├── types.ts
├── status.ts
├── colors.ts
├── format.ts
└── coverage.ts

src/components/visualization/
├── EvidenceStatusBadge.tsx
├── CoveragePanel.tsx
├── ChartFrame.tsx
├── DataQualityStrip.tsx
├── MetricMatrix.tsx
├── DistributionChart.tsx
├── EntityNeighborhood.tsx
└── SourceFootnote.tsx
```

### Standardiser chart-rammen

Alle charts bør få:

- tittel som svarer på et spørsmål
- undertittel med enhet/periode
- datastatus
- kilde/proveniens
- gap/advarsel
- lenke til underliggende data eller entitetsside

### Reduser inline-aggregering i sider

Flere sider beregner aggregeringer direkte i React-komponenten. Flytt aggregering til query-/analysis-lag når det er beslutningsdata. Det gir:

- enklere testing
- samme tall i tabell, kart og chart
- bedre mulighet for eksport
- færre skjulte definisjoner i UI

## Foreslått arbeidsplan

### Sprint 1: Visualiseringsstandard og raske gevinster

1. Lag felles `visualization`-typer og statuskomponenter.
2. Standardiser `observed/estimated/proxy/illustrative`.
3. Oppgrader `/forsyningskjede` med fem faner og bedre commodity/buyer-grafikk.
4. Oppgrader `/subsidier` med Lorenz/Gini og per-capita/per-foretak toggles.
5. Endre `/graf` default til koblet delgraf, ikke global dump.

### Sprint 2: Beslutningsflater

1. Entity-neighborhood på `/selskap/[id]`.
2. Claim/evidence-panel for `/mandat`.
3. Media coverage heatmap og review funnel.
4. Havbruk capacity map + operator concentration.
5. Nordisk indikator-matrix med dekningsstatus.

### Sprint 3: Flowmodell

1. Typed `FlowNode`/`FlowEdge` som kan romme observed/estimated/proxy/illustrative.
2. Importer leveransedata som observed flow for Norge.
3. Importpanel og fôrkomposisjon som sårbarhetslag.
4. Infrastruktur som nodekatalog.
5. Sankey bare for sammenlignbare flowsegmenter.

## Risikoer og grenser

- Ikke visualiser full nordisk matflyt som om den er observert. Datadekningen er ikke der ennå.
- Ikke la 55k selskapsrader dominere grafopplevelsen. De fleste er isolerte og bør filtreres.
- Ikke bland intern analyse med ekstern validering i samme grønn status.
- Ikke bruk proxy-serier uten tydelig merking.
- Ikke legg mer informasjon inn i kort hvis det egentlig trengs matrise, kart eller graf.

## Beste neste konkrete implementering

Hvis målet er størst effekt raskt, start med:

1. `/forsyningskjede`: fem-fane beslutningsflate.
2. `/graf`: filtrert standardvisning + entity neighborhood.
3. `/subsidier`: Lorenz/Gini + kommune-normalisering.
4. `/mandat`: claim/evidence/validation board.

Dette gir bedre visualisering av både systemflyt, maktstruktur, økonomiske fordelinger og kunnskapsstatus uten å kreve ny datainnsamling først.
