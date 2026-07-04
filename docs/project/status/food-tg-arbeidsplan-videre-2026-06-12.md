---
tittel: Food TG Arbeidsplan videre — for utførelse i Codex
status: Aktiv intern arbeidsplan
eier: Gabriel
dato: 2026-06-12
scope: Samlet, prioritert arbeidsplan basert på dekningsmatrisen, spor1-uttakene og innsiktssyntesen 12.06. Skrevet for å deles direkte med Codex som utførende agent. Inkluderer kjøreregler, faser, oppgaver med akseptkriterier og anbefalt kjørenivå per fase.
relaterte_filer:
  - docs/project/status/food-tg-dekningsmatrise-og-uthentingsliste-2026-06-12.md
  - docs/project/analysis/food-tg-innsiktssyntese-2026-06-12.md
  - research/external/spor1-uttak-2026-06-12/
  - docs/project/figures/food-tg-2026-06-12/
  - docs/project/analysis/desk-research-logg-dro-0906-2026-06-12.md
---

# Arbeidsplan videre, Food TG — 12.06.2026

## 0. Slik brukes planen

Fasene kjøres i rekkefølge 1 → 5. Fase 1 er blokkerende for alt som siterer tall (deck, casestatus, eksterne flater), fordi den retter faktafeil. Fase 2–3 kan kjøres parallelt etter fase 1. Fase 4 venter på JT-vedtak men kan *forberedes* nå. Hver oppgave har ID, akseptkriterium og anbefalt kjørenivå.

### Anbefalt Codex-kjørenivå (oppsummert)

| Arbeidstype | Resonneringsnivå | Autonomi/godkjenning |
|---|---|---|
| Fase 1 (kontrollfiler: claim-lock, PCQ, source-shortlist, casestatus) | **Høyt** | **Forslagsmodus/approval per endring** — aldri full-auto mot kontrollfiler |
| Fase 2 (uthenting/research-logger) | Middels | Auto OK; kun nye filer, aldri endre eksisterende |
| Fase 3 (deck, figurer, plattformkode) | Middels–høyt (høyt for casestatus.ts-innhold) | Auto OK for kode; approval for innholdstekst som siterer tall |
| Fase 4 (DASK/AASK-prep) | Middels | Auto for utkast; **ingen utsending** — det er menneskebeslutning |
| Fase 5 (vedlikehold/datostyrt) | Lavt–middels | Auto OK |

Begrunnelse: feilkostnaden er asymmetrisk. En dårlig formulert logglinje koster ingenting; en feil i claim-lock forplanter seg til deck og eksterne flater. Bruk derfor høyeste resonneringsnivå og manuell godkjenning der endringer treffer kontrollfiler, og spar kvote/tid på rutinearbeid. Hvis bare ett nivå skal velges for hele prosessen: **høyt resonneringsnivå med approval-modus på filendringer** — prosjektets verdi ligger i presisjonen, ikke i hastigheten.

### Kjøreregler (gjelder alle faser)

1. **Mottaksprotokollens rekkefølge er absolutt:** mottaksfil → PCQ/source-shortlist → claim-lock → sprintboard → casestatus.ts. Aldri endre claim-lock direkte uten leddene foran.
2. **Verifikasjon før ferdigmelding:** `npm test` (minimum `tests/lib/casestatus-data.test.ts`), `npm run lint`, `git diff --check`. Ved DB-relevante endringer: `npm run db:audit`. Build skal aldri avhenge av live DB.
3. **Ikke-si-disiplin:** alle nye formuleringer sjekkes mot ikke-si-listene i DRR-ene og casestatus.ts. Nye tall merkes «internt tallgrunnlag … re-trekkes autorisert før ekstern bruk».
4. **Kun nye filer i research/:** uttakslogger og datasett legges til; eksisterende DRR-er og logger endres ikke (korreksjoner skjer i kontrollfilene, med referanse).
5. **Ingen ekstern kontakt:** ingen e-post, skjema eller aktørhenvendelser fra Codex. Utkast lages; Gabriel/JT sender.

---

## Fase 1 — Kontrollert oppdatering (BLOKKERENDE, kjøres først)

