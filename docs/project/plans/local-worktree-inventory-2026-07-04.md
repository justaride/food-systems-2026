---
tittel: Lokal worktree-inventar etter PR-backlogg-closeout
dato: 2026-07-04
status: aktivt-ryddenotat
grunnlag:
  - `git status --short --branch` på `main` ved `4913e12`
  - `git status --short --branch` på `main` ved `0aaf34a` etter PR #283
  - `gh pr list --state open --limit 50 --json number,title,url` returnerte `[]`
  - `git worktree list --porcelain` etter PR #281 og dirty-worktree review
  - `git worktree list --porcelain` etter PR #283 og fjerning av fersk port-worktree
  - `git branch -r --merged origin/main` etter remote-branch cleanup
siterbarhet: intern
---

# Lokal worktree-inventar etter PR-backlogg-closeout

## Kort konklusjon

GitHub PR-flaten er tom og `main` er rent mot `origin/main`. MCP-sporet er publisert i PR #274 og den gamle lokale MCP-worktreen er fjernet. NotebookLM eksportsporet er publisert i PR #276 som fersk `2026-07-04`-pakke, og den gamle lokale NotebookLM-worktreen er nå fjernet etter eksplisitt port/drop-beslutning for recovery-restene. `ai-kunnskap` core/cockpit-slicen fra den gamle dirty worktree-en er publisert i PR #283, merget på `main`, og den ferske port-worktree-en er fjernet igjen. De read-only `library-analysis` inventory/ledger-, repair-backlog-, locator-profile-, PDF extraction- og URL text profile-generatorene er skilt ut som egne trygge port-slices. Prosess-projeksjonen er også skilt ut med eksplisitt dry-run/apply og stale-backup før prune, uten generated `research/_status` output. De tre rene ikke-ancestor worktreene, de to branch-only sporene, den gamle G-stacken og de to opprinnelige dirty worktreene er også gjennomgått; de gjenværende sporene er beholdt fordi de enten har `+`-commits i `git cherry`, store stale tree-differ, eller uncommitted arbeid som ikke finnes i commits. Lokal repo-hygiene er derfor fortsatt ikke helt lik "slett alt": noen worktrees er dirty og skal ikke røres uten egen scopebeslutning, og noen rene worktrees/branches er beholdt som aktive eller mulige recovery-spor.

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
| `codex/notebooklm-export-2026-07-02` | Worktree og lokal branch ble slettet etter publisering og port/drop-vurdering. | PR #276 la til `export:notebooklm`, generator/test og `exports/notebooklm/food-systems-2026-2026-07-04/` med 40 kilder, 0 manglende kildebaner og grønne lokale/remote checks. Etterpå viste restvurderingen at branch `HEAD` var ancestor av `main`, ingen remote branch fantes, gamle export-/generator-/package-filer var supersedet av `main`, vault-restene hadde 0 non-placeholder menneskenotater, eldre Obsidian-masterplan var supersedet av V3/main-notatet, og master-research-plan-kopien var eldre enn den aktive `codex/master-research-plan-2026-07-01`-worktreen. |
| `codex/ai-kunnskap-library-v1` core/cockpit-slice | Portet til fersk branch og merget i PR #283; den ferske port-worktree-en og remote PR-branch ble slettet etter merge. | PR #283 la til `LibraryAnalysisRecord` schema/migration, `/ai-kunnskap`, `/api/library-analysis/status`, library/search badges, query helpers og tre kontraktstester. Lokalt verifisert med `npm run db:generate`, målrettede library-analysis tester, `npm run lint`, `npm run build` og `npm test`; GitHub checks var grønne. Dette er ikke en drop-beslutning for resten av den gamle dirty worktree-en. |
| `codex/ai-kunnskap-library-v1` inventory/ledger-generatorer | Portet til fersk branch som read-only generator-slice. | Slicen legger til `research:library:inventory`, `research:library:ledger`, `scripts/library-analysis-common.ts`, inventory-builderen, ledger-exporten og tester. Den skriver bare ledger/summary når operatøren kjører kommandoene; den porterer ikke generated output, process/apply-scripts eller kildekuratering. |
| `codex/ai-kunnskap-library-v1` process-projeksjon | Portet til fersk branch som eksplisitt dry-run/apply-slice. | Slicen legger til `research:library:process:dry-run`, `research:library:process:apply`, `scripts/process-library-analysis.ts`, `src/lib/library-analysis-processing.ts` og tester. Dry-run er default. Apply krever DB, upserter `LibraryAnalysisRecord`, og skriver backup før stale rows prunes. Den porterer ikke generated output, repair-scripts eller kildekuratering. |
| `codex/ai-kunnskap-library-v1` local-text repair | Portet til fersk branch som eksplisitt dry-run/apply-slice. | Slicen legger til `research:library:repair-local-text:dry-run`, `research:library:repair-local-text:apply`, `scripts/repair-library-analysis-local-text.ts`, `src/lib/library-analysis-local-text-repair.ts` og tester. Dry-run er default. Apply oppdaterer bare `Document.content` og `Document.wordCount` for planlagte lokale tekstfiler som krysser 150-ordsgrensen, og skriver backup før oppdatering. Den porterer ikke generated repair-plan output, PDF/URL/manual repair eller kildekuratering. |
| `codex/ai-kunnskap-library-v1` manual local match repair | Portet til fersk branch som eksplisitt dry-run/apply-slice for reviewede lokale markdown-/tekstmatcher. | Slicen legger til `research:library:repair-manual-local-match:dry-run`, `research:library:repair-manual-local-match:apply`, `scripts/repair-library-analysis-manual-local-match.ts`, `src/lib/library-analysis-manual-local-match-repair.ts` og tester. Dry-run er default. Apply oppdaterer bare `Document.filePath`, `Document.content` og `Document.wordCount` naar document-id, tittel/URL-guards, path-eierskap og tekstgrense passer, og skriver backup før oppdatering. Den porterer ikke generated manual-plan output, PDF/URL-manual repair, audit-script eller kildekuratering. |
| `codex/ai-kunnskap-library-v1` PDF text repair | Portet til fersk branch som eksplisitt dry-run/apply-slice. | Slicen legger til `research:library:repair-pdf-text:dry-run`, `research:library:repair-pdf-text:apply`, `scripts/repair-library-analysis-pdf-text.ts`, `src/lib/library-analysis-pdf-text-repair.ts` og tester. Dry-run er default. Apply oppdaterer bare `Document.content` og `Document.wordCount` fra lokalt `pdftotext -layout`-uttrekk for rader i PDF extraction profile, og skriver backup før oppdatering. Den porterer ikke generated repair-plan output, URL/manual repair eller kildekuratering. |
| `codex/ai-kunnskap-library-v1` URL text repair | Portet til fersk branch som eksplisitt dry-run/apply-slice. | Slicen legger til `research:library:repair-url-text:dry-run`, `research:library:repair-url-text:apply`, `scripts/repair-library-analysis-url-text.ts`, `src/lib/library-analysis-url-text-repair.ts` og tester. Dry-run er default. Apply oppdaterer bare `Document.content` og `Document.wordCount` fra URL extraction profile-rader som fortsatt klassifiseres som extractable etter refetch, med timeout, byte cap, concurrency cap og backup før oppdatering. Den porterer ikke generated repair-plan output, manual repair eller kildekuratering. |
| `codex/ai-kunnskap-library-v1` decision queue | Portet til fersk branch som read-only generator-slice. | Slicen legger til `research:library:decision-queue`, `scripts/build-library-analysis-decision-queue.ts`, `src/lib/library-analysis-decision-queue.ts` og tester. Den leser repair-backlog, local-text repair-plan og URL extraction profile, og skriver kun decision-queue JSON/markdown for manuell operatørbeslutning. Den porterer ikke generated queue output, audit-script, manual repair eller kildekuratering. |
| `codex/ai-kunnskap-library-v1` repair-backlog-generator | Portet til fersk branch som read-only generator-slice. | Slicen legger til `research:library:repair-backlog`, `scripts/build-library-analysis-repair-backlog.ts`, `src/lib/library-analysis-repair-backlog.ts` og tester. Den skriver bare markdown/JSON backlog-artefakter når operatøren kjører kommandoen med `DATABASE_URL`; den porterer ikke generated `research/_status` output, apply-scripts, PDF/URL-profiler eller kildekuratering. |
| `codex/ai-kunnskap-library-v1` locator-profile-generator | Portet til fersk branch som read-only generator-slice. | Slicen legger til `research:library:locator-profile`, `scripts/build-library-analysis-locator-profile.ts`, `src/lib/library-analysis-locator-profile.ts` og tester. Den leser repair-backlog JSON og skriver locator-profil JSON/markdown når operatøren kjører kommandoen med `DATABASE_URL`; den porterer ikke generated output, apply-scripts, PDF/URL-profiler eller kildekuratering. |
| `codex/ai-kunnskap-library-v1` extraction-profile-generatorer | Portet til fersk branch som read-only generator-slice. | Slicen legger til `research:library:pdf-extraction-profile`, `research:library:url-text-profile`, tilsvarende scripts, `src/lib`-profilbyggere og tester. De lager bare profiler for senere operatørstyrt reparasjon; de porterer ikke generated output, repair/apply-scripts eller kildekuratering. |

