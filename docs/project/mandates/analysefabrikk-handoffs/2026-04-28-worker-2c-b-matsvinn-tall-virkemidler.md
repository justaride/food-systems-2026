# Worker handoff - 2C B-matsvinn tall og virkemidler

## 1. Scope

- Tildelt batch: Worker 2C - B-matsvinn tall og virkemidler for Food TG analysefabrikk.
- Lest mandat/brief: `analysefabrikk-food-tg-arbeidsprosess-2026-04-28.md`, `analysefabrikk-runde-2-prompts-2026-04-28.md`, `track-brief-b-sidestreams-nutrients.md`, `evidence-matrix-food-tg.md`, `claim-register-food-tg.md`.
- Lest startkilder: `research/evidence-pack/offentlig/matsvinnutvalget-2024.pdf`, `research/bibliotek/sirkularitet/nordisk-matsvinn-rapport-2024.md`, `research/bibliotek/sirkularitet/matsvinn-tidsserier-norden.md`, `research/norden/verdikjede/06-matsvinn-sirkulaer.md`, `research/perplexity-20-04-26/kpi-sirkularitet-offentlig-privat.md`, `research/perplexity-20-04-26/matstroemmer-norden-kvantitativ.md`.
- Perplexity-notatene er bare brukt til kildejakt, ikke som evidens.
- Canonical docs er ikke redigert.

## 2. Kort konklusjon

Matsvinnutvalgets rapport er sterkeste lokale primærkilde for definisjoner, sektortall, virkemidler og datakrav. Den gir citation-ready støtte for at Norge ikke var på sporet mot 2030: 9 prosent reduksjon i 2021, og anslått 25 prosent reduksjon i 2030 dersom trenden fortsatte.

Kildebildet må håndtere tre skiller stramt: norsk matsvinn-definisjon vs EU matavfall, blandede måleår per sektor, og modellert virkemiddelpotensial vs observert effekt. Oppdatert NORSUS-faktaark for 2024 peker på 407 100 tonn og 73,4 kg per innbygger, men filen finnes ikke lokalt i evidence-pack og bør lastes ned/valideres før master-merge.

For claims styrker funnene særlig CL-B-002, CL-B-022 og CL-C-012. CL-B-008 får policy- og kaskadestøtte, men ikke selvstendig LCA-bevis. CL-C-015 kan oppgraderes fra Perplexity-basert KPI-behov til primærstøttet datakrav, men nøyaktig KPI-katalog må fortsatt valideres med Matvett/NORSUS/SSB.

## 3. Source cards / triage rows

### SRC-B-014 - Matsvinnutvalget 2024

| Felt | Vurdering |
|---|---|
| Fil | `research/evidence-pack/offentlig/matsvinnutvalget-2024.pdf` |
| Kildetype | Offentlig utvalgsrapport / primær policykilde |
| Arkivlag | L1 |
| Spor | B og C |
| Relevans | 5 |
| Evidensscore | 5 |
| Siterbarhet | Høy |
| Status | Citation-ready med sidereferanser |

Nøkkelfunn:

- Mandat: foreslå tiltak og virkemidler for å nå 50 prosent reduksjon innen 2030; vurdere eksisterende virkemidler, ny regulering og EU/EØS-relevans (s. 14).
- Bransjeavtalen definerer matsvinn som alle nyttbare deler av mat produsert for mennesker, som enten kastes eller tas ut av matkjeden til andre formål enn menneskemat, fra høsting/slakting (s. 19).
- I 2020 endte 453 650 tonn spiselig mat som avfall i Norge, om lag 10 prosent lavere enn i 2015; fem av åtte sektorer nådde delmålet om 15 prosent reduksjon (s. 27).
- I 2021 var reduksjonen 9 prosent; med samme utvikling ville Norge nå om lag 25 prosent reduksjon i 2030, altså halvparten av målet (s. 28-29).
- Kartlagt matsvinn var om lag 450 000 tonn i 2021. Utvalgets tiltakspakke ble modellert til 340 000 tonn potensial, tilsvarende 75 prosent av kartlagt matsvinn, men med usikkerhet og risiko for dobbelttelling (s. 48).
- Utvalget anbefaler blant annet aktsomhetskrav, styrket bransjeavtale, standardisert rapportering, SSB-rolle, donasjon, nedprising, kompetanse, offentlige anskaffelser, kampanjer og nudging (s. 11-12, 48-58, 61-80, 103-106).

