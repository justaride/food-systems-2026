# Food TG R13 commit-gate-notat

**Dato:** 2026-06-25
**Scope:** R13 status-/kontrollartefakter etter QC, PCQ-kø og actor-gate backlog.
**Regel:** Ikke commit uten eksplisitt beskjed.

## Kort dom

En eventuell R13-commit bør være én kontrollert intern research-commit som samler R13-mottak, batch 06-13, intake-korreksjon, QC, PCQ-kø, actor-gate backlog og commit-gate-notat. Committen skal ikke åpne claims, skrive DB, legge til figurer eller lage deck/whitepaper-stemme.

## Foreslått commit-innhold

| Scope | Inkluder |
|---|---|
| R13 mandates/handoff | `docs/project/mandates/food-tg-research-runde13-*`, `food-tg-r13-next-session-qc-pcq-prompt-2026-06-25.md`, `food-tg-r13-next-session-commit-pcq-actor-prompt-2026-06-25.md`, relevante `R13-*.md` interne mandates |
| Decisions | `research/_status/food-tg-r13/decisions/batch-01.jsonl` til `batch-13.jsonl` |
| Batchrapporter | `research/_status/food-tg-r13/report-batch-01.md` til `report-batch-13.md` |
| Intake/QC | `research/_status/food-tg-r13/r13-intake-index-2026-06-25.md`, `r13-qc-report-2026-06-25.md` |
| Neste køer | `r13-pcq-queue-2026-06-25.md`, `r13-pcq-first-pass-2026-06-25.md`, `r13-actor-gate-backlog-2026-06-25.md`, `r13-actor-gate-action-packet-2026-06-25.md`, `r13-risk-closeout-2026-06-25.md`, `r13-commit-gate-2026-06-25.md` |
| R13 outputs | `research/external/r13/*.md`, `research/forstaelse/R13-*.md`, `research/_status/R13-AKTOR-*.md` |

## Trygg staging-scope

Bruk path-bounded staging fra worktree-roten:

```bash
git add \
  docs/project/mandates/food-tg-research-runde13-goal-codex-2026-06-25.md \
  docs/project/mandates/food-tg-research-runde13-promptpack-2026-06-25.md \
  docs/project/mandates/food-tg-research-runde13-masterplan-2026-06-25.md \
  docs/project/mandates/food-tg-r13-next-session-qc-pcq-prompt-2026-06-25.md \
  docs/project/mandates/food-tg-r13-next-session-commit-pcq-actor-prompt-2026-06-25.md \
  docs/project/mandates/R13-*.md \
  research/_status/food-tg-r13/ \
  research/_status/R13-AKTOR-*.md \
  research/external/r13/ \
  research/forstaelse/R13-*.md
```

Kjør etter staging:

```bash
git diff --cached --check
git diff --cached --name-only
```

## Hold utenfor hvis de dukker opp

- `.env`, `.env.local`, DB-dumps, Prisma/devserver output eller cache.
- `.next/`, `node_modules/`, `__pycache__/`, `*.pyc`.
- Genererte chart-/metric-filer som ikke er del av R13.
- Hovedcheckout-endringer utenfor `.worktrees/food-tg-research-r13`.
- Nye figurer, deck/whitepaper-utkast eller claim-lock-filer.

## Commit-melding hvis Gabriel ber om commit

```text
research: complete r13 intake qc and control queues
```

## Før commit må dette fortsatt være sant

- Decision-count er 50/50 og unike.
- `missing canonical paths` er tom.
- Claim-lock candidates er 0.
- `git diff --check` er ren.
- Ingen DB-skriving, claims, `safe_for_ai_context`, figurer eller deck/whitepaper-stemme er lagt til.
