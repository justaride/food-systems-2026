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

- **Promptrader indeksert:** 0 / 50
- **Decision-batcher funnet:** _(ingen ennå)_
- **Batcher ikke funnet som decision/report-fil:** _(fyll inn)_
- **Arbeidsregel:** alle rader er interne mottaks-/triageposter; ingen rad åpner ekstern claim, DB-skriving, `safe_for_ai_context`, whitepapertekst eller deckstemme.
- **Overlapp:** samme prompt kan ligge i flere grupper når den både har en hovedgate og en stop-regel.

## Hurtigoppsummering

| Gruppe | Antall | Bruk |
|---|---:|---|
| PCQ-ready | 0 | klar for primary-check queue / kontrollert uttrekk før eventuell claim-lock |
| source-shortlist | 0 | klar som kilde-/metodekandidat, ikke claim |
| claim-lock candidate | 0 | kun svært smal formulering kan vurderes etter PCQ |
| actor-gate | 0 | krever aktørdata, verifikasjon, kontrakt, avregning eller aktiv-status |
| forstaelse | 0 | bakgrunn/hypotese/mental modell; ikke faktastemme |
| internal only | 0 | intern modell, datakontrakt, funding-fit eller uttakskø |
| parkert | 0 | hele eller sentrale claims stoppet inntil ny locator/aktor/data finnes |
| må ikke visualiseres ennå | 0 | ikke lag ekstern figur/radar/rangering/deckuttak før gate og tomme celler vises |

## PCQ-ready

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| | | | | | | |

## source-shortlist

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| | | | | | | |

## claim-lock candidate

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| | | | | | | |

## actor-gate

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| | | | | | | |

## forstaelse

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| | | | | | | |

## internal only

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| | | | | | | |

## parkert

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| | | | | | | |

## må ikke visualiseres ennå

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| | | | | | | |

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
