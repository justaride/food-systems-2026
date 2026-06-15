---
tittel: Food TG — Gemini-arbeidsplan + sikker samarbeidsprotokoll (2026-06-15)
status: Operator-protokoll / oppgavepakke for ekstern agent (Gemini)
eier: Gabriel
dato: 2026-06-15
formål: Gjøre det trygt og smart å la Gemini lukke resten av dybdeanalyse-/maktkart-sporet — isolert fra main, én oppgave om gangen, med obligatoriske gater og din review FØR noe når repoet.
relaterte_filer:
  - docs/project/status/food-tg-dybdeanalyse-handoff-2026-06-15.md
  - docs/project/status/food-tg-closeout-2026-06-14.md
  - docs/project/status/food-tg-lokal-kjoere-commit-guide-2026-06-14.md
  - docs/project/plans/food-tg-dybdeanalyse-arbeidsplan-2026-06-14.md
---

# Gemini-arbeidsplan + sikker samarbeidsprotokoll

## 0. Hvorfor dette dokumentet

Forrige Gemini-runde var kapabel, men ivrig: den byttet arbeidsbranch, blandet ditt arbeid + egne endringer i én diffus commit, endret DB-avledede dataartefakter på egen hånd, committet filer du bevisst hadde holdt utenfor, og lot AP-3 stå halvferdig. Ingenting var ødelagt, men det måtte ryddes. Dette dokumentet fjerner den risikoen ved tre grep: **isolasjon** (egen branch, aldri main), **én avgrenset oppgave om gangen med akseptansekriterier**, og **din review før merge**.

## 1. Sikker samarbeidsmodell (TL;DR — 6 regler)

1. **Én sannhet.** Velg ÉN arbeidskopi som kilde (helst `~/Documents/Food Systems 2026`). Ikke la Gemini jobbe i en separat Downloads-kopi og «synce tilbake» — det var halve rotet sist. Hvis Gemini må jobbe i en kopi, behandle branchen som review-enheten, ikke filsystemet.
2. **Branch-isolasjon.** Gemini jobber KUN på `gemini/<oppgave-id>` tatt fra siste `main`. Aldri direkte på main, aldri `git push origin main`, aldri `git merge`, aldri `git checkout main`.
3. **Én oppgave per økt, én commit per oppgave.** Atomisk, enkeltformål, beskrivende melding. Ikke bunt.
4. **Forbudt-liste (hard).** Se §2 — DB-avledede artefakter, scratch-filer, andre repo-kopier, sync-skript.
5. **Obligatoriske gater + kort rapport** ved slutten av hver oppgave (§3).
6. **Du (eller Claude) reviewer** `git diff main...branch` + kjører gatene FØR merge (§5).

## 2. Guardrails — lim inn ØVERST i hver Gemini-økt

> **Arbeidsregler (må følges):**
> 1. Jobb kun på en ny branch `gemini/<oppgave-id>` fra siste `main`. ALDRI commit til main, ALDRI `git push`, ALDRI `git merge`, ALDRI `git checkout main`, ALDRI bytt remote.
> 2. Gjør KUN det den ene tildelte oppgaven sier. Ingen «mens jeg er her»-forbedringer. Ser du noe annet galt → skriv det i rapporten, ikke fiks det.
> 3. RØR ALDRI disse uten at oppgaven eksplisitt sier det: `data/konsern-coverage.json`, `public/data/coverage/profiles.json`, `public/data/**/chart-metrics.json`, eller andre DB-avledede artefakter. De regenereres KUN via `npm run compute-metrics:full`, aldri for hånd.
> 4. ALDRI commit scratch-/utforskningsfiler, genererte audit-CSVer, eller nye topp-nivå `*.md` med mindre oppgaven ber om det. List opp hver nye fil du lagde og spør før du committer dem.
> 5. ALDRI kjør sync-/rsync-skript eller skriv inn i en annen repo-kopi.
> 6. Endrer du LOGIKKEN i et eksisterende skript → si det eksplisitt i rapporten med før/etter-oppførsel. Ikke endre committede skript stille.
> 7. DB-skriving: ALLTID `--dry-run` først, lim inn dry-run-output, og VENT på «go» før du skriver.
> 8. Avslutt ALLTID med: output av `npm test && npm run lint && npm run build && git diff --check`, pluss en 5-linjers rapport (hva / hvorfor / hvilke filer / verifikasjon / åpne spørsmål).
> 9. Claim-disiplin: aldri finn på tall. Mangler data → skriv `needs-data` med eksakt kilde som trengs. Alt er intern baseline bak claim-lock til primærsjekk. «Makt/konsentrasjon» = strukturell posisjon, ikke intensjon.
> 10. Tvil om scope → STOPP og spør. Halvferdig + flagget er bedre enn ferdig + feil.

