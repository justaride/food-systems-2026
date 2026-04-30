# Datavisualisering masterplan 2026-04-29

## Formål

Denne masterplanen styrer videre arbeid med datavisualisering, analyseflater og beslutningsstøtte i Food Systems 2026. Den bygger på:

- `docs/project/DATAVISUALISERING-ANALYSE-2026-04-29.md`
- `docs/project/FLOW-SIDE-STATUS-2026-04-29.md`
- `docs/project/KUNNSKAPSGRAF-STATUS-OG-VIDERE-PLAN-2026-04-29.md`
- eksisterende appflater: `/forsyningskjede`, `/graf`, `/subsidier`, `/sammenligning`, `/kart`, `/mandat`, `/media`, `/okonomi`, `/eierskap`, `/havbruk`, `/sirkularitet`

Målet er å gjøre prosjektets data beslutningsnær: brukeren skal raskt se hva dataen viser, hvor sterk den er, hva som mangler, hvilke aktører/kilder som henger sammen, og hvilke valg som bør tas videre.

## Styrende konklusjon

Ikke bygg én stor altomfattende visualisering. Bygg en lagdelt beslutningsplattform med felles datastatus, felles chart-ramme og domeneorienterte flater:

1. Systemflyt og verdikjede: `/forsyningskjede`
2. Kilde, claim og relasjoner: `/graf`, `/mandat`, entitetssider
3. Økonomi og fordelinger: `/subsidier`, `/okonomi`, `/eierskap`
4. Geografi og infrastruktur: `/kart`, `/havbruk`
5. Nordisk sammenligning: `/sammenligning`
6. Evidens og narrativ: `/media`, `/bibliotek`, `/innsikt`

## Arbeidsprinsipper

### 1. Datastatus først

Alle visualiseringer skal merke data som:

| Status | Betydning |
| --- | --- |
| `observed` | Direkte observert/importert data |
| `estimated` | Beregnet med stabil metode |
| `proxy` | Indirekte indikator |
| `illustrative` | Pedagogisk modell, ikke beslutningsdata |

Ingen flow, Sankey, kart eller graf skal fremstå som mer presis enn datagrunnlaget tillater.

### 2. Beslutningsspørsmål før komponentvalg

Hver visualisering skal ha et eksplisitt spørsmål:

- Hvem kontrollerer flyten?
- Hvor er sårbarheten?
- Hvor konsentrert er markedet?
- Hvem mottar penger?
- Hvilke claims er sterke nok?
- Hvilke aktører må validere?
- Hvilke data mangler?

Komponent velges etter spørsmålet, ikke etter hva som er raskt å tegne.

### 3. Felles visuell grammatikk

Samme farger, statuser, kildevisning og dekningslogikk skal brukes på tvers av appen. Dette må inn før store UI-utvidelser, ellers blir hver side sitt eget språk.

### 4. Analyse og validering holdes adskilt

I Food TG-arbeid skal `Utført internt` og `Validert eksternt` aldri blandes. En sterk intern kilde betyr ikke ekstern validering.

### 5. Ingen full nordisk totalflyt før modellen er klar

Full nordisk Sankey/flow er ikke beslutningsklar før flowkanter har harmonisert varegruppe, mengde, enhet, år, kilde, confidence og observed/proxy/illustrative-status.

## Kritisk vei

Arbeidet bør gå i denne rekkefølgen:

1. Avklar prod-status raskt (Fase –1a), men ikke la dette blokkere minimumskontrakt eller mandat-board.
2. Etabler minimumskontrakt (Fase 0a), brukt i én faktisk visning.
3. Bygg minimum `/mandat` claim/evidence/validation board for Food TG-frist 08.05.2026 (Fase 4a).
4. Fullfør prod-sync for datatunge domener parallelt (Fase –1b).
5. Gjør `/forsyningskjede` til hovedflate for systemflyt (Fase 1).
6. Harvest utvidet kontrakt fra reell bruk (Fase 0b).
7. Fullfør bredere `/mandat` claim/evidence/validation board (Fase 4b).
8. Filtrer `/graf` og bygg entity-neighborhoods (Fase 2).
9. Utvid `/subsidier`, `/okonomi`, `/eierskap` til fordelings- og maktanalyse (Fase 3).
10. Bygg nordisk indikator-matrix (Fase 6).
11. Koble geografi, havbruk, infrastruktur og sirkularitet (Fase 5).
12. Bygg media/evidens-heatmaps (Fase 7).
13. Først deretter: utvid flowmodell og Sankey der datagrunnlaget tåler det (Fase 8).

## Faseplan

### Fase –1a: Datafundament hurtigavklaring

Status: hurtigavklaring utført 2026-04-29. Se `docs/project/DATAVISUALISERING-PROD-DATA-STATUS-2026-04-29.md`.

Mål:

- Avklare raskt hvilke domener som er trygge å bygge på, hvilke som bare er lokale, og hvilke som mangler i prod.
- Skille mellom arbeid som kan bygges fra typed/static data (`/mandat`, visualiseringskomponenter) og datatunge flater som må vente på prod-sync.

Eksisterende grunnlag:

- `chore/prod-data-sync-fixes-2026-04-29` finnes remote, men har 0 commits foran `main`; `main` er 9 commits foran branchen.
- `fix/subsidier-data-2026-04-29` finnes remote, men har 0 commits foran `main`; `main` er 7 commits foran branchen.
- `/api/data-status` deploy-verifiseringsendepunkt finnes i aktiv `main` og prod, fra commit `0ac373d`.
- Prod `/api/data-status` returnerte 2026-04-29 HTTP 503 / `ok:false`: `subsidiesProduksjon=0`, `aquacultureSites=0`, `deliveryVolumes=0`.
- Lokal DB har samme dag `subsidiesProduksjon=179310`, `aquacultureSites=286`, `deliveryVolumes=60275`.
- Etter Fase -1b samme dag returnerer prod `/api/data-status` HTTP 200 / `ok:true`. Prod matcher dagens kilde-/importkontroll for `aquacultureSites`, `deliveryVolumes` og kjørbar `BusinessRelationship`-importpakke. Lokal audit-refresh og nøkkeldiff er utført: 286/60 275/121 lokalt mot 285/60 310/105 i prod/kildegrunnlag skyldes én stale/local-only akvakulturlokalitet, 2023/2024-kornår-drift og 18 local-only/2 prod-only relasjonsnøkler.

Leveranser:

- Kort statusnotat i denne filen eller eget `docs/project/DATAVISUALISERING-PROD-DATA-STATUS-2026-04-29.md`.
- Bekreft hvilke brancher som finnes remote og hva de endrer.
- Bekreft om `/api/data-status` finnes i aktiv branch/prod.
- Klassifiser domener som:
  - `prod-ok`
  - `local-only`
  - `needs-import`
  - `unknown`
- Marker hvilke faser som blokkeres av prod-gap.

Filer sannsynlig berørt:

- Ingen ved ren status.
- Eventuelt nytt statusnotat under `docs/project/`.

Akseptkriterier:

- Planen vet hvilke dataflater som kan bygges uten å overlovere mot prod.
- Fase 0a og Fase 4a kan starte selv om subsidier/havbruk/forskningsrunder ikke er ferdig prod-synket.
- Datatunge prodvisualiseringer holdes tilbake hvis datagrunnlaget ikke finnes i prod.

Verifikasjon:

- `git branch -a`
- `git show --stat 0ac373d --`
- `npm run db:audit` lokalt
- `curl https://<prod>/api/data-status` hvis Cloudflare Access bypass er tilgjengelig

Estimert arbeid:

| Estimat | Dager |
| --- | ---: |
| Optimistisk | 0.25 |
| Mest sannsynlig | 0.5 |
| Pessimistisk | 1 |
| PERT | 0.5 |

### Fase –1b: Datafundament prod-sync

Status: delvis gjennomført 2026-04-29. Prod `/api/data-status` er grønn. Gate C er nesten lukket for primærdatadomenene. Lokal/prod-drift er forklart på nøkkelnivå, men fiskehelseavvik og eventuell lokal reimport/opprydding står igjen.

Mål:

- Få samtlige datatunge domener (subsidier, havbruk, leveranser, forskningsrunder) til samme tilstand i prod som lokalt før produksjonsvisualiseringer bygges på dem.

Leveranser:

- Merge eller revider de to ventende branchene mot main.
- Kjør import for havbruk og forskningsrunder mot prod.
- Verifiser via `/api/data-status` at row-count i prod matcher lokalt.
- Dokumenter eventuelle gjenstående gap i risikoregister og statusnotat.

Utført 2026-04-29:

