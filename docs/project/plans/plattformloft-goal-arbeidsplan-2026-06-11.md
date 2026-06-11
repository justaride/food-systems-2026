---
tittel: Plattformløft - goal-arbeidsplan 2026-06-11
status: Klar for Codex
eier: Gabriel
dato: 2026-06-11
basert_paa: docs/project/analysis/plattform-dybdeanalyse-2026-06-11.md
scope: 17 goals over 5 faser som tar plattformen fra "hummer og kanari" til sporbar, datert og forklart - datadekning, proveniens og informasjonsarkitektur.
---

# Plattformløft — goal-arbeidsplan for Codex

Hver goal er en avgrenset arbeidspakke som kan tas av én agent i én økt. Funn-referansene (A1–C5) peker til analysen i `docs/project/analysis/plattform-dybdeanalyse-2026-06-11.md`.

## Goal-prosessen

1. Ta laveste åpne goal-nummer i aktiv fase (eller den Gabriel peker på). Sett status `i-arbeid` i statustabellen nederst, med dato.
2. Opprett branch `codex/goal-<nr>-<kort-slug>`, f.eks. `codex/goal-01-konsern-aar`.
3. Les goalens nøkkelfiler og bakgrunnsreferansen før første endring. Hold deg innenfor «Scope»; alt under «Ikke i scope» krever ny goal.
4. Kjør verifiseringen som står i goalen. Minimum alltid: `npm run lint && npm test && npm run build`. Goals som berører data/import: legg til `npm run db:audit` (og `npm run db:audit:strict-sources` ved kildefelter). Graf-berørende: `npm run graph:audit`. Rene dokumentendringer: `git diff --check`.
5. Én PR per goal. PR-beskrivelsen skal liste akseptkriteriene med avkrysning.
6. Etter merge: sett status `ferdig` + PR-nummer i statustabellen. Oppdag du følgearbeid: skriv det som forslag til ny goal nederst, ikke utvid scope.

**Stoppregler (gjelder alle goals):**
- Ingen endring av claim-tekst, KPI-verdier eller eksternt synlig faktaspråk uten rute gjennom `docs/project/mandates/food-tg-claim-lock-table-2026-05.md`. Goals som flagger tall, *merker og kilder* dem — de endrer dem ikke uten lock-oppslag.
- Ingen sletting av data, sider eller filer uten eksplisitt akseptkriterium som sier det.
- DB-skriving kun via importskript-mønsteret (idempotente upserts); aldri ad hoc-editering.
- Stopp og spør hvis et akseptkriterium ikke kan nås innenfor scope.

**Avhengigheter:** Fase 0 skal være ferdig før fase 2-resultater rapporteres som dekningstall (ellers måler vi med kjent feil målestokk). Innenfor hver fase er goals parallelliserbare med mindre «Avhenger av» sier noe annet. Størrelse: S < ½ dag, M = ½–2 dager, L > 2 dager.

---

## Fase 0 — Måling og sannhetsgrunnlag

### G-01 Fiks årslogikken i konsern-dekningsrevisjonen
**Funn:** A3. **Størrelse:** S–M. **Avhenger av:** –
**Mål:** `audit-konsern-coverage.ts` skal måle dekning mot *nyeste tilgjengelige regnskapsår per selskap*, ikke hardkodet `currentYear - 1`.
**Scope:** Endre `latestYear`-logikken til å finne max(`year`) i `CompanyFinancial` per konsern (eller globalt), rapportere hvilket år som er målt (`measuredYear` i output), og skille gap-typene «mangler regnskap helt» vs «har eldre regnskap enn målt år». Regenerer `data/konsern-coverage.json`. Oppdater tester.
**Ikke i scope:** Innhenting av 2025-tall (G-08/G-09); endring av kvalitetsscore-vektingen.
**Nøkkelfiler:** `scripts/audit-konsern-coverage.ts`, `data/konsern-coverage.json`, tilhørende test i `tests/`.
**Akseptkriterier:**
- [ ] Konsern med komplette 2024-tall får 0 «uten siste års regnskap»-gaps så lenge 2024 er nyeste tilgjengelige år i DB.
- [ ] Output-JSON inneholder eksplisitt målt år, og gap-tekster nevner årstallet.
- [ ] Test dekker årsvalg-logikken (inkl. tomt finansgrunnlag).
**Verifisering:** `npm run lint && npm test && npm run audit:konsern && npm run build`

