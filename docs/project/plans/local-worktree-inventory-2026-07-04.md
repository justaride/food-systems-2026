---
tittel: Lokal worktree-inventar etter PR-backlogg-closeout
dato: 2026-07-04
status: aktivt-ryddenotat
grunnlag:
  - `git status --short --branch` på `main` ved `4fbeb64`
  - `gh pr list --state open --limit 50 --json number,title,url` returnerte `[]`
  - `git worktree list --porcelain` etter PR #276 og NotebookLM export-vurdering
  - `git branch -r --merged origin/main` etter remote-branch cleanup
siterbarhet: intern
---

# Lokal worktree-inventar etter PR-backlogg-closeout

## Kort konklusjon

GitHub PR-flaten er tom og `main` er rent mot `origin/main`. MCP-sporet er publisert i PR #274 og den gamle lokale MCP-worktreen er fjernet. NotebookLM eksportsporet er publisert i PR #276 som fersk `2026-07-04`-pakke, men den gamle lokale NotebookLM-worktreen er beholdt fordi den fortsatt inneholder unike vault-/masterplan-recoveryfiler som ikke skal slettes som ren hygiene. Lokal repo-hygiene er fortsatt ikke helt lik "slett alt": noen worktrees er dirty og skal ikke røres uten egen scopebeslutning, og noen rene worktrees har commits som ikke er ancestor av `main`. De er derfor beholdt som aktive eller mulige recovery-spor.

Dette notatet er en stoppregel for senere opprydding: slett bare en worktree/branch når den enten er ren og fullt innlemmet i `main`, eller når en eksplisitt beslutning sier at historikken ikke lenger skal beholdes.

## Ryddet i denne runden

| Kategori | Beslutning | Begrunnelse |
|---|---|---|
| Åpne PR-er | Ingen åpne PR-er gjenstår. | PR #268 dokumenterte closeout av den gamle draft-stacken. |
| G-02 til G-17 worktrees | Worktree-mappene ble fjernet, branchene beholdt. | PR-ene #142-#157 er lukket uten merge, men branchene er recovery-historikk. |
| Stale `/tmp/wt` | Låst worktree-metadata ble låst opp og prunet. | Mappen fantes ikke på disk. |
| Mergede, rene Food TG/Obsidian worktrees | Worktrees, lokale branches og remote branches ble fjernet for klart innlemmede PR-spor. | `git merge-base --is-ancestor <branch> main` var sant og worktree-status var ren. |
| `codex/reader-layer-completeness` | Lokal og remote branch ble slettet. | PR #119 var merget og branchen var ancestor av `main`. |
| Mergede remote-only `origin/codex/*` branches | Remote branches uten lokal branch/worktree ble slettet når de allerede var innlemmet i `origin/main`. | Før R13-vurderingen var eneste gjenværende merged remote codex-branch `codex/food-tg-research-r13`, som da ble beholdt fordi den hadde lokal dirty worktree. |
| `codex/food-tg-research-r13` | Worktree, lokal branch og remote branch ble slettet. | Den eneste dirty endringen var en lokal sletting av `research/forstaelse/R13-GAP-006-type-c-eskalering.md`; samme blob fantes i både branch `HEAD` og `main`, PR #202 var merget, og branch var ancestor av `main`. |
| `codex/obsidian-kunnskapskart-m2-2026-07-02` | Worktree, lokal branch og remote branch ble slettet. | Worktree var ren, PR #231 var merget, og branch-tree var identisk med PR #231 sin merge-commit `84a3e08`. |
| `codex/obsidian-v3-masterplan-main-2026-07-02` | Worktree og lokal branch ble slettet. | Worktree var ren, PR #237 var merget, remote branch var allerede borte, og eneste unike commit var patch-ekvivalent med `main` i `git cherry`. |
| `codex/foodsystems-kb-mcp` | Worktree og lokal branch ble slettet etter publisering. | MCP-feature ble portet til fersk `main`, testet og merget i PR #274. Gamle lokale filer var enten identiske med `main` eller eldre enn PR #274 sine `kb_list_gaps` filter-/metadataforbedringer, og ingen remote branch fantes. |
| NotebookLM eksportdel fra `codex/notebooklm-export-2026-07-02` | Generator og fersk export-pakke ble publisert i PR #276. | PR #276 la til `export:notebooklm`, generator/test og `exports/notebooklm/food-systems-2026-2026-07-04/` med 40 kilder, 0 manglende kildebaner og grønne lokale/remote checks. Den gamle worktreen ble ikke slettet fordi den har egne vault-/masterplan-recoveryfiler. |

## Beholdte dirty worktrees

