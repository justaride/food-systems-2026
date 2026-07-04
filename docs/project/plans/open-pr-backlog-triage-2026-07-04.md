---
tittel: Open PR backlog triage
dato: 2026-07-04
status: aktiv-ryddenotat
grunnlag:
  - GitHub PR-liste lest 2026-07-04 etter merge av PR #221 og close av PR #114
  - `git status -sb` på `main` ved `403ce92`
siterbarhet: intern
---

# Open PR backlog triage

## Kort konklusjon

Ready/non-draft-flaten er ryddet: PR #221 er merget, og PR #114 er lukket som erstattet av #221. Det står bare draft-PR-er igjen. PR #141-#157 er i tillegg en stacked PR-kjede, ikke 17 uavhengige PR-er mot `main`. De skal ikke merges automatisk selv om flere har grønne gamle checks, fordi de er eldre plattform-/goal-slices og flere er store nok til å kreve ny scope-, rebase- og produktbeslutning.

## Utført 2026-07-04

| PR | Beslutning | Begrunnelse | Etterarbeid |
|---|---|---|---|
| #221 `data-readiness: monthly audit 2026-07` | Merget til `main` som `403ce92`. | Ikke-draft, mergeable, grønne checks, og nyere månedsaudit. | Remote branch `audit/monthly-2026-07` slettet. |
| #114 `data-readiness: monthly audit 2026-06` | Lukket uten merge. | Erstattet av #221/juli-auditen på samme generated audit-flate. | Worktree `.worktrees/audit-monthly-2026-06`, lokal branch og remote branch slettet. |
| #264 `Add konsern coverage year tests` | Merget til `main` som `8c63016`. | Reddet den smale year-selection/testverdien fra dirty stack-root #141 uten å rebase hele gamle stacken. | Remote branch `codex/konsern-coverage-year-tests-2026-07-04` slettet. |

## Gjenstående åpne PR-er

