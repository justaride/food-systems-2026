# Food TG R13 - short report and big-step next-session prompt

**Dato:** 2026-06-25
**Worktree:** `/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/food-tg-research-r13`
**Branch:** `codex/food-tg-research-r13`
**Status:** R13 er verifisert og commit-klar, men ikke staged/committed/pushed.

## Kort rapport

R13-mottaket er strukturelt ferdig som intern research- og gatepakke:

- 50 / 50 backlogg-IDer har decision-rad.
- 50 / 50 decision-IDer er unike.
- 13 / 13 batchrapporter finnes.
- Alle canonical output paths finnes.
- Claim-lock candidates er fortsatt 0.
- `git diff --check` var ren.
- `npm run audit:research-artifacts -- --base=origin/main` rapporterte `Violations: 0`.
- Ingen DB-skriving, claim-åpning, figur, deck-tekst eller whitepaper-stemme ble gjort.

R13 er fortsatt ikke ekstern faktapakke. Den er et kontrollert internt grunnlag med:

- `PCQ-ready`: 13
- `source-shortlist`: 24
- `actor-gate`: 6
- `forstaelse`: 4
- `internal only`: 3
- `parkert`: 1
- `må ikke visualiseres ennå`: 50

Neste store steg bør være en kombinert session som først sikrer commit-gate, og deretter tar en stor, men fortsatt kontrollert, PCQ-/actor-gate-arbeidsblokk.

## Copy-paste prompt for next Codex session

```text
Du skal fortsette Food TG Research OS R13 i denne worktree-en:

/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/food-tg-research-r13

Mål for denne sessionen:
1. Sikre R13 commit-gate hvis Gabriel ber om commit eller sier "kjør hele denne".
2. Ta et større kontrollert steg enn forrige session:
   - bygg PCQ-artefakter for topp 8 PCQ-rader, og
   - bygg actor-gate public-validation/data-owner-pakker for de 6 actor-gate-radene.
3. Ikke åpne claims, ikke skrive DB, ikke lage figurer, og ikke gjøre R13 til ekstern faktapakke.

VIKTIG:
- Arbeid kun i denne worktree-en, ikke hovedcheckouten.
- Branch skal være `codex/food-tg-research-r13`.
- Start med å verifisere:
  - `pwd`
  - `git rev-parse --show-toplevel`
  - `git status --short --branch`
- Ikke skriv DB.
- Ikke åpne claims.
- Ikke bruk `safe_for_ai_context`.
- Ikke skriv whitepaper/deck-stemme.
- Ikke lag figurer eller visualiseringer.
- Ikke start ny bred researchrunde.
- Ikke push/merge uten at Gabriel ber eksplisitt om akkurat det.

Hvis Gabriel sier "kjør hele denne" eller "commit og fortsett", behandle det som eksplisitt lov til å stage og committe R13-scope først. Det er fortsatt ikke lov til å pushe eller merge uten en ny eksplisitt beskjed.

Nåværende verifisert status per 2026-06-25:
- R13 er mottaksført med 50 / 50 prompter.
- Decision-batcher finnes for `batch-01` til `batch-13`.
- Siste kontroll viste:
  - backlog: 50
  - decisions: 50
  - unique: 50
  - missing total: 0 []
  - duplicate ids: []
  - missing canonical paths: []
  - 13 / 13 batchrapporter
  - schema/path/content errors: 0
  - `git diff --check` ren
  - `npm run audit:research-artifacts -- --base=origin/main`: Violations 0
- `research/_status/food-tg-r13/r13-intake-index-2026-06-25.md` viser:
  - PCQ-ready: 13
  - source-shortlist: 24
  - claim-lock candidate: 0
  - actor-gate: 6
  - forstaelse: 4
  - internal only: 3
  - parkert: 1
  - må ikke visualiseres ennå: 50

Les først:
1. `research/_status/food-tg-r13/r13-risk-closeout-2026-06-25.md`
2. `research/_status/food-tg-r13/r13-commit-gate-2026-06-25.md`
3. `research/_status/food-tg-r13/r13-qc-report-2026-06-25.md`
4. `research/_status/food-tg-r13/r13-pcq-first-pass-2026-06-25.md`
5. `research/_status/food-tg-r13/r13-pcq-queue-2026-06-25.md`
6. `research/_status/food-tg-r13/r13-actor-gate-action-packet-2026-06-25.md`
7. `research/_status/food-tg-r13/r13-actor-gate-backlog-2026-06-25.md`
8. `research/_status/food-tg-r13/r13-intake-index-2026-06-25.md`
9. `research/_status/food-tg-research-backlog-2026-06-25.csv`
10. `docs/project/mandates/food-tg-research-runde13-goal-codex-2026-06-25.md`

## Fase 0 - repo- og gatekontroll

Kjør:

```bash
pwd
git rev-parse --show-toplevel
git status --short --branch

