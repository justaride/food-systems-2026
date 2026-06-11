---
tittel: Plattform-dybdeanalyse 2026-06-11
status: Intern analyse
eier: Gabriel
dato: 2026-06-11
scope: Full revisjon av appens 33 flater - datadekning, sporbarhet fra visning til underlag, og informasjonsarkitektur/presentasjon. Grunnlag for goal-arbeidsplanen til Codex.
relaterte_filer:
  - docs/project/plans/plattformloft-goal-arbeidsplan-2026-06-11.md
  - docs/project/status/FULL-INTERN-HELSESJEKK-2026-05-27.md
  - docs/superpowers/plans/2026-05-29-datakvalitet-merking.md
  - docs/superpowers/plans/2026-05-25-eierskap-rebuild.md
  - datagap-rapport-2026-04-29-v2.html
---

# Plattform-dybdeanalyse 2026-06-11

## 1. Oppsummering

Opplevelsen av «hummer og kanari» er reell og har en presis teknisk forklaring. Den skyldes ikke at innholdet er dårlig — kunnskapsgrunnlaget er omfattende og governance-apparatet (claim-lock, citable-gate, intern/ekstern-skille) er sterkt. Problemet er at plattformen har vokst rute for rute uten et felles kontrakt-lag mellom data og visning. Konkret er det tre rotårsaker:

1. **Blandet dataproveniens uten merking.** Sidene henter tall fra fem ulike kildetyper — Prisma-database, hardkodede TypeScript-arrays, statiske JSON-filer, backlog-CSV-er og bygge-tids-artefakter — uten at noen flate viser hvilken kilde et tall kommer fra, eller når det sist ble oppdatert. Noen flater bytter til og med stille til statiske fallback-data når databasen feiler (dokumentert i `/api/data-status` som `fallbackSurfaces` med risiko «medium»). Leseren kan derfor ikke skille et levende DB-tall fra et tall noen skrev inn i en fil i mars.

2. **Reelle datahull, og en dekningsmåling som måler feil.** Minst 126 av 270 unike selskaper i importkorpuset mangler finansdata helt, og konsern-dekningsrevisjonen (`audit-konsern-coverage.ts`) krever 2025-regnskap (`currentYear - 1`) mens hele datagrunnlaget er 2024-tall — slik at alle konsern rapporteres som udekket selv der dataene finnes. I tillegg er prod-databasen (185 selskaper) ikke avstemt mot importkorpuset (270 selskaper): konserntre-importene ligger utenfor `db:import`-kjeden, og dekningsartefakten viser konserntrær på 1–4 noder der skriptene definerer 3–21.

3. **Manglende kontekststillas.** Ingen av de 33 flatene viser «sist oppdatert». Ingen listesider har kolonnedefinisjoner, kvalitetsmerker per rad eller eksplisitt skille mellom «mangler data» og «0». Modellene som faktisk forklarer systemet (årsaksløkker, interessentkvadranter, kunnskapsgraf-kvalitet) ligger på `/metodikk` og `/mandat` — to sider som er nesten identiske duplikater — i stedet for ved dataene de forklarer.

Konsekvensen er nøyaktig det du beskriver: lange lister man ikke vet hva betyr, tomme omsetningsfelter på store selskaper, og berettiget usikkerhet om aggregatene står på reelle tall. Den gode nyheten: det meste løses med systematisk annotering, avstemming og konsolidering — ikke med nybygg. Arbeidsplanen i `docs/project/plans/plattformloft-goal-arbeidsplan-2026-06-11.md` bryter dette ned i 17 goals over 5 faser.

## 2. Metode og forbehold

Analysen er gjort 2026-06-11 mot arbeidskopien av repoet (main, siste commit 10.06) med tre innfallsvinkler: (a) side-for-side-gjennomgang av alle ruter i `src/app` med tilhørende komponenter og query-moduler, (b) statisk analyse av datalaget — `prisma/schema.prisma`, 35 query-moduler i `src/lib/queries`, alle `scripts/import-*.ts`, metrics-pipelinen og artefaktene i `data/` og `public/data/`, og (c) syntese mot eksisterende revisjoner og planer (helsesjekk 27.05, datagap-rapport 29.04, citable-status, superpowers-planer).