### SRC-B-002 - Nordic Council 2024 / nordisk matsvinnrapport

| Felt | Vurdering |
|---|---|
| Lokal fil | `research/bibliotek/sirkularitet/nordisk-matsvinn-rapport-2024.md` |
| Ekstern primærfil | `https://pub.norden.org/nord2024-034/nord2024-034.pdf` |
| Kildetype | Nordisk rapport / policy- og komparativ sekundærkilde |
| Arkivlag | L2 inntil PDF siderefereres |
| Status | Brukbar som kildekandidat; krever PDF-sidereferanser før ekstern citation |

Nøkkelfunn fra lokal oppsummering:

- Norden reduserte om lag 10 prosent i perioden 2015-2020 mot et 15-prosentmål.
- Husholdninger omtales som største og vanskeligste ledd.
- Rapporten peker på behov for kombinerte atferds-, tekniske, regulatoriske og verdikjedetiltak samt harmonisert måling/rapportering.

### SRC-B-003 - Matsvinn tidsserier Norden

| Felt | Vurdering |
|---|---|
| Fil | `research/bibliotek/sirkularitet/matsvinn-tidsserier-norden.md` |
| Kildetype | Intern/kompilert sekundærsammenstilling |
| Arkivlag | L4 |
| Status | Kildejakt, ikke citation-ready |

Bruk:

- Nyttig for å identifisere Matvett/NORSUS/SSB/Eurostat som valideringskilder.
- Tallene, særlig 2024-sektortabeller, må ikke brukes uten primærkontroll.

### SRC-B-001 - Intern syntese matsvinn/sirkularitet

| Felt | Vurdering |
|---|---|
| Fil | `research/norden/verdikjede/06-matsvinn-sirkulaer.md` |
| Kildetype | Intern syntese |
| Arkivlag | L4 |
| Status | Kildejakt og hypoteser, ikke citation-ready |

Bruk:

- Kan peke på struktur, claim-kandidater og kilder.
- Flere brede nordiske og juridiske påstander må primærvalideres før de flyttes til claim-register/evidence-matrix.

### SRC-VALID-OR2725 - NORSUS faktaark 2024

| Felt | Vurdering |
|---|---|
| Ekstern side | `https://norsus.no/publikasjon/faktaark-om-matsvinn-i-norge-2024/` |
| Ekstern PDF | `https://norsus.no/wp-content/uploads/7.-OR.27.25-Faktark-om-matsvinn-i-Norge-2024-1.pdf` |
| Kildetype | NORSUS/Matvett-faktaark |
| Arkivlag | L1/L2 når lastet ned og sidereferert |
| Status | Valideringskilde; ikke funnet lokalt i evidence-pack |

Foreløpig web-kontroll:

- NORSUS oppgir for 2024 et samlet matsvinn på 407 100 tonn, tilsvarende 73,4 kg per innbygger.
- NORSUS oppgir 24 prosent reduksjon per innbygger siden 2015, og at det gjenstår 26 prosentpoeng til 2030-målet.
- Må lastes ned/arkiveres lokalt og sjekkes mot definisjon, sektoromfang og metode før citation i master.

### SRC-VALID-SSB-2025-37 - Matavfall og matsvinnstatistikk

| Felt | Vurdering |
|---|---|
| Ekstern side | `https://www.ssb.no/natur-og-miljo/avfall/artikler/matavfall-og-matsvinnstatistikk` |
| Kildetype | SSB-notat/artikkel |
| Status | Valideringskilde; må leses/lastes ned før citation |

Foreløpig bruk:

- SSB oppgir at de har utviklet ny metodikk for beregning av matavfall i Norge med lavere kostnader og bedre kvalitet.
- Relevant for overgangen fra Matvett/NORSUS-bransjedata til offisiell statistikk, Eurostat-rapportering og definisjonsskille mellom matavfall og matsvinn.

## 4. Citation-ready tall

| Funn | År/omfang | Tall | Kilde/status |
|---|---:|---:|---|
| Nasjonalt mål i bransjeavtalen | 2015-2030 | 50 prosent reduksjon; delmål 15 prosent i 2020 og 30 prosent i 2025 | Matsvinnutvalget s. 25 |
| Spiselig mat som endte som avfall | 2020, Norge | 453 650 tonn; ca. 10 prosent lavere enn 2015 | Matsvinnutvalget s. 27 |
| Status mot mål | 2021, Norge | 9 prosent reduksjon; ca. 6 prosentpoeng bak 2020-målet | Matsvinnutvalget s. 28 |
| Trend mot 2030 | Basert på utvikling til 2021 | 25 prosent reduksjon i 2030 dersom trenden fortsatte | Matsvinnutvalget s. 29 |
| Kartlagt matsvinn | 2021, Norge | Om lag 450 000 tonn | Matsvinnutvalget s. 48 |
| Modellert tiltakspotensial | Utvalgets tiltakspakke | 340 000 tonn, tilsvarende 75 prosent av kartlagt matsvinn | Matsvinnutvalget s. 48; usikkert/modellert |
| Jordbruk | 2022 | 93 190 tonn | Matsvinnutvalget s. 36 |
| Sjømatindustri | 2021 | 12 900 tonn; 2,4 kg/innbygger; ca. 3 prosent av totalen | Matsvinnutvalget s. 38 |
| Matindustri | 2021 | 84 100 tonn; 15,6 kg/innbygger; ca. 19 prosent av totalen | Matsvinnutvalget s. 39 |
| Dagligvare/grossist/KBS | 2021 | 73 500 tonn; 13,6 kg/innbygger; ca. 16 prosent av totalen | Matsvinnutvalget s. 40 |
| Servering | 2021 | 15 500 tonn; 2,87 kg/innbygger; ca. 3 prosent av totalen | Matsvinnutvalget s. 41 |
| Offentlig undervisning/omsorg | 2020 | 5 000 tonn; 0,9 kg/innbygger; ca. 1 prosent av totalen | Matsvinnutvalget s. 42 |
| Husholdninger | 2020 | 216 100 tonn; 40,3 kg/innbygger; ca. 48 prosent av totalen | Matsvinnutvalget s. 44 |
| Donert mat via Matsentralen | 2022 | 5 500 tonn; økning på 300 prosent siden 2017 | Matsvinnutvalget s. 26 og 61 |
| Antall matsentraler | 2017-2022 | Fra 1 til 8 | Matsvinnutvalget s. 26 |
| Oppdatert samlet matsvinn | 2024, Norge | 407 100 tonn; 73,4 kg/innbygger; 24 prosent reduksjon per innbygger siden 2015 | NORSUS OR.27.25, ekstern valideringskilde; må arkiveres lokalt |

Viktig merknad: Sektortallene i Matsvinnutvalget blander måleår. Ikke presenter dem som én konsistent 2021-sektorfordeling uten fotnote.

## 5. Modellert virkemiddelpotensial fra Matsvinnutvalget