Mål: få korreksjonene og de nye kildene fra 12.06-runden inn i kontrollapparatet, slik at ingen flater siterer utdaterte premisser.

| ID | Oppgave | Input | Akseptkriterium |
|---|---|---|---|
| F1-1 | Mottaksfil for spor1-uttakene: registrer uttak-01 til 08 + de to SJA09114-CSV-ene i `food-tg-casekort-og-research-mottak-2026-06-10.md` (eller ny mottaksfil datert 12.06) | `research/external/spor1-uttak-2026-06-12/`, `research/external/dro-0906/sja09114-*.csv` | Hver kilde har rad med locator, status `uvalidert`/`kontrollert uttrekk`, og kobling til DASK/PCQ-ID |
| F1-2 | **Korreksjon 1:** innkjøpsbetingelses-høringen ble lagt bort av regjeringen 03.10.2025. Oppdater PCQ-0906-004/SRC-0906-015, deretter claim-lock, deretter casestatus.ts (`distribusjon-adoption`: keyFigure «Regulatorisk vindu» og den gamle "pågår"-formuleringen) | uttak-06, kap. høring (a) | Ingen fil i docs/ eller src/ påstår at høring (a) pågår; presiseringshøringen (§ 9 a/9 b, «under behandling») er det som omtales som aktivt vindu |
| F1-3 | **Korreksjon 2:** KT overtok god handelsskikk 30.04.2026, ikke den tidligere dag-etter-datoen | uttak-06 | Datoen er konsistent i casestatus.ts, claim-lock og statusdokumenter |
| F1-4 | **Korreksjon 3:** Wiig-tidslinjen (forsinket minst to ganger; «Under Construction» per åpne kilder) og skillet Wiig-pilot (4 MW, Orre/Klepp) vs. Norway 1 (36 MW, Varhaug/Hå). Legg ikke-si-punkt: «juni 2026-godkjenningen gjelder ikke Wiig-piloten» | uttak-03 | casestatus.ts `spillvarme` har oppdatert blocker + nytt notSay-punkt; claim-lock-rad finnes |
| F1-5 | **Korreksjon 4:** merk DRR-0906-003/004 som duplikater (header-notat i mottaksfil, ikke i DRR-filene); intern språkbruk endres fra «åtte rapporter» til «syv unike caserapporter (åtte filer)» | innsiktssyntesen kap. korreksjoner | Mottaksfilen dokumenterer duplikatet; statusdokumenter teller riktig |
| F1-6 | Statusoppgraderinger fra uttakene: (a) 100% Fish: SJA09114-blokkeren lukket → oppdater blockers/nextActions i casestatus.ts; (b) Valio: soyaforbudets scope presisert (gjelder ikke ammekyr/kjøttfe; A-Rehu-nyansen; palmeolje vs. PFAD-skillet) → nye notSay-kandidater; (c) Skottland: SBMT nedprioritert til «ikke blokker» per uttak-05-vurderingen | uttak-01, 04, 05 | casestatus.ts oppdatert; `node --import=tsx --test tests/lib/casestatus-data.test.ts` passerer |
| F1-7 | Source-shortlist: nye rader for SJA09114-uttrekket, SINTEF 2025:00517 (via Nofima 33/2025-sitering, merk uvalidert), Trase 2026, CBI 2026, Valio-kildene V-01–V-08-suppleringer fra uttak-04, KT-/NFD-dokumentene fra uttak-06 | uttak-01–08 | Radene følger eksisterende format med sportag og primær/sekundær-klassifisering |
| F1-8 | Oppdater `CASESTATUS_UPDATED` og kjør full verifikasjon | — | `npm test`, `npm run lint`, `git diff --check` grønt; commit-melding refererer denne planen |

**Kjørenivå fase 1: HØYT resonneringsnivå, approval-modus.** Dette er presisjonsarbeid i kontrollfiler.

---

## Fase 2 — Resterende uthenting (kan startes parallelt etter F1-1)

