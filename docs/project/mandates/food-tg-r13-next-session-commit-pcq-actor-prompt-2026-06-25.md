# Food TG R13 - next-session prompt for commit, PCQ and actor data

Copy this into a new Codex session.

```text
Du skal fortsette Food TG Research OS etter fullført R13-mottak, QC og risikonedlukking i denne worktree-en:

/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/food-tg-research-r13

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
- Ikke lag figurer eller visualiseringer ennå.
- Ikke start ny bred researchrunde. Jobb bare med commit-gate, PCQ first pass eller actor-gate action packet.
- Ikke commit/push/merge uten at Gabriel ber eksplisitt om akkurat det i denne sessionen.

Nåværende status per 2026-06-25:
- R13 er mottaksført med 50 / 50 prompter.
- Decision-batcher finnes for `batch-01` til `batch-13`.
- Siste kontroll viste:
  - backlog: 50
  - decisions: 50
  - unique: 50
  - missing total: 0 []
  - duplicate ids: []
  - missing canonical paths: []
  - `git diff --check` ren
- `research/_status/food-tg-r13/r13-intake-index-2026-06-25.md` viser:
  - PCQ-ready: 13
  - source-shortlist: 24
  - claim-lock candidate: 0
  - actor-gate: 6
  - forstaelse: 4
  - internal only: 3
  - parkert: 1
  - må ikke visualiseres ennå: 50
- QC, PCQ queue, PCQ first pass, actor-gate backlog, actor-gate action packet, risk closeout og commit-gate-notat finnes.
- Ingen commit er gjort i R13-worktree-en.

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

Startrekkefølge:

1. Hvis Gabriel ber om commit:
   - Bruk `r13-commit-gate-2026-06-25.md`.
   - Stage kun R13-scope path-bounded.
   - Kjør:
     - `git diff --cached --check`
     - `git diff --cached --name-only`
     - decision/path-scriptet under
   - Commit med:
     `research: complete r13 intake qc and control queues`
   - Ikke push/merge uten ny eksplisitt beskjed.

2. Hvis Gabriel ber om videre arbeid uten commit:
   - Start med PCQ top 8 fra `r13-pcq-first-pass-2026-06-25.md`.
   - Ikke claim-lock noe.
   - Lag ett smalt PCQ-artefakt om gangen med radvis metode, kildeklasse, tomme celler og `Ikke si`.
   - Anbefalt første PCQ-rekkefølge:
     1. `R13-GAP-001` importnode extraction sheet
     2. `R13-OKO-001` økoareal-/mål-kort
     3. `R13-WASTE-001` R-stige-metodetabell
     4. `R13-LAND-001` strukturkart-ledger
     5. `R13-OKO-007` policy target matrix
     6. `R13-WASTE-004` matsvinn-baseline-tabell
     7. `R13-LAND-002` datert ownership-edge ledger
     8. `R13-OKO-003` soil-monitoring gap card

3. Hvis Gabriel ber om aktørdata:
   - Bruk `r13-actor-gate-action-packet-2026-06-25.md`.
   - Skill mellom offentlig register/aktørside og faktisk kontaktbehov.
   - Start med offentlig/lavfriksjon validering før DASK/AASK:
     - `R13-AKTOR-001`: markedshager aktiv-status per produsent
     - `R13-AKTOR-002`: andelslandbruk aktiv 2025/2026
     - `R13-AKTOR-004`: regenerative/agroøkologiske praktikere
     - `R13-AKTOR-005`: frø-/genressursnoder
     - `R13-AKTOR-007`: skogshage/permakultur-sites
     - `R13-GAP-006`: dataeier per actor-gate-hull
   - Ikke publiser totalantall eller kart uten verifisert dekning.

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
- Rapporter nøyaktig hvilke filer som ble opprettet/endret.
- Rapporter hvilke kontroller som ble kjørt.
- Rapporter om `git diff --check` er ren.
- Rapporter om decision-count fortsatt er 50/50.
- Rapporter eksplisitt om noe er fortsatt actor-gate eller PCQ-only.
```