- Prod DB-backup tatt før import: `/tmp/foodsystems-pre-datavis-sync-20260429T131835Z.dump` i prod DB-container.
- Prod DB-backup tatt før relasjonsimport: `/tmp/foodsystems-pre-relations-sync-20260429T133744Z.dump` i prod DB-container.
- Importert Landbruksregisteret og produksjonstilskudd til prod.
- Importert Mowi-, SalMar-, Lerøy- og sjømatholdings-trær for å få prod fra 9 til 23 norske `seafood`-selskaper.
- Rerun av akvakulturregister og akvakultursøknader mot prod.
- Importert leveransedata til prod.
- Parserfix for `scripts/import-leveransedata.ts` gjorde at kornimporten gikk fra 0 til 15 986 rader.
- Retry-/org-filter i `scripts/import-akvakulturregister.ts` lukket rate-limit-avviket etter første prod-run.
- Relasjonspakken (`session5`, `session10`, `asko`, `horeca`, `research-20260420`, `nordic-deep`, `ownership`, rerun `session10`) økte `BusinessRelationship` fra 50 til 105.
- Prod `/api/data-status` etter import og retry: HTTP 200 / `ok:true`; `subsidiesProduksjon=179310`, `aquacultureSites=285`, `aquacultureApplications=100`, `deliveryVolumes=60310`, `businessRelationships=105`, `landbruksregisterCompanies=53808`.
- Kildekontroll: dagens Fiskeridirektoratet-dry-run gir 285 unike lokalitetsnummer, oppdatert leveransedata-dry-run gir 60 310 rader, og alle repo-skript som skriver `BusinessRelationship` er kjørt i prod.
- Lokal audit-refresh: direkte Prisma-count, `npm run db:audit` og `npm run db:verify` er kjørt lokalt. Lokal DB har fortsatt `aquacultureSites=286`, `deliveryVolumes=60275`, `businessRelationships=121`.
- Nøkkeldiff: havbruk har én local-only lokalitet (`30177`/`TORGERHAUGEN`), leveranser har 15 951 local-only 2023-kornnøkler og 15 986 prod-only 2024-kornnøkler, og relasjoner har 18 local-only / 2 prod-only nøkler.
- Gjenstående avvik: fiskehelse mangler Barentswatch-credentials; lokal DB bør enten reimporteres til prodparitet eller tydelig behandles som local-only snapshot.

Filer sannsynlig berørt:

- `src/app/api/data-status/route.ts`
- `prisma/schema.prisma` kun ved skjema-justeringer
- `scripts/import-*.ts` for relevante domener
- `Dockerfile` hvis `research/`-CSV-er må inn i build-context

Akseptkriterier:

- `/api/data-status` rapporterer `ok` for alle domenene som senere faser bygger på.
- Ingen datatung prodvisualisering i Fase 1, 3, 5 eller 6 merges med "tom-i-prod"-tabeller.

Verifikasjon:

- `npm run db:audit` lokalt og mot prod
- `curl https://<prod>/api/data-status` (krever Cloudflare Access bypass)

Estimert arbeid:

| Estimat | Dager |
| --- | ---: |
| Optimistisk | 0.75 |
| Mest sannsynlig | 1 |
| Pessimistisk | 2 |
| PERT | 1.1 |

### Fase 0a: Minimumskontrakt for visualisering

Status: implementert 2026-04-29. Brukt i `/mandat` via `EvidenceStatusBadge` med `proxy`-merking for internt styringssignal.

Mål:

- Etablere absolutt minste sett som lar første chart i Fase 1 bære datastatus uten ad hoc-logikk.
- Unngå prematur abstraksjon ved å la kontrakten harvestes fra reell bruk i Fase 0b.

Leveranser:

- `src/lib/visualization/types.ts`
- `src/lib/visualization/status.ts`
- `src/components/visualization/EvidenceStatusBadge.tsx`

Akseptkriterier:

- `observed | estimated | proxy | illustrative` definert ett sted og typesikret.
- `EvidenceStatusBadge` har tekst i tillegg til farge (a11y).
- Komponenten er SSR-kompatibel (Next.js App Router).
- Brukt på minst én faktisk visning i `/mandat` eller `/forsyningskjede` før Fase 0a stenges.
- Ingen eksisterende ruter brekker.

Verifikasjon:

- `npx tsc --noEmit`
- `npm run lint`
- visuell sjekk på desktop og mobil viewport (min. 360 px)

Estimert arbeid:

| Estimat | Dager |
| --- | ---: |
| Optimistisk | 0.5 |
| Mest sannsynlig | 1 |
| Pessimistisk | 2 |
| PERT | 1.1 |

### Fase 0b: Utvidet kontrakt (harvest)

Status: påbegynt 2026-04-29 etter Fase 1-slicene. Første `ChartFrame`-harvest er implementert og dokumentert i `docs/project/DATAVISUALISERING-CHARTFRAME-MIGRASJON-2026-04-29.md`.

Mål:

- Generalisere mønstre som faktisk gjentas, ikke designe forutsigelser.
- Gi alle senere faser én felles ChartFrame med datastatus, kilde, enhet og dekningsnotat.

Leveranser:

- `src/lib/visualization/colors.ts`
- `src/lib/visualization/format.ts`
- `src/lib/visualization/coverage.ts`
- `src/components/visualization/ChartFrame.tsx`
- `src/components/visualization/DataQualityStrip.tsx`
- `src/components/visualization/CoveragePanel.tsx`
- `src/components/visualization/SourceFootnote.tsx`
- Migrasjonsplan (kort note i `docs/project/`) for hvilke eksisterende charts som flyttes vs. beholdes.

Utført 2026-04-29:

- Felles komponent- og utilityfiler opprettet.
- `Importproxy`, `Infrastruktur` og `Returstrømmer` på `/forsyningskjede` er migrert til `ChartFrame`.
- Øverste statusstripe på `/forsyningskjede` er migrert til `DataQualityStrip`.
- Migrasjonsnotat opprettet med paneler som er flyttet, paneler som ikke flyttes ennå, og neste kandidater.

Akseptkriterier:

- ChartFrame krever `question`, `unit`, `period`, `source`, `evidenceStatus`.
- Performance: ChartFrame legger ikke til mer enn 5 KB gzipped på første rute som bruker den.
- Mobile/responsive: ChartFrame fungerer på 360 px bredde.
- A11y: status og kilde leses av skjermleser, ikke bare visuelle ledetråder.
- Migrasjonsplan dokumenterer hva som ikke flyttes og hvorfor (deprekeringsstatus).

Verifikasjon:

- `npx tsc --noEmit`
- `npm run lint`
- bundle-størrelse-sjekk (`npm run build` + sammenlign rute-output)
- visuell sjekk av minst to sider som bruker ny chart-ramme

Estimert arbeid:

| Estimat | Dager |
| --- | ---: |
| Optimistisk | 1 |
| Mest sannsynlig | 1.5 |
| Pessimistisk | 3 |
| PERT | 1.7 |

### Fase 1: `/forsyningskjede` som hoved-dashboard

Status: påbegynt 2026-04-29. Første UI-slice er lagt inn med datastatusstripe, kjøperkonsentrasjon, commodity x buyer heatmap, seksjonsstruktur, import/sårbarhet-panel, fôrkomposisjonspanel, infrastrukturpanel og returstrømpanel.

Mål:

- Gjøre `/forsyningskjede` til den operative flaten for flyt, makt, sårbarhet, infrastruktur og returstrømmer.

Eksisterende grunnlag:

- Kvalitetsscore 98.
- Prodgrunnlag etter Fase -1b: 60 310 leveranser og 105 kjørbare relasjoner.
- Lokal snapshot har fortsatt 60 275 leveranser og 121 relasjoner til lokal reimport/opprydding er utført.
- 100 % kilde-/beskrivelsesdekning på relasjoner.
- Value-chain-dekning 83 %.

Leveranser:

- Ny intern tab-/seksjonsstruktur:
  - `Primærflyt`
  - `Maktrelasjoner`
  - `Import og sårbarhet`
  - `Infrastruktur`
  - `Returstrømmer`
- Commodity x buyer heatmap. Første versjon implementert som andelsmatrise per varegruppe.
- Top buyer concentration per commodity. Første versjon implementert som topp 1/topp 3 per varegruppe.
- Større datakvalitetsstripe øverst. Første versjon implementert med `observed`, `proxy` og `illustrative` status.
- Importpanel-kort fra `research/data/nordic/trade-groups/`. Første versjon implementert fra `trade-group-imports-annual.csv` fordi denne inkluderer Norge; nivåer vises som andeler innen land, ikke absolutte landrangeringer.
- Fôrkomposisjonspanel fra `feed-composition-timeseries.json`. Første versjon koblet inn under `Import og sårbarhet` og merket som `estimated`.
- Infrastrukturpanel fra GeoJSON-lag. Første versjon implementert med logistikkhubber, foredlingsanlegg, havner, akvakulturlokaliteter og eksempelgårder, merket som `illustrative`/arbeidslag.
- Returstrømspanel fra `circularity-loops.json` og `nutrient-flows.json`. Første versjon implementert med loop/gap/case-oppsummering og N/P/K-flyt, merket som proxy/estimert.

Utført 2026-04-29:

- Øverste statusstripe skiller `observed` leveransedata, `proxy` relasjoner og `illustrative` kandidatdata.
- Kjøperkonsentrasjon viser topp 1/topp 3-andel per varegruppe.
- Commodity x buyer heatmap viser andel av total mengde innen hver varegruppe og unngår summering på tvers av liter/kg.
- Seksjonsnavigasjon er lagt inn for `Primærflyt`, `Maktrelasjoner`, `Import og sårbarhet`, `Infrastruktur` og `Returstrømmer`.
- Import/sårbarhet-panelet viser siste tilgjengelige år per land og importgruppeandel av valgt food-basket, merket som `proxy`.
- Fôrkomposisjon for norsk laks er koblet inn i samme seksjon og merket som `estimated`, siden serien blander dokumenterte år, interpolerte mellomår og post-2020-estimat.
- Infrastruktur viser 19 logistikkhubber, 30 foredlingsanlegg, 25 havner, 1 782 akvakulturpunkter og 50 eksempelgårder. Akvakultur-GeoJSON er eksplisitt merket som staging og ikke prod row-count-fasit.
- Returstrømmer viser 25 looper, 37 gap, 19 suksesscase, 12 feilcase, 4 N/P/K-land og 9 teknologier fra eksisterende datasett.
- Næringsstoff-flyt er koblet inn med `estimated`-merking og uten å eksponere Perplexity-runder som UI-kilde.
- Lokal browser-sjekk kjørt mot `http://localhost:3010/forsyningskjede`, `#import-saarbarhet` og `#returstrommer` på desktop 1440 px og mobil 390 px.

Filer sannsynlig berørt:

- `src/app/forsyningskjede/ForsyningskjedeContent.tsx`
- `src/lib/queries/supply-chain.ts`
- `src/components/charts/SupplyChainGraph.tsx`
- nye komponenter under `src/components/visualization/`

Akseptkriterier:

- Bruker kan skille observert leveransedata fra kuraterte relasjoner og proxy/illustrative flow.
- Primærleveranser kan leses per varegruppe og avtakertype.
- Siden viser tydelig hvilke datalag som er klare, staging eller for svake.
- Ingen full nordisk flow/Sankey presenteres som observert totalbilde.

Verifikasjon:

- `npm run db:audit`
- `npx tsc --noEmit`
- `npm run lint`
- browser-sjekk av `/forsyningskjede` på desktop + mobil viewport
- lastetid under 3 sekunder ved 60k leveranser (tidlig signal på behov for ny precompute i `compute-chart-metrics`)

Estimert arbeid:

| Estimat | Dager |
| --- | ---: |
| Optimistisk | 4 |
| Mest sannsynlig | 7 |
| Pessimistisk | 11 |
| PERT | 7.2 |

### Fase 2: Kunnskapsgraf som relasjonsmotor

Status: påbegynt 2026-04-29. Første `/graf`-slice skjuler isolerte noder fra canvas, viser status for koblede/isolerte/brutte noder, har domenevalg, søk, kantfilter, inspektørpanel, `Food TG`-preset og direkte lenke fra `BusinessRelationship`-kanter til `/forsyningskjede?relationship=<id>`. Første `EntityNeighborhood`-slice er koblet på selskap, aktør, bibliotekdokument og person. Bibliotekdetaljsiden er flyttet til catch-all-rute slik at dokument-slugs med `/` fungerer.

Mål:

- Gjøre `/graf` brukbar ved å gå fra global dump til fokuserte delgrafer.
- Koble grafen inn i faktiske arbeidsflater.

Eksisterende problem:

- 58 437 noder i lokal `/graf`-snapshot 2026-04-29.
- 56 087 isolerte noder.
- 4 218 kanter.
- Bare 23 kanter med confidence.
- Global graf domineres av isolerte selskapsrader.

Leveranser:

- Default `/graf`: skjul isolerte noder.
- Domenevalg:
  - `Koblet`
  - `Dokument/innsikt`
  - `Selskap/eierskap`
  - `Aktør`
  - `Forsyningskjede`
  - `Food TG`
- Maksgrense og tydelig warning hvis grafen er for stor.
- Klikkhandling i `KnowledgeGraph`.
- Detaljpanel med:
  - tittel
  - nodetype
  - canonical URL
  - innkommende/utgående relasjoner
  - kilde/proveniens der tilgjengelig
- Entity-neighborhood på:
  - `/selskap/[id]`
  - `/aktorer/[slug]`
  - `/bibliotek/[...slug]`
  - `/personer/[personKey]`

Filer sannsynlig berørt:

- `src/app/graf/page.tsx`
- `src/components/charts/KnowledgeGraph.tsx`
- `src/lib/queries/graph.ts`
- `src/app/selskap/[id]/page.tsx`
- `src/app/aktorer/[slug]/page.tsx`
- `src/app/bibliotek/[...slug]/page.tsx`
- `src/app/bibliotek/BibliotekContent.tsx`
- `src/app/personer/[personKey]/page.tsx`

Akseptkriterier:

- `/graf` laster ikke som en ukontrollert 58k-nodeflate.
- Bruker kan klikke en node og forstå hvorfor den finnes.
- Entity-sider viser relevante relasjoner uten å kreve global graf.
- Relationship-søk lander presist på `/forsyningskjede?relationship=<id>` eller tilsvarende.

Utført 2026-04-29:

- Global canvas bruker bare koblede noder som default og holder isolerte registerrader ute av renderflaten.
- Header viser koblede noder, isolerte noder, brutte kanter og konfidensdekning.
- `KnowledgeGraph` har presets, søk, nodetypefilter, kanttypefilter, maksgrense og inspektørpanel.
- Inspektør viser innkommende/utgående relasjoner, konfidens, kilde/proveniens og direkte side-/relasjonslenker der de finnes.
- `BusinessRelationship`-kanter peker til `/forsyningskjede?relationship=<id>`.
- `EntityNeighborhood` er lagt til på `/selskap/[id]`, `/aktorer/[slug]`, `/bibliotek/[...slug]` og `/personer/[personKey]` med lokale relasjoner per side.
- `Food TG`-preset er lagt til i `/graf` som konservativ regelbasert én-hop-visning med eksplisitte matchregler for `tag`, `href` og `label`.
- `getDocumentBySlug` henter nå `InsightDocumentRef`, `CompanyDocumentRef`, `ActorDocumentRef` og `Company.actor`; `/bibliotek/[...slug]` viser disse som egne grupper i `EntityNeighborhood`.
- Biblioteknabolag viser nå aktører som kan utledes trygt via selskapskobling (`CompanyDocumentRef -> Company.actor`) når direkte `ActorDocumentRef` mangler.
- Bibliotekdetaljruten er endret fra `/bibliotek/[slug]` til `/bibliotek/[...slug]`, fordi mange DB-slugs inneholder `/`.
- Dupliserte tag-verdier i dokumentdata gir ikke lenger React key-warning på `/bibliotek`.
- Browser-sjekk utført på `/graf`, `/selskap/cmmpayrg5000s190dd4kfuuf0`, `/aktorer/pronofa` og `/personer/orjan-svanevik` (desktop), samt `/personer/orjan-svanevik` på mobil.
- Browser-sjekk utført på `/graf` etter stabiliserte `Food TG`-matchregler: preset kan aktiveres og viser 437 noder / 1 153 kanter i lokal snapshot.
- Browser-sjekk utført på `/bibliotek/norden/verdikjede/10-kryss-analyse`: siden er ikke lenger 404 og viser relasjonsnabolag med 2 innsikter, 34 selskaper og 5 aktører via selskapskoblinger.
- Browser-sjekk utført på `/bibliotek` etter tag-key-fiks: ingen nye console errors i Playwright-runden.
- Mobil browser-sjekk utført på 390 px for `/graf` med `Food TG`-preset og `/bibliotek/norden/verdikjede/10-kryss-analyse`; ingen horisontal overflow etter `min-w-0`-fiks i graf- og nabolagskomponentene.
- `npm run db:audit` kjørt 2026-04-29: alle referanseintegritetsjekker passerte; audit viser 55 438 `Company`, 1 168 `Document`, 1 335 `PersonProfile`, 121 `BusinessRelationship` og 4 218 grafkanter.

Gjenstår:

- Hvis `Food TG`-preset skal brukes som beslutningsfilter eksternt, må matchreglene forankres i en kuratert tag-/scope-liste og ikke bare i dagens DB-signaler.
- Direkte `ActorDocumentRef`-dekning bør fortsatt styrkes for dokumenter der aktørspor er operativt viktig; dagens fallback dekker bare selskaper som allerede har `Company.actor`.

Verifikasjon:

- `npm run db:audit`
- `npx tsc --noEmit`
- `npm run lint`
- browser-sjekk av `/graf` og minst to entity-sider

Estimert arbeid:

| Estimat | Dager |
| --- | ---: |
| Optimistisk | 4 |
| Mest sannsynlig | 7 |
| Pessimistisk | 12 |
| PERT | 7.3 |

### Fase 3: Fordeling, økonomi og makt

