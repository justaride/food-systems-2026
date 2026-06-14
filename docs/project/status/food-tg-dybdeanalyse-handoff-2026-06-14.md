---
tittel: Food TG Dybdeanalyse — handoff for neste økt 2026-06-14
status: Intern handoff / start-her
eier: Gabriel
dato: 2026-06-14
branch: codex/food-tg-strategiuttak-2026-06-14
formål: Gjør det mulig å plukke opp dybdeanalyse-tråden i en ny økt uten å lese hele historikken.
---

# Dybdeanalyse — start her for fortsettelsen

## 1. Hva er gjort (intern baseline, claim-locked, testet)

Tråden gjorde research-laget om fra «kanskje common knowledge» til et triangulert maktkart. Alt er **intern baseline** bak claim-lock; ingenting er eksternt validert.

| Pakke | Funn (kort) | Skript | Funnnotat |
|---|---|---|---|
| AP-3 tilskudd | Produksjonsstøtte moderat konsentrert (Gini ~0,52); makten ligger ikke der. Fanget 2024-datafelle | `scripts/analyze-subsidy-concentration.ts` | `...ap3-tilskuddskonsentrasjon-funn-2026-06-14.md` |
| AP-1 styrer | Styrebroer klumper seg i retail/logistikk/foredling (36 % dekning) | `scripts/analyze-board-interlocks.ts` | `...ap1-styreoverlapp-funn-...md` |
| AP-2 eierskap | HHI ikke sammenlignbar (n-følsom); retail/logistikk er samvirke/familie, ikke aksjekonsentrert | `scripts/analyze-node-concentration.ts` | `...ap2-nodekonsentrasjon-funn-...md` |
| AP-5 konsern | 19 tverrsektorielle kontrollører; NorgesGruppen 39 selskaper × 4 ledd; sektorpar = AP-1 | `scripts/analyze-cross-holdings.ts` | `...ap5-krysseie-funn-...md` |
| Syntese | Maktkart: vertikal konsernintegrasjon i dagligvare/distribusjon, via samvirke/familie + styrer | — | `...maktkart-syntese-2026-06-14.md` |

Hovedfunn: makten er usynlig i tilskudd (AP-3) og aksje-HHI (AP-2), men synlig i styrer (AP-1) og konsern (AP-5) — og de to uavhengige kildene gir samme sektorpar-mønster (logistikk↔retail 7=7, foredling↔retail 6=6).

Synlig i appen: `/innsikt` har en «Dybdeanalyse»-seksjon (`src/app/innsikt/DybdeanalyseSection.tsx` + `src/lib/data/dybdeanalyse.ts`) som viser de fire funnene med claim-lock-status, pakket i InternalBanner. Ship på main-merge (committed data, ingen DB-seeding). Testsuite 488/488.

## 2. Konvensjoner (følg disse for nye AP-pakker)

- DB-skript med **ren, eksportert kjerne** + `pathToFileURL`-guard så testen kan importere uten å kjøre main.
- **Enhetstest matematikken** mot håndregnede verdier (`tests/scripts/*.test.ts`).
- **Funnnotat** med: kort funn, tall, tolkning (lakmustest), datakvalitetsflagg, claim-lock-rad (CL-AP*-001), forbehold, neste, verifikasjon.
- **Claim-disiplin:** «makt/kontroll» = strukturell posisjon, ikke intensjon. Dekningsgrad rapporteres alltid. Intern baseline til primærsjekk.
- **Surfacing:** legg én rad i `src/lib/data/dybdeanalyse.ts` (figur valgfri; seksjonen håndterer `figure: null`).
- Verifiser før commit: `npx eslint <filer>`, `npx tsc --noEmit` (sjekk kun egne filer), `npm test`, `git diff --check`.

## 3. Tre veier videre (velg i ny økt)

1. **Mot citable** (høyest verdi): kjør primærsjekkene i `maktkart-syntese §8` — Brønnøysund-stikkprøve av ultimate ownership (AP-5 topp-konsern) + topp-styreverv (AP-1). Det løfter CL-MAKTKART-001 mot ekstern bruk / whitepaper-kapittel.
2. **Lukk dekningshull:** utvid AP-1 styredata (36 %) for inputs/fôr, sjømat, produksjon, så styre- og eierkart står likt (task #22).
3. **Flere lenser:** AP-4 (verdifangst volum vs verdi), AP-6 (havbrukskonsentrasjon, 285 lokaliteter), AP-7 (pris-asymmetri replikering), AP-8 (tilskudd↔konsentrasjon-korrelasjon) — alle spesifisert i `food-tg-dybdeanalyse-arbeidsplan-2026-06-14.md`.

## 4. Åpne tråder utenfor dybdeanalysen

- 2024-tilskudd må re-verifiseres mot Landbruksdirektoratets publiserte totaler (AP-3 datafelle).
- Definerte søk (`food-tg-definerte-sok-spesifikasjon-...`): tidskritisk DS-B-01 (FHF-frist 26.06) og DS-F-01 (MOU, Sak 4) — men de tilhører program-/governance-sporet (JT/TG), ikke research-laget.
- `/innsikt`-seksjonen er klar til deploy ved neste main-merge.

## 5. Verifikasjon

Alle tall stammer fra de enhetstestede skriptene og deres JSON-aggregater i `research/analyse/`. Ingen påstand er løftet til ekstern bruk. Branch `codex/food-tg-strategiuttak-2026-06-14`; forrige commit `4929f1a` (AP-1/AP-3 + strategiuttak), denne økten legger AP-2/AP-5 + syntese + `/innsikt`-surfacing.