python3 - <<'PY'
import csv, json, pathlib
ids=[r["id"] for r in csv.DictReader(open("research/_status/food-tg-research-backlog-2026-06-25.csv"))]
dec=[]
missing_paths=[]
for p in sorted(pathlib.Path("research/_status/food-tg-r13/decisions").glob("batch-*.jsonl")):
    rows=[json.loads(l) for l in p.read_text().splitlines() if l.strip()]
    print(p.name, len(rows), [r["id"] for r in rows])
    dec += rows
    for r in rows:
        cp=r.get("canonicalPath")
        if cp and not pathlib.Path(cp).exists():
            missing_paths.append((r.get("id"), cp))
dids=[d["id"] for d in dec]
print("backlog:",len(ids),"decisions:",len(dids),"unique:",len(set(dids)))
print("missing total", len(set(ids)-set(dids)), sorted(set(ids)-set(dids)))
print("duplicate ids", sorted({x for x in dids if dids.count(x)>1}))
print("missing canonical paths", missing_paths)
PY

git diff --check
npm run audit:research-artifacts -- --base=origin/main
```

Hvis dette ikke er grønt, stopp og rapporter. Ikke gå videre til PCQ/actor-gate.

## Fase 1 - commit-gate hvis autorisert

Hvis Gabriel har bedt om commit, stage kun R13-scope path-bounded:

```bash
git add \
  docs/project/mandates/food-tg-research-runde13-goal-codex-2026-06-25.md \
  docs/project/mandates/food-tg-research-runde13-promptpack-2026-06-25.md \
  docs/project/mandates/food-tg-research-runde13-masterplan-2026-06-25.md \
  docs/project/mandates/food-tg-r13-next-session-qc-pcq-prompt-2026-06-25.md \
  docs/project/mandates/food-tg-r13-next-session-commit-pcq-actor-prompt-2026-06-25.md \
  docs/project/mandates/food-tg-r13-next-session-big-step-pcq-actor-prompt-2026-06-25.md \
  docs/project/mandates/R13-*.md \
  research/_status/food-tg-r13/ \
  research/_status/R13-AKTOR-*.md \
  research/external/r13/ \
  research/forstaelse/R13-*.md

git diff --cached --check
git diff --cached --name-only
```

Sjekk staged-listen manuelt. Den skal ikke inneholde `.env`, DB-dump, `.next`, `node_modules`, cache, chart-metrics, appkode, deck/whitepaper eller hovedcheckout-endringer.

Commit:

```bash
git commit -m "research: complete r13 intake qc and control queues"
```

Ikke push/merge uten ny eksplisitt beskjed.

## Fase 2 - større PCQ-blokk, topp 8

Arbeid med topp 8 fra `r13-pcq-first-pass-2026-06-25.md`. Dette er fortsatt PCQ-only, ikke claim-lock.

Opprett directory hvis den mangler:

```bash
mkdir -p research/_status/food-tg-r13/pcq
```

Lag disse åtte artefaktene:

1. `research/_status/food-tg-r13/pcq/R13-GAP-001-importnode-extraction-sheet-2026-06-25.md`
2. `research/_status/food-tg-r13/pcq/R13-OKO-001-okoareal-mal-kort-2026-06-25.md`
3. `research/_status/food-tg-r13/pcq/R13-WASTE-001-rstige-metodetabell-2026-06-25.md`
4. `research/_status/food-tg-r13/pcq/R13-LAND-001-strukturkart-ledger-2026-06-25.md`
5. `research/_status/food-tg-r13/pcq/R13-OKO-007-policy-target-matrix-2026-06-25.md`
6. `research/_status/food-tg-r13/pcq/R13-WASTE-004-matsvinn-baseline-tabell-2026-06-25.md`
7. `research/_status/food-tg-r13/pcq/R13-LAND-002-ownership-edge-ledger-2026-06-25.md`
8. `research/_status/food-tg-r13/pcq/R13-OKO-003-soil-monitoring-gap-card-2026-06-25.md`

Bruk samme minimumsmal i hver fil:

```markdown
# [ID] - [kort tittel] PCQ control artifact

**Dato:** 2026-06-25
**Status:** PCQ-only, ikke claim-lock
**Kildegrunnlag:** [kort]
**Bruksregel:** Intern kontroll. Ikke figur, deck, whitepaper eller ekstern claim.

