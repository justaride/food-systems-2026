---
tittel: Food TG R13 — continuation handover
dato: 2026-06-27
status: Intern arbeidsnotat — ikke faktastemme
branch: claude/brukerveiledning-readiness-2026-06-18
formål: La en senere sesjon ta opp R13-kjøringen uten kontekst-tap.
---

# R13 continuation handover (2026-06-27)

## Hvor vi er
- **8 / 50** prompts kjørt og mottaksført. Batch **01** og **02** komplett.
- To commits på branch `claude/brukerveiledning-readiness-2026-06-18`:
  - `6a83acd` — R13 OS scaffolding (promptpack, masterplan, goal-codex, backlog)
  - `f25e2bb` — batches 01–02 outputs (8/50)
- Alt er internt underlag. Ingen claims, ingen DB, ingen `safe_for_ai_context`.

## Hva som er gjort (batch 01–02)
| ID | Decision | Gate | Artefakt |
|---|---|---|---|
| GAP-001 importnoder | enrich | PCQ | research/external/r13/R13-GAP-001-*.md |
| GAP-005 parkerte claims | enrich | PCQ (claim-lock kandidat, smale rader) | research/external/r13/R13-GAP-005-*.md |
| WASTE-001 marint restråstoff | enrich | PCQ | research/external/r13/R13-WASTE-001-*.md |
| GAP-002 lokale verdikjeder | enrich | source-shortlist (vent) | research/external/r13/R13-GAP-002-*.md |
| GAP-004 fôrproteiner | enrich | source-shortlist → actor-gate | research/external/r13/R13-GAP-004-*.md |
| GAP-006 type-C-eskalering | actor-gate | forstaelse | research/forstaelse/R13-GAP-006-*.md |
| GAP-003 transport/lager | enrich | source-shortlist | research/external/r13/R13-GAP-003-*.md |
| WASTE-002 oppdrettsslam | park | PCQ (parkert) | research/external/r13/R13-WASTE-002-*.md |

## Slik kjørte vi (reproduserbar oppskrift)
1. Én subagent (`general-purpose`, web-enabled) per prompt, kjørt i parallell per batch.
2. Agent-prompt = universal instruks + harde regler + selve prompt-teksten + `Lagre output`-sti + decision-JSONL-skjema (fra goal-codex). Bygg på R12-forløper i `.worktrees/food-tg-research-r13/research/external/r12/` for "fullfør R12-*"-prompts.
3. Hver agent skriver output-fila i universal-format og returnerer én decision-JSONL-linje etter en `---DECISION-JSONL---`-markør.
4. Mottak: append linjer til `decisions/batch-NN.jsonl`, skriv `report-batch-NN.md` (8-kolonners mottaksrad + per-target outcome), oppdater `r13-intake-index-2026-06-25.md` (Kontrollstatus + Hurtigoppsummering + gruppe-tabeller).
5. Guards: `python3` ID↔fil-konsistens, `npm run audit:research-artifacts -- --base=origin/main`, `git diff --check`.

## Fallgruver oppdaget
- **GAP-006-agenten skrev til worktree** (`.worktrees/food-tg-research-r13/research/forstaelse/`) i stedet for hovedrepo. Sjekk filplassering etter agenter som *leser* fra worktree; flytt ved behov.
- Comtrade-API krever nøkkel → returnerer 0 rader. Speilkilde forble korrekt utenfor primær.
- Flere primær-PDF-er (FFI, DSB, Livsmedelsverket) lot seg ikke tekstuttrekke → står som B til primær verifisert.

## Neste (goal-codex rekkefølge)
- **Batch 03**: R13-WASTE-003, R13-WASTE-004, R13-WASTE-005, R13-WASTE-007
- **Batch 04**: R13-WASTE-006, R13-WASTE-008, R13-PROT-006, R13-PROT-007
- … til og med Batch 13 (R13-LAND-004, R13-LAND-006). Full tabell i goal-codex.
- Innenfor en batch: kjør P0/P1 før P2. Hvis en kilde ikke finnes, registrer hullet og gå videre.

## Oppfølgingspunkter fra batch 01–02
- **GAP-004 + GAP-006**: aktørspørsmål-kø. Realisert fôr-grade tonn per aktør/år må hentes via actor-gate, ikke desk.
- **GAP-005**: smale claim-lock-kandidater (Rest-konkurs 2024, andelslandbruk 93/2023) kan vurderes via PCQ per rad; ASKO 70 % og SOIL-score skal IKKE løftes.
- **WASTE-002**: parkert til en kilde kobler modellert/innsamlet/behandlet per anlegg per år.

## Filer å lese først i ny sesjon
1. Denne handoveren.
2. `research/_status/food-tg-r13/r13-intake-index-2026-06-25.md` (status 8/50).
3. `docs/project/mandates/food-tg-research-runde13-goal-codex-2026-06-25.md` (batch-tabell + decision-skjema + DoD).
4. `docs/project/mandates/food-tg-research-runde13-promptpack-2026-06-25.md` (prompt-tekster).
