---
tittel: Food TG 09.06 Sprintboard Go/No-Go 2026-06-10
status: Aktiv intern
eier: Gabriel
dato: 2026-06-10
scope: Operativt sprintboard for 09.06-/10.06-casekort, Deep Research-mottak, dokumentask og intern deck/go-no-go.
relaterte_filer:
  - docs/project/mandates/food-tg-casekort-og-research-mottak-2026-06-10.md
  - docs/project/mandates/food-tg-dokumentask-og-actor-ask-pack-2026-06-10.md
  - docs/project/mandates/food-tg-deep-research-prompt-pack-2026-06-10.md
  - docs/project/mandates/food-tg-deep-research-results-intake-2026-06-10.md
  - docs/project/mandates/food-tg-deck-outline-2026-06-09.md
  - docs/project/mandates/primary-check-queue-food-tg-v0.1.md
  - docs/project/mandates/food-tg-claim-lock-table-2026-05.md
---

# Food TG 09.06 Sprintboard Go/No-Go 2026-06-10

Dette er arbeidsbrettet for 09.06-/10.06-sprinten mens Deep Research-output, dokumentask og intern casekortsortering pågår. Mottatte outputer fra 10.06 er logget i `food-tg-deep-research-results-intake-2026-06-10.md`. Sprintboardet skal gjøre det lett å se hva som kan brukes internt, hva som venter på kilde/data, og hva som skal parkeres raskt hvis dokumentasjon uteblir.

## Bruksregel

Sprintboardet åpner ikke ekstern outreach, ekstern faktastemme eller nye claims. Det styrer bare intern prioritering og go/no-go. Alle statusløft må fortsatt gå gjennom mottaksfilen, dokumentask/actor ask, PCQ, source-shortlist og claim-lock.

## Arbeidsflyt

| Fase | Input | Handling | Output | Gate |
|---|---|---|---|---|
| 1 Deep Research | Caseprompt-output | Kjør valideringsprompt og registrer DRO-rad. | Oppdatert mottakslogg. | Ingen claim løftes. |
| 2 Dokumentask | DRO-rad eller åpent casekortfelt | Koble til DASK-rad og be om dokument/brukstillatelse internt. | Responslogg eller stoppsignal. | Ingen ekstern kontakt. |
| 3 Primærkilde/data | Kilde eller rapport funnet | Vurder source-shortlist eller PCQ-oppdatering. | Kontrollert kilde- eller PCQ-endring. | Kilde må ha eier, dato, locator og bruksverdi. |
| 4 Aktørask | Aktørrolle, tall eller bruksrett trengs | Forbered AASK; send bare etter separat gate. | Actor validation candidate. | Ikke sendt fra sprintboardet. |
| 5 Go/no-go | Casekort + claim-lock | Beslutning: intern deck, videre validering, watchlist eller parkering. | Slide-/decision-pack input. | Claim-lock må fortsatt respekteres. |

## Sprintboard