| Tiltak | Potensial | Sikkerhet | Tidshorisont | Kilde |
|---|---:|---|---|---|
| Aktsomhetskrav | 68 406 tonn | Lav | Kort | Vedlegg, s. 125 |
| Matsvinnplan | 11 888 tonn | Lav | Middels | Vedlegg, s. 125 |
| Kompetansesenter | 22 693 tonn | Lav | Middels | Vedlegg, s. 125 |
| Standardisert rapportering | 12 215 tonn | Lav | Kort | Vedlegg, s. 125 |
| Datastandard | 16 292 tonn | Middels | Middels | Vedlegg, s. 125 |
| Datadelingssystem | 16 292 tonn | Lav | Middels | Vedlegg, s. 125 |
| Krav om donasjon fra sjømat-/matindustri og grossist | 20 630 tonn | Middels | Kort | Vedlegg, s. 125 |
| Donasjonskanaler fra butikk/servering | 9 727 tonn | Middels | Middels | Vedlegg, s. 125 |
| Offentlige anskaffelser og donasjon | 391 tonn | Lav | Middels | Vedlegg, s. 125 |
| Revidere frysing etter siste forbruksdag | 6 704 tonn | Middels | Lang | Vedlegg, s. 125 |
| Revidere donasjon av uemballert brød | 4 998 tonn | Middels | Kort | Vedlegg, s. 125 |
| Holdbarhetspraksis | 24 207 tonn | Middels | Middels | Vedlegg, s. 125 |
| STAND holdbarhetsfordeling | 4 850 tonn | Lav | Middels | Vedlegg, s. 125 |
| Holdbarhetsmerking | 11 215 tonn | Middels | Middels | Vedlegg, s. 125 |
| Krav om nedprising | 14 432 tonn | Høy | Kort | Vedlegg, s. 125 |
| Fjerne mva på bortgitt mat | 676 tonn | Lav | Kort | Vedlegg, s. 125 |
| Kanaler for lavere kvalitetsklasser av frukt/grønt | 9 350 tonn | Lav | Middels | Vedlegg, s. 125 |
| Offentlige anskaffelser og lavere kvalitetsklasser | 568 tonn | Lav | Middels | Vedlegg, s. 125 |
| Ansattopplæring | 9 550 tonn | Høy | Middels | Vedlegg, s. 125 |
| Mattrygghetsveileder | 4 755 tonn | Lav | Middels | Vedlegg, s. 125 |
| Kundeveileder for bestilling av mat | 227 tonn | Middels | Middels | Vedlegg, s. 125 |
| Undervisning | 25 932 tonn | Lav | Lang | Vedlegg, s. 125 |
| Informasjonskampanjer | 21 610 tonn | Høy | Middels | Vedlegg, s. 125 |
| Nudging og praktiske verktøy | 21 610 tonn | Middels | Middels | Vedlegg, s. 125 |

Bruk disse tallene som virkemiddelpotensial, ikke observert effekt. Utvalget advarer selv om usikkerhet og dobbelttelling i samlet potensial (s. 48).

## 6. Definisjoner

### Matsvinn

Gjeldende definisjon i bransjeavtalen: alle nyttbare deler av mat produsert for mennesker, som enten kastes eller tas ut av matkjeden til andre formål enn menneskemat, fra tidspunktet dyr og planter er slaktet eller høstet (s. 19). Utvalget bruker denne definisjonen fordi ny nasjonal definisjon ikke var besluttet ved rapporttidspunktet.

Praktiske konsekvenser:

- Pre-harvest/pre-slaughter tap er utenfor definisjonen; uhøstede grønnsaker og levende dyr som ikke slaktes er dermed ikke med (s. 20).
- Mat som går til dyrefôr er innenfor gjeldende norske matsvinn-definisjon, men ikke EU-definisjonen av matavfall når den ikke blir avfall (s. 20).

### Matavfall

EU-definisjonen dekker mat som har blitt avfall. Den omfatter både nyttbare og ikke-nyttbare deler når disse blir avfall, og er knyttet til EUs generelle definisjon av mat og avfall (s. 103).

Miljødirektoratets arbeidsgruppe anbefalte å harmonisere norsk matavfallsdefinisjon med EU, og samtidig bruke matsvinn om den nyttbare delen av matavfallet. Utvalget støtter dette prinsippet og foreslår at SSB får ansvar for matavfallsstatistikk og separat matsvinnstatistikk (s. 20, 58, 103-105).

### Spiselig/ikke-spiselig

Rapporten bruker særlig skillet mellom nyttbare og ikke-nyttbare deler. Citation-sikker formulering er derfor:

- `matsvinn`: nyttbare/spiselige deler som forlater menneskematkjeden etter høsting/slakting.
- `matavfall`: mat som er blitt avfall, inkludert ikke-nyttbare deler under EU-systemet.

Sjømatdelen krever særlig varsomhet: sjømatindustrien har også restråstoffstrømmer, og rapporten presiserer at matsvinn defineres som spiselige deler og ikke alt restråstoff (s. 22, 38).

### Ledd i verdikjeden

Matsvinnutvalgets sektorinndeling:

- Jordbruk: fra høsting/slakting til industri/videresalg; grøntsektor inkluderer jordbruk, pakkeri og avvisning fra industri; egg i eggpakkeri; korn på kornmottak; kjøtt i slakteri; melk på gård/tankbil (s. 36).
- Sjømatindustri: bearbeiding/konservering av fisk, skalldyr og bløtdyr samt akvakultur (s. 38).
- Matindustri: næringsmiddel- og drikkevareindustri uten sjømat (s. 39).
- Dagligvare, grossist og KBS: dagligvarehandel, grossist og kiosk/bensin/servicehandel (s. 40).
- Servering: hotell, restaurant, kantine og servering; flere segmenter er bare delvis kartlagt (s. 41).
- Offentlig sektor: undervisning og omsorg, med usikkerhet og manglende kartlegging for flere offentlige segmenter (s. 42).
- Husholdninger: matsvinn via kommunalt avfallssystem; avløp, hjemmekompostering og kjæledyrfôr er ikke kartlagt (s. 44).

## 7. Virkemidler og datakrav fra Matsvinnutvalget

### Virkemidler

Regulatoriske og avtalebaserte hovedgrep:

- Aktsomhetskrav for virksomheter: identifisere hvor matsvinn oppstår i egen virksomhet og verdikjede, lage plan med risiko/tiltak, følge opp, rapportere/synliggjøre resultater og gjenta prosessen (s. 48-53).
- Styrket og videreført bransjeavtale, med tydeligere beste praksis, sektorspesifikke standarder, koordinering, sekretariat og kompetansesenter (s. 54-56).
- Standardisert rapportering av matsvinn, ressursutnyttelse, årsaker og gjennomførte tiltak gjennom verdikjeden, inkludert forbrukere (s. 57).
- SSB bør inkludere matsvinn i datainnsamling/statistikk og samordne med matavfallsrapportering for å unngå parallell rapportering (s. 58, 103-105).
- Donasjon: krav/vurdering for sjømatindustri, matindustri og grossist der mattrygghet, transport og mottakskapasitet gjør det hensiktsmessig; utvikle kanaler fra butikk/servering; bruke offentlige anskaffelser (s. 61-62).
- Nedprising: krav om systematisk nedprising i dagligvare for store produktgrupper der det er hensiktsmessig; mulig utvidelse til KBS; veileder for trygg nedprising og ansvar etter `best før` (s. 69-70).
- Kompetanse: bransjespesifikk opplæring i hele verdikjeden, mattrygghetsveiledning og `matvert`-rolle i offentlige institusjoner (s. 73-75).
- Forbrukerrettede tiltak: undervisningsressurser, kampanjer minst to ganger årlig, og nudging/praktiske verktøy for planlegging, innkjøp, lagring, tilberedning, spising og håndtering (s. 78-80).
- Offentlige anskaffelser: klima- og miljøkrav kan brukes til matsvinnplan, systemer, statistikk og oppfølging; DFØs veileder for kantinetjenester peker på matsvinn som tildelingskriterium (s. 105-106).

### Datakrav

Minimum datakrav for Food TG/analysis:

- Rapporter alltid definisjon: norsk matsvinn, EU matavfall eller `nyttbar del av matavfall`.
- Rapporter alltid år, geografi, sektorledd, enhet, kilde og metode.
- Skille mellom målt mengde, modellert potensial og observert effekt.
- Skille matsvinn fra ressursutnyttelse til dyrefôr, biogass, kompostering, forbrenning og avløp.
- Bruke SSB/Eurostat-kompatibel NACE-mapping når claimet gjelder offisiell statistikk, men notere at dette kan avvike fra bransjeavtalens sektorstruktur (s. 104).
- For pilot/KPI: registrer produktgruppe, mengde, kvalitet/årsak, holdbarhetsstatus, kanal før/etter tiltak, behandling/destinasjon, kostnad og klimagassindikator der tilgjengelig.

SSB-sporet:

- Utvalget peker på at Miljødirektoratet historisk har hatt rapporteringsansvaret til EU, med datagrunnlag fra bransjeavtalens aktører, avfallsregelverk, Landbruksdirektoratet og forskningsprosjekter (s. 103-104).
- Utvalget foreslår at SSB får formell rolle. SSB kan innhente opplysninger under statistikkloven, men utvalget anslår 2-3 år før systemer/rutiner er etablert (s. 104).

## 8. Claim-effekt

| Claim | Effekt | Begrunnelse |
|---|---|---|
| CL-B-001 | Styrker + nyanserer | Matsvinnutvalget dokumenterer store sektorvise forskjeller i mengde, årsaker og tiltak (s. 36-44, 48-80). Claimet bør presisere at sektortallene har ulike måleår og at nordiske sammenlikninger trenger primærkontroll. |
| CL-B-002 | Styrker | Husholdninger er største kartlagte ledd med 216 100 tonn, 40,3 kg/innbygger og ca. 48 prosent av totalen i 2020 (s. 44). Reduksjonen var bare ca. 6 prosent per innbygger siden 2016, og barrierene er konkret beskrevet (s. 44-45). |
| CL-B-008 | Nyanserer/styrker kaskadelogikk, men ikke LCA alene | Rapporten støtter prioritering av mat til mennesker gjennom donasjon, nedprising og bedre holdbarhetspraksis før lavere utnyttelse (s. 26, 61-70). Den dokumenterer ikke alene miljøoverlegenhet for redistribusjon/fôr vs biogass; LCA-delen bør fortsatt hvile på Albizzati/EV-B-005 eller tilsvarende. |
| CL-B-022 | Styrker + operasjonaliserer | Dagligvare/grossist/KBS har 73 500 tonn matsvinn i 2021, med brød/bakervarer og frukt/grønt som store grupper og dato/kvalitet/prognoser som viktige årsaker (s. 40). Servering har 15 500 tonn, særlig buffet/servering/tallerken (s. 41). Tiltakene nedprising, donasjon, ansattopplæring, offentlige anskaffelser og KPI-rapportering passer direkte til pilotlogikk (s. 61-75, 105-106). |
| CL-C-012 | Styrker | Matsvinnutvalget anbefaler en kombinasjon av regulering, bransjeavtale, rapportering, SSB-statistikk, kompetanse, anskaffelser og forbrukertiltak (s. 11-12, 48-58, 103-106). Dette støtter governance-claimet om at virkemiddelpakken må være flernivå og ikke ett enkelt tiltak. |
| CL-C-015 | Styrker datakrav; fortsatt validering | Rapporten gir primærstøtte for standardisert rapportering, SSB-rolle, kompetansesenter, analyser og benchmarking/KPI-er (s. 56-58, 103-105). Selve KPI-katalogen, datatilgang fra aktører og kobling mot Eurostat/SSB må fortsatt valideres. |

## 9. Hva må valideres med Matvett/NORSUS/SSB

### Matvett/NORSUS