### G-02 Avstem prod-DB mot importkorpuset og samle importkjeden
**Funn:** A2. **Størrelse:** L. **Avhenger av:** – (kjøres med DB-tilgang)
**Mål:** Vite nøyaktig hvilke av korpusets 270 org.nr. som finnes i DB, hvorfor differansen mot 185 oppstår, og gjøre kjørerekkefølgen reproduserbar.
**Scope:** (1) Skriv `scripts/reconcile-import-corpus.ts` som leser alle `import-*.ts`-skriptenes org.nr. statisk, sammenligner mot `Company`-tabellen og skriver rapport (per skript: definert/funnet/mangler) til `data/import-reconciliation.json` + konsollsammendrag. (2) Avgjør og dokumentér hvilke skript som inngår i full lasting; legg konserntre-, HORECA- og aprilrunde-importene inn i en samlet `db:import:full`-kjede (eller dokumentert kjørerekkefølge i `.claude/data-imports.md`). (3) Kjør avstemmingen, last manglende godkjente skript, regenerer konsern-coverage og verifiser at `treeSize` per konsern matcher skriptenes selskapsantal (±bevisste avvik, dokumentert).
**Ikke i scope:** Nye selskaper eller nye datafelter; endring av enkeltskripts innhold utover det som trengs for idempotent kjøring.
**Nøkkelfiler:** `package.json`, `scripts/import-*.ts`, `scripts/audit-konsern-coverage.ts`, `.claude/data-imports.md`, `data/konsern-coverage.json`.
**Akseptkriterier:**
- [ ] `data/import-reconciliation.json` finnes og viser 0 uforklarte mangler (hver differanse er enten lastet eller eksplisitt unntatt med begrunnelse).
- [ ] Én kommando (`npm run db:import:full` el.l.) kjører hele godkjente kjeden idempotent.
- [ ] `treeSize` i konsern-coverage stemmer med forventning per konsern (forventningstabell sjekket inn).
- [ ] `.claude/data-imports.md` beskriver den nye kjeden.
**Verifisering:** `npm run db:audit && npm run db:audit:strict-sources && npm run audit:konsern && npm test && npm run build`

### G-03 Intern datastatus-side med feltdekning per flate
**Funn:** A1, A4. **Størrelse:** M–L. **Avhenger av:** G-01 (riktig årslogikk), helst G-02
**Mål:** Én intern side, `/datastatus`, som viser det `api/data-status` vet — pluss feltdekning: per hovedflate, andel rader med utfylte nøkkelfelter.
**Scope:** Utvid data-status-API-et (eller nytt query-modul) med dekningstall: selskaper med/uten siste-års-regnskap, ansatte, kontrollerende eier; havbrukslokaliteter med/uten kapasitet; eiendommer med/uten sqm/år; produsent-totaler; artefaktenes `generatedAt`. Render som intern side (med `InternalBanner`) under INTERN-gruppen i nav. Dekningstallene er grunnfjellet som fase 2-goals måles mot.
**Ikke i scope:** Fylle hullene; offentlig eksponering.
**Nøkkelfiler:** `src/app/api/data-status/route.ts`, ny `src/app/datastatus/page.tsx`, `src/lib/queries/`, `src/lib/data/nav.ts`.
**Akseptkriterier:**
- [ ] `/datastatus` viser radtall + feltdekning (antall og %) for minst: selskap/finans, havbruk/kapasitet, eiendom/sqm, produsenter, samt `generatedAt` for konsern-coverage, chart-metrics og value-chain.
- [ ] Tomme tabeller (communications, fishHealth, landbruksregister) flagges eksplisitt med fallback-konsekvens.
- [ ] Siden er merket intern og ligger i nav.
**Verifisering:** `npm run lint && npm test && npm run build` + manuell sjekk av siden i dev

