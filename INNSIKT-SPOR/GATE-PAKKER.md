# Gate-pakker — dataeier, aktør og human-gate

**Status:** provisorisk — internt analysemateriale, ikke publiserbart
**Dato:** 2026-08-04
**Formål:** Gjøre de gjenværende portene kjørbare. Ingen pakke er sendt, og ingen ekstern mottaker er kontaktet i denne runden.

## 1. Felles regel

En forespørsel skal ikke spørre «har dere tall?» generelt. Den skal be om definert periode, enhet, systemgrense, tilgangsnivå, metode og eksplisitt svar dersom feltet ikke kan deles. Et «ikke offentlig/ikke aggregert» skal registreres som et datatilgangsutfall, ikke automatisk som bevis på at data ikke finnes.

**Kildegrunnlag:** `research/_plans/gap-program-2026-07-21/GAP-LUKKINGSPROGRAM-2026-07-21.md`, §§ 1–2 og 11; `INNSIKT-SPOR/GAP-GJENNOMGANG.md`, §§ 8–11.

## 2. Pakkeoversikt

| Pakke-ID | Gate | Primær mottaker/dataeier-spor | Minimumsutfall | Status |
|---|---|---|---|---|
| D1 | Oppdrettsslam | Miljødirektoratet, Fiskeridirektoratet, Statsforvalter, anlegg/operatør, mottaksanlegg | Ledger eller datert bekreftelse av manglende åpen ledger | Klar som intern forespørselsmal; ikke sendt |
| D2 | Digestat N/P/K | Landbruksdirektoratet, Mattilsynet, NIBIO, biogassaktører | N/P/K-tabell per substrat/anlegg/år eller eksplisitt gap | Klar som intern forespørselsmal; ikke sendt |
| D3 | Offentlig matinnkjøp | DFØ, KS, kommuner/fylkeskommuner, innkjøpssamarbeid | Definert matnevner og lokal/økologisk andel | Klar som intern forespørselsmal; ikke sendt |
| D4 | Aktørvolum | Topp 15 alternative proteinaktører og relevante fôr-/matkjøpere | Faktisk produsert/solgt volum med produkt- og årsskille | Klar som aktørspørsmålssett; ikke sendt |
| D5 | Beredskapsnoder | Landbruksdirektoratet, DSB, Kystverket, lager-/logistikkaktører | Aggregert kapasitet/beholdning/aktiveringstid eller sikkerhetsbegrensning | Klar som innsyns-/aktørspørsmål; ikke sendt |
| H1 | Mission 1 | Fem prioriterte stakeholderroller | Samtykket, transkribert og sitatgodkjent intervju | Krever personvern-/eierbeslutning før utsending |

## 3. D1 — oppdrettsslamledger

### Spørsmål

For hvert år 2020–2025, eller siste tilgjengelige serie:

1. Finnes modellert slam-/partikkelutslipp, faktisk innsamlet mengde og faktisk behandlet mengde i samme system?
2. Hvilke produksjonstyper og anlegg inngår: åpne merder, semi-lukkede anlegg, smolt/postsmolt eller landbasert matfisk?
3. Oppgis våtvekt, tørrstoffandel, total N, total P og eventuelt C på samme basis?
4. Hva var sluttbehandlingen: biogass, gjødsel, kompost, forbrenning, eksport eller annen bruk?
5. Hvilken del er målt, hvilken del er modellert, og hvem kan bekrefte definisjonen?

### Minimumsskjema

| Felt | Krav |
|---|---|
| anlegg/region | eksakt anlegg hvis delbart; ellers aggregert region |
| år | kalenderår eller tydelig driftsperiode |
| modellert | tonn + basis + metode |
| innsamlet | tonn + våtvekt/tørrstoff |
| behandlet | tonn + behandlingstype |
| N/P/C | masse og metode, hvis målt |
| sluttbruk | produkt, marked eller avhendingsform |
| verifikasjon | rapport, tillatelse, driftslogg eller aktørbekreftelse |

