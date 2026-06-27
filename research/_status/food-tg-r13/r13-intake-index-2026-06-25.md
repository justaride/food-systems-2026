---
tittel: Food TG R13 intake/triageindeks
dato: 2026-06-25
status: MAL — fylles per fullført batch
scope: Runde 13 batch 01-13, basert på batchrapporter og decision JSONL
bruksregel: Ikke faktastemme. Ikke batch-output. Ikke whitepaper/deck. Bruk som triagekart for neste kontrollsteg.
relaterte_filer:
  - docs/project/mandates/food-tg-research-runde13-promptpack-2026-06-25.md
  - research/_status/food-tg-research-backlog-2026-06-25.csv
  - docs/project/mandates/food-tg-research-mottaksprotokoll-2026-06-24.md
  - docs/project/mandates/food-tg-research-runde13-goal-codex-2026-06-25.md
---

# Food TG R13 — intern mottaks-/triageindeks

Denne indeksen grupperer Runde 13-prompter etter mottaksstatus. Den bygger på `research/_status/food-tg-r13/report-batch-*.md` og `research/_status/food-tg-r13/decisions/batch-*.jsonl`. Ingen batch-output endres her — indeksen er kun et triagekart.

> **Slik fylles den:** etter hver fullført batch legges hver prompt-ID inn i riktig(e) gruppe(r) nedenfor med kolonnene `ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt`. En prompt kan stå i flere grupper når den har både en hovedgate og en stop-regel (f.eks. PCQ + må ikke visualiseres ennå). Oppdater også Kontrollstatus og Hurtigoppsummering.

## Kontrollstatus

- **Promptrader indeksert:** 8 / 50
- **Decision-batcher funnet:** batch-01 (R13-GAP-001, R13-GAP-005, R13-WASTE-001, R13-GAP-002), batch-02 (R13-GAP-004, R13-GAP-006, R13-GAP-003, R13-WASTE-002)
- **Batcher ikke funnet som decision/report-fil:** batch-03..13 (ikke startet)
- **Arbeidsregel:** alle rader er interne mottaks-/triageposter; ingen rad åpner ekstern claim, DB-skriving, `safe_for_ai_context`, whitepapertekst eller deckstemme.
- **Overlapp:** samme prompt kan ligge i flere grupper når den både har en hovedgate og en stop-regel.

## Hurtigoppsummering

| Gruppe | Antall | Bruk |
|---|---:|---|
| PCQ-ready | 4 | klar for primary-check queue / kontrollert uttrekk før eventuell claim-lock |
| source-shortlist | 3 | klar som kilde-/metodekandidat, ikke claim |
| claim-lock candidate | 1 | kun svært smal formulering kan vurderes etter PCQ |
| actor-gate | 2 | krever aktørdata, verifikasjon, kontrakt, avregning eller aktiv-status |
| forstaelse | 1 | bakgrunn/hypotese/mental modell; ikke faktastemme |
| internal only | 0 | intern modell, datakontrakt, funding-fit eller uttakskø |
| parkert | 1 | hele eller sentrale claims stoppet inntil ny locator/aktor/data finnes |
| må ikke visualiseres ennå | 5 | ikke lag ekstern figur/radar/rangering/deckuttak før gate og tomme celler vises |