## Beholdte dirty worktrees

Disse har lokale endringer og skal ikke slettes eller resettes uten ny beslutning.

| Branch | Dirty count | Main vs branch | PR-status | Beslutning |
|---|---:|---|---|---|
| `codex/ai-kunnskap-library-v1` | 148 | `215 0` | Core/cockpit portet og merget i PR #283; read-only inventory/ledger, process-projeksjon, repair-backlog, locator-profile og extraction-profile portet; fortsatt ingen PR/remote branch for resten. | Behold. Status er fortsatt 60 modified + 88 untracked fordi worktree-en står på en eldre branchbase, men core-filene, prosess-projeksjonen og de read-only analyse-/profilgeneratorene er nå skilt ut på `main`. Gjenværende verdi ligger i uncommitted pipeline-/dataarbeid: repair/apply-scripts, generated `research/_status/library-analysis*` og `research/_status/library-triage/`, samt kildekuratering i `research/bibliotek/**`, `research/evidence-pack/**`, `research/landbrukarena_transcripts/**` og `research/regulatory/**`. Trenger egen port/drop-beslutning per kategori før sletting. |
| `codex/master-research-plan-2026-07-01` | 433 | `147 0` | Ingen PR funnet; ingen remote branch. | Behold. Status er 103 modified + 1 deleted + 329 untracked. Branch har 0 commits foran `main` (`git cherry` 0/0), så verdien ligger i uncommitted research/MVK/R13-R14/materialiseringsarbeid. Trenger egen port/commit-plan før sletting. |

