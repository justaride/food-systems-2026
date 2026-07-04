---
tittel: Lokal worktree-inventar etter PR-backlogg-closeout
dato: 2026-07-04
status: aktivt-ryddenotat
grunnlag:
  - `git status --short --branch` på `main` ved `13c4538`
  - `gh pr list --state open --limit 50 --json number,title,url` returnerte `[]`
  - `git worktree list --porcelain` etter PR #268 og branch/worktree cleanup
  - `git branch -r --merged origin/main` etter remote-branch cleanup
siterbarhet: intern
---

# Lokal worktree-inventar etter PR-backlogg-closeout

## Kort konklusjon

GitHub PR-flaten er tom og `main` er rent mot `origin/main`. Lokal repo-hygiene er ikke helt lik "slett alt": noen worktrees er dirty og skal ikke røres uten egen scopebeslutning, og noen rene worktrees har commits som ikke er ancestor av `main`. De er derfor beholdt som aktive eller mulige recovery-spor.

Dette notatet er en stoppregel for senere opprydding: slett bare en worktree/branch når den enten er ren og fullt innlemmet i `main`, eller når en eksplisitt beslutning sier at historikken ikke lenger skal beholdes.

## Ryddet i denne runden

| Kategori | Beslutning | Begrunnelse |
|---|---|---|
| Åpne PR-er | Ingen åpne PR-er gjenstår. | PR #268 dokumenterte closeout av den gamle draft-stacken. |
| G-02 til G-17 worktrees | Worktree-mappene ble fjernet, branchene beholdt. | PR-ene #142-#157 er lukket uten merge, men branchene er recovery-historikk. |
| Stale `/tmp/wt` | Låst worktree-metadata ble låst opp og prunet. | Mappen fantes ikke på disk. |
| Mergede, rene Food TG/Obsidian worktrees | Worktrees, lokale branches og remote branches ble fjernet for klart innlemmede PR-spor. | `git merge-base --is-ancestor <branch> main` var sant og worktree-status var ren. |
| `codex/reader-layer-completeness` | Lokal og remote branch ble slettet. | PR #119 var merget og branchen var ancestor av `main`. |
| Mergede remote-only `origin/codex/*` branches | Remote branches uten lokal branch/worktree ble slettet når de allerede var innlemmet i `origin/main`. | Etter opprydding var eneste gjenværende merged remote codex-branch `codex/food-tg-research-r13`, som ble beholdt fordi den har lokal dirty worktree. |

## Beholdte dirty worktrees

Disse har lokale endringer og skal ikke slettes eller resettes uten ny beslutning.

| Branch | Dirty count | Main vs branch | PR-status | Beslutning |
|---|---:|---|---|---|
| `codex/ai-kunnskap-library-v1` | 148 | `185 0` | Ingen PR funnet. | Behold. Stort dirty arbeidsområde. |
| `codex/food-tg-research-r13` | 1 | `167 0` | PR #202 merget. | Behold inntil den ene lokale endringen er vurdert; remote branch er også beholdt av samme grunn. |
| `codex/foodsystems-kb-mcp` | 7 | `121 0` | Ingen PR funnet. | Behold. Dirty MCP-/runbook-spor. |
| `codex/master-research-plan-2026-07-01` | 433 | `121 0` | Ingen PR funnet. | Behold. Stort dirty forsknings-/planområde. |
| `codex/notebooklm-export-2026-07-02` | 10 | `121 0` | Ingen PR funnet. | Behold. Dirty NotebookLM-/Obsidian-export-spor. |

## Beholdte rene, ikke-ancestor worktrees

Disse er rene, men har commits som ikke er innlemmet i `main` som direkte ancestors. De kan være squash-/mergeavvik, recovery-spor eller arbeid som må sammenlignes fil-for-fil før sletting.

| Branch | Dirty count | Main vs branch | PR-status | Beslutning |
|---|---:|---|---|---|
| `codex/food-tg-arbeidsplan-2026-06-12` | 0 | `281 5` | Ingen PR funnet. | Behold til egen review eller cherry-pick/closeout. |
| `codex/matverdikjede-0pct-import-2026-06-27` | 0 | `141 4` | PR #211 merget. | Behold til diff mot `main` er vurdert. |
| `codex/matverdikjede-full-kartlegging-2026-06-26` | 0 | `146 10` | PR #208 merget. | Behold til diff mot `main` er vurdert. |
| `codex/obsidian-kunnskapskart-m2-2026-07-02` | 0 | `106 1` | PR #231 merget. | Behold til stacked/squash ancestry er avklart. |
| `codex/obsidian-v3-masterplan-main-2026-07-02` | 0 | `111 1` | PR #237 merget. | Behold til stacked/squash ancestry er avklart. |

## Beholdte branch-only recovery-spor

De gamle `codex/goal-01-*` til `codex/goal-17-*` branchene finnes lokalt og på remote. PR #141-#157 er lukket uten merge, men branchene er beholdt med vilje fordi de dokumenterer den gamle G-stackens recovery-grunnlag.

Ikke slett disse branchene før det finnes en eksplisitt beslutning om at G-stackens gjenværende arbeid ikke skal porteres.

## Neste trygge steg

1. Behandle dirty worktrees én og én, med egen scopebeslutning før staging/reset/sletting.
2. For rene ikke-ancestor worktrees: sammenlign `git diff --stat main...<branch>` og relevant PR-mergeform før sletting.
3. For `codex/goal-*`: opprett først en recovery-beslutning som sier hvilke G-slices som eventuelt skal portes til ferske `main`-baserte PR-er.
4. Kjør alltid `git status --short --branch` i worktree-en før sletting.
5. Etter hver sletting: `git worktree list --porcelain`, `git branch --format='%(refname:short)'`, `git fetch --prune`, og `gh pr list --state open`.