---

## Fase 1 — Kontekststillas på alle flater

### G-04 Felles proveniens-komponent: kilde + dato på hver side
**Funn:** B5, C1; gjenbruker intensjonen i `docs/superpowers/plans/2026-05-29-datakvalitet-merking.md`. **Størrelse:** L. **Avhenger av:** G-03 (henter datering derfra)
**Mål:** Hver av de 33 flatene viser nederst (eller i header) en standardisert proveniens-linje: datakilder (DB-tabeller / artefakt / manuell fil), nyeste relevante oppdateringstidspunkt, og lenke til `/datastatus`.
**Scope:** Lag `DataProvenance`-komponent (props: kilder[], datert[], merknad). Koble på alle sider i `src/app/*/page.tsx`. For DB-kilder: bruk max(`updatedAt`) fra relevante tabeller (via lett query eller data-status-API). For artefakter: `generatedAt`. For manuelle filer (policy-JSON, food-tg-mandate.ts): vis «manuelt vedlikeholdt, sist endret <git/fil-dato>».
**Ikke i scope:** Per-rad-kvalitetsmerker (G-05); endring av sidenes øvrige innhold.
**Nøkkelfiler:** ny `src/components/layout/DataProvenance.tsx`, alle `src/app/*/page.tsx`, `src/lib/queries/data-status.ts` (el.l.).
**Akseptkriterier:**
- [ ] Alle ruter i nav viser proveniens-linjen; ingen sier bare «database» uten tabellnavn-gruppe.
- [ ] Fallback-flatene (`/`, `/moter`, `/kommunikasjon`, `/sok`) viser eksplisitt når fallback-innhold er aktivt (rød/oransje merknad) — dette lukker B4.
- [ ] Snapshot-/render-test på komponenten.
**Verifisering:** `npm run lint && npm test && npm run build`

### G-05 Standardisert manglende-data-semantikk og dekningsfotnoter
**Funn:** A1, A4, C1. **Størrelse:** M–L. **Avhenger av:** G-04 (komponentmønster)
**Mål:** En leser skal aldri se en tom celle uten å vite hvorfor.
**Scope:** (1) Felles `MissingValue`-rendering: «—» med tooltip «Ikke innhentet» vs «0» som ekte verdi; tas i bruk på `/selskap`, `/eiendommer`, `/havbruk`, `/produsenter`, `/okonomi`. (2) Aggregater og sorteringer: summer/snitt får fotnote «basert på X av Y selskaper med data»; sortering på omsetning legger rader uten data sist (ikke blandet inn som 0). (3) `/selskap` får dekningskolonne eller -merke per rad (f.eks. «finans ✓ / styre ✓ / eierskap –»).
**Ikke i scope:** Nye datafelter; CoverageBadge-fullversjonen (G-17).
**Nøkkelfiler:** `src/app/selskap/`, `src/app/eiendommer/`, `src/app/havbruk/`, `src/app/okonomi/`, `src/components/` (ny felleskomponent), `src/lib/queries/companies.ts`.
**Akseptkriterier:**
- [ ] Ingen tomme celler i de fem listeflatene; alle null-verdier rendres med standardmerket.
- [ ] Alle aggregat-visninger på `/okonomi` og `/selskap`-statistikk har dekningsfotnote.
- [ ] Omsetningssortering verifisert: null-rader sist.
**Verifisering:** `npm run lint && npm test && npm run build`