## Beholdte rene, ikke-ancestor worktrees

Disse er rene, men har commits som ikke er innlemmet i `main` som direkte ancestors. De kan være squash-/mergeavvik, recovery-spor eller arbeid som må sammenlignes fil-for-fil før sletting.

| Branch | Dirty count | Main vs branch | PR-status | Beslutning |
|---|---:|---|---|---|
| `codex/food-tg-arbeidsplan-2026-06-12` | 0 | `301 5` | Ingen PR funnet. | Behold. `git cherry` viser 5 `+` commits, og `git diff --shortstat main..branch` viser 1792 filer, 5466 inn og 204163 ut. Dette er recovery-/portarbeid, ikke hygiene-sletting. |
| `codex/matverdikjede-0pct-import-2026-06-27` | 0 | `161 4` | PR #211 merget. | Behold. PR er merget, men lokal branch har fortsatt 4 `+` commits og tree-diffen mot dagens `main` er 1152 filer, 3989 inn og 115875 ut. Må ha eksplisitt squash-/supersede-review før sletting. |
| `codex/matverdikjede-full-kartlegging-2026-06-26` | 0 | `166 10` | PR #208 merget. | Behold. PR er merget, men lokal branch har fortsatt 10 `+` commits og tree-diffen mot dagens `main` er 1170 filer, 4015 inn og 117354 ut. Må ha eksplisitt squash-/supersede-review før sletting. |

## Vurdert og droppet etter port/drop

Dette er dagens eksplisitte drop-beslutning: sporet ble inspisert etter PR #276 og fjernet fordi gjenværende recovery-filer var supersedet eller tomme/placeholdere.

