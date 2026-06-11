---
tittel: Plattformloft beslutningsreview G-06/G-10/G-11
status: Intern review - avventer Gabriel-vedtak
eier: Gabriel
dato: 2026-06-11
scope: Eksplisitt review av beslutningspunktene som ble implementert uten forhandsvedtak i plattformloftet.
---

# Plattformloft beslutningsreview G-06/G-10/G-11

## Kort konklusjon

Codex-anbefaling: godkjenn alle tre beslutningspunktene som implementert, men ikke merge integrasjonsstacken for Gabriel har gitt eksplisitt ja eller endringsordre per punkt.

Fokustest kjort i integrasjons-worktree:

```bash
node --import=tsx --test tests/lib/frontpage-kpis.test.ts tests/lib/kildede-kpier-integration.test.ts tests/lib/empty-table-notices.test.ts tests/lib/mandat-metodikk-split.test.ts
```

Resultat: 14 tester passerte, 0 feilet. Node varslet `DEP0205` for `module.register()`, men testen exitet 0.

## G-06 Selvforsyningsgrad og KPI-kilder

Vedtak: Avventer Gabriel. Merge er blokkert til Gabriel velger `godkjent` eller `endres for merge`.

Codex-anbefaling: Godkjenn.

Reviewgrunnlag:
- `src/lib/data/forside-kpis.ts` samler selvforsyningsdefinisjonen i `SELF_SUFFICIENCY_REFERENCE`.
- UI-verdien er NIBIO 2024 total inkludert fisk: `41,3%`.
- Forkorrigert verdi er synlig som sekundarverdi: `34,9% forkorrigert`.
- Kildefelt er eksplisitte: NIBIO-label, `year: 2024`, NIBIO-lenke, `lastVerified: 2026-04-30`, `sourceId: SRC-BASE-006`.
- Claim-gate er eksplisitt: `CL-C-015`.
- `src/lib/config/countries/no.ts` peker kartmodellen til samme referanse via `SELF_SUFFICIENCY_REFERENCE.ratio`, ikke en separat 45 %-variant.
- `/sammenligning` bruker verdier og source notes fra datastruktur, med synlig NIBIO/sourceId/claimGate i bolk 2.

Kontrollkommandoer:

```bash
rg -n "44 %|45 %|41,3|34,9|self-sufficiency|selvforsyn" src docs/project/mandates/food-tg-claim-lock-table-2026-05.md
rg -n "FOOD_SYSTEM_KPIS|selfSufficiency|NIBIO|forkorrigert|selvforsyn" src/lib src/app tests/lib
```

Merk:
- Søk finner fortsatt historiske/andre flate-tekster om selvforsyning, blant annet eldre 47 %-tekst i `src/lib/data/verdikjede.ts`. Dette er ikke samme hardkodede 44/45-variant som G-06 skulle fjerne fra forside/sammenligning/kartmodell, men det bor markeres som senere claim-lock-opprydding hvis verdikjede-flaten skal brukes eksternt.

Beslutning:
- Gabriel ma velge: `godkjent` eller `endres for merge`.

## G-10 Tomme tabeller

Vedtak: Avventer Gabriel. Merge er blokkert til Gabriel velger `godkjent` eller `endres for merge`.

Codex-anbefaling: Godkjenn, med bevisst valg om UI-merking fremfor import i denne stacken.

Reviewgrunnlag:
- `src/app/kommunikasjon/KommunikasjonContent.tsx` viser `DataReadinessNotice` nar `Communication` er tom eller ukjent.
- `src/app/havbruk/HavbrukContent.tsx` viser `DataReadinessNotice` nar `FishHealthObservation` er tom eller ukjent.
- `src/app/produsenter/ProdusenterContent.tsx` viser `DataReadinessNotice` nar Company-koblingen mot Landbruksregisteret er smal.
- `src/lib/data-status.ts` genererer tre operational gaps: `communications-empty`, `fish-health-empty`, `landbruksregister-narrow`.
- Alle tre statusnotater er merket som G-10-vedtak og forklarer konsekvens/next action.

Kontrollkommandoer:

```bash
rg -n "communications|fishHealth|landbruksregister|venter pa datagrunnlag|venter på datagrunnlag|fallback|DataReadinessNotice|fishHealthObservations|landbruksregisterCompanies" src/app src/lib tests
node --import=tsx --test tests/lib/empty-table-notices.test.ts
```

Merk:
- Dette fyller ikke tabellene. Implementasjonen valgte `ui_notice` for alle tre: synlig merking, statusnotat og next action.
- Hvis Gabriel vil at en av tabellene faktisk skal importeres for merge, ma G-10 endres for integrasjons-PR.

Beslutning:
- Gabriel ma velge: `godkjent` eller `endres for merge`.

## G-11 Mandat/metodikk-split

Vedtak: Avventer Gabriel. Merge er blokkert til Gabriel velger `godkjent` eller `endres for merge`.

Codex-anbefaling: Godkjenn.

Reviewgrunnlag:
- Claim-board og opportunity-radar ligger pa `/mandat` via `src/app/mandat/MandatContent.tsx` og `src/app/mandat/page.tsx`.
- `/metodikk` har H1 `Metodikk` og forklarer at den er metodeflate for Ten-Step, modeller, Evidence Pack, KPI-er og prompts.
- `/metodikk` lenker til `/mandat` for claim/status-cockpit.
- `/mandat` lenker tilbake til `/metodikk` for metodeforklaring.
- Nav-beskrivelser i `messages/no.json` og `messages/en.json` skiller claim/status-cockpit fra metodeflate.

