---
tittel: Food TG Primary-Check Queue v0.1
status: Utført internt
eier: Gabriel
dato: 2026-04-28
sist_oppdatert: 2026-06-13
neste_handling: PCQ-A-001 tidsserie er kjørt mot SSB 08801. PCQ-C-001 er oppdatert mot direktoratstatus per 2026-05-21. PCQ-B-001 til B-004 er låst som benchmark/hypotese inntil råvareeier, hygiene, stabilisering, off-taker og bruksrett er validert. 09.06-caser er lagt inn som PCQ-0906-* og skal ikke brukes i faktastemme før primærkilde eller aktørdata finnes. 13.06-case-avsjekkene lukker enkelte interne datasettgrunnlag, men råfraksjonspriser, månedlig importvindu, Strand et al.-metodebro og Valio-spesifikk fôrkurv står fortsatt åpne. `food-tg-casekort-og-research-mottak-2026-06-10.md` og `food-tg-deep-research-results-intake-2026-06-10.md` registrerer outputer før PCQ-rader endres.
relaterte_filer:
  - docs/project/mandates/actor-validation-pack-food-tg-v0.1.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-mini-verifikasjon-2b-2d-recovery.md
  - docs/project/mandates/claim-register-food-tg.md
  - docs/project/mandates/food-tg-deep-research-source-intake-2026-06-10.md
  - docs/project/mandates/food-tg-deep-research-prompt-pack-2026-06-10.md
  - docs/project/mandates/food-tg-casekort-og-research-mottak-2026-06-10.md
  - docs/project/mandates/food-tg-deep-research-results-intake-2026-06-10.md
---

# Food TG Primary-Check Queue v0.1

Kø for funn som ikke kan integreres videre uten primærkilde, juridisk kilde eller aktørdata. L4-/Perplexity-notater står bare som kildejakt.

## Runde 3 statusnotat

Runde 3 lukker noen deler av køen som internt kildegrunnlag, men ingen rader blir ekstern aktørvalidering.

| Queue-ID | Runde 3-status | Masterbeslutning |
|---|---|---|
| PCQ-C-001 | EU-scope/frister og norsk høringsstatus er primærsjekket mot EU- og norske myndighetskilder. | Integrer EU-scope og norsk delvis EØS-høringsstatus; viderefør endelig Lovdata/EØS-komité/Storting, SPC/prepared-feed-varekoder og Traces/DDS-praksis som `needs-primary-check`. |
| PCQ-A-001 | SSB 08801-serier for soyabønner, soyabønnemel, soyaolje og soyakaker/reststoff er hentet. | Integrer SSB/HS-baseline via `SRC-A-017`/`EV-A-021`; forkast L4-totalen for ekstern bruk. |
| PCQ-A-002 | `210610` er ikke soyaspesifikk, og `23099040` kan skjule ulike fiskefôr-/preparatstrømmer. | Viderefør som `needs-primary-check` og `needs-actor-validation` mot SSB/Tolletaten/fôraktører. |
| PCQ-A-003 | 3C har aktørmatrise og spørsmålsbank, men ingen aktørsvar. | Viderefør som `needs-actor-validation`; Skretting/Denofa er actor-benchmark, ikke bransjeproxy. |
| PCQ-A-004 | Oppdrettsfôr totalt er låst fra Fiskeridirektoratet/Sjømat Norge. | Integrer som oppdrettsfôr; viderefør artsfordelt/laksespesifikt fôrvolum som `needs-primary-check`. |
| PCQ-A-005 | SSB 08801 gir fiskemel/fiskepellets importserie. | Integrer importbaseline; viderefør faktisk norsk fôrbruk og aktørfordeling som `needs-actor-validation`. |
| PCQ-B-001 til PCQ-B-004 | Okara/BSG er styrket som svenske benchmark og hygiene-/datakrav. | Integrer benchmark og designkrav; viderefør norsk/nordisk volum, food-grade, Novel Food/hygiene og off-taker som valideringsbehov. |
| PCQ-B-005 | SINTEF/FHF 2024 gir norsk marint restråstoff-baseline og sektorfordeling. | Integrer som norsk benchmark; viderefør fraksjon-til-sluttbruk, råstoffvekt vs produktvekt og høyverdiavsetning som `needs-primary-check`/`needs-actor-validation`. |
| PCQ-C-002 | KPI-minimum er definert som intern gate. | Bruk KPI-er som datakrav i decision memo v0.2; ikke bruk som ekstern effekt eller målverdi før dataeier/frekvens/metode er bekreftet. |

