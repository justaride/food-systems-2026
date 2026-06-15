---
tittel: JT-fokusområder fra 09.06 — statusvurdering og arbeidsplan
status: Intern statusvurdering
eier: Gabriel
dato: 2026-06-12
scope: Vurdering av ukens arbeid (09.06–12.06) målt mot fokusområdene og bestillingene fra møte 10 (JT-arbeidsavklaring 09.06.2026), gap-analyse, og detaljert arbeidsplan frem mot 31.07 med H2-skisse.
relaterte_filer:
  - docs/meetings/food-systems-transkripsjon-bearbeidet-2026-06-09.md
  - docs/project/analysis/food-tg-vurderingsrapport-siden-jt-2026-06-10.md
  - docs/project/status/STATUS-OG-ARBEIDSPLAN-2026-06-11.md
  - docs/project/mandates/food-tg-0906-sprintboard-go-no-go-2026-06-10.md
  - docs/project/mandates/jt-beslutningssaker-uke-25-2026-06-15.md
  - docs/project/status/jt-uke25-sendepakke-2026-06-15.md
bruksregel: Internt arbeidsdokument. Ingen tall eller formuleringer herfra brukes eksternt uten operator-sekvensen i research/CITABLE-KNOWLEDGE-BASE-STATUS.md.
---

# JT-fokusområder 09.06: hva er gjort, hva gjenstår, og veien dit

## 1. Kort konklusjon

Bestillingene fra JT-samtalen 09.06 er i all hovedsak omsatt til ferdig internt apparat: case-shortlist med 7 caseankre, casekort med claim hygiene, sprintboard med go/no-go per case, deck v0.1 (manus + redigerbar PPTX), beslutningssaker, DASK/AASK-pakker og en komplett JT uke 25-sendepakke. Parallelt er hele plattformløftet (17 goals) implementert og ligger reviewklart i draft-PR #159 med grønn CI.

Det som gjenstår er ikke mer produksjon, men **gjennomføring av porter**: fire formelle beslutninger (minimumsvedtak, H1/H2, Port E, DASK-utsending), faktisk møtebooking og utsending av pakken, landing av plattformstacken på prod, og målrettet kildeinnhenting per sprintboard-blokker. Hovedrisikoen er at internt arbeid fortsetter å fortrenge H1-løpet mot kontraktsfristen 31.07.

## 2. JT-fokusområdene fra møte 10 (09.06)

Samtalen ga seks tydelige fokusområder pluss en prosesstidslinje:

1. **Scope-spissing:** bort fra «hele matsystemet», inn i 5–7 verdikjedeankre der NCH/Natural State har data, relasjoner eller innganger.
2. **Konkrete arbeidsbestillinger (kap. 6 i referatet):** (A) trekk ut lovende spor fra eksisterende plattform, (B) case-shortlist med definert kortmal, (C) skill påstander fra validerte funn, (D) stakeholder-kart.
3. **Leveransestruktur (kap. 7):** executive summary, 5–7 prioriterte caseområder, casekort med problem/data/barrierer/stakeholders/funding/første handling, claim hygiene-tabell, timeline juni–desember, deck-uttak.
4. **Juni-mål:** ferdigstille bred analyse, scope ned, identifisere caseområder, stakeholders og funding opportunities, trekke ut det beste fra plattformen.
5. **Tidslinje:** august (stakeholder-møte, funding-prioritering, whitepaper-draft), september (whitepaper-konsentrasjon), slutten av oktober (mulig Oslo Innovation Week, 3 dager), november (whitepaper + roadmap ferdig).
6. **Valideringsdisiplin:** samtalehypoteser (MOU Brasil/Elfenbenskysten, Bama-marginer, dansk svinereduksjon, Valio «importfritt», spillvarmetall) skal gjennom source shortlist, claim-lock og PCQ før ekstern bruk.

## 3. Status per fokusområde