- Last ned og arkiver OR.27.25 `Faktaark om matsvinn i Norge 2024`; bekreft totalen 407 100 tonn, 73,4 kg/innbygger, 24 prosent reduksjon per innbygger siden 2015 og resterende 26 prosentpoeng til 2030.
- Bekreft sektorfordeling i 2024 og om jordbruk, husholdning, offentlig sektor og avløp/hjemmekompost/kjæledyr er inkludert eller ekskludert.
- Bekreft metodeendringer fra 2020/2021/2022-tallene i Matsvinnutvalget til 2024-faktaarket.
- Skaff primærfiler som statusnotat/backlog hevder skal finnes: Bransjeavtalen hovedrapport 2020, OR.36.21, OR.02.23, OR.28.24 og eventuelle Matvett `Tall og fakta`-sider.
- Avklar om Matvett/NORSUS har produktgruppe- og kvalitetsdata som kan støtte Food TG-pilot: dato/holdbarhet, årsakskoder, produktgruppe, temperaturkjede, nedprising, donasjon, Too Good To Go/redistribusjon, mengde og verdi.

### SSB

- Les/arkiver SSB-notatet `Matavfall og matsvinnstatistikk` / Notater 2025/37.
- Avklar om SSB nå publiserer offisiell matsvinnstatistikk, matavfallsstatistikk eller begge deler, og hvilke tabeller/API-er som er relevante.
- Avklar definisjon: EU matavfall, norsk matsvinn, nyttbar del av matavfall, dyrefôr, avløp, hjemmekompost, kjæledyrfôr og primærproduksjon.
- Avklar NACE-mapping for verdikjedeledd og hvordan den avviker fra Matvett/Bransjeavtalen.
- Avklar om SSB-data kan koble mengde til behandling: dyrefôr, biogass, kompostering, forbrenning, deponi eller annen ressursutnyttelse.
- Avklar Eurostat-kompatibilitet, basisår 2020 for EU-mål og om norske matsvinn-tall kan sammenliknes direkte med EU matavfallstall.

### Aktører/pilot

- For CL-B-022 må pilotaktører bekrefte at de kan levere baseline og effektdata per produktgruppe, kanal, tid til utløpsdato, kvalitet/årsaker og destinasjon.
- For donasjon/redistribusjon må mottakskapasitet, transportavstand, mattrygghet, ansvar og faktisk absorbert mengde dokumenteres.
- For offentlige anskaffelser må det avklares hvilke krav som kan stilles til matsvinnplan, måling, rapportering og oppfølgingsmøter uten å skape uforholdsmessig byrde.

## 10. Nye kandidater til masterkø

- NORSUS OR.27.25 `Faktaark om matsvinn i Norge 2024`: `https://norsus.no/wp-content/uploads/7.-OR.27.25-Faktark-om-matsvinn-i-Norge-2024-1.pdf`
- SSB `Matavfall og matsvinnstatistikk`: `https://www.ssb.no/natur-og-miljo/avfall/artikler/matavfall-og-matsvinnstatistikk`
- Nordic Council of Ministers 2024 PDF: `https://pub.norden.org/nord2024-034/nord2024-034.pdf`
- Matvett/NORSUS hovedrapport for Bransjeavtalen 2020 og senere faktaark/rapporter.
- Landbruksdirektoratet 2023 om primærledd/jordbruk.
- SINTEF/NORSUS sjømatrapport om matsvinn og restråstoff, hvis claimet skal dekke sjømat særskilt.
- Eurostat food waste tables, hvis analysen trenger nordisk/EU-komparativ statistikk.

## 11. Røde flagg

- Lokale status-/backlogfiler hevder at flere Matvett/NORSUS-PDF-er er lastet ned, men de ble ikke funnet i `research/evidence-pack` ved kontroll. Ikke flytt disse inn i evidence-matrix før filene faktisk er arkivert og lest.
- Ikke bland 2020-, 2021- og 2022-sektortall fra Matsvinnutvalget som én ren sektorfordeling uten fotnote.
- Ikke bruk Perplexity-notatene som evidens.
- Ikke bruk interne synteser som citation for 2024-tall, juridisk status eller nordiske sammenlikninger uten primærkontroll.
- Matsvinnutvalgets rapport beskriver forslag og situasjonen ved rapporttidspunktet. Juridisk status i 2026 må verifiseres før formuleringer som `gjeldende matsvinnlov`, `pålagt krav` eller `SSB har ansvar`.