## PCQ-ready

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| R13-GAP-001 | 01 | Kritiske importnoder | PCQ | SSB 08801 gir Type-A importtidsserie 2020–2024 (volum+verdi separat) for soya/fiskeolje/kaffe/kakao; fosfat ≈0 råimport (P via NPK); fôrprotein-total er Type-C metodeluke. | importer (PCQ; speil holdt ute) | research/external/r13/R13-GAP-001-kritiske-importnoder.md |
| R13-GAP-005 | 01 | Verifisering av 7 parkerte R12-claims | PCQ | 3 løftbare m/caveat (REKO 2022, andelslandbruk 93/2023, Rest-konkurs 2024), 1 delvis (fiskeolje), 3 parkert/nedgradert (ASKO 70 %, SOIL-score, Plantagon). | claim-lock-kandidat for smale rader; verifiser per claim | research/external/r13/R13-GAP-005-parkerte-claims-verifisering.md |
| R13-WASTE-001 | 01 | Marint restråstoff R-stige | PCQ | SINTEF/FHF fulltekst: ~1,1 mill. t, 89 % utnyttet, men kun ~15 % humant konsum vs 66 % fôr / ~19 % energi — utnyttet ≠ høyverdi. | importer (PCQ) | research/external/r13/R13-WASTE-001-marint-restrastoff-rstige.md |
| R13-WASTE-002 | 02 | Oppdrettsslam massebalanse | PCQ | Offentlige tall er modellerte utslipp (535 412 t slam / 14 000 t P, 2019); innsamlet/behandlet kun fragmenter; åpne merder samler ~0. Ingen 3-kolonners anleggsbalanse i åpne kilder. | vent — parkert til actor/primærdata (se også parkert) | research/external/r13/R13-WASTE-002-oppdrettsslam-massebalanse.md |

## source-shortlist

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| R13-GAP-002 | 01 | Lokale verdikjeder og forsyningssikkerhet | source-shortlist | Lokal/kort kjede øker forsyningssikkerhet kun via navngitt mekanisme (redundans, desentralisert lager, redusert innsatsvare-import) — ikke via identitet; ingen norsk kvantifisering funnet. | vent — kildekort, ikke claim | research/external/r13/R13-GAP-002-lokale-verdikjeder-resiliens.md |
| R13-GAP-004 | 02 | Alternative nordiske fôrproteiner | source-shortlist | Feltet dominert av kapasitet/plan, ikke realisert fôr-grade volum; Enorm (DK) konkurs okt 2025, Solar Foods 160 t/år men mat ikke fôr, Invertapro er mealworm. | aktørspørsmål (realisert volum, se også actor-gate) | research/external/r13/R13-GAP-004-alternative-nordiske-forproteiner.md |
| R13-GAP-003 | 02 | Transport/lager-sårbarhet (mat, Norden) | source-shortlist | Åpent myndighetsmateriale kobler transport/havn/lager/kaldkjede til mat, men overveiende kvalitativt; tallfestet: NO ~60 % importavhengighet, 34–40 % fôrjustert selvforsyning, 82 500 t matkorn (~3 mnd) innen 2029. | importer som kildekort; node-tonnasje forblir C | research/external/r13/R13-GAP-003-transport-lager-sarbarhet.md |

## claim-lock candidate

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| R13-GAP-005 | 01 | Verifisering av 7 parkerte R12-claims | PCQ → claim-lock | Kun de smaleste radene med uavhengig primær (Rest-konkurs 2024, andelslandbruk 93/2023) er claim-lock-kandidater; ASKO 70 % og SOIL-score blir IKKE claims. | smal claim-lock kun etter PCQ, per rad | research/external/r13/R13-GAP-005-parkerte-claims-verifisering.md |

## actor-gate

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| R13-GAP-006 | 02 | Type-C-eskalering + actor-gate-kø | forstaelse → actor-gate | R12s C-hull reklassifisert; Type-B-hull samlet i 14-posters actor-gate-kø; ekte C bevart som funn. | aktørspørsmål — bruk køen som inngang til neste actor-gate-runde | research/forstaelse/R13-GAP-006-type-c-eskalering.md |
| R13-GAP-004 | 02 | Alternative nordiske fôrproteiner | source-shortlist → actor-gate | Realisert fôr-grade årsvolum ikke offentlig for noen rendyrket nordisk aktør — krever aktørdata. | aktørspørsmål: be om realisert tonn per aktør/år | research/external/r13/R13-GAP-004-alternative-nordiske-forproteiner.md |

