---
tittel: Food TG R13 intake/triageindeks
dato: 2026-06-25
status: UNDER ARBEID — batch 01-03 mottaksført
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

- **Promptrader indeksert:** 12 / 50
- **Decision-batcher funnet:** `batch-01`, `batch-02`, `batch-03`
- **Batcher ikke funnet som decision/report-fil:** `batch-04`-`batch-13`
- **Arbeidsregel:** alle rader er interne mottaks-/triageposter; ingen rad åpner ekstern claim, DB-skriving, `safe_for_ai_context`, whitepapertekst eller deckstemme.
- **Overlapp:** samme prompt kan ligge i flere grupper når den både har en hovedgate og en stop-regel.

## Hurtigoppsummering

| Gruppe | Antall | Bruk |
|---|---:|---|
| PCQ-ready | 5 | klar for primary-check queue / kontrollert uttrekk før eventuell claim-lock |
| source-shortlist | 5 | klar som kilde-/metodekandidat, ikke claim |
| claim-lock candidate | 0 | kun svært smal formulering kan vurderes etter PCQ |
| actor-gate | 1 | krever aktørdata, verifikasjon, kontrakt, avregning eller aktiv-status |
| forstaelse | 1 | bakgrunn/hypotese/mental modell; ikke faktastemme |
| internal only | 0 | intern modell, datakontrakt, funding-fit eller uttakskø |
| parkert | 1 | hele eller sentrale claims stoppet inntil ny locator/aktor/data finnes |
| må ikke visualiseres ennå | 10 | ikke lag ekstern figur/radar/rangering/deckuttak før gate og tomme celler vises |

## PCQ-ready

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| R13-GAP-001 | 01 | Kritiske importnoder | PCQ | SSB 08801 lukker konkrete HS-serier, men sluttbruk og samlet fôrprotein er fortsatt C/metodegap. | importer | `research/external/r13/R13-GAP-001-kritiske-importnoder.md` |
| R13-WASTE-001 | 01 | Marint restråstoff R-stige | PCQ | SINTEF/FHF 2024 er A-anker for restråstoffstatus; R-stige krever synlig metode. | importer | `research/external/r13/R13-WASTE-001-marint-restrastoff-rstige.md` |
| R13-WASTE-002 | 02 | Oppdrettsslam massebalanse | PCQ | Oppdrettsslam er godt dokumentert som ressurs/problem; nasjonal realisert massebalanse mangler. | importer | `research/external/r13/R13-WASTE-002-oppdrettsslam-massebalanse.md` |
| R13-WASTE-004 | 03 | Husholdnings- og detaljmatsvinn | PCQ | Matvett/NORSUS gir baseline, men sektorer og metoder må vises per rad. | importer | `research/external/r13/R13-WASTE-004-husholdning-detalj-matsvinn.md` |
| R13-WASTE-005 | 03 | Digestat NPK-retur | PCQ | Sverige er A-anker via SPCR 120; Norge har ikke lukket faktisk NPK-retur. | importer | `research/external/r13/R13-WASTE-005-digestat-npk-retur.md` |

## source-shortlist

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| R13-GAP-002 | 01 | Lokale verdikjeder og forsyningssikkerhet | source-shortlist | Mekanisme-evidens finnes, men ikke for "lokalmat = resilient" uten mekanisme. | importer | `research/external/r13/R13-GAP-002-lokale-verdikjeder-resiliens.md` |
| R13-GAP-004 | 02 | Alternative nordiske fôrproteiner | source-shortlist | Alternative fôrproteiner er mest kapasitet/plan/pilot; realisert fôr-grade årsvolum er ikke offentlig lukket. | importer | `research/external/r13/R13-GAP-004-alternative-nordiske-forproteiner.md` |
| R13-GAP-003 | 02 | Transport og lager-sårbarhet | source-shortlist | Transport/lager kan være matrelevant risikoinventar, men ikke tallfestet kapasitetsmodell. | importer | `research/external/r13/R13-GAP-003-transport-lager-sarbarhet.md` |
| R13-WASTE-003 | 03 | Matsvinn-redistribusjon | source-shortlist | Matsentralen gir B-anker for 5 735 tonn omfordelt i 2024; ikke nasjonal redistribusjonstotal. | importer | `research/external/r13/R13-WASTE-003-matsvinn-redistribusjon.md` |
| R13-WASTE-007 | 03 | Industrielle næringssidestrømmer | source-shortlist | Industrielle sidestrømmer kan bli fraksjonsledger, ikke nasjonal volumclaim. | importer | `research/external/r13/R13-WASTE-007-industrielle-sidestrommer.md` |