## 3. Oppgave-mal (hver oppgave gis på denne formen)

```
OPPGAVE-ID: <G-...>
MÅL (1 setning): <hva som skal være sant etterpå>
BRANCH: gemini/<oppgave-id> fra siste main
LES FØRST: <filer>
GJØR: <nummererte steg>
RØR IKKE: <eksplisitt liste utover §2>
LEVERANSE: <eksakt artefakt: fil(er) + innhold>
VERIFIKASJON: <gater + oppgavespesifikk sjekk>
AKSEPTANSEKRITERIUM: <hvordan jeg vet det er riktig — målbart>
```

## 4. Konkret arbeidsplan — gjenstående oppgaver

To spor: **L = lokale DB-steg** (krever din Postgres; allerede dokumentert i closeout + guide), **D = needs-data-lenser** (datainnhenting + analyse).

### Spor L — Lokale DB-steg

**G-L1 — AP-1 dekningsutvidelse (vei 2).**
- LES: `food-tg-lokal-kjoere-commit-guide-2026-06-14.md` §«Vei 2».
- GJØR: `extend-board-coverage-brreg.ts --dry-run` → lim inn → vent «go» → apply → `dedupe-person-keys.ts --commit` → `analyze-board-interlocks.ts --out=...ap1-styreoverlapp.json` → oppdater `dybdeanalyse.ts` `ins-ap1-001` til FAKTISKE tall fra nytt aggregat.
- RØR IKKE: projeksjonstall (46,9 %) som om de er realisert; bruk de faktiske.
- AKSEPTANSE: nytt `ap1-styreoverlapp.json` viser dekning ≥ baseline; `dybdeanalyse.ts` matcher aggregatet; suite grønn.

**G-L2 — Strict-source-opprydding (9 brudd).**
- LES: `food-tg-closeout-2026-06-14.md` (komplett oppskrift: list → bøtte A/B/C → enrich/prune/backfill → re-audit).
- GJØR: nøyaktig stegene der, dry-run først per skript.
- AKSEPTANSE: `npm run db:audit:strict-sources` grønn (0 brudd, eller kun dokumenterte `internal_context`-unntak).

**G-L3 — Operator-sekvens → citable grønt.**
- LES: `research/CITABLE-KNOWLEDGE-BASE-STATUS.md` §«Standard Operator Sequence».
- GJØR: kjør hele sekvensen; rapporter hver gate.
- AKSEPTANSE: `npm run audit:citable` exit 0; readiness-queue uten nye P0.

### Spor D — Needs-data-lenser (datainnhenting + analyse)

**G-D1 — AP-5 eierandel-% (Aksjonærregister).**
- FORUTSETNING: du bestiller uttrekk (skatteetaten.no/deling, 1-ukes lenke; orgnr i `EXPECTED_OWNERS`).
- GJØR: `verify-ownership-aksjonaerregister.ts --file=<csv> --out=research/analyse/ap5-eierandel-verifikasjon-2026.json`; oppdater CL-AP5-001 + PCQ-MAKT-001 fra `bekreftet/avvik`.
- AKSEPTANSE: per-selskap verdikt mot forventet eier/%; samvirke flagget N/A; ingen påstand løftet uten kilde.