Status: påbegynt 2026-04-29. Første `/subsidier`-snitt er implementert med fordelingsanalyse, kommune-normalisering, topp-100 maktanalyse-dekning, driftsenhetsspor og helkorpus verdikjede-dekning; første `/okonomi`-snitt er implementert med årsmatchet subsidieandel, match-dekning, normalisert regnskapsenhet og duplikatvarsel; første `/eierskap`-snitt er implementert med konsernvis økonomi-/subsidieoppsummering og egen årsmatchet tilskuddsindikator; første `/styremedlemmer`-snitt er implementert med interlock-score, økonomi-/tilskuddskontekst og eksplisitt metodegate for intern/ekstern bruk.

Mål:

- Gjøre `/subsidier`, `/okonomi`, `/eierskap` og `/styremedlemmer` til en samlet makt-/fordelingsanalyse.

Eksisterende grunnlag:

- 179 312 subsidie-rader.
- 303 regnskapsrader.
- 150 eierskapsrelasjoner.
- 1 693 styremedlemmer.
- 1 335 personprofiler.

Leveranser `/subsidier`:

- Første snitt: Lorenz-kurve og Gini per mottaker.
- Første snitt: top 1 %, top 10 %, median og snitt per mottaker.
- Første snitt: toggle mellom total NOK, NOK per mottaker, NOK per innbygger og NOK per km2.
- Første snitt: ordning x verdikjedeledd heatmap.
- Første snitt: mottaker -> selskap -> eierskap/styre-linker med eksplisitt datagapstatus.
- Første snitt: driftsenhetsspor for toppmottakere: matrikkel, parent-orgnr, koordinater og leveransefotavtrykk.
- Første snitt: helkorpus verdikjede-dekning som forklarer hvordan ordning x verdikjedeledd-heatmapet skal tolkes.

Leveranser `/okonomi`:

- Første snitt: margin vs omsetning scatterplot.
- Første snitt: verdikjedeledd-oppsummering med omsetning, vektet margin og tilskudd/omsetning.
- Første snitt: revenue/profit concentration treemap.
- Første snitt: streng årsmatchet subsidieandel-vs-margin med audit-gate for ekstreme eller mistenkelige punkter.
- Første snitt: dekningsnevner for årsmatch slik at analysepunktene ikke tolkes som bred økonomi-/subsidiedekning.

Leveranser `/eierskap` og `/styremedlemmer`:

- Konsernvis summering av økonomi/subsidier der mulig.
- Årsmatchet tilskuddsindikator per eierskapstre der tilskudd finnes i samme år som siste regnskapsrad.
- Interlock-score per selskap/person.
- Metodegate som skiller intern prioriteringsscore fra ekstern maktindikator.
- Selskapsdetalj med økonomi + subsidier + styrekoblinger.

Filer sannsynlig berørt:

- `src/app/subsidier/SubsidierContent.tsx`
- `src/lib/queries/subsidies.ts`
- `src/lib/queries/subsidies-agg.ts`
- `src/app/okonomi/OkonomiContent.tsx`
- `src/lib/queries/financials.ts`
- `src/lib/queries/financial-units.ts`
- `src/lib/queries/ownership.ts`
- `src/app/selskap/page.tsx`
- `src/app/eierskap/EierskapContent.tsx`
- `src/components/charts/OwnershipTreeDiagram.tsx`
- `src/lib/queries/interlocks.ts`
- `src/app/styremedlemmer/InterlockContent.tsx`
- `src/app/selskap/[id]/page.tsx`

Utført 2026-04-29:

- `getSubsidyDistribution('produksjonstilskudd')` grupperer alle subsidierader per `companyId` før fordelingsmåling.
- `getSubsidiesByKommune('produksjonstilskudd')` teller nå unike `companyId` per kommune og kobler til statisk kommune-metadata for navn, innbyggertall og areal.
- `getSubsidiesBySchemeAndStage('produksjonstilskudd')` grupperer ordning x `Company.valueChainStage` etter unike mottakere.
- `getSubsidyStageCoverage('produksjonstilskudd')` grupperer alle unike subsidimottakere etter `Company.valueChainStage` før heatmapet tolkes.
- `getTopSubsidyRecipients('produksjonstilskudd')` returnerer nå `ownershipLinkCount`, `boardMemberCount`, landbruksregister-/matrikkel-/parent-orgnr-felt og leveransefotavtrykk for toppmottakere.
- `/subsidier` viser nå totalt antall mottakere, top 10 %-andel, Gini, median, snitt, top 1 %, top 10 % og Lorenz-kurve.
- `/subsidier` har normaliseringskontroll for kommunevisning: total, per mottaker, per innbygger og per km2.
- `/subsidier` har ordning x verdikjedeledd-heatmap under `Ordninger`; lokal snapshot viser 15 ordninger og dagens stage-dekning er i praksis `Primærproduksjon`.
- `/subsidier` har verdikjede-dekningskort under `Ordninger`: lokal snapshot viser 36 677/36 677 unike produksjonstilskuddsmottakere med stage, 36 677/36 677 i `production`, 0 uklassifiserte og 18,96 mrd NOK i primærproduksjon.
- `/subsidier` toppmottakerlisten har nå `Koblinger`-kolonne med `Selskap`-spor per rad og betingede `Eierskap`, `Styre` og `Kryssgraf`-lenker når data finnes.
- `/subsidier` har dekningspanel for maktanalyse i topp 100: lokal snapshot viser 0/100 med eier- eller styrekobling, 100/100 med verdikjedeledd, 100/100 klassifisert som `production`, 99/100 med syntetisk `Jordbruksforetak ...`-navn og 0/100 med `legalForm`.
- `/subsidier` har driftsenhetspanel for topp 100: lokal snapshot viser 99/100 med `Landbruksregisteret`-metadata, 99/100 med matrikkel, 99/100 med parent-orgnr, 0/100 parent-orgnr som matcher eksisterende `Company`, 99/100 med koordinater og 85/100 med leveransefotavtrykk.
- `/subsidier` toppmottakerlisten har nå `Driftsenhet`-kolonne med matrikkel, parent-orgnr, koordinatbadge og varetypeantall fra `DeliveryVolume` der leveransedata finnes.
- `/okonomi` har margin-vs-omsetning scatterplot basert på siste år der både omsetning og driftsmargin finnes.
- `/okonomi` har verdikjedeledd-oppsummering med siste omsetning, vektet driftsmargin og akkumulert tilskudd relativt til siste omsetning.
- `/okonomi` har konsentrasjons-treemap med toggle mellom omsetning og driftsresultat; negative/null-resultater ekskluderes eksplisitt i resultatvisningen.
- `getSubsidySumsByCompanyYear()` grupperer `Subsidy` per `companyId` og `year` for streng årsmatching mot regnskap.
- `financialAmountToNok()` normaliserer gamle årsrapport-/estimat-rader som er lagret i MNOK til NOK i query-/visningslaget, uten å reskalere nye tree-importer som allerede ligger i NOK.
- `/okonomi` har årsmatchet subsidieandel-vs-margin-panel. Lokal snapshot finner 2 matchende selskap-år, begge Yara 2022, og de tegnes nå som analysepunkter på 0,12-0,15 % subsidieandel etter enhetsnormalisering.
- `/okonomi` årsmatch-panelet viser nå dekningsnevner: 263 regnskapspunkter med omsetning + margin, 2 subsidie-år i selskaper med regnskap, 2 faktiske årsmatcher og 36 679 subsidie-år totalt.
- `/okonomi` viser datavarsel når samme navn-år/tilskudd-kombinasjon finnes på flere selskapsidentiteter; lokal snapshot viser 1 slikt Yara-duplikat.
- Trendgrafene på `/okonomi` bruker unik label for dupliserte selskapsnavn, slik at Yara-duplikatet ikke gir React key-kollisjon.
- `/selskap` og `/selskap/[id]` bruker samme regnskapsenhet-normalisering som `/okonomi`; Yara-profilen viser 149,0 mrd omsetning i 2024 og 231,0 mrd i 2022.
- `scripts/cleanup-old-orgnrs.ts` er gjort dry-run som standard, med `--apply` for faktisk sletting og `--orgnr=...` for smal preflight.
- Dry-run `npx tsx scripts/cleanup-old-orgnrs.ts --orgnr=919998919` viser at gammel Yara-identitet (`cmmpayrgr001e190d9ab6n2y3`) har 7 dokumentrefs, 1 subsidie, 12 styremedlemmer, 1 shareholder, 5 regnskapsrader og 1 business relationship før eventuell sletting. Ingen DB-skriving er utført.
- `getOwnershipMap()` kobler siste regnskapsrad og akkumulert subsidietotal per selskap inn i eierskapstrærne, og summerer dette per konsern/tre.
- `getOwnershipMap()` beregner også `latestYearSubsidyNok` per selskap og summerer dette til `yearMatchedSubsidyNok` per eierskapstre.
- `/eierskap` viser topptall for trær med regnskap, samlet omsetning og samlet tilskudd, samt tabellen `Konsernvis økonomi og subsidier` med 21 trær i lokal snapshot.
- `/eierskap` har nå egne kolonner for `Årsmatch` og `Årsmatch %`; lokal snapshot viser 0 NOK i årsmatchet tilskudd på tvers av dagens eierskapstrær, som skiller seg tydelig fra eventuell akkumulert eksponering.
- `OwnershipTreeDiagram` håndterer nå DAG-tilfeller der samme selskap har flere foreldre i samme graf; delt selskapsnode rendres én gang, mens alle eierkanter beholdes.
- `getInterlockGraph()` beregner personscore fra unike selskaper, ekstra roller og sektorbro-bonus.
- `getInterlockGraph()` henter nå også siste omsetning, akkumulert tilskudd og eierskapslenker for selskaper i interlock-grafen.
- `getInterlockSummaryForCompany()` beregner selskapsspesifikk interlock-score, antall kryssmedlemmer, kryssektormedlemmer og koblede selskaper.
- `/styremedlemmer` viser topp personscore, topp selskapsscore og `Interlock-score`-panel med topp 8 personer og topp 8 selskaper i aktivt filter.
- `/styremedlemmer` viser omsetning og tilskudd ved siden av selskapsscore, og presiserer at disse er kontekstindikatorer som ikke inngår i scoreformelen.
- `/styremedlemmer` har metodegate i scorepanelet: `Metodestatus = Internt prioriteringssignal`, `Ekstern bruk = Ikke validert maktindikator`, kontekstdata vektes ikke, og neste gate er rolleharmonisering/aktørvalidering.
- `/styremedlemmer` sorterer tabellvisningen etter interlock-score og viser score direkte på personkortene.
- Valgt selskapsnode i `/styremedlemmer` viser omsetning, tilskudd og eierlenker sammen med kryssstyremedlemmene.
- `/selskap/[id]#styre` viser interlock-score, antall koblede selskaper og personscore per styremedlem der kryssverv finnes.
- `Card` støtter `id`, og selskapssider har anker for `#eierskap`, `#styre` og `#subsidier`.
- Metodefeltet sier eksplisitt at Gini/Lorenz er mottakerfordeling og ikke kommune-, areal- eller innbyggernormalisering.
- Browser-sjekk utført på `/subsidier` desktop og 390 px mobil: fordelingsseksjonen, Lorenz-SVG og metodefeltet rendres uten horisontal overflow.
- Browser-sjekk utført på `/subsidier` dekningspanel: `Dekning for maktanalyse i topp 100` viser eier/styre-, eierskap-, styre-, verdikjedeledd- og foretaksmodell-dekning på desktop og 390 px mobil uten horisontal side-overflow eller appfeil i console.
- Browser-sjekk utført på `/subsidier` driftsenhetspanel: `Driftsenhet-spor i topp 100` viser Landbruksregisteret-, matrikkel-, parent-orgnr-, koordinat- og leveransedekning på desktop og 390 px mobil uten appfeil i console.
- Browser-sjekk utført på normaliseringstoggles: per innbygger, per mottaker og per km2 oppdaterer kart-/kommunetittel, enhet og metodefotnote uten horisontal overflow.
- Browser-sjekk utført på heatmap: `Ordninger`-fanen viser verdikjede-dekningskort og ordning x verdikjedeledd-tabell uten side-overflow; mobil bruker intern horisontal scroll i heatmap-containeren.
- Browser-sjekk utført på toppmottakerlisten: `Koblinger`-kolonne og `Selskap`-lenke til `/selskap/[id]#subsidier` fungerer; `Driftsenhet`-kolonnen viser matrikkel, parent-orgnr, koordinatbadge og varetypeantall i samme tabell.
- Lokal dev-serverlogg etter nye subsidieaggregater viser `/subsidier` på ca. 0,95-1,15 s application-code. `scripts/compute-chart-metrics.ts` er foreløpig ikke utvidet for disse Prisma-aggregeringene fordi scriptet i dag er et statisk public-data/store-metrics script, ikke et DB-precompute-script.
- Browser-sjekk utført på `/okonomi`: scatterplot rendrer 125 punkter i lokal snapshot, verdikjedeledd-oppsummering vises, metodeforbehold for indikativ tilskuddsandel vises, og desktop/mobil har ingen horisontal side-overflow.
- Browser-sjekk utført på `/okonomi` treemap: omsetning- og resultat-toggle rendrer 19 rektangler i lokal snapshot, negativ-resultatnotat vises, og desktop/mobil har ingen horisontal side-overflow.
- Browser-sjekk utført på `/okonomi` årsmatch etter regnskapsenhet-normalisering: Yara 2022 vises som 2 analyseklare selskap-år med 0,12-0,15 % subsidieandel, dekningsstripen viser 263/2/2/36 679-nøklene, datavarsel for 1 duplisert navn-år/tilskudd-kombinasjon vises, og desktop/mobil har ingen horisontal side-overflow eller appfeil i console.
- Browser-sjekk utført på `/selskap` og `/selskap/cmmxw487m005fp80duuood3yc` (Yara International ASA): Yara-rader/profil viser normalisert milliardvisning, og desktop + 390 px mobil har ingen horisontal side-overflow eller appfeil i console.
- Browser-sjekk utført på `/eierskap`: konsernvis økonomi-/subsidietabell rendrer 21 rader med akkumulert tilskudd, årsmatchet tilskudd og årsmatchandel; desktop og 390 px mobil har ingen horisontal side-overflow, og React key-kollisjon for delt Reitan-node er fjernet.
- Browser-sjekk utført på `/styremedlemmer`: scorepanelet, metodegate, to scoretabeller med 16 rader totalt og grafcanvas rendrer på desktop og 390 px mobil uten horisontal side-overflow og uten appfeil i console.
- Browser-sjekk utført på `/styremedlemmer?company=cmmpayrh5001n190dqum2t3kw` (ASKO Norge AS): scoretabellen viser omsetning/tilskudd-kontekst, valgt selskapsnode viser omsetning 95,0 mrd, tilskudd og 2 eierlenker, og desktop/mobil har ingen horisontal side-overflow eller appfeil i console.
- Browser-sjekk utført på `/selskap/cmmpayrh5001n190dqum2t3kw#styre` (ASKO Norge AS): styreseksjonen viser interlock-score 46, 29 koblede selskaper, personscore og lenke tilbake til kryssstyre-grafen; desktop og 390 px mobil har ingen horisontal side-overflow.

Gjenstår:

- Dagens topp-100 mottakere viser 0/100 med eier-/styrekobling, 99/100 syntetiske `Jordbruksforetak ...`-navn og 0/100 `legalForm`; driftsenhetssporene er nå synlige, men faktisk maktanalyse krever produsent-/personoppløsning og validering før parent-orgnr kan brukes som styringsspor.
- Topp-100 mottakere har 100/100 `production`, så manglende differensiering i toppmottakerlisten er ikke stage-gap, men uttrykk for at produksjonstilskudd i lokal snapshot treffer jordbruksforetak.
- Hvis heatmapet skal skille flere verdikjedeledd, må selve subsidiekorpuset utvides med andre støtteordninger eller mer presise mottakertyper; dagens `produksjonstilskudd`-korpus er 100 % `production` i lokal snapshot.
- `/okonomi` årsmatchet subsidieandel-vs-margin er ikke lenger blokkert av regnskapsenhet for Yara 2022, men dekningen er ekstremt smal: 2 årsmatcher av 263 regnskapspunkter og 36 679 subsidie-år. Yara finnes fortsatt som to selskapsidentiteter (`919998919` og `986228608`) med samme 283 MNOK-tilskudd. Dry-run/preflight er på plass; faktisk `--apply`-opprydding er ikke kjørt.
- `/eierskap`-summeringen viser nå både akkumulert tilskudd og årsmatchet tilskudd. Dagens årsmatch er 0 NOK i eierskapstrærne, så konsernvis subsidieandel er foreløpig et fraværssignal, ikke en positiv maktindikator.
- `/styremedlemmer`-score er eksplisitt merket som internt prioriteringssignal; neste metodearbeid er ikke UI, men rolleharmonisering, aktørvalidering og beslutning om eventuell ekstern indikatorlogikk.

Akseptkriterier:

- Subsidier kan analyseres som fordeling, ikke bare liste.
- Økonomi kan sammenlignes etter verdikjedeledd.
- Eierskap/styre/økonomi/subsidier henger sammen via lenker.
- Alle normaliseringer viser metode og forbehold.

Verifikasjon:

- `npm run db:audit`
- `npx tsc --noEmit`
- `npm run lint`
- browser-sjekk av `/subsidier`, `/okonomi`, `/eierskap`, `/styremedlemmer` og berørt selskapsside

Kjørt for første `/subsidier`-, `/okonomi`-, `/eierskap`- og `/styremedlemmer`-snitt 2026-04-29:

- `npx tsc --noEmit`
- `npm run lint`
- `git diff --check`
- `npx tsx scripts/cleanup-old-orgnrs.ts --orgnr=919998919` dry-run, ingen DB-skriving.
- Playwright-sjekk av `/subsidier` på 1200 px og 390 px, inkludert normaliseringstoggles.
- Playwright-sjekk av `/subsidier` dekningspanel på 1200 px og 390 px, inkludert foretaksmodell-dekning og console-logg uten appfeil.
- Playwright-sjekk av `/subsidier` driftsenhetspanel og toppmottakertabell på 1440 px og 390 px, inkludert matrikkel, parent-orgnr, koordinatbadge, varetypeantall og console-logg uten appfeil.
- Playwright-sjekk av `/subsidier` `Ordninger`-fanen på 1440 px og 390 px, inkludert verdikjede-dekningskort, heatmap og console-logg uten appfeil.
- Lokal serverlogg for `/subsidier` etter endringen: `application-code` ca. 955-1116 ms.
- Playwright-sjekk av `/okonomi` på 1200 px og 390 px, inkludert treemap, årsmatchet subsidieandel-panel, match-dekningsstripe, datavarsel for Yara-duplikat og console-logg uten appfeil.
- Playwright-sjekk av `/selskap` og Yara-profil på 1200 px og 390 px, inkludert normalisert milliardvisning og console-logg uten appfeil.
- Playwright-sjekk av `/eierskap` på 1440 px og 390 px, inkludert konserntabell med `Årsmatch`/`Årsmatch %`, intern tabellscroll på mobil og console-logg uten appfeil.
- Playwright-sjekk av `/styremedlemmer` på 1440 px og 390 px, inkludert scorepanel, metodegate, scoretabeller, grafcanvas og console-logg uten appfeil.
- Playwright-sjekk av `/styremedlemmer?company=cmmpayrh5001n190dqum2t3kw` på 1200 px og 390 px, inkludert valgt selskapsnode med omsetning, tilskudd og eierlenker.
- Playwright-sjekk av ASKO Norge AS sin selskapsside på 1200 px og 390 px, inkludert `#styre` interlock-score, koblede selskaper, personscore og tilbakekobling til kryssstyregraf.

Estimert arbeid:

| Estimat | Dager |
| --- | ---: |
| Optimistisk | 5 |
| Mest sannsynlig | 8 |
| Pessimistisk | 14 |
| PERT | 8.5 |

### Fase 4a: Food TG minimum mandate board før 08.05

Status: minimumsversjon implementert 2026-04-29. Fortsatt fristpakke, ikke full Fase 4b.

Mål:

- Gi `/mandat` en minimumsvisning som gjør Food TG-status beslutningsklar uten å vente på full graf, full prod-sync eller alle visualiseringskomponenter.
- Vise claim-styrke, valideringsstatus og neste handling tydelig nok til intern styring og møteforberedelse.

Leveranser:

- Minimum claim board:
  - claim ID
  - styrke
  - status
  - neste handling
- Minimum validation lanes:
  - `Utført internt`
  - `needs-primary-check`
  - `needs-actor-validation`
  - `Validert eksternt`
- Track A/B/C statuskort med tydelig "hva er klart / hva må sjekkes".
- Linker til:
  - `claim-register-food-tg.md`
  - `claim-strength-report-food-tg-v0.1.md`
  - `primary-check-queue-food-tg-v0.1.md`
  - `actor-validation-pack-food-tg-v0.1.md`

Filer sannsynlig berørt:

- `src/app/mandat/MandatContent.tsx`
- `src/lib/data/food-tg-mandate.ts`
- ingen canonical mandate-docs med mindre det eksplisitt trengs

Akseptkriterier:

- Intern analyse og ekstern validering vises separat.
- Bruker ser hvilke claims som er klare, hvilke som trenger primærkildesjekk, og hvilke som trenger aktørdialog uten å åpne alle markdown-filene.
- Siden kan leveres selv om full prod-sync for subsidier/havbruk ikke er ferdig.
- Det er tydelig at dette er minimumsversjonen før 08.05, ikke ferdig sluttsystem.

Verifikasjon:

- `npx tsc --noEmit`
- `npm run lint`
- browser-sjekk av `/mandat`
- manuell kontroll mot mandate-filene

Estimert arbeid:

| Estimat | Dager |
| --- | ---: |
| Optimistisk | 1 |
| Mest sannsynlig | 2 |
| Pessimistisk | 4 |
| PERT | 2.2 |

### Fase 4b: Full Food TG claim/evidence/validation board

Status: fullversjon etter 08.05-pakken.

Mål:

- Gjøre `/mandat` til en varig styringsflate for claims, evidens, muligheter, validering og neste handling.

Leveranser:

- Opportunity radar som score-matrix:
  - materialitet
  - readiness
  - datatilgang
  - nordisk overførbarhet
  - partner-/owner-klarhet
- Full claim board:
  - claim ID
  - styrke
  - evidensantall
  - kildetype
  - status
  - neste handling
- Track A/B/C timeline med gate-status.
- Filtrering på track, status, evidence strength og next action.
- Kobling mot entity-neighborhoods når Fase 2 er klar.

Filer sannsynlig berørt:

- `src/app/mandat/MandatContent.tsx`
- `src/lib/data/food-tg-mandate.ts`
- eventuelt nye parser-/loaderfunksjoner for mandate-docs
- `docs/project/mandates/*` kun hvis eksplisitt ønsket

Akseptkriterier:

- Mulighetsradar viser hvorfor noe prioriteres, ikke bare hva som er valgt.
- Claim board viser evidenstyngde og valideringsbehov på tvers av track A/B/C.
- Fullversjonen kan bygges videre mot grafrelasjoner uten å blande intern og ekstern validering.

Verifikasjon:

- `npx tsc --noEmit`
- `npm run lint`
- browser-sjekk av `/mandat`
- manuell kontroll mot mandate-filene

Estimert arbeid:

| Estimat | Dager |
| --- | ---: |
| Optimistisk | 2 |
| Mest sannsynlig | 4 |
| Pessimistisk | 7 |
| PERT | 4.2 |

### Fase 5: Geografi, havbruk, infrastruktur og sirkularitet

Status: sterk datatilgang, UI kan bli mer analytisk. Forutsetter at Fase –1b har lukket havbruk-gap i prod før produksjonslansering.

Mål:

- Koble kartdata, havbruk, infrastruktur, sirkulærdata og forsyningskjede tydeligere.

Eksisterende grunnlag:

- 1 782 akvakulturlokaliteter.
- 30 foredlingsanlegg.
- 25 havner.
- 19 logistikkhubber.
- 50 farm-punkter.
- butikkdata for fem nordiske land.
- Sirkularitetsunderlag finnes i `circularity-loops.json`, `nutrient-flows.json`, `src/lib/data/circularity-questions.ts` og relaterte dokument-/aktørdata. Tall som `192 sirkulær-aktører`, `860 dokumenter` og `43 sirkulær-selskaper` må verifiseres i Fase –1a før de brukes som planforutsetning.

Leveranser:

- Capacity-weighted aquaculture bubbles.
- Operatørkonsentrasjon på kart og tabell.
- Kartlag for:
  - havner
  - hubber
  - foredling
  - akvakultur
  - butikker
  - sårbarhet
- Klikkpunkt -> selskapsside der kobling finnes.
- Havbrukspanel med fôrkomposisjon og input-sårbarhet.
- Infrastruktur-kort på `/forsyningskjede`.
- Oppgradering av `/sirkularitet` til ChartFrame-standard og lenker mellom `/forsyningskjede` returstrømsfane og `/sirkularitet`.

Filer sannsynlig berørt:

- `src/app/havbruk/HavbrukContent.tsx`
- `src/app/sirkularitet/SirkularitetContent.tsx`
- `src/components/map/FoodMap.tsx`
- `src/lib/map/MapContext.tsx`
- `src/lib/map/types.ts`
- `src/app/kart/[country]/page.tsx`
- `src/lib/queries/aquaculture.ts`
- `src/lib/queries/circularity.ts` hvis det finnes/legges til

Akseptkriterier:

- Geografiske punkter kan brukes til analyse, ikke bare visning.
- Kapasitet, rolle og eier/operatør vises der data finnes.
- Norge skilles tydelig fra nordiske land med svakere geodata.
- `/sirkularitet` deler datastatus og kildevisning med resten av appen.

Verifikasjon:

- `npm run db:audit`
- `npx tsc --noEmit`
- `npm run lint`
- browser-sjekk av `/kart/no`, `/havbruk`, `/sirkularitet`, `/forsyningskjede`

Estimert arbeid:

| Estimat | Dager |
| --- | ---: |
| Optimistisk | 4 |
| Mest sannsynlig | 7 |
| Pessimistisk | 13 |
| PERT | 7.5 |

### Fase 6: Nordisk sammenligning som indikator-matrix

Status: god base, bør bli mer utforskende.

Mål:

- Gjøre `/sammenligning` til en matrix for indikatorer, datadekning og landvise gap.

Leveranser:

- Land x indikator matrix.
- Datadekningsmerking per celle.
- Sparklines for pris/import/produksjon der tidsserier finnes.
- Scenario-toggle:
  - beredskap
  - markedsmakt
  - sirkularitet
  - matsvinn
  - input-sårbarhet
- Gapliste:
  - Island value-chain-dekning
  - seafood-ledd i SE/DK/FI
  - manglende volum-/waste-felt