| Queue-ID | Tema | Konkret sjekk | Nåværende kilde/status | Trengs fra primærkilde | Berører | Eier | Status |
|---|---|---|---|---|---|---|---|
| PCQ-A-001 | Soyaimport | Hent SSB/HS-serie 2020-2025 for soyabønner, soyamel/oljekake, soyaolje og relevante fôr-/SPC-koder. | Tidsserie kjørt mot SSB 08801 2026-05-21; L4-notat forkastet for totalclaim; Denofa actor-tall finnes separat. | Aktør-/metodevalidering for SPC, prepared feed og faktisk fôrbruk. | SRC-A-017, EV-A-021, CL-A-020, CL-C-011 | Gabriel | partly-checked; needs-actor-validation |
| PCQ-A-002 | SPC vs soyamel | Avklar hvordan SPC registreres i handelsstatistikk og om prepared animal feed skjuler SPC-import. | Skretting actor-tall, ingen nasjonal serie. | Varekoder/metode fra SSB/Tolletaten/FIVH/fôraktør. | EV-A-019, CL-A-020 | Gabriel | needs-primary-check |
| PCQ-A-003 | Fôraktørfordeling | Kryssjekk Skretting-data mot BioMar, Cargill, Mowi Feed og Sjømat Norge. | Skretting actor-data kan ikke være bransjeproxy. | 2024/2025 fôrsammensetning, volum, råvareandeler, opprinnelse og sertifisering per aktør. | SRC-A-015, EV-A-019, CL-A-020 | Gabriel/Cathrine | needs-actor-validation |
| PCQ-A-004 | Laksefôrvolum | Skille oppdrettsfôr totalt fra laksefôr hvis decision memo bruker laksespesifikk formulering. | Fiskeridirektoratet tabell 43 gir oppdrettsfôr totalt. | Eventuell artsfordelt fôrserie eller eksplisitt forbehold om oppdrettsfôr. | SRC-A-014, EV-A-018, CL-A-020 | Gabriel | needs-primary-check |
| PCQ-A-005 | Fiskemel | Hent norsk/nordisk import/bruk av fiskemel per år/land og eventuell aktørbruk. | EUMOFA gir global/EU-kontekst. | FAO/IFFO/Eurostat/SSB eller fôraktørdata med definisjon og år. | SRC-A-016, EV-A-020, CL-A-020 | Gabriel | needs-primary-check |
| PCQ-C-001 | EUDR-Norge | Avklar norsk/EØS-innlemmelse, soya-scope, tredjelands-/eksportstatus og praktisk informasjonssystem/Traces-krav. | Oppdatert 2026-05-21 mot Landbruksdirektoratet og Miljødirektoratet: ikke innlemmet i EØS/norsk rett ennå; EØS-prosess og forskrift er ikke ferdigstilt. | Endelig EØS-komitébeslutning, norsk forskrift/Lovdata, Traces/DDS/EORI-praksis og aktørpåvirkning. | SRC-C-018, EV-C-017, CL-C-011 | Gabriel | partly-checked; needs-primary-check |
| PCQ-B-001 | Okara total | Bekreft nordisk/norsk okara-volum per produsent/anlegg. | Axfoundation/Chalmers gir svensk benchmark; L4-nordisk total avvist; 2026-05-21 låst som benchmark, ikke pilotbevis. | Tonn/år, tørrstoff/fukt, anlegg, år, nåværende avsetning, bruksrett. | SRC-B-024, SRC-B-025, EV-B-018, CL-B-014, CL-B-021 | Gabriel/Cathrine | benchmark; needs-actor-validation |
| PCQ-B-002 | Okara matgrade | Avklar hygiene, holdbarhet, stabilisering og eventuell Novel Food-/Mattilsynet-status for okara og fermentert okara. | Prosjektkilder peker på mulighet, ikke norsk lovlig pilot; 2026-05-21 foreløpig gul gate. | Mattilsynet/fagekspert/producer QA med krav og dokumentasjonsnivå. | EV-B-018, CL-B-009, CL-B-021 | Gabriel | yellow-gate; needs-primary-check |
| PCQ-B-003 | Bryggerimask volum | Bekreft norsk/nordisk BSG-volum og dagens avsetning per bryggeri/marked. | RISE gir svensk benchmark: 180 g/liter øl, 80 000 tonn/år Sverige; 2026-05-21 låst som benchmark, ikke pilotbevis. | Bryggeridata, volum/år, fukt, stabilisering, avsetning, logistikk, bruksrett. | SRC-B-026, EV-B-019, CL-B-014, CL-B-021 | Gabriel/Cathrine | benchmark; needs-actor-validation |
| PCQ-B-004 | Bryggerimask matgrade | Avklar mikrobiologi, tørking/fermentering, prosesskrav og lovlig mat-/ingrediensbruk. | RISE prosjekt peker på 70-80 % fukt og mikrobiell risiko; 2026-05-21 foreløpig gul gate. | RISE/Mattilsynet/bryggeri/ingrediensekspert med krav og dokumentasjon. | EV-B-019, CL-B-009 | Gabriel | yellow-gate; needs-primary-check |
| PCQ-B-005 | Marint restråstoff | Lås fraksjonsdata for hvilke marine restråstoffer som går til humant konsum, fôr, biogass/energi eller ikke utnyttes. | SINTEF 2024 total er integrert. | Rapporttabeller/aktørdata per art, sektor, fraksjon, sluttbruk og år. | SRC-B-027, EV-B-020, CL-B-009, CL-B-021 | Gabriel | needs-primary-check |
| PCQ-B-006 | Plantebaserte sidestrømmer ellers | Vurdere potetskrell, eplepressrest, kaffegrut, myse og andre strømmer bare hvis primær-/aktørdata finnes. | L4 prosjektliste er kildejakt. | Produsentdata, volum, kvalitet, nåværende avsetning, lovlig sluttbruk. | CL-B-014, CL-B-021 | Gabriel | needs-primary-check |
| PCQ-C-002 | KPI-definisjoner | Definer KPI-minimum for fôr, sidestrøm, matsvinn, næringsstoffløkker og sporbarhet. | CL-C-015 er hypotese. | Definisjon, år, geografi, enhet, datakilde, dataeier og rapporteringsfrekvens. | CL-C-015, EV-B-018, EV-B-019, EV-B-020 | Gabriel | needs-primary-check |