Kontrollkommandoer:

```bash
rg -n "Claim-board|claim-board|opportunity|Metodikk|Mandat|static-fallback" src/app/mandat src/app/metodikk src/lib/data tests/lib/mandat-metodikk-split.test.ts
node --import=tsx --test tests/lib/mandat-metodikk-split.test.ts
```

Merk:
- Implementasjonen bruker tverrlenker, ikke redirect. Det betyr at gamle lenker til begge ruter fortsetter a leve.
- Retningen matcher planforslaget: `/mandat` er styringsflate, `/metodikk` er metodeflate.

Beslutning:
- Gabriel ma velge: `godkjent` eller `endres for merge`.

## Lokal verifikasjonsstatus 2026-06-11

Status: Integrasjonsstacken er bygget og testet lokalt, og draft-PR #159 er teknisk mergebar med groenn GitHub CI. PR-en skal likevel ikke tas ut av draft foer Gabriel har godkjent eller endret G-06, G-10 og G-11. Gjenstaaende strict source-roedt er klassifisert som baseline/operator-dataavvik, ikke som PR-spesifikk kodefeil.

Gront lokalt:
- `npm ci` passerte i integrasjons-worktree uten lock-sync-feil.
- `git diff --check origin/main...HEAD && git diff --check` passerte.
- `npm run lint` passerte.
- `npm test` passerte etter `npm run db:generate` i fresh worktree. Full suite: 518 tester, 0 feilet.
- `npm run build` passerte. Build skrev genererte chart-metrics timestamps som ble tatt ut av diffen.
- `npm run db:audit` passerte med warnings.
- `npm run audit:konsern` passerte: 14 konserner med data, 0 registry-entries mangler i DB, 18 orphan rotnoder.
- `npm run graph:audit` passerte: 2792 noder, 3241 edges, 0 duplicate node IDs, 0 missing endpoint edges, 0 missing href nodes.
- `npm run audit:research-artifacts -- --base=origin/main` passerte: 45 added paths sjekket, 2724 tracked files sjekket, 0 violations.
- `npm run audit:citable-reports` passerte: Citable report audit passed.
- GitHub draft-PR #159 er apnet og CI er gronn: GitGuardian, Schema migration guard og to `test-and-audit`-kjoringer passerte.
- Etter sync av 29 ignorerte lokale evidence-filer fra hovedcheckoutens `research/` til integrasjons-worktreeets `research/` falt Citation Coverage fra 29 external blocking issues til 0. Filene er Git-ignorert og er ikke del av PR-en.

Restavvik lokalt:
- `npm run db:audit:strict-sources` feiler fortsatt med 9 enforced audit violations i integrasjons-worktree etter evidence-sync.
- `npm run audit:citable` feiler fordi den kjeder videre til strict source-gate.
- Samme strict source-gate feiler ogsa pa oppdatert `main` med 9 enforced violations mot samme lokale DB/env. Det peker pa baseline/lokal data-state som separat operatoravklaring, ikke ren stack-kodefeil.
- Fersk sammenligning: `main` har 0 Citation Coverage external blocking issues, og integrasjons-worktreeet har ogsa 0 etter evidence-sync. PR-en har dermed ikke lenger en egen citation-blockergruppe.
- BoardMember/Shareholder/source-locator gapene er ikke lukket. Dry-run av board-member provenance/correction dekker bare deler av gapet og er ikke brukt som write-fiks.

Read-only prod-baseline 2026-06-11 kl. 13:21 UTC:
- `curl https://food-systems.naturalstateproject.com/api/data-status` returnerte HTTP 200.
- Prod svarte `ok: true`, `dbOk: true`, `pageGatesOk: true`.
- Prod-versjon var `9cf7c60` (`docs: refresh platform landing status (#161)`), altsa foer PR #159 er merget/deployet.
- Prod-API-et hadde fortsatt pre-G-01-formen uten `fieldCoverage`, `operationalGaps` og `artifacts`.
- Relevante prod-tabelltall: `companies: 185`, `landbruksregisterCompanies: 4`, `fishHealthObservations: 0`, `deliveryVolumes: 60310`, `aquacultureSites: 285`, `businessRelationships: 105`.
- Dette bekrefter at B1/B3 ikke er gjort: prod er oppe, men ny `/api/data-status`-dekning og ~275-selskapsavstemming kan ikke dokumenteres for stacken foer PR #159 er merget, deployet og prod-import/operatorsekvens er kjort.

Ikke gjort:
- Ingen DB-muteringer er kjort.
- Ingen prod import, deploy eller operator-sekvens er kjort.
- Draft integrasjons-PR #159 er apnet, men den er ikke klar for merge uten Gabriel-vedtak paa G-06/G-10/G-11.

Merge-gate:
- Gabriel ma eksplisitt godkjenne eller endre G-06, G-10 og G-11.
- Strict source-gate er klassifisert som dokumentert baseline/operator-dataavvik for PR #159: gjenstaende 9 violations finnes ogsa pa `main`, mens PR-spesifikk Citation Coverage-blokkering er 0 etter evidence-sync.
- Prod import, deploy og full operatorsekvens horer til Fase B etter stack-merge, ikke som kode-PR-gate.