## forstaelse

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| R13-GAP-006 | 02 | Type-C-eskalering + actor-gate-kø | forstaelse | Intern triagesyntese over R12 intake; reklassifiserer hull A/B/C, ikke ny primær. Brukes som arbeidskart. | bruk som arbeidskart; hvert A-kall verifiseres ved uttrekk | research/forstaelse/R13-GAP-006-type-c-eskalering.md |

## internal only

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| | | | | | | |

## parkert

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| R13-WASTE-002 | 02 | Oppdrettsslam massebalanse | PCQ (parkert) | Ingen offentlig kilde gir modellert/innsamlet/behandlet per anlegg per år; åpne merder samler ~0. | parkert til actor-/primærdata kobler de tre kolonnene | research/external/r13/R13-WASTE-002-oppdrettsslam-massebalanse.md |

## må ikke visualiseres ennå

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| R13-GAP-001 | 01 | Kritiske importnoder | PCQ | Verdivekst (kakao/fiskeolje 2023→2024) er prishopp, ikke volumvekst; fôrprotein-total og reell fosfor-total er Type-C — ingen figur før dette vises. | ingen importgraf/rangering før volum/verdi og tomme celler vises | research/external/r13/R13-GAP-001-kritiske-importnoder.md |
| R13-GAP-005 | 01 | Verifisering av 7 parkerte R12-claims | PCQ | ASKO 70 %, SOIL-score m.fl. er omstridte/uprovenienserte; ingen rangering eller faktafigur. | ingen figur før PCQ per claim | research/external/r13/R13-GAP-005-parkerte-claims-verifisering.md |
| R13-WASTE-001 | 01 | Marint restråstoff R-stige | PCQ | R-stige-figur må vise tomme celler (eksportvolum per R-nivå, laksblod-tap) og skille utnyttet fra høyverdi. | ingen R-stige-figur før tomme celler og volum/verdi-skille er synlig | research/external/r13/R13-WASTE-001-marint-restrastoff-rstige.md |
| R13-GAP-004 | 02 | Alternative nordiske fôrproteiner | source-shortlist | Kapasitetstall (Enorm 10 000 t, Volare 5 000 t, Enifer 3 000 t osv.) er ikke realisert produksjon; ingen graf som blander kapasitet og volum. | ingen aktør-/kapasitetsgraf før realisert vs kapasitet skilles og konkurser vises | research/external/r13/R13-GAP-004-alternative-nordiske-forproteiner.md |
| R13-WASTE-002 | 02 | Oppdrettsslam massebalanse | PCQ | Modellert ≠ innsamlet; 60 %-tall er ett pilotanlegg, 90 % P-rensing er krav ikke resultat. | ingen massebalanse-figur før modellert/innsamlet/behandlet skilles og C-celler vises | research/external/r13/R13-WASTE-002-oppdrettsslam-massebalanse.md |

## Neste kontrollrekkefølge

1. Løft `PCQ-ready` først, men bare som smale kontrolloppgaver med locator, metodefelt og synlige C-celler.
2. Flytt `source-shortlist` til kildekort/metodekort før noen tekst blir claim-nær.
3. Hold `actor-gate` utenfor desk-claims til aktørdata eller primærlokator per aktør er innhentet.
4. Bruk `forstaelse` og `internal only` som arbeidskart, ikke som siterbar kunnskap.
5. Ikke visualiser R13 før figurgrunnlag har gate, dataklasse, svakeste punkt og tomme celler i selve figuren.

## Stoppliste

- Ikke importer hele R13-output i source-shortlist, PCQ, claim-lock, deck eller whitepaper.
- Ikke løft tall som bare er aktørrapportert, kapasitet forvekslet med realisert, eller strukturindikator gjort til intensjon, uten ny kontroll.
- Ikke lag nordisk rangering, radar/spider eller datagapfigur uten synlig scope, metode, gate og tomme celler.
- Ikke behandle `forstaelse` som kilde.