| # | JT-bestilling | Status | Evidens |
|---|---|---|---|
| 1 | Scope-spissing til 5–7 caseankre | **Levert internt — venter formelt vedtak** | `food-tg-case-shortlist-addendum-2026-06-09.md` (7 ankre + watchlist); minimumsvedtak-tekst klar i `food-tg-minimumsvedtak-casekort-2026-06-09.md`; vedtak ikke fattet |
| 2A | Trekk ut lovende spor fra plattformen | **Levert** | Vurderingsrapport 10.06: spor A (fôr/import) mest modent, B (restråstoff, 100% Fish-benchmark) modent, C (marked/adoption-gate) forklarende; deck-readiness-tabell viser hva som kan fylles nå |
| 2B | Case-shortlist med kortmal | **Levert** | Casekort i `food-tg-casekort-og-research-mottak-2026-06-10.md`; sprintboard med nå-status, blokkere, stoppsignal og go/no-go per case |
| 2C | Skill påstander fra validerte funn | **Levert** | Claim-lock-innstramming; statusmodell (dekket-sterkt-internt / venter-aktør / nytt-uten-kilde / benchmark / hold-tilbake); 8 DRO/DRR-resultater mottatt og klassifisert 10.06; 0 hypoteser lekket inn i faktastemme |
| 2D | Stakeholder-kart | **Delvis** | AASK-pakke skrevet per case (`food-tg-dokumentask-og-actor-ask-pack-2026-06-10.md`), men ikke sendt — gated bak minimumsvedtak; ingen aktører kontaktet |
| 3 | Leveransestruktur (exec summary, casekort, claim hygiene, timeline, deck) | **Levert** | Deck v0.1 som manus + PPTX (`jt-deck-v0.1-uke-25-2026-06-15.md/.pptx`, QA-guarded via PR #182); timeline juni–desember i case-shortlist; statusnotat til JT kondensert (`jt-statusnotat-uke-25-2026-06-15.md`) |
| 4 | Juni-mål: stakeholders + funding opportunities | **Delvis** | Stakeholder-kandidater per case finnes i casekort/AASK; **eksplisitt funding opportunity-oversikt er ikke samlet som eget uttak** — funding-vinkel ligger spredt per casekort |
| 5 | Tidslinje aug–nov (whitepaper, event, OIW) | **Strukturert, ikke vedtatt** | H1/H2-todeling formulert i `FOOD-TG-UTVIKLINGSPLAN-2026-06-10.md`; Port E event-go-pakke klar (`port-e-event-go-uke-25-2026-06-15.md`); begge venter på JT/Einar-vedtak |
| 6 | Valideringsdisiplin på samtalehypoteser | **Levert og praktisert** | Deep research-runde 10.06 ga differensiert utfall: Valio/distribusjon/100% Fish «deckklart internt», kaffe/kakao needs-primary-check, Polen watchlist/kill-test; DASK-0906-001/002 klare, ikke sendt |

I tillegg, utenfor bestillingen men i tråd med transparens-temaet: hele plattformløftet (G-01–G-17, 139 filer, ~8 150 linjer) er implementert og ligger i draft-PR #159 med grønn CI; kontroll- og styringsdokumenter, JT-pakke, operatorlogg, Port E-pakke, mottaksprotokoll og møtelogg-reparasjon er landet på main via PR #158–#186. Read-only prod-preflight (run 27369814363) bekrefter at DB-tunnel og baseline er oppe.

## 4. Gap-liste: hva gjenstår for å nå målene

### 4.1 Beslutninger (ingen kontrollfil kan erstatte disse)

1. **Sak 1 — Minimumsvedtak casekort** (anbefalt alt. A): uten dette er deck, DASK og roadmap v0.1 uten formelt casegrunnlag.
2. **Sak 2 — H1/H2-todeling** mot 31.07: må bekreftes av JT/Einar mot Nordic Innovation-kontrakten.
3. **Sak 3 — Port E** (offentlig online event, anbefalt webinar uke 29/30): Thea må aktiveres i uke 25 for at A-løpet skal rekke 31.07.
4. **Sak 4 — DASK-0906-001/002** sendes internt: avgjør om kaffe/kakao overlever som relasjonscase eller parkeres.

### 4.2 Operative handlinger (klare, men ikke utført)

- Møtebooking JT uke 25 (ons–fre); invitasjonstekst og sendepakke ligger klar, ingenting er sendt.
- DASK-utsending (etter Sak 4-godkjenning) og responslogg-føring i operatorloggen.
- Thea-aktivering (betinget Port E).
- AASK-aktørvalidering (etter minimumsvedtak) — reell flaskehals for å løfte noe case forbi «sterk intern baseline».

### 4.3 Plattformlanding (Fase A/B fra 11.06-planen)

- Gabriel-vedtak på G-06 (selvforsyningsvalg), G-10 (tomme tabeller), G-11 (mandat/metodikk-split) i PR #159-review.
- Merge #159 → `npm run verify:platform-stack-main` på main.
- Prod-data-import skarpt (`registers`/`full` med `confirm=IMPORT`), Brreg-backfill (dry-run → apply), deploy via Coolify, røyk-test.
- Operator-sekvens (CITABLE-KNOWLEDGE-BASE-STATUS) re-kjørt maks 24 t før JT-møtet — gate-tallene fra 10.06 er ferskvare.

### 4.4 Innhold gjennom portene (per sprintboard-blokker)

- **Kaffe/kakao:** MOU/avtaletekst via DASK; ellers parkeres relasjonscasene og kaffe beholdes som import-/EUDR-kildecase.
- **Valio:** fôrkurv/importandel via Ruokavirasto/Tulli; lås «soyafri governance»-formuleringen.
- **Distribusjon/adoption:** bredt casenavn; aktørdata via AASK; ingen BAMA-spesifikke claims.
- **Spillvarme:** mini-ledger Hima/Frövi/Wiig/Kviamarka/Varde/Polar; driftsdata fra Green Mountain/Hima; Wiig kill/valider via Klepp/Enova.
- **100% Fish:** Statistics Iceland + SINTEF/FHF-fraksjonsdata; benchmark-only.
- **Skottland/Polen:** ZWS/SBMT-fulltekst; Polen kill-test via GUS/PROM — ellers parkering.

### 4.5 Uttak som mangler helt

- **Funding opportunity-oversikt** som samlet uttak (eksplisitt juni-mål fra JT) — finnes bare spredt per casekort.
- **Guidet leserreise på forsiden** + topp-seksjon på /innsikt (onboarding-funnene fra 27.05); /metodikk-hydration (P1).
- **Roadmap v0.1** (H1-kontraktsleveransen) — strukturen finnes i utviklingsplanen, dokumentet er ikke skrevet.

Oppdatert 12.06: casestatus-flaten er nå bygget i appen på `/casestatus`, med committed datafil og egen QA-test. Den flyttes derfor fra gap-listen til verifikasjon/landing sammen med app-endringen.

## 5. Arbeidsplan

### Fase 0 — I dag og i morgen (12.–13.06, Gabriel)

| # | Oppgave | Detalj | Ferdigkriterium |
|---|---|---|---|
| 0.1 | Vedta G-06/G-10/G-11 i PR #159-review | De tre beslutningsgoalene er eneste blokker for merge | Vedtak dokumentert i PR; `godkjent` eller endringsbestilling |
| 0.2 | Merge #159 + A4-verifikasjon | `npm run verify:platform-stack-main` | Alt grønt på main; goal-statustabell oppdatert til `ferdig` |
| 0.3 | **Send møteinvitasjonen til JT** | Tekst klar i `jt-moteinvitasjon-uke-25-2026-06-15.md`; inviter Einar til Sak 2/3 | Møte booket ons–fre uke 25; logget i operatorloggen |
| 0.4 | Send sendepakken | `jt-uke25-sendepakke-2026-06-15.md` med statusnotat + beslutningssaker i forkant, eksplisitt «dette ber vi om vedtak på» | Sending logget i `jt-uke25-operatorlogg-2026-06-15.md` |

Punkt 0.3/0.4 er uavhengige av plattformlandingen og skal ikke vente på den.

### Fase 1 — Data og deploy (13.–16.06, Gabriel)

| # | Oppgave | Detalj | Ferdigkriterium |
|---|---|---|---|
| 1.1 | Prod-data-import skarpt | `registers` eller `full` med `confirm=IMPORT` etter merge; avklar hvilken DB reconciliation traff | `/api/data-status` viser ~275 selskaper, 0 uforklarte avvik |
| 1.2 | Brreg-backfill | `db:backfill:financials-brreg` dry-run → review → `--apply` | Finansdekning ≥ 90 % for norske AS/ASA på `/datastatus` |
| 1.3 | Deploy + røyk | Coolify; verifiser `/api/version`, `/datastatus`, proveniens-linjer | Nye flater live |
| 1.4 | Funding opportunity-uttak | Samle funding-vinklene fra de 7 casekortene i én oversikt (juni-målet fra JT); merk modenhet per mulighet | Ett dokument/seksjon klar til JT-møtet |

### Fase 2 — JT-beslutningsmøtet (ons–fre uke 25)

| # | Oppgave | Detalj | Ferdigkriterium |
|---|---|---|---|
| 2.1 | Operator-sekvens ≤ 24 t før møtet | Full re-kjøring per CITABLE-KNOWLEDGE-BASE-STATUS | Strict gate grønn, datert; ferske tall i deck/notat |
| 2.2 | Gjennomfør beslutningsmøtet | Fire saker fra `jt-beslutningssaker-uke-25-2026-06-15.md`; deck v0.1 som støtte; demo av `/datastatus` og kildede KPI-er hvis Fase 1 er landet | Vedtak per sak ført i `decision-log-food-tg.md` samme dag |
| 2.3 | Møtereferat innen 48 t | Per føringsregelen fra 11.06: fil i `docs/meetings/` + MØTEOVERSIKT-rad; merk type (`formelt vedtak`) | Møtelogg komplett |

### Fase 3 — Rett etter vedtak (uke 25–26, betinget av sakene)

| # | Oppgave | Betinget av | Detalj |
|---|---|---|---|
| 3.1 | Send DASK-0906-001/002 (+ 003–009 fortløpende) | Sak 4 | Copy-ready tekst klar; responser/parkering føres i operatorlogg; kaffe/kakao får go/no-go |
| 3.2 | Aktiver Thea + eventløp | Sak 3 = A | Innholdsdesign, påmeldingsside, Q&A-stoppliste, generalprøve; webinar uke 29/30 |
| 3.3 | Start AASK-aktørvalidering | Sak 1 | Egen gate; først kandidatene der case er «deckklart internt» (Valio, distribusjon, 100% Fish) |
| 3.4 | Kildeinnhenting per sprintboard | Sak 1 | Rekkefølge: ZWS/SBMT (Skottland), Statistics Iceland + SINTEF/FHF (100% Fish), Ruokavirasto/Tulli (Valio), Hima mini-ledger, GUS/PROM (Polen kill-test) |
| 3.5 | Casestatus-flate i appen | Utført lokalt 12.06; landes med app-commit | `/casestatus` viser 7 ankre × go/no-go × blokkere × deck-readiness; gjør styringsdialogen med JT løpende |

### Fase 4 — H1-leveransen (uke 26–31, frist 31.07)

| # | Leveranse | Detalj |
|---|---|---|
| 4.1 | Strategic roadmap v0.1 | Bygges av casekort + claim-trakt; kun citable uttak og trygg språkbank; umodne case vises som «under validering» |
| 4.2 | Offentlig online event | Per Port E-vedtak; fallback B (innspilt presentasjon + oppsummering) hvis A glipper |
| 4.3 | Deck eksternklar | Løft v0.1 fra intern beslutningsdeck til presentasjonsformat etter operator-sekvens |
| 4.4 | Onboarding-minimum | Guidet leserreise på forsiden + /innsikt-toppseksjon + /metodikk-fix — nødvendige hvis plattformen skal vises eksternt rundt eventet |
| 4.5 | Stakeholder-møte | JTs juni/august-mål; realistisk i månedsskiftet, etter AASK-responser |

### H2-skisse (august–desember, per JT-tidslinjen — vedtas i Sak 2)

August: funding-prioritering + whitepaper-draft. September: whitepaper-konsentrasjon (narrativ, claims-validering, case→anbefaling). Slutten av oktober: mulig Oslo Innovation Week (3 dager: Food/Cities/Construction) som vertskap for TG-arbeidet. November: whitepaper + roadmap v1.0 + videreføringsplan.

## 6. Risikobilde

| Risiko | Sannsynlighet | Mottiltak |
|---|---|---|
| Internt arbeid fortsetter å fortrenge H1-løpet mot 31.07 | Høy uten styring | Fase 0.3/0.4 (booking/sending) gjøres nå, uavhengig av plattform; nytt plattformarbeid utover casestatus-flaten fryses til etter Port E |
| JT-møtet blir orientering uten vedtak | Middels | Beslutningssakene sendes i forkant med eksplisitt vedtaksbestilling; møtet rammes som beslutningsmøte |
| Kaffe/kakao tar deck-plass uten dokumentgrunnlag | Middels | DASK-stoppsignalene håndheves; parkér aktivt ved manglende dokumenteier |
| Gate-regresjon før møtet | Lav–middels | Operator-sekvens maks 24 t før møtet (2.1) |
| Deploy-/datafeil i Fase 1 | Lav–middels | Deploy-kjeden er nyreparert (#137–#140); verify-only-preflight er allerede grønn; dry-run før alle skarpe skriv |
| Theas kapasitet aktiveres for sent for uke 29/30-event | Middels | Sak 3 avgjøres i uke 25-møtet; fallback B er definert |

## 7. Verifikasjon av dette dokumentet

Grunnlag: møtereferatet `food-systems-transkripsjon-bearbeidet-2026-06-09.md` (fokusområder/bestillinger), `food-tg-vurderingsrapport-siden-jt-2026-06-10.md` (leveransetabell mot 09.06-bestillingene, kvalitetstall 10.06), `STATUS-OG-ARBEIDSPLAN-2026-06-11.md` (plattformstatus, Fase A–D, prod-preflight), sprintboardet 10.06 (per-case-blokkere og go/no-go), `jt-beslutningssaker-uke-25-2026-06-15.md` (de fire sakene) og git-logg verifisert 12.06 (kontrollfil-commit `aa71655` lå på main før casestatus-arbeidet). Kvalitetstall (446 tester, 0 blocked_unsourced, 7/12 cite-ready) er fra 10.06 og skal re-verifiseres i operator-sekvensen før ekstern bruk. `git diff --check` kjørt rent på dette dokumentet.