## 09.06 nye primary-check-rader

Disse radene er opprettet etter 09.06-samtalen. De styrer dokument- og researcharbeid, men de åpner ikke ekstern outreach før scope- eller minimumsvedtak er loggført.

| Queue-ID | Tema | Konkret sjekk | Nåværende kilde/status | Trengs fra primærkilde | Berører | Eier | Status |
|---|---|---|---|---|---|---|---|
| PCQ-0906-001 | Brasil-MOU | Finn avtaletekst, partsliste, dato, scope, kontaktpunkt og bruksrett for eventuell Brasil-/kaffe-/WCEF-relasjon. | `DRR-0906-001` fant import-/EUDR- og aktørspor, men ikke offentlig MOU/prosjektdokument. | MOU/avtale, møtenotat, roadmap/annex eller dokumenteierbekreftelse. | SRC-0906-001, case-shortlist 2026-06-09, results-intake 2026-06-10 | Gabriel/Cathrine/JT | needs-primary-check; needs-actor-validation |
| PCQ-0906-002 | Elfenbenskysten-MOU/kakao | Avklar om det finnes avtale, organisasjonsnavn, motpart og scope for kakao-/Elfenbenskysten-spor. | `DRR-0906-002` styrker EUDR/sporbarhet, men signert MOU/LEAD-bekreftelse er ikke funnet. | MOU/avtale/LOI, organisasjonsnavn, kontaktperson, dato, scope og bruksrett. | SRC-0906-002, case-shortlist 2026-06-09, results-intake 2026-06-10 | Gabriel/Cathrine/JT | needs-primary-check; needs-actor-validation |
| PCQ-0906-003 | Kaffeprosjekt/Fuglen | Finn prosjekttekst, aktørrolle, råvareopprinnelse, mulig data og om kaffe kan brukes som importverdikjede-case. | `DRR-0906-001` peker på Fuglen/Nordic Approach/NKI som mulige data-/aktørspor, ikke bekreftede partnere. | Prosjektdokument, aktørbekreftelse, import-/opprinnelsesdata og rett til å omtale. | SRC-0906-003, CL-C-011, C-gate, results-intake 2026-06-10 | Gabriel | needs-actor-validation; needs-data |
| PCQ-0906-004 | Distribusjon/adoption-gate for frukt og grønt | Skille trygg C-gate om distribusjon/markedsmakt fra utrygge BAMA-spesifikke claims om marginer eller blokkering. | `DRR-0906-005` styrker bred distribusjons-/adoption-gate og svekker BAMA-anklager. | Aktørdata, produkt-/månedstall, tilsyns-/konkurransegrunnlag og juridisk trygt casegrunnlag. | SRC-0906-004, CL-C-001, CL-C-006, CL-C-015, results-intake 2026-06-10 | Gabriel/Cathrine | needs-data; needs-actor-validation |
| PCQ-0906-005 | Spillvarme/drivhus/akvaponikk | Avklare om spillvarmebasert matproduksjon har konkret norsk/nordisk case, energidefinisjon og aktør. | `DRR-0906-006` identifiserer Hima som operativ intern case med datagap, Frövi som industriell benchmark og flere plan-/scenario-case. | Driftsdata, GWh/år, temperaturprofil, reservevarme, eier, økonomi, mattrygghet og kjøper. | SRC-0906-005, CL-B-023, CL-C-015, results-intake 2026-06-10 | Gabriel | needs-data; needs-actor-validation |
| PCQ-0906-006 | Valio/Finland | Bekrefte om Valio/Finland kan brukes som governance-/fôr-case og hva som faktisk gjelder for soya, raps, lokal fôrandel eller innkjøpskrav. | `DRR-0906-003`/`004` styrker soyafri governance og svekker importfritt fôr. | Valio fôrstandard, aggregert fôrkurv, importandel, år, geografi, definisjon og bruksrett. | SRC-0906-006, SRC-BASE-008, CL-A-020, CL-C-001, results-intake 2026-06-10 | Gabriel | needs-data; needs-actor-validation |
| PCQ-0906-007 | Polen og Skottland watchlist | Finne om Polen eller Skottland har konkrete sidestrøm-, havbruk-, bioressurs- eller policycase som matcher A/B/C. | `DRR-0906-008` styrker Skottland som benchmark-kandidat og holder Polen som watchlist/kill-test. | Skotsk fulltekst/data dictionary/aktørarkiv; polsk aktør, lokasjon, volum og output hvis case skal leve. | SRC-0906-007, SRC-0906-008, results-intake 2026-06-10 | Gabriel | Skottland: needs-primary-check; Polen: watchlist; needs-data |
| PCQ-0906-008 | Bacalhau og kunstgjødselhistorie | Avklare om bacalhau/Brasil eller kunstgjødsel/Yara/Hydro gir beslutningsrelevant støtte, eller om de skal parkeres. | Kun samtalesignal; registrert som `SRC-0906-009` og `SRC-0906-010`. | Handelsdata, primær-/fagkilde og tydelig kobling til A/B/C. | SRC-0906-009, SRC-0906-010 | Gabriel | watchlist; needs-source |