| ID | Oppgave | Metode | Akseptkriterium |
|---|---|---|---|
| F2-1 | SINTEF-primær-PDF («Analyse marint restråstoff 2024», 2025:00517): hent fulltekst via Nasjonalt Vitenarkiv/FHF-prosjektbase, verifiser detaljtallene i uttak-02 mot side-/tabellnummer | Nettleser/manuelt hvis maskinell henting feiler (CRAWL_NOT_FOUND dokumentert) | Tallene i uttak-02 har side-locator eller er korrigert; avvik logges |
| F2-2 | SJA09110 + SJA04903: samme POST-metode som uttak-01 (oppskrift og API-mønster står i uttaksloggen) | PxWeb API v1 POST | CSV-er i `research/external/dro-0906/` + kort loggnotat |
| F2-3 | Eurostat Comext-uttrekk: NL/BE/DE → Norden for HS 1801–1806 (kvantifiserer EU-omveien for kakao) | Comext API/bulk | Tabell med år, strøm, volum, verdi + locator; kobles til uttak-07 |
| F2-4 | Finland HS 1201 (soyabønner) for full symmetri i fig3 | Comtrade preview-GET (mønster i uttak-08) | Tall + oppdatert fig3 uten «ikke trukket»-boksen |
| F2-5 | Norsk 1201-splitt (fiskefôr/husdyrfôr/mat): Landbruksdirektoratets kraftfôrstatistikk + Denofa-årsrapport, desk-only | WebSearch/fetch | Logg med dokumenterbar splitt eller eksplisitt «finnes ikke offentlig» → blir PCQ-rad |
| F2-6 | Strand et al. 2024 (Resources, Environment and Sustainability 16:100157): hent og les — metodebroen Norge–Island for restråstoffsammenligning | DOI-oppslag | Notat om hvorvidt artikkelen muliggjør metodisk forsvarlig NO–IS-sammenligning; inn i mottaksfil |
| F2-7 | Arkivering: Enova-prosjektsiden (Wiig) og cocoalife.org-siden lagres som PDF/skjermkopi med dato (klientrendrede sider — krever nettleser) | Manuelt/nettleser | Filer i research/external/ med dato i filnavn |
| F2-8 | Innsynskrav Klepp: Gabriel sender teksten fra uttak-03 seksjon 3 via kommunens innsynsløsning; Codex logger svar når det kommer | **Menneskeoppgave** (Gabriel) | Svar logget i operatorloggen + uttak-03 oppdatert via mottaksfil |

**Kjørenivå fase 2: MIDDELS.** Kun nye filer; ingen kontrollfil-endringer uten å gå via fase 1-løypa.

---

## Fase 3 — Innsiktsprodukter (hovedleveransen mot uke 25/partnere)

| ID | Oppgave | Input | Akseptkriterium |
|---|---|---|---|
| F3-1 | **Deck v0.2:** restrukturer `jt-deck-v0.1` rundt de fem partnerflatene fra innsiktssyntesen (verdimiks, proteinsymmetri, koblingsmegler, EUDR-treffkart, governance-tesen) og monter fig1–fig5. Behold beslutningssakene som egen seksjon — men la innsikt komme før prosess | innsiktssyntesen, figures/, deck v0.1 | Nytt manus-md + oppdatert pptx; hver tallslide har kildelinje og caveat fra figur-README; ikke-si-sjekk kjørt |
| F3-2 | **/casestatus-utvidelse:** legg figurene inn på caseflaten (statisk SVG-visning per relevant case) + «Innsikter på tvers»-seksjon som speiler de seks mønstrene (kort, med lenke til syntesen) | fig1–5, syntesen | Side bygger (`npm run build`), test passerer, figurene vises for kaffe-, valio-, fish- og skottland-ankrene |
| F3-3 | **EUDR-treffkart (ny flate eller dokument):** samlet fremstilling av frister (30.12.2026/30.06.2027), risikoklassifisering (Brasil/CI standard risk), DDS-pliktens plassering, og norsk EØS-særtilfelle for kakaobønner | DRR-001/002, uttak-07 | Ett dokument/flate som de tre berørte casene kan lenke til i stedet for å gjenta hverandre |
| F3-4 | Koblingsmegler-notat: 2-siders konseptnotat om «varme uten mottaker / løsning uten kanal»-funnet og mulig partnerrolle (basert på Mønster 4) — internt utkast til JT-samtalen | syntesen, DRR-005/006 | Notat i docs/project/mandates/ med eksplisitt hypotese-merking |
| F3-5 | Verdimiks-trekanten som hovedfigur: kombiner fig4+fig5+SINTEF-tallene i én sammensatt figur («Norden har løst utnyttelse — ikke verdi») for deck-forsiden | fig4, fig5, uttak-02 | Ny fig6 med samme stil og kildelinjer |