Disse har lokale endringer og skal ikke slettes eller resettes uten ny beslutning.

| Branch | Dirty count | Main vs branch | PR-status | Beslutning |
|---|---:|---|---|---|
| `codex/ai-kunnskap-library-v1` | 148 | `201 0` | Ingen PR funnet. | Behold. Stort dirty arbeidsområde. |
| `codex/master-research-plan-2026-07-01` | 433 | `137 0` | Ingen PR funnet. | Behold. Stort dirty forsknings-/planområde. |
| `codex/notebooklm-export-2026-07-02` | 10 | `137 0` | Ingen PR funnet. | Behold. Gammel NotebookLM export-del er publisert i PR #276, men worktreen har fortsatt unike vault-/masterplan-recoveryfiler. |

## Beholdte rene, ikke-ancestor worktrees

Disse er rene, men har commits som ikke er innlemmet i `main` som direkte ancestors. De kan være squash-/mergeavvik, recovery-spor eller arbeid som må sammenlignes fil-for-fil før sletting.

| Branch | Dirty count | Main vs branch | PR-status | Beslutning |
|---|---:|---|---|---|
| `codex/food-tg-arbeidsplan-2026-06-12` | 0 | `297 5` | Ingen PR funnet. | Behold til egen review eller cherry-pick/closeout. |
| `codex/matverdikjede-0pct-import-2026-06-27` | 0 | `157 4` | PR #211 merget. | Behold til diff mot `main` er vurdert. |
| `codex/matverdikjede-full-kartlegging-2026-06-26` | 0 | `162 10` | PR #208 merget. | Behold til diff mot `main` er vurdert. |

## Vurdert, ikke ryddet

Dette er dagens stoppunkt: disse sporene ble inspisert etter PR #276 og er reelt arbeid/backlogg, ikke bare gammel hygiene.

| Spor | Funn | Neste beslutning |
|---|---|---|
| `codex/notebooklm-export-2026-07-02` | NotebookLM-generator/test og export-pakke ble portet til fersk `main` i PR #276. Gammel `exports/notebooklm/food-systems-2026-2026-07-02/` er supersedet av `2026-07-04`-pakken, og gamle generatorfiler er enten identiske med `main` eller eldre enn PR #276 sine kildebanejusteringer. Worktreen har fortsatt 46 vault-filer som ikke finnes i `main`, en eldre `obsidian-kunnskapskart-masterplan-2026-07-02.md`, og `research/_plans/MASTER-RESEARCH-PLAN-2026-07-01.md` som også finnes i nyere form i `codex/master-research-plan-2026-07-01`. | Ikke slett som hygiene. Ta eksplisitt port/drop-beslutning for de gjenværende vault-/masterplan-recoveryfilene, eventuelt etter sammenligning med `codex/master-research-plan-2026-07-01`. |

## Beholdte andre branch-only spor

Disse har ikke aktiv worktree, men er heller ikke trygge å slette som ren hygiene ennå.

| Branch | Main vs branch | PR-status | Beslutning |
|---|---|---|---|
| `codex/domene-kartlegging-2026-06-25` | `165 6` | PR #205 merget. | Behold til egen diff-review; `git cherry` viste seks `+` commits. |
| `codex/platform-stack-integration-2026-06-11` | `228 54` | PR #159 lukket. | Behold som recovery-/backloggspor til eksplisitt port/drop-beslutning. |

## Beholdte branch-only recovery-spor

De gamle `codex/goal-01-*` til `codex/goal-17-*` branchene finnes lokalt og på remote. PR #141-#157 er lukket uten merge, men branchene er beholdt med vilje fordi de dokumenterer den gamle G-stackens recovery-grunnlag.

Ikke slett disse branchene før det finnes en eksplisitt beslutning om at G-stackens gjenværende arbeid ikke skal porteres.

## Neste trygge steg

1. Ta en eksplisitt port/drop-beslutning for restene i `codex/notebooklm-export-2026-07-02`: 46 unike vault-filer, den eldre Obsidian-masterplanen og master-research-plan-kopien. Ikke slett den worktreen som generell hygiene.
2. For rene ikke-ancestor worktrees: sammenlign `git cherry -v main <branch>`, `git diff --stat main...<branch>`, og relevant PR-mergeform før sletting.
3. For `codex/goal-*`: opprett først en recovery-beslutning som sier hvilke G-slices som eventuelt skal portes til ferske `main`-baserte PR-er.
4. Kjør alltid `git status --short --branch` i worktree-en før sletting.
5. Etter hver sletting: `git worktree list --porcelain`, `git branch --format='%(refname:short)'`, `git fetch --prune`, og `gh pr list --state open`.