## Prioritert rekkefølge

1. PCQ-0906-001 til PCQ-0906-003, fordi kaffe/kakao-relasjonscase ikke kan overleve uten MOU, prosjekttekst, aktørrolle og bruksrett.
2. PCQ-C-001 og PCQ-A-001 til PCQ-A-003, fordi juridisk/regulatorisk scope, soya-/SPC-tall og faktisk fôrbruk avgjør A-sporet.
3. PCQ-B-001 til PCQ-B-004, fordi okara/BSG bare kan modnes hvis råvareeier, hygiene, stabilisering og off-taker finnes.
4. PCQ-B-005 og PCQ-0906-004, fordi marint restråstoff og distribusjon/adoption kan bli sterke interne case, men trenger aktør-/primærdata før sterk språkbruk.
5. PCQ-0906-005 og PCQ-0906-006, fordi Hima/spillvarme og Valio/Finland avgjør om de blir smale interne deckcase eller forblir radar.
6. PCQ-0906-007 og PCQ-0906-008, fordi Skottland bør fulltekstkontrolleres raskt, mens Polen, bacalhau og kunstgjødselhistorie skal parkeres hvis ingen konkret kilde finnes.
7. PCQ-C-002, fordi KPI-er først bør formuleres etter datatilgang er kjent.

## Runde 4 statusnotat (2026-05-18)

To topp-prioritet PCQ-er er primærsjekket mot whitelistede norske myndighetskilder + SSB:

### PCQ-C-001 EUDR-Norge — KRITISK FUNN

**Status:** Delvis lukket. Primærkildesjekk mot Landbruksdirektoratet (høring 2025-08-19) og Miljødirektoratet.

**Konkret funn:**
- Norsk høring av forskrift om gjennomføring av avskogingsforordningen pågikk **frist 2025-09-30**, ikrafttredelse **2026-01-01**.
- **Soya er IKKE innlemmet** i den norske gjennomføringen. Sitat fra forskriftsutkastet: *"For råvarekategorien soya innlemmes ingen varetyper"*.
- Innlemmet i Norge: tre, kaffe, gummi (alle varetyper); kakao (de fleste); oljepalme + storfe hud/skinn (noen); soya (ingen).
- Eksport til tredjeland ligger utenfor EØS-avtalen og blir ikke innlemmet.
- Landbruksdirektoratet ansvar: tre og storfe med norsk opprinnelse. Miljødirektoratet håndterer resten.

**Konsekvens for CL-C-011:** Den interne formuleringen *"EUDR gjør soya til EU-sporbarhets- og compliance-tema; norsk/EØS-status må sjekkes separat"* er nå **bekreftet og skjerpet**: EUDR påvirker IKKE norsk-domestisk soya-fôr eller import-til-Norge for soya. Norske aktører som eksporterer soyaprodukter til EU er fortsatt omfattet av EU-scope, men intern norsk fôrproduksjon med soya er fritt fra EUDR-krav.

