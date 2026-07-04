---
tittel: Open PR backlog triage
dato: 2026-07-04
status: lukket-ryddenotat
grunnlag:
  - GitHub PR-liste lest 2026-07-04 etter merge av PR #221 og close av PR #114
  - `git status -sb` på `main` ved `2930a83`
  - GitHub PR #141 lukket 2026-07-04 etter at #264 reddet den smale konsern-år/testdelen
  - GitHub PR #159 lukket 2026-07-04 som stale samlet plattform-stack
  - GitHub PR #142-#157 lukket 2026-07-04 som stale stacked draft-kjede
siterbarhet: intern
---

# Open PR backlog triage

## Kort konklusjon

Open PR-flaten er ryddet: PR #221 er merget, PR #114 er lukket som erstattet av #221, PR #141 er erstattet av #264 for den smale konsern-år/testverdien, PR #159 er lukket som stale aggregate, og PR #142-#157 er lukket som gammel stacked draft-kjede. Det står ingen åpne PR-er igjen i GitHub-listen etter denne oppryddingen.

Branchene for den gamle G-01 til G-17-kjeden er bevisst beholdt som recovery-historikk. De skal ikke merges direkte. Eventuelt gjenværende nyttig arbeid må hentes tilbake som ferske `main`-baserte PR-er med smalt scope, dagens tester og eksplisitt data-/produktbeslutning.

## Utført 2026-07-04

| PR | Beslutning | Begrunnelse | Etterarbeid |
|---|---|---|---|
| #221 `data-readiness: monthly audit 2026-07` | Merget til `main` som `403ce92`. | Ikke-draft, mergeable, grønne checks, og nyere månedsaudit. | Remote branch `audit/monthly-2026-07` slettet. |
| #114 `data-readiness: monthly audit 2026-06` | Lukket uten merge. | Erstattet av #221/juli-auditen på samme generated audit-flate. | Worktree `.worktrees/audit-monthly-2026-06`, lokal branch og remote branch slettet. |
| #264 `Add konsern coverage year tests` | Merget til `main` som `8c63016`. | Reddet den smale year-selection/testverdien fra dirty stack-root #141 uten å rebase hele gamle stacken. | Remote branch `codex/konsern-coverage-year-tests-2026-07-04` slettet. |
| #141 `[codex] Fix konsern coverage measured year` | Lukket uten merge. | Den uttalte measured-year/testverdien er allerede på `main` via #264; gjenværende PR-diff er stale/dirty og må ikke merges som stack-root. | Branch `codex/goal-01-konsern-aar` ble beholdt fordi #142 fortsatt bruker den som base. |
| #159 `feat: integrate Food TG platform lift stack` | Lukket uten merge. | Stale aggregate over G-01 til G-17, dirty mot dagens `main`, og erstattet som sannhetsflate av enkelt-PR-er/recovery-løp. | Branch `codex/platform-stack-integration-2026-06-11` ble beholdt for inspeksjonshistorikk. |
| #142-#157 `G-02` til `G-17` | Lukket uten merge. | Draft-kjeden var fra 2026-06-11/15, 242-335 commits bak dagens `main`, og ikke current proof selv om PR-ene var clean mot sine gamle stack-baser. | Branchene `codex/goal-02-*` til `codex/goal-17-*` ble beholdt for recovery/cherry-pick-inspeksjon. |

## Gjenstående åpne PR-er

Ingen.

## Recovery-spor

1. Ikke reåpne eller merge den gamle stacken direkte.
2. Hvis en G-slice fortsatt trengs, start en ny branch fra dagens `main`, cherry-pick eller porter bare den aktuelle endringen, og åpne en ny smal PR.
3. Behandle gamle #142 og #148 som data-/DB-saker hvis de hentes tilbake: eksplisitt `DATABASE_URL`, `npm run db:generate`, full audit, `npm test`, `npm run lint`, og `npm run build`.
4. Behandle gamle #146, #150 og #151 som menneskelige produkt-/claim-scope-beslutninger før eventuell portering.
5. Slett de beholdte `codex/goal-*` branchene først når recovery-behovet er eksplisitt avklart og det finnes en egen beslutningslogg for hva som ikke skal tas videre.

## Stopplinjer

- Ikke reåpne en lukket draft bare fordi gamle checks var grønne.
- Ikke merge gamle stack-ledd direkte til `main`; porter smalt fra dagens `main`.
- Ikke merge `DIRTY`, stor import, DB, claim/KPI eller plattform-PR uten fersk lokal verifikasjon mot dagens `main`.
- Ikke slett recovery-brancher uten eksplisitt beslutning om at historikken ikke lenger trengs.
- Ikke bland denne PR-ryddingen med Obsidian/P3.2 eller actor-gate-outreach; de krever egne menneskelige scope-valg.