### G-06 Kildede KPI-kort og én sannhet for selvforsyningsgraden
**Funn:** B1, B2. **Størrelse:** M. **Avhenger av:** –
**Mål:** Hvert tall på forsiden og i sammenlignings-narrativet har kilde, år og lenke; selvforsyningsgraden finnes i én definert variant (+ mål).
**Scope:** (1) Flytt `FOOD_SYSTEM_KPIS` ut av `page.tsx` til datafil med felter {verdi, kilde, kildeår, lenke (insight/SourceDoc), sistVerifisert}; render kildelinje på kortene. (2) Erstatt hardkodet selvforsyning «44 %» og kartmodellens «45 %» med referanse til den claim-låste NIBIO-varianten (41,3 % / 34,9 % forkorrigert) eller dokumentér eksplisitt hvorfor en annen serie brukes (SSB-serien?) — valget gjøres via claim-lock-tabellen, ikke av agenten alene. (3) `/sammenligning`: HHI-verdier, kornreserve og DK-nivå skal renderes fra datastrukturen (med kilde), ikke ligge i fritekst.
**Ikke i scope:** Nye KPI-er; endring av hva som måles.
**Nøkkelfiler:** `src/app/page.tsx`, ny `src/lib/data/forside-kpis.ts`, `src/app/sammenligning/SammenligningContent.tsx`, `src/lib/config/countries/no.ts`, `src/lib/data/insights.ts`.
**Akseptkriterier:**
- [ ] Ingen kvantitativ påstand på `/` eller i `/sammenligning`-narrativet uten kilde+år i UI.
- [ ] Grep etter «44 %»/«45 %» selvforsyning gir 0 treff utenfor den valgte definisjonsfilen.
- [ ] Claim-lock-oppslag dokumentert i PR for selvforsyningsvalget.
**Verifisering:** `npm run lint && npm test && npm run build && git diff --check`

