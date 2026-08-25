---
tittel: Food TG AP-1 — Styredekning utvidet (inputs/sjømat): funn 2026-06-14
status: Internt analysefunn — klar til DB-kjøring (projisert lift)
eier: Gabriel
dato: 2026-06-14
arbeidspakke: AP-1 dekningsutvidelse (task #22) i docs/project/plans/food-tg-dybdeanalyse-arbeidsplan-2026-06-14.md
datakilde: Brønnøysundregistrene — «roller i virksomheten» (/roller), hentet 2026-06-14
bruksregel: Internt analysefunn. «Makt» betyr strukturell posisjon i styregrafen, ikke intensjon, samordning eller ulovlighet. Kun offentlige rolledata; aktørspesifikke formuleringer går gjennom claim-lock/PCQ før ekstern bruk. Dekningstallene «etter» er projisert til den lokale DB-kjøringen er gjennomført.
relaterte_filer:
  - docs/project/analysis/food-tg-ap1-styreoverlapp-funn-2026-06-14.md
  - scripts/extend-board-coverage-brreg.ts
  - src/lib/brreg-roles.ts
  - tests/lib/brreg-roles.test.ts
  - tests/scripts/extend-board-coverage-brreg.test.ts
  - research/analyse/ap1-board-coverage-extension-brreg-2026-06-14.json
  - scripts/dedupe-person-keys.ts
  - scripts/analyze-board-interlocks.ts
---

# AP-1 dekningsutvidelse — styrekartet lukkes mot eierkartet (inputs/sjømat)

## 1. Kort funn

AP-1 (styreoverlapp) sto med 35,6 % selskapsdekning (98/275), og det dokumenterte hullet lå i **inputs/fôr og sjømat** — der eierkartet (AP-2/AP-5) allerede dekker mer enn styrekartet. Denne pakken lukker hullet ved å hente sittende styre fra Brønnøysund for nettopp de selskapene.

Av 34 målselskaper i inputs/sjømat (identifisert fra de committede import-skriptene) har **31 sittende styredata i Brønnøysund: 265 styreverv, 228 distinkte personer.** Tre orgnr er utgått (fusjonert/omorganisert) og gir 404. Lagt til AP-1-baselinen projiseres selskapsdekningen fra **35,6 % (98/275) til opptil 46,9 % (129/275)** — en heving på ~11 prosentpoeng som bringer styrekartet vesentlig nærmere eierkartets dekning.

Det ikke-opplagte er at utvidelsen **ikke** bare er dekningsfyll. En isolert interlock-test på de 34 selskapene avdekker et eget maktnett i sjømat/fôr som AP-1 var blind for fordi disse styrene manglet:

- **To inputs↔sjømat-broer** — nøyaktig den fôr↔oppdrett-vertikalen AP-1-hypotesen forutså: **Ivan Vindheim** (Mowi ASA + Mowi Feed AS) og **Therese Log Bergjord** (Fiskå Mølle AS + Kverva AS).
- **Møgster-klyngen** blir synlig: Arne Møgster (5 selskaper), Helge Singelstad (4), samt Helge Arvid, Lill Maren og Karoline Møgster spenner Austevoll Seafood, Lerøy og Laco AS. Det er uavhengig styre-korroborasjon av AP-2/AP-5-funnet om at sjømat-/dagligvarekontroll går via familie/samvirke, ikke via spredt aksjepost.
- **Null overlapp med AP-1s eksisterende topp-20** broere — sjømat/fôr-nettet er strukturelt atskilt fra retail/logistikk-nettet på styrenivå. Det er i seg selv et funn: de to maktklyngene deler ikke styremedlemmer på toppnivå.

## 2. Tall

| Mål | Verdi |
|---|---:|
| Målselskaper (inputs + sjømat) | 34 |
| — med sittende styredata i Brønnøysund | 31 |
| — utgått orgnr (404) | 3 |
| Sittende styreverv hentet | 265 |
| Distinkte personer | 228 |
| Ekskluderte fratraadte/avregistrerte verv | 1 (Mowi ASA, tidligere styreleder) |

Per sektor (selskaper med styredata / hentet):

| Sektor | Selskaper m/data | Styreverv |
|---|---:|---:|
| inputs (fôr m.m.) | 13 / 13 | 130 |
| seafood (sjømat) | 18 / 21 | 135 |
| production | 0 (ingen rene `production`-selskaper i korpuset) | — |

Projisert dekning (lagt på AP-1-baselinen 98/275):

| Mål | Før | Etter (øvre grense) |
|---|---:|---:|
| Selskaper med styredata | 98 | 129 |
| Andel av selskapsuniverset (275) | 35,6 % | 46,9 % |

«Øvre grense» fordi noen mor-ASA-er (Mowi, SalMar, Lerøy, Austevoll) kan allerede ha styredata i DB. Konsern-dekningssignalet (`data/konsern-coverage.json`, 2026-05-25) viser likevel `childrenWithBoardMembers = 0` for leroy, salmar, mowi, felleskjøpet, nortura og tine — så de fleste antas reelt nye. Faktisk lift avgjøres ved kjøring; skriptet rapporterer før→etter.

## 3. Nye interlockere og sektorbroer (isolert forhåndstest)

Personer med styreverv i ≥2 av de 34 målselskapene (topp etter antall selskaper):

| Person | Sektor(er) | Selskaper |
|---|---|---:|
| Arne Møgster | seafood | 5 (Lerøy, Austevoll, Lerøy Havfisk, Lerøy Norway Seafoods, Laco) |
| Sjur Svenningsson Malm | seafood | 5 (fire Lerøy-enheter + Lerøy Norway Seafoods) |
| Helge Singelstad | seafood | 4 (Austevoll, Lerøy Havfisk, Lerøy Norway Seafoods, Laco) |
| Gustav Witzøe | seafood | 3 (SalMar, SalMar Farming, Kverva) |
| **Ivan Vindheim** | **inputs ↔ seafood** | 2 (Mowi Feed, Mowi ASA) |
| **Therese Log Bergjord** | **inputs ↔ seafood** | 2 (Fiskå Mølle, Kverva) |

21 intra-set-interlockere totalt; to av dem krysser sektor (inputs↔seafood). **Forbehold:** dette er beregnet *kun* på de 34 nye selskapene. Den fulle AP-1-rekjøringen mot den kombinerte grafen (eksisterende 555 verv + nye 265) vil sannsynligvis avdekke *flere* broer — denne testen kunne bare sjekke overlapp mot topp-20 fra forrige kjøring, ikke hele person­korpuset på 487.

## 4. Tolkning — består lakmustesten?

Ja. Lakmustesten er «minst én påstand en bransjeinnsider ikke allerede har, forsvarbar med data». Beskrivende dekningsheving alene består ikke — men mønsteret gjør det: (a) fôr↔oppdrett-vertikalen er nå empirisk synlig som personbroer (Vindheim internt i Mowi; Bergjord på tvers av Fiskå Mølle og Kverva/SalMar-sfæren), og (b) sjømat-/fôr-nettet er strukturelt atskilt fra retail-/logistikk-nettet på styrenivå. Det skjerper AP-1s opprinnelige funn: «makt via styreverv på tvers av sektorer» gjelder, men de to store klyngene (dagligvare/distribusjon vs. sjømat/fôr) er separate broløp, ikke ett sammenhengende nett.

Utvidelsen gjør også AP-1 til et bedre prioriteringsverktøy for AP-5: Møgster-klyngen og Witzøe-/Kverva-koblingen er konkrete steder å teste ultimate ownership i Brønnøysund-stikkprøven (maktkart-syntese §8).

## 5. Claim-lock-rad (utkast)

| Felt | Innhold |
|---|---|
| Claim-ID | CL-AP1-002 (utkast) |
| Påstand | Sittende styredata fra Brønnøysund for inputs/sjømat hever AP-1s selskapsdekning fra 35,6 % mot ~47 % og avdekker et sjømat-/fôr-styrenett (inkl. Møgster-klyngen og to inputs↔sjømat-broer) som er strukturelt atskilt fra retail-/logistikk-nettet. |
| Evidens | `research/analyse/ap1-board-coverage-extension-brreg-2026-06-14.json`; 265 sittende styreverv over 31 selskaper; kilde Brønnøysund `/roller`; rolle-mapping og personKey enhetstestet (`tests/lib/brreg-roles.test.ts`). |
| Dekning | 31/34 målselskaper har data; 3 utgåtte orgnr. Projisert 129/275 (46,9 %) — endelig tall fra DB-kjøring. |
| Risiko | Kan leses som koordineringspåstand. «Øvre grense»-dekning kan overvurdere lift hvis mor-ASA allerede var dekket. PersonKey-mismatch mot historiske rader før dedupe. |
| Stoppspråk | Ikke si «kontrollerer», «koordinerer» eller «skjult nettverk» fra styregrafen alene. Ikke bruk 46,9 % som faktisk dekning før kjøringen er gjort. Ikke kall familie-/samvirkeklynger ulovlige eller utilbørlige. |
| Status | `intern baseline` — klar til DB-kjøring; ikke ekstern faktastemme før primærsjekk (§8) og dekningsutvidelsen faktisk er kjørt. |

## 6. Datakvalitetsflagg og forbehold

- **Utgåtte orgnr (3):** NTS ASA (952587687, fusjonert inn i SalMar), SalmoNor AS (952662813, inn i SalMar) og Hallvard Lerøy AS (914353561, omorganisert) gir 404 på `/roller`. Korpuset bærer utdaterte orgnr for disse — bør orgnr-korrigeres (enricherens navnesøk-fallback eller manuelt). De gir ingen dekning her.
- **PersonKey-konsistens (viktig):** Nye rader bruker `canonicalPersonKey` (ø→o, æ→ae, oe→o, aa→a). Historiske tre-import-rader brukte eldre normalisering (f.eks. `gustav-witzoee` vs. kanonisk `gustav-witzo`). **Kjør `scripts/dedupe-person-keys.ts --commit` etter import og før AP-1 re-kjøres**, ellers kan samme person telles dobbelt eller broer underrapporteres. (Dedupe-skriptets eget eksempel er nettopp Møgster-saken.)
- **Kun sittende styre:** `fratraadt`/`avregistrert` verv ekskluderes som standard (bevisst strengere enn `enrich-offentligdata.ts`, som tar med alle), fordi en dekningsutvidelse skal speile dagens styrekart. Kjør med `--include-resigned` for å matche enricheren.
- **`production`-sektoren er nær tom** i selskapskorpuset; primærproduksjon ligger i tilskuddsdataene (AP-3), ikke som selskaper. Hullet som lukkes er reelt inputs + sjømat.
- **Ikke markedsandel:** styreverv ≠ eierskap ≠ kontroll. Funnet er en posisjon i styregrafen.

## 7. Kjøresekvens (lokalt, mot DB)

DB-en kjører lokalt (`localhost:5432`); derfor er importen et lokalt steg. Kode + reproduserbart snapshot ligger klart i arbeidstreet og må commit'es sammen med resten av pakken.

```bash
# 1. Forhåndsvis hullet og planlagte skrivinger (ingen DB-skriving)
npx tsx scripts/extend-board-coverage-brreg.ts --dry-run

# 2a. Apply via live Brønnøysund-henting
npx tsx scripts/extend-board-coverage-brreg.ts
# 2b. ELLER apply offline/reproduserbart fra snapshotet
npx tsx scripts/extend-board-coverage-brreg.ts \
  --snapshot-in=research/analyse/ap1-board-coverage-extension-brreg-2026-06-14.json

# 3. Konsolider personKey (kanonisk) på tvers av historiske + nye rader
npx tsx scripts/dedupe-person-keys.ts --commit

# 4. Re-kjør AP-1 og skriv nytt aggregat
npx tsx scripts/analyze-board-interlocks.ts --out=research/analyse/ap1-styreoverlapp.json

# 5. Oppdater faktisk dekning i funnnotat + surfacing fra det nye aggregatet
```

## 8. Neste

1. Kjør sekvensen over og les faktisk dekning + ny bro-/interlocker-telling fra det kombinerte aggregatet.
2. Oppdater `src/lib/data/dybdeanalyse.ts` (`ins-ap1-001` `coverageNote`) til de faktiske tallene etter re-kjøring — ikke før (claim-disiplin: ikke surface projeksjon som realisert).
3. Mate Møgster-klyngen og Vindheim/Bergjord-broene inn i AP-5 Brønnøysund-stikkprøven (maktkart-syntese §8) som konkrete ultimate-ownership-tester.
4. Orgnr-korriger de tre utgåtte sjømat-enhetene, så de kan dekkes ved neste kjøring.

## 9. Verifikasjon

Datasettet er hentet fra Brønnøysund `/roller` 2026-06-14 og ligger i `research/analyse/ap1-board-coverage-extension-brreg-2026-06-14.json`. Den rene parsing-/personKey-kjernen er enhetstestet (`tests/lib/brreg-roles.test.ts`, 7 tester), og det DB-baserte skriptet importeres uten å kjøre main og har testet dekningsmatematikk og arg-parsing (`tests/scripts/extend-board-coverage-brreg.test.ts`). Repoets faktiske gater er grønne (`npm test` 504/504, `npm run lint`, `npm run build`, `git diff --check`). Ingen påstand er løftet til ekstern bruk; dekningstallene «etter» er projisert til den lokale kjøringen er gjennomført.

## §9 — Kjørt 2026-08-25: null-funn. Hullet er borte, og «36 %» var et tidsartefakt

Tørrkjøringen er utført mot prod (`prod-data-import.yml`, target
`board-coverage-dry`, run 32859020542). Den lukker denne arbeidspakken — med
null nye rader.

```
Dekning før: 260/361 (72,0 %). Målsektorer inputs/seafood/production:
40 selskaper, 5 uten styredata. Behandler 5.
  [404] × 5 — alle
  Selskaper som fikk styredata: 0
  Nye styreverv (rader):        0
  Dekning: 260/361 (72,0 %) → 260/361 (72,0 %)
```

### Hvorfor premisset «36 % → ~47 %» ikke holdt

**«36 %» var aldri en dekningsgrad for sittende styre.** `BoardMember.effectiveTo`
skrives ikke av noe i kodebasen — verken skript, migrasjon eller seed. Søk i
`scripts/`, `src/lib/` og `prisma/migrations/` gir kun treff på
`CompanyOwnership.effectiveTo`, en annen modell. Kolonnen finnes, men fylles
aldri. `--active-only`-filteret har derfor **aldri ekskludert en eneste rad**.

Forskjellen mellom de to juni-artefaktene er tid, ikke filter:

| Artefakt | Generert | Univers | Seter |
|---|---|---|---|
| `ap1-styreoverlapp-active-only.json` | 14.06 kl. 11:21 | 275 | 555 |
| `ap1-styreoverlapp.json` | 15.06 kl. 12:01 | 351 | 1892 |

Både univers og seter vokste over natten — en import landet mellom kjøringene.
De 555 setene var alt som fantes 14. juni. **Dekningshullet ble altså lukket
dagen etter at «36 %» ble målt**, og planen har båret tallet i to og en halv
måned.

Bekreftet mot prod 2026-08-25: `boardRows` 1844, `boardRowsActive` 1844,
`withBoard` 260, `withActiveBoard` 260 — identiske par, som er signaturen på at
`effectiveTo` aldri settes.

### Følge: `ap1-styreoverlapp-active-only.json` er feilmerket

De to artefaktene utgir seg for å måle ulike ting, men måler det samme. Filen
er ikke «aktive verv» — den er «alle verv, målt 14. juni». Kjørt i dag ville de
to gitt identiske tall. Det bør ikke siteres som en aktiv/historisk-distinksjon,
for den distinksjonen finnes ikke i dataene.

### Restposten er datakvalitet, ikke dekning

De fem gjenstående selskapene mangler ikke styredata fordi Brønnøysund ikke har
dem, men fordi orgnr-et vårt ikke slår opp:

| Orgnr i DB | Selskap | Brreg |
|---|---|---|
| 975320637 | Lerøy Seafood Group ASA | **404 — feil nummer.** Selskapet er aktivt på **975350940** |
| 952662813 | SalmoNor AS | 200, men `slettedato` 2021-12-27 (fusjonert inn i SalMar) |
| 914353561 | Hallvard Lerøy AS | 404 — nummeret finnes ikke |
| 952587687 | NTS ASA | 404 — nummeret finnes ikke (fusjonert inn i SalMar) |
| 980358088 | Skretting Norge AS | 404 — nummeret finnes ikke |

Lerøy Seafood Group ASA er det tydelige tilfellet: et aktivt konsern med feil
orgnr i vår base. Det er en datafeil å rette, ikke et dekningshull å fylle — og
det er en egen beslutning, siden det endrer `Company.orgNr` i prod.

**Status: dekningsutvidelsen er lukket som gjennomført med null-funn.** Skriptet
og write-targetet består (`board-coverage`), men det finnes ingenting å skrive.
