# Food TG R13 - superseded next-session prompt for QC, PCQ and commit gate

> **Status 2026-06-25:** Denne handoffen er gjennomført og er erstattet av
> `docs/project/mandates/food-tg-r13-next-session-commit-pcq-actor-prompt-2026-06-25.md`.
> Ikke bruk denne som aktiv neste-session prompt uten å lese de nyere R13-kontrollfilene først.

Copy this into a new Codex session.

```text
Du skal fortsette Food TG Research OS etter fullført Runde 13 i denne worktree-en:

/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/food-tg-research-r13

VIKTIG:
- Arbeid kun i denne worktree-en, ikke hovedcheckouten.
- Branch skal være `codex/food-tg-research-r13`.
- Start med å verifisere:
  - `pwd`
  - `git rev-parse --show-toplevel`
  - `git status --short --branch`
- Ikke commit uten eksplisitt beskjed.
- Ikke skriv DB.
- Ikke åpne claims.
- Ikke bruk `safe_for_ai_context`.
- Ikke skriv whitepaper/deck-stemme.
- Ikke lag figurer eller visualiseringer ennå.

Nåværende status per 2026-06-25:
- R13 er mottaksført med 50 / 50 prompter.
- Decision-batcher finnes for `batch-01` til `batch-13`.
- `research/_status/food-tg-r13/r13-intake-index-2026-06-25.md` viser:
  - PCQ-ready: 13
  - source-shortlist: 24
  - claim-lock candidate: 0
  - actor-gate: 6
  - forstaelse: 4
  - internal only: 3
  - parkert: 1
  - må ikke visualiseres ennå: 50
- Batch 06-13 og tilhørende outputs ligger som unstaged/untracked endringer.
- Forrige sluttkontroll viste:
  - backlog: 50
  - decisions: 50
  - unique: 50
  - missing total: 0 []
  - `git diff --check` ren

Les først:
1. `docs/project/mandates/food-tg-research-runde13-goal-codex-2026-06-25.md`
2. `docs/project/mandates/food-tg-research-runde13-promptpack-2026-06-25.md`
3. `docs/project/mandates/food-tg-research-runde13-masterplan-2026-06-25.md`
4. `docs/project/mandates/food-tg-research-mottaksprotokoll-2026-06-24.md`
5. `research/_status/food-tg-r13/r13-intake-index-2026-06-25.md`
6. `research/_status/food-tg-research-backlog-2026-06-25.csv`
7. `research/_status/food-tg-r13/report-batch-12.md`
8. `research/_status/food-tg-r13/report-batch-13.md`

Mål for denne sessionen:

1. Kjør R13 QC-pass.
   - Verifiser at alle 50 decision-rader finnes og er unike.
   - Verifiser at hver decision `canonicalPath` finnes som fil.
   - Verifiser at hver outputfil har `id`, `gate`, status/bruk og `Ikke si` eller tilsvarende stoppliste når relevant.
   - Verifiser at intake-indeksens nøkkeltall stemmer med decision-loggene.
   - Verifiser at det ikke finnes claim-lock candidates.
   - Verifiser at `må ikke visualiseres ennå` inneholder alle rader som ikke er figurklare.
   - Lag en QC-rapport på:
     `research/_status/food-tg-r13/r13-qc-report-2026-06-25.md`

2. Lag PCQ-prioriteringskø.
   - Bruk bare `PCQ-ready`-gruppen som kandidatgrunnlag.
   - Prioriter topp 5-8 rader for første kontrollrunde.
   - Foreslå startrekkefølge, men ikke claim-lock noe.
   - Anbefalt første sett:
     - `R13-LAND-001`
     - `R13-LAND-002`
     - `R13-OKO-001`
     - `R13-OKO-007`
     - `R13-GAP-001`
     - `R13-WASTE-001`
     - `R13-OKO-003`
   - For hver rad skal køen ha:
     - ID
     - kort kontrollspørsmål
     - sterkeste kilde
     - svakeste punkt
     - nødvendig primærkontroll
     - tomme celler
     - `Ikke si`
     - anbefalt neste artefakt
   - Lag fil:
     `research/_status/food-tg-r13/r13-pcq-queue-2026-06-25.md`

3. Lag actor-gate backlog.
   - Bruk `actor-gate`-gruppen i intake-indeksen.
   - Ikke prøv å desk-researche disse i hjel.
   - For hver rad, skriv hvilke aktørdata eller registerdata som faktisk mangler.
   - Skill mellom:
     - aktiv-status
     - volum
     - eierskap/founders
     - medlemskap/nettverk
     - kontrakter/avtaler
   - Lag fil:
     `research/_status/food-tg-r13/r13-actor-gate-backlog-2026-06-25.md`

4. Lag commit-gate-notat, men ikke commit.
   - Oppsummer hva som bør inngå i en eventuell R13 commit.
   - Foreslå en trygg staging-scope.
   - Pek ut eventuelle filer som bør holdes utenfor hvis de ikke hører til R13.
   - Lag fil:
     `research/_status/food-tg-r13/r13-commit-gate-2026-06-25.md`

5. Stopppunkt.
   - Når QC, PCQ-kø, actor-gate backlog og commit-gate-notat er laget og verifisert, stopp.
   - Ikke commit.
   - Rapporter nøyaktig:
     - hvilke filer som ble opprettet
     - hvilke kontroller som ble kjørt
     - om `git diff --check` er ren
     - om decision-count fortsatt er 50/50
     - gjenværende risiko

Bruk subagents bare der de gir reell parallell verdi:
- En subagent kan kontrollere PCQ-kandidater.
- En subagent kan kontrollere actor-gate-rader.
- En subagent kan kontrollere path/schema/QC.
- Ikke la subagents skrive repo-filer direkte.
- Hovedagenten eier filskriving, schema, gatevalg og sluttrapport.

Kjør minst disse kontrollene før sluttmelding:

```bash
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
git status --short --branch
```

Sluttkrav:
- Ingen DB-skriving.
- Ingen claims åpnet.
- Ingen commit uten eksplisitt beskjed.
- Alle nye filer skal være interne status-/kontrollartefakter.
```