### Stoppregel

Et pilot- eller tillatelsestall kan ikke fylle nasjonal ledger. Statsforvalterens Hustadvika-tillatelse på 4 000 tonn fiskeslam per år er et eksempel på tillatt mottak/input for ett anlegg, ikke nasjonal faktisk behandling. [Kilde: `https://www.statsforvalteren.no/more-og-romsdal/miljo-og-klima/kunngjeringar/endring-av-loyve-etter-forurensningsloven-for-biogassanlegg-i-hustadvika/`, avsnitt om årlig mottak; `INNSIKT-SPOR/ANALYSE-materialstrommer.md`, §10.]

## 4. D2 — N/P/K-retur

### Spørsmål

1. Hvilke norske anlegg rapporterer ferdig biorest-/digestatvolum per år?
2. Finnes laboratorieanalyser for total N, plantetilgjengelig N, P, K, NH4-N, tørrstoff og tungmetaller?
3. Hvor mye ble levert eller spredt, på hvilket areal og med hvilken gjødslingsplan?
4. Kan fiskeslam, husdyrgjødsel, matavfall og avløpsslam skilles som substrat?
5. Har gjødseljournal-/sporbarhetskravene fra 2025/2026 generert et uttrekk som kan aggregeres uten å eksponere bedriftshemmeligheter?

### Minimumsskjema

| Felt | Krav |
|---|---|
| substrat | eksplisitt fraksjon og blanding |
| volum | tonn, basis og år |
| produktkvalitet | TS, total N/P/K, NH4-N og analysemetode |
| faktisk retur | levert/spredt tonn og areal |
| status | målt, estimert, modellert eller ikke tilgjengelig |
| kildeklasse | A/B/C med lokator |

### Stoppregel

Svensk SPCR 120 kan være referansemodell, men ikke norsk proxy. EØS-statistikksporet er framtidig/under vurdering og kan ikke brukes som om en norsk, publisert serie allerede finnes. [Kilde: `research/external/r13/R13-WASTE-005-digestat-npk-retur.md`, §§ «NPK-matrise» og «Tomme celler»; `https://www.regjeringen.no/no/sub/eos-notatbasen/notatene/2024/nov/gjennomforingsforordning-om-regler-for-statistikk-over-naringsstoffer/id3073103/`, §§ «Status» og «Sammendrag av innhold».]

## 5. D3 — offentlig matinnkjøp og lokal kanal

### Spørsmål

1. Hva er nevneren: matvarer, måltidstjenester, kjøkken, institusjon eller alle offentlige kjøp?
2. Kan innkjøpsverdi og/eller kg hentes per år 2020–2025?
3. Kan økologisk status dokumenteres via Debio/leverandørstatistikk?
4. Hvordan defineres «lokal»: kommune, fylke, Norge, geografisk radius eller leverandørens produksjonssted?
5. Kan matsvinn, menytype og faktisk servert mat skilles fra kontraktskrav?

### Stoppregel

«Lokalprodusert» kan ikke kreves direkte i offentlig anskaffelse; oppdeling i delkontrakter kan legge til rette for lokale leverandører. Dette er en juridisk/mekanisk avgrensning, ikke en målt lokalandel. [Kilde: `https://www.anskaffelser.no/hva-skal-du-kjope/mat-og-maltidstjenester`, avsnitt «Hvordan legge til rette for lokalprodusert mat».]

## 6. D4 — faktisk aktørvolum

### Spørsmål til hver aktør

1. Hva ble faktisk produsert, solgt og levert i kalenderårene 2024 og 2025?
2. Hvilken del var mat, kjæledyrfôr, husdyrfôr eller akvakulturfôr?
3. Hva er batchvolum, årsvolum, designkapasitet og faktisk utnyttelsesgrad hver for seg?
4. Hvilken fabrikk/lokasjon produserte volumet, og hvor ble produktet levert?
5. Hvilken del erstattet en navngitt konvensjonell ingrediens, og finnes det kontrakt-/formuleringsbevis?

