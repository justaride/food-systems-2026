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

Ready/non-draft-flaten er ryddet: PR #221 er merget, og PR #114 er lukket som erstattet av #221. Det står bare draft-PR-er igjen. De skal ikke merges automatisk selv om flere har grønne gamle checks, fordi de er eldre plattform-/goal-slices og flere er store nok til å kreve ny scope-, rebase- og produktbeslutning.

## Utført 2026-07-04

| PR | Beslutning | Begrunnelse | Etterarbeid |
|---|---|---|---|
| #221 `data-readiness: monthly audit 2026-07` | Merget til `main` som `403ce92`. | Ikke-draft, mergeable, grønne checks, og nyere månedsaudit. | Remote branch `audit/monthly-2026-07` slettet. |
| #114 `data-readiness: monthly audit 2026-06` | Lukket uten merge. | Erstattet av #221/juli-auditen på samme generated audit-flate. | Worktree `.worktrees/audit-monthly-2026-06`, lokal branch og remote branch slettet. |

## Gjenstående åpne PR-er

| PR | Branch | Status | Størrelse | Triage |
|---|---|---|---|---|
| #159 | `codex/platform-stack-integration-2026-06-11` | draft, dirty | +8016 / -982 | Stor plattform-PR. Ikke merge uten egen rebase/review og avklaring mot dagens `main`. |
| #157 | `codex/goal-17-coverage-badge-system` | draft, clean | +125 / -0 | Kan vurderes som smal goal-slice, men må rebase-/testes mot dagens `main` og markeres ready før merge. |
| #156 | `codex/goal-16-claim-board-db` | draft, clean | +723 / -15 | Krever DB-/claim-board scope-review før ready. |
| #155 | `codex/goal-15-detail-breadcrumbs` | draft, clean | +317 / -60 | UI/route-slice; krever fersk produktreview og build før ready. |
| #154 | `codex/goal-14-listesider-utvalg` | draft, clean | +236 / -14 | UI/innholdsstruktur; krever fersk produktreview og build før ready. |
| #153 | `codex/goal-13-forside-kontekst` | draft, clean | +115 / -24 | UI/tekst-slice; bør vurderes sammen med nåværende forside. |
| #152 | `codex/goal-12-formaalsskille` | draft, clean | +130 / -9 | Navigasjons-/formålsspråk; krever fersk review mot dagens ruter. |
| #151 | `codex/goal-11-mandat-metodikk-split` | draft, clean | +83 / -82 | Struktur-slice; må sjekkes mot senere mandat/metodikk-endringer. |
| #150 | `codex/goal-10-tomme-tabeller` | draft, clean | +251 / -10 | Kan være nyttig UX-slice, men krever fersk data-status/build. |
| #149 | `codex/goal-09-finansvisning-aar` | draft, clean | +220 / -38 | Finansvisning; krever fersk økonomi-/datagrunnlagssjekk. |
| #148 | `codex/goal-08-finansdata-backfill` | draft, clean | +1100 / -107 | Data-/import-slice; ikke merge uten DB-migrerings- og auditløp. |
| #147 | `codex/goal-07-kolonnedefinisjoner` | draft, clean | +464 / -53 | Liste-/kolonnedefinisjoner; kan vurderes etter UI-scope. |
| #146 | `codex/goal-06-kildede-kpier` | draft, clean | +363 / -26 | Claim-/KPI-nær; krever claim-lock/citable-gate før ready. |
| #145 | `codex/goal-05-missing-data-semantikk` | draft, clean | +323 / -71 | Kan være grunnleggende UX-semantikk, men må sjekkes mot nyere coverage-badge/statusspråk. |
| #144 | `codex/goal-04-proveniens` | draft, clean | +649 / -0 | Proveniens-slice; krever citable-/route-review før ready. |
| #143 | `codex/goal-03-datastatus` | draft, clean | +766 / -3 | Data-statusflate; må sammenlignes mot dagens `/api/data-status` og senere statusarbeid. |
| #142 | `codex/goal-02-import-reconciliation` | draft, clean | +42149 / -1307 | Svært stor import/reconciliation-PR. Skal splittes eller rebaseres med eksplisitt mandat før merge. |
| #141 | `codex/goal-01-konsern-aar` | draft, dirty | +786 / -310 | Dirty/stale goal-slice. Ikke merge uten egen recovery/rebase. |

## Neste anbefalte rydderekkefølge

1. Ikke merge flere drafts direkte fra gammel CI-status.
2. Velg én av de små clean draft-PR-ene (#157, #153, #152, #151 eller #150) for fersk rebase/review hvis plattformløftet fortsatt er ønsket.
3. Behandle `DIRTY`-PR-ene #159 og #141 som egne recovery-saker.
4. Behandle #142 og #148 som data-/DB-saker med eksplisitt `DATABASE_URL`, full audit og egen importbeslutning.
5. Lukk eller arkiver drafts først etter at branch/worktree er ren og det er dokumentert hva som erstatter dem.

## Stopplinjer

- Ikke markér en draft som ready bare fordi gamle checks er grønne.
- Ikke merge `DIRTY`, stor import, DB, claim/KPI eller plattform-PR uten fersk lokal verifikasjon mot dagens `main`.
- Ikke slett lokale worktrees/branches uten `git status -sb` på den konkrete worktree.
- Ikke bland denne PR-ryddingen med Obsidian/P3.2 eller actor-gate-outreach; de krever egne menneskelige scope-valg.
