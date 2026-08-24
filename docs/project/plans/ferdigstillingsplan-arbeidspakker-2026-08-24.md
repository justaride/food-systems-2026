---
tittel: Ferdigstillingsplan for arbeidspakkene — anbefalte valg og arbeidsmengde 2026-08-24
status: Forslag — venter på eiers valg
eier: Gabriel
dato: 2026-08-24
scope: Hva som faktisk gjenstår i AP-1…AP-8 etter opprydningen 2026-08-24, hva jeg anbefaler, og hva hver bit koster i arbeid. Ingen analyse i seg selv.
bruksregel: Internt planleggingsdokument. Estimatene er anslag, ikke forpliktelser — grunnlaget står i §6.
relaterte_filer:
  - docs/project/plans/food-tg-dybdeanalyse-arbeidsplan-2026-06-14.md
  - docs/project/analysis/food-tg-ap4-ap8-partial-funn-2026-06-14.md
  - docs/project/analysis/food-tg-ap1-dekningsutvidelse-funn-2026-06-14.md
  - .github/workflows/prod-data-import.yml
---

# Ferdigstillingsplan — arbeidspakkene

## 1. Hvor vi står

Alt som kan lukkes fra åpne kilder, er lukket. AP-3 er avstemt for fire år, AP-7 er
reprodusert og revidert, AP-5s BAMA-split er hentet fra selskapets årsrapport, AP-6 er
gate-dekket, og siterbarhetsnivået utledes nå fra acceptance-gaten framfor å gjentas.

Det som gjenstår deler seg i tre, og de har helt ulik karakter:

| Kategori | Innhold | Kan lukkes? |
|---|---|---|
| Krever leseadgang til prod | AP-4 verdifangst | Ja, men infrastruktur mangler |
| Krever skriving til prod | AP-1 dekningsutvidelse | Ja, men er en eierbeslutning |
| Ikke løsbart fra åpne kilder | Fôr-produsentandeler, foodservice-lederandel, restråstoff per selskap | **Nei** — bør lukkes som «ikke tilgjengelig», ikke stå som åpent arbeid |

## 2. Beslutningen som låser opp resten

AP-4 trenger å **lese** produksjonsdatabasen. Dataene finnes allerede der
(`deliveryVolumes` = 60 310; `CompanyFinancial` finnes i schemaet). Det som mangler er en
vei til å kjøre en analyse mot prod og få resultatet ut.

`prod-data-import.yml` løser det ikke: alle targets skriver, og `verify-only` kjører
telleverifisering, ikke vilkårlig analyse. Det finnes to veier:

| | A: Read-only workflow-target | B: Lokal `DATABASE_URL` via CF Access |
|---|---|---|
| Sikkerhet | Read-only ved konstruksjon; allowlist av skript | Full tilgang fra laptop; skriving mulig ved uhell |
| Sporbarhet | Kjøring logget, JSON som artefakt | Ingen spor utenfor maskinen |
| Hemmeligheter | Blir i GitHub Actions | Prod-credentials lokalt |
| Gjenbruk | Enhver senere DB-analyse kan bruke den | Per-maskin oppsett |
| Risiko | CF Access-service-token-veien var ødelagt én gang før (løst i PR #134) — sett av tid til feilsøking | Samme tunnelrisiko, pluss menneskelig |

**Anbefaling: A.** Den er read-only ved konstruksjon, den etterlater et spor, den legger
ikke prod-credentials på en laptop, og den er gjenbrukbar for alt senere DB-arbeid. B er
raskere første gang og dyrere hver gang etterpå.

## 3. Oppgaver, anbefaling og estimat

### O1 — Bekreft finansdekningen i prod *(anbefalt: gjør denne først)*

Legg `companyFinancials` og dekningsgrad (hvor mange av 361 selskaper har regnskapsrad)
til `/api/data-status`. Det er en liten, deploybar endring som svarer på om AP-4 i det hele
tatt er verdt å bygge — uten noen ny infrastruktur.

`plattform-dybdeanalyse-2026-06-11.md` anslo ~50 % finansdekning. Er det fortsatt riktig,
er AP-4s hovedpåstand uansett begrenset til halve korpuset og systematisk skjev mot store
konsern. **Det bør vi vite før vi bygger, ikke etter.**

**Estimat: ~0,5 time.** Lav risiko.

### O2 — Read-only analyse-target

Ny workflow (eller target) som kobler til prod via CF Access, kjører ett navngitt skript fra
en allowlist, og laster opp JSON-resultatet som artefakt. Allowlisten skal bare inneholde
`analyze-*`-skript — ingen `import-*`.

**Estimat: 2–4 timer.** Spennet er tunnel-feilsøking; selve workflowen er enkel.

### O3 — `scripts/analyze-value-capture.ts` + enhetstester

Metoden er allerede spesifisert i AP-4-notatet §«Kjerne = needs-data»: normaliser volum til
tonn per vare, left-join til regnskap, flagg `hasFinancial`, Spearman volum↔margin, aggreger
til kjedeledd. Samme form som `analyze-subsidy-concentration.ts` — eksporterte, testbare
funksjoner, ingen logging ved import.

**Estimat: 4–6 timer.** Sammenlignbart med `analyze-price-asymmetry.ts` i dag, men enklere
statistikk og mer datavask.

### O4 — AP-4 funnnotat, surfacing og claim-gate

Funnnotat med dekningsforbehold, oppdatert `ins-ap4-001` i `dybdeanalyse.ts`, figur hvis
funnet bærer en, og acceptance-test i `citable-acceptance.ts` **hvis** det når
`citable_with_note`. Husk at badgen utledes fra gaten — legges det inn en test, må
`readinessWhenUngated` fjernes samtidig.

**Estimat: 2–3 timer.**

> **AP-4 samlet: 7–13,5 timer ≈ 1,5–2 fokuserte økter.**

### O5 — AP-1 dekningsutvidelse *(anbefalt: egen økt, egen beslutning)*

`scripts/extend-board-coverage-brreg.ts` finnes, men **skriver BoardMember-rader til prod**.
Det er en prod-mutasjon. Rekkefølge: dry-run mot snapshot → gjennomgang av diff → egen
write-target → kjøring → re-kjør `analyze-board-interlocks` → oppdater AP-1-notat og status.

Gevinsten er reell: styredekning 36 % → ~47 %, som er forutsetningen for å løfte AP-1 fra
`internal_context`. Men det er den eneste gjenstående oppgaven som endrer levende data.

**Estimat: 3–5 timer** pluss beslutningen. **Anbefaling: ikke slå sammen med AP-4.**

### O6 — Lukk det som ikke er løsbart *(anbefalt: billigste tiltak på lista)*

Tre punkter står som åpne, men publiseres ikke av noen: presise fôr-produsentandeler,
foodservice-lederandel (omstridt 36 % vs 70–75 %), og restråstoff-tonnasje per selskap
(SINTEF avstår eksplisitt). De bør omklassifiseres fra «åpent» til «lukket — ikke
tilgjengelig fra åpne kilder», med begrunnelse.

Dette er ikke pynt. Tre ganger i dag har noen — inkludert meg — brukt tid på punkter som så
ut som uferdig arbeid, men var lukket eller ulukkbare. Skillet mellom «ikke gjort ennå» og
«kan ikke gjøres» er det som stopper den runden.

**Estimat: ~1 time.** Bare dokumentasjon.

## 4. Anbefalt rekkefølge

1. **O1** (0,5 t) — avgjør om AP-4 er verdt å bygge
2. **O6** (1 t) — billig, og stopper at lista forvirrer igjen
3. **O2** (2–4 t) — låser opp AP-4 og alt senere DB-arbeid
4. **O3** (4–6 t) — analysen
5. **O4** (2–3 t) — funn, surfacing, gate
6. **O5** (3–5 t) — egen økt, etter egen beslutning

**Til ferdig AP-4: 7,5–14,5 timer. Med AP-1 i tillegg: 10,5–19,5 timer.** Altså to til tre
fokuserte økter for å lukke alt som *kan* lukkes.

## 5. Hva jeg anbefaler å ikke gjøre

- **Ikke kjør `prod-data-import.yml` for å «få DB-tilgang».** Alle targets skriver, og ingen
  kjører analysen. `full` timer dessuten ut på `db:import:landbruksregister`.
- **Ikke bygg AP-4 før O1.** Er finansdekningen fortsatt ~50 %, er hovedpåstanden begrenset
  uansett hvor godt skriptet er — og det bør stå i funnnotatet fra start.
- **Ikke løft AP-4 til `citable_with_note` bare fordi tallet finnes.** ~50 % dekning skjevt
  mot store konsern er en reell begrensning, ikke en fotnote.
- **Ikke jag de tre ulukkbare punktene.** De er ikke arbeid som venter.

## 6. Hva estimatene bygger på

Anslagene er kalibrert mot arbeid gjort i dag, ikke mot magefølelse:

- `scripts/analyze-price-asymmetry.ts` — ~600 linjer, 21 enhetstester, fire eksterne
  datakilder, egen xlsx-/zip-leser og økonometrisk spesifikasjon, inkludert feilsøking av en
  SDMX-streng-som-tall-felle: én stor del av en økt. O3 er sammenlignbart, men med enklere
  statistikk.
- Gate-utledningen (ny oppslagsfunksjon, refaktor av ni funn, åtte invariant-tester,
  dokumentasjon): drøyt en time. O2 er sammenlignbart pluss tunnelrisiko.
- BAMA-korreksjonen (kildejakt, PDF-uttrekk, retting på fem flater): ~1 time. O6 er mindre.

Spennene er der oppgaven har en reell ukjent: tunnel-oppsettet i O2, og datavask i O3.
Estimatene forutsetter at ingenting i prod-skjemaet har flyttet seg siden 2026-06.