## Kort dom

[2-4 setninger om hva PCQ-en kan kontrollere, og hva den ikke kan kontrollere.]

## Radvis uttrekk

| Rad | Kilde | Lokator | År/periode | Klasse | Uttrekk | Enhet | Scope | Metodegap | Tom celle |
|---|---|---|---|---|---|---|---|---|---|
| 1 |  |  |  | A/B/C |  |  |  |  |  |

## Kontrollert intern formulering

- [Kun formulering som tåler kildegrunnlaget.]

## Fortsatt ikke claim-lock

| Mangler | Hvorfor det stopper claim/figur |
|---|---|
|  |  |

## Ikke si

- Ikke si at denne raden er claim-locket.
- Ikke bruk URL-status som bevis for tallinnhold.
- Ikke fyll tomme celler med estimat.
```

Arbeidsregel for større steg:
- Du kan bruke parallelle subagents hvis tilgjengelig, men main agent må verifisere alle filer før slutt.
- Del PCQ i to bølger:
  - Bølge A: `R13-GAP-001`, `R13-OKO-001`, `R13-WASTE-001`, `R13-LAND-001`
  - Bølge B: `R13-OKO-007`, `R13-WASTE-004`, `R13-LAND-002`, `R13-OKO-003`
- Ikke gå videre til claim-lock etterpå. Sluttstatus skal være "PCQ kontrollert, fortsatt ikke claim-lock".

## Fase 3 - actor-gate public-validation/data-owner-pakker

Opprett directory hvis den mangler:

```bash
mkdir -p research/_status/food-tg-r13/actor-gate
```

Lag disse seks artefaktene:

1. `research/_status/food-tg-r13/actor-gate/R13-GAP-006-dataeier-per-hull-2026-06-25.md`
2. `research/_status/food-tg-r13/actor-gate/R13-AKTOR-001-markedshager-public-validation-2026-06-25.md`
3. `research/_status/food-tg-r13/actor-gate/R13-AKTOR-002-andelslandbruk-public-validation-2026-06-25.md`
4. `research/_status/food-tg-r13/actor-gate/R13-AKTOR-004-regenerative-praktikere-public-validation-2026-06-25.md`
5. `research/_status/food-tg-r13/actor-gate/R13-AKTOR-005-fro-genressurs-dataeier-2026-06-25.md`
6. `research/_status/food-tg-r13/actor-gate/R13-AKTOR-007-skogshage-permakultur-public-validation-2026-06-25.md`

Dette skal ikke være en total kartlegging. Det skal være en actor-gate action surface: hvem eier data, hva kan verifiseres offentlig, hva krever kontakt, og hva må fortsatt stå tomt.

Bruk denne minimumsmalen:

```markdown
# [ID] - actor-gate validation packet

**Dato:** 2026-06-25
**Status:** actor-gate, ikke lukket
**Bruksregel:** Intern kontroll. Ikke publiser totalantall, kart eller nettverksgraf.

## Kort dom

[2-4 setninger om hva som kan valideres lavfriksjon, og hva som fortsatt krever dataeier/aktør.]

## Dataeier- og valideringsrad

| Felt | Mulig dataeier | Offentlig lavfriksjon-lokator | Krever kontakt? | Godkjent evidensform | Stoppsignal |
|---|---|---|---|---|---|
| aktiv-status |  |  | ja/nei | datert aktørside/register/bekreftelse | kart/API alene er ikke nok |

## Kandidat-/dekningstabell

| Kandidat/node | Locator | Kildeklasse | Aktiv-status | Dekningscaveat | Tom celle |
|---|---|---|---|---|---|
|  |  | A/B/C | ukjent/aktiv/inaktiv |  |  |

## Før eventuell DASK/AASK

- [Presist spørsmål til dataeier.]
- [Felt som må etterspørres.]
- [Hva som ikke skal estimeres.]

## Ikke si