**Kildelenker:**
- Høring: https://www.landbruksdirektoratet.no/nb/nyhetsrom/nyhetsarkiv/horing-av-forskrift-om-gjennomforing-av-avskogingsforordningen-i-norsk-rett
- Status (Miljødirektoratet): https://www.miljodirektoratet.no/ansvarsomrader/arter-naturtyper/avskogingsforordningen/unnga-handel-med-varer-som-skader-og-odelegger-skog/informasjon-om-innforing-av-eudr-i-norge/
- Konsekvensvurdering: https://www.landbruksdirektoratet.no/nb/nyhetsrom/rapporter/vurdering-av-konsekvenser-ved-hel-eller-delvis-innlemmelse-av-avskogingsforordningen-eudr

**Gjenstår:** Endelig forskriftstekst etter høring (forventet Q4 2025 / Q1 2026). Sjekk om soya-eksklusjonen blir værende etter høringssvar. Praktisk DDS/Traces-systemkrav for norske eksportører til EU må fortsatt aktørvalideres mot Sjømat Norge / Denofa.

### PCQ-A-001 Soyaimport HS-koder

**Status:** Delvis lukket på metodikk; tidsserie gjenstår.

**Konkret funn fra SSB StatBank 08801 metadata:**
- 12010000 — Soyabønner
- 23040000 — Soyamel/oljekake
- 15071000, 15079000 — Soyaolje (rå, raffinert)
- 23031000+ — Compound feed (kan skjule SPC)
- SPC-spesifikk kode ikke entydig; sannsynligvis 23.04 fraksjon eller 21.06.10 (matcher PCQ-A-002 hypotesen).

**Kildelenker:**
- SSB 08801 metadata: https://data.ssb.no/api/v0/no/table/08801/

**Gjenstår:** Faktisk tidsserie 2020-2025 per varenummer × land × verdi/mengde. Krever JSON-stat-spørring mot SSB API. Kan kjøres av script eller i en oppfølgningssesjon. Definisjon av SPC i statistikken må kryssjekkes mot Tolletaten / fôraktør (PCQ-A-002).

### Oppsummering

| Queue-ID | Runde 4-status | Masterbeslutning |
|---|---|---|
| PCQ-C-001 | Norsk soya-eksklusjon i EUDR bekreftet via forskriftsutkast 2025-08-19. | Skjerp CL-C-011: skill mellom EU-eksport-compliance (norske aktører som eksporterer) og innenlandsk norsk soya-import/bruk (ikke EUDR-pliktig). |
| PCQ-A-001 | HS-koder identifisert for soyabønner, soyamel, soyaolje. SPC fortsatt usikker. | Tidsserieuthenting kan kjøres som SSB API-script i neste runde. |

## Runde 5 statusnotat (2026-05-21)

Oppdatering kjørt etter at scope-beslutning fortsatt ikke var formelt bekreftet. Dette er desk-/primærkildearbeid, ikke aktørvalidering.

### PCQ-C-001 EUDR-Norge — oppdatert myndighetsstatus

**Status:** Delvis sjekket mot oppdaterte direktoratssider. Ikke løftet til full closure.

**Konkret funn:**
- Landbruksdirektoratets EUDR-side, sist oppdatert 2026-05-05, sier at forordningen per i dag ikke er innlemmet i EØS-avtalen eller gjennomført i norsk rett.
- Samme side sier at regjeringen har bestemt delvis gjennomføring av EØS-relevante deler, og at jordbruksvarer som storfekjøtt og soya holdes utenfor norsk gjennomføring fordi de faller utenfor EØS-avtalens virkeområde.
- Miljødirektoratets statusveileder sier at tidspunkt for norsk iverksettelse ikke er avgjort, og at høringsoppsummering og endelig forskriftsutkast er til behandling hos Klima- og miljødepartementet og Landbruks- og matdepartementet.
- Miljødirektoratet publiserte 2026-05-08 at EU-kommisjonen foreslår endringer i produktomfanget i EUDR, med høringsfrist 2026-06-01. Dette gjelder EU-produktomfang og er ikke i seg selv norsk ferdig rettsstatus.

**Trygg formulering per 2026-05-21:**
EUDR er relevant for norske aktører som eksporterer relevante varer til EU/EØS-markedet eller inngår i EU-kundekrav, men innenlandsk norsk soyaimport/-fôrbruk skal ikke omtales som norsk EUDR-pliktig før EØS-komitébeslutning, norsk forskrift og veiledning faktisk tilsier det.