Filer sannsynlig berørt:

- `src/app/sammenligning/SammenligningContent.tsx`
- `src/lib/queries/sammenligning.ts`
- `src/components/sammenligning/*`
- `public/data/food-systems/{no,se,dk,fi,is}/value-chain.json` kun ved eksplisitt dataarbeid

Akseptkriterier:

- Bruker ser både verdi og datadekning i samme visning.
- Land sammenlignes ikke falskt når datagrunnlaget er ulikt.
- Ingen total-Sankey før flowmodell er robust.

Verifikasjon:

- `npx tsc --noEmit`
- `npm run lint`
- browser-sjekk av `/sammenligning`

Estimert arbeid:

| Estimat | Dager |
| --- | ---: |
| Optimistisk | 3 |
| Mest sannsynlig | 5 |
| Pessimistisk | 9 |
| PERT | 5.3 |

### Fase 7: Media og evidenskorpus

Status: riktig modell, lite volum.

Mål:

- Gjøre `/media` til en etterprøvbar evidensflate med tydelig dekning, ikke bare narrativside.

Eksisterende grunnlag:

- 6 temaer.
- 8 outlets.
- 10 entries.
- 8 primærkilder.
- DK er tynnest med 1 entry.

Leveranser:

- Tema x land heatmap.
- Timeline med entry-density per land/tema.
- Tone/frame matrix.
- Coverage funnel:
  - candidate
  - snapshot
  - review
  - accepted
  - corpus
- Primær/sekundær split per land.
- Narrativ vs evidens-panel.

Filer sannsynlig berørt:

- `src/app/media/page.tsx`
- `src/lib/queries/media.ts`
- `src/lib/data/media-corpus.ts` kun etter review/aksept
- `research/bibliotek/media/*`

Akseptkriterier:

- Bruker ser klart hvor media-dekningen er sterk eller svak.
- Review-gated pipeline respekteres.
- Ingen candidate/snapshot blir importert som evidens uten human review.

Verifikasjon:

- `npm run media:audit-candidates` ved pipeline-arbeid
- `npx tsc --noEmit`
- `npm run lint`
- browser-sjekk av `/media`

Estimert arbeid:

| Estimat | Dager |
| --- | ---: |
| Optimistisk | 2 |
| Mest sannsynlig | 4 |
| Pessimistisk | 8 |
| PERT | 4.3 |

### Fase 8: Flowmodell og selektiv Sankey

Status: må vente på standard og datastatus.

Mål:

- Flytte flow fra illustrativ prototype til eksplisitt datamodell som kan bære beslutningsvisualiseringer.

Leveranser:

- Felles `FlowNode`/`FlowEdge`-kontrakt med:
  - `sourceId`
  - `targetId`
  - `commodityGroup`
  - `quantity`
  - `unit`
  - `year`
  - `frequency`
  - `originCountry`
  - `destinationCountry`
  - `flowType`
  - `observedOrEstimated`
  - `sourceRef`
  - `lastVerified`
  - `confidence`
  - `methodNote`
- Importer `DeliveryVolume` som observed norsk primærflyt.
- Koble importpanel/core-series som sårbarhetslag.
- Koble infrastruktur som nodekatalog.
- Sankey bare for sammenlignbare segmenter.

Filer sannsynlig berørt:

- `src/lib/map/types.ts`
- `public/data/food-systems/no/flows.json`
- `src/components/map/FoodFlowMap.tsx`
- `src/lib/queries/supply-chain.ts`
- eventuelt nye scripts under `scripts/`

Akseptkriterier:

- Alle flowkanter er tydelig merket med status og enhet.
- Illustrative index-kanter er ikke blandet med observerte tonn.
- Sankey brukes bare der enheter og perioder er sammenlignbare.

Verifikasjon:

- `npx tsc --noEmit`
- `npm run lint`
- browser-sjekk av `/kart/no/flow`
- data-sanity på antall observed/proxy/illustrative kanter

Estimert arbeid:

| Estimat | Dager |
| --- | ---: |
| Optimistisk | 5 |
| Mest sannsynlig | 9 |
| Pessimistisk | 16 |
| PERT | 9.5 |

## Samlet arbeidsestimat

Tabellen viser sekvensiell sum. Flere faser kan parallelliseres etter Fase 0b – kritisk vei er kortere.

| Fase | PERT-dager | Prioritet | Avhengighet |
| --- | ---: | --- | --- |
| –1a. Datafundament hurtigavklaring | 0.5 | Kritisk | Ingen |
| 0a. Minimumskontrakt | 1.1 | Kritisk | Ingen; kan starte parallelt med –1a |
| 4a. Minimum mandate board før 08.05 | 2.2 | Kritisk for TG | Fase 0a |
| –1b. Datafundament prod-sync | 1.1 | Kritisk for datatunge flater | Fase –1a |
| 1. Forsyningskjede dashboard | 7.2 | Kritisk | Fase 0a; prod-paritet før produksjonsmerge |
| 0b. Utvidet kontrakt (harvest) | 1.7 | Kritisk | Fase 1 (delvis) |
| 4b. Full mandate board | 4.2 | Høy | Fase 4a + Fase 0b |
| 2. Kunnskapsgraf relasjonsmotor | 7.3 | Høy | Fase 0b |
| 3. Fordeling/økonomi/makt | 8.5 | Høy | Fase 0b |
| 6. Nordisk indikator-matrix | 5.3 | Medium/høy | Fase 0b |
| 5. Geografi/havbruk/sirkularitet | 7.5 | Medium/høy | Fase 0b, delvis Fase 1 |
| 7. Media/evidenskorpus | 4.3 | Medium | Fase 0b |
| 8. Flowmodell og selektiv Sankey | 9.5 | Senere | Fase 0b, 1, 5 |
| Sum sekvensielt | 60.3 |  |  |

Praktisk gjennomføring:

- **08.05-pakke**: –1a + 0a + 4a = ca. **3-4 arbeidsdager**. Dette er eneste realistiske fristpakke før 8. mai 2026.
- **MVP1 etter frist**: 08.05-pakken + –1b + 1 + 0b + 4b = ca. **18 arbeidsdager sekvensielt**. Dette er full grunnplattform, ikke 08.05-leveranse.
- **MVP2** (legg til relasjons- og fordelingsanalyse): + 2 + 3 + 6 parallelt etter Fase 0b = ca. **30 arbeidsdager** kritisk vei.
- **Full plan sekvensielt**: ca. 60 arbeidsdager.
- **Full plan med parallellisering** (Fase 2/3/6 parallelt etter 0b; 5/7 etter MVP2): ca. **35-40 arbeidsdager** kritisk vei.

## MVP-definisjon

### 08.05-pakke

Dette er minimumet som kan leveres før Food TG-fristen 8. mai 2026:

1. Prod-status er raskt avklart og datagap er eksplisitt merket (Fase –1a).
2. Felles minimumskontrakt finnes og brukes (Fase 0a).
3. `/mandat` viser minimum claim/evidence/validation status (Fase 4a).
4. Intern analyse og ekstern validering er visuelt adskilt.
5. Eventuelle prod-datahull er merket som avvik, ikke skjult.

### MVP1

MVP1 er grunnplattformen etter 08.05-pakken:

1. Prod-data er på plass for datatunge domener som visualiseres (Fase –1b).
2. `/forsyningskjede` er en beslutningsflate med datastatus (Fase 1).
3. Utvidet kontrakt er harvestet fra reell bruk (Fase 0b).
4. `/mandat` har full claim/evidence/validation board (Fase 4b).

Tilleggspunkter for **MVP2** (~30 arbeidsdager kritisk vei):

5. `/graf` åpner som filtrert, koblet delgraf med entity-neighborhoods (Fase 2).
6. `/subsidier` viser fordelingsanalyse (Lorenz/Gini) utover rangering (Fase 3).
7. `/sammenligning` viser indikator-matrix med datadekningsmerking (Fase 6).

Når MVP1 + MVP2 er på plass, har prosjektet et sammenhengende datavisualiseringssystem.

## Arbeidsrekkefølge for neste økt

Status 2026-04-29 kveld: Fase –1b, 0a, 0b, 1, 2, 3 første `/subsidier`-snitt med normalisering/heatmap/koblinger, eksplisitt topp-100 maktanalyse-dekning, driftsenhetsspor og helkorpus verdikjede-dekning, første `/okonomi`-snitt med årsmatchet subsidieandel, match-dekning, regnskapsenhet-normalisering og Yara-duplikatvarsel, første `/eierskap`-snitt med konsernvis økonomi-/subsidieoppsummering og årsmatchet tilskuddsindikator, første `/styremedlemmer`-snitt med interlock-score, metodegate, selskapssidekobling for styrescore og 4a er påbegynt/implementert i denne arbeidsrekken. Neste økt bør ikke starte på den gamle 08.05-minimumskøen, men på gjenværende fordelings- og beslutningsanalyse.

Start her:

1. Les denne filen og `docs/project/DATAVISUALISERING-CHARTFRAME-MIGRASJON-2026-04-29.md`.
2. Sjekk `git status --short` og skill mellom aktive visualiseringsendringer og urelaterte lokale endringer.
3. Fortsett Fase 3 på `/subsidier`:
   - neste datasteg er produsent-/personoppløsning for toppmottakere; UI viser nå 99/100 matrikkel, 99/100 parent-orgnr, 0/100 parent-orgnr som matcher `Company`, 99/100 koordinater og 85/100 leveransefotavtrykk
   - ikke bruk dagens ordning x verdikjedeledd-heatmap som full verdikjedeanalyse; helkorpus-sjekken viser 36 677/36 677 produksjonstilskuddsmottakere i `production`
4. Deretter velg neste Fase 3-flate:
   - `/okonomi`: match-dekningen er synlig; vurder faktisk `--apply`-opprydding for Yara-duplikatet (`919998919`/`986228608`) først etter review av dry-run-planen; dry-run er grønn, men sletting er ikke kjørt
   - `/eierskap`: årsmatchet kolonne er på plass og viser 0 NOK i dagens trær; videre arbeid er å avklare om relevante støtteordninger mangler fra konserntrærne eller om fraværet er reelt
   - `/styremedlemmer`: metodegate er synlig; videre arbeid er rolleharmonisering, aktørvalidering og eventuell beslutning om ekstern indikatorlogikk
5. Når Fase 3 er stabil nok, start Fase 6 indikator-matrix eller Fase 4b full claim/evidence board.
6. Kjør minimum `npx tsc --noEmit`, `npm run lint`, `git diff --check` og browser-sjekk for berørte sider før status oppdateres.

## Beslutningsgates

### Gate 0a: Etter Fase –1a

Spørsmål:

- Vet vi hvilke domener som er `prod-ok`, `local-only`, `needs-import` og `unknown`?
- Er 08.05-pakken fri for avhengighet til tomme prod-tabeller?
- Er alle prod-gap eksplisitt merket som avvik eller risiko?

Hvis nei: Fase 4a må bruke static/typed data og tydelige avviksnotater. Fase 0a kan fortsatt starte.

### Gate A: Etter Fase 0a

Spørsmål:

- Vises status-badges riktig på desktop og mobil i en faktisk visning?
- Forstår en ikke-utvikler hva `observed/estimated/proxy/illustrative` betyr (test med ekstern leser)?
- Er a11y-tekst tilstede ved siden av farge?

Hvis nei: rett kontrakten før utvidelse i Fase 0b.

### Gate B: Etter Fase 4a

Spørsmål:

- Kan en mandat-leser identifisere claim-styrke, neste handling og valideringsstatus uten å åpne alle kildedokumenter?
- Er `Utført internt` og `Validert eksternt` aldri kombinert visuelt?
- Lenker minimumsboardet til claim-register, claim-strength, primary-check-queue og actor-validation-pack?

Hvis nei: dokumenter avvik tydelig i 08.05-pakken.

### Gate C: Etter Fase –1b

Status 2026-04-29: første spørsmål er ja. Andre spørsmål er delvis: prod matcher dagens kilde-/importkontroll for subsidier, havbruk, leveranser og kjørbare relasjonsimporter. Lokal/prod-drift er forklart på nøkkelnivå, men lokal DB er fortsatt ikke reimportert til paritet og fiskehelseavvik står igjen.

Spørsmål:

- Returnerer `/api/data-status` `ok` for alle domener som datatunge faser bygger på?
- Matcher row-count i prod og lokalt for subsidier, havbruk, leveranser og forskningsrunder?

Hvis nei: ikke merge datatunge prodvisualiseringer. Lokale analyser kan fortsette med tydelig `local-only` status.

### Gate D: Etter Fase 1

Spørsmål:

- Svarer `/forsyningskjede` på minst tre konkrete beslutningsspørsmål uten devtools/dokumentasjon?
- Skiller siden mellom observert leveransedata, kuraterte relasjoner og proxy/illustrasjon?
- Er value-chain-gapene synlige i UI, ikke bare i kode?
- Lastetid under 3 sekunder ved 60k leveranser?

Hvis nei: forbedre `/forsyningskjede` før parallelle spor.

### Gate E: Etter Fase 4b

Spørsmål:

- Viser fullversjonen evidensantall, kildetype og prioritering per claim?
- Er opportunity radar forståelig nok til å forklare prioritering?
- Er Fase 4a-avvik enten løst eller eksplisitt videreført?

Hvis nei: behold 4a som minimumsleveranse og ikke presenter 4b som ferdig.

### Gate F: Etter Fase 2

Spørsmål:

- Er grafen redusert fra global støy til fokuserte delgrafer?
- Kan en bruker klikke fra `/selskap/[id]` → relasjonsnabolag → relevant claim/dokument?
- Er kilde/proveniens tydelig nok?

Hvis nei: ikke bygg flere grafavhengige flater.

### Gate G: Før Fase 8

Spørsmål:

- Har flowkanter enhet, år, varegruppe og datastatus?
- Er observed/proxy/illustrative adskilt?
- Er Sankey-segmentet sammenlignbart?

Hvis nei: ingen ny full Sankey.

## Test- og kvalitetsregime

Minimum før hver merge/commit:

- `npx tsc --noEmit`
- `npm run lint`
- relevant route-sjekk i browser

Når DB-queryer eller importerte data berøres:

- `npm run db:audit`
- eventuelle domenespesifikke audit-scripts
- ved aggregering over store tabeller (>50k rader, f.eks. subsidier eller leveranser): oppdater `scripts/compute-chart-metrics.ts` slik at `npm run compute-metrics` (kjører i `npm run build`) dekker den nye aggregeringen
- verifiser prod-paritet via `/api/data-status` etter deploy

Når media pipeline berøres:

- `npm run media:audit-candidates`
- ikke importer candidate/snapshot til corpus uten review

Når flow/kart berøres:

- sjekk desktop og mobil viewport
- sjekk at kart/canvas/SVG ikke er blank
- sjekk at tekst og labels ikke overlapper meningsløst

## Risikoregister

| Risiko | Konsekvens | Tiltak |
| --- | --- | --- |
| Full flow visualiseres for tidlig | Misvisende beslutningsgrunnlag | Bruk observed/proxy/illustrative og Gate G |
| Global graf blir hovedprodukt | Treg, uleselig og lite nyttig | Filtrer isolerte noder og bygg delgrafer |
| Inline-aggregeringer spriker | Ulike tall på ulike sider | Flytt analyse til query-/lib-lag og `compute-chart-metrics` |
| Food TG intern/ekstern status blandes | Overclaiming | Bruk egne lanes for intern og ekstern validering |
| Media-candidates importeres for tidlig | Svak evidenskvalitet | Behold review-gated pipeline |
| Nye charts mangler kilde/status | Lav tillit | ChartFrame må kreve source/status |
| Kartlag føles presise uten dekning | Feil analyse | CoveragePanel og datastatus på alle lag |
| Prod og lokal data spriker (data-status-skew) | Visualisering bygges på data som ikke finnes for sluttbrukere | Fase –1a for rask avklaring, Fase –1b før datatunge prodvisualiseringer; `/api/data-status` i deploy-verifisering per fase |
| Eksisterende charts blir "andre klasses" etter Fase 0b | Inkonsistent UI på tvers, brukerforvirring | Migrasjonsplan i Fase 0b; tag deprekerte charts eksplisitt |
| `observed`-merket data viser seg å være proxy | Overclaiming i analyse | Stikkprøver per fase; oppdatering i SourceFootnote når status endres |
| Single-author bottleneck | Sekvensiell flaskehals selv om plan er parallelliserbar | Eksplisitt parallellplan; faseier per spor hvis flere bidragsytere |

## Ikke-gjør-nå liste

- Ikke bygg full nordisk total-Sankey.
- Ikke importer review-candidates direkte i `media-corpus.ts`.
- Ikke bruk alle 55k selskaper som default grafvisning.
- Ikke fyll de siste 20 egg-kommune-gapene med forretningsadresse uten eksplisitt proxy-merking.
- Ikke gjør store datamodellendringer før Fase 0a-kontrakten er etablert.
- Ikke merge datatunge prodvisualiseringer før Fase –1b har bekreftet prod-paritet via `/api/data-status`.
- Ikke kombiner `Utført internt` og `Validert eksternt`.

## Sluttleveranse

Arbeidet er ferdig når prosjektet har:

1. Konsistent visualiseringsstandard.
2. Beslutningsklar `/forsyningskjede`.
3. Brukbar kunnskapsgraf som relasjonsmotor.
4. Synlig økonomi-/subsidie-/eierskapsmakt.
5. Food TG claim/evidence/validation board.
6. Nordisk indikator-matrix med dekningsstatus.
7. Media/evidensflate med tydelig corpusdekning.
8. Flowmodell som skiller observed, estimated, proxy og illustrative.

Da kan appen brukes som et faktisk arbeidsverktøy for innsiktsrapport, whitepaper, stakeholder-dialog og intern beslutningsstøtte.