Forbehold: Jeg har ikke kjørt spørringer direkte mot databasen. Kvantifiseringer bygger på importskriptene (eneste skrivevei til DB foruten Brreg-berikelse, som ikke skriver finansdata), på bygge-artefakten `data/konsern-coverage.json`, og på live-svar fra `/api/data-status` i prod (hentet 11.06, bygg `4ac53e7` fra 10.06). Tall merket «korpus» beskriver hva importskriptene definerer; eksakt prod-dekning per felt krever DB-tilgang og er definert som eget goal (G-03). Dette er et internt arbeidsdokument; tallene her er kodebase-observasjoner, ikke eksterne claims, og skal ikke siteres eksternt uten claim-lock-rute.

## 3. Funn A — Datadekning og hull

### A1. Finansdata: omtrent halvparten av selskapskorpuset manger regnskapstall

Importkorpuset definerer **270 unike org.nr.** Av disse har bare ca. **134** et omsetningsfelt (`revenue2024` eller `financials`-blokk) i nærheten av definisjonen sin; konservativt regnet mangler **minst 126 selskaper finansdata helt**. Fordelingen forklarer hvorfor hullene er så synlige på listesidene:

| Importskript | Selskaper | Finansdekning |
|---|---:|---|
| `import-company-data.ts` (kjernekorpus) | 43 | 32 med flerårige `financials` (152 årsrader) |
| 14 konserntre-skript (ASKO, NG, Coop, Reitan, Orkla, Tine, Nortura, FK, Mowi, SalMar, Lerøy, BAMA, Kavli, Seafood Holdings) | ~110 | Kun `revenue2024` ettårsfelt, de fleste datterselskaper dekket |
| `import-research-20260420.ts` (aprilrunden: eiendom, HORECA, alt-distribusjon, failed entrants) | 70 | ~4 finansrader — **~66 selskaper uten tall** |
| `import-horeca-companies.ts` | 13 | 8 med `revenue2024` |
| `import-nordic-deepening.ts` | 13 | 0 |
| `import-session5-supply-chain.ts` | 8 | 0 |

Mekanismen på `/selskap`: siden viser `financials[0]?.revenueNok` (nyeste år, `take: 1`). Selskaper uten `CompanyFinancial`-rader får tom celle — uten merking av om det betyr «ikke innhentet», «ikke relevant» eller «0». Aprilrundens 70 selskaper ble altså lagt inn som entiteter for relasjons- og eiendomsanalyse, men uten regnskapsdimensjonen — og listevisningen skiller ikke mellom «kartlagt med tall» og «kartlagt som node».

### A2. Prod-databasen er ikke avstemt mot importkorpuset

`/api/data-status` i prod (10.06) viser **185 selskaper**, mot korpusets 270 unike org.nr. Sentralt: `npm run db:import`-kjeden inneholder **ikke** de 14 konserntre-skriptene, ikke HORECA-importen og ikke aprilrunde-importen — de har egne npm-kommandoer som må kjøres manuelt. Hvilke som faktisk er kjørt mot prod er udokumentert. Dekningsartefakten `data/konsern-coverage.json` (generert fra DB 25.05) bekrefter mismatch: konserntrærne har der `treeSize` 1–4 noder, mens skriptene definerer 3–21 selskaper per tre. Enten mangler eierskapskantene i den DB-en artefakten ble generert fra, eller så treffer ikke registry-roten skriptenes rotselskap. Andre tabeller som i praksis er tomme i prod: `communications` (0 rader — `/kommunikasjon` kjører da på fallback), `fishHealthObservations` (0), `landbruksregisterCompanies` (4).

### A3. Konsern-dekningsrevisjonen måler mot feil år