- Ikke si at actor-gate er lukket.
- Ikke publiser totalantall eller kart fra kandidatflate.
- Ikke gjør medlemskap, karttreff eller selvbeskrivelse til produksjons-/effektbevis.
```

## Fase 4 - samle større steg i kontroll-ledger

Når PCQ- og actor-gate-filene er skrevet, lag:

`research/_status/food-tg-r13/r13-big-step-control-ledger-2026-06-25.md`

Innhold:

- Kort oppsummering av hva som ble opprettet.
- Tabell med alle 8 PCQ-artefakter og status: `PCQ-only`, `ikke claim-lock`.
- Tabell med alle 6 actor-gate-pakker og status: `actor-gate`, `ikke lukket`.
- Liste over hvilke rader som eventuelt kan vurderes i en senere claim-lock session.
- Liste over rader som fortsatt ikke må visualiseres.
- Neste anbefalte session etter dette.

## Fase 5 - sluttkontroller

Kjør alltid før sluttmelding:

```bash
python3 - <<'PY'
import csv, json, pathlib, sys
ids=[r["id"] for r in csv.DictReader(open("research/_status/food-tg-research-backlog-2026-06-25.csv"))]
dec=[]
missing_paths=[]
for p in sorted(pathlib.Path("research/_status/food-tg-r13/decisions").glob("batch-*.jsonl")):
    rows=[json.loads(l) for l in p.read_text().splitlines() if l.strip()]
    dec += rows
    for r in rows:
        cp=r.get("canonicalPath")
        if cp and not pathlib.Path(cp).exists():
            missing_paths.append((r.get("id"), cp))
dids=[d["id"] for d in dec]
print("backlog:",len(ids),"decisions:",len(dids),"unique:",len(set(dids)))
print("missing total", len(set(ids)-set(dids)), sorted(set(ids)-set(dids)))
print("duplicate ids", sorted({x for x in dids if dids.count(x)>1}))
print("missing canonical paths", missing_paths)

required = [
 "research/_status/food-tg-r13/pcq/R13-GAP-001-importnode-extraction-sheet-2026-06-25.md",
 "research/_status/food-tg-r13/pcq/R13-OKO-001-okoareal-mal-kort-2026-06-25.md",
 "research/_status/food-tg-r13/pcq/R13-WASTE-001-rstige-metodetabell-2026-06-25.md",
 "research/_status/food-tg-r13/pcq/R13-LAND-001-strukturkart-ledger-2026-06-25.md",
 "research/_status/food-tg-r13/pcq/R13-OKO-007-policy-target-matrix-2026-06-25.md",
 "research/_status/food-tg-r13/pcq/R13-WASTE-004-matsvinn-baseline-tabell-2026-06-25.md",
 "research/_status/food-tg-r13/pcq/R13-LAND-002-ownership-edge-ledger-2026-06-25.md",
 "research/_status/food-tg-r13/pcq/R13-OKO-003-soil-monitoring-gap-card-2026-06-25.md",
 "research/_status/food-tg-r13/actor-gate/R13-GAP-006-dataeier-per-hull-2026-06-25.md",
 "research/_status/food-tg-r13/actor-gate/R13-AKTOR-001-markedshager-public-validation-2026-06-25.md",
 "research/_status/food-tg-r13/actor-gate/R13-AKTOR-002-andelslandbruk-public-validation-2026-06-25.md",
 "research/_status/food-tg-r13/actor-gate/R13-AKTOR-004-regenerative-praktikere-public-validation-2026-06-25.md",
 "research/_status/food-tg-r13/actor-gate/R13-AKTOR-005-fro-genressurs-dataeier-2026-06-25.md",
 "research/_status/food-tg-r13/actor-gate/R13-AKTOR-007-skogshage-permakultur-public-validation-2026-06-25.md",
 "research/_status/food-tg-r13/r13-big-step-control-ledger-2026-06-25.md",
]
missing=[p for p in required if not pathlib.Path(p).exists()]
print("big-step artifacts missing", missing)
sys.exit(1 if missing_paths or missing else 0)
PY

rg -n "safe_for_ai_context" research/_status/food-tg-r13/pcq research/_status/food-tg-r13/actor-gate research/_status/food-tg-r13/r13-big-step-control-ledger-2026-06-25.md
git diff --check
npm run audit:research-artifacts -- --base=origin/main
git status --short --branch
```

Merk: `rg safe_for_ai_context` kan finne stoppliste/regeltekst hvis du har skrevet det i kontrollnotater. Det er ikke automatisk feil hvis forekomsten bare sier at det ikke skal brukes. Hvis det dukker opp som metadatafelt eller importflagg, stopp.

## Sluttmelding

Rapporter kort:

- Om commit ble gjort eller ikke, med commit-hash hvis ja.
- Hvilke PCQ-filer som ble opprettet.
- Hvilke actor-gate-filer som ble opprettet.
- Om decision-count fortsatt er 50/50.
- Om `git diff --check` er ren.
- Om `npm run audit:research-artifacts -- --base=origin/main` har 0 violations.
- Hva som fortsatt er PCQ-only.
- Hva som fortsatt er actor-gate.
- Bekreft eksplisitt at ingen claim-lock, DB-skriving, figurer, deck eller whitepaper ble laget.
```