| Prioritet | Case | DRO | DASK/AASK | Nå-status | Intern bruk nå | Blokker | Neste handling | Stoppsignal | Go/no-go retning |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | Brasil/kaffe | `DRO-0906-001` | `DASK-0906-001`, `DASK-0906-003`, senere `AASK-0906-001` | Mottatt `DRR-0906-001`; MOU/prosjekt `needs-primary-check`, import/EUDR-kaffe intern hypotese | Kaffeimport/EUDR som intern kildejakt; relasjonscase bare som dokumentask. | MOU/prosjekttekst, coffee workstream, partsliste, dato, scope og bruksrett mangler. | Be Natural State/NCH/Nordic Innovation om avtale/annex/deltakerliste; bygg separat kaffeimport-/EUDR-spor hvis MOU ikke finnes. | Ingen dokumenteier eller avtaletekst. | No-go for relasjonscase uten dokument; mulig go som import-/EUDR-kildecase etter primærsjekk. |
| 2 | Elfenbenskysten/kakao | `DRO-0906-002` | `DASK-0906-002`, senere `AASK-0906-002` | Mottatt `DRR-0906-002`; relasjon `needs-primary-check`; EUDR/sporbarhet intern med caveat | EUDR-/sporbarhetskontekst, avskogingsrisiko og mulig nordisk aktørkjede. | Signert MOU/LOI, LEAD-bekreftelse, nordisk verdikjededata og reststrømdata mangler. | Få MOU/LOI eller avkreftelse; hent Conseil du Cafe-Cacao-dokumenter og HS1801-1806/nordisk aktørdata. | Manglende organisasjonsnavn eller avtaledokument for relasjonsclaim. | No-go som relasjonscase uten dokument; go som EUDR/sporbarhets-kontekst bare med tydelig caveat. |
| 3 | Valio/Finland | `DRO-0906-003` | `DASK-0906-004`, senere `AASK-0906-003` | Mottatt `DRR-0906-003` + `DRR-0906-004`; `deckklart internt` som soyafri governance; `needs-data` | Intern governance-case om soyafri melkefôrpraksis og import-gap. | Aggregert fôrkurv, importandel, fôrstandard og leverandørrolle mangler. | Be Valio om fôrstandard og fôrkurv 2022-2025; trekk Ruokavirasto/Tulli-data; valider A-Rehu kun smalt. | Importfritt språk eller 100 prosent finsk fôr. | Go for intern soyafri governance-slide; no-go for importfritt fôr. |
| 4 | Distribusjon/adoption-gate for frukt og grønt | `DRO-0906-004` | `DASK-0906-005`, senere `AASK-0906-004` | Mottatt `DRR-0906-005`; `deckklart internt` som C-gate; `needs-actor-validation` | Intern C-gate om grossistledd, markedstilgang, kaldkjede, volum og sortimentskrav. | BAMA-spesifikk blokkering, marginer, onboarding og produkt-/månedstall mangler. | Bruk bredt casenavn; aktørvalider BAMA/Gartnerhallen/alternative kanaler og hent CEA-relevante produktdata. | Margin-, blokkering- eller misbruksclaim uten primærkilde. | Go som bred C-gate; no-go for BAMA-spesifikk anklage. |
| 5 | Spillvarme/drivhus/akvaponikk | `DRO-0906-005` | `DASK-0906-006`, senere `AASK-0906-005` | Mottatt `DRR-0906-006`; Hima intern case med datagap; resten radar/primary-check | Hima som operativ datasenter-til-akvakultur; Frövi som industriell benchmark; planprosjekter som radar. | GWh/år, temperaturprofil, faktisk energibesparelse, reservevarme og økonomi mangler. | Lag mini-ledger; be Green Mountain/Hima om driftsdata; drep/valider Wiig via Klepp/Enova. | Kun datasenterkapasitet, planomtale eller scenario uten nyttiggjort varme og matkobling. | Go for Hima intern case med datagap; no-go for nasjonalt TWh-claim. |
| 6 | 100% Fish/marint restråstoff | `DRO-0906-006` | `DASK-0906-007`, senere `AASK-0906-006` | Mottatt `DRR-0906-007`; `benchmark-only`; `deckklart internt` med claim-lock; `needs-data` | Benchmark/designkrav for fraksjonskart, produktkaskade og clusterlogikk. | Islandsk nåtidsdata, IOC claim-metode, norsk fraksjonsdata, høyverdiandel og bruksrett mangler. | Koble til PCQ-B-005; ekstraher Statistics Iceland; be SINTEF/FHF om fraksjons-/høyverdiuttrekk. | Islandsk benchmark behandles som norsk pilotbevis eller 100 prosent faktisk utnyttelse. | Go som benchmark; no-go som norsk pilotcase uten aktørdata. |
| 7 | Skottland/Polen | `DRO-0906-007` | `DASK-0906-008`, `DASK-0906-009`, senere `AASK-0906-007` | Mottatt `DRR-0906-008`; Skottland `benchmark-kandidat`; Polen `watchlist` | Skottland som bioressurs-/seafood-benchmark etter fulltekst; Polen som kill-test/watchlist. | ZWS fulltekst, SBMT data dictionary, aktørarkiv, polsk aktør/lokasjon/volum/output mangler. | Prioriter ZWS/SBMT/Seafood Scotland; kill-test Polen med GUS/PROM/CDR/SIR/EMFAF. | Ingen fulltekst eller ingen konkret aktør/lokasjon/volum/output. | Go for Skottland hvis fulltekst holder; Polen forblir watchlist eller parkeres. |