**Kildelenker:**
- Landbruksdirektoratet EUDR-side: https://www.landbruksdirektoratet.no/nb/skogbruk/eus-avskogingsforordning-eudr
- Miljødirektoratet veileder: https://www.miljodirektoratet.no/ansvarsomrader/arter-naturtyper/avskogingsforordningen/unnga-handel-med-varer-som-skader-og-odelegger-skog/
- Miljødirektoratet status for innføring i Norge: https://www.miljodirektoratet.no/ansvarsomrader/arter-naturtyper/avskogingsforordningen/unnga-handel-med-varer-som-skader-og-odelegger-skog/informasjon-om-innforing-av-eudr-i-norge/
- Miljødirektoratet produktomfang 2026-05-08: https://www.miljodirektoratet.no/aktuelt/fagmeldinger/2026/mai-2026/produktomfanget-i-eus-avskogingsforordning-foreslas-endret/

**Gjenstår:** Lovdata/forskrift etter departementsbehandling, EØS-komitébeslutning, Traces/DDS/EORI-praksis og aktørvalidering hos Denofa/Skretting/Sjømat Norge.

### PCQ-A-001 SSB 08801 tidsserie 2020-2025

**Status:** Tidsserie kjørt mot SSB API 2026-05-21. SSB-datasettet var oppdatert 2026-05-15T06:00:00Z.

Tall under er import, summert over alle land, `Mengde 1 (M1)` konvertert fra kg til tonn. Brukes som handelsstatistikk, ikke faktisk fôrbruk, bransjeforbruk eller substitusjonseffekt.

| Gruppe | Varekoder | 2020 t | 2021 t | 2022 t | 2023 t | 2024 t | 2025 t | 2025 verdi, mill. NOK |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Soyabønner | `12011000`, `12019010`, `12019090` | 412135 | 461363 | 308431 | 362788 | 347191 | 399330 | 2420 |
| Soyakaker/-mel/reststoff | `23040010`, `23040090` | 33579 | 10093 | 6299 | 1953 | 4814 | 13377 | 91 |
| Soyaolje | `15071010`, `15071090`, `15079010`, `15079090` | 8027 | 2066 | 4776 | 838 | 952 | 996 | 17 |
| Proteinkonsentrater | `21061002`, `21061003`, `21061009` | 594 | 807 | 938 | 866 | 1505 | 2065 | 107 |
| Prepared fish feed | `23099040` | 548307 | 519985 | 526999 | 458721 | 482654 | 501493 | 7508 |
| Fiskemel/fiskepellets | `23012010`, `23012090` | 136714 | 173550 | 221356 | 228143 | 217991 | 245339 | 5333 |

**Metodebegrensning:** SSB 08801 brukes som handelsstatistikk per varenummer, ikke som direkte bransjeforbruk. SPC kan ikke tolkes sikkert uten Tolletaten/fôraktørvalidering. Actor-data fra Denofa/Skretting holdes separat fra nasjonal importserie. `210610` er proteinkonsentrater, ikke soyaspesifikk SPC. `23099040` er fiskefôr, ikke SPC.

**Gjenstår:** SPC-/prepared-feed-metode må valideres mot Tolletaten/SSB/fôraktør. Faktisk fôrbruk og aktørfordeling må valideres mot Denofa, Skretting/BioMar/Mowi Feed/Sjømat Norge.

### PCQ-B-001 til PCQ-B-004 Okara/BSG — benchmark, ikke pilotbevis

**Status:** Delvis skjerpet 2026-05-21. Ingen råvareeier- eller Mattilsynet/fagekspertsvar er registrert.

**Masterregel:** Axfoundation/Chalmers og RISE brukes som svenske benchmark. Norsk eller nordisk pilotklarhet krever råvareeier, hygiene-/food-grade-vurdering, stabiliseringsmetode, off-taker og bruksrett.

**Foreløpig gate:**

| Queue-ID | Kandidat | Gate | Begrunnelse |
|---|---|---|---|
| PCQ-B-001 | Okara volum | Benchmark | Svenske prosjekttall finnes, men nordisk/norsk volum per produsent/anlegg mangler. |
| PCQ-B-002 | Okara matgrade | Gul | Kan beskrives som hypotesespor med avklaringsbehov; hygiene, holdbarhet, Novel Food/prosess og Mattilsynet/fagekspert mangler. |
| PCQ-B-003 | Bryggerimask volum | Benchmark | Svenske RISE-tall finnes, men norsk/nordisk volum, avsetning og logistikk mangler. |
| PCQ-B-004 | Bryggerimask matgrade | Gul | Kan beskrives som hypotesespor med avklaringsbehov; fukt, mikrobiologi, stabilisering, produktkrav og off-taker må avklares. |

**Gjenstår:** Kontakt råvareeier/produsent, Mattilsynet eller fagekspert og mulig off-taker. Loggfør tonn/år, batchfrekvens, tørrstoff/fukt, temperatur, mikrobiologi, nåværende avsetning, transport/logistikk, mulig off-taker og om data kan siteres.