`scripts/audit-konsern-coverage.ts` setter `latestYear = currentYear - 1` = **2025** og teller barn med `CompanyFinancial` for akkurat det året. Alt datagrunnlag er 2024-tall (202 `revenue2024`-felter i tre-skriptene; 0 `revenue2025`). Resultat: **alle** 14 konsern får `childrenWithLatestFinancial: 0`, og gaps-listene melder «X datterselskap uten siste års regnskap» selv der 2024-regnskap ligger inne. Kvalitetsscorene (4–7) ser dermed troverdige ut, men hviler på en måling som per definisjon ikke kan bli grønn før 2025-regnskapene foreligger — og blir rød igjen hver 1. januar. Dette er den mest konkrete bekreftelsen på magefølelsen din: selv kontrollsystemet for datadekning er ikke koblet riktig til underlaget.

### A4. Øvrige felthull på listeflatene

`/havbruk`: `capacityTonnes` er null for mange lokaliteter (Fiskeridirektoratet-uttrekk), uten merking. `/eiendommer`: `sqMeters` og `acquiredYear` ofte null; `source`-feltet finnes per rad, men vises ikke som kvalitetssignal. `/produsenter`: viser kun de første 100 av et større register uten synlig paginering eller totaltall i kontekst. Disse hullene er av samme klasse som omsetningshullet: reelle, men verre enn nødvendig fordi de er umarkerte.

## 4. Funn B — Sporbarhet fra visning til underlag

### B1. Forsidens KPI-kort er hardkodede og ukildede

`src/app/page.tsx` har `FOOD_SYSTEM_KPIS` rett i sidefilen: «3 849 butikker», «96 % konsentrasjon», «44 % selvforsyningsgrad», «390 000 t matsvinn». Ingen av dem har kilde, år eller lenke til insight/SourceDoc — på samme forside som leserreisen ellers er nøye statusmerket. Dette er plattformens mest eksponerte tall, og de er de minst sporbare.

### B2. Selvforsyningsgraden finnes i fire varianter

Samme størrelse oppgis som **44 %** (forsidens KPI), **41,3 % / 34,9 %** (NIBIO 2024, brukt i `/sammenligning` og `insights.ts` — den claim-låste varianten), og **45 %** («nasjonal baseline» i kart-sårbarhetsmodellen `src/lib/config/countries/no.ts`). Tre flater, fire tall, ingen kryssreferanse. Tilsvarende har `/sammenligning` hardkodede narrativ-tall (HHI 3445/2157, «9 måneders kornreserve», «Danmark ~300 %») skrevet inn i komponentteksten i stedet for å renderes fra dataene de omtaler — endres datagrunnlaget, blir teksten stående.

### B3. Claim-styringen lever i en statisk fil

`foodTgClaimBoard`, `foodTgOpportunityRadar` og `foodTgMandateSummary` ligger i `src/lib/data/food-tg-mandate.ts` og rendres på både `/mandat` og `/metodikk` uten oppdateringsdato. Claim-statusene (internt-trygt, needs-primary-check, …) er altså selv et øyeblicksbilde uten synlig alder — for et styringssystem hvis hele poeng er status over tid.

### B4. Stille fallback gjør proveniens uavgjørbar

`/api/data-status` dokumenterer fem `fallbackSurfaces`: `/`, `/moter`, `/kommunikasjon`, `/sok` og entitetsflatene faller tilbake til statiske `src/lib/data/*.ts`-filer når Prisma-data mangler — uten visuell indikasjon. Med `communications = 0` i prod betyr det at `/kommunikasjon` i dag *alltid* viser fallback-innhold, presentert likt som DB-innhold. Systemet vet selv om risikoen (merket «medium»), men brukeren ser den aldri.

### B5. Metrics-artefakter uten synlig alder

`compute-metrics`-kjeden skriver `chart-metrics.json`, `value-chain.json` og `konsern-coverage.json` ved bygg (nå med write-on-change, så filene oppdateres bare ved endring — riktig valg). Men ingen flate viser `generatedAt` til leseren: kartets chart-metrics, verdikjedetallene og konserndekningen presenteres uten alder. `konsern-coverage.json` står på 25.05; politikk-JSON-ene (`policy-landscape.json`, `policy-timeseries.json`) er manuelt vedlikeholdt uten noe oppdateringsregime.

## 5. Funn C — Informasjonsarkitektur og presentasjon

### C1. Listedumper uten stillas

