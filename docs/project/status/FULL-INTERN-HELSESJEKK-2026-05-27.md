# Full intern helsesjekk 2026-05-27

**Status:** Internt arbeidsklart; eksternt delingsklart bare med citable-/claim-filter og tydelige forbehold.
**Scope:** Git, tester, build, DB/provenans, citable-status, kunnskapsgraf, remediation-backlog, mote-/beslutningsspor og fysisk runtime-QA av nokkelflater.
**Konklusjon:** Ingen P0-blokkere funnet i denne gjennomgangen. Ett P1 runtime-funn ble bekreftet pa `/metodikk`; resten av gjenstaende arbeid er reell portefoljegjeld, men ikke en teknisk stopp for videre internt arbeid.

## Verifisert 2026-05-27

| Kontroll | Resultat | Notat |
|---|---:|---|
| Git baseline | clean | `codex/felles-nettverkskart` er synket med egen remote; `origin/main` har beveget seg og ma rebase-/merge-sjekkes for integrasjon. |
| `npm run lint` | pass | ESLint uten rapporterte feil. |
| `npm test` | pass | 312 tester, 73 suiter, 0 fail. |
| `npm audit --audit-level=moderate` | pass | 0 vulnerabilities. |
| `npm run research:validate-download-backlogs` | pass med warnings | 370 rader, 0 errors, 40 duplicate warnings. |
| `npm run db:audit` | pass | 183039 DB-rader i oppsummering; enforced integrity checks pass. |
| `npm run db:audit:strict-sources` | pass | Strict provenance gate pass; kjente source/report warnings er ikke blokkere. |
| `npm run audit:citable-reports` | pass | No issues found. |
| `npm run audit:citable` | pass | Citation queue: P0 0, P1 0, P2 1, P3 0. |
| `npm run research:citable-acceptance-pack` | pass | 7/12 cite-ready, 5 blocked. |
| `npm run graph:audit` | pass | 2137 nodes, 2739 edges, 100 % edge confidence, 0 missing endpoint edges. |
| `npm run build-remediation-backlog` | pass | 471 funn: 0 HIGH, 0 MEDIUM, 471 LOW. |
| `npm run build` | pass | Prisma generate, metrics, konsern audit og Next build pass. |

## Runtime-QA

Kjort lokalt pa `http://127.0.0.1:3001` etter at port 3000 var opptatt. Playwright-snapshot av forsiden var populert. De avtalte nokkelflatene hadde ikke runtime error-tekst; separat kontroll av `/metodikk` bekreftet 1 React hydration error.

| Flate | Resultat | Observasjon |
|---|---|---|
| `/` | pass | H1 `Food Systems 2026`, 2902 body chars. |
| `/mandat` | pass | H1 `Food TG mandat og validering`, 25010 body chars. |
| `/innsikt` | pass | H1 `Innsikt`, 114294 body chars. |
| `/graf` | pass | H1 `Kunnskapsgraf`, canvas til stede, 10416 body chars. |
| `/hvitbok` | pass | H1 `Hvitbok`, 1906 body chars. |
| `/kilder` | pass | H1 `Kunnskapsgrunnlag`, 375200 body chars. |
| `/moter` | pass | H1 `Moter`, 24861 body chars. |
| `/bibliotek` | pass | H1 `Bibliotek`, 141161 body chars. |
| `/rapporter` | pass | H1 `Rapporter`, 22023 body chars. |
| `/sammenligning` | pass | H1 `Nordisk sammenligning`, 8966 body chars. |
| `/forsyningskjede` | pass | H1 `Forsyningskjede`, canvas til stede, 21168 body chars. |
| `/metodikk` | P1 runtime debt | H1 `Metodikk`, 10357 body chars, 1 console error: hydration mismatch i `EmergenceVisualization`. |

API-flater:

| API | Resultat |
|---|---|
| `/api/version` | 200, object keys `sha`, `shortSha`, `branch`, `builtAt`. |
| `/api/data-status` | 200, object keys `ok`, `checkedAt`, `version`, `dbOk`, `pageGatesOk`, `tables`, `tableErrors`, `pages`. |
| `/api/insights` | 200, object keys `count`, `insights`. |
| `/api/sources` | 200, object keys `count`, `sources`. |

## Restanser

| Prioritet | Omrade | Status | Neste handling |
|---|---|---|---|
| P0 | Blokkere | Ingen funnet | Behold gate-settet over som restartkrav for neste storre endring. |
| P1 | Graf-evidens | 117 handlingsbare isolater: 42 `missing_evidence_link`, 65 `missing_actor_relationship`, 10 `missing_person_role` | Ta en ny liten, reviewet slug-/aktor-ledger for hoyverdi-innsikter brukt i Food TG, hvitbok eller offentlige appflater. |
| P1 | Runtime hydration | `/metodikk` rendrer, men `EmergenceVisualization` gir hydration mismatch fordi simuleringen bruker `Math.random()` under initial render | Gjør simuleringen deterministisk ved SSR/hydration eller initier tilfeldig agentstate etter mount; verifiser med Playwright `console error` pa `/metodikk`. |
| P1 | Mote-/beslutningsspor | Repoet mangler formelle Food TG-motereferater etter 21.04.2026; 26.05-notatet er metode-intake, ikke formelt TG-vedtak | Be Cathrine/JT om moteloggen 22.04-dd.; oppdater `docs/meetings/`, `meetings.ts` og kadens/ukedag. |
| P1 | Integrasjon mot `main` | `origin/main` har nye commits etter siste push | Rebase/merge feature branch mot oppdatert `main` for PR/merge, og rerun minimum `npm test`, `npm run db:audit:strict-sources`, `npm run graph:audit`, `npm run build`. |
| P2 | Remediation backlog | 471 LOW: 308 orphan files, 44 low-text PDFs, 44 blocked URLs, 41 dead URLs, 29 HTML issues, 2 other URL issues, 1 broken supportingSource, 1 duplicate Document, 1 oversized PDF | Rydd bare der funnet brukes i app, rapport, Food TG-claim eller citable output. |
| P2 | Download-backlog warnings | 40 duplicate warnings, 0 errors | Dedup backlog-rader nar de likevel berorer aktiv kildeinnhenting. |
| Hold | Monica Odegard | 1 personduplikatgruppe krever manuell review; 0 merge-kandidater | Ikke auto-merge uten ny selskap-/rolle-evidens. |

## Stop-regler

- Ikke kall hele kunnskapsbasen eksternt validert; bare citable-filtrerte svar/claims kan deles som citable.
- Ikke merk Wageningen/Moerman som ekstern validering, pilotbevis eller KPI-effekt uten formelt Food TG-vedtak og kildegrunnlag.
- Ikke bruk `blocked` URL som bevis pa dod kilde uten separat nettleser-, mirror- eller lokalpakkeverifikasjon.
- Ikke bulk-slett orphan files for de er sjekket mot appflater, rapporter, DB-rader og Food TG-claimbruk.
- Ikke importer gamle insight seed-rader i bulk; fortsett med sma reviewede ledgers og dry-run for hver batch.