### G-07 Kolonnedefinisjoner på alle listesider
**Funn:** C1; gjenbruker ordliste-arbeidet (p1b, PR #123). **Størrelse:** M. **Avhenger av:** –
**Mål:** Hver tabellkolonne og hvert statusmerke på listeflatene kan forklares uten å forlate siden.
**Scope:** Utvid `terms.ts`/`Glossary`-mønsteret med kolonnetermer (verdikjedetrinn, eierskapstype, NACE, konsesjonsstatus, claim-statuser); legg forklarings-affordance (info-ikon/tooltip + ordliste-seksjon) på `/selskap`, `/aktorer`, `/havbruk`, `/eiendommer`, `/kilder`, `/produsenter`, `/innsikt`.
**Ikke i scope:** Omdøping av felter; nye filtre.
**Nøkkelfiler:** `src/lib/glossary/terms.ts`, `src/components/ui/Glossary.tsx`, listesidenes komponenter.
**Akseptkriterier:**
- [ ] Alle kolonneoverskrifter på de sju flatene har definisjon tilgjengelig i UI.
- [ ] Definisjonene ligger i den delte term-filen (ingen nye lokale ordlister).
**Verifisering:** `npm run lint && npm test && npm run build`

---

## Fase 2 — Tette datahull

### G-08 Finansdata-backfill for selskaper uten regnskapstall
**Funn:** A1. **Størrelse:** L. **Avhenger av:** G-02 (vite hva som faktisk mangler i DB), G-03 (måle effekt)
**Mål:** Alle selskaper som vises på `/selskap` har enten siste tilgjengelige årsregnskap eller et eksplisitt «ikke regnskapspliktig/utenlandsk»-merke.
**Scope:** (1) Generer prioritert mangelliste fra G-03-dekningen (start: aprilrundens ~66, nordic-deepening 13, session5 8, HORECA 5). (2) Utvid Brreg-integrasjonen (`refresh-brreg-tracked.ts` / `enrich-offentligdata.ts`) eller nytt skript til å hente omsetning/resultat/ansatte fra Regnskapsregisteret API for norske org.nr. og upserte `CompanyFinancial` med `source`-felt. (3) Ikke-norske og ikke-regnskapspliktige enheter merkes i metadata slik at UI (G-05) kan vise riktig grunn.
**Ikke i scope:** Manuell research av enkeltselskaper; estimater.
**Nøkkelfiler:** `scripts/refresh-brreg-tracked.ts`, `scripts/enrich-offentligdata.ts` el. nytt `scripts/backfill-financials-brreg.ts`, `prisma/schema.prisma` (kun ved behov for kildefelt), `.claude/data-imports.md`.
**Akseptkriterier:**
- [ ] Feltdekning «selskap med siste-års-regnskap» på `/datastatus` ≥ 90 % for norske AS/ASA, og 100 % av resten har eksplisitt grunn-merke.
- [ ] Hver ny `CompanyFinancial`-rad har `source` (Regnskapsregisteret + år).
- [ ] Kjøringen er idempotent (re-kjøring endrer ikke tall).
**Verifisering:** `npm run db:audit && npm run db:audit:strict-sources && npm test && npm run build`

### G-09 Årsmerking og 2025-beredskap i finansvisningene
**Funn:** A3, B5. **Størrelse:** S–M. **Avhenger av:** G-01
**Mål:** Alle omsetningstall i UI viser hvilket år de gjelder, og plattformen tåler blandede årganger.
**Scope:** `/selskap`, `/eierskap`, `/okonomi`, selskapsdetalj: vis årstall ved beløpet («12,4 mrd (2024)»); der nyeste år varierer i en tabell, vis per rad. Sjekk at «nyeste år»-valget (`take: 1 orderBy desc`) er konsistent på tvers av query-moduler.
**Ikke i scope:** Innhenting av 2025-tall (kommer via G-08-mekanismen når Brreg har dem).
**Nøkkelfiler:** `src/lib/queries/companies.ts`, `src/lib/queries/okonomi*.ts`, selskaps- og eierskapskomponentene.
**Akseptkriterier:**
- [ ] Ingen beløp uten årstall på de fire flatene.
- [ ] Test: selskap med 2023- og 2024-rader viser 2024 med riktig merking.
**Verifisering:** `npm run lint && npm test && npm run build`

### G-10 Tomme tabeller: fyll, merk eller fjern
**Funn:** A2, B4. **Størrelse:** M. **Avhenger av:** G-02
**Mål:** Ingen flate står på en tom tabell uten å si det.
**Scope:** Beslutningssak per tabell, utført etter Gabriels valg: `communications` (0 rader → enten importer kommunikasjonsloggen eller merk siden «venter på datagrunnlag» i stedet for stille fallback), `fishHealthObservations` (0 → kjør `db:import:fiskehelse` eller fjern fra forventet-listen), `landbruksregisterCompanies` (4 → kjør full import eller dokumentér at den er bevisst smal). Oppdater `pageGates`/data-status-forventninger tilsvarende.
**Ikke i scope:** Ny funksjonalitet på disse flatene.
**Nøkkelfiler:** `src/app/kommunikasjon/`, `scripts/import-fiskehelse.ts`, `scripts/import-landbruksregister.ts`, `src/app/api/data-status/route.ts`.
**Akseptkriterier:**
- [ ] For hver av de tre tabellene: enten >0 rader med dokumentert kjøring, eller UI-merke + statusnotat som forklarer tomheten.
- [ ] Ingen stille fallback uten banner (jf. G-04-kriteriet).
**Verifisering:** `npm run db:audit && npm test && npm run build`

---

## Fase 3 — Informasjonsarkitektur

### G-11 Slå sammen /mandat og /metodikk
**Funn:** C2, B3. **Størrelse:** M. **Avhenger av:** Gabriels godkjenning av retning (foreslått: behold `/mandat` som claim-/status-cockpit, gjør `/metodikk` til ren metode-side uten claim-board)
**Scope:** Flytt claim-board, opportunity-radar og status-teller til kun `/mandat`; `/metodikk` beholder Ten-Step, prompts og modellforklaringene med lenke til mandatet; fiks H1-feilen («Metodikk» på mandatsiden); redirect eller tverrlenker slik at gamle lenker ikke dør.
**Akseptkriterier:**
- [ ] Claim-board vises på nøyaktig én rute; begge sider har korrekt H1 og distinkt ingress som forklarer arbeidsdelingen.
- [ ] Ingen brutte interne lenker (grep etter `/metodikk`- og `/mandat`-lenker).
**Nøkkelfiler:** `src/app/mandat/page.tsx`, `src/app/metodikk/page.tsx`, `src/lib/data/food-tg-mandate.ts`, `src/lib/data/nav.ts`.
**Verifisering:** `npm run lint && npm test && npm run build`

### G-12 Formålsskille: /kilder vs /bibliotek og /verdikjede vs /forsyningskjede
**Funn:** C2. **Størrelse:** S–M. **Avhenger av:** –
**Scope:** Ingress-blokk øverst på alle fire sider som sier hva siden svarer på og lenker til søstersiden («Leter du etter X? Gå til Y»); nav-beskrivelser (tooltip/undertekst) oppdateres tilsvarende. Ingen strukturendring.
**Akseptkriterier:**
- [ ] Alle fire sider åpner med formålsingress + kryss-lenke.
- [ ] Nav viser kort beskrivelse for de fire oppføringene.
**Nøkkelfiler:** de fire `page.tsx`, `src/lib/data/nav.ts`.
**Verifisering:** `npm run lint && npm run build`

### G-13 Forside: modeller i kontekst og KPI-kort som kildekort
**Funn:** C3, B1. **Størrelse:** M. **Avhenger av:** G-06
**Scope:** Forsiden får en «Slik henger systemet sammen»-seksjon som plasserer én forklaringsmodell (f.eks. årsaksløkke-miniatyr eller verdikjede-skjema) med én setnings forklaring og lenke til full modell; KPI-kortene bruker G-06-strukturen; «Siste innsikt» får datostempel. Maks én skjerm ekstra — forsiden skal ikke bli lengre, så flytt heller enn å legge til.
**Akseptkriterier:**
- [ ] Minst én systemmodell synlig på forsiden med forklaring og lenke.
- [ ] Alle forside-tall datert og kildet; innsiktskort viser dato.
**Nøkkelfiler:** `src/app/page.tsx`, relevante komponenter i `src/components/charts/`.
**Verifisering:** `npm run lint && npm test && npm run build`

### G-14 Listesider: segmentering og synlig utvalg
**Funn:** C1, A4. **Størrelse:** M–L. **Avhenger av:** G-05
**Scope:** `/selskap`: gruppér eller fasetter listen på verdikjedetrinn med antall per gruppe (beholder filter); vis totalutvalget og hva «kartlagt» betyr (lenke til metodikk). `/produsenter`: synlig paginering + totaltall. `/aktorer`: vis sist-vurdert-dato per aktør hvis feltet finnes, ellers gruppenivå-datering. `/kilder`: seksjonér på runde/type med ankerlenker i toppen.
**Akseptkriterier:**
- [ ] `/selskap` viser gruppestruktur med antall; `/produsenter` viser N av M med fungerende paginering; `/kilder` har innholdsfortegnelse-anker.
- [ ] Ingen regresjon i filter/søk (test).
**Nøkkelfiler:** `src/app/selskap/`, `src/app/produsenter/`, `src/app/aktorer/`, `src/app/kilder/`.
**Verifisering:** `npm run lint && npm test && npm run build`

### G-15 Brødsmuler og relatert-lenker på detaljruter
**Funn:** C4. **Størrelse:** S–M. **Avhenger av:** –
**Scope:** Felles `Breadcrumbs`-komponent på de 12 detaljrutene (selskap/[id], aktorer/[slug], eierskap/[slug], personer/[personKey], bibliotek/[...slug], kart/[country](/flow), hvitbok/[chapter], hvitbok/proveniens, rapporter/[slug], metodikk/prompts) + «Relatert»-blokk der relasjonsdata finnes (selskap ↔ eierskapstre ↔ personer).
**Akseptkriterier:**
- [ ] Alle detaljruter viser sti tilbake til listesiden sin.
- [ ] Selskapsdetalj lenker til eierskapstre og omvendt der treet finnes.
**Nøkkelfiler:** ny `src/components/layout/Breadcrumbs.tsx`, detaljrutenes `page.tsx`.
**Verifisering:** `npm run lint && npm test && npm run build`

---

## Fase 4 — Strukturell forankring

### G-16 Claim-board og opportunity-radar ut av statisk fil
**Funn:** B3. **Størrelse:** L. **Avhenger av:** G-11
**Mål:** Claim-/radar-status har samme sporbarhet som resten av kunnskapsbasen: rader i DB med dato, kilde og historikk.
**Scope:** Prisma-modell (f.eks. `ClaimBoardEntry`, `OpportunityEntry`) + importskript som leser dagens `food-tg-mandate.ts` som seed; `/mandat` rendrer fra DB med `updatedAt` synlig per rad; den statiske filen beholdes kun som fallback (merket, jf. G-04). Statusendringer skjer deretter via importskript/ledger — ikke kodeendring.
**Ikke i scope:** Endring av claim-innhold eller statuser (claim-lock styrer det).
**Nøkkelfiler:** `prisma/schema.prisma`, nytt `scripts/import-food-tg-board.ts`, `src/lib/data/food-tg-mandate.ts`, `src/app/mandat/`, `.claude/database.md`, `.claude/data-imports.md`.
**Akseptkriterier:**
- [ ] Claim-board i UI viser per-rad oppdateringsdato fra DB.
- [ ] Import er idempotent; `db:audit` kjenner de nye tabellene.
- [ ] Dokumentasjonsfilene oppdatert.
**Verifisering:** `npm run db:audit && npm run db:audit:strict-sources && npm test && npm run build`

### G-17 Gjennomfør CoverageBadge-systemet
**Funn:** C1/A-klassen samlet; eksisterende plan `docs/superpowers/plans/2026-05-29-datakvalitet-merking.md`. **Størrelse:** L. **Avhenger av:** G-03, G-04, G-05
**Mål:** Datakvalitet-merkingen fra 29.05-planen (CoverageProfile per datasett: temporal/geografisk/verifikasjonsdekning + badge i UI) realiseres som systemløsning, slik at fase 1-stillaset får et beregnet grunnlag i stedet for håndsatte merknader.
**Scope:** Følg eksisterende plan; avvik fra den dokumenteres i planfilen. Start med datasettene som nå har proveniens-linje (G-04) og dekningstall (G-03).
**Akseptkriterier:** Som definert i 29.05-planen + badge synlig på minst `/selskap`, `/kart`, `/sammenligning` og `/kilder`.
**Verifisering:** `npm run lint && npm test && npm run build && npm run db:audit`

---

## Statustabell

| Goal | Tittel | Fase | Størrelse | Status | PR | Dato |
|---|---|---|---|---|---|---|
| G-01 | Årslogikk i konsern-coverage | 0 | S–M | åpen | – | – |
| G-02 | Avstem prod mot importkorpus | 0 | L | åpen | – | – |
| G-03 | /datastatus med feltdekning | 0 | M–L | åpen | – | – |
| G-04 | Proveniens-komponent alle flater | 1 | L | åpen | – | – |
| G-05 | Manglende-data-semantikk | 1 | M–L | åpen | – | – |
| G-06 | Kildede KPI-er + selvforsyning | 1 | M | åpen | – | – |
| G-07 | Kolonnedefinisjoner | 1 | M | åpen | – | – |
| G-08 | Finansdata-backfill (Brreg) | 2 | L | åpen | – | – |
| G-09 | Årsmerking i finansvisninger | 2 | S–M | åpen | – | – |
| G-10 | Tomme tabeller: fyll/merk/fjern | 2 | M | åpen | – | – |
| G-11 | Slå sammen mandat/metodikk | 3 | M | åpen (krever Gabriel-vedtak) | – | – |
| G-12 | Formålsskille søstersider | 3 | S–M | åpen | – | – |
| G-13 | Forside: modeller + kildekort | 3 | M | åpen | – | – |
| G-14 | Listesider: segmentering | 3 | M–L | åpen | – | – |
| G-15 | Brødsmuler på detaljruter | 3 | S–M | åpen | – | – |
| G-16 | Claim-board til DB | 4 | L | åpen | – | – |
| G-17 | CoverageBadge-systemet | 4 | L | åpen | – | – |

**Forslag til nye goals (skrives av agenter underveis, vedtas av Gabriel):**
- (ingen ennå)
