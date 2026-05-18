---
tittel: Food TG Primary-Check Queue v0.1
status: Utført internt
eier: Gabriel
dato: 2026-04-28
sist_oppdatert: 2026-05-18
neste_handling: Kjør i prioritert rekkefølge før decision memo v0.2 bruker tall eller juridiske påstander eksternt. PCQ-C-001 + PCQ-A-001 oppdatert 2026-05-18 — se §"Runde 4 statusnotat".
relaterte_filer:
  - docs/project/mandates/actor-validation-pack-food-tg-v0.1.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-mini-verifikasjon-2b-2d-recovery.md
  - docs/project/mandates/claim-register-food-tg.md
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
| PCQ-A-001 | Soyaimport | Hent SSB/HS-serie 2020-2025 for soyabønner, soyamel/oljekake, soyaolje og relevante fôr-/SPC-koder. | L4-notat forkastet for totalclaim; Denofa actor-tall finnes. | Definisjon, år, geografi, enhet, varekoder, importland, mengde og verdi. | SRC-A-013, EV-A-017, CL-A-020, CL-C-011 | Gabriel | needs-primary-check |
| PCQ-A-002 | SPC vs soyamel | Avklar hvordan SPC registreres i handelsstatistikk og om prepared animal feed skjuler SPC-import. | Skretting actor-tall, ingen nasjonal serie. | Varekoder/metode fra SSB/Tolletaten/FIVH/fôraktør. | EV-A-019, CL-A-020 | Gabriel | needs-primary-check |
| PCQ-A-003 | Fôraktørfordeling | Kryssjekk Skretting-data mot BioMar, Cargill, Mowi Feed og Sjømat Norge. | Skretting actor-data kan ikke være bransjeproxy. | 2024/2025 fôrsammensetning, volum, råvareandeler, opprinnelse og sertifisering per aktør. | SRC-A-015, EV-A-019, CL-A-020 | Gabriel/Cathrine | needs-actor-validation |
| PCQ-A-004 | Laksefôrvolum | Skille oppdrettsfôr totalt fra laksefôr hvis decision memo bruker laksespesifikk formulering. | Fiskeridirektoratet tabell 43 gir oppdrettsfôr totalt. | Eventuell artsfordelt fôrserie eller eksplisitt forbehold om oppdrettsfôr. | SRC-A-014, EV-A-018, CL-A-020 | Gabriel | needs-primary-check |
| PCQ-A-005 | Fiskemel | Hent norsk/nordisk import/bruk av fiskemel per år/land og eventuell aktørbruk. | EUMOFA gir global/EU-kontekst. | FAO/IFFO/Eurostat/SSB eller fôraktørdata med definisjon og år. | SRC-A-016, EV-A-020, CL-A-020 | Gabriel | needs-primary-check |
| PCQ-C-001 | EUDR-Norge | Avklar norsk/EØS-innlemmelse, soya-scope, tredjelands-/eksportstatus og praktisk informasjonssystem/Traces-krav. | EU-kommisjonen gir EU-scope/frister; Landbruksdirektoratet peker på norsk prosess. | Norsk myndighetskilde/forskrift/høring/veileder med dato og scope. | SRC-C-018, EV-C-017, CL-C-011 | Gabriel | needs-primary-check |
| PCQ-B-001 | Okara total | Bekreft nordisk/norsk okara-volum per produsent/anlegg. | Axfoundation/Chalmers gir svensk benchmark; L4-nordisk total avvist. | Tonn/år, tørrstoff/fukt, anlegg, år, nåværende avsetning. | SRC-B-024, SRC-B-025, EV-B-018, CL-B-014, CL-B-021 | Gabriel/Cathrine | needs-actor-validation |
| PCQ-B-002 | Okara matgrade | Avklar hygiene, holdbarhet, stabilisering og eventuell Novel Food-/Mattilsynet-status for okara og fermentert okara. | Prosjektkilder peker på mulighet, ikke norsk lovlig pilot. | Mattilsynet/fagekspert/producer QA med krav og dokumentasjonsnivå. | EV-B-018, CL-B-009, CL-B-021 | Gabriel | needs-primary-check |
| PCQ-B-003 | Bryggerimask volum | Bekreft norsk/nordisk BSG-volum og dagens avsetning per bryggeri/marked. | RISE gir svensk benchmark: 180 g/liter øl, 80 000 tonn/år Sverige. | Bryggeridata, volum/år, fukt, stabilisering, avsetning og logistikk. | SRC-B-026, EV-B-019, CL-B-014, CL-B-021 | Gabriel/Cathrine | needs-actor-validation |
| PCQ-B-004 | Bryggerimask matgrade | Avklar mikrobiologi, tørking/fermentering, prosesskrav og lovlig mat-/ingrediensbruk. | RISE prosjekt peker på 70-80 % fukt og mikrobiell risiko. | RISE/Mattilsynet/bryggeri/ingrediensekspert med krav og dokumentasjon. | EV-B-019, CL-B-009 | Gabriel | needs-primary-check |
| PCQ-B-005 | Marint restråstoff | Lås fraksjonsdata for hvilke marine restråstoffer som går til humant konsum, fôr, biogass/energi eller ikke utnyttes. | SINTEF 2024 total er integrert. | Rapporttabeller/aktørdata per art, sektor, fraksjon, sluttbruk og år. | SRC-B-027, EV-B-020, CL-B-009, CL-B-021 | Gabriel | needs-primary-check |
| PCQ-B-006 | Plantebaserte sidestrømmer ellers | Vurdere potetskrell, eplepressrest, kaffegrut, myse og andre strømmer bare hvis primær-/aktørdata finnes. | L4 prosjektliste er kildejakt. | Produsentdata, volum, kvalitet, nåværende avsetning, lovlig sluttbruk. | CL-B-014, CL-B-021 | Gabriel | needs-primary-check |
| PCQ-C-002 | KPI-definisjoner | Definer KPI-minimum for fôr, sidestrøm, matsvinn, næringsstoffløkker og sporbarhet. | CL-C-015 er hypotese. | Definisjon, år, geografi, enhet, datakilde, dataeier og rapporteringsfrekvens. | CL-C-015, EV-B-018, EV-B-019, EV-B-020 | Gabriel | needs-primary-check |

## Prioritert rekkefølge

1. PCQ-C-001 EUDR-Norge, fordi juridisk/regulatorisk scope påvirker Spor A-claims.
2. PCQ-A-001 til PCQ-A-003, fordi soya-/SPC-tall avgjør importbaseline.
3. PCQ-B-001 til PCQ-B-004, fordi okara/BSG avgjør første prosess-sidestrømspilot.
4. PCQ-B-005, fordi sjømatrestråstoff kan bli norsk høyverdi-benchmark.
5. PCQ-C-002, fordi KPI-er først bør formuleres etter datatilgang er kjent.

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