## Runde 6 statusnotat (2026-06-12) — desk-research DRO-0906

Desk-research-runden 12.06 (full logg med tall og locators: `docs/project/analysis/desk-research-logg-dro-0906-2026-06-12.md`) lukket flere primærsjekker uten aktørkontakt. Ingen rad løftes til ekstern faktastemme; Comtrade preview-uttrekk skal re-trekkes som autorisert uttrekk (SSB 08801 eller Comtrade med nøkkel) før sitering.

| Queue-ID | Runde 6-status | Masterbeslutning |
|---|---|---|
| PCQ-0906-001/003 | Import-/EUDR-konteksten for kaffe er kvantifisert: Comtrade-serie 2022–2025 Brasil→Norge (HS 090111: 13,8→13,8→12,4→15,6 mill. kg; verdi 64,7→58,3→58,8→122,9 mUSD) + verdenstotal; Brasil-andel stabil 45–48 %. NKI-tabellen kryssverifisert eksakt (2024-identisk). | Integrer som intern tallramme for import-/EUDR-caset; MOU-/relasjonsclaim uendret `needs-primary-check`; aktørrolle `needs-actor-validation`. |
| PCQ-0906-002 | Direkteimport fra Côte d'Ivoire motbevist for alle kakaokapitler 1801–1806 i NO/SE/DK/FI (Comtrade 2024; største post: NO kakaosmør 36 450 kg). | Skjerp trygg formulering: nordisk CI-eksponering er indirekte via EU-prosessering/merkevarer. Neste datasteg er Eurostat Comext EU-aggregat, ikke mer nordisk tolldata. Relasjonsclaim uendret. |
| PCQ-0906-004 | Regulatorisk vindu dokumentert: KT overtok god handelsskikk-håndheving 01.05.2026 med NFD-føringer; høringer om innkjøpsbetingelser i matverdikjeden pågår. Ingen aktørspesifikk sak funnet. | Bruk som policy-kontekst i C-gate; aktør-/margin-claims fortsatt blokkert. |
| PCQ-0906-005 | Enova-prosjektsiden for Wiig/Green Horizon bekreftet som primærkilde (50–70 °C, 4 MW initielt, 200 MW potensial i separate prosjekter). Driftsstatus/ferdigattest ikke funnet offentlig. | Lukk «Enova-kilde ikke funnet»-blokkeren; Wiig forblir `needs-primary-check` for operativ status (Klepp byggesak/eInnsyn). Hima driftsdata uendret åpen. |
| PCQ-0906-006 | Nasjonal finsk fôrimportramme tallfestet (Comtrade 2022–2024): rapsmel 230641 stabilt ~216 000 t/år, soyamel 2304 87–144 000 t/år, erter marginalt. | Integrer som systemramme for Valio-casen («soyafri ≠ importfri» er nå kvantifisert nasjonalt); Valio-spesifikk fôrkurv uendret `needs-data` (DASK/AASK). |
| PCQ-0906-007 | Skottland: ZWS-hovedrapport fulltekstkontrollert. **Datering korrigert: Enscape 31.03.2020, 2019-survey, republisert 20.02.2025.** Nøkkelvolum og prisskille (£62–173 vs. £250–520/t) ekstrahert. Polen: hurtig kill-test bekrefter watchlist. | Skottland: `benchmark-kandidat` med eksplisitt aktualitetscaveat (2019-data); SBMT-tilgang gjenstår. Polen: watchlist bekreftet; full kill via GUS XLS/EMFAF gjenstår. |
| PCQ-B-005 | Statistics Iceland-tabellene SJA09114/09110/04903 identifisert med full struktur (33 arter × 20 biproduktkategorier × 1992–2024 × tonn/ISK). Datauttrekk blokkert på PxWeb POST; manuell eksportoppskrift i loggen kap. 1. | Kjør manuell PxWeb-eksport og legg CSV i `research/external/dro-0906/`; deretter fraksjonssammenligning mot SINTEF/FHF 2024. |

## Runde 7 statusnotat (2026-06-13) — case-avsjekk-prompter

Fire case-avsjekk-prompter er kjørt etter 12.06-mottaket og logget i `docs/project/analysis/case-avsjekk/mottak-deep-research-1206-2026-06-13.md`. Ingen rad løftes til ekstern faktastemme uten claim-lock og kildebrukscaveat.