Ni flater er i praksis rene lister/tabeller uten kontekstlag: `/selskap` (185+ rader, 14 kolonner), `/aktorer` (169), `/produsenter`, `/havbruk` (to tabeller + stats), `/eiendommer`, `/kilder` (det tyngste — 375 000 tegn body i helsesjekkens måling), `/bibliotek`, `/rapporter`, `/innsikt`. Fellesnevner: ingen «sist oppdatert», ingen kolonnedefinisjoner, ingen kvalitetsmerker per rad, ingen forklaring på hva utvalget er (hvorfor akkurat disse selskapene?), og null-verdier som rendres som tomrom. Ordlisten fra p1b-arbeidet (juni) finnes som komponent, men er ikke koblet på listesidenes kolonner.

### C2. Overlappende flater

Fire par gjør navigasjonen forvirrende: **`/mandat` vs `/metodikk`** er strukturelt nesten identiske (samme claim-board, samme radar, samme KPI-fliser, begge med CausalLoopDiagram + EmergenceVisualization — og `/mandat` har attpåtil H1 «Metodikk»). **`/kilder` vs `/bibliotek`** skiller ikke formål (kildekontroll vs lesing). **`/verdikjede` vs `/forsyningskjede`** mangler felles inngang som forklarer arbeidsdelingen (struktur vs flyt). **`/okonomi` vs `/subsidier`** viser delvis samme subsidieaggregater. For en leser betyr det fire steder å lure på «var det her eller på den andre siden jeg så det?».

### C3. Modellene står ikke der de forklarer noe

Årsaksløkkene og emergens-visualiseringen ligger på metodikk-/mandatsidene; interessentkvadranten ligger nederst i aktørlisten; grafkvalitets-tilene ligger på `/graf` med god framing (det beste eksempelet i appen — «QA, navigasjon, isolat-kø, ikke selvstendig bevis»). Men på flatene der leseren møter tallene (forsiden, verdikjede, sammenligning) er det ingen modell som binder dem sammen. Resultat: modellene finnes, men oppleves ikke — de er plassert etter produksjonslogikk, ikke leselogikk.

### C4. Navigasjon og foreldreløse ruter

Sidemenyen har 8 grupper og 31 oppføringer, men 12 detaljruter (selskap/[id], aktorer/[slug], eierskap/[slug], personer/[personKey], hvitbok/proveniens, kart/[country]/flow m.fl.) er kun nåbare via interne lenker, uten brødsmulesti tilbake. `/kart` er en hardkodet redirect til `/kart/no`. Gruppelogikken (SELSKAP vs MATSYSTEM vs KUNNSKAP) er fornuftig, men gruppene har ingen inngangssider som forklarer hva de svarer på.

### C5. Det som faktisk fungerer

For balansens skyld: forsidens leserreise med statusmerker, `/graf` sin QA-framing, `/havbruk` sin kildeangivelse (Fiskeridirektoratet), `/aktorer` sin interne banner («teamets arbeidsvurderinger, ikke eksterne fakta»), intern/ekstern-skillet fra 08.06-planen og ordliste-komponenten er riktige mønstre — de er bare ikke rullet ut konsistent. Målbildet er i praksis: gjør resten av appen like ærlig som disse flatene.

## 6. Delta mot det som allerede er gjort eller planlagt