| Spor | Funn | Beslutning |
|---|---|---|
| `codex/notebooklm-export-2026-07-02` | NotebookLM-generator/test og export-pakke ble portet til fersk `main` i PR #276. Gammel `exports/notebooklm/food-systems-2026-2026-07-02/` er supersedet av `2026-07-04`-pakken, og gamle generatorfiler er enten identiske med `main` eller eldre enn PR #276 sine kildebanejusteringer. De gjenværende vault-filene hadde 0 non-placeholder menneskenotater; de unike filene var Obsidian app/workspace-state, tomme `Untitled`-filer eller gamle genererte gap-/loop-/aktørplassholdere. Den eldre `obsidian-kunnskapskart-masterplan-2026-07-02.md` manglet nåværende main/V3-arkivnotat, og `research/_plans/MASTER-RESEARCH-PLAN-2026-07-01.md` var eldre enn den aktive master-research-worktreens kopi. | Dropp lokal recovery-rest. `git worktree remove --force .worktrees/notebooklm-export-2026-07-02` og `git branch -d codex/notebooklm-export-2026-07-02` er gjennomført; ingen remote branch fantes. |

## Beholdte andre branch-only spor

Disse har ikke aktiv worktree, men er heller ikke trygge å slette som ren hygiene ennå.

| Branch | Main vs branch | PR-status | Beslutning |
|---|---|---|---|
| `codex/domene-kartlegging-2026-06-25` | `171 6` | PR #205 merget; ingen remote branch. | Behold. Lokal branch har fortsatt 6 `+` commits i `git cherry`, og `git diff --shortstat main..branch` viser 1204 filer, 4086 inn og 119523 ut. Må ha eksplisitt squash-/supersede-review før sletting. |
| `codex/platform-stack-integration-2026-06-11` | `234 54` | PR #159 lukket uten merge; ingen remote branch. | Behold som recovery-/backloggspor. `git cherry` viser 23 `+` commits, og `git diff --shortstat main..branch` viser 1704 filer, 9379 inn og 170747 ut. Må ha eksplisitt port/drop-beslutning før sletting. |

## Beholdte branch-only recovery-spor

De gamle `codex/goal-01-*` til `codex/goal-17-*` branchene finnes lokalt og på remote, og lokale SHA-er matcher remote SHA-er. PR #141-#157 er lukket uten merge; #142-#157 var kjedet på forrige goal-branch som base, ikke på `main`.

Goal-stack review 2026-07-04 viste at ingen av de 17 branchene er ancestor av `main`. `git cherry` viste fortsatt `+` commits hele veien fra G01 til G17: G01 har 2 `+` commits, G17-toppen har 18 `+` commits. `git diff --shortstat main..codex/goal-17-coverage-badge-system` viste 1910 filer, 10136 inn og 213456 ut, altså et gammelt stack-tre som ville fjerne mye nyere `main`-arbeid hvis det ble brukt direkte.

Ikke slett disse branchene før det finnes en eksplisitt beslutning om at G-stackens gjenværende arbeid ikke skal porteres.

## Neste trygge steg

1. For de tre rene ikke-ancestor worktreene: gjør bare videre port/drop etter eksplisitt squash-/supersede-review; ikke slett som hygiene.
2. For de to branch-only sporene: gjør bare videre sletting etter eksplisitt squash-/supersede-review eller port/drop-beslutning.
3. For `codex/ai-kunnskap-library-v1`: behandle restene som separate beslutninger: repair/apply-scripts, generated `research/_status` artifacts, kildekuratering, og gjenværende package-script wiring. Ikke slett eller reset hele worktree-en bare fordi core/cockpit, prosess-projeksjon og read-only analyse-/profilgeneratorer er landet.
4. For `codex/master-research-plan-2026-07-01`: lag først en eksplisitt port/commit-plan; ikke slett eller reset fordi arbeidet er uncommitted.
5. For `codex/goal-*`: opprett først en recovery-beslutning som sier hvilke G-slices som eventuelt skal portes til ferske `main`-baserte PR-er.
6. Kjør alltid `git status --short --branch` i worktree-en før sletting.
7. Etter hver sletting: `git worktree list --porcelain`, `git branch --format='%(refname:short)'`, `git fetch --prune`, og `gh pr list --state open`.