**Kjørenivå fase 3: MIDDELS for kode/figurer, HØYT for tekst som siterer tall** (deck-manus, casestatus-tekster). Approval på F3-1-manus før pptx genereres.

---

## Fase 4 — DASK/AASK-forberedelse (venter på JT-vedtak; prep nå)

| ID | Oppgave | Akseptkriterium |
|---|---|---|
| F4-1 | Oppdater DASK-pakken med L1-status fra spor1-uttakene (flere spørsmål er nå overflødige eller kan spisses — f.eks. trenger Valio-asken kun fôrkurv + PFAD/Startti; Skottland-asken kan droppe ZWS-fulltekst) | Revidert DASK-tabell der ingen dokumenteier spørres om noe som er offentlig avklart |
| F4-2 | Ferdigstill utsendingsklare e-postutkast per DASK-rad (copy-ready-malen finnes i pakken) med riktig mottaker og presist scope | Utkast i sendepakken; merket «sendes ikke før vedtak» |
| F4-3 | AASK-prioritering: foreslå rekkefølge basert på innsiktssyntesen (1. Hima driftsdata — styrker sterkeste case; 2. Valio fôrkurv; 3. SINTEF/FHF høyverdi-fraksjoner) | Prioriteringsnotat klart til JT-møtet |

**Kjørenivå fase 4: MIDDELS. Ingen utsending — kun utkast.**

---

## Fase 5 — Datostyrt oppfølging (legges i operatorloggen)

| Dato | Oppgave |
|---|---|
| 25.06.2026 | Varde §25: høringsfrist — hent utfall, ev. navngitt drivhusoperatør (DR-9-oppfølging, uke 27) |
| Løpende (uke 25–26) | Presiseringshøringen god handelsskikk: følg status «under behandling» → vedtak |
| Ved svar | Klepp-innsyn (F2-8): logg + oppdater spillvarme-caset |
| Q3 2026 | Sjekk om SINTEF/FHF publiserer 2025-årgangen av restråstoffanalysen |
| Høst 2026 | EUDR-anvendelse 30.12.2026 nærmer seg: EUDR-treffkartet (F3-3) holdes oppdatert mot EU-kilder |
| Ved kapasitet | Polen full kill-test (GUS XLS, EMFAF-prosjektbase, MIR Gdynia) — bevisst lavest prioritet |

**Kjørenivå fase 5: LAVT–MIDDELS.**

---

## Avhengighetskart (kortform)

F1 (korreksjoner) → F3-1/F3-2 (deck/plattform må bygge på korrigert grunnlag). F2-3/F2-4 → forbedrer fig2/fig3 men blokkerer ikke F3. F4 → venter på JT-vedtak (uke 25-møtet). F2-8 og all aktørkontakt → menneske, aldri agent.

## Suksesskriterier for planen som helhet

1. Ingen flate i prosjektet siterer de fire korrigerte premissene feil. Dette etterprøves med grep etter den gamle KT-datoen, den gamle "pågår"-formuleringen for innkjøpsbetingelser og gammel åtte-notater-språkbruk; historiske periodefelt i gamle planer behandles som eksplisitt unntak.
2. Deck v0.2 leder med innsikt (de fem partnerflatene), ikke med prosessusikkerhet — det var hovedkritikken mot 12.06-statusrapporten.
3. Alle nye tall i deck/plattform kan spores: figur → uttakslogg → locator → kilde.
4. JT-møtet i uke 25 kan ta de fire beslutningene med oppdatert grunnlag, og DASK-utsendingen kan skje samme dag som vedtaket.