| Tema | Status | Konsekvens for denne analysen |
|---|---|---|
| Intern/ekstern-skille (`InternalBanner`/`InternalSection`) | Ferdig 09.06 (PR #121) | Løser publikumsdimensjonen; løser ikke proveniens/datering |
| Ordliste-konsolidering (p1b) | Ferdig 09.06 (PR #123) | Komponent klar — skal gjenbrukes til kolonnedefinisjoner (G-07) |
| DB-term-lekkasje i UI (p2a) | Ferdig 09.06 (PR #124) | Språk ryddet; struktur gjenstår |
| Citable-gate / SourceCitation-hardening | Ferdig 26.05 + reparert 09–10.06 | Sporbarhet på claim-nivå er sterk — gapet er på *flate*-nivå (KPI-er, narrativ, artefakter) |
| Datakvalitet-merking / CoverageBadge-plan | **Åpen** (plan 2026-05-29) | Overlapper G-04/G-05; planen gjenbrukes, ikke dupliseres |
| Eierskap-rebuild fase 1 (konsernregister + coverage-audit) | Delvis (audit-skript finnes, måler feil år) | G-01/G-02 retter og fullfører |
| Datagap-rapport 29.04 (59 tematiske hull) | Åpen | Tematiske forskningshull; denne analysen dekker *plattform*-hull — komplementært |
| Helsesjekk 27.05 | Restanser P1/P2 åpne | Graf-isolater og remediation-backlog tas ikke om igjen her |

## 7. Risikobilde

Uten tiltak: (1) **Tillitskollaps innenfra** — når teamet selv ikke kan se om et tall er levende, slutter man å bruke flatene og går tilbake til dokumenter; plattformens verdi som beslutningsgrunnlag forvitrer. (2) **Feilsiteringsrisiko utover** — hardkodede, ukildede KPI-er på forsiden er det første en ekstern leser ser og det letteste å sitere feil; med hvitbok-løpet mot Q4 2026 er det en reell eksponering, citable-gate til tross (gaten dekker claims, ikke sidetall). (3) **Skjult råte** — år-bugen i dekningsmålingen og stille fallback betyr at forverring ikke vil synes: målingene er enten alltid røde (og ignoreres) eller usynlige. (4) **Voksende opprydningskostnad** — hver ny forskningsrunde som importerer entiteter uten finans-/kildedimensjon (som aprilrunden) øker gapet lineært.

## 8. Målbilde per flate

Prinsippet: hver side skal kunne svare på tre spørsmål i toppen — *Hva svarer denne siden på? Hvor kommer tallene fra, og når? Hva mangler?* Konkret per hovedflate:

| Flate | Spørsmålet siden skal svare på | Viktigste mangel i dag |
|---|---|---|
| `/` | Hva er prosjektet, hvor står det, hvor går jeg? | KPI-er uten kilde/dato |
| `/selskap` | Hvilke selskaper er kartlagt, med hvilken dybde? | Dekningsmerking per rad; null-semantikk |
| `/eierskap` | Hvem eier hva, hvor sikre er trærne? | Tre-data avstemt mot korpus; årsmerking |
| `/okonomi` | Hva viser regnskaps- og subsidietallene samlet? | Dekningsfotnoter («sum av X av Y selskaper») |
| `/verdikjede` + `/forsyningskjede` | Struktur vs flyt — felles inngang | Arbeidsdeling uforklart; blandet proveniens |
| `/sammenligning` | Nordiske nøkkeltall, kildet | Hardkodet narrativ frikoblet fra data |
| `/mandat` (slått sammen med `/metodikk`) | Claim-status nå + hvordan vi jobber | Duplikat; statisk claim-board uten dato |
| `/kilder` vs `/bibliotek` | Kildekontroll vs lesing | Formålsskille uforklart |
| `/graf` | Hvor henger kunnskapen sammen, hvor er hullene? | Allerede nær målbildet |

## 9. Anbefalt rekkefølge

Fase 0 først — **fiks målingene før dataene** (år-bug, prod-avstemming, dekningsdashboard), ellers kan ingen senere goal verifiseres ærlig. Deretter fase 1 (kontekststillas — størst opplevd effekt per time), fase 2 (datahull — kan delvis parallelliseres med fase 1), fase 3 (IA-konsolidering — krever beslutninger fra deg på sammenslåinger), fase 4 (strukturell forankring). Full nedbryting med akseptkriterier og verifisering per goal: `docs/project/plans/plattformloft-goal-arbeidsplan-2026-06-11.md`.

## Vedlegg A — Side-for-side-status (komprimert)

| Rute | Proveniens | Hovedproblem |
|---|---|---|
| `/` | DB + hardkodet KPI + fallback | Ukildede KPI-er; fallback usynlig |
| `/sok` | DB (semantisk + fallback nøkkelord) | Fallback usynlig |
| `/team` | DB | OK (tynn) |
| `/moter` | DB + fallback | Fallback usynlig; ingen periodeangivelse |
| `/kommunikasjon` | **Fallback i praksis (0 DB-rader)** | Vises som DB-innhold |
| `/mandat` | Statisk TS + DB | Duplikat av /metodikk; H1 feil; claim-board uten dato |
| `/metodikk` | Statisk TS + DB | Duplikat av /mandat |
| `/tidslinje` | DB | OK (tynn) |
| `/selskap` | DB | Null-omsetning umarkert; ingen radkvalitet; 14 kolonner uforklart |
| `/eierskap` | DB + konsern-coverage-artefakt | Trær ikke avstemt; årslogikk feil i audit |
| `/styremedlemmer` | DB (interlock-graf) | Lite kontekst |
| `/personer` | DB | Lite kontekst |
| `/eiendommer` | DB | sqm/år-hull umarkert; source-felt ubrukt i UI |
| `/verdikjede` | Hardkodede stages + DB-berikelse | Blandet proveniens umarkert |
| `/forsyningskjede` | DB (6 queries) + artefakter | Kompleks; integrasjon uforklart |
| `/havbruk` | DB (Fiskeridirektoratet) | Kapasitet-null umarkert; ellers godt kildet |
| `/sirkularitet` | Statisk/komponent | Ikke DB-koblet |
| `/okonomi` | DB (5 queries) | Aggregater uten dekningsfotnote |
| `/produsenter` | DB | Paginering skjult; utvalg uforklart |
| `/subsidier` | DB (7 queries) | Kompleks; godt datagrunnlag, tynn framing |
| `/sammenligning` | Statisk JSON + DB + hardkodet narrativ | Narrativ frikoblet fra data; HHI/kornreserve hardkodet |
| `/politikk` | Manuelle JSON-er + DB + CSV | JSON-vedlikehold uten regime |
| `/kart` | Redirect + geojson/chart-metrics | Artefaktalder usynlig |
| `/media` | Hardkodet + DB (5 queries) | 835 linjer; redaksjonelt vs data uskilt; «confidence» er skjønn |
| `/innsikt` | DB | Nær målbildet (claim-merker finnes) |
| `/forskningsrunder` | Hardkodede runde-ID-er + CSV + DB | CSV-alder usynlig; runde-tillegg krever kode |
| `/masteroppgaver` | DB (stille feil-fallback) | Feil maskeres |
| `/graf` | DB | **Nær målbildet** — bruk som mønster |
| `/aktorer` | DB | Subjektive scorer uten metode-/datostempel (banner finnes) |
| `/rapporter` | DB | Lite kontekst |
| `/hvitbok` | Hardkodede kapitler | Kapittelstatus uforklart |
| `/bibliotek` | DB | Formålsskille mot /kilder |
| `/kilder` | DB + CSV-matching | Tyngste flate; backlog-alder usynlig |

## Vedlegg B — Tallgrunnlag

| Påstand | Grunnlag |
|---|---|
| 270 unike org.nr. i korpus; ≥126 uten finansdata; 6 org.nr. i flere skript | Statisk parsing av alle `scripts/import-*.ts` (orgNr- og revenue-felter), 11.06 |
| 202 `revenue2024`-felter, 0 `revenue2025` | grep over de 14 tre-skriptene |
| 185 selskaper, 0 communications, 0 fishHealth, 4 landbruksregister i prod | `GET /api/data-status` 11.06 (bygg 4ac53e7, 10.06) |
| `latestYear = currentYear - 1` (= 2025) i dekningsaudit | `scripts/audit-konsern-coverage.ts`, linje ~72–78 |
| treeSize 1–4 vs 3–21 i skript; alle konsern 0 barn med «siste års regnskap» | `data/konsern-coverage.json` (generatedAt 2026-05-25) vs tre-skriptene |
| KPI-hardkoding forsiden | `src/app/page.tsx` linje 9–14 |
| Selvforsyning 44 % / 41,3 % / 34,9 % / 45 % | `page.tsx`, `SammenligningContent.tsx` linje 194/200, `insights.ts`, `config/countries/no.ts` linje 133–135 |
| Fallback-flater med risiko «medium» | `/api/data-status` → `fallbackSurfaces` |