| PR | Base | Head | Status | Størrelse | Triage |
|---|---|---|---|---|---|
| #159 | `main` | `codex/platform-stack-integration-2026-06-11` | draft, dirty | +8016 / -982 | Stor plattform-PR. Ikke merge uten egen rebase/review og avklaring mot dagens `main`. |
| #157 | `codex/goal-16-claim-board-db` | `codex/goal-17-coverage-badge-system` | draft, clean | +125 / -0 | Toppen av goal-stack, ikke selvstendig `main`-PR. Må enten tas etter #141-#156 eller cherry-pickes til ny branch fra `main`. |
| #156 | `codex/goal-15-detail-breadcrumbs` | `codex/goal-16-claim-board-db` | draft, clean | +723 / -15 | Stack-ledd; krever DB-/claim-board scope-review før ready. |
| #155 | `codex/goal-14-listesider-utvalg` | `codex/goal-15-detail-breadcrumbs` | draft, clean | +317 / -60 | Stack-ledd; UI/route-slice krever fersk produktreview og build før ready. |
| #154 | `codex/goal-13-forside-kontekst` | `codex/goal-14-listesider-utvalg` | draft, clean | +236 / -14 | Stack-ledd; UI/innholdsstruktur krever fersk produktreview og build før ready. |
| #153 | `codex/goal-12-formaalsskille` | `codex/goal-13-forside-kontekst` | draft, clean | +115 / -24 | Stack-ledd; bør vurderes sammen med nåværende forside. |
| #152 | `codex/goal-11-mandat-metodikk-split` | `codex/goal-12-formaalsskille` | draft, clean | +130 / -9 | Stack-ledd; krever fersk review mot dagens ruter. |
| #151 | `codex/goal-10-tomme-tabeller` | `codex/goal-11-mandat-metodikk-split` | draft, clean | +83 / -82 | Stack-ledd; må sjekkes mot senere mandat/metodikk-endringer. |
| #150 | `codex/goal-09-finansvisning-aar` | `codex/goal-10-tomme-tabeller` | draft, clean | +251 / -10 | Stack-ledd; kan være nyttig UX-slice, men krever fersk data-status/build. |
| #149 | `codex/goal-08-finansdata-backfill` | `codex/goal-09-finansvisning-aar` | draft, clean | +220 / -38 | Stack-ledd; krever fersk økonomi-/datagrunnlagssjekk. |
| #148 | `codex/goal-07-kolonnedefinisjoner` | `codex/goal-08-finansdata-backfill` | draft, clean | +1100 / -107 | Stack-ledd; data-/import-slice, ikke merge uten DB-migrerings- og auditløp. |
| #147 | `codex/goal-06-kildede-kpier` | `codex/goal-07-kolonnedefinisjoner` | draft, clean | +464 / -53 | Stack-ledd; kan vurderes etter UI-scope. |
| #146 | `codex/goal-05-missing-data-semantikk` | `codex/goal-06-kildede-kpier` | draft, clean | +363 / -26 | Stack-ledd; claim-/KPI-nær og krever claim-lock/citable-gate før ready. |
| #145 | `codex/goal-04-proveniens` | `codex/goal-05-missing-data-semantikk` | draft, clean | +323 / -71 | Stack-ledd; må sjekkes mot nyere coverage-badge/statusspråk. |
| #144 | `codex/goal-03-datastatus` | `codex/goal-04-proveniens` | draft, clean | +649 / -0 | Stack-ledd; krever citable-/route-review før ready. |
| #143 | `codex/goal-02-import-reconciliation` | `codex/goal-03-datastatus` | draft, clean | +766 / -3 | Stack-ledd; må sammenlignes mot dagens `/api/data-status` og senere statusarbeid. |
| #142 | `codex/goal-01-konsern-aar` | `codex/goal-02-import-reconciliation` | draft, clean | +42149 / -1307 | Stack-ledd; svært stor import/reconciliation-PR. Skal splittes eller rebaseres med eksplisitt mandat før merge. |
| #141 | `main` | `codex/goal-01-konsern-aar` | draft, dirty | +786 / -310 | Stack-root, men dirty/stale. Den smale konsern-år/testverdien er reddet i #264; ikke merge #141 uten ny recovery som eksplisitt vurderer gjenværende mandat-/intake-diff. |

## Neste anbefalte rydderekkefølge

1. Ikke merge flere drafts direkte fra gammel CI-status.
2. Avklar om goal-stack #141-#157 fortsatt skal bevares som stack, eller om enkeltcommits skal cherry-pickes til nye `main`-baserte PR-er.
3. Hvis stacken bevares: start med dirty stack-root #141, men ikke anta at alt må beholdes; #264 har allerede flyttet konsern-år/testdelen til `main`. Rebase mot dagens `main`, vurder gjenværende dokumentdiff, kjør full lokal verifikasjon, og la #142-#157 følge etter i rekkefølge.
4. Hvis stacken splittes: velg én smal commit, cherry-pick til ny branch fra `main`, opprett ny PR, og lukk den gamle stack-PR-en først når erstatningen er merged.
5. Behandle `DIRTY`-PR-en #159 som egen recovery-sak uavhengig av goal-stack.
6. Behandle #142 og #148 som data-/DB-saker med eksplisitt `DATABASE_URL`, full audit og egen importbeslutning.
7. Lukk eller arkiver drafts først etter at branch/worktree er ren og det er dokumentert hva som erstatter dem.

## Stopplinjer

- Ikke markér en draft som ready bare fordi gamle checks er grønne.
- Ikke merge stack-ledd direkte til `main` uten å bevare eller erstatte base-kjeden.
- Ikke merge `DIRTY`, stor import, DB, claim/KPI eller plattform-PR uten fersk lokal verifikasjon mot dagens `main`.
- Ikke slett lokale worktrees/branches uten `git status -sb` på den konkrete worktree.
- Ikke bland denne PR-ryddingen med Obsidian/P3.2 eller actor-gate-outreach; de krever egne menneskelige scope-valg.