## Neste 72 timer

| Rekkefølge | Handling | Eier | Output |
|---:|---|---|---|
| 1 | Kjør intern dokumentask for `DASK-0906-001` og `DASK-0906-002` etter `DRR-0906-001`/`002`. | Gabriel/Cathrine/JT | Bekreftelse, avkreftelse eller parkering av relasjonsclaims. |
| 2 | Lås trygg Valio-formulering fra `DRR-0906-003`/`004`: soyafri governance, ikke importfritt fôr. | Gabriel | Slideklar intern formulering og datagapliste. |
| 3 | Gjør `DRO-0906-004` til "distribusjon/adoption-gate for norsk frukt og grønt". | Gabriel/Cathrine | Juridisk trygg caseformulering uten BAMA-anklage. |
| 4 | Lag mini-ledger for Hima, Frövi, Wiig, Kviamarka, Varde og Polar. | Gabriel | Casevis status på operativ drift, varmekilde, MW/GWh, temperatur, off-taker og stoppsignal. |
| 5 | Prioriter ZWS/SBMT for Skottland og Statistics Iceland/SINTEF-FHF for 100% Fish. | Gabriel | Benchmarkdata eller parkering av utrygge claims. |

## Go/no-go-regler

| Beslutning | Krav | Standardtekst |
|---|---|---|
| Go til intern deck | Case har trygg intern formulering, tydelig caveat og claim-lock ikke-si. | "Kan brukes internt med kilde-/valideringsforbehold." |
| Videre validering | Case har kilde- eller aktørspor, men mangler data, bruksrett eller primærkilde. | "Modnes gjennom dokumentask/PCQ før bruk i faktastemme." |
| Watchlist | Case er interessant, men ikke beslutningsbærende nå. | "Beholdes som radar til konkret kilde finnes." |
| Parkering | Hoveddokument eller primærkilde finnes ikke, eller output svekker hypotesen. | "Parker aktivt case; behold eventuelt som kildejakt." |
| No-go for ekstern bruk | Claim krever aktør/data/primærkilde eller er reputasjonelt sensitivt. | "Skal ikke brukes i ekstern faktastemme." |

## Deck-readiness

| Slideområde | Kan fylles nå | Venter på | Bruksgrense |
|---|---|---|---|
| Syv caseanker | Ja | Ingen | Status må vises som intern modenhet, ikke ekstern godkjenning. |
| Kaffe/kakao | Delvis | MOU/avtale/dokumenteier og nordisk verdikjededata | Kaffe/kakao som import-/EUDR-hypotese; relasjonsclaims lukket. |
| Valio | Ja, smalt | Fôrstandard, fôrkurv og importdata | Soyafri governance, ikke importfritt fôr. |
| Distribusjon/adoption | Ja, bredt | Aktørdata og produkt-/månedstall | Bruk distribusjon/adoption, ikke BAMA-anklage. |
| Spillvarme | Delvis | Hima driftsdata og casevis mini-ledger | Hima internt med datagap; radar, ikke nasjonalt potensial. |
| 100% Fish | Ja, som benchmark | Norsk fraksjons-/høyverdidata | Benchmark, ikke norsk pilotbevis. |
| Skottland/Polen | Delvis | Fulltekst og konkrete data | Skottland benchmarkkandidat; Polen watchlist. |

## Oppdateringsprotokoll

1. Oppdater sprintboard bare når mottaksfilen eller dokumentask-responsen har ny status.
2. Oppdater mottaksfilen før PCQ, source-shortlist eller claim-lock endres.
3. Oppdater PCQ når en kilde mangler, svekkes eller krever primærkontroll.
4. Oppdater source-shortlist bare når en stabil kilde har eier, dato, URL og bruksverdi.
5. Oppdater claim-lock når et funn styrker stoppspråk, svekker claim eller åpner tryggere intern formulering.
6. Oppdater deck-outline først når case har go/no-go-retning og trygg formulering.