### Stoppregel

Enifer-batchen på 4 tonn fra mars 2026 er et faktisk produksjonsbatch for kjæledyrfôrutvikling, men ikke et realisert nordisk årsvolum for husdyr- eller fiskefôr. [Kilde: `https://enifer.com/first-commercial-batch-of-pekilopet-ready-for-product-development`, publisert 30.03.2026; `INNSIKT-SPOR/ANALYSE-alternativt_protein.md`, §2.]

## 7. D5 — beredskapsnoder

### Spørsmål

1. Hvilken varekategori og geografisk systemgrense gjelder?
2. Hva er nominell kapasitet, disponibel kapasitet og faktisk beholdning?
3. Hvor lang er aktiveringstiden ved strøm-, vei-, havne- eller leverandørbrudd?
4. Finnes redundans for lager, kjøl/frys, drivstoff, strøm og omkobling?
5. Hvilke felter er sikkerhetsgradert, og kan et aggregert intervall eller kapasitetsklasse deles?

### Stoppregel

Kontrakter for 82 500 tonn matkorn innen 2029 dokumenterer avtaledekning, men ikke automatisk fysisk beholdning eller kapasitet for hele beredskapsnoden. [Kilde: `https://www.landbruksdirektoratet.no/nb/nyhetsrom/nyhetsarkiv/82-500-tonn-matkorn-pa-lager-innen-2029--i-mal-med-kontrakter`, §§ «Tidligere inngåtte kontrakter» og «Hvordan etableres beredskapslager»; `research/whitepaper/food-systems-2026-synthesis-v2.md`, §11, matkornrad.]

## 8. H1 — Mission 1

### Prioriterte roller

Leverandør til dagligvare, primærprodusent, uavhengig grossist/alternativ distribusjon, kommunal innkjøper og gründer i sirkulær/alternativt protein. Reserve: redistribusjon og forsker med dagligvarekompetanse.

### Før ekstern kontakt

- juridisk behandlingsansvarlig, organisasjonsnummer og kontaktpunkt;
- formål, datatyper, lagring/sletting og eventuell overføring;
- samtykke- og sitatgodkjenning kontrollert av personvernressurs;
- personlige kandidater og bookingtekst fylt inn;
- eiergodkjenning av ekstern utsending;
- testet opptak/transkripsjon og sitatgodkjenningsmal.

### Stopplinje

Ingen arrangements-transkript eller sekundærkilde får `own_interview`. Kun samtykket og sitatgodkjent materiale kan brukes som prosjektets egne intervjuer. [Kilde: `research/_plans/gap-program-2026-07-21/prosess/mission-1-intervjupakke.md`, §§ «Stopplinje», «Samtykke- og bruksrettsskjema» og «Intervju → sitat → base».]

## 9. Svarutfall som skal registreres

| Svar | Betydning | Neste steg |
|---|---|---|
| `data_received` | Data levert med lokator og bruksrett | PCQ/appraisal og eventuell claim-gate |
| `aggregate_only` | Kun aggregat kan deles | Behold systemgrense og ikke inferer anleggsnivå |
| `confidential_aggregate_possible` | Detaljer skjermet, aggregat mulig | Avklar intervall, metode og kontrollspor |
| `not_available` | Mottaker har ikke data | Dater tilgangsutfall; ikke automatisk Type C |
| `no_response` | Ingen respons | Følg opp etter avtalt intervall; ikke evidens |
| `declined` | Forespørsel avslått | Logg grunn/hjemmel; ikke les som nasjonalt fravær |

## 10. Siste beslutning før utsending

Alle seks pakker er nå konkrete nok til å sendes gjennom eier-, juridisk-, personvern- og mottakerreview. De er ikke sendt i denne runden. Det er en autoritets- og human-gate, ikke en desk-research-feil.