| Queue-ID | Runde 7-status | Masterbeslutning |
|---|---|---|
| PCQ-B-005 | `P-FISH-1` + `P-SKOT-2` lukker norske 2024-hovedvolum, hvitfisk-/laksefiskfraksjoner og norsk-skotsk strukturdel som intern baseline. SSB 08801 gir bare eksportenhetsverdier på produktnivå; `P-FISH-2` traff stoppsignal fordi Strand et al. 2024 ikke finnes lokalt. | Integrer SINTEF/FHF, SSB 08801, ZWS og Nofima som interne kildekandidater. Hold råfraksjonspriser, høyverdiandel per fraksjon, aktørmarginer og Island-Norge-metodebro som `needs-data`/`needs-primary-check`. |
| PCQ-0906-004 | `P-DIST-1` gir en RP-06-ledgerkandidat for Coop/Reindyrka, ONNA, Grønt fra Nord, Viken, Skjærgaarden, Grønne Folk, Wiig og Skavland. Den dokumenterer flere oppnådde kanaler, ikke en grossistblokkering. | Oppgrader intern arbeidsstatus til `ledgerkandidat med caveat`. Månedlige importvinduer, onboardingvilkår og BAMA/Gartnerhallen-spesifikke marginer forblir `needs-data`/`needs-actor-validation`. |
| PCQ-0906-006 | `P-VALIO-1` lukker nasjonal finsk fôr-/importdatatilgang med Ruokavirasto, Luke PxWeb og Tulli/Uljas. Uljas bekrefter Comtrade-previewen på kg-nivå for 2022–2024. | Bruk som autorisert nasjonal systemramme for `soyafri != importfri`. Ikke bruk som Valio-fôrkurv; Valio-andeler, PFAD/A-Rehu og gårdsspesifikk fôrstandard forblir DASK/AASK. |
| PCQ-0906-007 | `P-SKOT-2` er lukket som strukturdel i P-FISH-1; `P-SKOT-1` er fortsatt åpen hvis Skottland skal brukes tungt utover 2019-surveyen. | Skottland kan brukes som intern struktur-/separeringsbenchmark med årstall og aktualitetscaveat. Ikke bruk som dagens skotske markedsstatus uten nyere data. |

## Runde 8 statusnotat (2026-06-14) — Maktkart Brønnøysund-stikkprøve (AP-1/AP-5 §8)

Maktkart-syntese §8 steg 1 er kjørt mot Brønnøysund Enhetsregisteret + roller for 22 selskaper. Full logg med kilde-URL per orgnr: `docs/project/analysis/food-tg-maktkart-bronnoysund-stikkprove-2026-06-14.md` + `research/analyse/ap5-ap1-bronnoysund-stikkprove-2026-06-14.json`. Bekrefter kontroll-STRUKTUR (form + styre), ikke eierandel-%.

| Queue-ID | Tema | Konkret sjekk | Nåværende kilde/status | Trengs fra primærkilde | Berører | Eier | Status |
|---|---|---|---|---|---|---|---|
| PCQ-MAKT-001 | AP-5 ultimate ownership | Verifiser topp-konsernenes juridiske form + kontrollpersoner mot Brønnøysund; krysssjekk eierandel-%. | Form + styrekontroll bekreftet for 8 konsern + 6 sjømat/Møgster-selskaper (22/22 formmatch) mot `/enheter` + `/roller` 2026-06-14. Eierandel-verktøy bygget (`scripts/verify-ownership-aksjonaerregister.ts`, enhetstestet); NG ≈ 74,4 % Johannson + Laco→Austevoll→Lerøy sekundær-korroborert; SA-samvirke N/A (bekreftet av form). Eksakt eierandel-% gjenstår fra registeruttrekk. | Bestilt Aksjonærregister-uttrekk (skatteetaten.no/deling, e-postlenke 1 uke; AS/ASA) for ≥50 %-kontroll og «39 selskaper»-tellingen. | CL-AP5-001, CL-MAKTKART-001 | Gabriel | partly-checked; eierandel-% `needs-primary-check` (verktøy klart) |
| PCQ-MAKT-002 | AP-1 styreverv | Verifiser topp-bro-personer + topp-interlock-selskaper mot Brønnøysund roller m/dato. | 9/10 broere bekreftet med sittende verv (`sistEndret` 2021–2026); Hollevik bekreftet på 7 selskaper; Trond Bentestuen utenfor utvalget. | Brønnøysund roller for Trond Bentestuen; full styredekning fra dekningsutvidelsen (task #22) før komplett bro-telling. | CL-AP1-001, CL-AP1-002, CL-MAKTKART-001 | Gabriel | partly-checked |

**Masterbeslutning:** Løft CL-AP1-001/CL-AP5-001/CL-MAKTKART-001 til `klar-med-forbehold` for *strukturpåstanden* (hvem kontrollerer via form/styre). Hold eierandel-% (AP-5) som `krever-bekreftelse` til Aksjonærregisteret er sjekket. Ingen rad blir ekstern faktastemme før full operator-sekvens (`research/CITABLE-KNOWLEDGE-BASE-STATUS.md`) er grønn.