## claim-lock candidate

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| | | | | | | |

## actor-gate

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| R13-GAP-006 | 02 | Type-C-eskalering og actor-gate-kø | actor-gate | Intern triage av hull; ikke ekstern kilde. | aktørspørsmål | `research/forstaelse/R13-GAP-006-type-c-eskalering.md` |

## forstaelse

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| R13-GAP-006 | 02 | Type-C-eskalering og actor-gate-kø | actor-gate | R12 C-hull er delt i Type A desk-uttak, Type B actor-gate og ekte Type C. | aktørspørsmål | `research/forstaelse/R13-GAP-006-type-c-eskalering.md` |

## internal only

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| | | | | | | |

## parkert

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| R13-GAP-005 | 01 | Parkerte R12-claims verifisering | parkert | Ingen parkert R12-tallclaim kan løftes direkte; delankre er styrket, men claimsene forblir parkert. | parker | `research/external/r13/R13-GAP-005-parkerte-claims-verifisering.md` |

## må ikke visualiseres ennå

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| R13-GAP-001 | 01 | Kritiske importnoder | PCQ | Kan visualiseres først når HS/proxy, sluttbruksgap og foreløpig/endelig status vises. | importer | `research/external/r13/R13-GAP-001-kritiske-importnoder.md` |
| R13-GAP-005 | 01 | Parkerte R12-claims verifisering | parkert | Skal ikke visualiseres som verifiserte claims; dette er en park-/nedgraderingsledger. | parker | `research/external/r13/R13-GAP-005-parkerte-claims-verifisering.md` |
| R13-WASTE-001 | 01 | Marint restråstoff R-stige | PCQ | R-stigefigur må vise metode og enhet per kategori. | importer | `research/external/r13/R13-WASTE-001-marint-restrastoff-rstige.md` |
| R13-GAP-004 | 02 | Alternative nordiske fôrproteiner | source-shortlist | Ingen aktørgraf som viser volum uten at realisert/kapasitet/plan er skilt. | importer | `research/external/r13/R13-GAP-004-alternative-nordiske-forproteiner.md` |
| R13-GAP-003 | 02 | Transport og lager-sårbarhet | source-shortlist | Ingen sårbarhetskart med dagsdekning/lagerkapasitet som ikke er åpent dokumentert. | importer | `research/external/r13/R13-GAP-003-transport-lager-sarbarhet.md` |
| R13-WASTE-002 | 02 | Oppdrettsslam massebalanse | PCQ | Ingen massebalansefigur som blander modellert, oppsamlet og behandlet volum. | importer | `research/external/r13/R13-WASTE-002-oppdrettsslam-massebalanse.md` |
| R13-WASTE-003 | 03 | Matsvinn-redistribusjon | source-shortlist | Ingen nasjonal redistribusjonsgraf uten metode og dobbelttellingskontroll. | importer | `research/external/r13/R13-WASTE-003-matsvinn-redistribusjon.md` |
| R13-WASTE-004 | 03 | Husholdnings- og detaljmatsvinn | PCQ | Ingen sektorfigur uten år/metode/scope per rad. | importer | `research/external/r13/R13-WASTE-004-husholdning-detalj-matsvinn.md` |
| R13-WASTE-005 | 03 | Digestat NPK-retur | PCQ | Ingen nordisk NPK-rangering eller digestat-returfigur uten faktisk spredd mengde. | importer | `research/external/r13/R13-WASTE-005-digestat-npk-retur.md` |
| R13-WASTE-007 | 03 | Industrielle næringssidestrømmer | source-shortlist | Ingen R-stige eller sidestrømsvolum som blander dagens bruk og potensial. | importer | `research/external/r13/R13-WASTE-007-industrielle-sidestrommer.md` |

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