**G-D2 — AP-2/AP-8 kryss-node markeds-HHI (størst, mest verdi).**
- MÅL: ekte markeds-HHI per produksjons-/foredlingsnode (i dag har bare retail/dagligvare det).
- LES: `food-tg-maktkart-section8-3-4-funn-2026-06-14.md` (node-dekningskart), `food-tg-ap2-nodekonsentrasjon-funn-2026-06-14.md`.
- GJØR, per node — hent markedsandelsgrunnlag fra navngitt primærkilde, legg rådata i `research/data/nordic/market-share/`, beregn CR3/CR4 + HHI:
  - sjømat: Fiskeridirektoratet (MTB-andeler, jf. AP-6) + Kontali; børsandeler Mowi/Lerøy/SalMar/Austevoll.
  - meieri: TINE markedsandel (markedsregulator/Landbruksdirektoratet/TINE årsrapport).
  - kjøtt/egg: Nortura markedsandel (markedsregulator + KLF).
  - fôr: BioMar/Skretting/Cargill/Mowi Feed volumandeler.
- RØR IKKE: AP-2s inntekts-HHI — det er n-følsomt og skal IKKE blandes med markeds-HHI.
- LEVERANSE: per-node CSV + et `ap2-markeds-hhi-funn`-notat + claim-status; oppdater AP-8 kjerne hvis node-HHI nå finnes.
- AKSEPTANSE: hver node-HHI har kildebelagte markedsandeler (ikke estimat); noder uten kilde står eksplisitt `needs-data`; korrelasjon ≠ årsak holdes.

**G-D3 — AP-7 fôr→oppdrett-PPI.**
- MÅL: teste det opprinnelige fôr→oppdrett-asymmetri-leddet (foredlings-leddet er gjort).
- PROBLEM: SSB har ingen ren månedlig fôr-PPI. GJØR: finn alternativ (Nofima/Fiskeridirektoratet fôrkostnads-/fôrfaktorstatistikk, eller importprisindeks fiskemel/-olje/soya), eller bekreft at det forblir `needs-data` med eksakt manglende serie.
- AKSEPTANSE: enten en kildebelagt fôr-prisserie + asymmetri-test (NARDL, som AP-7), ELLER en presis `needs-data`-spesifikasjon. Ikke lån foredlings- eller dagligvarefunnet inn.

**G-D4 — AP-6 restråstoffvolum per aktør.**
- GJØR: hent RUBIN/SINTEF/Fiskeridirektoratet restråstoffstatistikk; koble til MTB-konsentrasjonen (AP-6) for å tallfeste «hvem genererer/kontrollerer strømmene».
- RØR IKKE: ikke konflater lokalitet/MTB/restråstoffvolum (tre nivåer).
- AKSEPTANSE: faktiske restråstoffvolumer (tonn/aktør) med kilde, eller `needs-data` med eksakt tabell.

## 5. Din review-sjekkliste FØR merge til main

For hver Gemini-branch, før du merger:

- [ ] `git log main..gemini/<id> --stat` — kun forventede filer? Ingen DB-avledede artefakter, scratch, eller ekskluderte docs som ikke hører til oppgaven?
- [ ] `git diff main...gemini/<id>` — endret den noe utenfor oppgavens scope? (særlig committede skript-logikk eller data)
- [ ] `npm test && npm run lint && npm run build && git diff --check` — alle grønne?
- [ ] Oppgavespesifikt akseptansekriterium oppfylt?
- [ ] Tall kildebelagt? Needs-data flagget der det mangler? Ingen ekstern faktastemme uten claim-lock?
- [ ] Hvis ja på alt: `git checkout main && git merge --no-ff gemini/<id> && git push origin main`. Hvis nei: be Gemini fikse på samme branch, eller cherry-pick kun det gode.

Tips: be Claude (denne assistenten) kjøre review-en — coordinator-verifikasjon fanget Gemini-feilene sist.

## 6. Anbefalt rekkefølge

1. **G-L1 + G-L2 + G-L3** (lokalt, lukker citable-porten — størst umiddelbar verdi, alt allerede dokumentert).
2. **G-D1** (eierandel-%, når registeruttrekket er nede — lukker AP-5-laget).
3. **G-D2** (kryss-node markeds-HHI — den tyngste, men det som faktisk løfter maktkartet mot citable).
4. **G-D3 / G-D4** (fôr-PPI, restråstoff — smalere, ofte needs-data).
5. Når L + D-1/D-2 er grønt: vurder å løfte CL-MAKTKART-001 til citable og bygge det samlende uttaket.

## 7. Gyllen regel

Gi Gemini **én oppgave med akseptansekriterium**, la den jobbe på **egen branch**, krev **gater + rapport**, og **review før merge**. Da får du Geminis fart uten Geminis rot.
